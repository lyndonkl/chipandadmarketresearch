# L0 extraction — calibration run

Model: `gpt-oss:120b`  ·  temperature 0.1  ·  10 units


---

## e4-targeting-004  ·  claim  ·  52.3s

**Unit sent** (number withheld): The best-targeted medium of the era still missed 98 out of 100 recipients: a 2% response rate on a rented list was the working definition of a successful direct-mail campaign, with 2-3% treated as good.

**Nodes (6):**

- `advertising medium` — **best-targeted medium**  _(the best-targeted medium of the era)_
- `marketing tactic` — **direct-mail campaign**  _(successful direct-mail campaign)_
- `mailing list type` — **rented list**  _(on a rented list)_
- `response-rate measurement` — **missed recipient rate**  _(98 out of 100 recipients missed)_
- `response-rate measurement` — **successful direct-mail response rate**  _(2% response rate ... definition)_
- `response-rate measurement` — **good direct-mail response rate range**  _(2-3% treated as good)_

**Edges (4):**

- **best-targeted medium** —`MISSED`→ **missed recipient rate**  _(still missed ... recipients)_
- **successful direct-mail response rate** —`APPLIES_TO`→ **rented list**  _(on a rented list)_
- **successful direct-mail response rate** —`DEFINES`→ **direct-mail campaign**  _(working definition of a successful direct-mail campaign)_
- **good direct-mail response rate range** —`CONSIDERED_GOOD_FOR`→ **direct-mail campaign**  _(treated as good)_

**Repairs:** none


---

## e7-scale-010  ·  claim  ·  64.5s

**Unit sent** (number withheld): The four reconciled money-type pools sum to 100.6 percent of the $398B observed US total for 2025, over-allocating it by about $2.4 billion. The residual is negative and it is an artefact of the aggregation rather than the evidence: national brand and direct response are constructed complements, so taking each pool's median independently breaks the closure every individual lens enforced.

**Nodes (11):**

- `pool set` — **reconciled money-type pools**  _(the four reconciled money-type pools)_
- `spend aggregate` — **US advertising total 2025**  _(the $398B observed US total for 2025)_
- `share measurement` — **allocation share of reconciled pools**  _(sum to ... percent of the observed US total)_
- `excess spend measurement` — **over-allocation amount**  _(over-allocating it by ... billion)_
- `residual measurement` — **allocation residual**  _(the residual is negative)_
- `data aggregation method` — **aggregation**  _(artefact of the aggregation rather than the evidence)_
- `advertising pool` — **national brand pool**  _(national brand ... constructed complement)_
- `advertising pool` — **direct response pool**  _(direct response ... constructed complement)_
- `statistical operation` — **pool median calculation**  _(taking each pool's median independently...)_
- `consistency condition` — **lens closure**  _(breaks the closure every individual lens enforced)_
- `(promoted)` — **negative**

**Edges (7):**

- **allocation share of reconciled pools** —`MEASURES`→ **reconciled money-type pools**  _(sum to ... percent of the observed US total)_
- **allocation share of reconciled pools** —`SHARE_OF`→ **US advertising total 2025**  _(... percent of the observed US total)_
- **over-allocation amount** —`EXCEEDS`→ **US advertising total 2025**  _(over-allocating it by ...)_
- **allocation residual** —`HAS_SIGN`→ **negative**  _(the residual is negative)_
- **allocation residual** —`IS_ARTEFACT_OF`→ **aggregation**  _(artefact of the aggregation)_
- **national brand pool** —`COMPLEMENT_OF`→ **direct response pool**  _(constructed complements)_
- **pool median calculation** —`BREAKS`→ **lens closure**  _(breaks the closure ...)_

**Repairs (1):**

- undeclared_endpoint_promoted: `EDGE|allocation residual|HAS_SIGN|negative|the residual is negative`

---

## e6-creators-002  ·  claim  ·  67.2s

**Unit sent** (number withheld): The share of US advertisers compensating their agency on a billings (commission) basis had fallen to about 10% by 2003, down from 61% in 1994; the collapse followed the 1991-94 unbundling of media buying from creative, not the arrival of search advertising.

**Nodes (4):**

- `media-share measurement` — **billings-based agency compensation share**  _(share of US advertisers using billings-based agency compensation)_
- `advertiser constituency` — **US advertisers**  _(US advertisers)_
- `industry restructuring practice` — **unbundling of media buying from creative**  _(the unbundling of media buying from creative)_
- `advertising channel emergence` — **arrival of search advertising**  _(the arrival of search advertising)_

**Edges (3):**

- **billings-based agency compensation share** —`MEASURES`→ **US advertisers**  _(share of US advertisers using billings-based agency compensation)_
- **billings-based agency compensation share** —`FOLLOWED_BY`→ **unbundling of media buying from creative**  _(the collapse followed the unbundling of media buying from creative)_
- **billings-based agency compensation share** —`NOT_CAUSED_BY`→ **arrival of search advertising**  _(not the arrival of search advertising)_

**Repairs:** none


---

## e5-buyers-015  ·  claim  ·  185.1s

**Unit sent** (number withheld): On the cross-era comparable rule, where ALL directory money sits in the same intent pool eras 6 and 7 use, US direct-response advertisers' measured media spend in 2000 was about $72.3B, 29.2 percent of the market: direct mail $44.6B, the whole Yellow Pages line $13.2B, performance-priced internet $0.7-1.4B and direct-response money bought inside general media $5-18.5B. That is the era-native pool …

**Nodes (32):**

- `rule` — **cross-era comparable rule**  _(on the cross-era comparable rule where all directory money sits in same intent pool)_
- `media intent pool` — **intent pool**  _(same intent pool eras ... and ... use)_
- `era` — **era 6**  _(era ...)_
- `era` — **era 7**  _(era ...)_
- `advertiser group` — **US direct-response advertisers**  _(US direct-response advertisers' measured media spend in ...)_
- `spend measurement` — **total direct-response spend measurement**  _(US direct-response advertisers' measured media spend ... was about ...)_
- `advertising market` — **market**  _(... of the market)_
- `share measurement` — **share of market measurement**  _(... percent of the market)_
- `spend measurement` — **direct mail spend measurement**  _(direct mail ...)_
- `spend measurement` — **Yellow Pages line spend measurement**  _(whole Yellow Pages line ...)_
- `spend measurement` — **performance-priced internet spend measurement**  _(performance-priced internet ...)_
- `spend measurement` — **general media direct-response spend measurement**  _(direct-response money bought inside general media ...)_
- `pool amount measurement` — **era-native pool measurement**  _(era-native pool ...)_
- `block amount measurement` — **local Yellow Pages block measurement**  _(local Yellow Pages block ...)_
- `corporate filing` — **Overture filing**  _(Overture's own filing benchmarked its business ...)_
- `advertising call type` — **Yellow Pages calls**  _(Yellow Pages calls)_
- `response type` — **direct-mail responses**  _(direct-mail responses)_
- `reading interpretation` — **buyer-side reading**  _(buyer-side reading this rule follows)_
- `rule` — **era-native geographic rule**  _(under the era-native geographic rule)_
- `rule` — **unified-intent rule**  _(under this unified-intent rule)_
- `advertiser segment` — **local retail**  _(local retail)_
- `advertiser segment` — **direct response**  _(direct response)_
- `event` — **lead direction flip**  _(the flip is exact)_
- `visualization` — **chart**  _(a chart must not sort these two bars)_
- `visual element` — **pair of bars**  _(these two bars)_
- `evidence` — **1994-2001 evidence**  _(No ... evidence decides which rule is right)_
- `rule set` — **both rules**  _(both are carried)_
- `share measurement` — **local retail share under geographic rule measurement**  _(local retail ... under geographic rule)_
- `share measurement` — **direct response share under geographic rule measurement**  _(direct response ... under geographic rule)_
- `share measurement` — **direct response share under unified-intent rule measurement**  _(direct response ... under unified-intent rule)_
- `share measurement` — **local retail share under unified-intent rule measurement**  _(local retail ... under unified-intent rule)_
- `(promoted)` — **which rule is right**

**Edges (25):**

- **cross-era comparable rule** —`USES`→ **intent pool**  _(where all directory money sits in same intent pool)_
- **intent pool** —`USED_BY`→ **era 6**  _(eras ... use)_
- **intent pool** —`USED_BY`→ **era 7**  _(eras ... use)_
- **US direct-response advertisers** —`HAS_SPEND_MEASUREMENT`→ **total direct-response spend measurement**  _(measured media spend ...)_
- **total direct-response spend measurement** —`MEASURES`→ **US direct-response advertisers**  _(spend measurement of ...)_
- **total direct-response spend measurement** —`SHARE_OF`→ **market**  _(... percent of the market)_
- **share of market measurement** —`MEASURES`→ **market**  _(share of ... market)_
- **direct mail spend measurement** —`PART_OF`→ **total direct-response spend measurement**  _(direct mail part of total spend)_
- **Yellow Pages line spend measurement** —`PART_OF`→ **total direct-response spend measurement**  _(Yellow Pages line part of total spend)_
- **performance-priced internet spend measurement** —`PART_OF`→ **total direct-response spend measurement**  _(performance-priced internet part of total spend)_
- **general media direct-response spend measurement** —`PART_OF`→ **total direct-response spend measurement**  _(direct-response money inside general media part of total spend)_
- **era-native pool measurement** —`PART_OF`→ **total direct-response spend measurement**  _(era-native pool part of total spend)_
- **local Yellow Pages block measurement** —`PART_OF`→ **total direct-response spend measurement**  _(local Yellow Pages block part of total spend)_
- **Overture filing** —`BENCHMARKED_AGAINST`→ **Yellow Pages calls**  _(benchmark against Yellow Pages calls)_
- **Overture filing** —`BENCHMARKED_AGAINST`→ **direct-mail responses**  _(benchmark against direct-mail responses)_
- **cross-era comparable rule** —`FOLLOWS_READING`→ **buyer-side reading**  _(rule follows buyer-side reading)_
- **local retail** —`LEADS_OVER`→ **direct response**  _(under era-native geographic rule)_
- **direct response** —`LEADS_OVER`→ **local retail**  _(under unified-intent rule)_
- **lead direction flip** —`CAUSED_BY`→ **local Yellow Pages block measurement**  _(flip caused by this block)_
- **chart** —`MUST_NOT_SORT`→ **pair of bars**  _(chart must not sort these two bars)_
- **1994-2001 evidence** —`DOES_NOT_DECIDE`→ **which rule is right**  _(evidence does not decide which rule is right)_
- **local retail share under geographic rule measurement** —`MEASURES`→ **local retail**  _(local retail ... under geographic rule)_
- **direct response share under geographic rule measurement** —`MEASURES`→ **direct response**  _(direct response ... under geographic rule)_
- **direct response share under unified-intent rule measurement** —`MEASURES`→ **direct response**  _(direct response ... under unified-intent rule)_
- **local retail share under unified-intent rule measurement** —`MEASURES`→ **local retail**  _(local retail ... under unified-intent rule)_

**Repairs (1):**

- undeclared_endpoint_promoted: `EDGE|1994-2001 evidence|DOES_NOT_DECIDE|which rule is right|evidence does not decide which rule is right`

---

## e7-pricing-005  ·  claim  ·  173.5s

**Unit sent** (number withheld): The ANA's programmatic transparency study found about 36 cents of every dollar entering a demand-side platform reached a consumer — transaction costs took 29 cents and media-productivity loss (non-viewable, invalid traffic, unmeasurable and made-for-advertising inventory) took 35 cents. Of the roughly $88B open-web programmatic pool the study sized, the ANA identified about $22B — a quarter — as r…

**Nodes (22):**

- `research study` — **ANA programmatic transparency study**  _(the ANA's programmatic transparency study)_
- `monetary unit` — **demand-side platform dollar**  _(every dollar entering a demand-side platform)_
- `share measurement` — **consumer reach share of DSP spend**  _(about ... cents per dollar reached a consumer)_
- `share measurement` — **transaction cost share of DSP spend**  _(... cents transaction costs took)_
- `share measurement` — **media productivity loss share of DSP spend**  _(... cents media-productivity loss took)_
- `advertising market` — **open-web programmatic market**  _(the open-web programmatic pool)_
- `market-size measurement` — **open-web programmatic pool size**  _(size of roughly ...B open-web programmatic pool)_
- `efficiency gain measurement` — **recoverable efficiency gain amount**  _(identified about ...B as recoverable efficiency gain)_
- `share measurement` — **consumer miss share of DSP spend**  _(... cents on the dollar that fails to reach a consumer)_
- `dollar amount measurement` — **consumer miss dollar amount**  _(about ...B not reaching a consumer)_
- `ad inventory type` — **made-for-advertising sites**  _(made-for-advertising sites)_
- `report` — **June 2023 first look report**  _(the June ... first look)_
- `spend amount` — **June 2023 first look spend**  _(spend on the June ... first look)_
- `share measurement` — **share of spend absorbed by MFA sites in June 2023**  _(absorbed about ...% of spend on the June ... first look)_
- `report` — **December full report**  _(the December full report)_
- `spend amount` — **December full report spend**  _(spend on the December full report)_
- `dollar amount measurement` — **amount absorbed by MFA sites in December**  _(absorbed about ...B of the ...B pool on the December full report)_
- `share measurement` — **share of spend absorbed by MFA sites in December**  _(...% on the December full report)_
- `count measurement` — **study participant count**  _(participants are ... US marketers)_
- `advertiser type` — **US marketer**  _(US marketers)_
- `dollar amount measurement` — **CTV exclusion amount**  _(pool excludes ...B of CTV)_
- `market scope classification` — **US-only classification**  _(whether pool is US-only or global)_

**Edges (18):**

- **ANA programmatic transparency study** —`FOUND`→ **consumer reach share of DSP spend**  _(found ... cents per dollar reached a consumer)_
- **demand-side platform dollar** —`HAS_SHARE`→ **consumer reach share of DSP spend**  _(... cents per dollar reached a consumer)_
- **demand-side platform dollar** —`HAS_SHARE`→ **transaction cost share of DSP spend**  _(... cents transaction costs took)_
- **demand-side platform dollar** —`HAS_SHARE`→ **media productivity loss share of DSP spend**  _(... cents media-productivity loss took)_
- **open-web programmatic market** —`MEASURES`→ **open-web programmatic pool size**  _(size of roughly ...B open-web programmatic pool)_
- **ANA programmatic transparency study** —`IDENTIFIED`→ **recoverable efficiency gain amount**  _(identified about ...B as recoverable efficiency gain)_
- **consumer miss share of DSP spend** —`NOT_SAME_AS`→ **recoverable efficiency gain amount**  _(that is not the same as ... cents on the dollar that fails to reach a consumer)_
- **demand-side platform dollar** —`HAS_SHARE`→ **consumer miss share of DSP spend**  _(... cents fail to reach a consumer)_
- **open-web programmatic market** —`MEASURES`→ **consumer miss dollar amount**  _(about ...B not reaching a consumer)_
- **made-for-advertising sites** —`ABSORBED_SHARE`→ **share of spend absorbed by MFA sites in June 2023**  _(absorbed about ...% of spend on the June ... first look)_
- **share of spend absorbed by MFA sites in June 2023** —`SHARE_OF`→ **June 2023 first look spend**  _(share of spend absorbed by MFA sites in June 2023)_
- **made-for-advertising sites** —`ABSORBED_AMOUNT`→ **amount absorbed by MFA sites in December**  _(absorbed about ...B of the ...B pool on the December full report)_
- **amount absorbed by MFA sites in December** —`MEASURES`→ **made-for-advertising sites**  _(amount absorbed by MFA sites in December)_
- **share of spend absorbed by MFA sites in December** —`SHARE_OF`→ **December full report spend**  _(...% on the December full report)_
- **ANA programmatic transparency study** —`HAS_PARTICIPANT_COUNT`→ **study participant count**  _(participants are ... US marketers)_
- **US marketer** —`PARTICIPATED_IN`→ **ANA programmatic transparency study**  _(... US marketers participated)_
- **CTV exclusion amount** —`EXCLUDED_FROM`→ **open-web programmatic market**  _(pool excludes ...B of CTV)_
- **open-web programmatic market** —`SCOPE_UNCERTAIN`→ **US-only classification**  _(could not be confirmed whether pool is US-only or global)_

**Repairs:** none


---

## e6-scale-003  ·  claim  ·  143.4s

**Unit sent** (number withheld): US advertising as a share of GDP FELL during the auction era: both series peak in 2000 - Silk & Berndt put the peak at 2.3% (McCann) and 2.4% (IRS), while Galbi's own %-of-GDP column shows the McCann series at 2.5% in 2000; the 0.2pp gap is a GDP-vintage difference, not a data conflict, and the direction is identical in every vintage and drop below 2% thereafter, with Coen's own %-of-GDP column sh…

**Nodes (16):**

- `advertising share measurement` — **US advertising share of GDP**  _(US advertising as a share of GDP)_
- `advertising era` — **auction era**  _(the auction era)_
- `advertising spend dataset` — **Silk & Berndt series**  _(Silk & Berndt series)_
- `advertising spend dataset` — **IRS series**  _(IRS series)_
- `advertising spend dataset` — **McCann series**  _(McCann series)_
- `dataset column` — **Galbi %-of-GDP column**  _(Galbi's own %-of-GDP column)_
- `dataset column` — **Coen %-of-GDP column**  _(Coen's own %-of-GDP column)_
- `economic aggregate` — **US GDP**  _(US GDP)_
- `media-share measurement` — **Silk & Berndt peak advertising share measurement**  _(peak advertising share for Silk & Berndt series)_
- `media-share measurement` — **IRS peak advertising share measurement**  _(peak advertising share for IRS series)_
- `media-share measurement` — **McCann series 2000 advertising share measurement**  _(advertising share measurement for McCann series in ...)_
- `media-share measurement` — **Coen 2002 advertising share measurement**  _(advertising share measurement for Coen column in ...)_
- `media-share measurement` — **Coen 2007 advertising share measurement**  _(advertising share measurement for Coen column in ...)_
- `measurement difference` — **advertising share gap between series**  _(the ... gap between series)_
- `difference cause` — **GDP vintage difference**  _(a GDP-vintage difference)_
- `conflict concept` — **data conflict**  _(a data conflict)_

**Edges (16):**

- **US advertising share of GDP** —`FELL_DURING`→ **auction era**  _(fell during the auction era)_
- **Silk & Berndt series** —`HAS_PEAK_MEASUREMENT`→ **Silk & Berndt peak advertising share measurement**  _(peak ...)_
- **IRS series** —`HAS_PEAK_MEASUREMENT`→ **IRS peak advertising share measurement**  _(peak ...)_
- **Silk & Berndt peak advertising share measurement** —`MEASURES`→ **US advertising share of GDP**  _(measurement of share)_
- **Silk & Berndt peak advertising share measurement** —`SHARE_OF`→ **US GDP**  _(share of US GDP)_
- **IRS peak advertising share measurement** —`MEASURES`→ **US advertising share of GDP**  _(measurement of share)_
- **IRS peak advertising share measurement** —`SHARE_OF`→ **US GDP**  _(share of US GDP)_
- **Galbi %-of-GDP column** —`SHOWS`→ **McCann series 2000 advertising share measurement**  _(shows ... in ...)_
- **Coen %-of-GDP column** —`SHOWS`→ **Coen 2002 advertising share measurement**  _(shows ... in ...)_
- **Coen %-of-GDP column** —`SHOWS`→ **Coen 2007 advertising share measurement**  _(shows ... in ...)_
- **Coen 2002 advertising share measurement** —`MEASURES`→ **US advertising share of GDP**  _(measurement of share)_
- **Coen 2002 advertising share measurement** —`SHARE_OF`→ **US GDP**  _(share of US GDP)_
- **Coen 2007 advertising share measurement** —`MEASURES`→ **US advertising share of GDP**  _(measurement of share)_
- **Coen 2007 advertising share measurement** —`SHARE_OF`→ **US GDP**  _(share of US GDP)_
- **advertising share gap between series** —`TYPE_OF`→ **GDP vintage difference**  _(gap is a ... difference)_
- **advertising share gap between series** —`EXCLUDES`→ **data conflict**  _(not a ...)_

**Repairs:** none


---

## e1-creators-002  ·  claim  ·  45.6s

**Unit sent** (number withheld): Palmer's agency claimed in 1849 to be the sole representative of 1,300 of the roughly 2,000 newspapers then published in the United States. This is a self-reported claim from the agency's own advertising.

**Nodes (5):**

- `advertising agency` — **Palmer's agency**  _(Palmer's agency)_
- `newspaper-representation measurement` — **newspapers represented count**  _(sole representative of ... newspapers)_
- `advertising medium` — **United States newspapers**  _(newspapers then published in the United States)_
- `agency claim` — **self-reported claim**  _(self-reported claim from the agency's own advertising)_
- `advertising content` — **agency advertising**  _(the agency's own advertising)_

**Edges (5):**

- **Palmer's agency** —`MADE_CLAIM`→ **self-reported claim**  _(claimed ... to be sole representative of ...)_
- **self-reported claim** —`DESCRIBES`→ **newspapers represented count**  _(self-reported claim describes representation)_
- **newspapers represented count** —`MEASURES`→ **United States newspapers**  _(representation of ... newspapers)_
- **agency advertising** —`ORIGINATES_FROM`→ **Palmer's agency**  _(the agency's own advertising originates from Palmer's agency)_
- **self-reported claim** —`SOURCE`→ **agency advertising**  _(self-reported claim from the agency's own advertising)_

**Repairs:** none


---

## tu:era:6:event:0  ·  prose:event  ·  76.7s

**Unit sent** (number withheld): Google replaces the CPM AdWords launched in October 2000 with AdWords Select: cost-per-click pricing, ranking by a combination of click-through rate and bid, and an automatic discounter that charges one cent above the next bid. Self-serve, four steps, most ads live immediately.

**Nodes (13):**

- `company` — **Google**  _(Google replaces the CPM AdWords...)_
- `advertising product` — **CPM AdWords**  _(the CPM AdWords launched in October ...)_
- `advertising product` — **AdWords Select**  _(with AdWords Select)_
- `pricing model` — **cost-per-click pricing**  _(cost-per-click pricing)_
- `performance metric` — **click-through rate**  _(click-through rate)_
- `price component` — **bid**  _(bid)_
- `ranking factor` — **CTR-bid combination**  _(combination of click-through rate and bid)_
- `pricing mechanism` — **automatic discounter**  _(automatic discounter that charges ... above the next bid)_
- `reference price` — **next bid**  _(the next bid)_
- `price-difference measurement` — **automatic discounter charge amount**  _(charges ... above the next bid)_
- `service mode` — **self-serve**  _(Self-serve)_
- `process` — **four-step workflow**  _(four steps)_
- `ad outcome` — **immediate ad activation**  _(most ads live immediately)_

**Edges (12):**

- **Google** —`REPLACES`→ **CPM AdWords**  _(replaces the CPM AdWords ...)_
- **Google** —`INTRODUCED`→ **AdWords Select**  _(with AdWords Select)_
- **AdWords Select** —`USES`→ **cost-per-click pricing**  _(cost-per-click pricing)_
- **AdWords Select** —`RANKED_BY`→ **CTR-bid combination**  _(ranking by a combination of click-through rate and bid)_
- **CTR-bid combination** —`COMBINES`→ **click-through rate**  _(combination of click-through rate ...)_
- **CTR-bid combination** —`COMBINES`→ **bid**  _(... and bid)_
- **AdWords Select** —`INCLUDES`→ **automatic discounter**  _(automatic discounter that charges ... above the next bid)_
- **automatic discounter** —`HAS_MEASUREMENT`→ **automatic discounter charge amount**  _(automatic discounter ... charges ... above the next bid)_
- **automatic discounter charge amount** —`CHARGED_ABOVE`→ **next bid**  _(charges ... above the next bid)_
- **AdWords Select** —`HAS_MODE`→ **self-serve**  _(Self-serve)_
- **AdWords Select** —`USES`→ **four-step workflow**  _(four steps)_
- **AdWords Select** —`RESULTS_IN`→ **immediate ad activation**  _(most ads live immediately)_

**Repairs:** none


---

## tu:era:1:field:CREATORS  ·  prose:field:CREATORS  ·  113.4s

**Unit sent** (number withheld): Nobody in this era was hired to make advertisements. The agency was invented as a space broker: Volney B. Palmer opened in Philadelphia in 1841-42 and was paid by publishers, taking roughly 25 percent of what he sold. By the 1850s a dozen rivals each claimed to represent every paper of importance, and the commission an agent could extract ranged from about 10 to 50 percent. George P. Rowell (Bosto…

**Nodes (20):**

- `organization` — **advertising agency**  _(the agency was invented as a space broker)_
- `city` — **Philadelphia**  _(opened in Philadelphia)_
- `actor class` — **publishers**  _(was paid by publishers)_
- `take-rate measurement` — **agency commission rate**  _(taking ... of what he sold)_
- `published space price` — **advertising space revenue**  _(... of what he sold)_
- `occupation` — **advertising agents**  _(a dozen rivals each claimed to represent...)_
- `media outlet category` — **important newspapers**  _(represent every paper of importance)_
- `commission rate range measurement` — **agent commission range**  _(commission ... ranged from ...)_
- `contract type` — **open contract**  _(offered advertisers the open contract)_
- `take-rate measurement` — **fixed commission rate**  _(take a fixed percentage)_
- `actor class` — **advertisers**  _(offered advertisers...)_
- `actor class` — **buyer**  _(agent would work for the buyer)_
- `service` — **market research services**  _(agency had to sell market research)_
- `service` — **copy and art services**  _(then copy and art)_
- `advertising output` — **copy product**  _(turned copy into the product)_
- `testing practice` — **headline testing method**  _(tested headlines against keyed coupons)_
- `measurement tool` — **keyed coupons**  _(tested headlines against keyed coupons)_
- `agency type` — **full-service agency**  _(the full-service agency...)_
- `sales technique` — **pitch**  _(the pitch...)_
- `industry association` — **trade body 4As**  _(the trade body that froze them)_

**Edges (15):**

- **advertising agency** —`OPENED_IN`→ **Philadelphia**  _(opened in Philadelphia)_
- **publishers** —`PAID`→ **advertising agency**  _(was paid by publishers)_
- **advertising agency** —`HAS_RATE`→ **agency commission rate**  _(taking ... of what he sold)_
- **agency commission rate** —`SHARE_OF`→ **advertising space revenue**  _(... of what he sold)_
- **advertising agents** —`CLAIMED_REPRESENTATION_OF`→ **important newspapers**  _(each claimed to represent every paper of importance)_
- **advertising agents** —`HAS_RANGE`→ **agent commission range**  _(commission ... ranged from ...)_
- **open contract** —`OFFERED_TO`→ **advertisers**  _(offered advertisers the open contract)_
- **open contract** —`HAS_RATE`→ **fixed commission rate**  _(take a fixed percentage)_
- **open contract** —`WORKS_FOR`→ **buyer**  _(agent would work for the buyer)_
- **advertising agency** —`ADOPTED_SERVICE`→ **market research services**  _(agency had to sell market research)_
- **advertising agency** —`ADOPTED_SERVICE`→ **copy and art services**  _(then copy and art)_
- **advertising agency** —`TURNED_INTO_PRODUCT`→ **copy product**  _(turned copy into the product)_
- **headline testing method** —`EMPLOYED_TOOL`→ **keyed coupons**  _(tested headlines against keyed coupons)_
- **full-service agency** —`INCLUDES`→ **pitch**  _(the pitch...)_
- **trade body 4As** —`FROZE`→ **full-service agency**  _(trade body that froze them)_

**Repairs:** none


---

## e1-creators-004  ·  claim  ·  41.0s

**Unit sent** (number withheld): One of the largest US agencies (Ayer) handled roughly 1.2 percent of total US advertising outlay in 1917, so the agency layer was highly fragmented at the end of the era.

**Nodes (6):**

- `advertising agency` — **Ayer**  _(one of the largest US agencies)_
- `agency class` — **US advertising agency**  _(US advertising agencies)_
- `aggregate ad spend` — **total US advertising outlay**  _(total US advertising outlay)_
- `share measurement` — **Ayer share of total US advertising outlay**  _(handled ... percent of total US advertising outlay)_
- `advertising market structure` — **agency layer**  _(the agency layer)_
- `market condition` — **high fragmentation**  _(highly fragmented)_

**Edges (4):**

- **Ayer** —`WAS_ONE_OF_LARGEST`→ **US advertising agency**  _(one of the largest US agencies)_
- **Ayer** —`HANDLED`→ **Ayer share of total US advertising outlay**  _(handled ... percent of total US advertising outlay)_
- **Ayer share of total US advertising outlay** —`SHARE_OF`→ **total US advertising outlay**  _(... of total US advertising outlay)_
- **agency layer** —`HIGHLY_FRAGMENTED`→ **high fragmentation**  _(highly fragmented at the end of the era)_

**Repairs:** none
