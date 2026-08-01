/* docs/p2/eras/era-machine.js — THE MACHINE TEMPLATE, AND THE CRANK
 *
 * Team B3. One module, seven instances. It takes a SEALED plan from
 * `era-plan.js` and draws it. It never reads an era record, never reads
 * `claims.json`, and never calls a guard that decides what a mark is — all of
 * that already happened, one file over, and the answers arrived frozen.
 *
 * WHAT THIS FILE CANNOT DO, BY CONSTRUCTION
 *
 *   It cannot print a middle value for a span-only claim. There is no central
 *   on the mark and no arithmetic in this file: the only two ways a figure
 *   reaches the screen are `reading.figure` and `reading.reading`, both minted
 *   by `markFigure`/`markReading` at plan time.
 *
 *   It cannot move an organ. Every x comes from `organs.js`'s POSITION table,
 *   which is derived from one pitch and frozen. A per-era override does not
 *   exist as an option.
 *
 *   It cannot draw a claim the record refuses to place in time as a dated one.
 *   The plan carries `year: null` for those three claims and the renderer draws
 *   a named absence block where the year would be.
 *
 * THE ONE VERB. CRANK, from `../lib/motion.js`, with its 40ms hold. The hold is
 * load-bearing: it separates cause from effect in time, which is what makes the
 * reader attribute the output to their own hand. It is not tuned away here.
 */

import { crank, cut } from '../lib/motion.js';
/* THE ONLY TOKENS THIS FILE IMPORTS ARE GROUND AND GLYPH COLOURS, and both
 * reach the page through svg-kit's own guarded helpers — `text()` runs
 * assertTextColor and `frame()` runs assertObjectColor. Every colour that MAKES
 * A MARK comes from organs.js's PAINT and STRUCTURE, which are measured by
 * `assertColourBudget()` at import. This file used to pick BRASS, CYAN, RUST,
 * STIPPLE and IRON itself and called no colour guard at all, and two of those
 * five were drawn bare below the 3:1 an object needs. */
import { BONE, GRAPHITE, ZINC_TEXT, SURFACE, RULE_WIDTH } from '../lib/tokens.js';
import {
  el, h, svgRoot, layer, titled, text, rule, frame, textures, uid, shortLabel, linear,
} from '../charts/svg-kit.js';
import { openEraPlan, isEraPlan } from './era-plan.js';
import {
  VIEW, VIEW_BOX, TALLY, POSITIONS, POSITION, STRUCTURE, PAINT,
  channelPaths, organPaths, leaderPath, OPERABLE_ORGAN,
} from './organs.js';

export class EraRenderError extends Error {
  constructor(message, detail) { super(message); this.name = 'EraRenderError'; this.detail = detail; }
}

const N = (v) => Number(Number(v).toFixed(2));

/* ======================================================================
 * 1 · THE CALIPER — the one way a reading is drawn
 *
 * Iron, because a caliper is the instrument and not the reading. The figure is
 * printed beside it as text. This is the house pattern: `svg-kit.caliper()`
 * strokes iron and prints the measured distance in iron, and it is the reason
 * this module never has to decide whether a given claim is money or a count.
 *
 * A POINT mark draws an OPEN circle at its central — open, because a filled
 * round mark means money in this palette and a reading is not money.
 * A SPAN-ONLY mark draws no circle at all. There is nothing to draw it from:
 * `mark.central` is not a key on the object.
 * ====================================================================== */

function drawCaliper(parent, mark, { x, y, width, title }) {
  const g = layer(parent, { class: 'p2-era-caliper', 'data-kind': mark.kind });
  const pad = width * 0.08;
  /* A claim whose 80% interval is a single value — 65 of them read `[15, 15]` —
   * has nothing to span. It is drawn as a short bracket in the middle of the
   * plate rather than stretched across it, because stretching a zero-width
   * interval to the full width would draw a range the record does not carry. */
  const flat = mark.lo === mark.hi;
  const scale = flat ? null : linear([mark.lo, mark.hi], [x + pad, x + width - pad]);
  const lo = flat ? x + width / 2 - 10 : scale(mark.lo);
  const hi = flat ? x + width / 2 + 10 : scale(mark.hi);

  el('path', {
    d: `M${N(lo)} ${N(y - 5)} V${N(y + 5)} M${N(lo)} ${N(y)} H${N(hi)} M${N(hi)} ${N(y - 5)} V${N(y + 5)}`,
    fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': RULE_WIDTH.hairline + 0.2,
  }, g);

  if (mark.kind === 'point') {
    /* An open index, not a filled dot. A filled round mark means money in this
     * palette and a reading is not money. There is exactly one branch here that
     * reads a central, and a span-only mark cannot reach it: the key is not on
     * the object. */
    el('circle', {
      cx: N(flat ? x + width / 2 : scale(mark.central)), cy: N(y), r: 3.4,
      fill: BONE, stroke: STRUCTURE.stroke, 'stroke-width': 1.4,
    }, g);
  } else {
    /* The span's own mark: the bar is thickened and both ends stay barred, so
     * it cannot be read as a bar from a baseline with a dot somebody forgot. */
    el('path', {
      d: `M${N(lo)} ${N(y)} H${N(hi)}`,
      fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': 3,
    }, g);
  }
  if (title) titled(g, title);
  return g;
}

/**
 * A withheld year, drawn as a positive object.
 *
 * `svg-kit.absenceBlock` is the house form for a documented hole, and it is not
 * used here on purpose: it names the YEARS a hole covers, and the hole here is
 * the year itself. Passing it `[0, 0]` would print "0–0". So this draws the
 * same three things rule 5 asks for — stipple, an iron frame, a printed name —
 * and says what is missing rather than inventing a range for it.
 */
function withheldBlock(parent, tex, { x, y, width, height, note }) {
  const g = layer(parent, { class: 'p2-era-withheld' });
  el('rect', { x, y, width, height, fill: tex.stipple }, g);
  el('rect', { x, y, width, height, fill: 'none', ...PAINT.absence.attrs }, g);
  text(g, {
    x: x + width / 2, y: y + height / 2 + 3.5, value: 'year withheld',
    role: 'label', fill: ZINC_TEXT, anchor: 'middle', size: 9,
  });
  titled(g, `The record withholds permission to place this claim in time. Its reason: ${note}`);
  return g;
}

/* ======================================================================
 * 2 · THE TALLY — what the record holds at this organ, in this era
 *
 * One tick per claim. The tick's form is the source grade, using the project's
 * own grade register: A solid, B ruled, C hatched. A span-only claim is drawn
 * as an open bracket instead of a tick, and a claim the record refuses to place
 * in time is drawn as a stippled square.
 *
 * This is the part of the drawing that actually changes between eras, and every
 * mark in it is a fact about the record rather than an estimate: how much is
 * known here, how well, and how much of it has no middle value.
 * ====================================================================== */

function drawTally(parent, tex, organ, pos) {
  const g = layer(parent, { class: 'p2-era-tally', 'data-organ': organ.organ });
  const n = organ.ticks.length;
  const pitch = Math.min(TALLY.pitch, (pos.tally.width - 6) / Math.max(1, n));
  const startX = pos.cx - (pitch * (n - 1)) / 2;
  const top = pos.tally.y;
  const bottom = pos.tally.y + pos.tally.height;

  organ.ticks.forEach((tick, i) => {
    const x = N(startX + pitch * i);
    if (tick.form === 'withheld') {
      /* An absence, framed. The stipple FILL is a texture; the tick's edge used
       * to be STIPPLE too, at 1.53:1 on Bone, which is a block with no edge on
       * it. It is the same dashed iron frame `withheldBlock` and svg-kit's own
       * `absenceBlock` draw, and the legend under the strip is its printed
       * name. */
      el('rect', {
        x: x - 3.5, y: top + 3, width: 7, height: 10,
        fill: tex.stipple, ...PAINT.absence.attrs, 'stroke-dasharray': null,
      }, g);
      return;
    }
    if (tick.form === 'span') {
      el('path', {
        d: `M${x - 3} ${top} H${x + 3} M${x} ${top} V${bottom} M${x - 3} ${bottom} H${x + 3}`,
        fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': 1,
      }, g);
      return;
    }
    const dash = tick.grade === 'B' ? '2 2' : null;
    const w = tick.grade === 'A' ? 3 : 1.6;
    el('path', {
      d: `M${x} ${top} V${bottom}`, stroke: STRUCTURE.stroke, 'stroke-width': w,
      'stroke-dasharray': dash, fill: 'none',
      'stroke-opacity': tick.grade === 'C' ? 0.55 : 1,
    }, g);
  });

  titled(g, `${organ.field}: ${n} claims in the record — ` +
    `${organ.grades.A} grade A, ${organ.grades.B} grade B, ${organ.grades.C} grade C. ` +
    `${organ.spanOnlyCount} of them have no middle value. ` +
    `${organ.withheldCount} are not placed in time.`);
  return g;
}

/* ======================================================================
 * 3 · THE PLATE — one organ's head, at its fixed position
 * ====================================================================== */

function drawPlate(svg, root, organ, pos, { onSelect, selected }) {
  const box = pos.plate;
  const g = el('g', {
    class: 'p2-era-plate',
    'data-organ': organ.organ,
    'data-field': organ.field,
    'data-selected': String(organ.organ === selected),
    role: 'button',
    tabindex: '0',
    'aria-pressed': String(organ.organ === selected),
    'aria-label': `${organ.field}. ${organ.sentence} Reading: ${organ.headline.reading}. ` +
      `Open this part's panel.`,
  }, root);

  frame(g, { x: box.x, y: box.y, width: box.width, height: box.height, fill: SURFACE.paper });
  text(g, { x: box.x + 9, y: box.y + 18, value: pos.numeral, role: 'chrome', fill: ZINC_TEXT, size: 10 });
  text(g, { x: box.x + 9, y: box.y + 40, value: organ.field, role: 'label', fill: GRAPHITE, size: 11 });
  text(g, { x: box.x + 9, y: box.y + 56, value: pos.organ, role: 'chrome', fill: ZINC_TEXT, size: 9.5 });
  rule(g, { x1: box.x + 9, y1: box.y + 63, x2: box.x + box.width - 9, y2: box.y + 63 });

  drawCaliper(g, organ.headline.mark, {
    x: box.x + 9, y: box.y + 80, width: box.width - 18,
    title: organ.headline.title,
  });

  text(g, {
    x: box.x + 9, y: box.y + 103, role: 'numeral', size: 12,
    fill: GRAPHITE, value: organ.headline.short,
    title: `${organ.headline.reading} · ${organ.headline.unit || 'no unit recorded'}`,
  });

  if (organ.operable) {
    /* The one operable position, marked on the drawing itself so the reader
     * does not have to hunt for the control. */
    el('rect', {
      x: box.x - 3, y: box.y - 3, width: box.width + 6, height: box.height + 6,
      fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': 1, 'stroke-dasharray': '5 3',
    }, g);
  }

  const fire = () => onSelect(organ.organ, g);
  g.addEventListener('click', fire);
  g.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); }
  });
  return g;
}

/* ======================================================================
 * 4 · THE MACHINE — pipes and valves, in iron line work
 * ====================================================================== */

function drawMachine(svg, root, plan, tex) {
  const g = layer(root, { class: 'p2-era-body' });

  for (const seg of channelPaths()) {
    el('path', { d: seg.d, fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': STRUCTURE.width }, g);
  }

  for (const pos of POSITIONS) {
    const part = layer(g, { class: 'p2-era-part', 'data-organ': pos.organ });
    const lead = leaderPath(pos.organ);
    el('path', {
      d: lead.d, fill: 'none', stroke: lead.stroke || STRUCTURE.guide,
      'stroke-width': 1, 'stroke-dasharray': '3 3',
    }, g);
    for (const p of organPaths(pos.organ)) {
      el('path', {
        d: p.d, fill: 'none',
        'data-role': p.role,
        stroke: p.stroke || STRUCTURE.stroke,
        'stroke-width': p.width || STRUCTURE.width,
        'stroke-dasharray': p.dashed ? '4 3' : null,
      }, part);
    }
    titled(part, `${pos.organ}, the ${pos.field} part. ${pos.sentence}`);
  }

  /* THE THREE COLOURED ACCENTS, AND THE WHOLE COLOUR BUDGET OF THE MACHINE.
   *
   * Not one hex is written here. `ACCENTS` in organs.js lists the three so the
   * bench can assert there are three and no more, and `PAINT` beside it holds
   * what each one is drawn in — measured by `assertColourBudget()` at import,
   * which is what this file skipped entirely. */
  const inlet = POSITION.INLET;
  el('circle', { cx: N(inlet.cx), cy: 252, r: 6, class: 'p2-era-slug', ...PAINT.money.attrs }, g);

  const meter = POSITION.METER;
  /* THE NEEDLE, TWICE. Cyan is 2.46:1 on Bone and cannot carry a line on its
   * own; a stroke cannot have a stroke, so the iron goes UNDER it at 4.6px and
   * the cyan sits on top at 2.4px. What a reader sees is a cyan needle in an
   * iron casing, and what holds it off the paper is the iron at 5.12:1. This
   * used to be a bare 2.4px cyan line. */
  const needle = `M${N(meter.cx)} 262 L${N(meter.cx + 26)} 240`;
  el('path', { d: needle, ...PAINT.countLine.under }, g);
  el('path', { d: needle, ...PAINT.countLine.attrs }, g);
  /* And the hub: an open cyan fill with its iron stroke, which is the count's
   * declared second channel. */
  el('circle', { cx: N(meter.cx), cy: 262, r: 3.4, ...PAINT.countHub.attrs }, g);

  /* RUST is the take, and it is ALWAYS hatched — Brass against Rust falls to
   * ΔE2000 7.8 under tritanopia, so hue alone does not separate them. */
  const toll = POSITION.TOLL;
  const stub = el('g', { class: 'p2-era-take' }, g);
  el('rect', {
    x: N(toll.cx - 7), y: 392, width: 14, height: 18,
    fill: tex.hatchBrass, ...PAINT.take.attrs,
  }, stub);
  titled(stub, 'the take: the stub on the tap, where somebody stands between the money and the seller');

  return g;
}

/* ======================================================================
 * 5 · THE OUTPUT PLATE — what the crank moves
 * ====================================================================== */

function renderOutput(host, notch, plan) {
  host.textContent = '';
  const box = h('div', { class: 'p2-era-out-box' }, host);

  h('div', {
    class: 'p2-arch p2-era-out-head',
    text: `${plan.crank.name} · setting ${notch.step + 1} of ${plan.crank.notches.length}`,
  }, box);

  const svg = svgRoot(box, {
    width: 520, height: 100,
    alt: `The output plate. ${notch.reading}.`,
    className: 'p2-era-out-svg',
  });
  const tex = textures(svg, uid('out'));
  frame(svg, { x: 1, y: 1, width: 518, height: 98, fill: SURFACE.paper });
  rule(svg, { x1: 16, y1: 62, x2: 504, y2: 62 });
  drawCaliper(svg, notch.mark, { x: 16, y: 62, width: 488, title: notch.title });
  text(svg, { x: 16, y: 32, value: notch.short, role: 'numeral', size: 17, fill: GRAPHITE });
  text(svg, { x: 504, y: 32, value: `grade ${notch.grade}`, role: 'chrome', fill: ZINC_TEXT, anchor: 'end' });
  text(svg, { x: 16, y: 88, value: shortLabel(notch.unit || 'no unit recorded', 70), role: 'chrome', fill: ZINC_TEXT });

  if (notch.timelineWithheld) {
    /* G8 + G5. The record withholds permission to place this claim in time, so
     * the year is an absence, and an absence is drawn as an object. It is not a
     * blank, and it is not filled in from the source's publication date. */
    withheldBlock(svg, tex, { x: 390, y: 74, width: 114, height: 18, note: notch.withheldNote });
  } else {
    text(svg, { x: 504, y: 88, value: String(notch.year), role: 'chrome', fill: ZINC_TEXT, anchor: 'end' });
  }

  h('p', { class: 'p2-chrome p2-era-out-read', text: notch.reading }, box);
  h('p', { class: 'p2-chrome p2-era-out-id', text: `claim ${notch.id} · ${notch.unit || 'no unit recorded'}` }, box);
  if (notch.timelineWithheld) {
    h('p', {
      class: 'p2-chrome p2-era-out-withheld',
      text: `The record will not place this reading in time. Its reason: ${notch.withheldNote}`,
    }, box);
  }
  return box;
}

/* ======================================================================
 * 6 · THE DESK — one organ's full detail, at one fixed place on the page
 * ====================================================================== */

function renderDesk(host, plan, organKey) {
  const organ = plan.organs.find((o) => o.organ === organKey);
  const pos = POSITION[organKey];
  host.textContent = '';

  h('div', { class: 'p2-arch', text: `${pos.numeral} · ${organ.field} · the ${pos.organ}` }, host);
  h('p', { class: 'p2-prose p2-era-desk-sentence', text: organ.sentence }, host);
  h('p', { class: 'p2-era-desk-read p2-chrome', text: `${organ.headline.reading} — ${organ.headline.unit || 'no unit recorded'}` }, host);
  h('p', {
    class: 'p2-chrome p2-era-desk-why',
    text: `The face reads ${organ.headline.id}: ${organ.headlineBecause}.`,
  }, host);

  if (organ.pools) {
    const pool = h('div', { class: 'p2-era-pools' }, host);
    h('div', { class: 'p2-arch', text: `the money in this era, by type · ${organ.pools.split}` }, pool);
    h('p', {
      class: 'p2-chrome',
      text: 'These four pools sit at fixed places and are never put in order. Their intervals ' +
        'overlap, so an order drawn on the page would say something the record does not.' +
        (organ.pools.note ? ` ${organ.pools.note}` : ''),
    }, pool);
    const grid = h('div', { class: 'p2-era-pool-grid' }, pool);
    for (const item of organ.pools.items) {
      const cell = h('div', { class: 'p2-era-pool', 'data-pool': item.pool }, grid);
      h('div', { class: 'p2-arch', text: item.pool.replace(/_/g, ' ') }, cell);
      h('div', { class: 'p2-num p2-era-pool-fig', text: item.short }, cell);
      h('div', { class: 'p2-chrome', text: `${item.reading}` }, cell);
      h('div', { class: 'p2-chrome', text: `${item.unit || 'no unit recorded'} · grade ${item.grade} · ${item.id}` }, cell);
    }
  }

  const reg = h('table', { class: 'p2-reg p2-era-reg' }, host);
  h('caption', { text: `every claim the record holds at ${organ.field}, in the record's own order` }, reg);
  const head = h('thead', {}, reg);
  const hr = h('tr', {}, head);
  ['claim', 'reading', 'unit', 'grade', 'year'].forEach((c) => h('th', { text: c }, hr));
  const body = h('tbody', {}, reg);
  for (const r of organ.readings) {
    const tr = h('tr', { 'data-form': r.form }, body);
    h('td', { text: r.id }, tr);
    h('td', { text: r.short }, tr);
    h('td', { text: r.unit || '—' }, tr);
    h('td', { text: r.grade || '—' }, tr);
    h('td', { text: r.timelineWithheld ? 'withheld' : String(r.year) }, tr);
  }

  const det = h('details', { class: 'p2-era-quote' }, host);
  h('summary', { class: 'p2-arch', text: `the record's own words on ${organ.field}` }, det);
  h('p', { class: 'p2-chrome p2-era-quote-body', text: organ.summary }, det);
  return organ;
}

/* ======================================================================
 * 7 · RENDER
 * ====================================================================== */

/**
 * Draw one era machine.
 *
 *   container  a DOM node, emptied
 *   plan       a SEALED plan from planEra(); nothing else is accepted
 *   options    { selected, teach, onFirstCrank, onRingReady }
 *
 * Returns `{ plan, root, svg, select, crankTo, state }`.
 */
export function renderEraMachine(container, plan, options = {}) {
  if (!container) throw new EraRenderError('renderEraMachine needs a container.', container);
  if (!isEraPlan(plan)) {
    throw new EraRenderError(
      'renderEraMachine was handed something that is not a plan planEra() minted. The era record ' +
      'never reaches this file: a renderer that can read the record can read a ci80 and print a ' +
      'middle value the library refused. "Sealed" is not enough on its own either — the seal ' +
      'names the planner that applied it, because a caller who could seal a plan with their own ' +
      'empty revalidator could hand-type a figure onto a plan of otherwise real marks.',
      plan && typeof plan === 'object' ? Object.keys(plan) : plan,
    );
  }
  /* Re-validated on content, every render — the same posture the chart layer
   * takes. A seal proves where a plan came from, not what it now contains. */
  openEraPlan(plan, `the era ${plan.era} machine`);

  container.textContent = '';
  const root = h('section', {
    class: 'p2-era', 'data-era': String(plan.era),
    'aria-label': `Era ${plan.era}, ${plan.name}`,
  }, container);

  /* --- head --- */
  const head = h('header', { class: 'p2-era-head' }, root);
  h('div', { class: 'p2-arch', text: `era ${plan.era} · ${plan.years}` }, head);
  h('h2', { class: 'p2-era-title', text: plan.name }, head);
  h('p', { class: 'p2-prose p2-era-alt', text: plan.alt }, head);

  /* --- the drawing --- */
  const board = h('div', { class: 'p2-era-board p2-scrollx' }, root);
  const svg = svgRoot(board, {
    width: VIEW.width, height: VIEW.height,
    alt: plan.alt,
    className: 'p2-era-svg',
  });
  /* svgRoot always writes "0 0 w h". The era machine's box starts above zero,
   * so the pull ring's teaching label has somewhere to go that is not on top of
   * an organ. `VIEW_BOX` is the one place that string is written. */
  svg.setAttribute('viewBox', VIEW_BOX);
  const tex = textures(svg, uid('era'));

  const bodyLayer = layer(svg, { class: 'p2-era-machine' });
  drawMachine(svg, bodyLayer, plan, tex);

  const tallyLayer = layer(svg, { class: 'p2-era-tallies' });
  const plateLayer = layer(svg, { class: 'p2-era-plates' });

  const state = {
    selected: options.selected || OPERABLE_ORGAN,
    notch: 0,
    cranked: false,
    plates: new Map(),
  };

  const deskHost = h('div', { class: 'p2-era-desk' });
  const select = (organKey) => {
    state.selected = organKey;
    for (const [key, node] of state.plates) {
      node.setAttribute('data-selected', String(key === organKey));
      node.setAttribute('aria-pressed', String(key === organKey));
    }
    renderDesk(deskHost, plan, organKey);
  };

  for (const pos of POSITIONS) {
    const organ = plan.organs[pos.index];
    const node = drawPlate(svg, plateLayer, organ, pos, { onSelect: select, selected: state.selected });
    state.plates.set(pos.organ, node);
    drawTally(tallyLayer, tex, organ, pos);
  }

  /* the tally legend, once, under the strip */
  text(svg, {
    x: 16, y: TALLY.top + TALLY.height + 22, role: 'chrome', fill: ZINC_TEXT, size: 10,
    value: 'one tick per claim the record holds here · solid A · ruled B · faint C · ' +
      'bracket = no middle value · stipple = not placed in time',
  });

  /* --- the crank bench --- */
  const bench = h('div', { class: 'p2-era-bench' }, root);
  h('div', { class: 'p2-arch', text: `the control · ${plan.crank.name}` }, bench);
  h('p', { class: 'p2-prose p2-era-bench-lede', text: crankLede(plan) }, bench);

  const ctl = h('div', { class: 'p2-ctl p2-era-ctl' }, bench);
  const rocker = h('div', { class: 'p2-rocker p2-era-notches', role: 'group', 'aria-label': `${plan.crank.name}: ${plan.crank.notches.length} settings` }, ctl);
  const outHost = h('div', { class: 'p2-era-out' }, bench);

  const handleArm = svg.querySelector('.p2-era-part[data-organ="RULE"] path[data-role="handle arm"]');

  const notchButtons = plan.crank.notches.map((notch) => h('button', {
    type: 'button',
    class: 'p2-era-notch',
    'data-step': String(notch.step),
    'aria-pressed': 'false',
    title: `${notch.unit || 'no unit recorded'} — claim ${notch.id}`,
    'aria-label': `Setting ${notch.step + 1}: ${notch.unit || 'no unit recorded'}`,
    text: String(notch.step + 1),
  }, rocker));

  /* The unturned state. Era 1 teaches the verb, so the output plate says what
   * to do and shows no reading at all until the reader's own hand moves it.
   * Every era starts here: a machine that has already answered has nothing left
   * to teach about who caused the answer. */
  const showUnturned = () => {
    outHost.textContent = '';
    const box = h('div', { class: 'p2-era-out-box p2-era-out-box--empty' }, outHost);
    h('div', { class: 'p2-arch', text: `${plan.crank.name} · not yet turned` }, box);
    h('p', { class: 'p2-prose', text: 'Turn the handle. Pick a setting and the machine will show you what that rule priced.' }, box);
  };
  showUnturned();

  /**
   * Turn the handle to one setting.
   *
   * Returns the motion handle with one field added: `applied`, a promise that
   * settles the instant the output has changed — after CRANK's 40ms hold, and
   * WITHOUT waiting for the 320ms travel to finish.
   *
   * The two are not the same question and the difference is not academic.
   * Chrome does not resolve an animation's `finished` promise while the tab is
   * in the background, so a caller that waits on the travel to know whether the
   * output moved waits forever behind a hidden tab. `applied` answers "has the
   * machine responded", which is what a test bench, a screen-reader
   * announcement and the teaching sequence all actually need.
   */
  const crankTo = (step, inputEl) => {
    const notch = plan.crank.notches[step];
    if (!notch) throw new EraRenderError(`era ${plan.era} has no setting ${step}.`, step);
    const input = inputEl || notchButtons[step];
    const wasFirst = !state.cranked;
    let markApplied;
    const applied = new Promise((res) => { markApplied = res; });

    const handle = crank({
      input,
      output: outHost,
      apply() {
        state.notch = step;
        state.cranked = true;
        notchButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === step)));
        renderOutput(outHost, notch, plan);
        /* CUT, and only here. Moving between two settings of one era's price
         * rule crosses a definitional seam — "percent of gross billings" and
         * "USD per agate line" are two different rulers — and a seam is the one
         * place this project changes a label with no transition at all. */
        cut(() => {
          const unitLine = outHost.querySelector('.p2-era-out-read');
          if (unitLine) unitLine.classList.add('p2-cut');
        });
        if (handleArm) {
          const angle = plan.crank.notches.length > 1
            ? -32 + (64 * step) / (plan.crank.notches.length - 1)
            : 0;
          const p = POSITION.RULE;
          handleArm.setAttribute('transform', `rotate(${angle.toFixed(1)} ${N(p.cx + 62)} 274)`);
        }
        if (wasFirst && typeof options.onFirstCrank === 'function') options.onFirstCrank(state);
        markApplied(notch);
      },
    });
    return Object.assign({}, handle, { applied });
  };

  notchButtons.forEach((btn, i) => btn.addEventListener('click', () => crankTo(i, btn)));

  h('p', { class: 'p2-chrome p2-era-because', text: plan.crank.because + '.' }, bench);
  h('p', { class: 'p2-chrome p2-era-why', text: plan.crank.why }, bench);

  /* --- the desk, at one fixed place --- */
  root.appendChild(deskHost);
  select(state.selected);

  /* --- registers --- */
  const foot = h('div', { class: 'p2-era-foot' }, root);

  if (plan.verdictStamps.length) {
    const box = h('div', { class: 'p2-note-box' }, foot);
    h('div', { class: 'p2-arch', text: `verdict register · ${plan.verdictStamps.length} claims in this machine were changed after they were written` }, box);
    const t = h('table', { class: 'p2-reg' }, box);
    const hr = h('tr', {}, h('thead', {}, t));
    ['claim', 'verdict', 'what it means'].forEach((c) => h('th', { text: c }, hr));
    const tb = h('tbody', {}, t);
    for (const s of plan.verdictStamps) {
      const tr = h('tr', {}, tb);
      h('td', { text: s.id }, tr);
      h('td', { text: s.verdict }, tr);
      h('td', { text: s.sentence }, tr);
    }
  }

  const ev = h('div', { class: 'p2-note-box p2-era-events' }, foot);
  h('div', { class: 'p2-arch', text: `what happened · ${plan.events.length} dated events` }, ev);
  const ol = h('ol', { class: 'p2-era-event-list' }, ev);
  for (const e of plan.events) {
    const li = h('li', {}, ol);
    h('span', { class: 'p2-chrome p2-era-event-date', text: e.date }, li);
    h('span', { class: 'p2-era-event-title', text: e.title }, li);
    h('p', { class: 'p2-prose p2-era-event-desc', text: e.desc }, li);
    if (e.reading) {
      h('p', {
        class: 'p2-chrome p2-era-event-read',
        text: `${e.reading.reading} — ${e.reading.unit || 'no unit recorded'} · ${e.reading.id}`,
      }, li);
    }
  }

  if (plan.boundary) {
    const b = h('div', { class: 'p2-note-box' }, foot);
    h('div', { class: 'p2-arch', text: 'where this era starts and stops' }, b);
    h('p', { class: 'p2-chrome', text: plan.boundary }, b);
  }

  return { plan, root, svg, select, crankTo, state, notchButtons, deskHost };
}

/** The one sentence that tells the reader what the handle does in this era. */
function crankLede(plan) {
  const n = plan.crank.notches.length;
  return `This machine has one handle. It sets the price rule, and the record holds ${n} ` +
    `settings for it in this era. Turn it and the plate below shows what that rule priced.`;
}

export { drawCaliper, crankLede };
