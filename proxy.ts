import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/appwrite/config";

/**
 * Optimistic auth guard (Next 16 Proxy, formerly Middleware). It only checks for
 * the *presence* of the Appwrite session cookie — the authoritative validity
 * check stays in the data layer (`getLoggedInUser`). This closes the gap where a
 * request to a missing/protected route 404s before any per-route redirect runs,
 * leaving an invalid session stuck in the dashboard.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = pathname.startsWith("/auth") || pathname === "/onboarding";
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/onboarding", "/login", "/signup"],
};
