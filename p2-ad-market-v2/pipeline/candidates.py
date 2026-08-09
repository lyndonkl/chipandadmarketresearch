#!/usr/bin/env python3.12
"""
candidates.py — L1 step 2 (abstraction frame): group L0 nodes into candidate piles for adjudication.

The clustering only SUGGESTS which nodes might share a parent meta node. gpt-oss decides. Two sources:

  1. Name-block  — nodes sharing keys.block_key(name) (normalized, '_'->space). Guarantees entity
     co-reference (all "Google") AND, because ad-spend nodes are named "<medium> advertising spend
     (<money_type>)", it groups a whole measure across ALL years and sources into one pile (which is
     exactly the abstraction target — the year and compiler become children). Also does the money->
     claims dimension bridge for free (direct_mail dim <-> "direct mail" claim).
  2. k-means (GDS) — for the unique-name remainder, centroid clustering over the 4096-dim (unit-norm)
     vectors groups differently-worded nodes that share a concept ("local advertising spend" across
     phrasings). No threshold decides anything; k sets granularity and is a calibrated knob.

Each group is split by node class (Measurement vs Entity/Dimension — never one parent across both).
Groups of >=2 are written for adjudication; lone nodes fall to the code singleton sweep at
parent-creation. Read-only: writes group JSON files, never the graph.
"""
from __future__ import annotations
import json, os, shutil
from collections import defaultdict
from neo4j import GraphDatabase
import keys
import corpus_hash
from connection import URI, DB

ADMIN = ("neo4j", "12345678")           # GDS analysis only — candidates.py never writes the graph
OUTDIR = os.path.join(corpus_hash.FROZEN_ROOT.replace("p2-ad-market", "p2-ad-market-v2"),
                      "l1", "groups")
K_MEANS = 700
CENSUS = 8619
SER_KEYS = ["clause", "central", "value", "unit", "claim_unit", "grade", "about_year", "year",
            "medium", "money_type", "source_series", "verdict"]


def grain_of(labels):
    return "Measurement" if "Measurement" in labels else ("Dimension" if "Dimension" in labels else "Entity")


def fetch_nodes(s) -> dict:
    out = {}
    for r in s.run("MATCH (n:L0) RETURN n.uid AS uid, labels(n) AS labels, properties(n) AS p"):
        p = r["p"]
        out[r["uid"]] = {"uid": r["uid"], "name": p.get("name", ""), "type": p.get("type", ""),
                         "grain": grain_of(r["labels"]), "kind": p.get("kind"),
                         "origin": p.get("origin"), "p": p}
    return out


def kmeans_clusters(s, k) -> dict:
    s.run("CALL gds.graph.drop('l1km', false) YIELD graphName").consume()
    s.run("CALL gds.graph.project('l1km','L0','*',{nodeProperties:['embedding']})").consume()
    out = {r["uid"]: r["c"] for r in s.run(
        "CALL gds.kmeans.stream('l1km',{nodeProperty:'embedding',k:$k,randomSeed:1,maxIterations:20}) "
        "YIELD nodeId, communityId RETURN gds.util.asNode(nodeId).uid AS uid, communityId AS c", k=k)}
    s.run("CALL gds.graph.drop('l1km', false) YIELD graphName").consume()
    return out


def serialize_member(idx, n):
    facts = "; ".join(f"{k}={n['p'][k]}" for k in SER_KEYS if n["p"].get(k) not in (None, ""))
    return {"idx": idx, "uid": n["uid"], "name": n["name"], "type": n["type"],
            "grain": n["grain"], "kind": n["kind"], "origin": n["origin"], "facts": facts}


def run(k=K_MEANS):
    corpus_hash.assert_frozen("l1-candidates")
    if os.path.isdir(OUTDIR):
        shutil.rmtree(OUTDIR)
    os.makedirs(OUTDIR)
    drv = GraphDatabase.driver(URI, auth=ADMIN)
    with drv.session(database=DB) as s:
        nodes = fetch_nodes(s)
        assert len(nodes) == CENSUS, f"L0 census {len(nodes)} != {CENSUS} — a grain was filtered out"
        km = kmeans_clusters(s, k)
    drv.close()

    # name-blocks (>=2) win; the unique-name remainder groups by k-means cluster
    by_block = defaultdict(list)
    for uid, n in nodes.items():
        by_block[keys.block_key(n["name"])].append(uid)
    named = {uid: blk for blk, uids in by_block.items() if len(uids) >= 2 for uid in uids}

    groups = defaultdict(list)
    for uid, n in nodes.items():
        gid = f"nb:{named[uid]}" if uid in named else f"km:{km.get(uid, 'x')}"
        groups[gid].append(uid)

    # split each group by node class, write piles of >=2
    n_piles = in_piles = 0
    sizes = []
    for gid, members in groups.items():
        for cls in ("Measurement", "nonMeasurement"):
            grp = [u for u in members
                   if (nodes[u]["grain"] == "Measurement") == (cls == "Measurement")]
            if len(grp) < 2:
                continue
            ser = [serialize_member(i + 1, nodes[u]) for i, u in enumerate(grp)]
            pid = keys.parent_id(1, grp)
            src = "name-block" if gid.startswith("nb:") else "kmeans"
            json.dump({"group_id": pid, "source": src, "seed": gid, "n": len(grp), "members": ser},
                      open(os.path.join(OUTDIR, pid.replace("|", "_") + ".json"), "w"), indent=1)
            n_piles += 1
            in_piles += len(grp)
            sizes.append(len(grp))
    sizes.sort(reverse=True)
    print(f"k-means k={k}; groups written: {n_piles} covering {in_piles} nodes; "
          f"{CENSUS - in_piles} lone nodes -> singleton sweep")
    print(f"pile sizes: max {sizes[0]}, >{40}: {sum(1 for x in sizes if x>40)}, "
          f"median {sizes[len(sizes)//2]}, from name-blocks vs kmeans split at write time")
    return {"piles": n_piles, "in_piles": in_piles, "singletons": CENSUS - in_piles}


if __name__ == "__main__":
    print(run())
