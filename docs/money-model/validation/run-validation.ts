import { validateMoneyModelSpecification } from "./validate-spec.ts";
const issues = validateMoneyModelSpecification();
if (issues.length) {
  console.error(issues.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Money Model V1 specification validation passed.");
}
