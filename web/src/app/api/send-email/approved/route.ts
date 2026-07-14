import { NextRequest, NextResponse } from "next/server";
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

function getDownpaymentAmount(eventType: string, guestCount: number): { amount: string; balance: string; totalLabel: string } {
  if (eventType === "Table Reservation") {
    return {
      amount: "₱1,000",
      balance: "₱2,500",
      totalLabel: "₱3,500 (fully consumable)",
    };
  }
  // Coffee Cart
  const paxPackages: Record<number, { total: number }> = {
    50: { total: 5500 },
    100: { total: 11000 },
    150: { total: 16500 },
    200: { total: 22000 },
  };
  const pkg = paxPackages[guestCount] || { total: 5500 };
  const dp = Math.round(pkg.total * 0.1);
  return {
    amount: `₱${dp.toLocaleString()}`,
    balance: `₱${(pkg.total - dp).toLocaleString()}`,
    totalLabel: `₱${pkg.total.toLocaleString()} total`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reservation } = body as {
      reservation: {
        id: string;
        fullName: string;
        email: string;
        eventType: string;
        date: string;
        time: string;
        guestCount: number;
        location: string;
        notes?: string;
      };
    };

    if (!reservation || !reservation.email) {
      return NextResponse.json({ error: "Missing reservation data" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const reservationLink = `${baseUrl}/reservations/${reservation.id}`;
    const { amount, balance, totalLabel } = getDownpaymentAmount(reservation.eventType, reservation.guestCount);

    const htmlEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reservation Approved — Antonioni Grounds</title>
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
              <h1 style="margin:12px 0 0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;font-family:'Georgia',serif;">Reservation Approved ✓</h1>
              <p style="margin:8px 0 0;font-size:13px;color:#A8A29E;line-height:1.6;max-width:400px;margin-left:auto;margin-right:auto;">
                Your experience has been confirmed. Please complete your downpayment to secure your slot.
              </p>
            </td>
          </tr>

          <!-- Booking Summary -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.2em;color:#2E5A44;font-weight:700;text-transform:uppercase;">Booking Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F2;border:1px solid rgba(45,31,24,0.06);border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid rgba(45,31,24,0.06);">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Guest Name</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;margin-top:2px;display:inline-block;">${reservation.fullName}</span>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid rgba(45,31,24,0.06);text-align:right;">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Experience</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;margin-top:2px;display:inline-block;">${reservation.eventType}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid rgba(45,31,24,0.06);">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Date</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;margin-top:2px;display:inline-block;">${reservation.date}</span>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid rgba(45,31,24,0.06);text-align:right;">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Time</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;font-family:monospace;margin-top:2px;display:inline-block;">${reservation.time}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Guests</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;margin-top:2px;display:inline-block;">${reservation.guestCount} guest${reservation.guestCount > 1 ? "s" : ""}</span>
                  </td>
                  <td style="padding:14px 16px;text-align:right;">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Location</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;margin-top:2px;display:inline-block;">${reservation.location}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Box -->
          <tr>
            <td style="padding:24px 40px 0;">
              <div style="background-color:#FAF7F2;border:1px solid #2E5A44;border-radius:12px;padding:20px;">
                <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.2em;color:#2E5A44;font-weight:700;text-transform:uppercase;">Downpayment Details</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid rgba(45,31,24,0.06);">
                      <span style="font-size:12px;color:#7C6E65;">Required Downpayment</span>
                    </td>
                    <td style="text-align:right;padding:8px 0;border-bottom:1px solid rgba(45,31,24,0.06);">
                      <span style="font-size:18px;font-weight:700;color:#2E5A44;">${amount}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid rgba(45,31,24,0.06);">
                      <span style="font-size:12px;color:#7C6E65;">Remaining Balance</span>
                    </td>
                    <td style="text-align:right;padding:8px 0;border-bottom:1px solid rgba(45,31,24,0.06);">
                      <span style="font-size:14px;font-weight:600;color:#2D1F18;">${balance}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="font-size:12px;color:#7C6E65;">Total Package Price</span>
                    </td>
                    <td style="text-align:right;padding:8px 0;">
                      <span style="font-size:12px;color:#7C6E65;font-weight:600;">${totalLabel}</span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:28px 40px 24px;text-align:center;">
              <a href="${reservationLink}" style="display:inline-block;background-color:#2E5A44;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;border:1px solid #234533;">
                View Reservation →
              </a>
              <p style="margin:12px 0 0;font-size:11px;color:#7C6E65;">
                Or copy this link: <a href="${reservationLink}" style="color:#2E5A44;text-decoration:underline;">${reservationLink}</a>
              </p>
            </td>
          </tr>

          <!-- Payment Instructions -->
          <tr>
            <td style="padding:24px 40px;background-color:#FAF7F2;border-top:1px solid rgba(45,31,24,0.08);">
              <p style="margin:0 0 10px;font-size:10px;letter-spacing:0.2em;color:#2D1F18;font-weight:700;text-transform:uppercase;">Payment Methods Accepted</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;font-size:12px;color:#7C6E65;line-height:1.6;">
                    <strong style="color:#2D1F18;">GCash / QRPh / Bank Transfer</strong><br/>
                    Send your downpayment and upload your screenshot proof of payment on the reservation page linked above.
                  </td>
                </tr>
              </table>
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
</html>`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Antonioni Grounds" <${process.env.SMTP_USER}>`,
      to: reservation.email,
      subject: `✓ Reservation Approved — ${reservation.eventType} on ${reservation.date} | Antonioni Grounds`,
      html: htmlEmail,
      text: `Hi ${reservation.fullName},\n\nYour ${reservation.eventType} reservation on ${reservation.date} at ${reservation.time} has been approved!\n\nPlease visit the link below to view your reservation details and submit your downpayment of ${amount}:\n\n${reservationLink}\n\nThank you,\nAntonioni Grounds`,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(process.cwd(), "public", "logo.png"),
          cid: "logo",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/send-email/approved error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
