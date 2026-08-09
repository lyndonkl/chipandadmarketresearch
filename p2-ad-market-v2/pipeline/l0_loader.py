#!/usr/bin/env python3.12
"""
l0_loader.py — load the per-unit L0 extractions into admarket as the loader role.

Loads STRUCTURE only: nodes (name/type/clause + inherited provenance) and edges (type/clause +
provenance). The withheld number is attached in a separate pass (provenance.py). Every node gets a
base :Node label, the :L0 layer label, and a grain label (:Measurement if the model's type names a
measurement, else :Entity). Cross-unit identity is NOT resolved here — that is L1's job.

Defences wired in:
- ids come only from keys.py (defect #1)
- the frozen corpus is hash-checked before and after (defect #3)
- the extraction's parse_and_repair already guaranteed declare-before-use and no year nodes, so every
  edge endpoint resolves to a node in the same unit (defect #2); a stray unresolved endpoint is
  logged and its edge skipped, never written dangling.
"""
from __future__ import annotations
import glob, json, os, sys

import keys
import corpus_hash
from connection import DB, get_driver

EXTRACT_DIR = os.path.join(keys.__file__.rsplit("/", 1)[0], "..", "l0", "extractions")


def grain_label(node_type: str) -> str:
    return "Measurement" if "measurement" in (node_type or "").lower() else "Entity"


def load_unit(tx, rec: dict) -> dict:
    unit_id = rec["id"]
    name2uid = {}
    n_nodes = n_edges = n_skipped = 0
    for nd in rec.get("nodes", []):
        uid = keys.node_id(unit_id, nd["name"], nd["type"])
        name2uid[nd["name"]] = uid
        grain = grain_label(nd["type"])
        tx.run(
            f"MERGE (n:Node {{uid:$uid}}) SET n:L0, n:{grain}, "
            "n.name=$name, n.type=$type, n.clause=$clause, "
            "n.origin=$origin, n.kind=$kind, n.era=$era, n.about_year=$year, n.layer=0",
            uid=uid, name=nd["name"], type=nd["type"], clause=nd.get("clause", ""),
            origin=unit_id, kind=rec.get("kind"), era=rec.get("era"), year=rec.get("about_year"),
        )
        n_nodes += 1
    for ed in rec.get("edges", []):
        if ed["from"] not in name2uid or ed["to"] not in name2uid:
            n_skipped += 1
            continue
        rt = keys.rel_type(ed["type"])
        tx.run(
            f"MATCH (a:Node {{uid:$f}}), (b:Node {{uid:$t}}) "
            f"MERGE (a)-[r:`{rt}`]->(b) "
            "SET r.raw_type=$raw, r.clause=$clause, r.origin=$origin, r.layer=0",
            f=name2uid[ed["from"]], t=name2uid[ed["to"]],
            raw=ed["type"], clause=ed.get("clause", ""), origin=unit_id,
        )
        n_edges += 1
    return {"nodes": n_nodes, "edges": n_edges, "skipped_edges": n_skipped}


def load_all(extract_dir: str = None, unit_ids: list[str] = None, hash_guard: bool = True) -> dict:
    extract_dir = extract_dir or EXTRACT_DIR
    if hash_guard:
        corpus_hash.assert_frozen("l0-load start")
    files = sorted(glob.glob(os.path.join(extract_dir, "*.json")))
    if unit_ids is not None:
        want = set(unit_ids)
        files = [f for f in files if json.load(open(f))["id"] in want]
    totals = {"units": 0, "nodes": 0, "edges": 0, "skipped_edges": 0, "errors": 0}
    drv = get_driver("loader")
    try:
        for f in files:
            rec = json.load(open(f))
            if rec.get("error") or not rec.get("nodes"):
                totals["errors"] += 1 if rec.get("error") else 0
                continue
            with drv.session(database=DB) as s:
                r = s.execute_write(load_unit, rec)
            totals["units"] += 1
            for k in ("nodes", "edges", "skipped_edges"):
                totals[k] += r[k]
    finally:
        drv.close()
    if hash_guard:
        corpus_hash.assert_frozen("l0-load end")
    return totals


if __name__ == "__main__":
    ids = [a for a in sys.argv[1:] if not a.startswith("--")]
    print(load_all(unit_ids=ids or None, hash_guard="--no-hash" not in sys.argv))
