/**
 * docs/p2/auction/panels.js — the dead-mechanism guard, made unreachable.
 *
 * Team B4. This is the file that stands between the bench and the most-repeated
 * factual error about 2019.
 *
 * ======================================================================
 * THE RULE
 *
 * Google Ad Manager — the open-web DISPLAY exchange — moved to a unified
 * first-price auction on 2019-09-05. Google SEARCH did not, and never has. The
 * 2019 search change was rGSP, a randomised generalised second-price auction
 * the DOJ record shows was an explicit revenue play.
 *
 * `guards.js` refuses that pairing at the data level. `DESIGN.md` rule 8 makes
 * the guard permanent. Neither can stop a builder typing `channel: "search"`
 * above a first-price panel, so this module does not let a builder type a
 * channel at all.
 *
 *   - `panelChannels(record)` READS the surfaces out of the frozen scenario's
 *     own `mechanism_scope`. A panel cannot be about a surface the record does
 *     not put it on.
 *   - the panel's `mechanism` is read from `guards.mechanism2019()`, which
 *     derives it from `mechanism.json`. There is no literal `"first_price"` or
 *     `"rgsp"` string in this folder outside a comment.
 *   - the true sentence comes from `guards.mechanismSentence(channel)`, which
 *     renders it from the record — including the date and the record's own
 *     spelling of "rGSP".
 *   - `guards.assertScenarioMechanism()` then checks the whole rendered object.
 *
 * So the forbidden pairing is not forbidden. It cannot be expressed.
 *
 * WHAT THIS DOES NOT COVER, stated because a guard that oversells itself is
 * worse than none. G7's caption test is CONTAINMENT: it proves the record's
 * true sentence is on screen and proves nothing about a false one printed
 * beside it. The prose lint is advice and misses ordinary English.
 *
 * AND WHAT IT DID NOT EVEN LOOK AT, until `lintRenderedStrings` below.
 * `mintPanel` hands `guards.assertScenarioMechanism` the object it built — id,
 * channel, mechanism, title, headline, captions — and the lint inside that
 * guard scans the strings on THAT object. Everything else a reader meets is
 * built later, by `scenarios.js` and `bench.js`: the teaching sentence, every
 * control note, the note under the instrument, the band's note and excursion,
 * the plate sentences, every figure label and every `derivedFrom` line. Thirteen
 * such surfaces on sc-10's search panel alone. Each was verified by injection:
 * write the false 2019 claim into any one of them and the arithmetic gate stays
 * green, G7 passes, and the panel's own advisory returns zero findings, because
 * the string was never in front of it.
 *
 * So the lint is now pointed at the rendered page — see `lintRenderedStrings`.
 * It is still advice, for the reason `guards.js` gives at length: a regex over
 * English is not a decision procedure. What changed is its INPUT. It used to be
 * advice about six fields; it is now advice about every string on screen.
 * ======================================================================
 */

import * as guards from '../lib/guards.js';

export class PanelError extends Error {
  constructor(message, detail = null, fix = null) {
    super(fix ? `${message}\n  FIX: ${fix}` : message);
    this.name = 'PanelError';
    this.detail = detail;
    this.fix = fix;
  }
}

/* ------------------------------------------------------------------ *
 * 1 · THE FROZEN SCENARIO RECORD
 * ------------------------------------------------------------------ */

/** The scenario record, by id, out of the frozen file. */
export function scenarioRecord(id, paramsFile) {
  const params = paramsFile || guards.getFrozen('simulatorParams');
  if (!params) {
    throw new PanelError(
      'simulator-params.json is not loaded, so no panel can be built.', { id },
      'await guards.loadFrozen(), or guards.useFrozen({ simulatorParams })'
    );
  }
  const record = (params.scenarios || []).find((s) => s.id === id);
  if (!record) {
    throw new PanelError(
      `"${id}" is not a scenario in simulator-params.json.`,
      { id, known: (params.scenarios || []).map((s) => s.id) },
      'every panel on screen exists in the frozen record first'
    );
  }
  return record;
}

/**
 * A scenario's settings, with `inherits` resolved.
 *
 * Three of the ten scenarios inherit another scenario's settings. The resolver
 * refuses a cycle and refuses an unresolvable parent, for the reason `guards.js`
 * gives: settings a checker cannot see are settings it cannot check.
 *
 * `guards.js` has its own resolver for a different job — scanning settings for a
 * first-price rule. This one computes. Both being wrong in the same way is the
 * risk, and the arithmetic gate is what closes it: if this resolver produced
 * the wrong numbers, every figure in the inheriting panels would miss its
 * stored step and the gate would fail loudly.
 */
export function resolveSettings(id, paramsFile, seen = []) {
  if (seen.includes(id)) {
    throw new PanelError(
      `settings inheritance loops: ${[...seen, id].join(' -> ')}.`, { chain: [...seen, id] },
      'break the cycle in simulator-params.json'
    );
  }
  const record = scenarioRecord(id, paramsFile);
  const own = record.settings || {};
  if (!own.inherits) return { ...own };
  const parent = resolveSettings(own.inherits, paramsFile, [...seen, id]);
  const merged = { ...parent, ...own };
  delete merged.inherits;
  return merged;
}

/**
 * WHICH SCENARIO EACH RESOLVED SETTING ACTUALLY CAME FROM.
 *
 * ======================================================================
 * INHERITANCE IS A SUBSTITUTION, AND ONE OF THEM IS THE ONE `mintCast` REFUSES.
 *
 * `resolveSettings` merges a parent's settings under a child's. That is what the
 * record asks for and it is right for almost everything. It is not right for
 * `true_ctrs`.
 *
 * sc-07's whole subject is the gap between the click rate the SELLER forecast
 * and the rate that actually happened. Its frozen record inherits sc-02 and
 * overrides `true_ctrs` with [0.01, 0.02, 0.01]. Delete that one override and
 * sc-07 inherits sc-02's `true_ctrs`, which are equal to sc-02's
 * `predicted_ctrs` — so the seller's forecast becomes exactly what happened, the
 * panel renders $52.58 and a green gate, and the scenario teaches nothing while
 * looking completely fine.
 *
 * `mintCast` cannot catch that. It guards the LENGTH of the array, and an
 * inherited array is full length. The thing that is missing is not a number; it
 * is the array's provenance. So provenance is what this returns.
 *
 * It is a map from setting key to the id of the scenario that supplied the
 * value. A scenario that needs a setting to be its own asks here and refuses to
 * run otherwise — see `ownSetting()` in scenarios.js.
 * ======================================================================
 */
export function settingsProvenance(id, paramsFile, seen = []) {
  if (seen.includes(id)) {
    throw new PanelError(
      `settings inheritance loops: ${[...seen, id].join(' -> ')}.`, { chain: [...seen, id] },
      'break the cycle in simulator-params.json'
    );
  }
  const record = scenarioRecord(id, paramsFile);
  const own = record.settings || {};
  const from = {};
  if (own.inherits) {
    for (const [key, value] of Object.entries(settingsProvenance(own.inherits, paramsFile, [...seen, id]))) {
      from[key] = value;
    }
  }
  for (const key of Object.keys(own)) {
    if (key === 'inherits') continue;
    from[key] = id;
  }
  return from;
}

/* ------------------------------------------------------------------ *
 * 2 · THE CHANNEL, WHICH IS NEVER TYPED
 * ------------------------------------------------------------------ */

/**
 * Which surfaces this scenario's own frozen scope puts it on.
 *
 * sc-01 to sc-05 and sc-07 to sc-09 return `["search"]`. sc-06 returns
 * `["display"]`. sc-10 returns both, and that is why it is the one scenario
 * drawn as two panels.
 */
export function panelChannels(record, paramsFile) {
  const params = paramsFile || guards.getFrozen('simulatorParams');
  const scopes = guards.scenarioMechanismScopes(record, { simulatorParams: params });
  const seen = [];
  for (const scope of scopes) if (!seen.includes(scope.surface)) seen.push(scope.surface);
  return seen;
}

/**
 * Mint one panel.
 *
 * The caller names a scenario and, when the scenario covers two surfaces, which
 * of them this panel is. It never names a mechanism. The mechanism, the true
 * sentence and the date all come out of `mechanism.json` through `guards.js`.
 */
export function mintPanel(id, { channel = null, headline = null, captions = [], title = null } = {}) {
  const params = guards.getFrozen('simulatorParams');
  const mechanism = guards.getFrozen('mechanism');
  const record = scenarioRecord(id, params);
  const channels = panelChannels(record, params);

  let surface = channel;
  if (surface == null) {
    if (channels.length !== 1) {
      throw new PanelError(
        `scenario "${id}" covers ${channels.join(' and ')}, so a panel has to say which one ` +
        'it is. A panel that draws an auction and does not name its channel teaches the ' +
        'reader that it applies to all of them.',
        { id, channels },
        `pass channel: one of ${channels.join(', ')}`
      );
    }
    [surface] = channels;
  }
  if (!channels.includes(surface)) {
    throw new PanelError(
      `scenario "${id}" was asked for as the ${surface} panel and its frozen scope covers ` +
      `${channels.join(', ')} only.`,
      { id, asked: surface, channels },
      'the record decides which side of the business a panel belongs to'
    );
  }

  /* THE MECHANISM IS READ, NEVER TYPED. mechanism2019() derives it from
   * mechanism.json, so "search" cannot arrive here holding "first_price". */
  const map = guards.mechanism2019(mechanism);
  const declaredMechanism = map[surface];
  const trueSentence = guards.mechanismSentence(surface, mechanism);

  const rendered = {
    id,
    channel: surface,
    mechanism: declaredMechanism,
    title: title || null,
    headline: headline || (record.expected_output && record.expected_output.headline) || null,
    captions: [trueSentence, ...captions, ...guards.requiredCaptions(record)],
  };

  /* AND THEN THE GUARD CHECKS THE WHOLE THING. Scope, shape and caption. */
  const verdict = guards.assertScenarioMechanism(rendered, {
    simulatorParams: params, mechanism,
  });

  const settings = resolveSettings(id, params);
  assertNoUnappliedFormatMultiplier(id, settings);

  return Object.freeze({
    id,
    record,
    settings,
    /** Which scenario supplied each setting. See `settingsProvenance` above. */
    settingsFrom: Object.freeze(settingsProvenance(id, params)),
    channel: surface,
    channels: Object.freeze(channels),
    mechanism: declaredMechanism,
    trueSentence,
    scopes: verdict.scopes,
    requiredCaptions: Object.freeze(guards.requiredCaptions(record)),
    captions: Object.freeze(rendered.captions),
    headline: rendered.headline,
    demonstrates: record.demonstrates || null,
    exampleRef: record.example_ref || null,
    expected: record.expected_output || {},
    /** The lint's findings, carried rather than swallowed. Advice, not a pass. */
    advisory: verdict.advisory,
    rendered: Object.freeze(rendered),
  });
}

/**
 * A SETTING THE ENGINE DOES NOT APPLY MAY NOT SIT IN THE RECORD UNREAD.
 *
 * ======================================================================
 * `runAuction` used to take a `formatMultiplier` and default it to 1, and the
 * README defended the default on the grounds that "it is not a number the record
 * stores, so it cannot be right by luck". The record stores it: sc-01 and sc-02
 * both carry `format_multiplier: 1.0`, and sc-09 carries a whole control
 * definition for it. The default was right by luck, in exactly the sense the
 * paragraph above it condemned — and nothing in `scenarios.js` ever passed the
 * setting, so changing the record's 1.0 to 1.25 would have changed nothing on
 * screen and said nothing about it.
 *
 * The engine no longer has the parameter. `mechanism.json` ex-6 measures format
 * pricing on REVENUE PER THOUSAND QUERIES, not as a multiplier on this cast's
 * prices, and sc-09's format control moves that index — bound to ex-6's own
 * stored steps, at the record's own marked stops.
 *
 * That leaves one hazard: a record that asks for a price multiplier this engine
 * will not apply. Silence there is the same defect wearing the opposite coat, so
 * a scalar `format_multiplier` other than the identity is REFUSED here rather
 * than ignored. 1.0 is read, checked and allowed, because 1.0 is a statement
 * that no multiplier applies and that is a statement this engine can honour.
 * ======================================================================
 */
export function assertNoUnappliedFormatMultiplier(id, settings) {
  const value = settings && settings.format_multiplier;
  if (value == null || typeof value === 'object') return settings;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new PanelError(
      `scenario "${id}" carries a format_multiplier of ${JSON.stringify(value)}, which is ` +
      'neither a number nor a control definition.',
      { id, format_multiplier: value },
      'format_multiplier is either 1.0, or an object declaring the control the panel draws'
    );
  }
  if (Math.abs(value - 1) > 1e-12) {
    throw new PanelError(
      `scenario "${id}" asks for a format_multiplier of ${value} on this cast's prices, and this ` +
      'engine does not apply one. mechanism.json ex-6 measures format pricing on revenue per ' +
      'thousand queries, so sc-09 moves an index bound to ex-6\'s steps and no panel multiplies ' +
      'the three-advertiser cast. A setting that reaches the record and never reaches the ' +
      'arithmetic is a setting nobody can see is being ignored.',
      { id, format_multiplier: value },
      'either set it to 1.0, or add the multiplier to the engine and to the steps that check it'
    );
  }
  return settings;
}

/* ------------------------------------------------------------------ *
 * 3 · THE PROSE LINT, POINTED AT THE WHOLE PAGE
 * ------------------------------------------------------------------ */

/**
 * Run the dead-mechanism lint over a list of reader-facing strings.
 *
 * ======================================================================
 * WHY THIS TAKES STRINGS AND NOT AN OBJECT.
 *
 * `assertScenarioMechanism` lints the panel object, which is what `mintPanel`
 * built. That covers the captions and nothing else, and the captions were never
 * the risk: they are rendered from the record by `mechanismSentence()`. The risk
 * is every sentence a human wrote — the teaching line, the control notes, the
 * note under the instrument, the plate sentences, the band's note, a figure's
 * label, a written derivation. None of those exists at mint time.
 *
 * `bench.js` calls this with `domSentences(shell)`, which is every text-bearing
 * leaf, every SVG `<title>` and every `aria-label` on the rendered page. The
 * coverage argument is then the same one the DOM-reading `sentences()` made:
 * a list read off the page cannot be a list of what somebody remembered.
 *
 * IT STILL DOES NOT THROW, and it is still ADVICE. `guards.js` spends four
 * screens on why, and the summary is that paraphrase is unbounded. Two ordinary
 * English sentences it verifiably misses are printed in `limits`. What this buys
 * is that the lint is now aimed at the strings that can carry the claim, so an
 * empty result is at least an empty result about the right text. The enforcement
 * is still `assertSimulatorMechanismScopes()` over the frozen record.
 * ======================================================================
 */
export function lintRenderedStrings(strings, context) {
  const where = context || 'the rendered bench';
  const findings = [];
  for (const text of strings || []) {
    for (const finding of guards.lintTextForDeadMechanism(text, where)) findings.push(finding);
  }
  return Object.freeze({
    heuristic: true,
    context: where,
    scanned: (strings || []).length,
    findings: Object.freeze(findings),
    limits: guards.DEAD_MECHANISM_LINT_LIMITS,
    note: findings.length === 0
      ? `the text lint read ${(strings || []).length} rendered string(s) and found nothing, ` +
        'which is not a clearance — the scope check over the frozen record is'
      : `the text lint flagged ${findings.length} rendered string(s) on ${where}; read them, and ` +
        'prefer mechanismSentence(channel) to a typed sentence',
  });
}

/**
 * The scope, in a sentence a reader can use.
 *
 * The years and the surface come from the record. Nothing here is typed.
 */
export function scopeSentence(panel) {
  const parts = panel.scopes.map((scope) => {
    const years = scope.years[0] === scope.years[1]
      ? `${scope.years[0]}`
      : `${scope.years[0]} to ${scope.years[1]}`;
    return `${ruleWords(scope.rule)} on ${scope.surface}, ${years}`;
  });
  return `This panel draws ${parts.join('; and ')}.`;
}

/** A rule id in a reader's words. The ids themselves are the record's. */
export function ruleWords(rule) {
  const words = {
    pure_bid: 'ranking by bid alone',
    gsp: 'the quality-weighted second-price auction',
    second_price: 'the second-price benchmark',
    squashed_gsp: 'squashing',
    format_pricing: 'format pricing',
    rgsp: 'rGSP',
    first_price: 'the unified first-price auction',
    default_placement_deal: 'the default-placement deal',
  };
  return words[rule] || rule;
}

export default {
  scenarioRecord, resolveSettings, settingsProvenance, panelChannels, mintPanel,
  scopeSentence, lintRenderedStrings, assertNoUnappliedFormatMultiplier,
  ruleWords, PanelError,
};
