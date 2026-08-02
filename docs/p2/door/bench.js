/**
 * docs/p2/door/bench.js — the apparatus.
 *
 * Team B5. One instrument, eleven stops, three acts.
 *
 * ======================================================================
 * THE ZONES NEVER MOVE
 *
 *   LEFT     the settings this stop stands on, and every handle the reader's
 *            hand can reach — including the wheel, which is not theirs alone
 *   CENTRE   the drawing. Three forms and no fourth: the machine, the bars,
 *            the exposure band
 *   RIGHT    the money. What goes back out the door, what answering costs,
 *            what the buyer keeps
 *
 * Under it: the note, the captions the record requires, the verdict register,
 * and the arithmetic line by line with the expression behind every figure.
 *
 * ======================================================================
 * WHAT THIS FILE DOES NOT DO
 *
 * It draws what it is handed. Every figure arrives already minted by
 * `figures.js`, so there is no number here to format wrong; every share arrives
 * with its denominator attached, so there is no basis here to lose; and every
 * figure off the wheel arrives with a settlement, so there is no way to print
 * the revenue share without the sentence saying which hand last moved it.
 *
 * ======================================================================
 * THE WHEEL'S CONTROL IS THE WHEEL
 *
 * There is no range input on this bench and no control anywhere reporting into
 * the drum. The reader grabs the drum.
 *
 * WHAT THIS REPLACES. The wheel used to be mounted as a plain `<input
 * type="range">` in the LEFT column under a heading, while the drum, the grip,
 * the pawl, the held ground and the ceiling stop were 421 units lower and in
 * the CENTRE column. With the drum centred in a 1009px viewport the slider sat
 * at y = -42: there was no scroll position at which both were on screen. The
 * gesture and the answer to it could never be seen together, and the answer is
 * the entire component. Under the slider sat a caption saying the wheel was not
 * yours alone — the printed answer `DESIGN.md` rejected, at the exact point of
 * contact.
 *
 * Now the gesture and every answer to it are one object inside a 222-unit band:
 * the grip on the drum, the shaded ground under it, the hard stop at its edge,
 * the ceiling post, and the rival's pawl below. Turning below the rival's
 * standing bid still refuses, and the refusal is drawn where the hand is — a
 * ghost grip at the notch the reader reached for and the return arc back.
 *
 * THE DOOR COMES BACK. The swing to the rival is an event with a length.
 * `wheel.rest()` ends it, this file schedules that, and re-entering a stop
 * rests the wheel first — so no reader meets a door still swung on a refusal
 * from a minute ago while three cups fill from the lane it says is empty.
 *
 * And when the reader's raise is answered, the rival's pawl moves on its own,
 * with TRAVERSE rather than CRANK. Two verbs, and the second one is the one the
 * reader did not cause.
 *
 * ======================================================================
 * THE GATE RUNS HERE, NOT ONLY AT THE FOOT OF THE DEMO PAGE
 *
 * `paint()` re-derives every figure the stop is about to show against the
 * record before it touches the DOM, and refuses to draw if any of them fails.
 * The demo page's gate is a report; this is the guard. A consumer embedding
 * this component gets both, because both are in the module they imported.
 * ======================================================================
 */

import { crank, traverse } from '../lib/motion.js';
import { domSentences } from '../auction/bench.js';
import { lintRenderedStrings } from '../auction/panels.js';
import { STRUCTURE } from '../eras/organs.js';
import {
  STOPS, ACTS, stopByNumber, defaultState, viewFigures, viewStamps,
  mintStop, scopeSentence,
} from './scenarios.js';
import { drawMachine, drawWheel, drawBars, drawCurve, machineAlt } from './drawing.js';
import { makeWheel, wheelSentence } from './wheel.js';
import { assertFiledTotalsClose, assertClaimCopiesAgree } from './engine.js';
import { checkFiguresAgainstRecord } from './gate.js';
import { figureText, figureQualifiers, figureSentence, isSplit, splitSentence, percent } from './figures.js';

export { domSentences };

export class DoorBenchError extends Error {
  constructor(message, detail = null) {
    super(message);
    this.name = 'DoorBenchError';
    this.detail = detail;
  }
}

/** How long the door stays swung on a refused reach, in milliseconds. */
const REFUSAL_MS = 900;

/* ------------------------------------------------------------------ *
 * small DOM helpers
 * ------------------------------------------------------------------ */

function tag(name, className, parent, textContent) {
  const node = document.createElement(name);
  if (className) node.className = className;
  if (textContent != null) node.textContent = textContent;
  if (parent) parent.appendChild(node);
  return node;
}
const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); };

/* ------------------------------------------------------------------ *
 * 1 · CONTROLS
 * ------------------------------------------------------------------ */

function controlShape(controls) {
  return controls.map((c) => `${c.id}:${c.kind}`).join('|');
}

/**
 * THERE IS NO WHEEL CONTROL IN THE LEFT COLUMN, AND THIS IS WHERE THAT IS SAID.
 *
 * WHY IT IS EXPORTED. The check used to live as an `else if` branch inside
 * `buildControl`, which is module-private, and every control it can ever see
 * comes off a frozen `STOPS` entry. No public path could hand it a control with
 * `kind: 'wheel'`, so no test could fire it — the exact shape of the defect this
 * folder's own "THE CHECK THAT COULD NOT FIRE" section describes. It is a pure
 * function over a plain object now. `buildControl` calls it on every control it
 * mounts, and `door.test.js` fires it directly with a control no scenario would
 * ever declare.
 *
 * It is a tripwire rather than a live guard: what it defends is a decision, and
 * the next person to reach for a slider should meet the reason before the diff.
 */
export function assertNoWheelControl(control, where = 'the left column') {
  if (!control || control.kind !== 'wheel') return control;
  throw new DoorBenchError(
    `"${control.id}" asks for a wheel control in ${where}. The wheel IS the control on ` +
    'this bench: the reader grabs the drum, and the resistance, the pawl, the held ground and ' +
    'the ceiling stop are all at the point of contact. A slider here would be 421 units above ' +
    'the drum in a different column, where no scroll position shows both.',
    control
  );
}

function buildControl(host, control, state, handlers) {
  assertNoWheelControl(control);
  const wrap = tag('div', 'db-ctl', host);
  const id = `db-${control.id}-${Math.random().toString(36).slice(2, 7)}`;
  const mounted = { control, wrap, kind: control.kind };

  if (control.kind === 'rocker') {
    tag('div', 'p2-arch', wrap, control.label);
    const rocker = tag('div', 'p2-rocker', wrap);
    rocker.setAttribute('role', 'group');
    rocker.setAttribute('aria-label', control.label);
    mounted.buttons = control.options.map((option) => {
      const button = tag('button', null, rocker, option.label);
      button.type = 'button';
      button.value = String(option.value);
      button.setAttribute('aria-pressed', String(String(state[control.id]) === String(option.value)));
      /* Read the value off the button at click time. A synced rocker can carry
       * different option values than the one that was mounted, and a handler
       * holding the old ones sends a stale reading. */
      button.addEventListener('click', () => handlers.onRocker(mounted.control, button.value, button));
      return button;
    });
  } else {
    const label = tag('label', 'p2-arch', wrap, control.label);
    label.setAttribute('for', id);
    const row = tag('div', 'db-ctl-row', wrap);
    const input = tag('input', 'db-range', row);
    input.type = 'range';
    input.id = id;
    input.min = String(control.min);
    input.max = String(control.max);
    input.step = String(control.step);
    input.value = String(state[control.id] ?? control.min);
    input.setAttribute('aria-label', control.label);
    const out = tag('output', 'p2-num db-ctl-value', row, formatControlValue(control, Number(input.value)));
    mounted.input = input;
    mounted.output = out;
    input.addEventListener('input', () => {
      out.textContent = formatControlValue(mounted.control, Number(input.value));
      handlers.onRange(mounted.control, Number(input.value), input);
    });
    if (control.stops && control.stops.length) {
      const list = tag('div', 'p2-chrome db-stops', wrap);
      list.textContent = `stops the record names: ${control.stops
        .map((s) => formatControlValue(control, s)).join(' · ')}`;
    }
  }
  mounted.note = control.note ? tag('p', 'p2-chrome db-ctl-note', wrap, control.note) : null;
  return mounted;
}

function syncControl(mounted, control, state, holding) {
  mounted.control = control;
  if (mounted.note && control.note && mounted.note.textContent !== control.note) {
    mounted.note.textContent = control.note;
  }
  if (mounted.kind === 'rocker') {
    control.options.forEach((option, i) => {
      const button = mounted.buttons[i];
      if (!button) return;
      if (button.textContent !== option.label) button.textContent = option.label;
      button.value = String(option.value);
      button.setAttribute('aria-pressed', String(String(state[control.id]) === String(option.value)));
    });
    return;
  }
  const input = mounted.input;
  if (input.min !== String(control.min)) input.min = String(control.min);
  if (input.max !== String(control.max)) input.max = String(control.max);
  if (input.step !== String(control.step)) input.step = String(control.step);
  const live = Number(state[control.id] ?? control.min);
  if (input !== holding && Number(input.value) !== live) input.value = String(live);
  mounted.output.textContent = formatControlValue(control, Number(input.value));
}

function formatControlValue(control, value) {
  if (control.unit === 'm') return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}m`;
  if (control.unit === 'x') return `${value.toFixed(1)}x`;
  if (control.unit === '%') return percent(value, 1);
  return String(value);
}

/* ------------------------------------------------------------------ *
 * 2 · THE BENCH
 * ------------------------------------------------------------------ */

/**
 * Render the door bench into `root`.
 *
 * Returns a controller: `show(n)` moves to a stop, `view` is the live view
 * model, `wheelFor(id)` hands back the wheel a stop is holding, and
 * `sentences()` reads every reader-facing string off the rendered DOM.
 */
export function renderDoorBench(root, options = {}) {
  const params = options.params;
  const mechanism = options.mechanism;
  const claims = options.claims;
  const state = { stopNumber: options.stop || 1, controls: {} };
  const wheels = new Map();

  /* THE RECORD'S OWN GUARDS, IN THE MODULE THE CONSUMER IMPORTED.
   * Build note 10 and the two copies of the 31 distribution claims used to run
   * only at the foot of the demo page, so a consumer embedding this component
   * got neither. */
  assertFiledTotalsClose(mechanism);
  assertClaimCopiesAgree(mechanism, claims);

  const shell = tag('section', 'db', root);
  const head = tag('header', 'db-head', shell);
  const eyebrow = tag('div', 'p2-arch db-eyebrow', head);
  const teach = tag('h3', 'db-teach', head);
  const scopeLine = tag('p', 'p2-chrome db-scope', head);

  const frameEl = tag('div', 'db-frame', shell);
  /* THE WHEEL'S OWN ROW, ACROSS THE WHOLE FRAME.
   * It is first because it is the control, and it spans all three columns
   * because at 940 units inside a 812px centre column the last notch — 91 per
   * cent, the endpoint of the ratchet and the whole destination of the third
   * mechanic — was scrolled off the right on every laptop. */
  const wheelZone = tag('div', 'db-zone db-zone--wheel', frameEl);
  tag('div', 'p2-arch db-zone-label', wheelZone, 'The revenue share');
  /* ONE WHEEL HOST FOR THE LIFE OF THE BENCH, emptied and redrawn rather than
   * rebuilt. A drag crosses notches, every notch repaints, and a host replaced
   * mid-gesture measures zero wide — so the drum would come loose in the
   * reader's hand at the first notch they crossed, which is the first moment
   * the rival pushes back. */
  const wheelHost = tag('div', 'db-wheel-host', wheelZone);
  const inputsZone = tag('div', 'db-zone db-zone--inputs', frameEl);
  const drawZone = tag('div', 'db-zone db-zone--draw', frameEl);
  const moneyZone = tag('div', 'db-zone db-zone--money', frameEl);

  tag('div', 'p2-arch db-zone-label', inputsZone, 'What this stop stands on');
  const settingsHost = tag('div', 'db-settings-host', inputsZone);
  const controlsHost = tag('div', 'db-controls', inputsZone);

  const note = tag('p', 'p2-prose db-note', shell);
  const live = tag('p', 'p2-visually-hidden', shell);
  live.setAttribute('aria-live', 'polite');
  const captions = tag('div', 'db-captions', shell);
  const register = tag('div', 'db-register', shell);
  const ledger = tag('details', 'db-ledger', shell);

  let current = null;
  let advisory = null;
  let mountedControls = [];
  let mountedShape = null;
  let pendingRival = null;   /* { from, to } when the rival's pawl has to travel */
  let restTimer = null;      /* the end of a refusal: the door coming back */
  let lastGate = null;

  function wheelFor(stop, { rest = true } = {}) {
    if (!stop.wheel) return null;
    if (!wheels.has(stop.id)) {
      const w = makeWheel(mechanism, params, { mode: stop.wheel });
      w.open();
      wheels.set(stop.id, w);
    }
    const wheel = wheels.get(stop.id);
    /* A STOP IS NEVER ENTERED MID-REFUSAL. The swing is an event, and a reader
     * arriving at this stop did not make it. */
    if (rest) wheel.rest();
    return wheel;
  }

  function syncControls(controls, controlState, holding) {
    const shape = controlShape(controls);
    if (shape !== mountedShape) {
      clear(controlsHost);
      mountedControls = controls.map((c) => buildControl(controlsHost, c, controlState, handlers));
      mountedShape = shape;
      controls.forEach((c, i) => syncControl(mountedControls[i], c, controlState, null));
      return;
    }
    controls.forEach((control, i) => syncControl(mountedControls[i], control, controlState, holding));
  }

  /** The instrument refuses to draw, and says what it refused. */
  function refuse(message, detail) {
    clear(frameEl);
    const box = tag('div', 'db-refusal', frameEl);
    tag('div', 'p2-arch db-zone-label', box, 'This stop will not draw');
    tag('p', 'p2-prose', box, message);
    throw new DoorBenchError(message, detail);
  }

  function paint(cause, { rest = true } = {}) {
    const stop = stopByNumber(state.stopNumber);
    const panel = mintStop(stop.id, { params, mechanism });
    const wheel = wheelFor(stop, { rest });
    const ctx = {
      mechanism, params, claims,
      settings: panel.settings, record: panel.record, id: stop.id, panel, wheel,
    };
    if (!state.controls[stop.id]) state.controls[stop.id] = defaultState(stop, ctx);
    const view = stop.build(state.controls[stop.id], ctx);

    /* --- THE GATE, BEFORE THE DOM IS TOUCHED ---
     *
     * Every figure this stop is about to put on screen, re-derived here against
     * the frozen record. The demo page runs the same check at the foot of the
     * page as a REPORT; this is the guard, and it is in the module a consumer
     * imports. Without it a corrupted record rendered to the reader while the
     * report at the bottom of the page went red. */
    lastGate = checkFiguresAgainstRecord(viewFigures(view), mechanism, stop.id);
    if (!lastGate.ok) {
      const bad = [...lastGate.failed, ...lastGate.unbacked];
      refuse(
        `${stop.id} shows ${bad.length} figure(s) that do not re-derive from the frozen record` +
        `${lastGate.vacuous ? ', and nothing it shows names a stored step at all' : ''}: ` +
        `${bad.slice(0, 3).map((f) => `"${f.label}"`).join(', ')}. A component that teaches the ` +
        'right lesson with the wrong numbers is not a component, so this one stops instead.',
        lastGate
      );
    }
    current = { stop, panel, view, ctx, wheel };

    /* --- head --- */
    const act = ACTS.find((a) => a.n === stop.act);
    eyebrow.textContent =
      `Stop ${stop.n} of ${STOPS.length} · act ${act.n}, ${act.title} · ${stop.short}`;
    teach.textContent = stop.teaches;
    scopeLine.textContent = scopeSentence(panel);

    /* --- left: the settings this stop stands on, then the handles --- */
    clear(settingsHost);
    const table = tag('table', 'db-settings', settingsHost);
    const hrow = tag('tr', null, tag('thead', null, table));
    tag('th', null, hrow, 'Setting');
    tag('th', 'n', hrow, 'Value');
    const tbody = tag('tbody', null, table);
    for (const [key, value] of Object.entries(panel.settings)) {
      if (key === 'interaction' || key === 'inherits') continue;
      const tr = tag('tr', null, tbody);
      tag('td', null, tr, key.replace(/_/g, ' '));
      tag('td', 'n', tr, Array.isArray(value) ? value.join(' · ') : String(value));
    }
    if (panel.illustrative) {
      tag('p', 'p2-chrome db-illustrative', settingsHost,
        'The record marks this stop illustrative. Every figure standing on an invented input ' +
        'names it beside itself.');
    }
    const controls = stop.controls(ctx, state.controls[stop.id]);
    syncControls(controls, state.controls[stop.id], cause);

    /* --- THE WHEEL, ACROSS THE TOP, AND IT IS THE CONTROL ---
     *
     * Drawn first because the reader's hand goes here first, and spanning the
     * whole frame because the last notch does not fit in the centre column. */
    let wheelHandles = null;
    const hadFocus = Boolean(wheelHost.contains(document.activeElement)
      && document.activeElement !== document.body);
    clear(wheelHost);
    if (view.wheel) {
      wheelZone.hidden = false;
      wheelHandles = drawWheel(wheelHost, view.wheel, {
        pawlAtIndex: pendingRival ? pendingRival.from : null,
        onTurn: view.wheel.mode === 'contested' ? handlers.onWheel : null,
        focus: hadFocus,
      });
    } else {
      wheelZone.hidden = true;
    }

    /* --- centre: three forms and no fourth --- */
    clear(drawZone);
    tag('div', 'p2-arch db-zone-label', drawZone, 'The drawing');
    const drawHost = tag('div', 'db-draw', drawZone);
    if (view.centre === 'machine') {
      drawMachine(drawHost, view.machine, machineAlt(view.machine));
    } else if (view.centre === 'bars') {
      drawBars(drawHost, view.bars, barsAlt(view.bars));
    } else if (view.centre === 'curve') {
      drawCurve(drawHost, view.curve, curveAlt(view.curve, view));
    } else {
      throw new Error(`"${view.centre}" is not one of this bench's three centre forms.`);
    }

    /* --- right: the money --- */
    clear(moneyZone);
    tag('div', 'p2-arch db-zone-label', moneyZone, 'The money');
    const till = tag('dl', 'db-till', moneyZone);
    for (const figure of view.readout) {
      if (isSplit(figure)) {
        tag('dt', 'p2-arch', till, figure.label);
        const dd = tag('dd', 'p2-num', till,
          `${figureText(figure.low)} to ${figureText(figure.high)}`);
        dd.style.color = figure.low.ink;
        tag('div', 'p2-chrome db-qual', till, figure.because);
        continue;
      }
      tag('dt', 'p2-arch', till, figure.label);
      const dd = tag('dd', 'p2-num', till, figureText(figure));
      dd.style.color = figure.ink;
      const quals = figureQualifiers(figure);
      if (quals.length) tag('div', 'p2-chrome db-qual', till, `${quals.join('. ')}.`);
    }

    /* --- the note under the instrument --- */
    note.textContent = view.note;
    live.textContent = `${stop.short}. ${view.readout
      .map((f) => (isSplit(f) ? splitSentence(f) : figureSentence(f))).join(' ')}` +
      `${view.wheel ? ` ${wheelSentence(view.wheel)}` : ''}`;

    /* --- the captions the record requires, verbatim --- */
    clear(captions);
    for (const caption of panel.captions) {
      tag('p', 'p2-chrome db-caption', captions, caption);
    }

    /* --- the verdict register. No correction may be invisible. --- */
    clear(register);
    const stamps = viewStamps(view);
    if (stamps.length) {
      tag('div', 'p2-arch db-zone-label', register, 'Verdicts on the claims this stop draws');
      const list = tag('ul', 'p2-chrome db-stamps', register);
      for (const stamp of stamps) {
        tag('li', null, list, `${stamp.id} — ${stamp.sentence}. ${stamp.statement || ''}`.trim());
      }
    }

    /* --- the ledger --- */
    clear(ledger);
    tag('summary', 'p2-arch', ledger, 'The arithmetic, line by line');
    const ltable = tag('table', 'db-ledger-table', ledger);
    const lhead = tag('tr', null, tag('thead', null, ltable));
    tag('th', null, lhead, 'What it is');
    tag('th', 'n', lhead, 'Value');
    tag('th', null, lhead, 'How it is worked out');
    const lbody = tag('tbody', null, ltable);
    for (const row of viewFigures(view)) {
      const tr = tag('tr', row.step ? null : 'db-derived', lbody);
      tag('td', null, tr, row.step ? row.label : `${row.label} (worked out here)`);
      tag('td', 'n', tr, formatLedger(row.value));
      tag('td', row.step ? 'db-expr' : null, tr, row.step || row.formula);
    }

    /* --- THE PROSE LINT, OVER THE PAGE THAT WAS JUST BUILT ---
     *
     * G7's own lint runs inside `mintStop` and sees the object `mintStop`
     * built. Everything above this line was written by a human and built after
     * that: the teaching sentence, every control note, the note under the
     * instrument, every figure label, every written derivation, every SVG
     * title, the settlement phrases on the wheel. The auction bench proved by
     * injection that a false 2019 sentence in any of those reaches the reader
     * with every guard green, because the string was never read.
     *
     * It is still ADVICE and it still never throws. What changed is what it is
     * aimed at. */
    advisory = lintRenderedStrings(domSentences(shell), `${stop.id} · the door bench`);

    /* --- THE TWO VERBS --- */
    if (cause && cause.isConnected !== false) {
      crank({ input: cause, output: moneyZone });
    }
    if (pendingRival && wheelHandles) {
      /* TRAVERSE, not CRANK. The reader did not move this. */
      const from = wheelHandles.pawlAt(pendingRival.from);
      const to = wheelHandles.pawlAt(pendingRival.to);
      traverse(wheelHandles.pawl, {
        from, to, arc: -22,
        trailLayer: wheelHandles.trailLayer,
        trailStroke: STRUCTURE.stroke,
      });
    }
    pendingRival = null;
    return view;
  }

  const handlers = {
    onRocker(control, value, element) {
      const stop = stopByNumber(state.stopNumber);
      const parsed = value === 'true' ? true : value === 'false' ? false
        : (Number.isNaN(Number(value)) ? value : Number(value));
      state.controls[stop.id] = { ...state.controls[stop.id], [control.id]: parsed };
      paint(element);
    },
    onRange(control, value, element) {
      const stop = stopByNumber(state.stopNumber);
      state.controls[stop.id] = { ...state.controls[stop.id], [control.id]: value };
      paint(element);
    },
    /**
     * THE DRUM WAS TURNED. `asked` comes off the drum itself — a drag, an
     * arrow key, Home or End — and never off a second control.
     */
    onWheel(asked) {
      const stop = stopByNumber(state.stopNumber);
      const wheel = wheelFor(stop);
      const before = wheel.rivalIndex();
      const settlement = wheel.turnTo(asked);
      const after = wheel.rivalIndex();
      if (after !== before) pendingRival = { from: before, to: after };
      /* The refusal is drawn — grip at the notch the reader reached for, the
       * return arc, the door swung, the lane empty — and then it ends. */
      paint(null, { rest: false });
      scheduleRest(settlement);
    },
  };

  /** THE END OF A REFUSAL. The door comes back on its own, and always. */
  function scheduleRest(settlement) {
    if (restTimer != null) { clearTimeout(restTimer); restTimer = null; }
    if (!settlement || !settlement.transient) return;
    if (typeof setTimeout !== 'function') return;
    restTimer = setTimeout(() => {
      restTimer = null;
      const stop = stopByNumber(state.stopNumber);
      const wheel = wheelFor(stop, { rest: false });
      if (!wheel || !wheel.isTransient()) return;
      wheel.rest();
      paint(null);
    }, REFUSAL_MS);
  }

  function show(n) {
    state.stopNumber = n;
    mountedShape = null;
    pendingRival = null;
    if (restTimer != null) { clearTimeout(restTimer); restTimer = null; }
    return paint(null);
  }

  paint(null);

  return {
    show,
    /** Move one control the way a reader's hand would. Used by the sentence sweep. */
    setControl(id, value) {
      const stop = stopByNumber(state.stopNumber);
      state.controls[stop.id] = { ...state.controls[stop.id], [id]: value };
      return paint(null);
    },
    /** Turn the wheel, and let the rival answer. Used by the sweeps. */
    turnWheel(index) {
      const stop = stopByNumber(state.stopNumber);
      const wheel = wheelFor(stop, { rest: false });
      if (!wheel) return null;
      const before = wheel.rivalIndex();
      const settlement = wheel.turnTo(index);
      if (wheel.rivalIndex() !== before) pendingRival = { from: before, to: wheel.rivalIndex() };
      paint(null, { rest: false });
      return settlement;
    },
    /** End a refusal now rather than on the timer. For the tests. */
    restWheel() {
      const stop = stopByNumber(state.stopNumber);
      const wheel = wheelFor(stop, { rest: false });
      if (!wheel) return null;
      const settlement = wheel.rest();
      paint(null);
      return settlement;
    },
    /** What the gate said about the stop now on screen. */
    get gate() { return lastGate; },
    wheelFor: (id) => wheels.get(id) || null,
    get view() { return current && current.view; },
    get panel() { return current && current.panel; },
    get stop() { return current && current.stop; },
    /** What the prose lint saw on the page as drawn. ADVICE, never a clearance. */
    get advisory() { return advisory; },
    /** Every reader-facing string now on screen, read off the rendered DOM. */
    sentences: () => domSentences(shell),
    element: shell,
  };
}

function formatLedger(value) {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 3 });
  return String(Number(value.toFixed(9)));
}

/* ------------------------------------------------------------------ *
 * 3 · THE PLAIN-ENGLISH SENTENCES FOR THE OTHER TWO FORMS
 * ------------------------------------------------------------------ */

export function barsAlt(model) {
  const parts = model.bars.map((bar) => (bar.kind === 'span'
    ? `${bar.label} runs from ${bar.figureText.split('–')[0]} to ${bar.figureText.split('–').pop()}, ` +
      'drawn as a range with no middle'
    : `${bar.label} is ${bar.figureText}${bar.basis ? `, ${bar.basis}` : ''}`));
  return `${model.bars.length} bars on one baseline, measured in ${model.unit}. ` +
    `${parts.join('. ')}.`;
}

export function curveAlt(model, view) {
  return `A band between two curves, with no line down the middle. It shows ${model.y.label} ` +
    `against ${model.x.label}. The band's width is the reported range on the guarantee, which ` +
    'the record will not let this bench draw as a single number. The filed points are marked ' +
    `on the axis. ${model.note}`;
}

/* ------------------------------------------------------------------ *
 * 4 · EVERY STRING THIS BENCH CAN PUT ON SCREEN
 * ------------------------------------------------------------------ */

/**
 * Sweep all eleven stops and every named position of every control, reading the
 * rendered DOM each time.
 *
 * The auction bench learned that a hand-kept list of "everything" is a list of
 * what somebody remembered: its own reached 99 strings while the rendered panel
 * held 569. So this reads the page, and it visits the wheel's notches too —
 * every refusal sentence and every "the rival answered" sentence only exists at
 * a position somebody has to go to.
 */
export function allDoorSentences(options) {
  const host = document.createElement('div');
  const bench = renderDoorBench(host, options);
  const out = [];
  const seen = new Set();
  const take = () => {
    for (const s of bench.sentences()) if (!seen.has(s)) { seen.add(s); out.push(s); }
  };
  for (const stop of STOPS) {
    bench.show(stop.n);
    take();
    const panel = mintStop(stop.id, { params: options.params, mechanism: options.mechanism });
    const ctx = {
      mechanism: options.mechanism, params: options.params, claims: options.claims,
      settings: panel.settings, record: panel.record, id: stop.id, panel,
      wheel: bench.wheelFor(stop.id),
    };
    /* THE DRUM IS SWEPT OFF THE STOP, NOT OFF A CONTROL LIST. It is not a
     * control in the left column any more — it is the drawing — so a sweep that
     * walked the control list would silently stop visiting the notches, and
     * every refusal sentence and every "the rival answered" sentence lives at a
     * position somebody has to go to. */
    if (stop.wheel === 'contested') {
      const wheel = bench.wheelFor(stop.id);
      const count = wheel ? wheel.notches.length : 0;
      for (let pass = 0; pass < 2; pass += 1) {
        for (let i = count - 1; i >= 0; i -= 1) { bench.turnWheel(i); take(); }
        for (let i = 0; i < count; i += 1) { bench.turnWheel(i); take(); }
      }
      /* And the rested state after a refusal, which is a different drawing and
       * a different door from the refusal itself. */
      bench.turnWheel(0); take();
      bench.restWheel(); take();
    }
    for (const control of stop.controls(ctx, defaultState(stop, ctx))) {
      const positions = control.kind === 'rocker'
        ? control.options.map((o) => o.value)
        : [control.min, control.max, ...(control.stops || [])];
      for (const value of positions) { bench.setControl(control.id, value); take(); }
    }
    bench.show(stop.n);
  }
  return out;
}

export default {
  renderDoorBench, allDoorSentences, domSentences, barsAlt, curveAlt, DoorBenchError,
  assertNoWheelControl,
};
