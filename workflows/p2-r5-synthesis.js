export const meta = {
  name: 'p2-r5-synthesis',
  description: 'P2 stage R5: assemble claims.json, write the ten readability-gated chapters, produce the Gate B thread-candidates menu',
  phases: [
    { title: 'Assemble claims', detail: 'one agent builds data/claims.json from verified records' },
    { title: 'Chapters', detail: '10 parallel chapter writers, readability-gated' },
    { title: 'Threads', detail: 'thread-candidates menu for Gate B' },
  ],
}

// Stage R5 of p2-ad-market/PLAN.md. Run from the repo root after contract r4 passed.

phase('Assemble claims')
const assembled = await agent(
  `You are the claims-assembly step of stage R5 (p2-ad-market/PLAN.md). Build p2-ad-market/data/claims.json — the single source of truth for every number the chapters and the experience will cite.

Do exactly this:
1. Collect every calibrated claim from: the 7 verified era records (p2-ad-market/data/eras/era-*.json — field claims, money-type splits, event claims, unit-economics), the dataset-level claims in p2-ad-market/data/adspend.json, and the calibration objects in p2-ad-market/data/mechanism.json.
2. Write claims.json as {"claims": [...]} — each claim verbatim (id, statement, central, unit, ci80, grade, sources, as_of, method where present), plus "origin" (the file it came from) and "verdict" (from p2-ad-market/data/verification/verdicts.json; mechanism claims without verdicts get "post-verification").
3. No editing, no deduplication by rewriting — if two claims genuinely duplicate, keep the verified one and record the drop in a "dropped" array.
4. Parse-check, then run: python3 tools/verify_p2.py r5-claimsfile — fix shape violations only.

Final message: the path, total claim count, counts by grade and by origin file.`,
  { label: 'assemble:claims', phase: 'Assemble claims', agentType: 'general-purpose' }
)
if (!assembled) throw new Error('claims assembly returned no result')

const READABILITY = `READABILITY GATE (hard): the chapter must pass ALL FOUR — Flesch-Kincaid <= 10, Reading Ease >= 50, Gunning Fog <= 12, SMOG <= 12. Run python3 tools/readability.py <your-chapter> after drafting; rewrite failing sentences (split at conjunctions, cut throat-clearing, un-nominalize — keep technical terms) and re-run until all four pass. Record the final scores in the frontmatter. The goal: preserve the complexity of the ideas, remove the complexity of the sentences.`

const FRONTMATTER = `Frontmatter (YAML, required): title; claim_ids: [every claim ID the chapter uses, comma-separated in brackets]; readability: the four final scores. Every number in your prose MUST come from a claim in p2-ad-market/data/claims.json and its ID must be listed — tools/verify_p2.py r5-traceability enforces this. Never introduce a number that lacks a claim. Where a claim is grade C or has a wide CI, the prose says so plainly ("our best estimate", "somewhere between X and Y") — calibration is content.`

const CHAPTERS = [
  { file: '01-thesis.md', spec: 'The thesis chapter: the question (how did the ad market work era by era, and what exactly did Google change), the seven-era map with mechanism names, the twin-engine preview, and how to read the numbers (grades, CIs, the splice-honest dataset). Sources: PLAN.md sections 1-3, BRIEF.md, claims.json headline numbers.' },
  { file: '02-the-middlemen.md', spec: 'Era 1, The Middlemen (1840s-1917). Source: p2-ad-market/data/eras/era-1.json — the full record. The agency system inventing itself; the 15% commission; the penny press inventing ad-subsidized content; patent medicines; mail order; audited circulation as the era climax. Benchmark-year scale numbers with honest wide CIs.' },
  { file: '03-sponsorship.md', spec: 'Era 2, Sponsorship (1918-1949). Source: era-2.json. Advertisers owning the shows; ratings making broadcast priceable; the real spend hierarchy (newspapers and direct mail over radio — say it against the myth); WWII tax-subsidized advertising.' },
  { file: '04-the-spot-market.md', spec: 'Era 3, The Spot Market (1950-1975). Source: era-3.json. The 30-second spot and the upfront; Nielsen pricing the demographic; sponsorship dying; when TV actually passed newspapers and in which money type.' },
  { file: '05-segmentation.md', spec: 'Era 4, Segmentation (1976-1993). Source: era-4.json. Cable niches; geodemographics (PRIZM); direct mail as the quiet giant; the 15% commission beginning to die; holding-company consolidation.' },
  { file: '06-the-impression.md', spec: 'Era 5, The Impression (1994-2001). Source: era-5.json. CPM ported to the web; portals and banners; GoTo pricing the click; the dot-com crash; classified at its peak on the eve of collapse; the first unit-economics numbers.' },
  { file: '07-the-auction.md', spec: 'Era 6, The Auction (2002-2008) — THE CENTERPIECE. Sources: era-6.json + p2-ad-market/data/mechanism.json (both engines). The twin-engine story: the auction as yield engine (worked numbers from mechanism.json — use its examples verbatim, simplified in prose), distribution as volume engine (AOL deal, TAC, network share), the Overture post-mortem, source-of-funds (whose budgets search actually ate — collapse curves), self-serve and the long tail. End on the signpost: this design wins — watch what happens to it.' },
  { file: '08-the-machine-market.md', spec: 'Era 7, The Machine Market (2008-2026). Source: era-7.json. Programmatic; mobile; the auction death sequence (header bidding, first-price 2019, RGSP and the knobs); privacy shocks; concentration and the triopoly+; the antitrust endgame; the AI beats through the 2026-06-30 freeze; unit economics including the LLM inference comparison.' },
  { file: '09-the-capture-question.md', spec: 'The capture question: did digital capture the ad economy, expand it, or reallocate it? Sources: adspend.json (the ad/GDP series, competing series SIDE BY SIDE — never merged), era records. The splice-honest methodology as content: what each series measures, why they disagree, where the seams are. Take the documented stance the evidence supports, and show the strongest case for the other readings.' },
  { file: '10-verdict-and-handoff.md', spec: 'The verdict and the P3 handoff: what exactly Google changed (twin-engine verdict from mechanism.json), what it did NOT change, the unit-economics trio (revenue/cost/margin per query) against the 2023-2026 LLM inference series, the state of play at the freeze date, and the open questions P3 inherits. Sources: mechanism.json, era-7.json, claims.json.' },
]

phase('Chapters')
log('Spawning 10 chapter writers')
const chapters = await parallel(
  CHAPTERS.map((c) => () =>
    agent(
      `You are a chapter writer for a rigorously calibrated research project on the history of the advertising market. Write p2-ad-market/research/${c.file}.

CHAPTER SPEC: ${c.spec}

VOICE: plain-English analyst prose for a smart general reader — concrete, mechanism-first, no jargon left unexplained at first use, no marketing-history clichés. Verified myths stay dead: where the record corrects a legend (radio's rank, the Wanamaker quote), the chapter says so as a feature, never repeats the legend as fact.

${FRONTMATTER}

${READABILITY}

Read p2-ad-market/data/claims.json and your source files before writing. Your final message: the file path, the four readability scores, and the count of claim IDs used.`,
      { label: `chapter:${c.file.replace('.md', '')}`, phase: 'Chapters', agentType: 'general-purpose' }
    )
  )
)
const okChapters = chapters.filter(Boolean)
log(`${okChapters.length}/10 chapters returned`)

phase('Threads')
const threads = await agent(
  `You are the thread-candidates step of stage R5 (p2-ad-market/PLAN.md section 5, Gate B agenda). First-class cross-era threads were deliberately NOT chosen before research; the human picks them at Gate B from your menu.

Read the 7 era records (p2-ad-market/data/eras/), adspend.json, mechanism.json, and claims.json. Write p2-ad-market/planning/thread-candidates.md: for each candidate thread (consider at least: spend/medium shifts; targeting precision; pricing power and who set the price; intermediaries and take rates; measurement and who counted; the money-type migration; unit economics of attention; capture-vs-expansion — plus any thread the evidence surfaced that the plan did not anticipate), give: (1) the one-sentence story arc across the seven eras, (2) the schema fields and claim IDs that support it (with era coverage — a thread with holes says where), (3) what its visual would show, (4) an honest strength grade: how strongly the verified evidence carries it.

Order the menu by evidence strength. This file is exempt from the readability gate (internal), but keep it crisp. Final message: the path + the ordered candidate list with strength grades.`,
  { label: 'threads:menu', phase: 'Threads', agentType: 'general-purpose' }
)

return {
  claims: assembled,
  chapters: okChapters.length,
  threads,
  next: "Run workflows/p2-verify-stage.js with args {contract: 'p2-ad-market/planning/contracts/r5.json'}, then STOP for human Gate B (thread selection + data-layer freeze + design-grill green light).",
}
