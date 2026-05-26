# Oblique Strategies vs baseline — evals

Run: 2026-05-26T16:29:22.948Z · problems: 6

**Headline:** Oblique Strategies 6W / 0L / 0T vs single-shot baseline.

## Aggregate scores (mean across problems, 0–10)

| Dimension | Oblique | Baseline | Δ |
| --- | ---: | ---: | ---: |
| breadth | 8.83 | 5.33 | +3.50 |
| novelty | 7.33 | 3.50 | +3.83 |
| trap_detection | 9.00 | 2.00 | +7.00 |
| actionability | 8.00 | 6.17 | +1.83 |
| builder_usefulness | 7.83 | 6.17 | +1.67 |

## Comparison: Oblique Strategies vs the original ADHD skill

Both swept their own single-shot baseline (Oblique 6W / 0L / 0T · ADHD 6W / 0L / 0T). The fair read is each method's **lift over its own freshly-generated baseline** (Δ), since the two runs used separate baseline and judge calls.

| Dimension | Oblique (Δ vs base) | ADHD (Δ vs base) |
| --- | ---: | ---: |
| breadth | 8.83 (+3.50) | 8.67 (+2.84) |
| novelty | 7.33 (+3.83) | 7.00 (+3.50) |
| trap_detection | 9.00 (+7.00) | 8.83 (+7.33) |
| actionability | 8.00 (+1.83) | 7.83 (+1.33) |
| builder_usefulness | 7.83 (+1.67) | 7.17 (+0.84) |

_ADHD reference: dedicated re-run on UditAkhourii/adhd (upstream), same 6-problem suite & rubric. The two runs' baselines were close (within ~0.5/dimension), so the method comparison is reasonably fair. Caveat: n=1 per problem with a stochastic baseline + judge — treat sub-point gaps as noise. Re-running `npm run evals` regenerates the Oblique figures and re-emits this table from the stored ADHD constants._

## Per-problem verdicts

_The **ADHD** column is the method score for the same problem from the separate ADHD reference run (its own baseline + judge call); `Oblique`, `base`, and the verdict/reason are from this run._

### lru-100ms — ✓ Oblique
_systems · A/B order swapped: true_

> Design a thread-safe LRU cache that survives process restart without losing more than the last 100ms of writes.

**Verdict:** B wins on exploration breadth and exceptional trap detection; A is cleaner for immediate implementation but covers only textbook approaches.

| dim | Oblique | base | ADHD | reason |
| --- | ---: | ---: | ---: | --- |
| breadth | 9 | 6 | 9 | A covers 4 distinct approaches (WAL, mmap, embedded KV, ring buffer) which are the standard architectural patterns. B generates dozens of structurally distinct ideas across multiple categories (append-log variants, mmap plays, consistency relaxation, lock-free queues, self-describing entries), including hybrid combinations. B's breadth is genuinely wider even accounting for some ideas being variations. |
| novelty | 7 | 3 | 7 | A presents textbook solutions - WAL+snapshots, mmap, embedded KV stores are all standard patterns any senior engineer would reach for. B includes non-obvious ideas like 'warm-up stretch' lazy replay serving stale reads, fermentation buffers for write cancellation, hybrid clock timestamps for cross-boundary ordering, and adaptive pulse rates. The mycelium replication idea is wild but explicitly marked as a provocation. |
| trap_detection | 9 | 2 | 9 | A mentions a few cons per approach but doesn't explicitly call out traps. B has an extensive, dedicated 'Traps' section with 15 specific pitfalls, each with a concrete reason why it fails (e.g., 'MAP_SHARED doesn't guarantee flush timing', 'idle-only compaction may never run under sustained load'). This is exceptional trap detection. |
| actionability | 8 | 7 | 8 | A provides a code sketch and critical implementation details (dedicated sync thread, O_DIRECT, test with kill -9). B's 'Focus' section provides detailed implementation plans with explicit 'load-bearing risk' callouts and specific 'first concrete step' instructions (e.g., 'implement the double-buffer swap mechanism with a condition variable'). B edges ahead due to explicit risk identification per recommendation. |
| builder_usefulness | 7 | 7 | 7 | A is immediately usable - clean code sketch, clear recommendation, practical tips. An engineer could start building today. B is more comprehensive for exploration but the dense format and metaphor-heavy language ('massage thread', 'breathing cache') occasionally obscures rather than clarifies. The trap detection in B is extremely valuable, but A's clarity is a counterweight. Roughly equal for different reasons. |

### llm-hang-cli — ✓ Oblique
_ux/reliability · A/B order swapped: true_

> We have a CLI that calls an LLM and the LLM sometimes hangs for 90 seconds before responding. Design the right retry/timeout/UX strategy.

**Verdict:** B wins through superior breadth, systematic trap detection, and deeper exploration of non-obvious approaches, despite A being more immediately copy-paste implementable.

| dim | Oblique | base | ADHD | reason |
| --- | ---: | ---: | ---: | --- |
| breadth | 9 | 5 | 9 | A covers 4 distinct approaches (progressive timeout, hedged requests, streaming-first, circuit breaker) which are solid but fairly standard. B explores ~25+ structurally distinct ideas across 7 categories (fill-the-silence, reframe-perception, race-parallel, escape-hatch, learn-from-hangs, make-visible, tiered-escalation), including genuinely different angles like audio feedback, time-budget inversion, detach-and-notify, and checkpoint caching. |
| novelty | 7 | 4 | 7 | A's ideas are textbook patterns - progressive feedback, hedged requests, streaming, and circuit breakers are well-documented in distributed systems literature. B includes non-obvious ideas like 'network whisper' audio, LLM-relative time, time-budget inversion to the model, speculative edge-loading during wait, and the contemplation-mode reframe. Many won't work, but the creative reach is higher. |
| trap_detection | 9 | 2 | 9 | A has a brief 'What to Avoid' section with 3 obvious warnings (silent hangs, auto-retry without indication, hard timeout). B explicitly calls out 12 traps with specific technical reasons why each fails (e.g., 'LLM has no self-awareness of timing; cannot report mid-generation', 'Client cannot reliably distinguish network vs model vs queue; data not exposed by APIs'). B's trap analysis is systematic and technically grounded. |
| actionability | 8 | 7 | 8 | A provides a concrete implementation sketch with ASCII UI mockups, a parameter table, and specific thresholds. B provides detailed first-concrete-steps for each shortlisted idea (e.g., 'implement a simple timer wrapper that emits phase-change events', 'implement a simple race wrapper using Promise.race()'), names load-bearing risks explicitly, and includes branching variations. B's 'deepened branches' section adds implementation depth with specific follow-on steps. |
| builder_usefulness | 8 | 6 | 8 | A gives a clean, implementable recommendation that a junior engineer could ship. B gives a senior engineer more to work with: a menu of options with tradeoffs explicitly scored, traps to avoid, and branching paths that anticipate follow-up questions. If I were building this, B's trap list alone would save me from wasting cycles on 12 dead ends. A is more copy-paste ready; B is more think-ahead useful. |

### rate-limit-leader — ✓ Oblique
_distsys · A/B order swapped: true_

> Design a rate limiter that stays correct across a leader election. Existing leader had counters in memory; new leader takes over with no warning.

**Verdict:** A provides a solid textbook answer with Redis as the safe default; B offers a far wider exploration with novel ideas (lease-embedded state, tombstone logs), an extensive trap catalog, and deeper branch analysis that better equips a builder to make informed tradeoffs.

| dim | Oblique | base | ADHD | reason |
| --- | ---: | ---: | ---: | --- |
| breadth | 9 | 5 | 9 | A covers 5 distinct approaches (Redis, Raft, checkpointing, client-side tokens, CRDTs). B generates 30+ ideas across 6 structural categories (durable-log, client-carries-state, shrink-blast-radius, embrace-the-gap, accept-imprecision, gossip). B explores far more design dimensions including probabilistic structures, tombstone logs, lease-embedded state, and several hybrid combinations that A doesn't touch. |
| novelty | 7 | 3 | 8 | A's approaches are textbook distributed systems patterns—Redis counters, Raft replication, periodic checkpointing. These are the standard industry answers. B surfaces genuinely non-obvious ideas: encoding state in the lease/lock token itself, tombstone-based reconstruction, hierarchical sketch compaction, client-side sketch shards. The 'lock carries the memory' insight is particularly inventive. |
| trap_detection | 9 | 2 | 9 | A mentions cons for each approach but doesn't explicitly call out traps or warn against seductive-but-broken ideas. B dedicates an entire section to 17 explicitly labeled traps with specific reasons why each fails (e.g., 'Bloom filters don't support deletion—stale entries accumulate', 'Gossip convergence too slow for sub-second failover', 'Detecting lies requires the state you're trying to avoid storing'). This trap catalog is genuinely valuable for avoiding pitfalls. |
| actionability | 8 | 7 | 8 | A provides a clear recommendation (Redis + degraded fallback) with a diagram and implementation details (MULTI/EXEC, TTL settings). B's top pick (lease-embedded state) includes a concrete first step ('prototype with a single rate limit key embedded in an etcd lease's value field'), names the load-bearing risk (payload size limits), and provides branching paths. B also provides first concrete steps for the other shortlisted approaches. Both are actionable, B slightly more thorough. |
| builder_usefulness | 8 | 6 | 8 | A gives you a safe, proven path that works for most cases—useful if you want to ship quickly with minimal risk. B gives you a richer decision framework: multiple viable paths with explicit tradeoffs, hybrid combinations, and a trap catalog that prevents wasted exploration. If I'm the engineer, B helps me make a more informed architectural choice and avoid dead ends. A is more prescriptive; B is more educational while still being concrete. |

### fuzzy-bug — ✓ Oblique
_debugging · A/B order swapped: false_

> 0.1% of API requests time out intermittently. No stack trace, no obvious pattern, no recent deploy. How should we investigate? Generate hypothesis classes, not specific fixes.

**Verdict:** A provides creative investigation angles with explicit trap warnings and concrete next steps; B offers a competent but textbook enumeration of standard debugging categories.

| dim | Oblique | base | ADHD | reason |
| --- | ---: | ---: | ---: | --- |
| breadth | 8 | 6 | 8 | A explores structurally distinct angles: negative space analysis, temporal coupling, orphaned intentions, synthetic traffic masquerading as real users, near-miss analysis. B covers standard categories (resource contention, network, dependencies, request characteristics) that any experienced engineer would list. A's 'flip the frame' and 'these requests were doomed' categories introduce genuinely different investigation vectors. |
| novelty | 8 | 4 | 7 | A offers non-obvious ideas: investigating near-misses (p99.8) instead of failures, questioning whether timed-out requests were ever meant to succeed, 'orphaned intentions' hypothesis, and the meta-observation about avoiding dependency blame. B's hypotheses are textbook categories that would appear in any SRE runbook - valid but not novel. |
| trap_detection | 9 | 1 | 9 | A explicitly calls out 8 traps with specific reasons why each looks good but fails (e.g., 'replay at 100x changes timing characteristics fundamentally'). B has zero trap detection - no warnings about investigation pitfalls or attractive-but-misleading directions. |
| actionability | 8 | 5 | 8 | A's top picks include concrete first steps (e.g., 'add a tag to your metrics pipeline that flags requests based on User-Agent pattern matching'), named risks ('you spend a week optimizing for traffic that was never meant to represent real user experience'), and branching investigation paths. B provides generic investigation steps ('distributed tracing first') without specific implementation guidance or risk acknowledgment. |
| builder_usefulness | 8 | 6 | 7 | As the engineer who has to ship, A gives me investigation paths I wouldn't have thought of (near-miss analysis, synthetic traffic classification, orphaned intentions) plus explicit warnings about rabbit holes. B gives me a solid checklist I could have written myself in 10 minutes. A saves me from wasted effort; B confirms what I already suspected. |

### monolith-split — ✓ Oblique
_refactor · A/B order swapped: false_

> We have a 200k-line Rails monolith. The team wants to split it. Generate strategies for how to decompose it — by domain, data, team, churn, or otherwise.

**Verdict:** A provides substantially more creative strategies, explicit trap warnings, and actionable depth; B is a competent but conventional textbook summary.

| dim | Oblique | base | ADHD | reason |
| --- | ---: | ---: | ---: | --- |
| breadth | 9 | 5 | 9 | A explores ~30 structurally distinct strategies across 6 categories (coupling signals, operational characteristics, team dynamics, data ownership, etc.) including unconventional angles like 'emotion mapping' and 'contradiction seams'. B covers 6 standard approaches (domain-driven, data coupling, team/Conway, churn, strangler fig, Rails engines) that are textbook decomposition strategies with little structural variety. |
| novelty | 8 | 3 | 7 | A includes genuinely non-obvious ideas: FFT analysis on git churn, drawing boundaries at 'resonance points' of team collisions, semantic contradiction mapping, extracting code that violates your stated architecture. B's strategies are standard industry playbook—domain-driven, strangler fig, Conway's Law, churn analysis. These are correct but not novel; any senior engineer would list them. |
| trap_detection | 9 | 2 | 8 | A explicitly identifies 12 traps with specific reasoning (auth extraction teaches wrong lessons, admin tools extraction delays real learning, auction mechanics optimize for preference not coherence, etc.). B mentions tradeoffs in tables but never explicitly warns 'this looks good but is a trap'—tradeoffs are not trap detection. B lacks any 'don't do this even though it seems reasonable' warnings. |
| actionability | 8 | 6 | 7 | A's top picks include concrete first steps (run CodeScene for hotspot maps, grep for method definitions, use packwerk on recent commits) and name specific load-bearing risks. B provides a phased recommendation with rough timelines and a bash command for churn analysis, but the first steps are vaguer ('map your models to business domains'). A's branching strategies add depth; B stays surface-level. |
| builder_usefulness | 8 | 6 | 6 | As the engineer shipping this, A gives me multiple lenses to evaluate my specific situation (team collision data, semantic contradictions, coupling spectrums) plus explicit warnings about what will waste time. B gives me a safe, conventional playbook I could find in any architecture blog. A is more useful for making hard decisions; B is more useful as a checklist to not forget obvious options. |

### naming-feature-flag — ✓ Oblique
_naming · A/B order swapped: true_

> Generate names for a feature-flag service that supports gradual rollout, kill-switches, and per-tenant overrides. The name should signal control and reversibility.

**Verdict:** A is a competent brainstorm; B is a structured design exploration with trap detection, concrete implementation sketches, and meaningfully wider creative range.

| dim | Oblique | base | ADHD | reason |
| --- | ---: | ---: | ---: | --- |
| breadth | 9 | 5 | 8 | A explores ~15 names across 3 conceptual patterns (control/safety/gradual), all clustered around mechanical/industrial metaphors. B generates 30+ names across 6 distinct conceptual categories (gradual-progression, gate-passage, superposition, audio-mixer, kitchen, musical) with genuinely different metaphorical frames. B's range is structurally wider. |
| novelty | 7 | 4 | 6 | A's suggestions (Lever, Valve, Dimmer, Dial) are fairly obvious mechanical control metaphors—the first things most engineers would brainstorm. B surfaces non-obvious options like Crossfader (DJ mixing), Interlock (safety engineering), Rheostat (electrical), and even explores deliberately weird angles (kitchen cleanup) that could spark unexpected directions. B takes more creative risks. |
| trap_detection | 9 | 3 | 9 | A briefly mentions avoiding 'Gate' (namespace collision) and 'Switch' (generic), plus a one-liner about redundancy with 'flag'. B explicitly lists 18 trap names with specific reasons: trademark collision (Twingate), metaphor mismatch (Kindle implies irreversibility), URL problems (Pause/Play slash), tech meme fatigue (Schrodinger), etc. B's trap analysis is thorough and actionable. |
| actionability | 8 | 5 | 8 | A recommends Lever/Valve with rationale but no implementation sketch or concrete first step. B's Focus section provides detailed mental models, explicit load-bearing risks ('metaphor mismatch: users don't experience a blend'), and concrete first steps ('define the core Flag interface with fields for percentage, muted, tenantOverrides'). B even sketches API signatures like 'dimmer.intensity()' and 'dimmer.isLit()'. |
| builder_usefulness | 8 | 6 | 7 | A is clean and readable—a builder could use it to make a quick decision. But B gives a builder more: deeper exploration of why names might fail in practice, concrete API sketches, risk callouts that would surface in code review anyway, and branch ideas if the first pick doesn't work. B front-loads the thinking a builder would have to do anyway. |

---

_Methodology: each problem run through the Oblique Strategies loop (5 cards drawn at random × 6 ideas, top-3 deepened) and a single-shot baseline using the same model. A/B order randomized per problem to balance positional bias. Judged by a separate LLM call with a skeptical-staff-engineer system prompt._

_Full transcripts: see `bench/results.json`._