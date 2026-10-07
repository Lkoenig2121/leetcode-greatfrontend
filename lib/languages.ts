export const EDITOR_LANGUAGES = ["javascript", "python", "java", "cpp"] as const;
export type EditorLanguage = (typeof EDITOR_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<EditorLanguage, string> = {
  javascript: "JavaScript",
  python: "Python3",
  java: "Java",
  cpp: "C++",
};

/** The judge sandbox only executes JavaScript. */
export const JUDGE_LANGUAGE: EditorLanguage = "javascript";

export function isEditorLanguage(value: string): value is EditorLanguage {
  return (EDITOR_LANGUAGES as readonly string[]).includes(value);
}
