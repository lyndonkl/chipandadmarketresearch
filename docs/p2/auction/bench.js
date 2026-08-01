/**
 * docs/p2/auction/bench.js — the apparatus.
 *
 * Team B4. One instrument, three fixed zones, ten deltas.
 *
 * ======================================================================
 * THE ZONES NEVER MOVE
 *
 *   LEFT     the inputs. The cast, and every knob the reader's hand can reach.
 *   CENTRE   the allocation. Which ad holds which slot, and what it pays.
 *   RIGHT    the money. A permanent readout, and THE BAND under it.
 *
 * A reader learns that frame in sc-01 and reads a change nine more times. The
 * centre zone has three forms and no fourth — `slots` for eight of the ten,
 * `bars` for sc-06 and `plates` for sc-10 — because a fourth form would be a
 * fourth thing to learn.
 *
 * ONE VERB. Every change the reader makes goes through CRANK: 320ms, with the
 * deliberate 40ms hold before the output moves. `motion.js` owns the timing and
 * the reduced-motion twin. Nothing here animates anything itself.
 *
 * WHAT THIS FILE DOES NOT DO. It draws what it is handed. Every figure arrives
 * already minted by `readouts.js`, so there is no number here to format wrong,
 * and the band arrives already minted by `band.js`, so there is no scalar
 * revenue to print without its mode. That is the same move the chart layer made
 * with span-only marks, one layer up.
 * ======================================================================
 */

import { el, text, frame, rule, svgRoot, titled, layer, absenceBlock } from '../charts/svg-kit.js';
import {
  BRASS, BRASS_TEXT, CYAN_TEXT, IRON, RUST, ZINC_RULE, ZINC_TEXT,
  GRAPHITE, SURFACE, RULE_WIDTH, assertObjectColor,
} from '../lib/tokens.js';
import { crank } from '../lib/motion.js';
import {
  readingText, readingQualifiers, readingSentence, money, moneyAsMeasured, percent,
} from './readouts.js';
import { assertBand, bandSentence, modeWords } from './band.js';
import { mintPanel, scopeSentence, lintRenderedStrings } from './panels.js';
import { SCENARIOS, scenarioByIndex, defaultState } from './scenarios.js';

/* ------------------------------------------------------------------ *
 * small DOM helpers
 * ------------------------------------------------------------------ */

/**
 * THE COLOUR GUARD, ON WHAT THIS FILE ACTUALLY PAINTS.
 *
 * `svg-kit`'s own helpers run `assertTextColor` and `assertObjectColor` before
 * they draw. This file reaches past them to `el('rect', { fill: … })` in six
 * places, and those six were the only marks on the bench no guard had ever
 * seen. Every non-text colour goes through here now.
 */
function ink(hex, where) {
  assertObjectColor(hex, `auction bench ${where}`);
  return hex;
}

function tag(name, className, parent, textContent) {
  const node = document.createElement(name);
  if (className) node.className = className;
  if (textContent != null) node.textContent = textContent;
  if (parent) parent.appendChild(node);
  return node;
}

const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); };

/* ------------------------------------------------------------------ *
 * 1 · THE CENTRE ZONE. Three forms, and no fourth.
 * ------------------------------------------------------------------ */

const CENTRE_W = 420;

function drawSlots(host, centre, alt) {
  const rows = centre.slots;
  const queue = centre.queue;
  const height = 34 + rows.length * 62 + 26 + queue.length * 22 + 18;
  const svg = svgRoot(host, { width: CENTRE_W, height, alt });

  text(svg, { x: 8, y: 12, value: 'The slots', role: 'label', fill: ZINC_TEXT });
  const unit = centre.unit || 'clicks';

  let y = 24;
  for (const row of rows) {
    const g = layer(svg, { class: 'ab-slot' });
    titled(g, `Slot ${row.slot}: ${row.name} pays ${money(row.price)} a click and gets ` +
      `${row.clicks.toLocaleString('en-US')} ${unit}.`);
    frame(g, { x: 8, y, width: CENTRE_W - 16, height: 52, fill: SURFACE.paper });
    text(g, { x: 18, y: y + 17, value: `Slot ${row.slot}`, role: 'label', fill: ZINC_TEXT, size: 10 });
    text(g, { x: 18, y: y + 36, value: row.name, role: 'prose', fill: GRAPHITE, size: 15 });

    /* the price plate, on the right. Money is brass and always a filled mark. */
    el('rect', {
      x: CENTRE_W - 126, y: y + 8, width: 110, height: 36,
      fill: 'none', stroke: ink(IRON, 'price plate'), 'stroke-width': RULE_WIDTH.mechanism,
    }, g);
    text(g, {
      x: CENTRE_W - 71, y: y + 25, value: money(row.price), role: 'numeral',
      fill: BRASS_TEXT, anchor: 'middle', size: 15,
    });
    text(g, {
      x: CENTRE_W - 71, y: y + 38, value: 'a click', role: 'chrome',
      fill: ZINC_TEXT, anchor: 'middle', size: 9,
    });

    /* the count is cyan, and it is an open mark beside an iron rule. */
    text(g, {
      x: CENTRE_W - 140, y: y + 25, value: row.clicks.toLocaleString('en-US'),
      role: 'numeral', fill: CYAN_TEXT, anchor: 'end', size: 13,
    });
    text(g, {
      x: CENTRE_W - 140, y: y + 38, value: unit, role: 'chrome',
      fill: ZINC_TEXT, anchor: 'end', size: 9,
    });

    if (centre.showDiscount && row.discount > 0) {
      text(g, {
        x: 18, y: y + 48, value: `keeps ${money(row.discount)} of its ${money(row.bid)} bid`,
        role: 'chrome', fill: ZINC_TEXT, size: 10,
      });
    } else if (row.setBy) {
      text(g, {
        x: 18, y: y + 48, value: `price set by ${row.setBy}`,
        role: 'chrome', fill: ZINC_TEXT, size: 10,
      });
    } else if (centre.noRunnerUp) {
      text(g, {
        x: 18, y: y + 48, value: 'no runner-up — the seller\'s floor is the price',
        role: 'chrome', fill: RUST, size: 10,
      });
    }
    y += 62;
  }

  /* the ranked queue: one bar per candidate, longest first. */
  rule(svg, { x1: 8, y1: y - 4, x2: CENTRE_W - 8, y2: y - 4, color: ZINC_RULE });
  text(svg, { x: 8, y: y + 12, value: 'The ranking', role: 'label', fill: ZINC_TEXT });
  y += 20;
  const top = Math.max(...queue.map((q) => q.score), 1e-9);
  for (const q of queue) {
    const width = Math.max(2, (q.score / top) * 108);
    const g = layer(svg, {});
    titled(g, `${q.name} scores ${q.score.toFixed(4)}${q.placed ? `, and holds slot ${q.slot}` : ', and gets no slot'}.`);
    text(g, { x: 8, y: y + 9, value: q.name, role: 'chrome', fill: ZINC_TEXT, size: 11 });
    el('rect', {
      x: 150, y: y, width, height: 11,
      fill: q.placed ? ink(BRASS, 'ranked queue bar') : 'none',
      stroke: ink(IRON, 'ranked queue edge'), 'stroke-width': 1,
    }, g);
    text(g, {
      x: 336, y: y + 9, anchor: 'end', value: q.score.toFixed(4), role: 'numeral',
      fill: ZINC_TEXT, size: 11,
    });
    text(g, {
      x: CENTRE_W - 8, y: y + 9, anchor: 'end', role: 'chrome', size: 10, fill: ZINC_TEXT,
      value: q.placed ? `slot ${q.slot}` : 'no slot',
    });
    y += 22;
  }
  return svg;
}

function drawBars(host, centre, alt) {
  const height = 34 + centre.bars.length * 54 + 24;
  const svg = svgRoot(host, { width: CENTRE_W, height, alt });
  text(svg, { x: 8, y: 12, value: 'What the seller collects', role: 'label', fill: ZINC_TEXT });
  const top = Math.max(...centre.bars.map((b) => b.usd), 1e-9);
  let y = 26;
  for (const bar of centre.bars) {
    const width = Math.max(2, (bar.usd / top) * 250);
    const g = layer(svg, {});
    titled(g, `${bar.label}: ${money(bar.usd)}.`);
    text(g, { x: 8, y: y + 12, value: bar.label, role: 'chrome', fill: ZINC_TEXT, size: 11 });
    el('rect', {
      x: 8, y: y + 20, width, height: 18,
      fill: ink(BRASS, 'revenue bar'), stroke: ink(IRON, 'revenue bar edge'), 'stroke-width': 1,
    }, g);
    text(g, {
      x: 16 + width, y: y + 34, value: money(bar.usd), role: 'numeral', fill: BRASS_TEXT, size: 14,
    });
    y += 54;
  }
  if (centre.equal) {
    rule(svg, { x1: 8 + 250, y1: 26, x2: 8 + 250, y2: y - 16, dashed: true, color: ink(IRON, 'level rule') });
    text(svg, {
      x: 8 + 246, y: y + 2, anchor: 'end', value: 'level, and level for every bidder count',
      role: 'chrome', fill: ZINC_TEXT, size: 10,
    });
  }
  return svg;
}

/**
 * Break a sentence into lines that fit a drawn width.
 *
 * SVG text does not wrap, and the plates carry whole sentences. Measuring by
 * character count against a monospace face is exact enough here and needs no
 * layout pass: both mono faces advance at about 0.6 of the font size.
 */
function wrapLines(value, { size, width }) {
  const perLine = Math.max(8, Math.floor(width / (size * 0.6)));
  const words = String(value).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > perLine && line) { lines.push(line); line = word; } else { line = next; }
  }
  if (line) lines.push(line);
  return lines;
}

function drawPlates(host, centre, alt) {
  const shown = centre.plates.filter((p) => centre.focus === 'both' || centre.focus === p.channel);
  const textWidth = CENTRE_W - 110;
  const blocks = shown.map((plate) => {
    const motive = wrapLines(`stated reason: ${plate.motive}`, { size: 10, width: textWidth });
    const effect = wrapLines(plate.effect, { size: 10, width: textWidth });
    const what = wrapLines(plate.what, { size: 14, width: textWidth });
    return { plate, motive, effect, what, height: 34 + what.length * 18 + (motive.length + effect.length) * 14 };
  });
  const height = 30 + blocks.reduce((sum, b) => sum + b.height + 12, 0);
  const svg = svgRoot(host, { width: CENTRE_W, height, alt });
  text(svg, { x: 8, y: 12, value: '2019, both sides', role: 'label', fill: ZINC_TEXT });

  let y = 24;
  for (const block of blocks) {
    const { plate } = block;
    const g = layer(svg, {});
    titled(g, `${plate.channel}: ${plate.what}. ${plate.effect}.`);
    frame(g, { x: 8, y, width: CENTRE_W - 16, height: block.height, fill: SURFACE.paper });
    text(g, {
      x: 18, y: y + 18, value: plate.channel === 'display' ? 'Display' : 'Search',
      role: 'label', fill: ZINC_TEXT,
    });
    let ty = y + 36;
    for (const line of block.what) {
      text(g, { x: 18, y: ty, value: line, role: 'prose', fill: GRAPHITE, size: 14 });
      ty += 18;
    }
    ty += 2;
    for (const line of [...block.motive, ...block.effect]) {
      text(g, { x: 18, y: ty, value: line, role: 'chrome', fill: ZINC_TEXT, size: 10 });
      ty += 14;
    }

    /* The direction sits in its own reserved column on the right, so it never
     * lands on top of a sentence however long the sentence gets: level for a
     * change that moved nothing, up for one that did. */
    const ax = CENTRE_W - 46;
    const ay = y + 44;
    if (plate.direction === 'up') {
      el('path', {
        d: `M${ax} ${ay + 18} L${ax} ${ay - 14} M${ax - 8} ${ay - 6} L${ax} ${ay - 16} L${ax + 8} ${ay - 6}`,
        fill: 'none', stroke: ink(BRASS, 'direction arrow'), 'stroke-width': 2,
      }, g);
      text(g, { x: ax, y: ay + 34, anchor: 'middle', value: percent(plate.change, 2), role: 'numeral', fill: BRASS_TEXT, size: 12 });
    } else {
      el('path', {
        d: `M${ax - 15} ${ay} L${ax + 15} ${ay}`,
        fill: 'none', stroke: ink(IRON, 'level bar'), 'stroke-width': 2,
      }, g);
      text(g, { x: ax, y: ay + 20, anchor: 'middle', value: 'level', role: 'chrome', fill: ZINC_TEXT, size: 11 });
    }
    y += block.height + 12;
  }
  return svg;
}

function drawCentre(host, centre, alt) {
  clear(host);
  if (centre.kind === 'slots') return drawSlots(host, centre, alt);
  if (centre.kind === 'bars') return drawBars(host, centre, alt);
  if (centre.kind === 'plates') return drawPlates(host, centre, alt);
  throw new Error(`bench: "${centre.kind}" is not one of the three centre forms.`);
}

/* ------------------------------------------------------------------ *
 * 2 · THE BAND, DRAWN
 * ------------------------------------------------------------------ */

const BAND_W = 268;
const BAND_H = 84;
/** An excursion needs a second line under the marker to name which side it left. */
const BAND_H_OUTSIDE = 98;

/**
 * The band track.
 *
 * A drawn track from the lowest envy-free equilibrium to naive truthful play,
 * with a marker on it. The revenue figure stops being a number and becomes a
 * position. Where the record cannot place the band, the track is drawn as a
 * framed, stippled block with its reason printed — never as blank space.
 *
 * ======================================================================
 * THE MARKER IS NEVER MOVED TO FIT.
 *
 * This function used to clamp the marker's x into the track:
 *
 *     const mx = Math.min(Math.max(at(band.marker.usd), x0), x1);
 *
 * That was the third of three clamps on the same number, and it is the one that
 * would have hidden the other two even after they were deleted. A marker
 * outside the band is drawn outside the band. `mintBand` will not mint one
 * without a written reason, and the reason is printed beside it.
 * ======================================================================
 */
export function drawBand(host, band) {
  assertBand(band, 'drawBand');
  clear(host);
  /* ONE FORMATTER FOR THE WHOLE BAND. The accessible name and the drawn labels
   * are built from the same function, so a sighted reader and a screen-reader
   * reader cannot be handed two different numbers. See `moneyAsMeasured`. */
  const alt = bandSentence(band, moneyAsMeasured);
  const outside = Boolean(band.located && !band.inside);
  const height = outside ? BAND_H_OUTSIDE : BAND_H;
  const svg = svgRoot(host, { width: BAND_W, height, alt });
  text(svg, { x: 0, y: 11, value: 'The band', role: 'label', fill: ZINC_TEXT });

  const x0 = 8;
  const x1 = BAND_W - 8;
  const trackY = 40;

  if (!band.located) {
    /* DOCUMENTED ABSENCE, from the chart layer's own primitive. It carries the
     * project's 5px two-dot stipple, its dashed Iron frame and its colour
     * guard. The hand-rolled 4px one-dot pattern that used to be here matched
     * nothing else on the site and no guard ever saw it. */
    absenceBlock(svg, svg, {
      x: x0, y: trackY - 12, width: x1 - x0, height: 24,
      extent: 'this band',
      label: 'not placed',
      note: band.reason,
    });
    text(svg, {
      x: x0, y: trackY + 30, value: 'the record cannot place this band',
      role: 'chrome', fill: ZINC_TEXT, size: 10,
    });
    return svg;
  }

  /* THE DRAWN DOMAIN. Normally the band itself. Where the marker is outside it,
   * the domain opens far enough to hold the marker, with the track still drawn
   * over the band alone — so the gap between the two reads as a gap. */
  const lo = Math.min(band.floor.usd, band.marker.usd);
  const hi = Math.max(band.ceiling.usd, band.marker.usd);
  const pad = outside ? (hi - lo) * 0.08 : 0;
  const domainLo = lo - pad;
  const domainHi = hi + pad;
  const at = (usd) => x0 + ((usd - domainLo) / (domainHi - domainLo)) * (x1 - x0);
  const bandLeft = at(band.floor.usd);
  const bandRight = at(band.ceiling.usd);

  /* the track itself is mechanism, so it is iron. */
  el('rect', {
    x: bandLeft, y: trackY - 9, width: bandRight - bandLeft, height: 18,
    fill: 'none', stroke: ink(IRON, 'band track'), 'stroke-width': RULE_WIDTH.mechanism,
  }, svg);
  rule(svg, { x1: bandLeft, y1: trackY, x2: bandRight, y2: trackY, color: ZINC_RULE });

  /* every named stop gets a tick, so the reader can see the marker is one of
   * several places the same rule can land. */
  for (const stop of band.stops) {
    const sx = at(stop.usd);
    rule(svg, { x1: sx, y1: trackY - 9, x2: sx, y2: trackY + 9, color: ZINC_RULE });
    text(svg, { x: sx, y: trackY + 22, anchor: 'middle', value: moneyAsMeasured(stop.usd), role: 'chrome', fill: ZINC_TEXT, size: 9 });
  }

  const mx = at(band.marker.usd);

  /* AN EXCURSION IS DRAWN AS ONE. A rust rule runs from the end the marker left
   * to the marker, so where the excursion is large the distance outside the band
   * is a length on the page rather than only a sentence.
   *
   * IT IS NOT A LENGTH A READER CAN ALWAYS SEE, and saying so was a claim this
   * drawing does not deliver. The scale is honest — the domain opens to hold the
   * marker and nothing is exaggerated to make a small gap visible — and honest
   * scaling means a small excursion draws small. sc-04's largest, Vale at its
   * bottom stop, is 43 units of the track's 252. sc-04's smallest is the one-cent
   * discounter putting the seller $1.80 over a $760 ceiling, and that draws as
   * 1.2 units: about a pixel, under the marker itself. At that size the rule is
   * not what tells the reader; the sentence under the track is, and the marker's
   * own value beside it. The drawn rule is a second reading of the same fact for
   * the excursions large enough to have one, and never the only one. */
  if (outside) {
    const from = band.outsideBelow ? bandLeft : bandRight;
    rule(svg, {
      x1: from, y1: trackY, x2: mx, y2: trackY,
      dashed: true, color: ink(RUST, 'excursion rule'), width: RULE_WIDTH.mechanism,
    });
    text(svg, {
      x: mx, y: trackY + 34, anchor: band.outsideBelow ? 'start' : 'end',
      value: band.outsideBelow ? 'below the band' : 'above the band',
      role: 'chrome', fill: RUST, size: 10,
    });
    text(svg, {
      x: mx, y: trackY + 46, anchor: band.outsideBelow ? 'start' : 'end',
      value: moneyAsMeasured(band.marker.usd), role: 'numeral', fill: BRASS_TEXT, size: 11,
    });
  }

  /* the marker. Money is the only filled round mark in this palette, so the
   * marker is a filled brass lozenge with an iron edge. */
  const marker = layer(svg, { class: 'ab-band-marker' });
  titled(marker, readingSentence(band.marker));
  el('path', {
    d: `M${mx} ${trackY - 15} L${mx + 7} ${trackY} L${mx} ${trackY + 15} L${mx - 7} ${trackY} Z`,
    fill: ink(BRASS, 'band marker'), stroke: ink(IRON, 'band marker edge'), 'stroke-width': 1.2,
  }, marker);

  text(svg, { x: bandLeft, y: trackY - 16, value: moneyAsMeasured(band.floor.usd), role: 'numeral', fill: ZINC_TEXT, size: 11 });
  text(svg, { x: bandRight, y: trackY - 16, anchor: 'end', value: moneyAsMeasured(band.ceiling.usd), role: 'numeral', fill: ZINC_TEXT, size: 11 });
  text(svg, {
    x: x0, y: height - 4, role: 'chrome', fill: ZINC_TEXT, size: 9,
    value: `${band.ratio.toFixed(3)} times wide`,
  });
  /* The two ends are NAMED in HTML rather than in the drawing. Both names are
   * long sentences about how the bidders play, and side by side in a 268-unit
   * SVG they collide — which is how a track that says one thing ends up
   * illegible. Text that has to wrap belongs in text. */
  return svg;
}

/** The two ends of the band, named. Wraps, and a screen reader reads it. */
export function bandEnds(host, band) {
  assertBand(band, 'bandEnds');
  if (!band.located) return null;
  const list = tag('dl', 'ab-band-ends', host);
  for (const end of [band.floor, band.ceiling]) {
    tag('dt', 'p2-num', list, moneyAsMeasured(end.usd));
    tag('dd', 'p2-chrome', list, modeWords(end));
  }
  return list;
}

/* ------------------------------------------------------------------ *
 * 3 · THE CONTROLS
 *
 * THE CONTROLS ARE MOUNTED ONCE AND UPDATED IN PLACE.
 *
 * `paint()` used to rebuild every control on every change, and a range input
 * fires `input` continuously while a finger or a mouse is still on it. So the
 * first `input` event of a drag removed the very element being dragged from the
 * document and put a fresh one in its place. The pointer capture went with it:
 * the knob stopped following the hand after one pixel of travel, and CRANK
 * flashed an element that was no longer on the page. sc-04's bid slider,
 * sc-06's shading slider, sc-07's click-rate slider and sc-09's gamma slider
 * were all unusable by drag.
 *
 * A control is torn down only when the set of controls itself changes — a
 * different scenario, or a scenario whose controls differ in id or kind.
 * Everything else is an attribute write on the element already there, and the
 * element under the reader's finger is never written to.
 * ------------------------------------------------------------------ */

function controlShape(controls) {
  return controls.map((c) => `${c.id}:${c.kind}`).join('|');
}

function buildControl(host, control, state, onChange) {
  const wrap = tag('div', 'ab-ctl', host);
  const id = `ab-${control.id}-${Math.random().toString(36).slice(2, 7)}`;
  const mounted = { control, wrap, kind: control.kind };

  if (control.kind === 'rocker') {
    tag('div', 'p2-arch', wrap, control.label);
    const rocker = tag('div', 'p2-rocker', wrap);
    rocker.setAttribute('role', 'group');
    rocker.setAttribute('aria-label', control.label);
    mounted.buttons = control.options.map((option) => {
      const button = tag('button', null, rocker, option.label);
      button.type = 'button';
      button.value = String(option.value);
      button.setAttribute('aria-pressed', String(String(state[control.id]) === String(option.value)));
      /* The value is read off the button at click time, not closed over. A
       * synced rocker can carry different option values than the one that was
       * mounted, and a handler holding the old ones sends a stale reading. */
      button.addEventListener('click', () => onChange(mounted.control, button.value, button));
      return button;
    });
  } else {
    const label = tag('label', 'p2-arch', wrap, control.label);
    label.setAttribute('for', id);
    const row = tag('div', 'ab-ctl-row', wrap);
    const input = tag('input', 'ab-range', row);
    input.type = 'range';
    input.id = id;
    input.min = String(control.min);
    input.max = String(control.max);
    input.step = String(control.step);
    input.value = String(liveValue(control, state));
    input.setAttribute('aria-label', control.label);
    const out = tag('output', 'p2-num ab-ctl-value', row, formatControlValue(control, Number(input.value)));
    mounted.input = input;
    mounted.output = out;
    input.addEventListener('input', () => {
      out.textContent = formatControlValue(mounted.control, Number(input.value));
      onChange(mounted.control, Number(input.value), input);
    });
  }
  mounted.note = control.note ? tag('p', 'p2-chrome ab-ctl-note', wrap, control.note) : null;
  return mounted;
}

function liveValue(control, state) {
  return state[control.id] == null
    ? (control.atNull != null ? control.atNull : control.max)
    : Number(state[control.id]);
}

/**
 * Bring a mounted control up to date without replacing it.
 *
 * `holding` is the element the reader currently has hold of. Its value is left
 * alone: the browser already knows where the knob is, and writing to it
 * mid-drag makes it stutter or jump back.
 */
function syncControl(mounted, control, state, holding) {
  mounted.control = control;
  if (mounted.note && mounted.note.textContent !== control.note) {
    mounted.note.textContent = control.note || '';
  }
  if (mounted.kind === 'rocker') {
    control.options.forEach((option, i) => {
      const button = mounted.buttons[i];
      if (!button) return;
      if (button.textContent !== option.label) button.textContent = option.label;
      button.value = String(option.value);
      button.setAttribute('aria-pressed', String(String(state[control.id]) === String(option.value)));
    });
    return;
  }
  const input = mounted.input;
  if (input.min !== String(control.min)) input.min = String(control.min);
  if (input.max !== String(control.max)) input.max = String(control.max);
  if (input.step !== String(control.step)) input.step = String(control.step);
  const live = liveValue(control, state);
  if (input !== holding && Number(input.value) !== live) input.value = String(live);
  mounted.output.textContent = formatControlValue(control, Number(input.value));
}

function formatControlValue(control, value) {
  if (control.unit === '$') return money(value);
  if (control.max <= 1 && control.min >= 0 && control.step < 0.01) return value.toFixed(4);
  return String(value);
}

/* ------------------------------------------------------------------ *
 * 4 · THE WHOLE BENCH
 * ------------------------------------------------------------------ */

/**
 * Render the bench into `root`.
 *
 * Returns a controller: `show(n)` moves to a scenario, `view` is the current
 * view model, and `sentences()` reads every reader-facing string off the
 * rendered DOM — which is what the readability measurement and team B8 read.
 */
export function renderBench(root, options = {}) {
  const state = { scenarioNumber: options.scenario || 1, channel: options.channel || null, controls: {} };
  const shell = tag('section', 'ab', root);
  const head = tag('header', 'ab-head', shell);
  const eyebrow = tag('div', 'p2-arch ab-eyebrow', head);
  const teach = tag('h3', 'ab-teach', head);
  const scopeLine = tag('p', 'p2-chrome ab-scope', head);

  const frameEl = tag('div', 'ab-frame', shell);
  const inputsZone = tag('div', 'ab-zone ab-zone--inputs', frameEl);
  const allocZone = tag('div', 'ab-zone ab-zone--alloc', frameEl);
  const readoutZone = tag('div', 'ab-zone ab-zone--readout', frameEl);

  /* The cast table is redrawn on every change. The controls are NOT: they are
   * mounted once and updated in place, so the range input a reader is dragging
   * is never removed from the document mid-gesture. */
  tag('div', 'p2-arch ab-zone-label', inputsZone, 'Inputs');
  const castHost = tag('div', 'ab-cast-host', inputsZone);
  const controlsHost = tag('div', 'ab-controls', inputsZone);

  const note = tag('p', 'p2-prose ab-note', shell);
  const live = tag('p', 'p2-visually-hidden', shell);
  live.setAttribute('aria-live', 'polite');
  const captions = tag('div', 'ab-captions', shell);
  const ledger = tag('details', 'ab-ledger', shell);

  let current = null;
  let sentences = [];
  let advisory = null;
  let mountedControls = [];
  let mountedShape = null;

  /**
   * Put the controls in step with the state, mounting them only if the set of
   * controls has actually changed shape.
   */
  function syncControls(controls, controlState, holding) {
    const shape = controlShape(controls);
    if (shape !== mountedShape) {
      clear(controlsHost);
      mountedControls = controls.map((c) => buildControl(controlsHost, c, controlState, onControl));
      mountedShape = shape;
      return;
    }
    controls.forEach((control, i) => syncControl(mountedControls[i], control, controlState, holding));
  }

  function paint(cause) {
    const scenario = scenarioByIndex(state.scenarioNumber);
    const panel = mintPanel(scenario.id, { channel: state.channel });
    const ctx = {
      settings: panel.settings, mechanism: panel.record && options.mechanism,
      params: options.params, record: panel.record, panel,
    };
    ctx.mechanism = options.mechanism;
    if (!state.controls[scenario.id]) state.controls[scenario.id] = defaultState(scenario, ctx);
    const view = scenario.build(state.controls[scenario.id], ctx);
    current = { scenario, panel, view, ctx };
    sentences = [];

    /* --- head --- */
    eyebrow.textContent =
      `Scenario ${scenario.n} of ${SCENARIOS.length} · ${panel.channel} · ${scenario.short}`;
    teach.textContent = scenario.teaches;
    scopeLine.textContent = scopeSentence(panel);
    sentences.push(scenario.teaches, scopeLine.textContent);

    /* --- inputs, left --- */
    clear(castHost);
    /* The columns follow what the cast actually carries. Where every ad is
     * clicked equally the click column would be three dashes, and a column of
     * dashes teaches a reader that something is missing when nothing is. */
    const castRows = view.inputs.rows;
    const columns = [{ head: 'Advertiser', get: (r) => r.name, n: false }];
    if (castRows.some((r) => r.value != null)) {
      columns.push({ head: 'Worth', get: (r) => (r.value != null ? money(r.value) : '—'), n: true });
    }
    if (castRows.some((r) => r.bid != null)) {
      columns.push({ head: 'Bids', get: (r) => (r.bid != null ? money(r.bid) : '—'), n: true });
    }
    if (castRows.some((r) => r.quality != null && r.quality !== 1)) {
      columns.push({
        head: 'Clicked',
        get: (r) => {
          if (r.quality == null) return '—';
          if (r.trueCtr != null && r.trueCtr !== r.quality) {
            return `${percent(r.quality, 1)} said, ${percent(r.trueCtr, 1)} true`;
          }
          return percent(r.quality, 1);
        },
        n: true,
      });
    }
    if (castRows.some((r) => r.note)) {
      columns.push({ head: 'Note', get: (r) => r.note || '', n: false });
    }
    const castTable = tag('table', 'ab-cast', castHost);
    const hrow = tag('tr', null, tag('thead', null, castTable));
    for (const column of columns) tag('th', column.n ? 'n' : null, hrow, column.head);
    const tbody = tag('tbody', null, castTable);
    for (const row of castRows) {
      const tr = tag('tr', row.mismatch ? 'ab-mismatch' : null, tbody);
      for (const column of columns) tag('td', column.n ? 'n' : null, tr, column.get(row));
    }
    const controls = scenario.controls(ctx, state.controls[scenario.id]);
    syncControls(controls, state.controls[scenario.id], cause);
    for (const control of controls) if (control.note) sentences.push(control.note);

    /* --- allocation, centre --- */
    clear(allocZone);
    tag('div', 'p2-arch ab-zone-label', allocZone, 'The allocation');
    const centreHost = tag('div', 'ab-centre', allocZone);
    const alt = centreAlt(scenario, view);
    drawCentre(centreHost, view.centre, alt);
    sentences.push(alt);
    if (view.worked) {
      const worked = tag('ol', 'ab-worked p2-chrome', allocZone);
      for (const line of view.worked) { tag('li', null, worked, line); sentences.push(line); }
    }

    /* --- money, right. Permanent. --- */
    clear(readoutZone);
    tag('div', 'p2-arch ab-zone-label', readoutZone, 'The money');
    const till = tag('dl', 'ab-till', readoutZone);
    for (const figure of view.readout) {
      tag('dt', 'p2-arch', till, figure.label);
      const dd = tag('dd', 'p2-num', till, readingText(figure));
      dd.style.color = figure.ink;
      const quals = readingQualifiers(figure);
      if (quals.length) tag('div', 'p2-chrome ab-qual', till, quals.join(' · '));
      sentences.push(readingSentence(figure));
    }
    const bandHost = tag('div', 'ab-band', readoutZone);
    drawBand(bandHost, view.band);
    bandEnds(bandHost, view.band);
    sentences.push(bandSentence(view.band, moneyAsMeasured));
    if (!view.band.located) {
      tag('p', 'p2-chrome ab-band-note', readoutZone, view.band.reason);
      sentences.push(view.band.reason);
    } else {
      /* AN EXCURSION IS PRINTED, not tucked into a tooltip. It is the one
       * sentence on the panel that says the mechanism went somewhere the
       * record's own band does not reach. */
      if (view.band.excursion) {
        tag('p', 'p2-chrome ab-band-note ab-band-outside', readoutZone, view.band.excursion);
        sentences.push(view.band.excursion);
      }
      if (view.band.note) {
        tag('p', 'p2-chrome ab-band-note', readoutZone, view.band.note);
        sentences.push(view.band.note);
      }
    }

    /* --- the note under the instrument --- */
    note.textContent = view.note;
    sentences.push(view.note);
    live.textContent = `${scenario.short}. ${view.readout.map((f) => readingSentence(f)).join(' ')}`;

    /* --- the captions the record requires, and the true sentence --- */
    clear(captions);
    for (const caption of panel.captions) {
      tag('p', 'p2-chrome ab-caption', captions, caption);
      sentences.push(caption);
    }

    /* --- the ledger: every figure, its arithmetic, and where it comes from --- */
    clear(ledger);
    tag('summary', 'p2-arch', ledger, 'The arithmetic, line by line');
    const table = tag('table', 'ab-ledger-table', ledger);
    const lhead = tag('tr', null, tag('thead', null, table));
    tag('th', null, lhead, 'What it is');
    tag('th', 'n', lhead, 'Value');
    tag('th', null, lhead, 'How it is worked out');
    const lbody = tag('tbody', null, table);
    for (const figure of view.figures) {
      const tr = tag('tr', null, lbody);
      tag('td', null, tr, figure.label);
      tag('td', 'n', tr, formatLedger(figure.value));
      tag('td', 'ab-expr', tr, figure.step);
    }
    for (const row of view.derived || []) {
      const tr = tag('tr', 'ab-derived', lbody);
      tag('td', null, tr, `${row.label} (worked out here)`);
      tag('td', 'n', tr, formatLedger(row.value));
      tag('td', null, tr, row.formula);
      sentences.push(row.formula);
    }

    /* --- THE PROSE LINT, OVER THE PAGE THAT WAS JUST BUILT ---
     *
     * G7's own lint runs inside `mintPanel` and sees the panel object: its id,
     * channel, mechanism, title, headline and captions. Every sentence above
     * this line was written by a human and built after that — the teaching
     * line, the control notes, the centre drawing's accessible name, the plate
     * sentences, the band's note and excursion, every figure label, every
     * `derivedFrom`. On sc-10's search panel that is thirteen surfaces, and each
     * one was verified by injection: write "in 2019 search moved to first price"
     * into any of them and the arithmetic gate stayed green, G7 kept passing and
     * the panel's advisory returned zero, because the string was never read.
     *
     * The lint reads the rendered DOM now, so what it is aimed at is not a list
     * anybody has to maintain. It is still ADVICE and it still never throws —
     * see `lintRenderedStrings` and `guards.DEAD_MECHANISM_LINT_LIMITS`. The
     * demo page and the test page both print what it found. */
    advisory = lintRenderedStrings(domSentences(shell), `${scenario.id} · ${panel.channel}`);

    if (cause && cause.isConnected !== false) {
      /* CRANK. The machine takes the input, holds 40ms, then the output moves.
       * `cause` stays in the document across a paint now, so the flash lands on
       * the control the reader is actually holding. */
      crank({ input: cause, output: readoutZone });
    }
    return view;
  }

  function onControl(control, value, inputEl) {
    const scenario = scenarioByIndex(state.scenarioNumber);
    state.controls[scenario.id] = { ...state.controls[scenario.id], [control.id]: value };
    for (const resetId of control.resets || []) state.controls[scenario.id][resetId] = null;
    paint(inputEl);
  }

  function show(n, channel) {
    state.scenarioNumber = n;
    state.channel = channel || null;
    mountedShape = null; /* a new scenario is a new set of controls */
    return paint(null);
  }

  paint(null);

  return {
    show,
    /** Move one control, the way a reader's hand would. Used by the sentence sweep. */
    setControl(id, value) {
      const scenario = scenarioByIndex(state.scenarioNumber);
      state.controls[scenario.id] = { ...state.controls[scenario.id], [id]: value };
      return paint(null);
    },
    get view() { return current && current.view; },
    get panel() { return current && current.panel; },
    /**
     * WHAT THE PROSE LINT SAW ON THE PAGE AS DRAWN.
     *
     * `panel.advisory` is G7's own, over the six fields `mintPanel` built. This
     * one is over every string the reader can meet. Both are ADVICE. Read the
     * findings; never read an empty result as a clearance.
     */
    get advisory() { return advisory; },
    /**
     * EVERY READER-FACING STRING NOW ON SCREEN, read off the rendered DOM.
     *
     * This used to return a hand-kept list that `paint()` pushed to as it went.
     * It reached 99 strings while the rendered panel held 569, and the README
     * named it as what the readability measurement and team B8 read. A
     * hand-kept list of "everything" is a list of what somebody remembered, and
     * the whole lesson of this project is that a protection which depends on
     * remembering is not a protection.
     *
     * So it reads the page. Every text-bearing leaf, every SVG `<title>`, every
     * `aria-label` on a drawing — in document order, de-duplicated.
     */
    sentences: () => domSentences(shell),
    /** What `paint()` pushed as it drew. A subset, and it says so. */
    narratedSentences: () => sentences.slice(),
    element: shell,
  };
}

/**
 * Every string a rendered bench puts in front of a reader.
 *
 * Leaves only, so a container's concatenated text never lands beside the parts
 * it is made of. `<title>` and `aria-label` are included because they are the
 * accessible names of the drawings and a screen reader says them out loud.
 */
export function domSentences(root) {
  const out = [];
  const seen = new Set();
  const push = (value) => {
    const s = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    if (!s || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };
  const walk = (node) => {
    if (!node) return;
    if (node.nodeType === 3) { push(node.nodeValue); return; }
    if (node.nodeType !== 1) return;
    const name = (node.tagName || '').toLowerCase();
    if (name === 'title') { push(node.textContent); return; }
    const label = node.getAttribute && node.getAttribute('aria-label');
    if (label) push(label);
    for (const child of Array.from(node.childNodes)) walk(child);
  };
  walk(root);
  return out;
}

function formatLedger(value) {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 3 });
  return String(Number(value.toFixed(9)));
}

/**
 * The plain-English sentence for the centre drawing.
 *
 * `DESIGN.md` adopts a required readable sentence for every visual, driving a
 * text-only path. The authored ones belong to the data layer and to team B8;
 * until they land, the bench generates its own and stamps them
 * `data-alt-source="generated-by-chart"`, exactly as the chart layer does.
 */
export function centreAlt(scenario, view) {
  const centre = view.centre;
  if (centre.kind === 'slots') {
    const parts = centre.slots.map((row) =>
      `Slot ${row.slot} goes to ${row.name}, which pays ${money(row.price)} a click and gets ` +
      `${row.clicks.toLocaleString('en-US')} ${centre.unit || 'clicks'}`);
    const missed = centre.queue.filter((q) => !q.placed).map((q) => q.name);
    const tail = missed.length ? ` ${missed.join(' and ')} gets no slot.` : '';
    return `${parts.join('. ')}.${tail}`;
  }
  if (centre.kind === 'bars') {
    return `Two bars. ${centre.bars.map((b) => `${b.label} collects ${money(b.usd)}`).join(', and ')}.` +
      (centre.equal ? ' They are level.' : '');
  }
  return `Two plates, one for each 2019 change. ${centre.plates.map((p) =>
    `${p.channel === 'display' ? 'Display' : 'Search'} ${p.what}`).join('. ')}.`;
}

/**
 * Every reader-facing string the bench can produce, across all ten scenarios
 * AND every position of every control.
 *
 * The old version visited each scenario at its opening position only, so half
 * the prose the bench can emit — every note behind a rocker, every excursion
 * sentence, every derivation printed under a figure — was never in the set the
 * readability measurement scored.
 */
export function allBenchSentences(options) {
  const host = document.createElement('div');
  const bench = renderBench(host, options);
  const out = [];
  const seen = new Set();
  const take = () => {
    for (const s of bench.sentences()) if (!seen.has(s)) { seen.add(s); out.push(s); }
  };
  for (const scenario of SCENARIOS) {
    const channels = scenario.centre === 'plates' ? ['display', 'search'] : [null];
    for (const channel of channels) {
      bench.show(scenario.n, channel);
      take();
      const panel = bench.panel;
      const ctx = {
        settings: panel.settings, mechanism: options.mechanism,
        params: options.params, record: panel.record, panel,
      };
      for (const control of scenario.controls(ctx, defaultState(scenario, ctx))) {
        const positions = control.kind === 'rocker'
          ? control.options.map((o) => o.value)
          : [control.min, control.max, ...(control.stops || [])];
        for (const value of positions) {
          bench.setControl(control.id, value);
          take();
        }
      }
      bench.show(scenario.n, channel);
    }
  }
  return out;
}

export default { renderBench, drawBand, bandEnds, centreAlt, allBenchSentences, domSentences };
