# Era 5 — "The Impression" (1994–2001) — working notes and source log

Agent: market-era-historian (R1 fan-out). Started 2026-07-30.
Record: `p2-ad-market/data/eras/era-5.json`. Claim ID prefix: `e5-`.

## 1. Scope statement

Inside my period: the US advertising market from the launch of commercial web advertising
(HotWired, Oct 1994) through the trough year of the dot-com advertising crash (calendar 2001),
covering all measured media — not just the web — because the era's argument is that the web
imported print/TV logic (the CPM impression) while the money that would later move to search
still sat in newspaper classifieds, Yellow Pages and direct mail. I cover GoTo/Overture's
pure-bid auction (Feb 1998 announce, June 1998 launch) and AdWords' Oct 2000 CPM launch as
the *setup* for era 6.

Left to siblings: era 4 owns direct mail's database upgrade and the pre-web segmentation story;
era 6 owns AdWords Select (Feb 2002), the AOL flip (May 2002), Overture's 2002 revenue peak and
its acquisition by Yahoo (2003), and the actual capture of classified/directory money — which in
my period has only just begun. Era 6 also owns the Overture patent settlement (2004).

## 2. Constraints inherited (PLAN.md §2)

- AdWords launched Oct 2000 as a **CPM** product; auction arrives Feb 2002 (era 6). ✅ respected.
- Overture led paid-search revenue through 2002. ✅ my record shows Overture FY2001 $288.1M vs
  Google FY2001 $86.4M total revenue.
- Radio never #1 US medium by spend. ✅ Coen data: radio $17.9B vs newspapers $44.3B in 2001.
- Newspapers out-earned TV deep into this era. ✅ Coen: newspapers #1 single medium 1994–2000.
- "Out of Home" replaced "Billboards" in 2000 at ~3x expenditure. ✅ visible in Coen data
  (Billboards 1999 = $1,725M as an alternate category; Out of Home 1999 = $4,780M). Flagged in
  MEDIUM/SCALE notes — this is a definitional break INSIDE my era.
- Wanamaker quote + "first banner ad" = attributed legend until proven. See §6 (de-legending).
- Classifieds, directories (Yellow Pages), direct mail tracked in EVERY era. ✅ all three carried.

## 3. Primary data pulls (raw, before claim construction)

### 3.1 Coen / McCann-Erickson series via Galbi CS Ad Dataset (downloaded xls, 2008-09-14 revision)

Source: Douglas Galbi, "Coen Structured Advertising Expenditure Dataset",
http://www.galbithink.org/cs-ad-dataset.xls (data file), documented at
https://www.galbithink.org/ad-spending.htm and
https://www.purplemotes.net/2008/09/14/us-advertising-expenditure-data/
Local extract: `scratchpad/coen_1993_2002.csv`.

US total measured ad spend ($M, current):

| Year | Total | % GDP (Galbi) |
|---|---|---|
| 1993 | 140,956 | — |
| 1994 | 153,024 | 2.2 |
| 1995 | 162,930 | 2.2 |
| 1996 | 175,230 | 2.2 |
| 1997 | 187,529 | 2.3 |
| 1998 | 206,697 | 2.4 |
| 1999 | 222,308 | 2.4 |
| 2000 | **247,472** | **2.5** |
| 2001 | 231,287 | 2.3 |
| 2002 | 236,875 | 2.3 |

2000 → 2001 change = −$16,185M = **−6.54%**.

By medium, $M (Coen):

| Medium | 1994 | 2000 | 2001 |
|---|---|---|---|
| Newspapers | 34,356 | 49,050 | 44,255 |
| Direct Mail | 29,638 | 44,591 | **44,725** |
| Broadcast TV | 31,133 | 44,802 | 38,881 |
| Radio | 10,529 | 19,295 | 17,861 |
| Cable | 5,209 | 15,455 | 15,736 |
| Yellow Pages | 9,825 | 13,228 | 13,592 |
| Magazines | 7,916 | 12,370 | 11,095 |
| Internet | n/a | 6,507 | 5,645 |
| Out of Home | (Billboards 1,167) | 5,176 | 5,134 |
| Business Papers | 3,358 | 4,915 | 4,468 |
| Miscellaneous | 19,893 | 32,083 | 29,895 |
| **Total Local** | 63,900 | 95,808 | 89,490 |
| **Total National** | 89,124 | 151,664 | 141,797 |

FINDING (notable): in 2001 Coen has **Direct Mail ($44,725M) passing Newspapers ($44,255M)** as
the single largest measured medium — the first time. Confirmed again 2002 (46,067 vs 44,031).
Newspapers were #1 every year 1994–2000.

Coen internet line: 1997 600, 1998 1,383, 1999 2,832, 2000 6,507, 2001 5,645. No internet line
1994–1996 in the Coen series — corroborates the probe's "front-edge no-data zone" gap.

### 3.2 IAB/PwC Internet Advertising Revenue Report (2001 Full-Year, published June 2002)

Source: https://www.iab.com/wp-content/uploads/2015/05/resources_adrevenue_pdf_IAB_PWC_2001Q4.pdf
(local: `scratchpad/iab2001q4.pdf` / `.txt`)

Annual US internet ad revenue as reported in that edition:
1996 $267M · 1997 $907M (+239%) · 1998 $1,920M (+112%) · 1999 $4,621M (+141%) ·
2000 $8,225M (+78%) · 2001 $7,210M (−12.3%).

NOTE a later restatement: the Coen dataset's "internet" sheet records the IAB series as
2000 = $8,087M and 2001 = $7,134M (citing the IAB/PwC 2007 full-year report). Both cited;
CI widened rather than averaged.

Quarterly 2001: Q1 $1,893M, Q2 $1,868M, Q3 $1,792M, Q4 $1,658M — four consecutive declines.
Q4 2000 = $2,162M (the all-era quarterly peak).

Pricing model split (share of revenue):
- FY2000: CPM/impression 43%, hybrid 47%, performance 10%.
- FY2001: CPM/impression 48%, hybrid 40%, performance 12%.
- Q4 2001: CPM/impression 45%, hybrid 42%, performance 13%.

Ad format split (share of revenue):
- FY2000: banners 48%, sponsorships 28%, classifieds 7%, interstitials 4%, e-mail 3%,
  referrals 4%, keyword search 1%, rich media 2%, other 3%.
- FY2001: banners 36%, sponsorships 26%, classifieds 16%, slotting fees 8%, e-mail 3%,
  keyword search 4%, interstitials 3%, referrals 2%, rich media 2%.
- Q4 2001: banners 35%, sponsorships 25%, classifieds 15%, slotting fees 8%, keyword search 6%.

Seller concentration (share of internet ad revenue):
- Top 10: 64% (Q1 1998) → 75% (Q2 1999) → 71% (Q4 2000) → **77% (Q4 2001)**.
- Q4 2001: top 25 = 91%, top 50 = 98%.

Transaction type: cash 93% FY2000 → 89% FY2001; barter/trade 6% → 10% (13% in Q4 2001).

Advertiser industry mix FY2001: consumer 30%, computing 18%, media 12%, financial services 12%,
business services 9%. (FY2000: consumer 31%, computing 18%, media 8%, financial 14%, business 9%.)
Within consumer FY2001: retail 50%, music 12%, automotive 11%, travel/hotel 10%, amusement 5%.

Publisher content genre FY2001: search engines/portals 28%, classifieds 15%, technology 11%,
business/financial 10%, news/information 10%, shopping 9%, entertainment 5%, sports 3%, travel 2%.
(FY2000: search engines/portals 36%, business/financial 16%, technology 12%, classifieds 11%.)

IAB's own share-of-total statement: internet = ~3.7% of total US ad spending in 2000,
~3.1% in 2001. IAB's 2001 all-media bar chart (McCann-Erickson basis) reads:
Direct Mail $46.2B, Newspapers $45.1B, Television $41.2B, Radio $18.0B, Cable TV $11.4B,
Magazines $10.9B, Internet $7.2B, Outdoor $5.1B, Business Papers $4.5B.
(These are the CMR/McCann 2001 *estimates* current in mid-2002 — they differ modestly from
Coen's final 2001 figures above. Conflict noted, not averaged.)

IAB 1996 first-year detail (IAB press release, 25 Mar 1997): FY1996 $267M; Q1 $29.9M, Q2 $51.9M,
Q3 $75.6M, Q4 $109.5M; category mix computing 38%, consumer 20%, new media 17%, telecom 9%,
business services 6%.
https://www.iab.com/news/internet-advertising-bureau-announces-1996-advertising-revenue-reporting-program-results/

### 3.3 GoTo.com / Overture Services FY2001 Form 10-K (SEC EDGAR) — grade A

Source: https://www.sec.gov/Archives/edgar/data/0001060439/000095014802000561/v79612e10-k.htm

Revenue ($000): 1997 $22 · 1998 $822 · 1999 $26,809 · 2000 $103,052 · 2001 $288,133.
Quarterly 2001: Q1 $51,959, Q2 $62,463, Q3 $72,523, Q4 $101,188.
Traffic acquisition cost: $162,072k (2001) = **56% of revenue**; $66,433k (2000) = 64%.
TAC was 51% in Q4 2001 vs 77% in Q4 2000.
Search-serving cost: $20,962k (2001) = 7.3% of revenue; $13,109k (2000) = 12.7%.

Mechanism, verbatim: advertisers "bid in an ongoing auction for priority placement in our search
results after editorial approval. Priority placement means that the search results appear on the
page ranked in descending order of bid price, with the highest bidder's listing appearing first.
Each advertiser pays Overture the amount of its bid whenever a consumer or business clicks."
→ pure first-price, pure-bid ranking, human editorial review. No quality weighting.

Scale: ~442 million paid introductions in Q4 2001; average price per paid introduction $0.23
(442M × $0.23 = $101.7M ≈ Q4 revenue $101.2M — internally consistent).
~53,000 paying advertisers in December 2001.
Minimum bid $0.05/keyword; minimum initial deposit $25–$50; $20/month minimum spend from Mar 2001.
>95% of Q4-2001 traffic came from affiliates: ~40% portals (AltaVista, AOL, Excite, go.com, iWon,
Terra Lycos, Yahoo), ~25% browsers (IE, Netscape), ~35% other (Ask Jeeves, InfoSpace, own site).

Overture's own framing of the competitive set is the era-5 thesis in one paragraph: it cites
banner CTR of ~0.3% (attributed to eMarketer) as impression advertising's failure, and it
benchmarks its lead volume against **direct mail** (DMA: ~1.7M responses on ~10.7M pieces read
per day) and **Yellow Pages** (YPPA: ~25–30M calls on ~30–40M references per day) — i.e. Overture
positioned itself against the directory/direct-mail intent pool, not against TV brand budgets.

### 3.4 Newspaper classified peak

Classified newspaper ad revenue rose 5.1% to **$19.6B in 2000** (NAA), ~40% of newspaper industry
ad revenue; total newspaper ad spend $48.7B in 2000. Within classified: recruitment +8.6% to
$8.7B, automotive +2.3% to $5.0B, real estate +1.6% to $3.2B, all other +4.1% to $2.7B.
Sources: MediaPost/Online Media Daily "Ad Spending in Newspapers Hit $48.7 Billion in 2000"
https://www.mediapost.com/publications/article/11138/ ; AEI Carpe Diem (NAA series)
https://www.aei.org/carpe-diem/creative-destruction-newspaper-ad-revenue-continued-its-precipitous-free-fall-in-2014-and-its-likely-to-continue/ ;
Poynter (NAA) https://www.poynter.org/reporting-editing/2010/classified-ad-revenue-down-70-percent-in-10-years-with-one-bright-spot/

(continued below as fields are completed)

### 3.5 Overture / GoTo full financial series (FY2001 10-K, Selected Financial Data)

Revenue ($000): 1997 $22 · 1998 $822 · 1999 $26,809 · 2000 $103,052 · 2001 $288,133.
Quarterly 2001: Q1 $51,959 · Q2 $62,463 · Q3 $72,523 · Q4 $101,188.
Quarterly 2000: Q1 $17,215 · Q2 $21,011 · Q3 $25,050 · Q4 $39,776.
Losses (per FY2000 10-K reporting): 2000 $458.6M, 1999 $29.3M, 1998 $14.0M (2000 includes a
~$309.3M Cadabra/AuctionRover goodwill impairment).

### 3.6 DoubleClick FY2000 10-K (SEC EDGAR) — the unit-economics backbone

Segment revenue 2000 ($000): Media 253,827 · Technology 203,391 · Data 72,355 · intersegment
(23,962) → Total 505,611. (1999 total 258,294; 1998 total 138,724.)
DART served **621 billion ads worldwide in 2000**; ~63 billion in December 2000; 2,000+ clients.
TechSolutions gross margin 71.6% (2000), 67.0-67.1% (1999), 67.2% (1998).
Media gross margin 25.3% (2000; 32.6% ex-writeoff), 39.8% (1999), 21.2% (1998).
Cost of Media revenues = "service fees paid to Web publishers for impressions delivered on our
worldwide networks and the costs of ad delivery" → Media gross margin IS the network take rate.
Explicit cause of margin decline: "increases in the amounts of unsold inventory, which diluted
the effective price of delivered advertising impressions."
"The proportion of revenues from traditional advertisers grew to over 55% in the fourth quarter
of 2000." → dot-com advertisers had been the majority of network demand before Q4 2000.
AltaVista concentration: 44.7% of Media revenue (1998) → 17.8% (1999) → 11.2% (2000).
Abacus Alliance: 1,800+ direct-mail members; Abacus Online Alliance 200+ e-commerce merchants.

### 3.7 Yahoo! FY2001 10-K (SEC EDGAR)

Net revenues ($000): 1997 84,108 · 1998 245,132 · 1999 591,786 · 2000 1,110,178 · 2001 717,422.
Net income (loss): 1999 47,811 · 2000 70,776 · 2001 (92,788).
By service group: Marketing services 533,323 (90%) 1999 · 968,274 (87%) 2000 · 538,771 (75%) 2001.
Cost of revenues: 93,181 (16%) 1999 · 149,744 (13%) 2000 · 157,001 (22%) 2001.
Sales & marketing: 223,980 (38%) 1999 · 419,725 (38%) 2000 · 386,944 (54%) 2001.
US/international revenue 2000: $941.3M / $168.9M. US segment EBITDA margin 43% (2000) → 12% (2001).
Page views/day (incl. Yahoo Japan): Dec 1999 ~470M · Dec 2000 ~900M · Dec 2001 ~1.32B.
Yahoo Japan alone: 39M · 116M · 196M.
Advertising customers: ~700 (1996) · ~2,900 (1997) · ~4,300 (1998).
2001 cause stated in the filing: "Internet companies spent significantly less money in 2001 due
to diminished access to capital markets."
Note for era 6: by FY2001 Yahoo's own search results carried **Overture's** top-five paid listings
("Sponsored Matches... sold through our online channel by Overture Services, Inc.").

### 3.8 Agency compensation (CREATORS)

HBS WP 11-039 (Silk, Berndt & Kim), citing ANA tracking studies via Beals (2007):
commission-based compensation among large US national advertisers 71% (1982) → 61% (1994) →
10% (2003); labour-based fees 8% (1982) → 31% (1994) → 74% (2003), plus 8% combination in 2003.
US Census of Service Industries (agencies of all sizes): share of agency income from media
commissions and markups 70% (1992) → 59% (1997); fees/PR/other 30% → 41%. Realised commission
rate on media billings 14% (1977) → **11% (1997)**; markup on materials 16% → 12%.
Alternate ANA cut circulating in trade press (The Drum / MediaPost): billing-based arrangements
60% (1992/94) → 35% (1997) → 21% (2000). Directionally identical; different question wording.
Kept in the notes, not the record, to avoid double-counting the same survey.

### 3.9 Unit economics — the Fermi build (grade C, method in the record)

**Revenue per impression, US, 2000.**
Numerator: impression-priced share of IAB FY2000 revenue = (banners 48% + sponsorships 28%) ×
$8.225B = $6.25B.
Denominator, three independent paths:
  (a) AdRelevance/Jupiter Media Metrix: 172bn US impressions in Q4 2000, 65bn in Dec 2000.
      Q4 ≈ 28-30% of year → FY2000 ≈ 575-615bn. Monitoring method → a floor.
  (b) DoubleClick DART served 621bn ads worldwide in 2000. If DART = 25-40% of worldwide served
      ads, worldwide = 1.6-2.5tn; US ≈ half → 0.8-1.25tn.
  (c) Yahoo alone: ~784M page views/day ex-Japan in Dec 2000 ≈ 24bn/month.
Converged range 0.6-1.5tn, central 0.9tn. → $6.25B / 0.9tn = **$0.0069/impression ($6.9 CPM)**.
Cross-check: Yahoo marketing services $968.3M ÷ ~222bn estimated ex-Japan page views for 2000 =
$4.37 per thousand page views. Same band.
Sanity: rate card was $25-37 CPM. An effective $7 implies ~75% realised discount, which is exactly
what DoubleClick's MD&A describes and what a 10% barter share plus unsold inventory produces.

**Cost to serve one impression, 2000.**
  (a) Ad delivery: DoubleClick TechSolutions cost of revenue = 28.4% × $203.4M = $57.8M over
      621bn ads = **$0.093 per thousand ads**.
  (b) Content + bandwidth + depreciation: Yahoo cost of revenues $149.744M over ~222bn ex-Japan
      page views = **$0.675 per thousand page views**.
Portal-scale total ≈ $0.77/thousand; central raised to $0.90/thousand for sub-portal publishers.

**Margin.** Yahoo audited gross margin 86.5% (2000), 78.1% (2001). Bottom-up from the unit
figures: (0.0070 − 0.0009)/0.0070 = 87.1%. Central 85% to blend in network-intermediated share
(DoubleClick Media 25.3% gross margin). The record states the crucial qualifier: gross margin was
print-beating while operating results were catastrophic (Yahoo sales & marketing = 38% of 2000
revenue; net loss $92.8M in 2001).

### 3.10 Money-type decomposition (grade C, exact by construction)

2000, $M, Coen basis. Grand Total 247,472 = Total National 151,664 + Total Local 95,808.
  classified        = NAA newspaper classified 19,600 + online classified (7% × 8,225) 580 = 20,180
  direct_response   = Direct Mail 44,591 + national Yellow Pages 2,093 + performance-priced
                      internet (10% × 8,225) 820 = 47,504
  local_retail      = Total Local 95,808 − 19,600 = 76,208
  national_brand    = Total National 151,664 − 44,591 − 2,093 − 820 − 580 = 103,580
  SUM = 247,472 ✅ exact.
Shares 41.86% / 30.80% / 8.15% / 19.20% (record rounds to 41.9 / 30.8 / 8.2 / 19.2; the rounded
figures sum to 100.1, which is rounding, not an inconsistency).
Key justification: Silk & Berndt NBER WP 28161 p.7 confirms MCE classes direct mail, business
magazines and internet as **exclusively national**, so subtracting direct mail from the national
total is legitimate and does not double-count with local.

## 4. De-legending pass (constraint: "guilty until proven")

**"The first banner ad" (HotWired, 27 Oct 1994) — LABELLED LEGEND, event kept.**
Findings: (a) There was no single first banner. Digiday's oral history states plainly that "the
phrase 'first banner ad' is a misnomer because HotWired simultaneously published ads in October
1994 from 12 different brands." Counts of 12 (Digiday, Campaign) vs 14 (Fast Company / prior
scouting) conflict; record carries central 12, ci80 [12, 14].
(b) Earlier clickable paid web advertising exists: O'Reilly's Global Network Navigator sold a
clickable ad to the law firm Heller Ehrman White & McAuliffe in 1993; Prodigy carried paid
screen advertising in the late 1980s. GNN is generally credited with the first clickable paid
web ad; HotWired with the first rotating banner *campaign* sold as media.
(c) The famous **44% click-through rate is unaudited and disputed**. It attaches specifically to
the AT&T unit and is self-reported. Digiday's oral history participants recall 15%. No
third-party audit existed in October 1994 — the ad server did not exist yet either. The record
does not carry the 44% figure as a claim; the CTR claim (e5-measurement-001) is anchored on the
0.3% figure that Overture put in an SEC filing.
(d) Price: Rick Boyce sold 12-week launch sponsorships at **$30,000** each (Campaign), consistent
with Digiday's "$10,000 a month," priced by analogy to a $10,000 page in print Wired.
VERDICT: event is real and datable; the superlative and the 44% are attributed legend.

**Wanamaker "half my advertising"** — not used anywhere in this record. Nothing to de-legend.

**GoTo's original $0.01 minimum bid** — NOT verified. The FY2001 10-K states a $0.05 minimum.
The penny-minimum claim appears only in secondary retrospectives. Record carries $0.05 (grade A);
the penny claim is deliberately omitted. Era 6 may want to chase the 1998 press kit.

## 5. Scout-gap ledger (every probe gap whose affected_eras includes "5")

| Gap (severity) | Disposition |
|---|---|
| Classified advertising absent (**blocking**) | ADDRESSED. Classified carried in SCALE and BUYERS money-type splits, in MEDIUM (e5-medium-005, $19.6B peak, ~40% of newspaper revenue, recruitment $8.7B), and in PRICING/format data (online classified 7%→16% of internet revenue). Boundary note hands the peak to era 6. |
| No brand/DR/local/classified money split (**major**) | ADDRESSED. Four-key split in both SCALE and BUYERS, exact-summing decomposition documented in §3.10. |
| Yellow Pages / directories missing (**major**) | ADDRESSED. e5-medium-003 ($13.228B in 2000, rising); national YP assigned to the direct-response pool; Overture's own 10-K benchmark against YPPA call volumes in e5-targeting-005. |
| Search's money came from classifieds/YP/DR, not TV (**blocking**) | ADDRESSED. The record states the two pools were worth $67.7B against a $8.2B internet market, and cites Overture's own filing benchmarking itself against direct mail and Yellow Pages rather than banners. |
| Traditional media did not collapse when digital arrived (**major**) | ADDRESSED. e5-medium-001/002: newspapers #1 through 2000; direct mail #1 from 2001; classified peaks in 2000, i.e. *after* the web arrived. |
| 1994-1995 web spend is a no-data zone (**minor**) | ADDRESSED honestly. e5-scale-008 is grade C with a documented Fermi and a wide CI; the record states in MEDIUM and in boundary_notes that the Coen series has no internet line before 1997. |
| Ad/GDP folklore contested (**minor**) | ADDRESSED. e5-scale-004 carries the MCE 2.3% / IRS 2.4% / Galbi 2.5% spread rather than one number, and boundary_notes tells era 6 that the peak share was never regained, so era 6's story must be reallocation not expansion. |
| 1998-2008 timeline corrections; Overture's revenue lead as a calibrated number in era 5 (**major**) | ADDRESSED. Overture FY2001 $288.133M vs Google FY2001 $86.4M in boundary_notes; AdWords Oct 2000 = CPM at $15/$12/$10 as an event and a PRICING claim. |
| Dot-com crash as the mechanism-forcing event (**minor**) | ADDRESSED. Two events (2001-10-01, 2001-12-31) plus e5-scale-003 and e5-scale-006; the record states impression pricing shrank while performance pricing grew (10%→12%) through the same downturn. |
| MEASUREMENT missing from schema (**blocking**) | RESOLVED UPSTREAM (schema v2 has the field). Filled: ad server as system of record, panel vs log-file rivalry, FAST 1998, IAB/CASIE 1996 standards, CTR collapse, barter inflation of reported revenue. |
| Per-unit economics not in schema (**blocking**) | ADDRESSED. unit_economics block filled at unit = impression with a three-path triangulation and two audited cost anchors. |
| Direct-response measurement lineage / "accountability arrived with the web" is false (**major**) | ADDRESSED. Direct mail is the single largest money-type component in the record ($44.6B in 2000, larger than the entire internet market five times over), and Overture's own lead-volume comparison to DMA response rates is carried as e5-targeting-005. |
| 15% commission's death untracked (**minor**) | ADDRESSED. Three CREATORS claims: 61% commission share in 1994, Census 70%→59% (1992-97), realised rate 11% by 1997. |
| 2007/2008 series seam (**blocking**, eras 4-7) | NOT APPLICABLE INSIDE ERA 5 (the seam is at 2007). But the *within-era* definitional breaks are flagged: Billboards→Out of Home in 2000 (e5-medium-006), and the Coen-billings vs IAB-revenue basis difference (boundary_notes). |
| Audience-commodity framing (**minor**) | Noted, not a claim. The MEASUREMENT summary makes the point structurally: this is the first era where the seller owns the counting instrument. |
| Era names imply spend dominance (**major**, eras 2/3/7) | Not era 5, but honoured anyway: "The Impression" names the mechanism, and SCALE/MEDIUM state plainly that the impression medium was 3% of the market. |

## 6. Conflicts left visible (never averaged)

1. **US internet ad revenue 2000**: IAB as-reported $8.225B vs IAB restated $8.087B vs Coen
   $6.507B. Record: central 8.087, ci80 [7.0, 8.3], both cited. Cause: Coen is bottom-up
   advertiser billings at list prices; IAB is top-down seller revenue.
2. **Internet share of US ad spend 2000**: 2.63% (Coen/Coen), 3.32% (IAB/Coen), 3.7% (IAB's own).
   Record: central 3.1, ci80 [2.6, 3.7].
3. **2001 total US decline**: Coen −6.5% vs CMR "nearly −10%" (cited inside the IAB report) vs a
   −2.7% figure circulating in secondary sources on a different base. Record: central −6.5,
   ci80 [−10.0, −4.5].
4. **Ad/GDP peak 2000**: 2.3% (MCE per Silk & Berndt) / 2.4% (IRS) / 2.5% (Galbi). Record: 2.4,
   ci80 [2.3, 2.5].
5. **HotWired launch advertisers**: 12 (Digiday, Campaign) vs 14 (Fast Company lineage).
   Record: 12, ci80 [12, 14].
6. **FAST attendance**: ~200 invited (Ad Age) vs 400+ participants (Crain). Record reframes the
   claim onto the unambiguous 16%-satisfaction figure and states both attendance numbers.
7. **AOL-Time Warner value**: $162B (ABC) / $165B (History.com and most accounts) / $182B in
   stock and debt / ~$350B combined entity. Record: 165, ci80 [160, 185].
8. **Direct mail overtaking newspapers in 2001**: margin is only $470M (1.1%) on Coen, but the
   contemporaneous McCann/CMR rendering in the IAB report shows the same ordering with a bigger
   gap ($46.2B vs $45.1B). Two independent renderings agree on the ordering; CI widened anyway.

## 7. Judgment calls a verifier should know about

- **The money-type decomposition is mine, not a published series.** It sums exactly to the Coen
  grand total by construction, which is a feature (no residual) but also means the boundaries
  between pools are my definitions. The most contestable choice is putting national Yellow Pages
  in direct response rather than national brand; it moves $2.1B (0.85% of the market).
- **Direct response is a floor.** Coen cannot separate direct-response TV or direct-response print
  insertions, so the true DR pool in 2000 is larger than $47.5B. The ci80 upper bound (23%) is set
  to reflect this rather than pretending the point estimate is a count.
- **The impression denominator dominates the unit-economics uncertainty.** Three paths converge
  within a factor of 2.5, which is good for a Fermi but is the weakest link in the block. If R4
  or R3 finds a published US impression total for 2000, it should replace the triangulation.
- **The 2001 fall in effective CPM is computable but not claimed.** Banner revenue 36% × $7.21B =
  $2.60B; if 2001 impressions grew to ~0.75-1.0tn (inventory glut), effective CPM lands near
  $2.60-3.50, i.e. roughly half of 2000. I left this out of the record because the 2001 impression
  count has no independent anchor at all. Flagging it for R4 as a candidate worked number.
- **Grade discipline.** 16 A-grade claims come from SEC filings (Overture, DoubleClick, Yahoo,
  Excite) and Census data. 39 B-grade from IAB/PwC, NAA, Coen/Galbi, Google's own press release
  and named trade reporting. 13 C-grade are all triangulations with a `method` field.
- **No number in this record comes from the Acquired or Stratechery podcasts.** The Acquired
  briefing on Overture/Yahoo appeared in one search result and was not opened or used.

## 8. Dead ends

- IAB/PwC FY2000 full-year PDF is not archived on iab.com under a predictable name; only the
  Q2-2000 edition and the 2001 full-year edition were retrievable. The 2001 edition carries the
  full 1996-2001 annual and quarterly history, so nothing was lost.
- SEC EDGAR blocks the WebFetch tool (HTTP 403). Filings were retrieved with curl and a declared
  User-Agent instead; the URLs in the record are the canonical EDGAR document URLs.
- tandfonline (Journal of Interactive Advertising, "Internet Audience Measurement", 2001),
  campaignlive, marketingcharts and adage all return 403 to the fetch tool. The Zenith global
  figures and the FAST detail were reconstructed from search snippets plus a second source; the
  global figure is therefore graded C with a wide interval.
- No free, citable global advertising total for 2000 exists. Zenith's $339B projection plus WARC's
  −3.1% for 2001 is the best available; a licensed WARC or Zenith series would upgrade
  e5-scale-009 from C to B. This is the single largest remaining sourcing gap in the record.
- An authoritative published count of total US ad impressions for 2000 was not found; the
  AdRelevance Q4 figure reached me only via a tertiary encyclopedia entry, not the original
  Jupiter Media Metrix release.
