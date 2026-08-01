/**
 * docs/p2/charts/gdp-strip.js — THE SHARE-OF-GDP STRIP.
 *
 * The spine of the capture question, and the chart most likely to mislead.
 *
 * ==========================================================================
 * THE FINDING THIS CHART CARRIES
 * ==========================================================================
 * Advertising's share of US GDP peaked at about 3.0% in 1922 on the Coen rail,
 * NOT in 2000. 2000 ranks fourteenth of the rail's eighty-nine years. Two
 * claims asserting a 2000 peak — `ds-total-001` and `ds-gdp-001` — were
 * REJECTED in verification, and the popular version of this story is the
 * rejected one.
 *
 * The strip does not argue with the reader about that. It hands them the
 * handle. The window rocker starts on the post-1960 window, where 2000 IS the
 * maximum and the popular story is true; one crank widens the window to the
 * whole record and 1922 walks in above it. A reader who arrived believing the
 * popular version watches their own hand produce the correction.
 *
 * ==========================================================================
 * WHY THERE IS NO LINE ON THIS CHART
 * ==========================================================================
 * There is no annual share-of-GDP series in the frozen record, and this module
 * will not manufacture one. `claims.json` holds eleven dated readings, each
 * with its own 80% interval, its own source grade and its own basis stated in
 * its own `unit` string. Eleven readings across a hundred and eleven years are
 * marks, not a line. Joining them would invent a century of GDP the record does
 * not contain, which is exactly the interpolation G5 exists to refuse.
 *
 * ==========================================================================
 * BASES ARE NEVER MERGED
 * ==========================================================================
 * Every basis is drawn as its own coverage band along the top of the strip, at
 * the years `adspend.json` says it covers, labelled with the record's own
 * `measures` sentence. Where two bases are live in the same year the bands
 * overlap and the overlap is marked — 1980 to 2007 has two rulers running, and
 * the choice between them moves the answer by seventeen per cent of the level.
 * Nothing is joined, nothing is averaged, and no reading is assigned to a basis
 * by this file: `claims.json` carries no basis field, so each reading prints
 * the basis the record states in its own words and nothing is inferred.
 *
 * ==========================================================================
 * THREE THINGS THIS FILE GOT WRONG, AND WHAT REPLACED THEM
 * ==========================================================================
 * 1. NO INTERVAL GUARD ANYWHERE IN THE RENDERING HALF. `planStrip` asked G1 for
 *    every reading's mark kind and then handed the renderer the whole claim, so
 *    every printed figure came off `claim.central` whatever the guard had said.
 *    On today's record every reading is inside the cut and nothing was actually
 *    false — which is the worst kind of correct, because it means the rule was
 *    switched off and nothing on screen would have said so. Readings are now
 *    built through ./claim-marks.js, which does not put a central on a mark the
 *    library refuses one to. `markReading()` is the only way a figure reaches
 *    the page, and it cannot print a number that is not there.
 *
 * 2. THE 1922 CALIPER MEASURED A GAP THAT DOES NOT EXIST. It ran from one
 *    reading's interval FLOOR to the other reading's interval CEILING — 2.7 to
 *    3.2 — and presented the result as the distance between two readings. Both
 *    readings put 1922 at 3.0%. The real distance is zero. The caliper is this
 *    project's own instrument for "the gap is an object"; using it to
 *    manufacture a gap is the worst available misuse of it. It now runs central
 *    to central, and prints zero when the answer is zero.
 *
 * 3. THE 1867–1918 HOLE WAS NEVER DRAWN. The rule was "a hole belongs to a
 *    drawing when the drawing has nothing to put in it", tested per HOLE — so
 *    the single 1914 reading erased a fifty-two-year documented absence from a
 *    chart whose whole subject is what the record does and does not contain.
 *    The test now runs per YEAR: a documented hole is drawn over exactly the
 *    years inside it that carry no mark, and it stops at the edge of any year
 *    that does. That keeps the rule the module was built on — never a stipple
 *    on top of a mark, which is why the 2025 reading is not buried — and stops
 *    one mark in fifty-two years from standing in for fifty-one it does not
 *    cover.
 */

import * as guards from '../lib/guards.js';
import * as marks from './claim-marks.js';
import { BRASS, BRASS_TEXT, IRON, ZINC_TEXT, INK, GRID } from '../lib/tokens.js';
import { crank } from '../lib/motion.js';
import {
  el, h, svgRoot, text, frame, rule, absenceBlock, spanMark, pointMark, caliper,
  linear, ceilTo, gradeFill, pct,
} from './svg-kit.js';

const U = GRID.unit;

/**
 * The strip has four stacked regions and they never overlap, because every one
 * of them carries text a reader has to be able to finish:
 *   1  the basis bands — which ruler is live in which years
 *   2  the seam gutter — the year each basis opens and closes
 *   3  the plot        — the readings and their intervals
 *   4  the annotation band — the two callouts, below the axis, on leaders
 */
const GEO = Object.freeze({
  width: 56 * U,          // 1232
  plot: 14 * U,           // 308
  padLeft: 3 * U,         // 66  — the y labels
  padRight: 2 * U,
  bandsTop: 18,
  bandHeight: 13,
  bandGap: 5,
  seamGutter: 3 * U,      // 66  — rotated seam labels sit here and nowhere else
  axisBand: 1.6 * U,      // 35  — year and grade under each reading
  annotation: 9 * U,      // 198 — the callouts, which carry the record's own sentences
});

/**
 * WHICH CLAIMS ARE SHARE-OF-GDP READINGS.
 *
 * Selected on a property of the record — the claim's own `unit` string — and
 * never on a written list of claim ids. A list goes stale the moment a claim is
 * added or a repair moves one, and nothing on screen would say so.
 *
 * `\bGDP\b` and not `GDP`: `e7-targeting-003` measures a fall in revenue per
 * click attributed to GDPR, and a substring test would put a privacy-regulation
 * finding on a share-of-the-economy axis.
 */
const GDP_UNIT = /\bGDP\b/;
const IS_SHARE = /percent|%/i;

export function gdpReadings(claimsFile) {
  const list = Array.isArray(claimsFile) ? claimsFile : claimsFile.claims;
  return list.filter((c) => typeof c.unit === 'string'
    && GDP_UNIT.test(c.unit)
    && IS_SHARE.test(c.unit));
}

/**
 * The claims the record marks rejected that speak to this question.
 *
 * WHAT COMES BACK IS A PROJECTION, NEVER THE CLAIM ROW. The rejected claims are
 * printed as sentences — id, verdict, statement — and a claim row also carries
 * `central` and `ci80`, which are exactly the two fields no renderer may reach
 * without going through a guard. Putting the row on the plan meant
 * `plan.rejected[0].central` was one dot away from a caption, and "no renderer
 * currently reads it" is a latent hazard rather than a guarantee.
 */
export function rejectedOnThisQuestion(claimsFile) {
  const list = Array.isArray(claimsFile) ? claimsFile : claimsFile.claims;
  return list
    .filter((c) => c.verdict === 'rejected' && GDP_UNIT.test(String(c.statement || '')))
    .map((c) => ({ id: c.id, verdict: c.verdict, statement: c.statement || null }));
}

/** The total rails: the series that publish a `total` line. Read, not typed. */
function totalRails(adspend, selected) {
  return Object.entries(selected)
    .filter(([, s]) => (s.points || []).some((p) => p.medium === 'total'))
    .map(([key, s]) => ({
      key,
      coverage: [s.coverage[0], s.coverage[1]],
      measures: s.measures,
      compiler: s.compiler,
      role: s.role,
      years: (s.points || []).filter((p) => p.medium === 'total').map((p) => p.year),
    }))
    .sort((a, b) => a.coverage[0] - b.coverage[0]);
}

/* ------------------------------------------------------------------ *
 * The plan
 * ------------------------------------------------------------------ */

/**
 * THIS STRIP'S OWN INVARIANTS, RE-RUN ON EVERY RE-ENTRY.
 *
 * claim-marks re-checks every mark it can reach against the live guards. This
 * re-derives what only this module knows: that each reading's mark is the mark
 * for that reading's year and claim, that `byYear` is a faithful index of the
 * readings rather than a second list that can drift from the first, and that
 * the counts printed in the readout are the counts on the plan.
 */
export function revalidateStrip(plan, { marks: allMarks, context }) {
  const ctx = context || 'the share-of-GDP strip';
  const fail = (message, offending) => { throw new marks.MarkError(`${ctx}: ${message}`, offending); };

  for (const r of plan.readings) {
    if (r.mark.year !== r.year) {
      fail(`reading "${r.id}" is plotted at ${r.year} and carries a mark for ${r.mark.year}. The ` +
        `strip plots about_year and never as_of; a mark whose year is not its reading's year is ` +
        `how a fact ends up drawn at its own publication date.`, r.id);
    }
    if (r.mark.id !== r.id) {
      fail(`reading "${r.id}" carries a mark minted for "${r.mark.id}".`, r.id);
    }
  }
  const index = new Map();
  for (const r of plan.readings) {
    if (!index.has(r.year)) index.set(r.year, []);
    index.get(r.year).push(r);
  }
  if (index.size !== plan.byYear.size) {
    fail(`the year index holds ${plan.byYear.size} year(s) and the readings cover ${index.size}.`,
      plan.byYear.size);
  }
  for (const [year, group] of index) {
    const held = plan.byYear.get(year) || [];
    if (held.length !== group.length || group.some((r, i) => r !== held[i])) {
      fail(`the year index for ${year} is not the readings this plan holds for ${year}. Every ` +
        `reading is drawn out of that index, so a stranger in it is drawn and a missing entry is ` +
        `a reading the strip silently stops showing.`, year);
    }
  }
  const spanOnly = plan.readings.filter((r) => r.mark.kind !== 'point').length;
  if (spanOnly !== plan.spanOnlyCount) {
    fail(`the readout prints ${plan.spanOnlyCount} span-only reading(s) and the plan holds ` +
      `${spanOnly}.`, plan.spanOnlyCount);
  }
  const top = Math.max(...plan.readings.map((r) => r.mark.hi));
  if (!(plan.scaleTop >= top)) {
    fail(`the y scale tops out at ${plan.scaleTop}% and a reading's interval reaches ${top}%, so ` +
      `that interval draws outside its own frame.`, plan.scaleTop);
  }
  for (const c of plan.rejected) {
    if (c.verdict !== 'rejected') {
      fail(`the rejected register carries "${c.id}", whose verdict is "${c.verdict}".`, c.id);
    }
  }
  marks.assertVerdictsVisible(allMarks, plan.verdictStamps, ctx);
  return true;
}

export function planStrip(frozen, options = {}) {
  const { claims, adspend } = frozen;
  const ctx = 'the share-of-GDP strip';

  /* G8, at the top of the axis constructor, where the library says to put it.
   * One line, and it is the whole guard: `as_of` is provenance, and this
   * record's worst divergence is eighty-six years — a 1922 fact from a source
   * dated 2008, which is `ds-gdp-001`, one of the readings on this very strip. */
  guards.assertTimeField(guards.FACT_FIELD, `${ctx} time axis`);

  /* Every verdict that is not `confirmed` lands here and is printed under the
   * strip. claim-marks refuses to build a mark for such a claim without it —
   * which is what makes ds-gdp-001 drawable AND visible, and is now the same
   * rule the value chart runs on. */
  const register = marks.verdictRegister(ctx);

  /* Nothing is dropped, so no reason is owed. The strip reads every rail's
   * coverage to place its basis bands. */
  const selected = guards.selectSeries(adspend, 'all', ctx);
  guards.assertSeriesListComplete(Object.keys(selected), adspend, ctx);

  const { withheld } = guards.timelineClaims(claims);
  const withheldIds = new Set(withheld.map((c) => c.id));

  const all = gdpReadings(claims);
  const drawable = [];
  const refused = [];
  for (const c of all) {
    if (withheldIds.has(c.id)) { refused.push(c); continue; }
    /* timelineYear refuses `timeline_ready: false` and refuses a missing
     * about_year rather than falling back to provenance. */
    const year = guards.timelineYear(c, ctx);
    /* G1 and the verdict rule, in one call. What comes back has a central only
     * if the library allows one, so nothing downstream can print a figure the
     * record does not support. */
    const mark = marks.planClaimMark(c, {
      year,
      label: c.id,
      register,
      extra: { statement: c.statement, as_of: c.as_of },
    });
    drawable.push({
      id: c.id, mark, year,
      statement: c.statement,
      as_of: c.as_of,
      divergence: guards.timeFieldDivergence(c),
    });
  }
  drawable.sort((a, b) => a.year - b.year || (a.id < b.id ? -1 : 1));

  /* Readings that share a year are competing readings of the same fact. They
   * are drawn side by side with the distance between them measured. */
  const byYear = new Map();
  for (const r of drawable) {
    if (!byYear.has(r.year)) byYear.set(r.year, []);
    byYear.get(r.year).push(r);
  }

  const rails = totalRails(adspend, selected);

  /* THE SEAMS. A basis change is the year a rail's coverage starts or stops.
   * Every one of them is read out of `adspend.json`, so a rail whose coverage
   * moves moves the seam with no edit here. */
  const seams = [];
  for (const r of rails) {
    seams.push({ at: r.coverage[0], rail: r.key, kind: 'opens', measures: r.measures });
    seams.push({ at: r.coverage[1] + 1, rail: r.key, kind: 'closes', measures: r.measures });
  }
  seams.sort((a, b) => a.at - b.at);

  /* Years where more than one total rail is live. The choice of rail is live
   * there, and it is the choice that moves the answer. */
  const overlap = [];
  const lo = Math.min(...rails.map((r) => r.coverage[0]));
  const hi = Math.max(...rails.map((r) => r.coverage[1]));
  for (let y = lo; y <= hi; y += 1) {
    const live = rails.filter((r) => y >= r.coverage[0] && y <= r.coverage[1]);
    if (live.length > 1) overlap.push({ year: y, rails: live.map((r) => r.key) });
  }

  /* THE TWO WINDOWS.
   * The narrow one starts where the record's own post-1960 rail starts —
   * `irs_soi.coverage[0]` — which is also where Silk & Berndt's two series
   * begin, and it is the window the popular version of this story is read from.
   * The wide one is the whole record. */
  const narrowFrom = adspend.series.irs_soi.coverage[0];
  const holes = guards.coverageGaps(adspend);
  const domainWide = [
    Math.min(...holes.map((g) => g.years[0]), ...drawable.map((r) => r.year)),
    Math.max(...drawable.map((r) => r.year)) + 1,
  ];
  const domainNarrow = [narrowFrom, domainWide[1]];

  /**
   * THE HIGHEST READING IN A WINDOW — and what that phrase can and cannot mean.
   *
   * A maximum is a comparison between VALUES, and a span-only reading has no
   * value to compare. So the maximum is taken over the readings entitled to a
   * central, and every span-only reading whose interval REACHES ABOVE that
   * maximum is returned beside it, by name. Ranking a span by the midpoint of
   * its own interval would be exactly the dot-in-the-middle mistake G1 exists
   * to prevent, arriving in the arithmetic instead of in the drawing.
   *
   * On the frozen record all eleven readings are inside the cut and
   * `couldExceed` is empty. It is computed rather than assumed, so a repair
   * that widens one interval changes the sentence instead of quietly making
   * it false.
   */
  const windowMax = (from) => {
    const inside = drawable.filter((r) => r.year >= from);
    const points = inside.filter((r) => r.mark.kind === 'point');
    const max = points.length ? Math.max(...points.map((r) => r.mark.central)) : null;
    const at = max == null ? [] : points.filter((r) => r.mark.central === max);
    const spanOnly = inside.filter((r) => r.mark.kind !== 'point');
    const couldExceed = spanOnly.filter((r) => max == null || r.mark.hi > max);
    return { readings: inside, points, max, at, spanOnly, couldExceed };
  };

  const scaleTop = ceilTo(Math.max(...drawable.map((r) => r.mark.hi)), 0.5);
  const stamps = marks.verdictStamps(register);
  marks.assertVerdictsVisible(drawable.map((r) => r.mark), stamps, ctx);

  /* THE RECORD DOES NOT TRAVEL ON THE PLAN.
   *
   * This used to carry `selected` — the whole of `adspend.json`'s series
   * objects, every point and every `calibration` block on them — so
   * `plan.selected.coen_mce.points[0].calibration.central` was reachable from
   * any renderer that wanted a number without asking a guard for one. Nothing
   * read it. That is not a guarantee; it is a hazard waiting for the next team,
   * and this project has already been bitten once by calling advice a
   * guarantee. The selection is used HERE, at plan time, to place the basis
   * bands, and what the strip actually needs downstream is the rail digests in
   * `rails` — coverage, role, measures, and the years each one publishes.
   *
   * The withheld readings are projected the same way, for the same reason. */
  const plan = {
    selectedKeys: Object.keys(selected),
    rails, seams, overlap,
    readings: drawable,
    refused: refused.map((c) => ({ id: c.id, statement: c.statement || null })),
    byYear,
    rejected: rejectedOnThisQuestion(claims),
    verdictStamps: stamps,
    narrowFrom, domainWide, domainNarrow, scaleTop,
    windowMax,
    holes,
    spanOnlyCount: drawable.filter((r) => r.mark.kind !== 'point').length,
    wideCut: marks.wideCut(),
  };
  return marks.sealPlan(plan, { revalidate: revalidateStrip, context: ctx });
}

/* ------------------------------------------------------------------ *
 * Drawing
 * ------------------------------------------------------------------ */

/** The one formatter every figure on this strip is printed through. */
const share = (v) => pct(v, 2);

/**
 * Which total rails the record has live in a given year. This is how the strip
 * answers "is this reading on the same ruler as that one" without inferring a
 * basis for a claim — `claims.json` carries no basis field, and inventing one
 * here would be a second source of truth for the thing the chapter turns on.
 */
function railsAt(plan, year) {
  return plan.rails
    .filter((r) => year >= r.coverage[0] && year <= r.coverage[1])
    .map((r) => r.key);
}

/** True when the highest reading on screen shares no rail with some other one. */
function readingsSpanDisjointRails(plan, readings, top) {
  const mine = new Set(railsAt(plan, top.year));
  return readings.some((r) => {
    if (r === top) return false;
    const theirs = railsAt(plan, r.year);
    return theirs.length > 0 && mine.size > 0 && !theirs.some((k) => mine.has(k));
  });
}

function stripAlt(plan, windowKey) {
  const domain = windowKey === 'narrow' ? plan.domainNarrow : plan.domainWide;
  const w = plan.windowMax(domain[0]);
  const peak = w.at[0];
  const mixed = peak ? readingsSpanDisjointRails(plan, w.readings, peak) : false;
  const head =
    `Advertising as a share of US GDP, ${domain[0]} to ${domain[1]}, drawn as ` +
    `${w.readings.length} separate readings and never as a line, because the record holds no ` +
    `annual series. Each reading shows its 80% interval.`;
  const highest = peak
    ? ` The highest reading in this window is ${pct(peak.mark.central)} in ${peak.year} (claim ` +
      `${peak.id}, source grade ${peak.mark.grade}, basis "${peak.mark.unit}")` +
      (mixed
        ? `, and it shares no total rail with some of the other readings on screen (its year is ` +
          `covered by ${railsAt(plan, peak.year).join(', ') || 'no total rail at all'}), so it is the ` +
          'highest reading and not one series’ maximum'
        : '') + '.'
    : ' No reading in this window carries a middle value, so this window has no highest reading.';
  const spans = w.spanOnly.length
    ? ` ${w.spanOnly.length} reading(s) here have an interval too wide to carry a middle value and ` +
      `are drawn as the interval alone` +
      (w.couldExceed.length
        ? `, and ${w.couldExceed.length} of those reach above the highest reading, so the highest ` +
          `reading is the highest one that can be read and not necessarily the largest share.`
        : '.')
    : '';
  const window = ` ${windowKey === 'narrow'
    ? 'This is the window the popular version of the story is read from: it starts in ' +
      `${plan.narrowFrom}, so it cannot see the 1920s at all.`
    : 'On the whole record the 1922 reading stands above every later one, and the 2000 reading ' +
      'is the maximum of the post-1960 window only.'}`;
  return head + highest + spans + window;
}

/** Wrap a sentence to lines of roughly `cols` characters. */
function wrap(str, cols) {
  const words = String(str).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (line && (line.length + 1 + w.length) > cols) { lines.push(line); line = w; }
    else line = line ? `${line} ${w}` : w;
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock(parent, { x, y, lines, lead = 12.5, role = 'chrome', fill = ZINC_TEXT, size = '10.5px' }) {
  lines.forEach((line, i) => {
    text(parent, { x, y: y + i * lead, value: line, role, fill, size });
  });
  return y + lines.length * lead;
}

/**
 * The basis bands. One per total rail, at the years the record says it covers,
 * labelled with the rail's own name and window. The `measures` sentence is on
 * the band as a title, so the basis is always the record's words and never a
 * paraphrase written here.
 */
function drawBases(svg, plan, { xScale, top }) {
  const g = el('g', { class: 'p2-bases' }, svg);
  text(g, {
    x: GEO.padLeft, y: top - 6, value: 'The bases, and where each one is live',
    role: 'label', fill: INK.secondary,
  });
  plan.rails.forEach((rail, i) => {
    const y = top + i * (GEO.bandHeight + GEO.bandGap);
    const x = xScale(Math.max(rail.coverage[0], xScale.domain[0]));
    const x2 = xScale(Math.min(rail.coverage[1] + 1, xScale.domain[1]));
    if (x2 <= x + 1) return;
    const cell = el('g', {}, g);
    el('rect', {
      x, y, width: x2 - x, height: GEO.bandHeight,
      fill: gradeFill(svg, rail.role === 'derived-bridge' ? 'C' : 'B', IRON), 'fill-opacity': 0.3,
    }, cell);
    el('rect', {
      x, y, width: x2 - x, height: GEO.bandHeight,
      fill: 'none', stroke: IRON, 'stroke-width': 1,
    }, cell);
    el('title', {}, cell).textContent = `${rail.key} — ${rail.measures}`;

    const label = `${rail.key} · ${rail.coverage[0]}–${rail.coverage[1]}`;
    const est = label.length * 5.6;
    const right = xScale.range[1];
    if (x2 + 8 + est < right) {
      text(cell, { x: x2 + 8, y: y + GEO.bandHeight - 3, value: label, role: 'chrome', fill: ZINC_TEXT, size: '10.5px' });
    } else if (x - 8 - est > xScale.range[0]) {
      text(cell, { x: x - 8, y: y + GEO.bandHeight - 3, value: label, role: 'chrome', fill: ZINC_TEXT, size: '10.5px', anchor: 'end' });
    } else {
      text(cell, { x: x + 5, y: y + GEO.bandHeight - 3, value: label, role: 'chrome', fill: ZINC_TEXT, size: '10.5px' });
    }
  });

  /* Where two rails are live at once the bands overlap on the drawing. This
   * names what that means, because it is the choice the chapter turns on. */
  if (plan.overlap.length) {
    const from = plan.overlap[0].year;
    const to = plan.overlap[plan.overlap.length - 1].year;
    const x = xScale(Math.max(from, xScale.domain[0]));
    const x2 = xScale(Math.min(to + 1, xScale.domain[1]));
    if (x2 > x + 1) {
      const y = top + plan.rails.length * (GEO.bandHeight + GEO.bandGap) + 5;
      rule(g, { x1: x, y1: y, x2: x2, y2: y, color: IRON, width: 1.5 });
      rule(g, { x1: x, y1: y - 4, x2: x, y2: y + 4, color: IRON, width: 1.5 });
      rule(g, { x1: x2, y1: y - 4, x2: x2, y2: y + 4, color: IRON, width: 1.5 });
      const msg = `${from}–${to}: more than one ruler live, never merged`;
      const est = msg.length * 5.6;
      if (x2 + 8 + est < xScale.range[1]) {
        text(g, { x: x2 + 8, y: y + 4, value: msg, role: 'chrome', fill: IRON, size: '10.5px' });
      } else {
        text(g, { x: x - 8, y: y + 4, value: msg, role: 'chrome', fill: IRON, size: '10.5px', anchor: 'end' });
      }
    }
  }
  return g;
}

/**
 * EVERY BASIS CHANGE IS A LABELLED VERTICAL SEAM.
 *
 * The years come from the rails' own coverage windows, so a repair that moves a
 * rail moves its seam with no edit here. Seams that fall in the same year are
 * one line carrying both events, because two lines one pixel apart is one line
 * that a reader cannot resolve into two facts.
 */
function drawSeams(svg, plan, { xScale, gutterTop, plotTop, plotBottom }) {
  const g = el('g', { class: 'p2-seams' }, svg);
  const byYear = new Map();
  for (const s of plan.seams) {
    if (s.at < xScale.domain[0] || s.at > xScale.domain[1]) continue;
    if (!byYear.has(s.at)) byYear.set(s.at, []);
    byYear.get(s.at).push(s);
  }
  for (const [year, group] of [...byYear].sort((a, b) => a[0] - b[0])) {
    const x = xScale(year);
    const line = rule(g, { x1: x, y1: gutterTop, x2: x, y2: plotBottom, color: IRON, width: 1, dashed: true });
    el('title', {}, line).textContent = group
      .map((s) => `${s.at} — the ${s.rail} basis ${s.kind}. ${s.measures}`).join('  |  ');
    const label = `${year} · ${group.map((s) => `${s.rail} ${s.kind}`).join(', ')}`;
    const t = text(g, {
      x: 0, y: 0, value: label, role: 'chrome', fill: IRON, size: '10px',
    });
    t.setAttribute('transform', `translate(${x + 4} ${plotTop - 6}) rotate(-90)`);
    t.setAttribute('text-anchor', 'start');
  }
  return g;
}

/**
 * ONE READING.
 *
 * Everything printed here comes out of the mark, and the mark carries a central
 * only where the library allows one — so the point branch cannot be reached by
 * a span-only reading and the span branch has no figure to print. The year is
 * NOT printed here: two readings of one year used to print two year labels
 * twenty pixels apart, which overprint. `drawYearLabel` prints it once.
 */
function drawReading(svg, plan, r, { xScale, yScale, offset, box, slot = 0, group = 1 }) {
  const mark = r.mark;
  const x = xScale(r.year) + offset;
  const g = el('g', {
    class: 'p2-reading', 'data-claim': r.id, 'data-grade': mark.grade,
    'data-mark': mark.kind, 'data-verdict': mark.verdict || 'none',
  }, svg);

  const yLo = yScale(mark.lo);
  const yHi = yScale(mark.hi);
  /* THE VERDICT IS ON THE MARK. markTitle builds the sentence, so a rejected
   * claim says so in its own accessible name wherever the reader meets it —
   * not only in a callout somewhere else on the page. */
  const title = `${marks.markTitle(mark, { label: r.id, format: share })}` +
    ` · basis as the record states it: "${mark.unit}"` +
    (r.divergence ? ` · the governing source is dated ${r.as_of}, ${r.divergence} years from the ` +
      `year the fact is about; the strip plots about_year and never as_of` : '') +
    ` · ${r.statement}`;

  if (mark.kind === 'span') {
    spanMark(g, { x, yLow: yLo, yHigh: yHi, title });
    text(g, {
      x, y: box.y1 + 30, value: 'span only', role: 'chrome', fill: ZINC_TEXT,
      anchor: 'middle', size: '9.5px',
    });
    text(g, {
      x, y: yHi - 6 - slot * 13, value: `${share(mark.lo)}–${share(mark.hi)}`,
      role: 'chrome', fill: IRON, anchor: 'middle', size: '10px',
    });
  } else {
    el('line', { x1: x, y1: yLo, x2: x, y2: yHi, stroke: BRASS, 'stroke-width': 5, 'stroke-opacity': 0.3 }, g);
    el('line', { x1: x - 4, y1: yLo, x2: x + 4, y2: yLo, stroke: BRASS, 'stroke-width': 1.2 }, g);
    el('line', { x1: x - 4, y1: yHi, x2: x + 4, y2: yHi, stroke: BRASS, 'stroke-width': 1.2 }, g);
    pointMark(g, { x, y: yScale(mark.central), r: 3.4, title });
    text(g, {
      x, y: yHi - 6 - slot * 13, value: pct(mark.central), role: 'numeral', fill: BRASS_TEXT,
      anchor: 'middle', size: '12px',
    });
  }
  /* Under each reading: the grade, and — only where a year carries more than
   * one reading — the claim id, so the reader can tell two marks of the same
   * year apart without hovering. */
  text(g, { x, y: box.y1 + 24, value: mark.grade, role: 'chrome', fill: ZINC_TEXT, anchor: 'middle', size: '9.5px' });
  if (group > 1) {
    text(g, { x, y: box.y1 + 34, value: r.id, role: 'chrome', fill: ZINC_TEXT, anchor: 'middle', size: '8.5px' });
  }
  return g;
}

/**
 * THE YEAR, ONCE PER YEAR.
 *
 * 1922 carries two readings. They are offset twenty pixels apart so their
 * intervals can be told apart, and the year label used to be drawn per reading
 * at the same offsets — so the strip printed "1922" twice, twenty pixels apart,
 * in a face wide enough that the two overlap. One year is one fact and gets one
 * label, centred on the year, under the group.
 */
function drawYearLabel(svg, year, count, { xScale, box }) {
  return text(svg, {
    x: xScale(year), y: box.y1 + 14,
    value: count > 1 ? `${year} · ${count} readings` : String(year),
    role: 'chrome', fill: ZINC_TEXT, anchor: 'middle', size: '10px',
  });
}

/**
 * The two annotations the brief makes mandatory, plus the maximum of whatever
 * window is on screen. Every word is built out of the record: the sentence is
 * the claim's own `statement`, the grade and interval its own fields, and the
 * rejection its own `verdict`.
 *
 * The callouts live in a band BELOW the axis and reach their marks on leaders,
 * so nothing a reader has to finish reading ever sits on top of a mark.
 */
function drawAnnotations(svg, plan, { xScale, yScale, box, windowKey, domain, annTop }) {
  const g = el('g', { class: 'p2-annotations' }, svg);
  const inside = (r) => r.year >= domain[0] && r.year <= domain[1];
  const half = (box.x1 - box.x0) / 2;
  const cols = 72;

  /* THE MAXIMUM OF THE WINDOW ON SCREEN, computed on every draw so the rocker
   * cannot leave a stale label behind — and carrying the reading's own basis,
   * because "highest" is only a fact inside one ruler. On the whole record the
   * highest reading is 1914 on the pre-1919 benchmark basis, which is a
   * different object from the Coen rail and is graded C for exactly that
   * reason. A rule that said "the peak" without naming the basis would be the
   * same mistake, in the other direction, as the one this strip exists to
   * correct. */
  const w = plan.windowMax(domain[0]);
  const mixed = w.at.length ? readingsSpanDisjointRails(plan, w.readings, w.at[0]) : false;
  for (const r of w.at) {
    const x = xScale(r.year);
    const y = yScale(r.mark.central);
    rule(g, { x1: box.x0, y1: y, x2: box.x1, y2: y, color: IRON, width: 1.5 });
    /* The rule marks the level; its caption sits at the top of the plot and not
     * on the rule, because a caption on the rule lands on whatever mark happens
     * to be at that height — which, on the whole record, is the 1922 pair. */
    text(g, {
      x: box.x0 + 4, y: box.y0 + 14,
      value: `HIGHEST READING ON SCREEN · ${pct(r.mark.central)} · ${r.year} · ${r.id} · ` +
        `grade ${r.mark.grade} · basis: "${r.mark.unit}"`,
      role: 'chrome', fill: IRON, size: '10.5px',
    });
    if (mixed) {
      text(g, {
        x: box.x0 + 4, y: box.y0 + 26,
        value: `${r.year} is covered by ${railsAt(plan, r.year).join(', ') || 'no total rail'}, ` +
          'which some other readings on screen do not share — so this is the highest READING, ' +
          'and not the maximum of any one series.',
        role: 'chrome', fill: IRON, size: '10.5px',
      });
    }
    el('circle', { cx: x, cy: y, r: 9, fill: 'none', stroke: IRON, 'stroke-width': 1.2 }, g);
  }
  if (w.couldExceed.length) {
    text(g, {
      x: box.x0 + 4, y: box.y0 + (mixed ? 38 : 26),
      value: `${w.couldExceed.length} reading(s) on screen have no middle value and reach above ` +
        `that level: ${w.couldExceed.map((r) => `${r.id} (${share(r.mark.lo)}–${share(r.mark.hi)})`).join(', ')}. ` +
        'The highest READING is not necessarily the largest share.',
      role: 'chrome', fill: IRON, size: '10.5px',
    });
  }

  const slots = [];

  /* 1922 — annotated so a reader cannot miss it, and scoped the way the record
   * scopes it. `e2-scale-004` says 1922 is "the highest reading in the entire
   * 1919-2007 Coen/BEA series", and that scope is the claim, not a decoration
   * on it. What the strip adds is computed on the spot: nothing after 1922
   * reaches it, and anything above it sits on another basis. */
  const peaks = (plan.byYear.get(1922) || []).filter(inside);
  const peakPoints = peaks.filter((r) => r.mark.kind === 'point');
  if (peakPoints.length) {
    const top = peakPoints.reduce((a, b) => (a.mark.central >= b.mark.central ? a : b));
    const later = plan.readings.filter((r) => r.year > 1922 && r.mark.kind === 'point');
    const laterMax = later.length ? Math.max(...later.map((r) => r.mark.central)) : null;
    if (laterMax != null && laterMax >= top.mark.central) {
      throw new Error(
        `gdp-strip: a reading after 1922 now reaches ${laterMax}% against 1922 at ` +
        `${top.mark.central}%. This chart is built on the finding that nothing after 1922 ` +
        `regains it. Re-read the record before drawing anything.`,
      );
    }
    const higher = plan.readings.filter((r) => r.mark.kind === 'point' && r.mark.central > top.mark.central);
    slots.push({
      x: box.x0, anchorX: xScale(1922), anchorY: yScale(top.mark.hi),
      /* `laterMax` is null when no reading after 1922 carries a middle value.
       * This used to interpolate it anyway and `pct(null)` printed "0.0%" — a
       * formatter deciding what to say about a quantity nobody measured. The
       * formatters refuse a hole now, so the sentence has to say what it means. */
      head: laterMax == null
        ? '1922 — nothing after it comes back. No later reading carries a middle value to compare it ' +
          'against.'
        : `1922 — nothing after it comes back. The next-highest later reading is ${pct(laterMax)}.`,
      lines: [
        ...peaks.flatMap((r) => wrap(`${r.id} · ${marks.markReading(r.mark, share)} · grade ` +
          `${r.mark.grade} · verdict ${r.mark.verdict || '—'} · basis "${r.mark.unit}"`, cols)),
        ...wrap(top.statement, cols),
        ...(higher.length
          ? wrap(`The only higher readings anywhere in the record are ` +
              `${higher.map((r) => `${r.year} at ${pct(r.mark.central)} (${r.id}, grade ${r.mark.grade}, basis "${r.mark.unit}")`).join('; ')}` +
              ` — a different ruler, and the record grades it accordingly. A maximum is only a ` +
              `maximum inside one basis.`, cols)
          : []),
      ],
    });

    /* THE CALIPER, RUN CENTRAL TO CENTRAL — and printing zero when the answer
     * is zero. It used to run from peaks[0]'s interval FLOOR to peaks[1]'s
     * interval CEILING and present that as the distance between two readings.
     * Both readings put 1922 at 3.0%; the distance is nothing. The caliper is
     * this project's own instrument for "the gap is an object", and pointing it
     * at a gap that does not exist is the worst thing that can be done with it.
     *
     * Where either reading has no central there is no distance to measure at
     * all, and the strip says so instead of drawing an instrument. */
    if (peaks.length > 1) {
      const [a, b] = peaks;
      if (a.mark.kind === 'point' && b.mark.kind === 'point') {
        const distance = Math.abs(a.mark.central - b.mark.central);
        const cal = caliper(g, {
          x: xScale(1922) + 14, yA: yScale(a.mark.central), yB: yScale(b.mark.central),
          side: 1, arm: 8,
          label: distance < 0.005
            ? `two readings of one year, ${share(0)} apart`
            : `two readings of one year, ${share(distance)} apart`,
        });
        el('title', {}, cal).textContent =
          `${a.id} reads ${pct(a.mark.central)} and ${b.id} reads ${pct(b.mark.central)}: they are ` +
          `${share(distance)} apart` +
          (distance < 0.005 ? ' — the two readings agree to the digit the record prints.' : '.') +
          ` They are not merged: ${a.id} is grade ${a.mark.grade} with an 80% interval of ` +
          `${share(a.mark.lo)}–${share(a.mark.hi)}, ${b.id} is grade ${b.mark.grade} with ` +
          `${share(b.mark.lo)}–${share(b.mark.hi)}. The intervals differ where the readings do not.`;
      } else {
        text(g, {
          x: xScale(1922) + 22, y: yScale(top.mark.hi) - 6,
          value: 'two readings of one year, one with no middle value — no distance to measure',
          role: 'chrome', fill: IRON, size: '10px',
        });
      }
    }
  }

  /* 2000 — annotated so a reader who arrived believing the popular version
   * sees their belief tested rather than ignored. */
  const belief = (plan.byYear.get(2000) || []).filter(inside);
  if (belief.length) {
    const r = belief[0];
    slots.push({
      x: box.x0 + half, anchorX: xScale(2000), anchorY: yScale(r.mark.lo),
      head: windowKey === 'narrow'
        ? '2000 — the highest reading in THIS window. The popular story stops here.'
        : `2000 — the maximum of the post-${plan.narrowFrom} window only, not of the record.`,
      lines: [
        ...wrap(`${r.id} · ${marks.markReading(r.mark, share)} · grade ${r.mark.grade} · ` +
          `basis "${r.mark.unit}"`, cols),
        ...(plan.rejected.length
          ? wrap(`${plan.rejected.length} claims in this record asserting a 2000 peak were REJECTED in ` +
                 `verification — ${plan.rejected.map((c) => c.id).join(', ')}. Each now carries the ` +
                 `sentence that replaced it, and both of those sentences put the maximum in 1922.`, cols)
          : []),
      ],
    });
  }

  slots.forEach((slot) => {
    const x = slots.length === 1 ? box.x0 : slot.x;
    const y = annTop + 14;
    rule(g, { x1: slot.anchorX, y1: slot.anchorY, x2: x + 10, y2: y - 11, color: IRON, width: 1, dashed: true });
    textBlock(g, { x, y, lines: wrap(slot.head, cols), role: 'chrome', fill: INK.primary, size: '12px', lead: 14 });
    textBlock(g, { x, y: y + 15 + (wrap(slot.head, cols).length - 1) * 14, lines: slot.lines });
  });
  return g;
}

/**
 * THE ABSENCE THIS STRIP ACTUALLY HAS, computed year by year.
 *
 * A documented hole is cut at every year that carries a mark, and what is left
 * is drawn. The rule the module was built on is unchanged — never a stipple on
 * top of a mark, which is why the 2025 reading is not buried under the
 * 2011–2025 hole — but it is now applied per YEAR instead of per HOLE, so one
 * reading in 1914 no longer erases the fifty-one other years of the 1867–1918
 * absence.
 *
 * Every run is a subset of a hole the record documents, so every one of them
 * intersects a real absence and `resolveGaps` accepts the list.
 */
function stripHoles(plan, domain) {
  const marked = new Set(plan.readings.map((r) => r.year));
  const runs = [];
  for (const hole of plan.holes) {
    if (hole.years[1] < domain[0] || hole.years[0] > domain[1]) continue;
    let start = null;
    for (let y = hole.years[0]; y <= hole.years[1] + 1; y += 1) {
      const stop = y > hole.years[1] || marked.has(y);
      if (stop) {
        if (start !== null) {
          runs.push({
            id: `${hole.id}-${start}-${y - 1}`,
            years: [start, y - 1],
            reason: hole.reason,
            hole: hole.id,
          });
          start = null;
        }
      } else if (start === null) start = y;
    }
  }
  return runs.filter((r) => r.years[1] >= domain[0] && r.years[0] <= domain[1]);
}

/** Merge overlapping or touching runs so one absence is one drawn block. */
function mergeHoles(gaps) {
  const sorted = [...gaps].sort((a, b) => a.years[0] - b.years[0]);
  const out = [];
  for (const g of sorted) {
    const last = out[out.length - 1];
    if (last && g.years[0] <= last.years[1] + 1) {
      last.years[1] = Math.max(last.years[1], g.years[1]);
      last.covers.push(g);
    } else {
      out.push({ years: [g.years[0], g.years[1]], covers: [g] });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Entry point
 * ------------------------------------------------------------------ */

/**
 * @param {Element} container
 * @param {object}  frozen    { claims, adspend, ... }
 * @param {object}  options   { window: 'narrow' | 'wide', verdicts, plan }
 *
 * `options.verdicts` is optional and is NOT one of the six frozen files. When
 * `verification/verdicts.json` is supplied the strip prints the verifier's own
 * sentence about where 2000 ranks; when it is not, it prints nothing and says
 * the rank is not in the frozen six rather than quoting a number from memory.
 * That is the same shape as `basisBreakNote`, which returns null rather than
 * inventing the seam figure when `adspend.json` is absent.
 *
 * `options.plan` takes a plan THIS MODULE built and nothing else. It used to
 * take any object at all, which skipped every guard in the file — the adversary
 * used it to render a rejected claim plotted at its `as_of` publication date.
 * It is now re-opened through claim-marks, which refuses an unminted plan,
 * asserts the whole live graph is still deep-frozen, re-checks every mark it can
 * reach anywhere in it, and re-runs `revalidateStrip` before anything is drawn.
 */
export function render(container, frozen, options = {}) {
  guards.useFrozen(frozen);
  const plan = options.plan
    ? marks.openSealedPlan(options.plan, 'the share-of-GDP strip')
    : planStrip(frozen, options);
  let windowKey = options.window === 'wide' ? 'wide' : 'narrow';

  container.innerHTML = '';
  container.classList.add('p2-strip');

  const head = h('header', { class: 'p2-bank-head' }, container);
  h('div', { class: 'p2-arch', text: 'The share-of-GDP strip · US advertising against the economy' }, head);
  h('h2', { class: 'p2-bank-title', text: 'Advertising did not take its largest share of the economy in 2000.' }, head);
  h('p', {
    class: 'p2-prose p2-bank-lede',
    text: 'The record holds eleven dated readings and no annual series, so these are marks and not a ' +
      'line. Start on the post-' + plan.narrowFrom + ' window, which is where the familiar version of ' +
      'this story is read from, and 2000 is the highest reading on screen. Widen the window to the ' +
      'whole record and 1922 walks in above it. Nothing about the numbers changes. Only how far back ' +
      'you are allowed to look.',
  }, head);

  const ctl = h('div', { class: 'p2-ctl' }, head);
  h('span', { class: 'p2-arch', text: 'Window — turn the handle' }, ctl);
  const rocker = h('div', { class: 'p2-rocker', role: 'group', 'aria-label': 'Time window' }, ctl);
  const readout = h('span', { class: 'p2-chrome p2-cut' }, ctl);

  const body = h('div', { class: 'p2-strip-body' }, container);
  const foot = h('div', { class: 'p2-bank-foot' }, container);

  const draw = () => {
    body.innerHTML = '';
    const domain = windowKey === 'narrow' ? plan.domainNarrow : plan.domainWide;
    const alt = stripAlt(plan, windowKey);

    /* Four stacked regions, computed rather than nudged, so text never lands on
     * a mark whatever the record does next. */
    const bandsBottom = GEO.bandsTop + plan.rails.length * (GEO.bandHeight + GEO.bandGap) + 16;
    const plotTop = bandsBottom + GEO.seamGutter;
    const plotBottom = plotTop + GEO.plot;
    const annTop = plotBottom + GEO.axisBand;
    const height = annTop + GEO.annotation;

    const svg = svgRoot(body, { width: GEO.width, height, alt, className: 'p2-strip-svg' });
    const box = {
      x0: GEO.padLeft, x1: GEO.width - GEO.padRight,
      y0: plotTop, y1: plotBottom,
    };
    const xScale = linear(domain, [box.x0, box.x1]);
    const yScale = linear([0, plan.scaleTop], [box.y1, box.y0]);

    frame(svg, { x: box.x0, y: box.y0, width: box.x1 - box.x0, height: box.y1 - box.y0 });

    for (let v = 0; v <= plan.scaleTop + 1e-9; v += 0.5) {
      const y = yScale(v);
      rule(svg, { x1: box.x0, y1: y, x2: box.x1, y2: y, dashed: v !== 0 });
      text(svg, { x: box.x0 - 6, y: y + 3.5, value: pct(v), role: 'chrome', fill: ZINC_TEXT, anchor: 'end', size: '10px' });
    }
    text(svg, {
      x: box.x0, y: box.y0 - 8, value: 'share of nominal US GDP',
      role: 'label', fill: ZINC_TEXT, anchor: 'start',
    });

    /* Decade ticks, labelled every twenty years. Every reading prints its own
     * year underneath it, and two year labels fighting for the same pixels is
     * one year label a reader cannot trust. */
    for (let y = Math.ceil(domain[0] / 10) * 10; y <= domain[1]; y += 10) {
      const x = xScale(y);
      rule(svg, { x1: x, y1: box.y1, x2: x, y2: box.y1 + 4 });
      if (y % 20 === 0) {
        text(svg, {
          x, y: box.y1 + 30, value: String(y), role: 'chrome', fill: ZINC_TEXT,
          anchor: 'middle', size: '9.5px', opacity: 0.5,
        });
      }
    }

    /* DOCUMENTED ABSENCE, DRAWN AS AN OBJECT — over exactly the years this
     * strip has nothing for. See stripHoles. */
    const holesHere = stripHoles(plan, domain);
    const rendered = [];
    for (const g of mergeHoles(holesHere)) {
      const x = xScale(Math.max(g.years[0], domain[0]));
      const x2 = xScale(Math.min(g.years[1] + 1, domain[1]));
      if (x2 - x < 3) continue;
      absenceBlock(svg, svg, {
        x, y: box.y0 + 1, width: x2 - x, height: box.y1 - box.y0 - 2,
        years: g.years, label: 'no reading exists', vertical: x2 - x < 220,
        /* Every documented hole this block sits inside, in the record's own
         * words. One block can cover two of them and they are not the same
         * finding. */
        note: [...new Set(g.covers.map((c) => `${c.years[0]}–${c.years[1]} ${c.reason}`))].join(' · '),
      });
      for (const src of g.covers) {
        rendered.push({ years: [src.years[0], src.years[1]], label: src.reason, form: 'stipple' });
      }
    }
    if (holesHere.length) {
      /* The guard checks the descriptors this module hands it, not the DOM. A
       * run too narrow to draw is skipped above and would therefore be missing
       * from `rendered` — which is the failure the guard exists to report, and
       * it reports it rather than letting the strip pass over an absence it
       * decided was too small to mention. */
      guards.assertAbsenceDrawn(holesHere, rendered, 'the share-of-GDP strip', frozen.adspend);
    }

    drawBases(svg, plan, { xScale, top: GEO.bandsTop });
    drawSeams(svg, plan, { xScale, gutterTop: bandsBottom, plotTop, plotBottom });

    const shown = plan.readings.filter((r) => r.year >= domain[0] && r.year <= domain[1]);
    for (const [year, group] of plan.byYear) {
      if (year < domain[0] || year > domain[1]) continue;
      const spread = (group.length - 1) * 20;
      group.forEach((r, i) => {
        drawReading(svg, plan, r, {
          xScale, yScale, offset: -spread / 2 + i * 20, box, slot: i, group: group.length,
        });
      });
      drawYearLabel(svg, year, group.length, { xScale, box });
    }

    drawAnnotations(svg, plan, { xScale, yScale, box, windowKey, domain, annTop });

    const cap = h('p', { class: 'p2-chrome p2-panel-cap' }, body);
    cap.textContent = alt;

    readout.textContent =
      `${domain[0]}-${domain[1]} · ${shown.length} of ${plan.readings.length} readings on screen · ` +
      `${plan.spanOnlyCount} span-only · ` +
      `${holesHere.length} stretch(es) with no reading at all · ` +
      `no line is drawn, because the record holds no annual series`;
  };

  for (const [key, label] of [
    ['narrow', `Post-${plan.narrowFrom} window`],
    ['wide', 'The whole record'],
  ]) {
    const btn = h('button', {
      type: 'button', 'data-window': key, 'aria-pressed': String(windowKey === key), text: label,
    }, rocker);
    btn.addEventListener('click', () => {
      if (windowKey === key) return;
      crank({
        input: btn,
        output: body,
        apply: () => {
          windowKey = key;
          for (const b of rocker.querySelectorAll('button')) {
            b.setAttribute('aria-pressed', String(b.dataset.window === windowKey));
          }
          draw();
        },
      });
    });
  }

  draw();
  readingRegister(foot, plan);
  verdictRegister(foot, plan, options);
  basisRegister(foot, plan);

  return { plan, window: () => windowKey, redraw: draw };
}

function readingRegister(parent, plan) {
  const box = h('div', { class: 'p2-note-box' }, parent);
  h('div', { class: 'p2-arch', text: `Every reading the record holds · ${plan.readings.length} claims` }, box);
  h('p', {
    class: 'p2-chrome',
    text: 'Selected on the claim\'s own unit string — a word-boundary match on "GDP" plus a percent ' +
      'test — and never on a written list of claim ids. The word boundary is load-bearing: a ' +
      'substring test puts e7-targeting-003, which measures a GDPR effect on revenue per click, ' +
      'onto a share-of-the-economy axis.',
  }, box);
  const table = h('table', { class: 'p2-reg' }, box);
  const tr = h('tr', {}, h('thead', {}, table));
  for (const c of ['Claim', 'Year', 'Share', '80% interval', 'Grade', 'Verdict', 'Basis, as the record states it', 'as_of']) {
    h('th', { text: c }, tr);
  }
  const tbody = h('tbody', {}, table);
  for (const r of plan.readings) {
    const mark = r.mark;
    const row = h('tr', { 'data-verdict': mark.verdict || 'none' }, tbody);
    h('td', { text: r.id }, row);
    h('td', { class: 'n', text: String(r.year) }, row);
    /* A span-only reading has no share to print, and there is no number here to
     * print one from. */
    h('td', { class: 'n', text: mark.kind === 'span' ? 'span only' : share(mark.central) }, row);
    h('td', { class: 'n', text: `${share(mark.lo)} – ${share(mark.hi)}` }, row);
    h('td', { text: mark.grade }, row);
    h('td', { text: mark.verdict || '—' }, row);
    h('td', { text: mark.unit }, row);
    h('td', { text: `${r.as_of}${r.divergence ? ` (${r.divergence}y from the fact)` : ''}` }, row);
  }
  if (plan.refused.length) {
    h('p', {
      class: 'p2-chrome',
      text: `${plan.refused.length} reading(s) are withheld from the timeline by the record itself ` +
        `(timeline_ready:false) and are printed here rather than drawn: ` +
        plan.refused.map((c) => c.id).join(', '),
    }, box);
  }
  if (plan.verdictStamps.length) {
    h('p', {
      class: 'p2-chrome',
      text: `${plan.verdictStamps.length} of these readings carry a verdict that is not "confirmed": ` +
        plan.verdictStamps.map((s) => `${s.id} (${s.verdict})`).join(', ') +
        '. Each one carries that word on its own mark, in the row above, and in the table below.',
    }, box);
  }
  return box;
}

function verdictRegister(parent, plan, options = {}) {
  const box = h('div', { class: 'p2-note-box' }, parent);
  h('div', { class: 'p2-arch', text: 'What verification rejected' }, box);
  if (!plan.rejected.length) {
    h('p', { class: 'p2-chrome', text: 'No claim on this question carries a rejected verdict.' }, box);
    return box;
  }
  /* Reader-facing, so it clears the four gates, measured with
   * tools/readability.py: FK 3.88, Reading Ease 87.5, Fog 6.20, SMOG 7.05. */
  h('p', {
    class: 'p2-prose',
    text: 'The popular version of this story is a claim this project made and then threw out. ' +
      'Both of these said the peak was in 2000. Both were rejected. Both now carry the sentence ' +
      'that replaced them. That is why one of them is drawn above rather than left off. The rule ' +
      'is the same on every chart here, and it lives in one place. Every verdict can be drawn. ' +
      'No verdict is hidden.',
  }, box);
  const table = h('table', { class: 'p2-reg' }, box);
  const tbody = h('tbody', {}, table);
  for (const c of plan.rejected) {
    const drawn = plan.readings.some((r) => r.id === c.id);
    const row = h('tr', {}, tbody);
    h('td', { text: c.id }, row);
    h('td', { text: String(c.verdict).toUpperCase() }, row);
    h('td', { text: drawn ? 'drawn above, stamped' : 'not on this strip' }, row);
    h('td', { text: c.statement }, row);
  }
  /* The rank is corroboration from the verification record, which is not one of
   * the six frozen files. Printed when it is supplied, and named as missing
   * when it is not. Nothing here is quoted from memory. */
  const note = h('p', { class: 'p2-chrome' }, box);
  const verdicts = options.verdicts;
  if (verdicts && Array.isArray(verdicts.verdicts)) {
    const rows = verdicts.verdicts.filter((v) => plan.rejected.some((c) => c.id === v.claim_id));
    if (rows.length) {
      note.textContent = 'From the verification record: ' +
        rows.map((v) => `${v.claim_id} — ${v.reason}`).join('  •  ');
    } else {
      note.textContent = 'verdicts.json was supplied but holds no entry for these claims.';
    }
  } else {
    note.textContent =
      'The verifier\'s ranking of 2000 against every year of the Coen rail lives in ' +
      'verification/verdicts.json, which is not one of the six frozen files this chart reads. ' +
      'Supply it as options.verdicts and it prints here. It is not quoted from memory.';
  }
  return box;
}

function basisRegister(parent, plan) {
  const box = h('div', { class: 'p2-note-box' }, parent);
  h('div', { class: 'p2-arch', text: 'The bases, and why they are never merged' }, box);
  const table = h('table', { class: 'p2-reg' }, box);
  const tr = h('tr', {}, h('thead', {}, table));
  for (const c of ['Rail', 'Covers', 'Role', 'What it measures']) h('th', { text: c }, tr);
  const tbody = h('tbody', {}, table);
  for (const r of plan.rails) {
    const row = h('tr', {}, tbody);
    h('td', { text: r.key }, row);
    h('td', { text: `${r.coverage[0]}–${r.coverage[1]}` }, row);
    h('td', { text: r.role }, row);
    h('td', { text: r.measures }, row);
  }
  if (plan.overlap.length) {
    const from = plan.overlap[0].year;
    const to = plan.overlap[plan.overlap.length - 1].year;
    h('p', {
      class: 'p2-chrome',
      text: `${from} to ${to} has more than one total rail live at the same time — ` +
        `${[...new Set(plan.overlap.flatMap((o) => o.rails))].join(', ')}. The bands overlap on the ` +
        `drawing and are never joined. Which rail you read decides the answer, and that is the ` +
        `point of the chapter this strip serves.`,
    }, box);
  }
  return box;
}

export default { render, planStrip, gdpReadings, rejectedOnThisQuestion };
