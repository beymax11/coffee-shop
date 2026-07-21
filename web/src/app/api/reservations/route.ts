import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey)
  : supabase;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function getDownpaymentAmount(
  eventType: string,
  guestCount: number
): { amount: string; totalLabel: string } {
  if (eventType === "Table Reservation") {
    return {
      amount: "₱1,000",
      totalLabel: "₱3,500 (fully consumable)",
    };
  }
  // Coffee Cart Booking
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
    totalLabel: `₱${pkg.total.toLocaleString()} total`,
  };
}

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET reservations error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reservations: data });
  } catch (err) {
    console.error("GET /api/reservations error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();

    const {
      id,
      fullName,
      email,
      phone,
      eventType,
      date,
      time,
      guestCount,
      location,
      notes,
      status,
      paymentMethod,
      referenceNumber,
      proofOfPayment,
      coffeeFlavor1,
      coffeeFlavor2,
      nonCoffeeFlavor1,
      nonCoffeeFlavor2,
    } = body;

    const { data, error } = await supabaseAdmin
      .from("reservations")
      .insert([
        {
          id,
          full_name: fullName,
          email,
          phone,
          event_type: eventType,
          date,
          time,
          guest_count: guestCount,
          location,
          notes: notes || null,
          status: status || "Pending",
          payment_method: paymentMethod || null,
          reference_number: referenceNumber || null,
          proof_of_payment: proofOfPayment || null,
          coffee_flavor_1: coffeeFlavor1 || null,
          coffee_flavor_2: coffeeFlavor2 || null,
          non_coffee_flavor_1: nonCoffeeFlavor1 || null,
          non_coffee_flavor_2: nonCoffeeFlavor2 || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase INSERT reservation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send email booking confirmation server-side
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://antonionigrounds.vercel.app";
      const reservationLink = `${baseUrl}/reservations/${data.id}`;
      const { amount, totalLabel } = getDownpaymentAmount(data.event_type, data.guest_count);

      const htmlEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Received — Antonioni Grounds</title>
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
              <h1 style="margin:12px 0 0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;font-family:'Georgia',serif;">Booking Received ✓</h1>
              <p style="margin:8px 0 0;font-size:13px;color:#A8A29E;line-height:1.6;max-width:400px;margin-left:auto;margin-right:auto;">
                Thank you for choosing Antonioni Grounds. Your reservation request has been received and is now <strong style="color:#C5A880;">pending review</strong> by our team.
              </p>
            </td>
          </tr>

          <!-- Booking Reference -->
          <tr>
            <td style="padding:24px 40px 0;">
              <div style="background-color:#FAF7F2;border:1px dashed #D4C5B9;border-radius:12px;padding:16px;text-align:center;">
                <p style="margin:0 0 4px;font-size:9px;letter-spacing:0.25em;color:#7C6E65;text-transform:uppercase;font-weight:700;">Reservation Reference</p>
                <p style="margin:0;font-size:20px;font-weight:700;color:#2E5A44;font-family:monospace;letter-spacing:0.1em;">${data.id}</p>
              </div>
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
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;margin-top:2px;display:inline-block;">${data.full_name}</span>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid rgba(45,31,24,0.06);text-align:right;">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Experience</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;margin-top:2px;display:inline-block;">${data.event_type}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid rgba(45,31,24,0.06);">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Date</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;margin-top:2px;display:inline-block;">${data.date}</span>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid rgba(45,31,24,0.06);text-align:right;">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Time</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;font-family:monospace;margin-top:2px;display:inline-block;">${data.time}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Guests</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;margin-top:2px;display:inline-block;">${data.guest_count} guest${data.guest_count > 1 ? "s" : ""}</span>
                  </td>
                  <td style="padding:14px 16px;text-align:right;">
                    <span style="font-size:9px;color:#7C6E65;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Location</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#2D1F18;margin-top:2px;display:inline-block;">${data.location}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What Happens Next -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.2em;color:#2E5A44;font-weight:700;text-transform:uppercase;">What Happens Next</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F2;border:1px solid rgba(45,31,24,0.06);border-radius:12px;overflow:hidden;">
                <!-- Step 1 -->
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(45,31,24,0.06);vertical-align:top;width:30px;">
                    <span style="font-size:18px;">🔍</span>
                  </td>
                  <td style="padding:14px 18px 14px 0;border-bottom:1px solid rgba(45,31,24,0.06);">
                    <p style="margin:0;font-size:12px;font-weight:700;color:#2D1F18;">Step 1 — Review</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#7C6E65;line-height:1.6;">Our team reviews your booking details within 24 hours.</p>
                  </td>
                </tr>
                <!-- Step 2 -->
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(45,31,24,0.06);vertical-align:top;width:30px;">
                    <span style="font-size:18px;">✅</span>
                  </td>
                  <td style="padding:14px 18px 14px 0;border-bottom:1px solid rgba(45,31,24,0.06);">
                    <p style="margin:0;font-size:12px;font-weight:700;color:#2D1F18;">Step 2 — Approval Email</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#7C6E65;line-height:1.6;">Once approved, you'll receive an email with your downpayment instructions (${amount} required).</p>
                  </td>
                </tr>
                <!-- Step 3 -->
                <tr>
                  <td style="padding:14px 18px;vertical-align:top;width:30px;">
                    <span style="font-size:18px;">💳</span>
                  </td>
                  <td style="padding:14px 18px 14px 0;">
                    <p style="margin:0;font-size:12px;font-weight:700;color:#2D1F18;">Step 3 — Downpayment</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#7C6E65;line-height:1.6;">Submit your downpayment via GCash, QRPh, or Bank Transfer to fully secure your slot. Total: ${totalLabel}.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:28px 40px 36px;text-align:center;">
              <a href="${reservationLink}" style="display:inline-block;background-color:#2E5A44;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;transition:all 0.3s;border:1px solid #234533;">
                View My Reservation →
              </a>
              <p style="margin:12px 0 0;font-size:11px;color:#7C6E65;">
                Or copy this link: <a href="${reservationLink}" style="color:#2E5A44;text-decoration:underline;">${reservationLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:30px 40px;text-align:center;border-top:1px solid #FAF7F2;background-color:#FAF7F2;">
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
        to: data.email,
        subject: `Booking Received — ${data.event_type} on ${data.date} | Antonioni Grounds`,
        html: htmlEmail,
        text: `Hi ${data.full_name},\n\nThank you for your reservation request at Antonioni Grounds!\n\nReference: ${data.id}\nExperience: ${data.event_type}\nDate: ${data.date} at ${data.time}\nGuests: ${data.guest_count}\nLocation: ${data.location}\n\nYour booking is currently pending review. Once approved, you'll receive a follow-up email with downpayment instructions.\n\nView your reservation: ${reservationLink}\n\nWarm regards,\nAntonioni Grounds`,
        attachments: [
          {
            filename: "logo.png",
            path: path.join(process.cwd(), "public", "logo.png"),
            cid: "logo",
          },
        ],
      });
    } catch (emailErr) {
      console.error("Failed to send reservation confirmation email:", emailErr);
    }

    return NextResponse.json({ reservation: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/reservations error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
