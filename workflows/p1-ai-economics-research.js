export const meta = {
  name: 'p1-ai-economics-research',
  description: 'P1 research: AI fixed/marginal costs, CapEx wave, revenues, China, calibrated claims + superforecaster panel + readability-gated chapters',
  phases: [
    { title: 'Thesis', detail: 'reconstruct the Stratechery thesis into testable propositions' },
    { title: 'Research', detail: '9 topic researchers returning calibrated claims' },
    { title: 'Verify', detail: 'adversarial 2-lens check of load-bearing claims' },
    { title: 'Forecast', detail: 'superforecaster panel: 5 targets x 3 panelists' },
    { title: 'Write', detail: '9 readability-gated chapter drafts' },
  ],
}

const ROOT = args.root
const TODAY = args.today

// ---------- schemas ----------
const SOURCES = { type: 'array', items: { type: 'object', required: ['title', 'url'], properties: { title: { type: 'string' }, url: { type: 'string' }, date: { type: 'string' } } } }

const THESIS_SCHEMA = {
  type: 'object', required: ['summary', 'propositions', 'sources'],
  properties: {
    summary: { type: 'string' },
    propositions: { type: 'array', items: { type: 'object', required: ['id', 'statement', 'testable_via'], properties: { id: { type: 'string' }, statement: { type: 'string' }, testable_via: { type: 'string' } } } },
    sources: SOURCES,
  },
}

const RESEARCH_SCHEMA = {
  type: 'object', required: ['summary', 'claims'],
  properties: {
    summary: { type: 'string' },
    claims: {
      type: 'array', items: {
        type: 'object',
        required: ['metric', 'entity', 'period', 'value', 'unit', 'ci80_low', 'ci80_high', 'grade', 'load_bearing', 'sources', 'notes'],
        properties: {
          metric: { type: 'string' }, entity: { type: 'string' }, period: { type: 'string' },
          value: { type: 'number' }, unit: { type: 'string' },
          ci80_low: { type: 'number' }, ci80_high: { type: 'number' },
          grade: { enum: ['A', 'B', 'C'] }, load_bearing: { type: 'boolean' },
          sources: SOURCES, notes: { type: 'string' },
        },
      },
    },
  },
}

const VERIFY_SCHEMA = {
  type: 'object', required: ['verdict', 'reasoning'],
  properties: {
    verdict: { enum: ['confirm', 'adjust', 'refute'] },
    corrected_value: { type: 'number' }, corrected_ci80_low: { type: 'number' }, corrected_ci80_high: { type: 'number' },
    reasoning: { type: 'string' }, extra_sources: SOURCES,
  },
}

const FORECAST_SCHEMA = {
  type: 'object', required: ['target_id', 'reasoning_summary', 'reference_classes', 'key_uncertainties'],
  properties: {
    target_id: { type: 'string' },
    probability: { type: 'number' },
    point: { type: 'number' }, ci80_low: { type: 'number' }, ci80_high: { type: 'number' },
    reference_classes: { type: 'array', items: { type: 'string' } },
    reasoning_summary: { type: 'string' },
    key_uncertainties: { type: 'array', items: { type: 'string' } },
  },
}

const CHAPTER_SCHEMA = {
  type: 'object', required: ['path', 'title', 'word_count', 'readability_pass', 'scores_line', 'claim_ids_used', 'headline_findings'],
  properties: {
    path: { type: 'string' }, title: { type: 'string' }, word_count: { type: 'number' },
    readability_pass: { type: 'boolean' }, scores_line: { type: 'string' },
    claim_ids_used: { type: 'array', items: { type: 'string' } },
    headline_findings: { type: 'array', items: { type: 'string' } },
  },
}

// ---------- shared prompt fragments ----------
const CAL = `Calibration standard (mandatory): every number = central estimate + 80% confidence interval. You should be 80% sure the true value falls inside the CI — most analysts make CIs far too narrow, so widen yours until you would genuinely take a 4:1 bet on it. Source grades: A = official filings, disclosures, on-the-record company statements. B = credible named reporting or research (Reuters, Bloomberg, WSJ, FT, The Information, SemiAnalysis, Epoch AI, analyst notes with attribution). C = your own triangulated or Fermi estimate (document the method in notes). Mark load_bearing: true on the 5-8 claims most critical to testing the thesis — those get independently verified. Put explicit units in the unit field (e.g. "USD billions per year", "USD per million tokens"). Today is ${TODAY}. Prefer the newest data; put the as-of date in period. Return 10-18 claims. Search extensively — 8 to 15 distinct searches, follow through to primary sources; never quote a number from memory without checking it.`

// ---------- Phase 1: thesis ----------
phase('Thesis')
log('Reconstructing the Thompson thesis from public sources')
const thesis = await agent(`You are a research analyst. Reconstruct Ben Thompson's argument about AI inference economics from PUBLIC sources so it can be tested with data. Anchor: the Stratechery podcast/article "Who's Afraid of Chinese Models?" (2026) — use its public description plus Thompson's related public essays and credible discussions of his argument (search for Stratechery on marginal cost of inference, tokens as commodity, Chinese open-source models, AI capex amortization). The argument as relayed to us (verify and correct against sources): (1) training frontier models is a huge fixed cost (data, engineering, compute) amortized over years as capex; (2) US inference is supply-constrained and two providers — OpenAI and Anthropic — hold pricing power, so US tokens are priced well above marginal cost; (3) in China the marginal supplier sets prices at roughly marginal cost, with open-source labs eating or externalizing fixed costs; (4) when US supply catches demand, prices converge toward marginal cost, forcing differentiation and threatening capex payback. Formalize 4-6 numbered, individually testable propositions (id like "T1"), each with testable_via: what data would confirm or refute it. In summary (200-350 words) state the argument fairly, including what Thompson himself flags as uncertain. Cite sources. Today is ${TODAY}.`,
  { label: 'thesis', phase: 'Thesis', schema: THESIS_SCHEMA })
if (!thesis) throw new Error('thesis agent failed')
log('Thesis formalized: ' + thesis.propositions.map(p => p.id).join(', '))

const THESIS_BRIEF = 'THE THESIS UNDER TEST:\n' + thesis.summary + '\nPropositions:\n' + thesis.propositions.map(p => p.id + ': ' + p.statement).join('\n')

// ---------- Phase 2+3: research pipeline with per-topic verification ----------
const TOPICS = [
  { key: 'fx', name: 'Fixed costs of frontier training', prompt: `Research the FIXED costs of building frontier AI models, 2022-2026. Cover: estimated training compute cost for landmark models (GPT-4 and successors, Claude 3/3.5/4 series, Gemini generations, Grok, Llama 3/4, DeepSeek-V3/R1, Qwen flagships) — use Epoch AI, SemiAnalysis, papers, credible reporting; cost of data acquisition/licensing and cleaning (publisher deals, annotation contracts, Scale AI style spend); research/engineering payroll scale for the deep-tier labs (headcount x comp); how total "cost to build a frontier model" splits between compute, data, people; and how fast the frontier training cost has grown per year.` },
  { key: 'mc', name: 'Marginal cost of inference', prompt: `Research the MARGINAL cost of serving AI inference in 2024-2026: cost to serve one million tokens for a frontier-class model (GPU rental rates for H100/H200/B200/GB200 class hardware, utilization rates, batching, electricity), published estimates of serving costs (SemiAnalysis, Epoch AI, academic/industry analyses, DeepSeek's own published inference-margin disclosure from its open-source week), what fraction of API list price the serving cost represents for OpenAI/Anthropic/Google flagship models, and reported gross margins on inference for US labs. Distinguish marginal serving cost from fully-loaded cost (which includes amortized training).` },
  { key: 'px', name: 'API price history US', prompt: `Build the per-token API price history 2022-2026 for US frontier labs: OpenAI (GPT-3 davinci through GPT-4, 4-Turbo, 4o, o-series, GPT-5 era), Anthropic (Claude 1 through current), Google (PaLM/Gemini tiers) — input and output USD per million tokens at launch and over time. Quantify: price decline per year at constant capability tier, price of the cheapest model matching a fixed benchmark level over time (Epoch AI and a16z have published such series), and current flagship vs mini/flash tier pricing. Also note subscription prices (ChatGPT/Claude tiers) and any price INCREASES.` },
  { key: 'cx', name: 'Hyperscaler AI CapEx wave', prompt: `Research the AI CapEx wave: annual capital expenditures 2022-2026 (actual + guided) for Microsoft, Amazon, Alphabet, Meta, Oracle, and CoreWeave, with the AI/data-center share where disclosed; OpenAI's Stargate program and compute commitments (reported multi-year totals and annual run-rates); Anthropic's compute deals (Google TPU, Amazon Trainium commitments); xAI's Colossus buildout. Also: total industry AI capex per year (aggregates from UBS/Morgan Stanley/Citi/Dell'Oro etc.), and what share of hyperscaler capex is GPUs/accelerators vs buildings/power.` },
  { key: 'rv', name: 'US lab revenues and margins', prompt: `Research revenues and margins of US AI labs 2023-2026: OpenAI (annualized revenue trajectory by year, revenue mix ChatGPT vs API, reported losses, compute spend, projections it has shared with investors), Anthropic (ARR trajectory, revenue mix API vs Claude subscriptions vs Claude Code, reported burn), reported gross margins for both (The Information and similar have published estimates), Google Gemini monetization signals, Microsoft AI revenue run-rate disclosures, xAI and Meta AI revenue where reported. Include valuation rounds as context (funding raised, post-money).` },
  { key: 'cd', name: 'China deep tier: DeepSeek and Qwen', prompt: `Research the economics of China's two flagship open-model labs. DeepSeek: the V3 $5.6M training-cost claim and what it does/doesn't include (the paper's own caveats), total compute fleet estimates (SemiAnalysis), High-Flyer hedge-fund funding structure, API pricing history including off-peak discounts, its published theoretical inference cost-profit-margin disclosure, R1/V3-era usage share. Alibaba/Qwen: Alibaba's AI capex program (the announced multi-year RMB investment), Qwen open-weight strategy, Qwen API pricing vs US labs, cloud-business strategy of giving models away. For both: WHO pays the fixed costs and what is the strategic rationale for pricing at/below marginal cost.` },
  { key: 'ce', name: 'China ecosystem: labs, price war, chips', prompt: `Research the wider Chinese AI model ecosystem 2024-2026: Moonshot (Kimi K-series economics and funding), Zhipu/Z.ai (funding incl. state-linked, IPO moves, pricing), MiniMax, ByteDance Doubao (its aggressive 2024 price cuts that triggered the China LLM price war) — with the price-war timeline and representative per-token prices vs US equivalents (often 10-100x cheaper). Also: government subsidies (state funds, compute vouchers, municipal AI subsidies), and the chip constraint — export controls, H20 saga, Huawei Ascend ramp — and how chip scarcity shapes Chinese labs' focus on efficiency and open-source distribution.` },
  { key: 'sd', name: 'Supply, demand, and capacity constraint', prompt: `Research evidence on AI compute SUPPLY vs DEMAND in the US 2024-2026: statements by OpenAI/Anthropic/Google/Microsoft leaders that they are compute-constrained (rate limits, paused signups, "melting GPUs" moments, enterprise capacity waitlists); token-consumption growth statistics (Google's disclosed monthly token counts, OpenRouter public rankings, Microsoft/Azure disclosures); GPU availability and lead times, data-center power as the binding constraint (interconnection queues, gigawatts under construction); Nvidia data-center revenue as a supply proxy; and any credible analyses of WHEN supply might catch demand or capacity gluts might emerge.` },
  { key: 'dp', name: 'Depreciation schedules and payback math', prompt: `Research how AI compute is depreciated and what payback requires: disclosed server/GPU depreciation schedules at Microsoft, Amazon, Alphabet, Meta, Oracle, CoreWeave (useful-life years, recent changes to useful life); the depreciation debate (Michael Burry's short thesis and rebuttals, analyst estimates of understated depreciation); estimates of the revenue required to justify the AI capex wave (Sequoia's "$600B question" by David Cahn and successors/updates, Morgan Stanley/Goldman/Bain revenue-gap analyses); actual GPU useful economic life evidence (A100s still serving, rental price decay curves for older GPU generations).` },
]

const claimId = (key, i) => key + '-' + String(i + 1).padStart(2, '0')

const researched = await pipeline(
  TOPICS,
  (t) => agent(`You are a market-research analyst working on a calibrated evidence base to test a thesis about AI economics.\n${THESIS_BRIEF}\n\nYOUR TOPIC: ${t.name}.\n${t.prompt}\n\n${CAL}\n\nIn summary, give a 200-300 word digest of what the evidence says on your topic, written plainly.`,
    { label: 'research:' + t.key, phase: 'Research', schema: RESEARCH_SCHEMA }),
  async (res, t) => {
    if (!res) { log('Topic ' + t.key + ' (' + t.name + ') FAILED — dropped'); return null }
    const claims = res.claims.map((c, i) => ({ id: claimId(t.key, i), topic: t.key, ...c }))
    const lb = claims.filter(c => c.load_bearing)
    log(t.key + ': ' + claims.length + ' claims, ' + lb.length + ' load-bearing -> verifying')
    const LENSES = [
      { name: 'primary-source', instr: 'Hunt for the PRIMARY source behind this claim (filing, paper, official disclosure, original report). Check whether the number, period, and unit are faithfully represented and whether the CI honestly reflects the source uncertainty.' },
      { name: 'contradiction', instr: 'Actively hunt for CONTRADICTING evidence: alternative estimates, later corrections, critiques, or reasons the number is misleading (wrong denominator, cherry-picked period, marketing framing). Default to adjust or refute if you find material conflict.' },
    ]
    const verdicts = await parallel(lb.flatMap(c => LENSES.map(l => () =>
      agent(`Adversarial verification, lens: ${l.name}. ${l.instr}\n\nCLAIM UNDER TEST (JSON):\n${JSON.stringify(c, null, 1)}\n\nContext: this claim helps test the thesis: ${THESIS_BRIEF.slice(0, 600)}...\nToday is ${TODAY}. Verdict rules: confirm = value and CI hold up; adjust = materially better value/CI exists (supply corrected_value and corrected CI bounds); refute = claim is wrong or unsupportable. Be genuinely skeptical — a confirmed claim should survive a hostile reviewer.`,
        { label: 'verify:' + c.id + ':' + l.name, phase: 'Verify', schema: VERIFY_SCHEMA })
        .then(v => ({ claimId: c.id, lens: l.name, v }))
    )))
    const byClaim = {}
    for (const r of verdicts.filter(Boolean)) {
      if (!r.v) continue
      ;(byClaim[r.claimId] = byClaim[r.claimId] || []).push(r)
    }
    for (const c of claims) {
      const vs = byClaim[c.id] || []
      if (!c.load_bearing) { c.status = 'unverified'; continue }
      if (vs.length === 0) { c.status = 'unverified'; continue }
      c.verification = vs.map(x => ({ lens: x.lens, verdict: x.v.verdict, reasoning: x.v.reasoning }))
      if (vs.some(x => x.v.verdict === 'refute')) c.status = 'disputed'
      else if (vs.some(x => x.v.verdict === 'adjust')) {
        c.status = 'adjusted'
        const adj = vs.filter(x => x.v.verdict === 'adjust' && typeof x.v.corrected_value === 'number')
        if (adj.length) {
          c.original_value = c.value
          c.value = adj.reduce((s, x) => s + x.v.corrected_value, 0) / adj.length
          const los = adj.map(x => x.v.corrected_ci80_low).filter(n => typeof n === 'number')
          const his = adj.map(x => x.v.corrected_ci80_high).filter(n => typeof n === 'number')
          if (los.length) c.ci80_low = Math.min(...los, c.ci80_low)
          if (his.length) c.ci80_high = Math.max(...his, c.ci80_high)
        }
      } else c.status = 'confirmed'
    }
    const n = s => claims.filter(c => c.status === s).length
    log(t.key + ' verified: ' + n('confirmed') + ' confirmed, ' + n('adjusted') + ' adjusted, ' + n('disputed') + ' disputed')
    return { topic: t.key, name: t.name, summary: res.summary, claims }
  }
)

const topics = researched.filter(Boolean)
const allClaims = topics.flatMap(t => t.claims)
const DIGEST = THESIS_BRIEF + '\n\nEVIDENCE DIGEST BY TOPIC:\n' + topics.map(t => '## ' + t.name + '\n' + t.summary).join('\n\n')
const LB_CLAIMS = allClaims.filter(c => c.load_bearing).map(c => ({ id: c.id, metric: c.metric, entity: c.entity, period: c.period, value: c.value, unit: c.unit, ci80: [c.ci80_low, c.ci80_high], grade: c.grade, status: c.status }))
log('Evidence base: ' + allClaims.length + ' claims across ' + topics.length + ' topics; ' + LB_CLAIMS.length + ' load-bearing verified')

// ---------- Phase 4 + chapters 1-7 (concurrent) ----------
const TARGETS = [
  { id: 'T-payback', kind: 'binary', text: 'Will the 2024-2026 US AI capex vintage (hyperscaler + lab data-center/compute investment committed in those years) earn back at least its cost of capital by end of 2030? Operationalize: by end-2030, is aggregate AI-attributable revenue running at a level that credible analyses judge sufficient to cover depreciation + cost of capital on that vintage — i.e., mainstream analyst consensus says the vintage was NPV-positive, not written down.' },
  { id: 'T-price-decline', kind: 'quantity', text: 'The flagship-tier API input price (USD per million tokens, best generally-available non-reasoning flagship across OpenAI/Anthropic/Google) at end-2028, expressed as a PERCENTAGE of its mid-2026 level (e.g. 40 = fallen 60%). Give point + 80% CI.' },
  { id: 'T-convergence', kind: 'binary', text: 'By end of 2028, will US frontier inference be priced at or below 1.5x estimated marginal serving cost (i.e., near-commodity pricing, gross margin under ~33% on flagship API tokens for at least one of OpenAI/Anthropic)? This is the core Thompson convergence proposition.' },
  { id: 'T-revenue', kind: 'quantity', text: 'OpenAI + Anthropic COMBINED annualized revenue run-rate at end of 2028, in USD billions. Give point + 80% CI.' },
  { id: 'T-openshare', kind: 'binary', text: 'By end of 2028, will open-weight models (Chinese or Western) account for more than 30% of global inference tokens served via API/cloud platforms (measured by best available public telemetry such as OpenRouter-style rankings, cloud disclosures, and analyst estimates)?' },
]
const PANEL = [
  { name: 'outside-view', stance: 'You reason OUTSIDE VIEW FIRST: anchor on reference classes (railway manias, telecom/fiber 1999-2002, cloud capex 2012-2020, prior platform price-commoditization episodes) before touching inside details. Distrust "this time is different".' },
  { name: 'unit-economics', stance: 'You reason INSIDE VIEW: build the unit-economics model from the evidence (cost per token, price per token, utilization, demand growth, depreciation) and let the arithmetic drive the forecast. Distrust narratives not backed by the numbers.' },
  { name: 'contrarian', stance: 'You are the CONTRARIAN CHECK: identify the consensus answer implied by the evidence digest, then genuinely search for the strongest case that consensus is wrong (both directions), and only then settle on your calibrated answer. Guard against both hype and reflexive doom.' },
]
const forecastTask = (tg, p) => () =>
  agent(`Forecasting persona: ${p.name}. ${p.stance}\n\nFORECAST TARGET (${tg.kind}): ${tg.text}\nSet target_id="${tg.id}". ${tg.kind === 'binary' ? 'Return probability in [0,1].' : 'Return point plus ci80_low/ci80_high.'}\nToday is ${TODAY}.\n\nEVIDENCE (verified, calibrated — trust status field; treat disputed claims skeptically):\n${DIGEST}\n\nLOAD-BEARING CLAIMS:\n${JSON.stringify(LB_CLAIMS)}\n\nYou may run additional searches to fill gaps. Superforecaster discipline: reference classes first, then Fermi decomposition, then Bayesian adjustment on case specifics, premortem your answer, and state key uncertainties. Granular probabilities (e.g. 0.37 not 0.4).`,
    { label: 'fc:' + tg.id + ':' + p.name, phase: 'Forecast', schema: FORECAST_SCHEMA, agentType: 'superforecaster' })

const CHAPTERS = [
  { n: 1, file: '01-thesis.md', title: 'The Thesis', topics: [], extra: 'thesis', focus: 'Present the Thompson thesis fairly as numbered testable propositions. Explain fixed vs marginal cost with an everyday analogy. Set up what evidence would prove or break each proposition. This chapter frames the whole project.' },
  { n: 2, file: '02-fixed-costs.md', title: 'What a Frontier Model Costs to Build', topics: ['fx'], focus: 'The fixed-cost side: compute, data, people. How the cost of the frontier has grown. Make the scale tangible.' },
  { n: 3, file: '03-marginal-costs.md', title: 'What a Token Costs to Serve', topics: ['mc', 'px'], focus: 'Marginal serving cost vs API price. The gap IS the pricing-power evidence. Include the per-token price collapse story.' },
  { n: 4, file: '04-capex-wave.md', title: 'The CapEx Wave', topics: ['cx', 'dp'], focus: 'The scale of the buildout, who spends what, how depreciation works, why useful-life assumptions matter enormously.' },
  { n: 5, file: '05-revenue-margins.md', title: 'Who Earns What', topics: ['rv'], focus: 'US lab revenue trajectories, mix, margins, burn. Revenue growth vs the cost base.' },
  { n: 6, file: '06-china.md', title: 'China: Who Eats the Fixed Costs', topics: ['cd', 'ce'], focus: 'The open-source labs, who funds them, the price war, chip constraints, and why pricing at marginal cost is rational for them.' },
  { n: 7, file: '07-convergence.md', title: 'Supply, Demand, and the Coming Convergence', topics: ['sd', 'px'], focus: 'Evidence of supply constraint today, demand growth, and whether US-China price convergence is already visible.' },
]

const chapterTask = (ch, extraBlock) => () => {
  const claimsFor = allClaims.filter(c => ch.topics.includes(c.topic))
  return agent(`You are writing chapter ${ch.n} of a public research essay series. Write the file ${ROOT}/p1-ai-economics/research/${ch.file} using the Write tool, then verify readability using Bash: python3 ${ROOT}/tools/readability.py ${ROOT}/p1-ai-economics/research/${ch.file} — you MUST iterate (rewrite sentences shorter, break clauses, swap rare words) until it prints PASS. Do not weaken the ideas; simplify the sentences.\n\nTITLE: "${ch.title}". FOCUS: ${ch.focus}\n\nAUDIENCE: smart general readers — explain every technical term on first use. LENGTH: 800-1400 words of body prose. VOICE: plain, direct, concrete; short sentences; no hype; first-person plural sparingly.\n\nGROUNDING RULES (hard): every number in the text must come from the CLAIMS list below — cite it with a numbered footnote [^n] whose entry names the source (title, outlet, and URL) from the claim's sources, and list the claim id in frontmatter claims_used. Express uncertainty honestly in plain language ("our best estimate is X; we would not be surprised by anything from Y to Z"). NEVER present a status=disputed claim as fact — either omit it or present it as contested. If you need a number that is not in the claims list, describe it qualitatively instead of inventing it.\n\nFRONTMATTER (exact keys): title, project: p1-ai-economics, chapter: ${ch.n}, claims_used: [list], readability: "<the PASS line scores>", status: draft-for-review.\n\n${extraBlock}\n\nTHE THESIS CONTEXT:\n${THESIS_BRIEF}\n\nTOPIC DIGESTS:\n${topics.filter(t => ch.topics.length === 0 || ch.topics.includes(t.topic)).map(t => '## ' + t.name + '\n' + t.summary).join('\n\n')}\n\nCLAIMS (JSON):\n${JSON.stringify(claimsFor.length ? claimsFor : allClaims.filter(c => c.load_bearing))}\n\nReturn: path, title, word_count, readability_pass (true only if the tool printed PASS), scores_line, claim_ids_used, headline_findings (3-5 bullets).`,
    { label: 'ch' + ch.n + ':' + ch.file.replace('.md', ''), phase: 'Write', schema: CHAPTER_SCHEMA })
}

phase('Forecast')
log('Launching superforecaster panel (15 runs) and chapters 1-7 concurrently')
const panelTasks = TARGETS.flatMap(tg => PANEL.map(p => forecastTask(tg, p)))
const ch17Tasks = CHAPTERS.map(ch => chapterTask(ch, ch.extra === 'thesis' ? 'THESIS PROPOSITIONS DETAIL (JSON):\n' + JSON.stringify(thesis.propositions) + '\nTHESIS SOURCES:\n' + JSON.stringify(thesis.sources) : ''))
const mixed = await parallel([...panelTasks, ...ch17Tasks])
const panelRaw = mixed.slice(0, panelTasks.length).filter(Boolean)
const ch17 = mixed.slice(panelTasks.length).filter(Boolean)

// aggregate forecasts (extremized median for binary, median for quantities)
const median = xs => { const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }
const extremize = (p, a) => { const q = Math.pow(p, a); return q / (q + Math.pow(1 - p, a)) }
const forecasts = TARGETS.map(tg => {
  const runs = panelRaw.filter(r => r.target_id === tg.id)
  const agg = { target_id: tg.id, kind: tg.kind, question: tg.text, panel: runs.map(r => ({ persona: (panelRaw.indexOf(r) % 3 === 0 ? 'outside-view' : panelRaw.indexOf(r) % 3 === 1 ? 'unit-economics' : 'contrarian'), probability: r.probability, point: r.point, ci80: [r.ci80_low, r.ci80_high], reasoning: r.reasoning_summary, reference_classes: r.reference_classes, key_uncertainties: r.key_uncertainties }) ) }
  if (tg.kind === 'binary') {
    const ps = runs.map(r => r.probability).filter(p => typeof p === 'number')
    if (ps.length) { agg.median_probability = median(ps); agg.extremized_probability = extremize(median(ps), 1.73); agg.spread = [Math.min(...ps), Math.max(...ps)] }
  } else {
    const pts = runs.map(r => r.point).filter(n => typeof n === 'number')
    const los = runs.map(r => r.ci80_low).filter(n => typeof n === 'number')
    const his = runs.map(r => r.ci80_high).filter(n => typeof n === 'number')
    if (pts.length) { agg.median_point = median(pts); agg.ci80 = [los.length ? median(los) : null, his.length ? median(his) : null]; agg.spread = [Math.min(...pts), Math.max(...pts)] }
  }
  return agg
})
log('Panel aggregated: ' + forecasts.map(f => f.target_id + '=' + (f.kind === 'binary' ? (f.extremized_probability != null ? Math.round(f.extremized_probability * 100) + '%' : 'n/a') : f.median_point)).join(', '))

// ---------- chapters 8-9 (need forecasts) ----------
phase('Write')
const LATE = [
  { n: 8, file: '08-payback.md', title: 'The Payback Question', topics: ['cx', 'dp', 'rv'], focus: 'Can the capex be earned back? Present the superforecaster panel results (provided below) — the aggregated probabilities AND the disagreement between panelists, which is signal, not noise. Explain the method (reference classes, extremized median) in one plain paragraph.' },
  { n: 9, file: '09-verdict.md', title: 'The Verdict', topics: [], focus: 'Walk each thesis proposition (T1..) and rule: supported / partly supported / refuted / unresolved, citing the strongest evidence for each ruling. End with what would change the verdict and what to watch next. Use load-bearing claims from all topics.' },
]
const FC_BLOCK = 'SUPERFORECASTER PANEL RESULTS (JSON — cite as "our forecasting panel"):\n' + JSON.stringify(forecasts)
const late = (await parallel(LATE.map(ch => chapterTask(ch, FC_BLOCK + (ch.n === 9 ? '\nTHESIS PROPOSITIONS:\n' + JSON.stringify(thesis.propositions) : ''))))).filter(Boolean)

const chapters = [...ch17, ...late]
const failed = chapters.filter(c => !c.readability_pass)
if (failed.length) log('WARNING: chapters failing readability gate: ' + failed.map(c => c.path).join(', '))
log('Chapters written: ' + chapters.length + '/9')

return {
  thesis,
  topicSummaries: topics.map(t => ({ topic: t.topic, name: t.name, summary: t.summary, claimCount: t.claims.length })),
  claims: allClaims,
  forecasts,
  chapters: chapters.map(c => ({ path: c.path, title: c.title, words: c.word_count, readability_pass: c.readability_pass, scores: c.scores_line, headlines: c.headline_findings })),
  disputed: allClaims.filter(c => c.status === 'disputed').map(c => ({ id: c.id, metric: c.metric, entity: c.entity, value: c.value, unit: c.unit })),
}
