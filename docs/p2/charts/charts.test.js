/**
 * docs/p2/charts/charts.test.js — THE CHART LAYER'S OWN BENCH.
 *
 * Every case here is a way to make one of these four charts say something the
 * record does not support. Most must be REFUSED. A few must DRAW, and those are
 * the important ones: a rule that only ever refuses teaches nobody where the
 * line is.
 *
 * The cases live in a module rather than in the page so that the same code runs
 * in a browser (`charts.test.html`) and headless in a runner that supplies a
 * DOM. A test that can only be run one way is a test that stops being run.
 *
 * ======================================================================
 * THE FORCED CUT, AND WHY TWO CASES MOVE IT
 * ======================================================================
 * Two branches of this chart system are correct and UNEXERCISED BY THE FROZEN
 * RECORD:
 *
 *   - the GDP strip's span-only branch. All eleven share-of-GDP readings are
 *     inside the 60% cut, the widest being `e1-scale-009` at 42.4%, so on the
 *     record as frozen `plan.spanOnlyCount` is zero and `drawReading`'s span
 *     half never runs.
 *   - `drawTotalPanel`'s opening sentence in the bank, where the total rail's
 *     first year is a point at every cut the record reaches.
 *
 * Both are exercised here by moving `wideIntervalRatio` to 0.30 through
 * `guards.configureRules`, which is the library's own supported way to move a
 * drawing convention and requires a written reason. At 0.30, `e1-scale-009`
 * (ratio 0.424) becomes span-only and `coen_mce` 1919 (ratio 0.350) does too.
 *
 * THESE TWO CASES ARE PERMANENT. A forced test is weaker than real data and it
 * is much stronger than nothing, and the alternative — a branch nobody has ever
 * seen run — is how the cross-section came to draw internet 2007 as a definite
 * length while the panel above it drew the same point as a span. The limit is
 * written down in this folder's README under "unexercised by the record".
 */

import * as guards from '../lib/guards.js';
import * as marks from './claim-marks.js';
import * as kit from './svg-kit.js';
import * as railBoard from './rail-board.js';
import * as valueChart from './value-chart.js';
import * as gdpStrip from './gdp-strip.js';
import * as bank from './small-multiples.js';

/* The reason `configureRules` requires. It is greppable, which is the point. */
const FORCED_CUT_REASON =
  'charts.test.js forces the span-only cut to 0.30 so that two branches the frozen record never ' +
  'reaches are exercised: the GDP strip has no span-only reading at 0.60, and the bank total ' +
  'panel opens on a year that is a point at every cut the record reaches';

/* ======================================================================
 * A small census: what a renderer can still reach on a finished plan
 * ====================================================================== */

/** Own keys that mean "this is a row out of the frozen record, not a mark". */
const RECORD_SHAPED = ['calibration', 'ci80', 'money_type', 'partition_member', 'known_breaks',
  // 'magnitude' carried eleven published money levels onto the bank plan, unread, and this
  // list not watching for it is why the record-shape test passed over all of them.
  'magnitude'];

/**
 * Walk a sealed plan and report every place a record row survived on it.
 *
 * This is the standing answer to "what can a renderer still reach that it
 * should not". It is a census rather than a guard: it reports, and a human
 * reads it. Anything it finds is a value a draw site can print without a guard
 * having seen it.
 */
export function recordReach(plan, label) {
  const hits = [];
  const seen = new WeakSet();
  const walk = (value, path, depth) => {
    if (value === null || typeof value !== 'object' || depth > 12) return;
    if (marks.isMark(value)) return;                     // a mark is the guarded form
    if (marks.isFrozenMap(value)) {
      for (const [k, v] of value) walk(v, `${path}.get(${String(k)})`, depth + 1);
      return;
    }
    if (marks.isFrozenSet(value)) return;                // a set of years or keys
    if (seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${path}[${i}]`, depth + 1));
      return;
    }
    for (const key of Object.keys(value)) {
      if (RECORD_SHAPED.includes(key)) hits.push(`${label}: ${path}.${key}`);
      walk(value[key], `${path}.${key}`, depth + 1);
    }
  };
  walk(plan, 'plan', 0);
  return hits;
}

/* ======================================================================
 * The cases
 * ====================================================================== */

/**
 * @param {{frozen: object, host: Element}} env
 * @returns {Array<{group, name, expect, run}>}
 */
export function chartCases({ frozen, host }) {
  const fresh = () => {
    const el = host.ownerDocument.createElement('div');
    host.appendChild(el);
    return el;
  };
  const plans = {
    value: () => valueChart.planValueChart(frozen, {}),
    bank: () => bank.planBank(frozen, {}),
    strip: () => gdpStrip.planStrip(frozen, {}),
    board: () => railBoard.planRailBoard(frozen, {}),
  };
  /* A revalidator takes the same second argument sealPlan hands it. */
  const arg = (plan) => ({ marks: marks.planMarks(plan), context: 'the adversary' });

  return [
    /* ---------------------------------------------------------------- *
     * 1 · A SHALLOW FREEZE IS NOT A FREEZE
     * ---------------------------------------------------------------- */
    {
      group: 'the freeze',
      name: 'Swap a minted POINT mark into a span slot on a sealed plan',
      expect: 'refused',
      run() {
        const plan = plans.value();
        const donor = plan.rails.find((r) => r.key === 'coen_mce').segments[0].marks[0];
        const bench = plan.rails.find((r) => r.cadence === railBoard.CADENCE.BENCHMARK);
        bench.segments[0].marks[0] = donor;
        marks.openSealedPlan(plan, 'the adversary');
        return `the benchmark rail now draws a square at ${donor.central}`;
      },
    },
    {
      group: 'the freeze',
      name: 'Set internet’s printed peak to 3.7656 on a sealed bank plan',
      expect: 'refused',
      run() {
        const plan = plans.bank();
        const all = [...plan.categories, ...(plan.tail ? plan.tail.cats : [])];
        all.find((c) => c.id === 'internet').peakShare = 3.7656;
        return 'the internet panel prints "peak 3.8% of the US total"';
      },
    },
    {
      group: 'the freeze',
      name: 'Write a hand-built mark into a segment and hand the plan back in',
      expect: 'refused',
      run() {
        const plan = plans.value();
        plan.rails[0].segments[0].marks[0] =
          { id: 'forged', kind: 'point', lo: 1, hi: 2, ratio: 0.1, central: 1.5, year: 1919 };
        marks.openSealedPlan(plan, 'the adversary');
      },
    },
    {
      group: 'the freeze',
      name: 'Replace a year of the partition through the cross-section Map',
      expect: 'refused',
      run() {
        const plan = plans.bank();
        plan.crossSections.set(1935, { year: 1935, definite: true, members: [], sum: 100 });
        return '1935 is now an empty column that sums to 100%';
      },
    },
    {
      group: 'the freeze',
      name: 'Reach the Map’s backing store through Map.prototype.set',
      expect: 'refused',
      run() {
        const plan = plans.bank();
        Map.prototype.set.call(plan.crossSections, 1935, {});
        return 'the prototype method reached the store';
      },
    },
    {
      group: 'the freeze',
      name: 'A plan this module really built is still accepted on re-entry',
      expect: 'draws',
      run() {
        const plan = plans.bank();
        marks.openSealedPlan(plan, 'a second view');
        marks.openSealedPlan(plan, 'a third view');
        return 're-opened twice, re-validated both times';
      },
    },

    /* ---------------------------------------------------------------- *
     * 2 · A MIDPOINT IS A CENTRAL WITH BETTER MANNERS
     * ---------------------------------------------------------------- */
    {
      group: 'the midpoint',
      name: 'Read a positioning number off a mark',
      expect: 'refused',
      run() {
        const plan = plans.value();
        const mark = plan.rails[0].segments[0].marks[0];
        if ('layout' in mark || 'anchor' in mark) return `mark.layout = ${mark.layout}`;
        throw new Error('a mark carries no derived middle value; position goes through anchorY');
      },
    },
    {
      group: 'the midpoint',
      name: 'Print a figure for a quantity nobody measured — usd(undefined)',
      expect: 'refused',
      run() { return kit.usd(undefined); },
    },
    {
      group: 'the midpoint',
      name: 'Print a figure for a quantity nobody measured — pct(null)',
      expect: 'refused',
      run() { return kit.pct(null); },
    },
    {
      group: 'the midpoint',
      name: 'markFigure on a span-only mark',
      expect: 'refused',
      run() {
        const mark = marks.planClaimMark({ id: 'wide', central: 10, ci80: [4, 22] }, { year: 1900 });
        const said = marks.markFigure(mark, (v) => `${v}`);
        if (/^\s*1[0-3]\b/.test(said)) return `printed a middle value: ${said}`;
        throw new Error(`says the range instead: "${said}"`);
      },
    },
    {
      group: 'the midpoint · FORCED CUT 0.30',
      name: 'The total panel’s figcaption and aria-label on a span-only first year',
      expect: 'draws',
      run() {
        guards.configureRules({ wideIntervalRatio: 0.30 }, FORCED_CUT_REASON);
        try {
          const el = fresh();
          bank.render(el, frozen, {});
          const svg = el.querySelector('.p2-panel--total svg');
          const alt = svg.getAttribute('aria-label');
          const caption = el.querySelector('.p2-panel--total figcaption').textContent;
          if (alt !== caption) throw new Error('the spoken sentence and the printed one differ');
          if (!/no middle value/.test(alt)) {
            throw new Error(`the panel still names a single figure: ${alt.slice(0, 120)}`);
          }
          return alt.slice(alt.indexOf('It rises'), alt.indexOf('to a high'));
        } finally { guards.resetRules(); }
      },
    },
    {
      group: 'the midpoint · FORCED CUT 0.30',
      name: 'Every span-only mark drawn in the bank says so in its own accessible name',
      expect: 'draws',
      run() {
        guards.configureRules({ wideIntervalRatio: 0.30 }, FORCED_CUT_REASON);
        try {
          const el = fresh();
          const out = bank.render(el, frozen, {});
          const drawn = [...el.querySelectorAll('.p2-span-only, [data-mark="span"]')];
          const named = drawn.map((n) => {
            const title = n.querySelector(':scope > title');
            return title ? title.textContent : '';
          }).filter(Boolean);
          const silent = named.filter((t) => !/no central value/.test(t));
          if (silent.length) {
            throw new Error(`${silent.length} span-only mark(s) drawn with no such sentence on ` +
              `them: ${silent[0].slice(0, 120)}`);
          }
          if (!named.length) throw new Error('the forced cut drew no span-only mark at all');
          const spans = marks.planMarks(out.plan).filter((m) => m.kind === 'span').length;
          return `${spans} span-only marks in the plan, ${named.length} drawn, every one of them ` +
            `naming its two ends and saying there is no middle value`;
        } finally { guards.resetRules(); }
      },
    },

    /* ---------------------------------------------------------------- *
     * 3 · THE RAW RECORD IS NOT ON THE PLAN
     * ---------------------------------------------------------------- */
    {
      group: 'the record',
      name: 'plan.media.get("internet").shares[i].point.calibration.central',
      expect: 'refused',
      run() {
        const plan = plans.bank();
        return String(plan.media.get('internet').shares[0].point.calibration.central);
      },
    },
    {
      group: 'the record',
      name: 'plan.selected.coen_mce.points[*].calibration on the GDP strip',
      expect: 'refused',
      run() { return String(plans.strip().selected.coen_mce.points[0].calibration.central); },
    },
    {
      group: 'the record',
      name: 'plan.selected.coen_mce.points[*].calibration on the bank',
      expect: 'refused',
      run() { return String(plans.bank().selected.coen_mce.points[0].calibration.central); },
    },
    {
      group: 'the record',
      name: 'plan.totals — the published money level, year by year',
      expect: 'refused',
      run() { return String(plans.bank().totals.get(1935)); },
    },
    {
      group: 'the record',
      name: 'plan.rejected[0].central on the GDP strip',
      expect: 'refused',
      run() {
        const value = plans.strip().rejected[0].central;
        if (value === undefined) throw new Error('the rejected register carries sentences, not numbers');
        return String(value);
      },
    },
    {
      group: 'the record',
      name: 'plan.tracks[].runs[].points on the rail board',
      expect: 'refused',
      run() {
        const run = plans.board().tracks[0].runs[0];
        if (!('points' in run)) throw new Error('a run carries its years and its count, not the rows');
        return String(run.points[0].calibration.central);
      },
    },
    {
      group: 'the record',
      name: 'CENSUS — no record-shaped key survives anywhere on any of the four plans',
      expect: 'draws',
      run() {
        const hits = [
          ...recordReach(plans.value(), 'value chart'),
          ...recordReach(plans.bank(), 'bank'),
          ...recordReach(plans.strip(), 'GDP strip'),
          ...recordReach(plans.board(), 'rail board'),
        ];
        if (hits.length) throw new Error(hits.slice(0, 6).join(' · '));
        return 'four plans walked, no calibration, ci80, money_type or partition_member on any of them';
      },
    },

    /* ---------------------------------------------------------------- *
     * 4 · EVERY CONTAINER IS WALKED
     * ---------------------------------------------------------------- */
    {
      group: 'the containers',
      name: 'Push a mark that does not exist onto plan.tallerSpans',
      expect: 'refused',
      run() {
        const plan = plans.value();
        plan.tallerSpans.push({ source_series: 'INVENTED', year: 1999 });
        marks.openSealedPlan(plan, 'the adversary');
        return 'the axis note now names INVENTED 1999';
      },
    },
    {
      group: 'the containers',
      name: 'Swap a hand-built mark into the 1980 wedge',
      expect: 'refused',
      run() {
        const plan = plans.value();
        plan.overlaps[0].high.mark =
          { id: 'forged', kind: 'point', lo: 1, hi: 2, ratio: 0.1, central: 1.5, year: 1980 };
        marks.openSealedPlan(plan, 'the adversary');
      },
    },
    {
      group: 'the containers',
      name: 'The walk reaches every container the value chart draws from',
      expect: 'draws',
      run() {
        const plan = valueChart.planValueChart(frozen, { annotate: ['e2-scale-004'] });
        const found = new Set(marks.planMarks(plan));
        const missing = [];
        if (!plan.overlaps.every((o) => found.has(o.high.mark) && found.has(o.low.mark))) missing.push('overlaps');
        if (!plan.tallerSpans.every((m) => found.has(m))) missing.push('tallerSpans');
        if (!plan.annotations.every((a) => found.has(a.mark))) missing.push('annotations');
        if (plan.tallest && !found.has(plan.tallest)) missing.push('tallest');
        if (!plan.rails.every((r) => r.marks.every((m) => found.has(m)))) missing.push('rails');
        if (missing.length) throw new Error(`never walked: ${missing.join(', ')}`);
        return `${found.size} marks, from rails, overlaps, tallerSpans, tallest and annotations`;
      },
    },
    {
      group: 'the containers',
      name: 'Hide a mark-shaped object anywhere in a plan',
      expect: 'refused',
      run() {
        const plan = plans.value();
        marks.planMarks({ ...plan, note: { kind: 'point', lo: 1, hi: 2, central: 1.5 } }, 'the adversary');
        return 'the walk went past it';
      },
    },
    {
      group: 'the containers',
      name: 'Mix a stranger into an array of marks',
      expect: 'refused',
      run() {
        const plan = plans.value();
        const mixed = { ...plan, tallerSpans: [...plan.rails[0].marks, { source_series: 'INVENTED', year: 1999 }] };
        marks.planMarks(mixed, 'the adversary');
        return 'the walk went past it';
      },
    },
    {
      group: 'the containers',
      name: 'Smuggle a live Map onto a plan',
      expect: 'refused',
      run() {
        const plan = plans.value();
        marks.planMarks({ ...plan, extra: new Map([[1, 2]]) }, 'the adversary');
        return 'the walk went past it';
      },
    },
    {
      group: 'the containers',
      name: 'Seal a plan with no revalidate function',
      expect: 'refused',
      run() { marks.sealPlan({ rails: [] }, { context: 'the adversary' }); },
    },

    /* ---------------------------------------------------------------- *
     * 5 · THE SECOND LAYER ON ITS OWN
     *
     * The deep freeze refuses every case in group 1 before a revalidator sees
     * it, which would leave the revalidators untested against anything but a
     * correct plan. These cases hand each revalidator a corrupted plan-shaped
     * object directly — the same edits, with the freeze stepped around — so the
     * second layer is exercised rather than merely present.
     * ---------------------------------------------------------------- */
    {
      group: 'the second layer',
      name: 'revalidate: a point mark sitting in the benchmark rail',
      expect: 'refused',
      run() {
        const plan = plans.value();
        const donor = plan.rails.find((r) => r.key === 'coen_mce').segments[0].marks[0];
        const copy = {
          ...plan,
          rails: plan.rails.map((r) => (r.cadence !== railBoard.CADENCE.BENCHMARK ? r : {
            ...r,
            segments: r.segments.map((s, i) => (i ? s : { ...s, marks: [donor, ...s.marks.slice(1)] })),
            marks: [donor, ...r.marks.slice(1)],
          })),
        };
        valueChart.revalidateValueChart(copy, arg(copy));
        return `accepted ${donor.id} on the benchmark rail`;
      },
    },
    {
      group: 'the second layer',
      name: 'revalidate: a rail under-counting its own span-only marks',
      expect: 'refused',
      run() {
        const plan = plans.value();
        const copy = {
          ...plan,
          rails: plan.rails.map((r) => (r.cadence === railBoard.CADENCE.BENCHMARK ? { ...r, spanOnly: 0 } : r)),
        };
        valueChart.revalidateValueChart(copy, arg(copy));
        return 'accepted';
      },
    },
    {
      group: 'the second layer',
      name: 'revalidate: the axis note naming a span that is not on a rail',
      expect: 'refused',
      run() {
        const plan = plans.value();
        const donor = plan.rails.find((r) => r.key === 'coen_mce').segments[0].marks[0];
        const copy = { ...plan, tallerSpans: [...plan.tallerSpans, donor] };
        valueChart.revalidateValueChart(copy, arg(copy));
        return 'accepted';
      },
    },
    {
      group: 'the second layer',
      name: 'revalidate: internet’s printed peak moved to a span-only year',
      expect: 'refused',
      run() {
        const plan = plans.bank();
        const copy = {
          ...plan,
          categories: plan.categories.map((c) => (c.id === 'internet' ? { ...c, peakShare: 3.7656 } : c)),
        };
        bank.revalidateBank(copy, arg(copy));
        return 'accepted peak 3.8%';
      },
    },
    {
      group: 'the second layer',
      name: 'revalidate: a cross-section re-sorted by size',
      expect: 'refused',
      run() {
        const plan = plans.bank();
        const year = plan.spanPanelYears[0] || [...plan.crossSections.keys()][0];
        const xsec = plan.crossSections.get(year);
        const resorted = { ...xsec, members: [...xsec.members].sort((a, b) => b.mark.hi - a.mark.hi) };
        bank.revalidateBank(
          { ...plan, crossSections: mapLike(plan.crossSections, year, resorted) },
          { marks: [], context: 'the adversary' },
        );
        return 'accepted';
      },
    },
    {
      group: 'the second layer',
      name: 'revalidate: a year claiming to be a column while a member has no length',
      expect: 'refused',
      run() {
        const plan = plans.bank();
        const year = plan.spanPanelYears[0];
        if (year === undefined) throw new Error('the record has no span-panel year to corrupt');
        const xsec = plan.crossSections.get(year);
        const forged = { ...xsec, definite: true, indefinite: [], sum: 100 };
        bank.revalidateBank(
          { ...plan, crossSections: mapLike(plan.crossSections, year, forged) },
          { marks: [], context: 'the adversary' },
        );
        return 'accepted';
      },
    },
    {
      group: 'the second layer',
      name: 'revalidate: a GDP reading plotted at its as_of publication date',
      expect: 'refused',
      run() {
        const plan = plans.strip();
        const copy = { ...plan, readings: plan.readings.map((r, i) => (i ? r : { ...r, year: 2008 })) };
        gdpStrip.revalidateStrip(copy, { marks: [], context: 'the adversary' });
        return 'accepted';
      },
    },

    /* ---------------------------------------------------------------- *
     * 6 · THE BRANCHES THE RECORD NEVER REACHES
     * ---------------------------------------------------------------- */
    {
      group: 'unexercised branches · FORCED CUT 0.30',
      name: 'The GDP strip draws a span-only reading and prints no figure for it',
      expect: 'draws',
      run() {
        const before = gdpStrip.planStrip(frozen, {}).spanOnlyCount;
        guards.configureRules({ wideIntervalRatio: 0.30 }, FORCED_CUT_REASON);
        try {
          const el = fresh();
          const out = gdpStrip.render(el, frozen, { window: 'wide' });
          const drawn = el.querySelectorAll('.p2-reading[data-mark="span"]').length;
          if (out.plan.spanOnlyCount === 0) throw new Error('the forced cut selected nothing');
          if (drawn !== out.plan.spanOnlyCount) {
            throw new Error(`${out.plan.spanOnlyCount} span-only readings, ${drawn} drawn as spans`);
          }
          const rows = [...el.querySelectorAll('.p2-reg tbody tr')];
          const spanIds = new Set(out.plan.readings.filter((r) => r.mark.kind === 'span').map((r) => r.id));
          const bad = rows.filter((r) => spanIds.has(r.children[0].textContent)
            && r.children[2].textContent !== 'span only');
          if (bad.length) throw new Error('the register printed a share for a span-only reading');
          return `on the record ${before} span-only readings; at a 0.30 cut ` +
            `${out.plan.spanOnlyCount}, all ${drawn} drawn as intervals, all printed "span only"`;
        } finally { guards.resetRules(); }
      },
    },
    {
      group: 'unexercised branches · FORCED CUT 0.30',
      name: 'The bank falls back from a column to a span panel where the total has no middle value',
      expect: 'draws',
      run() {
        guards.configureRules({ wideIntervalRatio: 0.30 }, FORCED_CUT_REASON);
        try {
          const plan = bank.planBank(frozen, {});
          const totalSpans = [...plan.crossSections.values()]
            .filter((x) => x.totalMark.kind === 'span');
          if (!totalSpans.length) throw new Error('no year has a span-only total at this cut');
          if (totalSpans.some((x) => x.definite)) {
            throw new Error('a year with no readable total is still drawn as a column');
          }
          const el = fresh();
          bank.renderCrossSection(el, frozen, { plan, year: totalSpans[0].year });
          const alt = el.querySelector('svg').getAttribute('aria-label');
          if (!/NOT drawn as a stacked column/.test(alt)) throw new Error('drew a column anyway');
          if (/\$[\d,.]+(bn|m) in total/.test(alt)) {
            throw new Error(`the span panel still names one figure for the total: ${alt.slice(0, 130)}`);
          }
          return `${totalSpans.length} year(s) whose published total has no middle value, ` +
            `none of them drawn as a column`;
        } finally { guards.resetRules(); }
      },
    },
    {
      group: 'unexercised branches',
      name: 'Every chart still draws on the frozen record, at the record’s own cut',
      expect: 'draws',
      run() {
        railBoard.renderRailBoard(fresh(), frozen, { sticky: false });
        valueChart.renderValueChart(fresh(), frozen, { annotate: ['e2-scale-004'] });
        gdpStrip.render(fresh(), frozen, { window: 'narrow' });
        bank.render(fresh(), frozen, {});
        return 'rail board, value chart, GDP strip, bank and cross-section';
      },
    },
  ];
}

/** A read-only Map-like over an existing frozen map, with one entry replaced. */
function mapLike(source, key, value) {
  return {
    get: (k) => (k === key ? value : source.get(k)),
    has: (k) => source.has(k),
    keys: () => source.keys(),
    get size() { return source.size; },
    * values() { for (const [, v] of this) yield v; },
    * [Symbol.iterator]() { for (const [k, v] of source) yield [k, k === key ? value : v]; },
  };
}

/**
 * Run every case and report what happened. Never throws: a bench that dies on
 * its first surprise tells you about one row.
 */
export function runChartTests(env) {
  return chartCases(env).map((testCase) => {
    let outcome;
    let detail = '';
    try {
      const note = testCase.run();
      outcome = testCase.expect === 'draws' ? 'pass' : 'LEAKED';
      detail = typeof note === 'string' ? note : '';
    } catch (error) {
      outcome = testCase.expect === 'draws' ? 'BROKE' : 'pass';
      detail = String(error && error.message).split('\n')[0];
    }
    return { ...testCase, outcome, detail };
  });
}

export default { runChartTests, chartCases, recordReach };
