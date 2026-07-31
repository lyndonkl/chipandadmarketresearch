# Data layer — FROZEN

**Frozen**: 2026-07-31, on the authority of the Gate B decision (`../planning/gate-b-approval.md`), after its condition — stage R2b, the money-type re-research — passed its verifier.

These four files are now the single source of truth. The design grill and the experience build cite them. Nothing downstream re-researches.

| File | Contents |
|---|---|
| `claims.json` | 505 calibrated claims, each with an id, central, 80% CI, source grade, sources and as-of date |
| `adspend.json` | 1,573 points across 8 named series, 19 concordance entries, 32 cross-checks, a documented 1980–2007 bridge, 14 reconciliation rows |
| `mechanism.json` | Both engines, 209 machine-checkable arithmetic steps |
| `simulator-params.json` | 21 variables, 21 scenarios, cross-validated against mechanism.json |

Supporting, also frozen: `eras/era-1..7.json`, `verification/verdicts.json`, `moneytype/reconciled.json`, `forecasts.json`.

## What "frozen" means

Changing a frozen number requires the same discipline that produced it: a new stage with a contract, a verifier, and a recorded supersession. It does not mean the numbers are certain — it means they are **fixed, sourced and auditable**, so anything built on them can be traced back.

The precedent is already set. R2b superseded eight R3 values, and rather than editing history, `verdicts.json` annotates each with the superseding stage, the reason, the governing value and a pointer to the audit trail. The R3 record is untouched. Any future change follows that pattern.

## Post-freeze changes

**R3b — 2026-07-31.** Three era-2 MEASUREMENT claims overturned, all three of which R3 had *confirmed*: `e2-measurement-003`, `-005` and `-007`. No central moved; `e2-measurement-005` widened its ci80 from [800, 800] to [500, 800] over an unresolved conflict between two published figures. The errors were in what the numbers referred to, not in the numbers. One further impossible statement (`e5-events-007`) was found and deliberately **not** repaired, because no source settled it; it carries an `open_defect` marker in `eras/era-5.json`, `claims.json` and `verdicts.json`. Chapter 03 was rewritten to match and still clears all four readability gates.

R3b followed the R2b pattern exactly: the R3 entries still read `"verdict": "confirmed"` with their original evidence intact, and each carries a `superseded_by` naming stage R3b. Read `verification/REPAIR-R3b.md` before trusting any secondary number inside a claim's `statement` — section 4 explains why four gates missed a four-order-of-magnitude error, and section 6 lists twelve items still open for a human.

## Verification state at freeze

All 20 deterministic checks pass. All ten chapters clear the four readability gates. Every stage contract (r1, r2, r2b, r3, r4, r5) has a PASS report in `../planning/contracts/`.

Claims by grade: **A 133+, B 262+, C 103+** (counts shifted slightly with R2b and the seam). Every grade-C claim carries a method documenting its derivation.

## Three things a builder must not get wrong

**1. Do not hard-code five series keys.** `adspend.json` carries eight. A reader of only the five originally specified silently loses the classified axis, the pre-1960 cross-check and the bridge ribbon.

**2. The century series is not one line.** Coen/McCann runs 1919–2007 on a billings basis; Magna backcasts to 1980 on a media-owner-revenue basis. The break decomposes to 69% category scope and only 7.2 points price basis. Seams are content and must be visible. Post-2015, Magna and IRS diverge by roughly a third — any US ad-spend number must name its rail.

**3. Era 5 carries two taxonomies on purpose.** `by_money_type` is the era-native geographic split; `by_money_type_alt` is the cross-era comparable, on which all directory money sits in one intent pool. Cross-era comparisons use the alt. The two rules order local retail and direct response differently — but under both, the intervals overlap, so the pair is unranked either way. The flip is an artifact of classification, not a fact about the market. See `moneytype/reconciled.json → taxonomy_seam`.

## Known limits, stated plainly

- No free by-medium US series exists for 2011–2025 (`ds-gap-001`). Any visual needing post-2007 medium resolution cannot be improved without a licensed series.
- Era 1's money-type split is wholly grade C. No compiler ever published it for 1840s–1917; that is a documented negative result, not an oversight. Its residual is 37.8%.
- Era 7's national-brand, local-retail and direct-response pools are mutually unranked; only their ordering against classified is established.
- Era 7 data freezes at 2026-06-30. Later events belong to P3.
- The 2026 forecast targets are basis-dependent; an eMarketer-basis resolver puts all four outside the stated intervals. Retail media and search overlap heavily and must never be summed.
