/**
 * docs/p2/door/scenarios.js — eleven stops, three acts, one machine.
 *
 * Team B5. D1 to D11 out of `simulator-params.json`, in the order that teaches
 * rather than the order they are filed in.
 *
 * ======================================================================
 * THE ORDER, AND WHY IT IS NOT THE RECORD'S
 *
 * The record files these as D1 to D11 and its own numbering runs from the deal
 * outwards. A reader meeting this bench has never seen the machine, so the
 * machine goes first and the deal comes second.
 *
 *   ACT ONE · THE TWO LANES        D4  D5  D6  D9
 *     What a search is worth depending on whose page it started on, why the
 *     share is the number it is, what happens at the number the buyer actually
 *     recognised, and the one defence of the whole arrangement that nobody ever
 *     measured.
 *
 *   ACT TWO · WHAT THE DOOR COST   D1  D2  D10  D3
 *     The headline guarantee and what it actually risked, the clause that voids
 *     it, what the accounts say it really cost, and the instrument nobody
 *     counts.
 *
 *   ACT THREE · WHAT IT BOUGHT     D7  D11  D8
 *     How much of the growth the door explains, what the relationship returned,
 *     and what the same instrument became twenty years later.
 *
 * ======================================================================
 * THREE CENTRE FORMS AND NO FOURTH
 *
 *   machine  the two lanes, the door, the valve, the three cups.  D2 D4 D5 D6 D9
 *   bars     filed dollars on one baseline, each naming its base. D3 D7 D8 D10 D11
 *   curve    the exposure band, with no line down the middle.     D1
 *
 * A fourth form would be a fourth thing to learn.
 *
 * ======================================================================
 * EVERY FIGURE NAMES ITS STEP
 *
 * `build` returns `readout` — the permanent money zone — and `figures`, the
 * ledger. Both are minted by `figures.js` and both go to the gate through
 * `viewFigures`, so the till and the ledger are checked against one record by
 * one call. The auction bench learned that the hard way: its gate read the
 * ledger only, and the money zone printed $361.00 while the band marker sat at
 * $440 with the gate green.
 * ======================================================================
 */

import * as guards from '../lib/guards.js';
import { planClaimMark, verdictRegister, verdictStamps, assertVerdictsVisible }
  from '../charts/claim-marks.js';
import {
  mintLevel, mintShare, mintSplit, splitSentence, isSplit, figureRow, figureText, percent,
} from './figures.js';
import {
  setting, ownSetting, isNumber, exposure, breakEven, filedSplit, contestedSplit,
  budgets, laneRatio, claimById, scenarioRecord, resolveSettings, DoorEngineError,
} from './engine.js';
import { assertRivalIsPresent } from './wheel.js';
import { planMachine, planBars, planCurve } from './drawing.js';

/* ------------------------------------------------------------------ *
 * SMALL HELPERS
 * ------------------------------------------------------------------ */

/** A written derivation, for a figure the record does not store. */
const worked = (formula) => ({ derivedFrom: formula });
/** A stored step, cited. A typo here becomes a derived figure the gate counts. */
const step = (expr) => ({ stepRef: expr });

const M = (v) => `$${v.toLocaleString('en-US', { maximumFractionDigits: 3 })}m`;
/** A generated sentence that starts a paragraph starts with a capital. */
const cap = (s) => (typeof s === 'string' && s ? s[0].toUpperCase() + s.slice(1) : s);

/**
 * THE ABSENCE THAT IS ON EVERY STOP.
 *
 * Break B5. Syndication is defended on the ground that more inventory attracts
 * more advertisers, which deepens the auction and raises the price of the
 * buyer's OWN clicks. Google never disclosed advertiser counts, per-keyword
 * auction depth or owned-site CPCs, and the era-6 advertiser-count claim is
 * grade C over 550,000 to 2.6 million.
 *
 * So it is drawn as a stippled pipe in all eleven states and it is never
 * filled. The reader never sees a complete machine, which is the honest
 * picture: the load-bearing economic argument for the whole arrangement has no
 * public measurement.
 */
const ABSENCE = Object.freeze({
  label: 'the deeper advertiser pool — the one defence nobody could measure',
  note: 'break B5. The buyer never said how many advertisers it had, how deep each auction ' +
    'ran, or what a click on its own pages cost. So no public number can say whether the door ' +
    'raised those prices',
});

/**
 * The lane model every `machine` stop hands the drawing.
 *
 * The three-to-one dot count is a DRAWING CONVENTION and `laneRatio` says so;
 * the filed share is printed beside it, so a reader counting dots and a reader
 * reading the number are never handed two different facts.
 */
function machineModel({
  mechanism, cups, side, doorTo, doorNote = null,
  ghost = null, ghostLabel = null, baselineLabel,
}) {
  const ratio = laneRatio(mechanism, 2002);
  /* MINTED, NOT BUILT. `planMachine` re-checks the three cups on the values the
   * drawing is about to turn into lengths, refuses a negative take, and refuses
   * a printed figure that is not the drawn one. */
  return planMachine({
    side,
    lanes: {
      drawnUpper: ratio.drawnUpper,
      drawnLower: ratio.drawnLower,
      sentence: `In 2002 ${percent(ratio.ownedShare, 1)} of the buyer's advertising revenue came ` +
        `off its own pages and ${percent(ratio.networkShare, 1)} came through the door. The dot ` +
        'count is a drawing convention rounded to three to one.',
    },
    door: { to: doorTo },
    doorNote,
    cups,
    cupText: {
      outTheDoor: figureText(cups.outTheDoor),
      costToAnswer: figureText(cups.costToAnswer),
      kept: figureText(cups.kept),
    },
    ghost, ghostLabel,
    baselineLabel,
    absence: ABSENCE,
  });
}

/**
 * THE SENTENCE A SHUT DOOR NEEDS ON A CONTESTED STOP.
 *
 * The swing is an event with a length: the reach below the standing bid, the
 * empty lane, the wheel coming back. The cups on the same drawing are the rate
 * the wheel came back TO, and saying so is what stops the picture contradicting
 * itself while the door is over.
 */
const REFUSAL_NOTE = 'You reached below the rival\'s standing bid, and for as long as you were ' +
  'down there those searches went to the rival. The wheel came back. The cups hold the share it ' +
  'came back to.';

/* ------------------------------------------------------------------ *
 * THE REPORTED GUARANTEE, READ ONCE, IN ONE PLACE
 *
 * D1 read `mech-aol-001` through `planClaimMark` and drew the band the guard
 * gave it. D3 and D10 typed `lo: 75, hi: 150` into their own bars and their own
 * splits, and typed the sentence "the record's range is wider than 60% of its
 * own middle value" underneath. So narrowing the claim — the ordinary result of
 * a verification round — made D1 refuse to draw and left D3 and D10 printing
 * the stale range under a sentence that had become false. Three copies of one
 * reading is three chances to be wrong about it.
 *
 * There is one copy now, and the sentence is generated from the live ratio and
 * the live cut, so a narrowed claim changes what is printed rather than making
 * it a lie.
 * ------------------------------------------------------------------ */

function reportedGuarantee(ctx, register, label) {
  const claim = claimById('mech-aol-001', ctx.claims);
  const mark = planClaimMark(claim, { register, label, year: claim.about_year });
  if (mark.kind !== 'span') {
    throw new DoorEngineError(
      'the reported guarantee is no longer a span-only claim at the live cut, and three stops on ' +
      'this bench draw a range with no middle because it is one. Re-plan, or draw it as the ' +
      'point the cut now allows.',
      { kind: mark.kind, ratio: mark.ratio }
    );
  }
  return mark;
}

/** Why this reading has no middle, in the live numbers rather than in prose. */
function guaranteeBecause(mark) {
  return `the record's range on this claim is ${percent(mark.ratio, 0)} of its own middle value, ` +
    `wider than the ${percent(guards.RULES.wideIntervalRatio, 0)} a point is allowed to stand ` +
    'for, so this bench draws the range and no middle. The contract was never filed.';
}

/** The reported guarantee as a split, for the money zone. One shape, three stops. */
function guaranteeSplit(mark) {
  return mintSplit({
    label: 'the reported guarantee',
    of: 'as the record\'s own 80% interval carries it',
    because: guaranteeBecause(mark),
    high: mintLevel({
      value: mark.hi, role: 'filed', unit: 'million', label: 'the top of the reported range',
      ...worked('the top of the 80% interval the record carries on the reported guarantee'),
    }),
    low: mintLevel({
      value: mark.lo, role: 'filed', unit: 'million', label: 'the bottom of the reported range',
      ...worked('the bottom of the 80% interval the record carries on the reported guarantee'),
    }),
  });
}

/** And as a span bar, with both ends ticked and nothing between them. */
function guaranteeBar(mark, { label, basis }) {
  return {
    kind: 'span', lo: mark.lo, hi: mark.hi, role: 'money',
    label, basis, figureText: `${M(mark.lo)}–${M(mark.hi)}`,
  };
}

/**
 * Every figure a view puts on screen, in ONE list, for ONE gate.
 *
 * A BAND IS TWO FIGURES AND BOTH GO THROUGH. A split has no scalar of its own,
 * so the gate would have nothing to check if it were passed as one row — and a
 * quantity the reader can read off the drawing that no gate ever looked at is
 * exactly the shape the auction bench found in its money zone. Both ends are
 * minted figures with their own provenance, and both are checked.
 */
export function viewFigures(view) {
  const rows = [];
  const push = (figure) => {
    if (isSplit(figure)) { rows.push(figureRow(figure.high), figureRow(figure.low)); return; }
    rows.push(figureRow(figure));
  };
  for (const figure of view.readout || []) push(figure);
  for (const figure of view.figures || []) push(figure);
  return rows;
}

/* ------------------------------------------------------------------ *
 * ACT ONE · THE TWO LANES
 * ------------------------------------------------------------------ */

const D4 = {
  id: 'D4-owned-vs-syndicated-retention',
  act: 1,
  short: 'two lanes, one dollar',
  centre: 'machine',
  teaches: 'A dollar that starts on somebody else\'s page is a different business from a dollar ' +
    'that starts on your own. In 2008 the buyer kept 95.5 cents of one and 21.3 cents of the other.',
  controls(ctx) {
    return [
      {
        id: 'lane', kind: 'rocker', label: 'fill the cups from',
        options: [
          { value: 'network', label: 'the lower lane' },
          { value: 'owned', label: 'the upper lane' },
        ],
        note: 'Both lanes are always drawn. This says which one\'s dollar the three cups hold.',
      },
      {
        id: 'allocation', kind: 'rocker', label: 'what answering a search costs',
        options: setting(ctx.settings, 'nontac_cost_allocation', 'D4').map((v) => ({
          value: v, label: v === 1 ? 'pro rata to revenue' : 'half as much per syndicated search',
        })),
        note: 'The record carries two allocations and no slider between them. The claim has to ' +
          'hold under either, so both are here and neither is a middle.',
      },
    ];
  },
  build(state, ctx) {
    const year = setting(ctx.settings, 'year', 'D4', isNumber);
    const side = state.lane;
    const allocation = Number(state.allocation);
    const cups = filedSplit(ctx.mechanism, { year, side, allocation });
    const other = filedSplit(ctx.mechanism, {
      year, side: side === 'network' ? 'owned' : 'network', allocation,
    });
    const ownedRetention = mintShare({
      numerator: { value: 14413.826 - 654.7, label: 'what the buyer\'s own pages left it after paying to be the door' },
      denominator: { value: 14413.826, label: `what the buyer's own pages earned in ${year}` },
      label: 'what the buyer keeps of a dollar that starts on its own page',
      ...step('(14413.826 - 654.7) / 14413.826'),
    });
    const networkRetention = mintShare({
      numerator: { value: 6714.688 - 5284.3, label: 'what the partner pages left it after the share went out' },
      denominator: { value: 6714.688, label: `what the partner pages earned in ${year}` },
      label: 'what the buyer keeps of a dollar that comes through the door',
      ...step('(6714.688 - 5284.3) / 6714.688'),
    });
    const gap = mintLevel({
      value: ((14413.826 - 654.7) / 14413.826) / ((6714.688 - 5284.3) / 6714.688),
      role: 'multiple', label: 'how far apart the two lanes are on retention',
      ...step('((14413.826 - 654.7) / 14413.826) / ((6714.688 - 5284.3) / 6714.688)'),
    });
    const gap2002 = mintLevel({
      value: 1 / (1 - 0.91), role: 'multiple',
      label: 'how far apart they were in 2002, when the door took 91 cents',
      ...step('1 / (1 - 0.91)'),
    });
    const marginGap = mintLevel({
      value: ((14413.826 - 654.7 - (8621.5 - 5939.0) * 14413.826 / 21795.550) / 14413.826)
        / ((6714.688 - 5284.3 - (8621.5 - 5939.0) * 6714.688 / 21795.550) / 6714.688),
      role: 'multiple', label: 'how far apart they are once the cost of answering is counted',
      ...step('((14413.826 - 654.7 - (8621.5 - 5939.0) * 14413.826 / 21795.550) / 14413.826) / ((6714.688 - 5284.3 - (8621.5 - 5939.0) * 6714.688 / 21795.550) / 6714.688)'),
    });
    return {
      centre: 'machine',
      machine: machineModel({
        mechanism: ctx.mechanism, cups, side, doorTo: 'buyer',
        ghost: {
          outTheDoor: other.outTheDoor.value,
          costToAnswer: other.costToAnswer.value,
          kept: other.kept.value,
        },
        ghostLabel: side === 'network' ? 'the upper lane' : 'the lower lane',
        baselineLabel: side === 'network'
          ? `one dollar of ${year} network advertising revenue`
          : `one dollar of ${year} owned-site advertising revenue`,
      }),
      readout: [cups.outTheDoor, cups.costToAnswer, cups.kept],
      figures: [ownedRetention, networkRetention, gap, gap2002, marginGap],
      note: 'The middle cup is the same height in both lanes, because the record spreads the ' +
        'cost of answering a search across revenue. So the whole difference between the two ' +
        'lanes is the first cup and the third. The take rate is not a margin: the 21.3 cents ' +
        'still had to pay for the data centre.',
    };
  },
};

const D5 = {
  id: 'D5-yield-sets-the-distribution-budget',
  act: 1,
  short: 'who can afford the door',
  centre: 'machine',
  wheel: 'contested',
  teaches: 'The most anyone can pay for the door is what a search earns them, less what it ' +
    'costs to answer it. Whoever earns more per search can always outbid.',
  /**
   * NO CONTROL IN THE LEFT COLUMN. THE DRUM IS THE CONTROL.
   *
   * This stop used to declare a `wheel` control, which `bench.js` mounted as a
   * plain range input in the left column, 421 units above the drum and in a
   * different column — with a caption under it reading "This wheel is not yours
   * alone. The rival has a hand on it, and the shaded ground is where its
   * standing bid already beats you."
   *
   * That is the printed answer `DESIGN.md` rejected, placed at the exact point
   * of contact, on a control from which the reader could never see the drum
   * that answers it. Both are gone. The reader grabs the drum, and the
   * resistance, the pawl, the held ground and the ceiling stop are all in the
   * same object at the same moment.
   */
  controls() { return []; },
  build(state, ctx) {
    const settlement = ctx.wheel.current();
    assertRivalIsPresent(settlement, 'D5');
    const rpmBuyer = ownSetting(D5.id, 'rpm_buyer', ctx.params, 'D5');
    const rpmRival = ownSetting(D5.id, 'rpm_rival', ctx.params, 'D5');
    const servingCost = ownSetting(D5.id, 'serving_cost_per_1k', ctx.params, 'D5');
    const cups = contestedSplit(settlement, {
      settings: ctx.settings, id: D5.id, servingCost, rpm: rpmBuyer,
    });
    const b = budgets({ rpmBuyer, rpmRival, servingCost, share: settlement.share });
    const rivalCeiling = mintShare({
      numerator: { value: rpmRival - servingCost, label: 'what a thousand searches leave the rival' },
      denominator: { value: rpmRival, label: 'what a thousand searches earn the rival' },
      label: 'the most the rival can pay and still cover its costs',
      illustrative: true, invented: ['rpm_rival', 'serving_cost_per_1k'], settings: ctx.settings,
      ...step('(6.00 - 1.00) / 6.00'),
    });
    const rivalPayment = mintLevel({
      value: rpmRival - servingCost, role: 'money', unit: 'per 1,000 searches',
      label: 'the most the rival can hand over',
      illustrative: true, invented: ['rpm_rival', 'serving_cost_per_1k'], settings: ctx.settings,
      ...step('6.00 - 1.00'),
    });
    const uplift = mintLevel({
      value: b.partnerUplift, role: 'multiple',
      label: 'what the partner gains by switching, at the reported share',
      illustrative: true, invented: ['rpm_buyer', 'rpm_rival', 'serving_cost_per_1k'], settings: ctx.settings,
      ...(Math.abs(settlement.share - 0.85) < 1e-9
        ? step('(0.85 * 10.00) / (6.00 - 1.00)')
        : worked(`the buyer pays ${M(b.buyerPayment)} a thousand searches. The rival can find ` +
          `${M(b.rivalMaxPayment)}`)),
    });
    const wouldHaveToBid = mintLevel({
      value: b.rivalWouldHaveToBid, role: 'multiple',
      label: 'the share of its own revenue the rival would have to bid to match',
      illustrative: true, invented: ['rpm_buyer', 'rpm_rival'], settings: ctx.settings,
      ...(Math.abs(settlement.share - 0.85) < 1e-9
        ? step('(0.85 * 10.00) / 6.00')
        : worked(`the buyer pays ${M(b.buyerPayment)} a thousand searches. The rival earns ` +
          `${M(rpmRival)} from them`)),
    });
    const anchor = mintLevel({
      value: 0.91 - 384.6 / 667.7, role: 'points',
      label: 'the gap between what the two firms actually paid out in 2002',
      ...step('0.91 - 384.6 / 667.7'),
    });
    return {
      centre: 'machine',
      wheel: settlement,
      machine: machineModel({
        mechanism: ctx.mechanism, cups, side: 'network', doorTo: settlement.doorTo,
        doorNote: REFUSAL_NOTE,
        baselineLabel: 'one dollar of advertising revenue earned on the partner\'s surface',
      }),
      readout: [cups.outTheDoor, cups.costToAnswer, cups.kept, cups.keptPerThousand],
      figures: [rivalCeiling, rivalPayment, uplift, wouldHaveToBid, anchor],
      note: 'The rival earns less per search, so it can pay less for the door however the ' +
        'contract is written. The empirical part of this is the gap between what the two firms ' +
        'actually paid out in 2002, not the revenue-per-search figures, which are invented.',
    };
  },
};

const D6 = {
  id: 'D6-the-loss-leading-network',
  act: 1,
  short: 'the lane that ran at a loss',
  centre: 'machine',
  wheel: 'contested',
  teaches: 'Turn the wheel to the share the buyer actually recognised in 2002 and the last cup ' +
    'goes below zero. The lower lane lost money, and the upper lane paid for it.',
  /** The drum is the control here too. See D5. */
  controls() { return []; },
  build(state, ctx) {
    const settlement = ctx.wheel.current();
    assertRivalIsPresent(settlement, 'D6');
    const rpmBuyer = ownSetting(D6.id, 'rpm_buyer', ctx.params, 'D6');
    const servingCost = ownSetting(D6.id, 'serving_cost_per_1k', ctx.params, 'D6');
    const cups = contestedSplit(settlement, {
      settings: ctx.settings, id: D6.id, servingCost, rpm: rpmBuyer,
    });
    const ownedShare = mintShare({
      numerator: { value: 306.978, label: 'what the buyer\'s own pages earned in 2002' },
      denominator: { value: 410.915, label: 'every ad dollar the buyer earned in 2002' },
      label: 'the share of 2002 revenue that carried no revenue share at all',
      ...step('306.978 / 410.915'),
    });
    const atRecognised = mintLevel({
      value: 10.00 - 0.91 * 10.00 - 1.00, role: 'money', unit: 'per 1,000 searches',
      label: 'what the lower lane leaves at the ratio the buyer recognised in 2002',
      illustrative: true, invented: ['rpm_buyer', 'serving_cost_per_1k'], settings: ctx.settings,
      ...step('10.00 - 0.91 * 10.00 - 1.00'),
    });
    const atReported = mintLevel({
      value: 10.00 - 0.85 * 10.00 - 1.00, role: 'money', unit: 'per 1,000 searches',
      label: 'what it leaves at the reported share',
      illustrative: true, invented: ['rpm_buyer', 'serving_cost_per_1k'], settings: ctx.settings,
      ...step('10.00 - 0.85 * 10.00 - 1.00'),
    });
    return {
      centre: 'machine',
      wheel: settlement,
      machine: machineModel({
        mechanism: ctx.mechanism, cups, side: 'network', doorTo: settlement.doorTo,
        doorNote: REFUSAL_NOTE,
        baselineLabel: 'one dollar of advertising revenue earned on the partner\'s surface',
      }),
      readout: [cups.outTheDoor, cups.costToAnswer, cups.kept, cups.keptPerThousand],
      figures: [atReported, atRecognised, ownedShare],
      note: 'The top notch on the drum is the ratio the buyer actually booked in 2002. Nobody ' +
        'chose it as a target; it is what the negotiation left behind. ' +
        'A firm with no page of its own cannot run this at all. Three quarters of the ' +
        'buyer\'s 2002 advertising revenue came off inventory it paid nobody for, and that is ' +
        'what funded the lane that lost money.',
    };
  },
};

const D9 = {
  id: 'D9-liquidity-externality-toggle',
  act: 1,
  short: 'the pipe nobody measured',
  centre: 'machine',
  teaches: 'The strongest defence of the whole arrangement is that syndicated searches deepen ' +
    'the advertiser pool and raise prices on the buyer\'s own pages. Nobody ever measured it.',
  controls(ctx) {
    return [{
      id: 'elasticity', kind: 'rocker', label: 'the deeper advertiser pool · unmeasured',
      options: setting(ctx.settings, 'advertiser_pool_elasticity', 'D9').map((v) => ({
        value: v, label: v === 0 ? 'assume it does nothing' : 'assume it raises owned prices',
      })),
      note: 'A two-position toggle and never a slider. A slider between two positions implies ' +
        'a measured quantity in the middle, and there is no measurement here at all.',
    }];
  },
  build(state, ctx) {
    const cups = filedSplit(ctx.mechanism, { year: 2008, side: 'network', allocation: 1 });
    const contribution2002 = mintLevel({
      value: 103.937 - 0.91 * 103.937, role: 'filed', unit: 'million',
      label: 'what the lower lane contributed in 2002, after the revenue share',
      ...step('103.937 - 0.91 * 103.937'),
    });
    const cumulative = mintLevel({
      value: 4710.60933, role: 'filed', unit: 'million',
      label: 'what it contributed in total from 2002 to 2008',
      ...step('(103.937 - 0.91 * 103.937) + (628.600 - 526.5) + (1554.256 - 1228.7) + (2687.942 - 2114.9) + (4159.831 - 3134.6) + (5787.938 - 4543.0) + (6714.688 - 5284.3)'),
    });
    const cumulativeRevenue = mintLevel({
      value: 59073.653, role: 'filed', unit: 'million',
      label: 'all of the buyer\'s advertising revenue over the same seven years',
      ...step('410.915 + 1420.663 + 3143.288 + 6065.002 + 10492.628 + 16412.643 + 21128.514'),
    });
    const shareOfTop = mintShare({
      numerator: { value: 4710.60933, label: 'what the lower lane left after the share went out' },
      denominator: { value: 59073.653, label: 'every ad dollar the buyer earned in those seven years' },
      label: 'the lower lane\'s share of the era\'s top line, after the revenue share',
      ...step('((103.937 - 0.91 * 103.937) + (628.600 - 526.5) + (1554.256 - 1228.7) + (2687.942 - 2114.9) + (4159.831 - 3134.6) + (5787.938 - 4543.0) + (6714.688 - 5284.3)) / (410.915 + 1420.663 + 3143.288 + 6065.002 + 10492.628 + 16412.643 + 21128.514)'),
    });
    /* THE TOGGLE MOVES NO NUMBER, AND THAT IS THE WHOLE POINT.
     * Both positions produce the same figures, because no public source selects
     * between them. A toggle that moved a number here would be a claim that
     * somebody measured the thing break B5 says nobody measured. */
    const said = Number(state.elasticity) === 0
      ? 'At this position the 9 per cent take of 2002 is irrational on its own arithmetic: ' +
        `${M(103.937 - 0.91 * 103.937)} of contribution against a guarantee reported at ten ` +
        'times that.'
      : 'At this position the deeper advertiser pool raises prices on the buyer\'s own pages ' +
        'enough that the lower lane pays for itself through the upper one.';
    return {
      centre: 'machine',
      machine: machineModel({
        mechanism: ctx.mechanism, cups, side: 'network', doorTo: 'buyer',
        baselineLabel: 'one dollar of 2008 network advertising revenue',
      }),
      readout: [contribution2002, cumulative, shareOfTop],
      figures: [cumulativeRevenue],
      note: `${said} No public number chooses between the two positions, so neither figure on ` +
        'this stop moves when you press the other one. The stippled pipe on the drawing is ' +
        'that argument, and it stays stippled in every state of this bench.',
    };
  },
};

/* ------------------------------------------------------------------ *
 * ACT TWO · WHAT THE DOOR COST
 * ------------------------------------------------------------------ */

const D1 = {
  id: 'D1-guarantee-headline-vs-exposure',
  act: 2,
  short: 'the guarantee, and what it risked',
  centre: 'curve',
  teaches: 'The famous guarantee was larger than the whole company. It was also out of the ' +
    'money inside eighteen months, and the record will not let it be drawn as a single number.',
  controls(ctx) {
    return [{
      id: 'revenue', kind: 'range', label: 'partner revenue so far',
      min: 0, max: 600, step: 0.5, unit: 'm',
      stops: [65.9262, 117.6470588235, 300.47564],
      note: 'The filed points are marked on the axis. Everything between them is this bench ' +
        'working out a curve, not the record reporting one.',
    }];
  },
  build(state, ctx) {
    const share = setting(ctx.settings, 'revenue_share_s', 'D1', isNumber);
    const register = verdictRegister('the reported guarantee');
    /* G1 DECIDES THE KIND, AND NOTHING HERE SECOND-GUESSES IT. On this claim the
     * 80% interval runs $75m to $150m on a central of $100m — a ratio of 0.75,
     * over the 60% cut — so the mark carries no central and there is no number
     * on it to put a dot at. `reportedGuarantee` is the one reader of it. */
    const mark = reportedGuarantee(ctx, register, 'the reported guarantee');
    const revenue = Number(state.revenue);
    const exposureLo = exposure({ guarantee: mark.lo, share, revenue, delivers: true });
    const exposureHi = exposure({ guarantee: mark.hi, share, revenue, delivers: true });
    const guaranteeSpan = guaranteeSplit(mark);
    const nowSpan = mintSplit({
      label: 'what is still at risk at this point',
      of: `once the partner has generated ${M(revenue)} of revenue`,
      because: 'the guarantee it is worked out from has no middle value, so neither does this',
      high: mintLevel({
        value: exposureHi, role: 'money', unit: 'million', label: 'at the top of the range',
        ...worked(`the top of the reported range less ${percent(share, 0)} of ${M(revenue)}, ` +
          'floored at nothing'),
      }),
      low: mintLevel({
        value: exposureLo, role: 'money', unit: 'million', label: 'at the bottom of the range',
        ...worked(`the bottom of the reported range less ${percent(share, 0)} of ${M(revenue)}, ` +
          'floored at nothing'),
      }),
    });
    const evenAt = mintLevel({
      value: breakEven({ guarantee: 100, share }), role: 'filed', unit: 'million',
      label: 'the partner revenue at which the guarantee stops binding, at the reported figure',
      ...step('100 / 0.85'),
    });
    const filed2002 = mintLevel({
      value: 0.15 * 439.508, role: 'filed', unit: 'million',
      label: 'what the partner generated in 2002, about eight months of the agreement',
      ...step('0.15 * 439.508'),
    });
    const filed2003 = mintLevel({
      value: 0.16 * 1465.934, role: 'filed', unit: 'million',
      label: 'what it generated in 2003',
      ...step('0.16 * 1465.934'),
    });
    const reached = mintShare({
      numerator: { value: 0.15 * 439.508, label: 'revenue the partner generated in 2002' },
      denominator: {
        value: 100 / 0.85,
        label: 'what the partner had to bring in before the guarantee lapsed',
      },
      label: 'how much of the break-even the first partial year reached',
      ...step('(0.15 * 439.508) / (100 / 0.85)'),
    });
    const cleared = mintLevel({
      value: (0.15 * 439.508 + 0.16 * 1465.934) / (100 / 0.85), role: 'multiple',
      label: 'how far past break-even the first two years went',
      ...step('(0.15 * 439.508 + 0.16 * 1465.934) / (100 / 0.85)'),
    });
    const multiples = [
      ['100 / 86.426', 'the whole of the buyer\'s prior-year revenue'],
      ['100 / 33.589', 'the buyer\'s cash and short-term investments'],
      ['100 / 50.152', 'the buyer\'s book equity'],
      ['100 / 84.457', 'the buyer\'s total assets'],
      ['100 / 99.656', 'the entire profit the buyer would make that year'],
    ].map(([expr, what]) => mintLevel({
      value: evaluateStep(ctx.mechanism, expr),
      role: 'multiple', label: `the reported guarantee against ${what}`, ...step(expr),
    }));
    const xs = [];
    for (let r = 0; r <= 600; r += 10) xs.push(r);
    return {
      centre: 'curve',
      /* MINTED. `planCurve` refuses any mark that falls between the two edges
       * of the band — which is the single mark this stop exists to refuse: a
       * dot at the midpoint labelled "the reported guarantee, $100m". */
      curve: planCurve({
        x: { min: 0, max: 600, label: 'partner revenue generated so far, $m' },
        y: { min: 0, max: 160, label: 'still at risk, $m' },
        bandLo: xs.map((r) => [r, exposure({ guarantee: mark.lo, share, revenue: r, delivers: true })]),
        bandHi: xs.map((r) => [r, exposure({ guarantee: mark.hi, share, revenue: r, delivers: true })]),
        marks: [
          { x: 0.15 * 439.508, y: 0, label: 'filed 2002' },
          { x: 0.15 * 439.508 + 0.16 * 1465.934, y: 0, label: 'filed, through 2003' },
        ],
        cursor: { x: revenue, label: `${M(revenue)} generated` },
        note: 'Two curves and no line between them. The guarantee is a reported range, and the ' +
          'record refuses a point on it.',
      }),
      marks: [mark],
      register,
      readout: [guaranteeSpan, nowSpan],
      figures: [evenAt, filed2002, filed2003, reached, cleared, ...multiples],
      splits: [guaranteeSpan, nowSpan],
      note: 'The headline survives: the reported figure is larger than the buyer\'s whole prior ' +
        'year of revenue. The exposure does not. It needed $117.6m of partner revenue to become ' +
        'costless, the first eight months delivered 56 per cent of that, and the first two years ' +
        'cleared it two and a half times over. The record\'s own multiples are worked out at the ' +
        'reported $100m, which is the middle of a range this bench will not draw a mark on.',
    };
  },
};

/** Evaluate a stored step against the record, for a figure that must equal it. */
function evaluateStep(mechanism, expr) {
  const engine = mechanism && mechanism.engines && mechanism.engines.distribution;
  const found = (engine ? engine.examples : []).flatMap((e) => e.steps || [])
    .find((s) => s.expr === expr);
  if (!found) {
    throw new DoorEngineError(
      `"${expr}" is not a stored step in mechanism.json engines.distribution, and this bench ` +
      'does not compute a figure it has told the reader is filed.',
      { expr }
    );
  }
  return found.expected;
}

const D2 = {
  id: 'D2-delivery-contingency',
  act: 2,
  short: 'the clause that voids it',
  centre: 'machine',
  teaches: 'The guarantee was not a bet on the buyer\'s own monetisation. If the partner could ' +
    'not deliver searches, the buyer owed nothing at all.',
  controls(ctx) {
    return [
      {
        id: 'delivers', kind: 'rocker', label: 'does the partner deliver the searches',
        options: [{ value: true, label: 'yes' }, { value: false, label: 'no' }],
        note: 'This is the switch that turns a guarantee into a floor price per delivered search.',
      },
      {
        id: 'guarantee', kind: 'range', label: 'the size of the guarantee',
        min: 0, max: 300, step: 5, unit: 'm', stops: [75, 100, 150, 300],
        note: 'Move it anywhere. With the partner not delivering, what is at risk stays at ' +
          'nothing for every size.',
      },
    ];
  },
  build(state, ctx) {
    const share = setting(ctx.settings, 'revenue_share_s', 'D2', isNumber);
    const delivers = state.delivers === true || state.delivers === 'true';
    const guarantee = Number(state.guarantee);
    const cups = filedSplit(ctx.mechanism, { year: 2008, side: 'network', allocation: 1 });
    const atRisk = mintLevel({
      value: exposure({ guarantee, share, revenue: 0, delivers }),
      role: 'money', unit: 'million',
      label: 'what is at risk before the partner has generated anything',
      ...worked(delivers
        ? `the guarantee of ${M(guarantee)} with nothing generated against it yet`
        : 'nothing, because the contingency in the filing voids the guaranteed minimum entirely'),
    });
    const atRiskBig = mintLevel({
      value: exposure({ guarantee: 300, share, revenue: 0, delivers }),
      role: 'money', unit: 'million',
      label: 'and at three hundred million',
      ...worked(delivers
        ? 'the largest guarantee this control can reach, with nothing generated against it yet'
        : 'still nothing. It collapses rather than scaling, which is what a contingency does'),
    });
    const evenAt = mintLevel({
      value: breakEven({ guarantee: 100, share }), role: 'filed', unit: 'million',
      label: 'the partner revenue at which the reported guarantee stops binding',
      ...step('100 / 0.85'),
    });
    return {
      centre: 'machine',
      machine: machineModel({
        mechanism: ctx.mechanism, cups, side: 'network',
        doorTo: delivers ? 'buyer' : 'rival',
        /* A DIFFERENT SHUT DOOR FROM D5's AND D6's, and it says so. Here the
         * partner cannot deliver searches at all, so there is no lane to buy
         * and the guaranteed minimum is void; the cups are the filed 2008 rate
         * and they are on screen to be compared against, not to be read as
         * money moving while the door is shut. */
        doorNote: 'The partner cannot deliver the searches, so there is no lane to buy and the ' +
          'guaranteed minimum is void. The cups hold the filed 2008 rate, for comparison.',
        baselineLabel: 'one dollar of 2008 network advertising revenue',
      }),
      readout: [atRisk, atRiskBig],
      figures: [evenAt],
      note: 'The filing says it plainly: if a network member could not provide search queries, ' +
        'the buyer would not be obliged to make any guaranteed minimum payments to that member. ' +
        'So the instrument is a floor price per delivered search. It is a bet on the partner\'s ' +
        'traffic and not on the buyer\'s ability to sell against it.',
    };
  },
};

const D10 = {
  id: 'D10-guarantee-overhang-reconstruction',
  act: 2,
  short: 'what it really cost, year one',
  centre: 'bars',
  teaches: 'The contract was never filed, and the accounts still bracket it. The guarantee cost ' +
    'somewhere between $11.9m and $15.7m in its first year, not $100m.',
  controls(ctx) {
    return [{
      id: 'memberShare', kind: 'rocker', label: 'what the other members took',
      options: setting(ctx.settings, 'non_aol_member_share', 'D10').map((v) => ({
        value: v, label: percent(v, 0),
      })),
      note: 'Never disclosed. The record carries three values and every output on this stop is ' +
        'marked illustrative because of it.',
    }];
  },
  build(state, ctx) {
    ownSetting(D10.id, 'non_aol_member_share', ctx.params, 'D10');
    const register = verdictRegister('the reported guarantee');
    const mark = reportedGuarantee(ctx, register, 'the reported guarantee');
    const memberShare = Number(state.memberShare);
    const exprs = {
      0.6: '94.5 - 0.85 * (0.15 * 439.508) - 0.60 * (103.937 - 0.15 * 439.508)',
      0.65: '94.5 - 0.85 * (0.15 * 439.508) - 0.65 * (103.937 - 0.15 * 439.508)',
      0.7: '94.5 - 0.85 * (0.15 * 439.508) - 0.70 * (103.937 - 0.15 * 439.508)',
    };
    const expr = exprs[memberShare];
    if (!expr) {
      throw new DoorEngineError(
        `the record carries no reconstruction at a member share of ${memberShare}.`,
        { memberShare, known: Object.keys(exprs) }
      );
    }
    const overhang = mintLevel({
      value: evaluateStep(ctx.mechanism, expr), role: 'money', unit: 'million',
      label: 'what the guarantee actually cost in its first year',
      illustrative: true, invented: ['non_aol_member_share'], settings: ctx.settings,
      ...step(expr),
    });
    const partnerShare = mintShare({
      numerator: { value: 0.15 * 439.508, label: 'revenue the partner generated in 2002' },
      denominator: { value: 103.937, label: 'all of the buyer\'s 2002 network advertising revenue' },
      label: 'how much of the network one partner was',
      ...step('(0.15 * 439.508) / 103.937'),
    });
    const impliedTac = mintLevel({
      value: 0.91 * 103.937, role: 'filed', unit: 'million',
      label: 'the network cost implied by the disclosed ratio',
      ...step('0.91 * 103.937'),
    });
    const contractual = mintLevel({
      value: 0.85 * (0.15 * 439.508), role: 'filed', unit: 'million',
      label: 'what the reported share alone would have cost on that revenue',
      ...step('0.85 * (0.15 * 439.508)'),
    });
    const nonPartner = mintLevel({
      value: 103.937 - 0.15 * 439.508, role: 'filed', unit: 'million',
      label: 'the network revenue that came from everybody else',
      ...step('103.937 - 0.15 * 439.508'),
    });
    const headline = guaranteeSplit(mark);
    return {
      centre: 'bars',
      marks: [mark],
      register,
      bars: planBars({
        max: 160, unit: 'US dollars, millions, 2002',
        note: 'The headline everybody quotes, beside what the accounts say it cost.',
        bars: [
          guaranteeBar(mark, {
            label: 'the reported guarantee',
            basis: 'a range the record will not let us draw a point on',
          }),
          {
            kind: 'level', value: overhang.value, role: 'take',
            label: 'what it cost in its first year',
            basis: `reconstructed from the disclosed 91 per cent ratio, with the other members ` +
              `assumed to take ${percent(memberShare, 0)}`,
            figureText: figureText(overhang),
          },
          {
            kind: 'level', value: 0.85 * (0.15 * 439.508), role: 'take',
            label: 'what the reported share alone would have cost',
            basis: 'on the revenue the partner actually generated in 2002',
            figureText: M(0.85 * (0.15 * 439.508)),
          },
        ],
      }),
      readout: [overhang, headline],
      figures: [partnerShare, impliedTac, contractual, nonPartner],
      note: 'One partner was 63.4 per cent of the whole network, which is how a single deal ' +
        'moves the blended payout ratio to 91 per cent — three to six points above the reported ' +
        'share. The residual is the guarantee. And the ratio falling to 84 per cent in 2003, ' +
        'below the reported share itself, dates the month it stopped binding without anybody ' +
        'ever seeing the contract.',
    };
  },
};

const D3 = {
  id: 'D3-the-equity-leg',
  act: 2,
  short: 'the leg nobody counts',
  centre: 'bars',
  teaches: 'The cash guarantee is the number everybody quotes. The warrant beside it moved ' +
    'about eleven times as much, and it cost most in exactly the world where the buyer won.',
  controls(ctx) {
    return [{
      id: 'multiple', kind: 'range', label: 'how far the buyer\'s share price ran',
      min: 1, max: 100, step: 0.1, unit: 'x',
      stops: [29.2096224, 45, 52.4254395],
      note: 'The realised path was 52.4 times the warrant strike. Measured only to the offer ' +
        'price it was 29.2. The stops are those two and the record\'s own default between them.',
    }];
  },
  build(state, ctx) {
    const multiple = Number(state.multiple);
    const register = verdictRegister('the reported guarantee');
    const mark = reportedGuarantee(ctx, register, 'the cash guarantee everybody quotes');
    const strike = mintLevel({
      value: 21642985 / 7437452, role: 'money', label: 'what the warrant let the partner buy a share for',
      ...step('21642985 / 7437452'),
    });
    const dilution = mintShare({
      numerator: { value: 7437452, label: 'the shares under the warrant' },
      denominator: { value: 95542010 + 178980030, label: 'every share the buyer had at the end of 2004' },
      label: 'how much of the company went out of the door',
      ...step('7437452 / (95542010 + 178980030)'),
    });
    const realised = mintLevel({
      value: 188 + 925, role: 'filed', unit: 'million',
      label: 'what the partner booked on the warrant',
      ...step('188 + 925'),
    });
    const asMultiple = mintLevel({
      value: (188 + 925 + 21.643) / 100, role: 'multiple',
      label: 'the whole equity leg against the cash guarantee everybody quotes',
      ...step('(188 + 925 + 21.643) / 100'),
    });
    const atIpo = mintLevel({
      value: 7437452 * 85 / 1000000, role: 'filed', unit: 'million',
      label: 'what the warrant shares were worth at the offer price',
      ...step('7437452 * 85 / 1000000'),
    });
    const atThisMultiple = mintLevel({
      value: 21.643 * multiple / 100, role: 'multiple',
      label: 'the equity cost against the cash guarantee, at this share price',
      ...worked(`the ${M(21.643)} strike times ${multiple.toFixed(1)}, over the reported ` +
        'guarantee of a hundred million'),
    });
    const stillHeld = mintLevel({
      value: 7437452 - 2355559, role: 'count',
      label: 'shares the partner still held after the offering',
      ...step('7437452 - 2355559'),
    });
    return {
      centre: 'bars',
      marks: [mark],
      register,
      /* THE TOP OF SCALE HOLDS THE TALLEST BAR THIS CONTROL CAN REACH. It used
       * to be 1300 while the equity bar runs to $2,164.3m at 100x, so the
       * drawing put a rectangle through the top of its own frame and the reader
       * read a bar that had no top. `planBars` refuses a bar taller than the
       * scale now, which is how this was found. */
      bars: planBars({
        max: 2200, unit: 'US dollars, millions',
        note: 'A flat cash line, and an equity bar that rises with the buyer\'s own success.',
        bars: [
          guaranteeBar(mark, {
            label: 'the cash guarantee everybody quotes',
            basis: 'a reported range, never filed',
          }),
          {
            kind: 'level', value: 13.871, role: 'mechanism',
            label: 'what the warrant was carried at on the balance sheet',
            basis: 'the buyer\'s own books, through 2003',
            figureText: M(13.871),
          },
          {
            kind: 'level', value: 21.643 * multiple, role: 'take',
            label: 'what the equity leg transfers at this share price',
            basis: `the exercise price times ${multiple.toFixed(1)}`,
            figureText: M(21.643 * multiple),
          },
          {
            kind: 'level', value: 188 + 925, role: 'take',
            label: 'what it actually transferred',
            basis: 'the partner\'s own filed gains on the warrant',
            figureText: M(188 + 925),
          },
        ],
      }),
      readout: [atThisMultiple, realised, asMultiple],
      figures: [strike, dilution, atIpo, stillHeld],
      note: 'A warrant carried at $13.871m transferred about $1.13bn for 2.71 per cent of the ' +
        'company. Distribution paid for in equity looks cheap at signature and costs most in ' +
        'exactly the states of the world where the buyer succeeds. Drag the control and watch ' +
        'the bar rise: the better the buyer did, the more the door cost.',
    };
  },
};

/* ------------------------------------------------------------------ *
 * ACT THREE · WHAT IT BOUGHT
 * ------------------------------------------------------------------ */

const D7 = {
  id: 'D7-capture-attribution',
  act: 3,
  short: 'what the door explains',
  centre: 'bars',
  teaches: 'The door supplied about a third of the growth and about a tenth of the money that ' +
    'was left after paying for it. Both numbers are true, and they have different denominators.',
  controls(ctx) {
    return [{
      id: 'path', kind: 'rocker', label: 'which query estimate drives the split',
      options: setting(ctx.settings, 'query_denominator_path', 'D7').map((v) => ({
        value: v, label: v === 'high' ? 'the higher query count' : 'the lower query count',
      })),
      note: 'Two positions and no slider. Both estimates are grade C, so the answer is a band ' +
        'by construction and there is no middle value to slide to.',
    }];
  },
  build(state, ctx) {
    const growth = mintLevel({
      value: 21128.514 - 410.915, role: 'filed', unit: 'million',
      label: 'the growth in advertising revenue from 2002 to 2008',
      ...step('21128.514 - 410.915'),
    });
    /* THE THREE BASES, EACH A SHARE OF A DIFFERENT NAMED DENOMINATOR.
     * The record says all three are correct and that chapters must name the
     * basis every time. `mintShare` takes no ready-made value, so the basis
     * cannot come apart from the number. */
    const ofAdvertising = mintShare({
      numerator: { value: 6714.688, label: 'what the partner pages earned in 2008' },
      denominator: { value: 21128.514, label: 'every ad dollar the buyer earned in 2008' },
      label: 'the lower lane\'s share of advertising revenue',
      ...step('6714.688/21128.514'),
    });
    const ofTotal = mintShare({
      numerator: { value: 6714.688, label: 'what the partner pages earned in 2008' },
      denominator: { value: 21795.550, label: 'every dollar the buyer earned in 2008' },
      label: 'the lower lane\'s share of total revenue',
      ...step('6714.688/21795.550'),
    });
    const netOfTac = mintShare({
      numerator: { value: 6714.688 - 5284.3, label: 'what the partner pages left after the share went out' },
      denominator: { value: 21128.514 - 5939.0, label: 'every ad dollar left after paying for traffic' },
      label: 'the lower lane\'s share once the door has been paid for',
      ...step('(6714.688 - 5284.3) / (21128.514 - 5939.0)'),
    });
    const shareOfGrowth = mintShare({
      numerator: { value: 6714.688 - 103.937, label: 'the growth that came through the door' },
      denominator: { value: 21128.514 - 410.915, label: 'all the growth from 2002 to 2008' },
      label: 'the door\'s share of the growth',
      ...step('(6714.688 - 103.937) / (21128.514 - 410.915)'),
    });
    const high = Number(state.path === 'high');
    const volumeSplit = mintSplit({
      label: 'how much of the growth on the buyer\'s own pages was more searches rather than better prices',
      of: 'of the growth on the buyer\'s own pages, 2002 to 2007',
      because: 'both query estimates behind it are grade C, so the record gives two paths and ' +
        'no middle value. Never quote it as one number.',
      high: mintShare({
        numerator: { value: 1.994918, label: 'the log of the rise in searches, higher count' },
        denominator: { value: 3.544161, label: 'the log of the rise in owned-page revenue' },
        label: 'volume\'s share on the higher query estimate',
        ...step('1.994918 / 3.544161'),
      }),
      low: mintShare({
        numerator: { value: 1.843180, label: 'the log of the rise in searches, lower count' },
        denominator: { value: 3.544161, label: 'the log of the rise in owned-page revenue' },
        label: 'volume\'s share on the lower query estimate',
        ...step('1.843180 / 3.544161'),
      }),
    });
    const yieldSplit = mintSplit({
      label: 'and how much of it was better prices',
      of: 'of the growth on the buyer\'s own pages, 2002 to 2007',
      because: 'it is the complement of a band, so it is a band',
      high: mintShare({
        numerator: { value: 1.549883, label: 'the log of the rise in revenue a search, higher count' },
        denominator: { value: 3.544161, label: 'the log of the rise in owned-page revenue' },
        label: 'yield\'s share on the higher query estimate',
        ...step('1.549883 / 3.544161'),
      }),
      low: mintShare({
        numerator: { value: 1.701433, label: 'the log of the rise in revenue a search, lower count' },
        denominator: { value: 3.544161, label: 'the log of the rise in owned-page revenue' },
        label: 'yield\'s share on the lower query estimate',
        ...step('1.701433 / 3.544161'),
      }),
    });
    const paidFor = mintShare({
      numerator: { value: 654.7, label: 'what the buyer paid to be the door in 2008' },
      denominator: { value: 14413.826, label: 'what the buyer\'s own pages earned in 2008' },
      label: 'how much of the traffic to the buyer\'s own pages was bought',
      ...step('654.7 / 14413.826'),
    });
    const chosen = high ? volumeSplit.high : volumeSplit.low;
    return {
      centre: 'bars',
      bars: planBars({
        max: 0.7, unit: 'a share — and every bar here has a different denominator',
        note: 'One numerator, three denominators, three correct answers. This is why the record ' +
          'insists the basis is named every time.',
        bars: [
          {
            kind: 'level', value: ofAdvertising.value, role: 'money',
            label: 'of advertising revenue', basis: ofAdvertising.basis,
            figureText: figureText(ofAdvertising),
          },
          {
            kind: 'level', value: ofTotal.value, role: 'money',
            label: 'of total revenue', basis: ofTotal.basis,
            figureText: figureText(ofTotal),
          },
          {
            kind: 'level', value: netOfTac.value, role: 'money',
            label: 'once the door is paid for', basis: netOfTac.basis,
            figureText: figureText(netOfTac),
          },
          {
            kind: 'span', lo: volumeSplit.lo, hi: volumeSplit.hi, role: 'mechanism',
            label: 'growth from more searches',
            basis: 'of the growth on the buyer\'s own pages — a band, never a point',
            figureText: `${percent(volumeSplit.lo, 1)}–${percent(volumeSplit.hi, 1)}`,
          },
          {
            kind: 'span', lo: yieldSplit.lo, hi: yieldSplit.hi, role: 'mechanism',
            label: 'growth from better prices',
            basis: 'of the same growth — a band, never a point',
            figureText: `${percent(yieldSplit.lo, 1)}–${percent(yieldSplit.hi, 1)}`,
          },
        ],
      }),
      readout: [shareOfGrowth, netOfTac, chosen],
      figures: [growth, ofAdvertising, ofTotal, paidFor, volumeSplit.high, volumeSplit.low,
        yieldSplit.high, yieldSplit.low],
      splits: [volumeSplit, yieldSplit],
      note: 'The door supplied 31.9 per cent of the growth and 9.4 per cent of what was left ' +
        'after paying for it. Both are true. They answer different questions, and they are ' +
        'measured against different denominators. ' +
        `${cap(splitSentence(volumeSplit))} ${cap(splitSentence(yieldSplit))}`,
    };
  },
};

const D11 = {
  id: 'D11-what-the-deal-moved-and-returned',
  act: 3,
  short: 'moved, and returned',
  centre: 'bars',
  teaches: 'About $1.98bn of revenue went through the books, about $297m stayed. As an ' +
    'investment the relationship lost money. As a purchase of the door it worked.',
  controls(ctx) {
    return [{
      id: 'take', kind: 'rocker', label: 'what the buyer kept of the partner\'s revenue',
      options: [
        { value: 0.15, label: 'the complement of the reported share' },
        { value: 'network', label: 'the network-average rates instead' },
      ],
      note: 'The 15 per cent is invented — it is one minus the reported share. The record ' +
        'carries the network-average alternative so the conclusion can be checked against it.',
    }];
  },
  build(state, ctx) {
    ownSetting(D11.id, 'take_rate_partner', ctx.params, 'D11');
    const gross = mintLevel({
      value: 1977.99699, role: 'filed', unit: 'million',
      label: 'revenue the partner generated, 2002 to 2006',
      ...step('0.15 * 439.508 + 0.16 * 1465.934 + 0.12 * 3189.223 + 0.09 * 6138.560 + 0.07 * 10604.917'),
    });
    const atFlat = state.take !== 'network';
    const retained = atFlat
      ? mintLevel({
        value: 296.6995485, role: 'money', unit: 'million',
        label: 'what the buyer kept of it',
        illustrative: true, invented: ['take_rate_partner'], settings: ctx.settings,
        ...step('0.15 * (0.15 * 439.508 + 0.16 * 1465.934 + 0.12 * 3189.223 + 0.09 * 6138.560 + 0.07 * 10604.917)'),
      })
      : mintLevel({
        value: 370, role: 'money', unit: 'million',
        label: 'what the buyer kept of it, at the network-average rates',
        ...worked('the record works this out at the filed network rates of 9, 16, 21, 21 and ' +
          '25 per cent. At those the kept figure rises to about $370m'),
      });
    const againstWarrant = mintShare({
      numerator: { value: 296.6995485, label: 'what the buyer kept at a fifteen per cent take' },
      denominator: { value: 1134.643, label: 'the value the warrant handed over' },
      label: 'what was kept, against the equity that was given up',
      illustrative: true, invented: ['take_rate_partner'], settings: ctx.settings,
      ...step('0.15 * (0.15 * 439.508 + 0.16 * 1465.934 + 0.12 * 3189.223 + 0.09 * 6138.560 + 0.07 * 10604.917) / 1134.643'),
    });
    const lostLater = mintLevel({
      value: 1000 - 283, role: 'filed', unit: 'million',
      label: 'lost on the separate stake the buyer took in the partner four years later',
      ...step('1000 - 283'),
    });
    const versusRival = mintShare({
      numerator: { value: 628.600, label: 'what the partner pages earned in 2003' },
      denominator: { value: 667.700, label: 'the rival\'s whole 2002 revenue' },
      label: 'the lower lane in 2003, against the rival\'s whole company in 2002',
      ...step('628.600 / 667.700'),
    });
    return {
      centre: 'bars',
      bars: planBars({
        max: 2100, unit: 'US dollars, millions',
        note: 'What moved, what stayed, and what was handed over to move it.',
        bars: [
          {
            kind: 'level', value: 1977.99699, role: 'money',
            label: 'revenue the partner generated',
            basis: 'five years of disclosed partner share of total revenue',
            figureText: M(1977.99699),
          },
          {
            kind: 'level', value: retained.value, role: 'money',
            label: 'what the buyer kept',
            basis: atFlat ? 'at a fifteen per cent take, which is invented'
              : 'at the disclosed network-average take rates',
            figureText: M(retained.value),
          },
          {
            kind: 'level', value: 1134.643, role: 'take',
            label: 'equity handed over',
            basis: 'the value the warrant actually transferred',
            figureText: M(1134.643),
          },
          {
            kind: 'level', value: 1000 - 283, role: 'take',
            label: 'lost on the later stake',
            basis: 'a $1.0bn investment sold for $283m',
            figureText: M(1000 - 283),
          },
        ],
      }),
      readout: [gross, retained, againstWarrant],
      figures: [lostLater, versusRival],
      note: 'Judged as an investment the relationship lost money. Judged as a purchase of the ' +
        'door it worked: it took the largest access point in the country away from the rival, ' +
        'and within eighteen months the lower lane alone was 94 per cent the size of that ' +
        'rival\'s entire company.',
    };
  },
};

const D8 = {
  id: 'D8-composition-inversion',
  act: 3,
  short: 'the same instrument, twenty years on',
  centre: 'bars',
  teaches: 'The headline rate barely moved in twenty years. What it bought inverted: from ' +
    'other people\'s inventory to placement in front of the buyer\'s own.',
  controls(ctx) {
    return [{
      id: 'year', kind: 'rocker', label: 'which pair of years',
      options: [
        { value: 2008, label: '2008 against 2021' },
        { value: 2022, label: 'the headline rate, 2002 against 2022' },
      ],
      note: 'The record compares the composition at 2008 and 2021, and the headline rate at ' +
        '2002 and 2022. They are different pairs on different bases.',
    }];
  },
  build(state, ctx) {
    const claim = claimById('mech-mehta-004', ctx.claims);
    const register = verdictRegister('the sustained price increase the court found');
    const mark = planClaimMark(claim, {
      register, label: 'the price increase the buyer tested and held', year: claim.about_year,
    });
    const share2008 = mintShare({
      numerator: { value: 654.7, label: 'what was paid to be the front door in 2008' },
      denominator: { value: 5939.0, label: 'all the buyer paid for traffic in 2008' },
      label: 'the share of the cost that bought the buyer\'s own front door, 2008',
      ...step('654.7 / 5939.0'),
    });
    const share2021 = mintShare({
      numerator: { value: 26.3, label: 'paid for search defaults in 2021, in billions' },
      denominator: { value: 45.566, label: 'all that was paid for traffic in 2021, in billions' },
      label: 'the same share in 2021',
      ...step('26.3 / 45.566'),
    });
    const ratio = mintLevel({
      value: (26.3 / 45.566) / (654.7 / 5939.0), role: 'multiple',
      label: 'how much larger that share had become',
      ...step('(26.3 / 45.566) / (654.7 / 5939.0)'),
    });
    const growth = mintLevel({
      value: 26300 / 654.7, role: 'multiple',
      label: 'how much larger the money itself had become',
      ...step('26300 / 654.7'),
    });
    const rate2002 = mintShare({
      numerator: { value: 94.5, label: 'what the buyer paid for traffic in 2002' },
      denominator: { value: 410.915, label: 'every ad dollar it earned in 2002' },
      label: 'the headline rate in 2002',
      ...step('94.5 / 410.915'),
    });
    const rate2022 = mintShare({
      numerator: { value: 48955, label: 'what the buyer paid for traffic in 2022, in millions' },
      denominator: { value: 224473, label: 'every ad dollar it earned in 2022, in millions' },
      label: 'the headline rate in 2022',
      ...step('48955 / 224473'),
    });
    const foreclosed = mintShare({
      numerator: {
        value: 0.28 + 0.194 + 0.023,
        label: 'searches covered by the deals the court struck down',
      },
      denominator: { value: 1, label: 'every general search in the United States' },
      label: 'the share of searches the struck-down deals covered',
      ...step('0.28 + 0.194 + 0.023'),
    });
    const withChrome = mintShare({
      numerator: {
        value: 0.28 + 0.194 + 0.023 + 0.20,
        label: 'the same searches, with the buyer\'s own browser counted as well',
      },
      denominator: { value: 1, label: 'every general search in the United States' },
      label: 'and with the buyer\'s own browser counted too',
      ...step('0.28 + 0.194 + 0.023 + 0.20'),
    });
    const againstOpex = mintLevel({
      value: 26.3 / 19.5, role: 'multiple',
      label: 'the 2021 payments against what it cost to run search that year',
      ...step('26.3 / 19.5'),
    });
    const onComposition = Number(state.year) === 2008;
    return {
      centre: 'bars',
      bars: onComposition
        ? planBars({
          /* THE TOP OF SCALE IS THE WHOLE. These four bars are two pairs of
           * complements — what bought the front door and what bought everybody
           * else's inventory — so the scale is one. It was 0.7, and the 2008
           * complement is 89.0 per cent, which the drawing put through the top
           * of its own frame. `planBars` refuses that now. */
          max: 1, unit: 'a share of all traffic acquisition cost',
          note: 'The same line item, thirteen years apart. Each pair adds to the whole.',
          bars: [
            { kind: 'level', value: share2008.value, role: 'take', label: 'bought the front door, 2008',
              basis: share2008.basis, figureText: figureText(share2008) },
            { kind: 'level', value: 1 - share2008.value, role: 'mechanism', label: 'bought other people\'s inventory, 2008',
              basis: 'of all 2008 traffic acquisition cost', figureText: percent(1 - share2008.value, 1) },
            { kind: 'level', value: share2021.value, role: 'take', label: 'bought the front door, 2021',
              basis: share2021.basis, figureText: figureText(share2021) },
            { kind: 'level', value: 1 - share2021.value, role: 'mechanism', label: 'bought other people\'s inventory, 2021',
              basis: 'of all 2021 traffic acquisition cost', figureText: percent(1 - share2021.value, 1) },
          ],
        })
        : planBars({
          max: 0.3, unit: 'a share of the buyer\'s advertising revenue',
          note: 'The headline rate, twenty years apart. It barely moved.',
          bars: [
            { kind: 'level', value: rate2002.value, role: 'take', label: 'the headline rate, 2002',
              basis: rate2002.basis, figureText: figureText(rate2002) },
            { kind: 'level', value: rate2022.value, role: 'take', label: 'the headline rate, 2022',
              basis: rate2022.basis, figureText: figureText(rate2022) },
            { kind: 'span', lo: mark.lo / 100, hi: mark.hi / 100, role: 'mechanism',
              label: 'the price increase the buyer tested and held',
              basis: 'a court finding with no middle value in the record',
              figureText: `${percent(mark.lo / 100, 0)}–${percent(mark.hi / 100, 0)}` },
          ],
        }),
      marks: [mark],
      register,
      readout: onComposition ? [share2008, share2021, ratio] : [rate2002, rate2022, againstOpex],
      figures: onComposition
        ? [growth, foreclosed, withChrome, rate2002, rate2022]
        : [share2008, share2021, ratio, foreclosed, withChrome],
      note: 'The 2002 agreement is the small, early, cheap version of the instrument a court ' +
        'held illegal in 2024. Same rate, inverted composition, forty times the money. Once the ' +
        'defaults cover about half the searches in the country, later gains in price cannot be ' +
        'read as the auction working better — the court read them as power.',
    };
  },
};

/* ------------------------------------------------------------------ *
 * THE ELEVEN
 * ------------------------------------------------------------------ */

export const ACTS = Object.freeze([
  Object.freeze({ n: 1, title: 'the two lanes', what: 'what a search is worth, and who can afford the door' }),
  Object.freeze({ n: 2, title: 'what the door cost', what: 'the guarantee, the clause that voids it, and the leg nobody counts' }),
  Object.freeze({ n: 3, title: 'what it bought', what: 'how much of the growth the door explains, and what it became' }),
]);

export const STOPS = Object.freeze([D4, D5, D6, D9, D1, D2, D10, D3, D7, D11, D8]
  .map((stop, i) => Object.freeze({ ...stop, n: i + 1 })));

/**
 * MINT ONE STOP AGAINST THE FROZEN RECORD.
 *
 * G7 runs over the whole rendered object. These eleven scenarios declare the
 * rule `default_placement_deal`, which the record's own vocabulary marks
 * `ad_auction: false` — the placement is bought by private negotiation and it
 * is NOT the ad auction that runs on the surface. So this bench declares no
 * channel and no mechanism, and it must not: setting `channel: "search"` here
 * would put a distribution stop through `assertMechanism2019`, which is a check
 * about which auction runs where and has nothing to say about a contract.
 *
 * What G7 does enforce on these eleven is the caption test, and every one of
 * the nine `required_caption` entries in the D-series is a caveat the analysis
 * does not survive without: the take rate is an auction outcome, the split is a
 * band and never a flat 54 per cent, the RPMs are invented, the network share
 * has three bases. `requiredCaptions` reads them and the bench prints them.
 */
export function mintStop(id, { params, mechanism, captions = [] } = {}) {
  const paramsFile = params || guards.getFrozen('simulatorParams');
  const record = scenarioRecord(id, paramsFile);
  const required = guards.requiredCaptions(record);
  const rendered = {
    id,
    title: record.demonstrates || null,
    headline: (record.expected_output && record.expected_output.headline) || null,
    captions: [...captions, ...required],
  };
  const verdict = guards.assertScenarioMechanism(rendered, {
    simulatorParams: paramsFile, mechanism: mechanism || guards.getFrozen('mechanism'),
  });
  return Object.freeze({
    id,
    record,
    settings: resolveSettings(id, paramsFile),
    scopes: verdict.scopes,
    requiredCaptions: Object.freeze(required),
    captions: Object.freeze(rendered.captions),
    headline: rendered.headline,
    demonstrates: record.demonstrates || null,
    exampleRef: record.example_ref || null,
    illustrative: Boolean(record.illustrative),
    advisory: verdict.advisory,
  });
}

/** The scope, in a sentence. Years and surface come from the record. */
export function scopeSentence(stopPanel) {
  const parts = stopPanel.scopes.map((scope) => {
    const years = scope.years[0] === scope.years[1]
      ? `${scope.years[0]}` : `${scope.years[0]} to ${scope.years[1]}`;
    return `${scope.rule === 'default_placement_deal' ? 'the default-placement deal' : scope.rule}` +
      ` on ${scope.surface}, ${years}`;
  });
  return `This stop draws ${parts.join('; and ')}.`;
}

export function stopByNumber(n) {
  const stop = STOPS.find((s) => s.n === Number(n));
  if (!stop) throw new DoorEngineError(`there is no stop ${n} on this bench.`, { n, of: STOPS.length });
  return stop;
}

/** The opening position of every control on a stop. */
export function defaultState(stop, ctx) {
  const state = {};
  for (const control of stop.controls(ctx, {})) {
    if (control.kind === 'rocker') state[control.id] = control.options[0].value;
    else if (control.kind === 'range') {
      state[control.id] = control.stops && control.stops.length
        ? control.stops[0] : control.min;
    }
  }
  return state;
}

/** Every verdict stamp a view has to print. */
export function viewStamps(view) {
  if (!view.register) return [];
  const stamps = verdictStamps(view.register);
  assertVerdictsVisible(view.marks || [], stamps, 'a door bench stop');
  return stamps;
}

export default {
  STOPS, ACTS, stopByNumber, defaultState, viewFigures, viewStamps, mintStop, scopeSentence,
};
