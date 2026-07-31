export const meta = {
  name: 'p2-r2b-money-type',
  description: 'P2 stage R2b: source-hunt then proxy-estimate the money-type split for eras 1, 5 and 7 before the data-layer freeze',
  phases: [
    { title: 'Source hunt', detail: '3 archaeologists — is a real source available?' },
    { title: 'Estimate', detail: 'per era: 2 forecaster lenses + 1 proxy-valuation lens' },
    { title: 'Reconcile', detail: 'merge into the era records with methods and intervals' },
  ],
}

// Stage R2b of p2-ad-market/PLAN.md, added at Gate B (planning/gate-b-approval.md).
// The money-type split is the project's central claim and its weakest numbers.
// Run from the repo root. Then verify contract r2b, then freeze.

const MONEY_TYPES = 'national_brand / local_retail / classified / direct_response'

const RIGOR = `Calibration object on every quantitative claim: {id, statement, central, unit, ci80: [lo, hi], grade, sources: [{name, url}], as_of}. Grades: A = official statistics or filings, B = credible named reporting, C = triangulated or proxy-derived (REQUIRES a method field documenting the derivation). Claim IDs keep their existing e{era}-{field}-{NNN} form; new claims continue the numbering in that era.
Never average conflicting credible sources into a midpoint — widen the interval and cite both.`

// The valuation discipline the human asked for at Gate B: treat an unobservable
// market quantity the way a private company's value is treated — derive it from
// observable proxies, document the chain, let proxy dispersion set the interval.
const PROXY_DOCTRINE = `ESTIMATION DOCTRINE (apply when no source publishes the quantity).

This is the private-company problem: the quantity is real but unobserved, so it must be derived from observables rather than asserted or left thin. Follow this discipline:

1. NEVER a bare guess. Every number is the output of a stated derivation from observable inputs.
2. PREFER TRIANGULATION. Build the estimate from 2-4 INDEPENDENT proxy routes that do not share a common input. Independence matters more than precision: two routes sharing a denominator are one route.
3. PROXY DISPERSION SETS THE INTERVAL. The ci80 comes from how far the independent routes disagree, plus the known error of the proxy relationship itself — not from a comfort band drawn around a central.
4. ADJUST FOR THE PROXY GAP. When the proxy population differs from the target population (a later period, a subset of cities, a different medium, a listed-vs-private distinction), state the direction and rough size of the bias, and adjust for it explicitly. An unadjusted proxy is a documented assumption, not a measurement.
5. ANCHOR ON WHAT IS OBSERVED. Where a total is known and the parts are not, estimate the parts and force them to reconcile to the observed total. Report the residual explicitly rather than letting the shares silently fail to sum.
6. GRADE HONESTLY. Proxy-derived numbers are grade C and carry a method field naming every route, its inputs, its adjustment and its weight. A well-documented C outranks an overconfident B.
7. A CEILING ON KNOWABILITY IS A FINDING. If the routes cannot separate two pools — if their intervals genuinely overlap — say so and report them as unranked. Do not manufacture an ordering the evidence cannot carry.`

const ERAS = [
  {
    n: 1, years: '1840s-1917', name: 'The Middlemen',
    problem: `The four shares sum to only 72%, leaving a 34% residual the SCALE method note describes as 20%. All four are grade C. The era's own verification (R3) already corrected two inputs: e1-scale-011 national brand 22 -> 16 percent, and e1-buyers-007 classified 12 -> 13 percent of newspaper receipts.`,
    proxies: `Candidate proxy routes to test: the 1928-1941 classified linage series (Historical Statistics T 485-486, the earliest measured split — adjust for the pre-WWI gap and state the direction); ANPA national-vs-local newspaper receipts for 1915; mail-order house revenues (Ward, Sears) against total direct-mail spend; Census of Manufactures print advertising receipts as the observed total the parts must reconcile to; patent-medicine and department-store advertiser concentration as a check on the national/local mix.`,
  },
  {
    n: 5, years: '1994-2001', name: 'The Impression',
    problem: `All eight money-type claims are grade C. This is the era where the split matters most for the project's central argument, because it is the eve of the intent-money migration: classified peaks here before its collapse.`,
    proxies: `Candidate proxy routes to test: newspaper classified revenue at its 2000 peak (~$19.6bn, roughly 40% of newspaper ad revenue) as a hard anchor for the classified pool; Yellow Pages/directory spend as a second intent-money pool; direct-mail spend from the Coen series (already in adspend.json); early internet ad-format mix from the IAB/PwC reports (banner vs classified vs search) for the digital slice; national-vs-local splits published inside the Coen series itself. The observed total for each year is in adspend.json — force the parts to reconcile to it.`,
  },
  {
    n: 7, years: '2008-2026', name: 'The Machine Market',
    problem: `The middle two pools (local_retail and classified) cannot be ranked: their intervals overlap. The modern definitional problem is severe — retail media, commerce media and search overlap heavily, and the R2 forecast panel warned that retail media and search must never be summed.`,
    proxies: `Candidate proxy routes to test: platform revenue disclosures by segment (Alphabet search vs network, Meta, Amazon advertising); IAB/PwC format breakdowns; retail-media estimates and their definitional scope (which is the main disagreement between compilers); small-business advertiser counts as a proxy for the local/self-serve pool; the classified successors (Craigslist, marketplaces, job boards) whose revenue is partly disclosed. NOTE the rail problem: Magna and IRS diverge by roughly a third by 2022, so state which rail each estimate sits on. Respect the 2026-06-30 data freeze.`,
  },
]

phase('Source hunt')
log('Hunting for real sources before estimating anything')

const results = await pipeline(
  ERAS,
  // Stage 1 — does a genuine source exist?
  (e) =>
    agent(
      `<inputs>
  <metric>The split of US advertising spend by MONEY TYPE (${MONEY_TYPES}) during ${e.years}</metric>
  <coverage_window>${e.years}</coverage_window>
  <definitional_axes>by money type; by medium where a compiler publishes the cross-tab</definitional_axes>
  <candidate_series>Start from what the project already holds: p2-ad-market/data/adspend.json (8 series, including naa_newspaper which was added specifically because classified is derivable from no named compiler series) and p2-ad-market/data/eras/era-${e.n}.json. Then hunt beyond them.</candidate_series>
  <rigor_spec>${RIGOR}</rigor_spec>
  <tolerance>15</tolerance>
  <output_path>p2-ad-market/data/moneytype/sources-era-${e.n}.json</output_path>
  <output_notes_path>p2-ad-market/research/notes/moneytype-era-${e.n}-sources.md</output_notes_path>
</inputs>

YOUR JOB IS THE SOURCE HUNT ONLY — do not estimate. Establish, for era ${e.n} (${e.name}, ${e.years}), whether any credible source actually publishes this split, in whole or in part.

The known problem: ${e.problem}

Search hard and specifically. Trade associations, government statistics, academic reconstructions, industry compilations, dissertations, and the appendices of books that used the data. For each candidate source record: what exactly it measures, coverage years, which of the four pools it can populate, access state (free / paywalled / licensed / lost), and whether it is independent of sources the project already uses.

Write a JSON object: {"era": ${e.n}, "sources_found": [...], "pools_sourceable": {"national_brand": "...", "local_retail": "...", "classified": "...", "direct_response": "..."}, "verdict": "<what can be sourced vs what must be estimated>", "proxy_leads": [...]}. In pools_sourceable say for each pool either the source that can populate it, or "no source found" plus what you tried. A documented absence is a real finding — say it plainly rather than reaching.`,
      { label: `sources:era-${e.n}`, phase: 'Source hunt', agentType: 'series-archaeologist' }
    ),

  // Stage 2 — estimate whatever sourcing could not reach, three independent lenses.
  (sourceResult, e) =>
    parallel([
      () =>
        agent(
          `You are estimating an unobserved market quantity for a calibrated research project, era ${e.n} (${e.name}, ${e.years}).

TARGET: the share of US advertising spend by money type — ${MONEY_TYPES} — for this era.

The source hunt has just run; read p2-ad-market/data/moneytype/sources-era-${e.n}.json and its notes first, and estimate only what it could not source.

The known problem: ${e.problem}
${e.proxies}

${PROXY_DOCTRINE}

YOUR LENS: **structural proxy derivation.** Work the way a valuation analyst works on a private company — build the estimate bottom-up from observable comparables and adjust for the gap between the proxy population and the target population. Your comparative advantage is the ADJUSTMENT step: name each proxy's bias, its direction, and its rough magnitude, then correct for it explicitly.

Read p2-ad-market/data/eras/era-${e.n}.json and p2-ad-market/data/adspend.json for the observed totals your parts must reconcile to.

${RIGOR}

Return, as your final message, JSON: {"lens": "structural-proxy", "era": ${e.n}, "estimates": [{"pool", "central", "ci80", "unit", "routes": [{"name", "inputs", "adjustment", "result", "weight"}], "method", "grade"}], "residual_pct", "unrankable_pairs": [...], "notes"}.`,
          { label: `est:era-${e.n}:proxy`, phase: 'Estimate', agentType: 'special-situations-analyst' }
        ),
      ...['reference-class', 'decomposition'].map((lens, i) => () =>
        agent(
          `You are one of three independent estimators on a panel; you cannot see the others' work. Era ${e.n} (${e.name}, ${e.years}).

TARGET: the share of US advertising spend by money type — ${MONEY_TYPES} — for this era.

Read p2-ad-market/data/moneytype/sources-era-${e.n}.json (the source hunt that just ran) and estimate only what it could not source.

The known problem: ${e.problem}
${e.proxies}

${PROXY_DOCTRINE}

YOUR LENS: ${lens === 'reference-class'
            ? '**reference class.** Anchor on the outside view: what this split looks like in ADJACENT eras where it IS measured, and in analogous markets where the split is published. Move from that base rate toward this era only as far as era-specific evidence justifies, and say how far you moved and why.'
            : '**Fermi decomposition.** Build each pool bottom-up from its drivers — the number of buyers of that type, their typical spend, the media they bought — and reconcile the sum against the observed era total. Your comparative advantage is making the driver structure explicit so a reader can attack any single input.'}

Read p2-ad-market/data/eras/era-${e.n}.json and p2-ad-market/data/adspend.json for the observed totals your parts must reconcile to.

${RIGOR}

Return, as your final message, JSON: {"lens": "${lens}", "era": ${e.n}, "estimates": [{"pool", "central", "ci80", "unit", "routes": [{"name", "inputs", "adjustment", "result", "weight"}], "method", "grade"}], "residual_pct", "unrankable_pairs": [...], "notes"}.`,
          { label: `est:era-${e.n}:${lens}`, phase: 'Estimate', agentType: 'superforecaster' }
        )
      ),
    ]).then((panel) => ({ era: e.n, sources: sourceResult, panel: panel.filter(Boolean) }))
)

const ok = results.filter(Boolean)
log(`${ok.length}/3 eras estimated`)

phase('Reconcile')

// One reconciler PER ERA. A single reconciler needs every lens from all three
// eras in one prompt (~360k chars) and the first version of this script sliced
// that to fit, silently discarding six of nine lens estimates. Per-era keeps
// each payload whole; the size of what each agent receives is logged.
const perEra = await parallel(
  ok.map((r) => () => {
    const payload = JSON.stringify(r)
    log(`era ${r.era}: reconciling ${r.panel.length} lens result(s), ${payload.length} chars — untruncated`)
    if (r.panel.length < 3) {
      log(`WARNING era ${r.era}: only ${r.panel.length}/3 lenses returned; the median is over what arrived`)
    }
    return agent(
      `You are reconciling ONE era's money-type estimates for stage R2b (p2-ad-market/planning/gate-b-approval.md). Era ${r.era}.

Its source hunt and its full estimation panel (structural-proxy, reference-class, Fermi decomposition), verbatim JSON: ${payload}

Produce the reconciled split for THIS ERA ONLY. Do not write to any era record or claims file — a later step applies your output.

1. For each of the four pools, the headline is the plain MEDIAN of the lenses' centrals — no extremizing, per PROCESS.md, because the lenses share an evidence base. State how many lenses contributed; if fewer than three arrived, say so and treat the result as provisional.
2. The ci80 spans the lenses' combined uncertainty: min lower and max upper across lenses, unless one lens is clearly mis-specified — in which case discount it and say why.
3. Where the source hunt found a REAL source, the sourced figure wins over every estimate, and the claim is graded on the source (A or B), not C.
4. Where the lenses cannot separate two pools, record them in unranked_pairs. Do not manufacture an ordering.
5. Force the four pools to reconcile against this era's observed total from p2-ad-market/data/adspend.json. Report the residual explicitly as its own figure with its own reasoning. A residual is legitimate; a silent shortfall is not.
6. Every proxy-derived figure is grade C and carries a method naming each independent route, its adjustment for the proxy-population gap, and its weight. Routes sharing a common input are ONE route — say so if the panel offered near-duplicates.

Return JSON as your final message: {"era": ${r.era}, "lenses_used": <n>, "observed_total": {...}, "pools": [{"pool", "central", "ci80", "unit", "grade", "method", "sourced_by", "lens_centrals": [...]}], "residual": {"central", "ci80", "reasoning"}, "unranked_pairs": [...], "grade_changes": [...], "findings": [...]}`,
      { label: `reconcile:era-${r.era}`, phase: 'Reconcile', agentType: 'general-purpose' }
    )
  })
)
const eraResults = perEra.filter(Boolean)
log(`${eraResults.length}/${ok.length} eras reconciled`)

const reconciled = await agent(
  `You are the APPLY step of stage R2b (p2-ad-market/planning/gate-b-approval.md). Three eras (1, 5, 7) were re-researched for the money-type split and each has now been reconciled independently.

Reconciled output, verbatim JSON: ${JSON.stringify(eraResults)}

Do exactly this:

You are APPLYING these reconciled figures, not re-deriving them. The centrals, intervals, grades and residuals above are decided — do not recompute or second-guess them. Your job is to land them correctly and leave the repo consistent.

1. Apply to p2-ad-market/data/eras/era-{1,5,7}.json: update the by_money_type claims in SCALE and BUYERS in place, KEEPING their existing claim IDs. Every updated claim carries a full calibration object and, at grade C, the method from the reconciled output naming each route, its adjustment and its weight.
2. Update each updated claim's STATEMENT prose to match its new central. A statement contradicting its own central is a defect the pipeline checks for (r5-stale-prose).
3. Add each era's residual as its own claim, continuing that era's SCALE numbering, with the reasoning in its method.
4. Write p2-ad-market/data/moneytype/reconciled.json as the audit trail: per era and pool, the source verdict, every lens central, the median, the final interval, the residual, unranked pairs, grade changes, and how many lenses contributed.
5. Update p2-ad-market/data/claims.json so the three eras' claims are reflected — copy each changed claim verbatim, insert the new residual claims, and preserve the origin and verdict fields on every other entry. Do not regenerate untouched entries.
6. Chapters: if any chapter states a money-type value these figures supersede, correct it, then re-run python3 tools/readability.py on that chapter and confirm all four gates still pass. Chapters 02, 06, 08 and 09 are the likely ones.
7. TAXONOMY CHECK — surfaced by an earlier run and not yet resolved: era 5 splits Yellow Pages between local_retail and direct_response, while era 7 books all directories in classified. In 2000 that is worth about $13.2bn, or 5.3 points. Do NOT unilaterally re-classify: moving it would shift the project's most-quoted $19.6bn classified peak into a headline pool and ripple into naa_newspaper and several chapters. Record it in reconciled.json under open_taxonomy_questions with its magnitude and what it would touch, and flag it in your final message for the human.
8. Run and confirm: python3 tools/verify_p2.py r1-records, r1-claims, r5-stale-prose, r5-chapter-stale, r5-claimsfile, r2-reconcile. Fix anything tracing to your own application work. If r3-applied now diverges because R2b legitimately supersedes an R3 value, do NOT edit verdicts.json to hide it — verdicts.json is the historical R3 record. Report the divergences instead.

Final message: per era, the four applied pools with grades and lens counts, the residual, any unranked pairs, which pools improved to a sourced grade, the taxonomy question, and any r3-applied divergences.`,
  { label: 'reconcile:money-type', phase: 'Reconcile', agentType: 'general-purpose' }
)

return {
  eras: ok.length,
  reconcile: reconciled,
  next: "Run workflows/p2-verify-stage.js with args {contract: 'p2-ad-market/planning/contracts/r2b.json'}, then freeze the data layer.",
}
