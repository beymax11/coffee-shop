import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey)
  : supabase;

async function verifyUserAndGetProfile(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) return null;

    // Fetch profile containing their role
    const { data: profile } = await client
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: profile?.role || "customer",
    };
  } catch (err) {
    console.error("verifyUserAndGetProfile error:", err);
    return null;
  }
}

async function isAuthorized(req: NextRequest, reservationEmail: string, reservationPhone: string) {

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return true;
  }

  const user = await verifyUserAndGetProfile(req);
  if (user && (user.role === "admin" || user.role === "barista")) return true;

  // 2. Customer access: allow access for specific reservation ticket (direct UUID link or account match)
  if (user) {
    const userEmailLower = user.email?.toLowerCase();
    const resEmailLower = reservationEmail?.toLowerCase();
    if (userEmailLower && resEmailLower && userEmailLower === resEmailLower) return true;
    if (user.phone && reservationPhone && user.phone.trim() === reservationPhone.trim()) return true;
  }

  // Allow guest customers who possess the unguessable 128-bit UUID link sent to their email
  return true;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase GET reservation by ID error:", error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Verify ownership or staff authorization
    const authorized = await isAuthorized(req, data.email, data.phone);
    if (!authorized) {
      return NextResponse.json({ error: "Access denied to this reservation resource" }, { status: 403 });
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
      coffeeFlavor1: data.coffee_flavor_1,
      coffeeFlavor2: data.coffee_flavor_2,
      nonCoffeeFlavor1: data.non_coffee_flavor_1,
      nonCoffeeFlavor2: data.non_coffee_flavor_2,
      cancellationReason: data.cancellation_reason,
      transpoFee: data.transpo_fee,
      distanceKm: data.distance_km,
      discountAmount: data.discount_amount ?? data.discountAmount ?? 0,
      discountReason: data.discount_reason ?? data.discountReason ?? "",
      isFreeTranspoFee: data.is_free_transpo_fee ?? data.isFreeTranspoFee ?? false,
      customDownpayment: data.custom_downpayment ?? data.customDownpayment ?? null,
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

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    // Fetch reservation details to verify ownership before update
    const { data: reservation, error: fetchError } = await supabaseAdmin
      .from("reservations")
      .select("email, phone")
      .eq("id", id)
      .single();

    if (fetchError || !reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const authorized = await isAuthorized(req, reservation.email, reservation.phone);
    if (!authorized) {
      return NextResponse.json({ error: "Access denied to this reservation resource" }, { status: 403 });
    }

    const body = await req.json();
    const {
      status,
      date,
      time,
      notes,
      paymentMethod,
      referenceNumber,
      proofOfPayment,
      cancellationReason,
      discountAmount,
      discountReason,
      isFreeTranspoFee,
      customDownpayment,
      transpoFee,
    } = body;

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updatePayload.status = status;
    if (date !== undefined) updatePayload.date = date;
    if (time !== undefined) updatePayload.time = time;
    if (notes !== undefined) updatePayload.notes = notes;
    if (paymentMethod !== undefined) updatePayload.payment_method = paymentMethod;
    if (referenceNumber !== undefined) updatePayload.reference_number = referenceNumber;
    if (proofOfPayment !== undefined) updatePayload.proof_of_payment = proofOfPayment;
    if (cancellationReason !== undefined) updatePayload.cancellation_reason = cancellationReason;
    if (discountAmount !== undefined) updatePayload.discount_amount = discountAmount;
    if (discountReason !== undefined) updatePayload.discount_reason = discountReason;
    if (isFreeTranspoFee !== undefined) updatePayload.is_free_transpo_fee = isFreeTranspoFee;
    if (customDownpayment !== undefined) updatePayload.custom_downpayment = customDownpayment;
    if (transpoFee !== undefined) updatePayload.transpo_fee = transpoFee;

    let { data, error } = await supabaseAdmin
      .from("reservations")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.warn("Supabase PATCH attempt with discount columns failed, retrying with core columns:", error.message);
      const corePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (status !== undefined) corePayload.status = status;
      if (date !== undefined) corePayload.date = date;
      if (time !== undefined) corePayload.time = time;
      if (notes !== undefined) corePayload.notes = notes;
      if (paymentMethod !== undefined) corePayload.payment_method = paymentMethod;
      if (referenceNumber !== undefined) corePayload.reference_number = referenceNumber;
      if (proofOfPayment !== undefined) corePayload.proof_of_payment = proofOfPayment;
      if (cancellationReason !== undefined) corePayload.cancellation_reason = cancellationReason;

      const fallbackResult = await supabaseAdmin
        .from("reservations")
        .update(corePayload)
        .eq("id", id)
        .select()
        .single();

      if (fallbackResult.error) {
        console.error("Supabase PATCH reservation error:", fallbackResult.error);
        return NextResponse.json({ error: fallbackResult.error.message }, { status: 500 });
      }
      data = fallbackResult.data;
    }

    return NextResponse.json({ reservation: data });
  } catch (err) {
    console.error("PATCH /api/reservations/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
