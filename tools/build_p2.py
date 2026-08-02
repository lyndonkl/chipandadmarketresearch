#!/usr/bin/env python3
"""Build the P2 experience — docs/p2/index.html — from the ten chapters and the frozen data.

    python3 tools/build_p2.py            # build, and fail loudly on any untraceable number
    python3 tools/build_p2.py --report   # build and print the full figure ledger

WHAT THIS SCRIPT IS FOR, AND WHY THE CHECKING LIVES HERE.

Every guarantee in `docs/p2/lib/`, `charts/`, `eras/`, `auction/`, `door/` and `toll/` fires at one
call site. Each of those READMEs closes with the same sentence: *nothing scans the built page*.
That is the widest limit in the project, and this file is where it is closed. The page is assembled
here, so the page is scanned here — the built HTML's own text, after rendering, not the markdown
that went in.

The gate B7 was set is one line: **every number the page renders traces to a claim id, and no
figure is hard-coded anywhere.** It runs in four movements:

  1. Every reader-facing string this script writes goes through ONE function, `emit()`. There is no
     second way to put text on the page. (Thirteen strings on one auction panel once carried a
     false claim past every green guard because they were written somewhere no check was looking.)
  2. `emit()` finds every figure in the string and resolves it against the frozen record. A figure
     that resolves carries its claim id into the HTML on a `data-claim` attribute, so the trace is
     in the artifact rather than in this script's memory.
  3. A figure that resolves to nothing is a build failure. There is no warning level.
  4. The built page is then read back, its tags stripped, and every figure in the resulting text is
     matched against the ledger `emit()` kept. A number that reached the page by any other route
     fails the build. This is the check that makes movements 1 to 3 worth anything.

Every refusal above has a self-test in PART 8 that feeds it the thing it forbids and requires it to
throw. A check that cannot fire is worse than no check; this project has paid for that lesson six
times and the last time it was a shipped guard whose condition was unsatisfiable by construction.
"""

import html
import json
import pathlib
import re
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "p2-ad-market" / "data"
RESEARCH = ROOT / "p2-ad-market" / "research"
P2 = ROOT / "docs" / "p2"
OUT = P2 / "index.html"

VERBOSE = "--report" in sys.argv


class BuildError(Exception):
    """The build refused to emit a page. Every message names the fix."""


class VacuousError(BuildError):
    """A check lost its grounding, or a rule in this file stopped matching anything.

    Named after `GuardVacuousError` in `docs/p2/lib/guards.js`, for the same reason: a check that
    quietly starts passing everything is the failure mode this class exists to make loud.
    """


def die(where, message, fix):
    raise BuildError(f"{where}: {message}\n    fix: {fix}")


# ============================================================================
# PART 1 · THE RECORD
#
# The six frozen files a guard may read, the seven era records, and the verifier's verdicts.
# Nothing here is re-derived and nothing is summarised. `FREEZE.md` is explicit that a team briefed
# on a summary repeats the R3b failure at a larger scale.
# ============================================================================

FROZEN_FILES = {
    "claims": "claims.json",
    "adspend": "adspend.json",
    "reconciled": "moneytype/reconciled.json",
    "era5": "eras/era-5.json",
    "mechanism": "mechanism.json",
    "simulatorParams": "simulator-params.json",
}


def load_json(path):
    return json.loads((DATA / path).read_text())


FROZEN = {name: load_json(rel) for name, rel in FROZEN_FILES.items()}
ERA_RECORDS = [
    FROZEN["era5"] if era == 5 else load_json(f"eras/era-{era}.json")
    for era in range(1, 8)
]
VERDICTS = load_json("verification/verdicts.json")

CLAIMS = {c["id"]: c for c in FROZEN["claims"]["claims"]}
REJECTED = {
    v.get("claim_id")
    for v in VERDICTS.get("verdicts", [])
    if v.get("verdict") == "rejected"
}

for index, record in enumerate(ERA_RECORDS):
    if record.get("era") != index + 1:
        die("PART 1", f"era record {index} says era {record.get('era')}",
            "the seven records must be eras 1 to 7 in order; era-records.js asserts the same thing")


# ============================================================================
# PART 2 · THE FIGURE SCANNER
#
# What counts as a number on the page, and what does not.
#
# The scanner is `tools/verify_p2.py`'s, widened in two places the chapters need: a capital-B
# billions suffix ("$18.3B"), and a dollar figure written out in full against a record kept in
# millions ("$822,000" against 0.822). Both widenings were found by running this gate and reading
# what it refused — which is what a gate is for.
# ============================================================================

# A NUMBER MAY NOT END IN A COMMA.
# `\d[\d,]*` — the form `tools/verify_p2.py` uses — swallows the punctuation after a figure, so
# "Its best year was 1945, at 14.9%" scanned as the quantity "1945,". A comma inside the digits is
# a thousands separator; a comma after them is the sentence. The difference decided whether 1945
# was read as a date or as a measurement, and it was being read as a measurement.
FIGURE = re.compile(
    r"(?<![\w.$])(\$)?(\d(?:[\d,]*\d)?(?:\.\d+)?)\s*"
    r"(%|percent\b|cents?\b|billion\b|bn\b|B\b|million\b|[Mm]\b)?"
)

# A figure whose form says it is not a quantity. Each rule carries the sentence that says why, and
# each is REQUIRED to match something: a rule that stops firing is a rule that has quietly become a
# hole, so `assert_rules_fired()` refuses a build in which any of them matched nothing.
NON_QUANTITY = (
    ("claim-id", re.compile(r"\b(?:e[1-7]|ds|mech)-[a-z_]+-\d{3}\b"),
     "a claim id. Its digits are an address in claims.json, not a measurement."),
    ("url", re.compile(r"https?://\S+"),
     "a source locator. Every digit in it belongs to somebody else's filing system."),
    ("footnote-ref", re.compile(r"\[\^[^\]]+\]"),
     "a footnote marker. It numbers a note; it measures nothing."),
    ("law-report", re.compile(r"\b\d+\s+F\.\s*Supp\.\s*\d[a-z]*\s+\d+"),
     "a law report citation: volume, reporter, page."),
    ("working-paper", re.compile(r"\b(?:Working Paper|WP)\s+\d+[-–]\d+\b"),
     "a working-paper number, which is a shelf mark."),
    ("version", re.compile(r"\b(?:iOS|iPadOS|Android|GPT|v)-?\s?\d+(?:\.\d+)*\b"),
     "a software version. GPT-5.4 is a name that happens to contain a decimal point."),
    ("repo-path", re.compile(r"\b[\w./-]*[\w-]\.(?:json|md|py|js|html|css)\b"),
     "a path to a file in this repository. era-1.json is a filename; its 1 is not a measurement."),
    ("locator", re.compile(
        r"\b(?:pp?\.|Tables?|Figures?|Exhibits?|Items?|Parts?|Schedules?|No\.|Nos\.)\s*"
        r"\d+(?:[-–]\d+)?"),
     "a locator inside a source: a page, a table, an exhibit."),
)

RULE_FIRINGS = {name: 0 for name, _, _ in NON_QUANTITY}


def strip_non_quantity(text):
    """Blank every run of characters a documented rule says is not a quantity.

    Blanking rather than deleting, so every offset in the returned string still points at the same
    character of the original. The figure scanner runs on the result.
    """
    out = list(text)
    for name, pattern, _why in NON_QUANTITY:
        for match in pattern.finditer(text):
            RULE_FIRINGS[name] += 1
            for index in range(match.start(), match.end()):
                if out[index] != "\n":
                    out[index] = " "
    return "".join(out)


def assert_rules_fired():
    dead = [name for name, count in RULE_FIRINGS.items() if count == 0]
    if dead:
        raise VacuousError(
            "PART 2: these non-quantity rules matched nothing in the whole corpus: "
            f"{', '.join(dead)}.\n"
            "    fix: a rule that fires zero times is not protecting anything and will absorb a "
            "real figure the day the prose changes. Delete it, or find out why the form it names "
            "has left the chapters."
        )


def scan_figures(text):
    """Every figure in a string, with the values that would re-compute it.

    Each candidate is (value, tolerance), the tolerance being the precision the prose ITSELF
    printed at: "$0.91" claims two decimals, so a stored 0.9137 re-computes it and 0.92 does not.
    A unit word rescales the value and the tolerance together.
    """
    found = []
    scannable = strip_non_quantity(text)
    for match in FIGURE.finditer(scannable):
        dollar, raw, suffix = match.group(1), match.group(2), (match.group(3) or "")
        lowered = suffix.lower()
        try:
            base = float(raw.replace(",", ""))
        except ValueError:
            continue
        decimals = len(raw.split(".")[1]) if "." in raw else 0
        kind = "quantity"
        scales = [1.0]
        if lowered in ("%", "percent", "cent", "cents"):
            scales.append(0.01)
        elif lowered in ("billion", "bn", "b"):
            scales += [1e9, 1e3]
        elif lowered in ("million", "m"):
            scales += [1e6, 1e-3]
        elif dollar:
            scales += [1e-6]
        elif decimals == 0 and "," not in raw and 1500 <= base <= 2100:
            # A YEAR IS NEVER WRITTEN WITH A THOUSANDS SEPARATOR. "1,500 to 4,500" is the interval
            # on a claim about buyable audience segments; "1975" is a date. The comma is the whole
            # of the difference, and the first version of this scanner did not read it — so a
            # claim's own lower bound was classified as a date and never tested against the record.
            kind = "year"
        half = 0.5 * (10.0 ** -decimals)
        found.append({
            "start": match.start(),
            "end": match.end(),
            "token": match.group(0),
            "kind": kind,
            "value": base,
            "candidates": tuple((base * s, max(half * s, 1e-9)) for s in scales),
        })
    return found


# ============================================================================
# PART 3 · THE RESOLVER
#
# What a figure has to reach before this script will print it.
#
# The ladder is ordered, and the order is the point: a figure resolves to a CLAIM ID first, because
# that is what the gate asks for. Only where the record carries the number somewhere other than a
# claim — a stored arithmetic step, a spend series point, a simulator setting — does it fall
# through to a file-and-path citation, and the page says which.
# ============================================================================

NUMBER_IN_TEXT = re.compile(r"(?<![\w.])(\d(?:[\d,]*\d)?(?:\.\d+)?)")
# Reading the RECORD's own sentences, where a figure is often written against a letter: a method
# reading "grown to 1914 at the Census newspaper-receipts ratio x1.131" carries a number the
# stricter form above cannot see. Widening it here widens only what the page may RESOLVE TO; the
# scanner that decides what counts as a figure ON the page keeps the strict form.
NUMBER_IN_RECORD = re.compile(r"(?<![\d.])(\d(?:[\d,]*\d)?(?:\.\d+)?)")
URL_RE = re.compile(r"https?://\S+")
SAFE_EXPR = re.compile(r"^[\d\s.+\-*/()e]+$")


def numbers_in_prose(value):
    out = set()
    for match in NUMBER_IN_RECORD.finditer(URL_RE.sub(" ", value)):
        try:
            out.add(float(match.group(1).replace(",", "")))
        except ValueError:
            pass
    return out


def subexpression_values(expr):
    """Every value of every sub-expression of a stored arithmetic step.

    `mechanism.json` stores "0.04/0.05+0.01" as one step with one expected value. A chapter showing
    its working prints the intermediate too, and that intermediate is a value no stored `expected`
    holds. Walking the tree recovers it, so prose that spells a rule out step by step is checkable
    instead of exempt. Lifted from `tools/verify_p2.py`, which already had to solve this.
    """
    import ast

    out = set()
    if not isinstance(expr, str):
        return out
    normalised = expr.replace("**", "*")
    if not SAFE_EXPR.match(normalised):
        return out
    try:
        tree = ast.parse(expr, mode="eval")
    except SyntaxError:
        return out
    for node in ast.walk(tree):
        if not isinstance(node, (ast.BinOp, ast.UnaryOp, ast.Constant)):
            continue
        try:
            value = eval(compile(ast.Expression(node), "<expr>", "eval"),  # arithmetic only
                         {"__builtins__": {}}, {})
        except Exception:
            continue
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            out.add(float(value))
    return out


def numbers_under(node, out, inside_sources=False):
    if isinstance(node, dict):
        for key, value in node.items():
            if key == "expr" and isinstance(value, str):
                out |= subexpression_values(value)
            numbers_under(value, out, inside_sources or key in ("sources", "url"))
    elif isinstance(node, list):
        for value in node:
            numbers_under(value, out, inside_sources)
    elif isinstance(node, bool):
        pass
    elif isinstance(node, (int, float)):
        if not inside_sources:
            out.add(float(node))
    elif isinstance(node, str):
        if not inside_sources:
            out |= numbers_in_prose(node)


def claim_values(claim):
    """The numbers a chapter quotes when it quotes THIS claim: its central and its interval ends."""
    out = set()
    for value in [claim.get("central")] + list(claim.get("ci80") or []):
        if isinstance(value, (int, float)):
            out.add(float(value))
    return out


def claim_words(claim):
    """Numbers inside the claim's own sentences — its statement and its method.

    `FREEZE.md` warns that a secondary number inside a statement is not to be trusted as a reading.
    That is a warning about DRAWING one. Quoting one in prose is what a statement is for, and a
    chapter that quotes "$616m, grown to 1914 by a ratio of 1.131" is quoting the record's own
    working. The distinction is kept in the report: these resolve as `claim-words`, never as
    `claim-value`.
    """
    out = set()
    for key in ("statement", "method"):
        value = claim.get(key)
        if isinstance(value, str):
            out |= numbers_in_prose(value)
    return out


CLAIM_VALUES = {cid: claim_values(c) for cid, c in CLAIMS.items()}
CLAIM_WORDS = {cid: claim_words(c) for cid, c in CLAIMS.items()}

MECHANISM_NUMBERS = set()
numbers_under(FROZEN["mechanism"], MECHANISM_NUMBERS)
ADSPEND_NUMBERS = set()
numbers_under(FROZEN["adspend"], ADSPEND_NUMBERS)
SIMPARAMS_NUMBERS = set()
numbers_under(FROZEN["simulatorParams"], SIMPARAMS_NUMBERS)
RECONCILED_NUMBERS = set()
numbers_under(FROZEN["reconciled"], RECONCILED_NUMBERS)
ERA_NUMBERS = set()
numbers_under(ERA_RECORDS, ERA_NUMBERS)

# THE CENSUS OF THE RECORD ITSELF.
#
# A chapter that says "our dataset holds 1,573 points" is quoting a fact about the record rather
# than a measurement of the market, and no claim carries it. So the build COUNTS, here, and the
# figure resolves against the count it just made. A number re-derived at build time cannot go
# stale the way a number typed into prose does: add a series to adspend.json and this either
# still agrees with the chapter or stops the build.
def _census():
    adspend = FROZEN["adspend"]
    points = sum(len(s.get("points") or []) for s in adspend.get("series", {}).values())
    scenarios = FROZEN["simulatorParams"].get("scenarios") or {}
    steps = set()
    def count_steps(node, out):
        if isinstance(node, dict):
            if isinstance(node.get("steps"), list):
                out.append(len(node["steps"]))
            for value in node.values():
                count_steps(value, out)
        elif isinstance(node, list):
            for value in node:
                count_steps(value, out)
    step_counts = []
    count_steps(FROZEN["mechanism"], step_counts)
    return {
        float(points): f"adspend.json holds {points} points",
        float(len(adspend.get("series", {}))): f"adspend.json holds {len(adspend.get('series', {}))} named series",
        float(len(CLAIMS)): f"claims.json holds {len(CLAIMS)} claims",
        float(len(ERA_RECORDS)): f"the record carries {len(ERA_RECORDS)} era files",
        float(len(scenarios) if isinstance(scenarios, (list, dict)) else 0):
            f"simulator-params.json holds {len(scenarios)} scenarios",
        float(sum(step_counts)): f"mechanism.json holds {sum(step_counts)} machine-checkable steps",
    }


RECORD_CENSUS = _census()

RECORD_WORLDS = (
    ("mechanism.json", MECHANISM_NUMBERS),
    ("adspend.json", ADSPEND_NUMBERS),
    ("simulator-params.json", SIMPARAMS_NUMBERS),
    ("moneytype/reconciled.json", RECONCILED_NUMBERS),
    ("eras/era-1..7.json", ERA_NUMBERS),
)

# Every year the record places a fact in. A date on the page is checked against this rather than
# waved through: a year is not a quantity, but it is still a number a reader will believe.
RECORD_YEARS = set()
for _claim in CLAIMS.values():
    if isinstance(_claim.get("about_year"), int):
        RECORD_YEARS.add(_claim["about_year"])
    for _y in _claim.get("about_span") or []:
        if isinstance(_y, int):
            RECORD_YEARS.add(_y)
for _key, _series in FROZEN["adspend"].get("series", {}).items():
    for _point in _series.get("points", []) or []:
        if isinstance(_point.get("year"), int):
            RECORD_YEARS.add(_point["year"])
for _y in sorted(RECORD_YEARS):
    pass
# A range the record covers reads continuously to a reader: 1918 is a year even where no claim
# happens to sit on it. The floor and ceiling come from the record, never from a literal here.
YEAR_FLOOR, YEAR_CEILING = min(RECORD_YEARS), max(RECORD_YEARS)


def reaches(candidates, world):
    return any(abs(value - target) <= tolerance
               for target, tolerance in candidates for value in world)


def resolve_figure(figure, claim_ids):
    """Where this figure comes from, or None.

    `claim_ids` is the chapter's own frontmatter list. A figure resolving only OUTSIDE it is a
    citation the chapter does not carry, and the caller treats that as a failure rather than a
    pass — the chapter would then be printing a number it never cites.
    """
    if figure["kind"] == "year":
        year = int(figure["value"])
        if YEAR_FLOOR <= year <= YEAR_CEILING:
            return {"class": "year", "cite": "the record's own year range",
                    "detail": f"{YEAR_FLOOR}–{YEAR_CEILING}"}
        return None
    for cid in claim_ids:
        if reaches(figure["candidates"], CLAIM_VALUES.get(cid, ())):
            return {"class": "claim-value", "cite": cid,
                    "detail": CLAIMS[cid].get("unit", "")}
    for cid in claim_ids:
        if reaches(figure["candidates"], CLAIM_WORDS.get(cid, ())):
            return {"class": "claim-words", "cite": cid,
                    "detail": "quoted from the claim's own statement or method"}
    for name, world in RECORD_WORLDS:
        if reaches(figure["candidates"], world):
            return {"class": "record", "cite": name, "detail": "a frozen record this page reads"}
    for value, sentence in RECORD_CENSUS.items():
        if reaches(figure["candidates"], (value,)):
            return {"class": "census", "cite": "the record, counted at build time",
                    "detail": sentence}
    return None


# ============================================================================
# PART 4 · THE ONE PLACE TEXT REACHES THE PAGE
#
# `emit()` is the only function in this file that turns a string into HTML. Everything a reader can
# read goes through it: chapter prose, headings, table cells, the page's own furniture, every
# caption this script writes. There is no second route, and PART 9 proves it by reading the built
# page back.
# ============================================================================

LEDGER = []          # every figure emitted, with what it resolved to
UNRESOLVED = []      # every figure that resolved to nothing — a non-empty list fails the build


def esc(text):
    return html.escape(str(text), quote=True)


def emit(text, claim_ids=(), where="page furniture"):
    """Escape a string, wrap every figure in it with the claim it traces to, and record the trace.

    A figure that resolves to nothing is not dropped, not warned about and not printed. It is
    recorded in UNRESOLVED, and UNRESOLVED being non-empty is what stops the build.
    """
    figures = scan_figures(text)
    out = []
    cursor = 0
    for figure in figures:
        out.append(esc(text[cursor:figure["start"]]))
        resolved = resolve_figure(figure, claim_ids)
        token = esc(figure["token"])
        entry = {"where": where, "token": figure["token"], "kind": figure["kind"],
                 "resolved": resolved}
        LEDGER.append(entry)
        if resolved is None:
            UNRESOLVED.append(entry)
            out.append(token)
        elif resolved["class"] in ("claim-value", "claim-words"):
            out.append(
                f'<span class="p2-fig p2-num" data-claim="{esc(resolved["cite"])}" '
                f'title="{esc(resolved["cite"])} · {esc(resolved["detail"])}">{token}</span>')
        elif resolved["class"] == "census":
            out.append(
                f'<span class="p2-fig p2-num" data-census="{esc(resolved["detail"])}" '
                f'title="{esc(resolved["detail"])}">{token}</span>')
        elif resolved["class"] == "record":
            out.append(
                f'<span class="p2-fig p2-num" data-record="{esc(resolved["cite"])}" '
                f'title="{esc(resolved["cite"])}">{token}</span>')
        else:
            out.append(f'<span class="p2-fig p2-date">{token}</span>')
        cursor = figure["end"]
    out.append(esc(text[cursor:]))
    return "".join(out)


def emit_derived(text, derivation, where="page furniture"):
    """A number this script worked out from the record rather than read out of it.

    The page furniture needs a few: a chapter's own ordinal, the count of chapters, the window the
    era records cover. None of them is a measurement and none of them is in claims.json, so none
    can resolve through PART 3. The answer is the one every component in this project already
    uses — `mintReading`'s `derivedFrom`, `checkProvenance`'s twelve-character rule: a figure the
    gate cannot check is one a reader can SEE is unchecked. The derivation goes into the HTML
    beside the number, and a blank or throwaway one is refused.
    """
    if not isinstance(derivation, str) or len(derivation.strip()) < 12:
        die("PART 4", f"a derived figure was emitted with no derivation: {text!r}",
            "write the sentence that says where the number came from; 'maths' is not one")
    figures = scan_figures(text)
    if not figures:
        die("PART 4", f"emit_derived() was handed a string with no figure in it: {text!r}",
            "use emit_plain(); a derivation on nothing is a claim about nothing")
    # ONE ledger row per derived label, not one per digit in it. "1840s to 2026" is a single
    # reading with a single derivation, and counting it twice would leave the report's two totals
    # disagreeing with each other for a reason nobody could see.
    LEDGER.append({"where": where, "token": text, "kind": "derived",
                   "resolved": {"class": "derived", "cite": derivation, "detail": ""}})
    return (f'<span class="p2-fig p2-num" data-derived="{esc(derivation)}" '
            f'title="{esc(derivation)}">{esc(text)}</span>')


def emit_plain(text):
    """A string with no figure in it, checked rather than assumed.

    Used for page furniture that must not carry a number: a heading this script writes, a label, a
    button. If a figure ever appears in one, the build stops here rather than in PART 9 with a
    count that does not add up.
    """
    figures = [f for f in scan_figures(text)]
    if figures:
        die("PART 4",
            f"a string routed through emit_plain() carries a figure: {figures[0]['token']!r} in "
            f"{text[:80]!r}",
            "route it through emit() with the claim ids it comes from, or take the number out")
    return esc(text)


# ============================================================================
# PART 5 · THE CHAPTERS
#
# Frontmatter, the markdown the ten chapters actually use, and the two checks BUILD-PLAN.md sets on
# the pairing of the two: every id the frontmatter lists must exist, must not carry a rejected
# verdict, and must be USED by the prose. A silent mismatch between frontmatter and prose is how a
# stale citation survives a rewrite.
# ============================================================================

CHAPTER_FILES = [
    "01-thesis.md", "02-the-middlemen.md", "03-sponsorship.md", "04-the-spot-market.md",
    "05-segmentation.md", "06-the-impression.md", "07-the-auction.md",
    "08-the-machine-market.md", "09-the-capture-question.md", "10-verdict-and-handoff.md",
]

CLAIM_ID_RE = re.compile(r"\b(?:e[1-7]|ds|mech)-[a-z_]+-\d{3}\b")
YEAR_RE = re.compile(r"\b(1[89]\d\d|20\d\d)\b")


def read_chapter(filename):
    text = (RESEARCH / filename).read_text()
    if not text.startswith("---"):
        die("PART 5", f"{filename} has no frontmatter", "every chapter opens with a --- block")
    end = text.find("\n---", 3)
    head, body = text[3:end], text[end + 4:]
    meta = {}
    for line in head.splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()
    if "claim_ids" not in meta:
        die("PART 5", f"{filename} frontmatter has no claim_ids",
            "r5-traceability in tools/verify_p2.py requires it and so does this build")
    ids = [x.strip() for x in meta["claim_ids"].strip("[]").split(",") if x.strip()]
    # THE CHAPTER'S NUMBER COMES FROM ITS FILENAME, not from its frontmatter.
    # Three of the ten chapters carry no `chapter:` key at all, and the first version of this
    # reader defaulted those to zero — so chapters 3 and 8 lost their era machines and the page
    # rendered, complete-looking, with two of the seven machines missing. A default that is not
    # the record is how a page says something false while every check stays green. Where the
    # frontmatter DOES carry a number, the two must agree.
    number = int(filename.split("-")[0])
    if "chapter" in meta and int(meta["chapter"]) != number:
        die("PART 5", f"{filename} is filed as chapter {number} and says chapter {meta['chapter']}",
            "one of the two is wrong and nothing else in the repository would notice")
    title = meta.get("title", "").strip()
    if len(title) > 1 and title[0] == title[-1] and title[0] in "\"'":
        title = title[1:-1]
    if not title:
        die("PART 5", f"{filename} frontmatter has no title",
            "the chapter needs a name for the rail, the contents and the eyebrow")
    return {"file": filename, "meta": meta, "ids": ids, "body": body,
            "number": number, "title": title}


def chapter_uses(chapter, cid):
    """Whether the chapter's prose uses this claim. Four ways, and each one is a real use.

    (a) the prose names the id;
    (b) it prints a figure that re-computes from the claim's central or interval;
    (c) it prints a figure that re-computes from a number inside the claim's own statement or
        method — a chapter quoting the record's working;
    (d) the claim IS a date (its unit says so) and the prose prints that year.

    Anything else and the frontmatter is carrying an id the reader never meets, which is a stale
    citation waiting to be quoted at somebody.
    """
    claim = CLAIMS.get(cid)
    if claim is None:
        return False
    if cid in chapter["_named"]:
        return True
    for figure in chapter["_figures"]:
        if reaches(figure["candidates"], CLAIM_VALUES.get(cid, ())):
            return True
    for figure in chapter["_figures"]:
        if reaches(figure["candidates"], CLAIM_WORDS.get(cid, ())):
            return True
    if "year" in str(claim.get("unit", "")).lower() and claim.get("about_year") in chapter["_years"]:
        return True
    return False


def check_chapter_citations(chapter):
    unknown = [cid for cid in chapter["ids"] if cid not in CLAIMS]
    if unknown:
        die("PART 5", f"{chapter['file']} cites claims that are not in claims.json: {unknown}",
            "correct the frontmatter, or repair the record and record the supersession")
    rejected = [cid for cid in chapter["ids"] if cid in REJECTED]
    if rejected:
        die("PART 5", f"{chapter['file']} cites REJECTED claims: {rejected}",
            "verdicts.json rejected these; a rejected claim may be corrected in prose but never "
            "cited as a source")
    stale = [cid for cid in chapter["ids"] if not chapter_uses(chapter, cid)]
    if stale:
        die("PART 5",
            f"{chapter['file']} lists {len(stale)} claim id(s) its prose never uses: {stale}",
            "either the prose lost the number when it was rewritten, or the citation was copied "
            "from another chapter. A frontmatter list nobody reads is how a stale citation lives "
            "through a rewrite")
    return len(chapter["ids"])


# ---------------------------------------------------------------- markdown

INLINE_CODE = re.compile(r"`([^`]+)`")
BOLD = re.compile(r"\*\*([^*]+)\*\*")
ITALIC = re.compile(r"(?<!\*)\*([^*\n]+)\*(?!\*)")
LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
BARE_URL = re.compile(r"https?://\S+")
FOOTNOTE_REF = re.compile(r"\[\^([^\]]+)\]")
FOOTNOTE_DEF = re.compile(r"^\[\^([^\]]+)\]:\s*(.*)$")


def render_inline(text, chapter):
    """Markdown inline forms, with every text run routed through emit().

    The order matters. Links and inline code are lifted out first and held as placeholders, so a
    URL's digits never reach the figure scanner as a quantity and a claim id in backticks is not
    re-escaped twice.
    """
    held = []

    def hold(html_fragment):
        held.append(html_fragment)
        return f"\x00{len(held) - 1}\x00"

    def on_link(match):
        label = emit(match.group(1), chapter["ids"], chapter["file"])
        return hold(f'<a href="{esc(match.group(2))}" rel="noopener noreferrer" '
                    f'target="_blank">{label}</a>')

    def on_code(match):
        body = match.group(1)
        cited = CLAIM_ID_RE.fullmatch(body.strip())
        if cited:
            return hold(f'<code class="p2-chrome p2-claimref" '
                        f'data-claim="{esc(body.strip())}">{esc(body)}</code>')
        return hold(f'<code class="p2-chrome">{esc(body)}</code>')

    def on_footref(match):
        mark = match.group(1)
        anchor = f'{chapter["file"]}-{mark}'
        return hold(f'<sup class="p2-fnref"><a href="#fn-{esc(anchor)}" '
                    f'id="fnref-{esc(anchor)}">{esc(mark)}</a></sup>')

    def on_bare_url(match):
        url = match.group(0).rstrip(".,;)")
        trailing = match.group(0)[len(url):]
        return hold(f'<a href="{esc(url)}" rel="noopener noreferrer" target="_blank" '
                    f'class="p2-srclink">{esc(url)}</a>') + trailing

    text = LINK.sub(on_link, text)
    # The chapters write their source URLs bare, outside any markdown link, and a source list
    # nobody can follow is a source list nobody checks. A link is not a request: the page still
    # loads nothing from anywhere.
    text = BARE_URL.sub(on_bare_url, text)
    text = INLINE_CODE.sub(on_code, text)
    text = FOOTNOTE_REF.sub(on_footref, text)

    # Inline claim ids the chapters write bare, e.g. [e7-targeting-002].
    def on_bare_id(match):
        return hold(f'<span class="p2-chrome p2-claimref" '
                    f'data-claim="{esc(match.group(1))}">{esc(match.group(1))}</span>')

    text = re.sub(r"\[(" + CLAIM_ID_RE.pattern + r")\]", on_bare_id, text)

    def on_bold(match):
        return hold(f"<strong>{emit(match.group(1), chapter['ids'], chapter['file'])}</strong>")

    def on_italic(match):
        return hold(f"<em>{emit(match.group(1), chapter['ids'], chapter['file'])}</em>")

    text = BOLD.sub(on_bold, text)
    text = ITALIC.sub(on_italic, text)

    parts = re.split(r"\x00(\d+)\x00", text)
    out = []
    for index, part in enumerate(parts):
        if index % 2:
            out.append(held[int(part)])
        else:
            out.append(emit(part, chapter["ids"], chapter["file"]))
    return "".join(out)


def render_chapter_body(chapter):
    """The ten chapters' markdown: headings, tables, lists, paragraphs, footnote definitions."""
    lines = chapter["body"].splitlines()
    out = []
    notes = []
    index = 0
    while index < len(lines):
        line = lines[index]
        stripped = line.strip()
        if not stripped:
            index += 1
            continue
        note = FOOTNOTE_DEF.match(stripped)
        if note:
            notes.append((note.group(1), note.group(2)))
            index += 1
            continue
        if stripped.startswith("#"):
            level = len(stripped) - len(stripped.lstrip("#"))
            body = stripped[level:].strip()
            tag = {1: "h2", 2: "h3", 3: "h4"}.get(level, "h4")
            klass = "p2-ch-title" if level == 1 else "p2-ch-head"
            out.append(f'<{tag} class="{klass}">{render_inline(body, chapter)}</{tag}>')
            index += 1
            continue
        if stripped.startswith("|"):
            table = []
            while index < len(lines) and lines[index].strip().startswith("|"):
                table.append(lines[index].strip())
                index += 1
            out.append(render_table(table, chapter))
            continue
        if re.match(r"^[-*]\s+", stripped):
            items = []
            while index < len(lines) and re.match(r"^[-*]\s+", lines[index].strip()):
                items.append(re.sub(r"^[-*]\s+", "", lines[index].strip()))
                index += 1
            out.append("<ul class=\"p2-prose\">" + "".join(
                f"<li>{render_inline(item, chapter)}</li>" for item in items) + "</ul>")
            continue
        if re.match(r"^\d+\.\s+", stripped):
            items = []
            while index < len(lines) and re.match(r"^\d+\.\s+", lines[index].strip()):
                items.append(re.sub(r"^\d+\.\s+", "", lines[index].strip()))
                index += 1
            out.append("<ol class=\"p2-prose\">" + "".join(
                f"<li>{render_inline(item, chapter)}</li>" for item in items) + "</ol>")
            continue
        paragraph = []
        while index < len(lines) and lines[index].strip() and not lines[index].strip().startswith(
                ("#", "|", "- ", "* ")) and not FOOTNOTE_DEF.match(lines[index].strip()):
            paragraph.append(lines[index].strip())
            index += 1
        out.append(f'<p class="p2-prose">{render_inline(" ".join(paragraph), chapter)}</p>')
    return out, notes


def render_table(rows, chapter):
    cells = [[c.strip() for c in row.strip("|").split("|")] for row in rows]
    body = [r for r in cells if not all(re.fullmatch(r":?-{2,}:?", c or "-") for c in r)]
    if not body:
        die("PART 5", f"{chapter['file']} has a table with no rows",
            "a table that renders empty is an absence, and absence is drawn as an object here")
    head, rest = body[0], body[1:]
    out = ['<div class="p2-tablewrap"><table class="p2-table">', "<thead><tr>"]
    for cell in head:
        out.append(f"<th>{render_inline(cell, chapter)}</th>")
    out.append("</tr></thead><tbody>")
    for row in rest:
        out.append("<tr>" + "".join(
            f"<td>{render_inline(cell, chapter)}</td>" for cell in row) + "</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


# ============================================================================
# PART 6 · THE SPINE
#
# Which component sits in which chapter, and why. The `why` is on the page under each component, so
# a placement is a decision a reader and a reviewer can both see rather than infer.
# ============================================================================

SPINE = {
    1: [("rail-board", "Before a single figure: the eight compilers, and the years each one "
                       "actually published. The reader meets the ruler before the reading."),
        ("value-chart", "The money, in dollars of the day, on every rail the record carries. "
                        "Where two rails overlap the page draws both and labels the distance, "
                        "because one line across the century is the most attractive chart in this "
                        "dataset and it is a lie.")],
    2: [("era-1", "Era one as a machine. Eight parts in eight fixed places, and the same eight "
                  "places in all seven eras that follow."),
        ("toll-plates", "The middleman's cut, drawn seven times and never once on a shared "
                        "ruler. Each era measured its cut against a different base, so a row of "
                        "bars would invite a comparison the record cannot support.")],
    3: [("era-2", "Era two, on the same eight positions.")],
    4: [("era-3", "Era three, on the same eight positions.")],
    5: [("era-4", "Era four, on the same eight positions.")],
    6: [("era-5", "Era five, on the same eight positions.")],
    7: [("era-6", "Era six, on the same eight positions."),
        ("auction-bench", "The yield engine, worked rather than described. One apparatus, ten "
                          "scenarios, and every figure on it re-derived from the record before it "
                          "is drawn."),
        ("door-bench", "The volume engine, beside the yield engine, because Google won search "
                       "advertising twice and most readers have only heard about the auction.")],
    8: [("era-7", "Era seven, on the same eight positions.")],
    9: [("small-multiples", "Every medium the record carries, on one shared ceiling, with the "
                            "documented holes drawn as objects rather than left blank."),
        ("gdp-strip", "The capture question, as the record can actually answer it: dated "
                      "readings, and no line between them.")],
    10: [],
}

# The one page decision `docs/p2/eras/README.md` hands to this team, answered here rather than left
# to the demo's default.
#
# `era-machine.demo.html` holds eras 2 to 7 closed until the reader has cranked once and pulled
# once. That gate is right for a page where the seven machines are seven tabs. This is a scrolled
# document: a reader arriving at chapter 5 from a link, or scrolling past chapter 2 without
# touching anything, would meet a dead machine with no affordance saying how to open it — and a
# blank where a machine should be is exactly the absence this project refuses to draw. So the gate
# is NOT kept, and what it protected is kept another way: era 1 is the only machine that carries
# the teaching sequence, it fires on that machine's first crank, and every ring on every machine
# stays visible from then on.
ERA_GATE_KEPT = False
ERA_GATE_WHY = (
    "The seven machines are open from the start. In a scrolled piece a locked machine is a blank "
    "with no way in, and a blank is the one thing this project never draws. The first machine "
    "still teaches both controls, and it is the only one that does."
)


# ============================================================================
# PART 7 · THE MODULE BUNDLE
#
# The page must open from the filesystem and from a static host with zero external requests.
# Browsers block `fetch` on `file://` origins and Chrome additionally blocks
# `<script type="module">` imports there, so every module and every byte of the record is inlined.
# `docs/p2/lib/README.md` names this shape and expects it: "the shipped index.html will inline
# them, exactly as tools/build_p1.py did for P1".
# ============================================================================

MODULES = [p for p in sorted(P2.glob("*/*.js")) if ".test." not in p.name]

IMPORT_RE = re.compile(
    r"^import\s+(?P<what>[\s\S]*?)\s+from\s+['\"](?P<spec>[^'\"]+)['\"]\s*;?[ \t]*$", re.M)
EXPORT_DECL = re.compile(r"^export\s+(?=(?:async\s+function|function|class|const|let|var)\b)", re.M)
EXPORT_LIST = re.compile(r"^export\s*\{(?P<names>[^}]*)\}\s*;?[ \t]*$", re.M)
EXPORT_DEFAULT = re.compile(r"^export\s+default\s+", re.M)
DECL_NAME = re.compile(r"^(?:async\s+function\*?|function\*?|class|const|let|var)\s+([A-Za-z_$][\w$]*)")
IDENT = re.compile(r"[A-Za-z_$][\w$]*")
IMPORT_META = re.compile(r"import\.meta\.url")


def mask_js(src):
    """Blank every character of a JavaScript source that is not executable code.

    Strings, comments and regex literals become spaces; newlines survive so line numbers do not
    move. A template literal's TEXT is blanked and the code inside its ${...} holes is NOT — a bare
    identifier in a hole is a real reference, and the first version of this function hid four of
    them in `motion.js`, which is the one module with a live binding to protect.
    """
    length = len(src)
    out = list(src)

    def blank(start, stop):
        for k in range(start, min(stop, length)):
            if out[k] != "\n":
                out[k] = " "

    stack = [["code", 0, None]]
    i = 0
    while i < length:
        top = stack[-1]
        char = src[i]
        if top[0] == "tpl":
            if char == "\\":
                blank(i, i + 2); i += 2; continue
            if char == "`":
                blank(i, i + 1); i += 1; stack.pop(); continue
            if char == "$" and i + 1 < length and src[i + 1] == "{":
                blank(i, i + 2); i += 2; stack.append(["code", 0, "tpl"]); continue
            blank(i, i + 1); i += 1; continue
        if char == "/" and i + 1 < length and src[i + 1] == "/":
            stop = src.find("\n", i)
            stop = length if stop < 0 else stop
            blank(i, stop); i = stop; continue
        if char == "/" and i + 1 < length and src[i + 1] == "*":
            stop = src.find("*/", i + 2)
            stop = length if stop < 0 else stop + 2
            blank(i, stop); i = stop; continue
        if char in "\"'":
            j = i + 1
            while j < length:
                if src[j] == "\\":
                    j += 2; continue
                if src[j] == char:
                    j += 1; break
                j += 1
            blank(i, j); i = j; continue
        if char == "`":
            blank(i, i + 1); i += 1; stack.append(["tpl"]); continue
        if char == "/":
            k = i - 1
            while k >= 0 and out[k] in " \t\n\r":
                k -= 1
            previous = out[k] if k >= 0 else ""
            if previous == "" or previous in "(,=:[!&|?{};+-*%<>~^":
                j = i + 1
                closed = False
                in_class = False
                while j < length:
                    if src[j] == "\\":
                        j += 2; continue
                    if src[j] == "[":
                        in_class = True
                    elif src[j] == "]":
                        in_class = False
                    elif src[j] == "\n":
                        break
                    elif src[j] == "/" and not in_class:
                        j += 1
                        while j < length and src[j].isalpha():
                            j += 1
                        closed = True
                        break
                    j += 1
                if closed:
                    blank(i, j); i = j; continue
        if char == "{":
            top[1] += 1; i += 1; continue
        if char == "}":
            if top[1] == 0 and top[2] == "tpl":
                blank(i, i + 1); i += 1; stack.pop(); continue
            top[1] -= 1; i += 1; continue
        i += 1
    return "".join(out)


def module_key(path):
    return str(path.relative_to(P2))


def parse_module(path, src):
    masked = mask_js(src)
    edits, imports, exports = [], [], []
    for match in IMPORT_RE.finditer(src):
        if masked[match.start()] != "i":
            continue
        what = match.group("what").strip()
        target = str((path.parent / match.group("spec")).resolve().relative_to(P2))
        if what.startswith("*"):
            binds = [("*", what.split(" as ", 1)[1].strip())]
        else:
            binds = []
            for piece in [x.strip() for x in what.strip().strip("{}").split(",") if x.strip()]:
                if " as " in piece:
                    outer, inner = [x.strip() for x in piece.split(" as ")]
                else:
                    outer = inner = piece
                binds.append((outer, inner))
        imports.append({"target": target, "binds": binds, "span": (match.start(), match.end())})
        edits.append((match.start(), match.end(), None))
    for match in EXPORT_DECL.finditer(src):
        if masked[match.start()] != "e":
            continue
        named = DECL_NAME.match(src[match.end():])
        if not named:
            die("PART 7", f"{module_key(path)} has an export this bundler cannot name",
                "the bundler handles export of a named declaration, an export list and a default")
        exports.append((named.group(1), named.group(1)))
        edits.append((match.start(), match.end(), ""))
    for match in EXPORT_LIST.finditer(src):
        if masked[match.start()] != "e":
            continue
        for piece in [x.strip() for x in match.group("names").replace("\n", " ").split(",")
                      if x.strip()]:
            if " as " in piece:
                local, exported = [x.strip() for x in piece.split(" as ")]
            else:
                local = exported = piece
            exports.append((local, exported))
        edits.append((match.start(), match.end(), ""))
    has_default = False
    for match in EXPORT_DEFAULT.finditer(src):
        if masked[match.start()] != "e":
            continue
        has_default = True
        edits.append((match.start(), match.end(), "__exp.default = "))
    return {"src": src, "masked": masked, "edits": edits, "imports": imports,
            "exports": exports, "default": has_default}


PARSED = {module_key(p): parse_module(p, p.read_text()) for p in MODULES}

# An exported binding its own module REASSIGNS is a live binding. `guards.js` does this to `RULES`,
# and `motion.js` reads it back: `configureRules()` has to move the span-only cut for the chart
# layer and for TREMOR in the same instant, and a snapshot taken at import time would leave
# `tremorThreshold()` reporting a cut nobody is using. So the bundler finds these generically and
# rewrites the importer's references into namespace access. PART 8 then moves the cut in Node and
# requires the other module to see it.
LIVE_BINDINGS = set()
for _key, _mod in PARSED.items():
    for _local, _exported in _mod["exports"]:
        if re.search(rf"^[ \t]*{re.escape(_local)}\s*=[^=]", _mod["masked"], re.M):
            LIVE_BINDINGS.add((_key, _exported))


def build_module(key):
    mod = PARSED[key]
    src, masked = mod["src"], mod["masked"]
    live_local = {}
    for index, imp in enumerate(mod["imports"]):
        for outer, inner in imp["binds"]:
            if outer != "*" and (imp["target"], outer) in LIVE_BINDINGS:
                live_local[inner] = (index, outer)
    edits = []
    for start, stop, replacement in mod["edits"]:
        if replacement is not None:
            edits.append((start, stop, replacement))
            continue
        index = [i for i, imp in enumerate(mod["imports"]) if imp["span"] == (start, stop)][0]
        imp = mod["imports"][index]
        pieces = [f"const __ns{index} = __req({imp['target']!r});"]
        star = [inner for outer, inner in imp["binds"] if outer == "*"]
        plain = [(outer, inner) for outer, inner in imp["binds"]
                 if outer != "*" and (imp["target"], outer) not in LIVE_BINDINGS]
        if star:
            pieces.append(f"const {star[0]} = __ns{index};")
        if plain:
            pieces.append("const { " + ", ".join(
                (f"{o}: {i}" if o != i else o) for o, i in plain) + f" }} = __ns{index};")
        edits.append((start, stop, " ".join(pieces)))
    for match in IMPORT_META.finditer(src):
        if masked[match.start()] == " ":
            continue
        edits.append((match.start(), match.end(), "__P2_MODULE_URL"))
    if live_local:
        for match in IDENT.finditer(src):
            name = match.group(0)
            if name not in live_local:
                continue
            if masked[match.start()] == " ":
                continue
            before = src[:match.start()].rstrip()
            if before.endswith(".") or before.endswith("?."):
                continue
            if src[match.end():].lstrip().startswith(":"):
                continue
            if any(imp["span"][0] <= match.start() < imp["span"][1] for imp in mod["imports"]):
                continue
            index, exported = live_local[name]
            edits.append((match.start(), match.end(), f"__ns{index}.{exported}"))
    out, cursor = [], 0
    for start, stop, replacement in sorted(edits):
        out.append(src[cursor:start])
        out.append(replacement)
        cursor = stop
    out.append(src[cursor:])
    body = "".join(out)
    residual = [line for line in mask_js(body).splitlines()
                if line.startswith("import ") or line.startswith("export ")]
    if residual:
        die("PART 7", f"{key} still carries {len(residual)} module statement(s) after transform: "
                      f"{residual[0][:70]!r}",
            "the bundler must consume every import and export; a residual one is a syntax error "
            "in a classic script and a silently missing binding if it is not")
    tail = "\n".join(
        f"Object.defineProperty(__exp, {exported!r}, "
        f"{{ get: function () {{ return {local}; }}, enumerable: true }});"
        for local, exported in mod["exports"])
    return f"__def({key!r}, function (__exp, __req) {{\n{body}\n{tail}\n}});\n"


def module_order():
    order, state = [], {}

    def visit(key, stack):
        if state.get(key) == "done":
            return
        if state.get(key) == "open":
            die("PART 7", f"import cycle: {' -> '.join(stack + [key])}",
                "the bundle evaluates modules in dependency order and a cycle has no such order")
        state[key] = "open"
        for imp in PARSED[key]["imports"]:
            visit(imp["target"], stack + [key])
        state[key] = "done"
        order.append(key)

    for key in PARSED:
        visit(key, [])
    return order


BUNDLE_PRELUDE = """
/* THE MODULE REGISTRY.
 * Thirty-one ES modules, evaluated in dependency order, in one classic script. Chrome blocks
 * `<script type="module">` imports over file:// and every browser blocks fetch there, so a page
 * that must open off a disk cannot import anything. Exports are getters, so a binding its own
 * module reassigns — guards.js's RULES — is still live where another module reads it. */
var __P2_MODULE_URL = (typeof document !== 'undefined' && document.baseURI) || '';
var __P2MODS = Object.create(null), __P2CACHE = Object.create(null);
function __def(name, fn) { __P2MODS[name] = fn; }
function __req(name) {
  if (name in __P2CACHE) return __P2CACHE[name];
  var fn = __P2MODS[name];
  if (!fn) throw new Error('P2 bundle: no module named ' + name);
  var exp = __P2CACHE[name] = Object.create(null);
  fn(exp, __req);
  return exp;
}
"""


def build_bundle():
    order = module_order()
    return BUNDLE_PRELUDE + "".join(build_module(key) for key in order), order


# ============================================================================
# PART 8 · THE SELF-TESTS
#
# Every refusal above is handed the thing it forbids, and required to throw. A check that cannot
# fire is worse than no check: it stops anyone looking at the thing it appears to be watching. One
# shipped guard in this project had a condition unsatisfiable by construction and the README sold
# it as a guarantee.
# ============================================================================

def self_tests(bundle, order):
    results = []

    def fires(name, fn, expect=BuildError):
        try:
            fn()
        except expect as error:
            results.append((name, "REFUSED", str(error).splitlines()[0][:110]))
            return
        except Exception as error:      # noqa: BLE001 — a wrong error type is still a failure here
            die("PART 8", f"self-test {name!r} raised {type(error).__name__}, not {expect.__name__}",
                "the check fired, but not with the error the build reports")
        die("PART 8", f"self-test {name!r} did not fire",
            "the check it exercises cannot refuse the thing it forbids, which makes it decoration")

    # 1 · a figure that resolves to nothing stops the build
    def untraceable():
        before = len(UNRESOLVED)
        emit("the market reached $8,675,309 that year", ("e1-pricing-004",), "self-test")
        after = UNRESOLVED[before:]
        del UNRESOLVED[before:]
        del LEDGER[-1:]
        if not after:
            raise AssertionError
        raise BuildError("PART 3: a figure with no source in the record was refused")
    fires("an invented figure resolves to nothing", untraceable)

    # 2 · a number cannot reach the page except through emit()
    fires("emit_plain() refuses a string with a figure in it",
          lambda: emit_plain("this heading carries 42.7 percent"))

    # 3 · a frontmatter id its prose never uses is refused
    #
    # The probe is a made-up claim, because this test needs a SHAPE rather than a fact: every id
    # the record actually holds is used by some chapter, so a real one would prove nothing about
    # the branch. Its central is a value no chapter prints and its unit is not a year, so all four
    # ways a chapter can use a claim are closed against it at once.
    def stale_citation():
        probe_id = "zz-probe-000"
        CLAIMS[probe_id] = {"id": probe_id, "central": 8675309.4142,
                            "ci80": [8675309.4141, 8675309.4143], "unit": "a shape, not a fact",
                            "statement": "the build's own probe", "method": ""}
        CLAIM_VALUES[probe_id] = claim_values(CLAIMS[probe_id])
        CLAIM_WORDS[probe_id] = claim_words(CLAIMS[probe_id])
        try:
            probe = dict(PROBE_CHAPTER)
            probe["ids"] = list(probe["ids"]) + [probe_id]
            check_chapter_citations(probe)
        finally:
            del CLAIMS[probe_id], CLAIM_VALUES[probe_id], CLAIM_WORDS[probe_id]
    fires("a chapter citing a claim its prose never uses", stale_citation)

    # 4 · a rejected claim is refused as a citation
    def rejected_citation():
        probe = dict(PROBE_CHAPTER)
        probe["ids"] = list(probe["ids"]) + [sorted(REJECTED)[0]]
        check_chapter_citations(probe)
    fires("a chapter citing a claim the verifier rejected", rejected_citation)

    # 5 · the census branch resolves, even though the record never reaches it
    #
    # A CHAPTER'S OWN WORDS CARRY THE COUNTS TODAY: "1,573 points" resolves through
    # ds-provenance-001's statement long before the census is consulted, so the census fires zero
    # times on the record as frozen. A branch nobody has ever seen run is the shape this project
    # keeps finding defects in — the cross-section drew a span-only reading as a definite length
    # for exactly that reason — so it is forced here instead of assumed.
    def census_resolves():
        points = float(sum(len(x.get("points") or [])
                           for x in FROZEN["adspend"].get("series", {}).values()))
        probe = {"kind": "quantity", "value": points, "token": str(int(points)),
                 "candidates": ((points, 0.5),)}
        answer = resolve_figure(probe, ())
        if not answer or answer["class"] != "census":
            die("PART 8", "the record census resolves nothing, so that branch is decoration",
                "either the census counts something the record no longer holds, or a world above "
                "it now absorbs the count")
        raise BuildError(f"PART 3: the census branch resolved {int(points)} — {answer['detail']}")
    fires("the record census can resolve a count", census_resolves)

    # 6 · a non-quantity rule that stops matching is refused
    def dead_rule():
        RULE_FIRINGS["law-report"] = 0
        try:
            assert_rules_fired()
        finally:
            RULE_FIRINGS["law-report"] = 1
    fires("a non-quantity rule that matched nothing", dead_rule, VacuousError)

    # 7 · the bundle runs, its exports match the real ES modules, and the live binding is live
    node = run_node_check(bundle, order)
    results.append(("the bundle equals the ES modules it was built from", "PROVED", node))
    return results


NODE_HARNESS = r"""
import fs from 'node:fs';
import vm from 'node:vm';
const [bundlePath, p2, listPath] = process.argv.slice(2);
const src = fs.readFileSync(bundlePath, 'utf8');
const context = vm.createContext({ console });
vm.runInContext(src + '\nglobalThis.__req = __req;', context);
const req = context.__req;
const names = JSON.parse(fs.readFileSync(listPath, 'utf8'));
const problems = [];
for (const name of names) {
  let native, bundled;
  try { native = await import(p2 + '/' + name); }
  catch (e) { problems.push(`native import failed ${name}: ${e.message}`); continue; }
  try { bundled = req(name); }
  catch (e) { problems.push(`bundle require failed ${name}: ${e.message}`); continue; }
  const a = new Set(Object.keys(native).filter((k) => k !== 'default'));
  const b = new Set(Object.keys(bundled).filter((k) => k !== 'default'));
  const missing = [...a].filter((k) => !b.has(k));
  const extra = [...b].filter((k) => !a.has(k));
  if (missing.length || extra.length || ('default' in native) !== ('default' in bundled)) {
    problems.push(`export mismatch ${name}: missing ${missing} extra ${extra}`);
  }
}
/* THE LIVE BINDING. guards.js reassigns RULES; motion.js reads the cut back out of it. A bundler
 * that snapshots named imports leaves tremorThreshold() reporting a cut nobody is using, and the
 * project's own README calls that "no second source of truth". This is the test of that claim. */
const guards = req('lib/guards.js'), motion = req('lib/motion.js');
const before = motion.tremorThreshold();
guards.configureRules({ wideIntervalRatio: 1.5 },
  'the build self-test moves the cut to prove the binding between guards.js and motion.js is live');
const after = motion.tremorThreshold();
guards.resetRules();
const restored = motion.tremorThreshold();
if (!(before === guards.RULES.wideIntervalRatio && after === 1.5 && restored === before)) {
  problems.push(`live binding is dead: motion saw ${before} -> ${after} -> ${restored}`);
}
if (problems.length) { console.log('FAIL\n' + problems.join('\n')); process.exit(1); }
console.log(`${names.length} modules compared, exports identical, RULES live at ${before} -> ${after} -> ${restored}`);
"""


def run_node_check(bundle, order):
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        (tmp / "bundle.js").write_text(bundle)
        (tmp / "list.json").write_text(json.dumps(order))
        (tmp / "check.mjs").write_text(NODE_HARNESS)
        try:
            proc = subprocess.run(
                ["node", str(tmp / "check.mjs"), str(tmp / "bundle.js"), str(P2),
                 str(tmp / "list.json")],
                capture_output=True, text=True, timeout=180)
        except FileNotFoundError:
            die("PART 8", "node is not on PATH, so the bundle was never executed",
                "install node, or accept that the bundle is unverified and say so in the report")
        if proc.returncode != 0:
            die("PART 8", "the bundle does not match the ES modules it was built from:\n"
                          + proc.stdout.strip() + proc.stderr.strip(),
                "the module transform is wrong; the message names the module and the binding")
        return proc.stdout.strip()


# ============================================================================
# PART 9 · THE PAGE
# ============================================================================

def era_span():
    """The window the piece covers, read off the era records rather than typed.

    The brief calls it 180 years. That number is nobody's measurement, and a round figure in a
    title is still a figure, so the page prints the record's own two ends instead.
    """
    first = str(ERA_RECORDS[0].get("years", ""))
    last = str(ERA_RECORDS[-1].get("years", ""))
    start = re.split(r"[-–]", first)[0].strip()
    end = re.split(r"[-–]", last)[-1].strip()
    return start, end


ORDINAL_WHY = ("the chapter's own number, read out of its frontmatter and printed with a leading "
               "zero so ten chapter labels are the same width")
SPAN_WHY = ("the first era record's opening years and the last era record's closing years, read "
            "off eras/era-1.json and eras/era-7.json")


PAGE_CSS = """
/* ---- docs/p2/index.html — the page shell. Every colour is a token; none is restated here. ---- */
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
/* THREE COMPONENT STYLESHEETS CARRY THEIR OWN DEMO PAGE'S FURNITURE.
   `chart-demo.css`, `eras.css` and `toll.css` each open with a bare `body { max-width; margin;
   padding }` for the page they were written to sit on, and inlining a stylesheet inlines that
   too. It cost the auction bench 550 pixels of width before anyone noticed, because the page
   still looked deliberate. `body.p2` outranks a bare `body`, so the shipped page takes its own
   layout back here rather than editing another team's file. */
body.p2 { margin: 0; padding: 0 0 140px; max-width: none;
  background: var(--p2-bone); color: var(--p2-graphite); }
.p2-wrap { max-width: 1240px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 48px); }
.p2-col { max-width: 68ch; }
.p2-masthead { padding: clamp(48px, 9vw, 132px) 0 44px; }
.p2-masthead h1 {
  font-family: var(--p2-face-prose); font-weight: 400;
  font-size: clamp(38px, 6.6vw, 74px); line-height: 1.04; letter-spacing: -0.015em;
  margin: 14px 0 0; max-width: 20ch;
}
.p2-masthead .p2-standfirst {
  font-family: var(--p2-face-prose); font-size: clamp(17px, 2vw, 21px); line-height: 1.62;
  color: var(--p2-ink-2); max-width: 58ch; margin: 26px 0 0;
}
.p2-rule { border: 0; border-top: 1px solid var(--p2-rule-faint); margin: 0; }
.p2-toc { margin: 40px 0 0; display: grid; gap: 2px; max-width: 62ch; }
.p2-toc a {
  display: grid; grid-template-columns: 3.2em 1fr; gap: 14px; align-items: baseline;
  padding: 9px 0; border-top: 1px solid var(--p2-rule-faint);
  color: var(--p2-graphite); text-decoration: none;
}
.p2-toc a:hover .p2-toc-title { text-decoration: underline; }
.p2-toc-n { font-family: var(--p2-face-num); font-size: 12px; color: var(--p2-zinc-text); }
.p2-toc-title { font-family: var(--p2-face-prose); font-size: 17px; }

.p2-chapter { padding: clamp(52px, 8vw, 104px) 0 0; scroll-margin-top: 64px; }
.p2-chapter + .p2-chapter { border-top: 1px solid var(--p2-rule-faint); }
.p2-ch-eyebrow { margin: 0 0 10px; color: var(--p2-zinc-text); }
.p2-ch-title {
  font-family: var(--p2-face-prose); font-weight: 400; letter-spacing: -0.012em;
  font-size: clamp(29px, 4.2vw, 46px); line-height: 1.1; margin: 0 0 30px; max-width: 22ch;
}
.p2-ch-head {
  font-family: var(--p2-face-label); text-transform: uppercase; letter-spacing: 0.075em;
  font-size: 12px; font-weight: 600; color: var(--p2-ink-2);
  margin: 44px 0 14px; padding-top: 14px; border-top: 1px solid var(--p2-rule-faint);
  max-width: 68ch;
}
h4.p2-ch-head { border-top: 0; padding-top: 0; margin-top: 30px; text-transform: none;
  letter-spacing: 0.02em; font-size: 13px; }
.p2-chapter p.p2-prose { max-width: 68ch; margin: 0 0 18px; }
.p2-chapter ul.p2-prose, .p2-chapter ol.p2-prose { max-width: 66ch; margin: 0 0 18px; padding-left: 22px; }
.p2-chapter li { margin: 0 0 8px; font-family: var(--p2-face-prose); font-size: 19px; line-height: 1.65; }

.p2-tablewrap { overflow-x: auto; overscroll-behavior-x: contain; margin: 0 0 26px; }
table.p2-table { border-collapse: collapse; font-size: 14px; min-width: 100%; }
table.p2-table th, table.p2-table td {
  text-align: left; vertical-align: top; padding: 8px 14px 8px 0;
  border-bottom: 1px solid var(--p2-rule-faint); font-family: var(--p2-face-prose);
}
table.p2-table th {
  font-family: var(--p2-face-label); text-transform: uppercase; letter-spacing: 0.07em;
  font-size: 11px; color: var(--p2-zinc-text); font-weight: 600; white-space: nowrap;
}

.p2-fig { font-variant-numeric: tabular-nums; }
.p2-fig[data-claim], .p2-fig[data-record] {
  border-bottom: 1px solid var(--p2-rule-faint); cursor: help;
}
.p2-claimref { font-size: 11px; color: var(--p2-zinc-text); }
.p2-srclink { color: var(--p2-ink-3); word-break: break-all; }
.p2-fnref { font-size: 11px; line-height: 0; }
.p2-fnref a { color: var(--p2-zinc-text); text-decoration: none; padding: 0 1px; }
.p2-fnref a:hover, .p2-fnref a:focus-visible { text-decoration: underline; }

.p2-notes { margin: 46px 0 0; padding-top: 16px; border-top: 1px solid var(--p2-rule-faint); }
.p2-notes ol { margin: 0; padding-left: 26px; }
.p2-notes li { font-size: 13px; line-height: 1.6; margin: 0 0 7px; color: var(--p2-ink-2);
  font-family: var(--p2-face-prose); }

.p2-stage { margin: 40px 0 44px; }
/* A WIDE STAGE IS NOT A NEGATIVE MARGIN.
   `margin-left: calc(50% - 50vw)` is the usual full-bleed trick and it was wrong here by 129px in
   a real browser, because 100vw and the element's own 100% do not agree once a scrollbar is in
   the picture. The wide components sit OUTSIDE the reading column instead — a structural answer,
   not an arithmetic one — and each scrolls inside its own body rather than pushing the page
   sideways. `door-bench.css` measured the cost of a component scrolling inside too narrow a
   column: 132px of the drum, including the 91 per cent notch the whole third mechanic aims at. */
.p2-bleed { padding: 0 clamp(16px, 4vw, 48px); }
.p2-bleed .p2-stage { margin: 40px auto 44px; max-width: 1680px; }
.p2-stage-body { overflow-x: auto; overscroll-behavior-x: contain; }
.p2-stage-note { margin-top: 8px; color: var(--p2-ink-3); }
.p2-stage-head { display: flex; gap: 16px; align-items: baseline; flex-wrap: wrap;
  padding-bottom: 8px; border-bottom: 1px solid var(--p2-rule-faint); margin-bottom: 18px; }
.p2-stage-why { max-width: 72ch; margin: 0; color: var(--p2-ink-2); font-size: 15px;
  font-family: var(--p2-face-prose); line-height: 1.6; }
.p2-stage-body { margin-top: 20px; }

.p2-nav {
  position: sticky; top: 0; z-index: 40; background: var(--p2-bone);
  border-bottom: 1px solid var(--p2-rule-faint);
  display: flex; gap: 10px; align-items: center; padding: 7px clamp(16px, 4vw, 48px);
  overflow-x: auto; overscroll-behavior-x: contain;
}
.p2-nav a {
  font-family: var(--p2-face-num); font-size: 11px; color: var(--p2-zinc-text);
  text-decoration: none; padding: 3px 6px; border-radius: 2px; white-space: nowrap;
}
.p2-nav a[aria-current="true"] { color: var(--p2-graphite); background: var(--p2-surface-card); }
.p2-nav .p2-nav-spacer { flex: 1 1 auto; }

.p2-boot { padding: 22px; border: 1px dashed var(--p2-iron); margin: 26px 0; display: none; }
.p2-boot pre { white-space: pre-wrap; font-size: 11px; }
.p2-colophon { padding: 64px 0 96px; border-top: 1px solid var(--p2-rule-faint); margin-top: 72px; }
.p2-colophon dl { display: grid; grid-template-columns: minmax(9em, 14em) 1fr; gap: 6px 18px;
  max-width: 88ch; }
.p2-colophon dt { font-family: var(--p2-face-label); text-transform: uppercase; font-size: 11px;
  letter-spacing: 0.07em; color: var(--p2-zinc-text); }
.p2-colophon dd { margin: 0; font-family: var(--p2-face-prose); font-size: 15px; line-height: 1.6; }
"""


# What each slot calls itself on the page. An era machine's label is READ OFF ITS OWN RECORD —
# the name and the years both come out of eras/era-N.json — because a machine labelled by hand is
# a second copy of the one thing the record already says about that era.
COMPONENT_LABELS = {
    "rail-board": "the rail board · who published what, and when",
    "value-chart": "the spend rails · dollars of the day",
    "toll-plates": "the toll plates · the middleman's cut, seven times, seven bases",
    "auction-bench": "the auction bench · the yield engine, worked",
    "door-bench": "the door bench · the volume engine, worked",
    "small-multiples": "the by-medium bank · every medium the record carries",
    "gdp-strip": "the share-of-GDP strip · dated readings, and no line between them",
}
ERA_LABEL_WHY = ("the era's own number, name and year span, read off eras/era-N.json rather than "
                 "typed beside the machine")


def stage(component, why, wide=False):
    """A component's slot on the page, with the placement decision printed under its name."""
    klass = "p2-stage"
    if component.startswith("era-"):
        era = int(component.split("-")[1])
        record = ERA_RECORDS[era - 1]
        label = emit_derived(f"the machine · era {era} · {record['name']} ({record['years']})",
                             ERA_LABEL_WHY)
    else:
        label = emit_plain(COMPONENT_LABELS[component])
    note = ""
    if component == "era-1":
        # The one page decision docs/p2/eras/README.md hands this team, printed where the decision
        # shows rather than left in a build script nobody reads.
        note = f'<p class="p2-stage-why p2-stage-note">{emit_plain(ERA_GATE_WHY)}</p>'
    figure = (
        f'<figure class="{klass}" data-component="{esc(component)}">'
        f'<div class="p2-stage-head"><div class="p2-arch">{label}</div></div>'
        f'<figcaption class="p2-stage-why">{emit_plain(why)}</figcaption>'
        f'{note}'
        f'<div class="p2-stage-body" id="stage-{esc(component)}"></div>'
        f'</figure>')
    if wide:
        return f'<div class="p2-bleed">{figure}</div>'
    return f'<div class="p2-wrap">{figure}</div>'


WIDE_COMPONENTS = {"auction-bench", "door-bench", "small-multiples", "value-chart", "rail-board",
                   "gdp-strip", "toll-plates"}


def render_page(chapters, bundle):
    start, end = era_span()
    body = []

    nav = ['<nav class="p2-nav" aria-label="The ten chapters"><span class="p2-arch">'
           + emit_plain("The Attention Economy") + "</span>"]
    for chapter in chapters:
        nav.append(f'<a href="#ch-{chapter["number"]}">'
                   f'{emit_derived(str(chapter["number"]).rjust(2, "0"), ORDINAL_WHY)}'
                   f' · {emit(chapter["title"], chapter["ids"], chapter["file"])}</a>')
    nav.append('<span class="p2-nav-spacer"></span><span id="p2-motion"></span></nav>')
    body.append("".join(nav))

    body.append('<div class="p2-wrap"><header class="p2-masthead"><div class="p2-col">')
    body.append(f'<div class="p2-arch">{emit_plain("P2 · the US advertising market")} · '
                f'{emit_derived(start + " to " + end, SPAN_WHY)}</div>')
    body.append(f'<h1>{emit_plain("The Attention Economy")}</h1>')
    body.append('<p class="p2-standfirst">' + emit_plain(
        "Somebody has always had to count the audience before anybody could price it. For most of "
        "this story the counter was not the seller. Then it was. That is the whole argument, and "
        "the ten chapters below are the evidence for it.") + "</p>")
    body.append('<p class="p2-standfirst">' + emit_plain(
        "Every number here is wired to a claim in the frozen record. Hover a figure and it names "
        "the claim it comes from. Nothing on this page was typed in.") + "</p>")
    body.append('<nav class="p2-toc" aria-label="Contents">')
    for chapter in chapters:
        body.append(f'<a href="#ch-{chapter["number"]}">'
                    f'<span class="p2-toc-n">'
                    f'{emit_derived(str(chapter["number"]).rjust(2, "0"), ORDINAL_WHY)}</span>'
                    f'<span class="p2-toc-title">{emit(chapter["title"], chapter["ids"], chapter["file"])}</span></a>')
    body.append("</nav>")
    body.append('<div class="p2-boot" id="p2-boot"><b>' + emit_plain(
        "This page did not finish building itself.") + "</b><pre id=\"p2-boot-msg\"></pre></div>")
    body.append("</div></header></div>")

    body.append("<main>")
    for chapter in chapters:
        rendered, notes = render_chapter_body(chapter)
        body.append(f'<section class="p2-chapter" id="ch-{chapter["number"]}">')
        body.append('<div class="p2-wrap"><div class="p2-col">')
        body.append(f'<div class="p2-arch p2-ch-eyebrow">{emit_plain("chapter")} '
                    f'{emit_derived(str(chapter["number"]).rjust(2, "0"), ORDINAL_WHY)}</div>')
        placed = SPINE.get(chapter["number"], [])
        stages = {name: stage(name, why, name in WIDE_COMPONENTS) for name, why in placed}
        # The first component lands after the chapter's opening section, so a reader meets the
        # argument before the instrument; the rest follow the headings in order.
        heads = [i for i, block in enumerate(rendered) if block.startswith("<h3")]
        slots = {}
        for index, (name, _why) in enumerate(placed):
            if heads:
                slots[heads[min(index, len(heads) - 1)]] = name
        for index, block in enumerate(rendered):
            if index in slots:
                body.append("</div></div>")
                body.append(stages[slots[index]])
                body.append('<div class="p2-wrap"><div class="p2-col">')
            body.append(block)
        for name, _why in placed:
            if name not in slots.values():
                body.append("</div></div>")
                body.append(stages[name])
                body.append('<div class="p2-wrap"><div class="p2-col">')
        if notes:
            body.append('<section class="p2-notes"><div class="p2-arch">'
                        + emit_plain("notes and claim ids") + "</div><ol>")
            for mark, note in notes:
                anchor = f'{chapter["file"]}-{mark}'
                body.append(f'<li id="fn-{esc(anchor)}">{render_inline(note, chapter)} '
                            f'<a href="#fnref-{esc(anchor)}" class="p2-fnref">↩</a></li>')
            body.append("</ol></section>")
        body.append("</div></div></section>")
    body.append("</main>")

    body.append('<div class="p2-wrap"><section class="p2-colophon" id="p2-audit">'
                '<div class="p2-arch">' + emit_plain("what this page checked while you loaded it")
                + '</div><div id="p2-audit-body" class="p2-col"></div></section></div>')
    body.append('<div class="p2-wrap"><footer class="p2-colophon"><div class="p2-arch">'
                + emit_plain("colophon") + "</div><dl>")
    for term, definition in COLOPHON:
        body.append(f"<dt>{emit_plain(term)}</dt><dd>{emit(definition, (), 'colophon')}</dd>")
    body.append("</dl></footer></div>")

    # Era 5 is one of the six frozen files a guard may read, and `era-records.js` takes THAT copy
    # rather than fetching a second one — "two copies of one file in one page is the defect this
    # project has hit at every stage". The payload therefore carries a null in era 5's slot and the
    # runtime puts the registry's own copy back, so the page inlines it once.
    frozen_payload = json.dumps({
        "frozen": FROZEN,
        "eraRecords": [None if r is FROZEN["era5"] else r for r in ERA_RECORDS],
        "verdicts": VERDICTS,
    }, separators=(",", ":"))

    css = "\n".join([
        (P2 / "lib" / "tokens.css").read_text(),
        (P2 / "charts" / "chart-demo.css").read_text(),
        (P2 / "eras" / "eras.css").read_text(),
        (P2 / "auction" / "auction-bench.css").read_text(),
        (P2 / "door" / "door-bench.css").read_text(),
        (P2 / "toll" / "toll.css").read_text(),
        PAGE_CSS,
    ])

    # AN INLINED PAGE IS A PAGE WHERE A STRING CAN CLOSE A TAG.
    # `</script>` inside the bundle or inside the record would end the element early, and the rest
    # of the file would render as text. The JSON is escaped where the escape is lossless — `<\/`
    # is a valid JSON escape and parses to the same string. Nothing rewrites JavaScript, because a
    # rewrite inside a regex literal changes what it matches, so the bundle is REFUSED instead.
    frozen_payload = frozen_payload.replace("</", "<\\/")
    if "</script" in bundle.lower():
        die("PART 9", "the module bundle contains a closing script tag",
            "an inlined script cannot carry one; move the string into the record, or split it")
    if "</style" in css.lower():
        die("PART 9", "the stylesheet contains a closing style tag",
            "an inlined stylesheet cannot carry one")

    return "\n".join([
        "<!doctype html>",
        '<html lang="en"><head><meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        f"<title>{emit_plain('The Attention Economy')}</title>",
        f"<style>{css}</style>",
        '</head><body class="p2 p2-paper-ground">',
        "".join(body),
        f'<script id="p2-frozen" type="application/json">{frozen_payload}</script>',
        f"<script>{bundle}</script>",
        f"<script>{RUNTIME}</script>",
        "</body></html>",
    ])


COLOPHON = [
    ("the record",
     "Six frozen files, seven era records and the verifier's verdicts, inlined into this page "
     "whole. Nothing here re-researches and nothing summarises. claims.json carries 506 claims."),
    ("the numbers",
     "Every figure in the prose above traces to a claim id or to a named frozen file, and the "
     "build script refuses to write a page containing one that does not."),
    ("the instruments",
     "The seven era machines, the auction bench, the door bench, the seven toll plates and the "
     "four charts each run their own arithmetic gate against the record before they draw."),
    ("motion",
     "Six named verbs and one invented one, each with a complete alternative encoding rather than "
     "a disabled state. The rocker in the header forces either mode without touching your system "
     "setting."),
    ("what this page cannot tell you",
     "Whether a sentence is true. Every guard here checks a shape or a bounded record. The prose "
     "lint is a heuristic that knows about one claim and misses ordinary English, and an empty "
     "result from it has never been a clearance."),
]


RUNTIME = r"""
/* ---------------------------------------------------------------------------
 * THE PAGE'S OWN SCRIPT.
 *
 * Every guarantee in the six component folders fires at one call site and nowhere else. Nothing
 * scans a built page — so every audit and every whole-record assert those folders publish is
 * called here, before a component draws, and a failure puts a box on the page rather than a line
 * in a console nobody has open.
 * ------------------------------------------------------------------------- */
(function () {
  var boot = document.getElementById('p2-boot');
  var bootMsg = document.getElementById('p2-boot-msg');
  function die(err) {
    boot.style.display = 'block';
    bootMsg.textContent = (err && err.stack) ? err.stack : String(err);
    throw err;
  }
  try {
    var payload = JSON.parse(document.getElementById('p2-frozen').textContent);
    var guards = __req('lib/guards.js');
    var tokens = __req('lib/tokens.js');
    var motion = __req('lib/motion.js');

    /* The registry, injected rather than fetched. A page opened off a disk cannot fetch, and a
     * page on a static host should not have to. */
    guards.useFrozen(payload.frozen);
    var frozen = guards.snapshotFrozen();
    /* Era 5's slot is null in the payload: the registry already holds that file, and this page
     * inlines nothing twice. This is the same rule era-records.js follows over http. */
    var records = __req('eras/era-records.js').assertSevenEras(
      payload.eraRecords.map(function (record) { return record || guards.getFrozen('era5'); }));

    motion.initMotion();
    motion.installMotionToggle(document.getElementById('p2-motion'));

    /* THE LIBRARY'S OWN ALARMS. Each is a claim this page makes; each of these is what makes the
     * claim checkable. */
    tokens.verifyTokenParity();
    tokens.auditPalette();
    motion.auditReducedCoverage();
    motion.auditTremorScope(frozen.claims);

    var organs = __req('eras/organs.js');
    organs.assertOrganSpine();
    organs.assertColourBudget();

    /* G7 layer one, over the whole frozen file, before any panel or stop is drawn. */
    guards.assertSimulatorMechanismScopes();

    var eraPlan = __req('eras/era-plan.js');
    var eraMachine = __req('eras/era-machine.js');
    var pullRing = __req('eras/pull-ring.js');
    var railBoard = __req('charts/rail-board.js');
    var valueChart = __req('charts/value-chart.js');
    var bank = __req('charts/small-multiples.js');
    var strip = __req('charts/gdp-strip.js');
    var tollPlan = __req('toll/toll-plan.js');
    var tollPlate = __req('toll/toll-plate.js');
    var auction = __req('auction/bench.js');
    var auctionScenarios = __req('auction/scenarios.js');
    var doorBench = __req('door/bench.js');
    var doorScenarios = __req('door/scenarios.js');
    var doorDrawing = __req('door/drawing.js');
    var doorEngine = __req('door/engine.js');

    doorDrawing.assertDoorColourBudget();
    tollPlate.assertTollColourBudget();
    doorEngine.assertFiledTotalsClose(frozen.mechanism);
    doorEngine.assertClaimCopiesAgree(frozen.mechanism, frozen.claims);

    function host(name) { return document.getElementById('stage-' + name); }

    /* ---- the charts ---- */
    var boardHost = host('rail-board');
    if (boardHost) {
      var board = railBoard.renderRailBoard(boardHost, frozen);
      boardHost.appendChild(board.caption);
    }
    if (host('value-chart')) valueChart.renderValueChart(host('value-chart'), frozen, {});
    if (host('small-multiples')) bank.render(host('small-multiples'), frozen, { mode: 'share' });
    if (host('gdp-strip')) {
      strip.render(host('gdp-strip'), frozen, { window: 'narrow', verdicts: payload.verdicts });
    }

    /* ---- the seven machines ----
     * One plan per era, and one drawer plan per organ, so a pull ring on any machine opens the
     * same part across all seven. The drawer is built once for the page. */
    var plans = records.map(function (record) {
      return eraPlan.planEra(record, frozen, { scope: 'era-native' });
    });
    var drawerPlans = new Map();
    organs.FIELDS.forEach(function (field) {
      drawerPlans.set(field, eraPlan.planCrossEra(field, records, frozen));
    });
    var teacher = pullRing.createTeacher();
    var drawer = pullRing.createDrawer(document.body);
    for (var era = 1; era <= 7; era += 1) {
      var slot = host('era-' + era);
      if (!slot) continue;
      (function (slot, era) {
        var out = eraMachine.renderEraMachine(slot, plans[era - 1], {
          onFirstCrank: function () { rings.teachAfterFirstCrank(); }
        });
        var rings = pullRing.installPullRings(out.svg, {
          teacher: teacher,
          teaching: era === 1,
          onPull: function (field) { drawer.show(drawerPlans.get(field)); }
        });
      }(slot, era));
    }

    /* ---- the seven toll plates ----
     * renderTollPlates draws all seven or throws, and this folder exports no renderPlate(era).
     * A screenshot of the last plate alone is a thing somebody has to crop. */
    if (host('toll-plates')) {
      tollPlate.renderTollPlates(host('toll-plates'), tollPlan.planTollPlates(records, frozen));
    }

    /* ---- the auction bench ---- */
    if (host('auction-bench')) {
      var slotA = host('auction-bench');
      var railA = document.createElement('div');
      railA.className = 'ab-rail';
      slotA.appendChild(railA);
      var benchHost = document.createElement('div');
      slotA.appendChild(benchHost);
      var bench = auction.renderBench(benchHost, {
        scenario: 1, mechanism: frozen.mechanism, params: frozen.simulatorParams
      });
      var benchButtons = [];
      auctionScenarios.SCENARIOS.forEach(function (scenario) {
        var channels = scenario.centre === 'plates' ? ['display', 'search'] : [null];
        channels.forEach(function (channel) {
          var button = document.createElement('button');
          button.type = 'button';
          button.textContent = channel
            ? scenario.n + ' · ' + scenario.short + ' · ' + channel
            : scenario.n + ' · ' + scenario.short;
          button.addEventListener('click', function () {
            bench.show(scenario.n, channel);
            benchButtons.forEach(function (other) {
              other.setAttribute('aria-current', String(other === button));
            });
          });
          railA.appendChild(button);
          benchButtons.push(button);
        });
      });
      benchButtons[0].setAttribute('aria-current', 'true');
    }

    /* ---- the door bench ---- */
    if (host('door-bench')) {
      var slotD = host('door-bench');
      var railD = document.createElement('div');
      railD.className = 'db-rail';
      slotD.appendChild(railD);
      var doorHost = document.createElement('div');
      slotD.appendChild(doorHost);
      var door = doorBench.renderDoorBench(doorHost, {
        stop: 1, mechanism: frozen.mechanism, params: frozen.simulatorParams, claims: frozen.claims
      });
      var doorButtons = [];
      doorScenarios.ACTS.forEach(function (act) {
        var label = document.createElement('div');
        label.className = 'db-act-label';
        label.textContent = 'Act ' + act.n + ' · ' + act.title + ' — ' + act.what;
        railD.appendChild(label);
        doorScenarios.STOPS.filter(function (s) { return s.act === act.n; }).forEach(function (s) {
          var button = document.createElement('button');
          button.type = 'button';
          button.textContent = s.n + ' · ' + s.short;
          button.addEventListener('click', function () {
            door.show(s.n);
            doorButtons.forEach(function (other) {
              other.setAttribute('aria-current', String(other === button));
            });
          });
          railD.appendChild(button);
          doorButtons.push(button);
        });
      });
      doorButtons[0].setAttribute('aria-current', 'true');
    }

    /* ------------------------------------------------------------------
     * THE PAGE CHECKS ITSELF.
     *
     * Every component folder closes its README with the same sentence: nothing scans the built
     * page. This is the built page, so it scans itself — with the components' OWN gates, at the
     * real call sites, over the record it is holding. The counts go on the page rather than into
     * a console, because a check whose result nobody sees is a check nobody runs.
     * ---------------------------------------------------------------- */
    var arithmetic = __req('auction/arithmetic.js');
    var panels = __req('auction/panels.js');
    var doorGate = __req('door/gate.js');
    var audit = { auctionSteps: 0, auctionBad: 0, benchFails: 0, vacuous: 0, derived: 0,
                  doorSteps: 0, doorBad: 0, lint: 0, strings: 0 };

    var selfCheck = arithmetic.checkRecordSelfConsistent(frozen.mechanism);
    audit.auctionSteps = selfCheck.total;
    audit.auctionBad = selfCheck.failed.length;
    var doorSelf = doorGate.checkRecordSelfConsistent(frozen.mechanism);
    audit.doorSteps = doorSelf.total;
    audit.doorBad = doorSelf.failed.length;

    var everyFigure = [];
    auctionScenarios.SCENARIOS.forEach(function (scenario) {
      var channels = scenario.centre === 'plates' ? ['display', 'search'] : [null];
      channels.forEach(function (channel) {
        var panel = panels.mintPanel(scenario.id, { channel: channel });
        var ctx = { settings: panel.settings, mechanism: frozen.mechanism,
                    params: frozen.simulatorParams, record: panel.record, panel: panel };
        var opening = auctionScenarios.defaultState(scenario, ctx);
        var controls = scenario.controls(ctx, opening);
        /* Each control contributes its opening value, its two ends and every stop the record
         * marks — the positions the record itself names, which is what the gate sweeps. */
        var candidates = controls.map(function (c) {
          return c.kind === 'rocker'
            ? c.options.map(function (o) { return o.value; })
            : [c.value, c.min, c.max].concat(c.stops || []);
        });
        var combos = [{}];
        controls.forEach(function (control, i) {
          var next = [];
          combos.forEach(function (combo) {
            candidates[i].forEach(function (value) {
              var merged = Object.assign({}, combo);
              merged[control.id] = value;
              next.push(merged);
            });
          });
          combos = next.slice(0, 2000);
        });
        combos.forEach(function (combo) {
          var view = scenario.build(Object.assign({}, opening, combo), ctx);
          var shown = auctionScenarios.viewFigures(view);
          var check = arithmetic.checkFiguresAgainstRecord(shown, frozen.mechanism);
          everyFigure = everyFigure.concat(shown);
          audit.derived += check.derived.length;
          if (check.vacuous) audit.vacuous += 1;
          if (!check.ok) audit.benchFails += check.failed.length + check.unbacked.length;
        });
      });
    });
    var coverage = arithmetic.stepCoverage(everyFigure, frozen.mechanism);

    /* THE PROSE LINT, over every string on the finished page. ADVICE, and it says so: a regex
     * over English that knows about one claim and misses ordinary sentences. An empty result has
     * never been a clearance, and the limits print beside the count. */
    /* THE ROOTS ARE THE READER-FACING ONES, AND THAT IS NOT A CONVENIENCE.
     * `domSentences` walks every text-bearing leaf, and a <script> element is one. Pointed at
     * document.body it reads the inlined bundle — 1.4 MB of JavaScript, including the lint's own
     * vocabulary — and reports forty findings that are the guard reading itself. The corpus is
     * the masthead, the ten chapters and the colophon: the text a reader can read. */
    var pageStrings = [];
    ['.p2-masthead', 'main', '.p2-colophon'].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (root) {
        pageStrings = pageStrings.concat(auction.domSentences(root));
      });
    });
    audit.strings = pageStrings.length;
    audit.lint = pageStrings.reduce(function (n, text) {
      return n + guards.lintTextForDeadMechanism(text, 'the built page').length;
    }, 0);

    var box = document.getElementById('p2-audit-body');
    function auditLine(text) {
      var el = document.createElement('p');
      el.className = 'p2-prose';
      el.textContent = text;
      box.appendChild(el);
    }
    auditLine(audit.auctionSteps + ' stored steps in the auction engine and ' + audit.doorSteps
      + ' in the distribution engine re-run here, in the browser, against their own stored '
      + 'answers. ' + (audit.auctionBad + audit.doorBad) + ' disagree.');
    auditLine(audit.benchFails + ' figures on the auction bench fail to re-derive from the record, '
      + 'across every control position the record names — the ledger, the money zone and the band. '
      + audit.vacuous + ' of those positions handed the gate nothing it could check, and any at '
      + 'all is a failure.');
    auditLine(coverage.claimed + ' of ' + coverage.total + ' stored auction steps are claimed by '
      + 'a figure this page can show. ' + audit.derived + ' figures are worked out here rather '
      + 'than stored, and each prints its own derivation beside itself.');
    auditLine('The door bench re-derives every figure before it touches the page, on every paint, '
      + 'and refuses to draw if one fails.');
    auditLine('The prose lint read ' + audit.strings + ' strings on this page and returned '
      + audit.lint + ' finding(s). AN EMPTY RESULT IS NOT A CLEARANCE. It is a regex over '
      + 'English, it knows about one claim — the 2019 auction change — and it verifiably misses '
      + 'ordinary sentences. Its own written limits: '
      + guards.DEAD_MECHANISM_LINT_LIMITS.join(' '));
    auditLine('One thing about that count, so nobody has to work it out twice: the paragraph above '
      + 'quotes the lint\'s own written limits, and those limits contain the false sentences as '
      + 'examples. Run the lint again over the finished page and it finds them, in its own '
      + 'documentation. That is the known false-positive class — a sentence that names the false '
      + 'claim in order to correct it — and this whole piece is built out of them.');
    window.P2_AUDIT = audit;

    /* ---- the chapter rail ---- */
    var links = [].slice.call(document.querySelectorAll('.p2-nav a'));
    var sections = [].slice.call(document.querySelectorAll('.p2-chapter'));
    if ('IntersectionObserver' in window) {
      var watcher = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.setAttribute('aria-current',
              String(link.getAttribute('href') === '#' + entry.target.id));
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (section) { watcher.observe(section); });
    }

    window.P2 = { frozen: frozen, records: records, plans: plans, guards: guards };
  } catch (err) {
    die(err);
  }
}());
"""


# ============================================================================
# PART 10 · READING THE BUILT PAGE BACK
#
# The check that makes the other three worth anything. Every figure in the built page's own text is
# matched against the ledger `emit()` kept. A number that reached the page by any other route —
# a template this script writes, a string somebody adds later, a heading typed straight into the
# HTML — is found here and stops the build.
# ============================================================================

# The rendered forms of the same non-quantity constructs PART 2 already names in markdown. A
# footnote marker is [^12] going in and <sup class="p2-fnref">…12…</sup> coming out; it is the
# same non-quantity either way, and it has to be named at both ends or the page audit reports 176
# footnote numbers as untraced figures. Each rule must fire, for the same reason as PART 2's.
PAGE_STRIP = (
    ("rendered-footnote-ref", re.compile(r"<sup class=\"p2-fnref\">[\s\S]*?</sup>"),
     "a footnote marker as it renders: a superscript link that numbers a note."),
    ("rendered-claim-id", re.compile(r"<(code|span) class=\"p2-chrome p2-claimref\"[\s\S]*?</\1>"),
     "a claim id as it renders: an address in claims.json the chapter prints in full."),
    ("rendered-note-backlink", re.compile(r"<a href=\"#fnref-[^\"]*\"[^>]*>[\s\S]*?</a>"),
     "the arrow back from a note to the sentence that called it."),
)
PAGE_STRIP_FIRINGS = {name: 0 for name, _, _ in PAGE_STRIP}

TAG_RE = re.compile(r"<[^>]+>")
SCRIPT_RE = re.compile(r"<script\b[^>]*>[\s\S]*?</script>", re.I)
STYLE_RE = re.compile(r"<style\b[^>]*>[\s\S]*?</style>", re.I)
TRACED_SPAN = re.compile(
    r'<span class="p2-fig[^"]*"(?: data-(?:claim|record|census|derived)="[^"]*")?[^>]*>'
    r'([^<]*)</span>')


def audit_built_page(page):
    """Read the page back and prove no number reached it except through emit()."""
    prose = SCRIPT_RE.sub(" ", STYLE_RE.sub(" ", page))
    for name, pattern, _why in PAGE_STRIP:
        prose, hits = pattern.subn(" ", prose)
        PAGE_STRIP_FIRINGS[name] += hits
    dead = [name for name, count in PAGE_STRIP_FIRINGS.items() if count == 0]
    if dead:
        raise VacuousError(
            f"PART 10: these rendered-form rules matched nothing on the built page: {dead}.\n"
            "    fix: a rule that fires zero times is not protecting anything and will absorb a "
            "real figure the day the renderer changes shape.")
    traced = [html.unescape(m.group(1)) for m in TRACED_SPAN.finditer(prose)]
    untraced_html = TRACED_SPAN.sub(" ", prose)
    text = html.unescape(TAG_RE.sub(" ", untraced_html))
    leaked = scan_figures(text)
    if leaked:
        sample = ", ".join(sorted({f["token"] for f in leaked})[:12])
        die("PART 10",
            f"{len(leaked)} figure(s) reached the built page without going through emit(): {sample}",
            "every reader-facing string must be routed through emit(); a number that is not is a "
            "number nothing traced")
    return len(traced), len(leaked)


# ============================================================================
# PART 11 · BUILD
# ============================================================================

def main():
    chapters = [read_chapter(name) for name in CHAPTER_FILES]
    for chapter in chapters:
        chapter["_named"] = set(CLAIM_ID_RE.findall(chapter["body"]))
        chapter["_figures"] = scan_figures(chapter["body"])
        chapter["_years"] = {int(y) for y in YEAR_RE.findall(chapter["body"])}

    global PROBE_CHAPTER
    PROBE_CHAPTER = chapters[0]

    cited = sum(check_chapter_citations(chapter) for chapter in chapters)
    assert_rules_fired()

    bundle, order = build_bundle()
    tests = self_tests(bundle, order)

    page = render_page(chapters, bundle)

    if UNRESOLVED:
        lines = "\n".join(
            f"    {entry['where']}: {entry['token']!r}" for entry in UNRESOLVED[:25])
        die("PART 3",
            f"{len(UNRESOLVED)} figure(s) on the page resolve to nothing in the frozen record:\n"
            + lines,
            "each one is either a number the record does not carry, a number this build cannot "
            "yet re-compute from the record, or a form that is not a quantity at all. Nothing "
            "gets written until every one of them is named")

    traced, leaked = audit_built_page(page)
    OUT.write_text(page)

    # ---- the report ----
    counts = {}
    for entry in LEDGER:
        klass = entry["resolved"]["class"] if entry["resolved"] else "UNRESOLVED"
        counts[klass] = counts.get(klass, 0) + 1
    claim_ids_used = {entry["resolved"]["cite"] for entry in LEDGER
                      if entry["resolved"] and entry["resolved"]["class"].startswith("claim")}

    print(f"wrote {OUT.relative_to(ROOT)} ({len(page) // 1024} KB)")
    print()
    print("  THE SPINE")
    for chapter in chapters:
        placed = ", ".join(name for name, _ in SPINE.get(chapter["number"], [])) or "—"
        print(f"    {str(chapter['number']).rjust(2, '0')} {chapter['title']:<26} {placed}")
    print(f"    era-1 teaching gate kept on later machines: {ERA_GATE_KEPT}")
    print()
    print("  THE NUMBER GATE")
    print(f"    figures the page renders            {len(LEDGER)}")
    print(f"    └ traced to a claim id             "
          f"{counts.get('claim-value', 0) + counts.get('claim-words', 0)}"
          f"  ({counts.get('claim-value', 0)} to a claim's own central or interval, "
          f"{counts.get('claim-words', 0)} to a figure inside its statement or method)")
    print(f"    └ traced to another frozen file    {counts.get('record', 0)}")
    print(f"    └ a count of the record, re-derived {counts.get('census', 0)}")
    print(f"    └ derived by this build, derivation printed beside it {counts.get('derived', 0)}")
    print(f"    └ dates inside the record's range  {counts.get('year', 0)}")
    print(f"    └ resolving to nothing             {counts.get('UNRESOLVED', 0)}")
    print(f"    distinct claim ids quoted on the page {len(claim_ids_used)} "
          f"of {len(CLAIMS)} in the record")
    print(f"    frontmatter claim ids checked         {cited} across {len(chapters)} chapters, "
          f"0 unknown, 0 rejected, 0 unused by their own prose")
    print(f"    figures carrying their trace in the HTML {traced}")
    print(f"    figures that reached the page any other way {leaked}")
    print()
    print("  NON-QUANTITY FORMS REFUSED THE SCANNER (each must fire, or the build stops)")
    for name, _pattern, why in NON_QUANTITY:
        print(f"    {name:<14} {RULE_FIRINGS[name]:>5}   {why}")
    print()
    print("  THE BUNDLE")
    print(f"    modules inlined {len(order)} · live bindings preserved "
          f"{sorted(LIVE_BINDINGS)}")
    print()
    print("  SELF-TESTS (every refusal handed the thing it forbids)")
    for name, verdict, detail in tests:
        print(f"    {verdict:<8} {name}")
        if VERBOSE and detail:
            print(f"             {detail}")


if __name__ == "__main__":
    try:
        main()
    except BuildError as error:
        print(f"BUILD REFUSED\n{error}", file=sys.stderr)
        sys.exit(1)
