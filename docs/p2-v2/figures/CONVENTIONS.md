# P2 v2 FIGURE CONVENTIONS — the exact wiring every figure HTML must use

*Build-setup output. Reads with `design/FIGURE-PLAN.md` (what to build), `design/DESIGN.md`
(the encoding law), `design/PAGE-DESIGN.md` (the plate). This file is the HOW: the verbatim
import boilerplate, the mount pattern, the render entry points, the colour/jitter discipline, and
the exact `adspend.json` series keys. Copy the boilerplate; do not reinvent it.*

Figure HTML files live in **`docs/p2-v2/figures/`** (one file per figure, e.g.
`fig-02-instrument-blind.html`). All paths below are relative to that folder.

---

## 0. Two facts that decide the whole wiring

1. **Serve over http; do NOT open over `file://`.** The toolkit is ES modules and Chrome refuses
   `<script type="module">` imports over `file://`. Run `python3 -m http.server 8000` from the repo
   root and open `http://localhost:8000/docs/p2-v2/figures/<file>.html`. (The reused demos say the
   same.)
2. **Inline the data; never `fetch` it.** The frozen record lives OUTSIDE `docs/` (in
   `p2-ad-market/data/`), so a deployed Pages site under `docs/` cannot reach it. Bake the values the
   figure cites into a committed data module and `import` it (§4). No `guards.loadFrozen()` — that
   fetches. Use `guards.useFrozen({...})` with the inlined object instead.

---

## 1. The `<head>` — CSS load order is LOAD-BEARING

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FIGURE 02 · The instrument goes blind — P2 v2</title>
<!-- order matters: toolkit tokens → reused-renderer furniture → v2 figure layer -->
<link rel="stylesheet" href="../lib/tokens.css">
<link rel="stylesheet" href="../charts/chart-demo.css">
<link rel="stylesheet" href="./figures.css">
</head>
<body class="p2 p2-paper-ground">
```

- `tokens.css` — the toolkit's `--p2-*` tokens + `.p2-*` type/rocker/tremor classes. Required by
  every reused renderer and by `verifyTokenParity()`.
- `chart-demo.css` — the bank / cross-section / panel / control layout classes
  (`.p2-bank-grid`, `.p2-panel`, `.p2-cross-body`, `.p2-select`, …). Required by figs 3/4/7/8/10.
- `figures.css` — the v2 plate, citation shelf, legend, and **grade→jitter** keyframes. Loaded LAST
  so its rules win. `body class="p2 p2-paper-ground"` gives the bone ground + faint grid.

---

## 2. The module `<script>` — VERBATIM import boilerplate

Paste this block. Uncomment only the toolkit modules the figure actually uses.

```html
<script type="module">
/* --- always --- */
import * as guards from '../lib/guards.js';
import { initMotion, installMotionToggle } from '../lib/motion.js';
import { verifyTokenParity } from '../lib/tokens.js';

/* --- svg-kit primitives (fig 2 dual-rail caliper, the hero, any custom composition) --- */
import {
  svgRoot, layer, linear, log10Scale, polyline, pointMark, spanMark, band,
  caliper, absenceBlock, rule, text, frame, usd, pct, comma,
} from '../charts/svg-kit.js';

/* --- the claim mint (under every figure that draws a graded mark) --- */
import {
  planClaimMark, markReading, markFigure, anchorY,
  verdictRegister, stampVerdict, verdictStamps,
} from '../charts/claim-marks.js';

/* --- reused renderers: import ONLY the one this figure needs --- */
// import { renderBank, renderCrossSection, render } from '../charts/small-multiples.js';
// import { render as renderStrip } from '../charts/gdp-strip.js';

/* --- the shared slope helper (figs 5 & 6 only) --- */
// import { renderMiniSeries } from '../charts/mini-series.js';

/* --- inlined data (see §4); NOT a fetch --- */
import { adspend, claims } from './data/fig-02.data.js';

initMotion();                 // stamps <html data-motion> so figures.css jitter fallbacks fire
verifyTokenParity();          // optional dev guard: throws if tokens.css and tokens.js disagree
guards.useFrozen({ adspend, claims });   // inject inlined data; the renderers read it from here

/* … build the figure into the plate (see §3, §5) … */
</script>
```

Notes:
- `initMotion()` is what makes the reduced-motion path work: it writes `data-motion` on `<html>`,
  which `figures.css` §9 keys its "jitter → static hatch" fallback on (alongside the OS media query).
- `verifyTokenParity()` is a dev safety net (the demos call it). Safe to keep; safe to drop.
- `installMotionToggle(el)` is optional — add it only if the figure ships an in-page motion toggle.

---

## 3. The PLATE — the HTML skeleton every figure mounts into

Build this once in the body; drop the live drawing into `.fig-body`. Classes are defined in
`figures.css` §2–3 and match PAGE-DESIGN §6.

```html
<figure class="fig-plate" id="fig02">
  <div class="fig-kicker">
    <span>FIGURE&nbsp;02 <span class="fig-title">The instrument goes blind</span></span>
    <button class="fig-keybtn" type="button" aria-expanded="true" aria-controls="fig02-legend">key</button>
  </div>

  <!-- FIRST FIGURE ON THE PAGE: paste _legend.html here, id="fig02-legend" (see §6). -->

  <div class="fig-body" id="fig02-body"><!-- svg mounts here --></div>

  <!-- axis basis, when it must carry an ownership hue (SVG text cannot — see §7) -->
  <div class="fig-axis-basis">
    <span class="rail-cyan">cyan rail — historian's compiled billings, US$m (Coen/McCann)</span> ·
    <span class="rail-amber">amber rail — internet revenue reported by sellers, US$m (IAB/PwC)</span>
  </div>

  <hr class="fig-rule">
  <figcaption class="fig-caption">One plain sentence saying what the figure shows.</figcaption>

  <!-- citation shelf: same grammar as the prose sidenotes -->
  <div class="fig-shelf">
    <span class="src-chip" data-grade="A" data-own="cyan">
      <span class="grade-glyph"></span><span class="grade-letter">A</span>
      <span class="own-dot"></span>
      <a class="claim-id" href="#e6-medium-006">e6-medium-006</a>
    </span>
    <!-- one .src-chip per claim the figure rests on -->
  </div>
</figure>
```

Mount the drawing:

```js
const body = document.getElementById('fig02-body');
// reused renderer:  renderBank(body, { adspend, claims }, { mode: 'share' });
// svg-kit figure:   const svg = svgRoot(body, { width: 960, height: 420, alt: '…sentence…' }); …
```

**Reused renderers inject their own `<header>` (arch label + title + lede + controls).** For a v2
plate you usually want the plate's kicker/caption to speak instead. Either let the renderer's header
show (it is styled, harmless) or hide it with a scoped rule in the figure's own `<style>`
(`#fig02 .p2-bank-head{display:none}`). The plan's kicker/caption/shelf are the v2 voice.

---

## 4. Inlining the data (the `./data/<fig>.data.js` module)

Each figure imports a committed ES module that re-exports the slice it needs. Generate it once from
the frozen record, commit it, and the figure is self-contained and deploy-safe.

**Tier A — svg-kit figures (fig 2, hero) and mini-series (figs 5, 6):** inline only the series
arrays + claim records cited. Small. Example generator for fig 2:

```bash
python3.12 - <<'PY' > docs/p2-v2/figures/data/fig-02.data.js
import json
d = json.load(open('p2-ad-market/data/adspend.json'))
pick = lambda k,m: [{'year':p['year'],'value':p['value']}
                    for p in d['series'][k]['points']
                    if p.get('medium')==m and p.get('money_type') is None]
out = {
  'coen_internet': pick('coen_mce','internet'),   # 1997–2007, ends 10529
  'iab_internet':  pick('iab_pwc','internet'),     # 1996–2025, 2007=21206 … 2025=294593
}
print('export const series = %s;' % json.dumps(out))
# claim records the figure mints (grade/verdict/interval):
import subprocess
ids = ['e6-medium-006','e7-medium-001']
claims=[json.loads(subprocess.check_output(
    ['python3.12','p2-ad-market-v2/discovery/claim.py',i])) for i in ids]
print('export const claims = { claims: %s };' % json.dumps(claims))
PY
```

Then in the figure: `import { series, claims } from './data/fig-02.data.js';` and mint with
`planClaimMark(claims.claims.find(c=>c.id==='e6-medium-006'), {...})`.

**Tier B — reused renderers (figs 3, 4, 7, 8, 10):** these read the *whole* frozen record and run
internal partition / cross-checks, so inline the **full** `adspend.json` (and `claims.json` for the
GDP strip, which reads its readings from claims):

```bash
mkdir -p docs/p2-v2/figures/data
python3.12 - <<'PY' > docs/p2-v2/figures/data/full.data.js
import json
a=json.load(open('p2-ad-market/data/adspend.json'))
c=json.load(open('p2-ad-market/data/claims.json'))
print('export const adspend = %s;' % json.dumps(a))
print('export const claims  = %s;' % json.dumps(c))
PY
```

Then: `import { adspend, claims } from './data/full.data.js';` → `renderBank(body, {adspend,claims}, …)`.
`mini-series.js` needs NO `useFrozen` — it reads its claim straight from `spec.claim`.

---

## 5. Render entry points (signatures + which figure uses each)

| Entry point | Module | Signature | Used by |
|---|---|---|---|
| `renderBank` | `small-multiples.js` | `(container, frozen, {mode:'share'\|'dollars'})` | **fig 3** (and fig 10 panel) |
| `renderCrossSection` | `small-multiples.js` | `(container, frozen, {year})` | **fig 7**, **fig 8** (+ callout bars) |
| `render` (GDP strip) | `gdp-strip.js` | `(container, frozen, {window:'narrow'\|'wide', verdicts?})` | **fig 4** |
| `renderMiniSeries` | `mini-series.js` | `(container, spec, options)` — see the JSDoc header | **fig 5**, **fig 6** |
| svg-kit primitives | `svg-kit.js` | `svgRoot`, `linear`/`log10Scale`, `polyline`, `pointMark`, `spanMark`, `band`, `caliper`, `absenceBlock`, `rule`, `text`, `frame` | **fig 2** (dual-rail caliper), the **hero** |
| `renderRailBoard` | `rail-board.js` | `(container, frozen, options)` | hero grammar reference (bands/cadence/SWEEP); not a standalone figure |
| `renderValueChart` | `value-chart.js` | `(container, frozen, {annotate:[ids]})` | **not scheduled** (reserve; §F) |

- All three reused renderers call `guards.useFrozen(frozen)` internally, so pass
  `frozen = { adspend, claims }` as the second argument. They also **return `{ plan, … }`** — read
  `out.plan` for the computed panels/readings if the caption needs a live number.
- The claim mint under every drawn mark: `planClaimMark(claim, { year, label, register?, format })`
  → a frozen mark carrying `grade`, `verdict`, `kind`, `lo`, `hi`, and (points only) `central`.
  Read it back only through `markReading` / `markFigure`; position it only through
  `anchorY(mark, scale)`. Never hand-build a mark (`assertMark` refuses it).

---

## 6. The legend include

`_legend.html` is the reusable "How to read this" key. **Paste its inner block** into the first
figure on a page, directly under the kicker, giving the wrapper a unique id
(`fig02-legend`, `hero-legend`). Wire the kicker's `[ key ]` button:

```js
const keyBtn = document.querySelector('#fig02 .fig-keybtn');
const legend = document.getElementById('fig02-legend');
keyBtn.addEventListener('click', () => {
  const open = keyBtn.getAttribute('aria-expanded') === 'true';
  keyBtn.setAttribute('aria-expanded', String(!open));
  legend.hidden = open;                 // figures.css hides on [hidden]
});
```

Show it **expanded on the first figure** (hero / fig 2); on later figures start collapsed
(`aria-expanded="false"`, `<div … hidden>`).

---

## 7. Colour discipline (READ THIS before painting anything)

Two palette systems coexist. They do not collide, but they draw a hard line between **marks** and
**text**.

- **Ownership hues on DATA MARKS** (lines, dots, bands, the recoloured part): pass the **v2 hex**
  straight to the svg-kit mark primitives — `polyline(g, pts, { color: '#3AA6BD' })`,
  `pointMark(g, { color: '#E0972A' })`. These primitives run **no colour guard**, so the v2 amber
  `#E0972A` and cyan `#3AA6BD` are legal here. Read the hex from the CSS var if you prefer:
  `getComputedStyle(document.documentElement).getPropertyValue('--amber').trim()`.
- **SVG `<text>` must stay text-safe.** `svg-kit.text()` runs `assertTextColor` against a CLOSED
  allow-list that does **not** contain `#E0972A` / `#9a6612` / `#C6432B` — passing them **throws**.
  For in-SVG labels use a neutral safe token (`ZINC_TEXT`, `GRAPHITE`, `IRON`) or, if a label must
  read as an ownership hue *inside* the SVG, the toolkit's guarded deep variants
  `CYAN_TEXT #1F6E80` / `BRASS_TEXT #8A5F20`.
- **Ownership-COLOURED labels belong in HTML plate chrome**, not SVG: the axis-basis
  (`.fig-axis-basis .rail-cyan/.rail-amber`), the citation shelf dots (`.own-dot`), stat-callouts.
  There `figures.css` uses the true v2 `--amber #E0972A` / `--amber-d #9a6612` / `--redline #C6432B`
  with contrast handled.
- **cyan is identical in both systems** (`#3AA6BD`); only **amber** (v2 `#E0972A` vs toolkit brass
  `#B07A2C`) and **redline** (v2 `#C6432B` vs toolkit rust `#A8442E`) differ. When you want the v2
  amber/redline, you must supply it — the toolkit defaults to brass/rust.
- **NEUTRAL figures** (figs 3, 4, 8, 9, 10, tag `NEUTRAL`): draw marks in **zinc/categorical**, never
  the ownership hues (Guardrail G1). Ownership rides ONLY the `.own-dot` on the shelf.
- **OWN-HUE figures** (hero, figs 2, 5, 6, 7): the hue **is** the argument — carry it on the marks.
- **Redline is DEAD/CONTESTED only** and **never touches an ownership mark**. Use `.dead-legend` /
  `.contested-legend` in HTML; redundantly coded (hatch + strike + the word DEAD/CONTESTED).

---

## 8. Jitter discipline (grade → motion, never colour)

- The v2 shimmer is a **figures.css** device, NOT the toolkit's `motion.js` `tremor` (that ties
  shimmer to CI-width and refuses to draw a tremoring claim as a point — the v1 model). **Do not call
  `tremor`.**
- Wrap the data marks in a `<g>` and add `class="fig-jit jit-A|B|C"` by the mark's **grade**:
  `A` = still (0px), `B` ≈ 0.6px, `C` ≈ 1.4px. `mini-series.js` does this for you; svg-kit figures
  do it by hand.
- **Grade-C never sits at a peak** (DESIGN §5). It rides low and shimmers.
- Reduced motion is handled for you: `figures.css` §9 stops the animation under the OS setting **or**
  `data-motion="reduce"`, and offers a static-hatch fallback (`.fig-hatch`, density by grade) for
  fillable marks. Call `initMotion()` so the toggle path works.

---

## 9. The exact `adspend.json` series keys (figs 2/3, plus 4/10)

Top level: `adspend.series.<key>.points[]`; each point is
`{ year, medium, money_type, value, unit, calibration:{ central, ci80, grade, sources, … } }`.
**Filter every read by `medium` AND `money_type`** — a series carries several mediums and some carry
`money_type` splits.

| Figure | series key | filter | span / notes |
|---|---|---|---|
| **fig 2** | `coen_mce` | `medium:'internet', money_type:null` | 1997–2007, **ends 10529 (2007)**; 11 points. Points are calibration grade **B**, but the governing claims `e6-medium-006` / `e7-medium-001` are grade **A** — draw the rails as grade A per the plan (jitter rides the *claim*, not the point). |
| **fig 2** | `iab_pwc` | `medium:'internet', money_type:null` | 1996–2025, 30 points. **2007=21206, 2008=23448, 2009=22661 (−3%), 2025=294593.** `iab_pwc` publishes **no `medium:'total'`** — it is internet-only, so `renderValueChart` will not draw it; that is why fig 2 is a hand-built dual-rail caliper. |
| **fig 3** | `coen_mce` | `medium` in {`newspapers`,`television`,`direct_mail`,`radio`,`magazines`,`internet`,`out_of_home`,`yellow_pages`,`business_papers`,`miscellaneous`,`farm_publications`, …}; `medium:'total'` is the whole | `renderBank` computes the panel set / order / ceiling / partition from the record at load — **pass the full record and let it choose.** TV 1949 ≈ $58m/1.1%; 1992 crossover TV $31,079m vs newspapers $30,737m. `coen_mce` also carries a `money_type` split (`local_retail`,`national_brand`) — the bank reads the `money_type:null` medium totals. |
| **fig 4** | (claims) | `render` (gdp-strip) reads its readings from **`claims.json`**, not adspend | pass `{ adspend, claims }`; the strip finds `*-scale-*` readings + the rejected `ds-gdp-001`. |
| **fig 10** | `naa_newspaper` | `medium:'newspapers', money_type:'classified'` | annual 1950–2010. **2000=19608, 2006=16986, 2008=9975.** Also `money_type:'national_brand'`,`'local_retail'` for the 2–3-line split. |

Other keys present: `magna` (`medium:'total'` → fig 9 IRS/MAGNA), `irs_soi`
(`medium:'total_corporate_ad_deductions'`, publishes no `'total'` → fig 9 hand-built rail),
`benchmarks_pre1919` (`medium:'total'`), `census_manufactures`, `bridge_mce_mg8`.

A full claim record (grade, verdict, ci80, statement, sources): `python3.12
p2-ad-market-v2/discovery/claim.py <id>`.

---

## 10. Per-figure quick map (from FIGURE-PLAN §A–B)

| Fig | Entry point | Hue tag | Claims (grade) | Jitter |
|---|---|---|---|---|
| Hero | svg-kit + rail-board grammar | OWN-HUE (amber→cyan→amber) | sequence: `e1-sellers-003`(A), `e1-measurement-002`(B), `mech-adwords-001`(A), `e6-measurement-006`(A) | boundaries grade-B → jitter |
| 2 | svg-kit dual-rail caliper | OWN-HUE (Coen cyan / IAB amber) | `e6-medium-006`(A), `e7-medium-001`(A) | rails A → still |
| 3 | `renderBank` | NEUTRAL (zinc panels) | `e2-medium-006`(B), `e4-medium-002`(B), `e2-medium-004`(B), `e7-medium-001`(A) | mostly B → faint |
| 4 | `render` (gdp-strip) | NEUTRAL (zinc) | `e2-scale-004`(B), `e2-scale-005`(B), `e7-scale-002`(C), `ds-gdp-001` rejected→stamped | endpoints C → shimmer, low |
| 5 | `renderMiniSeries` | CYAN (single-rail) | `e4-pricing-001`(A) — 5 pts 1977–1997, anchor 1992 | A → still |
| 6 | `renderMiniSeries` | AMBER (single-rail) | `mech-tac-003`(A, verdict *post-verification* → pass a `verdictRegister`) | A → still |
| 7 | `renderCrossSection` | OWN-HUE (PPA part cyan→amber) | `e6-buyers-008`(A) | A → still |

DEAD/CONTESTED legends each figure must carry are listed per-figure in FIGURE-PLAN §B; render them
with `.dead-legend` / `.contested-legend` (§7).
