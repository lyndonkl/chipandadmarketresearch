#!/usr/bin/env python3.12
"""
leiden.py — L3+: community detection on the weighted meta-graph, gpt-oss names each community.

Structure comes from Leiden (GDS), not the model. For layer L: project the L{L-1} nodes + their
LIFTED{layer:L-1} weighted edges, run gds.leiden with a FIXED seed and concurrency 1 (determinism is
mandatory — the gate binds approval to a content hash). Every L{L-1} node lands in exactly one
community, so the every-node-has-a-parent invariant is automatic. Each community becomes an :L{L} node
(uid = keys.community_id, content-addressed on its members); gpt-oss gives it a name/type/summary
(advisory, excluded from the content hash). Runs writes as builder; GDS analysis as admin (read-only).
"""
from __future__ import annotations
import json, sys, time, urllib.request
from collections import defaultdict
from neo4j import GraphDatabase
import keys, corpus_hash
from connection import DB, URI, get_driver

SEED = 42
MODEL = "gpt-oss:120b"
NAME_PROMPT = open(__file__.rsplit("/", 1)[0] + "/leiden_name_prompt.txt").read()


def leiden_communities(child_layer):
    a = GraphDatabase.driver(URI, auth=("neo4j", "12345678"))
    with a.session(database=DB) as s:
        s.run("CALL gds.graph.drop('leid', false) YIELD graphName").consume()
        s.run(f"CALL gds.graph.project('leid','L{child_layer}',"
              "{LIFTED:{orientation:'UNDIRECTED', properties:'weight'}})").consume()
        rows = s.run(f"CALL gds.leiden.stream('leid',{{relationshipWeightProperty:'weight',"
                     f"randomSeed:{SEED},concurrency:1}}) YIELD nodeId, communityId "
                     "RETURN gds.util.asNode(nodeId).uid AS uid, communityId AS c").data()
        s.run("CALL gds.graph.drop('leid', false) YIELD graphName").consume()
    a.close()
    comm = defaultdict(list)
    for r in rows:
        comm[r["c"]].append(r["uid"])
    return comm


def name_community(members):
    ml = "\n".join(f"{m['name']} | {m['kind']}" for m in members[:50])
    body = json.dumps({"model": MODEL, "prompt": NAME_PROMPT.replace("{MEMBERS}", ml), "stream": False,
                       "keep_alive": "30m", "options": {"temperature": 0.2, "num_ctx": 16384}}).encode()
    req = urllib.request.Request("http://localhost:11434/api/generate", data=body,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        raw = json.load(r).get("response", "") or ""
    d = {}
    for ln in raw.splitlines():
        if "|" in ln:
            k, v = ln.split("|", 1)
            if k.strip() in ("NAME", "TYPE", "SUMMARY"):
                d[k.strip()] = v.strip()
    return d


def run(layer=3):
    corpus_hash.assert_frozen(f"l{layer}-leiden start")
    cl = layer - 1
    comm = leiden_communities(cl)
    drv = get_driver("builder")
    with drv.session(database=DB) as s:
        info = {r["uid"]: r for r in s.run(
            f"MATCH (n:L{cl}) RETURN n.uid AS uid, n.name AS name, n.type AS type").data()}
    n_named = 0
    t0 = time.time()
    with drv.session(database=DB) as s:
        for i, (cid, uids) in enumerate(comm.items(), 1):
            if len(uids) >= 2:
                nm = name_community([{"name": info[u]["name"], "kind": info[u]["type"]} for u in uids])
                name = nm.get("NAME") or f"community {cid}"
                typ, summ, method = nm.get("TYPE", "theme"), nm.get("SUMMARY", ""), "leiden"
                n_named += 1
            else:
                name, typ, summ, method = info[uids[0]]["name"], info[uids[0]]["type"], "", "leiden-singleton"
            puid = keys.community_id(layer, uids)
            s.run(f"MERGE (p:Node {{uid:$puid}}) SET p:L{layer}, p.name=$name, p.type=$type, "
                  f"p.summary=$summ, p.layer={layer}, p.method=$method, p.member_count=$n",
                  puid=puid, name=name, type=typ, summ=summ, method=method, n=len(uids))
            s.run(f"MATCH (p:Node {{uid:$puid}}) UNWIND $kids AS cu MATCH (c:L{cl} {{uid:cu}}) "
                  f"MERGE (p)-[:PARENT_OF {{layer:{layer}}}]->(c)", puid=puid, kids=uids)
            s.run("MATCH (p {uid:$puid})-[:PARENT_OF]->(c) UNWIND coalesce(c.claim_ids,[]) AS ci "
                  "WITH p, collect(DISTINCT ci) AS cids SET p.claim_ids=cids", puid=puid)
            if n_named and n_named % 20 == 0 and len(uids) >= 2:
                print(f"  named {n_named} communities · {(time.time()-t0)/max(n_named,1):.0f}s each", flush=True)
        orphan = s.run(f"MATCH (n:L{cl}) WHERE NOT (n)<-[:PARENT_OF]-(:L{layer}) RETURN count(n)").single()[0]
        if orphan:
            raise SystemExit(f"L{layer} INVARIANT VIOLATED — {orphan} orphan :L{cl} nodes — HALT")
        lk = s.run(f"MATCH (n:L{layer}) RETURN count(n)").single()[0]
        nsing = s.run(f"MATCH (n:L{layer}) WHERE n.member_count=1 RETURN count(n)").single()[0]
    drv.close()
    corpus_hash.assert_frozen(f"l{layer}-leiden end")
    return {"layer": layer, "communities": len(comm), "multi_named": n_named, "singletons": nsing,
            f"l{layer}_nodes": lk, "seed": SEED}


if __name__ == "__main__":
    lay = int(sys.argv[sys.argv.index("--layer")+1]) if "--layer" in sys.argv else 3
    print(run(layer=lay))
