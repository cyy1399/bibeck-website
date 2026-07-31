import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createCaseNumber, createTrackingToken, hashTrackingToken, maskEmail, maskUid, validateRebateActivation, verifyTurnstile } from "../lib/rebate-activation.ts";
import { statusTransitions } from "../config/rebate-activation.ts";
import { sendActivationReceived, sendActivationStatusEmail } from "../lib/rebate-email.ts";

function validForm(overrides = {}) {
  const form = new FormData();
  const values = { exchange: "bybit", displayName: "測試使用者", contactEmail: "user@example.com", uid: " 211762922 ", registrationDate: "2026-07-30", accountScenario: "new", kycStatus: "completed", consent: "true", "cf-turnstile-response": "test-turnstile-token", ...overrides };
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

test("validates and normalizes a standard activation request", () => {
  const result = validateRebateActivation(validForm(), new Date("2026-08-01T12:00:00Z"));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.uid, "211762922");
    assert.equal(result.data.contactEmail, "user@example.com");
    assert.equal(result.data.preReviewCaseNumber, null);
  }
});

test("rejects nonnumeric UID, invalid email, missing consent and future registration date", () => {
  assert.equal(validateRebateActivation(validForm({ uid: "-12.5" })).ok, false);
  assert.equal(validateRebateActivation(validForm({ contactEmail: "invalid" })).ok, false);
  assert.equal(validateRebateActivation(validForm({ consent: "false" })).ok, false);
  assert.equal(validateRebateActivation(validForm({ registrationDate: "2099-01-01" }), new Date("2026-08-01T12:00:00Z")).ok, false);
});

test("Turnstile fails closed when provider rejects verification", async () => {
  const previous = process.env.TURNSTILE_SECRET_KEY;
  process.env.TURNSTILE_SECRET_KEY = "secret";
  try {
    assert.equal(await verifyTurnstile("bad-token", null, async () => new Response(JSON.stringify({ success: false }), { status: 200 })), false);
  } finally {
    if (previous === undefined) delete process.env.TURNSTILE_SECRET_KEY; else process.env.TURNSTILE_SECRET_KEY = previous;
  }
});

test("case numbers and 256-bit tracking tokens are non-sequential and unique", () => {
  const cases = new Set(Array.from({ length: 500 }, () => createCaseNumber("BB", new Date("2026-08-01T00:00:00Z"))));
  const tokens = new Set(Array.from({ length: 500 }, () => createTrackingToken()));
  assert.equal(cases.size, 500);
  assert.equal(tokens.size, 500);
  assert.match([...cases][0], /^BB-20260801-[A-Z0-9_-]{7}$/);
  for (const token of tokens) assert.ok(Buffer.from(token, "base64url").byteLength >= 32);
  const token = [...tokens][0];
  assert.notEqual(hashTrackingToken(token), token);
  assert.equal(hashTrackingToken(token).length, 64);
});

test("status transitions protect completed cases and include required manual flow", () => {
  assert.deepEqual(statusTransitions.SUBMITTED, ["UID_PENDING", "NEEDS_INFORMATION", "NOT_ATTRIBUTED", "CANCELLED"]);
  assert.ok(statusTransitions.UID_PENDING.includes("PENDING_MANUAL_SETUP"));
  assert.ok(statusTransitions.PENDING_MANUAL_SETUP.includes("COMPLETED"));
  assert.deepEqual(statusTransitions.COMPLETED, []);
});

test("public masking does not expose full UID or email", () => {
  assert.equal(maskUid("211762922"), "21****22");
  assert.equal(maskEmail("example@gmail.com"), "e***e@gmail.com");
});

test("emails include non-guarantee copy and only use the provider abstraction", async () => {
  const sent = [];
  const previous = process.env.EMAIL_PROVIDER_API_KEY;
  process.env.EMAIL_PROVIDER_API_KEY = "test";
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => { sent.push(JSON.parse(init.body)); return new Response("{}", { status: 200 }); };
  const now = new Date("2026-08-01T00:00:00Z");
  const caseData = { id: "id", caseNumber: "BB-20260801-ABCDE12", exchange: "bybit", uid: "211762922", normalizedUid: "211762922", displayName: "測試", contactEmail: "user@example.com", normalizedEmail: "user@example.com", registrationDate: now, accountScenario: "new", kycStatus: "completed", messagingContact: null, preReviewCaseNumber: null, userNote: null, status: "COMPLETED", defaultRate: 20, approvedRate: 20, effectiveAt: now, externalSetupConfirmed: true, adminNote: null, publicMessage: null, trackingTokenHash: "hash", consentVersion: "v1", consentedAt: now, createdAt: now, updatedAt: now, completedAt: now, notificationError: null, source: "test", utmSource: null, utmMedium: null, utmCampaign: null };
  try {
    await sendActivationReceived(caseData, "token");
    await sendActivationStatusEmail(caseData, "token", "COMPLETED");
  } finally {
    globalThis.fetch = previousFetch;
    if (previous === undefined) delete process.env.EMAIL_PROVIDER_API_KEY; else process.env.EMAIL_PROVIDER_API_KEY = previous;
  }
  assert.equal(sent.length, 2);
  assert.match(sent[0].html, /不代表返傭已完成設定/);
  assert.match(sent[1].html, /仍以 Bybit/);
});

test("schema and protected pages enforce token hashing, uniqueness, audit and noindex", async () => {
  const [schema, statusPage, adminPage, activationPage] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/rebate/status/[token]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/rebate-applications/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/rebate/activate/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(schema, /trackingTokenHash/);
  assert.doesNotMatch(schema, /trackingToken:\s*text/);
  assert.match(schema, /rebate_activation_active_uid_unique/);
  assert.match(schema, /rebateCaseEvents/);
  assert.match(statusPage, /index: false, follow: false/);
  assert.match(statusPage, /maskUid/);
  assert.match(statusPage, /maskEmail/);
  assert.match(adminPage, /requireAdmin/);
  assert.match(activationPage, /index: false, follow: false/);
});

test("site entry points include registration, UID activation, and dashboard actions", async () => {
  const source = await readFile(new URL("../components/ExchangeActionButtons.tsx", import.meta.url), "utf8");
  assert.match(source, /取得.*返傭帳號|rebateSignup/);
  assert.match(source, /已完成註冊，提交 UID/);
  assert.match(source, /rebateDashboard/);
});
