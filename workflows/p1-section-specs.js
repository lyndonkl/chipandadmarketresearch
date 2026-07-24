export const meta = {
  name: 'p1-section-specs',
  description: 'One analyst per P1 chapter: abstract points + every number with claim id & source + the right viz type (data-to-viz), for the immersive rebuild',
  phases: [{ title: 'Sections', detail: '9 chapter analysts in parallel' }],
}
const ROOT = args.root
const RES = ROOT + '/p1-ai-economics/research'
const DATA = ROOT + '/p1-ai-economics/data'

const VIZ_TYPES = `Choose the visualization type from the DATA SHAPE, the way data-to-viz.com prescribes:
- "bars" — compare a few labelled magnitudes (e.g. training cost per model, capex per company). Ranked, horizontal.
- "bars_ci" — same, but each bar carries an 80% confidence interval whisker (uncertain estimates).
- "line" — a trend over time / ordered x (e.g. price per token over years). Can be log-y.
- "slope" or "comparison" — two states compared (e.g. run-rate vs recognized revenue; price closed vs open weights).
- "diverging" — signed values around zero (e.g. DCF NPV bear −$2.3T / base +$487B / bull +$907B).
- "dot_spread" — a point estimate with the spread of independent panelists (e.g. the superforecaster panel: 3 dots + the median).
- "stack" — part-to-whole of one total (e.g. what the ~$650B capex is made of, by company).
- "range" — a single quantity as a band low–high (e.g. serving cost 6–48% of list).
- "particles" — reserve ONLY for the three signature object-constancy moments (the 7× gap, the Convergence Dial, the Monte-Carlo payback). Do not request particles for ordinary data.
Pick the SIMPLEST type that fits. Prefer showing the derivation (the parts that make a headline number) over the headline alone.`

const SCHEMA = {
  type: 'object',
  required: ['chapter', 'id', 'title', 'eyebrow', 'standfirst', 'points', 'visuals', 'chapter_link', 'plain_check'],
  properties: {
    chapter: { type: 'number' }, id: { type: 'string' }, title: { type: 'string' },
    eyebrow: { type: 'string' }, standfirst: { type: 'string' },
    points: { type: 'array', items: { type: 'object', required: ['text', 'claim_ids'],
      properties: { text: { type: 'string' }, claim_ids: { type: 'array', items: { type: 'string' } } } } },
    visuals: { type: 'array', items: { type: 'object',
      required: ['type', 'title', 'note', 'unit', 'series', 'viz_rationale'],
      properties: {
        type: { enum: ['bars', 'bars_ci', 'line', 'slope', 'comparison', 'diverging', 'dot_spread', 'stack', 'range', 'particles'] },
        title: { type: 'string' }, note: { type: 'string' }, unit: { type: 'string' },
        log: { type: 'boolean' }, viz_rationale: { type: 'string' },
        series: { type: 'array', items: { type: 'object', required: ['label', 'value'],
          properties: { label: { type: 'string' }, value: { type: 'number' }, low: { type: 'number' }, high: { type: 'number' },
            grade: { enum: ['A', 'B', 'C'] }, claim_id: { type: 'string' }, source_title: { type: 'string' }, source_url: { type: 'string' },
            sublabel: { type: 'string' }, x: { type: 'number' } } } },
      } } },
    chapter_link: { type: 'string' }, plain_check: { type: 'string' },
  },
}

const CH = [
  { n: 1, file: '01-thesis.md', extra: 'This is the framing. Give the six propositions T1–T6 as points. One visual can be a "range"/"comparison" teaser of the 7× gap (type particles is allowed here as the hook).' },
  { n: 2, file: '02-fixed-costs.md', extra: 'Fixed cost side. Best visuals: a "bars_ci" of final training-run cost per model (GPT-4, Gemini Ultra, Grok 4, DeepSeek-V3, Claude 3.5 Sonnet, Llama 3.1 405B — whatever the claims support), and a "bars" or "stack" of annual R&D/training compute spend per lab. Show how small DeepSeek looks next to US runs.' },
  { n: 3, file: '03-marginal-costs.md', extra: 'Marginal cost vs price. Visuals: a "range" of serving cost as a share of list (6–48%), the "particles" 7× gap belongs here, and a "line" of the per-token price collapse at constant quality. Include the o3 80% cut and Opus cut as a "comparison".' },
  { n: 4, file: '04-capex-wave.md', extra: 'The capex wave. KEY: a "stack" or ranked "bars" of 2026 capex by company (Microsoft, Alphabet, Amazon, Meta, Oracle, CoreWeave) that SUMS to the ~$650B headline — this is the "show the work" for that number. Add depreciation useful-life as a small "comparison" (booked 5–6yr vs Epoch ~3.9yr).' },
  { n: 5, file: '05-revenue-margins.md', extra: 'Revenue & margins. Visuals: "comparison" of run-rate vs recognized revenue for OpenAI and Anthropic (the ~2:1 gap), "bars" of gross margins, and the operating loss. This feeds the payback denominator.' },
  { n: 6, file: '06-china.md', extra: 'China. Visuals: a "bars" (log) price comparison (Kimi K3 $15 vs DeepSeek V4-flash $0.28 vs US), a "comparison" of who funds the fixed cost (revenue vs capex/funding), and the DeepSeek 545% cost-profit disclosure as a "range"/callout. Show the price-war cuts.' },
  { n: 7, file: '07-convergence.md', extra: 'Convergence. Visuals: the "particles" Convergence Dial belongs here; plus a "comparison"/"line" of the two clocks (constant-quality ↓36×/yr vs flagship sticker ↑4×), and supply-constraint signals (Azure +39%, Google backlog $514B, H100 rent up) as "bars".' },
  { n: 8, file: '08-payback.md', extra: 'THE PAYBACK — SHOW THE WORK. Read ' + DATA + '/forecasts.json for the T-payback-total record (dcf_models bear/base/bull with wacc, cumulative_capex, revenue, margin, npv, irr; and the 3-persona panel with probabilities + reasoning). Visuals REQUIRED: (1) "diverging" of the three DCF NPVs (bear −$2.3T, base +$487B, bull +$907B); (2) "comparison" of ~$650B/yr capex or $1.5T/yr revenue-needed vs actual run-rates (OpenAI $24B, Anthropic $47B); (3) "dot_spread" of the panel (0.44 / 0.52 / 0.53 with median 0.52). Points should explain the method plainly (reference classes, why terminal-dominated).' },
  { n: 9, file: '09-verdict.md', extra: 'The verdict. Points: each proposition T1–T6 with its ruling (supported/partly/unresolved) and the one-line strongest evidence. A visual can be a "comparison"/"bars" scorecard of the six rulings. Note T5 carries the capital risk.' },
]

phase('Sections')
log('Analysing 9 chapters in parallel — points, all numbers+sources, and the right viz per data shape')
const specs = await parallel(CH.map(c => () =>
  agent(`You are a data-journalism analyst preparing ONE section of an immersive, interactive research experience about AI economics. The finished site must let a reader READ the point and SEE the numbers at the same time, with every figure sourced.

READ the chapter: ${RES}/${c.file}. Its numbers come from the calibrated data layer at ${DATA}/claims.json (every claim has id, value, ci80, grade A/B/C, sources). Read that too and pull the EXACT values, 80% intervals, grades, and the primary source (title + url) for every number you surface. ${c.n === 8 ? 'Also read ' + DATA + '/forecasts.json.' : ''}

Produce a SECTION SPEC:
- eyebrow: a short tag (e.g. "T1 · supported", "the capex wave").
- standfirst: one plain sentence (the section's hook).
- points: 3–5 ABSTRACT points — short, plain, grade ≤10 sentences that carry the chapter's argument WITHOUT pasting the chapter. Each lists the claim_ids it rests on. Think "abstract representation of each point", not a paste.
- visuals: the numbers brought to life. PULL IN ALL THE KEY NUMBERS with their claim_id, grade, and source (title+url). Every series datum must carry claim_id and source where one exists. Prefer showing the DERIVATION of any headline number over the headline alone.
- chapter_link: "research/${c.file}" (the reader clicks through for full depth).

${VIZ_TYPES}

SECTION-SPECIFIC GUIDANCE: ${c.extra}

Keep the points plain (short sentences, explain terms) — the site enforces Flesch-Kincaid ≤10. In plain_check, self-report roughly how readable the points are. Do NOT invent numbers; if a figure is not in the claims, omit it or describe it qualitatively. Today is ${args.today}.`,
    { label: 'sec:' + c.n, phase: 'Sections', schema: SCHEMA })
)).then(a => a.filter(Boolean))

specs.sort((a, b) => a.chapter - b.chapter)
log('Section specs ready: ' + specs.map(s => 'ch' + s.chapter + '(' + s.visuals.length + 'viz)').join(' '))
return { specs }
