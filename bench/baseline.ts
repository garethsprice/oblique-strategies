// Baseline: a regular agent — single query, no card fan-out, no scoring,
// no deepening. The straightforward "ask Claude for ideas on this problem"
// that the Oblique Strategies loop is meant to outperform.

import { callLLM } from "../src/llm.js";

const problem = process.argv.slice(2).join(" ");
if (!problem) { console.error("usage: baseline.ts <problem>"); process.exit(1); }

const out = await callLLM({
  systemPrompt:
    "You are a thoughtful senior engineer. When asked to ideate on a problem, " +
    "give a useful answer with multiple approaches, tradeoffs, and a recommendation. " +
    "Be substantive but not bloated.",
  userPrompt: `Ideate on this engineering problem:\n\n${problem}\n\n` +
              `Give the user a useful answer.`,
});

console.log(out);
