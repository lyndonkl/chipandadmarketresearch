#!/usr/bin/env python3.12
"""
claim.py <claim_id> — print the full sourced statement, grade, CI, sources and date for a claim id.

This is how you turn a graph pointer into the real, cited fact. Claim ids look like e1-creators-001,
ds-gdp-001, mech-first_price-001 (claims) or tu:era:5:event:2 (era prose). Everything here is frozen
and sourced — it is the only ground truth you may use.
"""
import sys, json, os, re

ROOT = "/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/p2-ad-market"
if len(sys.argv) < 2:
    sys.exit("usage: claim.py <claim_id>")
cid = sys.argv[1]

claims = {c["id"]: c for c in json.load(open(os.path.join(ROOT, "data", "claims.json")))["claims"]}
if cid in claims:
    print(json.dumps(claims[cid], indent=1, ensure_ascii=False))
    sys.exit()

m = re.match(r"tu:era:(\d+):(field|event|boundary)(?::(.+))?", cid)
if m:
    era = json.load(open(os.path.join(ROOT, "data", "eras", f"era-{m.group(1)}.json")))
    kind, key = m.group(2), m.group(3)
    if kind == "field":
        print(json.dumps({"id": cid, "text": era["fields"][key]["summary"]}, indent=1, ensure_ascii=False))
    elif kind == "event":
        print(json.dumps({"id": cid, **era["events"][int(key)]}, indent=1, ensure_ascii=False))
    else:
        print(json.dumps({"id": cid, "boundary_notes": era["boundary_notes"]}, indent=1, ensure_ascii=False))
    sys.exit()
print(f"'{cid}' is not a known claim/prose id")
