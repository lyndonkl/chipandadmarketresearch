# P2 Build Plan — the teams, and what each one owns

Written 2026-07-31. Internal working document, exempt from the readability gate.

Grounded in: `data/FREEZE.md` (the numbers), `research/` (the ten chapters), `design/DESIGN.md` (the direction), `design/OPEN-PROBLEMS.md` (the three late decisions and their fallbacks), `research/PROSE-FIXES.md` (280 writing fixes), `data/verification/REPAIR-R3b.md` (why a wrong number survived four gates).

## How the teams are structured, and why

Three rules decide the shape of every team below.

**One team owns one artifact.** Two teams never write the same file. Where work overlaps, one team produces and the other verifies.

**Every team is briefed on the frozen data, never on a summary of it.** The R3b repair happened because a verifier matched a quoted string without checking what it referred to. A team that reads a summary will repeat that failure at a larger scale.

**Every team ends at a gate it cannot mark itself.** The same contract-and-verifier pattern that ran the research runs the build. A team's own report is never the evidence that its work is done.

Team size follows the work, not a template. A job with one right answer gets one agent. A job with genuine forks gets competing agents and a reconciler. A job where being wrong is expensive gets an adversary.

---

## Stage P — prerequisites. Nothing gets built on top of these until they close.

### P1 · Data repair team

**Why it exists.** Two findings from the R3b sweep block parts of the build.

`as_of` means two different things across 58 claims. Some use it for the year the fact happened; some for the year the source published. Any visual that plots a claim on a timeline puts roughly fifty claims in the wrong decade. The ambiguity comes from the rigor spec, which never said which.

Three era-7 unit-economics claims carry intervals 19.5 to 28 times their own centrals. They cannot carry a chart line, and they cannot support the "145-fold" or "stopped falling" language now in the chapters.

Ten more open items from the sweep need a source read or a wording decision.

**Team.** One `series-archaeologist` to settle the `as_of` definition and audit all 505 claims against it. One `claim-verifier` on the four items needing a source read. One applier.

**Produces.** A defined `as_of`, a new `about_year` field where the two differ, corrected records, and a decision on whether the three wide-interval claims can appear in prose at all.

**Gate.** A new deterministic check: every claim used on a timeline resolves to exactly one unambiguous year.

### P2 · Prose team

**Why it exists.** `PROSE-FIXES.md` holds 280 items. 124 are sentences a first-time reader cannot follow.

**Team.** Three appliers, one per chapter group, working strictly from the fix list. One structural editor for the single largest change: rebuilding chapter 10 as a chronological ledger of who held the tape measure, cutting the roughly 60% that restates chapters 1 and 7. One reader who re-runs the cold-read afterwards and confirms the fixes landed.

**Produces.** Ten rewritten chapters, the 57-term glossary applied at first use.

**Gate.** All four readability tests, plus a fresh cold-read finding no blocking items.

---

## Stage B — the build.

### B1 · Foundation team

**Why it exists.** Eight rules are invariants, not conventions. They must be code that throws, not documentation that gets forgotten at 2am.

**Team.** Two engineers: one on the design system (palette tokens, four subset fonts, the six motion verbs with their exact timings, the reduced-motion equivalents), one on the guards.

**The guards, as real functions.** A claim whose interval exceeds 60% of its central cannot be drawn as a point. Quantities in `unranked_pairs` cannot be stacked, sorted or ordered. Two series with different `source_series` cannot be joined into one path. A chart cannot hard-code five series keys when the file holds eight. Absence renders as an object, never as a gap.

**Produces.** `docs/p2/lib/` — tokens, motion, and the guard module every later team imports.

**Gate.** Each guard has a test that proves it throws on the thing it forbids.

### B2 · Chart system team

**Why it exists.** The signature chart is not one chart. Eight series, 27 medium labels, 19 seams, a hole from 2008 to 2020, and 77 years before 1919 with no annual data.

**Team.** Two engineers and one adversary. The adversary's only job is to try to make the charts lie — splice two rails, stack the unrankable, draw a point on a wide interval, interpolate the void — and report every attempt that succeeds.

**Produces.** The rail board, the value chart with labelled wedges at every overlap, the small-multiple bank, the share-of-GDP strip.

**Gate.** The adversary's report shows zero successful attacks.

### B3 · Era machines team

**Why it exists.** Seven machines, eight organs each, same positions every time. The repetition is the point — it is what lets a reader compare era 3 to era 6 without scrolling twice.

**Team.** One engineer on the machine template and the CRANK verb. One on the seven era instances. One cognitive-design-architect reviewing that the eight positions stay fixed and legible across all seven.

**Produces.** The era chapter scaffold and seven instances.

**Gate.** A reader can name what each organ does after seeing two eras.

### B4 · Auction bench team

**Why it exists.** The centerpiece and the largest single item — priced at 35 to 45 percent of one chapter's build. Ten scenarios. It must teach that quality-weighting raised total revenue while the average price per click fell 42%, that GSP is not truthful, and that GSP revenue is a band rather than a number.

**Team.** Two engineers, one `mechanism-analyst` verifying that every worked example on screen matches `mechanism.json` exactly, and one adversary trying to make the simulator teach something false.

**The dead-mechanism guard is not optional.** Display moved to first-price in 2019. Search never did. No reader may leave believing otherwise.

**Produces.** The auction bench, ten scenarios, THE BAND.

**Gate.** Every number on screen re-derives from `mechanism.json`; the arithmetic check passes against the live component.

### B5 · Door bench team

**Why it exists.** The human chose the operable machine over the sealed plate. That choice carries a requirement the original proposal did not meet.

**The requirement, restated.** A wheel tells a reader that whoever owns the machine chose the number. Google did not choose the revenue share — partners bid it up and down. Printed labels cannot fix this, because this project's whole argument is that a picture beats a caption. The rival's pressure must be visible in the mechanism: the reachable range narrows as a rival bids, the notch moves under outside force, and the reader watches a negotiation rather than turning a dial.

**Team.** Two engineers, one cognitive-design-architect whose single question is whether a first-time reader believes they set the rate. If they do, the build has failed regardless of how well it runs.

**Produces.** The door bench, eleven stops.

**Gate.** The architect's verdict, plus the fallback stays viable — if this team overruns, `OPEN-PROBLEMS.md` Option 1B is fully specified and can replace it.

### B6 · Toll plate and pull ring team

**Why it exists.** Two smaller decided pieces. Seven separate diagrams for the middleman's cut, each naming its own basis. A pull ring on every organ, taught once, then permanent.

**Team.** One engineer on both. One writer on the seven basis labels, because the whole design rests on the reader understanding that the seven numbers are different kinds of thing.

**Produces.** Seven toll plates, the ring and its teaching sequence.

**Gate.** A reader who sees all seven plates does not believe the cut rose or fell.

### B7 · Assembly team

**Why it exists.** Ten chapters, the scrollytelling spine, and every number wired to a claim.

**Team.** Two engineers, one on scroll and one on binding prose to data.

**Produces.** `docs/p2/index.html` and the build script.

**Gate.** Every number rendered on the page traces to a claim ID. No hard-coded figures anywhere.

### B8 · Access team

**Why it exists.** Four of five design proposals covered reduced motion carefully and left screen readers, keyboard use and text-only paths nearly untouched. The strongest idea came from a direction not chosen.

**The idea, adopted.** Every visual carries a required plain-English sentence in the data layer, written to pass the four readability gates, driving a text-only version of the entire piece.

**Team.** One engineer, one writer for the alt sentences, one reviewer testing keyboard-only and screen-reader paths.

**Produces.** The alt-sentence field, the text-only toggle, keyboard operation for every interactive.

**Gate.** The whole argument survives with images off and a keyboard only.

---

## Order

P1 and P2 run together. Both must close before B1.

B1 alone, because everything imports it.

B2, B3 and B4 run together after B1. B5 and B6 run after B3, since both extend the machine language. B7 needs B2, B3, B4 and B6. B8 runs last but reviews continuously.

## What would make me stop and re-plan

The door bench overruns its 15 days. The fallback in `OPEN-PROBLEMS.md` exists for exactly this.

The `as_of` audit finds the ambiguity reaches further than 58 claims.

The cold-read after the prose pass still finds blocking items, which would mean the fix list treated symptoms.
