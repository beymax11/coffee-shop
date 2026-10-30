import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/resend";
import { enforceRateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validation";
import { getResetPasswordEmailHtml } from "@/lib/emails/reset-template";

export async function POST(req: NextRequest) {
  // 1. Enforce Rate Limiting (5 requests per 10 minutes per IP)
  const rateLimitResponse = enforceRateLimit(req, "auth-forgot-password", 5, 600);
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
    const validation = forgotPasswordSchema.safeParse(rawBody);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid email address.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email } = validation.data;

    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const baseUrl = (configuredUrl && !configuredUrl.includes("localhost") ? configuredUrl : "https://agshop.lat").replace(/\/$/, "");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 3. Environment & Configuration Check (Dev/Offline fallback)
    if (!supabaseUrl || !serviceKey) {
      console.warn("WARN: Supabase credentials missing in Forgot Password Route. Operating in mock mode.");
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a reset link has been dispatched.",
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 4. Generate secure recovery link using Supabase Admin
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${baseUrl}/login/reset`,
      },
    });

    if (linkError) {
      console.warn("[Forgot Password] Supabase generateLink failed:", linkError.message);
      // For security and privacy, do not disclose whether user exists or not
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a reset link has been dispatched.",
      });
    }

    const user = linkData?.user;
    const hashedToken = linkData?.properties?.hashed_token;

    // Direct link to our own /login/reset page with token_hash.
    // This completely bypasses Supabase Dashboard's Redirect URL allowlist!
    const actionLink = hashedToken
      ? `${baseUrl}/login/reset?token_hash=${encodeURIComponent(hashedToken)}&type=recovery`
      : linkData?.properties?.action_link;

    if (!actionLink) {
      console.error("[Forgot Password] No action_link or hashed_token returned from generateLink.");
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a reset link has been dispatched.",
      });
    }

    // 5. Look up customer's display name from profiles table if available
    let displayName = "Member";
    if (user?.id) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("name, username")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.name) {
        displayName = profile.name;
      } else if (user.user_metadata?.name) {
        displayName = user.user_metadata.name;
      }
    }

    // 6. Send branded password recovery email via Resend
    const htmlEmail = getResetPasswordEmailHtml({
      name: displayName,
      email,
      actionLink,
      isPreview: false,
    });

    const emailResult = await sendEmail({
      to: email,
      subject: "Reset your password — Antonioni Grounds",
      html: htmlEmail,
      text: `Hello ${displayName},\n\nWe received a request to reset your password for Antonioni Grounds.\n\nClick the link below to set a new password:\n${actionLink}\n\nThis link is valid for 1 hour. If you didn't request a password reset, you can safely ignore this email.\n\n— Antonioni Grounds`,
    });

    if (!emailResult.success) {
      console.error("[Forgot Password] Failed to send email via Resend:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a reset link has been dispatched.",
    });
  } catch (err) {
    console.error("POST /api/auth/forgot-password unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
