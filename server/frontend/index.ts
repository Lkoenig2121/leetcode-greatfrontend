import type { FrontendProblemDetail, ProblemStatus, ProblemSummary } from "../../lib/types";
import { frontendProblems } from "./catalog";
import { testCount, visibleExamples, type FrontendDef } from "./types";

export { frontendProblems } from "./catalog";
export { judgeFrontend } from "./judge";
export { testCount } from "./types";
export type { FrontendDef } from "./types";

export function getFrontend(slug: string): FrontendDef | undefined {
  return frontendProblems.find((p) => p.slug === slug);
}

export function toFrontendSummary(def: FrontendDef, status: ProblemStatus): ProblemSummary {
  return {
    id: def.id,
    slug: def.slug,
    title: def.title,
    difficulty: def.difficulty,
    tags: def.tags,
    status,
    acceptance: def.acceptance,
    kind: def.kind,
  };
}

export function toFrontendDetail(def: FrontendDef, status: ProblemStatus): FrontendProblemDetail {
  return {
    ...toFrontendSummary(def, status),
    description: def.description,
    requirements: def.requirements,
    hints: def.hints.slice(0, 3),
    fileName: def.fileName,
    starterCode: def.starterCode,
    examples: visibleExamples(def),
    totalTestCases: testCount(def),
    previewCss: def.previewCss,
  };
}

export function frontendSlugs(): string[] {
  return frontendProblems.map((p) => p.slug);
}
