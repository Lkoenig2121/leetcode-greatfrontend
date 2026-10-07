"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { difficultyClass, formatRelative } from "@/lib/format";
import type { Difficulty, Stats } from "@/lib/types";
import { useAuth } from "./AuthProvider";

const ORDER: Difficulty[] = ["Easy", "Medium", "Hard"];

export function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load stats"),
      );
  }, []);

  if (error) {
    return <p className="p-6 text-wrong">{error}</p>;
  }
  if (!stats || !user) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    );
  }

  const frontend = stats.frontend ?? {
    totalSolved: 0,
    totalProblems: 0,
    recent: [],
  };
  const pct = stats.totalProblems
    ? Math.round((stats.totalSolved / stats.totalProblems) * 100)
    : 0;
  const circumference = 2 * Math.PI * 42;
  const dash = (pct / 100) * circumference;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {stats.totalSolved} of {stats.totalProblems} problems solved ·{" "}
          {stats.currentStreak}-day streak
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-medium text-muted">Progress</h2>
          <div className="flex items-center gap-5">
            <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--border)"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#ffa116"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
              />
            </svg>
            <div>
              <p className="text-3xl font-semibold">{stats.totalSolved}</p>
              <p className="text-sm text-muted">
                / {stats.totalProblems} solved
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-3">
            {ORDER.map((d) => {
              const row = stats.byDifficulty[d];
              const width = row.total ? (row.solved / row.total) * 100 : 0;
              return (
                <li key={d}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className={difficultyClass[d]}>{d}</span>
                    <span className="text-muted">
                      {row.solved}/{row.total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-background">
                    <div
                      className={`h-full rounded-full ${d === "Easy" ? "bg-easy" : d === "Medium" ? "bg-medium" : "bg-hard"}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Attempting"
            value={String(stats.attempting)}
            hint="Started, not yet accepted"
          />
          <StatCard
            label="Submissions"
            value={String(stats.totalSubmissions)}
            hint={`${stats.acceptanceRate}% accepted`}
          />
          <StatCard
            label="Current streak"
            value={`${stats.currentStreak}d`}
            hint={`Longest ${stats.longestStreak}d`}
          />
          <StatCard
            label="Active days"
            value={String(stats.activeDays)}
            hint="Days with a submission"
          />
        </section>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted">Last 12 weeks</h2>
          <p className="text-xs text-muted">Submission activity</p>
        </div>
        <ActivityGrid activity={stats.activity} />
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted">Great Front End</h2>
          <Link
            href="/dashboard/frontend"
            prefetch={true}
            className="text-sm text-brand hover:underline"
          >
            All questions
          </Link>
        </div>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-semibold">{frontend.totalSolved}</p>
            <p className="text-sm text-muted">
              / {frontend.totalProblems} UI &amp; JS questions solved
            </p>
          </div>
          <p className="text-sm text-muted">
            {frontend.totalProblems
              ? Math.round(
                  (frontend.totalSolved / frontend.totalProblems) * 100,
                )
              : 0}
            %
          </p>
        </div>
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full bg-brand"
            style={{
              width: `${frontend.totalProblems ? (frontend.totalSolved / frontend.totalProblems) * 100 : 0}%`,
            }}
          />
        </div>
        {frontend.recent.length === 0 ? (
          <p className="text-sm text-muted">
            No Front End questions solved yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {frontend.recent.map((s) => (
              <li
                key={s.slug}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <Link
                  href={`/dashboard/frontend/${s.slug}`}
                  prefetch={true}
                  className="font-medium hover:text-brand"
                >
                  {s.title}
                </Link>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-accepted">Solved</span>
                  <span className={difficultyClass[s.difficulty]}>
                    {s.difficulty}
                  </span>
                  <span className="text-muted">
                    {formatRelative(s.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted">
            Recent problems solved
          </h2>
          <Link
            href="/dashboard/problems"
            prefetch={true}
            className="text-sm text-brand hover:underline"
          >
            All problems
          </Link>
        </div>
        {stats.recent.length === 0 ? (
          <p className="text-sm text-muted">No problems solved yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.recent.map((s) => (
              <li
                key={s.slug}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <Link
                  href={`/dashboard/problems/${s.slug}`}
                  prefetch={true}
                  className="font-medium hover:text-brand"
                >
                  {s.title}
                </Link>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-accepted">Solved</span>
                  <span className={difficultyClass[s.difficulty]}>
                    {s.difficulty}
                  </span>
                  <span className="text-muted">
                    {formatRelative(s.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

function ActivityGrid({ activity }: { activity: Stats["activity"] }) {
  const max = Math.max(1, ...activity.map((d) => d.submissions));
  const weeks: Stats["activity"][] = [];
  for (let i = 0; i < activity.length; i += 7)
    weeks.push(activity.slice(i, i + 7));

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => {
              const intensity =
                day.submissions === 0
                  ? 0
                  : Math.min(4, Math.ceil((day.submissions / max) * 4));
              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.submissions} submission${day.submissions === 1 ? "" : "s"} (${day.accepted} accepted)`}
                  className="h-3 w-3 rounded-[3px]"
                  style={{ background: `var(--heat-${intensity})` }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
