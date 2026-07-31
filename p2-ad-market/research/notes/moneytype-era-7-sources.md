# Era 7 money-type source hunt — assessment notes

Agent: series-archaeologist (R2b). Hunt date: **2026-07-30**. Data freeze respected: **2026-06-30**.
Record: `p2-ad-market/data/moneytype/sources-era-7.json`.

Scope: find out whether any credible source publishes the US national_brand / local_retail / classified /
direct_response split for 2008–2026, in whole or in part. **Source hunt only. No estimate was made.**
Every number in the JSON is a published figure, copied down. It is there as proof that a source exists, and
to fix what that source says.

---

## 1. Headline

The era-7 record's absence note says this: *"No money-type split exists in any published modern US
series."* It is **wrong for classified. It is loose for local_retail.**

1. **Classified is sourceable.** The US Census Bureau's Service Annual Survey publishes a **classified
   advertising** revenue line for newspaper publishers (NAICS 511110). It runs 2005 to 2021. It is free,
   grade A, and independent of every series in `adspend.json`. It reads **$8,087M in 2008** and **$1,978M in
   2021**. A directory line (NAICS 511140) runs 2005–2020. IAB's own classifieds line covers the digital leg
   to 2021. Three independent legs. None of them used.
2. **local_retail is not measuring what the record thinks.** BIA defines "local" as *all media generating
   revenue by selling access to local audiences to all types of advertisers, **including national and
   regional companies** and SMBs*. Read that twice. That is inventory geography, not buyer class. BIA does publish a
   national / regional / SMB buyer cut, and that cut **is** the money type. It sits behind a paywall. The
   last free version (BIA/Kelsey, 2015) put SMB at **35.9%** of the local total. The era-7 record uses all
   of BIA's local number as the local_retail pool.
3. **national_brand and direct_response stay unsourced as pools.** Fragments exist. Whole-market numbers do
   not, in any year, from any compiler, free or paid. The one exception sits inside MAGNA's licensed MG8.
   Its Direct/National/Local taxonomy is described in the academic literature, but never published at
   line-item level.

---

## 2. Inventory: 23 candidate sources assessed

| # | Source | Pools | Years | Access | Independent? |
|---|---|---|---|---|---|
| s7-01 | **Census SAS — newspaper classified vs all-other advertising** | classified | 2005–2021 | free | yes |
| s7-02 | **Census SAS — broadcast national/regional vs local air time** | national_brand, local_retail | 2005–2010 | free | yes |
| s7-03 | **Census SAS — directory publishers advertising space** | classified | 2005–2020 | free | yes |
| s7-04 | IAB/PwC — revenues by pricing model (perf/CPM/hybrid) | direct_response | 2004–2019 | free | no (same survey as `iab_pwc`) |
| s7-05 | IAB/PwC — classifieds format line | classified | 1998–2021 | free | no (same survey) |
| s7-06 | NAA — national/retail/classified | 3 pools | 1950–2012 | free | no (Coen's newspaper line *is* NAA) |
| s7-07 | **BIA — local forecast, national/regional/SMB buyer cut** | local_retail | 2008–2026 | **paywalled** | yes |
| s7-08 | MAGNA — Direct/National/Local typology inside MG8 | 3 pools | 1980–2026 | **licensed** | no (already stitched) |
| s7-09 | **Guideline / SMI — agency billing data** | national_brand | 2010–2026 | **licensed** | yes |
| s7-10 | MediaRadar (ex-Vivvix, ex-Kantar) — monitored spend | national_brand, local_retail | 2008–2026 | **licensed** | yes |
| s7-11 | **AIM Group — Marketplaces / Classified Intelligence Report** | classified | 2008–2026 | **paywalled** | yes |
| s7-12 | DMA / IHS Global Insight — *Power of Direct Marketing* | direct_response | 1999–2013 | **lost** | yes |
| s7-13 | Winterberry Group — annual Outlook | direct_response | 2010–2026 | free summaries | no (re-aggregator) |
| s7-14 | USPS RPW / PRC compliance reports | direct_response | 2008–2026 | free | yes |
| s7-15 | RAB / Miller Kaplan — radio local vs national spot | national_brand, local_retail | 2008–2021 | free summaries | yes |
| s7-16 | TVB — TV local spot vs national spot | national_brand, local_retail | 2008–2026 | **paywalled** | yes |
| s7-17 | Borrell Associates — Compass | local_retail, national_brand | 2008–2026 | **licensed** | yes |
| s7-18 | PwC Global E&M Outlook — classified sub-segment | classified | 2008–2030 | **licensed** | no (PwC runs the IAB survey) |
| s7-19 | EMARKETER — brand vs DR buyer survey | national_brand, direct_response | 2021–2022 | **paywalled** | yes |
| s7-20 | WARC / Ebiquity — brand vs performance budget share | national_brand, direct_response | 2023–2024 | free summaries | yes |
| s7-21 | BLS PPI — advertising space/time by type | none (deflators) | 2008–2026 | free | yes |
| s7-22 | Census SAS — online advertising space (NAICS 519130) | none (cross-check) | 2005–2022 | free | yes |
| s7-23 | Statista DMO + syndicated classified reports | classified | 2018–2034 | licensed | **rejected** |

Roles: 11 stitch-candidate, 5 cross-check-only, 7 context. Access: 9 free, 4 paywalled, 6 licensed, 1 lost.
Three more are split: free summary, gated full report.

---

## 3. What each pool can and cannot get

### classified — **SOURCED**

Three separate A-grade legs. All free. None in use:

| Year | Census newspaper classified | Census directory advertising | IAB digital classifieds |
|---|---|---|---|
| 2008 | $8,087M | $11,400M | $3,200M |
| 2013 | $3,638M | — | $2,600M |
| 2019 | $2,398M | $1,618M | ~$3.8B (HY $1.9B) |
| 2021 | $1,978M | S (suppressed) | $5,300M |
| 2022+ | S | S | merged into "Other" |

Overlap test, in the one shared year. NAA 2011 classified: $5,030M. Census 2011: $4,840M. A **3.9% gap**,
well inside the 15% tolerance. The two are separate counts: a trade-group census of members against
a government random sample. It is a real match, and the project has never had one for classified.

Still missing: reference years 2022–2026 on every leg. Also missing in every year is the
**marketplace/listings leg** — recruitment, auto and real-estate portals, the heir to the classified page.
One specialist house covers it, AIM Group, and it is paid.

### local_retail — **NOT SOURCED AS A MONEY TYPE**

The finding here is about definition, not access. BIA's free 2022 brochure prints its per-medium
definitions. Every one reads the same way: "revenues generated by local *X* for sale of time to **either national or
local advertisers**." Its digital PC/Laptop line adds that it "includes search, display and
**classified/vertical advertising**."

So BIA's $169B:

- includes national brands buying local inventory, and
- includes classified money that the classified pool also counts.

BIA's buyer-type cut is the money type, and it is paywalled. The one free point is 2015: SMB $50.4B of a
$140.7B local total, or 35.9%. On that reading the local_retail pool is about a third of the number the
record uses. At 2025 scale the gap is on the order of $100B.

BIA gives away one useful parameter: **direct mail splits national/local 90/10** in its model. That bears on
the verifier's note that the era-7 residual is held down by uneven direct-mail treatment.

### national_brand — **PART-SOURCED, 2008–2010 ONLY**

Census SAS published national/regional vs local air time for radio and TV through reference year 2010, then
collapsed it to one line. I checked the files myself. The 2010 vintage has both lines. The 2013 vintage has
"National/regional/local air time" only.

| Medium | 2008 national/regional | 2008 local |
|---|---|---|
| Television broadcasting (51512) | $17,779M | $10,899M |
| Radio stations (515112) | $3,139M | $8,851M |

After 2010, nothing free covers the whole market. Two tools exist and both are licensed. One is **Guideline
/ SMI** — real agency billing data, sold as up to 95% of US national brand ad spend. The other is **MAGNA's
National domain**.

SMI has a blind spot that widens every year of era 7. It sees only agency-booked money. But the era's story
is money leaving agencies for in-house teams and self-serve platforms. The record's own e7-creators-002 says
82% of ANA members had an in-house agency by 2023.

### direct_response — **NOT SOURCED AS A POOL**

The one genuine find is that IAB **published** the number the era-7 method assumes. The record's method says
"two-thirds of $294.6B digital is performance-priced." IAB's dropped pricing-model exhibit gives:

| 2008 | 2010 | 2012 | 2015 | 2017 | HY2019 |
|---|---|---|---|---|---|
| 57% | 62% | 66% | — | 62% | 62.1% |

So for 2008–2019 that is a found number, not a built one. For 2020–2026 it is an extrapolation across seven
unmeasured years. Those years hold Performance Max, Advantage+ and the rise of retail media. Grade and bound
it as an extrapolation. Do not carry it as if it were still measured.

The only source that ever sized the pool itself is dead. DMA/IHS Global Insight's *Power of Direct
Marketing* put US direct-marketing ad expenditure at **$153.3B in 2010 — 54.2% of all US ad expenditure**.
The record says 32%. Neither side is wrong: DMA counted direct-response spend in every medium, including
catalogue and telemarketing, on a wider denominator. It bounds the pool from above. Per the rigor spec, that
conflict widens the interval. It is not averaged in.

---

## 4. The definition problem is worse than the record says

The R2 forecast panel warned that retail media and search must never be summed. That warning applies to the
era-7 record itself, not just to the forecasts.

IAB/PwC's FY2025 **format partition sums to the total**:

```
search 114.2 + display 81.6 + digital video 78.0 + digital audio 8.4 + other 12.5 = 294.7
IAB total US internet ad revenue 2025                                             = 294.593
```

So social media ($117.7B) and commerce media ($63.4B) are **cross-cuts sitting on top of that partition**.
They are not members of it. IAB's own text confirms this. It names commerce media as a main driver of *display* growth and of *search*
growth. And it defines commerce media network ads as retailer-sponsored placements "on their own eCommerce
site or on other sites." A cross-cut, not a format.

The era-7 direct_response method, path (b), computes:

> search $114.2B + commerce media $63.4B + ~70% of social $117.7B

That is **$260B of a $294.6B market before any subtraction**, or 88% of all US digital. It double-counts by
construction. Path (b) is not a second route to path (a). It is an over-count. Under `r2b-val-03`, a method
naming two routes that share inputs names one route.

## 5. The middle two pools still cannot be ranked. Now we can say why.

Before, the answer was "the intervals overlap." The hunt names the cause:

- **local_retail vs classified**: not disjoint. BIA's local total explicitly contains classified/vertical
  advertising. They cannot be ordered until that overlap is removed, which needs the paid product.
- **local_retail vs national_brand**: BIA's local includes national and regional buyers by definition. So
  part of what the record calls local_retail *is* national_brand money.
- **national_brand vs direct_response**: national_brand is the residual left after direct_response is taken
  out. The two move in lockstep, and their order is an artefact of that residual.

All three pairs belong in `unranked_pairs`, and they are recorded there in the JSON with the reason attached.

---

## 6. Dead ends

- **Coen/McCann** is the only all-media national/local partition the US has ever had. It ends at reference
  year 2007, one year before era 7 opens. There is no successor. This one fact is what makes era 7 hard.
- **NAA / News Media Alliance**: category split ends 2012, totals end 2013, never reinstated.
- **IRS SOI**: one aggregate, no money-type axis. **BEA**: advertising as industry and intermediate input,
  no advertiser-type cut. **Economic Census**: the advertising-type detail lives in SAS, not in the
  quinquennial product tables.
- **Academic literature**: I found no dissertation, working paper or book appendix that rebuilds a US
  brand/response or national/local split for any year after 2007. Silk & Berndt (NBER WP 28161;
  *Foundations and Trends in Marketing*, 2021) is the only sustained academic work on US aggregate
  advertising in this period. I downloaded and read both papers. They **show** MAGNA's Direct/National/Local
  taxonomy in a figure. They study totals, media shares and PPI deflators. They publish no money-type
  levels.
- **Platform filings**: no advertiser-type, buyer-size or campaign-objective breakdown in any Alphabet, Meta
  or Amazon 10-K or earnings release.
- **OAAA**: revenue by format and by advertiser category; no national/local split located.
- **Statista Digital Market Outlook and the syndicated classified reports**: they put US classifieds at
  $2.6bn (Statista, 2028) and $8.3bn (syndicated, 2024) for much the same object. IAB's "Other" line for
  2025 is $12.5B. None of them shows a method. **Rejected** — and logged as rejected, so a later step does
  not find them again and take them for evidence.

---

## 7. Licensing warnings

I bought nothing. Nothing paywalled is paraphrased into the dataset as if read. Six sources are logged with
their access state and an empty `values_observed`:

- **Guideline / SMI** — the best available national_brand instrument. Not purchased.
- **BIA advertiser-type cut** — the actual local_retail money type. Not purchased. Only the 2015 free
  decomposition and the free methodology brochure were used.
- **AIM Group Marketplaces Report** — the only compiler covering the classified marketplace leg. Not purchased.
- **MAGNA MG8 Direct/National/Local** — taxonomy recorded from the published academic description only; no
  MAGNA line-item value is transcribed. The project's existing `magna` series is already flagged LICENSED.
- **MediaRadar / Vivvix**, **Borrell Compass**, **TVB research portal**, **PwC E&M Outlook**, **EMARKETER PRO** —
  all inventoried, none accessed.

Free-summary sources (RAB, Winterberry, WARC/Ebiquity) carry only figures that appeared in the free
release or in named trade reporting, and are graded B accordingly.

---

## 8. Judgment calls

1. **No new claim IDs minted.** The rigor spec says new claims continue the era numbering. But the hunt made
   no estimates. Putting 99 transcribed figures in the same ID space as the era's built claims would blur the
   found-vs-built line the project exists to keep. The next free IDs are reserved and named in
   `schema_notes`: `e7-scale-010`, `e7-buyers-009`, `e7-medium-008`.
2. **Grade A on `values_observed` means "the compiler published this."** It does not mean the figure measures
   the money-type pool. Census newspaper classified is grade A *as newspaper classified revenue*. It is one
   leg of the pool, not the pool.
3. **IAB pricing model and IAB classifieds are marked NOT independent** of `iab_pwc`. They are additional axes
   on a series already stitched, not new rails, and must never be used to cross-check the IAB total.
4. **NAA is marked NOT independent** of `coen_mce`, consistent with the existing `coen-naa-newspapers`
   concordance entry. Its value here is the 2011–2012 extension and the 2011 overlap against Census.
5. **MediaRadar and Borrell assigned cross-check-only, not stitch-candidate.** Rate-card monitoring is a third object,
   set beside billings and media-owner revenue. And a checked local number must not come from the same house
   as the stitched one.
6. **Statista and syndicated market-research reports rejected rather than carried at grade C.** A C grade
   requires a documented derivation. Sources that disagree by 4x with no disclosed method have none.
7. **Vintage handling.** Census SAS revises. Newspaper classified 2010 moved $5,706M → $5,285M (−7.4%).
   2013 moved $3,916M → $3,638M (−7.1%). Both readings are logged with their vintage. Neither is quietly
   preferred. A stitch must say which vintage it takes, as the dataset already does for `iab_pwc`.
8. **Two wobbles flagged, not smoothed.** Newspaper classified rises 2018→2019 ($2,291M → $2,398M).
   Directory advertising rises 2019→2020 ($1,618M → $1,781M). Both are sampling noise in a small-cell
   survey. Both are left visible.

---

## 9. Handoff to the reconciler

Four era-7 claim groups are hit. Each is written into `consequences_for_existing_claims` in the JSON, with a
named action.

- `e7-scale-008` / `e7-buyers-007` / `e7-medium-006` (classified, directories): **re-anchor on Census SAS and
  regrade.** Under `r2b-val-03` a pool the hunt sourced must not stay at C. The print legs read roughly double
  the record's assumed values.
- `e7-scale-007` / `e7-buyers-006` (local_retail): **the current central treats an upper bound as a point.**
  Either buy BIA's advertiser-type cut or restate the pool as bounded between the SMB share and the full local
  total, widening downward.
- `e7-scale-009` / `e7-buyers-008` (direct_response): **retire or rebuild path (b)** — it double-counts search,
  commerce media and social. Re-source path (a) on the published IAB pricing-model series for 2008–2019 and
  mark 2020–2026 as extrapolation.
- `e7-scale-006` / `e7-buyers-005` (national_brand): **no source found.** Keep it as a residual and keep it
  grade C. State the direct-mail treatment on both sides of the subtraction. BIA's own 90/10 split is now on
  the record and can be cited for it.

One item goes to the cross-check layer, not the money-type layer. Census SAS "online advertising space"
reads **$239,025M for 2022**. IAB reads **$209,728M**. That is a **14.0% gap** — inside the 15% tolerance,
but close enough to carry as a standing flag.
