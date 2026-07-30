# Era 3 — "The Spot Market" (1950–1975) — working notes and source log

Internal working document — exempt from the readability gate, per PLAN.md.
Agent: market-era-historian (R1 fan-out). Record: `p2-ad-market/data/eras/era-3.json`.
Written 2026-07-30.

## 1. Scope statement

In scope: the US ad market, 1950–1975. This is when TV scales up. Sponsor-owned shows
die. Network-owned inventory takes their place, sold as participations — first 60s, then
30s. The upfront becomes the yearly clearing event. Nielsen becomes the currency.
Newspapers keep the #1 spot on local retail plus classified money.

Out of scope, left to siblings. Era 2 owns radio sponsorship, Crossley/CAB/Hooper, and the
WWII excess-profits-tax subsidy. Era 4 owns cable, the 1987 People Meter, PRIZM, media
unbundling, holding-company roll-ups after 1976, and the actual death of the 15%
commission — which happens in the 1990s and 2000s, not here. The 1975/1976 hand-off
numbers are in `boundary_notes`.

## 2. Constraint check (from PLAN.md §2)

- Radio never #1 by spend: confirmed for this era. Coen: radio peaks at $605M in 1950
  (10.6% of total) versus newspapers $2,070M (36.3%). Radio is 4th or 5th all era.
- Newspapers out-earn TV deep into 1950s–70s: confirmed and quantified. Newspapers
  $8,234M vs TV $5,263M in 1975; newspapers are still #1 in 1978 (29.0% share) per
  S&P/McCann via CRS 80-130. TV never passes newspapers inside era 3.
- Out of Home / Billboards category change is a 2000 event — out of period. Coen carries
  "Billboards" for 1935–1999, so era 3 uses Billboards.
- Classifieds, directories, direct mail tracked: classifieds sourced (HSUS De523-526),
  direct mail sourced (Coen), Yellow Pages NOT separately carried by Coen before 1980 →
  triangulated, grade C, method documented.
- Wanamaker quote / first banner ad: not era-3 material; not used.

## 3. Seed gaps assigned to era 3 (from unknown-unknowns-probe.json)

12 gaps list era "3". Disposition:

| Gap | Severity | Disposition |
|---|---|---|
| Classified advertising absent | blocking | ADDRESSED — SCALE/BUYERS `classified` claim from HSUS De523-526; PRICING covers per-line self-serve; MEDIUM tracks it |
| MEASUREMENT missing as field | blocking | ADDRESSED — schema v2 has MEASUREMENT; filled with Nielsen NTI/NSI, Audimeter→SIA, ARB, BRC/MRC, who paid the counter |
| brand vs DR vs local money distinction | major | ADDRESSED — by_money_type on SCALE and BUYERS, partitioning the Coen total exactly |
| Yellow Pages / directories missing | major | PARTIAL — no pre-1980 Coen series; grade-C back-cast (e3-medium-010) + qualitative structure (per-category tiered placement, annual contract, phone-company salesforce) |
| Direct mail mis-slotted to era 4 | major | ADDRESSED — direct mail is the era's #3 medium and the #1 *national* medium in 1975; Wunderman/DMAA in TARGETING |
| Agency structural arc stops at 15% | major | ADDRESSED — CREATORS covers the 1956 DOJ consent decree, the creative revolution, Interpublic 1961, and early à-la-carte pressure; commission's *death* deferred to eras 4/6 |
| Truth/audited-circulation trust infra | major | NOTED — ABC is era 1; era 3 adds the BRC (1964) as the broadcast analogue, and boundary_notes carries the chain |
| Ratings-institution story eras 2–4 | major | ADDRESSED — Harris hearings 1963–64 → Broadcast Rating Council; SIA 1973 |
| Regulatory layer moved money | major | ADDRESSED — 1971 cigarette broadcast ban + PTAR as EVENTS with numbers |
| Audience-commodity spine (Smythe) | minor | NOTED only — framing, not a claim |
| Who pays the measurer | minor | ADDRESSED inside the MEASUREMENT summary |
| Sponsorship→spot is a mid-era PRICING change | minor | ADDRESSED — PRICING narrates it; EVENTS carry 1959, 1962 and 1971 |

## 4. Data backbone acquired

### 4.1 Coen Structured Advertising Expenditure Dataset (CS Ad Dataset v1.14)
Downloaded `https://www.galbithink.org/cs-ad-dataset.xls` (Douglas Galbi's digitisation of
Robert J. Coen / McCann-Erickson, 1919–2007). Categories confirmed: Newspapers
(National/Local), Magazines, Television (Network / Spot national / Spot local),
Radio (Network / Spot nat'l / Spot local), Direct Mail, Business Papers, Farm Publications,
Billboards, Miscellaneous (National/Local), plus Total National and Total Local.
**Yellow Pages only exists in Coen from 1980** (it sits inside Miscellaneous before that).
That is the single biggest data hole for era 3.

US ad expenditure, $ millions, current dollars (Coen/CS Ad Dataset):

| yr | TOTAL | Nat'l | Local | News | NewsNat | NewsLoc | Mags | TV | TVnet | TVspotN | TVspotL | Radio | DirMail | BizPapers | Billboards | Misc |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
|1949|5,210|2,990|2,220|1,911|463|1,448|458|58|30|9|19|571|756|248|131|1,022|
|1950|5,700|3,260|2,440|2,070|518|1,552|478|171|85|31|55|605|803|251|142|1,122|
|1953|7,740|4,515|3,225|2,632|606|2,026|627|606|320|145|141|611|1,099|395|176|1,523|
|1954|8,150|4,820|3,330|2,685|607|2,078|629|809|422|207|180|559|1,202|408|187|1,600|
|1955|9,150|5,380|3,770|3,077|712|2,365|691|1,035|550|260|225|545|1,299|446|192|1,793|
|1956|9,910|5,940|3,970|3,223|754|2,469|758|1,225|643|329|253|567|1,419|496|201|1,948|
|1960|11,960|7,305|4,655|3,681|778|2,903|909|1,627|820|527|280|693|1,830|609|203|2,342|
|1965|15,250|9,340|5,910|4,426|784|3,642|1,161|2,515|1,237|892|386|917|2,324|671|180|2,985|
|1968|18,090|10,800|7,290|5,232|889|4,343|1,283|3,231|1,523|1,131|577|1,190|2,612|714|208|3,552|
|1970|19,550|11,350|8,200|5,704|891|4,813|1,292|3,596|1,658|1,234|704|1,308|2,766|740|234|3,848|
|1971|20,700|11,755|8,945|6,167|972|5,195|1,370|3,534|1,593|1,145|796|1,445|3,067|720|261|4,079|
|1975|27,900|15,200|12,700|8,234|1,109|7,125|1,465|5,263|2,306|1,623|1,334|1,980|4,124|919|335|5,506|
|1976|33,300|18,355|14,945|9,618|1,342|8,276|1,789|6,721|2,857|2,154|1,710|2,330|4,786|1,035|383|6,552|

Derived crossings (my arithmetic on Coen; TV national = network + national spot):
- **TV total passes radio in 1954** (809 vs 559; 1953 was 606 vs 611, a dead heat).
- **TV total passes magazines in 1954** (809 vs 629).
- **TV *national* passes newspaper *national* in 1954** (629 vs 607). TV never passes
  newspapers in total inside the era.
- **TV national passes direct mail only 1968–1970** (1968: 2,654 vs 2,612). It falls behind
  again 1971–1975 after the cigarette ban and PTAR, then retakes the lead in 1976
  (5,011 vs 4,786). Direct mail is the largest single *national* medium in 1975.
- 1971 is the only down year for TV in the era (3,596 → 3,534, −1.7%) while total US spend
  rose 5.9%.
- National share of total falls 57.2% (1950) → 54.5% (1975); local rises 42.8% → 45.5%.

Money-type partition used in the record (exact, additive to the Coen total):
`national_brand = Total National − Direct Mail`; `local_retail = Total Local − classified`;
`classified = HSUS De526`; `direct_response = Direct Mail`.
1950: 2,457 / 2,063 / 377 / 803 = 5,700 ✓ (43.1% / 36.2% / 6.6% / 14.1%).
1975: 11,076 / 10,541 / 2,159 / 4,124 = 27,900 ✓ (39.7% / 37.8% / 7.7% / 14.8%).
**Finding worth a thread:** the money mix barely moves across 25 years, while TV goes from
3% to 19% of spend. TV's rise was a reallocation *inside* national brand money, not a
change in what kinds of money existed. Direct input to the capture/expansion/reallocation
argument in chapter 09.

### 4.2 HSUS Millennial Edition, Table De523-526 (newspaper ad revenue by type)
`https://hsus.cambridge.org/HSUSWeb/toc/treeTablePathIdDe523-526.html` — "Newspaper
advertising expenditures: 1950-2001", columns Total / Retail / National / Classified.

| yr | Total | Retail | National | Classified | Classified % of newspaper | Classified % of ALL US ad |
|---|---|---|---|---|---|---|
|1950|2,070|1,175|518|377|18.2%|6.6%|
|1960|3,681|2,100|778|803|21.8%|6.7%|
|1965|4,426|2,429|783|1,214|27.4%|8.0%|
|1970|5,704|3,292|891|1,521|26.7%|7.8%|
|1975|8,234|4,966|1,109|2,159|26.2%|7.7%|

Rows reconcile exactly to the Coen newspaper totals. The CS workbook's own "naa comparison"
sheet shows Coen newspapers ≡ NAA newspapers for every year 1950–1989 (ratio 1.000). The two
series are the same lineage — I do NOT treat them as independent confirmations.

### 4.3 TV household penetration (Nielsen via TVB)
`https://www.tvb.org/wp-content/uploads/2022/10/National-TV-Household-Penetration-Trends.pdf`
Total US HH / TV HH / % with TV — 1950: 43,000k / 3,880k / 9.0%. 1955: 47,620k / 30,700k /
64.5%. 1960: 52,500k / 45,750k / 87.1%. 1965: 56,900k / 52,700k / 92.6%. 1970: 61,410k /
58,500k / 95.3%. 1975: 70,520k / 68,500k / 97.1%.

### 4.4 CRS Report 80-130 E, *Commercial Television Broadcasting* (30 June 1980)
`https://www.everycrsreport.com/files/19800630_80-130_eafa82e1547b35d16e86f1ee64e4dcbb4d996ea3.pdf`
Scanned; text layer extracted locally with `pdftotext -layout`. The Appendix A numeric tables
did not survive extraction; the narrative did. Useful:
- FCC annual statistics: TV broadcast industry revenues rise continuously from $324.2M
  (1952) "with the exception of the 1970-1971 period" — the cigarette-ban dip in FCC data.
- "By the late 1950s and early 1960s… the advertiser/sponsor no longer controlled the
  shows, but the networks produced or bought the program and sold time to the advertiser."
- Media shares (S&P Industry Surveys from McCann-Erickson data): newspapers 30.1% (1972)
  → 29.0% (1978) → 28.5% (1979 est); TV 17.6% (1972) → 20.2% (1978) → 20.4% (1979 est).
  National = 55% of the market in 1978. (Boundary fact for era 4.)
- For 1979–80, "75–80 percent of the prime-time schedule was sold in the upfront…at prices
  15 percent or more higher than in the previous season."
- FCC multiple-ownership rules: November 1953 rules; 1954 expansion to seven TV stations,
  five VHF plus two UHF (43 FCC 2797 [1954]).
- 1979 TVB data (era-4 boundary): TV market $9.71bn — network 48%, national spot 30%,
  local 22%. P&G largest TV advertiser at $463.4M network + national spot. Top 20 firms =
  27.1% of total TV ad spend; top 100 = 56.9%.

### 4.5 Zeigler & Howard, *Broadcast Advertising*, 3rd ed. (1991)
`https://www.worldradiohistory.com/BOOKSHELF-ARH/Education/Broadcast-Advertising-Zeigler-Howard-3rd-1991.pdf`
- "From 1948 to about 1960, network TV shows were sold to sponsors… Ultimately, after
  networks began scheduling feature-length motion pictures around 1960, the 60-second spot
  became the basic advertising unit… two 30-second commercials could be incorporated into a
  60-second time slot, giving impetus to the practice of piggybacking which was prominent
  during the 1960s."
- **Network prime-time cost per commercial MINUTE: $30,000 in the early 1960s; $65,000 by
  1970.** (~$50,000 per :30 by the late 1970s; ~$125,000 per :30 by the late 1980s.)
- Take-rate stack as standing practice: media bill the agency gross, agency keeps **15%**,
  plus a **2% prompt-payment cash discount** on the net (often passed to client).
  **Station rep firms** take a *negotiated* commission, "normal range about 5 to 20
  percent," computed on the amount left after the agency's 15% is deducted.
- Table 1.1 (Television Factbook): gross broadcast advertising revenues, Radio/TV $M —
  1950 453.6/105.9; 1955 456.5/744.7; 1960 591.8/1,456.2; 1965 827.8/2,265.9;
  1970 1,256.8/3,242.8; 1975 1,892.3/4,722.1. **These differ from Coen** (TV 1975: 4,722 vs
  5,263; radio 1950: 454 vs 605). Different definitions — Factbook counts amounts paid for
  use of broadcast facilities including commissions; Coen counts total advertiser
  expenditure. Conflict kept visible by widening ci80 on e3-medium-001 and e3-medium-002.
- Stations count: 1970 501 VHF + 176 UHF = 677; 1975 514 + 192 = 706.
- Late-1980s confirmation of the era's structural fact: "TV continues to rank second to
  newspapers in total advertising volume… [but] has long been the number one **national**
  advertising medium in the United States. (It is exceeded slightly by the amorphous direct
  mail form.) Local advertisers continue to prefer newspapers."

### 4.6 Silk & Berndt, HBS WP 11-039, *The Unbundling of Advertising Agency Services*
`https://www.hbs.edu/ris/Publication%20Files/11-039.pdf` (text extracted locally)
- The "recognition system": trade practices fixing a 15% commission and blocking rebating.
- Two antitrust attacks; first dismissed 1930, second produced the 1956 consent decree
  signed by the AAAA plus five publisher associations.
- The complaint covered only national print advertising: 35% of US national advertising and
  21% of total US ad spend in 1956. Direct mail (24% of national) and broadcast (20% of
  national) were untouched. I re-derived all three from Coen 1956 and they reconcile.
- Commission survived: 71% of the largest US national advertisers still used commission in
  1982; 61% in 1994; 10% by 2003, with 74% on fees.
- By the early 1970s clients were pressing agencies to unbundle; several agencies offered
  creative and media "à la carte". Ogilvy & Mather's cost-plus-fee plan dates from 1969.

### 4.7 World Bank GDP (current US$), for the ratio claims
`https://api.worldbank.org/v2/country/WLD;USA/indicator/NY.GDP.MKTP.CD?date=1950:1976&format=json`
1960 world 1,367.7bn / US 542.0bn; 1965 1,997.7 / 741.9; 1970 3,009.5 / 1,073.3;
1975 6,048.0 / 1,684.9. Ad/GDP: 1960 2.21%, 1965 2.06%, 1970 1.82%, 1975 1.66%.
Galbi's own published %GDP column runs 0.05–0.10pp higher (1950 1.9, 1955 2.2, 1960 2.3,
1965 2.1, 1970 1.9, 1975 1.7) — a different GDP vintage or GNP. Both cited; ci80 holds both.

## 5. Claim inventory (62 claims)

| Field | Claims | IDs |
|---|---|---|
| CREATORS | 5 | e3-creators-001…005 |
| BUYERS | 9 (5 + 4 money-type) | e3-buyers-001…009 |
| SELLERS | 5 | e3-sellers-001…005 |
| MEDIUM | 11 | e3-medium-001…011 |
| SCALE | 11 (7 + 4 money-type) | e3-scale-001…011 |
| PRICING | 8 | e3-pricing-001…008 |
| MEASUREMENT | 5 | e3-measurement-001…005 |
| TARGETING | 5 | e3-targeting-001…005 |
| EVENTS | 3 | e3-events-001…003 |

Grades: 3 × A, 46 × B, 13 × C. Every C carries a `method` field.
The three A-grade claims are the 1956 DOJ final judgment (e3-creators-001), the FCC
seven-station ownership cap (e3-sellers-002), and the ZIP code introduction
(e3-targeting-004). Events: 10, all dated, three carrying claims.

## 6. Open gaps, dead ends and judgment calls

1. **Yellow Pages / directory spend before 1980.** Coen does not break it out until 1980
   ($2,900M, 5.4% of total). Searched: Coen/Galbi categories, Bell System annual reports,
   Yellow Pages Publishers Association and Local Search Association histories. No annual
   pre-1980 series located. → grade-C back-cast at e3-medium-010, method in the claim.
   This is the era's biggest remaining hole and a good R3 target.
2. **Global (world) advertising expenditure.** Searched the Starch INRA Hooper / IAA
   "Survey of World Advertising Expenditures" (ISSN 0894-5004), the UNESCO-hosted 1990
   edition (403 to the fetcher), Visual Capitalist's 1980–2020 series (no 1980 number in
   the text), and McCann/Coen world estimates. No sourceable era-3 world total found. →
   grade-C triangulation at e3-scale-007, two independent paths, wide interval.
3. **Share of network programming under sponsor control, 1957 vs 1968.** The number exists
   in the FCC Office of Network Study reports and in Boddy and Barnouw, but I could not
   reach a citable figure online. Recorded qualitatively (CRS narrative) rather than as an
   invented number. Flagged for R3.
4. **Exact year the :30 overtook the :60 as the majority network unit.** Secondary sources
   converge on the 1970–71 season but none gives a percentage split. The record dates the
   change to 1971 in EVENTS and makes no share claim.
5. **1967 ABC / American Home Products "first guaranteed CPM deal".** Appears in the
   Westwood One upfront history and nowhere I could verify. **Not used in the record.** It
   is a plausible but unverified first; if R3 or R4 wants it, it needs a primary.
6. **Coen vs Television Factbook TV-revenue conflict** (§4.5). Not averaged; both cited and
   ci80 widened on e3-medium-001/002.
7. **Cigarette-ban dollar figures conflict.** EBSCO gives ~$225M/yr to broadcasters and
   ~$50M/yr to print; another account says ">$150M on television"; eh.net Table 2 gives
   $296.6M of five-media cigarette advertising in 1970. Interval on e3-buyers-004 spans
   150–250. The scout probe's specific tobacco print figures ($64.2M 1970 → $157.6M 1971)
   could not be re-verified against either cited source and are **not** in the record.
8. **PRIZM launch date.** Sources say 1974 and 1978. Out of my period; flagged in
   boundary_notes for era 4 to resolve rather than inherit.
9. **Average prime-time household rating** used in the CPM derivation (19–20) is an
   assumption, not a sourced number. Stated in the method; interval spans 15–25.
10. **Nielsen SIA date.** One source dates the Storage Instantaneous Audimeter to 1958,
    most to September 1973. The 1958 date almost certainly refers to an earlier Audimeter
    revision. The record uses September 1973 with the 36-hour turnaround, which is
    internally consistent with the "black weeks" account.

## 7. Sources not used

Acquired and Stratechery podcasts: not consulted, per the rigor spec.
Campaign, "History of advertising: No 189" describes TV as "emerging as the nation's
biggest advertising medium" in the late 1950s. That contradicts the Coen series and the
PLAN constraint, so it is not used as evidence.
