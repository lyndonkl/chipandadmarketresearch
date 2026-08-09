# P2 v2 Design Spec — Who Owns the Number (adapted from P1 "The Instrument")

*Internal build doc — exempt from the readability gate.*

Adapts P1 "The Instrument" to the locked P2 theme. It keeps the **bones and the physics** of P1's scroll-driven particle instrument, re-points its one semantic color channel at a new subject (ownership), and inverts the reading stance to reading-first.

**Build target:** `docs/p2-v2/`, linked from `docs/index.html`. P2 v1 at `docs/p2/` stays untouched.

---

## 0. Translation statement — what carries, what changes

P1 was a scroll-driven particle instrument where **color encoded economics** (amber = price, cyan = cost) and jitter encoded a claim's **confidence interval**. P2 v2 keeps the bones and physics but re-points the one semantic channel at ownership and changes the reading stance.

| Layer | P1 "The Instrument" | P2 v2 "Who Owns the Number" | Verdict |
|---|---|---|---|
| Ground, ink, grid | Bone paper, Graphite ink, 22px grid | identical | **KEEP** |
| Type | Newsreader / Martian Mono / IBM Plex Mono | identical | **KEEP** |
| Motion physics | SETTLE + SWEEP, snap-not-float | identical | **KEEP** |
| Measurement-jitter device | amplitude ∝ CI width | amplitude ∝ **claim grade A/B/C** | **RE-TIE** |
| The color pair | amber = PRICE / cyan = COST | amber = **SELLER-OWNED** / cyan = **INDEPENDENT** | **RE-POINT** |
| Redline | capital risk | **DEAD / CONTESTED** corrected claims | **REASSIGN** |
| Reading stance | journey-first, particle scenes are the spine | **reading-first**: prose is the spine, figures support, sources under each paragraph | **INVERT** |
| Hero | Convergence Dial (fader) | **Ownership-over-time** (the reversion) | **REPLACE** |

The cognitive reason the re-point is clean: color is a **preattentive, nominal channel** (Ware; Treisman) — it pops out without search and it names categories; it does not measure magnitude. Ownership *is* a nominal category ("who holds this number"). So the amber/cyan pair transfers to ownership without cognitive strain, provided nothing else in the system competes for that channel (Guardrail G1). Magnitudes stay where Cleveland & McGill put them — on **position**, never on the ownership hues.

---

## 1. Reading stance — reading-first, earned by stacking

**The prose piece is the spine.** "Who Owns the Number" is read top-to-bottom as an article: mono eyebrow → serif headline → serif body, one movement per section (s0–s14). Figures are **inset exhibits that support a paragraph already making the point** — never the carrier of the argument. The reader can re-read and exit at any movement (the corpus is reader-paced, mixed-trust, outcome partly known — so we **lead with the answer**, exactly as the piece's nut graf does, and spend no budget on suspense).

**Sources sit under the thing they support.** Every paragraph that states a figure carries a **citation strip** directly beneath it (claim-id chips + grade), expandable to the full appendix line. This is the P2 promise ("sources are cited under each paragraph") and it is the honesty apparatus made visible: provenance, not verification.

Cognitive basis: **coherence and signaling** (Mayer) — put the citation adjacent to its claim (spatial contiguity) so the eye never holds a claim in working memory while hunting for its source; **recognition over recall** — the grade travels with the number, so the reader never has to remember which figures were soft.

---

## 2. Palette (exact) — every token with its P2 role

Hex values are preserved verbatim from P1's spec **and** its shipped CSS (`docs/p1/index.html`, `docs/index.html`), so the P2 build reuses the same custom-property names and adds only the ownership-semantic tints.

### 2.1 Core tokens

| Token | Hex | CSS var | P2 role |
|---|---|---|---|
| **Bone** | `#F2EEE4` | `--bone` | ground — engineering paper |
| Paper | `#efe9db` | `--paper` | scene/canvas fill, recessed panels |
| Card | `#f7f4ec` | `--card` | figure cards, citation blocks, key/callout backgrounds |
| **Graphite** | `#15181D` | `--graphite` | ink — body text, primary numerals |
| Ink-2 | `#3a4149` | `--ink2` | standfirst, figure notes, secondary prose |
| Ink-3 | `#5b626b` | `--ink3` | captions, mono metadata |
| **Zinc** | `#838A93` | `--zinc` | axes, gridlines, tick marks, eyebrows, **neutral / un-owned scaffolding** |
| Rule | `#ddd5c4` | `--rule` | hairlines, section dividers, card borders |
| Grid line | `#83839314` | (bg) | 22px engineering grid (zinc @ ~8% alpha), both axes |

### 2.2 The ownership pair (the one semantic workhorse)

| Token | Hex | CSS var | P2 role |
|---|---|---|---|
| **Cathode Cyan** | `#3AA6BD` | `--cyan` | **INDEPENDENT** — the number owned by a third party: an audited count, a disclosed price, a court-established figure |
| Cyan-deep | `#1d7288` | `--cyan-d` | cyan on tint / small text / rules where `--cyan` fails contrast |
| Cyan tint | `#3AA6BD1F` | `--cyan-t` | independent bands, jitter halos, common-region fills |
| **Filament Amber** | `#E0972A` | `--amber` | **SELLER-OWNED / JUDGED-PARTY** — the number owned by the party being judged: the seller's self-count, the platform's own log |
| Amber-deep | `#9a6612` | `--amber-d` | amber on tint / small text / rules where `--amber` fails contrast |
| Amber tint | `#E0972A1F` | `--amber-t` | seller-owned bands, jitter halos, common-region fills |

Amber/cyan is the one **colorblind-safe** distinguishable pair (P1's finding) — reserve it *exclusively* for the ownership distinction. It is also the emotional payload: the reader learns to feel a mark going amber as the number sliding back to the party it judges.

### 2.3 Redline — reassigned, single-use

| Token | Hex | CSS var | P2 role |
|---|---|---|---|
| **Redline** | `#C6432B` | `--redline` | **DEAD / CONTESTED** popular claims the piece corrects. Single-use. Redundantly coded (hatch + strike + label) because redline sits near amber for protanopes. Never touches an ownership mark. |

### 2.4 Retired from P1

- `--good` `#2E7D5B` (green, was grade-A badge) — **retired from the color layer.** In P2, grade must not ride color, or it collides with ownership (Guardrail G1). Grade is carried by **jitter + a monochrome badge** (§5).

---

## 3. Type — roles and scale

Three spec fonts, unchanged from P1. All three are variable fonts, **subset + preloaded** (static GitHub Pages; kill FOUT). Fallback stand-ins in parentheses match P1's shipped stacks.

| Role | Font | Fallback | Use |
|---|---|---|---|
| **Body prose** | **Newsreader** (serif) | `"Iowan Old Style",Georgia,"Times New Roman",serif` | the article spine — warmth, reading pleasure |
| **Display / numerals** | **Martian Mono** | — | headline numerals, the numbers that are protagonists, hero readouts |
| **Data chrome** | **IBM Plex Mono** | `ui-monospace,"SF Mono",Menlo,Consolas,monospace` | eyebrows, claim-id chips, grades, tooltips, axis labels, citation strips |

### 3.1 Scale (reading-first, reuses P1's shipped clamps)

| Element | Spec |
|---|---|
| Masthead h1 | Newsreader 600, `clamp(32px,6.2vw,62px)`, `letter-spacing:-.022em`, `line-height:1.03` |
| Movement eyebrow | IBM Plex Mono, `11px`, `letter-spacing:.13em`, uppercase, `--zinc` (era + slot id, e.g. `S6 · 1987 · THE INSTRUMENT`) |
| Movement h2 | Newsreader 600, `clamp(23px,3.6vw,34px)`, `-.014em` |
| Standfirst | Newsreader, `18px`, `--ink2`, `max-width:56ch` |
| Body | Newsreader, `21px`, `line-height:33px` (≈1.57, = 1.5× the 22px grid unit), `max-width:68ch` — reading-first workhorse |
| Prose column | `max-width:700px` (68ch of Newsreader 21px); figure wrapper `max-width:1000px` (figures breathe wider than prose) |
| Inline number | Martian Mono, weight/size of surrounding body, colored per ownership rule (§4.3) |
| Citation strip | IBM Plex Mono, `10–11px`, `--ink3` on `--card` |
| Grade badge | IBM Plex Mono, `8.5px`, weight 700, `--graphite` on `--zinc @ 12%` (monochrome — see §5.2) |

Measure is capped at 68ch for body (Bringhurst's comfort band for continuous serif reading); numerals are the only elements allowed to break the serif texture, which is what makes them read as *instrument readings* dropped into prose. **Reconciled with PAGE-DESIGN §2 — body is 21px/33px at 68ch, not the 16.5px draft value.**

---

## 4. Ownership-color application rules

The load-bearing section. Color answers exactly one question, at the moment a mark depicts: **who owned this number then?**

### 4.1 The decision rule (apply per mark, per number, per rule-line)

1. **CYAN** if the number was produced/held by an **independent third party** at the moment depicted — an audit, a disclosed public figure, a census, a court finding of fact, a regulator's extracted number.
2. **AMBER** if the number was produced/held by the **party being judged** — the seller counting its own audience, setting its own price, billing its own log; the vendor whose number runs high; the platform's growth-without-count.
3. **ZINC** if the number is **neutral scaffolding** with no ownership claim — a GDP base, a raw span, an axis, a total used only as a denominator.
4. **REDLINE** if the mark is a **DEAD or CONTESTED legend** the piece is correcting — never an ownership mark (§6).

### 4.2 The tiebreak the corpus forces (surfacing ≠ ownership)

Several figures are **seller-owned numbers that reached the reader through an independent channel** — the archetype is rGSP: Google's own pre-launch test (`mech-rgsp-001`, +5.91% / +4.85%) is a **seller-owned** number, but a **court** surfaced it. Do **not** recolor the mark cyan because a court exposed it.

- **The mark keeps the color of the number's owner** (amber for rGSP).
- **Independent surfacing is drawn as a separate cyan element over it** — a cyan bracket, rule, or annotation reading "surfaced by audit / court." This *is* the reversion grammar: independence arrives as a thin cyan overlay on an amber default, then withdraws.

This maps 1:1 to the piece's one load-bearing juxtaposition: **s2 (ABC 1914, cyan audit) laid over s0 (Google 2008 self-count, amber)** — the cyan rule the market built in 1914, drawn *across* the amber default, then lifting.

### 4.3 Worked assignment across the spiral (pre-specified so the build is not guessing)

| Movement | Mark | Color | Why |
|---|---|---|---|
| s0 | Google's 18% paid-click growth, no count (`e6-measurement-006`, A) | **amber** | seller owns the log; the count is withheld |
| s0/s2 | ABC 1914 audited circulation (`e1-measurement-002`, B) | **cyan** | first third-party count in the world |
| s1 | Disclosed 15% commission, ads = 64.9% of gross (`e4-pricing-001` A, `e1-sellers-003` A) | **cyan** | a published, disclosed figure |
| s3 | Hooper running ~20% above CAB (`e2-measurement-003`, B) | **amber** | commercial vendor's number, leaning to the paying side |
| s4 | FCC-extracted 73/27 split (`e2-sellers-002`, A) | **cyan** | *extracted by audit* — number wrested from the seller by a regulator |
| s5 | Census commission-received ~14% (`e4-pricing-001`, A) | **cyan** | independent census figure |
| s6 | People-meter honest count, CBS/ABC −13% (`e4-measurement-001`, B) | **cyan** | independent instrument; residual — it *hurt* the seller |
| s7 | Direct-response keyed reply (`e6-buyers-008`, A) | **cyan→amber** | buyer's own independent meter that lands *inside the seller's log* online — a reversion shown as color |
| s9 | Overture intent-without-identity clicks (`e5-targeting-004`, A) | **amber** | seller-owned platform count |
| s10 | rGSP / "Butternut Squash" price (`mech-rgsp-001`, `mech-knobs-001`, A) | **amber** + **cyan court-overlay** | seller-set price, surfaced by the 2024 court (§4.2) |
| s10 | Take-rate reversal 24.7%→21.3% (`mech-tac-003`, A) | **amber** | seller's own rate — residual that falls |
| s14 | Return to the hole; AI Overviews click 8% vs 15% (`e7-events-008`, B, **CONTESTED**) | **amber** + **redline** on the contested pair | seller-owned default; the disputed legend gets redline |

### 4.4 How a reversion is shown (the core visual verb)

A reversion = **one tracked object whose ownership color changes along time**, never two objects swapping. Requirements, drawn from P1's object-constancy discipline:

- **Anchor the object.** The mark keeps constant identity + position memory across the flip (Guardrail G3), so the eye reads "the same number changed hands," not "a reshuffle."
- **Time on x, SWEEP the transition.** Ownership changes are drawn left-to-right along a time axis with the **SWEEP** curve (chart-recorder pen).
- **SETTLE the arrival.** At the flip point the new color **SETTLES** in (crossfade, `cubic-bezier(.16,1,.3,1)`, 600–900ms) as the mark snaps to position — a galvanometer arriving on the new owner.
- **The anomaly is a cyan interval on an amber line.** The whole 1914 → ~2004 audit era reads as a cyan segment bracketed onto an otherwise-amber track; the two boundaries (1914, ~2002) are themselves grade-B, so they **jitter** (§5) — the reader feels the edges of the anomaly as uncertain, exactly the thesis ("the independent number was the ~90-year anomaly").

---

## 5. Measurement-jitter — re-tied to claim grade A/B/C

P1's signature device survives intact in physics; only its input changes. In P1, amplitude ∝ CI width. In P2, **amplitude ∝ the claim's grade** — because this piece grades every figure A/B/C and the grade *is* its uncertainty. "Grade-A marks sit still; grade-C marks shimmer."

### 5.1 Amplitude mapping (starting spec — tune in build)

| Grade | Meaning | Jitter amplitude | Feel |
|---|---|---|---|
| **A** | source-solid, load-bearing | **0px** — dead still | a settled reading |
| **B** | reported / single-source / interval-carrying | **~0.6px** | faint life |
| **C** | vendor panel / wide interval / soft endpoint | **~1.4px** (hard cap ~2px) | visible shimmer |

Physics rules (inherited, non-negotiable): jitter vibrates the mark **within its own band**; low frequency; **capped low so it reads "alive," not "broken."** A grade-C mark (e.g. s7 `e1-buyers-008` ~$192M, s9 `e7-buyers-003` PMax 71%, s13 `e7-scale-002` 1.32% of GDP) shimmers; a grade-A mark (s0 clicks, s4 73/27, s11 $26.3B) sits still. This makes proportion *visible*: the rule that grade-C figures "must not out-weigh their grade" is enforced perceptually — soft numbers literally refuse to hold still, so they cannot be mistaken for anchors.

### 5.2 Grade rides motion, not color (the collision fix)

Grade is encoded by **jitter amplitude + a monochrome mono badge** (`--graphite` on `--zinc @ 12%`), and **never** by the amber/cyan pair. P1 could tint grade badges cyan/amber because color there meant price/cost; in P2 that channel is spent on ownership. Redundant coding (Ware) keeps it accessible: grade = motion (amplitude) + text (`A`/`B`/`C` badge); ownership = hue; DEAD = hatch + strike. Three orthogonal channels, no overload.

### 5.3 Reduced-motion fallback (`prefers-reduced-motion: reduce`)

- Jitter → **static hatched band** whose hatch density ∝ grade (A = no hatch, B = sparse, C = dense). The uncertainty is still *seen*, just not moving.
- Morphs / crossfades → **cross-fades become hard swaps**; reversions step from amber to cyan to amber discretely (no animated blend), with the ownership legend redundant so the step is legible.
- SWEEP line-draws → appear **complete on load** (no animated draw).
- Global: reuse P1's shipped `@media (prefers-reduced-motion:reduce){*{animation:none!important}}` and layer these explicit fallbacks on top.

---

## 6. DEAD / CONTESTED treatment (redline)

The DEAD column **ships to the reader** (twelve corrected legends + one CONTESTED). Component grammar:

- **Inline DEAD callout** at each slot where the prose knocks down a legend (exact slots pinned at claim→paragraph mapping; candidates s4, s5, s7, s8, s9, s11, s12, s13 — **s14 ships as CONTESTED, not DEAD**): a `--card` panel, **left border `--redline` 3px**, the legend set in **strike-through + redline hatch**, the corrective in graphite serif beneath. Redundant coding: color + hatch + the literal word `DEAD` (or `CONTESTED`) — never redline alone, because redline sits near amber for protanopes.
- **CONTESTED variant (s14)** — the "AI Overviews cut the funding click" legend ships as **CONTESTED**, not DEAD: both values shown (8% vs 15%), Google's dispute named, rendered as a **two-tone variant, not a strike**.
- Redline **never touches an ownership mark** (§4). Three orthogonal channels stay orthogonal: ownership = hue, grade = motion, DEAD = hatch + strike + label.
