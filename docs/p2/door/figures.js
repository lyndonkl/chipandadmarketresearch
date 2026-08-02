/**
 * docs/p2/door/figures.js — every figure that reaches a reader on this bench.
 *
 * Team B5. Nothing in this file formats a bare number, and three of the record's
 * own rules are made structural here rather than printed as captions.
 *
 * ======================================================================
 * RULE ONE · A SHARE HAS NO SCALAR FORM. IT IS A NUMERATOR OVER A NAMED
 * DENOMINATOR, OR IT DOES NOT EXIST.
 *
 * `mechanism.json` reconciliation.consistency_check.denominator_conventions:
 *
 *   "Google Network share is quoted on THREE bases in this file and they are
 *    not interchangeable: 31.8% of 2008 ADVERTISING revenue, 30.8% of 2008
 *    TOTAL revenue, and 9.4% of 2008 advertising revenue NET of TAC. All three
 *    are correct and all three appear. Chapters must name the basis every
 *    time."
 *
 * `simulator-params.json` build note 9 repeats it, and break B9 says why it
 * matters: the famous "48.7% of revenue came from the network" is an accounting
 * presentation as much as an economic fact.
 *
 * A rule about what must be printed beside a number is forgotten at 2am, and
 * the resulting page looks completely fine. So `mintShare` takes no `value`. It
 * takes a numerator and a denominator, each with its own label, and computes
 * the share here. There is no way to hand this module a percentage somebody
 * worked out somewhere else and attach the wrong basis to it, because there is
 * no argument to hand it in.
 *
 * RULE TWO · A FIGURE COMPUTED ON AN ILLUSTRATIVE SCENARIO NAMES WHAT IS
 * INVENTED, AND THE NAMES ARE CROSS-CHECKED AGAINST THE SCENARIO'S OWN
 * SETTINGS.
 *
 * Build note 8 flags D5, D6, D10 and D11 as carrying invented inputs. A figure
 * minted under `illustrative: true` must list them, and every name must be a
 * setting the frozen scenario actually holds. `{ invented: ['everything'] }` is
 * refused for the same reason `assertDistinguishable` refuses a redundant
 * channel the drawing does not carry: a caveat that exists only in an argument
 * list is not a caveat.
 *
 * RULE THREE · A FIGURE READ OFF THE WHEEL CARRIES THE SETTLEMENT THAT
 * PRODUCED IT, AND A SETTLEMENT ALWAYS NAMES WHO MOVED THE WHEEL.
 *
 * Build note 7:
 *
 *   "take_rate_syndicated is an AUCTION OUTCOME, not a design parameter (break
 *    B4: the ratchet reverses). Wherever the take-rate slider appears it must
 *    be labelled as a competitive outcome. A simulator that lets the reader
 *    'set' the take rate as a lever gets the era's economics backwards."
 *
 * `mintContested` refuses a bare share. It takes a settlement minted by
 * `wheel.js`, whose `settledBy` field is never "the reader" on its own — the
 * wheel reports which hand last moved it, and the rival's hand moves on its
 * own. So the sentence about who set the rate travels with the number, in every
 * surface the number reaches, including the accessible name.
 * ======================================================================
 */

import {
  assertTextColor, BRASS_TEXT, CYAN_TEXT, ZINC_TEXT, GRAPHITE, RUST,
} from '../lib/tokens.js';
import { money, moneyAsMeasured, count, percent, times } from '../auction/readouts.js';
import { isSettlement, settlementPhrase, notchPhrase } from './wheel.js';

export { money, moneyAsMeasured, count, percent, times };

export class FigureError extends Error {
  constructor(message, detail = null, fix = null) {
    super(fix ? `${message}\n  FIX: ${fix}` : message);
    this.name = 'FigureError';
    this.detail = detail;
    this.fix = fix;
  }
}

const MINTED = new WeakSet();
const finite = (v) => typeof v === 'number' && Number.isFinite(v);

/**
 * The roles a door figure can hold, and the ink each one is printed in.
 *
 * The palette's meanings are not decoration. Brass is money, cyan is the count,
 * rust is the intermediary's take and nothing else, iron is mechanism. A figure
 * declares its role at mint, so a query count can never be painted as money and
 * the revenue share paid out through the door can never be painted as anything
 * but the take.
 */
export const FIGURE_ROLES = Object.freeze({
  /** A filed dollar. Not an auction outcome — no bidder produced it. */
  filed: { ink: BRASS_TEXT, what: 'a filed dollar figure' },
  /** A dollar this bench worked out from filed dollars. */
  money: { ink: BRASS_TEXT, what: 'a dollar figure' },
  /** What the access-point owner keeps. Rust, and rust means nothing else. */
  take: { ink: RUST, what: 'what leaves through the door' },
  /** Queries, shares, advertisers. */
  count: { ink: CYAN_TEXT, what: 'the count' },
  /** A ratio that is not a share of a named denominator — a multiple. */
  multiple: { ink: GRAPHITE, what: 'a multiple' },
  /** A share of a named denominator. Always minted through mintShare. */
  share: { ink: GRAPHITE, what: 'a share' },
  /**
   * A GAP BETWEEN TWO SHARES, in percentage points.
   *
   * It is not a share and it has no denominator of its own: the disclosed
   * payout gap between two firms in 2002 is 91 per cent minus 58 per cent, and
   * naming a base for it would invent one. It prints in points and it says so.
   */
  points: { ink: GRAPHITE, what: 'a gap between two shares, in percentage points' },
  /** A setting of the machine. */
  mechanism: { ink: ZINC_TEXT, what: 'a setting of the machine' },
});

/* ------------------------------------------------------------------ *
 * 1 · PROVENANCE, INVENTION, AND THE COMMON SHAPE
 * ------------------------------------------------------------------ */

function checkLabel(label, spec) {
  if (typeof label !== 'string' || label.trim().length < 4) {
    throw new FigureError(
      'every figure on this bench needs a label a reader can read.', spec,
      'label it — "what AOL kept of every syndicated dollar", not "s"'
    );
  }
  return label.trim();
}

function checkProvenance(spec) {
  const { stepRef = null, derivedFrom = null, label } = spec;
  const hasStep = typeof stepRef === 'string' && stepRef.trim().length > 0;
  const hasDerivation = typeof derivedFrom === 'string' && derivedFrom.trim().length >= 12;
  if (hasStep && derivedFrom != null) {
    throw new FigureError(
      `"${label}" names both a stored step and a written derivation. Two provenances for one ` +
      'number is two answers to "where did this come from", and a reader gets the wrong one.',
      spec,
      'keep the stepRef if the record stores this figure; keep the derivedFrom if it does not'
    );
  }
  if (!hasStep && !hasDerivation) {
    throw new FigureError(
      `"${label}" says nothing about where it comes from. Every figure on this bench either ` +
      'equals a stored step in mechanism.json engines.distribution (or the five reconciliation ' +
      'steps) or carries a written derivation. simulator-params.json build note 6 requires the ' +
      'derivation in writing wherever a D-scenario re-derives a quantity the record does not ' +
      'store. A number with neither is a number from nowhere.',
      spec,
      'pass stepRef: the stored expression this figure must equal — or derivedFrom: a sentence ' +
      'saying how it was worked out'
    );
  }
  return {
    stepRef: hasStep ? stepRef.trim() : null,
    derivedFrom: hasDerivation ? derivedFrom.trim() : null,
  };
}

/**
 * BUILD NOTE 8, CROSS-CHECKED.
 *
 * `illustrative` is the record's own flag. Where it is on, the figure lists the
 * invented inputs by name, and every name has to be a setting the frozen
 * scenario actually carries. The cross-check is the whole point: a list of
 * caveats nobody can trace back to an input is decoration, and this project has
 * already learned that a redundancy which exists only in an argument list is
 * not a redundancy.
 */
export function assertInventedNamesAreSettings(invented, settings, spec) {
  if (!Array.isArray(invented) || invented.length === 0) {
    throw new FigureError(
      `"${spec.label}" is minted on an illustrative scenario and names no invented input. ` +
      'simulator-params.json build note 8 lists which inputs are made up on D5, D6, D10 and ' +
      'D11; a figure standing on one of them says so beside itself.',
      spec,
      'pass invented: ["rpm_buyer", "serving_cost_per_1k"] — the settings this figure stands on'
    );
  }
  if (settings == null) {
    throw new FigureError(
      `"${spec.label}" declares invented inputs and passed no settings object to check them ` +
      'against. A caveat nobody can trace back to an input is decoration.',
      spec,
      'pass settings: the scenario\'s own resolved settings'
    );
  }
  for (const name of invented) {
    if (typeof name !== 'string' || !(name in settings)) {
      throw new FigureError(
        `"${spec.label}" names "${name}" as an invented input and that is not a setting this ` +
        'scenario carries.',
        { invented, settings: Object.keys(settings) },
        `use one of: ${Object.keys(settings).join(', ')}`
      );
    }
  }
  return Object.freeze([...invented]);
}

function finish(mark) {
  assertTextColor(mark.ink, `door figure "${mark.label}"`);
  Object.freeze(mark);
  MINTED.add(mark);
  return mark;
}

/* ------------------------------------------------------------------ *
 * 2 · THE THREE MINTS
 * ------------------------------------------------------------------ */

/**
 * A LEVEL. A dollar, a count, a multiple — anything that is not a share.
 *
 * @param {object} spec
 * @param {number} spec.value       the measured number
 * @param {string} spec.role        a key of FIGURE_ROLES, never `share`
 * @param {string} spec.label       what the figure IS, in a reader's words
 * @param {string} spec.unit        the unit, printed with the figure
 * @param {string} spec.stepRef     the stored expression this figure must equal
 * @param {string} spec.derivedFrom the written derivation, where no step exists
 * @param {boolean} spec.illustrative  the record's own flag on the scenario
 * @param {string[]} spec.invented  which settings are invented; required when illustrative
 * @param {object} spec.settings    the scenario's settings, for the cross-check
 */
export function mintLevel(spec = {}) {
  const { value, role = 'filed', unit = '', illustrative = false, invented = null, settings = null } = spec;
  const label = checkLabel(spec.label, spec);
  if (!finite(value)) {
    throw new FigureError(
      `a figure must be a finite measured number, and "${label}" is ${JSON.stringify(value)}.`,
      spec,
      'a figure the record does not carry is an absence — draw it as one, do not print "—"'
    );
  }
  if (!FIGURE_ROLES[role]) {
    throw new FigureError(`"${role}" is not a figure role.`, spec,
      `use one of: ${Object.keys(FIGURE_ROLES).filter((r) => r !== 'share').join(', ')}`);
  }
  if (role === 'share') {
    throw new FigureError(
      `"${label}" asks to be minted as a share through mintLevel, which takes a bare number. ` +
      'A share on this bench is a numerator over a NAMED denominator and has no scalar form: ' +
      'the record quotes network share on three different bases and they are not ' +
      'interchangeable (break B9).',
      spec,
      'use mintShare({ numerator, denominator, label })'
    );
  }
  const provenance = checkProvenance({ ...spec, label });
  return finish({
    kind: 'level', value, role, label, unit,
    ink: FIGURE_ROLES[role].ink,
    illustrative: Boolean(illustrative),
    invented: illustrative ? assertInventedNamesAreSettings(invented, settings, { ...spec, label }) : null,
    basis: null, numerator: null, denominator: null,
    settlement: null,
    ...provenance,
  });
}

/**
 * A SHARE. No `value` argument exists, and that is the guarantee.
 *
 * @param {object} spec
 * @param {{value:number,label:string}} spec.numerator
 * @param {{value:number,label:string}} spec.denominator   the BASIS, named
 */
export function mintShare(spec = {}) {
  const {
    numerator, denominator, role = 'share', unit = '',
    illustrative = false, invented = null, settings = null,
  } = spec;
  const label = checkLabel(spec.label, spec);
  if ('value' in spec) {
    throw new FigureError(
      `"${label}" was handed a ready-made value. mintShare computes the share from its own ` +
      'numerator and denominator so that the basis cannot be attached to a number that was ' +
      'worked out against a different one. That is the whole rule (break B9).',
      spec,
      'pass numerator and denominator, each with its own label; the share is worked out here'
    );
  }
  for (const [side, part] of [['numerator', numerator], ['denominator', denominator]]) {
    if (!part || !finite(part.value)) {
      throw new FigureError(
        `"${label}" has no measured ${side}.`, spec,
        `pass ${side}: { value, label }`
      );
    }
    if (typeof part.label !== 'string' || part.label.trim().length < 8) {
      throw new FigureError(
        `"${label}" has a ${side} with no name a reader can use ` +
        `(${JSON.stringify(part.label)}). The record quotes the same numerator over three ` +
        'different denominators and calls all three correct; an unnamed denominator is how ' +
        '31.8%, 30.8% and 9.4% become one number that is wrong twice.',
        spec,
        `pass ${side}: { value, label: "Google's 2008 advertising revenue" }`
      );
    }
  }
  if (denominator.value === 0) {
    throw new FigureError(`"${label}" divides by zero.`, spec, 'a share of nothing is not a share');
  }
  if (!FIGURE_ROLES[role] || (role !== 'share' && role !== 'take')) {
    throw new FigureError(
      `"${label}" asks for role "${role}". A share is drawn as a share or, where it is what the ` +
      'access-point owner keeps, as the take.',
      spec, 'use role: "share" or role: "take"'
    );
  }
  const provenance = checkProvenance({ ...spec, label });
  const value = numerator.value / denominator.value;
  return finish({
    kind: 'share', value, role, label, unit,
    ink: FIGURE_ROLES[role].ink,
    numerator: Object.freeze({ value: numerator.value, label: numerator.label.trim() }),
    denominator: Object.freeze({ value: denominator.value, label: denominator.label.trim() }),
    basis: `of ${denominator.label.trim()}`,
    illustrative: Boolean(illustrative),
    invented: illustrative ? assertInventedNamesAreSettings(invented, settings, { ...spec, label }) : null,
    settlement: null,
    ...provenance,
  });
}

/**
 * A FIGURE THE WHEEL PRODUCED. Break B4, made structural.
 *
 * It takes a settlement, never a share. `wheel.js` mints settlements and no
 * caller can build one, so a figure standing on the revenue share always
 * carries the sentence about which hand last moved the wheel — and that
 * sentence is frequently "the rival pushed it up", which is the fact the whole
 * component exists to teach.
 */
export function mintContested(spec = {}) {
  const { settlement, role = 'take', unit = '' } = spec;
  const label = checkLabel(spec.label, spec);
  if (!isSettlement(settlement)) {
    throw new FigureError(
      `"${label}" is a figure off the revenue-share wheel and was handed something wheel.js did ` +
      'not settle. simulator-params.json build note 7: the take rate is an AUCTION OUTCOME, not ' +
      'a design parameter. A bare number here is a number the reader would read as their own ' +
      'choice, which gets the era\'s economics backwards.',
      spec,
      'pass settlement: the object wheel.settle() returned'
    );
  }
  const provenance = checkProvenance({ ...spec, label });
  return finish({
    kind: 'contested',
    value: settlement.share,
    role, label, unit,
    ink: FIGURE_ROLES[role].ink,
    settlement,
    basis: 'of what the partner\'s page earned',
    numerator: null, denominator: null,
    illustrative: Boolean(spec.illustrative),
    invented: spec.illustrative
      ? assertInventedNamesAreSettings(spec.invented, spec.settings, { ...spec, label })
      : null,
    ...provenance,
  });
}

export function isFigure(value) { return MINTED.has(value); }

export function assertFigure(value, where) {
  if (!MINTED.has(value)) {
    throw new FigureError(
      `${where} was handed something figures.js did not mint. Every number on this bench is ` +
      'minted with its label, its role, its basis where it is a share, and the settlement that ' +
      'produced it where it came off the wheel.',
      value,
      'build it with mintLevel, mintShare or mintContested'
    );
  }
  return value;
}

/* ------------------------------------------------------------------ *
 * 3 · THE SPLIT THAT MAY NEVER BE A POINT
 * ------------------------------------------------------------------ */

/**
 * D7's volume/yield decomposition, which the record forbids quoting flat.
 *
 * `simulator-params.json` D7 required_caption:
 *
 *   "Quote the split as 52-56% against 44-48%, NEVER as a flat 54%."
 *
 * `mech-capture-002` carries a central of 54.1 with an 80% interval of
 * [50, 58]. Its ratio is 0.148, well inside G1's 60% cut, so G1 would allow a
 * central here and a dot at 54.1 would be a legal mark. G1 is not the rule that
 * applies: the record's own objection is not that the interval is wide, it is
 * that the split is computed on two grade-C query denominators and the honest
 * answer is a band with a path at each end.
 *
 * So this type has no scalar. It carries the two paths, each a minted share
 * with its own denominator, and `splitSentence` prints both. There is nothing
 * on the object to average.
 */
const SPLITS = new WeakSet();

export function mintSplit(spec = {}) {
  const { high, low, label, of, because } = spec;
  const name = checkLabel(label, spec);
  for (const [side, part] of [['high', high], ['low', low]]) {
    if (!isFigure(part)) {
      throw new FigureError(
        `the ${name} needs a minted share for the ${side}-query path.`, spec,
        'both ends of this band are real figures with real provenance'
      );
    }
  }
  if (typeof of !== 'string' || of.trim().length < 8) {
    throw new FigureError(
      `the ${name} must name what it is a split OF.`, spec,
      'pass of: "Google\'s owned-site revenue growth, 2002 to 2007"'
    );
  }
  if (typeof because !== 'string' || because.trim().length < 12) {
    throw new FigureError(
      `the ${name} must say WHY it has no middle value. Two different rules put a figure on ` +
      'this bench into this shape — the record forbidding a flat quote, and G1 refusing a point ' +
      'on an interval wider than 60% of its own central — and a reader who is shown a range ' +
      'without being told which one is looking at an unexplained hole.',
      spec,
      'pass because: "both query paths are grade C, so the record gives a band and no middle"'
    );
  }
  const lo = Math.min(high.value, low.value);
  const hi = Math.max(high.value, low.value);
  const split = Object.freeze({
    kind: 'split', label: name, of: of.trim(), because: because.trim(), high, low, lo, hi,
    /* THERE IS NO `value` AND NO `central`. The record's caption forbids a flat
     * 54% and the way to keep a caption is to remove the field it would have
     * been read from. */
  });
  SPLITS.add(split);
  return split;
}

export function isSplit(value) { return SPLITS.has(value); }

export function splitSentence(split, digits = 1) {
  if (!isSplit(split)) throw new FigureError('splitSentence was handed something that is not a split.');
  const fmt = split.high.role === 'filed' || split.high.role === 'money'
    ? (v) => moneyAsMeasured(v)
    : split.high.role === 'multiple' ? (v) => times(v) : (v) => percent(v, digits);
  return `${split.label}: between ${fmt(split.lo)} and ${fmt(split.hi)} ${split.of}. ` +
    `${split.because.replace(/\.$/, '')}.`;
}

/* ------------------------------------------------------------------ *
 * 4 · PRINTING
 * ------------------------------------------------------------------ */

/** The figure as the reader sees it. The only way a number reaches the screen. */
export function figureText(figure, { digits = 2 } = {}) {
  assertFigure(figure, 'figureText');
  let head;
  if (figure.role === 'filed' || figure.role === 'money') head = moneyAsMeasured(figure.value);
  else if (figure.role === 'count') head = count(figure.value, figure.value % 1 === 0 ? 0 : digits);
  else if (figure.role === 'multiple') head = times(figure.value);
  else head = percent(figure.value, 1);
  if (figure.role === 'points') return `${head} of the surface's revenue apart`;
  return figure.unit ? `${head} ${figure.unit}` : head;
}

/**
 * Everything the record requires printed beside the figure.
 *
 * The order is the order a reader needs it: what the number is a share OF, who
 * moved the wheel that produced it, what was invented, and where it came from.
 */
export function figureQualifiers(figure) {
  assertFigure(figure, 'figureQualifiers');
  const out = [];
  if (figure.basis) out.push(figure.basis);
  if (figure.settlement) {
    out.push(settlementPhrase(figure.settlement));
    out.push(notchPhrase(figure.settlement));
  }
  if (figure.illustrative) out.push(`invented input: ${figure.invented.join(', ')}`);
  if (figure.derivedFrom) out.push(`where this comes from: ${figure.derivedFrom}`);
  return out;
}

/** The figure in one sentence, for the accessible name and the text-only path. */
export function figureSentence(figure, opts) {
  assertFigure(figure, 'figureSentence');
  const quals = figureQualifiers(figure);
  /* EACH QUALIFIER IS ITS OWN SENTENCE, not a clause in a list.
   * A screen reader says the whole of this out loud, and a 70-word run of
   * semicolons is a sentence nobody can hold. It is also what the readability
   * gate measures: joined with semicolons this scored FK 29. */
  return `${figure.label}: ${figureText(figure, opts)}.${quals.length ? ` ${quals.join('. ')}.` : ''}`;
}

/** A minted figure as a row the gate can take. One adapter, so nothing drifts. */
export function figureRow(figure) {
  assertFigure(figure, 'figureRow');
  return figure.stepRef
    ? { label: figure.label, value: figure.value, step: figure.stepRef }
    : { label: figure.label, value: figure.value, formula: figure.derivedFrom };
}

export function figureRows(figures) { return (figures || []).map(figureRow); }

export default {
  mintLevel, mintShare, mintContested, mintSplit, isSplit, splitSentence,
  isFigure, assertFigure, figureText, figureQualifiers, figureSentence,
  figureRow, figureRows, FIGURE_ROLES, FigureError,
  assertInventedNamesAreSettings,
  money, moneyAsMeasured, count, percent, times,
};
