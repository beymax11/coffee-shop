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
    const rawBody = await req.json();

    // 2. Validate input schema using Zod
    const validation = signupSchema.safeParse(rawBody);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid input data.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password, name, username } = validation.data;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agshop.lat";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceKey);

      // 3. Check if username is already taken
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.json(
          { error: "Username is already taken. Please choose another." },
          { status: 400 }
        );
      }

      // 4. Create user with admin client (unconfirmed)
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
        console.error("[Signup Error] Supabase admin.createUser:", signUpError.message);
        return NextResponse.json(
          { error: signUpError.message || "Could not register account. Please check your details." },
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

      // 5. Create or verify profile record in DB
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

      // 6. Generate collision-resistant unique loyalty card ID
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

      // 7. Generate email confirmation link
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

      const actionLink = linkData.properties.action_link;

      // 8. Send branded confirmation email
      try {
        await sendCustomVerificationEmail(email, name, username, actionLink);
      } catch (mailErr) {
        console.error("[Signup Error] Failed to send verification email:", mailErr);
      }

      return NextResponse.json({ success: true, emailConfirmRequired: true });
    } else {
      // Mock Fallback (Non-production only)
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Authentication service is not properly configured." },
          { status: 503 }
        );
      }

      console.warn("[Signup] Running mock fallback in development");
      const actionLink = `${baseUrl}/auth/verified`;
      if (process.env.RESEND_API_KEY || process.env.SMTP_USER) {
        await sendCustomVerificationEmail(email, name, username, actionLink);
      }

      return NextResponse.json({ success: true, emailConfirmRequired: true });
    }
  } catch (err) {
    console.error("[Signup Exception]:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating your account." },
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
