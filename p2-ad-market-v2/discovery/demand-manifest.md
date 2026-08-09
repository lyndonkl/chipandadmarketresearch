# DEMAND MANIFEST — handoff to the scene writer (scenewright)

A stranger who has seen none of the prior conversation must be able to execute this. Everything you inherit
is named below by absolute path.

## What you are building

Prose for a long-form explanatory piece on **the history of the US advertising market**, built strictly on a
frozen, fully-sourced knowledge graph. The macro architecture is fixed and validated. You write the micro
(the prose); you do not change the structure, the spine, the claims, or their epistemic strength.

## Inputs (absolute paths)

- **The contract (authoritative):** `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/p2-ad-market-v2/discovery/architecture.json`
- **Human-readable architecture:** `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/p2-ad-market-v2/discovery/ARCHITECTURE.md`
- **Evidence ledger (grades, hedges, DEAD, omissions):** `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/p2-ad-market-v2/discovery/evidence-ledger.json`
- **Ground truth — the sourced claims:** `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/p2-ad-market/data/claims.json` and `/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/p2-ad-market/data/eras/era-*.json`
- **Graph tools (Bash):** `python3.12 /Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/p2-ad-market-v2/discovery/q.py "<CYPHER>"` and `python3.12 /Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/p2-ad-market-v2/discovery/claim.py <claim_id>`
- **Discovery dossiers (context, SECONDARY — never a citation):** `.../discovery/DISCOVERY-DOSSIER.md`, `.../discovery/DISCOVERY-DOSSIER-S2.md`, and `.../discovery/notes/`

## Scope — the beats you write (by slot id, in spiral order)

`s0` opener → `s1` origin/disclosed price → `s2` origin/third-party count → `s3` reversion to vendor →
`s4` the stack → `s5` commission myth-buster → `s6` instrument-not-audience → `s7` buyer's meter →
`s8` front door → `s9` the dial → `s10` governed price → `s11` state moves the stack → `s12` unit born
un-audited → `s13` denominator war → `s14` closer. Each slot's scene(s) `sc*`, construction fields,
representativeness, carrier and provenance are in `architecture.json`.

## Out of scope (do not do these)

- **Do not fill the ABSENT slots** (`s-PI`, `s-RES`, `s-OPP`, `s-BAT`, `s-AYER`, `s-SUB`). Their absence is
  the finding. Where the spine passes them, **name the absence in the body** (e.g. "no source records a
  single moment the whole market saw this"). Never invent to fill them.
- **Do not add claims** not already cited in a slot's `evidence[]` or a scene's `provenance[]`. If a beat
  needs a fact it does not have, emit an **escalation object** (see return shape), do not source it yourself
  beyond confirming an existing cited claim with `claim.py`.
- **Do not change the spine or structure.** A structural defect is an escalation with `layer: "architecture"`.
- **Do not invent sensory detail.** This is a documentary corpus; nobody wrote down the room, the light, the
  gesture. The ceiling is documentary tableau / telling detail / exhibit. No last-spot-on-Carson, no clerk at
  a mail bench, no glow of a monitor.

## Style contract (non-negotiable)

1. **Preserve epistemic strength per claim.** Grades A/B/C, "alleged," "reported," "run rate," CI intervals
   travel verbatim. Never harden "was associated with" to "caused," a grade-C vendor panel to a fact, or a
   growth rate to a count. Causal tiers in the contract are binding: only `L1` slots (`s6`, `s10`) may assert
   a documented mechanism; `L4`/`L5` slots (`s0`, `s12`, `s13`, `s14`) are synthesis and may not be written
   as though the corpus states them.
2. **`tu:era:*` numbers are SECONDARY.** Re-pull the backing `e#-` claim with `claim.py` before any such
   number reaches prose.
3. **The DEAD column reaches the reader.** Every CONTRADICTED entry (see contract) ships as a corrective.
   "AI Overviews cut the click" ships as **CONTESTED**, both values, Google's dispute named — never hardened.
4. **The 5-cent bid is dead.** Write the two-doors contrast (`s8`/`s10`) without it.
5. **Two guards travel with any number that crosses them:** the basis guard (every share names its rail in
   the axis label, not the footnote; the Coen↔MAGNA splice is non-commensurable; the biggest uncounted thing
   is direct mail) and the read-vs-mailed guard (15.9%-on-read must not be compared to 2%-on-mailed).
6. **Representativeness is already assigned** in the contract; do not reassign it. `sc11c` (DoubleClick deals)
   is **tail**; `sc1` (penny Sun) and the founding audit are **unique**; the openers/closers are labelled.
7. **Never write that anything was verified, fact-checked, or confirmed.** The corpus records provenance, not
   verification.
8. **Named living parties (Google, Meta, Apple, the judges) are surfaced, not adjudicated.** Do not soften
   them into or out of an adversarial slot; the human decides the framing.
9. **Readability gate applies to your prose** (the reader-facing output), not to these planning artifacts:
   Flesch-Kincaid ≤10, Reading Ease ≥50, Gunning Fog ≤12, SMOG ≤12. Split at conjunctions, cut throat-clearing
   openers, un-nominalize — without altering any cited figure or hedge.

## Required return shape

- Prose keyed to slot ids `s0`–`s14`, one component at a time, each drawing only on that slot's cited claims.
- An **escalation array** for any defect you cannot fix at the prose layer, each object:
  `{ "beat_id": "...", "layer": "architecture" | "reporting", "defect": "...", "what_would_resolve_it": "..." }`.
  `layer: "architecture"` = the spine or a slot is wrong (routes back to the architect).
  `layer: "reporting"` = the corpus lacks the material (routes to research). Both are successful outputs;
  neither is permission to invent.
- Do not widen your own scope because "the next section obviously follows."

## Handoff status

`architecture.json` validated: **CONTRACT SATISFIED — 0 errors, 0 warnings** against the handoff-contract
validator. This manifest is the only string you inherit. *No claim has been verified. Human verification
status: none.*
