/* docs/p2/toll/toll-plate.js — THE SEVEN TOLL PLATES, DRAWN
 *
 * Team B6. DESIGN.md problem 2, option 2C. The renderer, and nothing else: it
 * takes a sealed plate set and draws it. It reads no record, mints no mark, and
 * does no arithmetic on any claim value.
 *
 * THERE IS NO `renderPlate(era)` AND THERE WILL NOT BE ONE.
 *
 * `DESIGN.md` says of this object: "Era 7's diagram alone can be misread as
 * exactly the claim the page refuses to make. It needs its own guard." The
 * cheapest and strongest version of that guard is that era 7's plate cannot be
 * alone. `renderTollPlates` draws all seven or throws, and this module exports
 * no way to draw one. A screenshot of the last plate on its own is a thing
 * somebody has to crop, not a thing this code will produce.
 *
 * THE VERB. There is none. This object has no control, because option 2C won
 * the decision on the argument that "the finding arrives without the reader
 * touching anything, which is the only version most readers will actually get".
 * Nothing moves, so the reduced-motion path is the same drawing and there is no
 * alternative encoding to get wrong.
 *
 * COLOUR. Brass is the money in the bar. Rust is the slice the middleman takes,
 * and it is ALWAYS a 45-degree hatch with a printed label beside it, because
 * `REDUNDANT_CODING.take` in `../lib/tokens.js` says hatch is not decoration
 * here — Brass against Rust falls to ΔE2000 7.8 under tritanopia. Iron is the
 * apparatus. Stipple is documented absence and never has an edge of its own.
 * `assertTollColourBudget()` runs at import and measures every one of them.
 *
 * ONE THING ABOUT THE HATCH, WRITTEN DOWN BECAUSE IT LOOKS LIKE A MISTAKE.
 * `svg-kit.GRADE_FORMS` gives a fill texture per source grade: A solid, B
 * ruled, C 45-degree hatch. This page does NOT use it as a grade register.
 * Every wedge on every plate is hatched, whatever its grade, because the hatch
 * is the mandated second channel on Rust and a solid grade-A wedge would drop
 * it. So on this page a fill texture never means a grade. The grade is carried
 * by the weight and dash of the wedge's iron edge, and printed as a word beside
 * every figure.
 */

import {
  el, h, svgRoot, layer, titled, text, absenceBlock, gradeFill, stipplePaint, shortLabel,
  IRON, BRASS, STIPPLE, ZINC_TEXT, ZINC_RULE, GRAPHITE, BONE, SURFACE,
  RULE_WIDTH, assertObjectColor, assertTextColor,
} from '../charts/svg-kit.js';
/* RUST is the one token this drawing needs that `svg-kit` does not re-export —
 * no chart in that folder paints the intermediary's take. It comes from the one
 * file that owns it, never from a literal. */
import { RUST, assertDistinguishable } from '../lib/tokens.js';
import { PAINT } from '../eras/organs.js';
import { VIEW, CUP, openTollPlan, isTollPlan } from './toll-plan.js';
import { VISIBILITY } from './toll-records.js';

export class TollRenderError extends Error {
  constructor(message, detail) { super(message); this.name = 'TollRenderError'; this.detail = detail; }
}

const N = (v) => Number(Number(v).toFixed(2));

/** How deep every pool is, in every cup, on every plate. One number, no data in it. */
const POOL_DEPTH = CUP.poolDepth;

/* ======================================================================
 * 1 · THE COLOUR BUDGET, MEASURED AT IMPORT
 *
 * The same posture `organs.js` takes. A renderer that has to remember to ask a
 * colour guard is a renderer that will forget, and this project has proved that
 * at four layers. The measurement runs when the module loads, so no page can
 * render without it.
 * ====================================================================== */

export function assertTollColourBudget() {
  assertObjectColor(IRON, 'the toll plate\'s apparatus');
  assertObjectColor(ZINC_RULE, 'the toll plate\'s guide lines');
  assertObjectColor(BRASS, 'the toll plate\'s money bar');
  assertObjectColor(RUST, 'the toll plate\'s take');
  assertTextColor(ZINC_TEXT, 'the toll plate\'s labels');
  assertTextColor(GRAPHITE, 'the toll plate\'s prose');
  assertTextColor(IRON, 'the toll plate\'s instrument annotations');

  /* Brass against Rust is the pair this drawing cannot afford to get wrong: the
   * bar is money, the slice out of it is the take, and they touch. Hue alone
   * does not separate them, so the call declares the two channels the record
   * says Rust really carries, and the cross-check reads the record rather than
   * the argument list. */
  const pair = assertDistinguishable(BRASS, RUST, { redundant: ['hatch', 'label'] });
  if (pair.crossCheck !== 'confirmed') {
    throw new TollRenderError(
      'the toll plate declares that its brass bar and its rust slice separate by hatch and by a ' +
      `printed label, and the record could not confirm it (${pair.crossCheck}). A redundancy that ` +
      'exists only in an argument list is not a redundancy.',
      pair,
    );
  }

  /* Stipple is 1.53:1 on Bone and never stands alone. Every stipple on this
   * page is framed in dashed iron, and the frame is the era machines' own
   * `PAINT.absence` bag rather than a second answer written here. */
  if (!String(PAINT.absence.attrs.stroke).toUpperCase().includes(IRON.toUpperCase())) {
    throw new TollRenderError(
      'the absence frame this page borrows from the era machines is no longer iron, so the stipple ' +
      'on the last plate would be drawn with no edge at 1.53:1 on Bone.',
      PAINT.absence.attrs,
    );
  }
  return { pair, stipple: STIPPLE };
}

assertTollColourBudget();

/* ======================================================================
 * 2 · THE VISIBILITY TOKEN
 *
 * The one thing on this page a reader is invited to read straight down. Five
 * forms, drawn, at the same place in every plate. The ink goes out of them as
 * the page goes on: solid, framed, outline, dashed, and finally a stipple block
 * — which is rule 5's own shape for documented absence.
 *
 * AT THE SAME PLACE MEANS AT THE SAME PIXEL. The plates used to be indented
 * down the page by a whole number of steps, so this column zig-zagged by up to
 * a hundred and sixty-eight pixels while the bars above it — the things that
 * must NOT be read across — moved by a few. The stagger was on the wrong
 * channel. `toll.css` now pins the three fixed rows to one left edge on every
 * plate, and the bars carry all of the variation.
 * ====================================================================== */

const TOKEN_SIZE = 22;

function drawToken(parent, visibility, sentence) {
  const spec = VISIBILITY[visibility];
  if (!spec) throw new TollRenderError(`"${visibility}" is not a visibility class.`, visibility);
  const host = h('span', { class: 'p2-toll-token', 'data-form': spec.form }, parent);
  const svg = svgRoot(host, {
    width: TOKEN_SIZE, height: TOKEN_SIZE, alt: sentence, className: 'p2-toll-token-svg',
  });
  svg.style.width = `${TOKEN_SIZE}px`;
  svg.style.height = `${TOKEN_SIZE}px`;
  const c = TOKEN_SIZE / 2;

  if (spec.form === 'solid-square') {
    el('rect', { x: c - 6, y: c - 6, width: 12, height: 12, fill: IRON }, svg);
  } else if (spec.form === 'framed-square') {
    el('rect', { x: c - 4, y: c - 4, width: 8, height: 8, fill: IRON }, svg);
    el('rect', {
      x: c - 9, y: c - 9, width: 18, height: 18, fill: 'none', stroke: IRON, 'stroke-width': 1.2,
    }, svg);
  } else if (spec.form === 'open-square') {
    el('rect', {
      x: c - 6, y: c - 6, width: 12, height: 12, fill: 'none', stroke: IRON, 'stroke-width': 1.4,
    }, svg);
  } else if (spec.form === 'dashed-square') {
    el('rect', {
      x: c - 6, y: c - 6, width: 12, height: 12, fill: 'none',
      stroke: IRON, 'stroke-width': 1.2, 'stroke-dasharray': '3 2.5',
    }, svg);
  } else {
    el('rect', { x: c - 7, y: c - 7, width: 14, height: 14, fill: stipplePaint(svg) }, svg);
    el('rect', { x: c - 7, y: c - 7, width: 14, height: 14, fill: 'none', ...PAINT.absence.attrs }, svg);
  }
  titled(svg, sentence);
  return host;
}

/* ======================================================================
 * 3 · ONE BAR
 *
 * The bar is the whole of that era's own starting amount, AND IT IS A DIFFERENT
 * SIZE IN EVERY DRAWING. Different length, different thickness, different
 * origin, all three derived in `toll-plan.js` from the base's own words.
 *
 * The size is an identity and not a quantity: it says which base this is, and
 * it measures nothing. Every drawing prints that on itself, because a reader
 * who assumes one ruler across thirteen drawings gets the wrong answer for
 * free, and that is the answer this page exists to refuse.
 * ====================================================================== */

/**
 * The mandated 45-degree hatch on Rust, built by `svg-kit`'s own pattern maker.
 * See the file header for why the grade register is not used for a fill here.
 *
 * IT IS LAZY, AND THAT IS NOT A PERFORMANCE CHOICE. `gradeFill` writes a
 * `<pattern>` carrying a rust stroke into the drawing's `<defs>`. A row that
 * counts an arrival must have NO RUST IN IT AT ALL — that is the era-7 guard,
 * and the bench asserts it by scanning the drawn SVG for a rust stroke. Calling
 * this at the top of every row put one in every drawing, including the two the
 * guard is about. So the pattern is minted where the paint is used, and a row
 * with no take in it never mints one.
 */
function rustHatch(svg) {
  return gradeFill(svg, 'C', RUST);
}

/** The source grade, carried by the wedge's edge rather than by its fill. */
function gradeStroke(grade) {
  const g = String(grade || 'C').toUpperCase();
  if (g === 'A') return { 'stroke-width': 2.4, 'stroke-dasharray': null };
  if (g === 'B') return { 'stroke-width': 1.6, 'stroke-dasharray': '3 2' };
  return { 'stroke-width': 1.2, 'stroke-dasharray': '1.5 2' };
}

function spanEnds(parent, { x1, x2, y, height }) {
  el('path', {
    d: `M${N(x1)} ${N(y - 6)} V${N(y + height + 6)} M${N(x2)} ${N(y - 6)} V${N(y + height + 6)}`,
    fill: 'none', stroke: IRON, 'stroke-width': 1.4,
  }, parent);
}

/**
 * THE PART THE RECORD IS NOT SURE OF, AND IT IS NOT PAINTED.
 *
 * THIS IS A REPAIR. A span-only cut used to be drawn as two rust rectangles
 * laid end to end — the certain part and the uncertain part, in the same hatch,
 * touching — so a claim reading "somewhere between ten and fifty" drew as a
 * solid fifty per cent take. The uncertain half was painted, and paint is
 * quantity.
 *
 * So the reach between the two ends is now a thin barred line at the middle of
 * the bar with a printed label, and nothing is filled between them. A block is
 * an amount; a line between two bars is a reach. The eye can tell them apart
 * without reading a word, which is the whole argument of this page.
 */
function drawReach(parent, { x1, x2, y, height, label, anchorLeft = true }) {
  if (Math.abs(x2 - x1) < 0.75) return null;
  const mid = y + height / 2;
  const g = layer(parent, { class: 'p2-toll-reach' });
  el('path', {
    d: `M${N(Math.min(x1, x2))} ${N(mid)} H${N(Math.max(x1, x2))}`,
    fill: 'none', stroke: IRON, 'stroke-width': 1.4, 'stroke-dasharray': '2 2.5',
  }, g);
  spanEnds(g, { x1, x2, y, height });
  /* The label sits a line ABOVE the row's other chrome rather than beside it.
   * An arrival row prints "not traced to the far end" at the left of the bar at
   * that height, and on a narrow reading the two strings landed on top of each
   * other and drew as one unreadable word. */
  text(g, {
    x: N(anchorLeft ? Math.max(x1, x2) + 8 : Math.min(x1, x2) - 8),
    y: N(y - 22), value: label, role: 'chrome', fill: IRON, size: 9,
    anchor: anchorLeft ? 'start' : 'end',
  });
  return g;
}

function drawRow(host, row) {
  const box = h('div', { class: 'p2-toll-draw' }, host);
  const svg = svgRoot(box, {
    width: VIEW.width, height: VIEW.height, alt: row.alt, className: 'p2-toll-svg',
  });
  const take = () => rustHatch(svg);
  const bar = row.bar;

  /* The leader. It runs from the top edge of the drawing into the inlet, so the
   * sentence printed directly above is attached to the end of the bar the money
   * enters by. The same device the pull ring's teaching label uses. */
  el('path', {
    d: `M74 ${N(bar.y + bar.height / 2)} H${N(bar.x - 16)}`,
    fill: 'none', stroke: ZINC_RULE, 'stroke-width': 1, 'stroke-dasharray': '3 3',
  }, svg);
  text(svg, {
    x: 6, y: bar.y + bar.height / 2 + 3.5, value: 'taken out of',
    role: 'label', fill: ZINC_TEXT, size: 9,
  });

  /* The inlet bracket. Iron, at mechanism weight: it is apparatus. */
  el('path', {
    d: `M${N(bar.x - 16)} ${N(bar.y - 7)} V${N(bar.y + bar.height + 7)}`,
    fill: 'none', stroke: IRON, 'stroke-width': RULE_WIDTH.mechanism,
  }, svg);

  /* The bar: the money, brass, inside an iron channel. */
  const barGroup = layer(svg, { class: 'p2-toll-bar' });
  el('rect', {
    x: N(bar.x), y: N(bar.y), width: N(bar.width), height: N(bar.height), fill: BRASS,
  }, barGroup);
  el('rect', {
    x: N(bar.x), y: N(bar.y), width: N(bar.width), height: N(bar.height),
    fill: 'none', stroke: IRON, 'stroke-width': RULE_WIDTH.mechanism,
  }, barGroup);
  titled(barGroup, `The whole bar is one thing. ${row.base}`);

  /* The spout. What is not taken leaves here. */
  el('path', {
    d: `M${N(bar.x + bar.width)} ${N(bar.y + 2)} H${N(bar.x + bar.width + 16)} ` +
       `V${N(bar.y + bar.height - 2)} H${N(bar.x + bar.width)}`,
    fill: 'none', stroke: IRON, 'stroke-width': RULE_WIDTH.mechanism,
  }, svg);
  text(svg, {
    x: bar.x + bar.width + 22, y: bar.y + bar.height / 2 + 3.5,
    value: 'out', role: 'label', fill: ZINC_TEXT, size: 9,
  });

  /* THE SCALE, DECLARED ON THE DRAWING ITSELF. Not a tick and not a conversion:
   * a sentence saying this bar's size belongs to this base and to nothing else.
   * A reader who takes a length off one plate and lays it against another has
   * been told, on both of them, that the answer means nothing. */
  text(svg, {
    x: 6, y: 15, value: 'own scale',
    role: 'chrome', fill: ZINC_TEXT, size: 9,
    /* Two words, because the bar begins as far left as 96 and the labels above
     * it begin there too: a longer mark at this corner lands on top of them on
     * the four widest drawings. The sentence is in the title, in the row's own
     * accessible name, and in the note printed above all seven plates. */
    title: 'This bar is drawn at a size that belongs to this base. Every plate on this page is ' +
      'drawn at its own, so no two of them can be measured against each other.',
  });

  if (row.wedge) drawWedge(svg, row, take);
  else if (row.handover) drawHandover(svg, row);
  else drawArrival(svg, row);

  drawDrop(svg, row);
  if (row.cup) drawCup(svg, row, take);

  /* The unit, in the record's own words, cut to what fits and never
   * paraphrased. The whole string is in the title, exactly as the cross-era
   * drawer does it. */
  text(svg, {
    x: 6, y: VIEW.height - 8,
    value: `of what · ${shortLabel(row.unit, 66)}`,
    role: 'chrome', fill: ZINC_TEXT, size: 9.5, title: row.unit,
  });
  text(svg, {
    x: bar.x + bar.width + 38, y: VIEW.height - 8,
    value: row.year == null ? 'no year on the record' : String(row.year),
    role: 'chrome', fill: ZINC_TEXT, size: 9.5, anchor: 'end',
  });
  return { box, svg };
}

/**
 * The slice the middleman takes, off the left of the bar.
 *
 * PAINTED TO THE PART THE RECORD IS SURE OF, AND NO FURTHER. On a point mark
 * that is the central; on a span-only mark it is the low end. Whatever the
 * record leaves open past it is drawn by `drawReach`, which paints nothing.
 */
function drawWedge(svg, row, take) {
  const bar = row.bar;
  const g = layer(svg, { class: 'p2-toll-wedge', 'data-form': row.form });
  const stroke = gradeStroke(row.grade);
  const point = 'valveX' in row.wedge;
  const painted = point ? row.wedge.valveX : row.wedge.xAtLo;

  el('rect', {
    x: N(bar.x), y: N(bar.y), width: N(painted - bar.x), height: N(bar.height), fill: take(),
  }, g);
  el('rect', {
    x: N(bar.x), y: N(bar.y), width: N(painted - bar.x), height: N(bar.height),
    fill: 'none', stroke: IRON, ...stroke,
  }, g);

  /* THE REST OF THE READING, UNPAINTED. On a span-only row it runs from the low
   * end to the high end and there is no valve; on a point row it is the 80 per
   * cent interval around the central, which is drawn for the same reason —
   * paint is what this drawing uses for an amount, and neither of these is one.
   * This branch is reached because `valveX` is not a key on this wedge, not
   * because it was checked. */
  drawReach(g, {
    x1: row.wedge.xAtLo, x2: row.wedge.xAtHi, y: bar.y, height: bar.height,
    label: point ? 'and the interval reaches here' : 'no middle value: the cut is somewhere in here',
  });
  titled(g, row.title);
  return g;
}

/**
 * MONEY HANDED ON IS NOT MONEY KEPT, AND IT IS NOT DRAWN LIKE IT.
 *
 * THIS IS THE OTHER REPAIR. Overture's traffic acquisition cost and Google's
 * payout used to be drawn with the take's own apparatus: a rust wedge off the
 * left of the bar, an index on the valve, a pipe down into a rust pool, and a
 * row of text saying the valve took it. Both of those figures are money PAID
 * OUT to the partners who sent the traffic. Drawing money leaving as money
 * taken inverts the finding, and it did it on the two largest figures on the
 * page.
 *
 * So: no rust, no valve, no cup. The share sits at the FAR end of the bar,
 * against the outlet, in the same brass as the rest of the money — because it
 * is still money, and it is somebody else's. A pipe carries it out of the
 * drawing, which is the plainest thing this apparatus can say about where money
 * went: it left, and this page cannot follow it.
 */
function drawHandover(svg, row) {
  const bar = row.bar;
  const g = layer(svg, { class: 'p2-toll-handover', 'data-form': row.form });
  const stroke = gradeStroke(row.grade);
  const point = 'divideX' in row.handover;
  const edge = point ? row.handover.divideX : row.handover.xAtLo;
  const right = bar.x + bar.width;

  /* BRASS RULING ON PAPER: money, drawn as money on its way out rather than as
   * money sitting in the bar. It is not rust, because rust on this page means
   * the middleman's cut and this is the opposite of one. The texture is one
   * channel; the iron divider, the pipe leaving the drawing and the printed
   * label are the others, so nothing here rests on a fill alone. */
  el('rect', {
    x: N(edge), y: N(bar.y), width: N(right - edge), height: N(bar.height), fill: SURFACE.paper,
  }, g);
  el('rect', {
    x: N(edge), y: N(bar.y), width: N(right - edge), height: N(bar.height),
    fill: gradeFill(svg, 'B', BRASS),
  }, g);
  el('path', {
    d: `M${N(edge)} ${N(bar.y)} V${N(bar.y + bar.height)}`,
    fill: 'none', stroke: IRON, ...stroke,
  }, g);
  drawReach(g, {
    x1: row.handover.xAtLo, x2: row.handover.xAtHi, y: bar.y, height: bar.height,
    label: point ? 'and the interval reaches here' : 'no middle value: it is somewhere in here',
    anchorLeft: false,
  });

  /* THE PIPE OUT. It runs down from the middle of the handed-on part, turns,
   * and leaves the drawing with an open mouth. There is no cup under this bar
   * to catch it, because nothing here was caught. */
  const centre = (edge + right) / 2;
  const floor = CUP.y + CUP.height / 2;
  const mouth = VIEW.width - 12;
  el('path', {
    d: `M${N(centre)} ${N(bar.y + bar.height)} V${N(floor)} H${N(mouth)}`,
    fill: 'none', stroke: IRON, 'stroke-width': RULE_WIDTH.mechanism,
  }, g);
  el('path', {
    d: `M${N(mouth - 9)} ${N(floor - 7)} L${N(mouth)} ${N(floor)} L${N(mouth - 9)} ${N(floor + 7)}`,
    fill: 'none', stroke: IRON, 'stroke-width': 1.4,
  }, g);
  /* Anchored to the mouth, not to the pipe's centre. Left-anchored at
   * `centre + 8` this label ran to x=715.6 in a 700-unit viewBox on
   * e6-pricing-004 and rendered as "handed on, and off this p". Where the
   * pipe falls is data; where the drawing ends is not, so the label hangs
   * off the fixed edge and cannot overflow whatever the data does. */
  text(g, {
    x: N(mouth - 12), y: N(floor - 7), anchor: 'end',
    value: 'handed on, and off this page', role: 'chrome', fill: ZINC_TEXT, size: 9,
  });
  titled(g, `${row.title} · This money was handed to somebody else. It is not a cut this ` +
    'middleman kept, so there is no valve on this bar and no cup under it.');
  return g;
}

/**
 * A figure for what reached the far end. It is not a figure for what was taken.
 *
 * The brass sits at the RIGHT of the bar, against the spout, and there is no
 * rust anywhere in this drawing. What did not arrive is framed and named rather
 * than painted as a take: the record's own sentence counts unseen and invalid
 * inventory in there too, and rust on this page means the intermediary's cut.
 */
function drawArrival(svg, row) {
  const bar = row.bar;
  const g = layer(svg, { class: 'p2-toll-arrival', 'data-form': row.form });
  const point = 'edgeX' in row.arrival;
  /* THE THREE ZONES ON AN ARRIVAL BAR, and the middle one is the repair.
   * Everything left of `xAtHi` certainly did not reach the far end, and it is
   * the only part painted as unreached. Everything right of `xAtLo` certainly
   * did. Between them the record does not say, and `drawReach` bars that stretch
   * off at both ends rather than letting it read as either. */
  const left = point ? row.arrival.edgeX : row.arrival.xAtHi;

  el('rect', {
    x: N(bar.x), y: N(bar.y), width: N(left - bar.x), height: N(bar.height), fill: SURFACE.paper,
  }, g);
  el('rect', {
    x: N(bar.x), y: N(bar.y), width: N(left - bar.x), height: N(bar.height),
    fill: 'none', stroke: IRON, 'stroke-width': 1, 'stroke-dasharray': '5 3',
  }, g);
  text(svg, {
    x: N(bar.x + 4), y: N(bar.y - 10),
    value: 'not traced to the far end', role: 'chrome', fill: IRON, size: 9,
  });

  if (point) {
    el('path', {
      d: `M${N(left)} ${N(bar.y - 7)} V${N(bar.y + bar.height + 7)}`,
      fill: 'none', stroke: IRON, 'stroke-width': RULE_WIDTH.mechanism,
    }, g);
  }
  drawReach(g, {
    x1: row.arrival.xAtLo, x2: row.arrival.xAtHi, y: bar.y, height: bar.height,
    label: point ? 'and the interval reaches here' : 'no middle value: it is somewhere in here',
    anchorLeft: false,
  });
  titled(g, row.title);
  return g;
}

/**
 * The pipe from the bar to the cup.
 *
 * A point row drops one stem with the valve on it. A span-only row drops two,
 * one from each end of the range, so the cup below is fed by two pipes and
 * cannot have one level. A row that counts an arrival drops nothing at all,
 * because nothing on that bar is known to be a middleman's cut.
 */
function drawDrop(svg, row) {
  if (!row.wedge) return null;
  const bar = row.bar;
  const cup = row.cup;
  const g = layer(svg, { class: 'p2-toll-drop' });
  const centre = cup.x + cup.width / 2;
  const jog = cup.y - 12;
  const stem = (x) => el('path', {
    d: `M${N(x)} ${N(bar.y + bar.height)} V${N(jog)} H${N(centre)} V${N(cup.y)}`,
    fill: 'none', stroke: IRON, 'stroke-width': RULE_WIDTH.mechanism,
  }, g);

  if ('valveX' in row.wedge) {
    stem(row.wedge.valveX);
    /* THE VALVE, drawn as an open index on the pipe. Open, not filled: a filled
     * round mark means money in this palette and a valve is apparatus. */
    el('circle', {
      cx: N(row.wedge.valveX), cy: N(bar.y + bar.height + 9), r: 3.6,
      fill: BONE, stroke: IRON, 'stroke-width': 1.6,
    }, g);
    titled(g, 'The valve sits where the cut ends, and what it diverts falls into the cup.');
    return g;
  }
  stem(row.wedge.xAtLo);
  stem(row.wedge.xAtHi);
  titled(g, 'Two pipes, because the record gives two ends and no middle value. There is no valve here.');
  return g;
}

/**
 * The cup.
 *
 * THE CUP HOLDS NO QUANTITY, AND THAT IS THE POINT. It pools to the same depth
 * in every drawing on this page. Seven cups of one size, at one place under
 * seven bars, with seven levels in them, would be a shared scale wearing
 * apparatus — the seven-bar chart turned on its side and let in through the
 * mechanism. So the pool says the valve diverted something, and the figure is
 * printed under the drawing where it can carry its own unit.
 *
 * What varies is only what the record lets the cup hold at all:
 *
 *   a measured amount   a pool with a solid rust surface
 *   a range             a pool with no surface: the top edge is dashed iron
 *   nothing             no pool, and the reason printed beside it
 *   an open cup         no floor, and a named stipple block in the gap
 */
function drawCup(svg, row, take) {
  const cup = row.cup;
  const g = layer(svg, { class: 'p2-toll-cup', 'data-open': String(!!cup.open), 'data-holds': cup.holds });
  const left = cup.x;
  const right = cup.x + cup.width;
  const top = cup.y;
  const bottom = cup.floor;
  const poolTop = bottom - POOL_DEPTH;

  if (cup.holds !== 'nothing') {
    el('rect', {
      x: N(left + 3), y: N(poolTop), width: N(cup.width - 6), height: POOL_DEPTH, fill: take(),
    }, g);
    if (cup.holds === 'a measured amount') {
      el('path', {
        d: `M${N(left + 3)} ${N(poolTop)} H${N(right - 3)}`,
        fill: 'none', stroke: RUST, 'stroke-width': 2,
      }, g);
    } else {
      /* No surface, because the record gives no middle value. A dashed edge is
       * a surface nobody could put a ruler on. */
      el('path', {
        d: `M${N(left + 3)} ${N(poolTop)} H${N(right - 3)}`,
        fill: 'none', stroke: IRON, 'stroke-width': 1.6, 'stroke-dasharray': '4 3',
      }, g);
      text(svg, {
        x: N(right + 8), y: N(poolTop + 4),
        value: 'no middle value, so no surface', role: 'chrome', fill: IRON, size: 9,
      });
    }
  }

  /* The walls, always. The floor, unless the record says part of this money
   * could not be placed with anybody at all. */
  const walls = `M${N(left)} ${N(top)} V${N(bottom)} M${N(right)} ${N(top)} V${N(bottom)}`;
  el('path', {
    d: cup.open ? walls : `${walls} M${N(left)} ${N(bottom)} H${N(right)}`,
    fill: 'none', stroke: IRON, 'stroke-width': RULE_WIDTH.mechanism,
  }, g);

  if (cup.open && row.unclosed) {
    /* Rule 5, in the project's own shape: stipple, a dashed iron frame, and a
     * printed name. IT CARRIES NO FIGURE. The share the study could not
     * attribute is a number inside the claim's sentence rather than a value the
     * record measured, and FREEZE.md is explicit that a secondary number inside
     * a statement is not to be trusted as a reading. */
    const drawn = absenceBlock(g, svg, {
      x: N(left), y: N(bottom + 6), width: 300, height: 22,
      extent: row.unclosed.extent,
      label: row.unclosed.label,
      note: row.unclosed.note,
    });
    g.setAttribute('data-absence', drawn.extent);
  }

  if (cup.holds === 'nothing' && !cup.open) {
    text(svg, {
      x: N(right + 8), y: N(top + (bottom - top) / 2 + 3.5),
      value: 'nothing to pour', role: 'chrome', fill: ZINC_TEXT, size: 9,
    });
  }

  titled(g, cup.holds === 'nothing'
    ? 'The cup is empty. This reading counts what arrived, so the plate cannot say how much of ' +
      'the rest anybody took.'
    : `The cup holds what the pipe diverts. It shows that, and never how much. ${row.reading}`);
  return g;
}

/* ======================================================================
 * 4 · ONE PLATE
 * ====================================================================== */

function drawFacts(host, row) {
  const dl = h('dl', { class: 'p2-toll-facts' }, host);

  h('dt', { class: 'p2-arch', text: row.measuresTerm }, dl);
  const cut = h('dd', { class: 'p2-toll-fact-cut' }, dl);
  h('span', { class: 'p2-num', text: row.short }, cut);
  if (row.form === 'span') {
    h('span', { class: 'p2-chrome p2-toll-nomid', text: 'no middle value' }, cut);
  }
  h('span', { class: 'p2-chrome p2-toll-grade', text: `grade ${row.grade || 'not recorded'}` }, cut);

  h('dt', { class: 'p2-arch', text: 'of what' }, dl);
  h('dd', { class: 'p2-chrome p2-toll-fact-of', text: row.unit }, dl);

  h('dt', { class: 'p2-arch', text: 'who says so' }, dl);
  const who = h('dd', { class: 'p2-chrome p2-toll-fact-who' }, dl);
  drawToken(who, row.visibility, row.visibilitySentence);
  h('span', { class: 'p2-toll-counter', text: row.counter }, who);
  return dl;
}

function drawPlate(host, plate) {
  /* NO INDENT. Every plate sits at one left edge, so the three fixed rows under
   * every drawing — and the visibility token in the last of them — line up down
   * the page. The stagger lives inside the drawings now, where the bars differ
   * in length, thickness and origin. It was on the wrong channel before: the
   * page indented the whole card, which moved the bars a little and moved the
   * one column a reader is asked to read straight down by exactly as much. */
  const card = h('article', {
    class: 'p2-toll-plate',
    'data-era': String(plate.era),
    'data-full': String(!!plate.full),
    'data-relation': plate.relation,
    'aria-label': plate.alt,
  }, host);

  const head = h('header', { class: 'p2-toll-head' }, card);
  h('div', { class: 'p2-arch', text: `era ${plate.era} · ${plate.name} · ${plate.years}` }, head);
  h('p', { class: 'p2-chrome p2-toll-relation', text: plate.relationNote }, head);

  const rows = h('div', { class: 'p2-toll-rows' }, card);
  for (const row of plate.rows) {
    const section = h('section', {
      class: 'p2-toll-row',
      'data-form': row.form,
      'data-measures': row.measures,
      /* WHICH FIELD OF THE RECORD PUT THIS ROW IN THAT DIRECTION. On the drawn
       * page rather than only on the plan, so the bench can read the derivation
       * back off the DOM the way it reads every other drawn property. */
      'data-measures-from': row.measuresFrom,
      'data-visibility': row.visibility,
      'data-id': row.id,
    }, rows);
    h('p', { class: 'p2-prose p2-toll-base', text: row.base }, section);
    drawRow(section, row);
    drawFacts(section, row);
    const measures = h('p', { class: 'p2-chrome p2-toll-measures', text: row.measuresLine }, section);
    /* THE DIRECTION IS NOT THIS PAGE'S OPINION, AND THE PAGE SAYS SO. It names
     * the field of the record that settled it and quotes the record's own
     * words. `assertDirectionsFromRecord` re-derives both, so this sentence
     * cannot drift away from the drawing it is under. */
    h('span', { class: 'p2-toll-measures-why', text: row.measuresWhy }, measures);
    h('p', { class: 'p2-chrome p2-toll-vis', text: row.visibilitySentence }, section);
    if (row.caveat) h('p', { class: 'p2-chrome p2-toll-caveat', text: row.caveat }, section);
    /* The written reason this claim stands for this era's cut. It is folded
     * away rather than dropped: it is a judgement a reviewer has to be able to
     * read, and it is still in the DOM, so the prose lint and the readability
     * measurement both still see it. */
    const why = h('details', { class: 'p2-toll-why' }, section);
    h('summary', { class: 'p2-arch', text: 'why this claim' }, why);
    h('p', { class: 'p2-chrome', text: row.why }, why);
  }

  if (plate.guardLine) {
    h('p', { class: 'p2-prose p2-toll-guard', text: plate.guardLine }, card);
  }
  return card;
}

/* ======================================================================
 * 5 · THE PAGE
 * ====================================================================== */

function drawLegend(host) {
  const box = h('div', { class: 'p2-note-box p2-toll-legend' }, host);
  h('div', { class: 'p2-arch', text: 'the bottom row of every plate' }, box);
  h('p', {
    class: 'p2-prose',
    text: 'One mark per reading, at the same place every time. It says who produced the figure, ' +
      'and it is the only thing on this page meant to be read straight down.',
  }, box);
  const list = h('dl', { class: 'p2-toll-legend-list' }, box);
  for (const key of Object.keys(VISIBILITY)) {
    const dt = h('dt', {}, list);
    drawToken(dt, key, VISIBILITY[key].sentence);
    h('dd', { class: 'p2-chrome', text: VISIBILITY[key].sentence }, list);
  }
  return box;
}

function drawRegister(host, stamps) {
  if (!stamps.length) return null;
  const box = h('div', { class: 'p2-note-box p2-toll-register' }, host);
  h('div', {
    class: 'p2-arch',
    text: `verdict register · ${stamps.length} claims on this page were changed after they were written`,
  }, box);
  const table = h('table', { class: 'p2-reg' }, box);
  const hr = h('tr', {}, h('thead', {}, table));
  ['claim', 'verdict', 'what it means'].forEach((c) => h('th', { text: c }, hr));
  const body = h('tbody', {}, table);
  for (const stamp of stamps) {
    const tr = h('tr', {}, body);
    h('td', { text: stamp.id }, tr);
    h('td', { text: stamp.verdict }, tr);
    h('td', { text: stamp.sentence }, tr);
  }
  return box;
}

/**
 * Draw the whole plate set. All seven, or nothing.
 *
 * `plan` must be one `planTollPlates` minted. It is re-validated on content
 * every time it arrives: every container re-checked frozen, every mark
 * re-checked against the live guards, and this module's own invariants re-run.
 */
export function renderTollPlates(container, plan, options = {}) {
  if (!isTollPlan(plan)) {
    throw new TollRenderError(
      'the toll plates were handed something that is not a plan planTollPlates() minted. The seven ' +
      'era records never reach this file; what arrives is marks, pixels and strings. An era ' +
      'machine plan is refused here too: the seal names its planner, and these are two planners.',
      plan && typeof plan === 'object' ? Object.keys(plan) : plan,
    );
  }
  openTollPlan(plan, options.context || 'the seven toll plates');

  container.textContent = '';
  const root = h('div', {
    class: 'p2-toll', role: 'region', 'aria-label': plan.finding.sentence,
  }, container);

  const lede = h('div', { class: 'p2-toll-lede' }, root);
  h('p', { class: 'p2-prose p2-toll-ruler', text: plan.rulerNote }, lede);

  const strip = h('div', { class: 'p2-toll-strip' }, root);
  for (const plate of plan.plates) drawPlate(strip, plate);

  const finding = h('div', { class: 'p2-note-box p2-toll-finding' }, root);
  h('div', { class: 'p2-arch', text: 'what the seven plates say together' }, finding);
  h('p', { class: 'p2-prose', text: plan.finding.sentence }, finding);

  drawLegend(root);
  drawRegister(root, plan.verdictStamps);

  return {
    root,
    plateCount: plan.plates.length,
    /** Every string this page put in front of a reader, read off the page. */
    sentences: () => domSentences(root),
    element: root,
  };
}

/**
 * Every string a rendered page puts in front of a reader.
 *
 * Leaves only, plus every SVG `<title>` and every `aria-label`, in document
 * order and de-duplicated.
 *
 * WHY THIS WALK IS HERE AND NOT IMPORTED. `../auction/bench.js` exports the
 * same walk, and this team's import list is `lib`, `charts` and `eras`. Pulling
 * the auction bench in to borrow eighteen lines would load the engine, the ten
 * scenarios and the band onto a page that has none of them. What is duplicated
 * is a tree traversal, not a decision and not a number: the decision — what
 * counts as a reader-facing surface — is the same one, written the same way,
 * and the lint both walks feed is the single copy in `guards.js`.
 */
export function domSentences(root) {
  const out = [];
  const seen = new Set();
  const push = (value) => {
    const s = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    if (!s || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };
  const walk = (node) => {
    if (!node) return;
    if (node.nodeType === 3) { push(node.nodeValue); return; }
    if (node.nodeType !== 1) return;
    const name = (node.tagName || '').toLowerCase();
    if (name === 'title') { push(node.textContent); return; }
    const label = node.getAttribute && node.getAttribute('aria-label');
    if (label) push(label);
    for (const child of Array.from(node.childNodes)) walk(child);
  };
  walk(root);
  return out;
}

export default { renderTollPlates, domSentences, assertTollColourBudget };
