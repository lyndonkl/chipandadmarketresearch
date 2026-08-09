# L2 gate report

The second rung: the 4,783 L1 meta nodes are grouped by KIND into 2,277 L2 nodes. Immutable from here. Review, then approve Leiden (L3+). Internal note.

## Kinds — 4,783 L1 -> 2277 L2 nodes

- 1532 Entity + 745 Measurement. **499 real kind-groupings** (>1 child); 1778 singletons carried up.
- Biggest kinds: share measurement (111) · advertising medium (102) · advertising spend measurement (101) · count measurement (74) · advertising share measurement (72) · advertising spend measurement (68) · advertising spend measurement (56) · price measurement (51) · advertising spend measurement (50) · revenue measurement (43) · advertiser cohort (42) · temporal dimension (40)

## The L2 meta-graph

- **4399 lifted meta-edges**. **117 components; the giant holds 2087 nodes (92%)** — up from 73% at L1. The ladder is fusing toward one graph, as the design predicts.

## Guarantees

- Every L1 node has an L2 parent (invariant PASSED, 4,783 covered). parent_id content-addressed.
- L2 written by the builder role, proven unable to mutate :L0. Frozen corpus VERIFIED unchanged.

## Next

- On approval: **Leiden (L3+)** — community detection on this weighted meta-graph, gpt-oss names each community, repeat-aggregate to the two stop rules. This is a hard stop until you approve.
