import { NextRequest, NextResponse } from "next/server";
import { getSecuredEmailHtml } from "@/lib/emails/reservation-templates";
import { sendEmail } from "@/lib/resend";

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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agshop.lat";
    const reservationLink = `${baseUrl}/reservations/${reservation.id}`;

    const htmlEmail = getSecuredEmailHtml({
      reservation,
      reservationLink,
    });

    await sendEmail({
      to: reservation.email,
      subject: `✓ Booking Confirmed & Paid — ${reservation.eventType} | Antonioni Grounds`,
      html: htmlEmail,
      text: `Hi ${reservation.fullName},\n\nYour payment has been verified! Your ${reservation.eventType} booking on ${reservation.date} is now fully secured and approved.\n\nView details: ${reservationLink}\n\nThank you,\nAntonioni Grounds`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/send-email/secured error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
