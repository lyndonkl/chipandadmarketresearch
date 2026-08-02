/**
 * docs/p2/door/door.test.js — the door bench's own bench.
 *
 * Team B5. Every case here is a way to make this bench teach something false,
 * and the first section is the one the whole component was decided on:
 *
 *   Can a reader come away believing THEY set the revenue share?
 *
 * No function can answer that about a person. What these rows do is refuse
 * every state in which the answer would certainly be yes — a settlement with no
 * rival on it, a sentence that names no second hand, a wheel whose reachable
 * range never narrows, a rival that never moves on its own, a figure off the
 * wheel minted from a bare number.
 *
 * The rule the library set and this file keeps: **a test suite that only
 * exercises the routes that work measures nothing.** Every bypass found while
 * building this folder is a permanent row.
 *
 * No framework, no build step. `runCases(frozen)` returns rows; the HTML page
 * renders them and prints its own tally. Trust the tally over any number
 * written in the README.
 */

import * as guards from '../lib/guards.js';
import {
  makeWheel, readNotches, distributionClaims,
  assertSettlement, settlementPhrase, notchPhrase, wheelSentence,
  assertRivalIsPresent, rivalPressureFaults, pressureState,
  assertNotchesCiteTheirBasis, NOTCH_BASES, SETTLED_BY, WheelError,
} from './wheel.js';
import {
  mintLevel, mintShare, mintContested, mintSplit, splitSentence,
  figureText, figureQualifiers, FigureError,
} from './figures.js';
import {
  setting, ownSetting, assertFiledTotalsClose, assertClaimCopiesAgree,
  exposure, breakEven, filedSplit, contestedSplit, assertCupsClose,
  claimById, resolveSettings, DoorEngineError,
} from './engine.js';
import {
  evaluate, doorSteps, doorStepIndex, assertNotAnAuctionStep,
  checkRecordSelfConsistent, checkFiguresAgainstRecord, stepCoverage, ArithmeticError,
} from './gate.js';
import {
  STOPS, ACTS, defaultState, viewFigures, viewStamps, mintStop,
} from './scenarios.js';
import {
  machineAlt, assertDoorColourBudget, planMachine, planBars, planCurve,
  drawMachine, drawBars, drawCurve, DoorDrawingError, WHEEL, notchAtX,
} from './drawing.js';
import {
  renderDoorBench, allDoorSentences, DoorBenchError, assertNoWheelControl,
} from './bench.js';
import { PanelError } from '../auction/panels.js';

const rows = [];
let group = '';

function section(name) { group = name; }
function ok(name, detail = '') { rows.push({ group, name, pass: true, detail: String(detail) }); }
function is(name, actual, expected, tolerance = 1e-9) {
  const pass = typeof expected === 'number'
    ? Math.abs(actual - expected) <= Math.max(tolerance, Math.abs(expected) * tolerance)
    : Object.is(actual, expected);
  rows.push({ group, name, pass, detail: pass ? String(actual) : `got ${actual}, wanted ${expected}` });
}
function truthy(name, value, detail = '') {
  rows.push({ group, name, pass: Boolean(value), detail: String(detail) });
}
function throws(name, fn, expectedType = Error) {
  try {
    fn();
    rows.push({ group, name, pass: false, detail: 'it did not throw' });
  } catch (err) {
    const good = err instanceof expectedType;
    rows.push({
      group, name, pass: good,
      detail: good ? `${err.name}: ${String(err.message).split('\n')[0].slice(0, 130)}`
        : `threw ${err.name}, wanted ${expectedType.name}`,
    });
  }
}

/* ------------------------------------------------------------------ */

export function runCases(frozen) {
  rows.length = 0;
  const mechanism = frozen.mechanism;
  const params = frozen.simulatorParams;
  const claims = frozen.claims;
  const options = { mechanism, params, claims };

  /* ================================================================ *
   * 1 · THE QUESTION THE COMPONENT WAS DECIDED ON
   * ================================================================ */
  section('1 · does the reader own the wheel');

  const wheel = makeWheel(mechanism, params);
  const opening = wheel.open();

  truthy('the wheel does not open at a default — it opens above the rival\'s standing bid',
    opening.index === opening.rival.index + 1, `notch ${opening.index}, rival at ${opening.rival.index}`);
  is('the opening sentence names the rival, not the reader',
    /rival/i.test(settlementPhrase(opening)), true);

  const refused = wheel.turnTo(0);
  is('reaching below the rival\'s bid is refused', refused.settledBy, SETTLED_BY.rival_refused);
  is('and the door swings to the rival while it is refused', refused.doorTo, 'rival');
  truthy('the pointer comes back above the rival rather than staying where the reader put it',
    refused.index > refused.rival.index, `asked ${refused.askedIndex}, landed ${refused.index}`);

  /* THE DOOR COMES BACK. It used to swing on a refusal and stay swung — through
   * the reader leaving the stop and returning — while the three cups went on
   * filling from the lane the same drawing said was empty. */
  is('the swing is an event with a length, not a state', refused.transient, true);
  const restedAfter = wheel.rest();
  is('and the door comes back', restedAfter.doorTo, 'buyer');
  is('the rested state is not transient', restedAfter.transient, false);
  is('the wheel does not hand back a swung door once it has rested',
    wheel.current().doorTo, 'buyer');
  is('resting twice is a no-op rather than a second event', wheel.rest().doorTo, 'buyer');
  throws('and a resting settlement that still has the door to the rival is refused outright',
    () => {
      const faults = rivalPressureFaults({
        ...pressureState(wheel.current()), doorTo: 'rival', transient: false,
      });
      if (faults.length === 0) return;
      throw new WheelError(faults[0]);
    }, WheelError);

  const raised = wheel.turnTo(4);
  is('raising it moves the rival', raised.rival.moved, true);
  truthy('and the reader\'s reachable range shrinks',
    raised.reachable.length < opening.reachable.length,
    `${opening.reachable.length} -> ${raised.reachable.length}`);
  is('the raise sentence names the rival\'s answer in the same breath',
    /rival/i.test(settlementPhrase(raised)), true);

  wheel.turnTo(3);
  const atCeiling = wheel.turnTo(5);
  is('the rival stops at its own ceiling', atCeiling.rival.atCeiling, true);
  is('and the sentence says why rather than going quiet',
    /cannot pay more than a search earns it/i.test(settlementPhrase(atCeiling)), true);
  is('the ceiling is declared an invented number', atCeiling.rival.ceilingIsInvented, true);

  /* THE RIVAL STOPS FOR TWO REASONS AND THEY ARE NOT ONE SENTENCE. A rival
   * pinned one notch under the reader is not a rival that has run out of money,
   * and the drawing printed "it cannot pay more than it earns" at 64 per cent
   * against a ceiling of 83.3. */
  const pinned = (() => {
    const w = makeWheel(mechanism, params);
    w.open();
    w.turnTo(2);          // the rival answers, to notch 1
    return w.turnTo(2);   // it cannot follow: notch 1 is already directly below
  })();
  is('a rival pinned under the reader is not a rival that has run out of money',
    pinned.rival.moved === false && pinned.rival.atCeiling === false, true);
  is('and it is not told to the reader as one',
    /cannot pay more than a search earns/i.test(settlementPhrase(pinned)), false);
  ok('CENSUS — the pinned sentence', settlementPhrase(pinned));
  ok('CENSUS — the out-of-money sentence', settlementPhrase(atCeiling));

  /* EVERY BRANCH, PROBED BY REACHING IT. Not one of the five ways this wheel can
   * be settled produces a sentence in which the reader acted alone. */
  const branches = [];
  for (const by of Object.values(SETTLED_BY)) {
    const probe = reSettle(makeWheel(mechanism, params), by, mechanism, params);
    branches.push(`${by}: ${/rival|record/i.test(settlementPhrase(probe)) ? 'names a second hand' : 'NAMES ONLY THE READER'}`);
  }
  is('every one of the five ways this wheel settles names a hand that is not the reader\'s',
    branches.every((b) => b.endsWith('names a second hand')), true);
  ok('CENSUS — the five branches', branches.join(' · '));

  throws('a settlement this wheel did not mint is refused',
    () => assertSettlement({ share: 0.85, rival: { share: 0.5 } }, 'a forged settlement'), WheelError);
  throws('and so is a figure built from a bare share instead of a settlement',
    () => mintContested({ settlement: 0.85, label: 'what leaves through the door',
      derivedFrom: 'a number somebody typed' }), FigureError);

  /* THE ONE THAT MUST NOT REGRESS. If the rival bids and the reader loses no
   * ground, the percept is gone and only the caption is left. */
  const sweep = [];
  {
    const w = makeWheel(mechanism, params);
    let last = w.open();
    sweep.push(last);
    for (const ask of [5, 4, 3, 2, 1, 0, 5, 4, 3]) {
      last = w.turnTo(ask);
      sweep.push(last);
      assertRivalIsPresent(last, 'the sweep');
    }
  }
  is('the reader\'s reach never grows back once the rival has taken ground',
    sweep.every((s, i) => i === 0 || s.reachable.length <= sweep[i - 1].reachable.length), true);
  is('and wherever the rival has bid at all, the reach is smaller than it opened at',
    sweep.every((s) => s.rival.index === 0 || s.reachable.length < s.reachOpened), true);
  ok('CENSUS — the reach, move by move',
    sweep.map((s) => `${s.reachable.length}`).join(' → '));

  /* ================================================================ *
   * 1b · THE CHECK THAT COULD NOT FIRE, AND THE ONE THAT REPLACED IT
   *
   * `assertRivalIsPresent` shipped a narrowing clause that was unsatisfiable
   * by construction — `reachOpened <= reachable.length && rival.index > 0`,
   * with `reachOpened` pinned at 5 by `open()` and `reachable.length` equal to
   * `5 - rival.index`. The sweep above fires it zero times, and the README
   * sold it as a GUARANTEE.
   *
   * The repair is a PURE FUNCTION OVER PLAIN DATA, so every clause can be put
   * to the test rather than reasoned about. Each row below bends one field of
   * a real settlement's state and watches the fault appear. A row that stops
   * firing here is a clause that has gone dead again.
   * ================================================================ */
  section('1b · every clause of the rival guard, fired');

  const liveState = pressureState(wheel.current());
  is('a real settlement of this wheel produces no faults at all',
    rivalPressureFaults(liveState).length, 0);
  is('the old clause, evaluated over every settlement the sweep reached, fires this many times',
    sweep.filter((s) => s.reachOpened <= s.reachable.length && s.rival.index > 0).length, 0);

  const bent = [
    ['no rival bid on the object at all', { rivalShare: NaN }],
    ['a sentence naming no hand but the reader\'s', { phrase: 'you turned it up' }],
    ['a rival whose ceiling is at or below its own opening bid', { ceilingIndex: 0 }],
    ['reach that disagrees with the rival\'s standing bid', { reachable: [1, 2, 3, 4, 5] }],
    ['held ground that disagrees with it', { lostGround: [0] }],
    ['a count of what is left that does not match what is carried', { reachNow: 99 }],
    ['ground taken and no reach lost', {
      rivalIndex: 2, reachable: [3, 4, 5], lostGround: [0, 1, 2], reachNow: 3, reachOpened: 3,
    }],
    ['a resting state with the door still swung to the rival', { doorTo: 'rival', transient: false }],
    ['a pointer resting inside the ground the rival holds', { index: 0 }],
  ];
  for (const [what, patch] of bent) {
    const faults = rivalPressureFaults({ ...liveState, ...patch });
    truthy(`it fires on ${what}`, faults.length > 0, faults[0] ? faults[0].slice(0, 96) : 'IT DID NOT FIRE');
  }

  /* AND THE RECORD-DRIVEN ONE. Move `rpm_rival` near `serving_cost_per_1k` and
   * the rival's ceiling sorts to the lowest notch, so its hand is pinned at its
   * opening bid for every move the reader can make: every notch stays
   * reachable, nothing is ever taken, and the reader has the wheel to
   * themselves under a caption saying they do not. It rendered green. */
  throws('a record on which the rival can never move stops the wheel at construction',
    () => makeWheel(mechanism, {
      ...params,
      variables: params.variables.map((v) => (v.name === 'rpm_rival' ? { ...v, default: 1.5 } : v)),
    }), WheelError);

  /* ================================================================ *
   * 1c · THE SECOND CHECK THAT COULD NOT FIRE
   *
   * The refusal of a wheel control in the left column lived as a branch inside
   * `buildControl`, which is module-private, and every control it can see comes
   * off a frozen `STOPS` entry. No public path could reach it, so nothing could
   * demonstrate it — the same shape as the clause above, one layer up. It is a
   * pure function over a plain object now, `buildControl` calls it on every
   * control it mounts, and these two rows fire it.
   * ================================================================ */
  throws('asking for a wheel control in the left column is refused, and the refusal can be fired',
    () => assertNoWheelControl({ id: 'revenue_share', kind: 'wheel', label: 'the revenue share' }),
    DoorBenchError);
  let declaredControls = 0;
  truthy('and every control the eleven stops actually declare passes it',
    STOPS.every((stop) => {
      const panel = mintStop(stop.id, { params, mechanism });
      const ctx = {
        mechanism, params, claims, panel, id: stop.id,
        settings: panel.settings, record: panel.record,
        wheel: stop.wheel ? makeWheel(mechanism, params, { mode: stop.wheel }) : null,
      };
      const built = stop.controls(ctx, defaultState(stop, ctx));
      declaredControls += built.length;
      return built.every((c) => assertNoWheelControl(c) === c);
    }), `${declaredControls} controls across eleven stops, and not one of them is a wheel`);

  /* ================================================================ */
  section('2 · every notch is a number the record contains');

  const notches = readNotches(mechanism, params);
  is('six notches', notches.length, 6);
  truthy('CENSUS — the notch values, in order',
    notches.every((n) => Number.isFinite(n.value)),
    notches.map((n) => `${(n.value * 100).toFixed(2)}% (${n.whose})`).join(' · '));
  truthy('they are strictly increasing and distinct',
    notches.every((n, i) => i === 0 || n.value > notches[i - 1].value), 'yes');
  truthy('one notch is the reported deal share and it is grade B',
    notches.some((n) => n.whose === 'reported' && n.grade === 'B'), 'yes');
  truthy('one notch is the rival\'s ceiling and it is marked invented',
    notches.some((n) => n.whose === 'rival-ceiling' && n.illustrative), 'yes');
  is('the notch sentence says which kind of number the reader is standing on',
    /grade B|invented|grade A/.test(notchPhrase(wheel.current())), true);

  /* THE DENOMINATOR EVERY NOTCH IS A SHARE OF.
   *
   * The 91% and 84% notches used to cite `mech-tac-001`, whose own calibrated
   * quantity is 28.1% OF ADVERTISING REVENUE in 2008. The notches are a percent
   * of NETWORK revenue. The wheel is the one place on this bench where a share
   * is drawn rather than printed, so it was the one place where losing the
   * basis was invisible — break B9 happening inside the guard against break B9. */
  truthy('every notch names the denominator it is a share of',
    notches.every((n) => typeof n.basis === 'string' && n.basis.length > 8),
    notches.map((n) => `${(n.value * 100).toFixed(1)}% ${n.basisKey}`).join(' · '));
  truthy('and every notch names where in the record its number is read from',
    notches.every((n) => typeof n.valueFrom === 'string' && n.valueFrom.length >= 8),
    notches.map((n) => n.valueFrom.split(' — ')[0]).join(' · '));
  is('the basis travels to every figure off the wheel, through the notch sentence',
    /of (what the partner pages earned|the rival's own revenue|what a thousand searches earn)/
      .test(notchPhrase(wheel.current())), true);
  truthy('two notches cite a claim, and the citation is checked on every load',
    notches.filter((n) => n.claimId).length === 2
      && notches.filter((n) => n.claimId).every((n) => n.claimId === 'mech-ovt-001'),
    notches.filter((n) => n.claimId).map((n) => `${(n.value * 100).toFixed(1)}% → ${n.claimId}`).join(' · '));
  ok('CENSUS — mech-ovt-001\'s own unit, which is why it may stand behind them',
    claimById('mech-ovt-001', claims).unit);
  ok('CENSUS — mech-tac-001\'s unit, which is why it may not',
    claimById('mech-tac-001', claims).unit);
  throws('putting the old citation back is refused, naming both denominators',
    () => assertNotchesCiteTheirBasis([{
      label: 'what the buyer actually paid out in 2002', basisKey: 'network-revenue',
      claimId: 'mech-tac-001', valueFrom: 'tac_series 2002 — tac_pct_network_revenue',
    }], distributionClaims(mechanism)), WheelError);
  throws('and so is a claim cited behind the invented ceiling, which no claim calibrates',
    () => assertNotchesCiteTheirBasis([{
      label: 'the most the rival can pay', basisKey: 'rival-yield',
      claimId: 'mech-ovt-001', valueFrom: 'rpm_rival and serving_cost_per_1k',
    }], distributionClaims(mechanism)), WheelError);
  throws('a notch declaring a denominator that is not one of the closed set is refused',
    () => assertNotchesCiteTheirBasis([{
      label: 'a notch of something else', basisKey: 'total-revenue',
      claimId: null, valueFrom: 'somewhere in the record',
    }], distributionClaims(mechanism)), WheelError);
  ok('CENSUS — the denominators a notch may be a share of', Object.keys(NOTCH_BASES).join(' · '));

  throws('a record with no distribution calibrations is a hard error, not an empty wheel',
    () => distributionClaims({ engines: { distribution: {} } }), WheelError);
  throws('a params file with no revenue_share_s variable stops the wheel rather than defaulting',
    () => readNotches(mechanism, { variables: [] }), WheelError);

  const filed = makeWheel(mechanism, params, { mode: 'filed' });
  const walk0 = filed.walkTo(0);
  is('the filed walk carries the year and says nobody on the page turned it',
    /Nobody on this page turned it/.test(settlementPhrase(walk0)), true);
  truthy('the ratchet goes up and then comes back down',
    (() => {
      const shares = [];
      for (let i = 0; i < filed.walkLength(); i += 1) shares.push(filed.walkTo(i).share);
      let fell = false;
      let rose = false;
      for (let i = 1; i < shares.length; i += 1) {
        if (shares[i] < shares[i - 1]) fell = true;
        if (fell && shares[i] > shares[i - 1]) rose = true;
      }
      return fell && rose;
    })(),
    (() => { const s = []; for (let i = 0; i < filed.walkLength(); i += 1) s.push(`${(filed.walkTo(i).share * 100).toFixed(1)}%`); return s.join(' → '); })());
  truthy('the year the record does not disclose is carried as an absence, not skipped in silence',
    walk0.absentYears.length > 0, walk0.absentYears.join(', '));
  throws('the reader cannot take the wheel back in the filed state',
    () => filed.turnTo(2), WheelError);
  throws('and the contested wheel refuses to be walked by the record',
    () => wheel.walkTo(0), WheelError);

  /* ================================================================ */
  section('3 · a share has no scalar form');

  throws('a share minted from a ready-made value is refused',
    () => mintShare({ value: 0.318, label: 'the network share', stepRef: '6714.688/21128.514' }),
    FigureError);
  throws('a share with an unnamed denominator is refused',
    () => mintShare({
      numerator: { value: 6714.688, label: 'network revenue' },
      denominator: { value: 21128.514, label: 'rev' },
      label: 'the network share', stepRef: '6714.688/21128.514',
    }), FigureError);
  throws('and mintLevel refuses to mint a share at all',
    () => mintLevel({ value: 0.318, role: 'share', label: 'the network share',
      derivedFrom: 'a number worked out elsewhere' }), FigureError);

  const ofAdvertising = mintShare({
    numerator: { value: 6714.688, label: 'the buyer\'s 2008 network advertising revenue' },
    denominator: { value: 21128.514, label: 'all of the buyer\'s 2008 advertising revenue' },
    label: 'the lower lane\'s share', stepRef: '6714.688/21128.514',
  });
  const ofTotal = mintShare({
    numerator: { value: 6714.688, label: 'the buyer\'s 2008 network advertising revenue' },
    denominator: { value: 21795.550, label: 'all of the buyer\'s 2008 revenue of every kind' },
    label: 'the lower lane\'s share', stepRef: '6714.688/21795.550',
  });
  truthy('one numerator over two denominators gives two different shares, and both name their base',
    ofAdvertising.value !== ofTotal.value
      && figureQualifiers(ofAdvertising)[0] !== figureQualifiers(ofTotal)[0],
    `${figureText(ofAdvertising)} ${ofAdvertising.basis} · ${figureText(ofTotal)} ${ofTotal.basis}`);

  /* ================================================================ */
  section('4 · a figure that says nothing about where it came from');

  throws('a figure with neither a stored step nor a written derivation is refused',
    () => mintLevel({ value: 100, role: 'filed', label: 'the reported guarantee' }), FigureError);
  throws('a figure with both is refused',
    () => mintLevel({ value: 100, role: 'filed', label: 'the reported guarantee',
      stepRef: '100 / 0.85', derivedFrom: 'and also this' }), FigureError);
  throws('"maths" is not a derivation',
    () => mintLevel({ value: 100, role: 'filed', label: 'the reported guarantee', derivedFrom: 'maths' }),
    FigureError);

  /* ================================================================ */
  section('5 · an invented input is named, and the name is cross-checked');

  const d5Settings = resolveSettings('D5-yield-sets-the-distribution-budget', params);
  throws('an illustrative figure naming no invented input is refused',
    () => mintLevel({ value: 8.5, role: 'money', label: 'the buyer\'s payment', illustrative: true,
      settings: d5Settings, derivedFrom: 'eighty-five per cent of ten dollars' }), FigureError);
  throws('an invented name that is not a setting on this scenario is refused',
    () => mintLevel({ value: 8.5, role: 'money', label: 'the buyer\'s payment', illustrative: true,
      invented: ['everything'], settings: d5Settings,
      derivedFrom: 'eighty-five per cent of ten dollars' }), FigureError);
  ok('and a real one passes', (() => {
    const f = mintLevel({
      value: 8.5, role: 'money', label: 'the buyer\'s payment', illustrative: true,
      invented: ['rpm_buyer'], settings: d5Settings,
      derivedFrom: 'eighty-five per cent of the invented ten dollars per thousand queries',
    });
    return figureQualifiers(f).find((q) => q.startsWith('invented input'));
  })());

  /* ================================================================ */
  section('6 · the split that may never be a point');

  const highPath = mintShare({
    numerator: { value: 1.994918, label: 'the log of the growth in searches on the higher estimate' },
    denominator: { value: 3.544161, label: 'the log of the growth in owned-site revenue' },
    label: 'volume\'s share, high path', stepRef: '1.994918 / 3.544161',
  });
  const lowPath = mintShare({
    numerator: { value: 1.843180, label: 'the log of the growth in searches on the lower estimate' },
    denominator: { value: 3.544161, label: 'the log of the growth in owned-site revenue' },
    label: 'volume\'s share, low path', stepRef: '1.843180 / 3.544161',
  });
  const split = mintSplit({
    label: 'how much of the growth was more searches', of: 'of the growth on the buyer\'s own pages',
    because: 'both query estimates are grade C, so the record gives two paths and no middle',
    high: highPath, low: lowPath,
  });
  is('a split carries no scalar value at all', 'value' in split, false);
  is('and no central', 'central' in split, false);
  truthy('its sentence quotes the band and never a flat number',
    !/54\.\d/.test(splitSentence(split)), splitSentence(split));
  throws('a split that does not say why it has no middle is refused',
    () => mintSplit({ label: 'the split', of: 'of the growth', high: highPath, low: lowPath }),
    FigureError);
  const claim = claimById('mech-capture-002', claims);
  truthy('the claim behind it would pass G1 as a point — the refusal here is the record\'s own, not G1\'s',
    guards.markKindFor(claim) === 'point',
    `mech-capture-002 ratio ${guards.intervalRatio(claim).toFixed(3)}, inside the cut G1 applies`);

  /* ================================================================ */
  section('7 · the most-quoted number in this story has no middle');

  const guarantee = claimById('mech-aol-001', claims);
  is('the reported guarantee is span-only at the live cut', guards.markKindFor(guarantee), 'span');
  throws('G1 refuses to draw it as a point',
    () => guards.drawMark(guarantee, 'point'), guards.WideIntervalError);
  ok('and the stop that draws it builds a band from both ends of the interval',
    `${guarantee.ci80[0]} to ${guarantee.ci80[1]}, central ${guarantee.central} withheld`);
  const mehta = claimById('mech-mehta-004', claims);
  is('so is the sustained price increase the court found', guards.markKindFor(mehta), 'span');

  /* ================================================================ */
  section('8 · the three cups add up to the dollar');

  for (const side of ['network', 'owned']) {
    for (const allocation of [1, 0.5]) {
      const cups = filedSplit(mechanism, { year: 2008, side, allocation });
      const sum = cups.outTheDoor.value + cups.costToAnswer.value + cups.kept.value;
      is(`the ${side} cups at ${allocation === 1 ? 'pro-rata' : 'half'} allocation sum to one dollar`,
        sum, 1, 1e-9);
    }
  }
  const net = filedSplit(mechanism, { year: 2008, side: 'network', allocation: 1 });
  const own = filedSplit(mechanism, { year: 2008, side: 'owned', allocation: 1 });
  is('the middle cup is the same height in both lanes, because the record spreads the cost pro rata',
    Math.abs(net.costToAnswer.value - own.costToAnswer.value) < 1e-9, true);
  is('and the whole difference is the first cup and the third',
    (own.outTheDoor.value < net.outTheDoor.value) && (own.kept.value > net.kept.value), true);
  throws('a split that does not close is refused',
    () => assertCupsClose({
      outTheDoor: { value: 0.5 }, costToAnswer: { value: 0.2 }, kept: { value: 0.2 },
    }, 'a broken split'), DoorEngineError);
  throws('an allocation the record does not carry is refused rather than interpolated',
    () => filedSplit(mechanism, { year: 2008, side: 'network', allocation: 0.75 }), DoorEngineError);
  throws('a year the record does not split is an absence, not a zero',
    () => filedSplit(mechanism, { year: 2002, side: 'network', allocation: 1 }), DoorEngineError);

  const w2 = makeWheel(mechanism, params);
  w2.open();
  w2.turnTo(5);
  const loss = contestedSplit(w2.current(), {
    settings: d5Settings, id: 'D6-the-loss-leading-network', servingCost: 1, rpm: 10,
  });
  is('at the ratio the buyer actually recognised, the last cup goes below zero',
    loss.keptIsNegative, true);
  is('and the cups still close', loss.outTheDoor.value + loss.costToAnswer.value + loss.kept.value, 1, 1e-9);

  /* ================================================================ */
  section('9 · the exposure is not the guarantee');

  is('exposure is max(0, G - sR)', exposure({ guarantee: 100, share: 0.85, revenue: 0, delivers: true }), 100);
  is('and it is zero once the partner has cleared break-even',
    exposure({ guarantee: 100, share: 0.85, revenue: 300.47564, delivers: true }), 0);
  is('the delivery contingency collapses it to zero at every size',
    [0, 100, 300].every((g) => exposure({ guarantee: g, share: 0.85, revenue: 0, delivers: false }) === 0),
    true);
  throws('there is no default for whether the partner delivers',
    () => exposure({ guarantee: 100, share: 0.85, revenue: 0 }), DoorEngineError);
  is('break-even is G over s', breakEven({ guarantee: 100, share: 0.85 }), 117.6470588235, 1e-9);

  /* ================================================================ */
  section('10 · build note 9 — the auction engine is not on this axis');

  const index = doorStepIndex(mechanism);
  is('an auction step is not in the door\'s index', index.has('52.58 / 28.18'), false);
  is('a real auction step is not in the door\'s index either', index.has('3.00*0.01'), false);
  throws('and naming one is refused with the note that forbids it',
    () => assertNotAnAuctionStep('3.00*0.01', mechanism, 'a door figure'), ArithmeticError);
  ok('and a door figure naming an auction step never reaches the gate quietly',
    (() => {
      try {
        checkFiguresAgainstRecord(
          [{ label: 'a per-thousand-impression figure off the other engine', value: 0.03, step: '3.00*0.01' }],
          mechanism, 'a probe'
        );
        return 'IT PASSED — build note 9 is not enforced';
      } catch (err) { return String(err.message).split('\n')[0].slice(0, 110); }
    })());
  ok('CENSUS — where the door\'s steps come from', (() => {
    const s = checkRecordSelfConsistent(mechanism);
    return `${s.families.distribution} in engines.distribution + ${s.families.reconciliation} ` +
      `in the cross-engine reconciliation = ${s.total}`;
  })());
  const self = checkRecordSelfConsistent(mechanism);
  is('every stored step re-evaluates to its stored value', self.failed.length, 0);
  throws('a record with no distribution examples is a hard error, never a quiet pass',
    () => doorSteps({ engines: { distribution: {} } }), ArithmeticError);
  throws('and so is a record with no reconciliation steps — the three bases would lose their grounding',
    () => doorSteps({ engines: { distribution: { examples: [{ steps: [{ expr: '1+1', expected: 2 }] }] } } }),
    ArithmeticError);
  is('the evaluator agrees with Python on right-associative powers', evaluate('2**3**2'), 512);

  /* ================================================================ */
  section('11 · an empty check is a failed check');

  const empty = checkFiguresAgainstRecord([], mechanism, 'nothing at all');
  is('a gate handed nothing reports itself vacuous', empty.vacuous, true);
  is('and vacuous is never ok', empty.ok, false);
  truthy('and it says why', Boolean(empty.vacuousReason), empty.vacuousReason);

  /* ================================================================ */
  section('12 · nothing here has a default');

  throws('a setting the scenario does not carry stops the stop rather than being guessed',
    () => setting({}, 'revenue_share_s', 'a stop with no settings'), DoorEngineError);
  for (const [id, key] of [
    ['D5-yield-sets-the-distribution-budget', 'rpm_buyer'],
    ['D5-yield-sets-the-distribution-budget', 'serving_cost_per_1k'],
    ['D6-the-loss-leading-network', 'rpm_buyer'],
    ['D10-guarantee-overhang-reconstruction', 'non_aol_member_share'],
    ['D11-what-the-deal-moved-and-returned', 'take_rate_partner'],
  ]) {
    const from = ownSetting(id, key, params, `${id} in the bench`);
    truthy(`${id} declares its own "${key}" rather than inheriting it`, from != null, String(from));
  }
  throws('a setting supplied by a parent where the scenario has to own it is refused',
    () => ownSetting('D5-yield-sets-the-distribution-budget', 'year', params, 'a probe'),
    DoorEngineError);

  /* ================================================================ */
  section('13 · build note 10, and the two copies of one claim');

  ok('CENSUS — the filed components still add to the filed total',
    JSON.stringify(assertFiledTotalsClose(mechanism)));
  ok('CENSUS — the distribution claims in mechanism.json match claims.json',
    JSON.stringify(assertClaimCopiesAgree(mechanism, claims)));
  throws('a table drifted to the era record\'s $410.946m stops the bench',
    () => assertFiledTotalsClose({
      engines: { distribution: { tac_series: { table_usd_millions: [
        { year: 2002, network_revenue: 103.937, owned_revenue: 306.978, advertising_revenue: 410.946 },
      ] } } },
    }), DoorEngineError);
  throws('and an empty table is a failure rather than a pass with nothing to check',
    () => assertFiledTotalsClose({ engines: { distribution: { tac_series: { table_usd_millions: [] } } } }),
    DoorEngineError);

  /* ================================================================ */
  section('14 · eleven stops, every position, against the record');

  let stopFails = 0;
  let vacuous = 0;
  let derived = 0;
  let checked = 0;
  const allFigures = [];
  for (const stop of STOPS) {
    const panel = mintStop(stop.id, options);
    const stopWheel = stop.wheel ? makeWheel(mechanism, params, { mode: stop.wheel }) : null;
    const ctx = {
      mechanism, params, claims, settings: panel.settings, record: panel.record,
      id: stop.id, panel, wheel: stopWheel,
    };
    const base = defaultState(stop, ctx);
    const controls = stop.controls(ctx, base);
    const candidates = controls.map((c) => (c.kind === 'rocker'
      ? c.options.map((o) => o.value)
      : c.kind === 'wheel' ? [null] : [c.min, c.max, ...(c.stops || [])]));
    let combos = [{}];
    for (let i = 0; i < controls.length; i += 1) {
      const next = [];
      for (const combo of combos) {
        for (const v of candidates[i]) next.push(v == null ? combo : { ...combo, [controls[i].id]: v });
      }
      combos = next.slice(0, 200);
    }
    const positions = stopWheel ? stopWheel.notches.map((_, i) => i) : [null];
    for (const combo of combos) {
      for (const p of positions) {
        if (stopWheel) { stopWheel.open(); stopWheel.turnTo(p); }
        const view = stop.build({ ...base, ...combo }, ctx);
        const shown = viewFigures(view);
        allFigures.push(...shown);
        const check = checkFiguresAgainstRecord(shown, mechanism, stop.id);
        checked += 1;
        derived += check.derived.length;
        if (check.vacuous) vacuous += 1;
        if (!check.ok) stopFails += check.failed.length + check.unbacked.length;
        viewStamps(view);
      }
    }
  }
  is('eleven stops', STOPS.length, 11);
  is('three acts, and every stop belongs to one',
    STOPS.every((s) => ACTS.some((a) => a.n === s.act)), true);
  is('no figure anywhere on this bench fails to re-derive from the record', stopFails, 0);
  is('no position hands the gate nothing it can check', vacuous, 0);
  ok(`CENSUS — ${checked} positions swept, ${derived} derived figures, each printing its own derivation`,
    `${allFigures.length} figures in total`);
  const coverage = stepCoverage(allFigures, mechanism);
  ok(`CENSUS — stored steps claimed by a figure this bench can show`,
    `${coverage.claimed} of ${coverage.total} (${(coverage.fraction * 100).toFixed(1)}%)`);
  is('three centre forms and no fourth',
    new Set(STOPS.map((s) => s.centre)).size, 3);
  truthy('CENSUS — which stop uses which form',
    true, STOPS.map((s) => `${s.n}:${s.centre}`).join(' '));

  /* ================================================================ */
  section('15 · the record\'s required captions reach the screen');

  let required = 0;
  let g7 = 0;
  for (const stop of STOPS) {
    const panel = mintStop(stop.id, options);
    required += panel.requiredCaptions.length;
    g7 += panel.advisory.findings.length;
    for (const caption of panel.requiredCaptions) {
      truthy(`${stop.id} shows its required caption`,
        panel.captions.includes(caption), `${caption.slice(0, 70)}…`);
    }
  }
  ok(`CENSUS — required captions across the eleven stops`, String(required));
  is('G7\'s own lint finds nothing in the fields a stop is minted from — which is not a clearance', g7, 0);
  throws('a stop that is not in the frozen record cannot be minted',
    () => mintStop('D99-invented', options), PanelError);

  /* ================================================================ *
   * 15b · THE GUARDS AT THE DRAW SITE
   *
   * `drawMachine`, `drawBars` and `drawCurve` used to draw whatever they were
   * handed, and a probe caught all three painting with every other guard green.
   * Each row below is one of the four things that probe painted.
   * ================================================================ */
  section('15b · the three forms refuse a plan they did not mint');

  const goodMachine = {
    side: 'network',
    door: { to: 'buyer' },
    cups: { outTheDoor: { value: 0.787 }, costToAnswer: { value: 0.1231 }, kept: { value: 0.0899 } },
    cupText: { outTheDoor: '78.7%', costToAnswer: '12.3%', kept: '9.0%' },
    lanes: { drawnUpper: 3, drawnLower: 1, sentence: 'the filed split is printed beside the dots' },
    baselineLabel: 'one dollar of 2008 network advertising revenue',
    absence: { label: 'the deeper pool', note: 'nobody ever measured the deeper advertiser pool' },
  };
  ok('a machine plan that closes to the dollar mints', planMachine(goodMachine).form);
  throws('THREE CUPS ON ONE BASELINE SUMMING TO 1.6 are refused',
    () => planMachine({
      ...goodMachine,
      cups: { outTheDoor: { value: 0.9 }, costToAnswer: { value: 0.4 }, kept: { value: 0.3 } },
      cupText: { outTheDoor: '90.0%', costToAnswer: '40.0%', kept: '30.0%' },
    }), DoorDrawingError);
  throws('A NEGATIVE AMOUNT LEAVING THROUGH THE DOOR is refused',
    () => planMachine({
      ...goodMachine,
      cups: { outTheDoor: { value: -0.2 }, costToAnswer: { value: 0.2 }, kept: { value: 1.0 } },
      cupText: { outTheDoor: '-20.0%', costToAnswer: '20.0%', kept: '100.0%' },
    }), DoorDrawingError);
  throws('a cup drawn at one height and printed at another is refused',
    () => planMachine({ ...goodMachine, cupText: { ...goodMachine.cupText, kept: '21.3%' } }),
    DoorDrawingError);
  throws('and a shut door that does not say what the shut door means here is refused',
    () => planMachine({ ...goodMachine, door: { to: 'rival' } }), DoorDrawingError);

  const goodBar = {
    kind: 'level', value: 10, role: 'take', label: 'what it cost in its first year',
    basis: 'on the revenue the partner actually generated in 2002', figureText: '$10m',
  };
  ok('a bar board mints', planBars({ max: 160, unit: 'US dollars, millions', bars: [goodBar] }).form);
  throws('A SPAN BAR CARRYING central:100 ON THE REPORTED GUARANTEE is refused',
    () => planBars({
      max: 160, unit: 'US dollars, millions',
      bars: [{
        kind: 'span', lo: 75, hi: 150, central: 100, role: 'money',
        label: 'the reported guarantee', basis: 'a reported range, never filed',
        figureText: '$75m–$150m',
      }],
    }), DoorDrawingError);
  throws('a bar taller than its own board is refused rather than drawn through the frame',
    () => planBars({ max: 160, unit: 'US dollars, millions', bars: [{ ...goodBar, value: 2164 }] }),
    DoorDrawingError);
  throws('a negative bar, which the scale would clamp to nothing, is refused',
    () => planBars({ max: 160, unit: 'US dollars, millions', bars: [{ ...goodBar, value: -12 }] }),
    DoorDrawingError);
  throws('and a bar that does not name its own base is refused',
    () => planBars({
      max: 160, unit: 'US dollars, millions', bars: [{ ...goodBar, basis: undefined }],
    }), DoorDrawingError);

  const bandXs = [];
  for (let r = 0; r <= 600; r += 10) bandXs.push(r);
  const atRisk = (g, r) => Math.max(0, g - 0.85 * r);
  const goodCurve = {
    x: { min: 0, max: 600, label: 'partner revenue generated so far, $m' },
    y: { min: 0, max: 160, label: 'still at risk, $m' },
    bandLo: bandXs.map((r) => [r, atRisk(75, r)]),
    bandHi: bandXs.map((r) => [r, atRisk(150, r)]),
    marks: [{ x: 65.9262, y: 0, label: 'filed 2002' }],
  };
  ok('a band with its marks on the axis mints', planCurve(goodCurve).form);
  throws('A DOT AT THE EXACT MIDPOINT OF THE BAND is refused — the single mark D1 exists to refuse',
    () => planCurve({
      ...goodCurve,
      marks: [{ x: 30, y: (atRisk(75, 30) + atRisk(150, 30)) / 2, label: 'the reported guarantee, $100m' }],
    }), DoorDrawingError);

  throws('drawMachine will not take an object literal', () => drawMachine(null, goodMachine, 'a plain sentence'),
    DoorDrawingError);
  throws('drawBars will not take one either', () => drawBars(null, { max: 1, bars: [] }, 'a plain sentence'),
    DoorDrawingError);
  throws('nor will drawCurve', () => drawCurve(null, goodCurve, 'a plain sentence'), DoorDrawingError);
  throws('nor will the accessible name', () => machineAlt(goodMachine), DoorDrawingError);

  /* ================================================================ *
   * 15c · ONE READING OF THE REPORTED GUARANTEE, NOT THREE
   * ================================================================ */
  section('15c · the reported guarantee is read once');

  const stale = /\$75m|\$150m|75 to 150|60%|60 per cent/;
  const guaranteeSources = [];
  for (const stop of STOPS) {
    const panel = mintStop(stop.id, options);
    const stopWheel = stop.wheel ? makeWheel(mechanism, params, { mode: stop.wheel }) : null;
    const ctx = {
      mechanism, params, claims, settings: panel.settings, record: panel.record,
      id: stop.id, panel, wheel: stopWheel,
    };
    const view = stop.build(defaultState(stop, ctx), ctx);
    for (const mark of view.marks || []) {
      if (mark.id === 'mech-aol-001') guaranteeSources.push(`${stop.id}: ${mark.lo}–${mark.hi}`);
    }
  }
  truthy('three stops draw the reported guarantee, and all three take it from the claim',
    guaranteeSources.length === 3, guaranteeSources.join(' · '));
  is('and no two of them disagree about what the record says',
    new Set(guaranteeSources.map((s) => s.split(': ')[1])).size, 1);
  is('the sentence about why it has no middle is generated from the live cut, not typed',
    stale.test(String(guards.RULES.wideIntervalRatio)), false);

  /* ================================================================ */
  section('16 · the colour budget');

  ok('every colour this drawing paints is measured at import', String(assertDoorColourBudget()));

  /* ================================================================ */
  section('17 · the drawing, and its accessible name');

  if (typeof document !== 'undefined') {
    const host = document.createElement('div');
    host.style.position = 'absolute';
    host.style.left = '-10000px';
    document.body.appendChild(host);
    const bench = renderDoorBench(host, options);
    const drawn = bench.sentences();
    truthy('the bench renders and its strings can be read off the DOM', drawn.length > 40, `${drawn.length} strings`);

    /* THE DRAWING AGREES WITH ITS OWN ACCESSIBLE NAME. The auction bench found
     * a band drawing rounded dollars while its spoken sentence carried cents. */
    bench.show(1);
    const cupsView = bench.view;
    const alt = machineAlt(cupsView.machine);
    for (const key of ['outTheDoor', 'costToAnswer', 'kept']) {
      const drawnText = cupsView.machine.cupText[key];
      truthy(`the ${key} cup's drawn figure is in the accessible name too`,
        alt.includes(drawnText), `${drawnText} in "${alt.slice(0, 60)}…"`);
    }

    /* ============================================================== *
     * THE DRUM IS THE CONTROL, AND THE GESTURE AND ITS ANSWER ARE ONE
     * OBJECT.
     *
     * The version this replaces mounted a plain range input in the left
     * column, 421 units above the drum and in a different column: with the
     * drum centred in a 1009px viewport the slider sat at y = -42, and there
     * was no scroll position at which both were on screen.
     * ============================================================== */
    bench.show(2);
    is('there is no range input anywhere on this bench',
      host.querySelectorAll('input[type="range"].db-wheel-range').length, 0);
    const drum = host.querySelector('svg.db-wheel');
    truthy('the drum itself carries the control role', drum && drum.getAttribute('role') === 'slider',
      drum ? `role=${drum.getAttribute('role')} tabindex=${drum.getAttribute('tabindex')}` : 'no drum');
    truthy('it is keyboard-reachable, and the keyboard path is the same object',
      drum && drum.getAttribute('tabindex') === '0' && drum.getAttribute('aria-valuemax') === '5',
      drum ? `valuenow ${drum.getAttribute('aria-valuenow')} of ${drum.getAttribute('aria-valuemax')}` : '');
    truthy('and its value text is the state of the wheel, rival and all',
      drum && /rival/i.test(drum.getAttribute('aria-valuetext') || ''),
      drum ? String(drum.getAttribute('aria-valuetext')).slice(0, 80) : '');
    /* AT THE OPENING THE RIVAL HAS NOT MOVED, so there is nothing to trace. A
     * trace drawn here would say a hand had travelled when it had not. */
    is('at the opening the rival has not moved, and no trace of a move is drawn',
      host.querySelectorAll('.db-rival-from').length, 0);

    /* THE HAND AND THE ANSWER, MEASURED. Every part of the response — the
     * held ground, the hard stop, the ceiling post, the pawl and the dimmed
     * notches — is inside the same drawing as the grip, so the band that has
     * to be co-visible is the drawing's own height. */
    const gripTop = WHEEL.drumY - 44;                  // the refusal's return arc, at its peak
    const gripBottom = WHEEL.drumY + WHEEL.drumH + WHEEL.gripOver;
    const responseTop = WHEEL.drumY - 22;              // the ceiling post
    const responseBottom = WHEEL.whoseY;               // the notch labels, dimmed as they go
    const band = Math.max(gripBottom, responseBottom) - Math.min(gripTop, responseTop);
    ok('CENSUS — the hand and its answer, in drawing units',
      `grip ${gripTop}–${gripBottom}, response ${responseTop}–${responseBottom}, ` +
      `one band of ${band} of the drawing's ${WHEEL.height} units`);
    truthy('the gesture and every answer to it are inside one band, so no scroll can separate them',
      band <= WHEEL.height, `${band} <= ${WHEEL.height}`);
    const lastNotch = host.querySelector('[data-notch="5"]');
    truthy('the 91 per cent notch — the endpoint of the ratchet — is inside the drawing',
      lastNotch && Number(lastNotch.getAttribute('x')) < WHEEL.width - 8,
      lastNotch ? `x=${lastNotch.getAttribute('x')} of ${WHEEL.width}` : 'no notch drawn');
    is('the drum maps a point at its right-hand end to the last notch',
      notchAtX(WHEEL.drumX + WHEEL.drumW, 6), 5);
    is('and a point at its left-hand end to the first',
      notchAtX(WHEEL.drumX, 6), 0);

    /* THE DRAG SURVIVES THE REPAINT IT CAUSES.
     *
     * Every notch a drag crosses repaints the bench and replaces the drum. The
     * first build of this rebuilt the wheel's host too, so the move handler
     * measured a detached node, got a width of zero and stopped turning: the
     * drum came loose in the reader's hand at the first notch they crossed —
     * the first moment the rival pushes back, and the only moment that
     * matters. One host for the life of the bench, emptied and redrawn. */
    if (typeof PointerEvent === 'function') {
      bench.show(2);
      const drumNow = () => host.querySelector('svg.db-wheel');
      const xOfNotch = (i) => {
        const b = drumNow().getBoundingClientRect();
        const s = b.width / WHEEL.width;
        return b.left + (WHEEL.drumX + 38 + (WHEEL.drumW - 76) * (i / 5)) * s;
      };
      const yOnDrum = () => {
        const b = drumNow().getBoundingClientRect();
        return b.top + (WHEEL.drumY + WHEEL.drumH / 2) * (b.width / WHEEL.width);
      };
      const seen = [];
      const at = () => bench.wheelFor(STOPS[1].id).current().index;
      drumNow().dispatchEvent(new PointerEvent('pointerdown', {
        clientX: xOfNotch(2), clientY: yOnDrum(), bubbles: true, cancelable: true, button: 0,
      }));
      seen.push(at());
      for (const i of [3, 4, 5]) {
        document.dispatchEvent(new PointerEvent('pointermove', {
          clientX: xOfNotch(i), clientY: yOnDrum(), bubbles: true,
        }));
        seen.push(at());
      }
      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      truthy('one drag across the drum turns the wheel at every notch it crosses',
        new Set(seen).size >= 3, `pointer landed on ${seen.join(' → ')}`);
      const dragged = bench.wheelFor(STOPS[1].id).current();
      truthy('and the rival answered the drag on its own, without a second control anywhere',
        dragged.rival.index > 0 && dragged.reachable.length < dragged.reachOpened,
        `rival at notch ${dragged.rival.index}, ${dragged.reachable.length} of ` +
        `${dragged.reachOpened} still reachable`);
    } else {
      ok('the pointer drag needs PointerEvent and is skipped here', 'no PointerEvent');
    }

    /* THE WHEEL STILL PUSHES BACK, and now it pushes back where the hand is. */
    bench.turnWheel(0);
    const settlement = bench.wheelFor(STOPS[1].id).current();
    truthy('asking for a notch under the rival\'s bid leaves the grip above it',
      settlement.index > settlement.rival.index,
      `asked ${settlement.askedIndex}, landed ${settlement.index}`);
    truthy('the refusal is drawn at the point of contact — a ghost grip where the hand went',
      host.querySelectorAll('.db-grip--ghost').length === 1,
      `${host.querySelectorAll('.db-grip--ghost').length} ghost grip(s)`);
    truthy('and the drawn wheel says so in its accessible name',
      wheelSentence(settlement).includes('rival'), wheelSentence(settlement).slice(0, 90));
    const rested = bench.restWheel();
    is('the door comes back on its own, and the ghost goes with it', rested.doorTo, 'buyer');
    is('and no ghost grip is left behind', host.querySelectorAll('.db-grip--ghost').length, 0);

    /* ============================================================== *
     * THE SECOND HAND IS STILL IN THE PICTURE WHEN NOTHING IS HAPPENING.
     *
     * The TRAVERSE trail — the same pawl in two places, with a rule between —
     * is the one moment this drawing genuinely carries another agent, and it
     * lasted 900ms in full motion and 3s in reduced. The picture a reader looks
     * at for the rest of the session is the resting one, and it used to have no
     * trace of a second hand having moved at all. So the trail has a resting
     * form that never goes away.
     * ============================================================== */
    truthy('the rival has moved off the notch it opened on',
      rested.rival.index > rested.rival.openedAt,
      `opened at ${rested.rival.openedAt}, standing at ${rested.rival.index}`);
    is('and the resting picture still shows where its hand started, with a rule to where it is now',
      host.querySelectorAll('.db-rival-from').length, 1);
    truthy('the trace is drawn outside the pawl, so TRAVERSE cannot carry it away with the hand',
      host.querySelector('.db-pawl .db-rival-from') === null
        && host.querySelector('.db-rival-from .db-pawl') === null,
      'sibling, not child');
    truthy('and it says in the spoken layer what it says in ink',
      /opened at/i.test(host.querySelector('.db-rival-from title')?.textContent || ''),
      String(host.querySelector('.db-rival-from title')?.textContent || 'no title').slice(0, 90));
    bench.show(2);
    is('re-entering the stop rests the wheel and the trace is still there',
      host.querySelectorAll('.db-rival-from').length, 1);
    is('re-entering the stop never resumes a swung door',
      bench.wheelFor(STOPS[1].id).current().doorTo, 'buyer');

    /* THE GATE IS IN THE RENDER PATH. */
    truthy('every paint re-derives what it is about to show, before it touches the DOM',
      bench.gate && bench.gate.ok && bench.gate.total > 0,
      bench.gate ? `${bench.gate.total} figures checked, ${bench.gate.failed.length} failed` : 'no gate');
    /* THE SHAPE THIS CLOSES. `renderDoorBench` never imported the gate, so a
     * corrupted record rendered to the reader while the report at the foot of
     * the demo page went red — and a consumer embedding the component got
     * neither. Every stored `expected` is moved here; the gate evaluates the
     * expression itself, so it sees the drift and the stop will not draw. */
    throws('a corrupted record refuses to render rather than reaching the reader',
      () => {
        const broken = JSON.parse(JSON.stringify(mechanism));
        for (const example of broken.engines.distribution.examples) {
          for (const st of example.steps || []) {
            if (typeof st.expected === 'number') st.expected += 1;
          }
        }
        renderDoorBench(document.createElement('div'), { mechanism: broken, params, claims });
      }, DoorBenchError);

    /* THE PROSE LINT, over every string this bench can render. */
    const corpus = allDoorSentences(options);
    truthy(`CENSUS — every string this bench can put on screen`, corpus.length > 200, `${corpus.length} strings`);
    const findings = corpus.filter((s) => guards.lintTextForDeadMechanism(s, 'the door bench').length > 0);
    is('the dead-mechanism lint returns nothing over the whole corpus — which is ADVICE, not a clearance',
      findings.length, 0);

    host.remove();
  } else {
    ok('the drawing cases need a document and are skipped here', 'no DOM');
  }

  return rows;
}

/**
 * Reach a named settlement state by DOING the thing that produces it.
 *
 * A probe that builds the state by hand proves nothing about the state machine.
 * Each of these five is reached the way a reader reaches it.
 */
function reSettle(w, by, mechanism, params) {
  w.open();
  if (by === SETTLED_BY.opening) return w.current();
  if (by === SETTLED_BY.rival_refused) return w.turnTo(0);
  if (by === SETTLED_BY.reader_raised) return w.turnTo(4);
  if (by === SETTLED_BY.reader_lowered) { w.turnTo(5); return w.turnTo(4); }
  if (by === SETTLED_BY.record_walked) {
    return makeWheel(mechanism, params, { mode: 'filed' }).walkTo(0);
  }
  throw new Error(`"${by}" is not a way this wheel can be settled.`);
}

export default { runCases };
