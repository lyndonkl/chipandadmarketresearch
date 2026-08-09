# Deep dig — Thread #6: Capture, not expansion (the ad-intensity paradox)

**Through-line:** Every era's advertising "explosion" sits on top of a real *intensity* that peaked at 3.0% of GDP in **1922** and has never come back. The platform era's ~$405B looks like conquest. But on the one instrument that spans the century, it reads as the lowest ad/GDP the country has run since the Second World War.

**Subject type:** SYSTEM — the US advertising market measured as a share of the economy, seen through a single measuring instrument (the Coen/McCann-Erickson series as published by Galbi, contested by Silk & Berndt NBER WP 28161).

**Status of the thread:** The "capture-versus-expansion argument" is **not my framing — the corpus author built it into the era fields explicitly** (`tu:era:2:field:SCALE`, `tu:era:3:field:SCALE`, `tu:era:7:field:SCALE`). That is itself the discovery: the graph already knows this is the spine.

---

## Frame lock (outcome-blind)

- **UNIT:** one calendar year's total US advertising expenditure expressed as a share of same-year US nominal GDP ("ad intensity").
- **DENOMINATOR:** US nominal GDP.
  - *Rejected alt — National Income:* Silk & Berndt use it and it puts the 1920s peak **above 4%** (`e5-scale-002`), i.e. even more extreme; GDP is the conservative denominator.
  - *Rejected alt — constant dollars / nominal totals:* nominal totals only ever rise (that is the illusion the thread exists to puncture), so the ratio is the honest unit.
- **WINDOW:** 1919–2025. Left edge = first year of the Coen/McCann series (`e2-scale-001`); right edge = latest reported year (`e7-scale-001`). The 1922 peak and 1944 trough are interior extrema, not chosen endpoints.
- **BOUNDARY (the load-bearing caveat):** "US advertising" = the Coen/McCann series (1919–2007) **spliced** to a MAGNA media-owner basis with direct mail excluded (2025). These are **not strictly commensurable** — the corpus says so itself (`e7-scale-002` method). Any comparison across the splice is "partly real and partly a change in what 'advertising' counts."

**Starting hypothesis (from the pick, dated 2026-08-08, before drilling):** "Every era's 'explosion' is mostly reallocation inside a share of the economy that peaked a century ago." The record is then asked to support "reallocation, not growth" for both the TV rise and the platform rise.

**Hypothesis diff after drilling:** *Mostly confirmed, with two corrections the evidence forced.* (1) It is **not** monotonic decline — there is a genuine intensity **climb** from the 1975 trough (1.66%) to a post-1960 peak of ~2.5% in 2000 (`e4-scale-003`, `e5-scale-002`); real deepening happened once. (2) The 2025 sub-trough (1.32%) is **real-but-contested**: partly a measurement/boundary artifact, because the platforms sell money older series never counted (`e7-scale-002`, `tu:era:7:field:SCALE`). So "capture is really shrinkage" is defensible but must ship with its counter-reading attached.

---

## The quantified arc (the spine) — ad spend as % of US GDP

Every value below is a graded claim; hedge, grade, interval and verdict preserved.

| Year | Ad/GDP | Claim | Grade | Verdict | Note |
|---|---|---|---|---|---|
| **1922** | **3.0%** | `e2-scale-004` | B | confirmed | Highest reading in the entire 1919–2007 Coen/BEA series. CI80 2.6–3.2. |
| 1929→1933 | (nominal −53.5%) | `tu:era:2:field:SCALE` | — | — | $2,850M→$1,325M; deepest peacetime collapse in the series (Depression texture). |
| **1944** | **1.2%** | `e2-scale-005` | B | confirmed | Lowest reading in the series — but because GDP more than doubled in the war, not because ad spend collapsed. CI80 1.1–1.3. |
| 1949 | 1.9% | `e2-scale-006` | B | confirmed | The level carried into the television era. |
| 1950 | ~1.9% | `e3-scale-004` | B | confirmed | TV-era starting intensity. |
| 1956–60 | ~2.2% (plateau) | `e3-scale-005` | B | adjusted | Peak *inside* the TV era, then trends down. CI80 2.1–2.35. |
| **1975** | **1.66%** | `e3-scale-004` | B | confirmed | Down from 1.9% in 1950 — **TV's whole rise happened while intensity fell.** CI80 1.6–1.75. |
| 1986–89 | ~2.3% (plateau) | `e4-scale-003` | B | adjusted | The climb back up. |
| **2000** | **2.5%** (Galbi/Coen); 2.3–2.4% (Silk & Berndt MCE/IRS) | `e4-scale-003`, `e5-scale-002` | B | adjusted | Post-1960 maximum — **still below 1922.** |
| 2007 | 2.0% | `e7-scale-002` | C | adjusted | Last year of the Coen/McCann series. |
| **2025** | **~1.32%** ($405B / $30.762T) | `e7-scale-002` | C | adjusted | Down from 2.0% (2007) and 2.3–2.4% (2000); **barely above the 1944 wartime floor.** CI80 1.24–1.48. Commensurability caveat attached (see below). |

**Two-regime paradox — nominal "explosion" vs intensity contraction:**
- **TV regime (1950–75):** nominal spend $5,700M → $27,900M, a **4.89-fold rise, +6.6%/yr** (`e3-scale-001`, `e3-scale-002`, `e3-scale-003`). Intensity **fell** 1.9% → 1.66%. "Television took share from other media rather than enlarging the pot" (`tu:era:3:field:SCALE`).
- **Platform regime (2007–25):** nominal spend ~$280B → ~$405B (`e7-scale-001`). Intensity **fell** 2.0% → 1.32% (`e7-scale-002`). "Measured US advertising intensity fell while the platforms that supposedly captured advertising grew" (`tu:era:7:field:SCALE`).

Same signature in two regimes 60 years apart = the two-regime test passes for a systemic character.

---

## The opposition / corrective web

The corpus wires the corrective **into the thread itself**. Three distinct correctives, all sourced:

1. **Myth-buster (the received story reversed).** The folk belief that advertising is a stable ~2% of GDP is an artefact of only ever quoting the post-1960 window. Era-2 field states the challenge in the author's own voice: *"Anyone arguing that a later era 'captured' an unprecedented share of the economy has to explain 1922 first."* (`tu:era:2:field:SCALE`). Grounded in `e2-scale-004` (3.0% 1922) and `e5-scale-002` (2000 peak "not of the century").
   - *DEAD-column note:* the compact form of this claim, `ds-gdp-001` ("the 'constant 2% of GDP' folklore is an artefact…", grade C) and `ds-total-001` (grade B), both carry **verdict `rejected`**. The through-line does **not** rest on them; every surviving fact is re-sourced to confirmed/adjusted era claims. Kept in the ledger, not leaned on.

2. **Reallocation, not new money (the mechanism).** `tu:era:3:field:BUYERS`: *"The striking fact is how little the mix moved: the four pools held 43/36/7/14 percent of US spend in 1950 and 40/38/8/15 percent in 1975. Television's rise from 3% to 19% of all spend was a reallocation inside national brand money — away from radio, magazines and national newspaper space — not a change in what kinds of money existed."* This is the "capture, not expansion" claim in miniature: the medium changed; the money did not grow relative to the economy and the money-type mix barely moved.

3. **The strongest counter-reading — measurement, not shrinkage (kept, not resolved).** The 2025 figure's own method block says the fall is *"partly real and partly a change in what 'advertising' counts"* (`e7-scale-002`, grade C). The comparison years use a different series that ends in 2007. Much of what Google, Meta and Amazon now sell *"was money that older series never counted as advertising at all — Yellow Pages listings, classified lineage, co-op and trade allowances, catalogue and lead-generation spend"* (`tu:era:7:field:SCALE`). That is why **Silk & Berndt (NBER WP 28161) frame the whole question as "a growth problem, a measurement problem, or both."** **This must ship with the thread.** The platform-era "capture is really shrinkage" reading is defensible but not clean.

Graph-wired opposition edges near the thread (queried `EXCLUDES/NOT_CAUSED_BY/CONFLICTS_WITH/RECONCILED_WITH`):
- `e4-scale-003` **EXCLUDES** "summit phase" — the corpus formally tags Era 4 as *"the climb, not the summit."*
- `e6-scale-009` **NOT_CAUSED_BY**: real-estate classified **not caused by** search — *"Real-estate classified peaked mid-era in 2006 and then fell with the housing market, not with search"* (grade **A**). A local corrective against attributing every decline to the platforms.
- `e1-scale-004` **CONFLICTS_WITH**: Coen 1999 revision vs Printers' Ink — the series disagrees with itself even at the origin.

---

## The instrument is the load-bearing actor (reflexive finding)

There is no human protagonist. The century-spanning number exists because of **one compiler (Robert Coen, McCann-Erickson), one publisher (Douglas Galbi), and one problematizer (Silk & Berndt).** The whole paradox is only visible through that single fragile instrument — and the instrument is biased at *both* ends in ways that matter to the thread:

- **Early-end upward bias:** Coen's 1938 radio figure ($167M) is **~1.66× the FCC's audited industry net time sales ($100.9M)** for the same year (`e2-scale-009`, grade C). The gap is *"consistent with the McCann-Erickson series being built on list rate-card prices rather than transaction prices."* So the 1920s–30s intensity peak may be *overstated* — which would make the historic peak lower and the decline shallower.
- **Late-end downward bias:** the 2025 media-owner basis **excludes direct mail and the new platform money-types** older series would not have counted (`e7-scale-001`, `tu:era:7:field:SCALE`). So the modern intensity trough may be *understated* — which would make the decline shallower from the other side.
- **Vintage instability:** the same Coen 1990 total prints as $129,590M (2001) and $129,968M (2009) — a 0.29% revision "recorded rather than smoothed, as a marker of how much this series moves between vintages" (`e4-scale-006`, grade B). Small here, larger pre-1935 where the 1920s figures were revised down ~15% and are "estimate-grade" (`tu:era:2:field:SCALE`).

**POSIWID reading of the system:**
- *Stated purpose (folklore):* advertising is an ever-expanding force; each new medium captures and grows the pie; "constant 2% of GDP."
- *Revealed function:* advertising has been a **flat-to-declining share of the economy since 1922**; each medium's "explosion" is nominal growth (economy + inflation + reallocation) inside an intensity that peaked a century ago.
- *Gap = the engine.* Stated expansion vs revealed capture/reallocation.
- *Mandatory residual (what "reallocation, not growth" does NOT explain):* Two outcomes break the tidy story. First, the **1976→2000 intensity climb**, 1.66%→2.5%, is ~0.85 points of *real* deepening (`e4-scale-003`, `e5-scale-002`) — the internet/dot-com build was not pure reallocation. Second, the **measurement/boundary problem** at 2025 could erase much of the apparent modern shrinkage (`e7-scale-002`). The system is not a clean monotone decline, and not a clean malign-capture optimiser.

---

## Best 6–10 cited findings (the goods)

1. **The peak is 1922, not now.** Ad spend hit **3.0% of GDP in 1922, the highest reading in the entire 1919–2007 series** (`e2-scale-004`, B, confirmed). On National Income it was **>4%** in the 1920s (`e5-scale-002`, Silk & Berndt).
2. **2025 is near the wartime floor.** ~**1.32% of GDP in 2025** ($405B/$30.762T), down from 2.0% (2007) and 2.3–2.4% (2000) — barely above the **1944 low of 1.2%** (`e7-scale-002`, C, adjusted; `e2-scale-005`, B, confirmed).
3. **TV's rise ran against a falling intensity.** Nominal spend rose **4.89× (+6.6%/yr) 1950–75** (`e3-scale-003`, C) while ad/GDP **fell 1.9%→1.66%** (`e3-scale-004`, B) — *"television took share from other media rather than enlarging the pot"* (`tu:era:3:field:SCALE`).
4. **The money barely moved.** Four money-type pools were **43/36/7/14% in 1950 and 40/38/8/15% in 1975**; TV's rise from 3%→19% of spend was reallocation inside national-brand money, "not a change in what kinds of money existed" (`tu:era:3:field:BUYERS`).
5. **Era 4 is the climb, not the summit — and there WAS a real climb.** 1.66% (1975) → 2.5% (2000) is genuine intensity deepening (`e4-scale-003`, B, adjusted; formally EXCLUDES "summit phase"). The one outcome the pure-reallocation thesis must concede.
6. **The strongest counter-reading, from the corpus itself:** the 2025 fall is *"partly real and partly a change in what 'advertising' counts"*; Silk & Berndt frame it as *"a growth problem, a measurement problem, or both"* (`e7-scale-002`, C; `tu:era:7:field:SCALE`). Platforms sell money older series never counted.
7. **The instrument is biased at both ends.** Coen's 1938 radio figure is **~1.66× the FCC's audited net time sales** (rate-card not transaction prices; `e2-scale-009`, C) — peak possibly overstated; the 2025 basis excludes direct mail and new money-types (`e7-scale-001`) — trough possibly understated.
8. **Not everything is the platforms' doing.** Real-estate classified *"peaked mid-era in 2006 and then fell with the housing market, not with search"* (`e6-scale-009`, grade **A**, NOT_CAUSED_BY search) — a graded guardrail against over-attributing the decline to Google.
9. **The received story is a windowing artefact.** The "constant ~2% of GDP" belief comes from quoting only the post-1960 window; *"Anyone arguing that a later era 'captured' an unprecedented share of the economy has to explain 1922 first"* (`tu:era:2:field:SCALE`). *(Compact forms `ds-gdp-001`/`ds-total-001` carry this content but are verdict-`rejected` — DEAD column; the finding survives on confirmed era claims.)*

---

## DEAD column (kept, not deleted)

| Claim | Grade | Verdict | Disposition |
|---|---|---|---|
| `ds-gdp-001` (folklore-artefact, full-arc) | C | **rejected** | Content re-sourced to `e2-scale-004`, `e2-scale-005`, `e5-scale-002`, `e7-scale-002`. Do not cite as authority. |
| `ds-total-001` (2006 nominal peak, arc) | B | **rejected** | Same. Nominal-peak detail unused in this thread. |

`did_not_support` vs `CONTRADICTED`: neither killed claim *contradicts* the thread — both were rejected at the dataset layer and superseded by graded era claims that say the same thing. Recorded so a reader can see the through-line does not depend on rejected material.

---

## Provenance / discipline note

This ledger records provenance. No claim in it has been verified by me; grades and verdicts are the corpus's own. Every number traces to an `e#-scale-*` / `tu:era:*:field:*` claim id via `claim.py`. Hedges, intervals (CI80), grades (A/B/C) and verdicts (confirmed/adjusted/rejected) are preserved. The single most important non-negotiable disclosure — that the 1919–2007 Coen series and the 2025 MAGNA basis are **not strictly commensurable** — travels with every cross-splice comparison in this note.
