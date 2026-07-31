# `as_of` — definition, and the placement audit of all 505 claims

Stage P1, 2026-07-31. Internal working document, exempt from the readability gate (same
convention as `BUILD-PLAN.md`).

Dataset: `p2-ad-market/data/verification/asof-audit.json`
Rebuild: `python3 p2-ad-market/research/notes/build_asof_audit.py` (deterministic; reproduces
the file byte-for-byte from `claims.json` alone)

---

## 1. The decision

**`as_of` means the provenance date: when the governing source published, filed, or was
retrieved. It never appears on an axis.**

**A new field `about_year` — one integer, required on every claim — means the calendar year
the fact is about. A chart reads `about_year` and only `about_year`.**

Two supporting fields come with it:

| field | type | what it is for |
|---|---|---|
| `about_year` | int, required | the single year a chart plots the claim at |
| `about_span` | `[start, end]` or null | the range the fact covers, where it covers more than one year (a season, a cycle, a growth interval, an era-typical practice). 177 claims need one. The chart draws a band and anchors the point at `about_year`. |
| `timeline_ready` | bool | whether `about_year` was read from evidence rather than assumed. `false` means the claim may not be drawn at all until someone reads a source. 7 claims. |
| `as_of` | ISO date, unchanged | provenance only. Tooltip and provenance panel. Never an axis, never a filter that pretends to be time. |

### Why this way round

The deciding question was which meaning the experience needs. The experience needs the fact
year — so the fact year gets a field of its own rather than a contested one. Five reasons
this beats the alternative (define `as_of` as the fact year, move provenance elsewhere):

1. **`as_of` cannot be the fact year, because 160 of its values are dates, not years.**
   `2024-08-05` is the filing date of a court opinion. `1971-09-13` is a magazine issue date.
   A field that can hold a day is describing a document, not a year in economic history.

2. **Provenance is identity in this dataset, not decoration.** Compilers revise.
   `e4-scale-006` is a single 1990 total printed as $129,590M in a 2001 edition and $129,968M
   in a 2009 workbook. Only the source date tells the two apart. Collapse `as_of` into the
   fact year and the record loses the ability to distinguish vintages — the ability the whole
   project rests on (`FREEZE.md`: "any US ad-spend number must name its rail").

3. **The frozen layer already implements the split.** `adspend.json` carries `year` for the
   fact and `calibration.as_of` for the vintage across 1,573 points. 1,568 have a source date
   strictly after the fact year; **none** has one before. `claims.json` is the only file that
   conflates them. `about_year` is simply claims.json getting adspend.json's `year`.

4. **The costs are asymmetric.** Provenance-as-`as_of` leaves every existing value legal as
   data (a bare year is a coarse vintage), needs no number changed, and puts the timeline work
   in a new field. Fact-year-as-`as_of` would require overwriting 160 dated values and would
   destroy the only provenance the claims carry.

5. **The brief forbids renaming `as_of`**, and 505 claims, the era files, the verdict ledger
   and `tools/verify_p2.py` all key on it.

### The honest cost of choosing this way

Under this definition, **338 of 505 `as_of` values are legacy fact-years sitting in a
provenance field**. They are not lies; they are undocumented. Once `as_of` is off every axis
they are also harmless. Re-stamping them with real publication dates needs one source read per
claim and is scheduled as a **separate, non-blocking pass** — it changes no chart and no
number. This is the sense in which the ambiguity reaches further than the 58 claims the brief
names, and `BUILD-PLAN.md` lists that as a re-plan trigger. It is a scope finding, not a
blocker: the blocking work is `about_year`, and that is done.

---

## 2. Inventory — the five claim populations

No candidate series were supplied; the population is the frozen claim file. Roles assigned
here: every population is **stitch** (all 505 get `about_year`); `REPAIR-R3b.md`,
`adspend.json` and `tools/verify_p2.py` are **cross-check-only** and are never edited.

| population | file | claims | which meaning it used | where it lives |
|---|---|---|---|---|
| eras 1–6 | `data/eras/era-1..6.json` | 380 | meaning (a), fact year — except where the evidence was a dated document | in repo, free |
| era 7 | `data/eras/era-7.json` | 67 | meaning (b), report date, as the default | in repo; several sources are live reports (IAB/PwC free, MAGNA press-reported only) |
| mechanism | `data/mechanism.json` | 45 | meaning (b), court-document date | in repo; the Mehta opinion is public |
| dataset claims | `data/adspend.json` → `claims` | 13 | meaning (b), compiler vintage | in repo |
| **total** | | **505** | | |

Access state worth recording: the era-7 pools lean on **MAGNA**, which is licensed and was
read only through press reporting, and on **WARC/Ebiquity** surveys, likewise. Nothing in this
audit re-reads them — the audit works on the claim text, not on the underlying sources. Any
claim marked `needs-source-read` that points at a licensed source will stay unread until
someone buys access; none of the six do, which is luck rather than design.

---

## 3. Method

`about_year` is derived by a rule ladder, not by eyeballing. Every claim records the rule that
placed it, the years found in its statement, unit, method and source names, and a confidence.

| rule | claims | what it does |
|---|---|---|
| R0-adjudicated | 50 | hand-decided; each carries its reason in the claim's `note` |
| R1-central-is-the-year | 13 | the unit says the quantity *is* a year ("year the IAB guidelines were released"); `about_year` = `central` |
| R2-unit-single-year | 190 | the unit label carries one year, and the unit is written to describe the central. The strongest signal in the file |
| R3-unit-span | 23 | the unit carries two or more years → span; the point sits at the compiler's endpoint |
| R5-statement-single-year | 106 | one year token in the statement, decade tokens excluded |
| R6-nearest-to-central | 68 | several years; take the one adjacent to the token that renders the central value. Margin recorded; under 8 characters drops to medium confidence |
| R7-era-phrase | 4 | "at the end of the era" resolves against the era's declared window |
| R8-first-year-in-statement | 31 | no central token located; these statements lead with the measured year |
| R9-no-content-year | 20 | nothing in statement, unit or method. Dated `as_of` → read the source. Bare `as_of` → era-typical fact, no single year exists |

Two extraction details that changed answers, both worth keeping:

- **Decade tokens are not years.** "the 1970s" must not resolve to 1970. Stripping them fixed
  `e3-pricing-007` (1979–80 season) and `e2-creators-004` ("end of the 1920s").
- **`FY1993`, `1988-89`, `1934-35` are years.** A word-boundary scan misses all three. This is
  why the naive test in the brief reports 58 claims and the audit reports a different set.
  Range expansion is capped at ten years so that "$2,306 million in 1975 - 43.8%" does not
  silently produce a year 1943.

---

## 4. Findings

| classification | claims | meaning |
|---|---|---|
| already-correct | 407 | the content reading and the compiler's `as_of` year agree |
| fixable-from-content | 59 | wrong placement, fixable from the claim's own statement, unit, method or a sibling claim on the same source |
| ambiguous | 33 | genuinely more than one defensible year: era-typical practices, contested dates, spans. Each gets a stated tiebreak and an `about_span` |
| needs-source-read | 6 | no year anywhere in the claim's own content and the source is a compilation, not the producer of the measurement. **Not plottable until read** |

**60 claims move.** Distribution: era 7 (30), dataset claims (12), mechanism (7), era 4 (6),
era 6 (2), eras 1/3/5 (1 each). The largest misplacements a chart would make today:

| claim | `as_of` | `about_year` | years off |
|---|---|---|---|
| `ds-gdp-001` | 2008-09-14 | 1922 | **86** |
| `ds-bridge-002` | 2020-12-01 | 1980 | 40 |
| `ds-seam-002` | 2026-04-01 | 2007 | 19 |
| `e7-scale-004` | 2026-04 | 2008 | 18 |
| `e7-events-002` | 2026-04 | 2009 | 17 |
| `ds-gap-001` | 2026-06-30 | 2011 | 15 |

The brief's own set of 58 splits exactly as it predicted: **42 fixable, 11 already correct
under meaning (b), 4 ambiguous, 1 needing a source read.** 45 of the 58 move.

**The brief's test also misses 15 claims that do move.** They are invisible to a
statement-only scan because the misplacing year *is* in the statement, just not as the
measured year: `e1-scale-010`, `e3-sellers-005`, `e4-medium-002`, `e4-measurement-002`,
`e4-measurement-003`, `e5-pricing-008`, `e6-sellers-004`, `e6-pricing-003`, `e7-creators-003`,
`e7-pricing-002`, `e7-pricing-006`, `e7-measurement-002`, `ds-total-002`,
`mech-format_pricing-001`, `mech-tac-003`.

---

## 5. The seams, as data

`concordance` in the dataset holds five entries. Summary:

| break | claims | how many are misplaced | median | worst |
|---|---|---|---|---|
| eras 1–6, bare-year `as_of` — meaning (a) | 317 | 6 | 1 yr | 6 yrs |
| eras 1–6, dated `as_of` — meaning (b) crept in | 63 | 5 | 1 yr | 2 yrs |
| era 7 — meaning (b) as the default | 67 | 30 | 1 yr | 18 yrs |
| mechanism — the court-document date | 45 | 7 | 4 yrs | 7 yrs |
| dataset claims — the compiler vintage | 13 | 12 | 11 yrs | 86 yrs |

The shape of the problem: the convention flipped **by research stage**, not by claim type. The
era researchers stamped the fact year; the era-7, mechanism and dataset stages stamped the
document. Seventeen era-7 claims share `as_of` 2026-04 — the IAB/PwC Full-Year 2025
publication — while their facts spread from 2008 to 2025.

---

## 6. Cross-checks, and the two flags

| check | independent source | result |
|---|---|---|
| cc-01 | `REPAIR-R3b.md` §11, a different agent using a different method (unit label + era window) | **FLAG.** They found 51; the audit finds 60. 17.6% divergence, over the 15% default tolerance |
| cc-02 | the brief's own count of 58 | reproduced exactly, 58/58 |
| cc-03 | the declared year windows in `era-N.json` | 10 claims land outside their own era. R3b listed nine by hand and this audit reproduces all nine from claim text alone; the tenth is `e4-targeting-001`, moved to 1974 by adjudication |
| cc-04 | `adspend.json`, 1,573 points built by a different stage | 1,568 have `as_of` after the fact year, 0 before. The split already exists in the frozen layer |
| cc-05 | `tools/verify_p2.py`, the frozen verifier | **FLAG.** Check `r2-rdy-01` parses claim `as_of` as a fact year and reconciles it against adspend totals; check `r2-rdy-02` tests point `as_of` against the freeze date. Both meanings are already load-bearing in code, in one file |

**cc-01's flag is the finding, not a fault.** The prior sweep's test was blind to claims whose
unit carries no year. It was also blind to a third case: an `as_of` that names neither the fact
nor the publication. `e7-measurement-002` is stamped 2023-04, the month Nielsen's accreditation
was *reinstated*, for a $468M loss measured over 2021–22.

**cc-05's flag is a build blocker.** When this proposal is applied, `r2-rdy-01` must be
repointed at `about_year` or it will silently stop comparing anything and still report PASS.

No cross-check found a claim whose `as_of` predates its own `about_year` — a source that
published before the fact it reports. Zero of 505. That is the one thing the old convention
never got wrong.

---

## 7. Judgment calls

- **Era-typical facts keep the compiler's year and gain a span.** A 1940 CBS rate card or a
  15% commission "throughout the era" has no single measurement year. Rather than delete the
  placement, these get `about_year` = the compiler's year, `about_span` = the era window, and
  `basis: compiler-assumed`. 53 claims. A chart should draw them as bands.
- **Season and cycle years resolve to the closing year.** 1988-89 → 1989; the 2023-24 political
  cycle → 2024. The span carries the rest.
- **Growth statements sit at their terminal value.** "grew from $4,786M in 1976 to $27,266M in
  1993" is a 1993 point with a 1976–1993 span, because the central is the 1993 number.
- **Contested dates keep the record's own preferred reading and span the dispute.**
  `e1-creators-001` (Palmer 1840/1841/1842) stays at 1841. `e4-targeting-001` moves to 1974 to
  agree with `e4-targeting-002`, which the record already settles on Griffith's dating.
- **Sibling claims are content.** `e4-measurement-002` and `-003` carry no year, but they are
  the same people-meter switchover as `e4-measurement-001`, from the same 6 January 1988
  article, which the record dates to September 1987. Fixed from content, not from a source read.
- **Two claims are about documents, not about the market.** `mech-knobs-001` counts the pricing
  knobs the Mehta opinion names — the opinion's year *is* the fact year, the one legitimate
  place the two meanings coincide. `ds-provenance-001` describes this dataset's own provenance
  coverage; it is marked not timeline-ready because it must never sit on a history axis.
- **"Somewhere in the era" is not a span.** Where a claim needs a source read, `about_span` is
  left null rather than filled with a 19-year era band. Ignorance is carried by
  `timeline_ready: false`, not disguised as a range.

---

## 8. Dead ends and open items

**Six claims need a source read before they can be plotted** (`timeline_ready: false`):

| claim | what has to be read |
|---|---|
| `e1-sellers-005` | Encyclopedia.com's Munsey's entry: which year the $25,000–35,000 per issue applies to. The statement dates only the 1893 price cut |
| `e7-pricing-003`, `mech-tuning-001` | the trial record: which quarters Google's auction "tunings" were applied in. 2023-09-18 is only the date Dischler testified |
| `e7-measurement-003` | Imperva's Bad Bot Report: which traffic year the >50% share measures |
| `mech-mehta-001`, `mech-mehta-004` | the findings of fact: which years the query-share and price-test findings measure. August 2024 is the opinion's date |

`ds-provenance-001` is a seventh not-plottable claim, but by nature rather than ignorance.

**Four `as_of` values are unexplained.** They are not the fact year. They are not a date. They
match no year in any cited source. The four: `e1-scale-010` (1935, but Galbi's sheet is named
"estimates 1900-34"); `e4-medium-002` (1993 for a 1992 crossover the unit itself names);
`e7-medium-006` (2025 for a 2024 figure); `e7-targeting-002` (2025 for a mid-2022 rate). Each
needs one source read to become a real publication date. None blocks a chart.

**A defect found outside this audit's remit.** `e7-measurement-003`'s unit label says
"percent of global web traffic that is bot traffic, **2026**". Nothing supports 2026: the source
is IAB/PwC Full-Year 2025 citing Imperva's 2025 report, whose window is 2024 traffic. Logged in
`open_items`; not fixed here, because fixing unit labels is not this stage's job.

**Not attempted.** No `as_of` value was changed. The audit proposes an action per claim
(`keep` 163, `keep-flagged` 338, `read-source` 4) and stops there, because re-stamping
provenance needs source reads and changes nothing a reader sees.

---

## 9. What the applier does

1. Add `about_year` (int, required) to all 505 claims in `claims.json`, from
   `asof-audit.json → claims[].proposed.about_year`.
2. Add `about_span` where non-null (177 claims) and `timeline_ready` where false (7 claims).
3. Leave every `as_of` value untouched. Record the definition in `PLAN.md`'s rigor spec and in
   `FREEZE.md`: *`as_of` is provenance and never an axis; `about_year` is the fact year and the
   only field a chart may read.*
4. Mirror the same three fields into `data/eras/era-1..7.json` and `data/mechanism.json`, whose
   claim objects are the same records.
5. Repoint `tools/verify_p2.py` check `r2-rdy-01` from `as_of` to `about_year`.
6. Add the gate check: **every claim with `timeline_ready: true` has exactly one integer
   `about_year`, and no chart module reads `as_of`.** The audit's own `verification` block
   already runs the first half and passes 505/505.

Supersession follows the R2b/R3b pattern: the R3 and R3b records stay as written; this stage is
additive, and the four claims whose `as_of` is unexplained are annotated rather than rewritten.
