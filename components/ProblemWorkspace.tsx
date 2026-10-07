"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { difficultyClass, formatRelative, verdictColor } from "@/lib/format";
import {
  EDITOR_LANGUAGES,
  JUDGE_LANGUAGE,
  LANGUAGE_LABELS,
  isEditorLanguage,
  type EditorLanguage,
} from "@/lib/languages";
import type {
  CaseResult,
  ProblemDetail,
  ProblemStatus,
  RunResult,
  SubmissionView,
  SubmitResult,
} from "@/lib/types";
import { AcceptedView, MiniAccepted } from "./AcceptedView";
import { CodeEditor } from "./CodeEditor";
import { Markdownish } from "./Markdownish";

type BottomTab = "testcase" | "result" | "submissions";

export function ProblemWorkspace({ slug }: { slug: string }) {
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<ProblemStatus>("todo");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<BottomTab>("testcase");
  const [selectedExample, setSelectedExample] = useState(0);
  const [run, setRun] = useState<RunResult | null>(null);
  const [submit, setSubmit] = useState<SubmitResult | null>(null);
  const [history, setHistory] = useState<SubmissionView[]>([]);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [language, setLanguage] = useState<EditorLanguage>("javascript");
  const [hintThrows, setHintThrows] = useState(0);
  const [solution, setSolution] = useState<string | null>(null);
  const [solutionError, setSolutionError] = useState<string | null>(null);

  const codeKey = (lang: EditorLanguage) => `lc-code:${slug}:${lang}`;

  useEffect(() => {
    const saved = localStorage.getItem("lc-lang");
    if (saved && isEditorLanguage(saved)) setLanguage(saved);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setProblem(null);
    setRun(null);
    setSubmit(null);
    setSelectedExample(0);
    setHintThrows(0);
    setSolution(null);
    setSolutionError(null);
    setTab("testcase");
    Promise.all([api.problem(slug), api.problemSubmissions(slug)])
      .then(([p, subs]) => {
        if (cancelled) return;
        setProblem(p);
        setStatus(p.status);
        setHistory(subs);
        const storedLang = localStorage.getItem("lc-lang");
        const lang = storedLang && isEditorLanguage(storedLang) ? storedLang : language;
        if (lang !== language) setLanguage(lang);
        const saved = localStorage.getItem(`lc-code:${slug}:${lang}`);
        setCode(saved && saved.trim() ? saved : p.starters[lang]);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load problem");
      });
    return () => {
      cancelled = true;
    };
    // language is applied separately when the user switches it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!code || !problem) return;
    localStorage.setItem(codeKey(language), code);
  }, [code, language, problem, slug]);

  useEffect(() => {
    if (hintThrows < 3) return;
    let cancelled = false;
    api
      .solution(slug, language)
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
  }, [hintThrows, language, slug]);

  const changeLanguage = (next: EditorLanguage) => {
    if (next === language) return;
    if (problem) localStorage.setItem(codeKey(language), code);
    localStorage.setItem("lc-lang", next);
    const saved = problem ? localStorage.getItem(codeKey(next)) : null;
    setLanguage(next);
    if (problem) setCode(saved && saved.trim() ? saved : problem.starters[next]);
  };

  const throwHint = () => {
    setHintThrows((n) => Math.min(3, n + 1));
  };

  const onRun = useCallback(async () => {
    setRunning(true);
    setError(null);
    try {
      const result = await api.run(slug, code);
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
      const result = await api.submit(slug, code);
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

  const example = problem.examples[selectedExample];

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row">
      <section className="flex min-h-0 w-full flex-col border-b border-border lg:w-[46%] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">
              {problem.id}. {problem.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
              <span className={difficultyClass[problem.difficulty]}>{problem.difficulty}</span>
              <StatusPill status={status} />
              <span className="text-muted">{problem.acceptance.toFixed(1)}% acceptance</span>
            </div>
          </div>
          <Link href="/dashboard/problems" className="text-sm text-muted hover:text-foreground">
            ← List
          </Link>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
          {problem.description.map((p, i) => (
            <p key={i} className="mb-4 leading-7">
              <Markdownish text={p} />
            </p>
          ))}

          {problem.examples.map((ex, i) => (
            <div key={i} className="mb-5">
              <h3 className="mb-2 text-sm font-semibold">Example {i + 1}:</h3>
              <pre className="overflow-x-auto rounded-lg bg-surface p-3 font-mono text-[13px] leading-6 scrollbar-thin">
                {ex.inputs.map((input) => (
                  <div key={input.name}>
                    <span className="text-muted">Input: </span>
                    {input.name} = {input.value}
                  </div>
                ))}
                <div>
                  <span className="text-muted">Output: </span>
                  {ex.expected}
                </div>
                {ex.explanation && (
                  <div className="mt-1 whitespace-pre-wrap text-muted">
                    Explanation: {ex.explanation}
                  </div>
                )}
              </pre>
            </div>
          ))}

          <h3 className="mb-2 text-sm font-semibold">Constraints:</h3>
          <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-foreground/90">
            {problem.constraints.map((c) => (
              <li key={c}>
                <Markdownish text={c} />
              </li>
            ))}
          </ul>

          <div className="mb-6 rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Hints</p>
                <p className="text-xs text-muted">
                  {hintThrows >= 3
                    ? "Solution unlocked in the language you have selected."
                    : `${3 - hintThrows} throw${3 - hintThrows === 1 ? "" : "s"} left — the third reveals the answer.`}
                </p>
              </div>
              <button
                type="button"
                disabled={hintThrows >= 3}
                onClick={throwHint}
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
                  <p className="text-sm font-semibold text-foreground">
                    Solution · {LANGUAGE_LABELS[language]}
                  </p>
                  {solution && (
                    <button
                      type="button"
                      className="text-xs text-brand hover:underline"
                      onClick={() => setCode(solution)}
                    >
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
        <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <label className="sr-only" htmlFor="editor-language">
              Language
            </label>
            <select
              id="editor-language"
              value={language}
              onChange={(e) => changeLanguage(e.target.value as EditorLanguage)}
              className="h-8 rounded-md border border-border bg-surface px-2 text-sm"
            >
              {EDITOR_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {LANGUAGE_LABELS[lang]}
                </option>
              ))}
            </select>
            <span className="hidden min-w-0 truncate text-[11px] text-muted/80 lg:inline">
              Tab accepts a suggestion · {"{ }"} ( ) auto-close
            </span>
          </div>
          <button
            type="button"
            className="shrink-0 text-xs text-muted hover:text-foreground"
            onClick={() => setCode(problem.starters[language])}
          >
            Reset to starter
          </button>
        </div>
        <div className="min-h-[220px] flex-1 overflow-hidden">
          <CodeEditor value={code} onChange={setCode} />
        </div>

        <div className="flex h-[38vh] min-h-[220px] flex-col border-t border-border lg:h-[32%]">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3">
            <div className="flex gap-1 overflow-x-auto">
              {(["testcase", "result", "submissions"] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`px-3 py-2 text-sm capitalize ${tab === id ? "border-b-2 border-brand text-foreground" : "text-muted"}`}
                >
                  {id === "testcase" ? "Testcase" : id === "result" ? "Test Result" : "Submissions"}
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2 py-2">
              {language !== JUDGE_LANGUAGE && (
                <span className="hidden max-w-[140px] text-[11px] text-muted sm:inline">
                  Run/Submit in JavaScript
                </span>
              )}
              <button
                type="button"
                onClick={() => void onRun()}
                disabled={running || submitting || language !== JUDGE_LANGUAGE}
                title={language !== JUDGE_LANGUAGE ? "The judge currently runs JavaScript only" : undefined}
                className="rounded-md bg-surface-2 px-3 py-1.5 text-sm font-medium hover:bg-border disabled:opacity-50"
              >
                {running ? "Running…" : "Run"}
              </button>
              <button
                type="button"
                onClick={() => void onSubmit()}
                disabled={running || submitting || language !== JUDGE_LANGUAGE}
                title={language !== JUDGE_LANGUAGE ? "The judge currently runs JavaScript only" : undefined}
                className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>

          {error && <p className="px-4 pt-2 text-sm text-wrong">{error}</p>}

          <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin">
            {tab === "testcase" && example && (
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {problem.examples.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedExample(i)}
                      className={`rounded-md px-3 py-1 text-sm ${
                        selectedExample === i ? "bg-surface-2" : "text-muted hover:text-foreground"
                      }`}
                    >
                      Case {i + 1}
                    </button>
                  ))}
                </div>
                {example.inputs.map((input) => (
                  <label key={input.name} className="mb-3 block">
                    <span className="mb-1 block text-xs text-muted">{input.name} =</span>
                    <pre className="overflow-x-auto rounded-md bg-background p-2 font-mono text-sm scrollbar-thin">
                      {input.value}
                    </pre>
                  </label>
                ))}
                <p className="text-xs text-muted">
                  Run executes these {problem.examples.length} example cases. Submit runs all{" "}
                  {problem.totalTestCases} tests, including hidden ones.
                </p>
              </div>
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
          label="Example cases only — Submit to run hidden tests."
          passed={result.cases.filter((c) => c.passed).length}
          total={result.cases.length}
        />
      ) : (
        <>
          <p className={`mb-3 text-lg font-semibold ${verdictColor(result.status)}`}>{result.status}</p>
          <p className="mb-2 text-xs text-muted">Example cases only — Submit to run hidden tests.</p>
        </>
      )}
      {result.message && <p className="mb-3 font-mono text-sm text-wrong">{result.message}</p>}
      {result.status !== "Accepted" && <p className="mb-3 text-xs text-muted">Runtime {result.runtimeMs} ms</p>}
      <div className={`${result.status === "Accepted" ? "mt-4" : ""} space-y-3`}>
        {result.cases.map((c, i) => (
          <CaseBlock key={c.index} label={`Case ${i + 1}`} c={c} />
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
      {result.stdout && (
        <pre className="mt-3 overflow-x-auto rounded-md bg-background p-2 font-mono text-xs text-muted scrollbar-thin">
          {result.stdout}
        </pre>
      )}
      {failed && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">
            {failedIsExample
              ? `Failed example ${failed.index + 1}`
              : `Failed hidden test case ${failed.index + 1}`}
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
      <p className="mt-1 font-mono text-xs">
        <span className="text-muted">Expected: </span>
        {c.expected}
      </p>
      <p className="font-mono text-xs">
        <span className="text-muted">Output: </span>
        {c.output ?? c.error ?? "—"}
      </p>
      {c.stdout && (
        <pre className="mt-2 overflow-x-auto font-mono text-xs text-muted scrollbar-thin">{c.stdout}</pre>
      )}
    </div>
  );
}
