import assert from "node:assert/strict";
import test from "node:test";
import { applicationUploadPolicy, bybitVipOptions, highVolumeApplicationExchanges, requestedRebateOptions } from "../config/high-volume-application.ts";
import { validateAttachments, validateHighVolumeApplication } from "../lib/high-volume-application.ts";
import { sendHighVolumeApplicationEmail } from "../lib/high-volume-email.ts";

const signatures = {
  "image/jpeg": [0xff, 0xd8, 0xff, 0x00],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/webp": [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50],
  "application/pdf": [0x25, 0x50, 0x44, 0x46, 0x2d],
};

function proof(type = "image/jpeg", name = "proof.jpg", extraSize = 0) {
  return new File([new Uint8Array(signatures[type]), new Uint8Array(extraSize)], name, { type });
}

function validForm(exchangeId = "bybit") {
  const form = new FormData();
  Object.entries({ name: "王先生", email: "trader@example.com", exchangeId, applicantType: "專業交易者", volume30d: "12500000", volume90dAverage: "10000000", expectedMonthlyVolume: "15000000", product: "USDT 永續", vipLevel: "vip2", requestedRebate: "30", legalConsent: "true", dataConsent: "true", privacyConfirmed: "true" }).forEach(([key, value]) => form.set(key, value));
  form.append("attachments", proof());
  return form;
}

test("只有 Bybit 開放申請且期望比例不含 20%", () => {
  assert.deepEqual(highVolumeApplicationExchanges.filter((item) => item.applicationEnabled).map((item) => item.id), ["bybit"]);
  assert.ok(bybitVipOptions.length === 8);
  assert.ok(!requestedRebateOptions.some((option) => option.rate === 20));
});

test("後端拒絕偽造的其他交易所", async () => {
  const result = await validateHighVolumeApplication(validForm("binance"));
  assert.equal(result.ok, false);
});

for (const [type, name] of [["image/jpeg", "proof.jpg"], ["image/png", "proof.png"], ["image/webp", "proof.webp"], ["application/pdf", "proof.pdf"]]) {
  test(`接受 ${type}`, async () => assert.ok(Array.isArray(await validateAttachments([proof(type, name)]))));
}

test("拒絕不支援格式、超大單檔、超過五個檔案與總大小超限", async () => {
  assert.equal(await validateAttachments([new File(["text"], "proof.txt", { type: "text/plain" })]), "此檔案格式不支援。");
  assert.equal(await validateAttachments([proof("image/jpeg", "large.jpg", applicationUploadPolicy.maxFileSizeBytes)]), "單一檔案不可超過 8 MB。");
  assert.equal(await validateAttachments(Array.from({ length: 6 }, (_, index) => proof("image/jpeg", `${index}.jpg`))), "最多只能上傳 5 個檔案。");
  assert.equal(await validateAttachments([proof("image/jpeg", "a.jpg", 7 * 1024 * 1024), proof("image/jpeg", "b.jpg", 7 * 1024 * 1024), proof("image/jpeg", "c.jpg", 7 * 1024 * 1024)]), "所有附件合計不可超過 20 MB。");
});

test("未上傳證明或未勾選聲明不可送出，後端保留純數字", async () => {
  const noFile = validForm(); noFile.delete("attachments");
  assert.equal((await validateHighVolumeApplication(noFile)).ok, false);
  const noConsent = validForm(); noConsent.delete("dataConsent");
  assert.equal((await validateHighVolumeApplication(noConsent)).ok, false);
  const valid = await validateHighVolumeApplication(validForm());
  assert.equal(valid.ok && valid.data.volume30d, 12500000);
});

test("寄送資料含真正附件，Provider 失敗會拋出錯誤", async () => {
  const result = await validateHighVolumeApplication(validForm());
  assert.equal(result.ok, true);
  const originalKey = process.env.EMAIL_PROVIDER_API_KEY; process.env.EMAIL_PROVIDER_API_KEY = "test-key";
  let payload;
  const baseRequest = { applicationId: "HV-20260729-ABCD", submittedAt: "2026-07-29T00:00:00.000Z", userAgent: "test", data: result.data, attachments: result.attachments };
  await sendHighVolumeApplicationEmail(baseRequest, async (_url, init) => { payload = JSON.parse(init.body); return new Response("{}", { status: 200 }); });
  assert.equal(payload.attachments.length, 1); assert.ok(payload.attachments[0].content.length > 0);
  await assert.rejects(sendHighVolumeApplicationEmail(baseRequest, async () => new Response("failed", { status: 500 })));
  if (originalKey === undefined) delete process.env.EMAIL_PROVIDER_API_KEY; else process.env.EMAIL_PROVIDER_API_KEY = originalKey;
});
