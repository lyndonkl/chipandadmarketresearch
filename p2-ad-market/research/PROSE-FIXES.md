---
title: Prose fixes
project: p2-ad-market
status: working document
note: Internal. Exempt from the readability gate.
---

# Prose fixes

One list, merged from three audits: the cold-reader pass, the three line-edit passes, and the structure pass.

Work top to bottom. Do the structural fixes first, read RULES TO HOLD once, then take the chapters in order. Inside each chapter the order is fixed:

1. **Cannot follow** — a first-time reader stops or guesses. Fix these even if you fix nothing else.
2. **Filler and banned words** — "So" openers, "there is/are", "it is worth", double em dashes, meta-framing.
3. **Style** — hidden actors, zombie nouns, loose pronouns, register.

Line numbers are locators from the current draft, not anchors. The quoted sentence is the anchor. Line numbers shift as you edit, so search for the sentence rather than jumping to the number.

Where a fix changes a number or a fact, it says so and names the claim to check. Do not apply those blind.

---

# THE WHOLE PIECE

## The one change that would most improve the read

**Rebuild chapter 10 around the counting ledger instead of recapping chapter 7.**

Cut the sections "Two engines, not one" through "How much credit each engine gets", plus "The auction died, the lever did not" and "The deals outlived the auction". That is roughly 60% of the chapter, and every fact in it already appears in chapter 1 and chapter 7. The two-engines argument is currently made three times in the piece.

Put in their place one chronological ledger of who held the tape measure, one entry per era, built entirely from material already written in chapters 2 to 8:

- 1914, the Audit Bureau of Circulations, paid by advertisers, agencies and publishers together (ch02).
- 1930, the CAB, paid by buyers, who kept sellers off the subscriber list until 1937 (ch03).
- 1934, Clark-Hooper, paid by magazine publishers who wanted radio's numbers cut, and who got numbers 20 percent higher instead (ch03).
- 1950, Nielsen, sold to both sides at once, about 1,200 meters pricing a national market (ch04).
- 1964, the Broadcast Rating Council, an auditor the industry pays for (ch04).
- 1987, the people meter, which cut the measured prime-time audience about 10 percent overnight with nothing changing on screen (ch05).
- 1994 to 2001, the ad server log: the seller owned the meter and the buyer had nowhere to appeal (ch06).
- 2002, the seller predicts the click, ranks by its own prediction, decides which clicks are real, bills its own log, and no industry standard for counting a paid click exists until 2009 (ch07).
- 2019, the seller tunes the ranking with an exponent it has never disclosed (ch08).

The eighty-two years then count themselves, and the last sentence of the piece can be the arc in one line.

Why this one. It is local: one chapter, mostly deletion of material the reader already has twice. It fixes the ending, removes the largest block of repetition in the piece, and makes chapters 2 to 5 pay a dividend they currently do not pay. It resolves the three-way conflict over when the break happened, because a ledger has to put it on one line. And it turns chapter 9 from a rival ending into a penultimate chapter: ch09 answers where the money went, ch10 answers who was watching.

**One companion edit is required.** Chapter 1 must promise it. Promote line 38 ("Change the counting and you change the price") out of the middle of the era section and make it the chapter's second paragraph, with the eighty-two years and the two dates, 1914 and 1996, named in the same sentence. A promise at line 20 and its payoff at the last line of chapter 10 is the whole arc, and everything written in between already supports it.

## Structural fixes

**W1. Chapter 10 states the arc backwards.** `10 L67` The bolded line "**The seller still counts the audience.**" sits under the heading "What Google did not change". Under the piece's own arc, seller-counting is what Google *did* change. Move that block out of "What Google did not change" and give it its own section, named for the break, as the head of the ledger in the one change above.

**W2. Chapter 9 to chapter 10 is two verdicts in a row, with no join.** Ch09 closes on "Reallocation, with a genuine capture inside it, and no expansion at the level of the economy" plus a "What would change our minds" section, which is a closing move. Ch10 then opens "Google built two machines" and restarts in 2002. Neither capture, reallocation nor expansion appears in ch10's argument. Fix by giving ch10 a different question, per the one change, and opening it with one sentence that names the handover: money is settled, counting is not.

**W3. The 2019 fork is told four times.** `01 L86-88`, `07 L262`, `08 L61-81`, `10 L83-89`. Same six facts each time: first price on 5 September 2019, rGSP at 5.91 percent, the three court-named levers, $26.3bn of 2021 default payments, the 2024 "it can" finding, the September 2025 remedy. Keep it in ch08, where it is the era's own material, and in ch01, where it is a signpost. Cut the "The signpost" section in ch07 (`L248-266`) to two sentences that point forward without delivering the payload. Cut "The auction died, the lever did not" from ch10.

**W4. The eras are numbered one behind the chapters, and the piece cross-refers by number.** `06 L74` "Era 2 would have recognised the contract on sight", `06 L134` "Era 6 turns on that fact", `06 L154` "Era 6 inherits", `08 L17` "the mechanism that era 6 was named for", `08 L87` "Era 6's auction", `08 L97` "the middle of era 6", `08 L159` "In era 6", `10 L154` "Do not borrow era 7's evidence for era 6". Every one costs the reader a trip to the contents page. Refer to eras by name and decade throughout: "the radio sponsors of the 1930s", "the auction years", "the machine market". Keep the numbers in the ch01 table and in the data layer only.

**W5. "P3" is never explained in any of the ten chapters.** `01 L92`, `08 L209`, `10 L113`, `10 L119` (section heading "The cost series P3 inherits"), `10 L148` (heading), `10 L152`, `10 L155`, `10 L156`. Introduce it once, in ch01, as "the next project in this series, which prices ad-funded AI", then use "the next project" everywhere else. Rename the two ch10 headings: "The cost series the next project inherits" and "What the next project inherits as open".

**W6. Chapter 1 promises a shape the chapters do not keep.** `01 L120` "Seven chapters, one per era, each answering the same fixed set of questions: who made the ads, who paid, who owned the audience, who counted it, who set the price, and by what rule." No chapter uses those six as headings, none uses them in that order, and "who made the ads" has no section at all in ch04 or ch06. Either keep the promise or cut the sentence. Do not leave it. Keeping it means six identically named sections per era chapter, which would also make the counting arc visible by construction.

**W7. Chapter 1 promises a simulator that does not exist.** `01 L120` "Era 6 carries the worked auction numbers and a simulator you can bid in." Ch07 has three invented worked examples and no simulator. Cut the clause or build the simulator.

**W8. Move "How to read the numbers" ahead of the first grade.** `01 L94`. Grade C is used at `L46`, `L58` and `L64`, four sections before A, B and C are explained. Move the section up to sit directly after "We cut the story at the mechanism".

**W9. Three chapters each claim the same rupture as their own.** `06 L88` "This is the first era in which the seller owned the meter and the buyer had nowhere to appeal." `07 L79` "So the seller predicted the click, ran the auction, decided which clicks were real, and billed against its own log." `08 L125` "For a century the market's discipline was simple... That rule broke here." On one straight read this looks like forgetting, not escalation. Pick one break date, say it once, and make the other two chapters escalate from it rather than announce it.

**W10. The Wanamaker debunk is told six times, and one telling contradicts the other five.** `02 L189`, `03 L135`, `05 L62`, `06 L162`, `09 L173`, `10 L71`. Five give the 1890 print appearance and the 1919 credit. `06 L162` says the line "has no sourced provenance in our record". Cut the debunk to two places: ch02, where the era owns it, and ch09, where it is evidence in the argument. Delete it from ch03, ch05 and ch10. Fix ch06 per item 6.6.

**W11. The chapter 4 to chapter 5 boundary is contradicted by chapter 5's own dates.** Ch05 dates PRIZM to 1974 (`L54`, before the boundary), cable ad money to $72m in 1980 (`L38`, well after it), and ch04 itself gives the ZIP code as 1 July 1963 (`04 L94`). The wall is in the wrong place, or the chapter has to argue for it. Add one paragraph at the head of ch05 naming what actually changed in 1976, or move the boundary.

**W12. Chapter 5 hands forward to the auction and chapter 6 does not pick it up.** `05 L128` ends "When a machine finally arrived that could take a stated want and sell it by auction, that is the money it took first." Ch06 opens on HotWired in October 1994 and the auction is two chapters away. Add one bridging sentence at the head of ch06 saying the machine took seven years to arrive, and that it sold something else first.

**W13. Three citation systems, none explained.** Ch03 and ch08 print bare claim IDs in the running prose (`[e2-creators-002]`, `[e7-events-001]`). Ch02, ch06 and ch09 use numbered footnotes. Ch04, ch05, ch07 and ch10 use neither and put sources in a closing paragraph or table. Pick one. If you keep the bracketed IDs, say once, in ch01, what the brackets are.

**W14. Chapter 9 is the sag point and needs cutting, not polishing.** It is the hardest prose in the set on its own metrics: fk 7.81, ease 63.86, fog 10.80, all the worst of the ten. It is also the third telling of the seams. Ch01's "How to read the numbers" already gives them, and ch06 already gives the four-pool table with the same directory caveat. Cut the seam material here to the two seams the argument actually uses, the 1980 bridge and the internet-line gap, and cross-refer the rest.

**W15. Chapter 5 has no protagonist and no scene.** Ch02 has Palmer, Benjamin Day and Samuel Hopkins Adams. Ch03 has the $50 Queensboro sale and Jack Benny at $3,000 a Hooper point. Ch04 has Pat Weaver and the quiz-show scandal. Ch05 has Jonathan Robbin for one sentence, then nine sections of shares and postal rates. Its one dramatic moment — the September 1987 people meter, "Nothing about the audience changed that September. Only the instrument did." — is the eighth of ten sections. Move it forward, to sit directly after "The census becomes a targeting tool".

**W16. Chapter 7, line 187 is one paragraph of thirteen sentences carrying four arguments.** Size of search, the undercount in the Coen series, the 2008 seam, share of GDP. Every word is decodable; the paragraph is not. Split it into four, one per argument.

---

# RULES TO HOLD

Fix the pattern, not just the instances. Counts are for the ten chapters as they stand.

## Banned constructions

**H1. No sentence-opening "So".** 35 instances. Every one opens a summing-up sentence whose logic the sentence before it already carries. Delete the word, or move "therefore" inside the sentence. Test: if you can delete "So" and lose nothing, it was filler. Densest in ch07 (7) and ch05 (7).

**H2. No sentence-opening "There is / are / was / were".** 20 instances, and they cluster wherever the point is an absence. Two fixes, always available: make the missing thing the subject ("No annual series exists"), or name who failed to act ("Nobody set a standard"). Prefer the second in a piece about who did things. Ch09 has seven, including one in a section heading.

**H3. No "it is worth ...ing".** 7 instances: "it is worth stating what it was not", "That number is worth holding against", "is worth holding in mind", "That is worth pausing on", "It is worth being precise about", "it is worth stating plainly", "One measurement caveat is worth keeping". Give the instruction directly, or delete the frame.

**H4. One em dash per sentence at most.** 9 sentences carry two, all in ch01 (3) and ch09 (6). Every one is a bare-apposition gloss that commas or brackets handle.

**H5. No meta-framing openers.** `02 L17` "This chapter follows what they built", `04 L18` "This chapter is about how that switch happened", `06 L21` "This chapter is about what that choice hid". Ch01 and ch03 open straight into the subject and read better for it. Start.

**H6. Budget "X, not Y" reversals to one per section.** 17 in ch01 to ch04 alone. Most earn their place, because these chapters exist to correct wrong beliefs and a correction needs both halves. At seventeen it is a tic. The ones doing rhythm only: "got standard, not fine", "a built estimate rather than a found one", "Not cost per thousand eyes, but cost per order".

## Habits

**H7. Every term gets its gloss at its earliest appearance in the whole series, not at its most convenient one.** The reader goes once, straight through. A definition downstream is no definition. Confirmed offenders below.

**H8. Name the actor.** The passive falls almost exactly where the argument depends on who acted. In nearly every case the doer is already named a sentence or two away, so the fix costs nothing. Offenders: "the sellers were kept out", "the quiz shows turned out to be fixed", "the client was billed", "The complaint had been filed", "Geography was bought", "Advertisers were not told", "Buyers were not told", "its guidelines were not published", "Three separate methods were run at it". Promote the doer to subject.

**H9. Say what the project did, in a verb.** Replace "Our best estimate is that" with "We estimate". "Our back-cast puts" with "Working backwards, we put". "Our decomposition puts" with "We put". "Our central of 10%" with "Our 10%". "the ratio is our construction" with "we built the ratio". "on our own deflation of two published index series" with "when we compared two published indexes". This keeps the project visible as an actor, which is the point of showing your working.

**H10. Attach a noun to "This" and "That" at a paragraph opening.** About a dozen. Two are actively wrong: `08 L81` and `10 L89` both state a true claim and then say "This is the most common factual error", so a first-read reader parses the truth as the error.

**H11. No delayed-subject clefts.** "What exists is five compilers", "What is left is the axis", "What the filings do show is the result", "The first thing this kills is", "The second thing the table shows is", "A share that large is what a handful of launches compound to". Six, all in ch09 and ch10. Subject first.

**H12. Keep the register plain.** The surrounding prose is deliberately plain, so these stick out: "dearer" (twice), "puffery", "well-attested", "handled with tongs", "put in Wanamaker's mouth", "enumerated", "regime change", "beachhead".

## Glossary: where each term must be glossed

Every term below is load-bearing and currently bare at its first appearance. Gloss it once, at the location named, in five to twelve plain words. Later uses then need nothing.

| Term | Gloss it here | Gloss to use |
|---|---|---|
| rate card | `01 L30` (table row 1) | the printed asking price for the space |
| take rate | `02 L59` | the middleman's cut |
| the upfront | `01 L32` (table row 3) | the spring week when networks sell the whole coming season in advance |
| 80% range | `01 L100` | a range with about an eight-in-ten chance of holding the true value |
| grades A, B, C | `01 L46` | move "How to read the numbers" above the first use (W8) |
| GDP | `02 L129` | the value of everything the country produces in a year |
| second-price | `01 L88` | the winner pays just above the next bid |
| first-price | `01 L36` (table row 7) | the winner pays its own bid |
| rGSP | `01 L36` | do not use the acronym in the table; describe the rule |
| net time | `03 L43` | air time, counted after discounts and agency cuts |
| nighttime power | `03 L47` | transmitter strength, which decides how far a signal carries after dark |
| daypart | `03 L85` | a block of the broadcast day, like morning or evening |
| sample frame | `03 L67` | the pool a sample is drawn from |
| projectable | `03 L67` | able to stand for the whole country |
| order of magnitude | `04 L90` | a rough count |
| penetration / household universe | `04 L188` | share of homes, against the counter's own count of homes |
| inventory | `04 L62` | ad slots for sale |
| currency (measurement) | `05 L110` | the count the trade prices against |
| syndication | `05 L68` | shows sold direct to stations (ch05 sense) — and see `07 L143` for the different sense |
| national spot | `05 L68` | spot buys across local stations |
| click / click-through rate | `06 L15` | a tap that carries the reader to the advertiser's page; the share of people shown an ad who make it |
| cookie | `06 L114` | a small tag a website leaves in your browser so it can recognise it later |
| ad network | `06 L72` | sells space on other people's sites and pays them a share |
| ad server | `06 L72` | the software that picks and delivers each ad |
| gross margin | `06 L72` | what a unit earns, less what it costs to serve |
| tertiary source | `06 L100` | reaches us third-hand |
| house ads | `06 L102` | the site's own ads, filling empty slots |
| display | `07 L262` | picture ads on ordinary web pages |
| shading | `07 L91` | bidding below your true value |
| stable equilibrium | `07 L93` | where nobody gains by moving first |
| landing-page quality | `07 L105` | the page the ad leads to |
| yield | `07 L238` | money per search |
| by construction | `07 L177`, `10 L46` | delete; say "every time" or "therefore" |
| defaults / default payments | `07 L264` | paying to be the search engine already switched on |
| exchange | `08 L21` | a marketplace where ad slots are traded |
| insertion order | `08 L27` | a signed paper order |
| symmetric benchmark | `08 L69` | the simple case where every buyer is alike |
| revenue equivalence | `08 L75` | the textbook result that both rules pay the seller the same |
| clearing price | `08 L73` | the winning price |
| price discrimination | `08 L59` | charging different buyers different prices |
| squashing exponent | `08 L87` | shrinks the gap between a good click rate and a bad one |
| attribution | `08 L133` | tying a sale back to the ad that caused it |
| signals | `08 L133` | the tracking records that made that possible |
| calibration | `08 L75`, `10 L130` | delete the word; say "the bands" or "how sure we are" |
| GDPR | `08 L117` | the European Union's privacy law |
| Meta | `08 L119` | the company behind Facebook and Instagram |
| MAGNA / EMARKETER | `08 L35` | the two research firms that estimate US ad spending |
| Chrome | `08 L155` | the web browser Google owns |
| IRS | `09 L36` | the US tax office |
| out of sample | `09 L86` | against data the bridge was not built from |
| partition | `09 L153` | a full carve-up |
| performance basis | `09 L165` | bought on results |
| warrant | `10 L36` | the right to buy shares at a fixed price |
| tokens | `10 L132` | the words a model writes, which is what it is charged by |
| 10-K | `10 L111` | Google's audited annual report to US regulators |
| the sign | `10 L26` | delete; say "has it backwards" |
| P3 | `01 L92` | the next project in this series (W5) |

---

# Chapter 01 — The Thesis

The reader's first page, and the worst offender in the piece. It front-loads its whole vocabulary and gives away every punchline.

## Cannot follow

**1.1** `L92` — "The last thread is the one P3 picks up."
- *Problem:* "P3" is never explained in any of the ten chapters. It recurs in ch08 and ch10, including in two section headings.
- *Fix:* "The last thread is the one the next project in this series picks up." See W5 for the rest.

**1.2** `L36` — table row 7, "In 2019 display goes first-price while search goes rGSP"
- *Problem:* Four unknowns in nine words. The reader does not know what display advertising is, what first-price means, that search ads are a separate kind, or what rGSP could stand for. This cell is supposed to fix era 7 in the mind and it fixes nothing.
- *Fix:* "In 2019 the market splits in two: ads on ordinary web pages start charging the winner its own bid, while search ads keep the older rule and have a twist added to it"

**1.3** `L30` — table row 1, "Agents broker space between advertiser and publisher; the publisher pays the agent a cut of the rate card"
- *Problem:* "Rate card" is used here, again at `L38`, in ch02, in a ch03 section heading and in ch05, and is never defined in the series.
- *Fix:* "Agents broker space between advertiser and publisher; the publisher pays the agent a cut of the printed asking price for the space"

**1.4** `L32` — table row 3, "The upfront market forms in 1962"
- *Problem:* A term of art at first appearance, fixing a whole era, conveying nothing. Ch04 glosses it, two chapters away.
- *Fix:* "From 1962 the networks start selling the whole coming season in one spring week, before it airs"

**1.5** `L33` — table row 4, "PRIZM sorts about 36,000 ZIP codes into 40 types, from 1974"
- *Problem:* A product name the reader has never heard, offered as the fact that fixes an era. Nothing says who made it or what for.
- *Fix:* "From 1974 a data firm sorts about 36,000 postal codes into 40 kinds of neighbourhood, so mailers can pick blocks rather than cities"

**1.6** `L34` — table row 5, "Price per thousand views, ported straight from print to the banner"
- *Problem:* "Ported" is software jargon. "The banner" names a format the reader has not met.
- *Fix:* "Price per thousand views, copied straight from print to the web banner"

**1.7** `L46` — "That is our own grouping, not a published one, so we grade it C and show the arithmetic."
- *Problem:* Grade C is used here, at `L58` and at `L64`, four sections before A, B and C are explained.
- *Fix:* Do W8, move "How to read the numbers" above this. If you will not move it, add: "(The three grades we use are explained at the end of this chapter.)"

**1.8** `L40` — "When Nielsen switched to people meters in 1987, the measured prime-time network audience dropped about 10% overnight."
- *Problem:* Nielsen has not been introduced. The reader does not know it is a private firm that counted the TV audience, and "people meters" is a term of art. The sentence's whole point cannot land.
- *Fix:* "In 1987 the private firm that counted America's TV audience swapped its old set-top counters for a box each viewer pressed a button on. The measured prime-time network audience dropped about 10% overnight."

**1.9** `L40` — "The best-aimed medium of the 1980s counted a 2% reply rate as a win, which means it missed 98 people in every 100."
- *Problem:* Which medium? Direct mail was named once, twenty lines earlier, in a different argument.
- *Fix:* "Advertising mail was the best-aimed medium of the 1980s, and the firms sending it counted a 2% reply rate as a win, which means it missed 98 people in every 100."

**1.10** `L88` — "Three separate pricing levers on the search auction are named in the 2024 US court findings, all of them worked by the seller."
- *Problem:* No court case has been mentioned. The reader does not know who sued whom, over what, or why a court would describe an auction's price levers.
- *Fix:* "In 2024 a US court ruled on whether Google held an illegal monopoly in search. Its findings name three separate ways Google could move the price of a search ad, all of them worked by the seller."

**1.11** `L90` — "Google alone booked $294.7 billion of ad revenue worldwide in 2025, and about half of all US general searches reach it through the deals the court examined, on which it paid $26.3 billion in 2021 alone."
- *Problem:* "The deals" has no antecedent. No deal has been described. The reader cannot work out what the $26.3 billion buys.
- *Fix:* "Google alone booked $294.7 billion of ad revenue worldwide in 2025. About half of all US general searches reach it because it pays phone and browser makers to make Google the search box that comes switched on. Those are the deals the court examined, and Google paid $26.3 billion for them in 2021 alone."

**1.12** `L88` — "It moved to rGSP, a second-price design with a random element, which raised the top-slot click price by about 5.9% on PCs and tablets in tests."
- *Problem:* The previous sentence defines first-price, but the series never defines second-price, so the contrast lands on nothing. Three ideas in one sentence.
- *Fix:* "It moved to rGSP, which keeps the pay-just-above-the-next-bid rule and adds a random element. In tests that lifted the top-slot click price about 5.9% on PCs and tablets."

**1.13** `L48` — "Keyword ads were 1% of US internet ad money in 2000."
- *Problem:* "Keyword ad" has not been defined, and the sentence carries the paragraph's whole claim.
- *Fix:* "Ads sold against search words were 1% of US internet ad money in 2000."

**1.14** `L100` — "Every number also carries an 80% range."
- *Problem:* Never defined here. The definition arrives in ch02, after the reader has passed it.
- *Fix:* "Every number also carries a range with about an eight-in-ten chance of holding the true value."

**1.15** `L92` — "In 2023 a written answer from a top-end model cost about 4.8 cents to produce, which is the whole of that."
- *Problem:* "A top-end model" names nothing the reader has met; no AI has been mentioned anywhere in the series. "Which is the whole of that" points back at a figure two sentences earlier.
- *Fix:* "In 2023 the best AI systems burned about 4.8 cents of computing to write one answer, more than that whole four cents."

**1.16** `L108` — "The tax deduction firms claim for advertising ran about 31% above measured media revenue by 2022, because it soaks up promotion, agency and software costs that never reach a media owner."
- *Problem:* "The tax deduction firms" reads as a compound noun on first pass. "Measured media revenue" is an undefined term of art.
- *Fix:* "By 2022 the advertising costs firms deducted from their taxes ran about 31% above what media owners actually earned, because the deduction also covers promotion, agency and software costs."

**1.17** `L20` — "By 1993 radio was down to 6.7% of measured US spend."
- *Problem:* "Measured US spend" is a term of art the reader cannot tell apart from "all US ad money" two sentences earlier, and the qualifier does no work.
- *Fix:* "By 1993 radio was down to 6.7% of US ad spend."

**1.18** `L64` — "Our best split of Google's own-site growth from 2002 to 2007 puts somewhere between 52% and 56% down to more searches and the rest down to more money per search."
- *Problem:* Zombie noun plus the idiom "puts X down to Y", which a first-year reader will not decode as "attributes".
- *Fix:* "Splitting Google's own-site growth from 2002 to 2007, we credit 52% to 56% to more searches and the rest to more money per search."

**1.19** `L74` — "The share of US advertisers paying their agency by commission fell from 61% in 1994 to about 10% by 2003, and the fall tracks the unbundling of media buying, not the arrival of search."
- *Problem:* "Unbundling" is undefined jargon carrying the sentence's whole point, in a two-nominalisation clause.
- *Fix:* "The share of US advertisers paying their agency by commission fell from 61% in 1994 to about 10% by 2003. What drove it down was advertisers hiring separate firms to buy media, not search."

## Filler and banned words

**1.20** `L24` — "So a chapter called "The Age of Radio" would be false on the money."
- *Problem:* H1. The paragraph above already carries the logic.
- *Fix:* "A chapter called "The Age of Radio" would be false on the money."

**1.21** `L80` — "There was no independent standard for counting a paid click until 2009, a year after this era closed."
- *Problem:* H2. It also hides that a whole industry chose not to act.
- *Fix:* "Nobody set an independent standard for counting a paid click until 2009, a year after this era closed."

**1.22** `L102` — "There is no one US ad-spend series running from 1919 to today."
- *Problem:* H2.
- *Fix:* "No single US ad-spend series runs from 1919 to today."

**1.23** `L102` — "There are five compilers who each measured a different thing, three of whom have stopped."
- *Problem:* H2, second in two sentences.
- *Fix:* "Five compilers each measured a different thing, and three have stopped."

**1.24** `L106` — "There are holes too, and we draw them as holes."
- *Problem:* H2.
- *Fix:* "Holes exist too, and we draw them as holes."

**1.25** `L22` — "Direct mail — catalogues, letters, flyers — was the largest national medium that year, ahead of TV."
- *Problem:* H4. Also uses "national medium" before the reader has been told national money differs from local money.
- *Fix:* "Direct mail (catalogues, letters, flyers) was the biggest medium selling nationwide that year, ahead of TV."

**1.26** `L46` — "In 2000 three intent channels — newspaper classified, phone directories and direct mail — came to $77.4 billion, about 31% of all US ad spend."
- *Problem:* H4.
- *Fix:* "In 2000 three intent channels (newspaper classified, phone directories and direct mail) came to $77.4 billion, about 31% of all US ad spend."

**1.27** `L102` — "Put that same year on the basis a rival uses — money that media owners actually received, rather than list prices billed — and it comes to about $231 billion."
- *Problem:* H4, wrapping a definition the reader needs inside an instruction the reader is still holding.
- *Fix:* "A rival counts money media owners actually received, not list prices billed. On that basis the same year comes to about $231 billion."

## Style

**1.28** `L114` — "The line about half of all ad money being wasted is usually put in John Wanamaker's mouth."
- *Problem:* H8 and H12. The passive hides who attributes, and Wanamaker is never identified in this chapter.
- *Fix:* "Most writers credit that line to John Wanamaker, who ran a big department store."

**1.29** `L114` — "The earliest link to Wanamaker is 1919, said by another man at a bible conference."
- *Problem:* Dangling passive. "Said by another man" attaches grammatically to "link", and "another man" names nobody.
- *Fix:* "In 1919 a speaker at a bible conference credited the line to Wanamaker. That is the earliest link we found."

**1.30** `L104` — ""Out of Home" replaced "Billboards" as a category in 2000, at 2.77 times the level, on identical 1999 data."
- *Problem:* H8. The passive hides who renamed the category, and "the level" has no noun.
- *Fix:* "In 2000 one compiler renamed its "Billboards" category "Out of Home", and the same 1999 data came out 2.77 times bigger."

**1.31** `L60` — "Shares in Overture, the firm that led paid search at the time, fell about 36% on the day the deal was announced."
- *Problem:* H8, in a paragraph whose point is what Google did to Overture.
- *Fix:* "Shares in Overture, the firm that led paid search at the time, fell about 36% the day Google and AOL announced the deal."

---

# Chapter 02 — The Middlemen

## Cannot follow

**2.1** `L59` — "So the take rate at the end of this era is clean: the agency took 15 percent of gross billings, and the publisher kept the other 85 percent."
- *Problem:* "Take rate" appears here for the first time in the series and is never defined anywhere, although it carries argument in ch04, ch06, ch07 and ch10. Note that the very next sentence carefully glosses "billings" and leaves the harder term bare. Also H1.
- *Fix:* "The middleman's cut at the end of this era is clean: the agency took 15 percent of gross billings, and the publisher kept the other 85 percent."

**2.2** `L139` — "That is why the rate card was only an asking price."
- *Problem:* Second use of "rate card" in the series, still undefined, and this sentence is the hinge of the section.
- *Fix:* "Every publisher printed a price list for its space, called a rate card. That is why the rate card was only an asking price."

**2.3** `L193` — "**Collier's market share.** An early draft said his firm controlled over three quarters of the streetcar-card market."
- *Problem:* Collier's the magazine was named twenty lines earlier. The reader reads the heading as being about the magazine, then hits "his firm" with no referent, and has to scroll back to recover Barron Collier.
- *Fix:* "**Barron Collier's market share.** An early draft said the streetcar-card firm controlled over three quarters of that market."

**2.4** `L77` — "In 1911 *Printers' Ink* counted $100 million of direct mail, $75 million of farm and mail-order advertising, and about $31 million more in sampling, distributing and house organs."
- *Problem:* Printers' Ink arrives with no gloss, which matters because the chapter later leans on it as a source. "House organs" and "sampling, distributing" are 1911 trade terms.
- *Fix:* "In 1911 the trade paper *Printers' Ink* counted $100 million of direct mail, $75 million of farm and mail-order advertising, and about $31 million more on free samples, handouts and company magazines."

**2.5** `L129` — "Advertising outlay was roughly 3.3 percent of nominal GDP in 1914, up from about 1.9 percent in 1880 and about 0.6 percent in 1867."
- *Problem:* GDP is used here, and given a whole section heading, but not glossed until ch03. "Nominal" is never explained at all. This is the denominator of the piece's closing argument.
- *Fix:* "Advertising took roughly 3.3 percent of everything the US economy produced in 1914, up from about 1.9 percent in 1880 and about 0.6 percent in 1867. Economists call that total GDP, and the later chapters use the word."

**2.6** `L101` — "Census receipts run several times below the benchmark totals for the same year."
- *Problem:* Not usable arithmetic English. A quantity can run several times higher; it cannot run several times below.
- *Fix:* "The benchmark totals run several times higher than census receipts for the same year."

**2.7** `L119` — "National brand and local retail tie at the top, and no route we have can tell them apart."
- *Problem:* "Route" is used for "estimating method", is never defined, and is reused in the next sentence.
- *Fix:* "National brand and local retail tie at the top, and no estimating method we tried can tell them apart."

**2.8** `L187` — "Calibration is content, so here is where the evidence killed a good line."
- *Problem:* An in-house slogan the reader has been given nothing to decode.
- *Fix:* "Being honest about what we do not know is part of the story, so here is where the evidence killed a good line."

**2.9** `L27` — "The record allows for real puffery below the reported figure."
- *Problem:* "Puffery below the figure" cannot be parsed on first read, and "puffery" is a rare word doing load-bearing work.
- *Fix:* "The true count may sit well below the claim."

**2.10** `L133` — "This matters at once, because the next era records about 3.0 percent of GDP in 1922 as the peak of the entire measured series that follows."
- *Problem:* "This" with no noun attached; "matters at once" reads as a mistake for "matters immediately"; three ideas in one sentence.
- *Fix:* "That matters straight away. The next era records about 3.0 percent in 1922 as the peak of the whole later series."

**2.11** `L59` — "The industry-wide standard set at 15 percent by the agency trade body is a 1918 act, just outside this era."
- *Problem:* Passive plus "is a 1918 act", which a first-year reader will take as a statute rather than an action.
- *Fix:* "The agency trade body only wrote 15 percent into an industry-wide standard in 1918, just outside this era."

## Filler and banned words

**2.12** `L13` — "In 1840 there was no advertising industry. There was a gap."
- *Problem:* H2, twice, in the first two sentences of the chapter.
- *Fix:* "In 1840 no advertising industry existed. A gap did."

**2.13** `L83` — "There is no annual series for this era, and one cannot honestly be built."
- *Problem:* H2, plus a passive that hides who cannot build it.
- *Fix:* "No annual series exists for this era, and nobody can honestly build one."

**2.14** `L53` — "So agencies invented the rest of the job: market research first, then copy and art."
- *Problem:* H1.
- *Fix:* "Agencies invented the rest of the job instead: market research first, then copy and art."

**2.15** `L105` — "So the pre-1919 totals are not a media measure."
- *Problem:* H1.
- *Fix:* "The pre-1919 totals are therefore not a media measure."

**2.16** `L183` — "So the era ends with the price of the middleman fixed, the audience audited, and the money flowing through a screened, self-regulating layer of small firms."
- *Problem:* H1. "Screened" and "self-regulating" also hide who screens and who regulates, in the chapter's closing summary.
- *Fix:* "The era ends with the middleman's price fixed, the audience audited, and the money running through small firms that publishers approved and that policed themselves."

**2.17** `L17` — "This chapter follows what they built, and who paid them to build it."
- *Problem:* H5. The chapter announces itself instead of starting.
- *Fix:* "What they built, and who paid them to build it, is the story."

## Style

**2.18** `L23` — "Palmer was paid by publishers, at a commission widely reported as about 25 percent of the space price he sold."
- *Problem:* H8. The passive puts the payer second, in the exact paragraph whose point is that the middleman worked for the seller. "Widely reported" also hides who reports.
- *Fix:* "Publishers paid Palmer a commission most sources put at about 25 percent of the space price he sold."

**2.19** `L39` — "This is the trade every ad-funded thing since has re-run."
- *Problem:* H10. "This" opens with no noun, and "the trade" is ambiguous because the same chapter later uses it to mean the industry.
- *Fix:* "Every ad-funded business since has re-run that bargain."

**2.20** `L57` — "Then came enforcement."
- *Problem:* Zombie noun standing in for a verb, hiding who enforced, one sentence before the answer arrives.
- *Fix:* "Then publishers enforced it."

**2.21** `L77` — "Carried to 1914 and split by who was really buying, that pool comes to about $192 million."
- *Problem:* Dangling participle with no actor, in a project that grades its own arithmetic.
- *Fix:* "We carry that pool to 1914, split it by who was really buying, and get about $192 million."

**2.22** `L85` — "The older set was compiled for Printers' Ink and carried into the Census Bureau's historical statistics."
- *Problem:* H8, twice. The very next sentence then reveals it was Robert Coen.
- *Fix:* "Robert Coen compiled the older set for Printers' Ink, and the Census Bureau carried it into its historical statistics."

**2.23** `L121` — "Its smallness is partly a pricing fact."
- *Problem:* H9. Zombie noun where a verb would do.
- *Fix:* "It stayed small partly because of how it was priced."

**2.24** `L131` — "Both halves of that fraction are reconstructions."
- *Problem:* Zombie noun with no actor. Somebody reconstructed them, and the paragraph is about trusting whoever did.
- *Fix:* "Somebody had to rebuild both numbers in that fraction."

**2.25** `L161` — "Directories became a channel of their own once telephone listings were sorted by trade."
- *Problem:* H8.
- *Fix:* "Directories became a channel of their own once phone companies sorted their listings by trade."

**2.26** `L173` — "By November 1921 it had been adopted in 22 states in substantially its original form, and in 15 more in modified form."
- *Problem:* H8. "It" could point to the model law or to Printers' Ink.
- *Fix:* "By November 1921, 22 states had adopted that model law almost unchanged, and 15 more had adopted a modified version."

**2.27** `L175` — "It became respectable because its largest customer got legislated out of its old form."
- *Problem:* "Got legislated" is a passive in disguise that hides Congress, and "out of its old form" is vague where the chapter has just been precise.
- *Fix:* "It became respectable because Congress forced its biggest customer to change."

**2.28** `L189` — "The earliest full attribution to Wanamaker traces to a 1919 sermon, after this era closes."
- *Problem:* Zombie noun hides who credited whom, in the one paragraph that exists to say nobody can be found doing it.
- *Fix:* "The earliest source crediting Wanamaker is a 1919 sermon, preached after this era closes."

---

# Chapter 03 — Sponsorship

## Cannot follow

**3.1** `L67` — "The Nielsen Radio Index went commercial in December 1942 with 800 metered homes, about a quarter of US households, and had 47 subscribers by 1945"
- *Problem:* The arithmetic is impossible on its face. 800 homes cannot be a quarter of the households in a country of 130 million people. The reader stops dead and cannot tell which number is wrong.
- *Fix:* **Check claim `e2-measurement-005` first.** If the quarter refers to the areas the sample was drawn from, write: "The Nielsen Radio Index went commercial in December 1942 with 800 metered homes, drawn from areas holding about a quarter of US households. It had 47 subscribers by 1945." If the quarter cannot be sourced to anything, delete the clause and write: "…with 800 metered homes, a tiny sample against the whole country. It had 47 subscribers by 1945."
- *RESOLVED by stage R3b, 2026-07-31.* The claim was checked against Beville p. 21-22. The quarter is the share of US households living in the east central region the sample was drawn from, and Beville treats it as a ceiling on the service's reach. `e2-measurement-005` and L67 are both rewritten; L65 was rewritten at the same time for the related `e2-measurement-003` defect. **Do not re-apply this item.** See `../data/verification/REPAIR-R3b.md`.

**3.2** `L67` — "Nielsen industrialised the job with a meter wired into the set."
- *Problem:* Nielsen is introduced with no gloss. This is the firm that prices the next three eras.
- *Fix:* "A research firm called A. C. Nielsen industrialised the job with a meter wired into the set."

**3.3** `L13` — "It wrote the show, hired the star, booked the band, cleared the talent, and shipped a finished program to the line."
- *Problem:* "Cleared the talent" is trade jargon and "the line" is the telephone line the network fed its stations from. This is the fourth sentence of the chapter, and it is where the reader is supposed to grasp the era's whole deal.
- *Fix:* "It wrote the show, hired the star, booked the band, settled the performers' contracts, and sent a finished program down the wire for the network to broadcast."

**3.4** `L23` — "Thompson led the trade in billings from 1922 to 1972, and its billings late in the 1920s are put near $37.5 million"
- *Problem:* "Thompson" arrives cold, by surname only, with no signal that it is an advertising agency. The full name does not appear until ch04.
- *Fix:* "J. Walter Thompson, a New York agency, led the trade in billings from 1922 to 1972, and sources put its billings late in the 1920s near $37.5 million."

**3.5** `L31` — "NBC counted its Red and Blue billings together when it worked out the discount, which is exactly what the FCC later seized on to argue the two were one business."
- *Problem:* The reader has not been told NBC ran two separate networks called Red and Blue. That fact arrives eighteen lines later, so "the two were one business" is unreadable here.
- *Fix:* "NBC ran two networks, called Red and Blue. It counted the billings of both together when it worked out the discount, which is exactly what the FCC later seized on to argue the two were really one business."

**3.6** `L43` — "In 1938 the US broadcast industry sold $100,892,259 of net time."
- *Problem:* "Net time" is an accounting term of art. The reader cannot tell whether net means after discounts, after agency cuts or after production, and the whole $100/$62/$23 split hangs on it.
- *Fix:* "In 1938 the US broadcast industry sold $100,892,259 of air time, counted after discounts and agency cuts had come out."

**3.7** `L47` — "The FCC published that stations tied to NBC or CBS held "over 85 percent" of the country's nighttime power."
- *Problem:* Broadcast jargon. The reader cannot tell whether this is a share of stations, of listeners, or of something electrical.
- *Fix:* "The FCC published that stations tied to NBC or CBS held "over 85 percent" of the transmitting power that carried signals across the country after dark."

**3.8** `L69` — "In January 1949 CBS took Jack Benny from NBC by promising his sponsor $3,000 a week for every Hooper point he lost in the move"
- *Problem:* Jack Benny is unidentified, and a Hooper point is a unit the reader has never been given. Hooper has been named as a firm, not as a scale with points on it. The sentence exists to show a rating becoming a contract term, and the unit is the whole point.
- *Fix:* "In January 1949 CBS took the comedian Jack Benny from NBC by promising his sponsor $3,000 a week for every rating point his show lost in the move. One point meant one percent of the listening homes Hooper counted."

**3.9** `L67` — "By April 1949 its sample frame reached 97 percent of US homes, which made the ratings projectable to the country for the first time"
- *Problem:* "Sample frame" and "projectable" are statistics terms, and the reader has been defined as knowing no statistics.
- *Fix:* "By April 1949 Nielsen could draw its sample from 97 percent of US homes, so for the first time its ratings could stand for the whole country."

**3.10** `L85` — "The CAB went from one recall call a day to four dayparts in 1935, eight in 1940, and 32 sets of interviews a day by 1942"
- *Problem:* "Daypart" is the section's own title word and is never defined, and the list switches units mid-sentence, from calls to dayparts to sets of interviews.
- *Fix:* "A daypart is a block of the broadcast day, like morning or evening. The CAB asked about one block a day at first, four in 1935, eight in 1940, and ran 32 sets of interviews a day by 1942."

**3.11** `L57` — "Each report covered 17,000 radio families across 50 cities"
- *Problem:* "Radio families" is a 1930s survey term a modern reader will not parse.
- *Fix:* "Each report covered 17,000 households that owned a radio, across 50 cities."

**3.12** `L79` — "That figure is ours and it is soft: the source sorts titles by editorial class, not by who read them."
- *Problem:* "Editorial class" is publishing jargon where two plain words would do.
- *Fix:* "That figure is ours and it is soft: the source sorts magazines by subject matter, not by who read them."

**3.13** `L97` — "The first is the residual bucket the series calls Miscellaneous, which holds phone directories, transit ads, in-store material and premiums."
- *Problem:* "Residual bucket" is data jargon and "premiums" is trade jargon, both in one sentence.
- *Fix:* "The first is the leftover category the series calls Miscellaneous, which holds phone directories, transit ads, in-store displays and free gifts."

## Filler and banned words

**3.14** `L21` — "So the show looked free."
- *Problem:* H1.
- *Fix:* "The show looked free."

**3.15** `L77` — "So a buyer who wanted homemakers bought mornings and afternoons, and got them at half price."
- *Problem:* H1.
- *Fix:* "A buyer who wanted homemakers therefore bought mornings and afternoons, at half price."

**3.16** `L93` — "So the measured-response tradition, with its keyed coupons and split tests, is a story of the 1920s and 1930s."
- *Problem:* H1. "Split tests" is also undefined jargon in the sentence carrying the paragraph's claim.
- *Fix:* "The measured-response tradition, with its coded coupons and side-by-side tests, is therefore a story of the 1920s and 1930s."

**3.17** `L45` — "There were 660 commercial stations at the end of that year, and 341 of them were tied to a national network"
- *Problem:* H2.
- *Fix:* "660 commercial stations were on air at the end of that year, and 341 of them were tied to a national network."

**3.18** `L51` — "About 900 AM stations were on air in 1945. By the early 1950s there were roughly 2,500."
- *Problem:* H2 in the second sentence, and the two sentences repeat the same frame.
- *Fix:* "About 900 AM stations were on air in 1945, and roughly 2,500 by the early 1950s."

**3.19** `L129` — "There is one visible seam at the start of the long chart."
- *Problem:* H2.
- *Fix:* "One visible seam sits at the start of the long chart."

**3.20** `L145` — "There are too many stations."
- *Problem:* H2, and it is the only limp sentence in a run of short punchy ones.
- *Fix:* "Too many stations are on air."

## Style

**3.21** `L19` — "The agency was paid the old way, the way the last era had settled: 15 percent of what its client spent on media."
- *Problem:* H8, in a chapter whose whole subject is who paid whom.
- *Fix:* "The agency earned its money the old way, the way the last era had settled: 15 percent of what its client spent on media."

**3.22** `L21` — "Our best estimate is that talent and production took about 35 percent of what a sponsor spent on network radio."
- *Problem:* H9. This construction recurs across four chapters.
- *Fix:* "We estimate talent and production took about 35 percent of what a sponsor spent on network radio."

**3.23** `L23` — "Ayer's gross receipts are reported at $13.7 million in 1919 and $38.0 million in 1930"
- *Problem:* H8, in a sentence the next line then says nobody checked.
- *Fix:* "Sources put Ayer's gross receipts at $13.7 million in 1919 and $38.0 million in 1930."

**3.24** `L23` — "Neither could be read against its source in this run, so both carry our weakest source grade, C."
- *Problem:* H8, and "in this run" is an internal project phrase the reader cannot decode.
- *Fix:* "Nobody on this project checked either figure against its source, so both carry our weakest grade, C."

**3.25** `L27` — "The first documented sale of air time was on 28 August 1922, at AT&T's station WEAF."
- *Problem:* Zombie noun where a verb would do, and the seller is buried in a trailing phrase.
- *Fix:* "AT&T's station WEAF made the first sale of air time anyone documented, on 28 August 1922."

**3.26** `L49` — "The chain-broadcasting rules forced RCA to sell one of its two networks."
- *Problem:* The rules arrive with no maker, in a paragraph headed by the claim that Washington broke the structure. The FCC wrote them.
- *Fix:* "The FCC's chain-broadcasting rules forced RCA to sell one of its two networks."

**3.27** `L59` — "Buyers paid, and the sellers were kept out as subscribers until 1937."
- *Problem:* H8, in the exact sentence that makes the chapter's argument about who controls the count.
- *Fix:* "Buyers paid, and they shut the sellers out as subscribers until 1937."

**3.28** `L65` — "Once that was shown in early 1946, the industry's own service collapsed."
- *Problem:* H8, hiding the actor the previous sentence has just named.
- *Fix:* "Once McCann-Erickson showed that in early 1946, the industry's own service collapsed."

**3.29** `L81` — "Geography was bought station by station, through firms that sold time for stations they did not own."
- *Problem:* H8, opening a paragraph about how advertisers bought.
- *Fix:* "Advertisers bought geography station by station, through firms that sold time for stations they did not own."

**3.30** `L117` — "The Advertising Council was set up on 26 February 1942 on about $100,000 raised from agencies and media groups"
- *Problem:* H8, twice, in a paragraph arguing that the industry bought itself a defence.
- *Fix:* "Agencies and media groups raised about $100,000 and set up the Advertising Council on 26 February 1942."

**3.31** `L145` — "And a new screen is coming that will make owning a whole hour far too dear."
- *Problem:* H12. "Dear" is British and dated; the same word recurs in ch04.
- *Fix:* "And a new screen is coming that will make owning a whole hour far too expensive."

---

# Chapter 04 — The Spot Market

## Cannot follow

**4.1** `L28` — "Then came scandal. The quiz shows turned out to be fixed."
- *Problem:* A definite article for something never mentioned, plus a passive that hides who rigged them. The reader does not know when this happened, what was fixed, or why it would make advertisers a legal risk. This is one of three named causes of sponsorship's death.
- *Fix:* "Then came scandal. In the late 1950s producers were caught rigging several sponsor-owned quiz shows, feeding the answers to favoured contestants."

**4.2** `L88` — "Geography was fixed in 1966, when Arbitron drew Areas of Dominant Influence: about 200 exclusive markets."
- *Problem:* Arbitron has never been mentioned, so the reader cannot see why its map would bind the whole market. "Exclusive markets" means non-overlapping without saying so. Passive opener buries the actor named later in the same sentence.
- *Fix:* "Arbitron, a rival audience-counting firm, fixed geography in 1966 by drawing about 200 Areas of Dominant Influence, with every county in exactly one."

**4.3** `L156` — "On top of that the agency could take a 2% cash discount on the net for paying media quickly."
- *Problem:* "The net" has no referent. The reader has just been given three numbers and cannot tell which the 2% applies to. This is offered as a hidden extra cut, so the base matters.
- *Fix:* "On top of that, if the agency paid the media owner quickly it could keep another 2% of the $2,125 it actually handed over."

**4.4** `L176` — "Look closed with its issue of 19 October 1971 after losing about $5 million of revenue in 1970."
- *Problem:* "Look" at the head of a sentence reads as an imperative verb. The reader parses it as an instruction and has to start again.
- *Fix:* "The magazine Look closed with its issue of 19 October 1971, after losing about $5 million of revenue in 1970."

**4.5** `L50` — "ABC put all its new-season premieres in one week after Labor Day, to line up with the car makers' model-year launches, and sold the season in advance."
- *Problem:* The previous chapter names "the American Broadcasting Company" but never gives the abbreviation, so ABC arrives as a fourth party among three networks.
- *Fix:* "The American Broadcasting Company, or ABC, put all its new-season premieres in one week after Labor Day, to line up with the car makers' model-year launches, and sold the season in advance."

**4.6** `L36` — "Buyers then piggybacked two 30s inside one bought minute."
- *Problem:* Trade shorthand for two 30-second ads, and the reader has not been given it.
- *Fix:* "Buyers then squeezed two 30-second ads into one bought minute."

**4.7** `L90` — "Multiply the two and you get an order of magnitude for how many distinct audiences an advertiser could buy."
- *Problem:* A maths term the reader has nothing to decode, in the sentence that explains the estimate.
- *Fix:* "Multiply the two and you get a rough count of how many distinct audiences an advertiser could buy."

**4.8** `L62` — "For the 1979-80 season, 75% to 80% of network prime-time inventory sold in the upfront, at prices at least 15% above the year before."
- *Problem:* "Inventory" is trade jargon for ad slots, and the intransitive "sold" hides the seller.
- *Fix:* "For the 1979-80 season, networks sold 75% to 80% of their prime-time ad slots in the upfront, at prices at least 15% above the year before."

**4.9** `L86` — "Broadcast targeting in this era got standard, not fine."
- *Problem:* "Fine" is ambiguous; a first-year reader takes it as "acceptable", not "fine-grained". Also an H6 reversal doing rhythm rather than meaning.
- *Fix:* "In this era broadcast targeting became standard everywhere, but it never got precise."

**4.10** `L140` — "Our back-cast puts 1975 at about $1.5 billion, roughly 5.4% of all spend, with an honest range of $1.15 billion to $1.9 billion."
- *Problem:* "Back-cast" is method jargon used before it is explained, then reused two sentences later. Also H9.
- *Fix:* "Working backwards from the 1980 figure, we put 1975 at about $1.5 billion, roughly 5.4% of all spend, with an honest range of $1.15 billion to $1.9 billion."

**4.11** `L150` — "It is grade C, it is a built estimate rather than a found one, and the width is the information."
- *Problem:* "The width is the information" gives the reader no noun for width and no sense of what the information refers to.
- *Fix:* "It is grade C, we built it rather than found it, and the width of that range is the real finding."

**4.12** `L158` — "Our central of 10% is the midpoint of a published range, not a reported figure, and the source says TV averages ran below radio's."
- *Problem:* "Our central" uses a noun the reader has never been given.
- *Fix:* "Our 10% is the midpoint of a published range, not a figure anyone reported, and the source says TV averages ran below radio's."

**4.13** `L172` — "Their leverage had a legal shape."
- *Problem:* Both halves abstract. The sentence tells the reader nothing until the next one rescues it.
- *Fix:* "Their bargaining power came from a law."

**4.14** `L178` — "The first is creative."
- *Problem:* "Creative" as a noun is ad-trade jargon, and here it reads as an adjective with a missing subject.
- *Fix:* "The first change is about the ads themselves."

**4.15** `L188` — "The 97.1% penetration figure is computed on the counter's own household universe."
- *Problem:* Three pieces of research jargon in one short sentence, plus a passive.
- *Fix:* "Nielsen worked out that 97.1% against its own count of US households."

**4.16** `L154` — "The take rates in this era were stated out loud, which makes them easy to compare with later ones."
- *Problem:* H8. Compounded: "take rate" is used across ch02 and ch04 and never defined. Fix 2.1 supplies the gloss upstream.
- *Fix:* "Everyone in this era said their cut out loud, which makes these take rates easy to compare with later ones."

## Filler and banned words

**4.17** `L106` — "So when did TV pass print?"
- *Problem:* H1.
- *Fix:* "When did TV pass print?"

**4.18** `L158` — "So for TV, read it as under 10%."
- *Problem:* H1.
- *Fix:* "For TV, read it as under 10%."

**4.19** `L166` — "So the law changed and the price did not."
- *Problem:* H1, on the sentence carrying the section's whole finding.
- *Fix:* "The law changed and the price did not."

**4.20** `L60` — "There is no one price of the first Super Bowl ad, and any source that quotes one has flattened two."
- *Problem:* H2.
- *Fix:* "The first Super Bowl ad has no single price, and any source that quotes one has flattened two."

**4.21** `L172` — "There were 706 commercial stations on air in 1975, 514 of them on VHF and 192 on the weaker UHF band, up from 677 in 1970."
- *Problem:* H2.
- *Fix:* "706 commercial stations were on air in 1975, 514 of them on VHF and 192 on the weaker UHF band, up from 677 in 1970."

**4.22** `L18` — "This chapter is about how that switch happened. It is also about one thing almost every telling of it gets wrong."
- *Problem:* H5. The chapter narrates its own table of contents instead of starting.
- *Fix:* "Here is how that switch happened, and the one thing almost every telling of it gets wrong."

## Style

**4.23** `L40` — "The two figures are measured on slightly different bases, so the ratio is our construction rather than a reported fact."
- *Problem:* H9 plus a passive.
- *Fix:* "The two figures rest on slightly different bases, so we built the ratio ourselves rather than reading it off a source."

**4.24** `L52` — "Treat it as well-attested industry memory, not as a documented fact."
- *Problem:* H12. "Well-attested" sits well above the reading level of the surrounding prose.
- *Fix:* "Treat it as industry memory everyone repeats, not as a documented fact."

**4.25** `L60` — "The first Super Bowl shows why single famous prices should be handled with tongs."
- *Problem:* H12 plus a passive.
- *Fix:* "The first Super Bowl shows why you should distrust any single famous price."

**4.26** `L76` — "Guarantees could now be written during the season, not just before it."
- *Problem:* H8. It also breaks the parallel with the two sentences either side, which both name a doer.
- *Fix:* "Networks could now write guarantees during the season, not just before it."

**4.27** `L134` — "Both things are true, so TV's rise was a reallocation inside national brand money."
- *Problem:* Zombie noun on the sentence carrying the section's conclusion.
- *Fix:* "Both things are true, so TV's rise just moved money around inside national brand money."

**4.28** `L156` — "Media billed the agency $2,500, the agency paid $2,125, and the client was billed $2,500."
- *Problem:* The third clause flips into passive and drops the biller, breaking a three-step chain whose entire point is who charged whom.
- *Fix:* "Media billed the agency $2,500, the agency paid $2,125, and the agency billed the client $2,500."

**4.29** `L162` — "The complaint had been filed on 12 May 1955."
- *Problem:* H8, in a paragraph about who attacked the 15% commission and who defended it.
- *Fix:* "Government antitrust lawyers had filed the complaint on 12 May 1955."

**4.30** `L174` — "On the print side, ownership was gathering up."
- *Problem:* Zombie noun with no actor, and "gathering up" is not standard English for consolidation.
- *Fix:* "On the print side, owners were merging."

**4.31** `L180` — "Interpublic was incorporated as a holding company in January 1961 so that one owner could hold agencies serving rival clients."
- *Problem:* H8, in a paragraph naming a template every later group copies.
- *Fix:* "In January 1961 Interpublic reorganised itself as a holding company, so one owner could hold agencies serving rival clients."

**4.32** `L24` — "A weekly show got dearer every year."
- *Problem:* H12.
- *Fix:* "A weekly show cost more every year."

---

# Chapter 05 — Segmentation

The chapter with no protagonist and no scene. See W11 and W15 before line-editing it.

## Cannot follow

**5.1** `L14` — "Between 1976 and 1993 the market learned to sell slices."
- *Problem:* No agent and no trigger. Nothing in ch04 predicts it, and ch05's own dates contradict the boundary (see W11).
- *Fix:* Give the change a cause before you state it, using only the two facts this chapter already carries: "Cable channels multiplied, and the census went on sale sorted by postal code. Between 1976 and 1993 the market learned to sell slices."

**5.2** `L30` — "It prices space at the rate card rather than at what buyers actually paid."
- *Problem:* Trade jargon on first use in this chapter, and never explained here or in ch06 where it recurs.
- *Fix:* "It prices space at the seller's list price, not at what buyers paid."

**5.3** `L54` — "Jonathan Robbin's firm Claritas took the 1970 census, moved the counts off census geography and onto all roughly 36,000 five-digit ZIP codes, and sorted those ZIPs into 40 named types."
- *Problem:* "Census geography" is undefined jargon in the sentence carrying the chapter's central mechanism.
- *Fix:* "Jonathan Robbin's firm Claritas took the 1970 census, moved the counts off the census map and onto all 36,000 five-digit ZIP codes, and sorted those ZIPs into 40 named types."

**5.4** `L60` — "A 2% reply rate on a rented list was the working definition of a good campaign, and 2% to 3% counted as strong."
- *Problem:* List rental is not explained until `L72`, twelve paragraphs later. Also a zombie noun.
- *Fix:* "Renting a list of names and getting a 2% reply counted as a good campaign; 2% to 3% counted as strong."

**5.5** `L68` — "That is more than every national television line added together: network, national spot, syndication and cable networks came to $22.9 billion."
- *Problem:* "National spot" and "syndication" are trade terms the reader has never been given, and syndication is used with a different meaning in ch07.
- *Fix:* "That is more than every national television line added together: the networks, spot buys across local stations, shows sold direct to stations, and cable channels came to $22.9 billion."

**5.6** `L84` — "Individuals and small firms bought it by the line, served themselves, used no agency and paid nobody a commission."
- *Problem:* The agency commission is not explained until the next section, so the clause lands on a reader who does not yet know a commission was how agencies got paid.
- *Fix:* "Individuals and small firms bought it by the line, served themselves, and used no agency at all."

**5.7** `L82` — "The Bell System broke up in 1984 and the phone directories went to the regional phone companies."
- *Problem:* "The Bell System" is named with no clue what it was, in a sentence that opens a section.
- *Fix:* "America's phone monopoly broke up in 1984, and the directories went to the regional phone companies."

**5.8** `L110` — "In September 1987 Nielsen switched the national television currency to the people meter, a box on which each viewer pressed a button for themselves, replacing paper diaries and meters that only knew the set was on."
- *Problem:* "Currency" here means the number the trade prices against, a sense the reader has never been given. On first read it means money.
- *Fix:* "In September 1987 Nielsen switched the count that priced national television to the people meter, a box on which each viewer pressed a button, replacing paper diaries and meters that only knew the set was on."

**5.9** `L24` — "Different builds of the same series put the post-1960 top in 2000, somewhere between 2.3% and 2.5%."
- *Problem:* "Builds of the same series" names a source the reader does not meet until six paragraphs later, at `L30`.
- *Fix:* "Different versions of these figures put the top after 1960 in 2000, between 2.3% and 2.5%."

**5.10** `L106` — "Media unit costs rose about 27% faster than general prices between 1977 and 1992, on our own deflation of two published index series, with a fair range of 20% to 35%."
- *Problem:* A technique the reader cannot picture, in a zombie noun where a verb would do.
- *Fix:* "Media prices rose about 27% faster than prices in general between 1977 and 1992, when we compared two published indexes. The fair range is 20% to 35%."

## Filler and banned words

**5.11** `L16` — "That is the mechanism of this era, and it is worth stating what it was not."
- *Problem:* H3. The dummy frame delays the point by a whole clause.
- *Fix:* "That is the mechanism of this era. Here is what it was not."

**5.12** `L62` — "That number is worth holding against the most quoted line in the trade."
- *Problem:* H3. Also the head of the Wanamaker passage this chapter should not carry at all (see W10).
- *Fix:* Delete the Wanamaker paragraph. If it stays: "Hold that number against the most quoted line in the trade."

**5.13** `L48` — "So the medium that broke the mass audience had little reason to build a strong ad market on top of the pieces."
- *Problem:* H1.
- *Fix:* "The medium that broke the mass audience had little reason to build a strong ad market on top of the pieces."

**5.14** `L56` — "So a mailer who knows nothing about you can guess a great deal from your block."
- *Problem:* H1.
- *Fix:* "A mailer who knows nothing about you can guess a great deal from your block."

**5.15** `L70` — "So a dollar of mail and a dollar of network TV are not the same kind of dollar."
- *Problem:* H1.
- *Fix:* "A dollar of mail and a dollar of network TV are not the same kind of dollar."

**5.16** `L74` — "So the buyer's sum was: cost of the drop against orders received. Not cost per thousand eyes, but cost per order."
- *Problem:* H1 and H6. The second sentence only restates the first for rhythm.
- *Fix:* "The buyer's sum was cost per order, not cost per thousand eyes."

**5.17** `L96` — "So: consolidation at the top, more shops at the bottom."
- *Problem:* H1, plus a zombie noun where the reader wants a picture.
- *Fix:* "Fewer owners at the top, more shops at the bottom."

**5.18** `L106` — "So the commission bent in this era, and broke in the next one."
- *Problem:* H1.
- *Fix:* "The commission bent in this era and broke in the next one."

**5.19** `L122` — "So a chart of this era showing brands shifting between mediums is telling you a partial truth."
- *Problem:* H1, plus a progressive where the simple verb is shorter.
- *Fix:* "A chart of this era showing brands shifting between mediums tells you a partial truth."

## Style

**5.20** `L94` — "Omnicom was assembled in 1986 out of BBDO, Doyle Dane Bernbach and Needham Harper."
- *Problem:* H8. Three named agencies demoted to the object of an unnamed verb, in a chapter about who did things.
- *Fix:* "BBDO, Doyle Dane Bernbach and Needham Harper merged into Omnicom in 1986."

**5.21** `L102` — "This is grade A data, and it kills the legend cleanly."
- *Problem:* H10. "This" opens with no noun and points two sentences back past the intervening figure.
- *Fix:* "The census is grade A data, and it kills the legend cleanly."

---

# Chapter 06 — The Impression

## Cannot follow

**6.1** `L15` — "The click-through rate people still quote from that launch was self-reported, and the people who were there no longer agree on it."
- *Problem:* The click is the unit of the next four chapters and is never defined anywhere in the ten. Here, on page one of the web chapter, the reader meets "click-through rate" with no explanation of what clicking an ad does or what the rate is a rate of. It recurs bare at `L94`.
- *Fix:* "A reader could tap one of those ads and be carried to the advertiser's own page. That tap is a click, and the share of people shown an ad who make it is the click-through rate. The rate people still quote from that launch was self-reported, and the people who were there no longer agree on it."

**6.2** `L114` — "Cookies let DoubleClick target by site, place, browser, time of day and how often a person had already seen an ad."
- *Problem:* "Cookie" is never defined, here or anywhere, yet the whole privacy arc of ch08 rests on it. The reader cannot see why a cookie would let anyone follow a person between sites.
- *Fix:* "A cookie is a small tag a website leaves inside your browser so it can recognise the same browser when it comes back. Cookies let DoubleClick target by site, place, browser, time of day and how often a person had already seen an ad."

**6.3** `L72` — "DoubleClick's total revenue was $505.6M in 2000, split across an ad network, an ad-serving business and a data arm."
- *Problem:* Three trade terms in one clause, none glossed. Ad network and ad serving are load-bearing for the rest of this chapter and all of ch08, and the take-rate arithmetic two sentences later depends on knowing that a network pays publishers out of what it collects.
- *Fix:* "DoubleClick took $505.6M in 2000, doing three jobs. It sold space on other people's sites and paid them a share of what it collected. It ran the software that picked and delivered each ad. And it sold data."

**6.4** `L74` — "Excite paid Netscape about $5.0M a year for one search-placement slot, and the filings bundle payments, so read that as $4.0M to $8.25M."
- *Problem:* Excite and Netscape both arrive cold, so the reader cannot tell which is the search site and which the browser, or why one would pay the other. "The filings" assumes the reader knows these are company reports to a US regulator.
- *Fix:* "Excite, a search site, paid the browser maker Netscape about $5.0M a year to sit on one of Netscape's pages. The company reports we can read bundle several payments together, so read that as $4.0M to $8.25M."

**6.5** `L74` — "Era 2 would have recognised the contract on sight."
- *Problem:* The eras and chapters are offset by one, so the reader is sent to the contents page (W4).
- *Fix:* "The radio sponsors of the 1930s would have recognised the contract on sight."

**6.6** `L162` — "The famous line about half of all advertising being wasted is usually wheeled in here. It has no sourced provenance in our record, so it stays out."
- *Problem:* Contradicts ch02 `L189`, ch03 `L135`, ch05 `L62`, ch09 `L173` and ch10 `L71`, all of which give a dated citation chain. A reader going straight through hits both inside twenty minutes.
- *Fix:* Cut the paragraph entirely, per W10. If it stays, match the others: "The line first appears in print in 1890 with no name on it, and the earliest credit to Wanamaker is a 1919 sermon by a third party. Nobody has found Wanamaker saying it, so we do not quote it as his."

**6.7** `L68` — "Web inventory concentrated faster than any earlier medium."
- *Problem:* "Inventory" in the trade sense is never explained. A first-year reader pictures a warehouse.
- *Fix:* "Web ad space concentrated faster than any earlier medium."

**6.8** `L100` — "The rate card for a full banner was about $25 per thousand impressions at the end of 2000."
- *Problem:* "Rate card" is never explained in this chapter, and this sentence opens the unit-economics section.
- *Fix:* "The list price for a full banner was about $25 per thousand impressions at the end of 2000."

**6.9** `L102` — "The gap is unsold inventory, volume discounts, house ads and barter."
- *Problem:* "Inventory" and "house ads" are undefined, and "barter" is used two paragraphs before the passage explaining what trade deals were. This sentence explains a four-fold gap between asking price and takings.
- *Fix:* "The gap is space that never sold, discounts for buying in bulk, the site's own ads filling empty slots, and space swapped rather than sold for cash."

**6.10** `L72` — "Its network arm earned a gross margin of 25.3% that year, or 32.6% once a one-off write-off is removed."
- *Problem:* "Gross margin" is used in four chapters and never defined; this is its first appearance in the series. "Write-off" is also unglossed, and the passive hides who removes it.
- *Fix:* "Its network arm kept 25.3 cents of every dollar it sold, or 32.6 once we strip out a one-off charge. That share is the gross margin."

**6.11** `L100` — "That figure comes through a tertiary source, so treat it as $15 to $35."
- *Problem:* Research-desk jargon. The reader has been given grades A, B and C but never a source taxonomy.
- *Fix:* "That figure reaches us third-hand, so treat it as $15 to $35."

**6.12** `L25` — "The web solved it on 10 December 1996, when the Internet Advertising Bureau and CASIE published eight voluntary banner sizes."
- *Problem:* CASIE is an unexpanded acronym that never appears again. The reader stalls and gains nothing.
- *Fix:* "The web solved it on 10 December 1996, when two trade bodies published eight voluntary banner sizes."

**6.13** `L25` — "One of them, the wide strip known as the full banner, became the era's unit of authorship."
- *Problem:* "Unit of authorship" is an abstraction with no referent the reader can build, and it is the payoff of the paragraph.
- *Fix:* "The wide strip called the full banner became the shape every ad had to fit."

## Filler and banned words

**6.14** `L21` — "This chapter is about what that choice hid, what it cost, and what finally broke it."
- *Problem:* H5 and H10, and the only Tier-1 slop hit in the three digital chapters.
- *Fix:* Delete. The next heading, "A unit has to be standard before anyone can trade it", starts the argument without it.

**6.15** `L15` — "There was no single first banner ad."
- *Problem:* H2, in the third sentence of the chapter.
- *Fix:* "No one banner came first."

**6.16** `L33` — "For 1995 there is no audited number at all."
- *Problem:* H2. The missing actor is the point: nobody was auditing.
- *Fix:* "Nobody audited 1995 at all."

**6.17** `L128` — "There is no rate card, no negotiation and no salesperson."
- *Problem:* H2, plus a zombie noun and the still-undefined rate card.
- *Fix:* "GoTo had no price list, no haggling, no salesperson."

**6.18** `L160` — "There was no single first banner ad, and the click-through rate quoted from HotWired's launch was never audited."
- *Problem:* H2 plus a passive hiding who failed to audit.
- *Fix:* "No one banner came first, and nobody audited the click rate quoted from HotWired's launch."

**6.19** `L35` — "So how big was the web as a share of the market at its peak?"
- *Problem:* H1.
- *Fix:* "How big was the web as a share of the market at its peak?"

**6.20** `L60` — "So the order depends on the rule and on nothing else."
- *Problem:* H1.
- *Fix:* "The order depends on the rule and on nothing else."

**6.21** `L152` — "The scoreboard at the handover is worth holding in mind."
- *Problem:* H3, with a subject bolted on.
- *Fix:* "Hold the scoreboard at the handover in mind."

## Style

**6.22** `L54` — "Three separate methods were run at it and the middle answer taken, so it no longer sums to exactly 100%."
- *Problem:* H8, twice, in the paragraph that has just said "This split is ours". The chapter uses "we" freely everywhere else.
- *Fix:* "We ran three methods at it and took the middle answer, so it no longer sums to exactly 100%."

**6.23** `L56` — "Two of these rows cannot be ranked against each other."
- *Problem:* H8. The reader is the one being instructed.
- *Fix:* "You cannot rank two of these rows against each other."

**6.24** `L88` — "This is the first era in which the seller owned the meter and the buyer had nowhere to appeal."
- *Problem:* H10, as the topic sentence of a section. Also see W9 on the three competing rupture claims.
- *Fix:* "This era is the first in which the seller owned the meter and the buyer had nowhere to appeal."

**6.25** `L94` — "Barter was booked at rate-card values no cash buyer was paying, so the market's reported revenue was partly a fiction about its own prices."
- *Problem:* H8. The passive hides the sellers who did the booking, which is the accusation of the sentence.
- *Fix:* "Sellers booked barter at list prices no cash buyer would pay, so the market's reported revenue was partly a fiction."

---

# Chapter 07 — The Auction

## Cannot follow

**7.1** `L125` — "Google paid out 91% of its network advertising revenue in 2002, and AOL supplied about 63% of that network revenue."
- *Problem:* "Network advertising revenue" is used eighteen lines before the chapter explains that Google put its ads on other people's pages. At this point the reader does not know Google had a network at all. AOL is also still unglossed.
- *Fix:* "Google also sold ads on other firms' pages and handed most of that money straight back to them: in 2002 it paid out 91% of what those ads earned. AOL, then the biggest internet service in America, supplied about 63% of it."

**7.2** `L262` — "Open-web display advertising moved to a first-price auction on 5 September 2019, where the winner pays its own bid; the stated reason was transparency, and Google reported the revenue effect as neutral to positive."
- *Problem:* "Display advertising" is never defined in any chapter, and "open-web" adds a second unknown. The sentence is explicitly offered as the correction to the most common error about 2019. (If you do W3 and cut this section, this item goes with it.)
- *Fix:* "Picture ads on ordinary web pages, which the trade calls display ads, moved to a first-price auction on 5 September 2019, where the winner simply pays its own bid. The stated reason was transparency, and Google reported the revenue effect as neutral to positive."

**7.3** `L264` — "The instrument first pointed at AOL in 2002 became $26.3 billion of default payments in 2021, by then 57.7% of all traffic acquisition cost."
- *Problem:* "Default payments" reads as missed payments. The sense used here — paying to be the pre-set choice — is never given, and "defaults" recurs bare through ch08 and ch10.
- *Fix:* "The instrument first pointed at AOL in 2002 became $26.3 billion in 2021 of payments to phone and browser makers to make Google the search engine already switched on when you open the device. The trade calls that being the default, and by then it was 57.7% of all the money Google paid out for traffic."

**7.4** `L179` — "Its patent claim did get paid: in 2004 Google issued Yahoo 2,700,000 shares to settle, booking a $201.0 million charge, worth about $229.5 million at the $85.00 offering price."
- *Problem:* Two gaps at once. No patent claim has been mentioned, so "its patent claim" has no antecedent. And "the $85.00 offering price" assumes the reader knows Google first sold shares to the public in 2004, an event the series never mentions.
- *Fix:* "Overture had also sued, saying its patent covered the keyword auction, and that claim did get paid. In 2004 Google settled by issuing 2,700,000 shares to Yahoo, by then Overture's owner. It booked a $201.0 million charge, and the shares were worth about $229.5 million at the $85.00 price Google set when it first sold shares to the public that year."

**7.5** `L91` — "Shading its bid down is worth $240."
- *Problem:* "Shading" is auction jargon the chapter never defines, and it is the verb the whole worked example turns on.
- *Fix:* "Bidding low earns it $240 more."

**7.6** `L93` — "At the lowest stable equilibrium the seller collects $440."
- *Problem:* Undefined economics jargon in the sentence that fixes the bottom of the revenue band.
- *Fix:* "If every bidder bids low, the seller collects $440."

**7.7** `L105` — "Each keyword got its own minimum bid, set from a Quality Score built out of click rate, ad wording, past performance and landing-page quality."
- *Problem:* Two passives hide Google in the sentence that first shows Google setting prices outright, and "landing-page quality" is undefined.
- *Fix:* "Google gave each keyword its own minimum bid, computed from click rate, ad wording, past results and the page the ad led to."

**7.8** `L238` — "Our decomposition puts 52% to 56% on search volume and 44% to 48% on yield per search."
- *Problem:* H9 plus "yield" as undefined trade jargon.
- *Fix:* "We put 52% to 56% on more searches and 44% to 48% on more money per search."

**7.9** `L187` — the thirteen-sentence paragraph beginning "The first is the size of search."
- *Problem:* One paragraph carrying four separate arguments: the size of search, the undercount in the Coen series, the 2008 seam, and share of GDP. Every word is decodable; the paragraph is not.
- *Fix:* Split into four paragraphs, breaking before "The second is the size of the whole pie", before "The Coen series also stops with 2007", and before "Against the economy, though, advertising shrank."

**7.10** `L143` — "That is syndication, sold as AdSense, and it grew fast"
- *Problem:* "Syndication" is used in ch05 `L68` to mean shows sold direct to stations, and here to mean Google placing ads on other people's sites. Same word, two meanings, one read-through.
- *Fix:* Apply fix 5.5 upstream so the word is used only once in the series, here. Keep this gloss as it stands.

## Filler and banned words

**7.11** `L26` — "There was no bidding at all."
- *Problem:* H2, in a chapter whose whole argument is who set which number.
- *Fix:* "Nobody bid on anything."

**7.12** `L77` — "There was no agreed industry standard for counting a search click during the whole era."
- *Problem:* H2, and "agreed" hides the industry that failed to agree.
- *Fix:* "The industry never agreed a standard for counting a search click."

**7.13** `L244` — "There is one honest hole in that verdict."
- *Problem:* H2.
- *Fix:* "That verdict has one honest hole."

**7.14** `L30` — "So 2002 is not the invention of the search auction."
- *Problem:* H1, plus a zombie noun.
- *Fix:* "2002 did not invent the search auction."

**7.15** `L65` — "So the rule is best read as ranking by expected money per showing."
- *Problem:* H1, plus a passive that hides the reader being instructed.
- *Fix:* "Read the rule as ranking by expected money per showing."

**7.16** `L79` — "So the seller predicted the click, ran the auction, decided which clicks were real, and billed against its own log."
- *Problem:* H1, sitting on the strongest sentence in the section.
- *Fix:* "The seller predicted the click, ran the auction, decided which clicks were real, and billed against its own log."

**7.17** `L95` — "So the revenue of this design is not a number. It is a band, and in this case the top is 1.73 times the bottom."
- *Problem:* H1, plus a zombie noun.
- *Fix:* "The design does not have one revenue figure. It has a band, and here the top is 1.73 times the bottom."

**7.18** `L161` — "So syndication bought position, not profit."
- *Problem:* H1.
- *Fix:* "Syndication bought position, not profit."

**7.19** `L177` — "So the firm with the higher revenue per search wins the auction for searches, by construction."
- *Problem:* H1, plus "by construction", maths jargon the reader cannot decode.
- *Fix:* "The firm with the higher revenue per search therefore wins the auction for searches, every time."

**7.20** `L242` — "So: distribution bought the beachhead, and the auction earned the rest."
- *Problem:* H1, plus H12: "beachhead" is a war metaphor on the chapter's verdict sentence.
- *Fix:* "Distribution bought the first foothold, and the auction earned the rest."

**7.21** `L147` — "That is worth pausing on."
- *Problem:* H3. The next two sentences already do the work.
- *Fix:* Delete. "The take rate is not a dial the seller sets" is the pause.

**7.22** `L250` — "It is worth being precise about what "won" means, because the next chapter is about what happened to it."
- *Problem:* H3, on the opening line of the chapter's closing section.
- *Fix:* "Be precise about what "won" means, because the next chapter is about what happened to it."

## Style

**7.23** `L73` — "The ranking and the prices do not change, because they are set from the forecast."
- *Problem:* H8, in the one sentence where the actor is the entire point: the seller sets them from its own forecast.
- *Fix:* "Ranking and prices do not change, because the seller sets both from its forecast."

**7.24** `L77` — "The advertising industry's click measurement group only formed in late 2005, and its guidelines were not published until 2009."
- *Problem:* H8, three words after the actor has been named.
- *Fix:* "The industry's click measurement group only formed in late 2005 and did not publish guidelines until 2009."

**7.25** `L87` — "The search auction does not have it, because several slots are sold at once."
- *Problem:* H8, in a chapter arguing that the seller controls everything.
- *Fix:* "The search auction does not have it, because the seller sells several slots together."

**7.26** `L109` — "The widely repeated five-cent AdWords minimum bid, incidentally, is not supported by the sources behind this record."
- *Problem:* H8, and "incidentally" is throat-clearing wedged between subject and verb.
- *Fix:* "No source behind this record supports the widely repeated five-cent AdWords minimum bid."

**7.27** `L216` — "Making the ad cost nothing either."
- *Problem:* "Making the ad" parses for a beat as a noun phrase, so the reader re-reads a five-word sentence.
- *Fix:* "Writing the ad cost nothing either."

**7.28** `L220` — "It fell because media buying was split off from creative work in the early 1990s, years before search."
- *Problem:* H8, in a sentence whose job is to move the blame off search and onto someone else.
- *Fix:* "It fell because agencies split media buying off from creative work in the early 1990s, years before search."

**7.29** `L119` — "That leaves a gross margin near 85% on a search Google served on its own page."
- *Problem:* Reads as jargon unless fix 6.10 has already glossed the term upstream.
- *Fix:* "So of every dollar a search earned on Google's own page, about 85 cents was left once the cost of serving it came out."

---

# Chapter 08 — The Machine Market

Densest chapter in the piece. Its spine ("The auction died three times") is the best organising device in the series, which is why it survives the load.

## Cannot follow

**8.1** `L21` — "Google now owned the ad server that publishers used to decide which ad to show, plus the display plumbing that would become its exchange."
- *Problem:* "Display" is still undefined, "plumbing" is a metaphor doing real work, and "exchange" is introduced as a thing the reader is assumed to recognise. This is the opening fact of the era, and the second court case in this chapter turns on exactly these two assets.
- *Fix:* "Google now owned the software that publishers used to decide which ad to show, plus the machinery for trading picture ads on ordinary web pages. That machinery became Google's own marketplace for them."

**8.2** `L69` — "Work the symmetric benchmark and the two rules pay the seller exactly the same, for any number of bidders."
- *Problem:* Auction-theory vocabulary. The reader has no idea what is symmetric or what a benchmark is here, and this sentence carries the chapter's central claim that first-price pricing is not a money machine.
- *Fix:* "Work through the simple case where every buyer is alike, and the two rules pay the seller exactly the same, whatever the number of bidders."

**8.3** `L75` — "Revenue equivalence is a theorem about a benchmark, and the real display market broke it in at least three places."
- *Problem:* Both terms arrive undefined, in the sentence that qualifies the chapter's central claim.
- *Fix:* "That equal-revenue result holds only in a textbook case, and the real display market broke it in three places."

**8.4** `L73` — "The real change in 2019 was about who computes the clearing price."
- *Problem:* "Clearing price" undefined. "Was about" also pads.
- *Fix:* "The real change in 2019 was who works out the winning price."

**8.5** `L59` — "The waterfall's sequential price discrimination was over."
- *Problem:* Undefined economics jargon, plus a zombie noun where a verb would do.
- *Fix:* "The waterfall's queue of falling prices was over."

**8.6** `L87` — "Squashing raises that rate to a power below one, which flattens the quality dimension."
- *Problem:* Maths jargon twice over, for a reader who knows no statistics.
- *Fix:* "Squashing shrinks the gap between a good click rate and a bad one."

**8.7** `L117` — "GDPR took effect in May 2018 and required consent for the data collection that behavioural targeting ran on."
- *Problem:* GDPR is never expanded or placed. The reader does not know it is a European Union privacy law, and "behavioural targeting" has appeared only once, in passing, two chapters earlier.
- *Fix:* "The European Union's privacy law, the GDPR, took effect in May 2018. It required people to agree before firms could collect the browsing records that ad targeting ran on."

**8.8** `L119` — "Meta told investors the change would cost it "on the order of $10 billion" in 2022, and outside estimates ran as high as $12.8B"
- *Problem:* Meta's first appearance in the series, with no gloss. The reader is not told it owns Facebook or that it is the second-largest ad seller in America, and the chapter names Facebook separately eight lines later, so the two never connect.
- *Fix:* "Meta, the company behind Facebook and Instagram and the second-largest ad seller in America, told investors the change would cost it "on the order of $10 billion" in 2022, and outside estimates ran as high as $12.8B."

**8.9** `L35` — "About $405B in 2025, with MAGNA at $398B and EMARKETER at $422B for what is supposed to be the same country and year"
- *Problem:* Two bare names. The reader does not know they are research firms that estimate ad spending, so cannot see why their disagreement is the point. Ch09 finally explains MAGNA, a chapter too late.
- *Fix:* "About $405B in 2025 — though the two research firms that estimate it disagree, MAGNA reading $398B and EMARKETER $422B for what is supposed to be the same country and year."

**8.10** `L133` — "Then privacy law removed the signals attribution ran on, and buyers retreated to older, coarser tools."
- *Problem:* "Signals" and "attribution" are both undefined trade terms, and the sentence is the hinge into the two tools that follow. Ch09 also uses "attribution" to mean who a quote is credited to.
- *Fix:* "Then privacy law removed the tracking records that let a buyer tie a sale back to the ad that caused it, and buyers retreated to older, coarser tools."

**8.11** `L155` — "There was no order to sell Chrome"
- *Problem:* Chrome has never been mentioned. The reader does not know Google owns a web browser, or why selling one would be a remedy in a search monopoly case — especially since the browser is one of the places Google buys the default position it just read about. Also H2.
- *Fix:* "The court did not order Google to sell Chrome, the web browser it owns and one of the main places it pays to be the default."

**8.12** `L135` — "Who pays the counter is the era's quiet answer."
- *Problem:* The sentence does not parse. A question cannot be an answer. This is the only sentence in the chapter that fails on grammar rather than style.
- *Fix:* "Who pays the counter now? Increasingly the seller, or nobody."

**8.13** `L109` — "About 36 cents of each dollar entering one reached a consumer."
- *Problem:* Money does not reach consumers, so the reader cannot tell what was measured.
- *Fix:* "Only about 36 cents of each dollar put in bought an ad a real person saw."

**8.14** `L27` — ""Programmatic" is just a name for this: buying ad slots by software and by rule, one at a time, instead of by phone call and insertion order."
- *Problem:* The gloss is good, but it ends on "insertion order", an undefined trade term, so the contrast lands on a blank.
- *Fix:* ""Programmatic" is just a name for this: buying ad slots by software and by rule, one at a time, instead of by phone call and a signed paper order."

**8.15** `L17` — "The era also killed the mechanism that era 6 was named for."
- *Problem:* Ch07 is titled "The Auction" and never labels itself era 6, so the reader must carry a mapping from ch01 (W4).
- *Fix:* "The era also killed the auction, the mechanism the last one was named for."

**8.16** `L89` — "A share that large is what a handful of launches of the disclosed size compound to."
- *Problem:* Delayed subject plus a stranded "compound to" at the end. The reader has to re-read to find who does what.
- *Fix:* "A handful of launches that size compound to a share that large."

**8.17** `L133` — "That is a regime change in how the market knows what worked, not a change of software."
- *Problem:* H12. "Regime change" is figurative jargon a first-year reader will parse as politics.
- *Fix:* "The market changed how it knows what worked, not just which software it ran."

**8.18** `L81` — "**So: search never went first-price.** This is the most common factual error in retellings of 2019, and it is worth stating plainly."
- *Problem:* Three faults at once: H1, H3, and a "This" that points at the wrong referent — the sentence before it is the *true* claim, so a first-read reader thinks the truth is the error.
- *Fix:* "**Search never went first-price.** The opposite claim is the most common factual error in retellings of 2019."

## Filler and banned words

**8.19** `L37` — "So the measured ad market shrank as a share of the economy while the platforms grew."
- *Problem:* H1.
- *Fix:* "The measured ad market shrank as a share of the economy while the platforms grew."

**8.20** `L69` — "There is no yield mechanism in the first-price rule at all."
- *Problem:* H2.
- *Fix:* "The first-price rule holds no yield mechanism at all."

## Style

**8.21** `L75` — "Calibration matters here."
- *Problem:* Zombie noun opening a paragraph, and "calibration" is statistics jargon the reader has not been given. The same habit appears in ch10.
- *Fix:* "Three cautions go with that result."

**8.22** `L75` — "And floors moved at the same time as the rule, so the two effects cannot be separated in publisher revenue data."
- *Problem:* H8, twice: who moved the floors, and who cannot separate the effects.
- *Fix:* "And Google moved the floors at the same time, so nobody can separate the two effects in publisher revenue."

**8.23** `L93` — "Advertisers were not told"
- *Problem:* H8, in a chapter whose whole subject is who did things.
- *Fix:* "Google did not tell advertisers."

**8.24** `L119` — "A platform rule, written by one firm, that cost the largest buyer of mobile signal more than any privacy statute had."
- *Problem:* Periphrasis hides both actors. "One firm" is Apple and "the largest buyer of mobile signal" is Meta, both named two sentences earlier.
- *Fix:* "A rule written by one firm, Apple, that cost Meta more than any privacy law had."

**8.25** `L49` — "That was wrong, and the cause was a bookkeeping error rather than a judgement."
- *Problem:* Zombie noun hiding who made the error. The authors did.
- *Fix:* "That was wrong. We made a bookkeeping error, not a judgement call."

**8.26** `L15` — "That is the era's central fact."
- *Problem:* H10. The paragraph offers two candidate antecedents: three jobs moving into software, or the auctioneer also counting the result.
- *Fix:* "That overlap is the era's central fact."

**8.27** `L211` — "The auction did not die by being replaced."
- *Problem:* H8, in a passage whose point is that no actor existed.
- *Fix:* "No rival mechanism killed the auction."

---

# Chapter 09 — The Capture Question

The hardest chapter in the piece and the highest sag risk. Do W14 before line-editing. This chapter also carries the epidemic of H2 and H4.

## Cannot follow

**9.1** `L189` — "On one ruler, applied to both years, money paying for a measured action went from about 13% of the market in 2000 to about 38% in 2025."
- *Problem:* **Factual inconsistency.** The like-for-like restatement thirty lines earlier, at `L157`, gives direct response as 18.4% for 2000, not 13%. The reader who followed the two-rules argument now has three different 2000 figures — 29.2%, 18.4% and 13% — and no way to reconcile them. Every neighbouring number in the same sentence (44%, 37%, a tenth, a fortieth) matches the restated row, which makes 13% look like a stale figure left in.
- *Fix:* "On one ruler, applied to both years, money paying for a measured action went from about 18% of the market in 2000 to about 38% in 2025." **Check claims `e5-scale-015` and `e5-scale-016` and make the two lines agree before shipping.**

**9.2** `L36` — "The IRS publishes the advertising deduction claimed on corporate tax returns."
- *Problem:* IRS is never expanded, and a passive hides who claims the deduction.
- *Fix:* "The US tax office publishes the advertising deduction companies claim on their tax returns."

**9.3** `L86` — "The one honest test we could run was out of sample, against a third compiler's separately published 2007 US total."
- *Problem:* Statistics jargon, and the target reader knows no statistics.
- *Fix:* "We could test it only against data the bridge was not built from: a third compiler's 2007 US total."

**9.4** `L153` — "The 1914 shares are best read as rough sizes, not a partition: national brand 11% to 46%, local retail 15% to 46%, classified 1.1% to 5%, direct response 8% to 30%."
- *Problem:* "Partition" is maths jargon, and the passive hides who is doing the reading.
- *Fix:* "Read the 1914 shares as rough sizes, not a full carve-up: national brand 11% to 46%, local retail 15% to 46%, classified 1.1% to 5%, direct response 8% to 30%."

**9.5** `L165` — "The pricing followed: 57% of US internet ad revenue was already bought on a performance basis by 2008, against 39% bought by the thousand impressions."
- *Problem:* "Performance basis" is undefined jargon, and the passive hides the buyer.
- *Fix:* "The pricing followed: by 2008 advertisers bought 57% of US internet ad revenue on results, against 39% by the thousand impressions."

**9.6** `L84` — "Restated onto the media-owner basis, US advertising in 2007 was about $230.9 billion rather than the $279.6 billion Coen published: a 17.4% level difference that is measurement, not history."
- *Problem:* Dangling passive participle hides who restated it, and "level difference" is a zombie noun.
- *Fix:* "Restate 2007 onto the media-owner basis and US advertising comes to about $230.9 billion, not the $279.6 billion Coen published: a 17.4% gap that is measurement, not history."

**9.7** `L173`, `L175` — "attribution" used to mean who a quote is credited to
- *Problem:* Ch08 `L133` uses "attribution" to mean tying a sale back to the ad that caused it. Same word, two meanings, eleven lines' reading apart.
- *Fix:* Use "credit" throughout this passage: "The credit is legend." Reserve "attribution" for the ch08 sense.

## Filler and banned words

**9.8** `L26` — "## There is no single series to read this off"
- *Problem:* H2 in a section heading, so it is the first thing the reader meets.
- *Fix:* "## No single series covers this"

**9.9** `L38` — "Before 1919 there is nothing annual at all."
- *Problem:* H2.
- *Fix:* "Before 1919 no annual series exists at all."

**9.10** `L38` — "There are benchmark years, estimated decades after the fact: $50 million in 1867, somewhere between $1,100 million and $1,302 million in 1914."
- *Problem:* H2.
- *Fix:* "Only benchmark years survive, estimated decades later: $50 million in 1867, and somewhere between $1,100 million and $1,302 million in 1914."

**9.11** `L50` — "Then there is the hole."
- *Problem:* H2.
- *Fix:* "Then the hole."

**9.12** `L50` — "For 2008 to 2020 there is no free annual US total at all, and for 2011 to 2025 there is no free by-medium US series of any kind."
- *Problem:* H2, twice in one sentence.
- *Fix:* "No free annual US total covers 2008 to 2020, and no free by-medium US series covers 2011 to 2025."

**9.13** `L92` — "There is a second rail, and it disagrees."
- *Problem:* H2.
- *Fix:* "A second rail disagrees."

**9.14** `L52` — "So the rule for the rest of this chapter: two ribbons, never one line."
- *Problem:* H1.
- *Fix:* "The rule for the rest of this chapter: two ribbons, never one line."

**9.15** `L88` — "So the fall from 2.0% to 1.32% is partly real and partly a change in what the word "advertising" counts."
- *Problem:* H1.
- *Fix:* "Part of the fall from 2.0% to 1.32% is real, and part is a change in what "advertising" counts."

**9.16** `L134` — "So expansion is true of the buyer count and false of the economy."
- *Problem:* H1.
- *Fix:* "Expansion is true of the buyer count and false of the economy."

**9.17** `L142` — "So a rising "national" share in his series can mean brand money growing or mail growing, and the reader cannot tell which."
- *Problem:* H1.
- *Fix:* "A rising "national" share in his series can therefore mean brand money growing or mail growing, and the reader cannot tell which."

**9.18** `L50` — "That is fifteen years — the exact fifteen years this project cares most about — with the thinnest evidence in the whole window."
- *Problem:* H4.
- *Fix:* "Those fifteen years, the ones this project cares most about, carry the thinnest evidence in the whole window."

**9.19** `L102` — "Newspaper classified advertising — individuals and small firms paying by the line — peaked in 2000 at $19.6 billion."
- *Problem:* H4.
- *Fix:* "Newspaper classified advertising, where individuals and small firms paid by the line, peaked in 2000 at $19.6 billion."

**9.20** `L122` — "In 1998, Yahoo — the largest seller on the web — had about 3,800 advertising customers in total."
- *Problem:* H4.
- *Fix:* "In 1998 Yahoo, the largest seller on the web, had about 3,800 advertising customers in total."

**9.21** `L126` — "US retail media — ads sold by retailers against their own shopper data — reached $60.3 billion in 2025 and did not meaningfully exist in 2008."
- *Problem:* H4.
- *Fix:* "US retail media, where retailers sell ads against their own shopper data, reached $60.3 billion in 2025 and did not exist in 2008."

**9.22** `L163` — "The pool the search auction was actually built to compete for — newspaper classified, directories and direct mail — was $77.4 billion that year, 31.3% of all US advertising."
- *Problem:* H4, plus a passive that hides who built it.
- *Fix:* "The pool the search auction actually chased, newspaper classified plus directories plus direct mail, was $77.4 billion that year, 31.3% of all US advertising."

**9.23** `L179` — "The record shows something duller and more useful: new media enter at small shares and take decades, while unglamorous channels — mail, directories, classified — quietly hold a third of the market."
- *Problem:* H4, on top of a colon.
- *Fix:* "The record shows something duller and more useful: new media enter at small shares and take decades, while mail, directories and classified quietly hold a third of the market."

## Style

**9.24** `L28` — "What exists is five compilers who each measured a different object."
- *Problem:* H11, and it wobbles on number agreement.
- *Fix:* "Five compilers exist, and each measured a different object."

**9.25** `L74` — "The first thing this kills is a piece of folklore."
- *Problem:* H10 inside H11.
- *Fix:* "The table kills a piece of folklore."

**9.26** `L78` — "The second thing the table shows is that inside the post-1960 window, advertising's share of the economy peaked in 2000, then fell through the whole digital period."
- *Problem:* H11. The real subject arrives eleven words late.
- *Fix:* "The table also shows that after 1960 advertising's share peaked in 2000, then fell through the whole digital period."

**9.27** `L189` — "What is left is the axis that actually moved."
- *Problem:* H11.
- *Fix:* "That leaves the axis that actually moved."

**9.28** `L94` — "This is graded C and the range runs 28% to 34%, because the media-side number is a licensed estimate we could only read from press releases."
- *Problem:* H10. The sentence before it is about what the tax line absorbs, not about the gap being graded.
- *Fix:* "That 31% gap is graded C, on a range of 28% to 34%, because the media-side number is a licensed estimate we could only read from press releases."

**9.29** `L142` — "This is not the split the compilers publish."
- *Problem:* H10.
- *Fix:* "No compiler publishes that split."

**9.30** `L173` — "This is normally credited to the merchant John Wanamaker, and used to show that advertising was unmeasurable until digital arrived."
- *Problem:* H10 plus two passives hiding who credits it and who uses it.
- *Fix:* "Writers normally credit the line to the merchant John Wanamaker, and use it to show advertising was unmeasurable until digital arrived."

**9.31** `L171` — "Both of these are used as evidence in this argument."
- *Problem:* H8. Who uses them?
- *Fix:* "People use both as evidence in this argument."

**9.32** `L175` — "No written or spoken instance from Wanamaker himself has been found."
- *Problem:* H8, in a passage about who searched and what they found.
- *Fix:* "Nobody has found a written or spoken instance from Wanamaker himself."

**9.33** `L144` — "One rule has to be fixed before the 2000 and 2025 rows can be read together: where directory money goes."
- *Problem:* H8, twice: the authors fix the rule, the reader reads the rows.
- *Fix:* "Fix one rule before reading the 2000 and 2025 rows together: where directory money goes."

**9.34** `L138` — "The reallocation case is best seen on an axis that has nothing to do with media."
- *Problem:* H8.
- *Fix:* "See the reallocation case on an axis that has nothing to do with media."

**9.35** `L44` — "The usual explanation is the price basis, billings against revenue."
- *Problem:* Zombie noun that hides who explains it that way.
- *Fix:* "Most people blame the price basis, billings against revenue."

---

# Chapter 10 — The verdict and the handoff

Do the one change first. Roughly 60% of this chapter is scheduled for deletion, and the items below apply to what survives.

## Cannot follow

**10.1** `L67` — "**The seller still counts the audience.**" under the heading "What Google did not change"
- *Problem:* Under the piece's own arc, seller-counting is what Google did change. As written, the chapter tells the reader that the seller counting its own audience is a continuity of the market rather than its rupture. That is not a nuance the reader can recover.
- *Fix:* Move this block out of "What Google did not change" and make it the head of the counting ledger. See the one change above.

**10.2** `L132` — "Meanwhile frontier reasoning models push the cost per answer back up, because they emit far more tokens than a fixed-length answer allows."
- *Problem:* "Frontier", "reasoning models" and "tokens" are three unexplained terms in one sentence, in the closing chapter of a history of advertising. The reader has never been told that AI answers are priced by the amount of text produced.
- *Fix:* "Meanwhile the newest and most expensive AI models push the cost of an answer back up, because they write far more words per answer than our fixed length allows, and the price is charged by the amount of text."

**10.3** `L146` — "The ad-tech remedies opinion had not issued."
- *Problem:* Three problems in six words. "Ad-tech" is undefined, "remedies opinion" is legal register, and "had not issued" uses the intransitive legal sense. The reader cannot tell which of the two court cases this is or what is still missing from it.
- *Fix:* "In the second Google case, the one about the software behind display ads, the judge had not yet said what Google must do to put things right."

**10.4** `L111` — "Only the 40.7% is hard, and it comes straight from the 10-K."
- *Problem:* "10-K" is never expanded. The reader has no way to know it is the audited annual report a US public company files, which is the entire reason the number is called hard.
- *Fix:* "Only the 40.7% is hard, and it comes straight from Google's audited annual report to US regulators."

**10.5** `L36` — "Google also issued a warrant over 7,437,452 shares."
- *Problem:* "A warrant" is finance jargon, and the next three sentences depend on understanding it. Ch07 glosses it; this chapter does not, and a reader who skipped the ch07 section is lost.
- *Fix:* "Google also gave AOL the right to buy 7,437,452 shares at a fixed price."

**10.6** `L26` — "Any account that says the design raised click prices has the sign backwards."
- *Problem:* "The sign" is maths jargon for a reader who knows no statistics.
- *Fix:* "Any account that says the design raised click prices has it backwards."

**10.7** `L113`, `L119`, `L148`, `L152`, `L155`, `L156` — "P3"
- *Problem:* Never defined anywhere in the ten chapters, including in two section headings.
- *Fix:* See W5. Introduce once in ch01, then use "the next project" here, and rename both headings.

## Filler and banned words

**10.8** `L46` — "So the firm with the higher yield wins the deal by construction."
- *Problem:* H1 plus "by construction", maths jargon.
- *Fix:* "The firm with the higher yield therefore wins the deal every time."

**10.9** `L52` — "So the better auction cannot be the whole story."
- *Problem:* H1.
- *Fix:* "The better auction cannot be the whole story."

**10.10** `L75` — "So the folklore that ads hold a steady 2% of GDP is built by quoting the recent window and dropping the 1920s."
- *Problem:* H1 plus a passive that hides who builds it.
- *Fix:* "People build the steady-2% folklore by quoting the recent window and dropping the 1920s."

**10.11** `L113` — "So 85% falling to 40.7% is not a collapse in unit margin."
- *Problem:* H1.
- *Fix:* "The fall from 85% to 40.7% is not a collapse in unit margin."

**10.12** `L134` — "So the blunt cost objection to ad-funded AI is much weaker than it was in 2023."
- *Problem:* H1.
- *Fix:* "The blunt cost objection to ad-funded AI is much weaker than it was in 2023."

**10.13** `L85` — "There is no yield trick inside a first-price rule, because rational buyers shade their bids and the seller collects about the same."
- *Problem:* H2.
- *Fix:* "A first-price rule holds no yield trick, because rational buyers shade their bids and the seller collects about the same."

## Style

**10.14** `L89` — "Do not merge the two 2019 changes. Display went first-price. Search never did. This is the most common factual error in accounts of that year, and both halves of our record flag it."
- *Problem:* H10, pointing at the wrong referent. The two sentences before it state the correct facts, not the error.
- *Fix:* "Merging them is the most common factual error in accounts of that year, and both halves of our record flag it."

**10.15** `L50` — "This also kills the neat version of the Overture story."
- *Problem:* H10.
- *Fix:* "That payout gap also kills the neat version of the Overture story."

**10.16** `L79` — "This is why the era names in this project name a mechanism, not a medium."
- *Problem:* H10. The antecedent is a whole preceding paragraph.
- *Fix:* "That stability is why the era names in this project name a mechanism, not a medium."

**10.17** `L130` — "Calibration matters more than the trend here."
- *Problem:* Zombie noun, and "calibration" is statistics jargon the reader has not been given. Same habit as ch08.
- *Fix:* "The bands matter more than the trend here."

**10.18** `L34` — "What the filings do show is the result."
- *Problem:* H11.
- *Fix:* "The filings do show the result."

**10.19** `L40` — "A take rate is an outcome of competition for partners. It is not a knob the seller sets."
- *Problem:* Zombie noun where a verb would do, and it hides the actor.
- *Fix:* "Competition for partners sets the take rate. The seller does not."

**10.20** `L152` — "A thin take rate on partner sites is usually defended this way: more inventory pulls in more buyers, deepens the auction and lifts prices on the seller's own pages."
- *Problem:* H8. Who defends it?
- *Fix:* "Sellers usually defend a thin take rate on partner sites this way: more inventory pulls in more buyers, deepens the auction and lifts prices on their own pages."

**10.21** `L91` — "Buyers were not told."
- *Problem:* H8, in a chapter about who did what.
- *Fix:* "Google did not tell them."
