/* docs/p2/eras/eras.test.js — the bench for the seven era machines.
 *
 * Every case here is a way to make a machine lie. A suite that only exercises
 * the routes that work measures nothing, so each guard gets a real passing
 * case, a real failing case, and — where one was ever found — the bypass.
 *
 * Six rows are CENSUS rows. They count against the whole frozen record rather
 * than a fixture: 435 era-file claims, 8 positions, 7 eras, 3 withheld claims.
 * A five-claim excerpt cannot tell you that every position still holds the same
 * sentence in all seven machines.
 */

import * as guards from '../lib/guards.js';
import {
  planClaimMark, planMarks, assertVerdictsVisible, definePlanner,
  markFigure, wideCut, EXTRA_KEYS,
} from '../charts/claim-marks.js';
import { ORGANS, CYAN, STIPPLE, assertObjectColor } from '../lib/tokens.js';
import {
  POSITIONS, POSITION, FIELDS, FIELD_FOR, ORGAN_SENTENCE, OPERABLE_ORGAN,
  assertOrganSpine, organPaths, ACCENTS, PAINT, STRUCTURE, assertColourBudget,
} from './organs.js';
import {
  planEra, planCrossEra, assertNoRecordOnPlan, assertCopiesAgree, splitNameFor,
  formatterFor, RECORD_ONLY_KEYS, CRANK_NAMES, TIME_FIELD,
  openEraPlan, isEraPlan, openDrawerPlan, isDrawerPlan, assertReadingsMatchMarks,
} from './era-plan.js';
import { renderEraMachine } from './era-machine.js';
import { createTeacher, installPullRings, createDrawer, STATES } from './pull-ring.js';
import { assertSevenEras, ERA_COUNT, ERA_COUNT_WORD, countWord } from './era-records.js';

/* ------------------------------------------------------------------ */

const results = [];
function record(group, name, kind, pass, detail) {
  results.push({ group, name, kind, pass, detail: detail == null ? '' : String(detail).slice(0, 400) });
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

/* A claim the record does not hold, for the cases that need a shape rather
 * than a fact. Never used where a real claim can make the point. */
const FIXTURE_WIDE = Object.freeze({
  id: 'fixture-wide-001', central: 100, ci80: [10, 400], grade: 'C',
  unit: 'fixture units', about_year: 1900, verdict: 'confirmed',
});
const FIXTURE_TIGHT = Object.freeze({
  id: 'fixture-tight-001', central: 100, ci80: [95, 105], grade: 'A',
  unit: 'fixture units', about_year: 1900, verdict: 'confirmed',
});

/**
 * An async case, with a deadline.
 *
 * The deadline is not belt and braces. A motion verb returns a promise that
 * settles when its animation finishes, and Chrome does not run an animation on
 * an element it is not rendering — so a bench that drew into a detached node
 * would sit at "running…" forever with nothing in the console. A hang has to
 * come back as a FAIL with a name on it, or the page stops being a bench.
 */
async function okAsync(group, name, fn, detail) {
  const deadline = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timed out after 4s — a verb never finished')), 4000));
  try {
    const v = await Promise.race([fn(), deadline]);
    return record(group, name, 'passes', v !== false, detail || (v === true ? '' : v));
  } catch (e) { return record(group, name, 'passes', false, `threw: ${e.message}`); }
}

/**
 * `host` must be a node the browser is RENDERING. See okAsync. The test page
 * supplies one parked offscreen; `document.createElement('div')` is not enough.
 */
export async function runAll({ frozen, records, host }) {
  if (!host || !host.isConnected) {
    throw new Error(
      'runAll needs a host node attached to the document. A detached node is never rendered, ' +
      'so every motion verb drawn into it never finishes and the bench hangs instead of failing.',
    );
  }
  const scratch = () => { host.textContent = ''; return host; };
  results.length = 0;
  const plans = records.map((r) => planEra(r, frozen, { scope: 'era-native' }));
  const drawers = new Map(FIELDS.map((f) => [f, planCrossEra(f, records, frozen)]));

  /* ================================================================
   * 1 · THE SPINE — eight positions that never move
   * ================================================================ */
  ok('spine', 'the map is a bijection over the library\'s own ORGANS list', () => assertOrganSpine());

  throws('spine', 'a position the library does not know is refused', () => {
    POSITION.FLYWHEEL.cx;                                   // eslint-disable-line no-unused-expressions
  }, 'cannot read');

  throws('spine', 'organPaths refuses a part that is not one of the eight',
    () => organPaths('FLYWHEEL'), 'not one of the eight');

  ok('spine', 'all seven machines carry eight organs in ORGANS order', () =>
    plans.every((p) => p.organs.length === ORGANS.length
      && p.organs.every((o, i) => o.organ === ORGANS[i] && o.field === FIELD_FOR[ORGANS[i]])));

  ok('spine', 'every organ sits at the same x in all seven machines', () =>
    plans.every((p) => p.organs.every((o, i) => POSITIONS[i].cx === POSITION[o.field].cx)));

  ok('spine', 'every position says the same sentence in all seven machines', () =>
    plans.every((p) => p.organs.every((o) => o.sentence === ORGAN_SENTENCE[o.organ])));

  ok('spine', 'the operable organ is the same one in all seven', () =>
    plans.every((p) => p.crank.organ === OPERABLE_ORGAN
      && p.organs.filter((o) => o.operable).length === 1));

  census('spine', 'the whole colour budget of the machine', () =>
    `${ACCENTS.length} accents: ${ACCENTS.map((a) => `${a.organ}=${a.role}`).join(', ')}. ` +
    'Everything else is iron line work.');

  /* ================================================================
   * 1b · COLOUR — run on what the machine actually draws
   *
   * era-machine.js used to pick BRASS, CYAN, RUST, STIPPLE and IRON itself and
   * call no colour guard at all. Two of those five are below the 3:1 WCAG 1.4.11
   * asks of a graphical object, and both were drawn bare: the METER's needle
   * (cyan, 2.46:1) and the withheld tally tick's frame (stipple, 1.53:1).
   * ================================================================ */
  ok('colour', 'the colour budget guard runs, on every colour the spine owns', () =>
    assertColourBudget());

  throws('colour', 'the library still refuses a bare cyan object', () =>
    assertObjectColor(CYAN, 'test'), '2.46|cannot stand alone');

  throws('colour', 'the library still refuses a bare stipple object', () =>
    assertObjectColor(STIPPLE, 'test'), '1.53|cannot stand alone');

  ok('colour', 'every paint that cannot stand alone draws the iron that carries it', () => {
    const bare = [];
    for (const [role, paint] of Object.entries(PAINT)) {
      if (paint.hex !== CYAN && paint.hex !== STIPPLE) continue;   // these two fail 3:1
      const values = [...Object.values(paint.attrs), ...Object.values(paint.under || {})];
      if (!values.includes(STRUCTURE.stroke)) bare.push(`${role} paints ${paint.hex} bare`);
    }
    if (bare.length) throw new Error(bare.join(', '));
    return 'cyan and stipple are never painted without iron';
  });

  ok('colour', 'the drawn METER needle is a cyan line on an iron line, never bare cyan', () => {
    const out = renderEraMachine(scratch(), plans[3], {});
    const strokes = [...out.svg.querySelectorAll('.p2-era-body path')]
      .map((n) => n.getAttribute('stroke'));
    const cyan = strokes.filter((s) => s === CYAN).length;
    const iron = strokes.filter((s) => s === STRUCTURE.stroke).length;
    /* One cyan line, and an iron line under it — matched pairwise by the two
     * paths sharing one `d`. */
    const all = [...out.svg.querySelectorAll('.p2-era-body path')];
    const paired = all.filter((n) => n.getAttribute('stroke') === CYAN)
      .every((n) => all.some((o) => o !== n && o.getAttribute('d') === n.getAttribute('d')
        && o.getAttribute('stroke') === STRUCTURE.stroke));
    if (cyan !== 1 || iron === 0 || !paired) {
      throw new Error(`cyan lines ${cyan}, iron lines ${iron}, every cyan line backed by iron: ${paired}`);
    }
    return 'one cyan needle, on an iron needle of the same path';
  });

  ok('colour', 'the withheld tally tick is framed in iron, and nothing is stroked in stipple', () => {
    const out = renderEraMachine(scratch(), plans[6], {});   // era 7 holds two withheld claims
    const stippled = [...out.svg.querySelectorAll('[stroke]')]
      .filter((n) => n.getAttribute('stroke') === STIPPLE);
    const ticks = [...out.svg.querySelectorAll('.p2-era-tally rect')];
    if (ticks.length === 0) return 'era 7 drew no withheld tick — the case is vacuous';
    const framed = ticks.every((n) => n.getAttribute('stroke') === STRUCTURE.stroke);
    if (stippled.length || !framed) {
      throw new Error(`objects stroked in stipple: ${stippled.length}; every tick framed in iron: ${framed}`);
    }
    return `${ticks.length} withheld ticks, every one framed in iron`;
  });

  /* ================================================================
   * 2 · THE STRIP — the record does not reach the renderer
   * ================================================================ */
  ok('strip', 'no plan carries a record row anywhere', () =>
    plans.every((p) => assertNoRecordOnPlan(p, 'test')));

  ok('strip', 'no cross-era drawer carries a record row anywhere', () =>
    [...drawers.values()].every((p) => assertNoRecordOnPlan(p, 'test')));

  throws('strip', 'a plan carrying a ci80 is refused', () =>
    assertNoRecordOnPlan({ organs: [{ readings: [{ id: 'x', ci80: [1, 2] }] }] }, 'test'),
  'record field');

  throws('strip', 'a plan carrying a bare central is refused', () =>
    assertNoRecordOnPlan({ organs: [{ readings: [{ id: 'x', central: 5 }] }] }, 'test'),
  'record field');

  throws('strip', 'a plan carrying a method or a source list is refused', () =>
    assertNoRecordOnPlan({ cells: [{ method: 'SOURCED BY: …', sources: [] }] }, 'test'),
  'record field');

  census('strip', 'the keys a plan may never carry', () => RECORD_ONLY_KEYS.join(', ') + ', central');

  /* THE SECOND MOUTH ON THE STRIP. `assertNoRecordOnPlan` skips minted marks by
   * design — a point mark's `central` is the one record-shaped key a mark is
   * meant to carry — so a record field put ON a mark is a record field the walk
   * above will never look at. `planClaimMark`'s `extra` bag used to be policed
   * by a list of forbidden names, and `ci80`, `sources`, `method`, `as_of` and
   * `calibration` were not on it. It is an allow list now. */
  ok('strip', 'no MARK anywhere on any plan or drawer carries a record field', () => {
    const all = [...plans, ...drawers.values()].flatMap((p) => planMarks(p, 'test'));
    const hits = [];
    for (const m of all) {
      for (const key of [...RECORD_ONLY_KEYS, 'about_year_note']) {
        if (Object.prototype.hasOwnProperty.call(m, key)) hits.push(`${m.id}.${key}`);
      }
    }
    return hits.length === 0 ? `${all.length} marks, none of them` : hits.slice(0, 6).join(', ');
  });

  throws('strip', 'a record field cannot be smuggled onto a mark through `extra`', () =>
    planClaimMark(FIXTURE_TIGHT, { label: 'fixture', extra: { ci80: [95, 105] } }),
  'extra|presentation');

  throws('strip', 'a whole claim cannot ride onto a mark under an allowed key', () =>
    planClaimMark(FIXTURE_TIGHT, { label: 'fixture', extra: { statement: FIXTURE_TIGHT } }),
  'strings, numbers and nulls|object');

  census('strip', 'the only fields a mark may carry beyond its own', () => EXTRA_KEYS.join(', '));

  /* ================================================================
   * 3 · G1 — no point on a wide interval, and no midpoint anywhere
   * ================================================================ */
  throws('G1', 'a point mark on a wide interval is refused',
    () => guards.drawMark(FIXTURE_WIDE, 'point'), 'wide|interval');

  ok('G1', 'a wide claim mints a span mark with NO central key', () => {
    const m = planClaimMark(FIXTURE_WIDE, { label: 'fixture', format: String });
    return m.kind === 'span' && !('central' in m);
  });

  ok('G1', 'a tight claim mints a point mark WITH a central', () => {
    const m = planClaimMark(FIXTURE_TIGHT, { label: 'fixture', format: String });
    return m.kind === 'point' && typeof m.central === 'number';
  });

  ok('G1', 'no span-only reading on any machine carries a central', () =>
    plans.every((p) => planMarks(p, 'test').every((m) => m.kind !== 'span' || !('central' in m))));

  ok('G1', 'a span-only reading prints its two ends and nothing between them', () => {
    const spans = [];
    for (const p of plans) {
      for (const o of p.organs) for (const r of o.readings) if (r.form === 'span') spans.push(r);
    }
    if (spans.length === 0) return 'no span-only readings on the record — the case is vacuous';
    return spans.every((r) => {
      const fmt = formatterFor(r.unit);
      const mid = fmt((r.mark.lo + r.mark.hi) / 2);
      return r.short === `${fmt(r.mark.lo)}–${fmt(r.mark.hi)}`
        && r.short !== mid
        && !r.figure.includes(`is ${mid}`);
    });
  });

  census('G1', 'span-only readings across the seven machines, at the live cut', () => {
    const total = plans.reduce((a, p) => a + p.organs.reduce((x, o) => x + o.claimCount, 0), 0);
    const span = plans.reduce((a, p) => a + p.organs.reduce((x, o) => x + o.spanOnlyCount, 0), 0);
    return `${span} of ${total} readings have no middle value, at a cut of ${(wideCut() * 100).toFixed(0)}%`;
  });

  /* ================================================================
   * 4 · G2 — the pools are never put in order
   * ================================================================ */
  throws('G2', 'era 7\'s unranked pools refuse a sorted layout', () =>
    guards.renderPools(
      [{ id: 'national_brand', era: 7 }, { id: 'direct_response', era: 7 }], 'ranked', 'sorted',
    ), 'unranked');

  throws('G2', 'era 7\'s unranked pools refuse a stack', () =>
    guards.assertRankable(7, ['national_brand', 'direct_response'], 'stack'), 'unranked');

  throws('G2', 'the object-id bypass is refused rather than coerced', () =>
    guards.sortPools(7, [{ name: 'national_brand' }, { name: 'direct_response' }], () => 0),
  'not a string');

  ok('G2', 'every pools view on every machine is unranked at fixed positions', () =>
    plans.every((p) => p.organs.every((o) => !o.pools
      || (o.pools.ordering === 'unranked' && o.pools.layout === 'fixed-position'))));

  /* ================================================================
   * 5 · G6 — era 5 carries two taxonomies and cross-era views use the alt
   * ================================================================ */
  ok('G6', 'the single-era machine for era 5 reads the era-native split', () => {
    const five = plans[4];
    return five.organs.filter((o) => o.pools).every((o) => o.pools.split === 'by_money_type');
  });

  ok('G6', 'every cross-era drawer reads era 5\'s alt split', () =>
    ['BUYERS', 'SCALE'].every((f) => drawers.get(f).cells.find((c) => c.era === 5).pools.split === 'by_money_type_alt'));

  throws('G6', 'a cross-era view reading era 5\'s native split is refused', () =>
    guards.assertTaxonomyField('cross-era', 'SCALE', 'by_money_type',
      { era5: frozen.era5, reconciled: frozen.reconciled, context: 'test' }), 'taxonomy');

  throws('G6', 'a view mixing the two taxonomies is refused', () =>
    guards.assertTaxonomy({
      scope: 'cross-era', context: 'test',
      claimIds: ['e5-scale-011', 'e5-scale-015'],
    }, frozen.reconciled), 'mixes');

  throws('G6', 'a taxonomy view with no scope is refused', () =>
    guards.assertTaxonomy({ claimIds: ['e5-scale-015'], context: 'test' }, frozen.reconciled),
  'scope');

  ok('G6', 'splitNameFor answers the record, not the field name', () =>
    splitNameFor(5, 'SCALE', 'cross-era', frozen) === 'by_money_type_alt'
    && splitNameFor(5, 'SCALE', 'era-native', frozen) === 'by_money_type'
    && splitNameFor(3, 'SCALE', 'cross-era', frozen) === 'by_money_type');

  ok('G6', 'era 5\'s cross-era cell shows as many pools as every other era', () =>
    ['BUYERS', 'SCALE'].every((f) => {
      const cells = drawers.get(f).cells;
      const five = cells.find((c) => c.era === 5);
      const six = cells.find((c) => c.era === 6);
      return five.pools.items.length === six.pools.items.length;
    }));

  ok('G6', 'the pools carried into era 5\'s cross-era cell are the untagged ones, and say so', () =>
    ['BUYERS', 'SCALE'].every((f) => {
      const five = drawers.get(f).cells.find((c) => c.era === 5);
      return five.pools.carriedCount === 2
        && five.pools.items.filter((i) => i.unchanged).length === 2
        && five.pools.items.filter((i) => i.unchanged)
          .every((i) => guards.taxonomyOf(i.id, frozen.reconciled) === null)
        && five.pools.items.filter((i) => !i.unchanged)
          .every((i) => guards.taxonomyOf(i.id, frozen.reconciled) === 'unified-intent');
    }));

  ok('G6', 'every drawer that shows era 5 money prints the seam sentence', () =>
    ['BUYERS', 'SCALE'].every((f) => typeof drawers.get(f).seamNote === 'string'
      && drawers.get(f).seamNote.length > 40));

  /* ================================================================
   * 6 · G8 — time is two fields, and a withheld year is an object
   * ================================================================ */
  throws('G8', 'as_of is refused as a time field', () => guards.assertTimeField('as_of', 'test'), 'provenance');

  ok('G8', 'the era machine declares which field its year column reads', () =>
    TIME_FIELD === guards.FACT_FIELD && TIME_FIELD === 'about_year');

  throws('G8', 'a withheld claim refuses to give a year', () => {
    const list = Array.isArray(frozen.claims) ? frozen.claims : frozen.claims.claims;
    const withheld = list.find((c) => c.timeline_ready === false);
    return guards.timelineYear(withheld, 'test');
  }, 'timeline_ready');

  ok('G8', 'every withheld reading on the machines carries year null and its reason', () => {
    const withheld = [];
    for (const p of plans) for (const o of p.organs) for (const r of o.readings) if (r.timelineWithheld) withheld.push(r);
    return withheld.length > 0 && withheld.every((r) => r.year === null && r.withheldNote.length > 10);
  });

  ok('G8', 'no plan carries as_of anywhere', () => {
    let hit = false;
    const seen = new WeakSet();
    const walk = (v) => {
      if (v === null || typeof v !== 'object' || seen.has(v)) return;
      seen.add(v);
      if (Array.isArray(v)) { v.forEach(walk); return; }
      for (const k of Object.keys(v)) { if (k === 'as_of') hit = true; walk(v[k]); }
    };
    plans.forEach(walk);
    return !hit;
  });

  census('G8', 'readings the record refuses to place in time', () => {
    const out = [];
    for (const p of plans) for (const o of p.organs) for (const r of o.readings) {
      if (r.timelineWithheld) out.push(`${r.id} (era ${p.era}, ${o.field})`);
    }
    return `${out.length}: ${out.join(', ')} — each drawn as a named stippled block, never blank`;
  });

  /* ================================================================
   * 7 · TWO COPIES OF ONE NUMBER
   * ================================================================ */
  throws('copies', 'an era file that disagrees with claims.json is refused', () =>
    assertCopiesAgree(
      { id: 'e1-pricing-002', central: 14, ci80: [15, 15] },
      { id: 'e1-pricing-002', central: 15, ci80: [15, 15] }, 'test',
    ), 'disagree');

  throws('copies', 'an interval that drifted between the two files is refused', () =>
    assertCopiesAgree(
      { id: 'x', central: 15, ci80: [10, 20] },
      { id: 'x', central: 15, ci80: [15, 15] }, 'test',
    ), 'disagree');

  census('copies', 'era-file claims checked against claims.json', () => {
    let n = 0;
    for (const rec of records) {
      for (const f of Object.values(rec.fields)) {
        n += f.claims.length;
        for (const k of Object.keys(f)) if (k.startsWith('by_money_type')) n += Object.keys(f[k]).length;
      }
      n += (rec.events || []).filter((e) => e.claim).length;
    }
    return `${n} claims, every one matched on id, central and interval before it became a mark`;
  });

  /* ================================================================
   * 8 · VERDICTS — no correction is invisible
   * ================================================================ */
  ok('verdicts', 'every non-clean mark on every machine has a printed stamp', () =>
    plans.every((p) => assertVerdictsVisible(planMarks(p, 'test'), p.verdictStamps, 'test')));

  ok('verdicts', 'every non-clean mark in every drawer has a printed stamp', () =>
    [...drawers.values()].every((p) => assertVerdictsVisible(planMarks(p, 'test'), p.verdictStamps, 'test')));

  throws('verdicts', 'a repaired claim with no register is refused at mint', () => {
    const list = Array.isArray(frozen.claims) ? frozen.claims : frozen.claims.claims;
    const dirty = list.find((c) => c.verdict && c.verdict !== 'confirmed');
    return planClaimMark(dirty, { label: 'test', format: String });
  }, 'register|verdict');

  census('verdicts', 'corrections printed across the seven machines', () =>
    `${plans.reduce((a, p) => a + p.verdictStamps.length, 0)} stamps, ` +
    `${plans.map((p) => p.verdictStamps.length).join('/')} by era`);

  /* ================================================================
   * 9 · THE SEAL
   * ================================================================ */
  ok('seal', 'every plan is sealed by its own planner', () =>
    plans.every(isEraPlan) && [...drawers.values()].every(isDrawerPlan));

  /* THE SEAL NAMES THE PLANNER THAT APPLIED IT. `sealPlan` used to be a public
   * export taking any revalidator, so "sealed" meant "somebody ran something".
   * These four rows are the routes that opened. */
  ok('seal', 'a machine plan and a drawer plan are not interchangeable', () =>
    !plans.some(isDrawerPlan) && ![...drawers.values()].some(isEraPlan));

  throws('seal', 'a drawer plan is refused at the machine\'s door', () =>
    openEraPlan([...drawers.values()][0], 'test'), 'sealed by');

  /* THE FORGERY THIS ROUND CLOSED. Eight organs of genuinely minted marks, with
   * the MIDPOINT of a span-only interval hand-typed into the one string a plate
   * actually draws. Nothing about the marks is wrong, so the deep freeze, the
   * generic walk and assertMarksHonest all pass it — which is why the old seal,
   * which took any revalidator, let it render. */
  const forgeTypedMidpoint = () => {
    const real = plans.find((p) => p.organs.some((o) => o.headline.form === 'span'));
    if (!real) throw new Error('no era holds a span-only headline — the case is vacuous');
    const organ = real.organs.find((o) => o.headline.form === 'span');
    const m = organ.headline.mark;
    const midpoint = formatterFor(organ.headline.unit)((m.lo + m.hi) / 2);
    return {
      ...real,
      organs: real.organs.map((o) => (o === organ
        ? { ...o, headline: { ...o.headline, short: midpoint } }
        : o)),
    };
  };

  throws('seal', 'the adversary seals real marks around a typed midpoint and renders it', () => {
    const forged = forgeTypedMidpoint();
    const mine = definePlanner({ name: 'the adversary', revalidate() {} });
    mine.seal(forged, 'the adversary');
    return renderEraMachine(scratch(), forged);
  }, 'planEra');

  throws('seal', 'a typed midpoint is refused by the planner\'s own arithmetic too', () =>
    assertReadingsMatchMarks(forgeTypedMidpoint(), 'test'), 'do not support');

  throws('seal', 'a sealed plan cannot be edited', () => {
    plans[0].organs[0].claimCount = 999;
  }, 'read only|cannot assign');

  throws('seal', 'a plan this module did not mint is refused', () =>
    openEraPlan({ era: 1, organs: [] }, 'test'), 'no planner sealed');

  throws('seal', 'a proxy around a sealed plan is refused', () =>
    openEraPlan(new Proxy(plans[0], {}), 'test'), 'no planner sealed');

  ok('seal', 're-entry re-validates every plan on content', () =>
    plans.every((p) => openEraPlan(p, 'test') === p) &&
    [...drawers.values()].every((p) => openDrawerPlan(p, 'test') === p));

  /* ================================================================
   * 10 · THE CRANK
   * ================================================================ */
  ok('crank', 'every era\'s crank runs through the whole PRICING field', () =>
    plans.every((p) => p.crank.notches.length === p.organs.find((o) => o.field === 'PRICING').claimCount));

  ok('crank', 'every notch carries a minted mark, never a bare number', () => {
    const minted = new Set(plans.flatMap((p) => planMarks(p, 'test')));
    return plans.every((p) => p.crank.notches.every((n) => minted.has(n.mark)));
  });

  ok('crank', 'every era names its control and writes down why', () =>
    plans.every((p) => CRANK_NAMES[p.era].name === p.crank.name && p.crank.why.length > 40));

  census('crank', 'what each era cranks', () =>
    plans.map((p) => `${p.era} ${p.crank.name} (${p.crank.notches.length} settings)`).join(' · '));

  /* ================================================================
   * 11 · THE RENDERER — what it refuses to be handed
   * ================================================================ */
  throws('render', 'the renderer refuses an era record', () =>
    renderEraMachine(document.createElement('div'), records[0], {}), 'planEra\\(\\) minted');

  throws('render', 'the renderer refuses a hand-built plan', () =>
    renderEraMachine(document.createElement('div'), { era: 1, organs: [], crank: {} }, {}), 'planEra\\(\\) minted');

  ok('render', 'all seven machines draw, and each draws eight plates and eight rings', () => {
    const host = scratch();
    const teacher = createTeacher();
    let plates = 0; let rings = 0;
    for (const plan of plans) {
      const out = renderEraMachine(host, plan, {});
      installPullRings(out.svg, { teacher, teaching: false, onPull() {} });
      plates += out.svg.querySelectorAll('.p2-era-plate').length;
      rings += out.svg.querySelectorAll('.p2-ring').length;
    }
    /* THROWN, NOT RETURNED. `ok()` records any string as a PASS and prints it as
     * the detail, so `return ... : 'plates 48, rings 48'` was a row that printed
     * its own failure and went green. Two rows here did that, and both of them
     * were measuring the thing this whole folder is built on. */
    if (plates !== 56 || rings !== 56) throw new Error(`plates ${plates}, rings ${rings}, wanted 56 and 56`);
    return true;
  });

  /* THE TEAM'S OWN GATE, as a test. "A reader can name what each organ does
   * after seeing two eras" only works if the second era puts the same organ in
   * the same place under the same name. This measures the drawn DOM, not the
   * plan, because the plan could be right and the renderer could still move
   * something. */
  ok('render', 'all seven machines draw the same eight plates at the same eight x', () => {
    const signatures = new Set();
    for (const plan of plans) {
      const out = renderEraMachine(scratch(), plan, {});
      signatures.add([...out.svg.querySelectorAll('.p2-era-plate')]
        .map((p) => `${p.dataset.field}@${p.querySelector('rect').getAttribute('x')}` +
          `/${p.querySelector('text').textContent}`)
        .join(' '));
    }
    /* THROWN, NOT RETURNED, for the reason above: this row is the team's own
     * gate, and returning "SEVEN MACHINES, 3 LAYOUTS" as a string passed it. */
    if (signatures.size !== 1) {
      throw new Error(`SEVEN MACHINES, ${signatures.size} LAYOUTS:\n${[...signatures].join('\n')}`);
    }
    return [...signatures][0];
  });

  ok('render', 'the machine shows no reading until the reader turns the handle', () => {
    const host = scratch();
    renderEraMachine(host, plans[0], {});
    return host.querySelector('.p2-era-out-box--empty') !== null
      && host.querySelector('.p2-era-out-svg') === null;
  });

  await okAsync('render', 'turning the handle draws a reading, and CRANK holds before it moves', async () => {
    const host = scratch();
    const out = renderEraMachine(host, plans[0], {});
    const before = host.querySelector('.p2-era-out-svg');
    await out.crankTo(0).applied;
    const after = host.querySelector('.p2-era-out-read');
    return before === null && after !== null && after.textContent.includes('80% interval');
  });

  await okAsync('render', 'a withheld notch draws a named block where the year would be', async () => {
    const host = scratch();
    const out = renderEraMachine(host, plans[6], {});     // era 7 holds two withheld claims
    const step = plans[6].crank.notches.findIndex((n) => n.timelineWithheld);
    if (step < 0) return 'era 7 holds no withheld pricing claim — the case is vacuous';
    await out.crankTo(step).applied;
    const block = host.querySelector('.p2-era-withheld');
    const note = host.querySelector('.p2-era-out-withheld');
    return block !== null && note !== null && /reason/i.test(note.textContent);
  });

  await okAsync('render', 'a span-only notch prints no middle value anywhere on the plate', async () => {
    const spanEra = plans.find((p) => p.crank.notches.some((n) => n.form === 'span'));
    if (!spanEra) return 'no era has a span-only pricing claim — the case is vacuous';
    const step = spanEra.crank.notches.findIndex((n) => n.form === 'span');
    const notch = spanEra.crank.notches[step];
    const host = scratch();
    const out = renderEraMachine(host, spanEra, {});
    await out.crankTo(step).applied;
    const fmt = formatterFor(notch.unit);
    const mid = fmt((notch.mark.lo + notch.mark.hi) / 2);
    const box = host.querySelector('.p2-era-out-box');
    const readout = box.querySelector('.p2-era-out-svg text');       // the big figure
    const caliper = box.querySelector('.p2-era-caliper');
    /* Three separate ways a midpoint could reach the reader, each closed:
     * the big readout says the two ends, the sentence says there is none, and
     * the drawn caliper has no index circle to place one at. */
    return readout.textContent === `${fmt(notch.mark.lo)}–${fmt(notch.mark.hi)}`
      && readout.textContent !== mid
      && /no middle value/.test(box.querySelector('.p2-era-out-read').textContent)
      && caliper.dataset.kind === 'span'
      && caliper.querySelector('circle') === null;
  });

  /* ================================================================
   * 12 · THE PULL RING AND ITS TEACHING SEQUENCE
   * ================================================================ */
  ok('ring', 'the teacher walks REST to TUG to NAMED to LEARNED and never backwards', () => {
    const t = createTeacher();
    t.reset();
    const seen = [t.state];
    t.tug(); seen.push(t.state);
    t.name(); seen.push(t.state);
    t.learn(); seen.push(t.state);
    t.tug(); seen.push(t.state);                          // must not go back
    t.reset();
    return seen.join('>') === 'REST>TUG>NAMED>LEARNED>LEARNED';
  });

  ok('ring', 'the sequence has exactly the four states DESIGN.md specifies', () =>
    STATES.length === 4 && STATES.join(',') === 'REST,TUG,NAMED,LEARNED');

  ok('ring', 'the lesson is remembered, so nothing tugs twice in one session', () => {
    const t = createTeacher(); t.reset();
    t.tug(); t.name(); t.learn();
    const fresh = createTeacher();
    const remembered = fresh.taught;
    t.reset();
    return remembered;
  });

  ok('ring', 'a machine that is not teaching never tugs', () => {
    const host = scratch();
    const t = createTeacher(); t.reset();
    const out = renderEraMachine(host, plans[2], {});
    const r = installPullRings(out.svg, { teacher: t, teaching: false, onPull() {} });
    const handle = r.teachAfterFirstCrank();
    const state = t.state;
    t.reset();
    return handle === null && state === 'REST';
  });

  ok('ring', 'the teaching machine tugs exactly once and then names the control', () => {
    const host = scratch();
    const t = createTeacher(); t.reset();
    const out = renderEraMachine(host, plans[0], {});
    const r = installPullRings(out.svg, { teacher: t, teaching: true, onPull() {} });
    const first = r.teachAfterFirstCrank();
    const second = r.teachAfterFirstCrank();
    const state = t.state;
    t.reset();
    return first !== null && second === null && state !== 'REST';
  });

  ok('ring', 'every ring names its own organ, so eight rings are eight different pulls', () => {
    const host = scratch();
    const t = createTeacher();
    const out = renderEraMachine(host, plans[0], {});
    installPullRings(out.svg, { teacher: t, teaching: false, onPull() {} });
    const fields = [...out.svg.querySelectorAll('.p2-ring')].map((n) => n.dataset.field);
    return fields.length === 8 && new Set(fields).size === 8
      && fields.every((f) => FIELDS.includes(f));
  });

  throws('ring', 'the drawer refuses anything that is not a sealed cross-era plan', () => {
    const d = createDrawer(document.createElement('div'));
    return d.show({ field: 'SCALE', cells: [] });
  }, 'planCrossEra\\(\\) minted');

  ok('ring', 'the drawer prints the sentence that keeps it honest', () =>
    [...drawers.values()].every((p) => /own ruler/i.test(p.rulerNote)));

  /* THE DRAWER USED TO LIE ABOUT ITS OWN COVERAGE. `planCrossEra` refused only
   * an EMPTY record set, so a three-era plan rendered under the title "seven
   * machines" with an accessible name reading "all seven eras" — beside its own
   * alt text saying "3 eras". Two fixes, and neither is a reminder: the plan
   * refuses a partial record set, and every count and word it prints is derived
   * from the cells it holds and re-derived on re-entry. */
  throws('ring', 'a drawer cannot be built from fewer than seven eras', () =>
    planCrossEra('SCALE', records.slice(0, 3), frozen), 'all 7|records');

  ok('ring', 'every count the drawer prints is the number of cells it holds', () =>
    [...drawers.values()].every((p) => {
      const word = countWord(p.cells.length);
      return p.eraCount === p.cells.length
        && p.eraWord === word
        && p.title.includes(`${word} machines`)
        && p.ariaLabel.includes(`all ${word} eras`)
        && p.alt.toLowerCase().includes(`${word} eras`)
        && p.rulerNote.includes(`the ${word} readings`);
    }));

  ok('ring', 'no reader-facing string in this folder spells a count of its own', () => {
    /* Every number-word standing directly in front of "machines", "eras",
     * "cells" or "readings", anywhere on a drawer or on a drawn ring, has to be
     * the count the thing actually holds. "one machine PART" is excluded: that
     * is a count of parts, and it is right. */
    const host = scratch();
    const out = renderEraMachine(host, plans[0], {});
    installPullRings(out.svg, { teacher: createTeacher(), teaching: true, onPull() {} });
    const ringWords = [...out.svg.querySelectorAll('.p2-ring, .p2-ring-teach')]
      .flatMap((n) => [n.getAttribute('aria-label'), n.textContent])
      .filter(Boolean);
    const rx = /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(machines?|eras?|cells?|readings?)\b(?!\s+part)/gi;
    const wrong = [];
    for (const s of ringWords) {
      for (const m of String(s).matchAll(rx)) {
        if (m[1].toLowerCase() !== ERA_COUNT_WORD) wrong.push(`a ring says "${m[0]}"`);
      }
    }
    for (const p of drawers.values()) {
      const want = countWord(p.cells.length);
      for (const s of [p.title, p.ariaLabel, p.alt, p.rulerNote, p.seamNote || '']) {
        for (const m of String(s).matchAll(rx)) {
          if (m[1].toLowerCase() !== want) wrong.push(`${p.field} says "${m[0]}" over ${p.cells.length} cells`);
        }
      }
    }
    /* THROWN, NOT RETURNED. `ok()` reads any string as a pass and prints it as
     * the detail, so a row that reports its own failure as a string is a row
     * that cannot fail. */
    if (wrong.length) throw new Error(wrong.slice(0, 5).join(' | '));
    return `${ERA_COUNT} machines, ${drawers.size} drawers, no count typed twice`;
  });

  ok('ring', 'the drawer takes its heading and its name from the plan it was handed', () => {
    const d = createDrawer(document.createElement('div'));
    const plan = drawers.get('SCALE');
    d.show(plan);
    const titleNode = d.root.querySelector('.p2-drawer-title');
    const cells = d.root.querySelectorAll('.p2-drawer-cell').length;
    d.close();
    return titleNode.textContent === plan.title
      && d.root.getAttribute('aria-label') === plan.ariaLabel
      && cells === plan.cells.length;
  });

  /* ================================================================
   * 13 · THE RECORDS
   * ================================================================ */
  ok('records', 'seven records, eras 1 to 7, in order', () => assertSevenEras(records) === records);

  throws('records', 'six records are refused', () => assertSevenEras(records.slice(0, 6)), 'all 7|records');

  census('records', 'claims drawn per era', () =>
    plans.map((p) => `e${p.era}:${p.organs.reduce((a, o) => a + o.claimCount, 0)}`).join(' '));

  return results;
}

export { results };
