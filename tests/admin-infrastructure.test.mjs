import assert from "node:assert/strict";
import test from "node:test";
import { googleAdminProvider } from "../lib/google-admin-provider.ts";
import { isDatabaseConfigured } from "../lib/database-config.ts";

test("Google 管理員 OAuth 使用明確端點並保留 PKCE 與 state", () => {
  const provider = googleAdminProvider({ clientId: "client-id", clientSecret: "client-secret" });
  assert.equal(provider.type, "oauth");
  assert.equal(provider.issuer, "https://accounts.google.com");
  assert.equal(provider.authorization.url, "https://accounts.google.com/o/oauth2/v2/auth");
  assert.equal(provider.token, "https://oauth2.googleapis.com/token");
  assert.equal(provider.userinfo, "https://openidconnect.googleapis.com/v1/userinfo");
  assert.deepEqual(provider.checks, ["pkce", "state"]);
});

test("Google profile 只映射登入所需欄位", async () => {
  const provider = googleAdminProvider();
  const user = await provider.profile({
    sub: "google-user",
    name: "BiBeck Admin",
    email: "hello@bibeck.com",
    email_verified: true,
    picture: "https://example.com/avatar.png",
  }, {});
  assert.deepEqual(user, {
    id: "google-user",
    name: "BiBeck Admin",
    email: "hello@bibeck.com",
    image: "https://example.com/avatar.png",
  });
});

test("資料庫設定檢查拒絕空白 DATABASE_URL", () => {
  const original = process.env.DATABASE_URL;
  try {
    process.env.DATABASE_URL = "   ";
    assert.equal(isDatabaseConfigured(), false);
    process.env.DATABASE_URL = "postgresql://example";
    assert.equal(isDatabaseConfigured(), true);
  } finally {
    if (original === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = original;
  }
});
