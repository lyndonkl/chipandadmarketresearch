#!/usr/bin/env python3.12
"""
q.py — the ONLY window into the ad-market knowledge graph for the discovery session.

Read-only. Runs any Cypher against the `admarket` graph and prints each row as a JSON line.
    python3.12 q.py "MATCH (t:L3) RETURN t.name, t.member_count ORDER BY t.member_count DESC"

The graph is the frozen, sourced knowledge you are allowed to explore — nothing else. Every L0 node
carries `origin` (a claim id); the full sourced statement, grade and citations for a claim id live in
p2-ad-market/data/claims.json (era prose in p2-ad-market/data/eras/era-*.json). Ground every finding
in a node uid and/or a claim id.
"""
import sys, json
from neo4j import GraphDatabase

if len(sys.argv) < 2:
    sys.exit('usage: q.py "CYPHER"')
drv = GraphDatabase.driver("bolt://localhost:7687", auth=("p2_read", "p2readerPW2026"))
try:
    with drv.session(database="admarket") as s:
        n = 0
        for r in s.run(sys.argv[1]):
            print(json.dumps(r.data(), default=str))
            n += 1
        if n == 0:
            print("(no rows)")
finally:
    drv.close()
