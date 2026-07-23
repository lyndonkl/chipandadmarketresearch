# Process

Agreed 2026-07-22 via Grill Me session. These are the standing rules for all projects in this repo.

## Execution order

P1 → P2 → P3, strictly sequential (P3 consumes P1+P2 data layers). Per project:

1. **Research phase** — multi-agent workflow fan-out: topic researchers → adversarial verification of key numbers → superforecaster panel on forward targets → chapter synthesis.
2. **GATE (human)**: user reviews findings and numbers before anything is built on them.
3. **Data layer** — every number lands in `data/claims.json` with the calibration schema.
4. **Design phase** — multiple cognitive-design-architect variants, each briefed with the narrative arc, storyline, and data shapes, each pushed toward a different design philosophy; competing proposals converged via Grill Me with the user. Runs immediately after the research gate — never before, because the brief depends on what the evidence actually says. The P1 design pass is the big one: it also decides the repo-wide design system (typography, color, particle language, motion rules) and the hub's tree navigation, since the hub launches with P1. P2/P3 design passes are lighter — project-specific narrative and interaction design within the established system.
5. **Experience build** — unit-viz scrollytelling, fifaworldcup2026 pattern (vanilla JS + D3, Canvas/WebGL where particle counts demand), served from `docs/` on GitHub Pages.
6. **GATE (human)**: user reviews the experience draft.

## Rigor standard

- A "number" = central estimate + 80% CI + source grade + sources + as-of date.
- Source grades — **A**: official filings/disclosures. **B**: credible reporting (named outlets with track record). **C**: triangulated/Fermi estimate (method documented).
- Forecasts: independent multi-agent superforecaster panel, different reference classes per panelist, aggregated via extremized median, variance reported.
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

Local git from day one. Push to GitHub + enable Pages when P1's experience reaches first reviewable draft. The hub launches with one completed branch and two growing ones — the tree is alive by design.
