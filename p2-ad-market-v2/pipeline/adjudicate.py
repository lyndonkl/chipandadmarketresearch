#!/usr/bin/env python3.12
"""
adjudicate.py — L1 step 3: gpt-oss decides the parent meta nodes for each candidate pile.

One pile per call (sub-batched if > HARD, then parents reconciled across chunks by name+grain).
Output is the abstraction pipe format GROUP|gid|name|type|grain|reason + MEMBER|gid|idx. The model
addresses members by pile-local idx; this loader owns idx->uid. Enforced in CODE, never by trust:
- every member the model does not place -> its own singleton parent (fail-closed, never dropped);
- empty/malformed output -> retry once (model resident), still empty -> every member a code singleton
  (never auto-merge);
- coverage asserted: every input uid appears under exactly->=1 parent before the pile is written.

Resumable: a pile whose parents file already exists is skipped. Writes files only; layers.py creates
the :L1 nodes.
"""
from __future__ import annotations
import glob, json, os, sys, time, urllib.request
import keys
import corpus_hash

V2 = corpus_hash.FROZEN_ROOT.replace("p2-ad-market", "p2-ad-market-v2")
GROUPS = os.path.join(V2, "l1", "groups")
PARENTS = os.path.join(V2, "l1", "parents")
PROMPT = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "l1_adjudicate_prompt.txt")).read()
MODEL = "gpt-oss:120b"
HARD, SOFT = 120, 50


def call_gpt(members: list) -> str:
    pile = "\n".join(f"[{i+1}] {m['name']} | {m['type']} | {m['grain']} | {m['origin']} | {m['facts']}"
                     for i, m in enumerate(members))
    body = json.dumps({"model": MODEL, "prompt": PROMPT.replace("{PILE}", pile), "stream": False,
                       "keep_alive": "30m", "options": {"temperature": 0.1, "num_ctx": 32768}}).encode()
    req = urllib.request.Request("http://localhost:11434/api/generate", data=body,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        return json.load(r).get("response", "") or ""


def parse(raw: str) -> dict:
    groups = {}
    for ln in raw.splitlines():
        p = [x.strip() for x in ln.strip().split("|")]
        if p[0] == "GROUP" and len(p) >= 6:
            groups[p[1]] = {"name": p[2], "type": p[3], "grain": p[4], "reason": p[5], "idxs": []}
        elif p[0] == "MEMBER" and len(p) >= 3 and p[1] in groups:
            try:
                groups[p[1]]["idxs"].append(int(p[2]))
            except ValueError:
                pass
    return groups


def adjudicate_group(members: list) -> list:
    chunks = [members] if len(members) <= HARD else [members[i:i+SOFT] for i in range(0, len(members), SOFT)]
    by_key = {}   # (norm name, grain) -> parent dict ; reconciles same parent across chunks

    def add(name, ptype, grain, reason, uid, singleton_uid=None):
        key = (f"__s__{singleton_uid}", grain) if singleton_uid else (keys.norm(name), grain)
        P = by_key.setdefault(key, {"name": name, "type": ptype, "grain": grain,
                                    "reason": reason, "child_uids": set()})
        P["child_uids"].add(uid)

    for chunk in chunks:
        raw = call_gpt(chunk)
        groups = parse(raw)
        if not groups:                                   # retry once, resident model
            groups = parse(call_gpt(chunk))
        assigned = set()
        for g in groups.values():
            for idx in g["idxs"]:
                if 1 <= idx <= len(chunk):
                    add(g["name"], g["type"], g["grain"], g["reason"], chunk[idx-1]["uid"])
                    assigned.add(idx)
        for i, m in enumerate(chunk, 1):                 # code singleton for anything unplaced
            if i not in assigned:
                add(m["name"], m["type"], m["grain"], "singleton: unplaced by model", m["uid"],
                    singleton_uid=m["uid"])
    return [{"name": P["name"], "type": P["type"], "grain": P["grain"], "reason": P["reason"],
             "child_uids": sorted(P["child_uids"])} for P in by_key.values()]


def run(limit=None):
    corpus_hash.assert_frozen("l1-adjudicate")
    os.makedirs(PARENTS, exist_ok=True)
    files = sorted(glob.glob(os.path.join(GROUPS, "*.json")))
    todo = [f for f in files if not os.path.exists(os.path.join(PARENTS, os.path.basename(f)))]
    if limit:
        todo = todo[:limit]
    print(f"{len(files)} piles total; {len(files)-len(todo)} already done; adjudicating {len(todo)}", flush=True)
    t0 = time.time()
    for k, f in enumerate(todo, 1):
        g = json.load(open(f))
        parents = adjudicate_group(g["members"])
        # coverage guard — every input uid must be under >=1 parent
        allu = {m["uid"] for m in g["members"]}
        cov = {u for P in parents for u in P["child_uids"]}
        for u in allu - cov:
            m = next(m for m in g["members"] if m["uid"] == u)
            parents.append({"name": m["name"], "type": m["type"], "grain": m["grain"],
                            "reason": "singleton: coverage guard", "child_uids": [u]})
        json.dump({"group_id": g["group_id"], "source": g.get("source"), "n_in": g["n"],
                   "parents": parents}, open(os.path.join(PARENTS, os.path.basename(f)), "w"), indent=1)
        rate = (time.time()-t0)/k
        print(f"[{k}/{len(todo)}] {g['n']:>3} nodes -> {len(parents)} parents "
              f"· {rate:.0f}s/pile · ETA ~{(len(todo)-k)*rate/3600:.1f}h", flush=True)
    return {"adjudicated": len(todo)}


if __name__ == "__main__":
    lim = None
    if "--limit" in sys.argv:
        lim = int(sys.argv[sys.argv.index("--limit")+1])
    print(run(limit=lim))
