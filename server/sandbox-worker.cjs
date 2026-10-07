"use strict";
/**
 * Runs user submitted JavaScript against a list of test cases.
 *
 * This file runs inside a worker thread (see sandbox.ts). It is plain CommonJS so
 * it can be loaded as a Worker entry point without a TypeScript loader.
 *
 * NOTE: node:vm is NOT a security boundary. It protects against infinite loops
 * (via `timeout`) and keeps the user's globals away from the server's, but a
 * determined attacker can escape it. That is fine for a local/demo app, but do
 * not expose this to untrusted users without a real sandbox (container, isolate...).
 */
const { parentPort, workerData } = require("node:worker_threads");
const vm = require("node:vm");

const MAX_STDOUT = 4000;

function formatLogArg(value) {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";
  if (typeof value === "function") return "[Function]";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Order-insensitive canonical form: sorts arrays at every depth. */
function canon(value) {
  if (!Array.isArray(value)) return value;
  return value
    .map(canon)
    .sort((a, b) => {
      const x = JSON.stringify(a);
      const y = JSON.stringify(b);
      return x < y ? -1 : x > y ? 1 : 0;
    });
}

function normalize(json, compare) {
  const parsed = JSON.parse(json);
  return JSON.stringify(compare === "unordered" ? canon(parsed) : parsed);
}

function describeError(err) {
  if (err && typeof err === "object") {
    const name = err.name || "Error";
    const message = err.message || "";
    return message ? `${name}: ${message}` : name;
  }
  return String(err);
}

function isTimeout(err) {
  return !!err && typeof err.message === "string" && /timed out/i.test(err.message);
}

function main() {
  const { code, functionName, tests, compare, inPlace, caseTimeoutMs, stopOnFail } = workerData;

  let currentLogs = [];
  let logSize = 0;
  const push = (...args) => {
    if (logSize > MAX_STDOUT) return;
    const line = args.map(formatLogArg).join(" ");
    logSize += line.length + 1;
    currentLogs.push(line);
  };
  const sandboxConsole = { log: push, info: push, warn: push, error: push, debug: push };

  const context = vm.createContext({ console: sandboxConsole }, { name: "solution" });

  // 1) Compile + load the user's code (defines the function).
  let fn;
  try {
    const script = new vm.Script(code, { filename: "solution.js" });
    try {
      script.runInContext(context, { timeout: caseTimeoutMs });
    } catch (err) {
      parentPort.postMessage({
        kind: isTimeout(err) ? "tle" : "runtime",
        message: describeError(err),
        results: [],
        stdout: currentLogs.join("\n"),
      });
      return;
    }
    fn = vm.runInContext(
      `typeof ${functionName} === "function" ? ${functionName} : undefined`,
      context,
    );
  } catch (err) {
    parentPort.postMessage({
      kind: "compile",
      message: describeError(err),
      results: [],
      stdout: "",
    });
    return;
  }

  if (typeof fn !== "function") {
    parentPort.postMessage({
      kind: "runtime",
      message: `ReferenceError: function "${functionName}" is not defined`,
      results: [],
      stdout: "",
    });
    return;
  }

  // 2) Execute each test case.
  const results = [];
  context.__fn = fn;
  const callExpr = inPlace
    ? "(function(){var a = JSON.parse(__args); __fn.apply(null, a); return JSON.stringify(a[0]);})()"
    : "JSON.stringify(__fn.apply(null, JSON.parse(__args)))";

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    currentLogs = [];
    logSize = 0;
    context.__args = JSON.stringify(test.args);
    const started = process.hrtime.bigint();
    let output = null;
    let error = null;
    let kind = null;
    try {
      const raw = vm.runInContext(callExpr, context, { timeout: caseTimeoutMs });
      output = raw === undefined ? "undefined" : raw;
    } catch (err) {
      error = describeError(err);
      kind = isTimeout(err) ? "tle" : "runtime";
    }
    const timeMs = Number(process.hrtime.bigint() - started) / 1e6;

    let passed = false;
    if (error === null) {
      try {
        passed = output !== "undefined" && normalize(output, compare) === normalize(test.expected, compare);
      } catch {
        passed = false;
      }
    }

    results.push({
      index: i,
      passed,
      output,
      error,
      kind,
      stdout: currentLogs.join("\n"),
      timeMs,
    });

    if (!passed && stopOnFail) break;
  }

  parentPort.postMessage({ kind: "done", message: null, results, stdout: "" });
}

try {
  main();
} catch (err) {
  parentPort.postMessage({ kind: "runtime", message: describeError(err), results: [], stdout: "" });
}
