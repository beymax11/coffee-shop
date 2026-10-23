import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { createClient } from "@supabase/supabase-js";
import { getAuthContext } from "@/lib/auth-server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { patchReservationSchema } from "@/lib/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : supabase;

function maskEmail(email?: string | null): string {
  if (!email || !email.includes("@")) return "***@***.***";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

function maskPhone(phone?: string | null): string {
  if (!phone || phone.length < 6) return "***-***-****";
  const start = phone.slice(0, 4);
  const end = phone.slice(-2);
  return `${start} *** **${end}`;
}

function maskReferenceNumber(ref?: string | null): string {
  if (!ref || ref.length < 4) return "****";
  return `****${ref.slice(-4)}`;
}

/**
 * Validates whether the caller has staff access or ownership of this specific reservation.
 */
async function checkReservationAccess(
  req: NextRequest,
  reservationEmail: string,
  reservationPhone?: string | null,
  bodyIdentity?: { clientEmail?: string; clientPhone?: string }
): Promise<{ isStaff: boolean; isOwner: boolean }> {
  const auth = await getAuthContext(req);
  if (auth.isStaff) {
    return { isStaff: true, isOwner: true };
  }

  const resEmailLower = reservationEmail.toLowerCase().trim();
  const resPhoneNorm = reservationPhone ? reservationPhone.trim() : null;

  // 1. Check logged-in user email or phone
  if (auth.userId) {
    const userEmailLower = auth.email?.toLowerCase().trim();
    if (userEmailLower && userEmailLower === resEmailLower) {
      return { isStaff: false, isOwner: true };
    }
    if (auth.phone && resPhoneNorm && auth.phone.trim() === resPhoneNorm) {
      return { isStaff: false, isOwner: true };
    }
  }

  // 2. Check query params or headers for guest verification (e.g. ?email=... or x-guest-email)
  const queryEmail = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  const headerEmail = req.headers.get("x-reservation-email")?.toLowerCase().trim();
  const bodyEmail = bodyIdentity?.clientEmail?.toLowerCase().trim();

  const claimedEmail = bodyEmail || headerEmail || queryEmail;
  if (claimedEmail && claimedEmail === resEmailLower) {
    return { isStaff: false, isOwner: true };
  }

  const queryPhone = req.nextUrl.searchParams.get("phone")?.trim();
  const bodyPhone = bodyIdentity?.clientPhone?.trim();
  const claimedPhone = bodyPhone || queryPhone;
  if (claimedPhone && resPhoneNorm && claimedPhone === resPhoneNorm) {
    return { isStaff: false, isOwner: true };
  }

  return { isStaff: false, isOwner: false };
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

    if (error || !data) {
      return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
    }

    const { isStaff, isOwner } = await checkReservationAccess(req, data.email, data.phone);

    // If caller is neither staff nor verified owner, mask sensitive Personally Identifiable Information
    const shouldMask = !isStaff && !isOwner;

    const mapped = {
      id: data.id,
      fullName: data.full_name,
      email: shouldMask ? maskEmail(data.email) : data.email,
      phone: shouldMask ? maskPhone(data.phone) : data.phone,
      eventType: data.event_type,
      date: data.date,
      time: data.time,
      guestCount: data.guest_count,
      location: data.location,
      notes: data.notes,
      status: data.status,
      paymentMethod: data.payment_method,
      referenceNumber: shouldMask ? maskReferenceNumber(data.reference_number) : data.reference_number,
      proofOfPayment: shouldMask ? null : data.proof_of_payment,
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
      isVerifiedOwner: !shouldMask,
    };

    return NextResponse.json({ reservation: mapped });
  } catch (err) {
    console.error("[GET /api/reservations/[id] Exception]:", err);
    return NextResponse.json({ error: "Failed to retrieve reservation details." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Rate limiting on reservation updates (20 requests per 10 mins per IP)
  const rateLimitResponse = enforceRateLimit(req, "reservation-patch", 20, 600);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const { id } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  try {
    // 2. Fetch reservation from database to verify existence & owner
    const { data: reservation, error: fetchError } = await supabaseAdmin
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !reservation) {
      return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
    }

    const rawBody = await req.json();

    // 3. Validate request schema
    const validation = patchReservationSchema.safeParse(rawBody);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid update data.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const val = validation.data;

    // 4. Check ownership or staff privileges
    const { isStaff, isOwner } = await checkReservationAccess(
      req,
      reservation.email,
      reservation.phone,
      { clientEmail: val.clientEmail, clientPhone: val.clientPhone }
    );

    // If caller is NOT staff and NOT confirmed owner, reject modification immediately
    if (!isStaff && !isOwner) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. You must be signed in or provide matching contact details to modify this reservation.",
        },
        { status: 403 }
      );
    }

    // 5. Non-staff guard: Customers may only submit payment details or request cancellation
    if (!isStaff) {
      const hasPrivilegedField =
        val.discountAmount !== undefined ||
        val.discountReason !== undefined ||
        val.isFreeTranspoFee !== undefined ||
        val.customDownpayment !== undefined ||
        val.transpoFee !== undefined ||
        (val.status !== undefined && val.status !== "Cancellation Requested");

      if (hasPrivilegedField) {
        return NextResponse.json(
          { error: "Forbidden. Customers cannot modify pricing or change approval status." },
          { status: 403 }
        );
      }
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (val.status !== undefined) updatePayload.status = val.status;
    if (val.date !== undefined) updatePayload.date = val.date;
    if (val.time !== undefined) updatePayload.time = val.time;
    if (val.notes !== undefined) updatePayload.notes = val.notes;
    if (val.paymentMethod !== undefined) updatePayload.payment_method = val.paymentMethod;
    if (val.referenceNumber !== undefined) updatePayload.reference_number = val.referenceNumber;
    if (val.proofOfPayment !== undefined) updatePayload.proof_of_payment = val.proofOfPayment;
    if (val.cancellationReason !== undefined) updatePayload.cancellation_reason = val.cancellationReason;
    if (val.discountAmount !== undefined) updatePayload.discount_amount = val.discountAmount;
    if (val.discountReason !== undefined) updatePayload.discount_reason = val.discountReason;
    if (val.isFreeTranspoFee !== undefined) updatePayload.is_free_transpo_fee = val.isFreeTranspoFee;
    if (val.customDownpayment !== undefined) updatePayload.custom_downpayment = val.customDownpayment;
    if (val.transpoFee !== undefined) updatePayload.transpo_fee = val.transpoFee;

    let { data, error } = await supabaseAdmin
      .from("reservations")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.warn(
        "[PATCH /api/reservations/[id]] Extended update failed, falling back to core schema:",
        error.message
      );
      const corePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (val.status !== undefined) corePayload.status = val.status;
      if (val.date !== undefined) corePayload.date = val.date;
      if (val.time !== undefined) corePayload.time = val.time;
      if (val.notes !== undefined) corePayload.notes = val.notes;
      if (val.paymentMethod !== undefined) corePayload.payment_method = val.paymentMethod;
      if (val.referenceNumber !== undefined) corePayload.reference_number = val.referenceNumber;
      if (val.proofOfPayment !== undefined) corePayload.proof_of_payment = val.proofOfPayment;
      if (val.cancellationReason !== undefined) corePayload.cancellation_reason = val.cancellationReason;

      const fallbackResult = await supabaseAdmin
        .from("reservations")
        .update(corePayload)
        .eq("id", id)
        .select()
        .single();

      if (fallbackResult.error) {
        console.error("[PATCH /api/reservations/[id] Error]:", fallbackResult.error.message);
        return NextResponse.json({ error: "Failed to update reservation." }, { status: 500 });
      }
      data = fallbackResult.data;
    }

    return NextResponse.json({ reservation: data });
  } catch (err) {
    console.error("[PATCH /api/reservations/[id] Exception]:", err);
    return NextResponse.json({ error: "An unexpected error occurred while updating the reservation." }, { status: 500 });
  }
}
