export const meta = {
  name: 'p1-remediation-patches',
  description: 'Turn the confirmed content + jargon findings into machine-applicable spec patches, one agent per chapter',
  phases: [{ title: 'Patch', detail: '9 chapters -> structured edit lists' }],
}
const ROOT = args.root
const SPECS = ROOT + '/p1-ai-economics/data/section-specs.json'
const CLAIMS = ROOT + '/p1-ai-economics/data/claims.json'
const CF = ROOT + '/p1-ai-economics/data/content-findings.json'
const JF = ROOT + '/p1-ai-economics/data/jargon-findings.json'

const SCHEMA = {
  type: 'object', required: ['chapter', 'edits', 'skipped'],
  properties: {
    chapter: { type: 'number' },
    edits: { type: 'array', items: {
      type: 'object', required: ['target', 'field', 'new_value', 'why'],
      properties: {
        target: { type: 'string', description: 'visual title exactly as in the spec, or "point:N" (0-based) or "standfirst"' },
        field: { type: 'string', description: 'one of: title, note, unit, viz_rationale, axis_caption, text, standfirst, series[i].label, series[i].sublabel, series[i].claim_id' },
        new_value: { type: 'string' },
        why: { type: 'string' },
        finding: { type: 'string' },
      } } },
    skipped: { type: 'array', items: { type: 'object', required: ['finding', 'reason'],
      properties: { finding: { type: 'string' }, reason: { type: 'string' } } } },
  },
}

phase('Patch')
log('Converting confirmed findings into applicable text edits, one agent per chapter')
const out = await parallel([1,2,3,4,5,6,7,8,9].map(n => () =>
  agent(`You are producing the exact TEXT EDITS that remediate the confirmed defects in ONE chapter of a published research experience.

READ:
- ${CF} — "confirmed" array. Take only entries with chapter == ${n}. Each has visual_title, category, problem, fix and often corrected_fix (the verifier's improved fix — PREFER corrected_fix when present).
- ${JF} — "all" array. Take entries with chapter == ${n} whose severity is "high", plus "medium" ones whose term recurs across chapters (net present value, cost of capital, DCF, list price, inference, run-rate, tokenizer, whisker).
- ${SPECS} — the live spec. Find the object with chapter == ${n}.
- ${CLAIMS} — the data layer, to check any number you touch.

PRODUCE a list of edits. Each edit names a target (the visual's exact title string, or "point:N" for the N-th point 0-based, or "standfirst"), the field to change, and the complete new value for that field.

RULES:
1. TEXT ONLY. You may rewrite title, note, unit, viz_rationale, axis_caption, a point's text, the standfirst, and a series' label / sublabel / claim_id. You may NOT invent numeric values, add or delete series, or change chart types — those are handled separately. If a finding requires a structural or numeric change, put it in "skipped" with the reason.
2. NEVER invent a number. Every figure you write must already exist in claims.json or in the spec. If a finding says a number is wrong and the right one is unknown, skip it and say so.
3. JARGON FIXES: add a short defining clause at FIRST USE. Never delete the term, never dumb down the idea. The house rule is complexity of ideas preserved, complexity of sentences reduced. Example: "Serving the model — the industry word is inference — works the other way."
4. READABILITY: everything you write must keep Flesch-Kincaid <= 10, reading ease >= 50, Gunning Fog <= 12, SMOG <= 12. Short sentences, common words, one idea per sentence. Define terms rather than avoiding them.
5. IMPLICATION: where a finding says the "so what" is missing, the new note must end with the consequence in one plain sentence.
6. Do not fix things already fixed. These are already done at the renderer level, so SKIP any finding about them: log axis floor / zero-length smallest bar; the "100% = every dollar charged" caption appearing on the wrong charts; slopeChart dropping series; lineChart missing sublabels; the Claude Sonnet 4.6 comparator citing the wrong claim (now px-18); intervals drawn on exact grade-A figures.

Return the complete new value for each field — not a diff, not an instruction. Today the site is live, so be precise.`,
    { label: 'patch:ch' + n, phase: 'Patch', schema: SCHEMA })
)).then(a => a.filter(Boolean))

const total = out.reduce((a, o) => a + (o.edits || []).length, 0)
const skipped = out.reduce((a, o) => a + (o.skipped || []).length, 0)
out.forEach(o => log(`  ch${o.chapter}: ${(o.edits || []).length} edits, ${(o.skipped || []).length} skipped`))
log(`Total applicable edits: ${total}; skipped (structural/numeric): ${skipped}`)
return { patches: out, total, skipped }
