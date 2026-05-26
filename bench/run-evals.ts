#!/usr/bin/env node
// Eval runner. Compares the Oblique Strategies loop vs a single-shot baseline
// across a problem set, scores both with an LLM-as-judge, writes EVALS.md with
// verdicts + aggregates.
//
// Usage:
//   npx tsx bench/run-evals.ts                  # full suite
//   npx tsx bench/run-evals.ts --problem lru-100ms
//   npx tsx bench/run-evals.ts --quick          # only first 2 problems
//
// Order of A/B in the prompt is randomized per problem to balance positional
// bias; the mapping is recorded so aggregates can be computed correctly.

import { readFileSync, writeFileSync } from "node:fs";
import { run } from "../src/index.js";
import { renderText } from "../src/render.js";
import { callLLM } from "../src/llm.js";
import { judge, type Verdict } from "./judge.js";

type Problem = { id: string; category: string; problem: string };

const BASELINE_SYSTEM =
  "You are a thoughtful senior engineer. When asked to ideate on a problem, " +
  "give a useful answer with multiple approaches, tradeoffs, and a recommendation. " +
  "Be substantive but not bloated.";

async function baseline(problem: string): Promise<string> {
  return callLLM({
    systemPrompt: BASELINE_SYSTEM,
    userPrompt: `Ideate on this engineering problem:\n\n${problem}\n\nGive the user a useful answer.`,
  });
}

async function oblique(problem: string): Promise<string> {
  const result = await run({
    problem,
    framesPerRun: 5,
    ideasPerFrame: 6,
    topK: 3,
    concurrency: 4,
    onEvent: () => {},
  });
  // Strip ANSI for the judge — color codes are noise to the model.
  return renderText(result).replace(/\x1b\[[0-9;]*m/g, "");
}

type RowResult = {
  problemId: string;
  category: string;
  problem: string;
  swapped: boolean;            // if true, A=baseline, B=oblique; else A=oblique, B=baseline
  baselineOutput: string;
  obliqueOutput: string;
  verdict: Verdict;
};

function getArg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

async function main() {
  // --report-only: re-emit EVALS.md from the cached bench/results.json without
  // running any LLM calls. Use after editing the report format or the ADHD
  // reference constants.
  if (hasFlag("--report-only")) {
    const cached: RowResult[] = JSON.parse(readFileSync("bench/results.json", "utf8"));
    writeReport(cached);
    console.error(`✓ regenerated EVALS.md from bench/results.json (${cached.length} problems, no LLM calls)`);
    return;
  }

  const allProblems: Problem[] = JSON.parse(
    readFileSync(new URL("./problems.json", import.meta.url), "utf8"),
  );

  const onlyId = getArg("--problem");
  const quick = hasFlag("--quick");
  let problems = onlyId ? allProblems.filter((p) => p.id === onlyId) : allProblems;
  if (quick) problems = problems.slice(0, 2);

  console.error(`▸ running ${problems.length} eval(s)`);

  const rows: RowResult[] = [];
  for (const p of problems) {
    console.error(`\n— ${p.id} (${p.category})`);

    console.error("  · generating baseline…");
    const baselineOutput = await baseline(p.problem);

    console.error("  · generating Oblique Strategies…");
    const obliqueOutput = await oblique(p.problem);

    // Randomize A/B order so the judge's positional bias is balanced.
    const swapped = Math.random() < 0.5;
    const outA = swapped ? baselineOutput : obliqueOutput;
    const outB = swapped ? obliqueOutput : baselineOutput;

    console.error("  · judging…");
    const verdict = await judge(p.problem, outA, outB);

    rows.push({
      problemId: p.id,
      category: p.category,
      problem: p.problem,
      swapped,
      baselineOutput,
      obliqueOutput,
      verdict,
    });

    const obliqueLabel = swapped ? "B" : "A";
    const baseLabel = swapped ? "A" : "B";
    const obliqueWon =
      verdict.overall_winner === obliqueLabel ? "Oblique Strategies wins" :
      verdict.overall_winner === baseLabel ? "baseline wins" : "tie";
    console.error(`  → ${obliqueWon} :: ${verdict.one_line_summary}`);
  }

  writeReport(rows);
  writeJson(rows);
  console.error(`\n✓ wrote EVALS.md + bench/results.json`);
}

function obliqueScore(r: RowResult, dim: keyof Verdict): number {
  const v = r.verdict[dim] as { a: number; b: number };
  return r.swapped ? v.b : v.a;
}
function baselineScore(r: RowResult, dim: keyof Verdict): number {
  const v = r.verdict[dim] as { a: number; b: number };
  return r.swapped ? v.a : v.b;
}
function obliqueWon(r: RowResult): "win" | "loss" | "tie" {
  const obliqueLabel = r.swapped ? "B" : "A";
  const baseLabel = r.swapped ? "A" : "B";
  if (r.verdict.overall_winner === obliqueLabel) return "win";
  if (r.verdict.overall_winner === baseLabel) return "loss";
  return "tie";
}

// Reference figures from the original ADHD skill — the 15-frame cognitive-frame
// library this fork replaced — measured on this same 6-problem suite with the
// same judge rubric, in a dedicated re-run on upstream (UditAkhourii/adhd).
// Stored as historical constants (not recomputed from this run's transcripts)
// so every regeneration re-emits the Oblique-vs-ADHD comparison below. `method`
// and `baseline` are mean method/baseline scores per dimension; `perProblem`
// holds that run's ADHD method score per problem per dimension. To refresh,
// re-run upstream's `bench/run-evals.ts` and paste the new numbers here.
const ADHD_REFERENCE = {
  label: "ADHD (original 15-frame library)",
  wlt: "6W / 0L / 0T",
  source: "dedicated re-run on UditAkhourii/adhd (upstream), same 6-problem suite & rubric",
  method: { breadth: 8.67, novelty: 7.00, trap_detection: 8.83, actionability: 7.83, builder_usefulness: 7.17 },
  baseline: { breadth: 5.83, novelty: 3.50, trap_detection: 1.50, actionability: 6.50, builder_usefulness: 6.33 },
  perProblem: {
    "lru-100ms": { breadth: 9, novelty: 7, trap_detection: 9, actionability: 8, builder_usefulness: 7 },
    "llm-hang-cli": { breadth: 9, novelty: 7, trap_detection: 9, actionability: 8, builder_usefulness: 8 },
    "rate-limit-leader": { breadth: 9, novelty: 8, trap_detection: 9, actionability: 8, builder_usefulness: 8 },
    "fuzzy-bug": { breadth: 8, novelty: 7, trap_detection: 9, actionability: 8, builder_usefulness: 7 },
    "monolith-split": { breadth: 9, novelty: 7, trap_detection: 8, actionability: 7, builder_usefulness: 6 },
    "naming-feature-flag": { breadth: 8, novelty: 6, trap_detection: 9, actionability: 8, builder_usefulness: 7 },
  } as Record<string, Record<string, number>>,
};

function writeReport(rows: RowResult[]) {
  const dims = ["breadth", "novelty", "trap_detection", "actionability", "builder_usefulness"] as const;

  const meanOblique = Object.fromEntries(
    dims.map((d) => [d, rows.reduce((s, r) => s + obliqueScore(r, d), 0) / rows.length]),
  ) as Record<(typeof dims)[number], number>;
  const meanBase = Object.fromEntries(
    dims.map((d) => [d, rows.reduce((s, r) => s + baselineScore(r, d), 0) / rows.length]),
  ) as Record<(typeof dims)[number], number>;

  const wins = rows.filter((r) => obliqueWon(r) === "win").length;
  const losses = rows.filter((r) => obliqueWon(r) === "loss").length;
  const ties = rows.filter((r) => obliqueWon(r) === "tie").length;

  const fmt = (n: number) => n.toFixed(2);
  const delta = (a: number, b: number) => {
    const d = a - b;
    return (d >= 0 ? "+" : "") + fmt(d);
  };

  const lines: string[] = [];
  lines.push(`# Oblique Strategies vs baseline — evals`);
  lines.push("");
  lines.push(`Run: ${new Date().toISOString()} · problems: ${rows.length}`);
  lines.push("");
  lines.push(`**Headline:** Oblique Strategies ${wins}W / ${losses}L / ${ties}T vs single-shot baseline.`);
  lines.push("");
  lines.push(`## Aggregate scores (mean across problems, 0–10)`);
  lines.push("");
  lines.push(`| Dimension | Oblique | Baseline | Δ |`);
  lines.push(`| --- | ---: | ---: | ---: |`);
  for (const d of dims) {
    lines.push(`| ${d} | ${fmt(meanOblique[d])} | ${fmt(meanBase[d])} | ${delta(meanOblique[d], meanBase[d])} |`);
  }
  lines.push("");

  // Comparison vs the original ADHD skill (historical reference figures).
  lines.push(`## Comparison: Oblique Strategies vs the original ADHD skill`);
  lines.push("");
  lines.push(`Both swept their own single-shot baseline (Oblique ${wins}W / ${losses}L / ${ties}T · ADHD ${ADHD_REFERENCE.wlt}). The fair read is each method's **lift over its own freshly-generated baseline** (Δ), since the two runs used separate baseline and judge calls.`);
  lines.push("");
  lines.push(`| Dimension | Oblique (Δ vs base) | ADHD (Δ vs base) |`);
  lines.push(`| --- | ---: | ---: |`);
  for (const d of dims) {
    const oMethod = fmt(meanOblique[d]);
    const oDelta = delta(meanOblique[d], meanBase[d]);
    const aMethod = fmt(ADHD_REFERENCE.method[d]);
    const aDelta = delta(ADHD_REFERENCE.method[d], ADHD_REFERENCE.baseline[d]);
    lines.push(`| ${d} | ${oMethod} (${oDelta}) | ${aMethod} (${aDelta}) |`);
  }
  lines.push("");
  lines.push(`_ADHD reference: ${ADHD_REFERENCE.source}. The two runs' baselines were close (within ~0.5/dimension), so the method comparison is reasonably fair. Caveat: n=1 per problem with a stochastic baseline + judge — treat sub-point gaps as noise. Re-running \`npm run evals\` regenerates the Oblique figures and re-emits this table from the stored ADHD constants._`);
  lines.push("");

  lines.push(`## Per-problem verdicts`);
  lines.push("");
  lines.push(`_The **ADHD** column is the method score for the same problem from the separate ADHD reference run (its own baseline + judge call); \`Oblique\`, \`base\`, and the verdict/reason are from this run._`);
  lines.push("");
  for (const r of rows) {
    const winner = obliqueWon(r) === "win" ? "✓ Oblique" : obliqueWon(r) === "loss" ? "✗ baseline" : "= tie";
    lines.push(`### ${r.problemId} — ${winner}`);
    lines.push(`_${r.category} · A/B order swapped: ${r.swapped}_`);
    lines.push("");
    lines.push(`> ${r.problem}`);
    lines.push("");
    lines.push(`**Verdict:** ${r.verdict.one_line_summary}`);
    lines.push("");
    lines.push(`| dim | Oblique | base | ADHD | reason |`);
    lines.push(`| --- | ---: | ---: | ---: | --- |`);
    for (const d of dims) {
      const reason = (r.verdict[d] as { reason: string }).reason.replace(/\|/g, "\\|");
      const adhd = ADHD_REFERENCE.perProblem[r.problemId]?.[d];
      const adhdCell = adhd === undefined ? "—" : String(adhd);
      lines.push(`| ${d} | ${obliqueScore(r, d)} | ${baselineScore(r, d)} | ${adhdCell} | ${reason} |`);
    }
    lines.push("");
  }
  lines.push("---");
  lines.push("");
  lines.push(`_Methodology: each problem run through the Oblique Strategies loop (5 cards drawn at random × 6 ideas, top-3 deepened) and a single-shot baseline using the same model. A/B order randomized per problem to balance positional bias. Judged by a separate LLM call with a skeptical-staff-engineer system prompt._`);
  lines.push("");
  lines.push(`_Full transcripts: see \`bench/results.json\`._`);

  writeFileSync("EVALS.md", lines.join("\n"));
}

function writeJson(rows: RowResult[]) {
  writeFileSync("bench/results.json", JSON.stringify(rows, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
