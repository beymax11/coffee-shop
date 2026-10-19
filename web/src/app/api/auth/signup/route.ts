import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { sendEmail } from "@/lib/resend";
import { getSignupEmailHtml } from "@/lib/emails/signup-template";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Email RFC 5322 simplified standard regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
// Username: 3-30 chars, alphanumeric with dots and underscores
const USERNAME_REGEX = /^[a-zA-Z0-9_.]+$/;

function validateSignupInput(body: unknown): {
  valid: boolean;
  error?: string;
  data?: {
    email: string;
    password: string;
    name: string;
    username: string;
  };
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request format." };
  }

  const { email, password, name, username } = body as Record<string, unknown>;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof name !== "string" ||
    typeof username !== "string"
  ) {
    return { valid: false, error: "All fields (name, username, email, password) are required." };
  }

  const trimmedName = name.trim();
  const trimmedUsername = username.trim().toLowerCase();
  const trimmedEmail = email.trim().toLowerCase();

  // 1. Name validation
  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return { valid: false, error: "Full name must be between 2 and 100 characters." };
  }

  // 2. Username validation
  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    return { valid: false, error: "Username must be between 3 and 30 characters long." };
  }
  if (!USERNAME_REGEX.test(trimmedUsername)) {
    return { valid: false, error: "Username can only contain alphanumeric characters, underscores, and dots." };
  }

  // 3. Email validation
  if (trimmedEmail.length > 254 || !EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: "Please enter a valid email address." };
  }

  // 4. Password validation: min 8, max 128, at least one letter and at least one number/symbol
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long." };
  }
  if (password.length > 128) {
    return { valid: false, error: "Password cannot exceed 128 characters." };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSymbol = /[^a-zA-Z]/.test(password);
  if (!hasLetter || !hasNumberOrSymbol) {
    return {
      valid: false,
      error: "Password must contain at least one letter and at least one number or special character.",
    };
  }

  return {
    valid: true,
    data: {
      email: trimmedEmail,
      password,
      name: trimmedName,
      username: trimmedUsername,
    },
  };
}

function generateSecureLoyaltyId(): string {
  const part1 = crypto.randomInt(100, 1000);
  const part2 = crypto.randomInt(100, 1000);
  return `AG-${part1}-${part2}`;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: Max 5 signups per 15 minutes per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`signup:${clientIp}`, {
      windowMs: 15 * 60 * 1000,
      max: 5,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again in a few minutes." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetSeconds),
          },
        }
      );
    }

    // 2. Parse & Validate Payload
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed request payload." }, { status: 400 });
    }

    const validation = validateSignupInput(rawBody);
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { email, password, name, username } = validation.data;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agshop.lat";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isProduction = process.env.NODE_ENV === "production";

    // 3. Environment & Configuration Check
    if (!supabaseUrl || !serviceKey) {
      if (isProduction) {
        console.error("CRITICAL: Supabase environment credentials missing in production environment.");
        return NextResponse.json(
          { error: "Authentication service is currently unavailable. Please contact support." },
          { status: 500 }
        );
      }

      // Development/Offline Mock Mode
      console.warn("WARN: Using Mock Auth fallback in Signup Route (development environment only).");
      const mockActionLink = `${baseUrl}/auth/verified`;
      if (process.env.RESEND_API_KEY || process.env.SMTP_USER) {
        await sendCustomVerificationEmail(email, name, username, mockActionLink);
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
      console.error("Error checking username uniqueness:", profileCheckError);
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
        role: "customer", // Enforce customer role on registration
      },
    });

    if (signUpError) {
      console.error("Supabase Admin signup error:", signUpError);
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
      return NextResponse.json({ error: "Failed to create user account." }, { status: 500 });
    }

    // 6. Create or synchronize profile in DB
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
        console.error("Error creating profile in signup route:", insertError);
      }
    }

    // 7. Initialize secure loyalty card (0 stamps, 0 points)
    const loyaltyId = generateSecureLoyaltyId();
    const { error: loyaltyError } = await supabaseAdmin.from("loyalty_cards").upsert(
      {
        id: loyaltyId,
        user_id: user.id,
        stamps: 0,
        points: 0,
      },
      { onConflict: "user_id" }
    );

    if (loyaltyError) {
      console.error("Error initializing loyalty card in signup route:", loyaltyError);
    }

    // 8. Generate secure confirmation link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
      },
    });

    if (linkError) {
      console.error("Error generating signup verification link:", linkError);
      return NextResponse.json(
        { error: "Unable to generate confirmation email. Please contact support." },
        { status: 500 }
      );
    }

    const actionLink = linkData.properties.action_link;

    // 9. Send verification email
    await sendCustomVerificationEmail(email, name, username, actionLink);

    return NextResponse.json({ success: true, emailConfirmRequired: true });
  } catch (err) {
    // Sanitize unexpected server error to prevent leaking server internal details
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
    subject: `Confirm your email — Antonioni Grounds`,
    html: htmlEmail,
    text: `Thank you for signing up for Antonioni Grounds!\n\nPlease confirm your email by clicking the link below:\n${actionLink}\n\nIf you didn't create an account, you can safely ignore this email.`,
  });
}
