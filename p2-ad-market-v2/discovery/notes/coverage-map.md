# Coverage map — the discovery, mapped (writing assistant)

**Role:** Writing Assistant, keeping the team honest and mapping the territory. **Not an article.**
This note reads the full discovery corpus (`00-survey`, `breadth-0..3`, `picks`, `deep-1..6`, `L3-themes`)
and answers three questions for the next session: **what is well-grounded, what is thin, and what promising
ground is still unexplored** — with the exact queries to go get it.

**Skills applied as lenses:** `writing-structure-planner` (inverted-pyramid + coverage-matrix structure),
`mapping-visualization-scaffolds` (the era×field grid + depth matrix below).

**Provenance / honesty statement:** I hold no Bash access this session, so I could not run `q.py`/`claim.py`.
I verified citations by grepping the frozen source of truth instead — `p2-ad-market/data/claims.json`,
`eras/era-*.json`, `mechanism*.json`, and `verification/verdicts-era-*.json`. Eight load-bearing claim ids
were pulled and matched to the notes verbatim (audit in §6). **No claim here is human-verified;** grades and
hedges are the corpus's own and are preserved.

---

## 1. Verdict at a glance (for the busy next session)

- **6 threads are DEEP and well-grounded** — each has a full ledger walked L3→L0, an ABT, a form verdict, a
  DEAD column, and A/B-grade anchors. These are ready for architecture, not more discovery. (deep-1..6.)
- **6 runner-up threads are THIN** — surfaced by name and one or two claim ids, never drilled. Real material,
  no ledger yet. (picks.md R1–R6.)
- **The single largest unexplored vein is inside the corpus's own armature.** The `tu:era` grid is 7 eras ×
  8 fields. Five field-rows are exhausted by the deep dives; **three rows — TARGETING, BUYERS, MEDIUM — hold
  ~140 graded claims and 21 field summaries that no deep dive has read.** That is where the next session should go.
- **Three whole discovery *vectors* were never run** (they need Bash/`q.py`): the full opposition-edge sweep,
  the L1 hub/degree sweep beyond the top 3, and the entire L2 theme-to-theme meta-graph (`LIFTED {layer:2}`).
- **One integrity seam found:** a rejected claim keeps its original grade inside `era-*.json`. Rejection lives
  only in `verdicts-era-*.json`. Cross-check every id before use (§6).

**Legend:** ██ drilled to a ledger · ▓▓ touched (≥1 cited claim, no ledger) · ░░ unread this session.

---

## 2. Depth map — the 6 well-grounded threads (DONE; hand to architecture)

Each traces to a deep note; "best anchor" is the hardest-graded load-bearing claim I re-verified or that the
note grades A.

| # | Thread | Deep note | Form verdict | Best anchor (grade) | State |
|---|---|---|---|---|---|
| 1 | Who counts the audience (measurement legitimacy, 1869→2026) | deep-1 | EXPLANATORY / spiral, systemic protagonist | `e6-measurement-006` A (Google discloses paid-click growth, never absolute count) | ██ solid; 4-state spiral, residuals kept (1987 people-meter, 2021 MRC bite) |
| 2 | The 15% that would not die (commission, 1841→2016) | deep-2 | EXPLANATORY / myth-buster | `e4-pricing-001` A (rate held ~14% to 1992); `e6-creators-002` B NOT_CAUSED_BY search | ██ solid; rate-vs-mix split is the keystone |
| 3 | The state moves the top of the stack (concentration, 1938→2025) | deep-3 | GATHERING / braided | `e2-sellers-002` A (networks kept 73%); `mech-knobs-001` A | ██ solid; "moved not broken" correction holds |
| 4 | The loss-leader that built free media (1833→2026) | deep-4 | GATHERING / dual-profile | `e1-sellers-003` A (ad = 64.9% of newspaper income, 1914) | ██ solid; "transfer not collapse" — do NOT harden the AI break |
| 5 | The neutral auction was a governed price (2000→2024) | deep-5 | EXPLANATORY / mechanism | `mech-rgsp-001` A, `mech-knobs-001` A | ██ solid; "governed all along" beats "three deaths" |
| 6 | Capture, not expansion — ad-intensity paradox (1922→2025) | deep-6 | EXPLANATORY / governing thesis | `e2-scale-004` B (3.0% of GDP, 1922, series max) | ██ solid; commensurability caveat must ship |

**Braids already derived (don't re-derive):**
- 2+3 both instance "the state removes enforcement, the practice persists."
- 1+4+5 all touch the era-7 measurement/AI shock.
- 1↔5 share the seller-controls-the-instrument frame. Split them cleanly: who *counts* vs how *price* is set.
- 3+5+6 all lean on the 2024–25 DOJ rulings and the `tu:era:7:boundary` "remedy pending" hedge.

---

## 3. The armature heatmap — the map that shows where to dig (mapping scaffold)

The corpus's ready-made spine is `tu:era:N:field:X` = 7 eras × 8 fields, each a synthesis `summary` over
graded `e#-` claims (confirmed by structure: all 7 era JSONs carry all 8 field keys, 56 cells total). Reading
a field *down* the eras is an instant cross-era through-line. Here is which cells the discovery has drilled:

```
FIELD →      SCALE  PRICING  MEASURE  SELLERS  CREATORS | TARGETING  BUYERS  MEDIUM
             (T6)    (T5)     (T1)     (T3)     (T2)     |
era1  ██      ██      ██       ██       ██       ██      |    ▓▓        ░░      ▓▓
era2  ██      ██      ██       ██       ██       ██      |    ▓▓        ░░      ░░
era3  ██      ██      ██       ██       ██       ██      |    ░░        ▓▓      ░░
era4  ██      ██      ██       ██       ██       ██      |    ░░        ░░      ▓▓
era5  ██      ██      ██       ██       ██       ██      |    ░░        ░░      ▓▓
era6  ██      ██      ██       ██       ██       ██      |    ▓▓        ▓▓      ░░
era7  ██      ██      ██       ██       ██       ██      |    ▓▓        ▓▓      ░░
             \_____________ 5 rows exhausted by deep-1..6 ____________/  \__ the unexplored quarter __/
```

**Read this:** the left five columns are done. The right three columns — **21 field summaries and ~140 graded
`e#-(targeting|buyers|medium)-*` claims** — are the largest coherent block of unread, pre-woven, cross-era
material in the corpus. Every ▓▓ is a claim already surfaced somewhere in the notes; every ░░ is unread.

---

## 4. Thin threads — surfaced, never drilled (candidates for the next deep dive)

From `picks.md` runner-ups. Each has a seed claim id; none has a ledger. Ranked by promise.

| # | Thin thread | Seed anchors (grade) | Which armature row it lives in | Why it's worth a dive |
|---|---|---|---|---|
| R4 | **The addressable base: title → household → person → person-opts-out** | `e2-targeting-005` B (radio 40.3%→83%→95%); `e7-targeting-002` B (ATT opt-in ~16→25%); `tu:era:1:field:TARGETING`; `tu:era:6:field:TARGETING` ("the query, not the person") | TARGETING (all 7 eras) | A precision unit tracked 150 years, each step quantified. Cleanest unexplored cross-era spine. Overlaps T1/T5 but has its own axis (who is addressable). |
| R1 | **Intent money migrates across five media** (classified→direct mail→Yellow Pages→search) | `e3-scale-010` B (classified $377M→$2,159M); `tu:era:4:field:MEDIUM` (direct mail $4.79B→$27.27B); `tu:era:6:field:BUYERS` ("long tail of plumbers"); `e5-scale-016` C (the filing-rule flip) | MEDIUM + BUYERS | Cross-era, quantified, a real demand-side migration; the corpus flags direct mail as the second medium the totals write out (Thread 8 in the survey). |
| — | **The buyer class removed by the state, overnight** | `tu:era:3:field:BUYERS` (cigarettes ~$225M/yr banned from air 2 Jan 1971); `tu:era:1:event:6` (patent medicine, Pure Food & Drug 1906) | BUYERS | A recurring "a whole category of demand is legislated out" beat. Pairs as a corrective inside Thread 3. Not yet a spine. |
| R2 | **A price rule invented the soap opera** | `tu:era:2:field:TARGETING` (daytime hour = half price + women-at-home) | TARGETING | Vivid, clean causal — but one beat. Best as a scene *inside* Thread 1, not a standalone (form-triage: single beat). |
| R3 | **The wartime tax subsidy** (state paid ~80% of an ad dollar) | `e2-events-005` C (deductible ad dollar cost ~20¢ after tax, CI80 [0.10,0.28]) | (event, not a field row) | Surprising, quantified, one grade-C beat. A sidebar, verified to exist (§6). |
| R5 | **"How we know what we know" — dataset integrity as a register** | `e5-medium-006` B (the 177% splice that didn't happen); `e5-scale-016` C (ranking flips on Yellow Pages filing); `tu:era:1:boundary` (Wanamaker "attributed legend") | (meta / boundary nodes) | Not a spine — a framing register the piece can wear. Already partly stocked by Threads 1 and 6. |
| R6 | **Vivid single actors for scene-work** | `e5-creators-004` B (marchFIRST, $437M loss on $369M sales); `mech-default-003` B (Apple/Safari 36%); `tu:era:3:event:3` (Interpublic modelled on GM, 1961) | (scene inventory) | Scenes, not spines. Keep as a casting sheet for the scene writers. |

---

## 5. Unexplored territory + the exact next queries (the payload)

Five concrete digs, each with a copy-paste query. Bash-required queries are marked **[Bash]**; grep fallbacks
(this session's method) are marked **[grep]** so a Bash-less session can still work.

### 5.1 The under-drilled armature rows — TARGETING / BUYERS / MEDIUM (highest value)
The 140 unread graded claims behind the ▓▓/░░ quarter of the grid.
- **[Bash]** pull every claim in the three rows, oldest first:
  ```
  q.py "MATCH (c:L0:Measurement) WHERE c.origin =~ '.*-(targeting|buyers|medium)-.*' RETURN c.origin, c.name, c.central, c.claim_unit, c.about_year, c.grade ORDER BY c.about_year"
  ```
- **[Bash]** read the 21 field summaries as three cross-era through-lines:
  ```
  q.py "MATCH (t:L3)-[:PARENT_OF*3]->(c:L0) WHERE c.origin CONTAINS '-targeting-' RETURN DISTINCT c.origin, c.clause LIMIT 80"
  ```
- **[grep]** Bash-less fallback (confirmed to work this session — 140 hits across the 7 era files):
  ```
  grep -nE '"id": "e[1-7]-(targeting|buyers|medium)-[0-9]+"' p2-ad-market/data/eras/era-*.json
  ```
  then read each field's `summary` block in `era-*.json` (field keys: `TARGETING`, `BUYERS`, `MEDIUM`).
- **Start with TARGETING** (R4, the addressable-base spine) — it is the most complete cross-era arc and the
  clearest unexplored candidate for a deep dive.

### 5.2 The full opposition-edge sweep (the corpus's built-in anti-narrative guards) **[Bash only]**
Only ~10 opposition edges are cited across all notes; the total is unknown because oppositions live in Neo4j,
not the JSON (grep of the era files returns **0** — they are graph relations, not stored strings). Count them,
then list them:
```
q.py "MATCH (a:L0)-[r]->(b:L0) WHERE type(r) IN ['EXCLUDES','NOT_CAUSED_BY','CONFLICTS_WITH','NOT_SAME_AS','DID_NOT_CONTRIBUTE','RECONCILED_WITH','CONTRASTS_WITH'] RETURN type(r), count(*) ORDER BY count(*) DESC"
q.py "MATCH (a:L0)-[r]->(b:L0) WHERE type(r) IN ['EXCLUDES','NOT_CAUSED_BY','CONFLICTS_WITH','NOT_SAME_AS','DID_NOT_CONTRIBUTE','RECONCILED_WITH','CONTRASTS_WITH'] RETURN a.origin, a.name, type(r), b.name, b.origin, r.origin"
```
Every uncited edge is a candidate corrective/BUT the architects have not seen. This is the single highest-yield
Bash query for a future session.

### 5.3 The L1 hub sweep beyond the top 3 **[Bash only]**
Only Google (deg 183), Direct mail (63), Overture (60) were surfaced (deep-5). Ranks 4–40 are unread — they
are the load-bearing actors/measures with no thread yet:
```
q.py "MATCH (n:L1)-[e:LIFTED {layer:1}]-(:L1) RETURN n.name, n.grain, count(e) AS degree ORDER BY degree DESC LIMIT 40"
```
Then trace any surprising hub down: `q.py "MATCH (n:L1 {name:'<hub>'})-[:PARENT_OF]->(c:L0) RETURN c.origin, c.clause LIMIT 40"`.

### 5.4 The entire L2 theme-to-theme meta-graph **[Bash only]**
The breadth sweeps and deep dives all went L3→L0. The **L2 layer (2,277 kinds) and its `LIFTED {layer:2}`
meta-graph were never navigated as a graph.** How two themes relate is unmined:
```
q.py "MATCH (a:L2)-[e:LIFTED {layer:2}]->(b:L2) RETURN a.name, e.type, b.name, e.weight ORDER BY e.weight DESC LIMIT 60"
```
This can surface cross-theme bridges the L3→L0 walks structurally cannot see.

### 5.5 The measurement-quantified-shift queries (unused entry point)
QUERY-PACK offers a "measure that moves across years" entry the notes never systematically ran:
```
q.py "MATCH (c:L0:Measurement) WHERE c.central IS NOT NULL RETURN c.origin, c.name, c.central, c.claim_unit, c.about_year, c.grade ORDER BY c.name, c.about_year"
```
Sorting every measurement by name-then-year exposes any series with a large delta — a fast way to find a
quantified arc no thread has claimed.

---

## 6. Honesty audit — keeping the team honest

**Spot-checks (8/8 verified against `claims.json`/`eras`/`mechanism.json`, statements match the notes):**

| Claim id | Notes say | Corpus says (verbatim, abridged) | Grade | Verdict |
|---|---|---|---|---|
| `e6-creators-002` | commission mix 61%(1994)→~10%(2003), "not the arrival of search" | exact match; source Horsky & Zeithammer UCLA WP 2021 | B | ✅ matches |
| `mech-knobs-001` | 3 knobs, squashing="Butternut Squash", exponent undisclosed | exact match; Mehta FOF ¶¶245-255 | A | ✅ matches |
| `e2-scale-004` | 3.0% of GDP 1922, series max | exact match | B | ✅ matches |
| `e2-events-005` | deductible ad dollar ~20¢ after tax | exact match | C | ✅ matches |
| `e5-medium-006` | 177% splice that "did not happen", ratio 2.77× | exact match ($4.780B vs $1.725B) | B | ✅ matches |
| `e5-scale-016` | direct-response vs local-retail flip, 29.21 | exact match (central 29.21) | C | ✅ matches |
| `e7-events-008` | result click 8% with AI summary vs 15% without | exact match | B | ✅ matches |
| `e2-creators-001` | (deep-3 quarantines it as rejected) | grade B **in era-2.json**, but **verdict "rejected"** in verdicts | B/rejected | ⚠ see seam |

**No fabricated finding found.** Every finding I sampled across the 12 notes ties to a real claim id whose
statement matches. The team's grounding discipline is strong: DEAD columns are kept, hedges preserved, and
rejected claims (`ds-gdp-001`, `ds-total-001`, `e2-creators-001`, `e7-medium-003`) are quarantined rather than
used. deep-3 correctly flagged `e2-creators-001` as rejected — that catch checks out.

**⚠ Integrity seam the next session must respect:** a **rejected** claim still carries its **original grade
inside `era-*.json`** (`e2-creators-001` reads grade "B" there) — rejection is recorded *only* in
`verification/verdicts-era-*.json` (and `verdicts.json`). If the Neo4j graph does not propagate the verdict onto
the L0 node, a top-down `q.py` walk can surface a rejected claim at face-grade. **Discipline:** before using any
`e#-` id, cross-check it:
```
grep -n '"claim_id": "<id>"' p2-ad-market/data/verification/verdicts-era-*.json   # look for "verdict": "rejected"
```
Known rejected so far (do not build on): `e2-creators-001`, `e7-medium-003` (deep-3 DEAD), `ds-gdp-001`,
`ds-total-001` (deep-6 DEAD). A full `q.py` verdict-join would confirm whether the graph already hides these.

**Method cautions inherited from the notes (still live):**
- `tu:era:*` field/event nodes are **synthesis (SECONDARY)** — their inline numbers must be re-pulled from the
  backing `e#-` claim before any number reaches prose. picks.md flags this wherever a field shows `...`.
- Era-2 Coen radio figure runs ~1.66× the FCC audited number (`e2-scale-009` C) — the signature ad/GDP chart
  is seam-biased at its origin. Ship the caveat with any 1920s–30s intensity claim.
- The 61% vs 71.9% digital-triopoly figure (deep-3) is two bases, both kept; never a single number.
- Coen (1919–2007) spliced to MAGNA (2025) is **not strictly commensurable** (`e7-scale-002` method) — the
  non-negotiable disclosure for every cross-splice comparison.

---

## 7. What to tell the next session in one paragraph

The six spines are grounded and ready to build; do not re-mine them. The richest unexplored ground is the
**TARGETING/BUYERS/MEDIUM quarter of the era armature** (~140 unread graded claims), and the strongest single
candidate there is the **150-year addressable-base spine** (title→household→person→opt-out, R4). Three
graph-native discovery vectors were never run for lack of Bash — the **full opposition-edge sweep** (§5.2, the
highest-yield), the **L1 hub sweep past rank 3** (§5.3), and the **entire L2 theme-to-theme meta-graph** (§5.4).
And carry one discipline forward: **cross-check every claim id against the verdicts files before use**, because
a rejected claim still wears its old grade in the era JSON.

*This note records provenance and coverage only. No claim in it has been verified. Human verification status: none.*
