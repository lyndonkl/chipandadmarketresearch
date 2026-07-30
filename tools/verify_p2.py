#!/usr/bin/env python3
"""Deterministic invariant checks for the P2 research pipeline.

Called by the stage contracts in p2-ad-market/planning/contracts/*.json.
Each subcommand prints one JSON violation per line to stdout and exits
non-zero if any violation was found. No output + exit 0 = invariant holds.

Some checks are deterministic PROXIES for a richer invariant; each proxy is
marked with a PROXY comment and backed by a judgment check in the contract.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
P2 = ROOT / "p2-ad-market"
ERA_FILES = [P2 / "data" / "eras" / f"era-{n}.json" for n in range(1, 8)]
FIELD_KEYS = ["CREATORS", "BUYERS", "SELLERS", "MEDIUM", "SCALE", "PRICING", "MEASUREMENT", "TARGETING"]
MONEY_KEYS = ["national_brand", "local_retail", "classified", "direct_response"]
SERIES_KEYS = ["coen_mce", "magna", "iab_pwc", "irs_soi", "benchmarks_pre1919"]
CLAIM_ID_RE = re.compile(r"^(e[1-7]|ds|mech)-[a-z_]+-[0-9]{3}$")
DATE_RE = re.compile(r"^[0-9]{4}(-[0-9]{2})?(-[0-9]{2})?$")
PODCAST_RE = re.compile(r"acquired|stratechery", re.I)
FREEZE = "2026-06-30"

violations = []


def bad(inv, msg, artifact=""):
    violations.append({"invariant": inv, "violation": msg, "artifact": str(artifact)})


def load(path):
    try:
        return json.loads(Path(path).read_text())
    except FileNotFoundError:
        bad("missing-artifact", "file does not exist", path)
    except json.JSONDecodeError as e:
        bad("unparseable-artifact", f"invalid JSON: {e}", path)
    return None


def is_absence(obj):
    return isinstance(obj, dict) and obj.get("absent") is True and obj.get("note")


def check_claim(c, inv, where, seen_ids=None):
    if not isinstance(c, dict):
        bad(inv, "claim is not an object", where)
        return
    for k in ["id", "statement", "central", "unit", "ci80", "grade", "sources", "as_of"]:
        if k not in c:
            bad(inv, f"claim missing '{k}'", f"{where}:{c.get('id', '?')}")
    cid = c.get("id", "")
    if cid and not CLAIM_ID_RE.match(cid):
        bad(inv, f"claim id '{cid}' violates the ID convention", where)
    if seen_ids is not None and cid:
        if cid in seen_ids:
            bad(inv, f"duplicate claim id '{cid}'", where)
        seen_ids.add(cid)
    ci = c.get("ci80")
    if isinstance(ci, list) and len(ci) == 2 and isinstance(c.get("central"), (int, float)):
        if not (ci[0] <= c["central"] <= ci[1]):
            bad(inv, f"central {c['central']} outside ci80 {ci}", f"{where}:{cid}")
        if ci[0] > ci[1]:
            bad(inv, f"ci80 lower bound above upper bound {ci}", f"{where}:{cid}")
    if c.get("grade") not in ("A", "B", "C"):
        bad(inv, f"grade '{c.get('grade')}' not in A/B/C", f"{where}:{cid}")
    if c.get("grade") == "C" and not c.get("method"):
        bad(inv, "grade-C claim missing 'method'", f"{where}:{cid}")
    if not c.get("sources"):
        bad(inv, "claim has no sources", f"{where}:{cid}")
    if c.get("as_of") and not DATE_RE.match(str(c["as_of"])):
        bad(inv, f"as_of '{c['as_of']}' not ISO-shaped", f"{where}:{cid}")


def iter_claims(era):
    """Yield (claim, where) for every claim-shaped object in an era record."""
    for fk, fv in era.get("fields", {}).items():
        if not isinstance(fv, dict):
            continue
        for c in fv.get("claims", []):
            yield c, fk
        for mk, mv in (fv.get("by_money_type") or {}).items():
            if mv and not is_absence(mv):
                yield mv, f"{fk}.by_money_type.{mk}"
    for ev in era.get("events", []):
        if isinstance(ev, dict) and ev.get("claim"):
            yield ev["claim"], "events"
    ue = era.get("unit_economics") or {}
    for k in ["revenue_per_unit", "cost_to_serve", "margin"]:
        v = ue.get(k)
        if v and not is_absence(v):
            yield v, f"unit_economics.{k}"
    for c in ue.get("comparison_series", []) or []:
        yield c, "unit_economics.comparison_series"


# ---------- R1 ----------

def r1_records():
    for n, path in enumerate(ERA_FILES, 1):
        era = load(path)
        if era is None:
            continue
        fields = era.get("fields", {})
        for fk in FIELD_KEYS:
            fv = fields.get(fk)
            if not fv:
                bad("r1-acq-01", f"field {fk} missing or empty", path)
                continue
            if len(fv.get("summary", "")) < 200:
                bad("r1-acq-01", f"field {fk} summary under 200 chars", path)
        for holder in ("SCALE", "BUYERS"):
            split = (fields.get(holder) or {}).get("by_money_type") or {}
            for mk in MONEY_KEYS:
                v = split.get(mk)
                if v is None:
                    bad("r1-acq-01", f"{holder}.by_money_type.{mk} missing", path)
                elif not is_absence(v) and not isinstance(v, dict):
                    bad("r1-acq-01", f"{holder}.by_money_type.{mk} is neither claim nor absence note", path)
        events = era.get("events", [])
        if not (5 <= len(events) <= 10):
            bad("r1-acq-01", f"{len(events)} events (need 5-10)", path)
        for ev in events:
            if not DATE_RE.match(str(ev.get("date", ""))):
                bad("r1-acq-01", f"event '{ev.get('title', '?')}' has no ISO date", path)
        if n >= 5 and not era.get("unit_economics"):
            bad("r1-acq-01", "unit_economics missing (required for eras 5-7)", path)


def r1_claims():
    seen = set()
    for path in ERA_FILES:
        era = load(path)
        if era is None:
            continue
        for c, where in iter_claims(era):
            check_claim(c, "r1-val-01", f"{path.name}/{where}", seen)


def r1_hygiene():
    for path in ERA_FILES:
        era = load(path)
        if era is None:
            continue
        for c, where in iter_claims(era):
            for s in c.get("sources", []):
                blob = f"{s.get('name', '')} {s.get('url', '')}"
                if PODCAST_RE.search(blob):
                    bad("r1-val-02", f"claim {c.get('id')} cites an inspiring podcast", path)
    # PROXY: era-1 SCALE must hold benchmark-year estimates, not an annual series.
    # We cap SCALE claim count at 12; a real annual series would need far more.
    era1 = load(ERA_FILES[0])
    if era1:
        n = len((era1.get("fields", {}).get("SCALE") or {}).get("claims", []))
        if n > 12:
            bad("r1-val-02", f"era-1 SCALE has {n} claims — looks like an annual series, not benchmarks", ERA_FILES[0])


# ---------- R2 ----------

def _adspend():
    return load(P2 / "data" / "adspend.json")


def r2_series():
    ds = _adspend()
    if ds is None:
        return
    series = ds.get("series", {})
    for sk in SERIES_KEYS:
        sv = series.get(sk)
        if not sv:
            bad("r2-acq-01", f"series '{sk}' missing", "adspend.json")
            continue
        cov = sv.get("coverage")
        if not (isinstance(cov, list) and len(cov) == 2):
            bad("r2-acq-01", f"series '{sk}' has no declared coverage window", "adspend.json")
        for p in sv.get("points", []):
            if p.get("source_series", sk) != sk:
                bad("r2-acq-01", f"point tagged '{p.get('source_series')}' inside series '{sk}'", "adspend.json")
            if "year" not in p or "value" not in p:
                bad("r2-acq-01", f"point in '{sk}' missing year or value", "adspend.json")


def r2_concordance():
    ds = _adspend()
    if ds is None:
        return
    conc = ds.get("concordance", [])
    pairs_covered = set()
    for e in conc:
        a, b = e.get("series_a"), e.get("series_b")
        if not (a and b and e.get("note")):
            bad("r2-val-01", "concordance entry missing series_a/series_b/note", "adspend.json")
        if "magnitude" not in e:
            bad("r2-val-01", f"concordance {a}~{b} has no magnitude", "adspend.json")
        pairs_covered.add(frozenset((a, b)))
    occupancy = {}
    for sk, sv in ds.get("series", {}).items():
        for p in sv.get("points", []):
            occupancy.setdefault((p.get("year"), p.get("medium")), set()).add(sk)
    for (year, medium), ss in occupancy.items():
        if len(ss) > 1:
            for a in ss:
                for b in ss:
                    if a < b and frozenset((a, b)) not in pairs_covered:
                        bad("r2-val-01", f"series {a} and {b} both cover {year}/{medium} with no concordance entry", "adspend.json")
    bridge = ds.get("bridge")
    if not bridge:
        bad("r2-val-01", "bridge object missing", "adspend.json")
    else:
        for k in ("window", "method", "arithmetic"):
            if not bridge.get(k):
                bad("r2-val-01", f"bridge missing '{k}'", "adspend.json")
    for sk, sv in ds.get("series", {}).items():
        for p in sv.get("points", []):
            if p.get("bridged") and (p.get("calibration") or {}).get("grade") != "C":
                bad("r2-val-01", f"bridged point {sk}/{p.get('year')} not graded C", "adspend.json")


def r2_checks():
    ds = _adspend()
    if ds is None:
        return
    for x in ds.get("cross_checks", []) or [{}]:
        if not x:
            bad("r2-val-02", "cross_checks empty", "adspend.json")
            break
        d = x.get("divergence_pct")
        if isinstance(d, (int, float)) and abs(d) > 15 and not x.get("flagged"):
            bad("r2-val-02", f"IRS divergence {d}% in {x.get('year')} not flagged", "adspend.json")
    fc = load(P2 / "data" / "forecasts.json")
    if fc is not None:
        for f in fc.get("forecasts", []):
            if not f.get("panelists") or len(f.get("panelists", [])) < 3:
                bad("r2-val-02", f"forecast '{f.get('id', '?')}' has under 3 panelists", "forecasts.json")
            if "variance" not in f or "median" not in f:
                bad("r2-val-02", f"forecast '{f.get('id', '?')}' missing median or variance", "forecasts.json")


def r2_reconcile():
    # PROXY: compare era SCALE totals to assembled dataset totals where both
    # exist for the same year; the claim's own ci80 is the tolerance.
    ds = _adspend()
    if ds is None:
        return
    totals = {}
    for sk in ("coen_mce", "magna"):
        for p in ds.get("series", {}).get(sk, {}).get("points", []):
            if p.get("medium") in (None, "total", "all"):
                totals.setdefault(p.get("year"), p.get("value"))
    for path in ERA_FILES:
        era = load(path)
        if era is None:
            continue
        for c in (era.get("fields", {}).get("SCALE") or {}).get("claims", []):
            st = c.get("statement", "").lower()
            m = re.match(r"^(\d{4})", str(c.get("as_of", "")))
            if "total" in st and m:
                year = int(m.group(1))
                if year in totals and isinstance(c.get("ci80"), list) and len(c["ci80"]) == 2:
                    lo, hi = c["ci80"]
                    if not (lo <= totals[year] <= hi):
                        bad("r2-rdy-01", f"dataset total {totals[year]} for {year} outside claim {c.get('id')} ci80 [{lo}, {hi}]", path)


def r2_freeze():
    # PROXY: annual points for 2026+ belong in forecasts.json, not adspend.json.
    ds = _adspend()
    if ds is None:
        return
    for sk, sv in ds.get("series", {}).items():
        for p in sv.get("points", []):
            y = p.get("year")
            if isinstance(y, int) and y > 2025:
                bad("r2-rdy-02", f"sourced point for {y} in series '{sk}' — post-freeze years live in forecasts.json", "adspend.json")
            asof = (p.get("calibration") or {}).get("as_of", "")
            if str(asof) > FREEZE:
                bad("r2-rdy-02", f"point {sk}/{y} has as_of {asof} past the freeze date {FREEZE}", "adspend.json")


# ---------- R3 ----------

def _all_claim_ids():
    ids = set()
    for path in ERA_FILES:
        era = load(path)
        if era is None:
            continue
        for c, _ in iter_claims(era):
            if c.get("id"):
                ids.add(c["id"])
    ds = _adspend()
    if ds:
        for c in ds.get("claims", []):
            if c.get("id"):
                ids.add(c["id"])
    return ids


def _verdicts():
    return load(P2 / "data" / "verification" / "verdicts.json")


def r3_coverage():
    vd = _verdicts()
    if vd is None:
        return
    entries = {v.get("claim_id"): v for v in vd.get("verdicts", [])}
    ids = _all_claim_ids()
    for cid in sorted(ids - set(entries)):
        bad("r3-acq-01", f"claim {cid} has no verdict", "verdicts.json")
    for cid, v in entries.items():
        if v.get("verdict") not in ("confirmed", "adjusted", "rejected", "unverified"):
            bad("r3-acq-01", f"claim {cid} has invalid verdict '{v.get('verdict')}'", "verdicts.json")
        if v.get("verdict") == "unverified":
            bad("r3-acq-01", f"claim {cid} left unverified", "verdicts.json")
    counts = {}
    for v in vd.get("verdicts", []):
        counts[v.get("claim_id")] = counts.get(v.get("claim_id"), 0) + 1
    for cid, n in counts.items():
        if n > 1:
            bad("r3-acq-01", f"claim {cid} has {n} verdicts", "verdicts.json")


def r3_verdicts():
    vd = _verdicts()
    if vd is None:
        return
    live = _all_claim_ids()
    for v in vd.get("verdicts", []):
        cid = v.get("claim_id")
        if v.get("verdict") == "adjusted":
            for k in ("old", "new", "reason"):
                if k not in v:
                    bad("r3-val-01", f"adjusted claim {cid} missing '{k}'", "verdicts.json")
            if isinstance(v.get("new"), dict):
                check_claim(v["new"], "r3-val-01", f"verdicts.json:{cid}")
        if v.get("verdict") == "rejected" and cid in live and not v.get("replaced_by"):
            bad("r3-val-01", f"rejected claim {cid} still present in records with no replacement", "verdicts.json")


def r3_applied():
    vd = _verdicts()
    if vd is None:
        return
    current = {}
    for path in ERA_FILES:
        era = load(path)
        if era is None:
            continue
        for c, _ in iter_claims(era):
            if c.get("id"):
                current[c["id"]] = c
    for v in vd.get("verdicts", []):
        if v.get("verdict") == "adjusted" and isinstance(v.get("new"), dict):
            cid = v.get("claim_id")
            cur = current.get(cid)
            if cur and cur.get("central") != v["new"].get("central"):
                bad("r3-rdy-01", f"claim {cid}: record central {cur.get('central')} does not match adjusted value {v['new'].get('central')}", "verdicts.json")


# ---------- R4 ----------

def r4_coverage():
    m = load(P2 / "data" / "mechanism.json")
    if m is None:
        return
    eng = m.get("engines", {})
    auction = eng.get("auction", {})
    for k in ("pure_bid", "gsp", "first_price_shading"):
        if k not in auction.get("designs", {}):
            bad("r4-acq-01", f"auction design '{k}' missing", "mechanism.json")
    for k in ("gsp_not_truthful", "rgsp_coda"):
        if k not in auction.get("demonstrations", {}):
            bad("r4-acq-01", f"auction demonstration '{k}' missing", "mechanism.json")
    dist = eng.get("distribution", {})
    for k in ("aol_2002", "tac_series", "network_share", "default_payments", "mehta_findings"):
        if not dist.get(k):
            bad("r4-acq-01", f"distribution component '{k}' missing or empty", "mechanism.json")


SAFE_EXPR = re.compile(r"^[0-9eE\.\+\-\*/\(\)\s%,_]+$")


def r4_arithmetic():
    m = load(P2 / "data" / "mechanism.json")
    if m is None:
        return

    def walk(node, path="mechanism"):
        if isinstance(node, dict):
            steps = node.get("steps")
            if isinstance(steps, list):
                for i, s in enumerate(steps):
                    expr, expected = s.get("expr"), s.get("expected")
                    if expr is None or expected is None:
                        bad("r4-val-01", f"step {i} at {path} missing expr or expected", "mechanism.json")
                        continue
                    if not SAFE_EXPR.match(expr):
                        bad("r4-val-01", f"step {i} at {path} has a non-arithmetic expr", "mechanism.json")
                        continue
                    try:
                        got = eval(expr, {"__builtins__": {}}, {})  # arithmetic only, regex-gated
                    except Exception as e:
                        bad("r4-val-01", f"step {i} at {path} does not evaluate: {e}", "mechanism.json")
                        continue
                    if abs(got - expected) > max(1e-6, abs(expected) * 1e-6):
                        bad("r4-val-01", f"step {i} at {path}: expr = {got}, stored expected = {expected}", "mechanism.json")
            for k, v in node.items():
                walk(v, f"{path}.{k}")
        elif isinstance(node, list):
            for i, v in enumerate(node):
                walk(v, f"{path}[{i}]")

    walk(m)


def r4_claims():
    m = load(P2 / "data" / "mechanism.json")
    if m is None:
        return

    def walk(node, path="mechanism"):
        if isinstance(node, dict):
            if "calibration" in node:
                if node.get("illustrative"):
                    bad("r4-val-02", f"{path} is illustrative yet carries a calibration object", "mechanism.json")
                else:
                    check_claim(node["calibration"], "r4-val-02", f"mechanism.json:{path}")
            for k, v in node.items():
                walk(v, f"{path}.{k}")
        elif isinstance(node, list):
            for i, v in enumerate(node):
                walk(v, f"{path}[{i}]")

    walk(m)


# ---------- R5 ----------

CHAPTERS = [
    "01-thesis.md", "02-the-middlemen.md", "03-sponsorship.md", "04-the-spot-market.md",
    "05-segmentation.md", "06-the-impression.md", "07-the-auction.md",
    "08-the-machine-market.md", "09-the-capture-question.md", "10-verdict-and-handoff.md",
]


def _frontmatter(path):
    text = Path(path).read_text()
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end < 0:
        return None
    fm = {}
    for line in text[3:end].splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            fm[k.strip()] = v.strip()
    return fm


def r5_files():
    for f in CHAPTERS:
        if not (P2 / "research" / f).exists():
            bad("r5-acq-01", "chapter missing", f"p2-ad-market/research/{f}")
    if not (P2 / "planning" / "thread-candidates.md").exists():
        bad("r5-acq-01", "thread-candidates.md missing", "p2-ad-market/planning/thread-candidates.md")


def r5_traceability():
    claims = load(P2 / "data" / "claims.json")
    if claims is None:
        return
    known = {c.get("id") for c in claims.get("claims", [])}
    vd = _verdicts() or {}
    rejected = {v.get("claim_id") for v in vd.get("verdicts", []) if v.get("verdict") == "rejected"}
    for f in CHAPTERS:
        path = P2 / "research" / f
        if not path.exists():
            continue
        fm = _frontmatter(path)
        if fm is None or "claim_ids" not in fm:
            bad("r5-val-02", "chapter frontmatter missing claim_ids", path)
            continue
        ids = [x.strip() for x in fm["claim_ids"].strip("[]").split(",") if x.strip()]
        if not ids:
            bad("r5-val-02", "chapter lists no claim_ids", path)
        for cid in ids:
            if cid not in known:
                bad("r5-val-02", f"chapter cites unknown claim {cid}", path)
            if cid in rejected:
                bad("r5-val-02", f"chapter cites REJECTED claim {cid}", path)


def r5_claimsfile():
    claims = load(P2 / "data" / "claims.json")
    if claims is None:
        return
    seen = set()
    for c in claims.get("claims", []):
        check_claim(c, "r5-rdy-01", "claims.json", seen)


COMMANDS = {
    "r1-records": r1_records, "r1-claims": r1_claims, "r1-hygiene": r1_hygiene,
    "r2-series": r2_series, "r2-concordance": r2_concordance, "r2-checks": r2_checks,
    "r2-reconcile": r2_reconcile, "r2-freeze": r2_freeze,
    "r3-coverage": r3_coverage, "r3-verdicts": r3_verdicts, "r3-applied": r3_applied,
    "r4-coverage": r4_coverage, "r4-arithmetic": r4_arithmetic, "r4-claims": r4_claims,
    "r5-files": r5_files, "r5-traceability": r5_traceability, "r5-claimsfile": r5_claimsfile,
}


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in COMMANDS:
        print(f"usage: verify_p2.py <{'|'.join(COMMANDS)}>", file=sys.stderr)
        return 2
    COMMANDS[sys.argv[1]]()
    for v in violations:
        print(json.dumps(v))
    return 1 if violations else 0


if __name__ == "__main__":
    sys.exit(main())
