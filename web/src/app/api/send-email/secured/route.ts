import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import { getSecuredEmailHtml } from "@/lib/emails/reservation-templates";

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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://antonionigrounds.vercel.app";
    const reservationLink = `${baseUrl}/reservations/${reservation.id}`;

    const htmlEmail = getSecuredEmailHtml({
      reservation,
      reservationLink,
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
      to: reservation.email,
      subject: `✓ Booking Confirmed & Paid — ${reservation.eventType} | Antonioni Grounds`,
      html: htmlEmail,
      text: `Hi ${reservation.fullName},\n\nYour payment has been verified! Your ${reservation.eventType} booking on ${reservation.date} is now fully secured and approved.\n\nView details: ${reservationLink}\n\nThank you,\nAntonioni Grounds`,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/send-email/secured error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
