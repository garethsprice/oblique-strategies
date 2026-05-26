# Oblique Strategies — a divergent-ideation skill for agents

[![CI](https://github.com/garethsprice/oblique-strategies/actions/workflows/ci.yml/badge.svg)](https://github.com/garethsprice/oblique-strategies/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/oblique-strategies-agent.svg)](https://www.npmjs.com/package/oblique-strategies-agent)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](#install)

> **Stop your agent from picking the first answer.**

This is a drop-in skill and library that makes coding agents think *wide before deep* — using **Brian Eno & Peter Schmidt's [Oblique Strategies](https://en.wikipedia.org/wiki/Oblique_Strategies)** as the divergence engine. It draws several of the 211 cards at random, re-attacks the same problem once per card in **parallel isolated branches** with the critic switched off, scores every leaf, prunes the traps, and **deepens only the survivors**.

Each card ("Honor thy error as a hidden intention", "Use an old idea", "What would your closest friend do?") is a cryptic, domain-agnostic shove out of the obvious. A random card is a cheap, reliable way into the *awkward middle* — past the first three textbook answers, before the absurd — where the interesting ideas live.

It is the skill to reach for on **creative work, interdisciplinary work, design decisions, fuzzy debugging, naming, API surface design, strategy, positioning** — anywhere a single-pass agent would hand you a competent, forgettable answer.

It's a fork of **[ADHD](https://github.com/UditAkhourii/adhd)** by [UditAkhourii](https://github.com/UditAkhourii): the same parallel-divergent loop, with the hand-authored cognitive frames swapped for the Oblique Strategies deck and the trigger made explicit-only. ([What's different →](#how-this-is-different-from-the-original-adhd-skill-and-from-chain-of-thought))

> **Explicit-trigger only.** Unlike a typical always-on skill, this one never auto-fires on "brainstorm"/"design"/"naming" intents. It runs **only** when you invoke `/oblique-strategies` (or ask for it by name). It's expensive on purpose (~10 LLM calls/run), so you opt in at the decision points that are worth it.

Ships three ways: as an **agent skill** ([`skills/oblique-strategies/SKILL.md`](./skills/oblique-strategies/SKILL.md), drop-in via `npx skills add garethsprice/oblique-strategies`, works in Claude Code, Cursor, Codex, and ~50 more), as a **Node/TS library** (`oblique-strategies-agent`), and as a **CLI** (`oblique-strategies "your problem here"`). The library and CLI are built on the [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk).

---

## Install

### One command, every agent

```bash
npx skills add garethsprice/oblique-strategies
```

That is it. The [`skills`](https://github.com/vercel-labs/skills) CLI detects which agent you are using and drops [`skills/oblique-strategies/SKILL.md`](./skills/oblique-strategies/SKILL.md) into the right place. Supports **Claude Code, Claude.ai, Antigravity, Cursor, Codex, Cline, Continue, Aider, Gemini CLI, Windsurf, Cody, Roo, Augment, OpenCode, Kilo, Kimi, Qwen, Trae, Replit, Warp**, and ~40 more.

Restart your agent. The skill is **explicit-trigger only** — it does not auto-fire. Invoke it with `/oblique-strategies "design a rate limiter that survives a leader election"`.

Useful flags:

```bash
npx skills add garethsprice/oblique-strategies -g            # install globally instead of per-project
npx skills add garethsprice/oblique-strategies -a claude-code -a cursor   # target specific agents
npx skills add garethsprice/oblique-strategies --copy        # copy files instead of symlinking
npx skills add garethsprice/oblique-strategies --list        # see what skills the repo offers
```

### Manual install (if you do not have npx)

The skill file is at [`skills/oblique-strategies/SKILL.md`](./skills/oblique-strategies/SKILL.md). Curl it into your agent's skill directory:

```bash
# Claude Code (global)
mkdir -p ~/.claude/skills/oblique-strategies
curl -fsSL https://raw.githubusercontent.com/garethsprice/oblique-strategies/main/skills/oblique-strategies/SKILL.md \
  -o ~/.claude/skills/oblique-strategies/SKILL.md

# Claude Code (per-project)
mkdir -p .claude/skills/oblique-strategies
curl -fsSL https://raw.githubusercontent.com/garethsprice/oblique-strategies/main/skills/oblique-strategies/SKILL.md \
  -o .claude/skills/oblique-strategies/SKILL.md

# Cursor (project rules)
curl -fsSL https://raw.githubusercontent.com/garethsprice/oblique-strategies/main/skills/oblique-strategies/SKILL.md >> .cursorrules
```

For **Claude.ai web/desktop**: open project settings → **Skills** → **Add skill** → upload [`skills/oblique-strategies/SKILL.md`](./skills/oblique-strategies/SKILL.md).

For **Cline, Continue, Aider, Roo Code, and other agents**: paste the body of [`SKILL.md`](./skills/oblique-strategies/SKILL.md) (skip the YAML frontmatter) into your agent's system prompt or rules field.

### As a CLI (terminal usage, no agent needed)

```bash
npm install -g oblique-strategies-agent
oblique-strategies "design a rate limiter that survives a leader election"   # alias: oblique
```

Auth: picks up `ANTHROPIC_API_KEY` from the environment, or inherits auth from a local Claude Code install.

### As a library (inside your own agent)

```bash
npm install oblique-strategies-agent
```

```ts
import { run } from "oblique-strategies-agent";
const result = await run({ problem: "...", framesPerRun: 5, topK: 3 });
```

### From source

```bash
git clone https://github.com/garethsprice/oblique-strategies.git
cd oblique-strategies && npm install && npm run build
```

---

## Quickstart

### CLI

```bash
oblique-strategies "design a rate limiter that survives a leader election"

oblique-strategies "name this function" --frames 3 --ideas 8 --top 2

oblique-strategies "we have a CLI that hangs for 90s on LLM calls. what's the right retry/UX?" \
    --frames 5 --ideas 6 --top 3 --context ./client.ts

oblique-strategies "..." --json > result.json
```

### Library

```ts
import { run, renderText } from "oblique-strategies-agent";

const result = await run({
  problem: "How should we shard this queue under bursty load?",
  context: readFileSync("./queue.ts", "utf8"),
  framesPerRun: 6,   // cards drawn this run
  ideasPerFrame: 8,
  topK: 3,
  onEvent: (e) => console.error(e),
});

console.log(renderText(result));
// or operate on:
//   result.shortlist        → 2–4 most promising ideas with scores
//   result.nonObviousPick   → the highest-novelty viable one
//   result.traps            → "looks good but isn't" list, with reasons
//   result.deepened         → top-K expanded: sketch + risk + first step + child ideas
//   result.clusters         → the SHAPE of the idea space
```

---

## What this actually is

A two-phase loop with a hard wall between the phases. Mixing them is what kills idea quality, because the critic strangles the generator.

### Phase 1 — Diverge

Draw N **Oblique Strategy cards** at random from the deck of 211. Spawn N **parallel** Agent SDK queries, each one a fresh isolated session.

Each branch sees:
- the problem
- *one* card, wrapped as a lateral provocation (e.g. *"Your Oblique Strategy is 'Use an old idea.' Interpret it loosely — metaphorically if needed — and let it bend how you attack the problem."*)
- a system prompt that **forbids evaluation, ranking, or hedging** — pure generation, JSON array out, no prose.

Critically: branches **do not see each other**. The branch that drew "Repetition is a form of change" never reads what the "Honor thy error" branch wrote. No anchoring, no shared context, no convergence pressure. And the draw is **uniform at random** — cherry-picking the cards that "look relevant" defeats the point; the value is the unexpected angle.

### Phase 2 — Focus

Now the critic comes back online. Three passes:

1. **Score** every leaf on `novelty / viability / fit`. Tag traps with reasons.
2. **Cluster** by underlying angle, not surface keywords or by which card produced them ("remove-the-server plays", "cache-shaped plays") — surfaces the *shape* of the space.
3. **Deepen** top-K: sketch how it works, name the load-bearing risk, name the first concrete step, generate 3–5 child ideas (variations, hybrids, unlocks).

Output:
- the wide set, clustered
- a 2–4 idea shortlist
- the **non-obvious-but-viable pick** flagged explicitly
- the trap list, each trap with the reason it's a trap
- the deepened branches — the "connected dots"
- one provocation (a wildcard question)

---

## How this is different from the original ADHD skill (and from Chain-of-Thought)

### vs the original ADHD skill

This is a fork of **[ADHD](https://github.com/UditAkhourii/adhd)**. The loop is identical — parallel isolated divergence, a mechanical generator/critic split, then score → cluster → deepen. What changed is **what drives the branching** and **when it fires**:

| | ADHD (original) | This (Oblique Strategies) |
|---|---|---|
| **Branching driver** | 15 hand-authored cognitive frames (hardware engineer, regulator, 10-year-old, biology, speedrunner, …) | the 211 published Oblique Strategy cards |
| **Frame selection** | tag-biased — `code`/`design` frames favored in `code-mode`, one `wild` slot reserved | uniform random draw; no tags, no `code-mode` |
| **Per-frame prompt** | a persona / vantage point (*"you are X, re-ask as X would"*) | a cryptic aphorism wrapped as a loose, possibly metaphorical nudge |
| **Trigger** | auto-fires on brainstorm / ideate / design / naming intents, plus a self-judge gate | **explicit-only** (`/oblique-strategies`) — no auto-fire, no self-judge |
| **Package / CLI** | `adhd-agent` / `adhd` | `oblique-strategies-agent` / `oblique-strategies` (alias `oblique`) |

Why the swap: a hand-authored frame carries stylistic baggage (*"answer as a 10-year-old"*) that can drag output away from the problem. A domain-agnostic card forces a *fresh angle without a persona*. On the eval suite the two perform on par, with the card deck edging ahead on builder-usefulness (see [Evals](#evals)). Making it explicit-only reflects that this is a deliberate ~10-call move, not something you want firing on every *"give me a few ideas."*

### vs Chain-of-Thought and Tree-of-Thought

Easy to conflate. They are structurally different.

| | Chain-of-Thought | Tree-of-Thought | **This (Oblique Strategies)** |
|---|---|---|---|
| **Threads** | one, linear | one tree, walked | **N parallel, isolated** |
| **Branches share context** | yes | yes (one session) | **no — each branch is its own `query()`** |
| **Generator vs critic** | same step | same model, alternating | **separated phases, separate LLM calls, opposite system prompts** |
| **Branching driver** | none | next-step variations | **Oblique Strategy cards** — re-ask the *whole question* nudged by a random aphorism |
| **Parallelism** | sequential | mostly sequential | **true concurrent API calls** |
| **Goal** | correct reasoning | find a solving path | **escape premature convergence; surface non-obvious viable options** |
| **Right for** | math, multi-step logic | search, planning, puzzles | **open-ended design & ideation** |

### The three load-bearing differences

**1. Isolation, not search.**
CoT and ToT branches share a context window — by step 4, the model has anchored on what it wrote in steps 1–3. Here, branches **never see each other** during divergence. Anchoring is eliminated by construction, not by prompting.

**2. Cards, not next-step variation.**
ToT branches typically vary the next move ("try this number / try that number"). This varies the *entire vantage point of the generator* via a random card. It's not "what's the next step from here," it's *"re-ask the whole question while honoring your error as a hidden intention."* That produces structurally different ideas, not nearby ones — which is what interdisciplinary work needs. The cards are deliberately content-free of your domain, so they can't pull you back toward the obvious.

**3. Generator–critic split is mechanical, not promised.**
In CoT and ToT, the model evaluates as it goes. Here divergence is its own LLM call with a system prompt that *forbids* evaluation. Convergence is a separate call with the opposite posture. Two postures, two passes, mutually exclusive.

### One-sentence version

> CoT makes one head think slower. ToT makes one head search wider. **This makes many heads think differently — each shoved sideways by a random Oblique Strategy — in parallel, then has a critic pick.**

---

## The deck (the cognitive distortions)

All **211 Oblique Strategies** from the full compiled deck (every printing), used as divergence frames. The deck is domain-agnostic by design — that's the point. A few cards:

- *Honor thy error as a hidden intention.*
- *Use an old idea.*
- *What would your closest friend do?*
- *Repetition is a form of change.*
- *Remove specifics and convert to ambiguities.*
- *Work at a different speed.*
- *Emphasize the flaws.*
- *Is it finished?*

`selectFrames(n)` deals `n` cards at random per run; `strategyPrompt(card)` wraps each as a lateral provocation. The full list and wrapping live in [`src/frames.ts`](./src/frames.ts) (verbatim from <https://oblique.ookb.co/>).

---

## When to use it (and when not to)

**Use it for:**
- Architecture & design decisions (storage layer, sharding, auth model, queue topology, retry strategy)
- API / SDK / CLI surface design
- Fuzzy debugging — generate *hypothesis classes* you haven't considered
- Migration & refactor planning
- Naming — functions, products, services, env vars
- Strategy, positioning, pricing — anywhere you'd say *"give me a few ways to…"*
- **Inside agent loops** at decision points where the cost of premature convergence is high

**Don't use it for:**
- Lookup questions
- Bug fixes with a known root cause
- Anything where the right answer is one Google away
- Inner-loop / tight latency / per-keystroke use
- Single-correct-answer problems

> One-sentence test: *If a junior would Google it and find the answer, baseline wins. If a senior would say "hm, let me think about this differently for a minute" — that's the moment to draw a card.*

Because the skill is explicit-trigger only, none of this happens automatically — you decide when the moment is worth ~10 LLM calls and invoke `/oblique-strategies`.

---

## Cost & speed

Honest numbers. A default run is roughly:

- N parallel divergence calls (default 5, one per card)
- 1 scoring call
- 1 clustering call
- K deepen calls (default 3)

≈ **10 LLM calls per run**, 5–10x a single-shot baseline. Latency depends on concurrency; 30–90s wall clock is typical.

Frame it as: **$0.30 to widen a $50k architecture decision.** Don't run it on every keystroke. Run it at decision points — which is exactly why it's explicit-trigger only.

---

## CLI flags

| Flag | Default | What |
| --- | --- | --- |
| `--frames N` | 5 | parallel divergence branches / cards drawn |
| `--ideas N` | 6 | ideas per branch |
| `--top N` | 3 | how many to deepen / focus |
| `--concurrency N` | 4 | max parallel LLM calls |
| `--context PATH` | — | inject a file as context (code, stack, constraints) |
| `--model NAME` | SDK default | override model |
| `--json` | — | emit machine-readable `RunResult` |
| `--quiet` | — | suppress progress events |

---

## Library API (TypeScript)

```ts
import { run, renderText, FRAMES, STRATEGIES, selectFrames, strategyPrompt } from "oblique-strategies-agent";
import type {
  RunOptions, RunResult, Idea, Branch, Cluster,
  DeepenedIdea, Score, RunEvent, Frame,
} from "oblique-strategies-agent";

type RunOptions = {
  problem: string;
  context?: string;
  framesPerRun?: number;   // cards drawn, default 5
  ideasPerFrame?: number;  // default 6
  topK?: number;           // default 3
  concurrency?: number;    // default 4
  model?: string;
  onEvent?: (e: RunEvent) => void;
};
```

`STRATEGIES` is the raw 211-card array; `FRAMES` is the derived `{ id, label, prompt }[]`. Everything in `RunResult` is structured — clusters, scored ideas with `novelty / viability / fit`, trap reasons, deepened sketches with child ideas. You can route it into your own renderer, downstream agent, or planning loop.

---

## Use it inside your own agent

The shape that pays the most: call `run()` at decision points inside a larger agent loop.

```ts
// inside your planning / coding / review agent
if (agentIsAtADecisionPoint) {
  const { shortlist, nonObviousPick, traps, deepened } = await run({
    problem: framedDecision,
    context: relevantCode,
    framesPerRun: 4,
    topK: 2,
  });
  // feed the deepened sketches back into your agent's context
}
```

Good moments to call it:
- agent stuck after N attempts on a bug — widen the hypothesis space
- planning agent at a branch point with high uncertainty
- code-review agent asked *"what could go wrong here"*
- refactor agent picking which abstraction to introduce

---

## Evals

This project ships with a reproducible eval suite that compares the Oblique Strategies loop head-to-head against a single-shot baseline across a set of open-ended engineering problems. An LLM-as-judge with a skeptical-staff-engineer system prompt scores both outputs on five dimensions — **breadth**, **novelty**, **trap detection**, **actionability**, **builder usefulness** — and declares a winner. A/B order is randomized per problem to balance positional bias.

```bash
npm run evals          # full suite (~6 problems, ~10 LLM calls each)
npm run evals:quick    # first 2 problems
npm run evals -- --problem lru-100ms   # one specific problem
```

Output: [`EVALS.md`](./EVALS.md) (human-readable verdicts + aggregate table) and `bench/results.json` (full transcripts).

The eval suite is **local only**. Reproducible numbers come from `npm run evals` on your machine; commit the resulting `EVALS.md` if you want to update the repo's published figures.

Adding a new problem is a 4-line change to [`bench/problems.json`](./bench/problems.json) — see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT License.

---

## Credits

The Oblique Strategies are © 1975–2015 **Brian Eno and Peter Schmidt**; the full compiled deck used here is from the [Office of Kristian Bjørnard](https://oblique.ookb.co/). The parallel-divergent-ideation loop (isolated branches, mechanical generator/critic split, frame-driven branching) is adapted from the [ADHD skill by UditAkhourii](https://github.com/UditAkhourii/adhd) — this fork swaps its cognitive-frame library for the Oblique Strategies deck and makes the skill explicit-trigger only.
