import type { Difficulty } from "../../lib/types";
import type { CompareMode } from "../sandbox";

/** [args, expected, explanation?] - examples are shown to the user and run on "Run". */
export type ExampleDef = [args: unknown[], expected: unknown, explanation?: string];

export interface ProblemDef {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  /** Paragraphs. Use `backticks` for inline code. */
  description: string[];
  constraints: string[];
  hints?: string[];
  functionName: string;
  /** [parameterName, JSDoc type] - used to generate the starter code and label test inputs. */
  signature: [name: string, type: string][];
  returns: string;
  /** A known-correct solution. Never sent to clients; used to compute hidden expectations. */
  reference: string;
  examples: ExampleDef[];
  /** Hidden test inputs. Expected values are produced by running `reference`. */
  hidden: unknown[][];
  compare?: CompareMode;
  /** The function mutates its first argument instead of returning a value. */
  inPlace?: boolean;
  /** Seeded acceptance rate shown in the table (cosmetic). */
  acceptance: number;
}

export interface LoadedTestCase {
  args: unknown[];
  /** JSON of the expected value */
  expected: string;
  visible: boolean;
  explanation?: string;
}

export interface LoadedProblem extends ProblemDef {
  tests: LoadedTestCase[];
}
