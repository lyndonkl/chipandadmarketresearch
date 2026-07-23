---
title: "China: Who Eats the Fixed Costs"
project: p1-ai-economics
chapter: 6
claims_used: [cd-01, cd-02, cd-04, cd-05, cd-06, cd-07, cd-08, cd-09, cd-10, cd-12, cd-14, cd-16, cd-17, ce-01, ce-02, ce-05, ce-06, ce-08, ce-09, ce-10, ce-11, ce-12, ce-13, ce-14, ce-15, ce-17]
readability: "PASS fk_grade=5.71 reading_ease=73.08 gunning_fog=7.1 smog=8.09"
status: draft-for-review
---

# China: Who Eats the Fixed Costs

Chinese models are cheap to use. DeepSeek's fast model lists at $0.28 per million output tokens.[^1] On matched quality, our best estimate is that US list prices run about ten times the Chinese ones. We would not be surprised by anything from four times to forty times.[^2] The range is wide because matched quality is a judgment call.

The easy reading is that China found a cheaper way to run chips. The evidence says otherwise. The cheap price is real. The cheap cost is not.

## Two costs, not one

Training a model is a fixed cost. You pay it once, up front, before anyone shows up. Serving the model is a running cost. Every answer burns chip time. That second cost is the marginal cost: what one more answer adds to the bill.

Chinese prices sit close to that serving cost. So somebody else has to pay for the training. The question is who.

## The bill still gets paid

DeepSeek is the clearest case. Its own paper put the final training run at $5.6 million.[^3] The figure is honest but narrow. The paper says it leaves out earlier research and failed tests. It also leaves out the machines. Our best estimate of the server spending behind that fleet is about $1.4 billion. We would not be surprised by anything from $0.6 billion to $2.6 billion.[^4]

For years a quant hedge fund paid those bills. High-Flyer, which built DeepSeek, ran about RMB 70 billion in client money.[^5] Then in June 2026 DeepSeek raised about $7.4 billion, most of it from its own founder.[^6] Sales stay small next to that. Our best estimate of yearly revenue is about $450 million, and we would not be surprised by anything from $250 million to $750 million.[^7] Token sales are not paying for the fleet.

Alibaba pays for Qwen out of a different pocket. It committed at least RMB 380 billion, near $53 billion, over three years for cloud and AI hardware.[^8] Then it gives the model weights away. Qwen passed 700 million downloads by January 2026.[^9] The models are free. The cloud is metered. Alibaba has guided AI revenue above RMB 30 billion by the end of 2026.[^10] Free weights are the bait. Rented compute is the meal.

The smaller labs run on stock markets and the state. Zhipu lost RMB 4.7 billion in 2025 on revenue of RMB 724 million.[^11] It listed in Hong Kong that January and raised about $560 million.[^12] MiniMax lost $465 million in 2024 on revenue of $30.5 million.[^13] Moonshot raised $2 billion at a $20 billion value in May 2026.[^14] Shanghai handed out RMB 600 million in compute vouchers.[^15] A national AI fund holds RMB 60 billion.[^16] None of that money comes from tokens.

## The price war was strategy

Prices fell hard before costs did. In May 2024 ByteDance priced its Doubao Pro model at about $0.11 per million input tokens.[^17] Alibaba cut one Qwen model by 97 percent within days. Baidu and Tencent made small models free.[^18] Nobody's costs fell 97 percent in a week. They were buying users.

Later cuts look different. In September 2025 DeepSeek shipped a leaner attention design and cut prices by more than half.[^19] That cut tracked a real drop in cost.

DeepSeek also prices like a power company. It gave up to 75 percent off in quiet hours, and later charged extra during Beijing office hours.[^20] You charge by the hour when your machines are full. China has its own shortage.

## Why pricing at cost is rational

Here is the part that gets missed. Open weights change who sets the price.

If a lab publishes its weights, anyone with chips can serve that model. Buyers can switch hosts in an afternoon. The cheapest host sets the price, and the cheapest host prices near its own running cost. The lab that trained the model cannot charge much more than its own copies cost.

There is a clean test. Moonshot launched Kimi K3 on July 16, 2026, and held the weights back for a few days. While it was the only host, it charged $15 per million output tokens. That is the same price as Claude Sonnet 4.6.[^21] Same country, same week, no China discount. The low prices come from open weights, not from geography.

So pricing at cost is not charity, and it is not dumping. It is the only price on offer once the weights are out. The training bill then has to be paid somewhere else.

## The gap is mostly American scarcity

DeepSeek published a rare number in March 2025. Over one day of serving, it reported a cost to profit ratio of 545 percent.[^22] The company was clear that real revenue was much lower, since most use was free and prices varied. Even so, the point stands. When the machines were busy, even cheap Chinese prices sat far above the rental cost of the chips.

That breaks the simple story. A deep structural cost edge would not look like that. Most of the price gap measures something else. US buyers are bidding for scarce capacity, and the winner of that bidding gets to keep a premium.

## Chips are the binding constraint

None of this happens in a world of easy hardware. US export rules cut Chinese labs off from the best Nvidia parts. Nvidia took a $4.5 billion charge in 2025 on China chips it could no longer sell.[^23] Huawei is the fallback. Its plan for 2026 was roughly 800,000 of its 910C chips, though estimates run from about 250,000 to 1.5 million.[^24] Reports say DeepSeek tried to train on Huawei parts, ran into trouble, and went back to Nvidia for training.[^25]

Scarcity shapes behavior. If you cannot win by buying more chips, you win by needing fewer. That pushes Chinese labs toward lean models, fewer tokens per task, and open weights as a way to reach users.

There is one more way to shift a training bill. OpenAI has said it saw usage patterns that looked like DeepSeek learning from its models. DeepSeek denies it, and no court has ruled on it.[^26] If the charge is true, part of the fixed cost was simply moved onto someone else's balance sheet.

## The answer

So who eats the fixed costs? Hedge fund profits. A founder's own money. A cloud giant's capital budget. Buyers of new shares. City and national funds. Everyone except the person buying tokens.

That is why a Chinese price tells you about serving cost and almost nothing about training cost. It also means the gap should close from the American side, as US capacity catches up with US demand. The Chinese labs will still face the harder question. Who keeps eating the fixed costs, and for how long?

[^1]: DeepSeek API Docs, Models and Pricing, DeepSeek. https://api-docs.deepseek.com/quick_start/pricing
[^2]: Own triangulation across matched model pairs, from Claude Sonnet 4.6 vs Kimi K2.5, PricePerToken, and DeepSeek API Pricing, PricePerToken. https://pricepertoken.com/compare/anthropic-claude-sonnet-4.6-vs-moonshotai-kimi-k2.5
[^3]: DeepSeek-V3 Technical Report, arXiv 2412.19437. https://arxiv.org/pdf/2412.19437
[^4]: DeepSeek Debates, SemiAnalysis. https://newsletter.semianalysis.com/p/deepseek-debates
[^5]: High-Flyer posts 57% gain as China's quant hedge funds outperform, Hedgeweek. https://www.hedgeweek.com/high-flyer-posts-57-gain-as-chinas-quant-hedge-funds-outperform/
[^6]: How DeepSeek's landmark funding secures Liang Wenfeng's grip, SCMP. https://www.scmp.com/tech/big-tech/article/3357525/how-deepseeks-landmark-funding-secures-liang-wenfengs-grip-chinas-ai-rivalry-heats
[^7]: DeepSeek Revenue Nears $500 Million as Chinese AI Startup Eyes IPO, PYMNTS. https://www.pymnts.com/news/artificial-intelligence/2026/deepseek-revenue-nears-500-million-as-chinese-ai-startup-eyes-ipo/
[^8]: Alibaba to Invest RMB380 billion in AI and Cloud Infrastructure Over Next Three Years, Alibaba Group. https://www.alibabagroup.com/en-US/document-1830678592242057216
[^9]: Alibaba's Qwen leads global open-source AI community with 700 million downloads, Xinhua. https://english.news.cn/20260113/004b0522f987475cbf83ffc3a8d009aa/c.html
[^10]: Alibaba's AI spending to exceed goals and says margin is secondary, Reuters via Manila Times. https://www.manilatimes.net/2026/05/15/business/foreign-business/alibabas-ai-spending-to-exceed-goals-and-says-margin-is-secondary/2344163
[^11]: Zhipu AI revenue jumps 132% in first post-IPO report, SCMP. https://www.scmp.com/tech/tech-trends/article/3348555/zhipu-ai-revenue-jumps-132-first-post-ipo-report-missing-estimates
[^12]: China's Zhipu AI launches US$560 million share sale, SCMP. https://www.scmp.com/business/investor-relations/ipo-quote-profile/article/3338107/chinas-zhipu-ai-launches-us560-million-share-sale-hong-kongs-ipo-tech-race-heats
[^13]: MiniMax doubles in Hong Kong debut, CNBC. https://www.cnbc.com/2026/01/09/minimax-hong-kong-ipo-ai-tigers-zhipu.html
[^14]: China's Moonshot AI raises $2B at $20B valuation, TechCrunch. https://techcrunch.com/2026/05/07/chinas-moonshot-ai-raises-2b-at-20b-valuation-as-demand-for-open-source-ai-skyrockets/
[^15]: China subsidizes AI computing for small domestic companies, Tom's Hardware. https://www.tomshardware.com/tech-industry/artificial-intelligence/china-subsidizes-ai-computing-for-small-domestic-companies-computing-power-vouchers-spread-across-multiple-chinese-cities
[^16]: China creates US$8.2 billion AI investment fund, SCMP. https://www.scmp.com/tech/big-tech/article/3295513/tech-war-china-creates-us82-billion-ai-investment-fund-amid-tightened-us-trade-controls
[^17]: ByteDance surprises AI rivals with ultra-low cost Doubao model, TechNode. https://technode.com/2024/05/16/bytedance-surprises-ai-rivals-with-ultra-low-cost-doubao-model/
[^18]: LLM prices hit rock bottom in China as Alibaba Cloud enters the fray, KrASIA. https://kr-asia.com/llm-prices-hit-rock-bottom-in-china-as-alibaba-cloud-enters-the-fray
[^19]: DeepSeek's new V3.2-Exp model cuts API pricing in half, VentureBeat. https://venturebeat.com/ai/deepseeks-new-v3-2-exp-model-cuts-api-pricing-in-half
[^20]: DeepSeek Slashes Off-Peak Prices to Balance Out AI Demand, Bloomberg, and DeepSeek to launch V4 with new peak-time API pricing, TechNode. https://www.bloomberg.com/news/articles/2025-02-26/deepseek-slashes-off-peak-prices-to-balance-out-ai-demand
[^21]: Kimi K3, API Pricing and Benchmarks, OpenRouter. https://openrouter.ai/moonshotai/kimi-k3
[^22]: DeepSeek claims theoretical profit margins of 545%, TechCrunch. https://techcrunch.com/2025/03/01/deepseek-claims-theoretical-profit-margins-of-545/
[^23]: Nvidia says it will record a charge tied to H20 processors exported to China, CNBC, and Form 8-K, Nvidia. https://www.sec.gov/Archives/edgar/data/1045810/000104581025000207/q2fy26pr.htm
[^24]: Huawei to double output of Ascend AI chips, Reuters via RCR Wireless, and Huawei Ascend Production Ramp, SemiAnalysis. https://newsletter.semianalysis.com/p/huawei-ascend-production-ramp
[^25]: DeepSeek reportedly urged by Chinese authorities to train on Huawei hardware, Tom's Hardware. https://www.tomshardware.com/tech-industry/artificial-intelligence/deepseek-reportedly-urged-by-chinese-authorities-to-train-new-model-on-huawei-hardware-after-multiple-failures-r2-training-to-switch-back-to-nvidia-hardware-while-ascend-gpus-handle-inference
[^26]: Is DeepSeek's AI distillation theft? OpenAI seeks answers, SCMP. https://www.scmp.com/tech/big-tech/article/3296827/deepseeks-ai-distillation-theft-openai-seeks-answers-over-chinas-breakthrough
