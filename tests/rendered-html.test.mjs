import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", process.pid + "-" + Date.now() + "-" + pathname);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost" + pathname, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function countH1(html) {
  return (html.match(/<h1\b/g) ?? []).length;
}

test("首頁保留 BiBeck 品牌與新的繁體中文導覽", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /BiBeck/);
  assert.match(html, /交易所比較/);
  assert.match(html, /費率計算器/);
  assert.match(html, /返傭說明/);
  assert.match(html, /取得 Bybit 返傭/);
});

test("Bybit 頁包含完整費率、VIP、計算器與返傭 CTA", async () => {
  const response = await render("/platform/bybit");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.equal(countH1(html), 1);
  assert.match(html, /Bybit 交易手續費、VIP 等級與 BiBeck 返傭/);
  assert.match(html, /0\.10%/);
  assert.match(html, /0\.055%/);
  assert.match(html, /VIP 等級與手續費差異/);
  assert.match(html, /計算你的實際交易成本/);
  assert.match(html, /降低你的 Bybit 實際交易成本/);
  assert.match(html, /BreadcrumbList/);
  assert.match(html, /rel="noopener noreferrer sponsored"/);
});

test("Binance 頁包含官方資料、待確認欄位與客觀比較器", async () => {
  const response = await render("/platform/binance");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.equal(countH1(html), 1);
  assert.match(html, /Binance 交易手續費與 VIP 等級/);
  assert.match(html, /BNB 手續費折扣/);
  assert.match(html, /待確認/);
  assert.match(html, /你目前的方案，真的比較省嗎？/);
  assert.match(html, /依照目前輸入條件/);
  assert.match(html, /BreadcrumbList/);
});

test("五個交易所頁共用完整架構且各只有一個 H1", async () => {
  for (const slug of ["bybit", "binance", "bingx", "bitget", "okx"]) {
    const response = await render("/platform/" + slug);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.equal(countH1(html), 1, slug + " should have exactly one H1");
    assert.match(html, /現貨基礎費率/);
    assert.match(html, /合約基礎費率/);
    assert.match(html, /官方資料來源/);
    assert.match(html, /真正要比較的，不只是表面費率/);
    assert.match(html, /獨立第三方交易成本與返傭資訊平台/);
  }
});

test("交易所總覽列出五個平台及服務狀態", async () => {
  const response = await render("/platforms");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.equal(countH1(html), 1);
  for (const name of ["Bybit", "Binance", "BingX", "Bitget", "OKX"]) {
    assert.match(html, new RegExp(name));
  }
  assert.match(html, /返傭服務支援/);
  assert.match(html, /目前僅提供費率資訊/);
});

test("外部網址集中管理，推薦連結具 sponsored 標記", async () => {
  const [links, externalLink, rebate, calculator, styles] = await Promise.all([
    readFile(new URL("../config/links.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/ExternalLink.tsx", import.meta.url), "utf8"),
    readFile(new URL("../config/rebate.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/FeeCalculator.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(links, /BYBIT_REGISTER/);
  assert.match(links, /REBATE_LOGIN/);
  assert.match(links, /BINANCE_FEE_STRUCTURE/);
  assert.match(links, /BINGX_FEE_CENTER/);
  assert.match(links, /BITGET_FEE_GUIDE/);
  assert.match(links, /OKX_FEE_RULES/);
  assert.match(externalLink, /target="_blank"/);
  assert.match(externalLink, /noopener noreferrer sponsored/);
  assert.match(rebate, /BIBECK_BYBIT_REBATE_RATE/);
  assert.doesNotMatch(calculator, /useState\(20\)/);
  assert.match(styles, /@media \(max-width: 479px\)/);
  assert.match(styles, /table-scroll-hint/);
});