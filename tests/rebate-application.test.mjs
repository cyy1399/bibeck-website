import assert from "node:assert/strict";
import test from "node:test";
import { validateRebateActivation } from "../lib/rebate-activation.ts";
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

test("提交速率限制允許五次並拒絕第六次", () => {
  const key = `test-${Date.now()}`;
  for (let index = 0; index < 5; index += 1) assert.equal(allowApplicationSubmission(key, 1_000), true);
  assert.equal(allowApplicationSubmission(key, 1_000), false);
  assert.equal(allowApplicationSubmission(key, 1_000 + 10 * 60 * 1_000), true);
});
