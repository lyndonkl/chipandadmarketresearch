/**
 * docs/p2/auction/scenarios.js — the ten deltas on one instrument.
 *
 * Team B4.
 *
 * ======================================================================
 * ONE APPARATUS, TEN TIMES
 *
 * The bench is never ten charts. It is one instrument with three fixed zones —
 * the inputs on the left, the allocation in the centre, the money in a
 * permanent readout on the right — and each scenario is a delta on it. A reader
 * learns the frame once in sc-01 and spends the other nine reading a change.
 *
 * Every scenario here declares four things and nothing else:
 *
 *   teaches   one sentence, at the reading level the project's prose gate sets
 *   controls  what the reader's hand can reach, and its range
 *   build     the view model, from the frozen settings and the live controls
 *   centre    which of THREE allocation forms the centre zone draws
 *
 * The three forms are `slots` (eight of the ten), `bars` (sc-06) and `plates`
 * (sc-10). Nothing else exists, because a fourth form would be a fourth thing
 * to learn.
 *
 * ======================================================================
 * EVERY FIGURE NAMES ITS STEP
 *
 * `build` returns two lists.
 *
 *   figures — each carries `step`, a stored expression from mechanism.json's
 *             auction engine. `arithmetic.js` evaluates that expression and
 *             compares. A figure with no step never enters this list.
 *   derived — arithmetic OVER those figures, with the formula written out. A
 *             reader moving a knob off the record's own stop gets a derived
 *             row, labelled, rather than a figure pretending to be filed.
 *
 * That split is the record's own convention: `simulator-params.json` build note
 * 7 requires a written derivation wherever a panel computes something the
 * record does not store.
 * ======================================================================
 */

import {
  mintCast, runAuction, payYourBidAtFrozenBids, sealedBidPanel,
  squashMarkup, formatLaunch, upliftOnBase, stackKnobs,
} from './engine.js';
import {
  naiveTruthful, lowestEnvyFree, oneShader, vcg, envyCheck,
  mintBand, unlocatedBand, bandReadings,
} from './band.js';
import { mintReading, readingRows } from './readouts.js';

/* ------------------------------------------------------------------ *
 * THE CAST NAMES COME OUT OF THE RECORD
 * ------------------------------------------------------------------ */

function exampleById(mechanism, id) {
  const list = mechanism.engines.auction.examples || [];
  return list.find((e) => e.id === id) || null;
}

/**
 * The cast's names, read from `mechanism.json` rather than typed.
 *
 * Three of the examples carry structured casts. `break-2` names its single
 * advertiser in a sentence, so a narrow reader pulls the name out of that
 * sentence and the panel falls back to a plain description if the wording ever
 * changes. A missing name is never a reason to invent one.
 */
export function castNames(mechanism, exampleId) {
  const ex = exampleById(mechanism, exampleId);
  if (!ex || !ex.setup) return [];
  const setup = ex.setup;
  const structured = setup.advertisers || setup.bidders || setup.part_a_cast;
  if (Array.isArray(structured)) return structured.map((row) => row.name);
  const prose = Object.values(setup).filter((v) => typeof v === 'string').join(' ');
  const found = [...prose.matchAll(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b(?=\s+bids\b)/g)].map((m) => m[1]);
  return found;
}

/* ------------------------------------------------------------------ *
 * SMALL HELPERS
 * ------------------------------------------------------------------ */

const near = (a, b) => Math.abs(a - b) < 1e-9;

/**
 * WHERE A READING COMES FROM, in the one shape `mintReading` takes.
 *
 * A string is a stored expression in `mechanism.json`'s auction engine, and the
 * arithmetic gate evaluates it and compares. `worked(...)` is the other kind: a
 * written derivation, for a control position the record does not store. There
 * is no third kind and no default, so a figure can never reach the till with
 * nothing behind it.
 */
function prov(source) {
  if (typeof source === 'string' && source.trim().length > 0) return { stepRef: source };
  if (source && typeof source.formula === 'string') return { derivedFrom: source.formula };
  throw new Error(
    'scenarios: every reading names either a stored step or a written derivation. ' +
    `This one names ${JSON.stringify(source)}.`
  );
}

/** A written derivation, for a figure at a control position the record does not store. */
const worked = (formula) => ({ formula });

/**
 * A SETTING THIS FILE WILL NOT GUESS EITHER.
 *
 * ======================================================================
 * THE DEFECT MOVED UP A LAYER.
 *
 * `engine.js` used to default the position multipliers, the increment and the
 * reserve, and each default happened to equal the record's value for sc-01,
 * sc-02 and sc-03. Delete any one of them from `simulator-params.json` and the
 * bench rendered the record's exact numbers anyway, with a green gate. That was
 * fixed there: the engine now throws on an absent setting.
 *
 * The same defect was sitting one layer up, in this file, in six places:
 *
 *   sc-06  `ctx.settings.n_bidders || [2, 3, 5, 10]`
 *   sc-08  `reserve.compare || [0.01, 1.0]`,  twice
 *   sc-09  `gamma.default != null ? gamma.default : 1.0`,  twice
 *   sc-09  `gamma.marked_stops || [1.0, 0.5, 0.0]`
 *
 * Every one of those literals is exactly what the record carries. Delete the
 * setting and the panel rendered the record's own numbers, with a green gate,
 * and nothing anywhere said the input was missing — verified by deleting each
 * one in turn. A fallback that equals the record is not a fallback; it is a
 * second, unversioned copy of the record, kept in a source file, where nobody
 * looks for data.
 *
 * So there are no fallbacks here. An absent setting stops the panel, names
 * itself, and says which file it comes from.
 * ======================================================================
 */
function req(value, key, where, check = (v) => v != null) {
  if (!check(value)) {
    throw new Error(
      `${where} has no ${key}, and this bench does not guess one. The literal that used to sit ` +
      'here was a copy of the record kept in a source file: delete the setting and the panel ' +
      'rendered the record\'s own numbers anyway, with a green gate and nothing said.\n' +
      `  FIX: set ${key} in this scenario's settings in simulator-params.json`
    );
  }
  return value;
}

const isNumberList = (v) => Array.isArray(v) && v.length > 0 && v.every((n) => Number.isFinite(n));

/** sc-06 opens at three bidders. See the note above the scenario for why. */
const SC06_OPENING_BIDDERS = 3;

/**
 * The two floors sc-08 compares, from the record. `reserve` is a control
 * definition on this scenario and not a scalar, so it is read off the
 * scenario's OWN record rather than off the resolved settings, where a parent's
 * scalar reserve would sit under it.
 */
function reserveStops(record) {
  const reserve = req(record.settings.reserve, 'reserve', 'sc-08');
  return req(reserve.compare, 'reserve.compare', 'sc-08', isNumberList);
}

/**
 * sc-07's true click rates, WHICH MUST BE ITS OWN.
 *
 * ======================================================================
 * THE ONE SETTING ON THIS BENCH THAT MAY NOT BE INHERITED.
 *
 * sc-07 inherits sc-02's settings and overrides `true_ctrs` with
 * [0.01, 0.02, 0.01]. Delete that override and the resolver hands it sc-02's
 * `true_ctrs`, which are equal to sc-02's `predicted_ctrs`. The seller's
 * forecast then IS what happened: the panel renders $52.58, the arithmetic gate
 * goes green because $52.58 is a real stored figure, and the scenario whose
 * entire subject is the gap between a forecast and the truth renders with no
 * gap in it. That is precisely the substitution `mintCast` refuses when the
 * array is short — and `mintCast` cannot see it here, because it guards the
 * array's LENGTH and an inherited array is full length.
 *
 * A scenario about the gap between forecast and truth must refuse to run when it
 * has no independent truth. That is what this does.
 * ======================================================================
 */
function ownTrueCtrs(ctx) {
  return ownSetting(
    ctx, 'true_ctrs',
    'This scenario is about the gap between the click rate the seller forecast and the rate that ' +
    'actually happened. An inherited array makes the two equal, and the panel then renders the ' +
    'parent scenario\'s revenue with a green gate and teaches nothing.'
  );
}

/** sc-09's squashing slider, entirely out of the record's own control block. */
function gammaSpec(record) {
  const spec = req(record.settings.gamma, 'gamma', 'sc-09');
  const range = req(spec.slider_range, 'gamma.slider_range', 'sc-09', isNumberList);
  return {
    default: req(spec.default, 'gamma.default', 'sc-09', Number.isFinite),
    stops: req(spec.marked_stops, 'gamma.marked_stops', 'sc-09', isNumberList),
    min: range[0],
    max: range[range.length - 1],
  };
}

/**
 * sc-09's FORMAT-PRICING KNOB, out of the record's own control block.
 *
 * ======================================================================
 * THE RECORD DECLARED THIS CONTROL AND NOTHING READ IT.
 *
 * `simulator-params.json` gives sc-09 a `format_multiplier` block —
 * `slider_range: [1.0, 1.25]`, `marked_stops: [1.0, 1.075, 1.2422968749999999]`
 * — and the bench drew a rocker of typed launch counts instead. `formatMultiplier`
 * appeared zero times in this file, the engine defaulted its own copy to 1, and
 * the record's 1.0 on sc-01 and sc-02 made that default look correct. Every
 * piece of that was unread.
 *
 * The positions are the record's stops now. The number of launches behind each
 * one is derived from the record's own per-launch durable uplift, so the label
 * a reader sees ("three launches") and the index the panel prints come from the
 * same place. ex-6's stored step `1.075**3` is what the gate checks the third
 * stop against.
 *
 * The record's stops stop at three launches, which is where the disclosed 20%
 * share of RPM lands. `1.075**4` is a stored step and stays in the ledger as a
 * figure; it is not a position on this control, because the record's slider
 * range does not reach it.
 * ======================================================================
 */
function formatStops(record) {
  const spec = req(record.settings.format_multiplier, 'format_multiplier', 'sc-09');
  const stops = req(spec.marked_stops, 'format_multiplier.marked_stops', 'sc-09', isNumberList);
  const pricing = req(
    (record.expected_output || {}).format_pricing, 'expected_output.format_pricing', 'sc-09'
  );
  const perLaunch = req(
    pricing.per_launch_durable, 'format_pricing.per_launch_durable', 'sc-09', Number.isFinite
  );
  const WORDS = ['none', 'one launch', 'two launches', 'three launches', 'four launches'];
  return stops.map((index) => {
    const launches = Math.round(Math.log(index) / Math.log(1 + perLaunch));
    if (!near(Math.pow(1 + perLaunch, launches), index)) {
      throw new Error(
        `sc-09: the record's format_multiplier stop ${index} is not a whole number of launches ` +
        `at ${perLaunch} durable uplift each. The control's labels would be wrong.`
      );
    }
    return { index, launches, label: WORDS[launches] || `${launches} launches` };
  });
}

/**
 * A SETTING THIS SCENARIO'S OWN RECORD MUST DECLARE, not inherit.
 *
 * ======================================================================
 * `panels.settingsProvenance` explains the hazard and sc-07 is the scenario it
 * exists for. A setting that arrives by inheritance is present, well-formed and
 * the wrong length of nothing — `mintCast` guards the LENGTH of `true_ctrs` and
 * an inherited array is full length. What is missing is the array's provenance,
 * so provenance is what this asks for.
 * ======================================================================
 */
function ownSetting(ctx, key, why) {
  const from = (ctx.panel && ctx.panel.settingsFrom) || {};
  if (from[key] !== ctx.panel.id) {
    throw new Error(
      `scenario "${ctx.panel.id}" reads ${key} and its own frozen record does not declare it` +
      `${from[key] ? `; it is inherited from "${from[key]}"` : ''}. ${why}\n` +
      `  FIX: declare ${key} in this scenario's own settings in simulator-params.json, even if ` +
      'the value is the same as the parent\'s — an inherited value is a different claim from a ' +
      'stated one'
    );
  }
  return req(ctx.settings[key], key, `scenario "${ctx.panel.id}"`);
}

/** A slot row the centre zone can draw, with nothing on it that is not drawn. */
function slotRows(result) {
  return result.rows.map((r) => ({
    slot: r.slot,
    name: r.name,
    bid: r.bid,
    quality: r.quality,
    score: r.score,
    price: r.price,
    clicks: r.clicks,
    revenue: r.revenue,
    setBy: r.priceSetBy,
    basis: r.priceBasis,
    discount: r.discountOffBid,
    maySwap: r.maySwap,
  }));
}

function queueRows(result) {
  return [
    ...result.rows.map((r) => ({ name: r.name, score: r.score, placed: true, slot: r.slot })),
    ...result.unplaced.map((r) => ({ name: r.name, score: r.score, placed: false, slot: null })),
  ];
}

/**
 * The three money figures that sit in the readout on every `slots` panel.
 *
 * Each one names its stored step or its written derivation. The MONEY zone is
 * the largest type on the panel and it used to be the one thing the arithmetic
 * gate could not see.
 */
function moneyReadout(result, { mode, modeNote, unit = 'per 1,000 impressions', revenue, clicks, price }) {
  return [
    mintReading({
      usd: result.revenue, role: 'money', mode, modeNote,
      label: 'revenue', unit, ...prov(revenue),
    }),
    mintReading({
      usd: result.clicks, role: 'count', label: 'clicks delivered', unit: 'clicks',
      ...prov(clicks),
    }),
    mintReading({
      usd: result.avgPricePerClick, role: 'money', mode, modeNote,
      label: 'average price per click', ...prov(price),
    }),
  ];
}

/** The band the fixed-bid scenarios cannot locate, in the record's own terms. */
const BIDS_HELD_FIXED = unlocatedBand(
  'The record holds this cast\'s bids fixed and never says what the bidders were worth. ' +
  'Without values there is no equilibrium to compute, so the band has no floor and no ceiling. ' +
  'The bidders still chose these bids.'
);

/* ------------------------------------------------------------------ *
 * THE EX-2 / EX-3 CAST, WHICH FOUR SCENARIOS SHARE
 * ------------------------------------------------------------------ */

/**
 * The truthfulness cast, built so the SAME engine runs it.
 *
 * `slot_clicks` are absolute click volumes, so the cast runs at one impression
 * with the slot clicks as position multipliers and a click rate of 1. No
 * special case, no second pricing path — the arithmetic the reader checks in
 * sc-01 is the arithmetic running here.
 */
function valuesCast(names, values, bids) {
  return mintCast({
    names,
    bids,
    values,
    predictedCtrs: values.map(() => 1),
    trueCtrs: values.map(() => 1),
  });
}

function bidsForMode(values, slotClicks, mode, shadedBid) {
  const sorted = [...values].sort((a, b) => b - a);
  if (mode === 'naive_truthful') return sorted.slice();
  if (mode === 'one_shader') return [shadedBid, ...sorted.slice(1)];
  if (mode === 'lowest_envy_free') {
    const eq = lowestEnvyFree(sorted, slotClicks);
    /* Under GSP the price in slot j is the bid one place below it, so the
     * equilibrium bid profile is the equilibrium price profile shifted down a
     * place. The top bid only has to sit above the second; its own value is the
     * legible choice and it changes no price. */
    return [sorted[0], ...eq.prices];
  }
  return sorted.slice();
}

function runValuesAuction(cast, { slotClicks, increment = 0, reserve = 0 }) {
  return runAuction(cast, {
    impressions: 1,
    slots: slotClicks.length,
    positionMultipliers: slotClicks,
    rankingRule: 'quality_weighted',
    pricingRule: 'second_price',
    increment,
    reserve,
  });
}

/* ------------------------------------------------------------------ *
 * THE TEN
 * ------------------------------------------------------------------ */

export const SCENARIOS = [

  /* ---------------------------------------------------------------- 01 */
  {
    id: 'sc-01-pure-bid-misorders',
    n: 1,
    short: 'Ranking by bid alone',
    centre: 'slots',
    teaches:
      'Rank the ads by bid alone and the ad that earns less sits on top. It happens whenever the ' +
      'click gap beats the bid gap.',
    controls: () => [{
      id: 'rankingRule', kind: 'rocker', label: 'Ranking rule',
      value: 'pure_bid',
      options: [
        { value: 'pure_bid', label: 'By bid alone' },
        { value: 'quality_weighted', label: 'By bid times click rate' },
      ],
      note: 'The pricing rule does not move. Ranking is the only change between this and sc-02.',
    }],
    build(state, ctx) {
      const { settings, mechanism } = ctx;
      const names = castNames(mechanism, 'ex-1-quality-vs-pure-bid');
      const cast = mintCast({
        names,
        bids: settings.bids,
        predictedCtrs: settings.predicted_ctrs,
        trueCtrs: settings.true_ctrs,
      });
      const rule = state.rankingRule || 'pure_bid';
      const result = runAuction(cast, {
        impressions: settings.impressions,
        slots: settings.slots,
        positionMultipliers: settings.position_multipliers,
        rankingRule: rule,
        pricingRule: settings.pricing_rule,
        increment: settings.bid_increment,
        reserve: settings.reserve,
      });
      const atRecord = rule === 'pure_bid';
      const revenuePerImpression = cast.map((row) => row.bid * row.predictedCtr);

      /* BOTH POSITIONS OF THE ROCKER ARE IN THE RECORD. This list used to be
       * empty whenever the reader flipped to bid-times-click-rate, and an empty
       * list satisfied `rows.every(...)` — three money figures on screen and a
       * green gate behind them. The flipped position is ex-1's own GSP half; it
       * has stored steps and it names them. */
      const steps = atRecord ? {
        price1: '2.00+0.01', price2: '1.00+0.01',
        clicks1: '1000*1.0*0.01', clicks2: '1000*0.4*0.02',
        revenue1: '10*2.01', revenue2: '8*1.01',
        revenue: '10*2.01+8*1.01', clicks: '10+8',
        price: '(10*2.01+8*1.01)/(10+8)',
      } : {
        price1: '0.04/0.05+0.01', price2: '0.03/0.02+0.01',
        clicks1: '1000*1.0*0.05', clicks2: '1000*0.4*0.02',
        revenue1: '50*0.81', revenue2: '8*1.51',
        revenue: '50*0.81+8*1.51', clicks: '50+8',
        price: '(50*0.81+8*1.51)/(50+8)',
      };
      const figures = [
        { label: 'Aster expected revenue per impression', value: revenuePerImpression[0], step: '3.00*0.01' },
        { label: 'Brindle expected revenue per impression', value: revenuePerImpression[1], step: '2.00*0.02' },
        { label: 'Cedar expected revenue per impression', value: revenuePerImpression[2], step: '1.00*0.05' },
        { label: 'slot 1 price', value: result.rows[0].price, step: steps.price1 },
        { label: 'slot 2 price', value: result.rows[1].price, step: steps.price2 },
        { label: 'slot 1 clicks', value: result.rows[0].clicks, step: steps.clicks1 },
        { label: 'slot 2 clicks', value: result.rows[1].clicks, step: steps.clicks2 },
        { label: 'slot 1 revenue', value: result.rows[0].revenue, step: steps.revenue1 },
        { label: 'slot 2 revenue', value: result.rows[1].revenue, step: steps.revenue2 },
        { label: 'revenue per 1,000 impressions', value: result.revenue, step: steps.revenue },
        { label: 'clicks delivered', value: result.clicks, step: steps.clicks },
        { label: 'average price per click', value: result.avgPricePerClick, step: steps.price },
        { label: 'bid ratio, top to bottom', value: cast[0].bid / cast[2].bid, step: '3.00/1.00' },
        { label: 'click-rate ratio, bottom to top', value: cast[2].predictedCtr / cast[0].predictedCtr, step: '0.05/0.01' },
      ];

      return {
        inputs: {
          rows: cast.map((row, i) => ({
            name: row.name, bid: row.bid, quality: row.predictedCtr,
            earns: revenuePerImpression[i],
          })),
          knobs: [{ label: 'Ranking rule', value: rule === 'pure_bid' ? 'by bid alone' : 'by bid times click rate' }],
        },
        centre: { kind: 'slots', slots: slotRows(result), queue: queueRows(result) },
        readout: moneyReadout(result, {
          mode: 'custom', modeNote: 'bids held fixed at the record\'s own numbers',
          revenue: steps.revenue, clicks: steps.clicks, price: steps.price,
        }),
        band: BIDS_HELD_FIXED,
        note: rule === 'pure_bid'
          ? 'The bid order is the exact reverse of the earnings order. The bid gap is 3 to 1 and ' +
            'the click gap is 5 to 1, so the bigger bid buys the smaller pile of money.'
          : 'Weight the bid by the click rate and the order turns over. Nothing else moved.',
        figures,
        derived: [],
      };
    },
  },

  /* ---------------------------------------------------------------- 02 */
  {
    id: 'sc-02-quality-weighting-both-metrics',
    n: 2,
    short: 'Quality weighting',
    centre: 'slots',
    teaches:
      'Weighting the bid by the click rate raises total revenue 87% and the price per click falls ' +
      '42%. The gain is volume, not price.',
    controls: () => [{
      id: 'compare', kind: 'rocker', label: 'Compare against',
      value: 'pure_bid',
      options: [
        { value: 'pure_bid', label: 'Ranking by bid alone' },
        { value: 'none', label: 'Nothing' },
      ],
      note: 'The same bids, the same query, the same three ads. Only the ranking rule differs.',
    }],
    build(state, ctx) {
      const { settings, mechanism, params } = ctx;
      const names = castNames(mechanism, 'ex-1-quality-vs-pure-bid');
      const cast = mintCast({
        names, bids: settings.bids,
        predictedCtrs: settings.predicted_ctrs, trueCtrs: settings.true_ctrs,
      });
      const common = {
        impressions: settings.impressions, slots: settings.slots,
        positionMultipliers: settings.position_multipliers,
        pricingRule: settings.pricing_rule,
        increment: settings.bid_increment, reserve: settings.reserve,
      };
      const gsp = runAuction(cast, { ...common, rankingRule: 'quality_weighted' });
      const pure = runAuction(cast, { ...common, rankingRule: 'pure_bid' });

      const figures = [
        { label: 'slot 1 price', value: gsp.rows[0].price, step: '0.04/0.05+0.01' },
        { label: 'slot 2 price', value: gsp.rows[1].price, step: '0.03/0.02+0.01' },
        { label: 'slot 1 clicks', value: gsp.rows[0].clicks, step: '1000*1.0*0.05' },
        { label: 'slot 2 clicks', value: gsp.rows[1].clicks, step: '1000*0.4*0.02' },
        { label: 'slot 1 revenue', value: gsp.rows[0].revenue, step: '50*0.81' },
        { label: 'slot 2 revenue', value: gsp.rows[1].revenue, step: '8*1.51' },
        { label: 'revenue per 1,000 impressions', value: gsp.revenue, step: '50*0.81+8*1.51' },
        { label: 'clicks delivered', value: gsp.clicks, step: '50+8' },
        { label: 'average price per click', value: gsp.avgPricePerClick, step: '(50*0.81+8*1.51)/(50+8)' },
      ];
      if (state.compare === 'pure_bid') {
        figures.push(
          { label: 'revenue against ranking by bid alone', value: gsp.revenue / pure.revenue, step: '(50*0.81+8*1.51)/(10*2.01+8*1.01)' },
          { label: 'clicks against ranking by bid alone', value: gsp.clicks / pure.clicks, step: '(50+8)/(10+8)' },
          { label: 'price per click against ranking by bid alone', value: gsp.avgPricePerClick / pure.avgPricePerClick, step: '((50*0.81+8*1.51)/(50+8))/((10*2.01+8*1.01)/(10+8))' },
        );
      }

      return {
        inputs: {
          rows: cast.map((row) => ({
            name: row.name, bid: row.bid, quality: row.predictedCtr,
            earns: row.bid * row.predictedCtr,
          })),
          knobs: [{ label: 'Ranking rule', value: 'by bid times click rate' }],
        },
        centre: { kind: 'slots', slots: slotRows(gsp), queue: queueRows(gsp) },
        readout: moneyReadout(gsp, {
          mode: 'custom', modeNote: 'bids held fixed at the record\'s own numbers',
          revenue: '50*0.81+8*1.51', clicks: '50+8', price: '(50*0.81+8*1.51)/(50+8)',
        }),
        band: BIDS_HELD_FIXED,
        worked: [
          'Brindle bids $2.00 and is clicked 2% of the time, so its score is 0.040.',
          'Cedar is clicked 5% of the time.',
          '0.040 divided by 0.05 is $0.80, the bid that would just have matched Brindle.',
          'Cedar pays $0.81, one cent more.',
        ],
        note: state.compare === 'pure_bid'
          ? 'Revenue rises 87% and clicks rise 222%. The price per click falls 42%. Every ' +
            'retelling that says Google charged more per click has the sign backwards.'
          : 'Each winner pays less than it bid, and the seller still collects more.',
        figures,
        derived: [],
        against: state.compare === 'pure_bid' ? {
          label: 'ranking by bid alone',
          revenue: pure.revenue, clicks: pure.clicks, price: pure.avgPricePerClick,
        } : null,
      };
    },
  },

  /* ---------------------------------------------------------------- 03 */
  {
    id: 'sc-03-winners-pay-less-than-bid',
    n: 3,
    short: 'Every winner discounted',
    centre: 'slots',
    teaches:
      'Every winner pays below its own bid, and the seller still collects 87% more than ranking ' +
      'by bid alone paid it.',
    controls: () => [{
      id: 'showCounterfactual', kind: 'rocker', label: 'Pay-your-bid row',
      value: 'on',
      options: [{ value: 'on', label: 'Show' }, { value: 'off', label: 'Hide' }],
      note: 'The pay-your-bid row freezes the bids. Nobody would leave them there.',
    }],
    build(state, ctx) {
      const { settings, mechanism } = ctx;
      const names = castNames(mechanism, 'ex-1-quality-vs-pure-bid');
      const cast = mintCast({
        names, bids: settings.bids,
        predictedCtrs: settings.predicted_ctrs, trueCtrs: settings.true_ctrs,
      });
      const common = {
        impressions: settings.impressions, slots: settings.slots,
        positionMultipliers: settings.position_multipliers,
        pricingRule: settings.pricing_rule,
        increment: settings.bid_increment, reserve: settings.reserve,
      };
      const gsp = runAuction(cast, { ...common, rankingRule: 'quality_weighted' });
      const pure = runAuction(cast, { ...common, rankingRule: 'pure_bid' });
      const frozen = payYourBidAtFrozenBids(gsp);

      const readout = moneyReadout(gsp, {
        mode: 'custom', modeNote: 'bids held fixed at the record\'s own numbers',
        revenue: '50*0.81+8*1.51', clicks: '50+8', price: '(50*0.81+8*1.51)/(50+8)',
      });
      if (state.showCounterfactual !== 'off') {
        readout.push(mintReading({
          usd: frozen.usd, role: 'money', mode: 'custom',
          modeNote: 'bids held fixed at the record\'s own numbers',
          label: 'if each winner paid its own bid', unit: 'per 1,000 impressions',
          counterfactual: true, why: frozen.why,
          stepRef: '50*1.00+8*2.00',
        }));
      }

      const figures = [
        { label: 'Cedar discount off its bid', value: gsp.rows[0].discountOffBid, step: '1.00-0.81' },
        { label: 'Brindle discount off its bid', value: gsp.rows[1].discountOffBid, step: '2.00-1.51' },
        { label: 'revenue per 1,000 impressions', value: gsp.revenue, step: '50*0.81+8*1.51' },
        { label: 'revenue against ranking by bid alone', value: gsp.revenue / pure.revenue, step: '(50*0.81+8*1.51)/(10*2.01+8*1.01)' },
      ];
      if (state.showCounterfactual !== 'off') {
        figures.push(
          { label: 'if each winner paid its own bid', value: frozen.usd, step: '50*1.00+8*2.00' },
          { label: 'share of the pay-your-bid take', value: gsp.revenue / frozen.usd, step: '(50*0.81+8*1.51)/(50*1.00+8*2.00)' },
        );
      }

      return {
        inputs: {
          rows: cast.map((row) => ({
            name: row.name, bid: row.bid, quality: row.predictedCtr,
            earns: row.bid * row.predictedCtr,
          })),
          knobs: [{ label: 'Pricing rule', value: 'pay the price that holds the slot' }],
        },
        centre: { kind: 'slots', slots: slotRows(gsp), queue: queueRows(gsp), showDiscount: true },
        readout,
        band: BIDS_HELD_FIXED,
        note:
          'Cedar keeps 19 cents a click and Brindle keeps 49. The seller collects 79.7% of what ' +
          'pay-your-bid would have taken at these bids, and 87% more than ranking by bid alone.',
        figures,
        derived: [],
      };
    },
  },

  /* ---------------------------------------------------------------- 04 */
  {
    id: 'sc-04-gsp-not-truthful',
    n: 4,
    short: 'Bidding low pays',
    centre: 'slots',
    teaches:
      'Vale is worth $10 a click. Bidding $10 earns it $400. Bidding $5 earns it $640. The ' +
      'auction rewards the lie.',
    controls: (ctx) => [{
      id: 'vaneBid', kind: 'range', label: 'What Vale bids',
      value: ctx.settings.values[0],
      min: 2.01, max: ctx.settings.values[0], step: 0.01, unit: '$',
      stops: [5, ctx.settings.values[0]],
      note: 'Below Yarrow\'s $2 value Vale leaves the board, which is a different question. ' +
            'The slider stops above it.',
    }, {
      id: 'increment', kind: 'rocker', label: 'Bid increment',
      value: '0',
      options: [{ value: '0', label: 'None' }, { value: '0.01', label: 'One cent' }],
      note: 'Google\'s discounter adds a cent. It changes the size of the gain and not its sign.',
    }],
    build(state, ctx) {
      const { settings, mechanism } = ctx;
      const names = castNames(mechanism, 'ex-2-gsp-not-truthful');
      const values = settings.values;
      const slotClicks = settings.slot_clicks;
      const increment = Number(state.increment || 0);
      const vale = state.vaneBid == null ? values[0] : Number(state.vaneBid);

      const truthful = runValuesAuction(valuesCast(names, values, values), { slotClicks, increment });
      const shaded = runValuesAuction(
        valuesCast(names, values, [vale, ...values.slice(1)]), { slotClicks, increment }
      );
      const payoffOf = (result, name) => {
        const row = result.rows.find((r) => r.name === name);
        if (!row) return 0;
        const value = values[names.indexOf(name)];
        return row.clicks * (value - row.price);
      };
      const truthfulPayoff = payoffOf(truthful, names[0]);
      const shadedPayoff = payoffOf(shaded, names[0]);
      const vcgOut = vcg(values, slotClicks);
      const vcgPayoff = slotClicks[0] * values[0] - vcgOut.payments[0];
      const floorRevenue = lowestEnvyFree(values, slotClicks).revenue;
      const ceilingRevenue = naiveTruthful(values, slotClicks).revenue;
      const belowBand = shaded.revenue < floorRevenue - 1e-9;
      const aboveBand = shaded.revenue > ceilingRevenue + 1e-9;
      /* BOTH ENDS OF THIS BAND CAN BE LEFT, and the second one was found by
       * deleting the clamp. The band's ends are computed with no increment,
       * because the record computes them with no increment. Switch Google's
       * one-cent discounter on and every price rises a cent, so truthful play
       * pays $761.80 against a $760 ceiling. */
      const excursionReason = belowBand
        ? 'Vale is bidding under the lowest equilibrium bid, so the seller falls under the band. ' +
          'Nobody wants to move, so the bids still hold. They are not envy free: Vale would ' +
          'rather hold slot 1 at slot 1 price. The floor here is the lowest envy-free ' +
          'equilibrium, not the lowest of all.'
        : (aboveBand
          ? 'The one-cent increment lifts the seller over the top of the band. The record works ' +
            'both ends of this band out with no increment. Add a cent to each price and the ' +
            'seller clears the top by a little over a dollar.'
          : null);

      const atFive = near(vale, 5);
      const atValue = near(vale, values[0]);
      const noIncrement = near(increment, 0);

      /* WHERE EVERY FIGURE ON THIS PANEL COMES FROM, chosen by the CONTROL
       * POSITION and never by the value. Picking a step because the number
       * happens to match it would make the gate check itself. */
      const valeStep = noIncrement
        ? (atFive ? '80*(10-2)' : (atValue ? '100*(10-6)' : null))
        : (atFive ? '80*(10-2.01)' : (atValue ? '100*(10-6.01)' : null));
      const truthfulStep = noIncrement ? '100*(10-6)' : '100*(10-6.01)';
      const sellerStep = noIncrement
        ? (atValue ? '100*6+80*2' : (atFive ? '100*5+80*2' : null))
        : null;
      const sellerWorked = worked(
        `100 clicks at the slot 1 price plus 80 at the slot 2 price, with Vale bidding ` +
        `$${vale.toFixed(2)}`
      );
      const sellerFrom = sellerStep || sellerWorked;

      const figures = [];
      if (noIncrement) {
        figures.push(
          { label: 'Vale\'s payoff when it bids its value', value: truthfulPayoff, step: '100*(10-6)' },
          { label: 'seller revenue when everybody bids their value', value: truthful.revenue, step: '100*6+80*2' },
          { label: 'what VCG would pay Vale', value: vcgPayoff, step: '100*10-((100-80)*6+80*2)' },
          { label: 'what VCG would collect', value: vcgOut.revenue, step: '(100-80)*6+80*2+80*2' },
          { label: 'what Vale would owe under VCG', value: vcgOut.payments[0], step: '(100-80)*6+80*2' },
          { label: 'Vale\'s VCG price per click', value: vcgOut.pricesPerClick[0], step: '((100-80)*6+80*2)/100' },
          { label: 'what Wren would owe under VCG', value: vcgOut.payments[1], step: '80*2' },
        );
        if (atFive) {
          figures.push(
            { label: 'Vale\'s payoff when it bids $5', value: shadedPayoff, step: '80*(10-2)' },
            { label: 'what the shading is worth to Vale', value: shadedPayoff - truthfulPayoff, step: '80*(10-2)-100*(10-6)' },
            { label: 'seller revenue after the shading', value: shaded.revenue, step: '100*5+80*2' },
            { label: 'what the seller loses', value: truthful.revenue - shaded.revenue, step: '(100*6+80*2)-(100*5+80*2)' },
            { label: 'share of revenue the seller loses', value: (truthful.revenue - shaded.revenue) / truthful.revenue, step: '((100*6+80*2)-(100*5+80*2))/(100*6+80*2)' },
          );
        }
      } else {
        figures.push({ label: 'Vale\'s payoff when it bids its value', value: truthfulPayoff, step: '100*(10-6.01)' });
        if (atFive) figures.push({ label: 'Vale\'s payoff when it bids $5', value: shadedPayoff, step: '80*(10-2.01)' });
      }

      return {
        inputs: {
          rows: names.map((name, i) => ({
            name,
            bid: i === 0 ? vale : values[i],
            value: values[i],
            quality: 1,
          })),
          knobs: [
            { label: 'What Vale bids', value: `$${vale.toFixed(2)} against a $${values[0].toFixed(2)} value` },
            { label: 'Bid increment', value: noIncrement ? 'none' : 'one cent' },
          ],
        },
        centre: { kind: 'slots', slots: slotRows(shaded), queue: queueRows(shaded), unit: 'clicks' },
        readout: [
          mintReading({
            usd: shadedPayoff, role: 'money', mode: 'one_shader',
            modeNote: `Vale bids $${vale.toFixed(2)}`,
            label: 'what Vale keeps',
            ...prov(valeStep || worked(
              `the clicks Vale wins, times its $${values[0].toFixed(2)} value less the price it pays`
            )),
          }),
          mintReading({
            usd: truthfulPayoff, role: 'money', mode: 'naive_truthful',
            modeNote: 'Vale bids its own value',
            label: 'what Vale would keep bidding its value',
            stepRef: truthfulStep,
          }),
          mintReading({
            usd: shaded.revenue, role: 'money', mode: 'one_shader',
            modeNote: `Vale bids $${vale.toFixed(2)}`,
            label: 'what the seller collects',
            ...prov(sellerFrom),
          }),
        ],
        /* NO CLAMP. The marker is the revenue the mechanism produced, drawn
         * where it really is. Below a $2.80 bid that is under the band, and the
         * excursion sentence is the finding rather than a rounding of it. */
        band: mintBand({
          unit: 'over 180 clicks',
          floor: mintReading({
            usd: floorRevenue, role: 'money',
            mode: 'lowest_envy_free', label: 'the lowest equilibrium',
            stepRef: '100*2.8+80*2.0',
          }),
          ceiling: mintReading({
            usd: ceilingRevenue, role: 'money',
            mode: 'naive_truthful', label: 'everybody bids their value',
            stepRef: '100*6+80*2',
          }),
          marker: mintReading({
            usd: shaded.revenue,
            role: 'money', mode: 'one_shader',
            modeNote: `Vale bids $${vale.toFixed(2)}`,
            label: 'where this bid puts the seller',
            ...prov(sellerFrom),
          }),
          excursion: excursionReason,
          note: 'One bidder playing correctly walks the seller down the band.',
        }),
        note: belowBand
          ? 'Vale has bid so low that the seller drops under the band. The band runs from the ' +
            'lowest envy-free equilibrium up. This bid is under that, and it still holds: no ' +
            'bidder can do better by moving. So the $440 floor is a floor on the equilibria the ' +
            'record computes, and not a floor on what the seller can be paid.'
          : (aboveBand
            ? 'Every bidder is bidding its value and the cent on each price puts the seller just ' +
              'over the top of the band. The band ends are worked out with no increment. The cent ' +
              'is worth $1.80 here on a $760 take.'
            : atFive
              ? 'Truthful bidding earns Vale $400. Bidding $5 earns it $640. One advertiser ' +
                'playing correctly costs the seller 13.2% of its take.'
              : 'Drag the bid and watch Vale\'s own money, not the seller\'s. The auction pays ' +
                'Vale to bid under what the click is worth to it.'),
        figures,
        derived: valeStep ? [] : [{
          label: 'what Vale keeps at this bid',
          value: shadedPayoff,
          formula: `clicks won times (value ${values[0]} minus the price paid)`,
        }],
      };
    },
  },

  /* ---------------------------------------------------------------- 05 */
  {
    id: 'sc-05-equilibrium-band',
    n: 5,
    short: 'THE BAND',
    centre: 'slots',
    teaches:
      'Same rule, same three bidders, and the seller collects anything from $440 to $760. The ' +
      'mechanism does not move across that. The bidders do.',
    controls: () => [{
      id: 'bidderMode', kind: 'rocker', label: 'How the bidders play',
      value: 'naive_truthful',
      options: [
        { value: 'naive_truthful', label: 'Everyone bids their value' },
        { value: 'one_shader', label: 'One bidder shades' },
        { value: 'lowest_envy_free', label: 'The lowest equilibrium' },
      ],
      note: 'Three positions, not a slider. Each one is a way of playing that the literature names.',
    }],
    build(state, ctx) {
      const { settings, mechanism } = ctx;
      const names = castNames(mechanism, 'ex-2-gsp-not-truthful');
      const values = settings.values;
      const slotClicks = settings.slot_clicks;
      const mode = state.bidderMode || 'naive_truthful';
      const shadedBid = 5;

      const top = naiveTruthful(values, slotClicks);
      const floor = lowestEnvyFree(values, slotClicks);
      const shader = oneShader(values, slotClicks, shadedBid);
      const chosen = mode === 'naive_truthful' ? top : (mode === 'one_shader' ? shader : floor);
      const vcgOut = vcg(values, slotClicks);
      const envy = envyCheck(values, slotClicks, floor.prices);

      const bids = bidsForMode(values, slotClicks, mode, shadedBid);
      const result = runValuesAuction(valuesCast(names, values, bids), { slotClicks, increment: 0 });

      const MODE_STEP = {
        naive_truthful: '100*6+80*2',
        one_shader: '100*5+80*2',
        lowest_envy_free: '100*2.8+80*2.0',
      };
      const band = mintBand({
        unit: 'over 180 clicks',
        floor: mintReading({
          usd: floor.revenue, role: 'money', mode: 'lowest_envy_free',
          label: 'the lowest equilibrium', stepRef: MODE_STEP.lowest_envy_free,
        }),
        ceiling: mintReading({
          usd: top.revenue, role: 'money', mode: 'naive_truthful',
          label: 'everybody bids their value', stepRef: MODE_STEP.naive_truthful,
        }),
        marker: mintReading({
          usd: chosen.revenue, role: 'money', mode,
          label: 'where the market sits', stepRef: MODE_STEP[mode],
        }),
        stops: [mintReading({
          usd: shader.revenue, role: 'money', mode: 'one_shader',
          label: 'one bidder shades', stepRef: MODE_STEP.one_shader,
        })],
        note: 'The rule never changes across this track.',
      });

      return {
        inputs: {
          rows: names.map((name, i) => ({
            name, value: values[i], bid: bids[i], quality: 1,
          })),
          knobs: [{ label: 'How the bidders play', value: {
            naive_truthful: 'everybody bids their value',
            one_shader: 'one bidder shades to $5',
            lowest_envy_free: 'the lowest equilibrium',
          }[mode] }],
        },
        centre: { kind: 'slots', slots: slotRows(result), queue: queueRows(result), unit: 'clicks' },
        readout: [
          mintReading({
            usd: chosen.revenue, role: 'money', mode, label: 'what the seller collects',
            stepRef: MODE_STEP[mode],
          }),
          mintReading({
            usd: band.ratio, role: 'ratio', label: 'the width of the band',
            stepRef: '(100*6+80*2)/(100*2.8+80*2.0)',
          }),
          mintReading({
            usd: vcgOut.revenue, role: 'money', mode: 'lowest_envy_free',
            modeNote: 'VCG, where bidding your value is the dominant move',
            label: 'what VCG would collect',
            stepRef: '(100-80)*6+80*2+80*2',
          }),
        ],
        band,
        envy: envy.map((row) => ({
          value: row.bidderValue, inSlot: row.inSlot,
          here: row.payoffHere, oneUp: row.payoffOneUp,
        })),
        note:
          'Move the toggle and the marker walks the track. No rule changed. The seller\'s take is ' +
          'a range that the bidders choose a point inside, which is why any comparison at fixed ' +
          'bids measures a point the bidders picked.',
        figures: [
          { label: 'slot 2 price at the lowest equilibrium', value: floor.prices[1], step: '(80*2)/80' },
          { label: 'slot 1 price at the lowest equilibrium', value: floor.prices[0], step: '(80*2.0+(100-80)*6)/100' },
          { label: 'revenue at the lowest equilibrium', value: floor.revenue, step: '100*2.8+80*2.0' },
          { label: 'what VCG would collect', value: vcgOut.revenue, step: '(100-80)*6+80*2+80*2' },
          { label: 'revenue when everybody bids their value', value: top.revenue, step: '100*6+80*2' },
          { label: 'revenue when one bidder shades', value: shader.revenue, step: '100*5+80*2' },
          { label: 'the width of the band', value: band.ratio, step: '(100*6+80*2)/(100*2.8+80*2.0)' },
          { label: 'Wren\'s payoff in slot 2', value: envy[0].payoffHere, step: '80*(6-2.0)' },
          { label: 'Wren\'s payoff if it took slot 1', value: envy[0].payoffOneUp, step: '100*(6-2.8)' },
          { label: 'Vale\'s payoff in slot 1', value: slotClicks[0] * (values[0] - floor.prices[0]), step: '100*(10-2.8)' },
          { label: 'Vale\'s payoff if it dropped to slot 2', value: slotClicks[1] * (values[0] - floor.prices[1]), step: '80*(10-2.0)' },
          { label: 'the seller\'s take at this setting', value: chosen.revenue, step: {
            naive_truthful: '100*6+80*2',
            one_shader: '100*5+80*2',
            lowest_envy_free: '100*2.8+80*2.0',
          }[mode] },
        ],
        derived: [],
      };
    },
  },

  /* ---------------------------------------------------------------- 06 */
  /* WHICH BIDDER COUNT THE PANEL OPENS ON IS A DESIGN CHOICE, NOT A RECORD
   * VALUE, and it is written here rather than inlined four times. The record's
   * `n_bidders` is a list and names no default. Three is chosen because the
   * record's shading sensitivity table — and therefore this panel's band — is
   * stored at three bidders only; opening anywhere else opens on an unlocated
   * band. `build` refuses any count the record's own list does not carry. */
  {
    id: 'sc-06-first-price-bid-shading-panel',
    n: 6,
    short: 'First price pays the same',
    centre: 'bars',
    teaches:
      'Pay-your-bid and pay-the-runner-up hand the seller the same money once the buyers shade. ' +
      'The rule change is not a yield mechanism.',
    controls: (ctx, state) => [{
      id: 'n', kind: 'rocker', label: 'Bidders',
      value: String(SC06_OPENING_BIDDERS),
      options: req(ctx.settings.n_bidders, 'n_bidders', 'sc-06', isNumberList)
        .map((n) => ({ value: String(n), label: String(n) })),
      /* The equilibrium shading is (n-1)/n, so it moves with the bidder count.
       * Changing n puts the slider back on the equilibrium, which is where the
       * record says the panel starts: "the shading slider starts AT the
       * equilibrium value so the reader first sees the bars level". */
      resets: ['shading'],
      note: 'Values drawn independently, evenly, between zero and the ceiling.',
    }, {
      id: 'shading', kind: 'range', label: 'How hard buyers shade',
      /* `null` is the equilibrium, and the equilibrium moves with the bidder
       * count. The slider shows (n-1)/n for whichever count is selected, which
       * is where the record says the panel opens. */
      value: null,
      atNull: (() => {
        const n = Number((state && state.n) || SC06_OPENING_BIDDERS);
        return (n - 1) / n;
      })(),
      min: 0.3, max: 1.0, step: 0.0001,
      stops: [0.55, 0.6, 0.6666666666666666, 0.7333333333333333, 0.8],
      note: 'It starts at the equilibrium, where the two bars are level. Move it and one bar moves.',
    }],
    build(state, ctx) {
      const { settings } = ctx;
      const counts = req(settings.n_bidders, 'n_bidders', 'sc-06', isNumberList);
      const n = Number(state.n == null ? SC06_OPENING_BIDDERS : state.n);
      if (!counts.some((c) => Number(c) === n)) {
        throw new Error(
          `sc-06 was asked for ${n} bidders and the record's n_bidders are ${counts.join(', ')}.`
        );
      }
      const ceiling = req(settings.value_ceiling, 'value_ceiling', 'sc-06', Number.isFinite);
      const equilibrium = (n - 1) / n;
      const shading = state.shading == null ? equilibrium : Number(state.shading);
      const panel = sealedBidPanel({ n, ceiling, shading });
      const atEquilibrium = near(shading, equilibrium);

      const secondPriceStep = `${ceiling.toFixed(0)}*(${n}-1)/(${n}+1)`;
      const firstPriceStep = `(${ceiling.toFixed(0)}*${n}/(${n}+1))*((${n}-1)/${n})`;

      const figures = [
        { label: 'what pay-the-runner-up collects', value: panel.secondPrice, step: secondPriceStep },
      ];
      /* The record stores the shading sensitivity at three bidders, at five
       * named stops. Each stop is a stored step; anywhere between them the
       * figure moves to `derived` with its formula written out. */
      const SHADE_STOPS = {
        0.55: { first: null, ratio: '(7.5*0.55)/5.0' },
        0.6: { first: '7.5*0.60', ratio: '(7.5*0.60)/5.0' },
        0.6666666666666666: { first: null, ratio: '(7.5*0.6666666666666666)/5.0' },
        0.7333333333333333: { first: '7.5*0.7333333333333333', ratio: '(7.5*0.7333333333333333)/5.0' },
        0.8: { first: null, ratio: '(7.5*0.80)/5.0' },
      };
      const stop = n === 3
        ? Object.entries(SHADE_STOPS).find(([k]) => near(Number(k), shading))
        : null;
      if (atEquilibrium) {
        figures.push({ label: 'what pay-your-bid collects', value: panel.firstPrice, step: firstPriceStep });
        if (n === 3) figures.push({ label: 'the gap between them', value: panel.difference, step: '(10*3/(3+1))*((3-1)/3)-10*(3-1)/(3+1)' });
      }
      if (stop) {
        const [, steps] = stop;
        if (steps.first) figures.push({ label: 'what pay-your-bid collects', value: panel.firstPrice, step: steps.first });
        figures.push({ label: 'against pay-the-runner-up', value: panel.ratio, step: steps.ratio });
      }

      const trap = ctx.record.expected_output.frozen_bid_trap;
      const shadedBack = sealedBidPanel({ n: 3, ceiling, shading: 0.55 });
      const wide = sealedBidPanel({ n: 3, ceiling, shading: 0.8 });
      figures.push(
        { label: 'the 10-K example, under the discounter', value: 0.61 + 0.51 + 0.01, step: '0.61+0.51+0.01' },
        { label: 'the same bids, if nobody re-bid', value: 1.00 + 0.60 + 0.50, step: '1.00+0.60+0.50' },
        { label: 'the apparent windfall', value: trap.apparent_windfall, step: '(1.00+0.60+0.50)/(0.61+0.51+0.01)' },
        { label: 'what the seller keeps once each bidder shades back', value: trap.tenk_second_price_usd / trap.tenk_pay_your_bid_usd, step: '(0.61+0.51+0.01)/(1.00+0.60+0.50)' },
        { label: 'a market shading hard, against pay-the-runner-up', value: shadedBack.ratio, step: '(7.5*0.55)/5.0' },
        { label: 'a market shading lightly, against pay-the-runner-up', value: wide.ratio, step: '(7.5*0.80)/5.0' },
        { label: 'the spread in that one number', value: (0.8 - 0.55) / (2 / 3), step: '(0.80-0.55)/0.6666666666666666' },
      );

      /* The band ends are the two shading levels the record's own sensitivity
       * table stores, and the slider runs wider than both. NO CLAMP: past 0.60
       * or 0.7333 the marker leaves the band, and it says so. */
      const BAND_FLOOR = 4.5;
      const BAND_CEILING = 5.5;
      const markerFrom = (n === 3 && near(shading, 0.6)) ? '7.5*0.60'
        : (n === 3 && near(shading, 0.7333333333333333)) ? '7.5*0.7333333333333333'
          : (atEquilibrium ? firstPriceStep
            : worked(`the expected top value ${panel.expectedMax.toFixed(4)} times a shading ` +
                     `factor of ${shading.toFixed(4)}`));
      const bandLocated = n === 3;
      const outsideBand = bandLocated
        && (panel.firstPrice < BAND_FLOOR - 1e-9 || panel.firstPrice > BAND_CEILING + 1e-9);
      const band = bandLocated
        ? mintBand({
          unit: 'per sale, three bidders',
          floor: mintReading({
            usd: BAND_FLOOR, role: 'money', mode: 'custom', modeNote: 'buyers shade to 0.60',
            label: 'the market shades hard', stepRef: '7.5*0.60',
          }),
          ceiling: mintReading({
            usd: BAND_CEILING, role: 'money', mode: 'custom', modeNote: 'buyers shade to 0.7333',
            label: 'the market shades lightly', stepRef: '7.5*0.7333333333333333',
          }),
          stops: [mintReading({
            usd: 5.0, role: 'money', mode: 'custom', modeNote: 'buyers shade to 0.6667, the equilibrium',
            label: 'the equilibrium', stepRef: '(10*3/(3+1))*((3-1)/3)',
          })],
          marker: mintReading({
            usd: panel.firstPrice, role: 'money', mode: 'custom',
            modeNote: `buyers shade to ${shading.toFixed(4)}`,
            label: 'where the market sits',
            ...prov(markerFrom),
          }),
          excursion: outsideBand
            ? 'The record measures this band at two shading levels, 0.60 and 0.7333. The slider ' +
              'runs wider than that. The marker is outside what the record measures, so it is a ' +
              'reading off this page and not a reading off the record.'
            : null,
          note: 'The seller\'s take is linear in one number the buyers choose and the seller does not.',
        })
        : unlocatedBand(
          'The record stores the shading sensitivity at three bidders only, so the band cannot ' +
          'be placed at this bidder count. Switch back to three to see it.'
        );

      return {
        inputs: {
          rows: [{ name: `${n} bidders`, value: ceiling, note: 'values even between $0 and the ceiling' }],
          knobs: [
            { label: 'Bidders', value: String(n) },
            { label: 'Shading', value: `${shading.toFixed(4)}${atEquilibrium ? ' — the equilibrium' : ''}` },
          ],
        },
        centre: {
          kind: 'bars',
          bars: [
            { label: 'Pay the runner-up', usd: panel.secondPrice, mode: 'naive_truthful' },
            { label: 'Pay your own bid', usd: panel.firstPrice, mode: 'custom' },
          ],
          equal: atEquilibrium,
        },
        readout: [
          mintReading({
            usd: panel.secondPrice, role: 'money', mode: 'naive_truthful',
            modeNote: 'bidding your value is the dominant move here',
            label: 'pay the runner-up',
            stepRef: secondPriceStep,
          }),
          mintReading({
            usd: panel.firstPrice, role: 'money', mode: 'custom',
            modeNote: `buyers shade to ${shading.toFixed(4)}`,
            label: 'pay your own bid',
            ...prov(markerFrom),
          }),
          mintReading({
            usd: trap.apparent_windfall, role: 'ratio',
            label: 'the windfall the 10-K bids appear to show',
            stepRef: '(1.00+0.60+0.50)/(0.61+0.51+0.01)',
          }),
        ],
        band,
        note: atEquilibrium
          ? 'The bars are level, and they stay level for every bidder count the record tests. ' +
            'Nothing in the pay-your-bid rule raises the seller\'s take.'
          : 'Move the shading off the equilibrium and one bar moves. The seller\'s exposure is ' +
            'linear in a number the buyers pick.',
        figures,
        derived: (atEquilibrium || stop)
          ? []
          : [{
            label: 'what pay-your-bid collects at this shading',
            value: panel.firstPrice,
            formula: `expected top value ${panel.expectedMax.toFixed(4)} times ${shading.toFixed(4)}`,
          }],
      };
    },
  },

  /* ---------------------------------------------------------------- 07 */
  {
    id: 'sc-07-ctr-misestimation',
    n: 7,
    short: 'The seller\'s own forecast',
    centre: 'slots',
    teaches:
      'The whole gain rests on a click-rate forecast the seller makes. Nobody outside could check ' +
      'it, and below a true 1.99% the better mechanism earns less than the crude one.',
    controls: (ctx) => [{
      id: 'trueCtr', kind: 'range', label: 'Cedar\'s true click rate',
      value: ownTrueCtrs(ctx)[2],
      min: 0.001, max: 0.05, step: 0.0005, unit: '',
      stops: [0.01, 0.05],
      note: 'The predicted rate stays pinned at 5%. Only the truth moves.',
    }],
    build(state, ctx) {
      const { settings, mechanism, params } = ctx;
      const names = castNames(mechanism, 'ex-1-quality-vs-pure-bid');
      /* THE TRUTH ON THIS PANEL HAS TO BE THIS PANEL'S OWN. See `ownSetting`:
       * inherit `true_ctrs` from sc-02 and the seller's forecast becomes what
       * happened, this panel renders $52.58 with a green gate, and the one
       * scenario about the gap between the two teaches that there is none. */
      const own = ownTrueCtrs(ctx);
      const trueCedar = state.trueCtr == null ? own[2] : Number(state.trueCtr);
      const trueCtrs = [own[0], own[1], trueCedar];
      const cast = mintCast({
        names, bids: settings.bids,
        predictedCtrs: settings.predicted_ctrs, trueCtrs,
      });
      const common = {
        impressions: settings.impressions, slots: settings.slots,
        positionMultipliers: settings.position_multipliers,
        pricingRule: settings.pricing_rule,
        increment: settings.bid_increment, reserve: settings.reserve,
      };
      const gsp = runAuction(cast, { ...common, rankingRule: 'quality_weighted' });
      const pureCast = mintCast({
        names, bids: settings.bids,
        predictedCtrs: settings.predicted_ctrs, trueCtrs: settings.predicted_ctrs,
      });
      const pure = runAuction(pureCast, { ...common, rankingRule: 'pure_bid' });

      /* The break-even true rate: the rate at which the quality-weighted total
       * exactly equals the pure-bid total, with slot 2 unchanged. */
      const slot2 = gsp.rows[1].revenue;
      const slot1Price = gsp.rows[0].price;
      const breakEven = (pure.revenue - slot2) / (settings.impressions * settings.position_multipliers[0] * slot1Price);
      const overstatement = settings.predicted_ctrs[2] / breakEven;

      const atRecord = near(trueCedar, 0.01);
      const figures = [
        { label: 'break-even true click rate', value: breakEven, step: '((10*2.01+8*1.01)-8*1.51)/(1000*1.0*0.81)' },
        { label: 'how far the forecast may overstate', value: overstatement, step: '0.05/0.019876543209876543' },
      ];
      if (atRecord) {
        figures.push(
          { label: 'Cedar\'s clicks at a true 1%', value: gsp.rows[0].clicks, step: '1000*1.0*0.01' },
          { label: 'Cedar\'s revenue at a true 1%', value: gsp.rows[0].revenue, step: '10*0.81' },
          { label: 'revenue per 1,000 impressions', value: gsp.revenue, step: '10*0.81+8*1.51' },
          { label: 'against ranking by bid alone', value: gsp.revenue / pure.revenue, step: '(10*0.81+8*1.51)/(10*2.01+8*1.01)' },
        );
      }

      return {
        inputs: {
          rows: cast.map((row) => ({
            name: row.name, bid: row.bid, quality: row.predictedCtr,
            trueCtr: row.trueCtr,
            mismatch: !near(row.predictedCtr, row.trueCtr),
          })),
          knobs: [
            { label: 'Cedar predicted', value: `${(settings.predicted_ctrs[2] * 100).toFixed(2)}% — the seller\'s figure` },
            { label: 'Cedar true', value: `${(trueCedar * 100).toFixed(2)}%` },
          ],
        },
        centre: { kind: 'slots', slots: slotRows(gsp), queue: queueRows(gsp), splitCtr: true },
        readout: moneyReadout(gsp, {
          mode: 'custom', modeNote: 'bids held fixed at the record\'s own numbers',
          revenue: atRecord ? '10*0.81+8*1.51' : worked(
            `1,000 impressions at ${(trueCedar * 100).toFixed(2)}% true, at the slot 1 price, ` +
            'plus slot 2 unchanged'
          ),
          clicks: atRecord ? '10+8' : worked(
            `1,000 impressions at a true ${(trueCedar * 100).toFixed(2)}%, plus slot 2's 8 clicks`
          ),
          /* The record stores this bench's price per click at ex-1's rates, not
           * at break-1's. It is worked out here at every position of this slider. */
          price: worked('the revenue on this panel, divided by the clicks on this panel'),
        }).concat([
          mintReading({
            usd: gsp.revenue / pure.revenue, role: 'ratio',
            label: 'against ranking by bid alone',
            ...prov(atRecord ? '(10*0.81+8*1.51)/(10*2.01+8*1.01)' : worked(
              'the revenue on this panel, divided by what ranking by bid alone collects'
            )),
          }),
        ]),
        band: BIDS_HELD_FIXED,
        breakEven: { ctr: breakEven, overstatement },
        note:
          'The ranking and the prices never move, because both read the forecast. Only the money ' +
          'moves, because the money reads what happened. Below a true 1.99% the quality-weighted ' +
          'auction earns less than ranking by bid alone, and no outsider could check the number.',
        figures,
        derived: atRecord ? [] : [{
          label: 'revenue at this true click rate',
          value: gsp.revenue,
          formula: `1000 x 1.0 x ${trueCedar} clicks at $${slot1Price.toFixed(2)}, plus slot 2 unchanged`,
        }],
      };
    },
  },

  /* ---------------------------------------------------------------- 08 */
  {
    id: 'sc-08-reserve-is-a-posted-price',
    n: 8,
    short: 'The reserve is the price',
    centre: 'slots',
    teaches:
      'One advertiser, one ad, one reader. The price is whatever the seller\'s floor says, and ' +
      'from August 2005 the seller set that floor per keyword.',
    controls: (ctx) => {
      const stops = reserveStops(ctx.record);
      return [{
        id: 'reserve', kind: 'rocker', label: 'The floor the seller sets',
        value: String(stops[0]),
        options: stops.map((r) => ({ value: String(r), label: `$${r.toFixed(2)}` })),
        note: 'Both levels are illustrative. The ratio is the point, not the level.',
      }];
    },
    build(state, ctx) {
      const { settings, mechanism, record } = ctx;
      const stops = reserveStops(record);
      const reserve = Number(state.reserve == null ? stops[0] : state.reserve);
      const names = castNames(mechanism, 'break-2-reserve-is-a-posted-price');
      const cast = mintCast({
        names: names.length ? names : ['The one advertiser'],
        bids: settings.bids,
        predictedCtrs: settings.predicted_ctrs,
        trueCtrs: settings.true_ctrs,
      });
      const run = (r) => runAuction(cast, {
        impressions: settings.impressions,
        slots: settings.slots,
        positionMultipliers: settings.position_multipliers,
        rankingRule: settings.ranking_rule,
        pricingRule: settings.pricing_rule,
        increment: 0,
        reserve: r,
      });
      const here = run(reserve);
      const low = run(stops[0]);
      const high = run(stops[1]);

      const figures = [
        { label: 'revenue at the one-cent floor', value: low.revenue, step: '0.04*0.01*1000' },
        { label: 'revenue at the one-dollar floor', value: high.revenue, step: '0.04*1.00*1000' },
        { label: 'the ratio between them', value: high.revenue / low.revenue, step: '(0.04*1.00*1000)/(0.04*0.01*1000)' },
        { label: 'the gap the seller chose', value: stops[1] - stops[0], step: '1.00-0.01' },
      ];

      return {
        inputs: {
          rows: cast.map((row) => ({ name: row.name, bid: row.bid, quality: row.predictedCtr })),
          knobs: [{ label: 'The floor', value: `$${reserve.toFixed(2)} a click` }],
        },
        centre: { kind: 'slots', slots: slotRows(here), queue: queueRows(here), noRunnerUp: true },
        readout: moneyReadout(here, {
          mode: 'custom', modeNote: 'one bidder, so the floor is the price',
          revenue: near(reserve, stops[0]) ? '0.04*0.01*1000'
            : (near(reserve, stops[1]) ? '0.04*1.00*1000'
              : worked(`1,000 impressions at a 4% click rate, each click at the $${reserve.toFixed(2)} floor`)),
          /* The record stores the two revenue figures for this break and not the
           * click count behind them, so the count says where it comes from. */
          clicks: worked('1,000 impressions times a 4% click rate, with one ad in one slot'),
          price: worked('one bidder, so every click is paid at the seller\'s own floor'),
        }).concat([
          mintReading({
            usd: high.revenue / low.revenue, role: 'ratio',
            label: 'one floor against the other',
            stepRef: '(0.04*1.00*1000)/(0.04*0.01*1000)',
          }),
        ]),
        band: unlocatedBand(
          'One advertiser bids on this query. A band needs bidders playing against each other, ' +
          'and this query has none. The price is the seller\'s floor.'
        ),
        note:
          'A second-price auction needs a second bidder to discipline the price. Where there is ' +
          'none — the long tail, which is most distinct queries — the price is the floor, and ' +
          'from August 2005 the floor was a per-keyword number the seller computed and never ' +
          'published.',
        figures,
        derived: [],
      };
    },
  },

  /* ---------------------------------------------------------------- 09 */
  {
    id: 'sc-09-pricing-knobs-coda',
    n: 9,
    short: 'Three knobs',
    centre: 'slots',
    teaches:
      'Squashing, format pricing and rGSP each move the price with the ads, the query and the ' +
      'reader held fixed.',
    controls: (ctx) => {
      const gamma = gammaSpec(ctx.record);
      const format = formatStops(ctx.record);
      return [{
        id: 'gamma', kind: 'range', label: 'Squashing',
        value: gamma.default,
        min: gamma.min, max: gamma.max, step: 0.0001,
        stops: gamma.stops,
        note: 'Gamma has never been disclosed. Squashing is named in the DOJ findings of fact; ' +
              'its exponent is not.',
      }, {
        id: 'format', kind: 'rocker', label: 'Format pricing',
        value: String(format[0].index),
        options: format.map((stop) => ({ value: String(stop.index), label: stop.label })),
        note: 'Each launch lifts the price about 15%, and about half of that sticks. The three ' +
              'positions are the record\'s own marked stops for this knob.',
      }, {
        id: 'rgsp', kind: 'rocker', label: 'rGSP',
        value: 'off',
        options: [{ value: 'off', label: 'Off' }, { value: 'on', label: 'On' }],
        note: 'The pricing rule was never published. The disclosed magnitude is placed inside ' +
              'the sc-05 band rather than re-derived.',
      }];
    },
    build(state, ctx) {
      const { settings, mechanism, record } = ctx;
      const names = castNames(mechanism, 'ex-1-quality-vs-pure-bid');
      const spec = gammaSpec(record);
      const gamma = state.gamma == null ? spec.default : Number(state.gamma);
      /* THE FORMAT KNOB IS THE RECORD'S OWN MARKED STOPS. The control used to
       * be a typed list of launch counts and the record's `format_multiplier`
       * block — the one control definition the record gives this scenario — was
       * read by nothing at all. */
      const stops = formatStops(record);
      const formatIndex = state.format == null ? stops[0].index : Number(state.format);
      const atFormatStop = stops.find((s) => near(s.index, formatIndex));
      if (!atFormatStop) {
        throw new Error(
          `sc-09 was asked for a format index of ${formatIndex} and the record's marked stops ` +
          `are ${stops.map((s) => s.index).join(', ')}.`
        );
      }
      const launches = atFormatStop.launches;
      const rgspOn = state.rgsp === 'on';

      const cast = mintCast({
        names, bids: settings.bids,
        predictedCtrs: settings.predicted_ctrs, trueCtrs: settings.true_ctrs,
      });
      const common = {
        impressions: settings.impressions, slots: settings.slots,
        positionMultipliers: settings.position_multipliers,
        pricingRule: settings.pricing_rule,
        reserve: settings.reserve,
      };
      /* THE INCREMENT IS ZERO HERE, AND THIS IS THE ONE PLACE IT IS DECIDED.
       * mechanism.json ex-5 states the squashing rule as
       * p = b_next * (q_next / q_own)^gamma, with no increment, and its stored
       * step prices Aster at 2.82842712474619. The engine is general; sc-09
       * passes the record's own setting, in one line, beside the step it cites. */
      const squashed = runAuction(cast, { ...common, rankingRule: 'squashed', gamma, increment: 0 });
      const full = runAuction(cast, { ...common, rankingRule: 'quality_weighted', increment: settings.bid_increment });
      const pure = runAuction(cast, { ...common, rankingRule: 'pure_bid', increment: settings.bid_increment });

      const format = formatLaunch({ lift: 0.15, stickage: 0.5, launches: Math.max(launches, 1) });
      const base = upliftOnBase(0.20);
      const rgspLift = settings.rgsp_uplift;
      const rgspDurable = 0.0591 * settings.stickage;
      const stacked = stackKnobs({ rgspLift: 0.0591, rgspStickage: settings.stickage, formatLift: 0.15, formatStickage: 0.5 });
      const calibratedGamma = (record.expected_output.gamma_calibrated_to_disclosed_5pct || {}).gamma;
      const calibratedMarkup = squashMarkup({ qNext: 0.03, qOwn: 0.08, gamma: calibratedGamma });

      /* PART A of ex-5: two advertisers, one slot, and the allocation never
       * moves. It is the cleanest statement the record has of what squashing
       * does — the same ad, in the same slot, for the same reader, at a
       * different price — so it sits beside the three-advertiser cast rather
       * than replacing it. Both gamma settings are the record's own. */
      const partANames = castNames(mechanism, 'ex-5-squashing');
      const partACast = mintCast({
        names: partANames, bids: [2.0, 2.5],
        predictedCtrs: [0.08, 0.03], trueCtrs: [0.08, 0.03],
      });
      const partACommon = {
        impressions: 1000, slots: 1, positionMultipliers: [1.0],
        pricingRule: 'second_price', increment: 0, reserve: 0.01,
      };
      const partAPlain = runAuction(partACast, { ...partACommon, rankingRule: 'quality_weighted' });
      const partASquashed = runAuction(partACast, { ...partACommon, rankingRule: 'squashed', gamma: 0.5 });

      /* The scale anchors. Filed dollars, in millions: Google's 2008
       * advertising revenue against the whole US newspaper classified market
       * that search was taking. */
      const AD_REVENUE_2008 = 21128.5;
      const CLASSIFIED_2008 = 9975.0;

      const atHalf = near(gamma, 0.5);
      const atOne = near(gamma, 1);
      const figures = [
        { label: 'the calibrated squashing markup', value: calibratedMarkup, step: '(0.03/0.08)**(0.9502562102225057-1)' },
        { label: 'what one format-price launch keeps', value: format.durable, step: '0.15*0.5' },
        { label: 'three launches, compounded', value: Math.pow(1.075, 3), step: '1.075**3' },
        { label: 'four launches, compounded', value: Math.pow(1.075, 4), step: '1.075**4' },
        { label: 'revenue per thousand queries without format pricing', value: base.counterfactualIndex, step: '100*(1-0.20)' },
        { label: 'the uplift on the base', value: base.uplift, step: '(100-100*(1-0.20))/(100*(1-0.20))' },
        { label: 'how close three launches come to the disclosed share', value: Math.pow(1.075, 3) / (1 + base.uplift), step: '(1.075**3)/(1+((100-100*(1-0.20))/(100*(1-0.20))))' },
        { label: 'what rGSP keeps after stickage', value: rgspDurable, step: '0.0591*0.45' },
        { label: 'two knobs stacked', value: stacked, step: '(1+0.0591*0.45)*(1+0.15*0.5)' },
        /* PART A */
        { label: 'Delta\'s score at gamma 1', value: partAPlain.rows[0].score, step: '2.00*0.08' },
        { label: 'Ember\'s score at gamma 1', value: partAPlain.unplaced[0].score, step: '2.50*0.03' },
        { label: 'Delta\'s price at gamma 1', value: partAPlain.rows[0].price, step: '(2.50*0.03)/0.08' },
        { label: 'Delta\'s score at gamma 0.5', value: partASquashed.rows[0].score, step: '2.00*(0.08**0.5)' },
        { label: 'Ember\'s score at gamma 0.5', value: partASquashed.unplaced[0].score, step: '2.50*(0.03**0.5)' },
        { label: 'Delta\'s price at gamma 0.5', value: partASquashed.rows[0].price, step: '2.50*(0.03**0.5)/(0.08**0.5)' },
        { label: 'what the same ad costs after squashing', value: partASquashed.rows[0].price / partAPlain.rows[0].price, step: '(2.50*(0.03**0.5)/(0.08**0.5))/((2.50*0.03)/0.08)' },
        { label: 'the markup in closed form', value: squashMarkup({ qNext: 0.03, qOwn: 0.08, gamma: 0.5 }), step: '(0.03/0.08)**(0.5-1)' },
        { label: 'Delta\'s revenue at gamma 1', value: partAPlain.revenue, step: '0.08*((2.50*0.03)/0.08)*1000' },
        { label: 'Delta\'s revenue at gamma 0.5', value: partASquashed.revenue, step: '0.08*(2.50*(0.03**0.5)/(0.08**0.5))*1000' },
        { label: 'what the knob alone added', value: partASquashed.revenue - partAPlain.revenue, step: '0.08*(2.50*(0.03**0.5)/(0.08**0.5))*1000-0.08*((2.50*0.03)/0.08)*1000' },
        /* THE SCALE ANCHORS */
        { label: 'format pricing at 2008 revenue levels', value: AD_REVENUE_2008 * 0.20, step: '21128.5*0.20' },
        { label: 'that against the 2008 newspaper classified market', value: (AD_REVENUE_2008 * 0.20) / CLASSIFIED_2008, step: '21128.5*0.20/9975.0' },
        { label: 'a 5% tuning at 2008 revenue levels', value: AD_REVENUE_2008 * 0.05, step: '21128.5*0.05' },
        { label: 'the same tuning at the 10% he allowed', value: AD_REVENUE_2008 * 0.10, step: '21128.5*0.10' },
        { label: 'the 5% tuning against that classified market', value: (AD_REVENUE_2008 * 0.05) / CLASSIFIED_2008, step: '21128.5*0.05/9975.0' },
        /* rGSP ON THE EQUILIBRIUM SLOT-1 PRICE */
        { label: 'the top slot price after rGSP', value: 2.80 * 1.0591, step: '2.80*1.0591' },
        { label: 'the top slot price after stickage', value: 2.80 * (1 + 0.0591 * 0.45), step: '2.80*(1+0.0591*0.45)' },
      ];
      if (atHalf) {
        figures.push(
          { label: 'Aster\'s squashed score', value: squashed.rows[0].score, step: '3.00*(0.01**0.5)' },
          { label: 'Brindle\'s squashed score', value: squashed.rows[1].score, step: '2.00*(0.02**0.5)' },
          { label: 'Cedar\'s squashed score', value: squashed.unplaced[0].score, step: '1.00*(0.05**0.5)' },
          { label: 'slot 1 price', value: squashed.rows[0].price, step: '2.00*(0.02**0.5)/(0.01**0.5)' },
          { label: 'slot 2 price', value: squashed.rows[1].price, step: '1.00*(0.05**0.5)/(0.02**0.5)' },
          { label: 'revenue per 1,000 impressions', value: squashed.revenue, step: '10*(2.00*(0.02**0.5)/(0.01**0.5))+8*(1.00*(0.05**0.5)/(0.02**0.5))' },
          { label: 'against ranking by bid alone', value: squashed.revenue / pure.revenue, step: '(10*(2.00*(0.02**0.5)/(0.01**0.5))+8*(1.00*(0.05**0.5)/(0.02**0.5)))/(10*2.01+8*1.01)' },
          { label: 'against full quality weighting', value: squashed.revenue / full.revenue, step: '(10*(2.00*(0.02**0.5)/(0.01**0.5))+8*(1.00*(0.05**0.5)/(0.02**0.5)))/(50*0.81+8*1.51)' },
          { label: 'clicks delivered', value: squashed.clicks, step: '10+8' },
        );
      }

      const bandBase = 440;
      const bandTop = 760;
      const marker = rgspOn ? bandBase * (1 + rgspLift) : bandBase;
      if (rgspOn) {
        figures.push(
          { label: 'where rGSP puts the seller', value: marker, step: '440*1.0574' },
          { label: 'how far across the band that is', value: (marker - bandBase) / (bandTop - bandBase), step: '(440*1.0574-440)/(760-440)' },
        );
      }

      return {
        inputs: {
          rows: cast.map((row) => ({
            name: row.name, bid: row.bid, quality: row.predictedCtr,
            squashedQuality: Math.pow(row.predictedCtr, gamma),
          })),
          knobs: [
            { label: 'Squashing', value: `gamma ${gamma.toFixed(4)}`, assumed: true },
            { label: 'Format pricing', value: atFormatStop.label },
            { label: 'rGSP', value: rgspOn ? 'on' : 'off' },
          ],
        },
        centre: { kind: 'slots', slots: slotRows(squashed), queue: queueRows(squashed), squashed: true },
        readout: [
          mintReading({
            usd: squashed.revenue, role: 'money', mode: 'custom',
            modeNote: 'bids held fixed at the record\'s own numbers',
            label: 'revenue', unit: 'per 1,000 impressions',
            assumption: 'gamma has never been disclosed',
            ...prov(atHalf
              ? '10*(2.00*(0.02**0.5)/(0.01**0.5))+8*(1.00*(0.05**0.5)/(0.02**0.5))'
              : worked(`each winner priced at the runner-up's bid times their quality over its ` +
                       `own, to the power ${gamma.toFixed(4)}`)),
          }),
          mintReading({
            usd: squashed.clicks, role: 'count', label: 'clicks delivered', unit: 'clicks',
            ...prov(atHalf ? '10+8' : (atOne ? '50+8' : worked(
              `the clicks the ads in the two slots earn at gamma ${gamma.toFixed(4)}`
            ))),
          }),
          mintReading({
            usd: formatIndex,
            role: 'ratio', format: 'times',
            label: 'format pricing, on revenue per thousand queries',
            ...prov(launches === 3 ? '1.075**3' : worked(
              launches === 0
                ? 'no launches, so the index stands where it was'
                : `${atFormatStop.label}, each keeping 15% times 50%, compounded`
            )),
          }),
        ],
        band: mintBand({
          unit: 'the sc-05 example, over 180 clicks',
          floor: mintReading({
            usd: bandBase, role: 'money', mode: 'lowest_envy_free',
            label: 'the lowest equilibrium', stepRef: '100*2.8+80*2.0',
          }),
          ceiling: mintReading({
            usd: bandTop, role: 'money', mode: 'naive_truthful',
            label: 'everybody bids their value', stepRef: '100*6+80*2',
          }),
          marker: mintReading({
            usd: marker, role: 'money', mode: 'lowest_envy_free',
            modeNote: rgspOn ? 'the lowest equilibrium, lifted by the disclosed rGSP effect' : 'the lowest equilibrium',
            label: 'where the knob puts the seller',
            stepRef: rgspOn ? '440*1.0574' : '100*2.8+80*2.0',
          }),
          note: 'This band belongs to the three-bidder example in sc-05. The knobs are measured ' +
                'against it because the record measures them against it.',
        }),
        knobPanel: {
          gamma, calibratedGamma, calibratedMarkup,
          formatCompounded: formatIndex,
          rgspDurable, stacked,
          partA: {
            names: partANames,
            plainPrice: partAPlain.rows[0].price,
            squashedPrice: partASquashed.rows[0].price,
            markup: partASquashed.rows[0].price / partAPlain.rows[0].price,
            plainRevenue: partAPlain.revenue,
            squashedRevenue: partASquashed.revenue,
          },
          scale: {
            formatAt2008: AD_REVENUE_2008 * 0.20,
            formatShareOfClassified: (AD_REVENUE_2008 * 0.20) / CLASSIFIED_2008,
            tuningAt2008: AD_REVENUE_2008 * 0.05,
            tuningShareOfClassified: (AD_REVENUE_2008 * 0.05) / CLASSIFIED_2008,
          },
        },
        note: atHalf
          ? 'At gamma 0.5 the ranking falls back to the bid order — 18 clicks, not 58 — while the ' +
            'seller collects 45% more than ranking by bid alone ever paid it. Price up, relevance ' +
            'down, rule unchanged.'
          : (atOne
            ? 'At gamma 1 this is the 2002 auction, priced by the record\'s squashing formula, ' +
              'which carries no one-cent increment. That is why each price here reads a cent ' +
              'under sc-02. Pull the knob down and watch the price rise and the clicks fall ' +
              'together.'
            : 'The ads, the query and the reader never change while these knobs move.'),
        figures,
        derived: (atHalf || atOne) ? [] : [{
          label: 'revenue at this gamma',
          value: squashed.revenue,
          formula: `each winner priced at the runner-up's bid times (their quality over its own) to the power ${gamma.toFixed(4)}`,
        }],
      };
    },
  },

  /* ---------------------------------------------------------------- 10 */
  {
    id: 'sc-10-era-6-vs-era-7-side-by-side',
    n: 10,
    short: 'Two changes, opposite ways',
    centre: 'plates',
    teaches:
      'Both 2019 changes are on one screen because this is where they get confused. They ran in ' +
      'opposite directions, on opposite sides of the business.',
    controls: () => [{
      id: 'focus', kind: 'rocker', label: 'Read',
      value: 'both',
      options: [
        { value: 'both', label: 'Both' },
        { value: 'display', label: 'Display' },
        { value: 'search', label: 'Search' },
      ],
      note: 'Each plate carries the record\'s own sentence about which surface it is.',
    }],
    build(state, ctx) {
      const { record } = ctx;
      const out = record.expected_output;
      const bandBase = out.search_panel.band_position_before;
      const bandTop = out.search_panel.band_ceiling;
      const after = bandBase * (1 + out.search_panel.revenue_change_from_rule_change);
      const traversed = (after - bandBase) / (bandTop - bandBase);

      return {
        inputs: {
          rows: [
            { name: 'Display, 2019', note: 'the open-web exchange' },
            { name: 'Search, 2019', note: 'the search results page' },
          ],
          knobs: [{ label: 'Reading', value: state.focus || 'both' }],
        },
        centre: {
          kind: 'plates',
          focus: state.focus || 'both',
          plates: [
            {
              channel: 'display',
              what: 'moved to a unified first-price auction',
              motive: out.display_panel.stated_motive,
              effect: out.display_panel.google_reported_effect,
              change: out.display_panel.revenue_change_from_rule_change,
              direction: 'level',
            },
            {
              channel: 'search',
              what: 'kept a second-price auction and got rGSP',
              motive: out.search_panel.stated_motive,
              effect: 'a 5.74% revenue gain that held two months after launch',
              change: out.search_panel.revenue_change_from_rule_change,
              direction: 'up',
            },
          ],
        },
        readout: [
          mintReading({
            usd: out.display_panel.revenue_change_from_rule_change, role: 'ratio', format: 'percent',
            label: 'what the display rule change moved',
            stepRef: '(10*3/(3+1))*((3-1)/3)-10*(3-1)/(3+1)',
          }),
          mintReading({
            usd: out.search_panel.revenue_change_from_rule_change, role: 'ratio', format: 'percent',
            label: 'what the search change moved',
            /* A DISCLOSED FIGURE, NOT A DERIVATION. The record holds it; no
             * stored step produces it; and saying so is the honest label. */
            derivedFrom: 'read straight off the frozen record, which states a 5.74% revenue gain ' +
                         'from the 2019 search rule change',
          }),
          mintReading({
            usd: traversed, role: 'ratio', format: 'percent',
            label: 'how far across the band that is',
            stepRef: '(440*1.0574-440)/(760-440)',
          }),
        ],
        band: mintBand({
          unit: 'the sc-05 example, over 180 clicks',
          floor: mintReading({
            usd: bandBase, role: 'money', mode: 'lowest_envy_free',
            label: 'the lowest equilibrium', stepRef: '100*2.8+80*2.0',
          }),
          ceiling: mintReading({
            usd: bandTop, role: 'money', mode: 'naive_truthful',
            label: 'everybody bids their value', stepRef: '100*6+80*2',
          }),
          marker: mintReading({
            usd: after, role: 'money', mode: 'lowest_envy_free',
            modeNote: 'the lowest equilibrium, lifted by the disclosed rGSP effect',
            label: 'where rGSP put the seller',
            stepRef: '440*1.0574',
          }),
          note: 'The search knob is small next to the slack the rule already leaves open.',
        }),
        note:
          'Same year, opposite directions. And a 5.74% lift walks the market 7.9% of the way ' +
          'across a band the rule itself leaves 73% wide.',
        figures: [
          { label: 'the width of the band', value: bandTop / bandBase, step: '760/440' },
          { label: 'where rGSP put the seller', value: after, step: '440*1.0574' },
          { label: 'how far across the band that is', value: traversed, step: '(440*1.0574-440)/(760-440)' },
          { label: 'what the display rule change moved', value: out.display_panel.revenue_change_from_rule_change, step: '(10*3/(3+1))*((3-1)/3)-10*(3-1)/(3+1)' },
        ],
        derived: [],
      };
    },
  },
];

export const SCENARIO_IDS = Object.freeze(SCENARIOS.map((s) => s.id));

/**
 * EVERY NUMBER A VIEW PUTS ON SCREEN, as rows the arithmetic gate can take.
 *
 * The gate used to run over `view.figures` alone — the ledger under the
 * instrument. The MONEY zone is `view.readout`, and the band's ends, stops and
 * marker are readings too. All three are on the panel, in the largest type
 * there is, and none of them was checked. That is how sc-04 came to print
 * $361.00 in the till while its band marker sat at $440.
 *
 * There is one list now, so the till and the ledger cannot disagree.
 */
export function viewFigures(view) {
  const rows = [...(view.figures || []), ...(view.derived || [])];
  rows.push(...readingRows(view.readout || []));
  if (view.band) rows.push(...readingRows(bandReadings(view.band)));
  return rows;
}

export function scenarioByIndex(n) {
  const found = SCENARIOS.find((s) => s.n === n);
  if (!found) throw new Error(`no scenario numbered ${n}; the bench holds 1 to ${SCENARIOS.length}.`);
  return found;
}

/**
 * The state a scenario opens in.
 *
 * `controls(ctx, state)` takes the live state because one control's range
 * depends on another's position: sc-06's equilibrium shading factor is
 * (n-1)/n, so it moves when the bidder count moves. A control whose value is
 * `null` means "wherever the record says this starts", and `build` resolves it.
 */
export function defaultState(scenario, ctx, state = {}) {
  const out = {};
  for (const control of scenario.controls(ctx, state)) out[control.id] = control.value;
  return out;
}

export default {
  SCENARIOS, SCENARIO_IDS, scenarioByIndex, defaultState, castNames, viewFigures,
};
