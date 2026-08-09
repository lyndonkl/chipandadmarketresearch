#!/usr/bin/env python3.12
"""
corpus_hash.py — the frozen-corpus guard.

`p2-ad-market/` is FROZEN AND READ-ONLY. This module hashes every file under it, stores a baseline
on first run, and verifies the tree is byte-for-byte unchanged before and after every pipeline run.
A mismatch HALTS the run — a stray write to the frozen corpus poisons every layer built on it.

Usage:
    python3.12 corpus_hash.py            # establish baseline (first run) or verify (thereafter)
    python3.12 corpus_hash.py --rebaseline   # overwrite the baseline (only if you MEANT to)
"""
from __future__ import annotations
import hashlib, json, os, sys

REPO = "/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch"
FROZEN_ROOT = os.path.join(REPO, "p2-ad-market")
BASELINE = os.path.join(REPO, "p2-ad-market-v2", "l0", "corpus-hashes.json")


def _sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def scan() -> dict[str, str]:
    out = {}
    for root, _dirs, files in os.walk(FROZEN_ROOT):
        for fn in files:
            if fn == ".DS_Store":
                continue
            p = os.path.join(root, fn)
            rel = os.path.relpath(p, FROZEN_ROOT)
            out[rel] = _sha256(p)
    return dict(sorted(out.items()))


def write_baseline() -> dict:
    hashes = scan()
    os.makedirs(os.path.dirname(BASELINE), exist_ok=True)
    json.dump(hashes, open(BASELINE, "w"), indent=1)
    return hashes


def verify() -> tuple[bool, dict]:
    """Return (ok, report). report has changed/missing/added file lists."""
    baseline = json.load(open(BASELINE))
    current = scan()
    changed = [f for f in baseline if f in current and baseline[f] != current[f]]
    missing = [f for f in baseline if f not in current]
    added = [f for f in current if f not in baseline]
    ok = not (changed or missing or added)
    return ok, {"changed": changed, "missing": missing, "added": added,
                "n_baseline": len(baseline), "n_current": len(current)}


def assert_frozen(where: str = "run") -> None:
    """Call at the start and end of every pipeline stage. Halts on any drift."""
    if not os.path.exists(BASELINE):
        raise SystemExit("no corpus baseline — run corpus_hash.py once before any stage")
    ok, rep = verify()
    if not ok:
        raise SystemExit(f"FROZEN CORPUS CHANGED ({where}) — HALT. "
                         f"changed={rep['changed']} missing={rep['missing']} added={rep['added']}")


if __name__ == "__main__":
    if "--rebaseline" in sys.argv or not os.path.exists(BASELINE):
        h = write_baseline()
        print(f"baseline written: {len(h)} files under p2-ad-market/")
    else:
        ok, rep = verify()
        if ok:
            print(f"frozen corpus VERIFIED unchanged: {rep['n_current']} files")
        else:
            print(f"DRIFT: changed={rep['changed']} missing={rep['missing']} added={rep['added']}")
            sys.exit(1)
