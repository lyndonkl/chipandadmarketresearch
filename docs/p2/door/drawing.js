/**
 * docs/p2/door/drawing.js — the two lanes, the door, the valve, the three cups,
 * and the wheel with two hands on it.
 *
 * Team B5. Line work only. Every colour this file paints comes out of
 * `../eras/organs.js`'s `PAINT` as an attribute bag, so a draw site cannot take
 * a colour and leave the iron that carries it. This file imports no colour
 * token, exactly as `era-machine.js` imports none: the repair B3 made after two
 * of its five hand-picked hexes turned out to be drawn bare below 3:1.
 *
 * ======================================================================
 * WHAT THE MACHINE SAYS BEFORE A WORD IS READ
 *
 *   Two lanes go in. One starts on the buyer's own page. The other starts on
 *   somebody else's and has to come through a DOOR.
 *
 *   Both lanes run through ONE rule box. The auction does not know or care
 *   which lane a search came down, and drawing one box rather than two is the
 *   whole of that sentence.
 *
 *   Only the lower lane passes a VALVE on the way out, and the valve taps most
 *   of the money straight back down and out through the door it came in by.
 *
 *   Three open cups stand on ONE baseline. What goes back out the door. What
 *   answering the search costs. What the buyer keeps. Three lengths from one
 *   line is the most accurate comparison the eye makes, and the middle cup is
 *   the same height in both lanes because the record allocates that cost pro
 *   rata to revenue. So the whole difference between the two lanes is the first
 *   cup and the third, which is the finding.
 *
 *   A STIPPLED PIPE runs from the lower lane back up to the upper one in every
 *   state. It is the one economic defence of the whole arrangement — that
 *   syndicated inventory deepens the advertiser pool and raises the price of
 *   the buyer's OWN clicks — and it is stippled because nobody ever measured
 *   it (break B5). The reader never sees a complete machine.
 *
 * ======================================================================
 * TWO VERBS, AND THE SECOND ONE IS THE POINT
 *
 * The reader's own move is CRANK: 320ms with the 40ms hold, the verb every
 * machine in this project uses for a change the reader made.
 *
 * The rival's move is TRAVERSE. It is a different verb on purpose. TRAVERSE is
 * the object-constancy move — the same pawl, now somewhere else — and it leaves
 * a trail showing where it came from. In reduced motion the trail is required
 * and the ghost stays for three seconds, so the rival's advance is legible with
 * no motion at all. A reader who has learned that CRANK means "you did that"
 * gets a visibly different verb the moment something else moves the wheel.
 * ======================================================================
 */

import {
  el, text, frame, rule, svgRoot, titled, layer, defs, uid, absenceBlock,
} from '../charts/svg-kit.js';
import { PAINT, STRUCTURE, assertColourBudget } from '../eras/organs.js';
import { assertObjectColor, assertTextColor } from '../lib/tokens.js';
import {
  settlementPhrase, notchPhrase, wheelSentence, assertSettlement, assertRivalIsPresent,
} from './wheel.js';

export class DoorDrawingError extends Error {
  constructor(message, detail = null) { super(message); this.name = 'DoorDrawingError'; this.detail = detail; }
}

/* ------------------------------------------------------------------ *
 * 0 · THE PAINT THIS FOLDER ADDS, AND ITS OWN BUDGET
 * ------------------------------------------------------------------ */

/**
 * THE TAKE, AS A FILL RATHER THAN AS A STUB.
 *
 * `PAINT.take` is a rust STROKE, which is right for the era machine's hatched
 * tap stub and wrong for a cup that has to be filled to a level. Brass against
 * Rust falls to ΔE2000 7.8 under tritanopia, so a solid rust fill beside a
 * solid brass fill separates by hue and by nothing else.
 *
 * So there is no solid rust fill in this folder. `takePaint()` returns the
 * hatch AS the fill, with the rust edge, in one bag — the caller cannot take
 * the colour and leave the hatch, because the hatch is what the colour is.
 * The hex is read off `PAINT.take.hex`; no rust literal is typed here.
 */
const _takeCache = new WeakMap();
export function takePaint(svg) {
  if (_takeCache.has(svg)) return _takeCache.get(svg);
  const hex = PAINT.take.hex;
  assertObjectColor(hex, 'the door bench\'s take fill');
  const id = uid('door-take');
  const p = el('pattern', {
    id, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)',
  }, defs(svg));
  el('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: hex, 'stroke-width': 1.4 }, p);
  const bag = Object.freeze({
    fill: `url(#${id})`, stroke: hex, 'stroke-width': 1.2,
    /* The declared second channel, and it is in the attributes above rather
     * than only in this sentence. */
    channel: '45° hatch as the fill itself, plus a rust edge and a printed label',
  });
  _takeCache.set(svg, bag);
  return bag;
}

/** Iron structure, in one bag. Weight is what separates Iron from Zinc. */
const MECH = Object.freeze({
  fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': STRUCTURE.width,
});
const GUIDE = Object.freeze({
  fill: 'none', stroke: STRUCTURE.guide, 'stroke-width': 1, 'stroke-dasharray': '3 3',
});

/**
 * Every colour this drawing paints, measured rather than asserted.
 *
 * It runs the era machine's own budget first — this folder spreads its bags —
 * and then the one role this folder adds. `assertObjectColor` on the structure
 * and on the take, `assertTextColor` on the label ink, and a check that the
 * take's hatch is in the attributes and not only in the sentence about them.
 */
export function assertDoorColourBudget(svg) {
  assertColourBudget();
  assertObjectColor(STRUCTURE.stroke, 'the door bench\'s structure');
  assertObjectColor(STRUCTURE.guide, 'the door bench\'s guides');
  assertTextColor(STRUCTURE.label, 'the door bench\'s labels');
  if (svg) {
    const take = takePaint(svg);
    if (!/^url\(#/.test(take.fill)) {
      throw new DoorDrawingError(
        'the take is declared as a hatch and its fill is not a pattern. Brass against Rust ' +
        'falls to ΔE2000 7.8 under tritanopia; a solid rust fill beside a brass one separates ' +
        'by hue and by nothing else.',
        take
      );
    }
  }
  return true;
}

/* ------------------------------------------------------------------ *
 * 0b · THE PLANS, AND WHY THE DRAW SITE WILL NOT TAKE AN OBJECT LITERAL
 *
 * `drawMachine`, `drawBars` and `drawCurve` used to draw whatever they were
 * handed. A probe caught all three painting, with every other guard green:
 *
 *   - three cups on one baseline summing to 1.6, which is a drawing that lies
 *     with its geometry while every caption under it is true;
 *   - a negative amount leaving through the door, drawn as a bar of zero height
 *     because the scale clamped it;
 *   - a span bar carrying `central: 100` on the reported guarantee — the one
 *     number `../charts/claim-marks.js` strips off a span-only mark, put back
 *     by hand three layers down;
 *   - and a dot at the exact midpoint of the exposure band labelled "the
 *     reported guarantee, $100m". That single mark is the whole reason D1 draws
 *     a band and no middle.
 *
 * So the three forms take MINTED PLANS, on the pattern that closed the same
 * hole in the chart layer: an allow list rather than a ban list, values rather
 * than objects, the checked copy rather than the caller's, a module-private
 * WeakSet, and `assertPlan` at the top of every draw. A plan cannot be built by
 * an object literal, and the fields the plan computes cannot be supplied.
 * ------------------------------------------------------------------ */

const PLANS = new WeakSet();
const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const pct = (v) => `${(v * 100).toFixed(1)}%`;

/** THROWING FORM. Refuses anything the caller built for itself. */
export function assertPlan(value, form, context) {
  if (!PLANS.has(value) || value.form !== form) {
    throw new DoorDrawingError(
      `${context} was handed an object this module did not plan${value && value.form ? ` (it is a "${value.form}" plan)` : ''}. ` +
      'A hand-built plan is how three cups summing to 1.6, a negative amount leaving through the ' +
      'door and a dot in the middle of a band with no middle all reached the paint. Build it ' +
      `with plan${form[0].toUpperCase()}${form.slice(1)}().`,
      value
    );
  }
  return value;
}

function seal(plan) {
  Object.freeze(plan);
  PLANS.add(plan);
  return plan;
}

function need(spec, key, check, why) {
  const value = spec ? spec[key] : undefined;
  if (!check(value)) {
    throw new DoorDrawingError(`this plan needs "${key}": ${why}.`, { key, value, spec });
  }
  return value;
}
const isText = (min) => (v) => typeof v === 'string' && v.trim().length >= min;

/**
 * THE MACHINE PLAN. Three cups that are the parts of one dollar, or nothing.
 *
 * The sum is re-checked HERE, on the values the drawing is about to turn into
 * lengths, and not only in `engine.assertCupsClose` on the values the engine
 * produced. Those are two different objects and the gap between them is exactly
 * where a hand-built model gets in.
 */
export function planMachine(spec = {}) {
  const side = need(spec, 'side', (v) => v === 'owned' || v === 'network',
    'which lane the cups are filled from');
  const doorTo = need(spec, 'door', (v) => v && (v.to === 'buyer' || v.to === 'rival'),
    'the door swings to the buyer or to the rival, and to nothing else').to;
  const cups = need(spec, 'cups', (v) => v && ['outTheDoor', 'costToAnswer', 'kept']
    .every((k) => v[k] && finite(v[k].value)), 'three measured cups');
  const cupText = need(spec, 'cupText', (v) => v && ['outTheDoor', 'costToAnswer', 'kept']
    .every((k) => isText(2)(v[k])), 'the printed figure for each cup');
  const lanes = need(spec, 'lanes', (v) => v && Number.isInteger(v.drawnUpper)
    && Number.isInteger(v.drawnLower) && v.drawnUpper > 0 && v.drawnLower > 0 && isText(20)(v.sentence),
  'the drawn lane ratio and the filed share printed beside it');
  const baselineLabel = need(spec, 'baselineLabel', isText(10), 'what one dollar on this baseline is');
  const absence = need(spec, 'absence', (v) => v && isText(10)(v.label) && isText(20)(v.note),
    'break B5, named and noted, in every state');

  const sum = cups.outTheDoor.value + cups.costToAnswer.value + cups.kept.value;
  if (Math.abs(sum - 1) > 5e-9) {
    throw new DoorDrawingError(
      `these three cups add to ${sum}, not to one dollar, and the drawing is about to stand them ` +
      'on one baseline. Three lengths from one line is a claim that they are the parts of one ' +
      'whole, and no caption underneath takes that back.',
      { sum, cups: Object.fromEntries(Object.entries(cups).map(([k, v]) => [k, v.value])) }
    );
  }
  /* ONLY THE LAST CUP MAY GO BELOW ZERO. A negative take is money arriving
   * through the door the drawing says it leaves by, and the valve would draw a
   * negative share as a fraction of a per cent. */
  for (const key of ['outTheDoor', 'costToAnswer']) {
    if (cups[key].value < 0) {
      throw new DoorDrawingError(
        `the "${key}" cup is ${cups[key].value}. A negative amount cannot leave through the door ` +
        'or be spent answering a search. The kept cup is the one that may go below zero, and it ' +
        'is drawn below the baseline rather than clipped at nothing.',
        cups[key]
      );
    }
  }
  /* AND THE PRINTED FIGURE IS THE DRAWN ONE. The auction bench shipped a band
   * whose drawing and spoken sentence carried different numbers. */
  for (const key of ['outTheDoor', 'costToAnswer', 'kept']) {
    if (!String(cupText[key]).includes(pct(cups[key].value))) {
      throw new DoorDrawingError(
        `the "${key}" cup is drawn at ${pct(cups[key].value)} and printed as "${cupText[key]}". ` +
        'The height and the numeral come off one object or the reader is handed two facts.',
        { key, value: cups[key].value, text: cupText[key] }
      );
    }
  }
  /* A SHUT DOOR MEANS TWO DIFFERENT THINGS ON THIS BENCH and it used to be
   * drawn with one sentence. On D2 the partner cannot deliver, so there is no
   * lane at all and the cups are a filed rate. On D5 and D6 the reader reached
   * below the rival's standing bid, the lane emptied for the length of the
   * refusal, and the cups are the rate the wheel came back to. A drawing that
   * says "the lower lane is empty" beside three full cups of that lane's dollar
   * is telling the reader two things, so the caller has to say which. */
  const doorNote = spec.doorNote == null ? null : String(spec.doorNote);
  if (doorTo === 'rival' && !isText(24)(doorNote)) {
    throw new DoorDrawingError(
      'this machine draws the door shut and does not say what the shut door means here. The ' +
      'lower lane carries no dots in that state, and the three cups on the same drawing are ' +
      'still full of that lane\'s dollar; without a sentence the picture contradicts itself.',
      spec, 'pass doorNote: what the swing means on this stop'
    );
  }

  const ghost = spec.ghost || null;
  if (ghost) {
    for (const key of ['outTheDoor', 'costToAnswer', 'kept']) {
      if (!finite(ghost[key])) {
        throw new DoorDrawingError(`the other lane's "${key}" level is not measured.`, ghost);
      }
    }
  }
  return seal({
    form: 'machine',
    side,
    door: Object.freeze({ to: doorTo, note: doorNote }),
    cups: Object.freeze({
      outTheDoor: Object.freeze({ value: cups.outTheDoor.value }),
      costToAnswer: Object.freeze({ value: cups.costToAnswer.value }),
      kept: Object.freeze({ value: cups.kept.value }),
    }),
    cupText: Object.freeze({
      outTheDoor: String(cupText.outTheDoor),
      costToAnswer: String(cupText.costToAnswer),
      kept: String(cupText.kept),
    }),
    lanes: Object.freeze({
      drawnUpper: lanes.drawnUpper, drawnLower: lanes.drawnLower, sentence: String(lanes.sentence),
    }),
    ghost: ghost ? Object.freeze({
      outTheDoor: ghost.outTheDoor, costToAnswer: ghost.costToAnswer, kept: ghost.kept,
    }) : null,
    ghostLabel: spec.ghostLabel ? String(spec.ghostLabel) : null,
    baselineLabel: String(baselineLabel),
    absence: Object.freeze({ label: String(absence.label), note: String(absence.note) }),
  });
}

/** The keys a bar computes for itself, and which a caller may therefore not send. */
const BAR_COMPUTED = Object.freeze(['central', 'mid', 'middle', 'point', 'anchor']);

/**
 * THE BAR PLAN. Every bar names its own base, and a span has no middle.
 *
 * `central: 100` on the reported guarantee is the case this exists for: the
 * chart layer strips that key off a span-only mark, and three layers down a bar
 * carried it back in an object literal that nothing looked at.
 */
export function planBars(spec = {}) {
  const max = need(spec, 'max', (v) => finite(v) && v > 0, 'a positive top of scale');
  const unit = need(spec, 'unit', isText(6), 'what these bars are measured in');
  const list = need(spec, 'bars', (v) => Array.isArray(v) && v.length > 0 && v.length <= 6,
    'between one and six bars on one baseline');
  const bars = list.map((bar, i) => {
    const where = `bar ${i + 1}`;
    for (const key of Reflect.ownKeys(bar)) {
      const name = typeof key === 'symbol' ? key.toString() : key;
      if (BAR_COMPUTED.includes(key)) {
        throw new DoorDrawingError(
          `${where} carries "${name}". A span bar has no middle and a level bar's middle is its ` +
          'own height; "central" in particular is the key the chart layer removes from a ' +
          'span-only mark, and the reported guarantee is one of those.',
          bar
        );
      }
    }
    const label = need(bar, 'label', isText(4), `${where} needs a label a reader can read`);
    const basis = need(bar, 'basis', isText(8),
      `${where} must name its own base under it — the record quotes one numerator over three ` +
      'denominators and calls all three correct');
    const figureText = need(bar, 'figureText', isText(2), `${where} needs its printed figure`);
    const role = need(bar, 'role', (v) => v === 'take' || v === 'mechanism' || v === 'money',
      `${where} is drawn as the take, as mechanism, or as money`);
    if (bar.kind === 'span') {
      if ('value' in bar) {
        throw new DoorDrawingError(
          `${where} is a span and carries a "value". The mark IS the range; a scalar on it is ` +
          'the number the record refuses.', bar
        );
      }
      const lo = need(bar, 'lo', finite, `${where} needs the bottom of its range`);
      const hi = need(bar, 'hi', finite, `${where} needs the top of its range`);
      if (!(hi > lo)) throw new DoorDrawingError(`${where} runs from ${lo} to ${hi}.`, bar);
      if (lo < 0) throw new DoorDrawingError(`${where} starts below the baseline at ${lo}.`, bar);
      if (hi > max) {
        throw new DoorDrawingError(
          `${where} runs to ${hi} on a board whose top of scale is ${max}, so it would be drawn ` +
          'shorter than it is.', bar
        );
      }
      return Object.freeze({ kind: 'span', lo, hi, role, label, basis, figureText });
    }
    const value = need(bar, 'value', finite, `${where} needs a measured height`);
    if (value < 0) {
      throw new DoorDrawingError(
        `${where} is ${value}. A bar board draws from the baseline up, so a negative height is ` +
        'clamped to nothing and the reader is shown a quantity of zero where the record has a ' +
        'loss. Draw it on the machine, where a cup can go below the line.',
        bar
      );
    }
    if (value > max) {
      throw new DoorDrawingError(
        `${where} is ${value} on a board whose top of scale is ${max}.`, bar
      );
    }
    return Object.freeze({ kind: 'level', value, role, label, basis, figureText });
  });
  return seal({
    form: 'bars', max, unit: String(unit),
    bars: Object.freeze(bars),
    note: spec.note ? String(spec.note) : null,
  });
}

/**
 * THE CURVE PLAN. A band with no line down the middle, and no mark inside it.
 *
 * The refused case is one dot: `{ x: 300, y: 112.5, label: 'the reported
 * guarantee, $100m' }`, sitting exactly halfway between the two curves. G1
 * refuses a point on this claim, `planClaimMark` mints a mark with no `central`
 * on it, and D1 draws two paths and fills between them — and then a mark placed
 * by hand puts the number back in the one place the reader looks.
 */
export function planCurve(spec = {}) {
  const x = need(spec, 'x', (v) => v && finite(v.min) && finite(v.max) && v.max > v.min && isText(6)(v.label),
    'an x axis with a range and a label');
  const y = need(spec, 'y', (v) => v && finite(v.min) && finite(v.max) && v.max > v.min && isText(6)(v.label),
    'a y axis with a range and a label');
  const rows = (v, name) => {
    if (!Array.isArray(v) || v.length < 2) {
      throw new DoorDrawingError(`"${name}" needs at least two points.`, v);
    }
    return v.map((p) => {
      if (!Array.isArray(p) || p.length !== 2 || !finite(p[0]) || !finite(p[1])) {
        throw new DoorDrawingError(`"${name}" carries a point that is not two measured numbers.`, p);
      }
      return Object.freeze([p[0], p[1]]);
    });
  };
  const bandLo = rows(spec.bandLo, 'bandLo');
  const bandHi = rows(spec.bandHi, 'bandHi');
  if (bandLo.length !== bandHi.length) {
    throw new DoorDrawingError('the two edges of the band have different numbers of points.',
      { lo: bandLo.length, hi: bandHi.length });
  }
  for (let i = 0; i < bandLo.length; i += 1) {
    if (bandLo[i][0] !== bandHi[i][0]) {
      throw new DoorDrawingError('the two edges of the band are not sampled at the same x.',
        { at: i, lo: bandLo[i][0], hi: bandHi[i][0] });
    }
    if (bandHi[i][1] < bandLo[i][1] - 1e-9) {
      throw new DoorDrawingError('the top edge of the band runs below the bottom edge.',
        { at: i, lo: bandLo[i][1], hi: bandHi[i][1] });
    }
  }
  const at = (band, xx) => {
    for (let i = 1; i < band.length; i += 1) {
      const [x0, y0] = band[i - 1];
      const [x1, y1] = band[i];
      if (xx >= Math.min(x0, x1) && xx <= Math.max(x0, x1)) {
        const t = x1 === x0 ? 0 : (xx - x0) / (x1 - x0);
        return y0 + t * (y1 - y0);
      }
    }
    return null;
  };
  const marks = (spec.marks || []).map((mark, i) => {
    if (!finite(mark.x) || !finite(mark.y) || !isText(4)(mark.label)) {
      throw new DoorDrawingError(`mark ${i + 1} needs a measured point and a label.`, mark);
    }
    const lo = at(bandLo, mark.x);
    const hi = at(bandHi, mark.x);
    if (lo != null && hi != null && mark.y > lo + 1e-9 && mark.y < hi - 1e-9) {
      throw new DoorDrawingError(
        `mark "${mark.label}" sits inside the band, at ${mark.y} between ${lo} and ${hi}. This ` +
        'curve is drawn twice and filled between precisely because the record refuses a point on ' +
        'the quantity it plots; a mark in there is that point, drawn, in the one place the reader ' +
        'is looking. Put it on the axis or leave it out.',
        mark
      );
    }
    return Object.freeze({ x: mark.x, y: mark.y, label: String(mark.label) });
  });
  const cursor = spec.cursor ? Object.freeze({
    x: need(spec.cursor, 'x', finite, 'the cursor needs a measured position'),
    label: need(spec.cursor, 'label', isText(4), 'the cursor needs a label'),
  }) : null;
  return seal({
    form: 'curve',
    x: Object.freeze({ min: x.min, max: x.max, label: String(x.label) }),
    y: Object.freeze({ min: y.min, max: y.max, label: String(y.label) }),
    bandLo: Object.freeze(bandLo),
    bandHi: Object.freeze(bandHi),
    marks: Object.freeze(marks),
    cursor,
    note: spec.note ? String(spec.note) : null,
  });
}

/* ------------------------------------------------------------------ *
 * 1 · THE MACHINE
 * ------------------------------------------------------------------ */

export const MACHINE = Object.freeze({
  width: 940, height: 624,
  upperY: 92, lowerY: 224, pipe: 34,
  sourceX: 16, sourceW: 158, sourceH: 66,
  doorX: 190, doorW: 44,
  ruleX: 352, ruleW: 196, ruleTop: 50, ruleBottom: 266,
  valveX: 618, valveW: 48,
  rail: 336,                    // the collector rail every cup is fed from
  cupBase: 540, cupTop: 366, cupW: 104,
  cupX: [140, 410, 680],
  scale: 158,       // px per whole dollar
});

function pipe(g, { x, y, width, height, title = null }) {
  const node = el('rect', { x, y, width, height, ...MECH }, g);
  if (title) el('title', {}, node).textContent = title;
  return node;
}

/**
 * The brass dots that travel a lane.
 *
 * Money is the only filled round mark in this palette, and `PAINT.money` is the
 * bag that makes it one. Three dots run the upper lane for every one down the
 * lower — a DRAWING CONVENTION at the filed 2002 ratio of about three to one,
 * with the filed share printed beside it so a reader counting dots and a reader
 * reading the number never get two different facts.
 */
function dots(g, { x0, x1, y, n, title }) {
  const group = layer(g, { class: 'db-dots' });
  const span = x1 - x0;
  for (let i = 0; i < n; i += 1) {
    const x = x0 + span * ((i + 0.5) / n);
    el('circle', { cx: x, cy: y, r: 4.2, ...PAINT.money.attrs }, group);
  }
  titled(group, title);
  return group;
}

/**
 * THE DOOR. A frame, and a leaf on a hinge.
 *
 * The leaf's angle is the state: swung open when the buyer's bid holds the
 * placement, and swung shut across the lane when the rival's standing bid takes
 * it. When it is shut the lower lane carries no dots at all, because those
 * searches went somewhere else. That is the one thing on this drawing a reader
 * cannot mistake, and it fires whenever the wheel is turned below the rival's
 * bid.
 */
function drawDoor(g, { x, y, height, to, note }) {
  const group = layer(g, { class: 'db-door', 'data-door-to': to });
  el('rect', { x, y, width: MACHINE.doorW, height, ...MECH }, group);
  const hingeX = x + MACHINE.doorW;
  const hingeY = y + height;
  const open = to === 'buyer';
  const leafLen = height * 0.92;
  const angle = open ? -62 : 0;   /* degrees from straight down */
  const rad = (angle * Math.PI) / 180;
  const tipX = hingeX + Math.sin(rad) * leafLen;
  const tipY = hingeY - Math.cos(rad) * leafLen;
  el('line', {
    x1: hingeX, y1: hingeY, x2: tipX, y2: tipY,
    stroke: STRUCTURE.stroke, 'stroke-width': 3, 'stroke-linecap': 'round',
  }, group);
  el('circle', { cx: hingeX, cy: hingeY, r: 3, fill: STRUCTURE.stroke }, group);
  /* The arc of travel, so the leaf reads as hinged rather than as a stray line. */
  el('path', {
    d: `M${hingeX} ${hingeY - leafLen} A${leafLen} ${leafLen} 0 0 1 ` +
       `${hingeX + Math.sin((-62 * Math.PI) / 180) * leafLen} ${hingeY - Math.cos((-62 * Math.PI) / 180) * leafLen}`,
    ...GUIDE,
  }, group);
  text(group, {
    x: x + MACHINE.doorW / 2, y: y - 8, value: 'the door', role: 'label',
    fill: STRUCTURE.label, anchor: 'middle',
  });
  titled(group, open
    ? 'The door is open to the buyer. Searches that start on somebody else\'s page come through it.'
    : `The door has swung away from the buyer and the lower lane is empty. ${note}`);
  return group;
}

/** The valve on the lower lane. Rust, hatched, and it taps downward. */
function drawValve(g, svg, { x, y, height, share }) {
  const take = takePaint(svg);
  const group = layer(g, { class: 'db-valve' });
  el('rect', { x, y, width: MACHINE.valveW, height, fill: take.fill, stroke: take.stroke, 'stroke-width': take['stroke-width'] }, group);
  el('rect', { x, y, width: MACHINE.valveW, height, ...MECH }, group);
  const midX = x + MACHINE.valveW / 2;
  el('path', {
    d: `M${midX} ${y + height} L${midX} ${y + height + 26}`,
    fill: 'none', stroke: take.stroke, 'stroke-width': 3,
  }, group);
  el('path', {
    d: `M${midX - 6} ${y + height + 20} L${midX} ${y + height + 32} L${midX + 6} ${y + height + 20} Z`,
    fill: take.stroke,
  }, group);
  text(group, {
    x: midX, y: y - 8, value: 'the valve', role: 'label', fill: STRUCTURE.label, anchor: 'middle',
  });
  titled(group, `The valve taps ${(share * 100).toFixed(1)} per cent of the money on this lane ` +
    'straight back down and out through the door it came in by.');
  return group;
}

/**
 * A CUP. Open-topped, on the shared baseline, filled to its level.
 *
 * A cup whose level is NEGATIVE is drawn below the baseline rather than clipped
 * at zero. At the payout ratio the buyer actually recognised in 2002 the lower
 * lane ran at a loss per thousand queries, and a cup clipped at zero would draw
 * that as "nothing left" instead of "less than nothing".
 */
function drawCup(g, svg, { x, value, label, paint, figureText, ghost = null, ghostLabel = null }) {
  const group = layer(g, { class: 'db-cup' });
  const base = MACHINE.cupBase;
  const w = MACHINE.cupW;
  const h = Math.abs(value) * MACHINE.scale;
  const top = value >= 0 ? base - h : base;
  const bottom = value >= 0 ? base : base + h;

  /* The cup itself: two walls and a floor, open at the top. */
  el('path', {
    d: `M${x} ${MACHINE.cupTop} L${x} ${base} L${x + w} ${base} L${x + w} ${MACHINE.cupTop}`,
    ...MECH,
  }, group);
  el('rect', {
    x: x + 1.5, y: top, width: w - 3, height: Math.max(h, 0.6),
    ...(paint.fill ? { fill: paint.fill, stroke: paint.stroke, 'stroke-width': paint['stroke-width'] || 1 } : paint),
  }, group);
  if (value < 0) {
    el('line', {
      x1: x, y1: base, x2: x + w, y2: base,
      stroke: STRUCTURE.stroke, 'stroke-width': 2, 'stroke-dasharray': '4 3',
    }, group);
    text(group, {
      x: x + w / 2, y: bottom + 14, value: 'below zero', role: 'label',
      fill: STRUCTURE.label, anchor: 'middle',
    });
  }
  /* The other lane's level on the same cup, as an iron tick, with a caliper
   * between the two. The gap is an object. */
  if (ghost != null) {
    const gy = base - ghost * MACHINE.scale;
    el('line', { x1: x - 8, y1: gy, x2: x + w + 8, y2: gy, ...GUIDE, 'stroke-dasharray': '5 3' }, group);
    text(group, {
      x: x + w + 12, y: gy + 3.5, value: ghostLabel || 'the other lane',
      role: 'chrome', fill: STRUCTURE.label, size: 10,
    });
  }
  text(group, {
    x: x + w / 2, y: MACHINE.cupBase + 34, value: label, role: 'label',
    fill: STRUCTURE.label, anchor: 'middle',
  });
  text(group, {
    x: x + w / 2, y: (value >= 0 ? top - 10 : bottom + 30), value: figureText, role: 'numeral',
    fill: STRUCTURE.label, anchor: 'middle', size: 15,
  });
  return group;
}

/**
 * Draw the whole machine.
 *
 * `model` is built by `scenarios.js` and carries no record row: three minted
 * cups, the door's state, the wheel's settlement where there is one, and the
 * lane ratio. `alt` is the plain-English sentence the accessible name uses, and
 * it is generated from the same numbers the drawing draws.
 */
export function drawMachine(host, model, alt) {
  assertPlan(model, 'machine', 'drawMachine');
  const svg = svgRoot(host, {
    width: MACHINE.width, height: MACHINE.height, alt, className: 'db-machine',
  });
  assertDoorColourBudget(svg);
  const g = layer(svg, { class: 'db-machine-body' });

  /* --- the two sources --- */
  const sources = [
    { y: MACHINE.upperY - 33, lines: ['searches that', 'start on the', 'buyer\'s own page'] },
    { y: MACHINE.lowerY - 33, lines: ['searches that', 'start on', 'somebody else\'s page'] },
  ];
  for (const source of sources) {
    frame(g, { x: MACHINE.sourceX, y: source.y, width: MACHINE.sourceW, height: MACHINE.sourceH });
    source.lines.forEach((line, i) => text(g, {
      x: MACHINE.sourceX + 9, y: source.y + 20 + i * 15, value: line, role: 'chrome',
      fill: STRUCTURE.label, size: 11,
    }));
  }

  /* --- the upper lane, straight through --- */
  const upTop = MACHINE.upperY - MACHINE.pipe / 2;
  pipe(g, {
    x: MACHINE.sourceX + MACHINE.sourceW, y: upTop,
    width: MACHINE.ruleX - (MACHINE.sourceX + MACHINE.sourceW), height: MACHINE.pipe,
    title: 'The upper lane. Nothing stands between the buyer\'s own page and the auction.',
  });
  dots(g, {
    x0: MACHINE.sourceX + MACHINE.sourceW, x1: MACHINE.ruleX, y: MACHINE.upperY,
    n: model.lanes.drawnUpper,
    title: `${model.lanes.drawnUpper} dots on the upper lane for every ` +
      `${model.lanes.drawnLower} on the lower. ${model.lanes.sentence}`,
  });

  /* --- the lower lane, through the door --- */
  const loTop = MACHINE.lowerY - MACHINE.pipe / 2;
  drawDoor(g, {
    x: MACHINE.doorX, y: loTop - 16, height: MACHINE.pipe + 32,
    to: model.door.to, note: model.door.note,
  });
  pipe(g, {
    x: MACHINE.doorX + MACHINE.doorW, y: loTop,
    width: MACHINE.ruleX - (MACHINE.doorX + MACHINE.doorW), height: MACHINE.pipe,
    title: 'The lower lane. These searches start somewhere else and have to be bought.',
  });
  pipe(g, {
    x: MACHINE.sourceX + MACHINE.sourceW, y: loTop,
    width: MACHINE.doorX - (MACHINE.sourceX + MACHINE.sourceW), height: MACHINE.pipe,
  });
  if (model.door.to === 'buyer') {
    dots(g, {
      x0: MACHINE.doorX + MACHINE.doorW, x1: MACHINE.ruleX, y: MACHINE.lowerY,
      n: model.lanes.drawnLower,
      title: `${model.lanes.drawnLower} dot on the lower lane. ${model.lanes.sentence}`,
    });
  } else {
    text(g, {
      x: (MACHINE.doorX + MACHINE.doorW + MACHINE.ruleX) / 2, y: MACHINE.lowerY + 4,
      value: 'the rival holds this lane', role: 'chrome', fill: STRUCTURE.label,
      anchor: 'middle', size: 11,
    });
  }

  /* --- ONE rule box, both lanes --- */
  const box = layer(g, { class: 'db-rule-box' });
  frame(box, {
    x: MACHINE.ruleX, y: MACHINE.ruleTop,
    width: MACHINE.ruleW, height: MACHINE.ruleBottom - MACHINE.ruleTop,
  });
  text(box, {
    x: MACHINE.ruleX + MACHINE.ruleW / 2, y: MACHINE.ruleTop + 22,
    value: 'the same auction', role: 'label', fill: STRUCTURE.label, anchor: 'middle',
  });
  text(box, {
    x: MACHINE.ruleX + MACHINE.ruleW / 2, y: MACHINE.ruleTop + 44,
    value: 'one rule box, both lanes', role: 'chrome', fill: STRUCTURE.label,
    anchor: 'middle', size: 11,
  });
  titled(box, 'One rule box, and both lanes run through it. The auction does not know which ' +
    'page a search started on.');

  /* --- THE STIPPLED PIPE, INSIDE THE MACHINE ---
   *
   * It runs from the lower lane back up to the upper one, through a block that
   * is never filled. That is what the argument actually claims: searches bought
   * through the door deepen the pool of advertisers, and the deeper pool raises
   * the price of a click on the buyer's OWN page. Nobody ever measured it, so
   * the pipe is stippled and framed and named, in every state of this bench.
   * The reader never sees a complete machine. */
  const stipX = MACHINE.ruleX + 14;
  const stipW = MACHINE.ruleW - 28;
  const stipY = MACHINE.upperY + MACHINE.pipe / 2 + 26;
  const stipH = 34;
  el('path', {
    d: `M${MACHINE.ruleX + MACHINE.ruleW / 2} ${MACHINE.lowerY - MACHINE.pipe / 2} ` +
       `L${MACHINE.ruleX + MACHINE.ruleW / 2} ${stipY + stipH} ` +
       `M${MACHINE.ruleX + MACHINE.ruleW / 2} ${stipY} ` +
       `L${MACHINE.ruleX + MACHINE.ruleW / 2} ${MACHINE.upperY + MACHINE.pipe / 2}`,
    ...GUIDE,
  }, g);
  absenceBlock(g, svg, {
    x: stipX, y: stipY, width: stipW, height: stipH,
    extent: 'the whole of this machine, in every state',
    label: 'never measured',
    note: model.absence.note,
  });
  wrapLabel(g, model.absence.label, MACHINE.ruleX, MACHINE.ruleBottom + 18, 220, 'chrome');

  /* --- the exits, and the valve on the lower one --- */
  pipe(g, {
    x: MACHINE.ruleX + MACHINE.ruleW, y: upTop,
    width: MACHINE.width - 40 - (MACHINE.ruleX + MACHINE.ruleW), height: MACHINE.pipe,
    title: 'The upper lane leaves with nothing taken out of it on the way.',
  });
  pipe(g, {
    x: MACHINE.ruleX + MACHINE.ruleW, y: loTop,
    width: MACHINE.valveX - (MACHINE.ruleX + MACHINE.ruleW), height: MACHINE.pipe,
  });
  drawValve(g, svg, {
    x: MACHINE.valveX, y: loTop - 8, height: MACHINE.pipe + 16,
    share: model.cups.outTheDoor.value,
  });
  pipe(g, {
    x: MACHINE.valveX + MACHINE.valveW, y: loTop,
    width: MACHINE.width - 40 - (MACHINE.valveX + MACHINE.valveW), height: MACHINE.pipe,
  });

  /* --- THE COLLECTOR RAIL. The valve's tap and the lane the cups are filled
   * from both join it, and three short drops feed the three cups. --- */
  const laneY = model.side === 'owned' ? MACHINE.upperY : MACHINE.lowerY;
  const tapX = MACHINE.valveX + MACHINE.valveW / 2;
  el('path', {
    d: `M${MACHINE.width - 30} ${laneY} L${MACHINE.width - 30} ${MACHINE.rail} L60 ${MACHINE.rail}`,
    ...MECH,
  }, g);
  el('path', { d: `M${tapX} ${MACHINE.lowerY + MACHINE.pipe / 2 + 22} L${tapX} ${MACHINE.rail}`, ...MECH }, g);
  text(g, {
    x: MACHINE.width - 36, y: MACHINE.rail - 9,
    value: `the cups hold one dollar of the ${model.side === 'owned' ? 'upper' : 'lower'} lane`,
    role: 'chrome', fill: STRUCTURE.label, anchor: 'end', size: 10,
  });
  for (const cx of MACHINE.cupX) {
    el('path', {
      d: `M${cx + MACHINE.cupW / 2} ${MACHINE.rail} L${cx + MACHINE.cupW / 2} ${MACHINE.cupTop}`,
      ...GUIDE,
    }, g);
  }

  /* --- the three cups on one baseline --- */
  const cups = layer(g, { class: 'db-cups' });
  rule(cups, {
    x1: 60, y1: MACHINE.cupBase, x2: MACHINE.width - 40, y2: MACHINE.cupBase,
    color: STRUCTURE.stroke, width: STRUCTURE.width,
  });
  text(cups, {
    x: 60, y: MACHINE.cupBase + 62, value: model.baselineLabel, role: 'chrome',
    fill: STRUCTURE.label, size: 11,
  });
  const take = takePaint(svg);
  const specs = [
    { key: 'outTheDoor', paint: take, label: 'back out the door' },
    { key: 'costToAnswer', paint: { fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': STRUCTURE.width }, label: 'answering the search' },
    { key: 'kept', paint: { ...PAINT.money.attrs, stroke: STRUCTURE.stroke, 'stroke-width': 1 }, label: 'what the buyer keeps' },
  ];
  specs.forEach((spec, i) => {
    drawCup(cups, svg, {
      x: MACHINE.cupX[i],
      value: model.cups[spec.key].value,
      label: spec.label,
      paint: spec.paint,
      figureText: model.cupText[spec.key],
      ghost: model.ghost ? model.ghost[spec.key] : null,
      ghostLabel: model.ghostLabel || null,
    });
  });
  return svg;
}

/* ------------------------------------------------------------------ *
 * 2 · THE WHEEL, AND IT IS THE CONTROL
 *
 * THE DRUM IS WHAT THE READER GRABS. There is no slider anywhere else on the
 * page reporting into it.
 *
 * The version this replaces put a plain range input in the LEFT column under a
 * heading, and the drum, the grip, the pawl, the held ground and the ceiling
 * stop 421 units lower in the CENTRE column. With the drum centred in a 1009px
 * viewport the slider sat at y = -42. THERE WAS NO SCROLL POSITION AT WHICH
 * BOTH WERE ON SCREEN: the gesture and the answer to it could never be seen
 * together, which is the whole mechanism. And at the point of contact sat a
 * caption saying "this wheel is not yours alone" — the printed answer DESIGN.md
 * rejected, in the one place the reader was actually looking.
 *
 * So the gesture and every answer to it are now one object, inside one 222-unit
 * band:
 *
 *   the grip          the reader's hand, ON the drum, at y 46–118
 *   the held ground   shaded inside the drum, up to the rival's bid
 *   the hard stop     the edge of that ground, which the grip cannot pass
 *   the ceiling post  where the rival's hand comes off, y 34–116
 *   the pawl          the rival's hand, under the drum, y 112–146
 *   the hand it was   a hollow pawl at the notch the rival opened on, and a
 *                     dashed rule from there to where its hand is now. It is
 *                     the RESTING form of the trail TRAVERSE leaves, and unlike
 *                     the trail it never goes away. Same band, y 112–146.
 *   the notches       every value, dimmed where it is no longer reachable
 *
 * A reader who never reads a caption drags the drum, feels it stop, sees the
 * shaded ground grow under their own grip and the second hand move on its own.
 *
 * KEYBOARD IS THE SAME OBJECT. The svg itself carries `role="slider"` and
 * `tabindex="0"`; arrows, Home and End turn the same drum through the same
 * `turnTo`. There is no second control to keep in step, because there is no
 * second control.
 * ------------------------------------------------------------------ */

/**
 * The band the reader's hand and every answer to it live in runs 30–182, and
 * `height` is the drawing that holds it plus two wrapped readout lines. Both
 * numbers are asserted in `door.test.js` section 17, in drawing units and again
 * in CSS pixels off the rendered page.
 */
export const WHEEL = Object.freeze({
  width: 940, height: 262,
  drumX: 118, drumW: 748, drumY: 56, drumH: 52,
  gripOver: 10,          // how far the grip stands proud of the drum, each side
  pawlTop: 112, pawlBottom: 146,
  valueY: 168, whoseY: 182,
  saidY: 206,            // the readouts wrap from here down
});

function notchX(index, count) {
  const span = WHEEL.drumW - 76;
  return WHEEL.drumX + 38 + (count === 1 ? span / 2 : (span * index) / (count - 1));
}

/** The notch nearest a point along the drum, in viewBox units. */
export function notchAtX(x, count) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < count; i += 1) {
    const d = Math.abs(notchX(i, count) - x);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

/** The grip: a knurled block the reader's hand is on, sitting ON the drum. */
function drawGrip(parent, x, { ghost = false }) {
  const top = WHEEL.drumY - WHEEL.gripOver;
  const height = WHEEL.drumH + WHEEL.gripOver * 2;
  const group = layer(parent, { class: ghost ? 'db-grip db-grip--ghost' : 'db-grip' });
  el('rect', {
    x: x - 13, y: top, width: 26, height, rx: 4,
    fill: ghost ? 'none' : STRUCTURE.stroke,
    stroke: STRUCTURE.stroke,
    'stroke-width': ghost ? 1.6 : 1,
    'stroke-dasharray': ghost ? '4 3' : null,
    'fill-opacity': ghost ? 0 : 1,
  }, group);
  if (!ghost) {
    for (const dx of [-5, 0, 5]) {
      el('line', {
        x1: x + dx, y1: top + 8, x2: x + dx, y2: top + height - 8,
        stroke: PAINT.money.attrs.fill, 'stroke-width': 1.2,
      }, group);
    }
  }
  return group;
}

/**
 * DRAW THE WHEEL, AS THE CONTROL.
 *
 * `onTurn(index)` is what makes it one: pass it and the drum takes pointer and
 * keyboard input directly. Leave it out and the same drawing is a read-only
 * picture, which is what the filed walk and the printed pages want.
 *
 * The drag session lives on `document`, not on the svg, and re-reads the live
 * svg out of `host` on every move. That is deliberate: every turn repaints the
 * bench and replaces this element, and a drag anchored to the old node would
 * die on the first notch it crossed — the reader would feel the wheel come
 * loose in their hand exactly when the rival pushed back.
 *
 * Returns the handles `bench.js` needs to move the rival's pawl with TRAVERSE.
 * Nothing here animates; `motion.js` owns every verb in this project.
 */
export function drawWheel(host, settlement, options = {}) {
  const { onNotch = null, pawlAtIndex = null, onTurn = null, focus = false } = options;
  assertSettlement(settlement, 'drawWheel');
  /* THE GUARD RUNS AT THE DRAW SITE. A stop that drew a wheel without calling
   * it used to be an unguarded stop; there is no such stop now. */
  assertRivalIsPresent(settlement, 'the wheel being drawn');
  const alt = wheelSentence(settlement);
  const svg = svgRoot(host, {
    width: WHEEL.width, height: WHEEL.height, alt, className: 'db-wheel',
  });
  assertDoorColourBudget(svg);
  const g = layer(svg, { class: 'db-wheel-body' });
  const notches = settlement.notches;
  const n = notches.length;
  const live = Boolean(onTurn) && settlement.mode === 'contested';

  /* --- THE CONTROL'S OWN ROLE, ON THE DRAWING ITSELF ---
   * `svgRoot` stamps role="img" because every other drawing in this project is
   * one. This drawing is a control, so it says so here, and the state sentence
   * goes on aria-valuetext where a screen reader reads it as the value rather
   * than as a picture's description. */
  if (live) {
    svg.setAttribute('role', 'slider');
    svg.setAttribute('tabindex', '0');
    svg.setAttribute('aria-label', 'the revenue share');
    svg.setAttribute('aria-valuemin', '0');
    svg.setAttribute('aria-valuemax', String(n - 1));
    svg.setAttribute('aria-valuenow', String(settlement.index));
    svg.setAttribute('aria-valuetext', alt);
    svg.classList.add('db-wheel--live');
  }

  /* --- the drum, edge on, with a knurled rim --- */
  el('rect', {
    x: WHEEL.drumX, y: WHEEL.drumY, width: WHEEL.drumW, height: WHEEL.drumH,
    rx: WHEEL.drumH / 2, ...MECH,
  }, g);
  const knurl = layer(g, { class: 'db-knurl' });
  for (let x = WHEEL.drumX + 10; x < WHEEL.drumX + WHEEL.drumW - 8; x += 7) {
    el('line', {
      x1: x, y1: WHEEL.drumY + 6, x2: x, y2: WHEEL.drumY + WHEEL.drumH - 6,
      stroke: STRUCTURE.guide, 'stroke-width': 1,
    }, knurl);
  }

  /* --- THE GROUND THE RIVAL HOLDS. It grows, and it never gives back.
   *
   * IRON, NOT STIPPLE. Stipple means one thing in this palette — documented
   * absence — and held ground is not an absence, it is mechanism. A shaded iron
   * band with a dashed iron edge is the apparatus saying "this part of the
   * travel is not yours", which is exactly what it is. It is drawn INSIDE the
   * drum, under the reader's own grip, because that is where it is felt. --- */
  let heldTo = null;
  if (settlement.mode === 'contested' && settlement.rival.index >= 0) {
    const half = n > 1 ? (notchX(1, n) - notchX(0, n)) / 2 : 0;
    heldTo = notchX(settlement.rival.index, n) + half;
    const held = layer(g, { class: 'db-held' });
    el('rect', {
      x: WHEEL.drumX, y: WHEEL.drumY, width: Math.max(0, heldTo - WHEEL.drumX),
      height: WHEEL.drumH, rx: WHEEL.drumH / 2,
      fill: STRUCTURE.stroke, 'fill-opacity': 0.2, stroke: 'none',
    }, held);
    /* THE HARD STOP. The boundary is a rule, not a second outline: a rounded
     * box inside a rounded box reads as a separate object, and a stop bar with
     * a shoulder reads as the end of the travel, which is what it is. */
    el('path', {
      d: `M${heldTo} ${WHEEL.drumY - 14} L${heldTo} ${WHEEL.drumY + WHEEL.drumH + 14}`,
      ...MECH, 'stroke-width': 3,
    }, held);
    titled(held, `Everything up to ${(settlement.rival.share * 100).toFixed(1)} per cent is under ` +
      'the rival\'s standing bid. The wheel will not stay there.');
  }

  /* --- THE RIVAL'S CEILING. A hard stop for the OTHER hand, and it is drawn
   * against the pawl rather than against the reader: above it the rival's hand
   * comes off and the reader is alone on the drum. --- */
  if (settlement.mode === 'contested') {
    const ceilingIndex = notches.findIndex((notch) => notch.whose === 'rival-ceiling');
    if (ceilingIndex >= 0) {
      const cx = notchX(ceilingIndex, n);
      const post = layer(g, { class: 'db-ceiling' });
      el('path', {
        d: `M${cx} ${WHEEL.drumY - 22} L${cx} ${WHEEL.pawlBottom - 4}`,
        fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': 2.4,
      }, post);
      el('path', {
        d: `M${cx} ${WHEEL.pawlBottom - 4} L${cx + 16} ${WHEEL.pawlBottom - 4}`,
        fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': 2.4,
      }, post);
      /* THE LABEL SITS ON THE POST'S SHOULDER, not above the drum. Above the
       * drum is where the refusal's return arc runs, and the arrowhead landed
       * on top of this sentence. */
      text(post, {
        x: cx + 22, y: WHEEL.pawlBottom - 8,
        value: 'the rival\'s hand comes off here', role: 'chrome', fill: STRUCTURE.label, size: 11,
      });
      titled(post, 'The rival cannot bid past what a search earns it, less what it costs to ' +
        'answer. That number is invented.');
    }
  }

  /* --- the notches, on the drum --- */
  const marks = layer(g, { class: 'db-notches' });
  notches.forEach((notch, i) => {
    const x = notchX(i, n);
    const reachable = settlement.mode !== 'contested' || settlement.reachable.includes(i);
    el('line', {
      x1: x, y1: WHEEL.drumY + 3, x2: x, y2: WHEEL.drumY + WHEEL.drumH - 3,
      stroke: STRUCTURE.stroke, 'stroke-width': 2,
      'stroke-dasharray': notch.grade === 'B' ? '3 2' : null,
      opacity: reachable ? null : 0.4,
    }, marks);
    const t = text(marks, {
      x, y: WHEEL.valueY, value: `${(notch.value * 100).toFixed(1)}%`,
      role: 'numeral', fill: STRUCTURE.label, anchor: 'middle', size: 13,
      opacity: reachable ? null : 0.4,
    });
    t.setAttribute('data-notch', String(i));
    text(marks, {
      x, y: WHEEL.whoseY,
      value: notch.whose === 'rival' || notch.whose === 'rival-ceiling' ? 'the rival\'s' : notch.whose,
      role: 'chrome', fill: STRUCTURE.label, anchor: 'middle', size: 9,
      opacity: reachable ? null : 0.4,
    });
    if (onNotch) onNotch(i, x);
  });

  /* --- THE READER'S GRIP, ON THE DRUM --- */
  const gripX = settlement.mode === 'contested'
    ? notchX(settlement.index, n)
    : WHEEL.drumX + 38 + (WHEEL.drumW - 76) * positionOfShare(settlement.share, notches);
  /* THE REFUSAL, DRAWN. Where the reader reached below the rival's standing bid
   * the grip travelled there and came back, and a ghost at the asked notch with
   * the return arc says so with no motion at all — which is what reduced motion
   * gets. */
  if (settlement.transient && settlement.askedIndex != null
      && settlement.askedIndex !== settlement.index) {
    const askedX = notchX(settlement.askedIndex, n);
    drawGrip(g, askedX, { ghost: true });
    const midX = (askedX + gripX) / 2;
    el('path', {
      d: `M${askedX} ${WHEEL.drumY - 24} Q${midX} ${WHEEL.drumY - 44} ${gripX} ${WHEEL.drumY - 24}`,
      fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': 1.6, 'stroke-dasharray': '4 3',
    }, g);
    el('path', {
      d: `M${gripX - 7} ${WHEEL.drumY - 30} L${gripX} ${WHEEL.drumY - 22} L${gripX - 7} ${WHEEL.drumY - 18} Z`,
      fill: STRUCTURE.stroke,
    }, g);
  }
  const pointer = drawGrip(g, gripX, { ghost: false });
  titled(pointer, settlement.mode === 'contested'
    ? `Your hand on the drum, at ${(settlement.share * 100).toFixed(1)} per cent. Drag it, or ` +
      'use the arrow keys.'
    : `The drum stands at ${(settlement.share * 100).toFixed(1)} per cent. There is no handle in ` +
      'this state.');

  /* --- THE RIVAL'S PAWL, below. A second hand, drawn differently. --- */
  const trailLayer = layer(g, { class: 'db-trail' });

  /* --- WHERE THE SECOND HAND STARTED, AND IT DOES NOT GO AWAY ---
   *
   * The strongest second-party percept this drawing has is the TRAVERSE trail:
   * the same pawl in two places with a rule between them, which is object
   * constancy doing the work no caption can do. It lasted 900ms in full motion
   * and 3s in reduced, and then the picture a reader looks at for the rest of
   * the session had no trace of a second hand having moved at all — only a
   * triangle sitting somewhere, which is a part, not an agent.
   *
   * So the trail has a resting form. A HOLLOW PAWL stands at the notch the rival
   * opened on and never leaves it, and a dashed rule runs from there to where
   * the rival's hand is now. Same iron, same two-places-one-object grammar, no
   * motion and no timer. The transient trail lands on top of this and then
   * lifts off it, which is the right relationship: the event is the loud form of
   * a fact that is always true.
   *
   * It is drawn OUTSIDE `pawl`, because `motion.js` transforms that group and
   * anything inside it would travel with the hand it exists to contrast. --- */
  if (settlement.mode === 'contested'
      && settlement.rival.openedAt != null
      && settlement.rival.index > settlement.rival.openedAt) {
    const fromX = notchX(settlement.rival.openedAt, n);
    const nowX = notchX(settlement.rival.index, n);
    const midY = (WHEEL.pawlTop + WHEEL.pawlBottom) / 2;
    const came = layer(g, { class: 'db-rival-from' });
    el('path', {
      d: `M${fromX - 10} ${WHEEL.pawlBottom} L${fromX + 10} ${WHEEL.pawlBottom} ` +
         `L${fromX} ${WHEEL.pawlTop} Z`,
      fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': 1.4,
      'stroke-dasharray': '4 3', opacity: 0.75,
    }, came);
    el('path', {
      d: `M${fromX + 12} ${midY} L${nowX - 12} ${midY}`,
      fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': 1.4,
      'stroke-dasharray': '4 3', opacity: 0.75,
    }, came);
    el('path', {
      d: `M${nowX - 19} ${midY - 5} L${nowX - 12} ${midY} L${nowX - 19} ${midY + 5} Z`,
      fill: STRUCTURE.stroke, opacity: 0.75,
    }, came);
    titled(came, `The rival's hand opened at ` +
      `${(settlement.rival.openedAtShare * 100).toFixed(1)} per cent. The dashed outline is where ` +
      'it stood then. It moved itself from there to here.');
  }

  const pawl = layer(g, { class: 'db-pawl' });
  /* `pawlAtIndex` draws the pawl where it WAS, so `motion.js`'s TRAVERSE can
   * carry it to where it is. The verb is the whole message here: a reader who
   * has learned that CRANK means "you did that" sees a different verb the
   * moment something else moves the wheel. */
  const pawlIndex = pawlAtIndex != null ? pawlAtIndex
    : (settlement.mode === 'contested'
      ? settlement.rival.index
      : notches.findIndex((x) => x.whose === 'rival-ceiling'));
  const pawlX = notchX(pawlIndex, n);
  el('path', {
    d: `M${pawlX - 10} ${WHEEL.pawlBottom} L${pawlX + 10} ${WHEEL.pawlBottom} ` +
       `L${pawlX} ${WHEEL.pawlTop} Z`,
    fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': 2.2,
  }, pawl);
  el('path', {
    d: `M${pawlX - 16} ${WHEEL.pawlBottom} L${pawlX + 16} ${WHEEL.pawlBottom}`,
    stroke: STRUCTURE.stroke, 'stroke-width': 2.2,
  }, pawl);
  titled(pawl, settlement.mode === 'contested'
    ? `The rival's hand, standing at ${(settlement.rival.share * 100).toFixed(1)} per cent.`
    : 'The rival\'s hand is off the wheel. The disclosed series is what moves it here.');

  /* --- what just happened, and what kind of number the drum is sitting on.
   * A readout of the state, under the object, after the fact — not a caption
   * announcing the answer before the reader has touched anything. Wrapped,
   * because the notch sentence carries the denominator now and a sentence that
   * runs off the right-hand edge of the object the reader is holding is a
   * sentence nobody reads the end of. --- */
  const said = `${settlementPhrase(settlement)}.`;
  const lines = wrapLabel(g, said[0].toUpperCase() + said.slice(1), 8, WHEEL.saidY,
    WHEEL.width - 24, 'chrome', { size: 12, unitsPerChar: 7.6, lineHeight: 15 });
  const notchSaid = `${notchPhrase(settlement)}.`;
  wrapLabel(g, notchSaid[0].toUpperCase() + notchSaid.slice(1), 8, WHEEL.saidY + 15 * lines + 6,
    WHEEL.width - 24, 'chrome', { size: 11, unitsPerChar: 7.0, lineHeight: 14 });

  if (live) attachDrumControl(svg, host, settlement, onTurn);
  if (focus && live && typeof svg.focus === 'function') svg.focus({ preventScroll: true });

  return {
    svg, pawl, pointer, trailLayer, grip: pointer,
    live,
    heldTo,
    focus: () => { if (typeof svg.focus === 'function') svg.focus({ preventScroll: true }); },
    notchAt: (i) => ({ x: notchX(i, n), y: (WHEEL.pawlTop + WHEEL.pawlBottom) / 2 }),
    pawlAt: (i) => ({ x: notchX(i, n), y: (WHEEL.pawlTop + WHEEL.pawlBottom) / 2 }),
  };
}

/**
 * THE GESTURE, AND WHY IT IS BOUND TO `document` RATHER THAN TO THE SVG.
 *
 * Every notch the drag crosses turns the wheel, which repaints the bench and
 * replaces this svg. Listeners on the element would be torn off mid-gesture and
 * the drum would come loose in the reader's hand at exactly the moment the
 * rival pushed back — the one moment the whole component exists for. So the
 * move and release listeners go on `document` for the length of the drag, and
 * each move re-reads the live drum out of `host`.
 */
function attachDrumControl(svg, host, settlement, onTurn) {
  const count = settlement.notches.length;
  /* The live drum, re-resolved on every move. `host` has to STAY IN THE
   * DOCUMENT across repaints for this to work, which is why `bench.js` keeps
   * one wheel host and empties it rather than building a new one: a detached
   * host measures zero wide, and a drag that measures zero silently stops
   * turning — the drum coming loose in the reader's hand on the first notch
   * they cross. */
  const liveDrum = () => {
    const inHost = host && host.isConnected ? host.querySelector('svg.db-wheel') : null;
    if (inHost) return inHost;
    return svg.isConnected ? svg : null;
  };
  const askFrom = (clientX) => {
    const node = liveDrum();
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    if (!rect.width) return null;
    const x = ((clientX - rect.left) / rect.width) * WHEEL.width;
    return notchAtX(x, count);
  };

  svg.addEventListener('pointerdown', (event) => {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    if (typeof svg.focus === 'function') svg.focus({ preventScroll: true });
    if (host.__doorDrag) return;
    let lastAsked = null;
    const move = (e) => {
      const asked = askFrom(e.clientX);
      if (asked == null || asked === lastAsked) return;
      lastAsked = asked;
      onTurn(asked);
    };
    const stop = () => {
      host.__doorDrag = null;
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', stop);
      document.removeEventListener('pointercancel', stop);
    };
    host.__doorDrag = stop;
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', stop);
    document.addEventListener('pointercancel', stop);
    move(event);
  });

  svg.addEventListener('keydown', (event) => {
    const at = settlement.index;
    let asked = null;
    switch (event.key) {
      case 'ArrowRight': case 'ArrowUp': case 'PageUp': asked = at + 1; break;
      case 'ArrowLeft': case 'ArrowDown': case 'PageDown': asked = at - 1; break;
      case 'Home': asked = 0; break;
      case 'End': asked = count - 1; break;
      default: return;
    }
    event.preventDefault();
    onTurn(Math.max(0, Math.min(count - 1, asked)));
  });
}

/** Where a share off the filed series sits along the drum, between the notches. */
function positionOfShare(share, notches) {
  const lo = notches[0].value;
  const hi = notches[notches.length - 1].value;
  if (hi === lo) return 0.5;
  return Math.min(1, Math.max(0, (share - lo) / (hi - lo)));
}

/* ------------------------------------------------------------------ *
 * 3 · THE SECOND FORM: BARS ON ONE BASELINE
 *
 * Filed dollars, and quantities the record will not let us draw as a point.
 *
 * A SPAN BAR HAS NO CAP AT ITS MIDDLE. Where the record's 80% interval is wider
 * than 60% of its own central value the bar is drawn as a range with both ends
 * ticked and nothing between them — the same refusal `charts/svg-kit.js`'s
 * `spanMark` makes, applied to a bar. `mech-aol-001` is the famous $100m
 * guarantee and it is one of these: the most-quoted number in this whole story
 * is undrawable as a point.
 * ------------------------------------------------------------------ */

export const BARS = Object.freeze({
  width: 940, height: 460, base: 320, top: 66, left: 62, barW: 96, gap: 68,
});

export function drawBars(host, model, alt) {
  assertPlan(model, 'bars', 'drawBars');
  const svg = svgRoot(host, { width: BARS.width, height: BARS.height, alt, className: 'db-bars' });
  assertDoorColourBudget(svg);
  const g = layer(svg, { class: 'db-bars-body' });
  const take = takePaint(svg);
  const span = BARS.base - BARS.top;
  const max = model.max;
  if (!(max > 0)) throw new DoorDrawingError('a bar board needs a positive top of scale.', model);
  const y = (v) => BARS.base - (Math.max(0, v) / max) * span;

  rule(g, {
    x1: BARS.left - 14, y1: BARS.base, x2: BARS.width - 30, y2: BARS.base,
    color: STRUCTURE.stroke, width: STRUCTURE.width,
  });
  /* THE UNIT SITS AT THE TOP, not under the labels. Every bar names its own
   * base underneath it, and a shared unit line down there would read as a
   * shared base — which on this board is exactly the false claim. */
  text(g, {
    x: BARS.width - 30, y: BARS.base - 8, value: model.unit, role: 'chrome',
    fill: STRUCTURE.label, size: 11, anchor: 'end',
  });

  model.bars.forEach((bar, i) => {
    const x = BARS.left + i * (BARS.barW + BARS.gap);
    const group = layer(g, { class: 'db-bar' });
    const paint = bar.role === 'take'
      ? { fill: take.fill, stroke: take.stroke, 'stroke-width': take['stroke-width'] }
      : bar.role === 'mechanism'
        ? { fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': STRUCTURE.width }
        : { ...PAINT.money.attrs, stroke: STRUCTURE.stroke, 'stroke-width': 1 };

    if (bar.kind === 'span') {
      /* NO CENTRAL. Both ends ticked, and the mark IS the range. */
      const yLo = y(bar.lo);
      const yHi = y(bar.hi);
      el('rect', {
        x: x + 1.5, y: Math.min(yLo, yHi), width: BARS.barW - 3, height: Math.abs(yLo - yHi),
        fill: paint.fill && paint.fill !== 'none' ? paint.fill : 'none',
        'fill-opacity': 0.4, stroke: paint.stroke, 'stroke-width': 1.4,
      }, group);
      for (const yy of [yLo, yHi]) {
        el('line', {
          x1: x - 8, y1: yy, x2: x + BARS.barW + 8, y2: yy,
          stroke: paint.stroke, 'stroke-width': 2,
        }, group);
      }
      text(group, {
        x: x + BARS.barW / 2, y: Math.min(yLo, yHi) - 10, value: bar.figureText,
        role: 'numeral', fill: STRUCTURE.label, anchor: 'middle', size: 14,
      });
      titled(group, `${bar.label}: ${bar.figureText}. This reading has no middle value — the ` +
        'record\'s range is wider than the rule allows a point to stand for.');
    } else {
      el('rect', {
        x: x + 1.5, y: y(bar.value), width: BARS.barW - 3, height: BARS.base - y(bar.value),
        ...paint,
      }, group);
      text(group, {
        x: x + BARS.barW / 2, y: y(bar.value) - 10, value: bar.figureText,
        role: 'numeral', fill: STRUCTURE.label, anchor: 'middle', size: 14,
      });
      titled(group, `${bar.label}: ${bar.figureText}${bar.basis ? `, ${bar.basis}` : ''}.`);
    }

    /* EVERY BAR NAMES ITS OWN BASE, on the bar. The record quotes one numerator
     * over three denominators and calls all three correct; a row of bars with
     * one shared caption is how those become one number that is wrong twice. */
    const width = BARS.barW + BARS.gap - 14;
    const lines = wrapLabel(group, bar.label, x, BARS.base + 18, width, 'label');
    if (bar.basis) wrapLabel(group, bar.basis, x, BARS.base + 22 + 14 * lines, width, 'chrome');
  });
  if (model.note) wrapLabel(g, model.note, BARS.left - 14, 26, BARS.width - BARS.left - 30, 'chrome');
  return svg;
}

/**
 * Wrap a caption to a column width and return how many lines it took.
 *
 * The label role is uppercase Instrument Sans with 0.08em tracking, so it eats
 * about eight units a character where chrome eats about five and a half. One
 * `per` for both roles is how a three-line label ran into the caption under it.
 */
function wrapLabel(parent, value, x, y, width, role, options = {}) {
  /* `unitsPerChar` is an override because one estimate does not cover two type
   * sizes. The wheel's readout runs at 11 and 12 units, where the estimate for
   * a 10-unit chrome line is optimistic by a fifth — and the notch sentence, at
   * 1,011 units on a 940-unit drawing, was running off the right-hand edge of
   * the one object on this bench the reader is holding. */
  const size = options.size || 10;
  const unitsPerChar = options.unitsPerChar || (role === 'label' ? 7.4 : 5.6);
  const lineHeight = options.lineHeight || (role === 'label' ? 14 : 13);
  const per = Math.max(8, Math.floor(width / unitsPerChar));
  const words = String(value).split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > per) { if (line) lines.push(line); line = word; }
    else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => text(parent, {
    x, y: y + i * lineHeight, value: l, role,
    fill: STRUCTURE.label, size,
  }));
  return lines.length;
}

/* ------------------------------------------------------------------ *
 * 4 · THE THIRD FORM: THE EXPOSURE CURVE, AS A BAND WITH NO MIDDLE
 *
 * `max(0, G - s·R)` against cumulative partner revenue. G is the reported
 * guarantee, and the record's 80% interval on it runs $75m to $150m on a
 * central of $100m — a ratio of 0.75, well over the 60% cut. So the curve is
 * drawn TWICE, once at each end of the interval, and the space between them is
 * filled. There is no third line down the middle, because the middle is the
 * mark this project refuses to draw.
 *
 * The record's own arithmetic runs at $100m and its stored steps are printed in
 * the ledger with that said out loud. The drawing never puts a mark there.
 * ------------------------------------------------------------------ */

export const CURVE = Object.freeze({
  width: 940, height: 400, left: 92, right: 40, top: 44, bottom: 84,
});

export function drawCurve(host, model, alt) {
  assertPlan(model, 'curve', 'drawCurve');
  const svg = svgRoot(host, { width: CURVE.width, height: CURVE.height, alt, className: 'db-curve' });
  assertDoorColourBudget(svg);
  const g = layer(svg, { class: 'db-curve-body' });
  const x0 = CURVE.left;
  const x1 = CURVE.width - CURVE.right;
  const y0 = CURVE.height - CURVE.bottom;
  const y1 = CURVE.top;
  const sx = (v) => x0 + ((v - model.x.min) / (model.x.max - model.x.min)) * (x1 - x0);
  const sy = (v) => y0 - ((v - model.y.min) / (model.y.max - model.y.min)) * (y0 - y1);

  rule(g, { x1: x0, y1: y0, x2: x1, y2: y0, color: STRUCTURE.guide });
  rule(g, { x1: x0, y1: y0, x2: x0, y2: y1, color: STRUCTURE.guide });
  text(g, { x: x0, y: y0 + 46, value: model.x.label, role: 'chrome', fill: STRUCTURE.label, size: 11 });
  const ylab = text(g, { x: 0, y: 0, value: model.y.label, role: 'chrome', fill: STRUCTURE.label, size: 11 });
  ylab.setAttribute('transform', `translate(${x0 - 56} ${(y0 + y1) / 2}) rotate(-90)`);
  ylab.setAttribute('text-anchor', 'middle');

  const pts = (rows) => rows.map(([a, b]) => [sx(a), sy(b)]);
  const lo = pts(model.bandLo);
  const hi = pts(model.bandHi);
  const d = `${hi.map(([a, b], i) => `${i === 0 ? 'M' : 'L'}${a.toFixed(2)} ${b.toFixed(2)}`).join(' ')} ` +
    `${[...lo].reverse().map(([a, b]) => `L${a.toFixed(2)} ${b.toFixed(2)}`).join(' ')} Z`;
  el('path', { d, fill: PAINT.money.attrs.fill, 'fill-opacity': 0.16, stroke: 'none' }, g);
  for (const path of [lo, hi]) {
    el('path', {
      d: path.map(([a, b], i) => `${i === 0 ? 'M' : 'L'}${a.toFixed(2)} ${b.toFixed(2)}`).join(' '),
      fill: 'none', stroke: PAINT.money.attrs.fill, 'stroke-width': 2,
    }, g);
  }
  titled(g, 'The exposure runs between two curves and there is no line down the middle. The ' +
    'reported guarantee is a range, not a number.');

  for (const mark of model.marks || []) {
    el('circle', { cx: sx(mark.x), cy: sy(mark.y), r: 4.4, ...PAINT.money.attrs }, g);
    el('circle', { cx: sx(mark.x), cy: sy(mark.y), r: 4.4, fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': 1 }, g);
    text(g, {
      x: sx(mark.x) + 8, y: sy(mark.y) - 8, value: mark.label, role: 'chrome',
      fill: STRUCTURE.label, size: 11,
    });
  }
  if (model.cursor != null) {
    el('line', {
      x1: sx(model.cursor.x), y1: y1, x2: sx(model.cursor.x), y2: y0,
      stroke: STRUCTURE.stroke, 'stroke-width': 2,
    }, g);
    text(g, {
      x: sx(model.cursor.x) + 6, y: y1 + 14, value: model.cursor.label, role: 'chrome',
      fill: STRUCTURE.label, size: 11,
    });
  }
  if (model.note) wrapLabel(g, model.note, x0, 20, CURVE.width - x0 - CURVE.right, 'chrome');
  return svg;
}

/* ------------------------------------------------------------------ *
 * 5 · THE PLAIN-ENGLISH SENTENCE FOR THE MACHINE
 * ------------------------------------------------------------------ */

/**
 * `DESIGN.md` requires a readable sentence for every visual, driving a
 * text-only path. The authored ones belong to the data layer and to team B8;
 * until they land this bench generates its own from the same numbers the
 * drawing draws, and every SVG is stamped `data-alt-source="generated-by-chart"`
 * by `svgRoot`, which is how B8 finds them all.
 */
export function machineAlt(model) {
  assertPlan(model, 'machine', 'machineAlt');
  const pc = (v) => `${(v * 100).toFixed(1)}%`;
  /* THE SPOKEN SENTENCE SAYS WHAT THE SHUT DOOR MEANS HERE, for the same reason
   * the drawing's own title does: "the lower lane is empty" beside three full
   * cups of that lane's dollar is two facts off one object. */
  const door = model.door.to === 'buyer'
    ? 'The door is open to the buyer.'
    : `The door has swung away from the buyer and the lower lane is empty. ${model.door.note}`;
  return `Two lanes run into one auction. The upper lane carries searches that start on the ` +
    `buyer's own page; the lower lane comes in through a door. ${door} ` +
    `Of every dollar on the ${model.side === 'owned' ? 'upper' : 'lower'} lane, ` +
    `${pc(model.cups.outTheDoor.value)} goes back out through the door, ` +
    `${pc(model.cups.costToAnswer.value)} pays for answering the search, and ` +
    `${pc(model.cups.kept.value)} is what the buyer keeps. ` +
    `${model.cups.kept.value < 0 ? 'The last cup is below zero. ' : ''}` +
    `A stippled pipe runs back from the lower lane to the upper one: it is the one defence of ` +
    `this arrangement that nobody ever measured.`;
}

export default {
  drawMachine, drawWheel, drawBars, drawCurve, machineAlt, takePaint,
  planMachine, planBars, planCurve, assertPlan, notchAtX,
  assertDoorColourBudget, MACHINE, WHEEL, BARS, CURVE, DoorDrawingError,
};
