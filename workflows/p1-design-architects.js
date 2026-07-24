export const meta = {
  name: 'p1-design-architects',
  description: 'Four cognitive-design-architect variants propose divergent design directions for the repo-wide system, the hub tree, and the P1 experience',
  phases: [{ title: 'Explore', detail: 'four architects, four philosophies' }],
}

const NARRATIVE = `THE PROJECT: "The Economics of Intelligence" (Project 1 of a three-project research tree called Chip & Ad Market Research). It tests Ben Thompson's thesis that the marginal cost of AI inference is "back" — that US labs (OpenAI, Anthropic) price tokens far above serving cost behind a scarcity umbrella, that China's open-weight models price near marginal cost because open weights invite competing hosts (not because Chinese inference is cheaper), and that when US compute supply catches demand, prices converge and the question becomes whether the whole AI buildout ever pays off.

THE EMOTIONAL/INTELLECTUAL ARC (P1): curiosity -> a widening gap (price vs cost) -> tension (a trillion-dollar bet) -> an honest, uncertain verdict. Six propositions T1-T6: four supported, one partly, one unresolved. The unresolved one carries all the capital risk. The climax is a payback question answered as a probability, not a yes/no — a race between a cumulative capex curve and the revenue it must earn back.

THE DATA SHAPES available to visualize:
- 160 calibrated claims, each an estimate with an 80% confidence interval and a source grade (A/B/C). Uncertainty is first-class here — the CI is the native visual unit.
- The price-vs-cost GAP: US list price ~7x estimated marginal serving cost; shown two ways (a wide uncertain cost-model band, and a hard lower bound proved by an 80% price cut on an unchanged model).
- Per-token price collapse (~36x/year at constant quality) coexisting with the flagship price RISING 4x — contradictory curves that must sit together.
- China vs US: identical model (Kimi K3) priced at a US rate before its weights shipped, then cheap once hosts competed — a near-controlled experiment.
- The payback climax: cumulative capex (~$1T+ built up in vintage bands) racing a cumulative-revenue-needed line, forecast to 2030 with a widening uncertainty cone, plus a bear/base/bull DCF spread.
- A superforecaster panel: several independent estimates per question — the DISAGREEMENT between them is signal, shown as scattered markers, not a single number.

THE HUB: this P1 pass also sets the repo-wide design system AND the landing hub. The hub is a living research TREE: two podcasts (Stratechery, Acquired) feed two projects (P1 economics, P2 ad market), which feed a synthesis (P3). Built to grow new branches over time. A visitor should see the whole tree, then dive into a self-contained scrollytelling essay and return.

THE HOUSE STYLE (hard constraints, non-negotiable):
- Unit visualization with OBJECT CONSTANCY: individual data units are persistent particles that MORPH across scroll-driven scene transitions (the same particle that was a dollar of capex becomes a dollar of revenue). Reference works by this author: github.com/lyndonkl/fifaworldcup2026 (WebGL particle field + D3 overlays, scrollytelling, static site) and github.com/lyndonkl/iplprogress (three.js particle field of 316k cricket deliveries morphing across statistical dimensions).
- Stack: vanilla JS + D3, Canvas/WebGL where particle counts demand it. Static site on GitHub Pages. No heavy framework.
- All prose passes readability gates (grade <=10). The design must let plain, short sentences carry serious ideas.
- Research-as-media, NOT an academic paper. "A new form of art combined with media consumption."

Data scale note: unlike the 316k-unit cricket project, P1's units are in the thousands (dollars-in-billions, years, forecast samples, tokens-per-task) — so particle counts are moderate; craft matters more than raw scale.`

const SCHEMA = {
  type: 'object',
  required: ['philosophy', 'one_line_pitch', 'palette', 'type', 'motion', 'unit_metaphor', 'hub_concept', 'signature_interaction', 'p1_scene_beats', 'why_not_generic', 'risks'],
  properties: {
    philosophy: { type: 'string' },
    one_line_pitch: { type: 'string' },
    palette: { type: 'array', items: { type: 'object', required: ['name', 'hex', 'role'], properties: { name: { type: 'string' }, hex: { type: 'string' }, role: { type: 'string' } } } },
    type: { type: 'object', required: ['display', 'body', 'mono', 'rationale'], properties: { display: { type: 'string' }, body: { type: 'string' }, mono: { type: 'string' }, rationale: { type: 'string' } } },
    motion: { type: 'string' },
    unit_metaphor: { type: 'string' },
    hub_concept: { type: 'string' },
    signature_interaction: { type: 'string' },
    p1_scene_beats: { type: 'array', items: { type: 'string' } },
    why_not_generic: { type: 'string' },
    risks: { type: 'string' },
  },
}

const VARIANTS = [
  { key: 'instrument', brief: 'PHILOSOPHY: "The Instrument." Research as a precision measuring device — austere, data-forward, the confidence interval as the hero mark. Think a Bloomberg terminal crossed with a scientific instrument, but warm enough to read for pleasure. Restraint is the aesthetic. Particles are exact data points that snap to measured positions; motion is deliberate and eased, never decorative. The uncertainty band is the emotional core — you FEEL how much we do not know.' },
  { key: 'editorial', brief: 'PHILOSOPHY: "The Essay." Magazine-grade editorial — a serious long-read that happens to breathe and move. Big confident typography carries the narrative; visualizations are set like full-bleed plates in a print feature. Particles are atmospheric until a scroll beat crystallizes them into a chart, then dissolve back. Think The Pudding meets a Stratechery essay meets a beautifully-set book. Emotion through pacing and typographic drama.' },
  { key: 'flow', brief: 'PHILOSOPHY: "The Flow System." The AI economy AS a system diagram brought to life — money and tokens as particles flowing through a value chain (Nvidia -> clouds -> labs -> users), pooling where margin is captured, draining where it is competed away. Object constancy is literal: a dollar-particle enters as capex and you follow it until it becomes revenue or evaporates. Blueprint/schematic aesthetic, engineering-drawing precision, animated flows.' },
  { key: 'ledger', brief: 'PHILOSOPHY: "The Reckoning." A tension-forward, almost cinematic take built around the central bet — a trillion dollars going in against an uncertain return. High-contrast, dramatic, a sense of stakes and scale. The payback race is the spine the whole experience builds toward. Particles accumulate into looming masses of capital that either get earned back or written down. Emotion through scale, contrast, and consequence — without tipping into doom or hype.' },
]

phase('Explore')
log('Four architects exploring divergent directions for the system, hub, and P1 experience')

const proposals = await parallel(VARIANTS.map(V => () =>
  agent(`You are a cognitive-design-architect. Propose a distinctive, subject-specific visual direction for this research experience. Ground every choice in the subject's own world (AI economics, uncertainty, capital, cost curves) and in cognitive-design principles (visual encoding hierarchy, preattentive features, cognitive load, honest framing of uncertainty).

${NARRATIVE}

YOUR ASSIGNED DIRECTION: ${V.brief}

Commit fully to your assigned philosophy — do not hedge toward the others; we WANT four genuinely different directions to choose between. Give concrete, buildable specifics: a named palette of 5-6 hexes with roles (and it must work in light AND dark), a real type pairing (display/body/mono) with rationale — avoid the AI-generic defaults (Inter, Space Grotesk, warm-cream-plus-serif, purple-blue gradients), a motion language, the precise unit_metaphor (what one particle IS and how object constancy carries it across at least two named scene transitions), the hub tree concept, the ONE signature interaction that teaches the thesis, and 5-7 scene beats for the P1 scroll. In why_not_generic, name what a lazy designer would do here and how you deliberately avoid it. Do NOT web-search; reason from the brief. Today is ${args.today}.`,
    { label: 'arch:' + V.key, phase: 'Explore', schema: SCHEMA, agentType: 'cognitive-design-architect' })
)).then(a => a.filter(Boolean))

log('Architects returned: ' + proposals.map(p => p.philosophy.split('.')[0]).join(' | '))
return { proposals }
