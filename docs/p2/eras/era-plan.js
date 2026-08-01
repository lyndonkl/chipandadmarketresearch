/* docs/p2/eras/era-plan.js — ONE ERA RECORD IN, ONE SEALED PLAN OUT
 *
 * Team B3. No DOM in this file. Nothing here draws, and the renderer next door
 * cannot reach anything this file does not put on the plan.
 *
 * THE LESSON THIS FILE IS BUILT ON. The chart system rendered eight lies in its
 * first round because the guards ran in the planning pass and the RENDERER drew
 * from raw data anyway. The repair that worked was to STRIP: a span-only mark
 * carries no central at all, so the forbidden draw is impossible rather than
 * merely forbidden. This module applies the same move one level up. The era
 * record — 435 claims across seven files, each with a `central`, a `ci80`, a
 * `method` and a source list — NEVER REACHES THE RENDERER. What crosses is a
 * sealed plan of marks minted by `../charts/claim-marks.js` and strings. There
 * is no `claim` object on the plan, no `ci80`, no `central` outside a point
 * mark, no `sources`, no `method`. `assertNoRecordOnPlan()` walks the finished
 * plan and throws if one got through, and the test bench runs it over all seven.
 *
 * WHERE EACH NUMBER COMES FROM. The era files carry their own copy of every
 * claim. `claims.json` is the frozen single source of truth and it is the only
 * one carrying `verdict`, which decides whether a mark needs a printed
 * correction beside it. So this module reads the STRUCTURE from the era file —
 * which claim sits at which organ, the summaries, the events, the pools — and
 * the CLAIM from `claims.json`, and `assertCopiesAgree` throws if the two
 * disagree about a central or an interval. Two copies of one number is the
 * defect this project has hit at every stage; here it is checked rather than
 * assumed.
 */

import * as guards from '../lib/guards.js';
import {
  planClaimMark, markReading, markFigure, markTitle,
  verdictRegister, verdictStamps, assertVerdictsVisible, verdictVocabulary,
  definePlanner, planMarks, wideCutPercent,
} from '../charts/claim-marks.js';
import { POSITION, POSITIONS, FIELDS, OPERABLE_ORGAN, assertOrganSpine } from './organs.js';
import { ERA_COUNT, assertSevenEras, countWord } from './era-records.js';

export class EraPlanError extends Error {
  constructor(message, detail) { super(message); this.name = 'EraPlanError'; this.detail = detail; }
}

/**
 * G8, declared once at the top of the module that reads it.
 *
 * Every machine prints a year: on the output plate, in each organ's register,
 * and in each cell of a cross-era drawer. This is the one line that says which
 * field those years come from, and it throws on `as_of`. It runs at import, so
 * a later edit that swaps the field cannot be merged with a green page — 60 of
 * 506 claims would otherwise be printed at their source's publication date, the
 * worst of them 86 years out.
 */
export const TIME_FIELD = guards.assertTimeField(
  guards.FACT_FIELD, 'the era machine\'s year column',
);

/* ======================================================================
 * 1 · WHAT EACH ERA CRANKS
 *
 * One operable control per era, at the RULE position, in every era. Its notches
 * are that era's PRICING claims — all of them, in the record's own order, none
 * dropped. The name below is the control's NAME, not a number: what the reader
 * turns. Everything the readout says comes from a mark.
 *
 * `why` is greppable and it is the written reason a reviewer reads. G4's
 * `because` rule, applied to a choice G4 cannot see: which field the crank
 * operates on.
 * ====================================================================== */

export const CRANK_NAMES = Object.freeze({
  1: Object.freeze({
    name: 'THE COMMISSION',
    why: 'Era 1 prices space off a rate card nobody held to, and the number that moves is what ' +
      'the agent keeps out of it. PRICING carries the commission at both ends of the era.',
  }),
  2: Object.freeze({
    name: 'THE RATE CARD',
    why: 'Era 2 sells hours of transmitter time off a published card, and every other price in ' +
      'the era is a fraction of it or a discount off it. PRICING carries the card and its stack.',
  }),
  3: Object.freeze({
    name: 'THE SPOT RATE',
    why: 'Era 3 sells a unit of network time rather than a programme, so the price of one unit ' +
      'is the rule. PRICING carries the unit price and the take beside it.',
  }),
  4: Object.freeze({
    name: 'THE SEGMENT',
    why: 'Era 4 prices a targeted thousand and pays for the work in two different ways at once. ' +
      'PRICING carries the commission that survived and the response prices beside it.',
  }),
  5: Object.freeze({
    name: 'THE IMPRESSION',
    why: 'Era 5 copies the magazine and prices a thousand showings, while one seller starts ' +
      'pricing a click instead. PRICING carries both.',
  }),
  6: Object.freeze({
    name: 'THE AUCTION',
    why: 'Era 6 stops quoting a price at all and lets the runner-up set it. PRICING carries the ' +
      'auction, the discounter and the distribution share it ran on.',
  }),
  7: Object.freeze({
    name: 'THE ALGORITHM',
    why: 'Era 7 lets the seller tune the price against its own revenue target. PRICING carries ' +
      'the tunings, the take and what reaches the other end.',
  }),
});

/* ======================================================================
 * 2 · FORMATTING
 *
 * One formatter, and it never invents precision. It is handed to markReading
 * and markFigure, which are the only two ways a figure reaches a sentence.
 * ====================================================================== */

/** Digits that do not flatter: three significant figures, trailing zeros cut. */
function decimalsFor(value) {
  const v = Math.abs(value);
  if (v === 0) return 0;
  const d = 3 - Math.floor(Math.log10(v)) - 1;
  return Math.min(6, Math.max(0, d));
}

/**
 * A formatter bound to one claim's unit.
 *
 * The one special case is a unit that begins with "year". Those claims carry a
 * date encoded as a decimal year — `e6-pricing-001` is 2002.14 for 2002-02-20 —
 * and grouping it as "2,002.14" reads as a quantity. It is printed ungrouped so
 * it reads as what it is.
 */
export function formatterFor(unit) {
  const isYear = /^year\b/i.test(String(unit || ''));
  return (value) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new EraPlanError('the era machine was asked to print a value that is not a measured number.', value);
    }
    if (isYear) return value.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 2 });
    return value.toLocaleString('en-US', { maximumFractionDigits: decimalsFor(value) });
  };
}

/* ======================================================================
 * 3 · THE TWO COPIES
 * ====================================================================== */

let _claimIndex = null;
let _claimIndexSource = null;

/** id -> the frozen claim, built once per claims.json object. */
function claimIndex(claimsFile) {
  const file = claimsFile || guards.getFrozen('claims');
  if (!file) {
    throw new EraPlanError(
      'the era machine needs claims.json. It reads structure from the era file and the CLAIM ' +
      'from the frozen record, because only the frozen record carries `verdict` — and a mark ' +
      'whose verdict is "adjusted" or "rejected" must reach the reader with the correction on it.',
      null,
    );
  }
  if (_claimIndexSource === file) return _claimIndex;
  const list = Array.isArray(file) ? file : file.claims;
  if (!Array.isArray(list) || list.length === 0) {
    throw new EraPlanError('claims.json produced no claims.', file && Object.keys(file));
  }
  const index = new Map();
  for (const claim of list) index.set(claim.id, claim);
  _claimIndex = index;
  _claimIndexSource = file;
  return index;
}

/**
 * THROWING FORM. The era file's copy and the frozen record agree.
 *
 * WHY THIS EXISTS. Every one of the 435 claims in eras/era-1..7.json is also in
 * claims.json, and today all 435 agree on central and ci80. That is a fact about
 * today, not a property of the data: nothing in the repository checks it, and a
 * repair applied to one file and not the other is invisible in both. The whole
 * project's worst failures have been two copies of one number.
 */
export function assertCopiesAgree(eraCopy, canonical, where) {
  const same = (a, b) => (a === b) || (Array.isArray(a) && Array.isArray(b)
    && a.length === b.length && a.every((v, i) => v === b[i]));
  if (!same(eraCopy.central, canonical.central) || !same(eraCopy.ci80, canonical.ci80)) {
    throw new EraPlanError(
      `${where}: the era file and claims.json disagree about ${eraCopy.id}. The era files carry ` +
      'their own copy of every claim, and claims.json is the frozen source of truth. A repair ' +
      'applied to one file and not the other is invisible in both.',
      {
        id: eraCopy.id,
        era_file: { central: eraCopy.central, ci80: eraCopy.ci80 },
        claims_json: { central: canonical.central, ci80: canonical.ci80 },
      },
    );
  }
  return true;
}

/** The frozen claim behind an era-file entry, checked against the era file's copy. */
function canonicalClaim(eraCopy, where, claimsFile) {
  const found = claimIndex(claimsFile).get(eraCopy.id);
  if (!found) {
    throw new EraPlanError(
      `${where}: ${eraCopy.id} is in the era file and not in claims.json, so this module cannot ` +
      'read its verdict. It will not fall back to the era file\'s copy: a claim with no verdict ' +
      'draws with no correction beside it, and that is the failure stage R3b was spent repairing.',
      eraCopy.id,
    );
  }
  assertCopiesAgree(eraCopy, found, where);
  return found;
}

/* ======================================================================
 * 4 · ONE READING
 *
 * A reading is what one claim contributes to one organ. It is either a mark, or
 * — for a claim the record refuses to place in time — a mark with no year and a
 * named absence where the year would be. It is never a bare number.
 * ====================================================================== */

function readingFor(eraCopy, { label, register, where, claimsFile }) {
  const claim = canonicalClaim(eraCopy, where, claimsFile);
  const drawable = guards.isTimelineDrawable(claim);
  /* G8. `timelineYear` is called only where the record gives permission. A
   * withheld claim keeps its value and loses its position in time, which is
   * exactly what `timeline_ready: false` withholds — and the missing year is
   * then drawn as an object, because G5 says an absence is one. */
  const year = drawable ? guards.timelineYear(claim, where) : null;
  const format = formatterFor(claim.unit);
  const mark = planClaimMark(claim, {
    year, label, register, format,
    extra: { organField: label },
  });
  /* `short` is what fits inside a 134px plate. A point mark prints its central.
   * A SPAN-ONLY MARK PRINTS ITS TWO ENDS AND NOTHING BETWEEN THEM — there is no
   * midpoint here, no geometric mean and no rounded band centre, because a
   * derived middle value of an interval the library refuses a central to is
   * that central with better manners. `markFigure` says the same thing in a
   * sentence; this is the same fact in the space a drawing has. */
  const short = mark.kind === 'point'
    ? format(mark.central)
    : `${format(mark.lo)}–${format(mark.hi)}`;

  return Object.freeze({
    id: claim.id,
    mark,
    year,
    unit: claim.unit || null,
    grade: claim.grade || null,
    verdict: mark.verdict,
    form: mark.kind === 'point' ? 'point' : 'span',
    reading: markReading(mark, format),
    figure: markFigure(mark, format),
    short,
    title: markTitle(mark, { label, format, suffix: claim.unit || '' }),
    timelineWithheld: !drawable,
    withheldNote: drawable ? null : String(claim.about_year_note || 'the record gives no reason').slice(0, 400),
  });
}

/* ======================================================================
 * 5 · THE POOLS
 *
 * Two organs carry a money-type split: INLET (BUYERS) and OUTLET (SCALE). The
 * pools are never ordered — not sorted, not stacked, not listed tallest first —
 * and G2 is what refuses it. `renderPools(pools, "unranked", "fixed-position")`
 * is the call, and "fixed-position" is the layout this whole machine is built
 * on: the pools sit where they sit, in every era, and nothing about their
 * arrangement asserts a ranking.
 *
 * ERA 5 CARRIES TWO TAXONOMIES ON PURPOSE. `by_money_type` is era-native.
 * `by_money_type_alt` is the cross-era comparable. `poolsFor` takes the scope
 * and asks G6 which one it may read, and the answer for a cross-era view is
 * always the alt.
 * ====================================================================== */

const NATIVE_SPLIT = 'by_money_type';
const ALT_SPLIT = 'by_money_type_alt';

/**
 * The split an era's field offers under a scope.
 *
 * For era 5 in a cross-era view this resolves to `by_money_type_alt` and the
 * choice is checked with `guards.assertTaxonomyField`, which reads the record
 * rather than the field's name. For every other era there is one split and the
 * scope changes nothing.
 */
export function splitNameFor(era, fieldGroup, scope, frozen = {}) {
  if (era !== 5) return NATIVE_SPLIT;
  const wanted = String(scope) === 'cross-era' ? ALT_SPLIT : NATIVE_SPLIT;
  guards.assertTaxonomyField(scope, fieldGroup, wanted, {
    era5: frozen.era5, reconciled: frozen.reconciled,
    context: `the era ${era} ${fieldGroup} organ, scope "${scope}"`,
  });
  return wanted;
}

function poolsFor(record, fieldGroup, { scope, register, claimsFile, frozen }) {
  const group = record.fields[fieldGroup];
  const splitName = splitNameFor(record.era, fieldGroup, scope, frozen);
  const split = group && group[splitName];
  if (!split) return null;

  /* ERA 5'S ALT SPLIT HOLDS ONLY THE TWO POOLS THAT MOVE.
   *
   * `by_money_type_alt` carries local_retail and direct_response, because those
   * are the only two the directory block moves between. The other two pools are
   * the same number under both rules, and the seam record does not tag them.
   *
   * Drawn as it stands, era 5's cell in a seven-era drawer would show two pools
   * beside six cells showing four, and a reader would read that as era 5 having
   * no national-brand money. So the untagged pools are carried across from the
   * era-native split — untagged, resolved through `guards.taxonomyOf` and never
   * by name, and marked `unchanged` so the drawer can say which is which. Every
   * id here is neutral, so G6 below still sees one taxonomy. */
  const carried = {};
  const unchanged = new Set();
  if (record.era === 5 && splitName === ALT_SPLIT) {
    const native = group[NATIVE_SPLIT] || {};
    for (const key of Object.keys(native)) {
      if (split[key]) continue;
      if (guards.taxonomyOf(native[key].id, frozen.reconciled) !== null) continue;
      carried[key] = native[key];
      unchanged.add(key);
    }
  }
  const pools = { ...split, ...carried };

  const ids = Object.keys(pools);
  const where = `era ${record.era} ${fieldGroup}.${splitName}`;

  /* G2, at the layout. The pools are declared unranked and drawn at fixed
   * positions; an ordered layout here would throw. */
  guards.renderPools(ids.map((id) => ({ id, era: record.era })), 'unranked', 'fixed-position');

  /* G6, on the claim ids the view actually reads. Era 5 is the only era whose
   * ids are tagged; for the rest every id is neutral and the guard passes on
   * the ids while still refusing a missing scope. */
  const claimIds = ids.map((id) => pools[id].id);
  guards.assertTaxonomy({ scope, claimIds, context: where }, frozen.reconciled);

  const items = ids.map((id) => Object.freeze({
    pool: id,
    unchanged: unchanged.has(id),
    ...readingFor(pools[id], { label: `${fieldGroup} · ${id}`, register, where, claimsFile }),
  }));

  return Object.freeze({
    field: fieldGroup,
    split: splitName,
    scope,
    layout: 'fixed-position',
    ordering: 'unranked',
    carriedCount: unchanged.size,
    taxonomy: record.era === 5 ? guards.taxonomyOfField(fieldGroup, splitName, frozen.era5, frozen.reconciled) : null,
    items: Object.freeze(items),
    note: record.era === 5
      ? 'Era 5 splits this money two ways on purpose. This view reads the ' +
        (splitName === ALT_SPLIT
          ? `cross-era comparable rule. ${unchanged.size} of these pools are the same number ` +
            'under both rules and are marked as unchanged.'
          : 'era-native rule.')
      : null,
  });
}

/* ======================================================================
 * 6 · THE STRIP
 * ====================================================================== */

/**
 * Record fields that must never travel on a plan.
 *
 * `statement` is deliberately NOT on this list. A verdict stamp carries the
 * claim's statement, and that stamp is the correction the reader has to see —
 * `stampVerdict` builds it and `assertVerdictsVisible` refuses a plan that
 * draws a repaired claim without one. Stripping it would take away the only
 * thing on the page that says what was repaired. Every other row is a number
 * or a provenance field a renderer could print as a reading.
 */
export const RECORD_ONLY_KEYS = Object.freeze([
  'ci80', 'sources', 'method', 'as_of', 'about_year', 'about_span',
  'timeline_ready', 'calibration', 'claims', 'fields', 'by_money_type', 'by_money_type_alt',
]);

/**
 * THROWING FORM. Walk the finished plan and refuse a record row on it.
 *
 * The charts folder runs this as a CENSUS — it reports and a human reads it.
 * Here it throws, because this plan is built from a file whose every claim
 * carries its own `ci80` and `method`, and the natural way to build it is to
 * spread the record and add a mark. A renderer that can reach `ci80` can print
 * a middle value the library refused, and the whole strip exists to make that
 * impossible rather than forbidden.
 *
 * `central` is checked separately: a POINT mark is allowed one, because that is
 * what a point mark is. Nothing else on the plan may carry the key at all.
 */
export function assertNoRecordOnPlan(plan, context) {
  const marks = new Set(planMarks(plan, context));
  const seen = new WeakSet();
  const hits = [];
  const visit = (value, path) => {
    if (value === null || typeof value !== 'object') return;
    if (marks.has(value)) return;                       // a minted mark; it is the answer
    if (seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) { value.forEach((v, i) => visit(v, `${path}[${i}]`)); return; }
    if (typeof value.forEach === 'function' && typeof value.get === 'function') {
      value.forEach((v, k) => visit(v, `${path}.get(${String(k)})`)); return;
    }
    for (const key of Object.keys(value)) {
      if (RECORD_ONLY_KEYS.includes(key) || key === 'central') hits.push(`${path}.${key}`);
      visit(value[key], `${path}.${key}`);
    }
  };
  visit(plan, 'plan');
  if (hits.length) {
    throw new EraPlanError(
      `${context || 'this era plan'} carries ${hits.length} record field(s) the renderer must not ` +
      `reach: ${hits.slice(0, 8).join(', ')}${hits.length > 8 ? ' …' : ''}. A plan carries marks ` +
      `and strings. A renderer that can read ci80 can print a middle value the library refused.`,
      hits,
    );
  }
  return true;
}

/**
 * THROWING FORM. Every string a reading prints must be its own mark's answer.
 *
 * A reading carries a minted mark AND four strings built from it — `short`,
 * `reading`, `figure`, `title`. The mark is unforgeable; the strings are plain
 * text on a plain object, and the plate draws the STRING. So a plan of entirely
 * genuine marks with one figure typed into `headline.short` draws that figure,
 * and nothing about the marks is wrong.
 *
 * That is the hole the adversary walked through. It is closed by re-deriving all
 * four from the mark, here, at mint and again on every re-entry — the same
 * posture `drawerWords` takes about the drawer's title. A string that disagrees
 * with the mark it claims to read is a second copy of a number, and every stage
 * of this project has been bitten by a second copy of a number.
 *
 * The walk is generic. It finds any object carrying a minted mark and a `short`,
 * so the crank's notches — which copy the same four fields — are covered without
 * being listed, and a container invented tomorrow is covered too.
 */
export function assertReadingsMatchMarks(plan, context) {
  const minted = new Set(planMarks(plan, context));
  const seen = new WeakSet();
  const bad = [];

  const check = (reading, path) => {
    const mark = reading.mark;
    const format = formatterFor(reading.unit);
    const want = {
      id: mark.id,
      year: mark.year ?? null,
      verdict: mark.verdict,
      form: mark.kind === 'point' ? 'point' : 'span',
      short: mark.kind === 'point'
        ? format(mark.central)
        : `${format(mark.lo)}–${format(mark.hi)}`,
      reading: markReading(mark, format),
      figure: markFigure(mark, format),
      title: markTitle(mark, { label: mark.organField, format, suffix: reading.unit || '' }),
    };
    for (const key of Object.keys(want)) {
      if (Object.prototype.hasOwnProperty.call(reading, key) && reading[key] !== want[key]) {
        bad.push(`${path}.${key}: "${reading[key]}" where the mark reads "${want[key]}"`);
      }
    }
  };

  const visit = (value, path) => {
    if (value === null || typeof value !== 'object') return;
    if (minted.has(value)) return;
    if (seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) { value.forEach((v, i) => visit(v, `${path}[${i}]`)); return; }
    if (typeof value.forEach === 'function' && typeof value.get === 'function') {
      value.forEach((v, k) => visit(v, `${path}.get(${String(k)})`)); return;
    }
    if (minted.has(value.mark) && typeof value.short === 'string') check(value, path);
    for (const key of Object.keys(value)) visit(value[key], `${path}.${key}`);
  };

  visit(plan, 'plan');
  if (bad.length) {
    throw new EraPlanError(
      `${context || 'this era plan'} prints ${bad.length} string(s) its own marks do not support: ` +
      `${bad.slice(0, 6).join('; ')}${bad.length > 6 ? ' …' : ''}. Every figure a plate draws is ` +
      `derived from the mark beside it. A typed figure on a plan of real marks is the one forgery ` +
      `every other check on this plan waves through, because nothing about the marks is wrong.`,
      bad,
    );
  }
  return true;
}

/* ======================================================================
 * 7 · THE PLAN
 * ====================================================================== */

function tallyOf(readings) {
  const grades = { A: 0, B: 0, C: 0 };
  const ticks = [];
  for (const r of readings) {
    const grade = (r.grade || 'C').toUpperCase();
    if (grades[grade] === undefined) grades[grade] = 0;
    grades[grade] += 1;
    ticks.push(Object.freeze({
      form: r.timelineWithheld ? 'withheld' : r.form,   // NOT `kind`: an object with a
      grade,                                            // `kind` of "point" looks like a
      id: r.id,                                         // mark to inspectPlan and is refused
    }));
  }
  return { grades, ticks: Object.freeze(ticks) };
}

/* ======================================================================
 * THE ERA MACHINE'S PLANNER HANDLE.
 *
 * `ERA_PLANNER` IS NEVER EXPORTED, and that is the whole of the identity. The
 * seal used to be `sealPlan(plan, { revalidate })` — a public function taking
 * any revalidator — so a caller could take eight organs of genuinely minted
 * marks, hand-type a figure into `headline.short`, seal the result with an empty
 * `revalidate() {}` and hand it to `renderEraMachine`. Every other check passed:
 * the marks were real, the freeze was real, the walk found nothing unminted. The
 * only thing that would have caught the typed figure is the revalidator below,
 * and the forger supplied a different one.
 *
 * Now the seal records WHICH planner minted the plan. `openEraPlan` opens plans
 * this handle sealed and refuses every other, and the handle lives in a
 * module-private const nothing exports. Forging one means editing this file.
 *
 * The door is exported; the handle is not. Opening validates and mints nothing,
 * so a door is safe to hand out. `seal` is the capability.
 * ====================================================================== */

function revalidateEra(sealed, { marks, context }) {
  const where = context;
  /* The planner's own invariants, run at mint and again on every re-entry. */
  if (sealed.organs.length !== POSITIONS.length) {
    throw new EraPlanError(`${where} does not carry eight organs.`, sealed.organs.length);
  }
  sealed.organs.forEach((organ, i) => {
    if (organ.organ !== POSITIONS[i].organ || organ.field !== POSITIONS[i].field) {
      throw new EraPlanError(
        `${where} has organ ${i} as ${organ.organ}/${organ.field} where the spine says ` +
        `${POSITIONS[i].organ}/${POSITIONS[i].field}. The positions do not move between eras; ` +
        'that is the whole reason a reader can compare era 3 to era 6.',
        { i, got: organ.organ, want: POSITIONS[i].organ },
      );
    }
    if (organ.ticks.length !== organ.claimCount) {
      throw new EraPlanError(`${where} · ${organ.field}: the tally and the register disagree.`, organ.field);
    }
  });
  if (sealed.crank.notches.length !== sealed.organs.find((o) => o.field === 'PRICING').claimCount) {
    throw new EraPlanError(
      `${where}: the crank has fewer notches than PRICING has claims. The control runs ` +
      'through the whole field; a notch list shorter than the field is a silent subset.',
      sealed.crank.notches.length,
    );
  }
  /* EVERY STRING A READING PRINTS IS RE-DERIVED FROM ITS OWN MARK. This is the
   * check the forged plan above walks into: `short`, `reading` and `figure` are
   * built from the mark at plan time, so a hand-typed figure disagrees with the
   * mark it claims to read, at mint and on every re-entry. */
  assertReadingsMatchMarks(sealed, where);
  assertVerdictsVisible(marks, sealed.verdictStamps, where);
  assertNoRecordOnPlan(sealed, where);
}

const ERA_PLANNER = definePlanner({
  name: 'the era machine planner',
  revalidate: revalidateEra,
});

/**
 * THE ONE DOOR a single-era plan comes back through. Refuses a plan this
 * planner did not mint, then re-validates it on content — every container,
 * every mark, and this module's own invariants, every call.
 */
export function openEraPlan(plan, context) {
  return ERA_PLANNER.open(plan, context);
}

/** True when `plan` is a single-era plan THIS module minted. Not "some plan". */
export function isEraPlan(plan) {
  return ERA_PLANNER.owns(plan);
}

/**
 * Build one era's machine.
 *
 *   record   eras/era-N.json, parsed
 *   frozen   guards.snapshotFrozen(), or at minimum { claims, reconciled, era5 }
 *   options  { scope } — "era-native" for the single-era machine (the default),
 *            "cross-era" for a view that sets this era beside another one.
 *
 * Returns a SEALED plan. Every container on it is frozen, every mark is one
 * `planClaimMark` minted, and `openEraPlan` re-validates it on re-entry.
 */
export function planEra(record, frozen = {}, options = {}) {
  assertOrganSpine();
  if (!record || typeof record !== 'object' || !record.fields) {
    throw new EraPlanError('planEra needs a parsed eras/era-N.json record.', record);
  }
  const scope = options.scope || 'era-native';
  if (scope !== 'era-native' && scope !== 'cross-era') {
    throw new EraPlanError(
      `"${scope}" is not a scope. Pass "era-native" for one era on its own terms, or ` +
      '"cross-era" for a view that sets it beside another era. G6 needs the answer and will ' +
      'not default it.', scope,
    );
  }
  const claimsFile = frozen.claims || guards.getFrozen('claims');
  const era = record.era;
  const where = `the era ${era} machine`;
  const register = verdictRegister(where);

  /* Refuses to run if claims.json has stopped carrying the clean verdict, which
   * is the GuardVacuous posture: a module that cannot tell a clean claim from a
   * repaired one must not stamp every mark or none of them. */
  verdictVocabulary(claimsFile);

  const organs = POSITIONS.map((pos) => {
    const group = record.fields[pos.field];
    if (!group || !Array.isArray(group.claims) || group.claims.length === 0) {
      throw new EraPlanError(
        `${where} has no claims at the ${pos.field} organ. Eight organs at eight fixed positions ` +
        'is the whole design; an empty one is a lost position, and a lost position is invisible ' +
        'because the reader has nothing to compare it against.', pos.field,
      );
    }
    const readings = group.claims.map((c) => readingFor(c, {
      label: pos.field, register, where: `${where} · ${pos.field}`, claimsFile,
    }));
    const { grades, ticks } = tallyOf(readings);
    const headline = readings[0];
    const pools = (pos.field === 'BUYERS' || pos.field === 'SCALE')
      ? poolsFor(record, pos.field, { scope, register, claimsFile, frozen })
      : null;

    return {
      organ: pos.organ,
      field: pos.field,
      index: pos.index,
      numeral: pos.numeral,
      sentence: pos.sentence,
      operable: pos.operable,
      /* The organ's face reads its FIRST claim, in the record's own order.
       * Written down because it is a selection, and a selection nobody wrote
       * down is a selection nobody can audit: the register below holds every
       * claim at this organ, so nothing is dropped, only ranked for the face. */
      headlineBecause: 'the record\'s own first claim at this field; the register below holds them all',
      headline,
      readings: Object.freeze(readings),
      claimCount: readings.length,
      grades: Object.freeze(grades),
      ticks,
      spanOnlyCount: readings.filter((r) => r.form === 'span').length,
      withheldCount: readings.filter((r) => r.timelineWithheld).length,
      summary: String(group.summary || ''),
      pools,
    };
  });

  /* THE CRANK. Every PRICING claim is a notch, in the record's own order, and
   * none is dropped — the control runs through the whole field. */
  const ruleOrgan = organs.find((o) => o.organ === OPERABLE_ORGAN);
  const crankSpec = CRANK_NAMES[era];
  if (!crankSpec) throw new EraPlanError(`no crank is named for era ${era}.`, era);
  const notches = ruleOrgan.readings.map((r, i) => Object.freeze({
    step: i,
    id: r.id,
    unit: r.unit,
    grade: r.grade,
    year: r.year,
    form: r.form,
    mark: r.mark,
    reading: r.reading,
    figure: r.figure,
    short: r.short,
    title: r.title,
    timelineWithheld: r.timelineWithheld,
    withheldNote: r.withheldNote,
  }));

  const events = (record.events || []).map((ev) => {
    const reading = ev.claim
      ? readingFor(ev.claim, { label: `event ${ev.date}`, register, where: `${where} · events`, claimsFile })
      : null;
    return Object.freeze({
      date: String(ev.date),
      title: String(ev.title || ''),
      desc: String(ev.desc || ''),
      reading,
    });
  });

  const stamps = verdictStamps(register);

  const plan = {
    era,
    name: String(record.name || ''),
    years: String(record.years || ''),
    scope,
    boundary: String(record.boundary_notes || ''),
    crank: {
      organ: OPERABLE_ORGAN,
      field: 'PRICING',
      name: crankSpec.name,
      why: crankSpec.why,
      notches: Object.freeze(notches),
      because: 'every PRICING claim the record holds for this era is a notch, in the record\'s ' +
        'own order; the control runs through the whole field and drops none of it',
    },
    organs,
    events: Object.freeze(events),
    verdictStamps: Object.freeze(stamps),
    cutPercent: wideCutPercent(),
    /* B8's required plain-English sentence, generated here so a text-only path
     * has one for every machine. Measured with tools/readability.py. */
    alt: `Era ${era}, ${record.name}, ${record.years}. One machine with eight parts. ` +
      `Each part answers one question about who set the price. The part you can turn is ` +
      `${crankSpec.name.toLowerCase()}, and it has ${notches.length} settings the record can show.`,
  };

  /* Minted by THIS module's handle. `renderEraMachine` opens plans this handle
   * sealed and refuses every other, so a plan sealed elsewhere — with a no-op
   * revalidator, around a hand-typed figure — never reaches a plate. */
  ERA_PLANNER.seal(plan, where);

  return plan;
}

/* ======================================================================
 * 8 · THE CROSS-ERA VIEW — what the pull ring lifts out
 *
 * One organ, seven eras, side by side. This is a cross-era view by definition,
 * so era 5's money-type organs read the ALT split, and G6 is asked rather than
 * assumed.
 *
 * WHAT THIS VIEW MUST NOT DO, and the reason it is a list of cells rather than
 * a chart: the seven eras do not share a ruler. Era 1's SCALE pools are shares
 * of the total, era 2's are dollars of the day in millions, era 7's are dollars
 * in billions. Seven readings on one axis would invite a comparison the record
 * cannot support, which is the same argument the Toll Plate makes about the
 * middleman's cut. Each cell is drawn on its own axis and prints its own unit.
 *
 * AND THE DRAWER SAYS WHAT IT HOLDS, BECAUSE IT CANNOT SAY ANYTHING ELSE.
 *
 * This function used to refuse only an EMPTY record set. A three-era set built a
 * plan happily, and the drawer rendered it under the title "seven machines" with
 * an accessible name reading "all seven eras" — while the plan's own alt text,
 * in the same drawer, said "3 eras". `assertSevenEras` existed in
 * `era-records.js` and nothing on this path or the drawer's called it. Both
 * holes are closed, and neither closes by remembering:
 *
 *   1. `assertSevenEras` RUNS HERE. A partial drawer cannot be built at all, so
 *      there is no partial drawer for a title to lie about.
 *   2. EVERY COUNT AND EVERY WORD IS DERIVED FROM THE CELLS. The title, the
 *      accessible name and the alt sentence come out of `drawerWords`, which
 *      takes the number of cells and nothing else — and the seal's `revalidate`
 *      re-derives all three from the LIVE cell list on every re-entry. A number
 *      spelled into a string is a second copy of a number, and two copies of one
 *      number is the defect this project has hit at every stage.
 * ====================================================================== */

/**
 * The drawer's own words, derived from the cells the drawer actually holds.
 *
 * One function, so the title, the accessible name and the alt sentence cannot
 * disagree with each other either.
 */
function drawerWords(field, pos, count) {
  const word = countWord(count);
  const Word = word.charAt(0).toUpperCase() + word.slice(1);
  return Object.freeze({
    eraCount: count,
    eraWord: word,
    title: `${pos.numeral} · ${field} · the ${pos.organ} · ${word} machines`,
    ariaLabel: `One machine part, lifted out of all ${word} eras`,
    alt: `The ${field.toLowerCase()} part of every machine, lifted out and set side by side. ` +
      `${Word} eras. Each one is drawn on its own ruler.`,
  });
}

/* ======================================================================
 * THE DRAWER'S OWN PLANNER HANDLE — a second identity, not a shared one.
 *
 * A single-era plan and a cross-era drawer are different objects with different
 * invariants, and one handle for both would let a drawer through a machine's
 * door. Two handles, and each door names its own.
 * ====================================================================== */

function revalidateCrossEra(sealed, { marks, context }) {
  const where = context;
  if (sealed.scope !== 'cross-era') {
    throw new EraPlanError(`${where} lost its cross-era scope, which is what makes era 5 read the alt split.`, sealed.scope);
  }
  const eras = sealed.cells.map((c) => c.era);
  if (eras.some((e, i) => i > 0 && e <= eras[i - 1])) {
    throw new EraPlanError(`${where} is not in era order.`, eras);
  }
  /* THE DRAWER'S WORDS, RE-DERIVED FROM ITS CONTENTS. At mint and on every
   * re-entry, because a title that agreed with the cells once is a title
   * that agreed with the cells once. */
  if (sealed.cells.length !== ERA_COUNT) {
    throw new EraPlanError(
      `${where} holds ${sealed.cells.length} cells and there are ${ERA_COUNT} eras. A drawer ` +
      'that renders a subset under a whole-record title is a missing era the reader is told ' +
      'is not missing.', sealed.cells.length,
    );
  }
  const said = drawerWords(sealed.field, POSITION[sealed.field], sealed.cells.length);
  for (const key of ['eraCount', 'eraWord', 'title', 'ariaLabel', 'alt']) {
    if (sealed[key] !== said[key]) {
      throw new EraPlanError(
        `${where} carries a ${key} the cells do not support: "${sealed[key]}" against ` +
        `"${said[key]}" for ${sealed.cells.length} cells. Every count and every word this ` +
        'drawer prints is derived from the cells it actually holds.',
        { key, got: sealed[key], want: said[key] },
      );
    }
  }
  const five = sealed.cells.find((c) => c.era === 5);
  if (five && five.pools && five.pools.split !== ALT_SPLIT) {
    throw new EraPlanError(
      `${where} reads era 5's ${five.pools.split} split. A cross-era view reads ` +
      `${ALT_SPLIT}; the other rule is era 5 on its own terms and splicing it to another ` +
      'era crosses an undocumented redefinition.', five.pools.split,
    );
  }
  /* Same rule as the machine's: every string a cell prints is its mark's own. */
  assertReadingsMatchMarks(sealed, where);
  assertVerdictsVisible(marks, sealed.verdictStamps, where);
  assertNoRecordOnPlan(sealed, where);
}

const DRAWER_PLANNER = definePlanner({
  name: 'the cross-era drawer planner',
  revalidate: revalidateCrossEra,
});

/** THE ONE DOOR a cross-era drawer plan comes back through. */
export function openDrawerPlan(plan, context) {
  return DRAWER_PLANNER.open(plan, context);
}

/** True when `plan` is a cross-era drawer plan THIS module minted. */
export function isDrawerPlan(plan) {
  return DRAWER_PLANNER.owns(plan);
}

export function planCrossEra(field, records, frozen = {}, options = {}) {
  assertOrganSpine();
  if (!FIELDS.includes(field)) {
    throw new EraPlanError(`"${field}" is not one of the eight organ fields.`, field);
  }
  const list = [...records].sort((a, b) => a.era - b.era);
  /* The whole record set, or nothing. A drawer with six cells in it is a missing
   * era nobody can see, because the reader has nothing to compare the gap
   * against — and a drawer that renders three cells under a seven-era title is
   * worse, because it tells the reader there is no gap. */
  assertSevenEras(list);

  const claimsFile = frozen.claims || guards.getFrozen('claims');
  const where = `the ${field} drawer, across ${list.length} eras`;
  const register = verdictRegister(where);
  verdictVocabulary(claimsFile);

  const pos = POSITION[field];
  const cells = list.map((record) => {
    const group = record.fields[field];
    const readings = group.claims.map((c) => readingFor(c, {
      label: `${field} · era ${record.era}`, register, where: `${where} · era ${record.era}`, claimsFile,
    }));
    const { grades, ticks } = tallyOf(readings);
    const pools = (field === 'BUYERS' || field === 'SCALE')
      ? poolsFor(record, field, { scope: 'cross-era', register, claimsFile, frozen })
      : null;
    return {
      era: record.era,
      name: String(record.name || ''),
      years: String(record.years || ''),
      headline: readings[0],
      readings: Object.freeze(readings),
      claimCount: readings.length,
      grades: Object.freeze(grades),
      ticks,
      pools,
      summary: String(group.summary || ''),
    };
  });

  const seam = list.some((r) => r.era === 5) && (field === 'BUYERS' || field === 'SCALE')
    ? guards.taxonomySeamFigures(frozen.reconciled)
    : null;

  /* Every count and every word the drawer prints, from the cells it holds. */
  const words = drawerWords(field, pos, cells.length);

  const plan = {
    field,
    organ: pos.organ,
    numeral: pos.numeral,
    sentence: pos.sentence,
    scope: 'cross-era',
    cells,
    eraCount: words.eraCount,
    eraWord: words.eraWord,
    /* The drawer prints these two rather than writing its own. A renderer that
     * spells a count into a string is a renderer whose heading can disagree with
     * the drawer under it, which is exactly what happened. */
    title: words.title,
    ariaLabel: words.ariaLabel,
    verdictStamps: Object.freeze(verdictStamps(register)),
    /* The one sentence that keeps this drawer honest. Printed, not implied. */
    rulerNote: `Each era is drawn on its own ruler. The units are not the same, so the ` +
      `${words.eraWord} readings cannot be compared by eye. Read the unit under each one.`,
    seamNote: seam
      ? `Era 5 splits this money two ways. This drawer reads the cross-era rule, which moves ` +
        `${seam.usd} of ${seam.block} — ${seam.pp} points of the ${seam.year} market — between ` +
        `two pools. Under both rules the two pools still overlap, so neither leads.`
      : null,
    alt: words.alt,
  };

  DRAWER_PLANNER.seal(plan, where);

  return plan;
}
