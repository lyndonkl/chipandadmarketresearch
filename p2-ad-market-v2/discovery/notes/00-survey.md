# 00 — Survey: candidate narrative threads in the US ad-market graph

**Role:** Narrative Architect (graph navigator). **Method:** top-down L3→L2→L1→L0, every thread walked
to a sourced claim and pulled with `claim.py`. Grades and 80% intervals preserved as the graph carries
them. This is a **discovery survey**, not an architecture and not prose. Structured under the
`narrative-evidence-ledger` (frame lock + typed findings + DEAD/opposition column) and
`narrative-form-triage` (ABT + form verdict) skills.

**Provenance statement (required):** this note records provenance. No claim in it has been verified.
Human verification status: none. The graph and its frozen claims are the only world explored.

---

## Frame lock (whole corpus)

- **UNIT:** one sourced claim about the US advertising market — a measurement, a dated event, or a
  definitional boundary — id'd `e{era}-{field}-{n}` (eras 1–7), plus `ds-*` cross-checks and `mech-*`
  mechanism claims.
- **DENOMINATOR:** most claims are shares of "total US advertising spend" or "of GDP" — but **the
  denominator is itself the corpus's central dispute** (see Thread 1). Rejected alternative: a fixed
  media-owner-revenue denominator — rejected because the sources disagree on whether the base is
  advertiser billings, seller revenue, or the IRS deduction (`ds-crosscheck-001`).
- **WINDOW:** 1841 (Palmer's agency) / 1900 (first dollar estimate) → 2025. Seven eras. Rejected
  alternative: 1919-onward (where the Coen series is continuous) — rejected because the pre-1919
  benchmarks and the 1841 commission origin are load-bearing for two threads.
- **BOUNDARY / POPULATION:** "the US advertising market" — but who is *inside* it (does direct mail
  count? trade promotion? agency fees? ad-tech take?) is contested and drawn differently by every
  compiler. This boundary dispute is itself Threads 1 and 8. The line was drawn by the *sources*, not
  by me; I surface the disagreement rather than resolve it.

**Starting hypothesis (dated 2026-08-08, from the L3 list before drilling):** "The story is digital /
Google displacing legacy media." **Diff after drilling:** the data resists this. The L3 ladder is
overwhelmingly *measurement regimes* (the seven largest themes are all metrics/measurement/pricing
frameworks), and the graph **explicitly wires `NOT_CAUSED_BY` correctives against the easy
'internet-killed-X' arcs** (commission death, real-estate classified). The real spine the evidence
supports is **"who counts the audience, and who owns the number,"** not "digital ate media." That diff
is the evidence doing its job.

---

## The DEAD / opposition column (the corpus's built-in anti-narrative guards)

The graph wires oppositions as edges. These are a **gift** to an architect: they pre-empt manufactured
causation. The load-bearing ones, all pulled from the `EXCLUDES / NOT_CAUSED_BY / CONFLICTS_WITH` sweep:

- `e6-creators-002` **NOT_CAUSED_BY**: the collapse of billings-based agency pay was **not** caused by
  the arrival of search advertising — it followed the 1991-94 unbundling.
- `e6-scale-009` **NOT_CAUSED_BY**: real-estate classified fell **with the housing market, not with
  search.**
- `e1-scale-004`, `e5-medium-004`, `ds-crosscheck-001` **CONFLICTS_WITH**: the market's own size is
  reported by conflicting lineages (Coen vs Printers' Ink; Coen vs IAB; IRS deduction vs media-owner
  revenue).
- `e7-measurement-001` **EXCLUDES**: sub-three-second views excluded from a watch-time metric.
- `e6-measurement-006` **EXCLUDES**: Google discloses paid-click *growth* but excludes absolute click
  count, average CPC, and query count.

**One rejected/DEAD claim to carry, not hide:** `ds-gdp-001` (verdict **rejected**) — the "constant 2%
of GDP" folklore. It stays in the ledger, typed as CONTRADICTED-by-record, because it is the belief
Thread 5 overturns; it must reach the reader, not be pruned.

---

## Candidate threads (8)

Each: L3/L2 anchor · why promising · 2–3 real claim ids with the statement (grade + interval) · causal
grade of the key link · ABT spine (as labeled `AND / BUT / THEREFORE` clauses) · provisional form
verdict.

### Thread 1 — The Denominator War: who owns the number
**Anchor:** L3 `Advertising Spend Metrics` / L2 `Coen series`, `US advertising share of GDP`; L3 `Ad
Spend Metrics Suite`. **Type:** opposed · quantified · cross-era. **Protagonist:** SYSTEM (the
measurement regime).

- `e1-scale-004` (B, ci80 [400,600]): 1900 US ad volume is **$450M (Coen 1999 revision) to $542M
  (Printers' Ink)** — "two credible lineages disagree by 20 percent and are both carried."
- `e5-medium-004` (C, ci80 [2.6,3.7]): internet's 2000 share is **2.6% / 3.3% / 3.7%** depending on
  which numerator over which denominator — "Basis must be declared, not blended."
- `ds-crosscheck-001` (C, ci80 [28,34]): the IRS ad deduction ran **~17% above media-owner revenue in
  2007, widening to 31% by 2022**; "they agreed in 2007" is a **basis artefact.**

**Causal grade:** L1 — each disagreement is a basis/accounting-identity difference the claim itself
decomposes. **ABT:**
- **AND:** The US measures its ad market to the dollar. Every compiler cites a total.
- **BUT:** the numerator and denominator come from different lineages that disagree by up to 20%.
- **THEREFORE:** every share statistic in the record is a claim about a basis, not a fact about the world.

**Form:** EXPLANATORY, spiral (same question re-opened each era). Runner-up: STORY with the number as
system protagonist.

### Thread 2 — The 15%: the middleman's cut (the commission), 1841→2003
**Anchor:** L3 `Advertising Financial Metrics` / L2 `advertising agency`; L3 `Ad Measurement & Metrics
Framework` / L2 `Agency commission rate`. **Type:** quantified · cross-era · a measure that moved ·
wired corrective. **Protagonist:** SYSTEM (a pricing rule as institution).

- `e1-creators-001` (B, ci80 [20,30]): Volney Palmer, first US ad agent, paid **~25% of the space
  price** (c.1841).
- `e3-creators-002` (B, ci80 [66,76]): the 15% "outlived the decree" — **71% of the largest national
  advertisers still on commission in 1982**; era 3 is the commission's **peak, not its death.**
- `e6-creators-002` (B, ci80 [8,14]): billings-based compensation **fell to ~10% by 2003 from 61% in
  1994** — and the collapse followed the **1991-94 unbundling, NOT the arrival of search.**

**Causal grade:** L3 SEQUENCE — the "not search / followed unbundling" link is a wired `NOT_CAUSED_BY`
plus an order attribution; do not harden to "unbundling caused." **ABT:**
- **AND:** A 15% cut on media billings organised the agency business for a century. It survived a 1950s
  consent decree.
- **BUT:** media-buying was unbundled from creative in 1991-94.
- **THEREFORE:** the commission collapsed to a tenth of advertisers — before search advertising existed.

**Form:** STORY candidate (single continuous entity, rise→peak→fall), system protagonist.

### Thread 3 — The cut never disappeared: it moved to the auction take
**Anchor:** L3 `Advertising Financial Metrics`; L3 `Ad Inventory Metrics & Pricing`. **Type:**
quantified · cross-era rhyme with Thread 2 · the middleman's cut, digital. **Protagonist:** SYSTEM.

- `e5-sellers-005` (A, ci80 [55,57]): Overture paid **64% (2000) → 51% (Q4 2001) of revenue** to
  distribution partners (traffic acquisition cost); **>95% of traffic came from affiliates.**
- `mech-tac-002` (A): Google's distribution TAC rose to **11.0% of total TAC by 2008** (split from
  AdSense TAC in its 10-K).
- `e7-pricing-005` (B, ci80 [30,45]): ANA study — only **~36¢ of every DSP dollar reaches a
  consumer**; 29¢ transaction cost, 35¢ media-productivity loss. (BASIS CAVEAT in the claim: the $88B
  pool is not confirmed US-only; do not treat as a US total.)

**Causal grade:** L1 — each is a filed or audited accounting figure. **ABT:**
- **AND:** The 15% commission died. Everyone declared the middleman finished.
- **BUT:** a new cut returned as the auction and ad-tech take.
- **THEREFORE:** the intermediary's share did not vanish. It moved and grew opaque.

**Form:** EXPLANATORY / dual-profile with Thread 2 (commission vs auction cut on one denominator, "the
intermediary's take"). **Merge note:** 2+3 braid naturally into one 180-year "middleman's cut" spine.

### Thread 4 — Who counts the audience: the currency across eras
**Anchor:** L3 `Ad Measurement & Metrics Framework` / L2 `auditing organization`; L3 `Advertising
Measurement & Analytics` / L2 `Google`. **Type:** cross-era · recurring institution · opposed (who
controls the count). **Protagonist:** SYSTEM (the audience-measurement currency).

- `e1-measurement-002` (B): the **Audit Bureau of Circulations, founded 1914**, merged a publisher-led
  and an advertiser-led body — the **world's first circulation auditor** (a *joint* currency).
- `e6-measurement-006` (A): Google discloses paid-click **growth (~18% YoY Q4 2008)** but **never
  absolute clicks, average CPC, or query count** — the seller now owns the count.
- `e7-measurement-001` (B): Facebook paid **$40M (2019)** to settle claims it inflated video watch-time
  **up to 900%** by excluding sub-three-second views.

**Causal grade:** L1 for the events; the "seller captured the currency" arc is **L2/L3** — a documented
shift in who reports, not a single mechanism. **ABT:**
- **AND:** Every new medium arrives with no way to count its audience. A neutral body is built to
  certify it — ABC did this in 1914, jointly by buyers and sellers.
- **BUT:** in digital the seller became the sole scorekeeper, disclosing only growth and settling
  metric-inflation suits.
- **THEREFORE:** the audience currency drifted from a jointly-audited public good to a seller-controlled
  black box.

**Form:** EXPLANATORY, strong cross-era spine — arguably the corpus backbone, since the L3 ladder is
overwhelmingly measurement regimes. Runner-up: STORY (system protagonist = the currency).

### Thread 5 — Advertising's share of GDP, and the "constant 2%" folklore it kills
**Anchor:** L3 `Advertising Spend Metrics` / L2 `US advertising share of GDP`. **Type:** quantified ·
opposed (debunks folklore) · cross-era · instrument caveat baked in.

- `ds-gdp-001` (C, verdict **rejected**, ci80 [2.7,3.2]): share was **~3.0% in 1922**, fell to
  **1.2-1.3% in WWII**, recovered to a post-1960 max ~2.5% in 2000. "The 'constant 2% of GDP' folklore
  is an artefact of quoting the post-1960 window only." *(Keep as DEAD/CONTRADICTED-the-folklore.)*
- `e6-scale-003` (B, ci80 [1.9,2.2]): share **peaked in 2000 (~2.3-2.5%) and fell below 2% by 2007** —
  identical direction in every vintage.
- `e7-scale-002` (C, ci80 [1.24,1.48]): **~1.32% of GDP in 2025** ($405B / $30.762T) — but the fall
  since 2000 is "**partly real and partly a change in what 'advertising' counts**" (ties to Thread 1).

**Causal grade:** the decline is L1 (arithmetic); the *interpretation* is **instrument-flagged** by the
claim itself — do not narrate as pure real decline. **ABT:**
- **AND:** Everyone "knows" advertising is a constant 2% of GDP. It gets cited as a law.
- **BUT:** it was 3% in the 1920s, 1.3% in the war, and 1.3% again by 2025 — and part of the recent
  fall is a change in what counts.
- **THEREFORE:** the "law" is a folklore artefact of a cherry-picked window.

**Form:** EXPLANATORY, single-measure-that-moved.

### Thread 6 — Did the internet kill classified? The data refuses the easy arc
**Anchor:** L3 `Classified Ad Revenue Metrics`; L3 `Ad Spend Metrics Suite` / L2 `advertising medium`.
**Type:** opposed (anti-narrative, wired) · quantified.

- `e6-scale-009` (A): US newspaper classified fell **$15.9B (2002) → $10.0B (2008)**; **help-wanted
  collapsed 91%** ($8.7B peak 2000 → $786.8M by 2009); **but real-estate classified peaked in 2006
  ($5.16B) and fell with the housing market, not with search** (`NOT_CAUSED_BY` edge).

**Causal grade:** the numbers are A; the split causal reading is **L2 CORRELATION** wired as
`NOT_CAUSED_BY` — a documented refutation of the single-cause story. **ABT:**
- **AND:** "The internet killed classified." The totals seem to prove it.
- **BUT:** the sub-categories tell two stories — help-wanted collapsed with online job boards,
  real-estate tracked the housing crash.
- **THEREFORE:** the single-cause arc is false. One headline hides two unrelated mechanisms.

**Form:** a CORRECTIVE node / the load-bearing BUT for Thread 4, or a standalone single-question
investigation. Small on its own; powerful as a hinge.

### Thread 7 — The pricing machine: rate card → first-price → GSP → back to first-price
**Anchor:** L3 `Ad Inventory Metrics & Pricing`; L3 `Ad Market Pricing & Measurement`. **Type:**
quantified · cross-era · a mechanism that recurs · sharp barrier-to-entry contrast.

- `e5-pricing-004` (A, ci80 [0.22,0.24]): Overture ran a **pure first-price auction**, $0.05 min bid,
  **$0.23/click (Q4 2001)**, every listing human-reviewed.
- `e6-pricing-005` (A): entry cost diverged in 2002 — **Overture: 10¢ min bid + $20/mo minimum + human
  review; AdWords Select: $5 one-time, no minimum, automated.**
- `mech-first_price-001` (B): Google Ad Manager (display, not search) **reverted to a unified
  first-price auction on 5 Sept 2019** under header-bidding pressure.

**Causal grade:** L1 — filings plus Google's own posts. **ABT:**
- **AND:** Ad prices were set for a century by ABC-certified circulation on a rate card. Buyers accepted
  list prices.
- **BUT:** the auction turned price into a real-time bid — and the mechanism kept flipping (first-price
  → GSP → first-price again by 2019).
- **THEREFORE:** price-discovery, not the medium, is the thing that actually changed.

**Form:** EXPLANATORY, linear (mechanism evolution). Overlaps Thread 3 on the auction; distinct axis
(price-setting vs. the take).

### Thread 8 — Direct mail: the second-biggest medium the totals write out
**Anchor:** L3 `US Mail Advertising Metrics`; L3 `Ad Spend Metrics Suite` / L2 `advertising medium`;
L1 hub `Direct mail (medium)` (degree 63). **Type:** opposed (definitional) · cross-era · frame-lock
content.

- `e2-medium-004` (B, ci80 [13,16]): direct mail took **14.5% of US ad spend in 1949**, was the
  **second-largest named medium** most years (peak 16.8% in 1938) — yet is the graph's **most-excluded
  node**: `EXCLUDES` edges from "national brand" (`e2-scale-010`), "total US advertising spend"
  (`e7-scale-006/008/009`), "media-owner revenue" (`e7-scale-001`), and Coen's National geography
  (`e5-buyers-010`).

**Causal grade:** L1 — the exclusions are definitional boundaries the compilers state. **ABT:**
- **AND:** Direct mail was the second-largest US advertising medium for decades. It still moves tens of
  billions.
- **BUT:** nearly every headline "US ad market" total quietly excludes it.
- **THEREFORE:** the market's most-cited number has a channel-sized hole. Every share statistic inherits
  it.

**Form:** EXPLANATORY, a definitional-boundary thread; also the strongest single piece of frame-lock
evidence for Thread 1.

---

## Form-triage read for the corpus (provisional)

- **Protagonist is a SYSTEM**, not a person — the US advertising **measurement + pricing regime**. Any
  arc must go through `systemic-protagonist` (POSIWID: the regime reliably converts *contested audience
  attention* into *a citable dollar number whose basis is never the same twice*).
- **Dominant available form: EXPLANATORY**, with the strongest single spine being **"who counts the
  audience, and who owns the number"** (Threads 4 + 1, with 6 and 8 as its wired correctives). A
  **braided/gathering** form across Threads 1–8 sharing the verb *"counts / prices the market"* is the
  honest runner-up.
- **The two near-STORY threads** are the middleman's cut (2+3) and the measurement currency (4), both
  with system protagonists and clean rise→peak→shift ABTs.
- **Refusal held where due:** no thread is upgraded past its evidence; the `NOT_CAUSED_BY` and
  `CONFLICTS_WITH` edges are treated as guards, not obstacles. "Digital ate media" is explicitly
  **not** a supported spine.

## Cross-thread structure (for the scene writer / next pass)
- **Merge 2+3** → one 180-year "middleman's cut" spine (commission → auction take → programmatic loss).
- **Merge 3+7** share the auction; keep distinct axes (the *take* vs the *price-setting mechanism*).
- **Threads 6 + 8** are the corpus's built-in **BUTs** — best deployed as correctives inside a larger
  measurement/pricing spine, not as standalone pieces.
- **Thread 1 is the meta-frame**: every other thread's numbers are basis-dependent, and Thread 1 is why.
