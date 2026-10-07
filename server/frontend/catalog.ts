import type { FrontendDef } from "./types";

export const frontendProblems: FrontendDef[] = [
  {
    id: 1,
    slug: "gfe-counter",
    title: "Counter",
    difficulty: "Easy",
    kind: "ui",
    tags: ["React", "State", "UI"],
    acceptance: 81.4,
    fileName: "App.tsx",
    description: [
      "Build a click counter. This is a short warm-up to get comfortable with the React workspace: edit the component, watch the preview, then run the tests.",
      "The button label must show how many times it has been clicked, starting at 0.",
    ],
    requirements: [
      "Render a single `<button>`.",
      "The button text must be `Clicks: {count}` where `count` starts at `0`.",
      "Each click increments the count by 1.",
    ],
    hints: [
      "Store the count with `useState`.",
      "The click handler should update state with the previous value, e.g. `setCount((c) => c + 1)`.",
      "The label is a template string: `Clicks: ${count}`.",
    ],
    starterCode: `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button
        onClick={() => {
          // Increment the count.
          setCount(count);
        }}
      >
        Clicks: {count}
      </button>
    </div>
  );
}
`,
    reference: `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Clicks: {count}
    </button>
  );
}
`,
    uiScenarios: [
      {
        name: "starts at 0",
        visible: true,
        steps: [{ action: "assertText", selector: "button", includes: "Clicks: 0" }],
      },
      {
        name: "increments once",
        visible: true,
        steps: [
          { action: "click", selector: "button" },
          { action: "assertText", selector: "button", includes: "Clicks: 1" },
        ],
      },
      {
        name: "increments three times",
        visible: false,
        steps: [
          { action: "click", selector: "button" },
          { action: "click", selector: "button" },
          { action: "click", selector: "button" },
          { action: "assertText", selector: "button", includes: "Clicks: 3" },
        ],
      },
    ],
  },
  {
    id: 2,
    slug: "gfe-accordion",
    title: "Accordion",
    difficulty: "Easy",
    kind: "ui",
    tags: ["React", "UI"],
    acceptance: 72.1,
    fileName: "App.tsx",
    description: [
      "Render a list of sections. Clicking a section heading toggles its body. Only one section should be open at a time.",
    ],
    requirements: [
      "Render a heading button for each item with the item `title`.",
      "Clicking a heading opens that item's `content` in a panel.",
      "Opening a different item closes the previously open one.",
      "Clicking the open heading closes it.",
    ],
    hints: [
      "Keep the open item's id (or `null`) in state.",
      "If the clicked id is already open, set state back to `null`.",
      "Only render the content panel when that item's id matches the open id.",
    ],
    starterCode: `const ITEMS = [
  { id: "html", title: "HTML", content: "The structure of a web page." },
  { id: "css", title: "CSS", content: "How the page looks." },
  { id: "js", title: "JavaScript", content: "How the page behaves." },
];

export default function App() {
  return (
    <div>
      {ITEMS.map((item) => (
        <div key={item.id}>
          <button>{item.title}</button>
        </div>
      ))}
    </div>
  );
}
`,
    reference: `import { useState } from "react";

const ITEMS = [
  { id: "html", title: "HTML", content: "The structure of a web page." },
  { id: "css", title: "CSS", content: "How the page looks." },
  { id: "js", title: "JavaScript", content: "How the page behaves." },
];

export default function App() {
  const [open, setOpen] = useState(null);

  return (
    <div>
      {ITEMS.map((item) => (
        <div key={item.id}>
          <button onClick={() => setOpen((cur) => (cur === item.id ? null : item.id))}>
            {item.title}
          </button>
          {open === item.id && <p>{item.content}</p>}
        </div>
      ))}
    </div>
  );
}
`,
    uiScenarios: [
      {
        name: "renders titles",
        visible: true,
        steps: [
          { action: "assertCount", selector: "button", count: 3 },
          { action: "assertText", selector: "button", includes: "HTML" },
        ],
      },
      {
        name: "opens a panel",
        visible: true,
        steps: [
          { action: "click", selector: "button" },
          { action: "assertText", selector: "p", includes: "The structure of a web page." },
        ],
      },
      {
        name: "only one panel open",
        visible: false,
        steps: [
          { action: "click", selector: "button" },
          { action: "click", selector: "div > div:nth-child(2) button" },
          { action: "assertCount", selector: "p", count: 1 },
          { action: "assertText", selector: "p", includes: "How the page looks." },
        ],
      },
    ],
  },
  {
    id: 3,
    slug: "gfe-tabs",
    title: "Tabs",
    difficulty: "Easy",
    kind: "ui",
    tags: ["React", "UI"],
    acceptance: 74.8,
    fileName: "App.tsx",
    description: ["Show a tab bar. Clicking a tab reveals that tab's panel and hides the others."],
    requirements: [
      "Render a button per tab using the tab `label`.",
      "The selected tab's `panel` text is visible.",
      "The first tab is selected on load.",
    ],
    hints: [
      "Store the selected index in `useState(0)`.",
      "Map over the tabs to render buttons, and set the index on click.",
      "Render `tabs[selected].panel` once below the buttons.",
    ],
    starterCode: `const TABS = [
  { label: "Overview", panel: "A short product overview." },
  { label: "Specs", panel: "Weight: 12oz. Battery: 10h." },
  { label: "Reviews", panel: "4.8 stars from 2,104 reviews." },
];

export default function App() {
  return (
    <div>
      {TABS.map((tab) => (
        <button key={tab.label}>{tab.label}</button>
      ))}
    </div>
  );
}
`,
    reference: `import { useState } from "react";

const TABS = [
  { label: "Overview", panel: "A short product overview." },
  { label: "Specs", panel: "Weight: 12oz. Battery: 10h." },
  { label: "Reviews", panel: "4.8 stars from 2,104 reviews." },
];

export default function App() {
  const [selected, setSelected] = useState(0);
  return (
    <div>
      {TABS.map((tab, i) => (
        <button key={tab.label} onClick={() => setSelected(i)}>
          {tab.label}
        </button>
      ))}
      <p>{TABS[selected].panel}</p>
    </div>
  );
}
`,
    uiScenarios: [
      {
        name: "shows first panel",
        visible: true,
        steps: [{ action: "assertText", selector: "p", includes: "A short product overview." }],
      },
      {
        name: "switches to Specs",
        visible: true,
        steps: [
          { action: "click", selector: "button:nth-of-type(2)" },
          { action: "assertText", selector: "p", includes: "Weight: 12oz" },
        ],
      },
      {
        name: "switches to Reviews",
        visible: false,
        steps: [
          { action: "click", selector: "button:nth-of-type(3)" },
          { action: "assertText", selector: "p", includes: "4.8 stars" },
        ],
      },
    ],
  },
  {
    id: 4,
    slug: "gfe-todo-list",
    title: "Todo List",
    difficulty: "Medium",
    kind: "ui",
    tags: ["React", "Forms", "UI"],
    acceptance: 64.2,
    fileName: "App.tsx",
    description: [
      "Build a todo list. Users type a task, submit the form to add it, and can delete existing tasks.",
    ],
    requirements: [
      "An `<input>` for the new task and a submit control (form submit or an Add button).",
      "Submitting a non-empty value appends it to the list and clears the input.",
      "Each item has a Delete button that removes that item.",
      "Empty submissions add nothing.",
    ],
    hints: [
      "Keep `tasks` as an array in state, plus a string for the draft input.",
      "On submit, `preventDefault`, ignore blank strings, then append and reset the input.",
      "Give each row a Delete button that filters that item out of the array.",
    ],
    starterCode: `import { useState } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState([]);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          aria-label="New task"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task}>{task}</li>
        ))}
      </ul>
    </div>
  );
}
`,
    reference: `import { useState } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState([]);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = text.trim();
          if (!value) return;
          setTasks((cur) => [...cur, value]);
          setText("");
        }}
      >
        <input
          aria-label="New task"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task}>
            {task}
            <button onClick={() => setTasks((cur) => cur.filter((t) => t !== task))}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
    uiScenarios: [
      {
        name: "adds a task",
        visible: true,
        steps: [
          { action: "type", selector: "input", value: "Write tests" },
          { action: "click", selector: "button[type='submit']" },
          { action: "assertText", selector: "li", includes: "Write tests" },
        ],
      },
      {
        name: "ignores empty submit",
        visible: true,
        steps: [
          { action: "click", selector: "button[type='submit']" },
          { action: "assertCount", selector: "li", count: 0 },
        ],
      },
      {
        name: "deletes a task",
        visible: false,
        steps: [
          { action: "type", selector: "input", value: "Ship it" },
          { action: "click", selector: "button[type='submit']" },
          { action: "click", selector: "li button" },
          { action: "assertCount", selector: "li", count: 0 },
        ],
      },
    ],
  },
  {
    id: 5,
    slug: "gfe-contact-form",
    title: "Contact Form",
    difficulty: "Medium",
    kind: "ui",
    tags: ["React", "Forms", "Validation"],
    acceptance: 61.0,
    fileName: "App.tsx",
    description: [
      "Build a contact form with name, email, and message fields. Show a success note after a valid submit.",
    ],
    requirements: [
      "Fields: `name`, `email`, and `message`, each with a matching `aria-label`.",
      "A submit button labeled `Send`.",
      "If any field is empty, do not show success.",
      "After a valid submit, render a paragraph containing `Thanks`.",
    ],
    hints: [
      "Controlled inputs: one state field per input.",
      "On submit, check that every trimmed value is non-empty before flipping a `sent` flag.",
      "Render the thanks message only when `sent` is true.",
    ],
    starterCode: `import { useState } from "react";

export default function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <input aria-label="name" value={name} onChange={(e) => setName(e.target.value)} />
      <input aria-label="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <textarea aria-label="message" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button type="submit">Send</button>
    </form>
  );
}
`,
    reference: `import { useState } from "react";

export default function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) return;
        setSent(true);
      }}
    >
      <input aria-label="name" value={name} onChange={(e) => setName(e.target.value)} />
      <input aria-label="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <textarea aria-label="message" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button type="submit">Send</button>
      {sent && <p>Thanks</p>}
    </form>
  );
}
`,
    uiScenarios: [
      {
        name: "blocks incomplete form",
        visible: true,
        steps: [
          { action: "click", selector: "button" },
          { action: "assertMissing", selector: "p" },
        ],
      },
      {
        name: "thanks after valid submit",
        visible: true,
        steps: [
          { action: "type", selector: "[aria-label='name']", value: "Ada" },
          { action: "type", selector: "[aria-label='email']", value: "ada@example.com" },
          { action: "type", selector: "[aria-label='message']", value: "Hello" },
          { action: "click", selector: "button" },
          { action: "assertText", selector: "p", includes: "Thanks" },
        ],
      },
    ],
  },
  {
    id: 6,
    slug: "gfe-star-rating",
    title: "Star Rating",
    difficulty: "Medium",
    kind: "ui",
    tags: ["React", "UI"],
    acceptance: 58.6,
    fileName: "App.tsx",
    description: ["Render 5 star buttons. Clicking star N selects a rating of N (1 through 5)."],
    requirements: [
      "Render exactly 5 buttons.",
      "Each button's accessible name is `Rate {n}` for n = 1..5.",
      "After a click, show a paragraph `Rating: {n}`.",
      "No rating paragraph before the first click.",
    ],
    hints: [
      "Map `[1, 2, 3, 4, 5]` to buttons.",
      "Keep `rating` as `null` initially, then set it to the clicked number.",
      "Use `aria-label={\\`Rate ${n}\\`}`.",
    ],
    starterCode: `export default function App() {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} aria-label={\`Rate \${n}\`}>
          ★
        </button>
      ))}
    </div>
  );
}
`,
    reference: `import { useState } from "react";

export default function App() {
  const [rating, setRating] = useState(null);
  return (
    <div>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} aria-label={\`Rate \${n}\`} onClick={() => setRating(n)}>
          ★
        </button>
      ))}
      {rating != null && <p>Rating: {rating}</p>}
    </div>
  );
}
`,
    uiScenarios: [
      {
        name: "five stars",
        visible: true,
        steps: [{ action: "assertCount", selector: "button", count: 5 }],
      },
      {
        name: "selects 4",
        visible: true,
        steps: [
          { action: "click", selector: "[aria-label='Rate 4']" },
          { action: "assertText", selector: "p", includes: "Rating: 4" },
        ],
      },
      {
        name: "selects 1",
        visible: false,
        steps: [
          { action: "click", selector: "[aria-label='Rate 1']" },
          { action: "assertText", selector: "p", includes: "Rating: 1" },
        ],
      },
    ],
  },
  {
    id: 7,
    slug: "gfe-make-counter",
    title: "Make Counter",
    difficulty: "Easy",
    kind: "javascript",
    tags: ["JavaScript", "Closure"],
    acceptance: 79.3,
    fileName: "index.js",
    functionName: "makeCounter",
    description: [
      "`makeCounter(initialValue = 0)` returns a function. Each call returns the next integer, starting at `initialValue`.",
    ],
    requirements: [
      "The returned function closes over a private count.",
      "The first call returns `initialValue` (default `0`), then 1, 2, … from there.",
      "Separate counters do not share state.",
    ],
    hints: [
      "Return an inner function from `makeCounter`.",
      "Increment after you capture the value to return, or return `count++`.",
      "Each call to `makeCounter` should create its own `let count`.",
    ],
    starterCode: `/**
 * @param {number} [initialValue]
 * @return {function(): number}
 */
export default function makeCounter(initialValue = 0) {
  
}
`,
    reference: `export default function makeCounter(initialValue = 0) {
  let count = initialValue;
  return function () {
    return count++;
  };
}
`,
    jsCases: [
      { args: [], expected: [0, 1, 2], visible: true, explanation: "Default start is 0.", calls: 3 },
      { args: [5], expected: [5, 6], visible: true, calls: 2 },
      { args: [-2], expected: [-2, -1, 0], visible: false, calls: 3 },
    ],
  },
  {
    id: 8,
    slug: "gfe-flatten",
    title: "Flatten",
    difficulty: "Easy",
    kind: "javascript",
    tags: ["JavaScript", "Recursion", "Arrays"],
    acceptance: 76.5,
    fileName: "index.js",
    functionName: "flatten",
    description: [
      "Write `flatten(value)` that takes a nested array and returns a new array with all values in depth-first order, no nesting.",
    ],
    requirements: [
      "Flatten arbitrarily deep arrays.",
      "Do not flatten objects or other values, only arrays.",
      "Do not mutate the input.",
    ],
    hints: [
      "Recurse when you see `Array.isArray(item)`.",
      "`concat` or spread the recursive result into the accumulator.",
      "A reduce-based one-liner works: `acc.concat(Array.isArray(x) ? flatten(x) : x)`.",
    ],
    starterCode: `/**
 * @param {Array} value
 * @return {Array}
 */
export default function flatten(value) {
  
}
`,
    reference: `export default function flatten(value) {
  return value.reduce((acc, cur) => acc.concat(Array.isArray(cur) ? flatten(cur) : cur), []);
}
`,
    jsCases: [
      { args: [[1, [2, [3, 4], 5]]], expected: [1, 2, 3, 4, 5], visible: true },
      { args: [[[]]], expected: [], visible: true },
      { args: [[1, 2, 3]], expected: [1, 2, 3], visible: false },
      { args: [[[1], [[2]], 3]], expected: [1, 2, 3], visible: false },
    ],
  },
  {
    id: 9,
    slug: "gfe-classnames",
    title: "Classnames",
    difficulty: "Easy",
    kind: "javascript",
    tags: ["JavaScript", "Strings"],
    acceptance: 71.2,
    fileName: "index.js",
    functionName: "classNames",
    description: [
      "`classNames(...args)` builds a class string from mixed arguments: strings are included, objects contribute keys whose values are truthy, arrays are flattened.",
    ],
    requirements: [
      "Ignore false, null, undefined, and 0.",
      "Object keys with truthy values are included.",
      "Nested arrays are flattened.",
      "Join surviving names with a single space.",
    ],
    hints: [
      "Walk every argument recursively.",
      "If you see a string (or number other than 0), push it.",
      "If you see a plain object, push keys where the value is truthy.",
    ],
    starterCode: `/**
 * @param {...*} args
 * @return {string}
 */
export default function classNames(...args) {
  
}
`,
    reference: `export default function classNames(...args) {
  const out = [];
  const walk = (value) => {
    if (!value && value !== "") return;
    if (typeof value === "string" || typeof value === "number") {
      if (value) out.push(String(value));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value === "object") {
      for (const key of Object.keys(value)) if (value[key]) out.push(key);
    }
  };
  args.forEach(walk);
  return out.join(" ");
}
`,
    jsCases: [
      { args: ["btn", { active: true, disabled: false }, ["lg", null]], expected: "btn active lg", visible: true },
      { args: [null, undefined, false, 0, "ok"], expected: "ok", visible: true },
      { args: [{ a: 1, b: 0, c: "yes" }], expected: "a c", visible: false },
    ],
  },
  {
    id: 10,
    slug: "gfe-deep-clone",
    title: "Deep Clone",
    difficulty: "Medium",
    kind: "javascript",
    tags: ["JavaScript", "Recursion", "Objects"],
    acceptance: 63.7,
    fileName: "index.js",
    functionName: "deepClone",
    description: [
      "`deepClone(value)` returns a deep copy of JSON-like data: objects, arrays, and primitives. Nested objects must not share references with the original.",
    ],
    requirements: [
      "Primitives are returned as-is.",
      "Arrays and plain objects are copied recursively.",
      "Mutating the clone must not change the original.",
    ],
    hints: [
      "If `value` is not an object (or is null), return it.",
      "If it is an array, `map` `deepClone` over it.",
      "Otherwise build a new object and clone each enumerable key.",
    ],
    starterCode: `/**
 * @param {*} value
 * @return {*}
 */
export default function deepClone(value) {
  
}
`,
    reference: `export default function deepClone(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(deepClone);
  const out = {};
  for (const key of Object.keys(value)) out[key] = deepClone(value[key]);
  return out;
}
`,
    jsCases: [
      { args: [{ a: 1, b: { c: 2 } }], expected: { a: 1, b: { c: 2 } }, visible: true },
      { args: [[[1, 2], 3]], expected: [[1, 2], 3], visible: true },
      { args: [7], expected: 7, visible: false },
      { args: [null], expected: null, visible: false },
    ],
  },
  {
    id: 11,
    slug: "gfe-get",
    title: "Get",
    difficulty: "Medium",
    kind: "javascript",
    tags: ["JavaScript", "Objects"],
    acceptance: 68.4,
    fileName: "index.js",
    functionName: "get",
    description: [
      "`get(object, path, defaultValue)` reads a nested value. `path` is a dot-separated string such as `'a.b.0.c'`. If anything along the way is missing, return `defaultValue`.",
    ],
    requirements: [
      "Split the path on `.` and walk the object.",
      "Numeric segments index into arrays.",
      "Return `defaultValue` (or `undefined`) when a segment is missing.",
    ],
    hints: [
      "Start from `object` and loop through `path.split('.')`.",
      "If the current value is nullish, return the default.",
      "Use bracket access so `'0'` works on arrays.",
    ],
    starterCode: `/**
 * @param {*} object
 * @param {string} path
 * @param {*} [defaultValue]
 * @return {*}
 */
export default function get(object, path, defaultValue) {
  
}
`,
    reference: `export default function get(object, path, defaultValue) {
  const parts = path.split(".");
  let cur = object;
  for (const part of parts) {
    if (cur == null) return defaultValue;
    cur = cur[part];
  }
  return cur === undefined ? defaultValue : cur;
}
`,
    jsCases: [
      { args: [{ a: { b: 3 } }, "a.b"], expected: 3, visible: true },
      { args: [{ a: [{ c: 9 }] }, "a.0.c"], expected: 9, visible: true },
      { args: [{ a: 1 }, "a.b", "missing"], expected: "missing", visible: false },
      { args: [null, "a", 0], expected: 0, visible: false },
    ],
  },
  {
    id: 12,
    slug: "gfe-squash",
    title: "Compact Object",
    difficulty: "Medium",
    kind: "javascript",
    tags: ["JavaScript", "Recursion"],
    acceptance: 60.9,
    fileName: "index.js",
    functionName: "compactObject",
    description: [
      "`compactObject(value)` removes falsy values from a nested object/array. Falsy means `false`, `null`, `0`, `''`, or `undefined`. Recurse into objects and arrays.",
    ],
    requirements: [
      "Drop falsy entries from objects and arrays.",
      "Keep nested structure for values that remain.",
      "Primitives that are truthy are returned as-is.",
    ],
    hints: [
      "If the value is an array, map, compact, then filter Boolean.",
      "If it is an object, copy keys whose compacted value is still truthy.",
      "Remember `[]` and `{}` are truthy, so empty containers stay if they are reached as values… filter after recursion so empty slots disappear.",
    ],
    starterCode: `/**
 * @param {*} value
 * @return {*}
 */
export default function compactObject(value) {
  
}
`,
    reference: `export default function compactObject(value) {
  if (Array.isArray(value)) {
    return value.map(compactObject).filter(Boolean);
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value)) {
      const compacted = compactObject(value[key]);
      if (compacted) out[key] = compacted;
    }
    return out;
  }
  return value;
}
`,
    jsCases: [
      { args: [{ a: 1, b: 0, c: false, d: "ok" }], expected: { a: 1, d: "ok" }, visible: true },
      { args: [[1, 0, 2, "", 3]], expected: [1, 2, 3], visible: true },
      { args: [{ a: { b: 0, c: 2 } }], expected: { a: { c: 2 } }, visible: false },
    ],
  },
];
