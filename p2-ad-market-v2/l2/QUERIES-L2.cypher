:use admarket
MATCH (n) RETURN n.layer, count(n);                                          // L0 8619 · L1 4783 · L2 2277
MATCH (p:L2) RETURN p.name, p.grain, p.member_count ORDER BY p.member_count DESC LIMIT 60;
// climb the whole ladder: an L2 kind -> its L1 meta nodes -> L0 sourced children
MATCH (k:L2)-[:PARENT_OF]->(m:L1)-[:PARENT_OF]->(c:L0)
WHERE k.name CONTAINS 'search advertising platform' RETURN k.name, m.name, c.name LIMIT 40;
MATCH (p:L2)-[e:LIFTED {layer:2}]->(q:L2) RETURN p.name, e.type, e.weight, q.name ORDER BY e.weight DESC LIMIT 40;
