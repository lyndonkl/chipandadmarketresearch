# Progress Log

This repo holds three research projects. Each one turns a question into a web page you can read and click through. Every number on the page is sourced.

The first project is built and live. The second is researched and its numbers are frozen; its design and page are still to come. The third has not started.

Last updated: 2026-07-31 (design locked, build not started).

## Where things stand

Project 1, the cost of running AI, is done and live. Its research, its numbers, and its web page are all finished and checked.

Project 2, the ad market, is researched. Ten chapters are written and 505 numbers are checked and frozen. What is left is the design session and the web page. See "Project 2 research" below.

Project 3, the synthesis, has not started. It waits on the first two.

The live site is at `https://lyndonkl.github.io/chipandadmarketresearch/`. The code is at `https://github.com/lyndonkl/chipandadmarketresearch`.

## What each top folder holds

`p1-ai-economics/` is the first project: the cost of running AI. Done.

`p2-ad-market/` is the second project: the history of the ad market. Research done, numbers frozen, page not built.

`p3-synthesis/` is the third project: what the first two teach about ads and AI. Empty but for a brief.

`docs/` holds the web pages that go live. It has the home page and the built Project 1 page.

`tools/` holds small scripts shared by every project.

`workflows/` holds the multi-agent scripts we ran to build Project 1. They are saved here so you can read them and run them again.

Each project folder is laid out the same way. `research/` holds the written chapters. `data/` holds the numbers. `design/` holds the design plan, once there is one.

## Read these first

`README.md` says what the repo is and how it is laid out.

`PROCESS.md` holds the standing rules: the order of work, the review gates, and the four reading tests that all prose must pass.

`p1-ai-economics/BRIEF.md` sets the scope and the questions for Project 1. Each project has its own `BRIEF.md`.

## Inside Project 1

`p1-ai-economics/research/` holds nine chapters, `01-thesis.md` through `09-verdict.md`. They are plain-English essays. Every one passes the four reading tests.

`p1-ai-economics/data/` holds the numbers and the working files.

`claims.json` is the heart of it. It holds 161 checked numbers. Each one carries a source, a grade, and a range. This is the one source of truth for every figure on the page.

`forecasts.json` holds our own forward guesses, such as the payback odds and the cash-flow models. These are kept apart from the sourced numbers on purpose.

`section-specs.json` is the plan for the web page. It says what each chapter tells the reader and which chart shows what. The page is built from this file.

`thesis-and-summaries.json` holds the thesis we tested and a short summary for each topic.

The rest are working notes from the review rounds: `content-findings.json`, `jargon-findings.json`, `remediation-patches.json`, and `reforecast-payload.json`. They are kept for the record. You do not need them to build the page.

`p1-ai-economics/design/DESIGN.md` is the design plan for Project 1. Its name is "The Instrument."

`p1-ai-economics/design/architect-proposals.json` holds all four looks we weighed before we picked one. The three we did not use are kept as seed ideas for the shared design, which comes after Project 2.

## The shared tools

`tools/readability.py` runs the four reading tests on any file. Use it on every piece of writing before it counts as done.

`tools/build_p1.py` builds the Project 1 page from `section-specs.json` and `claims.json`. Run it after any change to those two files.

## The workflows we ran

These are the multi-agent scripts that built Project 1. Each one ran a team of agents at once. They live in `workflows/` and are listed here in the order we ran them. They are the starting point for the same steps on Project 2.

`workflows/p1-ai-economics-research.js` did the main research: it set the thesis, gathered the numbers with sources, had a second agent try to break each one, and ran the forecast panel.

`workflows/p1-payback-reframe.js` reworked the payback question to cover the whole industry, using the cash-flow models and a fresh forecast.

`workflows/p1-design-architects.js` had four design agents each pitch a different look for the page.

`workflows/p1-section-specs.js` turned each chapter into a page plan: the points to make, the numbers to show, and the right chart for each.

`workflows/p1-content-sweep.js` checked every chart against the numbers, and had a second agent confirm each problem it found.

`workflows/p1-jargon-sweep.js` found words a general reader would not know, so we could explain them.

`workflows/p1-remediation-patches.js` turned the checks above into the exact fixes to apply.

Project 2's workflows are written and ready to run (see "Project 2 planning" below). Project 3 has none yet.

## Project 2 research (done 2026-07-31)

All the research is done. The numbers are frozen. Only the design and the web page are left.

Seven era chapters plus three more, ten in all. Every one passes the four reading tests with room to spare. The numbers behind them sit in `p2-ad-market/data/`, and `data/FREEZE.md` says what is frozen and what a builder must not get wrong.

The work ran in six stages, each checked by a script and an auditor before the next began. Two stages stopped for human review, as planned.

What the checking bought: a third of the first-draft numbers were wrong in some way and got fixed. Four claims were thrown out. Two of those had said the ad market peaked in 2000. It did not. It peaked in 1922.

`p2-ad-market/planning/gate-a-approval.md` and `gate-b-approval.md` hold the two human decisions and why they were made. `data/moneytype/reconciled.json` holds the audit trail for the last round of number work.

Four cross-era stories were picked to become their own chapters and charts: who counted the audience and who paid them; the middleman's cut; who was allowed to buy; and the rent on the front door. Two of those four were not in the plan. The evidence turned them up.

What is left: the design session, then the build.

## Project 2 design and prep (done 2026-07-31)

The design is picked and the writing is fixed. The build has not started.

**The design is called The Bench.** Each era is drawn as a machine that sets a price. Eight parts, same eight places on screen, drawn seven times. You turn a crank in the first one and turn cranks in all the rest. Five design teams pitched, four sample pages were built against the real numbers, and the human picked from those. The pages are in `p2-ad-market/design/samples/`. The build brief is `p2-ad-market/design/DESIGN.md`.

**The story now has a shape.** For 82 years somebody other than the seller counted the audience. Around 1996 that stopped: the seller began counting its own inventory, running the auction, checking the click and billing its own log. A reader who had never seen the text read all ten chapters and stated that back without being asked. That was the test.

**Three design problems nobody had solved are now decided.** How to show Google paying to be the default search box. How to show the middleman's fee when every era measured it differently. How to let a reader compare one topic across all seven eras. The options and the reasons are in `p2-ad-market/design/OPEN-PROBLEMS.md`.

**The writing was audited twice.** The first pass found 280 problems, including 124 sentences a first-time reader could not follow. The second pass fixed nine more that were worse: sentences a reader followed and then found were wrong. Chapter 10 was rebuilt as a list of who held the tape measure, 1914 to 2019.

**Three wrong numbers were found and fixed**, all of which had passed every earlier check. One said 800 homes were a quarter of US households. One had two different meanings of "date" mixed across 505 claims. One described the auction's pricing rule in a way that did not match its own table.

Each fix added a new check, so the same kind of mistake gets caught next time. There are 22 checks now, and each one has been proven to catch something.

**What to run next:** `p2-ad-market/BUILD-PLAN.md`. It sets out eight build teams. The two teams that had to finish first are both done.

## Project 2 planning (locked 2026-07-30)

The scope grew from the old brief. Every era now gets full depth, not just the Google years. The eras are cut where the pricing mechanism changed, and named for it: The Middlemen, Sponsorship, The Spot Market, Segmentation, The Impression, The Auction, The Machine Market. The last era runs to a data freeze of 2026-06-30.

Seven scout agents probed the plan for blind spots first. They found 65 gaps; 11 were blocking. The big three. First, the money Google took first was classified and directory money, which the old plan never tracked. Second, the century data set is really several clashing series that must be joined honestly, with the seams shown. Third, the auction alone did not win the market — distribution deals were at least co-equal, so era 6 now tells a twin-engine story. The full probe, with sources, sits in `p2-ad-market/planning/unknown-unknowns-probe.json`.

`p2-ad-market/PLAN.md` is the execution contract. Read it first. It holds the decision ledger, the era map, the nine-field schema, the five research stages, the two human gates, and the budget.

Each stage ends with an automated check before any human review. The checks live as contracts in `p2-ad-market/planning/contracts/`. The script `tools/verify_p2.py` runs the mechanical parts. A failed check gets up to two auto-repair rounds, then stops and asks the human. This rule is now in `PROCESS.md` for all projects.

Five new agents were built for this work. They live in the shared agent repo at `~/Documents/Projects/claude/agents/`: market-era-historian, series-archaeologist, mechanism-analyst, claim-verifier, and stage-auditor. They are generic by design — the workflows feed them their P2 inputs. Six critic agents reviewed them and their fixes were applied.

The workflows to run, in order: `p2-r1-era-research.js`, then verify contract r1; `p2-r2-dataset.js`, then verify r2; stop for human Gate A; `p2-r3-claim-verification.js`, then verify r3; `p2-r4-mechanism.js`, then verify r4; `p2-r5-synthesis.js`, then verify r5; stop for human Gate B. The verify step is `p2-verify-stage.js` with the contract path as its argument. Gate A needs an approval note at `p2-ad-market/planning/gate-a-approval.md` before r3 will pass its checks.

To run one again, open it, read the top of the file for what it needs, and start it with the Workflow tool. Point it at the script by its path.

## The raw research transcripts

The full agent transcripts from those runs sit outside this repo. They are at `~/.claude/projects/-Users-kushaldsouza-Documents-Thinking-chipandadmarketresearch/d49df9c4-fddb-4400-b13e-1a82c709e63f/subagents/workflows/`. That is about 100 MB of raw thinking and web reads.

A new chat can read them by that path while they last. But they may be cleared over time, so do not count on them. We did not copy them into the repo, because 100 MB does not belong in git.

You should not need them. Every number, source, finding, and design idea was already pulled out into the data files above. The transcripts are only the working notes behind that.

## What has been done, in order

First, we shaped the three projects through a grilling session and set the rules.

Then we researched Project 1: the thesis, the 161 numbers, and the forward guesses.

Then we reframed the payback question to cover the whole industry, and ran the guess again.

Then we locked the Project 1 design through a second grilling session.

Then we built the page: nine chapters and 61 charts.

Then we ran five rounds of review. We fixed wrong numbers, unclear charts, jargon, and layout bugs.

Last, we put the site live.

The full history sits in the git log.

## What comes next

Project 2 research is next: the ad market, from its roots to today. This is fresh work. It needs its own web-search budget, so start it in a new chat.

The order is set in `PROCESS.md`. First research, then your review, then the data layer, then a design grilling, then the build.

One thing waits by choice. The shared design system and the home page tree get their full design only after Project 2 is researched. That way they serve both projects, not just the first.

## How to rebuild the Project 1 page

From the repo root, run `python3 tools/build_p1.py` to rebuild `docs/p1/index.html`.

Run `python3 tools/readability.py p1-ai-economics/research/*.md` to check the chapters.

To publish a change, commit it and then run `git push`. The live page updates in about a minute.
