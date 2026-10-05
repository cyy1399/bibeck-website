import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";
const root = fileURLToPath(new URL("../lib/money-os/", import.meta.url));
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const expected = [
  "adapters/claim-producer.ts", "adapters/domain-value-codec.ts", "adapters/money-codec.ts", "adapters/producer-catalog.ts", "adapters/profile-adapter.ts", "adapters/resource-producer.ts", "adapters/time-codec.ts",
  "application/analyze-profile.ts", "application/fingerprint.ts", "application/version-dispatcher.ts",
  "contracts/analysis.ts", "contracts/commands.ts", "contracts/errors.ts", "contracts/producer-manifest.ts", "contracts/read-dto.ts", "contracts/source.ts",
  "ports/clock.ts", "ports/identity.ts", "ports/observability.ts", "ports/profile-repository.ts",
  "presentation/values.ts", "presentation/why.ts", "presentation/workspace.ts",
];
test("S04 explicit scope: only approved foundation/application/ports/pure projection files", () => {
  assert.deepEqual(walk(root).map(f => path.relative(root, f).replaceAll("\\", "/")).sort(), expected);
  const catalogRoot = fileURLToPath(new URL("../messages/money-os/", import.meta.url));
  assert.deepEqual(walk(catalogRoot).map(f => path.basename(f)).sort(), ["index.ts", "keys.ts", "zh-TW.ts"]);
});
test("S04 import/global boundary: no framework/auth/DB/network/ambient clocks or fake identity", () => {
  for (const file of [...walk(root), ...walk(fileURLToPath(new URL("../messages/money-os/", import.meta.url)))]) {
    const ast = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.ES2022, true);
    const visit = n => {
      if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n) && n.moduleSpecifier) {
        const ref = n.moduleSpecifier.text;
        assert.ok(ref.startsWith(".") || ref === "node:crypto" && file.endsWith("fingerprint.ts"), file + ":" + ref);
        assert.ok(!/docs|auth|server|database|postgres|drizzle|react|next/.test(ref), file + ":" + ref);
      }
      if (ts.isIdentifier(n)) assert.ok(!["window", "document", "navigator", "localStorage", "sessionStorage", "fetch", "process", "console", "require", "eval", "parseFloat", "performance", "Buffer", "URL", "URLSearchParams", "setTimeout", "setInterval", "globalThis"].includes(n.text), file + ":" + n.text);
      if (ts.isCallExpression(n)) assert.notEqual(n.expression.kind, ts.SyntaxKind.ImportKeyword);
      if (ts.isPropertyAccessExpression(n)) assert.ok(!["Date.now", "Math.random"].includes(n.getText(ast)));
      ts.forEachChild(n, visit);
    };
    visit(ast);
  }
});
test("S04 single financial facade: no second arithmetic/rules/threshold producer or writer", () => {
  let calls = 0;
  for (const file of walk(root).filter(f => /application|presentation/.test(f))) {
    const ast = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.ES2022, true);
    const visit = n => {
      if (ts.isCallExpression(n) && n.expression.getText(ast) === "analyzeFinancialProfile") calls++;
      if (ts.isImportDeclaration(n)) assert.ok(!/arithmetic|calculations|normalizer|reference-evaluator|predicate-evaluator/.test(n.moduleSpecifier.text));
      if (ts.isIdentifier(n)) assert.ok(!["commitAnalysis", "execute", "query", "saveProfileAndAnalyze", "normalizeProfile"].includes(n.text));
      ts.forEachChild(n, visit);
    };
    visit(ast);
  }
  assert.equal(calls, 1);
  const identity = readFileSync(path.join(root, "ports/identity.ts"), "utf8");
  assert.ok(!/synthetic|test-subject|owner-a/.test(identity));
});
test("S04 targeted compile has Node only for SHA256; no DOM/framework dependency added", () => {
  const cfg = JSON.parse(readFileSync(new URL("../tsconfig.money-os.json", import.meta.url), "utf8"));
  assert.deepEqual(cfg.compilerOptions.lib, ["ES2022", "ES2022.Intl"]); assert.deepEqual(cfg.compilerOptions.types, ["node"]);
  assert.deepEqual(cfg.include, ["lib/money-os/**/*.ts", "messages/money-os/**/*.ts"]);
  assert.equal(cfg.compilerOptions.strict, true); assert.equal(cfg.compilerOptions.noEmit, true);
  const foundation = JSON.parse(readFileSync(new URL("../tsconfig.money-os-foundation.json", import.meta.url), "utf8"));
  assert.equal(foundation.extends, "./tsconfig.money-os.json"); assert.deepEqual(foundation.compilerOptions.types, []);
  assert.deepEqual(foundation.include, ["lib/money-os/adapters/**/*.ts", "lib/money-os/contracts/errors.ts", "lib/money-os/contracts/source.ts", "lib/money-os/contracts/producer-manifest.ts"]);
  const scripts = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).scripts;
  assert.equal(scripts["typecheck:money-os-foundation"], "tsc --project tsconfig.money-os-foundation.json");
});
