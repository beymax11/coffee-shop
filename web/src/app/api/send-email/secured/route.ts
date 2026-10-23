import { NextRequest, NextResponse } from "next/server";
import { getSecuredEmailHtml } from "@/lib/emails/reservation-templates";
import { sendEmail } from "@/lib/resend";
import { requireStaff } from "@/lib/auth-server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

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
    } | null = null;

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
        };
      }
    }

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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agshop.lat";
    const reservationLink = `${baseUrl}/reservations/${reservationData.id}`;

    const htmlEmail = getSecuredEmailHtml({
      reservation: reservationData,
      reservationLink,
    });

    const sendResult = await sendEmail({
      to: reservationData.email,
      subject: `✓ Booking Confirmed & Paid — ${reservationData.eventType} | Antonioni Grounds`,
      html: htmlEmail,
      text: `Hi ${reservationData.fullName},\n\nYour payment has been verified! Your ${reservationData.eventType} booking on ${reservationData.date} is now fully secured and approved.\n\nView details: ${reservationLink}\n\nThank you,\nAntonioni Grounds`,
    });

    if (!sendResult.success) {
      console.error("[Email Error] Secured email failed:", sendResult.error);
      return NextResponse.json({ error: "Failed to send payment confirmation email." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/send-email/secured Exception]:", err);
    return NextResponse.json({ error: "Internal server error occurred." }, { status: 500 });
  }
}
