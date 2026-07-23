---
title: "Supply, Demand, and the Coming Convergence"
project: p1-ai-economics
chapter: 7
claims_used: [px-01, px-04, px-05, px-06, px-07, px-08, px-12, px-13, sd-01, sd-03, sd-05, sd-06, sd-07, sd-09, sd-10, sd-11, sd-12, sd-13, sd-15, sd-16, sd-17]
readability: "PASS fk_grade=5.65 reading_ease=74.1 gunning_fog=7.45 smog=8.36"
status: draft-for-review
---

# Supply, Demand, and the Coming Convergence

The argument we are testing makes a clean prediction. Training a model is a fixed cost. Serving it is not. Every answer burns real compute, so serving has a marginal cost: the cost of one more unit of output. US labs charge far above that today. They can, because there is not enough compute to go round. When supply catches up, the extra margin should melt away.

So this chapter asks three plain questions. Is supply still short? Is demand still growing? And has the price gap begun to close?

## Supply is still short

Start with the people who sell compute. Microsoft's Azure cloud grew 39 percent from a year earlier in the quarter to March 2026, once you strip out currency moves.[^1] It grew that fast while telling the market that demand keeps running ahead of what it can build. Google said much the same in July 2026. Its cloud backlog, meaning work sold but not yet served, hit $514 billion. Its finance chief said the firm was "still in a supply-constrained environment," and had been saying so for quarters.[^2]

The rental market agrees. A one-year contract for an H100 chip, the workhorse of the last cycle, sank in price as the chip aged. Then it turned. By March 2026 the rate was back up to $2.35 per chip-hour, about 40 percent above the low.[^3] Old silicon does not get dearer in a glut.

The binding limit is power, not chips. In Texas, the ERCOT grid was fielding 143 gigawatts of data-center hookup requests. Its all-time peak load is 85.9 gigawatts.[^4] Plenty of those requests are wishful, and most will never be built. Even so, one grid alone has been asked for more than the whole system has ever served at once. Grid work takes years.

Labs ration by hand when they run out. Anthropic capped how much Claude Code a user could run. It doubled those caps in May 2026, once more than 300 megawatts of fresh capacity came online.[^5] Firms with pricing power do not make their best customers queue unless they have to.

## Demand keeps growing

Google says it now handles about 3,200 trillion tokens a month across its products, near seven times the year before.[^6] Treat that gently. It counts free search results and video, so it does not measure what anyone paid for. OpenRouter, an open marketplace, routed about 25.5 trillion tokens a week by May 2026.[^7] It leans toward cheap models, so it is not the whole market either.

Nvidia gives the cleanest read. Its data-center business booked $75.2 billion in the three months to April 2026, nearly double the year before.[^8] Some of that jump was network gear rather than chips. Still, kit is shipping as fast as it can be built, and it is all being put to work.

Both sides are growing fast. The world stock of AI compute is rising about 3.4 times a year.[^9] Reported token demand has been rising faster still. While that holds, the shortage holds.

There is a catch buried in the demand data. Cheaper does not reliably mean more used. On OpenRouter, a 10 percent price cut bought only about a 0.6 percent lift in use of that model.[^10] That figure is soft, and it measures a narrow thing: which model a buyer picks, not how much work the whole market buys. But it points the same way as the rest of the evidence. Buyers chase quality first and price second.

One real counter-signal sits against all this. OpenAI now plans to spend roughly $750 billion on compute through 2030. That is our best estimate, and we hold it loosely: the honest range runs from about $480 billion to $900 billion.[^11] The target was cut and then raised again inside a single year, and the firm has missed some of its own revenue goals. The shortage could end because buyers slow down, not because sellers catch up.

## Has the gap closed?

No. It has widened.

First, the proof that a gap was there at all. In June 2025 OpenAI cut the price of its o3 model by 80 percent. It said plainly that the model was unchanged, and that only the serving software had improved.[^12] In November 2025 Anthropic cut its top Opus tier by two thirds.[^13] You cannot cut a price that hard, that fast, on a fixed product unless the old price sat well above the cost of serving it.

Then 2026 went the other way. OpenAI's flagship input price rose about four times over from its 2025 low, to $5 per million tokens.[^14] Anthropic added a new tier above Opus at $10 per million input tokens.[^15] Cheaper tiers still exist below both. But at the frontier, the price of the best thing on sale is now moving up.

Sticker prices also flatter the buyer. When OpenAI doubled its rate in April 2026, the real cost of a like-for-like request rose about 64 percent, not the full double.[^16] Anthropic's newer models use a tokenizer, the tool that chops text into billable units, that yields about 30 percent more tokens for the same text.[^17] The headline rate did not move. The bill did. The token is not a fixed unit, so price per token should be read with care.

None of this means intelligence is getting dearer. Hold quality fixed and prices have fallen at a startling clip. Our best estimate is roughly 36-fold a year, but the honest range is huge: anywhere from 8-fold to 200-fold, depending on the task you measure.[^18] That series also leaves out reasoning models, which burn far more tokens per job. So both things are true at once. Yesterday's intelligence gets cheap fast. Today's best gets more expensive.

## What about China?

Our verified numbers cover US prices in depth and Chinese prices barely at all. So we will not put a figure on the gap. The mechanism is clear enough without one. Chinese open-weight models can be hosted by anyone. Many sellers compete to serve the very same model, and the cheapest of them sets the price. That floor sits near the cost of serving.

The one measure we do have is where the volume goes. By April 2026, about 45 percent of the tokens routed through OpenRouter went to models of Chinese origin. Call it 35 to 55 percent, on a market that draws bargain hunters.[^19] Yet most business spending still went to the two US leaders. One survey put the pair at about 67 percent of it in 2025.[^20]

Read together, those facts fit the thesis rather than break it. The price-hunting tail has already left. Scarce US capacity is being saved for buyers who will pay for the best. The gap is not closing. It is sorting.

## What convergence would look like

We should say in advance what would change our minds. Convergence needs several things at once: flagship prices falling again in cash terms, chip rentals softening, and the big clouds dropping the word "constrained." None of that has happened yet.

Our best guess is that the umbrella holds through 2027, because the power grid gates how fast money turns into servable tokens. We would not be shocked to see it break sooner. If it does, the cause may not be the one the thesis expects. It may be that demand cooled first.

[^1]: "Microsoft Q3 FY 2026 Earnings," Futurum. https://futurumgroup.com/insights/microsoft-q3-fy-2026-earnings-show-cloud-growth-with-capacity-still-tight/
[^2]: "Alphabet earnings takeaways," CNBC. https://www.cnbc.com/2026/07/22/google-earnings-q2-goog-live-updates.html
[^3]: "The Great GPU Shortage," SemiAnalysis. https://newsletter.semianalysis.com/p/the-great-gpu-shortage-rental-capacity
[^4]: "Why American data centers can't plug in," Works in Progress. https://worksinprogress.co/issue/why-american-data-centers-cant-plug-in/
[^5]: "Higher limits for Claude and a compute deal with SpaceX," Anthropic. https://www.anthropic.com/news/higher-limits-spacex
[^6]: "Sundar Pichai's opening keynote," blog.google. https://blog.google/innovation-and-ai/sundar-pichai-io-2026/
[^7]: "OpenRouter raises $113M as weekly volume explodes," Yahoo Finance. https://finance.yahoo.com/sectors/technology/articles/openrouter-raises-113-million-capitalg-131500093.html
[^8]: "NVIDIA Announces Results for Q1 Fiscal 2027," NVIDIA Newsroom. https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-first-quarter-fiscal-2027
[^9]: "Trends in AI supercomputers," Epoch AI. https://epoch.ai/blog/trends-in-ai-supercomputers
[^10]: "State of AI 2025: 100T Token LLM Usage Study," OpenRouter. https://openrouter.ai/state-of-ai
[^11]: "OpenAI resets spending expectations," CNBC. https://www.cnbc.com/2026/02/20/openai-resets-spend-expectations-targets-around-600-billion-by-2030.html
[^12]: "OpenAI announces 80% price drop for o3," VentureBeat. https://venturebeat.com/ai/openai-announces-80-price-drop-for-o3-its-most-powerful-reasoning-model
[^13]: "Anthropic pricing docs," Anthropic. https://platform.claude.com/docs/en/about-claude/pricing
[^14]: "OpenAI API pricing," OpenAI. https://developers.openai.com/api/docs/pricing
[^15]: "Anthropic pricing docs," Anthropic. https://platform.claude.com/docs/en/about-claude/pricing
[^16]: "GPT-5.5 Price Increase," OpenRouter. https://openrouter.ai/blog/insights/gpt55-cost-analysis/
[^17]: "Anthropic pricing docs, tokenizer note," Anthropic. https://platform.claude.com/docs/en/about-claude/pricing
[^18]: "LLM inference prices have fallen fast," Epoch AI. https://epoch.ai/data-insights/llm-inference-price-trends
[^19]: "OpenRouter data on model token share," Crypto Briefing. https://cryptobriefing.com/openrouter-us-models-token-share-collapse/
[^20]: "2025: The State of Generative AI in the Enterprise," Menlo Ventures. https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/
