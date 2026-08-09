#!/usr/bin/env python3.12
"""
rel_adjudicate.py — relationship track, step 2: gpt-oss names the meta-relations.

One rel-pile per call (sub-batched if large; meta-relations reconciled across chunks by name). Output
is METAREL|gid|name|reason + TYPE|gid|idx. Any raw type the model does not place -> its own singleton
meta-relation (in code). Produces, per pile, a mapping {meta_relation_name: [raw_type, ...]}. Combined
downstream into one raw_type -> meta_relation dict for connect_parents. Resumable.
"""
from __future__ import annotations
import glob, json, os, sys, time, urllib.request
import corpus_hash

V2 = corpus_hash.FROZEN_ROOT.replace("p2-ad-market", "p2-ad-market-v2")
RELGROUPS = os.path.join(V2, "l1", "rel_groups")
RELPARENTS = os.path.join(V2, "l1", "rel_parents")
PROMPT = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "rel_adjudicate_prompt.txt")).read()
MODEL = "gpt-oss:120b"
HARD, SOFT = 60, 40


def call_gpt(types):
    pile = "\n".join(f"[{i+1}] {t['raw_type']} ({t['count']}) e.g. " + "; ".join(t["examples"][:2])
                     for i, t in enumerate(types))
    body = json.dumps({"model": MODEL, "prompt": PROMPT.replace("{PILE}", pile), "stream": False,
                       "keep_alive": "30m", "options": {"temperature": 0.1, "num_ctx": 32768}}).encode()
    req = urllib.request.Request("http://localhost:11434/api/generate", data=body,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        return json.load(r).get("response", "") or ""


def parse(raw):
    metas = {}
    for ln in raw.splitlines():
        p = [x.strip() for x in ln.strip().split("|")]
        if p[0] == "METAREL" and len(p) >= 4:
            metas[p[1]] = {"name": p[2], "idxs": []}
        elif p[0] == "TYPE" and len(p) >= 3 and p[1] in metas:
            try:
                metas[p[1]]["idxs"].append(int(p[2]))
            except ValueError:
                pass
    return metas


def adjudicate_pile(types):
    chunks = [types] if len(types) <= HARD else [types[i:i+SOFT] for i in range(0, len(types), SOFT)]
    by_name = {}
    for chunk in chunks:
        metas = parse(call_gpt(chunk))
        if not metas:
            metas = parse(call_gpt(chunk))
        assigned = set()
        for g in metas.values():
            for idx in g["idxs"]:
                if 1 <= idx <= len(chunk):
                    by_name.setdefault(g["name"], set()).add(chunk[idx-1]["raw_type"])
                    assigned.add(idx)
        for i, t in enumerate(chunk, 1):
            if i not in assigned:
                by_name.setdefault(t["raw_type"], set()).add(t["raw_type"])
    return {name: sorted(rts) for name, rts in by_name.items()}


def run(limit=None):
    corpus_hash.assert_frozen("l1-rel-adjudicate")
    os.makedirs(RELPARENTS, exist_ok=True)
    files = sorted(glob.glob(os.path.join(RELGROUPS, "*.json")))
    todo = [f for f in files if not os.path.exists(os.path.join(RELPARENTS, os.path.basename(f)))]
    if limit:
        todo = todo[:limit]
    print(f"{len(files)} rel piles; adjudicating {len(todo)}", flush=True)
    t0 = time.time()
    for k, f in enumerate(todo, 1):
        g = json.load(open(f))
        metas = adjudicate_pile(g["types"])
        allt = {t["raw_type"] for t in g["types"]}
        cov = {rt for rts in metas.values() for rt in rts}
        for rt in allt - cov:
            metas[rt] = [rt]
        json.dump({"pile_id": g["pile_id"], "meta_relations": metas},
                  open(os.path.join(RELPARENTS, os.path.basename(f)), "w"), indent=1)
        rate = (time.time()-t0)/k
        print(f"[{k}/{len(todo)}] {len(g['types'])} types -> {len(metas)} meta-relations "
              f"· ETA ~{(len(todo)-k)*rate/3600:.1f}h", flush=True)
    return {"adjudicated": len(todo)}


if __name__ == "__main__":
    lim = int(sys.argv[sys.argv.index("--limit")+1]) if "--limit" in sys.argv else None
    print(run(limit=lim))
