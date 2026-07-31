# Mechanism deep-dive: distribution economics — working notes

Produced for R4 (twin-engine mechanism chapter), distribution half.
Analysis file: `p2-ad-market/data/mechanism-distribution.json` (top-level key `distribution`).
As-of 2026-07-30. Evidence freeze 2026-06-30.

---

## 1. What was actually fetched and parsed

Every 10-K/10-Q number in the analysis was pulled from the filing text, not from
secondary reporting. Filings were downloaded from SEC EDGAR, stripped of markup,
and grepped. The court opinion was downloaded as PDF and converted with `pdftotext -layout`.

| Source | URL | What it supplied |
|---|---|---|
| Google 10-K FY2004 | sec.gov/Archives/edgar/data/1288776/000119312505065298/d10k.htm | Revenue by source 2002-04; TAC $94.5m / $526.5m / $1,228.7m at 91/84/79% of network revenue and 23/37/39% of ad revenue; **AOL = 15%, 16%, 12% of TOTAL revenue in 2002/2003/2004**; guaranteed-minimum contractual obligations of $462.9m at 2004 year-end; the delivery-contingency clause |
| Google 10-K FY2006 | .../000119312507044494/d10k.htm | Revenue by source 2004-06; TAC $2,114.9m (2005) at 34.9%; **AOL = 12%, 9%, 7% in 2004/2005/2006**; the $1.0bn AOL equity investment |
| Google 10-K FY2008 | .../000119312509029448/d10k.htm | Revenue by source 2006-08; **the AdSense/distribution TAC split** ($3,134.6/$174.2, $4,543.0/$390.9, $5,284.3/$654.7); cost of revenues $8,621.5m; the $726m AOL impairment |
| Google S-1 (2004-04-29) | .../000119312504073639/ds1.htm | 1999-2003 balance-sheet data (cash+ST inv $33,589k at 2001 YE); 2001 net revenues $86,426k; **"In May 2002, we issued to an accredited investor a warrant to purchase 7,437,452 shares of Series D preferred stock for an aggregate exercise price of $21,642,985"**; the original net-of-TAC revenue presentation |
| Google Q2 2006 8-K ex.99.1 | .../000119312506150132/dex991.htm | Q2 2006: revenue $2,455,991k, network $996,567k = 41%, TAC $785m = 32% of ad revenue |
| Alphabet 10-K FY2022 | .../1652044/000165204423000016/goog-20221231.htm | Search & other $148,951m / $162,450m; advertising $209,497m / $224,473m; TAC $45,566m / $48,955m at 22% |
| Overture 10-K FY2002 | .../1060439/000095014803000429/v88074e10vk.htm | Revenue $667.7m; **TAC $384.6m = 58% of revenue**, guided to 63-64%; 2.2bn paid introductions; $0.31 average; ~60% of revenue via Microsoft+Yahoo; **the loss of the US AOL relationship**; the affiliate-structure taxonomy |
| Time Warner 10-Q Q2 2004 | .../1105705/000095014404004986/g88623e10vq.htm | Warrant exercised May 2004, ~7.4m Series D shares for ~$22m |
| Time Warner 10-Q Q3 2004 | .../000095014404010346/g91243e10vq.htm | 2,355,559 shares sold in the IPO for $195m net; $188m gain |
| Time Warner 10-K FY2006 | .../000095014407001550/g05042e10vk.htm | $925m gain on the remaining Google stake in 2005; the 5% AOL minority issued to Google in Q2 2006 |
| US v. Google, Doc. 1033 | courtlistener recap, 286pp | FOF ¶62-63 (foreclosure 28/19.4/2.3 + 20%), ¶72 (60-80% iOS query loss), ¶74-75 (defaults = 54% of search revenue in 2017), ¶289 ($26.3bn, largest expense), ¶297 (Safari = 28% of US queries), ¶299 ($20bn to Apple in 2022, 17.5% of Apple's operating profit in 2020); the supracompetitive-text-ads holding and the 5% SSNIP finding |

Secondary sources, used only where no primary exists:
- **~$100m guarantee / ~85% share** — never filed. Battelle's *The Search* is the origin; Seattle Times/AP (Dec 2005) repeats it. Grade B, and the analysis reconstructs a bound from the TAC ratio rather than trusting it (example X3).
- **Apple's 36% rate** — FOF ¶298 is redacted in the public opinion. Disclosed in open court by Google's own expert (Kevin Murphy, 2023-11-13) and later confirmed by Pichai; CNBC/Bloomberg reporting. Grade B.
- **$283m 2009 AOL stake repurchase** — TechCrunch, 2009-07-27. Grade B (the $1.0bn cost and $726m impairment are both grade A from Google filings).
- **Overture -36% / Inktomi -24% on the announcement** — The Register, 2002-05-02. Grade B.
- **Remedies opinion (2025-09-02)** — reported, not read in full here. Grade B.

---

## 2. Findings that were not in the brief and should propagate

These emerged from the filings and are worth pushing back into the era records.

1. **AOL was 15% of Google's total revenue in 2002 and 7% in 2006.** The era-6 record
   carries only 16%/12%/9% for 2003-2005 (from the FY2005 10-K). The FY2004 and FY2006
   10-Ks extend the series in both directions, giving 15/16/12/9/7 for 2002-2006 — all grade A.
   *Recommend adding to e6-sellers-004.*

2. **AOL was 63.4% of Google's 2002 Google Network revenue.** This single number explains
   why the blended 91% TAC ratio is effectively an AOL number and lets the filings corroborate
   the never-filed 85% share. It is the strongest available check on the deal terms.

3. **The May 2002 warrant.** 7,437,452 Series D shares at an aggregate $21,642,985 exercise
   price, carried at $13.871m as "redeemable convertible preferred stock warrant" on the
   2002 and 2003 balance sheets and gone by 2004 year-end. Time Warner realised about
   **$1,134.6m** from it. Nothing in the P2 record currently mentions the equity leg of the
   AOL deal, and it is 11.3x the cash guarantee everyone quotes.
   *Recommend a new era-6 EVENTS entry or an addition to e6-pricing-007.*

4. **The delivery contingency.** FY2004 10-K: "if a Google Network member were unable to
   perform under the contract, such as being unable to provide search queries... then the
   Company would not be obligated to make any non-cancelable guaranteed minimum revenue
   share payments to that member." This converts the guarantee from an unconditional bet
   into a floor price per delivered query. It is the single most important qualifier on the
   "bet-the-company" story and it is in the filings, in plain English.

5. **Google's network take rate FELL after 2006** (24.65% → 21.51% → 21.30%). The era-6
   record's e6-pricing-003 describes it as "roughly doubled by its end," which is true of
   the endpoints but hides the reversal. *Recommend adding the 2006 peak.*

6. **Overture invented the instrument.** Its FY2002 10-K lists "fixed payments, based on a
   guaranteed minimum amount of traffic delivered, which often carry reciprocal performance
   guarantees from the affiliates" as the first of three affiliate structures. Any chapter
   that frames the guarantee as Google's innovation is wrong on the record.

7. **The 2006 AOL sequel destroyed capital.** $1.0bn in (Q2 2006), $726m impaired (Q4 2008),
   $283m out (Jul 2009) — a $717m realised loss, roughly 7x the 2002 cash guarantee. It is
   the forgotten half of the "Google bet on AOL and won" story.

---

## 3. Reconciliations and near-conflicts checked

- **Era-6 e6-pricing-004** quotes TAC at "23%/37%/39%/35% of advertising revenue for 2002-2005"
  (FY2004/FY2005 10-Ks). The FY2006 10-K restates 2004 as 39.1% and 2005 as 34.9%. This is a
  restatement, not a conflict; the analysis file uses the later figures and the difference is
  under 0.2 points. No verdict needed.
- **Network revenue 2002** is $103,937k in the FY2004 10-K. The era-6 record's summary
  arithmetic implies $103,968k (it derives network as ads minus web sites using $410,946
  rather than the filed $410,915). The filed table is authoritative: web $306,978 + network
  $103,937 = ads $410,915. *This is a small error in era-6's derived arithmetic, worth flagging.*
- **Gross vs net revenue presentation.** The S-1 shows 2002 network revenue as $12,278k
  (net of TAC) and the FY2004 10-K shows $103,937k (gross). Same business, 8.5x apart. Recorded
  as break B9 because the famous "48.7% of revenue" statistic depends entirely on the gross
  presentation Google adopted at IPO.
- **No contradiction with the auction half.** The distribution analysis takes no position on
  GSP truthfulness, squashing or rGSP mechanics. The two halves touch at one point: the claim
  that yield gains after 2019 came from pricing knobs rather than design. This file cites the
  same Mehta findings there and reaches a compatible conclusion (break B7). Post-2019 yield
  came from market power. It must not be folded into the era-6 auction-design story.

---

## 4. Assumptions added, and their blast radius

| Assumption | Where it bites | Sensitivity carried |
|---|---|---|
| Essentially all AOL-generated revenue was booked as network revenue | The 63.4% share of 2002 network revenue; the guarantee-overhang reconstruction | The 10-K says "primarily through our AdSense program". If 10% of AOL revenue were owned-site, the share drops to ~57% and the overhang estimate rises. Directionally unchanged. |
| Non-AOL network members took 60-70% revenue share in 2002 | Only the guarantee-overhang number in X3 | All three values are computed and shown: $11.9m / $13.8m / $15.7m. Marked illustrative. |
| Google's take on AOL specifically was 15% | Only X5's retained-margin figure | Marked illustrative. At the network-average take rates instead (9/16/21/21/25%) the retained figure rises to roughly $370m rather than $297m, which does not change the conclusion that it fell short of the warrant value. |
| Non-TAC cost of revenues allocates pro-rata to revenue | The fully allocated margin gap in X6 | Both bounds computed: 9.24x pro-rata, 5.26x at half pro-rata. The claim "the take rate is not a margin" holds under both. |
| Era-6's grade-C query denominators | The volume/yield log split in X9 | Both published paths computed: 56.3% and 52.0% volume. The interval on mech-capture-002 reflects denominator uncertainty only. |
| Illustrative RPMs ($10 vs $6) in the distribution auction | X8 only | The conclusion is qualitative and scale-free: the max feasible bid is yield net of serving cost, so the higher-RPM bidder wins. The empirical anchor (91% vs 58% payout) is grade A on both sides. |

---

## 5. Examples built and discarded

- **Discarded: a per-query revenue comparison of owned vs syndicated inventory.** Google
  never disclosed network impressions or network clicks in this era, and the AdSense CPM
  series does not begin until era 7. A per-query claim would have required inventing a
  denominator. Replaced with per-dollar retention (X6), which is fully grade A.
- **Discarded: "Google would have been unprofitable without AOL."** Not true and not close.
  At a 15% take AOL contributed roughly $9.9m of gross margin in 2002 against $99.7m of net
  income. AOL was 15-16% of revenue and about 2-5% of gross profit. The interesting version
  of this — that the deal bought position rather than profit — became X5.
- **Discarded: modelling the AOL contract as a second-price auction between Google and
  Overture.** There is no evidence AOL ran a formal auction, and the observable outcome
  (Google at ~85% vs Overture's blended 58%) is a first-price-shaped result. X8 models it
  as first-price with a budget constraint set by yield, which is what the disclosed payout
  rates actually support.
- **Kept but knife-edge: X3.** The guarantee-overhang reconstruction depends on a non-AOL
  share assumption, so three values are carried rather than one. Two conclusions survive all
  three. The overhang is an order of magnitude below $100m. And the 2003 ratio of 84% sits
  below the reported 85% AOL share, which dates the guarantee's expiry on its own.

---

## 6. Simulation hooks (no `output_params_path` was supplied)

No parameterisation file was requested, so step 5 was skipped. The distribution side needs
these variables and scenarios if the merged `simulator-params.json` is to cover its claims.

```json
{
  "variables": [
    {"name": "revenue_share_s", "range": [0.50, 0.95], "default": 0.85,
     "note": "share of surface revenue paid to the access-point owner"},
    {"name": "guarantee_musd", "range": [0, 300], "default": 100,
     "note": "non-cancelable guaranteed minimum over the term"},
    {"name": "term_years", "range": [1, 5], "default": 3},
    {"name": "rpm_buyer", "range": [2.0, 20.0], "default": 10.0,
     "note": "USD advertising revenue per 1,000 queries for the winning bidder"},
    {"name": "rpm_rival", "range": [1.0, 20.0], "default": 6.0},
    {"name": "serving_cost_per_1k", "range": [0.10, 3.00], "default": 1.00},
    {"name": "owned_share_of_ad_revenue", "range": [0.0, 1.0], "default": 0.747,
     "note": "the cross-subsidy base; Google's disclosed 2002 value"},
    {"name": "equity_pct_of_company", "range": [0.0, 0.10], "default": 0.0271,
     "note": "warrant dilution; drives the equity-leg cost"},
    {"name": "terminal_valuation_multiple", "range": [1, 100], "default": 45,
     "note": "growth in the buyer's equity value between signature and the partner's exit"},
    {"name": "take_rate_syndicated", "range": [0.05, 0.35], "default": 0.213},
    {"name": "take_rate_owned", "range": [0.85, 1.00], "default": 0.955},
    {"name": "nontac_cost_allocation", "range": [0.0, 1.0], "default": 1.0,
     "note": "1.0 = pro-rata to revenue, 0.5 = half pro-rata for syndicated impressions"}
  ],
  "scenarios": [
    {"id": "D1", "demonstrates": "X1/X2 — guarantee as headline vs as exposure",
     "settings": {"guarantee_musd": 100, "revenue_share_s": 0.85},
     "expected_output": "break-even revenue G/s = 117.6; exposure curve hits zero at 2.55x cumulative delivered revenue by end-2003"},
    {"id": "D2", "demonstrates": "B1 — delivery contingency",
     "settings": {"partner_delivers": false},
     "expected_output": "buyer exposure = 0 regardless of guarantee size"},
    {"id": "D3", "demonstrates": "X4/B3 — the equity leg",
     "settings": {"equity_pct_of_company": 0.0271, "terminal_valuation_multiple": 45},
     "expected_output": "equity cost ~11x the cash guarantee; cost rises monotonically in the buyer's own success"},
    {"id": "D4", "demonstrates": "X6 — owned vs syndicated retention and margin",
     "settings": {"take_rate_syndicated": 0.213, "take_rate_owned": 0.955, "nontac_cost_allocation": [1.0, 0.5]},
     "expected_output": "retention gap 4.48x; margin gap 9.24x pro-rata, 5.26x at half allocation"},
    {"id": "D5", "demonstrates": "X8 — yield sets the distribution budget",
     "settings": {"rpm_buyer": 10.0, "rpm_rival": 6.0, "serving_cost_per_1k": 1.00},
     "expected_output": "rival's max share 83.3% = $5.00/1k; buyer pays $8.50 at 85% and nets $0.50; rival would need to bid 141.7% to match"},
    {"id": "D6", "demonstrates": "X8 tail — the loss-leading network",
     "settings": {"revenue_share_s": 0.91, "rpm_buyer": 10.0, "serving_cost_per_1k": 1.00},
     "expected_output": "buyer nets -$0.10 per 1,000 queries; viable only if owned_share_of_ad_revenue is high"},
    {"id": "D7", "demonstrates": "X9 — capture attribution",
     "settings": {"query_denominator_path": ["high", "low"]},
     "expected_output": "network = 31.9% of gross growth, 9.4% of net revenue; owned-site split 52.0-56.3% volume"},
    {"id": "D8", "demonstrates": "X10/B7 — the composition inversion",
     "settings": {"year": [2008, 2021]},
     "expected_output": "distribution share of TAC 11.0% -> 57.7%; absolute spend x40; headline TAC rate roughly unchanged"},
    {"id": "D9", "demonstrates": "B5 — the unmeasured liquidity externality",
     "settings": {"advertiser_pool_elasticity": [0.0, 0.5]},
     "expected_output": "a toggle, explicitly labelled unmeasured: at elasticity 0 the 9% take rate is irrational absent foreclosure value; at 0.5 it pays for itself. No public data selects between them."}
  ]
}
```

---

## 7. Open items for the merge and for R5

- The chapter must not say "the auction won" or "the cheque won." The reconciled line is:
  **the auction sets the maximum bid, the bid buys the query base, and neither works alone.**
  X8 is the demonstration that makes this a mechanism claim rather than a hedge.
- The chapter should carry the equity leg. It is the most surprising true thing in this file
  and it is grade A on both sides of the trade.
- The Mehta coda should be framed as *the same instrument at scale*, not as a new phenomenon.
  The $654.7m distribution TAC line of 2008 is the $26.3bn line of 2021.
- Break B7 is a hard constraint on the era-7 chapter: post-2019 yield gains are attributable
  to market power on the court's own findings, so they cannot be used as evidence for the
  era-6 auction-design story.
- `p2-ad-market/data/eras/era-6.json` derives 2002 total advertising revenue as $410,946k;
  the filed figure is $410,915k. Small, but it propagates into any per-query arithmetic.
