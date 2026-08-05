import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          }).catch((err) => {
            console.warn("⚠️ Database query failed in login, trying demo credentials fallback.", err.message);
            return null;
          });

          if (user && user.password) {
            const passwordsMatch = await bcrypt.compare(password, user.password);
            if (passwordsMatch) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
              };
            }
          }
        } catch (error) {
          console.error("Authentication authorization error:", error);
        }

        // Demo credentials fallback for local-first testing
        if (email === "admin@restaurant.com" && password === "admin123") {
          return {
            id: "admin_fallback",
            name: "Admin User (Demo)",
            email: "admin@restaurant.com",
            role: "ADMIN",
            phone: "1234567890",
          };
        }
        if (email === "customer@restaurant.com" && password === "customer123") {
          return {
            id: "cust_fallback",
            name: "John Doe (Demo)",
            email: "customer@restaurant.com",
            role: "CUSTOMER",
            phone: "9876543210",
          };
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CUSTOMER";
        token.phone = (user as any).phone || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).phone = token.phone as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "f3ef7892182d8c368d18b8de36e9ff937f2cf19cf2e259e84b8027cf8b6e6c4c",
});
