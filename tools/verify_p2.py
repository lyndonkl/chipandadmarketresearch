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
    """Yield (claim, where) for every claim-shaped object in an era record.

    by_money_type_alt is a SIBLING of by_money_type carrying the same era's
    split on a second, declared taxonomy (era 5's directory seam). Its claims
    are real calibrated claims and must be validated, verdict-covered and
    duplicate-checked exactly like the native ones.
    """
    for fk, fv in era.get("fields", {}).items():
        if not isinstance(fv, dict):
            continue
        for c in fv.get("claims", []):
            yield c, fk
        for split_key in ("by_money_type", "by_money_type_alt"):
            for mk, mv in (fv.get(split_key) or {}).items():
                if mv and not is_absence(mv):
                    yield mv, f"{fk}.{split_key}.{mk}"
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

def _schema_validate(path, era, inv):
    """Validate a record against the real JSON Schema when jsonschema is installed.

    The field-by-field checks below are a proxy that predates this; this makes the
    invariant's wording ("validates against the era-record schema") literally true.
    A missing jsonschema library is itself a violation — a silently skipped check
    is how a proxy starts masking things.
    """
    schema_path = P2 / "planning" / "schema" / "era-record.schema.json"
    try:
        import jsonschema
    except ImportError:
        bad(inv, "jsonschema not installed — cannot validate against the era-record schema "
                 "(pip install jsonschema)", path)
        return
    schema = load(schema_path)
    if schema is None:
        return
    validator = jsonschema.Draft7Validator(schema)
    for err in sorted(validator.iter_errors(era), key=lambda e: list(e.path)):
        loc = "/".join(str(p) for p in err.path) or "<root>"
        bad(inv, f"schema violation at {loc}: {err.message[:200]}", path)


def r1_records():
    for n, path in enumerate(ERA_FILES, 1):
        era = load(path)
        if era is None:
            continue
        _schema_validate(path, era, "r1-acq-01")
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


def _assembled_totals(ds):
    """Year -> assembled US total, in millions USD.

    Only whole-market totals count. A year can carry several rows with
    medium='total' — one per money type (national_brand, local_retail, ...)
    plus the true total — and the money-type rows sum TO the total. Selecting
    on medium alone would silently compare against a subset depending on row
    order, so money_type must be absent.
    """
    totals = {}
    for sk in ("benchmarks_pre1919", "coen_mce", "magna"):
        for p in ds.get("series", {}).get(sk, {}).get("points", []):
            if str(p.get("medium", "")).lower() not in ("total", "all", "none", ""):
                continue
            if p.get("money_type") not in (None, "all"):
                continue
            totals.setdefault(p.get("year"), p.get("value"))
    return totals


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
    cross = ds.get("cross_checks", []) or []
    if not cross:
        bad("r2-val-02", "cross_checks empty", "adspend.json")
    for x in cross:
        d = x.get("divergence_pct")
        if isinstance(d, (int, float)) and abs(d) > 15 and not x.get("flagged"):
            bad("r2-val-02", f"IRS divergence {d}% in {x.get('year')} not flagged", "adspend.json")
    # COVERAGE: the invariant requires a cross-check for EVERY year where the
    # cross-check series overlaps an assembled total. Auditing only the entries
    # that happen to exist lets a missing year hide a tolerance breach.
    totals = _assembled_totals(ds)
    covered = {x.get("year") for x in cross}
    for p in ds.get("series", {}).get("irs_soi", {}).get("points", []):
        year = p.get("year")
        if year in totals and year not in covered:
            div = (p.get("value") - totals[year]) / totals[year] * 100 if totals[year] else float("nan")
            bad("r2-val-02",
                f"irs_soi overlaps an assembled total in {year} but no cross_checks entry exists "
                f"(would be {div:+.1f}%)", "adspend.json")
    fc = load(P2 / "data" / "forecasts.json")
    if fc is not None:
        for f in fc.get("forecasts", []):
            if not f.get("panelists") or len(f.get("panelists", [])) < 3:
                bad("r2-val-02", f"forecast '{f.get('id', '?')}' has under 3 panelists", "forecasts.json")
            if "variance" not in f or "median" not in f:
                bad("r2-val-02", f"forecast '{f.get('id', '?')}' missing median or variance", "forecasts.json")


# Units that mean a claim is NOT a US dollar total, so comparing a dollar
# figure against it is a category error rather than a finding.
_NON_TOTAL_UNIT = re.compile(r"percent|%|share|change|revision|ratio|per\s|index", re.I)
_NON_US = re.compile(r"world|global", re.I)
_CURRENCY = re.compile(r"usd|dollar|us\$", re.I)
# "of total" / "% of total" are share constructions, not totals.
_SHARE_PHRASE = re.compile(r"(of|%\s*of|share of)\s+total", re.I)


def _claim_scale_to_musd(unit):
    """Return the multiplier taking a claim's unit to millions USD, or None if
    the claim is not a US-dollar total (percent, share, world, unknown scale)."""
    if not unit:
        return None
    if _NON_TOTAL_UNIT.search(unit) or _NON_US.search(unit) or not _CURRENCY.search(unit):
        return None
    if re.search(r"billion", unit, re.I):
        return 1000.0
    if re.search(r"million", unit, re.I):
        return 1.0
    return None


def r2_reconcile():
    """Compare era SCALE dollar totals against assembled dataset totals.

    Compares like with like: only US-dollar TOTAL claims, normalised to
    millions USD. Percent, share, year-on-year-change and world-spend claims
    are skipped, because a dollar total is not comparable to them. The claim's
    own ci80 is the tolerance.

    The year comes from `about_year`, the FACT year. It used to come from
    `as_of`, which is PROVENANCE - the date the source published or was
    retrieved. Under schema v3 those are different questions and differ by up
    to 86 years, so parsing as_of here compared a claim against a dataset total
    for the wrong year, or (more often) matched no year at all and silently
    compared nothing while still reporting PASS. See asof-audit.md cross-check
    cc-05; the `compared == 0` guard below is what stops that being silent.
    """
    ds = _adspend()
    if ds is None:
        return
    totals = _assembled_totals(ds)
    compared = 0
    for path in ERA_FILES:
        era = load(path)
        if era is None:
            continue
        for c in (era.get("fields", {}).get("SCALE") or {}).get("claims", []):
            st = c.get("statement", "")
            scale = _claim_scale_to_musd(c.get("unit"))
            if scale is None:
                continue
            if not re.search(r"\btotal\b", st, re.I) or _SHARE_PHRASE.search(st):
                continue
            year = c.get("about_year")
            if not isinstance(year, int) or isinstance(year, bool):
                continue
            ci = c.get("ci80")
            if year not in totals or not (isinstance(ci, list) and len(ci) == 2):
                continue
            lo, hi = ci[0] * scale, ci[1] * scale
            compared += 1
            if not (lo <= totals[year] <= hi):
                bad("r2-rdy-01",
                    f"dataset total {totals[year]} MUSD for {year} outside claim {c.get('id')} "
                    f"ci80 [{lo}, {hi}] MUSD (claim unit: {c.get('unit')})", path)
    if compared == 0:
        bad("r2-rdy-01", "no era SCALE dollar-total claim could be compared to the dataset — "
                         "the reconciliation check is vacuous", "adspend.json")


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
    # Claims minted by a stage that ran AFTER R3 cannot carry an R3 verdict.
    # They must be declared, so the exemption is explicit rather than assumed.
    post_r3 = set(vd.get("post_r3_claims") or [])
    for cid in sorted(ids - set(entries) - post_r3):
        bad("r3-acq-01", f"claim {cid} has no verdict", "verdicts.json")
    for cid in sorted(post_r3 - ids):
        bad("r3-acq-01", f"'{cid}' is declared post-R3 but does not exist in the records",
            "verdicts.json")
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


def _dataset_object_ids(ds):
    """IDs of non-claim dataset objects a verdict may legitimately target.

    The dataset verifier attacks more than calibrated claims: concordance
    entries, series metadata and individual series points. Those carry
    'kind:key' ids rather than the claim-ID convention.
    """
    ids = set()
    if not ds:
        return ids
    for c in ds.get("concordance", []):
        if c.get("id"):
            ids.add(f"concordance:{c['id']}")
    for sk, sv in ds.get("series", {}).items():
        ids.add(f"stitch:{sk}")
        ids.add(f"series:{sk}")
        for p in sv.get("points", []):
            ids.add(f"{sk}:{p.get('year')}")
            ids.add(f"{sk.replace('_', '-')}:{p.get('year')}")
    for key in ("bridge", "cross_checks", "reconciliation"):
        ids.add(key)
    return ids


# Fields whose values can be compared mechanically between a verdict delta and
# the record. Everything else in a delta is prose, provenance or a directive.
_COMPARABLE_FIELDS = ("central", "ci80", "grade", "unit")


def _current_claims():
    """Claim ID -> the claim object as it now stands in the records/dataset."""
    cur = {}
    for path in ERA_FILES:
        era = load(path)
        if era is None:
            continue
        for c, _ in iter_claims(era):
            if c.get("id"):
                cur[c["id"]] = c
    ds = _adspend()
    if ds:
        for c in ds.get("claims", []):
            if c.get("id"):
                cur[c["id"]] = c
    return cur


def r3_verdicts():
    """Adjusted verdicts carry a DELTA in `new` (only the fields that changed).

    So validate the RESULT — the claim as it now stands in the record — rather
    than the delta in isolation. That is strictly stronger: it checks the
    adjustment was applied AND that what it produced is still rigor-valid.
    """
    vd = _verdicts()
    if vd is None:
        return
    live = _all_claim_ids()
    cur = _current_claims()
    dsobjs = _dataset_object_ids(_adspend())
    for v in vd.get("verdicts", []):
        cid = v.get("claim_id")
        if v.get("verdict") == "adjusted":
            for k in ("old", "new", "reason"):
                if k not in v:
                    bad("r3-val-01", f"adjusted claim {cid} missing '{k}'", "verdicts.json")
            if not isinstance(v.get("new"), dict) or not v["new"]:
                bad("r3-val-01", f"adjusted claim {cid} has an empty or non-object 'new'", "verdicts.json")
                continue
            if cid in dsobjs:
                continue  # dataset object, not a calibrated claim
            resulting = cur.get(cid)
            if resulting is None:
                bad("r3-val-01", f"adjusted claim {cid} is absent from the records", "verdicts.json")
                continue
            check_claim(resulting, "r3-val-01", f"post-adjustment:{cid}")
        if v.get("verdict") == "rejected" and cid in live:
            if not v.get("replaced_by"):
                bad("r3-val-01", f"rejected claim {cid} still present in records with no replacement", "verdicts.json")
                continue
            # A replaced_by string is not evidence the record changed. The
            # invariant forbids a rejected claim SURVIVING UNCHANGED, so compare
            # the record against what the verdict rejected.
            old, now = v.get("old"), cur.get(cid)
            if isinstance(old, dict) and isinstance(now, dict):
                same = all(now.get(k) == old.get(k) for k in ("statement", "central")
                           if k in old)
                if same and any(k in old for k in ("statement", "central")):
                    bad("r3-val-01", f"rejected claim {cid} survives unchanged in the records "
                                     f"despite a replaced_by entry", "verdicts.json")


def _resolve_dataset_object(cid):
    """Resolve a 'kind:key' verdict target to the live object in adspend.json."""
    ds = _adspend()
    if ds is None or ":" not in cid:
        return None
    kind, _, key = cid.partition(":")
    if kind == "concordance":
        for c in ds.get("concordance", []):
            if c.get("id") == key:
                return c
        return None
    if kind in ("stitch", "series"):
        return ds.get("series", {}).get(key)
    series = ds.get("series", {}).get(kind) or ds.get("series", {}).get(kind.replace("-", "_"))
    if series and key.isdigit():
        for p in series.get("points", []):
            if p.get("year") == int(key):
                return p
    return None


def _dig(obj, dotted):
    for part in dotted.split("."):
        if not isinstance(obj, dict) or part not in obj:
            return None, False
        obj = obj[part]
    return obj, True


def _check_dataset_object_applied(cid, v):
    """Adjusted concordance entries, series metadata and points are part of
    'the records reflect all adjustments' too — they were previously skipped."""
    obj = _resolve_dataset_object(cid)
    if obj is None:
        bad("r3-rdy-01", f"adjusted dataset object {cid} does not resolve in adspend.json", "verdicts.json")
        return
    for key, want in (v.get("new") or {}).items():
        if key.endswith(("_note", "_fragment", "_action")) or key in (
            "sources", "sources_note", "statement", "method", "note"
        ):
            continue  # prose or provenance: not mechanically comparable, same
            # rule the claim path applies via _COMPARABLE_FIELDS
        if "." in key:
            got, found = _dig(obj, key)
        else:
            # Values live top-level on some objects and nested on others: a
            # series point keeps its calibration under "calibration", a
            # concordance entry keeps its numbers under "magnitude".
            got, found = obj.get(key), key in obj
            if not found:
                for container in ("calibration", "magnitude"):
                    sub = obj.get(container)
                    if isinstance(sub, dict) and key in sub:
                        got, found = sub[key], True
                        break
        if not found:
            # dotted paths may target a sibling object (e.g. series.X.known_breaks)
            if "." in key:
                continue
            # A series-level adjustment (e.g. regrading a whole series) lands on
            # its points, not on the series metadata object.
            pts = obj.get("points") if isinstance(obj, dict) else None
            if isinstance(pts, list) and pts:
                vals = {(p.get("calibration") or {}).get(key, p.get(key)) for p in pts}
                if vals == {want}:
                    continue
                bad("r3-rdy-01", f"dataset object {cid}: series-level {key}={sorted(map(str, vals))} "
                                 f"does not match adjusted {want!r} across its points", "verdicts.json")
                continue
            bad("r3-rdy-01", f"dataset object {cid}: adjusted key '{key}' absent from the object", "verdicts.json")
            continue
        if isinstance(want, (int, float)) and isinstance(got, (int, float)):
            if abs(float(got) - float(want)) > 1e-9:
                bad("r3-rdy-01", f"dataset object {cid}: {key}={got} does not match adjusted {want}", "verdicts.json")
        elif got != want:
            bad("r3-rdy-01", f"dataset object {cid}: {key}={got!r} does not match adjusted {want!r}", "verdicts.json")


def _check_supersession(cid, sup, cur):
    """A supersession must be documented AND true.

    A superseded_by block ends the mechanical comparison against the R3 delta,
    so before this it was enough to assert one. That is how a verdict file ends
    up certifying a value the record does not hold (R3c finding XC-4, five
    claims). The block's `<stage>_applied` dict is the GOVERNING value, so it is
    now compared against the live record exactly as an adjustment would be.
    """
    if not (sup.get("stage") and sup.get("reason") and sup.get("audit_trail")):
        bad("r3-rdy-01", f"claim {cid}: superseded_by lacks stage, reason or audit_trail — "
                         f"supersession must be documented, not asserted", "verdicts.json")
    applied = next((v for k, v in sup.items()
                    if k.endswith("_applied") and isinstance(v, dict)), None)
    if applied is None:
        bad("r3-rdy-01", f"claim {cid}: superseded_by names no governing value "
                         f"(expected a '<stage>_applied' object)", "verdicts.json")
        return
    if cur is None:
        return  # dataset object or absent claim: handled elsewhere
    for key in _COMPARABLE_FIELDS + ("statement", "method", "as_of", "about_year"):
        if key not in applied:
            continue
        want, got = applied[key], cur.get(key)
        if isinstance(want, (int, float)) and isinstance(got, (int, float)):
            if abs(float(got) - float(want)) > 1e-9:
                bad("r3-rdy-01", f"claim {cid}: supersession says the governing {key} is {want} "
                                 f"but the record holds {got}", "verdicts.json")
        elif got != want:
            bad("r3-rdy-01", f"claim {cid}: supersession says the governing {key} is "
                             f"{str(want)[:80]!r} but the record holds {str(got)[:80]!r}",
                "verdicts.json")


def r3_applied():
    """Every field the verdict changed must actually be changed in the record.

    `new` is a delta, so compare only the keys it carries. A key present in the
    delta but unchanged in the record means the adjustment was never applied.
    """
    vd = _verdicts()
    if vd is None:
        return
    current = _current_claims()
    dsobjs = _dataset_object_ids(_adspend())
    superseded = 0
    for v in vd.get("verdicts", []):
        if v.get("verdict") != "adjusted" or not isinstance(v.get("new"), dict):
            continue
        cid = v.get("claim_id")
        # A later stage may legitimately re-derive a claim. The R3 record stays
        # unedited; the annotation says the newer value governs. Without this the
        # check goes permanently red, and a permanently red check stops being read.
        if v.get("superseded_by"):
            superseded += 1
            _check_supersession(cid, v["superseded_by"], current.get(cid))
            continue
        if cid in dsobjs:
            _check_dataset_object_applied(cid, v)
            continue
        cur = current.get(cid)
        if cur is None:
            bad("r3-rdy-01", f"adjusted claim {cid} not found in records", "verdicts.json")
            continue
        for key in _COMPARABLE_FIELDS:
            if key not in v["new"]:
                continue
            want, got = v["new"][key], cur.get(key)
            if isinstance(want, (int, float)) and isinstance(got, (int, float)):
                if abs(float(got) - float(want)) > 1e-9:
                    bad("r3-rdy-01", f"claim {cid}: record {key}={got} does not match adjusted {key}={want}", "verdicts.json")
            elif got != want:
                bad("r3-rdy-01", f"claim {cid}: record {key}={got} does not match adjusted {key}={want}", "verdicts.json")
        # as_of is schema-constrained; a verdict proposing a non-ISO value is a
        # finding in the verdict, not an unapplied adjustment.
        if "as_of" in v["new"]:
            want = str(v["new"]["as_of"])
            if not DATE_RE.match(want):
                bad("r3-rdy-01", f"claim {cid}: verdict proposes a schema-invalid as_of '{want}' "
                                 f"(ranges belong in statement/method)", "verdicts.json")
            elif str(cur.get("as_of")) != want:
                bad("r3-rdy-01", f"claim {cid}: record as_of={cur.get('as_of')} does not match adjusted as_of={want}", "verdicts.json")


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

def r4_simparams():
    """Cross-validate simulator expected_output values.

    These are the numbers the built simulator will be asserted against, so an
    error here silently becomes a "correct" simulator hitting wrong targets.
    r4-arithmetic walks mechanism.json only and never reaches them.
    """
    sp = load(P2 / "data" / "simulator-params.json")
    m = load(P2 / "data" / "mechanism.json")
    if sp is None or m is None:
        return
    # Collect example ids present in mechanism.json.
    ex_ids = set()

    def collect(node):
        if isinstance(node, dict):
            if node.get("id"):
                ex_ids.add(str(node["id"]))
            for v in node.values():
                collect(v)
        elif isinstance(node, list):
            for v in node:
                collect(v)

    collect(m)
    scenarios = sp.get("scenarios", [])
    if not scenarios:
        bad("r4-rdy-01", "simulator-params.json carries no scenarios", "simulator-params.json")
        return
    for s in scenarios:
        sid = s.get("id", "?")
        # example_ref may name several examples, comma-separated.
        for ref in (r.strip() for r in str(s.get("example_ref") or "").split(",") if r.strip()):
            if ref not in ex_ids:
                bad("r4-rdy-01", f"scenario {sid}: example_ref '{ref}' does not resolve in mechanism.json",
                    "simulator-params.json")
        eo = s.get("expected_output")
        if not isinstance(eo, dict):
            bad("r4-rdy-01", f"scenario {sid}: expected_output is not an object", "simulator-params.json")
            continue
        clicks, prices = eo.get("clicks"), eo.get("prices_usd")
        total, avg = eo.get("total_clicks"), eo.get("avg_price_per_click_usd")
        if isinstance(clicks, list) and isinstance(total, (int, float)):
            got = sum(c for c in clicks if isinstance(c, (int, float)))
            if abs(got - total) > 1e-6:
                bad("r4-rdy-01", f"scenario {sid}: total_clicks={total} but clicks sum to {got}",
                    "simulator-params.json")
        if (isinstance(clicks, list) and isinstance(prices, list)
                and isinstance(avg, (int, float)) and isinstance(total, (int, float)) and total):
            paid = sum(p * c for p, c in zip(prices, clicks)
                       if isinstance(p, (int, float)) and isinstance(c, (int, float)))
            if abs(paid / total - avg) > 1e-4:
                bad("r4-rdy-01", f"scenario {sid}: avg_price_per_click={avg} but "
                                 f"sum(price*clicks)/total_clicks={paid / total:.6f}",
                    "simulator-params.json")


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


def _num_forms(x):
    """Plausible written forms of a number, including unit-scaled ones.

    A central of 0.022 is written "2.2 cents"; 0.74 may appear as "74". Adjusted
    claims must not keep the superseded figure in their prose.
    """
    # Exact representations only, at the original and unit-scaled magnitudes.
    # Rounded variants (0.56 -> "0.6") were tried and collide with unrelated
    # numbers in prose — a bid of $0.60, a 0.6% ratio — producing false hits.
    forms = set()
    for v in (x, x * 100, x * 1000):
        s = f"{v:g}"
        if s.endswith(".0"):
            s = s[:-2]
        forms.add(s)
    # Two significant characters minimum: a bare "5" matches far too much.
    return {f for f in forms if len(f.replace(".", "").lstrip("-0")) >= 2}


def r5_stale_prose():
    """A claim's statement must not still quote a value R3 superseded.

    Nothing else checks statement prose against the claim's own central, so an
    adjusted number could be corrected in the value and left stale in the text —
    and chapters quote the text.
    """
    vd = _verdicts()
    if vd is None:
        return
    cur = _current_claims()
    for v in vd.get("verdicts", []):
        if v.get("verdict") != "adjusted":
            continue
        old, new = v.get("old") or {}, v.get("new") or {}
        if not isinstance(old, dict) or not isinstance(new, dict):
            continue
        o, n = old.get("central"), new.get("central")
        if not isinstance(o, (int, float)) or not isinstance(n, (int, float)) or o == n:
            continue
        claim = cur.get(v.get("claim_id"))
        if not claim:
            continue
        stmt = str(claim.get("statement", ""))
        # A statement that also states the NEW value is discussing both on
        # purpose — a contested date, two rival measures — not carrying a stale
        # figure. Only flag when the superseded value appears alone.
        if any(re.search(rf"(?<![\d.]){re.escape(f)}(?![\d])", stmt)
               for f in _num_forms(float(n))):
            continue
        stale = _num_forms(float(o)) - _num_forms(float(n))
        for form in sorted(stale, key=len, reverse=True):
            if re.search(rf"(?<![\d.]){re.escape(form)}(?![\d])", stmt):
                bad("r5-val-03", f"claim {v['claim_id']}: statement still quotes the superseded "
                                 f"value '{form}' (central was adjusted {o} -> {n})", "claims")
                break


def r5_chapter_stale():
    """Chapter prose must not quote a value R3 superseded.

    r5-traceability proves a chapter's cited claim IDs exist; it never reads the
    numbers in the prose. A chapter can therefore cite the right claim and print
    the pre-adjustment figure — which is exactly what happened to chapter 07's
    per-query revenue and gross margin.
    """
    vd = _verdicts()
    if vd is None:
        return
    superseded = {}
    for v in vd.get("verdicts", []):
        if v.get("verdict") != "adjusted":
            continue
        o = (v.get("old") or {}).get("central")
        n = (v.get("new") or {}).get("central")
        if isinstance(o, (int, float)) and isinstance(n, (int, float)) and o != n:
            superseded[v["claim_id"]] = (float(o), float(n))
    for fname in CHAPTERS:
        path = P2 / "research" / fname
        if not path.exists():
            continue
        fm = _frontmatter(path)
        if not fm or "claim_ids" not in fm:
            continue
        text = path.read_text()
        body = text[text.find("\n---", 3) + 4:] if text.startswith("---") else text
        cited = [x.strip() for x in fm["claim_ids"].strip("[]").split(",") if x.strip()]
        for cid in cited:
            if cid not in superseded:
                continue
            o, n = superseded[cid]
            new_forms, old_forms = _num_forms(n), _num_forms(o)
            for form in sorted(old_forms - new_forms, key=len, reverse=True):
                if not re.search(rf"(?<![\d.]){re.escape(form)}(?![\d])", body):
                    continue
                # Present alongside the new value: the chapter is contrasting
                # them (a correction it states on purpose), not quoting a stale one.
                if any(re.search(rf"(?<![\d.]){re.escape(f)}(?![\d])", body) for f in new_forms):
                    continue
                bad("r5-val-03", f"{fname} cites {cid} but its prose quotes the superseded "
                                 f"value '{form}' (central adjusted {o} -> {n})", path)
                break


# ---------- P1 ----------

YEAR_TOKEN = re.compile(r"(?<!\d)(1[5-9]\d{2}|20[0-4]\d)(?!\d)")
DECADE_TOKEN = re.compile(r"(?<!\d)(1[5-9]\d0|20[0-4]0)s")
SEASON_RANGE = re.compile(r"(?<!\d)(1[5-9]\d{2}|20[0-4]\d)\s*[-–/]\s*(\d{2})(?![\d.%])")
RECORD_FILES = ERA_FILES + [P2 / "data" / "mechanism.json", P2 / "data" / "adspend.json"]


def _content_years(text):
    """The years a claim's own text asserts.

    Two extraction rules, both of which changed answers in the P1 audit:
    a decade phrase is NOT a year ("the 1970s" must not resolve to 1970), and
    season/cycle forms expand ("1988-89" and "FY1993" are years a word-boundary
    scan misses). Range expansion is capped at ten years so that "$2,306 million
    in 1975 - 43.8%" cannot silently produce a year 1943.
    """
    t = DECADE_TOKEN.sub(" ", str(text or ""))
    years = {int(m.group(1)) for m in YEAR_TOKEN.finditer(t)}
    for m in SEASON_RANGE.finditer(t):
        start = int(m.group(1))
        end = int(m.group(1)[:2] + m.group(2))
        if end <= start:
            end += 100
        if 0 < end - start <= 10:
            years.add(end)
    return years


def _iter_claim_objects(node, where):
    """Every claim-shaped object anywhere in a record, at any nesting depth.

    iter_claims() knows the era-record shape only. mechanism.json hangs claims
    off arbitrary engine nodes, so a shape-aware walk would miss them - and
    missing claims is precisely how a timeline gate goes quietly vacuous.
    """
    if isinstance(node, dict):
        if isinstance(node.get("id"), str) and CLAIM_ID_RE.match(node["id"]) and "statement" in node:
            yield node, where
        for k, v in node.items():
            yield from _iter_claim_objects(v, where)
    elif isinstance(node, list):
        for v in node:
            yield from _iter_claim_objects(v, where)


def p1_timeline():
    """p1-timeline: every claim resolves to exactly ONE unambiguous year.

    `as_of` is PROVENANCE - when the source published, filed or was retrieved -
    and never belongs on a time axis. `about_year` is the FACT year and is the
    only field a chart may read (schema v3). Before the split, 60 of 505 claims
    would have been plotted at their source's publication date, the worst of
    them 86 years out. This check enforces the split as data:

      1. every claim carries one integer about_year in range;
      2. about_span, where present, is a well-formed band containing about_year;
      3. timeline_ready false withholds permission to draw, and must say why;
      4. an about_year contradicting every year in the claim's own statement and
         unit must carry an about_year_note giving the reason - a timeline year
         may disagree with the claim's text, but never silently;
      5. the mirrored copies of a claim (era record, mechanism, adspend, and
         claims.json) must agree on about_year, about_span and timeline_ready.

    Coverage is written to stderr and a vacuity guard fires if either the scan
    or the content cross-examination reaches nothing.
    """
    scanned = 0            # claim objects validated
    unique = set()         # distinct claim ids reached
    cross_examined = 0     # claims whose text carried a year to test about_year against
    contradicting = 0      # of those, the ones about_year disagrees with
    mirrored = 0           # claims compared between a record file and claims.json

    canon = {}
    for path in RECORD_FILES:
        rec = load(path)
        if rec is None:
            continue
        for c, where in _iter_claim_objects(rec, path.name):
            cid = c.get("id", "?")
            scanned += 1
            unique.add(cid)
            ay = c.get("about_year")
            if not isinstance(ay, int) or isinstance(ay, bool):
                bad("p1-rdy-01", f"claim {cid} has no integer about_year — it cannot be placed on "
                                 f"a timeline, and as_of must not be used instead", where)
                continue
            if not (1500 <= ay <= 2100):
                bad("p1-rdy-01", f"claim {cid}: about_year {ay} is outside 1500-2100", where)
            span = c.get("about_span")
            if span is not None:
                if (not isinstance(span, list) or len(span) != 2
                        or not all(isinstance(x, int) and not isinstance(x, bool) for x in span)):
                    bad("p1-rdy-01", f"claim {cid}: about_span {span!r} is not [start, end] "
                                     f"integers", where)
                else:
                    if span[0] > span[1]:
                        bad("p1-rdy-01", f"claim {cid}: about_span {span} runs backwards", where)
                    elif not (span[0] <= ay <= span[1]):
                        bad("p1-rdy-01", f"claim {cid}: about_year {ay} sits outside its own "
                                         f"about_span {span} — the anchor must be inside the band",
                            where)
            ready = c.get("timeline_ready", True)
            if not isinstance(ready, bool):
                bad("p1-rdy-01", f"claim {cid}: timeline_ready {ready!r} is not a boolean", where)
            elif ready is False and not str(c.get("about_year_note") or "").strip():
                bad("p1-rdy-01", f"claim {cid} is timeline_ready:false with no about_year_note — "
                                 f"a claim withheld from the timeline must say what has to be read",
                    where)
            years = _content_years(c.get("statement")) | _content_years(c.get("unit"))
            if years:
                cross_examined += 1
                if ay not in years:
                    contradicting += 1
                    if not str(c.get("about_year_note") or "").strip():
                        bad("p1-rdy-01",
                            f"claim {cid}: about_year {ay} contradicts every year in its own text "
                            f"{sorted(years)} and carries no about_year_note explaining why",
                            where)
            prev = canon.get(cid)
            now = (ay, tuple(span) if isinstance(span, list) else None, ready)
            if prev is None:
                canon[cid] = now
            elif prev != now:
                bad("p1-rdy-01", f"claim {cid}: two copies in the records disagree on its timeline "
                                 f"placement, {prev} against {now}", where)

    cl = load(P2 / "data" / "claims.json")
    for c in (cl or {}).get("claims", []):
        cid = c.get("id", "?")
        ay, span = c.get("about_year"), c.get("about_span")
        ready = c.get("timeline_ready", True)
        if not isinstance(ay, int) or isinstance(ay, bool):
            bad("p1-rdy-01", f"claim {cid} in claims.json has no integer about_year", "claims.json")
            continue
        want = canon.get(cid)
        if want is None:
            bad("p1-rdy-01", f"claim {cid} is in claims.json but in no record file — its "
                             f"timeline placement cannot be traced to a source record", "claims.json")
            continue
        mirrored += 1
        now = (ay, tuple(span) if isinstance(span, list) else None, ready)
        if want != now:
            bad("p1-rdy-01", f"claim {cid}: claims.json places it at {now} but its record file "
                             f"places it at {want}", "claims.json")

    print(f"p1-timeline: {scanned} claim objects scanned across {len(RECORD_FILES)} record files "
          f"({len(unique)} distinct ids), {mirrored} mirrored against claims.json, "
          f"{cross_examined} cross-examined against the years in their own text "
          f"({contradicting} of those disagree and must carry a documented reason)",
          file=sys.stderr)
    if scanned == 0:
        bad("p1-rdy-01", "no claim objects were reached — the timeline gate is vacuous", "records")
    if cross_examined == 0:
        bad("p1-rdy-01", "no claim's about_year could be cross-examined against its own text — "
                         "the contradiction half of the gate is vacuous", "records")
    if mirrored == 0:
        bad("p1-rdy-01", "claims.json was never compared against the record files — "
                         "the mirror half of the gate is vacuous", "claims.json")


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
    "r4-simparams": r4_simparams,
    "r5-files": r5_files, "r5-traceability": r5_traceability, "r5-claimsfile": r5_claimsfile,
    "r5-stale-prose": r5_stale_prose,
    "r5-chapter-stale": r5_chapter_stale,
    "p1-timeline": p1_timeline,
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
