# Chip & Ad Market Research

Two podcasts on a road trip became two research questions, and the two questions grew a third. This repo is the research tree: AI/human research delivered as interactive experiences — unit visualizations with object constancy, scrollytelling narratives, every number sourced and calibrated. Research as media, not papers.

## The tree

```
Stratechery: "Who's Afraid of Chinese Models?"        Acquired: "Google Part I: Origins of Search"
                    │                                                     │
                    ▼                                                     ▼
        p1-ai-economics/                                      p2-ad-market/
        The Economics of Intelligence                         The Attention Economy
        Fixed vs marginal cost of AI,                         150 years of the ad market,
        the CapEx wave, the payback question                  and how Google's auction ate it
                    │                                                     │
                    └──────────────────────┬──────────────────────────────┘
                                           ▼
                                  p3-synthesis/
                                  Why Ads Won't Save AI (or Will They?)
                                  Ads solved zero-price search in the 2000s —
                                  why isn't that solving AI inference now?
```

## Structure

Each project delivers three layers:

1. **Research corpus** (`research/`) — analyst-grade chapters, every claim cited, every chapter passing four readability gates (Flesch-Kincaid ≤ 10, Reading Ease ≥ 50, Gunning Fog ≤ 12, SMOG ≤ 12).
2. **Data layer** (`data/`) — every number as structured JSON: central estimate, 80% confidence interval, source grade (A: filed/official, B: credible reporting, C: triangulated estimate), sources, and date.
3. **Experience** (`docs/`) — a unit-visualization scrollytelling essay. The hub page navigates the tree.

Forward-looking numbers come from multi-agent superforecaster panels; the disagreement between panelists is reported and visualized, not hidden.

## Process

See [PROCESS.md](PROCESS.md). Sequential and gated: research → human review → data layer → design (architect variants + grilling) → experience → human review.
