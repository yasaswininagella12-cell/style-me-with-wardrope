import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;

  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
  const isProtected = nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/wardrobe") ||
    nextUrl.pathname.startsWith("/style") ||
    nextUrl.pathname.startsWith("/jewelry") ||
    nextUrl.pathname.startsWith("/trends") ||
    nextUrl.pathname.startsWith("/looks") ||
    nextUrl.pathname.startsWith("/saved-looks") ||
    nextUrl.pathname.startsWith("/favorites") ||
    nextUrl.pathname.startsWith("/onboarding") ||
    nextUrl.pathname.startsWith("/profile") ||
    nextUrl.pathname.startsWith("/settings") ||
    nextUrl.pathname.startsWith("/admin");

  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(loginUrl);
  }

  return undefined;
});

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/wardrobe/:path*",
    "/style/:path*",
    "/jewelry/:path*",
    "/trends/:path*",
    "/looks/:path*",
    "/saved-looks/:path*",
    "/favorites/:path*",
    "/onboarding",
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};
