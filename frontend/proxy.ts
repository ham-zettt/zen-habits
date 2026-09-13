import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Optimistic routing guard. It only inspects cookie presence, never verifies
 * the token; the Go backend remains the real authorization gate.
 */
export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get("access_token")?.value);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/app") && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/register") && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};
