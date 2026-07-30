# Era 4 — "Segmentation" (1976–1993) — working notes and source log

Agent: market-era-historian (R1 fan-out). Record: `p2-ad-market/data/eras/era-4.json`.
As-of / research date: 2026-07-30.

## 1. Scope statement

This record covers the US advertising market from 1976 to 1993. In those years cable split
the national TV audience into priced niches. Geodemographic clustering (PRIZM and its rivals)
turned the census into a targeting tool. Direct mail became the largest single *national*
medium. Four listed holding companies bought up the agency business.

Siblings own the rest. Era 3 owns the 30-second spot, the upfront, and Nielsen's demographic
ratings. Era 5 owns the web banner and the CPM's move to digital. Era 6 owns search, the
auction, and self-serve buying. The `boundary_notes` field states the facts I share with
neighbours.

## 2. Method notes and standing caveats

- **Primary series**: the Coen Structured Advertising Expenditure Dataset (Robert J. Coen,
  McCann-Erickson / Universal McCann), downloaded as the original workbook
  `http://www.galbithink.org/cs-ad-dataset.xls` and parsed locally. Every per-medium and
  national/local number in this record is read from that workbook unless stated otherwise.
- **Independent confirmation of the same series**: the DMA *Statistical Fact Book 2001*
  reproduces Coen's tables for 1973–1981 and 1982–1990 verbatim (source line: "Robert J.
  Coen, Universal McCann, 2001"). I checked ~30 cells; all matched the workbook except the
  1990 grand total, which is 129,590 in the 2001 printing and 129,968 in the 2008/2009
  workbook — a 0.3% upward revision. That discrepancy is recorded as a claim
  (`e4-scale-006`) rather than smoothed away.
- **Coen is a list-price series.** Silk & Berndt (NBER WP 28161, pp. 7–9) state the McCann
  estimates were built from "volume" data priced at *rate-card list prices*, not transaction
  prices, and that direct mail, business papers and internet were treated as exclusively
  "national". Everything downstream inherits this. Grades on Coen-derived numbers are
  therefore **B**, never A, even though Census reprinted the series in the Statistical
  Abstract.
- **Coen's "direct mail" is not a media rate.** USPS earned $9.82B of third-class postage
  revenue in FY1993 against Coen's $27.27B of "direct mail" spend — 36%. The remaining ~64%
  is production, lists, letter-shop and creative. This is why Magna's backcast (top-down
  supplier revenue) puts direct mail at ~12% of 1980 spend where Coen puts it at 14.2%. Both
  are cited; the interval is widened rather than averaged (`e4-measurement-005`).
- **Grades**: A = official statistics/filings (Census Bureau, USPS via Statistical Abstract,
  Economic Census). B = credible named reporting or an industry series with a track record
  (Coen/McCann, DMA, ANA tracking studies, Christian Science Monitor 1988, Forbes/Adgate).
  C = numbers I built; every C carries a `method` string.
- No number in this record comes from the Acquired or Stratechery podcasts.

## 3. Seed-gap disposition (from `planning/unknown-unknowns-probe.json`, era 4)

| Gap (severity) | How it is addressed here |
|---|---|
| Classifieds absent (blocking) | Tracked in SCALE and BUYERS `by_money_type`. **No period figure was sourceable** — see §5 dead ends. Recorded as a grade-C triangulation (`e4-scale-009`, `e4-buyers-006`) with the method spelled out and a wide interval. |
| No brand/DR/local money axis (major) | SCALE and BUYERS both carry all four money types; national/local come straight from Coen's own national-vs-local classification. |
| Yellow Pages missing (major) | Tracked as its own medium (`e4-medium-005`, `e4-sellers-004`): $2.9B in 1980 → $9.52B in 1993, larger than radio *and* magazines by 1993, 87% local money, handed to the RBOCs at the 1984 divestiture (event). Note Coen only breaks Yellow Pages out from 1980 — see §5. |
| Direct mail mis-slotted (major) | Handled exactly as the probe recommends: era 4 records the *database upgrade*, not the birth. The record states direct mail was already 14.4% of US spend in 1976 and defers the mail-order/Hopkins lineage to eras 1–2 in `boundary_notes`. |
| Agency structural arc (major) | CREATORS carries establishment counts, billings, income, employment, the commission share of income, and the three holding-company deals. PRICING carries the commission *rate*. |
| Below-the-line invisible (major) | `e4-buyers-004`: trade promotion at 44.9% of packaged-goods marketing-communications budgets by 1992; the record states explicitly that the Coen total is measured media only and excludes trade/consumer promotion. |
| Ad/GDP contested (blocking) | `e4-scale-003` gives the era's path (1.8% → 2.1–2.3%) and names the Silk & Berndt finding that MCE and IRS shares peak in 2000, not during era 4. |
| Splice seams (blocking) | Coen is the only series with per-medium coverage of the whole era; Magna's backcast starts 1980 and disagrees materially on direct mail. Recorded, not merged. |
| MEASUREMENT missing (blocking) | MEASUREMENT is a full field: people meters, scanner/single-source panels, the list-price problem, the Coen–Magna disagreement. |
| Ratings-institution beat per era (major) | The 1987 people-meter switchover is an event **and** three MEASUREMENT claims, written as a repricing event (make-goods, the $150M Saturday-morning exposure, the sample-composition fight). |
| Direct-response measurement lineage (major) | TARGETING and PRICING both carry it: 2% response rates, list rental card rates, cost-per-order arithmetic; the record says plainly that measurable response is the older half of the market, not a digital invention. |
| Audience commodity (minor) | Reflected in the MEASUREMENT and TARGETING summaries (the counting machine makes the commodity); no schema change. |
| 15% commission's death (minor) | PRICING tracks it with the Economic Census rate series — and finds the commission **did not** die in this era (14.13% in 1977, 13.18% in 1992; the collapse to 10.98% happens 1992–97). Recorded as a correction to the received story. |

## 4. Field-by-field findings and source log

### SCALE
- Coen workbook: 1976 total $33,300M; 1993 total $140,956M (4.23×, 8.86% nominal CAGR).
- Galbi's summary page gives ad/GDP: 1.8% (1976), peak 2.3% (1986–89), 2.1% (1993).
- Nominal declines in the whole 1919–2007 Coen series: 1921, 1930–33, 1938, 1942, 1961,
  **1991**, 2001, 2007. So 1991's −1.24% is the first nominal fall since 1961's −0.84%.
  Computed directly from the workbook.
- National vs local 1976: $18,355M / $14,945M (55.1% / 44.9%). 1993: $81,867M / $59,089M
  (58.1% / 41.9%).
- Global: the only 1990-vintage world figure I could reach is a Mediatel *Newsline* item
  (12 Dec 1990) reporting world adspend of **$202bn for the five major media** and **$267bn
  including direct mail and sales promotion**. The article body sits behind an
  Adwanted/Media Leader auth wall; I have the indexed text only, so the claim is graded B
  with a wide interval and flagged here. Sanity check that made me keep it: US five-media
  spend in 1990 (newspapers + magazines + TV + radio + outdoor, Coen) = $78.1B, i.e. 38.7%
  of $202B — consistent with the US being roughly 35–40% of world adspend at the time.
  UNESCO's *A survey of world advertising expenditures in 1990* (unesdoc pf0000094735) is
  the better source; unesdoc is behind Cloudflare and would not serve the PDF.
- Sources: galbithink.org/cs-ad-dataset.xls; galbithink.org/ad-spending.htm;
  DMA *Statistical Fact Book 2001* pp. 11–13; NBER WP 28161.

### MEDIUM
- 1976 shares: newspapers 28.9%, television 20.2%, miscellaneous 19.7%, direct mail 14.4%,
  radio 7.0%, magazines 5.4%, business papers 3.1%, billboards 1.2%, farm 0.3%.
- 1993 shares: television (broadcast + cable) 23.0%, newspapers 22.7%, direct mail 19.3%,
  miscellaneous 13.1%, Yellow Pages 6.8%, radio 6.7%, magazines 5.2%, cable-only 3.2%,
  business papers 2.3%, billboards 0.8%.
- **Newspapers stayed the #1 medium until 1992**, when total television ($31,079M) first
  passed them ($30,737M). Broadcast television alone was still behind newspapers in 1993
  ($28,020M vs $32,025M). This extends the pre-cleared constraint ("newspapers out-earned TV
  deep into the 1950s–70s") by two more decades and is stated precisely so the verifier can
  check which definition is in play.
- Radio's share fell from 7.0% to 6.7% across the era; it is never close to #1 (constraint
  satisfied).
- Cable advertising: $72M in 1980 (0.13% of all US ad spend) → $4,451M in 1993 (3.16%), 62×.
  Cable networks $60M → $3,295M; local cable spot $12M → $1,156M.
- Yellow Pages: Coen breaks the category out only from 1980. The 1980 discontinuity in
  "Miscellaneous local" (1979 $4,641M → 1980 $2,396M) is almost exactly the size of the new
  Yellow Pages local line ($2,570M), so the category was carved out of Miscellaneous. Noted
  as an inference for the R2 concordance object; not asserted as sourced fact.
- USPS: third-class pieces 30,381M (FY1980) → 65,773M (FY1993); 28.6% → 38.4% of all mail;
  253 pieces per person per year in 1993 vs 133 in 1980. Statistical Abstract 1995 table 925
  (source: USPS Annual Report of the Postmaster General).

### SCALE / BUYERS money-type split
- national_brand and local_retail come straight from Coen's own national/local split.
- **Direct mail was the largest single national medium in 1993**: $27,266M = 33.3% of the
  $81,867M national total, more than all national television combined (network $10,209M +
  national spot $7,800M + syndication $1,576M + cable networks $3,295M = $22,880M). Computed
  from Coen; the arithmetic is in the claim statement so it is re-derivable. Caveat carried:
  Coen books direct mail as 100% national and its figure includes postage and production.
- classified: **no period source found** (see §5). Triangulated at ~$11.2B for 1993 from
  Coen's newspaper total × a classified share bracketed by the documented 2000 peak (40% of
  newspaper ad revenue, $19.6B of $48.7B) and the standard "30–40% for much of the century"
  statement. Interval deliberately wide: $9.6–12.8B.
- direct_response: triangulated at ~$31B for 1993 = Coen direct mail ($27.27B) + an allowance
  of $3–5B for direct-response television, direct-response print/space, and inbound
  telephone-response advertising outside the mail line. Interval $28–36B.

### CREATORS
- Economic Census via HBS WP 11-039 Table A1 (Silk/Arzaghi/Berndt, "The Unbundling of
  Advertising Agency Services"): agency establishments with payroll 8,089 (1977) → 13,879
  (1992); total agency billings $15.45B → $69.59B; total agency income $3.17B → $13.61B;
  media commissions 58.55% of agency income (1977), 61.30% (1987), 54.17% (1992).
- Census County Business Patterns via Statistical Abstract 1995 table 1316: advertising
  agencies 11,100 establishments / 137,000 employees (1990) → 11,900 / 127,000 (1992) —
  employment fell through the 1990–91 recession while establishment count rose.
- Statistical Abstract 1995 tables 1315/1317: SIC 731 "Advertising" receipts $14.9B (1985) →
  $23.7B (1993); advertising agencies (7311) $11.1B → $17.7B; direct mail advertising
  services (7331) $3.8B → $8.3B, 3,900 establishments and 81,000 employees in 1992.
- Holding-company deals: Saatchi & Saatchi / Ted Bates $450M (May 1986); Omnicom formed 1986
  from BBDO + Doyle Dane Bernbach + Needham Harper ("the Big Bang"); WPP / J. Walter Thompson
  1987 (reported at both $550M and $566M — interval widened, both figures noted); WPP /
  The Ogilvy Group 1989 (reported at $862M and $864M).
- The structural point worth keeping: ownership concentrated into four holding companies
  while the *number* of agency establishments rose ~70% across the era. Consolidation at the
  top, proliferation at the bottom.

### SELLERS
- Big Three prime-time share: >90% in the mid-1970s → 61% in the 1988–89 season, with cable
  at 20% (Forbes/Brad Adgate, "The Rise And Fall Of Cable Television"; corroborated by
  Encyclopedia.com's "Prime Time Audiences Gain More Choices").
- Cable networks: 28 (1980) → 79 (1990).
- Cable was a subscription business that sold advertising on the side: Census Annual Survey
  of Communication Services (Statistical Abstract 1995 table 913) puts 1993 cable/pay-TV
  revenue at $26,881M with **advertising only $2,633M (9.8%)**; basic service alone was
  $13,609M. Note the definitional gap vs Coen's $4,451M cable ad total (Census SIC 4841
  covers operators; Coen adds cable-network sales) — both recorded, not reconciled.
- USPS third-class revenue FY1980 $2,412M → FY1993 $9,817M (bulk rate $2,168M → $9,553M).
  The Postal Service is, on these numbers, one of the largest single sellers in the market.
- Yellow Pages $9,517M in 1993, 87% of it local (RBOC directory units after 1984).

### PRICING
- Economic Census (HBS Table A1): media commissions as a % of media billings 14.13% (1977),
  13.92% (1982), 14.16% (1987), 13.18% (1992), 10.98% (1997). **The 15% did not die in this
  era.** Markups on purchased advertising materials 15.84% (1977) → 18.39% (1992) → 11.88%
  (1997).
- ANA tracking studies (via HBS WP, citing Beals 2007): 71% of large national advertisers
  used commission-based compensation in 1982 → 61% in 1994; labour-fee compensation 8% → 31%.
  By 2003 only 10% used commissions. So era 4 is the slow-erosion phase; the break is
  1994–2003.
- Media price inflation: Universal McCann / MagnaGlobal composite media unit cost index
  (1982–84 = 100) 58.0 (1977) → 149.9 (1992); GDP implicit price deflator 37.751 → 76.533.
  Media prices rose ~27% faster than the general price level over those 15 years. The reason
  advertisers went after the commission: a fixed percentage of a fast-inflating base.
- Direct mail unit economics (Encyclopedia of American Industries, SIC 7331): 2–3% response
  counted as success; early-1990s list rental $50–80/thousand for response lists, $25–30 for
  compiled lists, $7/thousand for plain consumer lists, $35–40 for business lists; production
  at least $0.40 per piece.
- Postage: third-class revenue ÷ pieces = 7.9¢ (FY1980) → 14.9¢ (FY1993), +88%.
- Cable's pricing pitch was a discount CPM against broadcast; I could not source a clean
  period CPM comparison and have not asserted one (see §5).

### MEASUREMENT
- Nielsen people meters became the national currency in September 1987. Christian Science
  Monitor, 6 Jan 1988: prime-time viewing measured ~10% lower; CBS and ABC each −13%, NBC
  −4%; Saturday-morning children's audience down "at least 20 percent, and possibly 50
  percent" against ~$150M of network children's advertising. Networks disputed the panel's
  composition: 33% of people-meter households had pay cable vs 26% of the population. Networks
  owed make-goods in scatter time, which was worth more than the upfront time they had sold.
  This is the cleanest pre-digital demonstration that changing the counter changes the price.
- Single-source scanner measurement: IRI's BehaviorScan (from 1979) wired Marion, Indiana and
  Pittsfield, Massachusetts — scanners in 15 supermarkets, 2,000 recruited households per
  town, with cable-cut-in ad testing on the same households. Nielsen answered with
  scanner-based services. Encyclopedia.com, "Information Resources, Inc."
- The series problem: Coen priced at rate-card list, Magna's later backcast at supplier
  revenue. On 1980 direct mail they differ by ~2 points of share (14.2% vs ~12%). Both cited.

### TARGETING
- Claritas / PRIZM: Jonathan Robbin reallocated 1970 census tabulations to all ~36,000
  five-digit ZIP codes and classified them into **40 clusters**. Sources disagree on dates —
  company founded 1971 or 1974; the clustering system built 1974; PRIZM commercially launched
  1974, 1976 or 1978. I record 1978 as the central launch year with an interval back to 1974
  and note the conflict rather than picking a winner. (Griffith/IEEE Annals, "When the New
  Magic was New: The Claritas Corporation and the Clustering of America", 2022 — abstract and
  secondary summaries only; both IEEE Xplore and Project MUSE served access walls.)
- ZIP+4 arrived in 1983, cutting the addressable unit below the ZIP.
- The precision ceiling of the era's best-targeted medium: a 2% response rate on a rented
  list means 98% waste, and the DMA's own worked example shows a 1,000,000-piece drop at
  $0.60/piece needing a 2% response at a $100 average order to clear a profit. Targeting in
  era 4 buys a better *neighbourhood*, never a person's intent.
- Cable supplied the other half of the targeting story: 79 networks by 1990 versus three
  networks in 1976, each sold as a psychographic slice (MTV, ESPN, Nickelodeon, Lifetime).

## 5. Dead ends and unresolved gaps

1. **Newspaper classified revenue, 1976–1993 — not sourced.** What I tried:
   - NAA's own `Annual-All-Categories` and `Annual-Classified` pages via the Wayback Machine
     (2007 and 2011–12 snapshots). The tables load through a JS download that was not archived.
   - A CDX sweep of `naa.org` for `.xls` assets. None archived.
   - The 1995, 1996 and 1999 Statistical Abstract sections. The newspaper by-type table is not
     in the volumes that survive as text, and the 1992 edition is image-only.
   - AEI Carpe Diem, MinnPost, Pew and Statista. All start at 2000.
   - The Coen workbook. It splits newspapers national/local only.

   Result: a grade-C triangulation, method written into the claim, interval ±14%. **This is
   the record's weakest number. It is the one most worth a targeted archive pull in R3.**
2. **Yellow Pages before 1980** — Coen only breaks the category out from 1980; before that it
   sits inside "Miscellaneous". No pre-1980 directory figure is asserted.
3. **Period cable-vs-broadcast CPM comparison** — the "cable sells at half the broadcast CPM"
   rule is everywhere in secondary sources and nowhere in a citable period document I could
   reach. Not asserted. Worldradiohistory.com's *Broadcasting* and *Electronic Media* PDF
   archives are the obvious place to look and are the recommended R3/R4 follow-up.
4. **1993 Leading National Advertisers table** (P&G's spend, top-100 concentration) — Ad Age's
   archive is paywalled; no free reproduction of the 1993 edition found. No top-advertiser
   claim is made.
5. **Yellow Pages advertiser counts** — the YPPA/Local Search Association archive has nothing
   period-specific online. Not asserted.
6. **World adspend** — see §4 SCALE; retrieved as an indexed snippet only, graded B with a
   wide interval, cross-checked against the US five-media share.

## 6. Judgment calls

- Coen numbers graded **B**, not A, despite Census having reprinted them, because they are
  rate-card-based industry estimates (Silk & Berndt). Census/USPS/Economic Census numbers are
  graded A.
- Where the DMA's 2001 printing of Coen and the 2009 workbook disagree (1990 total), the
  workbook value is used in the record and the discrepancy is itself a claim.
- The "15% commission began to die in the 1980s" story is *not* supported by the Economic
  Census rate series and the record says so. If a downstream chapter wants the commission's
  death, it belongs in era 5/6, not here.
- "Firsts" handled conservatively: WTCG is described as the first *nationally distributed
  superstation* (HBO was on satellite first, in 1975, as a pay service); the FCC's 1984 order
  is described as removing the commercial-time and program-length-commercial limits, not as
  "inventing the infomercial".
- Direct mail's rank: #3 medium overall on Coen's categories for the whole era, but the #1
  *national* medium by 1993. Both stated, because the second is the interesting one and the
  first is what a reader checking a chart will see.

## 7. Source list (with URLs)

- Coen Structured Advertising Expenditure Dataset (workbook) — http://www.galbithink.org/cs-ad-dataset.xls
- Douglas Galbi, "US Annual Advertising Spending Since 1919" — https://www.galbithink.org/ad-spending.htm
- Purple Motes, "U.S. advertising expenditure data" — https://www.purplemotes.net/2008/09/14/us-advertising-expenditure-data/
- Silk & Berndt, "Aggregate Advertising Expenditure in the U.S. Economy", NBER WP 28161 — https://www.nber.org/system/files/working_papers/w28161/w28161.pdf
- Arzaghi, Berndt, Davis & Silk, "The Unbundling of Advertising Agency Services", HBS WP 11-039 — https://www.hbs.edu/ris/Publication%20Files/11-039.pdf
- DMA, *Statistical Fact Book 2001* — http://courses.washington.edu/dmarket/2001Factbook.pdf
- Statistical Abstract of the United States 1995, Communications section (tables 913, 924, 925, 926) — https://www2.census.gov/library/publications/1995/compendia/statab/115ed/tables/communic.pdf
- Statistical Abstract of the United States 1995, Domestic Trade section (tables 1315, 1316, 1317) — https://www2.census.gov/library/publications/1995/compendia/statab/115ed/tables/domtrade.pdf
- Christian Science Monitor, "For TV networks, 'People Meter' is a profit eater", 6 Jan 1988 — https://www.csmonitor.com/1988/0106/fmeter.html
- Brad Adgate, "The Rise And Fall Of Cable Television", Forbes — https://www.forbes.com/sites/bradadgate/2020/11/02/the-rise-and-fall-of-cable-television/
- Encyclopedia.com, "Information Resources, Inc." — https://www.encyclopedia.com/books/politics-and-business-magazines/information-resources-inc
- Encyclopedia of American Industries, "SIC 7331 Direct Mail Advertising Services" — https://www.referenceforbusiness.com/industries/Service/Direct-Mail-Advertising-Services.html
- Griffith, "When the New Magic was New: The Claritas Corporation and the Clustering of America", IEEE Annals of the History of Computing — https://ieeexplore.ieee.org/document/9927132/
- "Eyes of a Generation": WTCG satellite uplink, 17 Dec 1976 — https://eyesofageneration.com/december-17-1976-wtcg-atlanta-becomes-first-us-satellite-tv-station-at-100/
- UPI Archives, "FCC lifts many commercial TV rules", 27 June 1984 — https://www.upi.com/Archives/1984/06/27/FCC-lifts-many-commercial-TV-rules/9397457156800/
- FundingUniverse, "History of WPP Group plc" — https://www.fundinguniverse.com/company-histories/wpp-group-plc-history/
- Encyclopedia.com, "Saatchi & Saatchi" — https://www.encyclopedia.com/books/politics-and-business-magazines/saatchi-saatchi
- HBR, "The Costly Bargain of Trade Promotion" (1990) — https://hbr.org/1990/03/the-costly-bargain-of-trade-promotion
- Springer, *Marketing Letters*, "Managerial perspectives on trade and consumer promotions" (Donnelley Marketing 15th Annual Survey, 1992) — https://link.springer.com/article/10.1007/BF00640801
- Mediatel Newsline, "Advertising Expenditure Forecasts – 1990", 12 Dec 1990 — https://mediatel.co.uk/newsline/1990/12/12/advertising-expenditure-forecasts-1990
- AEI Carpe Diem, newspaper ad revenue (classified 2000 peak) — https://www.aei.org/carpe-diem/creative-destruction-newspaper-ad-revenue-continued-its-precipitous-free-fall-in-2014-and-its-likely-to-continue/
