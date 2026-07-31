# P2 — The Attention Economy

**Inspiration**: Acquired, "Google Part I: Origins of Search" (June 30, 2025).
**v2, locked 2026-07-30** via Grill Me + a seven-scout blind-spot probe. v1's "deepest on 1994–2010" weighting is replaced: every era is first-class. Execution contract: [PLAN.md](PLAN.md).

## The question

How did the advertising market work in each era of its 180-year history, what did each mechanism change hand to the next, and what exactly did Google change — and NOT change — that let it take so much of the money?

## Scope

- **Seven even-depth eras**, cut where the pricing mechanism changed and named for the mechanism. They are: The Middlemen (1840s–1917); Sponsorship (1918–49); The Spot Market (1950–75); Segmentation (1976–93); The Impression (1994–2001); The Auction (2002–08); The Machine Market (2008–26). Era 7 is a full era with a data-freeze date of 2026-06-30.
- **A fixed nine-field schema per era**: creators, buyers, sellers, medium, scale, pricing, measurement, targeting, events. Buyers and scale split by money type: national brand / local retail / classified / direct response. Eras 5–7 add unit economics (revenue, cost, and margin per query / impression / user-hour) — the handoff P3 needs.
- **The money story**: classifieds, directories (Yellow Pages), and direct mail are tracked from era 1. Search ate intent money first — classifieds, directories, direct response. TV brand money moved a decade later. Era 6 is told as source-of-funds.
- **The centerpiece (era 6), twin-engine**: the auction was the yield engine — AdRank (relevance × bid), the quality-weighted second price, AdSense, self-serve with no minimums — proven with worked numbers and an interactive auction simulator, including why GSP is not truthful. Distribution was the volume engine — the 2002 AOL deal, TAC, syndication share, the Mehta ruling's retrospective verdict. Plus an Overture post-mortem: a profitable pure-bid auction that lost on distribution. Era 7 records the auction's death: header bidding, then the two 2019 changes that ran in opposite directions — open-web display moved to a unified first-price auction, while search got rGSP and the pricing knobs. Search never went first-price. The simulator carries a first-price/bid-shading panel so it never teaches a dead mechanism as current.
- **The dataset**: no single 1919–2026 series exists, so the data layer is splice-honest. It holds named overlapping series: the Coen/McCann spine 1919–2007, Magna 1980+, IAB 1996+, an IRS long-run cross-check, and pre-1919 benchmark years. It adds a documented bridge, a series-concordance object, and visible seams on the chart. Ad spend as a share of GDP — capture vs expansion vs reallocation — is an explicit contested thread, with competing series shown side by side.
- **Geography**: US-first; one global figure per era where sources exist.
- **Threads**: first-class cross-era threads (each a synthesis chapter + visual) are chosen at Gate B, from evidence, not before.

## Core questions

1. For each era: who made the ads, who paid, who owned the audience, who counted it, who set the price, and by what mechanism?
2. Which money moved when — and did digital capture the ad economy, expand it, or reallocate it?
3. Why does relevance × bid with a second price beat pure bid — and why did the market that proved it then abandon it?
4. How much did the auction matter versus distribution, and what does the record (deals, TAC, the DOJ case) actually support?
5. What are the unit economics of ad-funded attention, era by era — and what do they say to P3's question about ads funding AI inference?

## Deliverables

Three layers per PROCESS.md: `research/` chapters (readability-gated), `data/` (claims.json, adspend.json with concordance, mechanism.json, simulator-params.json, forecasts.json), experience with the auction simulator in `../docs/p2/`. Research runs as gated workflows with automated stage verifiers — see PLAN.md.
