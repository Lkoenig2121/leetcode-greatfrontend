/**
 * Sanity-checks the judge itself:
 *  1. every reference solution passes every test (including the hand-written example answers)
 *  2. the untouched starter code does NOT pass (so an empty answer can't be "Accepted")
 *  3. a few deliberately broken programs are classified correctly
 *
 * Run with: pnpm verify:problems
 */
import { frontendProblems, judgeFrontend } from "./frontend";
import { judge } from "./judge";
import { buildStarterCode, loadProblems } from "./problems";

let failures = 0;
const fail = (message: string) => {
  failures += 1;
  console.error(`  ✗ ${message}`);
};

async function main() {
  const problems = await loadProblems();

  for (const problem of problems) {
    const all = await judge(problem, problem.reference, problem.tests, { stopOnFail: false });
    const ok = all.status === "Accepted" && all.passed === problem.tests.length;
    if (!ok) {
      const bad = all.cases.find((c) => !c.passed);
      fail(`${problem.slug}: reference failed (${all.status}) ${bad ? JSON.stringify(bad) : (all.message ?? "")}`);
    }

    const starter = await judge(problem, buildStarterCode(problem), problem.tests, { stopOnFail: true });
    if (starter.status === "Accepted") fail(`${problem.slug}: empty starter code was Accepted`);

    console.log(`${ok ? "✓" : "✗"} ${String(problem.id).padStart(3)} ${problem.title} (${problem.tests.length} cases)`);
  }

  console.log("\nBehaviour checks");
  const twoSum = problems.find((p) => p.slug === "two-sum");
  if (!twoSum) throw new Error("two-sum missing");

  const cases: [string, string, string][] = [
    ["infinite loop", "function twoSum(nums, target) { while (true) {} }", "Time Limit Exceeded"],
    ["thrown error", "function twoSum(nums, target) { throw new TypeError('boom'); }", "Runtime Error"],
    ["syntax error", "function twoSum(nums, target) { return [", "Compile Error"],
    ["missing function", "const other = 1;", "Runtime Error"],
    ["wrong answer", "function twoSum(nums, target) { return [0, 0]; }", "Wrong Answer"],
    ["arrow function", "const twoSum = (nums, target) => { const m = {}; for (let i = 0; i < nums.length; i++) { if (target - nums[i] in m) return [m[target - nums[i]], i]; m[nums[i]] = i; } };", "Accepted"],
    ["swapped index order", "function twoSum(nums, target) { for (let i = 0; i < nums.length; i++) for (let j = nums.length - 1; j > i; j--) if (nums[i] + nums[j] === target) return [j, i]; }", "Accepted"],
  ];
  for (const [label, code, expected] of cases) {
    const outcome = await judge(twoSum, code, twoSum.tests, { stopOnFail: true });
    const ok = outcome.status === expected;
    console.log(`${ok ? "✓" : "✗"} ${label} -> ${outcome.status}`);
    if (!ok) fail(`${label}: expected ${expected}, got ${outcome.status} (${outcome.message})`);
  }

  const logger = await judge(
    twoSum,
    "function twoSum(nums, target) { console.log('nums length', nums.length); return [0, 1]; }",
    twoSum.tests.filter((t) => t.visible),
    { stopOnFail: false },
  );
  if (!logger.cases[0]?.stdout.includes("nums length")) fail("console.log output was not captured");
  else console.log("✓ console.log output is captured");

  console.log("\nFront End");
  for (const def of frontendProblems) {
    const all = await judgeFrontend(def, def.reference, { visibleOnly: false, stopOnFail: false });
    const ok = all.status === "Accepted" && all.passed === all.total && all.total > 0;
    if (!ok) {
      const bad = all.cases.find((c) => !c.passed);
      fail(`${def.slug}: reference failed (${all.status}) ${bad ? JSON.stringify(bad) : (all.message ?? "")}`);
    }
    const starter = await judgeFrontend(def, def.starterCode, { visibleOnly: false, stopOnFail: true });
    if (starter.status === "Accepted") fail(`${def.slug}: empty starter code was Accepted`);
    console.log(`${ok ? "✓" : "✗"} ${String(def.id).padStart(3)} ${def.title} (${all.total} cases)`);
  }

  if (failures > 0) {
    console.error(`\n${failures} check(s) failed`);
    process.exit(1);
  }
  console.log("\nAll checks passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
