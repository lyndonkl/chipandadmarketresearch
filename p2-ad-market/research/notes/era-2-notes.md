# Era 2 — "Sponsorship" (1918–1949) — working notes and source log

Agent: market-era-historian (R1 fan-out). Record: `p2-ad-market/data/eras/era-2.json`.
Written 2026-07-30.

## 1. Scope statement

Inside my period: the US advertising market from the end of WWI through 1949 — the years in which
broadcast advertising was invented and priced, print stayed dominant, direct mail stayed the #2
medium, ratings institutions (CAB → Hooper → Nielsen) turned listening into a salable commodity,
and the WWII excess-profits tax made a marginal advertising dollar nearly free for profitable
corporations. Left to siblings: era 1 owns agency formation, the invention of the 15% commission,
the penny press and ABC's 1914 founding; era 3 owns the death of sponsorship, the 30-second spot,
the upfront, Nielsen's demographic pricing, and everything television after 1949 (TV enters my
series in 1949 at $58M and I stop there).

## 2. Hunt plan (what I went after, per field)

| Field | Primary targets |
|---|---|
| SCALE / MEDIUM | Coen "CS Ad Dataset" (the actual .xls, not a summary page); Silk & Berndt NBER WP 28161 for provenance; HSUS De523-526 for the 1950 newspaper split |
| SELLERS / PRICING | FCC *Report on Chain Broadcasting* (May 1941) — full text, a genuine primary with audited industry financials |
| MEASUREMENT | Beville, *Audience Ratings* (1988), full PDF at worldradiohistory.com — near-primary, author was NBC's research chief |
| CREATORS | FCC 1941 ch. VI on agency program production; Meyers scholarship; MBC radio encyclopedia; Hower via Galbi for N.W. Ayer receipts |
| BUYERS / TARGETING | P&G daytime-radio record; Coen national/local partition; Coen magazine sub-splits |
| WWII | Revenue Act of 1942 text/summaries; Stole, *Advertising at War*; Ad Council founding record |

## 3. The quantitative backbone I obtained

**Downloaded and parsed the actual Coen CS Ad Dataset** (`https://www.galbithink.org/cs-ad-dataset.xls`,
Douglas Galbi's structured version of Robert Coen / McCann-Erickson). This is far better than the
summary web table: it carries a full media × national/local partition from 1935 and totals from 1919.
Key extracted rows (US $ millions, current):

| Year | Total | Newspapers | Magazines | Radio | Direct Mail | Bus. Papers | Billboards | Farm | Misc | TV | Nat'l | Local |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1919 | 1,930 | 567 | — | 0 | — | — | — | — | — | — | — | — |
| 1929 | 2,850 | 1,211 | — | 35 | — | — | — | — | — | — | — | — |
| 1933 | 1,325 | 651 | — | 76 | — | — | — | — | — | — | — | — |
| 1935 | 1,720 | 761 | 130 | 113 | 282 | 51 | 31 | 10 | 342 | — | 890 | 830 |
| 1940 | 2,110 | 815 | 186 | 215 | 334 | 76 | 45 | 19 | 420 | — | 1,190 | 920 |
| 1942 | 2,160 | 797 | 179 | 260 | 329 | 98 | 44 | 18 | 435 | — | 1,220 | 940 |
| 1945 | 2,840 | 919 | 344 | 424 | 290 | 204 | 72 | 32 | 555 | — | 1,740 | 1,100 |
| 1949 | 5,210 | 1,911 | 458 | 571 | 756 | 248 | 131 | 55 | 1,022 | 58 | 2,990 | 2,220 |

Radio sub-splits (network / national spot / local spot): 1935 63/15/35; 1940 113/42/60;
1945 198/92/134; 1949 203/123/245. Newspapers local/national: 1935 613/148; 1949 1,448/463.
Magazines 1935: monthlies 25, weeklies 54, women's 51.

Ad/GDP (Coen ÷ BEA, from the same Galbi page): 1919 2.5%, **1922 3.0% (series maximum, 1919–2007)**,
1929 2.8%, 1933 2.3%, 1940 2.1%, **1944 1.2% (series minimum)**, 1949 1.9%.

Derived (my arithmetic, all grade C where used as claims):
- 1929→1933 collapse: −53.5%.
- 1919→1949 nominal CAGR: 3.37%.
- Radio's share peaks at **14.9% (1945)**; newspapers' minimum share in the era is 32.4% (1945).
  Newspapers out-earn radio by ≥2.2× in every single year. **Constraint confirmed: radio was never #1.**
- Direct mail is the #2 *named* medium in every year 1935–1949 (peak share 16.5% in 1936).
- National share of spend peaks at **61.3% in 1944–45**, up from 51.7% in 1935 — the WWII
  institutional-advertising signature, visible in the data.

Provenance flags carried forward (Galbi's own notes + Silk & Berndt): 1920s figures were revised
down ~15%; national/local split only exists from 1935; "Miscellaneous" is ~20% of the total in 1935
and is where directories/Yellow Pages, transit, point-of-sale and premiums sit — **Yellow Pages is
not a separate Coen category until 1980**; 1942 Misc was fudged +8 to make the total reconcile.

## 4. Field-by-field findings and sources

### SELLERS / PRICING — FCC *Report on Chain Broadcasting* (May 1941)
Full text at earlyradiohistory.us. This is the single best primary source for the era's seller
economics. Extracted (all 1938 unless noted):
- Industry net time sales (all networks + 660 commercial stations): **$100,892,259**.
- NBC + CBS network net time sales **$44,313,778 = 44%**; their 23 O&O stations' non-network net
  time sales $6,734,772 = 7%; Mutual $2,015,786 ≈ 2%. So NBC+CBS controlled >half the industry.
- Networks **retained 73% ($32,046,218)** of network net time sales and paid **27% ($12,267,560)**
  to 253 affiliates.
- Industry net operating income $18,854,784; NBC+CBS network + O&O income $9,277,352 ≈ 49%.
- 660 commercial stations; 341 affiliated with a national network; NBC+CBS affiliates held >85% of
  US nighttime wattage.
- NBC time sales series 1927–1940 ($3.38M → $37.12M) with affiliate compensation ratio rising
  17.06% (1927) → 28.45% (1940).
- CBS rate card: station rates **$125 to $1,250 per converted hour**. Daypart multipliers: daytime
  hour = ½ evening; Sunday afternoon = ¾ (NBC) or ⅔ (CBS); post-midnight = ⅓.
- Volume discounts **2½% (13 weeks, ≥$1,000/wk) to 25% (≥$1.2M/yr)**, computed on Red+Blue combined.
- Mutual: **3½% commission** on members' proceeds *after agency commissions*, 15% for "affiliated
  stations", 2% to the selling station. Mutual had no network rate card — it billed station card rates.
- Early AT&T toll network: 13 stations at **$2,600/hour**, ~$750,000/yr gross; RCA bought AT&T's
  Broadcasting Co. of America (incl. WEAF) for $1,000,000, Nov 1926. NBC formed Sept 9, 1926.
- **The sponsorship mechanism, stated by the regulator**: "In many instances… the network further
  delegates the actual production of programs to advertising agencies. These agencies are far more
  than mere brokers or intermediaries… it is frequently neither the station nor the network, but
  rather the advertising agency, which determines what broadcast programs shall contain."

Derived take-rate stack (grade C): of $100 gross network radio billing in 1938 →
agency ≈ $15, network keeps ≈ $62, affiliates ≈ $23. (FCC "net time sales" is after agency
commission and discounts; 0.73 × 85 = 62.05, 0.27 × 85 = 22.95.)

### MEASUREMENT — Beville, *Audience Ratings: Radio, Television, Cable* (1988)
Downloaded the full 12.9 MB PDF from worldradiohistory.com and read the 1930–1950 chapters.
Beville ran research at NBC; the book reconstructs the institutions from participant interviews
(CAB: Crossley, Karol, Ward; Hooper: Kenkel, Buck, Dole, Stisser; Nielsen: A.C. Nielsen).
- **CAB**: Yale Club meeting **7 Feb 1930**; ANA gave endorsement but refused to commission it, so
  Crossley took the financial risk. Field work began **March 1930**, 50 cities, three 4-month reports
  of 17,000 radio families each. Price **$70/month ($60 for ANA members)**. Year 1: **49 advertiser
  subscribers, revenue $33,045**. Agencies admitted from year 2 and were paying ⅔ of the budget by
  year 3. **Networks were excluded as subscribers until 1937**, and then without board seats — the
  ANA deliberately kept the seller out of the counting room.
- Telephone bias, the era's central measurement defect: by 1934–35 **96% of telephone subscribers
  owned radios but only 31% of US families had telephones**. CAB moved to quota sampling in 1938–39
  because Class D homes had a quarter of the telephones needed.
- Method drift: 24-hour recall → 4 dayparts (1935) → 8 dayparts (1940) → 32 interview sets/day
  "overlap method" (1942) → coincidental (1944).
- **Clark-Hooper**, fall **1934**, coincidental telephone method, **16 cities**, "financed by a
  subscriber group of magazine publishers who were feeling the competitive heat of radio and who
  became convinced that the ratings provided by the CAB service overstated the audience of network
  radio programs" — led by Don Parsons of *McCall's*. This is the cleanest "who paid the counter"
  fact in the whole era: a rival medium bought the audit. C. E. Hooper Inc. founded **1938**, 32 cities.
- **Hooper ran ~20% above CAB.** Hans Zeisel (McCann-Erickson research) diagnosed the gap — ring
  count (6 vs 4), unidentified-program handling, busy-signal treatment. Marion Harper Jr. presented
  it to the Radio Executives Club **7 Feb 1946**; Nielsen counter-punched **21 Mar 1946**; a CAB
  committee reported in April 1946 that the service "should not be continued"; deal with Hooper
  **17 June 1946**, effective 31 July 1946. CAB died because three networks threatened to withdraw —
  by then the networks (the sellers) were funding it.
- **Nielsen**: Audimeter invented by Robert Elder + Louis Woodruff at MIT (patent filed 17 Aug 1936,
  granted 10 Oct 1939); first commercial use fall 1935 for John Shepard's Yankee Network, 110 meters
  at ~$100 each. Nielsen bought it spring **1936**. Chicago pilot **1938** (200 homes, run 4 years).
  NRI went commercial **December 1942**, 800 homes ≈ 25% of US households; 47 subscribers by 1945;
  **1946** expanded to **63%** of US homes (1,300 Audimeters in 1,100 homes); Nielsen said he had
  spent "nearly 10 years and $2 million"; **April 1949** reached **97%** coverage — the first
  projectable national ratings. (Boundary/era-3: Nielsen bought Hooper's national radio+TV service
  March 1950 for a reported $500,000–$750,000; Nielsen had offered $250,000 in 1938.)
- **Ratings as contract price**: Oct 1946 Bing Crosby/Philco — the right to pre-record was contingent
  on the Hooperating staying ≥12. Jan 1949 — Paley moved Jack Benny to CBS only after guaranteeing
  American Tobacco **$3,000 per Hooper point per week** below Benny's NBC rating.

### The Wanamaker quote — verdict: attributed legend
Quote Investigator: earliest located instance is **1919**, Rev. Roy L. Smith at an Indiana Bible
conference (*Winona Echoes*), attributing it to Wanamaker; also 1922 *Printers' Ink Monthly*; the
son of Lord Leverhulme claimed it for his father in 1931. **No direct citation to any written or
spoken instance from Wanamaker exists.** Because the earliest citation falls inside my era, era 2
is the right place to label it. Recorded as a claim about the citation date, not about authorship.

### WWII — the tax subsidy
- Revenue Act of 1942 (effective 21 Oct 1942) replaced the 35–60% graduated excess-profits schedule
  with a **flat 90% rate**; top combined corporate rate rose 31% → 40%.
- An **IRS/Treasury clarification in August 1942** made war-theme, non-product "institutional" or
  goodwill advertising deductible; Morgenthau told a joint congressional committee that Treasury
  would keep treating advertising expenses bearing "a reasonable relationship to the activity in
  which the enterprise is engaged" as deductible.
- Consequence (my derivation, grade C): for a corporation in the excess-profits bracket, the marginal
  after-tax cost of a deductible advertising dollar fell to roughly **$0.10–0.20** — i.e. the Treasury
  paid 80–90% of it. Secondary sources repeat the "up to 80%" figure.
- Ad Council incorporated **26 Feb 1942**; renamed the **War Advertising Council 25 June 1943**;
  funded initially by ~$100,000 raised from agencies and media associations, worked with the Office
  of War Information.
- The data signature (Coen, 1942→1945): business papers +108%, magazines +92%, radio +63%,
  newspapers only +15%, direct mail −12%. National share of all spend hit 61.3%.
  *Labelled inference*: newspapers' and direct mail's weak wartime growth is consistent with
  newsprint/paper supply limits under the War Production Board — I could not source a specific US
  linage-cut percentage and did not turn this into a claim.

### CREATORS
- FCC 1941 (above) is the load-bearing primary: agencies produced the programs.
- By the mid-1930s JWT was producing at least five of each year's top ten network shows
  (Business History Conference, Meyers). Named agency-owned properties: *Kraft Music Hall* (JWT),
  *Cavalcade of America* (BBDO/Du Pont), *Show Boat* (Benton & Bowles/Maxwell House),
  *The Jack Benny Show* (Young & Rubicam/General Foods); Blackett-Sample-Hummert built the
  soap-opera factory.
- N.W. Ayer gross receipts: $13.7M (1919) → $32.6M (1929) → $38.0M (1930) — Hower,
  *History of an Advertising Agency* (1939), Table 15, via the CS Ad Dataset's source sheet.
- JWT billings exceeded $37.5M by the end of the 1920s; JWT held #1 in billings 1922–1972.
- The 15% commission settled at 15% around 1920 and is what bought program production: the agency
  earned its 15% on the *time*, and threw in the show.

### BUYERS / TARGETING
- **P&G was the largest network-radio buyer**: 778 network program hours in 1935, 664 of them
  daytime (85%); by 1937 spending $4,456,525 with ~90% going to daytime. Daytime hours were priced
  at half the evening rate — so the buying of a demographic (homemakers) and the pricing of a
  daypart were the same act. This is the era's targeting mechanism in one datum.
- Coen women's magazines: $51M of $130M magazine spend in 1935 = 39%.
- National spot radio (geographic targeting through station reps): $15M (1935) → $123M (1949).
- CAB reported audience by socioeconomic group (rent + occupation) from 1933.
- Radio-set penetration: 40.3% of households (1930 Census) → 83% (1940) → ~95% (1950).
- Direct-response lineage: Hopkins, *Scientific Advertising* (1923) — keyed coupons, split testing,
  "the severest test of an advertising man is in selling goods by mail." Direct mail is Coen's
  direct-response proxy and Coen classifies 100% of it as national.

### Regulatory beat
Wheeler-Lea Act, signed **21 March 1938**, amended §5 FTC Act to reach "unfair or deceptive acts or
practices" (not just unfair methods of competition), gave the FTC jurisdiction over false food, drug
and cosmetic advertising and the power to issue fines and cease-and-desist orders.

## 5. Money-type axis — how I mapped it, and where it is weak

Coen's native partition is national/local, not the four-way money-type axis. Mapping used:

| Money type | Mapping | Grade |
|---|---|---|
| national_brand | Coen Total National **less** direct mail (Coen puts 100% of direct mail in "national") | C (computed) |
| local_retail | Coen Total Local **less** estimated classified | C (computed) |
| classified | Not separately reported anywhere before 1950 → triangulated | C |
| direct_response | Coen "Direct Mail" (sourced by Coen from the Direct Mail Advertising Association) | B |

Reconciliation check, 1949: 2,234 + 1,876 + 340 + 756 = 5,206 vs Coen total 5,210 (rounding). ✔

**Classified triangulation (the era's hardest number).** Nothing in the Coen dataset, the FCC
reports, or any accessible series breaks out newspaper classified before 1950. What I tried and
failed on: ANPA/Bureau of Advertising series (Borden 1942 gives only national vs "local advertising
(inc. classifieds)"); 1929/1935 Census of Manufactures (newspaper revenue, not ad category);
1947/1948 Census of Business; Editor & Publisher / Media Records linage; HSUS series T 485
(linage only, not dollars). Method finally used: **HSUS Millennial Edition table De523-526 gives the
first hard split at 1950 — classified $377M of $2,070M total newspaper = 18.2%** — and that table's
1950 newspaper total matches Coen's 1950 newspaper figure ($2,070M) exactly, so the two series are
definitionally compatible. Applying 18.2% to Coen's 1949 newspapers ($1,911M) gives $348M; classified
was rising fast on the postwar jobs/housing/auto boom, so 1949's share was probably a shade below
1950's. Central **$340M**, ci80 **[270, 420]** — wide on purpose.

**Directories / Yellow Pages.** Tracked as required but not separable. Coen does not break out
Yellow Pages until 1980; before that it is inside "Miscellaneous" ($1,022M = 19.6% of 1949 spend).
I could not source a Bell System "directory advertising" revenue line for the 1940s (tried AT&T
annual reports via bellsystem memorial, FCC *Statistics of Communications Common Carriers*, FRED
telephone-revenue series). Recorded as an explicit absence inside the MEDIUM summary rather than a
fabricated split. Bell took directory ad sales in-house in 1920 and registered the "Yellow Pages"
trademark in 1948.

## 6. Conflicts kept visible (not averaged away)

1. **Radio's share of advertising, 1928–1932.** Museum of Broadcast Communications (and Encyclopedia.com,
   the probe's seed) say radio went from "about two percent" (1928) to "nearly 11 percent" (1932) of
   all advertising. Coen says 0.5% (1928) and 3.9% (1932). The MBC/Hettinger figure is almost certainly
   radio's share of *national* advertising in major media, not of all US advertising. I recorded the
   Coen number as central and **widened ci80 up to 11.0** with both sources cited.
2. **The first sold radio time, WEAF 28 Aug 1922.** Price is reported as $50 for 10 minutes
   (Saturday Evening Post, EBSCO) and $100 for 15 minutes (MBC). Recorded central $50,
   ci80 [50, 100], both sources cited.
3. **Coen vs the FCC on radio, 1938.** Coen: radio $167M total / $89M network. FCC (audited):
   industry net time sales $100.9M / NBC+CBS+Mutual network net time sales $46.3M. Ratio ≈ 1.66
   overall and ≈ 1.9 on network. Consistent with Silk & Berndt's finding that the McCann-Erickson
   series is built on *list* rate-card prices rather than transaction prices; it may also carry
   program-production outlay. Recorded as a grade-C claim because the decomposition is contested,
   and flagged for R2's concordance object — **this is a real, checkable seam at the start of the
   whole signature chart.**

## 7. Probe gaps addressed (affected_eras includes "2")

| # | Gap | Disposition |
|---|---|---|
| 1 | Classifieds absent (blocking) | Addressed: triangulated 1949 classified, documented absence pre-1950, money-type split filled |
| 2 / 8 | No brand/DR/local money axis | Addressed: by_money_type filled in SCALE and BUYERS with the mapping above |
| 3 | Direct mail mis-slotted to era 4 | Addressed: direct mail is the #2 named medium in every year 1935–49; Hopkins 1923 lineage recorded in TARGETING |
| 4 | Agency arc stops at the commission | Addressed: CREATORS carries program production, JWT/Ayer economics, what the 15% bought |
| 5 | Era-2 label vs spend data; WWII tax missing | Addressed: newspapers #1 every year, radio peaks at 14.9%; Revenue Act 1942 + Aug 1942 IRS ruling + Ad Council are events/claims |
| 6 | Ad/GDP capture premise contested (blocking) | Addressed: 1922 = 3.0% is the whole series' maximum, recorded and put in boundary_notes for eras 6–7 |
| 7 | Splice seams (blocking) | Addressed: Coen-vs-FCC 1938 divergence quantified for R2's concordance |
| 9 | MEASUREMENT missing (blocking) | Addressed: full CAB→Hooper→Nielsen sequence with funding, bias and repricing events |
| 11 | No ratings-institution beat in eras 2–4 | Addressed: CAB 1930 and CAB→Hooper 1946 are events; Zeisel 20% gap recorded |
| 12 | Regulatory layer absent | Addressed: Wheeler-Lea 1938 is an event |
| 13 | Audience-commodity spine | Noted only (framing, not a claim); MEASUREMENT summary echoes it |
| 14 | Who pays the measurer | Addressed: advertiser-funded CAB → magazine-funded Clark-Hooper → seller-funded networks → subscription Nielsen |
| 10 | ABC 1914 | Era 1's; noted in boundary_notes only |
| 15–19 | Presentation scout | Out of scope for R1 |

## 8. Judgment calls

- **Radio's peak share is 1945, not 1948.** Verified year by year in the parsed dataset.
- **I did not put the WEAF 1922 broadcast in the record as "the first radio commercial."** It is
  recorded as the first documented *sale of broadcast airtime* under AT&T's toll-broadcasting plan,
  which is what the sources actually support.
- **Talent-vs-time split is grade C with a wide interval.** No audited series of sponsor program
  budgets exists. Two triangulation routes (network hour gross cost vs reported talent bills; and
  the Coen-minus-FCC residual) both land in a 20–55% band for production's share of a sponsor's
  network outlay, but the second route's premise is contested by Silk & Berndt. Interval kept wide.
- **Global 1949 is grade C.** No contemporaneous world survey exists — the IAA/Starch INRA Hooper
  *Survey of World Advertising Expenditures* does not begin until the 1960s. Built from two paths;
  both land in $6.5–8.7B. Recorded central $7.5B, ci80 [6.0, 10.0].

## 9. Dead ends

- worldradiohistory.com's GOLDTIME mirror of Jim Ramsburg's "Radio's Rulers" returns 403 to
  automated fetches; jimramsburg.com fails TLS. Beville's book covered the same ground better.
- NYU radio-ratings guide has no methodology detail.
- No accessible pre-1950 classified dollar series (see §5).
- No accessible Bell System directory-advertising revenue line for the 1940s.
- No world advertising expenditure estimate for the 1940s.
- No US newsprint-rationing linage-cut percentage; left as a labelled inference, not a claim.

## 10. Validation run (2026-07-30)

`data/eras/era-2.json` parses and passes a schema check written against
`planning/schema/era-record.schema.json`:

- All 8 fields present; every summary over 200 characters.
- 66 calibrated claims. Per field: CREATORS 4, BUYERS 7 (3 + 4 money types),
  SELLERS 7, MEDIUM 7, SCALE 13 (9 + 4 money types), PRICING 8, MEASUREMENT 9,
  TARGETING 5, EVENTS 6.
- Claim IDs all match `^e2-[a-z_]+-[0-9]{3}$`, all unique.
- Every claim carries id, statement, central, unit, ci80, grade, sources, as_of.
- Every grade-C claim carries a method field (24 of them).
- Every central sits inside its own ci80; no inverted intervals.
- 10 events, all with dates matching the date pattern.

Arithmetic cross-checks: money-type split reconciles to the 1949 total
(2,234 + 1,876 + 340 + 756 = 5,206 vs 5,210, rounding). Medium shares for 1949 sum to
100.1 percent (36.7 newspapers + 14.5 direct mail + 11.0 radio + 8.8 magazines +
19.6 miscellaneous + 4.8 business papers + 2.5 billboards + 1.1 TV + 1.1 farm).

No constraint conflicts. Newspapers lead every year; radio peaks at 14.9 percent and is
never number one; classifieds, directories and direct mail are all tracked; the Wanamaker
line is labelled attributed legend; nothing is sourced from the Acquired or Stratechery podcasts.
