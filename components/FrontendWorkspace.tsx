"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { difficultyClass, formatRelative, verdictColor } from "@/lib/format";
import type {
  CaseResult,
  FrontendProblemDetail,
  ProblemStatus,
  RunResult,
  SubmissionView,
  SubmitResult,
} from "@/lib/types";
import { AcceptedView, MiniAccepted } from "./AcceptedView";
import { CodeEditor } from "./CodeEditor";
import { LivePreview } from "./LivePreview";
import { Markdownish } from "./Markdownish";

type BottomTab = "tests" | "result" | "submissions";

export function FrontendWorkspace({ slug }: { slug: string }) {
  const [problem, setProblem] = useState<FrontendProblemDetail | null>(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<ProblemStatus>("todo");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<BottomTab>("tests");
  const [run, setRun] = useState<RunResult | null>(null);
  const [submit, setSubmit] = useState<SubmitResult | null>(null);
  const [history, setHistory] = useState<SubmissionView[]>([]);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hintThrows, setHintThrows] = useState(0);
  const [solution, setSolution] = useState<string | null>(null);
  const [solutionError, setSolutionError] = useState<string | null>(null);

  const codeKey = `lc-fe-code:${slug}`;

  useEffect(() => {
    let cancelled = false;
    setProblem(null);
    setRun(null);
    setSubmit(null);
    setHintThrows(0);
    setSolution(null);
    setSolutionError(null);
    setTab("tests");
    Promise.all([api.frontendProblem(slug), api.frontendSubmissions(slug)])
      .then(([p, subs]) => {
        if (cancelled) return;
        setProblem(p);
        setStatus(p.status);
        setHistory(subs);
        const saved = localStorage.getItem(codeKey);
        setCode(saved && saved.trim() ? saved : p.starterCode);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load problem");
      });
    return () => {
      cancelled = true;
    };
  }, [slug, codeKey]);

  useEffect(() => {
    if (!code || !problem) return;
    localStorage.setItem(codeKey, code);
  }, [code, codeKey, problem]);

  useEffect(() => {
    if (hintThrows < 3) return;
    let cancelled = false;
    api
      .frontendSolution(slug)
      .then((payload) => {
        if (!cancelled) {
          setSolution(payload.code);
          setSolutionError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setSolutionError(err instanceof Error ? err.message : "Could not load solution");
      });
    return () => {
      cancelled = true;
    };
  }, [hintThrows, slug]);

  const onRun = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      const result = await api.frontendRun(slug, code);
      setRun(result);
      setSubmit(null);
      setTab("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run failed");
    } finally {
      setRunning(false);
    }
  }, [slug, code]);

  const onSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.frontendSubmit(slug, code);
      setSubmit(result);
      setRun(null);
      setStatus(result.problemStatus);
      setHistory((prev) => [result.submission, ...prev]);
      setTab("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }, [slug, code]);

  if (error && !problem) return <p className="p-6 text-wrong">{error}</p>;
  if (!problem) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    );
  }

  const isUi = problem.kind === "ui";

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row">
      <section className="flex min-h-0 w-full flex-col border-b border-border lg:w-[42%] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">
              {problem.id}. {problem.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
              <span className={difficultyClass[problem.difficulty]}>{problem.difficulty}</span>
              <span className="text-muted">{isUi ? "UI" : "JavaScript"}</span>
              <StatusPill status={status} />
              <span className="text-muted">{problem.acceptance.toFixed(1)}% acceptance</span>
            </div>
          </div>
          <Link href="/dashboard/frontend" className="text-sm text-muted hover:text-foreground">
            ← List
          </Link>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
          {problem.description.map((p, i) => (
            <p key={i} className="mb-4 leading-7">
              <Markdownish text={p} />
            </p>
          ))}

          <h3 className="mb-2 text-sm font-semibold">Requirements</h3>
          <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-foreground/90">
            {problem.requirements.map((item) => (
              <li key={item}>
                <Markdownish text={item} />
              </li>
            ))}
          </ul>

          {problem.examples.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold">{isUi ? "Visible tests" : "Examples"}</h3>
              {problem.examples.map((ex, i) => (
                <pre
                  key={i}
                  className="mb-3 overflow-x-auto rounded-lg bg-surface p-3 font-mono text-[13px] leading-6 scrollbar-thin"
                >
                  {isUi ? (
                    <div>
                      <span className="text-muted">Scenario: </span>
                      {ex.inputs[0]?.value.replace(/^"|"$/g, "")}
                    </div>
                  ) : (
                    <>
                      {ex.inputs.map((input) => (
                        <div key={input.name}>
                          <span className="text-muted">{input.name} = </span>
                          {input.value}
                        </div>
                      ))}
                      <div>
                        <span className="text-muted">Expected: </span>
                        {ex.expected}
                      </div>
                      {ex.explanation && (
                        <div className="mt-1 whitespace-pre-wrap text-muted">Explanation: {ex.explanation}</div>
                      )}
                    </>
                  )}
                </pre>
              ))}
            </div>
          )}

          <div className="mb-6 rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Hints</p>
                <p className="text-xs text-muted">
                  {hintThrows >= 3
                    ? "Solution unlocked."
                    : `${3 - hintThrows} throw${3 - hintThrows === 1 ? "" : "s"} left — the third reveals the answer.`}
                </p>
              </div>
              <button
                type="button"
                disabled={hintThrows >= 3}
                onClick={() => setHintThrows((n) => Math.min(3, n + 1))}
                className="rounded-md border border-brand/50 bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/20 disabled:cursor-default disabled:border-border disabled:bg-transparent disabled:text-muted"
              >
                {hintThrows >= 3 ? "Solution revealed" : `Throw hint (${3 - hintThrows} left)`}
              </button>
            </div>
            {hintThrows > 0 && (
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
                {problem.hints.slice(0, hintThrows).map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ol>
            )}
            {hintThrows >= 3 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">Solution</p>
                  {solution && (
                    <button type="button" className="text-xs text-brand hover:underline" onClick={() => setCode(solution)}>
                      Use in editor
                    </button>
                  )}
                </div>
                {solutionError && <p className="text-sm text-wrong">{solutionError}</p>}
                {solution ? (
                  <pre className="overflow-x-auto rounded-lg bg-background p-3 font-mono text-[12px] leading-5 scrollbar-thin">
                    {solution}
                  </pre>
                ) : (
                  !solutionError && <p className="text-sm text-muted">Loading solution…</p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pb-8">
            {problem.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
          <div className="flex min-h-[220px] min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
              <span className="rounded-md bg-surface px-2.5 py-1 font-mono text-xs text-muted">{problem.fileName}</span>
              <button
                type="button"
                className="shrink-0 text-xs text-muted hover:text-foreground"
                onClick={() => setCode(problem.starterCode)}
              >
                Reset to starter
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <CodeEditor value={code} onChange={setCode} />
            </div>
          </div>

          {isUi && (
            <div className="flex min-h-[240px] w-full min-w-0 flex-col border-t border-border lg:w-[44%] lg:border-t-0 lg:border-l">
              <div className="border-b border-border px-3 py-2 text-sm text-muted">Preview</div>
              <div className="min-h-0 flex-1 bg-white">
                <LivePreview code={code} css={problem.previewCss} enabled />
              </div>
            </div>
          )}
        </div>

        <div className="flex h-[32vh] min-h-[200px] flex-col border-t border-border lg:h-[30%]">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-border px-3">
              <div className="flex gap-1 overflow-x-auto">
                {(["tests", "result", "submissions"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`px-3 py-2 text-sm capitalize ${tab === id ? "border-b-2 border-brand text-foreground" : "text-muted"}`}
                  >
                    {id === "tests" ? "Tests" : id === "result" ? "Test Result" : "Submissions"}
                  </button>
                ))}
              </div>
              <div className="flex shrink-0 items-center gap-2 py-2">
                <button
                  type="button"
                  onClick={() => void onRun()}
                  disabled={running || submitting}
                  className="rounded-md bg-surface-2 px-3 py-1.5 text-sm font-medium hover:bg-border disabled:opacity-50"
                >
                  {running ? "Running…" : "Run"}
                </button>
                <button
                  type="button"
                  onClick={() => void onSubmit()}
                  disabled={running || submitting}
                  className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              </div>
            </div>

            {error && <p className="px-4 pt-2 text-sm text-wrong">{error}</p>}

            <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin">
              {tab === "tests" && (
                <p className="text-sm text-muted">
                  Run executes {problem.examples.length} visible test
                  {problem.examples.length === 1 ? "" : "s"}. Submit runs all {problem.totalTestCases}, including hidden
                  ones.
                </p>
              )}

              {tab === "result" && !run && !submit && (
                <p className="text-sm text-muted">Run or submit your code to see results.</p>
              )}

              {tab === "result" && run && <RunPanel result={run} />}
              {tab === "result" && submit && (
                <SubmitPanel result={submit} exampleCount={problem.examples.length} />
              )}

              {tab === "submissions" && (
                <div>
                  {history.length === 0 ? (
                    <p className="text-sm text-muted">No submissions for this problem yet.</p>
                  ) : (
                    <ul className="divide-y divide-border text-sm">
                      {history.map((s) => (
                        <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                          <span className={verdictColor(s.status)}>{s.status}</span>
                          <span className="text-muted">
                            {s.passed}/{s.total} · {s.runtimeMs} ms · {formatRelative(s.createdAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: ProblemStatus }) {
  if (status === "solved") return <span className="text-accepted">Solved</span>;
  if (status === "attempted") return <span className="text-medium">Attempted</span>;
  return <span className="text-muted">Todo</span>;
}

function RunPanel({ result }: { result: RunResult }) {
  return (
    <div>
      {result.status === "Accepted" ? (
        <MiniAccepted
          label="Visible tests only — Submit to run hidden tests."
          passed={result.cases.filter((c) => c.passed).length}
          total={result.cases.length}
        />
      ) : (
        <>
          <p className={`mb-3 text-lg font-semibold ${verdictColor(result.status)}`}>{result.status}</p>
          <p className="mb-2 text-xs text-muted">Visible tests only — Submit to run hidden tests.</p>
        </>
      )}
      {result.message && <p className="mb-3 font-mono text-sm text-wrong">{result.message}</p>}
      <div className={`${result.status === "Accepted" ? "mt-4" : ""} space-y-3`}>
        {result.cases.map((c, i) => (
          <CaseBlock key={c.index} label={`Test ${i + 1}`} c={c} />
        ))}
      </div>
    </div>
  );
}

function SubmitPanel({ result, exampleCount }: { result: SubmitResult; exampleCount: number }) {
  const failed = result.failedCase;
  const failedIsExample = failed !== null && failed.index < exampleCount;
  if (result.status === "Accepted") {
    return (
      <AcceptedView
        passed={result.passed}
        total={result.total}
        runtimeMs={result.runtimeMs}
        newlySolved={result.newlySolved}
        submissionId={result.submission.id}
      />
    );
  }
  return (
    <div>
      <p className={`text-lg font-semibold ${verdictColor(result.status)}`}>{result.status}</p>
      <p className="mt-2 text-sm text-muted">
        {result.passed}/{result.total} test cases passed · {result.runtimeMs} ms
      </p>
      {result.message && <p className="mt-2 font-mono text-sm text-wrong">{result.message}</p>}
      {failed && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">
            {failedIsExample ? `Failed visible test ${failed.index + 1}` : `Failed hidden test ${failed.index + 1}`}
          </p>
          <CaseBlock label="Input" c={failed} />
        </div>
      )}
    </div>
  );
}

function CaseBlock({ label, c }: { label: string; c: CaseResult }) {
  return (
    <div className={`rounded-lg border p-3 ${c.passed ? "border-accepted/30" : "border-wrong/40"}`}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className={c.passed ? "text-accepted" : "text-wrong"}>{c.passed ? "Passed" : "Failed"}</span>
      </div>
      {c.inputs.map((input) => (
        <p key={input.name} className="font-mono text-xs">
          <span className="text-muted">{input.name} = </span>
          {input.value}
        </p>
      ))}
      {c.expected !== '"pass"' && (
        <p className="mt-1 font-mono text-xs">
          <span className="text-muted">Expected: </span>
          {c.expected}
        </p>
      )}
      <p className="font-mono text-xs">
        <span className="text-muted">{c.expected === '"pass"' ? "Detail: " : "Output: "}</span>
        {c.output ?? c.error ?? "—"}
      </p>
    </div>
  );
}
