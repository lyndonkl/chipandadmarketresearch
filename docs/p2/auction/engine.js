/**
 * docs/p2/auction/engine.js — the arithmetic of the auction bench.
 *
 * Team B4. Imports `../lib/guards.js` for every rule that can be broken and
 * `../lib/tokens.js` for every colour. It re-implements neither.
 *
 * ======================================================================
 * THE ONE STRUCTURAL DECISION IN THIS FILE
 *
 * `simulator-params.json` build note 1:
 *
 *   "Ranking and pricing always use predicted_ctrs; revenue and clicks always
 *    use true_ctrs. Keeping the two arrays separate is what makes sc-07
 *    possible and is the single most important structural decision in the
 *    model."
 *
 * A rule saying "the ranker must not read the true click rate" is a comment.
 * The chart system shipped eight lies exactly that way: the guard ran in the
 * planning pass and the renderer drew from the raw data anyway. The fix that
 * worked was to STRIP the number the renderer must not use.
 *
 * So the cast is never handed to a rule whole. Two views come off it and each
 * one is missing what its rule must not see:
 *
 *   rankingView(cast)   ->  { id, name, bid, quality }        NO trueCtr
 *   deliveryView(cast)  ->  { id, name, trueCtr }             NO bid, NO quality
 *
 * `rank()` refuses any row carrying `trueCtr`. `deliver()` refuses any row
 * carrying `bid` or `quality`. Neither refusal can be talked around, because
 * the key is not there to read. sc-07 — the scenario where the two arrays
 * differ — is then a data change and not a code path.
 * ======================================================================
 */

/* ------------------------------------------------------------------ *
 * Errors
 * ------------------------------------------------------------------ */

export class EngineError extends Error {
  constructor(message, detail = null, fix = null) {
    super(fix ? `${message}\n  FIX: ${fix}` : message);
    this.name = 'EngineError';
    this.detail = detail;
    this.fix = fix;
  }
}

/** Thrown when a rule is handed a number the record says it must not read. */
export class LeakError extends EngineError {
  constructor(message, detail, fix) { super(message, detail, fix); this.name = 'LeakError'; }
}

const finite = (v) => typeof v === 'number' && Number.isFinite(v);

function need(value, what, where) {
  if (!finite(value)) {
    throw new EngineError(
      `${where} needs a finite ${what} and got ${JSON.stringify(value)}.`,
      { [what]: value },
      'every input reaches this engine from simulator-params.json — check the scenario settings'
    );
  }
  return value;
}

/**
 * A SETTING THIS ENGINE WILL NOT GUESS.
 *
 * There used to be a default for the position multipliers, the increment and
 * the reserve, and each one happened to equal the record's value for sc-01,
 * sc-02 and sc-03. Delete any of those three settings from the frozen file and
 * the bench rendered the record's exact numbers anyway, with a green gate.
 * Being right by luck is worse than being wrong, because nothing tells you the
 * input was missing.
 *
 * So there are no defaults for anything the record carries. A setting that is
 * absent stops the engine, names itself, and says where it comes from.
 */
function setting(value, key, where, check = finite) {
  if (value === undefined || value === null || !check(value)) {
    throw new EngineError(
      `${where} has no ${key}, and this engine does not guess one. A default that happens to ` +
      'match the record for three scenarios renders six malformed inputs authoritatively.',
      { [key]: value },
      `pass ${key} — it comes from the scenario's own settings in simulator-params.json`
    );
  }
  return value;
}

const isMultiplierList = (v) => Array.isArray(v) && v.length > 0 && v.every(finite);

/* ------------------------------------------------------------------ *
 * 1 · THE CAST, AND THE TWO VIEWS THAT COME OFF IT
 * ------------------------------------------------------------------ */

/**
 * Build the cast from a scenario's resolved settings.
 *
 * `bids` and `predicted_ctrs` are the strategy and the seller's estimate.
 * `true_ctrs` is what actually happens. `values` is the primitive the
 * truthfulness scenarios run on, and it is a different thing from a bid:
 * a bid is a choice, a value is a fact about the advertiser.
 *
 * THE TWO CLICK-RATE ARRAYS ARE NEVER MERGED. This function used to fill a
 * missing `trueCtrs[i]` from `predictedCtrs[i]`, which reads like a kindness
 * and is the exact opposite. The separation of the seller's forecast from what
 * really happened is what sc-07 teaches — the seller forecasts the click, and
 * nobody outside can check the forecast — and a cast that quietly makes the two
 * equal makes that scenario teach nothing while still rendering. A short array
 * stops here.
 */
export function mintCast({ names = [], bids = [], predictedCtrs = [], trueCtrs = [], values = [] } = {}) {
  const n = Math.max(names.length, bids.length, predictedCtrs.length, trueCtrs.length, values.length);
  if (n === 0) {
    throw new EngineError(
      'mintCast was given no advertisers.', { names, bids },
      'the cast comes from the scenario settings — bids, predicted_ctrs, true_ctrs'
    );
  }
  if (trueCtrs.length !== n) {
    throw new EngineError(
      `this cast has ${n} advertisers and ${trueCtrs.length} true click rate(s). The seller's ` +
      'forecast is never allowed to stand in for what really happened: that substitution is ' +
      'what makes sc-07 — the whole quality-estimate break — invisible.',
      { advertisers: n, trueCtrs },
      'set true_ctrs for every advertiser in the scenario settings, and set it equal to ' +
      'predicted_ctrs on purpose where the record says the forecast was right'
    );
  }
  const cast = [];
  for (let i = 0; i < n; i += 1) {
    const row = {
      id: `b${i + 1}`,
      name: names[i] != null ? String(names[i]) : `Bidder ${i + 1}`,
      index: i,
    };
    if (bids[i] != null) row.bid = need(bids[i], 'bid', `cast row ${i}`);
    if (values[i] != null) row.value = need(values[i], 'value', `cast row ${i}`);
    if (predictedCtrs[i] != null) row.predictedCtr = need(predictedCtrs[i], 'predicted CTR', `cast row ${i}`);
    row.trueCtr = need(trueCtrs[i], 'true CTR', `cast row ${i}`);
    cast.push(Object.freeze(row));
  }
  return Object.freeze(cast);
}

/**
 * What the RANKER and the PRICER are allowed to see.
 *
 * The seller's own estimate, and nothing about what really happened. There is
 * no `trueCtr` key on the object — not a null, not a zero. The row cannot be
 * asked.
 */
export function rankingView(cast, { bidField = 'bid' } = {}) {
  return Object.freeze(cast.map((row) => {
    const bid = row[bidField];
    if (!finite(bid)) {
      throw new EngineError(
        `${row.name} has no ${bidField} to rank on.`, { row: row.name, bidField },
        bidField === 'value'
          ? 'this scenario ranks on values — check settings.values'
          : 'check settings.bids in simulator-params.json'
      );
    }
    return Object.freeze({
      id: row.id, name: row.name, index: row.index,
      bid,
      quality: finite(row.predictedCtr) ? row.predictedCtr : 1,
    });
  }));
}

/**
 * What the CLICK COUNT and the REVENUE are allowed to see.
 *
 * What really happened, and nothing about the money. A delivery row has no
 * `bid` and no `quality`, so no arithmetic here can accidentally rank on
 * realised performance — which is the seller marking its own homework twice.
 */
export function deliveryView(cast) {
  return Object.freeze(cast.map((row) => Object.freeze({
    id: row.id, name: row.name, index: row.index,
    trueCtr: finite(row.trueCtr) ? row.trueCtr : null,
  })));
}

function refuseLeak(rows, forbidden, where, why) {
  for (const row of rows) {
    for (const key of forbidden) {
      if (row && Object.prototype.hasOwnProperty.call(row, key)) {
        throw new LeakError(
          `${where} was handed a row carrying "${key}". ${why}`,
          { row: row.name ?? row, key },
          where.startsWith('rank')
            ? 'pass rankingView(cast), not the cast'
            : 'pass deliveryView(cast), not the cast'
        );
      }
    }
  }
}

/* ------------------------------------------------------------------ *
 * 2 · RANKING
 * ------------------------------------------------------------------ */

/** The four ranking rules `simulator-params.json` declares, and no fifth. */
export const RANKING_RULES = Object.freeze(['pure_bid', 'quality_weighted', 'squashed', 'randomized']);

/**
 * The ranking score, per rule.
 *
 *   pure_bid          score = bid                    (GoTo/Overture)
 *   quality_weighted  score = bid * q                (AdWords Select, 2002)
 *   squashed          score = bid * q^gamma          (DOJ findings; gamma undisclosed)
 *   randomized        quality_weighted, with the top `rgspBand` candidates
 *                     eligible to swap. THE SWAP IS NOT SIMULATED — see below.
 */
export function score(row, { rule, gamma = null } = {}) {
  if (!RANKING_RULES.includes(rule)) {
    throw new EngineError(
      `"${rule}" is not a ranking rule this record declares.`, { rule },
      `use one of: ${RANKING_RULES.join(', ')}`
    );
  }
  if (rule === 'pure_bid') return row.bid;
  if (rule === 'squashed') return row.bid * Math.pow(row.quality, setting(gamma, 'gamma', 'the squashed ranking rule'));
  return row.bid * row.quality;
}

/**
 * Rank the bidders. Ties keep the record's own cast order, which is the only
 * order the file gives and the only one a reader can check.
 *
 * rGSP: the exact pricing rule is not public. `mechanism.json` ex-7 says so and
 * locates the disclosed magnitudes inside the ex-3 band rather than re-deriving
 * them. This engine does the same. `rgspBand` marks which candidates the record
 * says may swap; it does not shuffle them, and no revenue figure here is
 * derived from a shuffle.
 */
export function rank(rankables, { rule, gamma = null, rgspBand = null } = {}) {
  refuseLeak(rankables, ['trueCtr'], 'rank()',
    'Ranking reads the seller\'s estimate only. A ranker that can see what really happened ' +
    'makes sc-07 — the whole quality-estimate break — impossible to state.');
  setting(rule, 'ranking rule', 'rank()', (v) => RANKING_RULES.includes(v));
  if (rule === 'randomized') setting(rgspBand, 'rgsp_band', 'the randomized ranking rule');
  const scored = rankables.map((row) => Object.freeze({
    ...row, score: score(row, { rule, gamma }),
  }));
  const order = scored
    .map((row, i) => ({ row, i }))
    .sort((a, b) => (b.row.score - a.row.score) || (a.i - b.i))
    .map(({ row }) => row);
  const swappable = rule === 'randomized' ? Math.max(1, Math.min(rgspBand, order.length)) : 1;
  return Object.freeze(order.map((row, j) => Object.freeze({
    ...row, rank: j + 1, maySwap: rule === 'randomized' && j < swappable,
  })));
}

/* ------------------------------------------------------------------ *
 * 3 · PRICING
 * ------------------------------------------------------------------ */

export const PRICING_RULES = Object.freeze(['second_price', 'first_price']);

/**
 * The price the holder of slot j pays per click.
 *
 * SECOND PRICE — the minimum needed to hold the position, quality-adjusted:
 *
 *   pure_bid ranking          p = b_next + increment
 *   quality_weighted ranking  p = (b_next * q_next) / q_own + increment
 *   squashed ranking          p = b_next * (q_next / q_own)^gamma
 *
 * FIRST PRICE — p = your own bid.
 *
 * TWO THINGS THE RECORD DECIDES AND THIS FUNCTION DOES NOT:
 *
 * 1. THE INCREMENT ON THE SQUASHED RULE. `mechanism.json` ex-5 states the
 *    squashing formula with no increment, and its stored steps price Aster at
 *    2.82842712474619 rather than 2.83842712474619. That is the record's
 *    arithmetic and this engine matches it. The increment is not switched off
 *    here — `scenarios.js` passes `bid_increment: 0` for sc-09, in one place,
 *    with the step it is citing written beside it. A reviewer sees the decision
 *    in the diff instead of finding it buried in a formula.
 *
 * 2. THE CAP. Prices are capped at the advertiser's own max CPC everywhere, as
 *    in the deployed product (`simulator-params.json` build note 3). No cap
 *    binds anywhere in the frozen scenarios; the cap is here because the
 *    deployed rule had one, not because a scenario needs it.
 *
 * WITH NO RUNNER-UP the price IS the reserve. That is not an edge case being
 * tidied away — it is sc-08, and it is the finding that most changes the era-6
 * story.
 */
export function priceForSlot(ordered, j, opts = {}) {
  const {
    rankingRule, pricingRule,
    increment = null, reserve = null, gamma = null,
  } = opts;
  setting(rankingRule, 'ranking rule', 'priceForSlot()', (v) => RANKING_RULES.includes(v));
  if (!PRICING_RULES.includes(pricingRule)) {
    throw new EngineError(
      `"${pricingRule}" is not a pricing rule this record declares.`, { pricingRule },
      `use one of: ${PRICING_RULES.join(', ')}`
    );
  }
  const own = ordered[j];
  if (!own) return null;
  const next = ordered[j + 1] || null;

  let raw;
  let basis;
  if (pricingRule === 'first_price') {
    raw = own.bid;
    basis = 'pay your own bid';
  } else if (!next) {
    /* WITH NO RUNNER-UP THE RESERVE IS THE PRICE, so this is the one branch
     * where a defaulted reserve would BE the answer. sc-08 is that scenario. */
    raw = setting(reserve, 'reserve', 'a slot with no runner-up under it');
    basis = 'the reserve — no runner-up sits below this slot, so the seller sets the price';
  } else if (rankingRule === 'pure_bid') {
    raw = next.bid + setting(increment, 'bid_increment', 'the pure-bid pricing rule');
    basis = 'the next bid, plus the increment';
  } else if (rankingRule === 'squashed') {
    raw = next.bid * Math.pow(next.quality / own.quality, setting(gamma, 'gamma', 'the squashed pricing rule'));
    basis = 'the runner-up\'s squashed score, divided by this ad\'s own squashed quality';
  } else {
    raw = (next.bid * next.quality) / own.quality
      + setting(increment, 'bid_increment', 'the quality-weighted pricing rule');
    basis = 'the runner-up\'s AdRank, divided by this ad\'s own quality, plus the increment';
  }

  const capped = Math.min(raw, own.bid);
  return Object.freeze({
    slot: j + 1,
    price: capped,
    uncapped: raw,
    cap: own.bid,
    capBinds: raw > own.bid + 1e-12,
    basis,
    setBy: next ? next.name : null,
  });
}

/* ------------------------------------------------------------------ *
 * 4 · DELIVERY, AND THE MONEY
 * ------------------------------------------------------------------ */

/**
 * Expected clicks for the ad in slot j.
 *
 *   clicks = impressions * position_multiplier[j] * advertiser_true_ctr
 *
 * The separable position model, which is the standard position-auction
 * assumption and what Google's own ranking arithmetic implies.
 */
export function clicksForSlot(deliveryRows, id, j, { impressions, positionMultipliers }) {
  refuseLeak(deliveryRows, ['bid', 'quality'], 'clicksForSlot()',
    'The click count reads what happened, never what was paid.');
  const row = deliveryRows.find((r) => r.id === id);
  if (!row) throw new EngineError(`no delivery row for ${id}.`, { id });
  const mult = positionMultipliers[j];
  need(impressions, 'impressions', 'clicksForSlot');
  need(mult, `position multiplier for slot ${j + 1}`, 'clicksForSlot');
  if (!finite(row.trueCtr)) {
    throw new EngineError(
      `${row.name} has no true click rate, so its clicks cannot be counted.`,
      { row: row.name },
      'set true_ctrs for every advertiser in the scenario settings — the seller\'s forecast is ' +
      'never substituted for it'
    );
  }
  return impressions * mult * row.trueCtr;
}

/* ------------------------------------------------------------------ *
 * 5 · THE WHOLE AUCTION, IN ONE CALL
 * ------------------------------------------------------------------ */

/**
 * Run one auction and return the allocation, the prices and the money.
 *
 * Returns a frozen result. `revenue`, `clicks` and `avgPricePerClick` are bare
 * numbers HERE and are wrapped before they reach a readout — see readouts.js.
 * A bare revenue number is exactly what build note 2 forbids on screen, and the
 * wrapping is what makes the bidder mode impossible to forget.
 *
 * NOTHING HERE HAS A DEFAULT. Every setting the record carries must arrive.
 */
export function runAuction(cast, settings = {}) {
  const {
    impressions, slots, positionMultipliers,
    rankingRule, pricingRule, increment, reserve,
    gamma = null,
    rgspBand = null,
    bidField = 'bid',
  } = settings;

  /* EVERY SETTING THE RECORD CARRIES IS REQUIRED, AND THERE ARE NO EXCEPTIONS
   * LEFT. See `setting()` above for what the defaults used to hide.
   *
   * There used to be one exception, `formatMultiplier`, defended on the grounds
   * that 1 is the identity and the record does not store the number. The record
   * stores it — `format_multiplier: 1.0` on sc-01 and on sc-02 — so the
   * exception was the same "right by luck" defect the paragraph above it was
   * written to close. The parameter is gone: ex-6 measures format pricing on
   * revenue per thousand queries and sc-09 moves that index, so nothing here
   * multiplies a price. `panels.assertNoUnappliedFormatMultiplier` refuses a
   * record that asks for one, rather than letting the setting go unread. */
  if ('formatMultiplier' in settings) {
    throw new EngineError(
      'runAuction was passed a formatMultiplier and this engine does not apply one.',
      { formatMultiplier: settings.formatMultiplier },
      'mechanism.json ex-6 measures format pricing on revenue per thousand queries, not as a ' +
      'multiplier on a cast\'s prices. sc-09 moves that index; see scenarios.js.'
    );
  }
  setting(impressions, 'impressions', 'runAuction');
  setting(slots, 'slots', 'runAuction');
  setting(positionMultipliers, 'position_multipliers', 'runAuction', isMultiplierList);
  setting(rankingRule, 'ranking_rule', 'runAuction', (v) => RANKING_RULES.includes(v));
  setting(pricingRule, 'pricing_rule', 'runAuction', (v) => PRICING_RULES.includes(v));
  setting(increment, 'bid_increment', 'runAuction');
  setting(reserve, 'reserve', 'runAuction');
  if (positionMultipliers.length < Math.min(slots, cast.length)) {
    throw new EngineError(
      `this auction fills ${Math.min(slots, cast.length)} slot(s) and the record gives ` +
      `${positionMultipliers.length} position multiplier(s).`,
      { slots, positionMultipliers },
      'set one position_multiplier per slot in the scenario settings'
    );
  }

  const ordered = rank(rankingView(cast, { bidField }), { rule: rankingRule, gamma, rgspBand });
  const delivery = deliveryView(cast);
  const filled = Math.min(slots, ordered.length);

  const rows = [];
  let revenue = 0;
  let clicks = 0;
  for (let j = 0; j < filled; j += 1) {
    const p = priceForSlot(ordered, j, {
      rankingRule, pricingRule, increment, reserve, gamma,
    });
    const c = clicksForSlot(delivery, ordered[j].id, j, { impressions, positionMultipliers });
    revenue += c * p.price;
    clicks += c;
    rows.push(Object.freeze({
      slot: j + 1,
      id: ordered[j].id,
      name: ordered[j].name,
      bid: ordered[j].bid,
      quality: ordered[j].quality,
      score: ordered[j].score,
      maySwap: ordered[j].maySwap,
      price: p.price,
      priceBasis: p.basis,
      priceSetBy: p.setBy,
      capBinds: p.capBinds,
      clicks: c,
      revenue: c * p.price,
      discountOffBid: ordered[j].bid - p.price,
    }));
  }

  const unplaced = ordered.slice(filled).map((row) => Object.freeze({
    id: row.id, name: row.name, bid: row.bid, quality: row.quality,
    score: row.score, rank: row.rank,
  }));

  return Object.freeze({
    ordered,
    slotsFilled: filled,
    rows: Object.freeze(rows),
    unplaced: Object.freeze(unplaced),
    revenue,
    clicks,
    avgPricePerClick: clicks > 0 ? revenue / clicks : null,
    settings: Object.freeze({
      impressions, slots, rankingRule, pricingRule, increment, reserve,
      gamma, rgspBand,
      positionMultipliers: Object.freeze(positionMultipliers.slice()),
    }),
  });
}

/**
 * What the same winners would pay at first price ON THE SAME BIDS.
 *
 * THIS IS A COUNTERFACTUAL AND IT IS THE MOST COMMON WAY TO MAKE A
 * FIRST-PRICE AUCTION LOOK LIKE FREE MONEY (build note 4). Nobody re-bids in
 * it, which is the one thing every bidder would do. The return carries
 * `counterfactual: true` and readouts.js refuses to print it without the label.
 */
export function payYourBidAtFrozenBids(result) {
  const usd = result.rows.reduce((sum, r) => sum + r.clicks * r.bid, 0);
  return Object.freeze({
    usd,
    counterfactual: true,
    why: 'the same winners, the same bids, nobody re-bidding',
  });
}

/* ------------------------------------------------------------------ *
 * 6 · THE CLOSED-FORM PANELS
 * ------------------------------------------------------------------ */

/**
 * ex-4: one slot, n bidders, values uniform on [0, V].
 *
 * Second price: truthful bidding is dominant, so the seller collects the
 * expected second-highest value, V*(n-1)/(n+1).
 * First price: the symmetric equilibrium bid is v*(n-1)/n, so the seller
 * collects E[max] * shading = V*n/(n+1) * (n-1)/n.
 *
 * The two are the same number for every n. That is the whole panel.
 */
export function sealedBidPanel({ n, ceiling = 10, shading = null } = {}) {
  need(n, 'bidder count', 'sealedBidPanel');
  need(ceiling, 'value ceiling', 'sealedBidPanel');
  const equilibriumShading = (n - 1) / n;
  const s = shading == null ? equilibriumShading : shading;
  const expectedMax = (ceiling * n) / (n + 1);
  const secondPrice = (ceiling * (n - 1)) / (n + 1);
  const firstPrice = expectedMax * s;
  return Object.freeze({
    n, ceiling,
    shading: s,
    equilibriumShading,
    atEquilibrium: Math.abs(s - equilibriumShading) < 1e-12,
    expectedMax,
    secondPrice,
    firstPrice,
    difference: firstPrice - secondPrice,
    ratio: secondPrice === 0 ? null : firstPrice / secondPrice,
  });
}

/**
 * ex-5 part A and the calibrated setting: the squashing markup in closed form.
 *
 *   markup = (q_next / q_own) ^ (gamma - 1)
 *
 * The same ad, in the same slot, for the same user, at a different price.
 */
export function squashMarkup({ qNext, qOwn, gamma }) {
  need(qNext, 'runner-up quality', 'squashMarkup');
  need(qOwn, 'own quality', 'squashMarkup');
  need(gamma, 'gamma', 'squashMarkup');
  return Math.pow(qNext / qOwn, gamma - 1);
}

/** ex-6: one launch of the disclosed size, after the disclosed stickage. */
export function formatLaunch({ lift = 0.15, stickage = 0.5, launches = 1 } = {}) {
  const durable = lift * stickage;
  return Object.freeze({
    lift, stickage, durable, launches,
    perLaunchMultiplier: 1 + durable,
    compounded: Math.pow(1 + durable, launches),
  });
}

/** ex-6: the uplift ON THE BASE implied by format pricing being `share` of RPM. */
export function upliftOnBase(share) {
  need(share, 'share of RPM', 'upliftOnBase');
  const counterfactual = 100 * (1 - share);
  return Object.freeze({
    share, counterfactualIndex: counterfactual,
    uplift: (100 - counterfactual) / counterfactual,
  });
}

/** ex-7: two knobs stacked, durable rGSP against one format-price launch. */
export function stackKnobs({ rgspLift, rgspStickage, formatLift, formatStickage }) {
  return (1 + rgspLift * rgspStickage) * (1 + formatLift * formatStickage);
}

export default {
  mintCast, rankingView, deliveryView, rank, score, priceForSlot, clicksForSlot,
  runAuction, payYourBidAtFrozenBids, sealedBidPanel, squashMarkup, formatLaunch,
  upliftOnBase, stackKnobs, RANKING_RULES, PRICING_RULES, EngineError, LeakError,
};
