import { NextRequest, NextResponse } from "next/server";
import { getCompletedEmailHtml } from "@/lib/emails/reservation-templates";
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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://antonionigrounds.vercel.app";
    const reservationLink = `${baseUrl}/reservations/${reservation.id}`;

    const htmlEmail = getCompletedEmailHtml({
      reservation,
      reservationLink,
    });

    await sendEmail({
      to: reservation.email,
      subject: `Thank You for Visiting Antonioni Grounds 🌟 | Your Booking is Complete`,
      html: htmlEmail,
      text: `Hi ${reservation.fullName},\n\nThank you for your ${reservation.eventType} experience at Antonioni Grounds on ${reservation.date}!\n\nWe hope it was an unforgettable moment. We look forward to serving you again soon.\n\nView your booking: ${reservationLink}\n\nWarm regards,\nAntonioni Grounds`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/send-email/completed error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
