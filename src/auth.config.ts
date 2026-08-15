import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnPublic =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register") ||
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/about") ||
        nextUrl.pathname.startsWith("/how-it-works") ||
        nextUrl.pathname.startsWith("/trending") ||
        nextUrl.pathname.startsWith("/api");
      if (isOnPublic) return true;
      if (isLoggedIn) return true;
      return false;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "user";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
