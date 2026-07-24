export const meta = {
  name: 'p1-jargon-sweep',
  description: 'Find domain terms used on-page without definition — the blind spot the readability formulas structurally cannot detect',
  phases: [{ title: 'Scan', detail: '9 chapters scanned for undefined jargon' }],
}
const ROOT = args.root
const SPECS = ROOT + '/p1-ai-economics/data/section-specs.json'

const SCHEMA = {
  type: 'object', required: ['chapter', 'terms'],
  properties: {
    chapter: { type: 'number' },
    terms: { type: 'array', items: {
      type: 'object', required: ['term', 'where', 'severity', 'why_opaque', 'fix'],
      properties: {
        term: { type: 'string' },
        where: { type: 'string' },
        severity: { enum: ['high', 'medium', 'low'] },
        why_opaque: { type: 'string' },
        defined_on_page: { type: 'boolean' },
        fix: { type: 'string' },
      } } },
  },
}

phase('Scan')
log('Scanning on-page prose for domain terms used without definition')
const out = await parallel([1,2,3,4,5,6,7,8,9].map(n => () =>
  agent(`Read ${SPECS} and find the object with chapter == ${n}.

Scan EVERY string a reader actually sees in that section: standfirst, each point's text, and each visual's title, unit, note, series labels and sublabels.

Find DOMAIN TERMS that a smart, curious reader with no background in AI or finance would not confidently understand, AND which are not defined on the page at or before first use.

Why this matters: the page is gated on Flesch-Kincaid / Reading Ease / Gunning Fog / SMOG. Those formulas count syllables and sentence length. A short, common-looking phrase like "rate card" or "run-rate" passes every test while still being opaque jargon. So the gate is structurally blind to this class of problem and you are the check for it.

Judge as that reader. Likely candidates to test (not exhaustive, and some may already be well handled): marginal cost, fixed cost, gross margin, cost of revenue, run-rate, recognized revenue, capex, amortize/amortization, depreciation, useful life, NPV, IRR, WACC, cost of capital, terminal value, discount rate, inference, tokenizer, token, open weights, distillation, reference class, base rate, confidence interval, utilization, backlog, hyperscaler, neocloud, list price, arbitrage.

For each real offender give: the term, where it appears, whether it IS defined on the page, why it is opaque to that reader, and a fix.

CRITICAL on fixes: do NOT dumb down the idea or delete the term. The house rule is that the complexity of the IDEAS is preserved while the complexity of the SENTENCES is reduced. So the right fix is almost always a short defining clause at first use — e.g. "gross margin (what is left of each sales dollar after the direct cost of making it)" — not removing the concept. Keep any fix to one short clause.

Report only genuine offenders, ordered by severity. If the section handles its terms well, return few or none.`,
    { label: 'jargon:ch' + n, phase: 'Scan', schema: SCHEMA })
)).then(a => a.filter(Boolean))

const all = out.flatMap(o => (o.terms || []).map(t => ({ ...t, chapter: o.chapter })))
const undefinedOnes = all.filter(t => t.defined_on_page === false || t.severity === 'high')
const freq = {}; all.forEach(t => freq[t.term.toLowerCase()] = (freq[t.term.toLowerCase()] || 0) + 1)
const repeated = Object.entries(freq).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1])
log(`Terms flagged: ${all.length} · undefined/high: ${undefinedOnes.length} · recurring across chapters: ${repeated.length}`)
return { all, undefinedOnes, recurringAcrossChapters: repeated, bySeverity:
  all.reduce((a, t) => (a[t.severity] = (a[t.severity] || 0) + 1, a), {}) }
