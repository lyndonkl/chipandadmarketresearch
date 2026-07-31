# Gate B — approved with one condition

**Date**: 2026-07-30
**Decision**: Threads selected. Data-layer freeze **conditional** on stage R2b (money-type re-research) completing first.
**Reviewed**: 10 chapters, `data/claims.json` (498 claims), `thread-candidates.md` (14 candidates), the V5 report.

## 1. First-class threads selected

Four of the fourteen candidates. Each becomes a synthesis chapter plus its own visual.

| # | Thread | Strength | Why it was picked |
|---|---|---|---|
| 1 | Who counted, and who paid the counter | **A** | Every pricing regime was created by a measurement regime, and the discipline was that someone other than the seller counted — holding 1914 to ~1996, then breaking. 44 claims, one grade-C. Two natural experiments where the instrument changed and the price moved with nothing else changing (1987 people meters; 2021 Nielsen undercount). |
| 2 | The intermediary's cut | **A−** | The take began as a visible, cartel-fixed 15% and ended as an invisible share nobody can measure. The strongest single handoff to P3. |
| 3 | Who was allowed to buy | **A−** | Unanticipated. The self-serve, no-agency buyer exists in every era since the 1840s. Carries an A-grade side-by-side of Overture's and AdWords' entry gates in the same year. |
| 5 | The rent on the front door | **A−** | Unanticipated. 27 of 39 claims grade A, from radio affiliate compensation in 1938 to $26.3B of default payments in 2021. One instrument, 80 years, and the 2025 remedy preserved it. |

Not selected, and why: **#4** (who set the price) is the era spine restated; **#6** (spend and medium shift) is the signature chart, which exists regardless; **#8** (capture vs expansion) is already chapter 09. The remaining seven are available as sidebars if the design grill wants them.

## 2. The freeze is conditional

The data layer is **not** frozen yet. The money-type migration is the project's central claim and carries its weakest numbers:

- Era 1: the four shares sum to 72%, and all four are grade C.
- Era 5: eight claims, all grade C.
- Era 7: the middle two pools cannot be ranked, because their intervals overlap.

No compiler publishes this split. It is our construction in all seven eras, so freezing it freezes our own reasoning rather than a source.

**Condition**: run stage **R2b** against eras 1, 5 and 7 before the freeze. Two objectives, in order:

1. **Source hunt.** Establish whether a better primary or near-primary source exists for the split in each era. A documented "no source exists" is a valid and valuable outcome.
2. **Proxy estimation where no source exists.** Apply the valuation discipline used for unobservable quantities — the private-company problem — rather than leaving a thin grade-C number. Derive the split from observable proxies, document the proxy chain and its assumptions, and let the proxies' own dispersion set the interval. Prefer several independent proxies that triangulate over one clever one.

**Team shape** (per the human's instruction at this gate): variants of the forecasting panel plus the special-situations valuation approach, each given the above as context. Independent reference classes per panelist; the median is the headline; panel spread is reported, never smoothed.

The freeze happens after R2b passes its verifier.

## 3. Carried to the design grill

- **The chart layer must not hard-code five series keys** (carried from Gate A). Doing so silently drops the classified axis, the pre-1960 cross-check and the bridge ribbon.
- The four selected threads each need a visual; thread 1's is a two-track timeline of counting institution over funder, colour-coded by who paid, annotated with the two price shocks.
- 21 simulator scenarios are specified and cross-validated in `data/simulator-params.json`, including the first-price/bid-shading panel.
