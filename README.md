<p align="center">
  <a href="https://adhdstack.github.io/">
    <img src="docs/hero.png" alt="ADHD for Claude Code" width="100%">
  </a>
</p>

# ADHD — a skill for agents

[![CI](https://github.com/UditAkhourii/adhd/actions/workflows/ci.yml/badge.svg)](https://github.com/UditAkhourii/adhd/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/adhd-agent.svg)](https://www.npmjs.com/package/adhd-agent)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](#install)
[![Paper](https://img.shields.io/badge/paper-preprint-blueviolet)](https://adhdstack.github.io/)

> **Stop your agent from picking the first answer.**

📄 **Read the preprint:** [ADHD: Parallel Divergent Ideation for Coding Agents](https://adhdstack.github.io/)

ADHD is a drop-in skill and library that makes coding agents think *wide before deep*. It fans out many parallel divergent thoughts under deliberately different cognitive frames (regulator, speedrunner, ant colony, 3am on-call, $0 budget, infinite budget), scores every leaf, prunes the traps, and **deepens only the survivors**.

Like Steve Jobs' *connecting the dots* — but the dots get generated under deliberate cognitive distortion first, in parallel, with the critic switched off, before any of them are evaluated.

It is the no-brainer skill to reach for on **creative work, interdisciplinary work, design decisions, fuzzy debugging, naming, API surface design, strategy, positioning, and any prompt of the shape *"give me a few ways to…"***.

Ships three ways: as an **agent skill** ([`skills/adhd/SKILL.md`](./skills/adhd/SKILL.md), drop-in via `npx skills add UditAkhourii/adhd`, works in Claude Code, Cursor, Antigravity, Codex, and ~50 more), as a **Node/TS library** ([`adhd-agent`](https://www.npmjs.com/package/adhd-agent) on npm), and as a **CLI** (`adhd "your problem here"`). The library and CLI are built on the [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk).

---

## Install

### One command, every agent

```bash
npx skills add UditAkhourii/adhd
```

That is it. The [`skills`](https://github.com/vercel-labs/skills) CLI detects which agent you are using and drops [`skills/adhd/SKILL.md`](./skills/adhd/SKILL.md) into the right place. Supports **Claude Code, Claude.ai, Antigravity, Cursor, Codex, Cline, Continue, Aider, Gemini CLI, Windsurf, Cody, Roo, Augment, OpenCode, Kilo, Kimi, Qwen, Trae, Replit, Warp**, and ~40 more.

Restart your agent. The skill auto-triggers on brainstorm, ideate, design, naming, refactor, and "give me a few ways to" intents. Or invoke it explicitly: `/adhd "design a rate limiter that survives a leader election"`.

Useful flags:

```bash
npx skills add UditAkhourii/adhd -g            # install globally instead of per-project
npx skills add UditAkhourii/adhd -a claude-code -a cursor   # target specific agents
npx skills add UditAkhourii/adhd --copy        # copy files instead of symlinking
npx skills add UditAkhourii/adhd --list        # see what skills the repo offers
```

### Manual install (if you do not have npx)

The skill file is at [`skills/adhd/SKILL.md`](./skills/adhd/SKILL.md). Curl it into your agent's skill directory:

```bash
# Claude Code (global)
mkdir -p ~/.claude/skills/adhd
curl -fsSL https://raw.githubusercontent.com/UditAkhourii/adhd/main/skills/adhd/SKILL.md \
  -o ~/.claude/skills/adhd/SKILL.md

# Claude Code (per-project)
mkdir -p .claude/skills/adhd
curl -fsSL https://raw.githubusercontent.com/UditAkhourii/adhd/main/skills/adhd/SKILL.md \
  -o .claude/skills/adhd/SKILL.md

# Cursor (project rules)
curl -fsSL https://raw.githubusercontent.com/UditAkhourii/adhd/main/skills/adhd/SKILL.md >> .cursorrules
```

For **Claude.ai web/desktop**: open project settings → **Skills** → **Add skill** → upload [`skills/adhd/SKILL.md`](./skills/adhd/SKILL.md).

For **Cline, Continue, Aider, Roo Code, and other agents**: paste the body of [`SKILL.md`](./skills/adhd/SKILL.md) (skip the YAML frontmatter) into your agent's system prompt or rules field.

### Programmatic install (Agent SDK)

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";
import { readFileSync } from "node:fs";

const skill = readFileSync("./skills/adhd/SKILL.md", "utf8");

for await (const m of query({
  prompt: "design a retry strategy for a CLI whose LLM hangs for 90s",
  options: {
    systemPrompt: { type: "preset", preset: "claude_code", append: skill },
    allowedTools: ["Task"],
  },
})) {
  // …
}
```

### As a CLI (terminal usage, no agent needed)

```bash
npm install -g adhd-agent
adhd "design a rate limiter that survives a leader election"
```

Auth: picks up `ANTHROPIC_API_KEY` from the environment, or inherits auth from a local Claude Code install.

### As a library (inside your own agent)

```bash
npm install adhd-agent
```

```ts
import { run } from "adhd-agent";
const result = await run({ problem: "...", framesPerRun: 5, topK: 3 });
```

### From source

```bash
git clone https://github.com/UditAkhourii/adhd.git
cd adhd && npm install && npm run build
```

---

## Quickstart

### CLI

```bash
adhd "design a rate limiter that survives a leader election"

adhd "name this function" --frames 3 --ideas 8 --top 2

adhd "we have a CLI that hangs for 90s on LLM calls. what's the right retry/UX?" \
    --frames 5 --ideas 6 --top 3 --context ./client.ts

adhd "..." --json > result.json
```

### Library

```ts
import { run, renderText } from "adhd-agent";

const result = await run({
  problem: "How should we shard this queue under bursty load?",
  context: readFileSync("./queue.ts", "utf8"),
  framesPerRun: 6,
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

## What ADHD actually is

A two-phase loop with a hard wall between the phases. Mixing them is what kills idea quality, because the critic strangles the generator.

### Phase 1 — Diverge (ADHD mode)

Pick N **cognitive frames** from the frame library. Spawn N **parallel** Agent SDK queries, each one a fresh isolated session.

Each branch sees:
- the problem
- *one* frame's vantage prompt (e.g. *"You think in latency, memory layout, and physical constraints. Re-ask this as a hardware problem."*)
- a system prompt that **forbids evaluation, ranking, or hedging** — pure generation, JSON array out, no prose.

Critically: branches **do not see each other**. The "regulator" branch never reads what the "speedrunner" branch wrote. No anchoring, no shared context, no convergence pressure.

### Phase 2 — Focus

Now the critic comes back online. Three passes:

1. **Score** every leaf on `novelty / viability / fit`. Tag traps with reasons.
2. **Cluster** by underlying angle, not surface keywords ("remove-the-server plays", "cache-shaped plays") — surfaces the *shape* of the space.
3. **Deepen** top-K: sketch how it works, name the load-bearing risk, name the first concrete step, generate 3–5 child ideas (variations, hybrids, unlocks).

Output:
- the wide set, clustered
- a 2–4 idea shortlist
- the **non-obvious-but-viable pick** flagged explicitly
- the trap list, each trap with the reason it's a trap
- the deepened branches — the "connected dots"
- one provocation (a wildcard question)

---

## How ADHD is different from Chain-of-Thought (and Tree-of-Thought)

Easy to conflate. They are structurally different.

| | Chain-of-Thought | Tree-of-Thought | **ADHD** |
|---|---|---|---|
| **Threads** | one, linear | one tree, walked | **N parallel, isolated** |
| **Branches share context** | yes | yes (one session) | **no — each branch is its own `query()`** |
| **Generator vs critic** | same step | same model, alternating | **separated phases, separate LLM calls, opposite system prompts** |
| **Branching driver** | none | next-step variations | **cognitive frames** — re-ask the *whole question* from a different vantage point |
| **Parallelism** | sequential | mostly sequential | **true concurrent API calls** |
| **Goal** | correct reasoning | find a solving path | **escape premature convergence; surface non-obvious viable options** |
| **Right for** | math, multi-step logic | search, planning, puzzles | **open-ended design & ideation** |

### The three load-bearing differences

**1. Isolation, not search.**
CoT and ToT branches share a context window — by step 4, the model has anchored on what it wrote in steps 1–3. ADHD branches **never see each other** during divergence. Anchoring is eliminated by construction, not by prompting.

**2. Frames, not next-step variation.**
ToT branches typically vary the next move ("try this number / try that number"). ADHD varies the *entire vantage point of the generator*. It's not "what's the next step from here," it's *"re-ask the whole question as if you were an immune system."* That produces structurally different ideas, not nearby ones — which is what interdisciplinary work needs.

**3. Generator–critic split is mechanical, not promised.**
In CoT and ToT, the model evaluates as it goes. ADHD makes divergence its own LLM call with a system prompt that *forbids* evaluation. Convergence is a separate call with the opposite posture. Two postures, two passes, mutually exclusive.

### One-sentence version

> CoT makes one head think slower. ToT makes one head search wider. **ADHD makes many heads think differently, in parallel, then has a critic pick.**

### Pop-sci version

> CoT is one careful person reasoning aloud. ToT is one person playing chess looking N moves ahead. **ADHD is a brainstorm room with a hardware engineer, a regulator, a 10-year-old, and a speedrunner in it — then a separate room with the editor.**

### Where it overlaps with ToT

ADHD *is* a tree-of-thought variant: the deepen pass literally expands top-K nodes. What's new is **what drives the branching** (frames, not next-step) and **how the generator/critic split is enforced** (separate LLM calls, separate system prompts, zero shared context during divergence).

---

## Why this is the no-brainer skill for creative and interdisciplinary work

Creative and cross-domain work is exactly the regime where premature convergence costs the most.

- The right answer is often **not in any one domain's playbook** — you need to *transplant* a mechanism. ADHD's cross-domain frames (biology, logistics, game design, markets) do this on purpose.
- The textbook answer is usually a **trap** — it looks right because it's familiar. ADHD's separate critic pass flags traps with named reasons, not just "could be risky."
- The interesting ideas live in the **awkward middle** — past the first 3, before the absurd. Single-pass generation never gets there because each token is biased by the previous one. Parallel isolated branches do.
- You don't always know **what good looks like** yet. ADHD's cluster pass surfaces the *shape* of the design space so you can argue at the angle level, not idea-by-idea.

In one line: **ADHD is what to reach for the moment a single-pass agent would give you a competent, forgettable answer.**

---

## Frames (the cognitive distortions)

15 built-in frames, biased toward engineering when `--code-mode` is on. Each is a vantage prompt + tags. Some examples:

- **Hardware engineer** — *"You think in latency, memory layout, physical constraints."*
- **Regulator / auditor** — *"What must be provable, traceable, refusable?"*
- **10-year-old** — *"Ignore convention. What's the naive but unencumbered approach?"*
- **Competitor trying to break it** — adversarial; ideas surface by inversion
- **Biology** — immune systems, neural plasticity, cell signaling, gut flora
- **Logistics** — queues, batching, just-in-time, hub-and-spoke, returns
- **Game design** — loops, rewards, friction, save-states, speedrun tricks
- **Markets** — auctions, futures contracts, clearing houses
- **Inversion** — ask the opposite question, then negate
- **$0 budget / infinite budget** — extremes break anchoring
- **Remove the load-bearing assumption** — what's possible if the framework / DB / network is gone?
- **Speedrunner** — glitches, skips, frame-perfect shortcuts
- **Ant colony / swarm** — no central planner, local rules, emergent behavior
- **3am on-call** — what design would let you not get paged?

Edit [`src/frames.ts`](./src/frames.ts) to add your own. A frame is 5 lines.

---

## When to use ADHD (and when not to)

**Use it for:**
- Architecture & design decisions (storage layer, sharding, auth model, queue topology, retry strategy)
- API / SDK / CLI surface design
- Fuzzy debugging — generate *hypothesis classes* you haven't considered
- Migration & refactor planning
- Naming — functions, products, services, env vars
- Code review widening — what could go wrong here, beyond the checklist
- Strategy, positioning, pricing — anywhere you'd say *"give me a few ways to…"*
- **Inside agent loops** at decision points where the cost of premature convergence is high

**Don't use it for:**
- Lookup questions
- Bug fixes with a known root cause
- Anything where the right answer is one Google away
- Inner-loop / tight latency / per-keystroke use
- Single-correct-answer problems

> One-sentence test: *If a junior would Google it and find the answer, baseline wins. If a senior would say "hm, let me think about this differently for a minute" — that's the moment ADHD replaces.*

---

## Cost & speed

Honest numbers. A default run is roughly:

- N parallel divergence calls (default 5 but can be increased to n=infinity)
- 1 scoring call
- 1 clustering call
- K deepen calls (default 3)

≈ **10 LLM calls per run**, 5–10x a single-shot baseline. Latency depends on concurrency; 30–90s wall clock is typical.

Frame it as: **$0.30 to widen a $50k architecture decision.** Don't run it on every keystroke. Run it at decision points.

---

## CLI flags

| Flag | Default | What |
| --- | --- | --- |
| `--frames N` | 5 | parallel divergence branches |
| `--ideas N` | 6 | ideas per branch |
| `--top N` | 3 | how many to deepen / focus |
| `--concurrency N` | 4 | max parallel LLM calls |
| `--context PATH` | — | inject a file as context (code, stack, constraints) |
| `--model NAME` | SDK default | override model |
| `--no-code-mode` | — | don't bias frames toward engineering |
| `--json` | — | emit machine-readable `RunResult` |
| `--quiet` | — | suppress progress events |

---

## Library API (TypeScript)

```ts
import { run, renderText, FRAMES, selectFrames } from "adhd-agent";
import type {
  RunOptions, RunResult, Idea, Branch, Cluster,
  DeepenedIdea, Score, RunEvent,
} from "adhd-agent";

type RunOptions = {
  problem: string;
  context?: string;
  framesPerRun?: number;   // default 5
  ideasPerFrame?: number;  // default 6
  topK?: number;           // default 3
  concurrency?: number;    // default 4
  codeMode?: boolean;      // default true
  model?: string;
  onEvent?: (e: RunEvent) => void;
};
```

Everything in `RunResult` is structured — clusters, scored ideas with `novelty / viability / fit`, trap reasons, deepened sketches with child ideas. You can route it into your own renderer, downstream agent, or planning loop.

---

## Use ADHD inside your own agent

The shape that pays the most: call `run()` at decision points inside a larger agent loop.

```ts
// inside your planning / coding / review agent
if (agentIsAtADecisionPoint) {
  const { shortlist, nonObviousPick, traps, deepened } = await run({
    problem: framedDecision,
    context: relevantCode,
    framesPerRun: 4,
    topK: 2,
    codeMode: true,
  });
  // feed the deepened sketches back into your agent's context
}
```

Good moments to call it:
- agent stuck after N attempts on a bug — widen the hypothesis space
- planning agent at a branch point with high uncertainty
- code-review agent asked *"what could go wrong here"*
- refactor agent picking which abstraction to introduce
- test-generation agent generating adversarial inputs (inversion frame)

---

## Evals

ADHD ships with a reproducible eval suite that compares it head-to-head against a single-shot baseline across a set of open-ended engineering problems. An LLM-as-judge with a skeptical-staff-engineer system prompt scores both outputs on five dimensions — **breadth**, **novelty**, **trap detection**, **actionability**, **builder usefulness** — and declares a winner. A/B order is randomized per problem to balance positional bias.

```bash
npm run evals          # full suite (~6 problems, ~10 LLM calls each)
npm run evals:quick    # first 2 problems
npm run evals -- --problem lru-100ms   # one specific problem
```

Output: [`EVALS.md`](./EVALS.md) (human-readable verdicts + aggregate table) and `bench/results.json` (full transcripts).

The eval suite is **local only**. There is no CI workflow for it. Reproducible numbers come from `npm run evals` on your machine; commit the resulting `EVALS.md` if you want to update the repo's published figures. The committed `EVALS.md` was generated this way.

Adding a new problem is a 4-line change to [`bench/problems.json`](./bench/problems.json) — see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Roadmap

- [ ] Recursive deepen (multi-level ToT, not just one)
- [ ] Pluggable scorers (user-defined weights, custom trap detectors)
- [ ] Frame packs (security, ML, frontend, distsys, product)
- [ ] Memory across runs — learn which frames win for which problem shapes
- [ ] Streaming output during divergence
- [ ] Cross-LLM support (frames don't depend on Claude)

---

## License

MIT License.

---

## Credits

ADHD operationalizes the *Divergent Ideation* source spec — see [SOURCE-SPEC.md](./SOURCE-SPEC.md) for the original prose. The runnable skill is at [`skills/adhd/SKILL.md`](./skills/adhd/SKILL.md).
