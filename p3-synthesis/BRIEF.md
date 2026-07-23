# P3 — Why Ads Won't Save AI (or Will They?)

**Depends on**: P1 and P2 data layers. Do not start before both are complete.

## The question

In the 2000s, search had huge fixed costs and near-zero marginal cost, was given away free, and advertising — specifically the quality-weighted auction — monetized it so well it funded everything. AI in the 2020s has huge fixed costs and a real marginal cost, is sold by subscription and API, and nobody has made ads work. Why? Is it purely that you can't put paid ads in responses — or something deeper in the unit economics?

## Method

- **Mechanism comparison**: per-query unit economics, search 2004 vs AI 2026 — revenue per query, cost per query, the intent signal, the auction machinery, user tolerance. Name each ingredient of the 2000s solution as present, absent, or inverted today.
- **Forecast**: superforecaster panel on ad-funded AI futures (e.g., P(ads > X% of major-lab revenue by 2030)), variance reported.

## Grounding rule

Every economic and historical claim must trace to a claim ID in P1 or P2's `data/claims.json`. Exactly one new research lane is allowed: the live ads-in-AI experiments (Google AI Overviews monetization, Perplexity ads, OpenAI's ads plans, Copilot) — because "why is it not viable" must confront the fact that everyone is currently trying.

## Deliverables

Three layers per PROCESS.md: `research/` chapters (readability-gated), `data/claims.json` (new lane only, plus cross-references), experience in `../docs/p3/`.
