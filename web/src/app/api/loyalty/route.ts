import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-server";
import { patchLoyaltySchema, createLoyaltyMemberSchema } from "@/lib/validation";
import { generateUniqueLoyaltyCardId } from "@/lib/id-generator";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin client with full bypass of RLS for authorized staff operations
const supabaseAdmin =
  supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

// Helper: check if a string looks like a UUID
const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

/**
 * Helper to upsert a loyalty_cards row with retry on sequential ID collision.
 */
async function upsertCardWithRetry(
  userId: string,
  stamps: number,
  points: number,
  initialExistingIds: string[] = []
) {
  if (!supabaseAdmin) return { data: null, error: new Error("Database not configured"), cardId: "" };

  const triedIds = [...initialExistingIds];
  let lastError: any = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const newCardId = await generateUniqueLoyaltyCardId(supabaseAdmin, triedIds);
    triedIds.push(newCardId);

    const result = await supabaseAdmin
      .from("loyalty_cards")
      .upsert(
        {
          id: newCardId,
          user_id: userId,
          stamps,
          points,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (!result.error) {
      return { data: result.data, error: null, cardId: result.data?.id || newCardId };
    }

    lastError = result.error;
    // Retry only if unique constraint on id collided
    if (result.error.code !== "23505") {
      break;
    }
  }

  return { data: null, error: lastError, cardId: triedIds[triedIds.length - 1] || "" };
}

/**
 * POST /api/loyalty
 * Registers a walk-in loyalty member on the server using supabaseAdmin
 * so the staff member's browser auth session is never overwritten.
 */
export async function POST(request: NextRequest) {
  const check = await requireStaff(request);
  if ("response" in check) {
    return check.response;
  }

  try {
    const rawBody = await request.json();
    const validation = createLoyaltyMemberSchema.safeParse(rawBody);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid member details.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, phone, stamps, existingIds } = validation.data;
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPhone = (phone || "").trim();

    if (!supabaseAdmin) {
      const fallbackId = await generateUniqueLoyaltyCardId(null, existingIds || []);
      return NextResponse.json({
        success: true,
        isMock: true,
        memberId: fallbackId,
      });
    }

    const tempPassword = `Ag_${crypto.randomBytes(16).toString("hex")}!1`;
    let userId: string | null = null;

    // 1. Check if profile already exists by email or phone
    if (cleanPhone) {
      const { data: existingByPhone } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("phone", cleanPhone)
        .maybeSingle();
      if (existingByPhone?.id) {
        userId = existingByPhone.id;
      }
    }

    if (!userId && cleanEmail) {
      const { data: existingByEmail } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();
      if (existingByEmail?.id) {
        userId = existingByEmail.id;
      }
    }

    // 2. If no profile exists yet, create user via Admin Auth API (does not affect caller's session)
    if (!userId) {
      const createPayload = cleanPhone && !cleanEmail
        ? {
            phone: cleanPhone,
            password: tempPassword,
            phone_confirm: true,
            user_metadata: { name, role: "customer" },
          }
        : {
            email: cleanEmail,
            password: tempPassword,
            email_confirm: true,
            ...(cleanPhone ? { phone: cleanPhone, phone_confirm: true } : {}),
            user_metadata: { name, role: "customer" },
          };

      const { data: authData, error: createError } =
        await supabaseAdmin.auth.admin.createUser(createPayload);

      if (!createError && authData?.user?.id) {
        userId = authData.user.id;
      } else if (createError) {
        console.warn("[Loyalty POST] createUser warning:", createError.message);
      }
    }

    if (userId) {
      // Ensure profile record exists and has updated name/contact
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (existingProfile) {
        await supabaseAdmin
          .from("profiles")
          .update({
            name,
            ...(cleanEmail ? { email: cleanEmail } : {}),
            ...(cleanPhone ? { phone: cleanPhone } : {}),
          })
          .eq("id", userId);
      } else {
        await supabaseAdmin.from("profiles").insert({
          id: userId,
          name,
          email: cleanEmail || "",
          phone: cleanPhone || null,
          role: "customer",
        });
      }

      const { data: cardData, cardId, error: cardError } = await upsertCardWithRetry(
        userId,
        stamps ?? 0,
        0,
        existingIds || []
      );

      if (cardError) {
        console.error("[Loyalty POST] Card upsert error:", cardError.message);
      }

      return NextResponse.json({
        success: true,
        memberId: cardData?.id || cardId,
        userId,
      });
    }

    const fallbackId = await generateUniqueLoyaltyCardId(supabaseAdmin, existingIds || []);
    return NextResponse.json({
      success: true,
      memberId: fallbackId,
    });
  } catch (err) {
    console.error("[Loyalty POST Exception]:", err);
    return NextResponse.json({ error: "Failed to register loyalty member." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const check = await requireStaff(request);
  if ("response" in check) {
    return check.response;
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  try {
    const rawBody = await request.json();

    // 1. Schema Validation
    const validation = patchLoyaltySchema.safeParse(rawBody);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid loyalty parameters.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { cardId, userId, stamps, points } = validation.data;

    const updateData: Record<string, number> = {};
    if (stamps !== undefined) updateData.stamps = stamps;
    if (points !== undefined) updateData.points = points;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    let data: any = null;
    let error: any = null;

    // Strategy 1: If cardId is a formatted AG ID (not a UUID), update by loyalty_cards.id
    if (cardId && !isUUID(cardId)) {
      const result = await supabaseAdmin
        .from("loyalty_cards")
        .update(updateData)
        .eq("id", cardId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    // Strategy 2: If cardId is a UUID or strategy 1 returned no rows, try by user_id
    if (!data && !error) {
      const lookupUserId = userId || cardId;
      if (lookupUserId) {
        const result = await supabaseAdmin
          .from("loyalty_cards")
          .update(updateData)
          .eq("user_id", lookupUserId)
          .select()
          .single();
        data = result.data;
        error = result.error;
      }
    }

    // Strategy 3: If still no row found, create a new loyalty_cards entry for this user with collision retry
    if (!data && userId) {
      const retryResult = await upsertCardWithRetry(
        userId,
        updateData.stamps ?? 0,
        updateData.points ?? 0
      );
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.error("[Loyalty PATCH Error]:", error.message);
      return NextResponse.json({ error: "Failed to update loyalty record." }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Loyalty card not found and could not be created. Ensure the member has a valid account.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[Loyalty PATCH Exception]:", err);
    return NextResponse.json({ error: "Internal server error occurred." }, { status: 500 });
  }
}

/**
 * DELETE /api/loyalty
 * Safely deletes a loyalty card (and optional customer profile) via server admin client.
 */
export async function DELETE(request: NextRequest) {
  const check = await requireStaff(request);
  if ("response" in check) {
    return check.response;
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ success: true, isMock: true });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const cardId = searchParams.get("cardId")?.trim();
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!cardId && !email) {
      return NextResponse.json(
        { error: "cardId or email is required to delete a loyalty record." },
        { status: 400 }
      );
    }

    if (cardId) {
      await supabaseAdmin.from("loyalty_cards").delete().eq("id", cardId);
    }

    if (email) {
      // Only delete customer profiles, never admin/barista accounts
      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("email", email)
        .eq("role", "customer");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Loyalty DELETE Exception]:", err);
    return NextResponse.json(
      { error: "Failed to delete loyalty record." },
      { status: 500 }
    );
  }
}
