#!/usr/bin/env python3.12
"""
layers.py — turn adjudicated parents into :L{layer} meta nodes (layer-parametric; L1 and L2+).

Runs as the BUILDER role. For each adjudicated parent it creates a :L{layer} node whose
uid = keys.parent_id(layer, sorted child uids) — content-addressed, idempotent — and links it to its
:L{layer-1} children with (:L{layer})-[:PARENT_OF {layer}]->(:L{layer-1}). Parenthood is recorded only
on the parent; nothing is ever written back onto a child. Then the SINGLETON SWEEP gives every lone
child its own parent, and the fail-closed invariant asserts every :L{layer-1} node has a parent — else
HALT. Nothing above runs until it passes.
"""
from __future__ import annotations
import glob, json, os
import keys
import corpus_hash
from connection import DB, get_driver

_CLAIMY = "o STARTS WITH 'e' OR o STARTS WITH 'ds-' OR o STARTS WITH 'mech' OR o STARTS WITH 'tu:'"


def _grain(g): return g if g in ("Entity", "Measurement") else "Entity"


def default_parent_dir(layer):
    return os.path.join(corpus_hash.FROZEN_ROOT.replace("p2-ad-market", "p2-ad-market-v2"),
                        f"l{layer}", "parents")


def create_model_parent(s, P, layer=1):
    child_uids = P["child_uids"]
    puid = keys.parent_id(layer, child_uids)
    g = _grain(P["grain"])
    s.run(f"MERGE (p:Node {{uid:$puid}}) SET p:L{layer}, p:{g}, p.name=$name, p.type=$type, "
          f"p.grain=$g, p.layer={layer}, p.method='model', p.reason=$reason, p.member_count=$n",
          puid=puid, name=P["name"], type=P["type"], g=g, reason=P.get("reason", ""), n=len(child_uids))
    s.run(f"MATCH (p:Node {{uid:$puid}}) UNWIND $kids AS cu MATCH (c:L{layer-1} {{uid:cu}}) "
          f"MERGE (p)-[:PARENT_OF {{layer:{layer}}}]->(c)", puid=puid, kids=child_uids)
    return puid


def rollup(s, puid, layer=1):
    if layer == 1:                       # children are L0 — claim ids are their origins
        s.run(f"MATCH (p {{uid:$puid}})-[:PARENT_OF]->(c:L0) WITH p, collect(DISTINCT c.origin) AS os "
              f"SET p.origins=os, p.claim_ids=[o IN os WHERE {_CLAIMY}]", puid=puid)
    else:                                # children already carry claim_ids — union them
        s.run("MATCH (p {uid:$puid})-[:PARENT_OF]->(c) UNWIND coalesce(c.claim_ids,[]) AS ci "
              "WITH p, collect(DISTINCT ci) AS cids SET p.claim_ids=cids", puid=puid)


def singleton_sweep(s, layer=1):
    orphans = [r["uid"] for r in s.run(
        f"MATCH (n:L{layer-1}) WHERE NOT (n)<-[:PARENT_OF]-(:L{layer}) RETURN n.uid AS uid")]
    for uid in orphans:
        r = s.run(f"MATCH (n:L{layer-1} {{uid:$u}}) RETURN n.name AS name, n.type AS type, labels(n) AS labels",
                  u=uid).single()
        g = "Measurement" if "Measurement" in r["labels"] else "Entity"
        puid = keys.parent_id(layer, [uid])
        s.run(f"MERGE (p:Node {{uid:$puid}}) SET p:L{layer}, p:{g}, p.name=$name, p.type=$type, "
              f"p.grain=$g, p.layer={layer}, p.method='singleton', p.member_count=1",
              puid=puid, name=r["name"], type=r["type"], g=g)
        s.run(f"MATCH (p:Node {{uid:$puid}}),(c:L{layer-1} {{uid:$u}}) "
              f"MERGE (p)-[:PARENT_OF {{layer:{layer}}}]->(c)", puid=puid, u=uid)
        rollup(s, puid, layer)
    return len(orphans)


def run(parent_files=None, layer=1):
    corpus_hash.assert_frozen(f"l{layer}-layers start")
    files = parent_files if parent_files is not None else sorted(glob.glob(os.path.join(default_parent_dir(layer), "*.json")))
    drv = get_driver("builder")
    n_model = 0
    with drv.session(database=DB) as s:
        for f in files:
            for P in json.load(open(f))["parents"]:
                puid = create_model_parent(s, P, layer)
                rollup(s, puid, layer)
                n_model += 1
        n_singleton = singleton_sweep(s, layer)
        orphan = s.run(f"MATCH (n:L{layer-1}) WHERE NOT (n)<-[:PARENT_OF]-(:L{layer}) RETURN count(n)").single()[0]
        if orphan:
            raise SystemExit(f"L{layer} PARENT INVARIANT VIOLATED — {orphan} orphan :L{layer-1} nodes — HALT")
        lk = s.run(f"MATCH (n:L{layer}) RETURN count(n)").single()[0]
        covered = s.run(f"MATCH (n:L{layer-1})<-[:PARENT_OF]-(:L{layer}) RETURN count(DISTINCT n)").single()[0]
    drv.close()
    corpus_hash.assert_frozen(f"l{layer}-layers end")
    return {"layer": layer, "model_parents": n_model, "singleton_parents": n_singleton,
            f"l{layer}_nodes": lk, f"l{layer-1}_covered": covered}


if __name__ == "__main__":
    import sys
    lay = int(sys.argv[sys.argv.index("--layer")+1]) if "--layer" in sys.argv else 1
    print(run(layer=lay))
