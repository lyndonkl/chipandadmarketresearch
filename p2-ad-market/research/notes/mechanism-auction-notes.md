# Mechanism notes — the auction engine (R4)

Working notes for `p2-ad-market/data/mechanism-auction.json` (top-level key `auction`) and
`p2-ad-market/data/simulator-params.json`. Sources, assumptions, rejected examples, and the
places where the deployed mechanism diverges from the textbook one.

As of 2026-07-30.

---

## 1. What was formalized, and from what

**Deployed mechanism (AdWords Select, 2002-02-20 through 2008).** Evidence basis is
`data/eras/era-6.json`, the verified record. Fields used: PRICING (e6-pricing-001 through
e6-pricing-008), TARGETING (e6-targeting-003, Quality Score), MEASUREMENT (e6-measurement-003,
no click standard until 2009), and the events list.

The single most load-bearing formalization decision: **AdRank is a ranking by expected revenue
per impression, not a relevance filter.** `bid × pCTR` has units of dollars per impression. Make
that substitution and every result in the analysis falls out mechanically. That includes the
uncomfortable ones. The revenue gain is a volume effect. The relevance gain is a by-product. The
whole thing is a bet on the seller's own CTR forecast.

**Rivals.** Pure-bid is Overture as it actually ran in 2002, not an idealised design: 10-cent
floor, $20 monthly minimum, human editorial review, $0.31 realised average CPC, bids visible in a
public bid tool. First-price-with-shading is Google Ad Manager from 2019-09-05, which is the
**display** exchange. VCG is carried as a fourth design. It is the only way to turn "GSP is not
truthful" into arithmetic rather than an adjective.

---

## 2. Assumptions added (all of them)

Every assumption below is also recorded inside the relevant example object in the JSON.

1. **Separable position model.** `expected clicks = impressions × position_multiplier[j] ×
   advertiser_ctr`. Standard for position auctions. It matches Google's own ranking
   arithmetic. It is what makes slot-2 revenue computable at all.
2. **Bids held fixed across designs in ex-1.** This is the standard way to make the comparison.
   It is *not innocent* — see §4. Bid response is handled separately in ex-2/ex-3.
3. **Complete information in ex-2/ex-3.** The textbook treatment (EOS 2007, Varian 2007).
4. **Increment set to zero in the headline truthfulness arithmetic**, with the one-cent version
   computed alongside to show it changes nothing.
5. **q = 1 for all bidders in ex-2/ex-3.** This is deliberate. Quality-weighting does not restore
   truthfulness. A common quality divisor rescales both sides of the deviation equally.
6. **IPV / uniform [0, V] / symmetry / risk neutrality in ex-4.** These are exactly the
   revenue-equivalence conditions, and break-3 walks each one.
7. **γ (the squashing exponent) is invented.** The DOJ record names squashing. No value for the
   exponent has ever been public. γ = 0.5 makes the mechanism legible. γ = 0.95026 is *derived*
   to match the disclosed ~5% effect on a stated quality gap. Both are labelled as assumptions in
   the JSON. Both must be labelled in the simulator UI.
8. **Format-pricing uplifts compound multiplicatively and independently.** If launches
   cannibalise, three launches is a floor on the count, not a point estimate.
9. **"About half" of a 15% launch is taken as exactly 50%**, matching the disclosed 40-50%
   rGSP stickage band.
10. **rGSP's pricing rule is not modelled.** The magnitudes are disclosed. The rule is not. The
    analysis places those magnitudes inside the ex-3 band. It does not pretend to re-derive them.
    See §5 for the model that was tried and rejected.

---

## 3. Verdict on each claim

| Claim | Verdict | Deciding example |
|---|---|---|
| C1 pure-bid mis-orders | **proven**, with an exact condition | ex-1 |
| C2 quality-weighting raises revenue AND relevance | **proven** at equal bids; **bounded** by CTR-estimate accuracy | ex-1, break-1 |
| C3 winners pay under bid, total still beats pure-bid | **proven** | ex-1 |
| C4 GSP is not truthful | **proven** | ex-2 (+ ex-3 for the consequence) |
| C5 first-price with shading ≈ same revenue | **proven** in the symmetric benchmark; **bounded** outside it | ex-4, break-3 |
| C6 the knobs move price without quality change | **demonstrated** (γ assumed; format and rGSP magnitudes disclosed) | ex-5, ex-6, ex-7 |

The exact C1 condition is worth putting in the chapter. It is crisper than the prose version.
Pure-bid places advertiser *i* above *j*, while expected-revenue ranking places *j* above *i*,
**iff** `1 < b_i/b_j < q_j/q_i`. In the worked case that is `1 < 3 < 5`.

---

## 4. Where the analysis argues against its own brief

Three places. All are in the JSON as findings; recording them here so the drafting stage cannot
lose them.

**(a) The revenue gain is volume, not price.** In ex-1 the average price per click *falls* 42%
($1.57 → $0.91) while total revenue rises 87%. Any retelling that says quality-weighting "let
Google charge more per click" has the sign backwards. It let Google sell more clicks per
impression, and impressions are the scarce good.

**(b) C2 and C3 are proven *at equal bids*, and that qualifier does real work.** GSP is not
truthful (C4). So its revenue is a band, not a number. In ex-3 the band is [$440, $760], a factor
of 1.727. The floor is the lowest locally-envy-free equilibrium, which is exactly VCG-revenue-
equivalent. The ceiling is naive truthful play. So a simulator that shows truthful bidding
overstates GSP revenue by up to 73%. The ex-1 comparison measures a point the *bidders* choose.
This is why `bidder_mode` is a required, always-visible control in the params file rather than a
buried option.

**(c) The mechanism does not explain the capture.** Overture ran the "inferior" design and led
paid-search revenue through 2002: $667.7m against Google's $439.5m of *total* revenue. Yahoo
adopted quality weighting only on 2007-02-05, with Panama. That was five years late, and long
after the distribution war was settled. The auction explains yield per query. It does not explain
query volume. Read this section against the distribution engine, not instead of it. This is
finding f14. It is the reconciliation point for r4-val-03.

---

## 5. Rejected examples and dead ends

**Rejected: a mechanical re-pricing model of rGSP.** The first attempt randomised the order of
the top two candidates, then priced on the *realised* order under the GSP rule. It
produces a clean +26% revenue number. It is wrong twice over. First, without a max-CPC cap it
charges the promoted bidder more than its own value. That gives the bidder a negative expected
payoff of −$40 in the worked case, so it would simply exit. Second, *with* the cap — which the
deployed product has — the top-slot price is identical in both orderings. So on fixed bids
randomisation raises no revenue at all. It merely degrades the allocation. rGSP's revenue effect
cannot come from mechanically re-pricing fixed bids. It has to come from bid *response*. That is
consistent with the disclosed 40-50% stickage: bidders re-optimise and eat about half the gain.
The actual pricing rule is not public. So the analysis reports the disclosed magnitudes and
places them inside the ex-3 band, instead of inventing a rule.

**Rejected: a "bidders must bid above a threshold to escape the randomisation band" model.** It is
defensible as a story. It fails on GSP's own arithmetic. Your own bid does not set your price
under GSP. So bidder 1 can raise its bid to escape the band and still pay the same. Only
bidder 2's bid moves bidder 1's price. Under randomisation, bidder 2's position improves in
expectation. So its incentive runs the *wrong* way. Dropped.

**Rejected: a complete-information asymmetric-shading example for break-3.** It mixed
complete-information values with a distributional shading equilibrium. The number it produced
could not be defended in either framework. Replaced with the clean linear result. Seller revenue under first
price is exactly `shading_factor / ((n−1)/n)` times second-price revenue. So the whole question
reduces to one behavioural parameter and its plausible range: 0.55-0.80, or −17.5% to +20%.

**Rejected: using the E1 cast for the squashing price demonstration directly.** At γ = 0.5 the
E1 cast *reorders*. That is an important result on its own, but it confounds the price effect with
an allocation effect. So ex-5 is split in two. Part A (Delta/Ember) preserves the order and
isolates the price effect: +63.3%, closed form `(q_next/q_own)^(γ−1)`. Part B runs the E1 cast,
where the order flips back to pure-bid. Part B is the more damning finding.

**Considered and kept as prose only: pure-bid's collusion surface.** Overture published bids in
its bid tool, which makes gap-jumping and tacit rotation easy. It is a real design break and it
sits in the `breaks` array. But no worked arithmetic was built for it. So the params file marks it
NOT SIMULATED rather than smuggling it into a scenario.

---

## 6. Deployed-versus-textbook divergences (the core findings)

1. **The one-cent increment.** Prices are next-AdRank *plus* a fixed increment.
2. **The quality-set reserve, from August 2005.** This is the big one. Quality Score set a
   per-keyword dynamic *minimum bid*. On a query with one eligible advertiser, the minimum bid
   **is** the price. Break-2 moves it from $0.01 to $1.00. That is a 100× revenue change with one
   advertiser, one ad, and no change to anything the user sees. So the seller has set prices
   directly on the long tail since 2005. The DOJ-era "pricing knobs" are the same lever on a
   bigger base. They are not a new kind of thing. (Finding f13.)
3. **Smart pricing (2004)** discounted syndicated network clicks by expected value, so one bid
   bought differently-priced clicks depending on placement.
4. **Landing-page quality folded into Quality Score (2005)** — Google's own admission that CTR
   alone rewards the wrong ad.
5. **The knobs (2019).** Squashing, format pricing, rGSP. None disclosed, none opt-outable.

---

## 7. The 2019 correction (do not let the chapter get this wrong)

The brief's C5 says first price is "the design the market later adopted (2019)". That is true of
**display** and false of **search**, and the two 2019 changes ran in opposite directions:

| | display (Google Ad Manager / AdX) | search text ads |
|---|---|---|
| change | unified first-price auction, completed 2019-09-05 | rGSP |
| stated motive | fair and transparent marketplace under header-bidding competition | revenue |
| disclosed effect | Google: "neutral to positive impact on a publisher's total revenue" | +5.91% top-slot CPC PC/tablet, +4.85% mobile in tests; +5.74% revenue persisting two months post-launch |
| yield mechanism | none — revenue-equivalent under symmetry for every *n* | randomisation degrades the bid-down-a-slot trade |

Search never went first-price. Finding f10; comparison `cmp-2019-two-changes`.

---

## 8. Open tension left unresolved (deliberately)

The record says rGSP replaced format pricing *because rGSP made more money*. But format pricing
was ~20% of text-ads RPM. rGSP's disclosed persistent revenue effect was +5.74%. So either the
20% was not all incremental, or the two were substitutes for the same surplus, or the two figures
sit on different bases. The summarised record does not resolve it. Neither does this analysis.
Recorded in `demonstrations.rgsp_coda.open_tension`. To close it, the drafting stage needs the
trial exhibits themselves — UPX512, UPX737, UPX457, UPX45 — not the opinion's summary.

---

## 9. Sources

**Deployed mechanism (era 6)**
- Google press release, "Google Introduces New Pricing For Popular Self-Service Online Advertising Program" (2002-02-20) — <http://googlepress.blogspot.com/2002/02/google-introduces-new-pricing-for.html>
- Google Inc., Form 10-K FY2008 (AdWords Discounter example; quality-based bidding; cost-per-impression model) — <https://www.sec.gov/Archives/edgar/data/1288776/000119312509029448/d10k.htm>
- Google Inside AdWords blog, "A new addition to the Quality Score" (Dec 2005) — <https://adwords.googleblog.com/2005/12/new-addition-to-quality-score.html>
- Google Inc., Form 10-K FY2004 (2002 revenue table) — <https://www.sec.gov/Archives/edgar/data/0001288776/000119312505065298/d10k.htm>

**Pure-bid rival**
- Overture Services, Inc., Form 10-K FY2002 (10-cent minimum bid, $20 monthly minimum, editorial review, $0.31 average price per paid introduction, $667.7m revenue) — <https://www.sec.gov/Archives/edgar/data/1060439/000095014803000429/v88074e10vk.htm>
- Search Engine Land, "New Panama Ranking System For Yahoo Ads Launches Today" (2007-02-05) — <https://searchengineland.com/new-panama-ranking-system-for-yahoo-ads-launches-today-10434>

**First-price rival**
- Google Ad Manager blog, "Rolling out first price auctions to Google Ad Manager partners" (2019-09-05; "neutral to positive impact on a publisher's total revenue") — <https://blog.google/products/admanager/rolling-out-first-price-auctions-google-ad-manager-partners/>
- Google Ad Manager blog, "Simplifying programmatic: first price auctions for Google Ad Manager" (Mar 2019) — <https://blog.google/products/admanager/simplifying-programmatic-first-price-auctions-google-ad-manager/>

**The knobs (DOJ record)**
- United States v. Google LLC, Mem. Op., No. 20-cv-3010 (APM), Doc. 1033 (D.D.C. Aug. 5, 2024), FOF ¶¶245-255 — <https://storage.courtlistener.com/recap/gov.uscourts.dcd.223205/gov.uscourts.dcd.223205.1033.0.pdf>
- Search Engine Land, "Google quietly increases ad prices to meet targets, claims exec" (Dischler testimony, 2023-09-18) — <https://searchengineland.com/google-quietly-increases-ad-prices-targets-432155>
- Bloomberg, "Google Tweaks Ad Auctions to Hit Revenue Targets, Executive Says" (2023-09-18) — <https://www.bloomberg.com/news/articles/2023-09-18/google-tweaks-ad-auctions-to-hit-revenue-targets-executive-says>
- Search Engine Land, "How Google harms search advertisers in 20 slides" (DOJ exhibits) — <https://searchengineland.com/doj-google-search-ad-price-manipulation-440207>

**Theory**
- Edelman, Ostrovsky & Schwarz, "Internet Advertising and the Generalized Second-Price Auction", *AER* 97(1):242-259 (2007) — <https://www.benedelman.org/publications/gsp-060801.pdf>
- Varian, "Position Auctions", *IJIO* 25(6):1163-1178 (2007) — <https://people.ischool.berkeley.edu/~hal/papers/2006/position.pdf>

**Measurement / governance**
- IAB, Click Measurement Guidelines (2009) — <https://www.iab.com/wp-content/uploads/2015/06/click-measurement-guidelines2009.pdf>
- NAA, Annual Newspaper Classified Ad Expenditures (2008 = $9,975.0m) — <http://web.archive.org/web/20110511154447/http://www.naa.org/docs/Research/Annual-Newspaper-Classified-Ad-Expenditures.htm>

---

## 10. Verification state

- `mechanism-auction.json` parses; **123 arithmetic steps** re-evaluate against their stored
  `expected` under verify_p2's `r4-arithmetic` walker and evaluator (safe-expression regex, no
  builtins). All pass.
- All 14 calibration objects pass `check_claim` (`r4-val-02`): ID convention `mech-{topic}-{NNN}`,
  central inside ci80, grade in A/B/C, grade-C carries a method, sources present, ISO `as_of`.
- No object carries both `illustrative: true` and a `calibration`.
- Coverage keys present for the merged `r4-acq-01` check: `designs.{pure_bid, gsp,
  first_price_shading}` and `demonstrations.{gsp_not_truthful, rgsp_coda}`.
- `simulator-params.json` parses; 21 variables (each with range and default), 10 scenarios (each
  with `demonstrates`, `settings`, `expected_output`); all six claims covered; the
  first-price/bid-shading panel is `sc-06`; 9 numeric spot-checks cross-agree with the analysis
  file's stored steps.
- **Merge note for the orchestrator:** this file is the `auction` engine only. `r4-acq-01` reads
  `data/mechanism.json` at `engines.auction`, so this object must be merged in under that path
  alongside the distribution engine before the R4 contract can pass.
