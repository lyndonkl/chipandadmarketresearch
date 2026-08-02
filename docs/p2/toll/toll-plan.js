/* docs/p2/toll/toll-plan.js — SEVEN ERA RECORDS IN, ONE SEALED PLATE SET OUT
 *
 * Team B6. No DOM in this file. Nothing here draws.
 *
 * THE LESSON THIS FILE IS BUILT ON, and it is the first of the seven this team
 * was handed: STRIP THE DATA THE RENDERER MUST NOT USE. A guard in a planning
 * pass does not protect a renderer that still holds the raw number. So this
 * module hands the renderer PIXELS, and it hands over only the pixels that
 * belong to a drawing the record supports:
 *
 *   - a row whose mark has no middle value carries NO `valveX` and no cup
 *     level. There is no key. The renderer's fill-the-cup branch cannot be
 *     reached for it.
 *   - a row whose figure counts what ARRIVED rather than what was taken carries
 *     NO `wedge` at all. There is no rust slice to draw, because the record
 *     does not say how much of the rest was a middleman's cut.
 *   - NO PLATE CARRIES A CUT FOR ITS ERA. Not a headline, not a share, not a
 *     total. The object "the cut in era 5" does not exist on this plan, for any
 *     era. That is what makes era 7's plate ordinary rather than a special case
 *     with a guard bolted to it.
 *
 * WHAT IS NOT ON THE PLAN, AND WHY THE LIST IS SHORT. There is no axis, no
 * domain and no shared baseline anywhere in this module, and — the repair this
 * round — NO SHARED SCALE EITHER. There are thirteen scales, one per base, and
 * a bar's size is derived from the base's own words rather than typed. Thirteen
 * readings on one ruler is the drawing this whole object exists to refuse, and
 * the way to refuse it is to build nothing it could be drawn from. A single
 * `BAR.width` was exactly such a thing.
 *
 * WHERE EACH NUMBER COMES FROM. Exactly the route `era-plan.js` takes: the era
 * file supplies the structure, `claims.json` supplies the claim (it is the only
 * copy carrying `verdict`), and `assertCopiesAgree` throws when the two
 * disagree. Three of the thirteen claims on this page carry a verdict of
 * "adjusted", so the verdict register is not decoration here.
 */

import * as guards from '../lib/guards.js';
import {
  planClaimMark, markReading, markFigure, markTitle,
  verdictRegister, verdictStamps, assertVerdictsVisible,
  definePlanner, planMarks,
} from '../charts/claim-marks.js';
import {
  formatterFor, assertCopiesAgree, assertNoRecordOnPlan, assertReadingsMatchMarks,
} from '../eras/era-plan.js';
import { ERA_COUNT, assertSevenEras, countWord } from '../eras/era-records.js';
import {
  PLATES, VISIBILITY, MEASURES, OUTSIDE_VISIBILITY, SHARE_DIVISOR,
  assertTollSelection, assertShareUnit, directionFromRecord,
} from './toll-records.js';

export class TollPlanError extends Error {
  constructor(message, detail) { super(message); this.name = 'TollPlanError'; this.detail = detail; }
}

/**
 * Every pixel this module puts on a plan, rounded the one way.
 *
 * It is here rather than at the draw site because `assertPixelsMatchMarks`
 * re-derives each of them from the row's own mark and compares for equality. A
 * plan that rounded one way and a guard that rounded another would disagree on
 * the last decimal and the guard would fail on honest work, which is how a real
 * check gets loosened until it stops checking.
 */
const N = (v) => Number(Number(v).toFixed(2));

/**
 * G8, declared once at the top of the module that reads it.
 *
 * Every row prints the year of its figure. This is the one line that says which
 * field that year comes from, and it throws on `as_of`. It runs at import, so
 * an edit that swaps the field cannot be merged with a page that still renders.
 */
export const TIME_FIELD = guards.assertTimeField(guards.FACT_FIELD, 'the toll plate\'s year');

/* ======================================================================
 * 1 · GEOMETRY — THIRTEEN DRAWINGS, THIRTEEN RULERS
 *
 * THIS IS THE REPAIR THE WHOLE OBJECT TURNS ON, so it is written out in full.
 *
 * Every bar used to be four hundred units long, and `pxOf` used to divide by a
 * hundred. ONE POINT OF A SHARE WAS THEREFORE FOUR PIXELS ON EVERY PLATE. That
 * is a shared scale. It does not stop being one because each bar sits in its
 * own `<svg>`, because the plates are indented down the page, or because a
 * sentence above them says they share no ruler. Fifteen drew as a sixty-pixel
 * block and thirty-one as a hundred-and-twenty-four-pixel block, on bars of one
 * length whose left edges differed by a fraction of a bar — and an eye reads
 * the second as twice the first, which is the conclusion this page exists to
 * refuse. Seven bars, one ruler, thirteen readings on it: a chart, assembled
 * out of uniform parts and handed to the reader through the mechanism.
 *
 * SO THERE IS NO BAR LENGTH IN THIS MODULE. There are thirteen of them, one per
 * BASE, and a base's drawn size comes from the base's own words:
 *
 *   - the same base always draws the same size;
 *   - no two bases ever draw the same size, because no two bases are the same
 *     thing — `assertBasesDistinct` is what makes that true, and this
 *     derivation is what makes it visible;
 *   - THE SIZE IS AN IDENTITY AND NOT A QUANTITY. It measures nothing. It is
 *     not how much money passes through the base — the record does not carry
 *     that for any of the thirteen — and nothing on this page reads it.
 *
 * What follows is that one point of a share is worth a different number of
 * pixels on every plate, from 1.68 on the shortest base to 4.68 on the longest.
 * Two slices on two plates cannot be measured against each other, and the drawn
 * order of two figures is not their recorded order. `assertNoSharedRuler`
 * PROVES that on the live record rather than promising it: it finds the pairs
 * the drawing puts in the wrong order and fails if there are none, which is
 * what a page drifting back towards one scale would look like.
 *
 * NOTHING IS LOST INSIDE ONE DRAWING. The bar is the whole of that base, the
 * painted slice is its true share of that whole, and the figure is printed in
 * words beside it. What is gone is the free comparison the eye used to make
 * across two drawings, which the record never supported.
 * ====================================================================== */

export const VIEW = Object.freeze({ width: 700, height: 172 });

/**
 * THE BAND EVERY BAR IS DRAWN INSIDE. Note what is not here: a bar length.
 *
 * `leftmost` leaves room for the inlet bracket and its printed leader;
 * `rightmost` leaves room for the spout, the word beside it and the year.
 */
export const BAR = Object.freeze({
  y: 30,
  shortest: 168,
  longest: 468,
  thinnest: 12,
  thickest: 24,
  leftmost: 96,
  rightmost: 640,
  /* How far apart two bars must begin, and end, before they count as being in
   * different places. Not zero: two edges a pixel apart are one edge to a
   * reader, and this page is an argument about what a reader gets for free. */
  apart: 4,
});

export const CUP = Object.freeze({
  y: 76,
  height: 48,
  width: 104,
  /* The pool is the same depth in every drawing on the page. It says the valve
   * diverted something; it does not say how much. See `planRow`. */
  poolDepth: 16,
});

/**
 * A stable digest of one base's own words. FNV-1a, salted per channel.
 *
 * It is here so that a base's drawn size is a fact about that base and nothing
 * else: it does not move when a claim is repaired, it does not move when the
 * plates are reordered, and it cannot be nudged by hand at a draw site without
 * `assertPixelsMatchMarks` catching it on the next re-entry.
 */
function digest(value, salt) {
  const s = `${salt} ${String(value)}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Each base's place in one channel's order. Ties break on the base's own text. */
function rankBy(units, salt) {
  const order = units
    .map((unit) => ({ unit, d: digest(unit, salt) }))
    .sort((a, b) => (a.d - b.d) || (a.unit < b.unit ? -1 : 1));
  const out = new Map();
  order.forEach((o, rank) => out.set(o.unit, rank));
  return out;
}

/**
 * THE THIRTEEN BARS, EACH ONE A DIFFERENT OBJECT.
 *
 * Three independent channels — how long, how thick, where it begins — so that
 * no two bars share a length, a thickness, an origin or a right-hand edge. A
 * reader cannot run an eye down a column of slice ends, because there is no
 * column: there are thirteen drawings of thirteen different things.
 *
 * Pure, and a function of the base list alone, so `revalidateToll` recomputes
 * every pixel on the plan from the plan's own `bases` and compares.
 */
export function baseGeometry(units, context) {
  const list = (units || []).map((u) => String(u));
  if (new Set(list).size !== list.length) {
    throw new TollPlanError(
      `${context || 'this plate set'} hands the geometry two bases that are the same string. Every ` +
      'drawn size on this page is an identity: two bases with one size would be two different ' +
      'things drawn as one, which is the whole failure this derivation exists to prevent.',
      list,
    );
  }
  const n = list.length;
  if (n < 2) {
    throw new TollPlanError(
      `${context || 'this plate set'} carries ${n} base(s). This derivation spreads the bases ` +
      'across a band, and a band with one thing in it has no spread to check.',
      n,
    );
  }
  const spread = (rank, lo, hi) => Math.round(lo + ((hi - lo) * rank) / (n - 1));
  const long = rankBy(list, 'how long this base is drawn');
  const thick = rankBy(list, 'how thick this base is drawn');
  const start = rankBy(list, 'where this base begins');

  /* Two bars may not begin at one x or end at one x, and two bars a pixel apart
   * are at one x as far as an eye is concerned — so the gap is `BAR.apart`
   * rather than "different". A base that lands on a taken edge is walked off it
   * one pixel at a time, outwards from where its own digest put it and never
   * past the band. The walk is deterministic, so the same thirteen bases always
   * draw the same thirteen bars; a base that cannot be placed at all is a throw
   * rather than a second bar sharing an edge. */
  const takenX = [];
  const takenRight = [];
  const clear = (list, v) => list.every((u) => Math.abs(u - v) >= BAR.apart);
  const place = (unit, want, room, width) => {
    for (let step = 0; step <= room; step += 1) {
      for (const x of (step === 0 ? [want] : [want + step, want - step])) {
        if (x < BAR.leftmost || x > BAR.leftmost + room) continue;
        if (!clear(takenX, x) || !clear(takenRight, x + width)) continue;
        takenX.push(x);
        takenRight.push(x + width);
        return x;
      }
    }
    throw new TollPlanError(
      `${context || 'this plate set'} cannot place the bar for "${unit}" without sharing an edge ` +
      'with another base. Every drawn edge on this page belongs to one base, so there is nowhere ' +
      'left to put this one and the band it is drawn inside needs widening.',
      { unit, want, room, width },
    );
  };

  const out = new Map();
  /* Placed in the derivation's own order rather than the page's, so the drawing
   * does not move when the plates are reordered. */
  for (const unit of [...list].sort((a, b) => start.get(a) - start.get(b))) {
    const width = spread(long.get(unit), BAR.shortest, BAR.longest);
    const room = BAR.rightmost - BAR.leftmost - width;
    if (room < 0) {
      throw new TollPlanError(
        `${context || 'this plate set'}: a bar ${width} wide does not fit between ${BAR.leftmost} ` +
        `and ${BAR.rightmost}, which is the drawable band inside a ${VIEW.width}-unit drawing.`,
        { unit, width },
      );
    }
    out.set(unit, Object.freeze({
      x: place(unit, BAR.leftmost + Math.round((room * start.get(unit)) / (n - 1)), room, width),
      y: BAR.y,
      width,
      height: spread(thick.get(unit), BAR.thinnest, BAR.thickest),
    }));
  }
  assertGeometryDistinct(out, context);
  return out;
}

/**
 * THROWING FORM. No two bases are drawn as the same object.
 *
 * "The same" is `BAR.apart` pixels, not zero. Two bars four pixels apart on a
 * seven-hundred-unit drawing begin at the same place as far as an eye is
 * concerned, and this page's whole argument is about what an eye does for free.
 */
export function assertGeometryDistinct(geometry, context) {
  const bars = [...geometry].map(([unit, bar]) => ({ unit, bar }));
  const clash = [];
  const of = { x: (b) => b.x, width: (b) => b.width, right: (b) => b.x + b.width };
  for (let i = 0; i < bars.length; i += 1) {
    for (let j = i + 1; j < bars.length; j += 1) {
      for (const channel of Object.keys(of)) {
        const a = of[channel](bars[i].bar);
        const b = of[channel](bars[j].bar);
        if (Math.abs(a - b) < BAR.apart) {
          clash.push(`"${bars[i].unit}" and "${bars[j].unit}" are ${Math.abs(a - b)} apart on ` +
            `${channel} (${a} and ${b})`);
        }
      }
    }
  }
  if (clash.length) {
    throw new TollPlanError(
      `${context || 'this plate set'} draws ${clash.length} pair(s) of bases as the same object: ` +
      `${clash.join('; ')}. Two bars that begin together, end together or run the same length are ` +
      'two readings a ruler can carry between, and this page has no ruler to lend.',
      clash,
    );
  }
  return true;
}

/* ======================================================================
 * 2 · ONE ROW
 * ====================================================================== */

function claimFor(id, eraRecord, field, claimsFile, where) {
  const group = eraRecord.fields && eraRecord.fields[field];
  const eraCopy = ((group && group.claims) || []).find((c) => c.id === id);
  if (!eraCopy) {
    throw new TollPlanError(
      `${where}: ${id} is not in era ${eraRecord.era}'s ${field} field. The plate set reads its ` +
      'structure from the era file and its claim from the frozen record, so a toll that names a ' +
      'claim the era file does not hold has lost one of its two copies.',
      { id, field, era: eraRecord.era },
    );
  }
  const file = claimsFile || guards.getFrozen('claims');
  const list = Array.isArray(file) ? file : (file && file.claims);
  const canonical = (list || []).find((c) => c.id === id);
  if (!canonical) {
    throw new TollPlanError(
      `${where}: ${id} is in the era file and not in claims.json, so this plate cannot read its ` +
      'verdict. It will not fall back to the era file\'s copy: three of the claims on this page ' +
      'were changed after they were written, and a claim with no verdict draws with no correction ' +
      'beside it.',
      id,
    );
  }
  assertCopiesAgree(eraCopy, canonical, where);
  return canonical;
}

/**
 * A share of a bar, in pixels, from a value in the claim's own units.
 *
 * This is a unit conversion and not a derivation: it is applied to the central,
 * the low and the high alike, which is why `planClaimMark` can promise the
 * interval ratio — and therefore G1's answer — is unchanged by it.
 */
function pxOf(value, barWidth) {
  return (value / SHARE_DIVISOR) * barWidth;
}

/**
 * WHICH SHAPE EACH KIND OF FIGURE IS ALLOWED TO BE DRAWN AS.
 *
 * Three measures, three drawn objects, and no row carries two of them. The
 * middle row is a repair: a figure a middleman PAID OUT used to be drawn with
 * the take's own apparatus — a rust wedge off the left of the bar, a valve, a
 * pipe and a rust pool in the cup — with the row text saying the valve took it.
 * Money leaving drawn as money taken inverts the finding, and the two rows it
 * happened to are the two that carry the largest figures on the page.
 *
 * So a `paid` row has NO wedge, NO valve and NO CUP AT ALL. The share sits at
 * the far end of the bar, against the outlet, and a pipe carries it out of the
 * drawing to somebody else's books.
 *
 * WHICH OF THE THREE A ROW GETS IS NOT A CHOICE ANY CALLER MAKES. It comes from
 * `directionFromRecord`, off the claim's own unit and the head of its
 * statement. That is the repair this round is named after: the first version of
 * the fix above gave a payout its own drawing and then took the word "paid"
 * from a build file, so one edited word put the take's apparatus back on it —
 * and the pixel guard below re-derived every length from the same word and
 * agreed. A drawn direction that follows a label follows whoever edits the
 * label.
 */
export const SHAPES = Object.freeze({
  kept: Object.freeze({ part: 'wedge', middle: 'valveX', fromRight: false, cup: true }),
  paid: Object.freeze({ part: 'handover', middle: 'divideX', fromRight: true, cup: false }),
  arrived: Object.freeze({ part: 'arrival', middle: 'edgeX', fromRight: true, cup: true }),
});

/**
 * What a cup on this page is allowed to say it holds. Never how much.
 *
 * `null` means this measure has no cup at all. One function, read by the
 * planner and by the guard, so the two cannot answer it differently.
 */
export function cupHolds(measures, isPoint) {
  const shape = SHAPES[measures];
  if (!shape || !shape.cup) return null;
  if (measures === 'arrived') return 'nothing';
  return isPoint ? 'a measured amount' : 'a range';
}

/**
 * The printed sentence that says the drawing's direction was not chosen here.
 *
 * It names the field of the record that settled it and quotes the record's own
 * words back. It is on the page and in the row's accessible name, because a
 * derivation the reader cannot see is a label with more steps in front of it.
 */
export function directionSentence(direction) {
  return `The plate draws it that way because the record's own ${direction.from} says ` +
    `"${direction.phrase}". Nothing on this page chooses which way a middleman's money went.`;
}

function planRow(plate, toll, eraRecord, { register, claimsFile, geometry }) {
  const where = `the era ${plate.era} toll plate · ${toll.id}`;
  const claim = claimFor(toll.id, eraRecord, toll.field, claimsFile, where);
  assertShareUnit(claim.unit, where);

  /* G8. `timelineYear` is the only supported way to a year, and it is called
   * only where the record gives permission. None of the thirteen claims on this
   * page is withheld today; the branch is here because "no claim is withheld
   * today" is a fact about today. */
  const drawable = guards.isTimelineDrawable(claim);
  const year = drawable ? guards.timelineYear(claim, where) : null;

  const format = formatterFor(claim.unit);
  const label = toll.field;
  const mark = planClaimMark(claim, {
    year, label, register, format,
    extra: { organField: label },
  });

  /* `short` is what fits under a cup. A point mark prints its central. A
   * span-only mark prints its two ends and nothing between them. There is no
   * midpoint here and no helper in this folder that would build one. */
  const short = mark.kind === 'point'
    ? format(mark.central)
    : `${format(mark.lo)}–${format(mark.hi)}`;

  /* THE BAR IS THE BASE, AND THE BASE IS WHAT DIFFERS. Its size comes from the
   * base's own words through `baseGeometry`, never from this claim's value and
   * never from a constant in this file. One point of this share is worth
   * `bar.width / SHARE_DIVISOR` pixels HERE and a different number of pixels on
   * every other plate. */
  /* WHICH WAY THE MONEY WENT, OFF THE RECORD, NEVER OFF THE TOLL. `toll` has no
   * field for it and `assertTollSelection` refuses one. This throws rather than
   * choosing when the record does not distinguish, which stops the page — see
   * the note on refusal in `toll-records.js` section 2b. */
  const direction = directionFromRecord(claim, where);
  const measures = direction.measures;
  const shape = SHAPES[measures];
  if (!shape) {
    throw new TollPlanError(
      `${where} derives "${measures}", and this module draws three things: what a middleman ` +
      'kept, what one seller handed to another, and what reached the far end. They are three ' +
      'different drawings, so a fourth measure has no shape to be drawn in.',
      direction,
    );
  }
  const bar = geometry.get(claim.unit);
  if (!bar) {
    throw new TollPlanError(
      `${where}: the geometry carries no bar for the base "${claim.unit}". Every drawn size on ` +
      'this page is derived from the base list the plan is built from, so a base missing from it ' +
      'is a row with no drawing rather than a row drawn at a default size.',
      claim.unit,
    );
  }

  /* From the left for a cut taken out of the bar; from the right for money
   * leaving the far end, whether it was handed on or whether it arrived. */
  const fromLeft = (value) => N(bar.x + pxOf(value, bar.width));
  const fromRight = (value) => N(bar.x + bar.width - pxOf(value, bar.width));
  const at = shape.fromRight ? fromRight : fromLeft;
  if (pxOf(mark.hi, bar.width) > bar.width) {
    throw new TollPlanError(
      `${where} reads ${mark.hi} on a unit this page draws as a share of one base, and that is ` +
      'more than the whole base. A slice longer than its own bar is a drawing the record does not ' +
      'support, whichever number is wrong.',
      { id: claim.id, hi: mark.hi, unit: claim.unit },
    );
  }
  const cupFloor = CUP.y + CUP.height;
  const holds = cupHolds(measures, mark.kind === 'point');

  const row = {
    id: claim.id,
    era: plate.era,
    field: toll.field,
    mark,
    unit: claim.unit,
    year: mark.year ?? null,
    verdict: mark.verdict,
    grade: claim.grade || null,
    form: mark.kind === 'point' ? 'point' : 'span',
    short,
    reading: markReading(mark, format),
    figure: markFigure(mark, format),
    title: markTitle(mark, { label, format, suffix: claim.unit || '' }),

    base: toll.base,
    why: toll.why,
    caveat: toll.caveat || null,
    counter: toll.counter,
    visibility: toll.visibility,
    visibilityForm: VISIBILITY[toll.visibility].form,
    visibilitySentence: VISIBILITY[toll.visibility].sentence,
    measures,
    measuresTerm: MEASURES[measures].term,
    measuresLine: MEASURES[measures].line,
    /* WHICH FIELD OF THE RECORD SAID SO, AND IN WHICH WORDS. On the plan
     * because a derivation nobody can read is a label with extra steps:
     * `assertDirectionsFromRecord` re-derives both of these against the frozen
     * record at mint and on every re-entry, and the bench prints all thirteen. */
    measuresFrom: direction.from,
    measuresPhrase: direction.phrase,
    measuresWhy: directionSentence(direction),

    bar,
    unclosed: toll.unclosed
      ? Object.freeze({
        label: toll.unclosed.label,
        note: toll.unclosed.note,
        extent: 'the part of this money the study could not attribute to anyone',
      })
      : null,
  };

  /**
   * ONE PART KEY PER ROW, AND IT IS THE ONE ITS MEASURE NAMES.
   *
   *   kept      a wedge off the left of the bar, and a cup under the valve
   *   paid      a handover at the right of the bar, out through a pipe, NO CUP
   *   arrived   brass at the right of the bar, no rust anywhere, an empty cup
   *
   * `xAtLo` is the end of the part the record is SURE of and `xAtHi` is as far
   * as it could reach. The renderer paints the first and leaves the second
   * visibly unpainted, because a filled block is a quantity and the record does
   * not carry one between them.
   */
  const part = { xAtLo: at(mark.lo), xAtHi: at(mark.hi) };
  /* THE MIDDLE MARK IS THE ONE THING ONLY A MIDDLE VALUE CAN PLACE — the valve
   * on a cut, the divider on a handover, the brass edge on an arrival. On a
   * span-only row the key is never assigned, so the renderer's single branch
   * that places one cannot be reached from it. */
  if (mark.kind === 'point') part[shape.middle] = at(mark.central);
  row[shape.part] = Object.freeze(part);

  /**
   * THE CUP HOLDS NO QUANTITY, AND THAT IS A REPAIR.
   *
   * It used to fill to a level derived from the mark. Cups of one size, at one
   * place under seven bars, with seven levels in them, IS A SHARED SCALE — the
   * seven-bar chart rotated ninety degrees and dressed as apparatus. So the cup
   * pools to a fixed depth in every drawing, and what varies is only what the
   * record lets it hold at all.
   *
   * A `paid` row has no cup on the plan at all. Nothing was diverted into one:
   * the money went on to somebody else, and a vessel under that bar would say
   * this middleman was holding it.
   */
  if (shape.cup) {
    row.cup = Object.freeze({
      x: bar.x, y: CUP.y, width: CUP.width, height: CUP.height, floor: cupFloor,
      holds, open: !!toll.unclosed,
    });
  }

  /* The drawing's own plain-English sentence. DESIGN.md requires one of every
   * visual, and `svgRoot` refuses a drawing without it. */
  row.alt = rowAlt(row);
  return Object.freeze(row);
}

/**
 * The sentence a screen reader hears for one bar. Generated, never authored twice.
 *
 * IT SAYS THE SCALE IS LOCAL, in the same breath as the figure. A reader who
 * cannot see the drawing cannot see that the bars are different sizes either,
 * and the one thing this page must not let anybody do is set two of these
 * figures side by side as though they were measured the same way.
 */
export function rowAlt(row) {
  const parts = [`${row.base} The bar is that whole amount, drawn at its own size.`];
  if (row.measures === 'arrived') {
    parts.push(`The brass at the right is what reached the far end: ${row.figure}.`);
    parts.push('The plate draws no cut here, because the record does not say how much of the rest ' +
      'anybody took.');
  } else if (row.measures === 'paid') {
    parts.push(`${row.figure} of it leaves at the far end and goes on to somebody else, and a pipe ` +
      'carries it out of the drawing.');
    parts.push('There is no cup under this bar. This money was handed on, so none of it is a cut ' +
      'this middleman kept.');
  } else if (row.form === 'point') {
    parts.push(`The valve takes ${row.figure} out of it, and the cup below catches that.`);
  } else {
    parts.push('The record gives a range here, so there is no valve and the pool has no surface.');
    parts.push(`The plate paints the part the record is sure of and leaves the rest of the reach ` +
      `empty between two bars. The cut is ${row.figure}.`);
  }
  parts.push(`The unit is: ${row.unit}.`);
  parts.push(row.measuresWhy);
  parts.push('This drawing has its own scale. Nothing on it can be measured against another plate.');
  parts.push(row.visibilitySentence);
  if (row.unclosed) parts.push(`One block is stippled and named: ${row.unclosed.label.toLowerCase()}.`);
  return parts.join(' ');
}

/* ======================================================================
 * 3 · THE PLATE
 * ====================================================================== */

function plateAlt(plate, rows) {
  /* The count is `rows.length` put through `countWord`, never spelled. The
   * bench scans every plate's alt for the word in front of "bars" and fails on
   * one that is not the number of bars the plate actually holds. */
  return `Era ${plate.era}: ${plate.name}, ${plate.years}. ` +
    `This plate holds ${countWord(rows.length)} bar${rows.length === 1 ? '' : 's'}. ` +
    'Every bar is one whole starting amount, no two of them are the same thing, and no two of them ' +
    'are drawn the same size. ' +
    `${rows.map((r) => r.alt).join(' ')}`;
}

/**
 * THE GUARD SENTENCE ON THE LAST PLATE.
 *
 * Built from the plan rather than typed, so it names the first era by the
 * record's own name and counts its own rows. It is printed in the largest type
 * on that plate and `assertLastPlateGuard` refuses a plan without it.
 */
function lastPlateGuard(plate, rows, firstName) {
  const arrived = rows.filter((r) => r.measures === 'arrived');
  return `Do not read this plate against the first one. ${countWord(arrived.length)[0].toUpperCase()}` +
    `${countWord(arrived.length).slice(1)} of these figures count what reached the far end, not ` +
    `what anybody took, and what fails to arrive is not all middleman cut. None of them is a share ` +
    `of the advertiser's dollar measured the way the first plate on this page, ${firstName}, ` +
    'measures it.';
}

/* ======================================================================
 * 4 · THE INVARIANTS
 * ====================================================================== */

/**
 * Keys a plate or a row may never carry.
 *
 * Every one of them is a name for "this era's cut", and this page has no such
 * object. A reader who wants to know what the middleman took in era 5 has to
 * read a bar and the sentence above it, which is the whole design.
 */
export const FORBIDDEN_KEYS = Object.freeze([
  'cut', 'take', 'share', 'rate', 'percent', 'headline', 'total', 'sum', 'scale', 'axis', 'domain',
]);

/** THROWING FORM. No plate names a cut for its era, and no plan carries a scale. */
export function assertNoEraCut(plan, context) {
  const marks = new Set(planMarks(plan, context));
  const seen = new WeakSet();
  const hits = [];
  const visit = (value, path) => {
    if (value === null || typeof value !== 'object') return;
    if (marks.has(value)) return;
    if (seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) { value.forEach((v, i) => visit(v, `${path}[${i}]`)); return; }
    for (const key of Object.keys(value)) {
      if (FORBIDDEN_KEYS.includes(key)) hits.push(`${path}.${key}`);
      visit(value[key], `${path}.${key}`);
    }
  };
  visit(plan, 'plan');
  if (hits.length) {
    throw new TollPlanError(
      `${context || 'this plate set'} carries ${hits.length} key(s) that name a cut for a whole ` +
      `era, or a scale: ${hits.join(', ')}. Seven eras measured their cut on seven different ` +
      'bases. A field called "cut" on a plate is the seven-bar chart arriving one level down, ' +
      'where nothing on the page can see it.',
      hits,
    );
  }
  return true;
}

/**
 * THROWING FORM. Every row's drawn shape matches what its mark allows.
 *
 * Four rules, and each of them is a strip rather than a check: the key that
 * would let a renderer draw the wrong thing is absent, and this asserts that it
 * is still absent after the plan has been through a freeze and a re-entry.
 */
export function assertRowShapes(plan, context) {
  const bad = [];
  const partKeys = Object.values(SHAPES).map((s) => s.part);
  const middleKeys = Object.values(SHAPES).map((s) => s.middle);
  for (const plate of plan.plates) {
    for (const row of plate.rows) {
      const shape = SHAPES[row.measures];
      if (!shape) {
        bad.push(`${row.id}: measures "${row.measures}", which has no drawn shape`);
        continue;
      }
      /* ONE PART, AND IT IS THE ONE THE MEASURE NAMES. Written over the whole
       * vocabulary rather than as three hand-written pairs, so a fourth measure
       * added tomorrow is checked by the same three lines. */
      for (const key of partKeys) {
        if ((key in row) !== (key === shape.part)) {
          bad.push(`${row.id}: measures "${row.measures}" and ${key in row ? 'carries' : 'carries no'} ${key}`);
        }
      }
      const part = row[shape.part];
      const point = row.mark.kind === 'point';
      if (part) {
        for (const key of middleKeys) {
          const want = key === shape.middle && point;
          if ((key in part) !== want) {
            bad.push(`${row.id}: the mark is "${row.mark.kind}" and its ${shape.part} ` +
              `${key in part ? 'carries' : 'carries no'} ${key}`);
          }
        }
      }
      /* THE CUP CARRIES NO QUANTITY AT ALL, and a row that handed its money on
       * carries no cup. Cups of one size at one place with seven levels in them
       * would be a shared scale wearing apparatus, so there is no pixel on a cup
       * that came from a claim. What it says is which of three things the record
       * lets it hold. */
      const holds = cupHolds(row.measures, point);
      if ((row.cup != null) !== (holds != null)) {
        bad.push(`${row.id}: measures "${row.measures}" and ${row.cup ? 'carries a cup' : 'carries no cup'}`);
      }
      if (row.cup) {
        if (row.cup.holds !== holds) {
          bad.push(`${row.id}: the cup says it holds "${row.cup.holds}" and the record gives "${holds}"`);
        }
        for (const key of ['fillTop', 'bandTop', 'bandBottom', 'level']) {
          if (key in row.cup) bad.push(`${row.id}: the cup carries a level at "${key}"`);
        }
      }
    }
  }
  if (bad.length) {
    throw new TollPlanError(
      `${context || 'this plate set'} has ${bad.length} row(s) whose drawn shape does not match ` +
      `what the record allows: ${bad.join('; ')}. A span-only row has no valve because a ` +
      'span-only mark has no central. A row counting what arrived has no wedge because the record ' +
      'does not say what was taken. A row that handed its money on has no cup at all, because ' +
      'nothing under that bar was kept.',
      bad,
    );
  }
  return true;
}

/**
 * THROWING FORM. EVERY DRAWN LENGTH IS RE-DERIVED FROM THE MARK IT READS.
 *
 * THIS IS THE CHECK THE PAGE WAS MISSING, and the shape of what it missed is
 * worth writing down: `assertRowShapes` passed a plate whose valve was drawn at
 * the full width of the bar on a mark reading fifteen. It checked which KEYS
 * existed. It never checked what the numbers under them were, so every pixel on
 * this page was unverified — the bar's own size, the end of the painted slice,
 * the reach of the unpainted one, the place the valve sits.
 *
 * So this recomputes all of them, at mint and on every re-entry, exactly the
 * way `assertReadingsMatchMarks` recomputes every printed string:
 *
 *   - the bar, from the plan's own base list through `baseGeometry`;
 *   - `xAtLo`, `xAtHi` and the middle mark, from the row's own minted mark
 *     through `pxOf`, measured from the end the row's measure says.
 *
 * A pixel that disagrees with the mark beside it is a second copy of a number,
 * and every serious failure on this project has been a second copy of a number.
 */
export function assertPixelsMatchMarks(plan, context) {
  const geometry = baseGeometry(plan.bases, context);
  const bad = [];
  for (const plate of plan.plates) {
    for (const row of plate.rows) {
      const shape = SHAPES[row.measures];
      if (!shape) continue;                       // assertRowShapes owns that failure
      const want = geometry.get(row.unit);
      if (!want) {
        bad.push(`${row.id}: draws a base the plan's own list does not carry`);
        continue;
      }
      for (const key of ['x', 'y', 'width', 'height']) {
        if (row.bar[key] !== want[key]) {
          bad.push(`${row.id}: the bar's ${key} is ${row.bar[key]} and this base derives ${want[key]}`);
        }
      }
      const part = row[shape.part];
      if (!part) continue;
      const at = (value) => (shape.fromRight
        ? N(row.bar.x + row.bar.width - pxOf(value, row.bar.width))
        : N(row.bar.x + pxOf(value, row.bar.width)));
      const pixels = { xAtLo: at(row.mark.lo), xAtHi: at(row.mark.hi) };
      if (row.mark.kind === 'point') pixels[shape.middle] = at(row.mark.central);
      for (const key of Object.keys(pixels)) {
        if (part[key] !== pixels[key]) {
          bad.push(`${row.id}: ${shape.part}.${key} is drawn at ${part[key]} and its own mark ` +
            `puts it at ${pixels[key]}`);
        }
      }
      if (row.cup && row.cup.x !== row.bar.x) {
        bad.push(`${row.id}: the cup stands at ${row.cup.x} and its bar begins at ${row.bar.x}`);
      }
    }
  }
  if (bad.length) {
    throw new TollPlanError(
      `${context || 'this plate set'} draws ${bad.length} length(s) its own marks do not support: ` +
      `${bad.slice(0, 6).join('; ')}${bad.length > 6 ? ' …' : ''}. A drawn length is a printed ` +
      'figure the reader cannot check, so every one of them is re-derived from the mark beside it.',
      bad,
    );
  }
  return true;
}

/**
 * THROWING FORM. THERE IS NO RULER ON THIS PAGE, AND HERE IS THE PROOF.
 *
 * Four things, and the last one is the only one that is evidence rather than
 * arrangement:
 *
 *  1. no two bars run the same length, begin at the same place, or end at the
 *     same place;
 *  2. one point of a share is worth a different number of pixels on every
 *     drawing;
 *  3. the longest bar is at least twice the shortest, so a page drifting back
 *     towards one length is refused before it arrives;
 *  4. AND THE DRAWN ORDER IS NOT THE RECORDED ORDER. Somewhere on this page a
 *     larger figure is painted shorter than a smaller one. That is what it
 *     looks like when lengths carry no information, and it is the one thing a
 *     restored shared scale could not produce: on one ruler the drawn order is
 *     always the recorded order, so this check fails the moment the ruler
 *     comes back.
 *
 * If it ever fails on honest work the answer is not to loosen it. It means the
 * thirteen bases now happen to draw in their recorded order, and the drawing
 * would be teaching an order the record does not carry.
 */
export function assertNoSharedRuler(plan, context) {
  const where = context || 'this plate set';
  const rows = plan.plates.flatMap((p) => p.rows);
  if (rows.length < 2) {
    throw new TollPlanError(
      `${where} carries ${rows.length} row(s), so this check saw nothing. A page with one drawing ` +
      'on it cannot be read across, and cannot demonstrate that it cannot be read across either.',
      rows.length,
    );
  }

  /* Three channels, and no fourth for the pixels one point of a share is worth:
   * that is `width / SHARE_DIVISOR`, so a fourth line here could not fail
   * wherever the first one passed. A check that cannot fire is worse than no
   * check, because it reads like cover. What one point is worth on each plate
   * is reported below instead, where a reader can see the spread. */
  const of = {
    length: (r) => r.bar.width,
    origin: (r) => r.bar.x,
    end: (r) => r.bar.x + r.bar.width,
  };
  for (let i = 0; i < rows.length; i += 1) {
    for (let j = i + 1; j < rows.length; j += 1) {
      for (const channel of Object.keys(of)) {
        const a = of[channel](rows[i]);
        const b = of[channel](rows[j]);
        if (Math.abs(a - b) < BAR.apart) {
          throw new TollPlanError(
            `${where}: ${rows[i].id} and ${rows[j].id} share a ${channel} — ${a} and ${b}, which ` +
            `is inside the ${BAR.apart} pixels this page counts as one place. Two bars a reader ` +
            'can measure against each other are a shared scale, whatever the sentence above them ' +
            'says, and the seven eras on this page measured their cuts on seven different bases.',
            { channel, ids: [rows[i].id, rows[j].id], values: [a, b] },
          );
        }
      }
    }
  }

  const widths = rows.map((r) => r.bar.width);
  const ratio = Math.max(...widths) / Math.min(...widths);
  if (ratio < 2) {
    throw new TollPlanError(
      `${where} draws its longest bar ${ratio.toFixed(2)} times its shortest. A page whose bars ` +
      'are nearly one length is a page a reader will read across, because a small difference reads ' +
      'as a drawing error rather than as a different ruler.',
      { widths },
    );
  }

  /* THE EVIDENCE. Every row against every other, on the length the plate paints
   * and the value the mark reads. A pair the drawing puts in the wrong order is
   * a pair no ruler can carry between. */
  const drawn = rows.map((row) => ({
    id: row.id,
    value: row.mark.kind === 'point' ? row.mark.central : row.mark.lo,
    px: N(pxOf(row.mark.kind === 'point' ? row.mark.central : row.mark.lo, row.bar.width)),
  }));
  const inverted = [];
  for (const a of drawn) {
    for (const b of drawn) {
      if (a.id === b.id) continue;
      if (a.value > b.value && a.px < b.px) {
        inverted.push(`${a.id} reads ${a.value} and draws ${a.px}px; ${b.id} reads ${b.value} and ` +
          `draws ${b.px}px`);
      }
    }
  }
  if (!inverted.length) {
    throw new TollPlanError(
      `${where} draws all ${rows.length} of its figures in their recorded order. On thirteen ` +
      'different rulers that is a coincidence; on one ruler it is a guarantee — so this is what a ' +
      'shared scale looks like from the inside, and the page has either drifted back to one or the ' +
      'bases have moved. Do not loosen this check: a drawing whose lengths run in the record\'s ' +
      'order is teaching an order across bases the record does not carry.',
      drawn,
    );
  }
  return Object.freeze({
    inverted: Object.freeze(inverted),
    widthRatio: ratio,
    /* What one point of a share is worth, plate by plate. Reported rather than
     * checked, because it is the bar's own length divided by a hundred. */
    pointPx: Object.freeze(rows.map((r) => N(r.bar.width / SHARE_DIVISOR))),
  });
}

/** THROWING FORM. The last plate carries its own guard, and nothing else does. */
export function assertLastPlateGuard(plan, context) {
  const last = plan.plates[plan.plates.length - 1];
  const guarded = plan.plates.filter((p) => p.guardLine);
  if (guarded.length !== 1 || guarded[0] !== last) {
    throw new TollPlanError(
      `${context || 'this plate set'} puts the misreading guard on ${guarded.length} plate(s). It ` +
      'belongs on the last one and only there. The last plate is the one that can be read as the ' +
      'claim this page refuses to make, and a warning printed on all seven is a warning nobody reads.',
      guarded.map((p) => p.era),
    );
  }
  if (last.relation !== 'rival') {
    throw new TollPlanError(
      `${context || 'this plate set'}: the last plate is not the rival plate.`, last.relation,
    );
  }
  const open = [];
  for (const plate of plan.plates) for (const row of plate.rows) if (row.cup && row.cup.open) open.push(row.id);
  if (open.length !== 1) {
    throw new TollPlanError(
      `${context || 'this plate set'} draws ${open.length} cups that cannot be filled shut. There ` +
      'is one, on the last plate, and it is the one place the record names money nobody could ' +
      'attribute to anyone.',
      open,
    );
  }
  const arrived = last.rows.filter((r) => r.measures === 'arrived');
  for (const row of arrived) {
    for (const key of ['wedge', 'handover']) {
      if (key in row) {
        throw new TollPlanError(
          `${context || 'this plate set'}: ${row.id} counts an arrival and carries a ${key}.`, row.id,
        );
      }
    }
  }
  if (arrived.length < 2) {
    throw new TollPlanError(
      `${context || 'this plate set'}: the last plate carries ${arrived.length} arrival reading(s).`,
      arrived.length,
    );
  }
  return true;
}

/**
 * THROWING FORM. EVERY DRAWN DIRECTION IS RE-DERIVED FROM THE RECORD.
 *
 * THIS IS THE CHECK THE LAST ATTACK NEEDED. `assertRowShapes` proves a row's
 * drawn shape matches its measure and `assertPixelsMatchMarks` proves its
 * lengths match its mark — and both of them read the measure off the row. So a
 * plate whose measure had been changed from `paid` to `kept` passed every one
 * of them: the wedge, the valve, the cup and every pixel in them were exactly
 * what a `kept` row should carry. The drawing was consistent. It was inverted.
 *
 * So the measure itself is re-derived here, from the claim's own unit and the
 * head of its statement, at mint and on every re-entry — against the frozen
 * record, not against a copy the plan carries, because the plan carries none.
 * A row whose drawn direction disagrees with the record's own words stops the
 * page, and so does a re-entry with no record to check against: a direction
 * check that quietly skips is the label coming back.
 */
export function assertDirectionsFromRecord(plan, claimsFile, context) {
  const file = claimsFile || guards.getFrozen('claims');
  const list = Array.isArray(file) ? file : (file && file.claims);
  if (!Array.isArray(list) || list.length === 0) {
    throw new TollPlanError(
      `${context || 'this plate set'} cannot reach claims.json, so which way each of these ` +
      'thirteen figures went is unchecked. That is the one thing on this page that used to be a ' +
      'word in a build file, and a page that draws money leaving as money taken inverts its own ' +
      'finding. It refuses to re-open rather than skipping the check.',
      file && Object.keys(file || {}),
    );
  }
  const index = new Map(list.map((c) => [c.id, c]));
  const bad = [];
  for (const plate of plan.plates) {
    for (const row of plate.rows) {
      const claim = index.get(row.id);
      if (!claim) { bad.push(`${row.id}: the record no longer holds this claim`); continue; }
      let want;
      try {
        want = directionFromRecord(claim, row.id);
      } catch (e) {
        bad.push(`${row.id}: ${e.message.slice(0, 160)}`);
        continue;
      }
      if (row.measures !== want.measures) {
        bad.push(`${row.id}: drawn as "${row.measures}" and the record's own ${want.from} ` +
          `("${want.phrase}") makes it "${want.measures}"`);
      }
      if (row.measuresFrom !== want.from || row.measuresPhrase !== want.phrase) {
        bad.push(`${row.id}: says it read "${row.measuresPhrase}" in the ${row.measuresFrom} and ` +
          `the record settles it on "${want.phrase}" in the ${want.from}`);
      }
      if (row.measuresWhy !== directionSentence(want)) {
        bad.push(`${row.id}: prints a sentence about its direction that its own derivation does not give`);
      }
      if (row.measuresTerm !== MEASURES[want.measures].term
        || row.measuresLine !== MEASURES[want.measures].line) {
        bad.push(`${row.id}: is drawn as "${want.measures}" and printed under the words for something else`);
      }
    }
  }
  if (bad.length) {
    throw new TollPlanError(
      `${context || 'this plate set'} draws ${bad.length} row(s) in a direction the record does ` +
      `not give them: ${bad.join('; ')}. Money a middleman handed on is drawn leaving at the far ` +
      'end with a pipe off the page. Money he kept is drawn as a rust wedge with a valve on it and ' +
      'a cup beneath. Those are opposite claims, and which one a plate makes is not a field ' +
      'anybody sets.',
      bad,
    );
  }
  return true;
}

/**
 * THROWING FORM. Every "arrived" row prints the line that says what it is not.
 *
 * The line is the sentence "This counts what arrived, not what was taken." It
 * is on the row because a reader who takes the complement of an arrival figure
 * has computed a middleman's cut the record does not support.
 */
export function assertArrivalLinesPrinted(plan, context) {
  const missing = [];
  for (const plate of plan.plates) {
    for (const row of plate.rows) {
      if (row.measures !== 'arrived') continue;
      if (row.measuresLine !== MEASURES.arrived.line) missing.push(row.id);
    }
  }
  if (missing.length) {
    throw new TollPlanError(
      `${context || 'this plate set'}: ${missing.join(', ')} count what arrived and do not carry ` +
      'the line that says so.', missing,
    );
  }
  return true;
}

/** THROWING FORM. Thirteen tolls, thirteen different bases, read from the record. */
export function assertBasesDistinct(plan, context) {
  const seen = new Map();
  for (const unit of plan.bases) {
    if (seen.has(unit)) {
      throw new TollPlanError(
        `${context || 'this plate set'} draws two tolls on "${unit}". This page exists because no ` +
        'two of these cuts share a base.', unit,
      );
    }
    seen.set(unit, true);
  }
  if (plan.bases.length === 0) {
    throw new TollPlanError('the plate set carries no bases at all, so this check saw nothing.', 0);
  }
  return true;
}

/* ======================================================================
 * 5 · THE PLANNER HANDLE
 *
 * `TOLL_PLANNER` is never exported. A plate set is refused at the era machine's
 * door and an era plan is refused here, because the seal records which planner
 * minted it and these are different planners.
 * ====================================================================== */

function revalidateToll(sealed, { marks, context }) {
  const where = context;
  if (sealed.plates.length !== ERA_COUNT) {
    throw new TollPlanError(
      `${where} holds ${sealed.plates.length} plates. The finding on this page is about all of ` +
      'them, and a plate set with one era missing is a hole nobody can see, because there is ' +
      'nothing beside the gap to compare it against.',
      sealed.plates.length,
    );
  }
  sealed.plates.forEach((plate, i) => {
    if (plate.era !== i + 1) {
      throw new TollPlanError(`${where}: plate ${i} is era ${plate.era}.`, plate.era);
    }
  });
  assertRowShapes(sealed, where);
  /* THE TWO CHECKS THE PAGE SHIPPED WITHOUT. `assertRowShapes` reads which keys
   * a row carries; these read what the numbers under them are. The first
   * re-derives every drawn length from the mark it claims to read, and the
   * second proves the thirteen drawings do not share a ruler. */
  assertPixelsMatchMarks(sealed, where);
  assertNoSharedRuler(sealed, where);
  /* AND THE ONE ABOVE BOTH OF THEM. The two checks either side of this line
   * prove a row's shape and its lengths match its measure — and both read the
   * measure off the row. This re-derives the measure itself, off the record. */
  assertDirectionsFromRecord(sealed, null, where);
  assertLastPlateGuard(sealed, where);
  assertArrivalLinesPrinted(sealed, where);
  assertBasesDistinct(sealed, where);
  /* Every string a row prints is re-derived from the row's own mark. Borrowed
   * from `era-plan.js` rather than written again: it is a generic walk for any
   * object carrying a minted mark and a `short`, and a toll row is one. */
  assertReadingsMatchMarks(sealed, where);
  assertVerdictsVisible(marks, sealed.verdictStamps, where);
  assertNoRecordOnPlan(sealed, where);
  assertNoEraCut(sealed, where);
}

const TOLL_PLANNER = definePlanner({
  name: 'the toll plate planner',
  revalidate: revalidateToll,
});

/** The one door a plate set comes back through. */
export function openTollPlan(plan, context) {
  return TOLL_PLANNER.open(plan, context);
}

/** True when `plan` is a plate set THIS module minted. Not "some plan". */
export function isTollPlan(plan) {
  return TOLL_PLANNER.owns(plan);
}

/* ======================================================================
 * 6 · THE FINDING
 *
 * The chapter's honest finding, built from the plates rather than typed beside
 * them. Every count in it is derived: no string in this folder spells the
 * number of anything.
 * ====================================================================== */

function buildFinding(plates) {
  const rows = plates.flatMap((p) => p.rows);
  const outside = rows.filter((r) => OUTSIDE_VISIBILITY.includes(r.visibility));
  const filed = rows.filter((r) => r.visibility === 'filed');
  const unclosed = rows.filter((r) => r.visibility === 'unclosed');
  if (outside.length === 0 || filed.length === 0 || unclosed.length === 0) {
    throw new TollPlanError(
      'the finding on this page rests on three groups of tolls — the ones an outsider printed or ' +
      'counted, the ones the seller filed about itself, and the ones nobody could close. One of ' +
      'the three is empty, so the sentence under the plates would be about nothing.',
      { outside: outside.length, filed: filed.length, unclosed: unclosed.length },
    );
  }
  const lastOutside = plates.filter((p) => p.rows.some((r) => OUTSIDE_VISIBILITY.includes(r.visibility))).pop();
  const word = (n) => countWord(n);
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  const sentence =
    'Read the bottom row of every plate down the page. That row says who produced the figure. ' +
    `${cap(word(outside.length))} of these cuts were printed by the trade or counted by an outside ` +
    `body. The last of those is on the ${lastOutside.name} plate (${lastOutside.years}). After ` +
    'that the figure comes off the seller\'s own books. At the end of the page nobody can produce ' +
    'a figure at all. Two advertiser associations tried to trace the money, one in Britain and one ' +
    'in America, and neither could close the account. The cut did not clearly rise or fall. It got ' +
    'harder to see.';

  return Object.freeze({
    sentence,
    outsideCount: outside.length,
    filedCount: filed.length,
    unclosedCount: unclosed.length,
    lastOutsideEra: Object.freeze({ era: lastOutside.era, name: lastOutside.name, years: lastOutside.years }),
  });
}

/**
 * The sentence about the missing ruler, printed once, above the plates.
 *
 * `pull-ring.js` makes the same argument about the cross-era drawer, and it is
 * the same argument: seven eras do not share a ruler, so the drawing must not
 * give them one.
 */
export const RULER_NOTE =
  'Every drawing on this page has its own scale, and none of them share one. A bar is the whole of ' +
  'one era\'s own starting amount. No two of those amounts are the same thing, so no two bars are ' +
  'drawn the same length: the length tells you which base you are looking at and measures nothing ' +
  'at all. Read each drawing against its own bar. Two of them cannot be measured against each ' +
  'other, and comparing two of these figures means reading what each one is a share of first.';

/* ======================================================================
 * 7 · THE PLAN
 * ====================================================================== */

/**
 * Build the seven plates.
 *
 *   records  eras/era-1..7.json, parsed, all seven, in order
 *   frozen   guards.snapshotFrozen(), or at minimum { claims }
 *
 * Returns a SEALED plan. Every container is frozen, every mark is one
 * `planClaimMark` minted, and `openTollPlan` re-validates it on re-entry.
 */
export function planTollPlates(records, frozen = {}, options = {}) {
  assertSevenEras(records);
  const claimsFile = frozen.claims || guards.getFrozen('claims');
  assertTollSelection(claimsFile);

  const register = verdictRegister('the toll plates');
  const byEra = new Map(records.map((r) => [r.era, r]));
  const context = options.context || 'the seven toll plates';

  /**
   * THE THIRTEEN SIZES, DERIVED ONCE, BEFORE ANY ROW IS BUILT.
   *
   * The bases are read out of the record's own `unit` field, which is the field
   * `assertBasesDistinct` proves is thirteen different strings. Derived here,
   * from the whole set, so that no row can be given a size of its own and no
   * row's size depends on the claim it draws.
   *
   * THE PAGE NO LONGER STAGGERS THE PLATES. It used to indent each card by a
   * whole number of steps, which moved the bars a little and moved the three
   * fixed rows under them by exactly as much — including the token column, the
   * one thing on this page a reader is asked to read straight down. The stagger
   * was on the wrong channel. It is now inside the drawing, where the bars
   * differ in length, in thickness and in origin, and the rows below sit at one
   * left edge on every plate.
   */
  const geometry = baseGeometry(
    PLATES.flatMap((spec) => spec.tolls.map((toll) => {
      const claim = (Array.isArray(claimsFile) ? claimsFile : claimsFile.claims)
        .find((c) => c.id === toll.id);
      return claim && claim.unit;
    })),
    context,
  );

  const plates = PLATES.map((spec) => {
    const record = byEra.get(spec.era);
    if (!record) throw new TollPlanError(`era ${spec.era} has no record.`, spec.era);
    const rows = spec.tolls.map((toll) => planRow(spec, toll, record, {
      register, claimsFile, geometry,
    }));
    const plate = {
      era: spec.era,
      name: record.name,
      years: record.years,
      relation: spec.relation,
      relationNote: spec.relationNote,
      full: spec.relation === 'rival',
      rows,
      guardLine: null,
    };
    plate.alt = plateAlt(plate, rows);
    return plate;
  });

  const first = plates[0];
  const last = plates[plates.length - 1];
  last.guardLine = lastPlateGuard(last, last.rows, first.name);

  const plan = {
    kind: 'toll-plates',
    plateCount: plates.length,
    plates,
    bases: plates.flatMap((p) => p.rows.map((r) => r.unit)),
    rulerNote: RULER_NOTE,
    finding: buildFinding(plates),
    verdictStamps: verdictStamps(register),
    context,
  };
  return TOLL_PLANNER.seal(plan, plan.context);
}

/**
 * Every reader-facing sentence a plate set carries, with no DOM in sight.
 *
 * This is what the readability measurement and the prose lint read when they
 * run outside a browser. The rendered page is read separately, off the DOM,
 * because a list somebody remembered to keep is not a list of what is on screen.
 */
export function planSentences(plan) {
  const out = [];
  const push = (s) => { if (typeof s === 'string' && s.trim()) out.push(s.trim()); };
  push(plan.rulerNote);
  push(plan.finding.sentence);
  for (const plate of plan.plates) {
    push(plate.relationNote);
    push(plate.alt);
    push(plate.guardLine);
    for (const row of plate.rows) {
      push(row.base);
      push(row.why);
      push(row.caveat);
      push(row.alt);
      push(row.visibilitySentence);
      push(row.measuresLine);
      push(row.measuresWhy);
      push(row.reading);
      push(row.figure);
      push(row.title);
      if (row.unclosed) { push(row.unclosed.label); push(row.unclosed.note); }
    }
  }
  for (const stamp of plan.verdictStamps) push(stamp.sentence);
  return [...new Set(out)];
}

export default {
  planTollPlates, openTollPlan, isTollPlan, planSentences, rowAlt, directionSentence,
  VIEW, BAR, CUP, SHAPES, cupHolds, baseGeometry, RULER_NOTE, FORBIDDEN_KEYS,
  assertNoEraCut, assertRowShapes, assertPixelsMatchMarks, assertNoSharedRuler,
  assertDirectionsFromRecord,
  assertGeometryDistinct, assertLastPlateGuard, assertArrivalLinesPrinted, assertBasesDistinct,
};
