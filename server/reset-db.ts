import fs from "node:fs";
import { DB_FILE } from "./db";

// Deleting the file makes the API re-seed the demo progress on its next start.
if (fs.existsSync(DB_FILE)) {
  fs.unlinkSync(DB_FILE);
  console.log(`Removed ${DB_FILE}. Progress will be re-seeded on next start.`);
} else {
  console.log("Nothing to reset.");
}
