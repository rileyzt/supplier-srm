import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "./auth.config";
import type { UserRole } from "./auth.config";

export { authConfig };

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;

        // Development-only mock credentials strictly gated behind development mode & no DATABASE_URL
        const isDevMockAllowed =
          process.env.NODE_ENV === "development" && !process.env.DATABASE_URL;

        if (isDevMockAllowed) {
          if (email === "supplier@apexjerseys.com" && password === "Supplier@2026") {
            return {
              id: "usr_supplier_apex",
              email: "supplier@apexjerseys.com",
              name: "Li Wei (Apex)",
              role: "SUPPLIER" as UserRole,
              supplierId: "sup_apex",
            };
          }
        }

        // Production and live environments authenticate EXCLUSIVELY against database
        try {
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              supplierId: true,
              passwordHash: true,
              isActive: true,
            },
          });

          // STRICT SUPPLIER AUTHORIZATION: Admin or inactive users CANNOT log into supplier portal
          if (!user || !user.isActive || user.role !== "SUPPLIER" || !user.supplierId) {
            return null;
          }

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            return null;
          }

          // Strips passwordHash completely
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            supplierId: user.supplierId,
          };
        } catch (dbErr) {
          console.error("Supplier database authentication query failed:", dbErr instanceof Error ? dbErr.message : "DB error");
          return null;
        }
      },
    }),
  ],
});
