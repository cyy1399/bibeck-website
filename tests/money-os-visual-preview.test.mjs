import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { request } from "node:http";
import { analyzeScenario, scenarios, findScenario } from "../preview/money-os-visual-v0/scenarios.ts";
import { renderPreview, escapeHtml } from "../preview/money-os-visual-v0/render.ts";
import { createReviewServer } from "../preview/money-os-visual-v0/server.mjs";
import { buildReviewOutput } from "../preview/money-os-visual-v0/export-review.mjs";
import { command, prepare } from "./money-os/service-fixtures.mjs";

const visibleText = html => html.replace(/<[^>]*>/gu, " ");
for (const id of ["A", "B", "C", "D", "E", "F"]) {
  test(`preview ${id} consumes real S04 projection without mutating it`, async () => {
    const result = await analyzeScenario(id);
    assert.equal(result.ok, true);
    const before = structuredClone(result);
    const workspace = result.value.workspace;
    const html = renderPreview(result, findScenario(id));
    assert.ok(html.includes(escapeHtml(workspace.stage.label)));
    assert.ok(html.includes(escapeHtml(workspace.bottleneck.text)));
    assert.ok(html.includes(escapeHtml(workspace.confidence.label)));
    for (const metric of workspace.metrics.slice(0, 3)) assert.ok(html.includes(escapeHtml(metric.value.text)));
    assert.equal((html.match(/data-mission-type=/gu) ?? []).length, workspace.mainQuest ? 1 : 0);
    if (workspace.mainQuest) assert.ok(html.includes(escapeHtml(workspace.mainQuest.title)));
    assert.deepEqual(result, before);
    assert.doesNotMatch(visibleText(html), /\b(?:R\d{3}|AS-\d+|EV-\d+|mission-[a-f0-9]+|finding-[a-f0-9]+|metrics\.[a-zA-Z]+|source-\d+)\b/u);
    assert.doesNotMatch(visibleText(html), /(?:USER_REPORTED|NEED_MORE_INFORMATION|NO_ACTION_REQUIRED|DISCOVER)/u);
  });
}
test("preview passes unmodified A-E fixtures through the S04 service", async () => {
  for (const id of ["A", "B", "C", "D", "E"]) assert.deepEqual(await analyzeScenario(id), await prepare(command(id)));
  assert.deepEqual(await analyzeScenario("F"), await analyzeScenario("F"));
});
test("desktop and mobile share one primary navigation with no gamified visible copy", async () => {
  for (const scenario of scenarios) {
    const html = renderPreview(await analyzeScenario(scenario.id), scenario);
    assert.equal((html.match(/<nav\b/gu) ?? []).length, 1);
    assert.match(html, /<nav aria-label="Money OS 導覽"><a class="brand" href="\/"/u);
    assert.doesNotMatch(html, /sidebar|MainQuestCard/u);
    assert.doesNotMatch(visibleText(html), /\b(?:main\s*quest|quest|quests|XP|level|achievement)\b/iu);
  }
  assert.match(renderPreview(await analyzeScenario("A"), findScenario("A")), /small-label">優先任務</u);
});
test("review date is the fixture-derived DTO basis, never a fabricated runtime update", async () => {
  const result = await analyzeScenario("A");
  const render = () => renderPreview(result, findScenario("A"));
  const date = result.value.workspace.basis.asOf;
  assert.ok(render().includes(`合成資料基準日 <time datetime="${date}">${date}</time>`));
  result.value.workspace.basis.asOf = "2031-02-14";
  assert.ok(render().includes('<time datetime="2031-02-14">2031-02-14</time>'));
  assert.doesNotMatch(visibleText(render()), /最後更新|2025\/10\/05/u);
});
test("hosted review changes only the location disclaimer, not S04 financial output", async () => {
  const result = await analyzeScenario("A");
  const before = structuredClone(result);
  const local = renderPreview(result, findScenario("A"));
  const hosted = renderPreview(result, findScenario("A"), "HOSTED_REVIEW");
  assert.equal(hosted, local.replace("僅限本機審閱", "僅供 Preview 審閱"));
  assert.deepEqual(result, before);
});
test("static review exports only real synthetic projections and read-only asset routes", async () => {
  const { files, config } = await buildReviewOutput();
  assert.equal(files.size, 9);
  assert.equal(config.version, 3);
  assert.equal(config.functions, undefined);
  for (const scenario of scenarios) {
    assert.equal(files.get(`${scenario.id}.html`), renderPreview(await analyzeScenario(scenario.id), scenario, "HOSTED_REVIEW"));
    assert.ok(config.routes.some(route => route.dest === `/${scenario.id}.html` && route.has?.[0].value === scenario.id));
  }
  assert.ok(config.routes.some(route => route.status === 405 && route.methods.includes("POST")));
  assert.equal(config.routes.at(-1).status, 404);
  assert.doesNotMatch(JSON.stringify(config), /api|functions|crons/u);
  assert.deepEqual([...files.keys()].sort(), ["A.html", "B.html", "C.html", "D.html", "E.html", "F.html", "FAILURE.html", "interactions.js", "styles.css"]);
});
test("unknown APR renders as unknown, not zero, and exposes real Discover dependencies", async () => {
  const result = await analyzeScenario("C");
  assert.equal(result.value.workspace.mainQuest.type, "DISCOVER");
  const apr = result.value.workspace.mainQuest.details.sources.items.find(item => item.label.includes("年利率"));
  assert.equal(apr.value.status, "UNKNOWN");
  const html = renderPreview(result, findScenario("C"));
  assert.ok(html.includes(`data-value-status="UNKNOWN">${escapeHtml(apr.value.text)}</span>`));
  assert.doesNotMatch(html, /data-value-status="UNKNOWN">0/u);
  const why = result.value.workspace.mainQuest.details;
  for (const part of [why.sources, why.metrics, why.mechanism, why.assumptions, why.missing, why.limits]) assert.ok(html.includes(escapeHtml(part.title)));
});
test("valid D/E no-action does not manufacture a quest or a universal health claim", async () => {
  for (const id of ["D", "E"]) {
    const result = await analyzeScenario(id);
    assert.equal(result.value.workspace.state, "NO_ACTION_REQUIRED");
    assert.equal(result.value.workspace.mainQuest, null);
    const html = renderPreview(result, findScenario(id));
    assert.ok(html.includes('data-no-action="true"'));
    assert.ok(html.includes(escapeHtml(result.value.workspace.summary)));
    assert.doesNotMatch(html, /data-mission-type=/u);
    assert.ok(html.includes("這不代表所有風險已排除"));
    assert.doesNotMatch(visibleText(html), /財務完全健康|健康分數|XP|Level Up/u);
  }
});
test("unapproved B/F capabilities stay limited rather than producing synthetic advice", async () => {
  for (const id of ["B", "F"]) {
    const result = await analyzeScenario(id);
    assert.equal(result.value.workspace.state, "NEED_MORE_INFORMATION");
    assert.equal(result.value.workspace.mainQuest.type, "DISCOVER");
    assert.ok(result.value.workspace.producerLimitations.length > 0);
    const html = renderPreview(result, findScenario(id));
    for (const limitation of result.value.workspace.producerLimitations) assert.ok(html.includes(escapeHtml(limitation)));
  }
});
test("actual S04 partial-expenses failure is explicit and cannot become financial advice", async () => {
  const result = await analyzeScenario("FAILURE");
  assert.equal(result.ok, false);
  assert.equal(result.error.safeCode, "INVALID_DECISION_OUTPUT");
  const html = renderPreview(result, findScenario("FAILURE"));
  assert.ok(html.includes("目前無法產生有效結果"));
  assert.ok(html.includes("INVALID_DECISION_OUTPUT"));
  assert.doesNotMatch(html, /data-mission-type=|data-no-action=|class="priority"/u);
});
test("DTO text is escaped, including malicious-looking titles and failure diagnostics", async () => {
  const result = await analyzeScenario("A");
  result.value.workspace.mainQuest.title = '<img src=x onerror="alert(1)">';
  const html = renderPreview(result, findScenario("A"));
  assert.doesNotMatch(html, /<img src=x/u);
  assert.ok(html.includes("&lt;img src=x"));
  assert.equal(escapeHtml("<&\"'>"), "&lt;&amp;&quot;&#39;&gt;");
});
test("local harness is GET-only, host-restricted, no-store and unavailable in production", async () => {
  const server = createReviewServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = `http://127.0.0.1:${server.address().port}`;
  const original = process.env.NODE_ENV;
  try {
    for (const scenario of scenarios) {
      const response = await fetch(`${address}/?scenario=${scenario.id}`);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.match(response.headers.get("content-security-policy"), /default-src 'none'/u);
      assert.equal(response.headers.get("set-cookie"), null);
      assert.match(await response.text(), /全部為合成資料/u);
    }
    assert.equal((await fetch(address + "/styles.css")).status, 200);
    assert.equal((await fetch(address + "/interactions.js")).status, 200);
    for (const path of ["/api/analysis", "/?scenario=Z", "/?profile=real", "/?scenario=A&scenario=B"]) assert.equal((await fetch(address + path)).status, 404);
    assert.equal((await fetch(address, { method: "POST", body: "{}" })).status, 405);
    const badHostStatus = await new Promise((resolve, reject) => {
      const call = request(address, { headers: { host: "attacker.example" } }, response => { response.resume(); resolve(response.statusCode); });
      call.on("error", reject); call.end();
    });
    assert.equal(badHostStatus, 403);
    process.env.NODE_ENV = "production";
    assert.equal((await fetch(address)).status, 404);
  } finally {
    if (original === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = original;
    await new Promise(resolve => server.close(resolve));
  }
});
test("CLI refuses normal/production startup and preview introduces no production dependency", async () => {
  const file = "preview/money-os-visual-v0/server.mjs";
  for (const [args, env] of [[[], { ...process.env, NODE_ENV: "development" }], [["--local-review"], { ...process.env, NODE_ENV: "production" }]]) {
    const child = spawnSync(process.execPath, ["--experimental-strip-types", file, ...args], { env, encoding: "utf8", timeout: 5000 });
    assert.notEqual(child.status, 0);
    assert.match(child.stderr, /Local review only; production is prohibited/u);
  }
  const exporter = spawnSync(process.execPath, ["--experimental-strip-types", "preview/money-os-visual-v0/export-review.mjs", "--preview-review"], { env: { ...process.env, NODE_ENV: "production" }, encoding: "utf8", timeout: 5000 });
  assert.notEqual(exporter.status, 0);
  assert.match(exporter.stderr, /production is prohibited/u);
  const dir = new URL("../preview/money-os-visual-v0/", import.meta.url);
  for (const name of await readdir(dir)) {
    if (!/\.(?:ts|js|mjs)$/u.test(name)) continue;
    const contents = await readFile(new URL(name, dir), "utf8");
    assert.doesNotMatch(contents, /from ["'][^"']*(?:auth|database|persistence|drizzle|postgres|next\/|profile-repository)[^"']*["']/u);
    assert.doesNotMatch(contents, /(?:localStorage|sessionStorage)\.(?:setItem|removeItem)|document\.cookie\s*=/u);
  }
});
