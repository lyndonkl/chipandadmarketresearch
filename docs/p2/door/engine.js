/**
 * docs/p2/door/engine.js — the distribution arithmetic.
 *
 * Team B5. The one file where the door's numbers are worked out.
 *
 * ======================================================================
 * THREE RULES THIS FILE ENFORCES, AND WHY EACH ONE IS CODE
 *
 * 1 · NOTHING HERE HAS A DEFAULT.
 *
 * The auction bench found the same defect at two layers: `runAuction` defaulted
 * the position multipliers, the increment and the reserve, and `scenarios.js`
 * defaulted six more — and every one of those literals was exactly what the
 * record carries. Delete the setting and the bench rendered the record's own
 * numbers, with a green gate, and nothing said the input had gone missing. A
 * fallback that equals the record is not a fallback. It is a second,
 * unversioned copy of the record kept in a source file.
 *
 * So `setting()` throws, names the setting and names the file it comes from.
 *
 * 2 · THE THREE CUPS SUM TO THE DOLLAR, AND THE SUM IS CHECKED.
 *
 * The drawing's centre is three open cups on one baseline: what goes back out
 * through the door, what answering the search costs, and what the buyer keeps.
 * Three lengths on one baseline is a claim that they are parts of one whole,
 * and a drawing that makes that claim while the parts do not add up is a
 * drawing that lies with its geometry. `doorSplit` refuses to return a split
 * that does not close.
 *
 * The kept cup is allowed to be NEGATIVE and is drawn below the baseline. At
 * the 91 per cent ratio Google actually recognised in 2002 the network ran at a
 * loss per thousand queries, and that is example X8's own third result.
 *
 * 3 · BUILD NOTE 10 IS A GUARD, NOT A COMMENT.
 *
 *   "The distribution arithmetic uses the FILED 2002 advertising-revenue figure
 *    of $410.915m (web $306.978m + network $103.937m, FY2004 10-K).
 *    data/eras/era-6.json derives $410.946m, a $31k discrepancy... The era
 *    record is the one that is wrong; do not reconcile the simulator to it."
 *
 * `assertFiledTotalsClose` re-adds the two filed components against the filed
 * total on the record's own table, every time the engine loads. If the table
 * ever drifts to the era record's figure the bench stops rather than quietly
 * carrying a $31k error into every per-query number derived from it.
 * ======================================================================
 */

import * as guards from '../lib/guards.js';
import { scenarioRecord, resolveSettings, settingsProvenance } from '../auction/panels.js';
import {
  mintLevel, mintShare, mintContested, FigureError,
} from './figures.js';
import { assertSettlement } from './wheel.js';

export { scenarioRecord, resolveSettings, settingsProvenance };

export class DoorEngineError extends Error {
  constructor(message, detail = null, fix = null) {
    super(fix ? `${message}\n  FIX: ${fix}` : message);
    this.name = 'DoorEngineError';
    this.detail = detail;
    this.fix = fix;
  }
}

const finite = (v) => typeof v === 'number' && Number.isFinite(v);

/* ------------------------------------------------------------------ *
 * 1 · SETTINGS, WITH NO DEFAULTS ANYWHERE
 * ------------------------------------------------------------------ */

/** A setting this engine will not guess. See rule 1 in the header. */
export function setting(settings, key, where, check = (v) => v != null) {
  const value = settings ? settings[key] : undefined;
  if (!check(value)) {
    throw new DoorEngineError(
      `${where} has no "${key}", and this engine does not guess one. A literal standing in for a ` +
      'missing setting renders the record\'s own numbers with a green gate and says nothing ' +
      'about the input that went missing.',
      { key, settings: settings ? Object.keys(settings) : settings },
      `set "${key}" in this scenario's settings in simulator-params.json`
    );
  }
  return value;
}

export const isNumber = (v) => finite(v);
export const isNumberList = (v) => Array.isArray(v) && v.length > 0 && v.every(finite);

/**
 * A SETTING THAT MUST BE THE SCENARIO'S OWN.
 *
 * The auction bench's sc-07 taught this: inheritance is a substitution, and one
 * of them silently removes the whole subject of the panel. On this bench the
 * equivalents are `illustrative` inputs. D6 inherits nothing today, but D5, D6,
 * D10 and D11 each declare their own invented inputs, and a scenario that
 * inherited them would be standing on somebody else's invention while its own
 * caption named it.
 */
export function ownSetting(id, key, params, where) {
  const from = settingsProvenance(id, params);
  if (from[key] !== id) {
    throw new DoorEngineError(
      `${where} reads "${key}" and the value it would get was supplied by ` +
      `"${from[key] || 'nothing at all'}". An invented input has to be the scenario's own: a ` +
      'panel standing on another scenario\'s invention while its own caption names the ' +
      'invention is a caption about a number that is not on screen.',
      { id, key, suppliedBy: from[key] || null },
      `declare "${key}" in ${id}'s own settings in simulator-params.json`
    );
  }
  return resolveSettings(id, params)[key];
}

/* ------------------------------------------------------------------ *
 * 2 · THE FILED TABLE
 * ------------------------------------------------------------------ */

function distributionEngine(mechanism) {
  const engine = mechanism && mechanism.engines && mechanism.engines.distribution;
  if (!engine) {
    throw new DoorEngineError(
      'mechanism.json holds no engines.distribution, so this bench has no record to stand on.',
      null, 'load the frozen mechanism.json — guards.loadFrozen() does it'
    );
  }
  return engine;
}

/** The filed year, out of `tac_series.table_usd_millions`. Read, never typed. */
export function tacRow(mechanism, year) {
  const table = distributionEngine(mechanism).tac_series.table_usd_millions || [];
  const row = table.find((r) => r.year === year);
  if (!row) {
    throw new DoorEngineError(
      `the tac_series table has no row for ${year}.`,
      { year, years: table.map((r) => r.year) },
      'this bench draws the years the record filed and no others'
    );
  }
  return row;
}

/** The whole filed table, for a drawing that walks it. */
export function tacTable(mechanism) {
  return Object.freeze([...(distributionEngine(mechanism).tac_series.table_usd_millions || [])]);
}

/** The network-share table, which is where the three bases live. */
export function networkShareRow(mechanism, year) {
  const table = distributionEngine(mechanism).network_share.table || [];
  const row = table.find((r) => r.year === year);
  if (!row) {
    throw new DoorEngineError(
      `the network_share table has no row for ${year}.`,
      { year, years: table.map((r) => r.year) }
    );
  }
  return row;
}

/**
 * BUILD NOTE 10, AS A GUARD.
 *
 * The two filed components must still add to the filed total on the record's
 * own table. If the table ever drifts to the era record's $410.946m the bench
 * stops, because every per-query figure downstream of it inherits the error and
 * nothing on screen would say so.
 */
export function assertFiledTotalsClose(mechanism, tolerance = 5e-4) {
  const rows = tacTable(mechanism);
  const bad = [];
  for (const row of rows) {
    if (!finite(row.network_revenue) || !finite(row.owned_revenue) || !finite(row.advertising_revenue)) continue;
    const sum = row.network_revenue + row.owned_revenue;
    if (Math.abs(sum - row.advertising_revenue) > tolerance) {
      bad.push({ year: row.year, sum, filed: row.advertising_revenue, off: sum - row.advertising_revenue });
    }
  }
  if (bad.length > 0) {
    throw new DoorEngineError(
      `the filed advertising-revenue total no longer equals its own two components in ` +
      `${bad.map((b) => b.year).join(', ')}.`,
      bad,
      'simulator-params.json build note 10: the filed 2002 figure is $410.915m (web $306.978m ' +
      'plus network $103.937m). data/eras/era-6.json derives $410.946m and is the record that ' +
      'is wrong. Do not reconcile this bench to it.'
    );
  }
  if (rows.length === 0) {
    throw new DoorEngineError(
      'the tac_series table is empty, so this check passed by having nothing to check.', null,
      'an empty check is a failed check'
    );
  }
  return Object.freeze({ years: rows.length, checked: rows.filter((r) => finite(r.network_revenue)).length });
}

/**
 * THE TWO COPIES OF ONE CLAIM AGREE.
 *
 * The 31 `mech-*` calibrations sit in `mechanism.json` AND in `claims.json`.
 * Only `claims.json` carries a verdict, so that is the copy a mark is built
 * from — but the engine reads its notches and its table figures out of
 * `mechanism.json`. A repair applied to one file and not the other is invisible
 * in both. `../eras/era-plan.js` runs the same check over its 435; this is the
 * distribution engine's 31.
 */
export function assertClaimCopiesAgree(mechanism, claimsFile) {
  const file = claimsFile || guards.getFrozen('claims');
  const list = Array.isArray(file) ? file : (file && file.claims);
  if (!Array.isArray(list) || list.length === 0) {
    throw new DoorEngineError(
      'claims.json produced no claims, so this check would pass by having nothing to compare.',
      null, 'an empty check is a failed check'
    );
  }
  const byId = new Map(list.map((c) => [c.id, c]));
  const engine = distributionEngine(mechanism);
  const mine = new Map();
  const walk = (node) => {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (!node || typeof node !== 'object') return;
    const cal = node.calibration;
    if (cal && typeof cal.id === 'string' && !mine.has(cal.id)) mine.set(cal.id, cal);
    for (const value of Object.values(node)) walk(value);
  };
  walk(engine);
  if (mine.size === 0) {
    throw new DoorEngineError('engines.distribution carries no calibrations to compare.', null);
  }
  const disagree = [];
  const missing = [];
  for (const [id, cal] of mine) {
    const claim = byId.get(id);
    if (!claim) { missing.push(id); continue; }
    const same = claim.central === cal.central
      && Array.isArray(claim.ci80) && Array.isArray(cal.ci80)
      && claim.ci80[0] === cal.ci80[0] && claim.ci80[1] === cal.ci80[1];
    if (!same) disagree.push({ id, claims: [claim.central, claim.ci80], mechanism: [cal.central, cal.ci80] });
  }
  if (missing.length || disagree.length) {
    throw new DoorEngineError(
      `${disagree.length} claim(s) differ between mechanism.json and claims.json and ` +
      `${missing.length} are missing from claims.json.`,
      { disagree, missing },
      'a repair applied to one copy and not the other is invisible in both'
    );
  }
  return Object.freeze({ checked: mine.size });
}

/* ------------------------------------------------------------------ *
 * 3 · THE INSTRUMENT: TAC = max(s·R, G) AND ITS EXPOSURE
 * ------------------------------------------------------------------ */

/**
 * What the guarantee actually risks: `max(0, G - s·R)`.
 *
 * Not `G`. Example X2 and the FY2004 10-K's own escape clause. The instrument
 * is a floor price per DELIVERED query, so it is a bet on the partner's
 * traffic, not on the buyer's monetisation — and `delivers: false` collapses it
 * to zero for every guarantee size, which is D2.
 */
export function exposure({ guarantee, share, revenue, delivers }) {
  for (const [name, value] of [['guarantee', guarantee], ['share', share], ['revenue', revenue]]) {
    if (!finite(value)) throw new DoorEngineError(`exposure() needs a measured ${name}.`, { [name]: value });
  }
  if (typeof delivers !== 'boolean') {
    throw new DoorEngineError(
      'exposure() needs to be told whether the partner delivers. There is no default: the ' +
      'delivery contingency is the whole of break B1, and a default of true would quietly ' +
      'restore the unconditional bet the record says this instrument never was.',
      { delivers }, 'pass delivers: the scenario\'s own partner_delivers setting'
    );
  }
  if (!delivers) return 0;
  return Math.max(0, guarantee - share * revenue);
}

/** The cumulative partner revenue at which the guarantee stops binding: G/s. */
export function breakEven({ guarantee, share }) {
  if (!finite(guarantee) || !finite(share) || share === 0) {
    throw new DoorEngineError('breakEven() needs a measured guarantee and a non-zero share.',
      { guarantee, share });
  }
  return guarantee / share;
}

/* ------------------------------------------------------------------ *
 * 4 · THE THREE CUPS
 * ------------------------------------------------------------------ */

/**
 * A SPLIT OF ONE DOLLAR INTO THREE PARTS THAT ADD UP.
 *
 * Everything on this bench that is drawn as three lengths on one baseline comes
 * through here, and the sum is checked before the object exists. A drawing that
 * says "these are the parts of one dollar" while the parts do not add to one is
 * lying with its geometry, and no caption underneath takes that back.
 */
export function assertCupsClose(cups, context, tolerance = 5e-9) {
  const sum = cups.outTheDoor.value + cups.costToAnswer.value + cups.kept.value;
  if (Math.abs(sum - 1) > tolerance) {
    throw new DoorEngineError(
      `${context}: the three cups add to ${sum}, not to one dollar. Three lengths on one ` +
      'baseline is a claim that they are the parts of one whole.',
      { outTheDoor: cups.outTheDoor.value, costToAnswer: cups.costToAnswer.value, kept: cups.kept.value, sum }
    );
  }
  return cups;
}

/**
 * The filed split, for one side of the business in one filed year.
 *
 * `side` is `network` — the money that came in through the door — or `owned`,
 * the money that started on the buyer's own page. Every figure is a share of
 * THAT side's own advertising revenue, and the denominator is named on every
 * one of them, because the record quotes the same numerator over three
 * different denominators and calls all three correct (break B9).
 *
 * THE COST CUP IS THE SAME HEIGHT IN BOTH LANES, and that is not a coincidence
 * this drawing arranged: the record allocates non-TAC cost of revenues pro rata
 * to revenue, so cost over revenue is one number for both sides. What is left
 * is the door and what the buyer keeps, and the whole lesson is in those two.
 */
export function filedSplit(mechanism, { year, side, allocation = 1.0 }) {
  const row = tacRow(mechanism, year);
  const engine = distributionEngine(mechanism);
  const allSteps = engine.examples.flatMap((e) => e.steps || []);

  /* The non-TAC cost of revenues and the pro-rata denominator are both stored
   * steps in X6, and both are READ out of the record rather than typed. A
   * denominator typed here would be a second copy of a filed figure kept in a
   * source file, which is the defect this bench inherited a warning about. */
  const nonTacStep = allSteps.find((s) => typeof s.note === 'string'
    && /non-TAC cost of revenues/i.test(s.note));
  if (!nonTacStep) {
    throw new DoorEngineError(
      'mechanism.json no longer carries the non-TAC cost-of-revenues step, so the middle cup — ' +
      'what answering the search costs — has nothing behind it.', null
    );
  }
  const nonTacCost = nonTacStep.expected;
  const prorataStep = allSteps.find((s) => typeof s.note === 'string'
    && /pro-rata share of non-TAC cost/i.test(s.note));
  if (!prorataStep) {
    throw new DoorEngineError(
      'mechanism.json no longer carries the pro-rata cost step, which is where the denominator ' +
      'the cost cup is measured against is written down.', null
    );
  }
  const totalRevenue = Number(String(prorataStep.expr).split('/').pop().trim());
  if (!finite(totalRevenue) || totalRevenue <= 0) {
    throw new DoorEngineError(
      'the pro-rata cost step no longer ends in the total-revenue denominator it divides by.',
      { expr: prorataStep.expr }
    );
  }

  for (const [name, value] of [['adsense_tac', row.adsense_tac],
    ['distribution_tac', row.distribution_tac], ['network_revenue', row.network_revenue],
    ['owned_revenue', row.owned_revenue]]) {
    if (!finite(value)) {
      throw new DoorEngineError(
        `the tac_series row for ${year} carries no ${name}, so the three cups cannot be filled ` +
        'for that year. The record splits the TAC line from 2006 only, and a year without the ' +
        'split is an absence rather than a zero.',
        { year, row }
      );
    }
  }
  if (side !== 'network' && side !== 'owned') {
    throw new DoorEngineError(`"${side}" is not a side of this business.`, { side },
      'network — the money that came in through the door; or owned — the buyer\'s own page');
  }
  if (allocation !== 1 && allocation !== 0.5) {
    throw new DoorEngineError(
      `"${allocation}" is not an allocation this record carries. D4 stores two and only two — ` +
      'pro rata to revenue, and half pro rata with the freed cost falling on owned inventory — ' +
      'and it stores them as a two-position toggle rather than a free slider on purpose.',
      { allocation }
    );
  }

  const half = allocation === 0.5;
  const networkProrata = nonTacCost * row.network_revenue / totalRevenue;
  const revenue = side === 'network' ? row.network_revenue : row.owned_revenue;
  const paidOut = side === 'network' ? row.adsense_tac : row.distribution_tac;

  /* THE TWO ALLOCATIONS ARE NOT ONE FORMULA WITH A PARAMETER, and the record is
   * where that asymmetry comes from. At half allocation D4's own derivation
   * puts ALL the cost the network does not carry onto owned inventory:
   *   owned margin = (14413.826 - 654.7 - (2682.5 - 826.414.../2)) / 14413.826
   * so owned's cup at half is the whole remaining cost of revenues, not its own
   * pro-rata share plus a slice. Following the record beats being tidy. */
  const cost = side === 'network'
    ? networkProrata * allocation
    : (half ? nonTacCost - networkProrata / 2 : nonTacCost * row.owned_revenue / totalRevenue);
  const keptValue = revenue - paidOut - cost;

  const denominator = {
    value: revenue,
    label: side === 'network'
      ? `what the partner pages earned in ${year}`
      : `what the buyer's own pages earned in ${year}`,
  };

  const keptExpr = side === 'network'
    ? (half
      ? '(6714.688 - 5284.3 - (8621.5 - 5939.0) * 6714.688 / 21795.550 / 2) / 6714.688'
      : '(6714.688 - 5284.3 - (8621.5 - 5939.0) * 6714.688 / 21795.550) / 6714.688')
    : (half
      ? null
      : '(14413.826 - 654.7 - (8621.5 - 5939.0) * 14413.826 / 21795.550) / 14413.826');

  const outTheDoor = mintShare({
    numerator: {
      value: paidOut,
      label: side === 'network'
        ? `paid to the partner pages in ${year}`
        : `paid to be the front door in ${year}`,
    },
    denominator,
    role: 'take',
    label: side === 'network'
      ? 'what goes back out through the door'
      : 'what the buyer pays to be the door',
    ...(side === 'owned' && year === 2008
      ? { stepRef: '654.7 / 14413.826' }
      : { derivedFrom: `$${paidOut}m paid out, over the $${revenue}m this lane earned. ` +
          `Both are filed for ${year}` }),
  });
  const costToAnswer = mintShare({
    numerator: { value: cost, label: `what it cost to answer this lane's searches in ${year}` },
    denominator,
    label: 'what answering the search costs',
    derivedFrom: `the filed $${nonTacCost}m it cost to run the machines. ` +
      `${half ? 'Half of that falls on the lower lane and the rest on the upper one' : 'It is split in step with what each lane earned'}`,
  });
  const kept = mintShare({
    numerator: { value: keptValue, label: `what the buyer had left on this lane in ${year}` },
    denominator,
    label: 'what the buyer keeps',
    ...(keptExpr && year === 2008
      ? { stepRef: keptExpr }
      : { derivedFrom: 'what this lane earned, less what left by the door and less what it ' +
          'cost to answer. All three are filed for the same year' }),
  });
  return assertCupsClose(Object.freeze({
    kind: 'filed', side, year, allocation,
    outTheDoor, costToAnswer, kept,
    revenue, totalRevenue, nonTacCost,
  }), `the filed ${side} split for ${year}`);
}

/**
 * The contested split — the one the wheel drives.
 *
 * Per dollar of the partner surface's own advertising revenue: the wheel's
 * share leaves through the door, the serving cost is what answering the search
 * costs, and what is left is what the buyer keeps. Above the notch the record
 * actually recognised, what is left is negative, and the cup is drawn below the
 * baseline rather than clipped at zero.
 *
 * It takes a SETTLEMENT and not a share. See `figures.mintContested`.
 */
export function contestedSplit(settlement, { settings, id, servingCost, rpm }) {
  assertSettlement(settlement, 'contestedSplit');
  if (!finite(servingCost) || !finite(rpm) || rpm === 0) {
    throw new DoorEngineError('contestedSplit() needs the serving cost and the revenue per ' +
      'thousand queries, both from the scenario\'s own settings.', { servingCost, rpm });
  }
  const invented = ['rpm_buyer', 'serving_cost_per_1k'];
  /* The share itself is NOT an invented input. Every notch on the wheel is a
   * number the record contains, and each carries its own grade in
   * `settlement.notch`. What is invented is the pair of revenue-per-query
   * figures the other two cups are measured against, and those say so. */
  const outTheDoor = mintContested({
    settlement, role: 'take',
    label: 'what goes back out through the door',
    derivedFrom: 'the share the wheel settled on, out of what the partner\'s page earned',
  });
  const costShare = servingCost / rpm;
  const costToAnswer = mintShare({
    numerator: { value: servingCost, label: 'the cost of answering a thousand searches' },
    denominator: { value: rpm, label: 'what a thousand searches earn' },
    label: 'what answering the search costs',
    illustrative: true, invented, settings,
    derivedFrom: `$${servingCost.toFixed(2)} to answer a thousand searches, against the ` +
      `$${rpm.toFixed(2)} they earn. Both numbers are made up`,
  });
  const keptValue = 1 - settlement.share - costShare;
  const keptDollars = rpm - settlement.share * rpm - servingCost;
  /* The two ends of the record's own X8 tail are stored steps. Every other
   * notch is worked out here and says so. */
  const storedStep = nearlyEqual(settlement.share, 0.85)
    ? '10.00 - 0.85 * 10.00 - 1.00'
    : nearlyEqual(settlement.share, 0.91)
      ? '10.00 - 0.91 * 10.00 - 1.00'
      : null;
  const keptPerThousand = mintLevel({
    value: keptDollars, role: 'money',
    label: 'what the buyer keeps per thousand searches',
    unit: 'per 1,000 searches',
    illustrative: true, invented, settings,
    ...(storedStep
      ? { stepRef: storedStep }
      : { derivedFrom: `$${rpm.toFixed(2)} earned, less the ` +
          `${(settlement.share * 100).toFixed(1)}% the wheel settled on, less the $` +
          `${servingCost.toFixed(2)} it costs to answer them` }),
  });
  const kept = mintShare({
    numerator: { value: keptDollars, label: 'what the buyer has left per thousand searches' },
    denominator: { value: rpm, label: 'what a thousand searches earn' },
    label: 'what the buyer keeps',
    illustrative: true, invented, settings,
    derivedFrom: 'one dollar earned on the partner\'s page. Take out what leaves by the door, ' +
      'then what it costs to answer the search',
  });
  return assertCupsClose(Object.freeze({
    kind: 'contested', side: 'network', settlement, id,
    outTheDoor, costToAnswer, kept, keptPerThousand,
    keptIsNegative: keptValue < 0,
    revenue: rpm,
  }), `the contested split at ${(settlement.share * 100).toFixed(1)}%`);
}

function nearlyEqual(a, b) { return Math.abs(a - b) < 1e-9; }

/* ------------------------------------------------------------------ *
 * 5 · THE RIVAL'S BUDGET — WHY THE DOOR WENT WHERE IT WENT
 * ------------------------------------------------------------------ */

/**
 * The maximum feasible bid for a default IS the yield net of serving cost.
 *
 * Example X8. This is the coupling between the two engines and it is the reason
 * the wheel has a rival ceiling: a firm with lower revenue per query cannot
 * outbid for the door, whatever contract form it offers.
 */
export function budgets({ rpmBuyer, rpmRival, servingCost, share }) {
  for (const [name, value] of [['rpmBuyer', rpmBuyer], ['rpmRival', rpmRival],
    ['servingCost', servingCost], ['share', share]]) {
    if (!finite(value)) throw new DoorEngineError(`budgets() needs a measured ${name}.`, { [name]: value });
  }
  return Object.freeze({
    rivalMaxShare: (rpmRival - servingCost) / rpmRival,
    rivalMaxPayment: rpmRival - servingCost,
    buyerPayment: share * rpmBuyer,
    buyerNet: rpmBuyer - share * rpmBuyer - servingCost,
    partnerUplift: (share * rpmBuyer) / (rpmRival - servingCost),
    rivalWouldHaveToBid: (share * rpmBuyer) / rpmRival,
  });
}

/**
 * The filed lane ratio: how the buyer's advertising revenue split between its
 * own page and everybody else's.
 *
 * The drawing runs three dots down the upper lane for every one down the lower.
 * Three to one is a DRAWING CONVENTION and the figure beside it is the record's
 * own share, so a reader counting dots and a reader reading the number are
 * never handed two different facts. `laneRatio` returns both, and the caption
 * says which is which.
 */
export function laneRatio(mechanism, year) {
  const row = tacRow(mechanism, year);
  const ownedShare = row.owned_revenue / row.advertising_revenue;
  return Object.freeze({
    year,
    ownedShare,
    networkShare: row.network_revenue / row.advertising_revenue,
    exactRatio: row.owned_revenue / row.network_revenue,
    drawnUpper: 3,
    drawnLower: 1,
    convention: 'the drawing runs three dots down the upper lane for every one down the lower; ' +
      'the filed split is printed beside it',
  });
}

/* ------------------------------------------------------------------ *
 * 6 · THE MARK FOR A CLAIM THE RECORD WILL NOT LET US DRAW AS A POINT
 * ------------------------------------------------------------------ */

/**
 * The claim, out of `claims.json`, which is the only copy carrying a verdict.
 *
 * `../eras/` states the rule and this bench follows it: the mechanism file
 * supplies structure and the claim comes from the frozen record. A claim in one
 * and not the other is a throw rather than a fallback.
 */
export function claimById(id, claimsFile) {
  const file = claimsFile || guards.getFrozen('claims');
  const list = Array.isArray(file) ? file : (file && file.claims);
  const claim = (list || []).find((c) => c.id === id);
  if (!claim) {
    throw new DoorEngineError(
      `claims.json carries no claim "${id}".`, { id },
      'only claims.json supplies a claim, because it is the only copy carrying a verdict'
    );
  }
  return claim;
}

export default {
  setting, ownSetting, isNumber, isNumberList,
  tacRow, tacTable, networkShareRow, assertFiledTotalsClose, assertClaimCopiesAgree,
  exposure, breakEven, filedSplit, contestedSplit, assertCupsClose,
  budgets, laneRatio, claimById,
  scenarioRecord, resolveSettings, settingsProvenance,
  DoorEngineError, FigureError,
};
