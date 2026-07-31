# REPAIR-P1 — the `as_of` split, the eleven open items, and the timeline gate

Stage P1, 2026-07-31. Internal working document, exempt from the readability gate (same
convention as `BUILD-PLAN.md` and `asof-audit.md`).

Inputs: `verification/asof-audit.json` (the frozen pre-repair audit of 505 claims) and
`verification/repair-p1-open-items.json` (the R3c adversarial re-attack on the fifteen open
items). Both are verifier records; this stage is the applier.

Everything below follows the R2b/R3b discipline: **no original verdict body was edited.**
Sixteen entries in `verdicts.json` gained a `superseded_by` block naming the stage, the reason,
the governing value and the audit trail.

---

## 1. What `as_of` means now

**Time is two fields, never one.**

| field | type | what it is | may it touch an axis? |
|---|---|---|---|
| `as_of` | ISO date, `YYYY[-MM[-DD]]` | **Provenance.** When the governing source published, filed or was retrieved. It identifies the *vintage* of a number. | **Never.** Tooltip and provenance panel only. Never an axis, never a time filter. |
| `about_year` | int, **required** | **The fact year.** The single calendar year the claim is about. | **This is the only field a chart may read.** |
| `about_span` | `[start, end]` or absent | The band where a fact covers more than one year — a season, a cycle, a growth interval, an era-typical practice. `about_year` must lie inside it. | Draw the band, anchor the point at `about_year`. |
| `timeline_ready` | bool, defaults true | False means `about_year` was assumed, not read from evidence. | **Do not draw the claim at all.** |
| `about_year_note` | string | Required when `timeline_ready` is false (say what has to be read) or when `about_year` matches no year in the claim's own text (say why). | — |

Both definitions are now written into `planning/schema/era-record.schema.json` — in the record
description and again on each field — so the ambiguity cannot recur by omission. They are also
in `PLAN.md` §rigor and `data/FREEZE.md`.

**Why this way round.** 160 `as_of` values carry month or day precision; a filing date is not a
year in economic history. Provenance is *identity* in this dataset, because compilers revise:
`e4-scale-006` is one 1990 total printed as $129,590M in a 2001 edition and $129,968M in a 2009
workbook, and only the source date tells the two apart. And the frozen layer already implements
this exact split — `adspend.json` carries `year` for the fact and `calibration.as_of` for the
vintage across 1,573 points, 1,568 with a source date after the fact year and **none** before.
`about_year` is simply `claims.json` getting `adspend.json`'s `year`.

**No `as_of` value was changed.** Re-stamping the legacy ones needs one source read per claim and
changes nothing a reader sees; it is scheduled separately and is not blocking. See §6.

---

## 2. What changed — counts

### The time split

| | |
|---|---|
| claims carrying `about_year` | **506 / 506** (in `claims.json` and in every record copy) |
| claim objects patched across the record files | 528 in 9 files (era-1..7, `mechanism.json`, `adspend.json`) |
| `about_span` added | 177 |
| `timeline_ready: false` | 7 |
| `about_year_note` added | 13 |
| **claims whose `about_year` differs from the year in `as_of`** | **60** |
| worst misplacements a chart would have made | `ds-gdp-001` 86 years (`as_of` 2008-09-14, fact year 1922), `ds-bridge-002` 40, `ds-seam-002` 19 |
| `as_of` values changed | **0** |

Every applied value matches the frozen audit exactly; a re-check of all 505 audited claims
against `asof-audit.json → claims[].proposed` finds zero divergence.

### The open items

15 items: **4 confirmed, 11 adjusted, 0 rejected, 0 unverified.** All 11 adjustments applied.
**Exactly one central moved:** `e7-unit_econ-006`, 0.00022 → 0.000165. Every other adjustment
corrected an interval, a unit, a base, or a statement that contradicted its own method.

One label-only change was applied outside the eleven: `e7-medium-002`'s unit now names the
MAGNA/IAB rail, which is the other half of the `e7-sellers-004` cross-rail finding.

One claim was minted: **`e1-measurement-005`**, the Audit Bureau of Circulations founded in
Chicago in 1914 by the merger of the publisher-controlled Advertising Audit Association and the
advertiser-dominated Bureau of Verified Circulations. It promotes an assertion that era-2's
MEASUREMENT summary had been carrying unbacked, attested on three independent sources
(Britannica, the Ad Age Encyclopedia, HistoryOfInformation). It is declared in `post_r3_claims`,
per era-2's existing boundary note that the ABC belongs to era 1.

### Supersessions

**16 recorded, all stage P1.** Twelve for claims this stage changed. Four more from the
records-integrity sweep in §4.

### Chapters

**9 of 10 chapters** updated (all but `04-the-spot-market.md`). All ten clear the four
readability gates; see §7.

---

## 3. What the open items resolved to

### The three build-blocking AI-cost claims — REPAIRABLE, not unknowable

The question asked was whether better sourcing narrows the 19.5x–28.0x intervals or whether the
honest answer is "we do not know within an order of magnitude." **It is repairable, decisively.**
All four points in the chain are deterministic arithmetic on published list prices, reproduced to
six decimals. There is no measurement error in the series to put an interval around. The widths
were an **undeclared second series — the frontier tier — occupying the `ci80` field.**

| claim | what was wrong | now |
|---|---|---|
| `e7-unit_econ-005` | `ci80` hi $0.0095 was GPT-4o (a different model); lo $0.00025 matched no published price | `ci80` [0.00033, 0.00067], a hard floor and a 2x ceiling measuring **model selection**, not error |
| `e7-unit_econ-006` | **the central was wrong**, not just the interval: 0.00022 prices Gemini 2.0 *Flash* while the unit says "cheapest capable tier" | central **0.000165** (Gemini 2.0 Flash-Lite, on Google's list from 25 Feb 2025), `ci80` [0.00008, 0.00033] |
| `e7-unit_econ-007` | frontier tier in `ci80` again; the "stopped falling" finding rested on two centrals priced on *different rungs* of Google's ladder; the declared frontier comparator (GPT-5.2) is not on OpenAI's July 2026 list | `ci80` [0.00008, 0.00058]; finding re-evidenced on the price lists; frontier restated as GPT-5.4 Standard $0.007 / GPT-5.5 $0.014 |

Cheap-tier intervals fall to roughly **2x (2024), 4x (2025), 7x (2026)**, each with a stated
cause: which model counts as cheapest-and-capable.

**"145-fold" survives, exactly.** 0.048 / 0.00033 = 145.45x. But it is an **index ratio between
two named list prices twelve months apart**, not an estimate with a band, and the chapters now
say so. **"Stopped falling" survives and is understated.** Held to one rung the floor *rose 33%*:
Gemini 2.0 Flash-Lite was shut down on 1 June 2026 and every cheap tier launched since is dearer
(Gemini 3.1 Flash-Lite $0.0007, GPT-5.4 Nano $0.000575). The chapters now say "stopped falling and
ticked back up", evidenced on the price lists rather than on two coincidentally equal centrals.

**Build consequence, now recorded in the methods and in chapters 08 and 10: this is a two-line
chart — cheap tier and frontier tier — not one line with a band. The band was the second line.**

### The source reads

- **`e5-events-007`** — keep the source, **delete the gloss.** The cited Wikipedia article's three
  itemised tables independently support both 14 and 21, and $44M / 21 = $2.10M confirms the 21
  grouping. The share clause does not survive any pairing (21/61 = 34.4%, 14/61 = 23.0%, 20% of 61
  = 12.2 ads). The likely corrupted element is the **denominator**, not the share — 14/70 = 20.0%
  exactly, and ABC's inventory was widely described as about 36 minutes, roughly 72 units — but
  that could not be proved. Clause deleted from the claim statement and from the parent event's
  `desc`. **The R3b `open_defect` is closed;** the claim now carries a `resolved_defect` record.
- **`e5-targeting-005`** — the 10-K was pulled from SEC EDGAR directly (WebFetch 403s; curl with a
  declared user-agent succeeds). Calibration is verbatim-exact. **R3b's proposed fix would have
  made it worse:** the filing says pieces *read*, not mailed, and that word is what reconciles
  15.9% with `e4-targeting-004`'s 2%. A base note was added instead of a cut.
- **`e7-sellers-004`** — internally consistent (0.719 × 0.8206 = 59.0%). The conflict is
  **cross-rail** and worth **$23.0B**: on the MAGNA/IAB rail the same digital share is 53.2% of
  total, not 59%. The unit now names EMARKETER's definition, `e7-medium-002`'s names the MAGNA/IAB
  rail, and chapters 08, 09 and 10 warn the reader.
- **`e5-unit_econ-001`** — **R3b's "$11.75 arithmetic floor" does not hold.** It put total internet
  revenue over a display-impression denominator and used AdRelevance's monitored-site count as a
  census ceiling when the claim's own method calls it a floor; corrected both ways the conflict
  dissolves at $9.09 CPM, inside the stated interval. Label defect only: unit and statement now say
  banner-and-sponsorship revenue per **display** impression.

### Wording and basis

- **`e1-buyers-008`** — the statement contradicted its own method. Five Printers' Ink lines sum to
  $206m and were presented as the anchor for a $192m central in a later year; route D1 takes only
  65% of the direct-mail line ($171m, grown ×1.131 to $193.4m) at weight 0.35 of four routes, and
  the central is 16.0% of the $1,200m 1914 benchmark. Statement corrected; no value moved.
- **`e7-pricing-005`** — R3b's arithmetic objection **fails** (the claim already said
  "recoverable", and the ANA's own release uses the same construction), but two real defects were
  found: the $88B pool's US-vs-global geography is unconfirmable, and the December report's 11.4%
  MFA sits beside the June first look's 15%. Both now stated, along with the ANA's own
  decomposition (29 + 35 = 64, leaving 36) so the arithmetic is self-checking.
- **`e4-measurement-003`** — base mismatch confirmed (households against population), **plus a
  defect R3b missed**: the same article carries Nielsen's rebuttal, 31% against 28–30%, which cuts
  the alleged skew from 7 points to 1–3. The claim carried only the accusation, and its interval
  sat on the *undisputed* side. Both bases named, rebuttal printed, method added saying never to
  present 33-against-26 as a measured skew.
- **`e6-unit_econ-003`** — `-002` and `-003` are **not inconsistent** (84.1% from the per-query
  pair, 83.9% from the filings, central 85%). Only the parenthetical was wrong: it printed 0.33
  cents, back-derived from its own rounded margin, for a quantity the record calibrates at 0.35
  cents. Corrected, and chapter 07 corrected with it.

### Confirmed, no change

`e6-unit_econ-002`, `e2-measurement-001`, `e2-buyers-003`, and the ABC-1914 side item. The two
CAB claims **do not disagree**: 49 (1930) → 21 → 17 (1934) is one series and Beville prints the
middle value. $33,045 / 49 = $674.39 ≈ 9.6 months at $70, matching a CAB that began field work in
March 1930. The real gap was a fact the record contained and never stated — a 65.3% collapse in
advertiser subscriptions — now said out loud in chapter 03.

---

## 4. The records-integrity sweep (R3c finding XC-4)

R3c found incidentally that `e1-buyers-008`'s standing R3 verdict certifies central 300 / ci80
[200, 400] against the 1926 Britannica, while the live object is 192 / [96, 360] on Printers' Ink.
R2b rebuilt it after R3 ran and recorded no supersession.

The sweep it asked for was done. **Five claims** carried a standing verdict certifying a value the
record no longer held: `e1-buyers-008`, `e1-scale-012`, `e1-scale-013`, `e5-buyers-010`,
`e5-buyers-011`. All five are money-type pools R2b re-derived; all five now carry a P1
supersession recording the governing R2b value. **No value changed** — only the ledger.

**Why no gate saw it.** R2b recorded supersessions on the eight *adjusted* verdicts it displaced,
because `r3-applied` inspects adjusted verdicts only. These five are **confirmed**, and a
confirmed verdict carries no values block, so nothing mechanical could compare it. That is now
partly closed: `_check_supersession` in `tools/verify_p2.py` compares a `superseded_by` block's
`<stage>_applied` dict against the live record, so a supersession that *asserts* a governing value
the record does not hold is itself a violation. A confirmed verdict that states a value only in
prose is still invisible to any gate — that residue is logged in §6.

---

## 5. The new gate: `p1-timeline`

```
python3 tools/verify_p2.py p1-timeline
```

Registered in `COMMANDS` alongside the twenty existing checks. It asserts:

1. every claim carries **one integer `about_year`** in range — nothing may fall back to `as_of`;
2. `about_span`, where present, is a well-formed band **containing** `about_year`;
3. `timeline_ready: false` withholds permission to draw **and must say why**;
4. an `about_year` that **contradicts every year in the claim's own statement and unit** must
   carry an `about_year_note`. A timeline year may disagree with the claim's prose; it may never
   disagree silently;
5. the **mirrored copies** of a claim (era record / `mechanism.json` / `adspend.json` and
   `claims.json`) agree on `about_year`, `about_span` and `timeline_ready`.

It walks claim objects at **any nesting depth**, because `mechanism.json` hangs claims off
arbitrary engine nodes and a shape-aware walk would miss 45 claims — which is how a gate goes
quietly vacuous.

### What it actually checks (printed to stderr on every run)

```
p1-timeline: 528 claim objects scanned across 9 record files (506 distinct ids),
506 mirrored against claims.json, 484 cross-examined against the years in their
own text (8 of those disagree and must carry a documented reason)
```

Three vacuity guards fire as violations if the scan, the cross-examination or the mirror
comparison ever reaches zero.

### Proof that it is non-vacuous

```
python3 p2-ad-market/research/notes/prove_p1_timeline_gate.py
```

Copies the repo to a tempdir, breaks one claim per failure mode, runs the gate against each.
Baseline passes; **all nine breaks are caught.**

| break | caught by |
|---|---|
| `e4-scale-006` `about_year` 1990 → 2009 (the compiler's vintage — *the exact failure this stage repairs*) | mirror rule |
| `e7-scale-004` `about_year` deleted (falls back to `as_of`) | rule 1 |
| `e2-scale-004` `about_year` set to the string `"1949"` | rule 1 |
| `e3-scale-005` `about_span` moved off its own `about_year` | rule 2 |
| `e7-measurement-003` `about_year_note` removed while not timeline-ready | rule 3 |
| `e6-unit_econ-001` `about_year` drifts in `claims.json` only | rule 5 |
| `mech-mehta-001` `about_year` 2024 → 2019 | rule 5 |
| `e5-scale-005` `about_year` → 2003 in **both** copies, a year its text never states | rule 4, on its own |
| `e3-scale-005` `about_year` → 956 in both copies | rules 1, 2 and 4 |

### The other half of cross-check cc-05

`r2-rdy-01` (`r2_reconcile`) parsed a **claim's** `as_of` as a fact year. It is repointed at
`about_year`. Coverage is unchanged at 14 comparisons — the era researchers happened to stamp
fact years on SCALE claims — but the check would have silently stopped comparing anything the
moment an `as_of` was corrected to a real publication date, and still reported PASS. `r2-rdy-02`
still tests point `as_of` against the freeze date, which is correct: that one *is* provenance.

---

## 6. What remains genuinely unknowable

Nothing here is hidden behind a widened interval. Each item is an open question with a stated
reason it could not be closed.

**Unknowable without a source nobody could reach.**

- **`e5-events-007`'s denominator.** Whether Super Bowl XXXIV sold 61, 70 or 105 national spots.
  Fast Company returns HTTP 403; the Ad Age archive publishes no spot count; every secondary
  retelling echoes the same Wikipedia sentence. The clause is deleted rather than guessed.
- **`e7-pricing-005`'s $88B geography.** US-only or global. The ANA full-report PDF would not
  text-extract and the ANA member pages are gated. Flagged in the claim: *do not treat $88B as a
  US total.*
- **`e5-unit_econ-001`'s AdRelevance basis.** Whether the 172bn Q4 2000 figure was a monitored-site
  count or a projection to the US universe. No AdRelevance methodology document was reachable.
  The claim absorbs either reading (the projection case gives ~$10.4 CPM, inside `ci80`).
- **`e2-measurement-005`'s 800 metered homes.** Carried from R3b: the Museum of Broadcast
  Communications prints 500 in one entry and 800 in another, and the settling primary (Nielsen,
  *Journal of Marketing* 9:3, 1945) returned 403 from both SAGE and HathiTrust. The interval spans
  the conflict rather than averaging it.

**Not unknowable — just unread. Six claims, plus one that is unplottable by nature.**

`timeline_ready: false`, each with an `about_year_note` naming what has to be read:
`e1-sellers-005` (Munsey's per-issue year), `e7-pricing-003` and `mech-tuning-001` (which quarters
the auction tunings ran), `e7-measurement-003` (Imperva's traffic year), `mech-mehta-001` and
`mech-mehta-004` (the findings-of-fact measurement years). `ds-provenance-001` is the seventh: it
describes this dataset's own coverage and must never sit on a history axis at all.

**Scope finding, non-blocking: 338 of 505 `as_of` values are legacy fact-years sitting in a
provenance field.** They are not lies; they are undocumented, and once `as_of` is off every axis
they are also harmless. Re-stamping them needs one source read per claim and changes no chart and
no number. Four of them are worse than legacy — they match neither the fact nor any cited
publication: `e1-scale-010` (1935, but Galbi's sheet is named "estimates 1900-34"), `e4-medium-002`
(1993 for a 1992 crossover its own unit names), `e7-medium-006` (2025 for a 2024 figure),
`e7-targeting-002` (2025 for a mid-2022 rate).

This is why cross-check **cc-01 flags** at 17.6% divergence against `REPAIR-R3b.md` §11 (they
counted 51 misplaced claims, the audit finds 60), which trips `BUILD-PLAN.md`'s re-plan trigger.
It is a scope finding, not a blocker: the blocking work was `about_year`, and that is done.

**Known defects logged and not fixed here.**

- `e7-measurement-003`'s unit label says "2026" for a bot-traffic share whose source measures 2024
  traffic. Fixing unit labels was not this stage's job; the claim is withheld from the timeline
  until the read happens.
- `e5-targeting-005` now diverges from the frozen audit's *rule output*, not from its decision: the
  P1 base note put "FY2000" in the statement, so a re-run of the rule ladder would place it at
  2000. The claim's `about_year_note` records that FY2000 is the mail-volume comparator and 2001 is
  the filing's own reporting year. The `p1-timeline` gate caught this and demanded the note.
- A confirmed verdict that states a value only in its evidence prose is still invisible to every
  gate. §4's sweep was done by reading, not by machine. The cheap fix — a `values` block on
  confirmed verdicts — is a schema change to `verdicts.json` and was not taken here.
- R3c's cross-cutting finding **XC-1 (interval laundering)** is recorded, not gated. Two confirmed
  verdicts named a disconfirming value in their own evidence text and confirmed anyway because the
  interval covered it. The proposed rule — *a confirmation naming a value outside or below the
  central in its own evidence must escalate* — needs a verifier-behaviour change, not a data check.
- R3c's **XC-2** (a `ci80` whose upper bound is derived from a *different named entity* than the
  central is not an interval) would have fired at R1 and is deterministic. It is not implemented;
  the three claims it would have caught are repaired.

---

## 7. Verification state after P1

**All 21 deterministic checks pass**, including the new `p1-timeline`:

```
r1-records r1-claims r1-hygiene
r2-series r2-concordance r2-checks r2-reconcile r2-freeze
r3-coverage r3-verdicts r3-applied
r4-coverage r4-arithmetic r4-claims r4-simparams
r5-files r5-traceability r5-claimsfile r5-stale-prose r5-chapter-stale
p1-timeline
```

**All ten chapters clear the four readability gates** (FK ≤ 10, Ease ≥ 50, Fog ≤ 12, SMOG ≤ 12):

| chapter | FK | Ease | Fog | SMOG |
|---|---|---|---|---|
| 01-thesis | 5.97 | 76.66 | 8.03 | 8.47 |
| 02-the-middlemen | 7.09 | 65.91 | 9.59 | 9.98 |
| 03-sponsorship | 7.04 | 70.62 | 9.41 | 9.65 |
| 04-the-spot-market | 6.21 | 72.94 | 8.69 | 9.26 |
| 05-segmentation | 7.20 | 70.47 | 9.56 | 9.70 |
| 06-the-impression | 6.35 | 68.84 | 9.23 | 9.71 |
| 07-the-auction | 6.63 | 71.75 | 8.97 | 9.39 |
| 08-the-machine-market | 7.21 | 67.64 | 9.75 | 10.04 |
| 09-the-capture-question | 7.73 | 64.88 | 10.64 | 10.71 |
| 10-verdict-and-handoff | 6.68 | 71.58 | 8.77 | 9.19 |

### Chapter changes, by cause

| chapter | change |
|---|---|
| 01 | `e7-unit_econ-006`: 0.022 → **0.0165 cents**, and the claim table's range |
| 02 | `e1-buyers-008`: the $206m PI sum is no longer presented as the central; the 65% split and the 0.35 route weight are stated. Footnote 39 now cites the new `e1-measurement-005` |
| 03 | the unstated 65.3% collapse in CAB advertiser subscriptions is now said |
| 05 | `e4-measurement-003`: both bases named, Nielsen's rebuttal printed, framed as a charge not a measurement |
| 06 | `e5-unit_econ-001`: **display** impressions, numerator scope stated; footnote 44 carries the "pieces read" base note for `e5-targeting-005` |
| 07 | `e6-unit_econ-003`/`-002`: 0.33 → **0.35 cents**, and the margin's real derivation |
| 08 | the AI-cost series rewritten as **two lines**; 145.45x as an exact index; "stopped falling and ticked back up"; the ANA study's decomposition and geography caveat; the EMARKETER-vs-MAGNA rail warning |
| 09 | the rail warning between `e7-sellers-004` and `e7-medium-002`, plus footnote 28 |
| 10 | the cost series restated as two lines, 2025 at 0.0165 cents, the floor's rise; the triopoly share labelled with its rail; the 2000 impression row labelled display |

Chapter 04 needed no change.

---

## 8. Reproducing this

| artifact | how |
|---|---|
| the pre-repair audit | `verification/asof-audit.json` — **frozen.** `research/notes/build_asof_audit.py` now refuses to overwrite it and writes `asof-audit.rebuild.json` instead, because P1 edited eleven claim statements and a rebuild would destroy the evidence for what was wrong. Pass `--force` only if you mean it. |
| the verifier record for the open items | `verification/repair-p1-open-items.json` — untouched by this stage |
| the gate | `python3 tools/verify_p2.py p1-timeline` |
| proof the gate is not vacuous | `python3 p2-ad-market/research/notes/prove_p1_timeline_gate.py` |
| every supersession | `verification/verdicts.json`, entries with `superseded_by.stage == "P1"`, and the `post_r3_note_p1` summary |
