export const meta = {
  name: 'p2-r2-dataset',
  description: 'P2 stage R2: series-archaeologist assembles the splice-honest century dataset; superforecaster panel covers post-freeze endpoint values',
  phases: [
    { title: 'Assemble', detail: 'series-archaeologist builds adspend.json' },
    { title: 'Forecast', detail: '3 superforecasters, different reference classes' },
    { title: 'Merge', detail: 'panel median + variance into forecasts.json' },
  ],
}

// Stage R2 of p2-ad-market/PLAN.md. Run from the repo root, AFTER
// p2-verify-stage.js passed contract r1. Then verify contract r2 and stop
// for human Gate A.

const RIGOR = `Point/claim ID convention for dataset-level claims: ds-{topic}-{NNN} (e.g. ds-total-001). Calibration object on every point and claim: {central, ci80: [lo, hi], grade, sources: [{name, url}], as_of}; grades A = official filings/statistics, B = credible named reporting, C = triangulated/bridged (requires a method field). Era-7 data freeze: 2026-06-30 — no sourced point past it; full-year 2026 belongs to the forecast panel, not this dataset.`

const SCHEMA_SPEC = `Exact JSON shape for the dataset (tools/verify_p2.py parses this mechanically):
{
  "series": {
    "coen_mce":        {"role": "stitch", "coverage": [1919, 2007], "points": [...]},
    "magna":           {"role": "stitch", "coverage": [1980, 2025], "points": [...]},
    "iab_pwc":         {"role": "stitch", "coverage": [1996, 2025], "points": [...]},
    "irs_soi":         {"role": "cross-check-only", "coverage": [..], "points": [...]},
    "benchmarks_pre1919": {"role": "stitch", "coverage": [1867, 1918], "points": [...]}
  },
  "concordance": [{"series_a", "series_b", "years", "note", "magnitude"}],
  "bridge": {"window": [1980, 2007], "method", "arithmetic", "steps": [{"expr", "expected"}]},
  "cross_checks": [{"year", "irs_value", "dataset_value", "divergence_pct", "flagged"}],
  "claims": [dataset-level calibrated claims with ds- IDs]
}
Each point: {"year", "medium", "money_type" (where derivable), "value", "unit", "source_series", "calibration": {...}, "bridged": true|false}. Points tagged bridged carry grade C. Every year+medium covered by two stitch series needs a concordance entry for that pair.`

phase('Assemble')
log('series-archaeologist assembling the century dataset')
const assembly = await agent(
  `<inputs>
  <metric>Annual US advertising expenditure, total and by medium, with money-type splits where the sources support them</metric>
  <coverage_window>1867-2025 (benchmark years only before 1919; annual from 1919)</coverage_window>
  <definitional_axes>by medium (newspapers, magazines, radio, broadcast TV, cable TV, direct mail, Yellow Pages/directories, classified as a tracked line, out-of-home, internet with sub-splits where available, other); by money type (national brand / local retail / classified / direct response) where derivable</definitional_axes>
  <candidate_series>
- coen_mce (role: stitch): Robert Coen / McCann-Erickson series, 1919-2007, by medium, billings-basis. Digitized at galbithink.org ("Annual U.S. Advertising Expenditure Since 1919") and discussed at purplemotes.net "US advertising expenditure data". NBER WP 28161 is the reconciliation reference.
- magna (role: stitch): Magna Global "MG8"-lineage series, ~1980-present, media-supplier revenue basis — a DIFFERENT object than Coen's billings; the 1980-2007 overlap with Coen is the bridge window.
- iab_pwc (role: stitch): IAB/PwC Internet Advertising Revenue reports, 1996-present, internet only.
- irs_soi (role: cross-check-only): IRS Statistics of Income corporate advertising deductions — the long-run A-grade independent aggregate. NEVER stitched; used only in cross_checks.
- benchmarks_pre1919 (role: stitch): pre-1919 benchmark-year estimates (Census of Manufactures 1865-1914 lineage; ~$200M in 1880 to ~$3B early 1900s) with wide CIs.
  </candidate_series>
  <schema_spec>${SCHEMA_SPEC}</schema_spec>
  <rigor_spec>${RIGOR}</rigor_spec>
  <tolerance>15</tolerance>
  <output_path>p2-ad-market/data/adspend.json</output_path>
  <output_notes_path>p2-ad-market/research/notes/dataset-notes.md</output_notes_path>
</inputs>
Additional context: read p2-ad-market/PLAN.md section 5 (R2) and the data-archaeologist and contrarian scout entries in p2-ad-market/planning/unknown-unknowns-probe.json — they carry the known seam inventory (category breaks: Billboards->OOH 2000 at ~3x, TV broadcast/cable split 1990, Coen pre-1940 downward revisions ~15%, 'miscellaneous' ~20% of the 1935 total) with source URLs. The era records at p2-ad-market/data/eras/ carry SCALE claims your totals must reconcile with (within their CIs).`,
  { label: 'archaeologist:adspend', phase: 'Assemble', agentType: 'series-archaeologist' }
)
if (!assembly) throw new Error('series-archaeologist returned no result')

phase('Forecast')
log('Superforecaster panel on post-freeze endpoint values')
const TARGETS = `Forecast targets (as of the 2026-06-30 freeze):
1. Full-year 2026 US total advertising spend (USD billions).
2. Full-year 2026 US digital share of total ad spend (%).
3. Full-year 2026 US retail media spend (USD billions).
4. Full-year 2026 US search advertising spend, including AI-surface ads (USD billions).
For each: central estimate + 80% CI + one-paragraph rationale + the reference class you used. Read p2-ad-market/data/adspend.json first so your 2024-2025 base numbers agree with the dataset.`
const CLASSES = [
  'Reference class: long-run advertising-to-GDP behavior and macro cycles. Anchor on the century-long ad/GDP series and current GDP forecasts, adjusting for the post-2019 structural break.',
  'Reference class: professional forecaster track record. Anchor on published Magna/GroupM/eMarketer/Zenith 2025-2026 forecasts and their historical revision bias (how far final actuals land from mid-year forecasts).',
  'Reference class: platform revenue run-rates. Build bottom-up from reported platform ad revenues (Alphabet, Meta, Amazon, TikTok, CTV players) and their growth trajectories, then gross up to the total market.',
]
const panel = await parallel(
  CLASSES.map((c, i) => () =>
    agent(`You are one of three independent panelists; you cannot see the others. ${TARGETS}\n${c}\nReturn, as your final message, a JSON object: {"panelist": "panelist-${i + 1}", "forecasts": [{"target", "central", "ci80": [lo, hi], "unit", "rationale", "reference_class"}]}.`, {
      label: `forecast:panelist-${i + 1}`,
      phase: 'Forecast',
      agentType: 'superforecaster',
      schema: {
        type: 'object',
        required: ['panelist', 'forecasts'],
        properties: {
          panelist: { type: 'string' },
          forecasts: {
            type: 'array',
            items: {
              type: 'object',
              required: ['target', 'central', 'ci80', 'unit', 'rationale', 'reference_class'],
              properties: {
                target: { type: 'string' }, central: { type: 'number' },
                ci80: { type: 'array', items: { type: 'number' } }, unit: { type: 'string' },
                rationale: { type: 'string' }, reference_class: { type: 'string' },
              },
            },
          },
        },
      },
    })
  )
)
const panelists = panel.filter(Boolean)
log(`${panelists.length}/3 panelists returned`)

phase('Merge')
const merged = await agent(
  `Assemble the forecast file for a research pipeline. Panel results (verbatim JSON): ${JSON.stringify(panelists)}

Write p2-ad-market/data/forecasts.json as {"forecasts": [{"id": "fc-{topic}-001", "target", "unit", "panelists": [{"name", "central", "ci80", "rationale", "reference_class"}], "median", "variance", "spread_note"}]} — one entry per target, all panelists preserved. The headline is the plain MEDIAN of panelist centrals (per PROCESS.md: no extremizing — panelists share an evidence base). variance = variance of the centrals; spread_note = one sentence on WHY the panelists disagree, written from their rationales. Panel disagreement is reported, never smoothed. Your final message: the file path + one line per target with median and spread.`,
  { label: 'merge:forecasts', phase: 'Merge', agentType: 'general-purpose' }
)

return {
  assembly,
  panelists: panelists.length,
  merge: merged,
  next: "Run workflows/p2-verify-stage.js with args {contract: 'p2-ad-market/planning/contracts/r2.json'}, then STOP for human Gate A. After approval, write p2-ad-market/planning/gate-a-approval.md recording the decision.",
}
