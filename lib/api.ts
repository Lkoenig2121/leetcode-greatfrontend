import type { EditorLanguage } from "./languages";
import type {
  FrontendProblemDetail,
  ProblemDetail,
  ProblemSummary,
  PublicUser,
  RunResult,
  SolutionPayload,
  Stats,
  SubmissionView,
  SubmitResult,
} from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as T;
}

export const api = {
  users: () => request<PublicUser[]>("/api/users"),
  me: () => request<PublicUser>("/api/auth/me"),
  login: (userId: string) =>
    request<PublicUser>("/api/auth/login", { method: "POST", body: JSON.stringify({ userId }) }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  problems: () => request<ProblemSummary[]>("/api/problems"),
  problem: (slug: string) => request<ProblemDetail>(`/api/problems/${slug}`),
  problemSubmissions: (slug: string) => request<SubmissionView[]>(`/api/problems/${slug}/submissions`),
  solution: (slug: string, language: EditorLanguage) =>
    request<SolutionPayload>(`/api/problems/${slug}/solution?language=${language}`),
  run: (slug: string, code: string) =>
    request<RunResult>(`/api/problems/${slug}/run`, { method: "POST", body: JSON.stringify({ code }) }),
  submit: (slug: string, code: string) =>
    request<SubmitResult>(`/api/problems/${slug}/submit`, { method: "POST", body: JSON.stringify({ code }) }),
  frontendProblems: () => request<ProblemSummary[]>("/api/frontend/problems"),
  frontendProblem: (slug: string) => request<FrontendProblemDetail>(`/api/frontend/problems/${slug}`),
  frontendSubmissions: (slug: string) => request<SubmissionView[]>(`/api/frontend/problems/${slug}/submissions`),
  frontendSolution: (slug: string) => request<SolutionPayload>(`/api/frontend/problems/${slug}/solution`),
  frontendRun: (slug: string, code: string) =>
    request<RunResult>(`/api/frontend/problems/${slug}/run`, { method: "POST", body: JSON.stringify({ code }) }),
  frontendSubmit: (slug: string, code: string) =>
    request<SubmitResult>(`/api/frontend/problems/${slug}/submit`, { method: "POST", body: JSON.stringify({ code }) }),
  stats: () => request<Stats>("/api/stats"),
};
