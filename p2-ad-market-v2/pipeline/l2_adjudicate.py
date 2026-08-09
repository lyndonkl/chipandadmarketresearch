#!/usr/bin/env python3.12
"""
l2_adjudicate.py — L2 step 3: gpt-oss builds the KIND parent for each pile.

Same driver shape as the L1 adjudicator (sub-batch, cross-chunk reconcile by name+grain, code
singleton fallback, coverage guard, resumable), but with the L2 kind prompt and the member-types
serialization. Reuses the L1 GROUP/MEMBER parser.
"""
from __future__ import annotations
import glob, json, os, sys, time, urllib.request
import corpus_hash
from adjudicate import parse   # reuse GROUP|/MEMBER| parser

V2 = corpus_hash.FROZEN_ROOT.replace("p2-ad-market", "p2-ad-market-v2")
GROUPS = os.path.join(V2, "l2", "groups")
PARENTS = os.path.join(V2, "l2", "parents")
PROMPT = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "l2_adjudicate_prompt.txt")).read()
MODEL = "gpt-oss:120b"
HARD, SOFT = 120, 50


def call_gpt(members):
    pile = "\n".join(f"[{i+1}] {m['name']} | {m['type']} | {m['grain']} | member types: {m['hist']}"
                     for i, m in enumerate(members))
    body = json.dumps({"model": MODEL, "prompt": PROMPT.replace("{PILE}", pile), "stream": False,
                       "keep_alive": "30m", "options": {"temperature": 0.1, "num_ctx": 32768}}).encode()
    req = urllib.request.Request("http://localhost:11434/api/generate", data=body,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        return json.load(r).get("response", "") or ""


def adjudicate_group(members):
    chunks = [members] if len(members) <= HARD else [members[i:i+SOFT] for i in range(0, len(members), SOFT)]
    by_key = {}

    def add(name, ptype, grain, reason, uid, singleton_uid=None):
        key = (f"__s__{singleton_uid}", grain) if singleton_uid else (name.strip().lower(), grain)
        P = by_key.setdefault(key, {"name": name, "type": ptype, "grain": grain, "reason": reason,
                                    "child_uids": set()})
        P["child_uids"].add(uid)

    for chunk in chunks:
        groups = parse(call_gpt(chunk))
        if not groups:
            groups = parse(call_gpt(chunk))
        assigned = set()
        for g in groups.values():
            for idx in g["idxs"]:
                if 1 <= idx <= len(chunk):
                    add(g["name"], g["type"], g["grain"], g["reason"], chunk[idx-1]["uid"])
                    assigned.add(idx)
        for i, m in enumerate(chunk, 1):
            if i not in assigned:
                add(m["name"], m["type"], m["grain"], "singleton: unplaced by model", m["uid"],
                    singleton_uid=m["uid"])
    return [{"name": P["name"], "type": P["type"], "grain": P["grain"], "reason": P["reason"],
             "child_uids": sorted(P["child_uids"])} for P in by_key.values()]


def run(limit=None):
    corpus_hash.assert_frozen("l2-adjudicate")
    os.makedirs(PARENTS, exist_ok=True)
    files = sorted(glob.glob(os.path.join(GROUPS, "*.json")))
    todo = [f for f in files if not os.path.exists(os.path.join(PARENTS, os.path.basename(f)))]
    if limit:
        todo = todo[:limit]
    print(f"{len(files)} L2 piles; {len(files)-len(todo)} done; adjudicating {len(todo)}", flush=True)
    t0 = time.time()
    for k, f in enumerate(todo, 1):
        g = json.load(open(f))
        parents = adjudicate_group(g["members"])
        allu = {m["uid"] for m in g["members"]}
        cov = {u for P in parents for u in P["child_uids"]}
        for u in allu - cov:
            m = next(m for m in g["members"] if m["uid"] == u)
            parents.append({"name": m["name"], "type": m["type"], "grain": m["grain"],
                            "reason": "singleton: coverage guard", "child_uids": [u]})
        json.dump({"group_id": g["group_id"], "n_in": g["n"], "parents": parents},
                  open(os.path.join(PARENTS, os.path.basename(f)), "w"), indent=1)
        rate = (time.time()-t0)/k
        print(f"[{k}/{len(todo)}] {g['n']:>3} L1 -> {len(parents)} kinds · ETA ~{(len(todo)-k)*rate/3600:.1f}h", flush=True)
    return {"adjudicated": len(todo)}


if __name__ == "__main__":
    lim = int(sys.argv[sys.argv.index("--limit")+1]) if "--limit" in sys.argv else None
    print(run(limit=lim))
