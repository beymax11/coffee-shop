import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Prefer service role client for administrative table mutations, fallback to public client
const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : supabase;

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase client is not configured", categories: [] },
      { status: 200 }
    );
  }

  try {
    const { data: catData, error: catError } = await supabaseAdmin
      .from("menu_categories")
      .select("id, name, created_at")
      .order("created_at", { ascending: true });

    if (catError) {
      console.warn("Could not fetch categories from Supabase:", catError.message);
      return NextResponse.json({ error: catError.message, categories: [] }, { status: 200 });
    }

    // Fetch item counts from menu_items table
    const { data: itemsData } = await supabaseAdmin
      .from("menu_items")
      .select("category");

    const countMap: Record<string, number> = {};
    if (itemsData && Array.isArray(itemsData)) {
      itemsData.forEach((it: any) => {
        if (it?.category) {
          const catKey = it.category.trim().toLowerCase();
          countMap[catKey] = (countMap[catKey] || 0) + 1;
        }
      });
    }

    const categoriesWithCounts = (catData || []).map((cat: any) => {
      const norm = (cat.name || "").trim().toLowerCase();
      return {
        id: cat.id,
        name: cat.name,
        created_at: cat.created_at,
        itemCount: countMap[norm] || 0,
      };
    });

    return NextResponse.json({ categories: categoriesWithCounts });
  } catch (err: any) {
    console.error("GET /api/menu/categories unexpected error:", err);
    return NextResponse.json({ error: err.message, categories: [] }, { status: 500 });
  }
}

import { requireAdmin } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  const check = await requireAdmin(request);
  if ("response" in check) {
    return check.response;
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("menu_categories")
      .upsert({ name }, { onConflict: "name" })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert category error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, category: data }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/menu/categories unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const check = await requireAdmin(request);
  if ("response" in check) {
    return check.response;
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  try {
    let name = request.nextUrl.searchParams.get("name")?.trim();

    if (!name) {
      try {
        const body = await request.json();
        name = body?.name?.trim();
      } catch {
        // body might be empty if using search params
      }
    }

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required for deletion" },
        { status: 400 }
      );
    }

    // 1. Check if there are any menu items currently in this category
    const { count, error: countError } = await supabaseAdmin
      .from("menu_items")
      .select("*", { count: "exact", head: true })
      .ilike("category", name);

    if (countError) {
      console.warn("Could not check menu_items count:", countError.message);
    } else if (count !== null && count > 0) {
      return NextResponse.json(
        {
          error: `Hindi maaaring burahin ang category na "${name}" dahil mayroon pa itong ${count} menu item${count === 1 ? "" : "s"}.`,
          itemCount: count,
        },
        { status: 400 }
      );
    }

    // 2. If 0 items, proceed with deletion
    const { error } = await supabaseAdmin
      .from("menu_categories")
      .delete()
      .ilike("name", name);

    if (error) {
      console.error("Supabase delete category error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, deleted: name }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/menu/categories unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
