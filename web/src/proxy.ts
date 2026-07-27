import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths requiring protection
  const isAdminPage = pathname.startsWith("/admin");
  
  const isEmailAdminRoute = 
    pathname.startsWith("/api/send-email/approved") ||
    pathname.startsWith("/api/send-email/completed") ||
    pathname.startsWith("/api/send-email/secured");

  // Require admin/barista role for admin pages and admin email triggers
  const requiresStaffRole = isAdminPage || isEmailAdminRoute;

  if (requiresStaffRole) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return handleUnauthorized(request, isAdminPage);
    }

    const token = request.cookies.get("sb-access-token")?.value;
    if (!token) {
      return handleUnauthorized(request, isAdminPage);
    }

    // ⚡ STEP 1: FAST-PATH JWT CHECK (0ms Edge Execution)
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);

        // Instant rejection if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          return handleUnauthorized(request, isAdminPage);
        }

        // Instant passthrough if role is present in metadata
        const role =
          payload.app_metadata?.role ||
          payload.user_metadata?.role ||
          payload.role;

        if (role === "admin" || role === "barista") {
          return NextResponse.next();
        }
      }
    } catch {
      // Ignore JWT parsing errors and proceed to fallback Supabase auth check
    }

    // ⚡ STEP 2: FALLBACK SUPABASE AUTHENTICATION
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const activeKey = serviceRoleKey || supabaseAnonKey;
      const supabase = createClient(supabaseUrl, activeKey);

      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) {
        return handleUnauthorized(request, isAdminPage);
      }

      // Check metadata role first from Supabase Auth user object
      const userRole =
        user.app_metadata?.role ||
        user.user_metadata?.role;

      if (userRole === "admin" || userRole === "barista") {
        return NextResponse.next();
      }

      // Single database query fallback to profiles table if metadata lacks role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (
        profileError ||
        !profile ||
        (profile.role !== "admin" && profile.role !== "barista")
      ) {
        return handleUnauthorized(request, isAdminPage);
      }
    } catch (err) {
      console.error("Proxy authentication error:", err);
      return handleUnauthorized(request, isAdminPage);
    }
  }

  return NextResponse.next();
}

function handleUnauthorized(request: NextRequest, isAdminPage: boolean) {
  if (isAdminPage) {
    // Page: redirect to login
    const loginUrl = new URL("/login", request.url);
    // Add redirect parameter to redirect back if needed
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  } else {
    // API: return 401 Unauthorized
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized access to database endpoints" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Config to specify matching paths
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/reservations/:path*",
    "/api/send-email/approved",
    "/api/send-email/completed",
    "/api/send-email/secured",
  ],
};
