---
title: What a Token Costs to Serve
project: p1-ai-economics
chapter: 3
claims_used: [mc-02, mc-03, mc-05, mc-07, mc-08, mc-09, mc-11, mc-12, mc-14, mc-15, mc-16, mc-17, mc-18, px-01, px-02, px-03, px-04, px-05, px-06, px-07, px-08, px-12, px-13]
readability: "PASS fk_grade=5.26 reading_ease=77.53 gunning_fog=7.63 smog=8.48"
status: draft-for-review
---

# What a Token Costs to Serve

Every token has two numbers attached. One is the price on the rate card. The other is what the seller paid to make it. This chapter is about the gap between them.

Serving a model reply is called inference. It runs each time the model answers you. Training a model is a one-time build cost. Serving is not. It runs again for every user, every day.

That makes serving a marginal cost: the cash a seller spends to make one more unit. Old-style software had almost none. One more copy of a program cost the maker nothing. One more model reply costs real money. It burns real time on a real chip.

So how wide is the gap between price and cost? And what does the gap tell us?

## What a token costs to make

The clearest hard number comes from China. In March 2025 DeepSeek published its own serving log for a single day. It ran its big model on 2,224 chips. On its own figures, the output tokens cost about $0.52 per million to serve.[^1] That is our best point estimate. We would not be shocked by anything from $0.30 to $1.30. The log was not audited, and it uses a rental rate the lab assumed rather than paid.

Two other anchors sit near it. A measured test served a mid-size open model on an H100 chip for about $0.26 per million tokens.[^2] A careful outside estimate puts a US frontier model near $3 per million output tokens, with a range of $1 to $7.[^3] Note the spread. Bigger models and faster replies both cost more.

Almost none of that cost is power. Our estimate is that power makes up about 6% of the cost of serving, and we would not argue with 3% to 12%.[^4] The rest is the chip: what it costs to buy or rent, spread over the hours it runs. That will matter later.

## What a token sells for

OpenAI's top model now lists at $5 per million input tokens and $30 per million output.[^5] The top Anthropic tier lists at $10 and $50.[^6] Set those against a serving cost of one to three dollars.

Pull it together and you get the key ratio. Our best estimate is that the cash cost of serving is about 15% of the US list price.[^7] The honest range is wide: 6% to 48%. So the price sits somewhere between two and sixteen times the cost, with a best guess near seven.

That gap is the pricing power. It is not proof of greed. It is proof of scarcity. Demand for top-grade models runs ahead of the chips that serve them, and buyers have few places to go. A seller in that spot does not have to price near cost. Note too that the labs are the last link in a chain. The chip maker takes a margin, then the cloud takes one, and only then does the lab set its price.

## Why the company books look worse

Here the story turns. The margin Anthropic earns on its serving fleet is put at about 72%, up from 38% a year earlier.[^8] But whole-company gross margin is far lower. Our estimate for OpenAI in 2025 is about 42%, and the public figures run from 29% to 45%, based on which costs you count.[^9] One report puts the firm's cloud serving bill at $8.7 billion in the first nine months of 2025 alone.[^10]

Three things sit between the two numbers. Free users burn chips and pay nothing. Spare machines bought in a hurry cost more than planned ones. And much of the fleet sits idle off-peak: our rough read is that a serving fleet does about 40% of the work it could, and the band runs from 25% to 65%.[^11] Training is not in this line at all. It counts as research.

So both things are true at once. A paid token earns a fat margin. The firm as a whole does not.

## The price collapse, and the reversal

Now the part everyone quotes. Hold quality fixed and prices have fallen off a cliff. In late 2021, text of GPT-3 grade cost $60 per million tokens. Three years later the same grade cost $0.06, a thousand-fold drop.[^12] Across many tests the median fall is about 36 times a year, though the spread runs from 8 to 200.[^13] Front-line list prices fell too, if more slowly. The flagship input price at OpenAI dropped by roughly 18 times between March 2023 and August 2025.[^14]

The sharpest clue came in June 2025. OpenAI cut the price of o3 by 80% and said plainly that it was the "same exact model — just cheaper."[^15] Against the cheaper tier some buyers already had, the cut was nearer 60%. Anthropic then cut its own top tier by two thirds that November.[^16] A cut that deep with no change to the model means one of two things. Either the old price sat far above cost, or the cost of serving fell fivefold in weeks. Both point the same way. Price and cost were not tied together.

Then 2026 broke the trend. The flagship input price at OpenAI has gone the other way, up four times from its low of $1.25 to $5.[^17] Rent on an H100 chip rose from $1.70 an hour in October 2025 to about $2.45 by mid-2026.[^18] When two-year-old chips get dearer, supply has not caught up.

Some of the rise is quieter than it looks. When OpenAI moved to GPT-5.5, the per-token price doubled, but the model wrote less. Real cost per job rose about 64%, and plausibly 38% to 100%.[^19] Newer Anthropic models use a tokenizer that turns the same text into about 30% more tokens.[^20] The rate card did not move. The bill did.

## Where price does track cost

The contrast case is open weights. Anyone can host a model whose weights are public, so hosts compete on cost alone. The cheapest solid host of one open model charges about $0.065 per million tokens, blended.[^21] That sits inside the measured cost band. DeepSeek lists its own model at $0.42 per million output tokens.[^22] These are marginal-cost prices, set by whichever host will take the thinnest slice.

Do not read that as a Chinese cost edge. Kimi K3, from Moonshot, lists at $3 and $15, the same as Claude Sonnet.[^23] The gap is not about cheaper chips in China. It is about who can be undercut.

One last warning. A token is not a fixed unit of work. Two models can spend very different token counts on the same job, as both the GPT-5.5 case and the tokenizer case show. The honest yardstick is cost per finished job, not cost per token.

So the gap is real, it is wide, and in mid-2026 it is still open. The next chapter asks what would close it.

[^1]: "DeepSeek-V3/R1 Inference System Overview," DeepSeek open-infra-index, GitHub, 2025-03-01. https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/day_6_one_more_thing_deepseekV3R1_inference_system_overview.md
[^2]: "gpt-oss 120B: B200 vs H100, Performance per Dollar," InferenceX, SemiAnalysis, 2026. https://inferencex.semianalysis.com/compare-per-dollar/gptoss-120b-b200-vs-h100
[^3]: "Are OpenAI and Anthropic Really Losing Money on Inference?", Martin Alderson, 2025-08-27. https://martinalderson.com/posts/are-openai-and-anthropic-really-losing-money-on-inference/
[^4]: "Inference economics of language models," Epoch AI, 2025-06, set against the rental index in "The Great GPU Shortage: Rental Capacity," SemiAnalysis, 2026. https://epoch.ai/publications/inference-economics-of-language-models
[^5]: "API pricing," OpenAI, 2026-07. https://developers.openai.com/api/docs/pricing
[^6]: "Pricing," Anthropic, 2026-07. https://platform.claude.com/docs/en/about-claude/pricing
[^7]: "AI Value Capture: The Shift To Model Labs," SemiAnalysis, 2026-05-01, with Alderson (2025) and the DeepSeek log (2025). https://newsletter.semianalysis.com/p/ai-value-capture-the-shift-to-model
[^8]: "AI Value Capture: The Shift To Model Labs," SemiAnalysis, 2026-05-01. https://newsletter.semianalysis.com/p/ai-value-capture-the-shift-to-model
[^9]: "OpenAI and Anthropic Miss Gross Margin Targets as Inference Costs Skyrocket," BigGo Finance, 2026, citing The Information. https://finance.biggo.com/news/mRiPlZwBTwP6zY3HRxp-
[^10]: "Here's How Much OpenAI Spends On Inference and Its Revenue Share With Microsoft," Where's Your Ed At, 2025. https://www.wheresyoured.at/oai_docs/
[^11]: "Token Economics Across Traffic Profiles on Dedicated GPUs," DigitalOcean, 2025, with the DeepSeek log (2025). https://www.digitalocean.com/community/tutorials/llm-inference-cost
[^12]: "Welcome to LLMflation," a16z, 2024-11. https://a16z.com/llmflation-llm-inference-cost/
[^13]: "LLM inference prices have fallen rapidly but unequally across tasks," Epoch AI, 2025-03. https://epoch.ai/data-insights/llm-inference-price-trends
[^14]: "AI Price Index," TokenCost, 2026. https://tokencost.app/blog/ai-price-index
[^15]: "OpenAI announces 80% price drop for o3," VentureBeat, 2025-06. https://venturebeat.com/ai/openai-announces-80-price-drop-for-o3-its-most-powerful-reasoning-model
[^16]: "Pricing," Anthropic, 2026-07. https://platform.claude.com/docs/en/about-claude/pricing
[^17]: "API pricing," OpenAI, 2026-07, and "GPT-5.5 Price Increase," OpenRouter, 2026-04. https://developers.openai.com/api/docs/pricing
[^18]: "The Great GPU Shortage: Rental Capacity," SemiAnalysis, 2026. https://newsletter.semianalysis.com/p/the-great-gpu-shortage-rental-capacity
[^19]: "GPT-5.5 Price Increase: What It Actually Costs," OpenRouter, 2026-04. https://openrouter.ai/blog/insights/gpt55-cost-analysis/
[^20]: "Pricing," Anthropic, 2026-07 (tokenizer note). https://platform.claude.com/docs/en/about-claude/pricing
[^21]: "gpt-oss-120b providers," Artificial Analysis, 2026. https://artificialanalysis.ai/models/gpt-oss-120b/providers
[^22]: "DeepSeek's new V3.2-Exp model cuts API pricing in half," VentureBeat, 2025-09. https://venturebeat.com/ai/deepseeks-new-v3-2-exp-model-cuts-api-pricing-in-half
[^23]: "Kimi K3: API Pricing & Benchmarks," OpenRouter, 2026-07. https://openrouter.ai/moonshotai/kimi-k3
