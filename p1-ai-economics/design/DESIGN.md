# P1 Experience — Design Spec ("The Instrument")

Locked via the P1 design grill (2026-07-23). This is the build brief. Internal working doc — exempt from the readability gate.

## Direction

**The Instrument** — research presented as a precision measuring device. Every claim is a value with error bars; the width of the uncertainty band, not the headline number, is the emotional payload. Austere but warm — engineering-paper ground, serif prose for reading pleasure, monospace numerals as the heroes.

**Mode: light only** (user preference — do not ship a dark default for P1).

## Reading stance

Journey-first, earned verdict. Hierarchy: question → evidence → answer. A one-line stakes teaser sits at the very top; the verdict is withheld until beat 7.

## Palette (exact)

| Token | Hex | Role |
|---|---|---|
| Bone | `#F2EEE4` | ground (engineering paper, faint 22px grid) |
| Graphite | `#15181D` | ink |
| Filament Amber | `#E0972A` | PRICE — market-set, human-chosen, scarcity |
| Cathode Cyan | `#3AA6BD` | COST — physical serving floor |
| Zinc | `#838A93` | axes, gridlines, tick marks, secondary text |
| Redline | `#C6432B` | capital risk ONLY (single-use, + hatch + label for colorblind safety) |

Amber/cyan is the one colorblind-safe workhorse pair; reserve it for the price/cost distinction. Redline sits near amber for protanopes — keep it single-use and redundantly coded.

## Type

- Display / numerals: **Martian Mono** (numbers are the protagonists)
- Body prose: **Newsreader** (serif; warmth, reading pleasure)
- Data chrome: **IBM Plex Mono** (tooltips, CI values, A/B/C grades)

All three variable fonts must be subset + preloaded (static GitHub Pages; avoid FOUT). Mockups use system stand-ins.

## Motion vocabulary

- **SETTLE** — critically-damped ease-out (~`cubic-bezier(.16,1,.3,1)`), for any value snapping to its measured position (a galvanometer arriving). ~600–900ms.
- **SWEEP** — near-linear, for lines drawing left-to-right (chart-recorder pen; x-axis = time).
- Particles **snap** to positions with a stagger ordered by data value — never float, drift, or bounce.
- **MEASUREMENT JITTER (core device, everywhere):** each mark vibrates within its own 80% CI, amplitude ∝ CI width, capped low so it reads "alive," not "broken." Grade-A marks sit still; grade-C marks shimmer. Under `prefers-reduced-motion`: replace jitter with a static hatched band and swap morphs for cross-fades.
- Scene transitions scroll-driven, one change at a time (highlight OR annotate, never both).

## Unit metaphor

One particle = one calibrated unit of value, relabeled per scene ($1B in capital scenes; ¢/M-tokens in price scenes; one forecaster estimate in the panel). Constant identity + position memory carry the object-constancy morphs. Jitter-amplitude (= CI width) travels with the unit everywhere.

## The 7 beats

1. **Opening (hybrid):** open on the single 7× gap measurement, shown with error bars + shimmer (hook + grammar in one), then pull back to the full field of 160 marks. Teaches: *every number here is a measurement, with error bars.*
2. **The gap (T1):** one price vs its serving cost; **Transition A** — cost units multiply ~7× upward to become price. The gap is built from the same units, not asserted.
3. **The hard floor (T2):** replay the real 80% price cut on an unchanged model; a solid cyan lower-bound rule locks under the wide cost band. The gap survives a fuzzy cost estimate.
4. **Two clocks (T3):** two plotter pens from one unit stream split — constant-quality price falls ~36×/yr while the flagship price rises 4×. Both true at once.
5. **The controlled experiment (T4):** Kimi K3 priced at a US rate before its weights shipped; flip the OPEN WEIGHTS preset and the umbrella collapses into the cost band. Open weights, not cheaper silicon, drive price to marginal cost.
6. **The Convergence Dial (T5):** the signature interaction — one supply scarce↔abundant fader. Drag toward abundant; amber price units descend into the *jittering* cyan cost band (converges into a fog, not onto a line — cost stays uncertain). Framing stays conditional, never deterministic. At full abundance the readout flips to the payback question.
7. **The payback climax (T6, unresolved):** **Transition B** — ~$1T of capex in vintage strata must earn itself back by 2030. **Monte-Carlo particle race**: capex particles seek a revenue position under a widening cone; ~52% settle as earned-back (gold), the rest cool to grey and fall into the redline reservoir. Readout: *odds it pays off ≈ 52%* (bear −$2.3T / base +$487B / bull +$907B). Honesty guardrail: it is the probability the bet clears cost of capital, NOT the share of dollars recovered. Ends on the felt width of the cone.

## Signature interaction — The Convergence Dial

One fader, supply SCARCE ↔ ABUNDANT. Presets: **US CLOSED** (umbrella up, price floats far above cost) and **OPEN WEIGHTS** (umbrella collapses, price snaps into the cost band — the Kimi K3 near-controlled experiment as a switch). The cost floor is a wide, jittering CI so price converges *into a fog*, teaching that "marginal cost is back" ≠ "marginal cost is known."

## Guardrails (from the architect's risk read)

- Defend warmth actively (serif prose, Bone paper, generous rhythm) or austerity reads as a cold Bloomberg wall.
- Throttle/cap jitter; kill it fully under reduced-motion; never let it look like "loading/broken."
- Object-constancy morphs need explicit anchor units the eye can track, or "same dollar" collapses into reshuffling.
- Keep the Convergence Dial's framing conditional — the evidence does not prove prices *will* converge.
- Teach the CI-first reading grammar hard in beat 1, or readers anchor on point estimates and miss the uncertainty thesis.

## Stack

Vanilla JS + Canvas/WebGL for the particle field, D3 for overlays/axes; static site in `docs/`. fifaworldcup2026 pattern.
