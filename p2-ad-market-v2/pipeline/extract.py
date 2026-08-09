#!/usr/bin/env python3.12
"""
L0 extraction harness — CALIBRATION build.

Runs ONE Ollama call per unit (claim or prose unit) against gpt-oss:120b, using the
prompt template at pipeline/extraction_prompt.txt (which must contain the token {UNIT}
exactly once). Parses the line-based pipe output, applies light DETERMINISTIC REPAIR
(logged, never a silent fix), and writes a rich per-unit calibration record so a human
can read exactly what the model saw, what it returned, and what was repaired.

This is the calibration harness: it withholds the calibrated number (central/ci80/grade
are never sent to the model), it does NOT touch Neo4j, and it does NOT attach values.
Value attachment and loading belong to the L0 workflow, after the prompt is approved.

Usage:
    python3.12 extract.py                      # runs calibration/curated-10.json
    python3.12 extract.py e1-creators-001 ...  # runs the given ids
    python3.12 extract.py --all-prose          # (not used in calibration)

Requires only the Python 3.12 standard library.
"""
from __future__ import annotations
import json, re, sys, time, urllib.request, urllib.error, os

REPO = "/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch"
FROZEN = os.path.join(REPO, "p2-ad-market")
V2 = os.path.join(REPO, "p2-ad-market-v2")

OLLAMA = "http://localhost:11434/api/generate"
MODEL = "gpt-oss:120b"
KEEP_ALIVE = "30m"          # keep the 65GB model resident between the 10 calls
TEMPERATURE = 0.1           # extraction wants determinism, not creativity
NUM_CTX = 32768           # room for a ~7k-token prompt plus long reasoning on dense prose

PROMPT_TEMPLATE = os.path.join(V2, "pipeline", "extraction_prompt.txt")
CURATED = os.path.join(V2, "calibration", "curated-10.json")
OUT_DIR = os.path.join(V2, "calibration")

ERA_NAMES = {
    1: "The Middlemen (1840s-1917)", 2: "Sponsorship (1918-1949)",
    3: "The Spot Market (1950-1971)", 4: "Segmentation (1972-1994)",
    5: "The Impression (1995-2000)", 6: "The Auction (2000-2009)",
    7: "The Machine Market (2010-2026)",
}

# --------------------------------------------------------------------------- #
# Corpus loading + unit resolution
# --------------------------------------------------------------------------- #
def load_corpus():
    claims = {c["id"]: c for c in json.load(open(os.path.join(FROZEN, "data", "claims.json")))["claims"]}
    eras = {}
    for n in range(1, 8):
        eras[n] = json.load(open(os.path.join(FROZEN, "data", "eras", f"era-{n}.json")))
    return claims, eras


TU_FIELD = re.compile(r"^tu:era:(\d+):field:([A-Z_]+)$")
TU_EVENT = re.compile(r"^tu:era:(\d+):event:(\d+)$")
TU_BOUND = re.compile(r"^tu:era:(\d+):boundary$")


def resolve_unit(uid: str, claims: dict, eras: dict) -> dict:
    """Return {id, kind, text, unit, about_year, era} for any unit id.

    NOTE the calibrated number is deliberately NOT included — the model never sees it.
    """
    if uid in claims:
        c = claims[uid]
        return {
            "id": uid, "kind": "claim", "text": c["statement"],
            "unit": c.get("unit"), "about_year": c.get("about_year"),
            "era": _era_of_claim(uid),
        }
    m = TU_FIELD.match(uid)
    if m:
        n, field = int(m.group(1)), m.group(2)
        return {"id": uid, "kind": f"prose:field:{field}", "text": eras[n]["fields"][field]["summary"],
                "unit": None, "about_year": None, "era": n}
    m = TU_EVENT.match(uid)
    if m:
        n, i = int(m.group(1)), int(m.group(2))
        ev = eras[n]["events"][i]
        return {"id": uid, "kind": "prose:event", "text": ev["desc"],
                "unit": None, "about_year": _year_of(ev.get("date")), "era": n}
    m = TU_BOUND.match(uid)
    if m:
        n = int(m.group(1))
        return {"id": uid, "kind": "prose:boundary", "text": eras[n]["boundary_notes"],
                "unit": None, "about_year": None, "era": n}
    raise KeyError(f"cannot resolve unit id: {uid}")


def _era_of_claim(uid: str):
    m = re.match(r"^e(\d+)-", uid)
    return int(m.group(1)) if m else None


def _year_of(date_str):
    if not date_str:
        return None
    m = re.match(r"(\d{4})", str(date_str))
    return int(m.group(1)) if m else None


# --------------------------------------------------------------------------- #
# Prompt assembly + Ollama call
# --------------------------------------------------------------------------- #
def build_unit_block(u: dict) -> str:
    lines = [f"ID: {u['id']}", f"KIND: {u['kind']}", f"ERA: {u['era']} — {ERA_NAMES.get(u['era'], 'unknown')}"]
    if u.get("about_year") is not None:
        lines.append(f"ABOUT_YEAR: {u['about_year']}")
    if u.get("unit"):
        lines.append(f"UNIT_OF_MEASURE: {u['unit']}")
    label = "STATEMENT" if u["kind"] == "claim" else "TEXT"
    lines.append(f"{label}:")
    lines.append(u["text"].strip())
    return "\n".join(lines)


def fill_prompt(template: str, u: dict) -> str:
    if "{UNIT}" not in template:
        raise ValueError("prompt template is missing the {UNIT} token")
    return template.replace("{UNIT}", build_unit_block(u))


def call_ollama(prompt: str) -> dict:
    body = json.dumps({
        "model": MODEL, "prompt": prompt, "stream": False,
        "keep_alive": KEEP_ALIVE,
        "options": {"temperature": TEMPERATURE, "num_ctx": NUM_CTX},
    }).encode()
    req = urllib.request.Request(OLLAMA, data=body, headers={"Content-Type": "application/json"})
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=600) as r:
        data = json.load(r)
    data["_elapsed_s"] = round(time.time() - t0, 1)
    return data


# --------------------------------------------------------------------------- #
# Parse + deterministic repair
# --------------------------------------------------------------------------- #
YEAR_ONLY = re.compile(r"^\s*(?:c\.?\s*|circa\s*|~)?\d{3,4}s?\s*$", re.I)


def parse_and_repair(raw: str):
    """Parse NODE|/EDGE| lines. Return (nodes, edges, repairs). Repairs are logged,
    never silent. Calibration keeps repair light so the human sees the true output."""
    nodes, edges, repairs = {}, [], []
    for ln in raw.splitlines():
        s = ln.strip()
        if not (s.startswith("NODE|") or s.startswith("EDGE|")):
            continue
        parts = [p.strip() for p in s.split("|")]
        if parts[0] == "NODE":
            if len(parts) < 3:
                repairs.append({"kind": "malformed_node", "line": s})
                continue
            name = parts[1]
            typ = parts[2] if len(parts) >= 3 and parts[2] else "(untyped)"
            clause = parts[3] if len(parts) >= 4 else ""
            if not parts[2]:
                repairs.append({"kind": "missing_type_promoted_untyped", "line": s})
            if YEAR_ONLY.match(name):
                repairs.append({"kind": "year_node_dropped", "name": name, "line": s})
                continue
            nodes[name] = {"name": name, "type": typ, "clause": clause}
        else:  # EDGE
            if len(parts) < 4:
                repairs.append({"kind": "malformed_edge", "line": s})
                continue
            frm, typ, to = parts[1], parts[2], parts[3]
            clause = parts[4] if len(parts) >= 5 else ""
            dropped = False
            for endpoint in (frm, to):
                if YEAR_ONLY.match(endpoint):
                    repairs.append({"kind": "edge_to_year_dropped", "endpoint": endpoint, "line": s})
                    dropped = True
            if dropped:
                continue
            for endpoint in (frm, to):
                if endpoint not in nodes:
                    nodes[endpoint] = {"name": endpoint, "type": "(promoted)", "clause": ""}
                    repairs.append({"kind": "undeclared_endpoint_promoted", "endpoint": endpoint, "line": s})
            if len(typ.split()) > 4 or len(typ.split("_")) > 4:
                repairs.append({"kind": "long_relation_type_kept", "type": typ, "line": s})
            edges.append({"from": frm, "type": typ, "to": to, "clause": clause})
    return list(nodes.values()), edges, repairs


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main(argv):
    claims, eras = load_corpus()
    template = open(PROMPT_TEMPLATE).read()

    if argv:
        ids = argv
    else:
        ids = [row["id"] for row in json.load(open(CURATED))]

    records, md = [], []
    md.append("# L0 extraction — calibration run\n")
    md.append(f"Model: `{MODEL}`  ·  temperature {TEMPERATURE}  ·  {len(ids)} units\n")
    for uid in ids:
        u = resolve_unit(uid, claims, eras)
        prompt = fill_prompt(template, u)
        print(f"→ {uid} ({u['kind']}) …", flush=True)
        try:
            resp = call_ollama(prompt)
            raw = resp.get("response", "") or ""
        except (urllib.error.URLError, TimeoutError) as e:
            raw = ""
            resp = {"_error": str(e), "_elapsed_s": None}
            print(f"  ! error: {e}", flush=True)
        nodes, edges, repairs = parse_and_repair(raw)
        rec = {"id": uid, "kind": u["kind"], "about_year": u.get("about_year"),
               "unit": u.get("unit"), "text": u["text"],
               "elapsed_s": resp.get("_elapsed_s"),
               "nodes": nodes, "edges": edges, "repairs": repairs, "raw": raw}
        records.append(rec)
        # markdown view
        md.append(f"\n---\n\n## {uid}  ·  {u['kind']}  ·  {rec['elapsed_s']}s\n")
        md.append(f"**Unit sent** (number withheld): {u['text'][:400]}{'…' if len(u['text'])>400 else ''}\n")
        md.append(f"**Nodes ({len(nodes)}):**\n")
        for n in nodes:
            md.append(f"- `{n['type']}` — **{n['name']}**" + (f"  _({n['clause']})_" if n['clause'] else ""))
        md.append(f"\n**Edges ({len(edges)}):**\n")
        for e in edges:
            md.append(f"- **{e['from']}** —`{e['type']}`→ **{e['to']}**" + (f"  _({e['clause']})_" if e['clause'] else ""))
        if repairs:
            md.append(f"\n**Repairs ({len(repairs)}):**\n")
            for r in repairs:
                md.append(f"- {r['kind']}: `{r.get('line', r.get('name', r.get('endpoint','')))}`")
        else:
            md.append("\n**Repairs:** none\n")

    os.makedirs(OUT_DIR, exist_ok=True)
    json.dump(records, open(os.path.join(OUT_DIR, "calibration-run.json"), "w"), indent=1)
    open(os.path.join(OUT_DIR, "calibration-run.md"), "w").write("\n".join(md))
    tot_n = sum(len(r["nodes"]) for r in records)
    tot_e = sum(len(r["edges"]) for r in records)
    tot_r = sum(len(r["repairs"]) for r in records)
    print(f"\nDone. {len(records)} units · {tot_n} nodes · {tot_e} edges · {tot_r} repairs")
    print(f"  {os.path.join(OUT_DIR, 'calibration-run.md')}")
    print(f"  {os.path.join(OUT_DIR, 'calibration-run.json')}")


if __name__ == "__main__":
    main(sys.argv[1:])
