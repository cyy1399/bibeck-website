import type { OAuthConfig } from "next-auth/providers";

export type GoogleAdminProfile = {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
};

type GoogleAdminCredentials = {
  clientId?: string;
  clientSecret?: string;
};

export function googleAdminProvider(
  credentials: GoogleAdminCredentials = {
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  },
): OAuthConfig<GoogleAdminProfile> {
  return {
    id: "google",
    name: "Google",
    type: "oauth",
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
    issuer: "https://accounts.google.com",
    authorization: {
      url: "https://accounts.google.com/o/oauth2/v2/auth",
      params: { scope: "openid email profile", prompt: "select_account" },
    },
    token: "https://oauth2.googleapis.com/token",
    userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
    checks: ["pkce", "state"],
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      };
    },
    style: { brandColor: "#1a73e8" },
  };
}
