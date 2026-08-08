import { NextRequest, NextResponse } from "next/server";
import { getApprovedEmailHtml } from "@/lib/emails/reservation-templates";
import { sendEmail } from "@/lib/resend";

function getDownpaymentAmount(
  eventType: string,
  guestCount: number,
  transpoFee: number = 0,
  discountAmount: number = 0,
  isFreeTranspo: boolean = false,
  customDp: number | null = null
): { amount: string; balance: string; totalLabel: string } {
  const fee = isFreeTranspo ? 0 : transpoFee;

  if (eventType === "Table Reservation") {
    const basePackage = 3500;
    const total = Math.max(0, basePackage - discountAmount);
    const dp = customDp !== null && customDp !== undefined ? customDp : Math.min(1000, total);
    const balance = total - dp;

    let label = `₱${total.toLocaleString()} total`;
    if (discountAmount > 0) label += ` (includes ₱${discountAmount.toLocaleString()} discount)`;

    return {
      amount: `₱${dp.toLocaleString()}`,
      balance: `₱${balance.toLocaleString()}`,
      totalLabel: label,
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
  const discountedBase = Math.max(0, pkg.total - discountAmount);
  const baseDp = Math.round(discountedBase * 0.1);
  const total = discountedBase + fee;
  const dp = customDp !== null && customDp !== undefined ? customDp : (baseDp + fee);
  const balance = total - dp;

  let feeLabel = "";
  if (isFreeTranspo) feeLabel = " • FREE Transpo Fee";
  else if (fee > 0) feeLabel = ` (includes ₱${fee.toLocaleString()} Transpo Fee)`;

  let discountLabel = "";
  if (discountAmount > 0) discountLabel = ` • ₱${discountAmount.toLocaleString()} Discount Applied`;

  return {
    amount: `₱${dp.toLocaleString()}`,
    balance: `₱${balance.toLocaleString()}`,
    totalLabel: `₱${total.toLocaleString()} total${feeLabel}${discountLabel}`,
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
        discountAmount?: number;
        discount_amount?: number;
        isFreeTranspoFee?: boolean;
        is_free_transpo_fee?: boolean;
        customDownpayment?: number;
        custom_downpayment?: number;
      };
    };

    if (!reservation || !reservation.email) {
      return NextResponse.json({ error: "Missing reservation data" }, { status: 400 });
    }

    const fee = Number(reservation.transpoFee ?? reservation.transpo_fee ?? 0);
    const discount = Number(reservation.discountAmount ?? reservation.discount_amount ?? 0);
    const isFreeTranspo = Boolean(reservation.isFreeTranspoFee ?? reservation.is_free_transpo_fee ?? false);
    const customDp = reservation.customDownpayment ?? reservation.custom_downpayment ?? null;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agshop.lat";
    const reservationLink = `${baseUrl}/reservations/${reservation.id}`;
    const { amount, balance, totalLabel } = getDownpaymentAmount(
      reservation.eventType,
      reservation.guestCount,
      fee,
      discount,
      isFreeTranspo,
      customDp
    );

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
