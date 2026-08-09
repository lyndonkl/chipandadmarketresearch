#!/usr/bin/env python3.12
"""
adspend_loader.py — load the 1,573 ad-spend points as :L0 :Measurement nodes with their numbers
attached (script-loaded, NOT withheld — these come straight from the frozen data), plus the CANONICAL
medium / money_type dimension entities they wire to.

Design (locked):
- Each point -> one measurement node keyed by keys.adspend_id(series, year, medium, money_type).
  Its full calibration rides as properties (value, ci80, grade, source names, series, bridged).
- medium and money_type are GLOBAL controlled-vocabulary dimension entities (keys.dim_id). One
  `newspapers` node, one `national_brand` node — a deterministic, exact-match code merge, unlike the
  fuzzy claim-entity identity L1 resolves. An absent money_type gets NO money_type edge.
- These dimension entities bridge to the fuzzy claim-derived entities ("newspaper") at L1.
"""
from __future__ import annotations
import json, os
import keys
import corpus_hash
from connection import DB, get_driver

ADSPEND = os.path.join(corpus_hash.FROZEN_ROOT, "data", "adspend.json")


def gather_points(doc) -> list[dict]:
    pts = []
    def walk(o):
        if isinstance(o, dict):
            if isinstance(o.get("points"), list):
                pts.extend(o["points"])
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(doc)
    return pts


def load_point(tx, p: dict) -> None:
    series, year, medium = p["source_series"], p["year"], p["medium"]
    mt = p.get("money_type")  # None on 1,042 points -> 'unsplit' token in the id, no money_type edge
    uid = keys.adspend_id(series, year, medium, mt)
    cal = p.get("calibration", {}) or {}
    name = f"{medium} advertising spend" + (f" ({mt})" if mt else "")
    tx.run(
        "MERGE (n:Node {uid:$uid}) SET n:L0, n:Measurement, "
        "n.name=$name, n.type='ad-spend measurement', n.kind='adspend', n.layer=0, "
        "n.origin=$origin, n.value=$value, n.unit=$unit, n.year=$year, n.medium=$medium, "
        "n.money_type=$mt, n.source_series=$series, n.bridged=$bridged, "
        "n.grade=$grade, n.ci80=$ci80, n.source_names=$snames",
        uid=uid, name=name, origin=f"adspend:{series}", value=p.get("value"), unit=p.get("unit"),
        year=year, medium=medium, mt=mt, series=series, bridged=p.get("bridged"),
        grade=cal.get("grade"), ci80=cal.get("ci80"),
        snames=[s.get("name") for s in cal.get("sources", []) if s.get("name")],
    )
    dmed = keys.dim_id("medium", medium)
    tx.run("MERGE (d:Node {uid:$uid}) SET d:L0, d:Dimension, d.name=$name, "
           "d.type='advertising medium', d.kind='dimension', d.layer=0, d.origin='adspend:dimensions'",
           uid=dmed, name=medium)
    tx.run("MATCH (m:Node {uid:$m}),(d:Node {uid:$d}) MERGE (m)-[r:OF_MEDIUM]->(d) SET r.layer=0",
           m=uid, d=dmed)
    if mt:
        dmt = keys.dim_id("money_type", mt)
        tx.run("MERGE (d:Node {uid:$uid}) SET d:L0, d:Dimension, d.name=$name, "
               "d.type='money type', d.kind='dimension', d.layer=0, d.origin='adspend:dimensions'",
               uid=dmt, name=mt)
        tx.run("MATCH (m:Node {uid:$m}),(d:Node {uid:$d}) MERGE (m)-[r:OF_MONEY_TYPE]->(d) SET r.layer=0",
               m=uid, d=dmt)


def load_all(limit: int = None, hash_guard: bool = True) -> dict:
    if hash_guard:
        corpus_hash.assert_frozen("adspend-load start")
    points = gather_points(json.load(open(ADSPEND)))
    if limit:
        points = points[:limit]
    drv = get_driver("loader")
    n = 0
    try:
        for p in points:
            with drv.session(database=DB) as s:
                s.execute_write(load_point, p)
            n += 1
    finally:
        drv.close()
    if hash_guard:
        corpus_hash.assert_frozen("adspend-load end")
    return {"points_loaded": n, "points_total": len(gather_points(json.load(open(ADSPEND))))}


if __name__ == "__main__":
    import sys
    lim = int(sys.argv[1]) if len(sys.argv) > 1 else None
    print(load_all(limit=lim))
