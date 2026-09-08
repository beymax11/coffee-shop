import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/auth-server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isProtectedEmailRoute =
    pathname.startsWith("/api/send-email/approved") ||
    pathname.startsWith("/api/send-email/completed") ||
    pathname.startsWith("/api/send-email/secured");

  if (isAdminPage || isProtectedEmailRoute) {
    const auth = await getAuthContext(request);

    if (!auth.isStaff) {
      if (isAdminPage) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      } else {
        return NextResponse.json(
          { error: "Unauthorized access to protected resource" },
          { status: 401 }
        );
      }
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
  ],
};
