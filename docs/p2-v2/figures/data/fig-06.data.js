/* docs/p2-v2/figures/data/fig-06.data.js
 * ============================================================================
 * FIGURE 06 — the take-rate reversal (FIGURE-PLAN §B.6). INLINED, never fetched
 * (the frozen record lives outside docs/; see CONVENTIONS.md §4 Tier A).
 *
 * The governing claim is minted ONCE by mini-series.js (grade → jitter, verdict
 * refused if drawn invisibly, G1 on the claim's own interval). The four plotted
 * values live INSIDE this claim's method (filed 10-K arithmetic), not in
 * adspend.json — so there is no adspend series to read; the values are verbatim.
 *
 * claim record: verbatim from `python3.12 p2-ad-market-v2/discovery/claim.py
 * mech-tac-003` (FIGURE-PLAN §I — VERIFIED). Grade A; verdict "post-verification"
 * → the figure passes a verdictRegister and prints its stamp (no invisible verdict).
 * ==========================================================================*/

export const claim = {
  id: 'mech-tac-003',
  statement:
    "Google's take rate on syndicated inventory rose from about 9% in 2002 to a peak of 24.7% in 2006, " +
    "then FELL to 21.5% (2007) and 21.3% (2008): the ratchet reverses when competition for partners " +
    "intensifies. The FY2008 10-K warns that the rate 'may increase in the future if we are unable to " +
    "continue to improve the monetization... particularly with those members to whom we have guaranteed " +
    "minimum revenue share payments'.",
  central: 24.7,
  unit: '% of Google Network advertising revenue retained by Google, peak year 2006',
  ci80: [21.0, 25.0],
  grade: 'A',
  method:
    'Arithmetic on two filed series: 1 - AdSense TAC / Google Network advertising revenue. ' +
    '2006: 1 - 3134.6/4159.831 = 24.65%. 2007: 1 - 4543.0/5787.938 = 21.51%. ' +
    '2008: 1 - 5284.3/6714.688 = 21.30%. For 2002-2005 only total TAC is disclosed, so the take rate ' +
    'is bounded: 2002 = 9% exactly (the 91% ratio is itself disclosed), 2005 = 21.3% if all TAC were ' +
    'AdSense TAC and up to 25.5% if distribution TAC ran at its 2006 share of 5.3%.',
  sources: [
    {
      name: 'Google Inc., Form 10-K FY2008 (revenues by source 2006-2008; TAC split AdSense ' +
        '$3,134.6m/$4,543.0m/$5,284.3m and distribution $174.2m/$390.9m/$654.7m)',
      url: 'https://www.sec.gov/Archives/edgar/data/1288776/000119312509029448/d10k.htm',
    },
    {
      name: 'Google Inc., Form 10-K FY2004 (traffic acquisition costs $94.5m/$526.5m/$1,228.7m at ' +
        '91%/84%/79% of Google Network advertising revenue)',
      url: 'https://www.sec.gov/Archives/edgar/data/1288776/000119312505065298/d10k.htm',
    },
  ],
  as_of: '2008',
  about_year: 2006,
  origin: 'p2-ad-market/data/mechanism.json',
  verdict: 'post-verification',
};

/* The verbatim points, in reading order. x = year, y = % retained by Google.
 * 2006 is the anchor (the claim's central / about_year). The rise 2002→2006 and
 * the FALL 2006→2008 are the whole argument: a pure maximiser would not let go. */
export const points = [
  { x: 2002, y: 9.0,  label: '~9%' },
  { x: 2006, y: 24.7, label: '24.7%' },
  { x: 2007, y: 21.5, label: '21.5%' },
  { x: 2008, y: 21.3, label: '21.3%' },
];
