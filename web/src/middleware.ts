import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Paths requiring protection
  const isAdminPage = pathname.startsWith("/admin");
  const isApiReservationList = pathname === "/api/reservations";
  const isApiReservationDetail = pathname.startsWith("/api/reservations/") && pathname !== "/api/reservations";
  
  const isEmailAdminRoute = 
    pathname.startsWith("/api/send-email/approved") ||
    pathname.startsWith("/api/send-email/completed") ||
    pathname.startsWith("/api/send-email/secured");

  // Require admin/barista role for admin pages, reservation list, and admin email triggers
  const requiresStaffRole = isAdminPage || (isApiReservationList && method === "GET") || isEmailAdminRoute;

  // Require at least a valid authenticated user session (staff or customer) for reservation details
  const requiresAuthenticatedSession = isApiReservationDetail && (method === "GET" || method === "PATCH");

  if (requiresStaffRole || requiresAuthenticatedSession) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. REAL SUPABASE AUTHENTICATION
    if (supabaseUrl && supabaseAnonKey) {
      const token = request.cookies.get("sb-access-token")?.value;

      if (!token) {
        return handleUnauthorized(request, isAdminPage);
      }

      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
          return handleUnauthorized(request, isAdminPage);
        }

        // For staff-only routes, validate user role by checking the profiles table
        if (requiresStaffRole) {
          let profile = null;
          let profileError = null;

          const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (serviceRoleKey) {
            const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
            const { data, error } = await supabaseAdmin
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();
            profile = data;
            profileError = error;
          } else {
            const { data, error } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();
            profile = data;
            profileError = error;
          }

          if (
            profileError ||
            !profile ||
            (profile.role !== "admin" && profile.role !== "barista")
          ) {
            return handleUnauthorized(request, isAdminPage);
          }
        }
      } catch (err) {
        console.error("Middleware verification error:", err);
        return handleUnauthorized(request, isAdminPage);
      }
    } else {
      // 2. FALLBACK MOCK AUTHENTICATION (if env vars are missing/local mock testing)
      if (requiresStaffRole) {
        const adminSession = request.cookies.get("admin_session")?.value;
        if (adminSession !== "true") {
          return handleUnauthorized(request, isAdminPage);
        }
      }
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
