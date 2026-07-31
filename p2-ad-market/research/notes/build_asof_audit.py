"""Rebuilds p2-ad-market/data/verification/asof-audit.json from claims.json alone.

Stage P1, 2026-07-31. Deterministic: no network, no randomness, no hand-entered
years except the adjudication table below, each entry of which carries its reason.

    python3 p2-ad-market/research/notes/build_asof_audit.py

The decision it implements: as_of means the provenance date (when the source
published, filed or was retrieved); a new integer field about_year means the year
the fact is about. Charts read about_year. See research/notes/asof-audit.md.
"""
import json, os, re
from collections import Counter

"""Core extraction + rule ladder for the as_of audit. Deterministic, re-runnable."""
import json, re, os

ROOT = '/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch'
CLAIMS = os.path.join(ROOT, 'p2-ad-market/data/claims.json')

YR = re.compile(r'(?<!\d)(1[5-9]\d{2}|20[0-4]\d)(?!\d)')
RANGE2 = re.compile(r'(?<!\d)(1[5-9]\d{2}|20[0-4]\d)\s*[-–/]\s*(\d{2})(?![\d.%])')
NUM = re.compile(r'(?<![\w.])(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)')

ERA_WINDOW = {
    'e1': (1840, 1917), 'e2': (1918, 1949), 'e3': (1950, 1975), 'e4': (1976, 1993),
    'e5': (1994, 2001), 'e6': (2002, 2008), 'e7': (2008, 2026),
}

CHANGE_WORDS = re.compile(
    r'\b(from|rose|fell|grew|up from|down from|declin|increase|peak|by\b.*\bto\b|to roughly|to about|reached)\b',
    re.I)


def year_hits(text):
    """[(year, char_pos)] including YYYY-YY range expansion."""
    hits = []
    for m in YR.finditer(text):
        hits.append((int(m.group(1)), m.start()))
    for m in RANGE2.finditer(text):
        a = int(m.group(1))
        v = int(m.group(1)[:2] + m.group(2))
        if v <= a:
            v += 100  # 1899-01 -> 1901
        if 0 < v - a <= 10:  # a season or cycle, not a stray number pair
            hits.append((v, m.start(2)))
    return sorted(set(hits))


def scale_variants(v):
    """Plausible in-text renderings of a central value, as (value, ) numeric equivalents."""
    out = {v}
    for f in (1e3, 1e6, 1e9, 1e-3, 1e-6, 1e-9, 100.0, 0.01):
        out.add(v * f)
    return out


def central_anchor(statement, central):
    """char position of the token in the statement that renders `central`, or None."""
    if central is None:
        return None
    try:
        c = float(central)
    except (TypeError, ValueError):
        return None
    if c == 0:
        return None
    targets = scale_variants(abs(c))
    best = None
    for m in NUM.finditer(statement):
        raw = m.group(1).replace(',', '')
        try:
            val = float(raw)
        except ValueError:
            continue
        if 1500 <= val <= 2049 and float(val).is_integer():
            continue  # a year token, not a quantity
        for t in targets:
            if t == 0:
                continue
            rel = abs(val - t) / t
            if rel < 0.005:
                score = (rel, m.start())
                if best is None or score < best[0:2]:
                    best = (rel, m.start(), val)
    return best[1] if best else None


def pick_headline(hits, anchor, statement):
    """Return (year, rule, margin). hits = [(year,pos)]."""
    years = sorted(set(y for y, _ in hits))
    if not years:
        return None, 'none', None
    if len(years) == 1:
        return years[0], 'single-year', None
    if anchor is not None:
        ranked = sorted(hits, key=lambda h: (abs(h[1] - anchor), -h[0]))
        best = ranked[0]
        second = next((h for h in ranked[1:] if h[0] != best[0]), None)
        margin = None if second is None else abs(second[1] - anchor) - abs(best[1] - anchor)
        return best[0], 'nearest-to-central', margin
    if CHANGE_WORDS.search(statement):
        return max(years), 'terminal-year-of-change', None
    return max(years), 'max-year-fallback', None


def load_claims():
    return json.load(open(CLAIMS))['claims']


def build_rows():
    rows = []
    for c in load_claims():
        cid = c['id']
        era = cid.split('-')[0]
        st = c['statement']
        unit = str(c.get('unit') or '')
        method = str(c.get('method') or '')
        s_hits = year_hits(st)
        u_hits = year_hits(unit)
        m_hits = year_hits(method)
        anchor = central_anchor(st, c.get('central'))
        as_of = str(c['as_of'])
        as_of_year = int(as_of[:4])
        pick, rule, margin = pick_headline(s_hits, anchor, st)
        rows.append(dict(
            id=cid, era=era, origin=c['origin'], grade=c['grade'], verdict=c.get('verdict'),
            as_of=as_of, as_of_year=as_of_year,
            statement_years=sorted(set(y for y, _ in s_hits)),
            unit_years=sorted(set(y for y, _ in u_hits)),
            method_years=sorted(set(y for y, _ in m_hits)),
            anchor_found=anchor is not None,
            auto_pick=pick, auto_rule=rule, auto_margin=margin,
            statement=st, unit=unit, central=c.get('central'),
            source_names=[s.get('name', '') for s in c.get('sources', [])],
            source_urls=[s.get('url', '') for s in c.get('sources', [])],
        ))
    return rows




# --- hand-adjudicated claims: cases the rule ladder cannot settle correctly ---

OVERRIDES = {
    # --- era 1 ---
    'e1-creators-001': dict(about_year=1841, about_span=[1840, 1842], classification='ambiguous',
        reason="The statement itself reports three founding dates (1840 Britannica / 1841 PCB / 1842 Horsky-Zeithammer). The compiler's 1841 is kept as the middle reading and the span carries the disagreement.", confidence='medium'),
    'e1-pricing-004': dict(about_year=1917, about_span=None, classification='already-correct',
        reason="'at the end of the era' fixes the year at era 1's close, 1917. The 1890s/1893/1918 dates in the statement are the rate's history, not the measurement year.", confidence='high'),
    'e1-events-001': dict(about_year=1835, about_span=[1833, 1835], classification='already-correct',
        reason="Arithmetic inside the statement: 1833 launch plus 'about two years' = 1835. The as_of was right; the year simply never appears as a token.", confidence='high'),
    'e1-events-003': dict(about_year=1899, about_span=[1893, 1899], classification='already-correct',
        reason="Central 750,000 is the terminal value of the 1893-1899 growth, so the point belongs at 1899.", confidence='high'),
    'e1-sellers-005': dict(about_year=1897, about_span=[1893, 1897], classification='needs-source-read',
        reason="The statement dates only the 1893 cover-price cut. The $25,000-35,000 per issue advertising revenue carries no year anywhere in the record; 1897 is the compiler's unsourced choice.", confidence='none', timeline_ready=False),
    'e1-scale-010': dict(about_year=1934, about_span=[1900, 1934], classification='fixable-from-content',
        reason="The source names its own window: Galbi's sheet 'estimates 1900-34' applies this scaling factor across 1900-1934. It is a constant wedge over that window, not a 1935 measurement, and as_of 1935 sits one year off the end of the sheet it came from.", confidence='medium'),
    # --- era 2 ---
    'e2-creators-004': dict(about_year=1929, about_span=None, classification='already-correct',
        reason="'end of the 1920s' is a decade phrase, deliberately not read as a year token; 1922-1972 is the billings-rank span, not the measurement year.", confidence='medium'),
    'e2-pricing-008': dict(about_year=1940, about_span=[1938, 1940], classification='ambiguous',
        reason="An era-typical production share triangulated in the method from 1938-1940 rate cards and Coen totals. No single measurement year exists.", confidence='low'),
    # --- era 3 ---
    'e3-buyers-004': dict(about_year=1970, about_span=[1970, 1971], classification='already-correct',
        reason="Spend measured 'immediately before the 2 January 1971 ban' is calendar-1970 spend. 1971 is the ban date.", confidence='high'),
    'e3-sellers-001': dict(about_year=1975, about_span=None, classification='already-correct',
        reason="Central 8.3% is the 1975 ratio, computed in the method from Coen's 1975 rows.", confidence='high'),
    'e3-medium-003': dict(about_year=1975, about_span=[1950, 1975], classification='already-correct',
        reason="Central 18.9% is the 1975 endpoint of the 1950-1975 rise.", confidence='high'),
    # --- era 4 ---
    'e4-sellers-001': dict(about_year=1989, about_span=[1988, 1989], classification='already-correct',
        reason="A 1988-89 season figure; the season-ending year is the placement, the span carries the season.", confidence='high'),
    'e4-medium-003': dict(about_year=1993, about_span=[1976, 1993], classification='already-correct',
        reason="Central $27,266M is the 1993 endpoint.", confidence='high'),
    'e4-medium-007': dict(about_year=1993, about_span=[1980, 1993], classification='already-correct',
        reason="Central 65,773 million pieces is the FY1993 endpoint.", confidence='high'),
    'e4-scale-006': dict(about_year=1990, about_span=None, classification='already-correct',
        reason="The cleanest case of the two meanings in one sentence: the fact is the 1990 datapoint; 2001 and 2009 are the two vintages that print it differently. as_of should eventually name one of those vintages, about_year stays 1990.", confidence='high'),
    'e4-pricing-001': dict(about_year=1992, about_span=[1977, 1997], classification='already-correct',
        reason="Central 13.18% is the 1992 observation in a five-year series.", confidence='high'),
    'e4-pricing-004': dict(about_year=1993, about_span=[1980, 1993], classification='already-correct',
        reason="Central 14.9 cents is the FY1993 endpoint.", confidence='high'),
    'e4-targeting-005': dict(about_year=1990, about_span=[1976, 1990], classification='already-correct',
        reason="Central 79 cable networks is the 1990 endpoint.", confidence='high'),
    'e4-events-001': dict(about_year=1993, about_span=[1980, 1993], classification='already-correct',
        reason="Central $9,517M is the 1993 endpoint.", confidence='high'),
    'e4-measurement-004': dict(about_year=1980, about_span=[1979, 1980], classification='already-correct',
        reason="'launched in 1979-80'; the later year is kept as the placement and the span carries the two-year launch.", confidence='medium'),
    'e4-measurement-002': dict(about_year=1987, about_span=[1987, 1988], classification='fixable-from-content',
        reason="Same people-meter switchover as e4-measurement-001 and e4-events-003, which the record dates to September 1987. as_of 1988-01 is the Christian Science Monitor publication date, 6 January 1988.", confidence='high'),
    'e4-measurement-003': dict(about_year=1987, about_span=[1987, 1988], classification='fixable-from-content',
        reason="Same source and same event as e4-measurement-002: a 1987 panel measured, reported in January 1988.", confidence='high'),
    'e4-targeting-001': dict(about_year=1974, about_span=[1974, 1978], classification='ambiguous',
        reason="1970 is the census vintage of PRIZM's input data, not the fact year. The record contests PRIZM's launch itself (e4-targeting-002: 1974 from Griffith, 1978 from later accounts); 1974 is the record's own preferred reading and the span carries the dispute.", confidence='low'),
    # --- era 5 ---
    'e5-creators-003': dict(about_year=1997, about_span=[1977, 1997], classification='already-correct',
        reason="Central 11% is the 1997 observation; 14% in 1977 is the comparison.", confidence='high'),
    'e5-scale-005': dict(about_year=2000, about_span=None, classification='already-correct',
        reason="Central $8.087B is the restated figure FOR 2000. June 2002 is the report edition that first printed the year, and 2002 is exactly the kind of date that belongs in as_of, not on an axis.", confidence='high'),
    'e5-scale-015': dict(about_year=2000, about_span=None, classification='already-correct',
        reason="Central 23.8% is the 2000 share; 1994 and 2001 appear only as era-boundary references.", confidence='high'),
    'e5-scale-016': dict(about_year=2000, about_span=None, classification='already-correct',
        reason="Central 29.2% is the 2000 share; 1994 and 2001 appear only as era-boundary references.", confidence='high'),
    'e5-measurement-001': dict(about_year=2000, about_span=[1994, 2000], classification='already-correct',
        reason="Central 0.3% is the mid-2000 rate; 1994-96 are the launch-era comparison.", confidence='high'),
    'e5-pricing-008': dict(about_year=1996, about_span=[1996, 1997], classification='fixable-from-content',
        reason="The method derives the $5.0M implied slot price from the even split of the April 1996 agreement; the March 1997 renewal only bounds it from above.", confidence='medium'),
    # --- era 7 ---
    'e7-measurement-002': dict(about_year=2021, about_span=[2021, 2022], classification='fixable-from-content',
        reason="Central $468M is the twelve-month revenue loss following the September 2021 MRC suspension. as_of 2023-04 is the reinstatement date, which is a third thing again - neither the measurement year nor the source's publication date.", confidence='medium'),
    'e7-unit_econ-002': dict(about_year=2020, about_span=[2020, 2025], classification='fixable-from-content',
        reason="Central 0.0065 USD per query is explicitly the 2020 cost; the 2021 and FY2025 figures are the comparisons.", confidence='high'),
    'e7-measurement-003': dict(about_year=2025, about_span=[2024, 2025], classification='needs-source-read',
        reason="The unit label says 2026, which nothing in the record supports: the source is IAB/PwC's Full-Year 2025 report citing Imperva's 2025 Bad Bot Report, whose measurement window is 2024 traffic. Both the unit year and the as_of need a source read.", confidence='none', timeline_ready=False),
    # --- dataset-level ---
    'ds-gap-001': dict(about_year=2011, about_span=[2011, 2025], classification='ambiguous',
        reason="A negative result about a fifteen-year window. The band is the fact; a single point is a rendering convention, so the span is the load-bearing field here.", confidence='medium'),
    'ds-provenance-001': dict(about_year=2026, about_span=None, classification='ambiguous',
        reason="A claim about this dataset's own provenance coverage, not about the advertising market. It must never appear on the history timeline; its year is the audit date.", confidence='high', timeline_ready=False),
    # --- mechanism ---
    'mech-aol-005': dict(about_year=2005, about_span=[2002, 2005], classification='fixable-from-content',
        reason="Central $1,134.6M is the total realised when the share sales completed during 2005. May 2002 (in the unit label) is the warrant grant date.", confidence='high'),
    'mech-aol-006': dict(about_year=2009, about_span=[2006, 2009], classification='fixable-from-content',
        reason="Central $717M is the realised loss on the 2009 sale-back; 2006 (in the unit label) is the investment date.", confidence='high'),
    'mech-aol-007': dict(about_year=2002, about_span=None, classification='already-correct',
        reason="The one-day share-price fall happened on the May 2002 AOL announcement named in the unit label; the event date is the fact date.", confidence='high'),
    'mech-mehta-003': dict(about_year=2020, about_span=[2016, 2020], classification='ambiguous',
        reason="Two internal analyses, 2016 and 2020. Central 70% is carried on the later one; the span carries both.", confidence='medium'),
    'mech-mehta-001': dict(about_year=2024, about_span=None, classification='needs-source-read',
        reason="Query-share percentages found by the court in August 2024 but measured on trial-record years the claim never names. The as_of is the opinion date - provenance - and the measurement year must be read out of the findings of fact.", confidence='none', timeline_ready=False),
    'mech-mehta-004': dict(about_year=2024, about_span=None, classification='needs-source-read',
        reason="A court finding about repeated price tests over an unstated period. as_of is the opinion date; the test years must be read out of the findings of fact.", confidence='none', timeline_ready=False),
    # --- claims with no year anywhere in their own content, adjudicated on what the source IS ---
    'e7-pricing-002': dict(about_year=2019, about_span=[2018, 2019], classification='fixable-from-content',
        reason="The same finding of fact as e7-events-007, which names 2019 as the year rGSP replaced format pricing. The 20% level is the state just before that replacement.", confidence='medium'),
    'mech-format_pricing-001': dict(about_year=2019, about_span=[2018, 2019], classification='fixable-from-content',
        reason="Same finding of fact as e7-events-007 and e7-pricing-002; 2024-08-05 is the opinion's filing date.", confidence='medium'),
    'e7-pricing-004': dict(about_year=2020, about_span=[2019, 2020], classification='ambiguous',
        reason="The ISBA/PwC study is the primary producer of the measurement, so its May 2020 publication sits within a year of the sampling window. The record does not name the window, so the span carries the uncertainty.", confidence='medium'),
    'e7-pricing-005': dict(about_year=2023, about_span=None, classification='ambiguous',
        reason="The ANA programmatic transparency study measures the period it reports on; December 2023 is both its publication and, within a year, its measurement window.", confidence='medium'),
    'e7-measurement-004': dict(about_year=2025, about_span=None, classification='ambiguous',
        reason="Pew produced this measurement itself, so the July 2025 publication and the measurement year coincide. The exact field-work month is not in the record.", confidence='medium'),
    'e7-events-008': dict(about_year=2025, about_span=None, classification='ambiguous',
        reason="Same Pew study as e7-measurement-004.", confidence='medium'),
    'mech-default-003': dict(about_year=2023, about_span=None, classification='ambiguous',
        reason="A standing contract term, not an annual measurement. 2023 is when it was disclosed in open court; the rate itself has no single year.", confidence='medium'),
    'mech-knobs-001': dict(about_year=2024, about_span=None, classification='already-correct',
        reason="The object of this claim is the opinion itself - how many pricing knobs its findings of fact name - so the document's year IS the fact year. One of the few claims where provenance and fact legitimately coincide.", confidence='high'),
    'e7-pricing-003': dict(about_year=2023, about_span=None, classification='needs-source-read',
        reason="Auction 'tunings' ran over an unstated number of quarters; 2023-09-18 is the date Dischler testified. The years the tunings were applied must be read out of the trial record.", confidence='none', timeline_ready=False),
    'mech-tuning-001': dict(about_year=2023, about_span=None, classification='needs-source-read',
        reason="Same testimony as e7-pricing-003; the practice spans years the record does not name.", confidence='none', timeline_ready=False),
}



DECADE = re.compile(r'(?<!\d)(1[5-9]\d0|20[0-4]0)s')
UNIT_IS_YEAR = re.compile(r'^\s*year\b|\byear the\b|\byear that\b|\byear of\b|^\s*calendar year', re.I)
UNIT_YEAR_PAREN = re.compile(r'year\s*\((\d{4})')
SPAN_WORDS = re.compile(r'\b(from|to|through|between|across|cagr|compound|growth|change|plateau|cycle|season|era ran)\b|[-–]', re.I)
ERA_END_PHRASE = re.compile(r"\b(at |by |towards? )?the end of the era|era'?s? (final|last|closing) year|at era end|by era end", re.I)
ERA_START_PHRASE = re.compile(r"era'?s? (opening|first) year|at the start of the era|beginning of the era", re.I)
ERA_SPAN_PHRASE = re.compile(r"through(out)? the (whole )?era|across the era|for the whole era|the whole era|during the era|inside the era|in this era|the era'?s\b", re.I)
CONTESTED = re.compile(r"\b(contested|sources? (date|disagree)|disputed|not settled|no source settles)\b", re.I)


def decade_positions(text):
    return set(m.start() for m in DECADE.finditer(text))


def hits_nodecade(text):
    dp = decade_positions(text)
    return [(y, p) for (y, p) in year_hits(text) if p not in dp]


def era_of(cid):
    return cid.split('-')[0]


def derive(c, overrides):
    cid = c['id']
    st = c['statement']
    unit = str(c.get('unit') or '')
    method = str(c.get('method') or '')
    central = c.get('central')
    as_of = str(c['as_of'])
    as_of_year = int(as_of[:4])
    era = era_of(cid)
    win = ERA_WINDOW.get(era)

    s_hits = hits_nodecade(st)
    s_years = sorted(set(y for y, _ in s_hits))
    u_hits = hits_nodecade(unit)
    u_years = sorted(set(y for y, _ in u_hits))
    m_years = sorted(set(y for y, _ in hits_nodecade(method)))
    anchor = central_anchor(st, central)

    span = None
    notes = []

    # R0 manual override
    if cid in overrides:
        o = overrides[cid]
        return dict(about_year=o['about_year'], about_span=o.get('about_span'),
                    rule='R0-adjudicated', note=o['reason'],
                    s_years=s_years, u_years=u_years, m_years=m_years, as_of_year=as_of_year,
                    anchor=anchor is not None, confidence=o.get('confidence', 'high'))

    # R1 the measured quantity IS a year
    if UNIT_IS_YEAR.search(unit) and isinstance(central, (int, float)) \
            and float(central).is_integer() and 1500 <= central <= 2049:
        if u_years:
            span = [min(u_years + [int(central)]), max(u_years + [int(central)])]
            if span[0] == span[1]:
                span = None
        return dict(about_year=int(central), about_span=span, rule='R1-central-is-the-year',
                    note='unit declares the quantity to be a year; central is that year',
                    s_years=s_years, u_years=u_years, m_years=m_years, as_of_year=as_of_year,
                    anchor=anchor is not None, confidence='high')

    # R2 unit carries exactly one year -> it labels the central
    if len(u_years) == 1:
        return dict(about_year=u_years[0], about_span=None, rule='R2-unit-single-year',
                    note='the unit label dates the central',
                    s_years=s_years, u_years=u_years, m_years=m_years, as_of_year=as_of_year,
                    anchor=anchor is not None, confidence='high')

    # R3 unit carries a span
    if len(u_years) >= 2:
        span = [min(u_years), max(u_years)]
        pick = as_of_year if as_of_year in u_years else max(u_years)
        rule = 'R3-unit-span-asof-endpoint' if as_of_year in u_years else 'R3-unit-span-terminal-year'
        return dict(about_year=pick, about_span=span, rule=rule,
                    note='unit dates the central to a span; single-year placement is the stated endpoint',
                    s_years=s_years, u_years=u_years, m_years=m_years, as_of_year=as_of_year,
                    anchor=anchor is not None, confidence='medium')

    # R4 method carries exactly one year and statement carries none
    if not s_years and len(m_years) == 1:
        return dict(about_year=m_years[0], about_span=None, rule='R4-method-single-year',
                    note='the method note dates the derivation',
                    s_years=s_years, u_years=u_years, m_years=m_years, as_of_year=as_of_year,
                    anchor=anchor is not None, confidence='medium')

    # R5 statement carries exactly one year
    if len(s_years) == 1:
        return dict(about_year=s_years[0], about_span=None, rule='R5-statement-single-year',
                    note='only one year appears in the statement',
                    s_years=s_years, u_years=u_years, m_years=m_years, as_of_year=as_of_year,
                    anchor=anchor is not None, confidence='high')

    # R6 nearest year to the rendering of `central`
    if anchor is not None and s_hits:
        ranked = sorted(s_hits, key=lambda h: (abs(h[1] - anchor), -h[0]))
        best = ranked[0][0]
        others = [h for h in ranked[1:] if h[0] != best]
        margin = abs(others[0][1] - anchor) - abs(ranked[0][1] - anchor) if others else None
        conf = 'high' if (margin is None or margin >= 8) else 'medium'
        return dict(about_year=best, about_span=[min(s_years), max(s_years)] if len(s_years) > 1 else None,
                    rule='R6-nearest-to-central',
                    note='the year adjacent to the token that renders the central value',
                    s_years=s_years, u_years=u_years, m_years=m_years, as_of_year=as_of_year,
                    anchor=True, confidence=conf, margin=margin)

    # R7 era phrases
    if win:
        if ERA_END_PHRASE.search(st):
            return dict(about_year=win[1], about_span=None, rule='R7-era-end-phrase',
                        note="statement places the fact at the era's end",
                        s_years=s_years, u_years=u_years, m_years=m_years, as_of_year=as_of_year,
                        anchor=False, confidence='medium')
        if ERA_START_PHRASE.search(st):
            return dict(about_year=win[0], about_span=None, rule='R7-era-start-phrase',
                        note="statement places the fact at the era's start",
                        s_years=s_years, u_years=u_years, m_years=m_years, as_of_year=as_of_year,
                        anchor=False, confidence='medium')
        if ERA_SPAN_PHRASE.search(st) and not s_years:
            pick = as_of_year if win[0] <= as_of_year <= win[1] else win[1]
            return dict(about_year=pick, about_span=list(win), rule='R7-era-scoped',
                        note='fact holds across the era; representative year kept, era span carried',
                        s_years=s_years, u_years=u_years, m_years=m_years, as_of_year=as_of_year,
                        anchor=False, confidence='low')

    # R8 first year in the statement (these statements lead with the measured year)
    if s_years:
        first = sorted(s_hits, key=lambda h: h[1])[0][0]
        return dict(about_year=first, about_span=[min(s_years), max(s_years)] if len(s_years) > 1 else None,
                    rule='R8-first-year-in-statement',
                    note='no central token located; the leading year is taken as the measured year',
                    s_years=s_years, u_years=u_years, m_years=m_years, as_of_year=as_of_year,
                    anchor=False, confidence='low')

    # R9 nothing in the claim's own content
    pick = as_of_year if (win and win[0] <= as_of_year <= win[1]) else as_of_year
    return dict(about_year=pick, about_span=list(win) if win else None, rule='R9-no-content-year',
                note='no year anywhere in statement, unit or method; as_of year carried provisionally',
                s_years=s_years, u_years=u_years, m_years=m_years, as_of_year=as_of_year,
                anchor=False, confidence='none')


def run(overrides=None):
    overrides = overrides or {}
    out = []
    for c in load_claims():
        d = derive(c, overrides)
        d['id'] = c['id']
        d['as_of'] = str(c['as_of'])
        d['central'] = c.get('central')
        d['unit'] = str(c.get('unit') or '')
        d['statement'] = c['statement']
        d['grade'] = c['grade']
        d['origin'] = c['origin']
        d['verdict'] = c.get('verdict')
        d['sources'] = c.get('sources', [])
        d['era'] = era_of(c['id'])
        out.append(d)
    return out





ROOT = '/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch'
OUT = os.path.join(ROOT, 'p2-ad-market/data/verification/asof-audit.json')
AUDIT_DATE = '2026-07-31'

CLASSES = ('already-correct', 'fixable-from-content', 'needs-source-read', 'ambiguous')


def source_years(c):
    ys = set()
    for s in c.get('sources', []):
        for f in ('name', 'url'):
            ys |= set(int(x) for x in YR.findall(str(s.get(f, ''))))
    return sorted(ys)


def classify(r, ov):
    """Four buckets, judged on what the claim's OWN content can settle."""
    if ov and 'classification' in ov:
        return ov['classification']
    if r['rule'].startswith('R9'):
        # nothing in statement, unit or method. A dated as_of means a dated source
        # exists and can be read; a bare one means an era-typical fact with no year.
        return 'needs-source-read' if len(r['as_of']) > 4 else 'ambiguous'
    if r['rule'].startswith('R7-era-scoped'):
        return 'ambiguous'
    if r['about_year'] == r['as_of_year']:
        return 'already-correct'   # content reading and compiler agree
    return 'fixable-from-content'


def as_of_kind(r, syears, span):
    """What the CURRENT as_of value actually is, judged against the decided definition."""
    dated = len(r['as_of']) > 4              # month or day precision
    ay, by = r['as_of_year'], r['about_year']
    if ay < by:
        return 'impossible-as-provenance'    # a source cannot predate the fact it reports
    if dated:
        return 'source-date'                 # publication, filing or retrieval; provenance-shaped
    if ay == by or (span and span[0] <= ay <= span[1]):
        return 'fact-year-legacy'            # meaning (a), stamped into a provenance field
    if ay in syears:
        return 'source-year-plausible'
    return 'unexplained'


def build():
    raw = {c['id']: c for c in load_claims()}
    rows = run(OVERRIDES)
    out_claims = []
    for r in rows:
        c = raw[r['id']]
        ov = OVERRIDES.get(r['id'])
        syears = source_years(c)
        cls = classify(r, ov)
        kind = as_of_kind(r, syears, r['about_span'])
        timeline_ready = True
        if ov and ov.get('timeline_ready') is False:
            timeline_ready = False
        elif cls == 'needs-source-read':
            timeline_ready = False
        if cls == 'needs-source-read' and r['rule'].startswith('R9'):
            # a 19-year era band is not knowledge, it is ignorance dressed as a span
            r['about_span'] = None
        basis = ('adjudicated' if r['rule'].startswith('R0')
                 else 'compiler-assumed' if (r['rule'].startswith('R9') or r['confidence'] in ('low', 'none'))
                 else 'read-from-claim')
        as_of_action = {
            'source-date': 'keep',
            'fact-year-legacy': 'keep-flagged',
            'source-year-plausible': 'keep',
            'unexplained': 'read-source',
            'impossible-as-provenance': 'read-source',
        }[kind]
        out_claims.append({
            'id': r['id'],
            'era': r['era'],
            'origin': r['origin'],
            'grade': r['grade'],
            'as_of_current': r['as_of'],
            'as_of_year': r['as_of_year'],
            'years_in_statement': r['s_years'],
            'years_in_unit': r['u_years'],
            'years_in_method': r['m_years'],
            'years_in_sources': syears,
            'classification': cls,
            'proposed': {
                'about_year': r['about_year'],
                'about_span': r['about_span'],
                'timeline_ready': timeline_ready,
                'basis': basis,
                'rule': r['rule'],
                'confidence': r['confidence'],
            },
            'displacement_years': r['about_year'] - r['as_of_year'],
            'as_of_kind': kind,
            'as_of_action': as_of_action,
            'note': (ov or {}).get('reason', r['note']),
        })
    return out_claims


def concordance(rows):
    def pop(pred, name, what, why):
        sel = [r for r in rows if pred(r)]
        disp = [abs(r['displacement_years']) for r in sel]
        moved = [d for d in disp if d]
        return {
            'entry': name,
            'population': what,
            'claims': len(sel),
            'claims_whose_as_of_is_not_the_fact_year': len(moved),
            'median_displacement_years': (sorted(moved)[len(moved) // 2] if moved else 0),
            'max_displacement_years': (max(disp) if disp else 0),
            'why': why,
        }

    e16 = ('e1', 'e2', 'e3', 'e4', 'e5', 'e6')
    return [
        pop(lambda r: r['era'] in e16 and r['as_of_kind'] != 'source-date',
            'break-1: eras 1-6 bare-year claims use meaning (a)',
            'claims from eras/era-1..6.json whose as_of is a bare year',
            'The era researchers stamped as_of with the year the fact happened. Under the decided definition these values are legacy fact-years sitting in a provenance field: harmless once as_of leaves every axis, wrong as provenance.'),
        pop(lambda r: r['era'] in e16 and r['as_of_kind'] == 'source-date',
            'break-2: eras 1-6 dated claims use meaning (b)',
            'claims from eras 1-6 whose as_of carries month or day precision',
            'Where the evidence was a dated newspaper article, filing or rate card, the same researchers switched to the publication date without saying so. e4-measurement-001 and e4-events-003 are stamped 1988-01, the Christian Science Monitor issue date, for a September 1987 measurement.'),
        pop(lambda r: r['era'] == 'e7',
            'break-3: era 7 uses meaning (b) as its default',
            'claims from eras/era-7.json',
            'Era 7 was researched against live reports and court documents, so as_of became the report date. Seventeen claims share as_of 2026-04, the IAB/PwC Full-Year 2025 publication, while their facts spread across 2008-2025.'),
        pop(lambda r: r['era'] == 'mech',
            'break-4: mechanism.json uses the court-document date',
            'claims from mechanism.json',
            'The Mehta opinion (2024-08-05) and the Overture/AOL filings supply most mechanism claims. as_of is the document date throughout; the facts it records run from 2002 to 2022.'),
        pop(lambda r: r['era'] == 'ds',
            'break-5: adspend.json claims use the compiler vintage',
            'claims from adspend.json',
            "These carry the vintage of the compiled series (Galbi's 2008-09 workbook, the NAA 3/11 table, the 2026-06-30 dataset audit). ds-gdp-001 stamps a 1922 fact with 2008-09-14 - an 86-year displacement, the largest in the file.",),
    ]


def cross_checks(rows, claims_raw):
    checks = []

    # CC1 - the prior sweep (R3b sec.11) counted the damage independently.
    moved = [r for r in rows if r['displacement_years'] != 0]
    r3b_count = 51  # 9 out-of-era-window + 42 unit-label mismatches, REPAIR-R3b.md sec. 11
    div = abs(len(moved) - r3b_count) / r3b_count
    checks.append({
        'id': 'cc-01-r3b-recount',
        'independent_source': 'p2-ad-market/data/verification/REPAIR-R3b.md, section 11 (a different agent, a different method: it compared as_of against the unit label and the era window)',
        'their_figure': f'{r3b_count} claims misplaced ("roughly 50")',
        'our_figure': f'{len(moved)} claims whose about_year differs from as_of_year',
        'divergence': round(div, 3),
        'tolerance': 0.15,
        'flag': div > 0.15,
        'note': "FLAGGED, and the flag is the finding. Both counts describe the same population; ours is larger because the unit-label test is blind to claims whose unit carries no year at all, and because it could not catch the cases where as_of names a third date that is neither the fact nor the publication (e7-measurement-002 carries the accreditation REINSTATEMENT date). BUILD-PLAN.md names 'the as_of audit finds the ambiguity reaches further than 58 claims' as a re-plan trigger. It does, on two counts: 59 claims move, and 339 of 505 as_of values are not source dates at all.",
    })

    # CC2 - the brief's own count of 58.
    naive = re.compile(r'\b(1[5-9]\d{2}|20[0-4]\d)\b')
    n58 = 0
    for c in claims_raw:
        ys = set(int(x) for x in naive.findall(c['statement']))
        if ys and int(str(c['as_of'])[:4]) not in ys:
            n58 += 1
    checks.append({
        'id': 'cc-02-brief-58',
        'independent_source': "the task brief: '58 claims carry an as_of year that appears nowhere in their own statement'",
        'their_figure': '58',
        'our_figure': f'{n58} on a naive word-boundary year scan of the statement only',
        'divergence': round(abs(n58 - 58) / 58, 3),
        'tolerance': 0.15,
        'flag': abs(n58 - 58) / 58 > 0.15,
        'note': "Reproduced exactly. The audit's own scan is tighter: it reads FY1993, 1988-89 and 1934-35 forms as years and ignores decade tokens like '1970s', which moves several claims out of the mismatch set and others into it.",
    })

    # CC3 - era-window containment.
    outside = []
    for r in rows:
        w = ERA_WINDOW.get(r['era'])
        if w and not (w[0] <= r['proposed']['about_year'] <= w[1]):
            outside.append({'id': r['id'], 'about_year': r['proposed']['about_year'], 'window': list(w)})
    checks.append({
        'id': 'cc-03-era-window',
        'independent_source': 'the declared year window in each eras/era-N.json',
        'their_figure': 'era 1 1840-1917, era 2 1918-1949, era 3 1950-1975, era 4 1976-1993, era 5 1994-2001, era 6 2002-2008, era 7 2008-2026',
        'our_figure': f'{len(outside)} proposed about_year values fall outside their own era window',
        'divergence': round(len(outside) / len(rows), 3),
        'tolerance': 0.15,
        'flag': len(outside) / len(rows) > 0.15,
        'exceptions': outside,
        'note': "REPAIR-R3b section 11 found nine such claims by hand and named their years: era 1 holds 1835, 1921, 1926 and 1935; era 2 holds 1890; era 3 holds 1979 and 1982; era 4 holds 1974; era 6 holds 2009. This audit reproduces all nine from the claim text alone and adds one - e4-targeting-001, moved to 1974 to agree with its sibling e4-targeting-002. Every exception is a claim that deliberately reaches outside its era for context. They are findings, not errors, and each is listed so a chart can decide whether to draw it inside its era band.",
    })

    # CC4 - the house convention already exists in the same frozen layer.
    ads = json.load(open(os.path.join(ROOT, 'p2-ad-market/data/adspend.json')))
    n = same = after = before = 0
    for sv in ads['series'].values():
        for p in sv.get('points', []):
            a = str((p.get('calibration') or {}).get('as_of', ''))[:4]
            if not a:
                continue
            n += 1
            y = p['year']
            same += int(int(a) == y)
            after += int(int(a) > y)
            before += int(int(a) < y)
    checks.append({
        'id': 'cc-04-adspend-precedent',
        'independent_source': 'p2-ad-market/data/adspend.json, 1,573 points built by a different stage',
        'their_figure': f'{after} of {n} points have calibration.as_of strictly AFTER the point year, {before} before, {same} equal',
        'our_figure': 'the decided definition: as_of = provenance, a separate field carries the fact year',
        'divergence': round(before / n, 3),
        'tolerance': 0.15,
        'flag': (before / n) > 0.15,
        'note': "Decisive. The frozen layer already implements the split for points: `year` carries the fact, `calibration.as_of` carries the source vintage, and no point has a source date preceding its fact. claims.json is the only file that conflates the two. about_year is nothing more than claims.json finally getting adspend.json's `year`.",
    })

    # CC5 - code that consumes as_of today, in both meanings.
    vp = open(os.path.join(ROOT, 'tools/verify_p2.py')).read()
    uses_fact = 'r2-rdy-01' in vp and re.search(r'as_of.*?\n.*?year = int\(m\.group\(1\)\)', vp, re.S) is not None
    uses_prov = 'past the freeze date' in vp
    checks.append({
        'id': 'cc-05-consumers-disagree',
        'independent_source': 'tools/verify_p2.py, the frozen verifier',
        'their_figure': 'check r2-rdy-01 parses claim as_of as a YEAR and looks it up in the adspend totals (meaning a); check r2-rdy-02 tests point as_of against the freeze date (meaning b)',
        'our_figure': f'meaning-(a) consumer present: {uses_fact}; meaning-(b) consumer present: {uses_prov}',
        'divergence': 0.0,
        'tolerance': 0.15,
        'flag': bool(uses_fact and uses_prov),
        'note': 'Flagged deliberately. The ambiguity is already load-bearing in code, not just in data: one verifier reads as_of as a fact year, another reads it as provenance, in the same file. r2-rdy-01 must be repointed at about_year when this proposal is applied, or it will silently stop comparing anything.',
    })

    return checks


def verification(rows):
    ids = [r['id'] for r in rows]
    plottable = [r for r in rows if r['proposed']['timeline_ready']]
    bad_year = [r['id'] for r in plottable
                if not isinstance(r['proposed']['about_year'], int)]
    bad_span = [r['id'] for r in rows if r['proposed']['about_span'] and
                not (len(r['proposed']['about_span']) == 2
                     and r['proposed']['about_span'][0] <= r['proposed']['about_year'] <= r['proposed']['about_span'][1])]
    out_of_range = [r['id'] for r in rows
                    if not (1830 <= r['proposed']['about_year'] <= 2026)]
    return [
        {'check': 'every claim audited', 'expected': 505, 'got': len(rows), 'pass': len(rows) == 505},
        {'check': 'claim ids unique', 'expected': len(set(ids)), 'got': len(ids), 'pass': len(set(ids)) == len(ids)},
        {'check': 'every timeline_ready claim resolves to exactly one integer year',
         'expected': 0, 'got': len(bad_year), 'pass': not bad_year, 'offenders': bad_year,
         'note': 'This is the gate condition P1 must clear.'},
        {'check': 'about_year lies inside about_span wherever a span is given',
         'expected': 0, 'got': len(bad_span), 'pass': not bad_span, 'offenders': bad_span},
        {'check': 'about_year inside the dataset coverage window 1830-2026',
         'expected': 0, 'got': len(out_of_range), 'pass': not out_of_range, 'offenders': out_of_range},
        {'check': 'no claim proposes an as_of that predates its own about_year',
         'expected': 0, 'got': sum(1 for r in rows if r['as_of_kind'] == 'impossible-as-provenance'),
         'pass': not any(r['as_of_kind'] == 'impossible-as-provenance' for r in rows)},
    ]


def main():
    rows = build()
    claims_raw = load_claims()
    by_class = Counter(r['classification'] for r in rows)
    by_kind = Counter(r['as_of_kind'] for r in rows)
    by_action = Counter(r['as_of_action'] for r in rows)
    moved = [r for r in rows if r['displacement_years'] != 0]
    worst = sorted(rows, key=lambda r: -abs(r['displacement_years']))[:12]
    not_provenance = by_kind['fact-year-legacy'] + by_kind['unexplained']
    HONEST_COST = (
        "Under this definition most eras 1-6 as_of values are legacy fact-years sitting in a provenance field. "
        "They are not lies, they are undocumented - and once as_of is off every axis they are also harmless. "
        "Re-stamping them with true publication dates needs one source read per claim and is scheduled as a separate, "
        "non-blocking pass. This is the sense in which the ambiguity reaches further than the 58 claims the brief names: "
        f"{not_provenance} of 505 as_of values are not source dates at all, against {by_kind['source-date'] + by_kind['source-year-plausible']} that are. "
        "What the audit does NOT do is change a single as_of value on that account: the fix that matters is the new field.")

    doc = {
        'audit': 'as_of definition, and the placement of all 505 claims under it',
        'metric': 'a single unambiguous meaning for as_of across every claim in the frozen research data layer',
        'coverage_window': '1840s-2026',
        'target_file': 'p2-ad-market/data/claims.json',
        'built_by': 'series-archaeologist',
        'as_of': AUDIT_DATE,
        'about_year': 2026,
        'schema_note': 'No schema_spec was supplied. The default archaeologist shape is adapted to a definitional audit: decision, rule_ladder (the reproducible arithmetic), concordance (the definitional breaks between claim populations), claims (the per-claim rows), cross_checks. Point/claim IDs are the existing claim IDs; no new ID convention is introduced.',
        'decision': {
            'as_of': {
                'means': 'the provenance date: when the governing source published, filed, or was retrieved',
                'shape': 'ISO date, year / year-month / year-month-day precision as known',
                'answers': 'published when, by whom',
                'may_appear_on_an_axis': False,
                'kept_because': '505 claims and every downstream consumer already carry the key; renaming it was ruled out by the brief and would break the verifier, the era files and the verdict ledger at once.',
            },
            'about_year': {
                'means': 'the calendar year the fact is about - when the thing happened or was measured',
                'shape': 'integer, exactly one, required on every claim',
                'answers': 'where in history this sits',
                'may_appear_on_an_axis': True,
                'chart_rule': 'A chart reads about_year and only about_year. as_of belongs in the provenance panel or tooltip, never on the x-axis.',
            },
            'about_span': {
                'means': 'the year range the fact covers, when it covers more than one year',
                'shape': '[start, end] or null',
                'chart_rule': 'When about_span is present the chart draws a band and anchors the point at about_year. A season, a cycle, a growth interval and an era-typical practice are all spans; drawing them as bare points is the same class of error as misdating them.',
            },
            'timeline_ready': {
                'means': 'whether about_year is read from evidence rather than assumed',
                'shape': 'boolean',
                'chart_rule': 'false means the claim may not be plotted at all until a source has been read. It is the gate condition, and it fails loudly instead of drawing a guess.',
            },
            'recommendation_argument': [
                "The experience needs the fact year, so the fact year gets its own field rather than a contested one. Every chart in the build places a claim in history; none of them plots publication dates.",
                "as_of cannot be the fact year, because 131 of its values carry month or day precision. '2024-08-05' is the filing date of a court opinion and '1971-09-13' is an issue date. A field that can hold a day is describing a document, not a year in economic history.",
                "Provenance is not decoration here, it is identity. This dataset's central problem is that compilers revise: e4-scale-006 is one 1990 total printed as $129,590M in a 2001 edition and $129,968M in a 2009 workbook. Only the source date distinguishes two numbers for the same fact year. Fold as_of into the fact year and the record loses the ability to tell two vintages apart - exactly the ability the rest of the project is built on.",
                "adspend.json in the same frozen layer already does this: 1,573 points carry `year` for the fact and `calibration.as_of` for the vintage, and not one has a source date preceding its fact. about_year makes claims.json obey the convention its sibling already follows.",
                "Cost is asymmetric. Defining as_of as provenance leaves every existing as_of value legal as data (a bare year is a coarse vintage), needs no number changed, and moves the timeline work into a new field. Defining as_of as the fact year would require overwriting 131 dated values, destroying the only provenance the claims carry.",
            ],
            'rejected_alternative': {
                'option': 'as_of = the year the fact is about; provenance moves to a new field',
                'why_not': 'It reads well on the 374 bare-year claims and then destroys the 131 dated ones. It also inverts the meaning the term carries in the rigor spec, in adspend.json, and in ordinary statistical usage, where an as-of date is the vintage of the reading.',
            },
            'honest_cost': HONEST_COST,
        },
        'rule_ladder': [
            {'rule': 'R0-adjudicated', 'description': 'hand-adjudicated; the ladder cannot settle it. Each carries its reason in the claim note.'},
            {'rule': 'R1-central-is-the-year', 'description': 'the unit declares the measured quantity to BE a year (e.g. "year the IAB Click Measurement Guidelines were released"); about_year = central.'},
            {'rule': 'R2-unit-single-year', 'description': 'the unit label carries exactly one year; it dates the central. The strongest signal in the file: the unit is written to describe the central, the statement is written to explain it.'},
            {'rule': 'R3-unit-span-*', 'description': 'the unit carries two or more years; about_span = [min, max]. about_year is the compiler as_of when it is one of the endpoints, else the terminal year.'},
            {'rule': 'R4-method-single-year', 'description': 'no year in statement or unit, one in the method note; the method dates the derivation.'},
            {'rule': 'R5-statement-single-year', 'description': 'exactly one year token in the statement, decade tokens ("1970s") excluded.'},
            {'rule': 'R6-nearest-to-central', 'description': 'several years; take the one adjacent to the token that renders the central value. Character distance decides; the margin is recorded and a margin under 8 characters drops confidence to medium.'},
            {'rule': 'R7-era-phrase', 'description': '"at the end of the era" / "the era\'s opening year" / "throughout the era" resolve against the era\'s declared window.'},
            {'rule': 'R8-first-year-in-statement', 'description': 'no central token located; these statements lead with the measured year, so the first year token is taken. Confidence low by construction.'},
            {'rule': 'R9-no-content-year', 'description': 'no year in statement, unit or method. as_of year carried provisionally. Dated as_of means a dated source exists and should be read; a bare as_of means an era-typical fact with no single year.'},
        ],
        'summary': {
            'claims_audited': len(rows),
            'by_classification': dict(by_class),
            'by_as_of_kind': dict(by_kind),
            'by_as_of_action': dict(by_action),
            'claims_needing_about_year_different_from_as_of': len(moved),
            'claims_not_timeline_ready': sum(1 for r in rows if not r['proposed']['timeline_ready']),
            'claims_with_about_span': sum(1 for r in rows if r['proposed']['about_span']),
            'largest_misplacements': [
                {'id': r['id'], 'as_of': r['as_of_current'], 'about_year': r['proposed']['about_year'],
                 'years_off': r['displacement_years']} for r in worst],
            'field_a_chart_must_read': 'proposed.about_year (with proposed.about_span for the band, and proposed.timeline_ready as the permission to draw at all)',
        },
        'concordance': concordance(rows),
        'cross_checks': cross_checks(rows, claims_raw),
        'open_items': [
            {'item': 'as_of provenance re-stamp', 'claims': by_action['keep-flagged'] + by_action['read-source'],
             'blocking': False,
             'note': 'Claims whose as_of is a legacy fact-year or unexplained. Harmless once as_of is off every axis; needs one source read each to become a true publication date.'},
            {'item': 'about_year source reads', 'claims': sum(1 for r in rows if not r['proposed']['timeline_ready']),
             'blocking': True,
             'note': 'These carry no year anywhere in their own content. They must not be plotted until read. This is the list the claim-verifier takes.'},
            {'item': 'verifier repoint', 'claims': None, 'blocking': True,
             'note': 'tools/verify_p2.py check r2-rdy-01 parses claim as_of as a fact year and reconciles it against adspend totals. It must read about_year instead, and a new check must assert that every claim with timeline_ready true has exactly one integer about_year.'},
            {'item': 'unit-label year for e7-measurement-003', 'claims': 1, 'blocking': False,
             'note': 'The unit says 2026 for a bot-traffic share whose source measures 2024. Found by this audit, outside its remit to fix.'},
        ],
        'verification': verification(rows),
        'claims': rows,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w') as f:
        json.dump(doc, f, indent=2)
    print('wrote', OUT, len(rows), 'claims')
    print('by class', by_class)
    print('by kind', by_kind)
    print('moved', len(moved), 'not ready', sum(1 for r in rows if not r['proposed']['timeline_ready']))
    for cc in doc['cross_checks']:
        print(cc['id'], 'flag=', cc['flag'], '|', cc['our_figure'])
    print('worst:', [(r['id'], r['displacement_years']) for r in worst[:6]])


if __name__ == '__main__':
    main()
