#!/usr/bin/env node
// CLI surface for oblique-strategies.
//
// Usage:
//   oblique-strategies "how should we shard this queue?"
//   oblique-strategies "..." --frames 6 --ideas 8 --top 4 --context ./CONTEXT.md
//   oblique-strategies "..." --json > result.json

import { readFileSync } from "node:fs";
import { run } from "./engine.js";
import { renderText } from "./render.js";
import type { RunEvent, RunOptions } from "./types.js";

type Flags = {
  problem: string;
  context?: string;
  frames?: number;
  ideas?: number;
  top?: number;
  concurrency?: number;
  json: boolean;
  quiet: boolean;
  model?: string;
};

function parse(argv: string[]): Flags {
  const f: Flags = { problem: "", json: false, quiet: false };
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--frames": f.frames = Number(argv[++i]); break;
      case "--ideas": f.ideas = Number(argv[++i]); break;
      case "--top": f.top = Number(argv[++i]); break;
      case "--concurrency": f.concurrency = Number(argv[++i]); break;
      case "--context": f.context = readFileSync(argv[++i], "utf8"); break;
      case "--model": f.model = argv[++i]; break;
      case "--json": f.json = true; break;
      case "--quiet": f.quiet = true; break;
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
      default:
        rest.push(a);
    }
  }
  f.problem = rest.join(" ").trim();
  return f;
}

function printHelp() {
  console.log(`oblique-strategies — divergent ideation for coding agents

  Stop your agent from picking the first answer. Fans out many parallel
  divergent thoughts, each drawn under one of Brian Eno & Peter Schmidt's
  211 Oblique Strategies, scores them, prunes traps, and deepens the
  survivors. Tree-of-thought with pruning, built on the Claude Agent SDK.

USAGE
  oblique-strategies "<problem>" [flags]      (alias: oblique)

FLAGS
  --frames N        number of parallel divergence branches / cards (default 5)
  --ideas N         ideas per branch (default 6)
  --top N           how many to deepen / focus on (default 3)
  --concurrency N   max parallel LLM calls (default 4)
  --context PATH    file to inject as context (code, constraints, stack)
  --model NAME      override the SDK model
  --json            emit RunResult as JSON
  --quiet           suppress progress events
  -h, --help

EXAMPLES
  oblique-strategies "design a rate limiter that survives a leader election"
  oblique-strategies "name this function" --frames 3 --ideas 8 --top 2
  oblique-strategies "..." --context ./snippet.ts --json > out.json
`);
}

async function main() {
  const flags = parse(process.argv.slice(2));
  if (!flags.problem) { printHelp(); process.exit(1); }

  const onEvent = flags.quiet ? undefined : (e: RunEvent) => {
    switch (e.kind) {
      case "frame:start": process.stderr.write(`  ▸ ${e.frameLabel}…\n`); break;
      case "frame:done":  process.stderr.write(`    ${e.count} ideas (${e.frameId})\n`); break;
      case "score:done":  process.stderr.write(`  scored ${e.total} ideas\n`); break;
      case "cluster:done":process.stderr.write(`  ${e.clusters} clusters\n`); break;
      case "deepen:start":process.stderr.write(`  ◎ focus → ${e.text}\n`); break;
      case "warn":        process.stderr.write(`  ! ${e.message}\n`); break;
    }
  };

  const opts: RunOptions = {
    problem: flags.problem,
    context: flags.context,
    framesPerRun: flags.frames,
    ideasPerFrame: flags.ideas,
    topK: flags.top,
    concurrency: flags.concurrency,
    model: flags.model,
    onEvent,
  };

  const result = await run(opts);

  if (flags.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } else {
    process.stdout.write(renderText(result) + "\n");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
