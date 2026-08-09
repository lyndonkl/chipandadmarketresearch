#!/usr/bin/env python3.12
"""
rel_candidates.py — relationship track, step 1: cluster the L0 relation TYPES into candidate piles.

The relationship analogue of node candidate generation. Each distinct raw relation type (MEASURES,
BOUGHT, HAS_REVENUE, ...) is serialized with example endpoints + clause, embedded with qwen3, and
clustered so gpt-oss can name a small meta-relation vocabulary (BOUGHT/PURCHASED/ACQUIRED -> one).

The 2,104 ad-spend dimension edges (Neo4j type OF_MEDIUM / OF_MONEY_TYPE, raw_type null) are already
canonical meta-relations and are excluded here — connect_parents lifts them under their own type.

Read-only: writes rel-pile JSON files. Uses qwen3 (embedding) and scipy k-means; no graph writes.
"""
from __future__ import annotations
import json, os, shutil, urllib.request
from collections import defaultdict
import numpy as np
from scipy.cluster.vq import kmeans2, whiten
from connection import DB, get_driver
import corpus_hash

OUTDIR = os.path.join(corpus_hash.FROZEN_ROOT.replace("p2-ad-market", "p2-ad-market-v2"),
                      "l1", "rel_groups")
EMB_MODEL = "qwen3-embedding:8b-q8_0"
K = 150


def embed(texts):
    body = json.dumps({"model": EMB_MODEL, "input": texts, "keep_alive": "30m"}).encode()
    req = urllib.request.Request("http://localhost:11434/api/embed", data=body,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.load(r)["embeddings"]


def gather_types() -> dict:
    drv = get_driver("reader")
    ex = defaultdict(list); cnt = defaultdict(int)
    with drv.session(database=DB) as s:
        for r in s.run("MATCH (a:L0)-[r]->(b:L0) WHERE r.raw_type IS NOT NULL "
                       "RETURN r.raw_type AS t, a.name AS f, b.name AS b2, r.clause AS c"):
            cnt[r["t"]] += 1
            if len(ex[r["t"]]) < 3:
                ex[r["t"]].append(f"{r['f']} -> {r['b2']}" + (f" ({r['c']})" if r["c"] else ""))
    drv.close()
    return {t: {"count": cnt[t], "examples": ex[t]} for t in cnt}


def serialize(t, info):
    # Focus on the RELATION MEANING (the verb), not the topic of its endpoints — the endpoints
    # pulled types together by subject matter (all newspaper-ish) instead of by relation semantics.
    return f"a relationship in which the subject {t.replace('_', ' ').lower()} the object"


def run(k=K):
    corpus_hash.assert_frozen("l1-rel-candidates")
    if os.path.isdir(OUTDIR):
        shutil.rmtree(OUTDIR)
    os.makedirs(OUTDIR)
    types = gather_types()
    tnames = sorted(types)
    print(f"distinct raw relation types: {len(tnames)}; embedding...", flush=True)
    vecs = []
    for i in range(0, len(tnames), 32):
        vecs.extend(embed([serialize(t, types[t]) for t in tnames[i:i+32]]))
    X = np.array(vecs, dtype=float)
    k = min(k, len(tnames))
    _, labels = kmeans2(whiten(X), k, minit="++", seed=1, iter=30)
    piles = defaultdict(list)
    for t, lab in zip(tnames, labels):
        piles[int(lab)].append(t)
    n = 0
    sizes = []
    for lab, members in piles.items():
        if not members:
            continue
        rec = {"pile_id": f"rel-{lab}", "n": len(members),
               "types": [{"raw_type": t, "count": types[t]["count"], "examples": types[t]["examples"]}
                         for t in members]}
        json.dump(rec, open(os.path.join(OUTDIR, f"rel-{lab}.json"), "w"), indent=1)
        n += 1; sizes.append(len(members))
    sizes.sort(reverse=True)
    print(f"rel piles: {n}; sizes max {sizes[0]}, median {sizes[len(sizes)//2]}; "
          f"types covered {sum(sizes)}")
    return {"rel_piles": n, "types": len(tnames)}


if __name__ == "__main__":
    print(run())
