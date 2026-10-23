import { NextRequest, NextResponse } from "next/server";
import { getApprovedEmailHtml } from "@/lib/emails/reservation-templates";
import { sendEmail } from "@/lib/resend";
import { requireStaff } from "@/lib/auth-server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

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
  const dp = customDp !== null && customDp !== undefined ? customDp : baseDp + fee;
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
  const check = await requireStaff(req);
  if ("response" in check) {
    return check.response;
  }

  try {
    const body = await req.json();
    const reservationId = body.reservationId || body.reservation?.id;

    if (!reservationId) {
      return NextResponse.json({ error: "reservationId is required" }, { status: 400 });
    }

    let reservationData: {
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
      discountAmount?: number;
      isFreeTranspoFee?: boolean;
      customDownpayment?: number | null;
    } | null = null;

    // Verify reservation against database
    if (supabaseAdmin) {
      const { data: dbRes, error: dbError } = await supabaseAdmin
        .from("reservations")
        .select("*")
        .eq("id", reservationId)
        .single();

      if (!dbError && dbRes) {
        reservationData = {
          id: dbRes.id,
          fullName: dbRes.full_name,
          email: dbRes.email,
          eventType: dbRes.event_type,
          date: dbRes.date,
          time: dbRes.time,
          guestCount: dbRes.guest_count,
          location: dbRes.location,
          notes: dbRes.notes,
          transpoFee: dbRes.transpo_fee,
          discountAmount: dbRes.discount_amount,
          isFreeTranspoFee: dbRes.is_free_transpo_fee,
          customDownpayment: dbRes.custom_downpayment,
        };
      }
    }

    // Fallback to client-provided reservation only in local dev mock mode
    if (!reservationData) {
      if (process.env.NODE_ENV !== "production" && body.reservation?.email) {
        reservationData = body.reservation;
      } else {
        return NextResponse.json(
          { error: "Reservation record could not be found in the database." },
          { status: 404 }
        );
      }
    }

    if (!reservationData || !reservationData.email) {
      return NextResponse.json({ error: "Missing recipient email address." }, { status: 400 });
    }

    const fee = Number(reservationData.transpoFee || 0);
    const discount = Number(reservationData.discountAmount || 0);
    const isFreeTranspo = Boolean(reservationData.isFreeTranspoFee || false);
    const customDp = reservationData.customDownpayment ?? null;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agshop.lat";
    const reservationLink = `${baseUrl}/reservations/${reservationData.id}`;
    const { amount, balance, totalLabel } = getDownpaymentAmount(
      reservationData.eventType,
      reservationData.guestCount,
      fee,
      discount,
      isFreeTranspo,
      customDp
    );

    const htmlEmail = getApprovedEmailHtml({
      reservation: reservationData,
      amount,
      balance,
      totalLabel,
      reservationLink,
    });

    const sendResult = await sendEmail({
      to: reservationData.email,
      subject: `✓ Reservation Approved — ${reservationData.eventType} on ${reservationData.date} | Antonioni Grounds`,
      html: htmlEmail,
      text: `Hi ${reservationData.fullName},\n\nYour ${reservationData.eventType} reservation on ${reservationData.date} at ${reservationData.time} has been approved!\n\nPlease visit the link below to view your reservation details and submit your downpayment of ${amount}:\n\n${reservationLink}\n\nThank you,\nAntonioni Grounds`,
    });

    if (!sendResult.success) {
      console.error("[Email Error] Approved email failed:", sendResult.error);
      return NextResponse.json({ error: "Failed to send approved notification email." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/send-email/approved Exception]:", err);
    return NextResponse.json({ error: "Internal server error occurred." }, { status: 500 });
  }
}
