import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/account", "/checkout"];
const adminPaths = ["/admin"];
const authPages = ["/login", "/signup", "/verify-email", "/request-reset", "/reset-password"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = (req.auth?.user as any)?.isAdmin === true;

  // Redirect logged-in users away from auth pages (exact match only)
  if (isLoggedIn && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect app pages
  if (!isLoggedIn && protectedPaths.some((p) => pathname.startsWith(p))) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Protect admin pages
  if (adminPaths.some((p) => pathname.startsWith(p))) {
    if (!isLoggedIn) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (!isAdmin) return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico).*)"],
};
