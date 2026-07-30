export const meta = {
  name: 'p2-r4-mechanism',
  description: 'P2 stage R4: two mechanism-analyst agents work the twin engines (auction yield, distribution volume), then a merge step reconciles them',
  phases: [
    { title: 'Twin engines', detail: 'auction analyst + distribution analyst, parallel' },
    { title: 'Reconcile', detail: 'merge into mechanism.json + simulator-params.json' },
  ],
}

// Stage R4 of p2-ad-market/PLAN.md. Run from the repo root after contract r3 passed.

const RIGOR = `Calibration object for EMPIRICAL numbers: {id: "mech-{topic}-{NNN}", statement, central, unit, ci80: [lo, hi], grade (A official filings/court records, B credible named reporting, C triangulated + method), sources: [{name, url}], as_of}. Invented example numbers carry "illustrative": true and never a calibration. Arithmetic steps: {"expr": "<expression>", "expected": <number>} — tools/verify_p2.py re-evaluates every step.`

phase('Twin engines')
log('Spawning auction and distribution analysts')
const [auction, distribution] = await parallel([
  () =>
    agent(
      `<inputs>
  <mechanism_spec>Google's quality-weighted second-price search auction as deployed 2002-2008: AdWords Select's AdRank (bid x predicted clickthrough), generalized second-price payment (pay the minimum needed to hold your position, quality-adjusted), self-serve entry with no minimums. Read p2-ad-market/data/eras/era-6.json (verified) for the deployed parameters and economics.</mechanism_spec>
  <rival_designs>(1) Pure-bid ranking, GoTo/Overture style: rank by bid alone, pay-per-click. (2) First-price auction with equilibrium bid shading — the design the market later adopted (2019). Optionally reference Vickrey/VCG as the truthful benchmark when demonstrating GSP's non-truthfulness.</rival_designs>
  <claims_to_test>(1) Pure-bid ranking places lower-revenue ads above higher-revenue ads whenever clickthrough differs enough — show the revenue-per-impression arithmetic. (2) Quality-weighting raises TOTAL expected revenue while also improving result relevance — same example, both metrics. (3) Under GSP each winner pays less than their bid, yet total revenue can exceed the pure-bid outcome. (4) GSP is NOT truthful: construct the standard counterexample where bidding below value beats truthful bidding. (5) First-price with rational bid shading converges toward similar expected revenue — the design change of 2019 was about transparency and header-bidding pressure, not yield magic. (6) The RGSP/pricing-knob coda: using the DOJ-trial disclosures (squashing, format pricing, RGSP ~2019, launches described internally as raising prices ~5-10%), demonstrate with worked numbers how each knob moves prices without quality change.</claims_to_test>
  <evidence_basis>p2-ad-market/data/eras/era-6.json and era-7.json (verified records); the google-mechanics and counter-narrative scout entries in p2-ad-market/planning/unknown-unknowns-probe.json (DOJ trial sources with URLs); public DOJ v. Google trial records for the knob disclosures.</evidence_basis>
  <rigor_spec>${RIGOR}</rigor_spec>
  <output_spec>Write your analysis under top-level key "auction" shaped as {"designs": {"pure_bid": {...}, "gsp": {...}, "first_price_shading": {...}}, "demonstrations": {"gsp_not_truthful": {...}, "rgsp_coda": {...}}, "examples": [...], "findings": [...]} — tools/verify_p2.py checks these exact key names. Simulator params per your default format; every scenario ties to one of the six claims, and the first-price/bid-shading panel is a required scenario.</output_spec>
  <output_analysis_path>p2-ad-market/data/mechanism-auction.json</output_analysis_path>
  <output_params_path>p2-ad-market/data/simulator-params.json</output_params_path>
  <output_notes_path>p2-ad-market/research/notes/mechanism-auction-notes.md</output_notes_path>
</inputs>`,
      { label: 'engine:auction', phase: 'Twin engines', agentType: 'mechanism-analyst' }
    ),
  () =>
    agent(
      `<inputs>
  <mechanism_spec>The distribution economics of search advertising syndication, 1998-2008 and after: revenue-share syndication deals (traffic acquisition cost), revenue guarantees as balance-sheet bets, and exclusive default placements. Key instruments: the May 2002 Google-AOL deal (~$100M revenue guarantee, ~85% revenue share), network/TAC economics (network sites ~41% of Google revenue in 2006, TAC ~32% of ad revenue), and later the Apple default payments (~$20B in 2022, ~36% of Safari search ad revenue) adjudicated in US v. Google (Mehta ruling, Aug 2024).</mechanism_spec>
  <rival_designs>The counterfactual baseline: organic distribution without guarantees or exclusive defaults — the world where Overture's syndication network held. Compare deal economics, not auction rules.</rival_designs>
  <claims_to_test>(1) The AOL 2002 deal was a bet-the-company guarantee: work the numbers on what Google risked vs what the deal moved (queries, revenue, the flip from Overture). (2) TAC economics: at ~85% revenue share, syndicated queries earned far less per query than owned-and-operated — quantify the margin difference and why volume still made it rational. (3) The capture-attribution question: weigh auction yield vs distribution volume as drivers of Google's 2002-2008 revenue growth, using the network-share series and owned-vs-syndicated split; state a documented verdict with evidence weights. (4) The Mehta-ruling coda: what the court found the defaults were worth and what that implies retrospectively about the twin-engine balance.</claims_to_test>
  <evidence_basis>p2-ad-market/data/eras/era-6.json and era-7.json (verified); the google-mechanics scout entry in p2-ad-market/planning/unknown-unknowns-probe.json; Google IPO-era filings (grade A) for TAC and network share; the Mehta ruling (grade A) for default-payment findings.</evidence_basis>
  <rigor_spec>${RIGOR}</rigor_spec>
  <output_spec>Write your analysis under top-level key "distribution" shaped as {"aol_2002": {...}, "tac_series": {...}, "network_share": {...}, "default_payments": {...}, "mehta_findings": {...}, "capture_attribution": {...}, "examples": [...]} — tools/verify_p2.py checks these exact key names (all non-empty).</output_spec>
  <output_analysis_path>p2-ad-market/data/mechanism-distribution.json</output_analysis_path>
  <output_notes_path>p2-ad-market/research/notes/mechanism-distribution-notes.md</output_notes_path>
</inputs>`,
      { label: 'engine:distribution', phase: 'Twin engines', agentType: 'mechanism-analyst' }
    ),
])
if (!auction || !distribution) throw new Error('one of the twin-engine analysts returned no result')

phase('Reconcile')
const merged = await agent(
  `You are the reconcile step of stage R4 (p2-ad-market/PLAN.md section 5). Two mechanism analyses exist: p2-ad-market/data/mechanism-auction.json (top-level key "auction") and p2-ad-market/data/mechanism-distribution.json (top-level key "distribution").

Do exactly this:
1. Merge them into p2-ad-market/data/mechanism.json as {"engines": {"auction": <auction content>, "distribution": <distribution content>}, "reconciliation": {...}} — content verbatim, no rewriting of examples or numbers.
2. Write the "reconciliation" object yourself: the twin-engine account (auction = yield engine, distribution = volume engine), the capture-attribution verdict carried over from the distribution analysis, and an explicit check that nothing in one engine contradicts the other on the same fact. If you find a contradiction, do NOT resolve it by editing — record it in reconciliation.contradictions and flag it in your final message.
3. Confirm p2-ad-market/data/simulator-params.json exists (the auction analyst wrote it), that every scenario ties to a claim, and that the first-price/bid-shading panel scenario is present.
4. Run: python3 tools/verify_p2.py r4-coverage && python3 tools/verify_p2.py r4-arithmetic && python3 tools/verify_p2.py r4-claims. Fix violations that trace to your MERGE (shape/key placement); never alter example arithmetic or calibrated values — those belong to the analysts, and unfixable violations get reported, not papered over.

Final message: the merged file paths, the capture-attribution verdict in one line, any contradictions found, any violations you could not fix.`,
  { label: 'reconcile:mechanism', phase: 'Reconcile', agentType: 'general-purpose' }
)

return {
  auction,
  distribution,
  reconcile: merged,
  next: "Run workflows/p2-verify-stage.js with args {contract: 'p2-ad-market/planning/contracts/r4.json'}",
}
