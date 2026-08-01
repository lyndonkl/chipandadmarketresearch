/**
 * value-chart.js — the total-spend line, or rather lines. Team B2.
 *
 * THE FIVE RULES, AND WHERE EACH ONE IS ENFORCED.
 *
 * 1. NEVER SPLICE. Every path runs through guards.buildPath, which breaks on a
 *    change of source_series and on a documented hole. Where two stitch rails
 *    both cover a year, both are drawn and the vertical distance between them
 *    is filled with a labelled wedge reading the measured gap. The figures come
 *    from guards.basisBreakNote(), which reads adspend.json's concordance —
 *    nothing about the 1980 break is typed into this file.
 *
 * 2. THE MODERN GAPS ARE OBJECTS. They are derived, not scanned: the segments
 *    come from guards.buildPath, the documented holes come from
 *    guards.coverageGaps, and a named absence is the space between two segments
 *    that falls inside a documented hole. On the frozen record that yields
 *    exactly nine — seven in the pre-1919 benchmark stretch and two modern ones.
 *    Each is drawn as stipple with a label and checked by assertAbsenceDrawn.
 *
 * 3. THE PRE-1919 STRETCH IS BENCHMARK POINTS, NOT A LINE. The cadence comes
 *    from rail-board.js's railCadence(), which reads the series' own
 *    known_breaks. The plan forces a benchmark rail to marks and the renderer
 *    THROWS if one ever reaches the ribbon branch, so the rule is a refusal
 *    rather than a default that an upstream edit could flip.
 *
 * 4. WIDE INTERVALS ARE SPANS, AND THE RENDERER CANNOT REACH A CENTRAL THAT
 *    DOES NOT EXIST. This rule used to be enforced by asking the guard at each
 *    draw site, and it failed in the ordinary way: one draw site — the short-run
 *    observation square — read `seg.kinds[i]` into a variable, never used it,
 *    and drew a filled square at the central value of whatever it was handed.
 *    The rule is no longer a question the renderer has to remember to ask. The
 *    plan asks it once, through ./claim-marks.js, and then REMOVES the central
 *    from every mark the library calls span-only. There is nothing to forget:
 *    `mark.central` on a span is `undefined`, and drawing at `undefined` is a
 *    visible failure rather than a quiet lie.
 *
 * 5. THE BRIDGE IS OURS. It is drawn in 45° iron hatch with a dashed outline —
 *    the constructed texture from the rail board — and it is the only rail on
 *    the chart that is not brass, because it is not a compiler's money. Its
 *    cadence comes from `bridged: true` on its own points.
 *
 * MOTION. Values arrive with SETTLE from ../lib/motion.js. The reduced half
 * crossfades and leaves the origin ghost, so both paths end with every rail at
 * its measured position.
 *
 * THE FINDING THIS CHART MUST NOT CONTRADICT. Advertising's share of US GDP
 * peaked at about 3.0% in 1922, not in 2000. This chart plots current dollars,
 * where the tallest year is late — so it prints, unconditionally, that its axis
 * is dollars and not share of GDP.
 *
 * ON REJECTED CLAIMS, AND WHY THIS MODULE NO LONGER THROWS ON ONE. It used to
 * refuse any claim the record marks `rejected`, and the GDP strip drew one as a
 * first-class mark. Two modules, two rules, one record. The record settles it:
 * `ds-gdp-001` is rejected AND its body is the correction — the statement, the
 * central of 3.0 and the 1922 about_year are the verifier's own replacement,
 * applied in place. Refusing it refuses the corrected finding; drawing it
 * silently hides a scar. So the rule now lives in ./claim-marks.js, once, for
 * both modules: every verdict is drawable and no verdict is invisible. A claim
 * whose verdict is not `confirmed` cannot be marked at all without a register,
 * and this module prints the register under the drawing.
 */

import * as guards from '../lib/guards.js';
import * as marks from './claim-marks.js';
import { settle } from '../lib/motion.js';
import { railCadence, CADENCE } from './rail-board.js';
import {
  el, layer, text, titled, textures, uid, linear, log10Scale, decadeTicks,
  shortLabel, yearsLabel, comma,
  BONE, GRAPHITE, ZINC_RULE, ZINC_TEXT, BRASS, BRASS_TEXT, IRON, STIPPLE,
  INK, SURFACE, GRID,
} from './svg-kit.js';

/* ------------------------------------------------------------------ *
 * 1. Reading a point as a claim, and turning it into a stripped mark
 * ------------------------------------------------------------------ */

/**
 * A point's own calibration block, in the shape G1 reads.
 *
 * NOTHING IS RESHAPED. `central` and `ci80` are lifted verbatim out of the
 * point's `calibration`; the id is composed only so the guard's error message
 * can name the point that failed. G1 refuses an inverted [high, low] and a
 * central outside its own interval rather than repairing either, and that
 * refusal is the behaviour this chart wants: a data defect is repaired in the
 * data, under a stage with a contract, not silently at draw time.
 */
function pointClaim(point) {
  const c = point.calibration || {};
  return {
    id: `${point.source_series}@${point.year}`,
    central: c.central,
    ci80: c.ci80,
    unit: point.unit,
    grade: c.grade,
  };
}

/**
 * The one place a record point becomes something this chart can draw.
 *
 * G1 decides the kind and this function only asks — but the answer is no longer
 * advice stored beside the data. `planClaimMark` returns a frozen object that
 * carries a `central` only when the library allows one, so the renderer's
 * geometry has nothing to draw at when the answer is "span".
 */
function pointMark(point, register) {
  return marks.planClaimMark(pointClaim(point), {
    year: point.year,
    label: point.source_series,
    register,
    extra: { source_series: point.source_series, medium: point.medium },
  });
}

/** The tallest mark that is entitled to a central value, or null. */
function tallestPointMark(list) {
  return list.reduce(
    (best, m) => (m.kind === 'point' && (!best || m.central > best.central) ? m : best),
    null,
  );
}

/* ------------------------------------------------------------------ *
 * 2. Absence, derived from the library's own answers
 * ------------------------------------------------------------------ */

function mergeSpans(spans) {
  const sorted = [...spans].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const out = [];
  for (const span of sorted) {
    const last = out[out.length - 1];
    if (last && span[0] <= last[1] + 1) last[1] = Math.max(last[1], span[1]);
    else out.push([span[0], span[1]]);
  }
  return out;
}

/**
 * The named absences on the total rail.
 *
 * NOT A SCAN OF THE DATA. Both inputs come from guards.js: the drawn spans are
 * guards.buildPath's own segments, and the documented holes are
 * guards.coverageGaps(). An absence is the space between two segments that
 * falls inside a documented hole, and it carries that hole's recorded reason.
 *
 * Constructed rails are excluded from the span set on purpose. The bridge
 * covers 1980-2007 with values we made; letting it close a hole would let our
 * own construction erase the record's absence, which is the whole failure G5
 * exists for, arriving through the front door.
 */
function namedAbsences(rails, documented) {
  const spans = mergeSpans(
    rails.filter((r) => r.cadence !== CADENCE.CONSTRUCTED)
      .flatMap((r) => r.segments.map((s) => s.years))
  );
  const out = [];
  for (let i = 1; i < spans.length; i += 1) {
    const lo = spans[i - 1][1] + 1;
    const hi = spans[i][0] - 1;
    if (hi < lo) continue;
    const hole = documented.find((g) => g.years[0] <= hi && lo <= g.years[1]);
    if (!hole) continue;
    out.push({
      years: [lo, hi],
      betweenYears: [spans[i - 1][1], spans[i][0]],
      hole: hole.id,
      reason: hole.reason,
      label: `no annual total, ${yearsLabel([lo, hi])}`,
      form: 'stipple',
      span: hi - lo + 1,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 3. The plan
 * ------------------------------------------------------------------ */

/**
 * THIS CHART'S OWN INVARIANTS, RE-RUN ON EVERY RE-ENTRY.
 *
 * claim-marks walks the plan generically and re-checks every mark it finds
 * against the live guards. That catches a hand-built mark and a mark whose kind
 * no longer matches its interval. It cannot catch a mark that is perfectly
 * legal and IN THE WRONG PLACE — which was the surviving lie: take the minted
 * `coen_mce` 1919 point, write it into the benchmark rail's 1867 slot, and the
 * rail draws a central square reading 1,930 where the record has a span with no
 * middle value at all. Every per-mark test passes, because the mark is real.
 *
 * What refuses it is the structure. A rail's marks are its segments' marks, in
 * order; a mark belongs to the segment whose `source_series` it carries and
 * whose years contain it; the counts the title block prints are re-derived
 * rather than trusted. All of that is re-derived here, from the live plan, on
 * mint and on every arrival through `options.plan`.
 */
export function revalidateValueChart(plan, { marks: allMarks, context }) {
  const ctx = context || 'the value chart';
  const fail = (message, offending) => { throw new marks.MarkError(`${ctx}: ${message}`, offending); };

  const railMarks = [];
  for (const rail of plan.rails) {
    const fromSegments = rail.segments.flatMap((s) => s.marks);
    if (fromSegments.length !== rail.marks.length
        || fromSegments.some((m, i) => m !== rail.marks[i])) {
      fail(`rail "${rail.key}" carries a mark list that is no longer its own segments' marks, in ` +
        `order. The two are one fact and a plan where they disagree draws one of them and counts ` +
        `the other.`, rail.key);
    }
    for (const seg of rail.segments) {
      if (seg.marks.length === 0) fail(`rail "${rail.key}" holds an empty segment.`, seg);
      seg.marks.forEach((m, i) => {
        if (m.source_series !== seg.source_series) {
          fail(`rail "${rail.key}" has mark "${m.id}" (${m.source_series}) sitting in a segment of ` +
            `"${seg.source_series}". A segment is one compiler's run; a mark from another rail in ` +
            `it is the splice G3 exists to refuse, arriving after the path was built.`, m);
        }
        if (m.year < seg.years[0] || m.year > seg.years[1]) {
          fail(`rail "${rail.key}" has mark "${m.id}" for ${m.year} in a segment declared ` +
            `${yearsLabel(seg.years)}.`, m);
        }
        if (i > 0 && m.year <= seg.marks[i - 1].year) {
          fail(`rail "${rail.key}" segment ${yearsLabel(seg.years)} is not in year order at ` +
            `"${m.id}".`, m);
        }
      });
      if (seg.marks[0].year !== seg.years[0]
          || seg.marks[seg.marks.length - 1].year !== seg.years[1]) {
        fail(`rail "${rail.key}" has a segment labelled ${yearsLabel(seg.years)} whose marks run ` +
          `${seg.marks[0].year}–${seg.marks[seg.marks.length - 1].year}.`, seg);
      }
      /* Rule 3, re-checked on re-entry. A benchmark rail whose segments lost
       * their `drawAs` would reach the ribbon branch, and the renderer's own
       * throw is downstream of a lot of drawing. */
      if (rail.cadence === CADENCE.BENCHMARK && seg.drawAs !== 'marks') {
        fail(`rail "${rail.key}" declares "benchmark years only" and a segment no longer says it ` +
          `is drawn as marks.`, seg);
      }
    }
    const spans = rail.marks.filter((m) => m.kind === 'span').length;
    if (spans !== rail.spanOnly) {
      fail(`rail "${rail.key}" says ${rail.spanOnly} span-only mark(s) and holds ${spans}.`, rail.key);
    }
    const highest = tallestPointMark(rail.marks);
    if (highest !== rail.highest) {
      fail(`rail "${rail.key}" names a highest reading that is not the tallest mark entitled to a ` +
        `central value.`, rail.key);
    }
    railMarks.push(...rail.marks);
  }

  /* The axis note's two lists. `tallerSpans` is printed by name and was never
   * validated at all: pushing { source_series: "INVENTED", year: 1999 } onto it
   * put a mark that does not exist into the note. Both are re-derived. */
  const tallest = tallestPointMark(railMarks);
  if (tallest !== plan.tallest) {
    fail('the axis note names a tallest reading that is not the tallest mark on the drawing ' +
      'entitled to a central value.', plan.tallest);
  }
  const tallerSpans = tallest
    ? railMarks.filter((m) => m.kind === 'span' && m.hi > tallest.central)
    : railMarks.filter((m) => m.kind === 'span');
  if (tallerSpans.length !== plan.tallerSpans.length
      || tallerSpans.some((m, i) => m !== plan.tallerSpans[i])) {
    fail(`the axis note lists ${plan.tallerSpans.length} span-only mark(s) reaching above the ` +
      `tallest reading and the rails hold ${tallerSpans.length}. Every name in that note is a ` +
      `mark the reader is told exists.`, plan.tallerSpans);
  }

  /* The wedges. Both marks are drawn, and `definite` is what decides whether an
   * instrument is run between them or two intervals are shown side by side. */
  const drawn = new Set(railMarks);
  for (const ov of plan.overlaps) {
    for (const side of [ov.high, ov.low]) {
      if (!drawn.has(side.mark)) {
        fail(`the ${ov.year} wedge measures from a mark that is not on any rail of this drawing.`,
          side.mark);
      }
      if (side.mark.year !== ov.year) {
        fail(`the ${ov.year} wedge measures from a mark for ${side.mark.year}.`, side.mark);
      }
    }
    const definite = ov.high.mark.kind === 'point' && ov.low.mark.kind === 'point';
    if (definite !== ov.definite) {
      fail(`the ${ov.year} wedge says definite=${ov.definite} for a pair that is ` +
        `${definite ? 'two readings' : 'not two readings'}. A wedge is a distance between two ` +
        `readings, and where one side has no middle value there is no distance to draw.`, ov.year);
    }
    if (!definite && ov.gapPct != null && ov.concordanceId == null) {
      fail(`the ${ov.year} wedge carries a gap figure computed from two centrals when one side ` +
        `has none.`, ov.year);
    }
  }

  const spanOnlyCount = railMarks.filter((m) => m.kind === 'span').length;
  if (spanOnlyCount !== plan.spanOnlyCount) {
    fail(`the title block prints ${plan.spanOnlyCount} span-only marks and the rails hold ` +
      `${spanOnlyCount}.`, plan.spanOnlyCount);
  }
  const years = new Set(railMarks.map((m) => m.year));
  if (years.size !== plan.yearCount) {
    fail(`the title block prints ${plan.yearCount} years and the rails cover ${years.size}.`,
      plan.yearCount);
  }
  if (plan.named.length !== plan.gapCount) {
    fail(`the title block prints ${plan.gapCount} named holes and the plan holds ` +
      `${plan.named.length}.`, plan.gapCount);
  }

  /* And the verdict rule, over every mark anywhere in the plan — the annotations
   * and the wedge marks included, which the old hand-written collector missed. */
  marks.assertVerdictsVisible(allMarks, plan.verdictStamps, ctx);
  return true;
}

/* ------------------------------------------------------------------ *
 * THE PLANNER HANDLE. Module-private, and that is the identity.
 *
 * `VALUE_PLANNER` is never exported. The seal used to be a public
 * `sealPlan(plan, { revalidate })` taking any revalidator, so a caller could
 * seal a plan of genuinely minted marks with an empty `revalidate() {}` and
 * hand it to a renderer: every other check passed, because nothing about the
 * marks was wrong. The seal now records WHICH planner minted the plan, and
 * `openValuePlan` opens only plans this handle sealed.
 *
 * The door is exported and the handle is not. Opening validates and mints
 * nothing; `seal` is the capability.
 * ------------------------------------------------------------------ */
const VALUE_PLANNER = marks.definePlanner({
  name: 'the value chart planner',
  revalidate: revalidateValueChart,
});

/** THE ONE DOOR a plan from outside comes through. Identity, then content. */
export function openValuePlan(plan, context) {
  return VALUE_PLANNER.open(plan, context);
}

/** True when `plan` is one this module's planner minted. Not "some plan". */
export function isValuePlan(plan) {
  return VALUE_PLANNER.owns(plan);
}


/**
 * @param {{adspend:object, claims?:object}|object} frozen
 * @param {{window?:[number,number], annotate?:string[]}} options
 */
export function planValueChart(frozen, options = {}) {
  const adspend = frozen && frozen.series ? frozen : (frozen && frozen.adspend) || guards.getFrozen('adspend');
  const claimsFile = (frozen && frozen.claims) || guards.getFrozen('claims');
  const ctx = 'the value chart';

  /* Every verdict that is not `confirmed` lands here and is printed under the
   * drawing. claim-marks refuses to build a mark for such a claim without it. */
  const register = marks.verdictRegister(ctx);

  /* G4. All eight, and the four that publish no total are named on the chart
   * rather than dropped in silence. */
  const selected = guards.selectSeries(adspend, 'all', ctx);
  const keys = Object.keys(selected);
  guards.assertSeriesListComplete(keys, adspend, ctx);

  const documented = guards.coverageGaps(adspend);
  const rails = [];
  const noTotal = [];

  for (const key of keys) {
    const series = selected[key];
    /* THE WHOLE-MARKET TOTAL IS `medium: "total"` WITH NO money_type.
     *
     * adspend.json also files the money-type splits under `medium: "total"` —
     * coen_mce carries three rows for 1935: the total at $1,720m, national
     * brand at $890m and local retail at $830m. Reading `medium === "total"`
     * alone puts all three on the value axis, and then every year from 1935
     * looks like two compilers disagreeing about the same quantity. The
     * schema note is the rule: "money_type is set only where the compiler
     * published the split." A row carrying one is a part, not the whole. */
    const totals = (series.points || [])
      .filter((p) => p.medium === 'total' && (p.money_type === null || p.money_type === undefined))
      .sort((a, b) => a.year - b.year);
    if (totals.length === 0) {
      noTotal.push({ key, compiler: shortLabel(series.compiler), measures: series.measures });
      continue;
    }

    /* seriesYearGaps reads the holes in a series' WHOLE year set. This chart
     * draws only its `total` points, so the two have to be the same set or the
     * gap list describes a different rail from the one being drawn. The library
     * has no per-medium gap reader, so this is checked and refused rather than
     * assumed. It does not fire on the frozen record; it is the tripwire for
     * the day one of these series gains a by-medium year with no total. */
    const allYears = new Set((series.points || []).map((p) => p.year));
    const totalYears = new Set(totals.map((p) => p.year));
    if (totalYears.size !== totals.length) {
      throw new Error(
        `value-chart: "${key}" publishes more than one whole-market total for at least one year, ` +
        `so this chart would draw two values for one year on one rail and call it a series. ` +
        `Check adspend.json for a total row that has gained a money_type or a second vintage.`
      );
    }
    if (allYears.size !== totalYears.size) {
      throw new Error(
        `value-chart: "${key}" publishes ${allYears.size} years but only ${totalYears.size} totals, ` +
        `so guards.seriesYearGaps("${key}") describes a wider rail than the one being drawn ` +
        `and its holes cannot be trusted for this chart. guards.js has no per-medium gap reader; ` +
        `that is the gap to close before this rail is drawn.`
      );
    }

    const cadence = railCadence(key, adspend);
    const gaps = guards.seriesYearGaps(key, adspend);
    /* G3 + G5. buildPath breaks on a change of source_series and on a hole. */
    const { segments, breaks } = guards.buildPath(totals, { gaps, adspend });

    const built = segments.map((seg) => {
      const pts = seg.points;
      /* Belt beside the braces: prove at the draw site that this run is one
       * rail, and that it does not step over a hole. Both are already true of
       * anything buildPath returned; saying so here is what makes the rule
       * visible where the line is actually drawn. */
      guards.assertNoSplice(pts, `${ctx} segment ${key} ${pts[0].year}`, adspend);
      guards.assertNoInterpolation(pts, gaps, `${ctx} segment ${key} ${pts[0].year}`, adspend);
      return {
        years: [pts[0].year, pts[pts.length - 1].year],
        /* THE STRIP. From here down there are no record points in the plan and
         * no `calibration` object for a renderer to reach into — only marks,
         * and a span-only mark has no central on it at all. */
        marks: pts.map((p) => pointMark(p, register)),
        source_series: seg.source_series,
      };
    });

    if (cadence === CADENCE.BENCHMARK) {
      /* Rule 3. Nine estimates spread over fifty-two years are nine estimates.
       * Two of them happen to fall in consecutive years — 1917 and 1918 — and
       * a segmenter has no way to know that is not a series. The rail's own
       * known_breaks says "benchmark years only, never annual", so the rail is
       * forced to marks and the drawing joins nothing. */
      built.forEach((s) => { s.drawAs = 'marks'; });
    }

    const railMarks = built.flatMap((s) => s.marks);
    if (railMarks.length !== totals.length) {
      throw new Error(
        `value-chart: "${key}" holds ${totals.length} whole-market totals and the segments ` +
        `cover ${railMarks.length}. A rail that loses a year renders shorter than the record and ` +
        `nothing on screen says so.`
      );
    }

    rails.push({
      key,
      role: series.role,
      compiler: series.compiler,
      compilerShort: shortLabel(series.compiler),
      measures: series.measures,
      coverage: [series.coverage[0], series.coverage[1]],
      cadence,
      segments: built,
      gaps: [...gaps],
      breaks,
      marks: railMarks,
      spanOnly: railMarks.filter((m) => m.kind === 'span').length,
      /* The tallest mark ENTITLED TO A CENTRAL. A span-only mark has no reading
       * to be tallest with; `tallerSpans` below is where those are reported
       * instead of being silently ranked by a midpoint nobody measured. */
      highest: tallestPointMark(railMarks),
    });
  }

  /* --- the overlap. Where two stitch rails both cover a year, both are drawn
   * and the distance between them is the exhibit. Constructed rails are not
   * eligible: the bridge lands on MAGNA at 1980 by construction, and a wedge
   * of height zero between our own number and the number we calibrated it to
   * would read as agreement between two compilers. --- */
  const byYear = new Map();
  for (const rail of rails) {
    if (rail.cadence === CADENCE.CONSTRUCTED) continue;
    for (const mark of rail.marks) {
      if (!byYear.has(mark.year)) byYear.set(mark.year, []);
      byYear.get(mark.year).push({ rail, mark });
    }
  }
  const overlaps = [];
  for (const [year, list] of [...byYear.entries()].sort((a, b) => a[0] - b[0])) {
    if (list.length < 2) continue;
    /* A WEDGE IS A DISTANCE BETWEEN TWO READINGS, so both readings have to BE
     * readings. If either side is span-only there is no pair of values to
     * measure between, and the honest drawing is two intervals side by side
     * with the overlap named — never a caliper run between a floor and a
     * ceiling, which measures nothing and looks like a finding. */
    const definite = list.every((e) => e.mark.kind === 'point');
    const sorted = definite
      ? [...list].sort((a, b) => b.mark.central - a.mark.central)
      : [...list].sort((a, b) => b.mark.hi - a.mark.hi);
    const high = sorted[0];
    const low = sorted[sorted.length - 1];
    const note = guards.basisBreakNote(high.rail.key, low.rail.key, adspend);
    const magnitude = (note && note.magnitude) || null;
    overlaps.push({
      year,
      definite,
      high: { key: high.rail.key, label: high.rail.compilerShort, mark: high.mark, measures: high.rail.measures },
      low: { key: low.rail.key, label: low.rail.compilerShort, mark: low.mark, measures: low.rail.measures },
      /* The published figure first, and only then one computed from the two
       * centrals — and that second branch cannot run unless both sides have a
       * central, because `definite` gates it. */
      gapPct: magnitude && typeof magnitude.raw_level_break_pct_1980 === 'number'
        ? Math.abs(magnitude.raw_level_break_pct_1980)
        : (definite ? Math.abs((low.mark.central / high.mark.central - 1) * 100) : null),
      scopeSharePct: magnitude ? magnitude.scope_share_of_break_pct : null,
      basisPct: magnitude && typeof magnitude.like_for_like_wedge_pct_1980 === 'number'
        ? Math.abs(magnitude.like_for_like_wedge_pct_1980) : null,
      note: note ? note.note : null,
      concordanceId: note ? note.id : null,
      balloon: String.fromCharCode(65 + overlaps.length),
    });
  }

  /* --- absence --- */
  const named = namedAbsences(rails, documented);
  const rendered = [
    ...documented.map((g) => ({ years: [g.years[0], g.years[1]], label: g.reason, form: 'stipple', kind: 'documented', id: g.id })),
    ...named.map((a) => ({ years: a.years, label: a.label, form: 'stipple', kind: 'named', reason: a.reason, betweenYears: a.betweenYears })),
  ];
  /* Both halves of G5. The first call checks the record's four documented
   * holes; the second checks the nine named absences derived above. Neither
   * subsumes the other: a chart can cover the four and leave the nine as
   * whitespace, or name the nine and quietly interpolate the by-medium hole. */
  guards.assertAbsenceDrawn(undefined, rendered, `${ctx} documented holes`, adspend);
  guards.assertAbsenceDrawn(named, rendered, `${ctx} named absences`, adspend);

  /* --- claim annotations, supplied by the caller --- */
  const annotations = [];
  for (const id of options.annotate || []) {
    const list = Array.isArray(claimsFile) ? claimsFile : (claimsFile && claimsFile.claims) || [];
    const claim = list.find((c) => c.id === id);
    if (!claim) throw new RangeError(`value-chart: claims.json holds no claim "${id}".`);
    /* G8. Time is two fields, and as_of is provenance. timelineYear refuses the
     * seven claims that withhold permission to be drawn and never falls back to
     * the source's publication date. */
    guards.assertTimeField(guards.FACT_FIELD, `${ctx} annotation "${id}"`);
    const year = guards.timelineYear(claim, `${ctx} annotation "${id}"`);
    /* G1, and the verdict rule, in the same call. A claim the record marks
     * rejected is drawable — its body is the correction — but only with its
     * verdict on the mark and in the register printed below the drawing. */
    const mark = marks.planClaimMark(claim, {
      year,
      label: id,
      register,
      /* `method` used to ride along here. It is a record row, and a mark is the
       * one place on a plan the record strip does not look. The annotation
       * object below carries what this drawing prints. */
      extra: { statement: claim.statement },
    });
    annotations.push({
      id, mark, year,
      statement: claim.statement,
      divergence: guards.timeFieldDivergence(claim),
      balloon: String.fromCharCode(65 + overlaps.length + annotations.length),
    });
  }

  const allMarks = [
    ...rails.flatMap((r) => r.segments.flatMap((s) => s.marks)),
    ...annotations.map((a) => a.mark),
  ];
  const drawnYears = new Set(rails.flatMap((r) => r.marks.map((m) => m.year)));
  const railMarks = rails.flatMap((r) => r.marks);
  const lows = railMarks.map((m) => m.lo);
  const highs = railMarks.map((m) => m.hi);
  const tallest = tallestPointMark(railMarks);
  /* Span-only marks whose interval reaches above the tallest reading. On this
   * record that is the three pre-1919 benchmark totals, whose ceilings sit
   * nowhere near the modern rails — but the list is computed rather than
   * assumed, so the axis note cannot claim a tallest reading that some
   * unreadable interval quietly overtops. */
  const tallerSpans = tallest
    ? railMarks.filter((m) => m.kind === 'span' && m.hi > tallest.central)
    : railMarks.filter((m) => m.kind === 'span');

  const stamps = marks.verdictStamps(register);
  marks.assertVerdictsVisible(allMarks, stamps, ctx);

  const plan = {
    window: options.window || [1840, 2026],
    valueDomain: [
      Math.pow(10, Math.floor(Math.log10(Math.min(...lows)))),
      Math.pow(10, Math.ceil(Math.log10(Math.max(...highs)))),
    ],
    unit: adspend.unit,
    rails,
    noTotal,
    overlaps,
    documented,
    named,
    rendered,
    annotations,
    verdictStamps: stamps,
    tallest,
    tallerSpans,
    yearCount: drawnYears.size,
    gapCount: named.length,
    seriesCount: keys.length,
    spanOnlyCount: railMarks.filter((m) => m.kind === 'span').length,
    alt: ALT_SENTENCE,
    axisNote: AXIS_NOTE,
  };
  /* Sealed: deep-frozen, then re-walked and re-validated on every arrival
   * through options.plan. See claim-marks.js. */
  return VALUE_PLANNER.seal(plan, ctx);
}

/* ------------------------------------------------------------------ *
 * 4. Reader-facing prose
 *
 * Every string below clears the four readability gates as a block:
 * FK 2.95, Reading Ease 87.2, Gunning Fog 4.26, SMOG 5.91.
 * ------------------------------------------------------------------ */

export const ALT_SENTENCE =
  'This chart shows total US ad spending in dollars of the day. It is not one line. ' +
  'Coen counted 1919 to 2007. MAGNA counted 1980, 2018 and 2021 to 2025. ' +
  'Both counted 1980, and they are 23.4 percent apart. ' +
  'Before 1919 there are only nine benchmark years, so nothing joins them. ' +
  'Two stretches have no yearly total at all, and they are drawn as marked holes.';

export const AXIS_NOTE =
  'This axis is dollars of the day, not share of GDP. Against GDP the high year is 1922, at about 3.0 percent.';

/**
 * THE SPAN-ONLY NOTE READS THE CUT OUT OF THE LIBRARY.
 *
 * This string used to spell "60 percent" into the page, and so did the tooltip
 * on every span-only mark. guards.configureRules() can move that cut on the
 * record with a written reason; when it moves, a typed 60 becomes false while
 * still looking exactly as authoritative. small-multiples.js already read the
 * live value at its own tooltip. Now everything does, through one function.
 */
export function wideIntervalNote() {
  return marks.wideCutSentence();
}

/** The wedge sentence. `gap` and `scope` come from the record, never from here. */
function wedgeProse(overlap) {
  const scope = overlap.scopeSharePct != null ? Math.round(overlap.scopeSharePct) : null;
  if (!overlap.definite) {
    /* No pair of readings, so no distance. Say what there is instead. */
    return `Two rulers, one year. ${overlap.high.label} and ${overlap.low.label} both counted ` +
      `${overlap.year}, and at least one of them has an interval too wide to carry a middle ` +
      `value. So there is no distance to measure between them. Both intervals are drawn.`;
  }
  const gap = overlap.gapPct.toFixed(1);
  return `Two rulers, one year. ${overlap.high.label} reads ` +
    `${comma(overlap.high.mark.central)} million dollars. ` +
    `${overlap.low.label} reads ${comma(overlap.low.mark.central)} million dollars. ` +
    `The gap is ${gap} percent.` +
    (scope != null ? ` About ${scope} percent of it is which media each one counted. The rest is a price basis.` : '') +
    ' The market did not move. The rulers differ.';
}

/**
 * The sentence for one named hole. Every year in it is read off the plan, so
 * the prose cannot drift from the drawing the way a typed caption can.
 */
function absenceProse(absence) {
  const years = absence.span === 1
    ? `for ${absence.years[0]}`
    : `from ${absence.years[0]} to ${absence.years[1]}`;
  return `No yearly total ${years}. The last count before it is ${absence.betweenYears[0]}. ` +
    `The next one is ${absence.betweenYears[1]}. That is ${absence.span} ` +
    `year${absence.span === 1 ? '' : 's'} with nothing in them.`;
}

/**
 * How many estimates the record actually holds inside a documented hole.
 *
 * COUNT THE MARKS, NEVER THE GAPS. Seven holes do not mean eight estimates:
 * the benchmark years 1917 and 1918 are consecutive, so the record holds nine
 * estimates across seven holes. Deriving the count from the gap list is the
 * kind of arithmetic that looks right on the page and is off by one.
 */
function estimatesInside(plan, hole) {
  return plan.rails.reduce((n, rail) => n + rail.marks.filter(
    (m) => m.year >= hole.years[0] && m.year <= hole.years[1]).length, 0);
}

/** One sentence for the whole pre-1919 stretch, with its counts read off the plan. */
function preProse(plan, preHole) {
  const inside = plan.named.filter((a) => a.hole === preHole.id);
  const missing = inside.reduce((n, a) => n + a.span, 0);
  const span = preHole.years[1] - preHole.years[0] + 1;
  return `Before 1919 there is no yearly series at all. The record holds ` +
    `${estimatesInside(plan, preHole)} benchmark years in this stretch of ${span}. ` +
    `The other ${missing} years have nothing, so nothing joins the marks.`;
}

/** One sentence naming what verification changed, for the claims on the drawing. */
function verdictProse(plan) {
  if (plan.verdictStamps.length === 0) return null;
  const ids = plan.verdictStamps.map((s) => `${s.id} (${s.verdict})`).join(', ');
  return `Verification changed ${plan.verdictStamps.length} of the claims drawn here: ${ids}. ` +
    `Each one is drawn with that word on the mark, because a fix a reader cannot see is not a fix.`;
}

/**
 * EVERY READER-FACING SENTENCE THIS CHART EMITS, in one call.
 *
 * The caption renders exactly this list, and team B8's text-only path can read
 * it without a DOM. It is also what makes the readability gate runnable
 * against the chart: the four tests measure prose, and prose generated inside
 * a render function is prose nobody can measure.
 *
 * Measured on the frozen record with tools/readability.py: FK 2.44, Reading
 * Ease 91.9, Gunning Fog 3.87, SMOG 5.2 — inside the four gates of FK <= 10,
 * Ease >= 50, Fog <= 12, SMOG <= 12.
 */
export function valueChartSentences(plan) {
  const preHole = plan.documented.find((g) => /benchmark years only/i.test(String(g.reason)));
  return [
    ...plan.overlaps.map(wedgeProse),
    ...plan.named.filter((a) => !preHole || a.hole !== preHole.id).map(absenceProse),
    preHole ? preProse(plan, preHole) : null,
    plan.axisNote,
    wideIntervalNote(),
    verdictProse(plan),
    plan.alt,
  ].filter(Boolean);
}

/* ------------------------------------------------------------------ *
 * 5. Geometry and styles
 * ------------------------------------------------------------------ */

/**
 * THE NOTES LIVE IN THE MARGIN, NOT ON THE DRAWING.
 *
 * On a log axis a 23% distance is fifteen pixels tall, and the 1980 wedge has
 * four things to say. Stacked inside it they overprint each other; scattered
 * across the plot they land on the ribbons. So the drawing carries balloons —
 * a circled letter at the feature — and the note goes in a box below, the way
 * an engineering drawing carries a detail note. Nothing in the plot area is
 * text except the rail names and the absence labels.
 */
const GEO = Object.freeze({
  W: 1260, H: 930,
  X0: 100, X1: 1212,
  Y0: 92, Y1: 494,
  axisLabel: 514,
  laneY: 530, laneH: 12,
  bracketRow: [76, 58],   // two heights, so two brackets side by side do not collide
  title: 26,
  notes: {
    detail: { x: 100, y: 578, w: 420 },
    noTotal: { x: 534, y: 578, w: 326 },
    block: { x: 874, y: 578, w: 338 },
    axis: { x: 100, y: 758, w: 760 },
  },
});

const STYLE_ID = 'p2-value-chart-style';

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.p2-valuechart { margin: 0; }
.p2-valuechart__board {
  border: 1px solid ${IRON}; background: ${SURFACE.paper};
  overflow-x: auto; overscroll-behavior-x: contain;
}
.p2-valuechart__board > svg { display: block; width: 100%; height: auto; min-width: ${GRID.scrollMin}px; }
.p2-valuechart__cap {
  font-family: var(--p2-font-chrome, monospace); font-size: 11.5px; line-height: 1.55;
  color: ${ZINC_TEXT}; padding: 10px 0 0; max-width: 82ch;
}
.p2-valuechart__cap b { color: ${INK.primary}; font-weight: 600; }
.p2-valuechart__prose {
  font-family: var(--p2-font-prose, serif); font-size: 16px; line-height: 1.6;
  color: ${INK.secondary}; margin: 10px 0 0; max-width: 62ch;
}
.p2-valuechart__notes { margin: 8px 0 0; padding: 0; list-style: none; }
.p2-valuechart__notes li { margin: 0 0 2px; }
.p2-valuechart__notes code { font-family: var(--p2-font-chrome, monospace); color: ${IRON}; }`;
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------ *
 * 6. Render
 * ------------------------------------------------------------------ */

/**
 * Draw the value chart into `container`.
 *
 * @param {Element} container
 * @param {{adspend:object, claims?:object}|object} frozen
 * @param {{window?:[number,number], annotate?:string[], plan?:object}} options
 *
 * `options.plan` takes a plan THIS MODULE built, and nothing else. It is
 * re-opened through `openValuePlan`, which refuses an object THIS PLANNER did
 * not mint, asserts the whole live graph is still deep-frozen,
 * re-checks every mark it can reach anywhere in it against the guards, and then
 * re-runs `revalidateValueChart` — before a pixel is drawn.
 */
export function renderValueChart(container, frozen, options = {}) {
  if (!container || typeof container.appendChild !== 'function') {
    throw new TypeError('value-chart: renderValueChart(container, frozen) needs a container element.');
  }
  installStyles();
  const plan = options.plan
    ? openValuePlan(options.plan, 'the value chart')
    : planValueChart(frozen, options);
  const id = uid('vc');

  const figure = document.createElement('figure');
  figure.className = 'p2-valuechart';
  const board = document.createElement('div');
  board.className = 'p2-valuechart__board';

  const svg = el('svg', {
    viewBox: `0 0 ${GEO.W} ${GEO.H}`, width: GEO.W, height: GEO.H,
    role: 'img', 'aria-label': `${plan.alt} ${plan.axisNote}`,
  });
  const tex = textures(svg, id);

  const x = linear(plan.window, [GEO.X0, GEO.X1]);
  const y = log10Scale(plan.valueDomain, [GEO.Y1, GEO.Y0]);
  const xc = (year) => x(year) + (x(year + 1) - x(year)) / 2;

  /** The reading a tooltip prints, with the unit and the grade attached. */
  const readingOf = (mark, label) =>
    `${label} ${mark.year} · ${mark.unit} · ${marks.markReading(mark, comma)} · grade ${mark.grade}.`;

  /* A circled letter on the drawing, and the note that carries it in the
   * margin below. Engineering-drawing grammar, and the only thing that keeps
   * a fifteen-pixel wedge from having to hold four sentences. */
  function balloon(into, bx, by, letter, leadX, leadY) {
    const g = layer(into, { 'data-balloon': letter });
    if (leadX !== bx || leadY !== by) {
      g.appendChild(el('line', { x1: leadX, y1: leadY, x2: bx, y2: by, stroke: IRON, 'stroke-width': 1 }));
    }
    g.appendChild(el('circle', { cx: bx, cy: by, r: 8.5, fill: BONE, stroke: IRON, 'stroke-width': 1.2 }));
    text(g, { x: bx, y: by + 4, value: letter, role: 'label', anchor: 'middle', fill: GRAPHITE, size: '10px' });
    return g;
  }

  const gGrid = layer(svg);
  const gVoid = layer(svg);
  const gRails = layer(svg);
  const gWedge = layer(svg);
  const gNote = layer(svg);
  const gBlock = layer(svg);

  /* --- grid, axes --- */
  decadeTicks(plan.valueDomain).forEach((v) => {
    gGrid.appendChild(el('line', {
      x1: GEO.X0, x2: GEO.X1, y1: y(v), y2: y(v),
      stroke: ZINC_RULE, 'stroke-width': 0.6, 'stroke-opacity': 0.55,
    }));
    text(gGrid, {
      x: GEO.X0 - 9, y: y(v) + 4,
      value: v >= 1e6 ? `$${comma(v / 1e6)}tn` : v >= 1000 ? `$${comma(v / 1000)}bn` : `$${comma(v)}m`,
      role: 'chrome', anchor: 'end', size: '11px',
    });
  });
  gGrid.appendChild(el('line', {
    x1: GEO.X0, x2: GEO.X1, y1: GEO.Y1, y2: GEO.Y1, stroke: IRON, 'stroke-width': 1.2,
  }));
  for (let year = 1840; year <= 2020; year += 20) {
    gGrid.appendChild(el('line', {
      x1: x(year), x2: x(year), y1: GEO.Y1, y2: GEO.Y1 + 6, stroke: ZINC_RULE, 'stroke-width': 1,
    }));
    text(gGrid, { x: x(year), y: GEO.axisLabel, value: String(year), role: 'chrome', anchor: 'middle', size: '11px' });
  }
  text(gGrid, {
    x: GEO.X0, y: GEO.title, role: 'label', size: '11px',
    value: `US total advertising · ${plan.unit} · Y axis logarithmic`,
  });

  /* --- documented holes, drawn as objects. Rule 5. --- */
  plan.documented.forEach((hole) => {
    const a = Math.max(x(hole.years[0]), GEO.X0);
    const b = Math.min(x(hole.years[1] + 1), GEO.X1);
    if (b <= a) return;
    const inLane = /by-medium/i.test(String(hole.reason));
    const top = inLane ? GEO.laneY : GEO.Y0;
    const height = inLane ? GEO.laneH : GEO.Y1 - GEO.Y0;
    const block = el('rect', { x: a, y: top, width: b - a, height, fill: tex.stipple, 'fill-opacity': inLane ? 1 : 0.85 });
    titled(block, `${yearsLabel(hole.years)} — ${hole.reason}`);
    gVoid.appendChild(block);
    gVoid.appendChild(el('rect', {
      x: a, y: top, width: b - a, height, fill: 'none', stroke: STIPPLE, 'stroke-width': 1.2,
    }));
    if (inLane) {
      text(gVoid, {
        x: GEO.X1, y: GEO.laneY + GEO.laneH + 12, role: 'chrome', size: '10.5px', anchor: 'end',
        value: `${yearsLabel(hole.years)} · no free by-medium series · the total goes on, the split does not`,
      });
    }
  });

  /* --- the rails --- */
  const railGroups = [];
  plan.rails.forEach((rail) => {
    const g = layer(gRails, { 'data-series': rail.key, 'data-cadence': rail.cadence });
    railGroups.push(g);
    const constructed = rail.cadence === CADENCE.CONSTRUCTED;
    const ink = constructed ? IRON : BRASS;
    const inkText = constructed ? IRON : BRASS_TEXT;
    const outlineOnly = !constructed && rail.segments.every((s) => s.marks.length < 8);

    rail.segments.forEach((seg) => {
      const segMarks = seg.marks;
      const asMarks = seg.drawAs === 'marks' || segMarks.length === 1;
      /* Rule 3, at the draw site. The plan forces a benchmark rail to marks;
       * this is what makes that a refusal rather than a default, so an edit
       * upstream cannot quietly turn nine estimates into a line. */
      if (!asMarks && rail.cadence === CADENCE.BENCHMARK) {
        throw new Error(
          `value-chart: "${rail.key}" declares "benchmark years only" in its own known_breaks ` +
          `and a connecting ribbon was about to be drawn across ${yearsLabel(seg.years)}. ` +
          `Benchmark years are drawn as loose marks with nothing joining them.`
        );
      }

      if (!asMarks) {
        /* the ribbon: thickness IS the 80% interval, with a 2px floor so a
         * band six pixels thick still reads as a drawn object.
         *
         * THE FLOOR IS BUILT ON THE MIDPOINT OF THE DRAWN BAND, NOT ON A
         * CENTRAL VALUE. It used to read `p.calibration.central`, which is a
         * number a span-only mark is not allowed to have; on a band under two
         * pixels the two are indistinguishable anyway, and this way the branch
         * cannot reach for a value the record refuses to give it. */
        let up = '', dn = '';
        segMarks.forEach((m, i) => {
          let yHi = y(m.hi), yLo = y(m.lo);
          if (yLo - yHi < 2) { const c = (yHi + yLo) / 2; yHi = c - 1; yLo = c + 1; }
          up += `${i ? 'L' : 'M'}${xc(m.year)} ${yHi} `;
          dn = ` L${xc(m.year)} ${yLo}${dn}`;
        });
        const ribbon = el('path', {
          d: `${up}${dn}Z`,
          fill: constructed ? tex.hatchIron : (outlineOnly ? 'none' : ink),
          'fill-opacity': constructed ? 1 : (outlineOnly ? 0 : 0.55),
          stroke: inkText,
          'stroke-width': outlineOnly ? 1.6 : 0.9,
          'stroke-dasharray': constructed ? '5 3' : null,
        });
        /* At the draw site: every one of these is a mark the plan minted, which
         * is now the load-bearing question. The interval was read and checked
         * by the library when the mark was built, and re-checked if this plan
         * arrived through options.plan. */
        segMarks.forEach((m) => marks.assertMark(m, `${rail.key} ribbon`));
        titled(ribbon, `${rail.compilerShort}, ${yearsLabel(seg.years)}. ` +
          `Ribbon thickness is the 80% interval. ${rail.measures}`);
        g.appendChild(ribbon);

        /* the central line, broken wherever the library allowed no central.
         * Rule 4 is not a label on the legend; it is why this line has holes in
         * it — and the holes are now structural: a span-only mark has no
         * `central` to read, so it cannot join a run even by accident. */
        let run = [];
        const flush = () => {
          if (run.length > 1) {
            g.appendChild(el('path', {
              d: run.map((m, i) => `${i ? 'L' : 'M'}${xc(m.year)} ${y(m.central)}`).join(' '),
              fill: 'none', stroke: inkText,
              'stroke-width': constructed ? 1.5 : 1.2,
              'stroke-dasharray': constructed ? '9 5' : null,
            }));
          } else if (run.length === 1) {
            g.appendChild(el('line', {
              x1: xc(run[0].year) - 2.5, x2: xc(run[0].year) + 2.5,
              y1: y(run[0].central), y2: y(run[0].central),
              stroke: inkText, 'stroke-width': 1.2,
            }));
          }
          run = [];
        };
        segMarks.forEach((m) => {
          if (m.kind === 'point') run.push(m);
          else flush();
        });
        flush();

        /* hard stop: the ragged cut edge where a compiler simply ends */
        const last = segMarks[segMarks.length - 1];
        if (last.year === rail.coverage[1]) {
          const top = y(last.hi), bot = y(last.lo);
          let d = `M${xc(last.year)} ${top - 8}`;
          for (let i = 0; i < 7; i += 1) d += ` l${i % 2 ? -6 : 6} ${(bot - top + 16) / 7}`;
          g.appendChild(el('path', { d, fill: 'none', stroke: inkText, 'stroke-width': 1.8 }));
        }
      }

      /* marks: every point that is not inside a drawn ribbon, and every point
       * on a benchmark rail. The plan decided whether a central mark exists,
       * and where it decided no, there is no number here to draw one with. */
      segMarks.forEach((m) => {
        const cx = xc(m.year);
        if (asMarks) {
          const node = layer(g, { 'data-year': m.year, 'data-mark': m.kind });
          node.appendChild(el('line', { x1: cx, x2: cx, y1: y(m.hi), y2: y(m.lo), stroke: ink, 'stroke-width': 1.7 }));
          node.appendChild(el('line', { x1: cx - 5, x2: cx + 5, y1: y(m.hi), y2: y(m.hi), stroke: ink, 'stroke-width': 1.7 }));
          node.appendChild(el('line', { x1: cx - 5, x2: cx + 5, y1: y(m.lo), y2: y(m.lo), stroke: ink, 'stroke-width': 1.7 }));
          if (m.kind === 'point') {
            node.appendChild(el('rect', {
              x: cx - 2.6, y: y(m.central) - 2.6, width: 5.2, height: 5.2,
              fill: ink, class: 'p2-central-mark',
            }));
          }
          titled(node, readingOf(m, rail.compilerShort));
        } else if (rail.segments.length > 1 || segMarks.length < 8) {
          /* A short published run still gets its observations marked, so the
           * reader can count them rather than reading a smooth line.
           *
           * THIS IS THE SITE THAT LIED. It read the kind into a variable, never
           * used it, and drew a filled square at the central value of whatever
           * it was handed — the one central draw site in the file that did not
           * ask the guard. It does not ask now either. It reads `m.central`,
           * which on a span-only mark does not exist, so the branch that would
           * have drawn the false square is a branch this mark cannot enter. A
           * span-only observation is still counted, as its two end caps. */
          if (m.kind === 'point') {
            const node = el('rect', {
              x: cx - 2.4, y: y(m.central) - 2.4, width: 4.8, height: 4.8, fill: ink,
            });
            titled(node, readingOf(m, rail.compilerShort));
            g.appendChild(node);
          } else {
            const node = layer(g, { 'data-year': m.year, 'data-mark': 'span' });
            [m.lo, m.hi].forEach((v) => node.appendChild(el('line', {
              x1: cx - 4, x2: cx + 4, y1: y(v), y2: y(v), stroke: ink, 'stroke-width': 1.7,
            })));
            titled(node, readingOf(m, rail.compilerShort));
          }
        }
      });
    });

    /* THE RAIL'S OWN NAME, ON THE RAIL. No legend lookup, and no automatic
     * label placer either — the four rails cross each other in ways a generic
     * placer gets wrong, so each cadence gets a stated rule and the result is
     * checked by looking at it. This is layout, not data — which is why it
     * hangs off `marks.anchorY(mark, y)`, a PIXEL halfway down the drawn bar,
     * and not off any number in the record's units. */
    const first = rail.segments[0].marks[0];
    const lastSeg = rail.segments[rail.segments.length - 1];
    const last = lastSeg.marks[lastSeg.marks.length - 1];
    const midSeg = rail.segments[Math.floor(rail.segments.length / 2)];
    const mid = midSeg.marks[Math.floor(midSeg.marks.length / 2)];
    /* a single long run puts its name a quarter of the way along, so it does
     * not land on whatever else runs through the middle of the plot */
    const quarter = midSeg.marks[Math.floor(midSeg.marks.length / 4)];
    let at = rail.segments.length === 1 && midSeg.marks.length > 20 ? quarter : mid;
    let dy = -14, anchor = 'start';
    if (rail.cadence === CADENCE.BENCHMARK) { at = first; dy = -20; anchor = 'start'; }
    else if (constructed) { at = mid; dy = 50; anchor = 'end'; }
    else if (rail.segments.length > 1) { at = last; dy = -16; anchor = 'end'; }
    const lx = xc(at.year) + (anchor === 'end' ? (constructed ? 20 : -6) : 6);
    const ly = marks.anchorY(at, y);
    const label = text(gNote, {
      x: lx, y: ly + dy,
      value: constructed ? `${rail.compilerShort} · grade C` : rail.compilerShort,
      role: 'label', fill: inkText, size: '10px', anchor,
    });
    titled(label, `${rail.compiler} — ${rail.measures}`);
    if (constructed) {
      text(gNote, {
        x: lx, y: ly + dy + 13, value: 'our construction, not a published count',
        role: 'chrome', fill: inkText, size: '10px', anchor,
      });
    }
  });

  /* --- the named absences, each a drawn object.
   *
   * The seven inside the pre-1919 benchmark stretch get the texture and a
   * <title>, and share one printed sentence below. Seven labels reading "no
   * annual total" across fifty-two years is a list, and the finding is that
   * the whole stretch has no series — which one sentence says and seven
   * repetitions bury. The two modern ones each get a bracket, a year range and
   * a printed label of their own, because those two are load-bearing. --- */
  const preHole = plan.documented.find((g) => /benchmark years only/i.test(String(g.reason)));
  let bracketSlot = 0;
  plan.named.forEach((absence) => {
    const a = x(absence.years[0]);
    const b = x(absence.years[1] + 1);
    const inPre = preHole && absence.hole === preHole.id;
    const block = el('rect', {
      x: a, y: GEO.Y0, width: Math.max(b - a, 1.5), height: GEO.Y1 - GEO.Y0,
      fill: tex.stipple, 'fill-opacity': 1,
    });
    titled(block, `${absence.label} — between ${absence.betweenYears[0]} and ${absence.betweenYears[1]}. ${absence.reason}`);
    gVoid.appendChild(block);
    if (inPre) return;

    const mid = (a + b) / 2;
    if (b - a > 40) {
      const t = text(gVoid, {
        x: mid, y: GEO.Y0 + 150, value: 'no annual total',
        role: 'label', anchor: 'middle', fill: IRON, size: '10px',
      });
      t.setAttribute('transform', `rotate(-90 ${mid} ${GEO.Y0 + 150})`);
    }
    text(gVoid, {
      x: mid, y: GEO.Y1 - (bracketSlot % 2 ? 8 : 22), value: yearsLabel(absence.years),
      role: 'chrome', anchor: 'middle', size: '10.5px', fill: IRON,
    });
    /* the bracket between the two years that DO exist, which is the reader's
     * question: how far is it from the last count to the next one? */
    const row = GEO.bracketRow[bracketSlot % GEO.bracketRow.length];
    bracketSlot += 1;
    const ba = xc(absence.betweenYears[0]);
    const bb = xc(absence.betweenYears[1]);
    gVoid.appendChild(el('path', {
      d: `M${ba} ${GEO.Y0 - 4} L${ba} ${row} L${bb} ${row} L${bb} ${GEO.Y0 - 4}`,
      fill: 'none', stroke: IRON, 'stroke-width': 1.2,
    }));
    const caption = `${absence.betweenYears[0]} → ${absence.betweenYears[1]} · ${absence.span} yr no total`;
    text(gVoid, {
      x: Math.min(Math.max((ba + bb) / 2, GEO.X0 + caption.length * 3.2), GEO.X1 - caption.length * 3.2),
      y: row - 5, value: caption, role: 'chrome', anchor: 'middle', size: '10.5px', fill: IRON,
    });
  });

  /* pre-1919: one printed sentence for the stretch */
  if (preHole) {
    const pre = plan.named.filter((a) => a.hole === preHole.id);
    const missing = pre.reduce((n, a) => n + a.span, 0);
    const mid = (x(preHole.years[0]) + x(preHole.years[1] + 1)) / 2;
    text(gNote, {
      x: mid, y: GEO.Y0 + 34, value: 'benchmark years only',
      role: 'label', anchor: 'middle', fill: BRASS_TEXT, size: '10.5px',
    });
    text(gNote, {
      x: mid, y: GEO.Y0 + 48, role: 'chrome', anchor: 'middle', size: '10.5px', fill: BRASS_TEXT,
      value: `${estimatesInside(plan, preHole)} estimates · ${missing} of these ` +
        `${preHole.years[1] - preHole.years[0] + 1} years have none · nothing joins them`,
    });
  }

  /* --- the wedge: two rulers, one year. The caliper is on the drawing; the
   * note is in the margin, reached by a balloon.
   *
   * A wedge is only drawn between two READINGS. Where one of the two rails has
   * no central value the plan says so, and the drawing shows the two intervals
   * and names the overlap rather than running an instrument between a floor and
   * a ceiling — which is a distance nobody measured. --- */
  plan.overlaps.forEach((ov) => {
    const cx = xc(ov.year) + 10;
    const wedge = layer(gWedge, { 'data-overlap': ov.year, 'data-definite': String(ov.definite) });

    if (ov.definite) {
      const yTop = y(ov.high.mark.central);
      const yBot = y(ov.low.mark.central);
      const split = ov.scopeSharePct != null ? yTop + (yBot - yTop) * (ov.scopeSharePct / 100) : null;
      if (split != null) {
        wedge.appendChild(el('rect', {
          x: cx - 7, y: yTop, width: 14, height: split - yTop,
          fill: tex.hatchIron, stroke: IRON, 'stroke-width': 1,
        }));
        wedge.appendChild(el('rect', {
          x: cx - 3.5, y: split, width: 7, height: yBot - split,
          fill: IRON, stroke: IRON, 'stroke-width': 1,
        }));
      } else {
        wedge.appendChild(el('rect', {
          x: cx - 7, y: yTop, width: 14, height: yBot - yTop,
          fill: tex.hatchIron, stroke: IRON, 'stroke-width': 1,
        }));
      }
      [yTop, yBot].forEach((yy) => {
        wedge.appendChild(el('line', { x1: cx - 13, x2: cx + 13, y1: yy, y2: yy, stroke: IRON, 'stroke-width': 1.8 }));
        wedge.appendChild(el('line', {
          x1: GEO.X0, x2: cx - 13, y1: yy, y2: yy,
          stroke: IRON, 'stroke-width': 0.8, 'stroke-dasharray': '3 3',
        }));
      });
      titled(wedge, wedgeProse(ov));
      balloon(gWedge, cx + 26, (yTop + yBot) / 2, ov.balloon, cx + 14, (yTop + yBot) / 2);
    } else {
      [ov.high.mark, ov.low.mark].forEach((m, i) => {
        const mx = cx - 7 + i * 14;
        wedge.appendChild(el('line', { x1: mx, x2: mx, y1: y(m.hi), y2: y(m.lo), stroke: IRON, 'stroke-width': 1.7 }));
        [m.hi, m.lo].forEach((v) => wedge.appendChild(el('line', {
          x1: mx - 4, x2: mx + 4, y1: y(v), y2: y(v), stroke: IRON, 'stroke-width': 1.7,
        })));
      });
      titled(wedge, wedgeProse(ov));
      const mids = [ov.high.mark, ov.low.mark].map((m) => (y(m.lo) + y(m.hi)) / 2);
      balloon(gWedge, cx + 26, (mids[0] + mids[1]) / 2, ov.balloon, cx + 14, (mids[0] + mids[1]) / 2);
    }
  });

  /* --- claim annotations. The line is on the drawing; the claim is in the
   * margin. This axis is dollars and the claim is a share of GDP, so printing
   * it among the ribbons would invite the reader to read it off the money
   * axis — which is the misreading the whole annotation exists to stop. --- */
  plan.annotations.forEach((ann) => {
    const cx = xc(ann.year);
    const line = layer(gNote, { 'data-claim': ann.id, 'data-verdict': ann.mark.verdict || 'none' });
    line.appendChild(el('line', {
      x1: cx, x2: cx, y1: GEO.Y0, y2: GEO.Y1,
      stroke: ZINC_RULE, 'stroke-width': 1, 'stroke-dasharray': '5 4',
    }));
    /* THE VERDICT IS ON THE MARK, not only in a callout. markTitle builds the
     * sentence, so a claim the record marks rejected says so in its own
     * accessible name, wherever the reader meets it. */
    titled(line, `${marks.markTitle(ann.mark, { label: ann.id, format: String })} — ${ann.statement}`);
    balloon(gNote, cx, GEO.Y1 - 16, ann.balloon, cx, GEO.Y1 - 16);
  });

  /* --- the margin notes. The frame grows to fit them: a note box that runs
   * past a hard-coded viewBox is a sentence the reader never sees. --- */
  let contentBottom = 0;
  function noteBox(box, title, lines) {
    const h = box.h || (lines.length * 15 + 40);
    contentBottom = Math.max(contentBottom, box.y + h);
    gBlock.appendChild(el('rect', {
      x: box.x, y: box.y, width: box.w, height: h, fill: BONE, stroke: IRON, 'stroke-width': 1,
    }));
    text(gBlock, { x: box.x + 12, y: box.y + 22, value: title, role: 'label', size: '10px', fill: INK.primary });
    gBlock.appendChild(el('line', {
      x1: box.x, x2: box.x + box.w, y1: box.y + 30, y2: box.y + 30,
      stroke: IRON, 'stroke-width': 0.5, 'stroke-opacity': 0.5,
    }));
    lines.forEach((ln, i) => {
      text(gBlock, {
        x: box.x + 12, y: box.y + 48 + i * 15, value: ln[1],
        role: ln[0] || 'chrome', size: '10.5px', fill: ln[2] || ZINC_TEXT,
      });
    });
    return h;
  }

  /* DETAIL — the overlap. One box per overlap year; the record has one. */
  let rowH = 0;
  plan.overlaps.slice(0, 1).forEach((ov) => {
    const money = (v) => `${comma(v)} ${plan.unit.replace(/ \(current\)/, '')}`;
    rowH = Math.max(rowH, noteBox(GEO.notes.detail,
      ov.definite
        ? `detail ${ov.balloon} · ${ov.year} · two rulers, ${ov.gapPct.toFixed(1)}% apart`
        : `detail ${ov.balloon} · ${ov.year} · two rulers, no distance between them`,
      [
        ['chrome', `${ov.high.label} — ${marks.markReading(ov.high.mark, money)}`, INK.primary],
        ['chrome', shortLabel(ov.high.measures, 58), ZINC_TEXT],
        ['chrome', `${ov.low.label} — ${marks.markReading(ov.low.mark, money)}`, INK.primary],
        ['chrome', shortLabel(ov.low.measures, 58), ZINC_TEXT],
        ['chrome', ov.scopeSharePct != null
          ? `${Math.round(ov.scopeSharePct)}% of the break is a different set of media counted`
          : 'the record carries no decomposition of this break', IRON],
        ['chrome', ov.basisPct != null ? `${ov.basisPct.toFixed(1)} points is a different price basis` : '', IRON],
        ['chrome', ov.definite
          ? 'the market did not move. the rulers differ.'
          : 'one of these two has no middle value, so the gap is not a number.', INK.primary],
      ].filter((l) => l[1])));
  });

  /* WHAT THIS DRAWING DOES NOT CARRY */
  rowH = Math.max(rowH, noteBox(GEO.notes.noTotal, `${plan.noTotal.length} of the ${plan.seriesCount} series publish no total`,
    plan.noTotal.flatMap((s) => [
      ['chrome', s.key, INK.primary],
      ['chrome', `  ${shortLabel(s.measures, 40)}`, ZINC_TEXT],
    ]).concat([['chrome', 'every one is on the rail board above.', IRON],
               ['chrome', 'none of them was dropped.', IRON]])));

  /* THE AXIS NOTE, and every claim balloon */
  {
    const money = (v) => `${comma(v)} ${plan.unit.replace(/ \(current\)/, '')}`;
    const lines = [
      ['chrome', 'against gdp the high year is 1922, at about 3.0 percent — not 2000.', INK.primary],
    ];
    if (plan.tallest) {
      lines.push(['chrome', `tallest reading on this drawing: ${plan.tallest.source_series} ` +
        `${plan.tallest.year}, ${money(plan.tallest.central)}. that is a level, not a share.`, ZINC_TEXT]);
    } else {
      lines.push(['chrome', 'no rail on this drawing carries a reading with a middle value.', ZINC_TEXT]);
    }
    if (plan.tallerSpans.length) {
      lines.push(['chrome', `${plan.tallerSpans.length} span-only mark(s) reach above it and have no ` +
        'reading of their own: ' + plan.tallerSpans.map((m) => `${m.source_series} ${m.year}`).join(', '), IRON]);
    }
    plan.annotations.forEach((ann) => {
      lines.push(['chrome', `balloon ${ann.balloon} · ${ann.year} · ${ann.mark.unit}`, INK.primary]);
      lines.push(['chrome', `${marks.markReading(ann.mark, String)} · ${ann.id} · grade ${ann.mark.grade}`, ZINC_TEXT]);
      const verdict = marks.verdictSentence(ann.mark);
      if (verdict) lines.push(['chrome', `${ann.id} · ${verdict}`, IRON]);
    });
    noteBox(Object.assign({}, GEO.notes.axis, { y: GEO.notes.detail.y + rowH + 14 }),
      'this axis is dollars of the day, not share of gdp', lines);
  }

  /* --- title block, as an engineering drawing carries one --- */
  (function titleBlock() {
    const { x: bx, y: by, w: bw } = GEO.notes.block;
    const rows = [
      ['drawing', `US total advertising ${plan.window[0]}–${plan.window[1]}`],
      ['units', plan.unit],
      ['scale', 'Y logarithmic · X linear'],
      ['rails', `${plan.rails.length} of ${plan.seriesCount} series · ${plan.yearCount} years`],
      ['holes', `${plan.gapCount} named · ${plan.documented.length} documented`],
      ['tolerance', 'ribbon = the 80% interval, 2px floor'],
      ['marks', `${plan.spanOnlyCount} span-only, no central value`],
      ['note', 'nothing spliced. nothing interpolated.'],
    ];
    const bh = rows.length * 22 + 10;
    contentBottom = Math.max(contentBottom, by + bh);
    gBlock.appendChild(el('rect', { x: bx, y: by, width: bw, height: bh, fill: BONE, stroke: IRON, 'stroke-width': 1.2 }));
    rows.forEach((r, i) => {
      const yy = by + 22 + i * 22;
      gBlock.appendChild(el('line', {
        x1: bx, x2: bx + bw, y1: yy - 16, y2: yy - 16, stroke: IRON, 'stroke-width': 0.5, 'stroke-opacity': 0.5,
      }));
      text(gBlock, { x: bx + 9, y: yy, value: r[0], role: 'label', size: '10px' });
      text(gBlock, { x: bx + 92, y: yy, value: r[1], role: 'chrome', size: '10.5px', fill: INK.primary });
    });
    gBlock.appendChild(el('line', {
      x1: bx + 86, x2: bx + 86, y1: by, y2: by + bh, stroke: IRON, 'stroke-width': 0.5, 'stroke-opacity': 0.5,
    }));
  })();

  const H = Math.max(GEO.H, contentBottom + 22);
  svg.setAttribute('viewBox', `0 0 ${GEO.W} ${H}`);
  svg.setAttribute('height', String(H));

  board.appendChild(svg);
  figure.appendChild(board);

  /* --- caption. assertAbsenceDrawn checks the array this module hands it, not
   * the DOM, so every documented hole and every named absence is printed here
   * where a reader can see it. So is every verdict: assertVerdictsVisible ran
   * over this list in the plan, and this is where the list becomes visible. --- */
  const cap = document.createElement('figcaption');
  cap.className = 'p2-valuechart__cap';
  cap.innerHTML = `<b>${plan.rails.length} rails · ${plan.yearCount} years · ${plan.gapCount} holes.</b> ` +
    `Brass is money. Iron hatch is our construction, not a published count. Stipple is documented absence.`;
  const notes = document.createElement('ul');
  notes.className = 'p2-valuechart__notes';
  plan.named.forEach((a) => {
    const li = document.createElement('li');
    li.innerHTML = `<code>${yearsLabel(a.years)}</code> — no annual total; the last count before it is ` +
      `${a.betweenYears[0]} and the next is ${a.betweenYears[1]}. ${a.reason}`;
    notes.appendChild(li);
  });
  plan.documented.forEach((g) => {
    const li = document.createElement('li');
    li.innerHTML = `<code>${yearsLabel(g.years)}</code> — ${g.reason}`;
    notes.appendChild(li);
  });
  plan.verdictStamps.forEach((s) => {
    const li = document.createElement('li');
    li.innerHTML = `<code>${s.id}</code> — ${s.sentence}. ${s.statement || ''}`;
    notes.appendChild(li);
  });
  cap.appendChild(notes);

  /* one sentence per modern hole; the pre-1919 stretch is a single sentence,
   * because seven separate paragraphs about the same 52 years is a list, not
   * a finding */
  valueChartSentences(plan).forEach((line) => {
    const p = document.createElement('p');
    p.className = 'p2-valuechart__prose';
    p.textContent = line;
    cap.appendChild(p);
  });
  figure.appendChild(cap);
  container.appendChild(figure);

  /* --- SETTLE: every value arrives at its measured position. The reduced half
   * crossfades and leaves the origin ghost, so the same rails end up in the
   * same places and the ghost says where the arrival started. --- */
  const motion = railGroups.map((g, i) => settle(
    g,
    [{ opacity: 0, transform: 'translateY(9px)' }, { opacity: 1, transform: 'none' }],
    { delay: i * 90, fromTransform: 'translateY(9px)' }
  ));

  return { plan, svg, figure, motion };
}

export default renderValueChart;
