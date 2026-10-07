import type { SubmissionRecord } from "../lib/types";
import type { DbShape } from "./db";

export interface SeedableProblem {
  slug: string;
  reference: string;
  starterCode: string;
  testCount: number;
}

interface SeedEntry {
  slug: string;
  daysAgo: number;
  /** "ok" = Accepted submission. "wa" = a Wrong Answer attempt (problem stays unsolved unless an "ok" exists too). */
  result: "ok" | "wa";
  /** Number of failed attempts made earlier the same day, before an accepted one. */
  failsFirst?: number;
}

/** Pre-completed questions for each demo account (so every account starts with progress). */
const SEEDS: Record<string, SeedEntry[]> = {
  alice: [
    { slug: "two-sum", daysAgo: 6, result: "ok", failsFirst: 1 },
    { slug: "valid-parentheses", daysAgo: 5, result: "ok" },
    { slug: "palindrome-number", daysAgo: 4, result: "ok" },
    { slug: "climbing-stairs", daysAgo: 3, result: "ok", failsFirst: 2 },
    { slug: "best-time-to-buy-and-sell-stock", daysAgo: 2, result: "ok" },
    { slug: "contains-duplicate", daysAgo: 2, result: "ok" },
    { slug: "binary-search", daysAgo: 1, result: "ok" },
    { slug: "fizz-buzz", daysAgo: 1, result: "ok" },
    { slug: "maximum-subarray", daysAgo: 0, result: "ok", failsFirst: 1 },
    { slug: "group-anagrams", daysAgo: 1, result: "wa" },
    { slug: "3sum", daysAgo: 0, result: "wa" },
    { slug: "gfe-counter", daysAgo: 3, result: "ok" },
    { slug: "gfe-flatten", daysAgo: 2, result: "ok" },
    { slug: "gfe-make-counter", daysAgo: 1, result: "wa" },
  ],
  bob: [
    { slug: "two-sum", daysAgo: 12, result: "ok" },
    { slug: "valid-anagram", daysAgo: 11, result: "ok" },
    { slug: "roman-to-integer", daysAgo: 9, result: "ok", failsFirst: 1 },
    { slug: "move-zeroes", daysAgo: 8, result: "ok" },
    { slug: "single-number", daysAgo: 3, result: "ok" },
    { slug: "missing-number", daysAgo: 2, result: "ok" },
    { slug: "reverse-string", daysAgo: 2, result: "ok" },
    { slug: "valid-parentheses", daysAgo: 3, result: "wa", failsFirst: 1 },
    { slug: "merge-intervals", daysAgo: 1, result: "wa" },
    { slug: "gfe-make-counter", daysAgo: 4, result: "ok" },
    { slug: "gfe-classnames", daysAgo: 1, result: "ok" },
  ],
  carol: [
    { slug: "two-sum", daysAgo: 13, result: "ok" },
    { slug: "palindrome-number", daysAgo: 12, result: "ok" },
    { slug: "roman-to-integer", daysAgo: 11, result: "ok" },
    { slug: "valid-parentheses", daysAgo: 10, result: "ok" },
    { slug: "climbing-stairs", daysAgo: 9, result: "ok" },
    { slug: "best-time-to-buy-and-sell-stock", daysAgo: 8, result: "ok" },
    { slug: "contains-duplicate", daysAgo: 7, result: "ok" },
    { slug: "valid-anagram", daysAgo: 6, result: "ok" },
    { slug: "longest-substring-without-repeating-characters", daysAgo: 5, result: "ok", failsFirst: 2 },
    { slug: "group-anagrams", daysAgo: 4, result: "ok" },
    { slug: "container-with-most-water", daysAgo: 3, result: "ok", failsFirst: 1 },
    { slug: "3sum", daysAgo: 2, result: "ok", failsFirst: 3 },
    { slug: "product-of-array-except-self", daysAgo: 1, result: "ok" },
    { slug: "trapping-rain-water", daysAgo: 0, result: "ok", failsFirst: 2 },
    { slug: "longest-valid-parentheses", daysAgo: 2, result: "wa" },
    { slug: "median-of-two-sorted-arrays", daysAgo: 0, result: "wa", failsFirst: 1 },
    { slug: "gfe-counter", daysAgo: 5, result: "ok" },
    { slug: "gfe-todo-list", daysAgo: 3, result: "ok", failsFirst: 1 },
    { slug: "gfe-flatten", daysAgo: 2, result: "ok" },
    { slug: "gfe-tabs", daysAgo: 1, result: "ok" },
    { slug: "gfe-deep-clone", daysAgo: 0, result: "wa" },
  ],
};

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function buildSeed(problems: SeedableProblem[]): DbShape {
  const now = new Date();
  const bySlug = new Map(problems.map((p) => [p.slug, p]));
  const submissions: SubmissionRecord[] = [];

  const timestamp = (daysAgo: number, slot: number): string => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(9 + (slot % 11), (slot * 17) % 60, 0, 0);
    if (d > now) {
      // "today" entries: never place them in the future.
      // Higher slot = later in the day, so the ordering matches past days.
      return new Date(now.getTime() - Math.max(1, 40 - slot) * 90_000).toISOString();
    }
    return d.toISOString();
  };

  for (const [userId, entries] of Object.entries(SEEDS)) {
    entries.forEach((entry, entryIndex) => {
      const problem = bySlug.get(entry.slug);
      if (!problem) throw new Error(`Seed references unknown problem "${entry.slug}"`);
      const total = problem.testCount;
      const starter = problem.starterCode;
      const slotBase = entryIndex * 3;

      const push = (status: SubmissionRecord["status"], code: string, passed: number, slot: number) => {
        submissions.push({
          id: `seed-${userId}-${entry.slug}-${slot}`,
          userId,
          slug: entry.slug,
          status,
          code,
          passed,
          total,
          runtimeMs: 38 + (hash(`${userId}:${entry.slug}:${slot}`) % 90),
          createdAt: timestamp(entry.daysAgo, slot),
        });
      };

      for (let f = 0; f < (entry.failsFirst ?? 0); f++) {
        push("Wrong Answer", starter, Math.min(f + 1, total - 1), slotBase + f);
      }
      if (entry.result === "ok") {
        push("Accepted", problem.reference, total, slotBase + (entry.failsFirst ?? 0));
      } else {
        push("Wrong Answer", starter, Math.max(1, Math.floor(total / 3)), slotBase + (entry.failsFirst ?? 0));
      }
    });
  }

  submissions.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return { version: 1, seededAt: now.toISOString(), submissions };
}

export function missingFromSeed(existing: SubmissionRecord[], problems: SeedableProblem[]): SubmissionRecord[] {
  const present = new Set(existing.map((s) => `${s.userId}:${s.slug}`));
  return buildSeed(problems).submissions.filter((s) => !present.has(`${s.userId}:${s.slug}`));
}
