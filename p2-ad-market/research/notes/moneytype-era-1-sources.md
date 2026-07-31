# Era 1 money-type source hunt — working notes

Task: establish whether any credible source publishes the national_brand /
local_retail / classified / direct_response split of US advertising spend for
1840s–1917, in whole or in part. Source hunt only — no estimation performed.

Dataset: `p2-ad-market/data/moneytype/sources-era-1.json`
Run date: 2026-07-30. Tolerance for cross-check flags: 15 % (as given).

---

## 1. Headline

**No compiler has ever published the four-way money-type split for any year in
this era.** That is a firm finding, not a search failure — I tested it against
the Library of Congress's own inventory of historical advertising data, whose
earliest item is Standard Rate & Data Service (1919, and it publishes rates, not
spend).

But the hunt was not empty. It turned up one source that changes the era's
evidence base:

> **Printers' Ink, 4 May 1911, p. 79** — "The following is our estimate of the
> amount of money spent through different advertising channels", twelve channels
> summing to **$616,000,000**.

Read from the page image, not OCR. Free. In window. Named compiler. It gives
direct mail, farm and mail-order, magazines, billposting, outdoor, street car,
novelty, sampling, distributing and house organs as separately measured dollar
lines in the middle of the era. Its newspaper line is labelled **"retail and
general"** — the period's own words for local versus national money — and it
names **no classified line at all**.

Two further finds matter:

- **William H. Field (business manager, Chicago Tribune), 1916**: the Tribune's
  advertising volume was "about equally divided between classified and display,
  although the former brings a much lower rate". The only in-window number on
  classified share anywhere.
- **Harvard Bureau of Business Research, 1913 and 1915**: measured
  advertising-to-net-sales ratios for retail shoes (about 2.0 %) and retail
  groceries (about 0.1 %). A local-retail path that never touches ANPA.

---

## 2. Inventory: what covers any part of the window

| # | Source | Compiler | Years | Pools it can touch | Access | New to project |
|---|---|---|---|---|---|---|
| s01 | Printers' Ink, 4 May 1911, p. 79 | Printers' Ink Pub. Co. | 1911 | DR (strong), NB (partial), LR (bundled) | free, primary | **yes** |
| s02 | Starch, *Advertising* (1914) pp. 7, 91–92 | Daniel Starch | 1911–14 | reprints s01; adds a $700 m print total | free | **yes** |
| s03 | ANPA Bureau of Advertising via Borden 1942 | ANPA | 1915–38 | NB, LR (incl. classified) | numbers free via Galbi; ANPA original not online | no |
| s04 | Field, *Business Management of a Newspaper* (1916) | Chicago Tribune | 1916 | **classified**, NB/LR by origin | free | **yes** |
| s05 | Rogers, *Building Newspaper Advertising* (1919) p. 319 | Jason Rogers | 1917–19 | NB, LR | free | **yes** |
| s06 | Harvard BBR Bulletin 1 (1913), shoes | Harvard BBR | 1912–13 | LR ratio | free | **yes** |
| s07 | Harvard BBR Bulletin 5 (Nov 1915), groceries | Harvard BBR | 1914–15 | LR ratio | free | **yes** |
| s08 | Lee, *The Daily Newspaper in America* (1937) Table XXIX | A. M. Lee, from Census | 1849–1933 | denominator back to 1879 | free | **yes** |
| s09 | Galbi CS Ad Dataset (xls) | Galbi / Coen | 1900–2007 | negative evidence | free | no |
| s10 | HSUS De516-522 / T 485-491 | Media Records | 1928–70 | classified, post-window | Millennial paywalled; 1975 free | no |
| s11 | Cherington, *Advertising as a Business Force* (1913) | P. T. Cherington | 1910–13 | qualitative only | free | **yes** |
| s12 | Crowell, *National Markets & National Advertising* | Crowell Pub. | 1919–30 | NB, post-window | print | **yes** |
| s13 | PIB *National Advertising Records* / NAI | PIB / LNA | 1927–73 | NB, post-window | LC print | **yes** |
| s14 | Agnew, *Advertising Media* (1931) | H. E. Agnew | 1920–31 | unverified | HathiTrust | **yes** |
| s15 | 1926 Britannica "Advertising" | Britannica | 1920 | DR | free | no |
| s16 | Direct Mail Advertising Assn (1917/18) | trade body | 1918– | context | n/a | **yes** |
| s17 | USPS mail volume by class | Post Office | 1926– | DR proxy, fails | free | no |
| s18 | Barger, *Distribution's Place* (NBER 1955) | NBER | 1869–1949 | LR denominator | free | **yes** |
| s19 | Rogers, *Newspaper Building* (1918) | Jason Rogers | 1917–18 | classified (structural) | free | **yes** |
| s20 | LoC Historical Marketing Industry Data guide | Library of Congress | 1919– | completeness test | free | **yes** |

NB = national_brand, LR = local_retail, DR = direct_response.

---

## 3. Pool by pool

### national_brand — partial

Two in-window compilers, neither framing it as a money type:

- ANPA via Borden: national newspaper dollars 1915 $55 m, 1916 $75 m, 1917 $80 m.
  Newspapers only. Already in the record.
- Printers' Ink 1911: the channels that were overwhelmingly national in 1911 —
  magazines $60 m, billposting $30 m, outdoor $25 m, street car $10 m, novelty
  $30 m. The newspaper line is not split.

**Nobody states national advertising as a share of total US advertising for any
year in the window.** And there is a live conflict to carry: Rogers's national
special representative put national at ~30 % of a typical daily's linage and
~50 % of its net income, against ANPA's 20 % of newspaper dollars. Three
denominators, one phrase. Per the rigor spec: widen, cite both, never average.

### local_retail — partial, and never separated from classified

ANPA's local line is local-including-classified; the column header in Galbi's
sheet says so outright. Printers' Ink names "retail" in its newspaper label but
publishes one number.

The genuinely new path is bottom-up and independent: Harvard BBR ratios ×
retail sales from Barger (NBER 1955). Warning recorded at source — the grocery
bulletin excludes department stores, chains and mail-order houses, and the
largest local advertiser class (department stores) has no in-window Harvard
bulletin. That series starts with 1921 data.

The spread between trades is an order of magnitude (0.1 % groceries vs 2.0 %
shoes), so a single blended retail ratio is not defensible.

### classified — **no source found**

This is the plainest finding of the hunt. What I tried:

- **Census of Manufactures**: enumerates advertising receipts, never by class of
  advertising, in any census year. Confirmed for 1879–1933 via Lee 1937 Table
  XXIX as well as the 1919 bulletin the project already reads. I also downloaded
  and searched the 1929 Census of Manufactures (vol. III) — no display/classified
  split there either.
- **HSUS**: both the 1975 series T 485-491 and the Millennial De516-522 start at
  **1928**. I checked the Millennial specifically in case it back-extended. It
  does not.
- **Media Records, Inc.**: trademark filed 27 Nov 1928. Lee 1937 cites it for 87
  and 196 cities in the 1930s. No pre-1928 data found.
- **Coen via Galbi's own category table**: no classified category, ever;
  national/local partition begins 1935.
- **ANCAM** (the classified managers' trade body): founded **1920**. I had
  guessed 1913; that was wrong. Three years past the era.
- **PIB**: 1945. **SRDS**: 1919, and it is rates.
- **Printers' Ink 1911**: classified is not one of the twelve channels.
- **NAA**: 1950 onward — the project's existing and only classified compiler.

Best in-window evidence is firm-level and is **linage, not revenue**: Field 1916
on the Chicago Tribune. Note what this does to the current estimate. The record
back-projects the 1928–41 52-city band of 18–21 % and argues the pre-WWI share
was lower. The one in-window observation available runs at about 50 % of linage
at the country's leading want-ad daily. That does not prove the national share
was higher, but it removes the ground from under "materially below the 1928
level", and it supports R3's correction upward (12 → 13 %) rather than a
reversal.

One loose end worth chasing: Field describes a **daily commercial report covering
all eight Chicago papers, split display vs classified and by origin (Chicago /
West / East)**, plus a monthly report tabulating classified under about 380
classifications. A city-level, three-way money-type measurement service existed
in 1916 — twelve years before Media Records' series begins. The text does not
name the compiler and I could not identify it.

### direct_response — partial, and materially improved

Printers' Ink 1911 gives, in window: direct mail $100 m, farm and mail-order
$75 m, demonstration and sampling $18 m, distributing $6 m, house organs $7 m.
That replaces the back-cast from the 1926 Britannica's $300 m for 1920 with a
contemporaneous measurement point.

Two cautions kept visible rather than resolved:

1. No source uses the phrase "direct response". Mapping these channels to the
   pool is my interpretation and is labelled as such in every entry.
2. "Farm and mail-order advertising" is a hybrid — "farm" names a medium,
   "mail-order" names a buying logic. Between $0 m and $75 m of it belongs to
   the pool. That is up to 12 % of the entire Printers' Ink total.

---

## 4. Cross-checks run (tolerance 15 %)

| # | Test | Result | Flag |
|---|---|---|---|
| cc01 | PI 1911 total ($616 m) vs T 444 1909 ($1,142 m) and Coen 1999 1909 ($1,000 m) | 46.1 % and 38.4 % below | **BREACH** |
| cc02 | PI 1911 newspaper line vs Census newspaper receipts × documented wedge | ratio 1.536 vs Galbi's 1.519 — 1.1 % apart | **PASS** |
| cc03 | PI 1911 magazines + farm/mail-order vs Census "other periodicals" × wedge | 46 % above | **BREACH** |
| cc04 | Any independent aggregate (tax / census / national accounts) for a money-type pool | none exists | **NONE** |

cc01 is the uncomfortable one. The **same publishing house's** contemporaneous
1911 estimate and its later retrospective series differ by roughly a factor of
two. Both are named and credible. Both get carried; the interval widens.

cc02 is the reassuring one, and it is why I trust the individual channel lines
even though the grand total fails cc01. Arithmetic, re-runnable:

```
Census newspaper advertising receipts: 1909 = 148.551, 1914 = 184.147  ($m)
interpolate to 1911: 148.551 + (184.147 − 148.551) × (2/5) = 162.789
Printers' Ink 1911 newspaper line 250 / 162.789 = 1.536
Galbi's documented Coen-to-Census factor = 1.51870771642571
difference = (1.536 − 1.519) / 1.519 = 1.1 %
```

cc03 shows the farm/mail-order line cannot be periodical space alone — roughly
$40–45 m of it is something else, most plausibly mail-order houses' own outlay.
That is evidence *for* reading part of it as direct-response money, but it is
inference, not what the source says.

cc04 deserves to be said plainly in the record: **there is no independent
aggregate against which an era-1 money-type split can be validated.** Federal
corporate income tax starts 1913 and SOI does not break out an advertising
deduction until much later (the project's `irs_soi` starts 1960). Census counts
publisher receipts, not advertiser outlay, and never by class. National accounts
begin 1929.

---

## 5. Definitional breaks logged (5)

The one that matters most: **Printers' Ink's own 1911 taxonomy has no classified
line.** Its newspaper category enumerates exactly two of the four money types —
"retail and general" — and omits the third. If classified sits outside the
$616 m, the table understates newspaper money. If it sits silently inside the
$250 m, the label is wrong. The source does not say which and I found no way to
decide.

The other four:

- Three compilers use "local" or "retail" for three different objects, across
  1911, 1915 and 1935.
- The farm/mail-order line is a hybrid.
- Three denominators all go by the name "national's share".
- Classified is measured at one paper in 1916, at 52 cities in 1928, and in
  revenue never.

---

## 6. Dead ends (11 logged in the dataset)

Worth naming here:

- **Daniel Pope's dissertation** ("The Development of National Advertising,
  1865–1920", Columbia 1973) — the JEH summary is paywalled with no abstract
  published and access marked temporarily unavailable; the 1983 book is
  lending-restricted at the Internet Archive. This was my highest-hope academic
  reconstruction and I could not open it. It stays on the list.
- **ANPA's own publication** *Expenditures of National Advertisers in
  Newspapers, 1915–1938* — no free or open digital copy anywhere. The era's only
  two-way dollar split reaches us third-hand: ANPA → Borden 1942 → Galbi. Borden
  1942 itself is not in any free full-text repository. **Flagged: the project
  has never read the primary for its most load-bearing money-type source.**
- **Post Office third-class mail** — looked like the strongest government proxy
  for direct response. It fails: annual volume by class exists only from 1926
  (Act of 28 Feb 1925). Pre-1926 figures are periodic-weighing estimates.
- **Tipper et al. (1919)** and **Cherington (1913)** — both read, neither
  contains an aggregate.

## 7. A logged dead end that is now resolved

The era-1 notes recorded "Lineage C" — Duke's uncited claim that "$600 million is
spent on advertising by big business [in 1910]" — as inconsistent and unusable.
It is now traceable: it matches the Printers' Ink 4 May 1911 tabulation of
$616,000,000. The companion phrase "this represents 4 % of the national income"
remains unsupported and should stay rejected, but the dollar figure has a real
source and belongs in the record.

---

## 8. Judgment calls

1. **Grade A on the Printers' Ink transcription.** The grade is for the
   transcription — an exactly quoted published table read from the page image —
   not for the estimate's accuracy. The estimate carries no stated method. I
   said so in the claim's note field so the grade cannot be misread later.
2. **I read the page image rather than trusting OCR.** The microfilm OCR clips
   the left column and rendered the newspaper label as "(re… and general)". The
   image shows "(retail and general)", which is the whole money-type point. Same
   discipline on Rogers 1919: the first scan's OCR gave "about Jo per cent"; a
   second independent scan of the same edition gives "about 50 per cent".
3. **Independence of s01 is qualified, not asserted.** Printers' Ink is the same
   house named in the T 444 source note, so it is *not* provenance-independent of
   `benchmarks_pre1919`. It *is* method-independent — contemporaneous estimate vs
   retrospective series. The dataset says both.
4. **Proposed claims are proposals.** Six of them, IDs continuing the era-1
   numbering (`e1-scale-015`, `e1-scale-016`, `e1-buyers-009`, `e1-buyers-010`,
   `e1-sellers-007`, `e1-buyers-011`). They are **not** in `era-1.json` and will
   collide if that file is edited independently first. All are pure
   transcriptions; none is an estimate.
5. **Schema.** No `schema_spec` was supplied for this sub-task beyond the five
   keys named in the brief. I kept those five exactly and added four:
   `definitional_breaks`, `cross_check_flags`, `dead_ends`, `proposed_claims` —
   because the seams, the tolerance breaches and the documented absences are
   findings, and burying them in prose would hide them.
6. **`e1-sellers-004` should be re-sourced.** It currently rests on Pope (1983)
   cited at second hand through Horsky & Zeithammer for the 44 % figure. Lee 1937
   Table XXIX gives the same 44.0 % straight from the Census, with the dollar
   amounts behind it, and extends to 1889 and 1904. Grade A replaces grade B.

---

## 9. Highest-value unexplored lead

**Walk the free Printers' Ink run at the Internet Archive by date, looking for
later editions of the 4 May 1911 channel table.** A journal that published such
an estimate once probably updated it. A 1914 or 1916 edition would put a
by-channel table on the era's own benchmark years, and might add a classified
line — which would close the one pool that currently has nothing.

Method note for whoever picks this up: Internet Archive full-text search did
**not** surface the 1911 table by phrase. I found it by working back from
Starch's footnote. Walk issues by date; do not rely on search.

Second lead: identify the compiler of the 1916 Chicago city-wide linage report
Field describes. If those reports survive, they are an in-window, city-level,
three-way money-type measurement twelve years earlier than Media Records.
