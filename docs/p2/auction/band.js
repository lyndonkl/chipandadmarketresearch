/**
 * docs/p2/auction/band.js — THE BAND.
 *
 * Team B4. The signature interaction of the whole piece.
 *
 * ======================================================================
 * WHAT THE BAND IS, AND WHY IT IS A TYPE RATHER THAN A CHART
 *
 * GSP revenue is not a number. `mechanism.json` ex-3 proves it: with the same
 * three bidders, the same two slots and the same mechanism, the seller collects
 * $440 at the lowest envy-free equilibrium and $760 when everybody bids their
 * value. That is a 1.727x spread, and the mechanism does not move across it.
 * The bidders do.
 *
 * `simulator-params.json` build note 2 states the consequence:
 *
 *   "Every revenue figure the simulator displays must carry the current
 *    bidder_mode as a label. A GSP revenue number without a bidder_mode is not
 *    a number; it is a point inside a 1.727x band (sc-05)."
 *
 * A caption saying that is a caption. This module makes it structural, the way
 * the chart layer made a span-only mark structural: a span-only mark has no
 * `central` key, so the forbidden draw is impossible rather than forbidden.
 *
 * Here the same move is:
 *
 *   - `mintReading()` REFUSES a revenue figure with no bidder mode. There is no
 *     default mode and no "unknown". A figure the caller cannot label is a
 *     figure the caller may not draw.
 *   - `mintBand()` carries a floor, a ceiling and a marker, and the marker is
 *     itself a minted reading. The band has no scalar `usd` field. A renderer
 *     reaching for "the revenue" finds a floor, a ceiling and a labelled
 *     marker, and has to say which one it means.
 *   - Where the record gives no values for the cast — sc-01, sc-02, sc-03 and
 *     sc-07 hold bids fixed and never say what the bidders were worth — the
 *     band CANNOT be located. `unlocatedBand()` returns a documented absence
 *     with a reason, and the bench draws it as stipple inside the track frame.
 *     Rule 5: absence is a positive object, never whitespace.
 * ======================================================================
 */

import { assertMark } from './readouts.js';

export class BandError extends Error {
  constructor(message, detail = null, fix = null) {
    super(fix ? `${message}\n  FIX: ${fix}` : message);
    this.name = 'BandError';
    this.detail = detail;
    this.fix = fix;
  }
}

const finite = (v) => typeof v === 'number' && Number.isFinite(v);

/* ------------------------------------------------------------------ *
 * 1 · THE FOUR WAYS BIDDERS PLAY
 * ------------------------------------------------------------------ */

/**
 * The bidder modes `simulator-params.json` declares. Read the file's own
 * `variables` entry for the authority; this list is the vocabulary the band
 * refuses to go outside.
 */
export const BIDDER_MODES = Object.freeze([
  'naive_truthful', 'lowest_envy_free', 'one_shader', 'custom',
]);

/** How each mode is named to a reader. Short, and it names the actor. */
export const MODE_LABEL = Object.freeze({
  naive_truthful: 'everyone bids their value',
  lowest_envy_free: 'everyone plays the lowest equilibrium',
  one_shader: 'one bidder shades, the rest bid their value',
  custom: 'bids held fixed at the record\'s own numbers',
});

export function assertBidderMode(mode, where) {
  if (!BIDDER_MODES.includes(mode)) {
    throw new BandError(
      `${where}: "${mode}" is not a bidder mode this record declares.`,
      { mode },
      `use one of: ${BIDDER_MODES.join(', ')}`
    );
  }
  return mode;
}

/* ------------------------------------------------------------------ *
 * 2 · THE THREE EQUILIBRIA THE RECORD COMPUTES
 * ------------------------------------------------------------------ */

/**
 * Naive truthful play. Everybody bids their value, so under GSP the holder of
 * slot j pays the value of the bidder one place below it.
 *
 * This is the CEILING of the band, and it is the number a simulator that never
 * asked the question would print as "GSP revenue".
 */
export function naiveTruthful(values, slotClicks) {
  const sorted = [...values].sort((a, b) => b - a);
  const prices = slotClicks.map((_, j) => (sorted[j + 1] != null ? sorted[j + 1] : 0));
  const revenue = slotClicks.reduce((sum, a, j) => sum + a * prices[j], 0);
  return Object.freeze({ mode: 'naive_truthful', prices: Object.freeze(prices), revenue });
}

/**
 * The lowest symmetric / locally envy-free equilibrium, by the standard
 * recursion (Varian 2007; Edelman, Ostrovsky and Schwarz 2007):
 *
 *   alpha_j * p_j = alpha_(j+1) * p_(j+1) + (alpha_j - alpha_(j+1)) * v_(j+1)
 *
 * Worked from the bottom slot up. This is the FLOOR of the band, and it is
 * revenue-equivalent to VCG.
 */
export function lowestEnvyFree(values, slotClicks) {
  const sorted = [...values].sort((a, b) => b - a);
  const m = slotClicks.length;
  const prices = new Array(m).fill(0);
  const alpha = (j) => (j < m ? slotClicks[j] : 0);
  for (let j = m - 1; j >= 0; j -= 1) {
    const below = alpha(j + 1);
    const priceBelow = j + 1 < m ? prices[j + 1] : 0;
    const valueBelow = sorted[j + 1] != null ? sorted[j + 1] : 0;
    prices[j] = (below * priceBelow + (alpha(j) - below) * valueBelow) / alpha(j);
  }
  const revenue = slotClicks.reduce((sum, a, j) => sum + a * prices[j], 0);
  return Object.freeze({ mode: 'lowest_envy_free', prices: Object.freeze(prices), revenue });
}

/**
 * One bidder shades and the rest bid their value.
 *
 * The shaded bid is a PARAMETER, not a derivation. `mechanism.json` ex-2 uses
 * $5 — below Wren's $6, above Yarrow's $2 — and the seller's revenue after the
 * deviation, $660, is computed from that $5. Any other shade gives a different
 * number, which is the point: the band is wide because the bidders decide where
 * inside it the market sits.
 */
export function oneShader(values, slotClicks, shadedBid) {
  if (!finite(shadedBid)) {
    throw new BandError(
      'oneShader needs the shaded bid. It is a choice the bidder makes, not a number the ' +
      'mechanism produces, and the seller\'s revenue moves with it.',
      { shadedBid },
      'mechanism.json ex-2 uses $5 against values of $10, $6 and $2'
    );
  }
  const sorted = [...values].sort((a, b) => b - a);
  const bids = [shadedBid, ...sorted.slice(1)].sort((a, b) => b - a);
  const prices = slotClicks.map((_, j) => (bids[j + 1] != null ? bids[j + 1] : 0));
  const revenue = slotClicks.reduce((sum, a, j) => sum + a * prices[j], 0);
  return Object.freeze({
    mode: 'one_shader', prices: Object.freeze(prices), revenue, shadedBid,
  });
}

/**
 * VCG, for the check that the floor is where the theory says it is.
 *
 * Each winner pays the externality it imposes on everybody below it. The total
 * equals the lowest envy-free GSP revenue, and `mechanism.json` ex-3 stores
 * both numbers so the agreement is checkable rather than asserted.
 */
export function vcg(values, slotClicks) {
  const sorted = [...values].sort((a, b) => b - a);
  const m = slotClicks.length;
  const payments = [];
  for (let j = 0; j < m; j += 1) {
    let paid = 0;
    for (let k = j; k < m; k += 1) {
      const below = k + 1 < m ? slotClicks[k + 1] : 0;
      const valueBelow = sorted[k + 1] != null ? sorted[k + 1] : 0;
      paid += (slotClicks[k] - below) * valueBelow;
    }
    payments.push(paid);
  }
  const revenue = payments.reduce((a, b) => a + b, 0);
  return Object.freeze({
    mode: 'vcg',
    payments: Object.freeze(payments),
    pricesPerClick: Object.freeze(payments.map((p, j) => p / slotClicks[j])),
    revenue,
  });
}

/**
 * The envy check the record runs, printed so a reader can run it too.
 *
 * At the lowest envy-free equilibrium the bidder in slot 2 earns exactly what
 * it would earn in slot 1 at slot 1's price. Exactly equal is the boundary, and
 * that equality is what "lowest" means.
 */
export function envyCheck(values, slotClicks, prices) {
  const sorted = [...values].sort((a, b) => b - a);
  const out = [];
  for (let j = 1; j < slotClicks.length; j += 1) {
    out.push(Object.freeze({
      bidderValue: sorted[j],
      inSlot: j + 1,
      payoffHere: slotClicks[j] * (sorted[j] - prices[j]),
      payoffOneUp: slotClicks[j - 1] * (sorted[j] - prices[j - 1]),
    }));
  }
  return Object.freeze(out);
}

/* ------------------------------------------------------------------ *
 * 3 · THE BAND ITSELF
 * ------------------------------------------------------------------ */

const BANDS = new WeakSet();

/**
 * Mint a band.
 *
 * `floor`, `ceiling` and `marker` must each be a minted reading — see
 * readouts.js — so each one already carries the mode that produced it. The band
 * has no scalar revenue field of its own. A renderer that wants "the number"
 * has to pick one of the three and say which.
 *
 * ======================================================================
 * A MARKER OUTSIDE THE BAND IS NOT A DISPLAY PROBLEM.
 *
 * Both located-band scenarios used to pre-clamp the marker into the track
 * before minting it, and the drawing clamped it a second time. At sc-04's own
 * bottom stop the seller collects 100 x $2.01 plus 80 x $2, which is $361.00.
 * The money zone printed exactly that, in the largest type on the panel, while
 * the marker sat pinned at $440. The panel showed two different revenues at
 * once and the band one was fabricated.
 *
 * So the clamp is gone and this function REFUSES a marker outside the floor and
 * the ceiling. A marker outside the band is either a real finding about the
 * mechanism or a bug in the scenario, and both have to be visible.
 *
 * Where it is a real finding, the caller says so in `excursion` — a written
 * sentence, refused if it is blank, exactly as `unlocatedBand` refuses a blank
 * reason. The bench then draws the marker where it really is, outside the
 * track, with that sentence beside it. sc-04 below a $2.80 bid is the case: the
 * profile is still a Nash equilibrium, it is not locally envy-free, and the
 * record's floor is the lowest envy-free equilibrium and not the lowest Nash
 * one. That is the most interesting thing on the page.
 * ======================================================================
 */
export function mintBand({ floor, ceiling, marker, unit, note = null, stops = [], excursion = null }) {
  assertMark(floor, 'band floor');
  assertMark(ceiling, 'band ceiling');
  assertMark(marker, 'band marker');
  if (!(ceiling.usd > floor.usd)) {
    throw new BandError(
      'a band needs a ceiling above its floor.',
      { floor: floor.usd, ceiling: ceiling.usd },
      'the floor is the lowest envy-free equilibrium; the ceiling is naive truthful play'
    );
  }
  for (const stop of stops) assertMark(stop, 'band stop');
  const width = ceiling.usd - floor.usd;
  const below = marker.usd < floor.usd - 1e-9;
  const above = marker.usd > ceiling.usd + 1e-9;
  const inside = !below && !above;

  if (!inside && (typeof excursion !== 'string' || excursion.trim().length < 12)) {
    throw new BandError(
      `this band's marker sits at ${marker.usd} and the band runs ${floor.usd} to ${ceiling.usd}. ` +
      'It is outside. That is not a number to be tidied back inside the track — it is either a ' +
      'real finding about the mechanism or a bug in the scenario, and either way it has to be ' +
      'drawn where it really is and explained.',
      { floor: floor.usd, ceiling: ceiling.usd, marker: marker.usd, side: below ? 'below' : 'above' },
      'if the scenario really does land outside the band, pass excursion: a sentence saying why ' +
      '— it is printed beside the marker. If it does not, fix the arithmetic; do not clamp it.'
    );
  }
  if (inside && excursion != null) {
    throw new BandError(
      'this band declares an excursion and its marker is inside the band.',
      { floor: floor.usd, ceiling: ceiling.usd, marker: marker.usd },
      'pass excursion only where the marker genuinely falls outside the floor and the ceiling'
    );
  }
  for (const stop of stops) {
    if (stop.usd < floor.usd - 1e-9 || stop.usd > ceiling.usd + 1e-9) {
      throw new BandError(
        `the stop "${stop.label}" sits at ${stop.usd}, outside the band it is a stop on.`,
        { stop: stop.usd, floor: floor.usd, ceiling: ceiling.usd },
        'a named stop is a place the same rule can land — widen the band or drop the stop'
      );
    }
  }

  const band = {
    kind: 'band',
    floor, ceiling, marker,
    stops: Object.freeze([...stops]),
    unit: String(unit || ''),
    ratio: ceiling.usd / floor.usd,
    width,
    /**
     * Where the marker sits across the band, 0 at the floor and 1 at the top.
     * It is NOT clipped: an excursion reads below 0 or above 1, and the drawing
     * uses that to place the marker outside the track.
     */
    position: (marker.usd - floor.usd) / width,
    inside,
    outsideBelow: below,
    outsideAbove: above,
    excursion: inside ? null : excursion.trim(),
    located: true,
    note,
  };
  Object.freeze(band);
  BANDS.add(band);
  return band;
}

/**
 * A band the record cannot locate, as an object.
 *
 * sc-01, sc-02, sc-03 and sc-07 hold the bids fixed and the record never says
 * what those bidders were worth. Without values there is no equilibrium to
 * compute, so the band has no floor and no ceiling — and the honest drawing is
 * a framed, stippled track with the reason printed on it, not a blank space and
 * not a made-up range. `DESIGN.md` rule 5: absence is a positive object.
 */
export function unlocatedBand(reason) {
  if (typeof reason !== 'string' || reason.trim().length < 12) {
    throw new BandError(
      'an unlocated band needs a written reason. A blank track teaches a reader that the ' +
      'question was not asked.',
      { reason },
      'say why the record cannot place the band — "the record gives no values for this cast"'
    );
  }
  const band = { kind: 'band', located: false, reason: reason.trim(), absenceForm: 'stipple' };
  Object.freeze(band);
  BANDS.add(band);
  return band;
}

export function isBand(value) { return BANDS.has(value); }

export function assertBand(value, where) {
  if (!BANDS.has(value)) {
    throw new BandError(
      `${where} was handed something this module did not mint.`,
      value,
      'build it with mintBand() or unlocatedBand()'
    );
  }
  return value;
}

/**
 * The band in one sentence, for the accessible name and for the text-only path.
 *
 * Written to the readability gate: short sentences, plain words, and the actor
 * named. B8 replaces it from the data layer later; until then it is generated
 * here and stamped, exactly as the chart layer stamps its own.
 */
export function bandSentence(band, format = String) {
  assertBand(band, 'bandSentence');
  if (!band.located) return `The record cannot place this band. ${band.reason}`;
  const span = `${format(band.floor.usd)} to ${format(band.ceiling.usd)}`;
  /* The unit is a noun phrase — "over 180 clicks", "per sale, three bidders" —
   * so it needs its comma. Without one a screen reader said "Revenue runs from
   * $440 to $760 the sc-05 example, over 180 clicks", which runs the span and
   * the unit into one ungrammatical clause. */
  const head =
    `Revenue runs from ${span}${band.unit ? `, ${band.unit}` : ''}, a spread of ` +
    `${band.ratio.toFixed(3)} times. The rule never changes across it. `;
  /* EVERY NUMBER THE TRACK DRAWS IS SPOKEN. The named stops get a tick and a
   * label in the drawing, and this sentence used to skip them — so a sighted
   * reader saw a third number on the track and a screen-reader reader was told
   * about two. A drawn figure nobody hears is the same defect as a drawn figure
   * that says something else. */
  const stops = band.stops.length
    ? `${band.stops.length === 1 ? 'A named stop sits' : 'Named stops sit'} at ` +
      `${band.stops.map((stop) => `${format(stop.usd)}, where ${modeClause(stop)}`).join('; and ')}. `
    : '';
  if (!band.inside) {
    return `${head}${stops}The marker sits at ${format(band.marker.usd)}, ` +
      `${band.outsideBelow ? 'below' : 'above'} the band, where ${modeClause(band.marker)}. ` +
      band.excursion;
  }
  return `${head}${stops}The marker sits at ${format(band.marker.usd)}, ` +
    `where ${modeClause(band.marker)}.`;
}

/**
 * How a reading's bidder mode is named to a reader.
 *
 * IT READS `modeNote` FIRST, because `modeNote` is the field every caller
 * actually sets and it is the specific one. This used to print
 * `MODE_LABEL[mark.mode]` and ignore it, so at sc-04's opening position — before
 * the reader touches anything — the band's accessible name said "one bidder
 * shades, the rest bid their value" while Vale was bidding its full $10 and
 * nobody was shading. The generic label is the fallback, never the answer.
 */
export function modeWords(mark) {
  if (mark && mark.modeNote) return mark.modeNote;
  if (mark && MODE_LABEL[mark.mode]) return MODE_LABEL[mark.mode];
  return mark && mark.label ? mark.label : 'bidders play some way this bench cannot name';
}

/**
 * The same words, where the sentence has already said "where" — so they owe a CLAUSE, somebody
 * doing something, and not the name of a thing.
 *
 * `modeWords` itself stays tolerant, because `bandEnds` drops it into a description slot where
 * "the lowest equilibrium" is exactly right. It is only after "where" that a noun phrase becomes
 * a fragment, and scenario 9 shipped one: "The marker sits at $440, where the lowest equilibrium."
 * A reader with images off met that sentence and nothing else.
 *
 * The tell is an opening article. No clause in this vocabulary starts with one, and every noun
 * phrase that reached here did. Refusing rather than quietly repairing is the point: a bench that
 * patched the grammar would hide the fact that a mode had no sentence written for it.
 */
const ARTICLE_FIRST = /^(the|a|an)\b/i;

export function modeClause(mark) {
  const words = modeWords(mark);
  if (ARTICLE_FIRST.test(words)) {
    throw new BandError(
      `modeClause: "${words}" names a thing, and the sentence is about to read "where ${words}".`,
      { words, mode: mark && mark.mode },
      'write it as somebody doing something — "bidders play the lowest equilibrium" rather than '
      + '"the lowest equilibrium"',
    );
  }
  return words;
}

/** Every minted reading a band puts on screen: its ends, its stops, its marker. */
export function bandReadings(band) {
  assertBand(band, 'bandReadings');
  if (!band.located) return [];
  return [band.floor, band.ceiling, ...band.stops, band.marker];
}

export default {
  BIDDER_MODES, MODE_LABEL, assertBidderMode, modeWords,
  naiveTruthful, lowestEnvyFree, oneShader, vcg, envyCheck,
  mintBand, unlocatedBand, isBand, assertBand, bandSentence, bandReadings, BandError,
  modeClause,
};
