// CodeBlock's highlighting (src/components/code-block-prism.ts): Prism reads a block's code whole,
// in the worker, and the page turns its runs into lines. The colours are Prism's for the whole
// text, on this repository's own files; a grammar is looked up only among its own names; while
// code is written the lines the last read ended keep their colours and the rest is plain; a line
// that is the same from one read to the next is one object; and the page's part grows with the
// code, not faster.
//
//   pnpm exec vp test scripts/code-block-prism.test.ts
import { readFileSync } from "node:fs";

import type * as PrismTypes from "prismjs";
import { describe, expect, test } from "vitest";

import {
  colouredLines,
  colouredOf,
  isPrism,
  languages,
  linesOf,
  plainLines,
  runsOf,
} from "../src/components/code-block-prism.ts";
import type { Runs } from "../src/components/code-block-prism.ts";

// As the worker loads them (code-block-worker.ts).
await import("prismjs");
for (const file of [
  "typescript",
  "jsx",
  "tsx",
  "json",
  "bash",
  "python",
  "markdown",
  "yaml",
  "sql",
  "diff",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
  "csharp",
  "markup-templating",
  "php",
  "ruby",
  "kotlin",
  "swift",
  "toml",
  "docker",
]) {
  // oxlint-disable-next-line no-await-in-loop -- each grammar reads those before it
  await import(`prismjs/components/prism-${file}.js`);
}
const found: unknown = Reflect.get(globalThis, "Prism");
if (!isPrism(found)) {
  throw new Error("Prism did not load");
}
const Prism = found;

/** Each character's names, line by line: what the colours are drawn from. */
const namesByLine = (lines: { text: string; types: string[] }[][]) =>
  lines.map((line) =>
    line.flatMap((run) => Array.from(run.text, () => run.types.join(" ")))
  );

/** Prism's own reading of the whole text, line by line, with no runs joined. */
const prismLines = (code: string, grammar: string) => {
  const lines: { text: string; types: string[] }[][] = [[]];
  const walk = (token: string | PrismTypes.Token, types: string[]) => {
    if (typeof token === "string") {
      for (const [index, part] of token.split("\n").entries()) {
        if (index > 0) {
          lines.push([]);
        }
        lines.at(-1)?.push({ text: part, types });
      }
      return;
    }
    const alias = Array.isArray(token.alias) ? token.alias : [token.alias];
    const inner = [...types, token.type, ...alias.filter(Boolean)];
    for (const part of Array.isArray(token.content)
      ? token.content
      : [token.content]) {
      walk(part, inner);
    }
  };
  const grammarOf = Prism.languages[grammar];
  for (const token of grammarOf ? Prism.tokenize(code, grammarOf) : []) {
    walk(token, []);
  }
  if (lines.length > 1 && lines.at(-1)?.every((run) => !run.text) === true) {
    lines.pop();
  }
  return lines;
};

/** A run at every character, the most a reading gives: lines of `a,` in TSX. */
const runDense = (length: number) =>
  "a,".repeat(length / 2).replaceAll(/(?:a,){40}/gu, "$&\n");

/** The fastest of seven runs of `work`, in milliseconds. */
const best = (work: () => unknown) => {
  let fastest = Number.POSITIVE_INFINITY;
  for (let round = 0; round < 7; round += 1) {
    const start = performance.now();
    work();
    fastest = Math.min(fastest, performance.now() - start);
  }
  return fastest;
};

const ALL = Number.POSITIVE_INFINITY;

const runsFor = (code: string, grammar: string): Runs => {
  const runs = runsOf(Prism, code, grammar);
  if (runs === null) {
    throw new Error(`no grammar ${grammar}`);
  }
  return runs;
};

const readWhole = (code: string, grammar: string) =>
  colouredOf(code, runsFor(code, grammar), ALL);

const textOf = (line: { text: string }[] | string) =>
  typeof line === "string" ? line : line.map((run) => run.text).join("");

describe(runsOf, () => {
  test.each(["__proto__", "constructor", "extend", "DFS", "toString"])(
    "%s is no grammar: the code stays plain",
    (grammar) => {
      expect(runsOf(Prism, "const a = 1;", grammar)).toBeNull();
    }
  );

  test("every language a block can name has its grammar in the worker", () => {
    const missing = Object.values(languages).filter(
      ({ grammar }) => runsOf(Prism, "a", grammar) === null
    );
    expect(missing).toStrictEqual([]);
  });
});

describe(linesOf, () => {
  // This repository's own files, the longest of them 2,000 lines and more.
  test.each([
    ["src/components/code-block.tsx", "tsx"],
    ["src/components/diff-viewer.tsx", "tsx"],
    ["scripts/build-registry.ts", "typescript"],
    ["site/start/get-started.ts", "typescript"],
    ["docs/components/code-block.mdx", "markdown"],
    ["pnpm-workspace.yaml", "yaml"],
    ["package.json", "json"],
    ["src/styles/base.css", "css"],
    [".github/workflows/ci.yml", "yaml"],
  ])(
    "%s is coloured line for line as Prism colours the whole file",
    (file, grammar) => {
      const code = readFileSync(
        new URL(`../${file}`, import.meta.url),
        "utf-8"
      );
      const lines = linesOf(code, runsFor(code, grammar), ALL);
      expect(lines.map(textOf)).toStrictEqual(
        code.replace(/\n$/u, "").split("\n")
      );
      expect(namesByLine(lines)).toStrictEqual(
        namesByLine(prismLines(code, grammar))
      );
    }
  );

  test("only the lines asked for are made, the code's own", () => {
    const code = Array.from(
      { length: 50 },
      (_, n) => `const a${n} = ${n};`
    ).join("\n");
    const lines = linesOf(code, runsFor(code, "typescript"), 18);
    expect(lines).toHaveLength(18);
    expect(lines.map(textOf)).toStrictEqual(code.split("\n").slice(0, 18));
    expect(plainLines(code, 3)).toStrictEqual([
      "const a0 = 0;",
      "const a1 = 1;",
      "const a2 = 2;",
    ]);
  });

  test("the page's part grows with the code, not faster", () => {
    const small = runDense(25_000);
    const large = runDense(200_000);
    const smallRuns = runsFor(small, "tsx");
    const largeRuns = runsFor(large, "tsx");
    const smallTime = best(() => linesOf(small, smallRuns, ALL));
    const largeTime = best(() => linesOf(large, largeRuns, ALL));
    // Eight times the code: about eight times the work. Growing as its square would be 64.
    expect(largeTime / smallTime).toBeLessThan(24);
  });
});

describe(colouredLines, () => {
  test("while code is written, the lines the last read ended keep their colours and the rest is plain", () => {
    const before = "const a = 1;\nconst b";
    const now = `${before} = 2;\nconst c = 3;`;
    const lines = colouredLines(now, readWhole(before, "typescript"), ALL);
    expect(lines).toHaveLength(3);
    expect(lines[0]).not.toBeTypeOf("string");
    expect(lines[0]?.length).toBeGreaterThan(1);
    expect(lines.slice(1)).toStrictEqual(["const b = 2;", "const c = 3;"]);
  });

  test("runs read for other code colour nothing", () => {
    expect(
      colouredLines("let x = 1;", readWhole("const a = 1;", "typescript"), ALL)
    ).toStrictEqual(["let x = 1;"]);
  });

  test("past the lines a read coloured, the code is plain, every line in its place", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;";
    const read = colouredOf(code, runsFor(code, "typescript"), 2);
    const lines = colouredLines(code, read, ALL);
    expect(lines.map(textOf)).toStrictEqual(code.split("\n"));
    expect(lines.slice(2)).toStrictEqual(["const c = 3;", "const d = 4;"]);
    expect(colouredLines(`${code}\n`, read, ALL).map(textOf)).toStrictEqual(
      code.split("\n")
    );
  });

  test("a line that is the same in the next read is the same object, and one that changed is not", () => {
    const before = "const a = 1;\nconst b";
    const now = `${before} = 2;\nconst c = 3;`;
    const first = readWhole(before, "typescript");
    const next = colouredOf(now, runsFor(now, "typescript"), ALL, first.lines);
    expect(next.lines[0]).toBe(first.lines[0]);
    expect(next.lines[1]).not.toBe(first.lines[1]);
    expect(next.lines.map(textOf)).toStrictEqual(now.split("\n"));
  });
});
