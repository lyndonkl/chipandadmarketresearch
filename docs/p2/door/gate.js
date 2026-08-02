/**
 * docs/p2/door/gate.js — the arithmetic gate for the distribution engine.
 *
 * Team B5. Two checks, the same two the auction bench runs, over a different
 * engine.
 *
 * ======================================================================
 * WHAT THIS GATE READS, AND WHAT IT REFUSES TO READ
 *
 * `mechanism.json` holds 209 machine-checkable steps. 123 belong to
 * `engines.auction` and are team B4's business. This gate reads the other two
 * families and NOT the auction's:
 *
 *   engines.distribution.examples                   X1–X10
 *   reconciliation.consistency_check.arithmetic     the five cross-engine steps
 *
 * The exclusion is the point. `simulator-params.json` build note 9 is a hard
 * rule for this bench:
 *
 *   "Never place the auction engine's per-1000-impression revenue figures
 *    (invented cast) on the same axis as the distribution engine's filed
 *    dollars. They are different objects."
 *
 * A caption saying that is a caption. Here it is structural: an auction step is
 * not in this index, so a door figure naming one is reported as naming an
 * expression the door's record does not hold. `assertNotAnAuctionStep` says the
 * same thing in words, at the point of the mistake, so the message names build
 * note 9 rather than reading "unknown step".
 *
 * THE EVALUATOR IS IMPORTED, NEVER REBUILT. `../auction/arithmetic.js` already
 * carries a recursive-descent parser over the record's own notation, with `eval`
 * and `new Function` deliberately absent. A second parser in this folder would
 * be a second answer to "what does this expression mean", and the whole lesson
 * of the layers below is that two answers to one question is the defect. What
 * this file owns is WHICH steps are the door's, and nothing else.
 * ======================================================================
 */

import { evaluate, ArithmeticError } from '../auction/arithmetic.js';

export { evaluate, ArithmeticError };

const CLOSE = (a, b) => Math.abs(a - b) <= Math.max(1e-9, Math.abs(b) * 1e-9);

/* ------------------------------------------------------------------ *
 * 1 · THE STEPS THIS BENCH IS ALLOWED TO STAND ON
 * ------------------------------------------------------------------ */

/**
 * Every stored step in the distribution engine and in the cross-engine
 * reconciliation, flattened, with the family each came from.
 *
 * Reads `mechanism.json` and holds none of it. There is no list of expressions
 * anywhere in this folder.
 */
export function doorSteps(mechanismFile) {
  const distribution = mechanismFile
    && mechanismFile.engines
    && mechanismFile.engines.distribution;
  if (!distribution || !Array.isArray(distribution.examples)) {
    throw new ArithmeticError(
      'mechanism.json holds no engines.distribution.examples, so this gate has nothing to check ' +
      'and would pass a bench showing any number at all.',
      { keys: mechanismFile ? Object.keys(mechanismFile) : mechanismFile },
      'load the frozen mechanism.json — guards.loadFrozen() does it'
    );
  }
  const steps = [];
  for (const example of distribution.examples) {
    for (const [index, step] of (example.steps || []).entries()) {
      steps.push(Object.freeze({
        family: 'distribution', example: example.id, index,
        expr: step.expr, expected: step.expected, note: step.note || null,
      }));
    }
  }
  const cross = mechanismFile.reconciliation
    && mechanismFile.reconciliation.consistency_check
    && mechanismFile.reconciliation.consistency_check.arithmetic;
  if (!cross || !Array.isArray(cross.steps) || cross.steps.length === 0) {
    throw new ArithmeticError(
      'mechanism.json holds no reconciliation.consistency_check.arithmetic.steps. Those five ' +
      'steps are where the record proves the three network-share bases are one numerator over ' +
      'three denominators rather than three disagreeing numbers, and this bench draws all ' +
      'three. Without them the basis rule has no grounding.',
      null,
      'this gate is grounded in the record; without those steps it is vacuous, not passing'
    );
  }
  for (const [index, step] of cross.steps.entries()) {
    steps.push(Object.freeze({
      family: 'reconciliation', example: 'consistency_check', index,
      expr: step.expr, expected: step.expected, note: step.note || null,
    }));
  }
  if (steps.length === 0) {
    throw new ArithmeticError(
      'the distribution engine in mechanism.json carries no steps.', null,
      'this gate is grounded in the record; without steps it is vacuous, not passing'
    );
  }
  return Object.freeze(steps);
}

/** The door's steps, indexed by expression. */
export function doorStepIndex(mechanismFile) {
  const map = new Map();
  for (const step of doorSteps(mechanismFile)) if (!map.has(step.expr)) map.set(step.expr, step);
  return map;
}

/**
 * BUILD NOTE 9, AT THE POINT OF THE MISTAKE.
 *
 * An expression that is not in the door's index but IS in the auction engine
 * gets its own refusal, naming the note. Without this the message would read
 * "not a stored step", which sends the reader looking for a typo when what
 * actually happened is that a per-1000-impression figure off an invented cast
 * was about to be drawn on an axis of filed dollars.
 */
export function assertNotAnAuctionStep(expr, mechanismFile, context) {
  const auction = mechanismFile && mechanismFile.engines && mechanismFile.engines.auction;
  const examples = (auction && auction.examples) || [];
  for (const example of examples) {
    for (const step of example.steps || []) {
      if (step.expr === expr) {
        throw new ArithmeticError(
          `${context || 'a door figure'} names "${expr}", which is a stored step in ` +
          `mechanism.json engines.auction (${example.id}).`,
          { expr, example: example.id },
          'simulator-params.json build note 9: the auction engine\'s per-1000-impression figures ' +
          'come off an invented cast and never share an axis with the distribution engine\'s ' +
          'filed dollars. Cite a step in engines.distribution, or say in the derivation why a ' +
          'quantity from the other engine belongs here.'
        );
      }
    }
  }
  return true;
}

/* ------------------------------------------------------------------ *
 * 2 · CHECK ONE — THE RECORD AGREES WITH ITSELF
 * ------------------------------------------------------------------ */

/** Every stored expression re-evaluates to its stored value. */
export function checkRecordSelfConsistent(mechanismFile) {
  const rows = [];
  for (const step of doorSteps(mechanismFile)) {
    let got = null;
    let error = null;
    try { got = evaluate(step.expr); } catch (e) { error = e.message; }
    rows.push({ ...step, got, ok: error == null && CLOSE(got, step.expected), error });
  }
  return Object.freeze({
    total: rows.length,
    families: Object.freeze({
      distribution: rows.filter((r) => r.family === 'distribution').length,
      reconciliation: rows.filter((r) => r.family === 'reconciliation').length,
    }),
    failed: rows.filter((r) => !r.ok),
    rows: Object.freeze(rows),
    ok: rows.length > 0 && rows.every((r) => r.ok),
  });
}

/* ------------------------------------------------------------------ *
 * 3 · CHECK TWO — THE BENCH AGREES WITH THE RECORD
 * ------------------------------------------------------------------ */

/**
 * Every figure a stop puts on screen, against the stored step it names.
 *
 * `figures` is a list of `{ label, value, step }` or `{ label, value, formula }`.
 * The expression is evaluated HERE, so a corrupted `expected` cannot launder a
 * wrong figure on screen.
 *
 * A figure carrying a written `formula` instead of a step is a DERIVED figure —
 * the record's own convention (build note 6) for a quantity a D-scenario
 * re-derives. It is counted, reported and never silently passed.
 *
 * AN EMPTY CHECK IS A FAILED CHECK. `rows.every(...)` is true of an empty array.
 * This project has hit a vacuous check at every layer, and the answer is always
 * the same: prove the check saw something.
 */
export function checkFiguresAgainstRecord(figures, mechanismFile, context) {
  const index = doorStepIndex(mechanismFile);
  const rows = [];
  const unbacked = [];
  const derived = [];
  for (const figure of figures) {
    if (!figure.step) {
      if (typeof figure.formula === 'string' && figure.formula.trim().length >= 12) derived.push(figure);
      else unbacked.push(figure);
      continue;
    }
    const step = index.get(figure.step);
    if (!step) {
      assertNotAnAuctionStep(figure.step, mechanismFile, `${context || 'this bench'} figure "${figure.label}"`);
      rows.push({
        ...figure, ok: false, got: null,
        error: 'this expression is not a stored step in mechanism.json engines.distribution ' +
          'or reconciliation.consistency_check.arithmetic',
      });
      continue;
    }
    const fromRecord = evaluate(step.expr);
    const storedAgrees = CLOSE(fromRecord, step.expected);
    rows.push({
      ...figure,
      family: step.family, example: step.example, note: step.note,
      fromRecord, stored: step.expected, storedAgrees,
      ok: storedAgrees && CLOSE(figure.value, fromRecord),
    });
  }
  const vacuous = rows.length === 0;
  return Object.freeze({
    total: rows.length,
    failed: rows.filter((r) => !r.ok),
    unbacked: Object.freeze(unbacked),
    derived: Object.freeze(derived),
    rows: Object.freeze(rows),
    vacuous,
    vacuousReason: vacuous
      ? `this check was handed ${figures.length} figure(s) and not one of them named a stored ` +
        'step, so it checked nothing and would pass a stop showing any number at all'
      : null,
    ok: !vacuous && rows.every((r) => r.ok) && unbacked.length === 0,
  });
}

/**
 * Which stored steps no stop has claimed.
 *
 * Not a failure. Several steps are scaffolding for a conclusion rather than a
 * figure on the drawing. It is a coverage report, and it is how the next person
 * finds the parts of the analysis the bench does not yet teach.
 */
export function stepCoverage(figures, mechanismFile) {
  const claimed = new Set(figures.map((f) => f.step).filter(Boolean));
  const steps = doorSteps(mechanismFile);
  const unclaimed = steps.filter((s) => !claimed.has(s.expr));
  return Object.freeze({
    total: steps.length,
    claimed: steps.length - unclaimed.length,
    unclaimed: Object.freeze(unclaimed),
    fraction: (steps.length - unclaimed.length) / steps.length,
  });
}

export default {
  evaluate, doorSteps, doorStepIndex, assertNotAnAuctionStep,
  checkRecordSelfConsistent, checkFiguresAgainstRecord, stepCoverage, ArithmeticError,
};
