# Era 1 — "The Middlemen" (1840s–1917) — working notes and source log

Agent: market-era-historian (R1 fan-out). Started 2026-07-30.
Record: `p2-ad-market/data/eras/era-1.json`

## 1. Scope statement

Inside this era: the invention of the advertising agency as a space broker and its
conversion into the advertiser's agent; the origin and stabilisation of the media
commission; the rise of national-brand, mail-order and classified money; the
publisher-side invention of ad-subsidised below-cost content (penny press 1833,
ten-cent magazine 1893); and the trust infrastructure built between 1892 and 1917
(patent-medicine backlash, Printers' Ink model statute 1911, Newspaper Publicity
Act 1912, ABC and FTC 1914, 4As 1917).

Left to siblings: era 2 owns the 1918 4As/ANPA formalisation of the 15 % rate, the
whole radio story, and the 1919-onward annual Coen series. Era 2 also owns direct
mail's move into a tracked national series (Coen tracks it from 1919/1935). I stop
at 1917 and hand over the boundary facts listed in `boundary_notes`.

## 2. Seed gaps for era 1 (from planning/unknown-unknowns-probe.json)

| Gap | Severity | How addressed |
|---|---|---|
| Classifieds absent, tracked in every era | blocking | MEDIUM + PRICING + BUYERS/SCALE money-type split; C-grade estimate with method (e1-scale-009) |
| No brand vs DR vs local money distinction | major | `by_money_type` filled in SCALE and BUYERS, all four keys, with overlap caveat |
| Direct mail mis-slotted in era 4 | major | MEDIUM + TARGETING + BUYERS: mail order 1872/1886, third-class volume series, Parcel Post 1913 |
| Ad-subsidised zero-price content predates plan (penny press 1833, Munsey 1893) | major | SELLERS + PRICING + events e1 1833 and 1893 |
| Pre-1919 misses trust infrastructure (LHJ 1892, Adams 1905, PFDA 1906, Printers' Ink 1911, FTC/ABC 1914) | major | MEASUREMENT + events |
| No by-medium detail before 1935; pre-1919 no series at all | major | SCALE is benchmark-year only; Census of Manufactures used as the A-grade print anchor; explicit no-data zone 1840s–1866 |
| Global figure impossible for era 1 | minor | explicit absence note in SCALE summary + notes §7 |
| Era 1 cannot meet the rigor bar / degraded mode | major | all totals grade B or C with wide CI80s; two conflicting source lineages carried, never averaged silently |
| Myth inventory (Wanamaker, "first agency") | minor | Wanamaker labelled attributed legend (QI: earliest attribution 1919 sermon); Palmer "first" hedged to "first/among the first, 1841–42" |
| MEASUREMENT is the causal parent of PRICING | blocking (schema) | MEASUREMENT field filled: sworn statements → Rowell's ratings → ABC audit |
| Direct-response measurement lineage missing | major | MEASUREMENT + TARGETING: keyed coupons, Hopkins/Lord & Thomas, mail-order response |
| Regulatory layer absent | major | events 1906, 1911, 1912, 1914 |
| Audience commodity spine | minor | noted in SELLERS summary (framing only, no claim) |
| Self-serve bookend to era 6 | major (era 6) | noted in boundary_notes: classified counter + mail-order coupon are the pre-agency, self-serve buyer classes |

Deferred: the presentation-scout gaps (chart form, mobile) are design-stage, not R1.

## 3. SCALE — the two conflicting total-spend lineages

**Lineage A — Historical Statistics of the United States, Colonial Times to 1970
(US Census Bureau, 1975), series T 444, "Volume of advertising, by medium: 1867 to
1970."** Source note printed in the volume: "Printers' Ink Publications, New York,
N.Y., 1867–1934 … The data were prepared by Robert J. Coen of McCann-Erickson, Inc.
… The data include the cost of preparation, and the cost of talent in the case of
radio and television as well as the charges for space and time."
Obtained by OCR of the free Census PDF (`hist_stats_colonial-1970p2-chT.pdf`,
pp. 855–856). Benchmark values, $ millions current:

| Year | 1867 | 1880 | 1890 | 1900 | 1904 | 1909 | 1914 | 1915 | 1916 | 1917 | 1918 | 1919 | 1920 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T 444 | 50 | 200 | 360 | 542 | 821 | 1,142 | 1,302 | 1,302 | 1,468 | 1,627 | 1,468 | 2,282 | 2,935 |

Nothing before 1867. The repetition (1914=1915, 1916=1918) shows the pre-1919
figures are a coarse index, not measurements.

**Lineage B — Robert Coen's own later revision**, "Spending Spree," p. 126,
*Advertising Age* special issue *The Advertising Century* (1999), carried in Douglas
Galbi's CS Ad Expenditure Dataset v1.14, sheet "estimates 1900-34":
1900 450 · 1904 750 · 1909 1,000 · 1914 1,100 · 1917 1,380 · 1918 1,240 · 1919 1,930.

Coen's 1999 numbers are 13–19 % below the 1975 Printers' Ink numbers for the same
years. Galbi's "revisions" sheet computes the 1919–1929 gap at −15 % to −18 %.
**Per the rigor spec I carry both and widen the CI80 rather than averaging.**

**Lineage C (conflicting, low provenance)** — Duke University's "Emergence of
Advertising in America" guide states "$600 million is spent on advertising by big
business [in 1910]; this represents 4 % of the national income," with no source
cited. Inconsistent with both lineages above and with the GDP denominator
(national income was far above $15 bn in 1910). Recorded here, not used.

**Lineage D — the A-grade enumeration.** US Census of Manufactures, printing and
publishing, advertising receipts of newspapers and periodicals ($ current):

| | 1909 | 1914 | 1919 |
|---|---|---|---|
| Newspapers, advertising | 148,551,302 | 184,147,100 | 373,501,900 |
| Newspapers, subscriptions & sales | 84,432,702 | 99,541,865 | 192,819,519 |
| Periodicals (non-newspaper), advertising | 53,878,858 | 71,585,595 | 154,8xx,xxx |
| Periodicals, subscriptions & sales | 50,631,336 | 64,035,230 | 85,1xx,xxx |
| **Combined advertising** | **202,533,245** | **255,632,611** | **528,2xx,378** |

Source: *Census of Manufactures 1919, Bulletin: Printing and Publishing*, Table 12
(comparative statistics, industry proper, by character of products: 1919, 1914 and
1909), US Bureau of the Census —
https://www2.census.gov/library/publications/decennial/1920/bulletins/manufacturing/manufactures-printing-and-publishing.pdf
(OCR'd locally; several digits recovered from the printed percent-increase columns,
and cross-checked against the same census figures as tabulated by Borden, *The
Economic Effects of Advertising* (1942), Table 1, p. 48, reproduced in Galbi's
dataset: newspapers 1909 148.9 / 1914 184.0 / 1919 373.5; periodicals 54.0 / 71.6 /
154.8).

**The wedge.** Census print advertising receipts are ~3–5× smaller than the
Printers'/Coen totals for the same year (1914: $256 m vs $1,100–1,302 m; 1909:
$203 m vs $1,000–1,142 m). Two documented reasons: (a) the Printers'/Coen concept
is advertiser *outlay* including the cost of preparation, agency commission and
non-media promotion; the Census concept is publisher *receipts*; (b) Galbi's own
reconstruction applies a fixed factor of **1.519** to Census newspaper receipts to
reach Coen's newspaper expenditure line in 1935. Even at 1.52×, print reaches only
~30 % of the pre-1919 totals, so the residual (direct mail, catalogues, outdoor,
streetcar, premiums, novelties, window display, house organs, production) is large
and unenumerated. **Conclusion recorded in the record: era-1 totals are
order-of-magnitude, on a broader "total promotional outlay" basis than the 1935+
measured-media series.** This is the single most important honesty note for the
signature chart's left edge.

**Denominator.** Nominal US GDP, MeasuringWorth (Johnston & Williamson series,
retrieved 2026-07-30), $ millions: 1867 8,465 · 1880 10,592 · 1890 15,607 ·
1900 21,197 · 1904 26,360 · 1909 32,540 · 1914 36,831 · 1917 60,278 · 1919 79,090.
Pre-1929 GDP is itself a reconstruction (BEA accounts begin 1929), so every ad/GDP
ratio in this era is grade C on both numerator and denominator.

Ad/GDP implied: 1867 0.6 % · 1880 1.9 % · 1890 2.3 % · 1900 2.1–2.6 % ·
1909 3.1–3.5 % · 1914 3.0–3.5 % · 1917 2.3–2.7 %.

## 4. Source log by field (running)

### CREATORS
- Volney B. Palmer, Philadelphia. Pennsylvania Center for the Book: agency founded
  1841; "charge publishers a commission (widely believed to be on a 25 per cent
  basis)"; by 1849 claimed sole representation of 1,300 of ~2,000 US newspapers;
  after Palmer's death (1864) the firm passed through Coe, Wetherill & Co. into
  N. W. Ayer & Son (1877).
  http://pabook2.libraries.psu.edu/palitmap/AdCo.html
- Horsky & Zeithammer, "The Rise of 15 %: Emergence and Persistence of Commissions
  in Advertising" (UT Dallas hosted PDF, 2023 version of the 2021 paper):
  Palmer dated **1842** citing the *Oswego Palladium* (1846); publishers paid him
  25 % of revenue generated; by the 1850s many agents each claiming to represent
  every important paper (Hower 1939 p.16); 1860s Carlton & Smith (later JWT) buys
  space in bulk; **commissions varied between 10 % and 50 %**; Ayer's **open
  contract, 1875**, first client Dingee & Conard; first upfront market research
  1880 (Nichols-Shepard); creative work from the 1890s; rate "eventually stabilized
  at 15 % by early 1890s"; **1893 publisher-association resolution** that
  commissions be paid only to recognised agents and not to advertisers; 1902 Quoin
  Club (magazines) adopts the commission system; **1918 4As standardises 15 % of
  the gross space rate** (Haase 1934, pp. 3, 27); 1924 first federal antitrust probe
  of the recognition system.
  https://bpb-us-e2.wpmucdn.com/sites.utdallas.edu/dist/8/1090/files/2023/02/the_rise_of-15_emergence_and_persistence_of_commissions_in_advertising.pdf
- UCLA Anderson Review summary of the same paper (Horsky, Hebrew University;
  Zeithammer, UCLA), for the recognition-system-as-collusion framing.
  https://www.anderson-review.ucla.edu/the-long-history-of-middlemen-earning-a-lucrative-fixed-commission/
- Curtis Publishing 1891 no-rebating rule (agencies paid commission only if they
  collected the full card price from the advertiser) — reported in search synthesis
  of the agency-compensation literature; treated as B-grade, corroborated by the
  1893 publisher resolution above.
- N. W. Ayer & Son gross receipts (Hower, *History of an Advertising Agency*,
  Harvard UP 1939, Table 15, p. 536, via Galbi's dataset), $ millions: 1913 10.41 ·
  1914 10.91 · 1915 11.60 · 1916 15.26 · 1917 18.58 · 1918 20.38 · 1919 27.01.
- Lord & Thomas: John E. Kennedy's "advertising is salesmanship in print" (1904);
  Albert Lasker hires Claude Hopkins in 1907 at a reported $185,000/yr.
- 4As founded 4 June 1917, St. Louis, 111 charter members, from five regional
  groups (4As own timeline / Wikipedia). 1926 Britannica: ~1,200 US agencies, of
  which ~140 were 4As members.

### PRICING / MEASUREMENT
- 1926 *Encyclopædia Britannica*, "Advertising" (Wikisource) — near-period summary:
  early agents "contracted for a certain amount of space with a publication and then
  sold it for whatever he could, receiving sometimes as high as 50 % of the cost";
  "In 1914 there was organised the Audit Bureau of Circulations"; by Jan. 1926 ABC
  membership was 184 general magazines, 72 farm publications, 240 business
  publications, 925 newspapers; publisher statements every six months with an
  audited report once a year; direct-mail advertising ≈ $300,000,000 in 1920;
  street-car advertising general from about 1890; "in the neighbourhood of a billion
  dollars is spent annually" (US, mid-1920s) — note this is far below Coen's
  contemporaneous $2.7 bn, further evidence that "total advertising" had no agreed
  definition in the period.
  https://en.wikisource.org/wiki/1926_Encyclop%C3%A6dia_Britannica/Advertising
- ABC founding: Advertising Audit Association (publisher-led) and Bureau of Verified
  Circulations (advertiser-led) merged May 1914 in Chicago; mission "facts without
  opinions"; power to suspend members for padded figures. AAM "Who We Are";
  Ad Age Encyclopedia; History of Information entry 682.
- Newspaper Publicity Act, 24 Aug 1912: second-class mailing privilege conditioned
  on filing sworn statements of ownership and, for dailies, **sworn circulation**;
  paid reading matter must be marked "advertisement." Upheld in *Lewis Publishing
  Co. v. Morgan*, 229 U.S. 288 (1913). USPS "Postage Rates for Periodicals: A
  Narrative History"; Justia.
- Rowell: agency opened Boston 1865 with Horace Dodd; bulk space purchase and
  resale; **Rowell's American Newspaper Directory, 1869, listing 5,778 papers with
  estimated circulations**; founded *Printers' Ink* 1888. Wikipedia George P.
  Rowell; Duke "Emergence of Advertising in America" 1850s–1870s guide;
  Campaign "History of advertising: No 156: Printers' Ink."
- Claude Hopkins at Lord & Thomas: key-coded coupons, split-run tests of headlines
  and offers, codified later in *Scientific Advertising* (1923).

### SELLERS / MEDIUM
- New York *Sun*, 3 Sept 1833, one cent; masthead statement of purpose: "The object
  of this paper is to lay before the public, at a price within the means of every
  one, all the news of the day, and at the same time offer an advantageous medium
  for advertisements." Day reached ~15,000 copies/day. (Penny press literature;
  American Antiquarian Society exhibit; ERIC ED360650.)
- 1893 magazine price war: McClure's launched at 15c, Cosmopolitan cut to 12½c,
  Munsey's cut from 25c to 10c — "made it possible to sell a magazine, like a
  newspaper, for less than its cost of production"; Munsey's ad revenue averaged
  $25,000–35,000 per issue; the ten-cent magazine "increased the magazine-buying
  public from 250,000 to 750,000 persons" 1893–99; Munsey's circulation ~700,000 by
  1897. Encyclopedia.com "Munsey's Magazine"; Britannica publishing history.
- Census of Manufactures 1919 bulletin, Table 19: publications and aggregate
  circulation per issue — 1909: 22,141 publications, 164,463,040; 1914: 22,754
  publications, 205,594,907; 1919: 20,489 publications, 222,481,083. Dailies: 1909
  2,600 / 24.2 m; 1914 2,580 / 28.8 m; 1919 2,441 / 33.0 m.
- Outdoor: Associated Bill Posters' Association of the US and Canada formed 1891 in
  Chicago (later OAAA); 24-sheet poster standardised c.1900–1920; National Outdoor
  Advertising Bureau 1915. OAAA "History of OOH."
- Directories: 1883 Cheyenne "printer ran out of white paper" story (treat as trade
  legend); Reuben H. Donnelley published the first classified/Yellow Pages
  directory in 1886. Yellow Pages Directory Inc. history; Stacker.
- Direct mail / mail order: USPS OIG-adjacent USPS history "Advertising Mail: A
  Brief History" — third-class mail volume 301 m pieces (1880) → >6 bn (1930);
  Ward's first single-page list 1872, 72 pages by 1874, ~1,000 pages and ~$7 m
  annual sales by 1897; RFD from 1896; **Parcel Post 1913** — "Sears filled five
  times as many orders in 1913 as it did the year before and, after five years of
  Parcel Post, its revenues had doubled."
  https://about.usps.com/who/profile/history/pdf/advertising-mail-history.pdf
- Mail-order scale: Sears passes Ward in 1900 ($10 m vs $8.7 m); Sears $40.8 m by
  1908; Ward mailing ~3 m catalogues by 1904 (WTTW Chicago Stories; historic-
  structures.com; corroborated across secondary accounts — B grade).

### BUYERS
- Patent medicine as the first national advertiser class: N. W. Ayer's own accounts
  show patent medicine as its most lucrative commodity category at **26 % of total
  revenue in 1878**, falling to **15 % and second place by 1900** (Hagley Museum,
  "Advertising and Branding — Patent Medicine").
  https://www.hagley.org/research/digital-exhibits/advertising-and-branding
- National brands emerging 1876–1890: Heinz 1876, Burpee 1876, Ivory 1879;
  department stores Macy's 1858, Wanamaker's 1876, Marshall Field's 1887; mail
  order Ward 1872, Sears 1886/1888 (Horsky & Zeithammer).
- Newspaper national vs local advertising, $ millions (Borden 1942, App. Table 1,
  p. 888, sourced to ANPA Bureau of Advertising, *Expenditures of National
  Advertisers in Newspapers, 1915–1938*, via Galbi's dataset): 1915 national 55 /
  local incl. classified 220; 1916 75 / 300; 1917 80 / 320; 1918 90 / 360;
  1919 150 / 350. **This is the era's only direct national-vs-local split and the
  basis for the money-type triangulation.**

### Myths handled
- Wanamaker "half my advertising is wasted": Quote Investigator finds a 1890
  *Printers' Ink* partial ("don't forget that half of the money spent in advertising
  is wasted") with no attribution, and the earliest full attribution to Wanamaker in
  a **1919 sermon by Rev. Roy L. Smith**; no primary Wanamaker instance found.
  Recorded as attributed legend. https://quoteinvestigator.com/2022/04/11/advertising/
- "First advertising agency": Palmer is dated 1841 (Penn State) and 1842 (Horsky &
  Zeithammer, citing an 1846 newspaper). The record uses "1841–42, first or among
  the first" and does not assert a clean first.
</content>
</invoke>

## 5. Money-type triangulation (SCALE / BUYERS `by_money_type`)

Benchmark year 1914. Total outlay taken as ~$1,200 m (the midpoint of the two
lineages). Components converted from Census receipts to advertiser outlay with
Galbi's documented Coen-to-Census factor of 1.519.

| Money type | Build | Share | CI80 |
|---|---|---|---|
| National brand | national newspaper space $55 m receipts (ANPA 1915) → ~$80 m outlay; all non-newspaper periodicals $71.6 m → ~$105 m; national outdoor + streetcar ~$25 m; plus preparation | 22 % | 14–32 % |
| Local retail (ex classified) | ANPA local incl. classified $220 m less classified → ~$190 m; local outdoor, bill posting, directories, window display $40–70 m | 23 % | 16–32 % |
| Classified | 12 % of Census newspaper receipts $184.1 m = ~$22 m → ~$34 m outlay | 3 % | 1.5–6 % |
| Direct response | direct mail + catalogues ~$200–250 m (back-cast from the $300 m 1920 figure on the third-class volume path); mail-order keyed print ~$30–45 m; patent-medicine keyed press ~$30–50 m; premiums, samples, novelties $40–70 m | 32 % | 20–45 % |
| Unallocated residual | house organs, window display, institutional, political, unclassifiable promotion | ~20 % | — |

**Overlap warning carried into the record.** These four types are not mutually
exclusive in this era. Patent-medicine and mail-order money was national AND
response-keyed. The record counts it under direct response and says so, because the
buying logic (keyed reply, ranked by cost per order) is what the money-type axis is
meant to capture and what era 6 later reclaims.

Classified derivation. No classified dollar series exists before 1928. Nearest
measured anchor: classified share of newspaper linage in 52 cities (Historical
Statistics series T 485–486) — 1936 19.2 %, 1938 20.8 %, 1940 20.7 %, 1945 23.0 %,
1948 23.1 %. The help-wanted, automotive and real-estate classified boom is a 1920s
phenomenon, so the pre-WWI share is set materially below the 1936 level, at 7–18 %
with a 12 % central.

## 6. Dead ends and things I could not source

- **No classified dollar figure before 1928.** Searched Census of Manufactures
  (it does not split advertising receipts by class), ANPA/Editor & Publisher linage
  literature, and the classified-advertising secondary literature. Only linage-based
  triangulation was possible. Flagged as a gap.
- **No directory/Yellow Pages spend figure before 1917.** Donnelley's 1886
  classified directory is documented; the money is not. The 1883 Cheyenne
  "ran out of white paper" origin story is trade legend and is labelled as such.
- **No global advertising figure for any year in this era.** Confirmed absence.
  The earliest recurring international series is the International Advertising
  Association lineage (IAA founded 1938) later published as the Starch INRA Hooper
  *Survey of World Advertising Expenditures*. Recorded as an explicit absence note
  in the SCALE summary, as the plan's decision #14 permits.
- **HSUS Millennial Edition table De482-515** ("Advertising expenditures, by
  medium: 1867–1998," ed. Daniel M. G. Raff) is paywalled at Cambridge. I used the
  free 1975 edition (series T 444-471) instead, which covers the same benchmark
  years from the same Printers' Ink / Coen lineage. The 1975 chapter PDF has no text
  layer; figures were recovered by rendering at 300 dpi and running tesseract, then
  cross-checking every value against the printed percent-increase columns.
- **N. W. Ayer's own commission rate over time** — Hower (1939) has it, but the book
  is not online. Only the gross-receipts table reached me, via Galbi's transcription.
- **Wanamaker's actual advertising budget** — no figure found in any accessible
  source. Only the (legendary) quote.
- **Duke's "$600 million in 1910, 4 % of national income"** is uncited and
  inconsistent with both spend lineages and with the GDP denominator. Logged in §3,
  not used in the record.

## 7. Consistency pass (run before writing the record)

- Money-type shares 22 + 23 + 3 + 32 = 80 %, with a stated ~20 % unallocated
  residual. They do not silently sum to 100.
- e1-buyers-007 (classified = 12 % of newspaper receipts) and e1-scale-013
  (classified = 3 % of total outlay) reconcile: 0.12 × 184.1 × 1.519 = $33.6 m;
  33.6 / 1,200 = 2.8 %.
- e1-sellers-003 (64.9 % of newspaper income from advertising, 1914) and
  e1-sellers-004 (44 % in 1879) are consistent with the summary's "roughly twenty
  points".
- e1-creators-004 (Ayer = 1.2 % of total outlay) recomputes from e1-creators-003
  and e1-scale-007.
- Every ci80 brackets its central; every grade-C claim carries a method; no source
  is a podcast; SCALE carries benchmark years only and no annual series.
- 53 claims, 10 dated events, all nine fields non-empty, both money-type splits
  complete with four keys each.

## 8. Constraint check

| Pre-cleared constraint | Status |
|---|---|
| AdWords Oct 2000 CPM / Feb 2002 auction | not in period |
| Overture led paid search through 2002; ~2.7 M shares | not in period |
| Radio never #1 US medium by spend | not in period; era 1 has no broadcast |
| "Out of Home" replaced "Billboards" in 2000 at ~3× | not in period |
| Wanamaker quote and "first banner ad" are legends | Wanamaker labelled attributed legend in `boundary_notes` and §4 above; not asserted anywhere in the record |
| Classifieds, directories, direct mail tracked in EVERY era | all three in MEDIUM; classified and direct mail carry claims; directories carry a dated fact (Donnelley 1886) but no spend figure exists — flagged |
| SCALE benchmark years only, ~$200 M 1880 to ~$3 B early 1900s | 1880 = $200 M confirmed exactly from series T 444. The ~$3 B level is reached in **1920** ($2,935 M), not "early 1900s" — 1909 is $1,000–1,142 M and 1914 is $1,100–1,302 M. Recorded in `boundary_notes` (2) as a refinement, not a contradiction. **Parent should note the date of the $3 B anchor.** |
| Global figure: absence note acceptable | explicit absence note written into the SCALE summary |

## 9. Cross-check against era 2 (sibling record, read after drafting)

Era 2's `boundary_notes` opens the annual series at Coen 1919 = $1,930 M and tells
era 1 to publish benchmark points only. Both are satisfied. Era 1 additionally
records the alternative 1919 value from Historical Statistics series T 444
($2,282 M), which is the same disagreement era 2 describes as "the 1920s totals were
revised down about 15 percent" — the two records agree on the fact and on its size.

One deliberate, explained discrepancy: era 2 says 3.0 % of GDP in 1922 is the
maximum of the 1919–2007 series, while era 1's 1909 and 1914 benchmarks compute to
roughly 3.0–3.5 %. These are not comparable — the era-1 numerator is a broader
total-outlay concept and the pre-1929 denominator is a Johnston–Williamson
reconstruction. Recorded as `boundary_notes` item (10) so V1 sees it as an
annotated seam rather than a contradiction.
