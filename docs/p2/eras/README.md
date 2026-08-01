# `docs/p2/eras/` — the seven era machines

Team B3 (`p2-ad-market/BUILD-PLAN.md`). Direction: **The Bench** (`p2-ad-market/design/DESIGN.md`,
locked 2026-07-31). Light mode only.

Seven machines that set a price. Eight organs at eight fixed screen positions, redrawn seven times.
One operable control per machine, and the same one every time. A pull ring on every organ, taught
once, then permanent.

Plain ES modules. No build step, no bundler, no third-party dependency, no network request beyond
the frozen JSON the page reads from this repository.

| File | What it is |
|---|---|
| `organs.js` | **The spine.** The eight positions, the map from machine part to schema field, the fixed sentence each position says in every era, the line work, and `PAINT` — every colour the machine draws, measured by `assertColourBudget()` at import. Reads no record, mints no mark, draws nothing. |
| `era-plan.js` | One era record in, one **sealed plan** out. Every guard runs here. The record is stripped here. No DOM. |
| `era-machine.js` | The template. Takes a sealed plan and draws it, and owns the CRANK verb. |
| `pull-ring.js` | The ring, its four-state teaching sequence, and the cross-era drawer. |
| `era-records.js` | Reads `eras/era-1..7.json`, taking era 5 from the guard registry rather than fetching a second copy. |
| `eras.css` | Page furniture. Restates no token value: the four rules that need a token at low alpha go through `color-mix()` on the custom property, because a hand-written `rgba(91, 101, 112, …)` is Iron in a form no grep for the token will ever find. |
| `era-machine.demo.html` | All seven machines, with the era-1 gate. |
| `pull-ring.demo.html` | The teaching sequence on its own, a step at a time. Its own test page, as `DESIGN.md` asks. |
| `eras.test.js` · `eras.test.html` | The bench. 92 cases, every one a way to make a machine lie. **The page prints its own tally; trust that over this number.** |

## Opening the pages

```
cd /path/to/chipandadmarketresearch && python3 -m http.server 8000
```

then

- `http://localhost:8000/docs/p2/eras/era-machine.demo.html` — the seven machines
- `http://localhost:8000/docs/p2/eras/pull-ring.demo.html` — the teaching sequence
- `http://localhost:8000/docs/p2/eras/eras.test.html` — the bench

Add `?motion=reduce` to any of them to force the reduced encoding. Browsers refuse ES module
imports and `fetch` over `file://`, so every page says so plainly and stops rather than
half-rendering.

---

# The eight positions

The list of positions is **not written in this folder**. `../lib/tokens.js` exports `ORGANS` — the
eight machine parts, in order — and `organs.js` only maps them onto the eight schema fields.
`assertOrganSpine()` runs at import and throws unless the map is a bijection over that list. A ninth
position cannot be invented here and an eighth cannot be dropped.

| # | Part | Field | What it does, in the words every era uses |
|---|---|---|---|
| 01 | INLET | BUYERS | Who paid. The money drops in here. |
| 02 | GATE | CREATORS | Who made the ad. The gate sets what gets through. |
| 03 | METER | MEASUREMENT | Who counted the audience. The gauge shows the count. |
| 04 | RULE | PRICING | Who set the price, and by what rule. This is the box you turn. |
| 05 | SORTER | TARGETING | How the ad found its audience. The sorter picks the lane. |
| 06 | TOLL | SELLERS | Who owned the audience. The valve splits the dollar. |
| 07 | DOOR | MEDIUM | What carried the ad. The door is the way out. |
| 08 | OUTLET | SCALE | How big the market got. The spout is the size. |

**The sentence never changes between eras, and that is the mechanism behind the team's gate.** If
era 4's MEASUREMENT sentence differed from era 6's, a reader could not learn the position — they
would be learning fourteen things instead of eight. The bench asserts it over all seven, and
asserts the eight drawn plates land at the same eight x in all seven.

## The colour budget

Three accents, listed as data in `organs.js` → `ACCENTS`, and the bench prints them:

- **Brass** — the slug of money falling into the INLET hopper.
- **Cyan** — the METER's needle and hub, always on iron, because cyan alone is 2.46:1 on Bone.
  The hub is an open cyan fill with an iron stroke. The needle is **drawn twice**: an iron line at
  4.6px, then the cyan line at 2.4px on top of it, because a stroke cannot carry a stroke. What a
  reader sees is a cyan needle in an iron casing, and what holds it off the paper is the iron.
- **Rust** — the hatched stub on the TOLL's tap. Always hatched: brass against rust falls to
  ΔE2000 7.8 under tritanopia, so hue alone does not separate them.
- **Stipple** is a texture, not an accent. It is 1.53:1 on Bone and never has an edge of its own:
  every stipple on a machine sits inside a **dashed iron frame**, which is what rule 5 asks for and
  what `svg-kit.absenceBlock` draws.

**The colours are not names in the renderer any more. They are attribute bags in the spine.** A draw
site spreads `PAINT.countLine` or `PAINT.absence` onto an element and gets the whole role: the
colour *and* the iron that carries it. There is no way to take one and leave the other.
`era-machine.js` imports no colour token beyond the ground and glyph values, and those two reach the
page through `svg-kit`'s guarded `text()` and `frame()`.

This is a repair. `era-machine.js` used to pick the hexes itself and **call no colour guard at
all**. Two of the five it picked were drawn bare, below the 3:1 that WCAG 1.4.11 asks of a
graphical object: the METER's needle at 2.46:1, and the withheld tally tick's frame at 1.53:1.

**Everything else is iron line work, including every claim reading.** A reading is drawn as an
**iron caliper** with the figure printed beside it, which is `../charts/svg-kit.js`'s own house
pattern — its `caliper()` strokes iron and prints the measured distance in iron. That is why this
folder never has to decide whether a given claim is money or a count, and why there is no unit
classifier anywhere in it. The instrument is iron. The number is text.

A point mark carries an **open** circle at its central. Open, not filled, because a filled round
mark means money in this palette and a reading is not money. A span-only mark carries no circle at
all — there is nothing to draw it from.

---

# What each era cranks, and why

One operable control per machine, at the RULE position, in every era. Its notches are that era's
PRICING claims — **all of them, in the record's own order, none dropped**. The name is what the
reader turns; every figure the readout shows comes from a mark.

| Era | The control | Settings | Why PRICING answers this era's question |
|---|---|---|---|
| 1 · The Middlemen | **THE COMMISSION** | 4 | Era 1 prices space off a rate card nobody held to, and the number that moves is what the agent keeps out of it. |
| 2 · Sponsorship | **THE RATE CARD** | 8 | Era 2 sells hours of transmitter time off a published card, and every other price in the era is a fraction of it or a discount off it. |
| 3 · The Spot Market | **THE SPOT RATE** | 8 | Era 3 sells a unit of network time rather than a programme, so the price of one unit is the rule. |
| 4 · Segmentation | **THE SEGMENT** | 6 | Era 4 prices a targeted thousand and pays for the work two different ways at once. |
| 5 · The Impression | **THE IMPRESSION** | 8 | Era 5 copies the magazine and prices a thousand showings, while one seller starts pricing a click. |
| 6 · The Auction | **THE AUCTION** | 8 | Era 6 stops quoting a price at all and lets the runner-up set it. |
| 7 · The Machine Market | **THE ALGORITHM** | 8 | Era 7 lets the seller tune the price against its own revenue target. |

50 settings across the seven. Each `why` is on the plan as `crank.why` and printed under the
control, because it is a decision a reviewer should be able to see rather than infer.

**Era 1's first setting has no middle value.** `e1-pricing-001` is "10 to 50 percent of the space
price" on a central of 25 — an interval 160% of its own value, well over the cut. So the first
thing the first machine shows the first reader is a reading with no number in the middle of it.
That is not a coincidence the build arranged; it is the record's own first pricing claim, and it is
the best possible teaching case for the rule the whole piece runs on.

## The verb

CRANK, from `../lib/motion.js`: 320ms with a 40ms hold before the output moves. **The hold is
load-bearing and is not a delay to be tuned away.** It separates cause from effect in time, which is
what makes the machine read as mechanical rather than reactive, and it is what makes the reader
attribute the output to their own hand.

Every machine starts **unturned**: the output plate says what to do and shows no reading at all
until the reader's hand moves it. A machine that has already answered has nothing left to teach
about who caused the answer.

CUT is used once, and only for what CUT is for: moving between two settings of one era's price rule
crosses a definitional seam, because "percent of gross billings" and "USD per agate line" are two
different rulers.

---

# What is guaranteed and what is advice

Same two words the library and the chart layer use, used the same way. **GUARANTEE** refuses a
shape or checks a bounded finite record, and throws. **ADVICE** finds some of what is wrong and
never claims to find all of it.

| The rule | Which | What is covered, and what is not |
|---|---|---|
| **The record never reaches the renderer** `assertNoRecordOnPlan` **+** `EXTRA_KEYS` | **GUARANTEE** | Covered: the finished plan is walked, and any key in `RECORD_ONLY_KEYS` — `ci80`, `sources`, `method`, `as_of`, `about_year`, `about_span`, `timeline_ready`, `calibration`, `claims`, `fields`, `by_money_type`, `by_money_type_alt` — or a bare `central` outside a minted point mark is a throw. It runs inside the seal's `revalidate`, so it fires at mint **and** on every re-entry. **The walk skips minted marks by design**, because a point mark's `central` is the one record-shaped key a mark is meant to carry — so the mark itself is the one place on a plan this walk does not look, and it is closed at the other end. `planClaimMark`'s `extra` bag is a closed **allow list** of four presentation fields with primitive values only; it used to be a ban list that let `ci80`, `sources`, `method`, `as_of` and `calibration` straight onto a minted mark. The allow list is walked over `Reflect.ownKeys`, so a **symbol** key is refused — spread copies symbol keys, `Object.keys` does not see them, and this walk uses `Object.keys` too, so a record row under one would have been invisible at both ends — and an **accessor** is refused, because a getter that answers a string when it is checked and the whole claim when it is read again is how `ci80` walked past a check that had just approved a sentence. Not covered: `statement` is deliberately **not** on either list — a verdict stamp carries it, and that stamp is the correction the reader has to see. |
| **A drawer holds every era, and says so** `assertSevenEras` · `drawerWords` | **GUARANTEE** | Covered: `planCrossEra` refuses any record set that is not all seven eras, in order, each with its fields — so a partial drawer cannot be built. Every count and every word the drawer prints is then derived from the cells it holds: the title, the accessible name, the alt sentence and the ruler note all come out of one function, and the seal's `revalidate` re-derives all four from the **live** cell list at mint and on every re-entry. `pull-ring.js` prints `plan.title` and `plan.ariaLabel` rather than building its own. This is a repair: the function used to refuse only an *empty* set, so a three-era plan rendered under the title "seven machines" with an accessible name reading "all seven eras", beside its own alt text saying "3 eras". Not covered: the number of *machines* on a page is the page's business — `era-machine.demo.html` renders one at a time. |
| **Every colour the machine draws is measured** `assertColourBudget` | **GUARANTEE** | Covered: it runs at import in `organs.js`, so no page can render without it. Iron, Zinc and every standalone accent go through `assertObjectColor`; the label colour goes through `assertTextColor`. The two that cannot stand alone — Cyan at 2.46:1 and Stipple at 1.53:1 — must name a carrier, and the carrier must actually appear in the attributes the draw site spreads, which is the same cross-check `assertDistinguishable` runs on a declared `redundant` channel. A declaration that has gone stale (a token that now clears 3:1) is also a throw. Not covered: **the guard reads the paint table, not the DOM.** A draw site that writes its own `stroke` attribute instead of spreading a bag is unguarded. `era-machine.js` imports no colour token to write one with; the bench then checks the drawn SVG for a bare cyan line and for anything stroked in stipple. |
| **The two copies of one number agree** `assertCopiesAgree` | **GUARANTEE** | Covered: every one of the 435 claims in `eras/era-1..7.json` is matched by id against `claims.json` and refused if `central` or `ci80` differs. All 435 agree today; nothing else in the repository checks it, and a repair applied to one file and not the other is invisible in both. Not covered: a claim whose *statement* drifted. The check is on the numbers a mark is built from. |
| **Only `claims.json` supplies a claim** | **GUARANTEE** | Covered: the era file supplies structure — which claim sits at which organ, the summaries, the events, the pools — and the CLAIM comes from the frozen record, which is the only copy carrying `verdict`. A claim in an era file and not in `claims.json` is a throw rather than a fallback. Not covered: nothing checks that the era files stay a subset. |
| **G1 · no point on a wide interval** through `planClaimMark` | **GUARANTEE** | Covered: the mark kind is `guards.markKindFor`'s answer and nothing in this folder second-guesses it. On a span-only mark the `central` key is never assigned, so the renderer's one branch that reads a central cannot be reached. 35 of the 335 drawn readings are span-only at the record's own cut. Not covered: the 60% cut is a drawing convention, not a measurement, and `guards.configureRules` can move it. Move it and **re-plan** — `assertMarksHonest` refuses a plan built at the old cut. |
| **No derived middle value is printed** `assertReadingsMatchMarks` | **GUARANTEE** | Covered: there is **no arithmetic on a claim value anywhere in this folder**. The three strings a reading can print are `markReading`, `markFigure` and `short`, all built at plan time; `short` is the central for a point and `lo–hi` for a span. This used to be a guarantee of the MECHANISM only — the strings were plain text on a plain object, and the plate draws the string, so a midpoint typed into `headline.short` drew while every mark on the plan stayed honest. All four strings are now **re-derived from the mark beside them**, at mint and on every re-entry, by a generic walk that finds any object carrying a minted mark and a `short` — so the crank's notches are covered without being listed. The bench asserts, over every span-only reading on all seven machines, that `short` is the two ends and is not the formatted midpoint, and that the drawn span caliper has no index circle. Not covered: a renderer that computes `(lo + hi) / 2` at draw time and prints it without putting it on the plan. Nothing can stop that; what is gone is any field, helper or plan string that makes it look sanctioned. |
| **G2 · the pools are never put in order** `renderPools` | **GUARANTEE** | Covered: both money-type organs declare `ordering: "unranked"` and `layout: "fixed-position"` and go through G2, in every era. An ordered layout throws. Eras 1, 5 and 7 each carry three unranked pairs in the record; eras 2, 3, 4 and 6 have no entry in `reconciled.json`, and an unordered layout does not need one. Not covered: `assertRankable` is only reached by an ordered layout, so the four eras the record does not cover are unguarded **if** somebody later asks for a sorted layout there — that call throws `GuardVacuousError` rather than passing, which is the right failure. |
| **G6 · era 5's two taxonomies** `assertTaxonomy` · `assertTaxonomyField` | **GUARANTEE** | Covered: `scope` is required and is never defaulted. The single-era machine reads `by_money_type`; every cross-era drawer reads `by_money_type_alt`, and the choice is resolved through `guards.assertTaxonomyField`, which asks the record rather than the field's name. The cross-era seal's `revalidate` re-checks it on re-entry. Not covered: the guard reads ids. A view that reads the right ids and prints the wrong numbers beside them passes. |
| **Era 5's cross-era cell is complete** | **GUARANTEE, WITH A JUDGEMENT IN IT** | `by_money_type_alt` holds only the two pools the directory block moves between. Drawn as it stands, era 5 would show two pools in a drawer where six other eras show four, and a reader would read that as era 5 having no national-brand money. The two untagged pools are therefore carried across from the era-native split, selected through `guards.taxonomyOf` returning `null` and never by name, and marked `unchanged` so the drawer says which is which. The judgement is that a missing pool misleads more than a carried one; it is written down here and asserted in the bench. |
| **G8 · time is two fields** `assertTimeField` · `timelineYear` | **GUARANTEE** | Covered: `TIME_FIELD` is asserted at import, so a later edit that swaps in `as_of` throws before anything renders. `timelineYear` is called only where `isTimelineDrawable` gives permission. The three withheld claims — `e1-sellers-005`, `e7-pricing-003`, `e7-measurement-003` — keep their value, carry `year: null`, and are drawn with a named stippled block where the year would be, never a blank and never the source's publication date. Not covered: a chart that reads `claim.about_year` off a record object. No record object reaches the renderer, which closes that here. |
| **G5 · absence is an object** | **REVIEW RULE, NOT `assertAbsenceDrawn`** | The absence this folder draws is a **missing year field**, not a hole in a year-coverage series, so `guards.assertAbsenceDrawn` and `svg-kit.absenceBlock` do not fit: both are keyed on the years an absence covers, and passing `[0, 0]` would print "0–0". `withheldBlock` draws the three things rule 5 asks for — stipple, an iron frame, a printed name — plus the record's own reason in the title. **Nothing in code checks that it was drawn.** The bench checks the DOM for it on era 7; that is a test, not a guard. |
| **Verdicts · no correction is invisible** `stampVerdict` · `assertVerdictsVisible` | **GUARANTEE** | Covered: 118 stamps across the seven machines. A claim whose verdict is not `confirmed` cannot be marked without a register, and the seal's `revalidate` refuses a plan carrying such a mark with no printed stamp — at mint and on re-entry. Every machine prints its register and every drawer prints its own. Not covered: the register is prose from the record; nothing checks that a reader reads it. |
| **The seal names the planner that applied it** `definePlanner` · `openEraPlan` · `openDrawerPlan` | **GUARANTEE** | Covered: every plan is deep-frozen, and `renderEraMachine` refuses anything **`planEra()`** did not mint — not "anything unsealed", which is what it used to mean and was not enough. `sealPlan` was a public export taking any `revalidate`, so the adversary built eight organs of genuinely minted marks, hand-typed the midpoint of a span-only interval into `headline.short`, sealed the result with `revalidate() {}` and rendered it: the freeze, the generic walk and `assertMarksHonest` all passed, because nothing about the marks was wrong. Now a plan carries the identity of the planner that sealed it — membership of a module-private `WeakSet`, the same identity-not-a-flag shape as the library's `NO_DOCUMENTED_GAPS` — `ERA_PLANNER` and `DRAWER_PLANNER` live in module-private consts in `era-plan.js` that nothing exports, and only their doors are exported. So a drawer plan is refused at the machine's door and a machine plan at the drawer's, and re-sealing a sealed plan throws. Re-entry then re-walks the live graph, re-checks every mark against the live guards and re-runs this module's own invariants — eight organs in ORGANS order, tally matching register, crank notches matching the PRICING field, **every printed string re-derived from its own mark**, verdicts visible, no record row. A `Proxy` around a sealed plan is a different object and is refused. Not covered: `definePlanner` is public and must be; a handle an adversary defines is not the one `era-plan.js` holds. Forging that means editing `era-plan.js`, in a diff a reviewer reads. |
| **The teaching sequence fires once** | **GUARANTEE OF THE STATE MACHINE** | Covered: the four states only move forwards, `LEARNED` is written to `sessionStorage`, and a machine constructed with `teaching: false` returns `null` from `teachAfterFirstCrank()` without changing state. PULL's own record makes "more than one teaching tug in the whole piece" a rule, not a preference. Not covered: **that the reader saw it.** The demo page holds the other six eras closed until both controls have been used; that gate lives in the page, not in this library, and a later assembly can choose not to hold it. |

---

# What a renderer can still reach that it should not

Written plainly, because "no renderer currently reads it" is a latent hazard and not a guarantee.

1. **A point mark's own `central`.** That is the design. The guarantee is about span-only marks and
   it is structural: there is no key.

2. **`mark.lo` and `mark.hi`, on any mark.** Always present, on purpose — the span *is* the mark.
   Anything can average them. Nothing on the plan does, and nothing in this folder helps.

3. **Claim counts, grade tallies and the span-only count.** These are this module's arithmetic over
   the record — how many things the record holds at an organ, and how well sourced they are. They
   are counts of claims, not measurements of the market, and the tally strip's title says so in
   full. A sentence that read a grade tally as a fact about advertising would be wrong and nothing
   here would stop it.

4. **The organ summaries and event descriptions.** These are the record's own words, carried
   verbatim and marked as quoted on the page. They are research prose and they do **not** clear the
   four readability gates; every sentence this folder *generates* does. Team B7 replaces the quoted
   blocks with chapter prose.

5. **Nothing here scans the built page.** Every guarantee above fires at a call site. That is the
   library's widest limit and it applies unchanged two layers up.

---

# Reader-facing prose

Every sentence this folder generates is written here rather than read from the record, and each SVG
is stamped `data-alt-source="generated-by-chart"` by `svgRoot`, which is how team B8 finds them all
later and replaces them with authored ones.

Measured 2026-08-01 with `tools/readability.py` over the 45 distinct generated strings.
**FK 3.69 · Reading Ease 85.1 · Gunning Fog 5.34 · SMOG 6.65.** The gates are FK ≤ 10, Ease ≥ 50,
Fog ≤ 12, SMOG ≤ 12.

The 45 are the eight organ sentences, the crank lede, the unturned-state prompt, the pool note and
the tally legend. Then the cross-era ruler note, the seam note, the drawer's title and its
accessible name, the two alt sentences, the ring's teaching line, and the demo pages' own copy.

**Every count in them is derived.** No string in this folder spells the number of eras: the ring's
sentences read `ERA_COUNT`, and the drawer's read the number of cells the plan holds. The bench has
a row that scans every drawn ring and every drawer string for a number-word standing in front of
"machines", "eras", "cells" or "readings", and fails on any that is not the count actually held.

`plan.alt` is the plain-English sentence `DESIGN.md` requires of every visual, generated per machine
and per drawer, driving the accessible name on both.

---

# The bench

`eras.test.html` — 92 cases, no framework, no build step. **The page prints its own tally; trust
that over any number written in this file.** It reads the six real frozen files and all seven era
records. Two rows use a made-up claim because they need a shape rather than a fact, and both say so.

Nine rows are **CENSUS** rows and count against the whole record:

- the colour budget of the machine;
- the keys a plan may never carry;
- the only fields a mark may carry beyond its own;
- the span-only count at the live cut;
- the three withheld readings, by id;
- the 435 era-file claims matched against `claims.json`;
- the corrections printed per era;
- what each era cranks;
- the claims drawn per era.

## A row that reports its own failure is a row that cannot fail

`ok()` records **any string** as a PASS and prints it as the row's detail, which is what makes the
census rows readable. Two rows used that idiom for a verdict — `return signatures.size === 1 ?
sig : 'SEVEN MACHINES, 3 LAYOUTS'` — so the row that measures the team's own gate went green while
printing the words that say it failed. Both now **throw** on a mismatch, and so does every new row
that has something to report. This is the same shape as everything else in this folder: the way to
make a check work is to remove the way of passing it that is not a pass.

The bench draws real machines into a host **parked offscreen and rendered**, not a detached node.
Chrome does not run an animation on an element it is not rendering, so a bench that drew into
`document.createElement('div')` sat at "running…" forever with nothing in the console. Every async
case also carries a four-second deadline, so a hang comes back as a named FAIL rather than a hang.

## `applied` versus `finished`

`crankTo(step)` returns the motion handle with one field added: **`applied`**. It settles the
instant the output has changed — after CRANK's 40ms hold, and without waiting for the 320ms travel.

Chrome does not resolve an animation's `finished` promise while the tab is in the background. A
caller that waits on the travel to learn whether the output moved therefore waits forever behind a
hidden tab. `applied` answers a different question: has the machine responded. That is what the
bench, a screen-reader announcement and the teaching sequence all need. `pull-ring.js`'s `settled()`
puts the same ceiling on the teaching sequence and on the drawer's close.

---

# Still open for the teams behind B3

- **The gate is a page decision, not a library one.** `era-machine.demo.html` holds eras 2–7 closed
  until the reader has cranked once and pulled once, and says why. Team B7 owns whether the shipped
  piece keeps that. If it does not, the pull ring goes back to being a control five architects
  expected readers to miss.
- **`withheldBlock` is not machine-checked.** See the G5 row. Closing it needs a guard whose subject
  is a missing field rather than a missing year range, which is a library decision, not this
  folder's.
- **The organ summaries do not clear the readability gates.** They are the record's own research
  prose, quoted and marked as quoted. The chapters are where that gets fixed.
- **The SELLERS organ deliberately draws no proportion.** The TOLL's valve is drawn as a mechanism
  with a rust stub, and it carries no share of any dollar. The middleman's cut is team B6's Toll
  Plate, and its whole design rests on the seven cuts being measured on seven different bases. A
  proportion drawn here, at a fixed position, seven times, would invite exactly the comparison that
  object exists to refuse.
- **Nothing here draws a timeline.** The machines print years; they do not plot them. When a later
  team puts these claims on an axis, `guards.assertTimeField` goes at the top of that axis
  constructor, and the three withheld claims are an absence that has to be drawn as an object there
  too.
