import NextAuth from "next-auth";
import { googleAdminProvider, type GoogleAdminProfile } from "@/lib/google-admin-provider";

export function adminAllowlist(): Set<string> { return new Set((process.env.ADMIN_EMAIL_ALLOWLIST || "hello@bibeck.com").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean)); }
export function isAllowedAdmin(email: string | null | undefined): boolean { return Boolean(email && adminAllowlist().has(email.toLowerCase())); }

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [googleAdminProvider()],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  callbacks: {
    async signIn({ user, profile }) {
      const googleProfile = profile as GoogleAdminProfile | undefined;
      const email = user.email || googleProfile?.email;
      return googleProfile?.email_verified === true && isAllowedAdmin(email);
    },
    async authorized({ auth: session }) { return isAllowedAdmin(session?.user?.email); },
  },
});
