// Types shared by the Express API (server/) and the Next.js client (app/, components/).
// Keep this file type-only so it can be imported from both sides.

import type { EditorLanguage } from "./languages";

export type { EditorLanguage } from "./languages";

export type Difficulty = "Easy" | "Medium" | "Hard";
export type ProblemStatus = "todo" | "attempted" | "solved";

export type SubmissionStatus =
  | "Accepted"
  | "Wrong Answer"
  | "Runtime Error"
  | "Time Limit Exceeded"
  | "Memory Limit Exceeded"
  | "Compile Error";

export interface PublicUser {
  id: string;
  name: string;
  username: string;
  title: string;
  color: string;
}

export type FrontendKind = "ui" | "javascript";

export interface ProblemSummary {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  status: ProblemStatus;
  acceptance: number;
  kind?: FrontendKind;
}

export interface ExampleCase {
  /** Parameter name -> pretty printed JSON value */
  inputs: { name: string; value: string }[];
  expected: string;
  explanation?: string;
}

export interface ProblemDetail extends ProblemSummary {
  description: string[];
  constraints: string[];
  hints: string[];
  functionName: string;
  params: string[];
  starterCode: string;
  starters: Record<EditorLanguage, string>;
  examples: ExampleCase[];
  totalTestCases: number;
}

export interface CaseResult {
  index: number;
  passed: boolean;
  inputs: { name: string; value: string }[];
  expected: string;
  output: string | null;
  stdout: string;
  error: string | null;
  timeMs: number;
}

export interface RunResult {
  status: SubmissionStatus;
  message: string | null;
  runtimeMs: number;
  cases: CaseResult[];
}

export interface SubmissionRecord {
  id: string;
  userId: string;
  slug: string;
  status: SubmissionStatus;
  code: string;
  passed: number;
  total: number;
  runtimeMs: number;
  createdAt: string;
}

export interface SubmissionView extends SubmissionRecord {
  title: string;
  difficulty: Difficulty;
}

export interface SubmitResult {
  status: SubmissionStatus;
  message: string | null;
  passed: number;
  total: number;
  runtimeMs: number;
  /** The first failing case. Hidden cases are revealed once they fail, like LeetCode. */
  failedCase: CaseResult | null;
  /** Console output captured from the last executed case. */
  stdout: string;
  submission: SubmissionView;
  newlySolved: boolean;
  problemStatus: ProblemStatus;
}

export interface DifficultyProgress {
  solved: number;
  total: number;
}

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  submissions: number;
  accepted: number;
}

export interface FrontendTrackStats {
  totalSolved: number;
  totalProblems: number;
  recent: SubmissionView[];
}

export interface Stats {
  totalSolved: number;
  totalProblems: number;
  attempting: number;
  byDifficulty: Record<Difficulty, DifficultyProgress>;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  activity: ActivityDay[];
  recent: SubmissionView[];
  frontend: FrontendTrackStats;
}

export interface SolutionPayload {
  language: EditorLanguage;
  code: string;
}

export interface FrontendProblemDetail extends ProblemSummary {
  kind: FrontendKind;
  description: string[];
  requirements: string[];
  hints: string[];
  fileName: string;
  starterCode: string;
  examples: ExampleCase[];
  totalTestCases: number;
  previewCss?: string;
}
