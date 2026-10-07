import type {
  ActivityDay,
  Difficulty,
  DifficultyProgress,
  ProblemStatus,
  Stats,
  SubmissionRecord,
  SubmissionView,
} from "../lib/types";
export type StatProblem = { slug: string; title: string; difficulty: Difficulty };

const ACTIVITY_DAYS = 84;

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function statusMap(submissions: SubmissionRecord[]): Map<string, ProblemStatus> {
  const map = new Map<string, ProblemStatus>();
  for (const s of submissions) {
    if (s.status === "Accepted") map.set(s.slug, "solved");
    else if (!map.has(s.slug)) map.set(s.slug, "attempted");
  }
  return map;
}

export function toView(submission: SubmissionRecord, problem: StatProblem): SubmissionView {
  return { ...submission, title: problem.title, difficulty: problem.difficulty };
}

function streaks(activeDates: Set<string>): { current: number; longest: number } {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // Current streak: consecutive active days ending today (or yesterday if today has no activity yet).
  const cursor = new Date(today);
  if (!activeDates.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let current = 0;
  while (activeDates.has(localDateKey(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sorted = [...activeDates].sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of sorted) {
    const date = new Date(`${key}T12:00:00`);
    if (prev) {
      const gapDays = Math.round((date.getTime() - prev.getTime()) / 86_400_000);
      run = gapDays === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = date;
  }
  return { current, longest };
}

export function computeStats(userSubmissions: SubmissionRecord[], problems: StatProblem[]): Omit<Stats, "frontend"> {
  const bySlug = new Map(problems.map((p) => [p.slug, p]));
  const slugs = new Set(bySlug.keys());
  userSubmissions = userSubmissions.filter((s) => slugs.has(s.slug));
  const statuses = statusMap(userSubmissions);

  const byDifficulty: Record<Difficulty, DifficultyProgress> = {
    Easy: { solved: 0, total: 0 },
    Medium: { solved: 0, total: 0 },
    Hard: { solved: 0, total: 0 },
  };
  let totalSolved = 0;
  let attempting = 0;
  for (const p of problems) {
    byDifficulty[p.difficulty].total += 1;
    const status = statuses.get(p.slug);
    if (status === "solved") {
      byDifficulty[p.difficulty].solved += 1;
      totalSolved += 1;
    } else if (status === "attempted") {
      attempting += 1;
    }
  }

  const acceptedSubmissions = userSubmissions.filter((s) => s.status === "Accepted").length;
  const totalSubmissions = userSubmissions.length;

  const perDay = new Map<string, { submissions: number; accepted: number }>();
  for (const s of userSubmissions) {
    const key = localDateKey(new Date(s.createdAt));
    const entry = perDay.get(key) ?? { submissions: 0, accepted: 0 };
    entry.submissions += 1;
    if (s.status === "Accepted") entry.accepted += 1;
    perDay.set(key, entry);
  }

  const activity: ActivityDay[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() - (ACTIVITY_DAYS - 1));
  for (let i = 0; i < ACTIVITY_DAYS; i++) {
    const key = localDateKey(cursor);
    const entry = perDay.get(key);
    activity.push({ date: key, submissions: entry?.submissions ?? 0, accepted: entry?.accepted ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  const { current, longest } = streaks(new Set(perDay.keys()));

  const latestSolveBySlug = new Map<string, SubmissionRecord>();
  for (const s of [...userSubmissions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    if (s.status !== "Accepted" || latestSolveBySlug.has(s.slug)) continue;
    latestSolveBySlug.set(s.slug, s);
  }
  const recent = [...latestSolveBySlug.values()].slice(0, 6).flatMap((s) => {
    const problem = bySlug.get(s.slug);
    return problem ? [toView(s, problem)] : [];
  });

  return {
    totalSolved,
    totalProblems: problems.length,
    attempting,
    byDifficulty,
    totalSubmissions,
    acceptedSubmissions,
    acceptanceRate: totalSubmissions ? Math.round((acceptedSubmissions / totalSubmissions) * 1000) / 10 : 0,
    currentStreak: current,
    longestStreak: longest,
    activeDays: perDay.size,
    activity,
    recent,
  };
}
