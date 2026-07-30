# Era 7 — "The Machine Market" (2008–2026) — working notes and source log

Agent: market-era-historian (R1 fan-out). Data freeze: **2026-06-30**. No claim carries an `as_of` after that date.
Record: `p2-ad-market/data/eras/era-7.json`.

## 1. Scope statement

Inside my period: the industrialization of the ad auction (RTB/programmatic 2008→), the mobile shift, the header-bidding
break of the waterfall (~2014–15), the end of GSP (unified first-price 2019; rGSP + pricing knobs disclosed 2023–24),
the privacy shocks (GDPR 2018, ATT 2021, the cookie-deprecation saga 2020–25), the concentration arc from duopoly to
triopoly-plus retail media, the antitrust endgame (Mehta liability Aug 2024 / remedies Sept 2025; Brinkema ad-tech
liability Apr 2025), and the AI beats (AI Overviews May 2024, Perplexity ads Nov 2024→Feb 2026, Meta AI conversation
targeting Dec 2025, ChatGPT ads Jan–Feb 2026).

Left to siblings: everything about how the quality-weighted second-price auction was *built* (era 6 owns AdWords Select,
AdSense, the AOL 2002 syndication deal, the Overture post-mortem); the pre-2008 measurement institutions (ABC, Nielsen,
Hooper) except where era 7 breaks them; and any post-2026-06-30 development, which is a P3 pointer only.

## 2. Seed-gap obligations (from `planning/unknown-unknowns-probe.json`, gaps whose `affected_eras` include 7)

| # | Severity | Gap | Where it lands in my record |
|---|---|---|---|
| 0 | blocking | Classifieds absent | SCALE.by_money_type.classified + MEDIUM claim on the classified residue; era-7 classified money is marketplace/listings money, not newspaper lineage |
| 1 / 8 | major | brand vs DR vs local money axis | SCALE.by_money_type and BUYERS.by_money_type, all four keys |
| 2 | major | Yellow Pages / directories | MEDIUM (directory collapse to ~$1B) + SCALE money-type notes |
| 4 | major | agency structural arc | CREATORS (holdco consolidation, in-housing, principal media, Omnicom–IPG) |
| 5 | major | below-the-line / co-op → retail media | BUYERS + SELLERS: retail media framed as co-op/trade money changing pricing mechanism |
| 6 | blocking | ad/GDP contested | SCALE: ad/GDP claim with the Silk & Berndt caveat, wide CI, boundary_notes |
| 9 | blocking | MEASUREMENT as its own field | MEASUREMENT field (schema v2 already adds it) |
| 10 | blocking | 2007 series seam | boundary_notes + SCALE: IAB/PwC is the era-7 spine; Coen ends 2007 |
| 11 | major | regulatory layer | EVENTS: GDPR 2018, ATT 2021 (platform rule, not law), CCPA 2020, antitrust rulings |
| 12 | major | seller became the auditor | MEASUREMENT: Facebook metrics 2016/$40M, Nielsen MRC 2021, MFA/ANA 2023 |
| 13/14 | minor | audience commodity / who pays the measurer | MEASUREMENT summary |
| 15 | minor | 15% commission's death | CREATORS + PRICING (principal media, ANA/K2 2016) |

Design gaps (16–20) are for the design grill, not this record.

## 3. Source log (running)

### A-grade primaries pulled directly

- **IAB / PwC Internet Advertising Revenue Report, Full-Year 2025** (published 2026-04-16; PDF pulled and text-extracted).
  https://www.iab.com/wp-content/uploads/2026/04/IAB_PwC_Internet_Ad_Revenue_Report_Full_Year_2025_April_2026.pdf
  - Total US internet ad revenue **2025 = $294,593M**, +13.9% YoY; 2024 = $258,571M; 2023 = $224,954M; 2022 = $209,728M;
    2021 = $189,310M; 2020 = $139,828M; 2019 = $124,613M; 2018 = $107,487M; 2017 = $88,266M; 2016 = $72,640M;
    2015 = $59,551M; 2014 = $49,451M; 2013 = $42,781M; 2012 = $36,572M; 2011 = $31,736M; 2010 = $26,041M;
    2009 = $22,661M (−3%, the only down year); **2008 = $23,448M** (+11%). (Historical data findings, pp.36–37.)
  - 2025 by format: Search $114.2B (38.8% share), Display $81.6B, Digital video $78.0B, Digital audio $8.4B,
    **Other (classified + directories + lead generation) $12.5B (4.2% share)**. (p.21–22.)
  - Programmatic (ex-search) **$162.4B** (+20.5%); non-programmatic ex-search $18.0B (−13.9%). → programmatic is
    **90.0%** of non-search digital in 2025. (p.25.)
  - Social media $117.7B (+32.6%); Commerce media $63.4B (+18.0%); Podcast $2,862.2M (+17.6%). (pp.24, 26, 27.)
  - **Revenue concentration: top-10 companies = 84.1% of US internet ad revenue in 2025** (78.6% 2021, 76.8% 2022,
    79.8% 2023, 80.8% 2024); ranks 11–25 = 8.3%; all others = 7.5%. (p.20.)
  - Creator advertising ≈ $37B in 2025, projected $44B in 2026 (report body, p.14).
  - Non-digital comparison (PwC E&M Outlook): 2025 TV advertising −13.4%; newspaper+consumer magazine −3.5%;
    OOH +2.2%; music/radio/podcast +1.3%; B2B +3.1%; video games & esports +22.0%. (p.28.)

- **US v. Google (search), Mem. Op., Case 1:20-cv-03010-APM, Doc. 1033, filed 2024-08-05** (Judge Amit Mehta).
  Pulled full text from CourtListener RECAP.
  https://storage.courtlistener.com/recap/gov.uscourts.dcd.223205/gov.uscourts.dcd.223205.1033.0.pdf
  - FOF ¶23–24: Google share of general search queries **89.2% (2020)**, up from 80%; **94.9% on mobile**.
  - Conclusions p.189: Google's **general search text ads market share 88% in 2020**, up from 80% in 2016.
  - FOF ¶52 & ¶55: in 2020 Google spent **$8.4B to operate its search engine** (ex-revenue-share) and
    **$11.1B to operate its search ads business**. Bing's total search ad revenue in 2020 = $7.7B.
  - FOF ¶243–258 "Pricing Knobs": three knobs — **squashing** ("Butternut Squash"), **format pricing**, and
    **rGSP (randomized generalized second-price, launched 2019)**. Google internally called these "intentional pricing."
    Format pricing had grown to ≈**20% of Google's text-ads RPM** before rGSP replaced it. rGSP pre-launch experiments:
    **+5.91% CPC** on top-slot non-navigational queries on PC/tablet, **+4.85%** on mobile, with a 40–50% long-term
    stickage factor; a **+5.74% revenue gain persisted two months post-launch**. Feb 2020 rGSP "tuning point" ≈ 3.7
    (top bidder would need to bid 370% more than the runner-up to hold position). **Advertisers cannot opt out of rGSP.**
    Format-price experiments launched at **+15%** and retained ~50% of the gain long-term ("stickage").
    "Stateful Pricing" was scoped at "over $6 billion in short term incremental annual revenue in headroom."
  - Default payments: Google paid **$26.3B in revenue share in 2021**.
  - Court found Google "has exercised its monopoly power by charging supracompetitive prices for general search text ads."

- **Alphabet Inc. Form 10-K, FY2025** (filed Feb 2026), pulled from EDGAR.
  https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm
  - Revenues by type ($M): Google Search & other **224,532** (2024: 198,084); YouTube ads **40,367** (36,147);
    Google Network **29,792** (30,359); **Google advertising total 294,691** (264,590); Google subscriptions/platforms/
    devices 48,030; Google Services total 342,721; Google Cloud 58,705; **Total Alphabet revenues 402,836** (350,018).
  - **TAC $59,926M in 2025** (54,900 in 2024); **TAC rate 20.3%** (20.7% in 2024).
  - Segment operating income: Google Services **$139,404M** (2024: 121,263) → Google Services operating margin
    **40.7%** in 2025. Total income from operations $129,039M on $402,836M = 32.0%.
  - Monetization metrics 2024→2025: **paid clicks +6%**, **cost-per-click +7%**; Google Network impressions −7%,
    cost-per-impression +7%.
  - Geography: United States = **48% of Alphabet revenues** in 2025 (49% in 2024).

- **Meta Platforms, Q4 & FY2025 results** (2026-01/02). https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Fourth-Quarter-and-Full-Year-2025-Results/default.aspx
  - FY2025 total revenue **$200.97B**; **advertising revenue $196.18B** (2024: $160.63B), +22%.
  - **Ad impressions +12%; average price per ad +9%** (FY2025 vs FY2024). Operating income $83.28B, margin 41%.
  - Family daily active people 3.58B (Dec 2025).

- **Amazon Q4/FY2025 results**: advertising services revenue **$68.63B in 2025** (2024: $56.22B), +22%.
  https://www.sec.gov/Archives/edgar/data/1018724/000101872426000002/amzn-20251231xex991.htm (per Marketing Dive
  summary: https://www.marketingdive.com/news/amazon-annual-ad-revenue-passes-68b-boosted-by-full-funnel-strategy/811569/)

### B-grade named reporting / industry studies

- Google Ad Manager first-price auction: announced **March 2019**; unified pricing rules from **May–Aug 2019**;
  full rollout announced **2019-09-05**. https://blog.google/products/admanager/rolling-out-first-price-auctions-google-ad-manager-partners/
- Dischler testimony (Sept 2023): Google "tunes" auctions, price moves ~5% on average and up to 10% on some queries,
  to hit quarterly revenue targets set by the CFO; advertisers are not told.
  https://searchengineland.com/google-quietly-increases-ad-prices-targets-432155 ; Bloomberg 2023-09-18.
- Header bidding: term/technique emerges 2014, goes mainstream 2015; **Prebid.js created early 2015 by Matt Kendall
  and Paul Yang at AppNexus** with Nick Jacob (Aplus); AdExchanger's "The Rise Of 'Header Bidding' And The End Of The
  Publisher Waterfall" (2015) is the canonical trade-press marker. https://docs.prebid.org/about.html
- ISBA/PwC Programmatic Supply Chain Transparency Study (May 2020): **51% of advertiser spend reached the publisher**;
  **15% "unknown delta"** unattributable to any supply-chain participant; only 12% of impressions traceable end-to-end.
  https://www.isba.org.uk/system/files/media/documents/2020-12/executive-summary-programmatic-supply-chain-transparency-study.pdf
  (server 500 on direct fetch; figures via Marketing Week / The Drum / Digiday / WFA summaries).
- ANA Programmatic Media Supply Chain Transparency Study (June + Dec 2023): of a $88B open-web programmatic pool,
  **~$20B (23%) wasted**; the December full report puts **~36 cents of each DSP dollar reaching the consumer** and
  **$22B of recoverable efficiency**; MFA sites were ~two-thirds of the identified waste (15% of spend).
  https://www.ana.net/content/show/id/pr-2023-06-programmaticstudy
- Google's own fee disclosure (June 2020): publishers keep **~69 cents** of each advertiser dollar when both ends are
  Google (Google Ads ~14%, DV360 ~13%, Google Ad Manager ~18% of the publisher side); ~95% when sold direct in GAM.
  https://blog.google/products/admanager/display-buying-share-revenue-publishers/
- DOJ ad-tech complaint / trial: **AdX take rate 20% since 2009**, roughly double rival exchanges; DOJ alleged Google
  keeps **at least 35 cents of every open-web display dollar**.
- **Brinkema liability opinion, 2025-04-17** (E.D. Va.): Google unlawfully monopolized the open-web display
  **publisher ad server** and **ad exchange** markets and unlawfully tied them. Remedies trial ran Sept 2025;
  **no remedies order had issued as of the 2026-06-30 freeze** — flag as open.
- **Mehta remedies opinion, 2025-09-02**: no Chrome divestiture; exclusive default deals barred; mandated syndication/
  data sharing with qualified competitors; payments for (non-exclusive) defaults still allowed. Mehta wrote that the
  emergence of generative AI "changed the course of this case."
- ATT: iOS 14.5 shipped **2021-04-26**. Meta CFO Dave Wehner (2022-02-02): ATT is "on the order of **$10 billion**" of
  2022 headwind. https://www.cnbc.com/2022/02/02/facebook-says-apple-ios-privacy-change-will-cost-10-billion-this-year.html
  Third-party estimates of the same effect run to $12.8B (Lotame). Opt-in rates ~16% (May 2021) rising to ~25% (mid-2022).
- GDPR effective **2018-05-25**. Measured effects are contested: Wang/Jiang/Yang (JMR 2024) find −2.1% CTR and
  −5.7% revenue-per-click at a large publisher; Goldberg/Johnson/Shriver find ~−10% recorded pageviews and revenue for
  EU users; Digiday's 2019 publisher survey found no aggregate programmatic revenue decline. Keep the conflict visible.
- Cookie saga: announced **Jan 2020** (phase out "within two years"); delayed 2021 → 2023 → 2024; **2024-07-22** Google
  says it will not unilaterally deprecate and will instead offer a choice prompt; **April 2025** Google drops even the
  standalone prompt. Third-party cookies survive the era.
- Pew Research Center, 2025-07-22: on visits where an AI summary appeared, users clicked a result link on **8%** of
  visits vs **15%** without; only **1%** clicked a source cited inside the summary. n = 900 US adults, 68,879 searches,
  March 2025. https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/
  Google disputes the methodology.
- AI Overviews launched **2024-05-14** (Google I/O); ads inside AI Overviews rolled out to US mobile in Oct 2024;
  AI Overviews at **2B+ monthly users** by July 2025; Google CBO Philipp Schindler said AI Overviews "monetize at
  approximately the same rate" as classic search.
- Perplexity: sponsored follow-up questions launched **2024-11-12** with Indeed, Whole Foods, Universal McCann, PMG;
  ad sales head left Aug 2025; new advertisers paused Oct 2025; **ads abandoned Feb 2026**, subscription/enterprise only.
  Reported ad revenue ≈$20k of ~$34M 2024 revenue (<0.1%).
- Meta AI conversation targeting: announced **2025-10-01**, effective **2025-12-16**; no opt-out; excludes EU/UK/S. Korea
  and sensitive categories.
- OpenAI: ads announced **2026-01-16**, pilot live **2026-02-09**, US only, logged-in adults, Free and Go ($8/mo) tiers;
  Plus/Pro/Business/Enterprise stay ad-free.
- MAGNA (June 2025): US media-owner ad revenue **$398B in 2025** (+4.6%), of which digital ~$293B; global **$979B**;
  2026 forecast global >$1T, US >$400B. eMarketer's competing US total for 2025 is **$422B** — definitional conflict,
  keep both.
- eMarketer (Dec 2025): US retail media ad spend **$60.32B in 2025**, $71.09B forecast 2026; Amazon ≈79.7% of US
  retail media; Amazon $56.71B forecast 2026 vs Walmart $5.99B.
- Yellow Pages/directory: peak $14.7B (2005) → ~$3.2B (2015) → ~$1.1B (2024) [trade sources, C/B grade — weak].
- Newspaper: print ad revenue $73.2B (2000) → ~$6B (2023); help-wanted classified $8.7B → $723M within a decade of 2000.

## 4. Judgment calls and open items

- **Series spine.** Era 7 uses IAB/PwC for the digital half (it is the only continuous 1996→2025 US digital series) and
  MAGNA/eMarketer for the all-media total. Coen/McCann ends in 2007, so the era-6/7 boundary is a real seam; recorded in
  `boundary_notes` and flagged for R2.
- **Money-type split is not natively published for era 7.** No modern source splits US spend into
  national-brand/local-retail/classified/direct-response the way Coen did. All four keys are therefore built (grade C)
  with an explicit method, anchored on published sub-totals (retail media, search, social DR share, local ad spend
  forecasts, marketplace-listing revenues).
- **Ad tech remedies** (Brinkema) had not issued by the freeze. Recorded as an open item, not an event.
- No number in this record comes from the Acquired or Stratechery podcasts.

## 5. Field-by-field findings and claim inventory

Record written to `p2-ad-market/data/eras/era-7.json`. 66 calibrated claims. Counts by field:

| Field | Claims | Notes |
|---|---|---|
| CREATORS | 4 | e7-creators-001..004. Agency arc (holdco consolidation, in-housing, principal media), platform-as-creator, creator economy. |
| BUYERS | 8 | e7-buyers-001..004 plus 005..008 for the money-type split. Marginal new buyer class = the algorithmic buyer. |
| SELLERS | 7 | e7-sellers-001..007. Concentration, the three platform revenue lines, take rate, TAC, retail media. |
| MEDIUM | 7 | e7-medium-001..007. Digital share, mobile share, format split, CTV, directories, podcast. |
| SCALE | 9 | e7-scale-001..005 plus 006..009 for the money-type split. |
| PRICING | 8 | e7-pricing-001..008. The auction death sequence plus the take-rate stack. |
| MEASUREMENT | 5 | e7-measurement-001..005. |
| TARGETING | 5 | e7-targeting-001..005. |
| EVENTS | 10 events, 6 carrying claims | e7-events-001, 002, 006, 007, 008, 009. |
| unit_economics | 7 | e7-unit_econ-001 (revenue/query), 002 (cost to serve), 003 (margin), 004..007 (the 2023-2026 LLM series). |

Grades: A = 20, B = 30, C = 16. Every grade-C claim carries a `method` string. No claim has an `as_of` after 2026-06-30.

### Field notes

**CREATORS.** The commission's death (seed gap 15) is carried in the summary and in the ANA in-house claim rather than
as its own number, because the ANA/K2 2016 rebate report is qualitative — it documents pervasive undisclosed rebates
without a dollar total. Principal media is the successor mechanism; ANA's March 2026 study says governance is lagging
adoption. Deliberate omission: no attempt to size AI-generated creative as a share of all creative, because no credible
US-wide figure exists.

**BUYERS.** The retail-media beat is written as co-op/trade money changing pricing mechanism, per seed gap 5, not as a
new category. Below-the-line trade promotion itself is out of the measured-media boundary and is stated as such rather
than estimated — an explicit scope limit inherited from the SCALE definition.

**SELLERS.** Kept the two antitrust rulings distinct: Mehta (search + search text ads, D.D.C.) and Brinkema (open-web
publisher ad server + ad exchange, E.D. Va.). Both liability; only Mehta has a remedies order inside the freeze.

**MEDIUM.** The classified/directory/direct-mail obligation (seed gaps 0 and 2) is met with three separate handles:
IAB's "Other" bucket ($12.5B, which its own endnote defines as classifieds + directories + lead generation), the
directory series ($14.7B 2005 peak to ~$1.1B 2024, grade C because no audited series survives), and USPS Marketing Mail
volume (99B pieces FY2008 to 56.8B FY2025).

**SCALE.** Two conflicts kept visible rather than averaged: US 2025 total ($398B MAGNA vs $422B eMarketer, ci80
390-425) and global 2025 ($979B MAGNA vs $1.14T WPP Media, ci80 960-1160). Ad/GDP is graded C and carries the Silk &
Berndt caveat in both the method string and `boundary_notes`.

**PRICING.** The strongest evidence in the whole record. The Mehta opinion's findings of fact (paras 243-258) are a
primary source for squashing, format pricing and rGSP, with internal Google exhibit numbers cited. Worth handing to R4
(mechanism deep-dive) verbatim: the rGSP "tuning point" of 3.7 is the single cleanest number for showing how far the
auction moved from truthful second price.

**MEASUREMENT.** Answers seed gaps 9, 12, 13 and 14. The "seller became the auditor" thesis is carried by the Facebook
2016/2019 and Nielsen 2021/2023 pairs; "who pays the counter" is answered in the summary.

**TARGETING.** The cookie saga is recorded as a non-event with an outcome: the third-party cookie survives the era.
That is the honest finding and it matters for P3.

## 6. Absence notes and deliberate gaps

- **No money-type split exists in any published modern US series.** Coen classified all eleven media national vs local
  and stopped in 2007; MAGNA publishes a Direct/National/Local typology but not at a public line-item level. All eight
  money-type claims (four in SCALE, four in BUYERS) are therefore triangulated, grade C, each with a two-path method and
  intervals wide enough to contain the disagreement. This is a flagged gap, not a solved field.
- **US directory advertising has no audited series after 2007.** Grade C with a 0.7-2.0 interval on a ~$1.1B central.
- **Below-the-line trade promotion and co-op are outside the measured-media boundary** and are not estimated. Stated in
  the SCALE and BUYERS summaries so that retail media is not mistaken for wholly new money.
- **Ad-fraud dollar totals were researched and then dropped.** Published estimates for 2025 ranged from $63B to $120B
  globally with no shared methodology; instead the record uses the ANA study (36 cents of a DSP dollar reaching a
  consumer; 15% of spend to made-for-advertising sites) and the IAB bot-traffic figure, which are method-transparent.
- **Advertiser counts for Google** are not published; only Meta's ">10 million active advertisers" is on the record.

## 7. Constraint check

| Constraint | Status |
|---|---|
| AdWords Oct 2000 CPM; auction at AdWords Select Feb 2002 | Not touched. Era 6 owns it; era 7 does not restate it. |
| Overture led paid search through 2002; ~2.7M shares settlement | Not touched. |
| Radio was never the #1 US medium by spend | Not contradicted; era 7 makes no radio-primacy claim. |
| "Out of Home" replaced "Billboards" in 2000 at ~3x expenditure | Not touched; era 7 reports OOH only as a 2025 growth rate. |
| Wanamaker quote / first banner ad are attributed legend | Neither appears in the record. |
| Classifieds, directories, direct mail tracked in EVERY era | Done: MEDIUM claims 006 and the USPS volume claim; SCALE/BUYERS classified keys; summaries in MEDIUM, SCALE, BUYERS. |
| Data freeze 2026-06-30 | Enforced programmatically; max `as_of` in the record is 2026-06. Post-freeze items listed in `boundary_notes` as P3 pointers. |
| No Acquired / Stratechery sourcing | Enforced. Neither appears in any source list. |

**No constraint conflicts found.** One near-miss worth flagging to the parent: the era-6 boundary number for US internet
ad revenue must be $21,206M for 2007 (IAB/PwC) — if era 6 uses a different source for the same quantity, V1 will see a
disagreement that is a series problem, not a fact problem.

## 8. Handoffs

- **To R2 (dataset):** the full IAB/PwC US internet ad revenue series 2008-2025 is transcribed in section 3 above and
  can be lifted straight into `adspend.json` under an `iab_pwc` series tag. The 2007/2008 Coen-to-IAB seam needs a
  concordance entry. MAGNA and eMarketer US totals disagree by $24B for the same year and need separate series tags.
- **To R4 (mechanism):** the Mehta findings of fact paras 243-258 are the primary text for the auction's death coda
  (squashing / format pricing / rGSP, with the 3.7 tuning point, the +5.91%/+4.85% CPC uplifts and the 20%-of-RPM
  format-pricing share). The first-price/bid-shading simulator panel should be parameterised off the 2019-09-05 Ad
  Manager rollout.
- **To P3:** `unit_economics.comparison_series` is the intended input. The headline comparison it supports is that one
  machine-written answer cost roughly the whole ad revenue of a search query in 2023 and roughly 0.5% of it by 2026 —
  with the caveat, stated in the method, that reasoning models re-inflate per-answer cost by emitting far more tokens.
