# Thread candidates — the Gate B menu

Produced by R5 (PLAN.md §5). Internal working document, exempt from the readability gate.

Per decision #7, first-class threads were deliberately **not** chosen before research. This is the menu the human picks from at Gate B. Each selected thread becomes a synthesis chapter plus its own visual.

## How to read this

Every candidate carries four things:

1. **Arc** — the thread in one sentence across the seven eras.
2. **Evidence** — schema fields, claim IDs, per-era coverage. Holes are named, not smoothed.
3. **Visual** — what the thread's own chart or interactive would show.
4. **Strength** — how strongly the *verified* evidence carries it, not how interesting it is.

Coverage notation: `1:2A3B1C` = era 1 contributes 2 grade-A, 3 grade-B, 1 grade-C claim. `M` = mechanism.json (R4), `D` = adspend.json dataset claims.

Strength scale:

| Grade | Meaning |
|---|---|
| **A** | Every era carries graded claims, mostly A/B, on one quantity or under a stated denominator convention. The arc survives with no construction by us. |
| **A−** | As above, but one era is analogical rather than numerical, or the cross-era quantity needs a declared convention the reader must be shown. |
| **B+** | Full era coverage, but the measured quantity changes definition across eras, or the two endpoints — where the story is loudest — are grade C. |
| **B** | Full coverage, but it is a sequence of episodes rather than a series; the visual is a timeline, not a quantity. |
| **B−/C+** | Two or more eras are narrative-only or grade C with wide intervals. Sidebar or framing device, not a chapter with a signature chart. |

Ordering below is by strength, descending. Interest, novelty and redundancy with the era spine are noted separately per entry and summarised at the end.

**Verification note.** Four claims were REJECTED in R3 and rewritten in place at the same IDs: `ds-total-001`, `ds-gdp-001` (both ad/GDP peak claims — the capture thread), `e2-creators-001`, `e7-medium-003`. All four are usable in their corrected form. The 2 rejections inside the capture thread are the reason it grades lower than its importance.

---

## 1. Who counted, and who paid the counter — **A**

**Arc.** Every pricing regime in this market was created by a measurement regime, and the market's discipline was always that somebody *other than the seller* did the counting — a rule that held from 1914 to about 1996 and then broke completely.

**Evidence.** MEASUREMENT field, all seven eras, plus `mech-audit-001`.
`1:1A3B0C  2:0A10B0C  3:0A5B0C  4:0A6B0C  5:2A4B0C  6:2A4B1C  7:0A5B0C  M:1A0B0C`
- e1: `e1-measurement-001..004` — publisher self-report; Rowell's directory (1869); ABC 1914, tripartite-funded, the world's first third-party media audit.
- e2: `e2-measurement-001..009`, `e2-events-002` — CAB 1930 funded by *advertisers* at $70/month ($33,045 first year); Hooper 1934 funded by *magazine publishers* who thought radio was overstated, and whose numbers ran ~20% above CAB's; the 31%-of-households telephone bias; the CAB's death in 1946 when the funders changed.
- e3: `e3-measurement-001..005` — Nielsen buys Hooper (1950), one vendor selling to both sides; 1,200 metered homes pricing the whole national market; the Harris hearings produce the industry-funded Broadcast Rating Council (1964).
- e4: `e4-measurement-001..005`, `e4-events-003` — the people-meter switchover, 1987.
- e5: `e5-measurement-001..006` — DART's log is the invoice (621bn ads served); FAST 1998, 16% of marketers satisfied; CTR falls to 0.3%.
- e6: `e6-measurement-001..006`, `mech-audit-001`, `e6-events-007` — the seller estimates the quality weight, runs the auction, validates the click and bills its own log; no click standard until 2009; the click-fraud auditor is commissioned by the defendant.
- e7: `e7-measurement-001..005` — Facebook's video metric; the MRC pulls Nielsen's accreditation for 19 months; bots >50% of web traffic; nobody audits.

**Why it is the strongest.** It contains two clean natural experiments where the *instrument* changed and the *price* moved with nothing else changing: 1987 people meters (measured prime-time audience −10% overnight, CBS and ABC −13% each, make-goods owed in scatter worth more than the upfront sold) and 2021 Nielsen (a 2–6% undercount the VAB valued at ≥$468M of lost national ad revenue). One grade-C claim in 44 (`e6-measurement-002`, click-fraud rate, CI 3–20%).

**Visual.** A two-track timeline: the counting institution on top, its funder underneath, colour-coded by who paid (publisher / advertiser / rival medium / vendor / industry / seller / nobody). Annotated with the two price shocks. The 1987 shock is the interactive moment — same viewing, two instruments, two prices.

**Strength: A.** Full coverage, near-uniform B with A anchors, one common question ("who paid the counter?") that every era answers with a name and a number. Chapter 1 already states this as the project's through-line, so a thread chapter deepens the spine rather than duplicating it.

---

## 2. The intermediary's cut — **A−**

**Arc.** The middleman's take started as a visible, disclosed, cartel-fixed 15% and ended as an invisible, variable, undisclosed share that nobody — including the buyer, the seller, and two national advertiser associations — can measure.

**Evidence.** PRICING + SELLERS + CREATORS across all seven eras, plus the R4 TAC series.
`1:0A3B0C  2:4A0B1C  3:0A2B1C  4:2A1B1C  5:5A0B0C  6:2A1B0C  7:1A4B0C  M:4A0B0C`
- e1: `e1-pricing-001` (10–50% before standardisation), `-002` (15% by the early 1890s), `-004` (15%/85% split).
- e2: `e2-sellers-002` (A: NBC/CBS retain 73% of network net time sales, affiliates get 27%), `e2-sellers-007` (A: affiliate share 20.5% → 28.5%), `e2-pricing-006/007` (A: Mutual's 3.5%; the NBC step formula), `e2-sellers-005` (C: the $100 decomposition — agency $15, network $62, stations $23).
- e3: `e3-pricing-001` (15%), `-002` (the forgotten extra 2% cash discount), `-003` (C: station reps at 5–20%).
- e4: `e4-pricing-001` (**A, Economic Census**: commissions *actually received* were 14.13/13.92/14.16/13.18% in 1977/82/87/92, then 10.98% in 1997 — the received story that the commission died in the 1980s is wrong), `e4-creators-006` (A), `e4-pricing-006` (postage is only 36% of the "direct mail" line).
- e5: `e5-creators-002/003` (A), `e5-sellers-004` (A: DoubleClick's network gross margin 25–40%), `e5-sellers-005`/`e5-pricing-006` (A: Overture pays 56% of revenue as TAC).
- e6: `e6-pricing-003/004`, `mech-tac-001..004` (all A) — Google's take on syndicated inventory 9% (2002) → 24.7% (2006) → 21.3% (2008); the owned-vs-syndicated retention gap of 4.5x in 2008, 11x in 2002.
- e7: `e7-pricing-004` (ISBA/PwC: 51% reaches the publisher, 15% unattributable), `-005` (ANA: ~36 cents of a DSP dollar reaches a consumer), `-006` (Google says publishers keep 69 cents; DOJ says Google keeps ≥35 cents; AdX at 20% since 2009), `e7-sellers-006` (A: TAC 20.3% of ad revenue).

**Hole to state.** These are not one quantity. Denominators differ: % of gross billings, % of net time sales retained, gross margin, % of network revenue, % of an end-to-end chain. `e1-pricing-004` was adjusted in R3 precisely because the "only intermediary cut" clause was unsupported — national special representatives' rate is unknown, so era 1's stack is incomplete. Era 3's rep-firm rate is a published range with no typical value (C).

**Visual.** A stacked "where each advertiser dollar goes" bar, one per era, under a declared convention (share of the advertiser's gross outlay). The last bar is deliberately broken: era 7's stack cannot be closed — the ISBA 15% unknown delta gets its own hatched block.

**Strength: A−.** 18 of 32 claims are grade A, every era carries at least one graded number, and the ending is genuinely earned: the only era in which the cut cannot be stated is the one with the most measurement.

---

## 3. Who was allowed to buy — the self-serve buyer *(not anticipated by the plan)* — **A−**

**Arc.** A buyer class that walked into a newspaper office, paid by the line, used no agency and paid no commission has existed since the 1840s; every era kept it in a ghetto called classified, and era 6 turned it into the market.

**Evidence.** BUYERS + SCALE money-type + PRICING entry gates, all seven eras.
`1:0A1B2C  2:0A0B2C  3:0A2B1C  4:0A4B0C  5:3A1B0C  6:2A1B1C  7:0A1B3C`
- e1: `e1-buyers-007` (classified ~12–13% of newspaper receipts, 1914), `e1-scale-013` (~3% of total outlay), `e1-targeting-002` (3M addressed catalogues a year). Era 1's boundary note names this explicitly as "the buyer class AdWords re-created".
- e2: `e2-buyers-006`, `e2-scale-012` (~18% of newspaper revenue, 1949; not separately reported anywhere before 1950).
- e3: `e3-buyers-005` (classified spend 5.7x, $377M → $2,159M), `e3-buyers-008`, `e3-scale-010`.
- e4: `e4-buyers-006`/`e4-scale-009` (B after R3 upgrade: $11,157M, 7.9% of all measured US spend), `e4-sellers-004`/`e4-medium-005` (Yellow Pages $9.5B, 87% local, sold door-to-door on annual contracts — self-serve's second channel).
- e5: `e5-buyers-001` (**A**: Yahoo, the biggest seller on the web, had 3,800 advertising customers *in total* in 1998), `e5-buyers-002` (A: Overture 53,000 with a $25–50 deposit and $20/month minimum), `e5-buyers-003`, `e5-pricing-004` (A).
- e6: `e6-buyers-001` (A: Overture 80,000), `e6-pricing-005` (**A**: the gates, side by side — Overture's 10c minimum bid + $20 monthly minimum + human editorial review against AdWords' one-off $5 activation, no monthly minimum, automated approval), `e6-creators-003` (95 characters, zero creative cost), `e6-buyers-002` (C, CI 550k–2.6M).
- e7: `e7-buyers-001` (>10M Meta advertisers, >2M US monthly), `-003` (C), `-007`, `e7-scale-008`.

**Hole to state.** Two different measures are being welded: a *dollar share* (eras 1–4, from classified and directory lines) and a *head count* (eras 5–7). No advertiser count exists before era 5. Google's own count is grade C with a 5x interval and Meta's is a company statement. So the arc is honest on money for 1–4 and honest on bodies for 5–7, and the two halves must not be plotted as one line.

**Why it earns its place.** It reframes the project's central question. The mechanism story says Google changed the *rule*; this thread says the decisive change was the *gate* — and `e6-pricing-005` is an A-grade, apples-to-apples comparison of two gates in the same year, which is the cleanest causal exhibit in the whole record for the long-tail explosion.

**Visual.** Two panels that must not be joined. Left: the classified/directory dollar share, era 1 → era 4, sitting stubbornly around 3–13% of the market. Right: the advertiser head count, 3,800 → 53,000 → 80,000 → ~1M → >10M, on a log axis with the C-grade intervals drawn as bands. Between them, the gate card: deposit, minimum, review, approval time, per era.

**Strength: A−.** Full seven-era coverage, A-grade at the hinge, but the endpoint counts are the weakest numbers and the two halves measure different things.

---

## 4. Who set the price — **A−** *(but see redundancy note)*

**Arc.** For 150 years the seller posted the price, for about seven years the buyer bid it, and then the seller took it back — not by abolishing the auction but by tuning it.

**Evidence.** PRICING, all seven eras, plus the R4 auction engine.
`1:0A3B0C  2:4A1B1C  3:0A3B2C  4:1A1B1C  5:1A2B1C  6:3A0B1C  7:4A1B0C  M:6A3B0C`
- e1–e2: rate card, unenforceable then enforceable; `e2-pricing-002..005` (all A: $2,600/hour, the $125–$1,250 station card, the exact daypart ratios, volume discounts to 25%).
- e3: `e3-pricing-004..008` — CPM and the upfront; the price becomes a rate per thousand against Nielsen.
- e4: `e4-pricing-001/003/005` — two regimes side by side, neither an auction.
- e5: `e5-pricing-001/003` (CPM ported from print, card $25–35 against ~$7 realised), `-004` (**A**: GoTo's pure-bid, pay-your-bid auction — the one moment the buyer sets the price), `-005` (AdWords launches as a fixed CPM).
- e6: `mech-adwords-001`, `mech-discounter-001`, `e6-pricing-002` (all A) — rank by bid × CTR, pay one cent above the next bid; `mech-quality_score-001` — from Aug 2005 the seller sets a per-keyword floor.
- e7: `e7-pricing-001/002` (**A**, from the trial record: rGSP +5.91% top-slot CPC on PC, +4.85% mobile; format pricing ~20% of text-ads RPM), `mech-knobs-001` (A), `mech-mehta-004` (A: Google repeatedly tested a 5%+ text-ad price rise and "it can"), `mech-tuning-001`, `mech-first_price-001`.

**R4 findings that make this a chapter rather than a recap.**
- `f13` — continuity. The seller has posted prices on the long tail since Aug 2005, not since 2019. On a one-bidder query the reserve *is* the price, so $0.01 → $1.00 is a 100x revenue change with nothing visible changing.
- `f12` — GSP already under-determines revenue by 73%. The knobs move the market inside a band the mechanism left open.
- `f10` — display went first-price; search never did. The most common factual error in retellings.
- `f3` — quality weighting *lowered* average price per click by 42% and raised revenue by volume. Every account that says it let Google charge more has the sign backwards.

**Redundancy note.** The seven eras are *cut* at changes in who set the price. Chosen as a thread, this is the spine restated, and its best material already sits in chapters 7, 8 and 10. It is strongest as a closing argument, weakest as an eighth chapter.

**Visual.** A single axis — "who computes the number the buyer pays" — running seller / buyer / seller-with-a-buyer-shaped-input, with the seven-year buyer window (1998–2005) drawn to scale against 180 years. The simulator already spec'd in `simulator-params.json` is this thread's interactive.

**Strength: A−** on evidence, discounted by redundancy with the era spine.

---

## 5. The rent on the front door *(not anticipated by the plan)* — **A−**

**Arc.** In every era someone owned the point where attention started — the mail, the affiliate transmitter, the local station, the browser's search box, the phone — and the seller of advertising paid them rent; the instrument barely changed in a hundred years, and by 2021 it was the single largest expense in search.

**Evidence.** SELLERS + PRICING + the whole R4 distribution engine.
`1:0A2B0C  2:4A0B0C  3:1A0B1C  4:1A1B0C  5:2A0B1C  6:1A1B0C  7:1A0B0C  M:17A5B1C`
- e1: `e1-medium-003`, `e1-targeting-003` — subsidised third-class postage and Parcel Post as the state-owned front door under mail order.
- e2: `e2-sellers-002/007`, `e2-pricing-006/007` (all A) — affiliate compensation is the first revenue-share distribution deal: 27% of network net time sales, on a step formula, with Mutual taking 3.5%.
- e3: `e3-pricing-003` (C: station reps 5–20%), `e3-sellers-002` (A: the FCC's seven-station cap is why affiliates had bargaining power).
- e4: `e4-sellers-005` (**A**: USPS collected $9,817M of third-class revenue in FY1993 — the state was the distribution monopoly under the country's third-largest medium), `e4-sellers-004`.
- e5: `e5-pricing-008` (Netscape Premier Provider slots), `e5-sellers-005`/`e5-pricing-006` (A: Overture pays 56% of revenue as TAC; >95% of traffic from affiliates).
- e6: `mech-aol-001..007`, `mech-ovt-001..003`, `mech-tac-001/002`, `mech-network-001/003` — the May 2002 AOL flip (~$100M guarantee, ~85% share, grade B and unfalsifiable per break B2); AOL = 15–16% of Google's total revenue; Google pays out 91% of network revenue in 2002 against Overture's 58%.
- e7: `mech-default-001..005`, `mech-mehta-001..003/005` (mostly A) — $26.3B of default revenue share in 2021, more than the entire cost of operating search; $20B to Apple in 2022 at a 36% Safari rate; contracts covering ~50% of US general search queries; the 2025 remedy bars exclusivity and preserves the payment.

**R4 findings this thread owns.**
- The twin-engine coupling. The maximum feasible distribution bid *is* the yield net of serving cost, so the higher-RPM bidder wins the default by construction. The 33-point payout gap between Google and Overture in 2002 is the observable signature.
- Break B3 — equity is the expensive leg nobody counts. The warrant carried at $13.9M realised ~$1,134.6M, 11.3x the cash guarantee.
- Break B6 — syndication manufactures your future competitor. Overture took ~60% of revenue from Microsoft and Yahoo; one of them bought it.
- Break B9 — the famous "48.7% of revenue from the network" is 9.4% net of TAC.

**Hole to state.** Eras 1, 3 and 4 are structural analogies with one or two numbers each; the numerical spine runs era 2 and eras 5–7. The 2002 AOL terms are grade B and cannot be verified — the contract was never filed.

**Visual.** One instrument, seven instances: a small-multiple of "what the seller paid the front-door owner", each panel showing the payout as a share of the revenue it generated (27% → 5–20% → 56% → 85% → 36%), with the absolute dollar figure on a second axis so the $26.3B swamps everything. The AOL warrant gets its own inset — cost at signature vs cost realised.

**Strength: A−.** 27 of 39 claims grade A, adversarially built from primary filings and a trial record, but the front half of the century is analogical rather than measured.

---

## 6. The spend and medium shift — **B+** *(A− to 2007, B− after)*

**Arc.** New media enter small, take decades, and rarely dethrone anything — newspapers led for seventy-three straight years, radio never led at all, and the largest single US medium in 2001 was direct mail.

**Evidence.** MEDIUM + SCALE, all seven eras, plus the entire 1,573-point dataset.
`1:2A2B1C  2:0A6B1C  3:0A10B1C  4:1A6B0C  5:0A5B1C  6:4A2B0C  7:3A1B2C  D:0A4B3C`
Highest-value counterintuitive results:
- `e2-medium-001/002` — newspapers led every year 1919–1949. Radio peaked at 14.9% in 1945.
- `e3-medium-005/006/007/008` — newspapers still #1 in 1975. Direct mail was the largest *national* medium. TV passed radio and magazines in 1954, newspapers only in 1992.
- `e4-medium-002/005` — TV plus cable passes newspapers in 1992. Yellow Pages out-earns radio and magazines.
- `e5-medium-002/004` — direct mail passes newspapers in 2001. The internet is 2.6–3.7% of spend at its 2000 peak.
- `e6-medium-001` — direct mail is the largest Coen line through 2007.
- `e7-medium-001/002/006`.

**Holes to state — all three already documented.**
- No annual series before 1919 at all; benchmark years only (`benchmarks_pre1919`).
- Three definitional seams: `ds-seam-001` (Billboards → Out of Home at 2.77x on identical 1999 data), `ds-seam-002` (Coen's internet line is 49.7% of IAB's in 2007), `ds-total-002` (Coen ends 2007 with no successor on its basis) plus `ds-bridge-001/002` (the C-grade Coen→MAGNA bridge resting on one overlap year).
- `ds-gap-001`: **no free by-medium US series exists for 2011–2025.** The dataset holds a full annual by-medium partition 1935–2007 and, after that, an internet total (IAB, 1996–2025) plus a single 2025 format split. The last fifteen years — the ones readers care most about — are the thinnest in the window.

**Visual.** This is the project's signature chart and it is already committed (decision #6, §8): layered ribbons with visible seams, benchmark markers for pre-1919, and a hard visual break at 2007/2008.

**Strength: B+.** The evidence is the richest in the project and mostly B-grade, but the chart's last quarter cannot be drawn honestly at by-medium resolution — and this is already the experience's base layer, so choosing it as a *thread* buys a chapter about a chart that will exist anyway.

---

## 7. The money-type migration — **B+**

**Arc.** Sorted by *why* the money was spent rather than *where* it ran, the market moved from reach to response: brand money went from the largest pool to the smallest, and response money roughly doubled its share.

**Evidence.** The schema forces `by_money_type` in BUYERS and SCALE for every era, so coverage is 7/7 by construction.
`1:0A3B5C  2:0A3B5C  3:0A3B5C  4:0A6B2C  5:0A0B8C  6:3A4B1C  7:0A1B7C  D:0A2B1C`
Benchmark rows: 1914 ≈ 22/23/3/24; 1949 ≈ 43/36/6.5/14.5; 1975 ≈ 39.7/37.8/7.7/14.8; 2000 = 41.9/30.8/8.2/19.2; 2025 ≈ 23/41/4/32. Anchor claims: `ds-money_type-003` (the intent-and-response pool the auction actually competed for was $77.4bn in 2000, 31.3% of all US advertising, against $6.5bn for the whole internet), `e6-scale-010` (that pool was ~$99bn, ~34%, in 2007), `e6-buyers-008` (A: 57% of internet revenue bought on performance by 2008), `e6-buyers-007` (A: classified $15.9bn → $10.0bn inside era 6).

**Holes to state — and they are at both ends.**
- Era 1's four shares are all C and sum to **72%, not 100%** — the pre-1919 total is a broad outlay measure of which print was only ~21% (`e1-medium-005`).
- Era 5 is 8 claims, **all grade C**.
- Era 7's four shares are all C with overlapping intervals (national brand 17–38%, local/retail 33–46%, direct response 23–41%) — the middle two pools **cannot be ranked** on this evidence.
- The underlying dataset supports only a two-way national/local split (Coen, 1935–2007) and a classified line (NAA, 1950–2010). The four-way split is our construction in every single era. No compiler publishes it.

**Visual.** A four-band ribbon, but honestly: solid bands only for 1935–2007 where the two-way split is sourced, hatched bands with visible interval envelopes at 1914 and 2025, and the 1914 band explicitly not summing to the frame. The intervals *are* the chart, not decoration.

**Strength: B+.** This is the project's central analytical claim and the direction is robust across every reading. But the two endpoints — where the story is loudest — are the weakest numbers in the entire record, and chapter 9 already says so. Selecting it means committing to a visual whose main job is showing uncertainty.

---

## 8. Capture vs expansion vs reallocation — **B+**

**Arc.** Advertising's share of the US economy peaked in the 1920s, peaked again in 2000, and fell through the whole digital era — so the money moved sideways into a different kind of buying rather than being captured wholesale or conjured from nothing.

**Evidence.** Already drafted as chapter 9. `1:0A0B1C  2:0A3B0C  3:0A2B0C  4:0A2B0C  5:0A2B0C  6:0A1B2C  7:0A1B1C  M:2A0B1C  D:0A6B6C`
The ad/GDP rail: `e2-scale-004` (3.0% in 1922, the whole series maximum), `e5-scale-004` (2.3–2.5% in 2000), `e6-scale-003` (2.0% in 2007), `e7-scale-002` (~1.32% in 2025, C).

Read against four correctives:
- `ds-bridge-001/002` — the basis change alone is worth 17.4% of level.
- `ds-crosscheck-001` — the IRS rail runs 31% above media-owner revenue by 2022, and the gap is widening.
- `e4-buyers-004` — trade promotion took 44.9% of packaged-goods budgets by 1992 and never appeared in the ad total.
- `mech-capture-001..003` — the R4 decomposition of Google's own growth.

**Holes to state.** Both headline dataset claims for this thread — `ds-total-001` and `ds-gdp-001` — were **rejected in R3** and rewritten; the corrected finding (1922, not 2000, is the maximum; "advertising is a constant 2% of GDP" is an artefact of quoting the post-1960 window only) is the thread's best result but it arrived by correction. The 2007→2025 comparison crosses three bases and depends on a C-grade bridge resting on one overlap year. `mech-capture-002` is C and inherits two C-grade query denominators.

**Visual.** Never one line. A ribbon per basis (pre-1919 benchmarks / Coen billings / media-owner revenue / IRS deduction) with the bases as distinct visual materials, the bridge drawn as an explicit vertical offset with its own interval, and the three readings — capture, expansion, reallocation — selectable as overlays that light up the evidence each one rests on.

**Strength: B+.** The most important question in the project and the most honestly contested; the evidence is deliberately B/C because the truth is B/C. It is already a chapter, so selecting it means promoting it to a signature visual rather than writing new prose.

---

## 9. Targeting precision — **B+**

**Arc.** Precision did not climb steadily to the individual — a mailer could address one named household out of 71 million in 1975, better than anything television could sell, and era 7 then *lost* individual signal and replaced advertiser choice with the seller's model.

**Evidence.** TARGETING field, all seven eras.
`1:0A3B0C  2:0A4B1C  3:2A1B2C  4:1A4B0C  5:1A3B1C  6:2A3B0C  7:0A5B0C`
- The non-monotone hinge: `e3-targeting-005` (**A**: 71.1 million individually addressable US households in 1975, "roughly 279,000 times finer than the average unit spot television could sell") against `e3-targeting-003` (C: ~2,600 purchasable broadcast segments, CI 1,500–4,500).
- The waste ceiling that never moved as far as the story says: `e4-targeting-004` (a 2% response was the working definition of a *successful* campaign — 98 misses in 100), `e5-measurement-001` (CTR 0.3% by 2000), `e7-pricing-005` (~36 cents of a DSP dollar reaches a consumer; MFA sites absorb ~15%).
- The reversal: `e7-targeting-001/002` (ATT costs Meta ~$10bn in 2022; opt-in 16% → ~25%), `-003` (GDPR effects modest and contested: −2.1% CTR / −5.7% revenue per click in one study, ~−10% in another), `-005` (Advantage+ at a ~$60bn run rate), `e7-buyers-003` (PMax at ~71% of surveyed advertisers, C).

**Hole to state.** There is no common unit. Titles, dayparts × markets × age-sex cells, ZIP clusters, cookie reach, the query, the model. A single rising "precision" curve would be exactly the manufactured continuity that decision #6 forbids for spend. Era 5's network-reach figure (`e5-targeting-002`) is company-claimed and grade C.

**Visual.** A ladder, not a curve: seven rungs, each labelled with the *unit* a buyer could actually purchase and how many of them existed, with the direct-mail rung deliberately drawn far below (finer than) the broadcast rungs above it to break the expected monotone. A second, small panel tracks the only comparable quantity across time — the share of the money that reached nobody.

**Strength: B+.** Full coverage, good grades, a genuinely counterintuitive A-grade hinge — but the thread's headline quantity does not exist, and the chapter must say so in its first paragraph.

---

## 10. How concentrated the sell side was *(not anticipated by the plan)* — **B+**

**Arc.** The sellers of attention went from 22,754 independent publishers to two radio networks to three television networks, fragmented once (cable), and then re-concentrated harder than ever — 84.1% of US internet ad revenue in the top ten.

**Evidence.** SELLERS field, all seven eras.
`1:2A0B1C  2:2A1B2C  3:0A2B1C  4:0A3B0C  5:0A2B0C  6:1A1B0C  7:2A1B0C`
- `e1-sellers-001` — A: 22,754 publications, 1914.
- `e2-sellers-001` — A: NBC and CBS take 44% of industry net time sales, plus 7% from owned stations, 1938.
- `e3-sellers-001/004` — three networks; 176 groups own 59% of dailies.
- `e4-sellers-001/002` — the fragmentation. Prime-time share 90% → 61–70%; 28 → 79 cable networks.
- `e5-sellers-001` — top 10 web sellers 71% → 77%.
- `e6-sellers-005/006` — A: top 10 take 72% in Q4 2008; Google 63.5% of core searches.
- `e7-sellers-001/004/005` — A: top 10 take 84.1% in 2025; Google 89.2% of US queries in 2020.

**Hole to state.** Five incompatible universes: all publications, broadcast net-time sales, TV advertising, internet ad revenue, digital ad spend, search queries. A single concentration line across 1914–2025 would be fabricated. `e4-sellers-001` carries two sources that disagree by nine points and the interval spans both rather than resolving them.

**Visual.** Seven separate concentration panels, each labelled with its own universe and its own denominator, arranged so the *shape* (many → few → many → very few) reads across without implying one series. Era 4's fragmentation is the panel that makes the point.

**Strength: B+.** Strong A-grade anchors at 1914, 1938, 2008 and 2025 and a non-trivial shape, held back by denominators that cannot be reconciled.

---

## 11. Who composed the ad *(not anticipated by the plan)* — **B**

**Arc.** The person who made the advertisement worked for the seller, then switched to the buyer in 1875, built the buyer an entire production company, was reduced to a 95-character form, and by 2026 works for the seller again — as the seller's own model.

**Evidence.** CREATORS field, all seven eras.
`1:0A3B2C  2:0A2B2C  3:1A3B1C  4:6A3B0C  5:2A3B0C  6:2A2B0C  7:1A3B0C`
The spine is era 4's Economic Census run (`e4-creators-001..006`, all **A**: 8,089 → 13,879 establishments, $15.5B → $69.6B billings, $3.17B → $13.6B income, commissions falling from 61.3% to 54.2% of agency income). Bookends: `e1-creators-001` (the agent is paid *by the publisher*), the 1875 open contract, `e2-creators-002` (the 15% covered writing the show — the FCC's 1941 finding that the agency, not the network, decided what programmes contained), `e6-creators-003` (95 characters, automated approval, effectively zero creative cost), `e7-creators-002/004` (82% of ANA members run an in-house agency; >1M advertisers made >15M AI-generated ads in a single month).

**Hole to state.** Four different measures across the arc — commission rates, establishment counts, agency income share, AI ad volumes — and no continuous series of "who made the ad". `e2-creators-001` was the one R3 *rejection* in this thread (the "half the top ten programmes" statistic was untraceable) and now rests on a smaller sourced datum.

**Visual.** A single question — "who employs the composer?" — as a seven-step flip: seller / buyer's agent / buyer's production company / buyer's agent / interactive shop / the buyer themselves / the seller's model. Era 4's A-grade census run underneath as the only quantitative panel.

**Strength: B.** Honest full coverage with one A-grade era, but it is a sequence of institutional facts rather than a measured series, and the closing exhibit (AI-generated ads) is a vendor statement.

---

## 12. The law wrote the mechanism *(not anticipated by the plan)* — **B**

**Arc.** Three times the state directly changed who could sell attention and at what price, and then in the 2010s the biggest rule changes stopped being laws at all — a phone maker's product setting cost more than every privacy statute combined.

**Evidence.** EVENTS across all seven eras, plus the R4 Mehta findings.
`1:0A1B0C  2:0A1B2C  3:1A2B1C  4:0A1B0C  5:0A1B0C  6:0A3B0C  7:2A4B0C  M:4A1B0C`
- `e1-events-004` (Printers' Ink model statute in 22 states by 1921; the Newspaper Publicity Act conditions cheap postage on sworn circulation).
- `e2-events-006` (antitrust, not technology, created the third network: NBC Blue sold for $8M), `e2-events-005` (the Revenue Act of 1942 made a deductible ad cost a profitable firm ~20 cents on the dollar — national advertising's share rose from 51.7% to 61.3%).
- `e3-events-001` (**the counter-example**: the 1956 consent decree covered only 21% of US spend and the 15% price survived it by decades), `e3-events-002` (the cigarette ban removed 4.6% of broadcast spend and produced the era's only TV down year), `e3-events-003` (A: PTAR cut network supply and the 30-second spot became standard in the same season).
- `e4-events-001` (the 1984 AT&T divestiture manufactured a $9.5B Yellow Pages industry out of a monopoly by-product).
- e5: the FTC/EPIC intervention that killed the DoubleClick–Abacus merge before identity-resolved targeting shipped — narrative in the record, with only `e5-targeting-001` (Abacus covered ~90% of US households) carrying a number. **This is the thread's thinnest era.**
- `e6-targeting-002` (GEICO 2004: trademarks become auctionable inventory), `e6-events-007`.
- `e7-targeting-001/002/003` (ATT — a platform rule, not a law — cost Meta ~$10bn while GDPR's measured effects were 2–10%), `mech-mehta-001..005` (A: contracts covering ~50% of US queries; the 2025 remedy bars exclusivity and preserves the payment).

**Hole to state.** Every counterfactual here is unmeasured. We can date the rule and size the money that moved; we cannot say what would have happened otherwise. Era 5 has no calibrated regulatory claim.

**Visual.** A timeline with two rails — public law above, private rule below — where the lower rail is empty until 2021 and then carries the largest effects on the chart.

**Strength: B.** Good coverage and a genuinely novel closing claim, but it is a sequence of episodes; its visual is a timeline rather than a quantity, which makes it a weaker signature deliverable than the threads above.

---

## 13. Who pays for the free thing *(not anticipated by the plan)* — **B−**

**Arc.** In 1833 a newspaper sold below cost and told its readers so, and every ad-funded free service since has been a rerun of that trade — until 2023, when for the first time the marginal cost of answering the user became comparable to the advertising revenue the answer earns.

**Evidence.** `1:1A3B1C  2:0A1B0C  3:0A1B0C  4:1A0B0C  5:0A0B3C  6:0A0B3C  7:1A1B6C`
- `e1-events-001` (the New York Sun at a penny, ~15,000 copies a day), `e1-sellers-003` (**A**: advertising supplied 64.9% of newspaper gross income in 1914) against `e1-sellers-004` (~44% in 1879) — the only place in the record where the subsidy share is actually measured.
- `e4-sellers-003` (**A**, the counter-example: advertising was only 9.8% of cable industry revenue in 1993, subscription 50.6% — the subsidy ran backwards for a whole era).
- `e5-unit_econ-001..003`, `e6-unit_econ-001..003` (all C): ~$7 effective revenue per thousand impressions against ~$0.90 to serve; 2.6c of revenue per query against 0.35c of cost.
- `e7-unit_econ-004..007` (all C): the inference cost of one GPT-4-class answer, 4.8c (2023) → 0.033c (2024) → 0.022c (2025) → flat at 0.022c (2026), against ~3.7c of ad revenue per Google query — plus `e7-measurement-004` (users click a result on 8% of AI-summary visits against 15% without).

**Hole to state.** Only era 1 has a real subsidy-share measure. Eras 2, 3 and 5 are one claim each. The era-7 inference series is entirely grade C and one interval spans 38x (`e7-unit_econ-005`, 0.00025–0.0095). Five of the seven rungs are analogies.

**Visual.** The 1833 trade drawn once, then instantiated seven times — cost of the free thing, share paid by advertising — with era 4's inversion breaking the pattern and era 7's two curves (cost per answer falling, revenue per query flat) crossing.

**Strength: B−.** Superb framing device with a real 2026 punchline, thin as a measured thread. Best used as the thesis chapter's opening and the handoff chapter's close rather than as a standalone chapter with a chart.

---

## 14. The unit economics of attention — **C+ as a seven-era thread; A as a three-era exhibit**

**Arc.** What one unit of attention earns, costs and yields — measurable only from the moment the seller became the counter, which is also the moment the numbers stopped being auditable.

**Evidence.** The schema mandates `unit_economics` for eras **5–7 only**. Four eras have no block at all.
`1:0A1B0C  2:1A0B0C  3:0A1B1C  4:0A1B2C  5:0A0B4C  6:0A0B4C  7:1A0B6C`
- eras 5–7: `e5-unit_econ-001..003`, `e6-unit_econ-001..003`, `e7-unit_econ-001..007` — 13 claims, of which **12 are grade C** and one (`e7-unit_econ-003`, Google Services' 40.7% operating margin) is A.
- Partial back-fill exists but on incompatible units: `e1-sellers-005` (Munsey's $25–35k of ad revenue per issue), `e2-pricing-003` (A: the $125–$1,250 station hour), `e3-pricing-005` (C: ~$3.30 → ~$5.90 per thousand TV households per commercial minute), `e4-pricing-003/004/005` (the media unit cost index, postage per piece, list rental per thousand), `e5-pricing-003`.

**Hole to state.** A cost-per-thousand-attentions series for eras 2–7 could be built, but every point would be C, on four different units (household-minute, delivered piece, impression, query), and the era-1–4 cost side does not exist at all. The revenue and cost denominators in eras 6–7 are query counts Google has never published.

**Why it still matters.** PLAN.md calls this "P3's single highest-leverage input", and the 2023–2026 LLM inference series is the direct bridge to project 3. Its value is as a handoff exhibit, not as a seven-era ribbon.

**Visual.** Three panels only — impression (era 5), query (era 6), query-and-answer (era 7) — each showing revenue, cost and margin per unit with full C-grade intervals, and the LLM cost curve overlaid on the era-7 panel. Do not extend it leftwards.

**Strength: C+** as a cross-era thread (four eras missing by design, 12 of 13 claims grade C). **A** as a bounded three-era closing exhibit, which is what the schema was built for.

---

## Considered and folded

- **The shrinking unit of sale** (agate line → sponsored hour → 60s → 30s → thousand impressions → click → impression → conversion). Full coverage, some A-grade prices (`e1-pricing-003`, `e2-pricing-002/003`, `e5-pricing-004`, `e6-pricing-006`), but nominal prices across 180 years without a deflator or a common good are close to meaningless, and the material is already inside "Who set the price". Fold into #4 as a sidebar.
- **The tax subsidy.** `e2-events-005` (a wartime ad cost ~20 cents on the dollar) and `ds-crosscheck-001` (the IRS rail) are both strong, but there are only two data points across seven eras. Fold into #8.
- **Advertising's own legitimacy crises** (patent medicine → Pure Food and Drug; quiz shows; click fraud; made-for-advertising sites). Recurs in every era's EVENTS and is genuinely rhythmic, but the pattern is qualitative and its quantitative anchors are already claimed by #1 and #12.

## Notes for the Gate B decision

**Overlap map — three candidates are already spoken for.**
- #4 (who set the price) is the era spine restated. Choosing it produces a chapter that mostly re-argues 07, 08 and 10.
- #6 (spend/medium) is the base layer of the experience. The signature chart exists whether or not this is a thread.
- #8 (capture) is already written as chapter 9. Selecting it commissions its visual, not its prose.
- The genuinely additive high-strength candidates are **#1, #2 and #3**. None is a chapter today, and each has a distinct visual.

**Natural pairs.**
- #1 with #4 — the same argument from two sides. The count creates the price.
- #2 with #5 — the two halves of the take-rate question. What the buyer's intermediary keeps, against what the seller pays the front door. They share the R4 evidence base.
- #3 with #7 — "who was allowed in" and "what they were buying with".

**Data-layer implications, if selected.**
- #3 needs no new data.
- #2 needs a declared denominator convention added to the data layer before freeze.
- #7's four-way split will stay a construction. No compiler publishes it, so freezing it freezes our own work — and chapter 9 already flags it as the number most likely to be wrong.
- #6 cannot be improved without a licensed MAGNA by-medium series for 2011–2025 (`ds-gap-001`).
