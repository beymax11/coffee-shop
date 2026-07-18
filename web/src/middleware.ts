import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Paths requiring protection
  const isAdminPage = pathname.startsWith("/admin");
  const isApiReservation = pathname.startsWith("/api/reservations");

  // We protect reservations GET and PATCH. Customers POST without authentication.
  const isSecuredApiRoute = isApiReservation && method !== "POST";

  if (isAdminPage || isSecuredApiRoute) {
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

        // Validate user role by checking the profiles table
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
        console.error("Middleware verification error:", err);
        return handleUnauthorized(request, isAdminPage);
      }
    } else {
      // 2. FALLBACK MOCK AUTHENTICATION (if env vars are missing/local mock testing)
      const adminSession = request.cookies.get("admin_session")?.value;
      if (adminSession !== "true") {
        return handleUnauthorized(request, isAdminPage);
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
  matcher: ["/admin/:path*", "/api/reservations/:path*"],
};
