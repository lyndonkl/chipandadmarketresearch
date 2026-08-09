# Query pack — discovery session over the ad-market knowledge graph

## The mission

**Explore, don't write.** This is a DISCOVERY session. Mine the graph for the surprising, the
opposed, the quantified, the cross-era — the threads a narrative could be built on. Produce grounded
discovery notes, not an article. The point is to find what's *interesting and true* in this data.

## Hard rules — do not break these

1. **The graph is the only world you may explore.** Everything you assert traces to a node `uid`
   and/or a claim id in this graph. No web, no outside knowledge, no invention. A fact without a
   graph/claim citation is a failure.
2. **Navigate top-down.** Start at the L3 themes (the top). Drill down `L3 → L2 → L1 → L0` to the
   sourced claim. Never assert a high-level pattern you have not walked down to a real claim.
3. **Ground every finding.** For each discovery, cite the theme/kind/node and the claim id(s), and
   pull the real statement with `claim.py`. Preserve the claim's hedge, grade, and interval — never
   harden "was associated with" into "caused".

## The ladder

`L3` 141 named themes → `L2` 2,277 kinds → `L1` 4,783 identity meta-nodes → `L0` 8,619 sourced claims.
`PARENT_OF` edges go parent→child (down); `LIFTED {layer}` edges connect nodes *within* a layer (the
meta-graph). Node props: `name`, `type`, `grain` (Entity/Measurement/Dimension), `member_count`,
`summary` (themes), `layer`, and on L0: `origin` (claim id), `clause`, and for measurements `central`,
`value`, `year`, `unit`, `grade`.

## Tools

- `python3.12 discovery/q.py "<CYPHER>"` — run any read-only Cypher; prints one JSON row per line.
- `python3.12 discovery/claim.py <claim_id>` — the full sourced statement + grade + sources for a claim.
- `discovery/L3-themes.md` — the 141 themes, largest first (your entry point).

## Navigation & discovery queries (copy, adapt the names)

**See the top, pick a thread**
```
q.py "MATCH (t:L3) RETURN t.name, t.type, t.member_count ORDER BY t.member_count DESC"
```
**Drill a theme into its kinds, then meta-nodes**
```
q.py "MATCH (t:L3 {name:'Ad Market Pricing & Measurement'})-[:PARENT_OF]->(k:L2) RETURN k.name, k.grain, k.member_count ORDER BY k.member_count DESC"
q.py "MATCH (t:L3 {name:'...'})-[:PARENT_OF]->(:L2)-[:PARENT_OF]->(m:L1) RETURN DISTINCT m.name, m.grain LIMIT 60"
```
**Walk all the way down to sourced claims under a theme**
```
q.py "MATCH (t:L3 {name:'...'})-[:PARENT_OF*3]->(c:L0) RETURN DISTINCT c.origin AS claim, c.name, c.clause LIMIT 80"
claim.py e5-scale-004
```
**Find OPPOSITIONS and corrective claims (the spine of many stories)** — L0 wired exclusions/contrasts as edges
```
q.py "MATCH (a:L0)-[r]->(b:L0) WHERE type(r) IN ['EXCLUDES','NOT_CAUSED_BY','CONFLICTS_WITH','NOT_SAME_AS','DID_NOT_CONTRIBUTE','RECONCILED_WITH'] RETURN a.name, type(r), b.name, r.origin LIMIT 60"
```
**Find QUANTIFIED SHIFTS — a measure that moves across years** (drill an L1 measure to its yearly children)
```
q.py "MATCH (m:L1:Measurement {name:'Newspaper national-brand advertising spend'})-[:PARENT_OF]->(c:L0) RETURN c.year, c.value, c.source_series ORDER BY c.year"
q.py "MATCH (c:L0:Measurement) WHERE c.central IS NOT NULL RETURN c.origin, c.name, c.central, c.claim_unit, c.about_year, c.grade LIMIT 60"
```
**Find the HUBS — the most-connected meta-nodes (the load-bearing actors/measures)**
```
q.py "MATCH (n:L1)-[e:LIFTED {layer:1}]-(:L1) RETURN n.name, n.grain, count(e) AS degree ORDER BY degree DESC LIMIT 30"
```
**Trace a specific ENTITY across the corpus** (its identity meta-node, then what it connects to)
```
q.py "MATCH (n:L1 {name:'Google'})-[e:LIFTED {layer:1}]->(m:L1) RETURN e.type, m.name ORDER BY e.weight DESC LIMIT 40"
q.py "MATCH (n:L1 {name:'Google'})-[:PARENT_OF]->(c:L0) RETURN c.origin, c.clause LIMIT 40"
```
**See how two themes relate** (meta-edges between kinds of two themes)
```
q.py "MATCH (a:L2)-[e:LIFTED {layer:2}]->(b:L2) RETURN a.name, e.type, b.name, e.weight ORDER BY e.weight DESC LIMIT 50"
```

## Grounding discipline (what a good discovery note looks like)

Every note is: **a claimed pattern → the graph path that surfaced it → the claim id(s) → the real
statement (via `claim.py`) with its grade/interval preserved.** If you cannot walk it down to a claim,
it is a hypothesis to test, not a finding — mark it so and go query it.
