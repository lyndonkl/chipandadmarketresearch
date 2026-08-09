# L1 gate report

The first rung of the abstraction ladder is built: 8,619 immutable L0 nodes now sit under a layer of meta nodes and meta-relations. L1 is immutable from here (RBAC-enforced). Review, then approve L2. Internal note.

## Nodes — 8,619 L0 → 4783 L1 meta nodes

- 3007 Entity + 1776 Measurement. **1158 real groupings** (>1 child); 3625 singletons carried up.
- Biggest meta nodes: Newspaper local-retail advertising spend (134) · Newspaper national-brand advertising spend (134) · Total advertising spend (133) · Google (116) · Newspaper advertising spend (101) · Radio advertising spend (82) · Direct mail advertising spend (78) · Business papers advertising spend (73)
- Every node abstracts over its distinguishing detail (year, source, wording) and keeps it on the children. Climb-down recovers every sourced figure.

## Relationships — 1,938 raw types → 1102 meta-relations

- Biggest: NEGATED_RELATION (41) · TRANSITION (22) · INCREASED (16) · SELL (13) · COMPARE (13) · EXPERIENCED_LOSS (12) · ACQUISITION (12) · MEASURES (12)

## The meta-graph

- **5343 LIFTED meta-edges** between meta nodes, typed by meta-relation, weighted by aggregated L0 edges.
- Heaviest meta-relations: OF_MEDIUM(w1573) · MEASURES(w809) · HAS_SHARE_OF(w539) · OF_MONEY_TYPE(w531) · INCLUDES(w126) · PART_OF(w122) · MEASURED(w114) · EXCLUDE(w102)
- **73% of meta nodes (3,496) form one connected component** — the money cloud fused to the claims graph through the dimension bridge. The periphery connects at higher rungs.

## Four-defect status

- Key collision: `parent_id` content-addressed on the sorted child set; `uid` uniqueness live.
- Dangling refs: every-L0-node-has-a-parent invariant PASSED (8,619 covered); coverage guard per pile.
- Access control: L1 written by the builder role, **proven unable to mutate :L0**.
- Advisory gates: this is a hard stop — L2 does not run until you approve.

## Frozen corpus

- VERIFIED unchanged (94 files).
