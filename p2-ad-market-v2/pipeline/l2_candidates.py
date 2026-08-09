#!/usr/bin/env python3.12
"""
l2_candidates.py — L2 step 2: cluster the L1 meta nodes into KIND candidate piles.

Per-grain k-means over l2_embedding (Entity-parents and Measurement-parents never share a pile — a
free guard so a medium-kind can't fuse with a measurement-kind). Clustering only suggests; gpt-oss
decides the kinds. Read-only: writes L2 group files. GDS runs as admin (analysis, no graph writes).
"""
from __future__ import annotations
import json, os, shutil
from collections import defaultdict, Counter
from neo4j import GraphDatabase
import keys, corpus_hash
from connection import DB, URI

ADMIN = ("neo4j", "12345678")
OUTDIR = os.path.join(corpus_hash.FROZEN_ROOT.replace("p2-ad-market", "p2-ad-market-v2"), "l2", "groups")
K = 120


def run(k=K):
    corpus_hash.assert_frozen("l2-candidates")
    if os.path.isdir(OUTDIR):
        shutil.rmtree(OUTDIR)
    os.makedirs(OUTDIR)
    drv = GraphDatabase.driver(URI, auth=ADMIN)
    with drv.session(database=DB) as s:
        hist = defaultdict(list)
        for r in s.run("MATCH (p:L1)-[:PARENT_OF]->(c) RETURN p.uid AS u, c.type AS t"):
            if r["t"]:
                hist[r["u"]].append(r["t"])
        info = {r["uid"]: r for r in s.run(
            "MATCH (p:L1) RETURN p.uid AS uid, p.name AS name, p.type AS type, p.grain AS grain").data()}
        s.run("CALL gds.graph.drop('l2c', false) YIELD graphName").consume()
        s.run("CALL gds.graph.project('l2c','L1',{PARENT_OF:{orientation:'NATURAL'}},{nodeProperties:['l2_embedding']})").consume()
        km = {r["u"]: r["c"] for r in s.run(
            "CALL gds.kmeans.stream('l2c',{nodeProperty:'l2_embedding',k:$k,randomSeed:1,maxIterations:20}) "
            "YIELD nodeId, communityId RETURN gds.util.asNode(nodeId).uid AS u, communityId AS c", k=k)}
        s.run("CALL gds.graph.drop('l2c', false) YIELD graphName").consume()
    drv.close()
    piles = defaultdict(list)
    for u, c in km.items():
        piles[(c, info[u]["grain"])].append(u)
    n = in_p = 0
    sizes = []
    for (c, grain), uids in piles.items():
        if len(uids) < 2:
            continue
        members = [{"idx": i+1, "uid": u, "name": info[u]["name"], "type": info[u]["type"],
                    "grain": info[u]["grain"],
                    "hist": ", ".join(t for t, _ in Counter(hist.get(u, [])).most_common(6))}
                   for i, u in enumerate(uids)]
        pid = keys.parent_id(2, uids)
        json.dump({"group_id": pid, "n": len(uids), "members": members},
                  open(os.path.join(OUTDIR, pid.replace("|", "_") + ".json"), "w"), indent=1)
        n += 1; in_p += len(uids); sizes.append(len(uids))
    sizes.sort(reverse=True)
    total = len(info)
    print(f"k={k}; L2 piles: {n} covering {in_p} L1 nodes; {total-in_p} lone -> singleton sweep")
    print(f"pile sizes: max {sizes[0]}, >60: {sum(1 for x in sizes if x>60)}, median {sizes[len(sizes)//2]}")
    return {"piles": n, "in_piles": in_p, "singletons": total - in_p}


if __name__ == "__main__":
    print(run())
