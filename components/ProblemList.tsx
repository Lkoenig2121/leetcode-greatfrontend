"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { difficultyClass, statusLabel } from "@/lib/format";
import type { Difficulty, ProblemStatus, ProblemSummary } from "@/lib/types";

type DiffFilter = "All" | Difficulty;
type StatusFilter = "All" | ProblemStatus;
type KindFilter = "All" | "ui" | "javascript";

export function ProblemList({
  track = "algorithms",
}: {
  track?: "algorithms" | "frontend";
}) {
  const [problems, setProblems] = useState<ProblemSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [diff, setDiff] = useState<DiffFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [kind, setKind] = useState<KindFilter>("All");

  useEffect(() => {
    const load = track === "frontend" ? api.frontendProblems : api.problems;
    load()
      .then(setProblems)
      .catch((err: unknown) =>
        setError(
          err instanceof Error ? err.message : "Failed to load problems",
        ),
      );
  }, [track]);

  const filtered = useMemo(() => {
    if (!problems) return [];
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (diff !== "All" && p.difficulty !== diff) return false;
      if (status !== "All" && p.status !== status) return false;
      if (kind !== "All" && p.kind !== kind) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [problems, query, diff, status, kind]);

  if (error) return <p className="p-6 text-wrong">{error}</p>;
  if (!problems) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    );
  }

  const solved = problems.filter((p) => p.status === "solved").length;
  const hrefFor = (slug: string) =>
    track === "frontend"
      ? `/dashboard/frontend/${slug}`
      : `/dashboard/problems/${slug}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {track === "frontend" ? "Great Front End" : "Problem set"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {track === "frontend"
              ? "UI components and JavaScript utilities with a live preview and tests."
              : `${solved}/${problems.length} solved`}
          </p>
          {track === "frontend" && (
            <p className="mt-1 text-sm text-muted">
              {solved}/{problems.length} solved
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, id, or tag"
            className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none placeholder:text-muted focus:border-brand sm:w-64"
          />
          {track === "frontend" && (
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as KindFilter)}
              className="h-9 rounded-md border border-border bg-surface px-2 text-sm"
            >
              <option value="All">All types</option>
              <option value="ui">UI</option>
              <option value="javascript">JavaScript</option>
            </select>
          )}
          <select
            value={diff}
            onChange={(e) => setDiff(e.target.value as DiffFilter)}
            className="h-9 rounded-md border border-border bg-surface px-2 text-sm"
          >
            <option>All</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="h-9 rounded-md border border-border bg-surface px-2 text-sm"
          >
            <option value="All">All statuses</option>
            <option value="solved">Solved</option>
            <option value="attempted">Attempted</option>
            <option value="todo">Todo</option>
          </select>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 text-muted">
            <tr>
              <th className="w-16 px-4 py-3 font-medium">Status</th>
              <th className="w-16 px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Title</th>
              {track === "frontend" && (
                <th className="w-28 px-4 py-3 font-medium">Type</th>
              )}
              <th className="w-28 px-4 py-3 font-medium">Difficulty</th>
              <th className="w-28 px-4 py-3 font-medium">Acceptance</th>
              <th className="px-4 py-3 font-medium">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {filtered.map((p) => (
              <tr key={p.slug} className="hover:bg-surface-2/60">
                <td className="px-4 py-3">
                  <StatusIcon status={p.status} />
                </td>
                <td className="px-4 py-3 text-muted">{p.id}</td>
                <td className="px-4 py-3">
                  <Link
                    href={hrefFor(p.slug)}
                    prefetch={true}
                    className="font-medium hover:text-brand"
                  >
                    {p.title}
                  </Link>
                </td>
                {track === "frontend" && (
                  <td className="px-4 py-3 text-muted">
                    {p.kind === "ui" ? "UI" : "JavaScript"}
                  </td>
                )}
                <td className={`px-4 py-3 ${difficultyClass[p.difficulty]}`}>
                  {p.difficulty}
                </td>
                <td className="px-4 py-3 text-muted">
                  {p.acceptance.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-muted">
                  {p.tags.slice(0, 3).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:hidden">
        {filtered.map((p) => (
          <li key={p.slug}>
            <Link
              href={hrefFor(p.slug)}
              prefetch={true}
              className="flex flex-col rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">
                  {p.id}. {p.title}
                </span>
                <StatusIcon status={p.status} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                {track === "frontend" && (
                  <span className="text-muted">
                    {p.kind === "ui" ? "UI" : "JavaScript"}
                  </span>
                )}
                <span className={difficultyClass[p.difficulty]}>
                  {p.difficulty}
                </span>
                <span className="text-muted">{statusLabel(p.status)}</span>
                <span className="text-muted">{p.acceptance.toFixed(1)}%</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="py-10 text-center text-muted">
          No problems match those filters.
        </p>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: ProblemStatus }) {
  if (status === "solved") {
    return (
      <span
        title="Solved"
        className="inline-flex text-accepted"
        aria-label="Solved"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm3.2 4.4L7.1 10 4.8 7.6l.9-.9 1.4 1.5 3.2-3.5.9.7Z" />
        </svg>
      </span>
    );
  }
  if (status === "attempted") {
    return (
      <span
        title="Attempted"
        className="inline-flex text-medium"
        aria-label="Attempted"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="8" cy="8" r="2" />
        </svg>
      </span>
    );
  }
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full bg-border"
      title="Todo"
    />
  );
}
