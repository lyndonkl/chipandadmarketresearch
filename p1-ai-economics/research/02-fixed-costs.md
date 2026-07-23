---
title: What a Frontier Model Costs to Build
project: p1-ai-economics
chapter: 2
claims_used: [fx-01, fx-02, fx-03, fx-04, fx-05, fx-06, fx-07, fx-08, fx-09, fx-10, fx-11, fx-12, fx-13, fx-14, fx-15, fx-16, fx-17, fx-18]
readability: "PASS fk_grade=6.43 reading_ease=74.89 gunning_fog=8.08 smog=8.32"
status: draft-for-review
---

# What a Frontier Model Costs to Build

A frontier model is one of the handful of AI models at the leading edge. Think of the ones you have heard of: GPT-5, Claude, Gemini, Grok. Building one costs a lot of money before it earns a cent.

That cost is fixed. It does not rise when a million new users sign up. It does not go away when nobody does. The lab pays it either way, then hopes to earn it back later.

So how big is it? The honest answer comes in three parts. The number labs quote is real, but it is the smallest true number they have. The number that matters is far larger. The gap between the two explains most of the noise in this debate.

## The number everyone quotes

When a lab names a training cost, it almost always means the final run. That is the last big job on the cluster, the one that made the model they shipped. It is a clean line item. It also leaves out nearly everything else.

Take GPT-4, trained in 2022. Our best estimate for that final run is about $58 million of compute. Anything from $25 million to $150 million would not surprise us.[^1] The range is wide for a reason. OpenAI never published a figure. Every public estimate leans on leaked details about the chips, plus a guess at the hourly price of those chips.

Now watch what happens next. Epoch AI, a research group that tracks these costs, finds that the biggest runs have grown about 2.5 times a year since 2016. Their range is 2 times to 3.1 times.[^2] At that pace the cost of a run rises roughly sixfold every two years.

You can see the rungs of that ladder. Google's Gemini 1.0 Ultra, trained in 2023, is put at $191 million if you price the chips at rental rates. We would take $90 million to $400 million as the range, partly because Google builds its own chips and pays itself for them.[^3]

By 2025 the top of the market looked like this. Epoch puts the final run for xAI's Grok 4 at about 246 million hours of H100 chips. The H100 is the Nvidia chip most labs train on. Epoch's median cost estimate is $490 million, and it warns that the inputs come from vague public remarks. Our range is $220 million to $900 million.[^4]

That chip-hour figure is hard to picture, so convert it. One H100, running alone and never stopping, would take about 28,000 years to do that much work.

Sit with that. In under three years the headline number went from tens of millions to something near half a billion dollars. And the headline number is the part they can count most cleanly.

## The number that matters

The final run is not what a lab spends. Most of the compute at a frontier lab never makes a shipped model at all. It goes into research, small test runs, and big runs that get shelved.

Two windows have opened on this. Reported investor documents put OpenAI's 2024 spend on research and training compute at about $4.5 billion. We would not argue with $3.3 billion to $7 billion.[^5] For Anthropic in 2025, the same kind of reporting gives $4.1 billion for research and training compute, against $2.7 billion for the compute used to serve customers. Another $2.9 billion or so covered staff and everything else.[^6]

Treat both as good reporting, not as audited fact. Neither firm files public accounts. Still, the shape is clear, and it is the same shape at both labs. Building the models cost more than serving all the paying customers did.

That is the sentence to hold on to. The famous run for a single model is a rounding error next to the yearly bill for the whole effort.

## Where the money goes

Epoch has also broken down what a build costs. Chips and servers take the biggest share, somewhere between about a half and two thirds. Research staff, counting their equity, take about 38 percent, and we would not be shocked by anything from 26 to 52 percent. Power is small, a few percent at most.[^1]

People are not a footnote here. OpenAI had roughly 7,900 staff in early 2026, up from about 2,200 three years before; call it 6,000 to 9,500.[^7] Stock grants alone ran near $6 billion a year on reported figures, and could plausibly be $3.5 billion to $9 billion.[^8] Payroll at that scale is a fixed cost too. It tracks the race for talent, not the number of users.

Data is the third leg, and the smallest. Licensed text is real money but not huge money. The largest publisher deal we can see is News Corp and OpenAI, at $250 million over five years, or about $50 million a year.[^9] Paying humans to write and grade answers costs more. Vendor sales suggest each top lab spends on the order of $1 billion a year on that work. That one is a rough estimate, built from what the sellers earn rather than what the labs report.[^10]

One more thing to note before we cross the Pacific. Not every lab plans to earn this money back by selling answers. Meta trained Llama 3.1 405B and then gave the weights away. The weights are the trained numbers that make a model work, so anyone with chips can now run it. Meta did disclose the raw input: 30.84 million H100-hours. Turn that into dollars and you get about $110 million, in a fair range of $50 million to $220 million. It depends on what an hour of chip time truly cost them.[^11] A fixed cost you never mean to charge for is still a fixed cost. Someone eats it.

## The cheap models, read correctly

Here is where the Chinese numbers come in, and where they get misread.

DeepSeek published a real figure for its V3 model: $5.576 million. That is 2.788 million chip-hours at an assumed $2 an hour.[^12] The report says plainly that it excludes earlier research and test runs. A later step, the reasoning training that made R1, was reported at $294,000.[^13] Moonshot's Kimi K2 was reported at $4.6 million by CNBC, sourced to one person familiar with it. That figure is contested. The company's CEO would not confirm it, and said the true cost is hard to pin down because so much of it is research.[^14]

Set those against the base underneath them. SemiAnalysis estimates that DeepSeek's parent, a hedge fund, has spent on the order of $1.5 billion on AI servers. That estimate is soft; $0.6 billion to $2.8 billion covers our doubt.[^15] The $5.576 million run happened on top of all that.

Now the fair comparison. Anthropic's CEO said Claude 3.5 Sonnet, a mid-sized model, cost "a few $10M's" to train. Call it about $32 million, with $15 million to $90 million around it.[^16] Same kind of line item, same order of size. The famous gap between Chinese and American training costs is mostly a gap in what gets counted.

## Costs do not only rise

One more twist. The flagship run does not always get more costly. Epoch reads GPT-5 as having used less training compute than GPT-4.5, because the gains had moved to the tuning that happens after the main run. Our rough estimate of its run cost is $90 million, with a fat range of $35 million to $300 million. That one is a back-of-envelope figure, not a measured one.[^17]

So the line item can fall while the total bill keeps rising. The fixed cost has been moving out of the single famous run and into the quiet runs nobody sees.

## Why this matters

Here is where it leaves us. A frontier lab now carries a fixed cost of several billion dollars a year before it serves a single customer. That money goes on chips, on people, and on runs the public will never see. It has to come back out of the margin on every answer the model gives.

Which raises the question the next chapter takes up. What does one answer cost to serve?

[^1]: Epoch AI, "How much does it cost to train frontier AI models?", https://epoch.ai/blog/how-much-does-it-cost-to-train-frontier-ai-models
[^2]: Epoch AI, "The rising costs of training frontier AI models," arXiv, https://arxiv.org/abs/2405.21015
[^3]: Statista, "The Extreme Cost of Training AI Models," https://www.statista.com/chart/33114/estimated-cost-of-training-selected-ai-models/; Visual Capitalist, "Training Costs of AI Models Over Time," https://www.visualcapitalist.com/training-costs-of-ai-models-over-time/
[^4]: Epoch AI, "What did it take to train Grok 4?", https://epoch.ai/data-insights/grok-4-training-resources
[^5]: Epoch AI, "Most of OpenAI's 2024 compute went to experiments," https://epoch.ai/data-insights/openai-compute-spend
[^6]: Epoch AI, "Compute accounts for the majority of expenses of AI companies," https://epoch.ai/data-insights/company-spending-breakdown
[^7]: Revelio Labs, "OpenAI employee count 2026," https://www.reveliolabs.com/companies/openai-opco/employees/
[^8]: Sherwood News, "OpenAI is in the business of making OpenAI employees rich," https://sherwood.news/tech/openai-stock-compensation-making-employees-rich/
[^9]: Quartz, "The price of AI training data, from $5M to $250M," https://qz.com/ai-training-data-pricing-licensing-deals-market-052126
[^10]: Sacra, "Surge AI revenue, funding & news," https://sacra.com/c/surge-ai/
[^11]: Visual Capitalist, "The Surging Cost of Training AI Models," https://www.visualcapitalist.com/the-surging-cost-of-training-ai-models/; Meta, Llama 3.1 model card (30.84 million H100-hours), https://huggingface.co/posts/m-ric/853337605317831
[^12]: DeepSeek, "DeepSeek-V3 Technical Report," arXiv, https://arxiv.org/html/2412.19437v1
[^13]: Investing.com, "DeepSeek says R1 model training cost only $294,000," https://www.investing.com/news/company-news/deepseek-says-r1-model-training-cost-only-294000-4244891
[^14]: CNBC, "Alibaba-backed Moonshot releases new AI model Kimi K2 Thinking," https://www.cnbc.com/2025/11/06/alibaba-backed-moonshot-releases-new-ai-model-kimi-k2-thinking.html; Yicai Global, "Kimi K2 Thinking's reported $4.6 million training cost isn't official, Moonshot CEO says," https://www.yicaiglobal.com/news/kimi-k2-thinkings-reported-usd46-million-training-cost-isnt-official-moonshot-ceo-says
[^15]: SemiAnalysis, "DeepSeek Debates," https://newsletter.semianalysis.com/p/deepseek-debates
[^16]: Dario Amodei, "On DeepSeek and Export Controls," https://darioamodei.com/post/on-deepseek-and-export-controls
[^17]: Epoch AI, "Why GPT-5 used less training compute than GPT-4.5," https://epoch.ai/gradient-updates/why-gpt5-used-less-training-compute-than-gpt45-but-gpt6-probably-wont
