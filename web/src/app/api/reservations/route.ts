import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/resend";
import { getReceivedEmailHtml } from "@/lib/emails/reservation-templates";
import { requireStaff } from "@/lib/auth-server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createReservationSchema } from "@/lib/validation";
import { generateReservationReference } from "@/lib/id-generator";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : supabase;

function getDownpaymentAmount(
  eventType: string,
  guestCount: number,
  transpoFee: number = 0
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
  const baseDp = Math.round(pkg.total * 0.1);
  const total = pkg.total + (transpoFee || 0);
  const dp = baseDp + (transpoFee || 0);
  return {
    amount: `₱${dp.toLocaleString()}`,
    totalLabel: `₱${total.toLocaleString()} total${
      transpoFee > 0 ? ` (includes ₱${transpoFee.toLocaleString()} Transpo Fee)` : ""
    }`,
  };
}

export async function GET(req: NextRequest) {
  const check = await requireStaff(req);
  if ("response" in check) {
    return check.response;
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Reservations GET Error]:", error.message);
      return NextResponse.json({ error: "Failed to fetch reservations." }, { status: 500 });
    }

    return NextResponse.json({ reservations: data || [] });
  } catch (err) {
    console.error("[Reservations GET Exception]:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // 1. Rate Limiting (10 reservation requests per 10 minutes per IP)
  const rateLimitResponse = enforceRateLimit(req, "reservation-create", 10, 600);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database service unavailable." }, { status: 503 });
  }

  try {
    const rawBody = await req.json();

    // 2. Validate input payload
    const validation = createReservationSchema.safeParse(rawBody);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid reservation parameters.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const val = validation.data;
    const reservationId = val.id && val.id.trim() ? val.id.trim() : generateReservationReference();

    // 3. Security: ALWAYS force new reservations to "Pending" status regardless of client payload
    const initialStatus = "Pending";

    const { data, error } = await supabaseAdmin
      .from("reservations")
      .insert([
        {
          id: reservationId,
          full_name: val.fullName,
          email: val.email,
          phone: val.phone,
          event_type: val.eventType,
          date: val.date,
          time: val.time,
          guest_count: val.guestCount,
          location: val.location,
          notes: val.notes || null,
          status: initialStatus,
          payment_method: val.paymentMethod || null,
          reference_number: val.referenceNumber || null,
          proof_of_payment: val.proofOfPayment || null,
          coffee_flavor_1: val.coffeeFlavor1 || null,
          coffee_flavor_2: val.coffeeFlavor2 || null,
          non_coffee_flavor_1: val.nonCoffeeFlavor1 || null,
          non_coffee_flavor_2: val.nonCoffeeFlavor2 || null,
          transpo_fee: val.transpoFee || 0,
          distance_km: val.distanceKm || 0,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Reservations POST Insert Error]:", error.message);
      return NextResponse.json({ error: "Could not create reservation. Please verify your details." }, { status: 400 });
    }

    // 4. Send email booking confirmation server-side
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agshop.lat";
      const reservationLink = `${baseUrl}/reservations/${data.id}`;
      const { amount, totalLabel } = getDownpaymentAmount(
        data.event_type,
        data.guest_count,
        Number(data.transpo_fee || 0)
      );

      const htmlEmail = getReceivedEmailHtml({
        reservation: {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          eventType: data.event_type,
          date: data.date,
          time: data.time,
          guestCount: data.guest_count,
          location: data.location,
          notes: data.notes,
        },
        amount,
        totalLabel,
        reservationLink,
      });

      await sendEmail({
        to: data.email,
        subject: `Booking Received — ${data.event_type} on ${data.date} | Antonioni Grounds`,
        html: htmlEmail,
        text: `Hi ${data.full_name},\n\nThank you for your reservation request at Antonioni Grounds!\n\nReference: ${data.id}\nExperience: ${data.event_type}\nDate: ${data.date} at ${data.time}\nGuests: ${data.guest_count}\nLocation: ${data.location}\n\nYour booking is currently pending review. Once approved, you'll receive a follow-up email with downpayment instructions.\n\nView your reservation: ${reservationLink}\n\nWarm regards,\nAntonioni Grounds`,
      });
    } catch (emailErr) {
      console.error("[Reservations POST Email Error]:", emailErr);
    }

    return NextResponse.json({ reservation: data }, { status: 201 });
  } catch (err) {
    console.error("[Reservations POST Exception]:", err);
    return NextResponse.json({ error: "An unexpected error occurred while processing your booking." }, { status: 500 });
  }
}
