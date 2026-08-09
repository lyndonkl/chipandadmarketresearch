# Deep-5 — "The neutral auction was a governed price"

Narrative-architect deep dig on THREAD #5. Graph-only; every finding traces L3→L2→L1→L0 to a
sourced claim with grade preserved. No prose article — this is a blueprint. `claim.py` verbs are
"sourced" not "verified": **this ledger records provenance. No claim in it has been verified.
Human verification status: none.**

Anchors walked: L3 *Ad Impression Measurement* / *Ad Market Pricing & Measurement* →
`tu:era:7:field:PRICING`, `tu:era:7:event:4`, `tu:era:6:boundary`, `tu:era:5:event:2` →
L0 claims below. Load-bearing actor confirmed by hub query: **Google, L1 LIFTED degree 183**
(next: Direct mail 63, **Overture 60** — the antecedent/opponent).

---

## The two-phase wall

**Starting hypothesis (dated 2026-08-08, from picks brief #5, written before the drill):**
> "The 'open' second-price auction died three times over, and a court found the seller was turning
> the knobs." Outcome = the 2024 Mehta findings of fact that the seller sets the clearing price.

**Phase 1 — frozen inventory (outcome-blind typed facts).** Enumerated below WITHOUT the 2024 ending
as a selection criterion. Frozen before Phase 2.

**Phase 2 — backward derivation over the frozen inventory** follows the ledger.

---

## Frozen evidence ledger (Phase 1)

Frame lock — UNIT: one documented change to how Google's ad clearing price is set. DENOMINATOR:
price the advertiser actually pays per click/impression. WINDOW: 2000-10 (AdWords fixed-rate launch)
→ 2024-08 (Mehta FOF); justified by era boundaries `tu:era:6:boundary`/`tu:era:7:boundary`.
BOUNDARY: Google's own search + display auctions, plus Overture as the antecedent mechanism;
line drawn by me. *Rejected frame:* "all programmatic pricing" — too broad; the graph's A-grade
evidence is Google-specific (FOF), so a Google frame is where the record is load-bearing.

| # | Finding (hedge/grade preserved) | Class·Grade | Path → claim id |
|---|---|---|---|
| F1 | Overture's mechanism was a **pure first-price, pure-bid auction**: "ranked in descending order of bid price… each advertiser pays Overture the amount of its bid." Min bid $0.05/keyword; human editorial review. Realised $0.23/click Q4-2001, $0.31 in 2002 (up from $0.20 in 2001). | A (10-K) | `tu:era:5:event:2` → `e5-pricing-004`, `mech-overture-001` |
| F2 | The pure-bid auction was **not failing** when quality-weighting arrived: Overture booked **$667.7m** revenue 2002 vs Google's $439.5m total, and led paid search entering the era. | A (10-K×2) | `mech-overture-002` |
| F3 | Google's AdWords launched **23 Oct 2000 as a FIXED-RATE self-serve CPM product** ($15/$12/$10), *not* an auction. `EXCLUDES` edge: "fixed-rate self-serve" —EXCLUDES→ "auction". | B (press release) | `tu:era:6:boundary` → `e5-pricing-005` |
| F4 | **AdWords Select (20 Feb 2002) introduced quality-weighted SECOND-PRICE pricing** — ranked by "a combination of ad performance (CTR) and how much an advertiser agrees to pay," with a discounter so advertisers "**pay the lowest amount possible**." *This is the stated neutral ideal: price set just above the runner-up.* | A (press release) | `mech-adwords-001`, `e6-pricing-001` |
| F5 | **No independent audit of search click-counting existed 2002-2008**: IAB Click Measurement Guidelines not published until 2009; no MRC accreditation in period. "The seller estimated the quality weight, ran the auction, validated the click and billed against its own log." | A (IAB 2009) | `mech-audit-001` |
| F6 | Google's syndication **take rate ratcheted 9% (2002) → 24.7% peak (2006) → 21.5% (2007) → 21.3% (2008)**; "the ratchet reverses when competition for partners intensifies." | A (10-Ks) | `mech-tac-003`, `e6-pricing-003` |
| F7 | **2019: Google Ad Manager (open-web DISPLAY exchange, NOT search) moved to a unified first-price auction** (from 5 Sep 2019), folding publisher floors into unified pricing rules. Google's stated rationale: "fair and transparent marketplace"; its own testing reported "neutral to positive impact on a publisher's total revenue." Buyers responded with **bid shading**; the clearing price became "a function of the buyer's model rather than of the runner-up's bid." `EXCLUDES` edge: "Google Ad Manager" —EXCLUDES→ "search advertising". | B (Google blog) | `tu:era:7:event:4` → `mech-first_price-001` |
| F8 | **2019: rGSP (randomized generalized second-price) launched on SEARCH**, raised top-slot CPC on non-navigational queries **5.91% (PC/tablet), 4.85% (mobile)** in pre-launch tests; 40-50% stickage; 5.74% revenue gain persisted 2 months. **"Advertisers cannot opt out."** | **A** (Mehta FOF) | `tu:era:7:field:PRICING` → `mech-rgsp-001`, `e7-pricing-001` |
| F9 | **Three pricing knobs named in the Mehta FOF** — squashing (internally "**Butternut Squash**"), format pricing, rGSP — all on the search text-ads auction, all internally called "**intentional pricing**." The squashing exponent (on predicted CTR) **has never been publicly disclosed**, so its price effect "cannot be reproduced from the record." | **A** (FOF ¶¶245-255) | `mech-knobs-001` |
| F10 | **Format pricing had grown to ~20% of Google's search text-ads revenue per thousand queries** before rGSP replaced it (because rGSP "made more money"); experiments launched at ~+15% and kept ~half long-term. | **A** (FOF ¶¶245,251-254) | `mech-format_pricing-001`, `e7-pricing-002`, `e7-events-007` |
| F11 | Google **adjusted the search auction and reserve prices to hit quarterly revenue targets without disclosing** the changes to advertisers; VP ads **Jerry Dischler** testified the "tunings" raised prices "**by as much as about 5% on average**," allowing "**a 10% increase… in some instances**." | B (SEL/Bloomberg) | `tu:era:7:field:PRICING` → `mech-tuning-001`, `e7-pricing-003` |
| F12 | Downstream governed price / leakage: Google's own June-2020 disclosure — publishers keep **~69¢** of each advertiser dollar when both ends are Google (Google ~31%); DOJ alleged Google keeps **≥35¢** of every open-web display dollar, **AdX 20% take rate since 2009**. ISBA/PwC: **only 51%** of advertiser programmatic spend reached the publisher (15% "unknown delta"). ANA: **~36¢** of each DSP dollar reached a consumer. | B (mixed) | `e7-pricing-006`, `e7-pricing-004`, `e7-pricing-005` |

**Referential integrity:** every finding cites an external artefact (SEC 10-K, court FOF Doc.1033,
IAB 2009, Google blog/press, Bloomberg). No pointer resolves into this pipeline. Class-F: none.

---

## Phase 2 — form triage (six-question gate)

| # | Question | Verdict | Warrant |
|---|---|---|---|
| 1 | Single continuous entity tracked start→finish? | **YES** | Google's ad-price-setting mechanism, 2000-2024 (`Google` L1 degree 183) |
| 2 | Wants something specific, documented? | **YES** (system, revealed preference) | "intentional pricing"; tunings to hit quarterly revenue targets `mech-knobs-001`/`mech-tuning-001` |
| 3 | Dated, sourced rupture of the status quo? | **YES** | 2019 dual move: rGSP on search + unified first-price on display, both dated `mech-rgsp-001`/`mech-first_price-001` |
| 4 | Continuous action sequence, ≥3 scene-able moments? | **YES** | 2000 fixed-rate · 2002 second-price · 2006 take-rate peak · 2019 dual move · 2023 Dischler · 2024 FOF |
| 5 | Evidenced point of insight (behaviour changed after)? | **NO POINT OF INSIGHT** | The *system* did not see itself differently; an external *court* made the gap legible (Aug-2024). No post-ruling behaviour change in corpus. |
| 6 | Resolution / new stable state? | **NO** | Ongoing; remedy pending as of corpus. |

**VERDICT: EXPLANATORY NARRATIVE — Rung 2.** YES to 1-4, NO to 5 and 6. There is an action line
and no transformation. Use the action line as a spine to hang explanation on; **do not manufacture
a climax or a self-revelation.** The peak is a **LEGIBILITY** type (systemic-protagonist climax
catalogue): the stated/revealed gap becomes court-documented — not a battle won.

Because Step 3 did **not** admit a story arc, the four-corner opposition web is **skipped**; an
explanatory spine has **constraints, not corners** (see constraint inventory below).

---

## Systemic protagonist — POSIWID sheet (the auction as character)

- **Stated purpose (quoted):** "a fair and transparent marketplace"; advertisers "pay the lowest
  amount possible" `mech-adwords-001` A / `mech-first_price-001` B. The neutral second-price ideal:
  the price is set by *the runner-up's bid*, not by the seller.
- **Revealed function (the character sentence):** *This system reliably converts a seller-run,
  seller-audited auction into whichever clearing price hits the seller's revenue target.*
- **Two regimes evidenced (mandatory):**
  - **SEARCH regime** — squashing + format pricing + rGSP + undisclosed tunings, on Google's own
    inventory `mech-knobs-001` A, `mech-rgsp-001` A, `mech-tuning-001` B.
  - **DISPLAY / open-web regime** — unified first-price where price = the buyer's own shaded model,
    plus a ~31-35% take rate and leakage to 51%/36% reaching publisher/consumer
    `mech-first_price-001` B, `e7-pricing-006`/`e7-pricing-004`/`e7-pricing-005` B.
- **The gap (dramatic engine):** the price the advertiser pays is set by the seller's parameters,
  not the runner-up bid the mechanism advertises — **and the advertiser cannot opt out**
  (`mech-rgsp-001` A, verbatim).
- **Residual — outcomes the revealed function does NOT explain (mandatory, ships in the piece):**
  1. **The take-rate ratchet REVERSES under competition** (24.7%→21.3%, 2006-2008, `mech-tac-003` A).
     A pure governed-price maximizer would not have let the rate fall; *competition*, not restraint,
     moved it. The seller is not omnipotent over its own price.
  2. **The "runner-up price" was never the market's baseline.** Overture's founding mechanism was
     pure **first**-price — "pay the amount of its bid" (`e5-pricing-004` A). Google *introduced*
     second-price as its own improvement (F4), then unwound it in 2019. The neutral runner-up price
     is a Google-era artefact, not an Eden the market fell from.

**Agency ledger note:** avoid "the market decided / the auction wanted." Cash out to mechanism:
"format pricing grew to ~20% of text-ads RPM" (a price), "Dischler testified the tunings raised
prices ~5%" (a quoted human), "AdX held a 20% take rate since 2009" (an accounting fact).

---

## Constraint inventory (replaces the opposition web for an explanatory spine)

Central question the material poses: **how much may the party that runs an auction shape the
clearing price before it stops being an auction?**

| Force | Type | Documented mechanism | Grade |
|---|---|---|---|
| Seller revenue-target constraint | binding incentive (carrier: Google ads leadership) | "intentional pricing"; tunings to hit quarterly targets `mech-knobs-001`/`mech-tuning-001` | A / B |
| Buyer counter-move | market routing-around | header bidding (Prebid.js out of AppNexus) forced simultaneous bids; **bid shading** after first-price `tu:era:7:field:PRICING`/`mech-first_price-001` | B |
| Measurement vacuum | absent independent counter | no IAB/MRC search-click standard 2002-2008; seller ran+validated+billed on its own log `mech-audit-001` | A |
| External adjudication | dated rupture that made the gap legible | Mehta FOF, 5 Aug 2024, named the three knobs `mech-knobs-001` | A |

---

## Hypothesis diff (what the evidence changed)

- **BEFORE:** "the neutral second-price auction *died three times over* in 2019" — a rupture/death arc.
- **AFTER:** the evidence supports a **different and stronger reading**: the auction was
  **governance-thin from birth** (F5: 2002-2008, no external audit; the seller ran, validated and
  billed on its own log). 2019 is **not the death of neutrality** but the year the seller stopped
  even *claiming* the runner-up set the price — perforated on search (rGSP, still GSP-lineage) and
  abandoned on display (first-price, a *different market* per the `EXCLUDES` edge). The through-line
  is **"governed all along; 2019-2024 is when the governance became visible and court-graded,"**
  not "a fall from a neutral Eden."
- **What changed:** the *inciting weakness* moved from 2019 (a rupture) back to 2002-2008 (a
  structural absence of any independent counter, `mech-audit-001`, a contemporaneous source).
  Contemporaneity gate **passes**: the weakness is evidenced by an in-period source, not by 2024
  hindsight.
- **What did NOT change (worth suspecting):** Google is unambiguously the load-bearing actor
  (degree 183); the A-grade price numbers (5.91%, ~20%) are court-sourced and stand.

---

## DEAD column (ships; never deleted)

- **"The second-price auction *died*."** — `did_not_support` the clean death framing. rGSP is a
  *randomized* GSP (second-price lineage, not abolition); the display first-price move is a
  **different market** (`mech-first_price-001` `EXCLUDES` search advertising). Killed by grade-A
  distinction; keep as a hedge on any "three deaths" line.
- **"5-cent AdWords minimum bid."** — `did_not_support`. `e6-pricing-005` states this widely
  repeated figure "is not supported by either source cited here and needs its own citation."
- **CONTRADICTED-watch:** none of the corpus contradicts the governed-price finding outright; the
  residual items (take-rate reversal; first-price origin) *qualify* it and must reach the reader.

---

## Empty-slot / fallacy flags for the drafting layer

- **Retrospective-slot audit:** "three deaths" is a retrospective framing — downgrade to
  "the runner-up-sets-the-price principle was perforated on search and abandoned on display in the
  same year (2019)."
- **Grade discipline (do not upgrade):** rGSP +5.91% and format-pricing ~20% are **A** (court FOF);
  Dischler's "~5%, up to 10%" tunings and the 51%/36%/69¢ leakage figures are **B** (testimony /
  press / UK & US industry studies). The B numbers cannot carry the thesis alone.
- **Instrument/interest flag:** "neutral to positive impact on publisher revenue" is the **seller's
  own test framing** (`mech-first_price-001`, Google blog) — annotate interest in the body.
- **Strongest agency reading considered:** quality-weighting was a *genuine* product improvement
  (F4), and second-price *genuinely* lets advertisers pay below their bid; "revenue management" is
  something every marketplace does. Partially adopted — which is exactly why the residual (take-rate
  reversal) stays: this is a governed-price story, not a malign-optimizer story.
