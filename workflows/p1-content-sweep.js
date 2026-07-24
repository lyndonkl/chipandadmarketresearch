export const meta = {
  name: 'p1-content-sweep',
  description: 'Frame-by-frame content audit of all 61 visuals: grounding vs claims.json, implication clarity, text-visual support, label sufficiency, readability',
  phases: [{ title: 'Audit', detail: '9 chapter auditors in parallel' }, { title: 'Verify', detail: 'adversarial re-check of every reported defect' }],
}
const ROOT = args.root
const SPECS = ROOT + '/p1-ai-economics/data/section-specs.json'
const CLAIMS = ROOT + '/p1-ai-economics/data/claims.json'
const RES = ROOT + '/p1-ai-economics/research'

const FIND = {
  type: 'object', required: ['chapter', 'findings', 'readability'],
  properties: {
    chapter: { type: 'number' },
    readability: { type: 'string' },
    findings: { type: 'array', items: {
      type: 'object', required: ['visual_title', 'severity', 'category', 'problem', 'fix'],
      properties: {
        visual_title: { type: 'string' },
        severity: { enum: ['high', 'medium', 'low'] },
        category: { enum: ['ungrounded-data', 'value-mismatch', 'implication-unclear', 'text-visual-mismatch', 'insufficient-labels', 'wrong-chart-type', 'misleading-encoding', 'readability'] },
        problem: { type: 'string' }, fix: { type: 'string' },
        evidence: { type: 'string' },
      } } },
  },
}

phase('Audit')
log('Auditing 9 chapters frame by frame: grounding, implication, text-visual fit, labels, readability')
const CH = [1,2,3,4,5,6,7,8,9]
const audits = await parallel(CH.map(n => () =>
  agent(`You are auditing ONE chapter of a published research experience, frame by frame. Be exacting and skeptical — the goal is to find real defects, not to praise.

READ:
- ${SPECS} — find the object with chapter == ${n}. It has: eyebrow, standfirst, points (the prose the reader sees, each with claim_ids), and visuals (each with type, title, note, unit, series[]).
- ${CLAIMS} — the calibrated data layer (id, value, unit, ci80_low/high, grade, metric, sources).
- ${RES}/0${n}-*.md — the full chapter this section abstracts.

For EVERY visual in this chapter, check:
1. GROUNDING — does every series datum trace to a real claim id in claims.json, and does its value match that claim (or is it a legitimate derivation, e.g. "100 minus serving cost")? Flag any number that appears invented, has no claim id, or contradicts the claim record. Category: ungrounded-data or value-mismatch. THIS IS THE HIGHEST PRIORITY — no mock or invented data may survive.
2. IMPLICATION — after looking at this visual, would a smart general reader know WHY it matters? Is the "so what" stated in the note? A chart that shows a number but not its consequence is a defect. Category: implication-unclear.
3. TEXT-VISUAL FIT — do the points before/after the visual actually match what the visual shows? Any claim in the prose the visual contradicts or fails to support? Category: text-visual-mismatch.
4. LABELS — are the series labels, sublabels, unit, and title sufficient for the reader to know what the bar/line/dot MEANS and what it is a share OF? Ambiguous denominators are a defect. Category: insufficient-labels.
5. CHART TYPE — is this the right form for the data shape (comparison->bars, trend->line, uncertainty->range, part-to-whole->stack, signed->diverging)? Category: wrong-chart-type.
6. MISLEADING ENCODING — log axes that compress without saying so, truncated baselines, intervals on exact figures, colour implying a distinction that does not exist. Category: misleading-encoding.

ALSO run the readability gate on this chapter's on-page prose. Write the section's standfirst + all point texts to a temp file and run:
  python3 ${ROOT}/tools/readability.py <tmpfile>
Report the exact PASS/FAIL line in the readability field. Thresholds: FK<=10, ease>=50, fog<=12, smog<=12.

Return only REAL defects with a concrete fix each. If a visual is genuinely fine, do not invent a finding for it. Order findings by severity.`,
    { label: 'audit:ch' + n, phase: 'Audit', schema: FIND })
)).then(a => a.filter(Boolean))

const all = audits.flatMap(a => (a.findings || []).map(f => ({ ...f, chapter: a.chapter })))
log(`Raw findings: ${all.length} across ${audits.length} chapters`)
audits.forEach(a => log(`  ch${a.chapter} readability: ${a.readability}`))

// adversarially verify each finding so we don't act on false positives
phase('Verify')
const VER = { type: 'object', required: ['verdict', 'reasoning'],
  properties: { verdict: { enum: ['confirmed', 'rejected'] }, reasoning: { type: 'string' },
    corrected_fix: { type: 'string' } } }
const verified = await parallel(all.map(f => () =>
  agent(`Adversarially verify this reported defect in a research visualisation. Default to REJECTED unless the defect is real and material — we do not want churn on false positives.

REPORTED DEFECT (chapter ${f.chapter}):
${JSON.stringify(f, null, 1)}

Check it against the actual data: ${SPECS} (chapter ${f.chapter}) and ${CLAIMS}. Is the problem real as described? Is the proposed fix correct, or is there a better one? If the finding misreads the spec or the claim record, reject it.`,
    { label: 'verify:' + f.category + ':ch' + f.chapter, phase: 'Verify', schema: VER })
    .then(v => v ? ({ ...f, verdict: v.verdict, verify_reasoning: v.reasoning, corrected_fix: v.corrected_fix }) : null)
)).then(a => a.filter(Boolean))

const confirmed = verified.filter(v => v.verdict === 'confirmed')
const bySev = {}; confirmed.forEach(c => bySev[c.severity] = (bySev[c.severity] || 0) + 1)
const byCat = {}; confirmed.forEach(c => byCat[c.category] = (byCat[c.category] || 0) + 1)
log(`Confirmed ${confirmed.length} of ${all.length} (${JSON.stringify(bySev)})`)

return { confirmed, rejected: verified.length - confirmed.length, bySeverity: bySev, byCategory: byCat,
  readability: audits.map(a => ({ chapter: a.chapter, result: a.readability })) }
