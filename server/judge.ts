import type { CaseResult, RunResult, SubmissionStatus } from "../lib/types";
import { labelInputs, previewJson } from "./problems";
import type { LoadedProblem, LoadedTestCase } from "./problems/types";
import { runInSandbox, type SandboxReply } from "./sandbox";

export interface JudgeOutcome {
  status: SubmissionStatus;
  message: string | null;
  cases: CaseResult[];
  /** Number of cases that passed (before the first failure when stopOnFail). */
  passed: number;
  total: number;
  runtimeMs: number;
  stdout: string;
}

function statusForKind(kind: SandboxReply["kind"]): SubmissionStatus {
  switch (kind) {
    case "compile":
      return "Compile Error";
    case "tle":
      return "Time Limit Exceeded";
    case "memory":
      return "Memory Limit Exceeded";
    default:
      return "Runtime Error";
  }
}

export async function judge(
  problem: LoadedProblem,
  code: string,
  tests: LoadedTestCase[],
  options: { stopOnFail: boolean },
): Promise<JudgeOutcome> {
  const reply = await runInSandbox({
    code,
    functionName: problem.functionName,
    tests: tests.map((t) => ({ args: t.args, expected: t.expected })),
    compare: problem.compare ?? "exact",
    inPlace: problem.inPlace ?? false,
    stopOnFail: options.stopOnFail,
  });

  if (reply.kind !== "done") {
    return {
      status: statusForKind(reply.kind),
      message: reply.message,
      cases: [],
      passed: 0,
      total: tests.length,
      runtimeMs: 0,
      stdout: reply.stdout,
    };
  }

  const cases: CaseResult[] = reply.results.map((r) => {
    const test = tests[r.index];
    return {
      index: r.index,
      passed: r.passed,
      inputs: labelInputs(problem, test.args),
      expected: previewJson(test.expected),
      output: r.output === null ? null : previewJson(r.output),
      stdout: r.stdout,
      error: r.error,
      timeMs: Math.round(r.timeMs * 100) / 100,
    };
  });

  const passed = cases.filter((c) => c.passed).length;
  const firstFailure = reply.results.find((r) => !r.passed);
  const runtimeMs = Math.max(1, Math.round(reply.results.reduce((sum, r) => sum + r.timeMs, 0)));

  let status: SubmissionStatus = "Accepted";
  let message: string | null = null;
  if (firstFailure) {
    if (firstFailure.kind === "tle") status = "Time Limit Exceeded";
    else if (firstFailure.kind === "runtime") status = "Runtime Error";
    else status = "Wrong Answer";
    message = firstFailure.error;
    if (!options.stopOnFail) {
      // "Run" reports the most severe problem across all displayed cases.
      const tle = reply.results.find((r) => r.kind === "tle");
      const runtime = reply.results.find((r) => r.kind === "runtime");
      if (tle) {
        status = "Time Limit Exceeded";
        message = tle.error;
      } else if (runtime) {
        status = "Runtime Error";
        message = runtime.error;
      }
    }
  }

  const lastStdout = reply.results.map((r) => r.stdout).filter(Boolean).slice(-1)[0] ?? "";

  return { status, message, cases, passed, total: tests.length, runtimeMs, stdout: lastStdout };
}

export function toRunResult(outcome: JudgeOutcome): RunResult {
  return {
    status: outcome.status,
    message: outcome.message,
    runtimeMs: outcome.runtimeMs,
    cases: outcome.cases,
  };
}
