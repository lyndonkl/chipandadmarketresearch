# P2 Experience — Design Spec ("The Bench")

Locked 2026-07-31 through the P2 design grill. This is the build brief. Internal working document, exempt from the readability gate — but every reader-facing word it specifies is not.

Full architect proposals, including the four directions not chosen, sit in `architect-proposals.json`. The three late problems and their rejected options sit in `OPEN-PROBLEMS.md`. The chosen sample page is `samples/bench.html`.

## Direction

**The Bench.** Every era is a machine that sets a price. Each one is drawn as a patent diagram in iron line work — spare, unshaded, all line. Eight organs sit at eight fixed screen positions, redrawn seven times. The reader learns one verb in era 1 and uses it six more times.

Light mode only, inherited from P1.

## The arc

**The counting discipline breaks.**

For 82 years, somebody other than the seller counted the audience. Audited circulation arrives in 1914. Ratings bodies follow, each paid by someone with an interest, and who paid the counter keeps changing. Around 1996 the rule breaks. The seller starts counting its own inventory, running the auction, checking the click, and billing its own log. Nobody audits.

This was thread 1 of four. It is now the spine of the whole piece. The other three threads hang off it.

Why this one: it is the only thread with a before-and-after shape. It is grade A across 44 claims, with one grade-C among them. It holds two natural experiments where the instrument changed and the price moved with nothing else changing — the 1987 people meters, and the 2021 Nielsen undercount.

## Scope for v1

Ten chapters, the signature chart system, and the auction bench's A-series (the ten designed scenarios).

The four thread chapters and the D-series are specified but not built — except that Problem 1 below pulls the D-series forward. See the schedule note.

## Palette

| Token | Hex | Role |
|---|---|---|
| Bone | `#F2EEE4` | Ground. Faint 22px grid at ~4% ink. From P1. |
| Graphite | `#15181D` | All prose, headings, rule lines. From P1. |
| Zinc | `#838A93` | Axes, gridlines, organ labels, secondary text. From P1. **Fails AA as text on Bone at 2.95:1 — use a darkened sibling for text and keep this hex for rules only.** |
| Brass | `#B07A2C` | Money. The advertiser's dollar, every particle, every spend series. |
| Cathode Cyan | `#3AA6BD` | The count. Any measure of audience: circulation, ratings, impressions, clicks. |
| Iron | `#5B6570` | Mechanism. Bench structure, auction rails, slot frames. |
| Rust | `#A8442E` | The take. The intermediary's cut and the front-door rent. Nothing else. |
| Stipple | `#C9C2B4` | Documented absence. Only ever a 2px texture, never a fill. |

Brass against cyan is the workhorse pair, and it carries the thesis: money against the count.

## Type

Four faces, one job each, and the jobs never overlap.

- **Martian Mono** — every numeral and every readout. Tabular figures are required; the simulator updates a readout during a drag, and proportional digits would make the number jitter.
- **Newsreader** — body prose.
- **IBM Plex Mono** — data chrome: tooltips, interval values, A/B/C grades.
- **Instrument Sans** — organ labels and machine annotations.

All faces subset and preloaded. Static hosting, no webfont service.

## Motion

Six named verbs. **CRANK** is the signature: 320ms, `cubic-bezier(.34,0,.2,1)`, with a deliberate 40ms hold before the output moves. The machine takes the input, pauses a beat, then responds. That hold is what makes the thing feel mechanical rather than reactive.

SETTLE (700ms) and SWEEP (~1400ms) carry over from P1.

Reduced motion is a complete alternative encoding, not a disabled state. Every verb has a static equivalent that carries the same information.

## Rules that are not reopened

Five independent architects reached these on their own. Convergence at that width is evidence, and the build treats them as invariants enforced in code, not conventions.

1. **Never splice.** Two data series are never joined into one line. Where two overlap, draw both and label the distance between them. The Coen and MAGNA rails sit 23.4% apart in 1980; that gap is an object, not an embarrassment.
2. **No stacked area, no streamgraph, no pie, no dual axis.** Anywhere.
3. **A claim whose 80% interval is wider than 60% of its central value is drawn span-only, with no central mark.** 65 claims qualify. `drawMark(claim, "point")` throws on them.
4. **Quantities that cannot be ranked are never stacked, sorted or listed in order.** Era 7's national brand, direct response and local retail are mutually unranked. `renderPools(pools, "unranked", "sorted")` throws.
5. **Absence is drawn as a positive object** — stipple, hatch, a named empty block. Never whitespace, never a line through the gap.
6. **Era 5 carries two taxonomies on purpose.** `by_money_type` is era-native; `by_money_type_alt` is the cross-era comparable. Cross-era views use the alt. The two rules order two pools differently, and under both the intervals overlap, so the pair is unranked either way. The flip is a classification artifact, not a fact about the market.
7. **The chart layer never hard-codes five series keys.** There are eight.
8. **A dead-mechanism guard is permanent.** The simulator teaches the 2002 auction. Display moved to first-price in 2019; search never did. No reader may leave believing otherwise.

## The three late problems, decided

### Problem 1 — the eleven distribution screens: THE DOOR BENCH

The reader works a second machine. Two lanes of searches run into one auction box: the upper lane from Google's own page, the lower entering through a hinged door from somebody else's. Both run through the same rule box. Only the lower passes a valve that taps most of the money back out through the door. Three open cups on one baseline show what leaves, what the search costs to answer, and what Google keeps. A six-notch wheel drives it, and every notch is a number the record contains.

12–15 working days. The widest object in the project.

**The open risk, and the requirement it creates.** A wheel tells the reader that Google set the take rate. The record says the opposite — the rate was an auction outcome, and partners bid it up and down. The proposal answered with three printed guards. That answer is not good enough here, because this project's whole argument is that a picture beats a caption, and a caption cannot win against a gesture.

**Requirement:** the fact that partners bid the rate must be a percept, not a label. The wheel must visibly not belong to the reader alone. Build it so a rival's hand is on it too — the notch moves under pressure from outside, or the reachable range narrows as a rival bids. The reader should feel that they are watching a negotiation, not setting a dial. This is a build-time design task and it is not optional.

### Problem 2 — the middleman's cut: THE TOLL PLATE

No shared axis. Seven small self-contained diagrams, one per era, each showing a dollar entering and the middleman's share leaving, with the base named on the diagram itself.

2–3 days on top of shared primitives.

This form and not a chart, because each era measures its cut on a different base. In 1900 it is percent of gross billings. In 1940, percent of net time sales retained. In 2006, gross margin. In 2008, percent of network revenue handed back. Seven bars in a row would invite a comparison the numbers cannot support.

**What it gives up, stated plainly in the chapter:** the piece cannot say "the cut rose" or "the cut fell". The honest finding is that the cut got harder to see. In 1900 it was published, fixed and known to everyone. Today nobody can measure it, including two national advertiser associations that tried.

Era 7's diagram alone can be misread as exactly the claim the page refuses to make. It needs its own guard.

### Problem 3 — cross-era comparison: THE PULL RING

A small ring drawn inside every machine part. Taught once in chapter 1, in a moment the reader cannot skip, then permanently visible. Pulling it lifts that one part out across all seven eras.

About a day for the rings and their states, plus a four-state teaching sequence that needs its own test page.

**What it costs:** 26 pixels of every screen forever, and a second verb beside CRANK. The Bench's cleanest claim was that it has one verb. That claim is now weakened, deliberately, because a comparison tool nobody finds is not a tool.

## Schedule note

The three decisions add 15–19 working days on top of the base build, and the auction bench alone was already priced at 35–45% of one chapter. The Door Bench is the single largest item and sits immediately behind the auction bench, competing with it for the reader's memory as well as for build time.

If the schedule slips, the Door Bench is the first thing to cut back to a static plate. `OPEN-PROBLEMS.md` holds that fallback fully specified as Option 1B.

## Still unsolved

**Thread 2 has no cross-era chart.** The Toll Plate is a set of seven separate drawings by design. Any later attempt to give thread 2 a single visual has to answer the incomparability problem first.

**Accessibility past reduced motion is thin.** Four of five proposals covered reduced motion verb by verb and left screen readers, keyboard operation and text-only paths largely unaddressed. The strongest idea in the set came from a direction not chosen: a required plain-English sentence in the data layer for every visual, written to pass the four readability gates, driving a text-only toggle. Adopt it.

**The writing.** A prose audit is running over the ten chapters. Its output is `research/PROSE-FIXES.md`. The chapters pass all four readability tests today, but those tests measure sentence and word length. They do not catch a sentence a cold reader cannot follow.
