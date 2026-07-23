---
title: The Verdict
project: p1-ai-economics
chapter: 9
claims_used: [fx-06, fx-13, mc-08, mc-09, px-01, px-04, px-05, px-06, px-07, px-08, cx-11, cx-13, rv-01, rv-02, rv-03, rv-05, rv-10, rv-12, cd-01, cd-02, cd-04, cd-07, cd-09, cd-12, ce-05, ce-08, sd-05, sd-06, sd-09, sd-13, sd-16, dp-01, dp-02, dp-09, dp-10, dp-14]
readability: "PASS fk_grade=6.08 reading_ease=71.68 gunning_fog=8.29 smog=9.02"
status: draft-for-review
---

# The Verdict

Chapter one set out six claims and promised to check each against numbers. This chapter rules.

Four verdicts. **Supported**: the numbers back the claim. **Partly supported**: part holds, part is too strong. **Refuted**: the numbers point the other way. **Unresolved**: the claim is about a future that has not arrived.

Four are supported. One is partly supported. One is unresolved. None is refuted. A strong showing, and still less than a win: the open one is the claim with all the money on it.

## T1. Training is fixed. Serving is not. Supported.

Anthropic spent about $4.1 billion on research and training compute in 2025, against about $2.7 billion on serving.[^1] The build cost still tops the running cost. But the running cost is real, and it climbs with use.

OpenAI's leaked 2025 accounts show the same shape. On sales of $13.07 billion,[^2] gross margin was about 43%, and we would not be shocked by anything from 33% to 47%.[^3] Software firms have long kept much more of each sale. OpenAI also lost $20.92 billion at the operating line, $19.18 billion of it in research.[^4]

The build cost is rising too. One Grok 4 training run is put at about $490 million, on a range of $220 million to $900 million.[^5]

One caveat: cost per unit of quality falls fast, so the marginal cost is real but not steady.

## T2. US prices sit far above serving cost. Supported.

The best evidence is a price cut. In June 2025 OpenAI cut its o3 model by 80%, saying the model was unchanged and only the serving software had improved.[^6] Five months later Anthropic cut its Opus tier by two thirds.[^7] No seller can do that if price sits near cost.

We estimate that serving costs about 15% of the US list price. We would not be shocked by 6%, nor by 48%.[^8] SemiAnalysis puts Anthropic's margin on serving hardware near 72%.[^9]

Scarcity is visible. Google's cloud backlog reached $514 billion and its finance chief said the firm was still short of supply;[^10] Azure grew 39% in a year while saying the same.[^11] A one-year H100 rental climbed back to $2.35 per chip-hour by March 2026.[^12] Three-year-old chips do not get dearer in a glut.

## T3. Chinese prices are set at serving cost. Partly supported.

The mechanism holds. The wording is too strong.

The sharpest test: in July 2026 Moonshot launched Kimi K3 at $15 per million output tokens, before releasing the model files. Anthropic charges the same for Claude Sonnet 4.6.[^13] When a Chinese lab is the only host, it charges a US price. What pushes prices down is open weights and crowded hosting, not the flag on the building.

DeepSeek once posted a day of its serving data. Billed at list, revenue would have been 545% of the chip bill.[^14] That is not a firm selling at cost. Its cheap tier is real: V4-flash lists at $0.28 per million output tokens.[^15] But that is a choice, not a floor.

The half that matters survives: the US-China gap measures American scarcity and Chinese strategy, not a Chinese cost edge.

## T4. Chinese labs push the fixed cost elsewhere. Supported.

DeepSeek reported a final training run of $5.576 million, and its own paper says that leaves out earlier research and failed runs.[^16] The chip fleet behind the work is put at about $1.4 billion, on a range of $0.6 billion to $2.6 billion, paid for by the founder's hedge fund.[^17] In June 2026 the firm took $7.4 billion of outside money.[^18] None of it came from selling tokens.

Zhipu lost RMB 4.7 billion in 2025 on sales of RMB 724 million.[^19] Alibaba is spending RMB 380 billion over three years, and gives Qwen's weights away to sell the compute beneath them.[^20]

## T5. Supply catches up, prices fall to cost. Unresolved.

This is the claim with the money on it, and it is untested. So far the price has moved the wrong way. OpenAI's flagship input price rose four-fold from its 2025 low, to $5 per million tokens.[^21] Anthropic's newer models chop text into about 30% more billable tokens for the same words, at an unchanged rate.[^22]

Supply is coming. The four biggest US buyers plan about $717.5 billion of capital spending in 2026, on a range of $655 billion to $790 billion.[^23] But power gates how fast money becomes sellable capacity. Texas's ERCOT grid was fielding 143 gigawatts of hookup requests from data centers, against an all-time peak load of 85.9 gigawatts.[^24]

Our forecasting panel gives it 13% that either OpenAI or Anthropic sells frontier tokens within 1.5 times serving cost by the end of 2028, and all three panellists landed within a point of that. They do expect prices to fall: their middle guess for the flagship input price at end-2028 is 58% of its mid-2026 level, on an 80% range of 17% to 195%.

Read those together. The umbrella leaks. It does not break.

## T6. The token is the wrong unit. Supported.

When OpenAI doubled its rate in April 2026, the measured cost of a like-for-like job rose about 64%, not 100%, on a range of 38% to 100%, because the newer model wrote less.[^25] Anthropic's tokenizer change moved the bill about 30% without moving the rate.[^22] Hold quality fixed instead of the model, and prices have fallen about 36-fold a year, on a range of 8-fold to 200-fold.[^26] Three ways of counting, three stories. The unit is not stable.

The rest of this claim is a forecast, so we leave it open. Thompson expects labs to live on serving skill and on products built above the raw API. One early sign: Anthropic booked $10.9 billion of sales in the June 2026 quarter and its first operating profit, near $559 million, though those numbers come from a fundraising deck, not an audit.[^27]

## The bill

One question remains. Does the building pay for itself?

Our forecasting panel's middle estimate is 56% that the 2024-2026 vintage of US AI spending earns back its cost of capital by 2030, and the three views ran from 27% to 61%. That spread is the honest answer.

The arithmetic shows why. David Cahn of Sequoia puts the lifetime revenue needed to justify one year of building at this scale at about $1.5 trillion.[^28] One year of it, from four firms alone, is $717.5 billion.[^23] Anthropic's stated run-rate was $47 billion in May 2026,[^29] and OpenAI's about $24 billion in March.[^30] Both are growing several times a year. Neither is close.

The clock matters as much as the sum. Epoch finds a leading chip design serves at the frontier about 3.9 years, on a range of 2.5 to 4.5.[^31] Microsoft writes its servers off over six; Amazon cut part of its fleet to five and named AI as the reason.[^32][^33] But leaving the frontier is not the same as stopping work. CoreWeave re-signed an expiring H100 deal at about 95% of the old price.[^34] What old chips earn after new ones land is the hinge of the payback case.

## What would change the verdict

T2 weakens if a lab discloses serving margins near cost, or if the clouds stop rationing while prices hold. T3 flips if someone shows a real Chinese edge in power or chip costs, not just in price. T6 flips if cheap models win on cost per finished job, not merely per token.

T5 is the big one. It resolves for the thesis if flagship prices fall for two quarters while chip rentals soften and the clouds drop the word "constrained." It resolves against if supply lands and prices hold anyway.

The payback case breaks if OpenAI reworks its compute deals. It has announced about $1.25 trillion of them, on a range of $0.8 trillion to $1.65 trillion, so much of the demand protecting this vintage runs through one buyer.[^35]

## What to watch

Four gauges, in the order they move. The chip rental index, which turned up first.[^12] The word "constrained" on cloud earnings calls.[^10] The flagship list price, the thesis in one number.[^21] And OpenAI's compute plan, near $750 billion through 2030, on a range of $480 billion to $900 billion, cut and then raised inside one year.[^36]

Thompson's core point has held up. Marginal costs are back. What we cannot yet say is who ends up paying for the ovens.

[^1]: "Compute accounts for the majority of expenses of AI companies" — Epoch AI. https://epoch.ai/data-insights/company-spending-breakdown
[^2]: "OpenAI's financials have leaked" — Fortune, June 16, 2026. https://fortune.com/2026/06/16/openai-financials-leaked-losses-revenue-profit/
[^3]: "OpenAI's financials have leaked" — Fortune, June 16, 2026. https://fortune.com/2026/06/16/openai-financials-leaked-losses-revenue-profit/
[^4]: "Exclusive: OpenAI Losses Increased Nearly 8X in 2025" — Ed Zitron, Where's Your Ed At, June 2026. https://www.wheresyoured.at/exclusive-openai-financials/
[^5]: "What did it take to train Grok 4?" — Epoch AI. https://epoch.ai/data-insights/grok-4-training-resources
[^6]: "OpenAI announces 80% price drop for o3" — VentureBeat, June 2025. https://venturebeat.com/ai/openai-announces-80-price-drop-for-o3-its-most-powerful-reasoning-model
[^7]: "Pricing" — Anthropic. https://platform.claude.com/docs/en/about-claude/pricing
[^8]: "Are OpenAI and Anthropic Really Losing Money on Inference?" — Martin Alderson. https://martinalderson.com/posts/are-openai-and-anthropic-really-losing-money-on-inference/
[^9]: "AI Value Capture: The Shift To Model Labs" — SemiAnalysis, May 1, 2026. https://newsletter.semianalysis.com/p/ai-value-capture-the-shift-to-model
[^10]: "Alphabet earnings takeaways" — CNBC, July 22, 2026. https://www.cnbc.com/2026/07/22/google-earnings-q2-goog-live-updates.html
[^11]: "Microsoft Q3 FY 2026 Earnings" — Futurum Group. https://futurumgroup.com/insights/microsoft-q3-fy-2026-earnings-show-cloud-growth-with-capacity-still-tight/
[^12]: "The Great GPU Shortage: Rental Capacity" — SemiAnalysis, April 2, 2026. https://newsletter.semianalysis.com/p/the-great-gpu-shortage-rental-capacity
[^13]: "Kimi K3 API pricing" — OpenRouter. https://openrouter.ai/moonshotai/kimi-k3
[^14]: "DeepSeek-V3/R1 Inference System Overview" — DeepSeek, open-infra-index on GitHub. https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/day_6_one_more_thing_deepseekV3R1_inference_system_overview.md
[^15]: "Models and Pricing" — DeepSeek API Docs. https://api-docs.deepseek.com/quick_start/pricing
[^16]: "DeepSeek-V3 Technical Report" — arXiv 2412.19437. https://arxiv.org/pdf/2412.19437
[^17]: "DeepSeek Debates" — SemiAnalysis, January 31, 2025. https://newsletter.semianalysis.com/p/deepseek-debates
[^18]: "How DeepSeek's landmark funding secures Liang Wenfeng's grip" — South China Morning Post, June 2026. https://www.scmp.com/tech/big-tech/article/3357525/how-deepseeks-landmark-funding-secures-liang-wenfengs-grip-chinas-ai-rivalry-heats
[^19]: "Zhipu AI revenue jumps 132% in first post-IPO report" — South China Morning Post, March 2026. https://www.scmp.com/tech/tech-trends/article/3348555/zhipu-ai-revenue-jumps-132-first-post-ipo-report-missing-estimates
[^20]: "Alibaba to Invest RMB380 billion in AI and Cloud Infrastructure Over Next Three Years" — Alibaba Group, February 24, 2025. https://www.alibabagroup.com/en-US/document-1830678592242057216
[^21]: "API pricing" — OpenAI. https://developers.openai.com/api/docs/pricing
[^22]: "Pricing" — Anthropic. https://platform.claude.com/docs/en/about-claude/pricing
[^23]: "Big Tech's AI capex in 2026" — Value Add VC. https://valueaddvc.com/blog/big-tech-ai-capex-in-2025-microsoft-google-meta-amazon-and-the-spending-race
[^24]: "Why American data centers can't plug in" — Works in Progress, June 22, 2026. https://worksinprogress.co/issue/why-american-data-centers-cant-plug-in/
[^25]: "GPT-5.5 Price Increase: What It Actually Costs" — OpenRouter, April 2026. https://openrouter.ai/blog/insights/gpt55-cost-analysis/
[^26]: "LLM inference prices have fallen rapidly but unequally across tasks" — Epoch AI, March 2025. https://epoch.ai/data-insights/llm-inference-price-trends
[^27]: "Anthropic's 'Profitability' Swindle" — Ed Zitron, Where's Your Ed At, citing Wall Street Journal figures, May 2026. https://www.wheresyoured.at/anthropics-profitability-swindle/
[^28]: "Can AI answer the $3 trillion question?" — TechCrunch, July 9, 2026. https://techcrunch.com/2026/07/09/can-ai-answer-the-3-trillion-question/
[^29]: "Anthropic raises $65B in Series H funding" — Anthropic, May 28, 2026. https://www.anthropic.com/news/series-h
[^30]: "OpenAI Revenue, Losses, and Profitability in 2026" — FutureSearch. https://futuresearch.ai/openai-financial-forecast/
[^31]: "Leading AI chip designs are used for around four years in frontier training" — Epoch AI, March 2025. https://epoch.ai/data-insights/gpu-frontier-lifespan
[^32]: "Microsoft extends life of cloud servers to six years" — The Register, August 2, 2022. https://www.theregister.com/2022/08/02/microsoft_server_life_extension/
[^33]: "On Amazon and Server Lifespans" — Calcbench, February 2025, on Amazon's Q3 2025 Form 10-Q. https://www.calcbench.com/blog/post/blogger141924366623734345/On-Amazon-and-Server-Lifespans
[^34]: "The question everyone in AI is asking: How long before a GPU depreciates?" — CNBC, November 14, 2025. https://www.cnbc.com/2025/11/14/ai-gpu-depreciation-coreweave-nvidia-michael-burry.html
[^35]: "OpenAI's $1 trillion infrastructure spend" — Tomasz Tunguz, November 2025. https://tomtunguz.com/openai-hardware-spending-2025-2035/
[^36]: "OpenAI lifts planned compute spending to $750 billion through 2030" — Yahoo Finance, citing The Wall Street Journal, July 22, 2026. https://finance.yahoo.com/technology/ai/articles/openai-lifts-planned-compute-spending-144917731.html
