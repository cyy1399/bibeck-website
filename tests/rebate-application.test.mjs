import assert from "node:assert/strict";
import test from "node:test";
import { validateRebateActivation } from "../lib/rebate-activation.ts";
import { handleRebateSubmission } from "../lib/rebate-submission-handler.ts";
import { REBATE_CONSENT_VERSION, REBATE_PRIVACY_VERSION } from "../config/rebate-activation.ts";
import { allowApplicationSubmission } from "../lib/submission-rate-limit.ts";

function validForm(overrides = {}) {
  const values = {
    exchange: "bybit",
    displayName: "測試交易者",
    contactEmail: "trader@example.com",
    uid: "12345678",
    volumeRange: "under-10m",
    message: "",
    accuracyConfirmed: "true",
    privacyConsent: "true",
    "cf-turnstile-response": "test-turnstile-token",
    ...overrides,
  };
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

test("原生返傭申請接受有效資料", () => {
  const result = validateRebateActivation(validForm());
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.data.contactEmail, "trader@example.com");
});

test("原生返傭申請拒絕無效 Email", () => {
  const result = validateRebateActivation(validForm({ contactEmail: "invalid" }));
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /Email/);
});

test("原生返傭申請拒絕無效 UID", () => {
  const result = validateRebateActivation(validForm({ uid: "ABC" }));
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /UID/);
});

test("原生返傭申請需要兩項同意", () => {
  for (const field of ["accuracyConfirmed", "privacyConsent"]) {
    const result = validateRebateActivation(validForm({ [field]: "" }));
    assert.equal(result.ok, false);
  }
});

test("原生返傭申請拒絕無效交易量與過長補充說明", () => {
  assert.equal(validateRebateActivation(validForm({ volumeRange: "invalid" })).ok, false);
  assert.equal(validateRebateActivation(validForm({ message: "x".repeat(2_001) })).ok, false);
});

test("同意與隱私權版本使用目前法務版本", () => {
  assert.equal(REBATE_CONSENT_VERSION, "2026-09-16");
  assert.equal(REBATE_PRIVACY_VERSION, "2026-09-16");
});

test("有效提交會建立資料庫案件並標記 Email 結果", async () => {
  let created = 0;
  let marked = 0;
  const result = await handleRebateSubmission(validForm(), "127.0.0.1", {
    validate: validateRebateActivation,
    verifyBot: async () => true,
    createCase: async () => { created += 1; return { kind: "created", caseData: { id: "case-id", caseNumber: "BR-TEST" } }; },
    sendReceipt: async () => {},
    sendAdmin: async () => {},
    markEmail: async () => { marked += 1; },
  });
  assert.equal(result.status, 201);
  assert.equal(result.body.caseNumber, "BR-TEST");
  assert.equal(created, 1);
  assert.equal(marked, 1);
});

test("資料庫失敗不會回傳成功", async () => {
  const result = await handleRebateSubmission(validForm(), null, {
    validate: validateRebateActivation,
    verifyBot: async () => true,
    createCase: async () => { throw new Error("DB_FAILED"); },
    sendReceipt: async () => {},
    sendAdmin: async () => {},
    markEmail: async () => {},
  });
  assert.equal(result.status, 503);
  assert.match(result.body.error, /送出失敗/);
});

test("短期重複提交安全回傳既有案件", async () => {
  const result = await handleRebateSubmission(validForm(), null, {
    validate: validateRebateActivation,
    verifyBot: async () => true,
    createCase: async () => ({ kind: "duplicate", status: "SUBMITTED", caseNumber: "BR-EXISTING" }),
    sendReceipt: async () => { throw new Error("should not send"); },
    sendAdmin: async () => { throw new Error("should not send"); },
    markEmail: async () => { throw new Error("should not mark"); },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.duplicate, true);
  assert.equal(result.body.caseNumber, "BR-EXISTING");
});

test("提交速率限制允許五次並拒絕第六次", () => {
  const key = `test-${Date.now()}`;
  for (let index = 0; index < 5; index += 1) assert.equal(allowApplicationSubmission(key, 1_000), true);
  assert.equal(allowApplicationSubmission(key, 1_000), false);
  assert.equal(allowApplicationSubmission(key, 1_000 + 10 * 60 * 1_000), true);
});
