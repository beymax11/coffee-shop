import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase GET reservation by ID error:", error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Map snake_case DB fields → camelCase for frontend
    const mapped = {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      eventType: data.event_type,
      date: data.date,
      time: data.time,
      guestCount: data.guest_count,
      location: data.location,
      notes: data.notes,
      status: data.status,
      paymentMethod: data.payment_method,
      referenceNumber: data.reference_number,
      proofOfPayment: data.proof_of_payment,
      created_at: data.created_at,
    };

    return NextResponse.json({ reservation: mapped });
  } catch (err) {
    console.error("GET /api/reservations/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { status, paymentMethod, referenceNumber, proofOfPayment } = body;

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updatePayload.status = status;
    if (paymentMethod !== undefined) updatePayload.payment_method = paymentMethod;
    if (referenceNumber !== undefined) updatePayload.reference_number = referenceNumber;
    if (proofOfPayment !== undefined) updatePayload.proof_of_payment = proofOfPayment;

    const { data, error } = await supabase
      .from("reservations")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase PATCH reservation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reservation: data });
  } catch (err) {
    console.error("PATCH /api/reservations/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
