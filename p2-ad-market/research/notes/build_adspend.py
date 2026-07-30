#!/usr/bin/env python3
"""Assemble p2-ad-market/data/adspend.json from the source cache.

Every number here traces to a file in this scratchpad or to a named,
dated publication. No value is invented; constructed values are computed
from stored steps and graded C.
"""
import csv, json, os
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = "/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/p2-ad-market/data/adspend.json"
UNIT = "USD millions (current)"
FREEZE = "2026-06-30"

# ---------------------------------------------------------------- sources
SRC = {
    "coen_cs": {"name": "Coen Structured Advertising Expenditure Dataset (CS Ad Dataset v1.14), Douglas Galbi, from Robert J. Coen / McCann-Erickson",
                "url": "https://www.galbithink.org/ad-spending.htm"},
    "galbi_pm": {"name": "Douglas Galbi, 'U.S. advertising expenditure data', Purple Motes (14 Sep 2008)",
                 "url": "https://www.purplemotes.net/2008/09/14/us-advertising-expenditure-data/"},
    "galbi_coen": {"name": "Douglas Galbi, 'Robert J. Coen, advertising data hero', Purple Motes (10 May 2009)",
                   "url": "https://www.purplemotes.net/2009/05/10/robert-j-coen-advertising-data-hero/"},
    "silk_berndt": {"name": "Silk & Berndt, 'Aggregate Advertising Expenditure in the U.S. Economy: What's Up? Is It Real?', NBER Working Paper 28161 (Dec 2020)",
                    "url": "https://www.nber.org/system/files/working_papers/w28161/w28161.pdf"},
    "hsus_t444": {"name": "Historical Statistics of the United States, Colonial Times to 1970, series T 444 (Printers' Ink lineage, compiled by R. J. Coen)",
                  "url": "https://www2.census.gov/library/publications/1975/compendia/hist_stats_colonial-1970/hist_stats_colonial-1970p2-chT.pdf"},
    "coen_1999": {"name": "Robert J. Coen, 'Spending Spree', Advertising Age special issue 'The Advertising Century' (1999), p. 126, tabulated in the CS Ad Dataset sheet 'estimates 1900-34'",
                  "url": "https://www.galbithink.org/ad-spending.htm"},
    "iab_2025": {"name": "IAB / PwC Internet Advertising Revenue Report, Full-Year 2025 results (April 2026), 'Historical data findings'",
                 "url": "https://www.iab.com/insights/internet-advertising-revenue-report/"},
    "iab_2000": {"name": "IAB / PwC Internet Advertising Revenue Report, Full-Year 2000 results",
                 "url": "https://www.iab.com/wp-content/uploads/2015/07/IAB_PWC_002_2000.pdf"},
    "iab_2008": {"name": "IAB / PwC Internet Advertising Revenue Report, Full-Year 2008 results",
                 "url": "https://www.iab.com/insights/internet-advertising-revenue-report/"},
    "iab_30th": {"name": "IAB, 'Digital ad revenue climbs to nearly $300B as IAB celebrates 30-year anniversary' (2026)",
                 "url": "https://www.iab.com/news/digital-ad-revenue-climbs-to-nearly-300b-as-iab-celebrates-30-year-anniversary/"},
    "naa": {"name": "Newspaper Association of America, 'Annual Newspaper Ad Expenditures' (Research Dept., 3/11), via Internet Archive",
            "url": "https://web.archive.org/web/20110511154429/http://www.naa.org/docs/Research/Annual-Newspaper-Ad-Expenditures.htm"},
    "borden": {"name": "U.S. Census of Manufactures advertising receipts, as tabulated in Neil H. Borden, 'The Economic Effects of Advertising' (1942), Table 1, p. 48; reproduced in the CS Ad Dataset sheet 'estimates 1900-34'",
               "url": "https://www.galbithink.org/ad-spending.htm"},
    "census_1919": {"name": "U.S. Census of Manufactures 1919, Printing and Publishing bulletin, Table 12 (advertising receipts, newspapers and periodicals, 1919/1914/1909)",
                    "url": "https://www2.census.gov/library/publications/decennial/1920/bulletins/manufacturing/manufactures-printing-and-publishing.pdf"},
    "irs_2012": {"name": "IRS Statistics of Income, Corporation Income Tax Returns 2012, Table 2.1 (Advertising deduction, returns of active corporations)",
                 "url": "https://www.irs.gov/pub/irs-soi/12coccr.pdf"},
    "irs_soi_ccr": {"name": "IRS Statistics of Income, Corporation Income Tax Returns Complete Report, Table 2.1 line 'Advertising' (returns of active corporations)",
                    "url": "https://www.irs.gov/statistics/soi-tax-stats-corporation-complete-report"},
    "magna_jun2025": {"name": "MAGNA advertising forecast, June 2025 update, reported by Marketing Dive (17 Jun 2025)",
                      "url": "https://www.marketingdive.com/news/magna-latest-to-downgrade-global-ad-spending-forecast-expects-979b/750871/"},
    "magna_2024": {"name": "MAGNA / IPG Mediabrands, 'MAGNA Raises U.S. and Global Ad Forecasts for 2024'",
                   "url": "https://www.ipgmediabrands.com/magna-raises-u-s-and-global-ad-forecasts-for-2024-but-tv-still-expected-to-decline/"},
    "magna_2023": {"name": "MAGNA winter 2023 update, reported by Inside Radio, 'Magna: Global Ad Revenues Grow 5.5% In 2023, U.S. Up 3.6%' (Dec 2023)",
                   "url": "https://www.insideradio.com/free/magna-global-ad-revenues-grow-5-5-in-2023-u-s-up-3-6/article_4bd87556-927e-11ee-9ca0-b79e073021c2.html"},
    "magna_2021": {"name": "MAGNA, 'U.S. ad spending to surpass $300 billion by 2022' (Dec 2021)",
                   "url": "https://magnaglobal.com/magna-u-s-ad-spending-to-surpass-300-billion-by-2022/"},
    "magna_2022": {"name": "MAGNA Advertising Forecasts (U.S. Fall Update, Sep 2022) and the Dec-2023 U.S. update chain",
                   "url": "https://magnaglobal.com/magna-advertising-forecasts-september-2022/"},
    "emarketer_2025": {"name": "eMarketer, 'US Ad Spending 2025'", "url": "https://www.emarketer.com/content/us-ad-spending-2025"},
    "groupm_2007": {"name": "GroupM 'This Year, Next Year' worldwide media and marketing forecast, Dec 2007 (US measured-media 2007 = $162.6bn)",
                    "url": "https://www.wpp.com/news/2007/12/groupm-forecasts-2008-global-ad-growth"},
    "oaaa": {"name": "Outdoor Advertising Association of America historical OOH revenue",
             "url": "https://oaaa.org/resource/out-of-home-advertising-revenue/"},
}
def s(*keys): return [SRC[k] for k in keys]

AS_OF_COEN = "2009-12-01"     # CS Ad Dataset workbook v1.14, last saved 2009-12-01
AS_OF_IAB = "2026-04-01"      # IAB/PwC FY2025 report, April 2026
AS_OF_IRS = "2026-06-30"      # retrieval/verification date from irs.gov (see notes)
AS_OF_NAA = "2011-03-01"      # NAA Research Dept., 3/11
AS_OF_HSUS = "1975"           # HSUS Colonial Times to 1970, published 1975
AS_OF_COEN99 = "1999"
AS_OF_BORDEN = "1942"
AS_OF_SB = "2020-12-01"

def cal(central, lo, hi, grade, sources, as_of, method=None, note=None):
    c = {"central": round(central, 3), "ci80": [round(lo, 3), round(hi, 3)],
         "grade": grade, "sources": sources, "as_of": as_of}
    if method: c["method"] = method
    if note: c["note"] = note
    return c

def pt(year, medium, value, series, calib, money_type=None, bridged=False, extra=None):
    p = {"year": year, "medium": medium, "money_type": money_type,
         "value": round(value, 3), "unit": UNIT, "source_series": series,
         "calibration": calib, "bridged": bridged}
    if extra: p.update(extra)
    return p

# ---------------------------------------------------------------- coen
MEDIUM = {
    "Grand Total": "total", "Newspapers": "newspapers", "Magazines": "magazines",
    "Radio": "radio", "Television": "television", "Broadcast TV": "broadcast_tv",
    "Cable": "cable_tv", "Direct Mail": "direct_mail", "Yellow Pages": "yellow_pages",
    "Billboards": "billboards", "Out of Home": "out_of_home", "Internet": "internet",
    "Business Papers": "business_papers", "Farm Publications": "farm_publications",
    "Miscellaneous": "miscellaneous", "Other": "other",
    "Other Periodicals": "other_periodicals",
}
rows = []
with open(os.path.join(HERE, "coen_tidy.csv")) as f:
    for r in csv.DictReader(f):
        rows.append({"year": int(r["year"]), "cat1": r["cat1"], "cat2": r["cat2"],
                     "scheme": float(r["scheme"]), "exp": float(r["exp"])})

by = defaultdict(dict)                       # year -> (cat1,cat2) -> value
scheme_of = {}
for r in rows:
    by[r["year"]][(r["cat1"], r["cat2"])] = r["exp"]
    scheme_of[(r["year"], r["cat1"], r["cat2"])] = r["scheme"]

IAB_ANNUAL = {  # IAB/PwC FY2025 report historical table (restated vintage), $m
    1996: 267, 1997: 907, 1998: 1920, 1999: 4621, 2000: 8087, 2001: 7134, 2002: 6010,
    2003: 7267, 2004: 9626, 2005: 12542, 2006: 16879, 2007: 21206, 2008: 23448,
    2009: 22661, 2010: 26041, 2011: 31736, 2012: 36572, 2013: 42781, 2014: 49451,
    2015: 59551, 2016: 72640, 2017: 88266, 2018: 107487, 2019: 124613, 2020: 139828,
    2021: 189310, 2022: 209728, 2023: 224954, 2024: 258571, 2025: 294593,
}

def coen_ci(year, medium, v):
    """CI policy for Coen points -- see dataset-notes.md 'calibration policy'."""
    if medium == "internet":                      # acknowledged undercount vs IAB
        hi = IAB_ANNUAL.get(year, v * 1.6) * 1.05
        return v * 0.95, max(hi, v * 1.05), "B"
    if year <= 1934:
        return v * 0.85, v * 1.20, ("B" if medium == "total" else "C")
    if medium == "total":
        f = 0.04 if year <= 1945 else 0.02
        return v * (1 - f), v * (1 + f), "B"
    return v * 0.95, v * 1.05, "B"

coen_points = []
for year in sorted(by):
    for (c1, c2), v in sorted(by[year].items()):
        if c1 != c2 or c1 in ("Total Local", "Total National"):
            continue          # sub-categories and the national/local roll-ups handled below
        med = MEDIUM[c1]
        if by[year].get(("Billboards", "Billboards")) and med == "billboards" and year == 1999:
            pass                                  # 1999 billboards is scheme 5 (alternate), keep flagged
        lo, hi, g = coen_ci(year, med, v)
        note = None
        if med == "internet":
            note = ("Coen's internet line is a known undercount from 2004; the CS Ad Dataset keeps it "
                    "for aggregation consistency. IAB/PwC for the same year: $%sm." % IAB_ANNUAL.get(year, "n/a"))
        if year == 1999 and med == "billboards":
            note = ("1999 billboards is an ALTERNATE category (scheme 5) sitting inside the 1999 "
                    "out-of-home figure, not an additional partition member.")
        src = s("coen_cs", "galbi_pm")
        sch = scheme_of[(year, c1, c2)]
        cb = cal(v, lo, hi, g, src, AS_OF_COEN,
                 method=("Galbi reconstruction from Coen totals, Census of Manufactures receipts and other "
                         "sources; 1919-1934 media splits are explicitly part estimate" if year <= 1934 and med != "total" else None),
                 note=note)
        extra = None if med == "total" else {"partition_member": sch in (1.0, 1.5)}
        coen_points.append(pt(year, med, v, "coen_mce", cb, extra=extra))

# national / local money-type splits published by Coen
for year in sorted(by):
    tn = by[year].get(("Total National", "Total National"))
    tl = by[year].get(("Total Local", "Total Local"))
    if tn is not None:
        coen_points.append(pt(year, "total", tn, "coen_mce",
                              cal(tn, tn * 0.97, tn * 1.03, "B", s("coen_cs"), AS_OF_COEN),
                              money_type="national_brand"))
    if tl is not None:
        coen_points.append(pt(year, "total", tl, "coen_mce",
                              cal(tl, tl * 0.97, tl * 1.03, "B", s("coen_cs"), AS_OF_COEN),
                              money_type="local_retail"))
    for c1, med in (("Newspapers", "newspapers"), ("Yellow Pages", "yellow_pages")):
        for c2, mt in (("National", "national_brand"), ("Local", "local_retail")):
            v = by[year].get((c1, c2))
            if v is not None:
                coen_points.append(pt(year, med, v, "coen_mce",
                                      cal(v, v * 0.95, v * 1.05, "B", s("coen_cs"), AS_OF_COEN),
                                      money_type=mt))

# derived broadcast/cable split for 1980-1989 (Television was one published category)
derived_tv = []
for year in range(1980, 1990):
    d = by[year]
    bcast = sum(d.get(("Broadcast TV", k), 0) for k in ("Network", "Spot (local)", "Spot (nat'l)", "Syndication"))
    cable = sum(d.get(("Cable", k), 0) for k in ("Cable Networks", "Spot (local)"))
    tv = d.get(("Television", "Television"))
    assert abs(bcast + cable - tv) < 1.5, (year, bcast, cable, tv)
    m = ("sum of Coen's own scheme-2 sub-categories; identity check: broadcast + cable = published Television line "
         "(%d: %g + %g = %g)" % (year, bcast, cable, tv))
    for med, v in (("broadcast_tv", bcast), ("cable_tv", cable)):
        coen_points.append(pt(year, med, v, "coen_mce",
                              cal(v, v * 0.95, v * 1.05, "C", s("coen_cs"), AS_OF_COEN, method=m,
                                  note="Constructed: the published Coen partition carries one 'Television' line until 1990."),
                              extra={"derived_from_subcategories": True}))
        derived_tv.append((year, med, v))

# ---------------------------------------------------------------- iab
iab_points = []
for y, v in sorted(IAB_ANNUAL.items()):
    src = s("iab_2025") if y >= 2003 else s("iab_2000", "iab_2008")
    note = None
    if y in (2011, 2013, 2014, 2015, 2016):
        note = "Restated: earlier IAB vintages published a slightly different figure for this year (see concordance iab-vintage)."
    iab_points.append(pt(y, "internet", v, "iab_pwc",
                         cal(v, v * 0.985, v * 1.015, "B", src, AS_OF_IAB, note=note)))
IAB_FORMAT_2025 = {"search": 114200, "display": 81600, "digital_video": 78000,
                   "digital_audio": 8400, "other_incl_classified_and_lead_gen": 12500}
for k, v in IAB_FORMAT_2025.items():
    iab_points.append(pt(2025, "internet_" + k, v, "iab_pwc",
                         cal(v, v * 0.98, v * 1.02, "B", s("iab_2025"), AS_OF_IAB,
                             note="IAB 2025 format split; the five formats sum to $294.7bn against the $294.593bn total (rounding).")))

# ---------------------------------------------------------------- irs (cross-check only)
IRS = {2005: 253187.675, 2006: 277006.387, 2007: 277412.910, 2008: 266795.558,
       2009: 241468.941, 2010: 255673.826, 2011: 263563.643, 2012: 274503.596,
       2013: 284505.883, 2014: 295420.565, 2015: 316096.024, 2016: 325377.839,
       2017: 336233.483, 2018: 353702.224, 2019: 379273.097, 2020: 335739.467,
       2021: 417746.462, 2022: 473153.216}
irs_points = [pt(y, "total_corporate_ad_deductions", v, "irs_soi",
                 cal(v, v * 0.99, v * 1.01, "A",
                     s("irs_2012") if y == 2012 else s("irs_soi_ccr"), AS_OF_IRS,
                     note="Tax-year basis (accounting periods ending July of the year through June of the next); "
                          "active corporations only; the line includes trade and consumer promotion."))
              for y, v in sorted(IRS.items())]
irs_points.append(pt(1960, "total_corporate_ad_deductions", 9291, "irs_soi",
                     cal(9291, 9100, 9500, "B", s("silk_berndt"), AS_OF_SB,
                         note="Read from Silk & Berndt Appendix Table 2a as the range minimum of the IRS series over "
                              "1960-2014; the SOI volume for tax year 1960 was not retrieved for this build.")))

# ---------------------------------------------------------------- magna
magna_points = [
    pt(1980, "total", 41021, "magna",
       cal(41021, 40600, 41440, "B", s("silk_berndt"), AS_OF_SB,
           note="MG8 range minimum over 1980-2018 (Appendix Table 2a). 1980 is MG8's first year, so the "
                "minimum is the 1980 value. Eight media incl. direct mail; media-supplier revenue basis.")),
    pt(2018, "total", 232906, "magna",
       cal(232906, 230600, 235200, "B", s("silk_berndt"), AS_OF_SB,
           note="MG8 range maximum over 1980-2018 (Appendix Table 2a), i.e. the terminal 2018 value.")),
    pt(2021, "total", 278000, "magna",
       cal(278000, 270000, 286000, "B", s("magna_2021"), "2021-12-06",
           note="US media-owner ad revenue, MAGNA December 2021 update (+23% on 2020).")),
    pt(2022, "total", 325000, "magna",
       cal(325000, 315000, 335000, "B", s("magna_2022", "magna_2023"), "2023-12-04",
           note="Vintage conflict: MAGNA's 2022 US figure is reported as $323bn in one release chain and is "
                "implied at ~$326bn by the Dec-2023 chain ($338bn 2023 at +3.6%). CI spans both.")),
    pt(2023, "total", 338000, "magna",
       cal(338000, 332000, 344000, "B", s("magna_2023"), "2023-12-04",
           note="US media-owner ad revenue +3.6% in 2023 (MAGNA winter update).")),
    pt(2024, "total", 380000, "magna",
       cal(380000, 374000, 386000, "B", s("magna_2024", "magna_jun2025"), "2025-06-17",
           note="US ad revenue 2024, +12.4% incl. cyclical (+9.9% ex-cyclical); implied by the 2025 base "
                "($398bn at +4.6%) = $380.5bn.")),
    pt(2025, "total", 398000, "magna",
       cal(398000, 388000, 408000, "B", s("magna_jun2025"), "2025-06-17",
           note="MAGNA June 2025 update, an in-year ESTIMATE for full-year 2025, not a closed actual. "
                "eMarketer's broader definition gives ~$422bn for the same year.")),
    pt(2025, "internet", 294000, "magna",
       cal(294000, 288000, 300000, "B", s("magna_jun2025"), "2025-06-17",
           note="'Digital pure players' (DPP) revenue. Within 0.2% of the IAB/PwC internet total for 2025 "
                "($294.593bn) -- see concordance magna-iab-digital.")),
    pt(2025, "traditional_media_owners", 104000, "magna",
       cal(104000, 100000, 108000, "B", s("magna_jun2025"), "2025-06-17",
           note="'Traditional media owner' (TMO) revenue, -7.1% in 2025. Direct mail is not visible as a "
                "line in the modern MAGNA public split; see concordance magna-basis-change.")),
]

# ---------------------------------------------------------------- pre-1919 benchmarks
T444 = {1867: 50, 1880: 200, 1890: 360, 1900: 542, 1904: 821, 1909: 1142,
        1914: 1302, 1915: 1302, 1916: 1468, 1917: 1627, 1918: 1468}
COEN99 = {1900: 450, 1904: 750, 1909: 1000, 1914: 1100, 1917: 1380, 1918: 1240}
BENCH = [(1867, 50, 30, 80, "B"), (1880, 200, 140, 280, "B"), (1890, 360, 260, 480, "B"),
         (1900, 495, 400, 600, "B"), (1904, 785, 700, 900, "C"), (1909, 1070, 880, 1270, "B"),
         (1914, 1200, 990, 1450, "B"), (1917, 1500, 1250, 1800, "B"), (1918, 1355, 1150, 1600, "C")]
bench_points = []
for y, c, lo, hi, g in BENCH:
    both = y in COEN99
    m = ("midpoint of the two surviving vintages for this benchmark year: Printers' Ink / HSUS T 444 = $%gm "
         "and Coen 1999 = $%gm" % (T444[y], COEN99[y])) if both else None
    note = ("Single vintage (Printers' Ink retrospective carried in HSUS T 444). No independent confirmation exists."
            if not both else None)
    bench_points.append(pt(y, "total", c, "benchmarks_pre1919",
                           cal(c, lo, hi, g, s("hsus_t444", "coen_1999") if both else s("hsus_t444"),
                               AS_OF_HSUS if not both else AS_OF_COEN99, method=m, note=note)))

# ---------------------------------------------------------------- census of manufactures (cross-check only)
CENSUS = json.load(open(os.path.join(HERE, "census_mfg.json")))
census_points = []
for ys, (npv, opv) in sorted(CENSUS.items(), key=lambda kv: int(kv[0])):
    y = int(ys)
    src = s("census_1919", "borden") if y in (1909, 1914, 1919) else s("borden")
    for med, v in (("newspapers", npv), ("other_periodicals", opv)):
        census_points.append(pt(y, "census_" + med, v, "census_manufactures",
                                cal(v, v * 0.99, v * 1.01, "A", src, AS_OF_BORDEN,
                                    note="Publisher advertising RECEIPTS enumerated by the Census of Manufactures, "
                                         "not advertiser outlay: excludes agency commission and production.")))

# ---------------------------------------------------------------- naa newspapers
naa_raw = json.load(open(os.path.join(HERE, "naa_raw.json")))
def money(x): return float(x.replace("$", "").replace(",", ""))
naa_points = []
naa_residuals = {}
for ys, vals in sorted(naa_raw.items(), key=lambda kv: int(kv[0])):
    y = int(ys)
    nums = [money(v) for v in vals if v.startswith("$")]
    if len(nums) < 4:
        continue
    national, retail, classified, print_total = nums[0], nums[1], nums[2], nums[3]
    online = nums[4] if len(nums) >= 5 else None
    resid = national + retail + classified - print_total
    inconsistent = abs(resid) > 0.5
    if inconsistent:
        naa_residuals[y] = resid
    bad_note = ("As published, this year's national + retail + classified does not sum to the printed print total "
                "(residual %+0.0fm, %+0.2f%%). The published values are kept unaltered; the residual is recorded "
                "rather than smoothed." % (resid, 100 * resid / print_total)) if inconsistent else None
    for v, mt in ((national, "national_brand"), (retail, "local_retail"), (classified, "classified")):
        naa_points.append(pt(y, "newspapers", v, "naa_newspaper",
                             cal(v, v * 0.98, v * 1.02, "B", s("naa"), AS_OF_NAA, note=bad_note),
                             money_type=mt,
                             extra={"source_internal_inconsistency": round(resid, 1)} if inconsistent else None))
    naa_points.append(pt(y, "newspapers", print_total, "naa_newspaper",
                         cal(print_total, print_total * 0.98, print_total * 1.02, "B", s("naa"), AS_OF_NAA,
                             note=bad_note or "Print only. Identity check: national + retail + classified = print total."),
                         extra={"source_internal_inconsistency": round(resid, 1)} if inconsistent else None))
    if online is not None:
        naa_points.append(pt(y, "newspapers_online", online, "naa_newspaper",
                             cal(online, online * 0.98, online * 1.02, "B", s("naa"), AS_OF_NAA,
                                 note="Newspaper-owned internet revenue; also inside the IAB internet total.")))

# ---------------------------------------------------------------- the bridge
def coen_restricted(year):
    d = by[year]
    total = d[("Grand Total", "Grand Total")]
    misc = d.get(("Miscellaneous", "Miscellaneous"), 0.0)
    bpap = d.get(("Business Papers", "Business Papers"), 0.0)
    farm = d.get(("Farm Publications", "Farm Publications"), 0.0)
    net = d.get(("Internet", "Internet"), 0.0)
    iab = IAB_ANNUAL.get(year, 0.0)
    return total, misc, bpap, farm, net, iab, total - misc - bpap - farm - net + iab

W = 41021 / (53570 - 7559 - 1674 - 130)          # 1980 like-for-like wedge
bridge_points = []
for year in range(1980, 2008):
    total, misc, bpap, farm, net, iab, restricted = coen_restricted(year)
    est = restricted * W
    m = ("MG8-basis estimate = (Coen total - miscellaneous - business papers - farm publications "
         "- Coen internet + IAB internet) x %0.5f, where the factor is the like-for-like MG8/MCE ratio "
         "measured in 1980, the one year both series publish. %d: (%g - %g - %g - %g - %g + %g) x %0.5f = %0.1f"
         % (W, year, total, misc, bpap, farm, net, iab, W, est))
    bridge_points.append(pt(year, "total", est, "bridge_mce_mg8",
                            cal(est, restricted * 0.85, restricted * 0.98, "C", s("silk_berndt", "coen_cs", "iab_2025"),
                                AS_OF_SB, method=m,
                                note="Constructed, not observed. MAGNA publishes no MG8 value for this year in any free source."),
                            bridged=True))

# ---------------------------------------------------------------- series
def cov(points): return [min(p["year"] for p in points), max(p["year"] for p in points)]

series = {
    "coen_mce": {
        "role": "stitch", "coverage": [1919, 2007],
        "compiler": "Robert J. Coen, McCann-Erickson (later Universal McCann / Interpublic); digitised by Douglas Galbi as the CS Ad Dataset",
        "measures": "advertiser BILLINGS, bottom-up, valued at list (rate-card) prices, eleven media incl. direct mail, business papers and a large 'miscellaneous' bucket",
        "access": "free (galbithink.org xls); the underlying Coen releases were trade publications",
        "known_breaks": ["by-medium partition begins 1935", "Television splits into broadcast + cable in 1990",
                          "Billboards replaced by Out of Home in 2000", "Yellow Pages appears 1980",
                          "Farm Publications and magazine sub-categories end 1989",
                          "pre-1940 totals revised down ~15% between the HSUS/T444 and Coen-2000 vintages",
                          "series ends with full-year 2007; IPG discontinued it in 2009"],
        "points": coen_points},
    "magna": {
        "role": "stitch", "coverage": [1980, 2025],
        "compiler": "MAGNA Global (IPG Mediabrands)",
        "measures": "media-supplier (media-owner) advertising REVENUE, top-down; MG8 = eight media incl. direct mail on the 2015 methodology; the modern public split is digital-pure-player + traditional-media-owner",
        "access": "LICENSED. The annual series and the methodology document are not public. Every point here comes from a press release or from Silk & Berndt's published summary statistics; 1981-2017 and 2019-2020 are unsourceable without a licence.",
        "known_breaks": ["backcast only to 1980", "basis change between the MG8 eight-media definition and the modern DPP/TMO public split",
                          "in-year forecast revisions (the 2025 figure was revised down 1.2pp between the Dec-2024 and Jun-2025 updates)"],
        "points": magna_points},
    "iab_pwc": {
        "role": "stitch", "coverage": [1996, 2025],
        "compiler": "Interactive Advertising Bureau, survey conducted by PwC",
        "measures": "US internet/online/mobile advertising REVENUE reported by sellers, plus conservative estimates for non-participants",
        "access": "free PDFs",
        "known_breaks": ["annual figures are restated across vintages (2015, 2016 and 2014 each move by 0.1-0.2%)",
                          "format taxonomy changes; 'other' now carries classified, directories and lead generation"],
        "points": iab_points},
    "irs_soi": {
        "role": "cross-check-only", "coverage": [1960, 2022],
        "compiler": "IRS Statistics of Income division",
        "measures": "the 'Advertising' deduction claimed on federal corporate income tax returns, estimated from a stratified sample of returns of active corporations",
        "access": "free (irs.gov)",
        "known_breaks": ["tax year != calendar year", "unincorporated firms excluded",
                          "the deduction includes consumer and trade promotion, which drifts upward relative to media spend",
                          "1961-2004 and 2023+ not retrieved for this build"],
        "as_of_convention": "as_of on these points is the retrieval/verification date from irs.gov (2026-06-30), not the SOI volume's publication date, which runs 2-3 years after each tax year.",
        "points": irs_points},
    "benchmarks_pre1919": {
        "role": "stitch", "coverage": [1867, 1918],
        "compiler": "Printers' Ink retrospective estimates carried into Historical Statistics (series T 444), and Robert Coen's 1999 revision of the same years",
        "measures": "total US advertising volume, retrospectively estimated decades after the fact",
        "access": "free",
        "known_breaks": ["nothing exists before 1867", "benchmark years only, never annual",
                          "the two vintages disagree by 17-20% for 1900-1918"],
        "points": bench_points},
    "naa_newspaper": {
        "role": "stitch", "coverage": [1950, 2010],
        "added_beyond_schema_spec": True,
        "why_added": "the schema's classified money-type axis is not derivable from any of the five named series; NAA is the only compiler that published the national / retail / classified split.",
        "compiler": "Newspaper Association of America research department",
        "measures": "newspaper advertising revenue reported by publishers, split national / retail / classified, print and (from 2003) online",
        "access": "free via the Internet Archive; NAA stopped publishing industry revenue after 2013 and the association no longer exists",
        "known_breaks": ["online newspaper revenue enters in 2003", "series ends 2010 in this table; NAA's last industry figure is 2013"],
        "points": naa_points},
    "census_manufactures": {
        "role": "cross-check-only", "coverage": [1909, 1937],
        "added_beyond_schema_spec": True,
        "why_added": "the only official, enumerated (non-estimated) advertising aggregate that exists before 1960, and therefore the only independent check available for the first third of the window.",
        "compiler": "US Census of Manufactures, tabulated by Neil Borden (1942)",
        "measures": "advertising RECEIPTS of newspaper and periodical publishers, enumerated biennially",
        "access": "free",
        "known_breaks": ["print media only", "receipts, not advertiser outlay: the wedge to Coen's newspaper line is about 1.52x"],
        "points": census_points},
    "bridge_mce_mg8": {
        "role": "derived-bridge", "coverage": [1980, 2007],
        "added_beyond_schema_spec": True,
        "why_added": "keeps constructed values out of the named compilers' series. Every point is bridged:true and graded C.",
        "compiler": "this dataset (constructed)",
        "measures": "an estimate of what MAGNA's MG8 media-supplier-revenue series would show for the Coen years",
        "access": "n/a",
        "points": bridge_points},
}

# ---------------------------------------------------------------- concordance
c1980 = by[1980]
mg8_1980, mce_1980 = 41021.0, c1980[("Grand Total", "Grand Total")]
restricted_1980 = mce_1980 - c1980[("Miscellaneous", "Miscellaneous")] - c1980[("Business Papers", "Business Papers")] - c1980[("Farm Publications", "Farm Publications")]

concordance = [
    {"id": "coen-magna-basis", "series_a": "coen_mce", "series_b": "magna", "years": [1980, 2007],
     "note": "Different objects under the same headline. Coen measures advertiser billings bottom-up at list "
             "(rate-card) prices across eleven media including business papers and a ~20%-of-total 'miscellaneous' "
             "bucket. MAGNA's MG8 measures media-supplier revenue top-down across eight media with no miscellaneous "
             "and no business papers. 1980 is the only year both compilers publish: MCE $53,570m vs MG8 $41,021m. "
             "Restricting Coen to the eight MG8 media ($44,207m) leaves a residual price-basis wedge of 7.2%, so "
             "roughly two thirds of the raw 23.4% level break is category scope, not price basis.",
     "magnitude": {"raw_level_break_pct_1980": round(100 * (mg8_1980 / mce_1980 - 1), 2),
                   "like_for_like_wedge_pct_1980": round(100 * (mg8_1980 / restricted_1980 - 1), 2),
                   "scope_share_of_break_pct": round(100 * (1 - (mg8_1980 / restricted_1980 - 1) / (mg8_1980 / mce_1980 - 1)), 1)}},
    {"id": "coen-iab-internet", "series_a": "coen_mce", "series_b": "iab_pwc", "years": [1997, 2007],
     "note": "Both carry a line called 'internet'. Coen's is an advertiser-billings estimate that the dataset's own "
             "curator calls a serious underestimate from 2004; IAB/PwC's is a seller-reported revenue survey. The gap "
             "widens every year of the overlap. Any chart that stacks Coen's media partition must keep Coen's internet "
             "line, or the partition stops summing to Coen's total.",
     "magnitude": {"coen_over_iab_1997": round(600 / 907, 3), "coen_over_iab_2000": round(6507 / 8087, 3),
                   "coen_over_iab_2007": round(10529 / 21206, 3),
                   "dollar_gap_2007_musd": 21206 - 10529}},
    {"id": "coen-ooh-2000", "series_a": "coen_mce", "series_b": "coen_mce", "years": [1999, 2000],
     "note": "Category rename with a scope change. 'Billboards' is a partition member 1935-1999; 'Out of Home' "
             "replaces it from 1999 (published for both bases in 1999) and carries transit, street furniture, "
             "place-based and other formats. Reading the two as one series manufactures a 177% jump in 2000.",
     "magnitude": {"ooh_1999_musd": 4780, "billboards_1999_musd": 1725, "ratio": round(4780 / 1725, 3)}},
    {"id": "coen-tv-split-1990", "series_a": "coen_mce", "series_b": "coen_mce", "years": [1989, 1990],
     "note": "One published 'Television' line becomes two published lines, 'Broadcast TV' and 'Cable', in 1990. "
             "Coen's own scheme-2 sub-categories let the split be pushed back to 1980 exactly (they sum to the "
             "Television line); before 1980 no cable line exists at all. This dataset carries the 1980-1989 "
             "broadcast/cable pair as constructed grade-C points.",
     "magnitude": {"television_1989_musd": 27459, "constructed_broadcast_1989_musd": 25364,
                   "constructed_cable_1989_musd": 2095, "cable_share_1989_pct": round(100 * 2095 / 27459, 2),
                   "identity_residual_musd": 0}},
    {"id": "coen-vintage-revision", "series_a": "coen_mce", "series_b": "coen_mce", "years": [1919, 2003],
     "note": "The same year has different values in different vintages of the same series. Against the "
             "Printers'-Ink-lineage figures printed in Historical Statistics (T 444), the Coen-2000 vintage revised "
             "the 1920s down by 15-18%; 1932-1945 moves by under 2%; and the 1999 total was revised UP 3.3% between "
             "the 2000 and 2003 vintages. The 1920s revision is large enough to change the ad/GDP story for that decade.",
     "magnitude": {"1919_pct": -15.43, "1923_pct": -18.23, "1929_pct": -16.81, "mean_1919_1929_pct": -16.4,
                   "1999_revision_2000_to_2003_pct": 3.29, "1998_revision_pct": 2.53}},
    {"id": "coen-medium-detail-1935", "series_a": "coen_mce", "series_b": "coen_mce", "years": [1919, 1935],
     "note": "By-medium detail does not exist before 1935. For 1919-1934 the published partition is three lines: "
             "newspapers, other periodicals, and 'other' -- and the CS Ad Dataset's finer categories for those years "
             "are part Coen, part other sources, part the curator's own estimates. Radio's own line begins in 1935, "
             "thirteen years after commercial radio advertising began.",
     "magnitude": {"other_share_of_1919_total_pct": round(100 * 1208 / 1930, 1),
                   "other_share_of_1934_total_pct": round(100 * 692.0 / 1650, 1),
                   "miscellaneous_share_of_1935_total_pct": round(100 * 342 / 1720, 1)}},
    {"id": "coen-category-lifecycle", "series_a": "coen_mce", "series_b": "coen_mce", "years": [1980, 1990],
     "note": "Partition members appear and disappear mid-series. Yellow Pages appears in 1980 at $2,900m with no "
             "restatement of earlier years (it was previously inside miscellaneous, which drops by a comparable "
             "amount in the same year). Farm Publications ($212m) and the magazine sub-categories are dropped after "
             "1989. A stacked chart must show these as entries and exits, not as growth and collapse.",
     "magnitude": {"yellow_pages_1980_musd": 2900, "miscellaneous_1979_musd": 9633, "miscellaneous_1980_musd": 7559,
                   "miscellaneous_step_musd": -2074, "farm_publications_1989_musd": 212}},
    {"id": "coen-naa-newspapers", "series_a": "coen_mce", "series_b": "naa_newspaper", "years": [1950, 2007],
     "note": "Coen's newspaper line IS the NAA publisher survey, unadjusted, for 1950-1989 (identical to the dollar in "
             "36 of 40 years). From 1990 Coen adjusts it: he runs up to 0.86% ABOVE NAA in the mid-to-late 1990s and "
             "about 0.2% below it in the 2000s. The two are therefore not independent -- NAA cannot validate Coen's newspaper line, it "
             "only supplies the national / retail / classified split Coen does not publish.",
     "magnitude": {"identical_years_1950_1989": 36, "max_coen_over_naa_pct": 0.86, "year_of_max": 1996,
                   "coen_over_naa_2000_pct": 0.78, "coen_over_naa_2007_pct": -0.18}},
    {"id": "coen-census-receipts", "series_a": "coen_mce", "series_b": "census_manufactures", "years": [1919, 1937],
     "note": "The Census enumerates what publishers RECEIVED; Coen estimates what advertisers SPENT. The wedge is "
             "agency commission, production and the difference between list and net. The CS Ad Dataset applies a "
             "1.5187 factor to Census newspaper receipts to build its pre-1935 newspaper estimates, so for those "
             "years the Coen newspaper line is a scaled Census figure rather than an independent measurement.",
     "magnitude": {"coen_over_census_newspapers_factor": 1.5187, "census_newspapers_1935_musd": 500.0,
                   "coen_newspapers_1935_musd": 761.0, "implied_factor_1935": round(761.0 / 500.0, 4)}},
    {"id": "coen-irs-levels", "series_a": "coen_mce", "series_b": "irs_soi", "years": [2005, 2007],
     "note": "Advertiser billings (Coen) against the advertising deduction on corporate tax returns (IRS). Silk & "
             "Berndt report r = 0.998 between them over 1960-2007. In the three overlap years available here Coen "
             "runs 0.8% to 7.1% above IRS. IRS is used only as a cross-check and is never stitched.",
     "magnitude": {"divergence_2005_pct": 7.06, "divergence_2006_pct": 1.68, "divergence_2007_pct": 0.79,
                   "silk_berndt_correlation_1960_2007": 0.998}},
    {"id": "magna-irs-divergence", "series_a": "magna", "series_b": "irs_soi", "years": [2018, 2022],
     "note": "After the Coen series ends the two rails diverge hard and in one direction: the IRS deduction keeps "
             "growing faster than media-owner revenue. In 2022 the IRS advertising deduction is $473bn against a "
             "MAGNA US media-owner revenue of about $325bn -- a 31% gap, well past the 15% tolerance. This is a "
             "measurement finding, not an error: the tax line absorbs promotion, agency and martech spend that never "
             "reaches a media owner.",
     "magnitude": {"gap_2018_pct": -34.2, "gap_2021_pct": -33.5, "gap_2022_pct": -31.3, "gap_2007_pct": 0.79}},
    {"id": "magna-basis-change", "series_a": "magna", "series_b": "magna", "years": [2018, 2025],
     "note": "MAGNA's own basis appears to change inside its own series. Silk & Berndt describe MG8 as eight media "
             "INCLUDING direct mail, with a 2018 US value of $232.9bn. MAGNA's public 2020s splits are digital pure "
             "players plus traditional media owners, with no direct-mail line visible. UNRESOLVED: the methodology "
             "document and the annual series are licensed and were not read for this build, so the size of the basis "
             "change cannot be measured, only bounded.",
     "magnitude": {"status": "unquantified", "mg8_2018_musd": 232906,
                   "us_direct_mail_scale_for_reference_musd": 60225,
                   "bound": "if direct mail left the basis, the modern MAGNA US total understates the MG8 basis by "
                            "roughly 10-15% of total"},
     "flag": "open-question"},
    {"id": "magna-iab-digital", "series_a": "magna", "series_b": "iab_pwc", "years": [2025, 2025],
     "note": "MAGNA's 2025 digital-pure-player revenue ($294bn) and the IAB/PwC internet total ($294.593bn) are the "
             "same number to within 0.2%. Treat MAGNA's digital line as the IAB series carried through, not as an "
             "independent estimate: adding them, or using one to check the other, double-counts.",
     "magnitude": {"magna_dpp_2025_musd": 294000, "iab_2025_musd": 294593, "difference_pct": round(100 * (294000 / 294593 - 1), 2)}},
    {"id": "iab-vintage", "series_a": "iab_pwc", "series_b": "iab_pwc", "years": [2011, 2016],
     "note": "IAB restates. This dataset uses one vintage throughout -- the FY2025 report's historical table -- so "
             "that year-on-year changes are not vintage artefacts. Earlier vintages print 2015 as $59.6bn and 2016 as "
             "$72.5bn; the FY2025 vintage prints $59.551bn and $72.640bn.",
     "magnitude": {"max_restatement_pct": 0.19, "years_affected": [2011, 2013, 2014, 2015, 2016]}},
    {"id": "benchmarks-vintage", "series_a": "benchmarks_pre1919", "series_b": "benchmarks_pre1919", "years": [1900, 1918],
     "note": "Two retrospective vintages of the pre-1919 record disagree systematically: the Printers' Ink figures in "
             "HSUS T 444 run 17-20% above Coen's 1999 revision of the same years. Points here take the midpoint with "
             "a CI spanning both. Before 1867 there is no estimate of any kind, so 1840-1866 is a hole, not a low number.",
     "magnitude": {"t444_over_coen99_1900_pct": round(100 * (542 / 450 - 1), 1),
                   "t444_over_coen99_1909_pct": round(100 * (1142 / 1000 - 1), 1),
                   "t444_over_coen99_1917_pct": round(100 * (1627 / 1380 - 1), 1),
                   "no_data_years": [1840, 1866]}},
    {"id": "bridge-vs-coen", "series_a": "bridge_mce_mg8", "series_b": "coen_mce", "years": [1980, 2007],
     "note": "The bridge ribbon is the Coen ribbon restated onto MAGNA's basis. It is derived FROM coen_mce and is not "
             "an independent measurement: never sum the two, never treat their agreement as corroboration.",
     "magnitude": {"bridge_over_coen_1980_pct": round(100 * (bridge_points[0]['value'] / 53570 - 1), 1),
                   "bridge_over_coen_2007_pct": round(100 * (bridge_points[-1]['value'] / 279612 - 1), 1)}},
    {"id": "bridge-vs-magna", "series_a": "bridge_mce_mg8", "series_b": "magna", "years": [1980, 1980],
     "note": "At 1980 the bridge reproduces MAGNA's published MG8 value by construction (the wedge is calibrated "
             "there), so 1980 is an identity, not a test. The bridge's only out-of-sample test is 2007, against "
             "GroupM's independently published US measured-media total.",
     "magnitude": {"bridge_1980_musd": round(bridge_points[0]['value'], 1), "magna_1980_musd": 41021,
                   "residual_musd": round(bridge_points[0]['value'] - 41021, 1)}},
    {"id": "naa-internal-sum", "series_a": "naa_newspaper", "series_b": "naa_newspaper", "years": [1956, 1957],
     "note": "The NAA table does not add up in two of its 61 years: national + retail + classified overshoots the "
             "printed print total by $14m in 1956 and falls $30m short in 1957, and the printed year-on-year "
             "percentages for those rows are inconsistent with the printed dollars. Four further years (1991, 1996, "
             "2005, 2006) differ by $1m from rounding. The published values are carried unaltered and the residual is "
             "recorded on the affected points; no year is silently repaired.",
     "magnitude": {"residual_1956_musd": 14.0, "residual_1957_musd": -30.0,
                   "residual_1956_pct": 0.43, "residual_1957_pct": -0.92,
                   "rounding_only_years": [1991, 1996, 2005, 2006],
                   "years_affected": 2, "years_checked": 61}},
    {"id": "naa-online-2003", "series_a": "naa_newspaper", "series_b": "iab_pwc", "years": [2003, 2010],
     "note": "NAA's newspaper online revenue is a subset of the IAB internet total, and from 2003 NAA reports print "
             "and online separately. Adding NAA's combined total to the IAB internet line double-counts newspaper "
             "digital revenue -- $3,166m of it in 2007.",
     "magnitude": {"newspaper_online_2007_musd": 3166, "share_of_iab_2007_pct": round(100 * 3166 / 21206, 1)}},
]

# ---------------------------------------------------------------- bridge object
t07, misc07, bp07, farm07, net07, iab07, restr07 = coen_restricted(2007)
est07 = restr07 * W
dm07 = by[2007][("Direct Mail", "Direct Mail")] * W
yp07 = by[2007][("Yellow Pages", "Yellow Pages")] * W
measured07 = est07 - dm07 - yp07

bridge = {
    "window": [1980, 2007],
    "overlap_observations": 1,
    "method": (
        "Category-scope reconciliation plus a single measured price-basis wedge. MAGNA publishes exactly one MG8 "
        "value inside the Coen overlap that is free to read (1980, via Silk & Berndt's Appendix Table 2a), so the "
        "wedge can be measured in one year only and is held constant across the window. Step 1: strip the three "
        "Coen categories MG8 does not carry (miscellaneous, business papers, farm publications). Step 2: replace "
        "Coen's internet line, which its own curator calls a serious undercount, with the IAB/PwC seller-side "
        "figure for the same year. Step 3: multiply by the 1980 like-for-like ratio MG8 / restricted-MCE = 0.92792. "
        "The result is graded C everywhere, including at 1980 where it is an identity rather than a test."),
    "arithmetic": (
        "W = 41021 / (53570 - 7559 - 1674 - 130) = 41021 / 44207 = 0.92792. "
        "MG8_hat(y) = (COEN_total(y) - MISC(y) - BUSPAP(y) - FARM(y) - COEN_INTERNET(y) + IAB(y)) * W. "
        "2007: (279612 - 37383 - 4111 - 10529 + 21206) * 0.92793 = 248795 * 0.92793 = 230864. "
        "Out-of-sample check at 2007: subtract the two media GroupM's 'measured media' basis excludes "
        "(direct mail 60225 * W = 55885, directories 14250 * W = 13223) to get 161757, against GroupM's "
        "published US measured-media total for 2007 of 162600 -- a 0.5% difference."),
    "wedge": {"value": round(W, 5), "measured_in_year": 1980, "held_constant": True,
              "why_constant": "no second overlap observation exists in any free source",
              "known_direction_of_error": "rate-card discounting deepened over the period (TV scatter, late-era "
                                          "newspapers), so the true wedge in the 2000s is probably below 0.928; the "
                                          "point CIs are therefore skewed downward, spanning 0.85 to 0.98 of the "
                                          "restricted base."},
    "steps": [
        {"label": "restricted 1980 MCE base (drop miscellaneous, business papers, farm publications)",
         "expr": "53570 - 7559 - 1674 - 130"},
        {"label": "like-for-like wedge W measured at 1980",
         "expr": "41021 / (53570 - 7559 - 1674 - 130)"},
        {"label": "raw 1980 level break MG8 vs MCE, percent",
         "expr": "100 * (41021 / 53570 - 1)"},
        {"label": "share of the 1980 break attributable to category scope, percent",
         "expr": "100 * (1 - (41021 / 44207 - 1) / (41021 / 53570 - 1))"},
        {"label": "2007 restricted base with the IAB internet substitution",
         "expr": "279612 - 37383 - 4111 - 10529 + 21206"},
        {"label": "2007 MG8-basis estimate",
         "expr": "(279612 - 37383 - 4111 - 10529 + 21206) * (41021 / 44207)"},
        {"label": "2007 direct mail on the MG8 basis",
         "expr": "60225 * (41021 / 44207)"},
        {"label": "2007 directories on the MG8 basis",
         "expr": "14250 * (41021 / 44207)"},
        {"label": "2007 measured-media equivalent for the GroupM check",
         "expr": "(279612 - 37383 - 4111 - 10529 + 21206 - 60225 - 14250) * (41021 / 44207)"},
        {"label": "difference from GroupM's published 2007 US measured-media total, percent",
         "expr": "100 * ((279612 - 37383 - 4111 - 10529 + 21206 - 60225 - 14250) * (41021 / 44207) / 162600 - 1)"},
    ],
    "validation": {
        "test": "out-of-sample at 2007 against GroupM's US measured-media total",
        "bridge_measured_media_equivalent_musd": round(measured07, 1),
        "groupm_published_musd": 162600,
        "difference_pct": round(100 * (measured07 / 162600 - 1), 2),
        "caveat": "GroupM is itself a commercial estimate on a third basis; agreement bounds the bridge, it does not confirm it."},
    "gaps_not_bridged": [
        {"years": [1840, 1866], "reason": "no estimate of US advertising expenditure of any kind exists"},
        {"years": [1867, 1918], "reason": "benchmark years only; the intervening years are not interpolated"},
        {"years": [2008, 2020], "reason": "no free annual total exists between Coen's last year and MAGNA's press-released years; left visibly empty"},
        {"years": [2011, 2025], "reason": "no free by-medium US series exists after NAA stops and before a MAGNA/eMarketer licence"},
    ],
}

for _s in bridge["steps"]:
    _s["expected"] = eval(_s["expr"], {"__builtins__": {}}, {})
assert abs(bridge["steps"][1]["expected"] - W) < 1e-12
assert abs(bridge["steps"][5]["expected"] - est07) < 1e-6
assert abs(bridge["steps"][8]["expected"] - measured07) < 1e-6
assert abs(bridge["steps"][0]["expected"] - 44207) < 1e-9
BRIDGE_2007 = bridge["steps"][5]["expected"]
BRIDGE_SCOPE_PCT = bridge["steps"][3]["expected"]

# ---------------------------------------------------------------- cross checks
totals_by_year = {}
for p in coen_points:
    if p["medium"] == "total" and p["money_type"] is None:
        totals_by_year[p["year"]] = ("coen_mce", p["value"])
for p in magna_points:
    if p["medium"] == "total" and p["year"] not in totals_by_year:
        totals_by_year[p["year"]] = ("magna", p["value"])

cross_checks = []
for y in sorted(IRS):
    irs_v = IRS[y]
    ent = totals_by_year.get(y)
    if ent:
        basis, dv = ent
        div = 100 * (dv / irs_v - 1)
        cross_checks.append({"year": y, "check_series": "irs_soi", "irs_value": round(irs_v, 1),
                             "dataset_value": round(dv, 1), "dataset_basis": basis,
                             "divergence_pct": round(div, 2), "flagged": abs(div) > 15,
                             "note": ("Coen billings vs IRS deduction." if basis == "coen_mce" else
                                      "MAGNA media-owner revenue vs IRS deduction: different objects, and the gap is "
                                      "the finding -- the tax line carries promotion and services that never reach a "
                                      "media owner.")})
    else:
        cross_checks.append({"year": y, "check_series": "irs_soi", "irs_value": round(irs_v, 1),
                             "dataset_value": None, "dataset_basis": None,
                             "divergence_pct": None, "flagged": False,
                             "note": "No assembled US total exists for this year in any free source: Coen has ended "
                                     "and MAGNA's figure for this year is licensed. The hole is left visible."})
# bridge-basis cross-checks where the bridge exists
for y in (2005, 2006, 2007):
    bv = [p["value"] for p in bridge_points if p["year"] == y][0]
    div = 100 * (bv / IRS[y] - 1)
    cross_checks.append({"year": y, "check_series": "irs_soi", "irs_value": round(IRS[y], 1),
                         "dataset_value": round(bv, 1), "dataset_basis": "bridge_mce_mg8",
                         "divergence_pct": round(div, 2), "flagged": abs(div) > 15,
                         "note": "Media-owner-revenue basis against the advertiser-deduction basis; a negative gap of "
                                 "this size is expected, not anomalous."})
# census cross-checks on the newspaper line
for ys, (npv, opv) in sorted(CENSUS.items(), key=lambda kv: int(kv[0])):
    y = int(ys)
    if y < 1919:
        continue
    coen_np = by.get(y, {}).get(("Newspapers", "Newspapers"))
    if coen_np is None:
        continue
    implied = coen_np / npv
    div = 100 * (implied / 1.5187 - 1)
    cross_checks.append({"year": y, "check_series": "census_manufactures", "irs_value": None,
                         "check_value": npv, "dataset_value": coen_np, "dataset_basis": "coen_mce newspapers",
                         "implied_outlay_to_receipts_factor": round(implied, 3),
                         "divergence_pct": round(div, 2), "flagged": abs(div) > 15,
                         "note": "Independent official enumeration of publisher receipts. The test is not the level "
                                 "but the stability of the outlay/receipts factor around 1.52; a factor that moves is "
                                 "evidence the Coen newspaper line is drifting from the enumerated base."})

# ---------------------------------------------------------------- claims
claims = [
    {"id": "ds-total-001", "statement": "Measured US advertising expenditure peaked at $247,472m in 2000 on the Coen/McCann series, the highest level the series ever records relative to GDP.",
     "central": 247472, "unit": UNIT, "ci80": [242500, 252400], "grade": "B",
     "sources": s("coen_cs"), "as_of": AS_OF_COEN},
    {"id": "ds-total-002", "statement": "The Coen/McCann series ends with full-year 2007 at $279,612m; Interpublic discontinued it in 2009, so the longest US advertising series ever built has no successor on its own basis.",
     "central": 279612, "unit": UNIT, "ci80": [274000, 285200], "grade": "B",
     "sources": s("coen_cs", "silk_berndt", "galbi_coen"), "as_of": AS_OF_COEN},
    {"id": "ds-bridge-001", "statement": "Restated onto MAGNA's media-supplier-revenue basis, US advertising in 2007 was about $230,864m rather than the $279,612m Coen published - a 17.4% level difference that is measurement, not history.",
     "central": round(BRIDGE_2007, 1), "unit": UNIT, "ci80": [round(248795 * 0.85, 1), round(248795 * 0.98, 1)], "grade": "C",
     "method": "See the dataset's bridge object: strip the three categories MG8 does not carry, substitute IAB internet for Coen's undercounted line, multiply by the 1980-measured like-for-like wedge 0.92792.",
     "sources": s("silk_berndt", "coen_cs", "iab_2025"), "as_of": AS_OF_SB},
    {"id": "ds-bridge-002", "statement": "About 69% of the 23.4% level break between Coen and MAGNA at 1980 is category scope (miscellaneous, business papers, farm publications), not the billings-versus-revenue price basis, which accounts for 7.2%.",
     "central": round(BRIDGE_SCOPE_PCT, 1), "unit": "percent of the 1980 level break attributable to category scope", "ci80": [60.0, 78.0], "grade": "C",
     "method": "(1 - (41021/44207 - 1) / (41021/53570 - 1)) x 100, from the single published overlap year.",
     "sources": s("silk_berndt", "coen_cs"), "as_of": AS_OF_SB},
    {"id": "ds-seam-001", "statement": "The 2000 out-of-home category replaced billboards at 2.77 times the level: $4,780m against $1,725m on the same 1999 data.",
     "central": 2.77, "unit": "ratio of the out-of-home line to the billboards line, 1999", "ci80": [2.7, 2.85], "grade": "B",
     "sources": s("coen_cs", "galbi_pm"), "as_of": AS_OF_COEN},
    {"id": "ds-seam-002", "statement": "Coen's internet line for 2007 is 49.7% of the IAB/PwC figure for the same year ($10,529m against $21,206m); the two lines share a name and measure different things.",
     "central": 49.7, "unit": "percent, Coen internet as a share of IAB internet, 2007", "ci80": [49.0, 50.4], "grade": "B",
     "sources": s("coen_cs", "iab_2025"), "as_of": AS_OF_IAB},
    {"id": "ds-money_type-001", "statement": "US newspaper classified revenue peaked in 2000 at $19,608m - the year before the paid-search auction existed - and had fallen 71% to $5,648m by 2010.",
     "central": 19608, "unit": UNIT, "ci80": [19216, 20000], "grade": "B",
     "sources": s("naa"), "as_of": AS_OF_NAA},
    {"id": "ds-money_type-002", "statement": "Local money was 48.3% of Coen's US total in 1935 and 33.7% in 2007; the national/local mix moved far less over seventy years than the medium mix did.",
     "central": 33.7, "unit": "percent of total US advertising classified local, 2007", "ci80": [32.7, 34.7], "grade": "B",
     "sources": s("coen_cs"), "as_of": AS_OF_COEN},
    {"id": "ds-money_type-003", "statement": "The intent-and-response media the paid-search auction later competed with - newspaper classified, directories and direct mail - were $77,427m in 2000, 31.3% of all US advertising, against $6,507m for the entire internet on the same series.",
     "central": 77427, "unit": UNIT, "ci80": [74000, 81000], "grade": "C",
     "method": "NAA newspaper classified 2000 (19,608) + Coen yellow pages 2000 (13,228) + Coen direct mail 2000 (44,591) = 77,427; as a share of the Coen 2000 total 247,472 that is 31.3%. The grouping is this dataset's construction, not any compiler's published money-type class.",
     "sources": s("naa", "coen_cs"), "as_of": AS_OF_COEN},
    {"id": "ds-gap-001", "statement": "No free, consistent by-medium US advertising series exists for 2011-2025: the fifteen years the project cares most about are the least measurable in the whole window without a commercial licence.",
     "central": 15, "unit": "years of the window with no free by-medium series", "ci80": [13, 18], "grade": "B",
     "sources": s("silk_berndt", "iab_2025", "magna_jun2025"), "as_of": FREEZE},
    {"id": "ds-crosscheck-001", "statement": "The IRS advertising deduction and the media series agree to within 1% in 2007 and diverge to 31% by 2022, as the tax line absorbs promotion, agency and technology spend that never reaches a media owner.",
     "central": 31.3, "unit": "percent, MAGNA US media-owner revenue below the IRS advertising deduction, 2022", "ci80": [28.0, 34.0], "grade": "C",
     "method": "100 x (325000 / 473153 - 1) using the MAGNA 2022 midpoint against the IRS SOI 2022 advertising deduction.",
     "sources": s("irs_soi_ccr", "magna_2022", "magna_2023"), "as_of": AS_OF_IRS},
    {"id": "ds-gdp-001", "statement": "Advertising's share of US GDP peaked in 2000 on both independent rails - 2.3% on Coen, 2.4% on IRS - and fell below 2% during the AdWords years; the century-long constancy folklore is a series-switching artefact.",
     "central": 2.3, "unit": "percent of nominal GDP, Coen basis, 2000", "ci80": [2.2, 2.45], "grade": "B",
     "sources": s("silk_berndt", "coen_cs"), "as_of": AS_OF_SB},
    {"id": "ds-provenance-001", "statement": "Of the POINT_COUNT points in this dataset, 100% carry a named compiler, a source URL and an as-of date, and every point that crosses a definitional break is graded C and carries its arithmetic.",
     "central": 100, "unit": "percent of points carrying full provenance", "ci80": [100, 100], "grade": "A",
     "sources": [{"name": "this dataset", "url": "p2-ad-market/data/adspend.json"}], "as_of": FREEZE},
]

# ---------------------------------------------------------------- reconciliation with era records
recon_totals = dict(totals_by_year)
for p in bench_points:
    if p["medium"] == "total":
        recon_totals[p["year"]] = ("benchmarks_pre1919", p["value"])

ERA_DIR = "/Users/kushaldsouza/Documents/Thinking/chipandadmarketresearch/p2-ad-market/data/eras"
recon = []
for n in range(1, 8):
    era = json.load(open(os.path.join(ERA_DIR, "era-%d.json" % n)))
    for c in (era.get("fields", {}).get("SCALE") or {}).get("claims", []):
        u = (c.get("unit") or "").lower()
        st = c.get("statement", "").lower()
        yr = str(c.get("as_of", ""))[:4]
        if not yr.isdigit():
            continue
        yr = int(yr)
        if ("percent" in u or "%" in u or "ratio" in u or "world" in u or "global" in u
                or "world" in st or "global" in st):
            continue
        scale = 1.0
        if "billion" in u:
            scale = 1000.0
        elif "million" not in u:
            continue
        ent = recon_totals.get(yr)
        if not ent or "total" not in st:
            continue
        basis, dv = ent
        era_musd = c["central"] * scale
        lo, hi = c["ci80"][0] * scale, c["ci80"][1] * scale
        recon.append({"era_claim": c["id"], "year": yr, "era_central_musd": era_musd,
                      "era_ci80_musd": [lo, hi], "dataset_total_musd": round(dv, 1),
                      "dataset_basis": basis, "within_ci": bool(lo <= dv <= hi),
                      "unit_as_published": c.get("unit")})

dataset = {
    "metric": "Annual US advertising expenditure, total and by medium, with money-type splits where the sources support them",
    "coverage_window": [1867, 2025],
    "unit": UNIT,
    "as_of": FREEZE,
    "freeze_date": FREEZE,
    "built_by": "series-archaeologist (R2)",
    "schema_notes": [
        "The five series named in the schema spec are all present with their declared roles.",
        "Three series are added beyond the spec, each flagged with added_beyond_schema_spec and a why_added string: "
        "naa_newspaper (the only source for the classified money-type axis), census_manufactures (the only official "
        "independent aggregate before 1960), bridge_mce_mg8 (holds every constructed value so the named compilers' "
        "series contain only their own numbers).",
        "All values are USD millions (current). Era records 5 and 7 state their SCALE totals in USD billions; the "
        "reconciliation array normalises units, the deterministic verifier does not - see dataset-notes.md.",
        "money_type is set only where the compiler published the split. Derived money-type aggregates live in claims, "
        "never as points.",
    ],
    "series": series,
    "concordance": concordance,
    "bridge": bridge,
    "cross_checks": cross_checks,
    "reconciliation": recon,
    "claims": claims,
}

n_points = sum(len(v["points"]) for v in series.values())
for c in claims:
    c["statement"] = c["statement"].replace("POINT_COUNT", "{:,}".format(n_points))

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    json.dump(dataset, f, indent=1)

n = sum(len(v["points"]) for v in series.values())
print("points:", n)
for k, v in series.items():
    print("  ", k, v["role"], v["coverage"], len(v["points"]))
print("concordance:", len(concordance), "cross_checks:", len(cross_checks),
      "claims:", len(claims), "recon:", len(recon))
print("bridge 2007:", round(est07, 1), "measured-media equiv:", round(measured07, 1))
print("W =", W)
