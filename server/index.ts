import { createApp } from "./app";
import { addSubmissions, allSubmissions, DB_FILE, dbExists, initDb, loadDb } from "./db";
import { frontendProblems, testCount } from "./frontend";
import { buildStarterCode, loadProblems } from "./problems";
import { buildSeed, missingFromSeed, type SeedableProblem } from "./seed";
import type { LoadedProblem } from "./problems/types";

const PORT = Number(process.env.API_PORT ?? 4000);

function seedables(problems: LoadedProblem[]): SeedableProblem[] {
  return [
    ...problems.map((p) => ({
      slug: p.slug,
      reference: p.reference,
      starterCode: buildStarterCode(p),
      testCount: p.tests.length,
    })),
    ...frontendProblems.map((p) => ({
      slug: p.slug,
      reference: p.reference,
      starterCode: p.starterCode,
      testCount: testCount(p),
    })),
  ];
}

async function main() {
  const started = Date.now();
  const problems = await loadProblems();
  const catalog = seedables(problems);

  if (dbExists()) {
    loadDb();
    const missing = missingFromSeed(allSubmissions(), catalog);
    if (missing.length > 0) {
      addSubmissions(missing);
      console.log(`[api] backfilled ${missing.length} demo submissions into ${DB_FILE}`);
    }
  } else {
    initDb(buildSeed(catalog));
    console.log(`[api] seeded demo progress into ${DB_FILE}`);
  }

  const app = createApp(problems, frontendProblems);
  app.listen(PORT, () => {
    console.log(
      `[api] ready on http://localhost:${PORT} (${problems.length} algorithms, ${frontendProblems.length} frontend, loaded in ${Date.now() - started}ms)`,
    );
  });
}

main().catch((err) => {
  console.error("[api] failed to start", err);
  process.exit(1);
});
