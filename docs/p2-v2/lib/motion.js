/*
 * P2 — The Attention Economy · motion vocabulary
 * Direction: "The Bench" (p2-ad-market/design/DESIGN.md, locked 2026-07-31)
 *
 * Seven named verbs. Six are specified in the record; one is invented and
 * flagged as such. Every verb has a *complete alternative encoding* for readers
 * with motion reduced — not a shorter version, not a disabled version, a
 * different way of carrying the same fact. Both halves are first-class exports:
 *
 *     import { crank, crankFull, crankReduced } from './motion.js';
 *
 * `crank()` dispatches on the current mode. `crankFull()` and `crankReduced()`
 * can each be called directly, which is how the demo page shows them side by
 * side and how a test asserts the fallback carries the information.
 *
 * MODE PRECEDENCE
 *   1. setMotionMode('full' | 'reduce')      — explicit, in-page, wins
 *   2. ?motion=reduce  /  ?motion=full       — a reviewer's URL
 *   3. prefers-reduced-motion: reduce        — the operating system
 *   4. 'full'
 * The resolved mode is stamped on <html data-motion="…"> so tokens.css can act
 * on it without waiting for a media query, and so it is visible in devtools.
 *
 * ES module, no build step, no network. Two local imports, both deliberate:
 * the palette (so a hue change reaches every mark this file draws) and the
 * whole of G1 — the span-only cut, the interval reader and the ratio — so that
 * TREMOR's scope and guard G1 cannot disagree about which claims are wide or
 * about what makes an interval readable. Neither is copied here. A constant
 * copied is a constant that will one day be two, and a CHECK copied is a check
 * that will one day be two different checks.
 *
 * THIS FILE HAS NO OPINION ABOUT INTERVALS. It had one, and it was wrong in a
 * way that only showed on the reduced path: its own local test asked for two
 * finite numbers that were not equal, and never asked whether they were in
 * order or whether the central sat between them. So a claim with ci80
 * [360, 96] — the shape guards.js was hardened against, and refuses — printed
 * "360–96" on the lozenge, an interval drawn backwards, on the one path a
 * vestibular-sensitive or screen-reader user gets. Every question about a
 * claim's interval now goes to guards.claimInterval().
 */

import { ZINC_RULE } from './tokens.js';
import { RULES, isWideInterval, claimInterval, intervalRatio } from './guards.js';

/* ------------------------------------------------------------------ *
 * 0. The vocabulary, as data.
 * ------------------------------------------------------------------ */

/**
 * Every verb, its exact timing, what it is for, what it must never touch, and
 * what replaces it when motion is reduced. Read this before writing an
 * animation; if what you want is not here, it does not exist in P2.
 */
export const VERBS = Object.freeze({
  SETTLE: Object.freeze({
    name: 'SETTLE', origin: 'P1, carried over',
    duration: 700, easing: 'cubic-bezier(.16,1,.3,1)', hold: 0,
    what: 'Critically damped arrival. A galvanometer needle reaching its reading.',
    use: 'Any value arriving at its measured position: particle landings, slot snaps, readout arrivals, the pull drawer opening.',
    never: 'Never for a change the reader did not cause. Never for anything that has not actually been measured.',
    reduced: Object.freeze({
      form: 'crossfade + origin ghost',
      duration: 120,
      ghostTtl: 3000,
      what: 'A 120ms opacity crossfade, plus the mark\'s previous position left drawn at 25% opacity for 3 seconds.',
      carries: 'The ghost is not decoration. SETTLE\'s information is "this value moved from there to here." Remove the travel and the ghost is the only thing left saying where "there" was.',
    }),
  }),

  SWEEP: Object.freeze({
    name: 'SWEEP', origin: 'P1, carried over',
    duration: 1400, easing: 'cubic-bezier(.4,0,.6,1)', hold: 0,
    what: 'A chart-recorder pen. Near-linear, left to right, across the viewport.',
    use: 'Time-axis draws. Every rail, every lane, every series that runs along years.',
    never: 'Never right-to-left, never vertical. The direction is the time axis and reversing it lies.',
    reduced: Object.freeze({
      form: 'complete on first frame',
      duration: 0,
      what: 'The rail renders whole, immediately.',
      carries: 'SWEEP carries only "this axis is time, and it runs this way." The axis labels and the arrowed axis rule carry that already, so nothing is lost. This is the one verb whose fallback costs nothing.',
    }),
  }),

  CRANK: Object.freeze({
    name: 'CRANK', origin: 'P2, new — the signature verb',
    duration: 320, easing: 'cubic-bezier(.34,0,.2,1)', hold: 40,
    what: 'The machine takes the input, pauses a beat, then the output responds.',
    use: 'Every rule change the reader makes. Rockers, knobs, notches, basis switches, scenario picks.',
    never: 'Never for a change the reader did not make. The whole meaning of the hold is "your hand did this."',
    note: 'The 40ms hold is load-bearing and is not a delay to be tuned away. It separates cause from effect in time, which is what makes the thing read as mechanical rather than reactive, and it is what makes the reader attribute the output to their own hand. Total wall time is 360ms.',
    reduced: Object.freeze({
      form: 'two-step highlight',
      duration: 200,
      what: 'The input flashes for 100ms, then the output flashes for 100ms. No travel of any kind.',
      carries: 'CRANK\'s information is the *order*: input first, output second, caused by the first. A flash is a colour change, not motion, so the sequence survives with the movement removed.',
    }),
  }),

  TRAVERSE: Object.freeze({
    name: 'TRAVERSE', origin: 'P2, new',
    duration: 700, easing: 'cubic-bezier(.16,1,.3,1)', hold: 0, trailHold: 200,
    what: 'SETTLE along an arc, with the path left drawn faintly for 200ms after arrival, then faded.',
    use: 'Object-constancy moves. The eleven Yellow Pages units, the simulator\'s slot swaps — any time the same unit has to be seen arriving somewhere new.',
    never: 'Never for a mark that is not the same object it was before the move. If the identity is not conserved, TRAVERSE asserts something false.',
    reduced: Object.freeze({
      form: 'crossfade + origin ghost + persistent trail',
      duration: 120,
      trailHold: 3000,
      what: 'A 120ms crossfade, the origin ghost at 25% for 3 seconds, and the arc drawn as a persistent hairline for the same 3 seconds.',
      carries: 'This is the most expensive fallback in the set, and it has to be. The conservation proof — same eleven units, different places, unchanged total — is entirely motion-carried in the full version. Ghost plus trail is the static form of that proof.',
    }),
  }),

  TREMOR: Object.freeze({
    name: 'TREMOR', origin: 'P2, new — descended from P1\'s measurement jitter',
    duration: 833, frequency: 1.2, easing: 'ease-in-out', hold: 0, maxAmplitude: 6,
    what: 'A continuous ~1.2Hz shiver. Amplitude is the full 80% interval in pixels, capped at 6px.',
    use: `ONLY the claims guards.js calls wide — ci_width / central over RULES.wideIntervalRatio, ` +
         `which was ${RULES.wideIntervalRatio} when this module loaded and selects 65 of the 506 frozen claims at that value. ` +
         `Nothing else, ever. The number is read from guards.js, never restated here; ask qualifiesForTremor(claim).`,
    never: 'Never on ribbons. Never on totals. Never on era spines. Never on a grade-A claim. Never as ambience.',
    note: 'TREMOR is the one verb that is not triggered by the reader and does not stop. That is why its scope is capped so hard: at 1,573 marks an ambient jitter stops being a signal and becomes visual tinnitus.',
    reduced: Object.freeze({
      form: 'static hollow lozenge',
      duration: 0,
      what: 'A hollow lozenge with a hatched interior, both interval endpoints ticked, and the interval printed beside it in IBM Plex Mono.',
      carries: 'The full width of the 80% interval, which is exactly what the amplitude encoded.',
      hardRule: 'A tremoring claim is NEVER rendered as a point, in any motion mode. That is a data-integrity rule inherited from invariant 3, not a motion preference. Turning motion off must not turn an unknown into a number.',
    }),
  }),

  CUT: Object.freeze({
    name: 'CUT', origin: 'P2, new',
    duration: 0, easing: 'step-end', hold: 0,
    what: 'No transition at all. The old state is gone and the new one is there.',
    use: 'Crossing a definitional seam, and nothing else. Coen to MAGNA. The era-5 taxonomy flip. Any basis label change.',
    never: 'Never anywhere a crossfade would have worked. A transition implies relatedness; where there is no relation there must be no transition.',
    note: 'CUT is a verb precisely because doing nothing is a decision here. A 200ms crossfade between two rulers would tell the reader the two measurements are versions of one thing. They are not.',
    reduced: Object.freeze({
      form: 'unchanged',
      duration: 0,
      what: 'Identical. CUT was already zero.',
      carries: 'Everything. This verb has no motion to remove.',
    }),
  }),

  PULL: Object.freeze({
    name: 'PULL', origin: 'P2, new — INVENTED TIMING, see note',
    duration: 700, easing: 'cubic-bezier(.16,1,.3,1)',
    hold: 40, tugDistance: 10, tugOut: 180, tugBack: 220,
    what: 'A knurled ring is tugged ten pixels and springs back, once. Then the drawer travels with SETTLE.',
    use: 'The pull ring on every organ. The teaching tug in chapter 1, and every cross-era lift after it.',
    never: 'Never more than one teaching tug in the whole piece. A handle that waves at the reader twice is a nag, and the second wave admits the first failed.',
    INVENTED: true,
    note: 'DESIGN.md decides the Pull Ring and names PULL "a second verb beside CRANK", and OPEN-PROBLEMS.md specifies the behaviour — "tugs itself ten pixels and springs back, once" and "borrows the crank\'s exact 40-millisecond pause". No timing was ever written down. The 180ms out / 40ms hold / 220ms back envelope is invented here: it borrows CRANK\'s hold verbatim so the reader files the pull as the same machine answering the same hand, and it lands at 440ms total, comfortably inside CRANK\'s and SETTLE\'s register rather than between them. The 700ms drawer travel is not invented — it is SETTLE.',
    reduced: Object.freeze({
      form: 'proud rest state + crossfade',
      duration: 120,
      what: 'No tug. The ring sits permanently 3px proud of its seam with a hairline shadow under it, and the drawer crossfades in over 120ms with its lip square filled at once.',
      carries: 'The tug carries "this is operable". A ring that is already standing out of its seam carries the same affordance as a static shape, which is how a real drawer handle works. The lip square carries "this one is open", which the travel carried.',
      INVENTED: true,
    }),
  }),
});

/** The six verbs specified in the record, and the one invented here. */
export const SPECIFIED_VERBS = Object.freeze(['SETTLE', 'SWEEP', 'CRANK', 'TRAVERSE', 'TREMOR', 'CUT']);
export const INVENTED_VERBS = Object.freeze(['PULL']);

/** The reduced-motion half of the vocabulary, addressable on its own. */
export const REDUCED = Object.freeze(
  Object.fromEntries(Object.entries(VERBS).map(([k, v]) => [k, v.reduced]))
);

/* ------------------------------------------------------------------ *
 * 1. Mode — OS setting, URL override, in-page toggle.
 * ------------------------------------------------------------------ */

const MODES = Object.freeze(['full', 'reduce']);
const STORAGE_KEY = 'p2-motion';
const listeners = new Set();
let override = null;

/* ONE notion of "there is a DOM here", not two. This read `typeof document !==
 * 'undefined'` and then, on the very next line, `window.matchMedia` — so in any
 * environment that has a document and no window the module threw a
 * ReferenceError at IMPORT time, before a single verb could be called. Every
 * later reader of `window` in this file (fromUrl, stamp, initMotion) is behind
 * this same flag, so collapsing the two tests closes all of them at once. */
const hasDom = typeof document !== 'undefined' && typeof window !== 'undefined';
const mq = hasDom && typeof window.matchMedia === 'function'
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false, addEventListener() {}, removeEventListener() {} };

/** True if the operating system asks for reduced motion. */
export function prefersReduced() { return !!mq.matches; }

function fromUrl() {
  if (!hasDom) return null;
  const m = /[?&]motion=(full|reduce)\b/.exec(window.location.search);
  return m ? m[1] : null;
}

function fromStorage() {
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEY);
    return MODES.includes(v) ? v : null;
  } catch { return null; }
}

/** The mode in force right now, after all four precedence levels. */
export function motionMode() {
  return override || fromUrl() || fromStorage() || (prefersReduced() ? 'reduce' : 'full');
}

/** True when the alternative encodings are the ones being drawn. */
export function isReduced() { return motionMode() === 'reduce'; }

function stamp() {
  const mode = motionMode();
  if (hasDom) {
    document.documentElement.setAttribute('data-motion', mode);
    document.documentElement.setAttribute('data-motion-source',
      override ? 'page' : fromUrl() ? 'url' : fromStorage() ? 'session' : prefersReduced() ? 'os' : 'default');
  }
  for (const fn of listeners) { try { fn(mode); } catch (e) { console.error(e); } }
  return mode;
}

/**
 * The reviewer's toggle. Independent of the operating system, so the fallback
 * can be inspected without anyone changing a system preference.
 * Pass null to hand control back to the URL / OS.
 */
export function setMotionMode(mode) {
  if (mode !== null && !MODES.includes(mode)) {
    throw new RangeError(`motion: mode must be one of ${MODES.join(', ')}, or null. Got ${JSON.stringify(mode)}.`);
  }
  override = mode;
  try {
    if (mode === null) window.sessionStorage.removeItem(STORAGE_KEY);
    else window.sessionStorage.setItem(STORAGE_KEY, mode);
  } catch { /* private browsing; the in-memory override still holds */ }
  return stamp();
}

/** Subscribe to mode changes, from any source. Returns an unsubscribe. */
export function onMotionChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Stamp <html> now, and keep it in step with the OS.
 * Call once, as early as possible. tokens.css already handles the pure media
 * query, so nothing flashes if this runs late — but the data-motion mirror is
 * what the JS verbs read.
 */
export function initMotion() {
  if (!hasDom) return 'full';
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', stamp);
  const vars = {
    '--p2-settle': `${VERBS.SETTLE.duration}ms`,
    '--p2-settle-ease': VERBS.SETTLE.easing,
    '--p2-sweep': `${VERBS.SWEEP.duration}ms`,
    '--p2-sweep-ease': VERBS.SWEEP.easing,
    '--p2-crank': `${VERBS.CRANK.duration}ms`,
    '--p2-crank-ease': VERBS.CRANK.easing,
    '--p2-crank-hold': `${VERBS.CRANK.hold}ms`,
    '--p2-tremor-period': `${VERBS.TREMOR.duration}ms`,
    '--p2-pull-tug': `${VERBS.PULL.tugOut}ms`,
  };
  for (const [k, v] of Object.entries(vars)) document.documentElement.style.setProperty(k, v);
  return stamp();
}

/** A two-button rocker in the house style. Appends to `container`, returns it. */
export function installMotionToggle(container, { label = 'Motion' } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'p2-motion-toggle';
  wrap.innerHTML =
    `<span class="p2-arch" id="p2-mt-label">${label}</span>` +
    `<span class="p2-rocker" role="group" aria-labelledby="p2-mt-label">` +
    `<button type="button" data-mode="full">Full</button>` +
    `<button type="button" data-mode="reduce">Reduced</button>` +
    `</span>`;
  const buttons = [...wrap.querySelectorAll('button')];
  const paint = (mode) => buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  buttons.forEach((b) => b.addEventListener('click', () => setMotionMode(b.dataset.mode)));
  onMotionChange(paint);
  paint(motionMode());
  container.appendChild(wrap);
  return wrap;
}

/* ------------------------------------------------------------------ *
 * 2. Plumbing shared by the verbs.
 * ------------------------------------------------------------------ */

const noop = () => {};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Uniform handle. Every verb returns one, in both modes. */
function handle(mode, verb, finished, cancel = noop) {
  return { verb, mode, finished, cancel };
}

/**
 * BOTH HALVES REFUSE THE SAME THINGS.
 *
 * A verb whose full half tolerates a missing element and whose reduced half
 * throws on it is worse than either, because then the motion mode a developer
 * happens to be testing in decides whether they see the error — and the mode
 * most developers test in is the one they are not shipping to. `animate()`
 * quietly returns null for anything without `.animate`, so the full halves used
 * to swallow a null element while the reduced halves, which set attributes and
 * styles directly, threw a TypeError from inside the library.
 *
 * So every verb that draws on an element asks for it here, in both halves, with
 * the same message. OPTIONAL ELEMENTS ARE ASKED FOR TOO, WHEN THEY ARE GIVEN —
 * `sweep`'s `el` and `crank`'s `output` are optional in BOTH halves, and both
 * halves check them the moment they are supplied. Optional is not the same as
 * unchecked, and the difference is not cosmetic: `sweepFull` touched `el.style`
 * inside a requestAnimationFrame callback and `crankFull` touched
 * `output.setAttribute` inside a `.then()`, so a wrong value there surfaced as
 * an exception in an animation frame or an unhandled promise rejection, with no
 * call stack pointing at the call site, while the reduced halves threw at the
 * call site. Same rule, two very different chances of the developer seeing it.
 */
function requireElement(el, fn, param = 'el') {
  if (el && typeof el === 'object' &&
      typeof el.setAttribute === 'function' && typeof el.classList === 'object') {
    return el;
  }
  const shown = el === undefined ? 'undefined' : el === null ? 'null' : typeof el;
  throw new TypeError(
    `motion: ${fn}() needs an element as \`${param}\`; got ${shown}. Both halves of every ` +
    `verb ask for this, so a call site cannot pass in full mode and throw in reduced mode — ` +
    `which would make the mode you happen to be testing in decide whether you see the mistake.`
  );
}

function animate(el, keyframes, options) {
  if (!el || typeof el.animate !== 'function') return null;
  return el.animate(keyframes, options);
}

const done = (anim) => (anim ? anim.finished.catch(() => {}) : Promise.resolve());

/**
 * Leave a 25%-opacity copy of `el` at its old position for 3 seconds.
 * The origin ghost is what SETTLE's and TRAVERSE's fallbacks are built on.
 * Works for HTML and SVG; `fromTransform` is the transform the ghost keeps.
 */
export function originGhost(el, { fromTransform = null, ttl = 3000, opacity = 0.25 } = {}) {
  if (!el || !el.parentNode) return noop;
  const ghost = el.cloneNode(true);
  ghost.removeAttribute('id');
  ghost.setAttribute('data-p2-ghost', 'origin');
  ghost.setAttribute('aria-hidden', 'true');
  if (ghost.style) {
    ghost.style.opacity = String(opacity);
    ghost.style.pointerEvents = 'none';
    if (fromTransform) ghost.style.transform = fromTransform;
  }
  el.parentNode.insertBefore(ghost, el);
  let t = setTimeout(() => ghost.remove(), ttl);
  return () => { clearTimeout(t); ghost.remove(); };
}

/** Dispatch on the current mode. Both halves stay exported and callable. */
const dispatch = (full, reduced) => (...args) => (isReduced() ? reduced(...args) : full(...args));

/* ------------------------------------------------------------------ *
 * 3. SETTLE
 * ------------------------------------------------------------------ */

/**
 * @param {Element} el
 * @param {Keyframe[]} keyframes  e.g. [{transform:'translateY(12px)'},{transform:'none'}]
 * @param {{delay?:number, fromTransform?:string}} opts
 */
export function settleFull(el, keyframes, { delay = 0 } = {}) {
  requireElement(el, 'settleFull');
  const a = animate(el, keyframes, {
    duration: VERBS.SETTLE.duration, easing: VERBS.SETTLE.easing, delay, fill: 'both',
  });
  return handle('full', 'SETTLE', done(a), () => a && a.cancel());
}

/**
 * `ghost: false` is the one way to drop the information this fallback carries,
 * and it is left available because it is EXPLICIT. The default is the safe one:
 * the shortest call draws the ghost.
 */
export function settleReduced(el, keyframes, { fromTransform = null, ghost = true } = {}) {
  requireElement(el, 'settleReduced');
  const clear = ghost ? originGhost(el, { fromTransform, ttl: VERBS.SETTLE.reduced.ghostTtl }) : noop;
  const a = animate(el, [{ opacity: 0 }, { opacity: 1 }], {
    duration: VERBS.SETTLE.reduced.duration, easing: 'linear', fill: 'both',
  });
  if (Array.isArray(keyframes) && keyframes.length && el && el.style) {
    const last = keyframes[keyframes.length - 1];
    for (const [k, v] of Object.entries(last)) {
      if (k !== 'offset' && k !== 'easing' && k !== 'composite') el.style[k] = v;
    }
  }
  return handle('reduce', 'SETTLE', done(a).then(() => wait(0)), () => { clear(); a && a.cancel(); });
}

export const settle = dispatch(settleFull, settleReduced);

/* ------------------------------------------------------------------ *
 * 4. SWEEP
 * ------------------------------------------------------------------ */

/**
 * Drives a 0..1 progress value with the chart-recorder curve. The caller
 * decides what progress means — a clipPath width, a stroke-dashoffset, a
 * column count. `el` is optional; if given it receives --p2-sweep-progress.
 *
 * @param {{el?:Element, onProgress?:(t:number)=>void, duration?:number}} opts
 */
export function sweepFull({ el = null, onProgress = noop, duration = VERBS.SWEEP.duration } = {}) {
  if (el) requireElement(el, 'sweepFull');
  let raf = 0, cancelled = false;
  const ease = cubicBezier(0.4, 0, 0.6, 1);
  const finished = new Promise((resolve) => {
    const t0 = performance.now();
    const step = (now) => {
      if (cancelled) return resolve();
      const t = Math.min(1, (now - t0) / duration);
      const v = ease(t);
      if (el) el.style.setProperty('--p2-sweep-progress', String(v));
      onProgress(v);
      if (t < 1) raf = requestAnimationFrame(step); else resolve();
    };
    raf = requestAnimationFrame(step);
  });
  return handle('full', 'SWEEP', finished, () => { cancelled = true; cancelAnimationFrame(raf); });
}

export function sweepReduced({ el = null, onProgress = noop } = {}) {
  if (el) requireElement(el, 'sweepReduced');
  if (el) el.style.setProperty('--p2-sweep-progress', '1');
  onProgress(1);
  return handle('reduce', 'SWEEP', Promise.resolve(), noop);
}

export const sweep = dispatch(sweepFull, sweepReduced);

/* ------------------------------------------------------------------ *
 * 5. CRANK — the signature verb
 * ------------------------------------------------------------------ */

/**
 * The machine takes the input, pauses 40ms, then the output responds.
 *
 * `input` is REQUIRED, in both halves. CRANK's own record says "never for a
 * change the reader did not make — the whole meaning of the hold is 'your hand
 * did this'", and the input element IS the reader's hand. An optional input
 * made that rule documentation; asking for it makes a crank with no cause
 * something a caller cannot express.
 *
 * @param {{
 *   input: Element,               the control the reader touched
 *   output?: Element,             the thing that answers
 *   apply?: () => void,           the state change, run AFTER the hold
 *   outputKeyframes?: Keyframe[]  how the output moves; defaults to a settle-in
 * }} opts
 */
export function crankFull({ input, output = null, apply = noop, outputKeyframes = null } = {}) {
  requireElement(input, 'crankFull', 'input');
  if (output) requireElement(output, 'crankFull', 'output');
  const { duration, easing, hold } = VERBS.CRANK;
  input.setAttribute('data-crank', 'input');
  animate(input, [{ filter: 'none' }, { filter: 'none' }], { duration: hold });
  let outAnim = null;
  const finished = wait(hold).then(() => {
    input.removeAttribute('data-crank');
    apply();
    if (output) {
      output.setAttribute('data-crank', 'output');
      outAnim = animate(output, outputKeyframes || [
        { transform: 'translateY(-3px)', opacity: 0.55 },
        { transform: 'none', opacity: 1 },
      ], { duration, easing, fill: 'both' });
    }
    return done(outAnim);
  }).then(() => { if (output) output.removeAttribute('data-crank'); });
  return handle('full', 'CRANK', finished, () => outAnim && outAnim.cancel());
}

/**
 * Sequence preserved, motion removed. Input flashes 100ms, then output flashes
 * 100ms. A flash is a colour change; it is not motion, and it is not vestibular.
 */
export function crankReduced({ input, output = null, apply = noop } = {}) {
  requireElement(input, 'crankReduced', 'input');
  if (output) requireElement(output, 'crankReduced', 'output');
  const half = VERBS.CRANK.reduced.duration / 2;
  input.setAttribute('data-crank', 'input');
  const finished = wait(half).then(() => {
    input.removeAttribute('data-crank');
    apply();
    if (output) output.setAttribute('data-crank', 'output');
    return wait(half);
  }).then(() => { if (output) output.removeAttribute('data-crank'); });
  return handle('reduce', 'CRANK', finished, noop);
}

export const crank = dispatch(crankFull, crankReduced);

/* ------------------------------------------------------------------ *
 * 6. TRAVERSE
 * ------------------------------------------------------------------ */

/** Quadratic Bézier from `from` to `to`, bowed by `arc` px perpendicular. */
function arcPoints(from, to, arc, steps = 24) {
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  const dx = to.x - from.x, dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * arc, cy = my + (dx / len) * arc;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    pts.push({
      x: u * u * from.x + 2 * u * t * cx + t * t * to.x,
      y: u * u * from.y + 2 * u * t * cy + t * t * to.y,
    });
  }
  return { pts, d: `M${from.x} ${from.y} Q${cx} ${cy} ${to.x} ${to.y}` };
}

function drawTrail(layer, d, { ttl, stroke }) {
  if (!layer) return noop;
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', stroke);
  p.setAttribute('stroke-width', '1');
  p.setAttribute('stroke-dasharray', '2 3');
  p.setAttribute('data-p2-trail', '');
  p.setAttribute('aria-hidden', 'true');
  layer.appendChild(p);
  const t = setTimeout(() => p.remove(), ttl);
  return () => { clearTimeout(t); p.remove(); };
}

/**
 * The trail is a rule, so its default is ZINC_RULE, imported from tokens.js —
 * not the string '#838A93'. A palette change has to reach every mark, including
 * the ones a caller never bothered to colour.
 *
 * @param {Element} el
 * @param {{
 *   from:{x:number,y:number}, to:{x:number,y:number},
 *   arc?:number, trailLayer?:Element, trailStroke?:string
 * }} opts
 */
export function traverseFull(el, { from, to, arc = 0, trailLayer = null, trailStroke = ZINC_RULE } = {}) {
  requireElement(el, 'traverseFull');
  const { pts, d } = arcPoints(from, to, arc);
  const frames = pts.map((p) => ({ transform: `translate(${p.x - from.x}px, ${p.y - from.y}px)` }));
  const a = animate(el, frames, {
    duration: VERBS.TRAVERSE.duration, easing: VERBS.TRAVERSE.easing, fill: 'both',
  });
  let clear = noop;
  const finished = done(a).then(() => {
    clear = drawTrail(trailLayer, d, { ttl: VERBS.TRAVERSE.trailHold, stroke: trailStroke });
    return wait(VERBS.TRAVERSE.trailHold);
  });
  return handle('full', 'TRAVERSE', finished, () => { a && a.cancel(); clear(); });
}

/**
 * Crossfade, origin ghost for 3s, and the arc drawn as a persistent hairline
 * for the same 3s. Stroke defaults to ZINC_RULE from tokens.js, the same import
 * traverseFull uses; no hex is typed in this file.
 *
 * `trailLayer` IS REQUIRED HERE, and optional in traverseFull. That is not an
 * asymmetry in the rule; it is the rule. TRAVERSE's information is "the same
 * object is now somewhere else, and nothing was created or destroyed", and in
 * full mode the travel itself carries it, so the 200ms trail is a flourish. In
 * reduced mode there is no travel, and the record says so in as many words:
 * "the conservation proof is entirely motion-carried in the full version; ghost
 * plus trail is the static form of that proof." A default of null let the
 * shortest call drop the proof silently — the same defect as the null claim
 * that tremorReduced used to accept.
 */
export function traverseReduced(el, { from, to, arc = 0, trailLayer = null, trailStroke = ZINC_RULE } = {}) {
  requireElement(el, 'traverseReduced');
  if (!trailLayer) {
    throw new TypeError(
      'motion: traverseReduced() needs a `trailLayer` to draw the arc into. With motion ' +
      'removed the trail and the ghost ARE the conservation proof — same unit, new place, ' +
      'nothing created — and there is nothing else left to carry it. traverseFull() may ' +
      'omit the layer because the travel carries the proof; this half may not.'
    );
  }
  const { d } = arcPoints(from, to, arc);
  const ttl = VERBS.TRAVERSE.reduced.trailHold;
  const clearGhost = originGhost(el, {
    fromTransform: `translate(0px, 0px)`, ttl,
  });
  const clearTrail = drawTrail(trailLayer, d, { ttl, stroke: trailStroke });
  if (el && el.style) el.style.transform = `translate(${to.x - from.x}px, ${to.y - from.y}px)`;
  const a = animate(el, [{ opacity: 0.35 }, { opacity: 1 }], {
    duration: VERBS.TRAVERSE.reduced.duration, easing: 'linear', fill: 'both',
  });
  return handle('reduce', 'TRAVERSE', done(a).then(() => wait(ttl)), () => { clearGhost(); clearTrail(); a && a.cancel(); });
}

export const traverse = dispatch(traverseFull, traverseReduced);

/* ------------------------------------------------------------------ *
 * 7. TREMOR
 * ------------------------------------------------------------------ */

/**
 * Does this claim qualify?
 *
 * TREMOR's scope rule and the span-only invariant are the same rule seen from
 * two sides, so this is not a second implementation of it — it is guard G1's
 * `isWideInterval`, re-exported under the name the motion layer uses. The
 * threshold lives in exactly one place, `RULES.wideIntervalRatio` in guards.js,
 * and is read live, so `configureRules({ wideIntervalRatio }, reason)` moves the
 * cut for the chart layer and for TREMOR in the same instant. There is no local
 * 0.6, and nothing here caches the answer.
 *
 * This is the fix for a real defect: the previous version kept its own `> 0.6`
 * and its own `Math.abs()` on the interval width. configureRules() could not
 * reach it, and a claim whose ci80 arrived as [high, low] was wide here and
 * narrow there. Two modules disagreeing about which claims are uncertain is the
 * exact failure this project keeps finding.
 *
 * Throws — it does not answer `false` — when handed something that has no
 * measurable interval, because guards.js throws, and a predicate that quietly
 * says "not wide" about a claim it could not measure is how an unknown becomes
 * a point. Screen the record with guards.auditWideIntervals() if you need a
 * total over a list that might be dirty.
 *
 * @param {object} claim              a record from claims.json
 * @param {number} [ratio]            override the cut; omit to use RULES.wideIntervalRatio
 */
export function qualifiesForTremor(claim, ratio) {
  return isWideInterval(claim, ratio);
}

/** The cut in force right now, from guards.js. Exported so nobody retypes it. */
export function tremorThreshold() {
  return RULES.wideIntervalRatio;
}

/** Amplitude in px: the full 80% interval, in pixels, capped at 6. */
export function tremorAmplitude(ciWidthPx) {
  return Math.max(0, Math.min(VERBS.TREMOR.maxAmplitude, Number(ciWidthPx) || 0));
}

/**
 * THE ONE GATE. Both halves of TREMOR pass through it, and so does tremorStatic.
 *
 * It asks guards.js two questions and answers neither of them itself:
 *
 *   claimInterval(claim)      is this a readable interval? — finite, in order,
 *                             with the central inside it. G1's own reader.
 *   qualifiesForTremor(claim) is it wide enough to tremor at all? — G1's cut.
 *
 * Both were missing somewhere before. The scope rule was enforced in neither
 * half of the verb, so `tremorFull(el, { ciWidthPx: 12 })` shivered a mark with
 * no claim behind it at all, and `tremorStatic({ central: 25, ci80: [20, 30] })`
 * handed back a lozenge for a claim guards.js calls a point. And the interval
 * test was a local one that never checked orientation, so ci80 [360, 96] on a
 * central of 192 stamped data-interval="360–96" — an interval printed
 * backwards, on the exact shape guards.js refuses.
 */
function tremorGate(claim) {
  const interval = claimInterval(claim, 'G1');
  if (!qualifiesForTremor(claim)) {
    const ratio = intervalRatio(claim);
    throw new Error(
      `motion: TREMOR is only for the claims guards.js calls wide, and ` +
      `${claim.id || 'this claim'} is not one of them: its 80% interval is ` +
      `${(ratio * 100).toFixed(1)}% of its central value, at or under the ` +
      `${(RULES.wideIntervalRatio * 100).toFixed(0)}% cut, so guards.isWideInterval() ` +
      `says it may carry a central mark. TREMOR on it would tell the reader the number ` +
      `is less certain than the record says it is, and the verb's own record says ` +
      `"nothing else, ever". Ask qualifiesForTremor(claim) before you call either half.`
    );
  }
  return interval;
}

/**
 * Attach the shiver. `ciWidthPx` is the interval measured in the chart's own
 * pixels — not a made-up constant. `claim` is REQUIRED, exactly as it is on the
 * reduced half: a shiver whose amplitude encodes an interval is a claim about a
 * claim, and this half used to accept one with no claim behind it.
 *
 * The interval is stamped in both modes. The hard rule under this verb — a
 * tremoring claim is never rendered as a point, in ANY motion mode — is not a
 * reduced-motion rule, and leaving `data-interval` to the reduced half both
 * dropped it in full mode and left it behind, stale, on the way back.
 *
 * Returns the handle and the same `spec` the reduced half returns.
 */
export function tremorFull(el, { ciWidthPx, claim } = {}) {
  requireElement(el, 'tremorFull');
  const spec = tremorStatic(claim, ciWidthPx); // refuses before anything is stamped
  const amp = tremorAmplitude(ciWidthPx);
  el.style.setProperty('--p2-tremor-amp', String(amp));
  el.classList.add('p2-tremor');
  el.setAttribute('data-interval', spec.label);
  el.removeAttribute('data-reduced-encoding');
  return {
    ...handle('full', 'TREMOR', Promise.resolve(), () => {
      el.classList.remove('p2-tremor');
      el.style.removeProperty('--p2-tremor-amp');
      el.removeAttribute('data-interval');
    }),
    spec,
  };
}

/**
 * The alternative encoding. Removes the shiver and stamps the element with the
 * descriptor the chart layer must render as a hollow hatched lozenge.
 * Returns the descriptor as well, so a caller can draw it directly.
 *
 * `claim` is REQUIRED and there is no default. This path is the one a
 * screen-reader user and a vestibular-sensitive reader get; it is the strictest
 * of the two, not the loosest. The previous version defaulted `claim` to null,
 * stamped `data-reduced-encoding="lozenge"` anyway and handed back
 * `{ lo: null, hi: null, label: null }` — a lozenge with no endpoints, which is
 * a point wearing a costume, produced by the shortest way to call the function.
 * The spec is built BEFORE the element is touched, so a refusal leaves no
 * half-stamped mark behind for the chart layer to draw.
 */
export function tremorReduced(el, { ciWidthPx, claim } = {}) {
  requireElement(el, 'tremorReduced');
  const spec = tremorStatic(claim, ciWidthPx); // throws before anything is stamped
  el.classList.remove('p2-tremor');
  el.style.removeProperty('--p2-tremor-amp');
  el.setAttribute('data-reduced-encoding', 'lozenge');
  el.setAttribute('data-interval', spec.label);
  return {
    ...handle('reduce', 'TREMOR', Promise.resolve(), () => {
      el.removeAttribute('data-reduced-encoding');
      el.removeAttribute('data-interval');
    }),
    spec,
  };
}

/**
 * The static form, as data the chart layer renders.
 *
 * Every refusal here belongs to guards.js — see tremorGate. This function does
 * not know what a valid interval is, does not know how wide is wide, and reads
 * `lo` and `hi` back out of the reader rather than out of `claim.ci80`, so the
 * printed label cannot be in a different order from the one G1 validated.
 *
 * There is no null-claim escape hatch. `tremorStatic()` with no arguments is
 * the laziest possible call, and it refuses to run rather than returning a
 * blank descriptor that renders as a mark with no interval on it.
 */
export function tremorStatic(claim, ciWidthPx = null) {
  const { low, high } = tremorGate(claim);
  const unit = claim.unit || '';
  return {
    form: 'lozenge',
    lo: low, hi: high,
    label: `${low}–${high}${unit ? ' ' + unit : ''}`,
    centralDrawn: false,
    hatch: true,
    endTicks: true,
    widthPx: ciWidthPx == null ? null : tremorAmplitude(ciWidthPx),
  };
}

/**
 * Walk claims.json and prove the two modules agree, claim by claim.
 *
 * "motion.js has no independent notion of a valid interval" is a claim, and
 * this is the thing that makes it checkable: for every record in the file it
 * compares guards.isWideInterval against qualifiesForTremor, and compares
 * whether guards.claimInterval accepts the claim against whether tremorStatic
 * will draw a lozenge for it. Any disagreement is a second source of truth
 * growing back, and it throws.
 *
 * @param {object|Array} claimsFile  claims.json, or its `claims` array
 */
export function auditTremorScope(claimsFile) {
  const list = Array.isArray(claimsFile) ? claimsFile : (claimsFile && claimsFile.claims);
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('motion: auditTremorScope needs claims.json; got nothing to walk.');
  }
  const disagreements = [];
  let wide = 0, readable = 0, drawn = 0;
  for (const claim of list) {
    let guardWide = null, guardReadable = true;
    try { claimInterval(claim, 'G1'); } catch (_) { guardReadable = false; }
    if (guardReadable) { readable++; try { guardWide = isWideInterval(claim); } catch (_) { guardWide = null; } }
    if (guardWide) wide++;

    let motionWide = null, motionDrew = false;
    try { motionWide = qualifiesForTremor(claim); } catch (_) { motionWide = null; }
    try { tremorStatic(claim); motionDrew = true; drawn++; } catch (_) { motionDrew = false; }

    if (motionWide !== guardWide) {
      disagreements.push({ id: claim.id, why: 'scope', guards: guardWide, motion: motionWide });
    }
    if (motionDrew !== (guardReadable && guardWide === true)) {
      disagreements.push({
        id: claim.id, why: 'lozenge',
        guards: guardReadable && guardWide === true, motion: motionDrew,
      });
    }
  }
  if (disagreements.length) {
    throw new Error(
      `motion: motion.js and guards.js disagree about ${disagreements.length} claim(s) — ` +
      `a second source of truth has grown back:\n  ` +
      disagreements.slice(0, 12).map((d) => JSON.stringify(d)).join('\n  ')
    );
  }
  return {
    total: list.length, readable, wide, lozenges: drawn,
    cut: RULES.wideIntervalRatio, agree: true,
  };
}

export const tremor = dispatch(tremorFull, tremorReduced);

/* ------------------------------------------------------------------ *
 * 8. CUT
 * ------------------------------------------------------------------ */

/**
 * Apply a change with every transition on `scope` suppressed for one frame.
 * Identical in both modes; CUT was already zero.
 */
export function cutFull(apply, scope = null) {
  const el = scope || (hasDom ? document.documentElement : null);
  if (el) el.setAttribute('data-cut', '');
  try { apply(); } finally {
    if (el) { void el.offsetWidth; el.removeAttribute('data-cut'); }
  }
  return handle(motionMode(), 'CUT', Promise.resolve(), noop);
}

export const cutReduced = cutFull;
export const cut = cutFull;

/* ------------------------------------------------------------------ *
 * 9. PULL  — invented timing, see VERBS.PULL.note
 * ------------------------------------------------------------------ */

/** The one teaching tug: ten pixels out, CRANK's 40ms hold, spring back. */
export function pullTugFull(ring, { distance = VERBS.PULL.tugDistance, axis = 'y' } = {}) {
  requireElement(ring, 'pullTugFull', 'ring');
  const t = (d) => (axis === 'x' ? `translateX(${d}px)` : `translateY(${d}px)`);
  const { tugOut, tugBack, hold } = VERBS.PULL;
  const total = tugOut + hold + tugBack;
  const a = animate(ring, [
    { transform: t(0), offset: 0, easing: VERBS.CRANK.easing },
    { transform: t(distance), offset: tugOut / total },
    { transform: t(distance), offset: (tugOut + hold) / total, easing: VERBS.SETTLE.easing },
    { transform: t(0), offset: 1 },
  ], { duration: total, fill: 'none' });
  return handle('full', 'PULL', done(a), () => a && a.cancel());
}

/** No tug. The ring rests 3px proud, which is what a real handle does. */
export function pullTugReduced(ring) {
  requireElement(ring, 'pullTugReduced', 'ring');
  ring.setAttribute('data-pull', 'proud');
  return handle('reduce', 'PULL', Promise.resolve(), () => ring.removeAttribute('data-pull'));
}

export const pullTug = dispatch(pullTugFull, pullTugReduced);

/** Opening the drawer. The travel is SETTLE; only the trigger is PULL. */
export function pullOpenFull(drawer, { open = true } = {}) {
  requireElement(drawer, 'pullOpenFull', 'drawer');
  drawer.classList.toggle('is-open', open);
  const a = animate(drawer, open
    ? [{ transform: 'translateY(101%)' }, { transform: 'translateY(0)' }]
    : [{ transform: 'translateY(0)' }, { transform: 'translateY(101%)' }],
    { duration: VERBS.PULL.duration, easing: VERBS.PULL.easing, fill: 'both' });
  return handle('full', 'PULL', done(a), () => a && a.cancel());
}

export function pullOpenReduced(drawer, { open = true } = {}) {
  requireElement(drawer, 'pullOpenReduced', 'drawer');
  drawer.classList.toggle('is-open', open);
  drawer.style.transform = open ? 'translateY(0)' : 'translateY(101%)';
  const a = animate(drawer, open ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
    { duration: VERBS.PULL.reduced.duration, easing: 'linear', fill: 'both' });
  return handle('reduce', 'PULL', done(a), () => a && a.cancel());
}

export const pullOpen = dispatch(pullOpenFull, pullOpenReduced);

/* ------------------------------------------------------------------ *
 * 10. Small helpers
 * ------------------------------------------------------------------ */

/** Sample a CSS cubic-bezier as a JS easing function. Newton, then bisection. */
export function cubicBezier(x1, y1, x2, y2) {
  const A = (a, b) => 1 - 3 * b + 3 * a, B = (a, b) => 3 * b - 6 * a, C = (a) => 3 * a;
  const calc = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
  const slope = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const s = slope(t, x1, x2);
      if (s === 0) break;
      const e = calc(t, x1, x2) - x;
      if (Math.abs(e) < 1e-6) return calc(t, y1, y2);
      t -= e / s;
    }
    let lo = 0, hi = 1; t = x;
    while (hi - lo > 1e-6) {
      const e = calc(t, x1, x2) - x;
      if (e > 0) hi = t; else lo = t;
      t = (lo + hi) / 2;
    }
    return calc(t, y1, y2);
  };
}

/**
 * Every verb has a reduced twin and every twin states what it carries.
 * Throws if a verb is ever added without one. Run in the demo and in tests —
 * "reduced motion is a complete alternative encoding" is a claim, and this is
 * the thing that makes it checkable.
 */
export function auditReducedCoverage() {
  const missing = [];
  for (const [name, v] of Object.entries(VERBS)) {
    if (!v.reduced) { missing.push(`${name}: no reduced form`); continue; }
    if (!v.reduced.form) missing.push(`${name}.reduced: no form`);
    if (!v.reduced.what) missing.push(`${name}.reduced: no description`);
    if (!v.reduced.carries) missing.push(`${name}.reduced: does not say what information it carries`);
  }
  if (missing.length) throw new Error('motion: reduced-motion coverage is incomplete —\n  ' + missing.join('\n  '));
  return Object.entries(VERBS).map(([name, v]) => ({
    verb: name, invented: !!v.INVENTED,
    full: `${v.duration ?? 0}ms ${v.easing || ''}${v.hold ? ` + ${v.hold}ms hold` : ''}`.trim(),
    reduced: `${v.reduced.form} (${v.reduced.duration}ms)`,
    carries: v.reduced.carries,
  }));
}

/* THERE IS NO auditModeSymmetry(). THAT IS DELIBERATE, AND IT IS RECORDED HERE
 * SO THE NEXT PERSON DOES NOT WRITE IT BACK.
 *
 * One existed. It compared `full.length` against `reduced.length` and threw on a
 * mismatch, and its docstring named the round-two bug — tremorFull accepting a
 * missing claim while tremorReduced refused it — as the thing it caught. It did
 * not catch it. It could not have. `Function.length` counts the parameters
 * before the first default, and every verb here takes its rules inside one
 * destructured options object with a default, so every pair reads 0/0, 1/1 or
 * 2/2 whatever the halves actually require. tremorFull and tremorReduced were
 * 1/1 before that fix and 1/1 after it. The audit passed both times. It also
 * passed, on the day it was deleted, while sweepFull was accepting an `el` that
 * sweepReduced refused — a live divergence of exactly the kind it named.
 *
 * It was not repaired, because the two honest repairs are both worse:
 *
 *   - Declare the required keys as data and check them against what each half
 *     really destructures. That means reading the function's own source, which
 *     is the technique guards.js already recorded as defeated twice on G4 — a
 *     `.bind()`ed function reports `[native code]`, and a literal moves one line
 *     up out of the pattern being read.
 *   - Probe each half by calling it with each rule violated. That is a real
 *     check, and it is what verified this file, but as a shipped export it needs
 *     fixture claims, sacrificial elements and an allowlist for TRAVERSE's
 *     intended asymmetry — and it would still only prove "the rules somebody
 *     thought to probe agree", which is a heuristic wearing a guarantee's name.
 *
 * SO MODE SYMMETRY IS ENFORCED BY REVIEW, and the review question is one line:
 * for every rule either half of a verb applies, does the other half apply it
 * too, or is the difference written down as this file writes down TRAVERSE's?
 * The README says the same thing in the same words. A guard that claims to be a
 * guarantee and is a heuristic is worse than no guard, because everyone
 * downstream stops looking — and for three rounds everyone did.
 */

export default {
  VERBS, REDUCED, SPECIFIED_VERBS, INVENTED_VERBS,
  initMotion, motionMode, setMotionMode, isReduced, prefersReduced, onMotionChange, installMotionToggle,
  settle, settleFull, settleReduced,
  sweep, sweepFull, sweepReduced,
  crank, crankFull, crankReduced,
  traverse, traverseFull, traverseReduced,
  tremor, tremorFull, tremorReduced, tremorStatic, tremorAmplitude, qualifiesForTremor, tremorThreshold,
  auditTremorScope,
  cut, cutFull, cutReduced,
  pullTug, pullTugFull, pullTugReduced, pullOpen, pullOpenFull, pullOpenReduced,
  originGhost, cubicBezier, auditReducedCoverage,
};
