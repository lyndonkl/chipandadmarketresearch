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

THE GATE THIS BUILD USED TO SET, AND WHY IT WAS WORSE THAN NOTHING.

The old rule was "every number the page renders traces to a claim id". It reached that verdict by
SEARCHING: it took the number, swept all 506 claims and five frozen files, and attached whichever
claim happened to hold a matching value. 2,314 of 3,278 figures came back "traced", and the count
meant almost nothing, because a match on a value is not a citation. An adversary put three flat
falsehoods into chapter 1 and the build shipped them with clean provenance: "5" was cited to a
claim about owned-versus-syndicated revenue retention, "36.7%" to a claim about NEWSPAPERS in 1949,
and "$196.18 billion" to the era records when the figure is Meta's revenue. Every one of those
citations was manufactured by coincidence, and a citation manufactured by coincidence is worse than
no citation at all: it does not merely fail to verify the number, it lends the number authority it
has not earned, in the exact place a reader goes to check.

THE RULE NOW: CITATION BY AUTHORSHIP.

  1. Every reader-facing string this script writes goes through ONE function, `emit()`. There is no
     second way to put text on the page. (Thirteen strings on one auction panel once carried a
     false claim past every green guard because they were written somewhere no check was looking.)
  2. A figure carries a `data-claim` attribute ONLY where the chapter's author linked it — an
     inline claim id, or a footnote marker whose note names a claim. The build never searches for a
     source. It reads the ids the author wrote in the same sentence, and looks at nothing else.
  3. Where the author did link one, the link is CHECKED: the figure must re-compute from that
     claim's own central, interval, statement or method. A link that does not check out is not
     printed. So the only way to get a citation onto this page is to write one and be right.
  4. Every other figure renders with no provenance attribute at all. That is a KNOWN GAP, and the
     colophon and the build report both print how many there are. An uncited number is a gap; a
     wrongly cited one is a lie with a footnote.
  5. A passage the chapter declares invented — chapter 7's three worked examples — is fenced, and
     inside the fence a citation is not merely absent but REFUSED. An invented number wearing a
     source attribute is the same defect as a falsehood wearing one.
  6. The built page is then read back, its tags stripped, and every figure in the resulting text is
     matched against the ledger `emit()` kept. A number that reached the page by any other route
     fails the build. This is the check that makes movements 1 to 5 worth anything.

Every refusal above has a self-test in PART 8 that feeds it the thing it forbids and requires it to
throw. A check that cannot fire is worse than no check; this project has paid for that lesson six
times, and the seventh was in PART 8 itself — `census_resolves()` reported REFUSED whether its
branch worked or not, because it signalled success by raising the same exception class the harness
read as a pass. PART 8 now separates the two verbs: `refuses()` requires a named refusal, `proves()`
requires a clean return, and neither can be satisfied by the other's outcome.
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

# A four-digit year and a dash, sitting immediately before the figure being scanned. What follows is
# the second half of "2002-07", which is a date and not a measurement. Anchored to the end of the
# text that precedes the match, so it reads the two characters before the token and nothing else.
YEAR_RANGE_TAIL = re.compile(r"(?:1[5-9]|20)\d{2}\s*[-–—/]\s*$")

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
        elif (decimals == 0 and not dollar and len(raw) == 2
              and YEAR_RANGE_TAIL.search(scannable[:match.start()])):
            # THE TAIL OF A YEAR RANGE IS STILL A YEAR. "2002-07" is one date span written the way
            # every historian writes it, and the "07" is not a reading of anything. Scanned as a
            # bare quantity it became the value 7.0 with a tolerance of 0.5, and that is wide
            # enough to reach ln(7.3516) sitting inside a claim's own long division — so the page
            # underlined a truncated year and cited it to a claim about revenue capture. Nothing
            # in that record measures seven of anything.
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
# PART 3 · THE CITATION, AND WHO IS ALLOWED TO MAKE ONE
#
# THIS PART USED TO BE CALLED THE RESOLVER, AND IT USED TO SEARCH.
#
# It took a figure off the page and swept the whole record for anything that matched it: 506 claims
# by central and interval, then 506 claims by every number inside their prose, then five frozen
# files by every number anywhere in them, then a census of the record's own shape. The first thing
# that matched became the citation printed beside the number.
#
# With that many haystacks, a match means almost nothing. "5" matched a claim about the ratio
# between owned and syndicated revenue retention. "36.7%" matched a claim about newspapers in 1949.
# "$196.18 billion" matched a number sitting somewhere in the seven era files. All three were
# adversarial insertions into chapter 1 and all three shipped with a footnote-grade citation, and
# the ladder below is gone because of them.
#
# WHAT IS LEFT IS NOT A SEARCH. `check_marked_figure()` is handed the claim ids THE CHAPTER'S AUTHOR
# WROTE IN THE SAME SENTENCE, and it may consult those and nothing else. Its answer is yes or no,
# never "here is one I found". A figure the author did not link has no citation, and that is
# reported rather than repaired.
# ============================================================================

# Reading the RECORD's own sentences, where a figure is often written against a letter: a method
# reading "grown to 1914 at the Census newspaper-receipts ratio x1.131" carries a number the
# stricter form above cannot see. Widening it here widens only what the page may RESOLVE TO; the
# scanner that decides what counts as a figure ON the page keeps the strict form.
NUMBER_IN_RECORD = re.compile(r"(?<![\d.])(\d(?:[\d,]*\d)?(?:\.\d+)?)")
URL_RE = re.compile(r"https?://\S+")


def numbers_in_prose(value):
    out = set()
    for match in NUMBER_IN_RECORD.finditer(URL_RE.sub(" ", value)):
        try:
            out.add(float(match.group(1).replace(",", "")))
        except ValueError:
            pass
    return out


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


def claim_years(claim):
    """The years THIS claim places its fact in, and the only things a date in prose may cite.

    Three sources, all of them calendars rather than measurements: the record's own `about_year`
    and `about_span` fields, and any four-digit year written into the claim's sentences. `as_of` is
    deliberately absent — it is when somebody published, never when the fact happened, and the
    schema says a chart may not read it either.
    """
    out = set()
    if isinstance(claim.get("about_year"), int):
        out.add(float(claim["about_year"]))
    for year in claim.get("about_span") or []:
        if isinstance(year, int):
            out.add(float(year))
    for key in ("statement", "method"):
        value = claim.get(key)
        if isinstance(value, str):
            out |= {n for n in numbers_in_prose(value) if 1500 <= n <= 2100 and n == int(n)}
    return out


CLAIM_VALUES = {cid: claim_values(c) for cid, c in CLAIMS.items()}
CLAIM_WORDS = {cid: claim_words(c) for cid, c in CLAIMS.items()}
CLAIM_YEARS = {cid: claim_years(c) for cid, c in CLAIMS.items()}

# Every year the record places a fact in. Nothing on the page CITES this — a year range is not a
# source — but a date the record never touches is worth counting in the report, so the build keeps
# the range and says how many dates fall outside it.
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
YEAR_FLOOR, YEAR_CEILING = min(RECORD_YEARS), max(RECORD_YEARS)


# THE RECORD, COUNTED AT BUILD TIME.
#
# Facts about the record's own shape — how many claims it holds, how many spend points, how many
# era files. These are not measurements of the advertising market and no claim carries them, so
# they were never citable; the old build let prose reach them by value match, which is how the
# colophon's "506 claims" came to be traced to a coincidence in a frozen file. They are now
# available to ONE caller — `emit_derived()`, where the build states in words that it worked the
# number out itself — and to nothing else.
def _record_counts():
    adspend = FROZEN["adspend"]
    series = adspend.get("series", {})
    return {
        "points": sum(len(s.get("points") or []) for s in series.values()),
        "series": len(series),
        "claims": len(CLAIMS),
        "eras": len(ERA_RECORDS),
        # A rail is a series; a compiler is a series somebody OUTSIDE this project published. The
        # difference is in the record: every point of a constructed series carries `bridged: true`,
        # which is the same test `charts/rail-board.js` uses to hatch that rail rather than band it.
        "constructed": sum(
            1 for s in series.values()
            if (s.get("points") or []) and all(p.get("bridged") is True for p in s["points"])),
    }


RECORD_COUNTS = _record_counts()
RECORD_COUNTS["compilers"] = RECORD_COUNTS["series"] - RECORD_COUNTS["constructed"]


def reaches(candidates, world):
    return any(abs(value - target) <= tolerance
               for target, tolerance in candidates for value in world)


def check_marked_figure(figure, marks):
    """Does this figure re-compute from a claim THE AUTHOR MARKED IT WITH? Yes, or no.

    `marks` is not a search space. It is the list of claim ids the chapter wrote in this figure's
    own sentence — an inline id, or a footnote marker whose note names a claim. Two or three ids at
    the outside. The old resolver was handed the chapter's whole frontmatter list, seventy ids
    wide, and then five frozen files behind that, and at that width a coincidence is not a rare
    event but the expected one.

    Returning None is a normal outcome and not an error. It means the page prints the number with
    no provenance, which is exactly what an unlinked number deserves.

    A DATE IS NOT A MEASUREMENT, so a date is matched against the years a claim places its fact in
    and never against the claim's value. A `central` is something somebody counted; it is not a
    calendar. Letting the two meet by arithmetic is how an injected sentence saying search moved to
    a first-price sale "in 2019" earned a citation to a claim whose central is 2019.68 — a
    measurement of the open-web display exchange, in a sentence about search. It is also how the
    "07" in "2002-07" reached a working term inside a claim's long division. Both were the same
    hole: a year read as a quantity, then matched by value against numbers that were never dates.
    """
    if figure["kind"] == "year":
        for cid in marks:
            if figure["value"] in CLAIM_YEARS.get(cid, ()):
                return {"class": "claim-year", "cite": cid,
                        "detail": "a year this claim places its fact in"}
        return None
    for cid in marks:
        if reaches(figure["candidates"], CLAIM_VALUES.get(cid, ())):
            return {"class": "claim-value", "cite": cid,
                    "detail": CLAIMS[cid].get("unit", "")}
    for cid in marks:
        if reaches(figure["candidates"], CLAIM_WORDS.get(cid, ())):
            return {"class": "claim-words", "cite": cid,
                    "detail": "quoted from the claim's own statement or method"}
    return None


# ============================================================================
# PART 4 · THE ONE PLACE TEXT REACHES THE PAGE
#
# `emit()` is the only function in this file that turns a string into HTML. Everything a reader can
# read goes through it: chapter prose, headings, table cells, the page's own furniture, every
# caption this script writes. There is no second route, and PART 9 proves it by reading the built
# page back.
# ============================================================================

LEDGER = []          # every figure emitted, and the citation the author earned for it or did not


def esc(text):
    return html.escape(str(text), quote=True)


def emit(text, marks=(), where="page furniture", invented=False):
    """Escape a string, cite the figures the author linked, and leave every other figure alone.

    `marks` is the claim ids the chapter wrote in THIS text's own sentence — see PART 5's
    `marks_in()`. A figure that checks out against one of them gets `data-claim`. A figure that
    does not gets a `<span class="p2-fig">` with NO provenance attribute of any kind: no data-claim,
    no data-record, no data-census, no title a reader could mistake for a source.

    WHY AN UNCITED FIGURE IS STILL WRAPPED. The span carries nothing and shows nothing — it renders
    as the number, in the page's numeral face — `p2-num` is the token system's numeral role and
    belongs on every digit on the page, cited or not. It exists so PART 10 can read the HTML back and
    prove that every figure on the page came through this function, which is the guarantee that
    makes everything above it worth anything. The wrapper is a receipt for the build, not a claim
    to the reader.

    `invented` is chapter 7's three worked examples, which say in their own prose that the
    advertisers and their numbers are made up. Inside a fence a citation is not absent, it is
    REFUSED: an invented number wearing a source attribute is the same defect as a false one
    wearing a citation, and it was shipping 25 of them against mechanism.json.
    """
    if invented and marks:
        die("PART 4",
            f"a claim id was marked inside a passage the chapter declares invented: {list(marks)}",
            "the fence says these numbers are made up. Either the passage is not invented and the "
            "fence is wrong, or the citation is. Both cannot stand")
    figures = scan_figures(text)
    out = []
    cursor = 0
    for figure in figures:
        out.append(esc(text[cursor:figure["start"]]))
        cited = None if invented else check_marked_figure(figure, marks)
        token = esc(figure["token"])
        LEDGER.append({"where": where, "token": figure["token"], "kind": figure["kind"],
                       "cited": cited, "marked": bool(marks), "invented": invented})
        # A DATE IS NOT A READOUT. `p2-num` is the token system's numeral role — the mono face,
        # weight 600, tabular — and it belongs on a quantity. A year set in it reads as a
        # measurement of something, which is the one thing a year is not. That distinction was in
        # the page before this pass and it stays.
        role = "p2-fig" if figure["kind"] == "year" else "p2-fig p2-num"
        if cited is None:
            out.append(f'<span class="{role}">{token}</span>')
        else:
            out.append(
                f'<span class="{role} p2-cited" data-claim="{esc(cited["cite"])}" '
                f'title="{esc(cited["cite"])} · {esc(cited["detail"])}">{token}</span>')
        cursor = figure["end"]
    out.append(esc(text[cursor:]))
    return "".join(out)


def emit_derived(text, derivation, where="page furniture"):
    """A number this script worked out from the record rather than read out of it.

    The page furniture needs a few: a chapter's own ordinal, the window the era records cover, the
    size of the record itself. None is a measurement of the advertising market and none is in
    claims.json, so none can carry a claim id. THIS IS NOT A CITATION AND THE REPORT NEVER COUNTS
    IT AS ONE. It is the build saying, in words, what arithmetic it did — `mintReading`'s
    `derivedFrom`, `checkProvenance`'s twelve-character rule: a figure the gate cannot check is one
    a reader can SEE is unchecked. A blank or throwaway derivation is refused.

    The one thing this must never become is a file-name attribute. "180 years", in the first
    sentence of chapter 1, used to carry `data-record="mechanism.json"` because that file happens
    to hold the number 180 somewhere. A file name is not provenance. Nothing reaches this function
    unless a caller in THIS script can write the sentence that produced the number.
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
                   "cited": None, "marked": False, "invented": False})
    return (f'<span class="p2-fig p2-num p2-derived" data-derived="{esc(derivation)}" '
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
# PART 5 · THE CHAPTERS, AND THE MARKS THEIR AUTHORS MADE
#
# Frontmatter, the markdown the ten chapters actually use, and the checks BUILD-PLAN.md sets on the
# pairing of the two.
#
# THE MARK IS THE WHOLE CITATION SYSTEM NOW, so it is worth being exact about what one is. Three
# forms are already in the chapters and no fourth is invented here:
#
#   INLINE ID        `[e2-creators-002]`, or a bare id in a table cell. Chapters 3, 8, and the
#                    source tables that close chapters 1 and 10.
#   FOOTNOTE         `[^7]` where note 7 names a claim — "Claim `e1-sellers-004`, grade B" in
#                    chapter 2, "e5-events-001." in chapter 6. Chapters 2, 6 and part of 9.
#   TABLE ROW        a claim id anywhere in a row marks that row's cells.
#
# THE SCOPE OF A MARK IS ITS OWN SENTENCE, not its paragraph and not its chapter. That is the
# tightest reading of what the author did, and tightness is the point: the old build handed the
# figure seventy frontmatter ids plus five frozen files and called the first collision a source.
# A sentence carries two or three ids at the outside, and the author put them there.
#
# Chapters 4, 5 and 7 carry no marks at all. Their figures therefore carry no citation, and the
# report and the colophon both say how many that is. That is a gap with a name and a fix — mark
# them — which is a better position than 2,314 citations nobody could trust.
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
    chapter = {"file": filename, "meta": meta, "ids": ids, "body": body,
               "number": number, "title": title}
    chapter["_notes"] = chapter_notes(body)
    chapter["_invented"] = invented_lines(chapter)
    return chapter


# ---------------------------------------------------------------- the marks

# A footnote definition names its claims however its chapter's house style names them: chapter 2
# writes "Claim `e1-creators-001`, grade B", chapter 6 writes "e5-events-001." and chapter 9 writes
# "Claims e5-scale-015 and e5-scale-016". All three are the same act — the author saying which
# claim this note stands on — so the id itself is what is read, not the sentence around it.
def chapter_notes(body):
    notes = {}
    for line in body.splitlines():
        match = FOOTNOTE_DEF.match(line.strip())
        if match:
            notes[match.group(1)] = tuple(dict.fromkeys(CLAIM_ID_RE.findall(match.group(2))))
    return notes


def marks_in(text, chapter):
    """The claim ids this chunk of prose links itself to. Nothing is inferred and nothing is found.

    An id written in the chunk marks it. A footnote marker in the chunk marks it with whatever
    claims that note names. Order is the author's, and `check_marked_figure()` walks it in order,
    so a sentence citing two claims cites the first one that fits.
    """
    found = list(CLAIM_ID_RE.findall(text))
    for ref in FOOTNOTE_REF.findall(text):
        found.extend(chapter["_notes"].get(ref, ()))
    return tuple(cid for cid in dict.fromkeys(found) if cid in CLAIMS)


# ---------------------------------------------------------------- the invented fence

# THE ONE PLACE A CITATION IS FORBIDDEN RATHER THAN MERELY ABSENT.
#
# Chapter 7 works the ranking rule three times on made-up advertisers, and says so in its own
# prose: "The three advertisers below are invented, and so are their numbers." The old build put
# `data-record="mechanism.json"` on 25 of those figures, because the auction bench's stored steps
# happen to hold the same arithmetic — the example is right, the numbers do re-compute, and every
# one of those attributes was still a lie about where the number came from. The fence makes the
# lie unsayable: inside it, `emit(invented=True)` refuses a mark rather than ignoring it.
INVENTED_OPEN = re.compile(r"^<!--\s*invented:\s*(.+?)\s*-->$")
INVENTED_CLOSE = re.compile(r"^<!--\s*/invented\s*-->$")


def invented_lines(chapter):
    """Line index -> the reason this line's figures carry no provenance.

    Refuses an unclosed fence, a fence that closes without opening, and a fence with no figure
    inside it. The last one is the `VacuousError` rule in another costume: a fence protecting
    nothing is a fence that will absorb a real citation the day the prose moves.
    """
    marked, open_at, reason = {}, None, None
    lines = chapter["body"].splitlines()
    for index, line in enumerate(lines):
        stripped = line.strip()
        opened = INVENTED_OPEN.match(stripped)
        if opened:
            if open_at is not None:
                die("PART 5", f"{chapter['file']} opens an invented fence inside another one",
                    "fences do not nest; close the first one")
            if len(opened.group(1)) < 20:
                die("PART 5",
                    f"{chapter['file']} opens an invented fence with no reason: "
                    f"{opened.group(1)!r}",
                    "write the sentence that says what is made up and why it is on the page")
            open_at, reason = index, opened.group(1)
            continue
        if INVENTED_CLOSE.match(stripped):
            if open_at is None:
                die("PART 5", f"{chapter['file']} closes an invented fence that was never opened",
                    "every <!-- /invented --> needs its <!-- invented: ... --> above it")
            span = range(open_at, index + 1)
            if not any(scan_figures(lines[i]) for i in span):
                raise VacuousError(
                    f"PART 5: {chapter['file']} fences an invented passage that contains no "
                    f"figure at all, at line {open_at + 1}.\n"
                    "    fix: a fence with nothing to protect is decoration, and it will swallow a "
                    "real citation the first time the prose moves. Delete it or move it.")
            for i in span:
                marked[i] = reason
            open_at, reason = None, None
    if open_at is not None:
        die("PART 5", f"{chapter['file']} never closes the invented fence at line {open_at + 1}",
            "an unclosed fence would silently strip provenance from the rest of the chapter")
    return marked


def chapter_uses(chapter, cid):
    """Whether the chapter's prose uses this claim. Four ways, and each one is a real use.

    (a) the prose names the id;
    (b) it prints a figure that re-computes from the claim's central or interval;
    (c) it prints a figure that re-computes from a number inside the claim's own statement or
        method — a chapter quoting the record's working;
    (d) the claim IS a date (its unit says so) and the prose prints that year.

    Anything else and the frontmatter is carrying an id the reader never meets, which is a stale
    citation waiting to be quoted at somebody.

    BE HONEST ABOUT WHAT (b), (c) AND (d) ARE. They are value matches — the same inference this
    build no longer allows to put a citation on the page. They are kept here because this check
    does something different: it asks whether a frontmatter list has gone stale, and it prints
    nothing to a reader. The report says how many ids are actually MARKED in the prose, which is
    the number that means anything, and it is a great deal smaller.
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
    # A MARK IS A CITATION, SO IT HAS TO BE ONE THE CHAPTER DECLARES.
    # An id written beside a number but missing from the frontmatter is a source the chapter never
    # took responsibility for, and it is the cheapest way to smuggle one in: write "$196.18 billion
    # [e7-sellers-002]" and walk away. The frontmatter is where a chapter says what it stands on,
    # and now nothing can be cited from outside it.
    declared = set(chapter["ids"])
    undeclared = sorted({cid for cid in CLAIM_ID_RE.findall(chapter["body"])
                         if cid in CLAIMS and cid not in declared})
    if undeclared:
        die("PART 5",
            f"{chapter['file']} marks {len(undeclared)} claim id(s) its frontmatter never "
            f"declares: {undeclared[:8]}",
            "add them to claim_ids, or take the mark out. A citation the chapter's own header does "
            "not carry is a citation nobody signed")
    return len(chapter["ids"])


# THE COMPILER COUNT, WHICH THREE PLACES USED TO DISAGREE ABOUT.
#
# The rail board's caption said "the eight compilers". Chapter 1, sixty lines further down its own
# file, said "Five compilers". Chapter 9 said "Five compilers exist instead". The record says eight
# rails, of which seven are compilers — outside bodies who published a series — and one is the
# bridge this project built between two of them. Three numbers, one record, and nothing in the
# repository would have noticed.
#
# The caption is now written from `RECORD_COUNTS`, so it cannot drift. The chapters are prose and
# cannot be, so the phrase is checked instead: any chapter saying "N compilers" must agree with the
# record. It is a narrow rule and it fires on exactly the sentence that was wrong.
COUNT_WORDS = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7,
               "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12}
# A COUNT OF THE WHOLE, NOT A COUNT OF A SUBSET.
# "a bridge between two compilers' series" counts the two rails that bridge spans and says nothing
# about how many compilers the record holds, so the rule has to be able to tell the two apart. It
# skips a possessive, and skips a count governed by a preposition that names a part of a larger
# set. Everything left is a chapter stating how many compilers there are.
COMPILER_PHRASE = re.compile(
    r"(?:(\w+)\s+)?\b([A-Za-z]+|\d+)\s+compilers\b(?!['’])", re.I)
SUBSET_WORDS = {"between", "of", "among", "amongst", "across", "from", "either", "both", "those",
                "these", "other"}


def check_compiler_count(chapter):
    said = []
    for match in COMPILER_PHRASE.finditer(chapter["body"]):
        if (match.group(1) or "").lower() in SUBSET_WORDS:
            continue
        raw = match.group(2).lower()
        value = COUNT_WORDS.get(raw, int(raw) if raw.isdigit() else None)
        if value is not None and value != RECORD_COUNTS["compilers"]:
            said.append(match.group(0).strip())
    if said:
        die("PART 5",
            f"{chapter['file']} says {said[0]!r} and adspend.json holds "
            f"{RECORD_COUNTS['compilers']} compilers "
            f"({RECORD_COUNTS['series']} rails, {RECORD_COUNTS['constructed']} of them ours)",
            "the rail board draws one track per series and names the constructed one as ours. "
            "Say the same number the board draws, and say plainly which rail is not a compiler's")
    return len(said)


# ---------------------------------------------------------------- markdown

INLINE_CODE = re.compile(r"`([^`]+)`")
BOLD = re.compile(r"\*\*([^*]+)\*\*")
ITALIC = re.compile(r"(?<!\*)\*([^*\n]+)\*(?!\*)")
LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
BARE_URL = re.compile(r"https?://\S+")
FOOTNOTE_REF = re.compile(r"\[\^([^\]]+)\]")
FOOTNOTE_DEF = re.compile(r"^\[\^([^\]]+)\]:\s*(.*)$")


# SPLITTING PROSE INTO THE SCOPE A MARK ACTUALLY COVERS.
#
# A footnote or an inline id sits at the end of a SENTENCE, so the sentence is the unit. The split
# has to survive the markdown, though: cutting between the two halves of a `**bold sentence.**`
# would leave one asterisk pair on each side and render four stray asterisks. So a cut is only
# taken where the text either side is balanced — asterisks even, backticks even, brackets and
# parentheses matched — and where it is not, the two pieces stay joined.
#
# Erring toward MORE cuts loses citations; erring toward fewer widens a mark's scope. This errs
# toward more, which is the direction that cannot manufacture one.
SENTENCE_END = re.compile(r'(?<=[.!?])[*_`"\'”’)\]]*\s+')
ABBREVIATION = re.compile(
    r'(?:\b[A-Z]|\bNo|\bNos|\bpp|\bp|\bFig|\bvs|\bSt|\bMr|\bMrs|\bDr|\bInc|\bCo|\bJr|\bapprox|\bed)'
    r'\.$')


def balanced(text):
    """Whether a candidate sentence closes every markdown form it opened.

    COUNTING ASTERISKS IS NOT ENOUGH, and the first version of this did exactly that. Chapter 10's
    measurement roll opens each entry `**1914. The Audit Bureau of Circulations.**`, and a cut
    after "1914." leaves the piece "**1914. " — two asterisks, an even number, balanced by that
    test and broken in fact. Eighteen literal asterisk pairs rendered into the finished page. So
    the doubles are counted as doubles and the leftover singles separately, and both must be even.
    """
    doubles = text.count("**")
    singles = text.count("*") - 2 * doubles
    return (doubles % 2 == 0 and singles % 2 == 0 and text.count("`") % 2 == 0
            and text.count("[") == text.count("]") and text.count("(") == text.count(")"))


def split_sentences(text):
    """The sentences of a paragraph, concatenating back to exactly the paragraph."""
    pieces, start = [], 0
    for match in SENTENCE_END.finditer(text):
        if ABBREVIATION.search(text[start:match.start() + 1]):
            continue
        pieces.append(text[start:match.end()])
        start = match.end()
    pieces.append(text[start:])
    out, buffer = [], ""
    for piece in pieces:
        buffer += piece
        if balanced(buffer):
            out.append(buffer)
            buffer = ""
    if buffer:
        if out:
            out[-1] += buffer
        else:
            out.append(buffer)
    return [piece for piece in out if piece]


def render_prose(text, chapter, invented=False):
    """A paragraph, sentence by sentence, each sentence carrying only its own author's marks."""
    return "".join(render_inline(sentence, chapter, marks_in(sentence, chapter), invented)
                   for sentence in split_sentences(text))


def render_inline(text, chapter, marks=(), invented=False):
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
        label = emit(match.group(1), marks, chapter["file"], invented)
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
        return hold(f"<strong>{emit(match.group(1), marks, chapter['file'], invented)}</strong>")

    def on_italic(match):
        return hold(f"<em>{emit(match.group(1), marks, chapter['file'], invented)}</em>")

    text = BOLD.sub(on_bold, text)
    text = ITALIC.sub(on_italic, text)

    parts = re.split(r"\x00(\d+)\x00", text)
    out = []
    for index, part in enumerate(parts):
        if index % 2:
            out.append(held[int(part)])
        else:
            out.append(emit(part, marks, chapter["file"], invented))
    return "".join(out)


def render_chapter_body(chapter):
    """The ten chapters' markdown: headings, tables, lists, paragraphs, footnote definitions.

    Every block carries its own scope. A paragraph is split into sentences and each sentence sees
    only the marks its own author wrote; a table row's marks cover that row; a list item's cover
    that item. Nothing is passed down from the chapter, because a chapter-wide list of ids is what
    the old build called a citation.
    """
    lines = chapter["body"].splitlines()
    invented = chapter["_invented"]
    out = []
    notes = []
    index = 0
    while index < len(lines):
        line = lines[index]
        stripped = line.strip()
        opened = INVENTED_OPEN.match(stripped)
        if opened:
            # THE FENCE IS PRINTED, not just obeyed. A reader skimming for numbers should be told
            # where the made-up ones start without having to read the paragraph that says so.
            out.append(f'<p class="p2-arch p2-invented-note">'
                       f'{emit_plain("invented example · " + opened.group(1))}</p>')
            index += 1
            continue
        if not stripped or INVENTED_CLOSE.match(stripped):
            index += 1
            continue
        made_up = index in invented
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
            out.append(f'<{tag} class="{klass}">'
                       f'{render_inline(body, chapter, marks_in(body, chapter), made_up)}</{tag}>')
            index += 1
            continue
        if stripped.startswith("|"):
            table, first = [], index
            while index < len(lines) and lines[index].strip().startswith("|"):
                table.append(lines[index].strip())
                index += 1
            out.append(render_table(table, chapter, first in invented))
            continue
        if re.match(r"^[-*]\s+", stripped):
            items = []
            while index < len(lines) and re.match(r"^[-*]\s+", lines[index].strip()):
                items.append((re.sub(r"^[-*]\s+", "", lines[index].strip()), index in invented))
                index += 1
            out.append("<ul class=\"p2-prose\">" + "".join(
                f"<li>{render_prose(item, chapter, made_up)}</li>"
                for item, made_up in items) + "</ul>")
            continue
        if re.match(r"^\d+\.\s+", stripped):
            items = []
            while index < len(lines) and re.match(r"^\d+\.\s+", lines[index].strip()):
                items.append((re.sub(r"^\d+\.\s+", "", lines[index].strip()), index in invented))
                index += 1
            out.append("<ol class=\"p2-prose\">" + "".join(
                f"<li>{render_prose(item, chapter, made_up)}</li>"
                for item, made_up in items) + "</ol>")
            continue
        paragraph = []
        while index < len(lines) and lines[index].strip() and not lines[index].strip().startswith(
                ("#", "|", "- ", "* ", "<!--")) and not FOOTNOTE_DEF.match(lines[index].strip()):
            paragraph.append(lines[index].strip())
            made_up = made_up or index in invented
            index += 1
        out.append(f'<p class="p2-prose{" p2-invented" if made_up else ""}">'
                   f'{render_prose(" ".join(paragraph), chapter, made_up)}</p>')
    return out, notes


def render_table(rows, chapter, invented=False):
    cells = [[c.strip() for c in row.strip("|").split("|")] for row in rows]
    body = [r for r in cells if not all(re.fullmatch(r":?-{2,}:?", c or "-") for c in r)]
    if not body:
        die("PART 5", f"{chapter['file']} has a table with no rows",
            "a table that renders empty is an absence, and absence is drawn as an object here")
    head, rest = body[0], body[1:]
    klass = "p2-table p2-invented" if invented else "p2-table"
    out = [f'<div class="p2-tablewrap"><table class="{klass}">', "<thead><tr>"]
    for cell in head:
        out.append(f"<th>{render_inline(cell, chapter, marks_in(cell, chapter), invented)}</th>")
    out.append("</tr></thead><tbody>")
    for row in rest:
        # THE ROW IS THE SCOPE. A source table writes the claim id in the first cell and the number
        # it stands for in the second — chapter 1 closes with seventy rows of exactly that shape —
        # so a mark anywhere in the row covers the row and stops at its edge.
        row_marks = marks_in(" ".join(row), chapter)
        out.append("<tr>" + "".join(
            f"<td>{render_inline(cell, chapter, row_marks, invented)}</td>"
            for cell in row) + "</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


# ============================================================================
# PART 6 · THE SPINE
#
# Which component sits in which chapter, and why. The `why` is on the page under each component, so
# a placement is a decision a reader and a reviewer can both see rather than infer.
# ============================================================================

# THE RAIL BOARD'S CAPTION IS COUNTED, NOT TYPED.
#
# It used to say "the eight compilers", and chapter 1 said "Five compilers" sixty lines into its
# own file, and chapter 9 said "Five compilers exist instead". Three numbers for one board. The
# record settles it: eight rails, and the eighth is `bridge_mce_mg8`, whose every point is
# `bridged: true` — our own construction between two compilers' series, hatched on the board and
# graded C throughout. Written in words rather than digits because the caption is furniture and
# goes through `emit_plain()`; written from `RECORD_COUNTS` so that adding a rail rewrites the
# sentence instead of falsifying it.
NUMBER_WORD = {1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven",
               8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve"}
ORDINAL_WORD = {1: "first", 2: "second", 3: "third", 4: "fourth", 5: "fifth", 6: "sixth",
                7: "seventh", 8: "eighth", 9: "ninth", 10: "tenth"}
RAIL_BOARD_WHY = (
    "Before a single figure: all {rails} rails the record carries, and the years each one actually "
    "published. {Compilers} of them are compilers — outside bodies who counted this market and "
    "published what they found. The {last} rail is not a compiler's at all: it is the bridge this "
    "project built between two of them, drawn hatched, graded C, and nobody's measurement but "
    "ours. The reader meets the ruler before the reading."
).format(rails=NUMBER_WORD[RECORD_COUNTS["series"]],
         Compilers=NUMBER_WORD[RECORD_COUNTS["compilers"]].capitalize(),
         last=ORDINAL_WORD[RECORD_COUNTS["series"]])

SPINE = {
    1: [("rail-board", RAIL_BOARD_WHY),
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
# fire is worse than no check: it stops anyone looking at the thing it appears to be watching.
#
# THIS PART WAS ITSELF THE WORST EXAMPLE IN THE FILE.
#
# There was one harness, `fires()`, and it read ANY BuildError as a pass. Four of the six probes
# tested a refusal, so that was right for them. The fifth, `census_resolves()`, tested a branch
# that had to SUCCEED — and it announced success by raising a BuildError, while its failure path
# called `die()`, which raises a BuildError too. The probe reported REFUSED whether the branch
# worked or not. It had never once told anyone anything, and it sat directly beneath a comment
# saying a branch nobody has seen run is the shape this project keeps finding defects in.
#
# THE FIX IS TWO VERBS THAT CANNOT SATISFY EACH OTHER.
#
#   refuses(name, fn, naming=...)  fn MUST raise, and the message must contain `naming`. A probe
#                                  that trips a DIFFERENT refusal in the same function is a probe
#                                  aimed at nothing, so the substring is required, not optional.
#   proves(name, fn)               fn MUST return a detail string. Any exception at all — including
#                                  a BuildError from die() — is a failed self-test.
#
# No probe signals success by raising, and no probe signals failure by returning. `refuses()` and
# `proves()` share no outcome, so a probe cannot be mistaken for the other kind.
# ============================================================================

def self_tests(bundle, order):
    results = []

    def refuses(name, fn, naming, expect=BuildError):
        try:
            fn()
        except expect as error:
            if naming.lower() not in str(error).lower():
                die("PART 8",
                    f"self-test {name!r} fired the wrong refusal: expected one naming {naming!r}, "
                    f"got {str(error).splitlines()[0][:90]!r}",
                    "a probe that trips a different check in the same function proves nothing "
                    "about the branch it was aimed at")
            results.append((name, "REFUSED", str(error).splitlines()[0][:110]))
            return
        except Exception as error:      # noqa: BLE001 — a wrong error type is still a failure here
            die("PART 8", f"self-test {name!r} raised {type(error).__name__}, not {expect.__name__}",
                "the check fired, but not with the error the build reports")
        die("PART 8", f"self-test {name!r} did not fire",
            "the check it exercises cannot refuse the thing it forbids, which makes it decoration")

    def proves(name, fn):
        """A branch that has to WORK. It reports by returning; every exception is a failure.

        This is the half `fires()` did not have, and its absence is why the census probe read as a
        pass for its whole life. Nothing in here may signal success by raising.
        """
        detail = fn()
        if not isinstance(detail, str) or not detail.strip():
            die("PART 8", f"self-test {name!r} proved nothing it could describe",
                "a positive probe returns the sentence saying what it saw; silence is not a pass")
        results.append((name, "PROVED", detail))

    # 1 · a figure the author never linked gets NO citation, and is not a build failure either
    def unlinked_figure():
        before = len(LEDGER)
        html_out = emit("the market reached $8,675,309 that year", (), "self-test")
        rows = LEDGER[before:]
        del LEDGER[before:]
        if len(rows) != 1 or rows[0]["cited"] is not None:
            die("PART 8", "an unmarked figure came back with a citation",
                "check_marked_figure() was handed no marks and still found one, which is the "
                "defect this whole part exists to prevent")
        if any(a in html_out for a in ("data-claim", "data-record", "data-census",
                                       "data-derived")):
            die("PART 8", f"an unmarked figure rendered with a provenance attribute: {html_out!r}",
                "an uncited figure renders plain; there is no other correct output")
        return f"unmarked figure rendered with no provenance attribute: {html_out}"
    proves("an unlinked figure carries no citation", unlinked_figure)

    # 2 · THE INJECTED-FALSEHOOD ATTACK, run against the build every time it builds.
    #
    # The adversary put three flat falsehoods into chapter 1's prose, which carries no marks at
    # all, and the old resolver went and found each one a source: "5" to mech-tac-004, the
    # owned-versus-syndicated retention ratio; "36.7%" to e2-medium-001, newspapers in 1949;
    # "$196.18 billion" to a number sitting somewhere in the seven era files. The attack is run
    # here in both its forms.
    #
    # FORM ONE is what the adversary actually did: drop the numbers into unmarked prose. Nothing
    # can be cited, because nothing was linked.
    #
    # FORM TWO is the stronger attack, and the one worth having a check for: the adversary writes
    # the citation too. The claim id is real, it is in the frontmatter, and it sits in the same
    # sentence — and the figure still gets nothing, because it does not re-compute from the claim
    # that was named. Writing a citation is now necessary and not sufficient.
    #
    # WHAT THIS DOES NOT CATCH, said plainly here and again in the colophon: a number that DOES
    # re-compute from the claim its author named, inside a sentence saying something the claim does
    # not say. That is a prose error, no arithmetic can see it, and no count on this page should be
    # read as saying otherwise.
    def falsehood_attack():
        unmarked = ["a factor of 5 either way",
                    "newspapers held 36.7% of it",
                    "the era records put it at $196.18 billion"]
        forged = [("the era records put it at $196.18 billion", ("e7-sellers-002",)),
                  ("the newspaper share was 36.7% that year", ("e3-medium-003",)),
                  ("the gap was a factor of 5", ("e2-medium-001",))]
        cited = []
        for text in unmarked:
            before = len(LEDGER)
            emit(text, (), "self-test")
            cited += [("unmarked", row) for row in LEDGER[before:] if row["cited"]]
            del LEDGER[before:]
        for text, marks in forged:
            before = len(LEDGER)
            emit(text, marks, "self-test")
            cited += [("forged", row) for row in LEDGER[before:] if row["cited"]]
            del LEDGER[before:]
        if cited:
            die("PART 8",
                f"the injected-falsehood attack still earns {len(cited)} citation(s): "
                f"{[(form, r['token'], r['cited']['cite']) for form, r in cited]}",
                "an unmarked figure gets nothing, and a marked figure that does not re-compute "
                "from the claim beside it gets nothing either")
        return (f"{len(unmarked)} falsehoods in unmarked prose and {len(forged)} carrying a forged "
                "claim id: none of the six earned a citation")
    proves("the injected-falsehood attack earns no citation", falsehood_attack)

    # 3 · a marked figure that DOES check out is still cited, so 1 and 2 are not passing vacuously
    def real_citation_survives():
        probe = sorted(cid for cid in CLAIMS
                       if isinstance(CLAIMS[cid].get("central"), (int, float))
                       and CLAIMS[cid]["central"] > 1 and cid not in REJECTED)[0]
        value = CLAIMS[probe]["central"]
        before = len(LEDGER)
        emit(f"the record puts it at {value}", (probe,), "self-test")
        rows = [row for row in LEDGER[before:] if row["cited"]]
        del LEDGER[before:]
        if not rows or rows[0]["cited"]["cite"] != probe:
            die("PART 8", f"a figure quoting {probe}'s own central came back uncited",
                "the citation path is broken, and tests 1 and 2 would pass on a build that cites "
                "nothing at all")
        return f"a figure quoting {probe}'s own central value cited it, and only it"
    proves("a correctly linked figure is still cited", real_citation_survives)

    # 4 · a number cannot reach the page except through emit()
    refuses("emit_plain() refuses a string with a figure in it",
            lambda: emit_plain("this heading carries 42.7 percent"),
            naming="emit_plain")

    # 5 · a citation inside a passage the chapter declares invented is refused
    refuses("a claim id marked inside an invented passage",
            lambda: emit("Cedar pays $0.81", ("mech-discounter-001",), "self-test", invented=True),
            naming="declares invented")

    # 6 · an invented fence with no figure in it is refused as decoration
    def hollow_fence():
        probe = {"file": "self-test", "body": "<!-- invented: a fence around nothing at all -->\n"
                                              "no numbers live here\n<!-- /invented -->\n"}
        invented_lines(probe)
    refuses("an invented fence protecting no figure", hollow_fence,
            naming="contains no figure", expect=VacuousError)

    # 7 · a frontmatter id its prose never uses is refused
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
    refuses("a chapter citing a claim its prose never uses", stale_citation,
            naming="never uses")

    # 8 · a rejected claim is refused as a citation
    def rejected_citation():
        probe = dict(PROBE_CHAPTER)
        probe["ids"] = list(probe["ids"]) + [sorted(REJECTED)[0]]
        check_chapter_citations(probe)
    refuses("a chapter citing a claim the verifier rejected", rejected_citation,
            naming="REJECTED")

    # 9 · a mark the chapter's own frontmatter does not declare is refused
    def undeclared_mark():
        outsider = sorted(set(CLAIMS) - set(PROBE_CHAPTER["ids"]) - REJECTED)[0]
        probe = dict(PROBE_CHAPTER)
        probe["body"] = probe["body"] + f"\n\nA smuggled figure of $196.18 billion [{outsider}].\n"
        check_chapter_citations(probe)
    refuses("a claim id marked but never declared in the frontmatter", undeclared_mark,
            naming="frontmatter never declares")

    # 10 · a chapter contradicting the record's own compiler count is refused
    def wrong_compiler_count():
        wrong = NUMBER_WORD[1 if RECORD_COUNTS["compilers"] != 1 else 2]
        check_compiler_count({"file": "self-test",
                              "body": f"No single series runs the century. {wrong.capitalize()} "
                                      f"compilers each measured a different thing."})
    refuses("a chapter miscounting the compilers the record holds", wrong_compiler_count,
            naming="compilers")

    # 11 · a non-quantity rule that stops matching is refused
    def dead_rule():
        RULE_FIRINGS["law-report"] = 0
        try:
            assert_rules_fired()
        finally:
            RULE_FIRINGS["law-report"] = 1
    refuses("a non-quantity rule that matched nothing", dead_rule,
            naming="matched nothing", expect=VacuousError)

    # 12 · a derived figure with no derivation beside it is refused
    refuses("emit_derived() refuses a figure with no derivation",
            lambda: emit_derived("180 years", "maths"),
            naming="no derivation")

    # 13 · the bundle runs, its exports match the real ES modules, and the live binding is live
    proves("the bundle equals the ES modules it was built from",
           lambda: run_node_check(bundle, order))
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
/* THERE IS NO `html { scroll-behavior: smooth }` HERE, AND THAT IS A DECISION.
   There was, and it broke every link on the page. This document is over two hundred thousand
   pixels tall; Chrome animates a smooth fragment jump at a rate that cannot cover that distance,
   so a click on the contents or on the chapter rail set off a scroll that never arrived. The
   symptom is not an error anywhere — the URL updates, the page creeps, and the reader concludes
   the navigation is decorative. Instant jumps land. If smoothness is ever wanted back it has to be
   scoped to a short-distance case and measured on the real page height, not set on `html`. */
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

/* A CITED FIGURE LOOKS DIFFERENT FROM AN UNCITED ONE, and that is the whole visual argument.
   The rule only fires on `[data-claim]`, so a number the author never linked is drawn exactly as
   plain type: no underline, no help cursor, no tooltip, nothing to hover. Before this pass every
   figure on the page was underlined, because every figure had been given SOMETHING to point at. */
.p2-fig { font-variant-numeric: tabular-nums; }
.p2-fig[data-claim] { border-bottom: 1px solid var(--p2-rule-faint); cursor: help; }
.p2-fig[data-derived] { border-bottom: 1px dotted var(--p2-rule-faint); cursor: help; }
/* An invented passage is marked as one. Chapter 7's three worked examples say so in their own
   prose; this says it again in the margin, where a reader skimming the numbers will see it. */
.p2-invented { border-left: 2px solid var(--p2-iron); padding-left: 14px; }
.p2-invented-note { font-family: var(--p2-face-label); text-transform: uppercase;
  letter-spacing: 0.07em; font-size: 11px; color: var(--p2-zinc-text); margin: 22px 0 8px; }
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
        # A chapter title carries no citation. "(1840s-1917)" is the era's own span in its own
        # name, and the marks list is empty because nobody linked it to anything.
        nav.append(f'<a href="#ch-{chapter["number"]}">'
                   f'{emit_derived(str(chapter["number"]).rjust(2, "0"), ORDINAL_WHY)}'
                   f' · {emit(chapter["title"], (), chapter["file"])}</a>')
    # THE TWO TOGGLES SIT TOGETHER, IN THE STICKY RAIL, and that placement is the decision.
    # `access.css` says it in one line: "a reader in text mode gets the toggle back however far
    # down the page they are, because the way out of a mode has to be as reachable as the way in."
    # The rail is the only element on this page that is on screen at every scroll position, and a
    # text-only toggle a reader can only reach by scrolling back to the masthead is a mode with no
    # exit. Motion had the same requirement and was already solved this way.
    nav.append('<span class="p2-nav-spacer"></span><span id="p2-text"></span>'
               '<span id="p2-motion"></span></nav>')
    body.append("".join(nav))

    body.append('<div class="p2-wrap"><header class="p2-masthead"><div class="p2-col">')
    body.append(f'<div class="p2-arch">{emit_plain("P2 · the US advertising market")} · '
                f'{emit_derived(start + " to " + end, SPAN_WHY)}</div>')
    body.append(f'<h1>{emit_plain("The Attention Economy")}</h1>')
    body.append('<p class="p2-standfirst">' + emit_plain(
        "Somebody has always had to count the audience before anybody could price it. For most of "
        "this story the counter was not the seller. Then it was. That is the whole argument, and "
        "the ten chapters below are the evidence for it.") + "</p>")
    # THIS PARAGRAPH USED TO SAY "Every number here is wired to a claim in the frozen record."
    # It was the page's own promise and it was not true. What was true is that every number had
    # been matched against the record by value, which is a different thing and a much weaker one.
    body.append('<p class="p2-standfirst">' + emit_plain(
        "Where a chapter's author linked a number to a claim, the number is underlined here and "
        "names that claim when you hover it. Where nobody linked it, it is printed plain, and the "
        "colophon at the foot says how many of each there are. This build will not guess the "
        "difference: a citation nobody wrote is a citation that cannot be wrong, and that is "
        "exactly what makes it worthless.") + "</p>")
    body.append('<nav class="p2-toc" aria-label="Contents">')
    for chapter in chapters:
        body.append(f'<a href="#ch-{chapter["number"]}">'
                    f'<span class="p2-toc-n">'
                    f'{emit_derived(str(chapter["number"]).rjust(2, "0"), ORDINAL_WHY)}</span>'
                    f'<span class="p2-toc-title">'
                    f'{emit(chapter["title"], (), chapter["file"])}</span></a>')
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
                # A note is scoped to itself. Its range and its page numbers belong to the claim it
                # names, and to no other claim in the chapter.
                body.append(f'<li id="fn-{esc(anchor)}">'
                            f'{render_inline(note, chapter, marks_in(note, chapter))} '
                            f'<a href="#fnref-{esc(anchor)}" class="p2-fnref">↩</a></li>')
            body.append("</ol></section>")
        body.append("</div></div></section>")
    body.append("</main>")

    body.append('<div class="p2-wrap"><section class="p2-colophon" id="p2-audit">'
                '<div class="p2-arch">' + emit_plain("what this page checked while you loaded it")
                + '</div><div id="p2-audit-body" class="p2-col"></div></section></div>')
    body.append('<div class="p2-wrap"><footer class="p2-colophon"><div class="p2-arch">'
                + emit_plain("colophon") + "</div><dl>")
    for term, parts in colophon_entries():
        body.append(f"<dt>{emit_plain(term)}</dt><dd>{emit_mixed(parts)}</dd>")
    body.append("</dl></footer></div>")

    # Era 5 is one of the six frozen files a guard may read, and `era-records.js` takes THAT copy
    # rather than fetching a second one — "two copies of one file in one page is the defect this
    # project has hit at every stage". The payload therefore carries a null in era 5's slot and the
    # runtime puts the registry's own copy back, so the page inlines it once.
    # THE ALT-SENTENCE RECORD TRAVELS WITH THE PAGE, for the same reason everything else here
    # does: `access/visuals.js` reads `p2-ad-market/data/visuals.json` over `fetch`, and a page
    # opened off a disk cannot fetch. `useVisuals(doc)` is the injection door that module already
    # publishes for exactly this case. Fifty-one authored sentences that only exist on a developer's
    # filesystem are fifty-one sentences no reader will ever meet.
    frozen_payload = json.dumps({
        "frozen": FROZEN,
        "eraRecords": [None if r is FROZEN["era5"] else r for r in ERA_RECORDS],
        "verdicts": VERDICTS,
        "visuals": load_json("visuals.json"),
    }, separators=(",", ":"))

    css = "\n".join([
        (P2 / "lib" / "tokens.css").read_text(),
        (P2 / "charts" / "chart-demo.css").read_text(),
        (P2 / "eras" / "eras.css").read_text(),
        (P2 / "auction" / "auction-bench.css").read_text(),
        (P2 / "door" / "door-bench.css").read_text(),
        (P2 / "toll" / "toll.css").read_text(),
        PAGE_CSS,
        # LAST, AND THAT IS THE POINT. access.css carries the one rule that turns the whole piece
        # into text — `[data-alt-source]` off, `.p2-text-block` on — and a rule that decides what a
        # reader sees must not be sitting where a later stylesheet can quietly outrank it. It
        # restates no token value and loads after tokens.css, which is the contract in its header.
        (P2 / "access" / "access.css").read_text(),
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


def emit_mixed(parts, where="colophon"):
    """A sentence made of plain words and figures this build worked out itself.

    Every string is `emit_plain()`, so a digit that slips into the prose of a colophon entry stops
    the build; every figure is `emit_derived()`, so it has to arrive with the sentence saying how
    it was counted. There is no third option here, and in particular no way to write a number into
    a colophon entry and have the build go looking for a source for it.
    """
    out = []
    for part in parts:
        out.append(emit_derived(part[0], part[1], where) if isinstance(part, tuple)
                   else emit_plain(part))
    return "".join(out)


def citation_tally():
    """The two numbers this page is required to publish about itself, counted off the ledger.

    Only the ten chapters count. The page's own furniture is `emit_derived()` throughout and none
    of it is a citation, so folding it in would flatter the ratio for no reason.
    """
    prose = [row for row in LEDGER if row["where"].endswith(".md")]
    cited = [row for row in prose if row["cited"]]
    return {
        "figures": len(prose),
        "cited": len(cited),
        "uncited": len(prose) - len(cited),
        "dates": sum(1 for row in prose if row["kind"] == "year" and not row["cited"]),
        "invented": sum(1 for row in prose if row["invented"]),
        "claims": len({row["cited"]["cite"] for row in cited}),
        "unmarked_chapters": sorted({row["where"] for row in prose if not row["marked"]}
                                    - {row["where"] for row in prose if row["marked"]}),
        # THE WEAKEST CLASS OF CITATION THIS PAGE PRINTS, counted so the colophon can name it.
        # `claim-value` means the figure re-computes from the claim's own central or an end of its
        # interval — the number the record measured. `claim-words` means it matched a number that
        # appears only inside the claim's sentences, which is usually a chapter quoting the
        # record's working and is occasionally an intermediate term nobody measured.
        "by_words": sum(1 for row in cited if row["cited"]["class"] == "claim-words"),
        "by_value": sum(1 for row in cited if row["cited"]["class"] == "claim-value"),
        "by_year": sum(1 for row in cited if row["cited"]["class"] == "claim-year"),
    }


TALLY_WHY = ("counted off this build's own ledger of every figure it wrote, at the moment it "
             "wrote them; the two numbers are required to sum to the first")
CLAIMS_WHY = "the number of entries in claims.json, counted at build time"
INVENTED_WHY = ("figures inside chapter 7's three fenced worked examples, which the build refuses "
                "to let carry any provenance at all")


def colophon_entries():
    tally = citation_tally()
    return [
        ("the record", [
            "Six frozen files, seven era records and the verifier's verdicts, inlined into this "
            "page whole. Nothing here re-researches and nothing summarises. claims.json carries ",
            (str(RECORD_COUNTS["claims"]), CLAIMS_WHY), " claims."]),
        ("the numbers, honestly", [
            "The ten chapters print ", (str(tally["figures"]), TALLY_WHY), " figures. ",
            (str(tally["cited"]), TALLY_WHY),
            " of them carry a citation, because the chapter's author linked that number to a claim "
            "and the number re-computes from it. ", (str(tally["uncited"]), TALLY_WHY),
            " carry none. An uncited figure here is a known gap, not a hidden one: the build will "
            "not go looking for a claim that happens to hold the same value, because a citation "
            "manufactured by coincidence is worse than no citation. It lends a number authority it "
            "has not earned, in the one place a reader goes to check."]),
        ("where the gap is", [
            "Of the ten chapters, ", (str(len(tally["unmarked_chapters"])), TALLY_WHY),
            " carry no inline claim ids and no footnotes naming claims, so nothing in them can be "
            "cited. They are chapters ",
            (", ".join(f.split("-")[0].lstrip("0") for f in tally["unmarked_chapters"]),
             "the chapters whose ledger rows all came back with an empty marks list, read off "
             "their filenames"),
            ". The fix is editorial, not technical — mark the numbers — and until somebody does, "
            "this line is what that costs."]),
        ("the weakest citation here", [
            "Citations here come in three strengths. ", (str(tally["by_value"]), TALLY_WHY),
            " rest on the number the record actually measured — a claim's central value or an end "
            "of its interval. ", (str(tally["by_year"]), TALLY_WHY),
            " are dates, matched only against the years the claim itself places its fact in, "
            "because a measurement is not a calendar and the two are never compared here. The "
            "remaining ", (str(tally["by_words"]), TALLY_WHY),
            " rest on a number that appears inside the claim's own sentences. Most of those are a "
            "chapter quoting the record's working, which is what a stated method is for. But the "
            "match is by value to within the precision the prose printed, so a short number can in "
            "principle reach a working term that was never a measurement. Trust that class less "
            "than the other two."]),
        ("the invented examples", [
            "The auction chapter works the ranking rule three times on advertisers it made up, "
            "and says so in its own prose. ", (str(tally["invented"]), INVENTED_WHY),
            " figures sit inside those fences. Every one is printed plain, and a claim id written "
            "inside a fence stops the build rather than decorating a number that measures "
            "nothing."]),
        ("the instruments",
         ["The seven era machines, the auction bench, the door bench, the seven toll plates and "
          "the four charts each run their own arithmetic gate against the record before they "
          "draw."]),
        ("motion",
         ["Six named verbs and one invented one, each with a complete alternative encoding rather "
          "than a disabled state. The rocker in the header forces either mode without touching "
          "your system setting."]),
        ("with the drawings off",
         ["Every drawing here carries an authored sentence in the frozen record. The rocker in the "
          "rail turns the whole piece into those sentences, each one followed by every reading its "
          "drawing was showing, and the controls stay exactly where they were. Every drawing is "
          "also a tab stop, and its arrow keys walk what it says one reading at a time."]),
        ("what it costs to tab",
         ["A reader working by keyboard meets about five hundred stops on the way down, and roughly "
          "four in five of them are footnote and source links inside the prose. Every drawing is "
          "reachable and each set of controls is one stop rather than many. That is the honest "
          "shape of it: nothing here is unreachable, and reaching the middle of the piece from the "
          "top takes a great many presses."]),
        ("what this page cannot tell you",
         ["Whether a sentence is true. A citation here proves that the number beside it re-computes "
          "from the claim its author named. It does not prove the sentence around the number says "
          "what the claim says. An adversary proved the difference on this build: a sentence "
          "planted in the opening chapter, saying search moved to a pay-your-own-bid sale in ",
          ("2019", "the year the planted sentence asserted. It matched mech-first_price-001, whose "
                   "own statement opens by saying it measures the open-web display exchange and "
                   "not search"),
          ", earned a citation on its year. The year re-computed. The sentence was false. Every "
          "other guard here checks a shape or a bounded record, and the prose lint is a heuristic "
          "that knows about one claim and misses ordinary English."]),
        ("the test nobody has run",
         ["Every finding this piece draws also exists as a sentence, and a reader who never sees a "
          "drawing can reach all of them. That was checked. What has not been checked is whether "
          "such a reader arrives at the same conclusions in the same order as a reader who sees "
          "everything. Reaching the words is a necessary condition. It is not the test, and the "
          "test is a person."]),
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

    var visuals = __req('access/visuals.js');
    var textPath = __req('access/text-path.js');
    var keyboard = __req('access/keyboard.js');

    motion.initMotion();
    motion.installMotionToggle(document.getElementById('p2-motion'));

    /* TEXT MODE IS RESOLVED BEFORE ANYTHING DRAWS, and that is why this line is here rather than
     * at the foot with the rest of the access layer. `initTextPath()` stamps the resolved mode on
     * <html>, and the CSS rule that hides the drawings keys off that attribute. Resolved late, a
     * reader who asked for ?text=on would watch fifty-seven drawings paint and then vanish. It is
     * the same reason `initMotion()` runs on the line above and not after the components.
     *
     * The record is not needed for this. The mode comes from the URL, then the session, then off;
     * the registry is loaded further down, once there is something to declare. */
    textPath.initTextPath();

    /* THE FIFTY-ONE AUTHORED SENTENCES, injected the same way the frozen record is. `useVisuals`
     * refuses an empty registry, so a payload that lost this field stops the page here rather
     * than letting every drawing through unnamed. */
    var visualCount = visuals.useVisuals(payload.visuals);

    /* THE RECORD'S OWN KEYS, INDEXED BY WHAT THE COMPONENTS CALL THEMSELVES.
     * A visual row for a scenario carries that scenario's id; a drawer row carries its organ
     * field; a toll row carries its era. So the page never spells a mapping of its own — it asks
     * the record which of its rows belongs to the thing about to be drawn, and `declareVisual`
     * refuses anything the record does not hold. A hand-written map from `sc-04` to
     * `auction-sc-04` would be a second copy of an ordering the record already fixes. */
    var byScenario = {}, byField = {}, byEra = {};
    visuals.everyVisual().forEach(function (row) {
      if (row.scenario) byScenario[row.scenario] = row.id;
      if (row.field) byField[row.field] = row.id;
      if (row.component === 'toll' && row.era) byEra[String(row.era)] = row.id;
    });

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
          /* THE DRAWER IS ONE ELEMENT AND EIGHT VISUALS. It is built once and re-filled from
           * whichever organ was pulled, so its declaration is re-made on every pull rather than
           * once at mount — and it is made BEFORE `show`, so the cells that arrive are already
           * inside a declared region. The text block is written after, when there is something to
           * read back. `installTextPath`'s assert runs at mount over an empty drawer and would
           * not catch a pull that arrived undeclared, which is why the declaration is at the one
           * call site that knows the field. */
          onPull: function (field) {
            visuals.declareVisual(drawer.root, byField[field]);
            drawer.show(drawerPlans.get(field));
            textPath.renderTextBlock(drawer.root, byField[field]);
          }
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
            /* THE PANEL IS ONE ELEMENT AND TEN VISUALS. Which one it is now is set here, at the
             * only place that knows, and the declaration follows on the next line. */
            auctionVisual = byScenario[scenario.id];
            syncMovingRegions();
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
            doorVisual = byScenario[s.id];
            syncMovingRegions();
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

    /* ==================================================================
     * THE ACCESS LAYER, MOUNTED ON THE PAGE THAT SHIPS.
     *
     * `docs/p2/access/` was built and never called. Every sentence in it, every text block, every
     * tab stop and the whole text-only path existed in a module nothing on this page required —
     * which for a reader is the same as not existing. This is the call site.
     *
     * THREE THINGS HAPPEN HERE, IN THIS ORDER, AND THE ORDER IS LOAD-BEARING.
     *
     *   1. EVERY REGION IS DECLARED. `declareVisual(node, id)` binds a rendered part of the page
     *      to its row in `p2-ad-market/data/visuals.json` and refuses an id the record does not
     *      hold. Some regions are fixed for the life of the page — a chart, a machine, a toll
     *      plate. Three are not: the auction panel is ten visuals in one element, the door bench
     *      is eleven, and the drawer is eight. Those are re-declared whenever they change, by
     *      `syncMovingRegions` below.
     *
     *   2. THE KEYBOARD LAYER. `installKeyboard` collapses the composite controls to one tab stop
     *      each and makes every drawing reachable with a reading cursor. It asserts, and an empty
     *      check is a failed check: a page with no controls throws here rather than reporting
     *      green.
     *
     *   3. THE TEXT PATH. `installTextPath` calls `assertEveryDrawingDeclared` FIRST, so a drawing
     *      that reached the page outside every declared region stops the build of the page rather
     *      than reaching a reader with nothing to say in its place. Then it writes a text block
     *      into every region and keeps each one in step with its drawing across repaints.
     * ================================================================== */

    var accessRoot = document.body;

    function declare(node, id) {
      if (node && id) visuals.declareVisual(node, id);
      return node;
    }

    /* ---- the regions that do not move ---- */
    declare(host('rail-board'), 'chart-rail-board');
    declare(host('value-chart'), 'chart-value-rails');
    declare(host('gdp-strip'), 'chart-gdp-strip');
    /* THE BANK AND THE CROSS-SECTION ARE TWO VISUALS IN ONE STAGE, and the record holds them as
     * two rows with two different findings — one about a medium taking decades to move the share,
     * one about a year being only as sharp as its widest reading. `small-multiples.render` puts
     * each view in its own `section.p2-view`, in that order, which is what makes them separable
     * here without either component or record being asked to change. */
    var bankViews = document.querySelectorAll('#stage-small-multiples > .p2-view');
    declare(bankViews[0], 'chart-medium-bank');
    declare(bankViews[1], 'chart-medium-cross-section');
    for (var eraN = 1; eraN <= 7; eraN += 1) {
      declare(host('era-' + eraN), 'era-' + eraN + '-machine');
    }
    var plateCards = document.querySelectorAll('#stage-toll-plates .p2-toll-plate[data-era]');
    [].forEach.call(plateCards, function (card) {
      declare(card, byEra[card.getAttribute('data-era')]);
    });
    /* THE LEGEND IS A VISUAL AND IT WAS FOUND BY THE ASSERT, not by anybody reading the page: five
     * drawn marks under the plates, carrying the finding that whoever could see the middleman's
     * cut is itself the clearest thing here. The record has a row for it now. */
    declare(document.querySelector('#stage-toll-plates .p2-toll-legend'), 'toll-visibility-legend');

    /* ---- the three regions that move under the reader ---- */
    var auctionVisual = byScenario[auctionScenarios.SCENARIOS[0].id];
    var doorVisual = byScenario[doorScenarios.STOPS[0].id];
    var textMounted = false;

    function reDeclare(node, id) {
      if (!node || !id) return false;
      if (node.getAttribute(visuals.VISUAL_ATTR) === id) return false;
      visuals.declareVisual(node, id);
      /* The block is written HERE and not left to the text path's own observer. That observer
       * decides which region a mutation belongs to at the moment the mutation arrives, and a
       * `.ab-band` that is not yet declared belongs to the panel around it — so the band's
       * readings would land under the panel's finding, which is a different claim about the same
       * numbers. Declaring and writing together closes the window. */
      if (textMounted) textPath.renderTextBlock(node, id);
      return true;
    }

    function unDeclare(node) {
      if (!node || !node.hasAttribute(visuals.VISUAL_ATTR)) return false;
      node.removeAttribute(visuals.VISUAL_ATTR);
      var stale = node.querySelector(':scope > .p2-text-block');
      if (stale) stale.remove();
      return true;
    }

    function syncMovingRegions() {
      var moved = false;
      moved = reDeclare(document.querySelector('#stage-auction-bench section.ab'), auctionVisual) || moved;
      /* THE BAND IS ITS OWN VISUAL, drawn inside the panel, and the readout zone is cleared on
       * every paint — so this element is a NEW element after every control the reader touches,
       * carrying none of the attributes the last one had. */
      moved = reDeclare(document.querySelector('#stage-auction-bench .ab-band'), 'auction-band') || moved;
      moved = reDeclare(document.querySelector('#stage-door-bench section.db'), doorVisual) || moved;
      /* THE DRUM IS NOT ON EVERY STOP. Seven of the eleven stops have no wheel at all, and a
       * region declared over an empty host would print the drum's finding under a box saying
       * there is nothing to read — an absence that is not a fact about the record but about which
       * stop the reader is standing on. So the declaration follows the drawing. */
      var wheelHost = document.querySelector('#stage-door-bench .db-wheel-host');
      if (wheelHost && wheelHost.querySelector('[data-alt-source]')) {
        moved = reDeclare(wheelHost, 'door-wheel') || moved;
      } else {
        moved = unDeclare(wheelHost) || moved;
      }
      return moved;
    }

    syncMovingRegions();

    /* THE MOVING REGIONS ARE RE-DECLARED ON EVERY REPAINT, and this observer is registered BEFORE
     * the text path's own. Both schedule their work with `setTimeout(0)` on the same delivery, and
     * MutationObserver callbacks run in registration order — so the declaration is always in place
     * before the block that depends on it is rebuilt. It watches the two bench stages and nothing
     * else: the page has fifty-seven drawings and a body-wide subtree watch would wake on every
     * one of them to check four elements. */
    var regionQueued = false;
    if (typeof MutationObserver === 'function') {
      var regionWatch = new MutationObserver(function () {
        if (regionQueued) return;
        regionQueued = true;
        setTimeout(function () {
          try { syncMovingRegions(); } finally { regionQueued = false; }
        }, 0);
      });
      ['auction-bench', 'door-bench'].forEach(function (name) {
        if (host(name)) regionWatch.observe(host(name), { childList: true, subtree: true });
      });
    }

    /* ---- the toggle, the keyboard, the text path ---- */
    textPath.installTextToggle(document.getElementById('p2-text'), { label: 'Drawings' });
    var keys = keyboard.installKeyboard(accessRoot);
    var text = textPath.installTextPath(accessRoot);
    textMounted = true;

    /* ---- the drawer keeps focus, and gives it back ---- */
    var drawerFocus = keyboard.installDialogFocus(drawer.root);

    var kbAudit = keyboard.auditKeyboard(accessRoot);
    var textAudit = textPath.auditTextPath(accessRoot);

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
    /* THE CLEARANCE SENTENCE.
     *
     * This line used to lead with the count — "read N strings and returned 0 findings" — and then
     * take it back. A reader who stops at the first clause has been told the page is clean, and
     * the first clause is where most readers stop. `guards.js` is explicit that an empty result
     * has never been a clearance, so the count is now the last thing said and not the first, and
     * what the lint checked and what it cannot are both said in plain words before it. */
    auditLine('WHAT THE PROSE LINT CHECKED. It read the masthead, the ten chapters with their '
      + 'instruments and text blocks, and the colophon — ' + audit.strings + ' strings — and '
      + 'matched each one against the patterns for a single claim: that search moved to a '
      + 'pay-your-own-bid sale in 2019. Search did not. Display did, and the two are not the '
      + 'same market.');
    auditLine('WHAT IT CANNOT DO, and this is the larger half. It looks for that one claim and no '
      + 'other, so every other sentence on this page passed it by not being about that. It reads '
      + 'no figure and compares nothing against the record. It cannot tell whether a sentence is '
      + 'true. And it misses plain statements of the very claim it hunts: two are written into its '
      + 'own limits below and it returns nothing for either.');
    auditLine('So the count is a fact about the patterns, not about the page: ' + audit.lint
      + ' finding(s). What actually holds the claim is bounded and ran before a panel was drawn — '
      + 'assertSimulatorMechanismScopes() over the frozen scenarios, and assertMechanism2019() '
      + 'over mechanism.json. The lint\'s own written limits: '
      + guards.DEAD_MECHANISM_LINT_LIMITS.join(' '));
    auditLine('One thing about that count, so nobody has to work it out twice: the paragraph above '
      + 'quotes the lint\'s own written limits, and those limits contain the false sentences as '
      + 'examples. Run the lint again over the finished page and it finds them, in its own '
      + 'documentation. That is the known false-positive class — a sentence that names the false '
      + 'claim in order to correct it — and this whole piece is built out of them.');

    /* ---- what the access layer is worth on this page, measured on this page ---- */
    audit.visualsDeclared = textAudit.onThisPage;
    audit.visualsInRecord = textAudit.inTheRecord;
    audit.readings = textAudit.readings;
    audit.silentRegions = textAudit.silent.length;
    audit.drawings = kbAudit.drawings;
    audit.drawingsReachable = kbAudit.drawingsReachable;
    audit.cursors = kbAudit.cursors;
    audit.tabStops = kbAudit.tabStops;
    audit.rovingGroups = kbAudit.rovingGroups;

    auditLine(textAudit.onThisPage + ' of the record\'s ' + textAudit.inTheRecord + ' authored '
      + 'visuals are declared on the page as it stands, each carrying a plain-English sentence '
      + 'from p2-ad-market/data/visuals.json and ' + textAudit.readings + ' readings pulled off '
      + 'the drawings\' own accessible names. The rest are the other scenarios, the other stops '
      + 'and the eight drawers: they are declared when the reader opens them. '
      + textAudit.silent.length + ' region(s) came back with nothing to read.');
    auditLine('Turn the drawings off with the rocker in the rail above, or with ?text=on in the '
      + 'address bar, and every drawing on this page is replaced by its sentence and by every '
      + 'reading it was showing. The controls stay: the cranks, the rings, the sliders, the rail '
      + 'and the drum are all still there and still work, because an instrument reduced to a '
      + 'paragraph is a demonstration.');
    auditLine(kbAudit.drawings + ' drawings, ' + kbAudit.drawingsReachable + ' of them reachable '
      + 'by keyboard with a cursor that walks what each one says, one reading at a time. '
      + kbAudit.rovingGroups + ' composite controls — the cranks, the organ plates, the pull '
      + 'rings, the rockers and the two scenario rails — are one tab stop each instead of one per '
      + 'button. ' + kbAudit.tabStops + ' tab stops in all.');

    window.P2_AUDIT = audit;
    window.P2_ACCESS = { keys: keys, text: text, keyboard: kbAudit, textPath: textAudit,
                         drawerFocus: drawerFocus, map: keyboard.KEYBOARD_MAP,
                         visuals: visualCount };

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
# The check that makes the rest worth anything. Every figure in the built page's own text has to be
# inside a span `emit()` wrote. A number that reached the page by any other route — a template this
# script writes, a string somebody adds later, a heading typed straight into the HTML — is found
# here and stops the build.
#
# THIS IS WHY AN UNCITED FIGURE IS STILL WRAPPED IN A SPAN. The span carries no attribute, shows no
# tooltip and draws no underline: to a reader it is the number in plain type. To this function it
# is the receipt proving the number went through the one door. Take the wrapper away and every
# uncited figure on the page reads as a leak, and the leak check has to be turned off — which is
# how a check stops protecting anything.
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
# EVERY FIGURE SPAN IS READ AND CLASSIFIED, and an unrecognised shape stops the build.
#
# The obvious version of this is three literal patterns, one per shape. It is also the version that
# quietly ignores a fourth shape the day somebody adds one, and a figure the page audit cannot see
# is a figure nothing checks. So one pattern matches ANY figure span and `classify_span()` decides
# what it is — cited, derived, or plain — and refuses anything else by name.
FIG_SPAN = re.compile(
    r'<span class="(p2-fig[^"]*)"((?:\s+[a-z-]+="[^"]*")*)\s*>([^<]*)</span>')
FIG_ATTR = re.compile(r'\s+([a-z-]+)="([^"]*)"')
FIG_CLASSES = {"p2-fig", "p2-num", "p2-cited", "p2-derived"}
# `data-record` and `data-census` were the two attributes that put a file name and a row count
# where a citation belongs. The way to keep them gone is not to remember: it is to name them.
BANNED_PROVENANCE = re.compile(r'<span class="p2-fig[^"]*"[^>]*\sdata-(record|census)=')


def classify_span(klass, attrs):
    """cited / derived / plain, or a refusal naming the shape nobody declared."""
    unknown = set(klass.split()) - FIG_CLASSES
    if unknown:
        die("PART 10", f"a figure span carries an undeclared class: {sorted(unknown)}",
            "add it to FIG_CLASSES and say in the CSS what it means, or take it off")
    names = {name for name, _value in FIG_ATTR.findall(attrs)}
    provenance = {name for name in names if name.startswith("data-")}

    # THE ATTRIBUTE IS WHAT THIS FUNCTION READS. THE CLASS IS WHAT THE READER SEES. Until this
    # check existed the two could part company without a word: the stylesheet draws the underline
    # from `p2-cited`, so a renderer that kept `data-claim` and dropped the class would build green
    # while every citation on the page quietly stopped being visible. A mutation proved it — that
    # one went through where seven others were caught. The mark and the meaning now travel together
    # or the build stops.
    worn = set(klass.split())
    for attribute, marker in (("data-claim", "p2-cited"), ("data-derived", "p2-derived")):
        if (attribute in provenance) != (marker in worn):
            die("PART 10",
                f"a figure span carries {attribute if attribute in provenance else marker} "
                f"without {marker if attribute in provenance else attribute}",
                f"`{attribute}` is how this build knows where a number came from and `{marker}` is "
                f"how the reader sees it. One without the other is provenance nobody can see, or a "
                f"mark standing over nothing")

    if provenance == {"data-claim"}:
        return "cited"
    if provenance == {"data-derived"}:
        return "derived"
    if not provenance:
        return "uncited"
    die("PART 10", f"a figure span carries the provenance combination {sorted(provenance)}",
        "a figure cites one claim, or states one derivation, or claims nothing. Two at once is a "
        "figure saying two different things about where it came from")


def audit_built_page(page):
    """Read the page back and prove no number reached it except through emit()."""
    prose = SCRIPT_RE.sub(" ", STYLE_RE.sub(" ", page))
    banned = BANNED_PROVENANCE.search(prose)
    if banned:
        die("PART 10", f"a figure on the built page carries data-{banned.group(1)}",
            "a file name and a count of the record are not citations; cite the claim the author "
            "linked, or cite nothing")
    for name, pattern, _why in PAGE_STRIP:
        prose, hits = pattern.subn(" ", prose)
        PAGE_STRIP_FIRINGS[name] += hits
    dead = [name for name, count in PAGE_STRIP_FIRINGS.items() if count == 0]
    if dead:
        raise VacuousError(
            f"PART 10: these rendered-form rules matched nothing on the built page: {dead}.\n"
            "    fix: a rule that fires zero times is not protecting anything and will absorb a "
            "real figure the day the renderer changes shape.")
    counts = {"cited": 0, "uncited": 0, "derived": 0}
    for match in FIG_SPAN.finditer(prose):
        counts[classify_span(match.group(1), match.group(2))] += 1
    # THE PAGE AND THE LEDGER HAVE TO AGREE, FIGURE FOR FIGURE.
    # Everything above proves a figure went through `emit()`. This proves it came out the other
    # side wearing what `emit()` recorded. Without it, a renderer that put `data-claim` on a
    # derived figure — or dropped one off a cited figure — would change what a reader is told and
    # leave every count in the report unchanged, because the report reads the ledger and the
    # reader reads the page. Two sources of truth for the same number is the defect this project
    # has hit at every stage; here they are made to reconcile.
    ledger = {
        "cited": sum(1 for row in LEDGER if row["cited"]),
        "derived": sum(1 for row in LEDGER if row["kind"] == "derived"),
    }
    ledger["uncited"] = len(LEDGER) - ledger["cited"] - ledger["derived"]
    disagree = {k: (counts[k], ledger[k]) for k in ledger if counts[k] != ledger[k]}
    if disagree:
        die("PART 10",
            f"the built page and the build's own ledger disagree about what it wrote: "
            f"{ {k: {'on the page': a, 'in the ledger': b} for k, (a, b) in disagree.items()} }",
            "emit() recorded one thing and rendered another. The report reads the ledger and the "
            "reader reads the page, so a gap here is a page saying something the report denies")
    text = html.unescape(TAG_RE.sub(" ", FIG_SPAN.sub(" ", prose)))
    leaked = scan_figures(text)
    if leaked:
        sample = ", ".join(sorted({f["token"] for f in leaked})[:12])
        die("PART 10",
            f"{len(leaked)} figure(s) reached the built page without going through emit(): {sample}",
            "every reader-facing string must be routed through emit(); a number that is not is a "
            "number nothing traced")
    counts["leaked"] = len(leaked)
    return counts


# ============================================================================
# PART 11 · BUILD
# ============================================================================

def main():
    chapters = [read_chapter(name) for name in CHAPTER_FILES]
    for chapter in chapters:
        chapter["_named"] = set(CLAIM_ID_RE.findall(chapter["body"]))
        # THE FRONTMATTER CHECK DOES NOT GET TO COUNT INVENTED NUMBERS.
        # `chapter_uses()` decides a frontmatter id is live if some figure in the chapter matches
        # it by value, and chapter 7's made-up advertisers produce figures that match stored
        # auction steps exactly. Letting those keep an id alive would mean a citation kept in the
        # header by a number the chapter itself calls fiction.
        real = "\n".join(line for index, line in enumerate(chapter["body"].splitlines())
                         if index not in chapter["_invented"])
        chapter["_figures"] = scan_figures(real)
        chapter["_years"] = {int(y) for y in YEAR_RE.findall(real)}

    global PROBE_CHAPTER
    PROBE_CHAPTER = chapters[0]

    declared = sum(check_chapter_citations(chapter) for chapter in chapters)
    for chapter in chapters:
        check_compiler_count(chapter)
    assert_rules_fired()

    bundle, order = build_bundle()
    tests = self_tests(bundle, order)

    page = render_page(chapters, bundle)
    counts = audit_built_page(page)
    OUT.write_text(page)

    # ---- the report ----
    prose = [row for row in LEDGER if row["where"].endswith(".md")]
    by_chapter = {}
    for row in prose:
        seen = by_chapter.setdefault(row["where"], {"figures": 0, "cited": 0, "marked": 0,
                                                    "invented": 0})
        seen["figures"] += 1
        seen["cited"] += 1 if row["cited"] else 0
        seen["marked"] += 1 if row["marked"] else 0
        seen["invented"] += 1 if row["invented"] else 0
    tally = citation_tally()
    # NAMED, NOT SUBTRACTED. `by_words` used to be `cited - by_value`, so the day a third class
    # of citation appeared it was silently reported as the second. The classes are counted by name
    # and the total is asserted, which is the same rule the colophon's own two numbers obey.
    by_value, by_words, by_year = (tally["by_value"], tally["by_words"], tally["by_year"])
    if by_value + by_words + by_year != tally["cited"]:
        die("PART 11", "the citation classes do not sum to the number of cited figures",
            "a class was added without being counted here; name it rather than subtracting")
    marks_used = {row["cited"]["cite"] for row in prose if row["cited"]}

    print(f"wrote {OUT.relative_to(ROOT)} ({len(page) // 1024} KB)")
    print()
    print("  THE SPINE")
    for chapter in chapters:
        placed = ", ".join(name for name, _ in SPINE.get(chapter["number"], [])) or "—"
        print(f"    {str(chapter['number']).rjust(2, '0')} {chapter['title']:<26} {placed}")
    print(f"    era-1 teaching gate kept on later machines: {ERA_GATE_KEPT}")
    print()
    print("  CITATION BY AUTHORSHIP — what the ten chapters actually earned")
    print(f"    figures in the chapters                    {tally['figures']}")
    print(f"    └ CITED: author linked it and it checks    {tally['cited']}"
          f"  ({by_value} to a claim's own central or interval, "
          f"{by_words} to a figure inside its statement or method, "
          f"{by_year} a date the claim places its fact in)")
    print(f"    └ UNCITED: nobody linked it                {tally['uncited']}"
          f"  (of which {tally['dates']} are dates)")
    print(f"    └ inside a fenced invented example         {tally['invented']}"
          f"  (provenance refused, not merely absent)")
    print(f"    distinct claims actually cited on the page {len(marks_used)} of "
          f"{len(CLAIMS)} in the record")
    print(f"    frontmatter ids declared                   {declared} across {len(chapters)} "
          f"chapters, 0 unknown, 0 rejected, 0 undeclared marks")
    print()
    print("  THE GAP, BY CHAPTER (a chapter with no marks can cite nothing)")
    for chapter in chapters:
        seen = by_chapter.get(chapter["file"], {"figures": 0, "cited": 0, "marked": 0,
                                                "invented": 0})
        share = (100 * seen["cited"] // seen["figures"]) if seen["figures"] else 0
        note = "  no marks in this chapter" if seen["marked"] == 0 else ""
        print(f"    {chapter['file']:<28} {seen['cited']:>4} of {seen['figures']:>4} cited "
              f"({share:>3}%){note}")
    print()
    print("  THE PAGE, READ BACK")
    print(f"    figures carrying data-claim                {counts['cited']}")
    print(f"    figures carrying no provenance at all      {counts['uncited']}")
    print(f"    figures this build derived, derivation printed beside them {counts['derived']}")
    print(f"    figures that reached the page any other way {counts['leaked']}")
    print(f"    figures carrying data-record or data-census 0  (the attribute is now refused)")
    print()
    print("  NON-QUANTITY FORMS REFUSED THE SCANNER (each must fire, or the build stops)")
    for name, _pattern, why in NON_QUANTITY:
        print(f"    {name:<14} {RULE_FIRINGS[name]:>5}   {why}")
    print()
    print("  THE RECORD, COUNTED")
    print(f"    {RECORD_COUNTS['series']} rails · {RECORD_COUNTS['compilers']} compilers · "
          f"{RECORD_COUNTS['constructed']} constructed by us · "
          f"{RECORD_COUNTS['points']} spend points · {RECORD_COUNTS['claims']} claims")
    print()
    print("  THE BUNDLE")
    print(f"    modules inlined {len(order)} · live bindings preserved "
          f"{sorted(LIVE_BINDINGS)}")
    print()
    print("  SELF-TESTS (a refusal handed the thing it forbids; a proof made to run its branch)")
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
