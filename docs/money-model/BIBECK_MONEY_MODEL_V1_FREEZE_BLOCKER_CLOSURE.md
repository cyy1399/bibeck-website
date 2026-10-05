# BiBeck Money Model V1 — Freeze Blocker Closure

Review date: 2026-10-02

Branch: feature/bibeck-money-model-v1

Baseline: 8be63e3 (formal REJECT FREEZE review). This pass changes domain specification and executable reference validation only. No website, /bybit, auth, database, API, merge or deployment work is included.

## Reassessment

Final verdict: APPROVE FREEZE — the V1 structural domain/reference contracts only.

This is a separate reassessment, not a rewrite of the original failed review. The six original reproductions remain unchanged. Passing them is necessary, not by itself sufficient. The structural boundary described below does not certify financial policies, research models or a production advice engine.

Reassessment basis: the five blocker paths now have runtime guards and independent adversarial assertions, not only schema comments. Required-known-input gates preserve independent repairs without inventing missing debt cost; resource/assignment and fulfillment checks conserve economic identity; the closed metric/predicate registry preserves units and UNKNOWN; complete output validation enforces ordered conclusions, raw dependencies and aggregate provenance. The late crosschecks additionally rejected duplicated recurring claim identity, late payment-category overlap, omitted consumed fields, truncated aggregate support and binary monetary artifacts. Research thresholds and unsupported policy producers remain explicitly WORKING/LOW or UNKNOWN. These are the grounds for this scoped approval; no financial-research or production-readiness approval follows.

## Blocker dispositions and executable evidence

| Blocker | Closure contract | Independent verification |
| --- | --- | --- |
| FR-B001 | Distinct KNOWN / UNKNOWN / NOT_APPLICABLE; per-rule requiredKnownInputs; unknown debt cost produces CONFIRM_DEBT_COST; independently supported repair survives Discover and contradictory zero claim count. No-mission cannot erase a repair or infer Optionality. | decision-closure.test.mjs, metric-predicate-closure.test.mjs, original critical-no-mission and all-unknown diagnostics |
| FR-B002 | Unique economic asset identity; bounded resource views; explicit disjoint assignment partitions; finite nonnegative amounts, valid references, joint-share/consent, restriction/reservation and availability checks. | resource-closure.test.mjs, original orphan and uncalculable-amount diagnostics |
| FR-B003 | Funding derived from actual target/funded values independently of lifecycle; declarative effects; explicit debt principal/interest/fees; same-asset safety/goal assignment transfers; immutable atomic reference ledger; economic recurring receipt identity bound to applied effects. | claim-closure.test.mjs, original funding-mismatch and zero-interval diagnostics |
| FR-B004 | Closed ValueRef registry with types, units, period, sign, currency and producer boundary; runtime AST/context validation; deterministic approved-basis normalization for eight core metrics, with raw input and dependency lineage. | metric-predicate-closure.test.mjs, decision-closure.test.mjs, spec validation |
| FR-B005 | Complete serializable DecisionOutput; versioned rule/model and revisioned evidence/assumption refs; raw input snapshot/lineage; confidence reasons and caps; nested runtime validation of semantics and supported conclusions. | output-closure.test.mjs, decision-closure.test.mjs, spec validation |

## Unknown and mission conflict policy

- Missing required operands never become zero, false or an invented APR. Unknown cost/classification cannot produce a high-cost-debt action. Discover requests the relevant missing dependency.
- Each financial action requires only its declared supporting inputs, not full-profile completeness. A known delinquency repair can survive unrelated unknown income or debt cost; discovery remains a side mission where appropriate.
- R-015 blocks only financial conclusions depending on the contradictory cash-flow refs. Independent known delinquency is not erased.
- R-008 capital conservation failure still critically halts downstream evaluation.
- No-mission requires a complete known claim inventory and no independent action candidate. Unknown research slots do not invent a new task. An empty priority claim count conflicting with a known critical repair exposes reconciliation rather than deleting the repair.
- Stage is the selected problem domain; no-mission leaves currentStage null. Optionality is not inferred from absence of work.

## Asset, resource, assignment and fulfillment

Asset is one economic identity. Resource is a constrained view of available value. CapitalAssignment is a purpose allocation against that asset, not a second asset.

Three purpose labels on one NT$100,000 account cannot create NT$300,000. Multiple resource views require disjoint explicit partitionAssignmentIds, and both view totals and assignment totals must stay within the asset's available economic value. Reserved, locked, restricted, unsettled, joint, external, future-income and credit resources are not free sole-owned cash.

Claims retain CREATED / ACTIVE / FULFILLED / EXPIRED / CANCELLED separately from UNFUNDED / PARTIALLY_FUNDED / FUNDED / OVERFUNDED / UNKNOWN / NOT_APPLICABLE. Fully funded can remain ACTIVE until fulfillment. Overfunding requires explicit eligible claim support; hard/debt claims cannot silently overfund. Unknown targets/funding produce UNKNOWN, not a normal funding percentage.

Normalization uses the same claim-inventory validator: renamed records with the same recurring template/occurrence cannot certify duplicated claim counts or goal capital totals. Funding and receipt checks therefore share the same economic identity boundary.

Debt payment effects decrease cash by the declared total and liability by the declared principal. Principal + interest + fees must reconcile; unknown breakdown can remain an active claim but cannot be posted as fulfilled. Safety and goal funding transfer an existing same-asset assignment and cannot create net worth. Expenses consume cash. Explicit decision-only effects may have no balance-sheet effect.

The reference ledger validates all effects before returning an immutable result. Recurring identity is templateId + occurrenceKey, not a renameable claim ID. Retry is a no-op only when its canonical economic effect payload matches the stored receipt. This is an equality/conservation test ledger, not persistent production transaction or authentication infrastructure.

Runtime inputs also reject forged source/date metadata, impossible calendar dates, future-as-of classification/valuation and hidden values inside UNKNOWN tags. These guards do not authenticate user statements; they prevent invalid metadata from certifying a known financial fact.

## Metric and predicate boundary

The reference normalizer accepts an explicit snapshot, as-of date, primary currency, monthly period, net/monthly/stock attestations and complete inventories. It does not infer completeness from omitted fields or empty arrays without the corresponding attestation.

The implemented core is Net Monthly Income, Core Monthly Outflow, Core Cash Flow, Monthly Surplus, Net Worth, Available Safety Liquidity, Financial Runway and Debt Service Ratio. Economic monthly payments are deduplicated. Reservations and dated obligation occurrences are deducted once. The 30-day post-obligation residual determines an immediate gap by comparison to zero, not by subtracting the same obligations again.

Discretionary-versus-required payment identity is checked after debt and recurring obligations join the full payment union. Conflicting classifications become UNKNOWN, not a guessed second deduction.

Monetary addition, subtraction and declared ownership-share multiplication use the canonical decimal input representation with internal integer coefficients. This prevents a 0.1 + 0.2 binary artifact from creating a negative zero cash flow or false over-allocation. No epsilon, currency precision or rounding policy is added. A result that cannot be exactly represented in the existing public number contract is rejected or becomes UNKNOWN; internal BigInt never enters DecisionOutput.

Zero/unknown denominators and nonfinite arithmetic produce UNKNOWN. Money/month, money/as-of, horizon money, months, ratio, count and boolean are not interchangeable. The minimal predicate AST rejects unregistered refs, extra executable shape, invalid operators/literals and incompatible types/units/periods; it never evaluates source code or traverses arbitrary properties.

Every executable ref declares its producer and whether it is deterministic normalization, explicit input, versioned assumption configuration or a Research Required slot. An unavailable slot is explicitly UNKNOWN with a reason; registration alone does not manufacture a known output.

## Portable output and confidence

DecisionOutput 1.0 carries stage, bottleneck, severity, metrics, mainQuest, sideMissions, findings, options, missingInformation, ruleRefs, modelVersions, assumptions, confidenceAssessment, provenance and evaluation metadata. Options may be an empty array: no fake option is manufactured.

Conclusions reference supporting findings, versioned registered rules/models, dependency ValueRefs, raw input records and revisions of declared evidence/assumptions. Metrics retain units, time basis and primary-currency identity. Runtime validation rejects missing/forged refs, unsupported semantic codes or conclusions, stale revisions, snapshot mismatch and malformed nested data. The AI explanation layer consumes these refs; it cannot author provenance.

Executable rules and the active working reference models are version 1.1.0 for this closure behavior; evidence and assumptions explicitly declare initial revision 1. Future changes must increment the appropriate version/revision. Research model statuses, confidence and inactive 0.0.0 future slots are not upgraded.

Confidence is semantic and reasoned, not a 0–100 score. Missing inputs, unversioned reference context, user-reported input, estimated valuation, WORKING models and Research Required assumptions cap confidence. Current models remain WORKING/LOW; no complete decision is promoted to HIGH merely because its predicate matched.

Legacy ReferenceDecisionOutput.modelConfidence remains only a rule-match compatibility field for independent historical fixtures. DecisionOutput.confidence and confidenceAssessment are the complete-decision authority, not that legacy field.

Resolved main quest, bottleneck and stage must agree with the actual ordered reference result; a legitimate lower-priority rule cannot replace the main repair. Missing-data disclosures cannot be deleted by hiding a side Discover mission. Mission VERIFIED_DONE is not accepted without a dedicated completion-proof contract: static research/definition evidence IDs are not payment receipts or state-change proof. USER_REPORTED_DONE remains a nonverified report.

Aggregate provenance must retain all displayed conclusion chains and the actual executed rules, not only the main quest's support. Raw snapshots include consumed reservation IDs, partition IDs, restriction/joint-ownership semantics, claim validation fields, expense categories and inventory identity/counts. UNKNOWN or future-as-of availability is a discovery gap, not proof of an allocation conflict.

## Explicit changes to baseline expectations

The original 80 test definitions remain. Three executable expected fixtures were conceptually unsafe and are explicitly corrected:

1. EXEC-001: global data-missing halt previously erased an independently known delinquency. R-001 + R-002 now preserve critical SURVIVAL repair and Discover side mission.
2. EXEC-010: unknown debt cost previously emitted no task and HIGH rule-match confidence. It now emits R-006 Discover / CONFIRM_DEBT_COST / LOW, without a debt payment action.
3. EXEC-016: no unresolved claims previously asserted OPTIONALITY. It now keeps no main quest and null stage; Optionality qualification remains Research Required.

No other executable expected outcome is changed. Synthetic claim shapes were made consistent with declarative debt/assignment effects, without inventing unknown payment breakdowns. Generated decision-output examples are rendering/serialization examples, never the independent expected-result oracle.

The six diagnostic checks and their expected invariants are unchanged. Their historical freezeApproved:false output is deliberately retained: a diagnostic runner does not approve freeze.

## Research and production limitations

Not solved or frozen: final Minimum Viable Liquidity threshold, Dynamic Safety Target, high-cost-debt classification policy, irregular-income and annual-expense periodization, insurance/protection, Taiwan tax/legal/regulatory policy, realization/crypto haircuts, Risk Capacity, Risk Tolerance, Asset Allocation, Optionality and sustainable goal/long-term capital models.

AS-001 remains LOW / RESEARCH_REQUIRED and exposes its consumed configuration/revision. No universal 8% APR threshold or guessed allocation policy was added.

Unsupported mixed-currency conversion, joint-owned net-worth normalization and unsupported realization/periodization policies remain UNKNOWN. Input-basis attestations are supplied data, not a claim that a financial normalization policy has been researched.

Future research model development, production integrations, UI implementation and deployment require separate authority and review.

## Final verification

| Verification | Final result |
| --- | --- |
| Original dedicated freeze diagnostics, run explicitly | 6/6 PASS, 0 FAIL; diagnostic source and expected invariants unchanged |
| pnpm test | 210/210 PASS, 0 FAIL, 0 skipped |
| Baseline coverage | All 80 original test definitions retained; the three justified fixture expectation corrections above are explicit |
| New closure assertions | 130/130 PASS across decision (6), resource (14), claim (12), metric/predicate (53), output (45) suites |
| pnpm typecheck | PASS |
| pnpm lint | PASS with --max-warnings=0 |
| pnpm spec:validate | PASS |
| pnpm build | PASS; also executed by the final pnpm test |
| pnpm build:sites | Local vinext build PASS; not a deployment |
| git diff --check | PASS |

vinext still reports some route classifications as '?' because its static analysis cannot classify all dynamic API usage. This is a build-tool limitation, not a failed build. No runtime/browser or production-financial readiness claim is made in this domain-only pass.

The commit is a separate closure commit after 8be63e3. Its hash and push status are reported in the task handoff, not self-embedded into its own contents. .artifacts/ is excluded from the commit.
