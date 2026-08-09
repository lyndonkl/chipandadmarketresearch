# S2 — the full opposition sweep (narrative architect)

**Role.** Narrative Architect, Discovery Session 2. Task: run the FULL opposition sweep the dossier flagged
as "the single highest-yield next query." Count every corrective/exclusion edge the corpus wires into L0.
Build the complete opposition web, above all in the unexplored TARGETING / BUYERS / MEDIUM quarter. Then
connect it to — or complicate — Session 1's meta-spine ("the independent number was the anomaly").

**Provenance discipline (carried from the dossier).** This note records *provenance, not verification*.
**No claim in it has been verified. Human verification status: none.** Every finding traces to a graph edge
and a claim id. Grades (A/B/C), hedges and intervals are the sources' own, and are preserved. `tu:era:*`
field/event nodes are **synthesis (SECONDARY)**. Re-pull their inline numbers from the backing `e#-` claim
before any number reaches prose. Featured claims were pulled with `claim.py` and cross-checked for the
verdict seam: **none of the 24 featured claims carries a `rejected` verdict** (the known-rejected
`e2-creators-001`, `e7-medium-003`, `ds-gdp-001`, `ds-total-001` are not used here).

---

## 0. Headline — the corpus is ~34× more self-correcting than Session 1 could see

Session 1 surfaced **~10** opposition edges and flagged the total as "unknown." The total is not ~10.

| Cut | Count | Query |
|---|---|---|
| **All hard-negation / opposition edges L0→L0** | **339** | `type(r) =~ '(?i).*(NOT\|NEVER\|CANNOT\|EXCLUD\|CONFLICT\|CONTRAST\|CONTRADICT\|DISAGREE\|DISPUT\|BARRED\|UNDERSTATE\|COMPLICAT).*'` |
| — of which the 7 *named* opposition types | **110** | `EXCLUDES 91 · CONFLICTS_WITH 7 · CONTRASTS_WITH 4 · NOT_SAME_AS 4 · NOT_CAUSED_BY 3 · DID_NOT_CONTRIBUTE 1 · RECONCILED_WITH 0` |
| — of which the *un-named* `NOT_* / NEVER_* / CANNOT_* / DID_NOT_* / RULED_NOT_*` vocabulary | **~229** | 160 `NOT_*` + 13 `DID_NOT_*` + 13 `EXCLUDED*` + 12 `DISAGREE/DISPUTE` + 6 `NEVER_*` + 6 `CANNOT_*` + 4 `RULED/DECLARED_NOT_*` + … |
| **Correctives originating in the TARGETING/BUYERS/MEDIUM quarter** | **88** | `r.origin =~ '.*-(targeting\|buyers\|medium)-.*'` OR `tu:era:N:field:(TARGETING\|BUYERS\|MEDIUM)` |

**Two structural facts about these edges, stated up front so they are not over-read:**

1. **They are overwhelmingly *self-edges* — a claim wiring a corrective inside its own statement**
   (`a.origin == b.origin == r.origin`). They are not 339 claims contradicting each other. They are ~339
   built-in "do-not-read-this-as-X" guards annotated across ~200 claims. That is precisely what makes them
   a **gift to a narrative architect**: the corpus author installed the BUT before we arrived.
2. **The named 7 types under-report the web by ~3×.** The corpus's richest correctives live in the
   free-text `NOT_*` vocabulary the dossier's query never touched — `NOT_PURCHASABLE`, `NOT_COUNTABLE`,
   `NOT_CHOOSING`, `CANNOT_TARGET`, `NOT_COLLAPSED`, `NEVER_REACHED`, `RULED_NOT_VIOLATE`, `CONTRADICTS`.
   The single most load-bearing corrective in the whole quarter (targeting was `NOT_COUNTABLE`, therefore
   `NOT_PURCHASABLE`) is invisible to a query that only asks for `EXCLUDES`.

**The one-line finding:** *the corpus's largest built-in corrective is not any single thread — it is the
denominator, and, in the unexplored quarter, the unit of targeting.* Roughly **half** of all 339 edges are
one of two guards: **"this share statistic is a claim about a basis, not a fact about the world"** and
**"the addressable unit was never the person until the very end."** Both extend the meta-spine. The second
complicates the R4 addressable-base spine before it is built.

---

## 1. The consolidated opposition web — by corrective family

Grades preserved; hedges kept verbatim; quarter edges flagged **[Q]**. "What it kills" is the manufactured
causation the edge pre-empts.

### FAMILY A — THE DENOMINATOR WAR (~50 edges): every "US ad market" number is a basis, not a fact
The largest family. The corpus writes the same channels out of the total again and again, and flags where two
bases give two irreconcilable numbers. This is Thread 6 / Thread 8 (denominator war) rendered as a *countable*
structural fact, not a caveat.

| Edge | Corrective | What it kills | Claim · grade |
|---|---|---|---|
| **Direct mail written out of the total — 8 separate edges** | `e2-scale-010`, `e5-buyers-010`, `e7-buyers-006` **[Q]**, `e7-scale-001/006/008/009` all `EXCLUDES direct mail` | "the headline US ad-market number is the market" | A/B/C |
| Coen geography ≠ buyer pool **[Q]** | `e5-buyers-010` National `EXCLUDES` direct mail + national directories + general-media direct response + non-newspaper classified; `e5-buyers-011` Local `EXCLUDES` newspaper classified; `IAB/PwC report EXCLUDES local advertising category` | "national-brand vs local-retail money is a published series" (it is proxy-derived, grade **C**) | `e5-buyers-010/011` **C** |
| Trade + consumer promotion invisible **[Q]** | `e4-buyers-004` / `tu:era:4:field:BUYERS` `EXCLUDES trade promotion` + `consumer promotion` | "measured media = what marketers spend" — trade promo alone took **44.9%** of CPG marcom budgets by 1992 | `e4-buyers-004` **B** |
| Direct-response bought on a different meter **[Q]** | `e4-buyers-007` `EXCLUDES cost per thousand` — ~$31B (22% of measured advertising) bought on cost-per-**order** | conflating impression-priced and response-priced money | `e4-buyers-007` **C** |
| Era-7 platform money older series never counted | `tu:era:7:field:SCALE` `EXCLUDES` yellow-pages listings + classified lineage + co-op/trade allowances + catalogue + lead-gen (5 edges) | "platforms captured a growing pie" | `e7-scale-002` **C** |
| CTV carved out of programmatic | `e7-pricing-005` open-web programmatic `EXCLUDES CTV`; `$88B` pool "**Do not treat as a US total**" | reading the ANA $88B leakage pool as a US total | `e7-pricing-005` **B** |
| Same quantity, two bases (7 CONFLICTS) | `e1-scale-004` Coen 1999 vs Printers' Ink (~20% apart at origin); **[Q]** `e2-medium-003` radio 1932 = **3.9%** (Coen) vs **~11%** (national-media base), "the conflict is not resolved"; **[Q]** `e5-medium-004` internet 2000 = **2.6% / 3.3% / 3.7%** — "Basis must be declared, not blended"; **[Q]** `tu:era:6:field:MEDIUM` yellow-pages $14.3B vs $14.7B peak | any single "the number" | B/C |
| The corpus flags its own charts **[Q]** | `tu:era:2:field:MEDIUM` `CONTRADICTS` (chart ↔ chapter title) + `NOT_CLOSE_TO` (radio ↔ print); `tu:era:4:field:MEDIUM` `NOT_LIKE` (share chart ↔ common narrative); `e5-buyers-014` `EXCLUDES_SORTING` | trusting the era chart over the era data | synthesis |

### FAMILY B — THE UNIT OF TARGETING WAS NEVER THE PERSON (~18 edges) **[Q, mostly new]**
The anti-teleology guard the R4 "title→household→person→opt-out" spine must carry. The graph denies a smooth
150-year march to the individual at **five** eras. This is the richest *new* vein in the sweep.

| Era | Corrective edges | Reading |
|---|---|---|
| 1 | `tu:era:1:field:TARGETING` `NOT_CHOOSING` (targeting, person) | you bought a title, not a person |
| 2 | `tu:era:2:field:TARGETING` `EXCLUDES individuals` + `NOT_COUNTABLE` + `NOT_PURCHASABLE` (narrower unit) | "Nothing narrower was purchasable, **because nothing narrower was countable**" — targeting's ceiling *is* measurement's ceiling (ties the R4 spine straight to Thread 1) |
| 4 | `tu:era:4:field:TARGETING` `CANNOT_TARGET intent` + `NOT_UNIT_OF_PRECISION` (person); `tu:era:4:event:2` MTV `EXCLUDES geography` + `daypart` | the segmentation era (PRIZM/MTV) reached a *psychographic kind of person nationally* — still not an individual, still not intent |
| 5 | `e5-targeting-004` keyword targeting `NOT_USES cookie` + `NOT_USES user profile`; `e5-targeting-002` cookie targeting `NOT_MADE_ECONOMICALLY_MEANINGFUL_FOR` publishers | search is **not** the surveillance-targeting ancestor — it carried no cookie and no profile |
| 6 | `tu:era:6:field:TARGETING` `EXCLUDES` query≠person + matching≠demographic-model + intent-level≠audience-level | "The era's targeting unit was **the query, not the person** … intent-level rather than audience-level" — search competed with **classified and directories**, the *old* intent media, not with audience media |

**Consequence for R4:** the addressable base does **not** climb monotonically toward the individual. It
climbs toward the *countable unit*: title → daypart+list → household → psychographic-segment → query. The
**person** becomes the priced unit only in era 7. Then the **state** re-separates. ATT (2021,
`tu:era:7:event:5`) is a **platform rule, not a law**, yet it hands the person an opt-out and costs Meta a
self-reported ~$10B/yr (`e7-events-006` **B**). So the R4 spine should be built as *"the march was to what
could be counted, not to who you are — and the one era that finally addressed the person is the one the state
re-separated."* That is the meta-spine, at the targeting layer.

### FAMILY C — NO MEDIUM CAPTURED THE MARKET BY KILLING THE LAST ONE (~14 edges) **[Q, mostly new]**
Thread 6's "capture, not expansion" was proven at the SCALE/GDP layer only. The MEDIUM row proves it again,
independently, at the medium layer — and the corpus's strongest single statement of it is here.

| Edge | Corrective | Grade |
|---|---|---|
| `tu:era:5:field:MEDIUM` `CONTRASTS` web arrival ↔ **"barely dented the ranking"** | internet was 2.6–3.7% of spend in 2000 and **shrank in 2001**; newspapers ($49.05B) and direct mail led; Yellow Pages **grew through the web** ($9.8B→$13.2B) | synthesis |
| `tu:era:6:field:MEDIUM` `NOT_COLLAPSED` × 5 (broadcast TV, cable, radio, magazines, out-of-home) | "the strongest evidence against a simple 'digital killed old media' story"; internet still ~7% of total US advertising in 2007; only newspaper classified and newspapers broke | synthesis |
| `tu:era:3:field:MEDIUM` `NOT_OUTPERFORMED_IN_SPEND` (TV ← newspaper) + `NOT_WON_LOCAL_MONEY` (TV) | television never outspent newspapers in the era and never took local money; its rise was reallocation of *national brand* money | synthesis |
| `e3-medium-008` `NEVER_REACHED` (TV national ← newspapers' total); `tu:era:4:field:MEDIUM` `NOT_CLOSE_TO_TOP` (radio) | the "TV conquered advertising" narrative | B/synthesis |
| `e6-medium-006` / `tu:era:6:field:MEDIUM` `UNDERSTATES` (Coen internet ← IAB); `e2-medium-005` `NOT_SEPARATE_CATEGORY_IN` (Yellow Pages ← Coen) | the seam itself: the one continuous series can't even see the new medium at its own scale | B |

### FAMILY D — CAUSATION KILLS (4 named + the un-named cousins): the received "X killed Y" stories are wrong
| Edge | Kills | Grade |
|---|---|---|
| `e6-creators-002` commission decline `NOT_CAUSED_BY` search (followed 1991–94 unbundling) | "search killed the agency commission" | **B** |
| `e6-scale-009` real-estate classified `NOT_CAUSED_BY` search (fell with housing) | "the internet killed classified" (single-cause) | **A** |
| **[Q]** `tu:era:3:field:BUYERS` Television share `NOT_CAUSED_BY` Kinds of advertising money | "TV's rise created new demand" — the four money-pools barely moved (43/36/7/14 in 1950 → 40/38/8/15 in 1975); TV was reallocation *inside national brand money* | synthesis |
| `tu:era:5:event:2` Google `DID_NOT_CONTRIBUTE` the open per-click auction (Overture built it); `mech-first_price-001` Google Ad Manager display `EXCLUDES` search — a *different market*; `mech-capture-003` Google **bought** 2.8→4.5% of its own owned-query volume as distribution TAC | "Google invented search advertising / the auction is one thing" | A/B |

### FAMILY E — THE MIDDLEMAN'S CUT NEVER APPLIED TO THE INTENT MEDIA (new synthesis) **[Q]**
The braid the dossier's §5 wanted (2+3, "the intermediary's take, 180 years") gets its keystone corrective
*from the buyers row*, and it reframes Thread 2:

- `e1-buyers-007` **[Q]**: classified `EXCLUDES agency commission` AND `EXCLUDES cost of preparation`; the
  1.5187× receipts-to-outlay wedge **`NOT_APPLY_TO`** classified — "a channel that carried **neither**." (grade **C**)
- `e3-buyers-005` **[Q]**: classified buyers "individuals and small businesses paying per line, **without an
  agency**" — $377M (1950) → $2,159M (1975). (grade **B**)
- `tu:era:3:field:BUYERS` **[Q]** / `tu:era:3:field:PRICING`: classified `EXCLUDES Agency`. Classified and
  directories "ran on an entirely different pricing regime … **no agency and no commission**." They were "the
  era's only self-serve, intent-matched, priced-per-unit advertising, and **the direct ancestor of paid
  search**."
- `tu:era:6:field:CREATORS`: AdWords "self-serve from signup to live ad … the point at which the 15% commission
  **simply stopped existing for a whole class of buyer**"; the third creator class "sold optimisation, **not
  copywriting**" (`optimisation service NOT_SAME_AS copywriting service`).

**The synthesis:** paid search did **not** kill the 15% commission (Family D, `e6-creators-002`). Paid search
is the **heir of the one channel that never paid a commission in the first place** — classified/directory
intent media, self-serve and un-agencied since 1914. The middleman's cut did not disappear. It *retreated from
the media it had never held* and **reappeared as the platform take rate**. See AdX ~20%, the TAC ratchet, and
`mech-tac-004` (owned-dollar `NOT_SAME_AS` syndicated-dollar, a 4.5× retention gap, grade **A**). Thread 2's
"the 15% that would not die" and the intent-media lineage are the **same** story told from the two ends of the
wedge.

### FAMILY F — THE NUMBER IS A HOLE AT THE BUYER LAYER TOO (Thread 1 extension) **[Q]**
Session 1 had "Google publishes the rate, never the count" at the *impression/click* layer. The buyers row
adds the *buyer-count* layer:
- `e6-buyers-002` Google `DID_NOT_DISCLOSE` its AdWords advertiser count; `e7-buyers-003` `NOT_PUBLISHED`
  population-level Google-advertiser figure. The count of who buys is a number-shaped hole.
- `e7-targeting-005` **[Q]**: Meta's AI ad revenue "$60B annualised **run rate** … the run rate is an
  instantaneous annualisation **rather than a twelve-month actual**" (`EXCLUDES twelve-month actual revenue`,
  grade **B**). The seller states a number the shape of the thing, not the thing — at the AI layer, in 2025.

### FAMILY G — NOT EVERYTHING WAS AN AUCTION (Thread 5 extension)
Thread 5's residual said second-price was a Google-era artefact, not an Eden. The pricing edges corroborate it.
At its 2000 launch, AdWords was a **fixed-rate self-serve CPM**, not an auction (`e5-pricing-005`,
`EXCLUDES auction`). The auction arrives only with AdWords Select in Feb 2002. The `tu:era:6:field:PRICING`
entry-price package `EXCLUDES` the Overture minimum bid, monthly commitment and human editorial review.
`NOT_AUCTION` fires twice, and `tu:era:6:boundary` has era-6 `EXCLUDES auction death`. The "auction" is
neither original (Overture, first-price) nor eternal (fixed CPM before it, rGSP/first-price after).

---

## 2. How the sweep extends — and complicates — the meta-spine

**Extends.** "The independent number was the anomaly" now has a **denominator twin**: *the independent
denominator was also the anomaly.* The corpus wires ~50 edges saying every share statistic is a basis-choice.
The biggest single omission — direct mail, the second-largest medium for decades — is written out of the total
**eight** times. Who *counts* (Thread 1) and *what is counted in the denominator* (Families A/C) are the same
POSIWID gap at the measurement and the basis layers. The MEDIUM and BUYERS rows independently re-derive
capture-not-expansion (Family C/D), so Thread 6's frame is now evidenced at three layers, not one.

**Complicates.** The R4 addressable-base spine ("title→household→person→opt-out") cannot be built as a march to
the individual — the graph denies it at eras 1, 2, 4, 5 and 6 (Family B). Built honestly, it becomes a
different sentence. The march was to the *countable unit*. Search — the era everyone codes as the birth of
surveillance targeting — carried no cookie, no profile and no demographic model; it was the heir of classified
and the directory. The person becomes addressable only in era 7, and immediately the state re-separates (ATT).
The complication **is** the meta-spine: targeting's ceiling was always measurement's ceiling
(`NOT_COUNTABLE` → `NOT_PURCHASABLE`).

**Agency reading (required).** Strongest agency reading of the quarter: *the platforms deliberately drove
targeting down to the person to extract intent rents.* Considered, **not adopted**. The corpus documents the
targeting unit as constrained by what was *countable* — era 2's ceiling, era 6 competing with directories not
audiences. And the one era that reached the person (7) is the one the state re-separated. Structural, not
agentic — consistent with the meta-spine. Named parties (Google, Meta, Brinkema) surfaced, not adjudicated.

---

## 3. New DEAD / CONTRADICTED column entries this sweep surfaces (must reach the reader)

- **"The internet captured/killed the ad market in the dot-com era"** — CONTRADICTED. Web `CONTRASTS`
  "barely dented the ranking," shrank in 2001, ~2.6–3.7% of spend at its 2000 peak `[tu:era:5:field:MEDIUM;
  e5-medium-004 C]`.
- **"Digital killed old media (2002–08)"** — CONTRADICTED. Broadcast TV, cable, radio, magazines, out-of-home
  all `NOT_COLLAPSED`; only newspaper classified + newspapers broke `[tu:era:6:field:MEDIUM]`.
- **"Television conquered advertising"** — CONTRADICTED. TV `NOT_OUTPERFORMED_IN_SPEND` by newspapers and
  `NOT_WON_LOCAL_MONEY`; its rise `NOT_CAUSED_BY` new kinds of money `[tu:era:3:field:MEDIUM/BUYERS]`.
- **"Search targeting was personal/surveillance targeting from the start"** — CONTRADICTED. Keyword targeting
  `NOT_USES cookie`, `NOT_USES user profile`; era-6 unit was the query, `EXCLUDES person` and `demographic
  model` `[e5-targeting-004; tu:era:6:field:TARGETING]`.
- **"Advertising marched steadily toward addressing the individual"** — CONTRADICTED at 5 eras
  `[tu:era:1/2/4/5/6:field:TARGETING]`; `NOT_COUNTABLE`/`NOT_PURCHASABLE`/`CANNOT_TARGET intent`.
- **"Search killed the 15% commission"** — CONTRADICTED (`e6-creators-002` **B**); the intent media it descends
  from never paid a commission (`e1-buyers-007`, `tu:era:3:field:BUYERS`).
- **CONTESTED, keep the hedge:** Meta AI "$60B" is a **run rate**, not a twelve-month actual
  `[e7-targeting-005 B]`; AI-summary click "8% vs 15%" is observational and **Google disputes it**
  `[e7-measurement-004 B]`.

---

## 4. Escalations / research gaps (route to research, not redraft)

1. **The 229 un-named `NOT_*` edges are unmapped.** This sweep read the ~88 in the quarter and the load-bearing
   remainder. A full pull of all 339 with `claim.py` on each origin would likely surface another 20–30
   architect-grade correctives (the `HAS_NEVER_SEPARATED`, `NOT_ACCREDITED`, `RANK_NOT_ESTABLISHED_AGAINST`
   families were only sampled).
2. **Self-edge vs cross-claim.** These are almost all self-annotations. The corpus has **no** L0→L0 edge where
   one *independent* claim contradicts another's *finding* — only bases and framings. That is a feature (no
   internal factual contradictions found), but it means the "opposition web" is a web of *author caveats*, not
   of *warring sources*. State this when handing to an opposition-web architect.
3. **Grade-C load on the buyer pools.** The national-brand/local-retail split (`e5-buyers-010/011`) is
   proxy-derived grade **C** with ±11pp intervals; any buyer-layer spine inherits that width. The corpus flags
   the money-type axis itself as contested (`e5-buyers-014/015` `NOT_DECIDE`).
4. **Anachronism flags to carry:** "surveillance / behavioural targeting," "personalisation" and "psychographic"
   are modern frames. Era-2 targeting was "time slots, maps and mailing lists"; era-6 was "the query, not the
   person."

*This note records provenance and coverage only. No claim in it has been verified. Human verification status: none.*
