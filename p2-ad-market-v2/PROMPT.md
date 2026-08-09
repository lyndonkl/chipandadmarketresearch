# P2 v2 — build a layered knowledge graph over the frozen ad-market corpus

Single self-contained brief. Everything below was decided or measured in a prior session. Nothing
here needs re-deriving. The previous build was deleted; this is the second attempt.

---

## 1. What to build

A knowledge graph over the frozen 506-claim research corpus about the history of the US
advertising market, arranged as an **abstraction ladder**. The bottom layer holds raw per-claim
detail. Each layer above groups the one below into bigger ideas. A narrative team starts at the
top with a handful of broad concepts, finds one that looks interesting, and walks down until it
reaches the actual sourced claim.

## 2. The layer model — this is the agreed design, build exactly this

### Layer 0 — read every claim, one at a time

`gpt-oss:120b` reads one claim. It names the things that claim is about, and how those things
relate. Then the next claim. 506 of them, **never batched**.

The same for the written parts of the era records: 56 field summaries, 70 event descriptions,
7 boundary notes. That is 639 model calls in total.

The 1,573 numbers in the ad-spend dataset go straight in with **no model at all**. Their fields
are already labelled, so a script reads the file and writes them.

**What you get:** roughly 640 tiny disconnected islands. The Google in claim 12 and the Google in
claim 340 are two unrelated things. Nothing joins them yet. That is expected.

**Layer 0 is never edited.** Not once, ever. Everything above it is added alongside.

### Layer 1 — work out which islands mean the same thing

Every node becomes a string of text — its name, its type, all its properties — and
`qwen3-embedding:8b-q8_0` turns that string into a vector. Cluster those vectors. A cluster is a
rough pile of "these might be the same thing."

Then `gpt-oss:120b` looks at each pile and decides. It might say all 50 Google nodes are one
thing, and name the parent Google. It might say the pile holds two different things and split it.
Anything it will not place gets a parent of its own.

**The clustering only suggests. The model decides.** Similarity was measured on this corpus and
the same/different score gap came back NEGATIVE (−0.075) on same-instance questions. Scores rank
candidates; they never decide. Never merge on a threshold.

Relationships get the identical treatment, separately: embed the relationship, its properties
AND its two nodes, cluster, and the model names parent relation types.

**Every node and every relationship ends up with a parent. No exceptions.** A member the judge
will not place gets a singleton parent. Enforce this in code, not by convention.

### Layer 2 — group by kind instead of by identity

Same machinery, looser grouping. Google, Yahoo and Overture become one parent, something like
"search advertising platform". Relationships group the same way.

Layer 1 answered "which of these are the same thing". Layer 2 answers "which of these are the
same kind of thing".

### Connecting the parents — arithmetic, no model

Take each Layer 0 relationship, from node u to node v. For every parent p of u, and every parent
q of v, create or merge a parent relationship from p to q. Increment its weight. Record the
original relationship as a child.

The cross product from multi-parent nodes is **intended**. Do not split or normalise the weight.
The weight is what Leiden reads at the next stage.

### Layer 3 and up — find the communities

Leiden looks at which nodes are densely connected and cuts the graph into groups. It reads
structure, not meaning. `gpt-oss:120b` then names and summarises each group.

**Repeated aggregation**: cluster, then cluster the clusters. Run again on the result to get
another layer. **Exactly two stopping rules**: stop when it returns one community, or when the
communities stop changing. No modularity floor — an earlier build added one and it could conclude
there was no Layer 3 at all.

Layers 0, 1 and 2 are certain. Above that the corpus is small, so expect one or two more.
Probably five layers, possibly four. The real number is not knowable until it runs.

### Where it lives

Neo4j. Every node records which layer it is on, its parents, its children, and the claim ids
beneath it. From anywhere in the graph you can ask "what does this rest on" and get real sourced
claims back.

## 3. Locked decisions

| | Decision |
|---|---|
| Node grain at L0 | entities **plus reified measurements** — a measurement is a node with its own identity, not an edge property |
| Scope | claims + era prose + the ad-spend series + the audit trail |
| Lattice | a node MAY have more than one parent. Not a tree |
| `layer` | a property on both nodes and relationships, so any single rung can be queried alone |
| Audit trail | rides as **properties** on the provenance chain (grade, verdict, sources, superseded_by). Never first-class nodes. The graph is about the ad market, not about the research |
| Prose unit key | `tu:era:{N}:field:{FIELD}` and the same `tu:era:{N}:...` family for events and boundary notes |
| Ad-spend id | `m:adspend:{series}:{year}:{medium}:{money_type}`, and an absent money_type serialises as **`unsplit`**. `null` and `_` are both rejected |
| Key generation | ONE module owns it. Every other module imports it. Three modules minting three spellings was the single worst defect of the first attempt |
| Gates | the pipeline HALTS after L0, L1, L2 and each Leiden layer. A hard stop in code, not a printed message and not a file flag anyone can `echo` into existence |

## 4. The corpus — verified counts, do not re-derive

`p2-ad-market/` is **FROZEN AND READ-ONLY**. Never write, edit, move or delete anything under it.
Read it freely. All work goes elsewhere.

- `data/claims.json` — **506 claims** (+22 dropped re-citations, ignore). Per claim: id,
  statement, central, unit, ci80[2], grade (A/B/C), sources[{name,url}], as_of, about_year, and
  optional about_span (177), method (129, required at grade C), about_year_note (13), taxonomy
  (12), timeline_ready:false (7), plus origin and verdict.
  Grades A 133 / B 261 / C 112. Verdicts: confirmed 323, adjusted 126, post-verification 53,
  rejected 4.
  **`rejected` means the original assertion was refuted and the record REWRITTEN IN PLACE.** The
  statement now holds corrected content. DO NOT FILTER REJECTED CLAIMS OUT.
- `data/eras/era-1..7.json` — 7 era records. Prose to extract: 56 field summaries (7 eras x 8
  fields), 70 event descriptions, 7 boundary_notes = **133 prose units**.
- `data/adspend.json` — **1,573 points across 8 series**, 1867–2025, USD millions current.
  coen_mce 1197, naa_newspaper 252, iab_pwc 35, bridge_mce_mg8 28, census_manufactures 24,
  irs_soi 19, magna 9, benchmarks_pre1919 9. Every point carries its own calibration object.
  money_type absent on 1,042 of 1,573. bridge_mce_mg8 is CONSTRUCTED, not observed. Era records
  state SCALE in USD **billions** while adspend is USD **millions**.
- `data/verification/verdicts.json` — 489 verdicts + 8 post-R3. `data/moneytype/reconciled.json`
  — money-type reconciliation and the taxonomy seam. `data/mechanism.json` — twin-engine
  analysis, 45 `mech-*` claims.
- `data/FREEZE.md` — **read it**. The freeze contract and four builder traps.

Known: about 20% of claims name no company or person at all. That is the hardest case for an
entity-first design and the extraction prompt must handle it.

## 5. Environment — measured, not assumed

- Apple M3 Max, 96 GB unified memory. The GPU wired limit is unset, so a model is capped near
  72 GB and the human declined to raise it.
- Ollama at `http://localhost:11434`. **Two models, and only two:**
  - `gpt-oss:120b` — 65 GB, 120B params / 5.1B active MoE, reasoning. ALL generation.
  - `qwen3-embedding:8b-q8_0` — 8 GB, output dimension **4096**. ALL embeddings.
  `gpt-oss:120b` **cannot embed** — the server refuses. Only one 65 GB model may be resident at a
  time; use `keep_alive` to avoid a ~400 s cold reload between calls.
- Neo4j Desktop 2, `bolt://localhost:7687`, Enterprise edition, so role-based access control is
  available. The `admarket` database does not exist and must be created.
- Neo4j's vector index ceiling is 4096 dimensions and the embedding model emits exactly 4096.
  **Zero headroom** — nothing may ever be concatenated onto a vector.
- Python 3.12 (the system `python3` is 3.9.6 and too old for `graphrag`). Needs: graphrag,
  igraph, leidenalg, graspologic, scikit-learn, ollama. Already present: neo4j, networkx, numpy,
  pydantic.

## 6. What the previous attempt learned — do not rediscover

**Model choice is settled.** Four local models ran against the same three claims, same prompt.

| Model | Clean | Note |
|---|---|---|
| `gpt-oss:120b` | 3/3 | fastest of the reasoning models — the choice |
| `qwen3:30b-a3b-thinking` | 3/3 | three times slower |
| `glm-4.7-flash` | 2/3 | one dense claim produced 58,000 characters of reasoning, then empty output |
| `qwen3:30b-a3b-instruct` | 1/3 | undeclared nodes, inverse duplicate relationships, years as nodes |

Those last failures were the model, not the prompt. They vanished on a model with room to reason.

**The extraction prompt design that worked:**
- One claim per call, never batched.
- **Open-ended.** No fixed node-type list, no relation vocabulary. The corpus decides what types
  exist.
- **Withhold the verified number from the model.** Give it the unit and the fact year only. It
  cannot invent a figure it was never shown, and the value is attached deterministically
  afterwards. This worked perfectly across every sample.
- Names derived from meaning, never verbatim sentence fragments. A bad→good table from real
  claims teaches this better than a rule.
- A line-based pipe format (`NODE|name|type|clause`, `EDGE|from|TYPE|to|clause`), not JSON —
  local models produce it far more reliably.
- Structured prompt throughout: explicit ROLE, CONTEXT, PROCEDURE. Local models do markedly
  better with it. This applies to the embedding input too: embed a structured serialisation, not
  a bare name.
- Instruct the model to break a long statement into every separate assertion first. Its commonest
  failure is reading a long sentence as one subject-predicate pair and discarding the rest.
- When a claim excludes something ("the display exchange, NOT search"), wire the exclusion as a
  relationship. Leaving it in a description field loses the distinction.

**A deterministic repair beats a retry.** In a real run the gate rejected whole units over single
lines and the retry rate hit 31–43% against a 3% budget. The dominant cause: the parser rejected
any relation type longer than four words, so `RANKED_SECOND_IN_REVENUE_FOR` failed a unit whose
output was otherwise identical to the accepted retry. Prefer repairing in the loader — promote an
undeclared node, drop a relationship pointing at a year, shorten an over-long name — and log every
repair. Reserve retries for genuinely malformed output.

**Four defect classes killed the first build.** Design against them:
1. Primary key collision — several modules minting different ids for the same entity.
2. Dangling references — a stage reading an artifact or node no stage produces.
3. Access control created but never granted — a restricted role existed, no user held it, and the
   pipeline connected as `admin`, so Layer 0 was writable the whole time.
4. Approval gates that were advisory — five of six crossings halted by printing a message or
   testing for a file flag any process could create.

## 7. How to work

- Frozen corpus is read-only. Hash-check it before and after every run.
- All inference on local Ollama. Never a cloud API.
- Show and run the literal artifact. Claimed output that was not produced is a failure.
- Ground every example in a real record, quoting its id. Invented examples are a failure.
- The human gates every layer. Produce a gate report and a Cypher query pack at each halt so they
  can inspect the layer in Neo4j Browser themselves.
- Do not start the extraction, create the database, or load anything without being asked.
