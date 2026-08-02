/* docs/p2/toll/toll.test.js — the bench for the seven toll plates.
 *
 * Every case here is a way to make a plate say the thing this object exists to
 * refuse: that one era's percentage can be read against another's and the cut
 * seen to rise. A suite that only exercises the routes that work measures
 * nothing, so each guarantee gets a real passing case, a real failing case,
 * and — where one was found — the bypass.
 *
 * WHAT THIS BENCH MISSED, AND WHY THE MISS IS THE SHAPE OF THE ROUND. It had a
 * row asserting that every bar on the page was the same length and a row
 * asserting that the plates were indented differently, and it called the pair
 * of them "no shared axis". They were the shared axis: four pixels to a point
 * on thirteen readings, staggered. A bench can be green on rows that check the
 * wrong property, so the rows here now measure the drawing — off the DOM, with
 * `getBoundingClientRect` — as well as the plan behind it.
 *
 * NINE ROWS ARE CENSUS ROWS and count against the whole frozen record: the
 * thirteen bases, the thirteen bar sizes, the pairs the drawing puts in the
 * wrong order, what each span paints against what it only reaches, the
 * visibility classes as the record's own source lists support them, the
 * thirteen directions with the record's own words for each, the statement heads
 * the derivation reads, the span-only rows at the live cut, and the colour
 * budget.
 *
 * A ROW THAT REPORTS ITS OWN FAILURE IS A ROW THAT CANNOT FAIL. `ok()` records
 * any string as a PASS and prints it, which is what makes a census readable. So
 * every row here with something to report THROWS on a mismatch rather than
 * returning a sentence that says it went wrong. That lesson is `eras.test.js`'s
 * and it is repeated because it cost a green run on a red gate.
 */

import * as guards from '../lib/guards.js';
import { planClaimMark, planMarks, definePlanner, wideCut } from '../charts/claim-marks.js';
import { BRASS, RUST, IRON, STIPPLE, assertObjectColor } from '../lib/tokens.js';
import { ERA_COUNT, countWord } from '../eras/era-records.js';
import { planEra } from '../eras/era-plan.js';
import {
  PLATES, VISIBILITY, MEASURES, RELATION, OUTSIDE_VISIBILITY, DIRECTION_KEYS, DIRECTION_PHRASES,
  allTolls, assertTollSelection, assertShareUnit, directionFromRecord, statementHead,
} from './toll-records.js';
import {
  planTollPlates, planSentences, openTollPlan, isTollPlan, baseGeometry, cupHolds,
  BAR, VIEW, CUP, SHAPES, FORBIDDEN_KEYS, TIME_FIELD, directionSentence,
  assertNoEraCut, assertRowShapes, assertNoSharedRuler, assertPixelsMatchMarks,
  assertDirectionsFromRecord,
  assertGeometryDistinct, assertLastPlateGuard, assertArrivalLinesPrinted, assertBasesDistinct,
} from './toll-plan.js';
import { renderTollPlates, domSentences, assertTollColourBudget } from './toll-plate.js';

/* ------------------------------------------------------------------ */

const results = [];
function record(group, name, kind, pass, detail) {
  results.push({ group, name, kind, pass, detail: detail == null ? '' : String(detail).slice(0, 420) });
  return pass;
}
function ok(group, name, fn, detail) {
  try { const v = fn(); return record(group, name, 'passes', v !== false, detail || (v === true ? '' : v)); }
  catch (e) { return record(group, name, 'passes', false, `threw: ${e.message}`); }
}
function throws(group, name, fn, expect) {
  try { fn(); return record(group, name, 'refuses', false, 'it did NOT throw'); }
  catch (e) {
    const hit = !expect || new RegExp(expect, 'i').test(e.message) || new RegExp(expect, 'i').test(e.name);
    return record(group, name, 'refuses', hit, hit ? e.name : `threw the wrong thing: ${e.name} ${e.message}`);
  }
}
function census(group, name, fn) {
  try { const v = fn(); return record(group, name, 'census', true, v); }
  catch (e) { return record(group, name, 'census', false, `threw: ${e.message}`); }
}

/** A claim the record does not hold, for cases that need a shape, not a fact. */
const FIXTURE_WIDE = Object.freeze({
  id: 'fixture-wide-001', central: 100, ci80: [10, 400], grade: 'C',
  unit: 'percent of a fixture', about_year: 1900, verdict: 'confirmed',
});

export async function runAll({ frozen, records, host }) {
  if (!host || !host.isConnected) {
    throw new Error('the bench needs a host the browser is rendering, not a detached node.');
  }
  results.length = 0;

  const plan = planTollPlates(records, frozen);
  const rows = plan.plates.flatMap((p) => p.rows);
  const lastPlate = plan.plates[plan.plates.length - 1];

  /* ================================================================
   * 1 · THE SELECTION IS STILL TRUE ABOUT THE RECORD
   * ================================================================ */

  ok('the selection', 'every toll is a claim claims.json holds', () => assertTollSelection(frozen.claims));

  census('the selection', 'thirteen tolls, thirteen bases', () => {
    const bases = plan.bases;
    if (new Set(bases).size !== bases.length) throw new Error('two tolls share a base');
    return `${bases.length} tolls · ${new Set(bases).size} different bases · ` +
      'no two eras on this page measured their cut on the same thing';
  });

  census('the selection', 'who produced each figure, cross-checked against its own sources', () => {
    const claims = frozen.claims.claims || frozen.claims;
    const index = new Map(claims.map((c) => [c.id, c]));
    const lines = [];
    for (const toll of allTolls()) {
      const names = (index.get(toll.id).sources || []).map((s) => s.name);
      if (!names.some((n) => n.includes(toll.sourceKey))) {
        throw new Error(`${toll.id} names "${toll.sourceKey}" and no source carries it`);
      }
      lines.push(`e${toll.era} ${toll.visibility}`);
    }
    return lines.join(' · ');
  });

  census('the selection', 'the visibility column, read down the page', () => {
    const counts = {};
    for (const r of rows) counts[r.visibility] = (counts[r.visibility] || 0) + 1;
    const outside = rows.filter((r) => OUTSIDE_VISIBILITY.includes(r.visibility)).length;
    if (outside === 0) throw new Error('no toll on the page was produced by anybody outside the seller');
    return `${rows.map((r) => r.visibility[0]).join(' ')} — ` +
      Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ');
  });

  throws('the selection', 'a unit that is not a share of anything', () =>
    assertShareUnit('USD per agate line', 'a test'), 'not a share');
  ok('the selection', 'a unit in cents of a dollar is a share', () =>
    assertShareUnit('cents of each DSP dollar reaching the consumer', 'a test'));

  throws('the selection', 'the whole selection, starved of claims.json', () =>
    assertTollSelection({ claims: [] }), 'claims.json');

  ok('the selection', 'the thirteen bases are checked, not asserted', () =>
    assertBasesDistinct(plan, 'the bench'));

  throws('the selection', 'two tolls sharing one base', () =>
    assertBasesDistinct({ bases: ['percent of gross billings', 'percent of gross billings'] }, 'the bench'),
  'share a base');

  throws('the selection', 'the base check with nothing to check', () =>
    assertBasesDistinct({ bases: [] }, 'the bench'), 'saw nothing');

  /* ================================================================
   * 2 · NO SHARED RULER. THIS IS THE OBJECT'S WHOLE REASON TO EXIST.
   *
   * THE FAILURE THIS SECTION WAS REWRITTEN AROUND. Every bar used to be 400
   * long and `pxOf` used to divide by 100, so ONE POINT OF A SHARE WAS FOUR
   * PIXELS ON EVERY PLATE. The old rows here checked that the bars were all
   * the same length and that the plates were indented differently, and both
   * passed — a shared scale with a stagger on it is still a shared scale.
   * ================================================================ */

  const ruler = assertNoSharedRuler(plan, 'the bench');

  census('no shared ruler', 'thirteen bars, thirteen sizes, thirteen scales', () => {
    const seen = new Set();
    for (const r of rows) {
      const key = `${r.bar.x}/${r.bar.width}`;
      if (seen.has(key)) throw new Error(`${r.id} draws a bar another row already drew`);
      seen.add(key);
    }
    return `one point of a share is worth ${ruler.pointPx.join(', ')} pixels on the thirteen ` +
      `plates — a spread of ${ruler.widthRatio.toFixed(2)} to one. It was four pixels on every ` +
      'plate, which is a chart.';
  });

  census('no shared ruler', 'the drawn order is not the recorded order', () => {
    if (!ruler.inverted.length) throw new Error('every figure draws in its recorded order');
    return `${ruler.inverted.length} pair(s) the drawing puts the wrong way round, which is what ` +
      `it looks like when a length carries no information: ${ruler.inverted[0]}`;
  });

  ok('no shared ruler', 'no two bars share a length, an origin or an end', () => {
    for (const channel of ['width', 'x']) {
      const values = rows.map((r) => r.bar[channel]);
      if (new Set(values).size !== values.length) throw new Error(`two bars share a ${channel}`);
    }
    const ends = rows.map((r) => r.bar.x + r.bar.width);
    if (new Set(ends).size !== ends.length) throw new Error('two bars end at the same place');
    return `${rows.length} bars: ${rows.length} lengths, ${rows.length} origins, ${rows.length} ends`;
  });

  throws('no shared ruler', 'every bar put back on one length', () => {
    const forged = {
      plates: plan.plates.map((p) => ({
        ...p, rows: p.rows.map((r) => ({ ...r, bar: { ...r.bar, width: 400 } })),
      })),
    };
    assertNoSharedRuler(forged, 'the bench');
  }, 'share a length');

  throws('no shared ruler', 'two bars begun at one origin', () => {
    const forged = {
      plates: plan.plates.map((p) => ({
        ...p, rows: p.rows.map((r) => ({ ...r, bar: { ...r.bar, x: 116 } })),
      })),
    };
    assertNoSharedRuler(forged, 'the bench');
  }, 'share a (length|origin)');

  throws('no shared ruler', 'bars nudged back towards one length', () => {
    /* Not equal, just close. A page whose bars differ by a few pixels is a page
     * a reader reads across, because a small difference reads as a drawing
     * error rather than as a different ruler. */
    const forged = {
      plates: plan.plates.map((p) => ({
        ...p,
        rows: p.rows.map((r, j) => ({ ...r, bar: { ...r.bar, width: 400 + p.era * 3 + j } })),
      })),
    };
    assertNoSharedRuler(forged, 'the bench');
  }, 'times its shortest|share a');

  throws('no shared ruler', 'a page that draws every figure in its recorded order', () => {
    /* The proof, inverted. Bar lengths that rise with the figure ARE a shared
     * scale with a different name, and this is the row that says so. */
    const ordered = [...rows].sort((a, b) => {
      const v = (r) => (r.mark.kind === 'point' ? r.mark.central : r.mark.lo);
      return v(a) - v(b);
    });
    const widths = new Map(ordered.map((r, i) => [r.id, 170 + i * 24]));
    const forged = {
      plates: plan.plates.map((p) => ({
        ...p,
        rows: p.rows.map((r) => ({ ...r, bar: { ...r.bar, width: widths.get(r.id) } })),
      })),
    };
    assertNoSharedRuler(forged, 'the bench');
  }, 'recorded order');

  ok('no shared ruler', 'the sizes are derived from the bases and nothing else', () => {
    const geometry = baseGeometry(plan.bases, 'the bench');
    const again = baseGeometry([...plan.bases].reverse(), 'the bench');
    for (const r of rows) {
      const want = geometry.get(r.unit);
      if (want.width !== r.bar.width || want.x !== r.bar.x || want.height !== r.bar.height) {
        throw new Error(`${r.id} is drawn at a size its own base does not derive`);
      }
      if (again.get(r.unit).width !== want.width || again.get(r.unit).x !== want.x) {
        throw new Error(`${r.id} moves when the bases are reordered`);
      }
    }
    return 'the same thirteen strings derive the same thirteen bars in any order, and no bar\'s ' +
      'size depends on the claim drawn on it';
  });

  throws('no shared ruler', 'two bases handed the geometry as one string', () =>
    baseGeometry(['percent of gross billings', 'percent of gross billings'], 'the bench'),
  'same string');

  throws('no shared ruler', 'a geometry with two bases on one edge', () => {
    assertGeometryDistinct(new Map([
      ['a base', { x: 100, y: 30, width: 200, height: 16 }],
      ['another base', { x: 100, y: 30, width: 240, height: 18 }],
    ]), 'the bench');
  }, 'same object');

  ok('no shared ruler', 'no plate names a cut for its era', () => assertNoEraCut(plan, 'the bench'));

  throws('no shared ruler', 'a plate given a headline cut', () => {
    const forged = { plates: [{ era: 1, headline: 15 }] };
    assertNoEraCut(forged, 'the bench');
  }, 'name a cut for a whole');

  throws('no shared ruler', 'a plan given a shared scale', () => {
    assertNoEraCut({ plates: [], scale: { domain: [0, 100] } }, 'the bench');
  }, 'name a cut for a whole|scale');

  ok('no shared ruler', 'the cup carries no quantity anywhere on the page', () => {
    const cups = rows.filter((r) => r.cup);
    const bad = cups.filter((r) => ['fillTop', 'bandTop', 'bandBottom', 'level'].some((k) => k in r.cup));
    if (bad.length) throw new Error(`${bad.map((r) => r.id).join(', ')} carry a cup level`);
    return `${cups.length} cups of one size with no level in any of them. Cups of one size at one ` +
      'place with a level in each would be the seven-bar chart turned on its side.';
  });

  /* ================================================================
   * 2b · EVERY DRAWN LENGTH IS RE-DERIVED FROM ITS OWN MARK
   *
   * THE HOLE THIS SECTION CLOSES. `assertRowShapes` reads which KEYS a row
   * carries and never what the numbers under them are, so it passed a plate
   * whose valve was drawn at the full width of the bar on a mark reading
   * fifteen. Every pixel on this page was unchecked.
   * ================================================================ */

  ok('every pixel', 'every drawn length re-derives from the mark beside it', () =>
    assertPixelsMatchMarks(plan, 'the bench'));

  throws('every pixel', 'a valve drawn at the whole bar on a mark reading fifteen', () => {
    const row = rows.find((r) => r.id === 'e1-pricing-004');
    const forged = {
      bases: plan.bases,
      plates: [{ ...plan.plates[0], rows: [{ ...row, wedge: { ...row.wedge, valveX: row.bar.x + row.bar.width } }] }],
    };
    assertPixelsMatchMarks(forged, 'the bench');
  }, 'its own mark puts it at');

  throws('every pixel', 'a bar widened by hand', () => {
    const row = rows[0];
    const forged = {
      bases: plan.bases,
      plates: [{ ...plan.plates[0], rows: [{ ...row, bar: { ...row.bar, width: 400 } }] }],
    };
    assertPixelsMatchMarks(forged, 'the bench');
  }, 'this base derives');

  throws('every pixel', 'a span painted to its high end and called its low one', () => {
    const row = rows.find((r) => r.form === 'span');
    const forged = {
      bases: plan.bases,
      plates: [{ ...plan.plates[0], rows: [{ ...row, wedge: { ...row.wedge, xAtLo: row.wedge.xAtHi } }] }],
    };
    assertPixelsMatchMarks(forged, 'the bench');
  }, 'xAtLo');

  census('every pixel', 'what each span paints, and how far it only reaches', () => {
    const spans = rows.filter((r) => r.form === 'span');
    if (!spans.length) throw new Error('no span rows, so this row saw nothing');
    return spans.map((r) => {
      const part = r.wedge || r.handover || r.arrival;
      const from = SHAPES[r.measures].fromRight ? r.bar.x + r.bar.width : r.bar.x;
      return `${r.id} paints ${Math.abs(part.xAtLo - from).toFixed(0)}px and reaches ` +
        `${Math.abs(part.xAtHi - from).toFixed(0)}px (${r.short})`;
    }).join(' · ');
  });

  /* ================================================================
   * 2c · WHICH WAY THE MONEY WENT IS NOT A LABEL
   *
   * THE LAST ATTACK ON THIS PAGE. The repair one round back gave a payout its
   * own drawing — no rust, no valve, no cup, the share ruled at the far end
   * with a pipe off the page — and then took the word "paid" from a field in
   * `toll-records.js`. Changing that one word to "kept" put Overture's traffic
   * acquisition cost back under a valve with a full cup beneath it and the
   * words "This is what the middleman kept" printed under the drawing. THE
   * PIXELS FOLLOWED WITHOUT BEING ASKED, because `assertPixelsMatchMarks`
   * re-derives every drawn end from the same field. `assertRowShapes` passed.
   * `assertPixelsMatchMarks` passed. The seal re-opened. Every check in the
   * folder compared the drawing against the LABEL, and the drawing matched it.
   *
   * Money leaving drawn as money taken inverts the finding. So the label is
   * gone: the direction is derived from the claim's own unit and the head of
   * its statement, and the rows below are the attack, refused.
   * ================================================================ */

  census('which way', 'the thirteen directions, and the record\'s own words for each', () => {
    const claims = frozen.claims.claims || frozen.claims;
    const index = new Map(claims.map((c) => [c.id, c]));
    const lines = [];
    for (const row of rows) {
      const want = directionFromRecord(index.get(row.id), row.id);
      if (want.measures !== row.measures) {
        throw new Error(`${row.id} draws "${row.measures}" and the record derives "${want.measures}"`);
      }
      lines.push(`${row.id} ${want.measures} ← the ${want.from}: "${want.phrase}"`);
    }
    const fromUnit = rows.filter((r) => r.measuresFrom === 'unit').length;
    return `${fromUnit} of ${rows.length} settled by the record's own unit, the rest by the head of ` +
      `its statement · ${lines.join(' · ')}`;
  });

  census('which way', 'the statement heads the derivation reads when the unit is silent', () => {
    const claims = frozen.claims.claims || frozen.claims;
    const index = new Map(claims.map((c) => [c.id, c]));
    const heads = rows.filter((r) => r.measuresFrom === 'statement');
    if (!heads.length) throw new Error('no row is settled by its statement, so this row saw nothing');
    return heads.map((r) => {
      const head = statementHead(index.get(r.id).statement, r.id);
      return `${r.id} → "${head.slice(0, 70)}${head.length > 70 ? '…' : ''}"`;
    }).join(' · ');
  });

  ok('which way', 'no toll anywhere in the table declares a direction', () => {
    const bad = [];
    for (const toll of allTolls()) {
      for (const key of DIRECTION_KEYS) if (key in toll) bad.push(`${toll.id}.${key}`);
    }
    if (bad.length) throw new Error(bad.join(', '));
    if (!DIRECTION_KEYS.length) throw new Error('nothing is refused, so that check passes on anything');
    return `${allTolls().length} tolls, and not one of them carries any of: ${DIRECTION_KEYS.join(', ')}. ` +
      'There is no label to change.';
  });

  ok('which way', 'every drawn direction re-derives from the record', () =>
    assertDirectionsFromRecord(plan, frozen.claims, 'the bench'));

  throws('which way', 'a payout relabelled a cut, with wedge and cup re-derived from the left', () => {
    /* THE WHOLE ATTACK, in the form that used to succeed: the label moved AND
     * every pixel rebuilt from the left the way a kept row builds them, so
     * nothing downstream has anything to disagree with. */
    const paid = rows.find((r) => r.measures === 'paid');
    const N = (v) => Number(Number(v).toFixed(2));
    const fromLeft = (v) => N(paid.bar.x + (v / 100) * paid.bar.width);
    const forged = {
      bases: plan.bases,
      plates: [{
        ...plan.plates[paid.era - 1],
        rows: [{
          ...paid,
          measures: 'kept',
          measuresTerm: MEASURES.kept.term,
          measuresLine: MEASURES.kept.line,
          handover: undefined,
          wedge: {
            xAtLo: fromLeft(paid.mark.lo),
            xAtHi: fromLeft(paid.mark.hi),
            valveX: fromLeft(paid.mark.central),
          },
          cup: {
            x: paid.bar.x, y: CUP.y, width: CUP.width, height: CUP.height,
            floor: CUP.y + CUP.height, holds: 'a measured amount', open: false,
          },
        }],
      }],
    };
    delete forged.plates[0].rows[0].handover;
    /* The two checks that used to be the whole defence pass on it. */
    assertRowShapes(forged, 'the bench');
    assertPixelsMatchMarks(forged, 'the bench');
    /* This is the one that reads the record. */
    assertDirectionsFromRecord(forged, frozen.claims, 'the bench');
  }, 'the record');

  throws('which way', 'a payout printed under the words for a cut', () => {
    const paid = rows.find((r) => r.measures === 'paid');
    const forged = {
      plates: [{ ...plan.plates[paid.era - 1], rows: [{ ...paid, measuresLine: MEASURES.kept.line }] }],
    };
    assertDirectionsFromRecord(forged, frozen.claims, 'the bench');
  }, 'words for something else');

  throws('which way', 'a row that names a record phrase the record did not settle it on', () => {
    const paid = rows.find((r) => r.measures === 'paid');
    const forged = {
      plates: [{
        ...plan.plates[paid.era - 1],
        rows: [{ ...paid, measuresFrom: 'unit', measuresPhrase: 'retained by' }],
      }],
    };
    assertDirectionsFromRecord(forged, frozen.claims, 'the bench');
  }, 'settles it on');

  throws('which way', 'a claim whose unit and statement head say nothing either way', () =>
    directionFromRecord({
      id: 'fixture-mute-001',
      unit: 'percent of the pool',
      statement: 'The figure was 12 percent of the pool in 1999, on the study\'s own sizing.',
    }, 'the bench'),
  'The row is refused');

  throws('which way', 'a claim whose own unit says the money went both ways', () =>
    directionFromRecord({
      id: 'fixture-both-001',
      unit: 'percent retained by the network and paid out as traffic acquisition cost',
      statement: 'A fixture that needs a shape rather than a fact.',
    }, 'the bench'),
  'two ways at once');

  throws('which way', 'the direction check run with no record to check against', () =>
    assertDirectionsFromRecord(plan, { claims: [] }, 'the bench'), 'cannot reach claims.json');

  throws('which way', 'the whole sealed plan re-opened with the frozen record taken away', () => {
    const bag = guards.snapshotFrozen();
    try { guards.clearFrozen(); openTollPlan(plan, 'the bench with no record'); }
    finally { guards.useFrozen(bag); }
  });

  throws('which way', 'the record itself moved under a plan already built', () => {
    /* The honest case, and it still stops the page. A repair that changes what
     * a claim's unit says about its own money changes the drawing, so the plan
     * has to be built again rather than re-opened. The same posture
     * `assertMarksHonest` takes when a drawing convention moves. */
    const moved = JSON.parse(JSON.stringify(frozen.claims));
    const list = moved.claims || moved;
    const paid = rows.find((r) => r.measures === 'paid');
    list.find((c) => c.id === paid.id).unit = 'percent of revenue retained by the seller';
    assertDirectionsFromRecord(plan, moved, 'the bench');
  }, 'makes it "kept"');

  ok('which way', 'the direction vocabulary is three lists and none of them is empty', () => {
    const sizes = Object.entries(DIRECTION_PHRASES).map(([k, v]) => {
      if (!v.length) throw new Error(`${k} has no phrases, so nothing can ever match it`);
      return `${k} ${v.length}`;
    });
    for (const key of Object.keys(DIRECTION_PHRASES)) {
      if (!SHAPES[key]) throw new Error(`${key} has phrases and no drawn shape`);
      if (!MEASURES[key]) throw new Error(`${key} has phrases and no printed words`);
    }
    return `${sizes.join(' · ')} — every direction the record can name has a drawn shape and a ` +
      'printed line, and every shape has a direction that can reach it';
  });

  /* ================================================================
   * 3 · THE STRIP — the wrong drawing is impossible, not forbidden
   * ================================================================ */

  census('the strip', 'span-only rows at the live cut', () => {
    const spans = rows.filter((r) => r.form === 'span');
    for (const r of spans) {
      if ('valveX' in r.wedge) throw new Error(`${r.id} is span-only and carries a valve`);
      if (r.cup && r.cup.holds !== 'a range') throw new Error(`${r.id} is span-only and its cup holds "${r.cup.holds}"`);
    }
    return `${spans.length} of ${rows.length} at a cut of ${(wideCut() * 100).toFixed(0)}%: ` +
      `${spans.map((r) => r.id).join(', ')} — none of them has a valve`;
  });

  ok('the strip', 'a span-only mark carries no central', () => {
    const spans = rows.filter((r) => r.form === 'span');
    if (!spans.length) throw new Error('no span-only rows, so this row saw nothing');
    for (const r of spans) if ('central' in r.mark) throw new Error(`${r.id} has a central`);
    return `${spans.length} span-only marks, and "central" is not a key on any of them`;
  });

  ok('the strip', 'every arrival row carries no wedge', () => {
    const arrived = rows.filter((r) => r.measures === 'arrived');
    if (!arrived.length) throw new Error('no arrival rows, so this row saw nothing');
    for (const r of arrived) {
      if ('wedge' in r) throw new Error(`${r.id} counts an arrival and carries a wedge`);
      if (r.cup.holds !== 'nothing') throw new Error(`${r.id} counts an arrival and its cup holds something`);
    }
    return `${arrived.length} arrival rows. A figure for what reached the far end is not a figure ` +
      'for what was taken, so there is no rust to draw and no key to draw it from.';
  });

  /* THE OTHER HALF OF THE SAME MISTAKE. `paid` is money the middleman handed
   * ON — Overture's traffic acquisition cost and Google's payout. Both used to
   * be drawn with the take's own apparatus: a rust wedge, a valve, a pipe into
   * a rust pool, and a row of text saying the valve took it. Drawing money
   * leaving as money taken inverts the finding, and it did it on the two
   * largest figures on the page. */
  ok('the strip', 'a row that handed its money on carries no take and no cup', () => {
    const paid = rows.filter((r) => r.measures === 'paid');
    if (!paid.length) throw new Error('no rows measure a payout, so this row saw nothing');
    for (const r of paid) {
      if ('wedge' in r) throw new Error(`${r.id} handed its money on and carries a wedge`);
      if ('cup' in r) throw new Error(`${r.id} handed its money on and carries a cup`);
      if (!('handover' in r)) throw new Error(`${r.id} measures a payout and has nothing to draw`);
      if (r.measuresTerm === MEASURES.kept.term) throw new Error(`${r.id} is printed as a cut`);
    }
    return `${paid.map((r) => `${r.id} (${r.short})`).join(', ')} — drawn as money leaving at the ` +
      `far end under the words "${MEASURES.paid.term}", with no valve, no pool and no vessel ` +
      'under the bar to hold what nobody kept';
  });

  throws('the strip', 'a payout given the take\'s own apparatus', () => {
    const paid = rows.find((r) => r.measures === 'paid');
    const forged = {
      plates: [{
        ...plan.plates[4],
        rows: [{ ...paid, wedge: { xAtLo: 1, xAtHi: 2, valveX: 2 }, cup: { holds: 'a measured amount' } }],
      }],
    };
    assertRowShapes(forged, 'the bench');
  }, 'carries wedge|carries a cup');

  ok('the strip', 'the cup vocabulary is one function, read by the planner and the guard', () => {
    if (cupHolds('paid', true) !== null) throw new Error('a payout is given a cup');
    if (cupHolds('arrived', true) !== 'nothing') throw new Error('an arrival is given something to hold');
    if (cupHolds('kept', false) !== 'a range') throw new Error('a span-only cut is given a level');
    return 'kept → a measured amount or a range · arrived → nothing · paid → no cup at all';
  });

  ok('the strip', 'every row shape matches what its mark allows', () => assertRowShapes(plan, 'the bench'));

  throws('the strip', 'a valve put back onto a span-only row', () => {
    const span = rows.find((r) => r.form === 'span');
    const forged = {
      plates: [{ ...plan.plates[0], rows: [{ ...span, wedge: { ...span.wedge, valveX: 200 } }] }],
    };
    assertRowShapes(forged, 'the bench');
  }, 'valveX');

  throws('the strip', 'a wedge put onto a row that counts an arrival', () => {
    const arrived = rows.find((r) => r.measures === 'arrived');
    const forged = { plates: [{ ...lastPlate, rows: [{ ...arrived, wedge: { xAtLo: 1, xAtHi: 2 } }] }] };
    assertRowShapes(forged, 'the bench');
  }, 'carries wedge');

  throws('the strip', 'a level put back onto a cup', () => {
    const r = rows[1];
    const forged = { plates: [{ ...plan.plates[0], rows: [{ ...r, cup: { ...r.cup, fillTop: 120 } }] }] };
    assertRowShapes(forged, 'the bench');
  }, 'carries a level');

  /* ================================================================
   * 4 · THE LAST PLATE'S OWN GUARD
   * ================================================================ */

  ok('the last plate', 'it is the only rival plate, and it carries the guard', () =>
    assertLastPlateGuard(plan, 'the bench'));

  ok('the last plate', 'the guard names the first era rather than a typed year', () => {
    const firstName = plan.plates[0].name;
    if (!lastPlate.guardLine.includes(firstName)) throw new Error('the guard does not name the first era');
    if (/\b1[89]\d\d\b/.test(lastPlate.guardLine)) throw new Error('the guard spells a year');
    return lastPlate.guardLine;
  });

  ok('the last plate', 'two of its three readings count an arrival', () => {
    const arrived = lastPlate.rows.filter((r) => r.measures === 'arrived');
    if (arrived.length < 2) throw new Error(`only ${arrived.length}`);
    return `${arrived.map((r) => r.id).join(', ')} — and each prints "${MEASURES.arrived.line}"`;
  });

  ok('the last plate', 'exactly one cup on the page cannot be filled shut', () => {
    const open = rows.filter((r) => r.cup && r.cup.open);
    if (open.length !== 1) throw new Error(`${open.length} open cups`);
    if (open[0].era !== ERA_COUNT) throw new Error('the open cup is not on the last plate');
    if (!open[0].unclosed) throw new Error('the open cup names nothing');
    return `${open[0].id}: ${open[0].unclosed.label}`;
  });

  ok('the last plate', 'the unattributed block carries no figure', () => {
    const open = rows.find((r) => r.cup && r.cup.open);
    const text = `${open.unclosed.label} ${open.unclosed.extent}`;
    if (/\d/.test(text)) throw new Error(`the block prints a digit: "${text}"`);
    return 'the share nobody could attribute is a number inside the claim\'s sentence, not a value ' +
      'the record measured, so the block names the absence and prints no number at all';
  });

  throws('the last plate', 'the guard moved onto every plate', () => {
    const forged = { plates: plan.plates.map((p) => ({ ...p, guardLine: 'careful' })) };
    assertLastPlateGuard(forged, 'the bench');
  }, 'belongs on the last one');

  throws('the last plate', 'the guard deleted', () => {
    const forged = { plates: plan.plates.map((p) => ({ ...p, guardLine: null })) };
    assertLastPlateGuard(forged, 'the bench');
  }, 'belongs on the last one');

  throws('the last plate', 'a second cup that cannot be filled shut', () => {
    const forged = {
      plates: plan.plates.map((p) => ({
        ...p, rows: p.rows.map((r) => ({ ...r, cup: { ...r.cup, open: true } })),
      })),
    };
    assertLastPlateGuard(forged, 'the bench');
  }, 'cannot be filled shut');

  throws('the last plate', 'an arrival row stripped of the line that says what it is not', () => {
    const forged = {
      plates: plan.plates.map((p) => ({
        ...p, rows: p.rows.map((r) => ({ ...r, measuresLine: 'This is the cut.' })),
      })),
    };
    assertArrivalLinesPrinted(forged, 'the bench');
  }, 'do not carry the line');

  /* ================================================================
   * 5 · THE SEAL
   * ================================================================ */

  ok('the seal', 'the plan re-opens on content', () => {
    openTollPlan(plan, 'the bench');
    return `${plan.plateCount} plates re-validated: every container frozen, every mark re-checked ` +
      'against the live guards, every printed string re-derived from its own mark';
  });

  ok('the seal', 'the plan is deep-frozen', () => {
    if (!Object.isFrozen(plan) || !Object.isFrozen(plan.plates[0].rows[0])) throw new Error('not frozen');
    return 'plan, plates, rows, wedges and cups';
  });

  throws('the seal', 'an era machine plan handed to the toll door', () => {
    openTollPlan(planEra(records[0], frozen), 'the bench');
  }, 'sealed by');

  throws('the seal', 'a plan this planner did not mint', () =>
    openTollPlan({ plates: [] }, 'the bench'), 'no planner sealed');

  throws('the seal', 'a toll plan handed to a renderer as a bare object', () =>
    renderTollPlates(host, { plates: plan.plates }), 'not a plan planTollPlates');

  throws('the seal', 'a forged plan sealed by a planner of the caller\'s own', () => {
    const mine = definePlanner({ name: 'a forger', revalidate() {} });
    const forged = mine.seal({ plates: [], kind: 'toll-plates' }, 'a forgery');
    renderTollPlates(host, forged);
  }, 'not a plan planTollPlates');

  ok('the seal', 'the seven records never reach the renderer', () => {
    const marks = new Set(planMarks(plan, 'the bench'));
    const seen = new WeakSet();
    const hits = [];
    const visit = (v, path) => {
      if (v === null || typeof v !== 'object' || marks.has(v) || seen.has(v)) return;
      seen.add(v);
      if (Array.isArray(v)) { v.forEach((x, i) => visit(x, `${path}[${i}]`)); return; }
      for (const k of Object.keys(v)) {
        if (['ci80', 'sources', 'method', 'as_of', 'about_year', 'fields', 'claims'].includes(k)) {
          hits.push(`${path}.${k}`);
        }
        visit(v[k], `${path}.${k}`);
      }
    };
    visit(plan, 'plan');
    if (hits.length) throw new Error(hits.join(', '));
    return 'no ci80, no sources, no method, no as_of, no about_year anywhere on the plan';
  });

  /* ================================================================
   * 6 · WHAT THE PLATES SAY
   * ================================================================ */

  ok('what it says', 'no base sentence carries a digit', () => {
    const bad = rows.filter((r) => /\d/.test(r.base));
    if (bad.length) throw new Error(bad.map((r) => r.id).join(', '));
    return `${rows.length} base sentences, and a number in one would be a second copy of a number`;
  });

  ok('what it says', 'the finding counts itself rather than spelling a count', () => {
    const s = plan.finding.sentence;
    if (/\b\d+\b/.test(s.replace(/\(\d{4}-\d{4}\)/g, ''))) throw new Error(`the finding spells a figure: ${s}`);
    if (!s.includes('harder to see')) throw new Error('the finding does not say the finding');
    return s;
  });

  ok('what it says', 'the finding rests on three groups of tolls that all exist', () => {
    const f = plan.finding;
    if (!f.outsideCount || !f.filedCount || !f.unclosedCount) throw new Error('a group is empty');
    return `outside ${f.outsideCount} · filed ${f.filedCount} · unclosed ${f.unclosedCount} · ` +
      `last outside era: ${f.lastOutsideEra.name}`;
  });

  ok('what it says', 'every row prints the unit the record gives it, unparaphrased', () => {
    const claims = frozen.claims.claims || frozen.claims;
    const index = new Map(claims.map((c) => [c.id, c]));
    for (const r of rows) {
      if (r.unit !== index.get(r.id).unit) throw new Error(`${r.id} paraphrases its unit`);
    }
    return `${rows.length} units, each one the record's own string`;
  });

  ok('what it says', 'a span-only row never prints a middle value', () => {
    const spans = rows.filter((r) => r.form === 'span');
    if (!spans.length) throw new Error('no span-only rows, so this row saw nothing');
    for (const r of spans) {
      const mid = (r.mark.lo + r.mark.hi) / 2;
      if (r.short.includes(String(mid))) throw new Error(`${r.id} prints a midpoint`);
      if (!r.short.includes('–')) throw new Error(`${r.id} does not print two ends`);
    }
    return spans.map((r) => `${r.id} → ${r.short}`).join(' · ');
  });

  ok('what it says', 'three claims on the page were changed after they were written', () => {
    if (!plan.verdictStamps.length) throw new Error('no stamps, so this row saw nothing');
    return plan.verdictStamps.map((s) => `${s.id} ${s.verdict}`).join(' · ');
  });

  /* ================================================================
   * 7 · THE DRAWING
   * ================================================================ */

  census('the drawing', 'the colour budget, measured', () => {
    const budget = assertTollColourBudget();
    assertObjectColor(BRASS, 'bench');
    assertObjectColor(RUST, 'bench');
    assertObjectColor(IRON, 'bench');
    return `brass against rust separates by ${budget.pair.redundant.join(' + ')} ` +
      `(cross-check ${budget.pair.crossCheck}), worst case ΔE ${budget.pair.worst.toFixed(1)} ` +
      `under ${budget.pair.worstVision}`;
  });

  const view = renderTollPlates(host, plan);

  ok('the drawing', 'all seven plates draw', () => {
    const cards = host.querySelectorAll('.p2-toll-plate');
    if (cards.length !== ERA_COUNT) throw new Error(`${cards.length} plates`);
    return `${cards.length} plates, ${host.querySelectorAll('.p2-toll-row').length} bars`;
  });

  ok('the drawing', 'no span-only bar has a valve drawn on it', () => {
    const spanBars = host.querySelectorAll('.p2-toll-row[data-form="span"]');
    if (!spanBars.length) throw new Error('no span rows drawn, so this row saw nothing');
    for (const el of spanBars) {
      if (el.querySelector('.p2-toll-drop circle')) throw new Error('a valve index was drawn on a span row');
    }
    return `${spanBars.length} span-only bars, and not one valve among them`;
  });

  ok('the drawing', 'no arrival row draws any rust at all', () => {
    const arrivals = host.querySelectorAll('.p2-toll-row[data-measures="arrived"]');
    if (!arrivals.length) throw new Error('no arrival rows drawn, so this row saw nothing');
    for (const el of arrivals) {
      if (el.querySelector('.p2-toll-wedge')) throw new Error('a wedge was drawn on an arrival row');
      if (el.querySelector('.p2-toll-drop')) throw new Error('a pipe was drawn on an arrival row');
      const painted = [...el.querySelectorAll('[fill], [stroke]')]
        .flatMap((n) => [n.getAttribute('fill'), n.getAttribute('stroke')])
        .filter((v) => v && v.toUpperCase() === RUST.toUpperCase());
      if (painted.length) throw new Error(`${painted.length} rust marks on an arrival row`);
    }
    return `${arrivals.length} arrival rows, no wedge, no pipe and no rust on any of them`;
  });

  ok('the drawing', 'the absence block is stipple inside an iron frame', () => {
    const block = host.querySelector('.p2-toll-cup .p2-absence');
    if (!block) throw new Error('the unattributed money is not drawn as an object');
    const strokes = [...block.querySelectorAll('rect')].map((r) => (r.getAttribute('stroke') || '').toUpperCase());
    if (!strokes.includes(IRON.toUpperCase())) throw new Error('the block has no iron edge');
    const bare = [...host.querySelectorAll('[stroke]')]
      .filter((n) => (n.getAttribute('stroke') || '').toUpperCase() === STIPPLE.toUpperCase());
    if (bare.length) throw new Error('something is stroked in stipple, at 1.53:1 on Bone');
    return `named "${block.querySelector('title').textContent.slice(0, 60)}…", framed in iron, no figure on it`;
  });

  ok('the drawing', 'every drawing carries a plain-English sentence', () => {
    const svgs = [...host.querySelectorAll('svg')];
    const missing = svgs.filter((s) => !(s.getAttribute('aria-label') || '').trim());
    if (missing.length) throw new Error(`${missing.length} drawings with no accessible name`);
    return `${svgs.length} drawings, every one stamped ${svgs[0].getAttribute('data-alt-source')}`;
  });

  ok('the drawing', 'a drawing agrees with its own accessible name', () => {
    /* The lesson from the auction band: a mark that drew rounded dollars while
     * its spoken sentence carried cents gave sighted and screen-reader readers
     * two different numbers from one object. Every figure in a row's alt is the
     * mark's own answer, so this asserts the drawn short form is inside it. */
    for (const r of rows) {
      if (!r.alt.includes(r.figure)) throw new Error(`${r.id}: "${r.figure}" is not in its own alt`);
    }
    return `${rows.length} drawings, and the figure a reader sees is the figure a reader hears`;
  });

  ok('the drawing', 'the token column has one mark per reading', () => {
    const tokens = host.querySelectorAll('.p2-toll-row .p2-toll-token');
    if (tokens.length !== rows.length) throw new Error(`${tokens.length} tokens for ${rows.length} rows`);
    return `${tokens.length} tokens, in ${new Set([...tokens].map((t) => t.dataset.form)).size} forms`;
  });

  /* THE TWO CHANNELS, MEASURED OFF THE LAID-OUT PAGE RATHER THAN INTENDED.
   *
   * The page asks for exactly one thing to be read straight down — the token
   * that says who produced the figure — and for nothing to be read across. It
   * used to have that the wrong way round: the plates were indented by a whole
   * number of 22px steps, which moved the token column by up to 168px down the
   * page, while the bars that must not be compared were staggered by 6px each
   * and drawn at one length. Both of these rows measure `getBoundingClientRect`,
   * because a layout intention is not a layout. */
  ok('the drawing', 'the token column reads straight down the page', () => {
    const tokens = [...host.querySelectorAll('.p2-toll-row .p2-toll-token')];
    if (tokens.length < ERA_COUNT) throw new Error('too few tokens drawn to measure a column');
    const lefts = tokens.map((t) => Math.round(t.getBoundingClientRect().left));
    const drift = Math.max(...lefts) - Math.min(...lefts);
    if (drift > 1) throw new Error(`the token column wanders ${drift}px across the page`);
    return `${tokens.length} tokens on ${ERA_COUNT} plates, and ${drift}px of drift between the ` +
      'leftmost and the rightmost of them. The page indent used to put 168px there.';
  });

  ok('the drawing', 'no two bars can be measured against each other on the page', () => {
    const bars = [...host.querySelectorAll('.p2-toll-bar')].map((g) => g.querySelector('rect'));
    if (bars.length !== rows.length) throw new Error(`${bars.length} bars drawn for ${rows.length} rows`);
    const box = bars.map((b) => b.getBoundingClientRect());
    const round = (v) => Math.round(v * 2) / 2;
    for (const channel of ['left', 'right', 'width']) {
      const values = box.map((b) => round(b[channel]));
      if (new Set(values).size !== values.length) {
        throw new Error(`two drawn bars share a ${channel} on screen`);
      }
    }
    const widths = box.map((b) => b.width);
    return `${bars.length} drawn bars, ${Math.round(Math.min(...widths))}px to ` +
      `${Math.round(Math.max(...widths))}px wide, no two sharing a left edge, a right edge or a ` +
      'length on screen';
  });

  ok('the drawing', 'a payout draws no rust, no valve and no cup', () => {
    const paid = [...host.querySelectorAll('.p2-toll-row[data-measures="paid"]')];
    if (!paid.length) throw new Error('no payout rows drawn, so this row saw nothing');
    for (const el of paid) {
      if (el.querySelector('.p2-toll-wedge')) throw new Error('a rust wedge was drawn on a payout row');
      if (el.querySelector('.p2-toll-drop')) throw new Error('a valve pipe was drawn on a payout row');
      if (el.querySelector('.p2-toll-cup')) throw new Error('a cup was drawn under a payout row');
      if (!el.querySelector('.p2-toll-handover')) throw new Error('the payout is not drawn at all');
      const rust = [...el.querySelectorAll('[fill], [stroke]')]
        .flatMap((n) => [n.getAttribute('fill'), n.getAttribute('stroke')])
        .filter((v) => v && v.toUpperCase() === RUST.toUpperCase());
      if (rust.length) throw new Error(`${rust.length} rust marks on a row that handed its money on`);
      const said = [...el.querySelectorAll('text')].map((t) => t.textContent).join(' ');
      if (!/handed on/i.test(said)) throw new Error('the drawing does not say where the money went');
    }
    return `${paid.length} payout rows: brass at the far end, a pipe off the page, and not one ` +
      'rust mark between them';
  });

  ok('the drawing', 'every drawn row says which field of the record put it that way', () => {
    /* Read off the DOM rather than off the plan, because the sentence a reader
     * gets is the one on the page. It names the field and quotes the record's
     * own words, so a reader who doubts the direction has somewhere to look. */
    const drawn = [...host.querySelectorAll('.p2-toll-row')];
    if (drawn.length !== rows.length) throw new Error(`${drawn.length} rows drawn for ${rows.length}`);
    for (const el of drawn) {
      const row = rows.find((r) => r.id === el.dataset.id);
      if (el.dataset.measuresFrom !== row.measuresFrom) {
        throw new Error(`${row.id} is drawn saying it read the ${el.dataset.measuresFrom}`);
      }
      const said = el.querySelector('.p2-toll-measures-why');
      if (!said) throw new Error(`${row.id} does not say where its direction came from`);
      if (said.textContent !== directionSentence({ from: row.measuresFrom, phrase: row.measuresPhrase })) {
        throw new Error(`${row.id} prints a sentence its own derivation does not give`);
      }
      if (!said.textContent.includes(`"${row.measuresPhrase}"`)) {
        throw new Error(`${row.id} does not quote the record's own words`);
      }
    }
    return `${drawn.length} rows, each quoting the record's own words for its direction · ` +
      `${drawn.filter((el) => el.dataset.measuresFrom === 'unit').length} off the unit, the rest ` +
      'off the head of the statement';
  });

  ok('the drawing', 'a span-only cut is painted to its low end and no further', () => {
    /* THE MEASUREMENT THE PAGE SHIPPED WITHOUT. `drawWedge` used to fill the
     * certain part and the uncertain part with the same rust hatch, so a claim
     * reading "somewhere between ten and fifty" drew as a solid fifty. */
    const spans = [...host.querySelectorAll('.p2-toll-row[data-form="span"][data-measures="kept"]')];
    if (!spans.length) throw new Error('no span-only cuts drawn, so this row saw nothing');
    const seen = [];
    for (const el of spans) {
      const id = el.dataset.id;
      const row = rows.find((r) => r.id === id);
      const painted = el.querySelector('.p2-toll-wedge rect');
      const drawn = Number(painted.getAttribute('width'));
      const lo = Number((row.wedge.xAtLo - row.bar.x).toFixed(2));
      const hi = Number((row.wedge.xAtHi - row.bar.x).toFixed(2));
      if (Math.abs(drawn - lo) > 0.5) {
        throw new Error(`${id} paints ${drawn}px where its low end is ${lo}px`);
      }
      if (drawn >= hi) throw new Error(`${id} paints as far as its own high end`);
      if (!el.querySelector('.p2-toll-reach')) throw new Error(`${id} draws no reach past what it painted`);
      seen.push(`${id} paints ${drawn}px of a ${hi}px reach`);
    }
    return `${seen.join(' · ')} — the rest is barred at both ends and filled with nothing`;
  });

  /* ================================================================
   * 8 · EVERY READER-FACING STRING IS READ BY SOMETHING
   *
   * The lesson from the auction bench: thirteen strings taught a false claim
   * with every guard green, because those surfaces were never scanned.
   * Coverage of surfaces matters as much as strength of checks.
   * ================================================================ */

  census('the strings', 'the prose lint, over every string on the rendered page', () => {
    const strings = view.sentences();
    if (strings.length < 50) throw new Error(`only ${strings.length} strings came off the page`);
    const findings = strings.flatMap((s) => guards.lintTextForDeadMechanism(s, 'the toll plates'));
    return `${strings.length} rendered strings scanned, ${findings.length} finding(s). ` +
      'AN EMPTY RESULT IS NOT A CLEARANCE: the lint is a regex over English and knows one claim.';
  });

  ok('the strings', 'every sentence the plan carries reaches the page', () => {
    /* Containment rather than equality: a rendered leaf may carry a planned
     * sentence with a prefix on it — "why this claim: …" — and a `<title>` may
     * carry two. What is being asserted is coverage, and coverage is the thing
     * the auction bench lost thirteen strings to. */
    const onPage = view.sentences();
    const missing = planSentences(plan).filter((s) => !onPage.some((t) => t.includes(s)));
    if (missing.length) throw new Error(`${missing.length} not on screen: ${missing[0].slice(0, 90)}`);
    return `${planSentences(plan).length} planned sentences, every one of them on the page`;
  });

  ok('the strings', 'no drawn string spells a plate count the page does not hold', () => {
    const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };
    const bad = [];
    for (const s of view.sentences()) {
      for (const [w, n] of Object.entries(words)) {
        for (const noun of ['plates', 'eras', 'machines']) {
          if (new RegExp(`\\b${w}\\s+${noun}\\b`, 'i').test(s) && n !== plan.plateCount) {
            bad.push(`"${w} ${noun}" where the page holds ${plan.plateCount}`);
          }
        }
      }
    }
    if (bad.length) throw new Error(bad.join('; '));
    return `every count of plates in the prose is ${plan.plateCount}, derived from the plan`;
  });

  ok('the strings', 'every plate spells its own bar count correctly', () => {
    for (const plate of plan.plates) {
      const want = `holds ${countWord(plate.rows.length)} bar`;
      if (!plate.alt.includes(want)) {
        throw new Error(`era ${plate.era} holds ${plate.rows.length} bars and its alt does not say "${want}"`);
      }
    }
    return plan.plates.map((p) => `e${p.era} ${countWord(p.rows.length)}`).join(' · ');
  });

  /* ================================================================
   * 9 · THE BRANCH THE RECORD DOES NOT RUN
   *
   * A span-only ARRIVAL. Two of era 7's three readings count what arrived, and
   * both are inside the 60% cut today, so the arrival drawing's span-only half
   * has never run on real data. A forced cut is weaker than real data and much
   * stronger than a branch nobody has ever seen run. This is the same move the
   * chart bench makes on the GDP strip.
   * ================================================================ */

  await forcedCut(0.20, () => {
    const forced = planTollPlates(records, frozen, { context: 'the forced-cut plate set' });
    const arrivals = forced.plates[ERA_COUNT - 1].rows.filter((r) => r.measures === 'arrived');

    ok('the forced cut', 'an arrival with no middle value loses its edge', () => {
      if (!arrivals.length) throw new Error('no arrival rows at the forced cut');
      const spans = arrivals.filter((r) => r.form === 'span');
      if (!spans.length) throw new Error('the forced cut did not make any arrival span-only');
      for (const r of spans) if ('edgeX' in r.arrival) throw new Error(`${r.id} still carries an edge`);
      return `at a cut of 20%, ${spans.map((r) => r.id).join(', ')} lose their middle value, and ` +
        'the key that places the brass edge is not on them';
    });

    ok('the forced cut', 'the forced plate set still refuses every shape it should', () =>
      assertRowShapes(forced, 'the forced bench') && assertLastPlateGuard(forced, 'the forced bench'));

    const host2 = document.createElement('div');
    host.appendChild(host2);
    renderTollPlates(host2, forced);
    ok('the forced cut', 'the span-only arrival draws two barred ends and no edge', () => {
      const el = host2.querySelector('.p2-toll-row[data-measures="arrived"][data-form="span"] .p2-toll-arrival');
      if (!el) throw new Error('no span-only arrival was drawn');
      const said = [...host2.querySelectorAll('text')].map((t) => t.textContent);
      if (!said.some((t) => t.includes('no middle value'))) throw new Error('the drawing does not say so');
      return 'drawn with both ends barred, and the words "no middle value" printed on it';
    });
    host2.remove();

    throws('the forced cut', 'a plan built at one cut, re-opened at another', () => {
      guards.resetRules();
      openTollPlan(forced, 'the bench after the cut moved back');
    }, 'when its interval is');
  });

  /* ================================================================
   * 10 · GROUNDING
   * ================================================================ */

  ok('grounding', 'G8 is asserted at import, on the fact field', () => `TIME_FIELD is "${TIME_FIELD}"`);

  throws('grounding', 'the year read off the provenance field', () =>
    guards.assertTimeField('as_of', 'the toll plate'), 'as_of');

  throws('grounding', 'a wide claim asked for a point mark', () =>
    planClaimMark(FIXTURE_WIDE, { year: 1900, label: 'a fixture' }) && guards.drawMark(FIXTURE_WIDE, 'point'),
  'wide|point');

  ok('grounding', 'the relation vocabulary matches the toll counts', () => {
    for (const spec of PLATES) {
      const rule = RELATION[spec.relation];
      if (spec.tolls.length < rule.min || spec.tolls.length > rule.max) {
        throw new Error(`era ${spec.era} says "${spec.relation}" and has ${spec.tolls.length}`);
      }
    }
    return PLATES.map((p) => `e${p.era} ${p.relation}`).join(' · ');
  });

  ok('grounding', 'every visibility class the table uses is a class the page draws', () => {
    const used = new Set(allTolls().map((t) => t.visibility));
    for (const v of used) if (!VISIBILITY[v]) throw new Error(`${v} has no drawn form`);
    return `${used.size} of ${Object.keys(VISIBILITY).length} classes are in use on this page`;
  });

  ok('grounding', 'the forbidden key list is not empty', () => {
    if (!FORBIDDEN_KEYS.length) throw new Error('nothing is forbidden, so that check passes on anything');
    return FORBIDDEN_KEYS.join(', ');
  });

  ok('grounding', 'the geometry is derived per base, not typed', () => {
    /* There is no `BAR.width` to check any more, and that is the point: the
     * thing this row used to prove — one length, seven origins — was the shared
     * scale. What is checked now is that no size in the band is a literal at a
     * draw site, and that the band itself is a band rather than a value. */
    if ('width' in BAR) throw new Error('BAR carries one width again');
    const geometry = baseGeometry(plan.bases, 'the bench');
    const widths = [...geometry.values()].map((b) => b.width);
    if (Math.min(...widths) < BAR.shortest || Math.max(...widths) > BAR.longest) {
      throw new Error('a bar is drawn outside the band');
    }
    return `${geometry.size} bars between ${BAR.shortest} and ${BAR.longest} long and ` +
      `${BAR.thinnest} to ${BAR.thickest} thick, at least ${BAR.apart}px apart, inside a ` +
      `${VIEW.width}×${VIEW.height} drawing · cup ${CUP.width}×${CUP.height} with a ` +
      `${CUP.poolDepth}px pool in every one of them`;
  });

  return results.slice();
}

/** Move the drawing convention, run a body, and always put it back. */
async function forcedCut(ratio, body) {
  guards.configureRules(
    { wideIntervalRatio: ratio },
    'the bench forces the span-only cut so the toll plate branches the frozen record never ' +
    'reaches are exercised at least once',
  );
  try { await body(); } finally { guards.resetRules(); }
}
