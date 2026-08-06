export const brandConfig = {
  name: "BiBeck",
  domain: "bibeck.com",
  websiteUrl: "https://www.bibeck.com",
  publicEmails: {
    contact: "contact@bibeck.com",
    support: "support@bibeck.com",
  },
  internalEmails: {
    primary: "hello@bibeck.com",
    business: "business@bibeck.com",
    admin: "admin@bibeck.com",
  },
} as const;

export function mailto(email: string, subject?: string, body?: string): string {
  const query = new URLSearchParams();
  if (subject) query.set("subject", subject);
  if (body) query.set("body", body);
  const suffix = query.toString();
  return `mailto:${email}${suffix ? `?${suffix}` : ""}`;
}

export const contactMailto = mailto(brandConfig.publicEmails.contact, "BiBeck 官網聯絡");
export const supportMailto = mailto(brandConfig.publicEmails.support, "BiBeck 返傭支援");
