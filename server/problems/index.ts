import type { ExampleCase, ProblemDetail } from "../../lib/types";
import { runInSandbox } from "../sandbox";
import { easyProblems } from "./easy";
import { hardProblems } from "./hard";
import { mediumProblems } from "./medium";
import { allStarters, buildStarterCode, ensureHints } from "./starters";
import type { LoadedProblem, LoadedTestCase, ProblemDef } from "./types";

export { buildStarterCode } from "./starters";

export const problemDefs: ProblemDef[] = [...easyProblems, ...mediumProblems, ...hardProblems].sort(
  (a, b) => a.id - b.id,
);

let cache: Promise<LoadedProblem[]> | null = null;

/**
 * Builds the full test list for every problem. Example expectations are written
 * by hand (and re-verified by `pnpm verify:problems`); hidden expectations are
 * produced by running the reference solution once at startup.
 */
export function loadProblems(): Promise<LoadedProblem[]> {
  cache ??= Promise.all(problemDefs.map(loadProblem));
  return cache;
}

async function loadProblem(def: ProblemDef): Promise<LoadedProblem> {
  const exampleTests: LoadedTestCase[] = def.examples.map(([args, expected, explanation]) => ({
    args,
    expected: JSON.stringify(expected),
    visible: true,
    explanation,
  }));

  let hiddenTests: LoadedTestCase[] = [];
  if (def.hidden.length > 0) {
    const reply = await runInSandbox({
      code: def.reference,
      functionName: def.functionName,
      tests: def.hidden.map((args) => ({ args, expected: "null" })),
      compare: def.compare ?? "exact",
      inPlace: def.inPlace ?? false,
      stopOnFail: false,
      caseTimeoutMs: 5_000,
      totalTimeoutMs: 30_000,
    });
    if (reply.kind !== "done") {
      throw new Error(`Reference for "${def.slug}" failed to run: ${reply.message}`);
    }
    hiddenTests = reply.results.map((result, i) => {
      if (result.error !== null || result.output === null) {
        throw new Error(`Reference for "${def.slug}" threw on hidden case ${i}: ${result.error}`);
      }
      return { args: def.hidden[i], expected: result.output, visible: false };
    });
  }

  return { ...def, tests: [...exampleTests, ...hiddenTests] };
}

export function toExampleCases(problem: LoadedProblem): ExampleCase[] {
  return problem.tests
    .filter((t) => t.visible)
    .map((t) => ({
      inputs: labelInputs(problem, t.args),
      expected: t.expected,
      explanation: t.explanation,
    }));
}

export function labelInputs(problem: ProblemDef, args: unknown[]): { name: string; value: string }[] {
  return problem.signature.map(([name], i) => ({ name, value: previewJson(JSON.stringify(args[i])) }));
}

/** Keeps giant hidden inputs from flooding the UI. */
export function previewJson(json: string | undefined, max = 600): string {
  if (json === undefined) return "undefined";
  return json.length > max ? `${json.slice(0, max)}… (${json.length.toLocaleString()} chars)` : json;
}

export function toProblemDetail(
  problem: LoadedProblem,
  extra: { status: ProblemDetail["status"]; acceptance: number },
): ProblemDetail {
  return {
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    tags: problem.tags,
    status: extra.status,
    acceptance: extra.acceptance,
    description: problem.description,
    constraints: problem.constraints,
    hints: ensureHints(problem),
    functionName: problem.functionName,
    params: problem.signature.map(([name]) => name),
    starterCode: buildStarterCode(problem, "javascript"),
    starters: allStarters(problem),
    examples: toExampleCases(problem),
    totalTestCases: problem.tests.length,
  };
}
