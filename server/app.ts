import crypto from "node:crypto";
import express, { type NextFunction, type Request, type Response } from "express";
import type { ProblemSummary, SubmissionRecord, SubmitResult } from "../lib/types";
import { clearSessionCookie, COOKIE_NAME, currentUser, readCookie, requireUser, setSessionCookie, verifyToken } from "./auth";
import { addSubmission, submissionsFor } from "./db";
import {
  frontendProblems as catalogFrontend,
  judgeFrontend,
  toFrontendDetail,
  toFrontendSummary,
  type FrontendDef,
} from "./frontend";
import { judge, toRunResult } from "./judge";
import { JUDGE_LANGUAGE } from "../lib/languages";
import { toProblemDetail } from "./problems";
import { parseLanguage, solutionFor } from "./problems/solutions";
import type { LoadedProblem } from "./problems/types";
import { computeStats, statusMap, toView } from "./stats";
import { findUser, USERS } from "./users";

const MAX_CODE_LENGTH = 20_000;
const MAX_CONCURRENT_RUNS = 6;

export function createApp(problems: LoadedProblem[], frontendDefs: FrontendDef[] = catalogFrontend) {
  const app = express();
  const bySlug = new Map(problems.map((p) => [p.slug, p]));
  const frontendBySlug = new Map(frontendDefs.map((p) => [p.slug, p]));
  let activeRuns = 0;

  app.disable("x-powered-by");
  app.use(express.json({ limit: "256kb" }));

  // ---- helpers -----------------------------------------------------------------------------
  const getProblem = (req: Request, res: Response): LoadedProblem | undefined => {
    const problem = bySlug.get(String(req.params.slug));
    if (!problem) res.status(404).json({ error: "Problem not found" });
    return problem;
  };

  const getFrontendProblem = (req: Request, res: Response): FrontendDef | undefined => {
    const problem = frontendBySlug.get(String(req.params.slug));
    if (!problem) res.status(404).json({ error: "Problem not found" });
    return problem;
  };

  const readCode = (req: Request, res: Response): string | undefined => {
    const code: unknown = req.body?.code;
    if (typeof code !== "string" || code.trim() === "") {
      res.status(400).json({ error: "Write some code first." });
      return undefined;
    }
    if (code.length > MAX_CODE_LENGTH) {
      res.status(413).json({ error: "Code is too long." });
      return undefined;
    }
    return code;
  };

  /** Caps how many sandboxes can run at once so one user can't starve the server. */
  const withRunSlot = async <T>(res: Response, task: () => Promise<T>): Promise<T | undefined> => {
    if (activeRuns >= MAX_CONCURRENT_RUNS) {
      res.status(429).json({ error: "The judge is busy. Try again in a moment." });
      return undefined;
    }
    activeRuns += 1;
    try {
      return await task();
    } finally {
      activeRuns -= 1;
    }
  };

  // ---- public ------------------------------------------------------------------------------
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, problems: problems.length, frontend: frontendDefs.length });
  });

  app.get("/api/users", (_req, res) => {
    res.json(USERS);
  });

  app.get("/api/auth/me", (req, res) => {
    const user = verifyToken(readCookie(req, COOKIE_NAME));
    if (!user) {
      res.status(401).json({ error: "Not signed in" });
      return;
    }
    res.json(user);
  });

  app.post("/api/auth/login", (req, res) => {
    const user = findUser(typeof req.body?.userId === "string" ? req.body.userId : undefined);
    if (!user) {
      res.status(400).json({ error: "Unknown account" });
      return;
    }
    setSessionCookie(res, user.id);
    res.json(user);
  });

  app.post("/api/auth/logout", (_req, res) => {
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  // ---- authenticated -----------------------------------------------------------------------
  app.use("/api", requireUser);

  app.get("/api/problems", (_req, res) => {
    const user = currentUser(res);
    const statuses = statusMap(submissionsFor(user.id));
    const list: ProblemSummary[] = problems.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
      status: statuses.get(p.slug) ?? "todo",
      acceptance: p.acceptance,
    }));
    res.json(list);
  });

  app.get("/api/problems/:slug", (req, res) => {
    const problem = getProblem(req, res);
    if (!problem) return;
    const statuses = statusMap(submissionsFor(currentUser(res).id));
    res.json(toProblemDetail(problem, { status: statuses.get(problem.slug) ?? "todo", acceptance: problem.acceptance }));
  });

  app.get("/api/problems/:slug/solution", (req, res) => {
    const problem = getProblem(req, res);
    if (!problem) return;
    const language = parseLanguage(req.query.language) ?? JUDGE_LANGUAGE;
    const code = solutionFor(problem, language);
    if (!code) {
      res.status(404).json({ error: `No ${language} solution for this problem yet.` });
      return;
    }
    res.json({ language, code });
  });

  app.get("/api/problems/:slug/submissions", (req, res) => {
    const problem = getProblem(req, res);
    if (!problem) return;
    const mine = submissionsFor(currentUser(res).id)
      .filter((s) => s.slug === problem.slug)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50)
      .map((s) => toView(s, problem));
    res.json(mine);
  });

  // "Run": executes only the example cases that are displayed to the user.
  app.post("/api/problems/:slug/run", async (req, res) => {
    const problem = getProblem(req, res);
    if (!problem) return;
    const code = readCode(req, res);
    if (code === undefined) return;

    const outcome = await withRunSlot(res, () =>
      judge(
        problem,
        code,
        problem.tests.filter((t) => t.visible),
        { stopOnFail: false },
      ),
    );
    if (outcome) res.json(toRunResult(outcome));
  });

  // "Submit": executes every case (including hidden ones) and records the attempt.
  app.post("/api/problems/:slug/submit", async (req, res) => {
    const problem = getProblem(req, res);
    if (!problem) return;
    const code = readCode(req, res);
    if (code === undefined) return;
    const user = currentUser(res);

    const outcome = await withRunSlot(res, () => judge(problem, code, problem.tests, { stopOnFail: true }));
    if (!outcome) return;

    const before = statusMap(submissionsFor(user.id)).get(problem.slug);
    const record: SubmissionRecord = {
      id: crypto.randomUUID(),
      userId: user.id,
      slug: problem.slug,
      status: outcome.status,
      code,
      passed: outcome.passed,
      total: outcome.total,
      runtimeMs: outcome.runtimeMs,
      createdAt: new Date().toISOString(),
    };
    addSubmission(record);

    const problemStatus = outcome.status === "Accepted" || before === "solved" ? "solved" : "attempted";
    const failedCase = outcome.cases.find((c) => !c.passed) ?? null;

    const result: SubmitResult = {
      status: outcome.status,
      message: outcome.message,
      passed: outcome.passed,
      total: outcome.total,
      runtimeMs: outcome.runtimeMs,
      failedCase,
      stdout: outcome.stdout,
      submission: toView(record, problem),
      newlySolved: outcome.status === "Accepted" && before !== "solved",
      problemStatus,
    };
    res.json(result);
  });

  app.get("/api/frontend/problems", (_req, res) => {
    const statuses = statusMap(submissionsFor(currentUser(res).id));
    const list: ProblemSummary[] = frontendDefs.map((p) =>
      toFrontendSummary(p, statuses.get(p.slug) ?? "todo"),
    );
    res.json(list);
  });

  app.get("/api/frontend/problems/:slug", (req, res) => {
    const problem = getFrontendProblem(req, res);
    if (!problem) return;
    const statuses = statusMap(submissionsFor(currentUser(res).id));
    res.json(toFrontendDetail(problem, statuses.get(problem.slug) ?? "todo"));
  });

  app.get("/api/frontend/problems/:slug/solution", (req, res) => {
    const problem = getFrontendProblem(req, res);
    if (!problem) return;
    res.json({ language: "javascript", code: problem.reference });
  });

  app.get("/api/frontend/problems/:slug/submissions", (req, res) => {
    const problem = getFrontendProblem(req, res);
    if (!problem) return;
    const mine = submissionsFor(currentUser(res).id)
      .filter((s) => s.slug === problem.slug)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50)
      .map((s) => toView(s, problem));
    res.json(mine);
  });

  app.post("/api/frontend/problems/:slug/run", async (req, res) => {
    const problem = getFrontendProblem(req, res);
    if (!problem) return;
    const code = readCode(req, res);
    if (code === undefined) return;

    const outcome = await withRunSlot(res, () =>
      judgeFrontend(problem, code, { visibleOnly: true, stopOnFail: false }),
    );
    if (outcome) res.json(toRunResult(outcome));
  });

  app.post("/api/frontend/problems/:slug/submit", async (req, res) => {
    const problem = getFrontendProblem(req, res);
    if (!problem) return;
    const code = readCode(req, res);
    if (code === undefined) return;
    const user = currentUser(res);

    const outcome = await withRunSlot(res, () =>
      judgeFrontend(problem, code, { visibleOnly: false, stopOnFail: true }),
    );
    if (!outcome) return;

    const before = statusMap(submissionsFor(user.id)).get(problem.slug);
    const record: SubmissionRecord = {
      id: crypto.randomUUID(),
      userId: user.id,
      slug: problem.slug,
      status: outcome.status,
      code,
      passed: outcome.passed,
      total: outcome.total,
      runtimeMs: outcome.runtimeMs,
      createdAt: new Date().toISOString(),
    };
    addSubmission(record);

    const problemStatus = outcome.status === "Accepted" || before === "solved" ? "solved" : "attempted";
    const failedCase = outcome.cases.find((c) => !c.passed) ?? null;

    const result: SubmitResult = {
      status: outcome.status,
      message: outcome.message,
      passed: outcome.passed,
      total: outcome.total,
      runtimeMs: outcome.runtimeMs,
      failedCase,
      stdout: outcome.stdout,
      submission: toView(record, problem),
      newlySolved: outcome.status === "Accepted" && before !== "solved",
      problemStatus,
    };
    res.json(result);
  });

  app.get("/api/stats", (_req, res) => {
    const mine = submissionsFor(currentUser(res).id);
    const dsa = computeStats(mine, problems);
    const fe = computeStats(mine, frontendDefs);
    const all = computeStats(mine, [...problems, ...frontendDefs]);
    res.json({
      ...dsa,
      totalSubmissions: all.totalSubmissions,
      acceptedSubmissions: all.acceptedSubmissions,
      acceptanceRate: all.acceptanceRate,
      currentStreak: all.currentStreak,
      longestStreak: all.longestStreak,
      activeDays: all.activeDays,
      activity: all.activity,
      frontend: {
        totalSolved: fe.totalSolved,
        totalProblems: fe.totalProblems,
        recent: fe.recent,
      },
    });
  });

  // ---- errors ------------------------------------------------------------------------------
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[api] unhandled error", err);
    if (res.headersSent) return;
    const status = typeof err === "object" && err && "status" in err && typeof err.status === "number" ? err.status : 500;
    res.status(status).json({ error: status === 500 ? "Something went wrong" : "Bad request" });
  });

  return app;
}
