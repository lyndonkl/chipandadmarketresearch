# NARRATIVE ARCHITECTURE — the history of the US advertising market

**Narrative Architect, macro pass.** This is the blueprint, not the building. It turns the two discovery
dossiers (S1 + S2) and their 25 notes into a validated narrative architecture: a frozen evidence inventory,
a form verdict, a designing principle and spine, a constraint inventory, a beat map with every beat citing
its claims, and a handoff contract for the scene writer. **No prose is drafted here.** Scene entries are
capped at one tagged line plus construction fields.

**Provenance discipline (non-negotiable).** Records *provenance, not verification.* **No claim has been
verified. Human verification status: none.** Every slot and scene cites L0 claim ids (`e#-…`, `mech-…`) that
resolve to `p2-ad-market/data/{claims.json, eras/era-*.json}`. Grades (A/B/C), hedges and intervals are the
sources' own and are preserved; nothing is hardened. `tu:era:*` are SECONDARY synthesis — re-pull the
backing `e#-` before any number reaches prose. The corpus-flagged **"5-cent bid" (`e6-pricing-005`) is
UNSUPPORTED and is quarantined to DEAD.** Named living parties (Google, Meta, Apple, the judges) are
**surfaced, not adjudicated.**

Machine-readable contract: `architecture.json` (validated). Handoff: `demand-manifest.md`. Ledger:
`evidence-ledger.json`.

---

## 0. Intake and corpus-readiness

- **Medium / length target:** long-form written explanatory piece (reader-paced; the reader can re-read and
  exit). Length is set downstream, but the spiral is designed to scale by adding or dropping whole movements,
  not by padding beats.
- **Audience:** voluntary, mixed-trust, outcome partly known (everyone knows "Google is dominant"; almost
  nobody knows the count was seller-owned before 1914). Lead with the answer; suspense structures are wasted.
- **Corpus count:** ~185-year span (1833→2026); overwhelmingly a **documentary record** — SEC filings,
  census tables, FCC audits, ratings books, court opinions, a historian's spreadsheet. **Nobody wrote down
  the room, the light, the gesture.** Ground-level artefacts for literary scenes are near-absent; the honest
  ceiling is **documentary tableau / telling detail / exhibit.**
- **Coverage receipt:** 8,619 L0 claims exist; this run consulted ~60 load-bearing ids directly (listed in
  `run_header.claim_ids_consulted`) plus the two dossiers' consolidation of ~505 claims. ~140
  TARGETING/BUYERS/MEDIUM claims and ~229 un-named opposition edges were indexed but not exhausted — recorded
  in the omission set, not reported as full coverage.

---

## 1. PHASE 1 — the frozen, outcome-blind fact inventory

The full typed inventory is `evidence-ledger.json` (frame lock, ~60 load-bearing claims with class + causal
tier + preserved hedge, the DEAD column, the omission set). It was built by enumerating what the graph
*contains* at each transaction layer — who counts, prices, admits — **before** the "anomaly" reading was
adopted as the selection rule. It is **frozen**; Phase 2 derives over it and may not add claims to it.

**Frame lock (see ledger for rejected alternatives):**
- **UNIT:** one dated state of *who owns the number* — who counts the audience, sets the clearing price, or
  admits the buyer — at one layer of the ad transaction.
- **DENOMINATOR:** per **layer** of the transaction, not per calendar year and not per medium.
- **WINDOW:** 1833 / 1869–1875 → 2026 freeze.
- **POPULATION:** graded L0 claims that survived sourcing, cross-checked against `verdicts-*.json`.

**Gate verdict:** *This ledger records provenance. No claim in it has been verified. Human verification
status: none.*

---

## 2. Causal triage and the DEAD column

Every load-bearing claim carries a causal tier (L1 mechanism / L2 correlation / L3 sequence / L4 adjacency /
L5 conjecture) in the ledger. Three points that govern the whole architecture:

1. **The overall thesis is L5 synthesis, not an L1 claim.** "The independent number was the anomaly" is the
   architect's reading. It is *supported by* L1 mechanism claims at each layer (the FCC audit, the rGSP
   experiment, the people-meter instrument change) but it is not itself a documented mechanism. It may never
   be written as though the corpus *states* it.
2. **The mechanism claim (T11) is L4.** "A new medium is born un-audited, so the seller counts it first" is
   synthesis over the MEDIUM row plus `e6-medium-006`. Real and load-bearing, but adjacency-grade — do not
   promote to "a new medium *causes* seller capture."
3. **The negative causal edges are gifts, and they are directional.** `e6-creators-002` (NOT_CAUSED_BY
   search), `e6-scale-009` (classified fell with housing, not search), `tu:era:5:event:2` (Google
   DID_NOT_CONTRIBUTE the per-click auction) each *kill* a hardened causal legend. They ship as the story's
   BUTs.

**The DEAD column ships (full list in the ledger).** CONTRADICTED entries **always reach the reader**. These are the legends the corpus kills:
- "the 15% died in the 1980s"
- "search killed the commission"
- "the internet killed classified" (single-cause)
- "advertising marched to the individual"
- "each medium killed the last"
- "TV conquered advertising"
- "Google invented search advertising"
- "search democratised money"
- "self-serve is a platform invention"
- "the middleman's cut was a stable single 15%"
- "there is a single US ad-market total"
- "platforms invented performance advertising"

*Did-not-support* entries may be pruned. They include "the second-price auction died," "AI Overviews cut the
funding click" (**CONTESTED** — ship both values), and "the 130-year subsidy is being broken" (research gap).
They also include the **5-cent bid** and the four dataset-rejected ids (`e2-creators-001`, `e7-medium-003`,
`ds-gdp-001`, `ds-total-001`).

---

## 3. FORM TRIAGE — the refusal gate

Six-question gate applied to the whole corpus as one **system subject** — the US advertising
count/price/admission regime ("the number and who owns it"). This confirms and refines the dossiers' verdict.

| # | Question | Verdict | Warrant (claim ids) |
|---|---|---|---|
| 1 | Single continuous entity, start→finish? | **YES** | the count/price/admission regime, 1833→2026, plus the four-class buyer it judges `[e1-buyers-008 → e6-buyers-008]` |
| 2 | Wants something specific, documented? | **YES (collective)** | an independent/disclosed/auditable number `[e1-measurement-002; mech-adwords-001 "pay the lowest amount possible"]`; and the buyer's own keyed meter `[e6-buyers-008]` |
| 3 | Dated, sourced rupture? | **YES, many** | 1914 · 1946 · 1963–64 · 1987 · 2002 · 2007 · 2019 · 2021 · 2024–25 `[e1-measurement-002, e2-measurement-003, e4-measurement-001, mech-adwords-001, e6-targeting-004, mech-rgsp-001, e7-targeting-002, e7-events-009]` |
| 4 | Continuous action sequence, ≥3 scenes? | **YES** | a dozen+ datable, renderable documentary moments |
| 5 | Evidenced point of insight (behaviour changed after)? | **ABSENT** | reform is *local* per era; no single system-wide self-revelation — confirmed independently by all six S2 digs |
| 6 | Resolution / new stable state? | **ABSENT** | ongoing — the count is still a hole `[e6-measurement-006]`; the take still contested; PMax adoption rising `[e7-buyers-003]` |

**VERDICT: EXPLANATORY NARRATIVE — downgrade-ladder rung 2.** YES to 1–4; **ABSENT on 5 and 6, both
load-bearing.** All-slots-filled would be the fabrication signature. **Not a full Truby story arc.**

**ABT classification: ABT, not DHY.** The corpus multiplies instances of *one* contradiction (the
independent number / denominator / dial / plate was the anomaly) at nine+ layers. It introduces no second
irreducible contradiction, so the material *extends* one spine rather than forking. This is the key
structural result: it licenses a single spiral rather than a braid or a split.

**Consequences for the pipeline (honoured):** `systemic-protagonist` runs (§4). `narrative-arc-mapping` runs
in **explanatory mode** (§6), not as a Truby arc. The four-corner **opposition web is SKIPPED** for the spine
(an explanatory spine has constraints, not corners) — replaced by a constraint inventory (§5); the one place
a web genuinely applies is Thread 3 (market vs state), recorded there. `mcphee-structure-derivation` does the
real structural work (§7), which is the normal case for an analytical corpus with no dramatic engine.

**Anti-narrative check (bias runs both ways).** Refusing every arc over-attributes to structure. The
strongest **agency reading** — *Google/Meta deliberately internalised the count/dial/door/basis to extract
rents* — was considered and **not adopted as the spine.** Reasons: the mechanism is documented as structural
(the count drifted to the vendor in 1946 and 1950 absent any platform intent); the yield constraint is
pre-platform (2% response, 96% unread `[e4-targeting-004, e5-targeting-005]`); the residuals show the honest
number hurting whoever paid for it `[e4-measurement-001, e7-measurement-002, mech-tac-003]`. **Two dated
intentional beats are surfaced, not adjudicated:** AdWords Select's gate-removal (a documented product
decision in Google's own filing) and the 2007 targeting-by-acquisition `[e6-targeting-004]`. Both carry
intent at the beat level while the shape stays structural. Named living parties surfaced, not adjudicated.

---

## 4. SYSTEM PROTAGONIST — the POSIWID character sheet

The protagonist is a **system**: the US advertising count/price/admission regime. Its character is deduced
from behaviour, not rhetoric.

- **Stated purpose (verbatim, per layer):** the pricing layer — advertisers *"pay the lowest amount
  possible"* (AdWords Select launch, 20 Feb 2002, `mech-adwords-001` A); the counting layer — a third-party
  audit, the ABC as the world's first circulation auditor (`e1-measurement-002` B). The market's founding
  disciplines promise an **independent, disclosed, auditable number.**
- **Revealed function:** *the regime reliably converts the party being judged into the party that owns the
  number.* Across ~185 years the seller counts the audience, sets the clearing price, and admits the buyer;
  every independent count/price/gate is a hard-won, temporary exception that reverts to seller ownership.
- **The gap (the dramatic engine):** the disciplines promised independence; the record shows the independent
  number was the ~90-year anomaly and the default is that the judged party owns it.

**Two-regime test (required — passes).** The character sentence holds in ≥2 distinct regimes absent any
shared intent:
- **Regime A — pre-1914 publisher self-counting** (the default): the seller states its own circulation
  `[e1-measurement-002 corrects era-1 self-counting]`.
- **Regime B — 2002+ platform self-count** (the reversion): the seller records the impression, runs the
  auction, validates the click, bills its own log `[e6-measurement-006, e6-measurement-001]`.
- **Regime C — the reform interlude** (1914–2004 audit; 1946 vendor transfer) shows the anomaly and its
  decay `[e1-measurement-002, e2-measurement-003]`.
Same trait, three operating conditions, ~130 years apart — not a description of one episode.

**Residual — outcomes the revealed function FAILS to explain (mandatory; blocks the malign-optimiser and
fatalist readings; all reach the reader):**
1. **1987 people meter** — the honest count *hurt* the seller (CBS/ABC −13%). A "seller inflates its own
   count" function does not predict a seller adopting an instrument that cut its own numbers `[e4-measurement-001]`.
2. **2021 MRC** stripped Nielsen's accreditation — the surviving auditor *bit the incumbent* `[e7-measurement-002]`.
3. **Take-rate reversal** — the syndicated ratchet fell 24.7%→21.3% (2006–08); a pure maximizer would not
   let the rate fall `[mech-tac-003]`.
4. **Bok 1892** — *Ladies' Home Journal* refused patent-medicine revenue; a "maximise advertiser payment"
   function does not predict a seller destroying its own inventory `[tu:era:1:event:4 — event node, no L0
   number]`.
5. **Direct-mail exclusion cuts both ways** — over-booked as national in the Coen era, excluded in 2025; not
   a consistent "seller inflates" direction `[e7-scale-006]`.

**Climax type (systems have no showdown):** the closest legitimate peak is **LEGIBILITY** — the
stated/revealed gap becoming court-documented (Mehta FOF, 2024; `mech-knobs-001`, `mech-rgsp-001`). But it
fails the transfer-function test at the *system* level (the same inputs still produce the same outputs; the
count is still a hole), which is exactly why the form is explanatory, not dramatic. **No climax slot is
filled** — see §6.

**One reform that partially worked (required, or the piece becomes fatalism):** ABC 1914 built a genuine
45-year third-party count `[e1-measurement-002]`; the postwar station boom genuinely deconcentrated the
sellers `[e2-sellers-006]`; the MRC genuinely bit in 2021 `[e7-measurement-002]`. The state *relocates* and
*ceilings*, and independent counts *have* been built — the system is not unreformable.

---

## 5. OPPOSITION — the constraint inventory (web skipped per form verdict)

The four-corner opposition web is **skipped** for the spine. The protagonist is a system, so corners become
constraints. And the corpus's 339 opposition edges are **self-guards** — a claim wiring "do-not-read-this-as-X"
inside its own statement, **not independent claims warring.** A query confirms it: all 110 named edges have
`a.origin == b.origin == r.origin`. There is **no L0→L0 edge where one independent claim contradicts
another's finding.** State this to any opposition-web architect. The corpus opposes *framings and bases*, not
each other's facts.

**Central problem, as one question the piece re-enters:** *Who should own the number — the party being
judged, or an independent third party — and who pays for the independence?* It has more than one defensible
answer, which is why it recurs rather than resolving.

**Constraint inventory (the correctives that must reach the reader as BUTs):**

| Slot | Filled by | Type | Evidence |
|---|---|---|---|
| **B — the binding constraint** | the **economics of counting**: whoever funds the count controls it, and the cheapest place to put the counter is inside the seller | CONSTRAINT (documented carriers: tripartite ABC funding → buyer-committee CAB → vendor Hooper → seller platforms) | `e1-measurement-002, e2-measurement-003, e6-measurement-006` |
| **C — the re-separator** | the **state**: relocates (1943, 1984), ceilings (1954), names unlawful with remedy pending (2025) | CONSTRAINT with carriers (FCC, DOJ, Brinkema, Mehta, MRC-via-threat) — *relocates or ceilings, rarely breaks* | `e2-events-006, e3-sellers-002, e4-sellers-004, e7-events-009` |
| **D — the environmental shock** | the **postwar station boom**, the one genuine deconcentration the state licensed but did not design | ENVIRONMENT (evidenced) | `e2-sellers-006` |
| **E — the birth motor** | the **measurement vacuum**: a new unit is born before any third party can count it | CONSTRAINT / mechanism (L4) | `e6-medium-006` |

**The one genuine four-corner web (Thread 3 only, market vs state).** Four corners, each a documented position:
- **A — the market** (driver): it builds concentration by capital, not a better product `[e6-sellers-001, mech-aol-001]`.
- **B — the state** (constraint with carriers).
- **C — the supply shock** (environmental) `[e2-sellers-006]`.
- **D — the capture skeptic**: concentration ≠ capture, and the pie is shrinking `[e2-scale-004 vs e7-scale-002]`. The remedy is *not* deconcentration on this record — the Chrome divestiture was declined 2025-09-02, and Brinkema's remedy is pending.

Warrant tier: the state's 1943 divestiture order is *directed action against RCA's structure*. So state↔market
technically clears competition + awareness + directed-action. But it is framed as a **constraint with
carriers**, never a villain. The state does not *want* the market's goal; it bounds it.

**Exposure escalation (surfaced for human decision, not adjudicated here):** Google, Meta, Apple and the
sitting/recent judges (Mehta, Brinkema) occupy adverse structural positions built from court findings and
SEC filings. A party that gave testimony consented to testimony, not to a structural role. **Hand the framing
decision to a human before publication.**

---

## 6. BEAT MAP — the 22-step triage in explanatory mode

`narrative-arc-mapping` runs in **explanatory mode** (form is EXPLANATORY, not STORY). The moral-argument
spine returns **"no moral argument available; this is an explanatory piece"** — the load-bearing actor is a
pricing/counting mechanism, not a moral agent. Forcing a villain here would manufacture sanctimony. The 22
steps are triaged PRESENT / ABSENT / NOT APPLICABLE; **the ABSENTs are the healthy signature.**

| # | Step (system variant) | Status | Warrant / reason |
|---|---|---|---|
| 1 | Weakness & need (structural fragility) | **PRESENT** | the economics of counting — whoever funds the count controls it `[e1-measurement-002]` |
| 2 | Ghost (prior wound) | ABSENT | no single origin wound; the default predates the record |
| 3 | Desire (collectively pursued goal) | **PRESENT** | an independent/disclosed/auditable number `[mech-adwords-001, e1-measurement-002]` |
| 4 | Opponent (competing force) | **PRESENT (as constraint)** | the economics of counting; the state as re-separator `[e2-events-006]` — no party villain |
| 5 | Fake-ally opponent | N/A | analytical domain; legitimately absent |
| 6 | Changed desire / motive | ABSENT | the desire (an honest number) is constant across eras |
| 7 | First revelation & decision | **PRESENT** | ABC 1914, the third-party count established `[e1-measurement-002]` |
| 8 | Plan (dominant approach) | **PRESENT** | third-party audit + disclosed 15% + recognised-agency gate `[e1-measurement-002, e4-pricing-001]` |
| 9 | Opponent's plan / counter | **PRESENT (as mechanism)** | the count reverts to whoever funds it `[e2-measurement-003]` |
| 10 | Drive (escalating layers) | **PRESENT** | the spiral: counts → takes → instrument → buyer → price → concentration → unit → basis (§7) |
| 11 | Attack by ally | N/A | no ally structure in a system |
| 12 | Apparent defeat | ABSENT | there is no single defeat; setbacks are per-era |
| 13 | Second revelation | **PRESENT** | 1987 people meter — the instrument, not the audience `[e4-measurement-001]` |
| 14 | Audience revelation | N/A | no dramatic audience |
| 15 | Third revelation | **PRESENT** | the neutral auction was a governed price, court-documented 2024 `[mech-rgsp-001, mech-knobs-001]` |
| 16 | Gate / gauntlet / visit to death | N/A | "most moveable step"; legitimately absent |
| 17 | Battle (decisive contest) | **ABSENT** | *stop-work-worthy in a Truby arc, correct here.* No single battle; the 2024–25 rulings are the nearest thing and were not treated as pivotal for the whole regime at the time — **DOWNGRADE** |
| 18 | Opponent's self-revelation | N/A | a constraint has no interiority |
| 19 | Self-revelation (system) | **ABSENT** | Q5 — no system-wide behaviour change with a source; reform is local — **DECLARE** |
| 20 | Moral decision | N/A | explanatory mode; no moral agent |
| 21 | Thematic revelation | **PRESENT** | the independent number was the anomaly — enacted, never narrated (L5) |
| 22 | New equilibrium | **ABSENT** | Q6 — ongoing; the "reversion" is a state, not a resolution — **DOWNGRADE** |

**Mandatory-seven check:** Weakness ✓, Desire ✓, Opponent (constraint) ✓, Plan ✓, **Battle ABSENT**,
**Self-revelation ABSENT**, New equilibrium ABSENT. Three of the mandatory seven are ABSENT — this is the
signature that the material is genuinely explanatory, not a story wearing an arc.

**The movements (spiral passes) — the actual beat map.** Each movement re-enters *who owns the number?* at a
deeper layer, in rough chronological order, and carries its corrective BUT and its residual. This is the
slot list the scene writer builds against (mirrored 1:1 in `architecture.json`).

| Slot | Movement (layer) | Anchor claims | The BUT (corrective) | Residual / guard |
|---|---|---|---|---|
| **s0** | **OPENER + nut graf** — the number-shaped hole | `e6-measurement-006`, `e1-measurement-002`, `e4-pricing-001` | Google publishes the *rate*, never the *count* | thesis is L5 synthesis, not a corpus statement |
| **s1** | ORIGIN: who knows the price (Ayer, the disclosed 15%) | `e4-pricing-001`, `e2-creators-002`, `e3-creators-001` | the 15% is the *disclosed top plate*, not the whole cut | 1875 Ayer primary artifact ABSENT (s-D) |
| **s2** | ORIGIN: who counts (ABC 1914) | `e1-measurement-002` | 1914 *corrected* era-1 self-counting — the anomaly begins here | independent count = ~90-yr anomaly |
| **s3** | REVERSION #1: the count goes to the vendor (1946) | `e2-measurement-003`, `e2-measurement-008` | Hooper ran ~20% above CAB — inflated toward the paying side | auditor-of-the-counter born under threat (Harris→MRC) |
| **s4** | THE STACK: how many hands take the cut | `e2-sellers-002`, `e2-creators-002`, `e2-pricing-002`, `e3-pricing-003`, `e3-pricing-002` | the cut was a 3–4 hand stack; only the smallest plate was public | Mutual kept 3.5%, published no card; affiliate share *rose* |
| **s5** | MYTH-BUSTER: did the 15% die? | `e4-pricing-001`, `e3-creators-002`, `e6-creators-002` | mix collapsed, *rate* held; the decline is a **NOT_CAUSED_BY** search edge | 1956 decree struck *enforcement*, commission peaked at 71% in 1982 |
| **s6** | THE INSTRUMENT, not the audience (1987) | `e4-measurement-001` | nothing about the audience changed, only the instrument | **residual: honest count hurt the seller** |
| **s7** | THE BUYER'S METER (demand side, 150 yrs) | `e6-buyers-008`, `e1-buyers-008`, `e3-buyers-001` | the direct-response buyer never accepted the seller's audience count | most-wanted independent number → least-independent (click-fraud unadjudicated) |
| **s8** | THE FRONT DOOR: who is admitted, who collects the rent | `e6-buyers-005`, `e3-buyers-004`, `e3-medium-011`, `e1-buyers-007` | heads democratised, **dollars did not**; the commission-free door is 90+ yrs old | the state slammed the door twice (1906, 1971) |
| **s9** | THE DIAL: the buyer gives back the target | `e3-targeting-005`, `e4-targeting-004`, `e5-targeting-004`, `e7-buyers-003`, `e7-targeting-002` | the march was to the **countable** unit, not the person; the query was identity-free | PMax endpoint is grade C — **never the climax**; ATT = state re-separates |
| **s10** | THE GOVERNED PRICE: who sets the clearing price | `mech-adwords-001`, `e5-pricing-004`, `mech-rgsp-001`, `mech-knobs-001`, `mech-mehta-004` | "pay the lowest amount possible" was a *governed* price; Overture was pure first-price | **residual: take-rate reversal** `mech-tac-003` |
| **s11** | THE STATE MOVES THE TOP OF THE STACK (braided) | `e2-events-006`, `e3-sellers-002`, `e4-sellers-004`, `e7-events-009`, `mech-mehta-004`, `e2-sellers-006`, `e6-sellers-001` | the market *built* it by capital; the state only *moved* it | remedy is **not** deconcentration on this record |
| **s12** | THE UNIT IS BORN UN-AUDITED (the MECHANISM) | `e6-medium-006`, `e2-medium-006`, `e4-medium-002`, `e7-medium-001` | each medium did **not** kill the last; shares moved glacially | the historian's own instrument goes blind at 2008 |
| **s13** | THE DENOMINATOR WAR (the basis) | `e2-medium-004`, `e7-scale-006`, `e2-scale-004`, `e2-scale-005`, `e7-scale-002` | every "share of advertising" is a claim about a **basis**, not a fact | non-commensurable caveat non-removable; direct mail written out 8× |
| **s14** | CLOSER: the reversion, stated | `e7-measurement-005`, `e6-measurement-006`, `e7-events-008`, `e7-targeting-004` | the platform era = the pre-1914 condition at scale, no backstop | AI-box click is **CONTESTED** (Google disputes Pew); return to the hole |

**ABSENT slots (declared, never filled):**

| Slot | Name | Move | Reason |
|---|---|---|---|
| **s-PI** | point_of_insight (Q5) | DECLARE | no single system-wide self-revelation; reform is local per era |
| **s-RES** | resolution / new equilibrium (Q6) | DOWNGRADE | ongoing; the reversion is a state, not a resolution |
| **s-OPP** | opponent as a party | REDESIGN | system subject → substitute the constraint "economics of counting"; no named villain |
| **s-BAT** | decisive battle (step 17) | DOWNGRADE | no single battle; nearest thing (2024–25 rulings) not pivotal for the whole regime at the time |
| **s-AYER** | 1875 Ayer disclosed-price scene | DECLARE (research) | no primary artifact (open contract / ledger / client letter) exists in the corpus |
| **s-SUB** | the "subsidy break" measure | DECLARE (research) | no corpus measure of publisher revenue dependence on search referral |

---

## 7. STRUCTURE — the McPhee derivation

**Dual sort.** Sort A (strict chronology) and Sort B (strict theme) were run over the movement cards.
Disagreement log (the material ones):
- *Chronology puts the 1938 FCC 73/27 audit early; theme files it with the programmatic stack (2020s).*
  **Resolved to chronology**, with the stack read as a dated inset — the 73/27 plate appears once, in s4,
  and s11 (concentration) references it rather than re-showing it (**SB2 overlap resolved**).
- *Theme wants all "denominator" cards together up front; chronology scatters them 1900→2025.* **Resolved to
  theme as a dual-profile** on one denominator ("advertising as a share of X"), because the meaning lives in
  the 1922-vs-2025 contrast, not in either date alone — this is s13, and it is the one movement where theme
  legitimately beats chronology. Denominator: *"advertising's share of a base."*
- *The opener.* Chronology would open at 1833; the reader arrives knowing the platform present. **Resolved to
  a late chronological entry with one flashback** — open on the near-present number-shaped hole (s0), then
  re-enter at the origins (s1–s2). **Named re-entry point:** the ABC audit of 1914 (s2).

**Named shape: SPIRAL over chronology.** The same question — *who owns the number?* — re-entered at widening
layers (price → count → take → instrument → buyer → clearing price → concentration → unit → basis), the
reveals deepening toward the platform reversion. **Runner-up: braided / mosaic gathering** across the twelve
threads sharing the verb *"owns / counts / prices / bases the market."* Runner-up lost because the argument
is **recurrence at deepening layers, not parallel independent nodes**; the braid is the honest fallback if
the grade-B/C evidence at the edges (the era-7 surrender, the buyer pools, the denominator wedge, all C)
proves too thin to carry a single load-bearing spine.

**Invisibility test:** no roadmap sentences ("this piece has three parts"). The spiral's re-entries are felt
as *the same question getting worse*, not announced. If a reader can recite the structure after one read,
delete signposting.

**Shape contract (immutable within a draft):** SPIRAL; runner-up braided-mosaic; flashback = s0→s1 with
re-entry at s2 (1914); the one theme-over-chronology break = s13 (dual-profile on the denominator); the
contradicting-card list = the DEAD column, which appears in the body. Changing the shape mid-draft requires
a logged restart and a `spine_version` bump.

**Juxtaposition (footnote gate).** One load-bearing juxtaposition survives: **s2 beside s0** — ABC 1914
(the third-party count established) placed against Google 2008 (the seller counts its own log). The implied
inference — *the market ended up where it started, minus the backstop* — is one I would state and footnote,
so it stays; it is the spiral's spine made visible once. All other adjacencies are separated in the text.

---

## 8. FALLACY SWEEP (retrospective / inevitability / survivorship / proportion / omission)

- **Retrospective slot audit.** The "reversion" and "anomaly" frames are hindsight synthesis (earliest-
  significance date is after the outcome). **Disclosed in the body:** the piece states that *the independent
  number was the anomaly* is the architect's reading, evidenced across regimes (1946 and 1950 drifted the
  same way absent platform intent) but not a claim any single source makes. The people-meter and rGSP slots
  are contemporaneous L1 mechanism — those carry their causal weight.
- **Inevitability audit.** Banned constructions refused throughout: no "each medium inevitably captured the
  market" (CONTRADICTED, ships), no "search was bound to kill the commission" (NOT_CAUSED_BY, ships), no
  "the auction naturally standardised." **Forecast-vs-outcome beat (required):** the 1987 people meter —
  nobody predicted the honest count would cut the seller's own numbers `[e4-measurement-001]`; and the
  take-rate reversal, where a pure-maximizer forecast fails `[mech-tac-003]`.
- **Overshoot check.** The piece keeps a small number of *confident* L1 causal claims (the FCC audit
  established the 73/27 split; the people meter changed the instrument; rGSP raised CPC and advertisers
  cannot opt out) each carrying its counterfactual — it does not dissolve into hedge fog.
- **Survivorship / graveyard.** The corpus selection rule is stated: *claims that survived sourcing and
  grading.* The denominator layer (s13) is itself a survivorship finding — direct mail survived as data
  per-piece from 1904 yet was written out of the totals; the strongest counter-evidence to any "share"
  statistic is surfaced, not buried.
- **Proportion.** Grade-A load-bearing numbers (FCC 73/27, census commission rates, rGSP, DoubleClick,
  internet revenue, ABC) carry the weight. **Flagged:** the era-7 "surrender" (PMax 71%, `e7-buyers-003` C),
  the $148B wedge (`e7-scale-006` C), the 1.32%-of-GDP trough (`e7-scale-002` C) are grade C and **must not**
  out-weigh their grade — none is placed at a load-bearing peak, and s9 explicitly forbids the PMax endpoint
  as a climax.
- **Omission.** The omission set (in the ledger) records the ~140 unsurfaced quarter claims and the ~229
  un-named edges with a reason; none is known to weaken the spine.
- **Agency reading (required):** stated in full in §3 — considered, not adopted; two intentional beats
  surfaced.
- **Hedge budget.** The apparatus is real (commensurability caveat, grades, run-rate-vs-actual, "alleged").
  The **spiral distributes the hedges across movements** — the non-commensurability caveat travels only with
  s13, the read-vs-mailed guard only with s9, "alleged" only with s6/s14 — rather than concentrating them.
  That is the architecture responding to the budget, not spending more of it. **If a drafter finds the hedge
  budget binding in any single movement, that is an escalation to redesign the movement, not to add caveats.**

---

## 9. HYPOTHESIS DIFF, CONTINGENCY REGISTER, EMPTY-SLOT LOG

**Hypothesis diff.**
- **Before (dated, pre-derivation):** each new medium captured the market from the last, culminating in a
  novel platform crisis Google/Meta engineered to extract rents.
- **After:** the judged party owning the number is the **default**; the independent count/price/gate was the
  ~90-year **anomaly**; the platform era is a **reversion** to the pre-1914 condition at scale with no
  enforceable backstop, driven by a structural birth-motor (every new unit born un-audited), not a scheme.
- **What changed:** the frozen inventory put the seller owning the count *before* 1914 and *again* after
  2002, with residuals (1987, 2021, take-rate reversal, Bok 1892) where the honest number hurt whoever paid
  for it — which the agentic hypothesis cannot accommodate. **What did *not* change is worth suspecting:**
  the dossiers already carried the "anomaly" reading, so this architecture inherits rather than discovers it;
  the guard is the residual list and the DEAD column, both of which resist the tidy version.

**Contingency register (roads the record shows were live, kept as bounded elements, never dramatised):**
- Overture *chose* a gated, editorially-reviewed door when it could have opened first `[e5-buyers-002]` — the
  number-hole is a Google-era artefact, not the market's nature.
- The 1943 third network came from *antitrust*, not technology `[e2-events-006]` — the concentration was
  contingent on a state act.
- The commission mix could have collapsed on search's schedule; the record shows it collapsed on the
  1991–94 unbundling instead `[e6-creators-002]`.

**Empty-slot log (move chosen for each):** s-PI DECLARE · s-RES DOWNGRADE · s-OPP REDESIGN (→ constraint) ·
s-BAT DOWNGRADE · s-AYER DECLARE + RESEARCH · s-SUB DECLARE + RESEARCH. **Budget:** zero INFERRED slots
(the thesis is L5 synthesis with evidence, not an inference filling an empty slot); six ABSENT. All-slots-
filled would be the fabrication signature; six honest absences mark a real architecture.

---

## 10. HANDOFF CONTRACT — what the scene writer must preserve

Full machine contract in `architecture.json` (validated); full manifest in `demand-manifest.md`. The
load-bearing preservation rules:

1. **Epistemic strength is fixed per claim.** Grades A/B/C, "alleged," "reported," "run rate," CI intervals
   travel verbatim. Never harden "was associated with" to "caused," a grade-C vendor panel to a fact, or a
   growth rate to a count.
2. **`tu:era:*` numbers are re-pulled** from the backing `e#-` before they reach prose.
3. **The DEAD column reaches the reader.** Every CONTRADICTED entry ships as a corrective; "AI Overviews cut
   the click" ships as **CONTESTED** with both values, never hardened.
4. **The 5-cent bid is dead.** Ship the two-doors contrast (s9/s10) without it.
5. **Scene-able vs summary.** Only the documentary tableaux (s0 opener, the two doors, the DoubleClick deals,
   Noble/NBC Blue, the 73/27 audit, "Butternut Squash") carry scene-grammar from an artifact a source
   records. Everything else is **exhibit or telling detail**. **No invented sensory detail** — no last spot
   on Carson, no clerk at a mail bench, no glow of a monitor.
6. **Representativeness is assigned here, not downstream.** Load-bearing positions (opener s0, closer s14)
   carry median/tail/unique labels in the contract; the DoubleClick deals are flagged **tail** (largest of
   the year), Day's penny Sun **unique** (the inventor).
7. **Two guards travel with any number that crosses them:** the basis guard (every share names its rail; the
   Coen↔MAGNA splice is non-commensurable; the biggest uncounted thing is direct mail) and the read-vs-mailed
   guard (15.9%-on-read must not be compared to 2%-on-mailed).
8. **Named living parties are surfaced, not adjudicated** — routed to human decision.
9. **A spine change is legal but never local:** bump `spine_version`, invalidate the draft, re-pass from the
   scene weave down.
10. **The return channel is open.** A beat with no supportable detail, a middle-rung trap with no particular,
    or a claim that cannot be written without exceeding its tier is an **escalation object** (layer:
    architecture or reporting), not a licence to invent.

---

*This architecture records provenance and structure only. No claim in it has been verified. Human
verification status: none.*
