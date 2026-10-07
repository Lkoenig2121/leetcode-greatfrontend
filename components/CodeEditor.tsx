"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  handleBackspace,
  handleCloser,
  handleEnter,
  handlePair,
  handleTab,
  PAIRS,
  suggestionsAt,
  type Suggestion,
} from "@/lib/editor";

const LINE_HEIGHT = 24;
const PAD = 12;
const CHAR_W = 8.05;

export function CodeEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const pendingCursor = useRef<number | null>(null);
  const [cursor, setCursor] = useState(0);
  const [openIndex, setOpenIndex] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);

  const lines = useMemo(() => Math.max(12, value.split("\n").length), [value]);
  const suggestions = useMemo(() => suggestionsAt(value, cursor), [value, cursor]);
  const shown = menuOpen ? suggestions : [];

  useLayoutEffect(() => {
    const el = taRef.current;
    if (!el || pendingCursor.current === null) return;
    el.selectionStart = el.selectionEnd = pendingCursor.current;
    setCursor(pendingCursor.current);
    pendingCursor.current = null;
  }, [value]);

  const apply = (next: { value: string; cursor: number }, keepMenu = false) => {
    pendingCursor.current = next.cursor;
    onChange(next.value);
    setCursor(next.cursor);
    if (!keepMenu) setMenuOpen(false);
    setOpenIndex(-1);
  };

  const accept = (suggestion: Suggestion) => {
    apply(suggestion.apply(value, taRef.current?.selectionStart ?? cursor));
  };

  const syncCursor = () => {
    const el = taRef.current;
    if (!el) return;
    setCursor(el.selectionStart);
  };

  const dismissMenu = () => {
    setMenuOpen(false);
    setOpenIndex(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    setCursor(start);

    if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End", "PageDown", "PageUp"].includes(e.key)) {
      dismissMenu();
      return;
    }

    if (shown.length > 0 && e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      accept(shown[openIndex] ?? shown[0]);
      return;
    }
    if (e.key === "Escape" && menuOpen) {
      e.preventDefault();
      dismissMenu();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      apply(handleTab(value, start, end, e.shiftKey));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      apply(handleEnter(value, start, end));
      return;
    }

    if (e.key === "Backspace") {
      const pair = handleBackspace(value, start, end);
      if (pair) {
        e.preventDefault();
        apply(pair);
      }
      return;
    }

    if (e.key.length === 1 && PAIRS[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const paired = handlePair(value, start, end, e.key);
      if (paired) {
        e.preventDefault();
        apply(paired);
        return;
      }
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      const skipped = handleCloser(value, start, end, e.key);
      if (skipped) {
        e.preventDefault();
        apply(skipped);
      }
    }
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    setCursor(el.selectionStart);
    if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End", "PageDown", "PageUp", "Escape", "Tab", "Enter"].includes(e.key)) {
      return;
    }
    const next = suggestionsAt(el.value, el.selectionStart);
    setMenuOpen(next.length > 0);
    setOpenIndex(-1);
  };

  const coords = (() => {
    const start = value.lastIndexOf("\n", cursor - 1) + 1;
    const line = value.slice(0, cursor).split("\n").length - 1;
    const col = cursor - start;
    const scroll = taRef.current?.scrollTop ?? 0;
    return {
      top: PAD + (line + 1) * LINE_HEIGHT - scroll,
      left: PAD + col * CHAR_W,
    };
  })();

  return (
    <div className="relative flex h-full min-h-[240px] overflow-hidden bg-editor font-mono text-[13px] leading-6">
      <div
        ref={gutterRef}
        aria-hidden
        className="shrink-0 overflow-hidden border-r border-border/60 bg-editor px-3 py-3 text-right text-muted"
      >
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} style={{ height: LINE_HEIGHT }}>
            {i + 1}
          </div>
        ))}
      </div>
      <div className="relative min-w-0 flex-1">
        <textarea
          ref={taRef}
          value={value}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          onChange={(e) => {
            onChange(e.target.value);
            setCursor(e.target.selectionStart);
            const next = suggestionsAt(e.target.value, e.target.selectionStart);
            setMenuOpen(next.length > 0);
            setOpenIndex(-1);
          }}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onClick={() => {
            syncCursor();
            dismissMenu();
          }}
          onSelect={syncCursor}
          onScroll={(e) => {
            if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
          }}
          className="h-full min-h-[240px] w-full resize-none bg-transparent p-3 text-foreground outline-none"
        />
        {shown.length > 0 && (
          <ul
            className="absolute z-10 min-w-[140px] max-w-[200px] overflow-hidden rounded border border-border bg-surface-2 py-0.5 text-left shadow-lg"
            style={{ top: Math.max(8, coords.top), left: Math.min(coords.left, 420) }}
          >
            {shown.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    accept(item);
                  }}
                  onMouseEnter={() => setOpenIndex(i)}
                  className={`flex w-full items-baseline justify-between gap-2 px-1.5 py-0.5 text-[11px] leading-4 ${
                    i === openIndex && openIndex >= 0 ? "bg-brand/20 text-foreground" : "text-foreground/85"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="truncate text-[9px] text-muted">{item.detail}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
