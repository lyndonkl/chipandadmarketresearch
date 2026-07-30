# adspend.json — assessment notes (R2, series-archaeologist)

Built 2026-07-30. Data freeze 2026-06-30. Output: `p2-ad-market/data/adspend.json` (1,573 points, 1.3 MB).

Internal working document — exempt from the readability gate.

---

## 1. Headline

There is no US advertising expenditure series. There are five compilers who each measured a
different object, three of whom stopped, and a fifteen-year hole in the middle of the stretch this
project cares most about. The dataset does not hide any of that: every point names its compiler,
every join carries a concordance entry with a measured magnitude, every constructed value carries
its arithmetic, and every hole is declared rather than interpolated.

The single most useful new finding of this build: **about 69% of the notorious Coen→Magna level
break is category scope, not the billings-versus-revenue price basis.** The break is usually
described as a methodology change (list-price billings → media-supplier revenue). Measured at the
one overlap year both compilers publish, the price basis explains only 7.2 points of the 23.4-point
drop. The rest is three categories — miscellaneous, business papers, farm publications — that Magna
simply does not carry. That reframes the seam from "the number changed" to "the object changed",
and it is what makes the 1980–2007 bridge estimable at all.

---

## 2. Inventory

| Series | Role | Coverage | Compiler / home | Measures | Access |
|---|---|---|---|---|---|
| `coen_mce` | stitch | 1919–2007 | Robert J. Coen, McCann-Erickson → Interpublic; digitised by Douglas Galbi (CS Ad Dataset v1.14) | Advertiser **billings**, bottom-up, at **list (rate-card) prices**, 11 media | Free (galbithink.org `.xls`) |
| `magna` | stitch | 1980–2025 | MAGNA Global (IPG Mediabrands) | Media-supplier **revenue**, top-down, 8 media (MG8) | **Licensed.** Only press releases + Silk & Berndt summary stats are readable |
| `iab_pwc` | stitch | 1996–2025 | IAB, survey run by PwC | US internet ad **revenue**, seller-reported | Free PDFs |
| `irs_soi` | cross-check-only | 1960, 2005–2022 | IRS Statistics of Income | The **advertising deduction** on corporate tax returns | Free (irs.gov) |
| `benchmarks_pre1919` | stitch | 1867–1918 | Printers' Ink retrospective (HSUS T 444) + Coen's 1999 revision | Total US advertising volume, estimated decades later | Free |
| `naa_newspaper` | stitch (**added**) | 1950–2010 | Newspaper Association of America research dept. | Newspaper revenue split national / retail / **classified** | Free via Internet Archive; NAA no longer exists |
| `census_manufactures` | cross-check-only (**added**) | 1909–1937 | US Census of Manufactures, via Borden (1942) | Publisher advertising **receipts**, enumerated | Free |
| `bridge_mce_mg8` | derived-bridge (**added**) | 1980–2007 | this dataset | Constructed MG8-basis estimate | n/a |

### Three series added beyond the schema spec

Each carries `added_beyond_schema_spec: true` and a `why_added` string in the JSON.

1. **`naa_newspaper`** — the schema requires classified as a tracked money-type line. *No named series
   supports it.* Coen splits national/local only; Magna splits Direct/National/Local. NAA is the only
   compiler that ever published the national / retail / classified split, and its newspaper print
   total is the number Coen used. Without this series the classified axis is empty for the whole century.
2. **`census_manufactures`** — the only official, enumerated (not estimated) advertising aggregate that
   exists before 1960, and therefore the only independent check available for the first third of the
   window. Without it the cross-check rail starts in 2005 and 86 of 159 years have no validation at all.
3. **`bridge_mce_mg8`** — holds every constructed value, so the named compilers' series contain only
   their own numbers. Putting bridged points inside `magna` would have tagged Coen-derived arithmetic
   with Magna's name.

If the downstream chart builder iterates `series` generically (as `tools/verify_p2.py` does), the
additions are transparent. If it hard-codes the five keys, it will silently drop the classified axis,
the pre-1960 cross-check and the bridge ribbon.

---

## 3. What each series actually measures

**Coen/MCE is not a measurement of money paid.** Silk & Berndt (NBER WP 28161, §III.2.2) state the
estimates were "typically based on information about current list prices … rather than actual
transaction prices". So the series embeds unmeasured, era-varying discounting, heaviest exactly where
negotiation was heaviest (TV scatter, late-era newspapers). Every Coen point here is graded B for this
reason and no higher. **A chapter making a pricing-mechanism claim must not cite this dataset as if it
recorded realised prices.**

**Coen's newspaper line is not independent of NAA.** It is the NAA publisher survey unaltered, to the
dollar, in 36 of the 40 years 1950–1989. From 1990 Coen adjusts it (up to +0.86% in 1996, −0.18% by
2007). NAA therefore cannot validate Coen; it only supplies the split Coen never published.

**Coen's pre-1935 newspaper line is a scaled Census figure.** The CS Ad Dataset multiplies Census of
Manufactures newspaper receipts by 1.5187 to build 1919–1934 newspaper estimates. For those years the
Census "cross-check" is partly checking Coen against its own input; the honest test there is the
*stability of the factor*, not the level. This is why `census_manufactures` cross-checks report an
implied outlay/receipts factor rather than a naive level divergence.

**Coen's internet line is a known undercount** from 2004 — the dataset's own curator says so in the
workbook. It is kept because dropping it breaks the partition identity (Coen's media lines sum exactly
to his total in all 89 years; verified). Its CI is deliberately skewed up to the IAB value.

**Magna's MG8 is a different object** and its modern public basis may be a *third* object: Silk &
Berndt describe eight media *including direct mail*; Magna's 2020s public splits are digital-pure-player
+ traditional-media-owner with no direct-mail line visible. Unresolved — flagged as an open question in
the concordance rather than guessed.

**IRS SOI measures the tax line, not the media market.** It includes consumer and trade promotion, is
tax-year not calendar-year, and excludes unincorporated firms. Its divergence from the media series is
a *feature* (below-the-line drift), which is why it is cross-check-only and never stitched.

---

## 4. Calibration policy (the CI rules actually applied)

| Points | ci80 | Grade |
|---|---|---|
| Coen totals 1946–2007 | ±2% | B |
| Coen totals 1935–1945 | ±4% | B |
| Coen totals 1919–1934 | −15% / +20% (spans the HSUS vintage) | B |
| Coen medium lines 1935+ | ±5% | B |
| Coen medium lines 1919–1934 | ±25%, `method` names them part-estimate | C |
| Coen internet 1997–2007 | [0.95× Coen, 1.05× IAB] — asymmetric by design | B |
| Constructed broadcast/cable 1980–89 | ±5%, `derived_from_subcategories: true` | C |
| IAB annual | ±1.5% (restatement noise) | B |
| NAA | ±2% | B |
| IRS SOI (retrieved from irs.gov) | ±1% | A |
| IRS 1960 (read from a secondary summary table) | ±2% | B |
| Magna press points | ±2–3%, wider where vintages conflict | B |
| Pre-1919 benchmarks | era-1's own CIs, spanning both vintages | B (C where single-vintage or interpolated between vintages) |
| Bridge points | [0.85, 0.98] × restricted base — skewed **down** | C, with `method` |

`as_of` on `irs_soi` points is the retrieval date (2026-06-30), not the SOI volume's publication date,
which runs 2–3 years behind each tax year. Declared in the series object as `as_of_convention`.

---

## 5. The seams (19 concordance entries, all with measured magnitude)

Ranked by how badly a naive splice would mislead:

1. **`coen-magna-basis`** — 1980: MCE $53,570m vs MG8 $41,021m, −23.4%. Restricting Coen to the eight
   MG8 media gives $44,207m and a residual wedge of −7.2%. Scope explains 69% of the break.
2. **`coen-iab-internet`** — the same word, two objects. Coen's internet is 66% of IAB's in 1997 and
   **49.7%** by 2007 (a $10.7bn gap in one year).
3. **`coen-ooh-2000`** — Billboards → Out of Home at **2.77×** on identical 1999 data ($1,725m → $4,780m).
   1999 publishes both; the 1999 billboards point is marked `partition_member: false`.
4. **`coen-vintage-revision`** — the 1920s were revised **down 15–18%** between the HSUS/T444 and
   Coen-2000 vintages (1923: −18.2%). 1932–45 moves under 2%. 1999 was revised *up* 3.3% between the
   2000 and 2003 vintages. Large enough to change the 1920s ad/GDP story.
5. **`coen-medium-detail-1935`** — by-medium detail does not exist before 1935. "Other" is **62.6%** of
   the 1919 total. Radio gets its own line in 1935, thirteen years after commercial radio advertising began.
6. **`coen-tv-split-1990`** — one Television line becomes Broadcast + Cable. Coen's own sub-categories
   push the split back to 1980 *exactly* (they sum to the published Television line — identity residual
   0 in all ten years, asserted at build time). Before 1980 there is no cable line at all.
7. **`coen-category-lifecycle`** — Yellow Pages appears in 1980 at $2,900m with no restatement, while
   miscellaneous steps *down* $2,074m in the same year. Farm publications and magazine sub-categories
   are dropped after 1989. Entries and exits, not growth and collapse.
8. **`magna-basis-change`** — flagged `open-question`; magnitude "unquantified" because the methodology
   document is licensed and was not read.
9. **`magna-iab-digital`** — Magna's 2025 DPP ($294bn) and IAB's 2025 total ($294.593bn) are the same
   number to 0.2%. **Do not treat them as independent; do not add them.**
10. **`naa-internal-sum`** — the NAA table does not add up in 1956 (+$14m) and 1957 (−$30m). Published
    values kept unaltered; the residual is recorded on the affected points. No year silently repaired.

Also: `coen-naa-newspapers`, `coen-census-receipts`, `coen-irs-levels`, `magna-irs-divergence`,
`iab-vintage`, `benchmarks-vintage`, `bridge-vs-coen`, `bridge-vs-magna`, `naa-online-2003`.

Every cross-series (year, medium) collision in the file is covered — `verify_p2.py r2-concordance`
passes.

---

## 6. The bridge (1980–2007)

**One overlap observation exists.** Magna publishes no MG8 annual series in any free source. Silk &
Berndt's Appendix Table 2a gives the 1980–2018 *range* — and because 1980 is MG8's first and smallest
year, the range minimum ($41.021bn) *is* the 1980 value. That is the only anchor.

Method (three steps, arithmetic stored in `bridge.steps`, all re-runnable):

1. Strip the categories MG8 does not carry: miscellaneous, business papers, farm publications.
2. Substitute IAB's seller-side internet figure for Coen's undercounted line.
3. Multiply by the 1980 like-for-like ratio `W = 41021 / 44207 = 0.92793`, held constant.

2007: `(279612 − 37383 − 4111 − 10529 + 21206) × 0.92793 = 230,864`.

**Out-of-sample validation.** Subtract the two media GroupM's "measured media" basis excludes (direct
mail, directories) on the same basis: **$161,757m** against GroupM's published US measured-media total
for 2007 of **$162,600m** — a **0.5%** difference. The bridge was not fitted to that number. This is the
strongest available evidence the method is not fantasy, but GroupM is itself a commercial estimate on a
third basis, so it bounds the bridge rather than confirming it.

**Known direction of error.** Rate-card discounting deepened across the period, so the true wedge in the
2000s is probably *below* 0.928. Point CIs are therefore skewed downward ([0.85, 0.98] × base). Holding
a wedge constant across 27 years on one observation is the weakest link in this dataset and is graded C
everywhere, including at 1980 where it reproduces Magna by construction (an identity, not a test).

### Holes left visible, never interpolated

| Years | Why |
|---|---|
| 1840–1866 | No estimate of US advertising of any kind exists. A hole, not a low number. |
| 1867–1918 | Benchmark years only (1867, 1880, 1890, 1900, 1904, 1909, 1914, 1917, 1918). Intervening years not filled. |
| 1919–1934 | Totals exist; **by-medium detail does not**. Three lines only. |
| 2008–2020 | No free annual US total between Coen's last year and Magna's press-released years. |
| 2011–2025 | No free by-medium US series at all. The 15 years the project cares most about. |

---

## 7. Cross-checks (31 rows, 5 flagged)

Tolerance 15%.

| Year | Dataset basis | vs | Divergence | Flag |
|---|---|---|---|---|
| 2005 | Coen billings | IRS | +7.06% | — |
| 2006 | Coen billings | IRS | +1.68% | — |
| 2007 | Coen billings | IRS | **+0.79%** | — |
| 2006–07 | bridge (MG8 basis) | IRS | −17.0% | **flagged** |
| 2018 | Magna MG8 | IRS | −34.2% | **flagged** |
| 2021 | Magna | IRS | −33.5% | **flagged** |
| 2022 | Magna | IRS | −31.3% | **flagged** |
| 2008–2017, 2019–2020 | *(none)* | IRS | null | hole recorded |
| 1919–1937 (6 rows) | Coen newspapers | Census receipts | factor 1.50–1.55 | — |

The flags are findings, not failures:

- The **bridge flags are expected by construction** — media-owner revenue *should* sit ~17% below
  advertiser outlay. A bridge that did *not* flag against IRS would be suspicious.
- The **Magna flags are the real result**: the two rails agree to within 1% in 2007 and diverge to 31%
  by 2022. The tax line keeps absorbing promotion, agency and martech spend that never reaches a media
  owner. Silk & Berndt's r = 0.998 (1960–2007) does not survive into the 2010s. **Any chapter using
  "US ad spend" for 2015+ must say which rail it means** — the answer differs by a third.
- Twelve rows carry `divergence_pct: null` and a note. That is the 2008–2020 hole, made countable.

The Census rows test the *stability of the outlay/receipts factor* (~1.52), not the level, because for
1919–1934 Coen's newspaper line is derived from the same Census receipts.

---

## 8. Money-type axis — what is derivable and what is not

| Money type | Source | Coverage | Points |
|---|---|---|---|
| national_brand | Coen "Total National" + Coen per-medium National; NAA national | 1935–2007 (Coen), 1950–2010 (NAA) | 235 |
| local_retail | Coen "Total Local" + per-medium Local; NAA retail | same | 235 |
| classified | **NAA only** | 1950–2010 | 61 |
| direct_response | **not published by any compiler** | — | 0 |

`money_type` is set only where the compiler published the split. Coen national + local sums exactly to
his total in all 73 years (verified at build time). **Direct response is not a published class.** The
constructed grouping is newspaper classified + directories + direct mail. That came to $77,427m in 2000,
31.3% of all US advertising, against $6,507m for the whole internet. It lives in `claims` as
`ds-money_type-003`, graded C with its method, and deliberately not as points. Fabricating a direct-response *series* would have
been the easiest and worst thing in this build.

---

## 9. Verifier status — one genuine dataset gap, one verifier defect

```
r2-series        PASS
r2-concordance   PASS
r2-freeze        PASS
r2-checks        FAIL — forecasts.json does not exist (not this task's artifact)
r2-reconcile     FAIL — 9 violations, all spurious; see below
```

**`r2-checks`** fails only because `verify_p2.py` loads `p2-ad-market/data/forecasts.json`, which the
superforecaster panel produces, not R2's dataset lead. The `cross_checks` half of that invariant passes:
no divergence over 15% is left unflagged.

**`r2-reconcile` cannot pass for any dataset, and this is a verifier bug, not a data problem.** The check
selects era SCALE claims by the substring `"total"` in the statement and compares the dataset's dollar
total against the claim's `ci80`, ignoring both the claim's unit and what it measures. Two failure modes:

*Non-currency claims caught by the keyword* (6 of 9):

| Claim | What it measures | Demanded band |
|---|---|---|
| `e5-scale-003` | percent change 2001 | **[−10.0, −4.5]** — no positive dollar total can satisfy it |
| `e4-scale-006` | percent revision between vintages 1990 | [0.2, 0.4] |
| `e3-scale-006` | percent national 1975 | [53.5, 55.5] |
| `e6-scale-004` | percent internet share 2007 | [6.8, 7.8] |
| `e3-scale-007` | **world** total 1975, $bn | [42, 70] |
| `e6-scale-006` | **worldwide** 2007, $bn | [420, 500] |

*Unit-blind comparisons* (3 of 9): `e5-scale-001` (1994), `e5-scale-002` (2000) and `e7-scale-001` (2025)
state their totals in **USD billions** while eras 2, 3, 4 and 6 state theirs in **USD millions**. No
single unit choice can satisfy both halves of the era corpus. This dataset uses USD millions throughout —
the Coen source's own publication unit, and the unit of 3 of the 5 currency-stating era records.

**The substantive invariant passes.** The dataset carries a `reconciliation` array that normalises units
and filters to currency-denominated total claims. **All 14 comparisons are inside the era claims' own
CIs**, including all seven era-1 benchmark years:

```
e1-scale-001..007  1867-1917  benchmarks  WITHIN
e3-scale-001/002   1950,1975  coen        WITHIN
e5-scale-001/002   1994,2000  coen        WITHIN   (era claim in $bn)
e6-scale-001/002   2002,2007  coen        WITHIN
e7-scale-001       2025       magna       WITHIN   (era claim in $bn)
```

Recommended fix for the verifier (do **not** patch the data to satisfy it): filter era claims by unit
(`"million"`/`"billion"` in unit, and no `percent`/`ratio`/`world`/`global`), scale billions by 1000, and
compare. Or add an explicit `reconciles_with: "dataset_total"` flag on the era claims that are meant to
be compared. The dataset's `reconciliation` array is the reference implementation.

---

## 10. Dead ends and things not obtained

- **Magna's annual series is licensed.** 1981–2017 and 2019–2020 US totals are unobtainable without a
  subscription. The `magna` series has 9 points across 46 declared years, and the series object says so
  in its `access` field. Nothing was paraphrased into the dataset as if read.
- **HSUS Millennial Edition Table De482-515** ("Advertising expenditures, by medium: 1867–1998") is behind
  the Cambridge paywall. Not read. The 1975 print edition of Historical Statistics (series T 444) is free
  and was used instead — its 1867/1880/1890/1900/1904/1909/1914/1917/1918 values were read off the
  scanned table.
- **IRS SOI 1961–2004 and 2023+.** The Complete Report PDFs exist on irs.gov only for tax years 2005–2013
  (`YYcoccr.pdf`), 2014–2022 (`p16--YYYY.pdf` and `YYco21ccr.xlsx`). Everything before 2005 404s. 1960 is
  carried from Silk & Berndt's summary table at grade B. This leaves 1919–2004 with no IRS rail; the
  Census of Manufactures series partially covers 1909–1937 for print only.
- **Pre-1919 "~$3B early 1900s"** (from the task brief) is not supported by either surviving vintage. The
  record tops out at $1,627m (1917, T 444) / $1,380m (Coen 1999). $3bn is roughly the 1920 T444 figure
  ($2,935m). Recommend correcting that characterisation wherever it is carried.
- **eMarketer, WARC, Zenith, GroupM detail** are all licensed. GroupM's 2007 US measured-media total is
  used once, as a published press figure, purely to validate the bridge — never as a dataset point.
- **Pew's post-2013 newspaper estimates** were deliberately not used. They are extrapolations from as few
  as four public companies' filings; adding them would put a grade-C reconstruction on the same visual
  footing as the NAA census-of-publishers data that precedes it. The newspaper line therefore ends in
  2010, visibly.

---

## 11. Judgment calls, stated so they can be overturned

1. **USD millions everywhere.** Source unit for Coen; costs 3 spurious verifier violations. Reversing
   this would cost more (10 violations) and would break the 1919–2007 spine's native unit.
2. **One IAB vintage (FY2025) for all years**, so year-on-year changes are not vintage artefacts. The
   restatements are recorded in `iab-vintage` instead. Cost: the 1996–2002 values come from the FY2000/
   FY2008 reports because the FY2025 historical table starts at 2003.
3. **Bridge points in their own series, not in `magna`.** Provenance beats convenience.
4. **Constructed 1980–89 broadcast/cable split kept, graded C** even though it is an exact identity, because
   the *category* did not exist in the published partition for those years. Grade reflects construction,
   not arithmetic risk.
5. **1999 billboards kept as a point** with `partition_member: false` rather than dropped, so the 2.77×
   break is visible on the chart at its own scale.
6. **NAA 1956/57 not repaired.** Recorded as `source_internal_inconsistency` on the affected points.
7. **No direct-response money-type points.** Claim only.
8. **`cross_checks` rows for 2008–2020 emitted with null values** rather than omitted, so the hole is
   countable rather than invisible.

---

## 12. Handoff

For the chart layer: `series[*].points` are chart-ready; `partition_member` marks which medium lines sum
to the total; `bridged: true` marks constructed ribbons; `concordance[*].magnitude` carries the numbers
the seam annotations should display; `bridge.gaps_not_bridged` carries the five holes that must render as
holes. Two-ribbon overlaps are available at 1980–2007 (`coen_mce` + `bridge_mce_mg8`), 1996–2007
(`coen_mce` internet + `iab_pwc`) and 1950–2007 (`coen_mce` newspapers + `naa_newspaper`).

For R3: 13 dataset claims carry `ds-` IDs and all pass `check_claim`. The four grade-C claims
(`ds-bridge-001`, `ds-bridge-002`, `ds-money_type-003`, `ds-crosscheck-001`) each carry a `method` and
should be attacked first. The most refutable number in the file is the constant wedge `W = 0.92793`.
