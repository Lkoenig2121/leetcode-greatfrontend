import path from "node:path";
import { Worker } from "node:worker_threads";

export type CompareMode = "exact" | "unordered";

export interface SandboxCase {
  args: unknown[];
  /** JSON string of the expected return value (or the expected mutated first arg for in-place problems). */
  expected: string;
}

export interface SandboxOptions {
  code: string;
  functionName: string;
  tests: SandboxCase[];
  compare: CompareMode;
  inPlace: boolean;
  /** Stop executing after the first failing case (used by Submit). */
  stopOnFail: boolean;
  caseTimeoutMs?: number;
  totalTimeoutMs?: number;
}

export interface SandboxCaseResult {
  index: number;
  passed: boolean;
  output: string | null;
  error: string | null;
  kind: "tle" | "runtime" | null;
  stdout: string;
  timeMs: number;
}

export interface SandboxReply {
  kind: "done" | "compile" | "runtime" | "tle" | "memory";
  message: string | null;
  results: SandboxCaseResult[];
  stdout: string;
}

const WORKER_PATH = path.join(__dirname, "sandbox-worker.cjs");

export function runInSandbox(options: SandboxOptions): Promise<SandboxReply> {
  const { caseTimeoutMs = 1500, totalTimeoutMs = 10_000, ...rest } = options;

  return new Promise<SandboxReply>((resolve) => {
    let settled = false;
    const worker = new Worker(WORKER_PATH, {
      workerData: { ...rest, caseTimeoutMs },
      resourceLimits: { maxOldGenerationSizeMb: 192, maxYoungGenerationSizeMb: 32 },
    });

    const finish = (reply: SandboxReply) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      void worker.terminate();
      resolve(reply);
    };

    // Hard deadline: protects against anything the per-case vm timeout can't stop
    // (e.g. work that happens outside of vm-controlled code).
    const deadline = setTimeout(() => {
      finish({
        kind: "tle",
        message: "Time Limit Exceeded",
        results: [],
        stdout: "",
      });
    }, totalTimeoutMs);

    worker.once("message", (reply: SandboxReply) => finish(reply));
    worker.once("error", (err: Error & { code?: string }) => {
      const oom = err.code === "ERR_WORKER_OUT_OF_MEMORY";
      finish({
        kind: oom ? "memory" : "runtime",
        message: oom ? "Memory Limit Exceeded" : `${err.name}: ${err.message}`,
        results: [],
        stdout: "",
      });
    });
    worker.once("exit", () => {
      finish({
        kind: "runtime",
        message: "The runner exited unexpectedly",
        results: [],
        stdout: "",
      });
    });
  });
}
