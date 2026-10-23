import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth-server";
import { changeUserRoleSchema } from "@/lib/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

export async function POST(req: NextRequest) {
  const check = await requireAdmin(req);
  if ("response" in check) {
    return check.response;
  }

  try {
    const rawBody = await req.json();

    const validation = changeUserRoleSchema.safeParse(rawBody);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Invalid role change request.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { userId, newRole } = validation.data;

    if (supabaseAdmin) {
      // 1. Update profiles table
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (profileError) {
        console.error("[Users/Role POST Error]:", profileError.message);
        return NextResponse.json({ error: "Failed to update profile role in database." }, { status: 500 });
      }

      // 2. Also sync auth.users metadata if it's a UUID
      try {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          app_metadata: { role: newRole },
          user_metadata: { role: newRole },
        });
      } catch (authErr) {
        console.warn("[Users/Role POST] Could not sync auth.users metadata:", authErr);
      }

      return NextResponse.json({ success: true, userId, role: newRole });
    } else {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Database service unavailable." }, { status: 503 });
      }
      return NextResponse.json({ success: true, userId, role: newRole, isMock: true });
    }
  } catch (err) {
    console.error("[POST /api/users/role Exception]:", err);
    return NextResponse.json({ error: "Internal server error occurred." }, { status: 500 });
  }
}
