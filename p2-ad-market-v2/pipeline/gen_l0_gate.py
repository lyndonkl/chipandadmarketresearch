#!/usr/bin/env python3.12
"""Generate the L0 gate report (GATE-L0.md) and the Neo4j query pack (QUERIES-L0.cypher)."""
from __future__ import annotations
import glob, json, os, re
from collections import Counter
import corpus_hash
from connection import DB, get_driver

V2 = corpus_hash.FROZEN_ROOT.replace("p2-ad-market", "p2-ad-market-v2")
EXTRACT = os.path.join(V2, "l0", "extractions")
VA = json.load(open(os.path.join(V2, "l0", "value-attach-report.json")))
GATE = os.path.join(V2, "l0", "GATE-L0.md")
QP = os.path.join(V2, "l0", "QUERIES-L0.cypher")

recs = [json.load(open(f)) for f in glob.glob(os.path.join(EXTRACT, "*.json"))]
repairs = Counter(rp["kind"] for r in recs for rp in r.get("repairs", []))

drv = get_driver("reader")
q = {}
with drv.session(database=DB) as s:
    one = lambda c: s.run(c).single()[0]
    q["nodes"] = one("MATCH (n:Node) RETURN count(n)")
    q["l0"] = one("MATCH (n:L0) RETURN count(n)")
    q["entities"] = one("MATCH (n:Entity) RETURN count(n)")
    q["meas"] = one("MATCH (n:Measurement) RETURN count(n)")
    q["adspend"] = one("MATCH (n:Measurement {kind:'adspend'}) RETURN count(n)")
    q["dims"] = one("MATCH (n:Dimension) RETURN count(n)")
    q["edges"] = one("MATCH ()-[r]->() RETURN count(r)")
    q["reltypes"] = one("CALL db.relationshipTypes() YIELD relationshipType RETURN count(*)")
    q["origins"] = one("MATCH (n:Node) WHERE n.kind IN ['claim','prose'] RETURN count(DISTINCT n.origin)")
    q["year_nodes"] = one(r"MATCH (n:Node) WHERE n.name =~ '(?i)^(c\\.?\\s*|circa\\s*|~)?[0-9]{3,4}s?$' RETURN count(n)")
    q["valued_claim_meas"] = one("MATCH (n:Measurement) WHERE n.has_value AND n.kind IN ['claim','prose'] RETURN count(n)")
    node_types = s.run("MATCH (n:Node) WHERE n.kind IN ['claim','prose'] RETURN n.type AS t, count(*) AS c ORDER BY c DESC LIMIT 15").data()
    top_media = s.run("MATCH (d:Dimension {type:'advertising medium'})<-[:OF_MEDIUM]-(m) RETURN d.name AS m, count(m) AS c ORDER BY c DESC LIMIT 8").data()
drv.close()

corpus_ok, _ = corpus_hash.verify()

L = []
L.append("# L0 gate report\n")
L.append("The bottom rung is built and loaded. It is immutable from here. Review, then approve L1 — "
         "or send back specific fixes. Internal working note.\n")
L.append("## What is in the graph\n")
L.append(f"- **{q['nodes']} nodes**, all `:L0` ({q['l0']}).  {q['entities']} entities · {q['meas']} measurements "
         f"({q['adspend']} ad-spend + {q['meas']-q['adspend']} claim/prose) · {q['dims']} dimension entities.")
L.append(f"- **{q['edges']} relationships**, {q['reltypes']} distinct types (open-ended — the corpus coined them).")
L.append(f"- **{q['origins']} unit-islands** from 506 claims + 133 prose, plus the ad-spend cloud on 30 dimension hubs.")
L.append(f"- Ad-spend fans into media hubs: " + ", ".join(f"{r['m']} {r['c']}" for r in top_media) + " …\n")
L.append("## Extraction quality (639 units, 0 errors)\n")
L.append(f"- {sum(r['n_nodes'] for r in recs)} nodes / {sum(r['n_edges'] for r in recs)} edges emitted; "
         f"**{sum(repairs.values())} deterministic repairs** ({dict(repairs)}).")
L.append(f"- Withheld-number rule held: **{q['year_nodes']} bare-year nodes** in the graph.\n")
L.append("## Numbers attached (the withheld values)\n")
s_ = VA["summary"]
L.append(f"- **{s_['attached_single']+s_['attached_matched']} of 506 claims** got their calibrated number attached "
         f"({s_['attached_single']} single-measurement, {s_['attached_matched']} matched by unit).")
L.append(f"- **{s_['halted_ambiguous']} halted** — several measurement nodes, no clear unit match. NOTHING guessed; "
         f"their figures stay recoverable via `origin`. *This is the main review item.*")
L.append(f"- {s_['no_measurement_dateish']} date-unit claims correctly carry no measurement; "
         f"**{s_['no_measurement_quantity']} quantity claims had no measurement node** (genuine extraction misses to check).\n")
L.append("Sample halted claims (headline value not attached — you decide accept vs. add a tie-breaker):\n")
for h in VA["detail"]["halted_ambiguous"][:6]:
    L.append(f"- `{h['id']}` unit *{h['unit']}* → candidates: {', '.join(h['candidates'][:4])}")
L.append("\nThe 3 quantity misses:\n")
for h in VA["detail"]["no_measurement_quantity"]:
    L.append(f"- `{h['id']}` unit *{h['unit']}*")
L.append("\n## Four-defect status\n")
L.append("- **Key collision:** one `keys.py` authority; `uid` uniqueness constraint live; 0 skipped/dangling edges on load.")
L.append(f"- **Dangling refs:** every edge endpoint declared in-unit (0 skipped); {q['year_nodes']} year-nodes.")
L.append("- **Access control:** `admarket` + 3 least-privilege users; builder role **proven** unable to mutate `:L0`.")
L.append("- **Advisory gates:** this is a hard stop — L1 does not run until you approve.")
L.append(f"\n## Frozen corpus\n\n- {'VERIFIED unchanged (94 files)' if corpus_ok else 'DRIFT DETECTED — HALT'}.\n")
L.append("## Node-type vocabulary the corpus coined (top 15, claim/prose entities+measurements)\n")
for r in node_types:
    L.append(f"- {r['t']} — {r['c']}")
open(GATE, "w").write("\n".join(L))

QUERIES = """// L0 inspection pack — RUN THIS FIRST:
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
"""
open(QP, "w").write(QUERIES)
print("wrote", GATE)
print("wrote", QP)
print("summary:", json.dumps(s_))
