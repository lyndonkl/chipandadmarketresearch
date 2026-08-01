/* docs/p2/eras/era-records.js — reading the seven era files, once.
 *
 * `eras/era-5.json` is one of the six files `../lib/guards.js` already loads,
 * because G6 reads it. This module takes THAT COPY rather than fetching a
 * second one. Two copies of one file in one page is the defect this project has
 * hit at every stage, and the one place it would bite hardest is era 5, whose
 * two money-type taxonomies are the thing G6 exists to keep apart.
 */

import * as guards from '../lib/guards.js';

export const ERA_COUNT = 7;

/* Small counts as the word prose uses. Eleven and up print as digits. */
const COUNT_WORDS = Object.freeze([
  'no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
]);

/**
 * A count, as the word a reader-facing sentence says.
 *
 * WHY THIS EXISTS. "seven" was typed into five reader-facing strings — the
 * drawer's title and its accessible name, and three on the pull ring — while
 * the plan beside them derived its own count from the records it actually held.
 * A number spelled into prose is a second copy of a number, and every serious
 * failure on this project has been two copies of one number. There is one copy
 * now: `ERA_COUNT` for the piece, and `cells.length` for a drawer.
 */
export function countWord(n) {
  if (!Number.isInteger(n) || n < 0 || n >= COUNT_WORDS.length) return String(n);
  return COUNT_WORDS[n];
}

/** How many machines there are, as the word the prose says. Derived, never typed. */
export const ERA_COUNT_WORD = countWord(ERA_COUNT);

export class EraRecordError extends Error {
  constructor(message, detail) { super(message); this.name = 'EraRecordError'; this.detail = detail; }
}

/**
 * Fetch eras 1–7. Era 5 comes out of the frozen registry.
 *
 * `base` defaults to the data directory this module can reach from
 * `docs/p2/eras/`. Browsers block `fetch` on `file://` origins, so a page opened
 * straight off disk must serve the repository root over http; every demo here
 * says so plainly and stops rather than half-rendering.
 */
export async function loadEraRecords(options = {}) {
  const base = options.base
    ? new URL(options.base, options.baseFrom || import.meta.url)
    : new URL('../../../p2-ad-market/data/eras/', import.meta.url);
  const fetchImpl = options.fetch || (typeof fetch === 'function' ? fetch : null);
  if (!fetchImpl) throw new EraRecordError('loadEraRecords needs a fetch implementation.', null);

  const out = [];
  for (let era = 1; era <= ERA_COUNT; era += 1) {
    if (era === 5) {
      const five = guards.getFrozen('era5');
      if (!five) {
        throw new EraRecordError(
          'era 5 is not in the frozen registry. Call await guards.loadFrozen() first: this ' +
          'module takes the copy the guards already read rather than fetching a second one.',
          'era5',
        );
      }
      out.push(five);
      continue;
    }
    const url = new URL(`era-${era}.json`, base);
    const res = await fetchImpl(url);
    if (!res.ok) throw new EraRecordError(`could not read era-${era}.json (HTTP ${res.status}).`, String(url));
    out.push(await res.json());
  }
  return assertSevenEras(out);
}

/** THROWING FORM. Seven records, eras 1 to 7, in order, each with eight fields. */
export function assertSevenEras(records) {
  if (!Array.isArray(records) || records.length !== ERA_COUNT) {
    throw new EraRecordError(
      `the era machines need all ${ERA_COUNT} records. A drawer with six cells in it is a ` +
      'missing era nobody can see, because the reader has nothing to compare the gap against.',
      records && records.length,
    );
  }
  records.forEach((r, i) => {
    if (!r || r.era !== i + 1) throw new EraRecordError(`record ${i} is not era ${i + 1}.`, r && r.era);
    if (!r.fields || typeof r.fields !== 'object') throw new EraRecordError(`era ${r.era} carries no fields.`, r.era);
  });
  return records;
}
