/**
 * docs/p2/charts/claim-marks.js — THE MARK, AND WHAT IT DOES NOT CARRY.
 *
 * ======================================================================
 * WHY THIS FILE EXISTS
 * ======================================================================
 * Six of the nine modules in this chart system routed every drawing decision
 * through ../lib/guards.js. The three that did not were all RENDER halves, and
 * they failed the same way: the guard was called in `plan()`, the answer was
 * computed and stored, and then the renderer drew from the raw record anyway.
 *
 *   value-chart.js  read `seg.kinds[i]` into a variable and never used it, then
 *                   drew a square at `p.calibration.central` — the one central
 *                   draw site that did not ask.
 *   small-multiples renderCrossSection called no interval guard at all. It drew
 *                   internet 2007 as a definite length labelled $10.5bn and
 *                   3.8%. The record says between $10.0bn and $22.3bn, a factor
 *                   of 2.2 — and the panel directly above it drew that same
 *                   point correctly, as a span. One page, two answers, same
 *                   question.
 *   gdp-strip.js    had no interval guard anywhere in its rendering half.
 *
 * THE FIX IS NOT MORE GUARD CALLS IN THE RENDERER. A renderer that must
 * remember to ask is a renderer that will forget, and this project has now
 * proved that three times: in the verifier at R3b, in the library at G4/G5, and
 * here. The repair that worked both earlier times was the same one:
 *
 *      MAKE THE WRONG THING UNSAYABLE, RATHER THAN DETECTED.
 *
 * So `plan()` asks the guards, and then REMOVES from the plan whatever the
 * renderer is forbidden to draw. A span-only mark carries `lo` and `hi` and NO
 * `central` — not a central the renderer is trusted to ignore, no central at
 * all. Reading it gives `undefined`, drawing at `undefined` produces a visible
 * failure, and printing it produces the string "undefined" in the middle of the
 * page. Every one of those is louder than a quiet lie.
 *
 * ======================================================================
 * WHAT A MARK IS
 * ======================================================================
 * One frozen object per drawn quantity:
 *
 *   { id, year, kind, lo, hi, ratio, grade, unit, verdict, central? }
 *
 *   kind      "point" or "span", decided by guards.markKindFor and by nothing
 *             in this file.
 *   lo, hi    the 80% interval, always present, in DRAWING units.
 *   central   PRESENT ONLY WHEN kind === "point". This is the whole point.
 *
 * The object is frozen at construction, so nothing downstream can put a central
 * back onto a span. Modules are strict by default, so the attempt throws.
 *
 * AND `extra` IS AN ALLOW LIST, NOT A BAN LIST. A mark may carry a short, closed
 * set of presentation fields — which compiler's run it belongs to, which medium
 * it is of, the claim's own sentence — and every value must be a primitive.
 * Anything else is refused, because `assertNoRecordOnPlan` skips minted marks by
 * design and a record field that reaches one is a record field nothing
 * downstream will ever find. See EXTRA_KEYS.
 *
 * THERE IS NO `layout` FIELD ANY MORE, AND ITS REMOVAL IS A REPAIR.
 *
 * There used to be one: a number for positioning only, the central where there
 * was one and the MIDPOINT OF THE INTERVAL where there was not, with a comment
 * saying it must never be printed. It was printed. `drawTotalPanel` in
 * small-multiples.js put `usd(first.layout)` into a figcaption and into the
 * svg's aria-label, so on any cut that made that year span-only the page said
 * "It rises from $2bn" about a mark the library refuses to give a central. A
 * midpoint is a central with better manners, and a comment saying "never print
 * this" is exactly the protection this project keeps proving does not hold.
 *
 * So the number is gone, and what replaced it cannot be printed as a reading:
 *
 *      anchorY(mark, scale)  ->  A PIXEL.
 *
 * A point mark anchors at `scale(central)`. A span-only mark anchors HALFWAY
 * DOWN ITS OWN DRAWN BAR — `(scale(lo) + scale(hi)) / 2` — which is a fact
 * about the drawing, in screen units, and not a value in the record's units at
 * all. There is no derived middle value anywhere on a mark for a caption to
 * reach, and `usd()`, `pct()` and `comma()` now refuse anything that is not a
 * measured finite number, so the old call site fails loudly instead of lying.
 *
 * ======================================================================
 * THE VERDICT RULE, IN ONE PLACE
 * ======================================================================
 * The two modules disagreed. value-chart.js threw on `verdict: "rejected"`.
 * gdp-strip.js drew ds-gdp-001 — which is rejected — as a first-class 1922
 * mark. Both were half right, and the record says why.
 *
 * Read ds-gdp-001 in claims.json. Its verdict is "rejected" and its BODY IS THE
 * CORRECTION: the statement, the central of 3.0, the interval [2.7, 3.2] and
 * the 1922 about_year are the verifier's own `replaced_by` text, applied in
 * place. The verdict field is a scar on the claim's history, not a description
 * of the sentence now in the file. A blanket refusal would have refused the
 * corrected finding this whole chapter is built on; a blanket permission would
 * let an unrepaired rejection onto a chart, which is what stage R3b cost four
 * hours.
 *
 * So the shared rule is neither:
 *
 *      EVERY VERDICT IS DRAWABLE, AND NO VERDICT IS INVISIBLE.
 *
 * A claim whose verdict is not the record's clean verdict may be drawn, and it
 * may only be drawn through `planClaimMark()`, which (a) puts the verdict on
 * the mark, (b) puts it in the mark's accessible name, and (c) refuses to build
 * the mark at all unless the caller passes a REGISTER — a list the module must
 * print where a reader can see it. A correction a reader cannot see on the
 * object is a correction that has not been made.
 *
 * ======================================================================
 * AND THE ESCAPE HATCH IS CLOSED
 * ======================================================================
 * `options.plan` was a documented public option on three render entry points,
 * and it skipped every guard in the module: the adversary used it to render a
 * rejected claim plotted at its `as_of` publication date, and to forge every
 * share in the small-multiple bank past the partition proof. A public option
 * that disables every invariant is not an option, it is the bypass.
 *
 * It is not deleted, because it has one real use — `render()` builds one plan
 * and hands it to two views, and re-planning would run the whole partition
 * proof twice. It is authenticated instead, on IDENTITY and then on CONTENT,
 * which is exactly the shape G5's declared-empty sentinel ended up with:
 *
 *   definePlanner({ name, revalidate })
 *                               hands back a PLANNER HANDLE. The planner module
 *                               keeps it in a module-private const and exports
 *                               its door, never the handle.
 *   planner.seal(plan, ctx)     mints. It DEEP-FREEZES the whole plan first,
 *                               then runs the same inspection re-entry runs, so
 *                               a plan that could not survive coming back in
 *                               never leaves the planner.
 *   planner.open(plan, ctx)     refuses a plan THIS PLANNER did not mint, then
 *                               re-inspects the LIVE plan — every container,
 *                               every mark, and the module's own invariants.
 *                               Every call. There is no "already validated"
 *                               cache, for the reason freezeGaps gives in
 *                               guards.js: a cache keyed on identity remembers
 *                               that an object was once valid.
 *
 * THE SEAL USED TO BE A FUNCTION ANYBODY COULD CALL, AND THAT IS THE HOLE THIS
 * ROUND CLOSED. `sealPlan(plan, { revalidate })` was a public export taking any
 * revalidator, so:
 *
 *     const forged = { ...realPlan, organs: withAMidpointTypedIntoHeadlineShort };
 *     sealPlan(forged, { revalidate() {} });     // a no-op revalidator
 *     renderEraMachine(host, forged);            // isSealedPlan said yes
 *
 * Every mark on that object was really minted, so the deep freeze, the generic
 * walk and `assertMarksHonest` all passed; the only thing that would have caught
 * the hand-typed figure was the era planner's OWN `revalidate`, and the caller
 * supplied a different one. `isSealedPlan` could not tell the two apart, because
 * the seal recorded no answer to WHO SEALED THIS.
 *
 * Now it does. A seal carries its planner handle, and a door only opens a plan
 * its own planner sealed. The handle is minted by `definePlanner` and is
 * recognised by membership of a module-private WeakSet — the same identity, not
 * a flag, that `NO_DOCUMENTED_GAPS` is recognised by, and which survived seven
 * forge routes across three rounds. `definePlanner` stays public because a
 * planner has to be definable; that buys an adversary nothing, because a handle
 * they define is not the handle `era-plan.js` holds, and `renderEraMachine`
 * asks for that one. There is no public `sealPlan` any more, and no unscoped
 * `openSealedPlan` to reach for instead.
 *
 * ======================================================================
 * A SHALLOW FREEZE IS NOT A FREEZE, AND A SEAL IS NOT A VALIDATION
 * ======================================================================
 * The seal used to be `Object.freeze(plan)`, which freezes the top level and
 * nothing under it. `plan.rails[i].segments[j].marks[k] = someOtherMark` was a
 * one-line edit on a sealed plan, and the door took it: the swapped-in
 * object was a mark this module really had minted, so it passed every per-mark
 * test, and the benchmark rail drew a central square reading 1,930 where the
 * record has a span. `plan.categories.find(c => c.id === "internet").peakShare
 * = 3.7656` was the same hole one level shallower, and it printed the exact
 * forbidden figure this repair is named after.
 *
 * Both are closed the same way, and neither closes by remembering:
 *
 *   1. THE PLAN IS DEEP-FROZEN AT MINT. Every nested array and object, and
 *      every Map and Set — those are replaced by frozen read-only facades,
 *      because `Object.freeze` does nothing to a Map's backing store and a
 *      facade with no `set` has no backing store to reach.
 *   2. RE-ENTRY RE-VALIDATES CONTENT, NEVER PROVENANCE ALONE. `planner.open`
 *      re-walks the whole live object graph, asserts every container is still
 *      frozen, collects every mark it can reach ANYWHERE in the plan rather
 *      than from a hand-written list of containers, and then hands the plan to
 *      the planner's own `revalidate` to re-derive its arithmetic. A seal that
 *      proves WHERE a plan came from but not WHAT IT NOW CONTAINS is a
 *      provenance check wearing a validation badge.
 *
 * The walk is generic on purpose. The previous design asked each module for a
 * `collect(plan)` that listed its mark-bearing containers, and two of them were
 * never listed: `plan.overlaps` in the value chart, which is drawn, and
 * `plan.tallerSpans`, which is printed into the axis note. A list of containers
 * is a thing a person maintains, and this project has now proved five times
 * that the fixes which hold are the ones that remove the ability rather than
 * add a step someone can skip.
 *
 * A DOCUMENTED LIMIT. A caller who builds mark objects by hand and calls the
 * drawing primitives directly is not stopped by any of this. They are also not
 * using a public option — they are rewriting the module, in a diff a reviewer
 * reads. That is the same line the library draws around
 * `mechanism_scope_rules`, and it is the most any check can do.
 */

import * as guards from '../lib/guards.js';

/* ======================================================================
 * 0 · ERRORS
 * ====================================================================== */

/** A plan or a mark was asked for something the record does not support. */
export class MarkError extends Error {
  constructor(message, offending) {
    super(message);
    this.name = new.target.name;
    this.offending = offending;
  }
}

/** A plan arrived from outside and is not one this module minted, or is stale. */
export class SealError extends MarkError {}

/** A claim was drawn whose verdict never reached the reader. */
export class VerdictError extends MarkError {}

/* ======================================================================
 * 1 · THE CUT, READ FROM THE LIBRARY AND NEVER TYPED
 *
 * value-chart.js used to spell "60 percent" into two reader-facing strings.
 * guards.configureRules() can move that cut — on the record, with a written
 * reason — and when it moves, prose that says 60 becomes false while looking
 * exactly as authoritative as it did before. The cut has one home. These read
 * it live, the way small-multiples.js already did at its span-mark tooltip.
 * ====================================================================== */

/** The span-only cut as a fraction, live from guards.RULES. */
export function wideCut() {
  return guards.RULES.wideIntervalRatio;
}

/** The span-only cut as a whole-number percentage string: "60". */
export function wideCutPercent() {
  return (wideCut() * 100).toFixed(0);
}

/**
 * The reader-facing sentence about the cut, with the live number in it.
 * Clears the four readability gates: FK 3.1, Ease 88, Fog 4.4, SMOG 5.8.
 */
export function wideCutSentence() {
  return `A wide bar means a wide interval. Where the 80 percent interval is wider than ` +
    `${wideCutPercent()} percent of the value, there is no dot at all. The bar is the whole mark.`;
}

/* ======================================================================
 * 2 · THE MARK
 * ====================================================================== */

/** Marks this module minted. A renderer cannot forge membership. */
const _MINTED = new WeakSet();

/**
 * THE ONLY FIELDS `extra` MAY CARRY, AND IT IS AN ALLOW LIST BECAUSE A BAN LIST
 * WAS NOT ONE.
 *
 * `extra` used to be policed by a list of forbidden keys — `central`, `kind`,
 * `lo`, `hi`, `ratio`, `layout`, `anchor` — which are this function's own
 * answers. Everything else went straight onto a minted mark, and "everything
 * else" included `ci80`, `sources`, `method`, `as_of` and `calibration`.
 *
 * That is a hole with a second mouth on it. `assertNoRecordOnPlan` in
 * `../eras/era-plan.js` walks a finished plan for record rows and SKIPS MINTED
 * MARKS BY DESIGN, because a point mark's `central` is the one record-shaped key
 * a mark is supposed to carry. So a record field put onto a mark through `extra`
 * walked past the strip, was sealed with the plan, and re-opened with the
 * midpoint of an interval the library had refused a central to computable off
 * the mark itself. B3 passes only `organField` today, so nothing exploited it —
 * but "no caller does this yet" is a latent hazard, not a guarantee, and both
 * READMEs state the strip as a GUARANTEE over the whole plan.
 *
 * So the list is closed, and it is closed five times:
 *
 *   1. A KEY NOT ON THIS LIST IS REFUSED. Not "a key on a list of bad names" —
 *      a ban list only protects against the fields somebody thought of, and
 *      `calibration` was not one of them.
 *   2. A VALUE THAT IS NOT A PRIMITIVE IS REFUSED. "No record on a mark" is not
 *      a rule about key names; it is a rule about whether a renderer can reach
 *      the record. `{ statement: theWholeClaim }` reaches it through an allowed
 *      key. A mark carries strings, numbers and nulls.
 *   3. EVERY OWN KEY IS READ, INCLUDING SYMBOLS. The check used to walk
 *      `Object.keys`, which does not see a symbol — and object spread does. So
 *      `{ [Symbol.for("ci80")]: claim.ci80 }` walked onto a minted mark with
 *      nothing looking at it, and `assertNoRecordOnPlan` walks `Object.keys`
 *      too, so nothing downstream would ever have found it. `Reflect.ownKeys`
 *      sees every own key, and a symbol is never on the allow list.
 *   4. AN ACCESSOR IS REFUSED. A mark carries values. A property with a getter
 *      is a value that can be one thing when it is checked and another thing
 *      when it is read, and the check used to read `extra[key]`, approve it, and
 *      then let the mark spread `extra` — two reads of the same property. So
 *      `{ get statement() { return n++ ? claim : "a sentence"; } }` passed the
 *      check and put the whole record on the mark.
 *   5. AND THE VALIDATED VALUES ARE WHAT GOES ON THE MARK, not the caller's
 *      object. Rule 4 already closes the two-reads gap; this closes it a second
 *      time, without depending on anyone having thought of accessors. The bag is
 *      copied here, once, and the copy is what `planClaimMark` spreads.
 *
 * Adding a key here is an edit in a diff a reviewer reads, which is the point.
 */
export const EXTRA_KEYS = Object.freeze([
  'source_series',  // which compiler's run a mark belongs to — value-chart, small-multiples
  'medium',         // which medium a mark is of — small-multiples
  'organField',     // which of the eight organ fields a mark sits at — the era machines
  'statement',      // the claim's own sentence, which a verdict stamp has to be able to print
]);

/** The fields planClaimMark computes. Named apart, so the refusal says which. */
const COMPUTED_KEYS = Object.freeze([
  'central', 'kind', 'lo', 'hi', 'ratio', 'layout', 'anchor',
  'id', 'year', 'grade', 'unit', 'label', 'verdict',
]);

/**
 * THROWING FORM. What a caller may hand a mark, and in what shape.
 *
 * Returns a FROZEN COPY holding the values this function actually checked, and
 * `planClaimMark` spreads that copy rather than the caller's object. Validating
 * one object and spreading another read of it is a check with a gap in the
 * middle of it: see note 4 on EXTRA_KEYS.
 */
export function assertExtra(extra, id) {
  if (extra === undefined || extra === null) return Object.freeze({});
  if (typeof extra !== 'object' || Array.isArray(extra)) {
    throw new MarkError(
      `planClaimMark(${id}) was given an \`extra\` that is not a plain object.`, extra,
    );
  }
  const safe = {};
  /* Reflect.ownKeys, not Object.keys: object spread copies symbol keys and
   * Object.keys does not see them, so a walk that misses one is a walk a record
   * row rides through. */
  for (const key of Reflect.ownKeys(extra)) {
    const name = typeof key === 'symbol' ? key.toString() : key;
    if (COMPUTED_KEYS.includes(key)) {
      throw new MarkError(
        `planClaimMark(${id}) was given "${name}" in \`extra\`. Those fields are this function's ` +
        `answer, not the caller's — and "central" in particular is the field whose ABSENCE on a ` +
        `span-only mark is the entire guarantee this module makes.`,
        extra,
      );
    }
    if (!EXTRA_KEYS.includes(key)) {
      throw new MarkError(
        `planClaimMark(${id}) was given "${name}" in \`extra\`, which is not one of the ` +
        `presentation fields a mark may carry: ${EXTRA_KEYS.join(', ')}. The list is an ALLOW ` +
        `list because a ban list let \`ci80\`, \`sources\`, \`method\`, \`as_of\` and ` +
        `\`calibration\` onto minted marks — and the record strip skips minted marks by design, ` +
        `so a record field that reaches one is a record field nothing downstream will find. If ` +
        `this mark really needs "${name}" to be drawn, add it to EXTRA_KEYS with the reason.`,
        extra,
      );
    }
    const descriptor = Object.getOwnPropertyDescriptor(extra, key);
    if (descriptor && (typeof descriptor.get === 'function' || typeof descriptor.set === 'function')) {
      throw new MarkError(
        `planClaimMark(${id}) was given an accessor at \`extra.${name}\`. A mark carries values. ` +
        `A property with a getter is a value that can be a harmless string when it is checked and ` +
        `the whole claim record when it is read again, and that is how \`ci80\` and \`calibration\` ` +
        `walked past a check that had just approved a sentence.`,
        descriptor,
      );
    }
    /* Read ONCE. What is checked is what is kept. */
    const value = extra[key];
    if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
      throw new MarkError(
        `planClaimMark(${id}) was given a ${Array.isArray(value) ? 'array' : typeof value} at ` +
        `\`extra.${name}\`. A mark carries strings, numbers and nulls. An object under an allowed ` +
        `key is how a whole claim record — its \`ci80\`, its \`calibration\`, its sources — rides ` +
        `onto a mark that every later check waves through.`,
        value,
      );
    }
    safe[key] = value;
  }
  return Object.freeze(safe);
}

/**
 * Build the one drawable object, and strip what the renderer must not reach.
 *
 * `claim` is a record in the shape G1 reads: `{ id, central, ci80, ... }`. The
 * guard runs on THAT — on the record's own numbers — and never on the
 * transformed ones, so a share-of-total view cannot change which claims are
 * allowed a central by dividing everything by a denominator.
 *
 * options:
 *   year        the fact year, already resolved through G8 by the caller
 *   transform   pure map from record units to drawing units (default identity).
 *               Applied to central, lo and hi alike. A linear transform leaves
 *               the interval ratio unchanged, which is why the guard's answer
 *               still holds after it.
 *   label       what this mark is of, for the accessible name
 *   format      value -> string, for the accessible name
 *   register    REQUIRED when the claim's verdict is not the clean one
 *   extra       presentation fields to carry along. EXTRA_KEYS is the closed
 *               list, and every value must be a primitive. See EXTRA_KEYS.
 */
export function planClaimMark(claim, options = {}) {
  /* The library's own reader. Two finite numbers, low before high, central
   * inside them — or it throws, and the caller sees the guard that refused
   * rather than a paraphrase of it. */
  const { central, low, high } = guards.claimInterval(claim, 'G1');
  const kind = guards.markKindFor(claim);
  /* And the throwing form at the point of decision, so an unreadable interval
   * is refused whichever kind was asked for. */
  guards.drawMark(claim, kind);

  const t = options.transform || ((v) => v);
  const lo = t(low);
  const hi = t(high);
  const ratio = guards.intervalRatio(claim);
  const stamp = stampVerdict(claim, options.register, options.label || claim.id);

  const extra = assertExtra(options.extra, claim.id);

  const mark = {
    ...extra,
    id: claim.id,
    year: options.year ?? null,
    kind,
    lo,
    hi,
    ratio,
    grade: claim.grade ?? null,
    unit: claim.unit ?? null,
    label: options.label ?? null,
    verdict: stamp.verdict,
    /* THERE IS NO `layout` HERE. See the file header: it was the midpoint of a
     * span-only interval, it was documented as never-printed, and it was
     * printed. Positioning goes through anchorY(mark, scale), which returns a
     * pixel. */
  };
  /* THE STRIP. On a span-only mark the key is never assigned, so `mark.central`
   * is `undefined` and `'central' in mark` is false. There is no central to
   * ignore, to forget to check, or to read by accident. */
  if (kind === 'point') mark.central = t(central);

  Object.freeze(mark);
  _MINTED.add(mark);
  return mark;
}

/** True when this object came out of planClaimMark. */
export function isMark(value) {
  return typeof value === 'object' && value !== null && _MINTED.has(value);
}

/** THROWING FORM. Refuses anything the renderer built for itself. */
export function assertMark(value, context) {
  if (!isMark(value)) {
    throw new MarkError(
      `${context || 'this drawing'} was handed an object that is not a mark this module minted. ` +
      `A hand-built mark is how a central walks back onto a span-only claim: the whole guarantee ` +
      `here is that the number is absent, and an object literal can always carry one.`,
      value,
    );
  }
  return value;
}

/**
 * THE ONLY SUPPORTED WAY TO PRINT WHAT A MARK READS.
 *
 * A point mark prints its central and its interval. A span-only mark prints its
 * interval and says, in words, that there is no central and why. It cannot
 * print a central, because it does not have one.
 */
export function markReading(mark, format = String) {
  assertMark(mark, 'markReading');
  if (mark.kind === 'point') {
    return `${format(mark.central)} · 80% interval ${format(mark.lo)}–${format(mark.hi)}`;
  }
  return `80% interval ${format(mark.lo)}–${format(mark.hi)} · no central value: the interval is ` +
    `${(mark.ratio * 100).toFixed(0)}% of the value, over the ${wideCutPercent()}% cut, so there ` +
    `is no middle value to draw`;
}

/**
 * THE FIGURE A MARK STANDS FOR, where a sentence has room for one figure.
 *
 * A point mark prints its central. A span-only mark prints its two ends and
 * says there is no middle value. It NEVER prints a midpoint, a geometric mean
 * or a rounded band centre, because a derived middle value of an interval the
 * library refuses a central to is that central with better manners.
 *
 * Use this wherever a caption used to interpolate a bare number. Use
 * `markReading` where there is room for the interval as well.
 */
export function markFigure(mark, format = String) {
  assertMark(mark, 'markFigure');
  if (mark.kind === 'point') return format(mark.central);
  return `somewhere between ${format(mark.lo)} and ${format(mark.hi)} — that reading has no ` +
    `middle value`;
}

/**
 * WHERE A LABEL HANGS, IN PIXELS. The replacement for the old `layout` field.
 *
 * `scale` is the chart's own y (or x) scale. A point mark anchors at its
 * central. A span-only mark anchors halfway down THE BAR THAT WAS DRAWN, which
 * is a fact about the drawing rather than a value in the record's units — so
 * there is no number here anybody can print as a reading, and the module never
 * has to trust a comment saying so.
 *
 * The pixel is computed from the scaled ends rather than from `(lo + hi) / 2`
 * put through the scale, which is not the same thing on a log axis and is the
 * geometric mean wearing a disguise.
 */
export function anchorY(mark, scale) {
  assertMark(mark, 'anchorY');
  if (typeof scale !== 'function') {
    throw new MarkError(
      'anchorY(mark, scale) needs the chart\'s own scale, so that what comes back is a pixel ' +
      'rather than a value. Handing back a value is how the midpoint of a span-only interval ' +
      'got printed into a figcaption and an aria-label.',
      scale,
    );
  }
  return mark.kind === 'point' ? scale(mark.central) : (scale(mark.lo) + scale(mark.hi)) / 2;
}

/** The accessible name for one mark: what it is, what it reads, and its verdict. */
export function markTitle(mark, { label = null, format = String, suffix = '' } = {}) {
  assertMark(mark, 'markTitle');
  const head = [label || mark.label || mark.id, mark.year].filter((v) => v != null).join(' ');
  const grade = mark.grade ? ` · source grade ${mark.grade}` : '';
  const verdict = verdictSentence(mark);
  return `${head}: ${markReading(mark, format)}${grade}${verdict ? ` · ${verdict}` : ''}` +
    (suffix ? ` · ${suffix}` : '');
}

/**
 * Which of these marks cannot be ordered against each other, over ALL pairs.
 *
 * THE BUG THIS EXISTS FOR. The cross-section tested only ADJACENT stack
 * neighbours and then printed, when it found none, "No two media in this year
 * have overlapping 80% intervals." In 2007 five pairs overlap, including
 * broadcast television against newspapers — the second and third largest
 * segments in the column. The module argued against sorting on the grounds
 * that intervals overlap and then told the reader that none of them do.
 *
 * A universally quantified sentence has to be earned over the whole set. There
 * are eleven media in the widest year; the quadratic is fifty-five comparisons.
 */
export function unorderablePairs(marks) {
  const out = [];
  for (let i = 0; i < marks.length; i += 1) {
    for (let j = i + 1; j < marks.length; j += 1) {
      const a = marks[i];
      const b = marks[j];
      if (a.lo <= b.hi && b.lo <= a.hi) out.push([a, b]);
    }
  }
  return out;
}

/* ======================================================================
 * 3 · THE VERDICT RULE
 * ====================================================================== */

/**
 * The verdict the record uses for a claim that survived verification unchanged.
 *
 * This one string is typed, and everything else about the vocabulary is read.
 * If the record stops using it, `verdictVocabulary` throws rather than letting
 * this module silently stamp every claim or none of them — the GuardVacuous
 * posture, applied at the chart layer.
 */
export const CLEAN_VERDICT = 'confirmed';

/** Every verdict string claims.json actually carries. Read, never listed. */
export function verdictVocabulary(claimsFile) {
  const file = claimsFile || guards.getFrozen('claims');
  const list = Array.isArray(file) ? file : (file && file.claims);
  if (!Array.isArray(list) || list.length === 0) {
    throw new MarkError(
      'claims.json produced no claims, so the chart layer cannot tell which verdicts the record ' +
      'uses and would stamp either all marks or none of them.',
      file && Object.keys(file || {}),
    );
  }
  const seen = new Set();
  for (const c of list) if (typeof c.verdict === 'string' && c.verdict !== '') seen.add(c.verdict);
  if (!seen.has(CLEAN_VERDICT)) {
    throw new MarkError(
      `claims.json no longer carries the verdict "${CLEAN_VERDICT}" anywhere, so this module ` +
      `cannot tell a clean claim from a repaired one. It will not fall back to treating every ` +
      `verdict as clean: that is how a rejected claim reaches a chart with nothing on screen ` +
      `saying so, which is the failure stage R3b was spent repairing.`,
      [...seen],
    );
  }
  return [...seen].sort();
}

/** A register the module must PRINT. Marks are stamped into it, not onto a page. */
export function verdictRegister(context) {
  return { context: context || 'this drawing', entries: [] };
}

/**
 * The one sentence that says what a non-clean verdict means, built from the
 * record's own words. `null` for a clean claim, so a caller can test it.
 */
export function verdictSentence(claimOrMark) {
  const verdict = claimOrMark && claimOrMark.verdict;
  if (typeof verdict !== 'string' || verdict === '' || verdict === CLEAN_VERDICT) return null;
  if (verdict === 'rejected') {
    return `verdict REJECTED — verification threw this claim's original statement out and the ` +
      `body drawn here is the replacement written in its place`;
  }
  return `verdict ${verdict.toUpperCase()} — verification changed this claim after it was written`;
}

/**
 * Stamp a claim's verdict, and refuse to draw a non-clean one off the record.
 *
 * `register` is REQUIRED for any claim whose verdict is not the clean one. It
 * is not a formality: the register is what the module prints where the reader
 * can see it, and a stamp that exists only inside a callout on some other part
 * of the page is a correction the reader has to go looking for.
 */
export function stampVerdict(claim, register, context) {
  const verdict = typeof claim.verdict === 'string' && claim.verdict !== '' ? claim.verdict : null;
  const sentence = verdictSentence(claim);
  if (!sentence) return { verdict, sentence: null, stamped: false };
  if (!register || !Array.isArray(register.entries)) {
    throw new VerdictError(
      `${context || 'this drawing'} draws claim "${claim.id}", whose verdict is "${verdict}", and ` +
      `passed no verdict register. Every verdict in this record is drawable — ds-gdp-001 is ` +
      `rejected and its body IS the correction, which is why the GDP strip may draw it — but no ` +
      `verdict may be invisible. Pass verdictRegister(context) and print it: a correction the ` +
      `reader cannot see on the object is a correction that has not been made.`,
      { id: claim.id, verdict },
    );
  }
  register.entries.push({
    id: claim.id,
    verdict,
    sentence,
    statement: claim.statement || null,
    context: context || register.context,
  });
  return { verdict, sentence, stamped: true };
}

/**
 * Every stamp a register holds, deduplicated by claim id, ready to print.
 * A module that renders this array has satisfied the rule; one that does not
 * fails `assertVerdictsVisible` below.
 */
export function verdictStamps(register) {
  const seen = new Map();
  for (const entry of (register && register.entries) || []) {
    if (!seen.has(entry.id)) seen.set(entry.id, entry);
  }
  return [...seen.values()];
}

/**
 * THROWING FORM. Every non-clean mark in `marks` must have a stamp in `stamps`.
 *
 * This is what makes a forged plan unusable rather than merely suspicious: a
 * plan handed in through `options.plan` carrying a rejected claim and an empty
 * stamp list is refused here, on content, before anything is drawn.
 */
export function assertVerdictsVisible(marks, stamps, context) {
  const stamped = new Set((stamps || []).map((s) => s.id));
  const missing = marks.filter((m) => verdictSentence(m) !== null && !stamped.has(m.id));
  if (missing.length > 0) {
    throw new VerdictError(
      `${context || 'this drawing'} draws ${missing.length} claim(s) whose verdict is not ` +
      `"${CLEAN_VERDICT}" and carries no printed stamp for them: ` +
      `${missing.map((m) => `${m.id} (${m.verdict})`).join(', ')}.`,
      missing.map((m) => m.id),
    );
  }
  return true;
}

/* ======================================================================
 * 4 · THE SEAL — what closes options.plan
 *
 * Four pieces, and they are in this order because each one exists because the
 * one before it was not enough:
 *
 *   deepFreeze   removes the ability to edit a sealed plan at all
 *   inspectPlan  re-derives, from the LIVE graph, what the plan now contains
 *   revalidate   the planner's own arithmetic, re-run on re-entry
 *   the handle   says WHICH planner's arithmetic that was, so a caller cannot
 *                substitute their own and have a door open on the answer
 * ====================================================================== */

const _SEALED = new WeakMap();
const _READONLY_MAP = new WeakSet();
const _READONLY_SET = new WeakSet();

/** True for a read-only Map facade this module minted. */
export function isFrozenMap(value) {
  return typeof value === 'object' && value !== null && _READONLY_MAP.has(value);
}

/** True for a read-only Set facade this module minted. */
export function isFrozenSet(value) {
  return typeof value === 'object' && value !== null && _READONLY_SET.has(value);
}

/**
 * A READ-ONLY MAP, WITH NO BACKING STORE ANYBODY CAN REACH.
 *
 * `Object.freeze(map)` is worthless: it stops properties being added to the
 * object and does nothing at all to `[[MapData]]`, so `plan.crossSections.set(
 * 1935, forged)` goes straight through a "frozen" plan. Shadowing `set` with a
 * throwing own property is no better, because `Map.prototype.set.call(map, …)`
 * walks around it in one line.
 *
 * So the Map is replaced. The real Map lives in this closure and nothing on the
 * facade returns it; the facade is a frozen plain object carrying only the
 * reading half of the interface. `Map.prototype.set.call(facade, …)` throws,
 * because the facade is not a Map and has no internal slot to write to.
 *
 * The reading half is the whole reading half the chart layer uses — get, has,
 * keys, values, entries, forEach, size and iteration — so no call site changes.
 */
function frozenMapOf(map, seal) {
  const inner = new Map();
  for (const [k, v] of map) inner.set(k, seal(v));
  const facade = {
    get: (k) => inner.get(k),
    has: (k) => inner.has(k),
    keys: () => inner.keys(),
    values: () => inner.values(),
    entries: () => inner.entries(),
    forEach(fn, thisArg) { inner.forEach((v, k) => fn.call(thisArg, v, k, facade)); },
    [Symbol.iterator]: () => inner.entries(),
  };
  Object.defineProperty(facade, 'size', { get: () => inner.size, enumerable: false });
  Object.defineProperty(facade, 'toString', {
    value: () => `[frozen map of ${inner.size}]`, enumerable: false,
  });
  _READONLY_MAP.add(facade);
  Object.freeze(facade);
  return facade;
}

/** The same trick for a Set. `add`, `delete` and `clear` simply do not exist. */
function frozenSetOf(set, seal) {
  const inner = new Set();
  for (const v of set) inner.add(seal(v));
  const facade = {
    has: (v) => inner.has(v),
    values: () => inner.values(),
    keys: () => inner.values(),
    entries: () => inner.entries(),
    forEach(fn, thisArg) { inner.forEach((v) => fn.call(thisArg, v, v, facade)); },
    [Symbol.iterator]: () => inner.values(),
  };
  Object.defineProperty(facade, 'size', { get: () => inner.size, enumerable: false });
  _READONLY_SET.add(facade);
  Object.freeze(facade);
  return facade;
}

/**
 * DEEP-FREEZE A PLAN. Every nested array, object, Map and Set.
 *
 * Returns the value to store, because a Map is not frozen in place — it is
 * REPLACED — so the caller has to take what comes back. At the top level
 * the seal does that for every own property of the plan before freezing the
 * plan itself.
 *
 * Functions are left alone. A plan may carry one — the GDP strip's `windowMax`
 * is a closure over the readings — and the plan's own top-level freeze is what
 * stops it being swapped for another.
 */
function sealValue(value, seen) {
  if (value === null || typeof value !== 'object') return value;
  if (isMark(value)) return value;                       // frozen at mint
  if (isFrozenMap(value) || isFrozenSet(value)) return value;
  if (seen.has(value)) return value;
  const seal = (v) => sealValue(v, seen);
  if (value instanceof Map) return frozenMapOf(value, seal);
  if (value instanceof Set) return frozenSetOf(value, seal);
  seen.add(value);

  const alreadyFrozen = Object.isFrozen(value);
  const keys = Array.isArray(value)
    ? value.map((_, i) => i)
    : Object.keys(value);
  for (const key of keys) {
    const child = value[key];
    const sealed = sealValue(child, seen);
    if (sealed === child) continue;
    if (alreadyFrozen) {
      /* Only a Map or a Set comes back as a different object, and a frozen
       * container holding a live Map is a hole this function cannot close from
       * the outside. It does not happen on any plan in this folder; if it ever
       * does, it fails here rather than silently leaving the Map writable. */
      throw new SealError(
        `this plan cannot be deep-frozen: a container that is already frozen holds a Map ` +
        `or a Set at "${key}", and a Map is replaced rather than frozen in place. Build the ` +
        `container after its contents, or hand the planner a plain object.`,
        value,
      );
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor && descriptor.writable) value[key] = sealed;
  }
  return Object.freeze(value);
}

/* Which own keys make an object look like a mark to a renderer. An object
 * carrying these is one a draw site will read `central` or `lo`/`hi` off, so an
 * unminted one is refused wherever it turns up in a plan. */
function looksLikeMark(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const has = (k) => Object.prototype.hasOwnProperty.call(value, k);
  if (has('kind') && (value.kind === 'point' || value.kind === 'span')) return true;
  return has('lo') && has('hi') && (has('central') || has('ratio'));
}

/**
 * WALK THE WHOLE PLAN AND SAY WHAT IS IN IT.
 *
 * Generic, because a hand-written list of containers is a thing somebody has to
 * remember to extend. Two of them were never extended: `plan.overlaps`, which
 * the value chart draws a caliper from, and `plan.tallerSpans`, which it prints
 * into the axis note — so `{ source_series: "INVENTED", year: 1999 }` pushed
 * onto the second one reached the page as a named mark that does not exist.
 *
 * Three findings come out of one pass:
 *
 *   1. every mark the plan can reach, from anywhere;
 *   2. every object that LOOKS like a mark and is not one this module minted —
 *      refused, because that is a hand-built mark sitting where a renderer will
 *      read a central off it;
 *   3. every array that mixes marks with things that are not marks — refused,
 *      because a container of marks is what its consumers assume it is.
 *
 * `requireFrozen` also asserts the container is still frozen. On re-entry that
 * is the check that says the seal was not merely applied once, and it is the
 * reason a sealed plan cannot be edited in a non-strict caller either, where
 * writing to a frozen object fails silently instead of throwing.
 */
export function inspectPlan(plan, context, { requireFrozen = false } = {}) {
  const where = context || 'this plan';
  const found = [];
  const seen = new WeakSet();
  /* A mark is reachable by more than one route — `rail.marks` and
   * `rail.segments[].marks` are the same objects, and `plan.tallest` is one of
   * them again — so it is reported once. */
  const reported = new WeakSet();

  const visit = (value, path) => {
    if (value === null || typeof value !== 'object') return;
    if (isMark(value)) {
      if (!reported.has(value)) { reported.add(value); found.push(value); }
      return;
    }
    if (looksLikeMark(value)) {
      throw new MarkError(
        `${where} carries an object at ${path} that looks like a mark and is not one this module ` +
        `minted. A hand-built mark is how a central walks back onto a span-only claim: a renderer ` +
        `reading \`central\` off it cannot tell the difference, and the whole guarantee here is ` +
        `that the number is absent.`,
        value,
      );
    }
    if (isFrozenMap(value) || isFrozenSet(value)) {
      let i = 0;
      for (const entry of value) {
        if (isFrozenMap(value)) visit(entry[1], `${path}.get(${String(entry[0])})`);
        else visit(entry, `${path}[${i}]`);
        i += 1;
      }
      return;
    }
    if (value instanceof Map || value instanceof Set) {
      throw new SealError(
        `${where} carries a live ${value instanceof Map ? 'Map' : 'Set'} at ${path}. A sealed plan ` +
        `holds read-only facades, because Object.freeze does nothing to a Map's contents — a ` +
        `frozen plan with a live Map in it accepts .set() in one line.`,
        value,
      );
    }
    if (seen.has(value)) return;
    seen.add(value);
    if (requireFrozen && !Object.isFrozen(value)) {
      throw new SealError(
        `${where} has a container at ${path} that is no longer frozen, so this plan is not the ` +
        `object that was sealed. Re-entry re-checks the freeze rather than trusting that it was ` +
        `applied once: a seal proves where a plan came from, not what it now contains.`,
        value,
      );
    }
    if (Array.isArray(value)) {
      let marksIn = 0;
      let othersIn = 0;
      value.forEach((child, i) => {
        if (isMark(child)) marksIn += 1;
        else if (child !== null && child !== undefined) othersIn += 1;
        visit(child, `${path}[${i}]`);
      });
      if (marksIn > 0 && othersIn > 0) {
        throw new MarkError(
          `${where} has an array at ${path} holding ${marksIn} mark(s) and ${othersIn} thing(s) ` +
          `that are not marks. Every consumer of a mark list reads \`central\`, \`lo\` and \`hi\` ` +
          `off its elements; one element that is not a mark reaches the page as a reading that ` +
          `does not exist.`,
          value,
        );
      }
      return;
    }
    for (const key of Object.keys(value)) visit(value[key], `${path}.${key}`);
  };

  visit(plan, 'plan');
  return { marks: found };
}

/** Planner handles this module minted. A caller cannot forge membership. */
const _PLANNERS = new WeakSet();

/** True for a planner handle `definePlanner` produced. Never a shape test. */
export function isPlanner(value) {
  return typeof value === 'object' && value !== null && _PLANNERS.has(value);
}

function mintSeal(plan, planner, revalidate, context) {
  const where = context || planner.name;
  if (plan === null || typeof plan !== 'object') {
    throw new SealError(`${planner.name} was handed something that is not a plan to seal.`, plan);
  }
  if (_SEALED.has(plan)) {
    /* One plan, one planner. Re-sealing would let a second caller overwrite
     * whose arithmetic a door re-runs, which is the whole thing this identity
     * exists to pin down. */
    const held = _SEALED.get(plan);
    throw new SealError(
      `${planner.name} was handed a plan that ${held.planner.name} has already sealed. A plan ` +
      `carries one planner's identity for its whole life: re-sealing it would swap out the ` +
      `\`revalidate\` a door re-runs, which is exactly the substitution the handle exists to stop.`,
      plan,
    );
  }
  const seen = new WeakSet();
  for (const key of Object.keys(plan)) plan[key] = sealValue(plan[key], seen);
  Object.freeze(plan);

  const { marks } = inspectPlan(plan, where, { requireFrozen: true });
  assertMarksHonest(marks, where);
  revalidate(plan, { marks, context: where });

  _SEALED.set(plan, { planner, revalidate, context: where });
  return plan;
}

function openFor(plan, planner, context) {
  const seal = _SEALED.get(plan);
  if (!seal) {
    throw new SealError(
      `${context || planner.name} was handed an options.plan that no planner sealed. That option ` +
      `used to accept any object at all, which skipped every guard in the module: it was used to ` +
      `render a rejected claim plotted at its as_of publication date, and to forge every share in ` +
      `the small-multiple bank straight past the partition proof. A public option that disables ` +
      `every invariant is not an option, it is the bypass. Build the plan with this module's own ` +
      `planner and pass that.`,
      plan && typeof plan === 'object' ? Object.keys(plan) : plan,
    );
  }
  if (seal.planner !== planner) {
    throw new SealError(
      `${context || planner.name} was handed a plan sealed by ${seal.planner.name} rather than by ` +
      `${planner.name}. A seal is not a permission slip: it records WHICH planner minted the plan, ` +
      `so the \`revalidate\` this door re-runs is the one written beside the numbers it protects. ` +
      `A caller who could seal a plan with their own no-op revalidator could hand-type a figure ` +
      `into a plan of otherwise real marks and have every other check wave it through.`,
      { sealedBy: seal.planner.name, openedBy: planner.name },
    );
  }
  const where = context || seal.context;
  const { marks } = inspectPlan(plan, where, { requireFrozen: true });
  assertMarksHonest(marks, where);
  seal.revalidate(plan, { marks, context: where });
  return plan;
}

/**
 * DEFINE A PLANNER, AND KEEP THE HANDLE PRIVATE.
 *
 * `revalidate(plan, { marks, context })` is REQUIRED and it is the planner's own
 * arithmetic, written once and run twice: at mint, and again every time the plan
 * comes back in through `options.plan`. It is where a module says the things
 * only that module knows — that a rail's marks are its segments' marks in order,
 * that a category's printed peak is the largest share the record allows a
 * central to, that a cross-section's members are the ones its year holds.
 *
 * It is required for the same reason `collect` used to be: without it the seal
 * is a rubber stamp. It runs at mint so that a plan which could not survive
 * re-entry never leaves the planner, which means the two paths through
 * `renderValueChart` cannot disagree about what is legal.
 *
 * HOW TO USE THE HANDLE, AND THE ONE RULE ABOUT IT.
 *
 *     const PLANNER = definePlanner({ name: 'the era machine planner', revalidate });
 *     export function planEra(...)  { ...; return PLANNER.seal(plan, where); }
 *     export function openEraPlan(plan, ctx) { return PLANNER.open(plan, ctx); }
 *     export const isEraPlan = (plan) => PLANNER.owns(plan);
 *
 * THE HANDLE IS NEVER EXPORTED. Exporting the door is safe — opening validates
 * and mints nothing. Exporting the handle would hand out `seal`, and the seal is
 * the capability. A module that keeps its handle in a module-private const can
 * only be forged by editing that module, which is a rewrite in a diff a reviewer
 * reads, and is the same line the library draws around `mechanism_scope_rules`.
 *
 * `definePlanner` itself is public, and that is not a hole: a handle an
 * adversary defines is not the handle `era-plan.js` holds, and `renderEraMachine`
 * asks for that one by identity.
 */
export function definePlanner(options = {}) {
  const { name, revalidate } = options;
  if (typeof name !== 'string' || name.trim().length < 4) {
    throw new SealError(
      'definePlanner needs a `name`. It is what a refusal prints when a plan reaches the wrong ' +
      'door, and "this plan was sealed by something else" is not a sentence anybody can act on.',
      name,
    );
  }
  if (typeof revalidate !== 'function') {
    throw new SealError(
      `definePlanner(${name}) needs a \`revalidate\` function. It is the module's own invariants, ` +
      `re-run on the live plan every time one arrives through options.plan. Without it the seal ` +
      `proves only that this module once built this object, which is provenance wearing a ` +
      `validation badge — and that is exactly how a swapped-in mark reached a benchmark rail.`,
      options,
    );
  }
  const planner = {
    name,
    /** Mint. Deep-freezes, inspects, then runs this planner's own arithmetic. */
    seal(plan, context) { return mintSeal(plan, planner, revalidate, context); },
    /**
     * THE ONLY WAY TO ACCEPT A PLAN FROM OUTSIDE.
     *
     * Refuses a plan this planner did not mint, and then does not trust the
     * seal. It re-walks the whole live graph, asserts every container is still
     * frozen, collects every mark from anywhere in the plan, re-checks each one
     * against the live guards, and re-runs this planner's own invariants.
     * Content, every call, no cache — because a cache keyed on identity
     * remembers only that an object was once valid, which is the hole guards.js
     * closed in resolveGaps and is not going to be reopened here.
     */
    open(plan, context) { return openFor(plan, planner, context); },
    /** True when this planner sealed `plan`. For a renderer's own error message. */
    owns(plan) {
      const seal = _SEALED.get(plan);
      return seal !== undefined && seal.planner === planner;
    },
  };
  _PLANNERS.add(planner);
  return Object.freeze(planner);
}

/**
 * Which planner sealed this plan, by name — or `null`. FOR A MESSAGE ONLY.
 *
 * It returns the name and never the handle, because the handle carries `seal`.
 * A test page's banner and a refusal's text are what this is for; nothing may
 * branch a permission on it, because a name is a string and a string is
 * forgeable. The permission is `planner.owns`.
 */
export function sealedBy(plan) {
  const seal = _SEALED.get(plan);
  return seal ? seal.planner.name : null;
}

/** Every mark a plan can reach, from anywhere in it. The generic walk. */
export function planMarks(plan, context) {
  return inspectPlan(plan, context).marks;
}

/**
 * Re-check a list of marks against the guards. Every mark, every call.
 *
 * The kind test re-derives the answer from the mark's own recorded ratio rather
 * than trusting the stored `kind`, so a plan whose marks say "point" over an
 * interval the cut refuses is caught here rather than at the draw site.
 *
 * A CONSEQUENCE WORTH KNOWING. It re-derives against the LIVE cut, so a plan
 * built before `guards.configureRules` moved `wideIntervalRatio` is refused
 * when it is handed back in afterwards. That is the intended answer: a plan
 * built on one drawing convention is not a plan for a page running on another,
 * and the alternative is a page whose marks and whose printed cut disagree.
 * Re-plan after moving a convention.
 */
export function assertMarksHonest(marks, context) {
  const cut = wideCut();
  marks.forEach((mark, i) => {
    assertMark(mark, `${context || 'this plan'} mark ${i}`);
    const wide = mark.ratio > cut;
    const kind = wide ? 'span' : 'point';
    if (mark.kind !== kind) {
      throw new MarkError(
        `${context || 'this plan'} carries mark "${mark.id}" as "${mark.kind}" when its interval ` +
        `is ${(mark.ratio * 100).toFixed(1)}% of its central value and the cut is ` +
        `${(cut * 100).toFixed(0)}%, which makes it "${kind}".`,
        mark,
      );
    }
    if (wide && 'central' in mark) {
      throw new MarkError(
        `${context || 'this plan'} carries a central value on span-only mark "${mark.id}". A ` +
        `span-only mark has no central by construction — the key is never assigned — so this ` +
        `object was not built by planClaimMark and is not one this renderer may draw.`,
        mark,
      );
    }
    if (!wide && typeof mark.central !== 'number') {
      throw new MarkError(
        `${context || 'this plan'} carries point mark "${mark.id}" with no central value, so the ` +
        `renderer would draw at undefined.`,
        mark,
      );
    }
    if ('layout' in mark || 'anchor' in mark) {
      throw new MarkError(
        `${context || 'this plan'} carries a derived middle value on mark "${mark.id}". A mark has ` +
        `no positioning number on it any more: the old \`layout\` field was the midpoint of a ` +
        `span-only interval, it was documented as never-printed, and it was printed into a ` +
        `figcaption and an aria-label. Position goes through anchorY(mark, scale), which returns a ` +
        `pixel.`,
        mark,
      );
    }
  });
  return true;
}

export default {
  planClaimMark, assertExtra, EXTRA_KEYS,
  markReading, markFigure, markTitle, anchorY, unorderablePairs,
  wideCut, wideCutPercent, wideCutSentence,
  verdictRegister, verdictStamps, verdictSentence, stampVerdict,
  assertVerdictsVisible, verdictVocabulary, CLEAN_VERDICT,
  definePlanner, isPlanner, sealedBy, planMarks, inspectPlan,
  assertMarksHonest, assertMark, isMark, isFrozenMap, isFrozenSet,
};
