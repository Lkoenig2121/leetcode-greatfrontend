import fs from "node:fs";
import path from "node:path";
import type { SubmissionRecord } from "../lib/types";

interface DbShape {
  version: 1;
  seededAt: string;
  submissions: SubmissionRecord[];
}

export const DATA_DIR = process.env.DATA_DIR ?? path.join(__dirname, "data");
export const DB_FILE = path.join(DATA_DIR, "db.json");

let db: DbShape | null = null;

export function dbExists(): boolean {
  return fs.existsSync(DB_FILE);
}

export function initDb(initial: DbShape): void {
  db = initial;
  persist();
}

export function loadDb(): DbShape {
  if (db) return db;
  db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as DbShape;
  return db;
}

function persist(): void {
  if (!db) return;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE); // atomic replace so a crash can't leave a half-written file
}

export function allSubmissions(): SubmissionRecord[] {
  return loadDb().submissions;
}

export function submissionsFor(userId: string): SubmissionRecord[] {
  return loadDb().submissions.filter((s) => s.userId === userId);
}

export function addSubmission(record: SubmissionRecord): void {
  loadDb().submissions.push(record);
  persist();
}

export function addSubmissions(records: SubmissionRecord[]): void {
  if (records.length === 0) return;
  loadDb().submissions.push(...records);
  persist();
}

export type { DbShape };
