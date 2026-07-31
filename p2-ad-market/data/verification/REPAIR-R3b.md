# R3b — repair of the era-2 MEASUREMENT field, and the sweep that followed

**Ran**: 2026-07-31. **Authority**: the freeze rule in `../FREEZE.md` — "changing a frozen number requires the same discipline that produced it: a new stage with a contract, a verifier, and a recorded supersession." R3b is that stage. It follows the R2b precedent: the R3 record is not edited, it is annotated.

**Audit trail**: `repair-era2-measurement.json` (the full re-attack, with verbatim source quotations and page numbers) and this file (the postmortem).

**Result in one line**: three claims overturned, all three of which R3 had **confirmed**; one further arithmetically impossible statement found and deliberately **not** repaired; twelve open items handed to the human. No claim was invented, no number was averaged, and no R3 old/new value was edited.

---

## 1. What was wrong

The seed defect was `e2-measurement-005`. It said:

> The Nielsen Radio Index went commercial in December 1942 with 800 metered homes **covering roughly 25 percent of US households**, and had 47 subscribers by 1945.

That cannot be true. There were roughly 36 million US households in 1942 (the 1940 census counts 34.9 million occupied dwelling units). 800 homes is 0.0022 percent of that. For 800 to be a quarter of the country, the whole United States would need 3,200 households. The statement is wrong by a factor of about 11,000. That is four orders of magnitude. It is also the only claim in the 505-claim layer where a stated sample and a stated coverage share cannot both be true.

Re-attacking the whole MEASUREMENT field, rather than the one sentence, found the same failure mode twice more. All three had passed R3 as confirmed.

| Claim | What it asserted | What was wrong |
|---|---|---|
| `e2-measurement-005` | 800 metered homes covering ~25 percent of US households | The 25 percent belongs to the **region the sample was drawn from**, not to the sample. The claim turned Nielsen's central commercial weakness into a strength. |
| `e2-measurement-003` | Hooper's coincidental ratings ran ~20 percent above the CAB's **recall** ratings | The gap is **coincidental versus coincidental**. The CAB adopted Hooper's own technique in 1944. Against recall the direction was reversed in 1934. |
| `e2-measurement-007` | Nielsen spent ~$2M and nearly ten years "before the service became **nationally competitive in 1946**" | The money and the duration are exact. In 1946 the service reached 63 percent of US homes with six regions excluded. It was not national. |

A fourth defect was found inside `e2-measurement-005` independently of the brief: the headline count of **800 is contested**. The Museum of Broadcast Communications / *Encyclopedia of Radio* entry on the A.C. Nielsen Company says **500 homes**; its own "Audimeter" entry says **800**. The same encyclopedia contradicts itself, and the point interval `[800, 800]` excluded a credible published figure.

The MEASUREMENT field summary propagated two of these errors and added one of its own (it dated the Wanamaker line to 1919, contradicting `e2-measurement-009`, which R3 had already corrected to 1890). The era-2 `boundary_notes` carried the same 1919 dating, against era-1's already-correct version.

---

## 2. What the sources actually say

The source of record is Beville, *Audience Ratings: Radio, Television, Cable* (1988), chapter 1. The repair downloaded the 12.9 MB PDF, extracted 18,692 lines with `pdftotext -layout`, and searched the text directly. Every quotation below is from that extraction, not from a summary of it.

**On the Nielsen sample (p. 21-22):**

> In December 1942, despite wartime equipment shortages, Nielsen went commercial with an 800-home sample in the east central portion of the United States — **an area accounting for approximately 25 percent of households**. **Acceptance was limited for a service predicated on such limited geography**, but by 1945 the service had acquired 47 subscribers, mostly large advertisers and the networks.

The percentage modifies "an area". Beville's next sentence settles it beyond argument: "acceptance was limited for a service predicated on such limited geography" only parses if the 25 percent is a **ceiling** on the service's reach rather than a description of it. Under the corrected reading the arithmetic closes: 25 percent of ~36 million is ~9.0 million regional households, and an 800-home sample inside that is one meter per ~11,250 households.

**On the 20 percent gap (p. 9-10):**

> **Now that the CAB had adopted Hooper's coincidental telephone technique**, it could be assumed that the ratings would be reasonably close, even though the areas covered were not the same. Actually, Hooper showed higher radio usage, and thus higher ratings on the average, of 20 percent.

The CAB adopted the coincidental technique in 1944 (p. 9, p. 14). Beville's own end-of-chapter review question says so outright: "The CAB's final downfall was due to the consistent CAB-Hooper difference in **coincidental telephone technique results**." That is *why* the Zeisel finding was fatal. Same method, different answers, so the gap localised in execution rather than technique. Against recall the direction was the opposite. Beville, p. 12: "the first Clark-Hooper ratings showed a significantly lower level than those presented by the CAB for most programs."

**On the 1946 footprint (p. 22):**

> In a speech, Nielsen explained that his company had spent nearly 10 years and $2 million to refine the original Audimeter...

The $2M and the ten years are exact. Four independent datings close on each other. Audimeter acquired 1936 → 1946 speech = "nearly 10 years". Chicago pilot 1938 + "operated for four years" = the December 1942 launch. Zeisel presented 7 February 1946 + Beville's "only 6 weeks after" = 21 March 1946, the date Beville himself gives. What fails is the characterisation. In 1946 the NRI reached 63 percent of US homes on 1,300 Audimeters in 1,100 homes, with New England and virtually all of the Middle Atlantic, Southeast, Mid-South, Plains and Rocky Mountain states excluded. Beville's words are that Nielsen "was now ready to compete head on with" the CAB and Hooper — competitive *with* the national services, not itself a national service. Nielsen said the same in the speech being quoted: "While coverage of the remaining areas is definitely planned, the present area is considered sufficiently representative..."

**On the contested 800**: the settling primary — Arthur C. Nielsen, "Two Years of Commercial Operation of the Audimeter and the Nielsen Radio Index", *Journal of Marketing* 9:3 (1945), 239-255 — was **not reachable**. SAGE returned HTTP 403 and HathiTrust returned HTTP 403, and no open full text was locatable.

---

## 3. What changed

### `../eras/era-2.json`

Three claims replaced in full, each a complete calibration object (id, statement, central, unit, ci80, grade, sources, as_of, and a method where one is needed). Claim IDs kept.

| Claim | central | ci80 | Other changes |
|---|---|---|---|
| `e2-measurement-003` | 20 → **20** (unchanged) | [15, 25] unchanged | Statement rewritten to name the 1944 method switch and the same-method comparison. Unit now reads "percent by which Hooper's **coincidental** ratings exceeded the CAB's **coincidental** ratings on average, 1944-46". Source citation gains the page range. |
| `e2-measurement-005` | 800 → **800** (unchanged) | [800, 800] → **[500, 800]** | Statement now attaches the 25 percent to the region and states explicitly that it is not the sample's coverage. Unit names the base. Two Museum of Broadcast Communications sources added, one giving 500 and one giving 800. **Method added** recording that the interval was widened, not averaged, and that the settling primary was unreachable. |
| `e2-measurement-007` | 2 → **2** (unchanged) | [1.5, 2.5] unchanged | "Nationally competitive in 1946" removed. Statement now carries the 63 percent / 1,300 meters / 1,100 homes footprint and points forward to April 1949. Unit says the figure is self-reported. **Method added** requiring the attributive framing ("Nielsen said") never be dropped in prose. |

Note what did **not** change: every central. This repair moved no headline number. It corrected what those numbers were *about* — which is the reason a value-only check could never have caught it.

Also in `era-2.json`:

- **MEASUREMENT summary** rewritten on three points. It now names the CAB's 1944 switch to the coincidental technique, and says the first Clark-Hooper ratings came in *lower*. It carries the east-central confinement, instead of placing "800 metered homes" and "97 percent of US homes" in one clause. And it dates the Wanamaker line to 1890 in *Printers' Ink*, with 1919 as the first attribution, matching `e2-measurement-009`.
- **`boundary_notes`** corrected on the same Wanamaker dating, bringing era 2 into agreement with era 1, which was already right. This applies an outstanding R3 finding recorded in the `disagreement` field of the `e2-measurement-009` verdict and never actioned.

### `verdicts.json`

The three R3 entries still read `"verdict": "confirmed"`, and their evidence text is untouched. That text is the historical record of what R3 actually concluded. Editing it would destroy the only evidence of how the failure happened. Each now carries a `superseded_by` block naming stage **R3b**, the reason the R3 conclusion does not survive, the governing value, and the audit trail path. `supersession_note` was extended to cover `open_defect`; a new `post_r3_note_r3b` records the batch.

### `claims.json`

The four affected entries were rebuilt verbatim from the era records, with `origin` preserved. The three corrected claims move from `verdict: confirmed` to `verdict: adjusted`. All 501 other entries and the `dropped` list are byte-identical — asserted programmatically during the edit, not by inspection.

### `../../research/03-sponsorship.md`

The only chapter that states any corrected figure. Two paragraphs rewritten:

- The Hooper paragraph no longer says "it did not go the funders' way". It now says what happened: the first Clark-Hooper ratings *did* come in below the CAB's, the CAB adopted Hooper's method in 1944, the two should then have converged, and Hooper still ran 20 percent higher. "Same method, different answers. That is what made the finding fatal."
- The Nielsen paragraph now says the 800 homes all sat in the east central states. The quarter is the size of the region, not the reach of the sample. It was a ceiling rather than an achievement. And in March 1946 the service still reached only 63 percent of US homes.

Readability after the edit: **PASS** on all four gates (fk_grade 6.95, reading_ease 71.31, gunning_fog 9.35, smog 9.59) — slightly better than before. Frontmatter updated to match.

### `../eras/era-5.json`

One marker added, no value touched — see section 5.

---

## 4. Why the error survived R1, V1, R3 and V3

This is the part that matters. The error was not subtle in its consequences (a factor of 11,000) but it was invisible to every gate the pipeline runs, and it was invisible for a **structural** reason, not because anybody was careless.

### The claim schema has exactly one number in it

A claim carries one `central`, one `unit`, one `ci80`. Every other number in a claim lives inside `statement`, which the schema treats as an opaque string. In `e2-measurement-005` the calibrated value was **800** and the calibrated unit was "metered homes… December 1942". The 25 percent was never a value at all. It was prose.

So the defect lived in the one part of a claim that no automated check has ever read as data. That is the single sentence that explains all four gate failures below.

### R1 — era fan-out

R1's job is to produce records that satisfy the rigor spec. It did. `e2-measurement-005` had an id, a statement, a central, a unit, an 80% interval, a grade, a source and an as-of date. Nothing in R1's brief asks a researcher to reconcile a claim against itself.

### V1 — R1's verifier

V1 ran three deterministic invariants and three judgment ones. Trace each against this defect:

- **r1-acq-01** validates the record against the JSON Schema: field presence, summary length, event count, ISO dates. A schema cannot express "the share and the count must reconcile".
- **r1-val-01** is `check_claim` in `tools/verify_p2.py`. Read it. It checks that the eight keys exist. It checks that the ID matches the convention and is unique. It checks that `central` sits inside `ci80`, that `grade` is in {A,B,C}, and that grade C carries a method. It checks that `sources` is non-empty and `as_of` is ISO-shaped. Every one of those checks is about **the shape of the object**. Not one of them looks at what the object says. V1's own report records the check as "non-vacuous: iter_claims yielded 440 claim objects… each checked for the 8 calibration keys". It was non-vacuous and it was irrelevant.
- **r1-val-02** greps for podcast sources and caps era-1 SCALE claim count.
- **r1-val-03** (judgment) checks the pre-cleared timeline corrections from PLAN.md. This one failed in an interesting way of its own. That list *includes* "Wanamaker/first-banner flagged as legend unless newly proven", and V1 passed it. The invariant asks whether the line is **labelled a legend**, which it was. It does not ask whether the **date attached to it is right**, which it was not. A judgment check inherits the blind spot of its own wording.
- **r1-rdy-01** (judgment) checks that neighbouring eras agree on shared facts. This one had a real chance: era-1's boundary note carries the correct 1890/1919 Wanamaker chain and era-2's carried the wrong one. The auditor sampled the money handoffs — 1919, 1949, 1976, 1993 totals, medium by medium, to the dollar — and reported agreement. It checked the numbers that look like handoffs. It did not diff the prose.
- **r1-rdy-02** (judgment) checks scout-gap coverage.

Six invariants, none of which is pointed at the inside of a sentence.

### R3 — adversarial claim verification

R3 is the gate that should have caught this, and it is the most instructive failure of the four, because **R3 did the hard part right and still got the wrong answer**.

The verifier downloaded the Beville PDF, extracted the text, found the passage, and quoted it correctly in the verdict:

> Located verbatim in Beville: 'In December 1942… Nielsen went commercial with an 800-home sample in the east central portion of the United States — an area accounting for approximately 25 percent of households…'

Then it wrote:

> All four elements — December 1942, 800 homes, ~25 percent of households, 47 subscribers by 1945 — **match exactly**.

Three of the four do. The fourth matches **as a string** and inverts **as a fact**. In Beville the phrase "approximately 25 percent of households" modifies *an area*; in the claim it modifies *the 800 homes*. The verifier compared tokens across source and claim and never asked what the tokens referred to. And it ran no arithmetic — one division would have ended the matter.

The same one-sentence-window mechanism passed the other two:

- `e2-measurement-003`: the verifier quoted "Hooper showed higher radio usage… of 20 percent" and stopped. The sentence *immediately before it* in Beville begins "Now that the CAB had adopted Hooper's coincidental telephone technique". Read alone, the quoted sentence is compatible with the claim. Read with its predecessor, it is not.
- `e2-measurement-007`: the verifier wrote "the 1946 dating is right" and confirmed. The dating is right. The disconfirming figure — 63 percent of US homes — sits **four lines above the quoted sentence on the same page**.

The window was the failure. Verification read a sentence where it needed to read a paragraph.

### V3 — R3's verifier

V3 has four invariants. Two are deterministic and two are judgment, and the defect slips between them cleanly:

- **r3-acq-01** counts verdicts: every claim has exactly one, none is `unverified`, all labels are legal. It cannot evaluate a verdict's content.
- **r3-val-01** and **r3-rdy-01** only examine **adjusted** and **rejected** verdicts — do they carry old/new/reason, is the post-adjustment object rigor-valid, does the record match the delta. `e2-measurement-005` was **confirmed**. A confirmed verdict is checked for exactly one thing in the deterministic path: that the string "confirmed" is in the enum. There is no deterministic check anywhere in the pipeline that can disagree with a confirmation.
- **r3-val-02** is the judgment check, and it is the only gate that reads a confirmed verdict's reasoning. Its test is **citation-echo**: "a confirmation whose only evidence is the claim's own cited source violates this invariant." It samples at least 3 confirmed verdicts per batch. The sample is weighted toward verdicts whose `sources_consulted` adds no URL beyond the claim's own citation.

Now look at what that test rewards. V3's report names the era-2 sample it drew. One of the entries is `e2-measurement-001`, praised in these words: *"Located verbatim in the Beville PDF I downloaded and text-extracted."* That is the same verifier, the same session, the same PDF. It is also the same phrasing that appears on the `e2-measurement-005` verdict.

**The anti-citation-echo test measures retrieval, not comprehension.** A verifier who downloads the primary source, extracts its text and quotes it verbatim passes that test about as strongly as it can be passed. That is precisely what the failing verdict did. The test was built to catch a lazy verifier. It cannot see a diligent one who misreads.

Sampling made it worse but did not cause it. Three-plus verdicts drawn from an era-2 batch of 66 claims gives this claim a low chance of being picked. And picking it would only have helped if the auditor re-read Beville rather than the verdict.

### The common cause

Every gate compared **an artifact against a specification**. Schema against schema, key against key, verdict label against enum, citation against source. Not one gate compared **a number against another number in the same sentence**. That is the hole, and it explains why a four-order-of-magnitude error walked through five stages and two human gates without a single red light.

The sweep in section 5 confirms this is a systematic hole rather than a one-off. Every finding it produced, except the seed, lives in a subordinate clause, an anchor citation, or a comparison a claim makes in passing. Those are the parts of a claim that carry numbers but are not `central`.

### The gate that would have caught it

> Any statement containing both an absolute count and a percentage must name the percentage's base explicitly in `unit` or `method`, and the count / share / base triple must be arithmetically reconciled before the claim can pass.

That single mechanical check would have stopped `e2-measurement-005` at R1, before a human ever saw it. It is cheap and it is deterministic. It is **not implemented** — implementing it means teaching `check_claim` to parse statements, which is a real piece of work and is left as a recommendation, not smuggled in under a repair.

A second, narrower gate follows from `e2-measurement-003` and `-007`: a confirmation must quote **the sentence before and the sentence after** the one it relies on. Both failures are one-sentence-window failures, and both disconfirming sentences were adjacent to the quoted one.

---

## 5. The sweep

After the seed defect was repaired, all 505 claims in `claims.json` were swept for the same failure mode. The target: numbers inside statements that no gate ever checked against the claim's own central, against each other, or against an external base.

**Checked**: 505 claims. **Findings**: 12 — two IMPOSSIBLE, four SUSPECT, six WORTH A LOOK.

The sweep ran these checks, among others:

- Interval sanity: central inside ci80, inverted and degenerate intervals, relative width and one-sided skew ranked across all 505.
- Every "percent of US households / homes / families / population" claim against a Census reference series, 1850-2026.
- Share reconciliation: every stated percentage against every ordered value pair in the same statement. 67 candidates surfaced, all hand-adjudicated.
- Unit-confusion detection at 1e2, 1e3, 1e6 and 1e9 rescalings. 86 candidates surfaced, all hand-adjudicated.
- Dollar centrals against nominal US GDP for the as-of year.
- Money-type pool partitions against published totals for 1914, 1949, 1950, 1975, 1993, 2000 and 2025.
- Component sums against stated totals, and per-unit prices against volume and revenue held elsewhere in the record.
- Part-exceeds-whole in every "A of B" dollar pair, and count nesting where "N of the M" has N > M.
- Every panel or sample size against its stated universe.

**The data layer came out of this well.** All four money-type partitions close against their published totals. 1949 sums to 5,210 exactly, 1975 to 27,900 exactly, 1993 to 140,956 exactly. 2000 and 2025 over-allocate by exactly the 0.22 and 0.6 points the record itself declares. No claim inverts its interval. No central sits outside its own ci80. No US ad-spend figure is implausible against nominal GDP. The long derived chains reconcile to the decimal. Google's seven-year TAC series. The 2002-2008 growth decomposition. The 1938 radio dollar against the FCC's audited $100,892,259. The USPS piece-count chain, the 1949 radio split, and the Nielsen 1973 TV panel ratio.

The seed defect is genuinely isolated **as a magnitude failure**. It is the only claim where a stated sample and a stated coverage share are irreconcilable. The three structurally identical sibling claims — `e3-measurement-002`, `e4-measurement-004`, `e2-events-002` — all pass the same test. `e3-measurement-002` passes it with room to spare: 1,200 metered homes × 54,000 = 64.8M TV homes in 1973 against an actual ~66.2M.

What the sweep found instead was the **milder** version of the same failure mode, spread thin: secondary numbers inside statements that no gate ever checked against the primary.

### The second IMPOSSIBLE finding was deliberately not repaired

`e5-events-007` says 21 dot-com ads were "close to 20% of the 61 spots available". No pairing of those numbers produces that share: 21/61 = 34.4 percent, 14/61 = 23.0 percent, and 20 percent of 61 = 12.2 ads, which matches neither count. The rest of the sentence is sound (14 + 5 + 2 = 21, and $44M / 21 = $2.10M against the stated ~$2.2M).

It was left alone, and marked instead. Three reasons:

1. **The sweep did not establish the correct figure from a source.** It offered a hypothesis: a corrupted "close to 20 **of** the 61 spots". It then said to check the source first, "because 34% and 20% tell different stories about how far the bubble reached into the Super Bowl."
2. **The error is in the source, not in our paraphrase.** The R3 verdict quotes the cited Wikipedia article as saying the 21 ads "amounted to nearly 20% of the 61 spots available". R3 imported that string verbatim. Repairing it means deciding whether to correct the source's arithmetic, read it as a corrupted count, or drop the share — a call about a source, not a data-entry fix.
3. Writing either candidate number would be **inventing a replacement**, which this repair does not do.

The marker lives in three places so it cannot be missed: an `open_defect` object on the claim in `../eras/era-5.json`, the same object on the claim in `claims.json`, and an `open_defect` on the R3 verdict in `verdicts.json`. Each states that no value was changed, that `central` 14 and `ci80` [14, 21] are not in question, and what a human has to decide. **No chapter is exposed**: chapter 06 carries only the fourteen in-game advertisers and the ~$2.2M spot price.

---

## 6. Open for the human

Nothing below was changed. Each needs either a source read or a judgment call.

**Impossible as written, awaiting a source decision**

1. **`e5-events-007`** — "close to 20% of the 61 spots available". See section 5. Marked in three files.

**Probably wrong, need a source check (SUSPECT)**

2. **`e5-targeting-005`** — the direct-mail benchmark inside the claim implies a 15.9 percent response rate, from 1.7M responses over 10.7M pieces. That contradicts `e4-targeting-004` in the same record by a factor of eight. `e4-targeting-004` reads: "a 2% response rate… was the working definition of a successful direct-mail campaign". Separately, US standard mail ran ~90 billion pieces in 2000, about 247 million a day, against the 10.7 million stated — a 23× gap. On actual volume, 1.7M responses/day is 0.7 percent, which *is* plausible. The responses figure is credible; the denominator is not. Re-read the Overture FY2001 10-K passage, or cut the denominator and keep "1.7 million responses per day".
3. **`e7-unit_econ-005`, `-006`, `-007`** (and the 2023 comparator) — interval discipline across the whole AI-inference-cost chain. Each is stated as a precise point while carrying an 80% interval 19.5× to 28.0× the width of its own central, skewed up to 115:1. These are the three widest relative intervals in the file; the next worst is 3.6×. The stated "145-fold fall" is compatible with a fall as small as 5-fold, and `-006` and `-007` share an identical central so the "stopped falling" finding sits entirely inside interval noise. Either tighten the intervals or restate the chain as an order-of-magnitude range and drop the "145-fold" and "stopped falling" language. **As they stand these cannot carry a chart line or a stated trend** — relevant to the build, not just to the text.
4. **`e7-sellers-004`** — 71.9 percent of US digital *and* 59 percent of US total implies digital is 82.1 percent of total, against `e7-medium-002`'s 74 percent. The record's own dollars give 0.719 × $294.593B = $211.8B = 53.2 percent of $398B, not 59. The 59 only reconciles on EMARKETER's broader digital base. Add the basis note or restate on the same rail; the gap is about $23B.
5. **`e5-unit_econ-001`** — $7.00 effective revenue per impression sits below the arithmetic floor two other claims set for the same year and market. That floor is $8.087B over at most 688bn impressions, or $11.75 CPM. The whole ci80 [$4, $11] is under it. It reconciles only as banners: 0.48 × $8.087B / 688bn = $5.64. Relabel the claim and its unit as banner/display revenue per delivered **banner** impression.

**Worth a look**

6. **`e1-buyers-008`** — the five-line *Printers' Ink* 1911 tabulation offered as the anchor sums to $206M, more than the $192M figure it anchors, in an earlier year inside a growing market. The first three lines alone sum to 193, within 0.5 percent of the carried 192, which suggests the central was built from a subset while the statement presents all five. State which lines roll in, or re-derive.
7. **`e7-pricing-005`** — "leaving roughly $22B" presents the $22B as a consequence of the 36-cent figure. It is not: 0.64 × $88B = $56.3B. The $22B is the ANA's separate *recoverable* subset. Reword to "of which the ANA identified roughly $22B as recoverable".
8. **`e4-measurement-003`** — compares 33 percent of people-meter *households* against 26 percent of the US *population*, and the comparison is the whole point of the claim. Pay-cable penetration is a household statistic. Change the base so the two sides are like quantities.
9. **`e6-unit_econ-002` vs `-003`** — two values for the same quantity (Google's 2007 non-TAC serving cost per query): $0.0035 in one, ~0.33 cents in the other. The stated 85 percent margin only follows from the smaller. Immaterial to the argument, visible if the two are ever shown together.
10. **`e2-measurement-001` vs `e2-buyers-003`** — inside the field this repair re-attacked, and *not* resolved by it. The CAB's advertiser subscriber count falls from 49 in 1930 to 17 by 1934, a 65 percent decline, while the claim pair is used to argue the ratings business was growing. (The first-year revenue itself implies $674/subscriber against a $70 monthly rate, so 1930 is probably a partial year.) The repair confirmed both claims individually; it did not reconcile them against each other. If the counts are on the same definition, the shift from advertiser-paid to agency-paid is a stronger fact than either claim currently states and should be said out loud. Chapter 03 currently states the 1934 pair without the 1930 comparison.

**Systematic**

11. **The `as_of` field means two different things.** In eras 1-5 it is the year of the fact; in era 7, `mechanism.json` and `adspend.json` it is frequently the source's publication or retrieval date. Nine claims fall outside their own era's declared year window. Era 1 holds 1835, 1921-11, 1926-01 and 1935; era 2 holds 1890; era 3 holds 1979 and 1982; era 4 holds 1974; era 6 holds 2009. A further 42 claims have an as-of year that does not appear in their own unit label. `e7-events-002` stamps a 2009 fact as_of 2026-04. `ds-gdp-001` stamps a 1922 fact as_of 2008-09-14. This changes no number. **But any chart using `as_of` as an x-axis plots roughly 50 claims in the wrong decade**, including the 2009 internet-revenue decline, which lands in 2026. Decide whether `as_of` means "the date the fact refers to" or "the date the source was published", and split into two fields if both are needed. This is a build blocker in a way the rest of this list is not.

    Note that era 2's out-of-window entry is `e2-measurement-009` at 1890, and it is the same claim whose boundary note this repair corrected. R3's own verdict flagged that 1890 falls inside era 1's window and that the claim arguably belongs there. R3b corrected the dating and left the placement alone, because moving a claim between eras is a records decision, not a repair.

12. **Unbacked assertion in the era-2 MEASUREMENT summary**: "the Audit Bureau of Circulations dated from 1914" carries no claim ID and was not verified in this run. It is widely attested, and era-2's `boundary_notes` assign it to era 1 to establish. It was left in place. Give it a claim ID or drop it.

---

## 7. What this repair did not do

- It did not edit a single R3 `old` or `new` value. The three overturned entries still read `"verdict": "confirmed"` with their original evidence intact, because that text is the only evidence of *how* the failure happened, and section 4 is built on it.
- It did not invent a number. Where a source was unreachable (`Journal of Marketing` 9:3, HTTP 403) the interval was **widened** to span the conflict, not averaged to the midpoint, and the widening is recorded in the claim's own `method`.
- It did not implement the recommended gate. The check in section 4 would need `check_claim` to parse statements; that is a change to the verifier and belongs to whoever owns the next stage, not to a repair pass.
- It did not touch the ten remaining open items in section 6.

## 8. Checks

| Check | Result |
|---|---|
| `verify_p2.py r1-records` | PASS |
| `verify_p2.py r1-claims` | PASS |
| `verify_p2.py r3-coverage` | PASS |
| `verify_p2.py r3-verdicts` | PASS |
| `verify_p2.py r3-applied` | PASS |
| `verify_p2.py r5-traceability` | PASS |
| `verify_p2.py r5-claimsfile` | PASS |
| `verify_p2.py r5-stale-prose` | PASS |
| `verify_p2.py r5-chapter-stale` | PASS |
| `verify_p2.py r2-reconcile` | PASS |
| `readability.py` on all ten chapters | PASS on all four gates |

`r5-stale-prose` and `r5-chapter-stale` passing is worth one line of scepticism: both only fire when an **adjusted verdict changed a central**, and this repair changed no central. They are silent here because they have nothing to say, not because they inspected the corrections. The corrections were checked by hand against each claim's own value instead.
