# `docs/p2/door/` — the door bench

Team B5 (`p2-ad-market/BUILD-PLAN.md`). Direction: **The Bench** (`p2-ad-market/design/DESIGN.md`,
locked 2026-07-31). Light mode only. The component is `OPEN-PROBLEMS.md` Option 1A, chosen over the
sealed plate.

Google won search advertising twice. It built a better auction, and it paid other companies to make
Google the search box people met first. `../auction/` covers the first half. This folder covers the
second, and most readers have never heard it.

Plain ES modules. No build step, no bundler, no third-party dependency, no network request beyond
the frozen JSON the page reads from this repository.

| File | What it is |
|---|---|
| `wheel.js` | **THE WHEEL, AND THE RIVAL'S HAND ON IT.** The file the component was decided on. Six notches read from the record, each carrying the denominator it is a share of; a rival that bids on its own; and a settlement type no caller can forge. No DOM. |
| `figures.js` | Every figure that reaches a reader. A share has no scalar form; an illustrative figure names what is invented; a figure off the wheel carries the settlement that produced it. |
| `engine.js` | The distribution arithmetic. The exposure, the three cups, the rival's budget, and the guards on build notes 8 and 10. No defaults anywhere. |
| `gate.js` | The arithmetic gate over `engines.distribution` and the five cross-engine reconciliation steps — and **not** over `engines.auction`, which is build note 9 made structural. |
| `drawing.js` | The two lanes, the hinged door, the valve, the three cups, the stippled pipe — and **the drum, which is the control**. The rival's hand, and a resting trace of the notch it opened on. Three centre forms and no fourth, each taking a minted plan and refusing an object literal. Imports no colour token. |
| `scenarios.js` | The eleven stops, in three acts, and `mintStop` — which is where G7 checks each one against the frozen record. |
| `bench.js` | The apparatus. Three fixed zones plus the drum's own row across the top, two verbs, and **the gate, run on every paint before the DOM is touched**. |
| `door.test.js` · `door.test.html` | The bench's own bench. **The page prints its own tally; trust that over this file.** |
| `door-bench.demo.html` · `door-bench.css` | All eleven stops, with the gate re-run live at the foot. |
| `wheel.demo.html` | The wheel on its own, live and then driven step by step. Its own test page, because the whole component turns on it. |

## Opening the pages

```
cd /path/to/chipandadmarketresearch && python3 -m http.server 8000
```

then

- `http://localhost:8000/docs/p2/door/door-bench.demo.html` — the bench, all eleven stops
- `http://localhost:8000/docs/p2/door/wheel.demo.html` — the wheel, and the hand that is not yours
- `http://localhost:8000/docs/p2/door/door.test.html` — the test bench

Add `?motion=reduce` or `?motion=full` to force a motion mode. Browsers block `fetch` on `file://`
origins, and Chrome additionally blocks `<script type="module">` imports there; every page says so
plainly and stops rather than half-rendering.

---

# THE REQUIREMENT THIS COMPONENT WAS BUILT TO MEET

`DESIGN.md`, problem 1:

> A wheel tells the reader that Google set the take rate. The record says the opposite — the rate
> was an auction outcome, and partners bid it up and back down. The proposal answered with three
> printed guards. That answer is not good enough here, because this project's whole argument is that
> a picture beats a caption, and a caption cannot win against a gesture.
>
> **Requirement:** the fact that partners bid the rate must be a percept, not a label.

The adversary's question is one line: **does a first-time reader believe THEY set the rate?** If
yes, this component has failed however well it runs.

No function can answer a question about a person. What the code can do is refuse every state in
which the answer would certainly be yes, and that is what `wheel.js` does.

**Read "SETTING A PRICE IS DEAD. WATCHING A NEGOTIATION IS ONLY HALF ALIVE." below before you read
the rest of this file.** It is the adversary's verdict after 37 replayed attacks, all of which now
fail, and it holds the eight things this component does not do. Everything between here and there is
the half that works.

## THE DRUM IS THE CONTROL

This is the repair the last round demanded, and everything below it depends on this being true.

The reader **grabs the drum**. There is no slider anywhere else on the page. The resistance, the
hard stop, the ground the rival holds, the ceiling post and the rival's own hand are all in the same
object, at the same moment, under the reader's fingers.

**What this replaces, and why it failed.** The wheel used to be a plain range input in the LEFT
column under a heading. The drum and its answer were 421 units lower and in the CENTRE column. With
the drum centred in a 1009px viewport the slider sat at y = -42. **There was no scroll position at
which both were on screen.** The gesture and the answer to it could never be seen together — and the
answer is the whole component. Under the slider sat this caption:

> This wheel is not yours alone. The rival has a hand on it, and the shaded ground is where its
> standing bid already beats you.

That is the printed answer `DESIGN.md` rejected, placed at the exact point of contact. It is gone,
along with the control it sat under.

**The keyboard is the same object.** The drawing itself carries `role="slider"` and `tabindex="0"`.
Arrows, Home and End turn the same drum through the same `turnTo`. There is no second control to
keep in step, because there is no second control.

**Measured.** See "Where the hand is, and where the answer is" below for the numbers.

## The five mechanics, seen rather than read — and the fifth is not on this bench

**1 · The wheel opens where the rival put it.** Not at a default and not at zero. It opens one notch
above the rival's standing bid, because a lower share loses the door. The first number the reader
meets is already somebody else's doing, and the opening sentence says whose.

**2 · Turning it down does not work, and it does not merely refuse.** The grip travels to the notch
the reader asked for. The door on the drawing swings to the rival and the lower lane empties. Then
the wheel comes back — and a **ghost grip** stays at the notch the reader reached for, with the
return arc drawn between them. That is the "it moved and was pushed back" percept, and it is legible
with no motion at all, which is what reduced motion gets.

**And the door comes back.** The swing is an event with a length, not a state. It used to swing on a
refusal and stay swung. It survived the reader leaving the stop and coming back, while the three cups
went on filling from the lane the same drawing called empty. Four things close that.
`wheel.rest()` ends the event. `bench.js` schedules it. Entering a stop rests the wheel first. And
`rivalPressureFaults` refuses any resting state that still has the door to the rival.

**3 · Turning it up moves the rival.** Every raise is answered: the rival bids one notch higher, on
its own, and the shaded ground on the drum grows by a notch — under the reader's own grip. Ground the
reader gives up does not come back. After two moves the only notches left are the three the record
actually contains — 84 per cent, 85 per cent, 91 per cent — and the reader picked none of them.

**And the picture keeps where its hand started.** Once the rival has moved, a hollow pawl stands at
the notch it opened on and a dashed rule runs from there to where it is now. That trace is in the
**resting** drawing, with no motion and no timer, which is the one thing the transient trail could
not be. See limit 2.

**4 · The rival's hand comes off at its own ceiling, and that is the whole asymmetry.** It cannot
bid past what a search earns it less what it costs to answer. Above that the reader is alone on the
wheel. The printed line says the ceiling is an **invented** number (build note 8), so even the
freedom the reader has up there rests on an assumption rather than on a filing.

The rival stops for **two** different reasons and they are not one sentence. It stops at its own
ceiling. It also stops one notch under the reader, because it never bids past the hand it is
answering. Both used to print "it cannot pay more than it earns". That is true of the first and false
of the second: at 64 per cent against a ceiling of 83.3 the rival could pay a great deal more, and
the drawing said it could not.

**5 · And a state where the reader has no hand on it at all — WHICH IS NOT ON THIS BENCH.**
`tac_series` holds the disclosed payout ratio for six years. In `filed` mode the pointer walks
91 → 84 → 79 → 75.4 → 78.5 → 78.7 with the control gone and the year printed. The ratchet goes up and
comes back down. That is break B4's own sentence, and the number moves six times without the reader.
`turnTo` throws in that mode, because giving the wheel back there would say the buyer chose the
ratchet.

**Read the second half of that heading.** No stop declares `wheel: 'filed'`. D5 and D6 are both
`contested`, and the filed walk is built only by `wheel.demo.html`. So this mechanic exists, is
tested, and **a reader of the bench never meets it.** It is limit 7 below. The four mechanics above
it are the four a reader actually gets.

## Two verbs, and the second one is the point

The reader's move is **CRANK** — 320ms with the 40ms hold, the verb every machine in this project
uses for a change the reader made.

The rival's move is **TRAVERSE**. A different verb, on purpose. TRAVERSE is the object-constancy
move — the same pawl, now somewhere else — and it leaves a trail showing where it came from. In
reduced motion the trail is *required* by `motion.js` and the ghost stands for three seconds, so the
rival's advance is legible with no motion at all. A reader who has learned that CRANK means "you did
that" gets a visibly different verb the moment something else moves the wheel.

**Both trails end, so the drawing keeps a third one that does not.** TRAVERSE runs 700ms with a
200ms trail in full motion, and 120ms with a 3,000ms ghost and trail in reduced. Then the picture is
back to a triangle sitting somewhere. So the resting drawing carries a hollow pawl at the notch the
rival opened on, and a dashed rule to where its hand is now. That is the static form of the same
claim, with nothing to wait for and nothing to miss. It is drawn outside the pawl group, because
`motion.js`
transforms that group and a trace inside it would travel with the hand it exists to contrast.

**And the reader never sees CRANK on the wheel.** The two wheel stops declare no left-column control,
and turning the drum passes no cause to `paint`, so CRANK does not fire there. The contrast is
carried across stops rather than within one. That is limit 8.

## The six notches, where each is read from, and WHAT IT IS A SHARE OF

Nothing in `wheel.js` is a literal. A missing source is a throw, never a default.

| Value | Whose | Grade | Read from | A share of |
|---|---|---|---|---|
| 58.0% | the rival's | A | `mech-ovt-001.central` — the rival's own FY2002 payout | the rival's own revenue |
| 64.0% | the rival's | A | `mech-ovt-001.ci80[1]` — its guidance for the next quarter | the rival's own revenue |
| 83.3% | the rival's ceiling | **invented** | D5's `rpm_rival` and `serving_cost_per_1k`, which build note 8 flags as made up | what a thousand searches earn the rival |
| 84.0% | filed | A | `tac_series` 2003 `tac_pct_network_revenue` — below the reported share, which dates the guarantee's expiry | what the partner pages earned that year |
| 85.0% | reported | **B** | `variables.revenue_share_s.default`. The contract was never filed | what the partner pages earned that year |
| 91.0% | filed | A | `tac_series` 2002 `tac_pct_network_revenue` | what the partner pages earned that year |

Two are the rival's filings, one is an invention, two are the buyer's filings and one is a rumour.
They are not the same kind of number, and the drawing does not pretend they are.
`notchPhrase(settlement)` says which kind the wheel is sitting on **and which denominator it is a
share of**. The grade-B notch is ticked with a dashed rule.

### The denominator, and the citation that had the wrong one

The 91% and 84% notches used to cite `mech-tac-001`. That claim's own calibrated quantity is **28.1%
of Google ADVERTISING revenue in 2008**. The notches are a percent of **NETWORK** revenue. The
numbers were right and the citation was a different quantity — break B9 happening inside the guard
against break B9, in the one place on this bench where a share is drawn rather than printed.

So a notch now carries three fields: the named denominator out of a closed set, the key that selects
it, and the field of the record the number is read from. A guard runs inside `readNotches` on every
load, and its rule is one line. **A notch may cite a claim only where the claim's own unit names that
notch's denominator.** Two notches cite `mech-ovt-001` and pass, because its unit reads
"% of Overture revenue paid out as traffic acquisition cost". The other four cite the table and the
variable they are actually read from, which is where their numbers always came from.

The 85% notch lost its citation for the same reason: `mech-aol-001` is calibrated in **USD millions
on the guarantee**, not in per cent on the share. The share is a sentence inside that claim's
statement, and it is carried as a variable.

`door.test.js` puts the old citation back and watches the guard throw, and it does the same for a
claim cited behind the invented ceiling — which no claim calibrates at all.

---

# The eleven stops, in three acts

The record files these as D1 to D11 and its own numbering runs from the deal outwards. A reader
meeting this bench has never seen the machine, so the machine goes first and the deal comes second.

| # | Record | Act | What it teaches |
|---|---|---|---|
| 1 | D4 | the two lanes | 95.5 cents of one dollar and 21.3 cents of the other, in 2008. The middle cup is the same height in both lanes. |
| 2 | D5 | the two lanes | The most anyone can pay for the door is what a search earns them less what it costs to answer. **The wheel.** |
| 3 | D6 | the two lanes | At the ratio the buyer actually booked in 2002 the last cup goes below zero. |
| 4 | D9 | the two lanes | The stippled pipe. The strongest defence of the whole arrangement has no public measurement. |
| 5 | D1 | what the door cost | The guarantee was bigger than the company, and out of the money inside eighteen months. **The band with no middle.** |
| 6 | D2 | what the door cost | The clause that voids it. The door swings shut and the lower lane empties. |
| 7 | D10 | what the door cost | $11.9m to $15.7m, not $100m. The accounts bracket a contract nobody ever filed. |
| 8 | D3 | what the door cost | The warrant moved about eleven times the cash, and it cost most where the buyer won. |
| 9 | D7 | what it bought | One numerator, three denominators, three correct answers. And a split that is never a point. |
| 10 | D11 | what it bought | About $1.98bn moved, about $297m stayed. |
| 11 | D8 | what it bought | Same rate, inverted composition, forty times the money. |

## Three centre forms and no fourth

| Form | Stops | What it is |
|---|---|---|
| `machine` | D4 D5 D6 D9 D2 | Two lanes, the hinged door, one rule box, the valve, three cups on one baseline. |
| `bars` | D10 D3 D7 D11 D8 | Filed dollars on one baseline, each bar naming its own base under it. |
| `curve` | D1 | The exposure band, drawn twice and never once down the middle. |

A fourth form would be a fourth thing to learn.

## What the machine says before a word is read

Two lanes go in. One starts on the buyer's own page. The other starts on somebody else's and has to
come through a **door**. Both run through **one** rule box — the auction does not know which lane a
search came down, and drawing one box rather than two is the whole of that sentence. Only the lower
lane passes a **valve**, and the valve taps most of the money straight back out.

Three open cups stand on **one baseline**: what goes back out the door, what answering the search
costs, and what the buyer keeps.

**The middle cup is the same height in both lanes**, and that is not a coincidence the drawing
arranged. The record allocates the cost of answering pro rata to revenue, so cost over revenue is
one number for both sides — 12.31% in 2008, either way. What is left is the door and what the buyer
keeps, and the whole finding is in those two cups.

**A STIPPLED PIPE runs from the lower lane back up to the upper one, inside the rule box, in every
one of the eleven states.** It is break B5. Syndicated inventory is defended on one ground:
that it deepens the advertiser pool, and so raises the price of a click on the buyer's own pages.
Nobody ever measured that. The reader never sees a complete machine.

---

# What is guaranteed and what is advice

Same two words the library, the chart layer and the auction bench use, used the same way.
**GUARANTEE** refuses a shape or checks a bounded finite record, and throws. **ADVICE** finds some of
what is wrong and never claims to find all of it.

| The rule | Which | What is covered, and what is not |
|---|---|---|
| **The revenue share cannot be printed without the hand that moved it** `wheel.settle` · `figures.mintContested` | **GUARANTEE** | Covered: `mintContested` takes a SETTLEMENT and refuses a number. Settlements are minted only by `wheel.js` and recognised by membership of a module-private `WeakSet`, so a caller cannot build one. `settlementPhrase` has five branches and **not one of them names only the reader** — the reader's own raise is reported together with the rival's answer to it, in the same sentence. Section 1 of the test bench reaches all five by doing the thing that produces them. Not covered: **whether the reader believes it.** That is a question about a person and the architect's verdict is the gate on it, not this table. |
| **The rival's pressure is present, and every clause of the check can be fired** `rivalPressureFaults` · `assertRivalIsPresent` | **GUARANTEE** | Covered: seven states are refused — no rival bid; a sentence naming no second hand; a rival whose ceiling is at or below its own opening bid, so its hand can never move; carried reach that disagrees with the rival's bid; ground taken with no reach lost; a resting state with the door still swung to the rival; and a pointer resting inside the ground the rival holds. **Every one of the seven is fired on demand by a permanent row in `door.test.js` section 1b**, because the invariant is a pure function over plain data rather than a method on an object no caller can build. `makeWheel` refuses the record-driven case at construction. Not covered: whether the reader believes it. That is a question about a person, and the architect's verdict is the gate on it. **Read the note below on the version this replaces.** |
| **A share has no scalar form** `figures.mintShare` | **GUARANTEE** | Covered: `mintShare` **takes no `value`**. It takes a numerator and a denominator, each with its own label of at least eight characters, and computes the share here. Passing `value` throws, and `mintLevel` refuses `role: 'share'` outright. So a percentage worked out against one denominator cannot be printed with a different one attached. That is break B9 and build note 9, made structural: the record quotes network share as 31.8%, 30.8% and 9.4% and calls all three correct. Not covered: **whether the denominator's label is true.** It is prose, checked for presence and length. |
| **An illustrative figure names what is invented, and the names are checked** `assertInventedNamesAreSettings` | **GUARANTEE** | Covered: a figure minted under `illustrative: true` must list the invented inputs, and every name must be a key of the scenario's own resolved settings. `{ invented: ['everything'] }` is refused, the same posture `assertDistinguishable` takes on a declared `redundant` channel. Not covered: an invented input the record forgot to flag. `illustrative` is the record's own field. |
| **A figure names where it comes from** `checkProvenance` | **GUARANTEE** | Covered: a figure with neither a `stepRef` nor a `derivedFrom` of at least twelve characters throws, and so does one carrying both. Build note 6 requires the derivation in writing wherever a D-scenario re-derives something the record does not store; the derivation is printed beside the figure on screen. Not covered: **whether a derivation is true.** It is prose. What it buys is that a figure the gate cannot check is one a reader can see is unchecked. |
| **The split the record forbids quoting flat has no middle** `figures.mintSplit` | **GUARANTEE** | Covered: a split carries `lo`, `hi`, and two minted end figures. `'value' in split` and `'central' in split` are both false. There is nothing on the object to average. It also requires a written `because`, since two different rules put a figure into this shape — the record forbidding a flat quote (D7), and G1 refusing a point on a wide interval (D1). **Note that G1 does not apply to D7**: `mech-capture-002` has a ratio of 0.148 and would pass G1 as a point. The refusal there is the record's own required caption, not the library's cut. |
| **The most-quoted number in this story is drawn as a band** `planClaimMark` (from `../charts/`) | **GUARANTEE** | Covered: `mech-aol-001` is "$100m, somewhere between $75m and $150m" — a ratio of 0.75, over G1's 60% cut. `planClaimMark` returns a mark with **no `central` key**, D1 asserts the kind is `span` before drawing, and the exposure curve is drawn from `mark.lo` and `mark.hi` with **no third line between them**. Not covered: the record's own X1 and X2 steps are worked out at $100m. Those figures appear in the ledger, labelled, and the drawing never puts a mark there. |
| **The three cups add up to the dollar** `assertCupsClose` | **GUARANTEE** | Covered: every split on this bench closes to 1 within 5e-9 before the object exists — both lanes, both allocations, and every notch of the wheel. Three lengths on one baseline is a claim that they are the parts of one whole, and a drawing that makes that claim while the parts do not add up lies with its geometry. The kept cup may be negative and is drawn below the baseline rather than clipped at zero. Not covered: nothing here reads the DOM. It checks the numbers the drawing is handed. |
| **The auction engine's figures are not on this axis** `gate.doorSteps` · `assertNotAnAuctionStep` | **GUARANTEE** | Covered: the door's step index is built from `engines.distribution` and the five reconciliation steps only, so a figure citing an auction step is not found. `assertNotAnAuctionStep` then throws with build note 9 in the message, rather than reporting "unknown step" and sending the reader to look for a typo. Not covered: a per-thousand-impression figure typed in by hand with a written derivation instead of a step. That is a rewrite, in a diff a reviewer reads. |
| **Every figure re-derives from the record** `checkFiguresAgainstRecord` · `viewFigures` | **GUARANTEE, AT THE CALL SITE** | Covered: each figure is compared against the value its named expression produces, evaluated here, so a corrupted `expected` cannot launder a wrong figure. **A check that saw nothing fails**, and says so in `vacuousReason`. `viewFigures` collects the money zone AND the ledger into one list, and **a band goes through as two figures** so that neither end escapes. The auction bench's money zone was unchecked for a whole build; that shape is closed here from the start. Not covered: the caller still chooses what to hand the gate. `viewFigures` is the one supported way and the demo, the test page and every sweep use it. |
| **Nothing has a default** `engine.setting` · `ownSetting` | **GUARANTEE** | Covered: an absent setting stops the stop, names itself and names the file it comes from. `ownSetting` additionally refuses a setting supplied by a parent where the scenario has to own it — the shape that made the auction bench's sc-07 render with no gap in it. Five invented inputs across D5, D6, D10 and D11 are checked that way. Not covered: a setting the record carries and nothing reads. |
| **Build note 10 is a guard** `assertFiledTotalsClose` | **GUARANTEE** | Covered: the two filed components must still add to the filed total on the record's own table, in all seven years. `data/eras/era-6.json` derives $410.946m against the filed $410.915m, and the note says the era record is the one that is wrong; if the table ever drifts to it, this bench stops. An empty table is a failure rather than a pass with nothing to check. |
| **The two copies of one claim agree** `assertClaimCopiesAgree` | **GUARANTEE** | Covered: all 31 `mech-*` calibrations are matched by id against `claims.json` and refused if `central` or `ci80` differs. Only `claims.json` carries a verdict, so it is the copy a mark is built from; the engine reads its notches and table figures out of `mechanism.json`. A repair applied to one and not the other is invisible in both. Not covered: a claim whose *statement* drifted. |
| **No verdict is invisible** `stampVerdict` · `assertVerdictsVisible` | **GUARANTEE** | Covered: all 31 distribution claims carry the verdict `post-verification`, not the clean one, so **every mark this bench draws needs a register** and the seal refuses a plan carrying an unstamped one. The bench prints the register under the stop that draws it. Not covered: nothing checks that a reader reads it. |
| **G7, over the eleven frozen records** `mintStop` | **GUARANTEE** | Covered: every stop is checked against `simulator-params.json`, and the nine `required_caption` entries in the D-series reach the screen verbatim. Note what this bench deliberately does **not** do: it declares no `channel` and no `mechanism`, because `default_placement_deal` is marked `ad_auction: false` in the record's own vocabulary — the placement is bought by private negotiation and is not the ad auction that runs on the surface. Setting a channel here would put a contract through a check about which auction runs where. Not covered: G7's caption test is containment. It proves the record's true sentence is on screen and proves nothing about a false one printed beside it. |
| **The three forms will not draw a plan they did not mint** `planMachine` · `planBars` · `planCurve` · `assertPlan` | **GUARANTEE** | Covered: `drawMachine`, `drawBars` and `drawCurve` used to draw whatever they were handed, and a probe caught all three painting with every other guard green — three cups on one baseline summing to 1.6, a negative amount leaving through the door, a span bar carrying `central: 100` on the reported guarantee, and a dot at the exact midpoint of the exposure band labelled "the reported guarantee, $100m". The plans close it on the pattern that closed the same hole in `../charts/`: computed keys refused, a module-private `WeakSet`, the checked copy sealed rather than the caller's object, and `assertPlan` at the top of every draw. The machine re-checks the cup sum on the values the drawing is about to turn into lengths, refuses a negative take, and refuses a printed figure that is not the drawn one. Bars refuse a negative height and a bar taller than its own scale. The curve refuses **any** mark that falls between the two edges of the band. Not covered: a plan that is honest and wrong. The arithmetic gate is what checks the numbers. |
| **The gate runs in the render path** `paint` · `checkFiguresAgainstRecord` | **GUARANTEE, AT EVERY PAINT** | Covered: every figure a stop is about to show is re-derived against the record **before the DOM is touched**, and the stop refuses to draw if any fails. `renderDoorBench` also runs build note 10 and the two copies of the 31 distribution claims at mount. Before this, `bench.js` never imported `engine.js` or `gate.js`: a corrupted record rendered to the reader while the report at the foot of the demo page went red, and a consumer embedding the component got neither guard. `door.test.js` moves every stored `expected` in the record and watches the render refuse. Not covered: nothing here reads the DOM. It checks the numbers the drawing is handed. |
| **A notch may cite only a claim measured on its own denominator** `assertNotchesCiteTheirBasis` | **GUARANTEE** | Covered: every notch declares the denominator it is a share of, out of a closed set, and the field of the record its value is read from. Where a notch cites a claim, the claim's own `unit` must name that denominator. This is the guard that would have caught `mech-tac-001` — calibrated at 28.1% of ADVERTISING revenue — standing behind a notch that is a percent of NETWORK revenue. It runs inside `readNotches`, so it is on every path. Not covered: whether the denominator sentence is true. It is prose, checked for presence and membership of the set. |
| **The prose lint** `lintRenderedStrings`, on `bench.advisory` | **ADVICE** | A regex over English, borrowed from `../auction/panels.js` and pointed at `domSentences(shell)` — every text-bearing leaf, every SVG `<title>`, every `aria-label` on the rendered page. It returns **0 findings** over all 862 strings this bench can render. **That is not a clearance.** It knows about the 2019 dead-mechanism error and nothing else, and it misses ordinary English; `guards.DEAD_MECHANISM_LINT_LIMITS` names two sentences it verifiably misses. The enforcement is `assertSimulatorMechanismScopes()` over the frozen record. |
| **The colour budget** `assertDoorColourBudget` | **GUARANTEE** | Covered: it runs the era machine's own `assertColourBudget()` first — this folder spreads `PAINT`'s attribute bags and imports no colour token of its own — then the one role this folder adds. The take is drawn as a hatch **as its fill**, never as a solid rust area, because Brass against Rust falls to ΔE2000 7.8 under tritanopia. A caller cannot take the colour and leave the hatch, because the hatch is what the colour is. Not covered: the guard reads the paint table, not the DOM. |
| **No control in the left column asks to be the wheel** `assertNoWheelControl` | **TRIPWIRE** | Covered: `buildControl` calls it on every control it mounts, and it throws on `kind: 'wheel'` with the reason the drum is the control. It is called a tripwire rather than a guarantee **because no stop declares one, so it defends a decision rather than catching a live fault** — and because the version before this one could not be fired at all from any public path. It is a pure function over a plain object now, exported, with two rows in `door.test.js` section 1c: one fires it, the other walks the 11 declared controls and asserts all pass. Not covered: a slider mounted by some other means than `stop.controls`. |
| **Readability** | **MEASURED, NOT ENFORCED** | See below. Nothing in this folder re-runs the measurement. |

---

# THE CHECKS THAT COULD NOT FIRE

Two of them, found a round apart. They are the same defect at two scales. The repair is the same
shape both times. **Lift the invariant out of the closure. Make it a pure function over plain data.
Then a test can hand it the bad input.**

## One · the rival guard

This folder shipped `assertRivalIsPresent` as a GUARANTEE in the table above. Its one narrowing
clause read:

```js
settlement.reachOpened <= settlement.reachable.length && settlement.rival.index > 0
```

`reachOpened` is pinned at 5 by `open()`. `reachable.length` is `5 - rival.index`. So the first
operand needs `rival.index <= 0` and the second needs `rival.index > 0`. **The two operands
contradict each other.** An exhaustive sweep of every settlement this wheel can reach fires it zero
times, and the README sold it as a guarantee. That is the sixth time this project has paid for the
same lesson: *a check that cannot fire is worse than no check, because a team stops looking at the
thing it appears to be watching.*

The repair is not a better sentence. Three things changed.

**1 · The invariant left the object, so it can be tested.** A settlement cannot be forged, because
`SETTLEMENTS` is module-private. That is the point of it. But it also means a check written against
a settlement can only ever run on states the wheel already produces. So the invariant is now a
**pure function over plain data**. `pressureState` lifts the fields off a real settlement, and
`assertRivalIsPresent` puts the two together and throws. A test bends one field and watches the
fault appear.

**2 · Every clause is fired by a permanent row.** `door.test.js` section 1b has one row per clause,
nine in all. A row that stops firing is a clause that has gone dead again. The section also asserts
that the OLD clause fires zero times over the sweep, so the defect itself has a regression row.

**3 · One clause is grounded in the record rather than in the code.** Move `rpm_rival` near
`serving_cost_per_1k` and the rival's ceiling sorts to the lowest notch. Its hand is then pinned at
its opening bid for every move the reader can make. Every notch stays reachable, nothing is ever
taken, and the reader has the wheel to themselves under a caption saying they do not. **That
rendered green.** `makeWheel` now refuses it at construction, and the test builds that record and
watches it throw.

## Two · the refusal of a wheel control in the left column

`buildControl` carried a branch on `control.kind === 'wheel'` that threw a long, well-written
explanation of why the drum is the control and a slider would be 421 units above it. **Nothing could
reach it.** `buildControl` is module-private. Every control it can ever see comes off a frozen
`STOPS` entry, and no stop declares a wheel. So the branch was unreachable from any public path, and
no test could show it working. That is the same shape as the clause above, one layer up: a check the
README could point at and nobody could fire.

It is `assertNoWheelControl(control)` now — exported, a pure function over a plain object. It returns
the control it was handed, `buildControl` calls it on every control it mounts, and `door.test.js`
section 1c has two rows. One hands it `{ id: 'revenue_share', kind: 'wheel' }` and watches it throw.
The other walks the 11 controls the eleven stops actually declare and asserts every one passes.

It is a **tripwire**, not a live guard, and the file says so where it is defined. What it defends is
a decision, and the next person reaching for a slider should meet the reason before the diff.

---

# Where the hand is, and where the answer is

Measured 2026-08-01 in Chrome, on `door-bench.demo.html` stop 2, at the widths and heights below.
The drawing is 940 × 262 units and scales with its row.

**The band that has to be co-visible.** The reader's hand runs 12–118 in drawing units: the grip on
the drum at 46–118, and the refusal's return arc peaking at 12. Everything that answers it runs
34–182: the ceiling post from 34, the shaded ground and its hard stop inside the drum, the rival's
pawl at 112–146, and the notch labels dimming out to 182. **One band of 170 units out of 262.** They
are parts of one drawing, so no scroll position can separate them.

Measured on stop 2 in the refused state, which is the state with the most in it.

| Viewport | Drum, CSS px | Scale | Hand, CSS px | Answer, CSS px | Band | Both on screen | Horizontal clip |
|---|---|---|---|---|---|---|---|
| 1728 × 1009 | 940 × 262 | 1.000 | 60–166 | 82–230 | 170 | yes | 0 |
| 1512 × 945 | 940 × 262 | 1.000 | 60–166 | 82–230 | 170 | yes | 0 |
| 1440 × 900 | 940 × 262 | 1.000 | 60–166 | 82–230 | 170 | yes | 0 |
| 1280 × 800 | 940 × 262 | 1.000 | 60–166 | 82–230 | 170 | yes | 0 |
| 1200 × 700 | 940 × 262 | 1.000 | 60–166 | 82–230 | 170 | yes | 0 |
| 1024 × 640 | 870 × 243 | 0.926 | 60–158 | 80–217 | 157 | yes | 0 |
| 900 × 560 | 761 × 212 | 0.810 | 58–144 | 76–196 | 138 | yes | 0 |
| 768 × 420 | 645 × 180 | 0.686 | 57–129 | 72–173 | 117 | yes | 0 |
| 1440 × 320 | 940 × 262 | 1.000 | 60–166 | 82–230 | 170 | yes | 0 |
| 1440 × 240 | 940 × 262 | 1.000 | 60–166 | 82–230 | 170 | yes | 0 |

**The height that matters is 230px.** With the wheel's row at the top of the viewport the answer's
last pixel sits at 230. Every viewport taller than that shows the hand and the answer together, and
the shortest one tested was 240.

**The 91 per cent notch.** It is the endpoint of the ratchet and the whole destination of the third
mechanic, and it used to be clipped on every laptop: a 940px `min-width` inside `overflow-x: auto`
hid 132px of an 812px centre column at a 1728px window. The wheel now has **a row of its own across
the whole frame**, and it scales to that row rather than scrolling inside it. The last notch sits at
x = 828 of 940. Measured horizontal clip:

| Viewport width | 1728 | 1440 | 1280 | 1200 | 1024 | 900 | 768 | 740 | 720 | 690 | 670 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Clipped px | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 17 | 44 | **61** |
| 91% notch reachable without scrolling | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | **no** |

**Zero horizontal scroll at 740px and above. The 91 per cent notch stays on screen down to 690px.**
Below that the drum hits its 620px legibility floor and the row scrolls, which is the phone reduction
`OPEN-PROBLEMS.md` predicted of this option and the section at the foot of this file still names.

**The gesture survives the repaint it causes.** Every notch a drag crosses repaints the bench and
replaces the drum. The first build of this rebuilt the wheel's *host* too. So the move handler
measured a detached node, got a width of zero, and stopped turning. The drum came loose in the
reader's hand at the first notch they crossed — the first moment the rival pushes back. One host now
lives for the life of the bench and is emptied rather than rebuilt. The drag listens on `document`
and re-resolves the live drum on every move. A permanent row drags across four notches and asserts
the wheel turned at each.

## THE NUMBERS ABOVE ARE THE WHEEL'S OWN BAND, AND THAT IS NOT THE WHOLE STORY

Everything in that table is measured inside one drawing, which is why no scroll position can pull it
apart. **The door is not in that drawing.** The door is in the machine, in the centre column, and it
is the single piece of ink on this bench that says without a word that somebody else took the thing.
Measured on the same page, on stop 2, in the refused state:

| Viewport | Grip bottom → door top | Grip top → door bottom | Wheel row top → door bottom | Both on screen |
|---|---|---|---|---|
| 1728 × 1009 | **382px** | 541px | **636px** | yes |
| 1512 × 945 | 382px | 541px | 636px | yes |
| 1440 × 900 | 382px | 541px | 636px | yes |
| 1280 × 800 | 382px | 541px | 636px | yes |
| 1440 × 636 | 382px | 541px | 636px | yes, exactly |
| 1440 × 600 | 382px | 541px | 636px | **no** |
| 1200 × 700 | 656px | 823px | 918px | **no** |
| 1024 × 640 | 630px | 784px | 875px | **no** |
| 900 × 560 | 631px | 777px | 862px | **no** |
| 768 × 420 | 613px | 750px | 830px | **no** |

**636px is the viewport height at which the whole wheel row and the door are on screen together.**
Below 1200px the frame drops to one column and the settings zone lands between the drum and the
drawing, so the gap grows to 613–656px and no laptop height shows both. The three-column layout is
what makes 382px possible at all.

---

# SETTING A PRICE IS DEAD. WATCHING A NEGOTIATION IS ONLY HALF ALIVE.

That is the adversary's verdict after the round that closed the last of 37 replayed attacks, and it
is the honest summary of what this component does.

The first half is done. No state of this drawing leaves the reader as the only hand on the wheel. No
path prints a figure off the wheel without the sentence naming the hand that answered. And every
clause of the seven-clause pressure guard can be fired on demand. A reader who comes away thinking
they set the revenue share has to work at it.

The second half is partly done. `DESIGN.md` asked for the partner bidding to be a **percept** rather
than a label, and the percept is real but thin. Eight limits, written down because the specific way
this project has been hurt six times is a README claiming more than the code delivers.

### 1 · THE INK ALONE DOES NOT NAME THE SECOND PARTY

Strip every word off the drawing and what remains is a drum, a grip, a growing dead zone and a hard
stop — the vocabulary of a GOVERNED CONTROL, not of another agent. The reader mark is a graspable
grip; the rival mark is a triangle drawn in the same iron stroke as the hard stop. One agent is
encoded in ink, the other in the word "rival". `DESIGN.md` asked for the partner bidding to be a
percept and not a label; that is roughly two-thirds met, and the last third is carried by a word in
six places.

Counted on the rendered drum: six distinct strings carried the word before this round, in the held
ground's title, the ceiling post's label, the ceiling post's title, the notch tier under three
notches, the pawl's title and the settlement readout. It is **seven** now, and the seventh is the
accessible name of the new resting trace described under limit 2 — a spoken-layer string, where a
word is the only channel there is.

### 2 · THE STRONGEST SECOND-PARTY PERCEPT IS TRANSIENT

The TRAVERSE trail — the same pawl in two places with a dashed arc between — is the one moment the
ink genuinely carries another hand, and it is gone after about three seconds, even in reduced motion.
The picture a reader looks at for most of the session is the resting one, which has no trail and no
ghost.

**That was true, and this round took the cheap half of the fix.** `motion.js` gives TRAVERSE 700ms of
travel plus a 200ms trail in full motion, and a 120ms crossfade plus a 3,000ms ghost and trail in
reduced. Both end. So the trail now has a **resting form that does not**: a hollow pawl stands at the
notch the rival opened on, and a dashed rule with an arrowhead runs from it to where the rival's hand
is now. Same iron, same two-places-one-object grammar, no motion and no timer. It is drawn outside
the pawl group so TRAVERSE cannot carry it away with the hand it exists to contrast.

**What the repair does not close.** A static rule between two marks is weaker evidence of an agent
than watching one move. It is also drawn only once the rival has moved. At the opening there is
nothing to trace, which is correct — and it means the first picture a reader meets still has one hand
in it. It exists in `contested` mode only.

### 3 · THE DOOR IS 382px BELOW THE GRIP

The door is the single piece of ink that unambiguously says somebody else took it, and it needs a
636px viewport to be co-visible with the hand. At 600px a reader turning the drum cannot see the door
swing at all. The co-location numbers in the README are the wheel's own internal band and are not the
whole story.

Measured, and the table is in the section above. 382px from the bottom of the grip to the top of the
door. 636px from the top of the wheel's row to the bottom of the door, which is the height at which
both are on screen. At 600px the row and the door do not both fit.

**The exact form of it.** The grip alone and the door span 541px, so at 600px a reader who scrolls
until the grip's top edge is the top edge of the viewport can hold both. That is not a real reading
position: it puts the row's own label off screen and leaves the drum against the top bezel. The
object the reader is holding is the row, and the row plus the door is 636px. Below the 1200px
breakpoint the layout stacks, the settings zone lands between the drum and the drawing, and the gap
grows to 613–656px — so **no laptop height shows the hand and the door together on a narrow window**.

### 4 · THE WHEEL IS ON TWO OF THE ELEVEN STOPS

D5 and D6 declare `wheel: 'contested'`. The other nine draw no wheel, no pawl and no second hand. A
reader walking the bench meets the negotiation twice and the arithmetic nine times. The nine are not
wrong to be quiet — a bar chart of filed dollars has no second party in it — but "the reader watches
a negotiation" describes two elevenths of this instrument.

### 5 · THE NEGOTIATION IS TWO MOVES LONG, AND THE READER CANNOT LOSE IT

The rival opens at notch 0 and its ceiling is notch 2, so its hand moves at most twice and then stops
for good. Above the ceiling the reader is alone on the drum. And every refusal ends: `wheel.rest()`
puts the door back after 900ms,
`bench.js` schedules it, and `rivalPressureFaults` refuses any resting state that still has the door
swung. That is the right behaviour — a door stuck open would have the cups filling from a lane the
drawing calls empty — but it means **there is no state in which the rival keeps the door**. The
reader's raise is always eventually granted. A negotiation the reader cannot lose is a demonstration.

### 6 · THE RIVAL HAS NO NAME

Every sentence says "the rival". The record's second party is Overture, and the two lowest notches
are read from `mech-ovt-001`, its own FY2002 payout and its own next-quarter guidance. The word
"Overture" appears **once** in the whole 862-string DOM sweep, inside a caption the record wrote, on
a different stop, about Yahoo buying it in 2003. The hand on the other side of this wheel is a
generic. Naming it is a change to `wheel.js`'s notch labels and to `settlementPhrase`, and nobody has
decided whether a named rival helps a first-time reader or adds a proper noun to learn.

### 7 · THE ONE STATE WHERE THE RATE FALLS AND NO HAND IS ON THE WHEEL IS NOT ON THIS BENCH

`makeWheel(..., { mode: 'filed' })` walks the disclosed payout series 91 → 84 → 79 → 75.4 → 78.5 →
78.7 with the control gone and the year printed, and `turnTo` throws there. It is the sharpest thing
the wheel can do: the ratchet going up and coming back down with nobody on this page turning it.
**No stop declares it.** Both wheel stops are `contested`, and the filed walk is built only by
`wheel.demo.html`. A reader of the bench never sees it. The earlier version of this file listed it as
the fifth of "the five mechanics" without saying where it was; that sentence is corrected above.

### 8 · THE TWO VERBS ARE NEVER SEEN ON THE SAME STOP

CRANK is the reader's verb and it fires on a control in the left column. The two stops that carry the
wheel declare **no left-column control at all**, and turning the drum calls `paint(null)`, which
passes no cause, so CRANK does not run. The only verb that ever runs on the wheel is the rival's
TRAVERSE. The contrast the design rests on — "you have learned CRANK, now something else moved it" —
is carried **across** stops, from the rockers at stop 1 to the drum at stop 2, and never within one.
Giving the drum its own CRANK is a change to `handlers.onWheel` and a row in the test bench, and it
was not made this round.

---

# What a reader can still see that the record does not carry

Written plainly, because "no renderer currently reads it" is a latent hazard and not a guarantee.

1. **`mark.lo` and `mark.hi` on the span-only guarantee.** Always present, on purpose — the span
   *is* the mark. Anything can average them. Nothing on this bench does, and nothing here helps: the
   curve draws two paths and the readout prints a range.

2. **The reported guarantee is read once, in one place.** D1 read `mech-aol-001` through
   `planClaimMark` and drew the band the guard gave it. D3 and D10 typed `lo: 75, hi: 150` into
   their own bars and their own splits, and typed the sentence "the record's range is wider than 60%
   of its own middle value" underneath. Narrowing the claim is the ordinary result of a verification
   round. It would have made D1 refuse to draw, while D3 and D10 went on printing the stale range
   under a sentence that had become false. One function is the only reader of that claim now. All
   three stops carry the mark and its verdict register. The "why it has no middle" sentence is
   generated from the live ratio and the live cut rather than typed. A permanent row asserts that
   all three stops draw the same numbers off the claim.

3. **The record's own multiples at $100m.** X1 works the balance-sheet test out at the reported
   figure, which is the middle of a range this bench refuses to draw a mark on. Those five figures
   are in D1's ledger, they are stored steps, and the note under the instrument says in as many
   words that they are worked out at a number the drawing will not mark. The alternative — dropping
   them — would hide the record's own arithmetic.

4. **The illustrative revenue-per-search figures.** $10.00 and $6.00 per thousand searches and
   $1.00 to answer them are invented, and every figure standing on them says so beside itself. The
   empirical content of D5 and D6 is the 33.4-point payout gap between the two firms in 2002, not
   the levels. A reader who quotes "$10 per thousand" as a fact has been told four times not to.

5. **Three-to-one dots.** The lane dot count is a drawing convention rounded from the filed 74.7 /
   25.3 split, and `laneRatio` returns both the convention and the filed share. The share is printed
   beside the lanes, so a reader counting dots and a reader reading the number are never handed two
   different facts. The exact ratio is 2.95, and rounding it to three is a choice made here.

6. **The rival's ceiling is an invention, and the reader's freedom above it rests on it.** This is
   the sharpest thing on the page and it is printed on the wheel, in `wheelSentence`, and in the
   notch's own source line. Move `rpm_rival` or `serving_cost_per_1k` in the record and the ceiling
   moves with them.

7. **Nothing here scans the built page for arithmetic.** The prose lint reads the DOM for *text*.
   No guard walks the DOM comparing a rendered numeral against the minted figure behind it. That is
   the library's widest limit and it applies unchanged three layers up. One thing partly closes it here.
   `machineAlt` is built from the same `cupText` strings the cups draw, and section 17 of the test
   bench asserts all three drawn cup figures appear in the accessible name. So the drawing and its
   spoken sentence cannot carry different numbers. That is the defect the auction bench's band had.

8. **The settings table prints the scenario's raw settings.** Keys like `nontac_cost_allocation`
   are the record's own field names, shown so a reader can trace a figure back. They are not written
   to the readability gate's standard and they are not prose.

---

# The gate

`BUILD-PLAN.md` sets B5 a different gate from B4's: *the architect's verdict, plus the fallback
stays viable.* The arithmetic gate runs anyway. A component that teaches the right lesson with the
wrong numbers is not a component.

**Check one — the record agrees with itself.** 86 stored steps: 81 in
`mechanism.json engines.distribution` (X1–X10) and 5 in
`reconciliation.consistency_check.arithmetic`. Every `expr` is evaluated here by
`../auction/arithmetic.js`'s parser and compared against its stored `expected`. `0` disagree.
`tools/verify_p2.py` runs the same check in Python.

The five reconciliation steps are in scope on purpose, and their absence is a hard error. They are
where the record proves that 31.8%, 30.8% and 9.4% are one numerator over three denominators. This
bench draws all three.

**THE GATE IS IN THE RENDER PATH.** Every paint re-derives what the stop is about to show, before it
touches the DOM. The stop refuses to draw if any figure fails. Mounting the bench also runs build
note 10 and the two copies of the 31 distribution claims. This is new. `bench.js` used to
import neither `engine.js` nor `gate.js`, so a corrupted record rendered to the reader while the
report at the foot of the demo page went red — and a consumer embedding the component got neither
guard. The demo page's gate is a REPORT. This is the GUARD, and both are in the module you imported.

**Check two — the bench agrees with the record.** Every figure a stop puts on screen names the
stored step it must equal, and the expression is evaluated here rather than trusted. Across all
eleven stops, every combination of every control, and every notch of the wheel:

- **0** figures fail to re-derive
- **0** positions handed the gate nothing it could check
- **127** figures are worked out on this page rather than stored; each prints its own derivation
- **67 of 86** stored steps are claimed by a figure this bench can show (77.9%)

Open `door.test.html` and `door-bench.demo.html` and read the tallies they print. The numbers in
this file can go stale.

**The evaluator is a parser, not `eval`.** It is imported from `../auction/arithmetic.js` and never
rebuilt. A second recursive-descent parser in this folder would be a second answer to "what does
this expression mean", and the whole lesson of the layers below is that two answers to one question
is the defect. What this folder owns is *which* steps are the door's.

---

# What this folder imports, and what it does not re-implement

```js
import * as guards from '../lib/guards.js';                 // every rule that can be broken
import { crank, traverse } from '../lib/motion.js';         // the two verbs
import { assertObjectColor, assertTextColor } from '../lib/tokens.js';
import { el, text, frame, rule, svgRoot, titled, layer, absenceBlock } from '../charts/svg-kit.js';
import { planClaimMark, verdictRegister, assertVerdictsVisible } from '../charts/claim-marks.js';
import { PAINT, STRUCTURE, assertColourBudget } from '../eras/organs.js';
import { evaluate } from '../auction/arithmetic.js';        // the parser, never a second one
import { money, moneyAsMeasured, percent, times, count } from '../auction/readouts.js';
import { scenarioRecord, resolveSettings, settingsProvenance, lintRenderedStrings } from '../auction/panels.js';
import { domSentences } from '../auction/bench.js';
```

Four of those are worth a sentence each.

**`../eras/organs.js`'s `PAINT`.** This folder imports **no colour token to write its own stroke
with**, exactly as `era-machine.js` imports none. A draw site spreads a bag and gets the whole role
— the colour *and* the iron that carries it. The one role this folder adds, the take as a fill, is
built from `PAINT.take.hex` and returns the hatch AS the fill.

**`../auction/readouts.js`'s formatters.** `money`, `moneyAsMeasured`, `percent`, `times` and
`count` take bare numbers and refuse anything that is not measured. They are reused; the *minting*
is not, because the auction's required label is the bidder mode and this bench's are the basis, the
invented input and the settlement. A second mint with different required labels is the right answer;
a second formatter would not be.

**`../auction/panels.js`'s settings resolver.** `resolveSettings` and `settingsProvenance` are
generic over `simulator-params.json` and handle `inherits` transitively. `guards.js` has its own
resolver for a different job — scanning settings for a first-price rule — and a third one here would
be a third answer. The arithmetic gate is what would catch a wrong resolution: every figure in an
inheriting stop would miss its stored step.

**`../auction/bench.js`'s `domSentences`.** It reads every text-bearing leaf, every SVG `<title>`
and every `aria-label` off the rendered page. A hand-kept list of "everything" is a list of what
somebody remembered, and this project has learned not to trust that shape.

---

# Reader-facing prose

Every sentence this folder generates is written here rather than read from the record. Every SVG is
stamped `data-alt-source="generated-by-chart"` by `svgRoot`. That is how team B8 finds them all
later and replaces them with the authored ones from the data layer.

Re-measured 2026-08-01 after this round's repairs. **The filter is stated, because the auction bench
learned that an unstated one makes two measurements incomparable — and this filter is NOT the one
the previous snapshot used, so the two sets of numbers are not comparable either.**

The measured set is every string these modules *generate*, read off the rendered DOM by
`allDoorSentences`. It covers all eleven stops, every named position of every control, every notch
twice, and the rested state after a refusal: **546 distinct strings, 16,135 words**. It does **not**
cover the filed walk, because no stop declares it — see limit 7. An earlier version of this sentence
said "both wheel modes", and that was wrong. Four things in the DOM sweep are excluded, because this
component does not write them. The record's own verbatim prose: the nine `required_caption` entries,
and the claim statements the verdict register quotes. The settings table's own record field names.
The ledger's stored expressions. And bare numerals.

**FK 5.16 · Reading Ease 82.12 · Gunning Fog 7.52 · SMOG 7.96.** The gates are FK ≤ 10, Ease ≥ 50,
Fog ≤ 12, SMOG ≤ 12. Over the 467 strings that run to four words or more: **FK 5.06 · Ease 82.56 ·
Fog 7.42 · SMOG 7.89**.

The scores were computed by a JavaScript port of `tools/readability.py`, because the corpus only
exists in a rendered page. The port was checked against the Python tool on a fixture and agrees to
the last digit on all four measures.

**One thing that measurement caught, and it is worth writing down.** `figureSentence` first joined a
figure's qualifiers with semicolons. So a money figure with a basis, a settlement, an invented input
and a derivation came out as one 70-word run, scoring **FK 29**. A screen reader says the whole of
that out loud. Each qualifier is its own sentence now, in the spoken string and in the printed block
under the figure, and the whole corpus dropped from FK 10.92 to FK 6.99. The gate found a defect in
the accessible path, not a style problem.

At that snapshot the DOM sweep reached **861** distinct strings, which is the 546 generated ones plus
the record's quoted prose, the settings table, the ledger's stored expressions and the numerals. That
is the set the prose lint reads.

## What this round added to that corpus, and what was NOT re-measured

The resting rival trace adds **exactly one string**, and it is the trace's own accessible name:

> The rival's hand opened at 58.0 per cent. The dashed outline is where it stood then. It moved
> itself from there to here.

**The sweep is 862 now**, up from 861, and the demo page prints that count at the foot. No existing
string changed. 24 words, three sentences, scored on `tools/readability.py`'s own code path:
**FK 2.77 · Ease 89.44 · Fog 4.87 · SMOG 6.43**. Well inside all four gates. The tool's own CLI
refuses a sample under 30 words, which is why the four functions were called directly rather than
through it.

**The four aggregate scores above were NOT re-derived this round, and that is a limit rather than an
omission.** The filter that produced them is described in prose here and is not checked into this
folder as code. So it cannot be re-applied exactly. Three attempts to rebuild it from the description
landed at 569, 571 and 598 strings rather than 546. Adding one 24-word sentence to a
16,135-word corpus cannot move FK 5.16, and that is the whole of the claim being made. The next
person who wants a real number has to write the extractor down first.

---

# Still open for the teams behind B5

- **The architect's verdict is the gate and it has not been run.** Everything above is the mechanism
  built to meet the requirement. Whether a first-time reader believes they set the rate is a
  question for a person, and `wheel.demo.html` exists so it can be put to one without the rest of
  the bench in the way. The adversary's verdict — 37 replayed attacks, all failing, and the sentence
  this file's limits section is named after — is not that gate. It is a review of the mechanism, and
  it says the mechanism is sound and thin.

- **B8's authored alt sentences.** Every sentence here is generated at draw time and stamped, exactly
  as the chart layer and the auction bench do.

- **The readability measurement is a snapshot.** Nothing in this folder re-runs it. A string added
  later is unmeasured until somebody extracts the set again.

- **The three centre forms are 940 units wide and scroll in place below that.** The drum no longer
  does — it has its own row and scales to it, and the numbers are in the table above. The machine,
  the bars and the band still scroll horizontally in a narrow centre column. On a phone the whole
  thing becomes a demonstration rather than an instrument, which `OPEN-PROBLEMS.md` predicted of this
  option. The three cups are what must survive that reduction, and nothing here decides how.

- **The fallback is still viable.** `OPEN-PROBLEMS.md` Option 1B — the Door Plate, with a sealed
  control strip — is fully specified and shares this folder's record, its gate and its figures. If
  the architect's verdict goes against the wheel, `drawing.js` and `bench.js` are what would be
  replaced; `gate.js`, `figures.js`, `engine.js` and `scenarios.js` would not.

- **19 stored steps are unclaimed.** They are mostly scaffolding inside X4, X5 and X10 that no stop
  puts on a dial. `stepCoverage` reports them, and it is how the next person finds the parts of the
  analysis this bench does not yet teach.

- **The drum's hit area is the whole drawing, not the drum's own rectangle.** A pointer-down
  anywhere on the wheel svg maps to the nearest notch. That is generous rather than wrong — the
  visible affordance is the drum and the grip on it — but a reader who means to tap the printed
  readout underneath will turn the wheel instead. Narrowing it to the drum band is a change to
  `attachDrumControl` and a row in the test bench.

- **Nothing re-measures the co-location numbers.** The table above was taken by hand in one browser
  on one day. `door.test.js` asserts the invariant in drawing units, which is what actually decides
  it, but the CSS-pixel column is a snapshot. A change to `door-bench.css` could move it with every
  guard still green. **The grip-to-door numbers are the same kind of snapshot**, and they are worse:
  they cross two zones, so a layout change moves them and nothing here notices.

- **The eight limits are the work list, and none of them is closed.** Limit 2 is half repaired and
  says so. The other seven are open, and each names the file that would change:
  - **1 · the ink does not name the second party** — `drawing.js`, and it is a design question before
    it is a code one.
  - **3 · the door is 382px below the grip** — `door-bench.css` and the zone order. A door mark
    inside the wheel's own row would close it and would also be a fourth thing to learn.
  - **4 · two stops of eleven carry a wheel** — `scenarios.js`.
  - **5 · the negotiation is two moves and cannot be lost** — `wheel.js`, and the record sets the
    ceiling, so this one is not free.
  - **6 · the rival has no name** — `wheel.js`'s notch labels and `settlementPhrase`.
  - **7 · the filed walk is not on the bench** — `scenarios.js`. A twelfth stop, or a mode rocker on
    D5. This is the cheapest of the seven and probably the most valuable.
  - **8 · the two verbs are never on one stop** — `handlers.onWheel` in `bench.js`, plus a row.
