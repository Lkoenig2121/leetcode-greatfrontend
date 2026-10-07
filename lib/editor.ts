export const PAIRS: Record<string, string> = {
  "{": "}",
  "(": ")",
  "[": "]",
  '"': '"',
  "'": "'",
  "`": "`",
};

const CLOSERS = new Set(Object.values(PAIRS));
const OPENERS = new Set(Object.keys(PAIRS));

export interface Snippet {
  trigger: string;
  label: string;
  /** Use `$0` for the cursor. `INDENT` is replaced with the current line indent. */
  template: string;
}

export const SNIPPETS: Snippet[] = [
  { trigger: "if", label: "if (…) {…}", template: "if ($0) {\nINDENT  \nINDENT}" },
  { trigger: "else", label: "else {…}", template: "else {\nINDENT  $0\nINDENT}" },
  { trigger: "elif", label: "else if (…) {…}", template: "else if ($0) {\nINDENT  \nINDENT}" },
  { trigger: "for", label: "for loop", template: "for (let i = 0; i < $0; i++) {\nINDENT  \nINDENT}" },
  { trigger: "forof", label: "for…of", template: "for (const item of $0) {\nINDENT  \nINDENT}" },
  { trigger: "forin", label: "for…in", template: "for (const key in $0) {\nINDENT  \nINDENT}" },
  { trigger: "while", label: "while (…) {…}", template: "while ($0) {\nINDENT  \nINDENT}" },
  { trigger: "function", label: "function", template: "function $0() {\nINDENT  \nINDENT}" },
  { trigger: "fn", label: "function", template: "function $0() {\nINDENT  \nINDENT}" },
  { trigger: "arrow", label: "arrow function", template: "($0) => {\nINDENT  \nINDENT}" },
  { trigger: "return", label: "return", template: "return $0;" },
  { trigger: "const", label: "const", template: "const $0 = " },
  { trigger: "let", label: "let", template: "let $0 = " },
  { trigger: "log", label: "console.log", template: "console.log($0)" },
  { trigger: "map", label: "array map", template: ".map(($0) => )" },
  { trigger: "filter", label: "array filter", template: ".filter(($0) => )" },
  { trigger: "reduce", label: "array reduce", template: ".reduce((acc, $0) => acc, )" },
  { trigger: "try", label: "try / catch", template: "try {\nINDENT  $0\nINDENT} catch (err) {\nINDENT  \nINDENT}" },
  { trigger: "set", label: "new Set", template: "new Set($0)" },
  { trigger: "mapobj", label: "new Map", template: "new Map($0)" },
];

export interface Edit {
  value: string;
  cursor: number;
}

export function lineStartAt(value: string, index: number): number {
  return value.lastIndexOf("\n", index - 1) + 1;
}

export function indentOfLine(value: string, index: number): string {
  const start = lineStartAt(value, index);
  const line = value.slice(start, index);
  return line.match(/^[ \t]*/)?.[0] ?? "";
}

export function currentWord(value: string, cursor: number): { start: number; word: string } {
  const start = lineStartAt(value, cursor);
  const before = value.slice(start, cursor);
  const match = before.match(/[A-Za-z_$][\w$]*$/);
  if (!match) return { start: cursor, word: "" };
  return { start: cursor - match[0].length, word: match[0] };
}

/**
 * Keyword at the start of the statement, even if the cursor is in spaces (or
 * following text) after it — so `if   ` still counts as the `if` snippet.
 */
export function snippetContext(
  value: string,
  cursor: number,
): { start: number; word: string; after: string } | null {
  const ls = lineStartAt(value, cursor);
  const before = value.slice(ls, cursor);
  const match = before.match(/^([ \t]*)([A-Za-z_$][\w$]*)([ \t]*.*)$/);
  if (!match) return null;
  const word = match[2];
  const after = match[3];
  if (!SNIPPETS.some((s) => s.trigger === word.toLowerCase())) return null;
  if (/[({]/.test(after)) return null;
  return { start: ls + match[1].length, word, after };
}

function wordsInDocument(value: string, except: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const re = /[A-Za-z_$][\w$]{1,}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value))) {
    const w = m[0];
    if (w === except || seen.has(w) || w.length < 2) continue;
    seen.add(w);
    out.push(w);
    if (out.length > 80) break;
  }
  return out;
}

export interface Suggestion {
  id: string;
  label: string;
  detail: string;
  /** Resulting document after accepting, with cursor at `$0`. */
  apply: (value: string, cursor: number) => Edit;
}

function expandSnippet(snippet: Snippet, value: string, cursor: number): Edit {
  const ctx = snippetContext(value, cursor);
  const word = currentWord(value, cursor);
  const start = ctx?.start ?? word.start;
  const indent = indentOfLine(value, cursor);
  const body = snippet.template.replaceAll("INDENT", indent);
  const cursorAt = body.indexOf("$0");
  const inserted = body.replace("$0", "");
  const next = `${value.slice(0, start)}${inserted}${value.slice(cursor)}`;
  const pos = start + (cursorAt === -1 ? inserted.length : cursorAt);
  return { value: next, cursor: pos };
}

export function suggestionsAt(value: string, cursor: number): Suggestion[] {
  const { word } = currentWord(value, cursor);
  if (word.length < 1) return [];

  const lower = word.toLowerCase();
  const out: Suggestion[] = [];

  for (const snippet of SNIPPETS) {
    if (!snippet.trigger.startsWith(lower)) continue;
    out.push({
      id: `s:${snippet.trigger}`,
      label: snippet.trigger,
      detail: snippet.label,
      apply: (v, c) => expandSnippet(snippet, v, c),
    });
  }

  for (const ident of wordsInDocument(value, word)) {
    if (!ident.toLowerCase().startsWith(lower) || ident === word) continue;
    out.push({
      id: `w:${ident}`,
      label: ident,
      detail: "in file",
      apply: (v, c) => {
        const { start } = currentWord(v, c);
        return { value: `${v.slice(0, start)}${ident}${v.slice(c)}`, cursor: start + ident.length };
      },
    });
  }

  return out.slice(0, 7);
}

export function insertText(value: string, start: number, end: number, text: string, cursorOffset = text.length): Edit {
  const next = `${value.slice(0, start)}${text}${value.slice(end)}`;
  return { value: next, cursor: start + cursorOffset };
}

export function handleTab(value: string, start: number, end: number, shift: boolean): Edit {
  if (shift) {
    const from = lineStartAt(value, start);
    const indent = value.slice(from, from + 2) === "  " ? 2 : value[from] === " " || value[from] === "\t" ? 1 : 0;
    if (!indent) return { value, cursor: start };
    const next = `${value.slice(0, from)}${value.slice(from + indent)}`;
    return { value: next, cursor: Math.max(from, start - indent) };
  }
  if (start !== end) {
    return insertText(value, start, end, "  ");
  }
  return insertText(value, start, end, "  ");
}

export function handleEnter(value: string, start: number, end: number): Edit {
  const indent = indentOfLine(value, start);
  const before = value[start - 1];
  const after = value[start];
  if (before && PAIRS[before] === after) {
    const inner = `${indent}  `;
    const text = `\n${inner}\n${indent}`;
    return insertText(value, start, end, text, 1 + inner.length);
  }
  const text = `\n${indent}`;
  return insertText(value, start, end, text);
}

export function handlePair(value: string, start: number, end: number, open: string): Edit | null {
  const close = PAIRS[open];
  if (!close) return null;
  const selected = value.slice(start, end);
  if (start !== end) {
    const wrapped = `${open}${selected}${close}`;
    return { value: `${value.slice(0, start)}${wrapped}${value.slice(end)}`, cursor: start + wrapped.length };
  }
  const nextChar = value[start];
  const isQuote = open === close;
  if (isQuote && nextChar === open) {
    return { value, cursor: start + 1 };
  }
  if (isQuote) {
    const prev = value[start - 1];
    if (prev && /[\w$]/.test(prev)) return null;
  }
  return insertText(value, start, end, `${open}${close}`, 1);
}

export function handleCloser(value: string, start: number, end: number, closer: string): Edit | null {
  if (start !== end) return null;
  if (!CLOSERS.has(closer)) return null;
  if (value[start] === closer) return { value, cursor: start + 1 };
  return null;
}

export function handleBackspace(value: string, start: number, end: number): Edit | null {
  if (start !== end || start === 0) return null;
  const open = value[start - 1];
  const close = value[start];
  if (OPENERS.has(open) && PAIRS[open] === close) {
    return { value: `${value.slice(0, start - 1)}${value.slice(start + 1)}`, cursor: start - 1 };
  }
  return null;
}

