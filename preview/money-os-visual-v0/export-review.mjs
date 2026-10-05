import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { analyzeScenario, scenarios } from "./scenarios.ts";
import { renderPreview } from "./render.ts";

// Review artifact generation only. No deployed server, input, auth or persistence.
export async function buildReviewOutput() {
  const headers = {
    "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow",
    "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'none'; style-src 'self'; script-src 'self'; img-src data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  };
  const files = new Map();
  for (const scenario of scenarios) {
    files.set(`${scenario.id}.html`, renderPreview(await analyzeScenario(scenario.id), scenario, "HOSTED_REVIEW"));
  }
  for (const name of ["styles.css", "interactions.js"]) files.set(name, await readFile(new URL(name, import.meta.url), "utf8"));
  const config = { version: 3, routes: [
    { src: "/(.*)", headers, continue: true },
    { src: "/(.*)", methods: ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"], status: 405 },
    ...scenarios.map(scenario => ({ src: "^/$", has: [{ type: "query", key: "scenario", value: scenario.id }], dest: `/${scenario.id}.html` })),
    { src: "^/$", missing: [{ type: "query", key: "scenario" }], dest: "/A.html" },
    { src: "^/(styles\\.css|interactions\\.js)$", dest: "/$1" },
    { src: "/(.*)", status: 404 },
  ] };
  return { files, config };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv.includes("--preview-review") || process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    throw new Error("Synthetic Preview export only; production is prohibited");
  }
  const branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
  if (branch !== "preview/money-os-visual-v0") throw new Error("Export requires the approved preview branch");
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const output = resolve(".artifacts/money-os-visual-v0/vercel-review");
  const { files, config } = await buildReviewOutput();
  for (const [name, content] of files) {
    const file = resolve(output, ".vercel/output/static", name);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, content);
  }
  await writeFile(resolve(output, ".vercel/output/config.json"), JSON.stringify(config, null, 2));
  // Existing project identity, not credentials; no global project settings change.
  await writeFile(resolve(output, ".vercel/project.json"), await readFile(".vercel/project.json", "utf8"));
  await writeFile(resolve(output, "vercel.json"), JSON.stringify({ framework: null }));
  await writeFile(resolve(output, "review-manifest.json"), JSON.stringify({ branch, sha, target: "preview", syntheticOnly: true, scenarios: scenarios.map(s => s.id) }, null, 2));
  console.log(JSON.stringify({ output, sha, target: "preview", pages: scenarios.length }));
}
