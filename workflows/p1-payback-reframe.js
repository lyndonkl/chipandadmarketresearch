export const meta = {
  name: 'p1-payback-reframe',
  description: 'Re-cut P1 payback to total-program NPV: Damodaran DCF variants (bear/base/bull) -> superforecaster probability -> rewrite chapters 08 & 09',
  phases: [
    { title: 'DCF', detail: 'three Damodaran revenue-based DCF variants value the whole US AI buildout' },
    { title: 'Forecast', detail: 'superforecaster panel: P(NPV-positive at cost of capital)' },
    { title: 'Rewrite', detail: 'chapters 08 payback + 09 verdict, total-program framing, readability-gated' },
  ],
}

const ROOT = args.root
const TODAY = args.today
const PL = args.payloadPath

const DCF_SCHEMA = {
  type: 'object',
  required: ['variant', 'wacc_pct', 'cumulative_capex_2024_2030_usd_bn', 'ai_revenue_2030_runrate_usd_bn', 'revenue_cagr_2026_2030_pct', 'ai_gross_margin_pct', 'terminal_growth_pct', 'npv_usd_bn', 'irr_pct', 'breakeven_revenue_2030_usd_bn', 'pays_off', 'key_assumptions', 'sensitivities', 'reasoning'],
  properties: {
    variant: { enum: ['bear', 'base', 'bull'] },
    wacc_pct: { type: 'number' },
    cumulative_capex_2024_2030_usd_bn: { type: 'number' },
    cumulative_capex_ci80: { type: 'array', items: { type: 'number' } },
    ai_revenue_2030_runrate_usd_bn: { type: 'number' },
    revenue_cagr_2026_2030_pct: { type: 'number' },
    ai_gross_margin_pct: { type: 'number' },
    terminal_growth_pct: { type: 'number' },
    terminal_value_usd_bn: { type: 'number' },
    failure_writedown_prob_pct: { type: 'number' },
    npv_usd_bn: { type: 'number' },
    irr_pct: { type: 'number' },
    breakeven_revenue_2030_usd_bn: { type: 'number' },
    pays_off: { type: 'boolean' },
    key_assumptions: { type: 'array', items: { type: 'string' } },
    sensitivities: { type: 'array', items: { type: 'object', required: ['driver', 'effect'], properties: { driver: { type: 'string' }, effect: { type: 'string' } } } },
    reasoning: { type: 'string' },
  },
}

const FC_SCHEMA = {
  type: 'object',
  required: ['probability', 'reasoning_summary', 'reference_classes', 'key_uncertainties', 'terminal_sensitivity'],
  properties: {
    probability: { type: 'number' },
    reasoning_summary: { type: 'string' },
    reference_classes: { type: 'array', items: { type: 'string' } },
    key_uncertainties: { type: 'array', items: { type: 'string' } },
    terminal_sensitivity: { type: 'string' },
  },
}

const CH_SCHEMA = {
  type: 'object',
  required: ['path', 'title', 'word_count', 'readability_pass', 'scores_line', 'claim_ids_used', 'headline_findings'],
  properties: {
    path: { type: 'string' }, title: { type: 'string' }, word_count: { type: 'number' },
    readability_pass: { type: 'boolean' }, scores_line: { type: 'string' },
    claim_ids_used: { type: 'array', items: { type: 'string' } },
    headline_findings: { type: 'array', items: { type: 'string' } },
  },
}

const NOSEARCH = `The evidence base at ${PL} is already gathered and adversarially verified. Do NOT perform web searches (the session budget is exhausted and it is unnecessary). Read that file and reason from it. Where you need a figure it does not contain, state the assumption explicitly and proceed.`

// ---------- Phase A: three Damodaran DCF variants ----------
phase('DCF')
log('Building three total-program DCF variants (bear/base/bull) as Damodaran revenue-based DCFs')

const VARIANTS = [
  { v: 'bear', seed: `BEAR inputs: aggressive silicon depreciation (frontier chips ~3.9yr economic life, older gens re-price down fast); AI gross margin compresses toward 30-35% as open-weight competition and convergence bite; WACC ~11% (risk premium for unproven demand durability + circular vendor financing); terminal growth ~2%; assign a meaningful failure/writedown probability to the neocloud/SPV/lab-directed tranche; demand elasticity disappoints (cheaper intelligence does NOT fully absorb new supply).` },
  { v: 'base', seed: `BASE inputs: blended economic life ~7yr (short-lived silicon ~58% at 5-6yr books, shell/power/land ~42% at 15yr); AI gross margin ~40-45% trending on serving improvements; WACC ~9.5%; terminal growth ~3-4%; modest writedown on the most speculative builds; demand keeps compounding but decelerates (revenue CAGR settles well below current 100%+ toward 35-50%).` },
  { v: 'bull', seed: `BULL inputs: hardware useful life extends (older GPUs keep earning post-frontier, CoreWeave re-signed H100 at ~95% of prior price); margins hold via product integration and token-efficiency (cost per finished task keeps falling); WACC ~8.5%; terminal growth ~4-5%; negligible aggregate writedown because sold-out demand persists; up-stack revenue (agents, Claude Code-style products) lifts the app-layer multiple on infra.` },
]

const dcfs = await parallel(VARIANTS.map(V => () =>
  agent(`You are a Damodaran-style valuation analyst. Apply the intrinsic-valuation-dcf, cost-of-capital-estimator, project-investment-analyzer, and special-situations-valuation methods.

TASK: Value the ENTIRE US AI-industry buildout 2024-2030 as ONE high-growth, currently-negative-earnings project, and decide whether the TOTAL investment pays off. This is deliberately NOT a single-vintage question — sum ALL US AI-attributable capex across all years (hyperscalers MSFT/AMZN/GOOG/META/ORCL, neoclouds like CoreWeave, and the labs' own compute) against ALL US AI-attributable revenue (lab + cloud AI + app layer, net of double-counting). Because you take the total, there is NO vintage attribution to do.

PAYOFF BAR (strict): NPV-positive at cost of capital. Cumulative AI revenue at a realistic gross margin must cover depreciation of the hardware PLUS a fair return on capital at your WACC. A soft revenue>capex test is NOT sufficient. Horizon: model explicitly to end-2030, then attach a terminal value for the tail (state the steady-state margin and growth you assume). Make the boundary between forecast and terminal assumption explicit.

YOUR VARIANT: ${V.v.toUpperCase()}. ${V.seed}

Build the model concretely: cumulative capex 2024-2030, the AI revenue path and its 2026->2030 CAGR, gross margin, WACC, depreciation schedule, terminal value, NPV, IRR, and the 2030 revenue run-rate required for NPV=0 (breakeven). Triangulate your revenue-needed figure against the digest's Cahn (~$1.5T/yr) and Bain (~$2T by 2030) anchors and explain any difference. Report pays_off as the sign of NPV under YOUR variant's assumptions.

${NOSEARCH}

Today is ${TODAY}. Be numerically explicit and calibrated; do not hide behind ranges without a central estimate.`,
    { label: 'dcf:' + V.v, phase: 'DCF', schema: DCF_SCHEMA, agentType: 'special-situations-analyst' })
)).then(a => a.filter(Boolean))

if (!dcfs.length) throw new Error('all DCF variants failed')
log('DCF done: ' + dcfs.map(d => `${d.variant} NPV=$${Math.round(d.npv_usd_bn)}bn IRR=${d.irr_pct}% pays_off=${d.pays_off}`).join(' | '))

const DCF_BLOCK = 'THREE DCF MODELS (bear/base/bull) of the TOTAL US AI buildout:\n' + JSON.stringify(dcfs.map(d => ({
  variant: d.variant, wacc: d.wacc_pct, cum_capex_bn: d.cumulative_capex_2024_2030_usd_bn,
  rev2030_bn: d.ai_revenue_2030_runrate_usd_bn, rev_cagr: d.revenue_cagr_2026_2030_pct,
  margin: d.ai_gross_margin_pct, terminal_g: d.terminal_growth_pct, npv_bn: d.npv_usd_bn,
  irr: d.irr_pct, breakeven2030_bn: d.breakeven_revenue_2030_usd_bn, pays_off: d.pays_off,
  assumptions: d.key_assumptions, sensitivities: d.sensitivities,
})), null, 1)

// ---------- Phase B: superforecaster panel ----------
phase('Forecast')
log('Superforecaster panel: probability the total program is NPV-positive at cost of capital')

const LENSES = [
  { name: 'outside-view', stance: 'Reason OUTSIDE VIEW FIRST: reference-class the payoff of total build-outs of a new general-purpose technology at cost of capital (electricity, railroads, telecom/fiber, cloud, mobile). Distrust "this time is different". Anchor before you touch the DCF specifics.' },
  { name: 'valuation', stance: 'Reason from the DCF: weigh the three models, judge which assumption set is most defensible, and let the NPV distribution drive your probability. Treat the base as the anchor and the bear/bull as the tails.' },
  { name: 'contrarian', stance: 'Identify the answer the DCF spread implies, then genuinely attack it both ways — the strongest case the buildout is a value trap, and the strongest case it clears easily. Guard against both hype and reflexive doom.' },
]

const fcs = await parallel(LENSES.map(L => () =>
  agent(`Forecasting persona: ${L.name}. ${L.stance}

QUESTION (binary): Will the TOTAL US AI-industry investment be NPV-POSITIVE at cost of capital, judged over a to-end-2030-plus-terminal horizon? I.e., does cumulative US AI-attributable revenue (at realistic margin) cover cumulative capex depreciation PLUS a fair ~9-10% return on capital? Return probability in [0,1]. This is the total-program question across ALL vintages, not one slice.

${DCF_BLOCK}

${NOSEARCH}

Today is ${TODAY}. Superforecaster discipline: reference classes, Fermi decomposition, Bayesian update on the DCF specifics, premortem, then a granular probability (e.g. 0.58, not 0.6). In terminal_sensitivity, state how much your answer moves if the post-2030 steady-state margin or growth is one notch worse.`,
    { label: 'fc:' + L.name, phase: 'Forecast', schema: FC_SCHEMA, agentType: 'superforecaster' })
)).then(a => a.filter(Boolean))

const probs = fcs.map(f => f.probability).filter(n => typeof n === 'number').sort((a, b) => a - b)
const median = probs.length % 2 ? probs[(probs.length - 1) / 2] : (probs[probs.length / 2 - 1] + probs[probs.length / 2]) / 2
const npvs = dcfs.map(d => d.npv_usd_bn)
log(`Panel probabilities: ${probs.map(p => Math.round(p * 100) + '%').join(', ')} -> median ${Math.round(median * 100)}%`)

const forecastRecord = {
  target_id: 'T-payback-total',
  supersedes: 'T-payback (vintage-scoped; retained as superseded)',
  question: 'Will the TOTAL US AI-industry investment (all vintages 2024-2030 + terminal) be NPV-positive at cost of capital (~9-10% WACC)?',
  framing: { horizon: 'end-2030 + explicit terminal', scope: 'US total AI industry', payoff_bar: 'NPV-positive at cost of capital', note: 'total-program framing dissolves vintage attribution' },
  kind: 'binary',
  headline_probability_median: median,
  panel: fcs.map((f, i) => ({ persona: LENSES[i].name, probability: f.probability, reasoning: f.reasoning_summary, reference_classes: f.reference_classes, key_uncertainties: f.key_uncertainties, terminal_sensitivity: f.terminal_sensitivity })),
  dcf_models: dcfs,
  npv_spread_usd_bn: [Math.min(...npvs), Math.max(...npvs)],
}

// ---------- Phase C: rewrite chapters 08 and 09 ----------
phase('Rewrite')
log('Rewriting chapters 08 (payback) and 09 (verdict) to the total-program framing')

const chapterAgent = (n, file, title, focus) => () =>
  agent(`Rewrite chapter ${n} of the P1 research essay to reflect a REFRAMED payback question. Read the current file first: ${ROOT}/p1-ai-economics/research/${file} — preserve its good prose, voice, footnote style, and any still-valid claims, but re-cut the payback logic.

THE REFRAME (this is the point of the rewrite): the payback question is no longer about the 2024-2026 capex *vintage*. It is now the TOTAL-PROGRAM question: does the WHOLE US AI-industry investment pay off — all vintages, earlier and later — judged as NPV-positive at cost of capital over a to-2030-plus-terminal horizon? Taking the total DISSOLVES the old scarcity-rent-vs-pro-rata attribution debate: with no single slice to isolate, there is nothing to attribute. Say this explicitly and plainly; it is a genuine simplification the reader should understand. The hard part is now entirely the forward revenue/margin/terminal forecast.

TITLE: "${title}". FOCUS: ${focus}

Use the DCF models and the superforecaster probability below as the spine. Present the three-model spread (bear/base/bull NPV) and the panel's median probability. Explain in one plain paragraph what "NPV-positive at cost of capital" means for a general reader (earns back the money PLUS what that money could have earned elsewhere). Note the honest caveat: because capex is still accelerating, this is mostly a bet on the future, so the answer is a probability, not a yes/no.

Then WRITE the file back to ${ROOT}/p1-ai-economics/research/${file} with the Write tool, and verify with Bash: python3 ${ROOT}/tools/readability.py ${ROOT}/p1-ai-economics/research/${file} — iterate until it prints PASS (FK<=10, ease>=50, fog<=12, smog<=12). Simplify sentences, never the ideas.

GROUNDING: every number must come either from the DCF/forecast block below or from the existing chapter's cited claims — keep footnotes intact and add footnotes for any new figure. Frontmatter keys: title, project: p1-ai-economics, chapter: ${n}, claims_used: [list], readability: "<PASS line>", status: draft-for-review, framing: total-program-npv.

DCF + FORECAST (JSON):
${JSON.stringify(forecastRecord, (k, v) => k === 'dcf_models' ? v.map(d => ({ variant: d.variant, wacc_pct: d.wacc_pct, cumulative_capex_2024_2030_usd_bn: d.cumulative_capex_2024_2030_usd_bn, ai_revenue_2030_runrate_usd_bn: d.ai_revenue_2030_runrate_usd_bn, revenue_cagr_2026_2030_pct: d.revenue_cagr_2026_2030_pct, ai_gross_margin_pct: d.ai_gross_margin_pct, npv_usd_bn: d.npv_usd_bn, irr_pct: d.irr_pct, breakeven_revenue_2030_usd_bn: d.breakeven_revenue_2030_usd_bn, pays_off: d.pays_off, key_assumptions: d.key_assumptions })) : v)}

Also read the verified evidence at ${PL} for any capex/revenue claim ids you cite. Today is ${TODAY}.

Return: path, title, word_count, readability_pass (true only if the tool printed PASS), scores_line, claim_ids_used, headline_findings (3-5 bullets).`,
    { label: 'ch' + n, phase: 'Rewrite', schema: CH_SCHEMA })

const chapters = (await parallel([
  chapterAgent(8, '08-payback.md', 'The Payback Question', 'Can the whole buildout pay for itself? Present the three DCF models and the panel probability as the answer, and the disagreement as the finding. Explain the method plainly.'),
  chapterAgent(9, '09-verdict.md', 'The Verdict', 'Walk each thesis proposition T1..T6 and rule supported/partly/unresolved. For the payback, use the total-program NPV result, not the old vintage number. End with what would change the verdict and what to watch.'),
])).filter(Boolean)

log('Chapters rewritten: ' + chapters.map(c => c.path.split('/').pop() + (c.readability_pass ? ' PASS' : ' FAIL')).join(', '))

return { forecastRecord, chapters, dcfSummary: dcfs.map(d => ({ variant: d.variant, npv_usd_bn: d.npv_usd_bn, irr_pct: d.irr_pct, pays_off: d.pays_off, revenue_cagr: d.revenue_cagr_2026_2030_pct, breakeven2030: d.breakeven_revenue_2030_usd_bn })), medianProbability: median }
