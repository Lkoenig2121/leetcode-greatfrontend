import type { CaseResult } from "../../lib/types";
import type { JudgeOutcome } from "../judge";
import { runInSandbox } from "../sandbox";
import { previewJson } from "../problems";
import type { FrontendDef, JsCase } from "./types";
import { judgeUi } from "./ui-judge";

function prepareJs(code: string, functionName: string): string {
  let src = code.replace(/^import\s+[^;]+;?\s*/gm, "");
  src = src.replace(/export\s+default\s+function\s+(\w+)/, "function $1");
  src = src.replace(/export\s+default\s+/, `const ${functionName} = `);
  return src;
}

async function judgeJs(def: FrontendDef, code: string, cases: JsCase[], stopOnFail: boolean): Promise<JudgeOutcome> {
  const functionName = def.functionName ?? "solve";
  const prepared = prepareJs(code, functionName);
  const results: CaseResult[] = [];
  const started = Date.now();

  for (let i = 0; i < cases.length; i++) {
    const test = cases[i];
    const calls = test.calls ?? 0;
    const wrapped = `${prepared}

function __harness() {
  const impl = ${functionName};
  if (typeof impl !== "function") throw new ReferenceError('${functionName} is not a function');
  const inner = impl.apply(null, ${JSON.stringify(test.args)});
  if (${calls} && typeof inner === "function") {
    const acc = [];
    for (let i = 0; i < ${calls}; i++) acc.push(inner());
    return acc;
  }
  return inner;
}
`;
    const reply = await runInSandbox({
      code: wrapped,
      functionName: "__harness",
      tests: [{ args: [], expected: JSON.stringify(test.expected) }],
      compare: "exact",
      inPlace: false,
      stopOnFail: true,
    });

    if (reply.kind !== "done") {
      results.push({
        index: i,
        passed: false,
        inputs: test.args.map((value, n) => ({ name: `arg${n}`, value: previewJson(JSON.stringify(value)) })),
        expected: previewJson(JSON.stringify(test.expected)),
        output: null,
        stdout: reply.stdout,
        error: reply.message,
        timeMs: 0,
      });
      if (stopOnFail) break;
      continue;
    }

    const r = reply.results[0];
    results.push({
      index: i,
      passed: r.passed,
      inputs: test.args.map((value, n) => ({ name: `arg${n}`, value: previewJson(JSON.stringify(value)) })),
      expected: previewJson(JSON.stringify(test.expected)),
      output: r.output === null ? null : previewJson(r.output),
      stdout: r.stdout,
      error: r.error,
      timeMs: r.timeMs,
    });
    if (!r.passed && stopOnFail) break;
  }

  const passed = results.filter((c) => c.passed).length;
  const failed = results.find((c) => !c.passed);
  let status: JudgeOutcome["status"] = "Accepted";
  let message: string | null = null;
  if (failed) {
    if (failed.error && /timed out/i.test(failed.error)) status = "Time Limit Exceeded";
    else if (failed.error && /Syntax|Compile/.test(failed.error)) status = "Compile Error";
    else if (failed.error) status = "Runtime Error";
    else status = "Wrong Answer";
    message = failed.error;
  }

  return {
    status,
    message,
    cases: results,
    passed,
    total: cases.length,
    runtimeMs: Math.max(1, Date.now() - started),
    stdout: results.at(-1)?.stdout ?? "",
  };
}

export async function judgeFrontend(
  def: FrontendDef,
  code: string,
  options: { visibleOnly: boolean; stopOnFail: boolean },
): Promise<JudgeOutcome> {
  if (def.kind === "ui") {
    const scenarios = (def.uiScenarios ?? []).filter((s) => (options.visibleOnly ? s.visible : true));
    return judgeUi(def, code, scenarios, options.stopOnFail);
  }
  const cases = (def.jsCases ?? []).filter((c) => (options.visibleOnly ? c.visible : true));
  return judgeJs(def, code, cases, options.stopOnFail);
}
