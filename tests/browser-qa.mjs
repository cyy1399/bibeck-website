import { chromium } from "file:///C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const baseUrl = "http://127.0.0.1:4173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const findings = { consoleErrors: [], pageErrors: [], checks: [] };

function observe(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") findings.consoleErrors.push(label + ": " + message.text());
  });
  page.on("pageerror", (error) => findings.pageErrors.push(label + ": " + error.message));
}

function check(condition, message) {
  if (!condition) throw new Error(message);
  findings.checks.push(message);
}

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
observe(desktop, "desktop-bybit");
await desktop.goto(baseUrl + "/platform/bybit", { waitUntil: "networkidle" });
check(await desktop.getByRole("heading", { level: 1, name: /Bybit 交易手續費/ }).isVisible(), "desktop Bybit H1 visible");
check((await desktop.locator("h1").count()) === 1, "desktop Bybit has one H1");
check(await desktop.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), "desktop has no page-level horizontal overflow");
await desktop.locator("details.platform-menu > summary").click();
const desktopMenuBox = await desktop.locator(".platform-menu-panel").boundingBox();
check(Boolean(desktopMenuBox && desktopMenuBox.x >= 0 && desktopMenuBox.x + desktopMenuBox.width <= 1440), "desktop exchange dropdown stays in viewport");
await desktop.locator("#calculator").scrollIntoViewIfNeeded();
await desktop.getByLabel("每月交易量").fill("100000");
await desktop.getByLabel("手續費率").fill("0.055");
await desktop.getByLabel("BiBeck 返傭比例").fill("20");
check(await desktop.getByText("US$44.00", { exact: true }).first().isVisible(), "desktop calculator converts 0.055% and 20% rebate to US$44.00 monthly cost");
await desktop.screenshot({ path: "outputs/qa-bybit-desktop.png", fullPage: true });

const mobile = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
observe(mobile, "mobile-binance");
await mobile.goto(baseUrl + "/platform/binance", { waitUntil: "networkidle" });
check(await mobile.getByRole("heading", { level: 1, name: /Binance 交易手續費/ }).isVisible(), "375px Binance H1 visible");
check((await mobile.locator("h1").count()) === 1, "375px Binance has one H1");
check(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), "375px page has no horizontal overflow");
await mobile.getByLabel("開啟導覽選單").click();
const mobileMenuBox = await mobile.locator("nav[aria-label='行動版導覽']").boundingBox();
check(Boolean(mobileMenuBox && mobileMenuBox.x >= 0 && mobileMenuBox.x + mobileMenuBox.width <= 375), "375px platform menu stays in viewport");
await mobile.getByLabel("開啟導覽選單").click();
const heroPrimary = mobile.locator(".exchange-hero .button-primary");
const heroPrimaryBox = await heroPrimary.boundingBox();
const heroActionsBox = await heroPrimary.locator("..").boundingBox();
check(Boolean(heroPrimaryBox && heroActionsBox && heroPrimaryBox.width >= heroActionsBox.width - 1), "375px hero CTA expands to the full available content width: button=" + JSON.stringify(heroPrimaryBox) + " container=" + JSON.stringify(heroActionsBox));
await mobile.locator("#fees").scrollIntoViewIfNeeded();
const scrollState = await mobile.locator("#fees .table-scroll-shell").evaluate((element) => ({ scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }));
check(scrollState.scrollWidth > scrollState.clientWidth, "375px fee table uses a horizontal scroll container");
check(await mobile.locator("#fees .table-scroll-hint").isVisible(), "375px fee table displays a swipe hint");
await mobile.locator("#comparison").scrollIntoViewIfNeeded();
await mobile.getByLabel("目前手續費率").fill("0.01");
await mobile.getByLabel("目前返傭比例").fill("0");
await mobile.getByLabel("Bybit 手續費率").fill("0.055");
await mobile.getByLabel("BiBeck 返傭比例").fill("0");
check(await mobile.getByText(/你目前的方案成本較低/).isVisible(), "comparison reports current plan when it is cheaper");
await mobile.getByLabel("目前手續費率").fill("0.10");
await mobile.getByLabel("Bybit 手續費率").fill("0.02");
check(await mobile.getByText(/Bybit \+ BiBeck 的預估年度交易成本較低/).isVisible(), "comparison reports Bybit + BiBeck only when inputs make it cheaper");
await mobile.screenshot({ path: "outputs/qa-binance-mobile-375.png", fullPage: true });

await browser.close();

const ignorable = (message) => message.includes("Failed to load resource") && message.includes("404");
const meaningfulConsoleErrors = findings.consoleErrors.filter((message) => !ignorable(message));
console.log(JSON.stringify({ ...findings, meaningfulConsoleErrors }, null, 2));
check(meaningfulConsoleErrors.length === 0, "no meaningful browser console errors: " + meaningfulConsoleErrors.join(" | "));
check(findings.pageErrors.length === 0, "no uncaught page errors: " + findings.pageErrors.join(" | "));