# Contributing to Oblique Strategies

Thanks for caring. This project is small on purpose — the value lives in the
*deck* (Brian Eno & Peter Schmidt's Oblique Strategies, used as divergence
frames) and the *loop discipline*, not the LOC. Most contributions will be one
of:

1. **A tweak to how cards are drawn or wrapped** (the `selectFrames` /
   `strategyPrompt` logic in `src/frames.ts`)
2. **An improvement to the diverge/score/cluster/deepen loop**
3. **A new eval problem** that exposes where the loop wins or loses
4. **Docs / examples / launch material**

---

## Dev setup

```bash
git clone https://github.com/garethsprice/oblique-strategies.git
cd oblique-strategies
npm install
npm run build
export ANTHROPIC_API_KEY=...   # or rely on local Claude Code auth
node dist/cli.js "your test problem here"
```

Iterating without rebuilding:

```bash
npm run dev -- "your test problem here"   # tsx, no build step
```

---

## The deck

The 211 cards live in `src/frames.ts` as the `STRATEGIES` string array, copied
verbatim from the full compiled deck at <https://oblique.ookb.co/>. Each card is
turned into a `Frame` by `strategyPrompt()`, which wraps it as a lateral
provocation, and `selectFrames(n)` deals `n` cards at random per run.

```ts
export type Frame = {
  id: string;     // stable slug, e.g. "os-042" (zero-padded deck index)
  label: string;  // the card text itself, shown to the user
  prompt: string; // the card wrapped as a divergent-branch instruction
};
```

**Editing the deck.** The canonical list is the published deck — don't invent
cards. If you're correcting a transcription error or syncing with a new
printing, edit the `STRATEGIES` array and keep it verbatim. The `os-NNN` ids are
positional, so prefer *appending* over reordering to keep ids stable.

**Changing how cards are used.** The two load-bearing functions are
`strategyPrompt()` (how literally vs metaphorically the card is framed) and
`selectFrames()` (the draw is uniform at random by design — cherry-picking
"relevant" cards defeats the point). Changes here should be justified against
idea quality on the eval suite, not vibes.

### Test it

Run a problem and check the drawn cards produce *structurally different* ideas,
not paraphrases of each other:

```bash
npm run dev -- "design a write-ahead log under bursty load"
```

If two branches converge on the same idea despite different cards, the wrapping
prompt may be too literal — iterate `strategyPrompt`.

---

## Adding an eval problem

Eval problems live in [`bench/problems.json`](./bench/problems.json). A good eval problem has:

- An **open-ended** answer space (not "what's the syntax for X")
- A **non-trivial obvious answer** (so the baseline has something credible to fall back on)
- A **specific constraint** that rewards non-obvious thinking (the "100ms" or "leader election" in the existing problems)
- A **category** that's not already over-represented

Then run:

```bash
npm run build
npm run evals               # full suite
npm run evals -- --problem your-new-id   # just yours
```

Output is `EVALS.md` + `bench/results.json`. Costs ~10 LLM calls per problem (5 cards + score + cluster + 3 deepen + 1 baseline + 1 judge).

---

## Loop changes (engine.ts)

The loop is small on purpose. Before changing it, read the loop description in
[the skill](./skills/oblique-strategies/SKILL.md) — most "improvements" violate
the load-bearing invariants:

- **Branches must not see each other during divergence.** This is the whole point.
- **Generator and critic must use separate LLM calls with opposite system prompts.** Don't merge them for efficiency.
- **Score before deepen.** Deepening unscored ideas is just expensive generation.
- **Cluster by underlying angle, not surface keywords.** If the cluster pass starts outputting `"caching ideas"` instead of `"remove-the-server plays"`, the prompt has drifted.

If your change weakens any of these, the bar is higher.

Good loop changes:
- recursive deepen (multi-level ToT)
- pluggable scorers (let users supply their own weights / trap detectors)
- streaming output during divergence
- cross-model support (the cards don't depend on Claude)

---

## Style

- TypeScript strict mode. No `any` unless commented why.
- Comments are for **why**, not what. Code shows what.
- New deps need justification. Current deps: `@anthropic-ai/claude-agent-sdk`, `p-limit`, `zod`. That's already three more than the loop strictly needs.
- No emojis in source (renderer is allowed terminal symbols).

---

## PRs

- One concern per PR.
- Deck or card-wrapping change? Include a 2-line "what this catches that the current wrapping misses" in the PR body.
- New eval? Include the run output.
- Loop change? Include before/after on at least one eval problem.

---

## License

By contributing, you agree your contribution is licensed under MIT.
