import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/auth-server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isProtectedApiRoute =
    pathname.startsWith("/api/send-email/approved") ||
    pathname.startsWith("/api/send-email/completed") ||
    pathname.startsWith("/api/send-email/secured") ||
    pathname.startsWith("/api/users/role") ||
    pathname.startsWith("/api/loyalty");

  if (isAdminPage || isProtectedApiRoute) {
    const auth = await getAuthContext(request);

    if (!auth.isStaff) {
      if (isAdminPage) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      } else {
        return NextResponse.json(
          { error: "Unauthorized access to protected staff endpoints." },
          { status: 401 }
        );
      }
    }

    if (pathname.startsWith("/api/users/role") && !auth.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Administrator privileges required." },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/send-email/approved",
    "/api/send-email/completed",
    "/api/send-email/secured",
    "/api/users/role",
    "/api/loyalty",
  ],
};
