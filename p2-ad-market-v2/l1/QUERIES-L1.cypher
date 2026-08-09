// L1 inspection — RUN FIRST:
:use admarket

// -- the ladder by layer --
MATCH (n) RETURN n.layer, count(n);                                  // 8619 L0 + 4783 L1

// -- browse the meta nodes (largest first) --
MATCH (p:L1) RETURN p.name, p.grain, p.type, p.member_count ORDER BY p.member_count DESC LIMIT 60;

// -- climb DOWN a meta node to its sourced children --
MATCH (p:L1 {name:'Newspaper national-brand advertising spend'})-[:PARENT_OF]->(c)
RETURN c.year, c.value, c.source_series ORDER BY c.year;
MATCH (p:L1 {name:'Google'})-[:PARENT_OF]->(c:L0) RETURN p, c;

// -- the meta-graph (meta nodes + meta-relations) --
MATCH (p:L1)-[e:LIFTED]->(q:L1) RETURN p.name, e.type, e.weight, q.name ORDER BY e.weight DESC LIMIT 50;
MATCH path=(p:L1 {name:'Google'})-[:LIFTED]-(q:L1) RETURN path LIMIT 40;   // one meta node's neighborhood

// -- the meta-relation vocabulary --
MATCH (:L1)-[e:LIFTED]->(:L1) RETURN e.type AS meta_relation, count(*) AS edges, sum(e.weight) AS weight
ORDER BY weight DESC LIMIT 40;
