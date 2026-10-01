# BiBeck Money Model V1 — Freeze Review

Review date: 2026-10-01

Branch: `feature/bibeck-money-model-v1`

Reviewed baseline: `969e43a`; history: `eff6894 → a37d876 → 969e43a`.

Scope: domain/specification only. No UI, auth, production schema, merge or deployment.

## A. Executive conclusion

**REJECT FREEZE. The complete V1 domain contract is not ready for MVP implementation.**

The hardening at `969e43a` added executable predicates and fixtures, but the original “fixed” audit statuses do not establish closure of all structural failure modes. Independent review reproduced critical/no-mission suppression, orphan resource acceptance, inconsistent claim funding and high confidence with entirely unknown inputs. These are engineering/specification blockers, not unresolved financial-policy thresholds.

This review retains only narrow necessary additions: an explicit Claim lifecycle tag, limited lifecycle checks, and DecisionOutput version/confidence/provenance fields. They do **not** resolve the full lifecycle, execution or portable-output contracts. The earlier approval draft was withdrawn before publication.

## B. FROZEN_V1 contracts

Freeze applies only to the narrow boundaries below, not to their consumers.

| Major contract | Exact boundary |
| --- | --- |
| Known / Unknown / NotApplicable | The tagged `DomainValue<T>` representation: KNOWN carries source-bearing data; UNKNOWN and NOT_APPLICABLE carry reasons and are distinct from each other and zero. Required arithmetic/comparison operands that are not KNOWN cannot supply a guessed number. Metric-specific applicability and numeric validation are not frozen. |
| Severity | Existing enum `CRITICAL / HIGH / MEDIUM / LOW / NONE` and independent severity ordering. The requested moderate level is currently represented by MEDIUM, not a new MODERATE code. Classification thresholds/mappings are configurable; confidence and Stage remain separate. |
| Tie-break contract | For validated, enabled rules: ascending phase rank, ascending order, then stable Rule ID. No weighted wellness score. This does not approve override or merge behavior. |
| Synthetic fixture format | Explicit input/expected/forbidden dimensions and `STRUCTURE_ONLY` designation. It is a specification corpus, not an end-to-end engine oracle. |
| Adversarial fixture format | Scenario, insufficiency rationale, affected rule/finding references and forbidden outputs. Format approval is not a claim that the covered failures are fixed. |

## C. CONFIGURABLE_V1 contracts and values

| Contract/value | Boundary |
| --- | --- |
| TerminologyRecord | Stable internal keys with separate localized labels/descriptions; all current labels remain DRAFT and need the dispositions below. |
| minimumViableLiquidityMonths configuration | Existing AS-001-linked value 1 is LOW / RESEARCH_REQUIRED, not financial truth. Validate a consumed value and retain its provenance before using it. |
| Jurisdiction / threshold references | Explicit injected settings only. Their financial values are Research Required where evidence is unresolved. No universal high-cost-debt fallback. |
| Rule enable/disable and order metadata | Changes require versioned review and affected tests; they must not silently bypass a required halt. |
| Confidence metadata / severity mappings | Reviewable values supported by evidence or explicit assumptions. High confidence in a predicate match must not be confused with high confidence in the complete financial decision. |
| Terminology labels | Locale catalogs may change independently of the core rule semantics. KEEP in an audit is not human approval. |

These classifications freeze no numeric threshold and do not certify the incomplete registry revision system.

## D. EXPERIMENTAL contracts

Every remaining required major contract has exactly this status; none is implicitly frozen by its presence in TypeScript.

| Major contract | Structural gap |
| --- | --- |
| FinancialProfile | No complete normalization/validation contract or snapshot identity; mixed required scalar and optional inputs cannot consistently distinguish unknown from N/A. |
| IncomeSource | Required scalar averageMonthlyNetIncome cannot represent unreported income; source period and normalized lineage are missing. |
| Expenses | Aggregate optional amounts lack identity, recurrence, period and obligation/debt overlap lineage. |
| Asset | Required currentValue cannot represent unknown valuation; ownership/restriction lineage lives in another record without enforced reconciliation. |
| Liability | Required balances/minimums cannot express unknown; payment principal/interest/fee allocation is not represented in fulfillment. |
| Obligation | Optional amount/date conflate omission with applicability; recurrence and overlap identity are incomplete. |
| Goal | Unknown funding/amount/date and lifecycle normalization are not deterministic. |
| Household | Required scalar dependents/support cannot express missing information; support availability is not owned capital. |
| FinancialResource | Orphan underlying IDs and contradictory availability/amount state are not comprehensively rejected. |
| CapitalAssignment | Unknown, negative/nonfinite amounts, orphan IDs and duplicate identities bypass conservation validation. |
| FinancialClaim | Lifecycle tag exists, but funding amounts, recurring occurrence identity and balanced fulfillment are not enforced. |
| Core metrics | Units/formulas are reviewed in METRIC_CONTRACTS.md; normalized input dependencies, deduplication and executable derivation remain incomplete. |
| Rule predicate AST | Closed shape, no eval, but runtime operator/shape/type validation is missing. |
| ValueRef system | Static registry check is not a runtime guard; approvedValueRefs is unused and Scalar permits incompatible field types/units. |
| RuleResult | Candidate and information-gap shape cannot guarantee complete or contradiction-free resolution. |
| Override contract | Declared OVERRIDE_STAGE / OVERRIDE_MAIN_QUEST are not explicitly implemented; only two halt behaviors are handled. |
| Merge contract | Any NO_MISSION match clears a primary repair task; side-mission limit and key-order-independent semantic deduplication are not enforced. |
| Stage | Definitions below are useful, but mappings and all-unknown output are incomplete; OPTIONALITY qualification remains Research Required. |
| Mission | Reference semantic candidates have no approved transformation into a complete public Mission. |
| Mission verification | VERIFIED_DONE can coexist with NOT_VERIFIABLE and no evidence; no validator rejects this state. |
| DecisionOutput | Version 1.0/IDs are added, but public nonnull Stage/bottleneck conflict with nullable reference outcomes; metrics lack DomainValue and provenance lacks revisions/config snapshots. |
| EvidenceRecord | Stable IDs exist; immutable revisions/supersession and consumed revision references do not. |
| AssumptionRecord | Explicit research status exists; revisions and consumed assumption values do not. |
| ModelRegistry | Seven active models are WORKING with LOW confidence; calculation references do not constitute a complete calculation pipeline. |
| RuleRegistry | Stable IDs exist, but prose/executable parity, versioned config and runtime validation are incomplete. |
| Reference evaluator | Incomplete-input safety and rule-resolution counterexamples fail. Not a production engine. |
| Validation invariants | Present checks validate supplied fixtures/IDs, but accept invalid resource/claim states and cannot certify the complete contract. |

Goal feasibility, cash-flow contradiction materiality and all incomplete reference calculations/context normalization also remain EXPERIMENTAL. None is resolved by adding prose.

## E. RESEARCH_REQUIRED

Repository evidence does not resolve any of these policies:

1. Minimum Viable Liquidity final threshold.
2. Dynamic Safety Target.
3. High-cost debt classification threshold/effective promotional or variable-rate cost.
4. Irregular / seasonal income normalization.
5. Annual / irregular expense periodization.
6. Protection / insurance logic.
7. Taiwan-specific legal / tax / regulatory layer.
8. Liquid-investment haircut.
9. Crypto liquidity / volatility haircut.
10. Settlement handling.
11. Risk Capacity.
12. Risk Tolerance.
13. Asset Allocation.
14. Optionality qualification.

Their configuration slots may be stable while the financial values remain unresolved. No new financial threshold or external guidance is inferred in this review.

## F. DEFERRED

Production execution/persistence, product onboarding/UI, native clients, external account/verification integrations, tax/insurance/portfolio recommendations, trading execution and migration tooling. No implementation is authorized by this review.

## G. Remaining blockers and minimum resolution

| ID | Reproducible or inspected defect | Minimum work; not a redesign |
| --- | --- | --- |
| FR-B001 | R-002 + R-014 produce SURVIVAL / CRITICAL with mainQuest=null. Entirely unknown createContext() produces HIGH confidence, no missing information and no halt. | Validate context completeness/contradictions; retain required primary tasks despite NO_MISSION; gate no-mission on evaluated completeness. Specify and implement each declared override and deterministic merge. Add collision, unknown and input-permutation assertions. |
| FR-B002 | An assignment to assetId=missing with no assets returns valid=true. Unknown/nonfinite/negative amounts are skipped or accepted. | Validate identities, finite nonnegative amounts, knownness and resource restrictions before totals. Separate “valid shape” from “allocation safely calculable”; an unresolved amount must never authorize free capital. Test orphan/duplicate IDs, unknown amounts and reserved/locked/external states. |
| FR-B003 | ACTIVE / FUNDED claim with amount=100 and fundedAmount=0 returns valid=true; a custom interval of 0 is accepted. Debt fixture fulfillment only declares REDUCE_DEBT_BALANCE. | Validate funding against amounts, terminal/unknown behavior and positive recurrence. Define occurrence identity and idempotent terminal effects; debit cash and allocate principal/interest/fees together. Do not build a workflow platform. |
| FR-B004 | Profile monetary inputs lack consistent unknown/period/lineage. Runtime refs are unchecked; generic Scalar permits boolean metrics. R-005 prose requires high-cost debt but its executable condition does not. R-004's prose compares post-obligation liquidity with the same obligations again while its executable predicate only consumes a flag. | Define the minimum normalized input set and typed/unit-bound refs, source-period deduplication, runtime AST/ref guards and exact metric derivation. Reconcile R-004/R-005 prose/predicates. Uncertain financial assumptions stay injected, never guessed. |
| FR-B005 | Valid reference halt/unknown outputs have null Stage/bottleneck but public output requires both; DecisionMetric cannot encode unknown/N/A. No approved complete profile-to-public-output example or verified-Mission guard exists. | Align unknown/halt output shape without inventing a Stage; validate Mission verification; capture actual model/rule/schema/evidence/assumption/config provenance. Execute one balanced cash-only profile→metrics→resources→claims→rules→output trace and its missing-data variant. |

The diagnostic file `tests/freeze-blocker-reproductions.mjs` reports intended versus actual behavior and exits nonzero while a reproduced blocker persists. It is intentionally separate from the existing test command; its FAIL is review evidence, not a green acceptance test. No failing assertion is masked as a TODO.

### Money-flow integrity

See METRIC_CONTRACTS.md for an explicit synthetic salary/assignment/debt/sale trace. It demonstrates the required conservation behavior arithmetically, **not** current end-to-end execution. Purpose assignment must not create an asset; future income and external support must not count as received cash; reserved funds must not be counted twice.

### Claim lifecycle

Lifecycle and funding are orthogonal: CREATED → ACTIVE → FULFILLED | EXPIRED | CANCELLED; while ACTIVE, funding may be UNFUNDED / PARTIALLY_FUNDED / FUNDED / OVERFUNDED. Unknown funding cannot certify fulfillment. Expiry/cancellation must release applicable reservations without deleting history. A recurring template is not the same entity as a dated occurrence; a terminal occurrence cannot reopen or apply balance effects twice. These requirements are pending FR-B003, not frozen behavior.

### Stage and Severity

Stage is a current bottleneck description, never a user rank: SURVIVAL concerns essential shortfalls/delinquency; STABILITY concerns liquidity/information needed for resilience; CONTROL concerns debt/allocation constraints; ACCUMULATION concerns chosen goal funding; GROWTH concerns potential longer-term capital; OPTIONALITY is a reserved exploratory state, not proof of financial freedom. Recompute in either direction as facts change. “No mission” must not automatically prove OPTIONALITY.

Severity is independent. Enum ordering is stable; financial classification remains configurable/incomplete. No numeric score is introduced.

### Localization

APPROVED_FOR_V1: English internal identifiers; semantic code + params; zh-TW primary locale; localized rendering outside the evaluator. This is an architecture approval, not a blanket approval of labels.

| Disposition | Existing terminology keys |
| --- | --- |
| REVIEW_BEFORE_UI | financial_state, need_more_information, allocation_conflict (audit KEEP); primary_bottleneck, funding_conflict, available_safety_liquidity (audit REVISE). |
| NEEDS_RESEARCH | financial_runway, main_quest, side_mission, minimum_viable_liquidity. Future safety/risk/allocation/Optionality and TW legal terms also require research/review. |

Registry descriptions/fixture rationales may contain Chinese; executable predicates do not depend on it. Existing semantic result examples contain no raw zh-TW. Future en-US/ja-JP catalogs can be added without rewriting predicates, but a renderer/catalog implementation is deferred.

### Web/app portability and test sufficiency

The inspected domain/reference files import no React, Next.js, DOM, browser APIs, session or navigation. This is platform independence, **not** a complete portable API: FR-B005 still blocks reuse of the full output safely.

The 24 synthetic, four collision and 15 adversarial scenario records largely describe expectations. The 16 independent executable cases inject normalized flags/metrics instead of deriving them from FinancialProfile and compare only seven summary fields. Existing resource, arithmetic and localization checks are valuable but omit the reproduced failures. Rule-ID coverage is not behavior/invariant coverage. Existing suite success is insufficient to approve freeze.

## H. Versioning policy

The following is the proposed release policy, not a claim that versioned snapshot machinery already exists:

| Artifact | Policy / current gap |
| --- | --- |
| Schema | Proposed money-model-schema@1.0.0 baseline only after approval. No current schemaVersion field; required field additions in this unfrozen candidate must be coordinated with fixtures. |
| Model | modelId@semver; preserve old meaning and record the version actually executed, not every registered model. |
| Rule | Stable R-* ID plus rule version. Change behavior/config with a version and affected tests; current literal 1.0 typing must allow the approved version policy. |
| DecisionOutput | Candidate decisionOutputVersion="1.0" is present. Required unknown/provenance fixes must land before that release is frozen. Clients must handle unsupported versions explicitly. |
| Evidence | Stable EV-* identity, immutable revision when claim/source/limitations change; replacement gets a new ID. Revision field/references are pending. |
| Assumption | Stable AS-* identity plus revision of statement/value/confidence/status; output captures consumed value/revision/config. Pending. |

After freeze, backwards-compatible patch changes correct nonsemantic documentation or add a locale without changing existing contract meaning. **v1.1** may add optional fields/codes/refs or an opt-in model/rule/config default change only with client handling and human review; it must not reinterpret an old version's output. **v2** is required for required-field additions/removals, renamed IDs, changed meanings/unknown behavior, incompatible units or serialization, or ordering/override changes that reinterpret existing inputs. No migration tooling is built now.

## I. Change-control policy

A future frozen-rule change requires: (1) reason, (2) evidence or explicit assumption update, (3) affected Rule IDs, (4) affected Models, (5) affected tests, (6) expected behavior delta including forbidden/negative cases, (7) version change, and (8) human domain/spec review. AI edits cannot bypass these checks. Unresolved research must remain visible and cannot be promoted by a test fixture.

## J. Implementation entry criteria

1. A new formal review explicitly approves the complete domain freeze; this review rejects it.
2. FR-B001–FR-B005 have executable closure evidence and no remaining structural blocker.
3. All five required commands pass, and the separate blocker diagnostics also pass without ignored assertions.
4. Research Required values are isolated/configurable with consumed provenance and unknown behavior.
5. The minimal MVP input set, units/periods and required/optional/unknown/N/A behavior are approved.
6. A complete DecisionOutput example and missing-data/critical/no-mission variants are approved.
7. The MVP-required zh-TW terminology set is reviewed.
8. The consuming implementation identifies exact schema/model/rule/output/evidence/assumption versions.

## K. Final recommendation

**REJECT FREEZE.** Keep only the narrow FROZEN_V1 primitives/formats and CONFIGURABLE_V1 boundaries above. Resolve the minimum five blocker groups and repeat formal review. Do not mark the candidate FROZEN FOR MVP IMPLEMENTATION; do not start product implementation, merge or deploy.

## Validation evidence (2026-10-01)

| Command | Result |
| --- | --- |
| pnpm typecheck | PASS, exit 0. |
| pnpm lint | PASS, exit 0; no warnings. |
| pnpm test | PASS, 80 tests, zero failures/skips/TODOs; includes local Next.js and vinext builds. |
| pnpm spec:validate | PASS, exit 0; validates current registered corpus, not all runtime-invalid states. |
| pnpm build | PASS, separately invoked, exit 0. |
| node --experimental-strip-types tests/freeze-blocker-reproductions.mjs | FAIL, 6/6 intended invariants violated, exit 1. These are open freeze blockers, deliberately not counted in the 80 passing tests. |
| git diff --check | PASS. |

The local vinext build reports an existing route-classification limitation; this is not a deployment. No product UI, /bybit, auth, API or production database schema is changed. .artifacts/ remains untracked and is excluded from the review commit.
