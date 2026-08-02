/**
 * `docs/p2/access/visuals.js` — the alt-sentence field, at the page.
 *
 * Team B8 (`p2-ad-market/BUILD-PLAN.md`). Direction: The Bench.
 *
 * `DESIGN.md`, "Still unsolved", adopts one idea from a direction the human did
 * not choose: EVERY VISUAL CARRIES A REQUIRED PLAIN-ENGLISH SENTENCE IN THE
 * DATA LAYER, written to pass the four readability gates, and those sentences
 * drive a text-only version of the whole piece.
 *
 * The field is `p2-ad-market/data/visuals.json`. This module is the only reader
 * of it, and it does four things:
 *
 *   1. holds the registry, the way `guards.js` holds the frozen files;
 *   2. DERIVES the accessible sentence from the record's two fields rather than
 *      storing a third copy of it;
 *   3. binds a rendered region to its row, and refuses an id the record does
 *      not hold;
 *   4. refuses a page carrying a drawing no row covers.
 *
 * IT HOLDS NO SENTENCE OF ITS OWN. Every string a reader meets from here comes
 * out of the record. That is the same rule `guards.js` states as "never as a
 * place to put data", and the reason is the same: a sentence in a source file
 * is a second, unversioned copy of the record.
 *
 * NO NUMBER REACHES THIS MODULE. `visuals.json` refuses a digit in either
 * field, checked by `tools/verify_p2.py b8-alt`. A figure written into an alt
 * sentence would be a second copy of one the mark beside it already carries,
 * with nothing checking that the two agree — which is the defect
 * `toll-records.js` already closed on its thirteen base sentences. Every figure
 * the text path prints comes from the component's own guarded strings.
 */

/* ------------------------------------------------------------------ *
 * 1 · THE ERRORS
 *
 * Two of them, and they say different things. One means the record does not
 * cover the page. The other means the page has not said what it is drawing.
 * Sending a reader to fix the wrong one costs an hour at the wrong time of
 * night; `tokens.js` makes the same split on its two contrast rejections.
 * ------------------------------------------------------------------ */

export class VisualsError extends Error {
  constructor(where, headline, detail, fix) {
    super(`${where}: ${headline}\n  ${detail}\n  fix: ${fix}`);
    this.name = 'VisualsError';
    this.where = where;
    this.headline = headline;
    this.fix = fix;
  }
}

/** The registry could not be reached, or a guard's grounding is gone. */
export class VisualsVacuousError extends VisualsError {
  constructor(where, detail, fix) {
    super(where, 'THE ALT-SENTENCE RECORD IS NOT THERE', detail, fix);
    this.name = 'VisualsVacuousError';
  }
}

/* ------------------------------------------------------------------ *
 * 2 · THE REGISTRY
 * ------------------------------------------------------------------ */

const REGISTRY_FILE = '../../../p2-ad-market/data/visuals.json';

let _doc = null;
let _byId = null;

function index(doc) {
  const rows = (doc && doc.visuals) || [];
  const map = new Map();
  for (const row of rows) map.set(row.id, Object.freeze({ ...row }));
  return map;
}

/**
 * Fetch the record. Resolves relative to this module, so the default reaches
 * the repo's own data directory from `docs/p2/access/`.
 *
 * Browsers block `fetch` on `file://` origins, so a page opened off disk must
 * inject with `useVisuals()` instead. Same shape as `guards.loadFrozen()`.
 */
export async function loadVisuals(options = {}) {
  const url = new URL(options.path || REGISTRY_FILE, options.baseFrom || import.meta.url);
  const fetchImpl = options.fetch || (typeof fetch === 'function' ? fetch : null);
  if (!fetchImpl) {
    throw new VisualsVacuousError(
      'loadVisuals', 'this runtime has no fetch.',
      'inject the record with useVisuals(doc)');
  }
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new VisualsVacuousError(
      'loadVisuals', `could not read visuals.json (HTTP ${response.status}) from ${url}.`,
      'serve the repo root over http, or inject the record with useVisuals(doc)');
  }
  return useVisuals(await response.json());
}

/** Inject the record, for a built page or a test. */
export function useVisuals(doc) {
  if (!doc || !Array.isArray(doc.visuals) || doc.visuals.length === 0) {
    throw new VisualsVacuousError(
      'useVisuals', 'the record holds no visuals.',
      'an empty registry would let every drawing on the page through unnamed. ' +
      'Load p2-ad-market/data/visuals.json.');
  }
  _doc = doc;
  _byId = index(doc);
  return _byId.size;
}

export function visualsLoaded() {
  return _byId != null && _byId.size > 0;
}

/** Every row, in the record's own reading order. */
export function everyVisual() {
  requireRegistry('everyVisual');
  return [..._byId.values()].sort((a, b) => a.order - b.order);
}

/** The rules the record carries, so a report can print them beside a finding. */
export function registryRules() {
  requireRegistry('registryRules');
  return _doc.rules || {};
}

function requireRegistry(where) {
  if (!visualsLoaded()) {
    throw new VisualsVacuousError(
      where, 'the alt-sentence record has not been loaded.',
      'await loadVisuals(), or useVisuals(doc) on a page opened off disk');
  }
}

/**
 * One row, by id. Throws on an id the record does not hold, rather than
 * returning null.
 *
 * A missing row must not be a soft outcome. The whole point of the field is
 * that a drawing without a sentence cannot ship, and a lookup that answers
 * `undefined` puts the decision back in the caller's hands, where it gets
 * skipped at the wrong hour.
 */
export function getVisual(id) {
  requireRegistry('getVisual');
  const row = _byId.get(id);
  if (!row) {
    throw new VisualsError(
      'getVisual', 'NO SUCH VISUAL',
      `"${id}" is not in p2-ad-market/data/visuals.json. The record holds ${_byId.size} ` +
      `visuals and every drawing the piece renders must be one of them.`,
      'add a row with its `shows` and `finding`, then run ' +
      '`python3 tools/verify_p2.py b8-alt`');
  }
  return row;
}

/**
 * THE SENTENCE, DERIVED.
 *
 * `shows` says what is on the drawing. `finding` says what a reader should take
 * from it. The accessible name is the two joined, and it is computed here every
 * time rather than stored, so there is no third copy to drift. It is the same
 * move `era-plan.js` makes on its drawer words, and the reason the drawer's
 * title, accessible name and alt sentence cannot disagree.
 */
export function altSentence(id) {
  const row = getVisual(id);
  return `${row.shows} ${row.finding}`;
}

/* ------------------------------------------------------------------ *
 * 3 · BINDING A RENDERED REGION TO ITS ROW
 *
 * The components stamp every drawing `data-alt-source="generated-by-chart"`
 * and give it a generated accessible name. None of them knows which visual of
 * the piece it is; that is the page's business and it is declared here.
 * ------------------------------------------------------------------ */

export const VISUAL_ATTR = 'data-p2-visual';

/**
 * Declare that everything inside `node` is the visual `id`.
 *
 * Refuses an id the record does not hold, at the moment of mounting, which is
 * the only moment anybody is looking. A region may hold several drawings — a
 * toll plate holds a bar and a token, an era machine holds a machine and an
 * output plate — and the row's sentence is the finding of the region.
 */
export function declareVisual(node, id) {
  if (!node || typeof node.setAttribute !== 'function') {
    throw new VisualsError(
      'declareVisual', 'NOT AN ELEMENT',
      `declareVisual needs the element that holds the drawing; it was given ${typeof node}.`,
      'pass the container you rendered the component into');
  }
  const row = getVisual(id);          // throws on an unknown id
  node.setAttribute(VISUAL_ATTR, row.id);
  return node;
}

/** Every declared region on a page, as `{ id, node, row }`, in document order. */
export function declaredVisuals(root) {
  requireRegistry('declaredVisuals');
  const out = [];
  for (const node of root.querySelectorAll(`[${VISUAL_ATTR}]`)) {
    const id = node.getAttribute(VISUAL_ATTR);
    out.push({ id, node, row: getVisual(id) });
  }
  return out;
}

/**
 * GUARANTEE · no drawing reaches a reader without an authored sentence.
 *
 * Every `[data-alt-source]` element on the page must sit inside a declared
 * region, and every declared region must be a row of the record. A drawing
 * outside one is refused by name.
 *
 * WHAT THIS DOES NOT COVER, and it is the widest limit here: nothing calls this
 * for you. It fires where the page calls it and nowhere else, which is the
 * library's own widest limit one layer up. `installTextPath()` calls it, so a
 * page that mounts the text path gets it; a page that does not, does not.
 */
export function assertEveryDrawingDeclared(root, where = 'the page') {
  requireRegistry('assertEveryDrawingDeclared');
  const drawings = [...root.querySelectorAll('[data-alt-source]')];
  const orphans = drawings.filter((svg) => !svg.closest(`[${VISUAL_ATTR}]`));
  if (orphans.length) {
    const names = orphans.slice(0, 4).map(
      (svg) => `"${(svg.getAttribute('aria-label') || '').slice(0, 60)}…"`);
    throw new VisualsError(
      'assertEveryDrawingDeclared', 'A DRAWING WITH NO AUTHORED SENTENCE',
      `${orphans.length} of ${drawings.length} drawings on ${where} sit outside any ` +
      `declared visual, so the text-only path has nothing to put in their place. ` +
      `The first of them read ${names.join(', ')}.`,
      'wrap each one and call declareVisual(node, id) with its row from ' +
      'p2-ad-market/data/visuals.json');
  }
  /* A page with no drawings at all passes every test above by having nothing to
   * test. That is the shape `[].every()` gives you, and this project has been
   * bitten by it once already, in the auction bench's arithmetic gate. So the
   * result carries the census and the caller can see the check saw something. */
  return Object.freeze({
    drawings: drawings.length,
    declared: root.querySelectorAll(`[${VISUAL_ATTR}]`).length,
    vacuous: drawings.length === 0,
    vacuousReason: drawings.length === 0
      ? 'no drawing was found on this page, so this check proved nothing'
      : null,
  });
}

export default {
  loadVisuals, useVisuals, visualsLoaded, everyVisual, registryRules,
  getVisual, altSentence, declareVisual, declaredVisuals,
  assertEveryDrawingDeclared, VISUAL_ATTR, VisualsError, VisualsVacuousError,
};
