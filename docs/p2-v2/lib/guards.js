/**
 * P2 — The Attention Economy · THE GUARDS
 * ======================================================================
 * docs/p2/lib/guards.js — team B1, the foundation layer every later team imports.
 *
 * Eight invariants. Five independent design architects reached six of them on
 * their own; the research added two more. Convergence at that width is
 * evidence, so the build treats them as invariants enforced in code rather
 * than as conventions written down somewhere.
 *
 * WHY THIS IS CODE AND NOT A STYLE GUIDE
 * --------------------------------------
 * A convention is a thing a tired person forgets. Stage R3b of this project
 * lost four hours to a wrong number that four separate verification gates had
 * confirmed, because a verifier matched a quoted string without checking what
 * it referred to. Every rule below is a rule that, when broken, produces a
 * page that looks completely fine and says something false. None of them
 * announce themselves at review time. So each one throws.
 *
 * THE RULE THE MODULE IS BUILT ON
 * ------------------------------
 * MAKE THE SAFE THING THE DEFAULT AND THE UNSAFE THING EXPLICIT.
 *
 * Every guard's laziest correct-looking call must either do the safe thing or
 * refuse to run. This is the acceptance test for anything added below, and it
 * is written down because the worst defect this file has had was a violation
 * of it: buildPath(points), the shortest way to call the path builder, drew
 * one unbroken line across the documented 2008–2020 hole, because `gaps` was
 * an optional argument whose default was the unsafe one. The guard whose whole
 * job is to stop a line crossing a hole did nothing unless you remembered to
 * configure it.
 *
 * A guard that only works when you remember to configure it is a comment.
 *
 * A GUARANTEE OR A PIECE OF ADVICE — AND THE NAME SAYS WHICH
 * ----------------------------------------------------------
 * Two guards in this file were defeated twice, and both times the repair was a
 * better detector. It never holds, because both were trying to DETECT a wrong
 * thing a caller can always express another way.
 *
 * G7 scanned prose for the claim that search went first-price in 2019. Natural
 * language paraphrase is unbounded; a regex closes no share of it that matters.
 * G4 read a predicate's own source looking for a written-down list. Moving the
 * identical array one line up into a `const` defeated it.
 *
 * So the file now separates two things it used to blur:
 *
 *   A GUARANTEE refuses a SHAPE, or checks a BOUNDED, FINITE record. It cannot
 *   be paraphrased around, because there is no other way to say the thing.
 *   `assert*` names, and they throw.
 *
 *   ADVICE is a heuristic over prose or over anything else unbounded. It finds
 *   some of what is wrong and never claims to find all of it. `lint*` names,
 *   and they RETURN FINDINGS. A human reads every one.
 *
 * A guard that claims to be a guarantee and is actually a heuristic is worse
 * than no guard, because everyone downstream stops looking.
 *
 * WHAT A GUARD OWES YOU
 * ---------------------
 *  - Every guard has a throwing form (build time) and a boolean form (tests).
 *  - Every guard reads its parameters out of the frozen files. There are no
 *    hard-coded claim lists, no hard-coded series names, no hard-coded
 *    unranked pairs and no hard-coded figures in the error messages anywhere
 *    below. The data moves; the guards follow. An error message is read at the
 *    exact moment somebody is deciding what is true, so a figure that has
 *    drifted from the record teaches the wrong number at the worst possible
 *    time, with the authority of a thrown error behind it.
 *  - Every guard has a docstring naming the real failure it prevents. A guard
 *    whose reason has been forgotten gets deleted by the next person.
 *  - Every guard that derives its parameters by reading the record also checks
 *    that it actually found them, and throws `GuardVacuousError` if it did
 *    not. A guard that silently stops guarding is worse than no guard.
 *
 * FROZEN FILES READ (all under p2-ad-market/data/, frozen 2026-07-31)
 * ------------------------------------------------------------------
 *   claims.json             506 calibrated claims           G1, G8
 *   adspend.json            8 series, concordance, gaps     G3, G4, G5
 *   moneytype/reconciled.json  unranked pairs, taxonomy seam  G2, G6
 *   eras/era-5.json         the two money-type taxonomies   G6
 *   mechanism.json          both engines, 209 steps         G7
 *   simulator-params.json   21 variables, 21 scenarios      G7
 *
 * USE
 * ---
 *   import * as guards from "./guards.js";
 *   await guards.loadFrozen();                 // over http(s)
 *   guards.setFrozen("claims", claimsObject);  // or inject, for a built page
 *
 *   guards.drawMark(claim, "point");           // throws on a wide interval
 *   guards.timelineYear(claim);                // never as_of, never a withheld claim
 *
 * Every guard also takes an explicit frozen object as its last argument, so it
 * can be called pure with no registry at all.
 *
 * Plain ES module. No bundler, no dependencies, no external requests.
 */

"use strict";

/* ======================================================================
 * 0 · ERRORS
 * ====================================================================== */

/**
 * Base class for every guard failure.
 *
 * The message is read by a developer at speed, usually at the wrong hour, so
 * it is built to three lines: what rule broke, what value broke it, and what
 * to do instead. `.guard`, `.rule`, `.offending` and `.fix` stay on the object
 * so a test page or a build script can render the same thing as a table.
 */
export class GuardError extends Error {
  constructor(guard, rule, problem, offending, fix) {
    super(
      `[${guard} · ${rule}] ${problem}\n` +
      `  offending: ${formatOffending(offending)}\n` +
      `  do instead: ${fix}`
    );
    this.name = new.target.name;
    this.guard = guard;
    this.rule = rule;
    this.problem = problem;
    this.offending = offending;
    this.fix = fix;
  }
}

/** G1 — a central mark was requested for a claim too wide to have one. */
export class WideIntervalError extends GuardError {}
/** G2 — an order was imposed on quantities the record cannot order. */
export class UnrankedOrderError extends GuardError {}
/** G3 — two different measured objects were about to be joined into one line. */
export class SpliceError extends GuardError {}
/** G4 — a caller supplied a literal series list instead of reading the file. */
export class SeriesListError extends GuardError {}
/** G5 — a documented hole in the record was about to be drawn as nothing. */
export class AbsenceError extends GuardError {}
/** G6 — era 5's two money-type taxonomies were about to be mixed in one view. */
export class TaxonomyMixError extends GuardError {}
/** G7 — a scenario or label asserted a mechanism the record says never existed. */
export class DeadMechanismError extends GuardError {}
/** G8 — a provenance date reached an axis, or a withheld claim reached a timeline. */
export class TimeFieldError extends GuardError {}

/** A required frozen file was not loaded, or is not the shape this guard expects. */
export class FrozenDataError extends GuardError {}

/**
 * A guard could not find the thing in the record that gives it its authority.
 *
 * This is the most important error class in the file. Every guard below
 * derives its parameters from a frozen file. If the record is edited so that
 * the parameter disappears, the naive failure mode is that the guard quietly
 * starts passing everything. This error makes that loud instead.
 */
export class GuardVacuousError extends GuardError {}

function formatOffending(value) {
  if (value === undefined) return "(undefined)";
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  try {
    const text = JSON.stringify(value);
    return text.length > 700 ? text.slice(0, 700) + "… (truncated)" : text;
  } catch (_) {
    return String(value);
  }
}

/* ======================================================================
 * 1 · THE FROZEN DATA REGISTRY
 *
 * Guards never contain data. They read it. This registry is the seam between
 * the two, and it exists in three flavours because the piece is built three
 * different ways: served over http during development, inlined into one
 * index.html by the build script (the P1 shape), and opened straight off the
 * filesystem by a test page.
 * ====================================================================== */

/** The six frozen files a guard may read, and where they live. */
export const FROZEN_FILES = Object.freeze({
  claims:          "claims.json",
  adspend:         "adspend.json",
  reconciled:      "moneytype/reconciled.json",
  era5:            "eras/era-5.json",
  mechanism:       "mechanism.json",
  simulatorParams: "simulator-params.json",
});

const _frozen = Object.create(null);

/** Install one frozen file. `name` is a key of FROZEN_FILES. */
export function setFrozen(name, value) {
  if (!(name in FROZEN_FILES)) {
    throw new FrozenDataError(
      "FROZEN", "KNOWN FILES ONLY",
      `"${name}" is not one of the frozen files a guard may read.`,
      name,
      `use one of: ${Object.keys(FROZEN_FILES).join(", ")}`
    );
  }
  _frozen[name] = value;
  return value;
}

/** Install several at once: useFrozen({ claims, adspend, ... }). */
export function useFrozen(bag) {
  for (const [name, value] of Object.entries(bag || {})) setFrozen(name, value);
  return frozenStatus();
}

/** Which frozen files are currently loaded. For a banner on a test page. */
export function frozenStatus() {
  const status = {};
  for (const name of Object.keys(FROZEN_FILES)) status[name] = _frozen[name] != null;
  return status;
}

/** Read back an installed frozen file. Tests use it to snapshot and restore. */
export function getFrozen(name) {
  return _frozen[name] ?? null;
}

/** Everything currently installed, as a bag useFrozen() can take back. */
export function snapshotFrozen() {
  const bag = {};
  for (const name of Object.keys(FROZEN_FILES)) {
    if (_frozen[name] != null) bag[name] = _frozen[name];
  }
  return bag;
}

/** Forget everything. Tests use this to prove a guard fails loud when starved. */
export function clearFrozen() {
  for (const name of Object.keys(_frozen)) delete _frozen[name];
}

/**
 * Fetch the real frozen files.
 *
 * Resolves relative to this module, so the default reaches the repo's own
 * data directory from docs/p2/lib/. Works over http(s). Browsers block fetch
 * on file:// origins, so a page opened straight off disk must inject instead —
 * see setFrozen / useFrozen.
 */
export async function loadFrozen(options = {}) {
  const base = options.base
    ? new URL(options.base, options.baseFrom || import.meta.url)
    : new URL("../../../p2-ad-market/data/", import.meta.url);
  const only = options.only || Object.keys(FROZEN_FILES);
  const fetchImpl = options.fetch || (typeof fetch === "function" ? fetch : null);
  if (!fetchImpl) {
    throw new FrozenDataError(
      "FROZEN", "NO FETCH",
      "loadFrozen needs a fetch implementation and this runtime has none.",
      null,
      "inject the data with useFrozen({ claims, adspend, ... }) instead"
    );
  }
  const loaded = [];
  for (const name of only) {
    const url = new URL(FROZEN_FILES[name], base);
    const response = await fetchImpl(url);
    if (!response.ok) {
      throw new FrozenDataError(
        "FROZEN", "FILE UNREADABLE",
        `could not read ${FROZEN_FILES[name]} (HTTP ${response.status}).`,
        String(url),
        "serve the repo root over http, or inject the data with useFrozen()"
      );
    }
    setFrozen(name, await response.json());
    loaded.push(name);
  }
  return loaded;
}

/** Get a frozen file or throw a message that says how to supply it. */
export function requireFrozen(name, guard, explicit) {
  const value = explicit != null ? explicit : _frozen[name];
  if (value == null) {
    throw new FrozenDataError(
      guard, "FROZEN DATA REQUIRED",
      `this guard reads ${FROZEN_FILES[name]} and it is not loaded.`,
      name,
      `call await loadFrozen() first, or setFrozen("${name}", obj), ` +
      `or pass the object as this function's last argument`
    );
  }
  return value;
}

/* ======================================================================
 * 2 · THE TWO DESIGN RULES THAT ARE NOT IN THE DATA
 *
 * Everything else below is derived from a frozen file. These two are drawing
 * conventions decided at the design grill, not measurements, so they live here
 * with their citation — and both are overridable, because a convention that
 * cannot be changed in one place gets copied into ten.
 *
 * OVERRIDABLE IS NOT THE SAME AS MUTABLE, and this used to blur the two.
 * `RULES` was a plain object and `configureRules` was `Object.assign(RULES,
 * patch)`, so both conventions could be moved from anywhere, by anyone, with no
 * reason recorded and no bound on the value:
 *
 *     RULES.wideIntervalRatio = 1e9;             // G1 now permits every dot
 *     RULES.absenceForms.push("none");           // G5 now accepts "none" as a texture
 *     configureRules({ wideIntervalRatio: 99 }); // same, through the front door
 *
 * Each of those switches a guard off from a call site that reads like
 * configuration. So the object and its arrays are frozen, the only way through
 * is configureRules(patch, reason), the reason is validated the way G4 validates
 * its `because`, the ratio is range-checked, the absence forms must be a subset
 * of the drawn vocabulary the design brief names, and guardManifest() marks a
 * non-default configuration so a page cannot quietly run on moved conventions.
 * ====================================================================== */

/**
 * Is this string a reason a person wrote, or the shape of one?
 *
 * Shared by G4's `because` and by configureRules' `reason`, because they are the
 * same requirement: an opt-out from a guard is a decision, and a decision with
 * no reason attached is indistinguishable from the bug the guard was built for.
 * Returns a phrase describing what is wrong, or null when the text is a reason.
 */
function writtenReasonProblem(value) {
  const text = typeof value === "string" ? value.trim() : "";
  const words = text.split(/\s+/).filter(Boolean);
  return (
    typeof value !== "string" ? `is ${value === undefined ? "missing" : "a " + typeof value}` :
    text === "" ? "is empty" :
    text.length < 12 ? `is ${text.length} characters long` :
    words.length < 3 ? "is one or two words" :
    _NON_REASONS.has(text.toLowerCase().replace(/[.!]+$/, "")) ? "is a placeholder, not a reason" :
    !/[A-Za-z]{3}/.test(text) ? "carries no words" : null
  );
}

/**
 * The drawn vocabulary of absence. Source: design/DESIGN.md palette, the Stipple
 * token ("Documented absence. Only ever a 2px texture, never a fill"), and rule
 * 5 ("stipple, hatch, a named empty block").
 *
 * configureRules may NARROW this list. It may not extend it: a new absence form
 * is a design decision made in DESIGN.md, and letting a call site invent one is
 * how "none" or "blank" becomes an accepted way to draw a documented hole —
 * which is the whitespace failure G5 exists to prevent, arriving through G5's
 * own configuration.
 */
export const ABSENCE_FORMS = Object.freeze(["stipple", "hatch", "block"]);

/**
 * The span-only cut may not be moved past this.
 *
 * A cut of 2.0 already says "an interval twice as wide as its own central value
 * still gets a dot in the middle of it". The design rule is 0.60. Anything above
 * the ceiling is not a different convention, it is G1 switched off — and the
 * ordinary way to switch a guard off is to argue for it in DESIGN.md, not to
 * pass a large number to a configuration function.
 */
const WIDE_INTERVAL_RATIO_CEILING = 2.0;

/** The conventions as the design brief writes them. Frozen, and the reset target. */
const RULES_DEFAULT = Object.freeze({
  /**
   * The span-only cut. A claim whose 80% interval exceeds this fraction of its
   * central value is drawn span-only, with no central mark.
   * Source: design/DESIGN.md, "Rules that are not reopened", rule 3.
   * At 0.60 against the frozen claims.json this selects 65 of 506 claims;
   * auditWideIntervals() re-counts it so drift is visible rather than assumed.
   */
  wideIntervalRatio: 0.60,

  /** The vocabulary of drawn absence. See ABSENCE_FORMS. */
  absenceForms: ABSENCE_FORMS,
});

/**
 * The live conventions. `let`, not `const`, because the object is FROZEN and
 * configureRules replaces it rather than writing into it. Importers hold a live
 * binding, so motion.js and the chart layer see the replacement — which is the
 * property that kept the cut in one place, and it survives the freeze.
 */
export let RULES = RULES_DEFAULT;

/** Null while the conventions are the design brief's own. */
let _rulesConfiguration = null;

/** Every key configureRules will accept. A typo is refused, never absorbed. */
const RULES_KEYS = Object.freeze(Object.keys(RULES_DEFAULT));

/**
 * Replace one or more drawing conventions, ON THE RECORD.
 *
 *     configureRules({ wideIntervalRatio: 0.5 },
 *                    "the era-3 panel draws narrower claims span-only because …")
 *
 * `reason` is required and is validated the way G4 validates its `because`: a
 * moved convention is an opt-out from a guard, and an opt-out with no reason is
 * the thing this whole file is written against. It is greppable, and it is what
 * guardManifest() prints beside the guards the change affects.
 *
 * Returns the new frozen RULES.
 */
export function configureRules(patch, reason) {
  if (patch === null || typeof patch !== "object" || Array.isArray(patch) ||
      Object.keys(patch).length === 0) {
    throw new GuardError(
      "RULES", "A MOVED CONVENTION IS ON THE RECORD",
      `configureRules needs an object naming at least one of ${RULES_KEYS.join(", ")} ` +
      `and got ${patch === null ? "null" : Array.isArray(patch) ? "an array" : "a " + typeof patch}.`,
      patch,
      'configureRules({ wideIntervalRatio: 0.5 }, "why the cut moves, in a sentence")'
    );
  }
  const unknown = Object.keys(patch).filter((k) => !RULES_KEYS.includes(k));
  if (unknown.length > 0) {
    throw new GuardError(
      "RULES", "A MOVED CONVENTION IS ON THE RECORD",
      `configureRules was given ${unknown.join(", ")}, which ${unknown.length === 1 ? "is not a" : "are not"} ` +
      `drawing convention${unknown.length === 1 ? "" : "s"} this file holds. It used to Object.assign ` +
      `whatever it was handed, so a misspelled key was absorbed in silence and the convention ` +
      `it was meant to move never moved.`,
      { unknown, known: RULES_KEYS },
      `use one of: ${RULES_KEYS.join(", ")}`
    );
  }
  const badReason = writtenReasonProblem(reason);
  if (badReason) {
    throw new GuardError(
      "RULES", "A MOVED CONVENTION IS ON THE RECORD",
      `configureRules moved ${Object.keys(patch).join(", ")} and its \`reason\` ${badReason}. ` +
      `Both conventions here are guard parameters: the cut decides which claims may carry a ` +
      `central dot, and the absence forms decide what counts as a hole drawn as an object. ` +
      `Moving one without a written reason is switching a guard down with nothing in the diff ` +
      `to review.`,
      { patch, reason },
      'write the sentence — configureRules({ wideIntervalRatio: 0.5 }, "the era-3 panel ' +
      'draws to a narrower cut because its claims are all sourced from one instrument")'
    );
  }

  const next = { ...RULES };

  if (Object.prototype.hasOwnProperty.call(patch, "wideIntervalRatio")) {
    const ratio = patch.wideIntervalRatio;
    if (typeof ratio !== "number" || !Number.isFinite(ratio) ||
        ratio <= 0 || ratio > WIDE_INTERVAL_RATIO_CEILING) {
      throw new WideIntervalError(
        "G1", "NO POINT ON A WIDE INTERVAL",
        `the span-only cut was set to ${formatOffending(ratio)}, which is not a cut. It must ` +
        `be a finite number above 0 and no more than ${WIDE_INTERVAL_RATIO_CEILING}. Above the ` +
        `ceiling the rule stops selecting anything — every claim in the record keeps its ` +
        `central dot, including the ones whose interval spans a factor of four — and G1 ` +
        `reports itself switched on while refusing nothing.`,
        { wideIntervalRatio: ratio, ceiling: WIDE_INTERVAL_RATIO_CEILING,
          design_rule: RULES_DEFAULT.wideIntervalRatio },
        `pass a ratio in (0, ${WIDE_INTERVAL_RATIO_CEILING}] — the design rule is ` +
        `${RULES_DEFAULT.wideIntervalRatio}; to change it beyond that, change DESIGN.md`
      );
    }
    next.wideIntervalRatio = ratio;
  }

  if (Object.prototype.hasOwnProperty.call(patch, "absenceForms")) {
    const forms = patch.absenceForms;
    const list = Array.isArray(forms) ? forms : null;
    const outside = list ? list.filter((f) => !ABSENCE_FORMS.includes(f)) : [];
    const duplicated = list ? list.filter((f, i) => list.indexOf(f) !== i) : [];
    if (!list || list.length === 0 || outside.length > 0 || duplicated.length > 0) {
      throw new AbsenceError(
        "G5", "ABSENCE IS AN OBJECT",
        `the absence vocabulary was set to ${formatOffending(forms)}. It must be a non-empty ` +
        `array of distinct forms drawn from the design brief's own list, and this list may be ` +
        `NARROWED but never extended: a form invented at a call site is how "none" or "blank" ` +
        `becomes an accepted way to draw a documented hole, which is the whitespace failure ` +
        `G5 exists to prevent arriving through G5's own configuration.`,
        { requested: forms, outside_the_vocabulary: outside, duplicated,
          vocabulary: [...ABSENCE_FORMS] },
        `pass a non-empty subset of: ${ABSENCE_FORMS.join(", ")} — to add a form, add it to ` +
        `design/DESIGN.md's palette and to ABSENCE_FORMS, where a reviewer sees it`
      );
    }
    next.absenceForms = Object.freeze([...list]);
  }

  RULES = Object.freeze(next);
  _rulesConfiguration = {
    reason: String(reason).trim(),
    changed: RULES_KEYS.filter((k) => !sameRule(RULES[k], RULES_DEFAULT[k])),
  };
  return RULES;
}

/**
 * Put the conventions back the way DESIGN.md writes them, and clear the mark.
 * The inverse of configureRules, so a page or a test that moved a cut can put it
 * back rather than leaving every later call running on someone else's rule.
 */
export function resetRules() {
  RULES = RULES_DEFAULT;
  _rulesConfiguration = null;
  return RULES;
}

function sameRule(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  return a === b;
}

/**
 * Whether the drawing conventions are the design brief's own, and if not, what
 * moved and why. guardManifest() prints this beside the guards it affects, so a
 * page listing what it is protected by cannot show a guard's stock description
 * while running on a cut somebody moved.
 */
export function rulesStatus() {
  if (!_rulesConfiguration || _rulesConfiguration.changed.length === 0) {
    return { default: true, changed: [], reason: null, values: { ...RULES } };
  }
  return {
    default: false,
    changed: [..._rulesConfiguration.changed],
    reason: _rulesConfiguration.reason,
    values: { ...RULES },
  };
}

/** Which guard each convention is a parameter of, for the manifest's mark. */
const RULE_OWNERS = Object.freeze({ wideIntervalRatio: "G1", absenceForms: "G5" });

/* ======================================================================
 * GUARD 1 · NO POINT ON A WIDE INTERVAL
 * ====================================================================== */

/**
 * WHY THIS EXISTS.
 *
 * 65 of the 506 frozen claims carry an 80% interval wider than 60% of their
 * own central value. `e1-buyers-008` is "$192m, somewhere between $96m and
 * $360m". Drawn as a dot at 192 it reads as a measurement. It is not one — it
 * is the midpoint of a range that spans a factor of nearly four, and a reader
 * who sees the dot will quote 192 back at you.
 *
 * The failure this prevents is the most ordinary chart bug there is: a
 * defensible central value, plotted honestly, that a reader cannot help
 * reading as precision. Error bars do not fix it, because the eye lands on the
 * dot. So on these claims there is no dot at all — the span is the mark.
 *
 * The 65 are never listed here. They are recomputed from claims.json every
 * call, so a repair that widens or narrows an interval moves a claim in or out
 * of the set without anybody remembering to update a list.
 */

/** Mark kinds that put a single visual anchor at the central value. */
const POINT_MARKS = new Set(["point", "dot", "central", "centre", "center", "marker", "mark", "circle"]);
/** Mark kinds that draw the interval and nothing else. */
const SPAN_MARKS = new Set(["span", "interval", "band", "bar", "ribbon", "range", "bracket"]);

function readInterval(claim, guard) {
  if (!claim || typeof claim !== "object") {
    throw new GuardError(guard, "CLAIM REQUIRED", "expected a claim object.", claim,
      "pass a record from claims.json, with id, central and ci80");
  }
  const { central, ci80 } = claim;
  if (typeof central !== "number" || !Number.isFinite(central)) {
    throw new GuardError(guard, "CLAIM SHAPE",
      `claim ${claim.id || "(no id)"} has no finite numeric central.`, central,
      "repair the record; a claim without a central cannot be drawn at all");
  }
  if (!Array.isArray(ci80) || ci80.length !== 2 ||
      !ci80.every((v) => typeof v === "number" && Number.isFinite(v))) {
    throw new GuardError(guard, "CLAIM SHAPE",
      `claim ${claim.id || "(no id)"} has no [low, high] ci80.`, ci80,
      "repair the record; every claim in claims.json carries a two-number ci80");
  }
  const [low, high] = ci80;
  /* ORIENTATION. An inverted interval is the quiet way past this whole guard.
   * ci80 [360, 96] on a central of 192 gives (96 - 360) / 192 = -1.375. A
   * negative ratio is below every positive cut, so isWideInterval says false
   * and drawMark(claim, "point") returns "point" — on a claim whose interval
   * spans a factor of nearly four. The widest claim in the record would draw
   * as the most precise thing on the page.
   *
   * THE GUARD REFUSES; IT DOES NOT SORT. Sorting [high, low] into [low, high]
   * would make the chart right and leave claims.json wrong, so the next reader
   * of the record — the verifier, the prose audit, the next stage — still sees
   * the defect and this guard has quietly repaired it at draw time for them.
   * That is precisely the failure R3b cost four hours to: a gate that matched
   * on a value without checking what it referred to. A data defect is repaired
   * in the data, under a stage with a contract and a recorded supersession. */
  if (low > high) {
    throw new GuardError(guard, "CLAIM SHAPE",
      `claim ${claim.id || "(no id)"} carries an inverted ci80: low ${low} sits above ` +
      `high ${high}. Read in that order the interval measures ${high - low}, which is ` +
      `negative, which reads as narrower than every cut — so the widest claims in the ` +
      `record would be the ones that draw a central dot.`,
      { id: claim.id, central, ci80: [low, high] },
      "repair claims.json so ci80 reads [low, high]. This guard will not reorder it for " +
      "you: sorting it here would fix the picture and leave the record wrong");
  }
  /* And a central outside its own interval is the same class of defect wearing
   * different clothes: the ratio still computes, still reads as a width, and
   * still puts a dot somewhere the interval says the value is not. */
  if (central < low || central > high) {
    throw new GuardError(guard, "CLAIM SHAPE",
      `claim ${claim.id || "(no id)"} has a central of ${central} outside its own ` +
      `80% interval [${low}, ${high}]. A mark at the central would sit where the ` +
      `record says the value is not.`,
      { id: claim.id, central, ci80: [low, high] },
      "repair claims.json; the central must lie inside ci80");
  }
  return { central, low, high };
}

/**
 * THE INTERVAL READER, in public.
 *
 * `readInterval` is the only place in the project that decides what makes a
 * claim's interval readable: two finite numbers, in low-to-high order, with the
 * central inside them. Every other module that needs to know — the chart layer,
 * the motion layer's TREMOR fallback — calls this rather than carrying its own
 * opinion, because two modules with two opinions about a valid interval is the
 * defect this project has hit at every stage.
 *
 * It is deliberately the same function G1 uses, not a copy of it. It throws the
 * same GuardError with the same message, so a caller sees the guard that
 * refused, not a second-hand paraphrase of it.
 *
 * Returns `{ central, low, high }`. `guard` only labels the error.
 */
export function claimInterval(claim, guard = "G1") {
  return readInterval(claim, guard);
}

/** Interval width as a multiple of the central value. 1.375 means the interval is 137.5% of central. */
export function intervalRatio(claim) {
  const { central, low, high } = readInterval(claim, "G1");
  if (central === 0) return Infinity;
  return (high - low) / Math.abs(central);
}

/** BOOLEAN FORM. True when this claim must be drawn span-only. */
export function isWideInterval(claim, ratio = RULES.wideIntervalRatio) {
  return intervalRatio(claim) > ratio;
}

/** The only mark kind this claim may be drawn with: "span" or "point". */
export function markKindFor(claim, ratio = RULES.wideIntervalRatio) {
  return isWideInterval(claim, ratio) ? "span" : "point";
}

/**
 * THROWING FORM. Call this where a mark is about to be drawn.
 * Returns the requested kind when it is allowed, so it reads inline:
 *   const kind = drawMark(claim, wanted);
 */
export function drawMark(claim, kind, options = {}) {
  const ratio = options.ratio ?? RULES.wideIntervalRatio;
  const key = String(kind || "").toLowerCase();
  if (!POINT_MARKS.has(key) && !SPAN_MARKS.has(key)) {
    throw new WideIntervalError(
      "G1", "NO POINT ON A WIDE INTERVAL",
      `"${kind}" is not a mark kind this guard recognises, so it cannot tell ` +
      `whether it puts a dot at the central value.`,
      kind,
      `use one of the point kinds (${[...POINT_MARKS].join(", ")}) ` +
      `or the span kinds (${[...SPAN_MARKS].join(", ")})`
    );
  }
  /* Read the interval whatever the mark kind is. The wide-interval test below
   * only runs on point marks, so an unreadable or inverted ci80 used to reach
   * the chart unchecked as long as the caller asked for a span — and a span
   * drawn from [360, 96] is a bar of negative width. A claim this guard cannot
   * read is a claim it cannot let anyone draw, in either form. */
  readInterval(claim, "G1");
  if (POINT_MARKS.has(key) && isWideInterval(claim, ratio)) {
    const r = intervalRatio(claim);
    const { central, low, high } = readInterval(claim, "G1");
    throw new WideIntervalError(
      "G1", "NO POINT ON A WIDE INTERVAL",
      `claim ${claim.id} cannot carry a "${kind}" mark: its 80% interval is ` +
      `${(r * 100).toFixed(1)}% of its central value, over the ${(ratio * 100).toFixed(0)}% cut. ` +
      `There is no middle value to draw.`,
      { id: claim.id, central, ci80: [low, high], ratio: Number(r.toFixed(4)), unit: claim.unit },
      `draw it span-only — drawMark(claim, "span") — or ask markKindFor(claim) first`
    );
  }
  return key;
}

/** Alias with the rule in the name, for call sites that read better that way. */
export function assertNoPointOnWideInterval(claim, kind, options) {
  return drawMark(claim, kind, options);
}

/**
 * Census over the frozen record: which claims are span-only, and how many.
 * Reads claims.json. Used by the test page to prove the cut still selects the
 * 65 claims the design brief was written against.
 */
export function auditWideIntervals(claimsFile, ratio = RULES.wideIntervalRatio) {
  const file = requireFrozen("claims", "G1", claimsFile);
  const list = Array.isArray(file) ? file : file.claims;
  if (!Array.isArray(list) || list.length === 0) {
    throw new GuardVacuousError(
      "G1", "NO POINT ON A WIDE INTERVAL",
      "claims.json produced no claims, so this guard has nothing to measure against.",
      file && Object.keys(file),
      "check that claims.json still holds a `claims` array"
    );
  }
  const wide = list.filter((c) => isWideInterval(c, ratio));
  return { total: list.length, wide: wide.length, ratio, ids: wide.map((c) => c.id) };
}

/* ======================================================================
 * GUARD 2 · NO ORDER ON UNRANKED QUANTITIES
 * ====================================================================== */

/**
 * WHY THIS EXISTS.
 *
 * Era 7's national_brand, direct_response and local_retail cannot be ordered
 * against each other. Only their ordering against classified is established.
 * The reason is structural, not statistical: national_brand's dominant route
 * is a residual computed after direct_response is subtracted, so the two move
 * one-for-one, and an independent instrument (WARC/Ebiquity) reverses them
 * outright. Three lenses declare the pair unranked.
 *
 * The failure this prevents: any stack, any sort, any ordered list, any bar
 * chart with the tallest bar first. Each of those asserts an ordering with the
 * layout, silently, in a way no caption can take back. A reader who sees three
 * bars sorted by height has been told which pool is biggest. The record does
 * not know.
 *
 * Era 1 and era 5 carry unranked pairs too, and era 5's flip is caused by a
 * single classification choice worth 4.50 points of the 2000 market. So the
 * pairs are read from moneytype/reconciled.json by era, never hard-coded.
 */

const ORDERED_LAYOUTS = new Set([
  "sorted", "sort", "stack", "stacked", "streamgraph", "ranked", "rank",
  "ordered", "ordered-list", "list", "descending", "ascending", "pie", "treemap",
]);
const UNORDERED_LAYOUTS = new Set([
  "unordered", "span-panel", "overlap", "free", "shuffle", "fixed-position", "small-multiple",
]);

function pairKey(a, b) {
  /* No String() here on purpose. Every id reaching this function has already
   * been through poolId(), so a coercion at this point could only be hiding
   * something. See poolId for what the coercion used to cost. */
  return [a, b].sort().join("|");
}

/**
 * Read one pool id, and refuse anything that is not a non-empty string.
 *
 * THE BUG THIS EXISTS FOR. The pool readers used to say `p.id ?? p`, which is
 * the natural shorthand for "an id, or an object carrying one". It is also a
 * silent coercion. A pool object keyed by `name` rather than `id` has no `id`,
 * so `p.id ?? p` yields the object itself, `String(object)` yields
 * "[object Object]", both pools produce the same key, and that key matches no
 * unranked pair in the record. The result:
 *
 *     sortPools(7, [{name:'national_brand'}, {name:'direct_response'}], desc)
 *
 * returned era 7's two mutually unranked pools in sorted order, with no throw.
 * The rule was right. The input handling turned it off. A guard whose subject
 * is a stringified object is not guarding anything, and it cannot tell you so,
 * because "[object Object]" is a perfectly valid string.
 *
 * So: an id is a string or it is an error. There is no third case.
 */
function poolId(value, guard, where) {
  const id = value !== null && typeof value === "object"
    ? (Object.prototype.hasOwnProperty.call(value, "id") ? value.id : undefined)
    : value;
  if (typeof id !== "string" || id.trim() === "") {
    const isObject = value !== null && typeof value === "object";
    throw new UnrankedOrderError(
      guard, "NO ORDER ON UNRANKED QUANTITIES",
      `${where || "this call"} supplied a pool id that is not a string` +
      (isObject
        ? `: an object with keys [${Object.keys(value).join(", ")}] and no usable \`id\`. ` +
          `Coerced to a string it becomes "[object Object]", which matches no pair in ` +
          `reconciled.json, so every unranked pair would pass.`
        : ` but a ${value === null ? "null" : typeof value}. It matches no pair in ` +
          `reconciled.json, so every unranked pair would pass.`),
      value,
      "pass the pool id as a string, or an object with a string `id` — " +
      "sortPools(era, [{ id: \"national_brand\" }, …], compare)"
    );
  }
  return id;
}

/** Every pool id in a list, each one validated. Never coerces. */
function poolIds(pools, guard, where) {
  if (pools == null || typeof pools[Symbol.iterator] !== "function" || typeof pools === "string") {
    throw new UnrankedOrderError(
      guard, "NO ORDER ON UNRANKED QUANTITIES",
      `${where || "this call"} needs a list of pool ids or pool objects and got ` +
      `${pools === null ? "null" : typeof pools}.`,
      pools,
      'pass an array — assertRankable(7, ["national_brand", "direct_response"], "sort")'
    );
  }
  return [...pools].map((p) => poolId(p, guard, where));
}

/**
 * Every unranked pair in the record, keyed by era number.
 * Reads moneytype/reconciled.json → eras[].unranked_pairs[].pair.
 */
export function unrankedPairsByEra(reconciledFile) {
  const file = requireFrozen("reconciled", "G2", reconciledFile);
  const eras = file && file.eras;
  if (!Array.isArray(eras) || eras.length === 0) {
    throw new GuardVacuousError(
      "G2", "NO ORDER ON UNRANKED QUANTITIES",
      "reconciled.json produced no eras, so this guard knows of no unranked pairs " +
      "and would pass every sort put in front of it.",
      file && Object.keys(file),
      "check that moneytype/reconciled.json still holds an `eras` array"
    );
  }
  const byEra = new Map();
  let found = 0;
  for (const era of eras) {
    const map = new Map();
    for (const entry of era.unranked_pairs || []) {
      if (!Array.isArray(entry.pair) || entry.pair.length !== 2) continue;
      map.set(pairKey(entry.pair[0], entry.pair[1]), entry);
      found += 1;
    }
    byEra.set(era.era, map);
  }
  if (found === 0) {
    throw new GuardVacuousError(
      "G2", "NO ORDER ON UNRANKED QUANTITIES",
      "reconciled.json holds eras but not one unranked pair among them.",
      [...byEra.keys()],
      "check eras[].unranked_pairs — the guard has no parameters without it"
    );
  }
  return byEra;
}

/** The unranked pairs for one era, as a Map from "a|b" to the record entry. */
export function unrankedPairs(era, reconciledFile) {
  const byEra = unrankedPairsByEra(reconciledFile);
  if (!byEra.has(era)) {
    throw new GuardVacuousError(
      "G2", "NO ORDER ON UNRANKED QUANTITIES",
      `era ${era} has no entry in reconciled.json, so this guard cannot tell ` +
      `whether its quantities are rankable.`,
      { era, known: [...byEra.keys()] },
      "pass an era that reconciled.json covers, or add the era to the record"
    );
  }
  return byEra.get(era);
}

/**
 * The first unranked pair found among these ids, or null.
 * Every id is validated as a string first — see poolId.
 */
export function findUnrankedPair(era, ids, reconciledFile) {
  const pairs = unrankedPairs(era, reconciledFile);
  const list = poolIds(ids, "G2", "findUnrankedPair");
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      const entry = pairs.get(pairKey(list[i], list[j]));
      if (entry) return { pair: [list[i], list[j]], entry };
    }
  }
  return null;
}

/** BOOLEAN FORM. True when every pair among these ids is ordered by the record. */
export function isRankable(era, ids, reconciledFile) {
  return findUnrankedPair(era, ids, reconciledFile) === null;
}

/**
 * THROWING FORM. Call before any operation that imposes an order.
 * `operation` names what was about to happen, for the message: "sort", "stack",
 * "ordered list", "rank the legend".
 */
export function assertRankable(era, ids, operation, reconciledFile) {
  const list = poolIds(ids, "G2", `assertRankable(${era}, …, "${operation || "ordering"}")`);
  const hit = findUnrankedPair(era, list, reconciledFile);
  if (hit) {
    const reason = String(hit.entry.reason || hit.entry.verdict || "").slice(0, 240);
    throw new UnrankedOrderError(
      "G2", "NO ORDER ON UNRANKED QUANTITIES",
      `era ${era} cannot support a ${operation || "an ordering"} containing ` +
      `${hit.pair[0]} and ${hit.pair[1]}: the record carries that pair as unranked.`,
      { era, pair: hit.pair, verdict: hit.entry.verdict, ids: list, reason },
      "draw them at fixed positions with overlapping spans and no vertical axis; " +
      "print the centrals in a table instead of encoding them as order"
    );
  }
  return true;
}

/**
 * Sort pools only where the record supports it. Same shape as Array.sort's
 * comparator, but it refuses first.
 *
 * Pool ids are read through poolId(), which throws on anything that is not a
 * string. It used to read `p.id ?? p`; an object keyed by `name` then coerced
 * to "[object Object]", matched nothing, and this function returned era 7's
 * unranked pair in sorted order without a sound.
 */
export function sortPools(era, pools, compare, reconciledFile) {
  assertRankable(era, poolIds(pools, "G2", "sortPools"), "sort", reconciledFile);
  return [...pools].sort(compare);
}

/**
 * The call the design spec names by hand:
 *   renderPools(pools, "unranked", "sorted")  // throws
 *
 * `ordering` is what the caller claims the record supports; `layout` is how it
 * wants to draw. Both are checked, and the frozen record overrules the caller
 * — a caller that passes ordering:"ranked" over a genuinely unranked pair is
 * caught by the second test, not trusted by the first.
 */
export function renderPools(pools, ordering, layout, options = {}) {
  /* Validated up front, so no branch below can reach a coerced id. */
  const ids = poolIds(pools, "G2", "renderPools");
  const layoutKey = String(layout || "").toLowerCase();
  if (!ORDERED_LAYOUTS.has(layoutKey) && !UNORDERED_LAYOUTS.has(layoutKey)) {
    throw new UnrankedOrderError(
      "G2", "NO ORDER ON UNRANKED QUANTITIES",
      `"${layout}" is not a layout this guard recognises, so it cannot tell ` +
      `whether the layout encodes an order.`,
      layout,
      `use an ordered layout (${[...ORDERED_LAYOUTS].slice(0, 6).join(", ")}…) ` +
      `or an unordered one (${[...UNORDERED_LAYOUTS].join(", ")})`
    );
  }
  const encodesOrder = ORDERED_LAYOUTS.has(layoutKey);
  if (encodesOrder && String(ordering).toLowerCase() === "unranked") {
    throw new UnrankedOrderError(
      "G2", "NO ORDER ON UNRANKED QUANTITIES",
      `these pools are declared unranked and "${layout}" encodes an order in the layout.`,
      { ordering, layout, pools: ids },
      `render them with an unordered layout — renderPools(pools, "unranked", "span-panel")`
    );
  }
  if (encodesOrder) {
    const era = options.era ?? [...pools].map((p) => p && p.era).find((e) => e != null);
    if (era == null) {
      throw new GuardVacuousError(
        "G2", "NO ORDER ON UNRANKED QUANTITIES",
        "an ordered layout was requested but no era was given, so the guard " +
        "cannot look up which pairs the record can order.",
        { layout, pools: ids },
        "pass { era } in options, or carry `era` on each pool object"
      );
    }
    assertRankable(era, ids, layout, options.reconciled);
  }
  return { pools, ordering, layout: layoutKey, encodesOrder };
}

/* ======================================================================
 * GUARD 3 · NO SPLICE
 * ====================================================================== */

/**
 * WHY THIS EXISTS.
 *
 * Coen/McCann measures advertiser billings, bottom-up, at list price, across
 * eleven media. MAGNA measures media-owner revenue, top-down, across eight.
 * They are different objects wearing the same headline. 1980 is the only year
 * both publish, and they sit 23.43% apart there — of which roughly 69% is
 * category scope and only 7.2 points is price basis.
 *
 * The failure this prevents is one line running 1919 to 2025. It is the single
 * most attractive chart in this dataset and it is a lie: the reader sees a
 * 23% event in 1980 that never happened in the market, only in the ruler. The
 * rule is that where two rails overlap, both are drawn and the distance
 * between them is labelled. The gap is an object, not an embarrassment.
 *
 * Enforced on `source_series`, which every one of the 1,573 points carries.
 * A path builder that hits a change of source_series breaks the path.
 */

function pointSeries(point, guard) {
  if (!point || typeof point !== "object") {
    throw new GuardError(guard, "POINT REQUIRED", "expected a point object.", point,
      "pass points from adspend.json series[].points, which carry source_series");
  }
  const key = point.source_series;
  if (typeof key !== "string" || key === "") {
    throw new GuardError(guard, "POINT SHAPE",
      `a point at year ${point.year} carries no source_series, so this guard ` +
      `cannot tell what it measures.`,
      point,
      "every point in adspend.json has source_series; do not strip it when reshaping"
    );
  }
  return key;
}

/** BOOLEAN FORM. True when these two points may sit on the same path. */
export function canJoin(a, b) {
  return pointSeries(a, "G3") === pointSeries(b, "G3");
}

/** The published note on why two rails differ, read from adspend.json concordance. */
export function basisBreakNote(seriesA, seriesB, adspendFile) {
  const file = adspendFile != null ? adspendFile : (_frozen.adspend || null);
  if (!file || !Array.isArray(file.concordance)) return null;
  return file.concordance.find(
    (c) => (c.series_a === seriesA && c.series_b === seriesB) ||
           (c.series_a === seriesB && c.series_b === seriesA)
  ) || null;
}

/**
 * THROWING FORM. Every point in `points` must share one source_series.
 * `context` names the caller for the message ("the rails board main path").
 */
export function assertNoSplice(points, context, adspendFile) {
  const list = [...(points || [])];
  if (list.length < 2) return true;
  const first = pointSeries(list[0], "G3");
  for (let i = 1; i < list.length; i += 1) {
    const key = pointSeries(list[i], "G3");
    if (key !== first) {
      const note = basisBreakNote(first, key, adspendFile);
      const distance = note && note.magnitude
        ? ` The record measures them ${Math.abs(note.magnitude.raw_level_break_pct_1980)}% apart in 1980.`
        : "";
      throw new SpliceError(
        "G3", "NO SPLICE",
        `${context || "this path"} would join "${first}" to "${key}" at year ` +
        `${list[i].year}. They measure different objects.${distance}`,
        {
          context, at_year: list[i].year, from: first, to: key,
          note: note ? String(note.note).slice(0, 300) : null,
        },
        "draw both rails and label the distance between them; " +
        "use buildPath(points) to segment instead of assertNoSplice to permit"
      );
    }
  }
  return true;
}

/**
 * The path builder. It never splices — it breaks.
 *
 * Returns { segments, breaks, gaps }. A segment is one run of points sharing a
 * source_series and not straddling a documented hole. `breaks` describes every
 * place the path stopped and why, so the chart layer can draw the seam as
 * content rather than as an accident.
 *
 * BOTH RULES ARE ON BY DEFAULT. This function enforces G3 (no splice) and G5
 * (absence is an object) together, because a path is where both get broken.
 * `options.gaps` used to be optional and defaulted to nothing, so the shortest
 * call — buildPath(points) — drew one unbroken line across the 2008–2020 hole.
 * It now resolves through resolveGaps(), which reads adspend.json when nothing
 * is passed. See resolveGaps for the whole story.
 *
 *   buildPath(points)                       // reads the four documented holes
 *   buildPath(points, { gaps })             // scoped to one rail; must be non-empty
 *   buildPath(points, { adspend })          // pure, no registry
 */
export function buildPath(points, options = {}) {
  const list = [...(points || [])];
  const gaps = resolveGaps(options.gaps, "G5", options.adspend);
  const segments = [];
  const breaks = [];
  let current = null;
  for (const point of list) {
    const key = pointSeries(point, "G3");
    if (current && current.source_series === key) {
      const previous = current.points[current.points.length - 1];
      /* crossedGaps, not gapsBetween: the list was resolved once above, and
       * re-resolving it per step was what made a validation cache look
       * necessary. It filters; it does not re-authenticate. */
      const straddled = crossedGaps(previous.year, point.year, gaps);
      if (straddled.length > 0) {
        breaks.push({
          reason: "documented absence", at_year: point.year, from_year: previous.year,
          source_series: key, gaps: straddled,
        });
        current = null;
      }
    } else if (current) {
      breaks.push({
        reason: "different source_series", at_year: point.year,
        from: current.source_series, to: key,
      });
      current = null;
    }
    if (!current) {
      current = { source_series: key, points: [] };
      segments.push(current);
    }
    current.points.push(point);
  }
  return { segments, breaks, gaps };
}

/* ======================================================================
 * GUARD 4 · NO HARD-CODED SERIES LIST
 * ====================================================================== */

/**
 * WHY THIS EXISTS.
 *
 * The schema spec named five series. adspend.json holds eight. The three that
 * arrived later are the ones that carry the arguments: naa_newspaper is the
 * only source for the classified money-type axis, census_manufactures is the
 * only official enumerated cross-check before 1960, and bridge_mce_mg8 is the
 * bridge ribbon.
 *
 * The failure this prevents is silent and total. A chart that reads a literal
 * list of five keys renders perfectly, looks complete, and has dropped three
 * whole arguments. Nothing on screen says so. FREEZE.md opens its "three
 * things a builder must not get wrong" with exactly this.
 *
 * So the library reads the file's own keys, and a caller that passes a literal
 * array is refused by name.
 *
 * ----------------------------------------------------------------------
 * WHY THERE IS NO PREDICATE ANY MORE, AND NO SOURCE INSPECTION
 *
 * The previous version accepted a predicate and then READ THE PREDICATE'S OWN
 * SOURCE, refusing one that named two or more series keys as string literals.
 * It caught the obvious rewrite of the original mistake:
 *
 *     selectSeries(adspend, (k) => ["coen_mce","magna","iab_pwc",…].includes(k))
 *
 * and it could not catch the next one, which is one line longer:
 *
 *     const RAILS = ["coen_mce","magna","iab_pwc","irs_soi","benchmarks_pre1919"];
 *     selectSeries(adspend, (k) => RAILS.includes(k));      // source names no keys
 *     selectSeries(adspend, ((k) => RAILS.includes(k)).bind(null));  // "[native code]"
 *
 * The second line defeats the scan by moving the array one line up. The third
 * defeats it by name: the scan had a branch that returned "nothing enumerated"
 * for any function whose toString says `[native code]`, which is every bound
 * function. Both drop the same three series. Both looked like the supported
 * call. A detector reading source is playing a game the caller always wins,
 * because a caller can always express the same subset another way.
 *
 * SO THE SHAPE IS REFUSED INSTEAD OF DETECTED, AND EVERY SELECTION THAT DROPS A
 * SERIES CARRIES A WRITTEN REASON. There are three forms and no fourth:
 *
 *     selectSeries(adspend, "all")                                // every series
 *     selectSeries(adspend, { role: "stitch", because: "…" })     // a declared property
 *     selectSeries(adspend, { role: …, access: …, because: "…" }) // conjunction of them
 *     selectSeries(adspend, { only: [...], because: "…" })        // a written subset
 *
 * The property forms are answered by the record, so they cannot go stale: a
 * series added to adspend.json turns up in them without anybody editing a call
 * site. Every field name must be a field the record's series actually carry and
 * every value must be one the record holds, so a typo is refused with the real
 * values beside it instead of quietly selecting nothing.
 *
 * ----------------------------------------------------------------------
 * AND THEN THE CRITERIA FORM REOPENED THE HOLE IT WAS BUILT TO CLOSE, TWICE.
 *
 * (1) A FIELD THAT IS A KEY WEARING A DISGUISE. adspend.json's series carry
 *     `compiler`, `measures`, `why_added` and `as_of_convention`, and every
 *     value of each names exactly one series. So `{ compiler: "MAGNA Global
 *     (IPG Mediabrands)" }` is `{ key: "magna" }` with a longer string in it,
 *     and eight of those calls rebuild the five-series list with no reason
 *     written anywhere. `{ key: … }` had been removed for exactly this reason
 *     and walked straight back in through the record's own metadata. A field is
 *     now selectable only when it has FEWER distinct values than series carrying
 *     it — that is, only when it describes a group, which is the only thing this
 *     form is for. See seriesFieldIndex.
 *
 * (2) THE REASON WAS ATTACHED TO THE SYNTAX, NOT TO THE OUTCOME.
 *     `{ role: "stitch" }` returns five series and silently drops
 *     census_manufactures and bridge_mce_mg8 — two of the three this guard is
 *     named for — because the `because` requirement keyed off the word `only`.
 *     That call is the form the guard's OWN error message recommended. The
 *     requirement now attaches to what came back: any selection that leaves a
 *     series off the chart needs the sentence, whichever form asked for it.
 *
 * `because` is validated — present, a string, long enough and worded enough to
 * be a thought rather than "todo". It is greppable, so anyone auditing which
 * charts are not drawing the whole record finds every one of them in a second.
 *
 * THE POINT IS NOT THAT THE GUARD NOW CATCHES THE FIVE-KEY LIST. It is that a
 * developer who wants five series must write down that they are dropping three
 * and why. That is a decision a reviewer can see, rather than a bug a scanner
 * has to catch — and no scanner ever caught it twice running.
 */

/** The series keys the file actually holds. This is the only correct source of them. */
export function seriesKeys(adspendFile) {
  const file = requireFrozen("adspend", "G4", adspendFile);
  const series = file && file.series;
  if (!series || typeof series !== "object") {
    throw new GuardVacuousError(
      "G4", "NO HARD-CODED SERIES LIST",
      "adspend.json produced no `series` object, so this guard has no key set " +
      "to compare a caller's list against.",
      file && Object.keys(file),
      "check that adspend.json still holds a `series` object"
    );
  }
  const keys = Object.keys(series);
  if (keys.length === 0) {
    throw new GuardVacuousError(
      "G4", "NO HARD-CODED SERIES LIST",
      "adspend.json holds a `series` object with no keys in it.",
      keys, "check the frozen file"
    );
  }
  return keys;
}

/** What each series carries, for an error message that says what a caller dropped. */
export function seriesDigest(key, adspendFile) {
  const file = requireFrozen("adspend", "G4", adspendFile);
  const s = (file.series || {})[key];
  if (!s) return { key, missing: true };
  return {
    key,
    role: s.role,
    coverage: s.coverage,
    beyond_schema_spec: s.added_beyond_schema_spec === true,
    carries: String(s.why_added || s.measures || "").slice(0, 200),
  };
}

/** BOOLEAN FORM. True when `requested` covers every key in the file. */
export function isSeriesListComplete(requested, adspendFile) {
  const have = new Set(requested || []);
  return seriesKeys(adspendFile).every((k) => have.has(k));
}

/**
 * THROWING FORM. Use where a caller must pass an explicit list — an ordered
 * legend, say. The message names the missing keys and what each one carries.
 */
export function assertSeriesListComplete(requested, adspendFile, context) {
  const all = seriesKeys(adspendFile);
  const have = new Set(requested || []);
  const missing = all.filter((k) => !have.has(k));
  const unknown = [...have].filter((k) => !all.includes(k));
  if (unknown.length > 0) {
    throw new SeriesListError(
      "G4", "NO HARD-CODED SERIES LIST",
      `${context || "this chart"} names series that adspend.json does not hold: ${unknown.join(", ")}.`,
      { unknown, file_holds: all },
      "read the keys from the file — seriesKeys(adspend)"
    );
  }
  if (missing.length > 0) {
    throw new SeriesListError(
      "G4", "NO HARD-CODED SERIES LIST",
      `${context || "this chart"} reads ${have.size} of the ${all.length} series in ` +
      `adspend.json and drops ${missing.length}.`,
      { missing: missing.map((k) => seriesDigest(k, adspendFile)) },
      'do not write the list down — call selectSeries(adspend, "all"); if the subset is ' +
      'deliberate, say so and say why: selectSeries(adspend, { role: …, because: "…" }) ' +
      'or selectSeries(adspend, { only: [...], because: "…" })'
    );
  }
  return true;
}

/** The roles adspend.json's own series carry. The only valid role strings. */
export function seriesRoles(adspendFile) {
  const file = requireFrozen("adspend", "G4", adspendFile);
  const roles = new Set();
  for (const key of seriesKeys(file)) {
    const role = file.series[key] && file.series[key].role;
    if (typeof role === "string" && role !== "") roles.add(role);
  }
  if (roles.size === 0) {
    throw new GuardVacuousError(
      "G4", "NO HARD-CODED SERIES LIST",
      "not one series in adspend.json carries a `role`, so a role selector can " +
      "never match and every role-based subset would come back empty.",
      seriesKeys(file),
      "check adspend.json → series[].role"
    );
  }
  return [...roles];
}

/**
 * The scalar fields of the record's series, split into the ones a selection may
 * be made of and the ones that are a series key wearing a different name.
 *
 * WHY THE SPLIT EXISTS, and it is the hole that reopened this guard twice.
 *
 * The criteria form was built so a selection would be answered by the record and
 * could not go stale. It is only that if the field PARTITIONS the record. A
 * field whose every value names exactly one series does not partition anything
 * — it enumerates. adspend.json carries four of them: `compiler`, `measures`,
 * `why_added` and `as_of_convention`. So:
 *
 *     selectSeries(adspend, { compiler: "MAGNA Global (IPG Mediabrands)" })
 *
 * is `{ key: "magna" }` with a longer string in it, and eight such calls rebuild
 * the exact five-series list this guard exists to prevent, with nothing written
 * down anywhere. `{ key: … }` was removed for precisely this reason and then
 * walked back in through the record's own metadata.
 *
 * So a field is selectable only when it has fewer distinct values than it has
 * series carrying it. A field where the two counts are equal cannot describe a
 * group, and describing a group is the only thing the criteria form is for.
 * Naming series individually is still allowed — through `{ only, because }`,
 * which makes the caller write down that they are doing it.
 *
 * Only scalar fields are considered at all. `points`, `coverage` and
 * `known_breaks` are arrays and objects — they are the series' contents, not its
 * identity, and a selection made of them would be a selection made of the data
 * being drawn.
 *
 * A DOCUMENTED LIMIT. The test is per FIELD, not per value. `access` in the
 * frozen record holds 7 distinct values across 8 series, so it passes — and six
 * of those seven values still name exactly one series. A near-key is not caught
 * here. It is caught by the other half of the rule: a selection that drops
 * series carries a written reason whatever field it was made of, so
 * `{ access: "LICENSED…" }` costs a sentence like every other subset. Both
 * halves are needed; neither alone is enough.
 *
 * Returns `{ selectable: { field: [values…] }, keyLike: { field: {carriers, distinct} } }`.
 */
function seriesFieldIndex(adspendFile) {
  const file = requireFrozen("adspend", "G4", adspendFile);
  const keys = seriesKeys(file);
  const values = new Map();
  const carriers = new Map();
  for (const key of keys) {
    for (const [field, value] of Object.entries(file.series[key] || {})) {
      if (value === null || typeof value === "object" || typeof value === "function") continue;
      if (!values.has(field)) { values.set(field, new Set()); carriers.set(field, 0); }
      values.get(field).add(value);
      carriers.set(field, carriers.get(field) + 1);
    }
  }
  const selectable = {};
  const keyLike = {};
  for (const [field, set] of values) {
    if (set.size >= carriers.get(field)) keyLike[field] = { carriers: carriers.get(field), distinct: set.size };
    else selectable[field] = [...set];
  }
  if (values.size === 0) {
    throw new GuardVacuousError(
      "G4", "NO HARD-CODED SERIES LIST",
      "not one series in adspend.json carries a scalar field, so there is nothing to " +
      "select on and every selection would have to be made by naming keys.",
      keys,
      "check adspend.json → series[].role and the rest of the series metadata"
    );
  }
  if (Object.keys(selectable).length === 0) {
    throw new GuardVacuousError(
      "G4", "NO HARD-CODED SERIES LIST",
      "every scalar field in adspend.json is unique per series, so not one of them groups " +
      "the record and the criteria form can only be used to name series one at a time. " +
      "This guard will not offer a selector that is enumeration with a grammar around it.",
      { key_like: keyLike, series: keys.length },
      'select with "all", or name the series you want and say why: ' +
      '{ only: [...], because: "…" }'
    );
  }
  return { selectable, keyLike, keys };
}

/**
 * The fields a declared-property selection may be made of, and the values each
 * one holds. Read out of adspend.json every call, so a field added to the record
 * becomes selectable without anyone editing this file, and a field removed from
 * the record stops being selectable in the same instant.
 *
 * A field whose every value names exactly one series is NOT here — see
 * seriesFieldIndex. Use seriesKeyLikeFields() to see which ones were refused.
 *
 * Returns `{ field: [values…] }`.
 */
export function seriesFields(adspendFile) {
  return seriesFieldIndex(adspendFile).selectable;
}

/**
 * The scalar fields this guard refuses to select on, with the counts that made
 * the call. Exported so a developer who reaches for `{ compiler: … }` can see
 * why it is not there rather than assume the field is missing from the record.
 */
export function seriesKeyLikeFields(adspendFile) {
  return seriesFieldIndex(adspendFile).keyLike;
}

/** The three forms selectSeries accepts, quoted verbatim in every refusal. */
const SELECT_SERIES_FORMS = [
  'selectSeries(adspend, "all")                                   // drops nothing, needs no reason',
  'selectSeries(adspend, { role: "stitch", because: "…" })        // a grouping field the record declares',
  'selectSeries(adspend, { only: [...], because: "why these and not the others" })',
];

/** Words that are the shape of a reason without being one. */
const _NON_REASONS = new Set([
  "todo", "tbd", "t.b.d", "na", "n/a", "none", "nil", "reason", "reasons", "because",
  "why", "wip", "fixme", "xxx", "temp", "temporary", "test", "testing", "placeholder",
  "for now", "see above", "obvious", "as discussed", "it is needed", "we need it",
]);

/**
 * Validate the written reason on a selection that does not draw the whole record.
 *
 * The reason is the whole point of the form. It is what a reviewer reads in a
 * diff, and what a grep for `because:` turns up when somebody asks which charts
 * are not drawing the whole record. So it has to be a sentence a person wrote:
 * present, a string, long enough and worded enough to carry a thought. "todo"
 * is not a reason, and neither is "reason".
 *
 * `dropped` is the digest of what this selection leaves out, or null when the
 * caller is naming keys and the requirement attaches to the written list itself.
 */
function assertWrittenReason(value, who, selector, dropped) {
  const bad = writtenReasonProblem(value);
  if (!bad) return String(value).trim();
  throw new SeriesListError(
    "G4", "NO HARD-CODED SERIES LIST",
    dropped
      ? `${who} selected a subset that drops ${dropped.length} of adspend.json's series ` +
        `(${dropped.map((d) => d.key).join(", ")}) and its \`because\` ${bad}. The reason ` +
        `requirement is on the OUTCOME, not on the syntax: a criteria object that leaves ` +
        `series off the chart is the same decision as writing their keys down, and it used ` +
        `to cost nothing to make.`
      : `${who} named an explicit subset of series and its \`because\` ${bad}. The reason is ` +
        `the entire reason this form exists: a written subset is a decision, and a decision ` +
        `with no reason attached is indistinguishable from the bug this guard was built for.`,
    { because: value, selector, dropped: dropped || undefined },
    'write the sentence — { only: [...], because: "the rails board draws the two ' +
    'stitch rails only; the cross-checks are a separate panel" }, or ' +
    '{ role: "stitch", because: "…" } — it is greppable and it is what a reviewer reads'
  );
}

/**
 * THE ONLY WAY TO TAKE A SUBSET. Three forms, and nothing else:
 *
 *     selectSeries(adspend, "all")
 *     selectSeries(adspend, { role: "stitch", because: "…" })
 *     selectSeries(adspend, { role: "stitch", access: "free", because: "…" })  // conjunction
 *     selectSeries(adspend, { only: ["coen_mce", "magna"],
 *                             because: "the rails board draws the stitch pair" })
 *
 * WHY IT IS SHAPED LIKE THIS.
 *
 * The two earlier versions tried to DETECT a written-down list — first by
 * refusing an array, then by reading a predicate's own source. Both lost,
 * because a caller can always express the same subset another way: the array
 * moves one line up into a `const`, the predicate gets `.bind()`ed and reports
 * `[native code]`, and the same three series vanish from the chart either way.
 *
 * So the shape is refused instead. `"all"` and a declared-property selection
 * cannot go stale: they are answered by the record, so a series added to
 * adspend.json appears in them without anybody editing a call site. Everything
 * else — every selection that names keys — must be written as `{ only, because }`,
 * which is not harder to write than the bug was. It is just impossible to write
 * by accident, and it leaves a sentence in the diff saying which series are
 * being dropped and why.
 *
 * The point is not that the guard now catches the five-key list. It is that a
 * developer who wants five series has to write down that they are dropping
 * three, and why — a decision a reviewer can see, rather than a bug a scanner
 * has to catch.
 *
 * REFUSED, each by name:
 *  - a predicate (it names the three replacements and says why it is gone);
 *  - a bare array (the original mistake, and its shape);
 *  - any bare string other than "all" (a role now says `{ role: … }`, so the
 *    reader of the call site can see which field is being selected on);
 *  - a criteria VALUE that is an array, Set or object — a list is a list
 *    wherever you put it;
 *  - a criteria FIELD whose every value names exactly one series, because such a
 *    field enumerates the record instead of grouping it and is `{ key: … }` in
 *    a costume;
 *  - a field or a value the record does not carry — a typo used to select
 *    nothing and render a blank chart that looked deliberate;
 *  - `only` and `role` together, `only` without `because`, ANY selection that
 *    drops a series without `because`, and a `because` that is not a written
 *    reason;
 *  - a selection that comes back empty, for the blank-chart reason again.
 */
export function selectSeries(adspendFile, selector, context) {
  const file = requireFrozen("adspend", "G4", adspendFile);
  const who = context || "this caller";
  const keys = seriesKeys(file);
  const forms = SELECT_SERIES_FORMS.join("\n              ");

  if (typeof selector === "function") {
    throw new SeriesListError(
      "G4", "NO HARD-CODED SERIES LIST",
      `${who} selected series with a predicate. Predicates are no longer accepted at all. ` +
      `This guard used to take one and then read its SOURCE for hard-coded keys, which a ` +
      `caller defeats by moving the array one line up into a const, or by binding the ` +
      `function so its source reads "[native code]" — the second of those was granted an ` +
      `exemption by name, which is not an exemption, it is a hole. A subset is now ` +
      `described, not computed.`,
      String(selector).slice(0, 200),
      `use one of the three forms:\n              ${forms}`
    );
  }

  if (Array.isArray(selector)) {
    throw new SeriesListError(
      "G4", "NO HARD-CODED SERIES LIST",
      `${who} selected series with a bare literal array. adspend.json holds ${keys.length}; ` +
      `a written list goes stale the moment the record gains a series, and nothing on ` +
      `screen will say so. A written list is still allowed — but it has to say why.`,
      selector,
      `use one of the three forms:\n              ${forms}`
    );
  }

  if (selector === "all") {
    const out = {};
    for (const key of keys) out[key] = file.series[key];
    return out;
  }

  if (typeof selector === "string") {
    const roles = seriesRoles(file);
    throw new SeriesListError(
      "G4", "NO HARD-CODED SERIES LIST",
      `${who} selected series with the bare string "${selector}". The only bare string is ` +
      `"all"` + (roles.includes(selector)
        ? `. "${selector}" is a role the file carries, and a role selection now names its ` +
          `field, so a reader of the call site can see what is being selected on.`
        : `, and "${selector}" is not a role the file carries either.`),
      { selector, roles_in_the_file: roles },
      roles.includes(selector)
        ? `write it as { role: ${JSON.stringify(selector)} }`
        : `use one of the three forms:\n              ${forms}`
    );
  }

  if (selector === null || typeof selector !== "object" ||
      selector instanceof Set || selector instanceof Map) {
    throw new SeriesListError(
      "G4", "NO HARD-CODED SERIES LIST",
      `${who} selected series with ${selector === null ? "null" : "a " + typeof selector}` +
      `${selector instanceof Set ? " (a Set)" : ""}${selector instanceof Map ? " (a Map)" : ""}, ` +
      `which is none of the three forms. That used to fall through to a role comparison no ` +
      `series could satisfy, and come back with zero series — an empty chart that looks ` +
      `deliberate.`,
      selector,
      `use one of the three forms:\n              ${forms}`
    );
  }

  const hasOnly = Object.prototype.hasOwnProperty.call(selector, "only");
  const hasBecause = Object.prototype.hasOwnProperty.call(selector, "because");
  const criteriaFields = Object.keys(selector).filter((k) => k !== "only" && k !== "because");

  /* ---- form three: the explicit, reasoned opt-out ---- */
  if (hasOnly) {
    if (criteriaFields.length > 0) {
      throw new SeriesListError(
        "G4", "NO HARD-CODED SERIES LIST",
        `${who} mixed an explicit \`only\` list with the declared-property fields ` +
        `${criteriaFields.join(", ")}. Those are two different arguments about which series ` +
        `belong on the chart, and read together neither one is checkable.`,
        selector,
        'pick one: { role: "stitch", because: "…" } for a property the record declares, or ' +
        '{ only: [...], because: "…" } for a list you are writing down on purpose'
      );
    }
    if (!Array.isArray(selector.only) || selector.only.length === 0 ||
        !selector.only.every((k) => typeof k === "string" && k.trim() !== "")) {
      throw new SeriesListError(
        "G4", "NO HARD-CODED SERIES LIST",
        `${who} gave an \`only\` that is not a non-empty array of series keys.`,
        selector.only,
        `name keys the file holds: ${keys.join(", ")}`
      );
    }
    const asked = [...selector.only];
    const unknown = asked.filter((k) => !keys.includes(k));
    if (unknown.length > 0) {
      throw new SeriesListError(
        "G4", "NO HARD-CODED SERIES LIST",
        `${who} named series adspend.json does not hold: ${unknown.join(", ")}. A key that ` +
        `does not exist selects nothing, and the chart renders short without complaint.`,
        { unknown, file_holds: keys },
        `read the keys from the file — seriesKeys(adspend)`
      );
    }
    const duplicates = asked.filter((k, i) => asked.indexOf(k) !== i);
    if (duplicates.length > 0) {
      throw new SeriesListError(
        "G4", "NO HARD-CODED SERIES LIST",
        `${who} named ${duplicates.join(", ")} twice. A list this guard is being asked to ` +
        `trust has to be one somebody read back.`,
        asked, "remove the duplicate"
      );
    }
    assertWrittenReason(selector.because, who, selector, null);
    const out = {};
    for (const key of keys) if (asked.includes(key)) out[key] = file.series[key];
    return out;
  }

  /* ---- form two: a property the record itself declares ---- */
  const { selectable: fields, keyLike } = seriesFieldIndex(file);
  const selectable = Object.keys(fields).join(", ");
  const entries = Object.entries(selector).filter(([k]) => k !== "because");
  if (entries.length === 0) {
    throw new SeriesListError(
      "G4", "NO HARD-CODED SERIES LIST",
      hasBecause
        ? `${who} gave a \`because\` and named no subset for it to apply to, so there is a ` +
          `reason on record and nothing it explains.`
        : `${who} selected series with an empty criteria object, which describes no subset at all.`,
      selector,
      `use one of the three forms:\n              ${forms}`
    );
  }
  for (const [field, value] of entries) {
    if (Object.prototype.hasOwnProperty.call(keyLike, field)) {
      const counts = keyLike[field];
      throw new SeriesListError(
        "G4", "NO HARD-CODED SERIES LIST",
        `${who} selected series on "${field}". Every one of that field's values names exactly ` +
        `one series — ${counts.carriers} series carry it and it holds ${counts.distinct} ` +
        `distinct values — so it does not group the record, it enumerates it. A criteria ` +
        `object made of a field like this is a hard-coded series list with the record's own ` +
        `metadata standing in for the keys: ${counts.carriers} such calls rebuild exactly the ` +
        `list this guard exists to prevent, and not one of them has to say why.`,
        { requested: field, key_like_fields: keyLike, selectable_fields: Object.keys(fields) },
        `select on a field that describes a group (${selectable}), or name the series and ` +
        `say why: { only: [...], because: "…" }`
      );
    }
    if (!Object.prototype.hasOwnProperty.call(fields, field)) {
      throw new SeriesListError(
        "G4", "NO HARD-CODED SERIES LIST",
        `${who} selected series on "${field}", which is not a field adspend.json's series ` +
        `carry. The selection would have matched nothing and the chart would have ` +
        `rendered blank without complaint.`,
        { requested: field, fields_in_the_file: Object.keys(fields), key_like_fields: keyLike },
        `use one of: ${selectable} — or read them with seriesFields(adspend). To name ` +
        `series by key, say so: { only: [...], because: "…" }`
      );
    }
    if (value === null || typeof value === "object" || typeof value === "function") {
      throw new SeriesListError(
        "G4", "NO HARD-CODED SERIES LIST",
        `${who} gave "${field}" ${Array.isArray(value) ? "a list" : "a " + (value === null ? "null" : typeof value)} ` +
        `of values. A criteria value is one value the record carries; a list of them is a ` +
        `hard-coded series list with a different name on it.`,
        { [field]: value },
        `name one value — { ${field}: ${JSON.stringify(fields[field][0])} } — or write the ` +
        `list down properly: { only: [...], because: "…" }`
      );
    }
    if (!fields[field].includes(value)) {
      throw new SeriesListError(
        "G4", "NO HARD-CODED SERIES LIST",
        `${who} selected series where ${field} is ${JSON.stringify(value)}, which no series ` +
        `in adspend.json carries. The selection would have been empty and the chart ` +
        `would have rendered blank without complaint.`,
        { field, requested: value, values_in_the_file: fields[field] },
        `use one of: ${fields[field].map((v) => JSON.stringify(v)).join(", ")}`
      );
    }
  }

  const out = {};
  for (const key of keys) {
    const series = file.series[key];
    if (entries.every(([field, value]) => series[field] === value)) out[key] = series;
  }
  if (Object.keys(out).length === 0) {
    throw new SeriesListError(
      "G4", "NO HARD-CODED SERIES LIST",
      `${who} selected zero of the ${keys.length} series in adspend.json: every field and ` +
      `value is one the record carries, but no single series carries all of them at once. ` +
      `A chart with no series in it renders as an empty frame, and an empty frame reads ` +
      `as a deliberate design rather than as a selection that matched nothing.`,
      { criteria: selector, file_holds: keys },
      "drop a criterion, or check the combination against seriesFields(adspend)"
    );
  }
  /* THE REASON REQUIREMENT IS ON THE OUTCOME, NOT ON THE SYNTAX.
   *
   * `{ role: "stitch" }` returns five series and drops census_manufactures and
   * bridge_mce_mg8 — two of the three the guard is named for — and it used to do
   * it for free, because the requirement was attached to the `only` KEYWORD
   * rather than to the fact that series came off the chart. Worse, that call is
   * the form this guard's own error messages recommended.
   *
   * A selection answered by the record still cannot go stale, and that is worth
   * keeping. But a selection that leaves series out is a decision either way,
   * and the sentence is what a reviewer reads. */
  const dropped = keys.filter((k) => !Object.prototype.hasOwnProperty.call(out, k));
  if (dropped.length > 0) {
    assertWrittenReason(selector.because, who, selector,
      dropped.map((k) => seriesDigest(k, file)));
  }
  return out;
}

/* ======================================================================
 * GUARD 5 · ABSENCE IS AN OBJECT
 * ====================================================================== */

/**
 * WHY THIS EXISTS.
 *
 * The record has four documented holes: 1840–1866 (no estimate of US
 * advertising of any kind exists), 1867–1918 (benchmark years only, never
 * interpolated), 2008–2020 (no free annual total between Coen's last year and
 * MAGNA's press releases) and 2011–2025 (no free by-medium series).
 *
 * Two failures this prevents. The first is interpolation: a line drawn from
 * 2007 to 2021 invents thirteen years of data, and it is the most natural
 * thing in the world for a charting library to do. The second is whitespace:
 * a gap left blank reads as zero, or as nothing worth mentioning, when the
 * absence is itself one of the piece's findings — the fifteen years the
 * project cares most about are the least measurable in the whole window.
 *
 * So a hole is drawn as a named thing with a texture, and a path that crosses
 * one breaks. The gaps are read from adspend.json, never listed here.
 */

/**
 * The documented holes, from adspend.json → bridge.gaps_not_bridged.
 *
 * These are holes in the TOTAL rail. They are not automatically holes in every
 * series — iab_pwc publishes every year through 2025 inside the 2011–2025
 * by-medium gap. Scope them to the rail you are drawing, or use
 * seriesYearGaps() for the holes a single series has in its own coverage.
 */
export function coverageGaps(adspendFile) {
  const file = requireFrozen("adspend", "G5", adspendFile);
  const raw = file.bridge && file.bridge.gaps_not_bridged;
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new GuardVacuousError(
      "G5", "ABSENCE IS AN OBJECT",
      "adspend.json lists no gaps_not_bridged, so this guard knows of no holes " +
      "and would let a path interpolate across every one of them.",
      file.bridge && Object.keys(file.bridge),
      "check adspend.json → bridge.gaps_not_bridged"
    );
  }
  /* Frozen on the way out. This constructor used to hand back a live array that
   * resolveGaps had pre-authenticated, so `const g = coverageGaps(); g.length =
   * 0; g.push({ years: [3000, 3001], … })` produced a decoy the guard trusted on
   * sight. A gap list is a finding read off the record; nothing downstream has
   * any business editing one. */
  return freezeGaps(raw.map((g) => ({
    id: `gap-${g.years[0]}-${g.years[1]}`,
    years: [g.years[0], g.years[1]],
    reason: g.reason,
  })));
}

/* ----------------------------------------------------------------------
 * IDENTITY, NOT A FLAG.
 *
 * Two things in this guard used to be authenticated by reading a property off
 * the caller's own object, which is not authentication at all:
 *
 *   1. The declared-empty sentinel was recognised by `gaps.declaredEmpty ===
 *      true`. So the exemption the docstring called greppable could be forged
 *      inline, in one expression, by a caller who never looked at the record:
 *
 *          buildPath(points, { gaps: Object.assign([], { declaredEmpty: true }) })
 *
 *      That is the empty-gap-list bypass with a costume on. It is shorter than
 *      importing the sentinel, so it is what a hurried person writes.
 *
 *   2. A non-empty gap list was checked for SHAPE and never for CONTENT, so a
 *      decoy passed: `[{ years: [3000, 3001], reason: "…" }]` is well-formed,
 *      non-empty, forward-running, and guards nothing, because the record has
 *      no data anywhere near it. A path drawn under it crosses every real hole
 *      untouched while the guard reports itself switched on.
 *
 * Both are now authenticated on identity. A declared-empty list is one THIS
 * MODULE minted — membership of a module-private WeakSet a caller cannot reach
 * — and a non-empty list must intersect an absence the record actually has.
 * ---------------------------------------------------------------------- */

/** Gap lists this module minted as deliberately empty. Not reachable from outside. */
const _DECLARED_EMPTY = new WeakSet();

/**
 * THERE IS NO VALIDATION CACHE, AND THIS IS WHY.
 *
 * There was one: a WeakSet of gap lists resolveGaps had already checked, tested
 * at the top of the function, above the shape checks and above the reality
 * check. It was added so a path builder would not re-derive the record's absence
 * set on every step. It reopened, in full, the hole the reality check had just
 * closed — because a WeakSet keys on OBJECT IDENTITY and a gap array is
 * mutable, so what got cached was "this object was once valid", not "this
 * content is valid":
 *
 *     const gaps = [{ years: [2008, 2020], reason: "the real hole" }];
 *     buildPath(points, { gaps });        // validated, and remembered
 *     gaps[0].years = [3000, 3001];       // same object, now a decoy
 *     buildPath(points, { gaps });        // one segment, zero breaks
 *
 * That second call draws one unbroken line straight across the documented
 * 2008–2020 hole, with the guard reporting itself switched on. The module's own
 * sanctioned constructors were worse: they pre-authenticated their result, so
 * emptying and refilling one produced a trusted decoy in two statements.
 *
 * The cache is gone. Validation runs on content, every time, and every validated
 * list is DEEP-FROZEN so there is no post-validation mutation to catch. The cost
 * is re-checking four gaps against a per-file absence set that is itself derived
 * once, and the path builder does not pay even that — it resolves once and then
 * filters, rather than re-resolving on every step.
 */
function freezeGaps(list) {
  for (const gap of list) {
    if (gap && typeof gap === "object") {
      if (Array.isArray(gap.years)) Object.freeze(gap.years);
      Object.freeze(gap);
    }
  }
  return Object.freeze(list);
}

function mintDeclaredEmpty(why) {
  const list = Object.freeze(Object.assign([], { why }));
  _DECLARED_EMPTY.add(list);
  return list;
}

/**
 * THE ONLY EMPTY GAP LIST THIS GUARD ACCEPTS.
 *
 * A rail really can have no documented hole — seriesYearGaps() returns this
 * when a series publishes every year it covers. But a bare `[]` is
 * indistinguishable from a caller who never looked, so a bare `[]` is refused
 * and this is the way to say it out loud. It is greppable, which a `[]` is not:
 * anyone auditing what is unguarded can find every one of these in a second.
 *
 * It is authenticated BY IDENTITY. There is no `declaredEmpty` flag to copy any
 * more; the guard asks whether this exact object came from this module. Import
 * it, or call declareNoDocumentedGaps(reason) — there is no third way to make
 * one, which is the point.
 */
export const NO_DOCUMENTED_GAPS = mintDeclaredEmpty("this rail carries no documented hole");

/**
 * Mint a declared-empty gap list carrying your own reason.
 *
 * Use this instead of NO_DOCUMENTED_GAPS when the exemption is worth a sentence
 * — the sentence is what a reviewer reads. The result is frozen and cannot be
 * forged: only this function and this module's own computations produce one.
 */
export function declareNoDocumentedGaps(reason) {
  const text = typeof reason === "string" ? reason.trim() : "";
  if (text.length < 12) {
    throw new GuardVacuousError(
      "G5", "ABSENCE IS AN OBJECT",
      "a declared-empty gap list is an exemption from the guard, and an exemption with " +
      "no written reason is the bare `[]` this guard already refuses.",
      reason,
      'say why this rail has no hole — declareNoDocumentedGaps("iab_pwc publishes every ' +
      'year of its coverage") — or import NO_DOCUMENTED_GAPS if the stock reason fits'
    );
  }
  return mintDeclaredEmpty(text);
}

function isDeclaredEmpty(gaps) {
  return Array.isArray(gaps) && gaps.length === 0 && _DECLARED_EMPTY.has(gaps);
}

/**
 * Cache of the record's real absences, keyed by the adspend object itself.
 *
 * A DOCUMENTED LIMIT, and the reader who has just come from freezeGaps is right
 * to be suspicious of it. This is an identity-keyed memo too. The difference is
 * what it keys ON: the FROZEN RECORD, installed through setFrozen, not a list a
 * caller hands to a guard. Editing that object after the first derivation leaves
 * this memo stale — and anyone who can edit it can install a different record
 * outright, so there is nothing here a memo is protecting. It is not re-derived
 * per call because it is O(every point in the file).
 *
 * The gap-list cache was different in kind: it authenticated CALLER DATA on
 * identity, which is the mistake, and it is gone.
 */
const _ABSENCES = new WeakMap();

/**
 * Every year range the record actually has nothing in, from two sources:
 *
 *   - bridge.gaps_not_bridged — the documented holes in the TOTAL rail;
 *   - each series' own internal year holes, because a gap list is often scoped
 *     to one rail and those holes are real absences too.
 *
 * This is the set a declared gap has to intersect. It is finite, it is read out
 * of adspend.json, and it is what makes "years: [3000, 3001]" impossible to
 * pass off as a documented hole.
 */
function recordAbsences(file) {
  if (_ABSENCES.has(file)) return _ABSENCES.get(file);
  const out = [];
  const documented = (file.bridge && file.bridge.gaps_not_bridged) || [];
  for (const gap of documented) {
    if (Array.isArray(gap.years) && gap.years.length === 2) {
      out.push({ years: [gap.years[0], gap.years[1]], source: "bridge.gaps_not_bridged" });
    }
  }
  for (const [key, series] of Object.entries(file.series || {})) {
    const years = [...new Set((series.points || []).map((p) => p.year))]
      .filter((y) => Number.isFinite(y)).sort((a, b) => a - b);
    for (let i = 1; i < years.length; i += 1) {
      if (years[i] - years[i - 1] > 1) {
        out.push({ years: [years[i - 1] + 1, years[i] - 1], source: `series ${key}` });
      }
    }
  }
  _ABSENCES.set(file, out);
  return out;
}

/**
 * A declared gap must overlap an absence the record actually has.
 *
 * The shape checks below catch a gap that is malformed. This catches one that
 * is well-formed and false — the decoy. A gap the record does not recognise is
 * either a typo, a year range from a different dataset, or an alibi, and all
 * three leave the real holes unguarded while the call looks configured.
 */
function assertGapsAreReal(gaps, guard, adspendFile) {
  const file = requireFrozen("adspend", guard, adspendFile);
  const absences = recordAbsences(file);
  if (absences.length === 0) {
    throw new GuardVacuousError(
      guard, "ABSENCE IS AN OBJECT",
      "adspend.json shows no absence anywhere — no documented hole and no series with a " +
      "hole in its own years — so this guard cannot tell a real gap from an invented one.",
      { series: Object.keys(file.series || {}).length },
      "check adspend.json → bridge.gaps_not_bridged and series[].points"
    );
  }
  gaps.forEach((g, i) => {
    const overlaps = absences.some(
      (a) => a.years[0] <= g.years[1] && g.years[0] <= a.years[1]);
    if (!overlaps) {
      throw new AbsenceError(
        guard, "ABSENCE IS AN OBJECT",
        `gap ${i} covers ${g.years[0]}–${g.years[1]}, where adspend.json has no absence at ` +
        `all — not a documented hole, and not a hole in any series' own years. A gap the ` +
        `record does not recognise guards nothing, and a list containing one reports this ` +
        `guard as switched on while every real hole goes uncovered.`,
        { gap: g, record_absences: absences.slice(0, 8).map((a) => `${a.years[0]}–${a.years[1]} (${a.source})`) },
        "omit the argument and the guard reads coverageGaps(adspend), or scope it with " +
        "seriesYearGaps(key) — both are computed from the record and both validate"
      );
    }
  });
}

/**
 * Resolve the gap list a G5 call will guard against, and make the safe thing
 * the default.
 *
 * THE BUG THIS EXISTS FOR — and it was the worst one in this file.
 *
 *     buildPath(points)
 *
 * is the shortest and most natural way to call the path builder, and it used
 * to draw one unbroken line from 2007 to 2021: one segment, zero breaks, no
 * throw, straight across the documented 2008–2020 hole. `gaps` was an optional
 * option, and its default was the unsafe one. The guard whose entire job is to
 * stop a line crossing a hole did nothing at all unless you remembered to
 * configure it, and nothing on screen would ever have said so. A guard that
 * only works when you remember to configure it is a comment.
 *
 * So the default now READS THE RECORD. Omit `gaps` and you get
 * coverageGaps(adspend) — the four documented holes, from the frozen file. If
 * adspend.json is not loaded, coverageGaps throws and the call refuses to run.
 * Either way the laziest correct-looking call is now the safe one.
 *
 * An explicit `gaps` is still honoured, because the total-rail holes are not
 * the holes of every series — iab_pwc publishes through 2025 inside the
 * 2011–2025 by-medium gap. It must be non-empty or the declared-empty sentinel
 * (authenticated on identity, not on a flag anyone can set), and every gap in
 * it must intersect an absence the record actually has.
 *
 * IT RE-VALIDATES ON EVERY CALL, and returns a DEEP-FROZEN list. There is no
 * "already checked this one" shortcut, because the shortcut that existed here
 * keyed on object identity and a validated list could then be refilled with a
 * decoy. See freezeGaps for the whole story.
 */
export function resolveGaps(gaps, guard, adspendFile) {
  if (gaps == null) return coverageGaps(adspendFile);
  if (!Array.isArray(gaps)) {
    throw new GuardError(
      guard, "ABSENCE IS AN OBJECT",
      `the gap list must be an array of absence objects and is a ${typeof gaps}.`,
      gaps,
      "omit it and the guard reads coverageGaps(adspend) for you, which is the " +
      "safe default; pass one only to scope it to a single rail"
    );
  }
  if (gaps.length === 0) {
    if (isDeclaredEmpty(gaps)) return gaps;
    throw new GuardVacuousError(
      guard, "ABSENCE IS AN OBJECT",
      "an empty gap list was passed, so this guard would let a path interpolate " +
      "across every documented hole in the record while appearing to be switched on. " +
      "It is not the declared-empty sentinel either: that one is recognised by identity, " +
      "so an object carrying a `declaredEmpty` property does not qualify — the flag was " +
      "forgeable inline and this is what replaced it.",
      gaps,
      "omit the argument entirely — the guard then reads coverageGaps(adspend) — or, " +
      "if this rail genuinely has no documented hole, import NO_DOCUMENTED_GAPS or call " +
      "declareNoDocumentedGaps(reason), so the exemption is greppable and minted here"
    );
  }
  gaps.forEach((g, i) => {
    if (!g || !Array.isArray(g.years) || g.years.length !== 2 ||
        !g.years.every((y) => typeof y === "number" && Number.isFinite(y))) {
      throw new GuardError(
        guard, "ABSENCE IS AN OBJECT",
        `gap ${i} has no two-number \`years\` range, so this guard cannot tell what ` +
        `it covers and would skip it.`,
        g,
        "shape gaps like coverageGaps() does: { id, years: [from, to], reason }"
      );
    }
    if (g.years[0] > g.years[1]) {
      throw new GuardError(
        guard, "ABSENCE IS AN OBJECT",
        `gap ${i} runs backwards: [${g.years[0]}, ${g.years[1]}]. gapsBetween tests ` +
        `years[1] > lo && years[0] < hi, so a reversed range matches nothing and the ` +
        `hole silently stops being guarded.`,
        g,
        "write the range as [from, to] with from <= to"
      );
    }
  });
  assertGapsAreReal(gaps, guard, adspendFile);
  /* Frozen on the way out, so the object that passed cannot become a different
   * object afterwards. This is what replaced the validation cache: the cache
   * remembered an IDENTITY that had once been valid, which a caller could then
   * refill with a decoy. Freezing makes the question moot instead of answering
   * it wrong. */
  return freezeGaps(gaps);
}

/** Pure filter over an already-resolved list. No validation, no registry read. */
function crossedGaps(fromYear, toYear, list) {
  const lo = Math.min(fromYear, toYear);
  const hi = Math.max(fromYear, toYear);
  return list.filter((g) => g.years[1] > lo && g.years[0] < hi);
}

/**
 * The gaps a step from `fromYear` to `toYear` would cross.
 * A gap counts when it overlaps the open interval between the two years — so
 * 1919→1920 crosses nothing, and 2007→2021 crosses 2008–2020.
 *
 * `gaps` is resolved through resolveGaps, so omitting it reads the record
 * rather than quietly answering "crosses nothing". `adspendFile` is threaded
 * through for the pure, no-registry call — it used to be absent, which worked
 * only because the validation cache was hiding the second resolve.
 */
export function gapsBetween(fromYear, toYear, gaps, adspendFile) {
  return crossedGaps(fromYear, toYear, resolveGaps(gaps, "G5", adspendFile));
}

/**
 * The holes a single series has in its own annual coverage, as absence
 * objects shaped like coverageGaps(). A hole is any run of years with no
 * point, longer than `step` (default 1: annual).
 *
 * Returns NO_DOCUMENTED_GAPS rather than a bare `[]` when the series has none,
 * so the result can be handed straight to buildPath without tripping the
 * empty-list refusal — a computed empty is not the same thing as a forgotten one.
 */
export function seriesYearGaps(seriesKey, adspendFile, step = 1) {
  const file = requireFrozen("adspend", "G5", adspendFile);
  const series = (file.series || {})[seriesKey];
  if (!series) {
    throw new GuardVacuousError(
      "G5", "ABSENCE IS AN OBJECT",
      `adspend.json holds no series "${seriesKey}", so this guard cannot find its holes.`,
      { seriesKey, known: Object.keys(file.series || {}) },
      "pass a key from seriesKeys(adspend)"
    );
  }
  const years = [...new Set((series.points || []).map((p) => p.year))].sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < years.length; i += 1) {
    if (years[i] - years[i - 1] > step) {
      gaps.push({
        id: `gap-${seriesKey}-${years[i - 1] + 1}-${years[i] - 1}`,
        years: [years[i - 1] + 1, years[i] - 1],
        reason: `${seriesKey} publishes no value for these years`,
      });
    }
  }
  if (gaps.length === 0) return NO_DOCUMENTED_GAPS;
  /* Frozen for the same reason coverageGaps' result is: a constructor that hands
   * back a live array is a constructor that hands back a forgeable one. */
  return freezeGaps(gaps);
}

function absenceProblems(gap, rendered) {
  const covering = (rendered || []).filter(
    (r) => r && Array.isArray(r.years) && r.years[0] <= gap.years[0] && r.years[1] >= gap.years[1]
  );
  if (covering.length === 0) return "nothing is drawn over it";
  const usable = covering.find(
    (r) => RULES.absenceForms.includes(String(r.form || "").toLowerCase()) &&
           String(r.label || "").trim() !== ""
  );
  if (usable) return null;
  const shown = covering[0];
  if (!RULES.absenceForms.includes(String(shown.form || "").toLowerCase())) {
    return `the object drawn over it has form "${shown.form}", which is not a drawn texture`;
  }
  return "the object drawn over it has no label";
}

/**
 * BOOLEAN FORM. True when every gap has a named, textured object over it.
 * Omitting `gaps` reads the record, for the same reason buildPath does.
 */
export function isAbsenceDrawn(gaps, rendered, adspendFile) {
  return resolveGaps(gaps, "G5", adspendFile).every((g) => absenceProblems(g, rendered) === null);
}

/**
 * THROWING FORM. `rendered` is what the chart layer says it drew:
 *   [{ years: [2008, 2020], label: "no continuous rail", form: "stipple" }]
 *
 * `gaps` resolves through resolveGaps(). It used to iterate `gaps || []`, so
 * assertAbsenceDrawn(undefined, []) — a chart that drew nothing over any hole —
 * returned true. The same bypass as buildPath, in the other half of the guard.
 */
export function assertAbsenceDrawn(gaps, rendered, context, adspendFile) {
  for (const gap of resolveGaps(gaps, "G5", adspendFile)) {
    const problem = absenceProblems(gap, rendered);
    if (problem) {
      throw new AbsenceError(
        "G5", "ABSENCE IS AN OBJECT",
        `${context || "this chart"} covers ${gap.years[0]}–${gap.years[1]} but ${problem}. ` +
        `The record's reason for the hole is: ${gap.reason}`,
        { gap, rendered },
        `draw it as a named object — { years: [${gap.years[0]}, ${gap.years[1]}], ` +
        `label: "…", form: "${RULES.absenceForms[0]}" } — never as whitespace`
      );
    }
  }
  return true;
}

/**
 * THROWING FORM. A run of points must not step over a documented hole.
 * Call it on each segment buildPath returns, or on any point list about to
 * become a line.
 *
 * `gaps` is optional and resolves through resolveGaps(), so
 * `assertNoInterpolation(points)` reads the four documented holes out of
 * adspend.json rather than checking a line against nothing. It caught the
 * 2007→2021 line only when you remembered to hand it the gap list; now it
 * catches it either way.
 */
export function assertNoInterpolation(points, gaps, context, adspendFile) {
  const list = [...(points || [])];
  const resolved = resolveGaps(gaps, "G5", adspendFile);
  for (let i = 1; i < list.length; i += 1) {
    const from = list[i - 1].year;
    const to = list[i].year;
    const straddled = crossedGaps(from, to, resolved);
    if (straddled.length > 0) {
      throw new AbsenceError(
        "G5", "ABSENCE IS AN OBJECT",
        `${context || "this path"} runs straight from ${from} to ${to}, across ` +
        `${straddled.map((g) => `${g.years[0]}–${g.years[1]}`).join(", ")}, where the ` +
        `record has nothing. ${straddled[0].reason}`,
        { from, to, gaps: straddled },
        "break the path with buildPath(points, { gaps }) and draw the hole as an object"
      );
    }
  }
  return true;
}

/* ======================================================================
 * GUARD 6 · THE CROSS-ERA TAXONOMY
 * ====================================================================== */

/**
 * WHY THIS EXISTS.
 *
 * Era 5 carries two money-type taxonomies on purpose, declared as a seam at
 * Gate B rather than resolved. `by_money_type` splits Yellow Pages money by
 * advertiser geography (the era-native rule). `by_money_type_alt` puts all
 * directory money in one intent pool, which is what eras 6 and 7 and the
 * dataset's own grouping already do (the cross-era comparable rule).
 *
 * The block that moves is $11,135m — 4.50 points of the 2000 US market. It is
 * enough to reverse which of local_retail and direct_response leads. Under the
 * geographic rule local leads 28.32 to 24.71; under the unified rule direct
 * response leads 29.21 to 23.82. The flip is exact and that one block is its
 * sole cause.
 *
 * The failure this prevents: a chart that sets era 5 beside era 6 using era
 * 5's native numbers crosses an undocumented redefinition worth 4.50 points,
 * and shows a market reversal that is a classification artifact. Nobody
 * looking at the finished picture could tell.
 *
 * The two claim sets are read from reconciled.json → taxonomy_seam, and the
 * field names are resolved through era-5.json, so neither is written here.
 */

function taxonomySeam(reconciledFile) {
  const file = requireFrozen("reconciled", "G6", reconciledFile);
  const seam = file.taxonomy_seam;
  const rules = seam && seam.the_two_rules;
  if (!rules || typeof rules !== "object") {
    throw new GuardVacuousError(
      "G6", "THE CROSS-ERA TAXONOMY",
      "reconciled.json carries no taxonomy_seam.the_two_rules, so this guard " +
      "cannot tell the two taxonomies apart and would pass any mixture of them.",
      file && Object.keys(file),
      "check moneytype/reconciled.json → taxonomy_seam"
    );
  }
  let crossEra = null;
  let eraNative = null;
  for (const [key, rule] of Object.entries(rules)) {
    const label = String(rule.label || "").toLowerCase();
    const entry = {
      key,
      tag: rule.taxonomy_tag || key,
      label: rule.label,
      claims: new Set(rule.claims || []),
    };
    if (label.includes("cross-era")) crossEra = entry;
    else if (label.includes("era-native") || label.includes("native")) eraNative = entry;
  }
  if (!crossEra && typeof seam.cross_era_comparable_basis === "string") {
    const named = seam.cross_era_comparable_basis.trim().split(/[.\s]/)[0];
    const rule = rules[named];
    if (rule) {
      crossEra = { key: named, tag: rule.taxonomy_tag || named, label: rule.label, claims: new Set(rule.claims || []) };
    }
  }
  if (!crossEra || !eraNative || crossEra.claims.size === 0 || eraNative.claims.size === 0) {
    throw new GuardVacuousError(
      "G6", "THE CROSS-ERA TAXONOMY",
      "the taxonomy seam does not resolve to two named rules each holding claims.",
      { crossEra: crossEra && crossEra.key, eraNative: eraNative && eraNative.key },
      "check taxonomy_seam.the_two_rules — each needs a label and a claims list"
    );
  }
  return { crossEra, eraNative };
}

/** { crossEra, eraNative }, each { key, tag, label, claims:Set }. */
export function taxonomyRules(reconciledFile) {
  return taxonomySeam(reconciledFile);
}

/**
 * How much money the seam moves, read from the record rather than typed here.
 *
 * These two numbers used to be spelled into G6's error messages by hand — a
 * literal "$11,135m of 2000 directory money" and a literal "4.50 points of the
 * 2000 market". An error message is read at the exact moment somebody is
 * deciding what is true, so a figure that has drifted from the frozen file
 * teaches the wrong number at the worst possible time, with the authority of
 * a thrown error behind it. They are now derived, and the guard refuses to
 * describe the seam if the record no longer measures it.
 *
 * Returns { usdMillions, points, block, usd, pp } — the last two preformatted
 * for a message.
 */
export function taxonomySeamFigures(reconciledFile) {
  const file = requireFrozen("reconciled", "G6", reconciledFile);
  const seam = file.taxonomy_seam || {};
  const moves = seam.what_moves || {};
  const magnitude = seam.magnitude || {};
  const usdMillions = firstFiniteNumber([
    moves.usd_millions, moves.delta_usd_millions, magnitude.local_leg_usd_millions,
  ]);
  const points = firstFiniteNumber([
    moves.percentage_points_of_the_2000_us_total, magnitude.local_leg_pp,
  ]);
  if (usdMillions == null || points == null) {
    throw new GuardVacuousError(
      "G6", "THE CROSS-ERA TAXONOMY",
      "reconciled.json no longer measures how much money the taxonomy seam moves, so " +
      "this guard cannot say what a cross-era chart on the wrong rule would be worth. " +
      "It will not fall back to a number typed into the guard.",
      { what_moves: Object.keys(moves), magnitude: Object.keys(magnitude) },
      "check moneytype/reconciled.json → taxonomy_seam.what_moves.usd_millions and " +
      ".percentage_points_of_the_2000_us_total"
    );
  }
  return {
    usdMillions,
    points,
    block: moves.block || magnitude.block || "the directory block",
    year: magnitude.year ?? null,
    usd: `$${Math.round(usdMillions).toLocaleString("en-US")}m`,
    pp: points.toFixed(2),
  };
}

function firstFiniteNumber(candidates) {
  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value)) return Math.abs(value);
  }
  return null;
}

/** Which taxonomy a claim id belongs to: the rule's tag, or null if the claim is neutral. */
export function taxonomyOf(claimId, reconciledFile) {
  const { crossEra, eraNative } = taxonomySeam(reconciledFile);
  if (crossEra.claims.has(claimId)) return crossEra.tag;
  if (eraNative.claims.has(claimId)) return eraNative.tag;
  return null;
}

/** The taxonomy tag a given scope must use. scope: "cross-era" | "era-native". */
export function requiredTaxonomy(scope, reconciledFile) {
  const { crossEra, eraNative } = taxonomySeam(reconciledFile);
  const key = String(scope || "").toLowerCase();
  if (key === "cross-era" || key === "crossera") return crossEra.tag;
  if (key === "era-native" || key === "native") return eraNative.tag;
  throw new TaxonomyMixError(
    "G6", "THE CROSS-ERA TAXONOMY",
    `"${scope}" is not a scope this guard recognises.`, scope,
    'pass "cross-era" for any view that sets era 5 beside another era, ' +
    'or "era-native" for era 5 on its own terms'
  );
}

/**
 * Which taxonomy an era-5 field carries, resolved through the record rather
 * than by matching the field's name. Reads eras/era-5.json.
 *   taxonomyOfField("SCALE", "by_money_type_alt")  ->  "unified-intent"
 */
export function taxonomyOfField(fieldGroup, fieldName, era5File, reconciledFile) {
  const era5 = requireFrozen("era5", "G6", era5File);
  const group = era5.fields && era5.fields[fieldGroup];
  const split = group && group[fieldName];
  if (!split || typeof split !== "object") {
    throw new GuardVacuousError(
      "G6", "THE CROSS-ERA TAXONOMY",
      `era-5.json has no fields.${fieldGroup}.${fieldName}, so this guard cannot ` +
      `resolve which taxonomy that field carries.`,
      { fieldGroup, fieldName, groups: era5.fields && Object.keys(era5.fields) },
      "pass a field group and split name that era-5.json holds"
    );
  }
  const ids = Object.values(split).map((pool) => pool && pool.id).filter(Boolean);
  const tags = new Set(ids.map((id) => taxonomyOf(id, reconciledFile)).filter(Boolean));
  if (tags.size !== 1) {
    throw new GuardVacuousError(
      "G6", "THE CROSS-ERA TAXONOMY",
      `fields.${fieldGroup}.${fieldName} resolves to ${tags.size} taxonomies, not one.`,
      { ids, tags: [...tags] },
      "check that taxonomy_seam's claim lists still match era-5.json's field ids"
    );
  }
  return [...tags][0];
}

/** BOOLEAN FORM. True when this view uses one taxonomy and it is the right one. */
export function isTaxonomyConsistent(view, reconciledFile) {
  try {
    assertTaxonomy(view, reconciledFile);
    return true;
  } catch (error) {
    if (error instanceof TaxonomyMixError) return false;
    throw error;
  }
}

/** Which taxonomies a view's claim ids belong to, as tag -> ids. */
function taxonomiesUsed(ids, reconciledFile) {
  const seen = new Map();
  for (const id of ids) {
    const tag = taxonomyOf(id, reconciledFile);
    if (!tag) continue;
    if (!seen.has(tag)) seen.set(tag, []);
    seen.get(tag).push(id);
  }
  return seen;
}

/**
 * HALF THE GUARD, UNDER ITS OWN NAME: one view may not hold claims from both
 * taxonomies. Says nothing about whether the one it holds is the right one for
 * where it is being drawn — that is the scope half, and it lives in
 * assertTaxonomy.
 *
 * WHY THIS HAS A NAME OF ITS OWN. `scope` used to be optional on
 * assertTaxonomy, so this:
 *
 *     assertTaxonomy({ claimIds })
 *
 * ran only the mixing half and passed a cross-era chart built entirely on era-5
 * native numbers — the exact failure G6 exists to prevent, through the guard
 * that prevents it, silently, because one property was missing. An omission
 * that changes which rules run must not be spelled as an absent key. So scope
 * is required over there, and a caller who genuinely only wants the mixing test
 * asks for it by name here. The name is the declaration.
 */
export function assertNoTaxonomyMix(view, reconciledFile) {
  const { crossEra, eraNative } = taxonomySeam(reconciledFile);
  const ids = [...(view && view.claimIds || [])];
  const context = (view && view.context) || "this view";
  /* A view that names no claims has told this guard nothing, and both halves
   * would return true on it. That is the empty-gap-list mistake in G6's
   * clothes: a call that looks like a check and checks nothing. Ids that are
   * present but carry no taxonomy tag are a different thing — the view simply
   * does not touch the seam — and those pass. */
  if (ids.length === 0) {
    throw new GuardVacuousError(
      "G6", "THE CROSS-ERA TAXONOMY",
      `${context} was checked against the taxonomy seam without naming a single claim, ` +
      `so this guard had nothing to read and would have returned true whatever the ` +
      `view draws.`,
      { given: view ? Object.keys(view) : view },
      "pass claimIds: the ids the view actually reads. If it reads none of era 5's " +
      "money-type claims, it does not need this guard at all"
    );
  }
  const seen = taxonomiesUsed(ids, reconciledFile);
  if (seen.size > 1) {
    const figures = taxonomySeamFigures(reconciledFile);
    throw new TaxonomyMixError(
      "G6", "THE CROSS-ERA TAXONOMY",
      `${context} mixes era 5's two money-type taxonomies in one view. They differ ` +
      `by ${figures.usd} of ${figures.block} and they order local_retail and ` +
      `direct_response in opposite directions.`,
      Object.fromEntries(seen),
      `pick one — ${crossEra.tag} for anything cross-era, ${eraNative.tag} for era 5 alone`
    );
  }
  return seen;
}

/**
 * THROWING FORM, both halves.
 *   assertTaxonomy({ scope: "cross-era", claimIds: [...], context: "the four-era table" })
 *
 * Throws on two things: a view holding claims from both taxonomies, and a view
 * whose scope requires one taxonomy but reads the other.
 *
 * `scope` is REQUIRED. It is the half that knows whether era 5 is being set
 * beside another era, and it is the half a cross-era chart on era-native
 * numbers fails. Omitting it used to leave that half switched off with nothing
 * to show for it; it now throws GuardVacuousError and names
 * assertNoTaxonomyMix() as the way to ask for the other half alone.
 */
export function assertTaxonomy(view, reconciledFile) {
  const { crossEra, eraNative } = taxonomySeam(reconciledFile);
  const context = (view && view.context) || "this view";
  /* The mix test runs first: it is the more specific finding, and a view that
   * holds both taxonomies is broken whatever scope it was going to declare. */
  const seen = assertNoTaxonomyMix(view, reconciledFile);

  if (!view || view.scope == null || String(view.scope).trim() === "") {
    throw new GuardVacuousError(
      "G6", "THE CROSS-ERA TAXONOMY",
      `${context} called assertTaxonomy without a scope, so only the mixing half of ` +
      `this guard could run. The half that did not run is the one that catches a ` +
      `cross-era chart built on era 5's native numbers — which is consistent with ` +
      `itself, passes the mixing test, and is the failure G6 exists for.`,
      { given: view ? Object.keys(view) : view },
      'pass scope: "cross-era" for any view that sets era 5 beside another era, or ' +
      'scope: "era-native" for era 5 on its own terms. If you really only want the ' +
      "mixing test, call assertNoTaxonomyMix(view) — it says so in its name"
    );
  }

  const required = requiredTaxonomy(view.scope, reconciledFile);
  const [used] = [...seen.keys()];
  if (used && used !== required) {
    const otherRule = required === crossEra.tag ? crossEra : eraNative;
    const figures = taxonomySeamFigures(reconciledFile);
    throw new TaxonomyMixError(
      "G6", "THE CROSS-ERA TAXONOMY",
      `${context} is scoped "${view.scope}" and must read the ${required} taxonomy, ` +
      `but it reads ${used}. Splicing era 5's ${used} shares to another era crosses ` +
      `an undocumented redefinition worth ${figures.pp} points of the ` +
      `${figures.year != null ? figures.year + " " : ""}market.`,
      { scope: view.scope, used, required, claimIds: seen.get(used) },
      `read the ${required} claims instead: ${[...otherRule.claims].join(", ")}`
    );
  }
  return true;
}

/** THROWING FORM, field flavour: a cross-era view must read the alt split. */
export function assertTaxonomyField(scope, fieldGroup, fieldName, options = {}) {
  const required = requiredTaxonomy(scope, options.reconciled);
  const used = taxonomyOfField(fieldGroup, fieldName, options.era5, options.reconciled);
  if (used !== required) {
    throw new TaxonomyMixError(
      "G6", "THE CROSS-ERA TAXONOMY",
      `${options.context || "this view"} is scoped "${scope}" and reads ` +
      `fields.${fieldGroup}.${fieldName}, which carries the ${used} taxonomy. ` +
      `It must read the ${required} one.`,
      { scope, fieldGroup, fieldName, used, required },
      "cross-era views read by_money_type_alt; era 5's own chapter reads by_money_type"
    );
  }
  return true;
}

/* ======================================================================
 * GUARD 7 · THE DEAD-MECHANISM GUARD
 * ====================================================================== */

/**
 * WHY THIS EXISTS.
 *
 * The auction bench teaches the 2002 quality-weighted second-price auction.
 * In 2019 two things happened on opposite sides of Google's business, in
 * opposite directions. Google Ad Manager — the open-web DISPLAY exchange —
 * moved to a unified first-price auction on 5 September 2019. Google SEARCH
 * did not, and never has; the 2019 search change was rGSP, a randomised
 * generalised second-price auction that the DOJ record shows was an explicit
 * revenue play.
 *
 * The failure this prevents is the single most-repeated factual error about
 * 2019. mechanism.json calls it "the standard error in retellings of the 2019
 * transition". A simulator is a very effective way to teach a wrong thing,
 * because the reader does not experience it as a claim — they experience it as
 * something they worked out themselves. This piece must not add to that pile.
 *
 * The guard derives the channel-to-mechanism map from mechanism.json rather
 * than asserting it, and refuses to run if the three sentences it derives from
 * are no longer in the record.
 */

const DEAD_MECHANISM_PROBES = [
  {
    id: "search-never-first-price",
    test: (s) => /search/i.test(s) && /(never|not)\b[^.]{0,60}first[- ]price|first[- ]price[^.]{0,80}\b(never|not)\b/i.test(s),
    describes: "search never moved to first price",
  },
  {
    id: "display-went-first-price-2019",
    test: (s) => /display/i.test(s) && /first[- ]price/i.test(s) && /2019/.test(s),
    describes: "display moved to unified first price in 2019",
  },
  {
    id: "search-got-rgsp-2019",
    test: (s) => /rgsp/i.test(s) && /search/i.test(s) && /2019/.test(s),
    describes: "search got rGSP in 2019",
  },
];

function collectStrings(node, out = [], depth = 0) {
  if (depth > 12) return out;
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) for (const v of node) collectStrings(v, out, depth + 1);
  else if (node && typeof node === "object") for (const v of Object.values(node)) collectStrings(v, out, depth + 1);
  return out;
}

/**
 * The 2019 map, derived from the frozen record: { display: "first_price",
 * search: "rgsp", evidence: [...] }. Throws GuardVacuousError if the record no
 * longer supports all three probes — a guard that has lost its grounding must
 * not keep quietly passing.
 */
/**
 * The date display moved, read out of the record.
 *
 * G7's error message used to end with the literal sentence "Display moved to
 * unified first price on 2019-09-05". The date is in mechanism.json in six
 * places; typing it into the guard as well creates a seventh copy that no
 * verifier checks, in the one place a developer is most likely to believe it.
 * So it is derived: the most-repeated ISO date among the strings that talk
 * about display (or Ad Manager) and first price at once.
 */
function displayFirstPriceDate(strings) {
  const counts = new Map();
  for (const text of strings) {
    if (!/first[- ]price/i.test(text)) continue;
    if (!/display|ad manager|adx|exchange/i.test(text)) continue;
    for (const match of text.matchAll(/\b(\d{4}-\d{2}-\d{2})\b/g)) {
      counts.set(match[1], (counts.get(match[1]) || 0) + 1);
    }
  }
  let best = null;
  for (const [date, n] of counts) {
    if (!best || n > best.n || (n === best.n && date < best.date)) best = { date, n };
  }
  return best ? best.date : null;
}

export function mechanism2019(mechanismFile) {
  const file = requireFrozen("mechanism", "G7", mechanismFile);
  const strings = collectStrings(file);
  const evidence = [];
  const missing = [];
  for (const probe of DEAD_MECHANISM_PROBES) {
    const hit = strings.find(probe.test);
    if (hit) evidence.push({ probe: probe.id, describes: probe.describes, quote: hit.slice(0, 220) });
    else missing.push(probe);
  }
  if (missing.length > 0) {
    throw new GuardVacuousError(
      "G7", "THE DEAD-MECHANISM GUARD",
      `mechanism.json no longer states ${missing.map((p) => `"${p.describes}"`).join(" or ")}, ` +
      `so this guard cannot derive what 2019 actually did and must not pretend to.`,
      { missing: missing.map((p) => p.id), strings_scanned: strings.length },
      "restore the record, or re-derive the guard's probes against the new shape " +
      "of mechanism.json — do not delete the guard"
    );
  }
  const date = displayFirstPriceDate(strings);
  if (!date) {
    throw new GuardVacuousError(
      "G7", "THE DEAD-MECHANISM GUARD",
      "mechanism.json carries no dated statement of the display first-price move, so " +
      "this guard cannot say when it happened. It will not fall back to a date typed " +
      "into the guard — that is how a stale figure gets taught inside an error message.",
      { strings_scanned: strings.length },
      "check mechanism.json → engines.auction.designs.first_price_shading (its name and " +
      "its evidence calibration both carry the ISO date)"
    );
  }
  return {
    display: "first_price",
    search: "rgsp",
    year: Number(date.slice(0, 4)),
    displayFirstPriceDate: date,
    evidence,
  };
}

/** The keys of mechanism2019() that name a channel, as opposed to metadata. */
const MECHANISM_CHANNELS = Object.freeze(["display", "search"]);
const normaliseMechanism = (value) =>
  String(value || "").toLowerCase().replace(/[\s-]/g, "_");

/** BOOLEAN FORM. True when { channel, mechanism } matches the record for 2019. */
export function isMechanism2019Correct(assertion, mechanismFile) {
  const map = mechanism2019(mechanismFile);
  const channel = String(assertion && assertion.channel || "").toLowerCase();
  const mechanism = normaliseMechanism(assertion && assertion.mechanism);
  if (!MECHANISM_CHANNELS.includes(channel)) return false;
  return map[channel] === mechanism;
}

/**
 * THROWING FORM, structured flavour. Call on any scenario, toggle state or
 * data record that asserts what a channel's 2019 mechanism was.
 *   assertMechanism2019({ channel: "search", mechanism: "first_price" })  // throws
 */
export function assertMechanism2019(assertion, mechanismFile, context) {
  const map = mechanism2019(mechanismFile);
  const channel = String(assertion && assertion.channel || "").toLowerCase();
  const mechanism = normaliseMechanism(assertion && assertion.mechanism);
  if (!MECHANISM_CHANNELS.includes(channel)) {
    throw new DeadMechanismError(
      "G7", "THE DEAD-MECHANISM GUARD",
      `"${assertion && assertion.channel}" is not a channel the ${map.year} record covers.`,
      assertion,
      `use one of: ${MECHANISM_CHANNELS.join(", ")}`
    );
  }
  if (map[channel] !== mechanism) {
    throw new DeadMechanismError(
      "G7", "THE DEAD-MECHANISM GUARD",
      `${context || "this scenario"} says ${channel} ran "${mechanism}" in ${map.year}. ` +
      `The record says ${channel} ran "${map[channel]}". Display moved to unified ` +
      `first price on ${map.displayFirstPriceDate}; search never did, and got rGSP instead.`,
      { asserted: assertion, record: { channel, mechanism: map[channel] } },
      `set mechanism to "${map[channel]}", or label the panel DISPLAY if it is ` +
      `the first-price panel — sc-06 already carries the required caption`
    );
  }
  return true;
}

/**
 * The true sentence, rendered from the record.
 *
 * The reason a caption asserts the dead mechanism is that somebody typed the
 * sentence themselves. So the sentence is available as data: every fact in it —
 * which channel moved, what it moved to, what the other one got, the date — is
 * read out of mechanism.json by mechanism2019(). A page that renders this
 * cannot get it wrong, and cannot go stale if the record is repaired.
 *
 * This is the half of G7 that is a guarantee. The scanner below is not.
 */
export function mechanismSentence(channel, mechanismFile) {
  const map = mechanism2019(mechanismFile);
  const key = String(channel || "").toLowerCase();
  if (!MECHANISM_CHANNELS.includes(key)) {
    throw new DeadMechanismError(
      "G7", "THE DEAD-MECHANISM GUARD",
      `"${channel}" is not a channel the ${map.year} record covers.`,
      channel,
      `use one of: ${MECHANISM_CHANNELS.join(", ")}`
    );
  }
  /* Even the CASING of "rGSP" is read back out of the record rather than typed,
   * for the same reason the date is: a reader takes a rendered sentence as the
   * project's own spelling of the thing. */
  const strings = collectStrings(requireFrozen("mechanism", "G7", mechanismFile));
  const asRecordWrites = (token) => {
    const probe = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    for (const text of strings) {
      const hit = probe.exec(text);
      if (hit) return hit[0];
    }
    return token;
  };
  const other = MECHANISM_CHANNELS.find((c) => c !== key);
  const name = (c) => (c === "display" ? "DISPLAY" : "SEARCH");
  const mech = (c) => (map[c] === "first_price"
    ? "a unified first-price auction"
    : asRecordWrites(map[c]));
  return key === "display"
    ? `This was ${name(key)}. ${name(key)} moved to ${mech(key)} on ${map.displayFirstPriceDate}; ` +
      `${name(other)} never did, and got ${mech(other)} instead.`
    : `This was ${name(key)}. ${name(key)} never moved to first price — the ${map.year} ` +
      `${key} change was ${mech(key)}. ${name(other)} is the one that moved, on ` +
      `${map.displayFirstPriceDate}.`;
}

/**
 * THE TEXT LINT'S VOCABULARY AND ITS HISTORY.
 *
 * The function these constants serve is lintTextForDeadMechanism(), below, and
 * its docstring is where the "advice, not a guarantee" argument is made. What
 * is kept here is the record of what each piece of the vocabulary is FOR, so
 * that the next person to widen it knows which repair they are about to undo.
 *
 * ----------------------------------------------------------------------
 * WHY THIS IS ADVICE AND NOT A GUARD
 *
 * This scanner was, for three revisions, the throwing form of G7 for text:
 * `assertNoDeadMechanismClaim(text)`. It was patched twice, and each patch
 * closed the strings that had been put in front of it and opened new ones,
 * because English is not a bounded language and a regex over it is not a
 * decision procedure. Two of its own repairs are the proof:
 *
 *   - splitting clauses on "and" was added so a negation in a second
 *     proposition could not excuse the first. It also severs a verb from its
 *     object, so "Search moved to second price in 2002 and to first price in
 *     2019" became two clauses, neither of which asserts anything, and the
 *     sentence stopped being seen at all;
 *   - stripping dash asides was added so an aside could not lend its words to a
 *     claim it was not part of. It also deletes the claim outright when the
 *     aside IS the claim — "The 2019 change - search went first-price -
 *     surprised everyone" lost its subject and its predicate together.
 *
 * And it still missed "Search pays its own bid.", which is the plainest way to
 * say the false thing in English.
 *
 * Both repairs are applied below, and that miss is closed. That is worth doing
 * and it is not worth believing in: two ordinary sentences walked in behind it
 * and are still not caught (see DEAD_MECHANISM_LINT_LIMITS). A caller can always
 * paraphrase; the space of paraphrases is unbounded; a scanner over it will
 * always have a next hole. So the project's enforcement does not live here. It
 * lives where the thing being checked is bounded and finite:
 *
 *   assertSimulatorMechanismScopes()              — 21 frozen scenarios, each declaring
 *                                                    rule, surface and years out of a
 *                                                    vocabulary the file declares; no
 *                                                    scope may put first price on search
 *   assertMechanism2019({ channel, mechanism })   — checked against mechanism.json
 *   assertScenarioMechanism(scenario)             — the record's own required_caption
 *                                                    must be on screen, and a scenario
 *                                                    the record marks as an ad auction
 *                                                    must DECLARE its channel
 *
 * and in mechanismSentence(channel), which renders the true sentence from the
 * record so nobody has to type it.
 *
 * Because it advises rather than refuses, it is tuned for recall over
 * precision: a false positive costs a line in a report, where it used to cost a
 * failed build, which is what made the previous version's precision worth
 * paying for. Read its findings; do not treat an empty result as a clearance.
 *
 * ----------------------------------------------------------------------
 * THE THREE HOLES THE PREVIOUS VERSION CLOSED, KEPT HERE BECAUSE THEY RECUR
 *
 * The first version of this scanner missed half the hostile strings put in
 * front of it, and the misses were structural rather than unlucky.
 *
 * (a) THE NEGATION TEST SKIPPED THE WHOLE CLAUSE. `if (_NEGATED.test(clause))
 *     continue;` threw away a clause because a negation appeared ANYWHERE in
 *     it, in any relation to the claim. So
 *
 *         "In 2019 search moved to first price, and the industry did not notice"
 *
 *     passed. The negation is in a different proposition and negates nothing;
 *     the guard could not tell, because it never looked at where the negation
 *     sat. Worse, `unlike / except / rather than / instead of` counted as
 *     negations, so "Search, unlike display, moved to first price in 2019" —
 *     which asserts the false thing outright — was waved through by a contrast
 *     marker. The negation test now runs only over the text from the start of
 *     the clause to the END OF THE MATCH, which is the span a negator can
 *     actually scope over, and contrast markers are handled as structure
 *     (below) rather than treated as denials.
 *
 * (b) THE CLAUSE SPLITTER DID NOT SPLIT ON "and". It split on while / whereas /
 *     but / though / although, and on sentence punctuation, and stopped. "and"
 *     is the commonest way two propositions get joined in English, and every
 *     one of them arrived at the negation test as a single clause — which is
 *     what made (a) so cheap to trigger. It now splits on the full set of
 *     coordinators.
 *
 *     AND THAT FIX REGRESSED. "and" joins two objects at least as often as it
 *     joins two propositions, so "Search moved to second price in 2002 and to
 *     first price in 2019" was cut between the verb and its second object and
 *     neither half asserted anything. The splitter no longer decides: every
 *     unit is scanned at BOTH granularities — the whole sentence and each
 *     coordinator-separated clause — and a hit at either is a finding. The
 *     sentence-level pass is what catches the severed verb; the clause-level
 *     pass is what keeps a negation in one proposition from excusing another.
 *     The same regression is what asides had: stripping them deleted the claim
 *     when the aside WAS the claim, so an aside is now scanned as a unit of its
 *     own as well as removed from its host sentence.
 *
 * (c) THE PATTERNS ONLY EVER MATCHED WITH FIRST PRICE LAST. There were two
 *     regexes, search-then-verb-then-FP and verb-then-search-then-FP. The
 *     author was enumerating word orders and enumerated two of the three: both
 *     required FIRST PRICE to be the last of the three tokens. Any clause
 *     naming first price before search was invisible to the guard —
 *
 *         "The 2019 first-price switch applied to search as well as display."
 *         "First price came to search in 2019."
 *
 *     — and those are ordinary sentences, not contrived ones. There is now a
 *     third pattern for that order.
 *
 * A fourth thing, not a hole so much as an erosion: the verb list had grown
 * one word at a time and was missing "gone", "started", "flipped", "replaced",
 * "abandoned", "has/have/had been". Each miss is a sentence that asserts the
 * false claim in plain English. The list below is wider, and the ASIDE
 * stripping means it no longer has to reach across a subordinate clause.
 *
 * ----------------------------------------------------------------------
 * WHAT IS DELIBERATELY NOT DONE
 *
 * The scan still does not fire on mere co-occurrence of "search" and "first
 * price". That was tested against the whole frozen record and it is not
 * viable: mechanism.json describes a default distribution deal "shaped like a
 * first-price sealed-bid auction" between an access-point owner and a search
 * engine, and the auction's scope line compares the 2002 search auction
 * against first-price rivals. Both are true sentences, and a guard that fires
 * on true sentences is muted within a week and then the false one gets
 * through. The scan asks for a verb of movement or state binding search TO
 * first price, in one clause, unnegated — which is the thing that makes the
 * claim false.
 */

/* ---- vocabulary ---- */
const _MOVE_VERB =
  "(?:mov(?:e|ed|es|ing)|went|gone|go(?:es|ing)?|switch(?:ed|es|ing)?|shift(?:ed|s|ing)?|" +
  "transition(?:ed|s|ing)?|adopt(?:ed|s|ing)?|chang(?:e|ed|es|ing)|becom(?:e|es|ing)|became|" +
  "run(?:s|ning)?|ran|us(?:e|es|ed|ing)|turn(?:ed|s)?|convert(?:ed|s|ing)?|" +
  "flip(?:ped|s|ping)?|replac(?:e|ed|es|ing)|abandon(?:ed|s|ing)?|drop(?:ped|s|ping)?|" +
  "start(?:ed|s|ing)?|beg(?:an|ins|in|un)|charg(?:e|ed|es|ing)|pric(?:e|ed|es|ing)|" +
  "sell(?:s|ing)?|sold|bill(?:ed|s|ing)?|" +
  "is|was|were|are|be|been|being|has|have|had|now)";
const _FIRST_PRICE =
  "(?:first[- ]price|pay[- ]your[- ]bid|pa(?:id|ys) (?:its|their) own bid)";
const _SEARCH = "search(?:es)?";
/* THE MISS. "Search pays its own bid." is the plainest English form of the
 * false claim and no pattern saw it: the phrase carries its own verb, so there
 * is no separate movement verb between the channel and the mechanism for
 * search-then-verb-then-FP to find. Paying your own bid IS first price. */
const _OWN_BID =
  "(?:pa(?:y|ys|id|ying)|bid(?:s|ding)?|charg(?:e|es|ed)|bill(?:s|ed)?|cost(?:s)?)" +
  "\\s+(?:its|their|his|her|your|the)\\s+own\\s+bid";
/* Verbs that carry a mechanism TO a channel, for the first-price-first order. */
const _ARRIVAL_VERB =
  `(?:${_MOVE_VERB}|appli(?:ed|es)|extend(?:ed|s)?|came|comes|arriv(?:ed|es)|` +
  "reach(?:ed|es)?|brought|bring(?:s)?|roll(?:ed|s)? out|hit|spread)";

/* A verb, and not the second half of a hyphenated noun. Without the lookbehind
 * the "price" in "second-price search auction" is read as the verb binding
 * search to a first price named forty words later, which is how the record's
 * own scope line — a true sentence — came back flagged. */
const _VERB_START = "(?<![-\\w])";
const _SEARCH_THEN_FP = new RegExp(
  `\\b${_SEARCH}\\b[^.]{0,90}?${_VERB_START}${_MOVE_VERB}\\b[^.]{0,90}?${_FIRST_PRICE}`, "i");
const _VERB_THEN_SEARCH_FP = new RegExp(
  `${_VERB_START}${_MOVE_VERB}\\b[^.]{0,40}?\\b${_SEARCH}\\b[^.]{0,90}?${_FIRST_PRICE}`, "i");
/* Hole (c): first price named before search. Both directions of the binding. */
const _FP_THEN_SEARCH = new RegExp(
  `${_FIRST_PRICE}[^.]{0,60}?${_VERB_START}${_ARRIVAL_VERB}\\b[^.]{0,40}?\\b${_SEARCH}\\b|` +
  `${_FIRST_PRICE}[^.]{0,40}?\\b${_SEARCH}\\b[^.]{0,40}?${_VERB_START}${_ARRIVAL_VERB}\\b`, "i");
/* The mechanism stated as behaviour rather than as a name. */
const _SEARCH_PAYS_OWN_BID = new RegExp(
  `\\b${_SEARCH}\\b[^.]{0,60}?\\b${_OWN_BID}`, "i");
const _CLAIM_PATTERNS = [
  _SEARCH_THEN_FP, _VERB_THEN_SEARCH_FP, _FP_THEN_SEARCH, _SEARCH_PAYS_OWN_BID,
];

/* Genuine denials of the binding. Contrast markers are NOT in this list — they
 * are clause structure, handled by the splitter and by _CONTRAST_IN_SPAN. */
const _NEGATOR = /\b(?:never|not|no longer|nor|neither|without|denies|denied)\b|n['’]t\b/i;

/* A binding that reaches ACROSS a contrast marker is not a binding: the marker
 * is where the second proposition starts. "Display went to unified first price
 * on 2019-09-05, while search got rGSP" is the record's own true sentence, and
 * whole-sentence scanning is what makes this test necessary — at clause level
 * the marker was the split point and the question never arose.
 *
 * "and", "or" and "nor" are deliberately absent: "and" joins two objects of one
 * verb at least as often as it joins two propositions, and treating it as a
 * boundary is exactly the regression that let "Search moved to second price in
 * 2002 and to first price in 2019" through. */
const _CONTRAST_IN_SPAN =
  /\b(?:while|whereas|but|though|although|however|yet|unlike|except|rather than|instead of|contrary to|as opposed to)\b/i;

/* Parenthetical asides. Taken out of their host sentence so an aside cannot
 * lend its words to a claim it is not part of — "Google Ad Manager - the
 * open-web DISPLAY exchange, not search - completed its move to a unified
 * first-price auction" loses the word "search" with the aside and stops looking
 * like a search claim, which is correct.
 *
 * They are taken out and then SCANNED SEPARATELY, because removal alone was a
 * regression: when the aside is itself the claim — "The 2019 change - search
 * went first-price - surprised everyone" — deleting it deleted the subject and
 * the predicate at once and the sentence came back clean. */
const _PAREN_ASIDE = /\([^()]*\)|\[[^\][]*\]/g;
const _DASH_ASIDE = /(\s(?:—|–|--|-)\s)[^—–]*?\1/g;
const _COMMA_ASIDE =
  /,\s*(?:which|who|whom|whose|unlike|except|other than|rather than|instead of|contrary to|as opposed to|like|including|such as|not)\b[^,.;:!?]*,/gi;

/* Sentence boundaries: sentence punctuation, a line break, a table-cell pipe.
 * The pipe and the newline matter because reader-facing text arrives as table
 * cells and as multi-line captions, and two cells that sit next to each other
 * are not one sentence — without them a table row naming search in one column
 * and first price in another reads as a claim binding the two. */
const _SENTENCE_SPLIT = /[.;:!?|\n\r]+/;

/* Clause boundaries inside a sentence: an unpaired dash, and every coordinator
 * or contrast marker that can start a second proposition. Scanned IN ADDITION
 * to the whole sentence, never instead of it — see hole (b). */
const _CLAUSE_SPLIT =
  /\s+(?:—|–|--)\s+|,?\s+(?:while|whereas|but|though|although|however|yet|and|nor|or|unlike|except|rather than|instead of|contrary to|as opposed to|because|since)\s+/i;

/**
 * Every unit the scan will consider: each sentence whole, each clause inside
 * it, and each aside on its own. Exported for tests.
 *
 * Both granularities are kept because each one covers the other's regression. A
 * sentence keeps a verb attached to its object; a clause keeps a negation from
 * reaching across a coordinator into a proposition it does not deny.
 */
export function deadMechanismClauses(text) {
  const asides = [];
  const lift = (match) => { asides.push(match); return " , "; };
  const host = String(text || "")
    .replace(_PAREN_ASIDE, lift)
    .replace(_COMMA_ASIDE, lift)
    .replace(_DASH_ASIDE, lift);

  const units = [];
  const seen = new Set();
  const add = (value) => {
    const unit = value.trim();
    if (unit && !seen.has(unit)) { seen.add(unit); units.push(unit); }
  };
  for (const source of [host, ...asides]) {
    for (const sentence of source.split(_SENTENCE_SPLIT)) {
      add(sentence);
      for (const clause of sentence.split(_CLAUSE_SPLIT)) add(clause);
    }
  }
  return units;
}

/**
 * THE LIMITS OF THE TEXT LINT, written down where a caller can read them.
 * Exported so a report can print them beside the findings.
 */
export const DEAD_MECHANISM_LINT_LIMITS = Object.freeze([
  "a regex over English is not a decision procedure; the space of paraphrases is unbounded",
  'known misses, verified: "On search, the winner is billed the amount it offered." and ' +
  '"Since 2019 the top search ad is sold at the price the advertiser named." Both assert ' +
  "the false claim in plain English and this lint returns nothing for either",
  '"Search pays its own bid." was the miss that motivated this rebuild. It is closed now, ' +
  "by a fourth pattern — and closing it is exactly the move that never terminates, which " +
  "is why the enforcement is no longer here",
  "an empty result is NOT a clearance — the enforcement is assertSimulatorMechanismScopes() " +
  "over simulator-params.json, and assertMechanism2019() over mechanism.json",
  "tuned for recall over precision: a false positive costs one line in a report, which a " +
  "human reads, where it used to cost a failed build",
]);

/**
 * A HEURISTIC. Lint a caption, label, tooltip or scenario title for the claim
 * that search went first-price, and RETURN WHAT IT FOUND. It never throws.
 *
 * ----------------------------------------------------------------------
 * READ THIS BEFORE YOU TRUST IT
 *
 * THIS IS ADVICE, NOT A GUARANTEE, and the name is the only honest way to say
 * so. It was `assertNoDeadMechanismClaim(text)` for three revisions — a
 * throwing form, which reads as a guarantee. It was never one. It was patched
 * twice and leaked after each patch, and two of its own repairs were the proof:
 *
 *   - splitting clauses on "and" was added so a negation in a second
 *     proposition could not excuse the first. It also severed a verb from its
 *     object, so "Google moved both of its auctions, display and search, to
 *     first price in 2019" was cut in half and neither half asserted anything;
 *   - stripping dash asides was added so an aside could not lend its words to a
 *     claim it was not part of. Being content-blind, it deleted the subject
 *     when the aside WAS the claim: "The 2019 change - search moved to first
 *     price - was widely reported" came back clean.
 *
 * Both regressions are covered below — every unit is scanned at BOTH
 * granularities, whole sentence and clause, and asides are scanned as units of
 * their own as well as lifted out of their host. And it still misses ordinary
 * English. These two return nothing today:
 *
 *     "On search, the winner is billed the amount it offered."
 *     "Since 2019 the top search ad is sold at the price the advertiser named."
 *
 * There is no version of this function that ends that list. Paraphrase is
 * unbounded and a regex over it will always have a next hole. So the project's
 * enforcement does not live here:
 *
 *   assertSimulatorMechanismScopes()  — every scenario in simulator-params.json
 *                                       declares its rule, surface and years, and
 *                                       no scope may put a first-price rule on
 *                                       search. Twenty-one records, a fixed
 *                                       vocabulary: bounded, and unparaphrasable.
 *   assertMechanism2019({ channel, mechanism })
 *                                     — a two-value vocabulary against mechanism.json
 *   mechanismSentence(channel)        — renders the true sentence from the record,
 *                                       so nobody has to type one
 *
 * Use this lint the way you use a spell-checker. Read every finding. Never read
 * an empty result as a clearance.
 *
 * Returns an array of `{ unit, matched, context }`. Empty means it found
 * nothing, which is a much weaker statement than "the text is clean".
 */
export function lintTextForDeadMechanism(text, context) {
  const findings = [];
  for (const unit of deadMechanismClauses(text)) {
    for (const pattern of _CLAIM_PATTERNS) {
      const match = pattern.exec(unit);
      if (!match) continue;
      /* A binding that crosses a contrast marker belongs to two propositions. */
      if (_CONTRAST_IN_SPAN.test(match[0])) continue;
      /* Scope the negation. A negator can only deny this claim if it sits at or
       * before the end of the matched binding — "search never moved to first
       * price" denies it; "search moved to first price and the industry did not
       * notice" does not. */
      const upToMatch = unit.slice(0, match.index + match[0].length);
      if (_NEGATOR.test(upToMatch)) break;
      findings.push({ unit, matched: match[0], context: context || null });
      break;
    }
  }
  return findings;
}

/**
 * ADVISORY FORM, text flavour. The lint's findings with the context attached
 * and a rendered true sentence to put in their place. It does not throw,
 * because it cannot promise what a throw would promise.
 */
export function adviseOnDeadMechanismText(text, context, mechanismFile) {
  const findings = lintTextForDeadMechanism(text, context);
  let sentence = null;
  try { sentence = mechanismSentence("display", mechanismFile); } catch (_) { /* record not loaded */ }
  return {
    heuristic: true,
    context: context || "this label",
    findings,
    limits: DEAD_MECHANISM_LINT_LIMITS,
    advice: findings.length === 0 ? null :
      `${context || "this label"} reads as though search went first-price. It did not: ` +
      `in 2019 DISPLAY moved to unified first-price and SEARCH got rGSP. This is the ` +
      `most-repeated factual error about 2019.` +
      (sentence ? ` Render this instead: "${sentence}"` : ""),
  };
}

/**
 * Every required_caption anywhere inside a scenario record. They are not at a
 * fixed depth — sc-06 hangs its caption off expected_output, sc-09 off its own
 * node — and a guard that looked only at the top level would have found none.
 */
export function requiredCaptions(record, out = [], depth = 0) {
  if (depth > 10 || !record) return out;
  if (Array.isArray(record)) {
    for (const item of record) requiredCaptions(item, out, depth + 1);
  } else if (typeof record === "object") {
    for (const [key, value] of Object.entries(record)) {
      if (key === "required_caption" && typeof value === "string") out.push(value);
      else requiredCaptions(value, out, depth + 1);
    }
  }
  return out;
}

function normalise(text) {
  return String(text || "").replace(/\s+/g, " ").trim().toLowerCase();
}

/* ======================================================================
 * G7 · LAYER ONE — THE PART THAT IS A GUARANTEE
 *
 * The text lint above is advice. This is the enforcement, and it works because
 * it is not looking at prose. It reads twenty-one frozen scenario records
 * against a fixed vocabulary that the record itself declares, and asks a
 * question with a finite answer: which rule, on which surface, in which years.
 *
 * A caller can paraphrase a caption forever. A caller cannot paraphrase
 * `{ rule: "first_price", surface: "search" }`. There is exactly one way to say
 * it and this refuses it.
 * ====================================================================== */

/** The two surfaces the record covers. A scope is on one of them or it is wrong. */
export const MECHANISM_SURFACES = Object.freeze(["search", "display"]);

/**
 * WHAT THE SCOPE GUARANTEE DOES NOT COVER, written down where a caller reads it.
 *
 * The scope check is a guarantee over a bounded record, and these are the edges
 * of that record. None of them is a hole a scanner could close; each is a place
 * where the answer lives in a written, greppable line of an eight-entry file
 * that a reviewer reads, which is a different thing from a bug nobody sees.
 */
export const MECHANISM_SCOPE_LIMITS = Object.freeze([
  "a rule id that neither names first price nor declares the first-price family can be " +
  "pointed at search. That is a deliberate falsehood written into mechanism_scope_rules, " +
  "where a reviewer sees it — not a silent default",
  "the settings scan reads IDENTIFIERS only: any settings string containing whitespace is " +
  "prose and is skipped, because reading prose here would make this a heuristic over " +
  "English, which is what the text lint is and says it is. A first-price rule written into " +
  "a settings SENTENCE rather than a settings value is not caught by the scope guard",
  "`inherits` is resolved transitively and an unresolvable parent is a hard error, but the " +
  "guard checks the MERGED settings, not which key came from where",
]);

/** Family name a first-price rule must declare, and the shape of its id. */
const FIRST_PRICE_FAMILY = "first_price";
const _FIRST_PRICE_RULE_ID =
  /(?:^|_)(?:unified_)?first_price(?:_|$)|firstprice|pay_your_bid|own_bid/;
const normaliseRuleId = (value) =>
  String(value == null ? "" : value).trim().toLowerCase().replace(/[\s-]+/g, "_");
const looksFirstPrice = (ruleId) => _FIRST_PRICE_RULE_ID.test(normaliseRuleId(ruleId));

const SCOPE_YEAR_FLOOR = 1800;
const SCOPE_YEAR_CEILING = 2100;

/**
 * The rule vocabulary, read from simulator-params.json → mechanism_scope_rules.
 *
 * WHY THE VOCABULARY IS IN THE DATA AND NOT IN THIS FILE. A scope is only
 * unparaphrasable if the set of things it can say is finite and declared. If a
 * scenario could invent a rule name, "search + the_advertiser_pays_what_it_bid"
 * would sail past any first-price test, and we would be back to matching
 * strings. So a rule must be a key of this map, and the map says which surfaces
 * the record supports that rule on.
 *
 * The map is itself checked, in two directions:
 *  - a rule whose id names first price must declare the first-price family, so
 *    the family flag cannot be used to relabel one;
 *  - a first-price rule may not list `search` among its surfaces, because
 *    search never ran one.
 *
 * What this does NOT stop is somebody inventing a rule id that neither names
 * first price nor declares the family, and pointing it at search. That is a
 * deliberate, written, greppable falsehood in an eight-entry file that a
 * reviewer reads — which is the most any check can do, and is a different thing
 * from a bug nobody sees.
 */
export function mechanismScopeVocabulary(paramsFile) {
  const params = requireFrozen("simulatorParams", "G7", paramsFile);
  const raw = params.mechanism_scope_rules;
  if (!raw || typeof raw !== "object" || Object.keys(raw).length === 0) {
    throw new GuardVacuousError(
      "G7", "THE DEAD-MECHANISM GUARD",
      "simulator-params.json declares no mechanism_scope_rules, so every scenario's " +
      "declared rule would be unverifiable and this guard would accept any string at all.",
      params && Object.keys(params),
      "restore simulator-params.json → mechanism_scope_rules; it is the vocabulary the " +
      "scenario scopes are checked against"
    );
  }
  const vocabulary = new Map();
  for (const [id, entry] of Object.entries(raw)) {
    const where = `mechanism_scope_rules.${id}`;
    if (!entry || typeof entry !== "object") {
      throw new GuardVacuousError(
        "G7", "THE DEAD-MECHANISM GUARD",
        `${where} is not an object, so this guard cannot tell what surfaces the rule runs on.`,
        entry, "shape it { family, ad_auction, surfaces: [...], source }"
      );
    }
    const family = typeof entry.family === "string" ? entry.family.trim() : "";
    const surfaces = Array.isArray(entry.surfaces) ? entry.surfaces : null;
    const source = typeof entry.source === "string" ? entry.source.trim() : "";
    if (family === "" || source === "" || !surfaces || surfaces.length === 0) {
      throw new GuardVacuousError(
        "G7", "THE DEAD-MECHANISM GUARD",
        `${where} is missing a family, a non-empty surfaces list or the source line that ` +
        `says where in the record the rule comes from.`,
        entry,
        "every rule names its family, the surfaces the record supports it on, and the " +
        "mechanism.json path it was read from"
      );
    }
    const unknown = surfaces.filter((s) => !MECHANISM_SURFACES.includes(s));
    if (unknown.length > 0) {
      throw new DeadMechanismError(
        "G7", "THE DEAD-MECHANISM GUARD",
        `${where} lists surfaces this record does not cover: ${unknown.join(", ")}.`,
        { surfaces }, `use one or both of: ${MECHANISM_SURFACES.join(", ")}`
      );
    }
    if (looksFirstPrice(id) && family !== FIRST_PRICE_FAMILY) {
      throw new DeadMechanismError(
        "G7", "THE DEAD-MECHANISM GUARD",
        `${where} names a first-price rule and declares the family "${family}". The family ` +
        `flag is what the search refusal is written against, so relabelling a first-price ` +
        `rule as something else is the one edit that would switch that refusal off.`,
        { rule: id, family },
        `declare family: "${FIRST_PRICE_FAMILY}", or rename the rule if it is not one`
      );
    }
    const isFirstPrice = family === FIRST_PRICE_FAMILY || looksFirstPrice(id);
    if (isFirstPrice && surfaces.includes("search")) {
      throw new DeadMechanismError(
        "G7", "THE DEAD-MECHANISM GUARD",
        `${where} is a first-price rule and lists "search" among its surfaces. Google Search ` +
        `never moved to first price. In 2019 the DISPLAY exchange did; the search-side change ` +
        `was rGSP. mechanism.json calls conflating the two "the standard error in retellings ` +
        `of the 2019 transition", and this is the line in the data where that error would ` +
        `become sayable.`,
        { rule: id, surfaces },
        'drop "search" from this rule\'s surfaces; if a scenario needs the 2019 search ' +
        "change, its rule is rgsp"
      );
    }
    vocabulary.set(id, {
      id,
      family,
      firstPrice: isFirstPrice,
      adAuction: entry.ad_auction === true,
      surfaces: [...surfaces],
      source,
    });
  }
  return vocabulary;
}

/**
 * A scenario's settings with `inherits` resolved, transitively.
 *
 * THE BUG THIS EXISTS FOR. The settings check below used to read the record's
 * own `settings` object and stop. Three scenarios in the frozen file declare
 * `settings: { inherits: "sc-02-…" }` and almost nothing else, so a scenario
 * could pick up a first-price auction from a parent and present it under a
 * search label with nothing to read at its own level:
 *
 *     settings: { inherits: "sc-06-first-price-bid-shading-panel" }
 *     mechanism_scope: [{ rule: "gsp", surface: "search", years: [2002, 2008] }]
 *
 * Every scope is legal, the whole-file assert is green, and the panel a reader
 * sees is a first-price auction wearing a search label. That is the exact
 * failure G7 exists for, arriving through a field the guard did not read.
 *
 * A parent that cannot be resolved is a hard error, not a fallback to the
 * child's own settings: settings this guard cannot see are settings it cannot
 * check, and a guard that quietly stops checking is worse than no guard.
 */
function resolveScenarioSettings(record, options = {}, seen = []) {
  const settings = (record && record.settings) || {};
  const inherits = typeof settings.inherits === "string" ? settings.inherits.trim() : "";
  if (inherits === "") return settings;

  const id = (record && record.id) || "(no id)";
  if (seen.includes(inherits)) {
    throw new DeadMechanismError(
      "G7", "THE DEAD-MECHANISM GUARD",
      `scenario "${id}" inherits its settings in a cycle (${[...seen, inherits].join(" → ")}), ` +
      `so there is no settings object to check and the panel runs on whatever the loop ` +
      `resolves to at runtime.`,
      { id, chain: [...seen, inherits] },
      "break the cycle: a scenario inherits from one that does not inherit back"
    );
  }
  const params = requireFrozen("simulatorParams", "G7", options.simulatorParams);
  const parent = (params.scenarios || []).find((s) => s && s.id === inherits);
  if (!parent) {
    throw new DeadMechanismError(
      "G7", "THE DEAD-MECHANISM GUARD",
      `scenario "${id}" inherits its settings from "${inherits}", which simulator-params.json ` +
      `does not hold. The settings this panel actually runs on are therefore unreadable, and ` +
      `an unreadable settings object is where a first-price auction hides behind a search ` +
      `label with every declared scope still legal.`,
      { id, inherits, known: (params.scenarios || []).map((s) => s && s.id).slice(0, 24) },
      "point `inherits` at a scenario the file holds, or write the settings out"
    );
  }
  const base = resolveScenarioSettings(parent, options, [...seen, inherits]);
  return { ...base, ...settings };
}

/** Every string in an object, keys as well as values. */
function settingsStrings(node, out = [], depth = 0) {
  if (depth > 10) return out;
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) for (const v of node) settingsStrings(v, out, depth + 1);
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) { out.push(k); settingsStrings(v, out, depth + 1); }
  }
  return out;
}

/**
 * Does this scenario's SETTINGS drive a first-price auction?
 *
 * IT USED TO READ TWO NAMED KEYS, `pricing_rule` and `ranking_rule`. A named-key
 * list is a list, with all the properties of one: the settings object is free
 * shape, so a rule arriving under any third key — `auction_rule`, `panels`, a
 * nested override, an inherited parent — was invisible to the check while being
 * perfectly visible to the simulator. The docstring justified the narrowness by
 * claiming a wider scan would put sc-10 in breach. It would not: sc-10 declares
 * a display scope, which is exactly what makes a first-price setting legal.
 *
 * So it reads EVERY string in the resolved settings, key and value alike.
 *
 * WHAT IT DELIBERATELY DOES NOT READ, and this is a limit, written down.
 * A value containing whitespace is prose — an `interaction` note, an `overlay`
 * description — not a rule identifier. Reading prose here would make this a
 * heuristic over English, which is the thing G7 spent three revisions learning
 * it cannot be: sc-03's overlay says "add a pay-your-bid comparison row", which
 * is a true sentence about a search panel and would be flagged forever. Prose is
 * the text lint's job, and the text lint is advice and says so. This check reads
 * identifiers, where the vocabulary is finite and declared, and so it can be a
 * guarantee about identifiers. A first-price rule written into a settings
 * SENTENCE is not caught here — see the limits list on G7.
 *
 * A string counts as first price when it looks like one, or when it names a rule
 * the record's own vocabulary marks first-price. The second test is what catches
 * a first-price rule whose id does not say so.
 */
function settingsRunFirstPrice(record, options = {}) {
  const settings = resolveScenarioSettings(record, options);
  const vocabulary = options.vocabulary || null;
  const hits = new Set();
  for (const text of settingsStrings(settings)) {
    if (/\s/.test(text)) continue;                       // prose, not an identifier
    const declared = vocabulary && vocabulary.get(normaliseRuleId(text));
    if (looksFirstPrice(text) || (declared && declared.firstPrice)) hits.add(text);
  }
  return [...hits];
}

/**
 * One scenario record's declared scopes, normalised and fully checked.
 *
 * A SCENARIO WITHOUT A SCOPE IS A HARD ERROR, not a default. That is the whole
 * design: the absent case cannot be the permissive one, or the next scenario
 * added to the file inherits silence and the guard stops applying to it without
 * anybody noticing.
 */
export function scenarioMechanismScopes(record, options = {}) {
  const vocabulary = options.vocabulary || mechanismScopeVocabulary(options.simulatorParams);
  const id = (record && record.id) || "(no id)";
  const declared = record && record.mechanism_scope;

  if (declared == null) {
    throw new DeadMechanismError(
      "G7", "THE DEAD-MECHANISM GUARD",
      `scenario "${id}" declares no mechanism_scope. Every scenario has to say which ` +
      `auction rule it demonstrates, which surface it ran on and which years — because ` +
      `the alternative is a panel that teaches a mechanism by showing it, with nothing ` +
      `in the record saying which side of Google's business it belongs to. A missing ` +
      `scope is an error, never a default.`,
      { id, has: record ? Object.keys(record) : record },
      'add mechanism_scope: [{ rule: "gsp", surface: "search", years: [2002, 2008] }] — ' +
      `rules must come from mechanism_scope_rules: ${[...vocabulary.keys()].join(", ")}`
    );
  }
  const list = Array.isArray(declared) ? declared : [declared];
  if (list.length === 0) {
    throw new DeadMechanismError(
      "G7", "THE DEAD-MECHANISM GUARD",
      `scenario "${id}" declares an empty mechanism_scope, which says nothing while ` +
      `looking like a declaration.`,
      { id, mechanism_scope: declared },
      "declare at least one scope, or delete the scenario"
    );
  }

  const scopes = list.map((scope, i) => {
    const where = `scenario "${id}" scope ${i}`;
    if (!scope || typeof scope !== "object" || Array.isArray(scope)) {
      throw new DeadMechanismError(
        "G7", "THE DEAD-MECHANISM GUARD",
        `${where} is not a scope object.`, scope,
        '{ rule, surface, years: [from, to] }');
    }
    const ruleId = typeof scope.rule === "string" ? scope.rule.trim() : "";
    const rule = vocabulary.get(ruleId);
    if (!rule) {
      throw new DeadMechanismError(
        "G7", "THE DEAD-MECHANISM GUARD",
        `${where} names the rule "${scope.rule}", which simulator-params.json does not ` +
        `declare. A rule outside the vocabulary is how a first-price auction gets onto ` +
        `search under another name, so an unknown rule is refused rather than trusted.`,
        { rule: scope.rule, vocabulary: [...vocabulary.keys()] },
        `use one of: ${[...vocabulary.keys()].join(", ")} — or add the rule to ` +
        "mechanism_scope_rules with its family, its surfaces and its source"
      );
    }
    const surface = typeof scope.surface === "string" ? scope.surface.trim().toLowerCase() : "";
    if (!MECHANISM_SURFACES.includes(surface)) {
      throw new DeadMechanismError(
        "G7", "THE DEAD-MECHANISM GUARD",
        `${where} names the surface "${scope.surface}", which is not one this record covers.`,
        { surface: scope.surface },
        `use one of: ${MECHANISM_SURFACES.join(", ")}`
      );
    }
    /* THE RULE THIS GUARD EXISTS FOR, checked twice: once against the rule's own
     * declared surfaces, and once against the first-price family directly, so
     * neither edit alone can switch it off. */
    if (rule.firstPrice && surface === "search") {
      throw new DeadMechanismError(
        "G7", "THE DEAD-MECHANISM GUARD",
        `${where} puts the first-price rule "${ruleId}" on SEARCH. Google Search never ran ` +
        `a first-price auction. In 2019 the DISPLAY exchange moved to unified first price; ` +
        `the search-side change was rGSP, a randomised generalised second-price auction. ` +
        `This is the most-repeated factual error about 2019 and a simulator is the most ` +
        `effective way to teach it, because the reader experiences it as something they ` +
        `worked out themselves.`,
        { scenario: id, rule: ruleId, surface, rule_source: rule.source },
        'set surface: "display" if this is the display panel, or rule: "rgsp" if it is ' +
        "the 2019 search change"
      );
    }
    if (!rule.surfaces.includes(surface)) {
      throw new DeadMechanismError(
        "G7", "THE DEAD-MECHANISM GUARD",
        `${where} puts "${ruleId}" on "${surface}", and the record supports that rule on ` +
        `${rule.surfaces.join(", ")} only.`,
        { rule: ruleId, surface, supported: rule.surfaces, rule_source: rule.source },
        `use one of: ${rule.surfaces.join(", ")}`
      );
    }
    const years = scope.years;
    if (!Array.isArray(years) || years.length !== 2 ||
        !years.every((y) => Number.isInteger(y) &&
          y >= SCOPE_YEAR_FLOOR && y <= SCOPE_YEAR_CEILING) ||
        years[0] > years[1]) {
      throw new DeadMechanismError(
        "G7", "THE DEAD-MECHANISM GUARD",
        `${where} has no usable \`years\`. A scope without years says a rule ran on a ` +
        `surface and never says when, which is the half of the 2019 confusion that ` +
        `survives even when the surface is right.`,
        { years },
        `write [from, to], both integers between ${SCOPE_YEAR_FLOOR} and ${SCOPE_YEAR_CEILING}, ` +
        "with from <= to"
      );
    }
    return {
      scenario: id, rule: ruleId, family: rule.family, firstPrice: rule.firstPrice,
      adAuction: rule.adAuction, surface, years: [years[0], years[1]],
      note: typeof scope.note === "string" ? scope.note : null,
    };
  });

  /* The settings are the other place a first-price auction can arrive. sc-06
   * drives one from settings.pricing_rule. If a scenario like it declared only
   * search scopes, the panel would run first price with nothing on the record
   * owning it, and every scope above would still read as legal — the rule would
   * be true of each scope and false of the panel.
   *
   * Read through `inherits` and over every string in the settings, because both
   * narrower readings were holes: a scenario can inherit sc-06's settings while
   * declaring only search scopes, and a rule can arrive under any key name at
   * all. See resolveScenarioSettings and settingsRunFirstPrice.
   *
   * A display scope is what makes it legal: sc-10 runs both 2019 changes and
   * declares one scope for each, which is exactly the shape this is protecting. */
  const fpSettings = settingsRunFirstPrice(record, { ...options, vocabulary });
  if (fpSettings.length > 0 && !scopes.some((s) => s.surface === "display")) {
    throw new DeadMechanismError(
      "G7", "THE DEAD-MECHANISM GUARD",
      `scenario "${id}" runs a first-price auction from its settings (${fpSettings.join(", ")}) ` +
      `and declares no display scope to own it — every scope it has is on search. Whatever ` +
      `the scopes name their rules, the panel a reader sees is a first-price auction under ` +
      `a search label.`,
      { id, settings: fpSettings, scopes: scopes.map((s) => `${s.rule} on ${s.surface}`) },
      'add the display scope the first-price settings belong to, or split the scenario so ' +
      "the search leg has its own settings"
    );
  }
  return scopes;
}

/** THROWING FORM, one scenario record from the frozen file. */
export function assertScenarioMechanismScope(record, options = {}) {
  scenarioMechanismScopes(record, options);
  return true;
}

/**
 * THROWING FORM, THE WHOLE FILE. This is G7's guarantee.
 *
 * Every scenario in simulator-params.json must carry a mechanism scope, every
 * scope must name a rule the file's own vocabulary declares, and no scope may
 * put a first-price rule on search. It is a bounded check over a finite file,
 * so unlike a prose scan it has an answer rather than a batting average.
 *
 * AND IT ASKS WHETHER THE SECOND LAYER STILL HAS ANYTHING TO ENFORCE.
 * mechanismBearingScenarios() is what decides which panels must declare a
 * channel when they are rendered, and it reads the `ad_auction` flag on each
 * rule. Deleting eight words from the JSON — the flag, on every rule — disarmed
 * that whole layer across all 21 scenarios while this assert stayed green,
 * because nothing in this file called it. Only the test page did. It is called
 * here now, so a record in which no rule declares an ad auction is a hard error
 * rather than a quiet pass.
 */
export function assertSimulatorMechanismScopes(options = {}) {
  const params = requireFrozen("simulatorParams", "G7", options.simulatorParams);
  const scenarios = params.scenarios || [];
  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    throw new GuardVacuousError(
      "G7", "THE DEAD-MECHANISM GUARD",
      "simulator-params.json holds no scenarios, so this guard has nothing to check and " +
      "would pass a simulator with any panel in it at all.",
      params && Object.keys(params),
      "check simulator-params.json → scenarios"
    );
  }
  const vocabulary = mechanismScopeVocabulary(params);
  for (const record of scenarios) {
    scenarioMechanismScopes(record, { vocabulary, simulatorParams: params });
  }
  /* The vacuity check for the second enforcement layer. It throws on a record
   * where no rule is marked as an ad auction — which is the one edit that
   * switches off "a mechanism-bearing panel must declare its channel" for the
   * whole file at once. */
  mechanismBearingScenarios(params);
  return true;
}

/**
 * The census, for a page or a test that wants to show the shape of the record
 * rather than only that it passed.
 */
export function auditSimulatorMechanismScopes(options = {}) {
  const params = requireFrozen("simulatorParams", "G7", options.simulatorParams);
  const vocabulary = mechanismScopeVocabulary(params);
  const scopes = [];
  for (const record of params.scenarios || []) {
    scopes.push(...scenarioMechanismScopes(record, { vocabulary, simulatorParams: params }));
  }
  const bySurface = {};
  for (const surface of MECHANISM_SURFACES) {
    bySurface[surface] = scopes.filter((s) => s.surface === surface).length;
  }
  return {
    scenarios: (params.scenarios || []).length,
    scopes: scopes.length,
    rules: [...vocabulary.keys()],
    bySurface,
    firstPriceScopes: scopes.filter((s) => s.firstPrice)
      .map((s) => `${s.scenario}: ${s.rule} on ${s.surface}`),
    searchFirstPrice: scopes.filter((s) => s.firstPrice && s.surface === "search").length,
  };
}

/**
 * The scenarios that must declare a channel when they are rendered.
 *
 * This used to be derived by scanning each scenario's strings for
 * /first-price|rgsp|second-price/ — a prose test standing in for a structural
 * one. It now reads the scopes: a scenario is mechanism-bearing when the record
 * says at least one of its rules is an ad auction. A scenario cannot drop out
 * of the set by rewording its own captions.
 */
export function mechanismBearingScenarios(paramsFile) {
  const params = requireFrozen("simulatorParams", "G7", paramsFile);
  const vocabulary = mechanismScopeVocabulary(params);
  const bearing = (params.scenarios || [])
    .filter((record) =>
      scenarioMechanismScopes(record, { vocabulary, simulatorParams: params })
        .some((scope) => scope.adAuction))
    .map((record) => record.id);
  if (bearing.length === 0) {
    throw new GuardVacuousError(
      "G7", "THE DEAD-MECHANISM GUARD",
      "not one scenario in simulator-params.json declares an ad-auction rule, so this " +
      "guard cannot tell which panels must declare a channel and would let every one of " +
      "them through undeclared.",
      { scenarios: (params.scenarios || []).length },
      "check simulator-params.json → scenarios[].mechanism_scope and mechanism_scope_rules " +
      "(sc-06 is the first-price panel)"
    );
  }
  return bearing;
}

/**
 * ADVICE, over the frozen scenarios. Runs the text lint across every string in
 * every scenario and reports each finding AGAINST THE SCENARIO THAT OWNS IT,
 * with the path to the field, which is where somebody can actually fix it.
 *
 * It returns findings and never throws, for the same reason lintTextForDeadMechanism
 * does: it is a heuristic, and a heuristic that stops a build teaches everyone
 * downstream that a green build means the prose is clean. It does not.
 */
export function lintSimulatorScenarios(options = {}) {
  const params = requireFrozen("simulatorParams", "G7", options.simulatorParams);
  const findings = [];
  const walk = (node, path, scenario, depth) => {
    if (depth > 12) return;
    if (typeof node === "string") {
      for (const finding of lintTextForDeadMechanism(node, `${scenario} · ${path}`)) {
        findings.push({ scenario, path, text: node, ...finding });
      }
    } else if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, `${path}[${i}]`, scenario, depth + 1));
    } else if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k, scenario, depth + 1);
    }
  };
  for (const record of params.scenarios || []) {
    walk(record, "", record && record.id, 0);
  }
  return findings;
}

/**
 * A whole simulator scenario, checked against simulator-params.json.
 *
 * WHAT IS ENFORCED — all three read the frozen record, not the caller's prose:
 *
 *  1. THE SCOPE. The scenario's frozen record must declare which rule it
 *     demonstrates, on which surface, in which years, out of a vocabulary the
 *     file itself declares — and no scope may put a first-price rule on search.
 *     This is the check the text scanner was a bad substitute for.
 *  2. THE SHAPE. A scenario the record marks as an ad auction must DECLARE
 *     `channel` and `mechanism` when it is rendered, checked against
 *     mechanism.json, and the channel it declares must be a surface its own
 *     scope covers. There is no paraphrase of
 *     `channel: "search", mechanism: "first_price"` that gets past this.
 *  3. THE CAPTION. Every required_caption the frozen record attaches to the
 *     scenario must appear in what the page renders. sc-06 is the panel this
 *     exists for — it draws a first-price auction, and without its caption a
 *     reader leaves believing search ran one.
 *
 * WHAT IS ADVISED, and returned rather than thrown: the text lint's findings
 * over every string in the scenario. It used to throw here, which made a leaky
 * regex look like the guard. It is not the guard. It is a second pair of eyes,
 * and the return value carries what it saw.
 *
 * Returns `{ ok: true, id, scopes, declared, advisory }`.
 */
export function assertScenarioMechanism(scenario, options = {}) {
  const params = requireFrozen("simulatorParams", "G7", options.simulatorParams);
  const id = scenario && scenario.id;
  const record = (params.scenarios || []).find((s) => s.id === id);
  if (!record) {
    throw new GuardVacuousError(
      "G7", "THE DEAD-MECHANISM GUARD",
      `scenario "${id}" is not in simulator-params.json, so this guard cannot ` +
      `check it against the frozen scenario record.`,
      { id, known: (params.scenarios || []).map((s) => s.id).slice(0, 24) },
      "every scenario on screen must exist in simulator-params.json"
    );
  }
  const rendered = [scenario.caption, scenario.label, scenario.title, scenario.headline]
    .concat(scenario.captions || [])
    .filter(Boolean);

  /* 1 · THE SCOPE, from the data. Bounded, finite, unparaphrasable. */
  const vocabulary = mechanismScopeVocabulary(params);
  const scopes = scenarioMechanismScopes(record, { vocabulary, simulatorParams: params });
  /* A rendered scenario may restate its scope. If it does, it is checked too —
   * otherwise the page could relabel a display panel as search on its way to
   * the screen and the frozen record would never know. */
  if (scenario.mechanism_scope != null) {
    scenarioMechanismScopes({ id, mechanism_scope: scenario.mechanism_scope, settings: scenario.settings },
      { vocabulary, simulatorParams: params });
  }

  /* 2 · THE SHAPE. Refused, not detected. */
  const mustDeclare = scopes.some((s) => s.adAuction);
  if (mustDeclare && !(scenario.channel && scenario.mechanism)) {
    throw new DeadMechanismError(
      "G7", "THE DEAD-MECHANISM GUARD",
      `scenario "${id}" declares an ad-auction rule in the frozen record ` +
      `(${scopes.filter((s) => s.adAuction).map((s) => s.rule).join(", ")}) and it was ` +
      `rendered without declaring which channel it is about. A panel that draws an auction ` +
      `and does not name its channel teaches the reader that it applies to all of them — ` +
      `which for first price is the most-repeated factual error about ` +
      `${mechanism2019(options.mechanism).year}.`,
      { id, channel: scenario.channel ?? null, mechanism: scenario.mechanism ?? null,
        scope_surfaces: [...new Set(scopes.map((s) => s.surface))] },
      `set channel and mechanism on the scenario — { channel: "display", mechanism: ` +
      `"first_price" } — and render mechanismSentence(channel) rather than typing one`
    );
  }
  if (scenario.channel || scenario.mechanism) {
    assertMechanism2019({ channel: scenario.channel, mechanism: scenario.mechanism },
      options.mechanism, `scenario ${id}`);
    const channel = String(scenario.channel || "").toLowerCase();
    const surfaces = [...new Set(scopes.map((s) => s.surface))];
    if (!surfaces.includes(channel)) {
      throw new DeadMechanismError(
        "G7", "THE DEAD-MECHANISM GUARD",
        `scenario "${id}" was rendered as the ${channel} panel and its frozen scope covers ` +
        `${surfaces.join(", ")} only. The label and the record disagree about which side of ` +
        `the business this panel is, and the label is the half the reader sees.`,
        { id, rendered_channel: channel, scope_surfaces: surfaces },
        `render it as one of: ${surfaces.join(", ")} — or repair the scope in ` +
        "simulator-params.json if the record is the one that is wrong"
      );
    }
  }

  /* 3 · THE CAPTION. Containment is checked against the NAMED rendered fields
   * only: the test asks whether the reader will see the caption, so widening
   * what counts as "shown" would make it easier to pass. */
  const renderedText = normalise(rendered.join("   "));
  for (const required of requiredCaptions(record)) {
    if (!renderedText.includes(normalise(required))) {
      throw new DeadMechanismError(
        "G7", "THE DEAD-MECHANISM GUARD",
        `scenario "${id}" carries a required_caption in the frozen record and the ` +
        `rendered scenario does not show it.`,
        { id, required_caption: required, rendered },
        `render it verbatim: "${required}"`
      );
    }
  }

  /* 4 · THE ADVICE. Every string in the object, not a named field list — a new
   * field name must not be able to open a hole in what gets looked at. */
  const findings = [];
  for (const text of collectStrings(scenario)) {
    for (const finding of lintTextForDeadMechanism(text, `scenario ${id}`)) {
      findings.push({ scenario: id, ...finding });
    }
  }
  return {
    ok: true,
    id,
    scopes,
    declared: scenario.channel ? { channel: scenario.channel, mechanism: scenario.mechanism } : null,
    advisory: {
      heuristic: true,
      findings,
      limits: DEAD_MECHANISM_LINT_LIMITS,
      note: findings.length === 0
        ? "the text lint found nothing, which is not a clearance — the scope check above is"
        : `the text lint flagged ${findings.length} string(s) in scenario ${id}; ` +
          "read them, and prefer mechanismSentence(channel) to a typed sentence",
    },
  };
}

/* ======================================================================
 * GUARD 8 · TIME IS TWO FIELDS
 * ====================================================================== */

/**
 * WHY THIS EXISTS.
 *
 * `as_of` is provenance: when the governing source published, filed or was
 * retrieved. `about_year` is the year the fact is about. They are not the same
 * field and the project spent stage P1 separating them, because 60 of 505
 * claims would otherwise have been plotted at their source's publication date.
 * The worst is `ds-gdp-001`: a fact about 1922, sourced from a blog post dated
 * 2008-09-14. Eighty-six years.
 *
 * The failure this prevents is a timeline that puts roughly fifty claims in
 * the wrong decade while looking entirely normal. Nothing is missing, nothing
 * is out of range, every dot has a source. It is simply the wrong picture of
 * the century.
 *
 * Seven claims additionally carry `timeline_ready: false`. That is not
 * ignorance about the year — it is a withdrawal of permission to draw, because
 * the fact spans years the record does not name. Each one carries an
 * `about_year_note` saying why.
 */

/** The field that is provenance and must never reach an axis or a filter. */
export const PROVENANCE_FIELD = "as_of";
/** The only field a chart may read for time. */
export const FACT_FIELD = "about_year";

/**
 * THROWING FORM. Put this at the top of every axis constructor and every time
 * filter. It is one line and it is the whole guard.
 */
export function assertTimeField(fieldName, context) {
  if (fieldName === PROVENANCE_FIELD) {
    throw new TimeFieldError(
      "G8", "TIME IS TWO FIELDS",
      `${context || "this axis or filter"} was handed "${PROVENANCE_FIELD}". That field is ` +
      `provenance — when the source published — not the year the fact is about. ` +
      `The two differ by up to 86 years in this record (ds-gdp-001: a 1922 fact ` +
      `from a 2008 source).`,
      fieldName,
      `read "${FACT_FIELD}" instead; it is the only field a chart may read for time`
    );
  }
  if (fieldName !== FACT_FIELD) {
    throw new TimeFieldError(
      "G8", "TIME IS TWO FIELDS",
      `${context || "this axis or filter"} was handed "${fieldName}", which is not the ` +
      `project's fact-year field.`,
      fieldName,
      `read "${FACT_FIELD}"`
    );
  }
  return fieldName;
}

/** BOOLEAN FORM. True when this claim may be placed on a timeline at all. */
export function isTimelineDrawable(claim) {
  if (!claim || typeof claim !== "object") return false;
  if (claim.timeline_ready === false) return false;
  return Number.isInteger(claim[FACT_FIELD]);
}

/**
 * THROWING FORM. The only supported way to get a year out of a claim.
 * Returns about_year. Throws for the seven withheld claims and for any claim
 * whose about_year is missing.
 */
export function timelineYear(claim, context) {
  if (!claim || typeof claim !== "object") {
    throw new TimeFieldError("G8", "TIME IS TWO FIELDS", "expected a claim object.", claim,
      "pass a record from claims.json");
  }
  if (claim.timeline_ready === false) {
    throw new TimeFieldError(
      "G8", "TIME IS TWO FIELDS",
      `claim ${claim.id} is timeline_ready:false and must not be drawn on a timeline. ` +
      `The record's reason: ${String(claim.about_year_note || "no note recorded").slice(0, 220)}`,
      { id: claim.id, about_year: claim[FACT_FIELD], as_of: claim[PROVENANCE_FIELD] },
      "quote it in prose, or draw it as a span over about_span — never as a dated point"
    );
  }
  const year = claim[FACT_FIELD];
  if (!Number.isInteger(year)) {
    throw new TimeFieldError(
      "G8", "TIME IS TWO FIELDS",
      `claim ${claim.id} has no integer ${FACT_FIELD}, so it cannot be placed in time. ` +
      `Do not fall back to ${PROVENANCE_FIELD} — that is the source's publication date.`,
      { id: claim.id, [FACT_FIELD]: year, [PROVENANCE_FIELD]: claim[PROVENANCE_FIELD] },
      `repair the record; tools/verify_p2.py p1-timeline is the gate for this`
    );
  }
  return year;
}

/** Alias, for call sites where the rule reads better than the value. */
export function assertTimelineReady(claim, context) {
  timelineYear(claim, context);
  return true;
}

/** How far a claim's provenance sits from its fact year, in years. */
export function timeFieldDivergence(claim) {
  const match = /^(\d{4})/.exec(String(claim && claim[PROVENANCE_FIELD] || ""));
  if (!match || !Number.isInteger(claim[FACT_FIELD])) return null;
  return Math.abs(Number(match[1]) - claim[FACT_FIELD]);
}

/**
 * Split a claim list into what may be drawn and what is withheld. A timeline
 * calls this and renders `withheld` somewhere the reader can see — a withheld
 * claim is an absence, and G5 says absence is an object.
 */
export function timelineClaims(claimsFile) {
  const file = requireFrozen("claims", "G8", claimsFile);
  const list = Array.isArray(file) ? file : file.claims;
  if (!Array.isArray(list) || list.length === 0) {
    throw new GuardVacuousError(
      "G8", "TIME IS TWO FIELDS",
      "claims.json produced no claims.", file && Object.keys(file),
      "check that claims.json still holds a `claims` array"
    );
  }
  const drawable = [];
  const withheld = [];
  for (const claim of list) (isTimelineDrawable(claim) ? drawable : withheld).push(claim);
  return { drawable, withheld, total: list.length };
}

/**
 * THROWING FORM, filter flavour. Refuses the provenance field, refuses
 * withheld claims, and never invents a year.
 */
export function filterByYear(claims, { field = FACT_FIELD, from, to, context } = {}) {
  assertTimeField(field, context || "filterByYear");
  return [...(claims || [])].filter((claim) => {
    const year = timelineYear(claim, context || "filterByYear");
    return (from == null || year >= from) && (to == null || year <= to);
  });
}

/* ======================================================================
 * 3 · THE MANIFEST
 *
 * One row per guard, so a test page, a build script or a reviewer can walk the
 * set without reading the file. `why` is the sentence that stops the guard
 * being deleted by somebody who has forgotten what it was for.
 * ====================================================================== */

export const GUARDS = Object.freeze([
  {
    id: "G1",
    rule: "NO POINT ON A WIDE INTERVAL",
    why: "{g1.wide} of {g1.total} claims have an 80% interval wider than {g1.cut} of their central. A dot at the midpoint reads as a measurement and gets quoted back at you.",
    throwing: "drawMark(claim, kind) / assertNoPointOnWideInterval",
    boolean: "isWideInterval(claim) / markKindFor(claim)",
    reads: ["claims.json"],
  },
  {
    id: "G2",
    rule: "NO ORDER ON UNRANKED QUANTITIES",
    why: "Era 7's national_brand, direct_response and local_retail are mutually unranked. A sorted bar chart asserts an ordering with its layout that no caption can take back.",
    throwing: "assertRankable(era, ids, op) / renderPools(pools, ordering, layout) / sortPools",
    boolean: "isRankable(era, ids) / findUnrankedPair(era, ids)",
    reads: ["moneytype/reconciled.json"],
  },
  {
    id: "G3",
    rule: "NO SPLICE",
    why: "Coen/McCann counts advertiser billings; MAGNA counts media-owner revenue. One line through both shows a 23.43% event in 1980 that happened in the ruler, not the market.",
    throwing: "assertNoSplice(points, context) / buildPath(points) breaks instead",
    boolean: "canJoin(a, b)",
    reads: ["adspend.json"],
  },
  {
    id: "G4",
    rule: "NO HARD-CODED SERIES LIST",
    why: "adspend.json holds eight series; the schema spec named five. A chart reading five silently drops the classified axis, the pre-1960 cross-check and the bridge ribbon, and looks complete doing it. The written reason attaches to the OUTCOME: any selection that leaves a series off the chart carries one, whatever form asked for it. A field whose every value names one series is refused, because that is a key with the record's own metadata standing in for it.",
    throwing: 'assertSeriesListComplete(list, adspend) / selectSeries(adspend, "all" | {role, because} | {only, because}) — there is no predicate form; every dropping subset carries a written reason instead of being detected',
    boolean: "isSeriesListComplete(list) / seriesKeys(adspend) / seriesRoles(adspend) / seriesFields(adspend) / seriesKeyLikeFields(adspend)",
    reads: ["adspend.json"],
  },
  {
    id: "G5",
    rule: "ABSENCE IS AN OBJECT",
    why: "Four documented holes, the widest 2008–2020. Interpolating invents thirteen years; whitespace reads as zero. The absence is one of the piece's findings. The gap list is not optional: omit it and the guard reads the record. A declared-empty list is authenticated by identity, not by a flag anyone can set; every declared gap must intersect an absence adspend.json actually has; and there is no validation cache, because caching on object identity meant a validated list could be refilled with a decoy. Validated gap lists are frozen.",
    throwing: "assertAbsenceDrawn(gaps, rendered) / assertNoInterpolation(points, gaps) / buildPath(points) breaks at every documented hole by default",
    boolean: "isAbsenceDrawn(gaps, rendered) / coverageGaps(adspend) / seriesYearGaps(key) / declareNoDocumentedGaps(reason)",
    reads: ["adspend.json"],
  },
  {
    id: "G6",
    rule: "THE CROSS-ERA TAXONOMY",
    why: "Era 5 carries two money-type taxonomies on purpose. They differ by {seam.usd} — {seam.pp} points of the {seam.year} market — and reverse which of two pools leads. A cross-era chart on the wrong one shows a reversal that is a classification artifact.",
    throwing: "assertTaxonomy({scope, claimIds}) / assertNoTaxonomyMix(view) / assertTaxonomyField(scope, group, field)",
    boolean: "isTaxonomyConsistent(view) / taxonomyOf(claimId)",
    reads: ["moneytype/reconciled.json", "eras/era-5.json"],
  },
  {
    id: "G7",
    rule: "THE DEAD-MECHANISM GUARD",
    why: "On {mech.date} DISPLAY moved to unified first-price; SEARCH did not, and got rGSP. mechanism.json calls the conflation 'the standard error in retellings of the 2019 transition'. A simulator teaches it as something the reader worked out themselves.",
    throwing: "assertSimulatorMechanismScopes() — all {g7.scenarios} scenarios declare rule, surface and years, no scope puts first price on search, settings are read through `inherits` and across every identifier in them, and the file must still mark at least one rule as an ad auction / assertMechanism2019(assertion) / assertScenarioMechanism(scenario). Prose is not enforced, because prose cannot be.",
    boolean: "isMechanism2019Correct(assertion) / mechanismSentence(channel) renders the true one / auditSimulatorMechanismScopes() / mechanismScopeVocabulary()",
    heuristic: "lintTextForDeadMechanism(text) / lintSimulatorScenarios() / adviseOnDeadMechanismText(text) — findings, never a guarantee, and an empty result is not a clearance",
    reads: ["mechanism.json", "simulator-params.json"],
  },
  {
    id: "G8",
    rule: "TIME IS TWO FIELDS",
    why: "as_of is provenance, about_year is the fact year, and they differ by up to 86 years (ds-gdp-001: a 1922 fact from a 2008 source). Seven claims are timeline_ready:false and withhold permission to draw at all.",
    throwing: "assertTimeField(field) / timelineYear(claim) / filterByYear(claims, opts)",
    boolean: "isTimelineDrawable(claim) / timelineClaims(claims)",
    reads: ["claims.json"],
  },
]);

/**
 * The guard manifest, for a page that wants to list what it is protected by.
 *
 * Two of the `why` sentences quote figures that live in the frozen files. They
 * are written as {seam.usd}-style placeholders rather than as numbers, and
 * filled in here from the record, for the same reason the error messages are:
 * a manifest is documentation a reader trusts, and a number typed into
 * documentation drifts silently from the file it describes. GUARDS itself is a
 * frozen constant evaluated at import time, before any data is loaded, so the
 * substitution has to happen in the function rather than in the array.
 *
 * If the record cannot supply a figure the placeholder is left standing —
 * visibly unresolved, which is the honest failure. It is never replaced by a
 * remembered value.
 */
export function guardManifest(options = {}) {
  const values = {};
  try {
    const seam = taxonomySeamFigures(options.reconciled);
    values["seam.usd"] = seam.usd;
    values["seam.pp"] = seam.pp;
    values["seam.year"] = seam.year == null ? "" : String(seam.year);
    values["seam.block"] = seam.block;
  } catch (_) { /* left unresolved on purpose */ }
  try {
    const map = mechanism2019(options.mechanism);
    values["mech.date"] = map.displayFirstPriceDate;
    values["mech.year"] = String(map.year);
  } catch (_) { /* left unresolved on purpose */ }
  try {
    const census = auditWideIntervals(options.claims);
    values["g1.wide"] = String(census.wide);
    values["g1.total"] = String(census.total);
    values["g1.cut"] = `${Math.round(census.ratio * 100)}%`;
  } catch (_) { /* left unresolved on purpose */ }
  try {
    const scopes = auditSimulatorMechanismScopes({ simulatorParams: options.simulatorParams });
    values["g7.scenarios"] = String(scopes.scenarios);
    values["g7.scopes"] = String(scopes.scopes);
  } catch (_) { /* left unresolved on purpose */ }
  const fill = (text) =>
    text == null ? text : String(text).replace(/\{([\w.]+)\}/g, (whole, key) =>
      Object.prototype.hasOwnProperty.call(values, key) ? values[key] : whole);
  /* A guard running on a moved convention is not the guard this manifest
   * describes, and a page that lists what it is protected by must not print the
   * stock sentence over a cut somebody changed. */
  const rules = rulesStatus();
  const configuredFor = (guardId) => {
    if (rules.default) return null;
    const mine = rules.changed.filter((k) => RULE_OWNERS[k] === guardId);
    if (mine.length === 0) return null;
    return `NON-DEFAULT: ${mine
      .map((k) => `${k} = ${JSON.stringify(rules.values[k])} (design brief: ` +
                  `${JSON.stringify(RULES_DEFAULT[k])})`)
      .join("; ")} · reason: ${rules.reason}`;
  };
  return GUARDS.map((g) => ({
    ...g,
    why: fill(g.why),
    throwing: fill(g.throwing),
    boolean: fill(g.boolean),
    heuristic: fill(g.heuristic),
    configured: configuredFor(g.id),
  }));
}
