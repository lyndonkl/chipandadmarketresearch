#!/usr/bin/env python3.12
"""
Load the CALIBRATION extraction into Neo4j as a throwaway graph for human inspection.

This is NOT the real build. It writes nodes/rels under a single :Cal label into the DEFAULT
database so you can explore what L0 extraction produced in Neo4j Browser, then drop it in one line
(MATCH (n:Cal) DETACH DELETE n). It creates no database, no roles, no constraints — the gated
foundation build owns all of that.

Node identity mirrors the L0 island model: uid = "<unit_id>::<name>", so the same name in two
different units stays two different nodes (cross-unit identity is L1's job, never L0's).

Credentials (env, with defaults):
    NEO4J_URI       bolt://localhost:7687
    NEO4J_USER      neo4j
    NEO4J_PASSWORD  (required — no default)
    NEO4J_DB        neo4j

Usage:
    NEO4J_PASSWORD=... python3.12 load_calibration_neo4j.py
"""
import json, os, re, sys
from neo4j import GraphDatabase

HERE = os.path.dirname(os.path.abspath(__file__))
RUN = os.path.join(HERE, "..", "calibration", "calibration-run.json")

URI = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
USER = os.environ.get("NEO4J_USER", "neo4j")
PW = os.environ.get("NEO4J_PASSWORD")
DB = os.environ.get("NEO4J_DB", "neo4j")

TYPE_OK = re.compile(r"[^A-Z0-9_]")


def rel_type(raw: str) -> str:
    """Sanitize a model relation type into a legal Neo4j relationship type."""
    t = TYPE_OK.sub("_", (raw or "REL").upper()).strip("_")
    return t or "REL"


def uid(unit_id: str, name: str) -> str:
    return f"{unit_id}::{name}"


def main():
    if not PW:
        sys.exit("Set NEO4J_PASSWORD (and NEO4J_USER if not 'neo4j').")
    records = json.load(open(RUN))
    driver = GraphDatabase.driver(URI, auth=(USER, PW))
    n_nodes = n_edges = 0
    with driver.session(database=DB) as s:
        # clean slate for the calibration graph only
        s.run("MATCH (n:Cal) DETACH DELETE n")
        for rec in records:
            u = rec["id"]
            for nd in rec["nodes"]:
                s.run(
                    "MERGE (n:Cal {uid:$uid}) "
                    "SET n.name=$name, n.type=$type, n.clause=$clause, n.unit_id=$unit_id, n.kind=$kind",
                    uid=uid(u, nd["name"]), name=nd["name"], type=nd["type"],
                    clause=nd.get("clause", ""), unit_id=u, kind=rec["kind"],
                )
                n_nodes += 1
            for ed in rec["edges"]:
                rt = rel_type(ed["type"])
                s.run(
                    f"MATCH (a:Cal {{uid:$f}}), (b:Cal {{uid:$t}}) "
                    f"MERGE (a)-[r:`{rt}`]->(b) SET r.raw_type=$raw, r.clause=$clause, r.unit_id=$unit_id",
                    f=uid(u, ed["from"]), t=uid(u, ed["to"]),
                    raw=ed["type"], clause=ed.get("clause", ""), unit_id=u,
                )
                n_edges += 1
    driver.close()
    print(f"loaded {n_nodes} :Cal nodes and {n_edges} relationships into '{DB}'")
    print("inspect with p2-ad-market-v2/calibration/QUERIES.cypher · drop with: MATCH (n:Cal) DETACH DELETE n")


if __name__ == "__main__":
    main()
