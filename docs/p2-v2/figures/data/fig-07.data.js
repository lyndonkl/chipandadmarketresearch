/* docs/p2-v2/figures/data/fig-07.data.js
 * ============================================================================
 * FIGURE 07 — the buyer's meter / pay-per-action part-to-whole (FIGURE-PLAN §B.7).
 * INLINED, never fetched (CONVENTIONS §0.2 — file:// blocks fetch and the frozen
 * record lives outside docs/). Every value is VERIFIED in FIGURE-PLAN §I.
 *
 * The governing claim, VERBATIM from `claim.py e6-buyers-008` (grade A, verdict
 * confirmed). Its central 57 (ci80 55–59) is the PPA share for 2008; its
 * statement carries the 2007 level (51%) and the CPM basis (39%).
 * ------------------------------------------------------------------------- */

export const claim = {
  id: 'e6-buyers-008',
  statement:
    "Direct-response buyers dominated the new medium's pricing: 57% of US internet " +
    'advertising revenue was bought on a performance (pay-per-action) basis in 2008, ' +
    'up from 51% in 2007, with only 39% bought on a CPM/impression basis.',
  central: 57,
  unit: '% of US internet ad revenue priced on performance, FY2008',
  ci80: [55, 59],
  grade: 'A',
  sources: [{
    name: "IAB/PwC, IAB Internet Advertising Revenue Report, Full Year 2008, 'Performance-Based Pricing Gains'",
    url: 'https://www.iab.com/wp-content/uploads/2015/05/IAB_PwC_2008_full_year.pdf',
  }],
  as_of: '2008',
  about_year: 2008,
  origin: 'p2-ad-market/data/eras/era-6.json',
  verdict: 'confirmed',
};

/* THE 2008 PARTITION (part-to-whole, sums to exactly 100%).
 *   - PPA is the PROTAGONIST: minted through the claim above (grade A), and the
 *     ONE part that carries the cyan→amber reversion (the buyer's keyed,
 *     independent meter that now sits inside the seller's own log). `value`
 *     equals the claim's central so the drawn length is the guard-minted number.
 *   - CPM and "other" are the REMAINDER of the whole — stated values from the
 *     same IAB/PwC report, drawn NEUTRAL (zinc) so nothing competes with the
 *     ownership channel (DESIGN §4, Guardrail G1). "other" = 100 − 57 − 39 = 4.
 * The verbatim CPM/other values are NOT minted as separate claims (they are not
 * claims) — the same honesty rule mini-series.js encodes. */
export const parts2008 = [
  { id: 'ppa',   label: 'Pay-per-action (performance)', value: 57, own: 'reversion', grade: 'A', minted: true },
  { id: 'cpm',   label: 'CPM / impression',            value: 39, own: 'zinc',       grade: 'A', minted: false },
  { id: 'other', label: 'Other (hybrid, sponsorship)', value: 4,  own: 'zinc',       grade: 'A', minted: false },
];

/** The 2007 PPA level the 2008 column is annotated against (from the statement). */
export const ppa2007 = 51;
