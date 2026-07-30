export const meta = {
  name: 'p2-verify-stage',
  description: 'Generic stage verifier: stage-auditor checks a contract, bounded auto-repair (max 2 cycles) on failure, then halt-and-escalate',
  phases: [
    { title: 'Audit', detail: 'stage-auditor runs the contract' },
    { title: 'Repair', detail: 'remediation applies the report payload (only on FAIL)' },
  ],
}

// Usage: Workflow({scriptPath: 'workflows/p2-verify-stage.js',
//                  args: {contract: 'p2-ad-market/planning/contracts/r1.json'}})
// Run from the repo root. Implements PROCESS.md "Automated stage verification".

// args may arrive as an object or as a JSON-encoded string depending on how
// the invocation serializes it — accept both.
const opts = typeof args === 'string' ? JSON.parse(args) : args
if (!opts || !opts.contract) {
  throw new Error("args.contract is required, e.g. {contract: 'p2-ad-market/planning/contracts/r1.json'}")
}
const CONTRACT = opts.contract
const REPORT = CONTRACT.replace(/\.json$/, '-report.json')
const MAX_REPAIRS = 2

const AUDIT_SCHEMA = {
  type: 'object',
  required: ['overall', 'report_path', 'counts', 'violations'],
  properties: {
    overall: { type: 'string', enum: ['PASS', 'FAIL'] },
    report_path: { type: 'string' },
    counts: {
      type: 'object',
      required: ['satisfied', 'violated', 'unverified'],
      properties: {
        satisfied: { type: 'number' },
        violated: { type: 'number' },
        unverified: { type: 'number' },
      },
    },
    violations: { type: 'array', items: { type: 'string' } },
  },
}

const auditPrompt = `<inputs>
  <contract_path>${CONTRACT}</contract_path>
  <report_path>${REPORT}</report_path>
  <context>p2-ad-market/PLAN.md holds the stage machine and schema definitions; p2-ad-market/planning/schema/era-record.schema.json holds the era-record shape. Deterministic check commands run from the repo root (your working directory).</context>
</inputs>`

function repairPrompt(cycle) {
  return `You are the remediation step of a gated research pipeline (PROCESS.md, "Automated stage verification" — bounded auto-repair, cycle ${cycle} of ${MAX_REPAIRS}).

Read the audit report at ${REPORT} and the contract at ${CONTRACT}. For every entry in the report's "remediation" array, apply the fix EXACTLY as specified to the named artifact. Rules:
- Fix the artifacts, never the contract, never the checks, never the report. Weakening an invariant to pass is forbidden.
- Where a fix requires re-research (a missing source, an unfilled field), do that research (web search allowed) at the rigor the contract's invariants demand — a placeholder value is not a fix.
- Where a fix is impossible or the remediation entry is wrong, do not improvise: leave the artifact unchanged and say so in your final message.
- After applying fixes, re-run each deterministic command named in the contract for the invariants you touched, and confirm improvement.

Your final message: one line per remediation entry — applied / skipped (why) — plus the list of files you changed.`
}

let verdict = null
for (let cycle = 0; cycle <= MAX_REPAIRS; cycle++) {
  phase('Audit')
  log(cycle === 0 ? `Auditing ${CONTRACT}` : `Re-auditing after repair cycle ${cycle}`)
  verdict = await agent(auditPrompt, {
    label: `audit:${CONTRACT.split('/').pop()}${cycle > 0 ? `:cycle${cycle}` : ''}`,
    phase: 'Audit',
    agentType: 'stage-auditor',
    schema: AUDIT_SCHEMA,
  })
  if (!verdict) throw new Error('stage-auditor returned no result')
  if (verdict.overall === 'PASS') {
    log(`PASS: ${CONTRACT}`)
    return { overall: 'PASS', cycles_used: cycle, report: REPORT }
  }
  if (cycle === MAX_REPAIRS) break
  phase('Repair')
  log(`FAIL with ${verdict.violations.length} violation(s) — repair cycle ${cycle + 1}`)
  await agent(repairPrompt(cycle + 1), {
    label: `repair:cycle${cycle + 1}`,
    phase: 'Repair',
    agentType: 'general-purpose',
  })
}

log(`HALT: ${CONTRACT} still failing after ${MAX_REPAIRS} repair cycles — escalate to human`)
return {
  overall: 'HALT-ESCALATE',
  cycles_used: MAX_REPAIRS,
  report: REPORT,
  violations: verdict.violations,
  instruction: 'Per PROCESS.md the stage HALTS. Surface the violation report to the human; do not advance to the next stage.',
}
