#!/usr/bin/env python3.12
"""
embed_l2.py — L2 step 1: embed each L1 meta node for KIND clustering.

Layer isolation (the load-bearing invariant): the L0 vector index is FOR (n:Node) ON (n.embedding),
so L1 parents must embed into a DIFFERENT property. We use `l2_embedding` with its own label-scoped
index l2_embedding FOR (n:L1) ON (n.l2_embedding). Nothing is ever concatenated onto a 4096 vector.

The serialization emphasizes KIND, not identity: the node's own type plus the histogram of its
children's types — so the Google parent (company) and the Overture parent (search advertising
company) read as the same KIND even though neither consensus type says so. Runs as builder (writes
:L1, never :L0).
"""
from __future__ import annotations
import json, time, urllib.request
from collections import Counter
from connection import DB, get_driver

MODEL = "qwen3-embedding:8b-q8_0"
BATCH = 32


def serialize(name, grain, typ, ctypes):
    hist = ", ".join(t for t, _ in Counter(t for t in ctypes if t).most_common(6))
    return f"kind of thing: {typ} | example named: {name} | grain: {grain} | member types: {hist}"


def embed(texts):
    body = json.dumps({"model": MODEL, "input": texts, "keep_alive": "30m"}).encode()
    req = urllib.request.Request("http://localhost:11434/api/embed", data=body,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.load(r)["embeddings"]


def run():
    drv = get_driver("builder")
    with drv.session(database=DB) as s:
        rows = s.run("MATCH (p:L1) OPTIONAL MATCH (p)-[:PARENT_OF]->(c) "
                     "RETURN p.uid AS uid, p.name AS name, p.grain AS grain, p.type AS type, "
                     "collect(c.type) AS ctypes").data()
    todo = [r for r in rows if r.get("uid")]
    print(f"embedding {len(todo)} L1 nodes for L2 (batch {BATCH})", flush=True)
    t0 = time.time()
    with drv.session(database=DB) as s:
        for i in range(0, len(todo), BATCH):
            chunk = todo[i:i+BATCH]
            vecs = embed([serialize(r["name"], r["grain"], r["type"], r["ctypes"]) for r in chunk])
            s.run("UNWIND $rows AS row MATCH (p:L1 {uid:row.uid}) SET p.l2_embedding = row.vec",
                  rows=[{"uid": r["uid"], "vec": v} for r, v in zip(chunk, vecs)])
            if (i // BATCH) % 16 == 0:
                print(f"  {min(i+BATCH,len(todo))}/{len(todo)}", flush=True)
    drv.close()
    # No vector index needed — GDS k-means reads the l2_embedding property directly via projection.
    print(f"embedded {len(todo)} L1 nodes in {time.time()-t0:.0f}s")
    return {"embedded": len(todo)}


if __name__ == "__main__":
    print(run())
