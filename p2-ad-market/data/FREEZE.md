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

**P1 — 2026-07-31.** Two things, both following the same pattern.

*The `as_of` definition is now fixed, and it is not the fact year.* `as_of` is **provenance**: when the governing source published, filed or was retrieved. It never appears on an axis and never acts as a time filter. A new required integer field **`about_year`** carries the year the fact is about, and it is the only field a chart may read; `about_span` carries the band where a fact spans years, and `timeline_ready: false` withholds permission to draw. No `as_of` value was changed. 60 of 505 claims would have been plotted at their source's publication date, the worst by 86 years (`ds-gdp-001`, `as_of` 2008-09-14 for a 1922 fact). The gate is `tools/verify_p2.py p1-timeline`; the audit is `verification/asof-audit.json` and `../research/notes/asof-audit.md`.

*Eleven claims adjusted from the R3c re-attack on the fifteen open items* (`verification/repair-p1-open-items.json`). One central moved: `e7-unit_econ-006`, 0.00022 → 0.000165. Three era-7 AI-cost claims had a second, undeclared series (the frontier tier) sitting in their `ci80` field. Splitting it out cut their intervals from 19.5x–28x of central to 2x–7x. `e5-events-007`'s R3b `open_defect` is **closed** — the unsupportable share clause is deleted, the source and the value stand. Sixteen supersessions were recorded under stage P1, five of them a records-integrity sweep (R3c finding XC-4) of confirmed verdicts that still certified values R2b had replaced. Nine chapters were updated and all ten still clear the four readability gates. Read `verification/REPAIR-P1.md`.

**B1 — 2026-07-31.** `simulator-params.json` gains two fields. No number moved, no scenario changed, and nothing was re-researched; this is the same pattern as P1's `about_year` — a required field added so a downstream guard can enforce what the prose was only asserting.

*Every scenario now carries a `mechanism_scope`* naming which auction rule it demonstrates, which surface it ran on (`search` or `display`) and which years, drawn from a new top-level `mechanism_scope_rules` vocabulary whose eight entries each cite the `mechanism.json` path they came from. A scenario without a scope is a hard error in `docs/p2/lib/guards.js` (guard G7), and **no scope may pair the search surface with a first-price rule**. The reason is the one `mechanism.json` already states: on 2019-09-05 the DISPLAY exchange moved to unified first price and SEARCH did not, and conflating the two is "the standard error in retellings of the 2019 transition". The guard used to try to catch that error by scanning captions. Prose scanning is now advice; the scope check over these 21 records is the enforcement.

## The guard library: what is guaranteed and what is advice

Not every check in `docs/p2/lib/` is a guarantee, and three that read like one are not. **G4** guarantees the shape of a series selector and a written reason on any subset. It never guarantees the whole record reaches the page. **G7's caption test** guarantees the record's true sentence is on screen. It says nothing about a false one printed beside it. The **prose lint is a heuristic**: 19 caught and 22 missed over a 5,593-string corpus, so an empty result is never a clearance.

The row-by-row table is `docs/p2/lib/README.md` → **"What is guaranteed and what is advice"**. Read the row, not the function name, before building on any guard.

## Verification state at freeze

All 21 deterministic checks pass, including `p1-timeline`. All ten chapters clear the four readability gates. Every stage contract (r1, r2, r2b, r3, r4, r5) has a PASS report in `../planning/contracts/`.

Claims by grade: **A 133+, B 262+, C 103+** (counts shifted slightly with R2b and the seam). Every grade-C claim carries a method documenting its derivation.

## Four things a builder must not get wrong

**1. Do not hard-code five series keys.** `adspend.json` carries eight. A reader of only the five originally specified silently loses the classified axis, the pre-1960 cross-check and the bridge ribbon.

**2. The century series is not one line.** Coen/McCann runs 1919–2007 on a billings basis; Magna backcasts to 1980 on a media-owner-revenue basis. The break decomposes to 69% category scope and only 7.2 points price basis. Seams are content and must be visible. Post-2015, Magna and IRS diverge by roughly a third — any US ad-spend number must name its rail.

**3. Era 5 carries two taxonomies on purpose.** `by_money_type` is the era-native geographic split; `by_money_type_alt` is the cross-era comparable, on which all directory money sits in one intent pool. Cross-era comparisons use the alt. The two rules order local retail and direct response differently — but under both, the intervals overlap, so the pair is unranked either way. The flip is an artifact of classification, not a fact about the market. See `moneytype/reconciled.json → taxonomy_seam`.

**4. Search never moved to first price.** In 2019 two things happened on opposite sides of Google's business, in opposite directions. Google Ad Manager — the open-web DISPLAY exchange — moved to a unified first-price auction on 2019-09-05. Google SEARCH did not, and never has; the 2019 search change was rGSP, a randomised generalised second-price auction the DOJ record shows was an explicit revenue play. `mechanism.json` calls the conflation "the standard error in retellings of the 2019 transition". Every simulator scenario declares its surface in `mechanism_scope`, and the guard refuses a first-price rule on search.

## Known limits, stated plainly

- No free by-medium US series exists for 2011–2025 (`ds-gap-001`). Any visual needing post-2007 medium resolution cannot be improved without a licensed series.
- Era 1's money-type split is wholly grade C. No compiler ever published it for 1840s–1917; that is a documented negative result, not an oversight. Its residual is 37.8%.
- Era 7's national-brand, local-retail and direct-response pools are mutually unranked; only their ordering against classified is established.
- Era 7 data freezes at 2026-06-30. Later events belong to P3.
- The 2026 forecast targets are basis-dependent; an eMarketer-basis resolver puts all four outside the stated intervals. Retail media and search overlap heavily and must never be summed.
