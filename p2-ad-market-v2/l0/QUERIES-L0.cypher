// L0 inspection pack — RUN THIS FIRST:
:use admarket

// -- shape --
MATCH (n:Node) RETURN count(n);                                   // 8619 nodes
MATCH (n) OPTIONAL MATCH (n)-[r]-(m) RETURN n,r,m;                // whole graph (raise render cap first)

// -- one claim island, with the attached number --
MATCH (n:Node {origin:'e1-creators-001'})-[r]-(m) RETURN n,r,m;
MATCH (n:Measurement {origin:'e1-creators-001'})
RETURN n.name, n.central, n.claim_unit, n.grade, n.has_value;

// -- the money graph --
MATCH (d:Dimension {type:'advertising medium'})<-[:OF_MEDIUM]-(m)
RETURN d.name AS medium, count(m) AS points ORDER BY points DESC;
MATCH (m:Measurement {kind:'adspend', medium:'newspapers'})-[r]->(d) RETURN m,r,d;

// -- measurements that DID get a value --
MATCH (n:Measurement) WHERE n.has_value AND n.kind IN ['claim','prose']
RETURN n.origin, n.name, n.central, n.claim_unit, n.grade LIMIT 50;

// -- the review item: claims whose number was NOT attached (multiple measurements) --
//    (see l0/value-attach-report.json for the full list of 157)
MATCH (n:Measurement) WHERE n.kind IN ['claim','prose'] AND n.has_value IS NULL
RETURN n.origin, collect(n.name) AS unattached_measurements ORDER BY n.origin LIMIT 40;

// -- provenance climb-down: any node -> its source unit --
MATCH (n:Node) RETURN n.origin, n.name, n.type, labels(n) LIMIT 100;
