/* docs/p2/toll/toll-records.js — WHICH CUT EACH ERA MEASURED, AND ON WHAT
 *
 * Team B6. The Toll Plate, from DESIGN.md problem 2, option 2C.
 *
 * THE PROBLEM THIS TABLE ANSWERS. A middleman sits between the advertiser and
 * the place the advertisement appears, and keeps a slice. Every era wrote that
 * slice down as a percentage. What the percentage was OF changed every time.
 * Bars in a row on one ruler would invite the reader to read an early
 * percentage against a late one and conclude the cut rose. Nothing in the
 * record says that — and naming the two figures in the sentence that refuses
 * the comparison is most of the way to making it, so this file does not.
 *
 * So this file names, for each era, WHICH claim is that era's toll, WHAT it is
 * a share of, and WHO produced the figure — and every one of those three
 * carries a written reason a reviewer can read. It is the same posture
 * `era-plan.js` takes on `crank.why`: a choice a guard cannot make is a choice
 * that has to be visible in the diff.
 *
 * WHAT THIS FILE DELIBERATELY DOES NOT NAME IS WHICH WAY THE MONEY WENT. That
 * used to be a field here, and it decided whether the plate drew a valve and a
 * cup or a pipe off the page. One edited word drew a payout as a take with
 * every guard green. It is now derived from the claim's own unit and the head
 * of its statement — see section 2b — and `assertTollSelection` refuses a toll
 * that carries the label back.
 *
 * THIS FILE HOLDS NO NUMBER. Not one. Every figure comes from `claims.json`
 * through `../charts/claim-marks.js`. What is written here is the SELECTION and
 * the reasons for it, plus the three small vocabularies the plates draw from.
 *
 * THE ONE THING EVERY GUARD HERE IS FOR. A claim about a claim goes stale in
 * silence. "The FCC counted this" is a sentence in a build file; the record it
 * describes is in another file, frozen, and it moves under a repair. So every
 * editorial declaration below names a string that must appear in the claim's
 * own source list, and `assertTollSelection()` throws when it does not. The
 * same cross-check `assertDistinguishable` runs on a declared `redundant`
 * channel and `assertColourBudget` runs on a declared carrier: a declaration
 * that exists only in an argument list is not a declaration.
 */

import * as guards from '../lib/guards.js';

export class TollRecordError extends Error {
  constructor(message, detail) { super(message); this.name = 'TollRecordError'; this.detail = detail; }
}

/* ======================================================================
 * 1 · HOW VISIBLE THE FIGURE WAS
 *
 * This is the chapter's finding, and it is the only thing on the page a reader
 * is invited to read straight down. It is not a claim about how big the cut
 * was. It is a claim about WHO PRODUCED THE FIGURE, which is a fact about the
 * claim's own source list and is therefore checkable.
 *
 * The forms drain ink as they go: a solid square, a solid square somebody had
 * to open something to get, an outline, a dashed outline, and finally a stipple
 * block inside a dashed iron frame — which is rule 5's own shape for documented
 * absence. Read down the column and the ink goes out of it.
 * ====================================================================== */

export const VISIBILITY = Object.freeze({
  posted: Object.freeze({
    form: 'solid-square',
    sentence: 'The trade printed this rate. A reader of the day could look it up.',
  }),
  opened: Object.freeze({
    form: 'framed-square',
    sentence: 'An outside body opened the books and published this figure.',
  }),
  filed: Object.freeze({
    form: 'open-square',
    sentence: 'The seller filed this figure about itself.',
  }),
  ranged: Object.freeze({
    form: 'dashed-square',
    sentence: 'The source prints a range and no single figure.',
  }),
  unclosed: Object.freeze({
    form: 'stipple-square',
    sentence: 'An outside body tried to trace this money and could not close the account.',
  }),
});

/** The classes that mean somebody outside the seller produced the figure. */
export const OUTSIDE_VISIBILITY = Object.freeze(['posted', 'opened']);

/* ======================================================================
 * 2 · WHAT THE NUMBER IS OF
 *
 * Three shapes, and the difference between them is the whole era-7 guard. A
 * figure for what ARRIVED is not a figure for what was taken, and the money
 * that failed to arrive is not all middleman take.
 * ====================================================================== */

export const MEASURES = Object.freeze({
  kept: Object.freeze({
    term: 'the cut',
    line: 'This is what the middleman kept.',
  }),
  paid: Object.freeze({
    term: 'handed on',
    line: 'This is what one seller handed to another.',
  }),
  arrived: Object.freeze({
    /* NOT "the cut". The row that prints an arrival under the words "the cut"
     * is the era-7 misreading, printed by the page itself. */
    term: 'what arrived',
    line: 'This counts what arrived, not what was taken.',
  }),
});

/* ======================================================================
 * 2b · WHICH WAY THE MONEY WENT, READ OFF THE RECORD
 *
 * THE LAST ATTACK ON THIS PAGE, AND THE REPAIR IT FORCED.
 *
 * Every toll in the table below used to carry a field called `measures`. It was
 * a word in a build file, and it decided the whole drawing: whether the plate
 * cut a rust wedge off the left of the bar and hung a cup under it, or ruled
 * the share at the far end and ran a pipe off the page. Changing one word from
 * "paid" to "kept" moved Overture's traffic acquisition cost — money HANDED TO
 * the partners who sent the traffic — into a rust wedge with a valve on it and
 * a full cup beneath, under the printed line "This is what the middleman kept."
 * The pixels followed the label without being asked, because the pixel guard
 * re-derives the drawn end from the same label. Every check in this folder
 * stayed green, because every check compared the drawing against the LABEL.
 *
 * DRAWING MONEY THAT LEAVES AS MONEY THAT IS TAKEN INVERTS THE FINDING, and it
 * did it on the largest figure on the page.
 *
 * SO THERE IS NO LABEL. `assertTollSelection` refuses a toll that carries one,
 * by any of the names a person would reach for. The direction is derived, here,
 * from the record's own words, and the drawn shape follows from the derivation:
 *
 *   1. THE UNIT FIRST. `claim.unit` is the record's own name for what the share
 *      is a share OF, and it usually names the party too — "% take rate
 *      RETAINED BY Google", "% of Google advertising revenue PAID OUT AS
 *      traffic acquisition cost", "percent of advertiser programmatic spend
 *      REACHING the publisher". Nine of the thirteen are settled there.
 *   2. THEN THE HEAD OF THE STATEMENT, and only if the unit is silent. The head
 *      is the record's own naming of the quantity: everything before the first
 *      dash, colon, semicolon or full stop. It is cut there because what
 *      follows is gloss about other parties — `e5-pricing-006`'s statement
 *      names Overture's cost and then calls the same money "the take rate of
 *      the distribution layer", which is true of the partner and false of the
 *      middleman this plate is drawing.
 *   3. AND IF NEITHER SETTLES IT, THE ROW IS REFUSED. Not defaulted, not
 *      guessed, not drawn as a cut because most of them are cuts. A record that
 *      does not say which way its money went is a record this page cannot draw
 *      a valve from.
 *
 * A relabel can no longer flip a cup into a valve, because there is nothing to
 * relabel. Moving the drawn direction now means changing the frozen record's
 * own words, which is a diff a reviewer reads against a claim.
 * ====================================================================== */

/**
 * The words the record uses for each direction. Matched as plain substrings on
 * lowered text, so every phrase here can be found in the record by eye.
 *
 * They are phrases rather than words on purpose. "paid" on its own is in
 * `e3-pricing-001`'s worked example — "the agency paid $2,125 and billed the
 * client $2,500" — where it describes the settlement of a commission and not a
 * payout at all.
 */
export const DIRECTION_PHRASES = Object.freeze({
  /* The intermediary ends the sentence holding this money. */
  kept: Object.freeze([
    'retained by', 'retained on', 'retained a', 'retains', 'kept by',
    'taken by', 'take rate', 'commission', 'received by', 'received on', 'gross margin',
  ]),
  /* The intermediary ends the sentence having handed this money to somebody
   * else. A cost of revenue paid to a partner is the plainest case. */
  paid: Object.freeze([
    'paid out as', 'paid out to', 'paid to', 'paid away', 'paid as', 'payout',
    'traffic acquisition cost', 'handed to', 'handed on', 'passed on to',
  ]),
  /* Nobody's cut at all: a count of what reached the far end. What failed to
   * arrive is not all middleman take, and this is era 7's whole guard. */
  arrived: Object.freeze([
    'reaching the', 'reaching a', 'reached the', 'reached a', 'that arrived', 'arriving at',
  ]),
});

/** Names a toll may not carry. Every one of them is a way to write the label back in. */
export const DIRECTION_KEYS = Object.freeze([
  'measures', 'measure', 'direction', 'kept', 'paid', 'arrived', 'flow', 'way',
  'shape', 'part', 'cup', 'wedge', 'handover', 'arrival', 'valve',
]);

/**
 * The record's own naming of the quantity: the statement up to its first break.
 *
 * Everything after that break is gloss, and gloss on this record names other
 * parties. The cut is at the first of a dash, a colon, a semicolon, or the end
 * of the first sentence — where a full stop counts only when a space and a
 * capital follow it, so that "14.13% in 1977" is not read as two sentences.
 */
export function statementHead(statement, where) {
  const text = String(statement || '').trim();
  if (text.length < 12) {
    throw new TollRecordError(
      `${where || 'this claim'} carries no statement to read, so there is nothing to say which way ` +
      'its money went. A drawing of a middleman\'s cut needs the record to say it was a cut.',
      text,
    );
  }
  let end = text.length;
  for (const mark of ['—', '–', ':', ';']) {
    const at = text.indexOf(mark);
    if (at > 0 && at < end) end = at;
  }
  const stop = /\.\s+[A-Z(]/.exec(text);
  if (stop && stop.index > 0 && stop.index < end) end = stop.index;
  return text.slice(0, end).trim();
}

/**
 * THROWING FORM. Which way this claim's money went, from the record's own words.
 *
 * Returns `{ measures, from, phrase }` — the direction, which field of the
 * record settled it, and the record's own words that did. Refuses rather than
 * guessing, on both of the ways a record can fail to say: saying nothing, and
 * saying two things at once.
 *
 * One function, read by the planner and by the guard, so the two cannot answer
 * it differently. The same posture `cupHolds` takes.
 */
export function directionFromRecord(claim, where) {
  const place = where || (claim && claim.id) || 'this claim';
  const hitsIn = (text) => {
    const hay = String(text || '').toLowerCase();
    const found = [];
    for (const direction of Object.keys(DIRECTION_PHRASES)) {
      for (const phrase of DIRECTION_PHRASES[direction]) {
        if (hay.includes(phrase)) found.push({ direction, phrase });
      }
    }
    return found;
  };
  const settle = (found, from) => {
    const ways = [...new Set(found.map((f) => f.direction))];
    if (ways.length === 0) return null;
    if (ways.length > 1) {
      throw new TollRecordError(
        `${place}: the ${from} says the money went two ways at once — ` +
        `${found.map((f) => `"${f.phrase}" (${f.direction})`).join(' and ')}. This page draws a ` +
        'valve and a cup for money a middleman kept and a pipe off the page for money he handed ' +
        'on, and those are opposite drawings. The row is refused rather than drawn one of the two ' +
        'ways, because a page that guesses here inverts its own finding half the time.',
        { from, found },
      );
    }
    return Object.freeze({ measures: ways[0], from, phrase: found[0].phrase });
  };

  /* THE UNIT FIRST. It is the record's own name for what the share is of, and
   * it names the party more often than not. */
  const fromUnit = settle(hitsIn(claim && claim.unit), 'unit');
  if (fromUnit) return fromUnit;

  /* THEN THE HEAD OF THE STATEMENT, which is where the record names the
   * quantity before it starts glossing it. */
  const fromHead = settle(hitsIn(statementHead(claim && claim.statement, place)), 'statement');
  if (fromHead) return fromHead;

  throw new TollRecordError(
    `${place}: neither the unit "${claim && claim.unit}" nor the head of its statement says ` +
    'whether this share was retained by the middleman, handed on to somebody else, or counted at ' +
    'the far end. Those are three different drawings and this page will not choose between them. ' +
    'The row is refused. Either the record has to say, or this claim is not a toll.',
    { id: claim && claim.id, unit: claim && claim.unit },
  );
}

/* ======================================================================
 * 3 · HOW MANY TOLLS A PLATE CARRIES, AND WHY
 *
 * `rival` is era 7 and only era 7. It means the record holds more than one
 * measurement OF THE SAME QUESTION and they do not agree. `two` means the era
 * holds two different tolls on two different bases; they are drawn apart and
 * never added.
 * ====================================================================== */

export const RELATION = Object.freeze({
  one: Object.freeze({ min: 1, max: 1 }),
  two: Object.freeze({ min: 2, max: 2 }),
  rival: Object.freeze({ min: 3, max: 8 }),
});

/* ======================================================================
 * 4 · THE SEVEN PLATES
 *
 * `field` is the organ field the era file keeps the claim under, so the plan
 * can check the era file's copy against `claims.json` the way `era-plan.js`
 * does. `sourceKey` is the string that must appear in the claim's own source
 * list; it is what makes `counter` and `visibility` checkable rather than
 * remembered.
 *
 * `base` is the sentence the plate prints above the drawing, and it MUST NOT
 * carry a digit. A number in the base sentence would be a second copy of a
 * number, and every serious failure on this project has been two copies of one
 * number. `assertTollSelection` refuses one.
 * ====================================================================== */

export const PLATES = Object.freeze([

  Object.freeze({
    era: 1,
    relation: 'two',
    relationNote:
      'The record carries the agent\'s cut twice in this era, on two different bases. Before the ' +
      'trade settled on one rate, and after. The two figures are drawn apart and never added.',
    tolls: Object.freeze([
      Object.freeze({
        id: 'e1-pricing-001',
        field: 'PRICING',
        base: 'Every dollar the advertiser paid for the space, before the trade agreed on one rate.',
        visibility: 'ranged',
        counter: 'Horsky and Zeithammer, reading the trade press back',
        sourceKey: 'Horsky & Zeithammer',
        why:
          'This is the only figure the record carries for the agent\'s cut before the rate was ' +
          'standardised. The source publishes a range and no typical value, so G1 refuses it a ' +
          'middle value and the plate draws no valve.',
        caveat: null,
      }),
      Object.freeze({
        id: 'e1-pricing-004',
        field: 'PRICING',
        base: 'Every dollar of gross billings the advertiser handed the agency.',
        visibility: 'posted',
        counter: 'Haase, writing down the trade\'s own rule',
        sourceKey: 'Haase 1934',
        why:
          'This is the era\'s settled cut and the one the chapter opens on. The rate was customary ' +
          'from the early 1890s and enforced from 1893 by publisher recognition, so a reader of ' +
          'the day could look it up.',
        caveat:
          'One cut here is missing. Publishers also paid national representatives, and the record ' +
          'does not establish that rate.',
      }),
    ]),
  }),

  Object.freeze({
    era: 2,
    relation: 'one',
    relationNote:
      'The record settles one cut for this era, and it sits on money the agency has already cut ' +
      'once. Mutual published no network rate card at all.',
    tolls: Object.freeze([
      Object.freeze({
        id: 'e2-pricing-006',
        field: 'PRICING',
        base:
          'Every dollar a member station took from Mutual network business, after the agency had ' +
          'already taken its cut.',
        visibility: 'opened',
        counter: 'the FCC, in its chain broadcasting inquiry',
        sourceKey: 'FCC',
        why:
          'Mutual billed at its stations\' own card rates and published no network card, so the ' +
          'only network cut the record can price in this era is the one Mutual retained from its ' +
          'member stations. A federal inquiry put it on the public record.',
        caveat: null,
      }),
    ]),
  }),

  Object.freeze({
    era: 3,
    relation: 'two',
    relationNote:
      'Two middlemen, one after the other, on two different bases, inside one era. The second cut ' +
      'is taken from what the first one left. The plate draws them apart and never adds them.',
    tolls: Object.freeze([
      Object.freeze({
        id: 'e3-pricing-001',
        field: 'PRICING',
        base: 'Every dollar of gross media billings the advertiser handed the agency.',
        visibility: 'posted',
        counter: 'a broadcast advertising textbook, recording the trade rule',
        sourceKey: 'Zeigler & Howard',
        why:
          'The agency commission ran the whole era at one rate, and the textbook prints the worked ' +
          'example: the medium bills the agency gross, the agency pays net and bills the client gross.',
        caveat: null,
      }),
      Object.freeze({
        id: 'e3-pricing-003',
        field: 'PRICING',
        base: 'What was left of the advertiser\'s money after the agency had taken its cut.',
        visibility: 'ranged',
        counter: 'the same textbook, which prints a range and no typical value',
        sourceKey: 'Zeigler & Howard',
        why:
          'Station representative firms sold local stations\' inventory to national advertisers and ' +
          'took a second commission, on the amount the agency left. The source gives the range and ' +
          'no central, so this reading has no middle value.',
        caveat: null,
      }),
    ]),
  }),

  Object.freeze({
    era: 4,
    relation: 'one',
    relationNote:
      'The record settles one cut for this era, and it is the first on the page that somebody ' +
      'counted rather than quoted.',
    tolls: Object.freeze([
      Object.freeze({
        id: 'e4-pricing-001',
        field: 'PRICING',
        base: 'Every dollar of media billings that ran through US advertising agencies.',
        visibility: 'opened',
        counter: 'the Economic Census, counting agency receipts',
        sourceKey: 'Economic Census',
        why:
          'The census counted what agencies actually received, which is not the same thing as the ' +
          'rate the trade quoted. The quoted rate held; the received rate had already started to slip.',
        caveat: null,
      }),
    ]),
  }),

  Object.freeze({
    era: 5,
    relation: 'two',
    relationNote:
      'Two different middlemen, two different sets of books, in one era. Neither figure is a share ' +
      'of the advertiser\'s dollar. This is where the counting moves onto the seller\'s own books.',
    tolls: Object.freeze([
      Object.freeze({
        id: 'e5-pricing-006',
        field: 'PRICING',
        base: 'Every dollar of Overture\'s own revenue.',
        visibility: 'filed',
        counter: 'Overture\'s own annual filing',
        sourceKey: 'Form 10-K',
        why:
          'This is the take of the distribution layer in paid search, and it is the first cut on ' +
          'the page measured against a seller\'s own revenue rather than against the advertiser\'s ' +
          'dollar. Search serving cost a fraction of it, so distribution was the dominant cost of a click.',
        caveat: null,
      }),
      Object.freeze({
        id: 'e5-sellers-004',
        field: 'SELLERS',
        base: 'Every dollar of network advertising money DoubleClick sold for its publishers.',
        visibility: 'filed',
        counter: 'DoubleClick\'s own annual filing',
        sourceKey: 'Form 10-K',
        why:
          'An ad network\'s gross margin is its effective take rate, because its cost of revenue is ' +
          'mostly the fees it pays the publishers. The filing gives three years on two different ' +
          'treatments, so the interval is wide and G1 refuses it a middle value.',
        caveat: null,
      }),
    ]),
  }),

  Object.freeze({
    era: 6,
    relation: 'two',
    relationNote:
      'Two figures about one company, six years apart, on two different bases. One is what Google ' +
      'kept on other people\'s sites. The other is what Google paid away across all of its ' +
      'advertising. They point opposite ways and cannot be set beside each other.',
    tolls: Object.freeze([
      Object.freeze({
        id: 'e6-pricing-003',
        field: 'PRICING',
        base: 'Every dollar of advertising revenue Google earned on other people\'s sites.',
        visibility: 'filed',
        counter: 'Google\'s own annual filing',
        sourceKey: 'Form 10-K',
        why:
          'Google\'s take on syndicated inventory was thin at the start of the era, because it was ' +
          'buying distribution. The filing reports the payout, and what Google kept is the rest of it.',
        caveat: null,
      }),
      Object.freeze({
        id: 'e6-pricing-004',
        field: 'PRICING',
        base: 'Every dollar of Google\'s own advertising revenue.',
        visibility: 'filed',
        counter: 'Google\'s own annual filing',
        sourceKey: 'Form 10-K',
        why:
          'This is the whole business rather than the syndicated part of it, and it falls across ' +
          'the era as Google\'s own sites outgrow the network. It is a payout, not a take, and it ' +
          'is on the plate so that nobody reads it as one.',
        caveat: null,
      }),
    ]),
  }),

  Object.freeze({
    era: 7,
    relation: 'rival',
    relationNote:
      'Three attempts at one question, three answers, three bases. The first counts what Google ' +
      'kept. The other two count what reached the far end. They do not reconcile, and no ' +
      'arithmetic on this page will make them.',
    tolls: Object.freeze([
      Object.freeze({
        id: 'e7-pricing-006',
        field: 'PRICING',
        base:
          'Every dollar an advertiser spends when the trade starts and ends inside Google\'s own stack.',
        visibility: 'filed',
        counter: 'Google, describing its own stack',
        sourceKey: 'How our display buying platforms',
        why:
          'This is the seller\'s own aggregate of its three products, published once, in a blog ' +
          'post. The DOJ record puts the figure higher on open-web trades. It is the only one of ' +
          'the three that is a take rather than an arrival.',
        caveat: null,
      }),
      Object.freeze({
        id: 'e7-pricing-004',
        field: 'PRICING',
        base: 'Every pound of advertiser programmatic spend the study followed.',
        visibility: 'unclosed',
        counter: 'ISBA and PwC, tracing a British supply chain',
        sourceKey: 'ISBA',
        why:
          'A national advertiser association paid for a full trace of the supply chain and got most ' +
          'of the way. Part of the money could not be attributed to any participant at all, and ' +
          'only a small share of impressions could be followed end to end.',
        unclosed: Object.freeze({
          label: 'NOBODY COULD SAY WHERE THIS WENT',
          note:
            'The study could not attribute part of the money to any participant in the chain. The ' +
            'plate draws no figure for it, because the record carries none: the share is a number ' +
            'inside the claim\'s sentence, not a value the record measured.',
        }),
        caveat: null,
      }),
      Object.freeze({
        id: 'e7-pricing-005',
        field: 'PRICING',
        base: 'Every dollar entering a demand-side platform, in the pool the study sized.',
        visibility: 'unclosed',
        counter: 'the ANA, tracing an American supply chain',
        sourceKey: 'ANA',
        why:
          'A second national advertiser association ran the same exercise on the other side of the ' +
          'Atlantic and reached a different answer on a different base. The record also warns that ' +
          'the pool it sized may not be a US total.',
        caveat:
          'The money that fails to arrive is not all middleman take. The study counts unseen and ' +
          'invalid inventory in it too.',
      }),
    ]),
  }),
]);

/* ======================================================================
 * 5 · THE GUARDS
 * ====================================================================== */

/** Every toll on every plate, flat, in page order. */
export function allTolls() {
  const out = [];
  for (const plate of PLATES) for (const toll of plate.tolls) out.push({ era: plate.era, ...toll });
  return out;
}

/**
 * THROWING FORM. A unit that is not a share out of a hundred.
 *
 * Every plate draws a slice off a bar, and a slice needs a share. Twelve of the
 * thirteen units say "percent" or "%"; the thirteenth says "cents of each …
 * dollar", which is the same thing in the other currency of the sentence. A
 * unit like "USD per agate line" has no slice in it, and a plate that drew one
 * anyway would draw two dollars as two percent of a bar.
 *
 * This is what stands between the drawing and a record repair that changes a
 * unit. It refuses rather than guessing.
 */
export function assertShareUnit(unit, where) {
  const text = String(unit || '');
  const isPercent = /(^|\s)%|percent/i.test(text);
  const isCentsOfADollar = /cents of (each|every)[^.]*dollar/i.test(text);
  if (!isPercent && !isCentsOfADollar) {
    throw new TollRecordError(
      `${where}: the unit "${text}" is not a share of anything, so this toll cannot be drawn as a ` +
      'slice off a bar. Every plate on this page takes a slice out of its own base. A unit that ' +
      'is a rate or a level has no slice in it, and drawing one would put a dollar figure on a ' +
      'percentage scale.',
      { unit: text, where },
    );
  }
  return true;
}

/**
 * THE DIVISOR, AND WHY IT IS NOT ARITHMETIC ON A CLAIM.
 *
 * Every unit above is a share out of a hundred. Turning it into a fraction of a
 * drawn bar is a unit conversion, not a derivation: it is applied to the
 * central, the low and the high alike, so it is the `transform` that
 * `planClaimMark` documents as leaving the interval ratio — and therefore G1's
 * answer — unchanged. It is written here, once, rather than typed at a draw site.
 */
export const SHARE_DIVISOR = 100;

/**
 * THROWING FORM. Everything this file declares about the record is still true.
 *
 * Runs over the frozen `claims.json`. It is bounded and finite: seven plates,
 * thirteen tolls, five visibility classes, three measures. There is no
 * paraphrase of a claim id.
 */
export function assertTollSelection(claimsFile) {
  const file = claimsFile || guards.getFrozen('claims');
  const list = Array.isArray(file) ? file : (file && file.claims);
  if (!Array.isArray(list) || list.length === 0) {
    throw new TollRecordError(
      'the toll plates need claims.json. Without it this file is a list of ids and a set of ' +
      'sentences about them, and nothing would say when one of the sentences stopped being true.',
      file && Object.keys(file || {}),
    );
  }
  const index = new Map(list.map((c) => [c.id, c]));

  if (PLATES.length === 0) {
    throw new TollRecordError('the plate table is empty, so every check below would pass on nothing.', 0);
  }

  const seenIds = new Set();
  const seenBases = new Set();
  const seenUnits = new Map();
  /** id → the direction the record derives for it. Filled below, read by era 7's guard. */
  const directions = new Map();

  for (const plate of PLATES) {
    const rule = RELATION[plate.relation];
    if (!rule) {
      throw new TollRecordError(
        `era ${plate.era} declares the relation "${plate.relation}", which is not one of ` +
        `${Object.keys(RELATION).join(', ')}.`, plate.relation,
      );
    }
    if (plate.tolls.length < rule.min || plate.tolls.length > rule.max) {
      throw new TollRecordError(
        `era ${plate.era} declares "${plate.relation}" and carries ${plate.tolls.length} toll(s). ` +
        'The relation is what the plate prints to say how its figures stand to each other, and a ' +
        'relation that does not match the count is a sentence the drawing contradicts.',
        { era: plate.era, relation: plate.relation, tolls: plate.tolls.length },
      );
    }
    if (typeof plate.relationNote !== 'string' || plate.relationNote.trim().length < 24) {
      throw new TollRecordError(`era ${plate.era} carries no written relation note.`, plate.era);
    }

    for (const toll of plate.tolls) {
      const where = `era ${plate.era} · ${toll.id}`;

      if (seenIds.has(toll.id)) {
        throw new TollRecordError(
          `${where}: this claim is already drawn on another plate. One claim, one toll — a figure ` +
          'that appears twice on this page is two plates making one argument look like two.', toll.id,
        );
      }
      seenIds.add(toll.id);

      const claim = index.get(toll.id);
      if (!claim) {
        throw new TollRecordError(
          `${where} is not in claims.json, so this plate cannot read its verdict, its interval or ` +
          'its unit. It will not fall back to the era file\'s copy.', toll.id,
        );
      }

      if (!VISIBILITY[toll.visibility]) {
        throw new TollRecordError(
          `${where} declares the visibility "${toll.visibility}", which is not one of ` +
          `${Object.keys(VISIBILITY).join(', ')}.`, toll.visibility,
        );
      }
      /* THE DIRECTION IS NOT A FIELD ANY MORE, so first: it is not on the toll.
       * A label here would be a second copy of something the record already
       * says, with nothing checking that the two agree — and the one time the
       * two disagreed, the page drew a payout as a take. */
      for (const key of DIRECTION_KEYS) {
        if (key in toll) {
          throw new TollRecordError(
            `${where} carries "${key}". Which way the money went is not this file's to declare. It ` +
            'is read off the claim\'s own unit and the head of its statement, because a word in a ' +
            'build file is a word somebody can change: this page once drew Overture\'s traffic ' +
            'acquisition cost as a rust wedge with a valve on it and a full cup under it, on the ' +
            'strength of one edited label, with every guard in the folder green. Delete the field. ' +
            'If the drawing is wrong, the record is what has to say so.',
            { key, id: toll.id },
          );
        }
      }
      const direction = directionFromRecord(claim, where);
      if (!MEASURES[direction.measures]) {
        throw new TollRecordError(
          `${where} derives "${direction.measures}", which is not one of ` +
          `${Object.keys(MEASURES).join(', ')}. The difference between what a middleman kept and ` +
          'what reached the far end is the whole of era 7\'s guard.', direction,
        );
      }
      directions.set(toll.id, direction);

      /* THE CROSS-CHECK. `counter` and `visibility` are this file's claims about
       * the claim, and both rest on who produced the figure. That is in the
       * record's own source list. A repair that changes the source has to
       * change this line too, and until it does, nothing renders. */
      const names = (claim.sources || []).map((s) => String(s && s.name));
      if (typeof toll.sourceKey !== 'string' || toll.sourceKey.trim().length < 3) {
        throw new TollRecordError(`${where} names no source key, so its counter is unchecked.`, toll.sourceKey);
      }
      if (!names.some((n) => n.includes(toll.sourceKey))) {
        throw new TollRecordError(
          `${where} says the figure comes from "${toll.counter}" and names "${toll.sourceKey}" as ` +
          'the source that proves it. No source on the claim carries that string. Either the ' +
          'record moved or this sentence has gone stale, and a stale sentence about provenance is ' +
          'the one thing this whole plate set is arguing about.',
          { sourceKey: toll.sourceKey, sources: names },
        );
      }

      /* A `ranged` declaration says the source published a range and no single
       * figure. G1 is the only thing allowed to answer whether a claim has a
       * middle value, so the declaration is checked against G1's answer rather
       * than against a memory of it. The converse is NOT asserted: a claim can
       * be span-only for a reason that has nothing to do with how it was
       * published — `e5-sellers-004` is a filed figure whose interval carries
       * three years on two treatments. */
      const kind = guards.markKindFor(claim);
      if (toll.visibility === 'ranged' && kind !== 'span') {
        throw new TollRecordError(
          `${where} is declared "ranged" — the source prints a range and no single figure — and G1 ` +
          'gives this claim a middle value. One of the two is wrong. Read the claim before you ' +
          'change either.',
          { id: toll.id, kind },
        );
      }

      if (typeof toll.base !== 'string' || toll.base.trim().length < 24) {
        throw new TollRecordError(`${where} names no base, and the base is the whole point.`, toll.base);
      }
      if (/\d/.test(toll.base)) {
        throw new TollRecordError(
          `${where}'s base sentence carries a digit: "${toll.base}". The base says WHAT the cut is ` +
          'a share of. A number in it would be a second copy of a number, printed beside the one ' +
          'the mark carries, with nothing checking that the two agree.',
          toll.base,
        );
      }
      if (seenBases.has(toll.base)) {
        throw new TollRecordError(`${where} repeats a base sentence another toll already prints.`, toll.base);
      }
      seenBases.add(toll.base);

      if (typeof toll.why !== 'string' || toll.why.trim().length < 40) {
        throw new TollRecordError(
          `${where} carries no written reason for being on this page. Which claim stands for an ` +
          'era\'s middleman cut is a judgement, and a judgement with no reason beside it is one ' +
          'nobody can review.', toll.why,
        );
      }

      assertShareUnit(claim.unit, where);

      /* THE SENTENCE THE WHOLE PAGE IS BUILT ON: no two eras measured their cut
       * on the same base. It is read out of the record's own `unit` field, over
       * all thirteen tolls, rather than asserted in prose. If two of them ever
       * coincide, the plate set needs a decision and this is where it stops. */
      if (seenUnits.has(claim.unit)) {
        throw new TollRecordError(
          `${where} and ${seenUnits.get(claim.unit)} both measure on "${claim.unit}". This page ` +
          'exists because no two of these cuts share a base. Two that do are either a duplicate ' +
          'selection or a change in the record, and either way the page needs a decision rather ' +
          'than a redraw.',
          { unit: claim.unit, ids: [seenUnits.get(claim.unit), toll.id] },
        );
      }
      seenUnits.set(claim.unit, toll.id);
    }
  }

  /* ERA 7, WHICH IS THE PLATE THAT CAN BE MISREAD AS THE CLAIM THE PAGE
   * REFUSES TO MAKE. Three things are checked here, before anything is planned:
   * it is the only rival plate, it carries more than one reading of what
   * arrived rather than what was taken, and exactly one of its tolls carries
   * the money the record says nobody could place. */
  const rivals = PLATES.filter((p) => p.relation === 'rival');
  if (rivals.length !== 1 || rivals[0].era !== PLATES[PLATES.length - 1].era) {
    throw new TollRecordError(
      'the last plate is the only one whose readings are rivals for one question, and nothing else ' +
      'on the page may be. A second rival plate would turn "these do not agree" into a habit ' +
      'rather than a finding.',
      rivals.map((p) => p.era),
    );
  }
  const last = rivals[0];
  /* Read off the derived directions rather than off a field, so this guard
   * cannot be satisfied by writing the word "arrived" into the table. */
  const arrived = last.tolls.filter((t) => directions.get(t.id).measures === 'arrived');
  if (arrived.length < 2) {
    throw new TollRecordError(
      `era ${last.era} carries ${arrived.length} reading(s) of what arrived rather than what was ` +
      'taken. Two of its three figures count arrivals, and saying so is the guard on the one ' +
      'plate that can be read as the claim this page refuses to make.',
      arrived.map((t) => t.id),
    );
  }
  const unclosed = allTolls().filter((t) => t.unclosed);
  if (unclosed.length !== 1 || unclosed[0].era !== last.era) {
    throw new TollRecordError(
      'exactly one toll on this page names money the record says nobody could place, and it is on ' +
      'the last plate. That block is drawn as an object with no figure on it, and it is the one ' +
      'cup on the page that cannot be filled shut.',
      unclosed.map((t) => t.id),
    );
  }
  return true;
}

export default {
  PLATES, VISIBILITY, MEASURES, RELATION, OUTSIDE_VISIBILITY, SHARE_DIVISOR,
  DIRECTION_PHRASES, DIRECTION_KEYS, directionFromRecord, statementHead,
  allTolls, assertTollSelection, assertShareUnit,
};
