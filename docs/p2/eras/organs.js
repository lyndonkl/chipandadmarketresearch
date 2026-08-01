/* docs/p2/eras/organs.js — THE SPINE OF THE SEVEN MACHINES
 *
 * Team B3. Direction: "The Bench" (p2-ad-market/design/DESIGN.md).
 *
 * Eight organs at eight fixed screen positions, redrawn seven times. This file
 * owns the positions and nothing else. It reads no record, mints no mark, holds
 * no number a reader will see, and draws nothing. It is geometry, names, and one
 * bijection.
 *
 * WHY THE POSITION LIST IS NOT WRITTEN HERE. `../lib/tokens.js` exports ORGANS —
 * the eight machine parts, in order. That list is the library's answer and this
 * module takes it. What this module adds is the map from each part to the schema
 * field it shows, and `assertOrganSpine()` checks that the map is a bijection
 * over the library's list on every load. A ninth position cannot be invented
 * here and an eighth cannot be dropped: either one throws before anything draws.
 *
 * THE REPETITION IS THE POINT. Fixed positions are what let a reader compare
 * era 3 to era 6 without scrolling twice. So every x in POSITION is a constant,
 * derived from one pitch, and no era may move one. `positionsFor()` returns a
 * frozen record and there is no setter.
 */

import {
  ORGANS, IRON, ZINC_RULE, ZINC_TEXT, BRASS, CYAN, RUST, STIPPLE, BONE,
  RULE_WIDTH, GRID, AA_OBJECT, contrastRatio, assertObjectColor, assertTextColor,
} from '../lib/tokens.js';

/* ======================================================================
 * 1 · THE BIJECTION
 *
 * Eight machine parts, eight schema fields. The part is the drawing's word for
 * the position; the field is the record's word for what sits there. A reader
 * learns the field name — that is the gate ("a reader can name what each organ
 * does after seeing two eras") — and the part name is engraved beside it so the
 * drawing and the register never come apart.
 * ====================================================================== */

/** part -> the schema field that fills it. The order is ORGANS' order. */
export const FIELD_FOR = Object.freeze({
  INLET:  'BUYERS',
  GATE:   'CREATORS',
  METER:  'MEASUREMENT',
  RULE:   'PRICING',
  SORTER: 'TARGETING',
  TOLL:   'SELLERS',
  DOOR:   'MEDIUM',
  OUTLET: 'SCALE',
});

/** field -> part. Derived, never typed twice. */
export const ORGAN_FOR = Object.freeze(
  Object.fromEntries(Object.entries(FIELD_FOR).map(([organ, field]) => [field, organ])),
);

/** The eight fields, in the machine's own left-to-right order. */
export const FIELDS = Object.freeze(ORGANS.map((organ) => FIELD_FOR[organ]));

/**
 * What each position does, in one sentence, and THE SENTENCE NEVER CHANGES
 * BETWEEN ERAS. That is the whole mechanism behind the team's gate. If era 4's
 * MEASUREMENT sentence differed from era 6's, a reader could not learn the
 * position — they would be learning fourteen things instead of eight.
 *
 * Measured with tools/readability.py as one document: FK 3.5, Ease 84.5,
 * Fog 5.0, SMOG 6.4. Gates are FK <= 10, Ease >= 50, Fog <= 12, SMOG <= 12.
 */
export const ORGAN_SENTENCE = Object.freeze({
  INLET:  'Who paid. The money drops in here.',
  GATE:   'Who made the ad. The gate sets what gets through.',
  METER:  'Who counted the audience. The gauge shows the count.',
  RULE:   'Who set the price, and by what rule. This is the box you turn.',
  SORTER: 'How the ad found its audience. The sorter picks the lane.',
  TOLL:   'Who owned the audience. The valve splits the dollar.',
  DOOR:   'What carried the ad. The door is the way out.',
  OUTLET: 'How big the market got. The spout is the size.',
});

/**
 * The one operable position. Era 1 teaches the verb here and the other six
 * reuse it, so it is a constant rather than a per-era choice: a control that
 * moved between eras would have to be found again seven times.
 *
 * It is RULE because PRICING is the field that holds the price rule, and the
 * brief's own list — the commission, the sponsorship deal, the spot rate, the
 * segment, the impression, the auction, the algorithm — is seven readings of
 * that one field.
 */
export const OPERABLE_ORGAN = 'RULE';

export class OrganSpineError extends Error {
  constructor(message, detail) {
    super(message);
    this.name = 'OrganSpineError';
    this.detail = detail;
  }
}

/**
 * THROWING FORM. The map is a bijection over the library's own list.
 *
 * Called at module load, and again by the test bench. What it prevents: a
 * ninth organ invented in this file, an eighth quietly dropped, two parts
 * pointing at one field, or a field with no part. Every one of those produces
 * a machine that looks finished and has lost a position — and a lost position
 * is invisible, because the reader has nothing to compare it against.
 */
export function assertOrganSpine() {
  const parts = Object.keys(FIELD_FOR);
  const missing = ORGANS.filter((o) => !parts.includes(o));
  const extra = parts.filter((p) => !ORGANS.includes(p));
  if (missing.length || extra.length) {
    throw new OrganSpineError(
      'organs.js does not cover the library\'s ORGANS list exactly. The position list has one ' +
      'owner — ../lib/tokens.js — and this module only maps it onto the schema fields.',
      { missing, extra, ORGANS: [...ORGANS] },
    );
  }
  const fields = Object.values(FIELD_FOR);
  if (new Set(fields).size !== fields.length) {
    throw new OrganSpineError('two machine parts point at one schema field.', fields);
  }
  for (const organ of ORGANS) {
    if (!ORGAN_SENTENCE[organ] || typeof ORGAN_SENTENCE[organ] !== 'string') {
      throw new OrganSpineError(
        `${organ} has no fixed sentence. Every position needs one, and it must be the same ` +
        'sentence in all seven eras — that is what makes the position learnable.', organ,
      );
    }
  }
  if (!ORGANS.includes(OPERABLE_ORGAN)) {
    throw new OrganSpineError('the operable organ is not one of the eight.', OPERABLE_ORGAN);
  }
  return true;
}

/* ======================================================================
 * 2 · THE FIXED GEOMETRY
 *
 * One viewBox, three bands, eight columns. Everything below is derived from
 * PITCH, so the eight columns cannot drift apart by hand-editing one of them.
 * ====================================================================== */

/**
 * The viewBox. `top` is NEGATIVE on purpose: it opens a band of headroom above
 * the plate row for the pull ring's teaching label, without moving a single
 * organ. Moving the organs to make room for a label that shows once would put
 * the eight fixed positions at the mercy of a teaching aid, which is backwards.
 */
export const VIEW = Object.freeze({ width: 1240, top: -48, height: 614 });

/** The viewBox attribute, in one place, so the renderer cannot restate it. */
export const VIEW_BOX = `0 ${VIEW.top} ${VIEW.width} ${VIEW.height}`;

/** The headroom band above the plates. Nothing but the teaching label goes here. */
export const HEADROOM = Object.freeze({ top: VIEW.top + 6, height: 32 });

/** The plate row: eight heads, one per position, each carrying a pull ring. */
export const PLATE = Object.freeze({
  top: 34, height: 116, width: 134, left: 16,
  pitch: (VIEW.width - 32 - 134) / (ORGANS.length - 1),
});

/** The machine band: the channel and the eight parts hanging off it. */
export const MACHINE = Object.freeze({
  top: 178,
  bottom: 470,
  channelTop: 344,
  channelBottom: 380,
});

/** The tally band: one grade strip per position, at the position's own x. */
export const TALLY = Object.freeze({ top: 496, height: 18, maxWidth: 122, pitch: 11 });

/** Where the plate for column `i` sits. Frozen; there is no setter. */
function plateBox(index) {
  const x = PLATE.left + PLATE.pitch * index;
  return Object.freeze({
    x, y: PLATE.top, width: PLATE.width, height: PLATE.height,
    cx: x + PLATE.width / 2, bottom: PLATE.top + PLATE.height,
  });
}

/**
 * Every position, resolved. Keyed by part name AND by field name, so a caller
 * that thinks in the record's vocabulary and a caller that thinks in the
 * drawing's vocabulary reach the same frozen object.
 */
export const POSITION = Object.freeze((() => {
  const out = {};
  ORGANS.forEach((organ, index) => {
    const plate = plateBox(index);
    const spec = Object.freeze({
      organ,
      field: FIELD_FOR[organ],
      index,
      numeral: String(index + 1).padStart(2, '0'),
      sentence: ORGAN_SENTENCE[organ],
      operable: organ === OPERABLE_ORGAN,
      plate,
      cx: plate.cx,
      ringCx: plate.x + plate.width - 19,
      ringCy: plate.y + 20,
      tally: Object.freeze({
        x: plate.cx - TALLY.maxWidth / 2,
        y: TALLY.top,
        width: TALLY.maxWidth,
        height: TALLY.height,
      }),
    });
    out[organ] = spec;
    out[FIELD_FOR[organ]] = spec;
  });
  return out;
})());

/** The eight positions in drawing order. */
export const POSITIONS = Object.freeze(ORGANS.map((organ) => POSITION[organ]));

/** Resolve a part name or a field name to its fixed position. Throws otherwise. */
export function positionOf(key) {
  const spec = POSITION[String(key || '').toUpperCase()];
  if (!spec) {
    throw new OrganSpineError(
      `"${key}" is not one of the eight positions. Use a machine part ` +
      `(${ORGANS.join(', ')}) or a schema field (${FIELDS.join(', ')}).`, key,
    );
  }
  return spec;
}

/* ======================================================================
 * 3 · THE LINE WORK
 *
 * Path data only. No DOM, no colour decisions beyond the three roles the design
 * brief fixes: IRON is the mechanism, and it is the only colour the structure
 * of the machine is ever drawn in. Brass, cyan and rust appear on three named
 * parts and nowhere else, and each one is listed here so a reader of this file
 * can see the whole colour budget at once:
 *
 *   BRASS  the slug of money falling into the INLET hopper, and nothing else
 *   CYAN   the METER's needle and hub, and nothing else
 *   RUST   the TOLL's tap stub, hatched, and nothing else
 *
 * Every claim reading is drawn as an IRON CALIPER with the figure printed
 * beside it. That is the house pattern — `../charts/svg-kit.js`'s own caliper()
 * strokes iron and prints the measured distance in iron — and it is why this
 * module needs no rule for deciding whether a given claim is money or a count.
 * It never has to decide. The instrument is iron; the number is text.
 * ====================================================================== */

const N = (v) => Number(v.toFixed(2));

/** The channel: two iron rails running the whole width, INLET to OUTLET. */
export function channelPaths() {
  const a = POSITION.INLET.cx;
  const b = POSITION.OUTLET.cx;
  return Object.freeze([
    { d: `M${N(a)} ${MACHINE.channelTop} H${N(b)}`, role: 'channel' },
    { d: `M${N(a)} ${MACHINE.channelBottom} H${N(b)}`, role: 'channel' },
  ]);
}

/**
 * The part at one position, as path descriptors.
 *
 * Each descriptor is `{ d, role, stroke?, dashed?, width? }`. `role` names what
 * the line is for, so the renderer can title it and the test bench can count
 * it without parsing path data.
 */
export function organPaths(key) {
  const p = positionOf(key);
  const cx = N(p.cx);
  const top = MACHINE.channelTop;
  const bot = MACHINE.channelBottom;

  switch (p.organ) {
    case 'INLET':
      return [
        { d: `M${N(cx - 58)} 196 H${N(cx + 58)}`, role: 'hopper rim' },
        { d: `M${N(cx - 58)} 196 L${N(cx - 15)} ${top}`, role: 'hopper wall' },
        { d: `M${N(cx + 58)} 196 L${N(cx + 15)} ${top}`, role: 'hopper wall' },
        { d: `M${N(cx - 30)} 230 H${N(cx + 30)}`, role: 'hopper mark', dashed: true, stroke: ZINC_RULE },
      ];
    case 'GATE':
      return [
        { d: `M${N(cx - 16)} 240 V${top}`, role: 'gate rail' },
        { d: `M${N(cx + 16)} 240 V${top}`, role: 'gate rail' },
        { d: `M${N(cx - 14)} 252 h28 v58 h-28 z`, role: 'gate plate' },
        { d: `M${N(cx)} 310 V${top}`, role: 'gate stem', dashed: true, stroke: ZINC_RULE },
      ];
    case 'METER':
      return [
        { d: `M${N(cx)} 308 V${top}`, role: 'meter stem' },
        { d: `M${N(cx - 46)} 262 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0`, role: 'meter case' },
        { d: `M${N(cx - 32)} 244 A40 40 0 0 1 ${N(cx + 32)} 244`, role: 'meter scale', stroke: ZINC_RULE },
        { d: `M${N(cx - 30)} 232 l7 6 M${N(cx)} 220 v9 M${N(cx + 30)} 232 l-7 6`, role: 'meter ticks', stroke: ZINC_RULE },
      ];
    case 'RULE':
      return [
        { d: `M${N(cx - 100)} 296 h200 v128 h-200 z`, role: 'rule box', width: RULE_WIDTH.emphasis },
        { d: `M${N(cx - 76)} 318 h56 M${N(cx - 76)} 334 h40 M${N(cx - 76)} 350 h64`, role: 'rule engraving', stroke: ZINC_RULE },
        { d: `M${N(cx + 62)} 296 V274`, role: 'handle post' },
        { d: `M${N(cx + 62)} 274 h30`, role: 'handle arm' },
      ];
    case 'SORTER':
      return [
        { d: `M${N(cx)} ${bot} L${N(cx - 48)} 448`, role: 'sorter lane' },
        { d: `M${N(cx)} ${bot} L${N(cx - 16)} 448`, role: 'sorter lane' },
        { d: `M${N(cx)} ${bot} L${N(cx + 16)} 448`, role: 'sorter lane' },
        { d: `M${N(cx)} ${bot} L${N(cx + 48)} 448`, role: 'sorter lane' },
        { d: `M${N(cx - 58)} 448 H${N(cx + 58)}`, role: 'sorter bar' },
      ];
    case 'TOLL':
      return [
        { d: `M${N(cx - 20)} ${top} L${N(cx + 20)} ${bot} L${N(cx + 20)} ${top} L${N(cx - 20)} ${bot} Z`, role: 'toll valve' },
        { d: `M${N(cx)} ${bot} V430`, role: 'toll tap' },
        { d: `M${N(cx - 28)} 430 v26 h56 v-26`, role: 'toll cup' },
      ];
    case 'DOOR':
      return [
        { d: `M${N(cx)} 300 V${top}`, role: 'door post' },
        { d: `M${N(cx)} ${bot} V424`, role: 'door post' },
        { d: `M${N(cx)} 316 L${N(cx + 46)} 288`, role: 'door leaf' },
        { d: `M${N(cx)} 338 A44 44 0 0 1 ${N(cx + 40)} 314`, role: 'door swing', dashed: true, stroke: ZINC_RULE },
      ];
    case 'OUTLET':
      return [
        { d: `M${N(cx)} ${top} L${N(cx + 52)} 326`, role: 'spout' },
        { d: `M${N(cx)} ${bot} L${N(cx + 52)} 398`, role: 'spout' },
      ];
    default:
      throw new OrganSpineError(`no line work for "${p.organ}".`, p.organ);
  }
}

/** The leader from a plate down to its part. Dashed zinc, one per position. */
export function leaderPath(key) {
  const p = positionOf(key);
  const stops = {
    INLET: 196, GATE: 240, METER: 216, RULE: 274,
    SORTER: MACHINE.channelBottom, TOLL: MACHINE.channelTop,
    DOOR: 288, OUTLET: MACHINE.channelTop,
  };
  return { d: `M${N(p.cx)} ${p.plate.bottom} V${stops[p.organ]}`, role: 'leader', dashed: true, stroke: ZINC_RULE };
}

/**
 * The three coloured accents, listed as data so the whole colour budget of the
 * machine is greppable in one place and the test bench can assert it.
 *
 * `paint` names the entry in PAINT below that a draw site must spread. The hex
 * is not repeated here: one copy, in PAINT, guarded.
 */
export const ACCENTS = Object.freeze([
  Object.freeze({ organ: 'INLET', role: 'money', paint: 'money', what: 'the slug falling into the hopper' }),
  Object.freeze({ organ: 'METER', role: 'count', paint: 'countLine, countHub', what: 'the needle and its hub' }),
  Object.freeze({ organ: 'TOLL', role: 'take', paint: 'take', what: 'the hatched stub on the tap' }),
]);

/** Structure colour and weight. One answer, so no part can drift off it. */
export const STRUCTURE = Object.freeze({
  stroke: IRON,
  width: RULE_WIDTH.mechanism,
  guide: ZINC_RULE,
  label: ZINC_TEXT,
  grid: GRID.unit,
});

/* ======================================================================
 * 4 · THE COLOUR BUDGET, AS PAINT RATHER THAN AS PROSE
 *
 * WHAT WENT WRONG. This file listed the three accents in a comment and left the
 * renderer next door to choose the hexes. It chose BRASS, CYAN, RUST, STIPPLE
 * and IRON and CALLED NO COLOUR GUARD AT ALL. Run them by hand and two throw:
 *
 *   assertObjectColor(CYAN)     2.46:1 on Bone — the METER's needle, a bare
 *                               cyan stroke with nothing behind it
 *   assertObjectColor(STIPPLE)  1.53:1 on Bone — the withheld tally tick, a
 *                               stipple fill with a stipple stroke around it
 *
 * Both are under the 3:1 WCAG 1.4.11 asks of a graphical object, which means a
 * reader could lose the needle and the tick against the paper.
 *
 * THE FIX IS NOT ANOTHER GUARD CALL IN THE RENDERER. A renderer that has to
 * remember to ask is a renderer that will forget, and this project has proved
 * that at four layers now. So the colours stop being NAMES over there and become
 * ATTRIBUTE BAGS here. A draw site spreads one onto an element and gets the
 * whole role — the colour AND the iron that carries it — because there is no way
 * to take one and leave the other. `era-machine.js` imports no colour token at
 * all any more.
 *
 * `assertColourBudget()` runs at import, below. It puts every standalone colour
 * through `assertObjectColor`, checks that each colour declared as CARRIED
 * really does fail the object test — a declaration that is no longer true is a
 * declaration nobody has read — and then checks that the carrier it names is
 * actually IN the attributes the draw site spreads. That last one is the same
 * posture `assertDistinguishable` takes on `redundant`: a second channel that
 * exists only in the argument list is not a second channel.
 * ====================================================================== */

/**
 * Every colour this machine paints, with the shape a draw site uses it in.
 *
 *   attrs       spread onto the element
 *   under       spread onto a second element drawn FIRST, where a stroke needs a
 *               stroke — a line cannot carry one, so the carrier is a line too
 *   standalone  whether the colour clears 3:1 on Bone on its own
 *   carrier     the colour that makes it perceivable when it does not
 */
const PAINT_SPEC = Object.freeze({
  /** MONEY. The slug falling into the INLET hopper. The only filled round mark. */
  money: Object.freeze({
    hex: BRASS, standalone: true, carrier: null,
    attrs: Object.freeze({ fill: BRASS }),
    under: null,
    channel: 'solid fill, filled round particle — the only one on the machine',
  }),
  /**
   * THE COUNT, as a line: the METER's needle.
   *
   * A stroke cannot carry a stroke, so the needle is drawn twice — an iron line
   * at 4.6px first, the cyan line at 2.4px on top of it. What a reader sees is a
   * cyan needle inside an iron casing, and what carries it against the paper is
   * the iron, at 5.12:1. Before this it was a bare 2.4px cyan line at 2.46:1.
   */
  countLine: Object.freeze({
    hex: CYAN, standalone: false, carrier: IRON,
    under: Object.freeze({ stroke: IRON, 'stroke-width': 4.6, fill: 'none', 'stroke-linecap': 'round' }),
    attrs: Object.freeze({ stroke: CYAN, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }),
    channel: 'an iron line under every cyan line, 4.6px against 2.4px — weight, not hue',
  }),
  /** THE COUNT, as a mark: the METER's hub. An open mark with an iron stroke. */
  countHub: Object.freeze({
    hex: CYAN, standalone: false, carrier: IRON,
    under: null,
    attrs: Object.freeze({ fill: CYAN, stroke: IRON, 'stroke-width': 1 }),
    channel: 'an iron stroke around every cyan fill',
  }),
  /** THE TAKE. Always hatched: Brass against Rust falls to ΔE 7.8 under tritanopia. */
  take: Object.freeze({
    hex: RUST, standalone: true, carrier: null,
    under: null,
    attrs: Object.freeze({ stroke: RUST, 'stroke-width': 1.2 }),
    channel: '45° hatch, always, plus a printed label',
  }),
  /**
   * DOCUMENTED ABSENCE. The fill is a stipple TEXTURE the caller supplies, so
   * this bag is the frame around it — dashed iron, the same three things rule 5
   * asks for and the same shape `svg-kit.absenceBlock` draws. The tally tick used
   * to frame its stipple in STIPPLE, at 1.53:1, which is a block with no edge.
   */
  absence: Object.freeze({
    hex: STIPPLE, standalone: false, carrier: IRON,
    under: null,
    attrs: Object.freeze({ stroke: IRON, 'stroke-width': 1, 'stroke-dasharray': '4 3' }),
    channel: '2px stipple inside an iron frame, with a printed name',
  }),
});

/** What a draw site spreads. `PAINT.countLine.under` then `PAINT.countLine.attrs`. */
export const PAINT = Object.freeze(Object.fromEntries(
  Object.entries(PAINT_SPEC).map(([role, spec]) => [role, Object.freeze({
    attrs: spec.attrs, under: spec.under, hex: spec.hex, channel: spec.channel,
  })]),
));

export class OrganColourError extends Error {
  constructor(message, detail) { super(message); this.name = 'OrganColourError'; this.detail = detail; }
}

/**
 * THROWING FORM. Every colour this machine draws, measured rather than asserted.
 *
 * Called at module load, and again by the test bench. It covers the structure
 * colours this file owns and the five paints above, and it is the reason a later
 * edit cannot put a bare cyan needle back on the page with a green test run.
 */
export function assertColourBudget() {
  /* The structure. Iron is 5.12:1 and Zinc is 3.01:1 — both clear the object
   * test, and both are asserted rather than remembered. */
  assertObjectColor(STRUCTURE.stroke, 'the era machine\'s structure');
  assertObjectColor(STRUCTURE.guide, 'the era machine\'s guide lines');
  assertTextColor(STRUCTURE.label, 'the era machine\'s labels');

  for (const [role, spec] of Object.entries(PAINT_SPEC)) {
    const where = `the era machine's ${role} paint`;
    const ratio = contrastRatio(spec.hex, BONE);

    if (spec.standalone) {
      assertObjectColor(spec.hex, where);
      if (spec.carrier) {
        throw new OrganColourError(
          `${where} clears the object test on its own and still names a carrier. Say one thing.`,
          { role, hex: spec.hex, carrier: spec.carrier },
        );
      }
      continue;
    }

    /* Declared as carried. If the hex now clears 3:1 the declaration has gone
     * stale, and a stale declaration is worse than none: it is a sentence in
     * this file that a reader will believe. */
    if (ratio >= AA_OBJECT) {
      throw new OrganColourError(
        `${where} is declared as a colour that cannot stand alone, and ${spec.hex} measures ` +
        `${ratio.toFixed(2)}:1 on Bone, which clears the ${AA_OBJECT}:1 an object needs. Either ` +
        'the token moved or the declaration is stale. Fix the one that is wrong.',
        { role, hex: spec.hex, ratio },
      );
    }
    if (!spec.carrier) {
      throw new OrganColourError(
        `${where} is ${ratio.toFixed(2)}:1 on Bone and names no carrier, so it would be drawn ` +
        'bare. That is exactly how a 2.46:1 cyan needle and a 1.53:1 stipple tick reached the ' +
        'page: the colour was picked and no guard was asked.',
        { role, hex: spec.hex, ratio },
      );
    }
    assertObjectColor(spec.carrier, `${where}'s carrier`);

    /* AND THE CARRIER MUST BE DRAWN. A redundancy that exists only in a field
     * called `carrier` is not a redundancy — the same cross-check tokens.js runs
     * on a declared `redundant` channel. */
    const painted = [...Object.values(spec.attrs), ...Object.values(spec.under || {})]
      .map((v) => String(v).toUpperCase());
    if (!painted.includes(String(spec.carrier).toUpperCase())) {
      throw new OrganColourError(
        `${where} names ${spec.carrier} as the colour that carries it and does not draw it. ` +
        'The bag a draw site spreads is the whole claim: if the carrier is not in it, the draw ' +
        'site paints the bare colour and nothing on the page separates it from the paper.',
        { role, attrs: spec.attrs, under: spec.under },
      );
    }
  }

  /* Every accent the budget names has paint, and every paint is reachable. */
  for (const accent of ACCENTS) {
    for (const name of accent.paint.split(',').map((s) => s.trim())) {
      if (!PAINT_SPEC[name]) {
        throw new OrganColourError(
          `the ${accent.organ} accent names a paint "${name}" that does not exist. The accent ` +
          'list and the paint table are one budget written twice unless they agree.', accent,
        );
      }
    }
  }
  return true;
}

assertOrganSpine();
assertColourBudget();
