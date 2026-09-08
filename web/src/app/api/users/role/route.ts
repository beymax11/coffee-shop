import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth-server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

export async function POST(req: NextRequest) {
  const check = await requireAdmin(req);
  if ("response" in check) {
    return check.response;
  }

  try {
    const body = await req.json();
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "userId and newRole are required." },
        { status: 400 }
      );
    }

    const validRoles = ["admin", "barista", "customer"];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: "Invalid role specified." },
        { status: 400 }
      );
    }

    if (supabaseAdmin) {
      // 1. Update profiles table
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (profileError) {
        console.error("Supabase user role update error:", profileError);
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }

      // 2. Also sync auth.users metadata if it's a UUID
      try {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          app_metadata: { role: newRole },
          user_metadata: { role: newRole },
        });
      } catch (authErr) {
        console.warn("Could not sync auth.users metadata:", authErr);
      }

      return NextResponse.json({ success: true, userId, role: newRole });
    } else {
      // Mock mode success
      return NextResponse.json({ success: true, userId, role: newRole, isMock: true });
    }
  } catch (err) {
    console.error("POST /api/users/role error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
