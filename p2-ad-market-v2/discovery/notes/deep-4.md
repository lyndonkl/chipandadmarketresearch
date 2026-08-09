# Deep dig — Thread #4: The loss-leader that built free media, and the box that may end it

**Architect:** Bash / narrative-architect. **Corpus:** frozen `admarket` graph + era JSON.
**Skills run:** narrative-evidence-ledger (frame + typed findings + causal triage + DEAD),
narrative-form-triage (verdict), systemic-protagonist (POSIWID), narrative-opposition-web (corrective).
**Rule kept:** every finding walks L3→L2→L1→L0 to a graded claim; hedge/grade/interval preserved;
no "was associated with" hardened into "caused".

---

## The through-line (what the sourced numbers actually license)

The ad-funded, **below-cost** content model was a **sell-side invention**, twice: Benjamin Day's
penny *Sun* (1833) and Frank Munsey's ten-cent magazine (1893). The reader was sold the content below
what it cost to make; the advertiser paid the difference. The Census shows the result: advertising's
share of newspaper income rose from ~44% (1879) to 64.9% (1914).

190 years later the same model is not being *broken* by the AI answer box — it is being **re-priced and
re-assigned**. Pew found the *funding click to third-party publishers* fell from 15% to 8% of visits
where an AI summary appears (grade B, and **disputed by Google**). But Google's own chief business
officer says the AI Overview "monetises at approximately the same rate as classic search" — i.e. the
platform's *own* ad take is claimed intact. And in 2026 the model simply reappears inside the box:
OpenAI began serving labelled ads below answers.

**So the frozen numbers do not license "the 130-year subsidy is being broken on the mechanism that
created it."** They license a narrower, harder claim: *the cross-subsidy mechanism is durable; what the
AI box moves is who holds the funding click* — from the third-party publisher to the platform. This is
Thread #1 ("who counts the audience") rendered at the money layer: a **transfer, not a collapse**.

---

## Frame lock (narrative-evidence-ledger Step 1)

- **UNIT:** one instance of below-cost content whose deficit is covered by advertiser payment (a title,
  a platform, an answer box). *Rejected:* "one medium" — the thread is about a funding mechanism, not a channel.
- **DENOMINATOR:** advertising as a share of the seller's gross income / of the funding action (the click).
  *Rejected:* absolute ad-dollar totals — they conflate reallocation with growth (that is Thread #6).
- **WINDOW:** 1833 (penny *Sun*) → 2026 (OpenAI ads in the box). Edges justified by graded anchors at
  each end. *Rejected:* "the digital era only" — it severs the invention from its recurrence.
- **BOUNDARY:** US sell-side publishers/platforms selling content below cost. Line drawn by the source
  (era-1 SELLERS field explicitly attributes the invention to the sell side). *Rejected:* buy-side
  agency history (that is Thread #2, the 15%).
- **Starting hypothesis (dated, verbatim from the pick):** "If AI Overviews cut the funding click from
  15% to 8%, the 130-year subsidy is being broken on the very mechanism that created it."

---

## Frozen evidence ledger — findings (outcome-blind, grade/hedge preserved)

Path column is the graph/era walk that surfaced each finding.

### Pole A — the invention (1833–1914)

| # | Finding (hedge preserved) | Grade | Claim id | Path |
|---|---|---|---|---|
| A1 | The New York *Sun* sold at **one cent** and reached **~15,000 copies/day** within ~2 years of its 1833 launch. ("Below cost of production" is asserted in the era narrative + Day's own front page, not separately graded.) | **B** | `e1-events-001` | L3 *US Media Owner Ad Revenue* → era-1 SELLERS / `tu:era:1:event:1` |
| A2 | *Munsey's* cut its cover from **25¢ to 10¢ in 1893, below production cost**, and its advertising revenue then averaged **~$25,000–$35,000 per issue**. | **B** | `e1-sellers-005` | era-1 SELLERS field |
| A3 | Munsey (an interested party) estimated the ten-cent magazine grew the magazine-buying public from **~250,000 to ~750,000** (1893–99); *no independent enumeration exists* (interval widened downward for promoter bias). | **C** | `e1-events-003` | `tu:era:1:event:6` |
| A4 | Advertising supplied **64.9%** of US newspapers' gross income in 1914 ($184.1M ad vs $99.5M subscriptions/sales). | **A** | `e1-sellers-003` | era-1 SELLERS field |
| A5 | Advertising supplied **~44%** of US newspaper revenue in 1879 — so the ad share of publisher income **rose ~20 points** across the era. | **B** | `e1-sellers-004` | era-1 SELLERS field |

### Pole B — the durable engine (2007) and the box (2024–2026)

| # | Finding (hedge preserved) | Grade | Claim id | Path |
|---|---|---|---|---|
| B1 | Gross margin on a monetised Google-owned search query was **~85% in 2007** (computed from the FY2008 10-K, 1 − 1,715.2/10,624.7 = 83.9%). Search = the modern below-cost-to-user, ad-funded engine. | **C** | `e6-unit_econ-003` | era-6 unit_econ |
| B2 | Users clicked a result on **8% of Google visits with an AI summary, vs 15% without**; clicked a source *inside* the summary on **just 1%** of visits. **Google disputes the Pew study** (PPC Land source on the node). | **B** | `e7-events-008` / `e7-measurement-004` | `tu:era:7:event:8`; edge `CONTRASTS_WITH` |
| B3 | AI Overviews reached **>2B monthly users** by July 2025; Google's CBO said the format **"monetises at approximately the same rate as classic search."** | **B** | `e7-targeting-004` | edge `CLAIMED_SAME_RATE_AS` (Google CBO ↔ classic search) |
| B4 | Serving cost of an AI Overview **fell sharply** over ~18 months; the same answer cost ~**0.0165¢** at the cheapest capable tier by 2025. | **C** | `e7-unit_econ-006` | era-7 unit_econ |
| B5 | US measured ad spend was **~1.32% of GDP in 2025**, down from 2.0% (2007) and a 2.3–2.4% peak (2000) — the macro envelope the subsidy rides in is *shrinking as a share of the economy*. | **C** | `e7-scale-002` | era-7 SCALE field |

---

## Causal triage (narrative-evidence-ledger Step 3) — the anti-upgrade guard

- **A2→A4/A5 (below-cost pricing → ad share rose):** title-level mechanism is **L1** (Munsey's pricing
  decision + resulting ad revenue are documented, `e1-sellers-005`); the *aggregate* 44%→65% rise is
  **L2 CORRELATION** — the Census documents co-movement across the era, but department stores, national
  brands and dailies are co-causes. Permitted verbs: "rose with", "accompanied". **Banned:** "caused".
- **B2 (AI summary → lower funding click):** **L2 CORRELATION**, not L1. Pew is an observational
  cross-section (visits *with* vs *without* a summary); queries that trigger summaries may differ, and
  **Google disputes it**. Permitted: "was lower where", "coincided with". **Banned:** "AI Overviews cut
  the click". Do not harden.
- **"Same mechanism breaking the subsidy" (the pick's frame):** **L5 CONJECTURE / thematic.** The
  mechanism that *created* the subsidy (reader pays below cost, advertiser pays difference) is *not* the
  mechanism now at risk (third-party **referral** click). Google's own take is claimed intact (B3). The
  strong causal closure is **unsupported by the corpus** (see DEAD).

---

## Form triage verdict (narrative-form-triage)

Six-question gate: Q1 continuous entity — only if the protagonist is the **system** (the cross-subsidy),
not a person. Q2 documented want — yes (revealed function, POSIWID below). Q3 dated rupture — yes (AI
Overviews, 2024-05-14). **Q4 continuous action sequence — NO:** 190 years, discrete dated events, no
continuous tracked action line in this corpus. Q5 point of insight — none evidenced. Q6 resolution —
ongoing.

**Verdict: NOT a story arc. Rung 3 — GATHERING / DUAL-PROFILE.** Two nodes (Pole A 1833–1914; Pole B
2007–2026) on one common denominator — *"advertising subsidises below-cost content"* — with a
convergence beat (the model reappears inside the AI box, 2026). Runner-up: EXPLANATORY spine hung on the
"who holds the funding click" question. This is a **McPhee dual-profile**, not a Truby arc. Do not
manufacture a climax; the "break" is contested and the resolution is absent.

---

## Systemic protagonist — POSIWID sheet (systemic-protagonist)

- **Protagonist:** the **ad-funded below-cost content model** (a system, held constant).
- **Stated purpose (quoted):** Day's own front page — lay the news before the public *"at a price within
  the means of every one, and at the same time offer an advantageous medium for advertisements"*
  (`tu:era:1:event:1`).
- **Revealed function:** convert reader attention into advertiser payment; the reader is the product,
  the advertiser is the customer, the content is the loss-leader.
- **Two regimes (test passed):** print (A4/A5: ad share 44%→65%, grades A/B) **and** platform/AI (B1
  search 85% margin, C; B2/B3 the box). Behaviour holds across regimes.
- **Gap (the engine):** stated "cheap content for the public" vs revealed "the public is sold to
  advertisers, and whoever pays the deficit sets the terms."
- **Mandatory residual (outcomes the function fails to explain):** **Bok 1892** — the *Ladies' Home
  Journal* voluntarily refusing patent-medicine ad revenue on trust grounds (`tu:era:1:event:4`,
  wired `EXCLUDES` "the Journal → patent-medicine advertisement"). A pure "maximise advertiser payment"
  function does not predict a seller destroying its own inventory. This residual must survive into any piece.

---

## Opposition / corrective web (narrative-opposition-web)

Central question (answerable more than one way): *when content is sold below cost, who pays the deficit —
and does that payer set the terms of the content?*

- **Corner B is a constraint, not a villain:** below-cost content **requires** an outside payer; that
  payer holds leverage. In print the advertiser held it (patent medicine, until Bok/Adams/Pure Food &
  Drug Act 1906). In the box the **platform** holds it.
- **Corrective 1 (internal, era 1):** Bok 1892 — the model's own self-correction, seller restricts
  inventory. Wired `EXCLUDES`.
- **Corrective 2 (closing pole):** Google CBO "monetises at ~same rate" (`CLAIMED_SAME_RATE_AS`) + Google
  disputes Pew. The threatened subsidy is the **publisher referral**, not the model as such.
- **Corrective 3 (measurement boundary):** era-7 SCALE `EXCLUDES` edges — older series never counted
  yellow pages, classified, co-op/trade allowances, catalogue or lead-gen as "advertising"
  (`tu:era:7:field:SCALE`). So the *magnitude* of the modern subsidy is partly a reclassification artifact
  (Silk & Berndt, "a growth problem, a measurement problem, or both"). This is the honest brake on any
  "the subsidy is X big" claim.

---

## DEAD column (ships with the deliverable — never deleted)

| Item | Type | Reason |
|---|---|---|
| **2026 OpenAI ads / Perplexity retreat as a "re-invention" beat** | **did_not_support** | Exists only as event-description text (`tu:era:7:event:9`); **no graded claim** backs OpenAI's $8/mo ad tier or Perplexity's ~$20k/$34M ad revenue. Usable as color, not as a measured finding. |
| **"AI Overviews *cut* the funding click"** | **CONTRADICTED** (surface to reader) | Pew is observational cross-section; **Google disputes the study** (source on `e7-measurement-004`). Stays L2. The contest reaches the reader. |
| **"The 130-year subsidy is being broken"** | **did_not_support** | The corpus contains **no measure of publisher revenue dependence on search referral**. The strong causal closure cannot be grounded. Research gap. |
| **"Same mechanism that created it"** | **did_not_support** | Creation mechanism (reader-deficit → advertiser) ≠ threatened mechanism (third-party referral click). Conflation; downgrade to thematic. |

**Anachronism flag:** "loss-leader", "cross-subsidy", "subsidy" are modern frames applied to 1833; Day
called it "an advantageous medium." Say so in any prose.

---

## Hypothesis diff (what the evidence did to the starting hypothesis)

- **Before:** AI Overviews break the 130-year subsidy on the mechanism that created it (15%→8%).
- **After:** The mechanism is **durable and sell-side** (1833/1893 invention; reappears in the box 2026).
  The AI box does not break the cross-subsidy — it **transfers the funding click** from the third-party
  publisher (whose click fell 15%→8%, B, disputed) to the platform (own take claimed intact, B). The
  finding rhymes with Thread #1: *the counter of the funding action changed hands.* What changed under
  the evidence: the verb ("break" → "transfer") and the beneficiary. What did not change: ads still fund
  below-cost content.

---

## The best 6–10 cited findings (for architecture / handoff)

1. **Below-cost content is a sell-side invention** — penny *Sun* 1¢, ~15k/day (`e1-events-001`, B);
   *Munsey's* 25¢→10¢ below cost, ~$25–35k ad/issue (`e1-sellers-005`, B).
2. **The Census proves the model worked at scale** — ad share of newspaper income 44% (1879, `e1-sellers-004`, B)
   → **64.9%** (1914, `e1-sellers-003`, **A**); ~20-point rise.
3. **The reach it bought is only an interested estimate** — magazine public 250k→750k, Munsey's own number,
   no independent count (`e1-events-003`, **C**, interval widened for promoter bias).
4. **Search is the same engine, industrialised** — ~85% gross margin on a monetised query, 2007
   (`e6-unit_econ-003`, C, from the 10-K).
5. **The funding click to publishers fell — observationally, and disputed** — 8% with AI summary vs 15%
   without; 1% click *inside* the summary (`e7-events-008` / `e7-measurement-004`, **B**; Google disputes).
6. **The platform says its own take is intact** — >2B users; CBO "monetises at ~same rate as classic
   search" (`e7-targeting-004`, B; wired `CLAIMED_SAME_RATE_AS`). *This is the corrective that reframes the thread.*
7. **The box makes the answer nearly free to serve** — AI Overview serving cost fell sharply, ~0.0165¢/answer
   (`e7-unit_econ-006`, C) — the below-cost economics deepen, not reverse.
8. **The model self-corrected once before** — Bok 1892 refuses patent-medicine ads (`tu:era:1:event:4`,
   wired `EXCLUDES`): the residual the "maximise advertiser payment" reading can't explain.
9. **The subsidy's size is a measurement fight** — older series exclude classified/co-op/catalogue/lead-gen
   (era-7 SCALE `EXCLUDES` edges); ad spend ~1.32% of GDP 2025 vs 2.0% 2007 (`e7-scale-002`, C).

**Provenance note:** this ledger records provenance only. No claim has been verified; human verification
status: none.
