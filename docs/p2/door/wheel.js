/**
 * docs/p2/door/wheel.js — the six-notch wheel, and the rival's hand on it.
 *
 * Team B5. This is the file the whole component was decided on, and it is the
 * one that has to answer a single question:
 *
 *   Does a first-time reader believe THEY set the revenue share?
 *
 * If yes, the Door Bench has failed however well it runs.
 *
 * ======================================================================
 * THE PROBLEM
 *
 * A wheel tells a reader that whoever owns the machine chose the number. The
 * record says the opposite. `mechanism.json` break B4:
 *
 *   "Google's network take rate rose 9% (2002) to 24.7% (2006), then FELL to
 *    21.5% (2007) and 21.3% (2008). The FY2008 10-K attributes future increases
 *    in TAC to competition for members... Any simulator that treats the take
 *    rate as a designed parameter rather than an auction outcome will get the
 *    era's economics backwards."
 *
 * `simulator-params.json` build note 7 says the same thing and adds: wherever
 * the slider appears it must be LABELLED as a competitive outcome.
 *
 * A label is not enough here, and `DESIGN.md` says so in as many words: this
 * project's whole argument is that a picture beats a caption, and a caption
 * cannot win an argument against a gesture. The original proposal answered with
 * three printed guards and that answer was rejected.
 *
 * ======================================================================
 * THE ANSWER — THE RIVAL IS A SECOND HAND ON THE SAME WHEEL
 *
 * Four mechanics, and every one of them is something the reader SEES rather
 * than reads:
 *
 * 1. THE WHEEL OPENS WHERE THE RIVAL PUT IT. Not at a default, and not at zero.
 *    It opens one notch above the rival's standing bid, because a lower share
 *    loses the door. The first number the reader meets is already the rival's
 *    doing.
 *
 * 2. TURNING IT DOWN DOES NOT WORK, AND IT DOES NOT SIMPLY REFUSE. The pointer
 *    travels to the notch the reader asked for, the door swings to the rival,
 *    and the wheel comes back. A disabled control teaches nothing. A control
 *    that moves under your hand and is pushed back teaches that somebody else
 *    is holding it.
 *
 * 3. TURNING IT UP MOVES THE RIVAL. Every raise is answered: the rival bids one
 *    notch higher, on its own, and the reader's reachable range shrinks by one
 *    notch. Ground the reader gives up does not come back. After three moves
 *    the only notches left are the three the record actually contains, and the
 *    reader did not pick them.
 *
 * 4. THE RIVAL'S HAND COMES OFF AT ITS OWN CEILING, AND THAT IS THE WHOLE
 *    ASYMMETRY. The rival cannot bid past its own revenue per query net of
 *    serving cost. Above that the reader is alone on the wheel — and the
 *    printed line says the ceiling is an INVENTED number (build note 8), so
 *    even the reader's freedom is bounded by an assumption rather than a fact.
 *
 * And a fifth state where the reader's hand is not on the wheel at all: the
 * FILED WALK. `tac_series` holds the disclosed payout ratio for seven years.
 * Put the wheel in `filed` mode and the pointer walks 91 → 84 → 79 → 75.4 →
 * 78.5 → 78.7 with the control removed. The ratchet goes up and then comes back
 * down, which is break B4's actual sentence, and the reader watches the number
 * they thought was theirs move six times without them.
 *
 * ======================================================================
 * WHAT IS STRUCTURAL AND WHAT IS DRAWN
 *
 * This module holds no DOM. It is the mechanism, and it is here on its own so
 * the rival's pressure can be tested without a browser. `drawing.js` draws it
 * and `bench.js` mounts the control.
 *
 * The structural part is `settle()`. It returns a frozen SETTLEMENT minted by
 * this module, and `figures.mintContested` refuses anything else. So a figure
 * standing on the revenue share cannot exist without the sentence saying which
 * hand last moved the wheel — and `settlementPhrase` never returns a sentence
 * in which the reader acted alone. Every notch the reader reaches names the
 * rival's answer to it in the same breath.
 *
 * EVERY NOTCH IS A NUMBER THE RECORD CONTAINS, and every one is READ:
 *
 *   0.58   the rival's own blended payout, FY2002        mech-ovt-001 central
 *   0.64   the rival's guidance for the next quarter     mech-ovt-001 ci80 high
 *   0.833  the rival's ceiling at its own yield          X8, and it is invented
 *   0.84   what the buyer's ratio fell to in 2003        tac_series 2003
 *   0.85   the reported deal share, never filed          revenue_share_s default
 *   0.91   what the buyer actually recognised in 2002    tac_series 2002
 *
 * Nothing in this file is a literal. A missing source is a throw, never a
 * default, for the reason the auction bench learned the hard way: a default
 * that happens to equal the record renders the right answer by luck and nothing
 * tells you the input went missing.
 *
 * ======================================================================
 * AND EVERY NOTCH CARRIES THE DENOMINATOR IT IS A SHARE OF
 *
 * This wheel is the one place on the bench where a share is drawn rather than
 * printed, so it is the one place where losing the basis is invisible. It was
 * lost: the 91% and 84% notches named `mech-tac-001`, whose calibrated quantity
 * is 28.1% **of Google advertising revenue** in 2008. The notches are a percent
 * of **network** revenue. The number was right and the citation was a different
 * quantity, which is break B9 happening inside the guard against break B9.
 *
 * So a notch now carries `basis` — the named denominator — and `valueFrom`, the
 * place in the record its number is READ from. A notch may cite a claim only
 * where the claim's own `unit` names that same denominator, and
 * `assertNotchesCiteTheirBasis` runs inside `readNotches` on every path. Two
 * notches cite `mech-ovt-001` and pass; the four that cannot are cited to the
 * table and the variable they are actually read from, which is where their
 * numbers come from anyway.
 * ======================================================================
 */

export class WheelError extends Error {
  constructor(message, detail = null, fix = null) {
    super(fix ? `${message}\n  FIX: ${fix}` : message);
    this.name = 'WheelError';
    this.detail = detail;
    this.fix = fix;
  }
}

const SETTLEMENTS = new WeakSet();
const finite = (v) => typeof v === 'number' && Number.isFinite(v);

/* ------------------------------------------------------------------ *
 * 1 · READING THE RECORD
 * ------------------------------------------------------------------ */

/** Every calibration the distribution engine carries, by id. Read, never listed. */
export function distributionClaims(mechanismFile) {
  const engine = mechanismFile && mechanismFile.engines && mechanismFile.engines.distribution;
  if (!engine) {
    throw new WheelError(
      'mechanism.json holds no engines.distribution, so this wheel has no notches to read.',
      null, 'load the frozen mechanism.json'
    );
  }
  const out = new Map();
  const walk = (node) => {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (!node || typeof node !== 'object') return;
    const cal = node.calibration;
    if (cal && typeof cal === 'object' && typeof cal.id === 'string' && !out.has(cal.id)) {
      out.set(cal.id, cal);
    }
    for (const value of Object.values(node)) walk(value);
  };
  walk(engine);
  if (out.size === 0) {
    throw new WheelError(
      'engines.distribution carries no calibrations. Every notch on this wheel is one of them, ' +
      'so an empty set is a vacuous wheel rather than an empty one.',
      null, 'this guard is grounded in the record'
    );
  }
  return out;
}

function needClaim(claims, id, why) {
  const claim = claims.get(id);
  if (!claim) {
    throw new WheelError(
      `the wheel needs claim "${id}" — ${why} — and mechanism.json engines.distribution no ` +
      'longer carries it. This wheel will not fall back to a literal: a notch that is right by ' +
      'luck is worse than a notch that is wrong, because nothing tells you the input went ' +
      'missing.',
      { id, known: [...claims.keys()] }
    );
  }
  return claim;
}

/** The disclosed payout ratio, by year, out of the tac_series table. */
export function filedPayoutSeries(mechanismFile) {
  const engine = mechanismFile && mechanismFile.engines && mechanismFile.engines.distribution;
  const table = engine && engine.tac_series && engine.tac_series.table_usd_millions;
  if (!Array.isArray(table) || table.length === 0) {
    throw new WheelError(
      'mechanism.json engines.distribution.tac_series.table_usd_millions is missing. It is where ' +
      'the disclosed payout ratio lives, and the filed walk is the state where the reader\'s ' +
      'hand is off the wheel entirely.',
      null
    );
  }
  const rows = table
    .filter((row) => finite(row.tac_pct_network_revenue))
    .map((row) => Object.freeze({
      year: row.year,
      share: row.tac_pct_network_revenue / 100,
      /* The record's own hole. 2005 has no disclosed ratio, and a walk that
       * skipped it silently would draw six even steps where the record has a
       * gap. `absent` carries the years the walk cannot show. */
      networkRevenue: row.network_revenue,
    }));
  const absent = table.filter((row) => !finite(row.tac_pct_network_revenue)).map((row) => row.year);
  if (rows.length === 0) {
    throw new WheelError('the tac_series table carries no disclosed payout ratio at all.', null);
  }
  return Object.freeze({ rows: Object.freeze(rows), absent: Object.freeze(absent) });
}

/* ------------------------------------------------------------------ *
 * 1a · THE DENOMINATOR EVERY NOTCH IS A SHARE OF
 * ------------------------------------------------------------------ */

/**
 * THE CLOSED SET OF DENOMINATORS A NOTCH MAY BE MEASURED AGAINST.
 *
 * `of` is the reader-facing sentence, printed by `notchPhrase` and so carried
 * to every figure minted off this wheel. `claimUnit` is what a cited claim's
 * own `unit` has to name before that claim may stand behind the notch; `null`
 * means no claim may be cited at all, because the number is invented.
 *
 * Adding an entry here is an edit in a diff a reviewer reads, which is the
 * point — the same posture `../charts/claim-marks.js` takes on `EXTRA_KEYS`.
 */
export const NOTCH_BASES = Object.freeze({
  'network-revenue': Object.freeze({
    of: 'of what the partner pages earned that year',
    claimUnit: /network\s+(advertising\s+)?revenue/i,
  }),
  'rival-revenue': Object.freeze({
    of: 'of the rival\'s own revenue',
    claimUnit: /Overture\s+revenue/i,
  }),
  'rival-yield': Object.freeze({
    of: 'of what a thousand searches earn the rival',
    claimUnit: null,
  }),
});

/**
 * A NOTCH MAY CITE A CLAIM ONLY WHERE THE CLAIM MEASURES THE SAME THING.
 *
 * This is the guard that would have caught `mech-tac-001` standing behind a
 * percent of network revenue while its own unit reads "% of Google advertising
 * revenue". It is not vacuous: two notches cite `mech-ovt-001` and go through
 * it on every load, and `door.test.js` puts the old citation back and watches
 * it throw.
 */
export function assertNotchesCiteTheirBasis(notches, claims) {
  for (const notch of notches) {
    const basis = NOTCH_BASES[notch.basisKey];
    if (!basis) {
      throw new WheelError(
        `the notch "${notch.label}" declares the basis "${notch.basisKey}", which is not one of ` +
        `the denominators a notch may be a share of: ${Object.keys(NOTCH_BASES).join(', ')}. ` +
        'This wheel is the one place on the bench where a share is drawn rather than printed, ' +
        'so it is the one place where losing the denominator is invisible.',
        notch
      );
    }
    if (typeof notch.valueFrom !== 'string' || notch.valueFrom.trim().length < 8) {
      throw new WheelError(
        `the notch "${notch.label}" does not say where its number is read from.`, notch,
        'valueFrom: the field of the frozen record this value comes out of'
      );
    }
    if (!notch.claimId) continue;
    if (basis.claimUnit === null) {
      throw new WheelError(
        `the notch "${notch.label}" is measured ${basis.of}, which no claim in this record ` +
        `calibrates, and it cites "${notch.claimId}" anyway. The number is invented and the ` +
        'citation would lend it a grade it has not got.',
        notch
      );
    }
    const claim = claims.get(notch.claimId);
    if (!claim) {
      throw new WheelError(
        `the notch "${notch.label}" cites "${notch.claimId}" and engines.distribution no longer ` +
        'carries it.',
        { notch, known: [...claims.keys()] }
      );
    }
    if (typeof claim.unit !== 'string' || !basis.claimUnit.test(claim.unit)) {
      throw new WheelError(
        `the notch "${notch.label}" is a share ${basis.of}, and it cites "${notch.claimId}", ` +
        `whose own unit is "${claim.unit}". That is a different denominator. The record quotes ` +
        'one numerator over three denominators and calls all three correct (break B9); a notch ' +
        'standing on a claim about another basis is that error happening inside the guard ' +
        'against it, in the one place on this bench where a share is drawn rather than printed.',
        { notch, unit: claim.unit, wanted: String(basis.claimUnit) },
        'cite the field the value is actually read from, or cite a claim calibrated on this basis'
      );
    }
  }
  return notches;
}

/**
 * The six notches, every one read out of the frozen record.
 *
 * `paramsFile` supplies the reported deal share and the rival's yield; the rest
 * come out of `mechanism.json`. Nothing here is a literal and nothing here has
 * a default.
 */
export function readNotches(mechanismFile, paramsFile) {
  const claims = distributionClaims(mechanismFile);
  const filed = filedPayoutSeries(mechanismFile);
  const byYear = new Map(filed.rows.map((r) => [r.year, r.share]));

  const rival = needClaim(claims, 'mech-ovt-001', 'the rival\'s own blended payout and its guidance');
  if (!finite(rival.central) || !Array.isArray(rival.ci80) || !finite(rival.ci80[1])) {
    throw new WheelError('mech-ovt-001 no longer carries a central and an 80% interval.', rival);
  }

  const variables = (paramsFile && paramsFile.variables) || [];
  const variable = (name) => {
    const found = variables.find((v) => v.name === name);
    if (!found) {
      throw new WheelError(
        `simulator-params.json declares no variable "${name}", and the wheel reads its notches ` +
        'from the record rather than carrying them.',
        { known: variables.map((v) => v.name) }
      );
    }
    return found;
  };
  const reportedShare = variable('revenue_share_s').default;
  const rpmRival = variable('rpm_rival').default;
  const servingCost = variable('serving_cost_per_1k').default;
  for (const [name, value] of [['revenue_share_s', reportedShare], ['rpm_rival', rpmRival],
    ['serving_cost_per_1k', servingCost]]) {
    if (!finite(value)) {
      throw new WheelError(`simulator-params.json variable "${name}" carries no default.`, { name, value });
    }
  }
  const ceiling = (rpmRival - servingCost) / rpmRival;

  const need = (year) => {
    const share = byYear.get(year);
    if (!finite(share)) {
      throw new WheelError(
        `the tac_series table has no disclosed payout ratio for ${year}, and a notch on this ` +
        'wheel is a number the record contains.',
        { year, years: [...byYear.keys()] }
      );
    }
    return share;
  };

  const notches = [
    {
      value: rival.central / 100,
      label: 'what the rival actually paid out in 2002',
      whose: 'rival', grade: rival.grade,
      /* CITED, AND THE CITATION IS CHECKED. mech-ovt-001's own unit is "% of
       * Overture revenue paid out as traffic acquisition cost", which is this
       * notch's denominator, so the claim may stand behind it. */
      basisKey: 'rival-revenue', claimId: rival.id,
      valueFrom: 'mechanism.json engines.distribution — mech-ovt-001.central',
      source: 'the rival\'s own 2002 filing: $384.6m paid out on $667.7m of revenue',
      illustrative: false,
    },
    {
      value: rival.ci80[1] / 100,
      label: 'what the rival told the market it would pay next quarter',
      whose: 'rival', grade: rival.grade,
      basisKey: 'rival-revenue', claimId: rival.id,
      valueFrom: 'mechanism.json engines.distribution — mech-ovt-001.ci80[1]',
      source: 'the rival told the market it would pay 63 to 64 per cent in the first quarter of ' +
        '2003, and a quarter to a half point more each quarter after that',
      illustrative: false,
    },
    {
      value: ceiling,
      label: 'the most the rival can pay and still cover its costs',
      whose: 'rival-ceiling', grade: 'illustrative',
      /* NO CLAIM MAY STAND HERE. The number is two invented settings divided by
       * one of them, and a claim id beside it would lend it a grade. */
      basisKey: 'rival-yield', claimId: null,
      valueFrom: 'simulator-params.json variables rpm_rival and serving_cost_per_1k, both invented',
      source: 'the rival earns $6.00 for a thousand searches and spends $1.00 answering them. ' +
        'So it can hand over $5.00 of every $6.00 and no more',
      illustrative: true,
    },
    {
      value: need(2003),
      label: 'what the buyer\'s payout ratio fell to in 2003',
      whose: 'filed', grade: 'A',
      /* IT USED TO CITE mech-tac-001, whose unit is a percent of ADVERTISING
       * revenue. This is a percent of NETWORK revenue. The value was always
       * read from the table, so the table is what it names. */
      basisKey: 'network-revenue', claimId: null,
      valueFrom: 'mechanism.json engines.distribution tac_series 2003 — tac_pct_network_revenue',
      source: 'the buyer\'s 2004 filing puts the payout at 84 per cent of what the partner pages ' +
        'earned in 2003. That is below the reported share, and it dates the month the guarantee ' +
        'stopped binding',
      illustrative: false,
    },
    {
      value: reportedShare,
      label: 'the share the deal is reported to have carried',
      whose: 'reported', grade: 'B',
      /* mech-aol-001 is calibrated in USD millions on the guarantee, not in per
       * cent on the share. The share is a sentence inside that claim's
       * statement and it is carried as a variable, which is what this names. */
      basisKey: 'network-revenue', claimId: null,
      valueFrom: 'simulator-params.json variables revenue_share_s.default',
      source: 'second-hand accounts of the May 2002 deal. The contract was never filed, so this ' +
        'notch is the only one on the wheel nobody can check',
      illustrative: false,
    },
    {
      value: need(2002),
      label: 'what the buyer actually paid out in 2002',
      whose: 'filed', grade: 'A',
      basisKey: 'network-revenue', claimId: null,
      valueFrom: 'mechanism.json engines.distribution tac_series 2002 — tac_pct_network_revenue',
      source: 'the buyer\'s 2004 filing puts the payout at 91 per cent of what the partner pages ' +
        'earned in 2002',
      illustrative: false,
    },
  ];

  notches.sort((a, b) => a.value - b.value);
  notches.forEach((n, i) => {
    n.index = i;
    n.basis = NOTCH_BASES[n.basisKey].of;
    Object.freeze(n);
  });
  assertNotchesCiteTheirBasis(notches, claims);

  /* A wheel whose notches are not distinct is a wheel with fewer notches than
   * it draws, and the reader would find two positions that look different and
   * behave the same. */
  for (let i = 1; i < notches.length; i += 1) {
    if (notches[i].value - notches[i - 1].value < 1e-6) {
      throw new WheelError(
        `two notches on this wheel are the same number (${notches[i].value}). The record has ` +
        'moved and the wheel now draws a position that does nothing.',
        notches.map((n) => n.value)
      );
    }
  }
  return Object.freeze(notches);
}

/* ------------------------------------------------------------------ *
 * 2 · THE SETTLEMENT
 * ------------------------------------------------------------------ */

/**
 * How the wheel came to be where it is. There is no entry in which the reader
 * acted alone, and that is deliberate: `settlementPhrase` is what every figure
 * off this wheel prints beside itself, so the sentence naming the second hand
 * reaches every surface the number reaches.
 */
export const SETTLED_BY = Object.freeze({
  opening: 'opening',
  reader_raised: 'reader_raised',
  reader_lowered: 'reader_lowered',
  rival_refused: 'rival_refused',
  record_walked: 'record_walked',
});

export function isSettlement(value) { return SETTLEMENTS.has(value); }

export function assertSettlement(value, where) {
  if (!SETTLEMENTS.has(value)) {
    throw new WheelError(
      `${where} was handed something this wheel did not settle. The revenue share is an auction ` +
      'outcome (break B4), so a bare number here is a number a reader reads as their own choice.',
      value, 'pass the object wheel.settle() returned'
    );
  }
  return value;
}

/**
 * The sentence that travels with every figure off this wheel.
 *
 * READ THE FIVE BRANCHES. Not one of them says the reader set the rate on their
 * own. The reader's own raise is reported together with the rival's answer to
 * it, in the same sentence, because the raise without the answer is exactly the
 * false picture this component exists to prevent.
 */
export function settlementPhrase(settlement) {
  assertSettlement(settlement, 'settlementPhrase');
  const share = (v) => `${(v * 100).toFixed(1)}%`;
  const rivalNow = share(settlement.rival.share);
  switch (settlement.settledBy) {
    case SETTLED_BY.opening:
      return `the wheel opened here, at the lowest share that beats the rival's standing bid of ${rivalNow}`;
    /* THE RIVAL STOPS FOR TWO DIFFERENT REASONS AND THEY ARE NOT THE SAME
     * SENTENCE. It stops at its own ceiling, which is the asymmetry the record
     * turns on — and it also stops one notch under the reader, because it never
     * bids past the hand it is answering. Both used to print "it cannot pay
     * more than it earns", which is true of the first and false of the second:
     * at 64 per cent against a ceiling of 83.3 the rival could pay a great deal
     * more, and the drawing said it could not. */
    case SETTLED_BY.reader_raised:
      if (settlement.rival.moved) {
        return `you turned it up, and the rival answered by bidding ${rivalNow}`;
      }
      return settlement.rival.atCeiling
        ? `you turned it up. The rival stops at ${rivalNow}: it cannot pay more than a search ` +
          'earns it'
        : `you turned it up by one notch, and the rival's bid of ${rivalNow} is already the notch ` +
          'below you';
    case SETTLED_BY.reader_lowered:
      if (settlement.rival.moved) {
        return `you turned it down, and the rival answered by bidding ${rivalNow}`;
      }
      return settlement.rival.atCeiling
        ? `you turned it down. The rival is holding at ${rivalNow}, which is all it can afford`
        : `you turned it down. The rival is holding at ${rivalNow}`;
    case SETTLED_BY.rival_refused:
      return `you reached for ${share(settlement.asked)} and the rival's standing bid of ` +
        `${rivalNow} took the door. The wheel came back`;
    case SETTLED_BY.record_walked:
      return `the record put it here, in ${settlement.year}. Nobody on this page turned it`;
    default:
      throw new WheelError(`"${settlement.settledBy}" is not a way this wheel can be settled.`);
  }
}

/**
 * WHAT THE NOTCH THE WHEEL IS SITTING ON ACTUALLY IS.
 *
 * Every notch is a number the record contains, and they are not the same KIND
 * of number: two are the rival's own filings, two are the buyer's, one is an
 * invention, and one is a rumour nobody can check. A wheel whose positions all
 * looked alike would teach that they are all equally solid, which is the second
 * false thing this component could say.
 */
export function notchPhrase(settlement) {
  assertSettlement(settlement, 'notchPhrase');
  const notch = settlement.notch;
  if (!notch) {
    return `this position is a filed year, not a notch: ${settlement.year} on the disclosed ` +
      'payout series, of what the partner pages earned that year';
  }
  /* THE DENOMINATOR TRAVELS WITH THE NOTCH. `figureQualifiers` prints this
   * beside every figure minted off the wheel, so the basis reaches every
   * surface the number reaches — which is the whole of break B9. */
  const of = `, ${notch.basis}`;
  if (notch.illustrative) return `this notch is an invented number — ${notch.label}${of}`;
  if (notch.grade === 'B') {
    return `this notch is grade B — ${notch.label}${of}, and the contract was never filed`;
  }
  return `this notch is grade ${notch.grade} — ${notch.label}${of}`;
}

function mintSettlement(spec) {
  if (!spec.rival || !finite(spec.rival.share)) {
    throw new WheelError(
      'a settlement with no rival is the picture this whole component exists to prevent.',
      spec, 'every settlement carries the rival\'s standing bid'
    );
  }
  if (!finite(spec.share)) throw new WheelError('a settlement needs a measured share.', spec);
  if (!SETTLED_BY[spec.settledBy]) {
    throw new WheelError(`"${spec.settledBy}" is not a way this wheel can be settled.`, spec);
  }
  const settlement = Object.freeze({
    ...spec,
    rival: Object.freeze({ ...spec.rival }),
    reachable: Object.freeze([...spec.reachable]),
    lostGround: Object.freeze([...spec.lostGround]),
  });
  SETTLEMENTS.add(settlement);
  return settlement;
}

/* ------------------------------------------------------------------ *
 * 3 · THE WHEEL
 * ------------------------------------------------------------------ */

/**
 * Build a wheel from the frozen record.
 *
 * `mode` is `contested` — the reader's hand and the rival's on six notches — or
 * `filed`, where the disclosed series walks the pointer and the reader has no
 * hand on it at all.
 */
export function makeWheel(mechanismFile, paramsFile, { mode = 'contested' } = {}) {
  if (mode !== 'contested' && mode !== 'filed') {
    throw new WheelError(
      `"${mode}" is not a mode of this wheel.`, { mode },
      'contested — the reader against the rival; or filed — the disclosed series, hand off'
    );
  }
  const notches = readNotches(mechanismFile, paramsFile);
  const filed = filedPayoutSeries(mechanismFile);

  /* THE RIVAL'S CEILING. The highest notch the rival can afford. Above it the
   * rival's hand leaves the wheel, and that is the asymmetry the record's X8
   * turns on: the maximum feasible bid IS the yield net of serving cost. */
  const ceilingNotch = notches.filter((n) => n.whose === 'rival-ceiling')[0];
  if (!ceilingNotch) {
    throw new WheelError(
      'this wheel has no rival ceiling, so the rival could follow the reader to any share at ' +
      'all and the one asymmetry the record turns on would be missing from the drawing.',
      notches
    );
  }
  const ceilingIndex = ceilingNotch.index;

  /* THE RIVAL'S HAND HAS TO BE ABLE TO MOVE, AND THAT IS A CONDITION ON THE
   * RECORD RATHER THAN ON THE CODE.
   *
   * `turnTo` advances the rival to `min(rivalIndex + 1, ceilingIndex, pointer - 1)`.
   * If the ceiling sorts to the lowest notch — which happens the moment the
   * record's `rpm_rival` falls near its `serving_cost_per_1k` — the rival is
   * pinned at its opening bid for every move the reader can make. Every notch
   * stays reachable, no ground is ever taken, and the reader has the wheel to
   * themselves with a caption saying they do not. That is precisely the failure
   * this component exists to prevent, and it renders green. */
  if (ceilingIndex < 1) {
    throw new WheelError(
      `this wheel's rival can afford ${(ceilingNotch.value * 100).toFixed(1)} per cent, which is ` +
      'its own opening bid or less. So its hand can never move, no notch is ever taken away, and ' +
      'the reader turns the wheel against nobody. The narrowing range is the percept this ' +
      'component was built on; without it only the caption is left.',
      { ceilingIndex, notches: notches.map((n) => n.value) },
      'the ceiling is (rpm_rival - serving_cost_per_1k) / rpm_rival. Check both in ' +
      'simulator-params.json — a rival that cannot outbid its own opening bid is not a rival'
    );
  }

  /* The rival opens where the record says it stood: at its own disclosed 2002
   * payout, which is the lowest notch.
   *
   * `RIVAL_OPENED_AT` is carried on every settlement rather than assumed by the
   * drawing. The resting picture draws a hollow pawl there and a rule from it to
   * where the rival's hand is now — the permanent form of the trail TRAVERSE
   * leaves and then takes away. Without the opening index on the object the
   * drawing would have to hardcode 0, which is the same class of defect as a
   * figure that knows its own denominator by convention. */
  const RIVAL_OPENED_AT = 0;
  let rivalIndex = RIVAL_OPENED_AT;
  let pointer = Math.min(1, notches.length - 1);
  let openingReach = notches.length - 1 - RIVAL_OPENED_AT;
  let walkStep = 0;
  /* The last settlement this wheel produced. `current()` returns it rather than
   * guessing how the wheel got here: a state machine that reconstructs its own
   * history from its position is a state machine with two answers to one
   * question, and the reader would be told the wrong hand moved it. */
  let last = null;

  const reachable = () => {
    const out = [];
    for (let i = rivalIndex + 1; i < notches.length; i += 1) out.push(i);
    return out;
  };
  const lostGround = () => {
    const out = [];
    for (let i = 0; i <= rivalIndex; i += 1) out.push(i);
    return out;
  };

  function contestedSettlement(settledBy, askedIndex, rivalMoved, transient = false) {
    const notch = notches[pointer];
    last = mintSettlement({
      mode: 'contested',
      share: notch.value,
      notch,
      index: pointer,
      asked: notches[askedIndex] ? notches[askedIndex].value : notch.value,
      askedIndex,
      settledBy,
      /* THE DOOR SWINGS FOR THE LENGTH OF THE REFUSAL AND THEN IT COMES BACK.
       *
       * It used to swing on a refusal and stay there — through the reader
       * leaving the stop and returning — while the three cups went on filling
       * from a lane the same drawing said was empty, and the accessible name
       * read out a state the picture was not in. So the swing is TRANSIENT: it
       * is the event, not the resting state, `rest()` puts it back, and
       * `rivalPressureFaults` refuses any settled state that still has the door
       * to the rival. */
      transient: Boolean(transient),
      doorTo: settledBy === SETTLED_BY.rival_refused && transient ? 'rival' : 'buyer',
      ceilingIndex,
      rival: {
        share: notches[rivalIndex].value,
        index: rivalIndex,
        /* WHERE ITS HAND STARTED, carried so the resting drawing can show the
         * distance it has come without motion and without a caption. */
        openedAt: RIVAL_OPENED_AT,
        openedAtShare: notches[RIVAL_OPENED_AT].value,
        moved: Boolean(rivalMoved),
        atCeiling: rivalIndex >= ceilingIndex,
        ceiling: ceilingNotch.value,
        ceilingIsInvented: true,
        name: 'the rival',
      },
      reachable: reachable(),
      lostGround: lostGround(),
      /* How much of the wheel the reader could reach at the opening, and how
       * much is left. This is the number the drawing turns into a shrinking
       * arc, and it is the percept the requirement asks for. */
      reachOpened: openingReach,
      reachNow: notches.length - 1 - rivalIndex,
      notches,
    });
    return last;
  }

  const api = {
    mode,
    notches,
    ceilingIndex,
    filedYears: filed,

    /** Where the wheel stands now, without moving anything. */
    current() {
      if (last) return last;
      return api.open();
    },

    /** The opening settlement, before any hand has moved. */
    open() {
      rivalIndex = RIVAL_OPENED_AT;
      pointer = Math.min(1, notches.length - 1);
      openingReach = notches.length - 1 - RIVAL_OPENED_AT;
      walkStep = 0;
      if (mode === 'filed') return api.walkTo(0);
      return contestedSettlement(SETTLED_BY.opening, pointer, false);
    },

    /**
     * THE READER'S HAND.
     *
     * Three outcomes, and the middle one is the component:
     *
     *  - a notch above the rival's standing bid is taken, and the rival answers
     *    by bidding one notch higher unless it is already at its own ceiling;
     *  - a notch at or below the rival's standing bid is REFUSED — the pointer
     *    goes there, the door swings to the rival, and the wheel comes back to
     *    the lowest share that still wins;
     *  - a notch that does not exist is a programming error, not a reading.
     */
    turnTo(index) {
      if (mode !== 'contested') {
        throw new WheelError(
          'this wheel is in filed mode: the disclosed series walks the pointer and the reader ' +
          'has no hand on it. That is the state break B4 describes, and giving the reader the ' +
          'wheel back here would say the buyer chose the ratchet.',
          { index }
        );
      }
      if (!Number.isInteger(index) || index < 0 || index >= notches.length) {
        throw new WheelError(
          `notch ${index} is not on this wheel.`, { index, notches: notches.length },
          `the notches run 0 to ${notches.length - 1}`
        );
      }
      if (index <= rivalIndex) {
        /* REFUSED. The pointer travelled and came back; the door went to the
         * rival while it was down there. Nothing about the reader's reach
         * changes — the rival does not need to bid to win a share it already
         * beats.
         *
         * The settlement this returns is TRANSIENT. `rest()` is what the bench
         * calls when the gesture is over, and it is called on re-entry to a
         * stop, so no reader ever meets a door that swung on somebody else's
         * refused reach a minute ago. */
        const asked = index;
        pointer = Math.min(rivalIndex + 1, notches.length - 1);
        return contestedSettlement(SETTLED_BY.rival_refused, asked, false, true);
      }
      const raised = index >= pointer;
      pointer = index;
      /* THE ANSWER. The rival bids one notch higher, on its own, up to the
       * highest notch it can afford and never past the reader. */
      const before = rivalIndex;
      rivalIndex = Math.min(rivalIndex + 1, ceilingIndex, pointer - 1);
      const moved = rivalIndex !== before;
      return contestedSettlement(
        raised ? SETTLED_BY.reader_raised : SETTLED_BY.reader_lowered, index, moved
      );
    },

    /**
     * THE DOOR COMES BACK.
     *
     * A refusal is an event with a length: the pointer travelled below the
     * rival's standing bid, the door swung, the lower lane emptied, and the
     * wheel came back. `rest()` is the end of that event. It re-mints the same
     * position with the door where it actually is once the gesture is over, and
     * it is a no-op on any state that was never transient — so calling it on
     * entry to a stop, on every repaint, or twice, is safe.
     */
    rest() {
      if (!last || !last.transient) return last;
      return contestedSettlement(last.settledBy, last.askedIndex, false, false);
    },

    /** Whether the wheel is mid-event: the door is open to the rival right now. */
    isTransient() { return Boolean(last && last.transient); },

    /** The rival's standing bid, as an index. For the drawing and the tests. */
    rivalIndex() { return rivalIndex; },

    /**
     * THE FILED WALK. The reader's hand is off the wheel entirely.
     *
     * `tac_series` holds the disclosed payout ratio for six of the seven years
     * it covers; 2005 has none, and `filedYears.absent` carries it so the
     * drawing can show a documented hole rather than an even step.
     */
    walkTo(step) {
      if (mode !== 'filed') {
        throw new WheelError(
          'this wheel is in contested mode. The filed walk is a different state: it is the one ' +
          'where nobody on the page is turning anything.',
          { step }
        );
      }
      const rows = filed.rows;
      if (!Number.isInteger(step) || step < 0 || step >= rows.length) {
        throw new WheelError(`the filed walk has ${rows.length} steps and ${step} is not one.`, { step });
      }
      walkStep = step;
      const row = rows[step];
      last = mintSettlement({
        mode: 'filed',
        share: row.share,
        notch: null,
        index: null,
        asked: row.share,
        askedIndex: null,
        settledBy: SETTLED_BY.record_walked,
        year: row.year,
        doorTo: 'buyer',
        transient: false,
        ceilingIndex,
        rival: {
          share: notches[ceilingIndex].value,
          index: ceilingIndex,
          openedAt: RIVAL_OPENED_AT,
          openedAtShare: notches[RIVAL_OPENED_AT].value,
          moved: false,
          atCeiling: true,
          ceiling: ceilingNotch.value,
          ceilingIsInvented: true,
          name: 'the rival',
        },
        reachable: [],
        lostGround: [],
        reachOpened: 0,
        reachNow: 0,
        notches,
        /* The years the walk covers and the year it cannot. */
        walk: Object.freeze(rows.map((r) => Object.freeze({ year: r.year, share: r.share }))),
        walkStep: step,
        absentYears: filed.absent,
      });
      return last;
    },

    walkLength() { return filed.rows.length; },
  };

  return api;
}

/**
 * THE REVIEW QUESTION, ANSWERED IN CODE — AND THE CHECK THAT COULD NOT FIRE.
 *
 * The cognitive-design architect's question is whether a first-time reader
 * believes they set the rate. That is a question about a person and no function
 * can answer it. What a function CAN do is refuse the states in which the
 * answer would certainly be yes.
 *
 * THE VERSION THIS REPLACES COULD NOT REFUSE ANY OF THEM. Its one narrowing
 * clause read
 *
 *     settlement.reachOpened <= settlement.reachable.length
 *       && settlement.rival.index > 0
 *
 * and `reachOpened` is pinned at 5 by `open()` while `reachable.length` is
 * `5 - rival.index`. The first operand needs `rival.index <= 0` and the second
 * needs `rival.index > 0`. It is unsatisfiable by construction: an exhaustive
 * sweep of every reachable settlement fires it zero times, and the README sold
 * it as a GUARANTEE. A check that cannot fire is worse than no check, because a
 * team stops looking at the thing it appears to be watching.
 *
 * The repair is not a better sentence. It is to check quantities that can
 * actually disagree, and to make the checking a PURE FUNCTION OVER PLAIN DATA
 * so that every clause can be fired on demand from a test. `door.test.js`
 * section 1 fires all seven, one row each. A settlement cannot be forged —
 * `SETTLEMENTS` is module-private — and that is exactly why the invariant had
 * to leave the settlement to be testable at all.
 *
 * The seven states this refuses:
 *
 *  1. no rival bid on the object at all;
 *  2. a sentence that names no hand but the reader's;
 *  3. a wheel whose rival can never move, because its ceiling is at or below
 *     its own opening bid — every notch stays reachable forever;
 *  4. carried reach that disagrees with the rival's bid, so the drawing dims
 *     one set of notches while the held band covers another;
 *  5. ground taken with no reach lost;
 *  6. a resting state with the door still swung to the rival — the refusal
 *     that never came back;
 *  7. a resting pointer inside the ground the rival holds.
 */
export function rivalPressureFaults(state) {
  const faults = [];
  const {
    mode, notchCount, index, rivalIndex, ceilingIndex, rivalShare,
    reachable, lostGround, reachNow, reachOpened, phrase, doorTo, transient,
  } = state || {};

  if (!finite(rivalShare)) {
    faults.push('it carries no rival bid. A settlement with no second hand on it is the picture ' +
      'this whole component exists to prevent.');
  }
  if (typeof phrase !== 'string' || !/rival|record/i.test(phrase)) {
    faults.push(`its sentence is "${phrase}", which names no hand but the reader's. Every branch ` +
      'of settlementPhrase names a second hand, and a branch that does not is the failure this ' +
      'component was built to prevent.');
  }
  if (mode !== 'contested') return Object.freeze(faults);

  if (!(ceilingIndex >= 1)) {
    faults.push(`the rival's ceiling is notch ${ceilingIndex}, at or below its own opening bid, ` +
      'so its hand can never move and no notch is ever taken away. The reader would turn this ' +
      'wheel against nobody.');
  }
  const wantReach = [];
  for (let i = rivalIndex + 1; i < notchCount; i += 1) wantReach.push(i);
  const wantLost = [];
  for (let i = 0; i <= rivalIndex; i += 1) wantLost.push(i);
  const same = (a, b) => Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i]);
  if (!same(reachable, wantReach)) {
    faults.push(`it says the reader can reach [${(reachable || []).join(', ')}] while the rival ` +
      `stands at notch ${rivalIndex}, where the reachable notches are [${wantReach.join(', ')}]. ` +
      'The drawing dims one set and shades the other; two answers means one of them is a lie ' +
      'told in geometry.');
  }
  if (!same(lostGround, wantLost)) {
    faults.push(`it says the ground under the rival is [${(lostGround || []).join(', ')}] and the ` +
      `rival stands at notch ${rivalIndex}, which holds [${wantLost.join(', ')}].`);
  }
  if (reachNow !== (Array.isArray(reachable) ? reachable.length : -1)) {
    faults.push(`it reports ${reachNow} notches left and carries ` +
      `${Array.isArray(reachable) ? reachable.length : 'no'} of them.`);
  }
  if (rivalIndex > 0 && !(reachNow < reachOpened)) {
    faults.push(`the rival has bid ${rivalIndex} notch(es) and the reader has lost no reach ` +
      `(${reachNow} of ${reachOpened}). The narrowing range is the percept; if it does not ` +
      'narrow there is no rival pressure, only a caption saying there is.');
  }
  if (doorTo === 'rival' && !transient) {
    faults.push('the door is drawn to the rival in a resting state. The swing is an event with a ' +
      'length — the reach below the bid, the empty lane, the wheel coming back. A door that ' +
      'stays swung leaves the cups filling from a lane the same drawing says is empty.');
  }
  if (!transient && index != null && index <= rivalIndex) {
    faults.push(`the pointer rests at notch ${index}, inside the ground the rival holds up to ` +
      `notch ${rivalIndex}. The wheel does not stay there; that is the mechanism.`);
  }
  return Object.freeze(faults);
}

/** The state `rivalPressureFaults` reads, lifted off a minted settlement. */
export function pressureState(settlement) {
  assertSettlement(settlement, 'pressureState');
  return Object.freeze({
    mode: settlement.mode,
    notchCount: settlement.notches.length,
    index: settlement.index,
    rivalIndex: settlement.rival.index,
    ceilingIndex: settlement.ceilingIndex,
    rivalShare: settlement.rival.share,
    reachable: settlement.reachable,
    lostGround: settlement.lostGround,
    reachNow: settlement.reachNow,
    reachOpened: settlement.reachOpened,
    phrase: settlementPhrase(settlement),
    doorTo: settlement.doorTo,
    transient: Boolean(settlement.transient),
  });
}

/**
 * THROWING FORM. Called by the drawing, by the bench, by every demo and by the
 * tests — so a stop that draws a wheel cannot be an unguarded one.
 */
export function assertRivalIsPresent(settlement, context) {
  assertSettlement(settlement, context || 'assertRivalIsPresent');
  const faults = rivalPressureFaults(pressureState(settlement));
  if (faults.length > 0) {
    throw new WheelError(
      `${context || 'this settlement'} is a state in which a reader would be right to think the ` +
      `wheel is theirs:\n  - ${faults.join('\n  - ')}`,
      settlement
    );
  }
  return true;
}

/**
 * A short, generated sentence describing the whole state of the wheel, for the
 * drawing's accessible name and for the text-only path.
 *
 * Generated, never typed, and it reads the same numbers the drawing draws — the
 * lesson being that a drawing which disagrees with its own accessible name
 * hands sighted and screen-reader readers different facts off one object.
 */
export function wheelSentence(settlement) {
  assertSettlement(settlement, 'wheelSentence');
  const pc = (v) => `${(v * 100).toFixed(1)}%`;
  if (settlement.mode === 'filed') {
    return `The wheel stands at ${pc(settlement.share)} in ${settlement.year}. ` +
      'The filed series moves it. There is no handle on this state.';
  }
  const left = settlement.reachable.length;
  const total = settlement.notches.length;
  const said = settlementPhrase(settlement);
  const head = `The wheel stands at ${pc(settlement.share)}. ` +
    `${said[0].toUpperCase()}${said.slice(1)}.`;
  const lost = settlement.lostGround.length;
  const reach = ` ${left} of the ${total} notches ${left === 1 ? 'is' : 'are'} still open to you. ` +
    `${lost} ${lost === 1 ? 'sits' : 'sit'} under the rival's bid.`;
  const ceiling = settlement.rival.atCeiling
    ? ` The rival stops at ${pc(settlement.rival.ceiling)}. That is what a search earns it, ` +
      'less what it costs to answer. The number is made up.'
    : '';
  return head + reach + ceiling;
}

export default {
  makeWheel, readNotches, distributionClaims, filedPayoutSeries,
  isSettlement, assertSettlement, settlementPhrase, notchPhrase, wheelSentence,
  assertRivalIsPresent, rivalPressureFaults, pressureState,
  assertNotchesCiteTheirBasis, NOTCH_BASES, SETTLED_BY, WheelError,
};
