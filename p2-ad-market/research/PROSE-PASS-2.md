# Prose pass 2

Date: 2026-07-31. Scope: the ten chapters in `p2-ad-market/research/`, plus one
new gate in `tools/verify_p2.py`.

Pass 1 applied the 280-item fix list in `PROSE-FIXES.md`. This pass fixed what
pass 1 left, and closed the hole that let a wrong mechanism description ship.

## The error that started it

Chapter 07 described the auction's pricing rule wrongly. The table under it was
right. A reader who followed the stated rule and did the sums by hand got
$100.50 where the table said $52.58.

The old sentence read: "Both rules charge the same generous way, one cent above
the next ad, so only the ranking changes." That is true of bid-only ranking. It
is false of bid-times-click-rate ranking, where the winner pays the next ad's
score divided by its own click rate, plus a cent. Charging Cedar one cent above
Brindle's $2.00 bid gives 50 clicks at $2.01, or $100.50. Charging it one cent
above the bid that would have matched Brindle's score gives 50 clicks at $0.81,
or $40.50, and $52.58 in all.

Every gate passed. `r4-arithmetic` had checked all 209 stored steps in
`mechanism.json` and found them sound. `r5-traceability` had confirmed the
chapter cites real claims. `r5-chapter-stale` had confirmed no superseded value
was quoted. Nothing compared the chapter's own description against the mechanism
it described. A human reading as a reader found it.

## What the three workers fixed

Nine of the ten chapters changed. Chapter 03 did not. The three streams below are
read off the diff.

**1. The mechanism itself (chapter 07).** The bad sentence is gone. In its place
the chapter states the rule once, then shows its working. Brindle's $2.00 bid
times its 2% click rate is 0.040. That 0.040 divided by Cedar's 5% is $0.80.
Cedar pays a cent more, $0.81. The same two steps run for Brindle's own price,
$1.51. Then the click counts, then the two totals. Every intermediate is now on
the page, which is what makes the rest of this document possible.

**2. Naming the counters at first use.** Seven acronyms went in bare and now say
what the body is and who pays it: IAB, MAGNA, EMARKETER, WPP Media, BIA, ANA and
PwC. The point is not politeness. MAGNA forecasts from inside an agency group
that buys media, so the buyers pay that counter. The IAB is the sellers' trade
body, and PwC is the accounting firm it hires to check the returns, which is what
makes that series audited rather than self-reported. A reader who does not know
who pays cannot weigh the disagreement between two counters. The glossary rows in
`PROSE-FIXES.md` are marked APPLIED 2026-07-31.

**3. One owner per repeated correction, and a stated basis for every
comparison.** Five corrections were being re-argued in three or four chapters
each. Each now has one owning chapter and the rest point to it: radio's rank and
the Wanamaker quote to chapter 3, the people meter to chapter 5, the Yellow Pages
seam to chapter 6, the EMARKETER-against-MAGNA rail to chapter 8. The same pass
made cross-year comparisons state their basis. Chapter 9 dropped its
four-readings table and instead prints two rows for the year 2000, one marked
**do not compare with 2025** and one marked **matches the 2025 row**. Chapter 8
now stops on the collision between Google's $294,691M of worldwide ad revenue and
the $294,593M of US internet ad revenue near it, and says the near-match is a
coincidence. Chapter 2 sources its $700 million channel count with a new
footnote. Chapter 4 spells out that national money is brand plus direct response
on that series. Chapter 5 names the three published versions of the 2000 GDP
share instead of gesturing at a gap.

## The new check: `r5-worked-examples`

Registered in `tools/verify_p2.py` and in the R5 contract as invariant
`r5-val-06`.

For every chapter that cites a `mech-*` claim, it finds the worked-example blocks
and re-derives every figure in them from `mechanism.json`.

**How it decides what to check.** Scope never depends on a number matching, or a
corrupted figure could delete its own check. A block is seeded two ways only. The
first is an invented cast name: a name that appears in a mechanism example's
setup and nowhere in the real-claim corpus (Aster, Brindle, Cedar, Vale, Wren,
Yarrow, Delta, Ember, Fern) marks the paragraph that names it as illustration.
The second is the chapter's own forward-pointing declaration that a case is
invented, made up or illustrative. A declared worked example that no mechanism
example backs is itself a violation, which is what stops a new unbacked example
from entering unchecked.

**How it re-derives.** It evaluates the example's stored expressions here rather
than trusting the stored `expected`, and it walks each expression's
sub-expressions too. `mechanism.json` stores `0.04/0.05+0.01` as one step worth
$0.81. The chapter shows $0.80 on the way there. Only the AST walk reaches that
intermediate, so prose that shows its working is checked rather than exempt.

**How strict it is.** Every figure in a block, table cell or sentence, must
re-compute from the bound example at the precision the chapter printed. "$0.91"
claims two decimals, so any stored value within 0.005 satisfies it and $0.93 does
not. A figure that exists somewhere else in `mechanism.json`, but not in the
bound example, is still a violation. It gets its own message. 0.85 is a real
number in that file, the AOL revenue share, and it must not launder a wrong price
in an auction example.

### Coverage

| Measure | Count |
|---|---|
| Chapters citing a `mech-*` claim | 5 (01, 06, 07, 08, 10) |
| Worked-example blocks found | 5, all in chapter 07 |
| Mechanism examples bound | 6 of 20 |
| Figures examined | 92 |
| Of those, printed in tables | 12 |
| Re-computed from the bound example | 92 |
| Unaccounted for | 0 |

The six bound examples are `ex-1-quality-vs-pure-bid`,
`break-1-ctr-misestimation`, `ex-2-gsp-not-truthful`,
`ex-3-gsp-equilibrium-band`, `break-2-reserve-is-a-posted-price` and `X8`.

Chapters 01, 06, 08 and 10 contribute no blocks. That is correct, not a miss:
their tables are claim inventories and era series, not worked figures, and
nothing in them is derived from a mechanism example. The check prints this count
on every run, and fails if it ever reaches zero blocks or zero table figures.

### Non-vacuity proof

The repo was copied to a temporary directory eight times and corrupted once each.
Every corruption was caught. Baseline exits 0.

| # | Corruption | Result |
|---|---|---|
| 1 | table money collected $52.58 to $100.50, the figure the wrong rule implies | caught, exit 1 |
| 2 | table clicks delivered 58 to 62 | caught, exit 1 |
| 3 | table average price $0.91 to $0.93, two cents off | caught, exit 1 |
| 4 | prose intermediate, Cedar pays $0.81 to $0.85 | caught, exit 1 |
| 5 | prose setup, second slot 40% to 45% | caught, exit 1 |
| 6 | a new declared worked example with no mechanism example behind it | caught, exit 1 |
| 7 | `mechanism.json` loses the backing example, chapter untouched | caught, 23 violations |
| 8 | the worked example is deleted from the chapter | caught by the vacuity guard |

Case 4 is the one that matters most for design. $0.85 does appear in
`mechanism.json`, as the AOL revenue share. An earlier draft of this check let
that pass. It does not now.

Case 8 confirms the guard against the check's own worst failure: examining
nothing and passing everything. The script is at
`tools/verify_p2.py r5-worked-examples`; the corruption harness was run from a
scratch directory and is not kept in the repo.

## What the check cannot cover

Be blunt about this. **The check does not read prose.** It cannot tell whether a
sentence describes a mechanism correctly. The original error is the exact shape
it is blind to: a rule stated in words, with no numbers in the sentence, sitting
next to a correct table.

What changed is the cost of making that error again. A rule stated with its
working now has every intermediate checked. Any attempt to make the table agree
with a wrong rule fails at once. The error can only survive now if the writer
states the rule wrongly **and** prints no arithmetic for it. That is a narrower
hole than before, and it is a hole a human reviewer can be pointed at.

Four more limits, stated plainly:

- **Block edges are conservative.** A block stops at the last paragraph that is
  arithmetically of a piece with the example. Chapter 07's "87% more money and
  42% less per click" sits under the next heading and is not checked, though both
  numbers do follow from the table.
- **Only chapter 07 has worked examples today.** The check would examine blocks
  in any chapter, but four of the five mech-citing chapters contribute nothing.
  Coverage will stay low until more chapters work an example.
- **Fourteen of the twenty mechanism examples are never printed in a chapter.**
  Their arithmetic is proven by `r4-arithmetic` but no chapter is tested against
  them.
- **A wrong number that the same example also computes would pass.** If a chapter
  printed $1.51 where $0.81 belonged, both are ex-1 values and the check is
  silent. Nothing deterministic can see that without a cell-by-cell map of the
  table to the example's steps, which no artifact carries.

## What remains open

1. **Prose-versus-mechanism stays a judgment check.** `r5-val-03` in the R5
   contract is the judgment invariant that owns it. This pass proves it needs a
   human who does the arithmetic by hand, not a reader who checks that the
   numbers are cited.
2. **No cell-to-step map.** If `mechanism.json` examples carried a label per
   step, a chapter table could be bound cell by cell, and limit four above would
   close. That is a data-layer change and the data layer is frozen.
3. **Frontmatter formats disagree.** Chapters 03 and 08 record readability as a
   YAML map; the other eight record a quoted string. Chapter 08 also calls the
   metric `flesch_kincaid` where the rest call it `fk_grade`. All ten scores are
   current and all ten pass. Nothing reads the field yet, so this is untidiness,
   not a defect.
4. **The remaining `PROSE-FIXES.md` items.** This pass applied the acronym rows
   and the repetition items. The file records what has been applied and when; the
   rest is still a list.

## Gate results, 2026-07-31

All 22 checks in `tools/verify_p2.py` pass, with zero violations:

    r1-records r1-claims r1-hygiene
    r2-series r2-concordance r2-checks r2-reconcile r2-freeze
    r3-coverage r3-verdicts r3-applied
    r4-coverage r4-arithmetic r4-claims r4-simparams
    r5-files r5-traceability r5-claimsfile r5-stale-prose r5-chapter-stale
    r5-worked-examples
    p1-timeline

All ten chapters pass all four reading tests:

| Chapter | FK grade | Reading ease | Fog | SMOG |
|---|---|---|---|---|
| 01 thesis | 6.10 | 76.08 | 8.18 | 8.58 |
| 02 the middlemen | 7.11 | 65.92 | 9.55 | 9.94 |
| 03 sponsorship | 7.04 | 70.62 | 9.41 | 9.65 |
| 04 the spot market | 6.23 | 72.84 | 8.73 | 9.29 |
| 05 segmentation | 7.18 | 70.59 | 9.57 | 9.71 |
| 06 the impression | 6.33 | 69.17 | 9.24 | 9.72 |
| 07 the auction | 6.61 | 72.14 | 8.93 | 9.33 |
| 08 the machine market | 7.29 | 67.17 | 9.84 | 10.11 |
| 09 the capture question | 7.77 | 64.30 | 10.64 | 10.72 |
| 10 verdict and handoff | 6.74 | 71.48 | 8.81 | 9.21 |

Gates: FK grade at most 10, reading ease at least 50, Fog at most 12, SMOG at
most 12. Every chapter's frontmatter carries its current scores.
