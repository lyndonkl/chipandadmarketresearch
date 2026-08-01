# `docs/p2/charts/` — the P2 chart layer

Four drawings, built on `../lib/`. Nothing here re-implements a library decision: colour comes from
`../lib/tokens.js`, motion from `../lib/motion.js`, and every rule that can be broken goes through
`../lib/guards.js`.

| File | What it is |
|---|---|
| `claim-marks.js` | **The mark.** One frozen object per drawn quantity, and the seal on a plan. Every other module builds its drawables through this one. |
| `svg-kit.js` | The SVG primitives. Numbers into elements, and nothing else. |
| `rail-board.js` | The provenance strip. Eight tracks, one per series, showing the years each compiler actually published. |
| `value-chart.js` | The total-spend rails, in dollars of the day. Four rails, nine named holes, one measured wedge. |
| `small-multiples.js` | The by-medium bank, and the one-year cross-section. |
| `gdp-strip.js` | The share-of-GDP strip. Eleven dated readings, no line. |
| `charts.test.js` · `charts.test.html` | The bench. 41 cases, every one of them a way to make a chart lie. **The page prints its own tally; trust that over this number.** |
| `*.demo.html` | One page per drawing, against the real frozen record. |

## Opening the pages

```
cd /path/to/chipandadmarketresearch && python3 -m http.server 8000
```

then `http://localhost:8000/docs/p2/charts/charts.test.html` (and the four `*.demo.html` beside
it). Browsers refuse ES module imports and `fetch` over `file://`, so every page says so plainly
and stops rather than half-rendering.

There is **no fixture**. These cases are about what the four charts do to the whole frozen record,
and a five-claim excerpt cannot tell you that the medium partition still sums to the published
total in all 89 years.

---

# What is guaranteed and what is advice

Same two words the library uses, used the same way. **GUARANTEE** refuses a shape or checks a
bounded finite record, and throws. **ADVICE** finds some of what is wrong and never claims to find
all of it.

| The rule | Which | What is covered, and what is not |
|---|---|---|
| **A span-only mark has no central** `planClaimMark` | **GUARANTEE** | Covered: where `guards.markKindFor` says span, the `central` key is **never assigned**, so `mark.central` is `undefined` and `'central' in mark` is false. There is no central to forget to check. The guard runs on the record's own numbers **before** any transform, so a share view cannot buy a central a dollar view is refused. Not covered: a caller who builds mark objects by hand and calls the `svg-kit` primitives directly. That is not a public option — it is a rewrite, in a diff a reviewer reads. |
| **A mark carries no record field** `EXTRA_KEYS` · `assertExtra` | **GUARANTEE** | Covered: `extra` is an **allow list** of four presentation fields — `source_series`, `medium`, `organField`, `statement` — and every value must be a primitive. The walk is over `Reflect.ownKeys`, so a **symbol** key is refused too: object spread copies symbol keys and `Object.keys` does not see them, so `{ [Symbol.for("ci80")]: claim.ci80 }` reached a minted mark that nothing downstream would ever have walked. An **accessor** is refused as well, and the bag is copied once at the point of the check, because the check used to read `extra[key]` and the mark then spread `extra` — two reads — so a getter answering a string first and the whole claim second passed. It used to be a *ban* list naming this function's own answers (`central`, `kind`, `lo`, `hi`, `ratio`, `layout`, `anchor`), which let `ci80`, `sources`, `method`, `as_of` and `calibration` through. That mattered because the record strip in `../eras/era-plan.js` **skips minted marks by design** — a point mark's `central` is the one record-shaped key a mark is meant to carry — so a record field on a mark was a record field nothing downstream would look at, and the midpoint of a refused interval was computable off the mark. The value rule closes the same hole one level down: `{ statement: theWholeClaim }` reaches the record through an allowed key. Not covered: the four allowed fields themselves. They are strings a renderer prints as labels; none of them is a measurement. |
| **No derived middle value of a span-only interval is printed or spoken** | **GUARANTEE OF THE MECHANISM** | Covered: **there is no number on a mark to print.** The old `layout` field — the central where there was one, the midpoint of the interval where there was not — is gone. Positioning goes through `anchorY(mark, scale)`, which returns a **pixel**: `scale(central)` for a point, and halfway down the drawn bar for a span. `usd()`, `pct()` and `comma()` refuse anything that is not a measured finite number, so a caption reaching for a value the record does not carry throws instead of printing "—", "0.0%" or "NaN". `markFigure(mark, fmt)` is the supported way to put one figure in a sentence and says the range for a span. Not covered: a renderer that computes `(m.lo + m.hi) / 2` for itself and formats it. Nothing can stop that; what is gone is the field that made it look sanctioned. |
| **A plan is deep-frozen** `planner.seal` | **GUARANTEE** | Covered: every nested array and object on a sealed plan is frozen, so `plan.rails[i].segments[j].marks[k] = …` and `plan.categories.find(…).peakShare = 3.7656` both fail. Maps and Sets are **replaced** by frozen read-only facades with no `set`, `add`, `delete` or `clear` — `Object.freeze` does nothing to a Map's contents, and shadowing `set` is walked around by `Map.prototype.set.call` in one line, so the real Map lives in a closure and the facade has no internal slot to write to. Not covered: the mutation still fails **silently** in a non-strict caller. Every module here is an ES module, so it throws. |
| **A plan from outside is re-validated on content** `planner.open` | **GUARANTEE** | Covered: refuses a plan **this planner** did not mint (identity, through a module-private `WeakMap` — a `Proxy` around a sealed plan is a different object and is refused); asserts every container is still frozen; walks the **whole live graph** for marks and re-checks each against the live guards; then runs the planner's own `revalidate`. Every call, no cache — for the reason `freezeGaps` gives in `guards.js`. Not covered: `revalidate` is per-module code, and it re-derives what its author thought to re-derive. What is written down is in the module, beside the numbers it protects. |
| **A seal says WHICH planner applied it** `definePlanner` | **GUARANTEE** | Covered: `sealPlan` used to be a public export taking any `revalidate`, so "sealed" meant "somebody ran something". A caller could take a plan of genuinely minted marks, edit a copy, seal it with `revalidate() {}` and hand it to a renderer — the deep freeze, the generic walk and `assertMarksHonest` all pass, because nothing about the marks is wrong. It is gone. A planner is now minted by `definePlanner({ name, revalidate })`, recognised by membership of a module-private `WeakSet` — the same identity, not a flag, that `NO_DOCUMENTED_GAPS` uses — and each module keeps its handle in a module-private const and exports only its door (`openValuePlan`, `openBankPlan`, `openStripPlan`, `openEraPlan`, `openDrawerPlan`). A door opens only plans its own planner sealed, so the bank's plan is refused at the value chart's door, and re-sealing a sealed plan is refused outright. Not covered: `definePlanner` is public, and it has to be. That buys nothing — a handle an adversary defines is not the handle `value-chart.js` holds, and every door asks for its own by identity. Forging one means editing that module, in a diff a reviewer reads. |
| **Every container is walked** `planMarks` / `inspectPlan` | **GUARANTEE** | Covered: the walk is **generic**. It finds every minted mark anywhere in a plan, refuses any object that looks like a mark and is not one this module minted, refuses an array that mixes marks with non-marks, and refuses a live `Map` or `Set`. It replaced a per-module `collect(plan)` that listed the mark-bearing containers by hand and missed two of them. Not covered: an array declared to hold marks that is emptied and refilled with non-marks only. The module's own `revalidate` re-derives those lists; see the row above. |
| **Every verdict is drawable and no verdict is invisible** `stampVerdict` · `assertVerdictsVisible` | **GUARANTEE** | Covered: a claim whose verdict is not `confirmed` cannot be marked at all without a register, and a plan carrying such a mark with no printed stamp is refused — on mint and on re-entry, over **every** mark anywhere in the plan. `ds-gdp-001` is rejected and its body is the correction, so it draws, stamped. Not covered: the module still has to render the register. Each of them does, under the drawing. |
| **A universally quantified sentence is earned over the whole set** `unorderablePairs` | **GUARANTEE** | Covered: all n(n−1)/2 pairs, and `revalidateBank` re-derives both the count and the pair list. The cross-section used to test adjacent stack neighbours only and then print "no two media in this year have overlapping 80% intervals" for a year with five overlapping pairs. |
| **The partition is exact** inside `planBank` | **GUARANTEE** | Covered: all 89 years, checked before anything is drawn, and re-checked on every re-entry. Every share on the page is value ÷ total and that arithmetic is only honest while the parts are the whole. Not covered: the check is on the record's own `value` field; the plan carries only the **residual**, which is a difference and not a level. |
| **The record does not travel on a plan** | **ADVICE, WITH A CENSUS** | The four plans carry no `calibration`, `ci80`, `money_type`, `partition_member` or `known_breaks` anywhere — `charts.test.js`'s CENSUS row walks all four and asserts it. That row is a **census**, not a guard: it reports what it finds and a human reads it. Nothing stops a future planner putting a record row back. **On a mark it is now a guarantee rather than a census**, through `EXTRA_KEYS` above; a census that walks a plan and skips its marks was reporting on the half of the plan that could not carry a record field anyway. See "what a renderer can still reach", below. |
| **`assertAbsenceDrawn`** (from `guards.js`) | **GUARANTEE OF THE DESCRIPTOR ONLY** | The guard checks the array the chart hands it. **It does not read the DOM.** Every module here therefore prints its holes in a caption, in full, where a reader sees them. Unchanged from the library's own note, and repeated because it is the widest limit in this folder too. |

---

# What a renderer can still reach that it should not

Written plainly, because "no renderer currently reads it" is a latent hazard and not a guarantee,
and this project has been bitten by that framing once already.

1. **The mark's own `central`, on a point mark.** That is the design. A point mark has a central
   because the library allows one, and any draw site may read it. The guarantee is about span-only
   marks, and it is structural: there is no key.

2. **Derived share numbers on the bank plan.** `plan.media.get(k).readableShares[i].share`,
   `cat.peakShare`, `plan.maxShare`, `plan.maxDrawn`, `plan.scaleTop`, `plan.floorPct`. These are
   this module's arithmetic over the record, not the record. The `readableShares` list holds
   **only** years the library allows a central, which is what makes `peakShare` legal to print.
   The bank's own `revalidateBank` re-derives that printed peak on every re-entry. The `peakDrawn`
   figure is a different thing: it is the top of an interval. That is a real number the record
   carries, and it is not a central. Nothing here stops a sentence calling it a reading.

3. **Published break percentages.** `plan.seams[].magnitude` and `plan.windows[].magnitude` in the
   bank, and `overlap.gapPct` / `basisPct` / `scopeSharePct` in the value chart, come from
   `adspend.json`'s concordance. They are the record's own published figures about a seam, they
   carry no 80% interval, and no guard covers them. The value chart prefers the published figure
   and falls back to one computed from two centrals only where both sides are point marks.

4. **`plan.crossSections.get(y).totalMark.central`, multiplied by a member's share.** That is how
   the column prints each medium's dollars. It runs only where `xsec.definite` is true, which now
   requires a central for **every member and for the total**. Nothing stops a new draw site doing
   the same multiplication in the other branch.

5. **The rail board's plan is not sealed and not frozen.** It carries no marks and no levels — its
   tracks hold years, counts, grade tallies and the compiler's own sentences — and
   `renderRailBoard` does not accept an `options.plan`, so there is no re-entry to protect. If that
   board ever gains a value, it needs the seal.

6. **A caller who builds mark objects by hand and calls `svg-kit` directly.** Unchanged, and it is
   the widest limit here. `svg-kit` will draw a circle wherever it is told. That caller is not
   using a public option; they are rewriting a module, in a diff a reviewer reads. This is the same
   line the library draws around `mechanism_scope_rules`.

7. **A plan built at one cut and handed back after the cut moved is refused, not repaired.**
   `assertMarksHonest` re-derives every mark's kind against the **live** `guards.RULES`, so a plan
   built before `configureRules` moved `wideIntervalRatio` cannot be re-opened afterwards. That is
   the intended answer — a page whose marks and whose printed cut disagree is worse — and it means
   **re-plan after moving a convention**.

8. **Nothing here scans the built page.** Every guarantee above fires at a call site. A chart that
   never calls these functions gets none of them. That is the library's own widest limit and it
   applies unchanged one layer up.

---

# Branches unexercised by the frozen record

Two branches of this system are correct and **the record never runs them**. Both are exercised by
`charts.test.js` under a forced cut, and both rows are permanent.

| Branch | Why the record does not reach it | The forced test |
|---|---|---|
| `gdp-strip.js` — the whole span-only half of `drawReading`, the "span only" cell in the reading register, and `stripAlt`'s `couldExceed` sentence | All eleven share-of-GDP readings are inside the 60% cut. The widest is `e1-scale-009` (1914) at **42.4%**, so `plan.spanOnlyCount` is **0** on the record as frozen. | `configureRules({ wideIntervalRatio: 0.30 })` makes `e1-scale-009` span-only. The bench asserts one span-only reading, one span drawn in the DOM, and the register printing "span only" rather than a share. |
| `small-multiples.js` — `drawTotalPanel`'s opening sentence on a span-only first year, and the cross-section falling back to a span panel because **the total** has no middle value | `coen_mce` 1919 has a ratio of **35.0%**, inside the 60% cut, and so does every other total year. | The same forced cut. 1919 becomes span-only and the panel says "It rises from somewhere between $1.6bn and $2.3bn — that reading has no middle value". Sixteen years then have a span-only total, and the bench asserts none of them is drawn as a column. |

A forced test is weaker than real data. It is much stronger than a branch nobody has ever seen run.
That is how the cross-section came to draw internet 2007 as a definite length reading
"$10.5bn · 3.8%". The panel directly above it drew the same point correctly, as a span.

**The bank's span panel is exercised by the record.** Five years — 1997, 1999, 2005, 2006 and 2007
— hold a span-only member and are drawn as a row of ranges rather than a column, at the record's
own cut.

---

# The mark, in one paragraph

```
{ id, year, kind, lo, hi, ratio, grade, unit, label, verdict, central? }
```

`kind` is `"point"` or `"span"`, decided by `guards.markKindFor` and by nothing in this folder.
`lo` and `hi` are the 80% interval in drawing units and are always present. `central` is present
**only** when `kind === "point"`. The object is frozen at construction and membership of a
module-private `WeakSet` is the only proof it came from `planClaimMark`.

Everything else on a mark comes from `extra`, and `extra` is the closed list `EXTRA_KEYS` —
`source_series`, `medium`, `organField`, `statement` — with primitive values only. A key that is
not on that list is refused, and so is an object under a key that is, and so is a **symbol** key
(`Reflect.ownKeys`, because spread copies symbols and `Object.keys` does not see them) and an
**accessor** (a value that can change between the check and the copy). **A mark is the one place on
a plan the record walk does not look**, so it is the one place a record field must not be able to
reach.

To print what a mark reads: `markReading(mark, fmt)` for the full sentence, `markFigure(mark, fmt)`
where one figure has to stand in a sentence, `markTitle(mark, …)` for an accessible name. To place
a label: `anchorY(mark, scale)`, which returns a pixel. There is no fourth way, and there is no
number on a mark that a formatter will accept unless the library allowed it.

---

# Reader-facing prose

Every sentence these charts emit is generated at draw time and stamped
`data-alt-source="generated-by-chart"`, which is how team B8 finds all of them later and replaces
them with the authored ones from the data layer.

The measurement ran on 2026-08-01, with `tools/readability.py`. It covered 53 distinct strings:
every accessible name, figure caption and panel caption the four charts emit, at the record's own
cut **and** at the forced 0.30 cut. The four scores are **FK 6.35, Reading Ease 75.7, Gunning Fog
8.41, SMOG 8.64** — inside the gates of FK ≤ 10, Ease ≥ 50, Fog ≤ 12, SMOG ≤ 12.

The span-only sentences are inside that measurement on purpose. Prose a reader only meets when the
record gets wider is prose nobody has read.
