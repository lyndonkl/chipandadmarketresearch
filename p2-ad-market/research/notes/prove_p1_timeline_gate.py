#!/usr/bin/env python3
"""Non-vacuity proof for tools/verify_p2.py p1-timeline.

    python3 p2-ad-market/research/notes/prove_p1_timeline_gate.py

A gate that has never failed is indistinguishable from a gate that cannot fail.
This copies the whole repo to a temporary sandbox, breaks exactly one claim per
failure mode the gate claims to cover, and runs the gate against each break.
Expected result: the baseline passes and every break is caught. Nothing in the
real repo is touched - every run happens inside its own tempdir.

Stage P1, 2026-07-31. See data/verification/REPAIR-P1.md section 5.
"""
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

SRC = Path('/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch')

BREAKS = [
    ("baseline (nothing broken)", None, None),
    # the exact failure this stage exists to repair: a claim plotted at its
    # source's publication date instead of the year the fact is about.
    ("era-4.json: e4-scale-006 about_year 1990 -> 2009 (the compiler's vintage)",
     'p2-ad-market/data/eras/era-4.json', ('e4-scale-006', 'about_year', 2009)),
    ("era-7.json: e7-scale-004 about_year deleted (falls back to as_of)",
     'p2-ad-market/data/eras/era-7.json', ('e7-scale-004', 'about_year', '<DELETE>')),
    ("era-2.json: e2-scale-004 about_year set to the string '1949'",
     'p2-ad-market/data/eras/era-2.json', ('e2-scale-004', 'about_year', '1949')),
    ("era-3.json: e3-scale-005 about_span moved off its own about_year",
     'p2-ad-market/data/eras/era-3.json', ('e3-scale-005', 'about_span', [1900, 1910])),
    ("era-7.json: e7-measurement-003 about_year_note removed while not timeline-ready",
     'p2-ad-market/data/eras/era-7.json',
     ('e7-measurement-003', 'about_year_note', '<DELETE>')),
    ("claims.json: e6-unit_econ-001 about_year drifts from its era record",
     'p2-ad-market/data/claims.json', ('e6-unit_econ-001', 'about_year', 1066)),
    ("mechanism.json: mech-mehta-001 about_year 2024 -> 2019, contradicting its text",
     'p2-ad-market/data/mechanism.json', ('mech-mehta-001', 'about_year', 2019)),
    # broken in BOTH copies at once, so the mirror rule cannot fire and the
    # contradiction rule is tested on its own.
    ("ALL copies: e5-scale-005 about_year 2000 -> 2003, a year its text never states",
     ['p2-ad-market/data/eras/era-5.json', 'p2-ad-market/data/claims.json'],
     ('e5-scale-005', 'about_year', 2003)),
    ("ALL copies: e3-scale-005 about_year 1956 -> 956 (out of range)",
     ['p2-ad-market/data/eras/era-3.json', 'p2-ad-market/data/claims.json'],
     ('e3-scale-005', 'about_year', 956)),
]


def apply_break(root, relpath, spec):
    path = root / relpath
    data = json.loads(path.read_text())
    cid, key, val = spec
    hits = [0]

    def walk(n):
        if isinstance(n, dict):
            if n.get('id') == cid and 'statement' in n:
                hits[0] += 1
                if val == '<DELETE>':
                    n.pop(key, None)
                else:
                    n[key] = val
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for v in n:
                walk(v)

    walk(data)
    assert hits[0], f'{cid} not found in {relpath}'
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')


rows = []
for label, relpath, spec in BREAKS:
    with tempfile.TemporaryDirectory() as td:
        sandbox = Path(td) / 'repo'
        shutil.copytree(SRC, sandbox, ignore=shutil.ignore_patterns('.git'))
        if spec:
            for rp in ([relpath] if isinstance(relpath, str) else relpath):
                apply_break(sandbox, rp, spec)
        r = subprocess.run([sys.executable, 'tools/verify_p2.py', 'p1-timeline'],
                           cwd=sandbox, capture_output=True, text=True)
        viols = [json.loads(l)['violation'] for l in r.stdout.splitlines() if l.strip()]
        rows.append((label, r.returncode, viols))

for label, code, viols in rows:
    print(f'\n{"PASS (exit 0)" if code == 0 else f"CAUGHT (exit {code})"}  {label}')
    for v in viols[:3]:
        print(f'    -> {v}')
