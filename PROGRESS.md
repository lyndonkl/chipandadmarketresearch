# Progress Log

This repo holds three research projects. Each one turns a question into a web page you can read and click through. Every number on the page is sourced.

Only the first project is built. The other two have not started yet.

Last updated: 2026-07-24.

## Where things stand

Project 1, the cost of running AI, is done and live. Its research, its numbers, and its web page are all finished and checked.

Project 2, the ad market, has not started. Its folder holds only a brief.

Project 3, the synthesis, has not started. It waits on the first two.

The live site is at `https://lyndonkl.github.io/chipandadmarketresearch/`. The code is at `https://github.com/lyndonkl/chipandadmarketresearch`.

## What each top folder holds

`p1-ai-economics/` is the first project: the cost of running AI. Done.

`p2-ad-market/` is the second project: the history of the ad market. Empty but for a brief.

`p3-synthesis/` is the third project: what the first two teach about ads and AI. Empty but for a brief.

`docs/` holds the web pages that go live. It has the home page and the built Project 1 page.

`tools/` holds small scripts shared by every project.

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

## The shared tools

`tools/readability.py` runs the four reading tests on any file. Use it on every piece of writing before it counts as done.

`tools/build_p1.py` builds the Project 1 page from `section-specs.json` and `claims.json`. Run it after any change to those two files.

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
