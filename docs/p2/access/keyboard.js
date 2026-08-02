/**
 * `docs/p2/access/keyboard.js` — every interactive, by keyboard alone.
 *
 * Team B8 (`p2-ad-market/BUILD-PLAN.md`). Direction: The Bench.
 *
 * `BUILD-PLAN.md` sets this team one gate: **the whole argument survives with
 * images off and a keyboard only.** This file is the keyboard half.
 *
 * WHAT WAS ALREADY THERE, and this file does not rebuild it. Every control the
 * seven component teams shipped is a real control: the cranks and the auction
 * rockers are `<button>`s, the auction sliders are `<input type="range">`, the
 * organ plates and pull rings are `role="button"` with `tabindex="0"` and their
 * own Enter and Space handlers, the drawer closes on Escape, and the door drum
 * carries `role="slider"`, `tabindex="0"` and Arrow, Home and End — turning
 * through the SAME `turnTo` the drag uses, so the refusal, the rival's answer
 * and the ghost grip all happen on a key press exactly as they do on a drag.
 * `tokens.css` already draws a focus ring on all of them.
 *
 * SO WHAT WAS ACTUALLY WRONG was the ORDER, and one thing missing.
 *
 *   · ORDER. Every button in every rocker was its own tab stop. One era machine
 *     is eight organ plates, eight pull rings and up to eight crank settings —
 *     twenty-four stops before the reader reaches the next thing on the page,
 *     and seven machines is over a hundred and fifty. A composite control is
 *     one stop with arrows inside it. That is what `installRovingGroups` does.
 *
 *   · REACHING A DRAWING AT ALL. A drawing is `role="img"` with a generated
 *     accessible name and no `tabindex`, so a keyboard reader could not land on
 *     one. THE BAND is the sharpest case: it is the object the auction chapter
 *     turns on, its ends and named stops are drawn as separate marks, and the
 *     only way to hear them was one long sentence. `installReadingCursors`
 *     makes every drawing a tab stop and gives it arrow keys that walk its own
 *     readings, one at a time, into a live region.
 *
 * ARROWS MOVE FOCUS AND DO NOT ACTIVATE. That is toolbar behaviour, and here it
 * is also a rule of the design: `motion.js` says CRANK is "never for a change
 * the reader did not make". Arrow-to-select would fire the signature verb on
 * mere navigation, and a reader arrowing past six settings would watch the
 * machine answer six times for nothing. Enter and Space activate, and the
 * components' own handlers do the work.
 *
 * THE READING CURSOR CHANGES NOTHING. It moves a cursor through strings the
 * drawing already says. It sets no value, fires no verb and cannot teach
 * anything the drawing does not already teach, because it has nothing of its
 * own to say.
 */

import { VISUAL_ATTR } from './visuals.js';

/* ------------------------------------------------------------------ *
 * 1 · THE MAP, AS DATA
 *
 * Exported so a report, a README or a demo page can print it beside the
 * findings, the way `guards.js` exports `DEAD_MECHANISM_LINT_LIMITS`. A
 * keyboard map that lives only in prose goes stale the first time a key moves.
 * ------------------------------------------------------------------ */

export const KEYBOARD_MAP = Object.freeze([
  Object.freeze({
    control: 'the crank, on every era machine',
    where: '../eras/era-machine.js · .p2-rocker.p2-era-notches',
    reach: 'Tab lands on the setting in force',
    operate: 'Left and Right move between settings, Home and End jump to the ends, ' +
             'Enter or Space turns the machine to the setting under focus',
    owner: 'B3 built the buttons and the CRANK; B8 made the group one tab stop',
  }),
  Object.freeze({
    control: 'the eight organ plates, on every era machine',
    where: '../eras/era-machine.js · g.p2-era-plate',
    reach: 'Tab lands on the plate that is open, or on the first',
    operate: 'Left and Right move along the eight, Enter or Space opens the one under focus',
    owner: 'B3 built the plates; B8 made the eight one tab stop',
  }),
  Object.freeze({
    control: 'the pull ring, on every organ',
    where: '../eras/pull-ring.js · g.p2-ring',
    reach: 'Tab lands on the first ring',
    operate: 'Left and Right move along the rings, Enter or Space pulls the one under ' +
             'focus and opens its cross-era drawer, Escape closes the drawer',
    owner: 'B3 built the ring, its keys and the Escape; B8 made the eight one tab stop',
  }),
  Object.freeze({
    control: 'every auction bench control, and every door bench control',
    where: '../auction/bench.js and ../door/bench.js · .p2-rocker, input[type=range]',
    reach: 'Tab lands on the rocker or the slider',
    operate: 'a slider is a native range: Left and Right step, Home and End jump, ' +
             'Page Up and Page Down take a larger step. A rocker roves: Left and Right ' +
             'move, Enter or Space chooses',
    owner: 'B4 and B5 built native controls; B8 made each rocker one tab stop',
  }),
  Object.freeze({
    control: 'THE BAND',
    where: '../auction/bench.js · .ab-band svg',
    reach: 'Tab lands on the track itself',
    operate: 'Left and Right walk its readings one at a time — the floor, every named ' +
             'stop, the marker and its mode — spoken into a live region. Home and End ' +
             'go to the first and last. It sets nothing; the scenario\'s own control ' +
             'moves the marker',
    owner: 'B4 drew the band and its sentence; B8 made it reachable and gave it a cursor',
  }),
  Object.freeze({
    control: 'THE DOOR DRUM',
    where: '../door/drawing.js · svg.db-wheel--live',
    reach: 'Tab lands on the drum. It is `role="slider"` and its `aria-valuetext` is the ' +
           'whole state sentence, including whose hand moved it last',
    operate: 'Left, Right, Up, Down, Page Up, Page Down move one notch. Home and End go ' +
             'to the ends. Every key press goes through the same `turnTo` as the drag, so ' +
             'a refusal still swings the door, still leaves the ghost grip at the notch ' +
             'the reader reached for, and a raise still moves the rival',
    owner: 'B5 built all of it. B8 verified the percept survives the discrete step and ' +
           'added nothing',
  }),
  Object.freeze({
    control: 'the scenario rail, on the auction bench and on the door bench',
    where: '../auction/bench.js and ../door/bench.js · .ab-rail button, .db-rail button',
    reach: 'Tab lands on the scenario in view, not on the first of eleven',
    operate: 'Left and Right move along the rail, Home and End jump to its ends, Enter or ' +
             'Space shows the scenario under focus',
    owner: 'B7 built the rails; B8 made each one a single tab stop when the layer was mounted ' +
           'on the page. Twenty-two stops became two',
  }),
  Object.freeze({
    control: 'THE CROSS-ERA DRAWER',
    where: '../eras/pull-ring.js · .p2-drawer',
    reach: 'a pull ring opens it, and focus moves to its close button',
    operate: 'Tab and Shift-Tab stay inside it while it is open, because it covers the page ' +
             'and focus underneath is focus the reader cannot see. Escape closes it, and focus ' +
             'goes back to the ring that opened it rather than to the top of the document',
    owner: 'B3 built the drawer, the Escape and the opening focus move; B8 added the trap and ' +
           'the return',
  }),
  Object.freeze({
    control: 'every drawing that is not itself a control',
    where: 'anything stamped data-alt-source',
    reach: 'Tab lands on the drawing',
    operate: 'Left and Right walk what it says, Home and End go to its ends, Escape ' +
             'leaves the cursor where it is and gives the drawing back its own sentence',
    owner: 'B8',
  }),
  Object.freeze({
    control: 'the text-only toggle and the motion toggle',
    where: './text-path.js and ../lib/motion.js',
    reach: 'Tab lands on the rocker',
    operate: 'Left and Right move, Enter or Space chooses',
    owner: 'B8 and B1',
  }),
]);

/* ------------------------------------------------------------------ *
 * 2 · WHAT COUNTS AS A CONTROL, AND WHAT COUNTS AS FOCUSABLE
 *
 * Both are written down as data rather than buried in a condition, because a
 * check whose subject is a selector nobody can read is a check nobody can
 * argue with.
 * ------------------------------------------------------------------ */

/** Shapes that are controls: a reader is meant to work them. */
export const CONTROL_SELECTOR = [
  'button', 'input', 'select', 'textarea', 'summary', 'a[href]',
  '[role="button"]', '[role="slider"]', '[role="checkbox"]', '[role="radio"]',
  '[role="tab"]', '[role="switch"]',
].join(',');

/** Groups that must rove: one tab stop, arrows inside. */
export const ROVING_GROUPS = Object.freeze([
  Object.freeze({ group: '.p2-rocker', items: 'button' }),
  Object.freeze({ group: 'svg', items: 'g.p2-era-plate' }),
  Object.freeze({ group: 'svg', items: 'g.p2-ring' }),
  /* THE TWO SCENARIO RAILS, added when this layer was mounted on the shipped
   * page rather than on the demo. The auction rail is eleven buttons and the
   * door rail is eleven more: twenty-two stops a reader has to walk past to
   * reach the instrument those buttons drive, and every one of them is a
   * one-of-many choice, which is the shape this whole section is for. They mark
   * the chosen one with `aria-current`, which is why `activeIndex` reads it. */
  Object.freeze({ group: '.ab-rail', items: 'button' }),
  Object.freeze({ group: '.db-rail', items: 'button' }),
]);

/**
 * The one selector that says "this element is inside something that roves".
 *
 * DERIVED from `ROVING_GROUPS` and not written out again. Two checks below need
 * it, and both used to carry their own hand-written copy — `.p2-rocker, svg` —
 * which was already one group short of the list the day it was written. A
 * roving member whose group is not in that copy is reported as a control no
 * keyboard can reach, and `installKeyboard` throws on it: the page would refuse
 * to finish loading because a fix was working.
 */
export const ROVING_GROUP_SELECTOR = [...new Set(ROVING_GROUPS.map((g) => g.group))].join(',');

function isHidden(el) {
  if (el.closest('[hidden]')) return true;
  if (typeof getComputedStyle !== 'function') return false;
  const style = getComputedStyle(el);
  return style.display === 'none' || style.visibility === 'hidden';
}

/** Focusable by keyboard: it has a tab stop of its own, or it is one natively. */
export function isFocusable(el) {
  if (!el || el.nodeType !== 1) return false;
  if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') return false;
  if (isHidden(el)) return false;
  const tabindex = el.getAttribute('tabindex');
  if (tabindex != null) return Number(tabindex) >= 0;
  const tag = el.tagName.toLowerCase();
  if (['button', 'input', 'select', 'textarea', 'summary'].includes(tag)) return true;
  return tag === 'a' && el.hasAttribute('href');
}

/**
 * The accessible name, by a STATED and SIMPLIFIED rule.
 *
 * This is not the full accessible-name computation and it does not claim to be:
 * it reads `aria-label`, then `aria-labelledby`, then an SVG `<title>` child,
 * then the element's own text, then `value` and `title`. Everything this
 * project renders names itself in one of those five ways.
 *
 * Saying which rule is being applied is the point. A guard that says "has an
 * accessible name" and means "has one of five attributes" is the shape this
 * project keeps paying for; this one says the five.
 */
export function accessibleName(el) {
  const aria = el.getAttribute && el.getAttribute('aria-label');
  if (aria && aria.trim()) return aria.trim();
  const by = el.getAttribute && el.getAttribute('aria-labelledby');
  if (by) {
    const names = by.split(/\s+/)
      .map((id) => el.ownerDocument.getElementById(id))
      .filter(Boolean)
      .map((n) => n.textContent.trim())
      .filter(Boolean);
    if (names.length) return names.join(' ');
  }
  const title = el.querySelector && el.querySelector(':scope > title');
  if (title && title.textContent.trim()) return title.textContent.trim();
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
  if (text) return text;
  for (const attr of ['value', 'title', 'alt']) {
    const v = el.getAttribute && el.getAttribute(attr);
    if (v && v.trim()) return v.trim();
  }
  return '';
}

/* ------------------------------------------------------------------ *
 * 3 · ROVING TABINDEX
 * ------------------------------------------------------------------ */

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown']);
const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp']);

/* `aria-current` is in this list because the two scenario rails mark their
 * chosen button with it and with nothing else. Without it the tab stop of an
 * eleven-button rail sits on button one forever, so a reader who chose scenario
 * seven, tabbed away and came back would land at the start and have to walk the
 * rail again to find where they were. */
function activeIndex(items) {
  const pressed = items.findIndex((n) => n.getAttribute('aria-pressed') === 'true'
    || n.getAttribute('aria-selected') === 'true'
    || n.getAttribute('aria-current') === 'true'
    || n.getAttribute('data-selected') === 'true');
  return pressed >= 0 ? pressed : 0;
}

function setRove(items, index) {
  items.forEach((node, i) => node.setAttribute('tabindex', i === index ? '0' : '-1'));
}

/**
 * Make one composite control a single tab stop with arrows inside it.
 *
 * Re-applied on every sync, because the components rewrite `aria-pressed` when
 * the reader moves a control and a roving set whose tab stop has drifted away
 * from the chosen option puts the reader back at the start of the group.
 */
export function roveGroup(group, itemSelector) {
  const items = [...group.querySelectorAll(itemSelector)];
  if (items.length < 2) return null;
  const sync = () => setRove(items, activeIndex(items));
  sync();

  if (group.__p2Roving) return group.__p2Roving;
  const move = (from, to) => {
    const at = Math.max(0, Math.min(items.length - 1, to));
    if (at === from) return;
    setRove(items, at);
    const node = items[at];
    if (typeof node.focus === 'function') node.focus({ preventScroll: true });
  };
  const onKey = (event) => {
    const from = items.indexOf(event.target.closest(itemSelector));
    if (from < 0) return;
    let to = null;
    if (NEXT_KEYS.has(event.key)) to = from + 1;
    else if (PREV_KEYS.has(event.key)) to = from - 1;
    else if (event.key === 'Home') to = 0;
    else if (event.key === 'End') to = items.length - 1;
    else return;
    event.preventDefault();
    event.stopPropagation();
    move(from, to);
  };
  group.addEventListener('keydown', onKey);
  /* The component owns aria-pressed. When it changes, the tab stop follows it,
   * so a reader who leaves the group and comes back lands on what is chosen. */
  const handle = { sync, items, stop: () => group.removeEventListener('keydown', onKey) };
  group.__p2Roving = handle;
  return handle;
}

/** Every roving group under `root`. Idempotent; safe to call after a repaint. */
export function installRovingGroups(root) {
  const installed = [];
  for (const { group, items } of ROVING_GROUPS) {
    for (const node of root.querySelectorAll(group)) {
      const handle = roveGroup(node, items);
      if (handle) installed.push(handle);
    }
  }
  return installed;
}

/* ------------------------------------------------------------------ *
 * 4 · THE READING CURSOR
 * ------------------------------------------------------------------ */

function liveRegion(doc) {
  let node = doc.getElementById('p2-a11y-live');
  if (!node) {
    node = doc.createElement('p');
    node.id = 'p2-a11y-live';
    node.className = 'p2-sr-only';
    node.setAttribute('aria-live', 'polite');
    node.setAttribute('aria-atomic', 'true');
    doc.body.appendChild(node);
  }
  return node;
}

function readingsOf(svg) {
  const out = [];
  const seen = new Set();
  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType !== 1) continue;
      const tag = (child.tagName || '').toLowerCase();
      if (tag === 'title' || tag === 'desc' || tag === 'text') {
        const value = (child.textContent || '').replace(/\s+/g, ' ').trim();
        if (value && !seen.has(value)) { seen.add(value); out.push(value); }
      }
      if (tag !== 'text') walk(child);
    }
  };
  walk(svg);
  return out;
}

/**
 * Make one drawing reachable, and give it arrow keys that walk what it says.
 *
 * A drawing that is already a control is skipped: the door drum owns Arrow,
 * Home and End for turning the wheel, and a cursor stealing them would be a
 * second meaning for one key on the one control this whole component is about.
 */
export function installReadingCursor(svg) {
  if (svg.getAttribute('role') === 'slider') return null;
  if (svg.__p2Cursor) { svg.__p2Cursor.refresh(); return svg.__p2Cursor; }

  const doc = svg.ownerDocument;
  const name = svg.getAttribute('aria-label') || '';
  let readings = readingsOf(svg);
  let at = -1;
  svg.setAttribute('tabindex', '0');
  svg.setAttribute('data-p2-cursor', String(readings.length));

  const say = (message) => { liveRegion(doc).textContent = message; };
  const speak = () => {
    if (at < 0) { say(name); return; }
    say(`${at + 1} of ${readings.length}. ${readings[at]}`);
  };
  const onKey = (event) => {
    if (!readings.length) return;
    let to = at;
    if (NEXT_KEYS.has(event.key)) to = at + 1;
    else if (PREV_KEYS.has(event.key)) to = at - 1;
    else if (event.key === 'Home') to = 0;
    else if (event.key === 'End') to = readings.length - 1;
    /* Escape leaves the reading cursor, and ONLY if a reading cursor was ever started. This used
     * to return unconditionally, so inside the cross-era drawer a reader whose focus sat on one of
     * the seven drawings pressed Escape, had it eaten by a cursor that had never begun, and had to
     * press it again to close the drawer. Every other control closed on one press. */
    else if (event.key === 'Escape') {
      if (at < 0) return;
      at = -1; speak(); event.preventDefault(); return;
    }
    else return;
    event.preventDefault();
    at = Math.max(0, Math.min(readings.length - 1, to));
    svg.setAttribute('data-p2-cursor-at', String(at));
    speak();
  };
  svg.addEventListener('keydown', onKey);
  svg.addEventListener('focus', () => { if (at < 0) say(name); });

  const handle = {
    svg,
    get readings() { return readings.slice(); },
    get at() { return at; },
    refresh: () => {
      readings = readingsOf(svg);
      at = Math.min(at, readings.length - 1);
      svg.setAttribute('data-p2-cursor', String(readings.length));
    },
    stop: () => svg.removeEventListener('keydown', onKey),
  };
  svg.__p2Cursor = handle;
  return handle;
}

/** Every drawing under `root` that is not itself a control. */
export function installReadingCursors(root) {
  const out = [];
  for (const svg of root.querySelectorAll('[data-alt-source]')) {
    const handle = installReadingCursor(svg);
    if (handle) out.push(handle);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 5 · AN OVERLAY THAT TAKES FOCUS HAS TO GIVE IT BACK
 *
 * The cross-era drawer is `position: fixed` across the bottom of the window at
 * `z-index: 40`, over content the reader cannot see past. `pull-ring.js` builds
 * it right in every other way: it is a `role="dialog"`, it closes on Escape,
 * and it moves focus to its close button when it opens. Two things were
 * missing, and both are properties of the PAGE rather than of the component,
 * which is why they are here and not there.
 *
 *   · WHERE FOCUS GOES WHEN IT CLOSES. The close button is inside an element
 *     that is then hidden, so focus fell to BODY. A keyboard reader who pulled
 *     the fourth ring of the fifth machine was returned to the top of a 600-stop
 *     document and had to tab back down to where they had been standing.
 *
 *   · TAB WHILE IT IS OPEN. Nothing held focus inside it, so Tab walked out of
 *     the drawer and into the page underneath — which is covered by the drawer
 *     and cannot be read. Focus was somewhere the reader could not see.
 *
 * THE TRAP IS WHAT MAKES `aria-modal` TRUE, so this installs it. The drawer is
 * built `aria-modal="false"`, which was the honest declaration for a dialog
 * that did not hold focus. Holding focus and still announcing `false` would be
 * the same disagreement between a thing and its own description that this
 * project keeps paying for, one layer down.
 * ------------------------------------------------------------------ */

/** Everything inside `root` a Tab could land on, in document order. */
function tabbable(root) {
  return [...root.querySelectorAll(`${CONTROL_SELECTOR},[tabindex]`)].filter(isFocusable);
}

/**
 * Hold focus inside an overlay while it is open, and hand it back when it
 * closes.
 *
 * OPEN AND CLOSED ARE READ OFF THE ELEMENT, not tracked here. `hidden` is the
 * component's own signal and the only one that cannot drift from what the
 * reader sees: a second copy of "is it open" kept in this file would be a
 * second answer to a question the DOM already answers.
 *
 * WHERE IT GOES BACK TO is the last thing focused OUTSIDE the dialog. Tracked
 * on `focusin`, so it works whether the drawer was opened from a pull ring by
 * keyboard, by a click, or from anywhere else — the call site does not have to
 * remember, and a call site that has to remember is the shape this project has
 * already lost a guard to. `remember()` is exported for a caller that wants to
 * name the return point itself.
 *
 * NOT COVERED, and stated rather than found: a dialog that closes by being
 * removed from the document rather than hidden. Nothing observes removal, so
 * nothing restores focus. `pull-ring.js` hides.
 */
export function installDialogFocus(dialog, options = {}) {
  const doc = dialog.ownerDocument;
  const { modal = true } = options;
  if (modal) dialog.setAttribute('aria-modal', 'true');

  let opener = null;
  const onFocusIn = (event) => {
    if (dialog.contains(event.target)) return;
    opener = event.target;
  };
  doc.addEventListener('focusin', onFocusIn, true);

  /* TAB, AND SHIFT-TAB, WRAP INSIDE. Escape belongs to the component; this adds
   * no second way to close, because two ways to close is two behaviours to keep
   * in step. */
  const onKey = (event) => {
    if (event.key !== 'Tab' || dialog.hidden) return;
    const items = tabbable(dialog);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const at = doc.activeElement;
    const inside = dialog.contains(at);
    if (event.shiftKey && (!inside || at === first)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (!inside || at === last)) {
      event.preventDefault();
      first.focus();
    }
  };
  dialog.addEventListener('keydown', onKey);

  const restore = () => {
    if (!opener || !opener.isConnected || !isFocusable(opener)) return false;
    opener.focus({ preventScroll: false });
    return true;
  };

  let observer = null;
  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver(() => {
      /* Only when it has just gone away, and only when focus is somewhere the
       * reader can no longer see: inside the hidden drawer, or on BODY because
       * the browser has already dropped it there. Focus the reader has moved on
       * purpose is never taken back. */
      if (!dialog.hidden) return;
      const at = doc.activeElement;
      if (at && at !== doc.body && !dialog.contains(at)) return;
      restore();
    });
    observer.observe(dialog, { attributes: true, attributeFilter: ['hidden'] });
  }

  return Object.freeze({
    dialog,
    remember: (node) => { opener = node || doc.activeElement; },
    get returnsTo() { return opener; },
    restore,
    stop: () => {
      doc.removeEventListener('focusin', onFocusIn, true);
      dialog.removeEventListener('keydown', onKey);
      if (observer) observer.disconnect();
    },
  });
}

/* ------------------------------------------------------------------ *
 * 6 · THE GUARANTEE, AND THE CENSUS
 * ------------------------------------------------------------------ */

export class KeyboardError extends Error {
  constructor(headline, detail, fix) {
    super(`assertKeyboardOperable: ${headline}\n  ${detail}\n  fix: ${fix}`);
    this.name = 'KeyboardError';
  }
}

/**
 * GUARANTEE · every control on the page is reachable by keyboard and named.
 *
 * Covered: every element matching `CONTROL_SELECTOR` that is visible and not
 * disabled must be focusable — a tab stop of its own, or a member of a roving
 * group whose stop is elsewhere in the same group — and must have a non-empty
 * accessible name under the five-way rule in `accessibleName`.
 *
 * NOT COVERED, and both are written down here rather than left to be found:
 *   · this reads the DOM as it stands. A control that appears only after a
 *     repaint is checked only if the check is re-run. `installKeyboard`
 *     re-runs it on the same MutationObserver beat the text path uses.
 *   · a control that is reachable, named, and does the wrong thing. Nothing
 *     here operates anything.
 *
 * AN EMPTY CHECK IS A FAILED CHECK. A page with no controls satisfies every
 * clause above by having nothing to satisfy them, which is what `[].every()`
 * gives you. The result carries `vacuous` and the caller is expected to read
 * it; `installKeyboard` throws on it.
 */
export function assertKeyboardOperable(root, where = 'this page') {
  const controls = [...root.querySelectorAll(CONTROL_SELECTOR)]
    .filter((el) => !el.hasAttribute('disabled') && !isHidden(el)
      && el.getAttribute('aria-hidden') !== 'true');

  const unreachable = [];
  const unnamed = [];
  for (const el of controls) {
    const group = el.getAttribute('tabindex') === '-1' && el.closest(ROVING_GROUP_SELECTOR);
    const roving = Boolean(group && group.querySelectorAll('[tabindex="0"]').length > 0);
    if (!isFocusable(el) && !roving) unreachable.push(el);
    if (!accessibleName(el)) unnamed.push(el);
  }

  const say = (list) => list.slice(0, 4).map(
    (el) => `<${el.tagName.toLowerCase()}${el.className ? ` class="${
      typeof el.className === 'string' ? el.className : el.className.baseVal}"` : ''}>`).join(', ');

  if (unreachable.length) {
    throw new KeyboardError(
      'A CONTROL NO KEYBOARD CAN REACH',
      `${unreachable.length} of ${controls.length} controls on ${where} have no tab stop ` +
      `and are not roving members of a group that has one. The first of them are ` +
      `${say(unreachable)}.`,
      'give it tabindex="0", or put it in a roving group with installRovingGroups()');
  }
  if (unnamed.length) {
    throw new KeyboardError(
      'A CONTROL WITH NOTHING TO ANNOUNCE',
      `${unnamed.length} of ${controls.length} controls on ${where} have no accessible ` +
      `name under the five-way rule. The first of them are ${say(unnamed)}. A reader ` +
      `hearing "button" and nothing else cannot work it.`,
      'give it an aria-label, an aria-labelledby, an SVG <title>, or its own text');
  }

  return Object.freeze({
    controls: controls.length,
    tabStops: controls.filter(isFocusable).length,
    vacuous: controls.length === 0,
    vacuousReason: controls.length === 0
      ? 'no control was found on this page, so this check proved nothing'
      : null,
  });
}

/**
 * ADVICE · the tab order, region by region, so a human can read it.
 *
 * It reports and never throws. What it can say is how many stops each visual
 * costs and in what order they come. What it cannot say is whether that order
 * makes sense to a reader, which is the gate `BUILD-PLAN.md` puts on a person.
 */
export function auditKeyboard(root) {
  const stops = [...root.querySelectorAll('*')].filter(isFocusable);
  const byVisual = new Map();
  for (const el of stops) {
    const region = el.closest(`[${VISUAL_ATTR}]`);
    const key = region ? region.getAttribute(VISUAL_ATTR) : '(outside every visual)';
    byVisual.set(key, (byVisual.get(key) || 0) + 1);
  }
  const drawings = [...root.querySelectorAll('[data-alt-source]')];
  /* Count every roving group, not only the HTML rockers. The first version of
   * this line read `.p2-rocker` alone and reported two on a page carrying
   * three, because the era machine's eight organ plates rove inside an `<svg>`.
   * A census that counts one of the two shapes is a census that will be read as
   * covering both. */
  const roving = new Set();
  for (const { group } of ROVING_GROUPS) {
    for (const node of root.querySelectorAll(group)) if (node.__p2Roving) roving.add(node);
  }
  return Object.freeze({
    tabStops: stops.length,
    perVisual: Object.fromEntries(byVisual),
    drawings: drawings.length,
    drawingsReachable: drawings.filter(isFocusable).length,
    cursors: drawings.filter((d) => d.hasAttribute('data-p2-cursor')).length,
    rovingGroups: roving.size,
    order: stops.slice(0, 60).map((el) => accessibleName(el).slice(0, 48)),
    vacuous: stops.length === 0,
  });
}

/* ------------------------------------------------------------------ *
 * 7 · MOUNTING
 * ------------------------------------------------------------------ */

/**
 * Install the whole keyboard layer over a rendered page, and keep it installed
 * across repaints.
 *
 * The components replace nodes when the reader works a control. A roving group
 * whose items were rebuilt has lost its tab stop, and a drawing that was
 * redrawn has lost its cursor. Both come back on the next observer beat.
 */
export function installKeyboard(root, options = {}) {
  const { observe = true, assert = true } = options;
  const apply = () => {
    installRovingGroups(root);
    installReadingCursors(root);
  };
  apply();
  const census = assert ? assertKeyboardOperable(root) : null;
  if (assert && census.vacuous) {
    throw new KeyboardError(
      'NOTHING TO CHECK',
      'this page has no controls at all, so the keyboard check passed by having ' +
      'nothing to fail on.',
      'mount the components before installing the keyboard layer, or pass ' +
      '{ assert: false } if this really is a page of prose');
  }

  let observer = null;
  if (observe && typeof MutationObserver === 'function') {
    let queued = false;
    observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      /* setTimeout and not requestAnimationFrame. Chrome does not run rAF in a
       * background tab, so a flag set on the first repaint is never cleared and
       * the layer stops re-arming: a reader who cranks a machine with the tab
       * behind another one gets a rebuilt control with no tab stop and a
       * redrawn drawing with no cursor. The `finally` is for the same reason
       * one level down. */
      setTimeout(() => { try { apply(); } finally { queued = false; } }, 0);
    });
    observer.observe(root, { childList: true, subtree: true });
  }
  return Object.freeze({
    ...(census || {}),
    refresh: apply,
    stop: () => { if (observer) observer.disconnect(); },
  });
}

export default {
  KEYBOARD_MAP, CONTROL_SELECTOR, ROVING_GROUPS, ROVING_GROUP_SELECTOR,
  isFocusable, accessibleName, roveGroup, installRovingGroups,
  installReadingCursor, installReadingCursors, installDialogFocus,
  assertKeyboardOperable, auditKeyboard, installKeyboard, KeyboardError,
};
