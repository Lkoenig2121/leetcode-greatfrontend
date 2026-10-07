import type { Difficulty, ProblemStatus, SubmissionStatus } from "./types";

export const difficultyClass: Record<Difficulty, string> = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
};

export function statusLabel(status: ProblemStatus): string {
  if (status === "solved") return "Solved";
  if (status === "attempted") return "Attempted";
  return "Todo";
}

export function verdictColor(status: SubmissionStatus): string {
  if (status === "Accepted") return "text-accepted";
  if (status === "Wrong Answer") return "text-wrong";
  if (status === "Time Limit Exceeded" || status === "Memory Limit Exceeded") return "text-medium";
  return "text-hard";
}

export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.max(1, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
