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
          role: "customer"
        });
        if (insertError) {
          console.error("Error creating profile in signup route:", insertError);
        }
      }

      // Create or update loyalty card row in loyalty_cards table
      const { error: loyaltyError } = await supabaseAdmin.from("loyalty_cards").upsert({
        id: randomId,
        user_id: user.id,
        stamps: 0,
        points: 0
      }, { onConflict: "user_id" });

      if (loyaltyError) {
        console.error("Error creating loyalty card in signup route:", loyaltyError);
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

import { getSignupEmailHtml } from "@/lib/emails/signup-template";

async function sendCustomVerificationEmail(email: string, name: string, username: string, actionLink: string) {
  const htmlEmail = getSignupEmailHtml({
    name,
    username,
    email,
    actionLink,
    isPreview: false,
  });

  const attachments: Array<{ filename: string; path: string; cid: string }> = [
    {
      filename: "logo.png",
      path: path.join(process.cwd(), "public", "logo.png"),
      cid: "logo",
    },
  ];

  const heroPath = path.join(process.cwd(), "public", "hero.png");
  if (require("fs").existsSync(heroPath)) {
    attachments.push({
      filename: "hero.png",
      path: heroPath,
      cid: "hero",
    });
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Antonioni Grounds" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Confirm your email — Antonioni Grounds`,
    html: htmlEmail,
    text: `Thank you for signing up for Antonioni Grounds!\n\nPlease confirm your email by clicking the link below:\n${actionLink}\n\nIf you didn't create an account, you can safely ignore this email.`,
    attachments,
  });
}
