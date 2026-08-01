/**
 * docs/p2/auction/arithmetic.js — the gate.
 *
 * Team B4. B4's gate is one sentence:
 *
 *   "Every number on screen re-derives from mechanism.json; the arithmetic
 *    check passes against the live component."   (BUILD-PLAN.md, B4)
 *
 * ======================================================================
 * HOW THIS IS CHECKED, AND WHY IT IS TWO CHECKS AND NOT ONE
 *
 * `mechanism.json` stores 209 machine-checkable steps. 123 of them belong to
 * the auction engine and are this bench's business. Each is `{ expr, expected,
 * note }`, where `expr` is arithmetic in the record's own notation.
 *
 * CHECK ONE — the record agrees with itself. Every `expr` is evaluated here and
 * compared against its stored `expected`. `tools/verify_p2.py` runs the same
 * check in Python. Running it again in the browser is not duplication: it
 * proves the two languages agree on the same 123 expressions, and it means a
 * reader who opens the test page sees the arithmetic re-run rather than a claim
 * that somebody once ran it.
 *
 * CHECK TWO — the BENCH agrees with the record. Every figure a panel puts on
 * screen names the stored step it must equal. The check runs the live engine,
 * takes the figure the reader will see, and compares it against the value the
 * record's own expression produces. A figure that names no step is reported,
 * because a number with nothing behind it is the defect this project has hit at
 * every stage.
 *
 * THE EVALUATOR IS A PARSER, NOT `eval`. A recursive-descent parser over
 * numbers, `+ - * / **` and parentheses. `eval` and `new Function` are absent
 * from this file on purpose: the strings come from a data file, and a data file
 * that can execute code is a different kind of object from a data file.
 * ======================================================================
 */

export class ArithmeticError extends Error {
  constructor(message, detail = null, fix = null) {
    super(fix ? `${message}\n  FIX: ${fix}` : message);
    this.name = 'ArithmeticError';
    this.detail = detail;
    this.fix = fix;
  }
}

/* ------------------------------------------------------------------ *
 * 1 · THE EVALUATOR
 * ------------------------------------------------------------------ */

const TOKEN = /\s*(\*\*|[-+*/()]|\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)/y;

function tokenise(src) {
  const out = [];
  let at = 0;
  while (at < src.length) {
    TOKEN.lastIndex = at;
    const m = TOKEN.exec(src);
    if (!m) {
      if (/^\s+$/.test(src.slice(at))) break;
      throw new ArithmeticError(
        `this expression holds something that is not arithmetic, at position ${at}.`,
        { expr: src, at, rest: src.slice(at, at + 24) },
        'mechanism.json steps are numbers, + - * / ** and parentheses. Nothing else runs here.'
      );
    }
    out.push(m[1]);
    at = TOKEN.lastIndex;
  }
  return out;
}

/**
 * expr   := term (('+' | '-') term)*
 * term   := unary (('*' | '/') unary)*
 * unary  := ('-' | '+')* power
 * power  := primary ('**' unary)?          right-associative
 * primary:= number | '(' expr ')'
 *
 * `**` binds tighter than unary minus, matching the Python that produced the
 * stored values. The record holds no case where the two disagree; matching
 * anyway is cheaper than checking every future step.
 */
export function evaluate(expr) {
  if (typeof expr !== 'string' || expr.trim() === '') {
    throw new ArithmeticError('evaluate() needs an expression.', { expr });
  }
  const tokens = tokenise(expr);
  let i = 0;
  const peek = () => tokens[i];
  const take = (t) => { if (tokens[i] === t) { i += 1; return true; } return false; };

  function primary() {
    if (take('(')) {
      const v = additive();
      if (!take(')')) throw new ArithmeticError('unbalanced parentheses.', { expr });
      return v;
    }
    const t = peek();
    if (t == null || !/^\d/.test(t)) {
      throw new ArithmeticError(`expected a number and found ${JSON.stringify(t)}.`, { expr, at: i });
    }
    i += 1;
    return Number(t);
  }
  function power() {
    const base = primary();
    if (take('**')) return Math.pow(base, unary());
    return base;
  }
  function unary() {
    if (take('-')) return -unary();
    if (take('+')) return unary();
    return power();
  }
  function multiplicative() {
    let v = unary();
    for (;;) {
      if (take('*')) v *= unary();
      else if (take('/')) v /= unary();
      else return v;
    }
  }
  function additive() {
    let v = multiplicative();
    for (;;) {
      if (take('+')) v += multiplicative();
      else if (take('-')) v -= multiplicative();
      else return v;
    }
  }
  const value = additive();
  if (i !== tokens.length) {
    throw new ArithmeticError(
      `this expression has ${tokens.length - i} token(s) left over.`,
      { expr, leftover: tokens.slice(i) }
    );
  }
  return value;
}

/* ------------------------------------------------------------------ *
 * 2 · THE STEPS
 * ------------------------------------------------------------------ */

/**
 * Every stored step in the auction engine, flattened.
 *
 * Reads `mechanism.json` and holds none of it. If the record moves, this moves
 * with it — there is no list of expressions anywhere in this folder.
 */
export function auctionSteps(mechanismFile) {
  const auction = mechanismFile
    && mechanismFile.engines
    && mechanismFile.engines.auction;
  if (!auction || !Array.isArray(auction.examples)) {
    throw new ArithmeticError(
      'mechanism.json holds no engines.auction.examples, so this gate has nothing to check ' +
      'and would pass a bench showing any number at all.',
      { keys: mechanismFile ? Object.keys(mechanismFile) : mechanismFile },
      'load the frozen mechanism.json — guards.loadFrozen() does it'
    );
  }
  const steps = [];
  for (const example of auction.examples) {
    for (const [index, step] of (example.steps || []).entries()) {
      steps.push(Object.freeze({
        example: example.id,
        index,
        expr: step.expr,
        expected: step.expected,
        note: step.note || null,
      }));
    }
  }
  if (steps.length === 0) {
    throw new ArithmeticError(
      'the auction engine in mechanism.json carries no steps.', null,
      'this gate is grounded in the record; without steps it is vacuous, not passing'
    );
  }
  return Object.freeze(steps);
}

/** Index the steps by their expression, so a figure can name the one it matches. */
export function stepIndex(mechanismFile) {
  const map = new Map();
  for (const step of auctionSteps(mechanismFile)) {
    if (!map.has(step.expr)) map.set(step.expr, step);
  }
  return map;
}

const CLOSE = (a, b) => Math.abs(a - b) <= Math.max(1e-9, Math.abs(b) * 1e-9);

/**
 * CHECK ONE. Every stored expression re-evaluates to its stored value.
 */
export function checkRecordSelfConsistent(mechanismFile) {
  const rows = [];
  for (const step of auctionSteps(mechanismFile)) {
    let got = null;
    let error = null;
    try { got = evaluate(step.expr); } catch (e) { error = e.message; }
    rows.push({
      ...step, got,
      ok: error == null && CLOSE(got, step.expected),
      error,
    });
  }
  return Object.freeze({
    total: rows.length,
    failed: rows.filter((r) => !r.ok),
    rows: Object.freeze(rows),
    ok: rows.every((r) => r.ok),
  });
}

/* ------------------------------------------------------------------ *
 * 3 · THE BENCH AGAINST THE RECORD
 * ------------------------------------------------------------------ */

/**
 * CHECK TWO. Every figure a panel shows is compared against the stored step it
 * names.
 *
 * `figures` is a list of `{ label, value, step }` or `{ label, value, formula }`,
 * where `step` is the stored expression in the record's own notation. The
 * expression is evaluated HERE, so a corrupted `expected` in the record cannot
 * launder a wrong figure on screen: the figure is checked against the
 * arithmetic, not against a stored answer.
 *
 * A figure carrying a written `formula` instead of a step is a DERIVED figure —
 * the record's own convention (build note 7) for a control position the record
 * does not store. It is counted and reported and never silently passed.
 *
 * A figure with neither is REPORTED as `unbacked` and never passed.
 *
 * AN EMPTY CHECK IS A FAILED CHECK. `rows.every(...)` is true of an empty array,
 * so a panel that put three money figures on screen and handed the gate nothing
 * used to come back green. sc-01 flipped to bid-times-click-rate was exactly
 * that state. This project has hit a vacuous check at every layer and the answer
 * is always the same: prove the check saw something.
 */
export function checkFiguresAgainstRecord(figures, mechanismFile) {
  const index = stepIndex(mechanismFile);
  const rows = [];
  const unbacked = [];
  const derived = [];
  for (const figure of figures) {
    if (!figure.step) {
      if (typeof figure.formula === 'string' && figure.formula.trim().length >= 12) {
        derived.push(figure);
      } else {
        unbacked.push(figure);
      }
      continue;
    }
    const step = index.get(figure.step);
    if (!step) {
      rows.push({
        ...figure, ok: false, got: null,
        error: 'this expression is not a stored step in mechanism.json engines.auction',
      });
      continue;
    }
    const fromRecord = evaluate(step.expr);
    const storedAgrees = CLOSE(fromRecord, step.expected);
    rows.push({
      ...figure,
      example: step.example,
      note: step.note,
      fromRecord,
      stored: step.expected,
      storedAgrees,
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
    /** True when the gate was handed nothing it could check. Always a failure. */
    vacuous,
    vacuousReason: vacuous
      ? `this check was handed ${figures.length} figure(s) and not one of them named a stored ` +
        'step, so it checked nothing and would pass a panel showing any number at all'
      : null,
    ok: !vacuous && rows.every((r) => r.ok) && unbacked.length === 0,
  });
}

/**
 * Which stored steps no panel has claimed.
 *
 * Not a failure — several steps are prose scaffolding for a conclusion rather
 * than a figure on a dial. It is a coverage report, and it is how the next
 * person finds the parts of the analysis the bench does not yet teach.
 */
export function stepCoverage(figures, mechanismFile) {
  const claimed = new Set(figures.map((f) => f.step).filter(Boolean));
  const steps = auctionSteps(mechanismFile);
  const unclaimed = steps.filter((s) => !claimed.has(s.expr));
  return Object.freeze({
    total: steps.length,
    claimed: steps.length - unclaimed.length,
    unclaimed: Object.freeze(unclaimed),
    fraction: (steps.length - unclaimed.length) / steps.length,
  });
}

export default {
  evaluate, auctionSteps, stepIndex, checkRecordSelfConsistent,
  checkFiguresAgainstRecord, stepCoverage, ArithmeticError,
};
