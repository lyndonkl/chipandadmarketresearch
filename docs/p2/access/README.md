# `docs/p2/access/` — the alt sentence, the text-only path, and the keyboard

Team B8 (`p2-ad-market/BUILD-PLAN.md`). Direction: **The Bench**
(`p2-ad-market/design/DESIGN.md`, locked 2026-07-31). Light mode only.

`DESIGN.md` closes on this, under **Still unsolved**:

> Accessibility past reduced motion is thin. Four of five proposals covered reduced motion verb by
> verb and left screen readers, keyboard operation and text-only paths largely unaddressed. The
> strongest idea in the set came from a direction not chosen: a required plain-English sentence in
> the data layer for every visual, written to pass the four readability gates, driving a text-only
> toggle. **Adopt it.**

This folder is that, built. Plain ES modules. No build step, no bundler, no third-party dependency,
no network request beyond the frozen JSON the page reads from this repository.

| File | What it is |
|---|---|
| `visuals.js` | **The field, at the page.** Loads `p2-ad-market/data/visuals.json`, derives each visual's sentence from the record's two fields, binds a rendered region to its row, and refuses a page carrying a drawing no row covers. Holds no sentence of its own. |
| `text-path.js` | The text-only version. The mode and its toggle, the block builder, and the observer that keeps every block in step with the drawing it replaced. **No arithmetic anywhere in the file.** |
| `keyboard.js` | Roving tab stops on every composite control, a reading cursor on every drawing, the keyboard map as data, and the guarantee that no control is unreachable or unnamed. |
| `access.css` | The switch, the block, the named absence, the focus ring on an SVG group. Restates no token value. |
| `access.demo.html` | Four real instruments from the frozen record — an era machine, the auction bench with THE BAND, the door bench with the drum, and the seven toll plates — with the whole layer mounted over them. |
| `access.test.js` · `access.test.html` | The bench. **The page prints its own tally; trust that over any number written here.** At the last run: 34 cases, 34 pass. |

The data-layer half is `p2-ad-market/data/visuals.json` and its gate is
`python3 tools/verify_p2.py b8-alt`.

## Opening the pages

```
cd /path/to/chipandadmarketresearch && python3 -m http.server 8000
```

then

- `http://localhost:8000/docs/p2/access/access.demo.html` — the layer over four real instruments
- `http://localhost:8000/docs/p2/access/access.test.html` — the bench

Add `?text=on` to force the text path, or `?motion=reduce` for the reduced encoding. Browsers refuse
ES module imports and `fetch` over `file://`, so both pages say so plainly and stop rather than
half-rendering.

---

# 1 · THE FIELD

`p2-ad-market/data/visuals.json`, added under stage B8 on the pattern P1 and B1 already set: a
required field on the frozen layer so a downstream guard can enforce what the prose was only
asserting. No number moved and nothing was re-researched. See `data/FREEZE.md` → **B8**.

**Fifty-one visuals.** Five charts, seven era machines, eight cross-era drawers, ten auction
scenarios, THE BAND, eleven door stops, the drum, seven toll plates and the visibility legend.

**Two fields, and the accessible name is the two joined.**

```json
{
  "id": "auction-sc-02",
  "component": "auction",
  "module": "docs/p2/auction/scenarios.js",
  "scenario": "sc-02-quality-weighting-both-metrics",
  "chapter": 7,
  "order": 19,
  "shows": "The same two ads, now ranked on the offer and the click rate together. What the seller takes and what a click costs are both on screen.",
  "finding": "Weighting by clicks raised what the seller took and lowered what a click cost. The gain came from volume, not from price."
}
```

`shows` is what is on the drawing. `finding` is what a reader should take from it. **There is no
`alt` field.** `altSentence(id)` computes it on every call, so there is no third copy to drift —
the same move `era-plan.js` makes on its drawer words, and the reason a drawer's title, accessible
name and alt sentence cannot disagree.

## The rule that decides the whole shape: NO DIGIT

Neither field may contain a digit, and `tools/verify_p2.py b8-alt` refuses one.

A figure written into an alt sentence is a second, unversioned copy of a number. The mark beside it
already carries that number, and nothing checks that the two agree. `toll-records.js` reached this
first and applies it to its thirteen base sentences for the same reason. Two consequences, and both
are improvements:

- **The sentence has to be about the finding rather than the figures**, which is what `BUILD-PLAN.md`
  asked for: *not a description of shapes, a statement of the finding*. "Weighting by clicks raised
  what the seller took and lowered what a click cost" needs no number to be the point.
- **Every figure on the text path comes from the component's own guarded strings**, which are already
  re-derived from their own minted marks by `assertReadingsMatchMarks`, `assertPixelsMatchMarks` and
  the two arithmetic gates. This folder adds no number and no arithmetic to the piece.

## Measured

`python3 tools/verify_p2.py b8-alt`, 2026-08-01, through `tools/readability.py`'s own code path:

| | Corpus | Median visual | Worst visual |
|---|---|---|---|
| Flesch-Kincaid | **4.67** | 4.75 | **7.31** (`door-stop-07`) |
| Reading Ease | **83.72** | 84.28 | **66.4** (`door-stop-07`) |
| Gunning Fog | **6.65** | 6.43 | **9.33** (`door-stop-07`) |
| SMOG | **7.25** | 7.17 | **9.73** (`auction-sc-10`) |

The gates are FK ≤ 10, Ease ≥ 50, Fog ≤ 12, SMOG ≤ 12. 2,335 words across 188 sentences.

**Scored per visual, not over the corpus**, because a corpus average hides the one sentence a reader
cannot follow — and the corpus figure above is exactly the number that would have hidden it.

---

# 2 · THE CHECK, AND THE PROOF THAT IT FIRES

```
python3 tools/verify_p2.py b8-alt            # the gate
python3 tools/verify_p2.py b8-alt-selfcheck  # the proof it is not vacuous
```

`_b8_check(doc, floors, readability)` is a **pure function over plain data**. It returns violations,
appends to nothing and reads no file. That is what makes the second command possible, and the shape
is borrowed straight from `../door/wheel.js`'s repair of `assertRivalIsPresent`: *lift the invariant
out of the closure, make it a pure function over plain data, then a test can hand it the bad input.*

## What the gate covers

1. Every visual carries **both** fields, neither blank, neither a fragment, neither a copy of
   another visual's.
2. **Neither field carries a digit.**
3. The two joined clear **all four gates, per visual**.
4. Every visual points at a module that exists in this repository.
5. **The registry is complete against the frozen record**, and the floors are DERIVED:
   - one machine and one toll plate per file in `data/eras/`;
   - one cross-era drawer per organ field in `era-1.json`'s own `fields`;
   - one visual per `sc-*` and per `D*` scenario id in `simulator-params.json`.

   Add an era to the record and this check demands its machine, its plate and its cells. Delete the
   record and every floor goes to zero — which is a **vacuity failure, not a pass**.

## The coverage numbers it prints

```
b8-alt: 51 visuals scanned, 51 scored against all four gates
        (auction 11, charts 5, door 12, drawers 8, eras 7, toll 8);
        floors from the record: 7 eras, 8 organs, 10 A-series, 11 D-series;
        corpus 2335 words, fk 4.67, ease 83.72, fog 6.65, smog 7.25
```

## The proof that it is non-vacuous

**A check that cannot fire is worse than no check**, because the team stops looking at the thing it
appears to be watching. This project has shipped that defect twice — a pressure guard whose two
operands contradicted each other, and a wheel-control refusal no public path could reach — and
written it down both times. So the gate is fired on demand, one clause at a time:

```
b8-alt-selfcheck: live registry clean at 51 scored visuals;
                  19 mutations run, 19 caught, 0 missed
```

It prints **what** fired, not only that something did, because a count alone cannot tell you whether
nineteen mutations were caught by nineteen clauses or by one loose one. The nineteen:

| The mutation | The clause that caught it |
|---|---|
| an empty registry | the vacuity guard |
| a digit in a finding | the no-digit rule |
| a blank `shows` · a missing `finding` | both fields required |
| one finding on two visuals | distinctness |
| a finding no reader can follow | **the readability gate — FK 17.32 against a limit of 10** |
| a fragment with no full stop | the sentence rule |
| a module that does not exist | the module cross-reference |
| two visuals at one place in the order | the order rule |
| two visuals with one id | the id rule |
| a component outside the vocabulary | the component vocabulary |
| a chapter the piece does not have | the chapter range |
| an era in the record with no machine | the era floor |
| every cross-era drawer dropped | the organ floor |
| one organ drawn twice and another not at all | the organ floor, per organ |
| the last toll plate dropped | the plate floor |
| a scenario the record does not hold | the scenario cross-reference |
| every door stop dropped | the D-series floor |
| the record itself gone, so every floor is zero | the grounding guard |

It also asserts the **live registry is clean first**, so the command cannot pass by catching
mutations of a record that was already failing.

**A defect this command found in itself.** Two early-return paths in `_b8_check` returned a bare list
where the caller unpacks a pair. The empty-registry mutation was "caught" anyway, because the
selfcheck read `[0]` off the list and got a truthy tuple — while `b8-alt` would have crashed on a
real empty registry. The proof was right by luck, which is worse than being wrong. Both paths return
the pair now.

---

# 3 · THE TEXT-ONLY PATH

The standard this holds itself to is `../lib/motion.js`'s: **a complete alternative encoding, not a
disabled state.** Turning the drawings off must not turn the argument off with them.

## Three rules, and each one is the answer to a way of getting this wrong

**1 · The controls stay.** Text mode hides drawings. It hides nothing else. Every crank, rocker,
slider, ring and the drum is still there, still operable, and the text under it is rebuilt the moment
the reader moves one. An instrument reduced to a paragraph is a demonstration.

**2 · The finding comes from the data layer.** Each region prints the authored sentence, which
carries no digit and has cleared four gates on its own.

**3 · The figures come from the drawing's own accessible names.** Every `<title>`, every `<desc>`,
every `<text>` and every `aria-label` inside the region, in document order, de-duplicated, as a
table. Not from a second copy and not from arithmetic done here. **There is no arithmetic in
`text-path.js` at all.**

That third rule is the mechanism behind a lesson this project paid for twice: *a drawing must agree
with its own accessible name.* Here the text path **is** the accessible name, so a drawing that
disagrees with it disagrees with what the reader is reading, in the same view, where somebody sees
it.

## Mounting it

```js
import { loadVisuals, declareVisual } from './access/visuals.js';
import { installTextPath, installTextToggle } from './access/text-path.js';
import { installKeyboard } from './access/keyboard.js';

await loadVisuals();
declareVisual(regionNode, 'era-1-machine');   // once per visual, at mount
// ... render the components into their regions ...
installTextToggle(document.getElementById('toolbar'));
installKeyboard(root);
installTextPath(root);                        // asserts every drawing is declared
```

`declareVisual` refuses an id the record does not hold, at the moment of mounting, which is the only
moment anybody is looking. `installTextPath` calls `assertEveryDrawingDeclared` first, so a drawing
with no authored sentence stops the page.

Precedence for the mode: `setTextMode()` → `?text=` → `sessionStorage` → off. The resolved mode is
stamped on `<html data-p2-text>` with `data-p2-text-source` beside it. There is **no operating-system
signal** for "text instead of pictures" the way `prefers-reduced-motion` is one for motion, so this
mode is always the reader's explicit choice and the toggle is always on the page.

## What the demo measures

`access.demo.html`, over four real instruments and the frozen record, 2026-08-01:

- 36 drawings, every one inside a declared visual
- 13 regions carrying a text block, **0 silent**
- **292 readings** pulled off the drawings' own accessible names
- in text mode: 35 of 36 drawings hidden, 13 blocks shown, every control still on screen and still
  operable

---

# 4 · KEYBOARD OPERATION, CONTROL BY CONTROL

**What was already there, and this folder did not rebuild it.** Every control the seven component
teams shipped is a real control. The cranks and the auction rockers are `<button>`s. The sliders are
`<input type="range">`. The organ plates and pull rings are `role="button"` with `tabindex="0"`, and
they carry their own Enter and Space handlers. The drawer closes on Escape. The door drum carries
`role="slider"`, `tabindex="0"` and Arrow, Home and End, and it turns through the **same `turnTo`**
the drag uses. `tokens.css` already draws a focus ring on all of them.

**What was actually wrong was the ORDER, and one thing missing.**

- **Order.** Every button in every rocker was its own tab stop. One era machine is eight organ
  plates, eight pull rings and up to eight crank settings — twenty-four stops before the reader
  reaches the next thing on the page, and seven machines is over a hundred and fifty. Measured on
  the demo: one era's crank alone went from **8 tab stops to 1**.
- **Reaching a drawing at all.** A drawing is `role="img"` with no `tabindex`, so a keyboard reader
  could not land on one. THE BAND is the sharpest case: the object the auction chapter turns on, its
  ends and named stops drawn as separate marks, and the only way to hear them was one long sentence.

## The map

`KEYBOARD_MAP` is exported as data so a report can print it beside the findings, the way `guards.js`
exports `DEAD_MECHANISM_LINT_LIMITS`. A keyboard map that lives only in prose goes stale the first
time a key moves.

| Control | Reach | Operate | Whose |
|---|---|---|---|
| **the crank**, every era machine | Tab lands on the setting in force | ← → move, Home / End jump, Enter / Space turns the machine | B3 built it; B8 made the group one stop |
| **the eight organ plates** | Tab lands on the plate that is open | ← → move along the eight, Enter / Space opens one | B3; B8 made the eight one stop |
| **the pull ring**, every organ | Tab lands on the first ring | ← → move, Enter / Space pulls it and opens the cross-era drawer, **Escape** closes | B3 built the ring, its keys and the Escape; B8 made the eight one stop |
| **every auction and door control** | Tab lands on the rocker or the slider | a range is native: ← → step, Home / End jump, PgUp / PgDn take a larger step. A rocker roves | B4 and B5; B8 made each rocker one stop |
| **THE BAND** | Tab lands on the track | ← → walk its readings one at a time — the floor, every named stop, the marker and its mode — into a live region. Home / End go to the ends | B4 drew it; B8 made it reachable and gave it a cursor |
| **THE DOOR DRUM** | Tab lands on the drum. `role="slider"`, and `aria-valuetext` is the whole state sentence including whose hand moved it last | ← → ↑ ↓ PgUp PgDn move one notch, Home / End go to the ends | **B5 built all of it.** B8 verified the percept survives and added nothing |
| **the scenario rail**, on both benches | Tab lands on the scenario in view, not on the first of eleven | ← → move along the rail, Home / End its ends, Enter / Space shows the one under focus | B7 built the rails; B8 made each rail one stop. Twenty-two stops became two |
| **THE CROSS-ERA DRAWER** | a pull ring opens it and focus moves to its close button | Tab and Shift-Tab stay inside while it is open. **Escape** closes it, and focus returns to the ring that opened it | B3 built the drawer, the Escape and the opening move; B8 added the trap and the return |
| **every other drawing** | Tab lands on the drawing | ← → walk what it says, Home / End its ends, Escape gives it back its own sentence | B8 |
| the text and motion toggles | Tab lands on the rocker | ← → move, Enter / Space chooses | B8 and B1 |

## Arrows move focus and do not activate

That is toolbar behaviour, and here it is also a rule of the design. `motion.js` says CRANK is *never
for a change the reader did not make*. Arrow-to-select would fire the signature verb on navigation,
and a reader arrowing past six settings would watch the machine answer six times for nothing. A
permanent row on the bench arrows across a rocker and asserts **zero** clicks fire.

## The door drum, verified rather than assumed

`BUILD-PLAN.md` calls this the hardest one: a drag gesture that must work as discrete keyboard steps
**without losing the rival-pressure percept**. It does, and the reason is structural — B5 routed the
keys and the drag through one `turnTo`, so there is no second path to keep in step. Measured on
`access.demo.html`, stop 2, by key press alone:

| Key | `aria-valuenow` | What `aria-valuetext` said |
|---|---|---|
| — | 1 | "The wheel opened here, at the lowest share that beats the rival's standing bid of 58.0%. 5 of the 6 notches are still open" |
| → | 2 | "You turned it up, **and the rival answered by bidding 64.0%**. 4 of the 6 notches are still open to you. 2 sit under the rival's" |
| → | 3 | "You turned it up, **and the rival answered by bidding 83.3%**. 3 of the 6 notches are still open to you. 3 sit under the rival's" |

The ground the rival holds grows under the reader's own grip on a key press exactly as it does under
a drag, the refusal still swings the door, and the ghost grip still stands at the notch the reader
reached for. **This folder added nothing to the drum and needed to add nothing.**

---

# What is guaranteed and what is advice

Same two words the library, the chart layer, the era machines, the auction bench, the door bench and
the toll plates use, used the same way. **GUARANTEE** refuses a shape or checks a bounded finite
record, and throws. **ADVICE** finds some of what is wrong and never claims to find all of it.

| The rule | Which | What is covered, and what is not |
|---|---|---|
| **Nothing here runs unless you call it** | **ADVICE** | No guard in this folder scans a page you did not hand it. Every guarantee below fires at one call site. A page that never calls `installTextPath` gets none of them, and nothing here can tell you which page that was. This is the library's own widest limit and it applies unchanged four layers up. |
| **Every visual carries a readable sentence** `tools/verify_p2.py b8-alt` | **GUARANTEE** | Covered: 51 visuals, both fields, no digit, all distinct, each clearing four gates on its own, each pointing at a module that exists, and the registry complete against floors derived from the frozen record. Bounded and finite. Not covered: **that a `finding` is a finding.** "The line goes up" would pass every clause. That one is on review, and it is the reason the field is two fields rather than one. |
| **The gate can fire** `b8-alt-selfcheck` | **GUARANTEE** | Covered: 19 mutations, one per clause, each required to produce a violation, with the live registry asserted clean first and the caught message printed. Not covered: **a clause nobody wrote a mutation for.** The proof is as wide as the mutation list, and the list is written by hand. |
| **No drawing reaches a reader without an authored sentence** `assertEveryDrawingDeclared` | **GUARANTEE** | Covered: every `[data-alt-source]` element on the page must sit inside a declared region, and every declared region must be a row of the record. The refusal names the drawings it found, by their own accessible names. **It fired on its first run against the real components** and found five — the toll page's visibility legend, which carries that page's whole finding and which no row covered. It has a row now. Not covered: a page that does not call it, and a drawing that is not stamped `data-alt-source`. The stamp is `svg-kit.svgRoot`'s and every component goes through it. |
| **An id the record does not hold is refused** `getVisual` · `declareVisual` | **GUARANTEE** | Covered: a lookup throws rather than answering `undefined`, and `declareVisual` throws at the moment of mounting. Not covered: nothing. This one is total within its subject. |
| **The sentence is derived, never stored twice** `altSentence` | **GUARANTEE OF THE MECHANISM** | Covered: there is no `alt` key on a row to drift. The bench asserts `'alt' in row` is false. Not covered: a renderer that concatenates the two fields itself. That is the same string; what is gone is a third field that could differ. |
| **The text path invents no number** `textBlockFor` · `renderTextBlock` | **GUARANTEE OF THE MECHANISM** | Covered: every string in a table is read out of the drawing's own `<title>`, `<desc>`, `<text>` or `aria-label`. **There is no arithmetic in `text-path.js`**, no access to any claim, and no formatter. A permanent bench row asserts that every printed row is a string the drawing already says. Not covered: **whether the drawing's own strings are right.** That is each component's arithmetic gate, and every one of them has one. |
| **An empty text block is a failure, not a pass** `textBlockFor` | **GUARANTEE** | Covered: a region with no drawing, or whose drawings carry no titles and no printed figures, comes back `vacuous` with a named reason, and `renderTextBlock` draws that reason as a stippled, framed, named absence — `DESIGN.md` rule 5 applied to prose. Never an empty table and never a gap. `[].every()` being true is a mistake this project has already paid for. Not covered: a region whose drawings say a *little* and should say more. The count is reported; the judgement is not made. |
| **The text follows the drawing** the `MutationObserver` in `installTextPath` | **GUARANTEE, WITH A STATED WINDOW** | Covered: every repaint inside a declared region rebuilds that region's block, on the next task. Verified live against the era machine: five cranks, five rebuilds, the block carrying the new output plate's reading each time. **Two defects were found here and both are written into the code.** It was scheduled on `requestAnimationFrame`, which Chrome does not run in a background tab, so the first mutation set the flag, the callback never ran and the observer never rebuilt anything again. And it fed itself: writing a block is a mutation inside the region, and filtering on `closest('.p2-text-block')` does not catch it, because replacing the block mutates the REGION. It disconnects while it writes now. Not covered: **a rebuild that lands between two writes of one repaint** shows the earlier state until the next mutation re-queues it. Self-correcting, and it is a window rather than a hole. |
| **Every control is reachable and named** `assertKeyboardOperable` | **GUARANTEE, UNDER A STATED RULE** | Covered: every visible, enabled element matching `CONTROL_SELECTOR` must be focusable — its own tab stop, or a roving member of a group that has one — and must have a non-empty accessible name. **The name rule is stated and simplified**: `aria-label`, then `aria-labelledby`, then an SVG `<title>` child, then own text, then `value` / `title` / `alt`. It is not the full accessible-name computation and does not claim to be; everything this project renders names itself in one of those five ways. Not covered: the DOM as it stands only — a control that appears after a repaint is checked when the check is re-run, which `installKeyboard`'s observer does. And a control that is reachable, named, and does the wrong thing. |
| **An empty keyboard check is a failed check** `assertKeyboardOperable` · `installKeyboard` | **GUARANTEE** | Covered: a page with no controls satisfies every clause by having nothing to satisfy them, so the result carries `vacuous` with a reason and `installKeyboard` throws on it. Pass `{ assert: false }` if the page really is prose. |
| **A drawing that is a control is never hidden** `access.css` | **GUARANTEE OF THE RULE** | Covered: text mode hides `[data-alt-source]` **except** `[role="slider"]` and `[role="button"]`. **This is a repair.** The door drum is stamped like every other drawing and it is also the only control for the revenue share — there is no slider anywhere else on that bench, by B5's design. Hiding every drawing took the instrument away and left a paragraph about a negotiation the reader could no longer take part in. A permanent bench row asserts the drum stays and an informational plate goes. Not covered: a control drawing that declares neither role. |
| **The reading cursor changes nothing** `installReadingCursor` | **GUARANTEE** | Covered: it moves an index through strings the drawing already says and writes them to a live region. It sets no value, fires no verb and has nothing of its own to say. A bench row fires six keys and asserts the drawing's markup is unchanged. A drawing that is already a control — the drum — is skipped, so its Arrow, Home and End stay the wheel's. Not covered: the live region is one per document; two cursors used at once would overwrite each other, which cannot happen from a keyboard. |
| **An overlay that takes focus gives it back** `installDialogFocus` | **GUARANTEE, WITH TWO STATED LIMITS** | Covered: while the dialog is open, Tab and Shift-Tab wrap inside it. When it hides, focus returns to the last element focused outside it. Open and closed are read off the element's own `hidden`, so no second copy of that state can drift. The trap is what makes `aria-modal` true, so installing it sets the attribute. Not covered: a dialog that closes by being **removed** rather than hidden — nothing observes removal. And focus the reader moved on purpose is never taken back, so a reader who tabbed out before the close keeps where they went. |
| **`auditTextPath` · `auditKeyboard`** | **ADVICE** | They report and never throw. They can say which visuals a page carries, whether they are in the record's order, which regions came back silent, how many stops each visual costs and in what order. **They cannot say whether the argument survives**, which is a question about a reader, and `BUILD-PLAN.md` puts that on a person. |

---

# The documented limits

Written as they were found, and none of them is softened.

1. **The chart group has no floor.** The era, drawer, toll, auction and door counts are derived from
   the frozen record, so a missing row is a hard error. **There is no such grounding for the five
   chart visuals**, because `adspend.json` says how many series exist and not how many drawings the
   chart layer makes of them. A chart deleted from the registry and from the page in the same commit
   would not be caught by `b8-alt`. It would be caught by `assertEveryDrawingDeclared` on the page —
   but only in the other direction, and only if the drawing is still there.

2. **Nothing checks that a `finding` is a finding.** Every clause of the gate is about shape:
   present, distinct, digit-free, ending in a stop, readable. "The line goes up and to the right"
   would pass all of them. The two-field split is the mitigation — a writer who has to fill `finding`
   separately from `shows` has been asked the question — and it is not a guarantee.

3. **The fifty-one sentences are authored, and they are checked for shape and never for truth.**
   Nothing reads them against the claims behind the drawing they sit above. **They are the
   fifty-one strings in this project most worth a second reader**, exactly as the toll plates say of
   their thirteen base sentences.

4. **SMOG over two or three sentences is coarse.** It is defined on a 30-sentence sample and
   normalised by 30/n, so one more three-syllable word moves it about a grade. It is applied anyway,
   because a gate switched off for short text is not a gate. The score to read on a short sample is
   Gunning Fog, which carries no such normalisation. `readability.py`'s `score_sample` says this in
   its own docstring.

5. **The text path reads a drawing for TEXT.** It does not compare a rendered numeral against the
   minted figure behind it. No guard in this repository does, at any layer; it is the library's
   widest limit and it is unchanged here. What this folder adds is that the drawing and its text are
   now **the same strings**, so they cannot disagree with each other — which is narrower than being
   right, and it is the part that was missing.

6. **A drawing that says too little produces a thin block, and nothing knows.** `vacuous` fires only
   at zero readings. A drawing carrying one `<title>` and eleven unlabelled figures gives a reader
   one row and reports itself covered. The per-region reading counts are in `auditTextPath` for a
   human to read; nothing sets a floor, because no floor would be true of every drawing.

7. **Mode symmetry between the text path and the drawn path is not machine-checked**, for the reason
   `motion.js` gives about `auditModeSymmetry()`. A component that starts drawing a figure without
   putting it in a `<title>` or a `<text>` loses it from the text path silently. The bench proves the
   readings come from the drawing; it cannot prove the drawing said everything it should.

8. **The keyboard map is prose beside the code.** `KEYBOARD_MAP` is exported as data and the bench
   asserts every row is complete, but nothing checks that the keys named in a row are the keys the
   handler actually reads. A key that moves in `../door/drawing.js` moves in that file and in this
   table separately.

9. **`accessibleName` is a five-way rule, not the accessible-name computation.** It is stated
   wherever it is used. A control named through an `aria-describedby`, a `<label for>` outside the
   five ways, or a CSS-generated string would be reported unnamed. Nothing in this project names a
   control that way today.

10. **The reading cursor is one live region for the whole document.** It is the right shape for a
    keyboard, where one thing has focus. A future page driving two cursors from script would have
    them overwrite each other.

---

# Decisions a reviewer should see

**THE BAND is reachable, and it is not operable, and that is the honest answer.** `BUILD-PLAN.md`
names it among the interactives. It is a readout of a control, not a control: on `sc-05` a rocker
moves the marker, on `sc-04` and `sc-06` a slider does, and on `sc-09` and `sc-10` the record locates
the disclosed magnitudes inside a band that **does not move at all**. Wiring arrow keys on the band
to "the panel's first control" would work on three scenarios and teach something false on two. That
is a default that happens to be right most of the time. This project has a name for it: being right
by luck. So the band gets a **reading cursor**: focus lands on it, and arrows walk the floor,
every named stop, the marker and its mode, one at a time, into a live region. It changes nothing. The
scenario's own controls, which are native and already keyboard-operable, are what move the marker.

**The cursor is on every drawing rather than only on the band.** One thing to learn, which is the
Bench's own principle, and it makes every drawing in the piece a tab stop with its own readings
behind it.

**`domSentences` is not imported from `../auction/bench.js`.** The toll team wrote down the same
decision and the reason is theirs: pulling in the auction bench to borrow a tree walk loads the
engine, the ten scenarios and the band onto a page that has none of them. What is duplicated is a
traversal, not a decision and not a number.

**Readability is scored in Python and nowhere else.** The toll and door teams both ported
`readability.py` to JavaScript because their corpus only exists in a rendered page. This corpus does
not — it is fifty-one rows of a JSON file — so it is scored by the tool itself, and
`readability.py` grew one function, `score_sample`, which `analyze()` now calls. One implementation,
one answer. The bench checks the shape rules the Python check also enforces, so a drift between the
two shows up as a disagreement rather than as silence.

**The registry is a new file rather than a field on 505 claims.** A visual is not a claim. Era 1's
machine draws thirty-odd claims and the value chart draws four rails; there is no claim that owns
either. The file follows the pattern P1 and B1 set — a required field added to the frozen layer so a
downstream guard can enforce what the prose was only asserting — and `FREEZE.md` records it as stage
B8.

---

# Still open for the teams behind B8

- ~~**The whole-piece text path is not assembled here.**~~ **CLOSED, 2026-08-01.** It was true, and
  it was the whole cost of this folder. Every sentence, block and tab stop sat in a module
  `docs/p2/index.html` never required. For a reader that is the same as not existing.
  `tools/build_p2.py` makes the calls now. It inlines `visuals.json` beside the frozen record,
  because a page opened off a disk cannot `fetch`. It inlines `access.css` last.

  Measured on the built page: **23 declared regions, 23 text blocks, 1,329 readings, 0 of them
  silent; 59 of 59 drawings reachable by keyboard with a reading cursor; 513 tab stops, down from
  620.** The other 28 visuals are scenarios, stops and drawers nobody has opened yet. Each is
  declared at the moment it is.

  Four things the mount needed that the demo did not. Each was a real hole.

  **(a) Two drawings the access layer could not see.** `rail-board.js` and `value-chart.js` mint
  their own `<svg>` root rather than calling `svgRoot`. Both carried `role="img"` and no
  `data-alt-source`, and all three modules here select on that stamp. Two attributes closed it.
  Without them the overlapping rails and the rail board's stipple did not exist with images off.

  **(b) A stale text block.** `renderTextBlock` found the block it was replacing by
  `[data-for="${id}"]`. That holds only while a region is one visual for life. The auction panel is
  ten, the door bench eleven, the drawer eight. Choosing a new scenario left the old block sitting
  above the new one. It clears every block the region holds now.

  **(c) The two scenario rails.** Twenty-two tab stops, every one a one-of-many choice, and not in
  `ROVING_GROUPS`. They mark the chosen button with `aria-current`, which `activeIndex` reads now.
  `ROVING_GROUP_SELECTOR` is derived from the list, so the two checks that need it cannot go one
  group short again.

  **(d) The drawer took focus and did not give it back.** See `installDialogFocus`.

- **`BUILD-PLAN.md`'s gate is a person, and it has not been run.** *The whole argument survives with
  images off and a keyboard only.* Everything above is the mechanism built to meet it. Whether a
  reader who never sees a drawing reaches the same conclusions in the same order is a question for a
  reader, and `auditTextPath` says so where it would otherwise be tempting to report a number.

- **The fifty-one sentences need a second reader.** Limit 3. They are checked for shape and never for
  truth, and they are the strings a reader on this path gets *instead of* the picture.

- **Nothing re-measures the readability figures on a change to a component.** The fifty-one are
  re-scored on every run of `b8-alt`. The components' own generated strings — the ones the text
  tables are built from — are measured by snapshots in four other READMEs, and none of those re-runs
  itself.

- **The reading cursor has no visible indicator.** A sighted keyboard reader sees the focus ring on
  the drawing and nothing showing which reading the cursor is on. `data-p2-cursor-at` is written on
  the element and could drive one. Closing it means drawing into another team's SVG, which is a
  decision before it is a change.
