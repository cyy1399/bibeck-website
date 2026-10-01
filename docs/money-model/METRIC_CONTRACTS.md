# Money Model V1 — Metric Review Contracts

Status: **review candidate, EXPERIMENTAL; not a frozen or implemented metric pipeline**. See FR-B004 / FR-B005 in BIBECK_MONEY_MODEL_V1_FREEZE_REVIEW.md.

## Shared normalization boundary

- Every monetary dependency must be finite, in the same explicitly normalized primary currency, with a source/as-of period. The current profile has only a global primaryCurrency and cannot validate raw mixed-currency inputs by itself.
- Stock values use one as-of instant; flow values use the same approved monthly observation/normalization period. They cannot be summed interchangeably.
- Monetary input magnitudes and mandatory outflows are nonnegative. Net Worth, Core Cash Flow and Monthly Surplus may be negative. Ratios must not become NaN or infinity.
- A required UNKNOWN operand propagates UNKNOWN plus its information gap. NOT_APPLICABLE is not zero: only an explicit model rule may exclude a structurally inapplicable component. Omitted optional fields/empty arrays do not prove a known zero or completeness.
- Net income means after the applicable taxes/withholding/earning costs; the profile field alone does not prove that normalization. Do not subtract the same income-production cost again as a household outflow.
- Recurring period amounts and one-time dated claims are distinct. Annual/seasonal conversion policy remains Research Required.
- Each economic payment/resource needs source identity/lineage. Overlapping expense, debt minimum and obligation entries are counted once. If overlap cannot be resolved, output UNKNOWN rather than choosing a guessed deduction.

These are the required deterministic bookkeeping boundaries. They do not select a financial threshold or approve normalization/tax policy.

## Metric-by-metric review

| Metric | Exact required dependencies and candidate definition | Unit, exclusions and invalid-state behavior |
| --- | --- | --- |
| Net Monthly Income | income[].averageMonthlyNetIncome, with complete source set, net-basis evidence and approved period. Sum normalized recurring net income. | Currency/month. This is a flow estimate, not current cash. Future expected salary may inform a separately qualified flow estimate but never becomes owned cash before settlement. Exclude asset-sale principal and borrowing. Unresolved irregular/seasonal/net basis → UNKNOWN. |
| Core Monthly Outflow | Unique union of expenses.necessaryMonthly, liabilities[].minimumMonthlyPayment, expenses.otherMonthlyRequired and recurring required obligations not already represented in those aggregates. Sum each economic payment once. | Currency/month, nonnegative. Exclude discretionary amounts and one-time obligations. Expenses/Obligation currently lack recurrence/source overlap fields; an amount cannot be assumed recurring merely because it exists. |
| Core Cash Flow | Net Monthly Income − Core Monthly Outflow. | Currency/month, signed. Positive means arithmetic excess on the defined core basis, not a recommendation. Unknown component → UNKNOWN. |
| Monthly Surplus | Net Monthly Income − Core Monthly Outflow − expenses.discretionaryMonthly. | Currency/month, signed. Required recurring items are already in Core Monthly Outflow; no second subtraction. One-time sale/goal/payment is not recurring capacity. |
| Net Worth | Sum owned assets[].currentValue − sum liabilities[].balance at one as-of instant. | Currency, stock, signed. Assignments/resources are not additional assets. Exclude future income and external support. Ownership/valuation incompleteness → UNKNOWN. Gross asset value must not subtract its liability twice. |
| Available Safety Liquidity h | FinancialResource[], underlying Asset[], CapitalAssignment[], active required dated claims/Obligation[], explicit as-of/horizon h (30/90/365 days). Realizable owned value less unique restrictions/reservations and uncovered required claims in h. | Currency, stock by horizon; not income/month. A claim already reserved is deducted once, not once as reservation and again as claim. Locked/external/unsettled or jointly restricted value cannot be treated as free cash without supported ownership/settlement policy. Material unknown amounts/haircuts/availability → UNKNOWN. |
| Financial Runway | The explicitly identified post-obligation Available Safety Liquidity h ÷ Core Monthly Outflow. | Months. Known denominator must be >0; zero/unknown/inapplicable → UNKNOWN with reason, not infinity. Retain h/as-of and denominator period. Do not deduct the same near-term obligations again. Horizon selection/deficit presentation is not implemented. |
| Debt Service Ratio | Deduplicated mandatory monthly debt payments ÷ Net Monthly Income on the same net monthly basis. | Ratio (0.25 means 25%; renderer handles percent), not currency. Net income must be >0. Zero/negative/unknown income → UNKNOWN. Voluntary acceleration is excluded. No risk classification threshold is frozen. |
| Income Concentration | Largest approved normalized recurring source amount ÷ total Net Monthly Income, with source aggregation identities. | Ratio, denominator >0. Complete source set required. Unknown normalization/source grouping → UNKNOWN; no concentration threshold is inferred. |
| Long-term Investable Capital | max(SustainableAllocatableCapital − unique HigherPriorityCapitalClaims, 0), with one explicit stock basis/as-of and claim/reservation lineage. | Currency, stock. Do not mix a monthly surplus with current capital or subtract funded reservations twice. These two normalized dependencies are not yet defined/derived end-to-end; no output is authorized by the formula alone. |

### Required liquidity clarification

The existing liquidity contract subtracts required obligations to produce post-obligation available safety liquidity. R-004's prose condition then compares that residual with requiredObligations again; its executable predicate only consumes hasImmediateFundingGap and does not derive the comparison. These are different bases: use either pre-obligation liquidity versus obligations, or post-obligation residual versus a separately defined buffer. Do not compare the residual to the same already-deducted obligations. Choosing/validating a buffer remains Research Required; reconcile the contract/predicate before freeze.

### Current implementation limits

reference/calculations.ts implements generic sum/subtract/ratio/netWorth helpers, not the full table. model-calculation-contracts.ts contains descriptions and some helper references, including non-calculator validators. createContext() mostly initializes UNKNOWN values and is not FinancialProfile normalization. The input schema cannot yet enforce source-period, recurrence, ownership and deduplication requirements. These definitions document gaps; prose is not execution evidence.

## Synthetic conservation trace

The following amounts demonstrate bookkeeping only, not recommended allocations or a financial priority policy.

1. Opening settled owned cash: 50,000. A salary of 60,000 is an expectation until received; upon receipt cash becomes 110,000. Do not also add the historical monthly-income metric to assets.
2. Partition the same 110,000: operating 30,000 + safety 20,000 + debt minimum 10,000 + debt acceleration 15,000 + goal 10,000 + long-term 25,000 = 110,000. Purpose labels do not create six additional assets. Dedicated reservation/purpose records refer to this one cash asset.
3. Pay the debt minimum: 10,000 cash outflow, explicitly 8,000 principal + 2,000 interest. Pay acceleration: 15,000 cash outflow, explicitly all principal in this synthetic example. Opening debt 100,000 becomes 77,000; cash becomes 85,000. Release/consume the two debt assignments totaling 25,000; remaining purposes total 85,000.
4. Net Worth impact of step 3 is −2,000 interest, not −25,000 and not +23,000. Unknown principal/interest/fees leave the liability delta UNKNOWN; the model cannot assume all payments reduce principal.
5. If 10,000 is moved into an owned goal account, source cash falls and the destination owned asset rises; total assets do not change. If spent to fulfill a goal, assets fall by the consumed amount. FUND_GOAL alone does not specify which transition happened.
6. A separate existing investment sale with carrying value 10,000 and settled net proceeds 10,000 moves investment −10,000 and cash +10,000; assets are conserved. If proceeds differ or fees apply, record the gain/loss/fees explicitly rather than retaining both investment and cash. Pending proceeds remain unsettled; availability timing/tax/haircut policy stays Research Required.
7. External support remains external until a supported transfer creates an owned settled asset. A promise is not current owned safety capital.

Pending FR-B002/FR-B003: validate references and amounts; post balanced effects atomically; consume/release reservations; prevent duplicate events/occurrences; recompute from the resulting snapshot. Existing fixtures do not execute this full trace. Recurring claims need a separate occurrence ID/date; fulfillment must never reopen or pay the previous occurrence twice.
