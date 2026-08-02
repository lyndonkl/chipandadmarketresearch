/**
 * `docs/p2/access/text-path.js` — the text-only version of the whole piece.
 *
 * Team B8 (`p2-ad-market/BUILD-PLAN.md`). Direction: The Bench.
 *
 * THE STANDARD THIS HOLDS ITSELF TO is the one `../lib/motion.js` set for
 * reduced motion: **a complete alternative encoding, not a disabled state.**
 * Turning the drawings off must not turn the argument off with them. A reader
 * who never sees a single drawing has to reach the same conclusions, in the
 * same order, from the same numbers.
 *
 * Three things follow from that, and they are the whole design.
 *
 * 1 · THE CONTROLS STAY. Text mode hides the drawings and nothing else. Every
 *     crank, rocker, slider, drum and ring is still there, still keyboard
 *     operable, and the text under it is rebuilt when the reader moves one. An
 *     instrument reduced to a paragraph is a demonstration; this stays an
 *     instrument.
 *
 * 2 · THE FINDING COMES FROM THE DATA LAYER. Each region prints the authored
 *     sentence from `p2-ad-market/data/visuals.json`, which carries no digit
 *     and has cleared all four readability gates per visual.
 *
 * 3 · THE FIGURES COME FROM THE DRAWING'S OWN ACCESSIBLE NAMES. Not from a
 *     second copy, and not from arithmetic done here. There is NO ARITHMETIC IN
 *     THIS FILE AT ALL. Every number in a text table is a string the component
 *     already put on the drawing, re-derived from its own minted mark by the
 *     guard in that component. So the picture and its text cannot carry
 *     different numbers — they are the same strings.
 *
 * That last one is the mechanism behind a lesson this project paid for twice:
 * a drawing must agree with its own accessible name. Here the text path IS the
 * accessible name, so a drawing that disagrees with it disagrees with what the
 * reader is reading, in the same view, where somebody sees it.
 */

import {
  everyVisual, getVisual, altSentence, declaredVisuals,
  assertEveryDrawingDeclared, VISUAL_ATTR, VisualsError,
} from './visuals.js';

/* ------------------------------------------------------------------ *
 * 1 · THE MODE
 *
 * Precedence: setTextMode() -> ?text= in the URL -> sessionStorage -> off.
 * The resolved mode is stamped on <html data-p2-text> with data-p2-text-source
 * beside it, so it is visible in devtools. Same shape as motion.js's, and
 * deliberately so: a reader who has learned one toggle has learned both.
 *
 * There is NO operating-system signal for "I want text instead of pictures",
 * the way `prefers-reduced-motion` is one for motion. So this mode is always
 * the reader's explicit choice, and the toggle is always on the page rather
 * than only in a URL a reader would have to be told about.
 * ------------------------------------------------------------------ */

const MODE_KEY = 'p2-text-mode';
const MODES = ['off', 'on'];
let _forced = null;
const _listeners = new Set();

function readUrlMode() {
  if (typeof location === 'undefined') return null;
  try {
    const asked = new URL(location.href).searchParams.get('text');
    if (asked === 'on' || asked === '1' || asked === 'only') return 'on';
    if (asked === 'off' || asked === '0') return 'off';
  } catch { /* a URL we cannot parse is not a preference */ }
  return null;
}

function readStoredMode() {
  try {
    const v = sessionStorage.getItem(MODE_KEY);
    return MODES.includes(v) ? v : null;
  } catch { return null; }
}

export function textMode() {
  if (_forced) return _forced;
  return readUrlMode() || readStoredMode() || 'off';
}

export function isTextOnly() {
  return textMode() === 'on';
}

function modeSource() {
  if (_forced) return 'set';
  if (readUrlMode()) return 'url';
  if (readStoredMode()) return 'session';
  return 'default';
}

/** Force the mode, or pass null to hand control back to the URL and session. */
export function setTextMode(mode) {
  if (mode !== null && !MODES.includes(mode)) {
    throw new VisualsError(
      'setTextMode', 'NOT A MODE',
      `"${mode}" is not one of ${MODES.join(', ')}.`,
      'setTextMode("on"), setTextMode("off"), or setTextMode(null) to release it');
  }
  _forced = mode;
  if (mode) { try { sessionStorage.setItem(MODE_KEY, mode); } catch { /* private mode */ } }
  applyMode();
  return textMode();
}

function applyMode() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const mode = textMode();
  root.setAttribute('data-p2-text', mode);
  root.setAttribute('data-p2-text-source', modeSource());
  for (const fn of _listeners) fn(mode);
}

export function onTextModeChange(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

/** Call once, as early as possible, exactly like `initMotion()`. */
export function initTextPath() {
  applyMode();
  return textMode();
}

/* ------------------------------------------------------------------ *
 * 2 · READING A DRAWING BACK OUT AS TEXT
 *
 * `../auction/bench.js` exports `domSentences`, and `../toll/toll-plate.js`
 * wrote its own rather than import it, for a reason this team shares: pulling
 * in the auction bench to borrow a tree walk loads the engine, the ten
 * scenarios and the band onto a page that has none of them. What is duplicated
 * is a traversal, not a decision and not a number.
 * ------------------------------------------------------------------ */

/**
 * Every string one drawing says, in document order, de-duplicated.
 *
 * `<title>` is the accessible name of the element it sits in. `<text>` is the
 * figure printed on the face of the drawing. Both are read, because a reader on
 * this path needs the label AND the number, and the components put them in
 * different places.
 */
export function drawingReadings(svg) {
  const out = [];
  const seen = new Set();
  const push = (raw) => {
    const value = String(raw == null ? '' : raw).replace(/\s+/g, ' ').trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    out.push(value);
  };
  /* A CONTROL'S CURRENT VALUE IS A READING, and it lives on the root rather than on a child.
   * The door's drum says "5 of the 6 notches are still open to you, 1 sits under the rival's
   * bid" in its own `aria-valuetext`. A screen reader speaks that on focus. The walk below only
   * ever looked at descendants, so a reader in text mode got the shaded ground and the rival's
   * standing bid and never got the count — the one number that says how much of the drum the
   * rival has taken off the table. */
  if (svg.getAttribute) {
    push(svg.getAttribute('aria-valuetext'));
  }
  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType !== 1) continue;
      const tag = (child.tagName || '').toLowerCase();
      if (tag === 'title' || tag === 'desc' || tag === 'text') push(child.textContent);
      else walk(child);
      if (tag === 'text') continue;      // a <text> has no element children worth reading
      if (child.hasAttribute && child.hasAttribute('aria-label')) {
        push(child.getAttribute('aria-label'));
      }
    }
  };
  walk(svg);
  return out;
}

/**
 * The whole text block for one declared region.
 *
 * Returns a plain object rather than a DOM node, so the same function serves
 * the in-page toggle, the standalone text-only page and the test bench. Nothing
 * here touches the document.
 *
 * AN EMPTY BLOCK IS A FAILURE, NOT A PASS. A region whose drawings say nothing
 * gives a reader on this path a heading and a silence, and `[].every()` being
 * true is a mistake this project has already paid for once. So the block
 * carries `vacuous` and a named reason, and `renderTextBlock` draws that reason
 * as a positive object — DESIGN.md rule 5, applied to prose.
 */
export function textBlockFor(id, region) {
  const row = getVisual(id);
  /* ONLY THE DRAWINGS THIS REGION OWNS. Regions nest: THE BAND is its own
   * visual and it is drawn inside the auction panel, which is another. A walk
   * that took every descendant would put the band's readings under the panel's
   * finding as well as its own, and the reader would meet the same numbers
   * twice under two different claims about what they mean. The nearest declared
   * ancestor owns a drawing, which is the same rule `closest()` gives the
   * assert. */
  const drawings = region
    ? [...region.querySelectorAll('[data-alt-source]')]
      .filter((svg) => svg.closest(`[${VISUAL_ATTR}]`) === region)
    : [];
  const parts = drawings.map((svg) => ({
    name: svg.getAttribute('aria-label') || '',
    generated: svg.getAttribute('data-alt-source') === 'generated-by-chart',
    readings: drawingReadings(svg),
  }));
  const readings = parts.reduce((n, p) => n + p.readings.length, 0);
  return Object.freeze({
    id: row.id,
    shows: row.shows,
    finding: row.finding,
    alt: altSentence(row.id),
    chapter: row.chapter,
    order: row.order,
    component: row.component,
    drawings: Object.freeze(parts.map(Object.freeze)),
    readings,
    vacuous: drawings.length === 0 || readings === 0,
    vacuousReason:
      drawings.length === 0
        ? 'this region holds no drawing, so there is nothing to read back'
        : readings === 0
          ? 'the drawings in this region carry no titles and no printed figures, ' +
            'so the text path has the authored sentence and no readings'
          : null,
  });
}

/* ------------------------------------------------------------------ *
 * 3 · DRAWING THE BLOCK
 * ------------------------------------------------------------------ */

function h(tag, attrs = {}, parent = null) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === 'text') node.textContent = String(v);
    else node.setAttribute(k, String(v));
  }
  if (parent) parent.appendChild(node);
  return node;
}

/**
 * Build the text block's DOM. Idempotent per region: an existing block is
 * replaced rather than added to, so a repaint cannot leave two.
 *
 * "PER REGION" AND NOT "PER ID", AND THE DIFFERENCE IS A DEFECT THIS FOUND.
 * The first version matched the old block by `[data-for="${id}"]`, which holds
 * only while a region is one visual for the life of the page. On the shipped
 * page three regions are not: the auction panel is ten visuals in one element,
 * the door bench is eleven, and the drawer is eight. Choosing a new scenario
 * changed the id, the lookup found nothing under the NEW id, and the block for
 * the OLD one was left sitting above it — so the region carried two findings,
 * and the one on top was about a scenario the reader had left. A stale block is
 * worse than none: it is a claim that was true a moment ago, which is the exact
 * failure the observer below is written to avoid. Every block a region holds
 * goes; the one that matches is replaced in place so it keeps its position.
 */
export function renderTextBlock(region, id) {
  const block = textBlockFor(id, region);
  const held = [...region.querySelectorAll(':scope > .p2-text-block')];
  const old = held.find((node) => node.getAttribute('data-for') === id) || null;
  for (const stale of held) if (stale !== old) stale.remove();
  const box = h('div', {
    class: 'p2-text-block', 'data-for': id, 'data-component': block.component,
    'data-vacuous': String(block.vacuous),
  });

  /* THE AUTHORED SENTENCE, first, in prose type. It is what a reader gets
   * instead of the picture, so it is the first thing they get. */
  const lede = h('p', { class: 'p2-prose p2-text-alt' }, box);
  h('span', { class: 'p2-text-shows', text: block.shows }, lede);
  lede.appendChild(document.createTextNode(' '));
  h('strong', { class: 'p2-text-finding', text: block.finding }, lede);

  if (block.vacuous) {
    /* ABSENCE IS A POSITIVE OBJECT. Never an empty table, never whitespace. */
    const gap = h('div', { class: 'p2-text-absence', role: 'note' }, box);
    h('span', { class: 'p2-arch', text: 'no readings to show' }, gap);
    h('p', { class: 'p2-chrome', text: block.vacuousReason }, gap);
  } else {
    for (const part of block.drawings) {
      const card = h('div', { class: 'p2-text-drawing' }, box);
      h('p', { class: 'p2-prose p2-text-name', text: part.name }, card);
      const table = h('table', { class: 'p2-text-table' }, card);
      const caption = h('caption', {
        class: 'p2-chrome',
        /* "1 readings" appeared under the toll visibility legend's five one-line tokens the first
         * time this ran on the shipped page. A caption that cannot count to one is a caption a
         * reader stops trusting about the numbers underneath it. */
        text: `what this drawing says, in the order it says it — ` +
              `${part.readings.length} reading${part.readings.length === 1 ? '' : 's'}`,
      }, table);
      caption.setAttribute('class', 'p2-chrome');
      const body = h('tbody', {}, table);
      part.readings.forEach((reading, i) => {
        const tr = h('tr', {}, body);
        h('td', { class: 'p2-num p2-text-index', text: String(i + 1) }, tr);
        h('td', { class: 'p2-text-reading', text: reading }, tr);
      });
    }
  }

  if (old) region.replaceChild(box, old);
  else region.insertBefore(box, region.firstChild);
  return box;
}

/* ------------------------------------------------------------------ *
 * 4 · THE TOGGLE, AND KEEPING THE TEXT IN STEP WITH THE DRAWING
 * ------------------------------------------------------------------ */

/**
 * Mount the text path over a rendered page.
 *
 * Builds a text block inside every declared region, then watches for repaints
 * and rebuilds the affected block. The components replace their `<svg>` nodes
 * when the reader cranks, so a block built once would go stale on the first
 * turn of the first machine — and a stale text block is worse than none,
 * because it is a number that was true a moment ago.
 */
export function installTextPath(root, options = {}) {
  const { observe = true } = options;
  const census = assertEveryDrawingDeclared(root, 'this page');
  const regions = declaredVisuals(root);
  if (regions.length === 0) {
    throw new VisualsError(
      'installTextPath', 'NOTHING WAS DECLARED',
      'this page declares no visuals, so the text path would replace nothing and ' +
      'report itself installed.',
      'call declareVisual(node, id) on each region before mounting the text path');
  }
  for (const { id, node } of regions) renderTextBlock(node, id);

  let observer = null;
  if (observe && typeof MutationObserver === 'function') {
    let queued = false;
    const dirty = new Set();
    const WATCH = { childList: true, subtree: true, characterData: true };
    const flush = () => {
      /* THE OBSERVER IS DEAF WHILE THIS RUNS, AND THAT IS THE FIX.
       *
       * Writing a text block is itself a mutation inside the region, so the
       * first version of this fed itself: rebuild, observe, rebuild, for as
       * long as the page was open. Filtering on `closest('.p2-text-block')` was
       * not enough — replacing the block mutates the REGION, whose nearest
       * block ancestor is nothing. Disconnecting is the only filter that cannot
       * be walked around, and `takeRecords()` throws away what piled up while
       * we were writing.
       *
       * Reset in a `finally`. A rebuild that throws must not leave the flag set
       * or the observer detached: one bad region would silence every text block
       * on the page, and a block frozen at what the drawing said a minute ago
       * is worse than no block at all. */
      try {
        /* Disconnect HERE and not in the callback. Disconnecting the moment a
         * mutation arrives loses everything a component writes in the task
         * after it — and CRANK writes its output one task later, after the
         * 40ms hold. The only window that has to be deaf is this rebuild
         * itself, which is synchronous. */
        observer.disconnect();
        for (const region of dirty) {
          if (region.isConnected) renderTextBlock(region, region.getAttribute(VISUAL_ATTR));
        }
      } finally {
        dirty.clear();
        queued = false;
        observer.takeRecords();
        observer.observe(root, WATCH);
      }
    };
    observer = new MutationObserver((records) => {
      for (const record of records) {
        const target = record.target.nodeType === 1
          ? record.target : record.target.parentElement;
        const region = target && target.closest ? target.closest(`[${VISUAL_ATTR}]`) : null;
        if (!region || (target.closest && target.closest('.p2-text-block'))) continue;
        dirty.add(region);
      }
      if (!dirty.size || queued) return;
      queued = true;
      /* SETTIMEOUT, NOT REQUESTANIMATIONFRAME, AND THAT IS THE WHOLE OF THIS
       * COMMENT'S REASON FOR EXISTING. Chrome does not run rAF callbacks in a
       * background tab. This was written with rAF, and the first mutation set
       * the flag, the callback never ran, and the observer never rebuilt
       * anything again — a text block frozen at whatever the drawing said when
       * the page loaded, under a heading claiming it is what the drawing says
       * now. That is worse than no text path, because it is a number that was
       * true a moment ago. `eras.test.js` wrote the same lesson down about
       * animation promises; it is the same tab and the same throttle. */
      setTimeout(flush, 0);
    });
    observer.observe(root, WATCH);
  }

  initTextPath();
  return Object.freeze({
    regions: regions.length,
    drawings: census.drawings,
    stop: () => { if (observer) observer.disconnect(); },
    refresh: () => { for (const { id, node } of declaredVisuals(root)) renderTextBlock(node, id); },
  });
}

/**
 * The two-button rocker, house style. The same shape as
 * `motion.js`'s `installMotionToggle`, on purpose.
 */
export function installTextToggle(host, options = {}) {
  const { label = 'Drawings' } = options;
  const wrap = h('div', { class: 'p2-text-toggle' }, host);
  h('span', { class: 'p2-arch', text: label }, wrap);
  const rocker = h('div', { class: 'p2-rocker', role: 'group', 'aria-label': label }, wrap);
  const buttons = [
    { mode: 'off', text: 'drawings on' },
    { mode: 'on', text: 'text only' },
  ].map(({ mode, text }) => {
    const button = h('button', {
      type: 'button', text, 'data-mode': mode,
      'aria-pressed': String(textMode() === mode),
    }, rocker);
    button.addEventListener('click', () => setTextMode(mode));
    return button;
  });
  const sync = () => {
    for (const b of buttons) {
      b.setAttribute('aria-pressed', String(textMode() === b.getAttribute('data-mode')));
    }
  };
  onTextModeChange(sync);
  sync();
  return wrap;
}

/* ------------------------------------------------------------------ *
 * 5 · THE AUDIT — ADVICE, AND IT SAYS SO
 * ------------------------------------------------------------------ */

/**
 * ADVICE. What the text path covers on this page, and where it is thin.
 *
 * It reports; it never throws. Three things it can say and one it cannot:
 * it can say which visuals of the record this page carries, whether they are in
 * the record's own order, and which regions came back with no readings. It
 * CANNOT say whether the argument survives, because that is a question about a
 * reader. `BUILD-PLAN.md` puts that on a person and this function is not it.
 */
export function auditTextPath(root) {
  const regions = declaredVisuals(root);
  const blocks = regions.map(({ id, node }) => textBlockFor(id, node));
  const orders = blocks.map((b) => b.order);
  const inOrder = orders.every((o, i) => i === 0 || o > orders[i - 1]);
  const all = everyVisual();
  const present = new Set(blocks.map((b) => b.id));
  return Object.freeze({
    onThisPage: blocks.length,
    inTheRecord: all.length,
    missing: all.filter((r) => !present.has(r.id)).map((r) => r.id),
    inRecordOrder: inOrder,
    silent: blocks.filter((b) => b.vacuous).map((b) => ({ id: b.id, why: b.vacuousReason })),
    readings: blocks.reduce((n, b) => n + b.readings, 0),
    vacuous: blocks.length === 0,
  });
}

export default {
  initTextPath, textMode, isTextOnly, setTextMode, onTextModeChange,
  installTextPath, installTextToggle, renderTextBlock, textBlockFor,
  drawingReadings, auditTextPath,
};
