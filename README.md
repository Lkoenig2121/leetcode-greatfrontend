# LeetCode Again

A LeetCode-style practice app: pick one of three demo accounts, browse a problem set, write JavaScript, and have a real judge run your function against example and hidden test cases.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS 4** for the UI
- **Node.js** + **Express 5** for auth, progress, and the code judge

The Next dev server proxies `/api/*` to Express (`http://localhost:4000`) so the browser stays on a single origin.

## Run locally

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

| Script | What it does |
| --- | --- |
| `pnpm dev` | Next on :3000 and the API on :4000 |
| `pnpm verify:problems` | Confirms every reference solution passes, and that empty/broken code does not |
| `pnpm reset:db` | Deletes `server/data/db.json` so demo progress is re-seeded on next start |

## Accounts

No passwords. Choose Alice, Bob, or Carol on the login screen — each already has a different set of solved / attempted problems.

## How judging works

- **Run** executes the visible example cases (the ones shown in the problem statement).
- **Submit** executes every case, including hidden ones, and records the attempt.
- Solutions are JavaScript functions (`function twoSum(...) { ... }` or an equivalent assignment). The judge compares JSON-serialized return values (and in-place mutations where the problem requires them).
