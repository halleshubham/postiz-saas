import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/account", "/checkout"];
const adminPaths = ["/admin"];
const authPaths = ["/login", "/signup", "/verify-email", "/request-reset", "/reset-password"];

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  const { pathname } = req.nextUrl;
  const isLoggedIn = !!token;
  const isAdmin = (token as any)?.isAdmin === true;

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && authPaths.some((p) => pathname === p || pathname.startsWith(p + "?"))) {
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
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico).*)"],
};
