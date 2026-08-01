# `docs/p2/auction/` — the auction bench

The centerpiece, and the largest single item in the P2 build. Ten scenarios on one instrument.

Built by team B4 (`p2-ad-market/BUILD-PLAN.md`). It imports `../lib/` for every rule that can be
broken and `../charts/svg-kit.js` for every SVG primitive, and re-implements neither. Plain ES
modules, no build step, no bundler, no network request.

| File | What it is |
|---|---|
| `engine.js` | The arithmetic. Ranking, pricing, delivery, and the two closed-form panels. The one file where the auction actually runs. |
| `band.js` | **THE BAND.** The three equilibria the record computes, VCG, the envy check, and the band as a minted type. |
| `readouts.js` | Every figure that reaches a reader, minted with its label, its provenance and — for money — the bidder mode that produced it. The formatters refuse anything they did not mint, and `moneyAsMeasured` prints a figure at the precision it has. |
| `panels.js` | The dead-mechanism guard at the panel. A panel's channel and mechanism are **read** out of the frozen record, never typed. Also where the prose lint is pointed at the whole rendered page, and where a setting's provenance comes from. |
| `scenarios.js` | The ten deltas. What each teaches, what the reader's hand can reach, and the stored step every figure must equal. |
| `arithmetic.js` | The gate. A recursive-descent parser over the record's own expressions, and the two checks below. |
| `bench.js` | The apparatus. Three fixed zones, three centre forms, one verb. Controls are mounted once and updated in place, so a slider is never removed from the document mid-drag. |
| `auction.test.js` · `auction.test.html` | The bench's own bench. Every case is a way to make the auction lie. |
| `auction-bench.demo.html` · `auction-bench.css` | One page, all ten scenarios, with the gate re-run live at the bottom. |

## Opening the demo

```
cd /path/to/chipandadmarketresearch && python3 -m http.server 8000
```

then

- `http://localhost:8000/docs/p2/auction/auction-bench.demo.html` — the bench, all ten scenarios
- `http://localhost:8000/docs/p2/auction/auction.test.html` — the test bench

Add `?motion=reduce` or `?motion=full` to force a motion mode; the rocker at the top of the demo
does the same without touching any system preference.

Browsers block `fetch` on `file://` origins, and Chrome additionally blocks
`<script type="module">` imports there. Both pages say so plainly and stop rather than
half-rendering.

---

# One apparatus, ten times

The bench is never ten charts. Three zones, and they never move.

```
+----------------------+-------------------------------+------------------+
| INPUTS               | THE ALLOCATION                | THE MONEY        |
| the cast, and every  | which ad holds which slot,    | a permanent      |
| knob the reader's    | what it pays, and the ranked  | readout, and     |
| hand can reach       | queue underneath              | THE BAND under it|
+----------------------+-------------------------------+------------------+
| the note, the captions the record requires, and the arithmetic, line by  |
| line, with the expression behind every figure                            |
+--------------------------------------------------------------------------+
```

A reader learns that frame in sc-01 and reads a change nine more times.

The centre zone has **three forms and no fourth**: `slots` for eight of the ten, `bars` for sc-06,
`plates` for sc-10. A fourth form would be a fourth thing to learn.

**One verb.** Every change the reader makes goes through CRANK — 320ms, with the deliberate 40ms
hold before the output moves. `motion.js` owns the timing and the reduced-motion twin; nothing
here animates anything itself.

## The ten

| # | Scenario | What it teaches |
|---|---|---|
| 1 | `sc-01-pure-bid-misorders` | Ranking by bid alone puts the lower-earning ad on top, whenever the click gap beats the bid gap. The bid gap is 3 to 1 and the click gap is 5 to 1. |
| 2 | `sc-02-quality-weighting-both-metrics` | Quality weighting raises **total** revenue 87% while the average price per click **falls 42%**. The gain is volume, not price. Every retelling that says Google charged more has the sign backwards. |
| 3 | `sc-03-winners-pay-less-than-bid` | Every winner pays below its own bid, and the seller still collects 87% more. The pay-your-bid row is a **frozen-bid counterfactual** and carries that label. |
| 4 | `sc-04-gsp-not-truthful` | GSP is **not** truthful. Vale is worth $10; bidding $10 earns it $400 and bidding $5 earns it $640. The slider is on Vale's bid and the readout is Vale's own money, not the seller's. |
| 5 | `sc-05-equilibrium-band` | **THE BAND.** Same rule, same three bidders, $440 to $760 — a 1.727x spread. The mechanism does not move across it. The bidders do. |
| 6 | `sc-06-first-price-bid-shading-panel` | First price with equilibrium shading pays the seller the same, for every bidder count the record tests. There is no yield mechanism in the rule. Carries the record's required caption. |
| 7 | `sc-07-ctr-misestimation` | The whole gain rests on a click-rate forecast the **seller** makes. Below a true 1.99% the better mechanism earns less than the crude one, and nobody outside could check the number. |
| 8 | `sc-08-reserve-is-a-posted-price` | On a one-bidder query the reserve **is** the price. 100x the revenue, one advertiser, one ad, one reader. The knob story starts in era 6, not 2019. |
| 9 | `sc-09-pricing-knobs-coda` | The three pricing knobs — squashing, format pricing, rGSP. Gamma is an **assumed** parameter and says so wherever it appears. All three controls take their positions from the record's own marked stops. |
| 10 | `sc-10-era-6-vs-era-7-side-by-side` | The two 2019 changes ran in **opposite directions**, on opposite sides of the business. Drawn as two panels, one per surface, each carrying the record's own sentence. |

---

# How THE BAND works

`mechanism.json` ex-3 proves that GSP revenue is not a number. With the same three bidders, the
same two slots and the same rule, the seller collects **$440** at the lowest envy-free equilibrium
and **$760** when everybody bids their value. `simulator-params.json` build note 2 states the
consequence:

> "Every revenue figure the simulator displays must carry the current bidder_mode as a label. A GSP
> revenue number without a bidder_mode is not a number; it is a point inside a 1.727x band (sc-05)."

A caption saying that is a caption. Here it is structural, and the structure is the chart layer's
span-only mark applied to money.

**Four moves make it impossible to print a bare revenue figure.**

1. **`mintReading()` refuses a money figure with no bidder mode.** No default, no "unknown". A
   figure the caller cannot label is a figure the caller may not draw. `readingText(52.58)` throws;
   so does a hand-built object that looks like a minted one, because membership of a module-private
   `WeakSet` is the only proof.
2. **`mintBand()` has no scalar revenue field.** It carries a floor, a ceiling and a marker, and
   each of the three is itself a minted reading with its own mode. A renderer reaching for "the
   revenue" finds three labelled things and has to say which one it means. `'usd' in band` is
   false.
3. **`mintBand()` refuses a marker outside its own floor and ceiling.** See below; this is a
   repair, and it is the most important thing on this page.
4. **Where the record cannot place the band, the band is an object.** sc-01, sc-02, sc-03 and sc-07
   hold the bids fixed and the record never says what those bidders were worth. Without values
   the equilibrium cannot be computed. `unlocatedBand(reason)` returns a documented absence, and it
   refuses a blank reason. The bench draws that absence with the chart layer's own `absenceBlock` —
   the project's stipple, its dashed Iron frame, its colour guard — and prints the reason beside it.
   `DESIGN.md` rule 5: absence is a positive object, never whitespace.

## The clamp, and what deleting it found

The marker used to be clamped into the track in three places: once in sc-04 before minting, once in
sc-06 before minting, and once again in `drawBand` as it computed the marker's x. At sc-04's own
bottom stop the seller collects 100 × $2.01 plus 80 × $2, which is **$361.00**. The money zone
printed exactly that, in the largest brass type on the panel, while the marker sat pinned at $440.
The panel showed two different revenues at once and the band one was fabricated.

All three clamps are gone. `mintBand` now **throws** on a marker outside the band unless the caller
passes `excursion` — a written sentence, refused if blank, exactly as `unlocatedBand` refuses a
blank reason. The bench draws the marker where it really is, opens the drawn domain to hold it,
runs a dashed Rust rule from the end it left, and prints the sentence under the track.

**How much of that a reader can see is a matter of size.** The dashed rule used to be described
here as "a length on the page and not a sentence a reader has to take on trust". The scaling is
honest — the domain opens to hold the marker and nothing is stretched to make a small gap visible —
and honest scaling means a small excursion draws small. Measured on the 268-unit track:

| Excursion | Outside by | The dashed rule |
|---|---|---|
| sc-04, Vale at its bottom stop | $79.00 | 43 units of 252 |
| sc-06, shading at 0.30 | $2.25 | 150 units of 252 |
| sc-04, truthful play with the cent on | $1.80 | **1.2 units — about a pixel** |

So the rule is a second reading of the excursion where the excursion is large, and at sc-04's cent
it is not a reading at all. What carries that case is the sentence under the track and the marker's
own value printed beside it, both of which are always there. The drawn length is never the only
thing saying it.

Deleting the clamps turned up **three reachable excursions**, and two of them are findings rather
than bugs:

| Where | What the mechanism does | Why it is outside |
|---|---|---|
| sc-04, Vale bidding under $2.80 | the seller collects less than $440 | the band's floor is the **lowest envy-free** equilibrium. This profile is still an equilibrium — no bidder can do better by moving — and it is not envy free, because Vale would rather hold slot 1 at slot 1's price. The record's own `ex-3` assumption names the refinement. So $440 bounds the equilibria the record computes, not what the seller can be paid. |
| sc-04, truthful play with the one-cent increment on | the seller collects $761.80 against a $760 ceiling | the record works both ends of this band out with **no increment**. Google's discounter adds a cent to every price, and the cent lands outside. |
| sc-06, shading below 0.60 or above 0.7333 | the pay-your-bid figure leaves the band | the record's sensitivity table stores two shading levels and the slider runs wider than both. Past them the figure is a reading off this page, not off the record — and it says so. |

The first of those was invisible for as long as the clamp existed. The third fires at two of the
record's own named slider stops.

**The drawing.** A track from the floor to the ceiling, in iron, because the track is mechanism.
The marker is a filled brass lozenge with an iron edge, because money is always a filled mark. Each
named stop gets a tick, so the marker reads as one of several places the same rule can land. The
two ends are **named in HTML** rather than in the SVG: both names are sentences about how the
bidders play, and side by side in a 268-unit drawing they collide.

**Every number the band draws is printed at the precision it actually has.** The ends and the stops
used to be formatted with `money(usd, 0)`, which is right for $440 and $760 and wrong for sc-06,
whose band ends are the record's two stored shading levels, $4.50 and $5.50. They drew as "$5" and
"$6". Take shading 0.60, one of the record's own named stops. The money zone printed $4.50 in the largest
brass type on the panel. The band end label directly under the marker printed $5. The ratio label
said "1.222 times wide" while its own drawn ends gave 1.200. The screen-reader sentence carried the
cents and was right the whole time. So a sighted reader and a screen-reader reader were handed
different numbers off one drawing. It fired at 7,001 of the 29,604 positions the two slider
scenarios can be put in.

`readouts.moneyAsMeasured` drops the cents only when there are no cents to drop, and the accessible
name and the drawn labels are now built by that one function, so the two cannot disagree.

**And the sentence now speaks the stops.** A named stop is a tick with a number under it, and
`bandSentence` used to name the two ends and the marker only — so a sighted reader saw three numbers
on sc-05's track and a screen-reader reader was told about two. Section 13 of the test bench redraws
every located band at every named control position, and compares each drawn label against its own
value and against the spoken sentence.

**The interaction.** sc-05's control is a three-position toggle, not a slider — the record is
explicit about that, and each position is a way of playing that the literature names. Move it and
the marker walks the track while the rule stays where it was. sc-04's slider is the same idea from
the bidder's side: drag Vale's bid and watch the marker walk the seller down the band.

The band also appears in sc-09 and sc-10, where the record locates the disclosed knob magnitudes
inside it rather than re-deriving them. A +5.74% rGSP lift walks the market **7.9%** of the way
across a band the rule itself leaves 73% wide. The track carries a note saying the band belongs to
the sc-05 example, because it does.

---

# The gate

BUILD-PLAN.md sets B4 one test: *every number on screen re-derives from `mechanism.json`; the
arithmetic check passes against the live component.* It runs as two checks, and both run on the
demo page and on the test page.

**Check one — the record agrees with itself.** `mechanism.json`'s auction engine stores **123**
machine-checkable steps as `{ expr, expected, note }`. Every `expr` is evaluated here and compared
against its stored `expected`. `tools/verify_p2.py` runs the same check in Python over all 209
steps in the file. Running it again in the browser proves the two languages agree. It also means a
reader sees the arithmetic re-run, rather than a claim that somebody once ran it.

**Check two — the bench agrees with the record.** Every figure a panel puts on screen names the
stored step it must equal. The check runs the live engine at **every control position** and takes
the figure the reader will see. It compares that figure against the value the record's own
expression produces, and not against the stored answer, so a corrupted `expected` cannot launder a
wrong figure. A figure that names no step is reported as `unbacked` and never passed.

**Check two runs over the whole view, not the ledger alone.** It used to take `view.figures` — the
arithmetic table under the instrument. The permanent MONEY zone is `view.readout`, a different
object, and the band's ends, stops and marker are readings too. Neither was ever checked. That is
how sc-04 came to print $361.00 in the till while its band marker sat at $440. `viewFigures(view)`
is now the one list, and the till, the ledger and the band go through one gate against one record.

**Every reading names where it comes from.** `mintReading` requires either a `stepRef` — a stored
expression, which the gate evaluates and compares — or a `derivedFrom`, a written derivation for a
control position the record does not store. Never neither, never both. A derived figure prints its
derivation on screen beside itself, because an escape hatch a reader cannot see is a hole.

**An empty check is a failed check.** `rows.every(...)` is true of an empty array, so a panel that
put three money figures on screen and handed the gate nothing came back green. sc-01 flipped to
bid-times-click-rate was exactly that state. The result now carries `vacuous`, and `ok` is false
whenever not one figure named a stored step.

**Where the bench stands today:** 123 of 123 stored steps are claimed by a figure the bench can
show. Across the 106 control positions the gate sweeps, no figure misses its step, none is
unbacked, and none of the 106 is vacuous. Open `auction.test.html` and read the tally it prints;
the numbers in this file can go stale.

**The gate sweeps the positions the record names, not every position.** Each control contributes its
opening value, its two ends and every stop the record marks. sc-04's bid slider has 800 reachable
positions; the gate visits six. sc-06's shading slider has 7,001; the gate visits seven. Every
figure at an unvisited position is a *derived* figure carrying its own written derivation, so none
of them claims to be filed. That is the design, and it is not the same thing as being checked.

**The evaluator is a parser, not `eval`.** Recursive descent over numbers, `+ - * / **` and
parentheses. `**` is right-associative and binds tighter than unary minus, so it agrees with the
Python that produced the stored values. `eval` and `new Function` are absent from this folder on
purpose. The strings come from a data file, and a data file that can execute code is a different
kind of object from a data file.

---

# What is guaranteed and what is advice

Same two words the library and the chart layer use, used the same way. **GUARANTEE** refuses a
shape or checks a bounded finite record, and throws. **ADVICE** finds some of what is wrong and
never claims to find all of it.

| The rule | Which | What is covered, and what is not |
|---|---|---|
| **The ranker cannot see what really happened** `rankingView` · `deliveryView` · `rank` · `clicksForSlot` | **GUARANTEE** | Covered: a ranking row has **no `trueCtr` key** — not a null, not a zero — and a delivery row has no `bid` and no `quality`. `rank()` refuses any row carrying `trueCtr`; `clicksForSlot()` refuses any row carrying `bid` or `quality`. The row cannot be asked. This is what makes sc-07 a data change rather than a code path. Not covered: a caller who builds row objects by hand. That is a rewrite, in a diff a reviewer reads. |
| **The two click-rate arrays are never merged** `mintCast` | **GUARANTEE** | Covered: a cast with fewer `trueCtrs` than advertisers **throws**. `mintCast` used to fill the gap from `predictedCtrs`, which reads like a kindness and silently makes the seller's forecast equal to what happened — so sc-07, the scenario whose whole subject is the gap between the two, rendered and taught nothing. A scenario that wants them equal now says so, per advertiser, in the frozen record. Not covered: a record that sets `true_ctrs` equal to `predicted_ctrs` when they were not. That is a claim about the world and no code here can check it. |
| **sc-07's truth is sc-07's own** `panels.settingsProvenance` · `ownSetting` | **GUARANTEE** | Covered: sc-07 refuses to run unless its **own** frozen record declares `true_ctrs`. This closes the hole `mintCast` cannot see. sc-07 inherits sc-02, so deleting its one-line `true_ctrs` override hands it sc-02's array — which equals sc-02's `predicted_ctrs`. The seller's forecast becomes what happened, the panel renders **$52.58 with a green gate**, and the scenario about the gap renders with no gap in it. `mintCast` guards the array's LENGTH, and an inherited array is full length; what is missing is not a number but the array's provenance. `settingsProvenance` returns which scenario supplied each setting, and `ownSetting` refuses an inherited one. Not covered: the same substitution written out by hand in sc-07's own record. That is a claim about the world, like the row above. |
| **A money figure carries the mode that produced it** `mintReading` | **GUARANTEE** | Covered: `role: 'money'` with no `mode` throws. A counterfactual with no stated counterfactual throws. A non-finite value throws rather than printing "—". Every formatter refuses an object this module did not mint. Not covered: **the mode is a string, and nothing checks that it is the right one.** A panel that computes naive-truthful revenue and labels it `lowest_envy_free` passes. The arithmetic gate is what catches that, because the figure would miss its stored step. |
| **A figure names where it comes from** `mintReading` | **GUARANTEE** | Covered: a reading with neither `stepRef` nor `derivedFrom` throws, and so does one carrying both. A `derivedFrom` shorter than twelve characters throws, so "maths" is not a derivation. The derivation is printed beside the figure. Not covered: **whether a derivation is true.** It is prose, like the unlocated band's reason. What it does buy is that a figure the gate cannot check is one a reader can see is unchecked. |
| **The band has no scalar revenue** `mintBand` | **GUARANTEE** | Covered: the floor, the ceiling and the marker are each minted readings, and the band object has no `usd` and no `revenue` key. A ceiling under its floor is refused. A stop that is not a minted reading is refused, and so is a stop outside the band it is a stop on. Not covered: a renderer that reads `band.marker.usd` and formats it itself. `readingText(band.marker)` is the supported way and it prints the mode. |
| **The marker is never moved to fit** `mintBand` · `drawBand` | **GUARANTEE** | Covered: a marker outside the floor and ceiling **throws** unless the caller passes a written `excursion`, and an `excursion` on a marker that is inside throws too. `drawBand` no longer clamps the marker's x; it opens its drawn domain instead. So a revenue in the till and a marker on the track cannot be two different numbers. Not covered: **the excursion sentence is prose.** It is refused when blank and never checked for truth. And the numbers on both sides of the band still have to be right — that is the arithmetic gate's job, and the gate now sees them. Also not covered: **how far outside the band a reader can see the marker is.** The scaling is honest, so a small excursion draws small; sc-04's cent excursion is about a pixel. See "How much of that a reader can see" above. |
| **A drawn band label is the number it labels** `drawBand` · `bandEnds` · `moneyAsMeasured` | **GUARANTEE, AT THE CALL SITE** | Covered: the band's ends, its named stops and the excursion marker are formatted by one function that keeps the cents when there are cents. The accessible name is built by that same function and now speaks the stops too, so every number the track draws is a number a screen reader hears, and neither can carry a value the other does not. Section 13 of the test bench redraws every located band at every named control position and compares. Note: the till formats to the cent, so a whole-dollar figure reads `$440.00` there and `$440` on the track — one number, two conventions, and the conventions are per zone. Not covered: **every other number on the page.** The till, the ledger and the cast table each format their own figures, and no guard walks the DOM comparing a rendered numeral against the minted figure behind it. That is limit 7 below and it is unchanged. |
| **An unplaceable band is an object** `unlocatedBand` | **GUARANTEE** | Covered: a blank or throwaway reason is refused, so the track can never be drawn empty with nothing said. Not covered: **whether the reason is true.** It is prose. |
| **A panel cannot pair search with first price** `mintPanel` | **GUARANTEE** | Covered: the surface comes from the scenario's own frozen `mechanism_scope`, and the mechanism comes from `guards.mechanism2019()`, which derives it from `mechanism.json`. There is no literal `"first_price"` or `"rgsp"` in this folder outside a comment. Asking for sc-06 as the search panel throws. `guards.assertScenarioMechanism` then checks the whole rendered object. Not covered: **G7's caption test is containment.** It proves the record's true sentence is on screen and proves nothing about a false one printed beside it. |
| **Every figure re-derives from the record** `checkFiguresAgainstRecord` · `viewFigures` | **GUARANTEE, AT THE CALL SITE** | Covered: each figure is compared against the value its named expression produces, evaluated here. A figure with no step and no written formula is reported and never passed. A step the record does not hold is refused. **A check that saw nothing fails**, and says so in `vacuousReason`. `viewFigures(view)` collects the ledger, the money zone and the band into one list, so a caller cannot check one and skip the others. Not covered: **the caller still chooses what to hand the gate.** `viewFigures` is the one supported way and the test page and the demo page both use it, but a new zone added to the view model without adding it to `viewFigures` would be unchecked. That is a rewrite, in a diff a reviewer reads. |
| **A setting the record carries is never guessed** `engine.setting` · `scenarios.req` | **GUARANTEE** | Covered: every setting either engine or scenario reads is required, and its absence throws naming the setting and the file it comes from. Both layers: the engine's three defaults and the six literal fallbacks in `scenarios.js` are gone, and section 12 of the test bench deletes each one from the frozen record and requires the panel to stop. Not covered: **a setting the record carries and nothing reads.** `format_multiplier` was that for the whole build. `panels.assertNoUnappliedFormatMultiplier` closes the one case found; nothing enumerates the record's settings and asks which have a reader. |
| **The prose lint** `panels.lintRenderedStrings`, carried on `bench.advisory` | **ADVICE** | A regex over English. It returns findings and never throws, and it misses ordinary English — the library's README lists sentences it verifiably misses. **What changed is what it is aimed at.** See the coverage table below. It returns **0 findings** over all 830 strings the bench can render. **That is not a clearance.** The enforcement is `assertSimulatorMechanismScopes()` over the frozen record. |
| **Readability** | **MEASURED, NOT ENFORCED** | The measurement reads the **rendered DOM**, at every scenario and every named stop of every control — see `bench.sentences()` below. Scored on 2026-08-01 with `tools/readability.py` over `allBenchSentences()`: **830 distinct strings, FK 6.67, Reading Ease 79.25, Gunning Fog 9.13, SMOG 8.47**. Over the 414 of them that run to four words or more and read as sentences: **FK 6.08, Ease 79.09, Fog 8.38, SMOG 8.38**. Both are inside the gates of FK ≤ 10, Ease ≥ 50, Fog ≤ 12, SMOG ≤ 12. Earlier figures in this file (FK 4.34, Ease 83.59) came from a prose filter nobody wrote down and are not comparable. The filter is stated now. Nothing in this folder re-runs the measurement. A string added later is unmeasured until somebody re-runs it. |

## Which string surfaces the prose lint reads

The lint used to run inside `mintPanel`, over the object `mintPanel` builds. That object holds six
fields. Everything else a reader meets is written by a human and built later, in `scenarios.js` and
`bench.js`, and **none of it was in front of any guard.**

sc-10's search panel was the case that made this concrete. Thirteen reader-facing strings on that
one panel can carry the false 2019 claim. Writing it into any of them was verified by injection: the
arithmetic gate stayed green, G7 kept passing, every test in the suite passed, and the panel's own
advisory returned zero findings, because the string was never read.

The lint now runs over `domSentences(shell)` — every text-bearing leaf, every SVG `<title>`, every
`aria-label` — after the page is drawn. What it is aimed at is no longer a list anybody maintains.

| Surface | Before | Now |
|---|---|---|
| the panel's `captions`, including the record's `required_caption` | G7's lint, and containment against the record | both, plus the page lint |
| the panel's `id`, `channel`, `mechanism`, `title`, `headline` | G7's lint | both |
| `scenario.teaches` — the sentence in the largest type on the panel | **nothing** | the page lint |
| every control label, option label and control `note` | **nothing** | the page lint |
| `view.note`, the sentence under the instrument | **nothing** | the page lint |
| the band's `note`, its `excursion` and an unlocated band's `reason` | **nothing** | the page lint |
| the plate sentences on sc-10, both surfaces | **nothing** | the page lint |
| every figure's `label`, and every `derivedFrom` line printed beside it | **nothing** | the page lint |
| the centre drawing's accessible name, and every SVG `<title>` | **nothing** | the page lint |
| the cast table, the ledger rows and the scope line | **nothing** | the page lint |

**What is still not covered, and will not be.** The lint is a regex over English and misses ordinary
sentences; `guards.DEAD_MECHANISM_LINT_LIMITS` names two it verifiably misses, and the demo page
prints them beside its findings. Widening the regex is the move that never terminates. The
enforcement lives where the thing being checked is bounded: `assertSimulatorMechanismScopes()` over
21 frozen scenario records, which cannot express `{ rule: "first_price", surface: "search" }`.

**And it covers one claim, not all claims.** The lint knows about the 2019 dead-mechanism error and
nothing else. Every other false sentence a human could write into any surface in the table above
still reaches the reader with no guard in the way. Section 14 of the test bench holds sc-10's seven
string sources as named cases, so at least those are read by something on every run.

## What a reader can still see that the record does not carry

Written plainly, because "no renderer currently reads it" is a latent hazard and not a guarantee.
Every item here is now *visible on screen* rather than merely known here, which is the change.

1. **Nineteen figures are worked out on this page rather than stored.** Each one prints
   `where this comes from: …` under itself and each appears in the ledger in italics. The gate
   counts them and the demo page prints the count. Where they are:

   | Scenario | What is worked out here |
   |---|---|
   | sc-04 | the seller's take and Vale's own money, at any bid other than $10 or $5 |
   | sc-06 | pay-your-bid at any shading other than the equilibrium and the record's two stored levels |
   | sc-07 | everything except at a true 1%, plus the price per click at *every* position — the record does not store this bench's price per click at break-1's rates |
   | sc-08 | the click count and the price per click. The record stores the two revenue figures and the ratio, not the count behind them |
   | sc-09 | revenue and clicks at any gamma other than 1 and 0.5, and the format index at none and one launch |
   | sc-10 | the 5.74% search figure, read off the record and derived from nothing |
2. **Three excursions put a marker outside the band.** Listed in full above. Each is drawn where it
   really is, connected to the band by a dashed Rust rule, and explained in a sentence under the
   track.
3. **`band.marker.usd`, and every minted figure's `usd`.** That is the design — the number has to
   reach the screen somehow. The guarantee is that the *label* travelled with it. Print through
   `readingText` and `readingQualifiers`, which is what `bench.js` does.
4. **The engine's raw result.** `runAuction` returns `revenue`, `clicks` and `avgPricePerClick` as
   bare numbers. They are wrapped by `moneyReadout()` in `scenarios.js` before they reach a
   readout. A new scenario that skips the wrapping gets no mode label, and no guard will say so.
   `bench.js` calls `readingText`, which throws on anything unminted, so the panel fails loudly
   rather than quietly.
5. **The record's own stored `expected` values.** A handful of figures are read straight off
   `expected_output` in `scenarios.js` — sc-06's frozen-bid trap, and sc-10's two panels — rather
   than re-derived. Each of those figures still names a stored step or a written derivation. The
   step-backed ones are checked against the arithmetic, so the record's own `expected` cannot
   launder a wrong one.
6. **The band ends in sc-06 are a sensitivity table, not an equilibrium.** $4.50 and $5.50 are the
   record's two stored shading levels. They are drawn with the same track as sc-05's equilibrium
   band, which is a real ambiguity: one track means "the mechanism can land anywhere in here" and
   the other means "the record measured two points". The unit line says `per sale, three bidders`
   and the end labels name the shading, and that is all that separates them.
7. **No guard compares a rendered number against the minted figure behind it.** `bench.sentences()`
   reads the DOM, and the prose lint now reads it too — but both read it for *text*. The one
   exception is the band: section 13 redraws every located band and matches its labels back to its
   readings. Nothing does that for the till, the ledger or the cast table. Every other arithmetic
   guarantee fires at a call site. This is the library's widest limit and it applies unchanged two
   layers up.
8. **The prose lint covers one claim.** It knows about the 2019 dead-mechanism error. Any other
   false sentence written into any of the ten surfaces in the coverage table above reaches the
   reader with nothing in its way. The surfaces are read by *something* now; they are not checked
   for truth.
9. **A control position the record does not name is still reachable.** The gate sweeps 106 named
   positions — each control's opening value, its ends and its record-named stops. sc-04's bid
   slider alone has 800 positions and sc-06's shading slider has 7,001. Every one of them renders,
   and every figure at one of them is a derived figure printing its own derivation, so nothing
   there claims to be filed. But no gate visits them. The band-label sweep in this round did visit
   all 29,604 and found nothing; that sweep is not in the test bench, because it takes minutes.
10. **A setting the record carries and nothing reads.** `format_multiplier` was exactly that for
   the whole build, and it took a deletion experiment to notice. One case is closed by name. There
   is no check that walks the record's settings and asks which of them has a reader.

---

# Decisions a reviewer should see

**The increment on the squashed rule.** `mechanism.json` ex-5 states squashing as
`p = b_next * (q_next / q_own)^gamma`, with no increment, and its stored step prices Aster at
`2.82842712474619` rather than `2.83842712474619`. The engine is general and takes the increment
from the scenario; **sc-09 passes `bid_increment: 0`**, in one place in `scenarios.js`, beside the
step it cites. At gamma 1 that makes each price on sc-09 read a cent under sc-02, and the panel's
own note says so rather than leaving a reader to wonder.

**The price cap.** Prices are capped at the advertiser's own max CPC everywhere, as in the deployed
product (build note 3). Under quality-weighted second price that cap can only bind through the
increment or a format multiplier: the winner's own AdRank is at least the runner-up's, so the
runner-up's AdRank over the winner's quality is at most the winner's bid. No cap binds anywhere in
the frozen scenarios. The cap is here because the deployed rule had one.

**rGSP is not simulated.** The exact pricing rule was never published. `mechanism.json` ex-7 says so
and locates the disclosed magnitudes inside the ex-3 band rather than re-deriving them. This engine
does the same: `rgspBand` marks which candidates the record says may swap, and no revenue figure
anywhere is derived from a shuffle.

**Format pricing moves an index, not this cast's prices.** ex-6 measures format pricing on revenue
per thousand queries, so sc-09's format knob moves a revenue-per-thousand index bound to ex-6's
steps. It does not multiply the three-advertiser cast's prices, because the record does not.

The knob's three positions are now the record's own `format_multiplier.marked_stops`: `1.0`,
`1.075`, `1.2422968749999999`. The number of launches behind each one is derived from the record's
own per-launch durable uplift. So the label a reader reads and the index the panel prints come from
the same place. The control used to be a typed list of launch counts, and the record's control block
was read by nothing at all. `1.075**4` is a stored step and stays in the ledger as a figure. It is
not a position on the control, because the record's slider range stops at three launches.

**Nothing here has a default, at either layer.** `runAuction` used to default the position
multipliers to `[1.0, 0.4, 0.15, 0.06]`, the increment to `0.01` and the reserve to `0.01`. Each of
those is exactly what the record carries for sc-01, sc-02 and sc-03. Delete any one of them from
`simulator-params.json` and the bench rendered the record's exact numbers anyway, with a green gate.
Six malformed inputs would have rendered authoritatively and nothing would have said so.

**And the same defect was sitting one layer up, in `scenarios.js`, in six more places.** Every one
of these was a literal equal to what the record holds:

| Where | The literal | What deleting the setting used to do |
|---|---|---|
| sc-06 | `n_bidders \|\| [2, 3, 5, 10]` | rendered, green gate, 18 figures checked |
| sc-08 | `reserve.compare \|\| [0.01, 1.0]`, twice | rendered, green gate, 6 figures checked |
| sc-09 | `gamma.default != null ? … : 1.0`, twice | rendered, green gate, 31 figures checked |
| sc-09 | `gamma.marked_stops \|\| [1.0, 0.5, 0.0]` | rendered, green gate, 31 figures checked |

A fallback that equals the record is not a fallback. It is a second, unversioned copy of the
record, kept in a source file, where nobody looks for data. All six are gone. `req()` in
`scenarios.js` throws the way `setting()` in `engine.js` does, and section 12 of the test bench
deletes each setting in turn and requires the panel to stop.

**One exception is left and it is stated where it sits.** The reserve is only required on a slot
with no runner-up, because that is the only branch where the reserve *is* the price (sc-08).

**`formatMultiplier` used to be a second exception, on a false premise.** The README defended its
default of `1` by saying the record does not store the number. The record stores it:
`format_multiplier: 1.0` on sc-01 and on sc-02, and a whole control block on sc-09. So the default
was right by luck, in exactly the sense the paragraph above condemns — and no scenario ever passed
the setting, so changing the record's `1.0` to `1.25` would have changed nothing on screen. The
engine no longer has the parameter, and `runAuction` throws if it is passed one.
`panels.assertNoUnappliedFormatMultiplier` refuses a record that asks for a multiplier this engine
will not apply, rather than reading past it.

**A second settings resolver exists, and here is why it is safe.** `guards.js` resolves
`inherits` for its own job — scanning settings for a first-price rule. `panels.js` resolves it to
compute. Both being wrong the same way is the risk. The arithmetic gate closes it: a wrong
resolution would put wrong numbers into the three inheriting panels and every figure in them would
miss its stored step.

**The cast names are read, not typed.** `castNames()` pulls them out of `mechanism.json`'s own
setup blocks. `break-2` names its single advertiser in a sentence, so a narrow reader pulls it from
that sentence. If that wording ever changes, the panel falls back to a plain description. A missing
name is never a reason to invent one.

---

# `bench.sentences()` — what it covers

`bench.sentences()` **reads the rendered DOM**: every text-bearing leaf, every SVG `<title>`, every
`aria-label` on a drawing, in document order and de-duplicated. On a single scenario it returns
about 90 to 105 strings.

It used to return a list `paint()` pushed to as it drew, which reached 99 strings while the
rendered panel held 569 — and the README named that list as what the readability measurement and
team B8 read. A hand-kept list of "everything" is a list of what somebody remembered, which is the
one shape this project has learned not to trust.

`allBenchSentences()` sweeps all ten scenarios **and every named stop of every control**, which is
830 distinct strings. The old sweep visited each scenario at its opening position only. Every note
behind a rocker, and every sentence that appears only off the record's own stop, sat outside the
measured set. `bench.narratedSentences()` still returns the old draw-time list; it is a subset and
it is named as one.

**This is also what the prose lint reads**, on every paint and over the whole sweep. See the
coverage table above for which surfaces that reaches and which claims it can say anything about.

---

# Still open for the teams behind B4

- **B8's authored alt sentences.** Every sentence this bench emits is generated at draw time and
  stamped `data-alt-source="generated-by-chart"`, exactly as the chart layer does, which is how B8
  finds all of them later and replaces them with the authored ones from the data layer.
- **The readability measurement is a snapshot.** Nothing in this folder re-runs it. A string added
  later is unmeasured until somebody extracts the set again and runs `tools/readability.py` over it.
- **A rendered number is compared to a minted one in exactly one place.** Section 13 does it for the
  band, because that is where the two disagreed. `sentences()` proves the rest of the bench can be
  read as text; it does not prove the text agrees with the arithmetic. A guard that walked the DOM
  and matched every brass numeral back to a minted figure would close the last gap between the gate
  and the page.
- **The full slider sweep is not in the test bench.** The 29,604-position sweep that found the band
  label disagreement lives in a scratch script, because it takes minutes to run. Section 13 sweeps
  the named stops only. A defect that appears at a position no control names and no stop marks
  would not be found by anything that runs on the test page.
- **The bidder mode is a label, not a proof.** `mintReading` guarantees a mode is present, never
  that it is the right one. The arithmetic gate is what catches a mislabelled figure, and only
  where the figure names a step.
- **The D-series is not built.** `simulator-params.json` holds eleven distribution scenarios,
  D1–D11. They belong to the Door Bench (team B5) and share the frozen record but not this
  instrument — `simulator-params.json` build note 11 forbids putting the auction engine's
  per-thousand-impression figures on the same axis as the distribution engine's filed dollars.
