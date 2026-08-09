# P2 v2 FIGURE BUILD REPORT — "Who Owns the Number"

*Build review of the approved tight cut-line: hero + figs 2–7. Reviewer pass — renders read against
`design/FIGURE-PLAN.md` (§A, §B, §F, §I) and the design system (`DESIGN.md` §4–6, `PAGE-DESIGN.md` §6).
Each figure was read from its shipped PNG and re-rendered headlessly to confirm (Chrome
`--headless=new --force-color-profile=srgb`, full-height windows for the tall plates).*

## OVERALL VERDICT: **PASS — ship-ready.**

All 7 figures render correctly and show what their spec says. They read as **one family**. Bone `#F2EEE4`
ground runs throughout. Every plate carries the standard frame: FIGURE NN kicker + `[key]` + "HOW TO READ
THIS" + figure + basis-on-axis + caption + citation shelf. Grade rides jitter + a monochrome badge, never
colour. DEAD legends sit on the redline device. Ownership colour is used correctly on every OWN-HUE plate.

Three items are flagged below. **None is blocking.** One is a family-level colour caveat the approved
plan itself sanctioned (native reuse); two are minor/cosmetic.

---

## FAMILY-LEVEL CHECKS (all 7)

| Check | Result |
|---|---|
| Bone `#F2EEE4` ground | PASS — all 7 |
| Standard plate + `[key]` + HOW-TO-READ | PASS — all 7 |
| Basis named on-axis | PASS — all 7 (verified in DOM + render) |
| Grade = jitter + monochrome badge, never colour | PASS — no grade hardened anywhere |
| DEAD/CONTESTED = redline (hatch+strike+word), never on an ownership mark | PASS — figs 3,5,7 carry redline DEAD tags; fig 4 carries the rejected-verdict stamp |
| OWN-HUE plates paint the v2 ownership hexes `#E0972A`/`#3AA6BD` | PASS — figs 1,2,5,6,7 (confirmed in source: each references the correct hex) |
| Grade-C never at a peak | PASS in every default view; one interaction-state caveat on fig 4 (below) |

**Colour architecture (verified):** the OWN-HUE figures correctly use the v2 ownership tokens
(`--amber #E0972A`, `--cyan #3AA6BD`, `--redline #C6432B`, defined in `figures.css`). SVG `<text>` stays
on the toolkit's guarded text-safe tokens (the toolkit `assertTextColor` allow-list throws on `#E0972A`),
so ownership-hued labels ride HTML plate chrome — correct handling, not a defect.

---

## PER-FIGURE VERDICTS

### FIGURE 01 — Hero: "Ownership over time — the reversion" · **PASS**
`docs/p2-v2/figures/fig1-hero.png`
- Renders the constructed ownership-state band: **amber (PUBLISHER SELF-COUNT, pre-1914) → cyan
  (INDEPENDENT — THE 1914 AUDIT) → amber (PLATFORM SELF-COUNT, ~2004+)**, one continuous track
  (object-constancy). Both boundaries (1914, ~2004) are grade-B with monochrome badges and jitter; cyan
  drift markers at 1946/1987 thin the audit era.
- OWN-HUE, the one true hero: v2 amber/cyan on the marks. Basis on-axis ("who held the count — an
  independent third party, or the party being judged"); value-axis absence flagged "A READING — NOT A
  MEASUREMENT." 7-chip shelf with correct ownership dots. No grade-C (legend says so).
- **Fresh re-render confirms the headless sweep-crop bug is fixed** — the full 1850–2025 axis and the
  post-2004 amber settle correctly; motion controls (REPLAY / FULL / REDUCED) present. No issues.

### FIGURE 02 — "The instrument goes blind" (dual-rail caliper, LOG y) · **PASS**
`docs/p2-v2/figures/fig2-instrument-blind.png`
- Cyan Coen rail ends **$10,529m (2007)** into a labelled "COEN INTERNET: NO READING AFTER 2007" absence
  void; amber IAB rail **$21,206m (2007) → $294,593m (2025)**. Caliper at 2007 reads **"$10,677m gap ·
  2.0×"**; "2009 −3%" note present. LOG y-axis with $1,000m/$10,000m/$100,000m decades.
- OWN-HUE and correct: cyan = independent compiler, amber = seller-reported — colour carries the
  mechanism. Dual basis named on-axis. Both rails grade-A → marks sit still. Strongest supporting plate,
  as planned. No issues.

### FIGURE 03 — By-medium small-multiple bank · **PASS** (family colour caveat, see §NOTE-1)
`docs/p2-v2/figures/fig3-medium-bank.png`
- `renderBank` native, share mode: 1 total + 12 media panels + under-the-floor tail, each medium on its
  own baseline, never stacked. Newspapers peak 49.1%, TV 22.8% (enters 1949 ~1.1%), direct mail 21.5%,
  internet panel drawn as span-only dual rails. SHARE/DOLLARS handle works; "NO FREE ANNUAL TOTAL" hole
  drawn on the total panel.
- NEUTRAL. Two DEAD legends confirmed in DOM ("each medium killed the last", "TV conquered advertising"),
  redline-coded. Basis on-axis ("advertiser billings, list/rate-card prices, US$m"). 4-chip shelf
  (e2-medium-006, e4-medium-002, e2-medium-004 = B; e7-medium-001 = A) present. No load-fail.
- **Caveat (NOTE-1):** native reuse draws the series in the toolkit's brass `#B07A2C`, not a strict
  zinc/iron neutral. Non-blocking; details below.

### FIGURE 04 — Share-of-GDP strip · **PASS** (grade-C interaction note, see §NOTE-2)
`docs/p2-v2/figures/fig4-gdp-strip.png`
- `render` (gdp-strip) native: 11 dated readings as marks, never a line; coverage bands drawn; window
  rocker (POST-1960 ↔ WHOLE RECORD). Default post-1960 view puts the peak at **2000 = 2.4% (grade B)**,
  circled and annotated "the highest reading in THIS window. The popular story stops here" — the
  reader-produced fallacy setup. The 11-claim register lists every reading with grade + verdict;
  **`ds-gdp-001` drawn and stamped REJECTED** (the redline register). e7-scale-002 (2025, grade C, 1.32%,
  non-commensurable) carried with its caveat.
- NEUTRAL, basis on-axis ("percent of nominal US GDP" + the 2025-different-basis caveat).
- **Note (NOTE-2):** in the WHOLE-RECORD window (behind the rocker), grade-C **1914 = 3.30%** becomes the
  numerically highest mark. Mitigated — it shimmers, and the strip annotates it as "the highest reading,
  not the maximum of any one series" (different ruler), pinning the narrative peak to grade-B 1922. The
  default view is clean. Worth a human eyeball; the plan §B.4's "endpoints ride low" is not literally true
  of 1914. Non-blocking.

### FIGURE 05 — Commission-rate slope · **PASS** (one cosmetic, see §NOTE-3)
`docs/p2-v2/figures/fig5-commission-slope.png`
- CYAN OWN-HUE single rail: **14.13 (1977) · 13.92 (1982) · 14.16 (1987, peak) · 13.18 (1992) · 10.98
  (1997)** — the flat-then-late-drop shape is unmistakable. Peak (14.16%, 1987) is grade-A and still — no
  grade-C at the peak. Basis on-axis ("commission received, % of media billings (US Census / SoI)").
- Two DEAD legends confirmed, redline-coded: "The 15% commission died in the 1980s" and "Search
  advertising killed the commission," each with a graphite corrective. NEUTRAL mix-collapse callout
  **61% → 10%** (e6-creators-002, B) rides beside the slope, not as a second axis. Shelf: e4-pricing-001
  (A/cyan), e6-creators-002 (B/zinc).
- **Cosmetic (NOTE-3):** the leftmost "14.13%" data label sits tight against the "14.4%" y-axis tick
  (near-touch) at top-left; y-axis is truncated 10.7–14.4% (defensible — the shape is the argument, basis
  named). Cosmetic only.

### FIGURE 06 — Take-rate reversal · **PASS**
`docs/p2-v2/figures/fig6-take-rate.png`
- AMBER OWN-HUE single rail: **~9% (2002) → 24.7% (2006, peak) → 21.5% (2007) → 21.3% (2008)** — the
  rise-then-fall is the argument. Peak (24.7%, 2006) grade-A and still — no grade-C at a peak. Basis
  on-axis ("% of Google Network revenue retained by Google"). VERDICT note surfaces mech-tac-003
  POST-VERIFICATION. Correctly carries no DEAD legend (mandatory §4 residual). Shelf: mech-tac-003
  (A/amber). No issues.

### FIGURE 07 — Buyer's meter (pay-per-action part-to-whole) · **PASS**
`docs/p2-v2/figures/fig7-buyer-meter.png`
- `renderCrossSection` native, 2008 single divided column: **PPA 57% · CPM 39% · other 4%**, each grade-A.
  The PPA part is drawn **cyan → amber** (the one part whose owner reverts — the buyer's keyed meter now
  read off the seller's log), exactly the s7 spine; CPM/other are the neutral zinc remainder. The 51→57
  change annotated ("2007: 51%", "+6 pts"). Basis on-axis ("% of US internet ad revenue by pricing
  basis"). DEAD legend "Platforms invented performance advertising" confirmed, redline-coded. Shelf:
  e6-buyers-008 (A). No issues.

---

## FLAGGED ITEMS (none blocking)

### NOTE-1 — Family colour: the two NEUTRAL plates (figs 3, 4) render in toolkit brass `#B07A2C`
The reused `renderBank`/gdp-strip primitives draw their series in the toolkit's v1 "money" hue **brass
`#B07A2C`**, which is not in the v2 `DESIGN.md` §4 palette (that palette puts neutral scaffolding at
**zinc**, and reserves amber `#E0972A` exclusively for seller-owned). Brass is amber-adjacent, so across
the family a reader could in principle pattern-match a NEUTRAL brass line to the ownership amber.
- **Why it is acceptable:** the approved plan (§F, §B.3–4) mandates **native reuse, "no new code"** for
  these two plates, and the toolkit renders brass. Each plate is explicitly tagged NEUTRAL. Its legend
  states "the marks carry **no** ownership hue — ownership rides only the source dots." The two oranges
  are also distinguishable (brass is darker/browner, 3.20:1 vs the brighter #E0972A). Ownership is carried
  correctly on the shelf dots. Intra-figure there is no false cyan/amber dichotomy.
- **Optional hardening (only if the family read must be airtight):** post-render recolour the neutral data
  strokes to iron `#5B6570`/zinc (a DOM pass after `renderBank`/`render`, leaving the shared renderer
  untouched), or keep brass and accept it as a documented native-reuse exemption. **Recommend: accept as
  documented; the NEUTRAL tag + shelf-dot carrier already hold the line.**

### NOTE-2 — Fig 4 whole-record window surfaces grade-C 1914 as the numerically highest mark
See fig 4 above. Mitigated by shimmer + the "different ruler / highest reading, not the maximum of any one
series" annotation + narrative peak pinned to grade-B 1922. Default view clean. Human eyeball advised;
non-blocking.

### NOTE-3 — Fig 5 cosmetic label near-touch at top-left
See fig 5 above. A ~2px nudge on the "14.13%" datum label (or the "14.4%" axis tick) clears it. Cosmetic.

---

## ALL PNG PATHS
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/figures/fig1-hero.png`
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/figures/fig2-instrument-blind.png`
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/figures/fig3-medium-bank.png`
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/figures/fig4-gdp-strip.png`
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/figures/fig5-commission-slope.png`
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/figures/fig6-take-rate.png`
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/figures/fig7-buyer-meter.png`

*Reviewer note: this pass reviews render fidelity, spec conformance, and encoding discipline only. No
claim was verified for truth; grades/intervals are the sources' own and are preserved as shipped.*
