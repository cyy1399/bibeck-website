import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";

// Optional review tooling only; browser/runtime paths are supplied by the reviewer.
const args = Object.fromEntries(process.argv.slice(2).map(arg => arg.replace(/^--/u, "").split("=")));
if (!args.url || !args.playwright || !args.browser) throw new Error("Supply --url, --playwright and --browser for local review");
const target = new URL(args.url);
if (target.hostname !== "127.0.0.1") throw new Error("Loopback review only");
const { chromium } = createRequire(import.meta.url)(args.playwright);
const output = resolve(".artifacts/money-os-visual-v0");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: args.browser, headless: true });
const results = [];
const errors = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, deviceScaleFactor: 1, locale: "zh-TW" });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", event => { if (event.type() === "error") errors.push(event.text()); });
    page.on("requestfailed", request => errors.push(request.url() + " " + request.failure()?.errorText));
    page.on("request", request => assert.equal(new URL(request.url()).origin, target.origin, "No external requests"));
    for (const scenario of ["A", "B", "C", "D", "E", "F", "FAILURE"]) {
      const response = await page.goto(`${target.origin}/?scenario=${scenario}`);
      assert.equal(response.status(), 200);
      await page.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await page.getByRole("navigation", { name: "Money OS 導覽" }).count(), 1);
      assert.equal(await page.locator("nav a").count(), 1);
      assert.equal(await page.locator(".sidebar").count(), 0);
      assert.doesNotMatch(await page.locator("body").innerText(), /\b(?:main\s*quest|quest|XP|level|achievement)\b/iu);
      if (scenario !== "FAILURE") {
        const date = page.locator(".basis-note time");
        assert.equal(await date.innerText(), await date.getAttribute("datetime"));
        assert.match(await page.locator(".basis-note").innerText(), /合成資料基準日/u);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${scenario}/${width} overflow`);
      assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
      assert.deepEqual(await context.cookies(), []);
      const heading = await page.locator("h1").innerText();
      results.push({ scenario, width, heading, horizontalOverflow: false, primaryNavigations: 1, dateSource: scenario === "FAILURE" ? "not applicable" : "synthetic DTO basis" });
      await page.screenshot({ path: resolve(output, `${scenario}-${width}-full.png`), fullPage: true });
      if (scenario === "A") {
        await page.screenshot({ path: resolve(output, `A-${width}-viewport.png`) });
        await page.getByRole("link", { name: "看判斷依據" }).click();
        assert.equal(await page.locator("#why").getAttribute("open"), "");
        assert.equal(await page.locator("#why .why-body > section").count(), 6);
        await page.locator("#why .source-details > summary").click();
        assert.ok(await page.locator("#why .source-list > li").count() > 0);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await page.screenshot({ path: resolve(output, `A-${width}-why-open.png`), fullPage: true });
      }
      if (scenario === "C") {
        assert.equal(await page.locator('[data-mission-type="DISCOVER"]').count(), 1);
        await page.locator("#mission-why > summary").click();
        await page.locator("#mission-why .source-details > summary").click();
        assert.ok(await page.locator('#mission-why [data-value-status="UNKNOWN"]').count() > 0);
        await page.screenshot({ path: resolve(output, `C-${width}-discover-open.png`), fullPage: true });
      }
      if (["D", "E"].includes(scenario)) assert.equal(await page.locator("[data-no-action]").count(), 1);
      if (scenario !== "FAILURE") {
        for (const selector of [".more-metrics", ".research-values", "#mission-why", "#why", ".global-details", "#all-why", ".source-details", ".side-missions details"]) {
          for (const details of await page.locator(selector).all()) await details.evaluate(element => { element.open = true; });
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${scenario}/${width} expanded overflow`);
      }
    }
    await page.goto(`${target.origin}/`);
    await page.getByRole("link", { name: "BiBeck Money OS", exact: true }).focus();
    assert.equal(await page.locator("nav a").evaluate(element => getComputedStyle(element).outlineStyle !== "none"), true);
    await page.locator("#scenario").focus();
    assert.equal(await page.locator("#scenario").evaluate(element => getComputedStyle(element).outlineStyle !== "none"), true);
    await page.locator("#scenario").selectOption("C");
    assert.equal(await page.locator('[data-mission-type="DISCOVER"]').count(), 0, "Selection alone is not fake analysis");
    await page.getByRole("button", { name: "切換", exact: true }).click();
    await page.waitForURL("**/?scenario=C");
    assert.equal(await page.locator('[data-mission-type="DISCOVER"]').count(), 1);
    await page.getByRole("link", { name: "BiBeck Money OS" }).click();
    assert.equal(await page.locator("#scenario").inputValue(), "A");
    for (const link of await page.locator('a[href^="#"]').all()) assert.equal(await page.locator(await link.getAttribute("href")).count(), 1);
    await context.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, "browser-results.json"), JSON.stringify({ results, errors, interactions: "PASS", externalRequests: 0, cookies: 0, browserStorage: 0 }, null, 2));
  console.log(JSON.stringify({ states: results.length, interactions: "PASS", errors, output }));
} finally { await browser.close(); }
