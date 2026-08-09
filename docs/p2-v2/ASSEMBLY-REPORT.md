# P2 v2 Assembly Report — "Who Owns the Number"

**Reviewer:** assembly reviewer (headless-Chrome capture + read).
**Target:** `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/index.html`
**Method:** CDP-driven Chrome 151 (headless, `--allow-file-access-from-files`), rendered over `file://`,
5.5s settle for iframe auto-height + figure SETTLE/SWEEP, captured at deviceScaleFactor 2. Desktop viewport
1280×1600 at 11 scroll positions; mobile 430×1800 at 3. Every screenshot was read. Prose fidelity for the
un-captured movements was verified by extracting the rendered DOM text (comments stripped) and matching
distinctive sentences against `THE-PIECE.md`. Appendix link integrity checked programmatically.

## OVERALL VERDICT: PASS — ship-ready

The article assembles as one coherent, reading-first document. Prose renders **verbatim** — all 15 movements
confirmed. All **8 figure iframes render live** (7 distinct figures, fig1 hero twice) with **no blank frames**.
The **sidenote citation grammar** (grade badge + ownership dot) sits under paragraphs and figures. The
**ownership spine paints amber→cyan→amber**. **DEAD legends are redline** and **s14 is CONTESTED**. The
page reads as **one design family** with its figures, and mobile collapses cleanly to a single column. No blocking
defects. Two minor, non-blocking observations (both cosmetic / handed to the figures agent) are listed at the end.

---

## Section-by-section

Grades legend below: PASS = renders to spec. All figure iframes reported real inner-body heights (matching the
outer iframe height within 1px) — none blank, none inner-scrolling.

| Beat | What was checked | Verdict |
|---|---|---|
| **Masthead / s0** | "Who Owns the Number" (Newsreader display), dek `THE US ADVERTISING MARKET · 1833–2026`, italic standfirst, provenance line, `SOURCES: SHOWN` toggle, full **HOW TO READ THIS** key expanded (all six swatches: grade-A solid square, grade-C hatch, cyan dot, amber dot, redline DEAD hatch, A-READING bracket). ACT I label. s0 prose verbatim. Two sidenotes correct: `e6-measurement-006` A/amber, `e1-measurement-002` B/cyan. A-READING bracket present. | **PASS** |
| **FIGURE 01 hero (s0 hinge)** | Renders fully. Amber→cyan→amber band: PUBLISHER SELF-COUNT → INDEPENDENT—THE 1914 AUDIT → PLATFORM SELF-COUNT. Grade-B boundary badges at 1914 and ~2004; drift markers at 1946/1987. On-axis basis stated ("who held the count… no value axis — there is no numeric ownership series"). "A READING — NOT A MEASUREMENT" honesty flag. Caption verbatim. Full 7-chip source shelf with correct grade/ownership dots. Expanded key (first figure). | **PASS** |
| **s1 the price** | Prose verbatim. `64.9%` **stat-callout** lifted into gutter, cyan, grade-A gloss. `e1-events-001` sidenote (B, zinc = neutral circulation fact — correct call). | **PASS** |
| **s2 / s3 / s4** | Prose verbatim (DOM text check: ABC-1914, the two radio services + Benny $3,000/wk, the FCC 73/27 audit, "three or four plates on different bases"). Ownership `cyan`. | **PASS** |
| **FIGURE 05 (s5) commission slope** | Cyan single-rail: 14.13→13.92→14.16→13.18→10.98%, flat-then-fall. On-axis basis "commission received, % of media billings (US Census / SoI)". `61% → 10%` stat-callout beside it. **Two redline DEAD panels** ("The 15% commission died in the 1980s"; "Search advertising killed the commission") — struck + hatch + DEAD label. Prose verbatim. | **PASS** |
| **s6** | Prose verbatim (people meters, "No viewer got up off the couch"). Ownership cyan. | **PASS** |
| **FIGURE 07 (s7) buyer's meter** | One-year part-to-whole; pay-per-action part drawn **cyan→amber** (the reverting part), CPM 39% / other 4% zinc; `+6 pts` (51→57) annotation. On-axis basis named. Redline DEAD "Platforms invented performance advertising". Prose verbatim. Grade-A still. | **PASS** |
| **s8 / s9** | Prose verbatim (classified no-commission 1914; national share 61.4→66.3%; direct mail 71.1M households; Overture 442M clicks). Ownership amber. | **PASS** |
| **FIGURE 06 (s10) take-rate reversal** | Amber single-rail (seller's own rate): ~9%→24.7%(2006)→21.5%→21.3%, the rise-then-fall residual. On-axis basis "% of Google Network revenue retained by Google". **VERDICT stamp preserved** (`mech-tac-003` POST-VERIFICATION). Prose verbatim incl. the rGSP / "Butternut Squash" / "it can" passage. Grade-A still. | **PASS** |
| **s11** | Prose verbatim (Noble $8M Blue Network; $26.3B default share). Ownership amber. | **PASS** |
| **FIGURE 02 (s12) instrument goes blind** | Dual-rail caliper: **cyan** Coen rail going dark at 2007 ($10,529m) vs **amber** IAB rail rising to $294,593m (2025); 2.0× caliper at the 2007 overlap; "COEN INTERNET: NO READING AFTER 2007" **absence block**; 2009 −3% mark. Log axis, dual on-axis basis named. Both rails grade-A still. Ownership hues carry the mechanism. Prose verbatim. | **PASS** |
| **FIGURE 03 (s12) by-medium bank** | NEUTRAL small-multiple bank, never stacked, each medium on its own flat baseline (Newspapers 49.1%, pre-1935 partition 66.7%, Radio 14.9%, Business papers 7.2%). SHARE/DOLLARS scale toggle. US-total top panel with "NO FREE ANNUAL TOTAL" block; "NO BY-MEDIUM SOURCE" absence blocks post-2007. Renders correctly. **Tall — see Note 1.** | **PASS** (see Note 1) |
| **FIGURE 04 (s13) GDP strip** | 11 dated readings as marks (no fabricated line), window rocker (POST-1960 ↔ WHOLE RECORD) that produces the "peak in 2000" fallacy-correction; coverage bands; rejected `ds-gdp-001` drawn + stamped; grade-C endpoints (1914/2025) ride low. On-axis basis + non-commensurability caveat. Redline DEAD "single US ad-market total". Prose verbatim. **Tall — see Note 1.** | **PASS** (see Note 1) |
| **s14 back to the hole + FIGURE 01 reprise** | Prose verbatim. **CONTESTED device** renders as a redline panel labelled CONTESTED (two-tone, **not** struck): both values 8% / 15% shown, "Google disputes the study" named. A-READING bracket on the closing synthesis. Hero **reprises** the full amber→cyan→amber band, earned. Sidenotes `e7-events-008` B/amber (CONTESTED), `e7-targeting-004` B/amber, `e1-measurement-002` B/cyan. | **PASS** |
| **Ownership spine (whole page)** | `data-ownership` per section: s0–s1 amber → s2–s6 cyan (1914 audit era) → s7–s14 amber (reversion). `#spine` + `.spine__track` + scroll-tracking `.spine__marker`. Amber→cyan→amber confirmed in the DOM and visible in every viewport. | **PASS** |
| **Appendix / back-matter** | 52 `claim-entry` blocks; 52 distinct sidenote `#href`s, **0 dangling**, **0 duplicate ids**. Stitcher's authored anchors `#e6-measurement-006` / `#e1-measurement-002` present. | **PASS** |
| **Design-family coherence** | Bone ground + faint engineering grid; Newsreader 68ch body; Martian-Mono numerals/readouts; IBM Plex Mono chrome; amber/cyan = ownership only; redline single-use for DEAD/CONTESTED; grade = jitter badge (dual-coded letter + fill glyph A solid / B half / C hatch). Figures sit in a uniform plate (kicker, key, on-axis basis, caption, source shelf) and read as native instrumentation. Light-only. | **PASS** |
| **Mobile (430w)** | Collapses to a single column: masthead, key (swatches wrap), ACT label, s0 all legible; citations collapse inline under their paragraphs; FIGURE 01 and FIGURE 02 embed and auto-height (no blank, no inner scroll); source-shelf chips wrap. Spine degrades to a top scroll-progress bar. | **PASS** |

---

## Notes (minor, non-blocking)

**Note 1 — s12/s13 plates run tall (reading-flow, figures-agent domain, not a render defect).**
At 1280px desktop the plates auto-height to **fig3 ≈ 6,103px (~4 screens)** and **fig4 ≈ 3,352px (~2 screens)**,
because those two figure files carry large stacked methodology/small-multiple note-boxes under the chart. Both
render correctly and completely — this is not a blank/broken frame — but in a reading-first article the s12→s13
stretch makes the reader scroll several screens of exhibit before the prose resumes. The stitcher already flagged
this. Recommend the figures agent trim or collapse the in-plate methodology boxes on fig3/fig4 so each plate is
closer to one screen. (Total document height is 37,772px, dominated by these two plates.)

**Note 2 — mobile citation ordering (cosmetic).**
On mobile the paragraph-anchored sidenotes collapse inline anchored to the paragraph *top*, so a paragraph's
citation can render immediately **above** the paragraph it supports (seen at s0's first claim). It is legible and
clearly associated; only the ordering is slightly unusual. Optional: anchor inline citations to the paragraph
bottom on narrow viewports.

---

## Screenshots (all read; paths absolute)

Desktop 1280w:
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-01-top.png` — masthead + HOW-TO-READ key + ACT I + s0 + spine
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-02-hero.png` — FIGURE 01 hero (amber→cyan→amber) + s1 64.9% callout
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-03-s1.png` — s1 price
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-04-fig5-s5.png` — FIGURE 05 commission slope + 2 DEAD panels
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-05-fig7-s7.png` — FIGURE 07 buyer's meter (cyan→amber part) + DEAD
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-06-fig6-s10.png` — FIGURE 06 take-rate reversal + VERDICT stamp
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-07-fig2-s12.png` — FIGURE 02 dual-rail caliper + absence block
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-08-fig3-s12.png` — FIGURE 03 by-medium bank (tall)
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-09-fig4-s13.png` — FIGURE 04 GDP strip + window rocker + DEAD
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-10-s14-reprise.png` — s14 CONTESTED + FIGURE 01 reprise
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-11-s14-contested.png` — s14 CONTESTED (detail)

Mobile 430w:
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-12-mobile-top.png` — masthead + key + s0, single column
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-13-mobile-hero.png` — FIGURE 01 hero on mobile + s1
- `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_shot-14-mobile-fig.png` — FIGURE 02 on mobile + spine progress bar

Diagnostics: `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/docs/p2-v2/_diag.json` (per-figure offsets + inner-body heights), `_mdiag.json`.
