#!/usr/bin/env python3.12
"""
connect_parents.py — relationship track, step 3: wire the meta-graph (arithmetic, no model).

Lifts every L0 edge up to a LIFTED edge between the :L1 meta nodes of its endpoints, typed by the
adjudicated meta-relation and weighted by how many L0 edges land on that (parent, meta, parent) pair.
The cross-product from multi-parent nodes is INTENDED and the weight is NOT normalized — it is the
co-occurrence mass Leiden reads later. Self-loops (both endpoints under one parent) are skipped for the
lifted graph. Runs as BUILDER (writes :L1 LIFTED edges; never touches :L0). Idempotent per weight.
"""
from __future__ import annotations
import glob, json, os
from collections import defaultdict
from neo4j import GraphDatabase
import corpus_hash
from connection import DB, URI, get_driver

RELPARENTS = os.path.join(corpus_hash.FROZEN_ROOT.replace("p2-ad-market", "p2-ad-market-v2"),
                          "l1", "rel_parents")


def load_mapping() -> dict:
    m = {}
    for f in glob.glob(os.path.join(RELPARENTS, "*.json")):
        for meta, raws in json.load(open(f))["meta_relations"].items():
            for rt in raws:
                m[rt] = meta
    return m


def run(layer=1):
    """Lift L0 edges DIRECTLY to the :L{layer} ancestor pairs (does not compound across layers)."""
    corpus_hash.assert_frozen(f"l{layer}-connect start")
    mapping = load_mapping()
    hops = f"*{layer}..{layer}"
    drv = get_driver("builder")
    with drv.session(database=DB) as s:
        s.run(
            "MATCH (u:L0)-[r]->(v:L0) WHERE r.raw_type IS NOT NULL "
            f"MATCH (u)<-[:PARENT_OF{hops}]-(p:L{layer}), (v)<-[:PARENT_OF{hops}]-(q:L{layer}) WHERE p<>q "
            "WITH p, q, $mapping[r.raw_type] AS meta, count(*) AS w WHERE meta IS NOT NULL "
            f"MERGE (p)-[e:LIFTED {{type:meta, layer:{layer}}}]->(q) SET e.weight=w",
            mapping=mapping)
        for typ in ("OF_MEDIUM", "OF_MONEY_TYPE"):
            s.run(
                f"MATCH (u:L0)-[r:{typ}]->(v:L0) "
                f"MATCH (u)<-[:PARENT_OF{hops}]-(p:L{layer}), (v)<-[:PARENT_OF{hops}]-(q:L{layer}) WHERE p<>q "
                "WITH p, q, count(*) AS w "
                f"MERGE (p)-[e:LIFTED {{type:'{typ}', layer:{layer}}}]->(q) SET e.weight=w")
        lifted = s.run(f"MATCH (:L{layer})-[e:LIFTED {{layer:{layer}}}]->(:L{layer}) RETURN count(e)").single()[0]
        wtot = s.run(f"MATCH (:L{layer})-[e:LIFTED {{layer:{layer}}}]->(:L{layer}) RETURN sum(e.weight)").single()[0]
        mtypes = s.run(f"MATCH (:L{layer})-[e:LIFTED {{layer:{layer}}}]->(:L{layer}) RETURN count(DISTINCT e.type)").single()[0]
    drv.close()
    a = GraphDatabase.driver(URI, auth=("neo4j", "12345678"))
    with a.session(database=DB) as s:
        s.run("CALL gds.graph.drop('lyg', false) YIELD graphName").consume()
        s.run(f"CALL gds.graph.project('lyg', 'L{layer}', {{LIFTED:{{orientation:'UNDIRECTED'}}}})").consume()
        comps = s.run("CALL gds.wcc.stats('lyg') YIELD componentCount RETURN componentCount").single()[0]
        s.run("CALL gds.graph.drop('lyg', false) YIELD graphName").consume()
    a.close()
    corpus_hash.assert_frozen(f"l{layer}-connect end")
    return {"layer": layer, "lifted_edges": lifted, "total_weight": wtot,
            "meta_relation_types": mtypes, "weakly_connected_components": comps}


if __name__ == "__main__":
    import sys
    lay = int(sys.argv[sys.argv.index("--layer")+1]) if "--layer" in sys.argv else 1
    print(run(layer=lay))
