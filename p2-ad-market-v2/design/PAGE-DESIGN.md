# P2 v2 Page Design — Reading Experience & Layout: "Who Owns the Number"

*Internal build doc — exempt from the readability gate. Reads with `DESIGN.md` (the design system); this file specs the reading experience and page layout.*

The article runs **15 movements** (s0–s14) plus a substantial provenance **appendix**. Each movement is a short 2–5 paragraph "question," each carrying graded (A/B/C) claim-ids and, in several places, a legend it corrects. Every choice below works strictly inside P1's "The Instrument."

---

## 0. Cognitive model (the reading this design serves)

Three facts about *this* text drive every decision:

1. **It is theme-and-variations, not a funnel.** One question ("who owns the number") is restated 15 ways. Fifteen movements exceed working memory (Cowan's 4±1) by a wide margin, so the design's first job is **wayfinding** — keeping the reader oriented in a long argument that loops back on itself. Solution: chunk 15 → ~4 acts, and carry the thesis as a *persistent color spine*.
2. **The uncertainty is the subject.** Grades, confidence intervals, "this is my reading," declared gaps — the epistemic apparatus is load-bearing, not footnote hygiene. So the citation/grade layer must be *always visible and perceptually felt*, not hidden. This is P1's measurement-jitter thesis ported from data marks to claims.
3. **It is reading-first.** Prose is the spine; figures support. The page must open and behave as a **document**, not an experience — one settle on load, then stillness. (P1 guardrail: defend warmth actively or austerity reads cold.)

The reader is served in **two modes simultaneously** (Nielsen): deep linear reading down the measure, and F-pattern scanning across section titles, margin stats, and figures. The layout gives each its own zone.

---

## 1. Page architecture & the grid

Three-zone CSS-grid at wide widths, collapsing to one column. Everything locks to P1's **22px engineering-grid module** (call it `1u = 22px`); vertical rhythm is a multiple of `u`, so the faint grid and the type share one cadence (Gestalt continuity — consistent rhythm lowers the perceptual cost of scanning).

```
┌──────────┬───────────────────────────┬──────────────────┐
│ NUMBER   │      READING COLUMN        │  CITATION GUTTER │
│ RAIL     │      (the measure)         │  (sidenotes)     │
│ ~7rem    │      min(92vw, 68ch)       │  ~20rem          │
└──────────┴───────────────────────────┴──────────────────┘
   act/section     graded prose + figures    claim-ids · grades
   markers,        (Newsreader)              (Plex Mono, Zinc)
   ownership
   spine
```

- **Reading column** — the measure, centered, ~680–700px. All prose and every figure plate live here.
- **Left number rail** — section indices (Martian Mono), act labels, and the **ownership spine** (§3). Hangs outside the measure so it never interrupts saccades.
- **Right citation gutter** — Tufte-style **sidenotes** (§4). Reference material that must not break reading flow belongs in the margin, keyed to the paragraph, per Tufte's proven sidenote model.

**Ground (light-only):** Bone `#F2EEE4` everywhere. The engineering grid renders at full faintness in the *margins and figure plates*, but is **suppressed to ~30% opacity directly behind the reading column** — grid lines behind serif body text depress legibility (they add high-frequency noise to letterform edges). The reading column reads as a calm Bone card floating over the instrument grid.

---

## 2. Type scale & measure

Base body **21px / 33px line-height** (33 = 1.5u — vertical rhythm rides the grid). Modular ratio ≈ **1.25 (major third)** — a calm scale for long reading; larger jumps reserved for the masthead only.

| Role | Face | Size / LH | Notes |
|---|---|---|---|
| Masthead title | Newsreader (display optical) | 56px / 1.05 | Words, not numerals → serif, for reading warmth |
| Dek / dateline | IBM Plex Mono | 15px / 22px, tracked | "A history… read through one question" + provenance line |
| Act label | Martian Mono | 13px / 22px, +8% tracking | e.g. `ACT II · THE COUNT DRIFTS BACK` |
| Section number | Martian Mono | 15px kicker | `00`–`14`, numerals as protagonists |
| Section title (the question) | Newsreader | 32px / 1.15 | "Who counted the readers" |
| Stance lead line | Newsreader (medium/italic) | 24px / 1.35 | The one-line opener each section runs; doubles as scannable skeleton |
| **Body** | **Newsreader regular** | **21px / 33px** | The workhorse |
| Stat-callout | Martian Mono | 22–28px | Numerals *lifted into the margin* (§3) |
| Figure caption | Newsreader | 17px / 24px | |
| Citation shelf / data chrome | IBM Plex Mono | 13px / 22px | Zinc `#838A93` |

**Measure:** `max-inline-size: 68ch` on the reading column → ~62–70 characters per line, Bringhurst's comfort band for continuous serif reading. `ch` auto-tracks Newsreader's metrics across breakpoints.

**Deliberate deviation from "all numbers in Martian Mono," with the reason:** this piece is *saturated* with inline figures (64.9%, $184.1M, 73/27, 5.91%…). Mono-setting every inline number fragments the running line and breaks saccade rhythm (perceptual-fluency cost). So: **inline numbers stay in Newsreader** (use its lining figures); **Martian Mono is the "instrument-readout" face** used only where numbers are *on display* — section indices, figure axes/values, hero readouts, and **stat-callouts** lifted out of the running line into the margin. Numbers stay protagonists — via promotion to the margin, not by shattering the body.

---

## 3. Section rhythm & wayfinding

**Chunk 15 → 4 acts** so the reader holds a 4-item mental map instead of 15 (Cowan). Recommended grouping (boundaries confirmable by the content workflow):

- **ACT I — The independent number is built** — s0 opener/thesis, s1 the price, s2 the 1914 audit.
- **ACT II — The count drifts back** — s3 count changes hands, s4 the plates, s5 did the 15% die, s6 the people meter.
- **ACT III — The buyer's meter & the door** — s7 the buyer's own meter, s8 who gets in the door, s9 the dial.
- **ACT IV — The seller takes the number back** — s10 the governed price, s11 the state, s12 born uncounted, s13 which total, s14 back to the hole.

**Section marker (major graduation on the instrument scale):** each movement opens with, in the left rail, the Martian-Mono index (`03`) and a short **tick rule** bleeding from the grid — sections read as labeled graduations on a ruler running top-to-bottom, reinforcing the instrument metaphor and giving Lynch-style wayfinding. Spacing: **6u (132px) above a section**, **10u above an act break** (act break also carries the Plex-Mono act label + a full-measure hairline Zinc rule). Segmenting boundaries (Mayer) let the reader pace and consolidate between movements.

**The ownership spine (persistent wayfinding + thesis-in-miniature):** a slim vertical rail in the left margin, running the page height, tinted by the *current section's ownership state* — **amber (seller-owned) → cyan (independent, from s2's 1914 audit) → amber (platform-era reversion)**. As the reader scrolls, a marker travels it; the tint under the marker tells them *which epoch of ownership they're reading* and shows, at a glance, the whole thesis shape (the reversion). This is spaced repetition of the central claim and connects micro ("where am I") to macro ("the shape"). It is a lightweight **companion to the hero, not the hero** — driven by simple per-section ownership metadata, and it degrades to a plain scroll-progress bar under reduced-motion / mobile.

**Stat-callout component:** the biggest load-bearing figures (e.g. `73/27`, `24.7%`, `$26.3B`) may be lifted into the right margin as Martian-Mono callouts with a one-line gloss and their grade dot. Serves scanning readers (F-pattern graze) and makes numerals heroic without fragmenting the body.

---

## 4. The citation block — the crux

**Model: Tufte sidenotes.** Each paragraph's sources render as **margin notes in the right gutter**, vertically aligned to the paragraph's top. Unobtrusive, scannable, always present, never interrupting the line of prose. The appendix's existing "citation map" gloss *is* the sidenote text — already written (claim-id + one-line description).

**Anatomy of one source chip (IBM Plex Mono, 13px, Zinc):**

```
  ● A   e6-measurement-006
        ~18% YoY paid clicks, Q4 2008 — no count disclosed
```

- **Grade, dual-coded** (redundant, colorblind-safe per P1's redline discipline): the letter `A/B/C` **and** a fill glyph — **A = solid still square, B = half-filled, C = hatched square that faintly shimmers.** The shimmer is the measurement-jitter device ported to the claim level: grade-A sits still, grade-C *shimmers*, amplitude ∝ uncertainty. Uncertainty is *felt*, not just labeled. Under `prefers-reduced-motion`, C's glyph is a **static hatched band** — no motion.
- **Ownership dot** (the semantic spine, at claim level): **cyan** = the claim rests on an *independent* number (audit, census, court finding); **amber** = a *seller-owned* number (Google's own clicks, Hooper's vendor count). Populated by content; the container reserves the slot. This makes the thesis legible in the apparatus itself — the reader sees seller-owned numbers turn cyan across 1914 and amber again in the 2000s *in the margins*.
- **Claim-id** links to the matching **appendix** entry (multiple access paths — inline sidenote + full provenance in back-matter).

**Density control:** sidenotes are quiet by default (Zinc, small). A single top-of-page toggle — `SOURCES: shown / dimmed` — lets a pure-reading pass fade them to ~15% opacity without removing them (recognition-over-recall preserved; the reader chooses depth). No expand/collapse needed on desktop.

**Content-side dependency to flag:** claims are currently mapped at the *section* level. The content workflow must resolve **claim-id → paragraph (ideally → sentence)** so each sidenote aligns to the right prose. The container supports both paragraph-anchored sidenotes and inline superscript anchors for specific quoted figures/quotes.

---

## 5. Two epistemic treatments this text demands

**(a) The author's-reading marker.** The piece repeatedly separates *the record* from *the author's synthesis* ("That reading is mine…", "adjacency in the record, not a stated law", L4/L5). These passages get a **left-edge marginal flag** in the reading column — a thin Zinc bracket + a Plex-Mono tag `A READING` — so the reader always knows when they've crossed from evidence into interpretation. This is the honesty spine of the whole project made perceptible (and it rhymes with jitter = "uncertainty is visible").

**(b) The myth-correction (Redline) device.** Redline `#C6432B` is reassigned single-use to **DEAD / CONTESTED legends the piece corrects** (s4, s5, s8, s9, s11, s12, s14). When prose sets up a popular legend to knock down ("The tidy version says the 15% commission died…"), the legend renders as a **struck / hatched Redline inline mark or a small `DEAD` inset tag**, visually distinct from the graphite record-prose that follows. Redundantly coded (strike-through **+** hatch **+** `DEAD`/`CONTESTED` label) for colorblind safety, matching P1's redline rule. The s14 "AI Overviews cut the funding click" ships as **CONTESTED** — both values shown, Google's dispute named — using a two-tone variant, not a strike.

---

## 6. Figure-framing convention (the container any figure drops into)

Every embedded live figure sits in a standard **plate** so it reads as native instrumentation. The frame is designed here; the *next* workflow chooses the figure.

```
┌─ FIGURE 03 ─────────────────────────────── [ key ] ─┐   ← Plex Mono kicker + legend affordance
│                                                      │
│            (live figure — full measure width)        │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ RAIL: MAGNA media-owner basis, US$B  ◂── axis   │ │   ← the rail NAMED on the axis (s13 mandate)
│  └────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────┤   ← hairline Zinc rule
│ Caption: what the figure shows, in one plain line.   │   ← Newsreader 17px, spatial contiguity
│ ● A e5-targeting-004  ● B e7-buyers-003  …           │   ← same citation shelf as prose
└──────────────────────────────────────────────────────┘
```

Fixed elements, top to bottom:

1. **Plate frame** — a hairline instrument-bezel inset on the Bone ground; the engineering grid shows at full faintness *inside* the plate (figures live "on the instrument," prose floats above it).
2. **Kicker** — `FIGURE NN` in Martian Mono; a `[ key ]` affordance at right opening the legend.
3. **The figure**, full reading-column width.
4. **Named rail on the axis (non-negotiable, from s13):** every axis states its *basis* — "media-owner revenue," "IRS corporate deductions," "% of GDP." The rail goes *on the axis, not in a footnote.* The container enforces an axis-label slot the figure cannot skip. This is also a fallacy guard: no ad-total chart may imply a single true total.
5. **Caption** — one plain sentence directly beneath (Mayer spatial-contiguity: caption adjacent to what it explains, never across the page).
6. **Source shelf** — identical grade / ownership / claim-id chips as the prose sidenotes, so figure and prose share one citation grammar.

**The reusable Legend / "How to read this" key** (teach the grammar hard, once — P1 beat-1 guardrail): shown **expanded on the first figure**, thereafter a collapsed `[ key ]` chip. Contents:

- **still mark = grade A (audited/settled) · shimmering mark = grade C (uncertain); amplitude = uncertainty.**
- **cyan = independent number · amber = seller-owned number.**
- **struck red = a corrected / DEAD claim.**
- Reduced-motion note: shimmer → static hatched band.

Every figure inherits jitter honestly: a grade-C data point *shimmers within its 80% CI*; a grade-A point sits still. Figures never present a point estimate without its uncertainty visible (ports P1's "CI-first reading grammar").

---

## 7. The hero interaction — placement, arrival, behavior

**Intent (given):** "ownership over time" (~1850–2024) — the reader watches who owns the number flip **seller-owned → independent (the 1914 audit) → seller/platform (2000s)**, the ownership color carrying the reversion. Exact data form is the next workflow's; placement, arrival, and behavior are spec'd here.

**Placement — the s0→s1 hinge, with a reprise at s14.** Reading-first means the page opens on **masthead + s0 prose**, not the interactive. s0 states the thesis in words and ends on the perfect hand-off: *"The market had just built the thing that 2008 would quietly take back."* The hero appears **immediately after that line, as FIGURE 01** — the thesis made visible, a promise of the shape the next 14 movements substantiate. This mirrors P1's journey-first stance while honoring the article's own "state the reading up front, then earn it" rhetoric.

- **Arrival:** prose hands off explicitly ("Set 2008 against 1914 →"). A quiet scroll cue sits below s0. On entering the viewport the hero **SETTLES once**: the time axis draws left-to-right via **SWEEP** (x = time, per P1), ownership bands settle into place via **SETTLE**, the reversion color resolving amber → cyan → amber. Then it holds still and invites a scrub/hover to explore epochs. The reader then scrolls on into s1 — the figure has made a promise, not detained them.
- **Reprise at s14 "Back to the hole":** the same hero returns, now *earned* — the reader has the whole record behind them. This is the recapitulation (theme → development → recapitulation; spaced repetition aids consolidation). The s14 instance can be the fuller interactive; the s0 instance can be the leaner "overture."
- **The ownership spine (§3)** is the hero's lightweight companion — it runs the full page height carrying the same amber → cyan → amber reversion, so the thesis shape stays visible in the margin after the hero scrolls off.
