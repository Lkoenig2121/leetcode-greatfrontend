import type { Difficulty } from "@/lib/types";

const STYLES: Record<Difficulty, string> = {
  Easy: "text-easy bg-easy/10",
  Medium: "text-medium bg-medium/10",
  Hard: "text-hard bg-hard/10",
};

export const DIFFICULTY_TEXT: Record<Difficulty, string> = {
  Easy: "text-easy",
  Medium: "text-medium",
  Hard: "text-hard",
};

export function DifficultyBadge({ difficulty, className = "" }: { difficulty: Difficulty; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[difficulty]} ${className}`}>
      {difficulty}
    </span>
  );
}
