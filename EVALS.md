# Oblique Strategies vs baseline — evals

_No figures are committed for this fork yet._

This fork's divergence frames are Brian Eno & Peter Schmidt's 211 Oblique
Strategies, drawn at random — different from the original ADHD cognitive-frame
library — so any previously published numbers no longer describe this code.

Generate fresh figures locally:

```bash
npm run evals          # full suite (~6 problems, ~10 LLM calls each)
npm run evals:quick    # first 2 problems
npm run evals -- --problem lru-100ms   # one specific problem
```

That regenerates this file (per-problem verdicts + an aggregate table scored by
an LLM-as-judge on breadth / novelty / trap detection / actionability / builder
usefulness, A/B order randomized to balance positional bias) and writes full
transcripts to `bench/results.json`.
