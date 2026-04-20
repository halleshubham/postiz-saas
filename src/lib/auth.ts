import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        if (!user.emailVerified) return null;

        const { verifyPassword } = await import("./auth-helpers");
        const valid = await verifyPassword(password, user.hashedPassword);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.username ?? user.email, isAdmin: user.isAdmin, emailVerified: user.emailVerified };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
        token.emailVerified = (user as any).emailVerified;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
});
