import assert from "node:assert/strict";
import test from "node:test";
import { decimalProduct, decimalSum } from "../lib/money-model/arithmetic/decimal-arithmetic.ts";
import * as reference from "../docs/money-model/reference/decimal-arithmetic.ts";

test("S00: decimal sum has independent exact-decimal expected values", () => {
  // Hand-written expected values, never generated from the reference wrapper.
  for (const [values, expected] of [
    [[], 0],
    [[0], 0],
    [[1], 1],
    [[1000, 0.5], 1000.5],
    [[0.1, 0.2], 0.3],
    [[0.1, 0.2, 0.3], 0.6],
    [[1, -0.9], 0.1],
    [[0.3, -0.1, -0.2], 0],
    [[-0.1, -0.2], -0.3],
    [[-0, 0], 0],
    [[1e-308, -1e-308], 0],
    [[Number.MIN_VALUE, Number.MIN_VALUE], 1e-323],
    [[9007199254740990, 1], Number.MAX_SAFE_INTEGER],
    [[1e16, -1e16, 0.1], 0.1],
  ]) {
    assert.equal(decimalSum(values), expected, JSON.stringify(values));
    assert.equal(decimalSum([...values].reverse()), expected);
  }
  assert.notEqual(0.1 + 0.2, 0.3);
});

test("S00: share multiplication retains frozen signed decimal semantics", () => {
  for (const [left, right, expected] of [
    [0.3, 0.1, 0.03],
    [0.3, 0.5, 0.15],
    [1000, 0.25, 250],
    [-0.3, 0.5, -0.15],
    [-0.3, -0.5, 0.15],
    [0, 1234.5, 0],
    [-0, 1, 0],
    [1e-100, 1e-100, 1e-200],
    [Number.MIN_VALUE, 1, Number.MIN_VALUE],
    [Number.MAX_VALUE, 1, Number.MAX_VALUE],
  ]) {
    assert.equal(decimalProduct(left, right), expected);
    assert.equal(decimalProduct(right, left), expected);
  }
});

test("S00: unrepresentable finite results are NaN, not silently rounded", () => {
  for (const values of [
    [1e16, 0.1],
    [Number.MAX_SAFE_INTEGER, 2],
    [1, Number.MIN_VALUE],
  ]) assert.ok(Number.isNaN(decimalSum(values)), JSON.stringify(values));

  for (const [left, right] of [
    [9007199254740991, 0.3],
    [Number.MIN_VALUE, 0.1],
  ]) assert.ok(Number.isNaN(decimalProduct(left, right)));
});

test("S00: overflow preserves the frozen nonfinite sentinel contract", () => {
  assert.equal(decimalSum([Number.MAX_VALUE, Number.MAX_VALUE]), Infinity);
  assert.equal(decimalSum([-Number.MAX_VALUE, -Number.MAX_VALUE]), -Infinity);
  assert.equal(decimalProduct(Number.MAX_VALUE, 2), Infinity);
  assert.equal(decimalProduct(-Number.MAX_VALUE, 2), -Infinity);
});

test("S00: nonfinite operands never certify a finite value or multiply to zero", () => {
  for (const value of [NaN, Infinity, -Infinity]) {
    assert.ok(Number.isNaN(decimalSum([value])));
    assert.ok(Number.isNaN(decimalSum([0, value])));
    assert.ok(Number.isNaN(decimalProduct(value, 0)));
    assert.ok(Number.isNaN(decimalProduct(0, value)));
  }
});

test("S00: this numeric primitive does not parse external strings", () => {
  // S02 owns syntax/magnitude/scale/currency validation, NOT this extraction.
  for (const value of [
    "0", "1", "1.00", "1000", "1000.50", "1234567.89",
    "", " ", "1,000", "1e6", "NaN", "Infinity", "--10", "10.2.3",
    "NT$10,000", "US$1,000.50", null, undefined, true, {},
  ]) {
    assert.ok(Number.isNaN(decimalSum([value])));
    assert.ok(Number.isNaN(decimalProduct(value, 1)));
  }
});

test("S00: tagged UNKNOWN and NOT_APPLICABLE are not arithmetic zero", () => {
  for (const tagged of [
    { status: "UNKNOWN", reason: "NOT_REPORTED" },
    { status: "NOT_APPLICABLE", reason: "NOT_OWNED" },
    { status: "UNKNOWN", data: { value: 0 } },
    { status: "KNOWN", data: { value: 0 } },
  ]) {
    assert.ok(Number.isNaN(decimalSum([tagged])));
    assert.ok(Number.isNaN(decimalProduct(tagged, 0)));
  }
  // Only an explicitly unwrapped, validated KNOWN numeric operand can be used.
  assert.equal(decimalSum([0]), 0);
});

test("S00: operands stay immutable and display formatting is not a calculation input", () => {
  const values = Object.freeze([1000.5, 0.1]);
  assert.equal(decimalSum(values), 1000.6);
  const display = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 0 }).format(values[0]);
  assert.equal(values[0], 1000.5);
  assert.ok(Number.isNaN(decimalSum([display, 0.1])));
  assert.equal(decimalSum(values), 1000.6);
});

test("S00: finite numeric results survive JSON without exporting BigInt", () => {
  for (const value of [
    decimalSum([0.1, 0.2]),
    decimalSum([1, -0.9]),
    decimalProduct(0.3, 0.5),
    decimalSum([Number.MAX_SAFE_INTEGER]),
    decimalSum([Number.MIN_VALUE]),
  ]) {
    assert.equal(typeof value, "number");
    assert.ok(Number.isFinite(value));
    assert.equal(JSON.parse(JSON.stringify({ value })).value, value);
  }
  // Not a new codec: callers must guard sentinels before JSON loses them.
  for (const value of [decimalSum([NaN]), decimalProduct(Number.MAX_VALUE, 2)]) {
    assert.equal(Number.isFinite(value), false);
    assert.equal(JSON.parse(JSON.stringify({ value })).value, null);
  }
});

test("S00: reference entrypoint re-exports the very same functions", () => {
  // Wiring assertion only; independent oracles and pinned body hash prove extraction.
  assert.equal(reference.decimalSum, decimalSum);
  assert.equal(reference.decimalProduct, decimalProduct);
  assert.deepEqual(Object.keys(reference).sort(), ["decimalProduct", "decimalSum"]);
});
