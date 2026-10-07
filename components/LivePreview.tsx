"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_CSS = `
  button { font: inherit; padding: 8px 14px; cursor: pointer; border-radius: 8px; border: 1px solid #d4d4d4; background: #fafafa; }
  button:hover { background: #f0f0f0; }
  input, textarea, select { font: inherit; padding: 8px 10px; border-radius: 8px; border: 1px solid #d4d4d4; }
  ul { padding-left: 1.2rem; }
  label { display: flex; gap: 8px; align-items: center; }
`;

/** Drop ESM so the iframe can eval as a classic script (hooks come from React UMD). */
export function preparePreviewSource(code: string): string {
  let src = code.replace(/^\uFEFF/, "");
  src = src.replace(/^\s*import(?:\s+type)?\s+[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*/gm, "");
  src = src.replace(/^\s*import\s+['"][^'"]+['"]\s*;?\s*/gm, "");
  src = src.replace(/export\s+default\s+function\s+(\w+)/g, "function $1");
  src = src.replace(/export\s+default\s+class\s+(\w+)/g, "class $1");
  src = src.replace(/export\s+default\s+/g, "const App = ");
  src = src.replace(/^export\s+(?:async\s+)?function\s+/gm, "function ");
  src = src.replace(/^export\s+class\s+/gm, "class ");
  src = src.replace(/^export\s+(?:const|let|var)\s+/gm, "const ");
  src = src.replace(/^export\s+\{[^}]*\}\s*;?\s*/gm, "");
  src = src.replace(/^export\s+/gm, "");
  return src.trim();
}

function srcDocFor(code: string, css: string): string {
  const payload = JSON.stringify(preparePreviewSource(code)).replace(/</g, "\\u003c");
  const safeCss = css.replace(/</g, "\\3c ");
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body, #root { margin: 0; height: 100%; background: #fff; color: #171717; font-family: ui-sans-serif, system-ui, sans-serif; }
    body { padding: 16px; box-sizing: border-box; }
    ${DEFAULT_CSS}
    ${safeCss}
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>
    (function () {
      const rootEl = document.getElementById("root");
      function fail(err) {
        rootEl.innerHTML = '<pre style="color:#b91c1c;white-space:pre-wrap;font:12px/1.45 ui-monospace,monospace">' +
          String(err && err.stack ? err.stack : err) + "</pre>";
      }
      window.onerror = function (msg) { fail(msg); };
      try {
        const raw = ${payload};
        const transformed = Babel.transform(raw, {
          filename: "App.tsx",
          sourceType: "script",
          parserOpts: { plugins: ["jsx", "typescript"] },
          presets: ["typescript", ["react", { runtime: "classic" }]],
        }).code;
        const fn = new Function(
          "React",
          "ReactDOM",
          "rootEl",
          "const { useState, useEffect, useMemo, useCallback, useRef, useReducer, useId, useLayoutEffect, Fragment } = React;\\n" +
            transformed +
            ";\\nconst __App = typeof App === 'function' ? App : undefined;\\nif (typeof __App !== 'function') throw new Error('Default-export a React component named App.');\\nReactDOM.createRoot(rootEl).render(React.createElement(__App));",
        );
        fn(window.React, window.ReactDOM, rootEl);
      } catch (err) {
        fail(err);
      }
    })();
  </script>
</body>
</html>`;
}

export function LivePreview({
  code,
  css,
  enabled,
}: {
  code: string;
  css?: string;
  enabled: boolean;
}) {
  const [debounced, setDebounced] = useState(code);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(code), 400);
    return () => window.clearTimeout(t);
  }, [code]);

  const srcDoc = useMemo(() => srcDocFor(debounced, css ?? ""), [debounced, css]);

  if (!enabled) {
    return (
      <div className="flex h-full items-center justify-center bg-white p-4 text-center text-sm text-neutral-500">
        No live preview — this is a JavaScript utility. Run the tests to check your function.
      </div>
    );
  }

  return (
    <iframe
      title="Live preview"
      sandbox="allow-scripts"
      srcDoc={srcDoc}
      className="h-full w-full border-0 bg-white"
    />
  );
}
