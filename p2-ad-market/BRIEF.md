# P2 — The Attention Economy

**Inspiration**: Acquired, "Google Part I: Origins of Search" (June 30, 2025).

## The question

How big was the advertising economy before digital, how did it work, and what exactly did Google change that let it capture so much of it?

## Scope

- **Full arc, weighted**: origins 1840s–1910s told in events (agencies, the 15% commission, birth of media buying); hard numbers from 1919 (US ad spend, % of GDP, newspaper → radio → TV medium shifts); deepest on 1994–2010.
- **The Google mechanics** (centerpiece): syndicating search to third parties (Yahoo et al.) → GoTo/Overture's pure-bid paid search → AdWords → AdRank (relevance × bid) → the quality-weighted second-price auction → AdSense. WHY the auction design maximizes revenue, proven with worked numbers and an **interactive auction simulator** in the experience.
- **Geography**: US-first; each era carries a global market-size figure; Google international revenue once it matters (~2004+).
- **Endpoint**: deep narrative to ~2008 (model proven, IPO era); compressed data epilogue 2008→2026 (programmatic, the duopoly, retail media, today's market) — the epilogue exists to hand P3 its baseline.

## Core questions

1. Ad spend by year and medium, 1919→2026 — the century-long dataset.
2. What was the deal structure of each era (commission, upfronts, CPM) and what did Google's auction change about who set prices?
3. Why does relevance × bid, second-price, beat pure-bid? (Mechanism, worked examples, simulation.)
4. Event timeline: the deals, launches, and inflection numbers 1994–2008.

## Deliverables

Three layers per PROCESS.md: `research/` chapters (readability-gated), `data/claims.json` + `data/adspend.json` (the century series), experience with auction simulator in `../docs/p2/`.
