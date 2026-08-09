/**
 * docs/p2-v2/charts/mini-series.js — THE "MINI-SERIES SLOPE" COMPOSITION.
 * P2 v2, new composition #2 (FIGURE-PLAN §F). Serves fig 5 (commission rate,
 * CYAN) and fig 6 (take-rate reversal, AMBER). No new low-level code: it is an
 * arrangement of svg-kit primitives + claim-marks minting.
 *
 * WHY THIS EXISTS (FIGURE-PLAN §F.2). The five/four values these figures plot
 * live INSIDE A SINGLE CLAIM'S STATEMENT/METHOD — they are not rows in
 * adspend.json, so no adspend-reading primitive (value-chart, bank, strip)
 * applies. This helper draws those verbatim values as a short slope and mints
 * the ONE governing claim through claim-marks so the drawing still carries:
 *   - the claim's GRADE, which drives the v2 jitter (still A / faint B / shimmer C);
 *   - the claim's VERDICT, refused if drawn invisibly (stampVerdict);
 *   - the G1 interval guard on the claim's own numbers.
 *
 * THE HONESTY RULE THIS HELPER ENCODES (FIGURE-PLAN §5 build-note). Only the
 * anchor year carries an 80% interval; the other points are stated values with
 * none. That is honest in P2 because JITTER IS TIED TO GRADE, NOT CI-WIDTH: every
 * point inherits the claim's single grade, so a grade-A series sits still and NO
 * per-point interval is invented. This helper therefore never fabricates a band
 * for a point that has no interval, and never mints the verbatim points as
 * separate claims (they are not claims). It mints the claim ONCE.
 *
 * COLOUR (CONVENTIONS.md → colour discipline). The slope hue is an OWNERSHIP hue
 * passed straight to the svg-kit MARK primitives (polyline/pointMark), which run
 * no colour guard — so fig 5 gets v2 cyan #3AA6BD and fig 6 gets v2 amber
 * #E0972A. Every SVG <text> here stays on a text-safe token (zinc-text / graphite
 * / iron); the ownership-COLOURED axis-basis label is HTML plate chrome
 * (.fig-axis-basis in figures.css), never SVG text — svg-kit's assertTextColor
 * would throw on #E0972A.
 *
 * JITTER (figures.css §8–9). The marks group carries `.fig-jit .jit-<grade>`;
 * the keyframes and the reduced-motion fallback live in figures.css. This module
 * only names the class — it owns no motion timing.
 */

import {
  svgRoot, layer, linear, polyline, pointMark, spanMark, band, rule, text,
  GRAPHITE, ZINC_RULE, ZINC_TEXT, IRON,
} from './svg-kit.js';
import { planClaimMark, markReading, anchorY, verdictStamps } from './claim-marks.js';

/** Grade → jitter amplitude in px (mirrors figures.css --jit-a/b/c; DESIGN.md §5.1). */
export const GRADE_JITTER = Object.freeze({ A: 0, B: 0.6, C: 1.4 });

const DEFAULTS = Object.freeze({
  width: 620,
  height: 300,
  pad: Object.freeze({ top: 34, right: 96, bottom: 46, left: 58 }),
  dotRadius: 3.2,
  lineWidth: 2,
});

function nice(min, max, pad = 0.08) {
  if (min === max) { const d = Math.abs(min) || 1; return [min - d * 0.5, max + d * 0.5]; }
  const span = max - min;
  return [min - span * pad, max + span * pad];
}

/**
 * Draw one mini-series slope.
 *
 * @param {HTMLElement} container  where the <svg> is appended (the .fig-body).
 * @param {object} spec
 *   @prop {object}  claim        the FROZEN claim record ({ id, central, ci80,
 *                                grade, verdict, statement, ... }) — inline it in
 *                                the figure from claims.json / claim.py.
 *   @prop {Array<{x:number,y:number,label?:string}>} points  the verbatim values
 *                                from the claim's statement, in reading order.
 *                                x is usually the year, y the plotted quantity.
 *   @prop {string}  hue          ownership hue for the slope (v2 --cyan / --amber
 *                                hex). Passed straight to the mark primitives.
 *   @prop {number}  [anchorX]    the x of the point the claim's central anchors
 *                                (its about_year). Gets the interval + full title.
 *   @prop {(v:number)=>string} [format]  y-value → label string (e.g. pct).
 *   @prop {string}  alt          REQUIRED plain-English sentence (svg-kit needs it).
 *   @prop {string}  [yBasisShort] short y tick unit, drawn as neutral SVG text.
 *   @prop {object}  [register]   verdictRegister(context) — REQUIRED iff the
 *                                claim's verdict is not "confirmed".
 *   @prop {boolean} [showAnchorInterval=false]  draw the anchor's 80% interval as
 *                                a faint band tick. Off by default: a grade-A
 *                                slope reads as settled, which is the argument.
 * @param {object} [options]  { width, height, pad, reducedHatch }
 * @returns {{ svg, mark, group, xScale, yScale, grade, verdictStamps }}
 */
export function renderMiniSeries(container, spec, options = {}) {
  const {
    claim, points, hue, anchorX = null, format = String,
    alt, yBasisShort = null, register = null, showAnchorInterval = false,
  } = spec || {};

  if (!claim || typeof claim !== 'object') {
    throw new Error('mini-series: spec.claim must be the frozen claim record (inline it in the figure).');
  }
  if (!Array.isArray(points) || points.length < 2) {
    throw new Error('mini-series: spec.points needs at least two { x, y } readings — a slope is two or more.');
  }
  if (typeof hue !== 'string' || !/^#/.test(hue)) {
    throw new Error('mini-series: spec.hue must be an ownership-hue hex (v2 --cyan / --amber). ' +
      'It is passed to the mark primitives, which run no colour guard, so the v2 hues are legal here.');
  }

  /* ---- 1 · MINT THE CLAIM ONCE. Runs G1 on the claim's OWN numbers, resolves
   *          the grade, and refuses to draw a non-clean verdict invisibly. The
   *          verbatim `points` are NOT minted — they are not claims. ---------- */
  const mark = planClaimMark(claim, {
    year: claim.about_year ?? anchorX ?? null,
    label: claim.id,
    register: register || undefined,
    format,
  });
  const grade = (mark.grade || 'C').toUpperCase();
  const jitterClass = `jit-${['A', 'B', 'C'].includes(grade) ? grade : 'C'}`;

  /* ---- 2 · SCALES. Position carries every magnitude (Cleveland–McGill); the
   *          ownership hue carries only ownership. -------------------------- */
  const W = options.width ?? DEFAULTS.width;
  const H = options.height ?? DEFAULTS.height;
  const pad = { ...DEFAULTS.pad, ...(options.pad || {}) };

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xDomain = [Math.min(...xs), Math.max(...xs)];
  const yDomain = nice(Math.min(...ys), Math.max(...ys));

  const xScale = linear(xDomain, [pad.left, W - pad.right]);
  const yScale = linear(yDomain, [H - pad.bottom, pad.top]);

  /* ---- 3 · THE DRAWING ------------------------------------------------------ */
  const svg = svgRoot(container, { width: W, height: H, alt, className: 'p2v2-mini-series' });

  // baseline + left axis (neutral zinc scaffolding)
  const axes = layer(svg);
  rule(axes, { x1: pad.left, y1: H - pad.bottom, x2: W - pad.right, y2: H - pad.bottom, color: ZINC_RULE });
  rule(axes, { x1: pad.left, y1: pad.top, x2: pad.left, y2: H - pad.bottom, color: ZINC_RULE });

  // y ticks — three: floor, mid, ceil of the data range (labels are text-safe)
  const yTickVals = [yDomain[0], (yDomain[0] + yDomain[1]) / 2, yDomain[1]];
  for (const v of yTickVals) {
    const y = yScale(v);
    rule(axes, { x1: pad.left - 4, y1: y, x2: pad.left, y2: y, color: ZINC_RULE });
    text(axes, { x: pad.left - 8, y: y + 3.5, value: format(v), role: 'chrome', fill: ZINC_TEXT, anchor: 'end' });
  }
  if (yBasisShort) {
    text(axes, { x: pad.left - 8, y: pad.top - 14, value: yBasisShort, role: 'label', fill: ZINC_TEXT, anchor: 'start' });
  }

  // x ticks — one per reading (years are few and named)
  for (const p of points) {
    const x = xScale(p.x);
    rule(axes, { x1: x, y1: H - pad.bottom, x2: x, y2: H - pad.bottom + 4, color: ZINC_RULE });
    text(axes, { x, y: H - pad.bottom + 18, value: String(p.x), role: 'chrome', fill: ZINC_TEXT, anchor: 'middle' });
  }

  // the ownership-hued slope + points, wrapped in the grade-jitter group
  const marksG = layer(svg, { class: `fig-jit ${jitterClass}` });
  marksG.dataset.grade = grade;
  if (options.reducedHatch) marksG.classList.add('fig-hatch');

  // optional: the anchor's 80% interval, drawn ONLY on the anchor (no fabricated
  // intervals on the stated points). anchorY keeps this a pixel, never a value.
  if (showAnchorInterval && anchorX != null && mark.kind === 'point') {
    const ax = xScale(anchorX);
    spanMark(marksG, { x: ax, yLow: yScale(mark.lo), yHigh: yScale(mark.hi), color: hue, width: 7,
      title: `80% interval ${format(mark.lo)}–${format(mark.hi)}` });
  }

  const pts = points.map((p) => [xScale(p.x), yScale(p.y)]);
  polyline(marksG, pts, { color: hue, width: options.lineWidth ?? DEFAULTS.lineWidth,
    title: `${claim.id}: the slope — ${markReading(mark, format)}` });

  for (const p of points) {
    const isAnchor = anchorX != null && p.x === anchorX;
    const dot = pointMark(marksG, {
      x: xScale(p.x), y: yScale(p.y), color: hue, r: (options.dotRadius ?? DEFAULTS.dotRadius) + (isAnchor ? 0.8 : 0),
      title: isAnchor ? markReading(mark, format) : `${p.x}: ${format(p.y)} (stated value, no interval)`,
    });
    if (isAnchor) dot.setAttribute('stroke', IRON), dot.setAttribute('stroke-width', '1');
    // value readout above each point (numeral role; text-safe graphite)
    text(marksG, { x: xScale(p.x), y: yScale(p.y) - 9, value: p.label ?? format(p.y),
      role: 'numeral', fill: GRAPHITE, anchor: 'middle', size: 12 });
  }

  return { svg, mark, group: marksG, xScale, yScale, grade, verdictStamps: verdictStamps(register) };
}
