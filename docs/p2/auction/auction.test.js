/**
 * docs/p2/auction/auction.test.js — the bench's own bench.
 *
 * Team B4. Every case here is a way to make the auction teach something false.
 *
 * The rule the library set and this file keeps: **a test suite that only
 * exercises the routes that work measures nothing.** Every guarantee this
 * folder claims has a case that tries to break it, and every bypass found while
 * building it is a permanent row.
 *
 * No framework, no build step. `runCases(frozen)` returns rows; the HTML page
 * renders them and prints its own tally. Trust the tally over any number
 * written in the README.
 */

import * as guards from '../lib/guards.js';
import {
  mintCast, rankingView, deliveryView, rank, clicksForSlot, runAuction,
  priceForSlot, sealedBidPanel, LeakError, EngineError,
} from './engine.js';
import {
  mintReading, readingText, readingQualifiers, moneyAsMeasured, ReadoutError,
} from './readouts.js';
import {
  mintBand, unlocatedBand, lowestEnvyFree, naiveTruthful, oneShader, vcg, envyCheck,
  bandSentence, BandError,
} from './band.js';
import {
  mintPanel, resolveSettings, settingsProvenance, panelChannels, lintRenderedStrings,
  assertNoUnappliedFormatMultiplier, PanelError,
} from './panels.js';
import {
  evaluate, auctionSteps, checkRecordSelfConsistent, checkFiguresAgainstRecord,
  stepCoverage, ArithmeticError,
} from './arithmetic.js';
import { SCENARIOS, defaultState, castNames, viewFigures } from './scenarios.js';
import { renderBench, domSentences, drawBand, bandEnds, allBenchSentences } from './bench.js';

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
      detail: good ? `${err.name}: ${String(err.message).split('\n')[0].slice(0, 120)}`
        : `threw ${err.name}, wanted ${expectedType.name}`,
    });
  }
}

/* ------------------------------------------------------------------ */

export function runCases(frozen) {
  rows.length = 0;
  const mechanism = frozen.mechanism;
  const params = frozen.simulatorParams;

  /* ================================================================ */
  section('1 · the record re-runs');

  const self = checkRecordSelfConsistent(mechanism);
  is('every stored auction step re-evaluates to its stored value', self.failed.length, 0);
  truthy(`CENSUS — the auction engine stores ${self.total} machine-checkable steps`, self.total > 100, self.total);
  throws('a record with no auction examples is a hard error, never a quiet pass',
    () => auctionSteps({ engines: { auction: {} } }), ArithmeticError);

  /* ================================================================ */
  section('2 · the evaluator is a parser, not eval');

  is('it agrees with Python on right-associative powers', evaluate('2**3**2'), 512);
  is('it agrees with Python on unary minus under a power', evaluate('-2**2'), -4);
  is('it reads the record\'s own notation', evaluate('(0.03/0.08)**(0.5-1)'), 1.632993161855452, 1e-12);
  throws('an identifier is refused', () => evaluate('process.exit(1)'), ArithmeticError);
  throws('a statement separator is refused', () => evaluate('1;alert(1)'), ArithmeticError);
  throws('a bare word is refused', () => evaluate('Math.random()'), ArithmeticError);
  throws('unbalanced parentheses are refused', () => evaluate('(1+2'), ArithmeticError);

  /* ================================================================ */
  section('3 · the ranker cannot see what really happened');

  const leakyCast = mintCast({
    names: ['A', 'B'], bids: [2, 1], predictedCtrs: [0.05, 0.02], trueCtrs: [0.01, 0.02],
  });
  const ranking = rankingView(leakyCast);
  const delivery = deliveryView(leakyCast);
  truthy('a ranking row has no trueCtr key at all',
    ranking.every((r) => !('trueCtr' in r)), Object.keys(ranking[0]).join(','));
  truthy('a delivery row has no bid and no quality key',
    delivery.every((r) => !('bid' in r) && !('quality' in r)), Object.keys(delivery[0]).join(','));
  throws('rank() refuses a row carrying the true click rate',
    () => rank(leakyCast.map((r) => ({ ...r, quality: r.predictedCtr })), {}), LeakError);
  throws('the click count refuses a row carrying a bid',
    () => clicksForSlot(leakyCast.map((r) => ({ ...r })), 'b1', 0,
      { impressions: 1000, positionMultipliers: [1] }), LeakError);
  /* THE MERGE. mintCast used to fill a missing true click rate from the
   * seller's forecast, which makes sc-07 render and teach nothing. */
  throws('a cast with a short true-click-rate array is refused, never filled in from the forecast',
    () => mintCast({ names: ['A', 'B'], bids: [2, 1], predictedCtrs: [0.05, 0.02], trueCtrs: [0.05] }),
    EngineError);
  throws('a cast with no true click rates at all is refused',
    () => mintCast({ names: ['A'], bids: [2], predictedCtrs: [0.05] }), EngineError);
  truthy('the two arrays stay separate where the record makes them differ',
    leakyCast[0].predictedCtr === 0.05 && leakyCast[0].trueCtr === 0.01,
    `predicted ${leakyCast[0].predictedCtr}, true ${leakyCast[0].trueCtr}`);

  /* ================================================================ */
  section('4 · a money figure cannot reach the screen without its mode');

  throws('minting revenue with no bidder mode is refused',
    () => mintReading({ usd: 52.58, role: 'money', label: 'revenue' }), ReadoutError);
  throws('a counterfactual with no stated counterfactual is refused',
    () => mintReading({ usd: 66, role: 'money', mode: 'custom', label: 'pay your bid', counterfactual: true }),
    ReadoutError);
  throws('a figure with no label is refused',
    () => mintReading({ usd: 1, role: 'ratio', label: 'x' }), ReadoutError);
  throws('a figure the record does not carry is refused rather than printed as a dash',
    () => mintReading({ usd: null, role: 'ratio', label: 'average price per click' }), ReadoutError);
  throws('the formatter refuses a plain number',
    () => readingText(52.58), ReadoutError);
  throws('the formatter refuses a hand-built look-alike',
    () => readingText({ usd: 52.58, role: 'money', mode: 'custom', label: 'revenue' }), ReadoutError);
  ok('a minted money figure prints with its mode beside it',
    readingText(mintReading({
      usd: 52.58, role: 'money', mode: 'custom', label: 'revenue', stepRef: '50*0.81+8*1.51',
    })));
  /* THE TILL. Every reading names a stored step or a written derivation. */
  throws('a figure that says nothing about where it comes from is refused',
    () => mintReading({ usd: 52.58, role: 'money', mode: 'custom', label: 'revenue' }), ReadoutError);
  throws('a figure claiming both a stored step and a derivation is refused',
    () => mintReading({
      usd: 52.58, role: 'money', mode: 'custom', label: 'revenue',
      stepRef: '50*0.81+8*1.51', derivedFrom: 'and also worked out here somehow',
    }), ReadoutError);
  throws('a throwaway derivation is refused',
    () => mintReading({ usd: 1, role: 'ratio', label: 'a ratio', derivedFrom: 'maths' }), ReadoutError);
  truthy('a derived figure says so on screen, beside itself',
    readingQualifiers(mintReading({
      usd: 3.5, role: 'money', mode: 'custom', label: 'revenue at this knob',
      derivedFrom: 'the clicks at this setting, times the price at this setting',
    })).some((q) => /where this comes from/.test(q)));

  /* ================================================================ */
  section('5 · THE BAND');

  const values = [10, 6, 2];
  const clicks = [100, 80];
  const floor = lowestEnvyFree(values, clicks);
  const ceiling = naiveTruthful(values, clicks);
  const shader = oneShader(values, clicks, 5);
  const vcgOut = vcg(values, clicks);
  is('the lowest equilibrium price in slot 2', floor.prices[1], 2.0);
  is('the lowest equilibrium price in slot 1', floor.prices[0], 2.8);
  is('the lowest equilibrium collects $440', floor.revenue, 440);
  is('VCG collects the same $440', vcgOut.revenue, 440);
  is('naive truthful play collects $760', ceiling.revenue, 760);
  is('one shader at $5 collects $660', shader.revenue, 660);
  is('the band is 1.727 times wide', ceiling.revenue / floor.revenue, 1.7272727272727273);
  const envy = envyCheck(values, clicks, floor.prices);
  is('at the floor the second bidder is exactly indifferent',
    envy[0].payoffHere - envy[0].payoffOneUp, 0);

  const reading = (usd, mode, label, stepRef) =>
    mintReading({ usd, role: 'money', mode, label, stepRef });
  const band = mintBand({
    unit: 'over 180 clicks',
    floor: reading(floor.revenue, 'lowest_envy_free', 'floor', '100*2.8+80*2.0'),
    ceiling: reading(ceiling.revenue, 'naive_truthful', 'ceiling', '100*6+80*2'),
    marker: reading(shader.revenue, 'one_shader', 'marker', '100*5+80*2'),
  });
  is('the marker sits 68.75% of the way up the band', band.position, 0.6875);
  truthy('the band carries no scalar revenue field of its own',
    !('usd' in band) && !('revenue' in band), Object.keys(band).join(','));
  throws('a band built from a bare number is refused',
    () => mintBand({ floor: 440, ceiling: 760, marker: 660, unit: '' }), ReadoutError);
  throws('a band whose ceiling is under its floor is refused', () => mintBand({
    unit: '',
    floor: reading(760, 'naive_truthful', 'the floor', '100*6+80*2'),
    ceiling: reading(440, 'lowest_envy_free', 'the ceiling', '100*2.8+80*2.0'),
    marker: reading(600, 'one_shader', 'the marker', '100*5+80*2'),
  }), BandError);

  /* THE CLAMP. This is the worst defect the bench has carried: two scenarios
   * pre-clamped the marker into the track and the drawing clamped it again, so
   * the money zone and the band showed different revenues at the same time. */
  throws('a marker below the floor is refused, never clamped up to it', () => mintBand({
    unit: 'over 180 clicks',
    floor: reading(440, 'lowest_envy_free', 'the floor', '100*2.8+80*2.0'),
    ceiling: reading(760, 'naive_truthful', 'the ceiling', '100*6+80*2'),
    marker: mintReading({
      usd: 361, role: 'money', mode: 'one_shader', label: 'the marker',
      derivedFrom: 'the seller at Vale\'s own bottom stop',
    }),
  }), BandError);
  throws('a marker above the ceiling is refused too', () => mintBand({
    unit: 'over 180 clicks',
    floor: reading(440, 'lowest_envy_free', 'the floor', '100*2.8+80*2.0'),
    ceiling: reading(760, 'naive_truthful', 'the ceiling', '100*6+80*2'),
    marker: mintReading({
      usd: 761.8, role: 'money', mode: 'naive_truthful', label: 'the marker',
      derivedFrom: 'truthful play with the one-cent increment switched on',
    }),
  }), BandError);
  const excursion = mintBand({
    unit: 'over 180 clicks',
    floor: reading(440, 'lowest_envy_free', 'the floor', '100*2.8+80*2.0'),
    ceiling: reading(760, 'naive_truthful', 'the ceiling', '100*6+80*2'),
    marker: mintReading({
      usd: 361, role: 'money', mode: 'one_shader', modeNote: 'Vale bids $2.01', label: 'the marker',
      derivedFrom: 'the seller at Vale\'s own bottom stop',
    }),
    excursion: 'Vale is bidding under the lowest equilibrium bid, so the seller falls under the band.',
  });
  is('an excursion keeps the marker where the mechanism put it', excursion.marker.usd, 361);
  truthy('and reads as outside, on the side it left',
    excursion.inside === false && excursion.outsideBelow === true, `position ${excursion.position}`);
  truthy('and its sentence says so, and says why',
    /below the band/.test(bandSentence(excursion, (v) => `$${v}`))
    && /lowest equilibrium bid/.test(bandSentence(excursion, (v) => `$${v}`)),
    bandSentence(excursion, (v) => `$${v}`));
  throws('an excursion with no written reason is refused', () => mintBand({
    unit: '',
    floor: reading(440, 'lowest_envy_free', 'the floor', '100*2.8+80*2.0'),
    ceiling: reading(760, 'naive_truthful', 'the ceiling', '100*6+80*2'),
    marker: mintReading({
      usd: 361, role: 'money', mode: 'one_shader', label: 'the marker',
      derivedFrom: 'the seller at some bid the record does not store',
    }),
    excursion: 'n/a',
  }), BandError);
  throws('an excursion declared on a marker that is inside is refused', () => mintBand({
    unit: '',
    floor: reading(440, 'lowest_envy_free', 'the floor', '100*2.8+80*2.0'),
    ceiling: reading(760, 'naive_truthful', 'the ceiling', '100*6+80*2'),
    marker: reading(660, 'one_shader', 'the marker', '100*5+80*2'),
    excursion: 'this marker is comfortably inside the band and says otherwise',
  }), BandError);

  /* THE MODE NOTE. bandSentence printed the generic MODE_LABEL and ignored the
   * modeNote every caller sets, so sc-04's opening position said one bidder was
   * shading while Vale was bidding its full value. */
  const noted = mintBand({
    unit: 'over 180 clicks',
    floor: reading(440, 'lowest_envy_free', 'the floor', '100*2.8+80*2.0'),
    ceiling: reading(760, 'naive_truthful', 'the ceiling', '100*6+80*2'),
    marker: mintReading({
      usd: 760, role: 'money', mode: 'one_shader', modeNote: 'Vale bids $10.00',
      label: 'the marker', stepRef: '100*6+80*2',
    }),
  });
  truthy('the band sentence reads the mode note the caller set, not the generic label',
    /Vale bids \$10\.00/.test(bandSentence(noted, (v) => `$${v}`))
    && !/one bidder shades, the rest/.test(bandSentence(noted, (v) => `$${v}`)),
    bandSentence(noted, (v) => `$${v}`));

  throws('an unlocated band with no written reason is refused',
    () => unlocatedBand('n/a'), BandError);
  ok('an unlocated band says why in a sentence a reader can use',
    bandSentence(unlocatedBand('The record holds these bids fixed and never says what the bidders were worth.')));

  /* ================================================================ */
  section('6 · the dead-mechanism guard, at the panel');

  guards.assertSimulatorMechanismScopes();
  ok('G7 passes over the whole frozen file');
  throws('search cannot be declared as first price',
    () => guards.assertMechanism2019({ channel: 'search', mechanism: 'first_price' }), Error);
  throws('the first-price panel cannot be minted as the search panel',
    () => mintPanel('sc-06-first-price-bid-shading-panel', { channel: 'search' }), PanelError);
  const display = mintPanel('sc-06-first-price-bid-shading-panel');
  is('the first-price panel is display, and the record decided that', display.channel, 'display');
  is('its mechanism is read out of the record, never typed', display.mechanism, 'first_price');
  truthy('the record\'s own true sentence is on the panel',
    display.captions.some((c) => /never (moved|did)/i.test(c)), display.trueSentence);
  truthy('the required caption reaches the screen',
    display.requiredCaptions.every((c) => display.captions.some((r) => r.includes(c))),
    display.requiredCaptions.join(' | '));
  throws('a rendered panel that drops the required caption is refused',
    () => guards.assertScenarioMechanism({
      id: 'sc-06-first-price-bid-shading-panel',
      channel: 'display', mechanism: 'first_price',
      captions: ['A first-price auction pays the seller the same money.'],
    }), Error);
  const search = mintPanel('sc-10-era-6-vs-era-7-side-by-side', { channel: 'search' });
  is('the search half of sc-10 declares rGSP', search.mechanism, 'rgsp');
  truthy('sc-10 is the one scenario the record puts on two surfaces',
    panelChannels(search.record, params).length === 2,
    panelChannels(search.record, params).join(','));
  throws('a scenario the record does not hold cannot be drawn',
    () => mintPanel('sc-99-invented'), PanelError);

  /* ================================================================ */
  section('7 · the worked example the chapter prints');

  const ex1Names = castNames(mechanism, 'ex-1-quality-vs-pure-bid');
  const ex1 = mintCast({
    names: ex1Names, bids: [3, 2, 1],
    predictedCtrs: [0.01, 0.02, 0.05], trueCtrs: [0.01, 0.02, 0.05],
  });
  const gsp = runAuction(ex1, {
    impressions: 1000, slots: 2, positionMultipliers: [1.0, 0.4],
    rankingRule: 'quality_weighted', pricingRule: 'second_price',
    increment: 0.01, reserve: 0.01,
  });
  /* THE DEFAULTS. runAuction used to default the position multipliers, the
   * increment and the reserve to the values the record happens to carry for
   * sc-01, sc-02 and sc-03. Six malformed inputs rendered authoritatively. */
  const settingsFor = (drop) => {
    const full = {
      impressions: 1000, slots: 2, positionMultipliers: [1.0, 0.4],
      rankingRule: 'quality_weighted', pricingRule: 'second_price',
      increment: 0.01, reserve: 0.01,
    };
    delete full[drop];
    return full;
  };
  for (const key of ['impressions', 'slots', 'positionMultipliers',
    'rankingRule', 'pricingRule', 'increment', 'reserve']) {
    throws(`runAuction with no ${key} stops instead of guessing one`,
      () => runAuction(ex1, settingsFor(key)), EngineError);
  }
  throws('the squashed rule with no gamma stops instead of assuming 1',
    () => runAuction(ex1, { ...settingsFor('nothing'), rankingRule: 'squashed' }), EngineError);
  throws('fewer position multipliers than slots is refused',
    () => runAuction(ex1, { ...settingsFor('nothing'), positionMultipliers: [1.0] }), EngineError);

  is('Brindle scores $2.00 times 2%, which is 0.040', 2.00 * 0.02, 0.04);
  is('0.040 divided by Cedar\'s 5% is $0.80', 0.04 / 0.05, 0.80);
  is('so Cedar pays $0.81', gsp.rows[0].price, 0.81, 1e-12);
  is('and Brindle pays $1.51', gsp.rows[1].price, 1.51, 1e-12);
  is('the bench collects $52.58 per 1,000 impressions', gsp.revenue, 52.58, 1e-12);
  is('on 58 clicks', gsp.clicks, 58);
  is('at 90.66 cents a click', gsp.avgPricePerClick, 0.9065517241379311, 1e-12);

  const pure = runAuction(ex1, {
    impressions: 1000, slots: 2, positionMultipliers: [1.0, 0.4],
    rankingRule: 'pure_bid', pricingRule: 'second_price', increment: 0.01, reserve: 0.01,
  });
  is('ranking by bid alone collects $28.18', pure.revenue, 28.18, 1e-12);
  is('the price per click FALLS 42%', gsp.avgPricePerClick / pure.avgPricePerClick, 0.5790607180441008, 1e-12);
  truthy('the gain is volume, not price',
    gsp.revenue > pure.revenue && gsp.avgPricePerClick < pure.avgPricePerClick,
    `revenue ${gsp.revenue} > ${pure.revenue}, price ${gsp.avgPricePerClick} < ${pure.avgPricePerClick}`);

  /* ================================================================ */
  section('8 · the pricing rules, at their edges');

  const one = mintCast({ names: ['Fern Financial'], bids: [2], predictedCtrs: [0.04], trueCtrs: [0.04] });
  const thin = (reserve) => runAuction(one, {
    impressions: 1000, slots: 1, positionMultipliers: [1.0],
    rankingRule: 'quality_weighted', pricingRule: 'second_price', increment: 0, reserve,
  });
  is('with no runner-up the price is the seller\'s floor', thin(1.0).rows[0].price, 1.0);
  is('and the seller collects 100 times more at a $1.00 floor than at a cent',
    thin(1.0).revenue / thin(0.01).revenue, 100);
  /* Under quality-weighted second price the cap can only bind through the
   * increment: the winner's own AdRank is at least the runner-up's, so the
   * runner-up's AdRank over the winner's quality is at most the winner's bid.
   * The tie below is the smallest case that reaches it. */
  const capped = priceForSlot(rank(rankingView(mintCast({
    names: ['Aster', 'Brindle'], bids: [1.0, 2.0],
    predictedCtrs: [0.02, 0.01], trueCtrs: [0.02, 0.01],
  })), { rule: 'quality_weighted' }), 0, {
    rankingRule: 'quality_weighted', pricingRule: 'second_price', increment: 0.01,
  });
  truthy('a price is capped at the advertiser\'s own maximum', capped.capBinds && capped.price === 1.0,
    `${capped.price} against a cap of ${capped.cap}, uncapped ${capped.uncapped}`);
  const fp = sealedBidPanel({ n: 3, ceiling: 10 });
  is('at three bidders both rules collect $5.00 exactly', fp.difference, 0);
  is('and both collect the same at ten bidders', sealedBidPanel({ n: 10, ceiling: 10 }).difference, 0, 1e-12);

  /* ================================================================ */
  section('9 · every figure on every panel re-derives from the record');

  const allFigures = [];
  let panelFails = 0;
  let lint = 0;
  for (const scenario of SCENARIOS) {
    const channels = scenario.centre === 'plates' ? ['display', 'search'] : [null];
    for (const channel of channels) {
      const panel = mintPanel(scenario.id, { channel });
      lint += panel.advisory.findings.length;
      const ctx = {
        settings: panel.settings, mechanism, params, record: panel.record, panel,
      };
      const controls = scenario.controls(ctx, defaultState(scenario, ctx));
      const candidates = controls.map((c) => (c.kind === 'rocker'
        ? c.options.map((o) => o.value)
        : [c.value, c.min, c.max, ...(c.stops || [])]));
      let combos = [{}];
      for (let i = 0; i < controls.length; i += 1) {
        const next = [];
        for (const combo of combos) for (const v of candidates[i]) next.push({ ...combo, [controls[i].id]: v });
        combos = next.slice(0, 2000);
      }
      let failed = 0;
      let unbacked = 0;
      let vacuous = 0;
      for (const combo of combos) {
        const view = scenario.build({ ...defaultState(scenario, ctx), ...combo }, ctx);
        /* THE WHOLE VIEW. The ledger, the MONEY zone and every reading the band
         * puts on screen, checked by one gate against one record. */
        const shown = viewFigures(view);
        const check = checkFiguresAgainstRecord(shown, mechanism);
        allFigures.push(...shown);
        failed += check.failed.length;
        unbacked += check.unbacked.length;
        if (check.vacuous) vacuous += 1;
      }
      panelFails += failed + unbacked + vacuous;
      const label = `${scenario.id}${channel ? ` · ${channel}` : ''}`;
      rows.push({
        group, name: `${label} — ${combos.length} control positions`,
        pass: failed === 0 && unbacked === 0 && vacuous === 0,
        detail: failed + unbacked + vacuous === 0 ? 'every figure matches its stored step'
          : `${failed} wrong, ${unbacked} with no step behind them, ${vacuous} checked nothing`,
      });
    }
  }
  is('no figure anywhere on the bench misses its stored step', panelFails, 0);
  const coverage = stepCoverage(allFigures, mechanism);
  rows.push({
    group,
    name: `CENSUS — stored steps a bench figure claims`,
    pass: coverage.claimed === coverage.total,
    detail: `${coverage.claimed} of ${coverage.total}` +
      (coverage.unclaimed.length ? ` · unclaimed: ${coverage.unclaimed.map((s) => s.expr).join(' , ')}` : ''),
  });
  rows.push({
    group, name: 'ADVICE — the prose lint over every scenario string',
    pass: true,
    detail: `${lint} finding(s). An empty result is not a clearance; the scope check above is.`,
  });

  /* ================================================================ */
  section('10 · the gate itself can fail');

  const bad = checkFiguresAgainstRecord(
    [{ label: 'a wrong revenue', value: 52.59, step: '50*0.81+8*1.51' }], mechanism);
  truthy('a figure that misses its step is reported', bad.failed.length === 1, bad.failed.length);
  const naked = checkFiguresAgainstRecord([{ label: 'a number from nowhere', value: 3 }], mechanism);
  truthy('a figure with no step behind it is never passed', naked.unbacked.length === 1 && !naked.ok,
    `${naked.unbacked.length} unbacked`);
  const invented = checkFiguresAgainstRecord(
    [{ label: 'a made-up step', value: 1, step: '1+0' }], mechanism);
  truthy('a step the record does not hold is refused', invented.failed.length === 1, invented.failed.length);
  /* THE VACUOUS PASS. `rows.every(...)` is true of an empty array, so a panel
   * that handed the gate nothing came back green with money on screen. */
  const nothing = checkFiguresAgainstRecord([], mechanism);
  truthy('a gate handed no figures at all fails, and says it checked nothing',
    nothing.ok === false && nothing.vacuous === true, nothing.vacuousReason);
  const onlyDerived = checkFiguresAgainstRecord(
    [{ label: 'a figure worked out here', value: 3, formula: 'the clicks times the price' }], mechanism);
  truthy('a gate handed only derived figures fails too — nothing was checked',
    onlyDerived.ok === false && onlyDerived.vacuous === true && onlyDerived.derived.length === 1,
    `${onlyDerived.derived.length} derived, ${onlyDerived.total} checked`);
  const mixed = checkFiguresAgainstRecord([
    { label: 'a figure worked out here', value: 3, formula: 'the clicks times the price' },
    { label: 'a real one', value: 52.58, step: '50*0.81+8*1.51' },
  ], mechanism);
  truthy('one step-backed figure is enough to make the check non-vacuous',
    mixed.ok === true && mixed.derived.length === 1 && mixed.total === 1, `${mixed.total} checked`);

  /* ================================================================ */
  section('11 · the settings resolver');

  const sc03 = resolveSettings('sc-03-winners-pay-less-than-bid', params);
  is('sc-03 inherits sc-02\'s ranking rule', sc03.ranking_rule, 'quality_weighted');
  is('and sc-02\'s bids come through', sc03.bids.join(','), '3,2,1');
  truthy('the inherits key never survives into the settings the engine reads',
    !('inherits' in sc03), Object.keys(sc03).join(','));
  throws('a settings cycle is a hard error, not an infinite loop',
    () => resolveSettings('sc-02-quality-weighting-both-metrics',
      { scenarios: [
        { id: 'sc-02-quality-weighting-both-metrics', settings: { inherits: 'x' } },
        { id: 'x', settings: { inherits: 'sc-02-quality-weighting-both-metrics' } },
      ] }), PanelError);

  /* ================================================================ */
  section('12 · a setting the record carries is never guessed');

  /* THE DEFECT MOVED UP A LAYER. `engine.js` was fixed to throw on an absent
   * setting, and `scenarios.js` still carried six literal fallbacks, each one
   * equal to what the record holds. Delete the setting and the panel rendered
   * the record's own numbers, with a green gate, and nothing said the input was
   * missing. Each case below deletes one and asks the panel to build. */
  const withoutSetting = (id, cut) => {
    const copy = JSON.parse(JSON.stringify(params));
    cut(copy.scenarios.find((s) => s.id === id));
    return copy;
  };
  /* `mintPanel` reads the frozen file, so each case installs the damaged one
   * and puts the real one back. That is the path the page takes. */
  const buildWith = (n, file) => {
    const scenario = SCENARIOS.find((s) => s.n === n);
    const panel = mintPanel(scenario.id);
    const ctx = { settings: panel.settings, mechanism, params: file, record: panel.record, panel };
    return scenario.build(defaultState(scenario, ctx), ctx);
  };
  const deletions = [
    ['sc-06 with no n_bidders', 6, 'sc-06-first-price-bid-shading-panel', (s) => { delete s.settings.n_bidders; }],
    ['sc-06 with no value_ceiling', 6, 'sc-06-first-price-bid-shading-panel', (s) => { delete s.settings.value_ceiling; }],
    ['sc-08 with no reserve.compare', 8, 'sc-08-reserve-is-a-posted-price', (s) => { delete s.settings.reserve.compare; }],
    ['sc-08 with no reserve at all', 8, 'sc-08-reserve-is-a-posted-price', (s) => { delete s.settings.reserve; }],
    ['sc-09 with no gamma block', 9, 'sc-09-pricing-knobs-coda', (s) => { delete s.settings.gamma; }],
    ['sc-09 with no gamma.marked_stops', 9, 'sc-09-pricing-knobs-coda', (s) => { delete s.settings.gamma.marked_stops; }],
    ['sc-09 with no format_multiplier', 9, 'sc-09-pricing-knobs-coda', (s) => { delete s.settings.format_multiplier; }],
  ];
  for (const [name, n, id, cut] of deletions) {
    const file = withoutSetting(id, cut);
    const before = guards.getFrozen('simulatorParams');
    guards.setFrozen('simulatorParams', file);
    throws(`${name} stops the panel rather than rendering the record's numbers anyway`,
      () => buildWith(n, file), Error);
    guards.setFrozen('simulatorParams', before);
  }

  /* THE WORST OF THEM. sc-07's whole subject is the gap between the seller's
   * forecast and what happened. Delete its `true_ctrs` override and it inherits
   * sc-02's, which equal sc-02's `predicted_ctrs` — so the forecast becomes the
   * truth, the panel renders $52.58 and the gate goes green. `mintCast` cannot
   * catch it: it guards the array's LENGTH and an inherited array is full
   * length. What is missing is the array's provenance. */
  {
    const file = withoutSetting('sc-07-ctr-misestimation', (s) => { delete s.settings.true_ctrs; });
    const before = guards.getFrozen('simulatorParams');
    guards.setFrozen('simulatorParams', file);
    throws('sc-07 refuses to run on a true click rate it inherited from sc-02',
      () => buildWith(7, file), Error);
    const provenance = settingsProvenance('sc-07-ctr-misestimation', params);
    is('and with the record intact the truth is sc-07\'s own',
      provenance.true_ctrs, 'sc-07-ctr-misestimation');
    is('while the bids under it still come from sc-02',
      provenance.bids, 'sc-02-quality-weighting-both-metrics');
    guards.setFrozen('simulatorParams', before);
  }

  /* THE FORMAT MULTIPLIER. The engine defaulted one to 1 and no scenario ever
   * set it, while the record carried `format_multiplier: 1.0` on sc-01 and
   * sc-02 — so the default was right by luck, which is the thing the paragraph
   * above it in engine.js was written to forbid. The parameter is gone. */
  throws('runAuction refuses a format multiplier rather than defaulting one',
    () => runAuction(mintCast({
      names: ['A', 'B'], bids: [2, 1], predictedCtrs: [0.02, 0.01], trueCtrs: [0.02, 0.01],
    }), {
      impressions: 1000, slots: 1, positionMultipliers: [1.0], rankingRule: 'quality_weighted',
      pricingRule: 'second_price', increment: 0.01, reserve: 0.01, formatMultiplier: 1.25,
    }), EngineError);
  throws('and a record that asks for one is refused rather than ignored',
    () => assertNoUnappliedFormatMultiplier('sc-02-quality-weighting-both-metrics',
      { format_multiplier: 1.25 }), PanelError);
  truthy('the identity is read, checked and allowed',
    assertNoUnappliedFormatMultiplier('sc-02-quality-weighting-both-metrics',
      { format_multiplier: 1.0 }) != null);
  {
    const sc09 = SCENARIOS.find((s) => s.n === 9);
    const panel = mintPanel(sc09.id);
    const ctx = { settings: panel.settings, mechanism, params, record: panel.record, panel };
    const control = sc09.controls(ctx, defaultState(sc09, ctx)).find((c) => c.id === 'format');
    const stops = panel.record.settings.format_multiplier.marked_stops;
    truthy('sc-09\'s format control takes its positions from the record\'s own marked stops',
      control.options.map((o) => Number(o.value)).join(',') === stops.join(','),
      `${control.options.map((o) => o.value).join(',')} against ${stops.join(',')}`);
  }

  /* ================================================================ */
  section('13 · the band draws the number it is a label for');

  /* THE DRAWING DISAGREED WITH ITS OWN ACCESSIBLE NAME. The ends were printed
   * with `money(usd, 0)`, which is right for $440 and $760 and wrong for
   * sc-06's $4.50 and $5.50 — they drew as "$5" and "$6" while the money zone
   * printed $4.50 and the screen-reader sentence said $4.50 to $5.50. */
  is('a whole-dollar figure keeps its whole-dollar form', moneyAsMeasured(440), '$440');
  is('and a figure with cents keeps its cents', moneyAsMeasured(4.5), '$4.50');
  is('float noise on a whole dollar still reads as the whole dollar',
    moneyAsMeasured(440.00000000000006), '$440');
  is('and an excursion keeps the cent that put it outside', moneyAsMeasured(761.8), '$761.80');
  throws('it refuses a value the record does not carry',
    () => moneyAsMeasured(undefined), ReadoutError);

  if (typeof document !== 'undefined' && document.createElement) {
    const bandText = (band) => {
      const host = document.createElement('div');
      drawBand(host, band);
      bandEnds(host, band);
      const out = [];
      const walk = (node) => {
        if (node.nodeType === 1 && (String(node.tagName).toLowerCase() === 'text'
          || String(node.tagName).toLowerCase() === 'dt')) out.push(node.textContent);
        for (const child of Array.from(node.childNodes || [])) walk(child);
      };
      walk(host);
      return out;
    };
    let drawnDisagreements = 0;
    let bandsSeen = 0;
    for (const scenario of SCENARIOS) {
      const channels = scenario.centre === 'plates' ? ['display', 'search'] : [null];
      for (const channel of channels) {
        const panel = mintPanel(scenario.id, { channel });
        const ctx = { settings: panel.settings, mechanism, params, record: panel.record, panel };
        const controls = scenario.controls(ctx, defaultState(scenario, ctx));
        const candidates = controls.map((c) => (c.kind === 'rocker'
          ? c.options.map((o) => o.value)
          : [c.value, c.min, c.max, ...(c.stops || [])]));
        let combos = [{}];
        for (let i = 0; i < controls.length; i += 1) {
          const next = [];
          for (const combo of combos) for (const v of candidates[i]) next.push({ ...combo, [controls[i].id]: v });
          combos = next.slice(0, 2000);
        }
        for (const combo of combos) {
          const { band } = scenario.build({ ...defaultState(scenario, ctx), ...combo }, ctx);
          if (!band.located) continue;
          bandsSeen += 1;
          const drawn = bandText(band);
          const said = bandSentence(band, moneyAsMeasured);
          for (const reading of [band.floor, band.ceiling, ...band.stops]) {
            if (!drawn.includes(moneyAsMeasured(reading.usd))) drawnDisagreements += 1;
          }
          /* every number the track draws is also spoken, stops included */
          for (const reading of [band.floor, band.ceiling, band.marker, ...band.stops]) {
            if (!said.includes(moneyAsMeasured(reading.usd))) drawnDisagreements += 1;
          }
          /* the ratio a reader reads must be the ratio of the ends a reader sees */
          if (band.ratio.toFixed(3) !== (band.ceiling.usd / band.floor.usd).toFixed(3)) {
            drawnDisagreements += 1;
          }
        }
      }
    }
    truthy(`CENSUS — ${bandsSeen} located bands drawn across every named control position`,
      bandsSeen > 0, bandsSeen);
    is('no drawn band label disagrees with its own value or with the spoken sentence',
      drawnDisagreements, 0);

    /* THE CASE THAT FIRED. sc-06 at 0.60, one of the record's own named stops. */
    const sc06 = SCENARIOS.find((s) => s.n === 6);
    const panel06 = mintPanel(sc06.id);
    const ctx06 = {
      settings: panel06.settings, mechanism, params, record: panel06.record, panel: panel06,
    };
    const view06 = sc06.build({ ...defaultState(sc06, ctx06), shading: 0.6 }, ctx06);
    const drawn06 = bandText(view06.band);
    truthy('sc-06 at shading 0.60 draws $4.50 and $5.50, not $5 and $6',
      drawn06.includes('$4.50') && drawn06.includes('$5.50')
      && !drawn06.includes('$6'), drawn06.join(' · '));
  }

  /* ================================================================ */
  section('14 · the prose lint reads the page, not six fields');

  /* WHAT G7'S OWN LINT NEVER SAW. `mintPanel` hands the guard the object it
   * built — id, channel, mechanism, title, headline, captions. The teaching
   * line, the control notes, the note under the instrument, the band's note,
   * the plate sentences, every figure label and every written derivation are
   * built later and were never in front of it. Each case below writes the false
   * 2019 claim into one of those surfaces and asks whether anything notices. */
  const HOSTILE_2019 = 'In 2019 search moved to first price.';
  truthy('the lint pointed at a page fires on the false claim',
    lintRenderedStrings([HOSTILE_2019], 'a test string').findings.length === 1);
  truthy('and returns nothing on the record\'s own true sentence',
    lintRenderedStrings([guards.mechanismSentence('search', mechanism)], 'a test string')
      .findings.length === 0);
  {
    const sc10 = SCENARIOS.find((s) => s.n === 10);
    const panel10 = mintPanel(sc10.id, { channel: 'search' });
    const ctx10 = {
      settings: panel10.settings, mechanism, params, record: panel10.record, panel: panel10,
    };
    const view10 = sc10.build(defaultState(sc10, ctx10), ctx10);
    /* G7 sees the panel object and nothing else, which is the whole finding. */
    is('G7\'s own lint sees nothing when the claim is in the teaching line',
      lintRenderedStrings([HOSTILE_2019, ...panel10.captions], 'the panel object').findings.length, 1);
    const surfaces = [
      ['teaches', sc10.teaches],
      ['the note under the instrument', view10.note],
      ['the band note', view10.band.note],
      ['a plate sentence', view10.centre.plates.map((p) => `${p.channel} ${p.what}`).join('. ')],
      ['a figure label', view10.readout.map((r) => r.label).join('. ')],
      ['a derivedFrom line', view10.readout.map((r) => r.derivedFrom || '').join('. ')],
      ['the control note', sc10.controls(ctx10, defaultState(sc10, ctx10)).map((c) => c.note).join('. ')],
    ];
    let clean = 0;
    for (const [name, text] of surfaces) {
      const found = lintRenderedStrings([text], `sc-10 ${name}`).findings.length;
      if (found === 0) clean += 1;
      truthy(`sc-10 · ${name} does not teach the false 2019 claim`, found === 0, text);
    }
    is('all seven sc-10 string sources are clean', clean, surfaces.length);
  }
  {
    /* AND THE WIRING IS LIVE, not decorative: the same lint, over the whole
     * rendered corpus, and over a corpus with one hostile string in it. */
    const corpus = allBenchSentences({ mechanism, params });
    const clean = lintRenderedStrings(corpus, 'every string the bench can emit');
    rows.push({
      group,
      name: `CENSUS — the lint reads ${clean.scanned} rendered strings, all ten scenarios, every named stop`,
      pass: clean.findings.length === 0,
      detail: clean.note,
    });
    const poisoned = lintRenderedStrings([...corpus, HOSTILE_2019], 'the same corpus, poisoned');
    truthy('a corpus with one false sentence in it comes back with exactly one finding',
      poisoned.findings.length === 1, `${poisoned.findings.length}`);
  }

  /* ================================================================ */
  section('15 · the apparatus, rendered');

  if (typeof document !== 'undefined' && document.createElement) {
    const host = document.createElement('div');
    const bench = renderBench(host, {
      scenario: 4, mechanism, params,
    });
    const findAll = (node, pred, out = []) => {
      if (node.nodeType === 1) {
        if (pred(node)) out.push(node);
        for (const child of Array.from(node.childNodes)) findAll(child, pred, out);
      }
      return out;
    };
    const sliders = () => findAll(bench.element,
      (n) => String(n.tagName).toLowerCase() === 'input' && n.getAttribute('type') === 'range');

    /* THE DRAG. paint() used to rebuild every control inside the input
     * handler, so the range input a reader was dragging was removed from the
     * document on the first `input` event of the gesture and the knob stopped
     * following the hand. */
    const first = sliders()[0];
    truthy('sc-04 puts a range control on the page', Boolean(first),
      `${sliders().length} range input(s)`);
    let sameElement = true;
    for (const step of ['9.00', '8.00', '7.00', '5.00']) {
      const live = sliders()[0];
      if (live !== first) sameElement = false;
      live.value = step;
      if (typeof live.dispatchEvent === 'function') {
        live.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (typeof live.dispatch === 'function') {
        live.dispatch('input');
      }
    }
    truthy('the slider is the same element after four steps of a drag', sameElement,
      sameElement ? 'never replaced' : 'REPLACED MID-GESTURE');
    truthy('and it is still the slider the bench is reading', sliders()[0] === first);

    /* THE SENTENCE SET. It reads the page, not a list somebody kept. */
    const said = bench.sentences();
    truthy(`CENSUS — the rendered panel holds ${said.length} reader-facing strings`,
      said.length > bench.narratedSentences().length,
      `${said.length} on screen against ${bench.narratedSentences().length} narrated while drawing`);
    /* Not verbatim equality: the till renders a figure as a label, a number
     * and its qualifiers in three nodes, while the narrated form joins them
     * into one sentence — and that joined form is what the live region says. */
    truthy('every sentence the drawing narrates reaches the page, whole or inside a longer one',
      bench.narratedSentences().every((line) => said.some((shown) => shown.includes(line))));
    truthy('the sentence set is de-duplicated', new Set(said).size === said.length);
    is('domSentences on an empty node returns nothing',
      domSentences(document.createElement('div')).length, 0);

    /* THE EXCURSION, END TO END. */
    bench.setControl('vaneBid', 2.01);
    const outside = bench.sentences();
    truthy('at Vale\'s bottom stop the till and the band show the SAME revenue',
      outside.some((line) => line.includes('$361.00'))
      && !outside.some((line) => /marker sits at \$440/.test(line)),
      outside.find((line) => /marker sits at/.test(line)) || 'no marker sentence found');
    truthy('and the panel says the marker left the band, and why',
      outside.some((line) => /below the band/.test(line))
      && outside.some((line) => /lowest envy-free equilibrium/.test(line)));
  } else {
    rows.push({
      group,
      name: 'the rendered cases need a document — open auction.test.html to run them',
      pass: true,
      detail: 'skipped outside a browser',
    });
  }

  return rows.slice();
}

export default { runCases };
