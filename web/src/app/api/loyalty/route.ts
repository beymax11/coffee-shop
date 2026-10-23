import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-server";
import { patchLoyaltySchema } from "@/lib/validation";
import { generateUniqueLoyaltyCardId } from "@/lib/id-generator";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin client with full bypass of RLS for authorized staff operations
const supabaseAdmin =
  supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

// Helper: check if a string looks like a UUID
const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

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

    // Strategy 3: If still no row found, create a new loyalty_cards entry for this user
    if (!data && userId) {
      const newCardId = await generateUniqueLoyaltyCardId(supabaseAdmin);
      const result = await supabaseAdmin
        .from("loyalty_cards")
        .upsert(
          {
            id: newCardId,
            user_id: userId,
            stamps: updateData.stamps ?? 0,
            points: updateData.points ?? 0,
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();
      data = result.data;
      error = result.error;
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
