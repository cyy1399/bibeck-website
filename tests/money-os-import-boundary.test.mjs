import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { frozenFiles } from "./money-os/frozen-runtime-manifest.mjs";

const root = fileURLToPath(new URL("../lib/money-model/", import.meta.url));
const entry = path.join(root, "arithmetic", "decimal-arithmetic.ts");
const read = (file) => readFileSync(file, "utf8");
const parse = (file, source = read(file)) => ts.createSourceFile(file, source, ts.ScriptTarget.ES2020, true);
const inside = (file) => {
  const relative = path.relative(root, file);
  return relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative);
};
const sourceFiles = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((item) =>
  item.isDirectory() ? sourceFiles(path.join(directory, item.name)) : [path.join(directory, item.name)]
);

function dependencies(sourceFile) {
  const refs = [];
  const add = (node) => {
    assert.ok(node && ts.isStringLiteral(node), "Dependency paths must be literal and inspectable");
    refs.push(node.text);
  };
  const visit = (node) => {
    if (ts.isImportDeclaration(node)) add(node.moduleSpecifier);
    if (ts.isExportDeclaration(node) && node.moduleSpecifier) add(node.moduleSpecifier);
    if (ts.isImportTypeNode(node)) add(ts.isLiteralTypeNode(node.argument) ? node.argument.literal : undefined);
    if (ts.isCallExpression(node) && (
      node.expression.kind === ts.SyntaxKind.ImportKeyword ||
      (ts.isIdentifier(node.expression) && node.expression.text === "require")
    )) add(node.arguments[0]);
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return refs;
}

function forbiddenGlobals(sourceFile) {
  const forbidden = new Set([
    "React", "window", "document", "navigator", "localStorage", "sessionStorage",
    "process", "Deno", "Bun", "performance", "fetch", "XMLHttpRequest",
    "crypto", "console", "setTimeout", "setInterval", "globalThis", "eval", "Function",
  ]);
  const found = [];
  const visit = (node) => {
    if (ts.isIdentifier(node) && forbidden.has(node.text)) found.push(node.text);
    if (ts.isIdentifier(node) && node.text === "Date") {
      const parent = node.parent;
      const explicitParse = ts.isPropertyAccessExpression(parent) && parent.expression === node && parent.name.text === "parse";
      const explicitDate = ts.isNewExpression(parent) && parent.expression === node && parent.arguments?.length === 1;
      if (!explicitParse && !explicitDate) found.push("Date");
    }
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) &&
      node.expression.text === "Math" && node.name.text === "random") found.push("Math.random");
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

test("S00: frozen arithmetic body is unchanged, independently of the wrapper", () => {
  // SHA-256 of LF-normalized body (function parts through EOF), read from
  // cfff3150fb5e6a258596fa54caa745023bcde894:docs/money-model/reference/decimal-arithmetic.ts.
  // Comments are intentionally excluded; changing behavior requires explicit review.
  const source = read(entry).replace(/\r\n/g, "\n");
  const start = source.indexOf("function parts");
  assert.ok(start >= 0);
  assert.equal(createHash("sha256").update(source.slice(start).trim()).digest("hex"),
    "eaf8401c2a9987765ee6b44a19f1ed1f21e8322a93d9970d08d078457de15b40");
});

test("S00/S01: every portable module and dependency stays inside the pure TS boundary", () => {
  const files = sourceFiles(root);
  const migrated = frozenFiles.filter(({path}) => !path.includes("/reference/") || [
    "profile-normalizer", "input-value", "resource-validator", "claim-validator", "claim-fulfillment",
    "predicate-evaluator", "reference-evaluator", "output-validator",
  ].some(name => path.endsWith("/" + name + ".ts"))).map(({path}) => path.replace("docs/money-model/", "").replace("schemas/", "contracts/").replace("reference/", "runtime/"));
  assert.deepEqual(files.map(file => path.relative(root, file).split(path.sep).join("/")).sort(), [
    ...migrated, "arithmetic/decimal-arithmetic.ts", "index.ts", "registries/runtime-bundle.ts",
    "registries/baseline-manifest.ts", "runtime/context-seed.ts", "runtime/input-validation.ts",
    "runtime/analyze-financial-profile.ts",
  ].sort(), "Only the authorized S01 domain modules may join S00");
  const visited = new Set();
  const visit = (file) => {
    assert.ok(inside(file), "Outside portable domain: " + file);
    assert.equal(path.extname(file), ".ts", "No TSX/CSS/browser modules");
    if (visited.has(file)) return;
    visited.add(file);
    const sourceFile = parse(file);
    assert.deepEqual(forbiddenGlobals(sourceFile), [], file);
    for (const ref of dependencies(sourceFile)) {
      assert.ok(ref.startsWith("."), "No framework, platform, DB, auth or locale import: " + ref);
      visit(path.resolve(path.dirname(file), ref));
    }
  };
  for (const file of files) visit(file);
  assert.equal(visited.size, files.length);
});

test("S00: boundary scanner covers imports, re-exports, import types and dynamic dependencies", () => {
  assert.deepEqual(dependencies(parse("guard.ts", [
    'import React from "react";',
    'export { x } from "../../../docs/x.ts";',
    'type X = import("next").X;',
    'const a = import("node:fs");',
    'const b = require("postgres");',
  ].join("\n"))), ["react", "../../../docs/x.ts", "next", "node:fs", "postgres"]);
  assert.throws(() => dependencies(parse("guard.ts", "import(suppliedPath);")));
  assert.throws(() => dependencies(parse("guard.ts", "require(suppliedPath);")));
  assert.equal(inside(path.resolve(root, "../../docs/x.ts")), false);
  assert.deepEqual(forbiddenGlobals(parse("guard.ts",
    "Date.now(); process.env.VALUE; window.location; Math.random();")),
  ["Date", "process", "window", "Math.random"]);
  assert.deepEqual(forbiddenGlobals(parse("guard.ts", "new Date(); Date(); Date.UTC(2026, 0); const clock = Date;")), ["Date", "Date", "Date", "Date"]);
  assert.deepEqual(forbiddenGlobals(parse("guard.ts", "Date.parse(asOf); new Date(calendar).toISOString();")), []);
});

test("S00: old reference file contains only the explicit compatibility re-export", () => {
  const wrapper = fileURLToPath(new URL("../docs/money-model/reference/decimal-arithmetic.ts", import.meta.url));
  const ast = parse(wrapper);
  assert.equal(ast.statements.length, 1);
  const statement = ast.statements[0];
  assert.ok(ts.isExportDeclaration(statement));
  assert.equal(statement.isTypeOnly, false);
  assert.equal(statement.moduleSpecifier.text, "../../../lib/money-model/arithmetic/decimal-arithmetic.ts");
  assert.equal(path.resolve(path.dirname(wrapper), statement.moduleSpecifier.text), entry);
  assert.ok(ts.isNamedExports(statement.exportClause));
  assert.deepEqual(statement.exportClause.elements.map((item) => item.name.text).sort(),
    ["decimalProduct", "decimalSum"]);
});

test("S00: public API is only the two frozen number-based arithmetic functions", () => {
  const ast = parse(entry);
  const exported = ast.statements.filter((node) =>
    node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword));
  assert.deepEqual(exported.map((node) => node.name.text).sort(), ["decimalProduct", "decimalSum"]);
  for (const node of exported) {
    assert.ok(ts.isFunctionDeclaration(node));
    assert.equal(node.type.kind, ts.SyntaxKind.NumberKeyword);
  }
  assert.equal(exported[0].parameters[0].type.getText(ast), "readonly number[]");
  assert.deepEqual(exported[1].parameters.map((node) => node.type.kind),
    [ts.SyntaxKind.NumberKeyword, ts.SyntaxKind.NumberKeyword]);
});

test("S00: targeted typecheck cannot inherit DOM, Node or Next ambient globals", () => {
  const config = JSON.parse(read(fileURLToPath(new URL("../tsconfig.money-model.json", import.meta.url))));
  assert.equal(config.extends, undefined);
  assert.equal(config.compilerOptions.target, "ES2022");
  assert.deepEqual(config.compilerOptions.lib, ["ES2022"]);
  assert.deepEqual(config.compilerOptions.types, []);
  assert.equal(config.compilerOptions.strict, true);
  assert.equal(config.compilerOptions.noEmit, true);
  assert.deepEqual(config.include, ["lib/money-model/**/*.ts"]);
  const pkg = JSON.parse(read(fileURLToPath(new URL("../package.json", import.meta.url))));
  assert.equal(pkg.scripts["typecheck:money-model"], "tsc --project tsconfig.money-model.json");
});
