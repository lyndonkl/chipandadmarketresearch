export const meta = {
  name: 'p2-r3-claim-verification',
  description: 'P2 stage R3: eight claim-verifier agents attack the era records and dataset refute-first; verdicts merged and applied',
  phases: [
    { title: 'Attack', detail: '8 parallel verifiers (7 eras + dataset)' },
    { title: 'Apply', detail: 'merge verdicts, apply adjustments and rejections to the records' },
  ],
}

// Stage R3 of p2-ad-market/PLAN.md. Requires human Gate A approval
// (p2-ad-market/planning/gate-a-approval.md) — contract r3 enforces this.
// Run from the repo root.

const RIGOR = `Calibration object: {id, statement, central, unit, ci80: [lo, hi], grade, sources: [{name, url}], as_of}. Grades: A = official filings/statistics, B = credible named reporting with a track record, C = triangulated (requires method). Era claim IDs: e{era}-{field}-{NNN}; dataset claim IDs: ds-{topic}-{NNN}.`

const CONTEXT = `Adjudicated context (verify claims AGAINST these; do not re-litigate): AdWords launched Oct 2000 as CPM, the auction arrives Feb 2002 with AdWords Select; Overture led paid-search revenue through 2002; the Overture patent settlement was ~2.7M shares (~$230M); radio was never the #1 US medium by spend; "Out of Home" replaced "Billboards" in 2000 at ~3x expenditure; the Wanamaker quote and "first banner ad" stories are attributed legends unless a record carries new primary evidence; era-7 data freeze is 2026-06-30.`

const BATCHES = [
  ...([1, 2, 3, 4, 5, 6, 7].map((n) => ({
    key: `era-${n}`,
    claims: `p2-ad-market/data/eras/era-${n}.json (attack every claim in the record: field claims, money-type splits, event claims, unit-economics claims)`,
    focus: 'SCALE totals and money-type splits first (other claims lean on them), then PRICING take rates, then event claims with numbers attached.',
    out: `p2-ad-market/data/verification/verdicts-era-${n}.json`,
  }))),
  {
    key: 'adspend',
    claims: `p2-ad-market/data/adspend.json — attack: (1) every dataset-level claim in "claims"; (2) every concordance entry's magnitude; (3) the bridge arithmetic (re-run its steps); (4) the pre-1919 benchmark points; (5) a spot-check of at least 3 points per decade per stitch series against their cited sources.`,
    focus: 'The 1980-2007 bridge and the concordance magnitudes first — every downstream chart leans on them. Then the pre-1919 benchmarks.',
    out: 'p2-ad-market/data/verification/verdicts-adspend.json',
  },
]

phase('Attack')
log('Spawning 8 claim verifiers')
const results = await parallel(
  BATCHES.map((b) => () =>
    agent(
      `<inputs>
  <claims>${b.claims}</claims>
  <rigor_spec>${RIGOR}</rigor_spec>
  <context>${CONTEXT}</context>
  <focus>${b.focus}</focus>
  <output_path>${b.out}</output_path>
</inputs>`,
      { label: `verify:${b.key}`, phase: 'Attack', agentType: 'claim-verifier' }
    )
  )
)
const ok = results.filter(Boolean)
log(`${ok.length}/8 verifiers returned`)

phase('Apply')
const applied = await agent(
  `You are the verdict-application step of a gated research pipeline. The claim verifiers have written verdict files at p2-ad-market/data/verification/verdicts-*.json (7 era batches + adspend).

Do exactly this:
1. Merge all verdict files into p2-ad-market/data/verification/verdicts.json with shape {"verdicts": [...]} — every entry preserved verbatim, including "disagreement" fields.
2. Apply every "adjusted" verdict to its source record (p2-ad-market/data/eras/era-N.json or p2-ad-market/data/adspend.json): replace the claim's calibration fields with the verdict's "new" values. Never change anything a verdict did not order.
3. Apply every "rejected" verdict: if the verdict carries "replaced_by" with a replacement claim, swap it in (keeping the ID convention); otherwise REMOVE the claim and adjust any prose summary in that record that leaned on it, noting the removal in the record's boundary_notes.
4. Leave "confirmed" claims untouched. If any verdict is "unverified", stop and report it — the stage cannot complete with unverified claims.
5. Parse-check every file you modified (python3 -c "import json; json.load(open(...))"), then run: python3 tools/verify_p2.py r3-coverage && python3 tools/verify_p2.py r3-verdicts && python3 tools/verify_p2.py r3-applied — and fix any violation that traces to YOUR application work (never re-verdict a claim).

Final message: counts by verdict, files modified, any unverified claims (which block the stage), and any violations you could not fix.`,
  { label: 'apply:verdicts', phase: 'Apply', agentType: 'general-purpose' }
)

return {
  verifier_summaries: ok,
  application: applied,
  next: "Run workflows/p2-verify-stage.js with args {contract: 'p2-ad-market/planning/contracts/r3.json'}",
}
