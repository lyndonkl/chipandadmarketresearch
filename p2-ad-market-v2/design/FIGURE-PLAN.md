# P2 v2 FIGURE PLAN — "Who Owns the Number"

*Internal build doc — exempt from the readability gate. Reads with `DESIGN.md` (design system),
`PAGE-DESIGN.md` (layout/plate), `THE-PIECE.md` (the spine), `ARCHITECTURE.md` (beat map), and the
toolkit under `docs/p2/charts/` + `docs/p2/lib/`. This is a PLAN a human approves before any figure is
generated. Nothing is generated here.*

The prose is the spine. Figures are **inset exhibits that support a paragraph already making the
point** (PAGE-DESIGN §1). A figure ships only if it (1) supports a paragraph that already argues the
point, (2) is backed by data that actually exists in the frozen record, and (3) does work a sentence or
a margin callout cannot. Everything that fails the third test is demoted to a **stat-callout** or stays
**prose** — listed in full in §E, no silent caps.

---

## Summary

- **10 live figures total: 1 hero + 9 supporting plates.** Recommended **tight cut-line: hero + 6
  core** (figs 1–7); figs 8–10 are "ship if the beat wants the plate," ranked and flagged.
- **Hero:** *Ownership over time — the reversion* (amber → cyan → amber), s0 with an earned s14 reprise.
  The thesis shape, not a data series.
- **Top supporting figures:** (2) *The instrument goes blind* — Coen-internet vs IAB-internet, the
  grade-A mechanism; (3) the *by-medium bank*; (4) the *share-of-GDP strip*; (5) the *pay-per-action*
  part-to-whole; (6) the *commission-rate slope*; (7) the *take-rate reversal*.
- **~14 real numbers ride as margin stat-callouts**, not plates (§E). **6 beats stay prose-only** where
  the record is a single point, a withheld number, a hedge, a date, or a corpus-forbidden join (§E).
- **Toolkit:** reuse `renderBank`, `render` (gdp-strip), `renderCrossSection` as-is; **three new
  compositions** over existing primitives (`svg-kit` + `claim-marks` + `guards`) — a dual-rail caliper
  (figs 2, 10), a mini-series slope (figs 5, 6, callouts), and the hero ownership band. No new
  low-level code; each new piece is justified in §F.

**Encoding discipline every figure obeys** (DESIGN §4–6, PAGE-DESIGN §6):
- **Color = OWNERSHIP only.** cyan = independent/third-party number; amber = seller-/judged-party number;
  zinc = neutral scaffolding. Guardrail G1: on composition/comparison figures ownership does **not** ride
  the hues — it rides only the citation-shelf ownership dot; marks are zinc/categorical. Each figure is
  tagged **OWN-HUE** (ownership is the encoding) or **NEUTRAL** (ownership rides the source dot only).
- **Grade = jitter + a monochrome badge, never color.** A = 0px (still), B ≈ 0.6px, C ≈ 1.4px (cap ~2px).
  Reduced-motion → static hatch, density ∝ grade. Grade is never hardened.
- **Every axis names its BASIS on-axis** (PAGE-DESIGN §6.4) — the container enforces the slot.
- **DEAD/CONTESTED legends get redline** (hatch + strike + the word DEAD/CONTESTED), never an ownership mark.
- **Grade-C never sits at a peak/climax** (DESIGN §5; ARCHITECTURE §8) — it rides low and shimmers.

---

## A. THE HERO — full spec

### 1. Ownership over time — the reversion  ·  placement **s0 → s1 hinge**, reprise **s14**

- **Takeaway (one line):** one tracked number's owner flips **seller-owned (amber, pre-1914) →
  independent (cyan, the 1914 audit) → seller/platform (amber, 2000s)** — the platform era is a return,
  not a new crisis.
- **What it is / is NOT:** a **constructed ownership-state event-band**, time on x. It is **not** a
  numeric series and carries no y-quantity — nobody should hunt for an "ownership number." It is the L5
  thesis made visible once (DESIGN §4.4, §7; PAGE-DESIGN §7 mandate it as FIGURE 01).
- **Form:** a single horizontal track. Default **amber**; a **cyan bracket** spans 1914 → ~2004 (the
  ~90-year anomaly). x = year (zinc scaffold). On enter it **SETTLES once**: time axis draws
  left-to-right via **SWEEP**; at each flip the new hue **SETTLES** in (crossfade
  `cubic-bezier(.16,1,.3,1)`, 600–900ms); then it holds still. Object-constancy: one mark keeps identity
  and position-memory across the flip (Guardrail G3) so the eye reads "the same number changed hands,"
  not a reshuffle.
- **Toolkit — NEW construct** (justified §F): the **rail-board grammar re-pointed** — horizontal band,
  hard stops, SWEEP, constructed-cadence texture from `rail-board.js` + `svg-kit` band/rule/text. Built
  as a **grade-C / constructed element** (like the value chart's iron-hatch bridge), never presented as a
  dataset. No existing entry point draws a single recoloring ownership track.
- **Claims (a regime-change SEQUENCE, not a series) + grades:**
  - Regime A (amber, default): pre-1914 publisher self-count — `e1-sellers-003` (A), `e1-measurement-002` (B, as the correction target).
  - The cyan boundary IN: **ABC 1914** — `e1-measurement-002` (B).
  - Interlude decay markers (cyan, thinning): `e2-measurement-003` (B, 1946 vendor drift), `e4-measurement-001` (B, 1987 people meter).
  - The cyan boundary OUT → amber: 2002+ platform self-count — `mech-adwords-001` (A), `e6-measurement-006` (A), `mech-tac-003` (A).
- **Axis basis (on-axis):** "who held the count — an independent third party, or the party being judged."
  x = year (zinc). No value axis.
- **Ownership-color plan:** this is the one true OWN-HUE hero. amber track = seller/judged-party owns the
  number; cyan bracket = the independent audit interval. The hues **are** the argument.
- **Jitter / DEAD:** **both bracket boundaries (1914, ~2004) are grade-B → they jitter** — the reader
  feels the edges of the anomaly as uncertain, which is literally the thesis. No DEAD mark on the hero
  (redline never touches an ownership mark). Reduced-motion: amber→cyan→amber steps as hard swaps with
  the ownership legend redundant; SWEEP appears complete on load.
- **Two instances:** s0 = the leaner "overture" (a promise of the shape); s14 = the fuller, earned
  reprise (recapitulation). The persistent left-margin **ownership spine** (PAGE-DESIGN §3) is the hero's
  page-height companion carrying the same amber→cyan→amber tint.
- **Earns its place:** mandated by the design system; the sole visual statement of the L5 reading; the
  s2-beside-s0 juxtaposition (ARCHITECTURE §7) made visible. **Flag hard on the plate: no numeric
  ownership series exists** — the shape is a reading, not a measurement.

---

## B. SUPPORTING PLATES — ranked by evidential + argumentative load

### 2. The instrument goes blind — Coen-internet vs IAB-internet  ·  **s12**  ·  OWN-HUE

- **Takeaway:** the historian's own ruler under-counted internet by half — **Coen $10,529M for 2007
  against IAB's $21,206M** — then Coen **stops at 2007** while IAB runs to **$294,593M (2025)**.
- **Form:** two time-series rails on one axis; a measured **caliper** at the 2007 overlap; Coen ends in a
  hard vertical stop. Folds in the internet-growth story, so A3 gets **no** separate figure.
- **Toolkit — NEW composition "dual-rail caliper"** (justified §F): `renderValueChart` draws only
  `medium:"total"` rails, and **`iab_pwc` publishes no `total` (it is internet-only), so the value chart
  names it but does not draw it.** This figure is therefore built from `svg-kit` (`linear`/`log10Scale`,
  `polyline`, `pointMark`, `caliper`, `absenceBlock` for the post-2007 Coen void) + `guards.buildPath` /
  `assertNoSplice` (never-splice) + `claim-marks` minting (grade→jitter). Same composition serves fig 10.
- **Claims + values + grades** (all VERIFIED against the frozen record):
  - `e6-medium-006` (**A**) — the undercount; Coen internet 2007 = **$10,529M**, IAB internet 2007 =
    **$21,206M**; the claim's stored central (10,677, ci 10,000–11,500) is the *measured wedge*, not a
    rail value — draw it as the caliper, draw the rails from `adspend.json`.
  - `e7-medium-001` (**A**) — IAB internet **$23,448M (2008) → $294,593M (2025)**, 12.6×, only down year
    2009 (**$22,661M**, −3%).
  - Rails live in `adspend.json`: `coen_mce.internet` 1997–2007 (ends 10,529); `iab_pwc.internet`
    1996–2025.
- **Axis basis (dual, each named on-axis):** cyan rail — **"historian's compiled billings, US$m"**
  (Coen/McCann, going dark); amber rail — **"internet revenue reported by sellers, US$m"** (IAB/PwC, born
  and rising).
- **Ownership-color plan:** **OWN-HUE.** Coen = **cyan** (third-party compiler's independent ruler) going
  dark exactly as the seller-counted unit — IAB, **amber** (media-owners reporting to PwC) — is born and
  climbs. The color carries the mechanism.
- **Jitter / DEAD:** both rails grade **A → marks sit still**; the caliper is a measured object, not a
  hedge. No DEAD legend on this plate (the "internet killed classified" legend lives with the bank/prose).
- **Earns its place:** grade-A, the literal L4 mechanism of s12, ownership-load-bearing, and the shape
  (one ruler halving another, then stopping) is invisible in prose. **The single strongest supporting
  figure.**

### 3. By-medium composition — the small-multiple bank  ·  **s12 (+ s13 reprise)**  ·  NEUTRAL

- **Takeaway:** shares moved **glacially** — TV enters 1949 at ~1.1%, passes newspapers only in **1992**
  (TV $31,079M vs newspapers $30,737M); direct mail is the second-largest named medium for decades.
- **Form:** aligned panels, one shared y, each medium on its own flat baseline — **never stacked**
  (DESIGN Rule 2; the mid-bands are where the story lives). Span-only years (internet 1997/99/2005–07)
  draw as ranges, not lengths — the record's own cut.
- **Toolkit — REUSE `renderBank` (small-multiples.js), native.** Panel set/order/ceiling/floor computed
  from `adspend.json` at load; partition checked exact in all 89 years. No new code.
- **Claims + values + grades:** `e2-medium-006` (B, TV 1949 $58M/1.1%), `e4-medium-002` (B, 1992
  crossover $31,079M vs $30,737M — do not round the ~$342M away), `e2-medium-004` (B, direct mail 14.5%
  1949, peak 16.8% 1938 — **preserve the wartime nuance: 3rd in 1944, 4th 1945–46**, verdict *adjusted*),
  `e7-medium-001` (A, internet panel).
- **Axis basis (on-axis):** **"advertiser billings, list/rate-card prices, US$m of the day."**
- **Ownership-color plan:** **NEUTRAL** — medium composition is not an ownership question; G1 forbids the
  hues. Panels are categorical/zinc; ownership rides only the source dot on the shelf.
- **Jitter / DEAD:** mostly grade **B → faint life**, appropriate for a composition-over-time (never an
  anchor). Carries two **DEAD** legends in redline: **"each medium killed the last"** and **"TV conquered
  advertising."**
- **Earns its place:** the richest reusable figure; serves two beats; "glacial" is a shape only a
  small-multiple shows; grade-B keeps it off any peak.

### 4. Advertising as a share of GDP — the strip  ·  **s13**  ·  NEUTRAL

- **Takeaway:** intensity peaked at **3.0% (1922)**, bottomed **1.2% (1944)**, sits near **1.32% (2025)**
  — and the popular "peak in 2000" is the **rejected** claim.
- **Form:** **11 dated readings as marks, NOT a line** (no annual GDP series exists — joining would
  fabricate a century). Bases drawn as separate coverage bands; a **window rocker** starts post-1960
  (where 2000 *is* the max) and widens to reveal 1922 above it — **the reader's own hand produces the
  fallacy-correction.**
- **Toolkit — REUSE `render` (gdp-strip.js), native.** Draws the rejected `ds-gdp-001` as a
  **verdict-stamped** mark (its body is the correction), not hidden, not first-class.
- **Claims + values + grades:** `e2-scale-004` (B, 3.0% 1922), `e2-scale-005` (B, 1.2% 1944),
  `e7-scale-002` (**C**, ~1.32% 2025, non-commensurable) + the 1914/1949/1956/1975/1993/2000/2007
  readings (`e1/e3/e4/e5/e6-scale`); `ds-gdp-001` **rejected → stamped**.
- **Axis basis (on-axis):** **"advertising as % of US nominal GDP,"** with the non-removable caveat that
  **the 2025 reading is a different basis** from the 1919–2007 Coen series (`e7-scale-002` says so).
- **Ownership-color plan:** **NEUTRAL** — GDP is zinc scaffolding.
- **Jitter / DEAD:** mostly B; endpoints (1914, 2025) **C → shimmer** and ride low; `ds-gdp-001` carries
  a rejected-verdict stamp (redline register under the strip).
- **Earns its place:** native primitive, a rejected legend shipped honestly, and the **interaction is the
  argument** — a sentence cannot make the reader produce the correction.

### 5. The commission rate — "the 15% didn't die, it peaked"  ·  **s5**  ·  CYAN (OWN-HUE, single-rail)

- **Takeaway:** commission actually received held flat, then fell late — **14.13% (1977), 13.92% (1982),
  14.16% (1987), 13.18% (1992), 10.98% (1997)**. The flat-then-drop shape is the whole rebuttal of "the
  15% died in the 1980s."
- **Form:** short **slope / mini-series** (5 ordered points).
- **Toolkit — NEW composition "mini-series slope"** (justified §F): the 5 values live inside one claim's
  statement, **not** in `adspend.json`, so no adspend-reading primitive applies. Built from `svg-kit`
  (`linear`, `polyline`, `pointMark`) + `claim-marks` minting. **Build note:** only the 1992 point
  carries its own ci80 (12.8–13.6); the other four are stated values without intervals. This is honest in
  P2 because **jitter is tied to grade, not ci-width** — all five inherit the claim's grade A → 0px, they
  sit still, and no per-point interval is invented. Shared helper with fig 6.
- **Claims + values + grades:** `e4-pricing-001` (**A**; central 13.18 @1992, span 1977–1997). Values
  above are verbatim from the statement.
- **Axis basis (on-axis):** **"commission received, % of media billings (US Census / SoI)."**
- **Ownership-color plan:** **CYAN** — an independent census figure. The mix-collapse `e6-creators-002`
  (61% 1994 → 10% 2003) rides as a **stat-callout beside it**, not a second axis (dual-axis would be a
  guard violation).
- **Jitter / DEAD:** grade **A → still** (the flat line reading as *settled* is the point). Carries the
  **DEAD** legend **"the 15% died in the 1980s"** and **"search killed the commission"** in redline.
- **Earns its place:** grade-A, 5 real points, cyan-load-bearing, busts two headline legends, and the
  shape carries the argument better than any sentence.

### 6. The take-rate reversal — the residual that falls  ·  **s10**  ·  AMBER (OWN-HUE, single-rail)

- **Takeaway:** Google's syndicated take rate **~9% (2002) → 24.7% (2006) → 21.5% (2007) → 21.3% (2008)**
  — it peaks and then **falls**; a pure maximiser wouldn't.
- **Form:** **slope / mini-series**; the rise-then-fall IS the argument.
- **Toolkit — NEW composition "mini-series slope"** (same helper as fig 5). Values live in the claim's
  method (filed 10-K arithmetic), not `adspend.json`.
- **Claims + values + grades:** `mech-tac-003` (**A**; central 24.7 @2006; verdict *post-verification* —
  still grade A). The four values are verbatim from the claim method.
- **Axis basis (on-axis):** **"% of Google Network revenue retained by Google."**
- **Ownership-color plan:** **AMBER** — the seller's own rate.
- **Jitter / DEAD:** grade **A → still**. No DEAD legend; this is a **mandatory §4 residual** (ARCHITECTURE
  §4) that blocks the malign-optimiser reading — load-bearing to the honesty spine.
- **Earns its place:** grade-A, a required residual, and the reversal shape is invisible in prose.

### 7. The buyer's meter wins the medium — pay-per-action  ·  **s7**  ·  OWN-HUE

- **Takeaway:** by 2008 the buyer's own performance meter took the medium — **PPA 57% / CPM 39% / other
  4%**, up from **PPA 51% (2007)** — and it landed **inside the seller's own log.**
- **Form:** one-year **part-to-whole** (a single divided column), the 51→57 change annotated.
- **Toolkit — REUSE `renderCrossSection` (small-multiples.js), native.** Merges what were two candidate
  figures (the pricing split + the year-over-year change) into one.
- **Claims + values + grades:** `e6-buyers-008` (**A**; central 57 @2008, ci 55–59; PPA 51% in 2007;
  CPM 39%).
- **Axis basis (on-axis):** **"% of US internet ad revenue by pricing basis."**
- **Ownership-color plan:** **OWN-HUE** — the PPA part drawn **cyan (the buyer's keyed, independent
  meter) → amber (it now sits in the seller's own log)**; the reversion shown as color on one part
  (DESIGN §4.3). This is the s7 spine.
- **Jitter / DEAD:** grade **A → still**. Carries the **DEAD** legend **"platforms invented performance
  advertising"** in redline (the direct-response meter is 150 years old).
- **Earns its place:** grade-A, ownership-load-bearing, the s7 thesis in one part-to-whole.

---

### — RECOMMENDED CUT-LINE: the tight build is **hero + figs 2–7** (7 figures). —
Figs 8–10 below are real, backed, and ranked, but each is out-performed by a callout or rides grade-C.
Ship them only if the beat wants the plate. **If the set must shrink, drop in this order: 8 → 10 → 9.**

### 8. Targeting entered by purchase — the 2007 deals  ·  **s11**  ·  NEUTRAL  ·  *(demotable to callout)*

- **Takeaway:** audience targeting was **bought, not built** — aQuantive **~$6B**, DoubleClick **$3.1B**,
  Right Media **$680M**, 24/7 Real Media **$649M**.
- **Form:** 4-bar magnitude comparison (position encoding — clean Cleveland–McGill task).
- **Toolkit — REUSE `renderCrossSection`, native.**
- **Claims + values + grades:** `e6-targeting-004` (**A, tail-flagged**; central 3,100).
- **Axis basis (on-axis):** **"acquisition price, US$ — the largest such deals of 2007, NOT typical"**
  (the tail-flag is mandatory on-axis; ARCHITECTURE §10.6).
- **Ownership-color plan:** **NEUTRAL** (zinc bars).
- **Jitter / DEAD:** grade **A → still**. No DEAD legend.
- **Earns / demote note:** grade-A and a genuine 4-value magnitude comparison the prose enumerates — the
  visual adds "aQuantive/DoubleClick dwarf the rest." But the prose already lists all four, so a
  4-number stat-callout carries it if the plate budget is tight. **First to drop.**

### 9. The denominator wedge — IRS vs MAGNA  ·  **s13**  ·  NEUTRAL  ·  *(grade-C, flagged)*

- **Takeaway:** two counts of the same 2022 market — **IRS $473B vs MAGNA $325B, a $148B wedge**. Name
  your rail; there is no single total.
- **Form:** two short rails (IRS 2005–2022; MAGNA 2018–2025) + a **caliper** at the 2018–2022 overlap.
- **Toolkit — NEW composition "dual-rail caliper"** (same as fig 2): `renderValueChart` draws MAGNA's
  `total` rail but **`irs_soi` publishes no `medium:"total"` (it is `total_corporate_ad_deductions`), so
  the value chart names it but does not draw it.** Built from the same `svg-kit` caliper + `guards`
  buildPath + `claim-marks` composition. Rails live in `adspend.json` (`irs_soi` 1960–2022 5-yr steps
  then annual; `magna.total`).
- **Claims + values + grades:** `e7-scale-006` (**C**; IRS 2022 = **$473,153M**, MAGNA 2022 =
  **$325,000M** — both VERIFIED in `adspend.json`; wedge = **$148B**). **Do NOT chart the national-brand
  $145.7B pool** — the claim itself says "SOURCED BY: NO SOURCE," it is a construction with a 99.5–187.1
  interval. Only the two measured rails + the wedge are chartable.
- **Axis basis (dual, each named on-axis):** **"IRS corporate advertising deductions, US$B"** vs
  **"MAGNA media-owner revenue, US$B."** This is the archetypal "name the rail" chart.
- **Ownership-color plan:** **NEUTRAL** — two rails, each labelled; neither is an ownership claim.
- **Jitter / DEAD:** grade **C → the wedge shimmers**, placed low, never an anchor (s13 is not the
  climax). Carries the **DEAD** legend **"there is a single US ad-market total"** in redline.
- **Earns its place:** it *is* s13's thesis, a real two-count comparison, and the primitive forces the
  basis onto the axis. Ships **only** because grade-C shimmer + low placement keep it from reading as fact.

### 10. Newspaper classified collapse  ·  **s12 (optional inset)**  ·  NEUTRAL  ·  *(optional)*

- **Takeaway:** classified revenue fell off a cliff — total classified **$19,608M (2000) → $9,975M
  (2008)** — but "the internet killed classified" is too simple: real-estate classified fell with
  **housing**, not search.
- **Form:** a single collapsing rail (annual), or a 2–3-line split (classified vs national-brand vs
  local-retail).
- **Toolkit — REUSE `renderBank` panel or a single `svg-kit` polyline.** Data exists: `naa_newspaper`
  carries `money_type` = classified / national_brand / local_retail, annual **1950–2010** (VERIFIED:
  classified 2000=19,608; 2006=16,986; 2008=9,975).
- **Claims + values + grades:** `e6-scale-009` (**A**; help-wanted classified −91% from its 2000 peak).
  **Nuance to preserve:** the −91% is help-wanted-specific (in the claim); the `adspend` annual series is
  *aggregate* classified. Draw aggregate classified as the rail, cite the −91% help-wanted as the
  annotation.
- **Axis basis (on-axis):** **"US newspaper ad revenue by publishers, US$m."**
- **Ownership-color plan:** **NEUTRAL.**
- **Jitter / DEAD:** grade **A → still**. Carries the **DEAD** legend **"the internet/search killed
  classified" (single cause)** in redline.
- **Earns / optional note:** grade-A with real annual data, but s12 already carries the mechanism (fig 2)
  and the bank (fig 3); this is a third s12 plate. Ship only if s12's classified paragraph wants its own
  exhibit; otherwise the collapse is a callout. **Lowest-ranked live figure.**

---

## E. REAL DATA THAT STAYS OFF THE PLATES — callouts & prose (no silent caps)

### Stat-callouts (Martian-Mono margin numerals + grade dot; PAGE-DESIGN §3) — a 2-value chart is a chart pretending a callout needs axes

| Beat | Claim (grade) | Value | Hue | Note |
|---|---|---|---|---|
| s1 | `e1-sellers-003` (A) | ads = 64.9% of newspaper gross income 1914 ($184.1M vs $99.5M) | CYAN | kept a callout so s1 and s4 aren't twin divided bars (anti-monotony) |
| s4 | `e2-sellers-002` (A) | FCC 73/27 split ($32,046,218 / $12,267,560) | CYAN | "extracted by audit"; **promotable** to a modest divided-bar plate, but not back-to-back with s1's |
| s3 | `e2-measurement-003` (B, ci 15–25) | Hooper ~20% above CAB | OWN-HUE | amber vendor **span** (wide ci → no central) over cyan co-op; span-mark callout |
| s6 | `e4-measurement-001` (B) | people meter −13% / −13% / −4% (CBS/ABC/NBC), 1987 | CYAN | **mandatory §4 residual** (honest count hurt the seller) — must reach the reader; small cyan cluster/callout |
| s5 | `e6-creators-002` (B) | commission-basis share 61% (1994) → 10% (2003) | NEUTRAL | rides beside fig 5, not a second axis |
| s8 | `e6-buyers-005` (B) | national share 61.4% (2002) → 66.3% (2007) | NEUTRAL | busts "search democratised money toward a long tail of dollars"; tiny up-slope/callout |
| s9 | `e7-targeting-002` (B) | ATT opt-in ~16% (2021) → ~25% (2022) | CYAN-overlay | the state re-separates on the demand side |
| s10 | `mech-rgsp-001` (A) | rGSP +5.91% PC/tablet, +4.85% mobile | AMBER + cyan court-overlay | §4.2 tiebreak exemplar: seller-owned number, court-surfaced; data too thin for a plate |
| s11 | `e6-sellers-001` (A) | Overture $667.7M vs Google $439.5M (2002) | NEUTRAL | 2-bar; kills "Google invented search advertising"; **promotable** |
| s11 | `e7-events-009` (A) | $26.3B search default revenue share, 2021 | NEUTRAL | single point, court found foreclosed |
| s11 | `e4-sellers-004` (B) · `e2-sellers-006` (B) | Yellow Pages $9,517M (1993); AM ~900 → ~2,500 stations | NEUTRAL | single points/steps |
| s9 | `e5-targeting-004` (A) | Overture 442M clicks, ~53,000 advertisers, Q4 2001 | AMBER | seller-owned platform count; callout |
| s14 | `e7-events-008` (B) **CONTESTED** | AI-Overview click **8% vs 15%** | AMBER + redline | ships **both** values, redline, Google's dispute named (two-tone, not a strike; DESIGN §6) |
| s14 | `e7-targeting-004` (B) · `e7-measurement-005` (B) | AI Overviews >2B monthly users; IAB >$26B unlocked | NEUTRAL | hedges preserved ("estimate," "his account, not an audited fact") |

### Prose-only / ruled-out — the earn-its-place or data-exists gate refuses these

- **s0 opener** (`e6-measurement-006`, A): the count/CPC/query total are **withheld** — a chart would have
  to invent the missing number. The hole is the subject; carried by the hero + the "number-shaped hole"
  motif. Prose.
- **s2 (ABC 1914)** (`e1-measurement-002`, B): carried by the hero's cyan boundary, not a standalone
  figure.
- **s4 the plate stack** (15%, $2,600/hr, reps 5–20% *range*, 2% discount): incompatible bases the piece
  says **cannot be summed** — any stacked/additive chart would lie. `e3-pricing-003` is a **hedge (range),
  never a point mark.** At most a labelled non-additive "plates on different bases" *diagram* (a
  DEAD-legend device for "the cut was a stable single 15%"), not a data chart.
- **s7** (`e1-buyers-008`, C, ci 96–360, ~$192M): third-hand, "held as a range" — a **span mark only if
  drawn, no point estimate.** Prose.
- **s9 the yield series — REFUSED:** 71.1M households (`e3-targeting-005`, A), 2% reply
  (`e4-targeting-004`, B, a **DEAD** entry — "flat ~2% for a century" unsupported), 442M clicks
  (`e5-targeting-004`, A) are **three single points from different eras the corpus forbids joining**; the
  **read-vs-mailed guard** (`e5-targeting-005`) forbids setting 2%-on-mailed beside search reply. **No
  yield chart.**
- **s9 PMax — RULED OUT AS A FIGURE** (`e7-buyers-003`, C, ci 50–85, 60%→71%): DESIGN §5 and ARCHITECTURE
  §6 **forbid grade-C at any peak**; s9 names it "a soft endpoint, never the climax." It shimmers hardest;
  if it appears at all, only as a low, caveated ("vendor panel, ~170 advertisers") callout. Not a chart.
- **s1 / s8 / s11 single points, dates, quotes:** penny Sun 1833 & Ayer 1875 (artifact **ABSENT**) —
  dates, not quantities; cigarettes ~$225M and 1971 −1.7% (`e3-buyers-004`, `e3-medium-011`) — best as
  **one annotated marker**, not a chart; Noble $8M, 7-station cap, "Butternut Squash"/Mehta quotes —
  prose or callouts.

---

## F. TOOLKIT VERDICT — reuse everything that fits; three justified new compositions

**Reuse as-is (no new code):**
- `renderBank` (small-multiples.js) → **fig 3** (and fig 10 if it ships). Native purpose; partition
  checked exact.
- `render` (gdp-strip.js) → **fig 4**. Native; window rocker + rejected-verdict stamp built in.
- `renderCrossSection` (small-multiples.js) → **figs 7, 8** (and callout bars). Native part-to-whole /
  one-year cluster.
- `claim-marks.js` (`planClaimMark`, `markReading`/`markFigure`, `anchorY`, `stampVerdict`,
  `verdictStamps`, `unorderablePairs`, `definePlanner`) → the mint under **every** figure; enforces
  grade→jitter, span-has-no-central, verdict-visible.
- `svg-kit.js` primitives (`linear`, `log10Scale`, `polyline`, `pointMark`, `spanMark`, `band`,
  `caliper`, `absenceBlock`, `rule`, `text`, `frame`, `usd`/`pct`/`comma`) → the substrate for the three
  new compositions.
- `guards.js` (`buildPath`, `assertNoSplice`, `assertNoInterpolation`, `coverageGaps`, `markKindFor`,
  `assertAbsenceDrawn`) → the fallacy guards under the new compositions.
- `rail-board.js` grammar (bands, cadence textures, SWEEP) → borrowed by the hero.

**Three NEW compositions (each a new arrangement of the primitives above — no new low-level code — each
because no existing entry point fits):**

1. **Dual-rail caliper** — figs **2** and **10** (internet two-rulers; IRS/MAGNA wedge). *Why new:*
   `renderValueChart` hardcodes the `medium:"total"` filter, so it draws only whole-market totals
   (benchmarks, Coen total, MAGNA total, bridge) and files `iab_pwc` and `irs_soi` under **noTotal** —
   named on the chart but **not drawn as rails.** Both figures need two *named sub-series* on one axis
   with a measured caliper at the overlap, which the value chart's own wedge machinery (built for the
   Coen↔MAGNA basis break) does not expose. The composition reuses `svg-kit.caliper` + `polyline` +
   `pointMark` + `absenceBlock` + `linear`/`log10Scale`, and runs every path through `guards.buildPath` /
   `assertNoSplice` and `claim-marks` minting — the same guard stack the value chart uses.
2. **Mini-series slope** — figs **5**, **6** (+ the s5 mix and s8 national-share callouts). *Why new:*
   these values live **inside a single claim's statement/method**, not in `adspend.json`, so no
   adspend-reading primitive applies. A thin helper mints each point through `claim-marks` (carrying the
   claim's single grade → jitter) and draws with `svg-kit` `polyline`/`pointMark`. Justified by 3+ uses.
3. **Hero ownership band** — fig **1**. *Why new:* no primitive draws a single horizontal track that
   **recolors** amber→cyan→amber along time. Re-points `rail-board.js`'s band/cadence/SWEEP grammar +
   `svg-kit`; built as a constructed (grade-C-textured) element, never a dataset.

**Not used, and why that's fine:** `renderValueChart` (the flagship total-rails/never-splice chart) is
**available but not scheduled.** The "180 years, the record stops" total-level overture it would draw
overlaps fig 2's Coen hard-stop and fig 3's composition. A figure must earn its place, not be added to
exercise a primitive. Keep it in reserve for a whole-market overture at s12; it reuses cleanly with
`{ annotate: [...] }`. `renderRailBoard` ships its grammar into the hero but is not a standalone figure —
the piece is reading-first, and a provenance strip is appendix material.

---

## G. BUILD ORDER

1. **Legend / "How to read this" key** (PAGE-DESIGN §6) — the reusable grammar teacher, expanded on the
   first figure. Build first; every plate inherits it.
2. **Fig 2 — dual-rail caliper (internet two-rulers).** Build the new composition here first; it is the
   strongest figure and it hardens the caliper/guard stack that fig 10 reuses.
3. **Figs 3 & 4 — bank and GDP strip.** Pure reuse; fastest wins, and they exercise the plate container +
   basis-on-axis + rejected-verdict stamp end-to-end.
4. **Fig 7 — pay-per-action part-to-whole.** Reuse `renderCrossSection`; first OWN-HUE part-recolor —
   proves the cyan→amber-on-one-part grammar for the hero.
5. **Figs 5 & 6 — mini-series slope helper.** Build the helper once, use twice; validates grade→jitter
   with statement-only values.
6. **Hero (fig 1).** Build after figs 2 and 7 have proven the ownership-hue + SWEEP/SETTLE physics; the
   hero is the highest-stakes surface and should be last among the core.
7. **Figs 8, 9, 10 (optional).** Ship per the cut-line decision. Fig 9 reuses fig 2's composition; fig 8
   reuses `renderCrossSection`; fig 10 reuses `renderBank`.
8. **Callout + prose-only layer (§E).** Wire the stat-callouts and the CONTESTED s14 two-tone; confirm
   every DEAD legend named in §B/§E has a redline home.

---

## H. DATA GAPS / OPEN ITEMS TO RESOLVE BEFORE GENERATION

- **Claim → paragraph (ideally → sentence) mapping** (PAGE-DESIGN §4 dependency): claims are mapped at the
  *movement* level; each sidenote + figure shelf needs its exact paragraph anchor. Content-side task.
- **Fig 2 y-scale:** Coen internet ($600M in 1997) to IAB $294,593M (2025) spans ~2.7 orders of
  magnitude. Decide **log vs linear** (`svg-kit.log10Scale` exists). Log reads the early-years ratio and
  the "half" gap honestly; linear dramatizes the late explosion. Recommend **log**, with the 2007 caliper
  labelled in absolute dollars so the ~2× undercount is unmissable. Human call.
- **Fig 10 go/no-go:** confirm whether s12's classified paragraph wants a third s12 plate or a callout.
- **Mini-series intervals (figs 5, 6):** confirmed only the anchor year carries a ci80; the plan draws the
  rest as grade-A still points (jitter∝grade, not ci). Confirm this is acceptable vs. drawing only the
  anchor with an interval.
- **Fig 8 vs callout:** decide DoubleClick as plate or 4-number callout (first cut candidate).
- **Non-commensurability caveats (figs 2, 4, 9):** the 2008 Coen seam, the 2025-vs-Coen GDP basis, and the
  IRS-vs-MAGNA rails each carry a non-removable caveat — confirm the plate container renders it on-axis,
  not in a footnote.

---

## I. VERIFICATION LOG (values checked against the frozen record before finalizing)

Checked via `claim.py` and `adspend.json` (`q.py`-equivalent read):
- `e6-medium-006` (A) — Coen internet 2007 = **$10,529M** (adspend `coen_mce.internet`), IAB 2007 =
  **$21,206M** (adspend `iab_pwc.internet`); the claim's stored central 10,677 is the *wedge*, not a rail.
  **Confirmed.**
- `e7-medium-001` (A) — IAB internet 2008 = **$23,448M**, 2009 = **$22,661M** (−3%), 2025 = **$294,593M**,
  12.6×. **Confirmed in adspend.**
- `e4-pricing-001` (A) — 14.13/13.92/14.16/13.18/10.98%; central 13.18 @1992, span 1977–1997. **Confirmed.**
- `mech-tac-003` (A, verdict *post-verification*) — 9% / 24.7% / 21.5% / 21.3% (2002/06/07/08). **Confirmed.**
- `e6-buyers-008` (A) — PPA 57% @2008 (ci 55–59), 51% @2007, CPM 39%. **Confirmed.**
- `e2-sellers-002` (A) — 73/27; $32,046,218 / $12,267,560; 1938. **Confirmed.**
- `e7-scale-006` (C) — IRS 2022 = **$473,153M**, MAGNA 2022 = **$325,000M** (both in adspend), wedge
  ~$148B; national-brand $145.7B pool is **SOURCED BY: NO SOURCE** → not chartable. **Confirmed.**
- `e6-targeting-004` (A, tail) — DoubleClick $3.1B, aQuantive ~$6B, Right Media $680M, 24/7 $649M. **Confirmed.**
- `e2-medium-004` (B, verdict *adjusted*) — direct mail 14.5% (1949), peak 16.8% (1938), wartime dip
  (3rd 1944, 4th 1945–46). **Confirmed — preserve the wartime nuance in fig 3.**
- Newspaper classified split exists: `naa_newspaper.money_type` = classified/national_brand/local_retail,
  annual 1950–2010; classified 2000 = **19,608**, 2006 = 16,986, 2008 = 9,975. **Confirmed (fig 10 backed).**

*This plan records provenance and design intent only. No claim has been verified for truth; grades and
intervals are the sources' own and are preserved. Named living parties are surfaced, not adjudicated.*
