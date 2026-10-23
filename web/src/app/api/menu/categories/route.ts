import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";
import { requireAdmin } from "@/lib/auth-server";
import { createCategorySchema } from "@/lib/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Prefer service role client for administrative table mutations, fallback to public client
const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : supabase;

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase client is not configured.", categories: [] },
      { status: 503 }
    );
  }

  try {
    const { data: catData, error: catError } = await supabaseAdmin
      .from("menu_categories")
      .select("id, name, created_at")
      .order("created_at", { ascending: true });

    if (catError) {
      console.warn("[Menu Categories GET] Fetch error:", catError.message);
      return NextResponse.json({ error: "Failed to load categories.", categories: [] }, { status: 500 });
    }

    const categories = catData || [];

    // Efficient count query: execute HEAD count per category without downloading all menu_items rows
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat: any) => {
        try {
          const { count, error } = await supabaseAdmin!
            .from("menu_items")
            .select("id", { count: "exact", head: true })
            .ilike("category", cat.name);

          return {
            id: cat.id,
            name: cat.name,
            created_at: cat.created_at,
            itemCount: error ? 0 : (count || 0),
          };
        } catch {
          return {
            id: cat.id,
            name: cat.name,
            created_at: cat.created_at,
            itemCount: 0,
          };
        }
      })
    );

    return NextResponse.json({ categories: categoriesWithCounts });
  } catch (err: any) {
    console.error("[GET /api/menu/categories Exception]:", err);
    return NextResponse.json({ error: "Internal server error.", categories: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const check = await requireAdmin(request);
  if ("response" in check) {
    return check.response;
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Database service unavailable." },
      { status: 503 }
    );
  }

  try {
    const rawBody = await request.json();
    const validation = createCategorySchema.safeParse(rawBody);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid category name.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name } = validation.data;

    const { data, error } = await supabaseAdmin
      .from("menu_categories")
      .upsert({ name }, { onConflict: "name" })
      .select()
      .single();

    if (error) {
      console.error("[Menu Categories POST Error]:", error.message);
      return NextResponse.json({ error: "Failed to save category." }, { status: 400 });
    }

    return NextResponse.json({ success: true, category: data }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/menu/categories Exception]:", err);
    return NextResponse.json({ error: "Internal server error occurred." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const check = await requireAdmin(request);
  if ("response" in check) {
    return check.response;
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Database service unavailable." },
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
        // body might be empty if query string used
      }
    }

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required for deletion." },
        { status: 400 }
      );
    }

    // 1. Check if there are any menu items currently in this category
    const { count, error: countError } = await supabaseAdmin
      .from("menu_items")
      .select("*", { count: "exact", head: true })
      .ilike("category", name);

    if (countError) {
      console.warn("[Menu Categories DELETE] Count check warning:", countError.message);
    } else if (count !== null && count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category "${name}" because it still contains ${count} item${count === 1 ? "" : "s"}.`,
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
      console.error("[Menu Categories DELETE Error]:", error.message);
      return NextResponse.json({ error: "Failed to delete category." }, { status: 400 });
    }

    return NextResponse.json({ success: true, deleted: name }, { status: 200 });
  } catch (err: any) {
    console.error("[DELETE /api/menu/categories Exception]:", err);
    return NextResponse.json({ error: "Internal server error occurred." }, { status: 500 });
  }
}
