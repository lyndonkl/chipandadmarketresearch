# P2 Research Program Plan

Locked 2026-07-30 through a Grill Me session (scope decisions) plus a seven-scout unknown-unknowns probe (`planning/unknown-unknowns-probe.json` — 65 gaps, 11 blocking; every era team must read its era-relevant gaps as seed material). This document is the execution contract: a fresh session (Opus) runs the workflows below in order, without needing this conversation.

Internal working document — exempt from the readability gate. All reader-facing outputs it produces are not.

## 1. Decision ledger (2026-07-30)

| # | Decision |
|---|---|
| 1 | Even-depth eras. The evolution is the story; Google mechanics stay the centerpiece chapter. |
| 2 | Seven eras, cut at mechanism changes, mechanism names (see §2). Era 7 promoted to a full era. |
| 3 | Nine-field era schema (MEASUREMENT added) + money-type axis in SCALE/BUYERS + unit-economics block for eras 5–7 (see §3). |
| 4 | Full money-story restructure: classifieds, directories/Yellow Pages, direct mail tracked from era 1; era 6 told as source-of-funds (intent money first; TV brand money a decade later). |
| 5 | Centerpiece = twin-engine + death coda: auction as yield engine (simulator + worked numbers, full depth, GSP-not-truthful nuance), distribution as volume engine (AOL 2002 economics, TAC, network share, Mehta 2024), Overture post-mortem, era 7 records the auction's death (header bidding → display goes first-price 2019, search goes rGSP → pricing knobs). Simulator gains a first-price/bid-shading panel. |
| 6 | Splice-honest dataset: named overlapping series, documented 1980–2007 bridge, series-concordance object, visible seams on the chart, era-1 SCALE downgraded to benchmark-year estimates with wide CIs. Ad/GDP (capture vs expansion vs reallocation) is an explicit contested analytical thread. |
| 7 | First-class threads chosen at Gate B, not now. Schema collects thread-grade numbers regardless (take rates in PRICING, precision in TARGETING, money-type splits in SCALE). |
| 8 | Readability: the standing four-test gate, unchanged (FK ≤ 10, Ease ≥ 50, Fog ≤ 12, SMOG ≤ 12). |
| 9 | Two human research gates: Gate A after R1+R2; Gate B after R5. |
| 10 | Automated stage verifiers run before every advance and every human gate: per-stage postcondition contracts, bounded auto-repair (max 2 cycles), then halt-and-escalate. |
| 11 | Teams staffed by five new task-agnostic agents in `~/Documents/Projects/claude/agents/` (market-era-historian, series-archaeologist, mechanism-analyst, claim-verifier, stage-auditor); cognitive-design-architect and superforecaster reused. Chapter writing = role prompts + readability-check skill. |
| 12 | Era 7 data-freeze date: **2026-06-30**. Claims after this date are out of scope for P2 (P3 refreshes). |
| 13 | Design phase deferred to the post-research P2 design grill per PROCESS.md. Presentation-scout findings are that grill's standing input (§8). Simulator engine spec (not visuals) lands in R4. |
| 14 | Geography: US-first; one global market-size figure per era where sources exist (era 1: explicit "not sourceable annually" note is acceptable). |
| 15 | This plan executes on Opus in fresh sessions, one workflow at a time, gates honored. |

## 2. Era map v2

Cut at changes in the MECHANISM — who set the price of attention and how — never at round decades or media launches. Names say the mechanism, because the spend chart will show print and direct mail out-earning the "new" medium for decades and chapter titles must not contradict it.

| # | Years | Name | Mechanism that defines it |
|---|---|---|---|
| 1 | 1840s–1917 | **The Middlemen** | Agencies invent themselves as space brokers; the 15% commission; rate cards become enforceable via audited circulation (ABC 1914). Penny press (1833) invents ad-subsidized below-cost content. |
| 2 | 1918–1949 | **Sponsorship** | Advertisers own the shows; networks sell time, not audience; ratings institutions (Crossley/Hooper) make broadcast priceable. WWII excess-profits tax subsidizes advertising. |
| 3 | 1950–1975 | **The Spot Market** | The 30-second spot; the upfront; Nielsen prices the demographic; sponsorship dies ($64k question scandals + rising production costs). |
| 4 | 1976–1993 | **Segmentation** | Cable niches; direct mail's database upgrade (PRIZM geodemographics, mid-1970s); the measurable-response tradition scales. |
| 5 | 1994–2001 | **The Impression** | CPM ported to the web; portals; the banner; GoTo prices the click with a pure-bid auction; dot-com crash resets everything. |
| 6 | 2002–2008 | **The Auction** | AdWords Select's quality-weighted second price (relevance × bid); AdSense; self-serve with no minimums; syndication wars (AOL 2002). CENTERPIECE. |
| 7 | 2008–2026 | **The Machine Market** | Programmatic/RTB; mobile; header bidding kills the waterfall; in 2019 display goes unified first-price while search goes rGSP (opposite directions — search never went first-price, corrected by R4 finding f10); privacy shocks (GDPR/ATT); platforms concentrate then fragment (retail media); antitrust endgame; AI starts buying, selling, and answering. Full era, freeze 2026-06-30. |

Timeline corrections the scouts pre-cleared. Era teams inherit these as constraints:

- AdWords launched Oct 2000 as a CPM product. The auction arrives with AdWords Select, Feb 2002.
- Overture led paid-search revenue through 2002. Google settled Overture's patent suit for ~2.7M shares (~$230M).
- Radio was never the #1 medium by spend.
- "Out of Home" replaced "Billboards" as a category in 2000, at ~3× the expenditure.
- The Wanamaker quote and the "first banner ad" claim are both shaky. Verify each or flag it as attributed legend.

## 3. Era schema v2

Every era produces one record at `data/eras/era-N.json`. All nine fields required. Every quantitative claim carries the calibration object: `{central, ci80: [lo, hi], grade: A|B|C, sources: [...], as_of, about_year}`.

**Time is two fields, never one** (locked at stage P1, 2026-07-31). `as_of` is **provenance**: when the governing source published, filed or was retrieved. It identifies the vintage of a number, it may carry month and day, and it must never appear on an axis or act as a time filter. `about_year` is the **fact year**: one integer, the calendar year the claim is about, and the only field a chart, a timeline or a time axis may read. `about_span` carries the band where a fact covers more than one year; `timeline_ready: false` withholds permission to draw at all. The two answers differ by up to 86 years in this record. See `data/verification/REPAIR-P1.md`, `research/notes/asof-audit.md` and the check `tools/verify_p2.py p1-timeline`.

1. **CREATORS** — who made the ads (agencies, in-house, platforms, individuals). Include the agency industry's own structural state (commission/fee regime, consolidation).
2. **BUYERS** — who paid and for what business reason. REQUIRED sub-split: national brand / local retail / classified / direct response. Name the era's marginal new buyer class.
3. **SELLERS** — who owned the audience/inventory; concentration; who captured the intermediary cut.
4. **MEDIUM** — dominant + emerging channels and share shift. Classifieds, directories, direct mail are tracked channels in EVERY era, not just their peak eras.
5. **SCALE** — total US spend, % of GDP, per-medium split, one global figure (or explicit absence note). REQUIRED sub-split by money type (same axis as BUYERS). Era 1: benchmark-year estimates with wide CIs, never fabricated annual series.
6. **PRICING** — deal structure: who set the price and how (commission / rate card / sponsorship / upfront / CPM / CPC auction); the take rate of each intermediary layer.
7. **MEASUREMENT** — counting technology, counting institution, who paid the counter, known bias or crisis. (Every pricing regime is created by a measurement regime; era 6+ must note the seller became the auditor.)
8. **TARGETING** — how audience was matched to message and at what precision; what measurement made that precision possible.
9. **EVENTS** — 5–10 inflection moments with dates, each carrying its number where one exists.

**Unit-economics block (eras 5–7 only)**: revenue per unit of attention (per query / per impression / per user-hour), cost to serve, gross margin — each calibrated. Era 7 additionally computes the 2023–2026 LLM inference cost-per-query series alongside search's trio. This is P3's single highest-leverage input.

## 4. The stage machine

```
R0 (this plan) ──► R1 era fan-out ──► V1 ──► R2 dataset+forecasts ──► V2 ──► GATE A (human)
                                                                                 │
        ┌────────────────────────────────────────────────────────────────────────┘
        ▼
R3 claim verification ──► V3 ──► R4 mechanism deep-dive ──► V4 ──► R5 synthesis ──► V5 ──► GATE B (human)
                                                                                              │
                                        data layer freeze ◄──────────────────────────────────┘
                                        then: design grill → experience build → final gate (per PROCESS.md)
```

Abstract contract model (applies to every stage; the TLA+ analogy is deliberate — stages are transitions, verifiers check the invariants of the post-state):

```
CONTRACT(stage) = {
  requires:   artifacts + facts that must exist before the stage runs (preconditions)
  produces:   exact artifact paths the stage must emit
  invariants: {
    acquisition: did the agents GET the required state?   (completeness)
    validity:    did they do the required WORK on it?     (transformation correctness)
    readiness:   are the NEXT stage's preconditions met?  (advancement)
  }
  checks:     deterministic (scripts, zero-judgment) + judgment (stage-auditor agent)
  remediation: bounded(2) — violations → remediation payload → repair workflow → re-verify;
               after 2 failed cycles HALT and escalate to human with the violation report
}
```

Machine-readable contracts live at `planning/contracts/r{1..5}.json`. The generic verifier workflow (`workflows/p2-verify-stage.js`) takes a contract path as args, runs the deterministic checks via Bash, spawns stage-auditor for the judgment checks, and either advances, repairs, or halts. A human gate NEVER sees an artifact that has not passed its verifier.

## 5. Stage specifications

### R1 — Era fan-out
- **Team**: 7 × `market-era-historian` (parallel), one per era. Each is parameterized with: era name/years/mechanism summary, schema v2 spec, calibration spec, its era's scout gaps (filtered from `planning/unknown-unknowns-probe.json` by `affected_eras`), the timeline-correction constraints (§2), and output paths.
- **Produces**: `data/eras/era-N.json` (schema record) + `research/notes/era-N-notes.md` (working notes, source log).
- **V1 invariants**
  - *Acquisition*: 7 records exist. All 9 fields are non-empty. Money-type splits are present. Each era lists 5–10 dated events. Eras 5–7 carry the unit-econ block.
  - *Validity*: every quantitative claim carries the full calibration object. Grades stay within the enum. Sources are non-empty. No number comes from the inspiring podcasts. Era-1 SCALE contains no annual series.
  - *Readiness*: neighboring eras agree on boundary-shared facts (judgment check). Claim IDs are unique across eras.
- **Budget**: the heaviest stage. ~40–70 searches per era.

### R2 — Dataset assembly + endpoint forecasts
- **Team**: 1 × `series-archaeologist` (lead) + superforecaster panel (3 panelists, different reference classes) for 2025–2026 endpoint values not yet reported as of the freeze date. Median is the headline; variance reported.
- **Produces**: `data/adspend.json` and `data/forecasts.json` (forecasts kept apart from sourced numbers, per P1 convention). Inside adspend.json:
  - Named series: `coen_mce` 1919–2007, `magna` 1980+, `iab_pwc` 1996+, `irs_soi` long-run cross-check, `benchmarks_pre1919`. Every point is tagged with its source series.
  - A `concordance` object: definitional differences and category breaks (Billboards→OOH 2000, TV broadcast/cable split 1990).
  - A documented 1980–2007 bridge, plus seam annotations for the chart layer.
- **V2 invariants**
  - *Acquisition*: all five series are present, each with a declared coverage window.
  - *Validity*: no point exists in two series without a concordance entry. The bridge is documented over the actual overlap window. Spliced years are graded C. The IRS cross-check is computed, with divergence over 15% flagged. Forecast entries carry panel variance.
  - *Readiness*: the schema supports two-ribbon overlaps for the chart layer. Era-record SCALE figures reconcile with adspend.json within stated CIs (deterministic).

### GATE A (human)
You review: the 7 era records, adspend.json + concordance, V1/V2 reports. Agenda: does the evidence change the era framing; is the dataset's honesty legible; any era needing a re-run before verification spends on it.

### R3 — Adversarial claim verification
- **Team**: `claim-verifier` fan-out — one instance per era record + one for adspend.json (8 parallel), refute-first protocol: each attacks its batch (re-derivation, source audit, CI plausibility, grade challenge).
- **Produces**: `data/verification/verdicts.json` (per claim: confirmed / adjusted / rejected + evidence), remediated era records + dataset.
- **V3 invariants**
  - *Acquisition*: every claim ID has a verdict.
  - *Validity*: every `adjusted` claim shows old→new plus the reason. Every `rejected` claim is removed or replaced — never silently kept.
  - *Readiness*: zero unresolved verdicts. The disagreement log is preserved for the chapters; calibration is content, not housekeeping.

### R4 — Mechanism deep-dive (the twin engine)
- **Team**: 2 × `mechanism-analyst`, plus one merge/reconcile pass.
  - (a) *Auction engine*: pure-bid vs GSP (quality-weighted, second-price) vs first-price with bid shading. Worked numbers prove the revenue and ranking claims. Includes the GSP-not-truthful demonstration and the RGSP/pricing-knob coda. Emits the simulator parameterization.
  - (b) *Distribution engine*: AOL 2002 deal economics, the TAC series, the network-share series, Apple default economics, and the Mehta findings. Emits the capture-attribution analysis.
- **Produces**: `data/mechanism.json` (worked examples with every arithmetic step machine-checkable), `data/simulator-params.json` (scenarios, parameter ranges, expected outputs per panel — including the first-price/bid-shading panel), `research/notes/mechanism-notes.md`.
- **V4 invariants**
  - *Acquisition*: all three artifacts exist. Both engines are covered.
  - *Validity*: every worked example's arithmetic re-computes exactly (deterministic script). Simulator params cover every mechanism claim the chapters will make. Twin-engine numbers carry calibration objects.
  - *Readiness*: simulator-params.json is sufficient to build the sim without re-opening research.

### R5 — Chapter synthesis
- **Team**: role-prompted chapter writers (one per chapter) + readability remediation loop. Chapter map (provisional until Gate B): `01-thesis`, `02`–`08` the seven eras, `09-the-capture-question` (ad/GDP thread, capture vs expansion vs reallocation, candidate threads presented for Gate B selection), `10-verdict-and-handoff` (P3 baseline, freeze-date state of play).
- **Produces**: `research/*.md`, all frontmatter-scored; `planning/thread-candidates.md` (the Gate B menu: each candidate thread with the schema fields + claims that support it).
- **V5 invariants**
  - *Acquisition*: all chapters exist per the map.
  - *Validity*: the four readability tests pass on every chapter (deterministic — `tools/readability.py`). Every number in prose traces to a claims.json ID (deterministic once claims are ID-linked). The jargon sweep produces an explained-terms list. No chapter contradicts a verified claim.
  - *Readiness*: the thread-candidates memo is complete. The data layer is freezable.

### GATE B (human)
You review: chapters, verdicts, thread candidates. Agenda: pick the first-class threads (each becomes a synthesis chapter + visual); approve the data-layer freeze; green-light the design grill.

### After Gate B (per PROCESS.md, unchanged)
Data layer freeze → P2 design grill (cognitive-design-architect variants, seeded with §8) → experience build → review sweeps → final human gate. Not planned in detail here by decision #13.

## 6. Workflow file map

| File | Stage | Agents |
|---|---|---|
| `workflows/p2-r1-era-research.js` | R1 | 7 × market-era-historian |
| `workflows/p2-r2-dataset.js` | R2 | 1 × series-archaeologist + 3 × superforecaster |
| `workflows/p2-r3-claim-verification.js` | R3 | 8 × claim-verifier |
| `workflows/p2-r4-mechanism.js` | R4 | 2 × mechanism-analyst + merge |
| `workflows/p2-r5-synthesis.js` | R5 | ~10 chapter writers (role prompts) |
| `workflows/p2-verify-stage.js` | V1–V5 | stage-auditor + deterministic scripts; takes `{contract: "planning/contracts/rN.json"}` as args |

Run order: R1 → verify(r1) → R2 → verify(r2) → **stop for Gate A** → R3 → verify(r3) → R4 → verify(r4) → R5 → verify(r5) → **stop for Gate B**. Each workflow is independently resumable; verify workflows are re-entrant (safe to re-run after manual edits).

## 7. Budget (order of magnitude)

Planning probe measured ~57k subagent tokens per scout at ~15 searches. Research depth runs 3–5× that. Estimate: R1 ≈ 2.5–4M subagent tokens; R2 ≈ 0.8M; R3 ≈ 1.5M; R4 ≈ 0.8M; R5 ≈ 1.2M; verifier/remediation overhead ≈ +20%. Total ≈ 8–10M subagent tokens across the research phase, front-loaded in R1. Fresh sessions per workflow recommended (web-search budget resets, context stays clean).

## 8. Design-grill inputs (saved for the post-research phase)

From the presentation scout (full detail + URLs in `planning/unknown-unknowns-probe.json`):
- **data-to-viz.com verified**: a decision-tree from data shape to chart form with a caveat catalog. Useful for the standard-form choices; it does NOT solve narrative scrollytelling structure or the simulator — those need the precedent studies below.
- The signature chart's naive form (stacked area / streamgraph) is a documented readability trap for middle-band series; the design grill must weigh alternatives (small-multiple shares, bump charts, layered ribbons with seam annotations).
- The two-ribbon seam treatment (decision #6) is a design constraint, not an option.
- No copyable template exists for the auction simulator — highest-effort, least-precedented deliverable; explorable-explanations precedents (Nicky Case et al.) are the study set; R4's simulator-params.json de-risks the content side.
- The rigor layer (80% CIs, source grades) needs an on-chart representation decision; P1's approach is the starting point.
- Era 1 (77 years) is off the 1919+ signature chart — the experience needs a deliberate answer for how pre-1919 scale is shown (benchmark-year markers, not a faked series).
- Mobile/responsive plan needed for sticky-hero + touch simulator.

## 9. Execution runbook (for the Opus session)

1. Read this file, `BRIEF.md`, `PROCESS.md`, the agent files (§1 decision 11), and skim `planning/unknown-unknowns-probe.json`.
2. Run workflows in §6 order. After each verify pass: on PASS advance; on HALT surface the violation report and stop.
3. Stop at Gate A and Gate B — present the gate agenda from §5 and wait for the human.
4. Never edit a claim without a verdict trail; never let prose ship a number that isn't in claims.json; never splice series without a concordance entry.
5. Record progress in `PROGRESS.md` as work lands (repo convention).
