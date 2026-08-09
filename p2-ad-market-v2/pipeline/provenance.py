#!/usr/bin/env python3.12
"""
provenance.py — attach each claim's WITHHELD number to the right measurement node.

The model never emitted a figure. Here the calibrated value is joined back deterministically, keyed
on claim id, with a conservative match that NEVER guesses:

  0 measurement nodes for the claim -> attach nothing; log it (a date-unit claim expects this; a
      quantity-unit claim that got none is a miss to review).
  exactly 1 measurement node        -> attach.
  several                            -> match the claim's `unit` string against each node's
      (name + clause) by token overlap; a unique best match wins; a tie or no-overlap HALTS that
      claim (logged, nothing written). Its figures stay recoverable through `origin`.

Only claim origins (in claims.json) are processed. Prose measurement nodes carry no calibrated
number by design — their figures live in the prose, reachable via origin.
"""
from __future__ import annotations
import json, os, re
import corpus_hash
from connection import DB, get_driver

CLAIMS = os.path.join(corpus_hash.FROZEN_ROOT, "data", "claims.json")
REPORT = os.path.join(corpus_hash.FROZEN_ROOT.replace("p2-ad-market", "p2-ad-market-v2"),
                      "l0", "value-attach-report.json")

_STOP = {"of", "the", "a", "an", "in", "per", "us", "by", "to", "and", "or", "on", "at",
         "for", "as", "is", "s", "its", "with", "from"}
_DATEISH = re.compile(r"\byear\b|\bdate\b|\bwhen\b", re.I)


def toks(s: str) -> set[str]:
    return {w for w in re.split(r"[^a-z0-9]+", (s or "").lower()) if len(w) > 1 and w not in _STOP}


def best_match(unit: str, nodes: list[dict]) -> tuple[int | None, int]:
    """Return (index of unique best-overlap node, its score) or (None, 0) if tie/zero."""
    ut = toks(unit)
    scores = [len(ut & toks(n["name"] + " " + (n.get("clause") or ""))) for n in nodes]
    top = max(scores)
    if top == 0 or scores.count(top) != 1:
        return None, top
    return scores.index(top), top


def attach(tx, uid: str, c: dict) -> None:
    tx.run(
        "MATCH (n:Node {uid:$uid}) SET n.central=$central, n.ci80=$ci80, n.claim_unit=$unit, "
        "n.grade=$grade, n.as_of=$as_of, n.verdict=$verdict, n.method=$method, "
        "n.about_span=$about_span, n.source_names=$snames, n.has_value=true",
        uid=uid, central=c.get("central"), ci80=c.get("ci80"), unit=c.get("unit"),
        grade=c.get("grade"), as_of=c.get("as_of"), verdict=c.get("verdict"),
        method=c.get("method"), about_span=c.get("about_span"),
        snames=[s.get("name") for s in c.get("sources", []) if s.get("name")],
    )


def run() -> dict:
    corpus_hash.assert_frozen("value-attach start")
    claims = json.load(open(CLAIMS))["claims"]
    by_id = {c["id"]: c for c in claims}
    rep = {"attached_single": 0, "attached_matched": 0,
           "halted_ambiguous": [], "no_measurement_dateish": [], "no_measurement_quantity": []}
    drv = get_driver("loader")
    try:
        for cid, c in by_id.items():
            with drv.session(database=DB) as s:
                rows = s.run("MATCH (n:Measurement {origin:$o}) RETURN n.uid AS uid, n.name AS name, "
                             "n.clause AS clause", o=cid).data()
            if not rows:
                bucket = "no_measurement_dateish" if _DATEISH.search(c.get("unit", "")) \
                    else "no_measurement_quantity"
                rep[bucket].append({"id": cid, "unit": c.get("unit")})
                continue
            if len(rows) == 1:
                idx, score = 0, None
                kind = "attached_single"
            else:
                idx, score = best_match(c.get("unit", ""), rows)
                if idx is None:
                    rep["halted_ambiguous"].append(
                        {"id": cid, "unit": c.get("unit"), "top_score": score,
                         "candidates": [r["name"] for r in rows]})
                    continue
                kind = "attached_matched"
            with drv.session(database=DB) as s:
                s.execute_write(attach, rows[idx]["uid"], c)
            rep[kind] += 1
    finally:
        drv.close()
    corpus_hash.assert_frozen("value-attach end")
    os.makedirs(os.path.dirname(REPORT), exist_ok=True)
    summary = {k: (v if isinstance(v, int) else len(v)) for k, v in rep.items()}
    json.dump({"summary": summary, "detail": rep}, open(REPORT, "w"), indent=1)
    return summary


if __name__ == "__main__":
    print(json.dumps(run(), indent=1))
