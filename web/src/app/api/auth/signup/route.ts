import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/resend";
import { enforceRateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validation";
import { generateUniqueLoyaltyCardId } from "@/lib/id-generator";
import { getSignupEmailHtml } from "@/lib/emails/signup-template";

export async function POST(req: NextRequest) {
  // 1. Enforce Rate Limiting (5 signups per 10 minutes per IP)
  const rateLimitResponse = enforceRateLimit(req, "auth-signup", 5, 600);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed request payload." }, { status: 400 });
    }

    // 2. Validate input schema using Zod
    const validation = signupSchema.safeParse(rawBody);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input data.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password, name, username } = validation.data;

    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const baseUrl = (configuredUrl && !configuredUrl.includes("localhost") ? configuredUrl : "https://agshop.lat").replace(/\/$/, "");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isProduction = process.env.NODE_ENV === "production";

    // 3. Environment & Configuration Check
    if (!supabaseUrl || !serviceKey) {
      if (isProduction) {
        console.error("CRITICAL: Supabase environment credentials missing in production environment.");
        return NextResponse.json(
          { error: "Authentication service is currently unavailable. Please contact support." },
          { status: 503 }
        );
      }

      // Development/Offline Mock Mode
      console.warn("WARN: Using Mock Auth fallback in Signup Route (development environment only).");
      const mockActionLink = `${baseUrl}/auth/verified`;
      if (process.env.RESEND_API_KEY || process.env.SMTP_USER) {
        try {
          await sendCustomVerificationEmail(email, name, username, mockActionLink);
        } catch (mailErr) {
          console.error("[Signup Error] Failed to send mock verification email:", mailErr);
        }
      }

      return NextResponse.json({ success: true, emailConfirmRequired: true });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 4. Check if username is already taken
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (profileCheckError) {
      console.error("[Signup Error] Error checking username uniqueness:", profileCheckError);
    }

    if (existingProfile) {
      return NextResponse.json(
        { error: "Username is already taken. Please choose another." },
        { status: 400 }
      );
    }

    // 5. Create user with admin client (unconfirmed until email verification)
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        name,
        username,
        role: "customer",
      },
    });

    if (signUpError) {
      console.error("[Signup Error] Supabase admin.createUser:", signUpError);
      const errMsg = signUpError.message?.toLowerCase() || "";
      if (errMsg.includes("already") || errMsg.includes("registered") || signUpError.status === 422) {
        return NextResponse.json(
          { error: "An account with this email address already exists." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to register account. Please check your details and try again." },
        { status: 400 }
      );
    }

    const user = authData.user;
    if (!user) {
      return NextResponse.json(
        { error: "Failed to initialize user credentials." },
        { status: 500 }
      );
    }

    // 6. Create or verify profile record in DB
    const { data: triggerProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!triggerProfile) {
      const { error: insertError } = await supabaseAdmin.from("profiles").insert({
        id: user.id,
        name,
        username,
        email,
        role: "customer",
      });
      if (insertError) {
        console.error("[Signup Error] Profile insert error:", insertError.message);
      }
    }

    // 7. Generate collision-resistant unique loyalty card ID
    const cardId = await generateUniqueLoyaltyCardId(supabaseAdmin);
    const { error: loyaltyError } = await supabaseAdmin.from("loyalty_cards").upsert(
      {
        id: cardId,
        user_id: user.id,
        stamps: 0,
        points: 0,
      },
      { onConflict: "user_id" }
    );

    if (loyaltyError) {
      console.error("[Signup Error] Loyalty card upsert:", loyaltyError.message);
    }

    // 8. Generate secure email confirmation link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
      },
    });

    if (linkError) {
      console.error("[Signup Error] generateLink failed:", linkError.message);
      return NextResponse.json(
        { error: "Account created, but failed to generate verification link." },
        { status: 500 }
      );
    }

    const hashedToken = linkData.properties.hashed_token;
    // Always route directly to official agshop.lat domain with token_hash
    const actionLink = hashedToken
      ? `${baseUrl}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=signup`
      : linkData.properties.action_link;

    // 9. Send branded confirmation email
    try {
      await sendCustomVerificationEmail(email, name, username, actionLink);
    } catch (mailErr) {
      console.error("[Signup Error] Failed to send verification email:", mailErr);
    }

    return NextResponse.json({ success: true, emailConfirmRequired: true, cardId });
  } catch (err) {
    console.error("POST /api/auth/signup unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again later." },
      { status: 500 }
    );
  }
}

async function sendCustomVerificationEmail(
  email: string,
  name: string,
  username: string,
  actionLink: string
) {
  const htmlEmail = getSignupEmailHtml({
    name,
    username,
    email,
    actionLink,
    isPreview: false,
  });

  await sendEmail({
    to: email,
    subject: "Confirm your email — Antonioni Grounds",
    html: htmlEmail,
    text: `Thank you for signing up for Antonioni Grounds!\n\nPlease confirm your email by clicking the link below:\n${actionLink}\n\nIf you didn't create an account, you can safely ignore this email.`,
  });
}
