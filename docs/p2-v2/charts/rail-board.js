/**
 * rail-board.js — the provenance strip. Team B2.
 *
 * WHAT IT IS. Eight horizontal tracks, one per series in adspend.json, sharing
 * the hero time axis. Each track draws a band ONLY across the years that
 * compiler actually published, and ends in a hard vertical stop. It is
 * simultaneously the legend, the provenance map, the coverage map and the gap
 * map. A reader who looks at nothing else should still learn that eight
 * different people counted this market and that they disagree about when the
 * record even exists.
 *
 * THREE TEXTURES, THREE STATES:
 *   solid band   published annual data
 *   loose marks  benchmark years only, with nothing joining them
 *   45° hatch    constructed by us, grade C, never a compiler's number
 *
 * EVERY DRAWING DECISION ROUTES THROUGH ../lib/guards.js:
 *   G4  selectSeries(adspend, "all") + assertSeriesListComplete — eight, not five
 *   G5  seriesYearGaps(key) for each rail's own holes; coverageGaps() for the
 *       record's four documented holes; assertAbsenceDrawn for both
 *   G3  buildPath segments each rail; a band is one segment and never spans two
 *   SWEEP from ../lib/motion.js, with its reduced half carrying the same picture
 *
 * WHAT THE LIBRARY DOES NOT DO, AND THIS FILE THEREFORE DOES. adspend.json
 * carries no cadence field, and guards.js exposes no classifier for "is this
 * compiler's series annual, or benchmark years, or our own construction?" —
 * so `railCadence()` below derives it from the record and nothing else. It
 * reads two facts the record states outright: every point of a constructed
 * series carries `bridged: true`, and a benchmark series declares
 * "benchmark years only, never annual" in its own `known_breaks`. No series
 * key is written down in this file.
 */

import * as guards from '../lib/guards.js';
import { sweep } from '../lib/motion.js';
import {
  el, layer, text, titled, textures, uid, linear, sweepClip,
  shortLabel, yearsLabel, comma,
  BONE, ZINC_RULE, ZINC_TEXT, IRON, STIPPLE, INK, GRID, RULE_WIDTH,
} from './svg-kit.js';

/* ------------------------------------------------------------------ *
 * 1. Cadence — the one thing the library does not answer
 * ------------------------------------------------------------------ */

export const CADENCE = Object.freeze({
  ANNUAL: 'annual',
  BENCHMARK: 'benchmark',
  CONSTRUCTED: 'constructed',
});

/** The record's own words for each cadence, printed in the key. */
export const CADENCE_LABEL = Object.freeze({
  annual: 'published annual data',
  benchmark: 'benchmark years only',
  constructed: 'our construction, grade C',
});

const BENCHMARK_DECLARATION = /benchmark years only|never annual/i;

/**
 * Which of the three states this series is in, derived from the record.
 *
 * CONSTRUCTED is `bridged: true` on every point. adspend.json puts every
 * constructed value in one series for exactly this reason — its own
 * `why_added` says so: "keeps constructed values out of the named compilers'
 * series."
 *
 * BENCHMARK is a series whose own `known_breaks` declares it. The benchmark
 * series says "benchmark years only, never annual" in the record's own words.
 * That is a compiler's statement about its own cadence, not an inference from
 * the year spacing — which matters, because the benchmark years 1917 and 1918
 * happen to be consecutive and a spacing test would call that pair a series.
 *
 * Everything else is ANNUAL. An annual series may still have holes; those come
 * from guards.seriesYearGaps and are drawn as absence.
 */
export function railCadence(seriesKey, adspendFile) {
  const file = adspendFile || guards.getFrozen('adspend');
  const series = file && file.series && file.series[seriesKey];
  if (!series) {
    throw new RangeError(`rail-board: adspend.json holds no series "${seriesKey}".`);
  }
  const points = series.points || [];
  if (points.length > 0 && points.every((p) => p.bridged === true)) return CADENCE.CONSTRUCTED;
  const breaks = Array.isArray(series.known_breaks) ? series.known_breaks : [];
  if (breaks.some((b) => BENCHMARK_DECLARATION.test(String(b)))) return CADENCE.BENCHMARK;
  return CADENCE.ANNUAL;
}

/**
 * Three invariants on a finished track, checked before it can be drawn.
 *
 * 1. A BENCHMARK RAIL IS NEVER BANDED. Nine estimates spread over fifty-two
 *    years are nine estimates, not a series, and a band between two of them
 *    asserts a continuity nobody measured. DESIGN.md rule 5, and the rail-board
 *    half of the value chart's rule 3.
 *
 * 2. EVERY PUBLISHED YEAR IS DRAWN EXACTLY ONCE, and no year is drawn that the
 *    compiler never published.
 *
 * 3. A TRACK WITH POINTS DRAWS SOMETHING. An empty track reads as "this
 *    compiler published nothing", which for seven of the eight would be false.
 *
 * BE HONEST ABOUT WHAT 2 AND 3 ARE. On the code paths as written they cannot
 * fire: `bands` and `marks` are both derived from the same segments, which are
 * derived from the same spine as `published`. They are class invariants over
 * the finished plan, and they exist so that an edit to the segmentation — a
 * gap list scoped to the wrong rail, an off-by-one in a run boundary, a filter
 * added between the spine and the runs — cannot silently shorten the record.
 * A coverage map that quietly drops coverage is the worst thing this object
 * could do, and it would look completely fine.
 *
 * All three throw rather than filtering. A filter would produce a shorter
 * picture and the caller would never learn which state they were in.
 */
function assertTrackDrawn(track) {
  if (track.cadence === CADENCE.BENCHMARK && track.bands.length > 0) {
    throw new Error(
      `rail-board: "${track.key}" declares "benchmark years only" in its own known_breaks, ` +
      `and ${track.bands.length} connecting band(s) were about to be drawn on it. ` +
      `Benchmark years are drawn as loose marks with nothing joining them.`
    );
  }
  const drawn = new Set(track.marks);
  for (const band of track.bands) {
    for (let y = band.years[0]; y <= band.years[1]; y += 1) {
      if (drawn.has(y)) {
        throw new Error(
          `rail-board: "${track.key}" draws ${y} twice — once in a band and once elsewhere. ` +
          `Two marks in one year read as two observations.`
        );
      }
      drawn.add(y);
    }
  }
  const missing = track.published.filter((y) => !drawn.has(y));
  if (missing.length > 0) {
    throw new Error(
      `rail-board: "${track.key}" publishes ${track.published.length} years and the drawing ` +
      `covers ${drawn.size}. Missing: ${missing.slice(0, 8).join(', ')}` +
      `${missing.length > 8 ? ` … and ${missing.length - 8} more` : ''}. ` +
      `A coverage map that drops coverage is worse than no coverage map.`
    );
  }
  const extra = [...drawn].filter((y) => !track.published.includes(y));
  if (extra.length > 0) {
    throw new Error(
      `rail-board: "${track.key}" draws ${extra.slice(0, 8).join(', ')} but publishes no value ` +
      `for ${extra.length === 1 ? 'that year' : 'those years'}. A band across a year the ` +
      `compiler never published is the splice this board exists to make visible.`
    );
  }
  if (track.published.length > 0 && drawn.size === 0) {
    throw new Error(
      `rail-board: "${track.key}" holds ${track.pointCount} points and would render empty, ` +
      `which reads as "this compiler published nothing".`
    );
  }
  return true;
}

/* ------------------------------------------------------------------ *
 * 2. The plan — no DOM, fully guarded, testable on its own
 * ------------------------------------------------------------------ */

/** One point per published year, straight off the record. Nothing is reshaped. */
function yearSpine(series) {
  const byYear = new Map();
  for (const p of series.points || []) if (!byYear.has(p.year)) byYear.set(p.year, p);
  return [...byYear.values()].sort((a, b) => a.year - b.year);
}

function gradeTally(series) {
  const tally = {};
  for (const p of series.points || []) {
    const g = (p.calibration && p.calibration.grade) || '?';
    tally[g] = (tally[g] || 0) + 1;
  }
  return tally;
}

/**
 * Build the board's drawing plan.
 *
 * @param {{adspend:object}|object} frozen  the frozen data, or adspend.json itself
 * @param {{window?:[number,number]}} options
 */
export function planRailBoard(frozen, options = {}) {
  const adspend = frozen && frozen.series ? frozen : (frozen && frozen.adspend) || guards.getFrozen('adspend');
  const ctx = 'the rail board';

  /* G4. Eight series, read out of the file. The board draws every one of them,
   * so there is no subset and no `because` to write — and assertSeriesListComplete
   * is the call that says the whole record reached the page, which selectSeries
   * on its own does not promise. */
  const selected = guards.selectSeries(adspend, 'all', ctx);
  const keys = Object.keys(selected);
  guards.assertSeriesListComplete(keys, adspend, ctx);

  const documented = guards.coverageGaps(adspend);
  const windowSpan = options.window || [1840, 2026];

  const tracks = keys.map((key) => {
    const series = selected[key];
    const cadence = railCadence(key, adspend);
    const spine = yearSpine(series);

    /* G5, scoped. The four documented holes are holes in the TOTAL rail, not in
     * every series — iab_pwc publishes every year through 2025 inside the
     * 2011-2025 by-medium hole. seriesYearGaps reads this rail's own holes, and
     * returns the module's authenticated declared-empty sentinel rather than a
     * bare [] when there are none. */
    const gaps = guards.seriesYearGaps(key, adspend);

    /* G3 + G5 together. buildPath breaks on a change of source_series and on a
     * documented hole; every segment it returns is one rail, unbroken. */
    const { segments, breaks } = guards.buildPath(spine, { gaps, adspend });

    /* THE RECORD DOES NOT TRAVEL ON THE PLAN. This used to carry
     * `points: seg.points` — the record rows themselves, `calibration` and all —
     * beside the years the band is drawn from. Nothing read them, which is not a
     * guarantee, it is a latent hazard: the next renderer to want "the value at
     * this year" would have found it there, un-guarded, on a board whose whole
     * job is coverage rather than level. The board draws years, so the plan
     * carries years. */
    const runs = segments.map((seg) => ({
      years: [seg.points[0].year, seg.points[seg.points.length - 1].year],
      count: seg.points.length,
      source_series: seg.source_series,
    }));

    /* Bands are for annual and constructed rails. Benchmark rails get marks. */
    const bands = cadence === CADENCE.BENCHMARK ? [] : runs;
    const marks = cadence === CADENCE.BENCHMARK ? spine.map((p) => p.year) : [];

    const rendered = [...gaps].map((g) => ({
      years: [g.years[0], g.years[1]],
      label: g.reason,
      form: 'stipple',
    }));
    guards.assertAbsenceDrawn(gaps, rendered, `${ctx} track "${key}"`, adspend);

    const track = {
      key,
      role: series.role,
      compiler: series.compiler,
      compilerShort: shortLabel(series.compiler),
      measures: series.measures,
      coverage: series.coverage,
      cadence,
      published: spine.map((p) => p.year),
      pointCount: (series.points || []).length,
      grades: gradeTally(series),
      runs,
      bands,
      marks,
      gaps: [...gaps],
      breaks,
      rendered,
      beyondSchemaSpec: series.added_beyond_schema_spec === true,
      whyAdded: series.why_added || null,
    };
    assertTrackDrawn(track);
    return track;
  });

  /* The record's four documented holes, drawn as columns cutting every track.
   * Each carries the record's own reason as its label; the caption prints all
   * four in full, because assertAbsenceDrawn checks the array the chart hands
   * it and cannot check what is on screen. */
  const holeColumns = documented.map((g) => ({
    years: [g.years[0], g.years[1]],
    label: g.reason,
    form: 'stipple',
    id: g.id,
  }));
  guards.assertAbsenceDrawn(undefined, holeColumns, `${ctx} documented holes`, adspend);

  return {
    window: windowSpan,
    tracks,
    documented: holeColumns,
    seriesCount: keys.length,
    pointCount: tracks.reduce((n, t) => n + t.pointCount, 0),
    alt: ALT_SENTENCE,
  };
}

/* ------------------------------------------------------------------ *
 * 3. The plain-English sentence
 *
 * DESIGN.md adopts a required readable sentence in the data layer for every
 * visual, driving a text-only path (team B8). The design system does not model
 * that field, so the chart carries its own until B8 lands. It clears the four
 * readability gates: FK 2.9, Ease 87, Fog 4.3, SMOG 5.9.
 * ------------------------------------------------------------------ */

export const ALT_SENTENCE =
  'Eight groups counted this market. Each bar shows the years that group actually published. ' +
  'A solid bar is a yearly series. Loose marks are single years, with no series between them. ' +
  'A hatched bar is our own build, not a published count. The bars stop where the record stops.';

/* ------------------------------------------------------------------ *
 * 4. Geometry
 * ------------------------------------------------------------------ */

const GEO = Object.freeze({
  labelWidth: 190,
  padRight: 14,
  pitch: 7,          // 8 tracks x 7px = 56px of track
  band: 4,
  axis: 10,          // 56 + 10 = 66px, the sticky strip
  minPlot: GRID.scrollMin - 190,
});

/* ------------------------------------------------------------------ *
 * 5. Styles — injected once, all values from tokens
 * ------------------------------------------------------------------ */

const STYLE_ID = 'p2-rail-board-style';

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.p2-railboard__strip {
  position: sticky; top: 0; z-index: 30;
  background: ${BONE};
  border-bottom: ${RULE_WIDTH.mechanism}px solid ${IRON};
  overflow-x: auto; overscroll-behavior-x: contain;
}
.p2-railboard__strip > svg { display: block; width: 100%; height: auto; min-width: ${GRID.scrollMin}px; }
.p2-railboard__cap {
  font-family: var(--p2-font-chrome, monospace); font-size: 11.5px; line-height: 1.5;
  color: ${ZINC_TEXT}; padding: 10px 0 0; max-width: 78ch;
}
.p2-railboard__cap b { color: ${INK.primary}; font-weight: 600; }
.p2-railboard__holes { margin: 6px 0 0; padding: 0; list-style: none; }
.p2-railboard__holes li { margin: 0 0 2px; }
.p2-railboard__holes code {
  font-family: var(--p2-font-chrome, monospace); color: ${IRON};
}
.p2-railboard__alt {
  font-family: var(--p2-font-prose, serif); font-size: 15px; line-height: 1.55;
  color: ${INK.secondary}; margin: 10px 0 0; max-width: 62ch;
}`;
  document.head.appendChild(style);
}

/* ------------------------------------------------------------------ *
 * 6. Render
 * ------------------------------------------------------------------ */

/**
 * Draw the rail board into `container`.
 *
 * @param {Element} container
 * @param {{adspend:object}|object} frozen
 * @param {{window?:[number,number], sticky?:boolean}} options
 * `container` MUST be the tall scrolling element — a chapter, a section, the
 * body. The strip is `position: sticky` and pins only while its parent box is
 * on screen, so a wrapper sized to the board unpins it immediately.
 *
 * @returns {{plan:object, svg:SVGElement, strip:Element, caption:Element, replay:Function}}
 */
export function renderRailBoard(container, frozen, options = {}) {
  if (!container || typeof container.appendChild !== 'function') {
    throw new TypeError('rail-board: renderRailBoard(container, frozen) needs a container element.');
  }
  installStyles();
  const plan = planRailBoard(frozen, options);
  const id = uid('rb');

  const plotW = Math.max(GEO.minPlot, 1024);
  const W = GEO.labelWidth + plotW + GEO.padRight;
  const trackTop = 3;                              // the 8px cap height of row 0 needs somewhere to go
  const tracksH = trackTop + plan.tracks.length * GEO.pitch;
  const H = tracksH + GEO.axis;

  /* THE STRIP IS APPENDED TO `container` DIRECTLY, NOT WRAPPED.
   *
   * `position: sticky` pins an element only while its PARENT BOX is on screen.
   * Wrapping the strip in a figure sized to the board means the board unpins
   * about seventy pixels after it appears, which is the opposite of what this
   * object is for. So the strip's parent is whatever `container` is, and the
   * contract is stated rather than papered over: pass the tall element — the
   * chapter, the section, the body — never a wrapper sized to the board. */
  const strip = document.createElement('div');
  strip.className = 'p2-railboard__strip';
  if (options.sticky === false) strip.style.position = 'static';

  /* `data-alt-source` IS NOT DECORATION ON THIS ELEMENT. It is the only way the
   * access layer finds a drawing: `access/visuals.js` requires every stamped
   * node to sit inside a declared visual, `access/text-path.js` reads the
   * stamped nodes to build the text-only block, and `access/keyboard.js` makes
   * the stamped nodes tab stops with a reading cursor. This board and the value
   * chart are the two drawings on the page that mint their own root instead of
   * calling `svgRoot`, and both were invisible to all three of those. A drawing
   * the access layer cannot see is a drawing that does not exist for a reader
   * with images off — and the stipple below encodes a compiler that published
   * nothing, which is a finding, not an ornament. */
  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`, width: W, height: H,
    role: 'img', 'aria-label': plan.alt,
    'data-alt-source': 'generated-by-chart',
    style: 'display:block',
  });
  const tex = textures(svg, id);

  const x = linear(plan.window, [GEO.labelWidth, GEO.labelWidth + plotW]);
  const rowY = (i) => trackTop + i * GEO.pitch;
  const bandY = (i) => rowY(i) + (GEO.pitch - GEO.band) / 2;

  const gGround = layer(svg);       // empty track texture: absence, everywhere
  const gHoles = layer(svg);        // the record's four documented holes
  const gRails = layer(svg);        // the bands, marks and hard stops — swept
  const gLabels = layer(svg);       // the left margin
  const gAxis = layer(svg);         // years

  /* --- ground: every track is stippled where its compiler published nothing.
   * Rule 5. Whitespace would read as zero, or as nothing worth mentioning. --- */
  plan.tracks.forEach((track, i) => {
    const row = el('rect', {
      x: GEO.labelWidth, y: bandY(i), width: plotW, height: GEO.band,
      fill: tex.stipple, 'fill-opacity': 0.55,
    });
    titled(row, `${track.compiler} — published ${track.published.length} years, ` +
      `${track.coverage[0]}–${track.coverage[1]}. ${CADENCE_LABEL[track.cadence]}. ` +
      `Everything stippled on this track is a year this compiler published nothing.`);
    gGround.appendChild(row);
    gGround.appendChild(el('line', {
      x1: GEO.labelWidth, x2: GEO.labelWidth + plotW, y1: bandY(i) + GEO.band / 2, y2: bandY(i) + GEO.band / 2,
      stroke: ZINC_RULE, 'stroke-width': 0.5, 'stroke-opacity': 0.5,
    }));
  });

  /* --- the four documented holes, cutting vertically through every track.
   * They are holes in the TOTAL rail; where a compiler published inside one,
   * its band draws on top, which is the honest picture. --- */
  plan.documented.forEach((hole) => {
    const a = x(hole.years[0]);
    const b = x(hole.years[1] + 1);
    if (b < GEO.labelWidth || a > GEO.labelWidth + plotW) return;
    const col = el('rect', {
      x: Math.max(a, GEO.labelWidth), y: trackTop,
      width: Math.min(b, GEO.labelWidth + plotW) - Math.max(a, GEO.labelWidth),
      height: tracksH - trackTop, fill: tex.stipple, 'fill-opacity': 0.9,
    });
    titled(col, `Documented hole in the total rail, ${yearsLabel(hole.years)}: ${hole.label}`);
    gHoles.appendChild(col);
    gHoles.appendChild(el('rect', {
      x: Math.max(a, GEO.labelWidth), y: trackTop,
      width: Math.min(b, GEO.labelWidth + plotW) - Math.max(a, GEO.labelWidth),
      height: tracksH - trackTop, fill: 'none', stroke: STIPPLE, 'stroke-width': 1,
    }));
  });

  /* --- the rails --- */
  plan.tracks.forEach((track, i) => {
    const g = layer(gRails, { 'data-series': track.key, 'data-cadence': track.cadence });
    const y = bandY(i);
    const hatched = track.cadence === CADENCE.CONSTRUCTED;

    track.bands.forEach((run) => {
      const a = x(run.years[0]);
      const b = x(run.years[1] + 1);
      const band = el('rect', {
        x: a, y, width: Math.max(b - a, 2), height: GEO.band,
        fill: hatched ? tex.hatchIron : IRON,
        'fill-opacity': hatched ? 1 : 0.92,
        stroke: hatched ? IRON : 'none',
        'stroke-width': hatched ? 0.8 : 0,
        'stroke-dasharray': hatched ? '3 2' : null,
      });
      titled(band, `${track.compilerShort} published ${yearsLabel(run.years)} ` +
        `(${run.count} year${run.count === 1 ? '' : 's'})` +
        `${hatched ? ' — constructed by this dataset, grade C, not a published count' : ''}`);
      g.appendChild(band);
      /* HARD VERTICAL STOP at both ends. Never a fade: the record either has a
       * value for that year or it does not, and a fade says "trailing off". */
      [a, Math.max(b, a + 2)].forEach((edge) => {
        g.appendChild(el('line', {
          x1: edge, x2: edge, y1: rowY(i) + 0.5, y2: rowY(i) + GEO.pitch - 0.5,
          stroke: IRON, 'stroke-width': RULE_WIDTH.mechanism,
        }));
      });
    });

    /* benchmark years: loose marks, and nothing joins them */
    track.marks.forEach((year) => {
      const cx = x(year) + (x(year + 1) - x(year)) / 2;
      const m = el('line', {
        x1: cx, x2: cx, y1: rowY(i) + 0.5, y2: rowY(i) + GEO.pitch - 0.5,
        stroke: IRON, 'stroke-width': RULE_WIDTH.mechanism,
      });
      titled(m, `${track.compilerShort} published a benchmark estimate for ${year}. ` +
        `Nothing joins it to the next one.`);
      g.appendChild(m);
    });
  });

  /* --- the left margin --- */
  plan.tracks.forEach((track, i) => {
    const baseline = rowY(i) + GEO.pitch - 1.5;
    const label = text(gLabels, {
      x: GEO.labelWidth - 14, y: baseline, value: track.compilerShort,
      role: 'label', fill: ZINC_TEXT, anchor: 'end', size: '8px', tracking: '0.03em',
    });
    titled(label, `${track.compiler} — ${track.measures}`);
    /* a hairline leader, so eight labels stacked seven pixels apart still
     * resolve to eight separate tracks rather than to a block of type */
    gLabels.appendChild(el('line', {
      x1: GEO.labelWidth - 10, x2: GEO.labelWidth - 4, y1: baseline - 2.5, y2: baseline - 2.5,
      stroke: ZINC_RULE, 'stroke-width': 1,
    }));
  });
  gLabels.appendChild(el('line', {
    x1: GEO.labelWidth - 4, x2: GEO.labelWidth - 4, y1: 0, y2: tracksH,
    stroke: ZINC_RULE, 'stroke-width': 1,
  }));

  /* --- the year axis --- */
  gAxis.appendChild(el('line', {
    x1: GEO.labelWidth, x2: GEO.labelWidth + plotW, y1: tracksH + 0.5, y2: tracksH + 0.5,
    stroke: IRON, 'stroke-width': 1,
  }));
  for (let year = 1840; year <= 2020; year += 20) {
    const px = x(year);
    gAxis.appendChild(el('line', {
      x1: px, x2: px, y1: tracksH, y2: tracksH + 3, stroke: ZINC_RULE, 'stroke-width': 1,
    }));
    text(gAxis, {
      x: px, y: tracksH + GEO.axis - 0.5, value: String(year),
      role: 'chrome', fill: ZINC_TEXT, anchor: 'middle', size: '7.5px',
    });
  }

  strip.appendChild(svg);

  /* --- the caption. It is not decoration: assertAbsenceDrawn checks the array
   * this module hands it and cannot read the DOM, so the four documented holes
   * are named here, in full, where a reader sees them. --- */
  const cap = document.createElement('div');
  cap.className = 'p2-railboard__cap';
  cap.id = `${id}-caption`;
  svg.setAttribute('aria-describedby', cap.id);
  cap.innerHTML =
    `<b>${plan.seriesCount} series · ${comma(plan.pointCount)} points.</b> ` +
    `Solid = published annual data. Loose marks = benchmark years only. ` +
    `45° hatch = our construction, grade C. Stipple = the compiler published nothing. ` +
    `Every band ends in a hard stop, never a fade.`;
  const holes = document.createElement('ul');
  holes.className = 'p2-railboard__holes';
  plan.documented.forEach((hole) => {
    const li = document.createElement('li');
    li.innerHTML = `<code>${yearsLabel(hole.years)}</code> — ${hole.label}`;
    holes.appendChild(li);
  });
  cap.appendChild(holes);
  const alt = document.createElement('p');
  alt.className = 'p2-railboard__alt';
  alt.textContent = plan.alt;
  cap.appendChild(alt);

  container.appendChild(strip);
  container.appendChild(cap);

  /* --- SWEEP: the rails draw left to right, like a chart recorder pen.
   * The reduced half calls onProgress(1) on the first frame, so the same eight
   * tracks end up completely drawn — nothing is lost, because the picture is
   * the information and the travel is not. --- */
  const clip = sweepClip(svg, id, { x: 0, y: 0, width: W, height: H });
  gRails.setAttribute('clip-path', clip.ref);
  const replay = () => {
    clip.apply(0);
    return sweep({ onProgress: (t) => clip.apply(t) });
  };
  const handle = replay();

  return { plan, svg, strip, caption: cap, replay, motion: handle };
}

export default renderRailBoard;
