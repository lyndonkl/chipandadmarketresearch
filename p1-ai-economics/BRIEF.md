# P1 — The Economics of Intelligence

**Inspiration**: Stratechery, "Who's Afraid of Chinese Models?" (Ben Thompson).

## The thesis under test

1. Training frontier models is a huge **fixed cost** (compute, data, engineering) amortized over years; serving tokens has a real but much smaller **marginal cost**.
2. In the US, inference supply is constrained and two providers (OpenAI, Anthropic) hold pricing power — so tokens are priced **above** marginal cost.
3. In China, open-source labs price at (or below) **marginal cost** — the marginal supplier sets the price.
4. When US supply catches demand, prices converge toward marginal cost and the labs must differentiate some other way. The open question: does the CapEx ever pay back?

The research confirms, refutes, or refines each proposition with sourced numbers.

## Scope

- **Deep tier**: OpenAI, Anthropic, Google/DeepMind — and DeepSeek, Alibaba/Qwen for the China story (including who eats the fixed costs there).
- **Medium tier**: xAI, Meta, Moonshot/Kimi, Zhipu.
- **CapEx tier**: Microsoft, Amazon, Google, Meta, Oracle, CoreWeave — AI CapEx, capacity, and depreciation schedules only.
- **Window**: 2022 → mid-2026 historical; superforecast to 2030 (the 4-year amortization payback deadline for the current CapEx vintage).

## Core questions

1. What does a frontier model actually cost to build (fixed)? What does a token actually cost to serve (marginal)?
2. What is the AI CapEx wave in dollars per year, and what revenue would be needed to earn it back over 4-year amortization?
3. What are lab revenues, growth rates, and gross margins — US and China?
4. What has happened to per-token prices 2022→2026, US vs China? Is the convergence thesis already visible in the data?
5. Superforecast: P(current CapEx vintage pays back by 2030), inference price trajectory, when US supply/demand balances.

## Deliverables

Three layers per PROCESS.md: `research/` chapters (readability-gated), `data/claims.json` (calibrated numbers), experience in `../docs/p1/`.
