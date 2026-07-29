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
  assert.match(html, /交易所/);
  assert.match(html, /交易成本計算器/);
  assert.doesNotMatch(html, /Bybit 交易成本計算器/);
  assert.match(html, /即將開放/);
  assert.match(html, /計算真實的交易成本/);
  assert.match(html, /一般狀況/);
  assert.match(html, /VIP \+ BiBeck 返傭/);
  assert.match(html, /返傭說明/);
  assert.match(html, /取得 Bybit 返傭帳號/);
  assert.match(html, /登入 Bybit 返傭後台/);
  assert.match(html, /aria-haspopup="menu"/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /Hyperliquid|標準會員|官方 VIP|比較真正的交易成本/);
  assert.doesNotMatch(html, /比較真實的交易成本|手續費累積得比想像更快|取回部分交易手續費|已有 Bybit 帳戶還能綁定嗎？|返傭多久發放？|在哪裡查看返傭？/);
  assert.match(html, /BiBeck 是交易所的官方網站嗎？/);
  assert.match(html, /使用 BiBeck 需要額外付費嗎？/);
  assert.equal((html.match(/class="faq-item group"/g) ?? []).length, 5);
});

test("首頁與 Bybit Hero 使用三個集中式核心按鈕", async () => {
  for (const pathname of ["/", "/platform/bybit"]) {
    const response = await render(pathname);
    const html = await response.text();
    assert.match(html, /取得 Bybit 返傭帳號/);
    assert.match(html, /登入 Bybit 返傭後台/);
    assert.match(html, /交易成本計算器/);
    assert.match(html, /https:\/\/partner\.bybit\.com\/b\/t00000016/);
    assert.match(html, /https:\/\/bybackoffice\.com\/user-login/);
    assert.match(html, /#trading-cost-calculator/);
  }
});

test("未支援返傭的交易所 Hero 不會導向 Bybit", async () => {
  for (const [slug, name] of [["binance", "Binance"], ["bingx", "BingX"], ["bitget", "Bitget"], ["okx", "OKX"]]) {
    const response = await render("/platform/" + slug);
    const html = await response.text();
    const hero = html.split('<section class="exchange-hero')[1].split("</section>")[0];
    assert.match(hero, new RegExp("取得 " + name + " 返傭帳號"));
    assert.match(hero, new RegExp("登入 " + name + " 返傭後台"));
    assert.match(hero, /交易成本計算器/);
    assert.doesNotMatch(hero, new RegExp(name + " 交易成本計算器"));
    assert.match(hero, /disabled/);
    assert.doesNotMatch(hero, /partner\.bybit\.com|bybackoffice\.com/);
  }
});

test("核心按鈕文案與交易所連結集中管理", async () => {
  const [actions, shell, exchangePage] = await Promise.all([
    readFile(new URL("../config/actions.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/SiteShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ExchangePlatformPage.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(actions, /取得 \$\{exchange\.name\} 返傭帳號/);
  assert.match(actions, /登入 \$\{exchange\.name\} 返傭後台/);
  assert.match(actions, /costCalculator: "交易成本計算器"/);
  assert.match(shell, /bybitActionLabels/);
  assert.match(exchangePage, /ExchangeActionButtons/);
});

test("桌面交易所選單沒有 hover 事件並具備外部點擊與 Escape 清理", async () => {
  const source = await readFile(new URL("../components/DesktopExchangeMenu.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /onMouseEnter|onMouseLeave|group-hover|peer-hover/);
  assert.match(source, /pointerdown/);
  assert.match(source, /Escape/);
  assert.match(source, /removeEventListener/);
  assert.match(source, /onClick=\{closeMenu\}/);
  assert.match(source, /aria-controls="exchange-comparison-menu"/);
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
  assert.match(html, /已有 Bybit 帳戶，如何使用 BiBeck 返傭？/);
  assert.match(html, /如何確認 Bybit 返傭帳戶是否成功綁定？/);
  assert.match(html, /接收身分驗證的目標帳戶必須保持未認證狀態/);
  assert.match(html, /How-to-Transfer-Your-Identity-to-Another-Account/);
  assert.match(html, /BreadcrumbList/);
  assert.match(html, /rel="noopener noreferrer sponsored"/);
});

test("完整 FAQ 只保留跨交易所通用問題", async () => {
  const response = await render("/faq");
  const html = await response.text();
  assert.match(html, /通用問題/);
  assert.match(html, /BiBeck 是交易所的官方網站嗎？/);
  assert.match(html, /為什麼 BiBeck 可以提供返傭？/);
  assert.match(html, /BiBeck 會提供投資建議嗎？/);
  assert.match(html, /為什麼有些帳戶需要重新註冊？/);
  assert.equal((html.match(/class="faq-item group"/g) ?? []).length, 10);
  assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /href="\/calculator"/);
  assert.doesNotMatch(html, /Bybit 專屬問題|已有 Bybit 帳戶，如何使用 BiBeck 返傭？|如何確認 Bybit 返傭帳戶是否成功綁定？|Bybit 身分驗證可以轉移嗎？|在哪裡登入 Bybit 返傭後台？/);
});

test("公開頁面只顯示 contact 與 support 信箱", async () => {
  for (const pathname of ["/", "/contact", "/faq", "/platform/bybit"]) {
    const response = await render(pathname);
    const html = await response.text();
    assert.match(html, /contact@bibeck\.com/);
    assert.match(html, /support@bibeck\.com/);
    assert.doesNotMatch(html, /business@bibeck\.com|admin@bibeck\.com|hello@bibeck\.com/);
  }
});

test("共用 CTA 樣式避免中文逐字斷行並涵蓋手機寬度", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\.cta-button/);
  assert.match(styles, /white-space:\s*nowrap/);
  assert.match(styles, /word-break:\s*keep-all/);
  assert.match(styles, /@media \(max-width: 639px\)/);
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
