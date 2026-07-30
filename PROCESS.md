# Process

Agreed 2026-07-22 via Grill Me session; amended 2026-07-30 (stage verification, research gates). These are the standing rules for all projects in this repo.

## Execution order

P1 → P2 → P3, strictly sequential (P3 consumes P1+P2 data layers). Per project:

1. **Research phase** — multi-agent workflow fan-out: topic researchers → adversarial verification of key numbers → superforecaster panel on forward targets → chapter synthesis. From P2 on, the research phase may carry **two human gates** (an early gate on raw records and data, a late gate on verified synthesis) when its surface is large; the project's PLAN.md declares the gate placement.
2. **GATE (human)**: user reviews findings and numbers before anything is built on them.
3. **Data layer** — every number lands in `data/claims.json` with the calibration schema.
4. **Design phase** — multiple cognitive-design-architect variants, each briefed with the narrative arc, storyline, and data shapes, each pushed toward a different design philosophy; competing proposals converged via Grill Me with the user. Runs immediately after the research gate — never before, because the brief depends on what the evidence actually says. Each project's design pass is **project-scoped**: it settles that project's own visual language (palette, type, particle metaphor, scene beats).

   **The repo-wide design system and the hub are deferred to a dedicated design review held after P2 research** (decided 2026-07-23). Reason: the shared system must serve the most different data shapes in the repo. That means P1's confidence intervals and cost curves AND P2's century-long time series and interactive auction simulator. It should be designed against both at once, not locked on P1 alone. P1's project-scoped language is treated as **provisional** and becomes seed material for that later review; the architect directions explored during P1 carry forward into it.

   **Three Grill Me design sessions** (the human steers each; architect variants are seed material, not deciders):
   - **P1 design grill** (now) — locks P1's data representations, animations, scene transitions, color scheme, information presentation, and information hierarchy, each argued from cognitive-design principles.
   - **P2 design grill** (after P2 research) — the same, for P2's own choices.
   - **Combined design grill** (after both) — locks the repo-wide system and the hub so the projects flow as one coherent experience, grounded in what the first two grills decided.
5. **Experience build** — unit-viz scrollytelling, fifaworldcup2026 pattern (vanilla JS + D3, Canvas/WebGL where particle counts demand), served from `docs/` on GitHub Pages.
6. **GATE (human)**: user reviews the experience draft.

## Automated stage verification (added 2026-07-30)

Every workflow stage ends with an automated verifier that runs BEFORE any human gate. A human gate never reviews an artifact that has not passed its verifier.

- Each stage declares a machine-readable **contract**: preconditions (`requires`), exact outputs (`produces`), and three invariant classes — **acquisition** (did the agents get the required state?), **validity** (did they do the required work on it?), and **readiness** (are the next stage's preconditions met?).
- Checks are split into **deterministic** (scripts — schema completeness, calibration fields, readability tests, arithmetic re-computation) and **judgment** (an auditor agent for what scripts cannot decide).
- Failure policy: **bounded auto-repair**. Violations produce a remediation payload; a repair workflow applies fixes; the verifier re-runs. After 2 failed cycles the stage HALTS and escalates to the human with the violation report.

## Rigor standard

- A "number" = central estimate + 80% CI + source grade + sources + as-of date.
- Source grades — **A**: official filings/disclosures. **B**: credible reporting (named outlets with track record). **C**: triangulated/Fermi estimate (method documented).
- Forecasts: independent multi-agent superforecaster panel, different reference classes per panelist. Headline aggregate is the plain median (extremizing is only valid when panelists are informationally independent; ours share an evidence digest, so extremizing can push the aggregate below every panelist — it is kept as a secondary figure only). Panel variance is reported, not smoothed away.
- No number is quoted from the inspiring podcasts or from conversation memory — everything researched fresh and cited.

## Readability gate

Every reader-facing markdown/prose output (chapters, site copy, annotations) must pass ALL four before it counts as done:

| Test | Threshold |
|---|---|
| Flesch-Kincaid Grade Level | ≤ 10 |
| Flesch Reading Ease | ≥ 50 |
| Gunning Fog Index | ≤ 12 |
| SMOG | ≤ 12 |

Run `python3 tools/readability.py <file.md> ...`. The goal: preserve the complexity of the ideas, remove the complexity of the sentences. Internal working notes are exempt. Scores are recorded in each file's frontmatter.

## Publishing

Local git from day one. P1's experience can launch with a simple functional hub (the tree is only three nodes); the ambitious tree-hub arrives with the repo-wide design review after P2. Push to GitHub + enable Pages when P1's experience reaches first reviewable draft.
