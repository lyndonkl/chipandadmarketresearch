# L0 gate report

The bottom rung is built and loaded. It is immutable from here. Review, then approve L1 — or send back specific fixes. Internal working note.

## What is in the graph

- **8619 nodes**, all `:L0` (8619).  4833 entities · 3756 measurements (1573 ad-spend + 2183 claim/prose) · 30 dimension entities.
- **7669 relationships**, 1940 distinct types (open-ended — the corpus coined them).
- **506 unit-islands** from 506 claims + 133 prose, plus the ad-spend cloud on 30 dimension hubs.
- Ad-spend fans into media hubs: newspapers 479, total 279, yellow_pages 84, radio 82, magazines 73, business_papers 73, miscellaneous 73, direct_mail 73 …

## Extraction quality (639 units, 0 errors)

- 7016 nodes / 5577 edges emitted; **76 deterministic repairs** ({'long_relation_type_kept': 24, 'year_node_dropped': 1, 'edge_to_year_dropped': 1, 'undeclared_endpoint_promoted': 50}).
- Withheld-number rule held: **0 bare-year nodes** in the graph.

## Numbers attached (the withheld values)

- **328 of 506 claims** got their calibrated number attached (106 single-measurement, 222 matched by unit).
- **157 halted** — several measurement nodes, no clear unit match. NOTHING guessed; their figures stay recoverable via `origin`. *This is the main review item.*
- 18 date-unit claims correctly carry no measurement; **3 quantity claims had no measurement node** (genuine extraction misses to check).

Sample halted claims (headline value not attached — you decide accept vs. add a tie-breaker):

- `e1-creators-003` unit *USD millions (current)* → candidates: gross receipts (billings), gross receipts prior amount
- `e1-buyers-003` unit *USD millions (current), annual sales* → candidates: Sears annual sales measurement, Montgomery Ward annual sales measurement
- `e1-buyers-004` unit *USD millions (current), annual sales* → candidates: Sears annual sales 1908, Sears annual sales 1906-07
- `e1-buyers-005` unit *USD millions (current), newspaper space* → candidates: national advertisers newspaper space spend, local advertisers newspaper space spend, national advertisers share of newspaper advertising
- `e1-buyers-006` unit *USD millions (current), newspaper space* → candidates: local advertisers' newspaper space spend, national advertisers' newspaper space spend
- `e1-sellers-001` unit *publications* → candidates: newspaper and periodical count, aggregate circulation per issue

The 3 quantity misses:

- `e2-targeting-005` unit *percent of US households owning a radio set, 1940*
- `e5-pricing-005` unit *USD per thousand impressions*
- `e5-events-002` unit *standard banner sizes*

## Four-defect status

- **Key collision:** one `keys.py` authority; `uid` uniqueness constraint live; 0 skipped/dangling edges on load.
- **Dangling refs:** every edge endpoint declared in-unit (0 skipped); 0 year-nodes.
- **Access control:** `admarket` + 3 least-privilege users; builder role **proven** unable to mutate `:L0`.
- **Advisory gates:** this is a hard stop — L1 does not run until you approve.

## Frozen corpus

- VERIFIED unchanged (94 files).

## Node-type vocabulary the corpus coined (top 15, claim/prose entities+measurements)

- media-share measurement — 152
- advertising medium — 129
- share measurement — 127
- spend measurement — 117
- revenue measurement — 113
- company — 113
- advertising spend measurement — 78
- take-rate measurement — 60
- percentage measurement — 56
- count measurement — 42
- advertising spend aggregate — 39
- advertising channel — 35
- advertising category — 30
- advertising-spend dataset — 29
- broadcast network — 28