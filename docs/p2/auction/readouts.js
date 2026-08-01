/**
 * docs/p2/auction/readouts.js — every figure that reaches a reader.
 *
 * Team B4. Nothing in this file formats a bare number.
 *
 * ======================================================================
 * THE RULE, AND THE FAILURE IT PREVENTS
 *
 * Three of `simulator-params.json`'s build notes are about a number that is
 * true and, printed without its label, teaches something false:
 *
 *   2. "A GSP revenue number without a bidder_mode is not a number; it is a
 *       point inside a 1.727x band."
 *   4. "Any panel showing pay-your-bid revenue at frozen bids must label it a
 *       counterfactual."
 *   5. "gamma has no disclosed value. Wherever the squashing slider appears,
 *       the assumption label appears with it."
 *
 * Each is a rule about what must be printed BESIDE a number. A rule like that
 * is forgotten at 2am, and the resulting page looks completely fine.
 *
 * So the number and its label are one object here, minted together, and the
 * formatters refuse anything they did not mint. `usd(52.58)` throws. The only
 * way to get "$52.58" onto the screen is to have said, at mint time, which
 * bidder mode produced it. This is the chart layer's span-only mark applied to
 * money: the forbidden print is impossible rather than merely forbidden.
 * ======================================================================
 */

import { assertTextColor, BRASS_TEXT, CYAN_TEXT, ZINC_TEXT, GRAPHITE, RUST } from '../lib/tokens.js';

export class ReadoutError extends Error {
  constructor(message, detail = null, fix = null) {
    super(fix ? `${message}\n  FIX: ${fix}` : message);
    this.name = 'ReadoutError';
    this.detail = detail;
    this.fix = fix;
  }
}

const MARKS = new WeakSet();
const finite = (v) => typeof v === 'number' && Number.isFinite(v);

/**
 * The roles a figure can hold, and the colour each one is printed in.
 *
 * The palette's meanings are not decoration: brass is money, cyan is the count,
 * rust is the intermediary's take, iron is mechanism. A figure declares its
 * role at mint, so a click count can never be painted as money.
 */
export const FIGURE_ROLES = Object.freeze({
  money: { ink: BRASS_TEXT, what: 'money' },
  /**
   * A dollar figure that came out of a filing rather than out of an auction.
   * It carries no bidder mode because no bidder produced it — the mode rule
   * belongs to auction revenue and would be a lie here. The scale anchors in
   * sc-09 are the only figures of this kind on the bench.
   */
  filed: { ink: BRASS_TEXT, what: 'a filed figure' },
  count: { ink: CYAN_TEXT, what: 'the count' },
  ratio: { ink: GRAPHITE, what: 'a ratio' },
  take: { ink: RUST, what: 'the intermediary\'s take' },
  mechanism: { ink: ZINC_TEXT, what: 'a setting of the machine' },
});

/* ------------------------------------------------------------------ *
 * 1 · MINTING A FIGURE
 * ------------------------------------------------------------------ */

/**
 * Mint a figure a readout may print.
 *
 * EVERY READING NAMES WHERE IT COMES FROM. A reading carries either a
 * `stepRef` — a stored expression in `mechanism.json`'s auction engine, which
 * `arithmetic.js` evaluates and compares the number against — or a
 * `derivedFrom`, a written derivation for a control position the record does
 * not store. Never neither, and never both.
 *
 * The gate used to run over `view.figures` only. The MONEY zone is
 * `view.readout`, a different object, in the largest brass type on the panel,
 * and nothing checked it. sc-04 printed $361.00 there while the band marker sat
 * at $440. A figure the gate cannot see is a figure that can say anything.
 *
 * @param {object} spec
 * @param {number} spec.usd      the value, in whatever unit `unit` names
 * @param {string} spec.role     a key of FIGURE_ROLES
 * @param {string} spec.label    what the figure IS, in a reader's words
 * @param {string} spec.mode     REQUIRED on money: which bidder mode produced it
 * @param {string} spec.unit     the unit, printed with the figure
 * @param {string} spec.stepRef  the stored expression this figure must equal
 * @param {string} spec.derivedFrom  the written derivation, where no step exists
 * @param {boolean} spec.counterfactual  true when nobody re-bid
 * @param {string} spec.assumption   set when a parameter here is not disclosed
 */
export function mintReading(spec = {}) {
  const {
    usd, role = 'money', label, mode = null, modeNote = null, unit = '',
    derivedFrom = null, counterfactual = false, assumption = null, stepRef = null,
    format = null,
  } = spec;

  if (!finite(usd)) {
    throw new ReadoutError(
      `a readout figure must be a finite measured number, and "${label}" is ${JSON.stringify(usd)}.`,
      spec,
      'a figure the record does not carry is an absence — draw it as one, do not print "—"'
    );
  }
  if (!FIGURE_ROLES[role]) {
    throw new ReadoutError(
      `"${role}" is not a figure role.`, spec,
      `use one of: ${Object.keys(FIGURE_ROLES).join(', ')}`
    );
  }
  if (typeof label !== 'string' || label.trim().length < 3) {
    throw new ReadoutError(
      'every readout figure needs a label a reader can read.', spec,
      'label it — "revenue per 1,000 impressions", not "rev"'
    );
  }
  /* THE RULE. Build note 2, made structural. */
  if (role === 'money' && !mode) {
    throw new ReadoutError(
      `"${label}" is a money figure with no bidder mode. A GSP revenue number without one ` +
      'is not a number — it is a point inside a 1.727x band that the bidders choose and the ' +
      'mechanism does not. This engine will not print it.',
      spec,
      'pass mode: one of naive_truthful, lowest_envy_free, one_shader, custom — ' +
      'or mint it as a ratio if it is not money'
    );
  }
  if (counterfactual && (typeof spec.why !== 'string' || spec.why.trim().length < 8)) {
    throw new ReadoutError(
      `"${label}" is a counterfactual with no stated counterfactual. Frozen-bid ` +
      'pay-your-bid revenue is the most common way to make a first-price auction look ' +
      'like free money, and the label is the whole defence.',
      spec,
      'pass why: "the same winners, the same bids, nobody re-bidding"'
    );
  }

  if (format != null && format !== 'times' && format !== 'percent') {
    throw new ReadoutError(
      `"${label}" asks to be printed as "${format}".`, spec,
      'a ratio prints as "times" or as "percent" — leave it out and the size of the number decides'
    );
  }

  /* THE PROVENANCE RULE. One of the two, never neither and never both. */
  const hasStep = typeof stepRef === 'string' && stepRef.trim().length > 0;
  const hasDerivation = typeof derivedFrom === 'string' && derivedFrom.trim().length >= 12;
  if (hasStep && derivedFrom != null) {
    throw new ReadoutError(
      `"${label}" names both a stored step and a written derivation. Two provenances for one ` +
      'number is two answers to "where did this come from", and a reader gets the wrong one.',
      spec,
      'keep the stepRef if the record stores this figure; keep the derivedFrom if it does not'
    );
  }
  if (!hasStep && !hasDerivation) {
    throw new ReadoutError(
      `"${label}" says nothing about where it comes from. Every figure on this bench either ` +
      'equals a stored step in mechanism.json or carries a written derivation, and the gate ' +
      'checks the first kind and reports the second. A number with neither is a number from ' +
      'nowhere, and that is the defect this project has hit at every layer.',
      spec,
      'pass stepRef: the stored expression this figure must equal — or derivedFrom: a sentence ' +
      'saying how it was worked out at a control position the record does not store'
    );
  }

  const mark = {
    usd, role, label, mode, modeNote: modeNote ? String(modeNote) : null, unit, format,
    ink: FIGURE_ROLES[role].ink,
    derivedFrom: hasDerivation ? derivedFrom.trim() : null,
    stepRef: hasStep ? stepRef.trim() : null,
    counterfactual: Boolean(counterfactual),
    why: counterfactual ? spec.why.trim() : null,
    assumption: assumption ? String(assumption) : null,
  };
  assertTextColor(mark.ink, `readout "${label}"`);
  Object.freeze(mark);
  MARKS.add(mark);
  return mark;
}

export function isMark(value) { return MARKS.has(value); }

export function assertMark(value, where) {
  if (!MARKS.has(value)) {
    throw new ReadoutError(
      `${where} was handed something readouts.js did not mint. Every figure on screen is ` +
      'minted with its label, its role and — for money — the bidder mode that produced it.',
      value,
      'build it with mintReading({ usd, role, label, mode })'
    );
  }
  return value;
}

/* ------------------------------------------------------------------ *
 * 2 · FORMATTING
 * ------------------------------------------------------------------ */

/** Dollars, to the cent. Refuses anything that is not a measured number. */
export function money(value, digits = 2) {
  if (!finite(value)) {
    throw new ReadoutError(
      `money() was asked to print ${JSON.stringify(value)}.`, value,
      'a value the record does not carry is an absence, and an absence is drawn, not printed'
    );
  }
  const sign = value < 0 ? '−' : '';
  const abs = Math.abs(value);
  return `${sign}$${abs.toLocaleString('en-US', {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  })}`;
}

/**
 * Dollars AT THE PRECISION THE VALUE ACTUALLY HAS.
 *
 * ======================================================================
 * THE DRAWING USED TO DISAGREE WITH ITS OWN ACCESSIBLE NAME.
 *
 * `drawBand` and `bandEnds` printed the band's ends with `money(usd, 0)`,
 * because $440 and $760 are round and "$440.00" is wide in a 268-unit drawing.
 * sc-06's band is not round. Its ends are $4.50 and $5.50 — the record's two
 * stored shading levels — and at zero digits they drew as "$5" and "$6".
 *
 * So at shading 0.60, one of the record's own named stops, the money zone
 * printed $4.50 in the largest brass type on the panel while the band end
 * label directly under the marker printed $5. The ratio label said
 * "1.222 times wide" and its own drawn ends gave 1.200. The screen-reader
 * sentence, which formats to the cent, said $4.50 to $5.50 and was right.
 * A sighted reader and a screen-reader reader got different numbers off the
 * same drawing, at 7,001 of the 29,604 rendered positions.
 *
 * Rounding is a formatting choice everywhere except on the number itself. This
 * formatter drops the cents only when there are no cents to drop.
 * ======================================================================
 */
export function moneyAsMeasured(value) {
  if (!finite(value)) {
    throw new ReadoutError(
      `moneyAsMeasured() was asked to print ${JSON.stringify(value)}.`, value,
      'a value the record does not carry is an absence, and an absence is drawn, not printed'
    );
  }
  /* Rounded to the cent first, so float noise on a whole-dollar figure —
   * 440.00000000000006 — still reads as the whole dollar it is. */
  return money(value, Math.round(value * 100) % 100 === 0 ? 0 : 2);
}

/** A count, with thousands separators. */
export function count(value, digits = 0) {
  if (!finite(value)) throw new ReadoutError(`count() was asked to print ${JSON.stringify(value)}.`);
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  });
}

/** A percentage. */
export function percent(value, digits = 1) {
  if (!finite(value)) throw new ReadoutError(`percent() was asked to print ${JSON.stringify(value)}.`);
  return `${(value * 100).toFixed(digits)}%`;
}

/** A multiple, as in "1.727x". */
export function times(value, digits = 3) {
  if (!finite(value)) throw new ReadoutError(`times() was asked to print ${JSON.stringify(value)}.`);
  return `${value.toFixed(digits)}x`;
}

/**
 * The figure as the reader sees it, with everything the record requires beside
 * it. This is the ONLY way a figure reaches the screen.
 */
export function readingText(mark, { digits = 2 } = {}) {
  assertMark(mark, 'readingText');
  let head;
  if (mark.role === 'money' || mark.role === 'filed') head = money(mark.usd, digits);
  else if (mark.role === 'count') head = count(mark.usd, mark.usd % 1 === 0 ? 0 : digits);
  else if (mark.role === 'take') head = percent(mark.usd, 1);
  else if (mark.role === 'ratio') {
    /* A ratio near 1 is ambiguous: 1.0 printed as "100.0%" reads as a level and
     * printed as "1.000x" reads as a multiplier. Where the caller knows which
     * one it is, it says so; otherwise the size of the number decides. */
    if (mark.format === 'times') head = times(mark.usd);
    else if (mark.format === 'percent') head = percent(mark.usd, 1);
    else head = mark.usd >= 1.5 ? times(mark.usd) : percent(mark.usd, 1);
  }
  else head = count(mark.usd, digits);
  return mark.unit ? `${head} ${mark.unit}` : head;
}

/**
 * Everything the record requires printed beside the figure, as a list of short
 * phrases. The bench renders these in chrome type under the number and the
 * text-only path reads them out.
 */
export function readingQualifiers(mark) {
  assertMark(mark, 'readingQualifiers');
  const out = [];
  if (mark.counterfactual) out.push(`counterfactual: ${mark.why}`);
  if (mark.role === 'money' && mark.mode) out.push(mark.modeNote || modePhrase(mark.mode));
  if (mark.assumption) out.push(`assumed: ${mark.assumption}`);
  /* A figure the record does not store SAYS SO, on screen, beside itself. The
   * written derivation is the escape hatch from the arithmetic gate, and an
   * escape hatch a reader cannot see is a hole. */
  if (mark.derivedFrom) out.push(`where this comes from: ${mark.derivedFrom}`);
  return out;
}

/**
 * A minted reading as a row the arithmetic gate can take.
 *
 * The gate speaks in `{ label, value, step }` rows. This is the one adapter, so
 * the till and the ledger are checked by the same code and neither can drift
 * into a second path that renders something else.
 */
export function readingRow(mark) {
  assertMark(mark, 'readingRow');
  return mark.stepRef
    ? { label: mark.label, value: mark.usd, step: mark.stepRef }
    : { label: mark.label, value: mark.usd, formula: mark.derivedFrom };
}

/** Every minted reading in a list, as gate rows. */
export function readingRows(marks) {
  return (marks || []).map(readingRow);
}

/** The bidder mode as a phrase, never as a bare enum key. */
export function modePhrase(mode) {
  const phrases = {
    naive_truthful: 'bidders bid their value',
    lowest_envy_free: 'bidders play the lowest equilibrium',
    one_shader: 'one bidder shades',
    custom: 'bids held fixed',
  };
  return phrases[mode] || String(mode);
}

/**
 * The figure in one sentence, for the accessible name and the text-only path.
 * Short words, short sentences, and the actor named.
 */
export function readingSentence(mark, opts) {
  assertMark(mark, 'readingSentence');
  const quals = readingQualifiers(mark);
  const tail = quals.length ? ` (${quals.join('; ')})` : '';
  return `${mark.label}: ${readingText(mark, opts)}${tail}.`;
}

export default {
  mintReading, isMark, assertMark, money, moneyAsMeasured, count, percent, times,
  readingText, readingQualifiers, readingSentence, modePhrase,
  readingRow, readingRows,
  FIGURE_ROLES, ReadoutError,
};
