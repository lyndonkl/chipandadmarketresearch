/* docs/p2-v2/figures/data/fig-01.data.js
 * ============================================================================
 * INLINED DATA for FIGURE 01 — the hero, "Ownership over time — the reversion".
 *
 * NOT A FETCH. The frozen record lives outside docs/ (p2-ad-market/data/), so a
 * deployed Pages site cannot reach it; every value the hero cites is baked here
 * and imported. See CONVENTIONS.md §4 (Tier A).
 *
 * TWO EXPORTS:
 *   claims    — the seven claim records that GROUND the epochs, verbatim fields
 *               from the frozen record (id, grade, unit, about_year, verdict,
 *               and a short reader-facing gloss). Pulled via
 *               `python3.12 p2-ad-market-v2/discovery/claim.py <id>`. The hero
 *               is NOT a dataset (FIGURE-PLAN §A), so these are not drawn as
 *               interval marks — they ride the citation shelf and the hover
 *               readout, and their GRADE rides the boundary jitter (figures.css),
 *               never colour.
 *   heroSpec  — the CONSTRUCTED reading: the amber→cyan→amber ownership track.
 *               This is a reading, not a measurement (flagged hard on the plate).
 *               No numeric ownership series exists; the years are the verified
 *               claim years, the shape is the L5 thesis made visible once.
 * ========================================================================== */

/* The ownership assignment per claim, from DESIGN.md §4.3 and FIGURE-PLAN §A.
 * own: 'amber' = seller/judged-party held the count · 'cyan' = independent. */
export const claims = [
  {
    id: 'e1-sellers-003', grade: 'A', own: 'amber', about_year: 1914, verdict: 'confirmed',
    gloss: 'Advertising was 64.9% of US newspapers’ gross income in 1914 — the seller’s own books.',
  },
  {
    id: 'e1-measurement-002', grade: 'B', own: 'cyan', about_year: 1914, verdict: 'confirmed',
    gloss: 'The Audit Bureau of Circulations is founded in 1914 — the world’s first independent circulation audit.',
  },
  {
    id: 'e2-measurement-003', grade: 'B', own: 'cyan', about_year: 1946, verdict: 'adjusted',
    gloss: '1946 — Hooper’s vendor ratings still run ~20% above the co-op CAB: the independent count begins to drift.',
  },
  {
    id: 'e4-measurement-001', grade: 'B', own: 'cyan', about_year: 1987, verdict: 'confirmed',
    gloss: '1987 — Nielsen people meters cut measured prime-time audience (CBS/ABC −13%): an honest count that hurt the seller.',
  },
  {
    id: 'mech-adwords-001', grade: 'A', own: 'amber', about_year: 2002, verdict: 'post-verification',
    gloss: 'AdWords Select (Feb 2002) prices ads by the platform’s own quality-weighted auction — the seller sets the rule again.',
  },
  {
    id: 'e6-measurement-006', grade: 'A', own: 'amber', about_year: 2008, verdict: 'confirmed',
    gloss: 'Google discloses ~18% paid-click growth in Q4 2008 — but never a count, a CPC, or a query total. The number is withheld.',
  },
  {
    id: 'mech-tac-003', grade: 'A', own: 'amber', about_year: 2006, verdict: 'post-verification',
    gloss: 'Google’s syndication take rate is its own reported ratio — seller-held, and only surfaced through filed 10-Ks.',
  },
];

/* The CONSTRUCTED reading. Years are verified; the ownership shape is the L5
 * thesis, not a measured series. There is no value axis. */
export const heroSpec = {
  domain: [1850, 2025],
  epochs: [
    {
      key: 'pre', years: [1850, 1914], own: 'amber', name: 'PUBLISHER SELF-COUNT',
      held: 'The seller held the count — publishers tallied their own circulation and billed advertisers against it.',
      claims: ['e1-sellers-003'],
    },
    {
      key: 'audit', years: [1914, 2004], own: 'cyan', name: 'INDEPENDENT — THE 1914 AUDIT',
      held: 'An independent third party held the count — the Audit Bureau of Circulations (1914) and the instruments that followed. The ~90-year anomaly.',
      claims: ['e1-measurement-002', 'e2-measurement-003', 'e4-measurement-001'],
    },
    {
      key: 'post', years: [2004, 2025], own: 'amber', name: 'PLATFORM SELF-COUNT',
      held: 'The seller holds the count again — the platform prices on its own auction and discloses growth, never a count. A return, not a new crisis.',
      claims: ['mech-adwords-001', 'e6-measurement-006', 'mech-tac-003'],
    },
  ],
  /* Both bracket boundaries are grade B → they JITTER: the reader feels the
   * edges of the anomaly as uncertain, which is literally the thesis. */
  boundaries: [
    {
      year: 1914, grade: 'B', label: '1914', into: 'cyan', claim: 'e1-measurement-002',
      note: 'The independent count arrives — ABC, 1914. Grade B: even the edge of the anomaly is a reading, not a hard date.',
    },
    {
      year: 2004, grade: 'B', label: '~2004', into: 'amber', claim: 'mech-adwords-001',
      note: 'The count returns to the seller — AdWords’ own auction (2002) into Google’s uncounted clicks (2008). Grade B: the edge is a reading.',
    },
  ],
  /* Decay markers inside the cyan era: the independent count thinning. Cyan,
   * fading, each grounded in a grade-B claim. */
  decay: [
    { year: 1946, grade: 'B', opacity: 0.85, claim: 'e2-measurement-003' },
    { year: 1987, grade: 'B', opacity: 0.55, claim: 'e4-measurement-001' },
  ],
  axisBasis: 'who held the count — an independent third party, or the party being judged',
};

export default { claims, heroSpec };
