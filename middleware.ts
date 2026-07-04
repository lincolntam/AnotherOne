import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/home", "/profile", "/categories", "/websites", "/settings", "/passcode", "/secret"];
const authCookie = process.env.SESSION_COOKIE_NAME || "ao_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(authCookie)?.value);
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (pathname === "/") {
    return NextResponse.redirect(new URL(hasSession ? "/home" : "/login", request.url));
  }

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/home/:path*", "/profile/:path*", "/categories/:path*", "/websites/:path*", "/settings/:path*", "/passcode/:path*", "/secret/:path*"]
};
