import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { data, error } = await supabase
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
  if (!supabase) {
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
    } = body;

    const { data, error } = await supabase
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
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase INSERT reservation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reservation: data }, { status: 201 });
  } catch (err) {
    console.error("POST /api/reservations error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
