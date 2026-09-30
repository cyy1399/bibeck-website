import assert from "node:assert/strict";
import test from "node:test";
import { validateMoneyModelSpecification } from "../docs/money-model/validation/validate-spec.ts";
import { syntheticCases } from "../docs/money-model/tests/synthetic-cases.ts";
import { priorityCollisions } from "../docs/money-model/tests/priority-collisions.ts";

test("Money Model V1 registries and references are valid", () => assert.deepEqual(validateMoneyModelSpecification(), []));
test("all 24 synthetic cases preserve every pass/fail dimension", () => {
  assert.equal(syntheticCases.length, 24);
  for (const item of syntheticCases) assert.deepEqual(Object.keys(item.expected).sort(), ["allowedMainQuests","claimInvariant","forbiddenAllocations","forbiddenOutputs","primaryBottleneck","prioritizedClaims","requiredFlags","resourceInvariant","severity","stage"].sort());
});
test("all four priority collisions include negative assertions", () => {
  assert.equal(priorityCollisions.length, 4);
  for (const item of priorityCollisions) assert.ok(item.expected.forbiddenAllocations.length && item.expected.forbiddenOutputs.length);
});
