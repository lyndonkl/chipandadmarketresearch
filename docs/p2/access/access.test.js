/**
 * `docs/p2/access/access.test.js` — the bench for the access layer.
 *
 * No framework, no build step. The page prints its own tally; trust that over
 * any number written in the README.
 *
 * EVERY CASE IS A WAY TO MAKE THE ACCESS LAYER LIE. The three shapes this
 * folder can fail in are: a drawing with no authored sentence reaching a
 * reader; a text block that says something the drawing does not; and a control
 * a keyboard cannot reach while a census reports the page green. There is a row
 * for each, and a row for every bypass found while building them.
 *
 * READABILITY IS NOT SCORED HERE, ON PURPOSE. `tools/verify_p2.py b8-alt` scores
 * every visual against all four gates, using `tools/readability.py`'s own code
 * path. A JavaScript port on this page would be a second answer to "what is the
 * grade of this sentence", and the whole lesson of the layers below is that two
 * answers to one question is the defect. This bench checks the SHAPE rules the
 * Python check also enforces, so a drift between the two shows up as a
 * disagreement rather than as silence.
 */

import {
  loadVisuals, useVisuals, everyVisual, getVisual, altSentence,
  declareVisual, declaredVisuals, assertEveryDrawingDeclared,
  VISUAL_ATTR, VisualsError,
} from './visuals.js';
import {
  textBlockFor, renderTextBlock, drawingReadings, installTextPath,
  setTextMode, textMode, auditTextPath,
} from './text-path.js';
import {
  isFocusable, accessibleName, roveGroup, installRovingGroups,
  installReadingCursor, installReadingCursors,
  assertKeyboardOperable, auditKeyboard, installKeyboard,
  KEYBOARD_MAP, KeyboardError,
} from './keyboard.js';

/* ------------------------------------------------------------------ *
 * The runner. `ok()` records any string as a PASS and prints it as the
 * row's detail, which is what makes a census readable — so EVERY ROW WITH
 * SOMETHING TO REPORT THROWS on a mismatch rather than returning a
 * sentence that says it went wrong. That lesson is `eras.test.js`'s and it
 * once cost this project a green run on a red gate.
 * ------------------------------------------------------------------ */

const rows = [];
let host = null;

function ok(section, name, fn) { rows.push({ section, name, fn }); }

function must(cond, message) {
  if (!cond) throw new Error(message);
}

function throws(fn, expect, message) {
  let threw = null;
  try { fn(); } catch (e) { threw = e; }
  if (!threw) throw new Error(`${message} — it did not throw at all`);
  if (expect && !(threw instanceof expect)) {
    throw new Error(`${message} — it threw ${threw.name}, not ${expect.name}`);
  }
  return threw;
}

/** A scratch region, off screen but RENDERED. Chrome does not lay out or run
 *  anything inside a detached node, and a bench that measured one sat green on
 *  a page that could not be operated. The eras bench learned this first. */
function scratch(html = '') {
  const box = document.createElement('div');
  box.style.cssText = 'position:absolute;left:-9999px;top:0;width:900px';
  box.innerHTML = html;
  host.appendChild(box);
  return box;
}

/** A drawing shaped exactly like the ones `svg-kit.svgRoot` mints. */
function fakeDrawing(parent, { alt, titles = [], texts = [], role = 'img' }) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('role', role);
  svg.setAttribute('aria-label', alt);
  svg.setAttribute('data-alt-source', 'generated-by-chart');
  for (const t of titles) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = t;
    g.appendChild(title);
    svg.appendChild(g);
  }
  for (const t of texts) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    node.textContent = t;
    svg.appendChild(node);
  }
  parent.appendChild(svg);
  return svg;
}

/* ================================================================== *
 * 1 · THE RECORD, AND THE BINDING
 * ================================================================== */

ok(1, 'the record loads and holds every visual the piece renders', () => {
  const all = everyVisual();
  must(all.length >= 40, `only ${all.length} visuals in the record`);
  const orders = all.map((r) => r.order);
  must(orders.every((o, i) => i === 0 || o > orders[i - 1]), 'everyVisual is not in order');
  return `${all.length} visuals, in the record's own order`;
});

ok(1, 'CENSUS · what the record covers, by component', () => {
  const per = {};
  for (const row of everyVisual()) per[row.component] = (per[row.component] || 0) + 1;
  const total = Object.values(per).reduce((a, b) => a + b, 0);
  must(total === everyVisual().length, 'the census lost a row');
  must(Object.keys(per).length >= 5, 'fewer than five component groups are covered');
  return Object.entries(per).sort().map(([k, v]) => `${k} ${v}`).join(' · ');
});

ok(1, 'no alt sentence anywhere carries a digit', () => {
  const bad = everyVisual().filter((r) => /[0-9]/.test(r.shows) || /[0-9]/.test(r.finding));
  must(bad.length === 0, `${bad.length} rows carry a digit: ${bad.map((r) => r.id).join(', ')}`);
  return `${everyVisual().length} rows, none carrying a figure the mark beside it also carries`;
});

ok(1, 'every sentence is distinct, and both fields are present', () => {
  const shows = new Set();
  const finding = new Set();
  for (const r of everyVisual()) {
    must(typeof r.shows === 'string' && r.shows.trim(), `${r.id} has no shows`);
    must(typeof r.finding === 'string' && r.finding.trim(), `${r.id} has no finding`);
    must(!shows.has(r.shows), `${r.id} repeats another visual's shows`);
    must(!finding.has(r.finding), `${r.id} repeats another visual's finding`);
    shows.add(r.shows); finding.add(r.finding);
  }
  return `${shows.size} shows and ${finding.size} findings, all distinct`;
});

ok(1, 'the sentence is DERIVED, and no third copy is stored', () => {
  const row = everyVisual()[0];
  must(!('alt' in row), 'the record stores an `alt` field — that is a third copy that can drift');
  must(altSentence(row.id) === `${row.shows} ${row.finding}`, 'altSentence is not the two joined');
  return 'shows + finding, computed on every call';
});

ok(1, 'an id the record does not hold is refused, not answered with null', () => {
  const e = throws(() => getVisual('era-8-machine'), VisualsError,
    'getVisual answered for a visual that does not exist');
  must(/NO SUCH VISUAL/.test(e.message), 'the refusal does not name the problem');
  return e.headline;
});

ok(1, 'declareVisual stamps a known id and refuses an unknown one', () => {
  const box = scratch();
  declareVisual(box, 'era-1-machine');
  must(box.getAttribute(VISUAL_ATTR) === 'era-1-machine', 'the region was not stamped');
  throws(() => declareVisual(box, 'not-a-visual'), VisualsError,
    'declareVisual accepted an id the record does not hold');
  throws(() => declareVisual(null, 'era-1-machine'), VisualsError,
    'declareVisual accepted something that is not an element');
  return 'stamped on a real id, refused on an invented one and on a non-element';
});

ok(1, 'a drawing outside every declared region is refused BY NAME', () => {
  const box = scratch();
  const inside = document.createElement('div');
  declareVisual(inside, 'era-1-machine');
  box.appendChild(inside);
  fakeDrawing(inside, { alt: 'a declared drawing', titles: ['one'] });
  fakeDrawing(box, { alt: 'an orphan drawing nobody authored a sentence for', titles: ['two'] });
  const e = throws(() => assertEveryDrawingDeclared(box), VisualsError,
    'a drawing with no authored sentence reached the reader');
  must(/orphan drawing/.test(e.message), 'the refusal does not quote the drawing it found');
  return 'one of two drawings undeclared, refused with its own accessible name in the message';
});

ok(1, 'a page with no drawing at all reports VACUOUS rather than passing', () => {
  const box = scratch('<p>prose and nothing else</p>');
  const census = assertEveryDrawingDeclared(box);
  must(census.vacuous === true, 'an empty page reported itself checked');
  must(census.vacuousReason, 'the vacuous result carries no reason');
  return census.vacuousReason;
});

/* ================================================================== *
 * 2 · THE TEXT PATH
 * ================================================================== */

ok(2, 'a text block carries the authored finding and the drawing\'s own readings', () => {
  const box = scratch();
  declareVisual(box, 'auction-band');
  fakeDrawing(box, {
    alt: 'the band, from the floor to the ceiling',
    titles: ['the lowest amount the seller could collect'],
    texts: ['$440', '$760'],
  });
  const block = textBlockFor('auction-band', box);
  const row = getVisual('auction-band');
  must(block.finding === row.finding, 'the block does not carry the record\'s finding');
  must(block.readings === 3, `expected three readings, got ${block.readings}`);
  must(!block.vacuous, 'a block with three readings called itself vacuous');
  return `${block.readings} readings, and the finding straight off the record`;
});

ok(2, 'EVERY string in the table is a string the drawing says. Nothing is invented', () => {
  const box = scratch();
  declareVisual(box, 'auction-band');
  const svg = fakeDrawing(box, {
    alt: 'the band', titles: ['the floor', 'the ceiling'], texts: ['$440', '$760'],
  });
  renderTextBlock(box, 'auction-band');
  const said = new Set(drawingReadings(svg));
  const printed = [...box.querySelectorAll('.p2-text-reading')].map((td) => td.textContent);
  must(printed.length > 0, 'the table printed nothing');
  const invented = printed.filter((p) => !said.has(p));
  must(invented.length === 0, `the table invented ${invented.length}: ${invented.join(' | ')}`);
  return `${printed.length} table rows, every one a string the drawing already said`;
});

ok(2, 'a region whose drawings say nothing draws a NAMED ABSENCE, not an empty table', () => {
  const box = scratch();
  declareVisual(box, 'chart-rail-board');
  fakeDrawing(box, { alt: 'a drawing that says nothing at all' });
  const block = textBlockFor('chart-rail-board', box);
  must(block.vacuous === true, 'a silent drawing reported itself readable');
  renderTextBlock(box, 'chart-rail-board');
  const absence = box.querySelector('.p2-text-absence');
  must(absence, 'no absence object was drawn');
  must(absence.textContent.trim().length > 20, 'the absence has no printed reason');
  must(!box.querySelector('.p2-text-table'), 'an empty table was drawn beside the absence');
  return block.vacuousReason;
});

ok(2, 'a region holding no drawing is vacuous too, and says so', () => {
  const box = scratch('<p>a chapter paragraph</p>');
  declareVisual(box, 'chart-gdp-strip');
  const block = textBlockFor('chart-gdp-strip', box);
  must(block.vacuous === true, 'a region with no drawing reported itself readable');
  return block.vacuousReason;
});

ok(2, 'rebuilding a block replaces it — a repaint never leaves two', () => {
  const box = scratch();
  declareVisual(box, 'toll-plate-era-7');
  fakeDrawing(box, { alt: 'three readings on three bases', titles: ['one', 'two'] });
  renderTextBlock(box, 'toll-plate-era-7');
  renderTextBlock(box, 'toll-plate-era-7');
  renderTextBlock(box, 'toll-plate-era-7');
  const blocks = box.querySelectorAll('.p2-text-block');
  must(blocks.length === 1, `${blocks.length} blocks after three renders`);
  return 'three renders, one block';
});

ok(2, 'the text follows the drawing. Change what the drawing says and the table changes', () => {
  const box = scratch();
  declareVisual(box, 'door-wheel');
  const svg = fakeDrawing(box, { alt: 'the drum', titles: ['the rival opened here'] });
  renderTextBlock(box, 'door-wheel');
  const before = box.querySelector('.p2-text-reading').textContent;
  svg.querySelector('title').textContent = 'the rival has moved a notch';
  renderTextBlock(box, 'door-wheel');
  const after = box.querySelector('.p2-text-reading').textContent;
  must(before !== after, 'the table did not follow the drawing');
  must(after === 'the rival has moved a notch', `the table says ${after}`);
  return `"${before}" became "${after}"`;
});

ok(2, 'installTextPath refuses a page that declared nothing', () => {
  const box = scratch('<p>prose</p>');
  const e = throws(() => installTextPath(box, { observe: false }), VisualsError,
    'the text path installed itself over a page it covers none of');
  must(/NOTHING WAS DECLARED/.test(e.message), 'the refusal does not say what is wrong');
  return e.headline;
});

ok(2, 'the mode is stamped on the root, with where it came from', () => {
  setTextMode('on');
  must(document.documentElement.getAttribute('data-p2-text') === 'on', 'the mode was not stamped');
  must(document.documentElement.getAttribute('data-p2-text-source') === 'set',
    'the source of the mode is not recorded');
  setTextMode('off');
  must(document.documentElement.getAttribute('data-p2-text') === 'off', 'the mode did not come back');
  return 'on, off, and the source beside it in the DOM';
});

ok(2, 'the audit reports what the page misses rather than reporting nothing', () => {
  const box = scratch();
  const one = document.createElement('div');
  declareVisual(one, 'era-2-machine');
  box.appendChild(one);
  fakeDrawing(one, { alt: 'the sponsorship machine', titles: ['METER'] });
  const report = auditTextPath(box);
  must(report.onThisPage === 1, `the audit found ${report.onThisPage} regions`);
  must(report.missing.length === everyVisual().length - 1,
    'the audit did not report the visuals this page does not carry');
  return `${report.onThisPage} of ${report.inTheRecord} on this page, ` +
         `${report.missing.length} named as missing`;
});

/* ================================================================== *
 * 3 · THE KEYBOARD
 * ================================================================== */

ok(3, 'CENSUS · the keyboard map, one row per interactive', () => {
  must(KEYBOARD_MAP.length >= 7, 'the map covers fewer than seven interactives');
  for (const row of KEYBOARD_MAP) {
    must(row.control && row.where && row.reach && row.operate && row.owner,
      `${row.control} has an incomplete row`);
  }
  return KEYBOARD_MAP.map((r) => r.control.split(',')[0]).join(' · ');
});

ok(3, 'isFocusable knows a tab stop from a thing that only looks like one', () => {
  const box = scratch(`
    <button id="a">a</button>
    <button id="b" disabled>b</button>
    <div id="c" role="button">c</div>
    <div id="d" role="button" tabindex="0">d</div>
    <div id="e" role="button" tabindex="-1">e</div>
    <a id="f">f</a><a id="g" href="#x">g</a>`);
  const at = (id) => isFocusable(box.querySelector(`#${id}`));
  must(at('a'), 'a plain button is not focusable');
  must(!at('b'), 'a disabled button counted as focusable');
  must(!at('c'), 'a role=button with no tabindex counted as focusable');
  must(at('d'), 'a role=button with tabindex=0 is not focusable');
  must(!at('e'), 'tabindex=-1 counted as a tab stop');
  must(!at('f'), 'an anchor with no href counted as focusable');
  must(at('g'), 'an anchor with an href is not focusable');
  return 'seven shapes, seven right answers';
});

ok(3, 'a rocker becomes ONE tab stop with arrows inside it', () => {
  const box = scratch(`<div class="p2-rocker" role="group" aria-label="the commission">
    <button aria-pressed="false">1</button><button aria-pressed="true">2</button>
    <button aria-pressed="false">3</button><button aria-pressed="false">4</button></div>`);
  const group = box.querySelector('.p2-rocker');
  roveGroup(group, 'button');
  const stops = [...group.querySelectorAll('button')].filter(isFocusable);
  must(stops.length === 1, `${stops.length} tab stops in one rocker`);
  must(stops[0].textContent === '2', 'the tab stop is not the setting in force');
  return 'four settings, one tab stop, and it is the one in force';
});

ok(3, 'arrows move focus and DO NOT activate — CRANK is never fired by navigation', () => {
  const box = scratch(`<div class="p2-rocker" role="group" aria-label="the rate card">
    <button aria-pressed="true">1</button><button aria-pressed="false">2</button>
    <button aria-pressed="false">3</button></div>`);
  const group = box.querySelector('.p2-rocker');
  let clicks = 0;
  for (const b of group.querySelectorAll('button')) b.addEventListener('click', () => { clicks += 1; });
  roveGroup(group, 'button');
  const first = group.querySelector('button');
  first.focus();
  first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  must(document.activeElement.textContent === '2', 'ArrowRight did not move the focus');
  must(clicks === 0, `navigation fired ${clicks} clicks — that is a crank the reader did not make`);
  document.activeElement.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  must(document.activeElement.textContent === '3', 'End did not reach the last setting');
  document.activeElement.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
  must(document.activeElement.textContent === '1', 'Home did not reach the first setting');
  return 'right, End, Home — focus moved three times and the machine never turned';
});

ok(3, 'the roving stop follows the component when the reader changes the setting', () => {
  const box = scratch(`<div class="p2-rocker" role="group" aria-label="the impression">
    <button aria-pressed="true">1</button><button aria-pressed="false">2</button></div>`);
  const group = box.querySelector('.p2-rocker');
  const handle = roveGroup(group, 'button');
  const [one, two] = group.querySelectorAll('button');
  one.setAttribute('aria-pressed', 'false');
  two.setAttribute('aria-pressed', 'true');
  handle.sync();
  must(two.getAttribute('tabindex') === '0' && one.getAttribute('tabindex') === '-1',
    'the tab stop did not follow the chosen setting');
  return 'the stop moved with aria-pressed, so a reader returning lands on what is chosen';
});

ok(3, 'a group of one is left alone — roving a single control only removes it from the order', () => {
  const box = scratch('<div class="p2-rocker"><button>only</button></div>');
  const handle = roveGroup(box.querySelector('.p2-rocker'), 'button');
  must(handle === null, 'a single-button group was given a roving tab stop');
  must(isFocusable(box.querySelector('button')), 'the only control lost its tab stop');
  return 'one button, still one tab stop';
});

ok(3, 'a drawing becomes reachable, and arrows walk what it says', () => {
  const box = scratch();
  const svg = fakeDrawing(box, {
    alt: 'the band', titles: ['the floor', 'the marker'], texts: ['$440', '$760'],
  });
  const cursor = installReadingCursor(svg);
  must(isFocusable(svg), 'the drawing is still not a tab stop');
  must(cursor.readings.length === 4, `the cursor found ${cursor.readings.length} readings`);
  svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  const live = document.getElementById('p2-a11y-live');
  must(/1 of 4/.test(live.textContent), `the live region said "${live.textContent}"`);
  svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  must(/4 of 4/.test(live.textContent), `End did not reach the last reading`);
  return `four readings, walked one at a time: "${live.textContent}"`;
});

ok(3, 'the cursor SETS NOTHING. It cannot say anything the drawing does not', () => {
  const box = scratch();
  const svg = fakeDrawing(box, { alt: 'a plate', titles: ['a reading'], texts: ['ten'] });
  const cursor = installReadingCursor(svg);
  const before = svg.outerHTML;
  for (const key of ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'Home', 'End', 'Escape']) {
    svg.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  }
  const after = svg.outerHTML.replace(/ data-p2-cursor-at="\d+"/, '');
  must(before.replace(/ data-p2-cursor-at="\d+"/, '') === after,
    'the reading cursor changed the drawing');
  const said = new Set(cursor.readings);
  must([...said].every((r) => svg.textContent.includes(r)),
    'the cursor spoke something the drawing does not contain');
  return 'six key presses, nothing on the drawing moved';
});

ok(3, 'a drawing that is already a control keeps its own arrows', () => {
  const box = scratch();
  const drum = fakeDrawing(box, { alt: 'the revenue share', titles: ['a notch'], role: 'slider' });
  const cursor = installReadingCursor(drum);
  must(cursor === null, 'the cursor took the drum\'s arrow keys');
  must(!drum.hasAttribute('data-p2-cursor'), 'the drum was stamped with a cursor');
  return 'the door drum is skipped — Arrow, Home and End stay the wheel\'s';
});

ok(3, 'an unreachable control is refused by name', () => {
  const box = scratch('<div role="button">a control no keyboard can reach</div>');
  const e = throws(() => assertKeyboardOperable(box), KeyboardError,
    'a control with no tab stop passed the keyboard check');
  must(/NO KEYBOARD CAN REACH/.test(e.message), 'the refusal does not name the problem');
  return e.message.split('\n')[0].replace('assertKeyboardOperable: ', '');
});

ok(3, 'a control with nothing to announce is refused', () => {
  const box = scratch('<button></button>');
  const e = throws(() => assertKeyboardOperable(box), KeyboardError,
    'a control with no accessible name passed');
  must(/NOTHING TO ANNOUNCE/.test(e.message), 'the refusal does not name the problem');
  return e.message.split('\n')[0].replace('assertKeyboardOperable: ', '');
});

ok(3, 'a roving member is NOT reported unreachable — its stop is in the same group', () => {
  const box = scratch(`<div class="p2-rocker" role="group" aria-label="the spot rate">
    <button aria-pressed="true">1</button><button aria-pressed="false">2</button>
    <button aria-pressed="false">3</button></div>`);
  installRovingGroups(box);
  const census = assertKeyboardOperable(box);
  must(census.controls === 3, `the census counted ${census.controls} controls`);
  must(census.tabStops === 1, `${census.tabStops} tab stops for one rocker`);
  return `${census.controls} controls, ${census.tabStops} tab stop`;
});

ok(3, 'AN EMPTY CHECK IS A FAILED CHECK · a page with no controls reports vacuous', () => {
  const box = scratch('<p>a chapter with no instrument in it</p>');
  const census = assertKeyboardOperable(box);
  must(census.vacuous === true, 'a page with no controls reported itself checked');
  throws(() => installKeyboard(box, { observe: false }), KeyboardError,
    'installKeyboard mounted over a page it could prove nothing about');
  return census.vacuousReason;
});

ok(3, 'the audit counts the tab stops each visual costs', () => {
  const box = scratch();
  const region = document.createElement('div');
  declareVisual(region, 'era-3-machine');
  box.appendChild(region);
  region.innerHTML = `<div class="p2-rocker" role="group" aria-label="the spot rate">
    <button aria-pressed="true">1</button><button aria-pressed="false">2</button>
    <button aria-pressed="false">3</button><button aria-pressed="false">4</button>
    <button aria-pressed="false">5</button><button aria-pressed="false">6</button>
    <button aria-pressed="false">7</button><button aria-pressed="false">8</button></div>`;
  const before = auditKeyboard(box).tabStops;
  installRovingGroups(box);
  const after = auditKeyboard(box);
  must(before === 8, `${before} stops before roving`);
  must(after.tabStops === 1, `${after.tabStops} stops after roving`);
  must(after.perVisual['era-3-machine'] === 1, 'the audit did not attribute the stop to its visual');
  return `one era's crank went from ${before} tab stops to ${after.tabStops}`;
});

ok(3, 'TEXT MODE NEVER HIDES A DRAWING THAT IS A CONTROL', () => {
  const box = scratch();
  declareVisual(box, 'door-wheel');
  const drum = fakeDrawing(box, { alt: 'the revenue share', titles: ['a notch'], role: 'slider' });
  const plate = fakeDrawing(box, { alt: 'a plate that only carries information', titles: ['a reading'] });
  setTextMode('on');
  const hidden = (el) => getComputedStyle(el).display === 'none';
  const drumHidden = hidden(drum);
  const plateHidden = hidden(plate);
  setTextMode('off');
  must(!drumHidden, 'text mode hid the door drum — which is the ONLY control for the ' +
    'revenue share, so the reader was left a paragraph about a negotiation they could ' +
    'no longer take part in');
  must(plateHidden, 'text mode left a drawing that only carries information on screen');
  return 'the drum stays and the plate goes: text mode drops what carries, keeps what takes';
});

ok(3, 'the whole layer mounts, and the mount is idempotent', () => {
  const box = scratch();
  const region = document.createElement('div');
  declareVisual(region, 'era-4-machine');
  box.appendChild(region);
  region.innerHTML = `<div class="p2-rocker" role="group" aria-label="the segment">
    <button aria-pressed="true">1</button><button aria-pressed="false">2</button></div>`;
  fakeDrawing(region, { alt: 'the segmentation machine', titles: ['METER', 'RULE'] });
  const first = installKeyboard(box, { observe: false });
  const second = installKeyboard(box, { observe: false });
  must(first.controls === second.controls, 'a second mount changed the census');
  must(auditKeyboard(box).cursors === 1, 'the drawing did not get exactly one cursor');
  const text = installTextPath(box, { observe: false });
  must(text.regions === 1, 'the text path did not cover the region');
  must(box.querySelectorAll('.p2-text-block').length === 1, 'the text path built the wrong count');
  return `${second.controls} controls, ${second.tabStops} tab stop, one cursor, one text block`;
});

/* ================================================================== *
 * RUN
 * ================================================================== */

export async function run(mount) {
  host = document.createElement('div');
  host.style.cssText = 'position:relative;height:0;overflow:hidden';
  document.body.appendChild(host);
  /* START FROM A KNOWN MODE. The mode survives in sessionStorage, so a bench
   * that inherited it read differently depending on what the last page in this
   * tab had been doing — and the row that failed was the one about a drawing
   * being a tab stop, because in text mode a drawing is hidden and a hidden
   * element is correctly not focusable. Every row that cares about the mode
   * now sets it. */
  setTextMode('off');

  try {
    await loadVisuals();
  } catch (e) {
    mount.innerHTML =
      `<p class="p2-prose">This bench reads <code>p2-ad-market/data/visuals.json</code> over ` +
      `http, and this page was not served over http. Run <code>python3 -m http.server 8000</code> ` +
      `from the repository root and open ` +
      `<code>http://localhost:8000/docs/p2/access/access.test.html</code>.</p>` +
      `<p class="p2-chrome">${e.message.replace(/</g, '&lt;')}</p>`;
    return { pass: 0, fail: 1, total: 1 };
  }

  let pass = 0;
  const out = [];
  let section = null;
  for (const row of rows) {
    if (row.section !== section) {
      section = row.section;
      out.push(`<h2 class="p2-arch">section ${section}</h2>`);
    }
    let detail = '';
    let good = true;
    try {
      detail = row.fn() || '';
    } catch (e) {
      good = false;
      detail = e.message;
    }
    if (good) pass += 1;
    out.push(
      `<div class="row ${good ? 'pass' : 'fail'}">` +
      `<span class="tag">${good ? 'PASS' : 'FAIL'}</span>` +
      `<span class="name">${row.name.replace(/</g, '&lt;')}</span>` +
      `<span class="detail">${String(detail).replace(/</g, '&lt;')}</span></div>`);
  }

  const fail = rows.length - pass;
  mount.innerHTML =
    `<p class="tally ${fail ? 'fail' : 'pass'}">${pass} of ${rows.length} pass` +
    `${fail ? `, ${fail} FAIL` : ''}</p>` + out.join('\n');
  host.remove();
  return { pass, fail, total: rows.length };
}

export default { run };
