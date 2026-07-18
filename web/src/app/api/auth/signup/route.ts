import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, username } = body;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://antonionigrounds.vercel.app";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const randomId = `AG-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;

    if (supabaseUrl && serviceKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceKey);

      // 1. Check if username is already taken
      const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("username", username.trim().toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.json({ error: "Username is already taken." }, { status: 400 });
      }

      // 2. Create user with admin client (unconfirmed)
      const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: false,
        user_metadata: {
          name: name.trim(),
          username: username.trim().toLowerCase(),
          role: "customer"
        }
      });

      if (signUpError) {
        console.error("Supabase Admin signup error:", signUpError);
        return NextResponse.json({ error: signUpError.message }, { status: 400 });
      }

      const user = authData.user;
      if (!user) {
        return NextResponse.json({ error: "Failed to create user account." }, { status: 500 });
      }

      // 3. Create profile in DB (check if already created by trigger)
      const { data: triggerProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!triggerProfile) {
        const { error: insertError } = await supabaseAdmin.from("profiles").insert({
          id: user.id,
          name: name.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim(),
          role: "customer",
          member_id: randomId,
          stamps: 0,
          points: 0
        });
        if (insertError) {
          console.error("Error creating profile in signup route:", insertError);
        }
      } else {
        await supabaseAdmin
          .from("profiles")
          .update({ member_id: randomId })
          .eq("id", user.id);
      }

      // 4. Generate confirmation link
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email: email.trim(),
        password,
        options: {
          redirectTo: `${baseUrl}/auth/callback`
        }
      });

      if (linkError) {
        console.error("Error generating signup link:", linkError);
        return NextResponse.json({ error: linkError.message }, { status: 500 });
      }

      const actionLink = linkData.properties.action_link;

      // 5. Send Custom HTML Email via SMTP
      await sendCustomVerificationEmail(email.trim(), name.trim(), username.trim(), actionLink);

      return NextResponse.json({ success: true, emailConfirmRequired: true });
    } else {
      // MOCK AUTHENTICATION FALLBACK
      console.warn("Using Fallback Mock Auth in Signup Route");
      const actionLink = `${baseUrl}/auth/verified`;

      // Send Mock HTML Email via SMTP if user credentials exist
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await sendCustomVerificationEmail(email.trim(), name.trim(), username.trim(), actionLink);
      }

      return NextResponse.json({ success: true, emailConfirmRequired: true });
    }
  } catch (err) {
    console.error("POST /api/auth/signup error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

async function sendCustomVerificationEmail(email: string, name: string, username: string, actionLink: string) {
  const htmlEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirm Your Account — Antonioni Grounds</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F2;padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid rgba(45,31,24,0.08);max-width:100%;box-shadow:0 4px 20px rgba(45,31,24,0.03);">
          
          <!-- Top Accent Band -->
          <tr><td style="height:6px;background-color:#2E5A44;"></td></tr>
          
          <!-- Logo & Header -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;border-bottom:1px solid #222222;background-color:#121212;">
              <img src="cid:logo" alt="Antonioni Grounds Logo" style="height:72px;width:auto;margin:0 auto 16px;display:block;" />
              <p style="margin:0;font-size:10px;letter-spacing:0.35em;color:#C5A880;font-weight:700;text-transform:uppercase;">Antonioni Grounds</p>
              <h1 style="margin:12px 0 0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;font-family:'Georgia',serif;">Verify Your Account</h1>
              <p style="margin:8px 0 0;font-size:13px;color:#A8A29E;line-height:1.6;max-width:400px;margin-left:auto;margin-right:auto;">
                Welcome to Antonioni Grounds. Please verify your email address to complete your registration and activate your reserve account.
              </p>
            </td>
          </tr>

          <!-- Account Details -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.2em;color:#2E5A44;font-weight:700;text-transform:uppercase;">Account Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F2;border:1px solid rgba(45,31,24,0.06);border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid rgba(45,31,24,0.06);">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Full Name</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;margin-top:2px;display:inline-block;">${name}</span>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid rgba(45,31,24,0.06);text-align:right;">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Username</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;margin-top:2px;display:inline-block;">@${username}</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:14px 16px;">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Email Address</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;margin-top:2px;display:inline-block;">${email}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding:24px 40px 0;color:#2D1F18;font-size:14px;line-height:1.7;">
              <p style="margin:0 0 16px;">Hello ${name},</p>
              <p style="margin:0 0 16px;">
                Thank you for creating an account with us. By confirming your email address, you'll gain access to your loyalty stamps panel, table reservation bookings, and mobile cart requests.
              </p>
              <p style="margin:0 0 8px;">
                Please click the button below to confirm your account:
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:28px 40px 24px;text-align:center;">
              <a href="${actionLink}" style="display:inline-block;background-color:#2E5A44;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;border:1px solid #234533;">
                Confirm Account →
              </a>
              <p style="margin:12px 0 0;font-size:11px;color:#7C6E65;">
                Or copy this link: <a href="${actionLink}" style="color:#2E5A44;text-decoration:underline;">${actionLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:30px 40px;text-align:center;border-top:1px solid rgba(45,31,24,0.08);background-color:#FAF7F2;">
              <p style="margin:0;font-size:11px;color:#7C6E65;line-height:1.7;">
                Questions? Contact us at <a href="mailto:${process.env.SMTP_USER}" style="color:#2E5A44;text-decoration:underline;">${process.env.SMTP_USER}</a><br/>
                <strong>Antonioni Grounds</strong> — Tiaong, Quezon Province<br/>
                <span style="color:#A88B62;font-size:10px;margin-top:6px;display:block;">© ${new Date().getFullYear()} Antonioni Grounds. All rights reserved.</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Antonioni Grounds" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Confirm Your Account — Antonioni Grounds`,
    html: htmlEmail,
    text: `Hi ${name},\n\nWelcome to Antonioni Grounds! Please verify your email address to complete registration.\n\nConfirm Account: ${actionLink}\n\nThank you,\nAntonioni Grounds`,
    attachments: [
      {
        filename: "logo.png",
        path: path.join(process.cwd(), "public", "logo.png"),
        cid: "logo",
      },
    ],
  });
}
