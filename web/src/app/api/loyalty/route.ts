import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client with full bypass of RLS
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Helper: check if a string looks like a UUID
const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, userId, stamps, points } = body;

    if (!cardId && !userId) {
      return NextResponse.json({ error: "cardId or userId is required" }, { status: 400 });
    }

    const updateData: Record<string, number> = {};
    if (stamps !== undefined) updateData.stamps = stamps;
    if (points !== undefined) updateData.points = points;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    let data: any = null;
    let error: any = null;

    // Strategy 1: If cardId is a proper AG-format ID (not a UUID), update by loyalty_cards.id
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
      // Use userId if provided, otherwise fall back to treating cardId as a user_id
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
      // Generate a new AG-format card ID
      const newCardId = `AG-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
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
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Loyalty card not found and could not be created. Ensure the member has a valid loyalty card." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
