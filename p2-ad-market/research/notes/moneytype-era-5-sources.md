# Era 5 money-type source hunt — assessment notes

**Task:** establish whether any credible source publishes the US ad-spend split by money type
(national_brand / local_retail / classified / direct_response) for 1994–2001. **Source hunt only.**
No estimation, no bridging, no assembly.

- Dataset: `p2-ad-market/data/moneytype/sources-era-5.json`
- Notes: this file
- As of: 2026-07-30. Tolerance 15%. Claim IDs `e5-src-001`…`e5-src-014` (namespace verified free).

---

## 1. The headline

**No source publishes the four-way split.** The nearest published object is MAGNA Global's three-way
**Direct / National / Local** typology. It has no classified category at all, and its "Direct" is much
narrower than direct response. It is free for the year 2000 and licensed for 1994–1999.

So the split stays a construction. But three things changed underneath it.

**Direct response is published, twice, and the project said it was not.** `dataset-notes.md` §8 records
direct response as "not published by any compiler." That is wrong. Two named compilers publish it:

| Compiler | 2000 direct-response figure | Own universe | Share |
|---|---|---|---|
| DMA / WEFA | $191.6B | $339.3B | 56.5% |
| MAGNA Global | $31.1B | $177.5B | 17.5% |
| *project, current* | *$47.5B* | *$247.5B* | *19.2%* |

The dollar figures differ by more than 6x. The shares differ by 3x. None of it is error — the objects
differ. DMA counts telemarketing and every direct-response placement in general media. MAGNA counts
direct mail, direct online and directories only. The project counts direct mail plus national Yellow
Pages plus performance-priced internet.

**Classified is the best-sourced pool in the era, not the worst.** NAA covers all eight years. Audited
SEC filings can lift the newspaper component to grade A. Only the online sliver (2 of 8 years) and the
non-newspaper fringe (0 of 8 years) are genuinely missing.

**National brand and local retail are the pools that cannot be sourced at all.** No compiler has ever
published a national-*brand* or local-*retail* pool. What exists is a National and a Local *geography*,
and both contain the other two money types inside them. These two stay grade C, permanently.

---

## 2. Inventory

Eleven sources, of which four are new to the project.

| Source | Measures | Window coverage | Pools | Access | Independent? | New? |
|---|---|---|---|---|---|---|
| **DMA / WEFA, *Economic Impact*** | DR ad spend by medium, ×consumer/B2B, ×intended purpose; DR-%-of-medium | 1995, 1999, 2000, 2001 printed; CAGRs constrain 1996–98; **1994 absent** | direct_response | free as read (hosting caveat) | yes for DR-TV/print/radio; **no for direct mail** | **yes** |
| **MAGNA via Statistical Abstract T1278/T1279** | supplier ad revenue, Direct/National/Local ×8 media | **2000 only** free; 1994–99 licensed | nat_brand, loc_retail, direct_resp | free for 2000 | methodologically yes; IPG common parent | **yes** |
| NAA annual newspaper ad expenditures | newspaper national/retail/classified | 1994–2001, all 8 | classified, nat_brand, loc_retail | free | already the project's classified spine | no |
| **Newspaper-group 10-Ks** | audited retail/general/classified | 1994–2001, all 8 | classified | free (EDGAR via curl) | **yes** — primary books | **yes** |
| IAB/PwC format + pricing | online format & pricing-model shares | classifieds FY2000–01 only | classified, direct_resp | free | already in project | no |
| **1997 Economic Census, Sources of Receipts** | broadcast advertising receipts, national+regional vs local | **1997 only** | nat_brand, loc_retail | free | **yes — the only grade-A official split found** | **yes** |
| RAB radio | local / national spot / network radio | 1999–2000 recovered | nat_brand, loc_retail | free by fragment | yes | no |
| HSUS De523-526 (Raff) | newspaper total/retail/national/classified | 1950–2001 | classified | **paywalled — values not read** | no (NAA lineage) | no |
| CMR / TNS | 15-media monitored national spend | 1999 fragment only | nat_brand | licensed, effectively lost | yes | no |
| Coen 2001 vintage (in DMA book) | national/local by medium | 1999–2000 | nat_brand, loc_retail | free | no — same compiler, different vintage | no |
| Veronis Suhler "specialty media" | direct mail + sponsorship + promotion | growth rates only | **none** | licensed | no — consumes Coen | no |

---

## 3. What each pool can and cannot get

### classified — partially sourced, upgradeable
Newspaper classified is solid: NAA, all eight years, free, grade B, peaking at **$19,608M in 2000**.
It can be lifted to grade A by summing the audited category splits in the public newspaper groups'
10-Ks. Verified live on Knight Ridder: 2000 retail $1,104,766k / general $336,613k / classified
$1,066,457k, with 1999 and 1998 in the same table. Knight Ridder's classified share is 42.5% against
NAA's 40.3% industry-wide — close enough to corroborate, far enough apart to be a real check.

Online classified is sourced for **2 of 8 years only** (FY2000 7%, FY2001 16%). For FY1999 the IAB
report folds classifieds into "Others" at 11% and it cannot be separated; before that there is no
format split at all. Non-newspaper, non-online classified — shoppers, free community papers,
penny-savers — has **no source anywhere**.

### direct_response — sourced 1995–2001, on two irreconcilable definitions
This is the substantive change. DMA/WEFA publishes DR ad spend by medium. It prices the
direct-response television ($21.9B in 2000), newspaper ($18.4B), magazine ($9.8B) and radio ($7.7B)
that the era-5 notes call "not separable in the Coen series." A named compiler did separate them.

It also carries the only money-type-by-medium cross-tab found for the era: DM as a percent of each
medium (newspaper 37.3%, magazine 56.6%, television 39.6%, radio 39.9% in 2000).

**1994 has no direct-response source of any kind.** The WEFA study begins with 1995.

### national_brand and local_retail — not sourceable
Three compilers publish "National" and "Local," and all three fold other money types inside them.
Coen's National includes direct mail and national Yellow Pages. MAGNA's National excludes them but is
on a different universe. The Economic Census gives one official national/local cut, for broadcasting,
for 1997 — grade A, and the only one of its kind. NAA and RAB give per-medium splits.

None of these is a national-*brand* pool. Both stay derived residuals.

---

## 4. Cross-checks — what the seams look like

Five of seven pass. Two flag, and both flags are findings.

| Test | A | B | Divergence | Flag |
|---|---|---|---|---|
| MAGNA digital 2000 vs IAB | 8,068 | 8,087 | −0.23% | — |
| MAGNA total vs Coen total 2000 | 177,500 | 247,472 | **−28.3%** | **yes** |
| MAGNA direct mail vs Coen direct mail 2000 | 18,250 | 44,591 | **−59.1%** | **yes** |
| DMA direct mail vs Coen direct mail 2000 | 44,600 | 44,591 | +0.02% | — |
| MAGNA newspapers (local+natl) vs NAA print total | 48,671 | 48,670 | +0.002% | — |
| RAB radio total vs Coen radio total 2000 | 19,819 | 19,295 | +2.7% | — |
| Independent money-type aggregate | — | — | **none exists** | **yes** |

Three of these are load-bearing.

**The direct-mail flag is the biggest number in the hunt.** MAGNA and Coen put the same medium in the
same year **2.44x apart** (2.69x on MAGNA's earlier vintage). The project's whole direct_response pool
rests on the Coen figure. Neither compiler is wrong — Coen bills the advertiser at list price
including production and postage, MAGNA counts what the supplier banked.

**Two "independent" sources turn out not to be.** DMA's direct mail matches Coen to nine million
dollars, which almost certainly means DMA took Coen's line. MAGNA's newspapers, local plus national,
match NAA's print total to one million dollars — so MAGNA is carrying NAA's number and re-partitioning
it 95.6/4.4 local/national, a different cut of the same total than NAA's national/retail/classified.
Both facts belong in the concordance. DMA remains independent for its DR-TV, DR-print and DR-radio
lines, which are the ones that matter.

**No independent aggregate for the split exists.** Not tax-based, not census-based, not
national-accounts. IRS SOI carries one undifferentiated advertising deduction. BEA does not partition
advertising by buyer type. Stated plainly in `cross_checks` as `xc-07`.

---

## 5. Two vintage instabilities nobody was carrying

**Coen restated his own 2000 national/local.** The contemporaneous 2001 vintage, preserved in the DMA
Fact Book p.6, reads Total National $148,098M, Total Local $95,582M, grand total $243,680M, internet
$4,333M. Galbi's curated vintage reads $151,664M / $95,808M / $247,472M / $6,507M. National moved
**+2.41%**, internet **+50.2%**. Claims `e5-buyers-010` and `e5-scale-010` both start from the curated
$151.664B; on the vintage the market actually read in 2001, the same construction gives a
national_brand figure about $3.6B lower.

**MAGNA restated its own 2000 direct mail by +10.0%** between the 2011 and 2012 Statistical Abstract
editions ($16,585M → $18,250M), with National and direct online unchanged.

---

## 6. Dead ends — twelve, recorded so nobody repeats them

1. **1997 Economic Census, Sources of Receipts** — publishing industries (NAICS 5111) carry a **dash**
   for every receipt line. No newspaper split at all. *(Retrieved and parsed.)*
2. **2002 Economic Census newspaper product lines** — advertising space splits by print/internet/other
   media and general/specialized, daily/other-than-daily. No national, retail or classified cut.
   *(Both PDFs retrieved and parsed.)*
3. **Any government series measuring classified, 1994–2001** — none exists. Census doesn't collect it,
   BLS produces price indexes only, IRS carries one undifferentiated deduction.
4. **IAB online classifieds before FY2000** — inside "Others," not separable.
5. **DMA/WEFA for 1994** — series begins 1995.
6. **Earlier DMA Fact Books (1996–2000 eds.)** — not found free. archive.org holds 1989, 2007, 2011
   only. DMA dissolved into the ANA in 2018; the reports were sold.
7. **MAGNA 1994–1999** — licensed. The backcast exists (Silk & Berndt confirm it); the only free
   renderings are the Statistical Abstract tables, which start at 2000.
8. **TVB, CAB, OAAA historical national/local** — no free archive.
9. **YPPA national vs local directory revenue** — association dissolved, no free historical file.
10. **Non-newspaper, non-online classified** — absent from every compiler.
11. **Veronis Suhler** — cannot populate any pool; "specialty media" mixes direct mail with sponsorship
    and promotion, and consumes Coen among its inputs.
12. **NAA classified sub-categories as an annual series** — naa.org Wayback captures of the classified
    and ad-expenditure pages are archived 404s. Only the year-2000 sub-split already in the project
    survives, through secondary reporting.

---

## 7. Access and licensing warnings

- **The DMA Statistical Fact Book 2001 PDF is a copyrighted DMA publication on a University of
  Washington course site.** It was read in full and everything transcribed is attributed by page. It
  is not a publisher-authorised open release and the link may not persist.
- **HSUS Table De523-526 is paywalled.** Title, coverage, columns and contributor were read from the
  free contents page. **No values were read and none appear in the dataset.**
- **MAGNA 1994–1999 is licensed.** The project's `adspend.json` `magna.access` field should be amended
  from a blanket "LICENSED" to "licensed except 2000 and 2003–2010, free via Statistical Abstract
  Tables 1278/1279."
- **CMR/TNS annual national totals are licensed and effectively lost.** Kantar no longer publishes the
  historical file; only trade-press fragments survive.
- **SEC EDGAR returns 403 to WebFetch.** Retrieved with curl and a declared User-Agent, as the era-5
  notes already record.

---

## 8. Judgment calls, stated so they can be overturned

1. **Everything in `key_figures` is a transcription, not an estimate.** Degenerate intervals
   (`ci80: [x, x]`) appear where a printed figure was copied. The uncertainty in those lines is
   definitional, not statistical, and putting a comfort band around a transcription would misrepresent
   which kind it is. Where two compilers disagree, the interval spans both and neither is averaged.
2. **MAGNA's 2000 figure is graded A.** It is a private compiler's series, but it was read from a
   Census Bureau publication, which is what the rigor_spec's grade A names. Defensible either way;
   B would also be arguable.
3. **DMA is not recommended as a stitch source.** It is a trade association with an interest in its
   category looking large, and its 39.6% direct-response share of television is far above any other
   contemporaneous characterisation. Recorded in the proxy lead as an upper bound, not an estimate.
4. **The Economic Census broadcasting split and the MAGNA 2000 column are both marked
   cross-check-only.** Each is a single year on a different universe. Stitching either would create
   exactly the silent splice this workflow exists to prevent.
5. **The public-company 10-K sum was not built.** Fifteen issuers × eight years is estimation work and
   this task was scoped to the hunt. It is logged as the highest-value proxy lead.
6. **USPS RPW and the Household Diary Study were identified but not retrieved.** They are the official
   rail that would adjudicate the MAGNA-vs-Coen direct-mail gap, and they are the single most valuable
   unchased lead in this file.

---

## 9. What the estimator should do with this

- **`classified`** — regrade off its source. Newspaper component B now, A if the 10-K sum is built.
  Declare the online 1994–99 hole and the non-newspaper fringe as residuals; do not absorb them.
- **`direct_response`** — re-derive with an interval spanning the DMA and MAGNA definitions. The
  current single Coen-derived floor of $47.5B is defensible as a point but not as a range, now that
  two published compilers bracket it at $31.1B and $191.6B on their own universes. **1994 has no
  source — leave the hole visible.**
- **`national_brand`, `local_retail`** — stay grade C with an explicit derivation. Widen intervals to
  carry the two vintage instabilities in §5, particularly the direct-mail line being subtracted out of
  National.
- **Invariant `r2b-val-03` compliance** — the DMA cross-tab route and the 10-K route are genuinely
  separate routes with separate inputs. The Coen-vintage route is *not* a second route; it measures
  instability in the first one. Note also that DMA's direct-mail line and MAGNA's newspaper line both
  turn out to be re-badged Coen and NAA figures (§4), so neither counts as an independent route on
  those specific media.
