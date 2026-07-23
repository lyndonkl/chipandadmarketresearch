---
title: The Thesis
project: p1-ai-economics
chapter: 1
claims_used: [fx-06, fx-13, rv-03, mc-08, mc-09, ce-05, cd-04, cd-01, cd-02, cx-11, px-04, px-05, px-08]
readability: "PASS fk_grade=4.58 reading_ease=80.94 gunning_fog=6.43 smog=7.51"
status: draft-for-review
---

# The Thesis

On July 20, 2026, Ben Thompson published an essay called "Who's Afraid of Chinese Models?"[^1] His answer was that the fear points at the wrong thing. The story is not which lab has the best model. The story is what a model costs to run.

His opening line: "Marginal costs are back in a big way."

This series tests that claim. This chapter lays out his argument as six numbered claims. Each one can be checked against numbers. Each one can fail. The chapters that follow do the checking.

## Two kinds of cost

The whole argument turns on two terms. Both are simple.

A **fixed cost** is money you spend before you sell a thing. It does not move with sales.

A **marginal cost** is what one more sale costs you. Sell twice as much and you pay it twice.

Picture a bakery. The oven is a fixed cost. You buy it once. It costs the same whether you sell one loaf or a thousand. Flour, yeast and power are marginal costs. Every loaf eats a share.

Software has been odd for decades because its marginal cost is near zero. Writing the code is the oven. Sending a copy to one more user costs almost nothing. That is why software firms can charge a lot and keep most of it.

Thompson says AI breaks that pattern. Training a model is the oven, and a costly one. But answering a question is not a free copy. It burns power on a chip that someone had to buy. The trade calls this step **inference**: running a trained model to get an answer. Inference is flour, not code.

If he is right, the rules that made software rich do not hold here.

## Six claims

**T1. Training is a fixed cost. Serving is a real marginal cost.**
Up-front costs are large and do not track sales. The training run behind xAI's Grok 4 is put at about $490 million, and the range is wide: $220 million to $900 million[^2]. Anthropic is thought to have spent about $4.1 billion on research and training compute in 2025[^3]. Serving behaves the other way. It climbs with use. Leaked 2025 accounts put OpenAI's gross margin near 43%, and our range there runs from 33% to 47%[^4]. Gross margin is the share of sales left after the direct cost of delivery. A classic software firm keeps far more.
*Break it:* show serving costs that stay flat while sales triple.

**T2. US prices sit well above US serving cost.**
Thompson argues that demand for top-tier answers runs ahead of supply, and that it lands on two firms. Scarcity lets them charge more than the work costs. He calls the gap a price umbrella. Our best guess is that serving a token costs about 15% of the US list price. We would not be shocked by 6%, and we would not be shocked by 48%[^5]. One estimate puts Anthropic's margin on serving hardware near 72%[^6]. Rate caps and waiting lists point the same way.
*Break it:* find labs selling near cost, or find no sign of rationing.

**T3. Chinese prices are low because hosting is a crowded trade.**
Open-weight models are models whose files anyone can download and run. Many firms can then host the same model, and where sellers are many, price drifts toward cost. Thompson doubts that Chinese serving is truly cheaper. Two facts help him. DeepSeek once posted a day of its own serving numbers. Had every token been billed at list, profit would have been 545% of the chip bill[^7]. The firm noted that real revenue was much lower, since much of its use was free. Still, that is not the mark of a firm selling below cost. And in July 2026 Moonshot launched Kimi K3 before it released the weights, at $15 per million output tokens[^8]. Anthropic charges the same rate for Claude Sonnet 4.6.
*Break it:* show a real Chinese cost edge in power, chips or hardware.

**T4. Chinese labs push the fixed cost somewhere else.**
DeepSeek reported a final training run of $5.6 million[^9]. The number is real but narrow. The paper says plainly that it leaves out earlier research and failed runs. The chip fleet behind it has been put at about $1.4 billion, though that one is a guess from the outside and could sit anywhere from $600 million to $2.6 billion. It was paid for by the founder's hedge fund[^10]. More money comes from cloud sales and from the state. A low price is not proof of a cheap model. It can mean that someone else paid for the oven.
*Break it:* show a Chinese lab earning its training bill back from token sales.

**T5. When supply catches up, US prices fall toward cost.**
This is the forecast, and it has not happened yet. Microsoft, Amazon, Alphabet and Meta plan about $717 billion of capital spending in 2026, and we put the range at $655 billion to $790 billion[^11]. Yet OpenAI's top-tier input price went the other way inside a year, from $1.25 to $5.00 per million tokens[^12].
*Break it:* prices that fall before the new supply lands, or supply that lands and moves nothing.

**T6. The token is the wrong unit.**
A token is a chunk of text, a bit under a word. Models spend different numbers of tokens on the same job, so a price per token can mislead. Anthropic's newer models count text in a way that yields about 30% more tokens for the same words[^13]. The posted rate held. The bill rose. When OpenAI doubled its per-token price in April 2026, the measured cost of a like-for-like request rose about 64%, not 100%, because the new model wrote less[^14]. Thompson's point is that the product is intelligence. Cost per finished job is the honest yardstick.
*Break it:* show that cheap models stay cheap when scored per job, not per token.

## What we test, and what we do not

We are not grading Thompson. We are testing six claims, each of which can be right or wrong on its own.

Note the shape of the set. T1 through T4 are about the world as it is. They can be settled with filings, leaks and posted prices. T5 and T6 are about what comes next, and they cannot be settled that way. There we can only state odds and show our work.

Thompson flags his own gaps. He does not know whether cheaper answers pull in enough new demand. He does not know how labs will carry the fixed cost once prices converge. He does not know when supply catches up. Those gaps are the interesting part.

The chapters that follow take the claims in turn: what a model costs to build, what a token costs to serve, what prices have done since 2022, how big the building wave is, and whether it pays back.

[^1]: "Who's Afraid of Chinese Models?" — Ben Thompson, Stratechery, July 20, 2026. https://stratechery.com/2026/whos-afraid-of-chinese-models/
[^2]: "What did it take to train Grok 4?" — Epoch AI. https://epoch.ai/data-insights/grok-4-training-resources
[^3]: "Compute accounts for the majority of expenses of AI companies" — Epoch AI. https://epoch.ai/data-insights/company-spending-breakdown
[^4]: "OpenAI's financials have leaked" — Fortune, June 16, 2026. https://fortune.com/2026/06/16/openai-financials-leaked-losses-revenue-profit/
[^5]: "Are OpenAI and Anthropic Really Losing Money on Inference?" — Martin Alderson. https://martinalderson.com/posts/are-openai-and-anthropic-really-losing-money-on-inference/
[^6]: "AI Value Capture: The Shift To Model Labs" — SemiAnalysis, May 1, 2026. https://newsletter.semianalysis.com/p/ai-value-capture-the-shift-to-model
[^7]: "DeepSeek-V3/R1 Inference System Overview" — DeepSeek, open-infra-index on GitHub. https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/day_6_one_more_thing_deepseekV3R1_inference_system_overview.md
[^8]: "Kimi K3 API pricing" — OpenRouter. https://openrouter.ai/moonshotai/kimi-k3
[^9]: "DeepSeek-V3 Technical Report" — arXiv 2412.19437. https://arxiv.org/pdf/2412.19437
[^10]: "DeepSeek Debates" — SemiAnalysis, January 31, 2025. https://newsletter.semianalysis.com/p/deepseek-debates
[^11]: "Big Tech's AI capex in 2026" — Value Add VC. https://valueaddvc.com/blog/big-tech-ai-capex-in-2025-microsoft-google-meta-amazon-and-the-spending-race
[^12]: "API pricing" — OpenAI. https://developers.openai.com/api/docs/pricing
[^13]: "Pricing" — Anthropic. https://platform.claude.com/docs/en/about-claude/pricing
[^14]: "GPT-5.5 Price Increase: What It Actually Costs" — OpenRouter, April 2026. https://openrouter.ai/blog/insights/gpt55-cost-analysis/
