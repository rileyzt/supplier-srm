import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // 1. Never intercept NextAuth internal API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2. Allow login page without auth
  if (pathname === "/login") {
    // If already authenticated as supplier, redirect to dashboard
    if (user && user.role === "SUPPLIER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 3. Protect all supplier API routes
  if (pathname.startsWith("/api/supplier") || pathname.startsWith("/api/reference-images")) {
    if (!user || user.role !== "SUPPLIER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 4. Protect all portal pages: /, /enquiries, /profile
  if (!user || user.role !== "SUPPLIER") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
