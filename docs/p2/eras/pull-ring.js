/* docs/p2/eras/pull-ring.js — THE PULL RING, ITS TEACHING SEQUENCE, AND THE DRAWER
 *
 * Team B3, with the ring and its four states from DESIGN.md problem 3.
 *
 * WHAT IT IS. A small ring drawn inside every organ, in every era. Pulling one
 * lifts that organ out of all seven machines and lays them side by side. It is
 * this project's cross-era comparison tool.
 *
 * WHY THE TEACHING MOMENT IS HALF THE WORK. Five design architects independently
 * expected readers to miss this control. DESIGN.md answers with "taught once in
 * chapter 1, in a moment the reader cannot skip, then permanently visible", and
 * costs it at "26 pixels of every screen forever, and a second verb beside
 * CRANK". So the teaching is not a nicety bolted on afterwards — it is the
 * reason the feature is worth its price, and it has its own test page.
 *
 * THE FOUR STATES
 *
 *   1 REST     eight rings, drawn, quiet. Nothing has happened yet.
 *   2 TUG      once, and only once in the whole piece: the ring on the operable
 *              organ tugs itself ten pixels and springs back, straight after the
 *              reader's first crank — while their hand is still the cause of the
 *              last thing that moved. `motion.js`'s PULL verb owns the timing.
 *   3 NAMED    a leader and one sentence beside that ring, saying what a ring
 *              does. It stays until the reader pulls one.
 *   4 LEARNED  the sentence retires. The rings stay, forever, at 26px each.
 *
 * The state is kept in `sessionStorage` under one key, because PULL's own record
 * says "never more than one teaching tug in the whole piece" and a reader who
 * scrolls back to era 1 has already been taught.
 *
 * WHAT THE DRAWER MUST NOT DO. Seven eras do not share a ruler: era 1's SCALE
 * pools are shares of a total, era 2's are dollars of the day, era 7's are
 * dollars in billions. So the drawer is seven separate cells on seven separate
 * axes, each printing its own unit, and it says so in a sentence the reader
 * cannot miss. That is the same argument the Toll Plate makes about the
 * middleman's cut, applied to every organ.
 */

import { pullTug, pullOpen, isReduced, VERBS } from '../lib/motion.js';
import { GRAPHITE, ZINC_TEXT, SURFACE, BONE } from '../lib/tokens.js';
import { el, h, svgRoot, layer, titled, text, rule, frame, shortLabel } from '../charts/svg-kit.js';
import { openDrawerPlan, isDrawerPlan } from './era-plan.js';
import { POSITION, POSITIONS, OPERABLE_ORGAN, HEADROOM, STRUCTURE } from './organs.js';
import { ERA_COUNT_WORD } from './era-records.js';
import { drawCaliper } from './era-machine.js';

const N = (v) => Number(Number(v).toFixed(2));

/**
 * HOW MANY MACHINES A RING LIFTS A PART OUT OF, IN WORDS.
 *
 * This file used to spell "seven" into three reader-facing strings — the ring's
 * accessible name, its tooltip and the teaching sentence — and the drawer beside
 * them spelled it into two more. A number written into prose is a second copy of
 * a number. `ERA_COUNT_WORD` is derived from `ERA_COUNT` in `era-records.js`,
 * which is the file that decides how many eras there are and refuses a set that
 * is not all of them. The drawer's own count comes from the plan, which derives
 * it from the cells it holds.
 */
const MACHINES = `all ${ERA_COUNT_WORD} machines`;

/**
 * Wait for a motion verb, but never longer than its own declared duration plus
 * a margin.
 *
 * WHY THIS IS NOT BELT AND BRACES. Chrome does not resolve an animation's
 * `finished` promise while the tab is in the background. A teaching sequence
 * that chains its next state onto `finished` therefore stops dead if the reader
 * switches tabs mid-tug and comes back — the ring has visibly sprung back and
 * the sentence never arrives. The verb still owns the timing; this only puts a
 * ceiling on how long the sequence will wait for it.
 */
function settled(handle, ms) {
  const timer = new Promise((res) => setTimeout(res, ms));
  return Promise.race([Promise.resolve(handle && handle.finished).catch(() => {}), timer]);
}

export const TEACH_KEY = 'p2-pull-ring-taught';
export const STATES = Object.freeze(['REST', 'TUG', 'NAMED', 'LEARNED']);

export class PullRingError extends Error {
  constructor(message, detail) { super(message); this.name = 'PullRingError'; this.detail = detail; }
}

/* ======================================================================
 * 1 · THE TEACHING STATE
 * ====================================================================== */

function readStored() {
  try { return sessionStorage.getItem(TEACH_KEY); } catch (_) { return null; }
}
function writeStored(value) {
  try { sessionStorage.setItem(TEACH_KEY, value); } catch (_) { /* private mode; the ring still works */ }
}

/** The teaching state machine. One per page; it reads and writes one key. */
export function createTeacher({ onChange = () => {} } = {}) {
  let state = readStored() === 'LEARNED' ? 'LEARNED' : 'REST';
  const listeners = new Set([onChange]);
  const set = (next) => {
    if (!STATES.includes(next)) throw new PullRingError(`"${next}" is not a teaching state.`, next);
    if (STATES.indexOf(next) <= STATES.indexOf(state)) return state;   // never goes backwards
    state = next;
    if (state === 'LEARNED') writeStored('LEARNED');
    listeners.forEach((fn) => fn(state));
    return state;
  };
  return {
    get state() { return state; },
    /** True once the reader has pulled a ring. The gate a chapter can hold on. */
    get taught() { return state === 'LEARNED'; },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    tug() { return set('TUG'); },
    name() { return set('NAMED'); },
    learn() { return set('LEARNED'); },
    /** Test-only. The demo page's reset button uses it; nothing else should. */
    reset() {
      state = 'REST';
      try { sessionStorage.removeItem(TEACH_KEY); } catch (_) { /* nothing to clear */ }
      listeners.forEach((fn) => fn(state));
      return state;
    },
  };
}

/* ======================================================================
 * 2 · THE RING
 * ====================================================================== */

/**
 * Draw one ring inside one organ's plate.
 *
 * The hit box is 44px square and invisible, because `GRID.minTouch` is 44 and a
 * 14px ring is not a target. The ring itself is 26px of screen — the price
 * DESIGN.md wrote down.
 */
function drawRing(parent, pos, { onPull }) {
  const g = el('g', {
    class: 'p2-ring',
    'data-organ': pos.organ,
    'data-field': pos.field,
    role: 'button',
    tabindex: '0',
    'aria-label': `Pull the ${pos.field} ring. It lifts this part out of ${MACHINES}.`,
  }, parent);

  el('rect', {
    x: N(pos.ringCx - 22), y: N(pos.ringCy - 22), width: 44, height: 44,
    fill: BONE, 'fill-opacity': 0.01, class: 'p2-ring-hit',
  }, g);

  const body = el('g', { class: 'p2-ring-body' }, g);
  el('path', {
    d: `M${N(pos.ringCx)} ${N(pos.ringCy + 7)} V${N(pos.ringCy + 13)}`,
    stroke: STRUCTURE.stroke, 'stroke-width': 1.5, fill: 'none',
  }, body);
  el('circle', {
    cx: N(pos.ringCx), cy: N(pos.ringCy), r: 7,
    fill: 'none', stroke: STRUCTURE.stroke, 'stroke-width': 1.5,
  }, body);
  titled(g, `${pos.field}: pull to lift this part out of ${MACHINES}.`);

  const fire = (e) => { e.preventDefault(); e.stopPropagation(); onPull(pos.field, body); };
  g.addEventListener('click', fire);
  g.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') fire(e);
  });
  return { group: g, body };
}

/**
 * Install all eight rings on one machine's SVG.
 *
 * Returns `{ rings, teachAfterFirstCrank, retire }`. `teachAfterFirstCrank` is
 * what the era-1 machine calls from its `onFirstCrank` hook: it fires the one
 * tug and paints the one sentence. Every other era passes `teaching: false` and
 * gets rings with no tug at all.
 */
export function installPullRings(svg, { teacher, onPull, teaching = false }) {
  const plateLayer = svg.querySelector('.p2-era-plates') || svg;
  const ringLayer = layer(plateLayer, { class: 'p2-era-rings' });
  const rings = new Map();

  for (const pos of POSITIONS) {
    const ring = drawRing(ringLayer, pos, {
      onPull: (field, body) => {
        teacher.learn();
        onPull(field, body);
      },
    });
    rings.set(pos.field, ring);
    if (isReduced()) ring.body.setAttribute('data-pull', 'proud');
  }

  /* The one sentence, drawn beside the operable organ's ring. It is an SVG
   * label rather than a tooltip because a tooltip is not on the page for a
   * reader who never hovers, and this is the control five architects expected
   * readers to miss. */
  const namedPos = POSITION[OPERABLE_ORGAN];
  const label = el('g', { class: 'p2-ring-teach', 'data-shown': 'false' }, ringLayer);
  /* The label lives in the headroom band ABOVE the plate row, with a leader
   * dropping into the plate to touch the ring. It never sits on top of an
   * organ: eight fixed positions is the whole design, and a teaching aid that
   * covers one of them for its first thirty seconds teaches the wrong lesson. */
  const boxX = N(namedPos.ringCx - 436);
  frame(label, { x: boxX, y: HEADROOM.top, width: 446, height: HEADROOM.height, fill: SURFACE.paper });
  text(label, {
    x: boxX + 12, y: HEADROOM.top + HEADROOM.height / 2 + 4,
    value: `Pull a ring. It lifts that part out of ${MACHINES}.`,
    role: 'chrome', fill: GRAPHITE, size: 11,
  });
  el('path', {
    d: `M${N(namedPos.ringCx)} ${HEADROOM.top + HEADROOM.height} V${N(namedPos.ringCy - 8)}`,
    stroke: STRUCTURE.stroke, 'stroke-width': 1, 'stroke-dasharray': '3 3', fill: 'none',
  }, label);

  const paint = (state) => {
    label.setAttribute('data-shown', String(state === 'NAMED'));
    for (const [, ring] of rings) {
      ring.group.setAttribute('data-teach', state);
    }
  };
  teacher.on(paint);
  paint(teacher.state);

  return {
    rings,
    label,
    /**
     * THE MOMENT THE READER CANNOT SKIP. Called from era 1's first crank, so
     * the tug lands while the reader's own hand is still the cause of the last
     * thing that moved on the page. Fires once in the whole piece; PULL's own
     * record makes more than one a rule violation, not a preference.
     */
    teachAfterFirstCrank() {
      if (!teaching || teacher.state !== 'REST') return null;
      const ring = rings.get(POSITION[OPERABLE_ORGAN].field);
      teacher.tug();
      const handle = pullTug(ring.body);
      /* NAMED follows the tug rather than replacing it, so the reader sees the
       * movement first and the words second. In reduced motion `pullTugReduced`
       * leaves the ring resting 3px proud and returns immediately, so the
       * sentence arrives at once — which is the correct alternative encoding,
       * not a shortened one. */
      settled(handle, VERBS.PULL.tugOut + VERBS.PULL.hold + VERBS.PULL.tugBack + 120)
        .then(() => teacher.name());
      return handle;
    },
  };
}

/* ======================================================================
 * 3 · THE DRAWER
 * ====================================================================== */

/** One cell: one organ, one era, on its own axis, with its own unit printed. */
function drawCell(host, cell, field) {
  const box = h('article', { class: 'p2-drawer-cell', 'data-era': String(cell.era) }, host);
  h('div', { class: 'p2-arch', text: `era ${cell.era} · ${cell.name}` }, box);
  h('div', { class: 'p2-chrome p2-drawer-years', text: cell.years }, box);

  const svg = svgRoot(box, {
    width: 240, height: 62,
    alt: `Era ${cell.era}: ${cell.headline.reading}.`,
    className: 'p2-drawer-svg',
  });
  rule(svg, { x1: 8, y1: 40, x2: 232, y2: 40 });
  drawCaliper(svg, cell.headline.mark, { x: 8, y: 40, width: 224, title: cell.headline.title });
  text(svg, { x: 8, y: 20, value: cell.headline.short, role: 'numeral', size: 13, fill: GRAPHITE });
  text(svg, {
    x: 232, y: 20, value: `grade ${cell.headline.grade}`,
    role: 'chrome', fill: ZINC_TEXT, anchor: 'end', size: 9.5,
  });
  /* The unit is cut to what fits the cell and printed in full underneath. It is
   * never paraphrased: `shortLabel` cuts at the record's own structural break
   * and adds an ellipsis, because a unit is a fact about what the number
   * measures and a rewritten one is a different number. */
  text(svg, {
    x: 8, y: 57, value: shortLabel(cell.headline.unit || 'no unit recorded', 34),
    role: 'chrome', fill: ZINC_TEXT, size: 9,
    title: cell.headline.unit || 'no unit recorded',
  });

  h('p', { class: 'p2-chrome p2-drawer-unit', text: cell.headline.unit || 'no unit recorded' }, box);
  h('p', { class: 'p2-chrome p2-drawer-read', text: cell.headline.reading }, box);
  h('p', {
    class: 'p2-chrome p2-drawer-count',
    text: `${cell.claimCount} claims here · A ${cell.grades.A} · B ${cell.grades.B} · C ${cell.grades.C}`,
  }, box);

  if (cell.pools) {
    const pools = h('div', { class: 'p2-drawer-pools' }, box);
    h('div', { class: 'p2-arch', text: `by money type · ${cell.pools.split}` }, pools);
    for (const item of cell.pools.items) {
      const row = h('div', { class: 'p2-drawer-pool', 'data-unchanged': String(!!item.unchanged) }, pools);
      h('span', {
        class: 'p2-chrome p2-drawer-pool-name',
        text: item.pool.replace(/_/g, ' ') + (item.unchanged ? ' (same under both rules)' : ''),
      }, row);
      h('span', { class: 'p2-num p2-drawer-pool-fig', text: item.short, title: item.reading }, row);
    }
    h('p', {
      class: 'p2-chrome',
      text: `These sit at fixed places and are never put in order.${cell.pools.note ? ` ${cell.pools.note}` : ''}`,
    }, pools);
  }
  return box;
}

/**
 * Build the drawer once. It lives at the bottom of the page, closed, and every
 * ring on every machine opens it.
 */
export function createDrawer(host) {
  const root = h('div', {
    class: 'p2-drawer', role: 'dialog', 'aria-modal': 'false',
    /* Empty, so it names no count at all. The moment a plan arrives, both the
     * title and this label are taken from the plan, which derives them from the
     * cells it actually holds. The drawer never spells a number of its own. */
    'aria-label': 'No machine part has been lifted out yet', hidden: 'hidden',
  }, host);
  const inner = h('div', { class: 'p2-drawer-inner' }, root);
  const head = h('div', { class: 'p2-drawer-head' }, inner);
  const title = h('div', { class: 'p2-arch p2-drawer-title', text: 'no part lifted yet' }, head);
  const close = h('button', { type: 'button', class: 'p2-drawer-close', text: 'close' }, head);
  const lede = h('p', { class: 'p2-prose p2-drawer-lede' }, inner);
  const ruler = h('p', { class: 'p2-chrome p2-drawer-ruler' }, inner);
  const seam = h('p', { class: 'p2-chrome p2-drawer-seam' }, inner);
  const cells = h('div', { class: 'p2-drawer-cells' }, inner);
  const stamps = h('div', { class: 'p2-drawer-stamps' }, inner);

  let open = false;
  const setOpen = (next) => {
    open = next;
    if (next) {
      /* unhidden BEFORE the verb runs: a hidden element has no box, so the
       * travel would be skipped and the drawer would appear rather than open. */
      root.hidden = false;
      pullOpen(root, { open: true });
      close.focus();
    } else {
      const handle = pullOpen(root, { open: false });
      settled(handle, VERBS.PULL.duration + 120).then(() => { if (!open) root.hidden = true; });
    }
    return open;
  };
  close.addEventListener('click', () => setOpen(false));
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  return {
    root,
    get isOpen() { return open; },
    close: () => setOpen(false),
    /**
     * Show one cross-era plan. Only a SEALED plan from `planCrossEra` is
     * accepted, and it is re-validated on content every time it arrives.
     */
    show(plan) {
      if (!isDrawerPlan(plan)) {
        throw new PullRingError(
          'the drawer was handed something that is not a plan planCrossEra() minted. The seven ' +
          'era records never reach this file; what arrives is marks and strings. A single-era ' +
          'plan is refused here too: the seal names its planner, and these are two planners.',
          plan && typeof plan === 'object' ? Object.keys(plan) : plan,
        );
      }
      openDrawerPlan(plan, `the ${plan.field} drawer`);

      /* THE TITLE IS THE PLAN'S, NOT THIS FILE'S. It used to be built here and
       * it spelled "seven machines" into a drawer that would render however many
       * cells it was handed. `planCrossEra` derives the title, the accessible
       * name and the alt sentence from the cells, refuses a record set that is
       * not all seven eras, and re-derives all three on re-entry — which
       * `openDrawerPlan` above has just run. */
      title.textContent = plan.title;
      root.setAttribute('aria-label', plan.ariaLabel);
      lede.textContent = plan.sentence;
      ruler.textContent = plan.rulerNote;
      seam.textContent = plan.seamNote || '';
      seam.hidden = !plan.seamNote;

      cells.textContent = '';
      for (const cell of plan.cells) drawCell(cells, cell, plan.field);

      stamps.textContent = '';
      if (plan.verdictStamps.length) {
        h('div', {
          class: 'p2-arch',
          text: `verdict register · ${plan.verdictStamps.length} claims in this drawer were changed after they were written`,
        }, stamps);
        const t = h('table', { class: 'p2-reg' }, stamps);
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
      setOpen(true);
      return plan;
    },
  };
}
