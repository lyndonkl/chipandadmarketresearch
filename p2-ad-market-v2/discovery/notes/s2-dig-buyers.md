# S2 — dig: WHO WAS ALLOWED TO BUY. The front door and the rent to get in.

**Role:** Narrative Architect (Bash), Discovery Session 2. **This is a discovery note, not an article and
not an architecture.** Mandate: dig one facet of the unexplored quarter — the buyer *classes* across eras
(patent medicine, national brand, local retail, direct response, classified/self-serve). Trace *who could
buy* at each era, and **the rent on the front door** — who is admitted to the market. Extend, not repeat,
Session 1 and the three S2 sweeps.

**Distinct from the hub sweep.** `s2-sweep-hub.md` made the direct-response buyer a *pricing-model*
protagonist (pay-per-action, cost-per-order, share of spend). **This dig is a different axis: admission and
exclusion.** Who is let through the door, what the toll is, and the *count of who is in the room*. The two
are complementary halves of the buyer side: the hub sweep tracks the *meter*, this tracks the *turnstile*.

**Provenance discipline (carried from the dossier).** Records *provenance, not verification.* **No claim
here has been verified. Human verification status: none.** Every finding traces to a graph node and a graded
L0 claim id. Grades (A/B/C), hedges and intervals are the sources' own and are preserved. `tu:era:*`
field/event nodes are **synthesis (SECONDARY)** — their qualitative narrative is used, no number is pulled
from them. Every featured claim was cross-checked for the verdict seam. All read `confirmed` or `adjusted`
(usable); none reads `rejected`.

---

## 0. The one-line finding

**For a century the ad market's front door was gated, and an intermediary collected the rent.** From 1893
only *recognised agencies* could be paid the commission — never advertisers direct. That turned a customary
15% into a cartel toll on national space `[tu:era:1:event:5, mechanism]`. The buyer who would not pay that
toll had one entrance: the self-serve, no-agency classified counter. It was "the only self-serve, no-agency
channel in the era," reserved for "individuals and very small businesses" `[e1-buyers-007 C;
tu:era:1/3:field:BUYERS]`.

And the **state acted as the bouncer**, expelling whole buyer classes through that same door. Patent
medicine, the founding buyer class, was "regulated out of its old form" by the Pure Food and Drug Act (1906)
`[tu:era:1:event:6]`. Cigarette makers, paying broadcasters ~$225M/yr, "could no longer buy television or
radio at all" from 2 Jan 1971 `[e3-buyers-004 B]`.

**Paid search inherited the un-gated door and dropped the rent to near zero.** Overture still ran a gated
door — a 10-cent minimum bid, a $20 monthly minimum, human editorial review of every listing `[e5-buyers-002 A]`.
**AdWords Select "removed each of those gates"**: 5-cent bid, one-time $5 activation fee, no monthly minimum,
automated approval. It was "the point at which the 15% commission simply stopped existing for a whole class
of buyer," turning "a directory of firms into a long tail of plumbers, locksmiths, affiliate marketers"
`[tu:era:6:field:BUYERS + CREATORS, synthesis]`. The advertiser **count** exploded. Yahoo's entire base was
~3,800 in 1998 `[e5-buyers-001 A]`. Overture ran ~53,000 (2001) → ~80,000 (2002) `[e5-buyers-002 A /
e6-buyers-001 A]`. Google reached ~1.1M worldwide by 2008 `[e6-buyers-002 C]`. Meta cites "more than 10
million active advertisers" by 2025 `[e7-buyers-001 B]`.

**The complication that sharpens the meta-spine.** The one place the market got *more* open is also where
**the count of who is admitted went dark.** "Google never disclosed the figure" (2008). "No population-level
figure for Google's full advertiser base is published" (2025) `[e6-buyers-002 C; e7-buyers-003 C]`. The rent
did not vanish; it **moved to the seller's take rate**. And the *money* never democratised at all — national's
share *rose* 61.4%→66.3% (2002–07) `[e6-buyers-005 B]`. **The most-open door in the market's history is the
one with no doorman anyone outside can see.**

---

## 1. Frame lock (narrative-evidence-ledger)

- **UNIT:** one buyer class in one era, tagged by its *admission condition* (gated-by-intermediary /
  un-gated self-serve / expelled-by-state), plus its *advertiser head-count* where a filing discloses it.
- **DENOMINATOR — kept as TWO series, never merged** (the keystone split, after Thread 2's rate-vs-mix).
  **HEADS** = number of advertisers admitted. **DOLLARS** = share of US ad spend by class. The door opened
  on heads; the money did not.
- **WINDOW:** 1878 (Ayer's patent-medicine 26%, earliest graded buyer-mix datum, `e1-buyers-001 B`) → 2025
  (Meta 10M / Google undisclosed, the freeze).
- **BOUNDARY:** US advertising buyers, in the corpus's own four-way money-type partition (national brand /
  local retail / classified-self-serve / direct-response). Plus the two classes the state removed (patent
  medicine, cigarettes). Plus the platform advertiser census.
- **Rejected alternatives:** (a) *advertiser = the platform's disclosed customer count* — rejected: the
  platform stopped disclosing it, and the hole is the finding; (b) *dollars alone* — rejected: it hides the
  head-count opening; (c) *the direct-response buyer as protagonist* — rejected: that is the hub sweep's
  thread (the meter); this unit is the **turnstile**.
- **Starting hypothesis (dated, pre-derivation, 2026-08):** "the front door opened monotonically, from an
  agency-only market to a self-serve market anyone can enter." **Diff after derivation → §8.**

---

## 2. The advertiser-count arc — the front door opening (the spine, HEADS series)

Six datable points, oldest first. Grade-A SEC anchors in the middle; the ends are softer (see cautions).

| Year | Admitted advertisers | Admission condition | Claim · grade · verdict |
|---|---|---|---|
| 1998 | Yahoo **~3,800** (from ~700 in 1996) | biggest web seller; whole base "in the low thousands" | `e5-buyers-001` **A** adjusted |
| 2000 | Google AdWords **~350** (beta) | "Google Launches Self-Service Advertising Program" | `e5-buyers-003` **B** adjusted |
| 2001 | Overture **~53,000** paying | self-serve, **$25–50 min deposit + $20 monthly minimum** | `e5-buyers-002` **A** confirmed |
| 2002 | Overture **~80,000** | "professionalised, editorially-reviewed base immediately before self-serve scale" | `e6-buyers-001` **A** confirmed |
| 2008 | Google AdWords **~1.1M** worldwide (CI80 **550k–2.6M**) | ungated self-serve; **"Google never disclosed the figure"** | `e6-buyers-002` **C** adjusted |
| 2025 | Meta **">10M active"**, >2M US firms/month | ungated; **"no population-level figure… is published"** for Google | `e7-buyers-001` **B** / `e7-buyers-003` **C** adjusted |

**The hinge (the peak).** Between Overture's gated ~80,000 and Google's ungated ~1.1M sits one product
decision: **AdWords Select "removed each of those gates"** `[tu:era:6:field:BUYERS, synthesis]`. The gate
list is documented: 5-cent bid, $5 activation, no monthly minimum, automated approval. The base "turned…
from a directory of firms into a long tail of plumbers, locksmiths, affiliate marketers and single-product
e-commerce sites." Google's own 10-K sold self-serve as a cost saving: "advertisers can also avoid incurring
significant costs associated with creating ads." That is "the point at which the 15% commission simply
stopped existing for a whole class of buyer" `[tu:era:6:field:CREATORS, synthesis]`.

---

## 3. The two gates and the bouncer — the rent on the front door

The door was never free. Three admission mechanisms recur across the eras, each with a documented carrier.

1. **The cartel gate (1893, mechanism).** The newspaper publishers' association "resolved that commissions
   would be paid only to recognised advertising agents and never to advertisers — the enforcement rule that
   turned a customary 15 percent into a cartel price" `[tu:era:1:event:5]`. To buy national space you passed
   through a *recognised* intermediary that took the toll. This is Thread 2's 15% seen from the buyer's
   side: the commission *was* the front-door rent.

2. **The un-gated door (1914→, the poor buyer's entrance).** Classified was "individuals and very small
   businesses paying per line, without an agency." It was ~13% of US newspaper receipts in 1914, ~$24M. Its
   *outlay* share is lower "because the receipts-to-outlay wedge does not apply to a channel that carried
   **no agency commission and no cost of preparation**" `[e1-buyers-007 C, EXCLUDES agency commission]`.
   Same door in era 3: "the era's only self-serve, intent-matched, priced-per-unit advertising, and the
   direct ancestor of paid search," 7.7–13% of all US spend by 1975 `[e3-buyers-005 B / e3-buyers-008 C,
   EXCLUDES advertising agency]`. **The commission-free door existed for ninety years before search; paid
   search is its heir, not its inventor.**

3. **The state as bouncer (1906, 1971).** Patent medicine was the founding buyer class — 26% of Ayer's
   revenue in 1878, falling to 15% by 1900 as branded goods took the lead `[e1-buyers-001/002 B]`. The Pure
   Food and Drug Act "regulated out of its old form" the "industry's biggest single advertiser category,"
   and "advertising's own legitimacy became the trade's central problem" `[tu:era:1:event:6]` (hedge
   preserved: *regulated out of its old form*, not erased). Cigarette makers, "paying broadcasters roughly
   $225 million a year," "could no longer buy television or radio at all" from 2 Jan 1971 `[e3-buyers-004 B,
   confirmed]`. **A whole class of demand can be legislated out overnight. Admission is not monotonic, and
   the market does not choose the bouncer.**

---

## 4. Opposition / constraint inventory (narrative-opposition-web)

Protagonist is a **SYSTEM** (the admission regime — "the front door"). So this is a **constraint inventory,
not a four-corner web** (an explanatory spine has constraints, not corners). No named party is warranted as
an antagonist: the gates are an enforcement rule, a statute, and a pricing floor, not a party that
"targeted" the buyer. Central problem, one question: **who is allowed to buy the public's attention, and who
collects the rent for admission?**

| Slot | Force | Mechanism / carrier | Evidence · grade |
|---|---|---|---|
| A protagonist | the front door / admission regime | who is let in, and at what toll | (the spine) |
| B rent-collector (constraint) | the recognised-agency / 15% commission cartel | publishers' recognition rule 1893; 4As enforcement | `tu:era:1:event:5` |
| C bouncer (constraint) | the state | Pure Food & Drug 1906; broadcast cigarette ban 1971 | `tu:era:1:event:6`; `e3-buyers-004 B` |
| D the un-gated door (constraint) | self-serve / classified / directory channel | per-line, no agency, no commission | `e1-buyers-007 C`; `e3-buyers-008 C` |

**B and D genuinely collide (passes the satellite test).** The un-gated door (D) is precisely the money the
commission (B) never touched. Paid search, D's heir, is what dissolved B's cut "for a whole class of buyer."
They are not two hats on one conflict; they are the two ends of the same wedge (Family E of the opposition
sweep, told from the admission end). **Mandatory residual against fatalism:** the door has been *forced
open* before. The ANA buyer bloc (founded 1910) "forced audited circulation in 1914" `[tu:era:1:field:BUYERS]`.
The national brands demanded the independent count; the self-serve buyer, who never needed it, is the one
whose door won.

---

## 5. POSIWID sheet (systemic-protagonist) — "the front door"

- **Stated purpose (quoted).** Access. Google's 10-K frames self-serve so "advertisers can also avoid
  incurring significant costs associated with creating ads" `[tu:era:6:field:CREATORS]`. The modern door's
  stated purpose is openness.
- **Revealed function, two regimes.**
  - *Regime 1 — agency era (1893–1990s):* the door reliably **sorts buyers by whether they will pay the
    intermediary's toll.** Everyone else is confined to the small un-agencied classified pool.
  - *Regime 2 — platform era (2000s–2025):* the door **admits nearly everyone (rent → $5) while
    internalising the census and the cut.** The head-count goes from SEC-filed to seller-held; the toll
    reappears as the platform take rate.
- **The gap (the engine):** stated purpose is *access*. Revealed function is that **the toll never
  disappeared — it moved from the agency's commission to the platform's take — and the count of who is
  admitted moved from a public number to a seller-held hole.**
- **Two-regime test:** passed (gated agency era; ungated platform era).
- **Residual — outcomes the revealed function FAILS to explain (mandatory, kept):**
  1. The **state removals** (patent medicine 1906, cigarettes 1971). A pure "admit-and-monetise-everyone"
     function does not predict the market expelling its biggest buyer category on trust/health grounds. The
     bouncer is exogenous. `[tu:era:1:event:6; e3-buyers-004 B]`
  2. **Overture *chose* to keep a gated, editorially-reviewed door** (screened professionals) when it could
     have opened first. Google opened; Overture did not. A pure head-maximiser opens first. `[e5-buyers-002 A;
     e6-buyers-001 A]`
  3. **Disclosure existed and was lost.** Yahoo/Overture filed exact advertiser counts (3,800; 53,000;
     80,000, grade A). The number-hole is a **Google-era artefact, not the market's nature.** `[e5-buyers-001/002 A;
     e6-buyers-001 A]`
- **Peak type: LOOP FLIP + IRREVERSIBILITY.** The admission mechanism inverts (screening-in → screening
  no-one) at AdWords Select, while disclosure vanishes. Transfer-function test passes twice. After the flip,
  the same input (a small buyer with $5) yields a different output (admitted, live in minutes). And the same
  question ("how many advertisers?") yields a different output (no answer).

---

## 6. Form verdict + ABT (extract-thread-spine)

**Form: EXPLANATORY NARRATIVE (rung 2), system protagonist.** YES to gate Q1–Q4 (continuous entity = the
front door; documented want = access; dated ruptures = 1893, 1906, 1971, 2002; ≥3 renderable moments).
**ABSENT Q5** (no single system-wide self-revelation — the opening was a dated product decision, not an
insight; the count-going-dark was gradual). **ABSENT Q6** (ongoing — the count is still a hole, the take
rate still contested). These two ABSENTs are load-bearing; all-slots-filled would be the fabrication
signature. **Structure: McPhee SPIRAL over chronology** — the same question (*who is admitted, and who
collects the rent?*) re-entered at four gatekeepers: the cartel gate, the state, the self-serve counter, the
platform. **Runner-up: dual-profile** (Regime 1 gated / Regime 2 open, on the denominator "admission + the
rent"). It lost because the *recurrence of the gate across four gatekeepers* is the argument, not a two-pole
contrast.

**ABT (split into its three moves).**
- **AND** for a century the front door was gated. From 1893 only recognised agencies were paid the
  commission `[tu:era:1:event:5]`. The buyer who would not pay the toll had one entrance, the self-serve,
  no-agency classified counter `[e1-buyers-007 C]`. The state expelled whole buyer classes through it
  `[tu:era:1:event:6; e3-buyers-004 B]`.
- **BUT** paid search inherited that door and dropped the rent to near zero. AdWords Select "removed each of
  those gates," and "the 15% commission simply stopped existing for a whole class of buyer"
  `[tu:era:6:field:BUYERS + CREATORS]`. The count went from ~80,000 to millions `[e6-buyers-001 A →
  e6-buyers-002 C → e7-buyers-001 B]`.
- **THEREFORE** the one place the market got *more* open is where the count of who is admitted went dark
  `[e6-buyers-002 C; e7-buyers-003 C]`, and the rent moved to the platform's take. The *money*, meanwhile,
  never democratised at all `[e6-buyers-005 B]`.

---

## 7. DEAD / CONTRADICTED column (must reach the reader)

- **"Search democratised demand toward a long tail of money"** — **CONTRADICTED.** The long tail is of
  *heads, not dollars.* National's share *rose* 61.4%→66.3% (2002–07). Local grew 3.2% vs national's 27.4%,
  "the opposite of what a 'search eats local budgets' story alone would predict" `[e6-buyers-005 B]`. Brand
  TV budgets "did not move" `[e6-buyers-004 B, confirmed]`.
- **"Self-serve / commission-free buying is a platform-era invention"** — **CONTRADICTED.** The self-serve,
  no-agency, no-commission door existed by 1914 `[e1-buyers-007 C]` and was "the direct ancestor of paid
  search" by 1975 `[e3-buyers-008 C]`. Direct response is "not to be treated as a later-era phenomenon"
  `[e3-buyers-001 B, NOT_TREATED_AS]`.
- **"Paid search killed the 15% commission"** — **CONTRADICTED** (dossier, `e6-creators-002 B`). The
  commission "stopped existing for a whole class of buyer," but the door search descends from **never paid a
  commission** `[e1-buyers-007]`. The cut reappeared as the platform take rate (Family E).
- **"The front door opened monotonically"** — **did_not_support.** The state slammed it twice (patent
  medicine 1906, cigarettes 1971). Admission is gated by a bouncer the market does not choose.
- **CONTESTED, keep the hedge:** Meta ">10M active advertisers" is grade B, and "no primary Meta filing…
  states this in 2025" `[e7-buyers-001 B]`. The ~1.1M Google 2008 figure is a **C estimate on a 550k–2.6M
  interval** — do not harden `[e6-buyers-002 C]`. Performance-Max 71% is a self-selected vendor panel, grade
  C `[e7-buyers-003 C]`.

---

## 8. Connection to (and complication of) the meta-spine

**Extends it — the demand-side twin.** Session 1: *the judged seller owns the number* (count, price). This
facet adds: **the seller now owns the guest list too.** For a century admission was gated by an intermediary
that collected a rent (the recognised agency / 15% cartel). The un-gated door was a small, un-agencied
ghetto. The platform era dissolved the gate and admitted millions — **the one place in this corpus where the
buyer side got *more* open, not less.** At that exact moment the door became unwatched. The census of who is
admitted went from a public SEC number to a seller-held hole `[e6-buyers-002 C; e7-buyers-003 C]`. And
whether a "buyer" (or a click) is even real became the seller's own number to state (click-fraud
unadjudicated, Thread 1). **The most-open door in the market's history is the one with no doorman anyone
outside can see.**

**Complicates the naïve reading.** "The internet democratised advertising" is true on **heads** and false on
**dollars**. Admission democratised; spending concentrated (national *gained* share). Two different buyers,
two different stories, routinely conflated. And the opening did not *break* the intermediary's rent; it
**moved** it — from the agency commission to the platform take rate. That is Thread 3's "moved, not broken"
shape, re-derived on the demand side.

**Hypothesis diff.** Started at *"the front door opened monotonically."* Ended at a **four-gatekeeper
spiral**. The door was gated by a *cartel*, then policed by the *state*, always with an *un-gated poor-buyer
door* alongside. The *platform* finally dissolved the gate — but the rent moved rather than vanished, and the
count went dark rather than public. The word that changed is **monotonic**: admission is not a ramp, it is a
turnstile with a bouncer, and it opened all the way only by also going unwatched.

---

## 9. Agency reading (required)

Strongest agency reading: *the platforms deliberately opened the door to millions of small buyers to capture
long-tail intent money and lock them into a seller-counted marketplace.* **Partly adopted as a dated action,
not as the spine's cause.** AdWords Select's gate-removal *is* a documented, dated product decision in
Google's own record (name the actor, cite the 10-K); that beat carries intent. But the *broader shape* is
structural, not a fresh platform scheme. Three reasons:

- The self-serve, no-agency, commission-free door predates every platform by ninety years `[e1-buyers-007;
  e3-buyers-008]`.
- The count-going-dark is continuous with Thread 1's "seller owns the number," not a buyer-side invention.
- The residuals block the malign-optimiser reading. Overture *kept* its gate when it could have opened, and
  disclosure *existed* before it was lost.

Named living parties (Google, Meta) **surfaced, not adjudicated.**

---

## 10. Best 6–10 cited findings (deliverable) + cautions

1. **The gates, named and dated (the hinge).** Overture: 10-cent min bid, $20 monthly minimum, human
   editorial review `[e5-buyers-002 A]`. AdWords Select "removed each of those gates": 5-cent bid, $5
   activation, no monthly minimum, automated approval — "the 15% commission simply stopped existing for a
   whole class of buyer" `[tu:era:6:field:BUYERS + CREATORS]`. **The clearest single-decision peak.**
2. **The count explodes, then goes dark.** ~3,800 (Yahoo 1998, A) → ~53,000 (Overture 2001, A) → ~80,000
   (Overture 2002, A) → ~1.1M (Google 2008, **C, "never disclosed," CI 550k–2.6M**) → ">10M" (Meta 2025, B;
   Google "not published," C) `[e5-buyers-001/002/003; e6-buyers-001/002; e7-buyers-001/003]`.
3. **The commission-free door is ninety years old.** Classified = "individuals and very small businesses…
   without an agency," carrying "no agency commission and no cost of preparation," 1914 `[e1-buyers-007 C,
   EXCLUDES agency commission]`; "the direct ancestor of paid search," 1975 `[e3-buyers-008 C]`.
4. **The cartel gate = the rent.** 1893 recognition rule: commissions paid "only to recognised advertising
   agents and never to advertisers… turned a customary 15 percent into a cartel price" `[tu:era:1:event:5]`.
5. **The state as bouncer, twice.** Patent medicine "regulated out of its old form," Pure Food & Drug 1906
   `[tu:era:1:event:6]`. Cigarettes "could no longer buy television or radio at all," ~$225M/yr removed,
   2 Jan 1971 `[e3-buyers-004 B, confirmed]`.
6. **The founding buyer class, quantified.** Patent medicine 26% of Ayer's revenue (1878) → 15% (1900) as
   branded goods led `[e1-buyers-001/002 B]`.
7. **Heads democratised, dollars did not (the corrective).** National advertisers 61.4%→66.3% of US ad
   dollars (2002–07), "the opposite of what a 'search eats local budgets' story alone would predict"
   `[e6-buyers-005 B]`. Brand TV "did not move" `[e6-buyers-004 B]`.
8. **The demand-for-the-number had a carrier.** The ANA buyer bloc (founded 1910) "forced audited
   circulation in 1914." The national brand demanded the independent count; the self-serve buyer never
   needed it, and its door is the one that won `[tu:era:1:field:BUYERS]`.

**Grade cautions (do not harden).** The spine's *middle* is grade-A SEC filings (Yahoo, Overture). Its
*ends* are soft. The 2008 ~1.1M is a **C estimate on a 550k–2.6M interval**. The 1914/1975 classified shares
are **C** with wide bands. Meta's ">10M" is a repeated company statement with **no located 2025 primary
filing** (grade B). The head-count arc is real in *shape*; its endpoints must ship with their intervals.

**Escalations / research gaps (route to research, not redraft).**
1. **No disclosed Google/Meta advertiser census.** The hole is the finding, but it means the 2008→2025
   endpoint of the HEADS series can only ever be an estimate `[e6-buyers-002 C; e7-buyers-003 C]`.
2. **No graded L0 claim on the 1893 recognition rule or the 1906 Pure Food & Drug removal.** Both are
   event/synthesis nodes carrying the moment; no number rides on them `[tu:era:1:event:5/6]`.
3. **The "$5 activation / 5-cent bid" gate list sits in the era-6 BUYERS synthesis**, not a dedicated graded
   claim. Re-source before any number reaches prose.
4. **Anachronism flag:** "self-serve," "long tail," "democratised" are modern frames. The era-1 corpus calls
   the classified counter simply "the only self-serve, no-agency channel."

*This note records provenance and coverage only. No claim in it has been verified. Human verification status:
none.*
