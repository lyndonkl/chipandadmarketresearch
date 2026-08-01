/**
 * docs/p2/charts/svg-kit.js — THE SVG PRIMITIVES FOR THE P2 CHART LAYER.
 * There is one kit. There used to be two.
 *
 * WHAT THIS IS, AND WHAT IT IS DELIBERATELY NOT.
 *
 * This file owns exactly one thing: turning numbers into SVG elements. It owns
 * no colour, no motion timing, and no invariant. Every colour comes from
 * `../lib/tokens.js`; every rule that can be broken comes from
 * `../lib/guards.js`; every animation comes from `../lib/motion.js`.
 *
 * The defect class this project has hit at every stage is a second source of
 * truth. So nothing here re-implements a library decision. Where a helper
 * paints, it paints a hex it imported, and where it paints text it routes the
 * hex through `assertTextColor` first — because the two Zinc tokens are one
 * letter apart in an editor and both wrong choices are silent.
 *
 * ----------------------------------------------------------------------
 * WHY THERE IS NO chart-kit.js ANY MORE
 *
 * There were two kits. `chart-kit.js` served the rail board and the value
 * chart; this file served the bank and the GDP strip. They overlapped on
 * `el`, `text`, `defs`, a linear scale, a log scale, a decade-tick generator
 * and a unique-id counter — SIX helpers, written twice, drifting:
 *
 *   - `text` took `(role, x, y, str, attrs)` in one kit and `(parent, spec)` in
 *     the other, so the same call read as two different things in one repo;
 *   - `defs` MEANT two different things: one returned the `<defs>` node, the
 *     other built four textures and returned their paint strings. A developer
 *     who moved a helper between charts got whichever one their import line
 *     happened to name;
 *   - `logScale` clamped its input to the domain floor and `log10Scale` did
 *     not, so the same value drew at two heights depending on which chart drew
 *     it.
 *
 * Two files answering the same question two ways is this project's own defect
 * class arriving at the chart layer, and both engineers on the build flagged
 * it independently. So the kits are merged. The surviving surface is this
 * one's — `text(parent, spec)`, `linear`, `log10Scale`, `decadeTicks`, `uid`
 * — plus the pieces only chart-kit had, which are kept under names that say
 * what they do: `textures()` (the four patterns, was `defs`), `layer`,
 * `titled`, `sweepClip`, `shortLabel`, `comma`, `yearsLabel`.
 *
 * The one convention this file does carry, and it is a DRAWING convention
 * rather than a measurement, is the grade register from the chosen sample page
 * (`design/samples/bench.html`): source grade A is a solid tint, B is ruled, C
 * is 45-degree hatch. It is here rather than in a chart module so the two
 * charts cannot drift apart on it.
 */

import {
  BONE, GRAPHITE, ZINC_RULE, ZINC_TEXT, BRASS, BRASS_TEXT, IRON, STIPPLE,
  INK, SURFACE, TYPE_ROLE, GRID, RULE_WIDTH,
  assertTextColor, assertObjectColor,
} from '../lib/tokens.js';

export const NS = 'http://www.w3.org/2000/svg';

/* Unique per document, so two charts on one page cannot collide on a pattern id. */
let _uid = 0;
export function uid(prefix = 'p2') { _uid += 1; return `${prefix}-${_uid}`; }

/* ------------------------------------------------------------------ *
 * 1 · Element construction
 * ------------------------------------------------------------------ */

/** Create an SVG element, set attributes, append. Attribute values are literals. */
export function el(name, attrs = {}, parent = null) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    node.setAttribute(k, String(v));
  }
  if (parent) parent.appendChild(node);
  return node;
}

/** Create an HTML element the same way, for the page furniture around a drawing. */
export function h(name, attrs = {}, parent = null) {
  const node = document.createElement(name);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    if (k === 'text') { node.textContent = String(v); continue; }
    if (k === 'html') { node.innerHTML = String(v); continue; }
    node.setAttribute(k, String(v));
  }
  if (parent) parent.appendChild(node);
  return node;
}

/**
 * An `<svg>` root with the accessible name it must carry.
 *
 * `alt` is REQUIRED and it is not decoration. DESIGN.md adopts a plain-English
 * sentence in the data layer for every visual, driving a text-only path (team
 * B8). That field does not exist in the frozen record yet, so every sentence
 * these charts produce is generated at draw time and stamped
 * `data-alt-source="generated-by-chart"` — which is how B8 finds all of them
 * later and replaces them with the authored ones.
 */
export function svgRoot(parent, { width, height, alt, className = '' }) {
  if (typeof alt !== 'string' || alt.trim().length < 12) {
    throw new Error(
      'svg-kit: every drawing needs a plain-English `alt` sentence. DESIGN.md makes it a ' +
      'requirement of the data layer, not a nicety, because the text-only path is built out ' +
      'of these sentences. Write one that says what the drawing shows.'
    );
  }
  const svg = el('svg', {
    viewBox: `0 0 ${width} ${height}`,
    role: 'img',
    'aria-label': alt,
    class: className,
    'data-alt-source': 'generated-by-chart',
    preserveAspectRatio: 'xMidYMid meet',
  }, parent);
  svg.style.display = 'block';
  svg.style.width = '100%';
  svg.style.height = 'auto';
  return svg;
}

/** The `<defs>` block for one svg, created once. */
export function defs(svg) {
  let d = svg.querySelector(':scope > defs');
  if (!d) {
    d = el('defs', {}, svg);
    svg.insertBefore(d, svg.firstChild);
  }
  return d;
}

/** A `<g>`, appended to `parent`. Returns the group. */
export function layer(parent, attrs = {}) {
  return el('g', attrs, parent);
}

/**
 * A `<title>` child, which is the accessible name of the element it sits in.
 * Inserted FIRST, because a `<title>` after other children is announced late by
 * some screen readers and ignored by others.
 */
export function titled(node, str) {
  const t = el('title');
  t.textContent = String(str);
  node.insertBefore(t, node.firstChild);
  return node;
}

/* ------------------------------------------------------------------ *
 * 2 · Scales. Pure arithmetic; no opinion about what is being scaled.
 * ------------------------------------------------------------------ */

export function linear(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  const fn = (v) => (span === 0 ? r0 : r0 + ((v - d0) / span) * (r1 - r0));
  fn.domain = domain; fn.range = range;
  fn.invert = (p) => (r1 === r0 ? d0 : d0 + ((p - r0) / (r1 - r0)) * span);
  fn.kind = 'linear';
  return fn;
}

export function log10Scale(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  if (!(d0 > 0) || !(d1 > 0)) {
    throw new Error(`svg-kit: a log scale needs a strictly positive domain, got [${d0}, ${d1}].`);
  }
  const l0 = Math.log10(d0);
  const l1 = Math.log10(d1);
  const fn = (v) => (v <= 0 ? r0 : r0 + ((Math.log10(v) - l0) / (l1 - l0)) * (r1 - r0));
  fn.domain = domain; fn.range = range;
  fn.invert = (p) => 10 ** (l0 + ((p - r0) / (r1 - r0)) * (l1 - l0));
  fn.kind = 'log10';
  return fn;
}

/** Round a maximum up to a readable ceiling: 66.7 -> 70, 4.9 -> 5. */
export function ceilTo(value, step) {
  return Math.ceil(value / step) * step;
}

/** Decade ticks for a log axis, inside the domain. */
export function decadeTicks([lo, hi]) {
  const out = [];
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e += 1) {
    const v = 10 ** e;
    if (v >= lo && v <= hi) out.push(v);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 3 · Patterns. Textures, never fills that mean a colour.
 * ------------------------------------------------------------------ */

/**
 * The grade register, from `design/samples/bench.html`:
 *   A  solid tint   — a primary record
 *   B  ruled        — a published compiler
 *   C  45° hatch    — our own construction or a reconstruction
 *
 * A DRAWING CONVENTION, not a measurement. It lives here so the two charts
 * cannot answer it differently.
 */
export const GRADE_FORMS = Object.freeze({
  A: 'solid tint',
  B: 'ruled',
  C: '45° hatch',
});

const _patternCache = new WeakMap();

function patternKey(svg) {
  if (!_patternCache.has(svg)) _patternCache.set(svg, new Map());
  return _patternCache.get(svg);
}

/** Grade fill for a band. Returns a paint string usable as `fill`. */
export function gradeFill(svg, grade, color = BRASS) {
  const g = String(grade || 'C').toUpperCase();
  const cache = patternKey(svg);
  const key = `grade-${g}-${color}`;
  if (cache.has(key)) return cache.get(key);
  let paint;
  if (g === 'A') {
    paint = color;                       // solid; the band's own opacity does the tinting
  } else {
    const id = uid('grade');
    const p = el('pattern', {
      id, width: g === 'B' ? 4 : 6, height: g === 'B' ? 4 : 6,
      patternUnits: 'userSpaceOnUse',
      patternTransform: g === 'C' ? 'rotate(45)' : null,
    }, defs(svg));
    el('rect', { width: g === 'B' ? 4 : 6, height: g === 'B' ? 4 : 6, fill: BONE, 'fill-opacity': 0 }, p);
    if (g === 'B') {
      el('line', { x1: 0, y1: 0.5, x2: 4, y2: 0.5, stroke: color, 'stroke-width': 1 }, p);
    } else {
      el('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: color, 'stroke-width': 1.2 }, p);
    }
    paint = `url(#${id})`;
  }
  cache.set(key, paint);
  return paint;
}

/**
 * Documented absence. A 2px stipple, and it is never used as a fill on its own —
 * `absenceBlock` below always frames it in Iron and prints its name, because
 * rule 5 says absence is a positive object.
 */
export function stipplePaint(svg) {
  const cache = patternKey(svg);
  if (cache.has('stipple')) return cache.get('stipple');
  const id = uid('stipple');
  const p = el('pattern', { id, width: 5, height: 5, patternUnits: 'userSpaceOnUse' }, defs(svg));
  el('circle', { cx: 1.4, cy: 1.4, r: 1, fill: STIPPLE }, p);
  el('circle', { cx: 3.9, cy: 3.9, r: 1, fill: STIPPLE }, p);
  const paint = `url(#${id})`;
  cache.set('stipple', paint);
  return paint;
}

/**
 * THE TEXTURE SET, namespaced per chart instance.
 *
 *   hatchIron   — 45°, iron: CONSTRUCTED. Our own build, never a published count.
 *   hatchBrass  — 45°, brass: a money quantity shown as a share, never a level.
 *   stipple     — 2px dots: DOCUMENTED ABSENCE. Rule 5. Never a fill on its own.
 *   crosshatch  — iron cross: the overlap of two things that cannot be ordered.
 *
 * `id` namespaces the pattern ids, because two charts on one page share a
 * document and a duplicate pattern id silently repaints the first chart with
 * the second chart's texture.
 *
 * This was `chart-kit.defs(svg, id)`. It is renamed because `defs` already
 * means "the `<defs>` node" in this file, and one name meaning two things
 * across two files is how a helper gets moved between charts and silently
 * stops doing what its call site says.
 */
export function textures(svg, id) {
  assertObjectColor(IRON, 'svg-kit textures');
  const d = defs(svg);
  const mk = (tag, attrs, kids) => {
    const n = el(tag, attrs, d);
    (kids || []).forEach((k) => n.appendChild(k));
    return n;
  };
  mk('pattern',
    { id: `${id}-hatchIron`, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
    [el('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: IRON, 'stroke-width': 1 })]);
  mk('pattern',
    { id: `${id}-hatchBrass`, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
    [el('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: BRASS, 'stroke-width': 1.1 })]);
  mk('pattern',
    { id: `${id}-stipple`, width: 5, height: 5, patternUnits: 'userSpaceOnUse' },
    [el('circle', { cx: 1.5, cy: 1.5, r: 1, fill: STIPPLE }),
     el('circle', { cx: 4, cy: 4, r: 1, fill: STIPPLE })]);
  mk('pattern',
    { id: `${id}-crosshatch`, width: 7, height: 7, patternUnits: 'userSpaceOnUse' },
    [el('path', { d: 'M0 0 L7 7 M7 0 L0 7', stroke: IRON, 'stroke-width': 0.8, 'stroke-opacity': 0.9 })]);
  return {
    hatchIron: `url(#${id}-hatchIron)`,
    hatchBrass: `url(#${id}-hatchBrass)`,
    stipple: `url(#${id}-stipple)`,
    crosshatch: `url(#${id}-crosshatch)`,
  };
}

/**
 * A clipPath the SWEEP verb can drive. Returns `{ ref, apply(t) }`.
 * `apply(1)` is the finished state, which is what the reduced half of SWEEP
 * asks for on the first frame — the rails end up completely drawn either way.
 */
export function sweepClip(svg, id, { x = 0, y = 0, width = 0, height = 0 } = {}) {
  const rect = el('rect', { x, y, width: 0, height });
  const clip = el('clipPath', { id: `${id}-sweep` }, svg);
  clip.appendChild(rect);
  return {
    ref: `url(#${id}-sweep)`,
    apply(t) { rect.setAttribute('width', String(Math.max(0, width * t))); },
  };
}

/* ------------------------------------------------------------------ *
 * 4 · Marks
 * ------------------------------------------------------------------ */

/**
 * A text node in one of the four type roles. The hex is checked before it lands.
 *
 * `parent` may be null, and then the node comes back unappended — the shape the
 * rail board and the value chart use, where a label is built and then placed
 * into whichever layer it belongs in.
 *
 * THE TYPE IS WRITTEN AS INLINE STYLE, NOT AS A PRESENTATION ATTRIBUTE. This is
 * the one thing the merged kit takes from chart-kit rather than from here, and
 * it is a repair: `tokens.css` declares `.p2-arch { font-size: 11px }`, a CSS
 * rule beats a presentation attribute, so a chart label asking for 8px through
 * `font-size="8"` under `class="p2-arch"` silently renders at 11px and the
 * eight-track strip stops fitting inside its own height. Inline style wins over
 * both, so the size a chart asks for is the size it gets.
 */
export function text(parent, { x, y, value, role = 'chrome', fill = null, anchor = 'start',
                               baseline = null, size = null, tracking = null,
                               opacity = null, title = null, attrs = null }) {
  const spec = TYPE_ROLE[role];
  if (!spec) throw new Error(`svg-kit: "${role}" is not one of the four type roles.`);
  const paint = fill || spec.color;
  assertTextColor(paint, `svg-kit text (${role})`);
  const node = el('text', Object.assign({
    x, y,
    fill: paint,
    'text-anchor': anchor,
    'dominant-baseline': baseline,
    'fill-opacity': opacity,
  }, attrs || {}), parent);
  node.style.fontFamily = spec.family;
  node.style.fontSize = typeof size === 'number' ? `${size}px` : (size || spec.size);
  node.style.fontWeight = String(spec.weight);
  node.style.letterSpacing = tracking || spec.tracking;
  if (spec.features && spec.features['font-variant-numeric']) {
    node.style.fontVariantNumeric = spec.features['font-variant-numeric'];
  }
  if (spec.features && spec.features['font-feature-settings']) {
    node.style.fontFeatureSettings = spec.features['font-feature-settings'];
  }
  if (spec.transform === 'uppercase') node.textContent = String(value).toUpperCase();
  else node.textContent = String(value);
  if (title) el('title', {}, node).textContent = title;
  return node;
}

/** The board frame. Iron at mechanism weight — the apparatus, never a value. */
export function frame(parent, { x, y, width, height, fill = SURFACE.paper }) {
  assertObjectColor(IRON, 'svg-kit frame');
  return el('rect', {
    x, y, width, height, fill,
    stroke: IRON, 'stroke-width': RULE_WIDTH.mechanism,
  }, parent);
}

/** A hairline rule. Zinc, 1px, dashed where it is indicative rather than measured. */
export function rule(parent, { x1, y1, x2, y2, dashed = false, color = ZINC_RULE, width = RULE_WIDTH.hairline }) {
  return el('line', {
    x1, y1, x2, y2, stroke: color, 'stroke-width': width,
    'stroke-dasharray': dashed ? '3 3' : null,
  }, parent);
}

/**
 * DOCUMENTED ABSENCE, drawn as an object.
 *
 * Returns the descriptor `guards.assertAbsenceDrawn` wants back, so the caller
 * can hand the guard exactly what it drew:
 *   { years: [from, to], label, form: 'stipple' }
 *
 * The guard checks the descriptor, not the DOM — that limit is written down in
 * the library README — so a caller that builds the descriptor without calling
 * this function is unprotected. Call this one.
 */
export function absenceBlock(parent, svg, { x, y, width, height, years, label, vertical = false, note = null }) {
  if (!Array.isArray(years) || years.length !== 2) {
    throw new Error('svg-kit: an absence block must name the years it covers.');
  }
  if (typeof label !== 'string' || label.trim() === '') {
    throw new Error('svg-kit: an absence block must be named. An unlabelled block is whitespace with a texture on it.');
  }
  const g = el('g', { class: 'p2-absence', 'data-years': years.join('-') }, parent);
  el('rect', { x, y, width, height, fill: stipplePaint(svg) }, g);
  assertObjectColor(IRON, 'svg-kit absence frame');
  el('rect', {
    x, y, width, height, fill: 'none',
    stroke: IRON, 'stroke-width': 1, 'stroke-dasharray': '4 3',
  }, g);
  if (width > 46 && height > 12) {
    if (vertical) {
      const t = text(g, { x: 0, y: 0, value: label, role: 'label', fill: ZINC_TEXT, anchor: 'middle' });
      t.setAttribute('transform', `translate(${x + width / 2} ${y + height / 2}) rotate(-90)`);
      t.setAttribute('dominant-baseline', 'middle');
    } else {
      text(g, {
        x: x + width / 2, y: y + height / 2 + 4, value: label,
        role: 'label', fill: ZINC_TEXT, anchor: 'middle',
      });
    }
  }
  /* `note` carries the RECORD'S OWN reason(s) for the hole. One drawn block can
   * cover more than one documented absence — 1840–1866 ("no estimate of any
   * kind exists") runs straight into 1867–1918 ("benchmark years only") — and
   * merging them into one rectangle without carrying both sentences turns two
   * different findings into one anonymous grey stretch. */
  el('title', {}, g).textContent =
    `${years[0]}–${years[1]}: ${label}${note ? ` · the record's reason: ${note}` : ''}`;
  return { years: [years[0], years[1]], label, form: 'stipple' };
}

/**
 * A span-only mark: the interval, and NO central. Used wherever G1 refuses a
 * point. It is drawn with both ends ticked so it cannot be mistaken for a bar
 * growing from a baseline.
 */
export function spanMark(parent, { x, yLow, yHigh, color = BRASS, width = 7, title = null }) {
  const g = el('g', { class: 'p2-span-only' }, parent);
  const top = Math.min(yLow, yHigh);
  const bottom = Math.max(yLow, yHigh);
  el('line', { x1: x, y1: top, x2: x, y2: bottom, stroke: color, 'stroke-width': 2 }, g);
  el('line', { x1: x - width / 2, y1: top, x2: x + width / 2, y2: top, stroke: color, 'stroke-width': 1.6 }, g);
  el('line', { x1: x - width / 2, y1: bottom, x2: x + width / 2, y2: bottom, stroke: color, 'stroke-width': 1.6 }, g);
  if (title) el('title', {}, g).textContent = title;
  return g;
}

/** A point mark: money is the only filled round mark (REDUNDANT_CODING.money). */
export function pointMark(parent, { x, y, color = BRASS, r = 2.6, title = null }) {
  const node = el('circle', { cx: x, cy: y, r, fill: color }, parent);
  if (title) el('title', {}, node).textContent = title;
  return node;
}

/** A polyline from [x, y] pairs. Never call this across a break — build one per segment. */
export function polyline(parent, points, { color = BRASS, width = 2, dashed = false, opacity = null, title = null }) {
  if (points.length === 0) return null;
  if (points.length === 1) {
    return pointMark(parent, { x: points[0][0], y: points[0][1], color, r: width, title });
  }
  const d = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const node = el('path', {
    d, fill: 'none', stroke: color, 'stroke-width': width,
    'stroke-linejoin': 'round', 'stroke-linecap': 'round',
    'stroke-dasharray': dashed ? '5 3' : null,
    'stroke-opacity': opacity,
  }, parent);
  if (title) el('title', {}, node).textContent = title;
  return node;
}

/** A filled band between a low path and a high path. Used for 80% intervals. */
export function band(parent, lowPts, highPts, { fill = BRASS, opacity = 0.18, title = null }) {
  if (lowPts.length < 2) return null;
  const up = lowPts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const down = [...highPts].reverse().map(([x, y]) => `L${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const node = el('path', { d: `${up} ${down} Z`, fill, 'fill-opacity': opacity, stroke: 'none' }, parent);
  if (title) el('title', {}, node).textContent = title;
  return node;
}

/**
 * A caliper: two ticks and a measured distance between them, with the number
 * printed. This is the project's answer to "two rails overlap" — the gap is an
 * object, so it gets a drawn instrument and a printed figure.
 */
export function caliper(parent, { x, yA, yB, label, side = 1, arm = 9 }) {
  const g = el('g', { class: 'p2-caliper' }, parent);
  const stem = x + side * arm;
  el('path', {
    d: `M${x} ${yA} L${stem} ${yA} M${x} ${yB} L${stem} ${yB} M${stem} ${yA} L${stem} ${yB}`,
    fill: 'none', stroke: IRON, 'stroke-width': 1,
  }, g);
  text(g, {
    x: stem + side * 4, y: (yA + yB) / 2 + 3.5, value: label,
    role: 'chrome', fill: IRON, anchor: side > 0 ? 'start' : 'end',
  });
  return g;
}

/* ------------------------------------------------------------------ *
 * 5 · Formatting. Numbers, printed the way the numeral role requires.
 *
 * ALL THREE REFUSE ANYTHING THAT IS NOT A MEASURED FINITE NUMBER, and that is a
 * repair rather than fussiness. They used to coerce: `usd(undefined)` printed
 * "—", `pct(null)` printed "0.0%", and `comma("x")` printed "NaN". Every one of
 * those is a formatter deciding, silently, what to say about a quantity nobody
 * measured — which is the same failure as a midpoint standing in for a central,
 * one layer further out.
 *
 * They are also the backstop under the removal of `layout` from a mark. A
 * caption reaching for a field that no longer exists now fails at the formatter,
 * loudly, instead of printing an em dash where a number used to be.
 * ------------------------------------------------------------------ */

function measured(value, fn) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(
      `svg-kit ${fn}() was given ${value === null ? 'null' : typeof value === 'number' ? String(value) : typeof value}, ` +
      `which is not a measured number. These formatters used to coerce, so a caption reaching for ` +
      `a value the record does not carry printed "—", "0.0%" or "NaN" instead of failing. Say the ` +
      `range, or say there is no value — do not hand a formatter a hole.`
    );
  }
  return value;
}

export function usd(millions, { compact = true } = {}) {
  const v = measured(millions, 'usd');
  if (!compact) return `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}m`;
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}bn`;
  return `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}m`;
}

export function pct(value, digits = 1) {
  return `${measured(value, 'pct').toFixed(digits)}%`;
}

/** 41021 -> "41,021". Numerals print in the numeral role, tabular. */
export function comma(n) {
  return measured(n, 'comma').toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/** [1867, 1867] -> "1867"; [2008, 2017] -> "2008–2017". An en dash, not a hyphen. */
export function yearsLabel([a, b]) {
  return a === b ? String(a) : `${a}–${b}`;
}

/**
 * Trim a compiler string to something that fits the label margin.
 *
 * It cuts at the first structural break the record's own string carries — a
 * comma, a semicolon or an opening bracket — and then, if that is still too
 * long, at a word boundary with an ellipsis. It never paraphrases and never
 * substitutes a name, because the compiler's name is a fact in the record.
 * The untrimmed string is always available through `titled()`.
 */
export function shortLabel(str, max = 30) {
  const head = String(str || '').split(/[,;(]/)[0].trim();
  if (head.length <= max) return head;
  const cut = head.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.5 ? cut.slice(0, space) : cut).trim()}…`;
}

/** Turn a record key into the words a reader sees. Never invents a category. */
export function humanise(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\btv\b/gi, 'TV')
    .replace(/^./, (c) => c.toUpperCase());
}

/* Re-exported so a chart never reaches past this file for a token. */
export {
  BONE, GRAPHITE, ZINC_RULE, ZINC_TEXT, BRASS, BRASS_TEXT, IRON, STIPPLE,
  INK, SURFACE, GRID, RULE_WIDTH, TYPE_ROLE,
  assertTextColor, assertObjectColor,
};
