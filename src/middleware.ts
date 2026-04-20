import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/account", "/checkout"];
const adminPaths = ["/admin"];
const authPaths = ["/login", "/signup", "/verify-email", "/request-reset", "/reset-password"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = (req.auth?.user as any)?.isAdmin === true;

  if (authPaths.some((p) => pathname.startsWith(p)) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (protectedPaths.some((p) => pathname.startsWith(p)) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (adminPaths.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (!isAdmin) return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
