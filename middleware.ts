import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("wild_session")?.value;

  // Защита /dashboard
  if (pathname.startsWith("/dashboard") && !session) {
    const url = new URL("/auth", req.url);
    return NextResponse.redirect(url);
  }

  // Если залогинен — не даём попасть на /auth (переброс в кабинет)
  if (pathname.startsWith("/auth") && session) {
    const url = new URL("/dashboard", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
