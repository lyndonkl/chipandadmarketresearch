# `docs/p2/toll/` — the seven toll plates

Team B6. Direction: **The Bench** (`p2-ad-market/design/DESIGN.md`, locked 2026-07-31). The form is
`OPEN-PROBLEMS.md` problem 2, **option 2C — the Toll Plate**, chosen over the Fitting Bench (2A)
and the Base Plate and Rack (2B). Light mode only.

Thirteen small self-contained drawings across seven framed plates. In every one a brass bar enters
from the left and something leaves it. A valve diverts a rust slice down into a cup, or a ruled duct
carries money on to somebody else, or brass at the far end counts what arrived. The bar is always the
whole of that era's own starting amount — **and no two of those amounts are the same thing, so no two
bars are drawn the same size.**

**Every drawing on this page is at its own scale. That is the repair this round is named after, and
it is what the whole object is for.** One point of a share is worth between 1.68 and 4.68 pixels
depending on which base you are looking at. Inside one drawing the slice is a true share of its own
bar; across two drawings a length means nothing at all, and the page says so on every plate.

Plain ES modules. No build step, no bundler, no third-party dependency, no network request beyond
the frozen JSON the page reads from this repository.

| File | What it is |
|---|---|
| `toll-records.js` | **The selection.** Which claim is each era's toll, what it is a share of, who produced the figure, and a written reason for every one of those. Holds no number — **and, since this round, no direction either**: whether a share was kept or handed on is derived from the record, in `directionFromRecord`. |
| `toll-plan.js` | Seven era records in, one **sealed** plate set out. Every guard runs here. The record is stripped here. No DOM. |
| `toll-plate.js` | The renderer. Takes a sealed plate set and draws all seven plates, or throws. |
| `toll.css` | Page furniture. Restates no token value; the two rules needing a token at low alpha go through `color-mix()` on the custom property. |
| `toll-plate.demo.html` | The seven plates against the real frozen record, with a button that prints every string on the page and a button that runs the prose lint over them. |
| `toll.test.js` · `toll.test.html` | The bench. **The page prints its own tally; trust that over any number written here.** At the last run: 102 cases, 102 pass. |

## Opening the pages

```
cd /path/to/chipandadmarketresearch && python3 -m http.server 8000
```

then

- `http://localhost:8000/docs/p2/toll/toll-plate.demo.html` — the seven plates
- `http://localhost:8000/docs/p2/toll/toll.test.html` — the bench

Browsers refuse ES module imports and `fetch` over `file://`, so both pages say so plainly and stop
rather than half-rendering.

---

# The problem, and what this object does about it

A middleman sits between the advertiser and the place the advertisement appears and keeps a slice.
Every era wrote that slice down as a percentage. **What the percentage was OF changed every time.**
Bars in a row on one ruler would invite a reader to read an early percentage against a late one and
conclude the cut rose. Nothing in the record says that.

Naming the two figures in the sentence that refuses the comparison is most of the way to making it,
so nothing here does. The demo page's opening paragraph used to, while the drawing below rendered
those two figures to scale on identical bars. Both are fixed; see **What was repaired this round**.

Thirteen tolls, thirteen bases, read out of `claims.json`'s own `unit` field:

| Era | Toll | Base, in the record's words | Form |
|---|---|---|---|
| 1 · The Middlemen | `e1-pricing-001` | percent of space price | span-only |
| 1 | `e1-pricing-004` | percent of gross billings taken by the intermediary | point |
| 2 · Sponsorship | `e2-pricing-006` | percent commission Mutual retained on member-station network proceeds after agency commission | point |
| 3 · The Spot Market | `e3-pricing-001` | percent of gross media billings | point |
| 3 | `e3-pricing-003` | percent commission to the station representative firm | span-only |
| 4 · Segmentation | `e4-pricing-001` | percent of media billings | point |
| 5 · The Impression | `e5-pricing-006` | percent of revenue | point |
| 5 | `e5-sellers-004` | percent gross margin on network ad sales | span-only |
| 6 · The Auction | `e6-pricing-003` | % take rate retained by Google on Google Network advertising revenue, 2002 | point |
| 6 | `e6-pricing-004` | % of Google advertising revenue paid out as traffic acquisition cost, 2008 | point |
| 7 · The Machine Market | `e7-pricing-006` | percent of an advertiser dollar retained by Google's ad tech stack | point |
| 7 | `e7-pricing-004` | percent of advertiser programmatic spend reaching the publisher | point |
| 7 | `e7-pricing-005` | cents of each DSP dollar reaching the consumer | point |

`assertBasesDistinct` reads those thirteen strings off the record and throws if two of them ever
coincide. That is the sentence the whole page rests on, checked rather than asserted.

---

# What was repaired this round

The plates exist to prevent a comparison the numbers cannot support. The page drew that comparison to
scale. Six things. The first is the one the object turns on, and the last is this round's.

## 1 · The shared scale is gone

`BAR.width` was 400 in all thirteen drawings and `pxOf` divided by a fixed 100, so **one percentage
point was four pixels on every plate.** Fifteen drew as a 60px block. Thirty-one drew as a 124px
block. Three and a half drew as 14px. Seven bars, one ruler, thirteen readings on it — a chart,
assembled out of uniform parts and let in through the mechanism. The plates sat in different `<svg>`
elements and were indented down the page, and neither of those makes a shared ruler into anything
else.

**There is no bar length in this folder any more. There are thirteen of them, one per base.** A
base's drawn size comes from a digest of the base's own words, through three independent channels —
how long, how thick, where it begins — spread across a band. So:

- the same base always draws the same size, and no two bases ever draw the same size.
- **the size is an identity and not a quantity.** It says which base this is. It measures nothing. It
  is not how much money passes through that base. The record carries no such figure for any of the
  thirteen, and nothing on this page reads a length back.
- one point of a share is worth **1.68 pixels on the shortest base and 4.68 on the longest.** That is
  a spread of nearly three to one.
- **the drawn order is not the recorded order.** On the live record five pairs are drawn the wrong
  way round. That is what it looks like when a length carries no information, and it is the one thing
  a restored shared scale could not produce.

Nothing is lost inside one drawing: the bar is the whole of that base, the painted slice is its true
share of that whole, and the figure is printed in words beside it. What is gone is the free
comparison the eye used to make between two of them. **Every drawing prints `own scale` on itself.**
The whole sentence is in that mark's title, in the row's accessible name, and in the note above all
seven plates.

The derivation reads the base's words and never a claim's value. It is not tuned so that any
particular pair of figures comes out inverted, and it must not be: a length chosen to make a
comparison come out a particular way is a scale again, pointing the other direction.

## 2 · The stagger was on the wrong channel

Every bar was the same length by design. The left edges spread 168px in total, of which 36 came from
the drawing and 132 from a CSS indent on the plate card. **That indent moved the three fixed rows
under each drawing by exactly as much — including the visibility token, which is the one thing on
this page a reader is asked to read straight down.** So the channel that must not be read across
moved by a fraction of a bar, and the channel that must be read down zig-zagged by 168px.

The indent is gone. Every plate sits at one left edge and the token column is measured off the
laid-out page with `getBoundingClientRect`: **0px of drift across all seven plates.** The bars carry
all of the variation now, and the same measurement over the drawn bars finds no two sharing a left
edge, a right edge or a length.

## 3 · Money paid out was drawn as money kept

`e5-pricing-006` (Overture, 56% traffic acquisition cost) and `e6-pricing-004` (Google, 28.1% paid
out) are money the middleman **handed on** to the partners who sent the traffic. Both were drawn with
the take's own apparatus: a rust wedge off the left of the bar, an index on the valve, a pipe down
into a rust pool, and a row of text saying the valve took it. **Drawing money leaving as money taken
inverts the finding**, and it did it on the two largest figures on the page.

A `paid` row now carries **no wedge, no valve and no cup at all** — there is no key on the plan to
draw one from. The share sits at the far end of the bar against the outlet, drawn as brass ruling on
paper: money, on its way out. A pipe carries it off the drawing under the words *handed on, and off
this page*. There is no vessel under that bar, because nothing under it was kept.

That repair was half of one. **Which of the two drawings a row got was still a word in a build file**,
and repair 6 below is what happened when somebody changed it.

## 4 · The span wedge was painted to its high end

`drawWedge` filled the certain part and the uncertain part with the same rust hatch, laid end to end.
A claim reading *somewhere between ten and fifty* therefore drew as a solid fifty per cent take.

The painted block now ends at the part the record is **sure** of. Past it the reading is a thin barred
reach at the middle of the bar with nothing filled between the ends, and a printed label. A block is
an amount; a line between two bars is a reach. On the live record `e1-pricing-001` paints 46.8px of a
234px reach, `e3-pricing-003` paints 13.4px of 53.6px, and `e5-sellers-004` paints 66.78px of 127.2px.
The same repair is applied to a point mark's own 80% interval and to the arrival rows, where the
uncertain stretch used to read as arrived.

## 5 · Every drawn length is now re-derived from its mark

`assertRowShapes` checked which KEYS a row carried and never what the numbers under them were. It
passed a plate whose valve was drawn at the full width of the bar on a mark reading fifteen. **Every
pixel on this page was unverified.**

`assertPixelsMatchMarks` recomputes all of them at mint and on every re-entry — the bar, from the
plan's own base list; `xAtLo`, `xAtHi` and the middle mark, from the row's own minted mark — exactly
the way `assertReadingsMatchMarks` recomputes every printed string. A drawn length is a printed figure
the reader cannot check, and this is the check that reads it.

## 6 · Which way the money went was a word in a build file

**This round's repair, and the attack that forced it.** Repair 3 gave a payout its own drawing. It
then read which drawing to use out of a field called `measures` in `toll-records.js`. Change that one
word from `paid` to `kept` on `e5-pricing-006` and the page drew Overture's 56 per cent traffic
acquisition cost as a rust wedge off the left of the bar. It had a valve on it and a full cup beneath,
under the printed line *This is what the middleman kept.* That money was handed to the partners who
sent the traffic.

**Every guard in the folder stayed green.** `assertRowShapes` passed, because the shape matched the
label. `assertPixelsMatchMarks` did worse than pass. It re-derives each drawn end from that same
field, so it rebuilt every pixel from the left without being asked, then agreed with what it had
built. The seal re-opened. The drawing was internally consistent. It was inverted, on the largest figure on
the page. Drawing money that leaves as money that is taken inverts the finding.

**So there is no label.** `directionFromRecord` reads the direction out of the record:

1. **The unit first.** `claim.unit` names what the share is a share of, and usually names the party
   too. Nine of the thirteen are settled there — *"% take rate **retained by** Google"*, *"% of Google
   advertising revenue **paid out as** traffic acquisition cost"*, *"percent of advertiser
   programmatic spend **reaching** the publisher"*.
2. **Then the head of the statement**, and only when the unit says nothing. The head is everything
   before the first dash, colon, semicolon or full stop. Four are settled there. The cut is at the
   break because what follows is gloss about other parties. Take `e5-pricing-006`. Its statement
   names Overture's cost, then calls the same money *"the take rate of the distribution layer"*.
   That is true of the partner and false of the middleman the plate draws.
3. **And if neither settles it, the row is refused.** Not defaulted to a cut because most of them are
   cuts. `directionFromRecord` throws, and so does a record that says both at once.

`assertTollSelection` refuses a toll carrying any of fifteen names a person might write the label back
in under: `measures`, `direction`, `kept`, `paid`, `arrived`, `cup`, `wedge` and the rest.
`assertDirectionsFromRecord` re-derives all thirteen against the frozen record, at mint and on every
re-entry. It refuses to run at all when it cannot reach `claims.json`. **A relabel cannot flip a cup
into a valve, because there is nothing to relabel.** Moving a drawn direction now means editing what a
claim says about its own money, in a diff a reviewer reads against the record.

Every row prints where its own direction came from, quoting the record. Overture's row reads: *The
plate draws it that way because the record's own statement says "traffic acquisition cost". Nothing
on this page chooses which way a middleman's money went.* The sentence is on the page, in the row's
accessible name, and re-derived by the guard, so it cannot drift away from the drawing above it.

## How each plate names its base

Three times, in three registers, and none of them is a paraphrase of another:

1. **In plain English, directly above the drawing.** One authored sentence per toll — *"Every dollar
   a member station took from Mutual network business, after the agency had already taken its cut."*
   It **may not contain a digit**; `assertTollSelection` refuses one, because a number in the base
   sentence would be a second copy of a number sitting beside the one the mark carries with nothing
   checking that the two agree. All thirteen are distinct, and that is checked too.
2. **Inside the drawing.** A dashed leader runs from the sentence above into the inlet bracket at the
   left end of the bar, labelled `TAKEN OUT OF`. Under the bar, `of what · …` prints the record's own
   `unit` string, cut to what fits by `svg-kit.shortLabel` — which cuts at the record's own
   structural break and never rewrites — with the whole string in the element's `<title>`.
3. **In the fixed row under the drawing**, `OF WHAT`, verbatim, untruncated.

The plate's own accessible name opens with the base sentence, so a screen-reader reader meets the
base before the figure.

## How the plates say the cut got harder to see

The chapter gives up "the cut rose" and "the cut fell". What it gets instead is a picture that
arrives before a word is decoded, and it is built out of the record's own source lists.

**The bottom row of every drawing carries one drawn mark saying WHO PRODUCED THE FIGURE.** Five
forms, at the same place in every plate, and the ink drains out of them as the page goes on:

| Form | Drawn as | What it says |
|---|---|---|
| `posted` | a solid iron square | The trade printed this rate. A reader of the day could look it up. |
| `opened` | a solid square inside an open frame | An outside body opened the books and published this figure. |
| `filed` | an outline, no fill | The seller filed this figure about itself. |
| `ranged` | a dashed outline | The source prints a range and no single figure. |
| `unclosed` | stipple in a dashed iron frame | An outside body tried to trace this money and could not close the account. |

Read down the page, the column runs: **ranged, posted · opened · posted, ranged · opened · filed,
filed · filed, filed · filed, unclosed, unclosed.** Solid ink for four eras, an outline for two, and
a stipple block at the end. That is the finding, drawn.

**It is not an opinion about the era.** It is a claim about the claim's own source list, and it is
checked: every toll names a `sourceKey` that must appear in one of the strings in that claim's
`sources`, and `assertTollSelection` throws when it does not. `Haase 1934`, `FCC`, `Zeigler &
Howard`, `Economic Census`, `Form 10-K`, `ISBA`, `ANA`. A repair that changes a source has to change
the sentence beside it, and until it does, nothing renders. It is the same cross-check
`assertDistinguishable` runs on a declared `redundant` channel and `assertColourBudget` runs on a
declared carrier.

**A `ranged` declaration is checked against G1 rather than against a memory of G1.** It says the
source published a range and no single figure, so the claim must be one the library refuses a middle
value. The converse is deliberately **not** asserted: `e5-sellers-004` is a figure a seller filed
about itself whose interval is wide for an unrelated reason — the filing gives three years on two
treatments — so it is `filed` and span-only at once.

**And the plates say it in words too.** Under the seven plates, a printed finding, with every count
in it derived from the plates rather than typed:

> Read the bottom row of every plate down the page. That row says who produced the figure. Four of
> these cuts were printed by the trade or counted by an outside body. The last of those is on the
> Segmentation plate (1976-1993). After that the figure comes off the seller's own books. At the end
> of the page nobody can produce a figure at all. Two advertiser associations tried to trace the
> money, one in Britain and one in America, and neither could close the account. The cut did not
> clearly rise or fall. It got harder to see.

`buildFinding` throws if any of the three groups it rests on — outside-counted, self-filed,
unclosed — is empty, so the sentence can never be printed about nothing.

## What was done about era 7

`DESIGN.md`: *"Era 7's diagram alone can be misread as exactly the claim the page refuses to make.
It needs its own guard."* Six things, and five of them are structural rather than printed.

1. **No plate anywhere on this page carries a cut for its era.** Not a headline, not a share, not a
   total. `assertNoEraCut` walks the sealed plan and refuses the keys `cut`, `take`, `share`, `rate`,
   `percent`, `headline`, `total`, `sum`, `scale`, `axis` and `domain`. The object "the cut in era 7"
   does not exist, which makes era 7 ordinary rather than a special case with a warning bolted on.
2. **Era 7's plate cannot be drawn alone.** `renderTollPlates` draws all seven or throws, and this
   folder exports no `renderPlate(era)`. A screenshot of the last plate on its own is a thing
   somebody has to crop, not a thing this code will produce.
3. **Two of its three readings physically cannot show a take.** `e7-pricing-004` and `e7-pricing-005`
   count what ARRIVED at the far end, not what anybody took. Those rows carry **no `wedge` key at
   all**. There is no rust in the drawing and nothing to draw it from. The bar reads in three zones.
   Brass at the right is what certainly arrived. An iron-framed region at the left is printed *not
   traced to the far end*. Between them lies the stretch the record does not settle either way,
   barred at both ends and filled with nothing. The complement is not computed, because the record says part
   of it is unseen and invalid inventory rather than any middleman's cut. Every such row prints
   *"This counts what arrived, not what was taken."* and `assertArrivalLinesPrinted` refuses a plan
   where one does not.
4. **One cup on the page cannot be filled shut, and it is on this plate.** The ISBA row's cup is
   drawn with its floor missing and a stipple block in the gap, framed in dashed iron and named
   `NOBODY COULD SAY WHERE THIS WENT`. `assertLastPlateGuard` throws unless there is exactly one such
   cup. It counts; it does not check which plate the cup is on. Pinning it to era 7 happens one
   layer up, in `assertTollSelection` over the toll table, so no plan the planner builds can reach
   the wrong state and a forged plan is refused by the seal first.
5. **That block carries no figure**, and the bench asserts it prints no digit. The share the study
   could not attribute is a number inside the claim's *sentence*, not a value the record measured,
   and `FREEZE.md` is explicit that a secondary number inside a statement is not to be trusted as a
   reading. So the block names the absence and prints nothing.
6. **A printed guard sentence, in the largest type on that plate**, built from the plan rather than
   typed — it counts its own arrival rows and names the first era from the record:

   > Do not read this plate against the first one. Two of these figures count what reached the far
   > end, not what anybody took, and what fails to arrive is not all middleman cut. None of them is a
   > share of the advertiser's dollar measured the way the first plate on this page, The Middlemen,
   > measures it.

   `assertLastPlateGuard` throws if the guard is missing, and throws again if it has been copied onto
   every plate — a warning printed seven times is a warning nobody reads.

Era 7's own relation is `rival`: three attempts at one question, three answers, three bases, and
they do not reconcile. It is the only rival plate on the page and `assertTollSelection` refuses a
second one.

---

# What is guaranteed and what is advice

Same two words the library, the chart layer and the era machines use, used the same way.
**GUARANTEE** refuses a shape or checks a bounded finite record, and throws. **ADVICE** finds some of
what is wrong and never claims to find all of it.

| The rule | Which | What is covered, and what is not |
|---|---|---|
| **No plate names a cut for its era** `assertNoEraCut` | **GUARANTEE** | Covered: the whole sealed plan is walked and eleven key names are refused anywhere on it, minted marks excepted. There is no per-era figure to read, for any era. Not covered: the walk is over key **names**. A field called `bite` holding the same number would pass. What it buys is that the natural name for the forbidden object is unavailable, and an unnatural one is a line a reviewer reads. |
| **No two drawings share a ruler** `assertNoSharedRuler` | **GUARANTEE** | Covered: thirteen bars, pairwise, on three channels — length, origin and right-hand edge — and "the same" is four pixels rather than zero, because two edges a pixel apart are one edge to a reader. The longest bar must be at least twice the shortest, so a page drifting back towards one length is refused before it arrives. **And the drawn order must not be the recorded order**: somewhere on the page a larger figure must draw shorter than a smaller one, which is the one thing a restored shared scale could not produce. Five such pairs exist on the live record. **This row replaces one that read "no two plates line up", which passed on a page where every bar was 400 long and one point was four pixels everywhere.** Not covered: a reader with a ruler can still recover a share from one drawing, which is what a drawing of a share is. |
| **Every drawn length re-derives from its own mark** `assertPixelsMatchMarks` | **GUARANTEE** | Covered: the bar (from the plan's own base list through `baseGeometry`) and `xAtLo`, `xAtHi` and the middle mark (from the row's own minted mark through `pxOf`, measured from the end the row's measure names) are recomputed and compared at mint and on every re-entry, plus the cup's own origin. A share reading over 100 of its base throws rather than drawing past its bar. **This is new. `assertRowShapes` read which keys a row carried and never what the numbers under them were, so it passed a valve drawn at the full width of the bar on a mark reading fifteen.** Not covered: what the renderer does with a correct pixel. The bench measures the drawn SVG separately. |
| **Thirteen tolls, thirteen bases** `assertBasesDistinct` · `assertTollSelection` | **GUARANTEE** | Covered: the `unit` strings are read off the claims file **the caller supplies**, and checked pairwise against each other. An empty base list throws rather than passing. Not covered: two bases can be *different strings for the same thing* — nothing here reads English. **Also not covered: the caller's copy is trusted.** Only the money's *direction* is re-derived against the frozen registry (`assertDirectionsFromRecord`). A doctored claims file can rewrite a base, narrow an interval, or move a central, and every other guard stays green because they all check the caller's copies against each other. |
| **A base sentence carries no figure** inside `assertTollSelection` | **GUARANTEE** | Covered: any digit in an authored base sentence is refused, and all thirteen must be distinct. Not covered: a number spelled as a word. `assertTollSelection` does not read prose. |
| **Every claim on the page is one the record holds, and both copies agree** `claimFor` · `assertCopiesAgree` | **GUARANTEE** | Covered: structure from `eras/era-N.json`, claim from `claims.json` (the only copy carrying `verdict`), and a disagreement on `central` or `ci80` throws. A toll naming a claim the era file does not hold throws rather than falling back. Not covered: a claim whose *statement* drifted. The check is on the numbers a mark is built from. |
| **Who produced the figure is checked against the record** `assertTollSelection` | **GUARANTEE, OF THE SOURCE STRING** | Covered: every toll's `sourceKey` must appear inside one of that claim's own `sources[].name`, so a repair that changes the source stops the page. `ranged` is checked against `guards.markKindFor`. Not covered: **the class itself is an editorial judgement about a source the guard can only prove exists.** "The Economic Census counted this" is a sentence about what a census is. The guard proves the census is on the claim; it cannot prove the sentence is a fair reading of it. |
| **A unit that is not a share is refused** `assertShareUnit` | **GUARANTEE** | Covered: every toll's unit must say percent, `%`, or cents of a dollar. `USD per agate line` throws. This is what stands between the drawing and a record repair that changes a unit — without it, two dollars would be drawn as two percent of a bar. Not covered: a unit that says "percent" and means something else. |
| **A span-only row has no valve and no level** `assertRowShapes` | **GUARANTEE** | Covered: the middle mark — `valveX` on a cut, `divideX` on a handover, `edgeX` on an arrival — is assigned only where `mark.kind === 'point'`, so the renderer's one branch that places one cannot be reached from a span-only row. Re-checked at mint and on every re-entry. Not covered: a caller who builds row objects by hand and calls `svg-kit` directly. That is a rewrite, in a diff a reviewer reads. |
| **The uncertain part of a reading is not painted** `drawWedge` · `drawReach`, measured by the bench | **GUARANTEE, OFF THE DOM** | Covered: the painted block ends at the part the record is sure of, and the bench reads the drawn `width` attribute back and compares it against the row's own low end — then fails if it reaches the high end. **This is a repair.** The certain part and the uncertain part were filled with the same rust hatch, laid end to end, so a claim reading *somewhere between ten and fifty* drew as a solid fifty. Not covered: the reach is drawn as a line with two bars and a label. Nothing measures whether a reader reads it as uncertainty. |
| **One measure, one drawn shape** `assertRowShapes` · `assertLastPlateGuard` | **GUARANTEE** | Covered: three measures, three part keys — `wedge`, `handover`, `arrival` — and a row carries exactly the one its measure names, checked over the whole vocabulary rather than as hand-written pairs, at mint and on re-entry. A row counting an arrival has no wedge and the bench scans its drawn SVG for **any rust stroke or fill at all**. **A row that handed its money on has no wedge, no valve and no cup**, and its drawing is scanned the same way. Not covered: what the renderer does with a correct part key. The bench scans the drawn SVG separately. **The row this replaces said the classification `kept` / `paid` / `arrived` was read from this folder's table rather than from the record. It was, and that was the hole — see the next row.** |
| **Which way the money went is not a field anybody sets** `directionFromRecord` · `assertTollSelection` · `assertDirectionsFromRecord` | **GUARANTEE** | Covered: there is no direction label on any toll, and `assertTollSelection` refuses fifteen names one could be written back in under. The direction is derived from the claim's own `unit`, and from the head of its `statement` when the unit says nothing — nine of the thirteen off the unit, four off the head. `assertDirectionsFromRecord` re-derives all thirteen against the frozen record at mint and on every re-entry, checks the printed words and the printed grounding sentence with them, and **throws rather than skipping when it cannot reach `claims.json`**. A record that names two directions at once, or none, is refused rather than drawn one of the two ways. **This is new, and it is the attack that forced it: `measures: 'paid'` changed to `'kept'` drew Overture's 56% payout as a rust wedge with a valve and a full cup, and `assertRowShapes`, `assertPixelsMatchMarks` and the seal were all green on it, because all three read the label.** Not covered: **the derivation matches phrases from a frozen list of English.** See the eight documented limits below. |
| **The cup carries no quantity, and a payout has no cup** `assertRowShapes` · `cupHolds` | **GUARANTEE** | Covered: no `fillTop`, `bandTop`, `bandBottom` or `level` may exist on any cup, every pool is the same depth on every plate, and `cupHolds` is one function read by the planner and by the guard so the two cannot answer it differently. **Two repairs.** The cup used to fill to a level derived from the mark — cups of one size at one place under seven bars, with seven levels in them, is the seven-bar chart turned on its side and let in through the mechanism. And a `paid` row used to get a cup with a rust pool in it, which said the middleman was holding money the record says he handed on. Not covered: nothing stops a future renderer scaling a pool itself. |
| **The last plate's guard** `assertLastPlateGuard` | **GUARANTEE** | Covered: exactly one open cup on the page (counted by `assertLastPlateGuard`); that it sits on era 7 is pinned by `assertTollSelection`, not by the plan-level guard; the guard sentence present on that plate and on no other; exactly one cup on the page that cannot be filled shut; at least two arrival readings, none carrying a wedge. Not covered: **that a reader reads the sentence.** It is prose in the largest type on the plate. |
| **Every printed string is re-derived from its own mark** `assertReadingsMatchMarks` (from `../eras/era-plan.js`) | **GUARANTEE** | Covered: `id`, `year`, `verdict`, `form`, `short`, `reading`, `figure` and `title` on every row are re-derived from the row's own minted mark at mint and on every re-entry. A figure hand-typed into `short` on a plan of otherwise real marks is the one forgery every other check waves through, and this is what catches it. Not covered: a renderer that computes `(lo + hi) / 2` at draw time. Nothing can stop that; what is gone is any field that would make it look sanctioned. |
| **The record never reaches the renderer** `assertNoRecordOnPlan` (from `../eras/era-plan.js`) | **GUARANTEE** | Covered: no `ci80`, `sources`, `method`, `as_of`, `about_year`, `about_span`, `timeline_ready`, `calibration`, `claims` or `fields` anywhere on the sealed plan, and no bare `central` outside a minted point mark. Not covered: a point mark's own `central`, which is the design; and `mark.lo` / `mark.hi`, which are always present because the span **is** the mark. Anything can average them. Nothing on this plan does, and nothing in this folder helps. |
| **The seal names the planner** `definePlanner` · `openTollPlan` | **GUARANTEE** | Covered: `TOLL_PLANNER` lives in a module-private const nothing exports. An era machine plan is refused at this door and a plate set is refused at the era machine's; a `Proxy` around a sealed plan is a different object and is refused; a plan sealed by a planner the caller defined is refused by identity. Re-entry re-walks the live graph, re-checks every mark against the **live** guards and re-runs this module's invariants. Not covered: `definePlanner` is public and must be. Forging the handle means editing `toll-plan.js`, in a diff a reviewer reads. |
| **A plan built at one cut cannot be re-opened at another** `assertMarksHonest` | **GUARANTEE** | Covered: mark kinds are re-derived against the live `guards.RULES`, so a plate set built under `configureRules({ wideIntervalRatio: 0.20 })` is refused after the cut moves back. **Re-plan after moving a convention.** |
| **G8 · time is two fields** `assertTimeField` at import · `timelineYear` | **GUARANTEE** | Covered: `TIME_FIELD` is asserted when the module loads, so an edit swapping in `as_of` throws before anything renders. `timelineYear` is called only where `isTimelineDrawable` gives permission. None of the thirteen claims is withheld today; the branch exists because that is a fact about today. Not covered: a renderer reading `claim.about_year` off a record object — and no record object reaches this renderer, which closes it here. |
| **Every colour the page draws is measured** `assertTollColourBudget` | **GUARANTEE** | Covered: runs at import, so no page renders without it. Iron, Zinc, Brass and Rust go through `assertObjectColor`; Zinc-text, Graphite and Iron go through `assertTextColor`. Brass against Rust goes through `assertDistinguishable` with the two channels the record says Rust carries, and the return's `crossCheck` must read `confirmed`. Stipple's iron frame is `PAINT.absence` imported from `../eras/organs.js`, not restated, and the module refuses to load if that frame stops being iron. Not covered: **the guard reads the paint table, not the DOM.** The bench closes the two cases that matter — a rust mark inside an arrival row, and anything stroked in Stipple. |
| **Every verdict is visible** `assertVerdictsVisible` | **GUARANTEE** | Covered: three of the thirteen claims carry a verdict of `adjusted`, so this is not decoration here. A plan drawing them without a printed register is refused, at mint and on re-entry, and the page prints the register under the plates. Not covered: nothing checks that a reader reads it. |
| **Every reader-facing string is read by something** the demo page's lint button · the bench's lint row | **ADVICE** | `guards.lintTextForDeadMechanism` over `domSentences(root)` — every text-bearing leaf, every SVG `<title>` and every `aria-label` on the rendered page. **215 strings scanned, 0 findings. THAT IS NOT A CLEARANCE.** The lint is a regex over English, it knows about exactly one claim (the 2019 auction change), and `guards.DEAD_MECHANISM_LINT_LIMITS` names two sentences it verifiably misses. Every other false sentence a human could write into any surface on this page reaches the reader with nothing in its way. |
| **Readability** | **MEASURED, NOT ENFORCED** | Re-measured 2026-08-01 after this round's repair, with `tools/readability.py`, off the rendered DOM. **All 215 distinct strings: FK 6.82 · Reading Ease 70.64 · Gunning Fog 9.26 · SMOG 9.63.** Over the 96 that run to four words or more and end in a stop: **FK 6.02 · Ease 73.22 · Fog 8.42 · SMOG 9.08.** The 115 sentences the plan carries, measured without a browser through `planSentences(plan)`: **FK 6.52 · Ease 71.98 · Fog 8.98 · SMOG 9.43.** All three are inside the gates of FK ≤ 10, Ease ≥ 50, Fog ≤ 12, SMOG ≤ 12. The thirteen new sentences saying where each direction came from moved every one of the twelve figures the right way. Nothing in this folder re-runs the measurement; a string added later is unmeasured until somebody does. |

## The eight documented limits

The table above says what each rule covers. These eight say what is left, in the two sets the project
uses everywhere else. **They are written as they were found, and none of them is softened.** Four are
the boundary of a GUARANTEE — the rule throws, and here is the edge it throws at. Four are ADVICE, and
advice finds some of what is wrong and never claims to find all of it.

### Four limits on what is guaranteed

1. **The direction is read out of a frozen list of English phrases.** `DIRECTION_PHRASES` holds
   twenty-seven of them — eleven for kept, ten for handed on, six for arrived — matched as plain
   substrings against lowered text. A record that says a share was retained in words the list does
   not carry is refused rather than drawn. A record that uses one of those phrases about a party
   other than the one the plate draws would be read as though it were about this one. The guarantee
   is that the drawing follows the record's words. It is not that the words were read correctly.

2. **The unit decides, and the statement is read only when the unit is silent, and only as far as its
   first break.** A direction word further down a statement is never read. Take `e6-pricing-003`. Its
   statement says traffic acquisition costs "equalled 91% of Google Network advertising revenue", and
   the row is still drawn as a take, because its unit says "take rate retained by Google". That is
   the right answer here, and it is right by a rule rather than by a reading. A record that names the
   party keeping the money only after the first dash reads the other way, or is refused. **The rule
   is load-bearing and it was measured: read the whole of `e5-pricing-006`'s statement rather than
   its head, and the derivation finds both directions in one sentence and refuses the row.** The
   whole page stops with it, by limit 3.

3. **A row the record does not settle is refused, and refusing one row refuses the whole page.**
   `planTollPlates` builds all seven plates or throws, so one claim whose words go quiet takes the
   object down. That is deliberate — a page with a hole in it is a page nobody can see the hole in —
   and it means a record repair can stop this object rather than degrade it. There is no partial
   plate set and there is no fallback direction.

4. **A plan built before a record moved cannot be re-opened after it, and no plan re-opens without
   the record.** `assertDirectionsFromRecord` re-derives against the live frozen record, so a repair
   that changes what a claim's unit says about its own money refuses the sealed plan instead of
   redrawing it. **Re-plan after moving a record.** And a re-entry that cannot reach `claims.json`
   throws rather than skipping the check, because a direction check that quietly skips is the label
   coming back.

### Four limits that are advice

5. **Who produced the figure is an editorial class over a source the guard can only prove exists.**
   Every toll names a `sourceKey` that must appear in one of the claim's own `sources[].name`, and
   `ranged` is checked against G1. "The Economic Census counted this" is still a sentence about what
   a census is. The guard proves the census is on the claim. It cannot prove the sentence is a fair
   reading of it, and the visibility column is the finding.

6. **The thirteen base sentences are authored, and they are checked for shape and never for truth.**
   No digit, all distinct, long enough. Nothing reads them against the claim they sit above. They are
   the thirteen strings on this page most worth a second reader, and `shortLabel` truncating the unit
   inside the drawing is safe only because they are there.

7. **Nothing in this folder compares a rendered numeral against the figure behind it.**
   `domSentences` reads the DOM for *text*. No guard on this page does arithmetic on what was drawn.
   That is the library's widest limit and it applies unchanged three layers up. The bench measures
   five things off the drawn page and five is not all of them.

8. **The prose lint and the readability measurement are both advisory, and neither re-runs itself.**
   215 strings, 0 findings, over a regex that knows one claim; `guards.DEAD_MECHANISM_LINT_LIMITS`
   names two sentences it verifiably misses. The four readability scores were taken by hand on
   2026-08-01. A string added tomorrow is unlinted and unmeasured until somebody runs both again.

---

# What a renderer can still reach that it should not

Written plainly, because "no renderer currently reads it" is a latent hazard and not a guarantee.

1. **A point mark's own `central`, and `mark.lo` / `mark.hi` on every mark.** That is the design, and
   it is the same limit the chart layer states. Thirteen centrals sitting on one page could be
   collected into an array and plotted on one axis by a caller who wanted to. What is gone is any
   plan field that would help: there is no share, no fraction, no normalised value, no scale, no
   axis and no shared baseline anywhere in `toll-plan.js`.

2. **A wedge's pixels are a share of its own bar.** `wedge.valveX - bar.x` divided by `bar.width`
   recovers the fraction, and `bar.width` is on the row. This cannot be closed while the drawing
   exists: a drawing of a share is a share, drawn. What is gone is the part that cost nothing —
   thirteen readings on one length, where the eye did the division for free and got an answer across
   two different bases. Recovering it now takes a division per plate, and every plate names a
   different base beside it.

3. **The relation and the visibility are this folder's judgements.** `rival`, `filed`, `unclosed` and
   the rest are read from `toll-records.js`, not from `claims.json`. Each is grounded by a
   `sourceKey` the record must carry and a written reason a reviewer reads, and by nothing stronger.
   **The measure used to be on that list and is not any more.** Repair 6 derives `kept`, `paid` and
   `arrived` from the claim's own words. No field on the record says "this figure counts an
   arrival", so the derivation reads the sentence that does.

4. **The base sentences are authored.** They are checked for shape — no digit, distinct, long enough
   — and never for truth. They are the thirteen sentences on this page most worth a second reader.

5. **`shortLabel` truncates a unit inside the drawing.** It cuts at the record's own structural
   break and adds an ellipsis; it never paraphrases, and the whole string is in the `<title>` and
   printed untruncated in the `OF WHAT` row. A truncation is still a truncation, and the base
   sentence above the drawing is why it is safe here.

6. **Nothing here scans the built page for arithmetic.** `domSentences` reads the DOM for *text*.
   No guard compares a rendered numeral against the minted figure behind it. That is the library's
   widest limit and it applies unchanged three layers up. The bench now measures five things off the
   drawn page. The token column, the bar geometry, the painted end of a span, the absence of rust on
   a payout row, and the sentence each row prints about its own direction. Five is not all of them.

7. **The bar sizes are arbitrary, and being arbitrary is the point.** A reader who assumes a longer
   bar means a bigger base will be wrong, which is why the plate, the drawing and the accessible name
   all say the length measures nothing. That is prose doing a job a picture cannot do here, and it is
   the one place on this page where that trade is made deliberately.

---

# Decisions a reviewer should see

**The fill texture on this page never means a source grade.** `svg-kit.GRADE_FORMS` is the project's
grade register — A solid, B ruled, C 45-degree hatch — and this page does not use it as one. Every
wedge is hatched whatever its grade, because `REDUNDANT_CODING.take` makes the 45-degree hatch the
mandated second channel on Rust (Brass against Rust falls to ΔE2000 7.8 under tritanopia) and a solid
grade-A wedge would drop it. The grade is carried instead by the weight and dash of the wedge's iron
edge, and printed as a word beside every figure. `gradeFill(svg, 'C', RUST)` is used as a pattern
maker, not as a grade.

**The hatch pattern is minted where the paint is used, not at the top of the row.** That is not a
performance choice. `gradeFill` writes a `<pattern>` into the drawing's `<defs>`, and that pattern
carries a rust stroke. An arrival row must have no rust in it at all, and neither may a payout row.
That is the era-7 guard and the payout guard, and the bench proves both by scanning the drawn SVG.
Calling `gradeFill` once per row put a rust stroke in every drawing, including the four the guards
are about.

**The direction vocabulary is phrases rather than single words, and the two rules were measured
separately.** Swapping the twenty-seven phrases for seven single words — `retained`, `paid`, `cost`,
`reaching` and so on — gives the same thirteen answers on today's record, so the phrase list is not
what is holding the page up. **The head rule is.** Read the whole of `e5-pricing-006`'s statement
instead of its head and the derivation finds `traffic acquisition cost` and `take rate` in one
sentence, says the money went both ways, and refuses the row. The phrase list is the second belt, and
it is measurable too. Drop the head rule *and* go to single words, and `e3-pricing-001` says both as
well. Its worked example reads *"the agency paid $2,125 and billed the client $2,500"*, which is a
commission being settled rather than a payout. Both rules are cheap, and each covers a case the
other does not.

**Money handed on is drawn in brass, ruled on paper, and never in rust.** Rust on this page means the
intermediary's cut. A payout is the opposite of one: it is money leaving for somebody else's books.
It could not be brass alone, because then the part that leaves would be invisible against the part
that stays — so it is brass ruling over paper, with an iron divider, a pipe off the page and a
printed label. Four channels, no rust, and no colour doing the work on its own.

**The bar sizes come from a digest of the base's own words.** They are deterministic, order
independent and unaffected by any claim value, so the same thirteen bases always draw the same
thirteen bars and a repair to a figure never moves one. Two bases that round onto the same edge are
walked apart by a fixed rule rather than left touching, and a base that cannot be placed at all is a
throw. The alternative — authoring thirteen lengths by hand — would have put thirteen numbers into a
file whose whole claim is that it holds none.

**There is no verb.** This object has no control. Option 2C won the decision on the argument that
"the finding arrives without the reader touching anything, which is the only version most readers
will actually get", so nothing here animates, and the reduced-motion path is the same drawing.

**`domSentences` is written here rather than imported.** `../auction/bench.js` exports the same walk,
and this team's import list is `lib`, `charts` and `eras`. Pulling in the auction bench to borrow
eighteen lines would load the engine, the ten scenarios and the band onto a page that has none of
them. What is duplicated is a tree traversal, not a decision and not a number — and the lint both
walks feed is the single copy in `guards.js`.

**Era 1's plate carries a caveat rather than a clean story.** `e1-pricing-004`'s own statement says
the agency commission "was the principal but not demonstrably the only intermediary cut: publishers
also paid national special representatives, whose rate is not established here." The plate prints
that. The finding on this page is that the cut got harder to *see*, not that everything was known in
1900, and a plate that implied the latter would be making the same kind of overclaim the page exists
to refuse.

**Era 5 reaches outside PRICING for one toll.** `e5-sellers-004` — DoubleClick's gross margin, which
the record itself calls "the ad network's effective take rate" — sits in the SELLERS field. Era 5's
PRICING claims are about pricing *models*, not about anybody's cut, and a plate for the era in which
the counting moved onto the seller's own books cannot be built out of them alone. The row's `field`
is on the plan and the drawn accessible name says `SELLERS`.

---

# Branches the frozen record does not run

One, and the bench forces it. This is the same move the chart bench makes on the GDP strip: a forced
test is weaker than real data and much stronger than a branch nobody has ever seen run.

| Branch | Why the record does not reach it | The forced test |
|---|---|---|
| A span-only **arrival** — `arrival` with no `edgeX`, drawn with both ends barred and no brass edge | Both arrival readings are inside the 60% cut: `e7-pricing-004` at 25.5% and `e7-pricing-005` at 41.7%. | `configureRules({ wideIntervalRatio: 0.20 })` makes both span-only. The bench asserts the `edgeX` key is absent, re-runs every shape guard on the forced plate set, draws it, and asserts the drawing prints "no middle value". It then moves the cut back and asserts the forced plan is **refused** on re-entry. |

The span-only **wedge** branch is exercised by the record: three rows — `e1-pricing-001`,
`e3-pricing-003` and `e5-sellers-004` — have no middle value at the record's own cut, so the
no-valve drawing, the two-pipe drop and the surfaceless pool are all real on the page.

---

# The cost, measured

`OPEN-PROBLEMS.md` priced 2C at "about 1,290 pixels of desktop page and about 2,900 on a phone". The
built object is bigger, and the reason is the record rather than the design: the seven eras carry
**thirteen** tolls, not seven, because four eras measure their cut twice and the last measures it
three times.

Re-measured after this round's repair, 2026-08-01: **8,583 pixels of page**, of which the seven
plates are 6,495 — 1,009, 527, 943, 502, 968, 943 and 1,603. The drawings did not change height: each
is the same 172 units tall whatever size the bar inside it is. **The 360 pixels this round added are
the thirteen sentences saying where each row's direction came from**, one per row, wrapping to a line
or two under the line that states the direction. The round before that added 218 pixels of prose in
the lede and the note above the plates, saying the drawings do not share a scale.

Three things were done about it and one was not:

- the drawing is 172 units tall rather than 206, and never renders wider than its own viewBox;
- the written reason for each toll's selection is folded into a `<details>` — still in the DOM, so
  the lint and the readability measurement both still read it;
- the drawing scrolls inside its own container on a narrow screen rather than shrinking to
  illegibility.

What was **not** done is cutting a toll. Dropping era 3's station representative or era 6's payout
figure would shorten the page and delete the two clearest cases of one era measuring its cut twice
on two different bases, which is the argument.

---

# The bench

`toll.test.html` — 102 cases, no framework, no build step. **The page prints its own tally; trust that
over any number written in this file.** It reads the six real frozen files and all seven era records.
Three cases use a made-up claim because they need a shape rather than a fact, and they say so.

Nine rows are **CENSUS** rows and count against the whole record:

- the thirteen bases;
- the thirteen bar sizes, and what one point of a share is worth on each of them;
- the pairs the drawing puts in the wrong order, which is the proof there is no ruler;
- what each span paints, against how far it only reaches;
- the visibility of every figure, cross-checked against its claim's own source list;
- **the thirteen directions, with the field of the record that settled each one and the record's own
  words for it** — nine off the unit, four off the head of the statement;
- **the four statement heads the derivation reads when the unit says nothing**, printed in full, so a
  reviewer can see exactly what was read and what was cut off;
- the span-only rows at the live cut;
- the colour budget.

**Five rows measure the drawn page rather than the plan behind it**, with `getBoundingClientRect` and
with the SVG's own attributes. They read the token column's drift down the page. They read the drawn
bars' left edges, right edges and lengths. They read the painted end of every span-only cut. They
read the absence of any rust on a row that handed its money on. And they read the sentence each row
prints saying where its direction came from. The bench that shipped two rounds ago had a row asserting every bar was the same length and a row
asserting the plates were indented differently, and it called the pair of them *no shared axis*. They
were the shared axis. A bench can be green on rows that check the wrong property.

**And the newest section is the one that was green on an inverted drawing.** Section 2c rebuilds this
round's attack in full — the label moved AND every pixel re-derived from the left — then shows
`assertRowShapes` and `assertPixelsMatchMarks` passing on it before `assertDirectionsFromRecord`
refuses it. Six more rows refuse the rest of the family. The printed words swapped. The quoted
evidence swapped. A claim whose words say nothing. A claim whose words say both. The check run with
no record at all. And the record moved under a plan already built.

**A row that reports its own failure is a row that cannot fail.** `ok()` records any string as a PASS
and prints it as the row's detail, which is what makes a census readable. Every row here with
something to report therefore **throws** on a mismatch rather than returning a sentence that says it
went wrong. The lesson is `eras.test.js`'s, and it is repeated because it once cost a green run on a
red gate.

---

# The pull ring, which was already built

`DESIGN.md`'s problem 3 asks for "a four-state teaching sequence that needs its own test page".
**`../eras/pull-ring.js` already carries a complete one**, and this team built nothing to replace it.
What is there, verified by running it rather than by reading it:

- `createTeacher()` — a four-state machine, `REST → TUG → NAMED → LEARNED`, which only moves forward
  and writes `LEARNED` to `sessionStorage`, because PULL's own record allows one teaching tug in the
  whole piece and a reader who scrolls back to era 1 has already been taught;
- `installPullRings(svg, { teacher, onPull, teaching })` — eight rings at eight frozen positions, a
  44px hit box on a 26px ring, and `teachAfterFirstCrank()`, which fires the one tug from era 1's
  first crank so it lands while the reader's own hand is still the cause of the last thing that
  moved. Every other era passes `teaching: false` and gets rings with no tug at all;
- the NAMED sentence drawn as an SVG label in the headroom band above the plate row, with a leader
  into the ring. It is a label rather than a tooltip. A tooltip is not on the page at all for a
  reader who never hovers, and this is the control five architects expected readers to miss;
- `settled(handle, ms)`, a ceiling on how long the sequence waits for a verb. Chrome does not resolve
  an animation's `finished` promise in a background tab, and a sequence chained onto that promise
  stops dead if the reader switches tabs mid-tug;
- a reduced-motion path that is a different encoding rather than a shorter one: the ring rests three
  pixels proud and the sentence arrives at once;
- `../eras/pull-ring.demo.html`, which runs the sequence a step at a time with a reset button, and
  the eras bench, which covers the state machine.

Run on 2026-08-01 against the real record: state moved `REST → NAMED` on the teaching tug, then
`LEARNED` on a pull, and the drawer opened with seven cells under the title
`04 · PRICING · the RULE · seven machines`.

**One piece of `OPEN-PROBLEMS.md` option 3A is not built.** It is named here rather than left in
silence, because it needs a decision. Option 3A asks for a **26-pixel lip** at the bottom of every
screen. The lip names the last part pulled and carries eight small squares, filled as the reader
opens them.

`DESIGN.md`'s decided paragraph for problem 3 does not carry it forward. That paragraph asks for the
ring, the teaching moment and permanent visibility. It prices the lip's pixels and never asks for the
squares. The lip is also chrome, and it touches every page's bottom padding. It therefore belongs to
whoever owns the shipped page shell, not to this folder.

---

# Still open for the teams behind B6

- **The toll plates are not in a chapter yet.** They are a self-contained object with a demo page.
  Placing them, and writing the chapter prose around the finding, is team B7's.
- **The base sentences are the thirteen strings most worth a second reader.** They are the one
  reader-facing surface on this page that is authored rather than derived, and no guard reads them
  for truth.
- **Thread 2 still has no cross-era chart, by design.** `DESIGN.md` lists that under "Still
  unsolved", and this object is the reason. Any later attempt has to answer the incomparability
  problem first, and `assertBasesDistinct` is where the answer would have to start.
- **The visibility classes are five, and the record could support a sixth.** Nothing in the code
  fixes the number; `VISIBILITY` is a table and `assertTollSelection` checks membership. A new class
  needs a drawn form in `drawToken` and a line in the legend, and the bench will fail until it has
  both.
