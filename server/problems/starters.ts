import type { EditorLanguage } from "../../lib/languages";
import type { ProblemDef } from "./types";

function mapType(
  lang: Exclude<EditorLanguage, "javascript">,
  jsType: string,
  hint: { functionName: string },
): string {
  const isMedian = hint.functionName === "findMedianSortedArrays";
  const javaMatrix = hint.functionName === "merge" ? "int[][]" : "List<List<Integer>>";
  const javaStrings = hint.functionName === "reverseString" ? "char[]" : "List<String>";
  if (lang === "python") {
    return (
      {
        number: "int",
        boolean: "bool",
        void: "None",
        string: "str",
        "number[]": "list[int]",
        "string[]": "list[str]",
        "number[][]": "list[list[int]]",
        "string[][]": "list[list[str]]",
      }[jsType] ?? jsType
    );
  }
  if (lang === "java") {
    return (
      {
        number: isMedian ? "double" : "int",
        boolean: "boolean",
        void: "void",
        string: "String",
        "number[]": "int[]",
        "string[]": javaStrings,
        "number[][]": javaMatrix,
        "string[][]": "List<List<String>>",
      }[jsType] ?? jsType
    );
  }
  const cppStrings = hint.functionName === "reverseString" ? "vector<char>" : "vector<string>";
  return (
    {
      number: isMedian ? "double" : "int",
      boolean: "bool",
      void: "void",
      string: "string",
      "number[]": "vector<int>",
      "string[]": cppStrings,
      "number[][]": "vector<vector<int>>",
      "string[][]": "vector<vector<string>>",
    }[jsType] ?? jsType
  );
}

function pythonName(name: string): string {
  return name === "l" || name === "r" ? name : name;
}

export function buildStarterCode(def: ProblemDef, language: EditorLanguage = "javascript"): string {
  const hint = { functionName: def.functionName };
  const params = def.signature.map(([name]) => name).join(", ");
  const bodyComment = def.inPlace ? "Modify the input in place. No return value needed." : "";

  if (language === "javascript") {
    const doc = [
      "/**",
      ...def.signature.map(([name, type]) => ` * @param {${type}} ${name}`),
      ` * @return {${def.returns}}`,
      " */",
    ].join("\n");
    const body = def.inPlace ? `  // ${bodyComment}\n  ` : "  ";
    return `${doc}\nfunction ${def.functionName}(${params}) {\n${body}\n}\n`;
  }

  if (language === "python") {
    const args = [
      "self",
      ...def.signature.map(([name, type]) => `${pythonName(name)}: ${mapType("python", type, hint)}`),
    ].join(", ");
    const ret = mapType("python", def.returns, hint);
    const body = def.inPlace ? `        # ${bodyComment}\n        pass` : "        pass";
    return `class Solution:\n    def ${def.functionName}(${args}) -> ${ret}:\n${body}\n`;
  }

  if (language === "java") {
    const ret = mapType("java", def.returns, hint);
    const args = def.signature.map(([name, type]) => `${mapType("java", type, hint)} ${name}`).join(", ");
    const body = def.inPlace ? `        // ${bodyComment}\n        ` : "        ";
    return `class Solution {\n    public ${ret} ${def.functionName}(${args}) {\n${body}\n    }\n}\n`;
  }

  const ret = mapType("cpp", def.returns, hint);
  const args = def.signature
    .map(([name, type]) => {
      const mapped = mapType("cpp", type, hint);
      const ref = mapped.includes("vector") || mapped === "string" ? "&" : "";
      return `${mapped}${ref} ${name}`;
    })
    .join(", ");
  const body = def.inPlace ? `        // ${bodyComment}\n        ` : "        ";
  return `class Solution {\npublic:\n    ${ret} ${def.functionName}(${args}) {\n${body}\n    }\n};\n`;
}

export function allStarters(def: ProblemDef): Record<EditorLanguage, string> {
  return {
    javascript: buildStarterCode(def, "javascript"),
    python: buildStarterCode(def, "python"),
    java: buildStarterCode(def, "java"),
    cpp: buildStarterCode(def, "cpp"),
  };
}

export function ensureHints(def: ProblemDef): string[] {
  const hints = [...(def.hints ?? [])];
  const extras = [
    `Look at the ${def.tags[0] ?? "input"} and ask what you can remember so each element is handled once.`,
    `The constraints (${def.constraints[0] ?? "input size"}) hint at the time complexity you should aim for.`,
    "If you are stuck, write the brute force, then replace the slow lookup with a faster structure.",
  ];
  for (const extra of extras) {
    if (hints.length >= 3) break;
    if (!hints.includes(extra)) hints.push(extra);
  }
  return hints.slice(0, 3);
}
