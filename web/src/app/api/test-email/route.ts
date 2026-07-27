import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("to");
  if (!email) {
    return NextResponse.json(
      { error: "Please provide ?to=your_email@example.com in the URL parameters" },
      { status: 400 }
    );
  }

  console.log("[Test Email] Triggering test email to:", email);

  const res = await sendEmail({
    to: email,
    subject: "Resend Test Email — Antonioni Grounds",
    html: `
      <div style="font-family: sans-serif; padding: 24px; color: #1a1a1a; max-width: 600px; margin: 0 auto; border: 1px solid #eee; rounded: 12px;">
        <h1 style="color: #2E5A44;">It works! 🎉</h1>
        <p style="font-size: 16px; line-height: 1.6;">Resend integration is working successfully for <strong>Antonioni Grounds</strong>.</p>
        <p style="color: #666; font-size: 14px;">Sent at: ${new Date().toLocaleString()}</p>
      </div>
    `,
    text: `It works! Resend integration is working successfully for Antonioni Grounds. Sent at: ${new Date().toLocaleString()}`,
  });

  return NextResponse.json(res);
}
