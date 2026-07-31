---
title: The Auction (2002-2008)
project: p2-ad-market
chapter: 7
claim_ids: [e2-scale-004, e5-events-003, e5-pricing-004, e5-pricing-005, e5-scale-004, e6-pricing-001, e6-pricing-002, e6-pricing-003, e6-pricing-004, e6-pricing-005, e6-pricing-006, e6-pricing-007, e6-pricing-008, e6-events-001, e6-events-002, e6-events-003, e6-events-004, e6-events-005, e6-events-006, e6-events-007, e6-events-008, e6-events-009, e6-events-010, e6-sellers-001, e6-sellers-002, e6-sellers-003, e6-sellers-004, e6-sellers-005, e6-sellers-006, e6-buyers-001, e6-buyers-002, e6-buyers-003, e6-buyers-004, e6-buyers-005, e6-buyers-006, e6-buyers-007, e6-buyers-008, e6-creators-001, e6-creators-002, e6-creators-003, e6-creators-004, e6-medium-001, e6-medium-002, e6-medium-003, e6-medium-004, e6-medium-005, e6-medium-006, e6-scale-001, e6-scale-002, e6-scale-003, e6-scale-004, e6-scale-005, e6-scale-007, e6-scale-008, e6-scale-009, e6-scale-010, e6-measurement-001, e6-measurement-002, e6-measurement-003, e6-measurement-004, e6-measurement-006, e6-targeting-001, e6-targeting-002, e6-targeting-003, e6-targeting-004, e6-targeting-005, e6-unit_econ-001, e6-unit_econ-002, e6-unit_econ-003, mech-adwords-001, mech-discounter-001, mech-quality_score-001, mech-audit-001, mech-overture-001, mech-overture-002, mech-panama-001, mech-ovt-001, mech-ovt-002, mech-ovt-003, mech-ovt-004, mech-aol-001, mech-aol-002, mech-aol-003, mech-aol-004, mech-aol-005, mech-aol-006, mech-aol-007, mech-tac-001, mech-tac-002, mech-tac-003, mech-tac-004, mech-network-001, mech-network-002, mech-network-003, mech-google_rev-001, mech-classified-001, mech-capture-001, mech-capture-002, mech-capture-003, mech-first_price-001, mech-rgsp-001, mech-default-001, mech-default-004, mech-mehta-002, mech-mehta-004, mech-mehta-005]
readability: "PASS fk_grade=6.63 reading_ease=71.7 gunning_fog=8.97 smog=9.39"
status: draft-for-review
---

# The Auction (2002-2008)

On 20 February 2002 Google changed how it sold search ads. The new rule ranked each ad by two things at once. One was the price the advertiser offered for a click. The other was how often that ad got clicked. And the winner did not pay its own offer. It paid one cent more than it needed to hold its place.

The usual story of the next six years has one engine in it. Google built a better auction, so Google won. The record shows two engines instead, and they did different jobs.

The auction was the yield engine. It set what one search was worth.

Distribution was the volume engine. It bought the searches.

This chapter runs them in that order, because the first paid for the second.

**How to read the numbers here.** Every figure comes from a checked claim. Grade A means a company filing or an official record. Grade B means credible reporting. Grade C means our own estimate, with the method written down. Where a number is soft, this chapter says so in the sentence.

## First, kill a legend

AdWords did not start as an auction. It launched in October 2000 as a fixed-price product sold by the impression. An impression is one showing of an ad. The top slot cost $15 per thousand impressions, the middle $12, the bottom $10. Nobody bid on anything.

The bidding idea was not Google's either. GoTo, later renamed Overture, had been running a keyword auction since 1998. Its rule was simple: rank by bid, highest first. In its own words, "the search results appear on the page ranked in descending order of bid price."

2002 did not invent the search auction. It is the moment one firm added a second term to the ranking rule.

## The yield engine: what the new rule did

Google's own filing gives the cleanest example of the pricing side. Three advertisers bid $1.00, $0.60 and $0.50 per click. They pay $0.61, $0.51 and $0.01. The top ad pays a cent more than the bid below it. The last ad pays the floor, which in that example is one cent.

Paying the next bidder's price rather than your own is called second-price pricing. Google called its version the AdWords Discounter.

Now the ranking side, which is where the money is. The best way to see it is a small made-up case. The three advertisers below are invented, and so are their numbers. They are here to show the mechanism, not to measure Google's book.

One keyword. One thousand showings. Two ad slots. The top slot gets all its clicks; the second slot gets 40% as many.

| Advertiser | Offers per click | Gets clicked |
|---|---|---|
| Aster Auto Cover | $3.00 | 1% of the time |
| Brindle Brokers | $2.00 | 2% of the time |
| Cedar Cover | $1.00 | 5% of the time |

Rank by bid alone and Aster goes on top. Rank by bid times click rate and the order reverses exactly: Cedar, then Brindle, then Aster. Aster bids three times what Cedar bids. Cedar is clicked five times as often. When the click gap beats the bid gap, bid-only ranking puts the lower-earning ad on top.

Here is what each rule collects per thousand showings. Both rules charge the same generous way, one cent above the next ad, so only the ranking changes.

| | Rank by bid alone | Rank by bid times click rate |
|---|---|---|
| Ad on top | Aster | Cedar |
| Clicks delivered | 18 | 58 |
| Money collected | $28.18 | $52.58 |
| Average price per click | $1.57 | $0.91 |

## The sign everyone gets backwards

Read the last row again. The seller earned 87% more money and charged 42% less per click.

That is the whole result. Weighting by click rate did not let Google charge more. It let Google sell far more clicks at a lower price each. The scarce thing in search is not the click. It is the slot on the page, and each slot is shown once whether anyone clicks or not.

Read the rule as ranking by expected money per showing. Relevance rises with it, because a click is the one event both sides want. That is a happy accident of the design, not its goal.

Every retelling that says quality weighting let Google raise prices has the sign the wrong way round.

## The estimate at the centre belongs to the seller

The whole gain rests on one number: how often an ad will be clicked. Google made that forecast itself.

Keep the case above, but suppose Cedar's true click rate is 1%, not the 5% the seller predicted. Ranking and prices do not change, because the seller sets both from its forecast. The money does. The seller now collects $20.18 per thousand showings, which is 72% of what plain bid ranking would have earned.

The break-even point is a true click rate of 1.99%. The forecast can overstate the truth by up to about 2.5 times before the clever rule earns less than the crude one.

Nobody outside could check that forecast. The industry never agreed a standard for counting a search click during the whole era. Its click measurement group only formed in late 2005 and did not publish guidelines until 2009. No accredited outside body certified search click counting in period.

The seller predicted the click, ran the auction, decided which clicks were real, and billed against its own log.

The dispute that followed was about fake clicks. Lane's Gifts sued; in March 2006 Google settled for up to $90 million, mostly in advertising credits. The settlement produced an expert report on Google's invalid-click systems, commissioned through the settlement rather than by an industry auditor. Outside estimators put the share of clicks that were fraudulent in the mid-teens: Click Forensics reported roughly 14% to 17% in 2007 and 2008. Google said its own figure was far lower. That claim is grade C and the honest range is wide, from 3% to 20%. Nobody could settle it, because nobody had standing to count.

Google then supplied the buyer's own instrument. It bought Urchin in April 2005 and launched Google Analytics free on 11 November 2005, signing up roughly 100,000 accounts in the first week. Advertisers measured the seller's product inside the seller's tool.

## The auction is not honest, and its revenue is a band

Second-price auctions have a famous property: telling the truth is your best move. The search auction does not have it, because the seller sells several slots together.

Take a second made-up case, again invented for illustration. Two slots, worth 100 clicks and 80 clicks. Three bidders value a click at $10, $6 and $2.

The $10 bidder bids honestly, wins the top slot, and pays the $6 bid. It earns $400. Now it bids $5 instead. It drops to the second slot and pays the $2 bid. It earns $640. Bidding low earns it $240 more. Google's one-cent step does not change that: the two payoffs are $399 and $639.20.

This matters for the seller, not just the bidder. If everyone bids honestly the seller collects $760. One bidder playing well costs the seller $100, or 13.2%. If every bidder plays that well, the seller collects $440.

The design does not have one revenue figure. It has a band, and here the top is 1.73 times the bottom. Where you land inside it depends on how well the advertisers play, not on the rule.

That is why the era grew a bid-management industry rather than a copywriting one. Firms such as iProspect, Did-It, Performics and Efficient Frontier sold bidding as a service. They were selling movement inside the band.

## The lonely query, where the seller sets the price outright

A second-price auction needs a second bidder. Most distinct searches do not have one.

With one bidder, the price is whatever floor the seller sets. Take one more invented case: a single advertiser, an ad clicked 4% of the time, a bid of $2.00. At the one-cent floor from Google's own example, the seller earns $0.40 per thousand showings. At a $1.00 floor it earns $40. That is a hundredfold change in price with one advertiser, one ad, and nothing at all changed for the user.

From August 2005 that floor stopped being one number. Google gave each keyword its own minimum bid, computed from click rate, ad wording, past results and the page the ad led to. It called that combined measure a Quality Score. The seller computed the floor, per keyword, per advertiser, and never published it as a price.

Hold that fact. The chapter ends on it.

No source behind this record supports the widely repeated five-cent AdWords minimum bid. Google's own filed example shows a one-cent floor.

## What the yield was actually worth

Now leave the invented cases and use the filings.

Money earned per search on Google's own sites rose from roughly 0.47 cents in 2002 to roughly 2.2 cents in 2007. Both figures are grade C, because Google never published a query count. We built the denominator from outside search counts; the honest range on the 2007 figure runs from about 1.6 to 2.8 cents.

Serving one search cost roughly 0.33 cents in 2007: data centres, power, bandwidth and depreciation. That is also grade C, with a range of about 0.2 to 0.55 cents.

Of every dollar a search earned on Google's own page, about 85 cents was left once the cost of serving it came out. Because both inputs are estimates, read that share as somewhere between 78% and 91%. The company's reported gross margin that year was 59.9%, and that one is exact. The gap between those two numbers is the price of distribution, and it is the subject of the next section.

## The volume engine: buying the searches

In May 2002 Google took AOL's US search business from Overture and Inktomi. The reported terms were a revenue guarantee of about $100 million and a revenue share of about 85%.

Those terms are grade B and always will be. The contract was never filed. The figures come from secondary accounts, and the honest range on the guarantee runs from $75 million to $150 million. The filings do show figures consistent with them. Google also sold ads on other firms' pages and handed most of that money straight back to them: in 2002 it paid out 91% of what those ads earned. AOL, then the biggest way Americans got onto the internet, supplied about 63% of it.

Set the guarantee against the balance sheet. At the end of 2001 Google held $33.589 million in cash and short-term investments, on full-year revenue of $86.426 million. The reported guarantee was larger than either.

That is the bet-the-company version of the story, and it is true as a headline. It is not true as an exposure. The guarantee was a floor on the price per delivered search, not a wager on Google's own selling. Google's later filings state the escape clause plainly: if a partner could not deliver searches, the guaranteed payments were not owed.

The floor also stopped costing anything as soon as the revenue share on real traffic rose past it. The accounts date that moment. Google's network payout fell to 84% in 2003, below the reported 85% share, so by then the guarantee was no longer binding.

The instrument that actually cost Google money was equity. In the same month it issued AOL a warrant, which is the right to buy shares at a fixed price. The warrant covered 7,437,452 shares for a total exercise price of $21,642,985, and Google carried it on the books at $13.871 million. AOL exercised in May 2004. Its parent, Time Warner, realised about $1.135 billion from those shares. Set that against the $100 million cash guarantee everyone quotes.

Distribution deals paid in equity look cheap when signed. They cost the most in exactly the world where the buyer wins.

What did the deal buy? AOL alone produced about 15% of all Google revenue in 2002, 16% in 2003, then 12%, 9% and 7% as the rest of the business grew past it. On the day the switch was announced, Overture's shares fell roughly 36% and Inktomi's roughly 24%. One distribution contract was worth a third of the incumbent's stock market value.

The relationship's second act destroyed capital. Google paid $1.0 billion in 2006 for a five percent indirect stake in AOL, wrote off $726 million in late 2008, and sold the stake back for $283 million in 2009. That is a realised loss of about $717 million.

## What syndication cost, and what it was worth

Google also put its ads on other people's pages. That is syndication, sold as AdSense, and it grew fast: AdSense for content launched on 18 June 2003.

The money paid to partners is called traffic acquisition cost. It is the single largest number in this business, and it moved like this. In 2002 Google paid out 91% of its network advertising revenue, then 84% in 2003, 79% in 2004 and 78.7% in 2008. Read the other way, Google's take rate on other people's pages began near 9% and reached only about 21%.

The take rate did not simply climb. It peaked at 24.7% in 2006 and then fell back to 21.5% and 21.3%. The take rate is not a dial the seller sets. It is the outcome of competing for partners, and competition pushed it back down.

As a share of all Google advertising revenue, traffic acquisition cost peaked at 39% in 2004 and fell to 28.1% in 2008, when it was $5,939.0 million.

Now the size of the syndication business, on three different bases. All three are correct and they are not interchangeable.

- Share of total revenue: network sites were 23.7% in 2002, peaked at 48.7% in 2004, and fell to 30.8% in 2008. At the mid-era snapshot of the second quarter of 2006 they were 41%.
- Share of advertising revenue in 2008: $6,714.7 million of $21,128.5 million.
- Share of 2008 advertising revenue after paying partners: 9.4%.

The last one is the honest one for judging profit. Across the whole era the network contributed about $4.71 billion after revenue share, against $59.07 billion of advertising revenue: about 8%.

The two dollars are not the same business. In 2008 Google kept 95.5 cents of every advertising dollar earned on its own sites, and 21.3 cents of every dollar earned on partner sites. That is a gap of about 4.5 times. In 2002 the gap was 11 times.

Syndication bought position, not profit. It also bought something the accounts cannot price: every AOL search Google served was a search Overture did not.

## Overture: what actually lost

The design story says the better auction beat the worse one. The filings say the loser was not the auction.

Overture was the paid-search revenue leader entering the era. It booked $667.7 million in 2002 against Google's $439.5 million of total revenue. Its realised average price per click rose from $0.20 in 2001 to $0.31 in 2002, and it earned $73.1 million of net income, an 11.0% net margin. That is not a failing product.

Three things did fail.

**Concentration.** About 60% of Overture's 2002 revenue came through traffic supplied by Microsoft and Yahoo. Google's exposure to AOL was 15%. Both counterparties later turned. Yahoo bought Overture outright, and Microsoft built its own ad system. The syndication model manufactures the customer who becomes your rival.

**The balance sheet behind the bid.** Overture paid out 58% of its revenue to partners in 2002, up from 56%, and guided that to 63% to 64% for the following quarter, rising further after that. Google was paying out 91% of its network revenue in the same year. That gap is the whole contest, and it is grade A on both sides.

**The budget line.** Here is why Google could pay more, in an invented example with round numbers. Say Google earns $10.00 per thousand searches and Overture earns $6.00, and each spends $1.00 to serve them. Overture can pay at most $5.00 per thousand searches before it loses money. Google can pay $8.50 at an 85% share and still keep $0.50. To match that cheque Overture would have to bid about 142% of its own revenue.

The maximum bid for distribution is your revenue per search minus your serving cost. The firm with the higher revenue per search therefore wins the auction for searches, every time. That is the coupling between the two engines, and it runs one way: the auction sets the size of the cheque.

Overture's own filing records the loss of its US AOL relationship in 2002, alongside Ask Jeeves and Earthlink. Overture had also sued, saying its patent covered the keyword auction, and that claim did get paid. In 2004 Google settled by issuing 2,700,000 shares to Yahoo, by then Overture's owner. Google booked a $201.0 million charge, and the shares were worth about $229.5 million at the $85.00 price Google set when it first sold shares to the public that year. Yahoo did not replace the bid-only ranking until Panama launched on 5 February 2007. That is five years after Google shipped the idea, and more than three years after Yahoo had owned it. By then the distribution war was over.

## Whose money search actually ate

Two facts about the era's totals sit badly with a simple capture story.

The first is the size of search. US internet advertising grew from $6,010 million in 2002 to $23,448 million in 2008. Search reached 45% of that in 2008, about $10.5 billion. But internet advertising was still only about 7.3% of all US advertising in 2007, and Google's entire US revenue was about 3.0% of US advertising spending that year.

The second is the size of the whole pie. US advertising spending was $236.9 billion in 2002 and $279.6 billion in 2007 on the long-running Coen series. That series undercounts internet money badly by the end: it puts 2007 internet advertising at $10,529 million against the industry's own $21,206 million. Correcting only that gap lifts the 2007 total to about $290 billion.

The Coen series also stops with 2007, which makes 2008 a seam in every long-run chart of US advertising.

Against the economy, though, advertising shrank. Its share of GDP hit its post-1960 peak in 2000, at 2.3%, 2.4% or 2.5% depending on which version you read. That is the peak of the recent window only. The all-time high is older and higher: 3.0% of GDP in 1922, a level the market never got back to. From the 2000 mark the share fell right through the AdWords years, from 2.3% in 2002 to 2.0% in 2007. The pie did not grow while search scaled. Money moved between pools.

Which pools? Not the big brand ones.

- Broadcast television was $42.1 billion in 2002 and $44.5 billion in 2007. Cable television rose from $16.3 billion to $26.3 billion.
- Direct mail, the oldest measured-response medium, was the largest single line in the Coen taxonomy: $46.1 billion in 2002 rising to $60.2 billion in 2007. Television counted as one medium was still larger, at $70.8 billion in 2007; the direct-mail-is-biggest result depends on counting broadcast and cable apart.
- Yellow Pages directories, the closest ancestor of paid search, were at or near their all-time high: $13.8 billion in 2002 and $14.3 billion in 2007 on the same series. Trade sources instead put the peak at $14.7 billion in 2005. We keep both, with a range of $13.8 billion to $14.8 billion.
- National advertisers supplied 66.3% of all US ad dollars in 2007, up from 61.4% in 2002. That is $185.3 billion of national money, the biggest pool in the market and the one search barely touched before 2009. National money grew 27.4% across the era while local money grew 3.2%. Local spending was $91.4 billion in 2002 and $94.3 billion in 2007: flat in cash and shrinking in real terms. Inside that local pool sat the two targets search was built to take: $21.0 billion of newspaper retail advertising and $12.1 billion of local Yellow Pages listings in 2007.

One pool did break, and it is the one search was built for. US newspaper classified advertising fell from $15,898 million in 2002 to $14,186 million in 2007 to $9,975 million in 2008. The 2008 fall alone was 29.7%. Help-wanted classified went from $4,388 million in 2002 to $2,186 million in 2008, and from its 2000 peak of $8,713 million to $787 million by 2009: a 91% collapse.

Even here, the timing matters. Real-estate classified peaked in the middle of the era, in 2006, at $5,155 million, then fell with the housing market rather than with search.

Newspapers as a whole make the same point. On the print-plus-online basis they peaked inside the era, at $49,435 million in 2005, before falling to $45,375 million in 2007 and $37,848 million in 2008. Print alone had already peaked in 2000. The "search killed newspapers" line has both the timing and the mechanism loose.

The pool that search was really competing in was response money: direct mail, directories, newspaper classified and the performance-priced part of internet advertising. We put that at roughly $99 billion in 2007, about 34% of all US advertising. That is grade C, built by adding four series together, and the honest range runs from $88 billion to $112 billion.

The buyers confirm the shape. In 2008, 57% of US internet advertising revenue was bought on a performance basis, up from 51% in 2007, against 39% bought by the impression. Retail was the largest buyer category at 22% of internet revenue, then financial services at 13%, automotive at 12%, computing at 12% and telecom at 9%.

Search did not take the television money in this era. It took the money that had always been bought against a measured response.

## Anyone could buy

The other half of the demand story is that search advertising created buyers rather than only capturing them.

Overture's market assumed a screened professional. It required a 10-cent minimum bid per listing, a $20 minimum monthly spend, and human review of every listing. It had about 80,000 advertisers in December 2002, up from about 53,000 a year earlier.

AdWords removed each gate. A one-time $5 activation fee. No monthly minimum. Automated approval, with most ads live at once.

Writing the ad cost nothing either. A standard text ad was about 95 characters of advertiser-written copy: a 25-character headline, two 35-character lines and a display address. The advertiser typed it into a web form.

How many buyers did that produce? Google never disclosed the figure. We estimate around a million advertisers worldwide at the end of 2008, and the honest range is very wide: 550,000 to 2.6 million. It is grade C. The direction is solid. The buyer base went from a directory of firms to a long tail of small ones.

Note what this did not do. It did not kill the agency commission. That was already gone. The share of US advertisers paying their agency a percentage of billings had fallen to about 10% by 2003, from 61% in 1994. It fell because agencies split media buying off from creative work in the early 1990s, years before search. The holding companies were not shrinking either. Omnicom's worldwide revenue was $12,694.0 million in 2007.

A whole class of buyer now had no agency at all. And the seller, not the agency, built the service layer for the big accounts. Google went from field sales in 14 countries at the end of 2004 to more than 65 offices in over 30 countries by the end of 2008.

The auction also decided what could be sold. In April 2004 Google reversed its US policy and let advertisers bid on other companies' trademarks. GEICO sued. In December 2004 the court held that selling a trademark as a keyword did not by itself break trademark law, and the case settled in 2005. Brand names became inventory, and brand owners had to bid for their own.

Two other doors opened at the end of the era. From the second quarter of 2005 Google also sold ads on partner pages by the impression, so one platform now sold both priced clicks and priced audiences. Audience targeting arrived by purchase rather than by search. Google agreed in April 2007 to buy DoubleClick for $3.1 billion. Microsoft bought aQuantive for about $6 billion, Yahoo bought Right Media for $680 million, and WPP bought 24/7 Real Media for $649 million. That is the machinery of the next era, bought in one year.

By the close of the era the sell side was concentrated. The top ten sellers took 72% of US internet advertising revenue in the fourth quarter of 2008, the top 25 took 83% and the top 50 took 91%. Google Sites held 63.5% of US core searches in December 2008. Google's own revenue had grown 49.6 times across the era, from $439.5 million to $21,795.6 million, of which advertising was $21,128.5 million.

The seller also stayed quiet about the mechanism. Google began reporting how fast paid clicks were growing, about 18% year over year in the fourth quarter of 2008. It never published a click count, an average price per click, or a query count.

## Which engine did it?

The honest answer is bounded, and it goes against both simple stories.

On gross revenue growth from 2002 to 2008, partner sites supplied 31.9% and Google's own sites 68.1%. On revenue kept after paying partners, the network was 9.4% of the 2008 total. The syndicated dollar bought position, not profit.

Inside the growth of Google's own sites, the split between more searches and more money per search is close to even. We put 52% to 56% on more searches and 44% to 48% on more money per search. That is grade C and it must be read as a band, because both query counts behind it are estimates.

And that search volume was mostly not bought. Money Google paid to have searches sent to its own site was 2.8% of its own-site advertising revenue in 2006, 3.7% in 2007 and 4.5% in 2008.

Distribution bought the first foothold, and the auction earned the rest. Inside this era the two engines are close to co-equal.

That verdict has one honest hole. The best economic case for accepting a 9% take rate is that syndication pulled in more advertisers, which deepened every auction and raised prices on Google's own pages too. Nobody has ever measured it. Google never published advertiser counts, auction depth, or its own average prices. We record it as an open question, not a finding.

The purely distribution-driven story does become correct later. It is just not correct yet in 2008.

## The signpost

This design won. Be precise about what "won" means, because the next chapter is about what happened to it.

Three things were already true when the era closed.

The seller computed every number that decided who won and what they paid. The predicted click rate, the quality-based floor, the test for a valid click: all its own, none published, none audited.

The mechanism already under-determined its own price. Revenue sits in a band, and the seller sits on that band.

And the seller had already been setting some prices outright since August 2005, through the per-keyword floor. On a search with one bidder, the floor is the price.

None of that needed the auction to be replaced. It only needed the auction to be tuned.

Watch, then, what the next era does with these levers. Two changes in 2019 ran in opposite directions on opposite sides of the business, and they are constantly confused. Picture ads on ordinary web pages, which the trade calls display ads, moved to a first-price auction on 5 September 2019, where the winner simply pays its own bid. The stated reason was transparency, and Google reported the revenue effect as neutral to positive. Search did the reverse. It got a randomised variant of the same second-price rule, which raised top-slot prices by 5.91% on PCs and tablets in pre-launch tests, with no opt-out. Search never went to first price.

Watch the volume engine too. In 2008 the money Google paid to have searches sent to its own site was $654.7 million, or 11.0% of all its traffic acquisition cost. The rest went to partners for their pages. That small line is the one that grew. The instrument first pointed at AOL in 2002 became $26.3 billion in 2021 of payments to phone and browser makers to make Google the search engine already switched on when you open the device. The trade calls that being the default, and by then it was 57.7% of all the money Google paid out for traffic. Google's own 2017 estimate was that defaults drove 54% of its search revenue. A US court found in 2024 that Google had repeatedly tested whether it could raise search text-ad prices by 5% or more without losing many advertisers, and that "the results have been largely consistent - it can." The remedy that followed in September 2025 barred exclusive default deals and capped their length. It did not stop the payments.

The design that won in 2002 is still running. Watch what its owner does with it once the buyers have nowhere else to go.
