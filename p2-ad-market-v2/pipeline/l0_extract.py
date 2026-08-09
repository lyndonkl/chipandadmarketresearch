#!/usr/bin/env python3.12
"""
L0 extraction runner — the real 639-unit run (not calibration).

Enumerates every unit (506 claims + 133 prose units), sends ONE Ollama call per unit through the
approved prompt, parses + lightly repairs the pipe output, and writes ONE json file per unit into an
output directory. It is RESUMABLE and INCREMENTAL: a finished unit is skipped on restart, and every
unit is written the moment it completes, so a crash never loses more than the in-flight unit and the
run can be monitored live.

It does NOT touch Neo4j and does NOT attach values — extraction only. The loader (foundation build)
reads these per-unit files, repairs, attaches the withheld number by claim id, and loads L0.

Usage:
    python3.12 l0_extract.py --all                       # all 639 units -> default outdir
    python3.12 l0_extract.py --outdir DIR id1 id2 ...     # just these ids
    python3.12 l0_extract.py --all --force               # re-run even finished units

Reuses the call/parse/resolve functions from extract.py so there is one code path, one prompt.
"""
from __future__ import annotations
import json, os, sys, time

import extract  # same directory: resolve_unit, build_unit_block, fill_prompt, call_ollama, parse_and_repair, load_corpus

V2 = extract.V2
DEFAULT_OUT = os.path.join(V2, "l0", "extractions")


def enumerate_all_units(claims: dict, eras: dict) -> list[str]:
    ids = list(claims.keys())  # 506 claims
    for n in range(1, 8):
        d = eras[n]
        for fk in d.get("fields", {}):
            ids.append(f"tu:era:{n}:field:{fk}")
        for i in range(len(d.get("events", []))):
            ids.append(f"tu:era:{n}:event:{i}")
        if d.get("boundary_notes"):
            ids.append(f"tu:era:{n}:boundary")
    return ids


def safe_name(uid: str) -> str:
    return uid.replace(":", "_").replace("/", "_")


def main(argv):
    force = "--force" in argv
    argv = [a for a in argv if a != "--force"]
    outdir = DEFAULT_OUT
    if "--outdir" in argv:
        i = argv.index("--outdir")
        outdir = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]

    claims, eras = extract.load_corpus()
    template = open(extract.PROMPT_TEMPLATE).read()

    if "--all" in argv:
        ids = enumerate_all_units(claims, eras)
    else:
        ids = [a for a in argv if not a.startswith("--")]
    if not ids:
        sys.exit("give --all or a list of unit ids")

    os.makedirs(outdir, exist_ok=True)
    total = len(ids)
    done = skipped = errors = 0
    t_start = time.time()
    for k, uid in enumerate(ids, 1):
        path = os.path.join(outdir, safe_name(uid) + ".json")
        if os.path.exists(path) and not force:
            skipped += 1
            continue
        try:
            u = extract.resolve_unit(uid, claims, eras)
        except KeyError as e:
            print(f"[{k}/{total}] SKIP unresolved {uid}: {e}", flush=True)
            errors += 1
            continue
        prompt = extract.fill_prompt(template, u)
        try:
            resp = extract.call_ollama(prompt)
            raw = resp.get("response", "") or ""
            err = None
        except Exception as e:  # noqa: BLE001 — record and continue the long run
            raw, err = "", str(e)
            resp = {"_elapsed_s": None}
        nodes, edges, repairs = extract.parse_and_repair(raw)
        rec = {
            "id": uid, "kind": u["kind"], "era": u.get("era"),
            "about_year": u.get("about_year"), "unit": u.get("unit"),
            "elapsed_s": resp.get("_elapsed_s"), "error": err,
            "n_nodes": len(nodes), "n_edges": len(edges), "n_repairs": len(repairs),
            "nodes": nodes, "edges": edges, "repairs": repairs, "raw": raw,
        }
        json.dump(rec, open(path, "w"), indent=1)
        done += 1
        if err:
            errors += 1
        rate = (time.time() - t_start) / max(done, 1)
        eta_h = (total - k) * rate / 3600
        print(f"[{k}/{total}] {uid} · {rec['n_nodes']}n {rec['n_edges']}e "
              f"{rec['n_repairs']}r · {rec['elapsed_s']}s{' · ERROR '+err if err else ''} "
              f"· ETA ~{eta_h:.1f}h", flush=True)

    print(f"\nrun complete: {done} extracted · {skipped} skipped (already done) · {errors} errors")
    print(f"  outdir: {outdir}")


if __name__ == "__main__":
    main(sys.argv[1:])
