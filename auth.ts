import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export function adminAllowlist(): Set<string> { return new Set((process.env.ADMIN_EMAIL_ALLOWLIST || "hello@bibeck.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean)); }
export function isAllowedAdmin(email: string | null | undefined): boolean { return Boolean(email && adminAllowlist().has(email.toLowerCase())); }

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [Google],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  callbacks: {
    async signIn({ user, profile }) { const email = user.email || profile?.email; return isAllowedAdmin(email); },
    async authorized({ auth: session }) { return isAllowedAdmin(session?.user?.email); },
  },
});
