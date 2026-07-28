import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

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

test("以繁體中文呈現 BiBeck 首頁", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /降低每一筆交易成本。/);
  assert.match(html, /交易成本優化與手續費返傭平台/);
  assert.match(html, /計算可節省費用/);
  assert.match(html, /BiBeck 為獨立第三方平台/);
  assert.doesNotMatch(html, /Pay Less on Every Trade|Get Rebate|Rebate Dashboard/);
});

test("Bybit 平台頁包含官方費率摘要與整合返傭流程", async () => {
  const response = await render("/platform/bybit");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /Bybit 手續費與返傭/);
  assert.match(html, /0\.1000%/);
  assert.match(html, /0\.0550%/);
  assert.match(html, /0\.0200%/);
  assert.match(html, /資金費用 = 倉位價值 × 資金費率/);
  assert.match(html, /透過 Bybit 註冊/);
});

test("平台總覽列出五個交易所與清楚的返傭支援狀態", async () => {
  const response = await render("/platform");
  assert.equal(response.status, 200);
  const html = await response.text();

  for (const name of ["Bybit", "Binance", "BingX", "Bitget", "OKX"]) {
    assert.match(html, new RegExp(name));
  }
  assert.match(html, /返傭服務支援/);
  assert.match(html, /資訊整理/);
  assert.match(html, /目前只有 Bybit 提供 BiBeck 返傭服務/);
});

test("未合作平台頁清楚標示僅提供資訊", async () => {
  for (const pathname of ["/platform/binance", "/platform/bingx", "/platform/bitget", "/platform/okx"]) {
    const response = await render(pathname);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /BiBeck 目前尚未提供 .* 返傭/);
    assert.match(html, /不代表 BiBeck 與 .* 存在合作/);
    assert.match(html, /計算交易成本/);
  }
});

test("外部網址集中管理並安全開啟", async () => {
  const [links, externalLink, homepage, platform, faq] = await Promise.all([
    readFile(new URL("../config/links.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/ExternalLink.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/platform/bybit/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/faq/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(links, /BYBIT_REGISTER/);
  assert.match(links, /REBATE_LOGIN/);
  assert.match(links, /BYBIT_FEE_STRUCTURE/);
  assert.match(links, /BYBIT_MAKER_TAKER/);
  assert.match(links, /BYBIT_FUNDING_FEE/);
  assert.match(links, /BINANCE_FEE_STRUCTURE/);
  assert.match(links, /BINGX_FEE_CENTER/);
  assert.match(links, /BITGET_FEE_GUIDE/);
  assert.match(links, /OKX_FEE_RULES/);
  assert.match(externalLink, /target="_blank"/);
  assert.match(externalLink, /rel="noopener noreferrer"/);
  assert.doesNotMatch(homepage + platform + faq, /https:\/\//);
  const previewFiles = await readdir(new URL("app/_sites-preview", projectRoot));
  assert.deepEqual(previewFiles, []);
});