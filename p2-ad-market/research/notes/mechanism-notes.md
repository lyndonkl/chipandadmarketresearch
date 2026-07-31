# Mechanism notes — the merged twin engine (R4)

Working notes for the merged stage. The artifacts these notes cover are
`p2-ad-market/data/mechanism.json` (both engines plus the `reconciliation` block) and
`p2-ad-market/data/simulator-params.json` (both engines' scenarios).

As of 2026-07-30. Evidence freeze 2026-06-30.

**Inputs.** This file is the merge of two per-analyst passes. Both are kept; neither is superseded.
It mirrors the way `reconciliation.inputs` in `mechanism.json` references the two analysis files.

| Input | Analysis file | Notes file | Merged to |
|---|---|---|---|
| Auction engine (yield) | `data/mechanism-auction.json`, key `auction` | `research/notes/mechanism-auction-notes.md` | `engines.auction` |
| Distribution engine (volume) | `data/mechanism-distribution.json`, key `distribution` | `research/notes/mechanism-distribution-notes.md` | `engines.distribution` |

Both merges were verbatim copies. No example, number, grade, source or wording was altered by the
merge. Read the two per-analyst notes for the detail inside each engine: rejected examples, dead
ends, and the per-engine source lists live there and are not repeated here. This file records only
what the merge itself did, decided, or could not resolve.

---

## 1. What was formalized, and from what

The thesis of the merged stage: **Google's era-6 position was built by two engines that are usually
told as one story and are not substitutes.** The auction is the yield engine; it sets revenue per
query. Distribution is the volume engine; it buys the queries. Each engine's own analysis reaches
the same boundary from the opposite side.

**Yield engine.** AdWords Select as deployed from 2002-02-20 through 2008: rank by
`bid x predicted CTR`, charge the minimum needed to hold position, quality-adjusted, per click.
Evidence basis is `data/eras/era-6.json` (the R3-verified record) plus the filings, the DOJ record
and the position-auction literature. Rivals formalized alongside it: pure-bid as Overture actually
ran it in 2002, first-price-with-shading as Google Ad Manager ran it from 2019-09-05, and VCG as
the truthful yardstick. Ten worked examples, three comparisons, seven breaks, fifteen findings.

**Volume engine.** Revenue-share syndication with minimum-revenue guarantees and default
placement: `TAC = max(s * R, G_amortised)`, sometimes paid in equity. Evidence basis is the filings
themselves — Google's FY2004/FY2006/FY2008 10-Ks, the S-1, the Q2 2006 8-K, Alphabet's FY2022
10-K, Overture's FY2002 10-K, three Time Warner filings, and the full text of the 2024 Mehta
opinion. Ten worked examples (X1-X10), six comparisons, nine breaks (B1-B9), ten findings.

**The coupling, which is what the merge is for.** The maximum feasible bid for a default *is* the
yield net of serving cost (distribution example X8), so only the higher-RPM bidder can afford an
85% share. The auction engine reaches the same junction from the other side in finding f14: the
auction explains yield per query and cannot explain query volume. The chapters should run the pair
as one sentence read from two ends. "The better auction won" and "the bigger cheque won" describe
the same event, because the auction set the size of the cheque.

**The asymmetry that decided it was not the contract form.** Overture's own FY2002 10-K describes
the identical instrument set, guaranteed minimums included. What Google had and Overture did not
was an owned destination carrying no revenue share: 74.7% of Google's 2002 advertising revenue came
from inventory it did not have to pay for. That cross-subsidy, funded by yield, is what the volume
engine spent.

---

## 2. Assumptions added, across both engines

Every assumption is also recorded inside the object it affects. This is the consolidated list, so
the drafting stage does not have to open two files to find it.

**Auction engine** (detail in `mechanism-auction-notes.md` section 2)

1. Separable position model: `expected clicks = impressions x position_multiplier[j] x advertiser_ctr`.
2. Bids held fixed across designs in ex-1 — not innocent, and section 4 of that file says why.
3. Complete information in ex-2/ex-3 (the EOS 2007 / Varian 2007 treatment).
4. Increment set to zero in the headline truthfulness arithmetic, with the one-cent version alongside.
5. `q = 1` for all bidders in ex-2/ex-3. Quality weighting does not restore truthfulness.
6. IPV, uniform [0, V], symmetry, risk neutrality in ex-4 — the revenue-equivalence conditions.
7. The squashing exponent is invented. No value has ever been public. Two stops are carried and both are labelled.
8. Format-pricing uplifts compound multiplicatively and independently.
9. "About half" of a 15% launch taken as exactly 50%, matching the disclosed 40-50% stickage band.
10. rGSP's pricing rule is not modelled. Disclosed magnitudes are placed inside the ex-3 band instead.

**Distribution engine** (detail in `mechanism-distribution-notes.md` section 4)

11. Essentially all AOL-generated revenue was booked as network revenue. At 10% owned-site, AOL's share of 2002 network revenue drops from 63.4% to about 57% and the overhang estimate rises. Directionally unchanged.
12. Non-AOL network members took 60-70% revenue share in 2002. All three values computed ($15.7m / $13.8m / $11.9m), all marked illustrative.
13. Google's take on AOL specifically was 15%. Marked illustrative; at the network-average take rates the retained figure rises to roughly $370m rather than $297m and the conclusion is unchanged.
14. Non-TAC cost of revenues allocates pro-rata to revenue. Both bounds computed: 9.24x pro-rata, 5.26x at half pro-rata.
15. Era-6's grade-C query denominators drive the volume/yield split. Both published paths computed: 56.3% and 52.0% volume.
16. Illustrative RPMs ($10 vs $6) in the distribution auction. The conclusion is scale-free; the empirical anchor is the 91% vs 58% payout gap, which is grade A on both sides.

**Merge-level rigor convention, enforced by script.** Every real-world number carries a calibration
object. Every invented number sits inside an object marked `illustrative: true` and carries no
calibration. `tools/verify_p2.py r4-claims` fails any node that carries both; `r4-arithmetic`
re-evaluates every stored `{expr, expected}` step in the file.

---

## 3. The reconciliation: method and result

**Method.** Every fact asserted by *both* engines was listed, the two loci compared, and the shared
quantities re-derived arithmetically. Claim IDs were then checked for collisions across the two
engines and for internally inconsistent copies of the same ID within an engine.

**ID hygiene.** 14 distinct auction claim IDs, 31 distinct distribution claim IDs, zero collisions.
The two engines use disjoint ID families — auction: `adwords`, `discounter`, `quality_score`,
`audit`, `overture`, `panama`, `first_price`, `rgsp`, `knobs`, `tuning`, `google_rev`, `classified`,
`format_pricing`; distribution: `ovt`, `aol`, `tac`, `network`, `default`, `mehta`, `capture`. The
auction engine attaches the same calibration object to several examples (`mech-discounter-001`
appears five times, `mech-overture-002` three times). Every copy is byte-identical. They are
citations, not competing versions. This mattered enough to check: two engines writing to one file
is exactly how a fact acquires two values.

**The nine shared facts.** Every fact both engines assert, with both loci:

| Fact | Auction | Distribution | Agree |
|---|---|---|---|
| Overture revenue FY2002 | $667.7m (`mech-overture-002`) | $667.7m (`mech-ovt-001`, X5) | yes |
| Overture average price per paid introduction | $0.31, ci80 [0.31, 0.31] (`mech-overture-001`) | $0.31, ci80 [0.30, 0.32] (`mech-ovt-004`) | yes |
| Google total revenue FY2002 | $439.5m | $439.508m (X2, X5) | yes |
| Google advertising revenue FY2008 | $21,128.5m (`mech-google_rev-001`) | $21,128.514m (tac_series, X6, X9) | yes |
| Google Network revenue FY2008 | $6,714.7m | $6,714.688m (network_share, X6, X9) | yes |
| Yahoo adopts quality weighting (Panama) | 5 February 2007 | February 2007 | yes |
| Overture as paid-search revenue leader entering era 6 | asserted, to show pure-bid was not failing commercially | asserted, to show the leader was half as profitable (11.0% vs 22.7% net margin) | yes |
| Google could raise text-ad prices without losing advertisers | Dischler: undisclosed tunings raised prices ~5%, up to 10% (`mech-tuning-001`, grade B) | the court's separate finding on sustained 5%-or-more increases (`mech-mehta-004`, grade A) | yes |
| The 2024 Mehta opinion as evidence | pricing knobs and rGSP magnitudes | distribution findings and the remedy | yes |

Two of those rows carry instructions rather than just a verdict:

- **The $0.31.** Same central value, same 10-K source, two claim IDs with different interval widths.
  The distribution engine widens the band because it re-derives $0.3035 from $667.7m over 2.2bn
  paid introductions. When a chapter quotes it, quote `mech-ovt-004`'s wider interval.
- **The two 5% findings.** These are *different* findings in the same opinion that both centre on
  5%. One is a disclosed average effect of parameter changes; the other is a monopoly-power finding
  about sustained price increases. They must not be merged in prose. This is the single most
  inviting error in the whole file.

**Denominator conventions.** Three, all recorded rather than resolved, because all are correct:

1. Google Network share is quoted on three bases and they are not interchangeable — 31.8% of 2008
   *advertising* revenue, 30.8% of 2008 *total* revenue, 9.4% of 2008 advertising revenue *net of
   TAC*. Name the basis every time.
2. TAC is quoted both as a share of advertising revenue (28.1% in 2008) and as a share of Google
   Network advertising revenue (78.7% in 2008). The first is the company's cost line; the second is
   the take rate's complement.
3. The auction engine's revenue figures are per 1,000 impressions on an invented cast and are
   marked illustrative. They must never be placed on the same axis as the distribution engine's
   filed dollars.

**Arithmetic.** Five quantities that both engines assert were re-derived by hand. Each uses only
figures that appear in both files. Each is stored as a machine-checked step in
`reconciliation.consistency_check.arithmetic`. They are:

- the network's 31.8% share of 2008 advertising revenue;
- its 30.8% share of total revenue. The apparent gap is the denominator, not a disagreement;
- the $20,717.599m advertising-revenue increment 2002-2008;
- Overture's FY2002 revenue against Google's, at $667.7m / $439.508m = 1.519x;
- total 2008 TAC at 28.1% of advertising revenue.

**Result: no contradiction found.** `reconciliation.contradictions` is empty, and that emptiness is
a finding rather than an omission — it is what the nine-row table above was built to test. The only
divergences anywhere are the wider CI on $0.31 and the three network-share denominators, both
recorded above.

---

## 4. The capture-attribution stance

**Question.** Between 2002 and 2008, how much of Google's revenue growth is attributable to auction
yield (revenue per query) versus distribution volume (queries bought)?

**Verdict: BOUNDED, and against both simple stories.** Distribution was decisive for the 2002-2004
beachhead and again after 2008. Inside 2002-2008 the two engines were close to co-equal, with a
documented tilt that depends on which ledger you read. On gross revenue growth, syndication supplied
31.9% and owned sites 68.1%. On net-of-TAC revenue, syndication supplied 9.4% of the 2008 total: the
syndicated dollar bought position, not profit. Inside owned-site growth, a log decomposition splits
52-56% to query volume and 44-48% to yield per query, and that volume was overwhelmingly *not*
bought — distribution TAC was 3.7% of owned-site revenue in 2007 and 4.5% in 2008.

The defensible synthesis is causal rather than accounting. The auction set the budget for the
distribution bid; the distribution secured the query base the auction then monetised. Neither engine
is sufficient, and the yield engine is the binding constraint on the volume engine.

The verdict is the distribution engine's, carried into `reconciliation.capture_attribution`
verbatim. The reconcile pass did not re-derive, re-weight or soften it. The auction engine does not
contest it. Finding f14 declines outright to claim the design caused the capture. Its grounds:
Overture led paid-search revenue through 2002 with the crude design, and Yahoo waited until 2007 to
copy the better one.

**Evidence weights.** Five, summing to 1.0, each with a grade, a direction and a discount stated
against itself.

| | Weight | Grade | Direction | Finding | Discount |
|---|---|---|---|---|---|
| W1 | 0.25 | A | distribution | Network revenue reached 48.7% of total revenue in 2004 and was still 30.8% in 2008; AOL alone was 15-16% of all company revenue in 2002-2003. | Share of revenue overstates share of value: it is recognised gross and 79-91% was paid straight out. |
| W2 | 0.25 | A | auction/yield | Net of revenue share the network contributed 9.4% of 2008 advertising revenue and about 8.0% cumulatively. Ninety percent of the money Google kept came from its own properties. | Ignores the possibility that syndicated inventory raised owned-site CPCs by deepening the advertiser pool — an externality nobody has measured. |
| W3 | 0.20 | C | split | Owned-site revenue rose 34.6x from 2002 to 2007. On the era record's own query estimates the log decomposition is 52-56% volume, 44-48% yield. | Both query denominators are grade C, each carrying 30%+ uncertainty, which propagates directly into the split. |
| W4 | 0.15 | A | auction/yield | Distribution TAC — money paid to send queries to Google's *own* site — was $174.2m, $390.9m and $654.7m in 2006-2008, i.e. 2.8%, 3.7% and 4.5% of owned-site revenue. Owned query growth was almost entirely unbought. | Understates the 2002-2004 AOL effect, which ran through network revenue rather than distribution TAC, and ignores brand spillover. |
| W5 | 0.15 | A | distribution | Retrospectively the court found defaults drove 54% of Google's search revenue by 2017, and default payments were its single largest expense at $26.3bn by 2021. | Era-7 evidence. Using it to attribute era-6 growth is anachronistic: distribution TAC was 11% of TAC in 2008 against 58% in 2021. |

Supporting claim IDs: `mech-capture-001`, `mech-capture-002`, `mech-capture-003`,
`mech-network-003`, `mech-tac-004`, `mech-aol-002`.

**Weakest link.** `mech-capture-002` is grade C and inherits two grade-C query denominators from the
era-6 record. The volume/yield split is a band, not a point. The chapters must carry it as 52-56%
against 44-48%, never as a flat 54%.

**Boundary condition.** Break B7 is the binding caveat on the whole twin-engine frame. Once the
defaults foreclose roughly half the market, later yield gains cannot be attributed to auction
design; the court attributed them to power. See section 6.

---

## 5. Open tensions, left open on purpose

Three. All are preserved in `reconciliation.open_tensions` with the same instructions.

**T1 — Is the 2019 pricing power continuous with the 2005 mechanism, or a different phenomenon?**
The auction engine says continuity. From August 2005 the Quality-Score-derived minimum bid was a
seller-set price. On a one-bidder query the reserve *is* the price, so a $0.01-to-$1.00 move is a
100x revenue change with nothing changing on screen. The DOJ-era knobs are the same lever on a
bigger base. The distribution engine says discontinuity. Once the defaults foreclosed half the
market, the court attributed the yield gains to power rather than design.
*This is not a contradiction.* They are claims about different objects — the auction says the
instrument is continuous, the distribution says the causal attribution of the gains is not. Both
hold. **Chapters carry both, explicitly, in that order: the lever is old, the power behind it is
new.** Do not present either engine as correcting the other and do not collapse the pair into one
sentence.

**T2 — The strongest economic justification for a 9% take rate is unmeasurable.** Break B5: the
syndication-deepens-the-auction externality is exactly the channel that would let the volume engine
raise the yield engine's prices, and it is the one coupling this merge cannot quantify in either
direction. Google never disclosed advertiser counts, per-keyword auction depth or owned-site CPCs.
**State it as an open question with a simulator hook (D9), never as a finding.** It is also the
honest limit of the capture-attribution verdict.

**T3 — The rGSP-versus-format-pricing accounting does not close.** The record says rGSP replaced
format pricing because it made more money, yet format pricing was about 20% of text-ads RPM while
rGSP's disclosed persistent effect was +5.74%. Either the 20% was not all incremental, or the two
were substitutes on the same surplus, or the figures sit on different bases. Closing it needs the
trial exhibits themselves (UPX512, UPX737, UPX457, UPX45), not the opinion's summary.
**Preserved unresolved.**

---

## 6. Two things the merge carries forward, and neither is optional

**(a) The era-6 arithmetic discrepancy.** `data/eras/era-6.json` derives 2002 total advertising
revenue as $410,946k. The filed FY2004 10-K table gives $410,915k (web sites $306,978k + network
$103,937k). The filed table is authoritative. The gap is $31k. It moves no conclusion in this file,
because the distribution engine uses the filed $410,915k throughout, and so do the merged arithmetic
checks. It does propagate into any *per-query* figure taken from the era record, where the
denominators are already grade C. Two consequences follow. The drafting stage must not reconcile the
mechanism file *to* the era record on this number. And the era record should be corrected before the
data layer is frozen at Gate B.

**(b) Break B7 is a hard constraint on the era-7 chapter.** Post-2019 yield gains are attributable
to market power on the court's own findings. They cannot be used as evidence for the era-6
auction-design story. Both engines reach this point on their own and agree on it. It is the one
place the two halves touch on a shared conclusion. It is also the guardrail on the most tempting
chapter-08 move, which is to run the 2019 numbers backwards as proof that the 2002 design was
brilliant.

---

## 7. Simulator state

`data/simulator-params.json` is the build spec for **both** engines. Its scope was widened in the R4
remediation cycle. It originally covered the auction engine only. That left every distribution
claim, example and break with no covering scenario. It also left chapter 09, which runs on the
capture attribution, with no simulator support at all. The distribution block came from
`mechanism-distribution-notes.md` section 6, which had already specified the variables and the
D1-D9 scenarios.

| | Auction | Distribution |
|---|---|---|
| Scenarios | `sc-01` .. `sc-10` | `D1` .. `D11` |
| Variables | 21 | 19 |
| Claim coverage | C1-C6, all covered | all 31 `mech-*` IDs mapped; the unmappable ones carry an explicit NOT SIMULATED reason |
| Break coverage | 6 of 7; `brk-collusion-surface` NOT SIMULATED with a reason | 7 of 9; B6 and B8 NOT SIMULATED with reasons |
| Examples covered | ex-1..ex-7, break-1, break-2 by `example_ref`; break-3 through `break_coverage` (`brk-revenue-equivalence` to sc-06) | X1-X10, all ten by `example_ref` |
| Required panel | `sc-06-first-price-bid-shading-panel` | `D7-capture-attribution` (chapter 09's spine) |

Four rules the build must not lose:

1. **The two halves never share an axis.** The auction panels are per-1,000-impression figures on an
   invented cast; the distribution panels are filed dollars. Mixing them is the denominator error in
   section 3 with a chart attached.
2. **`bidder_mode` is always visible** wherever a GSP revenue number appears. Without it the number
   is a point inside a 1.727x band.
3. **The take rate is an auction outcome, not a design parameter** (break B4). It rose 9% to 24.7%
   and then *fell back* to 21.3% with competition for members. A slider that implies the seller set
   it gets the era backwards.
4. **`gamma` and `advertiser_pool_elasticity` carry permanent labels** — assumed and unmeasured
   respectively. Neither has ever had a public value.

---

## 8. Handoff to the chapters

**Chapter 07, the auction (centrepiece).** Run the twin engine in order: yield first, because it
sets the budget; then volume, because it spends it; then the capture-attribution verdict as the
chapter's refusal to pick a side. The Overture post-mortem belongs to the volume engine — the
pure-bid auction is not what lost. The three findings the auction analyst flagged as arguing against
the brief all belong here, in particular that the revenue gain from quality weighting is volume and
not price: average price per click *falls* 42% while revenue rises 87%. Any retelling that says
quality weighting let Google charge more per click has the sign backwards.

**Chapter 08, the machine market.** The death coda, both halves. Display went to first price for
transparency under header-bidding pressure; search went to rGSP for revenue. **Do not merge the two
2019 changes** — this is the most common factual error in retellings of that year and both engines
flag it. Alongside it, the distribution instrument scaling 40-fold into a finding of illegality that
left the payments standing: the September 2025 remedy barred exclusivity and capped terms at one
year, and that is all it did.

**Chapter 09, the capture question.** `mech-capture-001..003` and the W1-W5 weights are the
quantitative spine of the capture-versus-expansion thread. The 2008 classified anchor
(`mech-classified-001`) links this file to the ad/GDP argument. Carry the verdict as bounded, carry
the split as a band, and carry T2 as the stated limit of what the evidence can decide.

---

## 9. Verification state

- `mechanism.json` parses; both engines present under `engines.auction` and `engines.distribution`,
  plus `reconciliation`.
- `python3 tools/verify_p2.py r4-coverage` — exit 0. Auction designs `pure_bid` / `gsp` /
  `first_price_shading` and demonstrations `gsp_not_truthful` / `rgsp_coda` present; distribution
  components `aol_2002` / `tac_series` / `network_share` / `default_payments` / `mehta_findings`
  present and non-empty.
- `python3 tools/verify_p2.py r4-arithmetic` — exit 0. Every stored `{expr, expected}` step in the
  merged file re-evaluates, including the 123 auction steps, the 81 distribution steps and the 5
  reconciliation steps.
- `python3 tools/verify_p2.py r4-claims` — exit 0. All 45 distinct calibration objects pass
  `check_claim`; no object carries both `illustrative: true` and a calibration.
- `reconciliation.contradictions` is empty, tested against the nine-row shared-facts table rather
  than asserted.
- `simulator-params.json` parses; 40 variables each with type, range, default, description and unit;
  21 scenarios each with `demonstrates`, `example_ref`, `settings` and a non-trivial
  `expected_output`; no scenario references an undeclared variable.
