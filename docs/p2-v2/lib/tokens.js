/*
 * P2 — The Attention Economy · design tokens
 * Direction: "The Bench" (p2-ad-market/design/DESIGN.md, locked 2026-07-31)
 *
 * This module is the single source of truth for colour, type and structure.
 * `tokens.css` mirrors it for the cascade; `verifyTokenParity()` throws if the
 * two ever drift. Nothing in the P2 build may write a hex literal of its own.
 *
 * Light mode only, inherited from P1. There is no dark theme and no theme switch.
 *
 * WHY THIS IS JAVASCRIPT AND NOT ONLY CSS
 * ---------------------------------------
 * The chart layer builds SVG with `document.createElementNS` and then sets
 * `fill` / `stroke` as *attributes*. SVG presentation attributes do not accept
 * `var(--token)` — `el.setAttribute('fill', 'var(--brass)')` silently paints
 * nothing. Every generated mark therefore needs a literal string, and that
 * string has to come from somewhere that can be imported, tested and guarded.
 * The parts that genuinely belong to the cascade — keyframes, @font-face,
 * the media query, the paper grid — live in `tokens.css`. See README.
 *
 * ES module, no build step, no dependencies, no network.
 */

/* ------------------------------------------------------------------ *
 * 0. Colour science — small, exact, and used by the guards below.
 * ------------------------------------------------------------------ */

/** '#RRGGBB' -> [r,g,b] in 0..255. Throws on anything else, deliberately. */
export function parseHex(hex) {
  if (typeof hex !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(hex)) {
    throw new TypeError(`tokens: expected a #RRGGBB hex string, got ${JSON.stringify(hex)}`);
  }
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

const toHex = (rgb) =>
  '#' + rgb.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0').toUpperCase()).join('');

const srgbToLinear = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const linearToSrgb = (c) => {
  const v = Math.max(0, Math.min(1, c));
  return (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255;
};

/** WCAG 2.x relative luminance. */
export function relativeLuminance(hex) {
  const [r, g, b] = parseHex(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1..21. Order of arguments does not matter. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/* --- CIELAB + CIEDE2000, so a builder can test a pairing it invents --- */

function hexToLab(hex) {
  const [r, g, b] = parseHex(hex).map(srgbToLinear);
  const X = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
  const Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const Z = 0.0193339 * r + 0.119192 * g + 0.9503041 * b;
  const f = (t) => (t > 0.008856451679035631 ? Math.cbrt(t) : t / 0.12841854934601665 + 4 / 29);
  const fx = f(X / 0.95047), fy = f(Y / 1.0), fz = f(Z / 1.08883);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** CIEDE2000 perceptual difference. ~1 = just noticeable on adjacent patches. */
export function deltaE2000(hexA, hexB) {
  const [L1, a1, b1] = hexToLab(hexA);
  const [L2, a2, b2] = hexToLab(hexB);
  const rad = Math.PI / 180, deg = 180 / Math.PI;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
  const Cb7 = Math.pow(Cb, 7);
  const G = 0.5 * (1 - Math.sqrt(Cb7 / (Cb7 + 6103515625)));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h1p = C1p === 0 ? 0 : (Math.atan2(b1, a1p) * deg + 360) % 360;
  const h2p = C2p === 0 ? 0 : (Math.atan2(b2, a2p) * deg + 360) % 360;
  const dLp = L2 - L1, dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp * rad) / 2);
  const Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
  let hbp;
  if (C1p * C2p === 0) hbp = h1p + h2p;
  else if (Math.abs(h1p - h2p) <= 180) hbp = (h1p + h2p) / 2;
  else hbp = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
  const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad)
    + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.2 * Math.cos((4 * hbp - 63) * rad);
  const dTh = 30 * Math.exp(-Math.pow((hbp - 275) / 25, 2));
  const Cbp7 = Math.pow(Cbp, 7);
  const Rc = 2 * Math.sqrt(Cbp7 / (Cbp7 + 6103515625));
  const Sl = 1 + (0.015 * Math.pow(Lbp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbp - 50, 2));
  const Sc = 1 + 0.045 * Cbp;
  const Sh = 1 + 0.015 * Cbp * T;
  const Rt = -Math.sin(2 * dTh * rad) * Rc;
  return Math.sqrt(
    Math.pow(dLp / Sl, 2) + Math.pow(dCp / Sc, 2) + Math.pow(dHp / Sh, 2) + Rt * (dCp / Sc) * (dHp / Sh)
  );
}

/* --- Dichromacy simulation.
 *
 * Two independent models, because on this palette they disagree and the
 * disagreement matters. Machado, Oliveira & Fernandes (2009) is the modern
 * default. Viénot, Brettel & Mollon (1999) is the older LMS-space method and
 * is more pessimistic here; its tritan branch is explicitly an approximation
 * in the original paper.
 *
 * On Brass against Rust the two models return ΔE 14.9 and ΔE 7.8 for the same
 * tritanope. A guard that trusted only the friendlier model would wave through
 * the one pair this project cannot afford to have wrong. So `worstCaseSeparation`
 * takes the worst across both, and the guard is conservative by construction.
 */
const MACHADO = Object.freeze({
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
});
/* Smith–Pokorny LMS, as used by Viénot et al. 1999. */
const RGB2LMS = [[17.8824, 43.5161, 4.11935], [3.45565, 27.1554, 3.86714], [0.0299566, 0.184309, 1.46709]];
const LMS2RGB = [[0.080944, -0.130504, 0.116721], [-0.010248, 0.054019, -0.113614], [-0.000365, -0.004122, 0.693513]];
const VIENOT = Object.freeze({
  protanopia: [[0, 2.02344, -2.52581], [0, 1, 0], [0, 0, 1]],
  deuteranopia: [[1, 0, 0], [0.494207, 0, 1.24827], [0, 0, 1]],
  tritanopia: [[1, 0, 0], [0, 1, 0], [-0.395913, 0.801109, 0]],
});

export const CVD_KINDS = Object.freeze(['protanopia', 'deuteranopia', 'tritanopia']);
export const CVD_MODELS = Object.freeze(['machado', 'vienot']);

const mul = (M, v) => M.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);

/**
 * Simulate a hex under one of the three dichromacies, at full severity.
 * @param {'protanopia'|'deuteranopia'|'tritanopia'} kind
 * @param {{model?: 'machado'|'vienot'}} opts
 */
export function simulateCVD(hex, kind, { model = 'machado' } = {}) {
  if (!CVD_KINDS.includes(kind)) throw new RangeError(`tokens: unknown vision "${kind}". Use one of ${CVD_KINDS.join(', ')}.`);
  if (!CVD_MODELS.includes(model)) throw new RangeError(`tokens: unknown model "${model}". Use one of ${CVD_MODELS.join(', ')}.`);
  const lin = parseHex(hex).map(srgbToLinear);
  if (model === 'machado') return toHex(mul(MACHADO[kind], lin).map(linearToSrgb));
  return toHex(mul(LMS2RGB, mul(VIENOT[kind], mul(RGB2LMS, lin))).map(linearToSrgb));
}

/**
 * Worst-case CIEDE2000 between two colours across normal vision and all three
 * dichromacies, under both models. This is the number the chart layer must
 * test any new pairing on.
 */
export function worstCaseSeparation(hexA, hexB) {
  const rows = [{ vision: 'normal', model: '—', a: hexA, b: hexB, deltaE: deltaE2000(hexA, hexB) }];
  for (const kind of CVD_KINDS) {
    for (const model of CVD_MODELS) {
      const a = simulateCVD(hexA, kind, { model });
      const b = simulateCVD(hexB, kind, { model });
      rows.push({ vision: kind, model, a, b, deltaE: deltaE2000(a, b) });
    }
  }
  const worst = rows.reduce((m, r) => (r.deltaE < m.deltaE ? r : m));
  return { rows, worst: worst.deltaE, worstVision: worst.vision, worstModel: worst.model };
}

/**
 * Threshold below which two colours must not be the only difference between
 * two series. 11 is the conventional "clearly different at a glance, at chart
 * mark size, under any dichromacy" figure. It is not a legal standard; it is a
 * line this project draws so the argument does not rest on hue.
 */
export const SEPARATION_FLOOR = 11;

/**
 * Above the floor but below this, a pair is *tight*: it works, but not with
 * enough headroom to survive a 1px line, a 6px particle, or a printer. Pairs
 * in this band are allowed and are flagged, so a reviewer can see them.
 */
export const SEPARATION_COMFORT = 20;

/* ------------------------------------------------------------------ *
 * 1. Palette
 * ------------------------------------------------------------------ */

/**
 * Every colour in P2, with the role it carries and the role it must never
 * carry. `hex` is the drawing value. `textHex` is what you use when the same
 * meaning has to appear as *text*; where it differs from `hex` the raw value
 * fails WCAG AA at body size and must not touch a glyph.
 *
 * Contrast figures are against Bone #F2EEE4 and are measured, not asserted —
 * `auditPalette()` recomputes every one of them at runtime.
 */
export const PALETTE = Object.freeze({
  bone: Object.freeze({
    token: '--p2-bone', hex: '#F2EEE4', textHex: null,
    role: 'Ground. Engineering paper. Carries a 22px grid at 4.5% graphite.',
    never: 'Never a mark. Never a fill inside a drawing — knock-outs use --p2-paper.',
    onBone: 1.0, textSafe: false,
  }),
  graphite: Object.freeze({
    token: '--p2-graphite', hex: '#15181D', textHex: '#15181D',
    role: 'All prose, all headings, all primary rule lines.',
    never: 'Never a data series. Graphite is the page speaking, not the record.',
    onBone: 15.36, textSafe: true,
  }),
  zinc: Object.freeze({
    token: '--p2-zinc-rule', hex: '#838A93', textHex: '#646B74',
    role: 'RULE ONLY. Axes, gridlines, tick marks, hairline separators.',
    never: 'NEVER text. 3.01:1 on Bone fails AA at every size. Use --p2-zinc-text.',
    onBone: 3.01, textSafe: false,
  }),
  brass: Object.freeze({
    token: '--p2-brass', hex: '#B07A2C', textHex: '#8A5F20',
    role: 'MONEY. The advertiser\'s dollar. Every particle, every spend series.',
    never: 'Never the take (that is Rust) and never a count (that is Cyan).',
    onBone: 3.2, textSafe: false,
  }),
  cyan: Object.freeze({
    token: '--p2-cyan', hex: '#3AA6BD', textHex: '#1F6E80',
    role: 'THE COUNT. Any measure of audience: circulation, ratings, impressions, clicks, queries.',
    never: 'Never money. Re-roled from P1, where this hex meant COST.',
    onBone: 2.46, textSafe: false,
  }),
  iron: Object.freeze({
    token: '--p2-iron', hex: '#5B6570', textHex: '#5B6570',
    role: 'MECHANISM. Bench structure, rails, slot frames, calipers, organ outlines.',
    never: 'Never a value. Iron is the apparatus, never the reading it produces.',
    onBone: 5.12, textSafe: true,
  }),
  rust: Object.freeze({
    token: '--p2-rust', hex: '#A8442E', textHex: '#A8442E',
    role: 'THE TAKE. The intermediary\'s cut and the front-door rent. Nothing else.',
    never: 'Never a warning, never an error, never "bad". It is a share of the money.',
    onBone: 5.13, textSafe: true,
  }),
  stipple: Object.freeze({
    token: '--p2-stipple', hex: '#C9C2B4', textHex: null,
    role: 'DOCUMENTED ABSENCE. A 2px stipple texture inside a named, framed block.',
    never: 'NEVER a fill, never text, never a series, never whitespace standing in for it.',
    onBone: 1.53, textSafe: false,
  }),
});

/* Flat exports. Import these; do not retype the hexes. */
export const BONE = PALETTE.bone.hex;            // #F2EEE4
export const GRAPHITE = PALETTE.graphite.hex;    // #15181D
export const ZINC_RULE = PALETTE.zinc.hex;       // #838A93  lines only
export const ZINC_TEXT = PALETTE.zinc.textHex;   // #646B74  glyphs only
export const BRASS = PALETTE.brass.hex;          // #B07A2C  marks
export const BRASS_TEXT = PALETTE.brass.textHex; // #8A5F20  glyphs
export const CYAN = PALETTE.cyan.hex;            // #3AA6BD  marks
export const CYAN_TEXT = PALETTE.cyan.textHex;   // #1F6E80  glyphs
export const IRON = PALETTE.iron.hex;            // #5B6570  both
export const RUST = PALETTE.rust.hex;            // #A8442E  both
export const STIPPLE = PALETTE.stipple.hex;      // #C9C2B4  texture only

/** Composited graphite steps, for prose that must recede without changing hue. */
export const INK = Object.freeze({
  primary: '#15181D',   // graphite            15.36:1
  secondary: '#343639', // graphite @ 86%      10.46:1
  tertiary: '#414345',  // graphite @ 80%       8.58:1
  quiet: '#535455',     // graphite @ 72%       6.55:1  — floor for body prose
});

/** Non-colour surfaces. Bone is the paper; paper is a knock-out on top of it. */
export const SURFACE = Object.freeze({
  ground: '#F2EEE4',
  paper: 'rgba(255,255,255,0.42)',   // board interiors, so a drawing lifts off the grid
  gridLine: 'rgba(21,24,29,0.045)',  // 22px engineering grid, ~4% ink
  ruleStrong: '#5B6570',             // iron, a real boundary
  ruleFaint: 'rgba(91,101,112,0.28)',// section separators — decorative only, 1.45:1
  focusRing: '#15181D',              // graphite, 2px, offset 2px — 15.36:1 on Bone
});

/* ------------------------------------------------------------------ *
 * 2. Colour guards
 * ------------------------------------------------------------------ */

/** WCAG 2.x AA, body size. The number the text guard is measuring against. */
export const AA_TEXT = 4.5;
/** WCAG 2.x 1.4.11, non-text contrast. The number the object guard measures against. */
export const AA_OBJECT = 3;

const TEXT_SAFE = Object.freeze(new Set([
  ...Object.values(INK), ZINC_TEXT, BRASS_TEXT, CYAN_TEXT, IRON, RUST, GRAPHITE,
].map((h) => h.toUpperCase())));

/** The text allowlist, as hexes, for error messages and for tests. */
export const TEXT_COLORS = Object.freeze([...TEXT_SAFE]);

/**
 * Guard: use before painting any glyph. Throws on Zinc, raw Brass, raw Cyan,
 * Stipple and Bone — the five values that fail WCAG AA on this ground — and on
 * any colour outside the palette, because the palette is closed.
 *
 * The pair of tokens for one meaning is the accident this prevents:
 * `--p2-zinc-rule` and `--p2-zinc-text` look interchangeable in an editor and
 * are not. The names are long on purpose and this throw is the backstop.
 *
 * TWO REJECTIONS, TWO MESSAGES. A colour can be refused here for either of two
 * unrelated reasons, and the message must name the one that actually applies.
 * #4A4A4A measures 7.65:1 on Bone — it clears AA comfortably — and it is still
 * refused, because it is not a P2 token. Telling that caller "AA needs 4.5:1"
 * sends them to fix a contrast problem they do not have, and they will "fix" it
 * by darkening a grey that was already fine and inventing a second ink. An
 * error that misstates why is worse than no error.
 */
export function assertTextColor(hex, where = 'text') {
  const up = String(hex).toUpperCase();
  if (TEXT_SAFE.has(up)) return hex;
  const ratio = contrastRatio(hex, BONE); // also rejects anything that is not #RRGGBB
  const entry = Object.values(PALETTE).find((p) => p.hex.toUpperCase() === up);
  const textToken = entry ? (entry.token.endsWith('-rule') ? entry.token.replace(/-rule$/, '-text') : `${entry.token}-text`) : null;
  const fix = entry && entry.textHex ? ` Use ${entry.textHex} (${textToken}) instead.`
    : entry ? ` ${entry.never}` : '';

  if (ratio >= AA_TEXT) {
    throw new Error(
      `tokens: ${hex} is not a P2 text colour — used at ${where}. ` +
      `Contrast is NOT the problem: it measures ${ratio.toFixed(2)}:1 on Bone and clears AA (${AA_TEXT}:1). ` +
      `The palette is closed, and a one-off ink that happens to pass is still a second source of truth ` +
      `for "the colour prose is". Use one of: ${TEXT_COLORS.join(', ')}.${fix}`
    );
  }
  throw new Error(
    `tokens: ${hex} fails contrast as text — used at ${where}. ` +
    `It measures ${ratio.toFixed(2)}:1 on Bone and AA needs ${AA_TEXT}:1 at body size.${fix}`
  );
}

/**
 * Guard: use before painting any non-text graphical object that must be
 * *perceivable on its own* — a lone line, a bare mark, a control boundary.
 * WCAG 1.4.11 wants 3:1. Cyan is 2.46:1 and does not clear it, which is why
 * every cyan fill in this project carries an Iron stroke.
 */
export function assertObjectColor(hex, where = 'object') {
  const ratio = contrastRatio(hex, BONE);
  if (ratio >= AA_OBJECT) return hex;
  throw new Error(
    `tokens: ${hex} is ${ratio.toFixed(2)}:1 on Bone and cannot stand alone as a graphical object at ${where}. ` +
    `Give it a ${IRON} (Iron) stroke of at least 1px, or use a token that clears 3:1.`
  );
}

/**
 * The five second channels this project recognises. The list is closed. A
 * channel that is not one of these is not a redundancy, it is a promise, and
 * the whole point of the escape hatch is that it names something a reader can
 * actually see.
 */
export const REDUNDANT_CHANNELS = Object.freeze(['dash', 'hatch', 'position', 'weight', 'label']);

/**
 * How each channel shows up in a REDUNDANT_CODING description. This is what
 * lets the guard cross-check a *declared* channel against what the record says
 * the drawing actually does, instead of taking the caller's word for it.
 */
const CHANNEL_EVIDENCE = Object.freeze({
  dash: /\bdash(?:ed|es|ing)?\b|\bdotted\b/i,
  hatch: /\bhatch(?:ed|ing)?\b|\bstipple[ds]?\b|\btexture[ds]?\b/i,
  position: /\bposition(?:ed|al)?\b|\bslot\b|\blane\b|\boffset\b/i,
  weight: /\bweight\b|\b\d+(?:\.\d+)?px\b/i,
  label: /\blabel(?:led|s)?\b|\bprinted name\b|\bname[ds]?\b/i,
});

/** Which of the five channels the record says this hex already carries. */
function declaredChannels(hex) {
  const entry = Object.values(REDUNDANT_CODING).find((c) => c.hex.toUpperCase() === String(hex).toUpperCase());
  if (!entry) return null; // not a series role; nothing to cross-check against
  return REDUNDANT_CHANNELS.filter((ch) => CHANNEL_EVIDENCE[ch].test(entry.channel));
}

/**
 * Normalise and validate the escape hatch. Accepts one channel or several
 * ('45° hatch plus a printed label' is two channels, not one free-form string).
 * Throws on anything that is not in REDUNDANT_CHANNELS — including `true`,
 * 'vibes' and 'colour', all three of which the previous version accepted
 * because it only tested the value for truthiness. An escape hatch that takes
 * any truthy value is not an escape hatch, it is an off switch.
 */
function normaliseRedundant(value, hexA, hexB) {
  if (value === undefined || value === null || value === false) return null;
  const list = Array.isArray(value) ? value : [value];
  const bad = list.filter((v) => typeof v !== 'string' || !REDUNDANT_CHANNELS.includes(v.trim().toLowerCase()));
  if (bad.length || list.length === 0) {
    throw new RangeError(
      `tokens: { redundant: ${JSON.stringify(value)} } is not a channel this project draws. ` +
      `Declaring a redundancy is a claim about the mark on the page, so it has to name one of the ` +
      `five things a reader can see without hue: ${REDUNDANT_CHANNELS.join(', ')}. ` +
      `Pass one, or an array of them — e.g. { redundant: ['hatch', 'label'] } for ${hexA}/${hexB}. ` +
      `"colour" is not on the list on purpose: it is the channel that just failed.`
    );
  }
  return [...new Set(list.map((v) => v.trim().toLowerCase()))];
}

/**
 * Guard: two data series must not differ by hue alone unless they stay above
 * SEPARATION_FLOOR under all three dichromacies.
 *
 * Pass `{ redundant: 'hatch' }` — or an array, e.g. `['hatch', 'label']` — to
 * declare the second channel and downgrade the throw to a returned warning.
 * The declaration is checked twice: the channel name must be one of
 * REDUNDANT_CHANNELS, and, when both colours are series roles in
 * REDUNDANT_CODING, at least one of them must actually be recorded as carrying
 * that channel. A caller cannot talk a pair past this guard by naming a
 * redundancy the drawing does not have.
 *
 * Returns `{ ...worstCaseSeparation, tight, redundant, crossCheck, warning? }`.
 * `crossCheck` is 'confirmed', 'unverifiable' (the colours are not series
 * roles, so the record has nothing to check against) or 'n/a' (none declared).
 */
export function assertDistinguishable(hexA, hexB, opts = {}) {
  const redundant = normaliseRedundant(opts.redundant, hexA, hexB);
  const result = worstCaseSeparation(hexA, hexB);
  const tight = result.worst < SEPARATION_COMFORT;

  let crossCheck = 'n/a';
  if (redundant) {
    const inA = declaredChannels(hexA);
    const inB = declaredChannels(hexB);
    if (inA === null && inB === null) {
      crossCheck = 'unverifiable';
    } else {
      const have = new Set([...(inA || []), ...(inB || [])]);
      const unbacked = redundant.filter((ch) => !have.has(ch));
      if (unbacked.length === redundant.length) {
        throw new Error(
          `tokens: ${hexA}/${hexB} were declared to separate by "${redundant.join(' + ')}", but the record ` +
          `does not say either colour is drawn that way. REDUNDANT_CODING gives ` +
          `${hexA} → ${inA ? (inA.join(', ') || 'no channel from the closed list') : 'not a series role'}; ` +
          `${hexB} → ${inB ? (inB.join(', ') || 'no channel from the closed list') : 'not a series role'}. ` +
          `Either draw the channel you declared and add it to REDUNDANT_CODING, or declare the one that is ` +
          `really there. A redundancy that exists only in the argument list is not a redundancy.`
        );
      }
      crossCheck = 'confirmed';
    }
  }

  if (result.worst >= SEPARATION_FLOOR) {
    return { ...result, tight, redundant, crossCheck };
  }
  if (redundant) {
    return {
      ...result, tight: true, redundant, crossCheck,
      warning: `${hexA}/${hexB} separate by only ΔE ${result.worst.toFixed(1)} under ${result.worstVision} ` +
        `(${result.worstModel}); the difference is carried by "${redundant.join(' + ')}", not by hue.`,
    };
  }
  throw new Error(
    `tokens: ${hexA} and ${hexB} collapse to ΔE2000 ${result.worst.toFixed(1)} under ${result.worstVision} ` +
    `(${result.worstModel} model, floor ${SEPARATION_FLOOR}). Hue alone cannot carry this pair. ` +
    `Add a second channel and re-call with { redundant: '${REDUNDANT_CHANNELS.join("' | '")}' }.`
  );
}

/** Every hue pair in the palette, worst-case, sorted tightest first. */
export function auditSeparation() {
  const keys = ['zinc', 'brass', 'cyan', 'iron', 'rust', 'stipple'];
  const rows = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = PALETTE[keys[i]], b = PALETTE[keys[j]];
      const r = worstCaseSeparation(a.hex, b.hex);
      rows.push({
        pair: `${keys[i]}/${keys[j]}`, a: a.hex, b: b.hex,
        normal: +deltaE2000(a.hex, b.hex).toFixed(2),
        worst: +r.worst.toFixed(2), worstVision: r.worstVision, worstModel: r.worstModel,
        verdict: r.worst < SEPARATION_FLOOR ? 'HUE ALONE FAILS' : r.worst < SEPARATION_COMFORT ? 'tight' : 'clear',
        redundantChannel: (Object.values(REDUNDANT_CODING).find((c) => c.hex === a.hex) || {}).channel || null,
      });
    }
  }
  return rows.sort((x, y) => x.worst - y.worst);
}

/**
 * The channel each series role carries *in addition to* hue. This project
 * never relies on hue alone; these are the redundancies that make that true.
 * Enforced socially here and in code by the guards module.
 */
export const REDUNDANT_CODING = Object.freeze({
  money: { hex: BRASS, channel: 'solid fill, filled round particle', why: 'Money is the only filled round mark.' },
  count: { hex: CYAN, channel: 'open mark with an Iron stroke, square terminal', why: 'Cyan is 2.46:1 on Bone; the Iron stroke is required for perceivability and doubles as the shape cue.' },
  take: { hex: RUST, channel: '45° hatch, always, plus a printed label', why: 'Rust sits ΔE 12.5 from Brass under deuteranopia and 7.8 under tritanopia. Hatch is not decoration; it is the separation.' },
  mechanism: { hex: IRON, channel: '1.5px stroke weight vs Zinc\'s 1px', why: 'Iron and Zinc are both neutral greys, ΔE 14.8. Weight separates them, not colour.' },
  absence: { hex: STIPPLE, channel: '2px stipple in a framed block with a printed name', why: 'Absence is a positive object. Rule 5.' },
  axis: { hex: ZINC_RULE, channel: '1px, dashed where indicative', why: 'Zinc sits ΔE 10.7 from Cyan under protanopia. A cyan series crossing a zinc gridline separates by weight and continuity, not hue.' },
});

/** Recompute every contrast figure in PALETTE. Returns rows; throws on drift. */
export function auditPalette() {
  const rows = [];
  for (const [name, p] of Object.entries(PALETTE)) {
    const measured = contrastRatio(p.hex, BONE);
    if (Math.abs(measured - p.onBone) > 0.02) {
      throw new Error(`tokens: ${name} claims ${p.onBone}:1 on Bone but measures ${measured.toFixed(2)}:1.`);
    }
    rows.push({
      name, token: p.token, hex: p.hex, textHex: p.textHex,
      onBone: +measured.toFixed(2),
      textOnBone: p.textHex ? +contrastRatio(p.textHex, BONE).toFixed(2) : null,
      passesAAText: p.textHex ? contrastRatio(p.textHex, BONE) >= 4.5 : false,
      passesObject: measured >= 3,
      role: p.role, never: p.never,
    });
  }
  return rows;
}

/* ------------------------------------------------------------------ *
 * 3. Type — four faces, one job each, and the jobs never overlap.
 * ------------------------------------------------------------------ */

/**
 * Font stacks. The real face is named first; everything after it is a fallback
 * chosen for metric proximity, not for looks. `tokens.css` additionally
 * declares metric-overridden @font-face aliases so the fallback occupies the
 * same box as the real face and the page does not reflow when the webfont
 * lands. See FONT_SHIP_SPEC for what has to be measured before ship.
 */
export const FONT = Object.freeze({
  /** Every numeral and every readout. TABULAR figures are non-negotiable. */
  numeral: `'Martian Mono', 'Martian Mono Fallback', ui-monospace, 'SF Mono', 'Cascadia Mono', 'Roboto Mono', Menlo, Consolas, monospace`,
  /** Body prose only. The warm serif that stops a page of iron reading hostile. */
  prose: `'Newsreader', 'Newsreader Fallback', 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, 'Times New Roman', serif`,
  /** Data chrome: tooltips, interval values, grade marks, source ids. */
  chrome: `'IBM Plex Mono', 'IBM Plex Mono Fallback', ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace`,
  /** Organ labels and machine annotations. Structure, never a value. */
  label: `'Instrument Sans', 'Instrument Sans Fallback', 'Inter Tight', Inter, 'Helvetica Neue', Helvetica, 'Segoe UI', system-ui, Arial, sans-serif`,
});

/**
 * The four roles, fully specified. A builder sets a role, not a font.
 * `class` is the matching class in tokens.css; use whichever is convenient.
 */
export const TYPE_ROLE = Object.freeze({
  numeral: Object.freeze({
    class: 'p2-num', family: FONT.numeral, weight: 600, size: '15px', lineHeight: 1.2,
    tracking: '0.02em', transform: 'none', color: INK.primary,
    features: { 'font-variant-numeric': 'tabular-nums', 'font-feature-settings': '"tnum" 1, "ss01" 0' },
    use: 'Every numeral on the page. Readouts, years, intervals, counts, grade tallies.',
    never: 'Never prose. Never a label. If it is not a number, it is not this role.',
  }),
  prose: Object.freeze({
    class: 'p2-prose', family: FONT.prose, weight: 400, size: '19px', lineHeight: 1.65,
    tracking: '0', transform: 'none', color: INK.primary, measure: '62ch',
    features: {},
    use: 'Body prose, ledes, captions that are sentences.',
    never: 'Never a numeral inside a readout — wrap those in .p2-num so they stay tabular.',
  }),
  chrome: Object.freeze({
    class: 'p2-chrome', family: FONT.chrome, weight: 400, size: '12px', lineHeight: 1.5,
    tracking: '0.01em', transform: 'none', color: ZINC_TEXT,
    features: { 'font-variant-numeric': 'tabular-nums' },
    use: 'Tooltips, 80% interval strings, A/B/C grades, claim ids, source lines, arithmetic panels.',
    never: 'Never a headline readout — that is the numeral role, at 600 weight and larger.',
  }),
  label: Object.freeze({
    class: 'p2-arch', family: FONT.label, weight: 600, size: '11px', lineHeight: 1.4,
    tracking: '0.08em', transform: 'uppercase', color: ZINC_TEXT,
    features: {},
    use: 'The eight organ names, knob labels, panel titles, section tags.',
    never: 'Never a value. If a label can be mistaken for a reading, the bench grammar fails.',
  }),
});

/** The eight organs, in fixed left-to-right order. Same positions in all seven eras. */
export const ORGANS = Object.freeze(['INLET', 'GATE', 'METER', 'RULE', 'SORTER', 'TOLL', 'DOOR', 'OUTLET']);

/**
 * What the ship-time font step must do. This is not advice; it is the
 * acceptance list for the build script that replaces the system fallbacks.
 */
export const FONT_SHIP_SPEC = Object.freeze({
  faces: [
    { family: 'Martian Mono', source: 'Evil Martian, OFL', axes: 'wght 100..800, wdth 75..112.5', ship: 'variable woff2, wght 400..700 instanced, wdth pinned to 100', role: 'numeral' },
    { family: 'Newsreader', source: 'Production Type, OFL', axes: 'opsz 6..72, wght 200..800, + italic', ship: 'variable woff2, wght 400..600, opsz 16..24; italic as a second file, loaded lazily', role: 'prose' },
    { family: 'IBM Plex Mono', source: 'IBM, OFL', axes: 'static', ship: 'two static woff2 files, 400 and 600', role: 'chrome' },
    { family: 'Instrument Sans', source: 'Rodrigo Fuenzalida & Jordan Egstad, OFL', axes: 'wght 400..700, wdth 75..100', ship: 'variable woff2, wght 500..700, wdth pinned to 100', role: 'label' },
  ],
  subset: {
    unicodeRange: 'U+0020-007E, U+00A0, U+00A9, U+00B0, U+00B7, U+2010-2014, U+2018-201D, U+2020-2022, U+2026, U+2030, U+2032-2033, U+203A, U+2044, U+20AC, U+2192, U+2193, U+2212, U+2248, U+2264-2265, U+25B8, U+25BC, U+2713',
    note: 'Latin-1 core plus the marks this project actually prints: en/em dash, prime and double prime, per-mille, minus, approx, ≤ ≥, ▸ ▼, ✓, middot, degree.',
    LOAD_BEARING: [
      'pyftsubset MUST be called with --layout-features="+tnum,+kern,+liga,+calt" on Martian Mono and IBM Plex Mono. The default subsetter feature set DROPS tnum. If tnum is dropped, font-variant-numeric:tabular-nums silently does nothing, the digits go proportional, and every readout physically jitters during a drag — which is the exact failure the numeral role exists to prevent. Verify after subsetting by rendering "0000000000" and "1111111111" and comparing measured widths; they must be equal to the pixel.',
      'Keep --flavor=woff2 and --desubroutinize off for variable fonts; desubroutinizing a VF inflates it.',
      'Do not subset away U+2212 (minus). A hyphen in a negative readout is a different width and breaks the tabular column.',
    ],
  },
  preload: [
    '<link rel="preload" as="font" type="font/woff2" href="fonts/martian-mono-subset.woff2" crossorigin>',
    '<link rel="preload" as="font" type="font/woff2" href="fonts/newsreader-subset.woff2" crossorigin>',
    '<link rel="preload" as="font" type="font/woff2" href="fonts/plex-mono-400-subset.woff2" crossorigin>',
    '<link rel="preload" as="font" type="font/woff2" href="fonts/instrument-sans-subset.woff2" crossorigin>',
  ],
  display: 'font-display: swap on prose and chrome; font-display: block (with a 200ms block period) on the numeral face, because a readout that reflows mid-drag is worse than a readout that arrives 200ms late.',
  metricOverrides: {
    how: 'For each face, measure ascent, descent, lineGap and the advance of "0" in the real face and in its fallback, then declare a @font-face alias named "<Family> Fallback" with src: local(<fallback>) and ascent-override / descent-override / line-gap-override / size-adjust set so the two boxes match. tokens.css carries these blocks with the numbers marked MEASURE-AT-SHIP.',
    why: 'Static hosting, no webfont service, and the whole page is line-work aligned to a 22px grid. A 3% metric mismatch on the numeral face moves every readout off the grid for the length of the swap.',
    tool: 'https://github.com/seek-oss/capsize or a 20-line canvas measureText probe; either is fine, the numbers are what matter.',
  },
  hosting: 'Self-hosted under docs/p2/fonts/. No Google Fonts, no CDN, no external request of any kind. The page must render identically with the network cable pulled.',
});

/* ------------------------------------------------------------------ *
 * 4. Structure
 * ------------------------------------------------------------------ */

export const GRID = Object.freeze({
  unit: 22,                       // px. The engineering grid. Every vertical rhythm is a multiple.
  ink: 'rgba(21,24,29,0.045)',
  measure: '62ch',                // prose line length
  maxWidth: 1440,
  gutter: 'clamp(20px, 6vw, 96px)',
  minTouch: 44,                   // px. Every control's hit box.
  scrollMin: 940,                 // px. Minimum width of a wide drawing before it scrolls in place.
});

export const RULE_WIDTH = Object.freeze({
  hairline: 1,      // zinc, axes and gridlines
  mechanism: 1.5,   // iron, bench structure — the weight that separates Iron from Zinc
  emphasis: 2,      // graphite, a boundary the reader must not cross
});

/* ------------------------------------------------------------------ *
 * 5. Bridge to CSS
 * ------------------------------------------------------------------ */

/** Every custom property, flat. `tokens.css` declares exactly this set. */
export function cssVariables() {
  return {
    '--p2-bone': BONE,
    '--p2-paper': SURFACE.paper,
    '--p2-graphite': GRAPHITE,
    '--p2-ink-2': INK.secondary,
    '--p2-ink-3': INK.tertiary,
    '--p2-ink-4': INK.quiet,
    '--p2-zinc-rule': ZINC_RULE,
    '--p2-zinc-text': ZINC_TEXT,
    '--p2-brass': BRASS,
    '--p2-brass-text': BRASS_TEXT,
    '--p2-cyan': CYAN,
    '--p2-cyan-text': CYAN_TEXT,
    '--p2-iron': IRON,
    '--p2-rust': RUST,
    '--p2-stipple': STIPPLE,
    '--p2-grid-ink': GRID.ink,
    '--p2-rule-faint': SURFACE.ruleFaint,
    '--p2-focus': SURFACE.focusRing,
    '--p2-grid': `${GRID.unit}px`,
    '--p2-measure': GRID.measure,
    '--p2-gutter': GRID.gutter,
    '--p2-font-numeral': FONT.numeral,
    '--p2-font-prose': FONT.prose,
    '--p2-font-chrome': FONT.chrome,
    '--p2-font-label': FONT.label,
  };
}

/** Write the token set onto an element. Only needed if tokens.css is absent. */
export function injectTokens(root = document.documentElement) {
  for (const [k, v] of Object.entries(cssVariables())) root.style.setProperty(k, v);
  return root;
}

/**
 * Throw if tokens.css and tokens.js have drifted. Call it once from the demo
 * page and from the build's smoke test. Two sources of truth is a bug waiting
 * for 2am; this is the alarm on it.
 */
export function verifyTokenParity(root = document.documentElement) {
  const cs = getComputedStyle(root);
  const norm = (s) => String(s).trim().replace(/\s+/g, ' ').replace(/,\s+/g, ',').toLowerCase();
  const drift = [];
  for (const [k, v] of Object.entries(cssVariables())) {
    const got = cs.getPropertyValue(k);
    if (!got) { drift.push({ prop: k, css: '(missing)', js: v }); continue; }
    if (norm(got) !== norm(v)) drift.push({ prop: k, css: got.trim(), js: v });
  }
  if (drift.length) {
    throw new Error('tokens: tokens.css has drifted from tokens.js —\n' +
      drift.map((d) => `  ${d.prop}\n    css: ${d.css}\n    js : ${d.js}`).join('\n'));
  }
  return true;
}

export default {
  BONE, GRAPHITE, ZINC_RULE, ZINC_TEXT, BRASS, BRASS_TEXT, CYAN, CYAN_TEXT, IRON, RUST, STIPPLE,
  PALETTE, INK, SURFACE, FONT, TYPE_ROLE, ORGANS, GRID, RULE_WIDTH,
  REDUNDANT_CODING, REDUNDANT_CHANNELS, FONT_SHIP_SPEC, SEPARATION_FLOOR, SEPARATION_COMFORT,
  CVD_KINDS, CVD_MODELS, AA_TEXT, AA_OBJECT, TEXT_COLORS,
  contrastRatio, relativeLuminance, deltaE2000, simulateCVD, worstCaseSeparation,
  assertTextColor, assertObjectColor, assertDistinguishable, auditPalette, auditSeparation,
  cssVariables, injectTokens, verifyTokenParity,
};
