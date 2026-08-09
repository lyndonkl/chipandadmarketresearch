#!/usr/bin/env python3.12
"""
embed.py — L1 step 1: embed every node with qwen3-embedding (4096-dim) and index it.

Serialization is the settled "concatenate everything, structured" form: name, type, and every
semantic property (value and year included — the user's call). Embeddings only build candidate
piles; the model decides every merge, so a value in the string never decides identity.

The vector is stored on the node and indexed with Neo4j's native vector index (4096 = the exact
ceiling, zero headroom, so nothing is ever concatenated onto the vector). Written by the loader role
as the final L0-finalisation step — the builder role that runs the actual L1 merge logic still
cannot touch :L0. Resumable: a node that already has an embedding is skipped.
"""
from __future__ import annotations
import json, sys, time, urllib.request
from connection import DB, get_driver

MODEL = "qwen3-embedding:8b-q8_0"
BATCH = 32
ORDER = ["name", "type", "kind", "era", "clause", "about_year", "year", "medium", "money_type",
         "central", "value", "unit", "claim_unit", "grade", "source_series", "verdict", "method"]


def serialize(props: dict) -> str:
    parts = []
    for k in ORDER:
        v = props.get(k)
        if v is None or v == "":
            continue
        parts.append(f"{k}: {v}")
    return " | ".join(parts)


def embed_batch(texts: list[str]) -> list[list[float]]:
    body = json.dumps({"model": MODEL, "input": texts, "keep_alive": "30m"}).encode()
    req = urllib.request.Request("http://localhost:11434/api/embed", data=body,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.load(r)["embeddings"]


def create_index(s):
    s.run("CREATE VECTOR INDEX node_embedding IF NOT EXISTS FOR (n:Node) ON (n.embedding) "
          "OPTIONS {indexConfig: {`vector.dimensions`: 4096, `vector.similarity_function`: 'cosine'}}")


def run():
    drv = get_driver("loader")
    with drv.session(database=DB) as s:
        todo = s.run("MATCH (n:Node) WHERE n.embedding IS NULL "
                     "RETURN n.uid AS uid, properties(n) AS p").data()
    total = len(todo)
    print(f"embedding {total} nodes (batch {BATCH})", flush=True)
    done = 0
    t0 = time.time()
    with drv.session(database=DB) as s:
        for i in range(0, total, BATCH):
            chunk = todo[i:i + BATCH]
            vecs = embed_batch([serialize(c["p"]) for c in chunk])
            rows = [{"uid": c["uid"], "vec": v} for c, v in zip(chunk, vecs)]
            s.run("UNWIND $rows AS row MATCH (n:Node {uid: row.uid}) SET n.embedding = row.vec", rows=rows)
            done += len(chunk)
            if done % 512 < BATCH:
                rate = (time.time() - t0) / max(done, 1)
                print(f"  {done}/{total} · ETA ~{(total-done)*rate/60:.1f}m", flush=True)
        create_index(s)
    drv.close()
    print(f"embedded {done} nodes; vector index live")
    return {"embedded": done}


if __name__ == "__main__":
    if "--smoke" in sys.argv:
        drv = get_driver("loader")
        with drv.session(database=DB) as s:
            sample = s.run("MATCH (n:Node) RETURN properties(n) AS p LIMIT 3").data()
        for r in sample:
            print("SERIALIZE:", serialize(r["p"])[:160])
        v = embed_batch([serialize(sample[0]["p"])])
        print("dim:", len(v[0]))
        drv.close()
    else:
        print(run())
