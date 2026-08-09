# S2 sweep — the theme meta-graph of the unexplored quarter (Narrative Architect)

**Role:** Narrative Architect, Session 2. **Task:** map the L2/L3 theme meta-graph for the corpus's
unexplored quarter — TARGETING, BUYERS, MEDIUM, the 150-year addressable base. Census the themes/kinds.
Find the heaviest cross-theme links into the quarter. Connect them to (or complicate) the Session-1
meta-spine *"the independent number was the anomaly."* **Not an article.** This is a discovery note.

**Provenance discipline (carried from the dossier):** this note records *provenance, not verification.*
**No claim here has been verified. Human verification status: none.** Every finding traces to a graph
path + claim id(s). Grades (A/B/C), hedges and intervals are the corpus's own and preserved. `null`-grade
clause fragments carry no number — numbers were re-pulled from the backing `e#-` claim via `claim.py`.
Named living parties (Google, Meta, Apple) are **surfaced, not adjudicated.**

**Method caveat on the census counts:** the L3/L2 census counts below are **node-instances**, not distinct
claim ids. A single claim id (e.g. `e3-targeting-005`) resolves to multiple L0 nodes under different L1
meta-nodes. So a theme can show more "claims" than the ~140 distinct quarter ids. Treat the counts as
**relative signal** — which theme dominates a family — never as absolute claim tallies. The quarter is
138 distinct claim ids: 7 eras × {buyers, medium, targeting}.

**Rejected-claim guard honoured:** `e7-medium-003` surfaced in the medium sweep and is a **KNOWN REJECTED
claim** (dossier §2, coverage-map §6). Flagged, not built on.

---

## 0. Headline finding — the quarter has no theme of its own; MEASUREMENT has captured it

The single most structural result of the sweep: **there is no top-level (L3) theme for "who is targeted,"
"who buys," or "which medium."** Walking UP from all 138 quarter claims to their L3 parents, every family
lands inside a *measurement* or *spend-metrics* theme. Not one demand-side theme exists.

```
L3 theme census over the quarter (node-instances; relative signal only)
family      top-3 L3 parents (all measurement/spend themes)
TARGETING   Advertising Measurement & Analytics (64) · US Mail Advertising Metrics (61) · Ad Measurement & Metrics Framework (42)
BUYERS      Advertising Spend Metrics (119) · Ad Spend Metrics Suite (94) · Advertising Measurement Framework (82)
MEDIUM      Ad Spend Metrics Suite (140) · Advertising Spend Metrics (106) · US Mail Advertising Metrics (16)
```

**This extends the meta-spine, one layer deeper than Session 1 reached.** The spine says *the judged party
owns the number.* The quarter shows the corpus's own ontology enacting it. The demand side has no
independent existence to be judged *by.* It exists in the graph only as *spend to be measured and priced.*
There is no audience the count is accountable to; there is only the count. Session 1 found the independent
*number* was the anomaly. The quarter shows the independent *subject* of the number — the person, the
buyer, the medium — was never modelled as a first-class thing at all.

Note the one exception that proves the rule. **TARGETING's #2 parent is "US Mail Advertising Metrics"** —
direct mail. Targeting is the only family whose second home is a *medium*, not a spend abstraction. That is
because direct mail is where person-level addressability was born (see §2).

---

## 1. The heaviest cross-links — how each family bridges into the rest of the corpus

`LIFTED {layer:2}` edges touching quarter-native L2 kinds. **The three families bridge outward through three
different edge types** — and the edge type is the finding.

| From (quarter kind) | edge | To | weight | what it means |
|---|---|---|---|---|
| advertising medium | **OF_MEDIUM** | advertising spend measurement | 686·479·109·84·67 | MEDIUM exists in the graph *as the subject of a spend measurement* |
| advertising spend category | **OF_MONEY_TYPE** | advertising spend measurement | 329·202 | BUYER money-pools exist *as the subject of a spend measurement* |
| advertising medium | MEASURES | share measurement | 25 | medium **share** — the denominator war lives on this edge |
| advertiser cohort ↔ industry sector | INCLUDES | (each other) | 5 | the buyer taxonomy, self-contained |
| advertiser industry category | BELONGS_TO_BUYER_CATEGORY | advertising market | 4 | buyer taxonomy |
| **advertiser segment** | **DOMINATED_BY** | **advertising channel** | 3 | *who buys what medium* — the exact demand→medium link |
| advertiser cohort | CONCENTRATED_IN | advertising medium | 2 | a buyer class concentrates in a medium |
| advertising medium | **NEGATED_RELATION** | **collapse event** | 5 | the built-in *"the medium did not collapse"* corrective |
| advertising medium | REMOVE | legislation | 2 | the **state removes** a medium / buyer class |
| advertiser cohort | INCLUDES | Bid management shop · search marketing agency | 2 | the **middleman reappears classified as a "buyer"** |
| **data seller** | **SELL** | **address dataset** | 4 | TARGETING's origin edge — the address list is a *sold good* |
| targeting method | ADDED_TARGETING_OPTION | Google | 3 | the targeting menu grows at Google |
| targeting method | APPLY | postal receptacle | 1 | targeting *rooted in the mailbox* |
| consumer audience segment | STITCHED_INTO | data brokerage firm | 1 | the addressable base is assembled by brokers |
| consumer audience segment | COMPOSED_FROM | third-party tracking mechanism | 1 | the audience *is* the tracking |
| consumer audience segment | COVERS_PURCHASES_OF | direct-mail database | 1 | the audience *rooted in the direct-mail DB* |

**Read the weights.** MEDIUM and BUYERS bridge to the rest of the corpus almost entirely through one
crushing edge each — `OF_MEDIUM` and `OF_MONEY_TYPE`. Both point at *spend measurement.* They are heavy
because they are the same fact restated once per era. **TARGETING is different.** Its edges are low-weight
but semantically rich, and they do **not** point mainly at measurement. They form a *supply chain of the
addressable person*: postal receptacle → direct-mail database → data seller → data brokerage → third-party
tracking → Google's targeting menu. That chain is the discovery.

---

## 2. The addressable-base spine (R4) — one continuous lineage, and it is rooted in DIRECT MAIL

Session 1 flagged R4 (the addressable base) and Thread 8 (direct mail / the denominator war) as **two
separate unbuilt braids.** The graph shows they are **one lineage.** Person-level targeting was not a
platform-era invention. It was invented by the mail-order catalogue and industrialised by the state.
The full chronological walk of the TARGETING family (numbers re-pulled, grades preserved):

- **1904 — the origin.** Montgomery Ward mailed ~3M catalogues/year, "each addressed to a named household —
  **the era's only individually addressable medium**" `[e1-targeting-002 B, ci80 2.5–3.5M]`.
- **1914 — direct response is already ~16% of the market.** "Direct-response buyers — mail-order houses,
  patent-medicine makers and every advertiser working a keyed reply — spent about $192M in 1914, roughly
  16 percent of the benchmark total" `[e1-buyers-008 C, ci80 96–360]`. *Performance buying is the oldest
  buyer class, not the newest.*
- **1940 — the household S-curve.** 83% of US households owned a radio set by 1940 (40.3% in 1930, ~95% by
  1950) — "the addressable base that made national broadcast targeting possible" `[e2-targeting-005 B]`.
- **1963 — the STATE builds the key.** The ZIP code introduced 1 Jul 1963. "It gave direct mail a
  machine-readable geographic key more than a decade before geodemographic segmentation was commercialised"
  `[e3-targeting-004 A; the 72M-cards figure is period-press, not USPS records — hedge preserved]`.
- **1974 — the key is commercialised.** PRIZM: ZIP codes → lifestyle clusters from the 1970 census; Robbin
  founds Claritas `[e4-targeting-001 B; launch year contested, e4-targeting-002]`.
- **1975 — direct mail is the precision leader.** Addressable universe = **71.1M individual US households**
  (vs Nielsen's TV-universe 70.5M), each reachable one at a time — "a targeting granularity roughly
  **279,000× finer** than the average unit spot television could sell" `[e3-targeting-005 A]`.
- **1999 — the purchase database, then the acquisition.** The Abacus cooperative purchase database covers a
  large share of US households. **DoubleClick acquires it**, moving from anonymous cookie profiles toward
  named-person targeting `[e5-targeting-001 B]`.
- **2001 — THE PIVOT: the query, not the person.** Overture delivered 442M paid intent-matched clicks in
  Q4 2001 across ~53,000 advertisers — "**targeting by the words the user typed, with no cookie and no
  profile**" `[e5-targeting-004 A]`. And Overture's own 10-K sets its intent pool *explicitly against
  direct mail and Yellow Pages*: "the intent pool search was aiming at was the directory and mail pool,
  stated by the company itself" `[e5-targeting-005 B]`.
- **2007 — the person is re-acquired.** Audience-based targeting enters "by acquisition": Google buys
  DoubleClick, Microsoft buys aQuantive, Yahoo buys Right Media, WPP buys 24/7 Real Media
  `[e6-targeting-004 A on the DoubleClick price]`.
- **2022–2024 — the person opts out.** ATT opt-in ~16% at launch → ~25% mid-2022, ~30% gaming
  `[e7-targeting-002 B, ci80 16–32]`. A GDPR study shows falls in CTR, revenue-per-click, page views and
  revenue for EU users `[e7-targeting-003 B]`.

**The complication of the spine (a genuine new instance).** Targeting's own history is *also a reversion
story*, and it rhymes with the measurement spine. The unit of addressability runs **person → query →
person.** The named household (direct mail) gives way to the query with "no cookie, no profile" (Overture
2001), which gives way to the re-acquired person-profile (DoubleClick 2007, audience-priced impressions
`e6-targeting-005`). The identity-free targeting unit — the query — was **the anomaly.** It was a brief
window when you could be addressed without being profiled. Person-level profiling is the default *before
and after.* This re-renders *"the independent number was the anomaly"* on the targeting axis: **the
identity-independent targeting unit was the anomaly.** *(Hypothesis — the graph supports the
person→query→person sequence via the claim chain above, but does not itself assert the "reversion" frame;
that is my read, marked as such.)*

---

## 3. The state's THIRD and FOURTH roles — it builds precision, and it erases demand

Thread 3 (Session 1) cast the state as the **re-separator** of the number. It relocates (1943, 1984),
ceilings (1954), or names-unlawful-remedy-pending (2025) the concentration the market builds. The quarter
adds two state roles Thread 3 did not carry:

1. **The state BUILT the addressable base.** The ZIP code (1963, Post Office Department) is the
   machine-readable key that made geodemographic segmentation possible `[e3-targeting-004 A]`. The state
   did not only re-separate the counter from the counted. It handed the targeter its coordinate system.
2. **The state ERASES a buyer class overnight.** Cigarette makers were paying US broadcasters ~$225M/yr
   for air time immediately before the 2 Jan 1971 ban (~$50M/yr more to print) `[e3-buyers-004 B, ci80
   150–250]`. The mark is visible in the medium series. **1971 was the only year of the era US television
   advertising fell** — −1.7% ($3,596M→$3,534M) while total US ad spend rose 5.9% — "the combined mark of
   the cigarette ban and the Prime Time Access Rule" `[e3-medium-011 B]`. The precursor is patent medicine
   / Pure Food & Drug 1906. *A whole category of demand can be legislated out of a medium in a single day.*

So across the quarter the state is **enabler (ZIP), eraser (cigarettes), and — from Thread 3 —
re-separator (FCC/DOJ).** It is the one exogenous actor that reaches all the way down to *who can be
addressed* and *who is allowed to buy*, not just *who owns the number.*

---

## 4. BUYERS — a 110-year-stable 4-class taxonomy that pre-wires "search inherited the classified pool"

The BUYERS family is not a spend story dressed up. It is a **stable taxonomy the corpus holds constant
1914→2008**: National / Local-retail / Classified / Direct-response. Two claims make it load-bearing:

- **The classified pool is described as search before search existed.** "Classified buyers — the
  self-serve, per-unit, intent-matched, no-agency pool — accounted for at least 7.7% of all US advertising
  spend in 1975… adding directory advertising… raises the pool to roughly 13%" `[e3-buyers-008 C, ci80
  7.4–13.5]`. *Self-serve, per-unit, intent-matched, no-agency* is a definition of paid search written in
  1975 vocabulary.
- **The corpus carries an explicit anti-narrative corrective on it.** "Direct mail accounted for 24% of all
  US national advertising expenditure in 1956 — a larger share than broadcast — **which is why
  direct-response buyers cannot be treated as a later-era phenomenon**" `[e3-buyers-001 B]`. The graph is
  pre-empting the "platforms invented performance advertising" claim.

**Middleman braid touch-point (2+5, Session 1 §5):** the L2 edge `advertiser cohort INCLUDES {Bid
management shop, search marketing agency}` (weight 2) shows the **intermediary reclassified as a buyer** in
the era-6 graph — the middleman's cut hiding inside the demand side. A thin but real thread for the
middleman braid; not drilled here.

---

## 5. MEDIUM — the denominator war and the built-in "did-not-collapse" corrective

MEDIUM is the family the headline "US ad market" totals fight over. Two grounded results:

- **Direct mail is the medium the totals write out — and it is the biggest.** It took 14.5% of US ad spend
  in 1949, "the second-largest named medium in most years the series splits by medium" (peak 16.8% in 1938)
  `[e2-medium-004 B]`. And it was **the largest single line in Coen's taxonomy through era 6** — $60,225M in
  2007, 21.5% of total US ad spend, "ahead of broadcast television in every year." The caveat rides
  **inside** the claim: the result "depends on Coen booking broadcast and cable separately" `[e6-medium-001
  B]`. This is the strongest single evidence for the meta-frame *every share statistic is a claim about a
  basis, not a fact about the world.*
- **The graph wires a "the medium did not collapse" edge.** `advertising medium NEGATED_RELATION collapse
  event` (weight 5) — e.g. "radio survived the era" `[e3-medium-009]`. The medium-death narrative is
  pre-empted at the graph layer, the same way Thread 4 refused to harden the AI "break."
- **Dataset-integrity corrective (register, not spine):** the Out-of-Home/Billboards splice — "any chart
  that splices the two lines without annotation manufactures a **177% jump that did not happen**"
  `[e5-medium-006 B]`. Pairs with the denominator-war frame.

---

## 6. The quarter's theme map, connected to the spine

The unexplored quarter has **no theme of its own.** Targeting, buyers and medium exist in the corpus only
as spend to be measured. That is the meta-spine — *the judged party owns the number* — written into the
ontology itself. The three families bridge outward through three different edges.

MEDIUM and BUYERS each bridge through one crushing link into *spend measurement*: `OF_MEDIUM` and
`OF_MONEY_TYPE`. The denominator war lives here. Direct mail is both the most-excluded and the single
largest medium (`e2-medium-004 B`, `e6-medium-001 B`).

TARGETING bridges differently. Its route is a low-weight but rich **supply chain of the addressable
person**: postal receptacle → direct-mail database → data seller → data brokerage → third-party tracking →
Google's menu. That chain is the strongest new spine in the quarter — the **150-year addressable base.** It
is one lineage, rooted in direct mail (Montgomery Ward 1904, `e1-targeting-002 B`). The **state** keys it
(ZIP 1963, `e3-targeting-004 A`). It pivots to the identity-free query (Overture "no cookie, no profile,"
2001, `e5-targeting-004 A`), aimed by Overture's own 10-K at "the directory and mail pool"
(`e5-targeting-005 B`). Then it reverts to the profiled person (DoubleClick 2007, `e6-targeting-004 A`),
until the person opts out (ATT 2022, `e7-targeting-002 B`).

It complicates the spine three ways. **(1)** Targeting reverts person→query→person, so *the
identity-independent targeting unit was the anomaly* — a new instance of Session 1's shape. **(2)** The
state is not only the re-separator of the number. It is the **builder** of the addressable key and the
**eraser** of buyer classes (cigarettes 1971, `e3-buyers-004 B` / `e3-medium-011 B`). **(3)** The oldest
buyer class is direct-response/intent (`e1-buyers-008 C`, `e3-buyers-001 B`). So "platforms invented
performance advertising" is a claim the corpus pre-emptively contradicts.

---

## 7. Handoff — what the next dive should build here (highest yield first)

1. **The addressable-base spine (R4), now merged with the direct-mail braid (Thread 8).** These are one
   lineage in the graph, not two. Form is almost certainly **explanatory / spiral** — the same question
   (*who can be addressed, and by what unit?*) re-entered person→query→person. The runner-up is a
   **dual-profile on the denominator "individually addressable households"** — direct mail 71.1M in 1975
   vs the platform person. Every step is quantified. This is the cleanest unbuilt cross-era spine in the
   corpus.
2. **The state-erases-demand corrective beat** (cigarettes 1971 → the only down year of TV; patent medicine
   1906) — a recurring beat that pairs *into* Thread 3, giving Thread 3 its missing "state reaches the
   demand side" corner.
3. **The middleman-inside-the-buyer edge** (`advertiser cohort INCLUDES bid-management shop / search
   marketing agency`) — a thin lead for the 2+5 middleman braid; needs an L0 drill before it is a thread.

**Discipline for whoever builds these.** The census counts are node-instances, not claim tallies (§0
caveat). For `e6-medium-001`, the "direct mail is biggest" result depends on Coen's broadcast/cable split —
the caveat is inside the claim, so ship it. For `e3-targeting-004`, the 72M-cards figure is period-press,
not USPS. For `e5-targeting-005`, the 15.9% is a response rate on *pieces read*, not pieces mailed. Do not
compare it to the 2% in `e4-targeting-004`. Note that `e7-medium-003` is **rejected** — do not build on it.
The person→query→person "reversion" frame in §2 is **my read, marked hypothesis**, not a graph assertion.

*This note records provenance and coverage only. No claim in it has been verified. Human verification
status: none.*
