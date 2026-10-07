import React from "react";
import ts from "typescript";
import type { CaseResult, SubmissionStatus } from "../../lib/types";
import type { JudgeOutcome } from "../judge";
import type { FrontendDef, UiAction, UiScenario } from "./types";

type Host = {
  type: string;
  props: Record<string, unknown>;
  children: Host[];
  parent: Host | null;
  text: string;
};

function compile(code: string): string {
  let src = code.replace(/^\uFEFF/, "");
  src = src.replace(/^\s*import(?:\s+type)?\s+[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*/gm, "");
  src = src.replace(/^\s*import\s+['"][^'"]+['"]\s*;?\s*/gm, "");
  src = src.replace(/export\s+default\s+function\s+(\w+)/g, "function $1");
  src = src.replace(/export\s+default\s+class\s+(\w+)/g, "class $1");
  src = src.replace(/export\s+default\s+/g, "exports.default = ");
  src = src.replace(/^export\s+/gm, "");
  return ts.transpileModule(src, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2019,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
    fileName: "App.tsx",
  }).outputText;
}

function loadApp(code: string, hooks: Record<string, unknown>): React.ComponentType {
  const compiled = compile(code);
  const module = { exports: {} as { default?: React.ComponentType } };
  const wrapped = `
    const { useState, useEffect, useMemo, useCallback, useRef, useReducer, useId, useLayoutEffect, Fragment } = hooks;
    ${compiled}
    if (typeof App === "function" && !exports.default) exports.default = App;
  `;
  const fn = new Function("React", "hooks", "module", "exports", "require", wrapped);
  fn(React, hooks, module, module.exports, (id: string) => {
    if (id === "react") return React;
    throw new Error(`Cannot import "${id}" in the UI sandbox`);
  });
  const App = module.exports.default;
  if (typeof App !== "function") {
    throw new Error("Default export a React component named App (or export default function App).");
  }
  return App;
}

function createRuntime() {
  const hookStore: unknown[] = [];
  let hookIndex = 0;
  let dirty = false;

  const useState = <T,>(init: T | (() => T)): [T, (v: T | ((p: T) => T)) => void] => {
    const i = hookIndex++;
    if (hookStore.length <= i) hookStore[i] = typeof init === "function" ? (init as () => T)() : init;
    const set = (v: T | ((p: T) => T)) => {
      const prev = hookStore[i] as T;
      hookStore[i] = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      dirty = true;
    };
    return [hookStore[i] as T, set];
  };

  const useRef = <T,>(init: T) => {
    const i = hookIndex++;
    if (hookStore.length <= i) hookStore[i] = { current: init };
    return hookStore[i] as { current: T };
  };

  const useMemo = <T,>(fn: () => T) => fn();
  const useCallback = <T,>(fn: T) => fn;
  const useEffect = () => undefined;
  const useLayoutEffect = (fn: () => void) => {
    fn();
  };
  const useId = () => {
    const i = hookIndex++;
    if (hookStore.length <= i) hookStore[i] = `:r${i}:`;
    return hookStore[i] as string;
  };
  const useReducer = <S, A>(reducer: (s: S, a: A) => S, init: S): [S, (a: A) => void] => {
    const [state, setState] = useState(init);
    return [state, (action: A) => setState((s) => reducer(s, action))];
  };

  const beginPass = () => {
    hookIndex = 0;
    dirty = false;
  };

  return {
    hooks: {
      useState,
      useEffect,
      useMemo,
      useCallback,
      useRef,
      useReducer,
      useId,
      useLayoutEffect,
      Fragment: React.Fragment,
    },
    beginPass,
    isDirty: () => dirty,
  };
}

function elementChildren(value: unknown): unknown[] {
  if (value == null || value === false || value === true) return [];
  if (Array.isArray(value)) return value.flatMap(elementChildren);
  return [value];
}

function materialize(el: unknown, parent: Host | null): Host[] {
  if (el == null || el === false || el === true) return [];
  if (typeof el === "string" || typeof el === "number") {
    return [{ type: "#text", props: {}, children: [], parent, text: String(el) }];
  }
  if (Array.isArray(el)) return el.flatMap((child) => materialize(child, parent));

  const node = el as { type?: unknown; props?: Record<string, unknown> };
  if (typeof node !== "object" || node === null || node.type == null) return [];

  if (node.type === React.Fragment) {
    return materialize(node.props?.children, parent);
  }
  if (typeof node.type === "function") {
    const rendered = (node.type as (props: unknown) => unknown)(node.props ?? {});
    return materialize(rendered, parent);
  }
  if (typeof node.type !== "string") return [];

  const host: Host = {
    type: node.type.toLowerCase(),
    props: node.props ?? {},
    children: [],
    parent,
    text: "",
  };
  for (const child of elementChildren(node.props?.children)) {
    host.children.push(...materialize(child, host));
  }
  host.text = host.children.map((c) => (c.type === "#text" ? c.text : c.text)).join("");
  return [host];
}

function renderApp(App: React.ComponentType, runtime: ReturnType<typeof createRuntime>): Host {
  let root: Host = { type: "root", props: {}, children: [], parent: null, text: "" };
  const paint = () => {
    runtime.beginPass();
    root = {
      type: "root",
      props: {},
      children: materialize(React.createElement(App), null),
      parent: null,
      text: "",
    };
    for (const child of root.children) child.parent = root;
    root.text = root.children.map((c) => c.text).join("");
  };
  paint();
  let safety = 0;
  while (runtime.isDirty() && safety < 25) {
    safety += 1;
    paint();
  }
  return root;
}

type SimpleSel = {
  tag?: string;
  nthChild?: number;
  nthOfType?: number;
  attrs: Record<string, string>;
};

function parseSimple(token: string): SimpleSel {
  const attrs: Record<string, string> = {};
  let rest = token.trim();
  rest = rest.replace(/\[([^=\]]+)=['"]([^'"]*)['"]\]/g, (_, name, value) => {
    attrs[name.trim()] = value;
    return "";
  });
  rest = rest.replace(/\[([^=\]]+)\]/g, (_, name) => {
    attrs[name.trim()] = "";
    return "";
  });
  let nthChild: number | undefined;
  let nthOfType: number | undefined;
  rest = rest.replace(/:nth-child\((\d+)\)/, (_, n) => {
    nthChild = Number(n);
    return "";
  });
  rest = rest.replace(/:nth-of-type\((\d+)\)/, (_, n) => {
    nthOfType = Number(n);
    return "";
  });
  const tag = rest.replace(/^[.#].*/, "").trim().toLowerCase() || undefined;
  const id = token.match(/#([\w-]+)/)?.[1];
  const cls = token.match(/\.([\w-]+)/)?.[1];
  if (id) attrs.id = id;
  if (cls) attrs.className = cls;
  return { tag: tag && tag !== "*" ? tag : undefined, nthChild, nthOfType, attrs };
}

function attrOf(node: Host, name: string): string | undefined {
  if (name === "class" || name === "className") return String(node.props.className ?? "");
  if (name in node.props) return String(node.props[name]);
  const aria = name.startsWith("aria-") ? node.props : undefined;
  if (aria && name in node.props) return String(node.props[name]);
  return undefined;
}

function matchSimple(node: Host, sel: SimpleSel, siblings: Host[]): boolean {
  if (node.type === "#text" || node.type === "root") return false;
  if (sel.tag && node.type !== sel.tag) return false;
  for (const [key, value] of Object.entries(sel.attrs)) {
    const got = attrOf(node, key);
    if (value === "") {
      if (got == null) return false;
    } else if (got !== value) return false;
  }
  const elements = siblings.filter((s) => s.type !== "#text" && s.type !== "root");
  if (sel.nthChild != null && elements[sel.nthChild - 1] !== node) return false;
  if (sel.nthOfType != null) {
    const same = elements.filter((s) => s.type === node.type);
    if (same[sel.nthOfType - 1] !== node) return false;
  }
  return true;
}

function parseSelector(selector: string): { combinator: "desc" | "child"; simple: SimpleSel }[] {
  const parts: { combinator: "desc" | "child"; simple: SimpleSel }[] = [];
  const tokens = selector.trim().split(/(\s*>\s*|\s+)/).filter((t) => t.trim() !== "");
  let combinator: "desc" | "child" = "desc";
  for (const token of tokens) {
    if (token.trim() === ">") {
      combinator = "child";
      continue;
    }
    if (/^\s+$/.test(token)) {
      combinator = "desc";
      continue;
    }
    parts.push({ combinator, simple: parseSimple(token) });
    combinator = "desc";
  }
  return parts;
}

function queryAll(root: Host, selector: string): Host[] {
  const parts = parseSelector(selector);
  if (parts.length === 0) return [];

  const walk = (node: Host, acc: Host[]) => {
    acc.push(node);
    for (const child of node.children) walk(child, acc);
  };
  const all: Host[] = [];
  walk(root, all);

  const matchFrom = (nodes: Host[], partIndex: number): Host[] => {
    const part = parts[partIndex];
    const next: Host[] = [];
    for (const node of nodes) {
      const candidates =
        part.combinator === "child"
          ? node.children
          : (() => {
              const desc: Host[] = [];
              const collect = (n: Host) => {
                for (const c of n.children) {
                  desc.push(c);
                  collect(c);
                }
              };
              collect(node);
              return desc;
            })();
      for (const cand of candidates) {
        const sibs = cand.parent?.children ?? [];
        if (matchSimple(cand, part.simple, sibs)) next.push(cand);
      }
    }
    if (partIndex === parts.length - 1) return next;
    return matchFrom(next, partIndex + 1);
  };

  return matchFrom([root], 0);
}

function query(root: Host, selector: string): Host | null {
  return queryAll(root, selector)[0] ?? null;
}

function fakeEvent(extra: Record<string, unknown> = {}) {
  return {
    preventDefault() {},
    stopPropagation() {},
    ...extra,
  };
}

function runStep(getRoot: () => Host, setRoot: (root: Host) => void, App: React.ComponentType, runtime: ReturnType<typeof createRuntime>, step: UiAction): void {
  const commit = () => {
    if (runtime.isDirty()) setRoot(renderApp(App, runtime));
  };

  switch (step.action) {
    case "click": {
      const el = query(getRoot(), step.selector);
      if (!el) throw new Error(`No element matches "${step.selector}"`);
      const onClick = el.props.onClick as ((e: unknown) => void) | undefined;
      if (typeof onClick === "function") onClick(fakeEvent({ target: el.props, currentTarget: el.props }));
      if (el.type === "button" && el.props.type !== "button") {
        let p = el.parent;
        while (p) {
          if (p.type === "form") {
            const onSubmit = p.props.onSubmit as ((e: unknown) => void) | undefined;
            if (typeof onSubmit === "function") onSubmit(fakeEvent({ target: p.props, currentTarget: p.props }));
            break;
          }
          p = p.parent;
        }
      }
      commit();
      return;
    }
    case "type": {
      const el = query(getRoot(), step.selector);
      if (!el) throw new Error(`No element matches "${step.selector}"`);
      const event = fakeEvent({
        target: { value: step.value },
        currentTarget: { value: step.value },
      });
      const onInput = el.props.onInput as ((e: unknown) => void) | undefined;
      const onChange = el.props.onChange as ((e: unknown) => void) | undefined;
      if (typeof onInput === "function") onInput(event);
      if (typeof onChange === "function") onChange(event);
      commit();
      return;
    }
    case "assertText": {
      const el = query(getRoot(), step.selector);
      if (!el) throw new Error(`No element matches "${step.selector}"`);
      const got = el.text.replace(/\s+/g, " ").trim();
      if (!got.includes(step.includes)) {
        throw new Error(`Expected "${step.selector}" to include "${step.includes}", got "${got}"`);
      }
      return;
    }
    case "assertCount": {
      const n = queryAll(getRoot(), step.selector).length;
      if (n !== step.count) throw new Error(`Expected ${step.count} "${step.selector}", found ${n}`);
      return;
    }
    case "assertExists": {
      if (!query(getRoot(), step.selector)) throw new Error(`Expected "${step.selector}" to exist`);
      return;
    }
    case "assertMissing": {
      if (query(getRoot(), step.selector)) throw new Error(`Expected "${step.selector}" to be missing`);
    }
  }
}

function runScenario(code: string, scenario: UiScenario, index: number): CaseResult {
  const started = Date.now();
  try {
    const runtime = createRuntime();
    const App = loadApp(code, runtime.hooks);
    let root = renderApp(App, runtime);
    for (const step of scenario.steps) {
      runStep(
        () => root,
        (next) => {
          root = next;
        },
        App,
        runtime,
        step,
      );
    }
    return {
      index,
      passed: true,
      inputs: [{ name: "scenario", value: JSON.stringify(scenario.name) }],
      expected: '"pass"',
      output: '"pass"',
      stdout: "",
      error: null,
      timeMs: Date.now() - started,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      index,
      passed: false,
      inputs: [{ name: "scenario", value: JSON.stringify(scenario.name) }],
      expected: '"pass"',
      output: null,
      stdout: "",
      error: message,
      timeMs: Date.now() - started,
    };
  }
}

async function judgeUiUnlocked(
  def: FrontendDef,
  code: string,
  scenarios: UiScenario[],
  stopOnFail: boolean,
): Promise<JudgeOutcome> {
  try {
    loadApp(code, createRuntime().hooks);
  } catch (err) {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    const status: SubmissionStatus = /Syntax|TS\d/.test(message) ? "Compile Error" : "Runtime Error";
    return { status, message, cases: [], passed: 0, total: scenarios.length, runtimeMs: 0, stdout: "" };
  }

  const cases: CaseResult[] = [];
  for (let i = 0; i < scenarios.length; i++) {
    const result = runScenario(code, scenarios[i], i);
    cases.push(result);
    if (!result.passed && stopOnFail) break;
  }

  const passed = cases.filter((c) => c.passed).length;
  const failed = cases.find((c) => !c.passed);
  const runtimeMs = Math.max(1, cases.reduce((s, c) => s + c.timeMs, 0));
  let status: SubmissionStatus = "Accepted";
  let message: string | null = null;
  if (failed) {
    status = "Wrong Answer";
    message = failed.error;
  }
  return { status, message, cases, passed, total: scenarios.length, runtimeMs, stdout: "" };
}

export function judgeUi(
  def: FrontendDef,
  code: string,
  scenarios: UiScenario[],
  stopOnFail: boolean,
): Promise<JudgeOutcome> {
  return judgeUiUnlocked(def, code, scenarios, stopOnFail);
}
