export const brandConfig = {
  name: "BiBeck",
  domain: "bibeck.com",
  websiteUrl: "https://bibeck.com",
  emails: {
    primary: "hello@bibeck.com",
    contact: "contact@bibeck.com",
    support: "support@bibeck.com",
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

export const contactMailto = mailto(brandConfig.emails.contact, "BiBeck 官網聯絡");
export const supportMailto = mailto(brandConfig.emails.support, "Bybit 返傭問題");
export const businessMailto = mailto(
  brandConfig.emails.business,
  "申請 Bybit 40%+ 專業合作方案",
  `您好，我想申請 BiBeck Bybit 40%+ 專業合作方案。

身分類型：
個體交易者／專業交易者／代理／合作夥伴

最近 30 日交易量：
主要交易商品：
目前 VIP 等級：
預計合作方式：

其他補充：`,
);
