import { frontendProblems } from "./catalog";
import { judgeFrontend } from "./judge";

console.log("frontend check starting");

async function main() {
  let failed = 0;
  for (const def of frontendProblems) {
    const t0 = Date.now();
    const all = await judgeFrontend(def, def.reference, { visibleOnly: false, stopOnFail: false });
    const ms = Date.now() - t0;
    const ok = all.status === "Accepted" && all.passed === all.total && all.total > 0;
    if (!ok) {
      failed += 1;
      const bad = all.cases.find((c) => !c.passed);
      console.error(`FAIL ${def.slug} ${all.status} ${all.message ?? ""} ${bad ? JSON.stringify(bad) : ""} (${ms}ms)`);
    } else {
      console.log(`OK   ${def.slug} ${all.passed}/${all.total} (${ms}ms)`);
    }
  }
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
