# Era 6 — "The Auction" (2002–2008) — working notes and source log

Agent: market-era-historian (R1 fan-out). Started 2026-07-30.
Record path: `p2-ad-market/data/eras/era-6.json`

## 1. Scope statement

Inside my period: US advertising 2002–2008, defined by the arrival of the quality-weighted
second-price keyword auction (AdWords Select, Feb 2002), its syndication through AdSense and
distribution deals (AOL May 2002), and the money that moved first — classifieds, directories,
direct mail/lead-gen and other direct-response budgets — plus the structures that stayed put
(TV brand money, the agency holding companies). I carry the era's totals on the Coen/McCann
(MCE) series, which ends with full-year 2007, and IAB/PwC internet revenue through 2008.

Left to siblings: era 5 owns GoTo/Overture's invention of the pure-bid PPC auction, the banner,
the portal CPM regime and the 2001 crash's demand shock (I record only the crossover facts);
era 7 owns programmatic/RTB, header bidding, the 2019 first-price switch, RGSP and the pricing
knobs, mobile, privacy shocks, and the antitrust rulings that retrospectively judge era 6. I
record the DOJ/Mehta trial only where it is evidence *about* 2002–2008 mechanics, and I end
era 6 with a signpost, not the auction's death.

## 2. Seed obligations (gaps from unknown-unknowns-probe.json with affected_eras ⊇ 6)

| # | Severity | Gap | Where addressed |
|---|---|---|---|
| G1 | blocking | Classifieds absent; the money Google took first ($19.6B peak 2000) | SCALE.by_money_type.classified, MEDIUM, BUYERS |
| G2 | blocking | MEASUREMENT missing as a field | MEASUREMENT (schema v2 now has it) |
| G3 | blocking | Distribution, not auction design, was the decisive lever (AOL 2002; network 41% of Google revenue 2006; TAC 32%) | SELLERS, PRICING, EVENTS |
| G4 | blocking | Search's money came from classifieds/YP/direct response, not TV brand budgets | BUYERS, SCALE splits, MEDIUM |
| G5 | blocking | 'Capture' premise contested: ad/GDP peaked 2000, fell through the AdWords years | SCALE |
| G6 | blocking | 'The auction design won' is contested (Overture had the auction first) | PRICING + SELLERS summaries, boundary_notes |
| G7 | blocking | Per-query unit economics missing | unit_economics block |
| G8 | blocking | 2007/2008 series break (Coen MCE ends 2007; Magna MG8 different object) | SCALE claims + boundary_notes |
| G9 | major | Yellow Pages / directories (~$14.7B peak 2005) | MEDIUM, SCALE, PRICING |
| G10 | major | Direct mail tracked in every era | MEDIUM, SCALE |
| G11 | major | Agency structural arc / death of the 15% commission / self-serve disintermediation | CREATORS, PRICING |
| G12 | major | Self-serve, no minimums: market creation not just capture | BUYERS, CREATORS |
| G13 | major | Seller became the auditor | MEASUREMENT |
| G14 | major | Direct-response measurement lineage predates the web | MEASUREMENT, TARGETING |
| G15 | major | IRS SOI advertising deductions as the A-grade validator | SCALE |
| G16 | major | Traditional media did not collapse; newspapers peaked 2005, TV share rose | MEDIUM |
| G17 | major | Timeline corrections (AdWords CPM Oct 2000; Overture led through 2002; patent settlement) | EVENTS, boundary_notes |
| G18 | major | GSP was tuned later — frame AdRank as expected-revenue ranking from the start | PRICING |
| G19 | minor | April 2004 trademark-keyword policy change | EVENTS, TARGETING |
| G20 | minor | Dot-com crash as the mechanism-forcing event | boundary_notes (era 5 owns) |
| G21 | minor | ad/GDP folklore contested | SCALE |
| G22 | minor | Who pays the measurer | MEASUREMENT |

## 3. Source log

(appended field by field below)

### 3.1 SCALE / MEDIUM — primary series pulled (2026-07-30)

**Coen Structured Advertising Expenditure Dataset (CS Ad Dataset)**, Douglas Galbi's
machine-readable rendering of Robert Coen / McCann-Erickson (Universal McCann) estimates.
Downloaded https://www.galbithink.org/cs-ad-dataset.xls and parsed locally. US $millions:

| year | Grand Total | Newspapers | Direct Mail | Yellow Pages | Bcast TV | Cable | Radio | Magazines | Internet | OOH | Misc | Bus.Papers | Local | National |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
|2000|247,472|49,050|44,591|13,228|44,802|15,455|19,295|12,370|6,507|5,176|32,083|4,915|95,808|151,664|
|2001|231,287|44,255|44,725|13,592|38,881|15,736|17,861|11,095|5,645|5,134|29,895|4,468|89,490|141,797|
|2002|236,875|44,031|46,067|13,776|42,068|16,297|18,877|10,995|4,883|5,175|30,730|3,976|91,446|145,429|
|2003|245,477|44,843|48,370|13,896|41,932|18,814|19,100|11,435|5,650|5,443|31,990|4,004|92,995|152,482|
|2004|263,766|46,614|52,191|14,002|46,264|21,527|19,581|12,247|6,853|5,770|34,645|4,072|96,670|167,096|
|2005|271,074|47,335|55,218|14,229|44,293|23,654|19,640|12,847|7,764|6,232|35,692|4,170|98,277|172,797|
|2006|281,653|46,555|58,642|14,393|46,880|25,025|19,643|13,168|9,100|6,731|37,321|4,195|99,170|182,483|
|2007|279,612|42,133|60,225|14,250|44,521|26,319|19,152|13,787|10,529|7,202|37,383|4,111|94,332|185,280|

Galbi's %-of-GDP column: 2000 2.5, 2001 2.3, 2002 2.3, 2003 2.2, 2004 2.3, 2005 2.2, 2006 2.1, 2007 2.0.
**Caveat carried into the record:** the workbook's own `internet` sheet says "The Coen internet ad
expenditure figures are serious underestimates for 2004-2007" and tabulates IAB against Coen
(2007: Coen 10,529 vs IAB 21,206). So the Coen grand total for 2007 is low by roughly $10B, and the
Coen internet line must never be used as the era's internet number. Coen is also list-price billings
(Silk & Berndt), so grade B max.

**NAA official tables** (recovered from Wayback of naa.org/docs/Research, "Research Dept., Newspaper
Association of America, 3/11"): newspapers print vs online vs by category. Print total peaks 2000
($48,670M); print+online peaks 2005 ($49,435M) — this reconciles the "newspapers peaked 2005"
claim (NAA combined) with Coen's 2000 peak (print only). Classified: 2000 $19,608.7M peak, 2002
$15,898.2M, 2005 $17,311.7M (a real intra-era rebound on real-estate money), 2007 $14,185.9M, 2008
$9,975.0M, 2009 $6,179.0M. Employment classified: 2000 $8,712.6M → 2002 $4,387.8M → 2007 $3,804.6M
→ 2008 $2,186.4M → 2009 $786.8M. Real estate classified peaks 2006 ($5,155.2M) then -22.6% 2007,
-37.8% 2008 (housing bust, not Google). NAA's own all-media table shows Out of Home jumping from
$1,576M (1998) to $4,780M (1999) — the Billboards→OOH redefinition, ~3x, at 1999 not 2000.

**Google SEC filings (grade A).** FY2004 10-K, FY2005 10-K, FY2008 10-K:
revenue 2002 $439.508M / 2003 $1,465.934M / 2004 $3,189.223M / 2005 $6,138.560M / 2006 $10,604.917M /
2007 $16,593.986M / 2008 $21,795.550M. Google-owned-sites ad revenue 2002 $306.978M → 2008
$14,413.826M. Network (AdSense) ad revenue 2002 $103.937M → 2004 $1,554.256M (48.7% of total
revenue — the network peak) → 2006 $4,159.831M (39.2%) → 2008 $6,714.688M (30.8%).
TAC: 2002 $94.5M (23% of ad revenue; **91% of network ad revenue**), 2003 $526.5M (37%; 84% of
network), 2004 $1,228.7M (39%; 79% of network), 2005 $2,114.9M (35%), 2006 $3,308.8M (31.5%),
2007 $4,933.9M (30.1%), 2008 $5,939.0M (28.1%). US revenue 2006 $6,030.1M / 2007 $8,698.0M /
2008 $10,635.6M. AOL alone = 16% / 12% / 9% of total Google revenue in 2003 / 2004 / 2005.
Overture patent settlement: 2,700,000 Class A shares issued to Yahoo, $201.0M non-cash charge, Q3
2004. IPO: 19,605,052 shares registered at $85.00 (= $1.666B base offering); Google itself sold
14,142,135 shares (~$1.202B gross).

**Overture FY2002 10-K (grade A).** Revenue $667.7M (2002) vs $288.1M (2001); paid introductions
1.4B → 2.2B; average price per paid introduction $0.20 → $0.31; advertisers ~53,000 (Dec 2001) →
~80,000 (Dec 2002); minimum bid 10 cents **and a $20 minimum monthly spend**; every listing passes
editorial review; lost AOL US distribution during 2002. Yahoo's July 2003 merger release put
Overture at ~95,000 active paying advertisers.

Dead ends: NAA's post-2013 series was withdrawn (Pew now extrapolates); the Search Engine Watch
2002 AOL article and Seattle Times both 403 to the fetcher; Coen's global figures are not in the
CS workbook.

### 3.2 SELLERS / PRICING — Google and Overture filings

Google Q2 2006 8-K exhibit 99.1 confirms the probe's figures exactly: Google Network revenue
$997M = **41% of total revenue**, TAC $785M = **32% of advertising revenue**. Full-year 2006
(10-K) is 39.2% and 31.5%. The record carries the quarterly 41%/32% as the headline (matching the
constraint) with the annual figures named in the same claim.

Google Q4 2008 8-K: aggregate paid clicks +18% YoY; TAC 27% of ad revenue in the quarter.
Google never disclosed absolute paid clicks, average CPC, or query counts in the era — the only
disclosed keyword price anywhere in the era is Overture's $0.31 average per paid introduction.

Take-rate series (Google's cut of syndicated inventory), computed from disclosed TAC-over-network-
revenue: 9% (2002), 16% (2003), 21% (2004), 21.3% (2008). This is the single strongest
corroboration of the reported ~85% AOL revenue share: an 84% payout in 2003, the year AOL was 16%
of Google's revenue, is exactly what an 85% AOL deal plus lower-share smaller partners produces.

AOL deal terms ($100M guarantee, 85% share) could NOT be confirmed in any SEC filing or
contemporaneous wire report I could fetch. The Search Engine Watch (2002-04-30), Search Engine
Watch (2007 paid-search mechanics) and Seattle Times pages all return HTTP 403 to the fetcher.
The figure traces to John Battelle's *The Search* (2005) and is repeated widely. Graded **B** with
ci80 [75, 150], and the corroborating 10-K structure is cited alongside. **Not** sourced from any
podcast. If R3 can retrieve the Battelle page number or a 2002 wire story, this claim upgrades.

### 3.3 UNIT ECONOMICS — the Fermi build (grade C, method in the record)

Question: US-dollar advertising revenue and serving cost per Google search query, calendar 2007.

Decomposition and anchors:
- Numerator (revenue): Google web-sites advertising revenue 2007 = $10,624.705M — 10-K, grade A.
- Denominator (queries): two independent anchors agree. comScore qSearch: 37.1bn Google searches
  worldwide in August 2007 (of 61bn all engines). Kevin Kelly (Oct 11, 2007) independently used
  111bn Google searches per quarter = 37bn/month. Google grew ~30-40%/yr, so the calendar-2007
  average monthly rate is below the August rate: ~34-35bn/month → **~415bn queries for 2007**.
- Cost: non-TAC cost of revenues 2007 = $6,649.1M − $4,933.9M = $1,715.2M (10-K, grade A).

Results: revenue/query $0.0256; cost/query $0.0035 (bounded by Kelly's $0.0028 below and the
full non-TAC allocation $0.00413 above); gross margin per owned query 86%.

Bounds and sanity checks:
- Query range 350-500bn gives revenue/query $0.0212-$0.0304; widened to [0.018, 0.033] because
  Google-owned-site revenue includes non-search properties and comScore's query definition is not
  Google's monetisable-query definition.
- Cross-check via clicks: at a plausible 2007 average CPC near $0.50, $0.0256/query implies ~5 paid
  clicks per 100 searches. Plausible when most queries are non-commercial. Passes.
- Cross-check via reported margins: Google's 2007 gross margin was 59.9% and operating margin 30.6%
  ($5,084.4M on $16,594.0M). The 86% per-owned-query gross margin is higher precisely because it
  excludes TAC (30.1% of ad revenue in 2007), which is a distribution cost, not a serving cost.
  This is the twin-engine result in one line: the auction's yield is ~86% margin; distribution
  costs ~30 points of it.
- Triangulated era-start value for PRICING: 2002 Google-owned ad revenue $306.978M over ~54.8bn
  queries (Google Zeitgeist 2001: "more than 150 million queries per day") = $0.0056/query. Yield
  per query rose ~4.6x across the era.

Deliberately NOT used: the SemiAnalysis ~1.06c cost / ~1.61c revenue per query figures — those are
a 2022-2023 vintage and belong to era 7's comparison series.

### 3.4 Conflicts kept visible (not averaged)

1. **Newspaper peak year.** Coen (print only) peaks 2000 at $49,050M; NAA print-only peaks 2000 at
   $48,670M; NAA print+online peaks **2005** at $49,435M. Recorded as the 2005 combined peak with
   the 2000 print peak stated in the same claim.
2. **Yellow Pages peak.** Coen shows a 2007 high of $14,250M; trade retrospectives say $14.7bn in
   2005. ci80 widened to [13,800, 14,800] and both sources cited.
3. **Internet totals.** Coen 2007 $10,529M vs IAB/PwC $21,206M. Recorded as its own claim
   (e6-medium-006) rather than reconciled; the SCALE total is a documented grade-C adjustment.
4. **Click-fraud rate.** Click Forensics ~14-17% vs Google's low-single-digit internal figure.
   ci80 [8, 20] spans both camps; no averaging.
5. **US market size definition.** GroupM measured-media US 2007 = $162.6bn vs Coen all-media
   $279.6bn. Flagged in boundary_notes as definitional, not a discrepancy.
6. **Network share 2006.** Q2 41% (8-K) vs full year 39.2% (10-K). Both in one claim.
7. **Overture settlement value.** $201.0M accounting charge (10-K) vs ~$229.5M at the $85 IPO
   price (2.7M shares). Constraint says "~$230M"; ci80 [201.0, 229.5] carries both.

### 3.5 Constraint check

| Constraint | Status |
|---|---|
| AdWords launched Oct 2000 as CPM; auction arrives Feb 2002 | Honoured in boundary_notes + events |
| Overture led paid search through 2002; settlement ~2.7M shares / ~$230M | e6-sellers-001, e6-events-005 (both valuations carried) |
| Radio never #1 US medium | Not contradicted; radio ~$19bn, 4th-6th all era |
| Newspapers out-earned TV into the 1950s-70s | Out of period; not contradicted |
| OOH replaced Billboards in 2000 at ~3x | Not claimed in the record. **Evidence note for the parent:** the CS Ad Dataset notes say "out of home" was introduced in **1999** and billboards dropped in 2000; NAA's all-media table shows Billboards $1,576M (1998) → Out of Home $4,780M (1999), i.e. ~3.0x at the 1998/1999 join. The magnitude in the constraint is confirmed; the year is 1999-2000 depending on which side of the transition is named. No record field depends on it. |
| Wanamaker quote / first banner ad are legend | Neither appears in the record |
| Classifieds, directories, direct mail tracked every era | All three carry claims (e6-scale-009, e6-medium-002, e6-medium-001) |
| No number from the Acquired or Stratechery podcasts | Confirmed — zero podcast sources; all 66 claims cite filings, official industry tables, trade press, or academic work |

### 3.6 Seed-gap disposition

Addressed in the record: G1 (classified, SCALE/BUYERS/MEDIUM/EVENTS), G2 (MEASUREMENT field filled),
G3 (distribution engine: e6-sellers-003/004, e6-pricing-003/007, event 2), G4 (source of funds:
SCALE money-type split + e6-buyers-004 showing TV intact), G5 (ad/GDP fell: e6-scale-003), G6
(auction-won contested: SELLERS + PRICING summaries + boundary_notes), G7 (unit_economics block),
G8 (2007/2008 seam: e6-medium-006 + boundary_notes), G9 (Yellow Pages: e6-medium-002), G10 (direct
mail as largest medium: e6-medium-001), G11/G12 (self-serve disintermediation: CREATORS summary,
e6-creators-002/003, e6-pricing-005, e6-buyers-001/002), G13 (seller-as-auditor: MEASUREMENT
summary + e6-measurement-001/003), G14 (DR lineage: e6-scale-010, e6-buyers-008), G16 (traditional
media did not collapse: e6-buyers-004, e6-medium-001/003), G17 (timeline corrections: boundary_notes
+ events), G18 (AdRank framed as expected-revenue ranking in PRICING summary), G19 (April 2004
trademark policy: e6-targeting-002 + event 4), G20 (2001 crash handed to era 5 in boundary_notes),
G21 (ad/GDP folklore: e6-scale-003), G22 (who pays the counter: MEASUREMENT summary).

**Deferred with reason:** G15 (IRS SOI advertising deductions as a parallel A-grade validation
series). The IRS series is cited through Silk & Berndt for the ad/GDP peak, but pulling the annual
IRS SOI corporate advertising-deduction values for 2002-2008 is a dataset-assembly job, not an era
job — it belongs in R2's `adspend.json` as a validation rail, per the probe's own recommendation.
Era 6 records only the IRS peak-year fact it needs.

**Deferred with reason:** the era-6 half of the "2008-2026 by-medium data has no free source" gap.
Era 6 ends in 2008 and the Coen series covers it through 2007 with IAB covering 2008; the sourcing
problem is era 7's.

### 3.7 Open items for R3 (claim verification)

- e6-pricing-007 (AOL $100M guarantee / 85% share): find a 2002 primary or the Battelle page.
- e6-buyers-002 (advertiser count): a period AdGooroo or comScore advertiser census would move this
  from C to B; three triangulation paths currently span 300k-1.1M.
- e6-creators-003: confirm the exact AdWords character limits in force in 2002 vs 2008 (the record
  uses the 25/35/35 text-ad standard; ci80 upper bound allows 130).
- e6-measurement-002: locate the primary Click Forensics quarterly index PDFs rather than trade
  coverage of them.

### 3.8 Cross-era boundary reconciliation (checked against sibling records on disk)

Checked `era-5.json` and `era-7.json` after writing. Claim IDs are unique across all six records
present (era-1, 2, 3, 5, 6, 7 — no duplicates).

Agreements confirmed:
- Era 7 asks era 6 to close on IAB/PwC US internet revenue $21,206M (2007) and hand over $23,448M
  (2008). Both numbers are in this record, exactly.
- Era 7's Coen endpoint ($279.6B total, 2.0% of GDP, series ends 2007) matches e6-scale-003 and
  boundary_notes exactly.
- Era 7 asks era 6 to record the DoubleClick *announcement* (April 2007) and leave the *close*
  (2008-03-11) to era 7. Done — event 9 and e6-targeting-004 both say "agreed to acquire".
- Era 7 asks era 6 not to claim GSP survived. boundary_notes explicitly hands the mechanism's death
  to era 7.
- Era 5's Google FY2001 revenue ($86.4M) is consistent with this record's FY2002 $439.5M.

Two boundary items reconciled rather than contradicted:
1. **Overture's minimum bid.** Era 5 records a $0.05 minimum bid as of December 2001. Overture's
   FY2002 10-K states that as of that filing "all new U.S. Overture advertisers must commit to a
   minimum bid per listing of 10 cents and a minimum $20 monthly spend." Both are right: Overture
   doubled its floor during 2002, the same year Google set its floor at 5 cents. e6-pricing-005 has
   been reworded to state the transition explicitly so V1 does not read it as a disagreement.
2. **Overture's average price per click for 2001.** Era 5 records $0.23; Overture's FY2002 10-K
   gives $0.20 for the full year ended 2001 and $0.31 for 2002. The likely reconciliation is that
   $0.23 is a Q4 2001 figure from the FY2001 10-K, not a full-year figure. Flagged for the parent —
   era 6 uses only the full-year 2001 ($0.20) and 2002 ($0.31) figures, both from the FY2002 10-K.
