export const meta = {
  name: 'p2-r1-era-research',
  description: 'P2 stage R1: seven market-era-historian agents fill the nine-field era schema, one per era, in parallel',
  phases: [{ title: 'Era fan-out', detail: '7 parallel historians, web-enabled' }],
}

// Stage R1 of p2-ad-market/PLAN.md. Run from the repo root.
// After this completes, run workflows/p2-verify-stage.js with
// args {contract: 'p2-ad-market/planning/contracts/r1.json'}.

const RIGOR = `Claim ID convention: e{era}-{field}-{NNN} (lowercase field, zero-padded, e.g. e3-scale-004), unique across the whole project.
Calibration object, required on every quantitative claim: {id, statement, central, unit, ci80: [lo, hi], grade, sources: [{name, url}], as_of}.
Grades: A = official filings/statistics, B = credible named reporting with a track record, C = triangulated/Fermi estimate — grade C additionally requires a "method" field documenting the triangulation.
Never source a number from the Acquired or Stratechery podcasts. When credible sources conflict, widen ci80 and cite both — never average the conflict away.`

const CONSTRAINTS_SHARED = `Pre-cleared corrections (from PLAN.md section 2 — violating these without new primary evidence is a verification failure):
- AdWords launched Oct 2000 as a CPM product; the auction arrives with AdWords Select, Feb 2002.
- Overture led paid-search revenue through 2002; Google settled Overture's patent suit for ~2.7M shares (~$230M).
- Radio was never the #1 US medium by spend. Newspapers out-earned TV deep into the 1950s-70s.
- "Out of Home" replaced "Billboards" as a category in 2000 at roughly 3x the expenditure.
- The Wanamaker "half my advertising" quote and the "first banner ad" story are attributed legends — verify against primary evidence or label them as legend.
- Classifieds, directories (Yellow Pages), and direct mail are tracked categories in EVERY era, not just their peak eras.`

const SCHEMA_SPEC = `Read p2-ad-market/planning/schema/era-record.schema.json and follow it exactly. In brief: 8 fields (CREATORS, BUYERS, SELLERS, MEDIUM, SCALE, PRICING, MEASUREMENT, TARGETING) each with a summary (200+ chars) and claims; SCALE and BUYERS additionally carry by_money_type with all four keys (national_brand, local_retail, classified, direct_response — a claim each, or an absence note saying why and what was tried); 5-10 dated events; eras 5-7 add the unit_economics block; boundary_notes states the facts you share with neighboring eras so the verifier can cross-check agreement.`

const ERAS = [
  {
    n: 1, name: 'The Middlemen', years: '1840s-1917',
    mech: 'Agencies invent themselves as space brokers and settle on the 15% commission. Audited circulation (ABC, 1914) makes rate cards enforceable. The penny press (1833) invents ad-subsidized below-cost content.',
    anchors: `Anchor questions: How did the agency system actually form (space brokers -> full service)? Where did the 15% commission come from and who enforced it? Patent medicines as the first national advertisers. Mail order (Montgomery Ward 1872, Sears 1888) as the direct-response origin. Classified advertising from the penny press onward. Circulation fraud and the 1914 Audit Bureau of Circulations as the era's institutional climax. SCALE: benchmark-year estimates ONLY (Census of Manufactures 1865-1914, ~$200M in 1880 to ~$3B early 1900s) with wide CIs — never fabricate an annual series. Global figure: an explicit absence note is acceptable.`,
  },
  {
    n: 2, name: 'Sponsorship', years: '1918-1949',
    mech: 'Advertisers OWN the shows; networks sell time, not audience. Ratings institutions (Crossley/CAB 1930, then Hooper) make broadcast priceable. WWII excess-profits tax subsidizes advertising.',
    anchors: `Anchor questions: How did the sponsorship model actually work — who produced the programming, who held the risk? How did ratings make time salable, and who paid the raters? The Coen/McCann series starts 1919: what do the real numbers show about medium shares (newspapers still #1, direct mail large, radio never #1)? WWII: how the excess-profits tax turned advertising into subsidized spend, and the Advertising Council. Agency economics under sponsorship: what did the 15% commission buy?`,
  },
  {
    n: 3, name: 'The Spot Market', years: '1950-1975',
    mech: 'The 30-second spot and the upfront replace sponsorship; Nielsen prices the demographic. Sponsorship dies via the quiz-show scandals and rising production costs.',
    anchors: `Anchor questions: How did the spot market and the upfront actually work — who set prices, what was a rating point worth? The sponsorship-to-spot transition as a PRICING change (mid-era, own its dates). Nielsen's methodology and its known crises. Newspapers out-earning TV deep into this era: when did TV actually pass print, in which money type? Yellow Pages and classified economics in the era. The creative revolution as an agency-industry story (what it changed about who made ads and what they charged).`,
  },
  {
    n: 4, name: 'Segmentation', years: '1976-1993',
    mech: 'Cable fragments the audience into niches; direct mail gets its database upgrade (PRIZM geodemographics, mid-1970s); measurable response scales.',
    anchors: `Anchor questions: How did geodemographic targeting (PRIZM, Claritas, ZIP-code clustering) actually work and who sold it? Cable's niche economics vs broadcast's mass economics. Direct mail as the #2-3 medium by spend — the era's real giant. The beginning of the end of the 15% commission and the agency holding-company consolidation (WPP, Omnicom, Interpublic). The measurable-response tradition (keyed coupons to database marketing) as TV's shadow opposite.`,
  },
  {
    n: 5, name: 'The Impression', years: '1994-2001',
    mech: 'CPM is ported to the web; portals sell banners like magazine pages; GoTo (1998) prices the click with a pure-bid auction. The dot-com crash resets everything.',
    anchors: `Anchor questions: How the CPM banner model carried print/TV logic onto the web, and why it broke. Verify or de-legend the "first banner ad" (HotWired 1994) story. Portal economics (Yahoo et al.): who bought, at what prices? GoTo/Overture's pure-bid paid search: mechanics, revenue, syndication strategy. The dot-com crash's effect on ad spend and on WHERE the surviving money went. Classified's peak ($19.6B, 2000, ~40% of newspaper revenue) on the eve of its collapse. UNIT ECONOMICS block required: revenue per impression, cost to serve, margin — best calibrated estimates.`,
  },
  {
    n: 6, name: 'The Auction', years: '2002-2008',
    mech: 'AdWords Select (Feb 2002): quality-weighted second price (relevance x bid). AdSense (2003) syndicates it. Self-serve with no minimums expands WHO can advertise. The syndication wars (AOL, May 2002) decide distribution.',
    anchors: `Anchor questions (RECORD the era; the deep mechanism analysis happens in stage R4 — collect economics, events, and numbers, not auction theory): Source-of-funds — which money did search take first? Collapse curves for classifieds (peak $19.6B 2000 -> $4.6B 2012; help-wanted -90%), Yellow Pages (peak ~$14.7B 2005), direct-response categories. The AOL deal (May 2002, ~$100M guarantee, 85% rev share) and the syndication war against Overture. TAC and network share (network sites ~41% of Google revenue 2006, TAC ~32% of ad revenue). Self-serve and the long tail: how many advertisers existed before vs after, minimum spend then vs now. The April 2004 trademark-keyword policy change as a revenue unlock. IPO-era disclosures as grade-A sources. TV brand money staying put — where the brand budgets actually were. UNIT ECONOMICS block required: revenue per query, cost per query, margin.`,
  },
  {
    n: 7, name: 'The Machine Market', years: '2008-2026',
    mech: 'Programmatic/RTB industrializes the auction; mobile moves the queries; header bidding (~2014-15) breaks the waterfall; first-price (2019) and RGSP end GSP; privacy shocks and antitrust close the era; AI starts buying, selling, and answering.',
    anchors: `Anchor questions: The auction's death sequence as PRICING beats: header bidding ~2014-15, unified first-price 2019, RGSP + pricing knobs (squashing, format pricing — DOJ trial disclosures 2023). Privacy shocks: GDPR 2018, ATT 2021, the cookie deprecation saga — measured spend effects. Concentration: duopoly -> triopoly+ (Amazon retail media), with shares. The antitrust endgame: Mehta ruling Aug 2024 and remedies. The AI beats: AI Overviews (May 2024) and click-through effects, Perplexity ads (Nov 2024 -> retreat Feb 2026), Meta AI conversation targeting (Dec 2025), ChatGPT ads (Jan-Feb 2026). The buyer side going algorithmic (Performance Max, Advantage+). UNIT ECONOMICS block required: revenue per query / per user-hour, cost to serve, margin, PLUS the comparison_series: 2023-2026 LLM inference cost-per-query. HARD CONSTRAINT: data-freeze 2026-06-30 — no claim with as_of past the freeze; note later events in boundary_notes as out-of-scope pointers for P3.`,
  },
]

function historianPrompt(e) {
  return `<inputs>
  <market>The United States advertising market. Carry one global market-size figure for the era where sources exist; an explicit absence note is acceptable where they do not.</market>
  <period>${e.years} (era ${e.n} of 7, "${e.name}")</period>
  <mechanism_summary>${e.mech}</mechanism_summary>
  <schema_spec>${SCHEMA_SPEC}</schema_spec>
  <rigor_spec>${RIGOR}</rigor_spec>
  <constraints>${CONSTRAINTS_SHARED}
Era-specific guidance: ${e.anchors}</constraints>
  <seed_material>Read p2-ad-market/planning/unknown-unknowns-probe.json and extract every gap whose affected_eras includes "${e.n}". Those gaps carry evidence URLs from the scoping probe — treat them as seed sources and obligations: each blocking/major gap for your era must be addressed in your record or explicitly deferred with a reason in your notes. Also read p2-ad-market/PLAN.md sections 2-3 for the era map and schema context.</seed_material>
  <output_record_path>p2-ad-market/data/eras/era-${e.n}.json</output_record_path>
  <output_notes_path>p2-ad-market/research/notes/era-${e.n}-notes.md</output_notes_path>
</inputs>`
}

phase('Era fan-out')
log('Spawning 7 era historians in parallel')
const results = await parallel(
  ERAS.map((e) => () =>
    agent(historianPrompt(e), {
      label: `era-${e.n}:${e.name}`,
      phase: 'Era fan-out',
      agentType: 'market-era-historian',
    })
  )
)
const ok = results.filter(Boolean)
log(`${ok.length}/7 historians returned`)
return {
  completed: ok.length,
  summaries: ok,
  next: "Run workflows/p2-verify-stage.js with args {contract: 'p2-ad-market/planning/contracts/r1.json'}",
}
