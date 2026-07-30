# Gate A — approved

**Date**: 2026-07-30
**Decision**: Approved. Proceed to R3.
**Reviewed**: 7 era records (440 calibrated claims), `data/adspend.json`, `data/forecasts.json`, and the V1/V2 audit reports.

## State at approval

| Artifact | State |
|---|---|
| Era records | 7 records, 440 claims, 70 dated events, unit-economics on eras 5-7 |
| V1 | PASS, 0 repair cycles. Auditor independently cross-validated all 7 records against the JSON schema (0 errors). |
| Dataset | 1,573 points, 8 series, 19 concordance entries, 32 cross-checks (6 flagged), 14 reconciliation rows, 28 bridged points (all grade C) |
| V2 | PASS, 0 repair cycles |
| Commits | `ddb4faf` (R1), `9036e57` (R2) |

## Decisions taken at this gate

**1. Proceed to R3.** No era needs a re-run. Claim verification may spend against these records.

**2. The three beyond-spec series are kept**: `naa_newspaper` (252 pts), `census_manufactures` (24 pts), `bridge_mce_mg8` (28 pts).

Reason: each closes a gap the five-series spec could not. Classified money-type is derivable from no named compiler series, so without NAA the classified thread — central to the source-of-funds story in era 6 — has no data. No independent aggregate exists before 1960, so without Census the whole pre-1960 stretch has no cross-check. Isolating bridged values in their own series keeps constructed numbers out of the real compilers' series, which the splice-honest rule requires.

Downstream constraint: **the chart layer must not hard-code five series keys.** Doing so silently drops the classified axis, the pre-1960 cross-check, and the bridge ribbon. Carry this to the design grill.

## Findings carried forward

**To R3 (verification priorities).** The ad/GDP maximum is contested inside our own records: era 2 puts the 1919-2007 peak at 3.0% in 1922, above 2000's 2.5%, while the scout probe framed the peak as 2000. Era 1's 1909-1914 benchmarks compute to ~3.0-3.5% but on a broader numerator and a reconstructed pre-1929 denominator, so they are not directly comparable. Verify the 1922 figure and the denominator basis before chapter 09 takes a stance.

**To R2's successors (rail discipline).** Magna and IRS agree to 0.79% in 2007 and diverge to -31% by 2022; the 1960 cross-check added at this gate shows -22.3%. No prose may state a US ad-spend number without naming its rail.

**To the chapters.** The Coen-to-Magna break decomposes to 69% category scope and only 7.2 points billings-vs-revenue basis. The common "different methodology" explanation is wrong in its emphasis and should be corrected explicitly rather than repeated.

**To Gate B.** The forecast panel's own caveat outranks its numbers: every 2026 target is basis-dependent, and an eMarketer-basis resolver puts all four outside the stated 80% intervals. Retail media and search overlap heavily and must never be summed.

## Verifier defects found and fixed before this gate

Three defects, all in my own tooling, all surfaced by agents rather than by me:

1. `r2-reconcile` compared dollar totals against percentages, shares, year-on-year changes, and world figures (reported by the series-archaeologist; verified and fixed in `f1b677a`).
2. `r2-checks` audited only existing cross-check entries and never verified coverage, hiding a 1960 overlap year whose divergence (-22.3%) breaches tolerance (predicted by the V2 auditor; fixed and the entry added in `9036e57`).
3. `_assembled_totals` selected on `medium` alone, so row order decided whether a true total or a money-type subset was compared. 73 years were ambiguous; all resolved correctly by luck. Fixed in `9036e57`.

`r1-acq-01` was also tightened to validate against the real JSON Schema rather than a proxy (`de1146b`), after the V1 auditor flagged the wording had drifted from the implementation.
