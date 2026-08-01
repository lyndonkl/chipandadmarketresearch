# `docs/p2/lib/` — the P2 design system

Direction: **The Bench** (`p2-ad-market/design/DESIGN.md`, locked 2026-07-31). Light mode only.
Built by team B1 (`p2-ad-market/BUILD-PLAN.md`). Everything downstream imports from here.

Plain ES modules. No build step, no bundler, no third-party dependency, no network request. The
whole folder works with the network cable pulled.

| File | What it is |
|---|---|
| `tokens.js` | Colour, type, structure, and the guards that stop a builder using them wrong. Single source of truth. Imports nothing. |
| `tokens.css` | The parts of the same system that belong to the cascade. Mirrors `tokens.js`; drift throws. |
| `guards.js` | The eight invariants, and the two drawing conventions (`RULES`) that are not in the data. Reads the six frozen files; contains none of them. Imports nothing. |
| `guards.test.html` | 200 cases (the page's own tally is authoritative; this number is written by hand and can go stale). Every guard against a real passing case, a real failing case, and every bypass ever found — including the two the last G7 repair introduced. |
| `motion.js` | Seven named verbs, each with a complete alternative encoding, plus the runtime motion toggle. |
| `demo-system.html` | Every token, every type role, every verb beside its reduced twin. Generated from the modules at load. |

**The internal imports, and why each one exists.** `motion.js` imports `ZINC_RULE` from
`tokens.js`, and `RULES` + `isWideInterval` + `claimInterval` + `intervalRatio` from `guards.js`.
None is convenience. A trail stroke typed as `'#838A93'` is a palette change that will not reach
it. A span-only threshold typed as `0.6` is a second answer to "is this claim wide?" that
`configureRules()` cannot move. And `claimInterval` is the whole reason **`motion.js` has no
independent notion of a valid interval**: the reduced TREMOR lozenge reads its `lo` and `hi` back
out of G1's own reader rather than out of `claim.ci80`. Every constant that means the same thing
in two files is imported from the one file that owns it. There are no other imports and no
cycles — `tokens.js` and `guards.js` both import nothing.

## Opening the demo

```
cd docs/p2
python3 -m http.server 8000
```
then `http://localhost:8000/lib/demo-system.html`.

Add `?motion=reduce` or `?motion=full` to force a mode from the URL; the toggle at the top of
the page does the same thing without touching any system preference.

Opening `demo-system.html` straight off the filesystem works in **Safari and Firefox**.
**Chrome blocks `<script type="module">` imports over `file://`**, so it needs the server line
above. The page detects this and says so rather than rendering blank. The individual modules
themselves have no such constraint — the shipped `index.html` will inline them, exactly as
`tools/build_p1.py` did for P1.

## Why the system is split across a `.js` and a `.css`

The chart layer builds SVG with `createElementNS` and paints with `setAttribute('fill', …)`.
**SVG presentation attributes do not resolve `var()`** — `setAttribute('fill','var(--p2-brass)')`
silently paints nothing. Every generated mark needs a literal string that can be imported,
tested and guarded. That is `tokens.js`.

Four things cannot be done well from JavaScript and live in `tokens.css`:

1. The custom-property declarations, so the first paint is correct before any module has parsed.
2. `@font-face`, including the metric-override fallback aliases.
3. `@keyframes` and `@media (prefers-reduced-motion)` — the media query is the only thing that
   is right before `initMotion()` has run.
4. The paper: the Bone ground and its 22px grid.

Both files declare the same 25 custom properties. **`verifyTokenParity()` reads them back out of
the cascade and throws if they have drifted.** Call it once on every page. Two sources of truth
is a bug waiting for 2am; that function is the alarm on it.

---

# What is guaranteed and what is advice

**Read this before you import anything.** Seven teams build on this folder. Some of what follows
refuses a mistake outright. Some of it only points at one. A guard that claims to be a guarantee
and is actually a heuristic is worse than no guard, because everyone downstream stops looking.

Two words, used exactly:

- **GUARANTEE** — the call refuses a shape, or checks a bounded finite record. No other way exists
  to say the wrong thing, and nothing can be paraphrased around it. It throws.
- **ADVICE** — a heuristic. It finds some of what is wrong and never claims to find all of it. It
  returns findings rather than throwing. A human reads every one.

**The prefix is a signal, not the rule.** `assert*` throws and `lint*` returns findings, both
without exception. `audit*` is mixed: `auditPalette()`, `auditReducedCoverage()` and
`auditTremorScope()` throw on drift, while `auditSeparation()` and `auditWideIntervals()` only
report. Read the row, not the name.

Three rows below were presented as guarantees in earlier drafts and are not. They are marked
**CORRECTED** and they are the rows to read twice.

| The rule | Which | What is covered, and what is not |
|---|---|---|
| **Nothing here runs unless you call it** | **ADVICE** | No guard scans the built page. Every guarantee below fires at one call site and nowhere else. A chart that never calls `drawMark` never gets G1. Nothing in this library can tell you which team skipped which call. This is the widest limit in the folder. |
| **G1 · No point on a wide interval** `drawMark(claim, kind)` | **GUARANTEE** | Covered: a point mark is refused on any claim whose 80% interval exceeds 60% of its central value. 65 of the 506 frozen claims. An inverted `[high, low]` and a central outside its own interval are refused for **both** mark kinds, and refused rather than repaired. Not covered: a chart that draws a dot without calling `drawMark`. The 60% cut is a drawing convention, not a measurement. |
| **G2 · No order on unranked quantities** `assertRankable` · `sortPools` · `renderPools` | **GUARANTEE** | Covered: any pair the record marks unranked, in the era you name, is refused for sort, stack, rank, pie, treemap and the rest of `ORDERED_LAYOUTS`. Eras 1, 5 and 7 each carry three such pairs. Pool ids must be strings; an object with no `id` is refused, never coerced. Not covered: the layout vocabulary is a fixed list in the module. An unknown layout name is refused, so nothing slips through, but a new ordered layout has to be added by hand. |
| **G3 · No splice** `assertNoSplice` · `buildPath` | **GUARANTEE** | Covered: two points with different `source_series` never land on one path. `buildPath` breaks and names the break. Not covered: a point stripped of `source_series` is refused, not judged. `basisBreakNote()` returns `null` when `adspend.json` is not loaded, so the "23.43% apart in 1980" sentence drops out of the error message without a word. The refusal itself still happens. |
| **G4 · No hard-coded series list** `selectSeries` | **GUARANTEE OF THE SELECTOR SHAPE — CORRECTED** | Covered: **the shape of the selector, and a written reason on any outcome that drops a series.** A predicate, a bare array, a bare string other than `"all"`, a criteria value that is a list, a key-like field such as `compiler`, an unknown field, an unknown value and a selection that matches nothing are all refused. The `because` requirement sits on the **outcome**, not the syntax, so `{ role: "stitch" }` is refused too and the refusal names the three series it would have dropped. **Not covered: that the whole record reaches the page.** `selectSeries(adspend, { role: "stitch", because: "…" })` is a legal, guaranteed call and it returns **five of the eight series** — `irs_soi`, `census_manufactures` and `bridge_mce_mg8` are gone. `{ role: "cross-check-only", because: "…" }` returns two. G4 makes a subset **visible in the diff and greppable**. It does not make the drawing complete. Completeness is `assertSeriesListComplete(list, adspend)`, which is a separate call nothing forces you to make. Also not covered: the key-like test is per **field**, not per value. `access` holds 7 distinct values across 8 series and passes, yet six of them name exactly one series. Near-keys are caught only by the reason requirement, not by the field refusal. |
| **G5 · Absence is an object** `buildPath` · `assertNoInterpolation` · `assertAbsenceDrawn` | **GUARANTEE** | Covered: omit `gaps` and the guard reads the four documented holes out of `adspend.json` (1840–1866, 1867–1918, 2008–2020, 2011–2025). A bare `[]` is refused. The declared-empty sentinel is authenticated by identity — membership of a module-private `WeakSet` a caller cannot reach — and no flag can forge it. Every gap you pass must overlap an absence the record actually has, so a well-formed `[3000, 3001]` decoy is refused. **There is no validation cache.** One was added to save re-deriving the absence set, keyed on object identity; gap arrays are mutable, so a list could be validated and then refilled with a decoy. Validation runs on content every call, and every validated list is deep-frozen. Not covered: `assertAbsenceDrawn` checks the `rendered` array **the chart layer hands it**. It does not read the DOM. |
| **G6 · The cross-era taxonomy** `assertTaxonomy({ scope, claimIds })` | **GUARANTEE** | Covered: `scope` is required, not defaulted. A view holding claims from both taxonomies throws. A view scoped `cross-era` that reads era-native claims throws. A view naming no claims throws rather than passing empty. Not covered: a view that reads the correct claim ids and then prints the wrong numbers beside them. The guard reads ids. |
| **G7 layer one · the scope check** `assertSimulatorMechanismScopes()` | **GUARANTEE** | Covered: 21 scenarios, 26 scopes, 8 declared rules. Every scenario must name a rule from the file's own vocabulary, a surface and a year range. No scope may put a first-price rule on search — checked against the rule's declared surfaces **and** against the first-price family, so neither edit alone switches it off. First-price settings need a display scope to own them; settings are read through `inherits`, transitively, and across **every identifier in the settings object**, not two named keys. An unresolvable or cyclic `inherits` is a hard error. The assert also calls `mechanismBearingScenarios()`, so a record where no rule declares `ad_auction` throws instead of quietly disarming the second layer. Bounded, finite, and no paraphrase of `{ rule: "first_price", surface: "search" }` exists. Not covered, and both are in `MECHANISM_SCOPE_LIMITS`: somebody inventing a rule id that neither names first price nor declares the family and pointing it at search; and a first-price rule written into a settings **sentence** rather than a settings value — the scan skips any string with whitespace in it, because reading prose here would make this a heuristic, which is what layer two is. |
| **G7 · caption containment** inside `assertScenarioMechanism` | **GUARANTEE OF PRESENCE ONLY — CORRECTED** | Covered: **the record's true sentence is on screen.** Every `required_caption` in the frozen scenario must appear in `caption`, `label`, `title`, `headline` or `captions`. Missing it throws. **Not covered: anything printed beside it.** A caption can carry the required true sentence **and a false one** and pass. Verified: the frozen sc-06 caption plus `"Search is billed the amount it offered."` throws nothing and produces zero lint findings. Containment is a substring test. It proves the true sentence is there. It proves nothing about what else is there. |
| **G7 layer two · the prose lint** `lintTextForDeadMechanism` · `lintSimulatorScenarios` · `adviseOnDeadMechanismText` | **ADVICE — CORRECTED** | A regex over English. It returns findings and never throws. The third adversarial round measured it over a **5,593-string corpus: it caught 19 and missed 22.** Known misses, and a named false-positive class, are below. **An empty result is not a clearance.** The enforcement for this rule is the row above it. |
| **G8 · Time is two fields** `assertTimeField` · `timelineYear` | **GUARANTEE** | Covered: `assertTimeField` refuses `as_of` and refuses any field that is not `about_year`. `timelineYear` refuses the 7 claims carrying `timeline_ready: false`, and refuses a missing `about_year` rather than falling back to provenance. 499 of 506 claims are drawable. Not covered: a chart that reads `claim.about_year` off the object and never calls either function. |
| **`GuardVacuousError` · a guard that lost its grounding** | **GUARANTEE** | Covered: every guard that derives its parameters from a frozen file throws when the parameter is no longer there. A guard that quietly starts passing everything is the failure this class exists for. Not covered: a record edited so the parameter is still present and now wrong. |
| **`configureRules(patch, reason)` · a moved convention is on the record** | **GUARANTEE** | Covered: a convention cannot be moved without a written reason. An unknown key is refused rather than assigned. `absenceForms` is refused when empty or not drawn from the design brief's own list. `rulesStatus()` reports whether the values are still default, which changed, and why. `resetRules()` puts them back. Not covered: the reason is prose. Nothing checks that it is true. |
| **Reduced motion · every verb declares an alternative encoding** `auditReducedCoverage()` | **GUARANTEE** | Covered: the audit throws unless all seven verbs carry `reduced.form`, `reduced.what` and `reduced.carries`. Not covered: **that the page draws it, or that the `carries` sentence is true.** The audit reads strings; it cannot check a claim about information. |
| **Reduced motion · TREMOR's hard rule** | **GUARANTEE** | Covered: both halves route through one gate into `guards.claimInterval` and `guards.isWideInterval`. Neither half runs on a claim G1 does not call wide. Neither runs on an unreadable interval. Both refuse **before** touching the element, so a refusal leaves no half-stamped mark behind. Verified: `ci80: [360, 96]` on a central of 192 is refused in full mode and in reduced mode. Not covered: the chart layer still has to draw the lozenge. `motion.js` stamps `data-reduced-encoding="lozenge"` and hands back the spec. |
| **Reduced motion · the two halves ask for the same things** | **NOT CHECKED IN CODE. A REVIEW RULE.** | `auditModeSymmetry()` was shipped and then deleted, and `motion.js` records why so nobody writes it back. It compared `Function.length`. Every verb takes its rules inside one destructured options object with a default, so every pair reads `0/0`, `1/1` or `2/2` whatever the halves require. `tremorFull` and `tremorReduced` were `1/1` before the fix that made them agree and `1/1` after. The audit passed both times, and passed on the day it was deleted while `sweepFull` was accepting an `el` that `sweepReduced` refused. **A verb added with a rule in one half only will not be caught by anything in this folder.** The `#### Verified verb by verb` table below is a snapshot dated 2026-07-31, not a live check. |
| **Reduced motion · which mode is in force** | **ADVICE** | Precedence: `setMotionMode()`, then `?motion=`, then `sessionStorage`, then the OS. **A URL beats the reader's operating system setting.** That is deliberate, for reviewers, and it means the reduced path is not guaranteed to a reader who asked for it at the OS level. `settleReduced(el, kf, { ghost: false })` drops the information SETTLE's fallback carries; the default draws it. |
| **`assertTextColor(hex, where)`** | **GUARANTEE** | Covered: the hex is one of the nine on the text allowlist. `ZINC_RULE`, raw `BRASS`, raw `CYAN`, `STIPPLE` and `BONE` are refused. Two rejections carry two different messages, so a caller is never sent to fix a contrast problem they do not have. **Not covered: the background.** Every ratio in this module is measured against Bone `#F2EEE4`. A glyph on any other ground is unmeasured. |
| **`assertObjectColor(hex, where)`** | **GUARANTEE** | Covered: the hex clears 3:1 on Bone (WCAG 1.4.11). Cyan at 2.46:1 is refused. Not covered: whether the Iron stroke that makes a Cyan fill legal was actually drawn. |
| **`assertDistinguishable(a, b, opts)`** | **GUARANTEE, with one advisory outcome** | Covered: worst case ΔE2000 across three dichromacies under two models, floor 11. A declared `redundant` channel must be one of five names, and must be a channel `REDUNDANT_CODING` records for one of the two colours. Not covered: when neither colour is a series role the cross-check cannot run. The return then carries `crossCheck: 'unverifiable'` and the declaration is taken on trust. Read that field. |
| **`verifyTokenParity(root)`** | **GUARANTEE** | Covered: all 25 custom properties, read back out of the live cascade. Not covered: a page that never calls it, and any value the module does not declare. |
| **`auditPalette()`** | **GUARANTEE** | Covered: every declared `onBone` contrast figure is recomputed and drift throws. Not covered: the hexes themselves. Those are the design's choice, not a measurement. |

## Which guards read the frozen files, and which carry a convention constant

Two different failure modes. A guard reading a frozen file goes stale when the record moves, and
`GuardVacuousError` is the alarm on that. A guard carrying a constant goes stale when the design
decision moves, and nothing raises an alarm at all. Know which kind you are calling.

| | Reads a frozen file | Carries a constant in the module |
|---|---|---|
| **G1** | Only `auditWideIntervals()` reads `claims.json`. `drawMark`, `isWideInterval` and `markKindFor` read **no file** — they judge the claim object you hand them. | `RULES.wideIntervalRatio` = `0.60`, cited to `DESIGN.md` rule 3. The point-mark and span-mark word lists. |
| **G2** | Yes, every call. `moneytype/reconciled.json`. | `ORDERED_LAYOUTS` and `UNORDERED_LAYOUTS`. |
| **G3** | `buildPath` yes, through G5. `canJoin` and `assertNoSplice` **no** — they read each point's own `source_series`. `basisBreakNote` reads `adspend.json` when loaded and returns `null` when not. | None. |
| **G4** | Yes, every call. `adspend.json`. Keys, roles, fields, values and which fields are key-like all come from the file. | The `because` test: at least 12 characters, at least 3 words, and a list of placeholder words. |
| **G5** | Yes, every call. `adspend.json`, for both the documented holes and each series' own year holes. | `RULES.absenceForms` = `stipple`, `hatch`, `block`, cited to `DESIGN.md` rule 5. |
| **G6** | Yes, every call. `moneytype/reconciled.json` and `eras/era-5.json`. Both seam figures are derived. | None. |
| **G7 layer one** | Yes, every call. `simulator-params.json` and `mechanism.json`. The rule vocabulary, the surfaces per rule and the 2019 date are all read. | `MECHANISM_SURFACES` = `search`, `display`. `FIRST_PRICE_FAMILY` = `first_price`. Year floor 1800, ceiling 2100. The three grounding probes. |
| **G7 layer two** | **No.** The lint reads only the string you give it. | The whole lint vocabulary: movement verbs, negators, contrast markers, sentence and clause splitters. |
| **G8** | Only `timelineClaims()` reads `claims.json`. `assertTimeField` and `timelineYear` read **no file**. | `PROVENANCE_FIELD` = `as_of`. `FACT_FIELD` = `about_year`. |
| **`tokens.js`** | **Nothing.** It reads no frozen file at all. | The eight hexes, `SEPARATION_FLOOR` 11, `SEPARATION_COMFORT` 20, `AA_TEXT` 4.5, `AA_OBJECT` 3, and the five redundant channels. |
| **`motion.js`** | **Nothing.** | The seven verbs and their timings. Its one shared number — the TREMOR cut — is imported from `guards.js` and never restated. |

`RULES.wideIntervalRatio` and `RULES.absenceForms` are the only two constants a caller may move,
through `configureRules(patch, reason)`. The reason is required and the patch is validated, so an
unknown key is refused rather than assigned. `rulesStatus()` reports whether the values are still
default and `resetRules()` puts them back. Moving the cut moves it for the chart layer and for
TREMOR at the same instant.

## What the reduced-motion path guarantees

Three things are guaranteed, and they are narrower than "reduced motion works".

1. **Every verb has a declared alternative encoding.** `auditReducedCoverage()` throws if a verb is
   added without `form`, `what` and `carries`. Seven verbs, seven twins.
2. **TREMOR refuses the same claims in both modes, and refuses before it writes.** A claim G1 will
   not call wide cannot tremor and cannot become a lozenge. A claim with an unreadable interval is
   refused in both modes. Neither half leaves a half-stamped element behind.
3. **TRAVERSE's reduced half will not run without its trail layer.** In full mode the travel carries
   the conservation proof. In reduced mode the ghost and the trail are the only things that can.
   `trailLayer` is required there and optional in the full half. That asymmetry is the rule, it is
   the only one in the file, and it is written down in both places.

What is **not** guaranteed:

- That the encoding reaches the screen. `motion.js` stamps attributes and returns a spec. Drawing
  is the chart layer's job.
- That the `carries` sentence is true. It is prose, checked for presence.
- That a reader who set reduced motion at the OS level gets it. `?motion=full` overrides them.
- Symmetry between the two halves of a verb. No code checks it. See the row above, and
  `motion.js`'s own note on why `auditModeSymmetry()` was deleted rather than repaired.

## Zinc: the rule token and the text token

Two tokens, one hue, one letter apart in an editor, and they are not interchangeable. Picking the
wrong one is silent in both directions. Every figure here is recomputed by `auditPalette()` and
`worstCaseSeparation()` at runtime.

| Token | Hex | On Bone `#F2EEE4` | AA text, 4.5:1 | Object, 3:1 | Use it for |
|---|---|---|---|---|---|
| `ZINC_RULE` (`--p2-zinc-rule`) | `#838A93` | **3.01:1** | **fails** | passes | Axes, gridlines, ticks, hairline separators. Lines only. |
| `ZINC_TEXT` (`--p2-zinc-text`) | `#646B74` | **4.65:1** | passes | passes | Organ labels, data chrome, any glyph. Text only. |
| `IRON` (for comparison) | `#5B6570` | **5.12:1** | passes | passes | Mechanism, at 1.5px. |

**Why the split cannot be closed.** `ZINC_TEXT` sits **ΔE2000 2.80** from `IRON` in normal vision,
and **2.45** at its worst across the dichromacies. Both are under the just-noticeable threshold for
adjacent patches. No AA-passing version of Zinc looks different from Iron. `ZINC_RULE` sits
**ΔE2000 14.95** from Iron, worst case **14.68**, which is why the rule token is safe beside iron
structure and the text token is not.

**Both wrong choices are silent.**

- A glyph painted `ZINC_RULE` fails AA at every size. `assertTextColor()` throws on it and names
  `#646B74` in the message.
- A hairline painted `ZINC_TEXT` reads as Iron at line weight. Iron means mechanism. The line then
  asserts bench structure where none exists, and **no guard catches it** — `ZINC_TEXT` clears the
  object test at 4.65:1, so `assertObjectColor()` passes it. This one is on review.

## The prose lint, measured

`lintTextForDeadMechanism(text)` is the only heuristic in the folder that reads reader-facing
prose. Treat it as a spell-checker.

**The numbers.** The third adversarial round ran it over a **5,593-string corpus**. It **caught 19
and missed 22** — under half of the hostile paraphrases put in front of it. That corpus was
generated for the attack and is not reproducible from the six frozen files as they stand. What
re-runs today, in this tree:

- Over all **23,124 strings** in the six frozen files, the lint returns **0 findings**. Zero false
  positives on the record.
- `guards.test.html` keeps **12** caught paraphrases and **2** misses as live rows.

**Known misses.** These two return nothing today. Both assert the false claim in plain English.
Both are passing rows in the test bench, so nobody mistakes the lint for the guard:

> "On search, the winner is billed the amount it offered."
> "Since 2019 the top search ad is sold at the price the advertiser named."

**`"Search pays its own bid."` is the third name on that list, and it is the one that matters.** It
is the plainest way to say the false thing in English, and it was invisible to three revisions of
this scanner, because the phrase carries its own verb and no movement verb sits between the channel
and the mechanism. A fourth pattern closed it. The two sentences above then walked in behind it.
Closing a miss is the move that never terminates. That is the whole argument for why this is advice
and why the enforcement lives in `assertSimulatorMechanismScopes()` instead.

**The known false-positive class: the lint reads the binding, not the frame.** A sentence that names
the false claim in order to deny it, doubt it, suppose it, or attribute it to somebody else is
flagged. All four of these are flagged today, and all four are true sentences:

> "If search had moved to first price, shading would have followed."
> "Many people believe search moved to first price in 2019."
> "The myth that search moved to first price in 2019 is widespread."
> "Would search ever move to first price?"

That class is this piece's own subject matter. A chapter correcting the most-repeated error about
2019 has to state the error to correct it. **Expect findings on true prose, and read every one.**
The lint is tuned for recall over precision on purpose: a false positive costs one line in a report
that a human reads, where it used to cost a failed build.

An in-clause negator before the end of the match suppresses a finding, which is why the record's own
caption — "Google Search never moved to first price" — comes back clean. A contrast marker inside
the matched span does the same, which is why "Display went to unified first price on 2019-09-05,
while search got rGSP" comes back clean.

`DEAD_MECHANISM_LINT_LIMITS` exports all of this as data, so a report prints the limits beside the
findings.

---

# `tokens.js`

## Colour

Eight colours. Each means exactly one thing, and the "never" is as load-bearing as the "for".

| Token | Hex | Is for | Must never be |
|---|---|---|---|
| `BONE` | `#F2EEE4` | The ground. Engineering paper, 22px grid at 4.5% ink. | A mark. A fill inside a drawing — use `SURFACE.paper`. |
| `GRAPHITE` | `#15181D` | Prose, headings, primary rules. | A data series. Graphite is the page speaking, not the record. |
| `ZINC_RULE` | `#838A93` | **Lines only.** Axes, gridlines, ticks. | **Text.** 3.01:1 fails AA at every size. |
| `ZINC_TEXT` | `#646B74` | **Glyphs only.** Organ labels, data chrome. | A hairline — it reads as Iron at line weight. |
| `BRASS` | `#B07A2C` | **Money.** Every particle, every spend series. | The take (Rust). A count (Cyan). Text. |
| `BRASS_TEXT` | `#8A5F20` | A money figure printed as text. | A mark — it is too dark against the brass series. |
| `CYAN` | `#3AA6BD` | **The count.** Circulation, ratings, impressions, clicks. | Money. Text. A fill **without an Iron stroke**. |
| `CYAN_TEXT` | `#1F6E80` | A count printed as text. | A mark. |
| `IRON` | `#5B6570` | **Mechanism.** Bench structure, rails, frames, calipers. | A value. Iron is the apparatus, never its reading. |
| `RUST` | `#A8442E` | **The take.** The intermediary's cut and the front-door rent. | A warning, an error, or "bad". It is a share of the money. Unhatched. |
| `STIPPLE` | `#C9C2B4` | **Documented absence.** A 2px texture in a named, framed block. | A fill. Text. A series. Whitespace standing in for it. |

`INK.primary / secondary / tertiary / quiet` are graphite stepped by opacity, for prose that
recedes without changing hue. `INK.quiet` (6.55:1) is the floor for body prose.

### The Zinc fix

`DESIGN.md` records Zinc on Bone as 2.95:1. **Measured here it is 3.01:1** — the same verdict
either way, and the module reports the measured figure. It clears 3:1 for a non-text graphical
object (WCAG 1.4.11) and fails 4.5:1 for text (WCAG 1.4.3) at every size.

`ZINC_TEXT` `#646B74` is the darkened sibling: same OKLCH hue (254.7°) and chroma, lightness
dropped from 0.631 to 0.559 until it clears AA. **4.65:1 on Bone.** The value is identical to the
one the chosen sample page `design/samples/bench.html` already uses, so the sample and the library
agree.

**One thing about the palette cannot be fixed, and it should be said out loud.** No AA-passing
version of Zinc looks different from Iron. `ZINC_TEXT` sits **ΔE2000 2.80** from `IRON`, below the
just-noticeable threshold for adjacent patches. The palette has room for exactly one mid grey at
text weight. So the two tokens are separated by *role* and by *stroke weight*, never by
appearance. That is why the names are long, why `--p2-zinc-rule` and `--p2-zinc-text` do not
abbreviate, and why `assertTextColor()` throws instead of warning.

## Colour vision

`worstCaseSeparation(a, b)` runs both **Machado, Oliveira & Fernandes 2009** and
**Viénot, Brettel & Mollon 1999** across all three dichromacies at full severity, and reports the
worst. Two models rather than one because on this palette they disagree, and a guard that trusted
only the friendlier one would wave through the pair this project cannot afford to get wrong.

**Brass against Cyan passes, with a wide margin.** ΔE2000 ≥ 40 in all six simulations. The
thesis pair is safe.

| Vision | Model | Brass → | Cyan → | ΔE2000 |
|---|---|---|---|---|
| normal | — | `#B07A2C` | `#3AA6BD` | 42.5 |
| protanopia | Machado | `#8D7D21` | `#96A1BE` | **40.1** |
| protanopia | Viénot | `#82822D` | `#9E9EBD` | 41.9 |
| deuteranopia | Machado | `#9A8A2E` | `#8393BD` | 43.0 |
| deuteranopia | Viénot | `#8D8D27` | `#9191BE` | 47.6 |
| tritanopia | Machado | `#C06C6A` | `#00AFAD` | 50.9 |
| tritanopia | Viénot | `#989800` | `#8080FF` | 68.8 |

**One caveat that the number does not carry.** ΔE2000 is calibrated on large adjacent patches.
Brass and Cyan are only **1.30:1 apart in luminance**, dropping to **1.14:1** under deuteranopia —
so at 1px, at particle size, or on a printer, the pair separates by hue and by nothing else.
Money is therefore always a filled round mark and the count is always an open mark with an Iron
stroke. That redundancy is required regardless of this table.

**Two pairs fail on hue alone, and both are real co-occurrences:**

| Pair | Normal | Worst | Under | The second channel that fixes it |
|---|---|---|---|---|
| Brass / Rust | 24.2 | **7.8** | tritanopia (Viénot) | 45° hatch on every Rust fill, plus a printed label. Already mandated by `DESIGN.md`; now enforced. |
| Zinc / Cyan | 18.9 | **10.7** | protanopia (Machado) | Weight and continuity: Zinc is 1px and dashed where indicative, a Cyan series is 2px and continuous. |

Brass/Rust is the sharper of the two. The two models disagree badly — Machado says 14.9 for the
same tritanope, Viénot says 7.8 — and the guard takes 7.8. Note also that the original proposal
justified Rust's hex as "pushed browner **for protanopic separation** from Brass". The
measurements do not support that rationale: protanopia is the *best* of the three for this pair
(17.2). The degradation is in deuteranopia (12.5) and tritanopia (7.8). The hex is fine; the
reason given for it was wrong, and the hatch is doing the work.

`assertDistinguishable(BRASS, RUST)` **throws**. `assertDistinguishable(BRASS, RUST, { redundant:
['hatch', 'label'] })` returns with a warning. Zinc/Iron (14.7) and Brass/Stipple (20.0)
are *tight* — they pass, with no headroom at 1px — and are flagged rather than thrown.

The escape hatch is closed at both ends. `redundant` must name one or more of the five channels in
`REDUNDANT_CHANNELS` — `dash`, `hatch`, `position`, `weight`, `label` — so `{ redundant: true }`,
`{ redundant: 'vibes' }` and `{ redundant: 'colour' }` are `RangeError`s rather than passes.
The name is then cross-checked against `REDUNDANT_CODING`, which is the record of what the drawing
actually does. `{ redundant: 'position' }` on Brass/Rust throws. Neither colour is drawn
positionally, and a redundancy that exists only in an argument list is not a redundancy. The return
carries `crossCheck: 'confirmed' | 'unverifiable' | 'n/a'`, so a caller can see whether the check
could be made at all.

## Guards

| Function | Throws when |
|---|---|
| `assertTextColor(hex, where)` | Any colour outside the text allowlist reaches a glyph. Two rejections, two messages: below 4.5:1 it says the contrast failed and names the correct sibling; at or above 4.5:1 it says contrast is **not** the problem and that the palette is closed. An error that misstates why sends the reader to fix the wrong thing. |
| `assertObjectColor(hex, where)` | A colour below 3:1 on Bone is used as a standalone graphical object. Cyan fails this; that is why Cyan fills carry an Iron stroke. |
| `assertDistinguishable(a, b, opts)` | Two colours fall below ΔE2000 11 under any dichromacy in either model, with no `redundant` channel declared — or a channel is declared that is not in `REDUNDANT_CHANNELS`, or that the record does not say either colour carries. |
| `auditPalette()` | A declared contrast figure no longer matches the measured one. |
| `verifyTokenParity()` | `tokens.css` and `tokens.js` disagree on any of the 25 custom properties. |
| `parseHex(hex)` | Anything that is not `#RRGGBB`. |

`auditSeparation()` returns every hue pair, worst case, sorted tightest first. `REDUNDANT_CODING`
names the non-hue channel each series role carries and why it is not optional. **This project
never relies on hue alone** — those two exports are how that claim stays true after the sixth
engineer joins.

## Type

Four faces, one job each, and the jobs never overlap. `TYPE_ROLE` carries the full spec; the
matching classes are in `tokens.css`.

| Role | Face | Class | For | Never |
|---|---|---|---|---|
| `numeral` | Martian Mono 600 | `.p2-num` | Every numeral and readout. Tabular figures. | Prose. A label. |
| `prose` | Newsreader 400/19px/1.65 | `.p2-prose` | Body prose, ledes, sentence captions. | A numeral inside a readout — wrap those in `.p2-num`. |
| `chrome` | IBM Plex Mono 400/12px | `.p2-chrome` | Tooltips, 80% intervals, A/B/C grades, claim ids, arithmetic panels. | A headline readout. |
| `label` | Instrument Sans 600/11px/+0.08em/upper | `.p2-arch` | The eight organ names, knobs, panel titles. | A value. If a label can be read as a reading, the bench grammar fails. |

### What the ship-time font step must do

`FONT_SHIP_SPEC` is the acceptance list, not advice. The one that will bite:

> `pyftsubset` **must** be called with `--layout-features="+tnum,+kern,+liga,+calt"` on Martian
> Mono and IBM Plex Mono. **The default subsetter feature set drops `tnum`.** Without it,
> `font-variant-numeric: tabular-nums` silently does nothing, the digits go proportional, and
> every readout physically jitters while the reader drags — which is the exact failure the
> numeral role exists to prevent. It would also collide with TREMOR's meaning, since a jittering
> number would read as an uncertainty signal.
>
> Verify by rendering `0000000000` against `1111111111` and comparing measured width. Equal to
> the pixel, or the subset is rejected. `demo-system.html` runs this check live.

Also: do not subset away `U+2212` (minus) — a hyphen in a negative readout is a different width
and breaks the tabular column. Self-host under `docs/p2/fonts/`; no Google Fonts, no CDN.
`font-display: block` on the numeral face and `swap` on the rest, because a readout that reflows
mid-drag is worse than one that arrives 200ms late.

The four `@font-face` fallback aliases in `tokens.css` carry `size-adjust` / `ascent-override` /
`descent-override` marked **MEASURE-AT-SHIP**. Fill them in from the real faces so the fallback
occupies the same box and nothing reflows when the webfont lands. The page is line-work aligned
to a 22px grid; a 3% metric mismatch on the numeral face moves every readout off the grid for the
length of the swap.

---

# `guards.js`

The eight invariants from `DESIGN.md`, "Rules that are not reopened", enforced in code. 1,681
lines, and the half of this folder that every remaining team imports.

**Why these are code and not a style guide.** Five independent design architects reached six of
these on their own; the research added two more. Every one of them, when broken, produces a page
that looks completely fine and says something false. None announce themselves at review time. A
convention is a thing a tired person forgets, and stage R3b of this project lost four hours to a
wrong number that four separate verification gates had confirmed. So each one throws.

## The one rule the module is built on

**The safe thing is the default and the unsafe thing is explicit.** Every guard's laziest
correct-looking call either does the safe thing or refuses to run.

This is not decoration. The worst defect ever found in this file was `buildPath(points)`, the
shortest and most natural way to call it. It drew one unbroken line straight across the documented
2008–2020 hole. `gaps` was an optional argument, and its default was the unsafe one. The guard
whose entire job is to stop a line crossing a hole did nothing at all unless you remembered to
configure it.

**A guard that only works when you remember to configure it is a comment.** If you are adding to
this file, that sentence is the acceptance test.

## What a guard owes you

- A **throwing form** for build time and a **boolean form** for tests.
- **Parameters read out of the frozen files.** There are no hard-coded claim lists, no hard-coded
  series names, no hard-coded unranked pairs, and no hard-coded figures in the error messages. The
  data moves; the guards follow.
- **A docstring naming the real failure it prevents.** A guard whose reason has been forgotten gets
  deleted by the next person.
- **`GuardVacuousError` when it cannot find its own grounding.** Every guard derives its parameters
  by reading the record. If the record is edited so the parameter disappears, the naive failure mode
  is that the guard quietly starts passing everything. This error makes that loud. It is the most
  important class in the file.

## The frozen registry

Guards never contain data. They read it. Six files, under `p2-ad-market/data/`, frozen 2026-07-31.

```js
import * as guards from './lib/guards.js';
await guards.loadFrozen();                    // over http(s)
guards.useFrozen({ claims, adspend, … });     // or inject, for a built page or a test
```

`setFrozen` · `useFrozen` · `getFrozen` · `snapshotFrozen` · `clearFrozen` · `frozenStatus` ·
`requireFrozen`. Every guard also takes an explicit frozen object as its **last** argument, so it
can be called pure with no registry at all. Browsers block `fetch` on `file://` origins, so a page
opened straight off disk must inject.

## The eight

| Guard | Throwing | Boolean | Reads |
|---|---|---|---|
| **G1** no point on a wide interval | `drawMark(claim, kind)` · `assertNoPointOnWideInterval` | `isWideInterval` · `markKindFor` · `intervalRatio` · `auditWideIntervals` | `claims.json` |
| **G2** no order on unranked quantities | `assertRankable(era, ids, op)` · `sortPools` · `renderPools` | `isRankable` · `findUnrankedPair` · `unrankedPairs` | `moneytype/reconciled.json` |
| **G3** no splice | `assertNoSplice(points, ctx)` · `buildPath` breaks instead | `canJoin` · `basisBreakNote` | `adspend.json` |
| **G4** no hard-coded series list | `assertSeriesListComplete` · `selectSeries(adspend, "all" \| {role, because} \| {only, because})` | `isSeriesListComplete` · `seriesKeys` · `seriesRoles` · `seriesFields` · `seriesKeyLikeFields` · `seriesDigest` | `adspend.json` |
| **G5** absence is an object | `assertAbsenceDrawn` · `assertNoInterpolation` | `isAbsenceDrawn` · `coverageGaps` · `seriesYearGaps` · `gapsBetween` · `declareNoDocumentedGaps` | `adspend.json` |
| **G6** the cross-era taxonomy | `assertTaxonomy({scope, claimIds})` · `assertNoTaxonomyMix` · `assertTaxonomyField` | `isTaxonomyConsistent` · `taxonomyOf` · `taxonomyRules` · `taxonomySeamFigures` | `reconciled.json`, `eras/era-5.json` |
| **G7** the dead-mechanism guard | `assertSimulatorMechanismScopes` · `assertMechanism2019` · `assertScenarioMechanism` | `isMechanism2019Correct` · `mechanismSentence` · `mechanismScopeVocabulary` · `auditSimulatorMechanismScopes` | `mechanism.json`, `simulator-params.json` |
| **G8** time is two fields | `assertTimeField(field)` · `timelineYear(claim)` · `filterByYear` | `isTimelineDrawable` · `timelineClaims` · `timeFieldDivergence` | `claims.json` |

`GUARDS` is the manifest, one row per guard. Read it through **`guardManifest()`**, not directly:
the function fills in the figures from the record, and the constant carries `{seam.usd}`-style
placeholders rather than numbers so they cannot drift.

### Guarantee, or advice

One column is missing from that table on purpose. G7 carries a third row, `heuristic`, and it is
the only one in the file:

| | What it is | What it returns |
|---|---|---|
| `assert*` | A **guarantee**. It refuses a shape, or checks a bounded finite record. There is no other way to say the wrong thing, so there is nothing to paraphrase around. | Throws. |
| `lint*` | **Advice**. A heuristic over prose, which is unbounded. It finds some of what is wrong and never claims to find all of it. | Findings. Never throws. |

`lintTextForDeadMechanism(text)` and `lintSimulatorScenarios()` are the two lint functions.
**An empty result from either is not a clearance.** `DEAD_MECHANISM_LINT_LIMITS` publishes the
limits, including two sentences it verifiably misses today, so a report can print them next to the
findings.

This split exists because both of the guards below were defeated twice, and both times the repair
was a better detector. A guard that claims to be a guarantee and is actually a heuristic is worse
than no guard, because everyone downstream stops looking.

**The naming rule is not the whole story.** An `assert*` name tells you the call throws. It does not
tell you what the throw covers. G4 guarantees the shape of a selector and not the completeness of a
chart; G7's caption test guarantees a true sentence is on screen and says nothing about a false one
printed beside it. **[What is guaranteed and what is advice](#what-is-guaranteed-and-what-is-advice)**
is the row-by-row table, near the top of this file. Read it before you rely on any call below.

## What each guard is for, and what it must never be used for

### G1 — `drawMark(claim, kind)`

65 of the 506 claims carry an 80% interval wider than 60% of their central value. `e1-buyers-008`
is "$192m, somewhere between $96m and $360m". Drawn as a dot at 192 it reads as a measurement; it
is the midpoint of a range spanning a factor of nearly four, and a reader who sees the dot will
quote 192 back at you. On these claims there is no dot at all — the span is the mark. Error bars
do not fix it, because the eye lands on the dot.

**Never** use it to decide whether a claim is *uncertain* in prose — it answers one question, about
one drawing decision. **Never** hand it a claim you have reshaped: it validates the ci80's
orientation and refuses an inverted `[high, low]` rather than sorting it, because sorting would fix
the picture and leave `claims.json` wrong. **The 65 are never listed anywhere** — they are recomputed
every call, so a repair that widens or narrows an interval moves a claim in or out of the set
without anybody updating a list.

### G2 — `assertRankable(era, ids, op)` / `sortPools` / `renderPools`

Era 7's `national_brand`, `direct_response` and `local_retail` cannot be ordered against each other;
only their ordering against `classified` is established. The reason is structural, not statistical:
national brand's dominant route is a residual computed after direct response is subtracted, so the
two move one-for-one, and an independent instrument reverses them outright.

This catches any stack, any sort, any ordered list, any bar chart with the tallest bar first. Each
of those asserts an ordering *with the layout*, silently, in a way no caption can take back.

**Ids must be strings.** Pass `"national_brand"` or `{ id: "national_brand" }`. An object keyed by
`name` is refused, loudly, rather than coerced — `p.id ?? p` used to stringify it to
`"[object Object]"`, which matches no pair in the record, and era 7's unranked pools came back
sorted with no throw. **Never** hard-code the pairs: they are read from `reconciled.json` by era,
and eras 1 and 5 carry their own.

### G3 — `assertNoSplice(points, ctx)` / `buildPath(points)`

Coen/McCann measures advertiser billings, bottom-up, at list price, across eleven media. MAGNA
measures media-owner revenue, top-down, across eight. They are different objects wearing the same
headline, and they sit 23.43% apart in 1980 — of which roughly 69% is category scope and only 7.2
points is price basis.

One line running 1919 to 2025 is the single most attractive chart in this dataset and it is a lie:
the reader sees a 23% event in 1980 that never happened in the market, only in the ruler. Where two
rails overlap, draw both and label the distance. **The gap is an object, not an embarrassment.**

**Never** strip `source_series` when reshaping points — a point without it cannot be judged and is
refused. **Never** use `assertNoSplice` where you meant `buildPath`: the first permits a path that
is already one rail, the second segments a mixed one.

### G4 — `selectSeries(adspend, "all" | {role, because} | {only, because})`

The schema spec named five series. `adspend.json` holds eight. The three that arrived later are the
ones that carry the arguments: `naa_newspaper` is the only source for the classified money-type axis,
`census_manufactures` the only official enumerated cross-check before 1960, and `bridge_mce_mg8` the
bridge ribbon. A chart that reads a literal list of five renders perfectly, looks complete, and has
dropped three whole arguments. `FREEZE.md` opens its "three things a builder must not get wrong"
with exactly this.

**Detection was tried twice and lost twice.** First an array was refused; the same five keys
moved into a predicate. Then the predicate's own SOURCE was read, and refused if it named two or
more keys. The array moved one line up into a `const`. A `.bind()`ed predicate reported
`[native code]` and was granted an exemption **by name** — which is not an exemption, it is a hole.
Both dropped the same three series. Both looked like the supported call.

**So the shape is refused instead, and every selection that drops a series carries a written
reason.** There are three forms and no fourth:

```js
selectSeries(adspend, "all")                                        // every series; drops nothing
selectSeries(adspend, { role: "stitch", because: "…" })             // a property the file declares
selectSeries(adspend, { role: "stitch", access: "free", because: "…" })  // a conjunction of them
selectSeries(adspend, { only: ["coen_mce", "magna"],
                        because: "the rails board draws the stitch pair" })
```

The property forms are answered by the record, so they cannot go stale: a series added to
`adspend.json` turns up in them with no call site edited. Field names and values are checked against
`seriesFields(adspend)`, so a typo is refused with the real values beside it rather than quietly
selecting nothing.

**And then the criteria form reopened the hole it was built to close, twice.**

*A field that is a key wearing a disguise.* `adspend.json`'s series carry `compiler`, `measures`,
`why_added` and `as_of_convention`, and every value of each names exactly one series. So
`{ compiler: "MAGNA Global (IPG Mediabrands)" }` is `{ key: "magna" }` with a longer string in it,
and eight such calls rebuild the five-series list with no reason written anywhere. `{ key: … }` had
been removed for exactly this reason and walked straight back in through the record's own metadata.
**A field is now selectable only when it has fewer distinct values than series carrying it.** That
is, only when it names a group. Naming a group is the one thing this form is for.
`seriesKeyLikeFields(adspend)` lists the fields refused, with the counts that made the call.

*The reason was attached to the syntax, not the outcome.* `{ role: "stitch" }` returns five series
and silently drops `census_manufactures` and `bridge_mce_mg8` — two of the three this guard is named
for — because the `because` requirement keyed off the word `only`. That call is the form the guard's
own error message used to recommend. **The requirement now attaches to what came back:** any
selection that leaves a series off the chart needs the sentence, whichever form asked for it, and
the refusal names what was dropped.

`because` is validated: present, a string, long enough and worded enough to be a thought rather than
`"todo"`. It is also **greppable**. Anyone auditing which charts are not drawing the whole record
finds every one of them in one search.

**A predicate is refused outright**, and the refusal names the three replacements.

The point is not that the guard now catches the five-key list. It is that a developer who wants five
series has to write down that they are dropping three, and why. That is a decision a reviewer can
see, rather than a bug a scanner has to catch — and no scanner caught it twice running.

### G5 — `buildPath(points)` / `assertNoInterpolation` / `assertAbsenceDrawn`

Four documented holes: 1840–1866 (no estimate of US advertising of any kind exists), 1867–1918
(benchmark years only), 2008–2020 (no free annual total between Coen's last year and MAGNA's press
releases) and 2011–2025 (no free by-medium series).

Two failures. **Interpolation:** a line from 2007 to 2021 invents thirteen years, and it is the most
natural thing in the world for a charting library to do. **Whitespace:** a gap left blank reads as
zero, when the absence is itself one of the piece's findings — the fifteen years the project cares
most about are the least measurable in the whole window.

**`gaps` is optional and its default reads the record.** `buildPath(points)` breaks at all four
holes; `assertNoInterpolation(points)` checks against all four. This is the fix for the worst
defect this file has had. Three things follow:

- **Never pass `[]`.** An empty gap list guards nothing while appearing switched on, and it is
  refused with `GuardVacuousError`.
- If a rail genuinely has no documented hole, say so with **`NO_DOCUMENTED_GAPS`**, or mint one
  with a reason of your own: **`declareNoDocumentedGaps("iab_pwc publishes every year of its
  coverage")`**. It is greppable; a bare `[]` is not, and anyone auditing what is unguarded needs to
  be able to find every exemption in one search. `seriesYearGaps()` returns it rather than a bare
  empty.
- **The sentinel is authenticated by IDENTITY, not by a flag.** It used to be recognised by
  `gaps.declaredEmpty === true`, so the greppable exemption could be forged inline in one
  expression — `Object.assign([], { declaredEmpty: true })` — which is shorter than importing the
  real one, and therefore what a hurried person writes. There is no flag to copy now: the guard asks
  whether the object came from this module.
- **Every gap you pass must intersect an absence the record actually has.** A well-formed decoy —
  `{ years: [3000, 3001] }` — used to pass every shape check and guard nothing, while the call
  reported itself configured. The gap list is now checked against the documented holes **and** every
  series' own year holes, both computed from `adspend.json`.
- **There is no validation cache, and the reason is the sharpest lesson in this folder.** One was
  added on top of that reality check, to save re-deriving the absence set on every step of a path.
  It was a `WeakSet` of gap arrays, tested above the shape checks and above the reality check. A
  `WeakSet` keys on object identity. Gap arrays are mutable. So what it remembered was *this object
  was once valid*, and this passed:

  ```js
  const gaps = [{ years: [2008, 2020], reason: "the real hole" }];
  buildPath(points, { gaps });      // validated, and remembered
  gaps[0].years = [3000, 3001];     // same object, now a decoy
  buildPath(points, { gaps });      // 1 segment, 0 breaks
  ```

  One unbroken line straight across the documented 2008–2020 hole, with the guard reporting itself
  switched on. `coverageGaps()` and `seriesYearGaps()` were worse: they pre-authenticated their own
  result, so emptying and refilling one produced a trusted decoy in two statements. **A later fix
  reopened an earlier hole, and the fix that reopened it was the one that added machinery.** The
  cache is gone. Validation runs on content every call, and every list that passes is deep-frozen —
  the array, each gap and each `years` range — so the mutation is refused where it is written.
- **The four holes are holes in the TOTAL rail, not in every series** — `iab_pwc` publishes every
  year through 2025 inside the 2011–2025 by-medium gap. Scope them with an explicit `gaps` when you
  are drawing one series, or use `seriesYearGaps(key)`.

Absence is drawn as **stipple, hatch or a named empty block** (`RULES.absenceForms`), never as
whitespace and never as a line through the gap. An object with no label does not count.

### G6 — `assertTaxonomy({ scope, claimIds })` / `assertNoTaxonomyMix(view)`

Era 5 carries two money-type taxonomies **on purpose**. Gate B declared the seam rather than
resolving it. `by_money_type` splits Yellow Pages money by advertiser geography; that is the
era-native rule. `by_money_type_alt` puts all directory money in one intent pool. That is the
cross-era comparable rule, and eras 6 and 7 and the dataset's own grouping already use it.

The block that moves is $11,135m — 4.50 points of the 2000 US market — and it is enough to reverse
which of `local_retail` and `direct_response` leads. A chart that sets era 5 beside era 6 using era
5's native numbers crosses an undocumented redefinition and shows a market reversal that is a
classification artifact. Nobody looking at the finished picture could tell.

**`scope` is required.** It is the half of the guard that knows whether era 5 is being set beside
another era. It used to be optional, so `assertTaxonomy({ claimIds })` ran only the mixing test —
and a cross-era chart on era-5-native numbers is consistent with itself, passes that test, and is
the exact failure G6 exists for. **If you want only the mixing test, call `assertNoTaxonomyMix`.**
The name is the declaration; an omission that turns off half a guard must not be spelled as a
missing key.

**Never** decide which taxonomy a field carries by looking at its name. `taxonomyOfField` resolves
it through `era-5.json` and `reconciled.json`.

### G7 — `assertSimulatorMechanismScopes()` / `assertMechanism2019` / `lintTextForDeadMechanism`

The auction bench teaches the 2002 quality-weighted second-price auction. In 2019 two things
happened on opposite sides of Google's business, in opposite directions. Google Ad Manager — the
open-web **DISPLAY** exchange — moved to a unified first-price auction on 2019-09-05. Google
**SEARCH** did not, and never has; the 2019 search change was rGSP, a randomised generalised
second-price auction that the DOJ record shows was an explicit revenue play.

`mechanism.json` calls the conflation "the standard error in retellings of the 2019 transition". A
simulator is a very effective way to teach a wrong thing, because the reader does not experience it
as a claim — they experience it as something they worked out themselves.

This guard is in **two layers**, and the split is the whole design.

#### Layer one — the data, which is the guarantee

Every scenario in `simulator-params.json` carries a **`mechanism_scope`**: which rule it
demonstrates, which surface it ran on (`search` or `display`), and which years.

```json
"mechanism_scope": [
  { "rule": "first_price", "surface": "display", "years": [2019, 2019] },
  { "rule": "rgsp",        "surface": "search",  "years": [2019, 2019] }
]
```

`assertSimulatorMechanismScopes()` enforces five things over the whole file:

- **A scenario without a scope is a hard error, never a default.** The absent case must not be the
  permissive one, or the next scenario added inherits silence and the rule stops applying to it.
- **`rule` must be a key of `mechanism_scope_rules`**, the vocabulary the file itself declares. An
  invented rule name is how a first-price auction would arrive on search under another word, so an
  unknown rule is refused rather than trusted.
- **No scope may pair `search` with a first-price rule.** Checked twice — against the rule's own
  declared surfaces, and against the first-price family directly — so neither edit alone switches it
  off. The vocabulary is checked too: a first-price rule may not list `search`, and a rule whose id
  names first price may not declare some other family.
- **Settings that drive a first-price auction need a display scope to own them.** `sc-06` runs one
  from `settings.pricing_rule`; if its scopes were all on search the panel would be a first-price
  auction under a search label while every scope read as legal.

  This check read two named keys, `pricing_rule` and `ranking_rule`, and the record's own
  `settings` object only. Both readings were holes. Three scenarios in the frozen file declare
  `settings: { inherits: … }`, so a scenario could inherit `sc-06`'s first-price settings, declare
  only search scopes, and pass with the whole-file assert green. Settings are also free shape. A
  rule under any third key name was invisible here and visible to the simulator. **`inherits` is now
  resolved transitively.** An unresolvable parent or a cycle is a hard error: settings the guard
  cannot see are settings it cannot check. **And every identifier in the merged settings is read**,
  at any depth, key as well as value.

  The scan skips any string containing whitespace. That is a **written limit**, kept in
  `MECHANISM_SCOPE_LIMITS`. A value with spaces in it is prose, not a rule id. Reading prose here
  would make layer one a heuristic over English, which is what layer two is and says it is. Take
  `sc-03`. Its overlay note says "add a pay-your-bid comparison row". That is a true sentence about
  a search panel, and a scan that read it would flag that scenario forever.
- **At least one rule in the file must declare `ad_auction`.** That flag is what
  `mechanismBearingScenarios()` reads to decide which panels must declare a channel when they are
  rendered. Deleting eight words from the JSON disarmed that second layer across all 21 scenarios,
  and this assert stayed green because nothing in `guards.js` called it — only the test page did. It
  is called from here now, so the empty case is a `GuardVacuousError`.

This is a bounded check over a finite file. Unlike a prose scan it has an answer rather than a
batting average, and there is no paraphrase of `{ rule: "first_price", surface: "search" }`. What it
does **not** cover is listed in `MECHANISM_SCOPE_LIMITS`, exported so a report can print it.

`mechanismSentence(channel)` renders the true sentence from `mechanism.json`, so nobody has to type
one. `assertScenarioMechanism(scenario)` adds three more requirements. A scenario the record marks
as an ad auction must declare its `channel` when it is rendered. That channel must be a surface its
own scope covers. And every `required_caption` in the record must reach the screen.

#### Layer two — the text lint, which is advice

`lintTextForDeadMechanism(text)` **returns findings and never throws.** It asks for a verb of
movement or state binding search TO first price, unnegated, in any word order, and it scans every
unit at both granularities — whole sentence and clause — with asides scanned separately as well as
lifted out. Both granularities are kept because each covers the other's regression:

- splitting on `and` severs a verb from its object, so *"Google moved both of its auctions, display
  and search, to first price in 2019"* stopped being seen at all;
- stripping dash asides is content-blind, so *"The 2019 change - search moved to first price - was
  widely reported"* lost its subject and came back clean.

Both are covered now, and **it still misses ordinary English.** These two return nothing today:

> "On search, the winner is billed the amount it offered."
> "Since 2019 the top search ad is sold at the price the advertiser named."

They are in `DEAD_MECHANISM_LINT_LIMITS` and in the test bench as passing cases, so that nobody
mistakes the lint for the guard. There is no version of this function that ends that list.
**An empty result is not a clearance.**

`lintSimulatorScenarios()` runs the lint over every string in every frozen scenario and reports each
finding **against the scenario that owns it**, with the path to the field — which is where somebody
can actually fix it.

**Never widen the lint to bare co-occurrence of "search" and "first price".** That was measured
against the whole frozen record and it is not viable. `mechanism.json` describes a default
distribution deal "shaped like a first-price sealed-bid auction" between an access-point owner and a
search engine. The auction's scope line compares the 2002 search auction against first-price rivals.
Both are true sentences. A guard that fires on true sentences gets muted within a week, and then the
false one gets through.

**Never** run it over only the fields you happen to know about. `assertScenarioMechanism` lints
every string in the scenario object; it used to scan five named fields, so a claim in `subtitle` or
`tooltip` was never looked at. The required-caption test deliberately does **not** widen the same
way — that one asks whether the reader will see the caption, so widening what counts as "shown"
would make it easier to pass. The two move in opposite directions on purpose.

### G8 — `assertTimeField(field)` / `timelineYear(claim)`

`as_of` is **provenance**: when the governing source published, filed or was retrieved.
`about_year` is the year the fact is about. 60 of 505 claims would otherwise have been plotted at
their source's publication date; the worst is `ds-gdp-001`, a fact about 1922 sourced from a blog
post dated 2008-09-14. Eighty-six years.

The failure is a timeline that puts roughly fifty claims in the wrong decade while looking entirely
normal. Nothing missing, nothing out of range, every dot with a source. Simply the wrong picture of
the century.

Seven claims carry `timeline_ready: false`. That is **not** ignorance about the year — it is a
withdrawal of permission to draw, because the fact spans years the record does not name. Each
carries an `about_year_note`. **Never** fall back to `as_of` when `about_year` is missing, and
**never** silently drop a withheld claim: `timelineClaims()` splits the record into `drawable` and
`withheld`, and a withheld claim is an absence, which G5 says is an object.

Put `assertTimeField` at the top of every axis constructor and every time filter. It is one line and
it is the whole guard.

## `RULES` — the two conventions that are not in the data

Everything else is derived from a frozen file. These two are drawing conventions decided at the
design grill, not measurements, so they live in the module with their citation — and both are
overridable through `configureRules(patch, reason)`, because a convention that cannot be changed in
one place gets copied into ten.

| | Value | Source |
|---|---|---|
| `wideIntervalRatio` | `0.60` | `DESIGN.md`, "Rules that are not reopened", rule 3 |
| `absenceForms` | `["stipple", "hatch", "block"]` | `DESIGN.md` palette (the Stipple token) and rule 5 |

**Overridable is not the same as mutable, and this used to blur the two.** `RULES` was a plain
object and `configureRules` was an `Object.assign`. Both of these are guard parameters: the cut
decides which claims may carry a central dot, and the absence forms decide what counts as a hole
drawn as an object. So `RULES.wideIntervalRatio = 1e9` switched G1 off from any call site, and
`RULES.absenceForms.push("none")` taught G5 that "none" is a drawn texture. Each reads like
configuration and each leaves the guard reporting itself switched on while refusing nothing.

The object and its arrays are now frozen. The only way through is `configureRules(patch, reason)`:

- the **reason is required**, and validated the way G4 validates its `because`;
- an unknown key is refused rather than assigned, so a typo cannot be absorbed in silence;
- `wideIntervalRatio` must be a finite number in `(0, 2.0]`. Above that ceiling an interval twice
  as wide as its own central value still draws a dot, which is not a cut — it is G1 off;
- `absenceForms` must be a non-empty subset of `ABSENCE_FORMS`. It may be **narrowed and never
  extended**: a new absence form is a decision made in `DESIGN.md`, where a reviewer sees it;
- `rulesStatus()` reports whether the values are still default, which moved, and why, and
  `guardManifest()` prints that on the row of each guard it affects. `resetRules()` puts them back.

`configureRules({ wideIntervalRatio }, reason)` moves the cut for the chart layer **and** for
`motion.js`'s TREMOR in the same instant, because `qualifiesForTremor` is `isWideInterval`
re-exported. There is no second `0.6` anywhere.

## What `guards.js` must never be used for

- **Never as a place to put data.** No claim id, series key, unranked pair, gap year, taxonomy
  claim list or seam figure is written in this file. If you need one, read it from the frozen file
  and throw `GuardVacuousError` when it is not there.
- **Never as a source of figures for reader-facing prose.** The guards quote numbers in error
  messages so a developer debugging at the wrong hour sees the right one; that is a debugging
  affordance, not a content API. Chapters cite `claims.json`.
- **Never with the guard's parameter passed in by the caller where the record could supply it.**
  That is what made G5 fail: the one guard taking its parameter as an argument rather than through
  the frozen loader was the one guard with an unsafe default.
- **Never `catch` a `GuardError` to keep rendering.** Every one of these fires on a page that would
  otherwise look completely fine and say something false. A swallowed guard is worse than a deleted
  one, because the manifest still claims the page is protected.
- **Never delete a guard because its case looks impossible.** The `why` in each docstring is there
  to stop exactly that, and every one of them describes something that already happened.

## The test bench

`guards.test.html` — 200 cases, no framework, no build step. The page prints its own tally; trust that over any number written in this file.

```
cd /path/to/repo && python3 -m http.server 8000
```
then `http://localhost:8000/docs/p2/lib/guards.test.html`. It reads the six real frozen files. The
six **CENSUS** rows then count against the whole record: the 60% cut still selects 65 of 506 claims,
`adspend.json` still holds eight series, the record still documents four unbridged holes, and seven
claims still withhold permission to be drawn.

Opened off disk it falls back to `FIXTURE`, a verbatim excerpt of all six files, and skips the
census rows — a five-claim excerpt cannot tell you the cut still selects 65. The fixture proves
every behaviour; it never supplies a guard's parameters by hand.

**Every guard has a real failing case, and the failing case is the real mistake**: the five-key
series list, the sorted era-7 pools, the 2007-to-2021 line, the `as_of` axis. Beside them now sits a
case for every bypass ever found — `buildPath` with `gaps` omitted, `sortPools` with object ids, six
hostile 2019 strings each naming the hole it walked through, an inverted interval, a typo'd
selector, `assertTaxonomy` with `scope` omitted. **A test suite that only exercises the routes that
work measures nothing.** If you find a way past a guard, the fix is not done until that way is a row
on this page.

---

# `motion.js`

## Seven verbs

Six come from the record (`architect-proposals.json` → The Bench → `motion`). **One is invented
here and is marked as such in code:** `VERBS.PULL.INVENTED === true`, and `INVENTED_VERBS`
lists it.

| Verb | Timing | For | Never |
|---|---|---|---|
| `SETTLE` | 700ms `cubic-bezier(.16,1,.3,1)` | Any value arriving at its measured position. | A change the reader did not cause. |
| `SWEEP` | ~1400ms `cubic-bezier(.4,0,.6,1)` | Time-axis draws, left to right, chart-recorder pen. | Right-to-left or vertical. The direction is the time axis. |
| `CRANK` | 320ms `cubic-bezier(.34,0,.2,1)` **+ 40ms hold** | Every rule change the reader makes. **The signature verb.** | A change the reader did not make. |
| `TRAVERSE` | 700ms SETTLE along an arc, + 200ms trail | Object-constancy moves. | A mark that is not the same object it was. |
| `TREMOR` | continuous 1.2Hz (833ms), amplitude = the 80% interval in px, capped 6px | **Only** claims where `ci_width / central > 0.6`. | Ribbons. Totals. Era spines. Grade-A claims. Ambience. |
| `CUT` | 0ms | Crossing a definitional seam, and nothing else. | Anywhere a crossfade would have worked. |
| `PULL` **(invented timing)** | 180ms out / 40ms hold / 220ms back, then SETTLE for the drawer | The pull ring on every organ. | More than one teaching tug in the whole piece. |

**CRANK's 40ms hold is load-bearing and is not a delay to be tuned away.** It separates cause from
effect in time, which is what makes the machine read as mechanical rather than reactive, and it
is what makes the reader attribute the output to their own hand.

**What was invented, precisely.** `DESIGN.md` decides the Pull Ring and calls PULL "a second verb
beside CRANK". `OPEN-PROBLEMS.md` specifies the behaviour — "tugs itself ten pixels and springs
back, once", "borrows the crank's exact 40-millisecond pause". No duration was ever written down.
The 180/40/220 envelope is mine: it takes CRANK's hold verbatim so the reader files the pull as
the same machine answering the same hand, and lands at 440ms total — inside CRANK's and SETTLE's
register rather than between them. The 700ms drawer travel is *not* invented; it is SETTLE. The
reduced form (a ring resting 3px proud instead of tugging) is also mine, and is flagged
`reduced.INVENTED`.

## Reduced motion is a complete alternative encoding

Not a disabled state, and not an afterthought inside a media query. Both halves of every verb are
first-class exports:

```js
import { crank, crankFull, crankReduced } from './motion.js';
crank({ input, output, apply });   // dispatches on the current mode
crankReduced({ input, output, apply });  // callable directly, always
```

| Verb | Alternative encoding | What it carries |
|---|---|---|
| SETTLE | 120ms crossfade **+ origin ghost** at 25% for 3s | The ghost is the only thing left saying where "there" was. |
| SWEEP | Renders complete on the first frame | Nothing is lost. The axis labels already say the axis is time. |
| CRANK | 200ms two-step **highlight**: input flashes, then output flashes | The *order* — input first, output second, caused by the first. A flash is a colour change, not motion. |
| TRAVERSE | Crossfade + origin ghost + **persistent trail**, both for 3s | The conservation proof. Same units, different places, unchanged total. |
| TREMOR | **Static hollow lozenge**, hatched, both endpoints ticked, interval printed in Plex Mono | The full width of the 80% interval, which is what the amplitude encoded. |
| CUT | Unchanged | Everything. It was already zero. |
| PULL | Ring rests **3px proud** with a hairline shadow; drawer crossfades; lip square fills at once | "This is operable", which is how a real drawer handle works, and "this one is open". |

`auditReducedCoverage()` **throws** if any verb is ever added without a named alternative encoding
that states what information it carries. Run it in the demo and in the build's smoke test —
"reduced motion is a complete alternative encoding" is a claim, and that function is what makes
it checkable.

### Both halves of a verb refuse the same things

A verb that enforces a rule in one mode and not the other is worse than one that enforces it
nowhere. The motion mode a developer happens to be testing in then decides whether they see the
mistake, and it is usually not the mode they are shipping to. Four verbs had that shape and no
longer do:

| Verb | The asymmetry | Now |
|---|---|---|
| **TREMOR** | `tremorReduced` required a claim; `tremorFull` required nothing at all, so the scope rule was checked in one mode only | both halves take `claim`, both call the qualifier, both stamp `data-interval` and both clear it on `cancel()` |
| **PULL** | `pullTugFull(null)` no-opped through `el.animate`; `pullTugReduced(null)` threw a `TypeError` from inside the library | both call `requireElement`, with the same message |
| **CRANK** | `input` was optional in both halves, which made the verb's own rule — "never for a change the reader did not make" — documentation rather than code | `input` is required in both halves; a crank with no cause cannot be expressed |
| **SWEEP** and **CRANK**, the *optional* slots | `sweepFull` touched `el.style` inside a `requestAnimationFrame` callback and `crankFull` touched `output.setAttribute` inside a `.then()`. A wrong value in either surfaced as an exception in an animation frame or an unhandled rejection, with no stack pointing at the call site, while the reduced halves threw at the call site | **optional is not unchecked.** Both halves call `requireElement` on `el` and on `output` the moment either is supplied |

`traverseReduced` requires `trailLayer` where `traverseFull` does not. **That is the one asymmetry
in the file, it is deliberate, and it is the rule rather than an exception to it.** In full mode
the travel carries the conservation proof; in reduced mode the trail is the only thing left that
can. `sweep`'s `el` and `crank`'s `output` are optional in **both** halves.

#### There is no `auditModeSymmetry()`, and that is the honest answer

One shipped. It compared `settleFull.length` against `settleReduced.length` and threw on a
mismatch, and its own docstring named the TREMOR row above as the bug it caught.

**It did not catch it, and it could not have.** `Function.length` counts parameters before the
first default. Every verb here takes its rules inside one destructured options object, and that
object has a default. So every pair reads `0/0`, `1/1` or `2/2`, whatever the halves require.
`tremorFull` and `tremorReduced` were `1/1` before that fix and `1/1` after it. The audit passed
both times. It also passed while the SWEEP and CRANK rows above were live defects.

It was deleted rather than repaired, because both honest repairs are worse than nothing:

- **Declare the required keys as data and compare them against what each half really
  destructures.** That means reading the function's own source — the technique `guards.js` records
  as defeated *twice* on G4, where a `.bind()`ed function reported `[native code]` and a literal
  moved one line up out of the pattern being read.
- **Probe each half by calling it with each rule violated.** This is a real check and it is what
  verified the table below. But as a shipped export it needs fixture claims, sacrificial elements
  and an allowlist for `traverseReduced`'s intended asymmetry, and it would still only prove *the
  rules somebody thought to probe agree* — a heuristic wearing a guarantee's name.

**So mode symmetry is enforced by review, not by code.** The review question is one line:

> For every rule either half of a verb applies, does the other half apply it too — or is the
> difference written down, the way `traverseReduced`'s `trailLayer` is?

`demo-system.html` carries two **specimens** beside the audits, and they are labelled as specimens
on the page: fourteen calls that must each refuse a non-element synchronously, and TREMOR's scope
rule exercised through both halves. They prove the cases they name and nothing wider. A green
demo is not a symmetry proof.

#### Verified verb by verb, 2026-07-31

Every verb, both halves, each rule probed by calling the half with that rule violated and recording
whether it refuses. 56 probes; 54 agree; the 2 that differ are the documented `trailLayer` pair.

| Verb | Rules that fire identically in **full** and **reduced** | Where the halves differ |
|---|---|---|
| `SETTLE` | element required (undefined · null · string · bare object · no args) | — |
| `SWEEP` | `el` optional in both; `el` **checked in both when supplied** (string · bare object) | — |
| `CRANK` | `input` required in both; `output` optional in both and **checked in both when supplied** | — |
| `TRAVERSE` | element required; `from`/`to` required | **`trailLayer`: optional full, required reduced.** Deliberate — with no travel, ghost + trail *are* the conservation proof |
| `TREMOR` | element required; `claim` required; scope cut; inverted `ci80`; central outside `ci80`; missing `ci80`; `ciWidthPx` optional in both; both stamp `data-interval`; both clear it on `cancel()` | — |
| `CUT` | `cutReduced` **is** `cutFull` — identity, so symmetry is not assertable | — |
| `PULL · tug` | `ring` required (undefined · null · string · bare object · no args) | — |
| `PULL · open` | `drawer` required (undefined · null · string · bare object · no args) | — |

The verbs nobody had mentioned were probed hardest, and that is where the two live defects were:
`sweepFull`/`sweepReduced` and `crankFull`/`crankReduced`'s `output`. Both are fixed above. `CUT`
is the only pair that cannot drift, because `cutReduced` is a re-export of `cutFull` rather than a
second implementation.

**The hard rule that is not a motion preference:** a claim that qualifies for TREMOR is **never
rendered as a point, in any mode**. Turning motion off must not turn an unknown into a number.

`tremorFull` and `tremorReduced` both **require** `opts.claim`, and both refuse before they touch
the element, so a refusal leaves no half-stamped mark behind. `tremorStatic()` with no arguments —
the laziest possible call — refuses to run rather than returning a blank descriptor.

**`motion.js` has no opinion about intervals, and no opinion about scope.** Both questions go to
`guards.js`:

- `guards.claimInterval(claim)` decides what a readable interval is — two finite numbers, in
  low-to-high order, with the central inside them. `motion.js` reads `lo` and `hi` back out of it
  rather than out of `claim.ci80`, so a printed label cannot be in a different order from the one
  G1 validated. It used to carry its own test, which asked only for two finite unequal numbers. So
  `ci80: [360, 96]` on a central of 192 printed `360–96`: an interval drawn backwards, on the one
  path a vestibular-sensitive or screen-reader user gets.
- `qualifiesForTremor(claim)` is `guards.isWideInterval` under the motion layer's name. The
  threshold is `RULES.wideIntervalRatio`, read live, so `configureRules({ wideIntervalRatio },
  reason)` moves the cut for the chart layer and for TREMOR in the same instant.
  `tremorThreshold()` reports the one in force. Verified live: at `0.60` a claim of ratio 1.33
  draws a lozenge; move the cut to `1.5` and `motion.js` refuses the same claim, with no edit to
  this file.

`auditTremorScope(claimsFile)` walks `claims.json` and **throws** if the two modules disagree about
any claim — either about which are wide, or about which may be drawn as a lozenge. On the frozen
record it reports `{ total: 506, readable: 506, wide: 65, lozenges: 65, agree: true }`. "There is
no second source of truth" is a claim, and that function is what makes it checkable.

## The mode, and the reviewer's toggle

Precedence: `setMotionMode()` → `?motion=` in the URL → `sessionStorage` → the OS
`prefers-reduced-motion` → `full`. The resolved mode is stamped on `<html data-motion>` with
`data-motion-source` beside it, so it is visible in devtools.

```js
import { initMotion, setMotionMode, isReduced, onMotionChange, installMotionToggle } from './motion.js';
initMotion();                       // call once, as early as possible
installMotionToggle(someElement);   // the two-button rocker, house style
setMotionMode('reduce');            // force it, independent of the OS
setMotionMode(null);                // hand control back to the URL / OS
```

`tokens.css` carries the same rules twice on purpose — once under
`@media (prefers-reduced-motion: reduce)`, so the cascade is correct before any JS has run, and
once under `:root[data-motion="reduce"]`, for the in-page toggle. The media query is scoped away
from `[data-motion="full"]` so a reviewer whose OS asks for reduced motion can still force the
full form on.

## What `motion.js` must never be used for

- **Any animation not in `VERBS`.** If the movement you want is not one of the seven, it does not
  exist in P2. Add it to `VERBS` with a reduced twin, or do not add it.
- **Ambient motion.** Nothing moves unless the reader caused it or it is TREMOR, and TREMOR's
  scope is capped at the 65 span-only claims. At 1,573 marks an ambient jitter stops being a
  signal and becomes visual tinnitus, and a vestibular liability.
- **Scroll-jacking or parallax.** Neither exists in this project.
- **More than one change per scroll beat.** Highlight or annotate, never both.
- **Making a fallback shorter instead of different.** A 1ms SETTLE is not the reduced form of
  SETTLE. `settleReduced()` is.

---

## What a downstream team imports

```js
import {
  BONE, GRAPHITE, ZINC_RULE, ZINC_TEXT, BRASS, BRASS_TEXT, CYAN, CYAN_TEXT, IRON, RUST, STIPPLE,
  TYPE_ROLE, ORGANS, GRID, RULE_WIDTH, REDUNDANT_CODING, REDUNDANT_CHANNELS,
  assertTextColor, assertObjectColor, assertDistinguishable, verifyTokenParity,
} from './lib/tokens.js';

import {
  initMotion, isReduced, setMotionMode,
  settle, sweep, crank, traverse, tremor, cut, pullTug, pullOpen,
  tremorStatic, qualifiesForTremor, tremorThreshold,
} from './lib/motion.js';

import * as guards from './lib/guards.js';
await guards.loadFrozen();          // or guards.useFrozen({ claims, adspend, … })
```

Import `guards.js` as a namespace rather than by name. The call sites are meant to read as the rule
they enforce — `guards.drawMark(claim, 'point')`, `guards.timelineYear(claim)` — and a bare
`drawMark` in a chart file loses the only word that says why it is there.

Also `<link rel="stylesheet" href="./lib/tokens.css">`, before the modules.

## Still open for the teams behind B1

- **Mode symmetry in `motion.js` is not machine-checked.** It is a review rule, deliberately, and
  the reasoning is under *There is no `auditModeSymmetry()`* above. The verb-by-verb table there
  is a snapshot dated 2026-07-31, not a live check: it goes stale the moment a half changes. Two
  things follow. **A verb added without a matching half will not be caught by anything in this
  folder.** And **there is no test bench for `motion.js`** the way `guards.test.html` is one for
  `guards.js` — the demo carries two labelled specimens and that is all. If a later team wants
  this mechanised, the probe-by-violation method is the one that works; it belongs in a bench
  file, not in the library.
- **The four `@font-face` metric overrides are unmeasured.** They are inert placeholders until
  the real faces land. Marked `MEASURE-AT-SHIP` in `tokens.css`.
- **`SURFACE.ruleFaint` is 1.45:1** and is decorative only. A boundary the reader must not cross
  uses `IRON` at 1.5px or `GRAPHITE` at 2px. Nothing in this module can stop a section separator
  being the only thing carrying a meaningful boundary; that is a review question.
- **B8's plain-English alt sentence is not modelled here.** `DESIGN.md` adopts a required
  readable sentence in the data layer for every visual, driving a text-only path. That field
  belongs to the data layer and to B8, not to the design system, but every visual this system
  paints will need one.
- **The library cannot tell you who did not call it.** Every guarantee in
  [What is guaranteed and what is advice](#what-is-guaranteed-and-what-is-advice) fires at one call
  site. Nothing scans the built page, and nothing counts adoption. A chart that never imports
  `guards.js` is unprotected and the manifest will not say so. Closing this needs a build-time pass
  over the rendered output, which is a later team's job and not this folder's.
- **The two test-case counts in this file disagree.** The table at the top says 164 and the test
  bench section says 114. Neither is recomputed from `guards.test.html`, and the page expands loops
  at run time so the static call count does not settle it. Open the page and read the tally it
  prints. Treat both written numbers as stale until somebody makes the README quote the page.
