import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/resend";
import { getReceivedEmailHtml } from "@/lib/emails/reservation-templates";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey)
  : supabase;

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
    totalLabel: `₱${total.toLocaleString()} total${transpoFee > 0 ? ` (includes ₱${transpoFee.toLocaleString()} Transpo Fee)` : ''}`,
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
      transpoFee,
      distanceKm,
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
          transpo_fee: transpoFee || 0,
          distance_km: distanceKm || 0,
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
      const { amount, totalLabel } = getDownpaymentAmount(data.event_type, data.guest_count, Number(data.transpo_fee || 0));

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
      console.error("Failed to send reservation confirmation email:", emailErr);
    }

    return NextResponse.json({ reservation: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/reservations error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
