# S2 dig — the MEDIUM evolution: the carrier changed the unit, not the share (Narrative Architect)

**Role.** Narrative Architect, Discovery Session 2. **Facet:** the MEDIUM evolution — newspapers → radio
→ TV → internet: how the carrier of advertising shifted, the share moves between media, and **what each
new medium changed about the count and the price.** Drilled the full MEDIUM family (49 claims, 7 eras) to
the bottom with `q.py`/`claim.py`. **Not an article — a discovery note.**

**Provenance discipline (carried from the dossier).** This note records *provenance, not verification*.
**No claim in it has been verified. Human verification status: none.** Every finding traces to a graph path
+ claim id. Grades (A/B/C), hedges and intervals are the corpus's own and preserved. `tu:era:*` are
synthesis (SECONDARY). Named living parties (Google, IAB, Nielsen) are **surfaced, not adjudicated.**
`e7-medium-003` (mobile 66%) is a **KNOWN REJECTED** claim — flagged, not built on.

**Extends, does not repeat.** Session 1's Thread 6 proved capture-not-expansion at the GDP layer; Thread 4
owns the loss-leader; Thread 8 owns direct mail / the denominator war. The S2 opposition sweep (Family C)
already logged "no medium killed the last." **This dig's new contribution is the layer none of them built:
the metrology reset.** Each new carrier is named by the corpus for its *unit of sale*, and each new unit
was born un-counted by any third party — which is the *mechanism* behind the meta-spine, not another
instance of it.

---

## 0. The through-line (one line, then the mechanism)

**Every new medium changed the unit before it changed the share — and each new unit was born un-audited,
so the carrier shift handed the count back to the seller.**

The received story is a relay race of carriers: newspaper → radio → TV → internet, each conquering the
last. The MEDIUM row contradicts the relay twice. **(1) The shares moved glacially:** newspapers were the
largest single US medium from 1914 through 2000 — ~86 years — and total television did not pass them until
1992. No new carrier "killed" the incumbent. **(2) What actually changed at each carrier was the unit of
sale and who could count it.** The corpus names its own eras not by the carrier but by the priced unit:
**Spot Market → Impression → Auction → Machine Market.** Each new unit — the rating, the spot, the
impression, the click — arrived before any third party could measure it, so the seller counted it first.
That is why Session 1's "the independent number was the anomaly" holds: **a new medium is always born
un-audited.** The medium evolution is the *engine* that keeps re-manufacturing the seller-owned default.

---

## 1. Frame lock (Phase-1, outcome-blind, frozen before Phase-2 derivation)

- **UNIT:** one row = one medium's spend / share / unit-of-sale in one era, read down the MEDIUM field.
  *Rejected alt:* one carrier tracked across all time — hides the per-era metrology reset, which is the finding.
- **DENOMINATOR:** share of total US ad spend (the contested Coen/IAB/MAGNA denominators — caveat travels).
  *Rejected alt:* absolute nominal dollars only — nominal growth hides reallocation-not-expansion (Thread 6's).
- **WINDOW:** 1914 (first A-grade print receipts, `e1-medium-001`) → 2025 (Machine Market, `e7-medium-001`).
  *Rejected alt:* start 1833 penny press — that is Thread 4's carrier; medium-count data begins ~1914/1919.
- **BOUNDARY:** named media in Coen/McCann + IAB internet + direct mail + Yellow Pages. The line is **Coen's**,
  not mine; the corpus flags what Coen cannot see (`e2-medium-005`, `e6-medium-006`). Architect-noted.

**Starting hypothesis (dated 2026-08-08, before derivation):** *"The carrier shifted newspaper→radio→TV→
internet, each new medium capturing a growing share by displacing the last."* — diffed in §8.

---

## 2. What each medium changed about the count and the price (the reset table)

The spine of the facet. **Bold = grounded in a MEDIUM claim's own `name`/statement.** *Italic = my synthesis
across Threads 1/5 or the era boundary, marked hypothesis (L4) — do not harden.*

| Era | Carrier | **Priced unit (corpus's era name)** | *Count / who owns it* | Independent counter at birth? |
|---|---|---|---|---|
| 1 | Print | *space (agate line / column-inch)* | circulation → **ABC 1914** | YES, but only after 45 yrs (Thread 1) |
| 2 | Radio | *time (the sponsored program)* | ratings (Hooper/CAB) | NO — basis war from birth, 3.9% vs ~11% `[e2-medium-003 B]` |
| 3 | TV | **the Spot Market era** — the 30-sec spot | households / GRPs | NO — seller ratings ran ~20% high (Thread 1, 1946) |
| 4 | Cable / segmentation | **segmentation era** — the demographic segment | panel demographics | partial |
| 5 | Web | **the Impression (1995–2000)** — CPM | **seller-reported IAB/PwC**; Coen can't see it `[e6-medium-006 A]` | NO |
| 6 | Search | **the Auction era** — the click (CPC) | Google's own log; never an absolute count (Thread 1) | NO |
| 7 | Machine | **Machine Market era** — algorithmic conversion | run-rate, model-priced | NO |

**Read the table:** the carrier column is the famous story; the priced-unit column is the real one. The
corpus author encoded it — eras are named for the *unit of sale* (Spot, Impression, Auction, Machine), and
the unit is exactly where the count changes hands. *(The Space→Time mapping for eras 1–2 is my read of the
period, marked L4; the Spot/Impression/Auction/Machine names are verbatim in the claim `name` fields.)*

---

## 3. Evidence ledger — the best 10 cited findings (grade/hedge preserved)

Each: finding → graph path → claim id(s) → the real statement.

**F1 — The "revolution" was glacial: TV entered at 1.1% (1949) and did not pass newspapers by total spend
until 1992 — 43 years.** `L3 spend-metrics → MEDIUM → e2-medium-006 · e4-medium-002`.
- `e2-medium-006 B`: "Television enters the US advertising series in 1949 at $58 million, 1.1 percent of total spend."
- `e4-medium-002 B`: "Total television (broadcast plus cable) first overtook newspapers as the largest US
  medium in **1992**, at $31,079M against $30,737M… TV's share of measured spend went from 20.2% in 1976 to
  23.0% in 1993." **Newspapers were the largest single US medium 1914→2000** (`e5-medium-001 B`).

**F2 — "TV conquered advertising" is contradicted at the medium layer.** `e3-medium-008 · e3-medium-003`,
built-in edge `Television national NEVER_REACHED Newspapers' total`.
- `e3-medium-008 B`: TV national spend passed newspaper national in 1954 ($629M vs $607M) "twenty-one years
  before it came close to newspapers' total, **which it never reached in this era**."
- `e3-medium-003 B`: TV rose 3.0% (1950) → 18.9% (1975) — "still below newspapers' 29.5% at era end."

**F3 — A medium's price unit is a function of its addressable base.** `e3-medium-004`.
- `e3-medium-004 B`: US TV households rose from 3.88M (9.0%) in 1950 to 68.5M (**97.1%**) in 1975 — "the
  supply-side fact that made **the 30-second spot a mass-reach instrument**." The spot could not be priced
  as mass reach until the base existed. *(Ties the MEDIUM row to the R4 addressable-base spine.)*

**F4 — The carrier does not die; its unit re-prices.** `e3-medium-009`.
- `e3-medium-009 B`: network radio collapsed **$196M→$43M (1950–60)** while local spot radio grew
  **$273M→$428M** — "radio survived the era by **becoming a local retail medium**." The medium outlived the
  carrier narrative by switching its unit of sale from the national program to the local spot.

**F5 — The new medium is born un-countable by the incumbent instrument.** `e6-medium-006`, edge
`Coen/McCann series UNDERSTATES US internet advertising spend 2007`. **This is the mechanism claim.**
- `e6-medium-006 A`: "The Coen/McCann series **understates internet advertising by roughly half** at the end
  of the era — $10,529m for 2007 against IAB/PwC's $21,206m — and the Coen series **terminates with 2007
  data**, making 2008 a hard seam in every 1919-onward US series." The century-spanning instrument goes
  blind exactly when the new carrier arrives.

**F6 — Even the new medium's share is a claim about a basis.** `e5-medium-004`, two `CONFLICTS_WITH` edges.
- `e5-medium-004 C`: internet's 2000 peak share was **2.6% (Coen/Coen) vs 3.3% (IAB/Coen) vs 3.7% (IAB own)**
  — "estimates disagree by a full percentage point because the numerator and the denominator come from
  different series… **Basis must be declared, not blended.**"

**F7 — The intent-medium incumbent grew THROUGH the disruptor.** `e5-medium-003 · e6-medium-002`, edge
`intent-matched directory pool NOT_PEAKED_UNTIL mid-2000s`.
- `e5-medium-003 B`: Yellow Pages/directory rose **$9.825B (1994) → $13.228B (2000)** — "the intent-matched
  directory pool kept growing right through the web's arrival and did not peak until the mid-2000s."
- `e6-medium-002 B`: "the ancestor of paid search was a ~$14bn market still at or near its peak when the era
  closed" ($14,250m, 2007). The new carrier did not kill the old intent medium — it inherited its unit.

**F8 — The metrology war predates the internet by 70 years.** `e2-medium-003`, edge `radio Coen basis
CONFLICTS_WITH radio national-media basis`.
- `e2-medium-003 B`: radio was "**3.9 percent** of all US advertising in 1932 on the Coen series;
  broadcast-history sources report '**nearly 11 percent**' for the same year on a narrower national-media
  base, **and the conflict is not resolved.**" Radio's arrival share was already a basis war — the same
  fight the internet would have in 2000 (F6).

**F9 — The eras are named for the unit of sale, not the carrier.** Claim `name` tags across the row:
`Spot Market era` (`e3-medium-009/011`), `segmentation era` (`e4-medium-003`), `The Impression (1995-2000)`
(`e5-medium-004`), `Auction era` (`e6-medium-003/005`), `Machine Market era` (`e7-medium-001`). The
corpus's own periodization is a *pricing-unit* periodization. *(My read of the naming pattern — L4 hypothesis;
the tags themselves are verbatim.)*

**F10 — The Machine Market close: the click unit now rules a $294.6B pool.** `e7-medium-001 · e7-medium-004
· e7-medium-002`.
- `e7-medium-001 A`: US internet ad revenue **$23,448M (2008) → $294,593M (2025)**, 12.6×; only down year 2009 (−3%).
- `e7-medium-004 A`: 2025 split — **search $114.2B (38.8%)**, display $81.6B, digital video $78.0B, "other
  (classifieds, directories, lead gen)" $12.5B (4.2%).
- `e7-medium-002 C`: digital ≈ **74% of all US ad spend** in 2025 (MAGNA/IAB rail; EMARKETER rail ≈82% — the
  two rails are $23B apart and must never share an axis). New medium units (CTV `e7-medium-005 B`, podcast
  `e7-medium-007 A`) keep arriving, each on its own base.

---

## 4. The quantified carrier-share arc (share of total US ad spend, grades preserved)

The reallocation, slow and incomplete — never a kill:

- **Newspapers:** 29.4% (1919, est) → **36.7% (1949)** `[e2-medium-001 B]` → 29.5% (1975) `[e3-medium-005 B]`
  → largest single medium through 2000 `[e5-medium-001 B]`; print+online **peak $49.4B (2005)** → $37.8B
  (2008) `[e6-medium-003 A]`. **#1 single medium for ~86 years.**
- **Radio:** ~3.9%/~11% basis-split (1932) `[e2-medium-003 B]`; network collapses, local spot survives (1950–60)
  `[e3-medium-009 B]`; never #1 `[e4-medium-006 B, NOT_NEAR_TOP]`.
- **Television:** 1.1% (1949) `[e2-medium-006 B]` → 18.9% (1975) `[e3-medium-003 B]`; national spend passes
  newspaper national 1954 but total never `[e3-medium-008 B]`; total-TV passes newspapers **1992** `[e4-medium-002 B]`.
- **Direct mail:** 16.8% peak (1938) → 14.5% (1949) `[e2-medium-004 B]`; largest single Coen line $60.2B (2007),
  *caveat: only because Coen books broadcast/cable separately* `[e6-medium-001 B]`. The medium the totals write out.
- **Internet:** 2.6–3.7% (2000, basis war) `[e5-medium-004 C]` → 12.6× to $294.6B (2025) `[e7-medium-001 A]`;
  ~74% of all US ad spend `[e7-medium-002 C]`. **The only carrier that did take the market — and it did so as
  the auction/click unit, over ~25 years.**

---

## 5. Form triage (six-question gate; system subject = the medium as a metrology regime)

| # | Question | Verdict | Warrant |
|---|---|---|---|
| 1 | Single continuous entity? | **YES** | the unit-of-sale / count regime, one instrument reset per carrier, 1914→2025 |
| 2 | Wants something documented? | **NO (system)** | a medium has a revealed function, not a desire — POSIWID, not intent |
| 3 | Dated sourced rupture? | **YES, several** | radio 1932 · TV enters 1949 · web 2000 · Machine Market 2025 (gradual, not status-quo ruptures) |
| 4 | Continuous action sequence ≥3 scenes? | **YES** | the unit travels: space→time→spot→impression→auction→machine (one instrument, ≥6 datable resets) |
| 5 | Point of insight (behaviour changed after)? | **ABSENT** | no system-wide self-revelation; each reset is local to its carrier |
| 6 | Resolution / new stable state? | **ABSENT** | ongoing — CTV "forecast to pass traditional TV later this decade" `[e7-medium-005 B]` |

**VERDICT: EXPLANATORY NARRATIVE — rung 2.** YES 1,3,4; NO on 2 (system), ABSENT on 5 and 6. The two
ABSENTs are load-bearing (all-slots-filled would be the fabrication signature). **Structure: McPhee SPIRAL
over chronology** — the same question, *who can count the new unit?*, re-entered at each carrier. **Runner-up:
GATHERING / braided** across the seven carriers sharing the verb *"reset the unit of sale."* Spiral wins
because recurrence, not sequence, is the argument (mirrors Thread 1's form exactly). Four-corner opposition
web **skipped** — an explanatory spine has constraints, not corners (§6 constraint inventory instead).

---

## 6. Systemic protagonist (POSIWID) + the built-in correctives

**Subject:** the advertising medium as a **counting-and-pricing instrument** (not a carrier).
- **Stated purpose:** each new medium is sold as a better way to *reach the audience* — mass reach (TV,
  `e3-medium-004`), intent (search/directory, `e6-medium-002`).
- **Revealed function (character sentence):** *the medium reliably converts a new carrier into a new unit of
  sale that no third party can yet count — which its seller counts first.*
- **Two regimes (test passed):** **radio** (1932–46: seller-side ratings, basis war `e2-medium-003`; Hooper
  ran ~20% high, Thread 1) and **internet** (2000–08: seller-reported IAB/PwC; incumbent Coen understates by
  half, `e6-medium-006 A`). Same behaviour, two carriers, 68 years apart.
- **Gap (the engine):** stated "reaches more people" − revealed "resets the count to a unit its seller owns."

**Mandatory residual (blocks the malign-optimizer read — outcomes the revealed function does NOT explain):**
1. **Direct mail** was individually addressable and *counted per piece* from 1904, was the 2nd-largest medium
   for decades — yet the totals **wrote it out** (opposite of "seller inflates its own count") `[e2-medium-004 B]`.
2. **Yellow Pages grew *through* the web** and peaked mid-2000s `[e5-medium-003 B]` — a new carrier that did
   NOT reset or kill the old intent unit; search *inherited* it rather than displacing it.
3. **The 30-second spot took 42 years** to make TV the largest medium `[e2-medium-006, e4-medium-002 B]` —
   a "reset" this slow is not an optimiser's coup; it is supply-side diffusion (household penetration, F3).

**Constraint inventory (replaces the opposition web) — the built-in `NOT_*` correctives, medium-origin:**
- `e1-medium-005` pre-1919 totals `NOT_READ_AS` media-only measure — the first "count" wasn't even a media count.
- `e2-medium-005` Yellow Pages `NOT_SEPARATE_CATEGORY_IN` Coen — the instrument can't see a whole medium.
- `e3-medium-008` TV national `NEVER_REACHED` newspapers' total — kills "TV conquered."
- `e4-medium-006` radio `NOT_NEAR_TOP` — kills "radio was a dominant spend medium."
- `e5-medium-003` directory pool `NOT_PEAKED_UNTIL` mid-2000s — kills "the web killed directories on arrival."
- `e6-medium-006` Coen `UNDERSTATES` internet — the incumbent count goes blind at the carrier's arrival.
- `e2-medium-003` / `e5-medium-004` radio & internet share `CONFLICTS_WITH` themselves across bases.

---

## 7. Connection to the meta-spine ("the independent number was the anomaly")

**Extends it — supplies the missing MECHANISM.** Session 1 showed the count keeps reverting to the seller
but framed the reversion as *consolidation* (the counter ends up on the payroll). The MEDIUM row shows a
second, deeper route: **birth.** The count does not only drift to the seller through capture — it *starts*
there every time a new carrier arrives, because a new medium is a new unit no third party can yet measure.
Radio's ratings (basis war, `e2-medium-003`), the impression (seller-reported, Coen blind, `e6-medium-006`),
the click (Google's own log), the algorithmic unit (run-rate) — each born seller-counted. *The independent
number is the anomaly because a new medium is always born un-audited.* The medium evolution is the engine
that re-creates the default the whole market keeps having to re-correct.

**Complicates it — three ways (all cited):**
1. **"Each new medium captured the market" is mostly false at the share level.** Newspapers led ~86 years;
   TV crossed only in 1992; directories grew through the web `[e4-medium-002, e5-medium-003 B]`. The one
   carrier that *did* take the market — the internet — did it slowly and *as the auction/click unit*, not as
   a carrier. Capture-not-expansion (Thread 6), now re-derived on the medium axis.
2. **The historian's own instrument enacts the POSIWID gap.** The century-spanning Coen series cannot see the
   newest medium at its real scale (`e6-medium-006 A`, understates by half, terminates 2008). The measurement
   goes blind exactly where the new count is born — the gap is now visible in the *record itself*, not just
   the market.
3. **The unit, not the carrier, is the load-bearing variable.** Reframing the medium as its priced unit (§2)
   folds Threads 1 and 5 into one lineage: *who counts* (T1) and *how the price is set* (T5) are the same
   question asked freshly at each carrier — because each carrier ships a new unit.

**Agency reading (required).** Strongest agency read: *sellers deliberately introduced new units to escape
the incumbent count.* Considered, **not adopted.** The corpus documents the reset as *structural*. The new unit is un-countable because the carrier is new
— household diffusion `e3-medium-004`, the instrument's own blindness `e6-medium-006`. And the residuals
cut against intent: direct mail was written out, and the TV crossover took 42 years. Structural, not
agentic — consistent with the meta-spine.

---

## 8. DEAD column (must reach the reader) + hypothesis diff

- **"Each new medium captured a growing share by killing the last"** — **CONTRADICTED.** `e4-medium-002 B`
  (TV crossover 1992), `e3-medium-008 B` (`NEVER_REACHED`), `e5-medium-003 B` (directory grew through web),
  Family-C `NOT_COLLAPSED`×5 (sibling sweep).
- **"Television conquered advertising / was the dominant mid-century medium"** — **CONTRADICTED.**
  TV 18.9% vs newspapers 29.5% at 1975 `[e3-medium-003 B]`; national-only crossover 1954, total never `[e3-medium-008 B]`.
- **"The internet's share tells one clean story"** — **CONTESTED**, three bases 2.6/3.3/3.7% `[e5-medium-004 C]`.
- **`e7-medium-003` (mobile 66% of digital)** — **REJECTED** upstream; do not build on it.
- **"Spot/Impression/Auction/Machine is the corpus's canonical medium periodization"** — **did_not_support /
  L4 hypothesis.** These are claim-`name` tags; the pricing-unit reading of them is my synthesis, not a graph assertion.

**Hypothesis diff.** Before: *"the carrier shifted newspaper→radio→TV→internet, each capturing share by
displacing the last."* After: the **"displacing/capturing"** half is **contradicted** (shares moved
glacially; nobody was killed), and the **"the carrier shifted"** half is **reframed** — what shifted at each
carrier was the *unit of sale and its counter*. The evidence moved the spine from *carrier displacement* to
*metrology reset that reverts the count to the seller.* That change is the evidence doing its job; the part
that survived (the internet genuinely did take the market, but as the click unit over 25 years) is worth
suspecting and is carried with its caveats.

---

## 9. Escalations / research gaps (route to research, not redraft)

1. **The Space→Time price-unit mapping for eras 1–2 (§2) is L4 synthesis** — the MEDIUM claims name the unit
   only from era 3 ("Spot Market") onward. A dedicated PRICING-row pull would confirm/deny the agate-line and
   sponsored-program units. *(Architecture defect risk: do not let a drafter harden the §2 table's italic cells.)*
2. **No MEDIUM claim states the CPM→CPC transition directly** — that lineage lives in Thread 5 (`mech-adwords-001`,
   `mech-rgsp-001`) and the era-5/6 names. Cross-thread borrow, flagged.
3. **The `e6-medium-001` "direct mail is biggest" result depends on Coen splitting broadcast/cable** — the
   caveat is inside the claim; ship it, never strip it.
4. **CTV / podcast (era 7) are single-base, forecast-laden** (`e7-medium-005 B`, `e7-medium-007 A`) — color for
   "new units keep arriving," never a measured share of total.

*This note records provenance and coverage only. No claim in it has been verified. Human verification status: none.*
