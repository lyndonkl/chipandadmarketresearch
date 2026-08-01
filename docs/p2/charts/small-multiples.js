/**
 * docs/p2/charts/small-multiples.js — THE SMALL-MULTIPLE BANK.
 *
 * The by-medium composition, which is where the money actually moved.
 *
 * ==========================================================================
 * WHY THIS IS NOT A STACKED AREA, A STREAMGRAPH OR A PIE
 * ==========================================================================
 * Five independent design architects rejected stacking on the same grounds and
 * `DESIGN.md` rule 2 makes it an invariant: every band above the baseline
 * forces a length judgement against a moving reference, and the middle bands —
 * where this story lives — are the worst case. Radio's whole rise and fall sits
 * between newspapers and television in a stack, and a reader cannot read it.
 *
 * So: aligned panels on ONE shared y-scale, every category on its own flat
 * baseline, the total first and largest on its own scale and labelled as such.
 *
 * Parts-to-whole is bought back by `renderCrossSection` — a stacked column for
 * ONE year, read as one column. That is legitimate; the same column repeated
 * along a time axis is not.
 *
 * ==========================================================================
 * A COLUMN IS A ROW OF LENGTHS, AND SOME YEARS DO NOT HAVE ELEVEN LENGTHS
 * ==========================================================================
 * The cross-section used to call no interval guard at all. Five of the drawn
 * points in the frozen partition are span-only — Coen internet in 1997, 1999,
 * 2005, 2006 and 2007, with 80% intervals running from 64% to 116% of their own
 * value — and it drew every one of them as a definite length with a definite
 * printed figure. 2007 read "$10.5bn · 3.8%". The record says between $10.0bn
 * and $22.3bn, a factor of 2.2. The internet PANEL directly above drew those
 * same five points correctly, as spans. One page, two answers, one question.
 *
 * The repair is not another guard call in the renderer. The plan builds every
 * drawable quantity through ./claim-marks.js, which REMOVES the central from
 * any mark the library calls span-only, so the renderer has no number to draw a
 * length with. And a column needs one length per member, so:
 *
 *   A YEAR IS DRAWN AS A COLUMN ONLY WHEN EVERY MEMBER OF ITS PARTITION HAS A
 *   CENTRAL VALUE. Otherwise that year is drawn as a fixed-position span panel:
 *   the same members, in the same order, each as its own interval on a shared
 *   share axis, with nothing stacked.
 *
 * The alternative was considered and rejected: draw the uncertain member as a
 * hatched band from lo to hi inside the stack. It is honest about that one
 * segment and dishonest about every segment above it, because in a stack each
 * of those is measured from the top of the one below — so one uncertain member
 * makes every member above it uncertain in POSITION as well, and the drawing
 * stops being a column anybody can read as a column. A span panel says the same
 * thing without pretending to be a stack, and it is the form G2's own error
 * message recommends for quantities that cannot be ordered.
 *
 * ==========================================================================
 * WHAT THIS MODULE DOES NOT DECIDE
 * ==========================================================================
 * The panel set, the panel order, the scale ceiling, the readability floor and
 * every seam are COMPUTED from the frozen record at draw time. Nothing about
 * which media exist, when they start, when they are redefined or how large they
 * get is written in this file. `planBank()` returns the whole plan with its
 * arithmetic attached, so the page can print the reasoning it acted on and a
 * reviewer can check it.
 *
 * Colour comes from `../lib/tokens.js`. Motion comes from `../lib/motion.js`.
 * Every rule that can be broken goes through `../lib/guards.js`, and every mark
 * that reaches a renderer is minted by `./claim-marks.js`.
 */

import * as guards from '../lib/guards.js';
import * as marks from './claim-marks.js';
import { BRASS, BRASS_TEXT, IRON, ZINC_TEXT, INK, GRID, TYPE_ROLE } from '../lib/tokens.js';
import { crank } from '../lib/motion.js';
import {
  el, h, svgRoot, text, frame, rule, absenceBlock, spanMark, pointMark, polyline, band,
  caliper, linear, log10Scale, ceilTo, decadeTicks, gradeFill, usd, pct, humanise,
} from './svg-kit.js';

/* ------------------------------------------------------------------ *
 * 0 · Geometry. Everything is a multiple of the 22px engineering grid.
 * ------------------------------------------------------------------ */

const U = GRID.unit;                    // 22
const PANEL = Object.freeze({
  plotHeight: 8 * U,                    // 176px — the medium panels
  totalPlotHeight: 12 * U,              // 264px — the total, first and largest
  padLeft: 2 * U,                       // 44px  — room for the y labels
  padRight: U / 2,
  padTop: 2 * U,                        // 44px  — the category name and its span
  padBottom: U + 8,                     // the x labels
  width: 15 * U,                        // 330px
  totalWidth: 46 * U,                   // 1012px
});

/** The label face is 11px. A line shorter than its own label is not a panel. */
const LABEL_PX = Number.parseFloat(TYPE_ROLE.label.size);

/** The two drawing modes, and the only two strings that name them. */
const MODES = Object.freeze(['share', 'dollars']);

/**
 * WHY THESE TWO SERIES AND NOT THE OTHER SIX.
 *
 * G4 attaches its reason requirement to the OUTCOME, not to the syntax: any
 * selection that leaves a series off the chart carries this sentence, and the
 * sentence is greppable so an audit of what the piece is not drawing finds it.
 * The six that are dropped are also PRINTED under the bank by `seriesRegister`,
 * so the drop is visible to a reader and not only to a reviewer of source.
 */
const BANK_SELECTION_REASON =
  'the by-medium bank draws coen_mce because it is the only rail whose medium partition sums ' +
  'exactly to its own published total in every year it covers, and iab_pwc beside it in the ' +
  'internet panel because the concordance records Coen internet as a serious undercount from ' +
  '2004; naa_newspaper is Coen own newspaper line for 1950-1989 by the record own concordance ' +
  'so drawing it would draw the same numbers twice, census_manufactures and irs_soi are ' +
  'cross-check-only, and magna, benchmarks_pre1919 and bridge_mce_mg8 publish a total with no ' +
  'medium partition at all; those rails are drawn on the rails board instead';

/* ------------------------------------------------------------------ *
 * 1 · Reading the record
 * ------------------------------------------------------------------ */

/** A point's calibration in the shape G1 reads. Nothing is reordered or repaired. */
function asClaim(point) {
  return {
    id: `${point.source_series}:${point.year}:${point.medium}`,
    central: (point.calibration || {}).central,
    ci80: (point.calibration || {}).ci80,
    grade: (point.calibration || {}).grade,
    unit: point.unit,
  };
}

/**
 * The medium partition, straight out of the record.
 *
 * `partition_member: true` is the record's own flag for "this line is one of
 * the pieces the total is made of". It is not a filter this file invented: the
 * flagged lines sum to the published total to the dollar in all 89 years, and
 * `planBank` re-checks that every year and refuses to draw if it stops being
 * true.
 */
function partitionPoints(seriesObj) {
  return (seriesObj.points || []).filter(
    (p) => p.money_type === null && p.medium !== 'total' && p.partition_member === true,
  );
}

function totalPoints(seriesObj) {
  return (seriesObj.points || []).filter((p) => p.medium === 'total' && p.money_type === null);
}

/** Concordance entries that are one compiler redefining its own categories. */
function selfConcordance(adspend, key) {
  return (adspend.concordance || []).filter((c) => c.series_a === key && c.series_b === key);
}

/** The largest readable peak among these, or null when not one of them has one. */
function peakOf(list) {
  const seen = list.map((m) => m.peakShare).filter((v) => typeof v === 'number');
  return seen.length ? Math.max(...seen) : null;
}

/**
 * HOW A PANEL PRINTS ITS PEAK.
 *
 * A peak is a central value. Internet's largest published share is 3.77% of the
 * 2007 total and that year is span-only — its 80% interval runs from 3.6% to
 * 8.0% — so "peak 3.8%" is the same definite figure the cross-section used to
 * print, wearing panel furniture. Where the record allows no central the panel
 * says so and names how far the interval reaches instead.
 */
function peakText(cat) {
  const head = cat.peakShare == null
    ? 'no year of this medium carries a middle value'
    : `peak ${pct(cat.peakShare)} of the US total`;
  const spans = cat.spanOnly
    ? ` · ${cat.spanOnly} span-only year${cat.spanOnly === 1 ? '' : 's'}, reaching ${pct(cat.peakDrawn)}`
    : '';
  return head + spans;
}

/* ------------------------------------------------------------------ *
 * 2 · Rails: turning points into marks that cannot lie
 * ------------------------------------------------------------------ */

/**
 * ONE DRAWABLE RAIL, IN ONE MODE, WITH THE FILTER BEFORE THE GUARD.
 *
 * THE ORDERING BUG THIS FIXES. The renderer used to call `buildPath` and
 * `assertNoInterpolation` over every point in a rail, and only THEN drop the
 * points it could not draw:
 *
 *     const usable = seg.points.filter((p) => value(p) != null && …);
 *
 * In share mode `value(p)` is `p.value / totals.get(p.year)`, and there is no
 * total after the Coen rail ends — so that filter removes years, and it removes
 * them AFTER the guard that checks nothing was removed. A hole opened between
 * two remaining points would have been bridged by the polyline with no guard
 * having seen the line that was actually drawn. It does not open one today;
 * that is luck, not a rule.
 *
 * The drawable set is now decided FIRST and the guards run on exactly the
 * points that become the drawing. Then every one of them becomes a mark through
 * claim-marks, so a span-only point arrives at the renderer with no central on
 * it in either mode.
 */
function buildRail(context, railSpec, mode, register) {
  const { adspend, selected, totals, partitionKey } = context;
  const series = selected[railSpec.series];
  /* `partition_member` marks the PIECES the published total is made of. A rail
   * drawing the total itself is not one of the pieces, so the flag is required
   * of the medium rails on the partition rail and of nothing else. Deriving
   * that from the spec rather than passing a flag means the total panel and the
   * category panels cannot end up on two different rules. */
  const needsMembers = railSpec.series === partitionKey && !railSpec.media.includes('total');
  const all = (series.points || [])
    .filter((p) => railSpec.media.includes(p.medium) && p.money_type === null)
    .filter((p) => !needsMembers || p.partition_member === true)
    .sort((a, b) => a.year - b.year);

  /* THE FILTER, FIRST. In share mode a point is drawable only where the record
   * publishes a total to divide by; after the total rail ends the panel is
   * blank whatever the rail holds, and blank reads as zero. */
  const drawable = mode === 'share' ? all.filter((p) => totals.has(p.year)) : all;

  /* SCOPE THE GAPS TO THIS RAIL, and to nothing wider.
   * The four documented holes are holes in the TOTAL rail. They are not holes
   * in every series: iab_pwc publishes every year of its own coverage, right
   * through the 2011-2025 by-medium hole. Handing the total-rail holes to a
   * single rail's path builder would break the IAB internet line at 2011 and
   * assert an absence the record does not have. `seriesYearGaps` is the call
   * the library provides for exactly this, and it returns the greppable
   * declared-empty sentinel rather than a bare [] when a rail has no hole. */
  const gaps = guards.seriesYearGaps(railSpec.series, adspend);
  const built = guards.buildPath(drawable, { gaps, adspend });
  guards.assertNoInterpolation(drawable, gaps, `the ${railSpec.media.join(' + ')} rail`, adspend);

  const transform = mode === 'share'
    ? null                                 // per-point; totals differ by year
    : (v) => v;

  const toMark = (p) => marks.planClaimMark(asClaim(p), {
    year: p.year,
    label: `${p.source_series} ${humanise(p.medium)}`,
    register,
    /* THE GUARD RUNS ON THE RECORD'S OWN NUMBERS and the transform is applied
     * afterwards. Dividing central, lo and hi by one denominator leaves the
     * interval ratio exactly where it was, so a share view cannot buy a central
     * that a dollar view is refused. */
    transform: transform || ((v) => (v / totals.get(p.year)) * 100),
    extra: { medium: p.medium, source_series: p.source_series },
  });

  const segments = built.segments.map((seg) => ({
    years: [seg.points[0].year, seg.points[seg.points.length - 1].year],
    source_series: seg.source_series,
    marks: seg.points.map(toMark),
  }));

  return {
    id: railSpec.id,
    key: railSpec.series,
    medium: railSpec.media[0],
    media: railSpec.media,
    mode,
    segments,
    marks: segments.flatMap((s) => s.marks),
    breaks: built.breaks,
    /* The years the record holds for this rail, before the mode dropped any —
     * printed under the bank, so a reader can see what the mode cost. */
    heldYears: all.length,
    drawnYears: drawable.length,
  };
}

/* ------------------------------------------------------------------ *
 * 3 · The plan. Computed, never typed.
 * ------------------------------------------------------------------ */

/**
 * THIS BANK'S OWN INVARIANTS, RE-RUN ON EVERY RE-ENTRY.
 *
 * claim-marks re-checks every mark it can reach against the live guards, which
 * catches a hand-built mark and a mark whose kind no longer matches its
 * interval. It cannot catch a number this module DERIVED from marks and then
 * printed — and that was the second surviving lie:
 *
 *     plan.categories.find(c => c.id === "internet").peakShare = 3.7656
 *
 * one line, on a sealed plan, and the internet panel prints "peak 3.8% of the
 * US total" — the exact figure this whole repair is named after, for a year the
 * library refuses a central to. Nothing about the marks changed, so nothing
 * about the marks could refuse it.
 *
 * Every printed number is therefore re-derived here from the marks and the
 * per-medium facts, and compared with what the plan says it will print.
 */
export function revalidateBank(plan, { marks: allMarks, context }) {
  const ctx = context || 'the small-multiple bank';
  const fail = (message, offending) => { throw new marks.MarkError(`${ctx}: ${message}`, offending); };

  /* --- every rail: its marks are its segments' marks, in order, and every mark
   * belongs to the medium and the compiler the segment says it does. --- */
  for (const [key, rail] of plan.railBuilds) {
    const flat = rail.segments.flatMap((s) => s.marks);
    if (flat.length !== rail.marks.length || flat.some((m, i) => m !== rail.marks[i])) {
      fail(`rail "${key}" carries a mark list that is no longer its own segments' marks, in order.`,
        key);
    }
    for (const seg of rail.segments) {
      if (!seg.marks.length) fail(`rail "${key}" holds an empty segment.`, seg);
      for (const m of seg.marks) {
        if (m.source_series !== seg.source_series) {
          fail(`rail "${key}" has mark "${m.id}" (${m.source_series}) in a segment of ` +
            `"${seg.source_series}".`, m);
        }
        if (!rail.media.includes(m.medium)) {
          fail(`rail "${key}" draws medium "${m.medium}", which is not one of the media it names ` +
            `(${rail.media.join(', ')}). A mark in the wrong panel is a medium's line drawn out of ` +
            `another medium's numbers.`, m);
        }
        if (m.year < seg.years[0] || m.year > seg.years[1]) {
          fail(`rail "${key}" has mark "${m.id}" for ${m.year} in a segment declared ` +
            `${seg.years[0]}–${seg.years[1]}.`, m);
        }
      }
    }
  }
  const totalFlat = plan.totalRail.segments.flatMap((s) => s.marks);
  if (totalFlat.length !== plan.totalRail.marks.length
      || totalFlat.some((m, i) => m !== plan.totalRail.marks[i])) {
    fail('the total rail carries a mark list that is no longer its own segments\' marks.', 'total');
  }

  /* --- every panel's printed peak. `peakShare` is what `peakText` prints beside
   * the panel name, and it is only allowed to be a share of a year the library
   * lets carry a central. --- */
  const allCats = [...plan.categories, ...(plan.tail ? plan.tail.cats : [])];
  for (const cat of allCats) {
    const members = cat.media.map((k) => plan.media.get(k));
    if (members.some((m) => !m)) fail(`panel "${cat.id}" names a medium the plan does not hold.`, cat.id);
    const readable = members.flatMap((m) => m.readableShares);
    const peak = readable.length ? Math.max(...readable.map((s) => s.share)) : null;
    if (peak !== cat.peakShare) {
      fail(`panel "${cat.id}" prints a peak of ${cat.peakShare} and the largest share of it the ` +
        `record allows a middle value is ${peak === null ? 'none at all' : peak}. A peak is a ` +
        `central value; a peak printed for a span-only year is the definite figure this module was ` +
        `repaired to stop printing.`, cat.id);
    }
    const drawn = Math.max(...members.map((m) => m.peakDrawn));
    if (drawn !== cat.peakDrawn) {
      fail(`panel "${cat.id}" says its widest interval reaches ${cat.peakDrawn} and it reaches ` +
        `${drawn}.`, cat.id);
    }
    const spans = members.reduce((n, m) => n + m.spanOnly, 0);
    if (spans !== cat.spanOnly) {
      fail(`panel "${cat.id}" says ${cat.spanOnly} span-only year(s) and holds ${spans}.`, cat.id);
    }
    if (cat.peakShare != null && cat.peakShare > plan.scaleTop) {
      fail(`panel "${cat.id}" prints a peak of ${cat.peakShare}% on a shared ceiling of ` +
        `${plan.scaleTop}%.`, cat.id);
    }
  }

  /* --- every cross-section: its members, its ordering sentence and, above all,
   * whether it may be drawn as a column at all. --- */
  for (const [year, xsec] of plan.crossSections) {
    if (xsec.year !== year) fail(`the cross-section filed under ${year} is for ${xsec.year}.`, year);
    const sorted = [...xsec.members].sort((a, b) => (a.first - b.first) || (a.id < b.id ? -1 : 1));
    if (sorted.some((m, i) => m !== xsec.members[i])) {
      fail(`the ${year} cross-section is no longer in the bank's fixed order. Fixed position is ` +
        `what lets a reader move the year and see one object change; a re-sorted column asserts an ` +
        `ordering G2 refuses.`, year);
    }
    for (const m of xsec.members) {
      if (m.mark.year !== year) {
        fail(`the ${year} cross-section holds "${m.id}" with a mark for ${m.mark.year}.`, m.id);
      }
      if (m.mark.medium !== m.id) {
        fail(`the ${year} cross-section holds "${m.id}" with a mark of medium "${m.mark.medium}".`,
          m.id);
      }
    }
    const indefinite = xsec.members.filter((m) => m.mark.kind !== 'point').map((m) => m.id);
    if (indefinite.length !== xsec.indefinite.length
        || indefinite.some((id, i) => id !== xsec.indefinite[i])) {
      fail(`the ${year} cross-section names ${xsec.indefinite.length} member(s) with no middle ` +
        `value and holds ${indefinite.length}.`, year);
    }
    const definite = indefinite.length === 0 && xsec.totalMark.kind === 'point';
    if (definite !== xsec.definite) {
      fail(`the ${year} cross-section says definite=${xsec.definite}. A column is a row of lengths ` +
        `measured against a total, so it needs a middle value for every member AND for the total.`,
        year);
    }
    const sum = definite ? xsec.members.reduce((a, m) => a + m.mark.central, 0) : null;
    if (definite ? Math.abs(sum - xsec.sum) > 1e-9 : xsec.sum !== null) {
      fail(`the ${year} cross-section carries a sum of ${xsec.sum} and its members sum to ${sum}.`,
        year);
    }
    if (definite && Math.abs(sum - 100) > 0.05) {
      fail(`the ${year} cross-section sums to ${sum.toFixed(3)}% instead of 100%.`, year);
    }
    const pairs = (xsec.members.length * (xsec.members.length - 1)) / 2;
    if (pairs !== xsec.pairsTested) {
      fail(`the ${year} cross-section says it compared ${xsec.pairsTested} pairs and holds ` +
        `${xsec.members.length} media, which is ${pairs} pairs. That sentence is universally ` +
        `quantified and has to be earned over the whole set.`, year);
    }
    const unorderable = marks.unorderablePairs(xsec.members.map((m) => m.mark)).length;
    if (unorderable !== xsec.unorderable.length) {
      fail(`the ${year} cross-section names ${xsec.unorderable.length} unorderable pair(s) and has ` +
        `${unorderable}.`, year);
    }
  }

  /* --- and the counts the page prints about itself. --- */
  const spanOnly = [...plan.railBuilds.values()]
    .filter((r) => r.mode === 'share')
    .reduce((n, r) => n + r.marks.filter((m) => m.kind === 'span').length, 0);
  if (spanOnly !== plan.spanOnlyCount) {
    fail(`the readout prints ${plan.spanOnlyCount} span-only marks and the share rails hold ` +
      `${spanOnly}.`, plan.spanOnlyCount);
  }
  const columns = [...plan.crossSections.values()].filter((x) => x.definite);
  const spanYears = [...plan.crossSections.values()].filter((x) => !x.definite).map((x) => x.year);
  if (columns.length !== plan.columnYears
      || spanYears.length !== plan.spanPanelYears.length
      || spanYears.some((y, i) => y !== plan.spanPanelYears[i])) {
    fail('the reasoning note names a different set of years drawable as a column from the one the ' +
      'cross-sections hold.', plan.spanPanelYears);
  }
  if (plan.partitionCheck.some((r) => !(Math.abs(r.residual) <= 0.5))) {
    fail('the partition no longer sums to the published total in every year, and every share on ' +
      'this page is value divided by total.', plan.partitionCheck.find((r) => !(Math.abs(r.residual) <= 0.5)));
  }
  marks.assertVerdictsVisible(allMarks, plan.verdictStamps, ctx);
  return true;
}

/**
 * Work out which panels the bank has, and why.
 *
 * Returns everything the page needs to print its own reasoning:
 *   scaleTop      the shared share ceiling, from the largest share in the record
 *   floorPct      the readability floor, in percent of the US total
 *   categories    the panels, in the order they are drawn
 *   tail          the categories under the floor, and the panel that holds them
 *   promoted      categories lifted over the floor by the record rather than by size
 *   seams         one-year redefinitions, from the concordance
 *   windows       multi-year caveats, from the concordance
 *   partitionCheck  the year-by-year proof that the partition sums to the total
 *   railBuilds    every rail, in both modes, as MARKS — the renderer's only input
 *   crossSections one entry per year, and whether that year can be a column
 */
export function planBank(frozen, options = {}) {
  const adspend = frozen.adspend;
  const ctx = 'the small-multiple bank';
  const register = marks.verdictRegister(ctx);

  /* G4. The selection, its reason, and the series that come off the chart. */
  const selected = guards.selectSeries(
    adspend, { only: ['coen_mce', 'iab_pwc'], because: BANK_SELECTION_REASON },
    ctx,
  );
  const allKeys = guards.seriesKeys(adspend);
  const dropped = allKeys.filter((k) => !(k in selected));

  /* WHICH RAIL CARRIES THE PARTITION IS READ, NOT TYPED.
   * `partition_member` is the record's own flag for "this line is one of the
   * pieces the total is made of", and exactly one selected rail carries it.
   * Finding it by property rather than by name means a repair that moves the
   * partition to another compiler moves this chart with no edit here — and a
   * record that stops carrying the flag stops the chart instead of silently
   * drawing an empty bank. */
  const partitionKey = Object.keys(selected).find(
    (k) => (selected[k].points || []).some((p) => p.partition_member === true),
  );
  if (!partitionKey) {
    throw new Error(
      'small-multiples: no selected series carries partition_member:true, so this bank has no ' +
      'medium partition to draw and would render an empty grid that looks deliberate. ' +
      'Check adspend.json.',
    );
  }
  const coen = selected[partitionKey];
  const partition = partitionPoints(coen);
  const totals = new Map(totalPoints(coen).map((p) => [p.year, p.value]));

  /* The partition is exact, or this chart does not run. Every share below is
   * value / total, and a share is only honest if the parts are the whole. */
  const partitionCheck = [];
  const byYear = new Map();
  for (const p of partition) {
    if (!byYear.has(p.year)) byYear.set(p.year, []);
    byYear.get(p.year).push(p);
  }
  for (const [year, pts] of [...byYear].sort((a, b) => a[0] - b[0])) {
    const sum = pts.reduce((a, p) => a + p.value, 0);
    const tot = totals.get(year);
    const residual = tot == null ? null : sum - tot;
    /* THE PROOF TRAVELS, THE LEVELS DO NOT. This used to carry `sum` and
     * `total` — two published money levels per year, sitting on the plan where
     * a renderer could print either of them without a guard having seen it. The
     * proof is that the residual is zero, and the residual is a difference, not
     * a reading. */
    partitionCheck.push({ year, members: pts.length, residual });
    if (tot == null || Math.abs(residual) > 0.5) {
      throw new Error(
        `small-multiples: the medium partition no longer sums to the published total in ${year} ` +
        `(${pts.length} members sum to ${sum}, the total is ${tot}). Every share this chart draws ` +
        `is value / total, and that arithmetic is only exact while the parts are the whole. ` +
        `Fix adspend.json or stop drawing shares.`,
      );
    }
  }

  /* PER-MEDIUM FACTS. All of them read, none of them assumed — and none of them
   * a record row.
   *
   * The grouping list is local: `rows` never leaves this function. What goes on
   * the plan is the derived facts, because the plan used to carry
   * `plan.media.get("internet").shares[i].point.calibration.central` — the
   * record's own 10,529, one property access from any renderer that wanted a
   * number without asking a guard for one. No renderer read it. That is not a
   * guarantee; it is the hazard the next team trips over. */
  const rows = new Map();
  for (const p of partition) {
    if (!rows.has(p.medium)) rows.set(p.medium, []);
    rows.get(p.medium).push(p);
  }
  const media = new Map();
  for (const [medium, pts] of rows) {
    pts.sort((a, b) => a.year - b.year);
    const years = pts.map((p) => p.year);
    const shares = pts.map((p) => {
      const t = totals.get(p.year);
      const c = p.calibration || {};
      return {
        year: p.year,
        share: (p.value / t) * 100,
        top: (c.ci80[1] / t) * 100,
        /* The library decides, on the record's own numbers. */
        wide: guards.isWideInterval(asClaim(p)),
      };
    });
    /* A PEAK IS A CENTRAL VALUE, so a medium only has one in the years the
     * library allows a central. Internet's largest published share is 3.77% in
     * 2007 — and that year is span-only, its 80% interval running from 3.6% to
     * 8.0%. Printing "peak 3.8%" beside the panel is the same definite figure
     * the cross-section used to print, arriving in the panel furniture. `null`
     * when no year of this medium carries a central at all.
     *
     * `readableShares` goes on the plan because `revalidateBank` re-derives the
     * printed peak from it on every re-entry. It holds shares — arithmetic this
     * module did over the record — and no record row. */
    const readableShares = shares.filter((s) => !s.wide).map((s) => ({ year: s.year, share: s.share }));
    const peakShare = readableShares.length ? Math.max(...readableShares.map((s) => s.share)) : null;
    /* A hole inside a medium's own window is an absence the record does not
     * document. There are none today. If one appears, refuse rather than draw
     * a line over it. */
    const holes = [];
    for (let i = 1; i < years.length; i += 1) {
      if (years[i] - years[i - 1] > 1) holes.push([years[i - 1] + 1, years[i] - 1]);
    }
    if (holes.length) {
      throw new Error(
        `small-multiples: "${medium}" has ${holes.length} year hole(s) inside its own window ` +
        `(${holes.map((x) => x.join('-')).join(', ')}) and adspend.json documents no absence there. ` +
        `A line across it would invent years. Add the hole to the record, or scope the rail.`,
      );
    }
    media.set(medium, {
      medium,
      series: pts[0].source_series,
      years,
      firstYear: years[0],
      lastYear: years[years.length - 1],
      readableShares,
      peakShare,
      peakShareYear: peakShare == null ? null
        : readableShares.find((s) => s.share === peakShare).year,
      /* THE TALLEST THING THIS MEDIUM ACTUALLY DRAWS is the top of its widest
       * interval, not its largest central. The shared ceiling is built on this —
       * see `scaleTop`. */
      peakDrawn: Math.max(...shares.map((s) => s.top)),
      spanOnly: shares.filter((s) => s.wide).length,
      undocumentedHoles: holes,
    });
  }

  /* The detail seam. `coen-medium-detail-1935` says by-medium detail does not
   * exist before its second year; the categories that end before it are the
   * coarse partition, and they share one panel because the record groups them. */
  const detailEntry = selfConcordance(adspend, partitionKey)
    .find((c) => /medium-detail/.test(c.id || ''));
  const detailStart = detailEntry ? detailEntry.years[1] : null;
  const coarse = detailStart == null ? [] :
    [...media.values()].filter((m) => m.lastYear < detailStart).map((m) => m.medium).sort();

  /* THE SHARED CEILING IS THE TALLEST THING THE PANELS DRAW, ROUNDED UP.
   *
   * It used to be the largest CENTRAL the record contains — 66.73%, giving a
   * ceiling of 70 — while every panel draws the 80% interval as a band. The
   * `other` category's 1919 band reaches 80.08% of the total, so it drew ten
   * points ABOVE its own panel frame, on a scale that said 70 was the top. A
   * ceiling built on centrals is a ceiling for a chart that only draws
   * centrals, and this one does not. */
  const maxDrawn = Math.max(...[...media.values()].map((m) => m.peakDrawn));
  /* `null` when not one medium in the record carries a central anywhere, which
   * the reasoning note then says in words. It used to fold that case into
   * `-Infinity` and hand it to a formatter, which printed an em dash. */
  const readablePeaks = [...media.values()].map((m) => m.peakShare).filter((v) => v != null);
  const maxShare = readablePeaks.length ? Math.max(...readablePeaks) : null;
  const scaleTop = ceilTo(maxDrawn, 5);

  /* THE FLOOR IS MEASURED, NOT CHOSEN. On the shared scale in a panel of
   * PANEL.plotHeight pixels, a category whose peak draws a line shorter than
   * its own 11px label cannot be read, so it does not get a panel. */
  const floorPct = (LABEL_PX / PANEL.plotHeight) * scaleTop;

  /* A category is promoted over the floor when the record — not its size —
   * says the reader has to see it: another selected rail measures the same
   * medium, so the record itself disputes the number. */
  const secondRails = new Map();
  for (const [key, series] of Object.entries(selected)) {
    if (key === partitionKey) continue;
    for (const p of series.points || []) {
      if (!media.has(p.medium)) continue;
      if (!secondRails.has(p.medium)) secondRails.set(p.medium, new Map());
      const rails = secondRails.get(p.medium);
      if (!rails.has(key)) rails.set(key, []);
      rails.get(key).push(p);
    }
  }

  /* Categories. One medium each, except the coarse pre-detail partition, which
   * the concordance names as one thing. */
  const cats = [];
  if (coarse.length) {
    const members = coarse.map((k) => media.get(k));
    cats.push({
      id: 'partition-before-detail',
      label: `The partition before ${detailStart}`,
      media: coarse,
      /* ONE RAIL PER MEDIUM, never one rail over both. Two media in one rail
       * puts two points on the same x and the path builder cannot tell them
       * apart — `source_series` is the same, so G3 has nothing to refuse, and
       * the line comes back as a sawtooth that reads like volatility. The
       * grouping is a panel, not a series. */
      rails: coarse.map((k) => ({ series: partitionKey, media: [k] })),
      compare: false,
      firstYear: Math.min(...members.map((m) => m.firstYear)),
      lastYear: Math.max(...members.map((m) => m.lastYear)),
      peakShare: peakOf(members),
      peakDrawn: Math.max(...members.map((m) => m.peakDrawn)),
      spanOnly: members.reduce((n, m) => n + m.spanOnly, 0),
      note: detailEntry ? detailEntry.note : null,
      grouped: true,
    });
  }
  for (const m of media.values()) {
    if (coarse.includes(m.medium)) continue;
    const second = secondRails.get(m.medium);
    cats.push({
      id: m.medium,
      label: humanise(m.medium),
      media: [m.medium],
      rails: [
        { series: partitionKey, media: [m.medium] },
        ...(second ? [...second.keys()].map((k) => ({ series: k, media: [m.medium] })) : []),
      ],
      firstYear: m.firstYear,
      lastYear: m.lastYear,
      peakShare: m.peakShare,
      peakDrawn: m.peakDrawn,
      spanOnly: m.spanOnly,
      secondRail: second ? [...second.keys()] : null,
      /* `compare` means "these rails measure the same medium on different
       * bases", which is the only case where the distance between them is a
       * fact worth drawing. A panel holding two different media is not that. */
      compare: Boolean(second),
      grouped: false,
    });
  }

  /* A category is under the floor when its readable peak is, or when it has no
   * readable peak at all — a medium whose every year is span-only draws no line
   * to measure against its own label. `null < x` is true in JavaScript because
   * null coerces to zero, which would have given the right answer for the wrong
   * reason; it is written out instead. */
  const under = (c) => c.peakShare == null || c.peakShare < floorPct;
  const promoted = cats.filter((c) => under(c) && c.secondRail);
  const above = cats.filter((c) => !under(c));
  const belowIds = new Set(cats.filter((c) => under(c) && !c.secondRail).map((c) => c.id));
  const tailCats = cats.filter((c) => belowIds.has(c.id));

  /* THE ORDER IS CHRONOLOGICAL, NEVER BY SIZE.
   * Sorting panels by size asserts an ordering between categories whose 80%
   * intervals overlap — business papers peaks at 7.18% of the total and yellow
   * pages at 7.15% — and the record does not settle that. First appearance in
   * the partition is a fact; the tie-break is alphabetical, which claims nothing. */
  const order = (a, b) => (a.firstYear - b.firstYear) || (a.label < b.label ? -1 : 1);
  const drawn = [...above, ...promoted].sort(order);

  const tail = tailCats.length ? {
    id: 'under-the-floor',
    label: 'Under the floor',
    cats: tailCats.sort(order),
    peakShare: peakOf(tailCats),
    peakDrawn: Math.max(...tailCats.map((c) => c.peakDrawn)),
    firstYear: Math.min(...tailCats.map((c) => c.firstYear)),
    lastYear: Math.max(...tailCats.map((c) => c.lastYear)),
  } : null;

  /* Every rail spec gets an id, so the built marks can be looked up by the
   * renderer without the renderer rebuilding anything. */
  const allCats = [...drawn, ...(tail ? tail.cats : [])];
  for (const cat of allCats) {
    (cat.rails || []).forEach((r, i) => { r.id = `${cat.id}#${i}`; });
  }

  /* Seams and windows, from the concordance. A one-year step is a seam drawn
   * across the whole bank; anything wider is a caveat printed under it. */
  const self = selfConcordance(adspend, partitionKey);
  const seams = self.filter((c) => c.years[1] - c.years[0] <= 1)
    .map((c) => ({ id: c.id, at: c.years[1], note: c.note }));
  const windows = self.filter((c) => c.years[1] - c.years[0] > 1)
    .map((c) => ({ id: c.id, years: [c.years[0], c.years[1]], note: c.note }));

  /* The x domain covers every year any drawn rail publishes, so the panels stay
   * aligned and every one of them shows the same hole at the end. */
  const drawnYears = [];
  for (const c of allCats) {
    drawnYears.push(c.firstYear, c.lastYear);
    for (const r of c.rails || []) {
      const s = selected[r.series];
      for (const p of s.points || []) if (r.media.includes(p.medium)) drawnYears.push(p.year);
    }
  }
  const domain = [Math.min(...drawnYears), Math.max(...drawnYears)];

  /* The documented holes that fall inside the drawn window. Every one of them
   * intersects an absence the record really has, which is what resolveGaps
   * demands, so this list can be handed straight to the guards. */
  const holes = guards.coverageGaps(adspend)
    .filter((g) => g.years[1] >= domain[0] && g.years[0] <= domain[1]);

  /* ---- every rail, in both modes, as MARKS ---- */
  const context = { adspend, selected, totals, partitionKey };
  const railBuilds = new Map();
  for (const cat of allCats) {
    for (const railSpec of cat.rails || []) {
      for (const mode of MODES) {
        railBuilds.set(`${railSpec.id}|${mode}`, buildRail(context, railSpec, mode, register));
      }
    }
  }
  const totalRail = buildRail(
    context, { id: 'total#0', series: partitionKey, media: ['total'] }, 'dollars', register,
  );

  /* The shared dollar domain, for the second scale mode. Decades, so a step up
   * the axis is a tenfold step in the money whichever panel you are reading.
   * It is taken from the INTERVAL BOUNDS and not from the central values,
   * because the bands are drawn to lo and hi and a domain built on centrals
   * lets an interval draw outside its own panel. */
  const drawnBounds = [...railBuilds.values()]
    .filter((r) => r.mode === 'dollars')
    .flatMap((r) => r.marks.flatMap((m) => [m.lo, m.hi]))
    .filter((v) => v > 0);
  const dollarDomain = [
    10 ** Math.floor(Math.log10(Math.min(...drawnBounds))),
    10 ** Math.ceil(Math.log10(Math.max(...drawnBounds))),
  ];

  /* ---- the cross-sections, one per year, decided in the plan ----
   * The total each column is a share OF is now the total rail's own MARK for
   * that year, not the record's `value` field. A column captioned "$X in total"
   * where X is a level the library refuses a central to is the same lie as a
   * segment drawn at a length it refuses — one ring further out. */
  const totalMarks = new Map(totalRail.marks.map((m) => [m.year, m]));
  const crossSections = new Map();
  for (const year of [...totals.keys()].sort((a, b) => a - b)) {
    crossSections.set(year,
      planCrossSection({ allCats, media, rows, totals, totalMarks, register }, year));
  }

  const stamps = marks.verdictStamps(register);

  /* WHAT A RENDERER MAY REACH FOR, AND WHAT IS NOT HERE.
   *
   * `selected` used to be on this plan: the whole of adspend.json's two series
   * objects, every point and every `calibration` block on them. So did `totals`,
   * a year-to-money map read straight off `p.value`. Nothing drew from either —
   * which is a latent hazard rather than a guarantee, and the hazard is the next
   * renderer that wants a level and finds one lying there un-guarded.
   *
   * What replaces them carries the same answers with none of the numbers:
   *   published   which years each series publishes, per medium — a coverage
   *               index, used by panelHoles to ask whether a rail covers a hole
   *   totalYears  the years the partition rail publishes a total for, which is
   *               the whole of what share mode needs to know
   *   totalRail   the total itself, as guard-decided marks
   */
  const published = {};
  for (const [key, series] of Object.entries(selected)) {
    const byMedium = {};
    for (const p of series.points || []) {
      if (p.money_type !== null && p.money_type !== undefined) continue;
      (byMedium[p.medium] = byMedium[p.medium] || []).push(p.year);
    }
    for (const list of Object.values(byMedium)) list.sort((a, b) => a - b);
    published[key] = byMedium;
  }

  const plan = {
    selectedKeys: Object.keys(selected), dropped, allKeys, dollarDomain, partitionKey,
    partitionCompiler: coen.compiler,
    published, totalYears: new Set(totals.keys()),
    media, partitionCheck,
    /* The concordance entry, projected the way `seams` and `windows` already
     * are. A concordance row is a sentence about a redefinition; it carries no
     * interval-bearing quantity, and it does not travel whole either. */
    detailEntry: detailEntry
      ? { id: detailEntry.id, years: [detailEntry.years[0], detailEntry.years[1]], note: detailEntry.note }
      : null,
    detailStart,
    coarse,
    maxShare, maxDrawn, scaleTop, floorPct, labelPx: LABEL_PX, panelHeight: PANEL.plotHeight,
    categories: drawn, tail, promoted, belowFloor: tailCats,
    seams, windows, domain, holes,
    railBuilds, totalRail, crossSections,
    verdictStamps: stamps,
    panelCount: 1 + drawn.length + (tail ? 1 : 0),
    selectionReason: BANK_SELECTION_REASON,
    spanOnlyCount: [...railBuilds.values()]
      .filter((r) => r.mode === 'share')
      .reduce((n, r) => n + r.marks.filter((m) => m.kind === 'span').length, 0),
    columnYears: [...crossSections.values()].filter((x) => x.definite).length,
    spanPanelYears: [...crossSections.values()].filter((x) => !x.definite).map((x) => x.year),
  };
  /* sealPlan deep-freezes, walks the whole graph for marks, and runs
   * revalidateBank — which is where assertVerdictsVisible now lives, over every
   * mark anywhere in the plan rather than over a hand-listed set of containers. */
  return marks.sealPlan(plan, { revalidate: revalidateBank, context: ctx });
}

/**
 * ONE YEAR OF THE PARTITION, AND WHETHER IT CAN BE A COLUMN.
 *
 * A stacked column is a row of lengths measured off each other. It needs one
 * length per member, and a span-only member has none — by construction, because
 * claim-marks did not put a central on it. So the plan decides here, once, and
 * the renderer draws whichever drawing the plan says this year supports.
 */
function planCrossSection({ allCats, media, rows, totals, totalMarks, register }, year) {
  const total = totals.get(year);
  const totalMark = totalMarks.get(year);
  if (!totalMark) {
    throw new Error(
      `small-multiples: the ${year} cross-section has a published total and the total rail has no ` +
      `mark for it, so the column would be captioned with a figure no guard has seen.`,
    );
  }
  const members = [];
  for (const cat of allCats) {
    for (const mkey of cat.media) {
      const m = media.get(mkey);
      const p = (rows.get(mkey) || []).find((q) => q.year === year);
      if (!p) continue;
      members.push({
        id: mkey,
        label: humanise(mkey),
        cat: cat.id,
        first: m.firstYear,
        mark: marks.planClaimMark(asClaim(p), {
          year,
          label: humanise(mkey),
          register,
          transform: (v) => (v / total) * 100,
          extra: { medium: mkey, source_series: p.source_series },
        }),
      });
    }
  }
  /* Fixed position: the year each category entered the partition, then
   * alphabetically. Never by size — see renderCrossSection. */
  members.sort((a, b) => (a.first - b.first) || (a.id < b.id ? -1 : 1));

  const indefinite = members.filter((m) => m.mark.kind !== 'point');
  /* A COLUMN NEEDS A LENGTH FOR EVERY MEMBER *AND* A TOTAL TO MEASURE THEM
   * AGAINST. The second half is new. Every segment of this column is a share of
   * the year's published total, and the drawing prints that total in three
   * places; where the library refuses the total a central, "one column, one
   * year, $X in total" is a definite figure for a level the record does not
   * support, and the members' shares are shares of it. */
  const definite = indefinite.length === 0 && totalMark.kind === 'point';
  /* Both figures are computed on the SHARE marks, so the arithmetic the drawing
   * does is the arithmetic the reader is shown. */
  const sum = definite ? members.reduce((a, m) => a + m.mark.central, 0) : null;

  return {
    year,
    /* THE TOTAL IS A MARK, NEVER THE RECORD'S OWN `value`. It used to be the
     * raw number, printed as "$X" in the alt sentence, in the readout and above
     * the column. */
    totalMark,
    members,
    definite,
    indefinite: indefinite.map((m) => m.id),
    sum,
    /* EVERY PAIR, not just the stack neighbours. See claim-marks.unorderablePairs
     * for the sentence this used to print when it tested only neighbours. */
    unorderable: marks.unorderablePairs(members.map((m) => m.mark))
      .map(([a, b]) => [a.label, b.label]),
    pairsTested: (members.length * (members.length - 1)) / 2,
  };
}

/* ------------------------------------------------------------------ *
 * 4 · Absence
 * ------------------------------------------------------------------ */

/**
 * WHICH ABSENCES THIS PANEL HAS.
 *
 * A documented hole belongs to a panel only when no rail drawn in that panel
 * publishes inside it. The internet panel is the one place in the bank where
 * this matters and it is the whole point of that panel: IAB/PwC publishes every
 * year of both modern holes, so the internet panel is the only one that does
 * not go dark at the end. Every other panel does, and that is `ds-gap-001` —
 * the fifteen years this project cares most about are the least measurable in
 * the whole window.
 */
function panelHoles(plan, frozen, cat, mode = 'dollars') {
  /* A rail covers a gap only where the panel can actually DRAW it. In share
   * mode every value is divided by the year's published total, and after the
   * total rail ends there is no total to divide by — so a rail with points in
   * those years still leaves the panel blank, and blank reads as zero. The
   * mode is part of the question, not a rendering detail.
   *
   * The question is asked of `plan.published`, a coverage index of years per
   * series per medium. It used to be asked of `plan.selected` — the record's own
   * series objects, calibration blocks and all, carried on the plan so that this
   * one predicate could ask "does this rail publish anything in these years?". A
   * question about coverage is answered with coverage. */
  const drawable = (year) => (mode === 'share' ? plan.totalYears.has(year) : true);
  const covered = (gap) => (cat.rails || []).some((railSpec) => {
    const byMedium = plan.published[railSpec.series] || {};
    return railSpec.media.some((medium) => (byMedium[medium] || []).some(
      (year) => year >= gap.years[0] && year <= gap.years[1] && drawable(year),
    ));
  });
  const mine = plan.holes.filter((g) => !covered(g));
  if (mine.length === 0) {
    return guards.declareNoDocumentedGaps(
      `every documented hole inside this panel's window is published by one of its own rails ` +
      `(${(cat.rails || []).map((r) => r.series).join(', ')}), so this panel has no absence to draw`,
    );
  }
  return mine;
}

/** Merge overlapping absence ranges so one hole is one drawn block. */
function mergeRanges(gaps) {
  const sorted = [...gaps].sort((a, b) => a.years[0] - b.years[0]);
  const out = [];
  for (const g of sorted) {
    const last = out[out.length - 1];
    if (last && g.years[0] <= last.years[1] + 1) {
      last.years[1] = Math.max(last.years[1], g.years[1]);
      last.reasons.push(g.reason);
      last.covers.push(g);
    } else {
      out.push({ years: [g.years[0], g.years[1]], reasons: [g.reason], covers: [g] });
    }
  }
  return out;
}

/**
 * Draw the panel's absences as named objects and hand the guard back exactly
 * what was drawn. One rect can carry more than one documented hole; each hole
 * gets its own descriptor pointing at that rect, because the guard asks about
 * holes and the drawing answers in blocks.
 */
function drawHoles(svg, box, gaps, xScale, { label = null, vertical = true } = {}) {
  const rendered = [];
  for (const span of mergeRanges(gaps)) {
    const lo = Math.max(span.years[0], xScale.domain[0]);
    const hi = Math.min(span.years[1], xScale.domain[1]);
    if (hi <= lo) continue;
    const x = xScale(lo);
    const w = xScale(hi) - x;
    if (w < 2) continue;
    const name = label || `no source · ${span.years[0]}–${span.years[1]}`;
    absenceBlock(svg, svg, {
      x, y: box.y0 + 1, width: w, height: box.y1 - box.y0 - 2,
      years: span.years, label: name, vertical: vertical || w < 150,
    });
    for (const g of span.covers) {
      rendered.push({ years: [g.years[0], g.years[1]], label: g.reason, form: 'stipple' });
    }
  }
  return rendered;
}

/** Split a rail's marks into runs that may be joined, and the spans that break them. */
function markRuns(list) {
  const runs = [];
  const spans = [];
  let run = null;
  for (const mark of list) {
    if (mark.kind !== 'point') { spans.push(mark); run = null; continue; }
    if (!run) { run = []; runs.push(run); }
    run.push(mark);
  }
  return { runs, spans };
}

/* ------------------------------------------------------------------ *
 * 5 · The bank
 * ------------------------------------------------------------------ */

function panelSvg(parent, { width, plotHeight, alt, padLeft = PANEL.padLeft }) {
  const w = width + padLeft + PANEL.padRight;
  const hgt = plotHeight + PANEL.padTop + PANEL.padBottom;
  const svg = svgRoot(parent, { width: w, height: hgt, alt, className: 'p2-panel-svg' });
  return { svg, w, h: hgt, x0: padLeft, x1: padLeft + width, y0: PANEL.padTop, y1: PANEL.padTop + plotHeight };
}

function drawPanelChrome(svg, box, { label, sub, xScale, yScale, ticks }) {
  frame(svg, { x: box.x0, y: box.y0, width: box.x1 - box.x0, height: box.y1 - box.y0 });

  /* Gridlines: zinc, 1px, dashed because they are indicative. */
  for (const t of ticks) {
    const y = yScale(t.value);
    if (y < box.y0 || y > box.y1) continue;
    rule(svg, { x1: box.x0, y1: y, x2: box.x1, y2: y, dashed: true });
    text(svg, { x: box.x0 - 5, y: y + 3.5, value: t.label, role: 'chrome', fill: ZINC_TEXT, anchor: 'end', size: '10px' });
  }

  /* Decade ticks on the time axis, and the two ends named. */
  const [d0, d1] = xScale.domain;
  for (let y = Math.ceil(d0 / 20) * 20; y <= d1; y += 20) {
    const x = xScale(y);
    rule(svg, { x1: x, y1: box.y1, x2: x, y2: box.y1 + 4 });
    text(svg, { x, y: box.y1 + 15, value: String(y), role: 'chrome', fill: ZINC_TEXT, anchor: 'middle', size: '10px' });
  }

  text(svg, { x: box.x0, y: box.y0 - 24, value: label, role: 'label', fill: INK.secondary });
  if (sub) text(svg, { x: box.x0, y: box.y0 - 9, value: sub, role: 'chrome', fill: ZINC_TEXT, size: '11px' });
}

function shareTicks(scaleTop) {
  const step = scaleTop > 40 ? 20 : scaleTop > 12 ? 10 : 2;
  const out = [];
  for (let v = 0; v <= scaleTop + 1e-9; v += step) out.push({ value: v, label: `${v}%` });
  return out;
}

function dollarTicks(domain) {
  return decadeTicks(domain).map((v) => ({ value: v, label: usd(v) }));
}

/** The one formatter a mark is printed through, per mode. */
function modeFormat(mode) {
  return mode === 'share' ? ((v) => pct(v)) : ((v) => usd(v, { compact: false }));
}

/**
 * Draw one rail from the marks the plan built for it.
 *
 * There is no record point in this function and no `calibration` object to
 * reach into. A span-only mark carries `lo` and `hi` and no `central`, so the
 * central line cannot run through it: the run is broken because there is
 * nothing to put in it, not because a check remembered to break it.
 */
function drawRail(svg, plan, cat, railSpec, { xScale, yScale, mode, dashed, railIndex }) {
  const rail = plan.railBuilds.get(`${railSpec.id}|${mode}`);
  if (!rail) {
    throw new Error(
      `small-multiples: no rail was planned for "${railSpec.id}" in ${mode} mode. Every rail the ` +
      `renderer draws is built in planBank, so that the guards run over exactly the points that ` +
      `become the drawing. A renderer that builds its own rail is the bypass this module closed.`,
    );
  }
  const format = modeFormat(mode);
  const g = el('g', { class: 'p2-rail', 'data-series': rail.key }, svg);

  for (const seg of rail.segments) {
    if (!seg.marks.length) continue;

    /* The 80% interval, textured by source grade. */
    const gradeOf = (m) => m.grade || 'C';
    let runStart = 0;
    for (let i = 1; i <= seg.marks.length; i += 1) {
      if (i === seg.marks.length || gradeOf(seg.marks[i]) !== gradeOf(seg.marks[runStart])) {
        const chunk = seg.marks.slice(runStart, Math.min(i + 1, seg.marks.length));
        if (chunk.length > 1) {
          const lo = chunk.map((m) => [xScale(m.year), yScale(m.lo)]);
          const hi = chunk.map((m) => [xScale(m.year), yScale(m.hi)]);
          band(g, lo, hi, {
            fill: gradeFill(svg, gradeOf(seg.marks[runStart]), BRASS),
            opacity: gradeOf(seg.marks[runStart]) === 'A' ? 0.2 : 0.55,
            title: `80% interval, source grade ${gradeOf(seg.marks[runStart])}`,
          });
        }
        runStart = i;
      }
    }

    /* The central line, broken wherever the library allowed no central. */
    const { runs, spans } = markRuns(seg.marks);
    for (const run of runs) {
      polyline(g, run.map((m) => [xScale(m.year), yScale(m.central)]), {
        color: BRASS, width: railIndex === 0 ? 2 : 1.5, dashed,
        title: `${rail.key} · ${cat.label}`,
      });
    }
    for (const m of spans) {
      spanMark(g, {
        x: xScale(m.year), yLow: yScale(m.lo), yHigh: yScale(m.hi),
        title: marks.markTitle(m, { label: cat.label, format }),
      });
    }
    if (spans.length) g.setAttribute('data-span-only', String(spans.length));
  }
  return rail;
}

function drawPanel(parent, plan, frozen, cat, { mode, xScale, yDomain, yTicks }) {
  const wrap = h('figure', { class: 'p2-panel' }, parent);
  const alt = buildPanelAlt(plan, cat, mode);
  const box = panelSvg(wrap, { width: PANEL.width, plotHeight: PANEL.plotHeight, alt });
  const { svg } = box;

  const yScale = mode === 'share'
    ? linear([0, yDomain[1]], [box.y1, box.y0])
    : log10Scale(yDomain, [box.y1, box.y0]);

  const sub = cat.grouped
    ? cat.media.map(humanise).join(' · ')
    : `${cat.firstYear}–${cat.lastYear} · ${peakText(cat)}`;
  drawPanelChrome(svg, box, { label: cat.label, sub, xScale, yScale, ticks: yTicks });

  /* Documented absence, drawn before the rails so a line can never sit on top
   * of it and look like data. */
  const myHoles = panelHoles(plan, frozen, cat, mode);
  const rendered = drawHoles(svg, box, myHoles, xScale, { label: 'no by-medium source' });
  guards.assertAbsenceDrawn(myHoles, rendered, `the ${cat.label} panel`, frozen.adspend);
  if (myHoles.length === 0) {
    text(svg, {
      x: box.x1, y: box.y0 - 24, value: 'no hole — a rail runs to the end',
      role: 'chrome', fill: IRON, anchor: 'end', size: '10px',
    });
  }

  /* Seams, from the concordance, in every panel at the same x. */
  for (const seam of plan.seams) {
    const x = xScale(seam.at);
    if (x < box.x0 || x > box.x1) continue;
    const line = rule(svg, { x1: x, y1: box.y0, x2: x, y2: box.y1, color: IRON, width: 1, dashed: true });
    el('title', {}, line).textContent = `${seam.at} · ${seam.id} — ${seam.note}`;
  }

  const rails = [];
  cat.rails.forEach((railSpec, i) => {
    rails.push(drawRail(svg, plan, cat, railSpec, { xScale, yScale, mode, dashed: i > 0, railIndex: i }));
  });

  /* Two rails measuring the SAME medium on different bases are never merged.
   * Where they overlap, the distance is drawn as a caliper and printed, with
   * the concordance note behind it. A panel that merely holds two different
   * media gets names on its lines instead — the distance between two different
   * things is not a fact. */
  if (cat.compare && rails.length > 1) {
    drawRailDistance(svg, box, plan, frozen, cat, rails, { xScale, yScale, mode });
  } else if (rails.length > 1) {
    nameRails(svg, box, rails, { xScale, yScale });
  }

  const capt = h('figcaption', { class: 'p2-panel-cap p2-chrome' }, wrap);
  capt.textContent = alt;
  return { cat, svg, rails, alt };
}

/**
 * Two brass lines in one panel cannot be separated by hue, and `tokens.js` has
 * no call that will declare two marks of the SAME role colour distinguishable —
 * `assertDistinguishable(BRASS, BRASS, { redundant: [...] })` throws, because
 * the record says brass carries "solid fill, filled round particle" and neither
 * dash nor label is recorded against it. So the separation here is dash, weight
 * and a printed name, stated rather than asserted. That gap is reported.
 */
function lastMark(rail) {
  return rail.marks.length ? rail.marks[rail.marks.length - 1] : null;
}

function nameRails(svg, box, rails, { xScale, yScale }) {
  rails.forEach((rail, i) => {
    const last = lastMark(rail);
    if (!last) return;
    const x = xScale(last.year);
    text(svg, {
      /* A PIXEL, never a value: this is where a label hangs. For a span-only
       * mark it is halfway down the bar that was drawn, which is a fact about
       * the drawing and not a number in the record's units. */
      x: Math.min(x + 4, box.x1 - 3),
      y: marks.anchorY(last, yScale) + (i % 2 === 0 ? -5 : 11),
      value: humanise(rail.medium), role: 'chrome', fill: BRASS_TEXT, size: '10px',
      anchor: x > box.x1 - 70 ? 'end' : 'start',
    });
  });
}

/**
 * G3, made visible. The two rails are never joined; the distance between them
 * is drawn and printed, and the record's own sentence about why they differ is
 * read out of the concordance rather than written here.
 *
 * AND IT IS ONLY A DISTANCE WHEN BOTH ENDS ARE READINGS. The latest year these
 * two rails share is 2007, and Coen's 2007 internet figure is one of the five
 * span-only points in the record: its 80% interval runs from $10.0bn to
 * $22.3bn. A caliper printing "23.7%" between that and the IAB figure would be
 * a ratio between a number the library refuses to draw and one it does not.
 * Where either end has no central the drawing shows both intervals and prints
 * the bounds the two intervals allow, which is what the record supports.
 */
function drawRailDistance(svg, box, plan, frozen, cat, rails, { xScale, yScale, mode }) {
  const [a, b] = rails;
  const byYear = (rail) => new Map(rail.marks.map((m) => [m.year, m]));
  const ma = byYear(a);
  const mb = byYear(b);
  const shared = [...ma.keys()].filter((y) => mb.has(y));
  if (!shared.length) return;
  const year = Math.max(...shared);
  const pa = ma.get(year);
  const pb = mb.get(year);
  const format = modeFormat(mode);
  const note = guards.basisBreakNote(a.key, b.key, frozen.adspend);

  if (pa.kind === 'point' && pb.kind === 'point') {
    const ratio = (pa.central / pb.central) * 100;
    const cal = caliper(svg, {
      x: xScale(year), yA: yScale(pa.central), yB: yScale(pb.central), side: -1, arm: 12,
      label: `${ratio.toFixed(1)}%`,
    });
    el('title', {}, cal).textContent =
      `${year}: ${a.key} reads ${format(pa.central)} and ${b.key} reads ${format(pb.central)} — ` +
      `the first is ${ratio.toFixed(1)}% of the second. The two rails are never merged into one ` +
      `line. ${note ? note.note : ''}`;
  } else {
    /* No pair of readings, so no single ratio. The bounds the two intervals
     * allow are computable and honest; they are the edges of the two 80%
     * intervals, and they are NOT themselves an 80% interval for the ratio. */
    const lo = (pa.lo / pb.hi) * 100;
    const hi = (pa.hi / pb.lo) * 100;
    const g = el('g', { class: 'p2-rail-distance', 'data-year': year, 'data-definite': 'false' }, svg);
    [pa, pb].forEach((m, i) => {
      const mx = xScale(year) - 6 + i * 12;
      spanMark(g, { x: mx, yLow: yScale(m.lo), yHigh: yScale(m.hi), color: IRON, width: 8 });
    });
    text(svg, {
      x: Math.min(xScale(year) + 10, box.x1 - 4), y: box.y1 - 6,
      value: `${lo.toFixed(0)}–${hi.toFixed(0)}%`, role: 'chrome', fill: IRON, size: '10px', anchor: 'end',
    });
    el('title', {}, g).textContent =
      `${year}: ${marks.markTitle(pa, { label: a.key, format })} — and — ` +
      `${marks.markTitle(pb, { label: b.key, format })}. At least one of these has no central ` +
      `value, so there is no single distance between them. On the two intervals' own edges the ` +
      `first is anywhere from ${lo.toFixed(0)}% to ${hi.toFixed(0)}% of the second. ` +
      `${note ? note.note : ''}`;
  }

  /* Both rails are named on the drawing. Three brass lines cannot be separated
   * by hue, and the library has no call for declaring two rails of the SAME
   * role colour distinguishable — so the channels here are position, dash and
   * a printed name, and they are stated rather than asserted. */
  [a, b].forEach((rail, i) => {
    const last = lastMark(rail);
    if (!last) return;
    const x = xScale(last.year);
    const labelY = box.y0 + 14 + i * 13;
    const lx = box.x0 + 6;
    rule(svg, { x1: x, y1: marks.anchorY(last, yScale), x2: lx + 50, y2: labelY + 2, dashed: true });
    text(svg, { x: lx, y: labelY, value: rail.key, role: 'chrome', fill: BRASS_TEXT, size: '10px' });
  });
}

function buildPanelAlt(plan, cat, mode) {
  const shape = mode === 'share' ? 'share of the US advertising total' : 'US dollars, on a log scale';
  const rails = cat.compare
    ? ` Two rails measure this medium and they are drawn side by side and never joined: ` +
      `${cat.rails.map((r) => r.series).join(' and ')}. The record disputes the first one.`
    : '';
  const group = cat.grouped
    ? ` This panel holds ${cat.media.map(humanise).join(' and ')}, each on its own line.`
    : '';
  const peak = cat.peakShare == null
    ? ' No year of it carries a middle value, so it has no highest share to name.'
    : ` Its highest share of the US total is ${pct(cat.peakShare)}.`;
  const spanNote = cat.spanOnly
    ? ` ${cat.spanOnly} year${cat.spanOnly === 1 ? '' : 's'} here have an interval too wide to carry ` +
      `a middle value, and are drawn as the interval alone with no line through them; the widest ` +
      `reaches ${pct(cat.peakDrawn)} of the total.`
    : '';
  return `${cat.label}, ${shape}. The record runs ${cat.firstYear} to ${cat.lastYear}.` +
    `${peak}${group}${rails}${spanNote}`;
}

/* The total panel: first, largest, and on its own scale. */
function drawTotalPanel(parent, plan, frozen) {
  const rail = plan.totalRail;
  const first = rail.marks[0];
  const last = rail.marks[rail.marks.length - 1];
  const tallest = rail.marks.reduce(
    (best, m) => (m.kind === 'point' && (!best || m.central > best.central) ? m : best), null);
  const wrap = h('figure', { class: 'p2-panel p2-panel--total' }, parent);
  /* THIS SENTENCE IS THE FIGCAPTION *AND* THE SVG'S aria-label. It used to open
   * `It rises from ${usd(first.layout)}` — the MIDPOINT of the first year's
   * interval, dressed as a reading, printed and spoken. On the record as frozen
   * that year is a point and the midpoint is the central, so nothing was false;
   * move the cut to 0.30 and coen_mce 1919 becomes span-only at a ratio of
   * exactly 0.35, and the panel says "It rises from $2bn" about a mark the
   * library refuses a middle value to. `markFigure` says the range instead. */
  const alt =
    `The US advertising total on the Coen/McCann rail, ${first.year} to ${last.year}, ` +
    `in US dollars on a log scale. It rises from ${marks.markFigure(first, usd)} to a high of ` +
    `${tallest ? usd(tallest.central) : 'a level no single reading carries'}. After the rail ends ` +
    `the record has no free annual total, and the hole is drawn as a named block. This panel is ` +
    `NOT on the same scale as the category panels below it.`;
  const box = panelSvg(wrap, {
    width: PANEL.totalWidth, plotHeight: PANEL.totalPlotHeight, alt, padLeft: 3.5 * U,
  });
  const { svg } = box;

  const bounds = rail.marks.flatMap((m) => [m.lo, m.hi]);
  const dom = [10 ** Math.floor(Math.log10(Math.min(...bounds))), 10 ** Math.ceil(Math.log10(Math.max(...bounds)))];
  const yScale = log10Scale(dom, [box.y1, box.y0]);
  const totalX = linear(plan.domain, [box.x0, box.x1]);

  drawPanelChrome(svg, box, {
    label: 'The US total — its own scale',
    sub: `${plan.partitionCompiler.split(',')[0]} · ${first.year}–${last.year} · log dollars · ` +
      'not comparable to the category panels',
    xScale: totalX, yScale, ticks: dollarTicks(dom),
  });

  const totalHoles = panelHoles(plan, frozen, { rails: [{ series: plan.partitionKey, media: ['total'] }] });
  const rendered = drawHoles(svg, box, totalHoles, totalX, {
    label: 'no free annual total', vertical: false,
  });
  guards.assertAbsenceDrawn(totalHoles, rendered, 'the total panel', frozen.adspend);

  for (const seam of plan.seams) {
    const x = totalX(seam.at);
    const line = rule(svg, { x1: x, y1: box.y0 - 6, x2: x, y2: box.y1, color: IRON, width: 1, dashed: true });
    el('title', {}, line).textContent = `${seam.at} · ${seam.id} — ${seam.note}`;
    text(svg, { x: x + 4, y: box.y0 - 9, value: seam.at, role: 'chrome', fill: IRON, size: '10px' });
  }

  const format = modeFormat('dollars');
  const g = el('g', { class: 'p2-rail', 'data-series': plan.partitionKey }, svg);
  for (const seg of rail.segments) {
    const lo = seg.marks.map((m) => [totalX(m.year), yScale(m.lo)]);
    const hi = seg.marks.map((m) => [totalX(m.year), yScale(m.hi)]);
    band(g, lo, hi, { fill: gradeFill(svg, 'B', BRASS), opacity: 0.5, title: '80% interval, source grade B' });
    const { runs, spans } = markRuns(seg.marks);
    for (const run of runs) {
      polyline(g, run.map((m) => [totalX(m.year), yScale(m.central)]), {
        color: BRASS, width: 2, title: 'US total, advertiser billings at list price',
      });
    }
    for (const m of spans) {
      spanMark(g, {
        x: totalX(m.year), yLow: yScale(m.lo), yHigh: yScale(m.hi),
        title: marks.markTitle(m, { label: 'US total', format }),
      });
    }
  }

  const capt = h('figcaption', { class: 'p2-panel-cap p2-chrome' }, wrap);
  capt.textContent = alt;
  return { svg, box, totalX };
}

/* ------------------------------------------------------------------ *
 * 6 · The page furniture
 * ------------------------------------------------------------------ */

function reasoningNote(parent, plan) {
  const box = h('div', { class: 'p2-note-box' }, parent);
  h('div', { class: 'p2-arch', text: `Why ${plan.panelCount} panels` }, box);
  const dl = h('dl', { class: 'p2-kv' }, box);
  const row = (k, v) => { h('dt', { text: k }, dl); h('dd', { text: v }, dl); };

  row('The shared ceiling',
    `${pct(plan.scaleTop, 0)} of the US total — the tallest thing any panel draws is the top of ` +
    `the widest 80% interval in the record, at ${pct(plan.maxDrawn)}, rounded up. It is NOT the ` +
    `largest central value, which is ` +
    `${plan.maxShare == null ? 'a figure the record does not carry, because no medium has a year ' +
      'the library allows a middle value' : pct(plan.maxShare)}: a ceiling built on centrals is a ` +
    `ceiling for a chart that draws only centrals, and this one draws intervals as bands, so the ` +
    `widest of them drew above its own panel frame. Every category panel is on this one scale, so ` +
    `a height in one panel means the same thing in every other.`);
  row('The floor, measured',
    `${pct(plan.floorPct)} of the US total. On the shared ceiling, in a ${plan.panelHeight}-pixel ` +
    `panel, that is ${plan.labelPx} pixels — the height of the panel's own name. A category whose ` +
    `whole century draws a line shorter than its own label is not a panel a reader can read.`);
  row('Under the floor',
    plan.belowFloor.length
      ? `${plan.belowFloor.length}: ${plan.belowFloor.map((c) => c.label).join(', ')}. They are not ` +
        `dropped. They share the last panel, each still its own line, on the same scale, named.`
      : 'None.');
  if (plan.promoted.length) {
    row('Promoted by the record, not by size',
      `${plan.promoted.map((c) => c.label).join(', ')} — ` +
      `${plan.promoted.map((c) => peakText(c)).join('; ')}, below the floor. The record carries a ` +
      `second, independent rail for it (${plan.promoted.map((c) => c.secondRail.join(', ')).join('; ')}), ` +
      `so the record itself disputes the number. A category the record says is measured wrong is one ` +
      `the reader has to be shown.`);
  }
  row('The order',
    'The year each category enters the partition, then alphabetically. Never by size: sorting by ' +
    'size asserts an ordering between categories whose 80% intervals overlap, and the record does ' +
    'not settle it.');
  row('The total panel',
    'First, largest, and on its own log-dollar scale. It is the only panel not on the shared scale, ' +
    'and it says so on itself.');
  row('The partition is exact',
    `Checked at draw time in all ${plan.partitionCheck.length} years: the flagged members sum to the ` +
    `published total to the dollar. Every share on this page is value divided by total, and that ` +
    `arithmetic is only honest while the parts are the whole. If it stops being true, this chart ` +
    `refuses to draw.`);
  row('Marks with no middle value',
    `${plan.spanOnlyCount} of the drawn years carry an 80% interval wider than ` +
    `${marks.wideCutPercent()}% of their own value, so the library allows them no central mark and ` +
    `the plan does not give the renderer one. They are drawn as the interval alone. The same ` +
    `${plan.spanPanelYears.length} year(s) cannot be drawn as a stacked column at all — ` +
    `${plan.spanPanelYears.join(', ') || 'none'} — because a column is a row of lengths and those ` +
    `years do not have a length for every member.`);
  return box;
}

function seriesRegister(parent, plan, frozen) {
  const box = h('div', { class: 'p2-note-box' }, parent);
  h('div', { class: 'p2-arch', text: `The record holds ${plan.allKeys.length} series. This bank draws ${plan.selectedKeys.length}.` }, box);
  h('p', { class: 'p2-chrome', text: plan.selectionReason }, box);
  const table = h('table', { class: 'p2-reg' }, box);
  const thead = h('thead', {}, table);
  const tr = h('tr', {}, thead);
  for (const c of ['Series', 'Role', 'What it measures', 'Drawn here']) h('th', { text: c }, tr);
  const tbody = h('tbody', {}, table);
  for (const key of plan.allKeys) {
    const s = frozen.adspend.series[key];
    const row = h('tr', {}, tbody);
    h('td', { text: key }, row);
    h('td', { text: s.role }, row);
    h('td', { text: String(s.measures).slice(0, 150) }, row);
    h('td', { text: plan.selectedKeys.includes(key) ? 'yes' : 'no — see the reason above' }, row);
  }
  return box;
}

function seamRegister(parent, plan) {
  const box = h('div', { class: 'p2-note-box' }, parent);
  h('div', { class: 'p2-arch', text: 'Seams and caveats, from the concordance' }, box);
  const table = h('table', { class: 'p2-reg' }, box);
  const tbody = h('tbody', {}, table);
  for (const s of plan.seams) {
    const row = h('tr', {}, tbody);
    h('td', { text: `seam ${s.at}` }, row);
    h('td', { text: s.id }, row);
    h('td', { text: s.note }, row);
  }
  for (const w of plan.windows) {
    const row = h('tr', {}, tbody);
    h('td', { text: `${w.years[0]}–${w.years[1]}` }, row);
    h('td', { text: w.id }, row);
    h('td', { text: w.note }, row);
  }
  for (const g of plan.holes) {
    const row = h('tr', {}, tbody);
    h('td', { text: `${g.years[0]}–${g.years[1]}` }, row);
    h('td', { text: 'documented absence' }, row);
    h('td', { text: g.reason }, row);
  }
  return box;
}

/** Every verdict that is not `confirmed`, printed where the reader meets it. */
function verdictRegisterBox(parent, plan) {
  if (!plan.verdictStamps.length) return null;
  const box = h('div', { class: 'p2-note-box' }, parent);
  h('div', { class: 'p2-arch', text: 'What verification changed' }, box);
  const table = h('table', { class: 'p2-reg' }, box);
  const tbody = h('tbody', {}, table);
  for (const s of plan.verdictStamps) {
    const row = h('tr', {}, tbody);
    h('td', { text: s.id }, row);
    h('td', { text: String(s.verdict).toUpperCase() }, row);
    h('td', { text: s.statement || s.sentence }, row);
  }
  return box;
}

/* ------------------------------------------------------------------ *
 * 7 · Public entry points
 * ------------------------------------------------------------------ */

/** The one door a plan from outside comes through. See claim-marks.openSealedPlan. */
function resolvePlan(frozen, options, context) {
  return options.plan
    ? marks.openSealedPlan(options.plan, context)
    : planBank(frozen, options);
}

/**
 * THE BANK.
 *
 * @param {Element} container
 * @param {object}  frozen   the frozen files: { adspend, claims, ... }
 * @param {object}  options  { mode: 'share' | 'dollars', plan }
 */
export function renderBank(container, frozen, options = {}) {
  guards.useFrozen(frozen);
  const plan = resolvePlan(frozen, options, 'the small-multiple bank');
  let mode = options.mode === 'dollars' ? 'dollars' : 'share';

  container.innerHTML = '';
  container.classList.add('p2-bank');

  const head = h('header', { class: 'p2-bank-head' }, container);
  h('div', { class: 'p2-arch', text: 'The small-multiple bank · US advertising by medium' }, head);
  h('h2', { class: 'p2-bank-title', text: 'Every medium on its own baseline, on one shared scale.' }, head);
  h('p', {
    class: 'p2-prose p2-bank-lede',
    text: 'There is no stack here, and there will not be one. Every band above a baseline forces a ' +
      'length judgement against a moving reference, and the middle bands are where this story lives. ' +
      'So each category gets its own flat baseline and they all share one scale. To read the parts ' +
      'against the whole, take the cross-section: one year, one column.',
  }, head);

  const ctl = h('div', { class: 'p2-ctl' }, head);
  h('span', { class: 'p2-arch', text: 'Scale — turn the handle' }, ctl);
  const rocker = h('div', { class: 'p2-rocker', role: 'group', 'aria-label': 'Panel scale' }, ctl);
  const readout = h('span', { class: 'p2-chrome p2-cut' }, ctl);

  const body = h('div', { class: 'p2-bank-body' }, container);

  const draw = () => {
    body.innerHTML = '';
    const xScale = linear(plan.domain, [PANEL.padLeft, PANEL.padLeft + PANEL.width]);

    const totalHost = h('div', { class: 'p2-bank-total' }, body);
    drawTotalPanel(totalHost, plan, frozen);

    const yDomain = mode === 'share' ? [0, plan.scaleTop] : plan.dollarDomain;
    const yTicks = mode === 'share' ? shareTicks(plan.scaleTop) : dollarTicks(yDomain);

    const grid = h('div', { class: 'p2-bank-grid' }, body);
    for (const cat of plan.categories) {
      drawPanel(grid, plan, frozen, cat, { mode, xScale, yDomain, yTicks });
    }
    if (plan.tail) drawTailPanel(grid, plan, frozen, { mode, xScale, yDomain, yTicks });

    readout.textContent = mode === 'share'
      ? `SHARE OF THE US TOTAL · 0 to ${pct(plan.scaleTop, 0)} · shared by every category panel · ` +
        `${plan.spanOnlyCount} span-only marks`
      : `US DOLLARS · log scale · shared by every category panel · ${plan.spanOnlyCount} span-only marks`;
  };

  for (const [key, label] of [['share', 'Share of the total'], ['dollars', 'Dollars, log']]) {
    const btn = h('button', {
      type: 'button', 'data-mode': key, 'aria-pressed': String(mode === key), text: label,
    }, rocker);
    btn.addEventListener('click', () => {
      if (mode === key) return;
      crank({
        input: btn,
        output: body,
        apply: () => {
          mode = key;
          for (const b of rocker.querySelectorAll('button')) {
            b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
          }
          draw();
        },
      });
    });
  }

  draw();

  const foot = h('div', { class: 'p2-bank-foot' }, container);
  reasoningNote(foot, plan);
  seamRegister(foot, plan);
  verdictRegisterBox(foot, plan);
  seriesRegister(foot, plan, frozen);

  return { plan, mode: () => mode, redraw: draw };
}

function drawTailPanel(parent, plan, frozen, { mode, xScale, yDomain, yTicks }) {
  const tail = plan.tail;
  const wrap = h('figure', { class: 'p2-panel p2-panel--tail' }, parent);
  const alt =
    `The tail: ${tail.cats.map((c) => c.label).join(', ')}. Each is under the readability floor of ` +
    `${pct(plan.floorPct)} of the US total, so none of them gets its own panel. They are not dropped. ` +
    `They are drawn here together, each still its own line, on the same scale as every other panel.`;
  const box = panelSvg(wrap, { width: PANEL.width, plotHeight: PANEL.plotHeight, alt });
  const { svg } = box;
  const yScale = mode === 'share'
    ? linear([0, yDomain[1]], [box.y1, box.y0])
    : log10Scale(yDomain, [box.y1, box.y0]);

  drawPanelChrome(svg, box, {
    label: 'Under the floor',
    sub: tail.cats.map((c) => `${c.label} (${peakText(c)})`).join(' · '),
    xScale, yScale, ticks: yTicks,
  });

  const tailRails = tail.cats.flatMap((c) => c.rails);
  const myHoles = panelHoles(plan, frozen, { rails: tailRails }, mode);
  const rendered = drawHoles(svg, box, myHoles, xScale, { label: 'no by-medium source' });
  guards.assertAbsenceDrawn(myHoles, rendered, 'the tail panel', frozen.adspend);

  for (const seam of plan.seams) {
    const x = xScale(seam.at);
    if (x < box.x0 || x > box.x1) continue;
    const line = rule(svg, { x1: x, y1: box.y0, x2: x, y2: box.y1, color: IRON, width: 1, dashed: true });
    el('title', {}, line).textContent = `${seam.at} · ${seam.id} — ${seam.note}`;
  }

  tail.cats.forEach((cat, i) => {
    cat.rails.forEach((railSpec, j) => {
      drawRail(svg, plan, cat, railSpec, { xScale, yScale, mode, dashed: i > 0, railIndex: j });
    });
    /* Each tail line is named on the drawing, and the names are staggered up a
     * leader so three lines that all sit near the baseline stay legible.
     * Position and a printed name are the two channels doing the work; hue
     * cannot separate three brass lines. */
    const built = plan.railBuilds.get(`${cat.rails[0].id}|${mode}`);
    const last = built && lastMark(built);
    if (!last) return;
    const labelY = box.y0 + 14 + i * 13;
    const lx = box.x0 + 6;
    rule(svg, {
      x1: xScale(last.year), y1: marks.anchorY(last, yScale), x2: lx + 62, y2: labelY + 2, dashed: true,
    });
    text(svg, { x: lx, y: labelY, value: cat.label, role: 'chrome', fill: BRASS_TEXT, size: '10px' });
  });

  const capt = h('figcaption', { class: 'p2-panel-cap p2-chrome' }, wrap);
  capt.textContent = alt;
}

/* ------------------------------------------------------------------ *
 * 8 · The cross-section — parts-to-whole, bought back for ONE year
 * ------------------------------------------------------------------ */

/** The caption's sentence about ordering, scoped to exactly what was tested. */
function orderingSentence(xsec) {
  if (xsec.unorderable.length === 0) {
    return ` All ${xsec.pairsTested} pairs of media in this year were compared, and no two of ` +
      `them have overlapping 80% intervals.`;
  }
  return ` Of the ${xsec.pairsTested} pairs of media in this year, ${xsec.unorderable.length} have ` +
    `overlapping 80% intervals and cannot be ordered against each other: ` +
    `${xsec.unorderable.map((p) => p.join(' / ')).join('; ')}. That is why nothing here is sorted.`;
}

/**
 * A stacked column is legitimate for one year read as one column, and
 * illegitimate as a time series. This view is that column, and it is labelled
 * as one year on the drawing itself so it cannot be mistaken for the bank.
 *
 * THE SEGMENTS ARE NOT SORTED BY SIZE. They sit in the bank's own order — the
 * year each category enters the partition — for two reasons. Sorting asserts an
 * ordering between categories the record cannot separate. And a fixed order
 * means the same medium is in the same place in every year's column, so moving
 * the year reads as one object changing rather than as a new picture.
 *
 * `renderPools(pools, "unranked", "fixed-position")` is the guard call that
 * holds that: change "fixed-position" to "sorted" and G2 refuses it.
 *
 * AND SOME YEARS ARE NOT COLUMNS. See the file header: a year whose partition
 * contains a member with no central value is drawn as a fixed-position span
 * panel instead. The plan decides which; this function only draws what it is
 * told, and has no number to build a false length out of either way.
 */
export function renderCrossSection(container, frozen, options = {}) {
  guards.useFrozen(frozen);
  const plan = resolvePlan(frozen, options, 'the cross-section');
  const years = [...plan.crossSections.keys()].sort((a, b) => a - b);
  let year = options.year && plan.crossSections.has(options.year)
    ? options.year
    : years[years.length - 1];

  container.innerHTML = '';
  container.classList.add('p2-cross');

  const head = h('header', { class: 'p2-bank-head' }, container);
  h('div', { class: 'p2-arch', text: 'Cross-section · one year, one column' }, head);
  h('h2', { class: 'p2-bank-title', text: 'The parts against the whole, for a single year.' }, head);
  /* Reader-facing, so it clears the four gates as a block, measured with
   * tools/readability.py: FK 3.88, Reading Ease 87.5, Gunning Fog 6.20,
   * SMOG 7.05 — inside FK <= 10, Ease >= 50, Fog <= 12, SMOG <= 12. */
  h('p', {
    class: 'p2-prose p2-bank-lede',
    text: 'A stacked column is honest for one year, read as one column. Repeat it along a time axis ' +
      'and each band is measured against a base that moves. That is why the bank above is not a ' +
      'stack. The parts here sit in the order they entered the record, never in size order. So the ' +
      'same medium sits in the same place every year, and no order is claimed that the record ' +
      'cannot back.',
  }, head);
  h('p', {
    class: 'p2-prose p2-bank-lede',
    text: 'Some years are not drawn as a column at all. A column is a row of lengths. In a few ' +
      'years one medium has a range too wide to have a middle value, so it has no length. Those ' +
      'years get a row of ranges instead.',
  }, head);

  const ctl = h('div', { class: 'p2-ctl' }, head);
  h('label', { class: 'p2-arch', for: 'p2-xsec-year', text: 'Year' }, ctl);
  const select = h('select', { class: 'p2-select', id: 'p2-xsec-year' }, ctl);
  /* The years that cannot be a column say so IN THE PICKER, before the reader
   * chooses one, so the change of drawing is expected rather than surprising.
   * The reason is on the option's title; the label stays short enough not to
   * stretch the control past its own row. */
  for (const y of years) {
    const xs = plan.crossSections.get(y);
    const o = h('option', {
      value: String(y),
      text: xs.definite ? String(y) : `${y} · no column`,
      title: xs.definite
        ? `${y}: every medium has a middle value, and so does the total, so this year is a column.`
        : xs.indefinite.length
          ? `${y}: ${xs.indefinite.map(humanise).join(', ')} ` +
            `${xs.indefinite.length === 1 ? 'has' : 'have'} an interval too wide to carry a middle ` +
            `value, so this year has no length for every member and is drawn as a row of ranges.`
          : `${y}: the published total has an interval too wide to carry a middle value, so there ` +
            `is no whole for these parts to be measured against, and the year is drawn as a row ` +
            `of ranges.`,
    }, select);
    if (y === year) o.setAttribute('selected', 'selected');
  }
  const readout = h('span', { class: 'p2-chrome p2-cut' }, ctl);

  const body = h('div', { class: 'p2-cross-body' }, container);

  const draw = () => {
    body.innerHTML = '';
    const xsec = plan.crossSections.get(year);
    const members = xsec.members;

    /* G2. The layout is declared unordered and checked. Swapping
     * "fixed-position" for "sorted" here is refused by the record. */
    const guardResult = guards.renderPools(
      members.map((m) => ({ id: m.id })), 'unranked', 'fixed-position',
    );

    const out = xsec.definite
      ? drawColumn(body, plan, xsec, guardResult)
      : drawSpanPanel(body, plan, xsec, guardResult);

    readout.textContent =
      `${year} · ${marks.markFigure(xsec.totalMark, usd)} · ${members.length} media · ` +
      `layout "${guardResult.layout}" ` +
      `(encodesOrder=${guardResult.encodesOrder}) · ` +
      (xsec.definite ? 'drawn as a column' : `drawn as a span panel — ${xsec.indefinite.join(', ')} have no middle value`);
    return out;
  };

  select.addEventListener('change', () => {
    crank({
      input: select,
      output: body,
      apply: () => { year = Number(select.value); draw(); },
    });
  });

  draw();
  return { plan, year: () => year, redraw: draw };
}

const XS = Object.freeze({
  W: 44 * U, colX: 6 * U, colW: 5 * U, H: 17 * U, top: 2.5 * U,
});

/**
 * THE COLUMN. Every member has a central, so every member has a length — and so
 * does the total they are all shares OF, which is why `xsec.definite` asks about
 * the total's mark as well. `total` below is that mark's central, reached
 * through the one branch the plan says may reach it.
 */
function drawColumn(body, plan, xsec, guardResult) {
  const { year, members } = xsec;
  const total = xsec.totalMark.central;
  const bottom = XS.H - U;

  /* The parts are the whole, checked on the marks the drawing actually uses.
   * planBank has already proved it for every year on the record's own values;
   * this is the same proof over the numbers this column is built from. */
  if (Math.abs(xsec.sum - 100) > 0.05) {
    throw new Error(
      `small-multiples: the ${year} cross-section sums to ${xsec.sum.toFixed(3)}% of the published ` +
      `total instead of 100%. A column that does not add up is not a parts-to-whole drawing.`,
    );
  }

  const alt =
    `US advertising in ${year}, ${usd(total)} in total, as one column split into ` +
    `${members.length} media. The largest is ` +
    `${members.reduce((a, b) => (a.mark.central > b.mark.central ? a : b)).label} ` +
    `at ${pct(Math.max(...members.map((m) => m.mark.central)))} of the total. ` +
    `The segments are in the order the categories entered the record, not in size order.`;
  const svg = svgRoot(body, { width: XS.W, height: XS.H, alt, className: 'p2-xsec-svg' });

  const y = linear([0, 100], [bottom, XS.top]);
  frame(svg, { x: XS.colX, y: XS.top, width: XS.colW, height: bottom - XS.top, fill: 'none' });

  let acc = 0;
  members.forEach((m, i) => {
    const mark = m.mark;
    const y0 = y(acc + mark.central);
    const y1 = y(acc);
    const grade = mark.grade || 'C';
    const seg = el('rect', {
      x: XS.colX, y: y0, width: XS.colW, height: Math.max(0.6, y1 - y0),
      fill: gradeFill(svg, grade, BRASS), 'fill-opacity': grade === 'A' ? 0.28 : 0.62,
      stroke: IRON, 'stroke-width': 1.25,
    }, svg);
    el('title', {}, seg).textContent = marks.markTitle(mark, { label: m.label, format: (v) => pct(v) });
    /* Leaders spread evenly down the full height of the column, so a 1.5%
     * band gets the same amount of label as a 21% one. Every segment is
     * named and printed whatever its height: a band too thin to read as a
     * length is still a fact, and the record holds it either way. */
    const leaderY = XS.top + 8 + (i * (bottom - XS.top - 16)) / Math.max(1, members.length - 1);
    rule(svg, { x1: XS.colX + XS.colW, y1: (y0 + y1) / 2, x2: XS.colX + XS.colW + 14, y2: leaderY, dashed: true });
    rule(svg, { x1: XS.colX + XS.colW + 14, y1: leaderY, x2: XS.colX + XS.colW + 22, y2: leaderY, dashed: true });
    text(svg, { x: XS.colX + XS.colW + 26, y: leaderY + 3.5, value: m.label, role: 'chrome', fill: INK.secondary });
    text(svg, {
      x: XS.colX + XS.colW + 26 + 150, y: leaderY + 3.5, value: pct(mark.central),
      role: 'chrome', fill: BRASS_TEXT, anchor: 'end',
    });
    text(svg, {
      x: XS.colX + XS.colW + 26 + 240, y: leaderY + 3.5, value: usd((mark.central / 100) * total),
      role: 'chrome', fill: BRASS_TEXT, anchor: 'end',
    });
    text(svg, {
      x: XS.colX + XS.colW + 26 + 270, y: leaderY + 3.5, value: grade,
      role: 'chrome', fill: ZINC_TEXT, anchor: 'end',
    });
    acc += mark.central;
  });

  text(svg, { x: XS.colX, y: XS.top - 20, value: `${year}`, role: 'numeral', fill: INK.primary, size: '30px' });
  text(svg, {
    x: XS.colX + XS.colW + 26, y: XS.top - 20, role: 'chrome', fill: ZINC_TEXT,
    value: `${usd(total)} · ${members.length} media · one column, one year`,
  });
  text(svg, { x: XS.colX - 6, y: bottom + 4, value: '0', role: 'chrome', fill: ZINC_TEXT, anchor: 'end' });
  text(svg, { x: XS.colX - 6, y: XS.top + 4, value: usd(total), role: 'chrome', fill: ZINC_TEXT, anchor: 'end' });

  const caption = h('p', { class: 'p2-chrome p2-panel-cap' }, body);
  caption.textContent = alt + orderingSentence(xsec);
  return { svg, alt, guardResult };
}

/**
 * THE SPAN PANEL — the drawing for a year that is not a column.
 *
 * Same members, same fixed order, one row each, on a shared share axis. A
 * member with a central gets a dot on its interval; a member without one gets
 * the interval alone, in the hatch that means "constructed or uncertain", and
 * no dot anywhere. Nothing is stacked, so nothing is measured off anything else
 * and one wide interval does not move ten other segments.
 */
function drawSpanPanel(body, plan, xsec, guardResult) {
  const { year, members } = xsec;
  /* The total is a mark here too, and this is the branch where it may not have
   * a central at all — a year lands on this drawing either because a member has
   * no middle value or because the total itself does not. `markFigure` prints
   * the range in the second case and never a midpoint. */
  const totalText = marks.markFigure(xsec.totalMark, usd);
  const rowH = 20;
  const top = XS.top;
  const height = top + members.length * rowH + 3 * U;
  const x0 = 9 * U;
  const x1 = XS.W - 12 * U;
  const ceiling = ceilTo(Math.max(...members.map((m) => m.mark.hi)), 5);

  const why = xsec.indefinite.length
    ? `${xsec.indefinite.length} of the media (${xsec.indefinite.map(humanise).join(', ')}) carry ` +
      `an 80% interval wider than ${marks.wideCutPercent()}% of their own value, so the record ` +
      `gives them no middle value and they have no length.`
    : `the published total for this year carries an 80% interval wider than ` +
      `${marks.wideCutPercent()}% of its own value, so there is no middle value for the parts to ` +
      `be shares of.`;
  const alt =
    `US advertising in ${year}, ${totalText} in total, split into ${members.length} media — and ` +
    `NOT drawn as a stacked column. ${why} Each medium is drawn here as its own interval on a ` +
    `shared share axis, in the same fixed order the bank uses, with nothing stacked and nothing ` +
    `summed.`;
  const svg = svgRoot(body, { width: XS.W, height, alt, className: 'p2-xsec-svg p2-xsec-svg--spans' });

  const x = linear([0, ceiling], [x0, x1]);
  text(svg, { x: 0, y: top - 20, value: `${year}`, role: 'numeral', fill: INK.primary, size: '30px' });
  text(svg, {
    x: x0, y: top - 20, role: 'chrome', fill: IRON,
    value: `${totalText} · ${members.length} media · NO COLUMN: ` +
      (xsec.indefinite.length
        ? `${xsec.indefinite.length} of them have no middle value`
        : 'the total itself has no middle value'),
  });

  for (let v = 0; v <= ceiling + 1e-9; v += 5) {
    rule(svg, { x1: x(v), y1: top, x2: x(v), y2: top + members.length * rowH, dashed: v !== 0 });
    text(svg, {
      x: x(v), y: top + members.length * rowH + 14, value: pct(v, 0),
      role: 'chrome', fill: ZINC_TEXT, anchor: 'middle', size: '10px',
    });
  }

  members.forEach((m, i) => {
    const mark = m.mark;
    const yy = top + i * rowH + rowH / 2;
    const g = el('g', { class: 'p2-xsec-row', 'data-medium': m.id, 'data-mark': mark.kind }, svg);
    text(g, { x: x0 - 8, y: yy + 3.5, value: m.label, role: 'chrome', fill: INK.secondary, anchor: 'end' });
    if (mark.kind === 'point') {
      el('line', {
        x1: x(mark.lo), y1: yy, x2: x(mark.hi), y2: yy, stroke: BRASS, 'stroke-width': 5, 'stroke-opacity': 0.3,
      }, g);
      pointMark(g, { x: x(mark.central), y: yy, r: 3.2 });
      text(g, {
        x: x1 + 8, y: yy + 3.5, value: pct(mark.central), role: 'chrome', fill: BRASS_TEXT,
      });
    } else {
      el('rect', {
        x: x(mark.lo), y: yy - 6, width: Math.max(2, x(mark.hi) - x(mark.lo)), height: 12,
        fill: gradeFill(svg, 'C', IRON), stroke: IRON, 'stroke-width': 1, 'stroke-dasharray': '3 2',
      }, g);
      text(g, {
        x: x1 + 8, y: yy + 3.5, value: `${pct(mark.lo)}–${pct(mark.hi)}`,
        role: 'chrome', fill: IRON,
      });
      text(g, {
        x: x1 + 92, y: yy + 3.5, value: 'no middle value', role: 'chrome', fill: IRON,
      });
    }
    el('title', {}, g).textContent = marks.markTitle(mark, { label: m.label, format: (v) => pct(v) });
  });

  const caption = h('p', { class: 'p2-chrome p2-panel-cap' }, body);
  caption.textContent = alt +
    ` The partition still sums exactly to the published total on the compiler's own point values ` +
    `— planBank proves that for all ${plan.partitionCheck.length} years before anything is drawn — ` +
    `but a published point value is not a length this chart may draw when the interval around it ` +
    `is that wide.` + orderingSentence(xsec);
  return { svg, alt, guardResult };
}

/**
 * Default entry point. Draws the bank, then the cross-section beneath it.
 * `options.views` narrows it to one of them.
 *
 * ONE PLAN, TWO VIEWS, and this is the reason `options.plan` exists at all: the
 * partition proof runs over eighty-nine years and there is no reason to run it
 * twice. It is passed here as a SEALED plan, and the receiving view re-opens it
 * through claim-marks, which refuses anything this module did not mint.
 */
export function render(container, frozen, options = {}) {
  guards.useFrozen(frozen);
  const plan = planBank(frozen, options);
  const views = options.views || ['bank', 'cross-section'];
  container.innerHTML = '';
  const out = {};
  if (views.includes('bank')) {
    const host = h('section', { class: 'p2-view' }, container);
    out.bank = renderBank(host, frozen, { ...options, plan });
  }
  if (views.includes('cross-section')) {
    const host = h('section', { class: 'p2-view' }, container);
    out.crossSection = renderCrossSection(host, frozen, { ...options, plan });
  }
  out.plan = plan;
  return out;
}

export default { render, renderBank, renderCrossSection, planBank };
