# L1 → Leiden pipeline design

The design the L1 workflow produced (7 agents: pipeline mechanics, two adjudication-prompt drafts,
upper-layer design, synthesis, adversary, defect review), with the adversary + defect fixes folded
in. This is the build contract for L1, L2, connect-parents, and the Leiden layers. Internal note.

## The cardinal rule (wired through everything)

Clustering only **suggests** candidate piles. `gpt-oss:120b` decides **every** merge. No similarity
threshold ever merges — the same/different embedding gap on this corpus is **negative (−0.075)**.
A CI test forbids any score/threshold constant feeding a merge branch; on empty/malformed model
output the fail-closed default is **split to singletons**, never auto-merge.

## The four-step machine (L1 identity → L2 kind → connect → Leiden)

1. **Embed** each unit's structured serialization (done for L0: qwen3, 4096-dim, `node_embedding`).
   *Layer-isolation invariant:* the index is `FOR (n:Node)`, so L1+ parents embed into **different**
   properties (`emb1`, `l2_embedding`) — never `embedding` — keeping L0 kNN pure and re-runnable.
2. **Candidate generation** (`candidates.py`, reader role) — recall with bounded piles, never a merge:
   - **Name-block** on `keys.norm(name)` with `_`→space, which nails merge-despite-type (google 84×,
     overture 21×, nbc, cbs) *and* deterministically injects the **dimension bridge** (the money-graph
     `direct_mail` / `newspapers` / `coen series` dimension nodes land in their claim twin's block).
   - **Adspend structured block** on `(medium, year, money_type)` across series — the precise proposer
     for same-instance-across-series; it never blocks the decomposition triple together.
   - **Mutual-kNN** over the vector index (rank-based, threshold-free) to catch cross-name identity
     (spend↔expenditure) and pull the newspaper family into one carve-pile, without hub-blobbing.
   - Piles = capped connected components (soft 50 / hard 120; atomic blocks never split); token
     preflight before every call; over-cap piles sub-batched then re-adjudicated so a split identity
     reconverges.
3. **Adjudicate** (`adjudicate.py`, gpt-oss, sequential, `keep_alive`) — one pile per call, pipe
   output `GROUP|gid|name|type|grain|reason` + `MEMBER|gid|idx`. The model addresses members by
   pile-local `idx`; the loader owns idx→uid (no fuzzy name matching, ever).
4. **Parents + singleton sweep** (`layers.py`, builder role). `keys.parent_id(1, child_uids)` is
   content-addressed on the **sorted child set** (idempotent, resume-safe, and what makes the gate
   content-hash reproducible — the model's name is a property, never the key). Parenthood is recorded
   only on the parent and via `(:L1)-[:PARENT_OF]->(:L0)` edges — **never** a write to L0. Then the
   fail-closed invariant: every `:L0` node must have a parent (census = 8,619), else HALT.

**Relationship track** — a first-class sibling (locked decision 5): reify each L0 edge as a `:RelCand`
proxy node kept off `:Node`, embed one 4096-dim string (type | props | both endpoints — never
concatenate vectors), block + mutual-kNN, adjudicate parent relation types. Extend the invariant:
every L0 **relationship** must also resolve to a parent.

**Connect the parents** (`connect_parents.py`, arithmetic, no model): lift each L0 edge to every
(parent-of-u, parent-of-v) pair, `MERGE` and increment `weight = size(child_edges)`. Cross-product
from multi-parent nodes is intended; weight is never normalized. **The payoff to eyeball at the L2
gate:** the weakly-connected-component count should collapse toward 1 — that is the money cloud
fusing to the claims graph through the dimension bridge. If it stays split, the bridge failed → HALT.

**L2** — same machine, one rung looser: group by **kind** not identity (Google+Overture+AOL →
"search advertising platform"), per-grain runs, kind-blob guards (ban "company/thing"; the five
distinct newspaper *measurements* must land in five kinds, not one).

**Leiden (L3+)** — community detection on the L2 weighted graph (fixed seed, recorded), `gpt-oss`
names each community; repeat-aggregate with **exactly two stop rules** (one community, or the
partition stops changing) and **no modularity floor**. Likely 5 layers, possibly 4.

## Gates & RBAC (extended, not re-litigated)

Fail-closed gate after L1, L2, and each Leiden layer: `require_approval(layer, content_hash)` blocks
the next stage in code. The content hash covers **membership + structure only** (parent→children,
grain, lifted-edge signatures) — model-authored names/summaries excluded, so a re-wording never
invalidates a human approval, but any membership change forces re-approval. `:Approval` writable only
by admin/human; builder and loader denied. Builder runs all L1+ writes; it is proven unable to mutate
`:L0` nodes, and a layer-0 relationship count+hash invariant around the phase covers what RBAC cannot
label-scope on relationships.

## Fixes applied to the adjudication prompt (from adversary + defect review)

- **Grain is explicit per member** in the pile — never inferred from an origin prefix. (`ds-*` is a
  *claim* family, not dimensions; real dimensions are `origin:'adspend:dimensions'`.)
- **Node-class pre-partition:** first split the pile into Measurement vs non-Measurement; never open a
  group spanning both. Counter-example: "US newspaper advertising receipts" (Entity) vs "…receipts
  amount" (Measurement) — near-identical names, never merged.
- **Narrowing-modifier rule:** internet/digital/mobile/search/national/local marks a SUBSET and is
  never dissolved as wording. "US advertising spend" ≠ "US internet advertising revenue".
- **Period is identity:** same subject/series/money_type, different YEAR → different instances (even
  when values coincide — 148 recurs in 1935 and 1938 as bait).
- **Subject scope is identity:** newspapers vs newspapers-and-periodicals vs print are different.
- **Count population is identity:** universe vs directory-listed vs represented vs membership counts.
- **Entity referent, not type word:** a plural medium name carrying a "media outlet" type label is
  still the medium; medium vs group vs set vs market are distinct by referent.

## Fixes that live in code, not the prompt

- **Dimension-bridge injection** via the `_`→space name-block (deterministic, above).
- **Completeness:** reconcile emitted `idx` against the exact input set; singleton-parent any drop.
- **parent_id()** added to `keys.py`, keyed on the sorted child-uid set.
- **Pile size cap + token preflight + sub-batch + re-adjudicate.**
- **Fail-closed to singletons** on empty/malformed adjudication; never auto-merge.

## Open knobs (tune at the calibration/gate, none contradict a locked decision)

k=20 mutual-kNN; soft-50/hard-120 pile cap; Leiden reads the L2 weighted graph; content hash excludes
names. All surfaced for confirmation when the adjudication sample is reviewed.
