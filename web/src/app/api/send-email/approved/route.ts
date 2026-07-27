import { NextRequest, NextResponse } from "next/server";
import { getApprovedEmailHtml } from "@/lib/emails/reservation-templates";
import { sendEmail } from "@/lib/resend";

function getDownpaymentAmount(eventType: string, guestCount: number, transpoFee: number = 0): { amount: string; balance: string; totalLabel: string } {
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
  const baseDp = Math.round(pkg.total * 0.1);
  const total = pkg.total + (transpoFee || 0);
  const dp = baseDp + (transpoFee || 0);
  const balance = total - dp;
  return {
    amount: `₱${dp.toLocaleString()}`,
    balance: `₱${balance.toLocaleString()}`,
    totalLabel: `₱${total.toLocaleString()} total${transpoFee > 0 ? ` (includes ₱${transpoFee.toLocaleString()} Transpo Fee)` : ''}`,
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
        transpoFee?: number;
        transpo_fee?: number;
        distanceKm?: number;
        distance_km?: number;
      };
    };

    if (!reservation || !reservation.email) {
      return NextResponse.json({ error: "Missing reservation data" }, { status: 400 });
    }

    const fee = Number(reservation.transpoFee ?? reservation.transpo_fee ?? 0);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://antonionigrounds.vercel.app";
    const reservationLink = `${baseUrl}/reservations/${reservation.id}`;
    const { amount, balance, totalLabel } = getDownpaymentAmount(reservation.eventType, reservation.guestCount, fee);

    const htmlEmail = getApprovedEmailHtml({
      reservation,
      amount,
      balance,
      totalLabel,
      reservationLink,
    });

    await sendEmail({
      to: reservation.email,
      subject: `✓ Reservation Approved — ${reservation.eventType} on ${reservation.date} | Antonioni Grounds`,
      html: htmlEmail,
      text: `Hi ${reservation.fullName},\n\nYour ${reservation.eventType} reservation on ${reservation.date} at ${reservation.time} has been approved!\n\nPlease visit the link below to view your reservation details and submit your downpayment of ${amount}:\n\n${reservationLink}\n\nThank you,\nAntonioni Grounds`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/send-email/approved error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
