#!/usr/bin/env python3
"""Readability gate for reader-facing markdown prose.

Computes four scores and enforces the repo thresholds (PROCESS.md):
  Flesch-Kincaid Grade Level <= 10
  Flesch Reading Ease        >= 50
  Gunning Fog Index          <= 12
  SMOG                       <= 12

Usage:
  python3 tools/readability.py file.md [file2.md ...]
  python3 tools/readability.py --json file.md      # machine-readable output
Exit code 0 if every file passes all four gates, 1 otherwise.
"""

import json
import re
import sys

THRESHOLDS = {
    "fk_grade": ("<=", 10.0),
    "reading_ease": (">=", 50.0),
    "gunning_fog": ("<=", 12.0),
    "smog": ("<=", 12.0),
}

VOWEL_GROUPS = re.compile(r"[aeiouy]+")


def strip_markdown(text: str) -> str:
    """Reduce a markdown document to the prose a reader actually reads."""
    # YAML frontmatter
    text = re.sub(r"\A---\n.*?\n---\n", "", text, flags=re.S)
    # fenced code blocks, inline code
    text = re.sub(r"```.*?```", " ", text, flags=re.S)
    text = re.sub(r"`[^`]*`", " ", text)
    # tables (lines whose structure is cells, not sentences)
    text = "\n".join(l for l in text.splitlines() if not l.lstrip().startswith("|"))
    # images entirely; links keep their anchor text
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    # footnote markers and raw URLs
    text = re.sub(r"\[\^[^\]]+\]", " ", text)
    text = re.sub(r"https?://\S+", " ", text)
    # heading/emphasis/list markup
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.M)
    text = re.sub(r"[*_]{1,3}", "", text)
    text = re.sub(r"^\s*[-+*]\s+", "", text, flags=re.M)
    text = re.sub(r"^\s*\d+\.\s+", "", text, flags=re.M)
    return text


def count_syllables(word: str) -> int:
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w:
        return 1  # numerals, symbols: count as one beat
    groups = VOWEL_GROUPS.findall(w)
    n = len(groups)
    if w.endswith("e") and not w.endswith(("le", "ee", "ye")) and n > 1:
        n -= 1
    return max(1, n)


def analyze(text: str) -> dict:
    prose = strip_markdown(text)
    sentences = [s for s in re.split(r"[.!?]+(?:\s|$)", prose) if s.strip()]
    words = re.findall(r"[A-Za-z0-9'’-]+", prose)
    if not sentences or len(words) < 30:
        return {"error": "not enough prose to score (need >= 30 words)"}

    syllables = [count_syllables(w) for w in words]
    n_words, n_sents = len(words), len(sentences)
    n_syll = sum(syllables)
    # polysyllabic = 3+ syllables; Fog also excludes proper nouns and common
    # -es/-ed/-ing inflations only crudely — we accept the standard approximation
    poly = sum(1 for s in syllables if s >= 3)

    wps = n_words / n_sents          # words per sentence
    spw = n_syll / n_words           # syllables per word

    fk_grade = 0.39 * wps + 11.8 * spw - 15.59
    reading_ease = 206.835 - 1.015 * wps - 84.6 * spw
    gunning_fog = 0.4 * (wps + 100.0 * poly / n_words)
    # SMOG is defined over 30-sentence samples; standard normalized formula:
    smog = 1.0430 * (poly * (30.0 / n_sents)) ** 0.5 + 3.1291

    return {
        "words": n_words,
        "sentences": n_sents,
        "fk_grade": round(fk_grade, 2),
        "reading_ease": round(reading_ease, 2),
        "gunning_fog": round(gunning_fog, 2),
        "smog": round(smog, 2),
    }


def gate(scores: dict) -> dict:
    verdict = {}
    for metric, (op, limit) in THRESHOLDS.items():
        v = scores.get(metric)
        ok = v is not None and (v <= limit if op == "<=" else v >= limit)
        verdict[metric] = ok
    return verdict


def main(argv: list[str]) -> int:
    as_json = "--json" in argv
    paths = [a for a in argv if not a.startswith("--")]
    if not paths:
        print(__doc__)
        return 2

    all_pass, report = True, []
    for path in paths:
        with open(path, encoding="utf-8") as f:
            scores = analyze(f.read())
        if "error" in scores:
            report.append({"file": path, **scores, "pass": False})
            all_pass = False
            continue
        verdict = gate(scores)
        passed = all(verdict.values())
        all_pass &= passed
        report.append({"file": path, **scores, "gates": verdict, "pass": passed})

    if as_json:
        print(json.dumps(report, indent=2))
    else:
        for r in report:
            if "error" in r:
                print(f"FAIL  {r['file']}: {r['error']}")
                continue
            marks = " ".join(
                f"{m}={r[m]}{'✓' if r['gates'][m] else '✗'}"
                for m in THRESHOLDS
            )
            print(f"{'PASS' if r['pass'] else 'FAIL'}  {r['file']}  {marks}")
    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
