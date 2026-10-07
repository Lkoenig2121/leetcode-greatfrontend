import type { Difficulty, ExampleCase, FrontendKind } from "../../lib/types";

export type UiAction =
  | { action: "click"; selector: string }
  | { action: "type"; selector: string; value: string }
  | { action: "assertText"; selector: string; includes: string }
  | { action: "assertCount"; selector: string; count: number }
  | { action: "assertExists"; selector: string }
  | { action: "assertMissing"; selector: string };

export interface UiScenario {
  name: string;
  visible: boolean;
  steps: UiAction[];
}

export interface JsCase {
  args: unknown[];
  expected: unknown;
  visible: boolean;
  explanation?: string;
  /** If set, the function is expected to return a function that is called this many times. */
  calls?: number;
}

export interface FrontendDef {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  kind: FrontendKind;
  tags: string[];
  acceptance: number;
  description: string[];
  requirements: string[];
  hints: string[];
  fileName: string;
  starterCode: string;
  reference: string;
  functionName?: string;
  jsCases?: JsCase[];
  uiScenarios?: UiScenario[];
  previewCss?: string;
}

export function testCount(def: FrontendDef): number {
  return def.kind === "ui" ? (def.uiScenarios?.length ?? 0) : (def.jsCases?.length ?? 0);
}

export function visibleExamples(def: FrontendDef): ExampleCase[] {
  if (def.kind === "javascript") {
    return (def.jsCases ?? [])
      .filter((c) => c.visible)
      .map((c) => ({
        inputs: c.args.map((value, i) => ({ name: `arg${i}`, value: JSON.stringify(value) })),
        expected: JSON.stringify(c.expected),
        explanation: c.explanation,
      }));
  }
  return (def.uiScenarios ?? [])
    .filter((s) => s.visible)
    .map((s) => ({
      inputs: [{ name: "scenario", value: JSON.stringify(s.name) }],
      expected: '"pass"',
    }));
}
