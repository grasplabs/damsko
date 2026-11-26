// CodeBlock's highlighting (src/components/code-block-highlight.ts), with the lexers themselves: a
// file is coloured line for line, its text exactly the code's; the lexers' names come out as
// Damsko's colours; while code is written each line is read once, keeps its object, and is what
// the whole code read at once gives; a long line is its text; past MOST_RUNS a stream gives up;
// a language the lexers do not know is plain; and text that holds regular-expression highlighters
// for seconds is read in milliseconds.
//
//   pnpm exec vp test scripts/code-block-highlight.test.ts
import { readFileSync } from "node:fs";

import * as engine from "@pierre/highlights";
import { describe, expect, test } from "vitest";

import {
  colouredRuns,
  doneLines,
  languages,
  MOST_LINE,
  MOST_RUNS,
  newReading,
  plainLines,
  stopReading,
  writtenLines,
} from "../src/components/code-block-highlight.ts";
import type { Line } from "../src/components/code-block-highlight.ts";

const ALL = Number.POSITIVE_INFINITY;

const textOf = (line: Line) => line.map((run) => run.text).join("");

/** Each run as `text:tone`, a line at a time. */
const shapeOf = (lines: Line[]) =>
  lines.map((line) => line.map((run) => `${run.text}:${run.tone ?? "-"}`));

const whole = (code: string, language: string, most = ALL) =>
  doneLines(newReading(), engine, code, language, most);

const fileOf = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf-8");

describe(doneLines, () => {
  // This repository's own files, the longest of them 2,000 lines and more.
  test.each([
    ["src/components/code-block.tsx", "tsx"],
    ["src/components/diff-viewer.tsx", "tsx"],
    ["scripts/build-registry.ts", "ts"],
    ["site/start/get-started.ts", "ts"],
    ["docs/components/code-block.mdx", "markdown"],
    ["pnpm-workspace.yaml", "yaml"],
    ["package.json", "json"],
    ["src/styles/base.css", "css"],
    [".github/workflows/ci.yml", "yaml"],
  ])("%s is coloured line for line, its text the code's", (file, language) => {
    const code = fileOf(file);
    const lines = whole(code, language);
    expect(lines?.map(textOf)).toStrictEqual(
      code.replace(/\n$/u, "").split("\n")
    );
    expect(colouredRuns(lines ?? [])).toBeGreaterThan(100);
  });

  test("the lexers' names come out as Damsko's colours, and a name it has none for in the code's own", () => {
    const code = [
      'import { readFile } from "node:fs";',
      "// a note",
      "export const total = (rows: number[]) => rows.length * 2 > 0 ? true : null;",
    ].join("\n");
    expect(shapeOf(whole(code, "ts") ?? [])).toStrictEqual([
      [
        "import :keyword",
        "{ :punctuation",
        "readFile :-",
        "} :punctuation",
        "from :keyword",
        '"node:fs":string',
        ";:punctuation",
      ],
      ["// a note:comment"],
      [
        "export const :keyword",
        "total :-",
        "= (:punctuation",
        "rows:-",
        ": :punctuation",
        "number:keyword",
        "[]) => :punctuation",
        "rows:-",
        ".:punctuation",
        "length :attribute",
        "* :punctuation",
        "2 :constant",
        "> :punctuation",
        "0 :constant",
        "? :punctuation",
        "true :constant",
        ": :punctuation",
        "null:constant",
        ";:punctuation",
      ],
    ]);
  });

  test("a diff's lines are inserted and deleted", () => {
    const tones = (whole("-old\n+new", "diff") ?? []).map((line) =>
      line.map((run) => run.tone)
    );
    expect(tones.flat()).toContain("deleted");
    expect(tones.flat()).toContain("inserted");
  });

  test("every language a block names is coloured", () => {
    const plain = Object.keys(languages).filter(
      (language) => whole("a = 1", language) === null
    );
    expect(plain).toStrictEqual([]);
  });

  test.each(["text", "plain", "ansi", "nonsense", "__proto__", "constructor"])(
    "%s is not coloured: the code stays plain",
    (language) => {
      expect(whole("const a = 1;", language)).toBeNull();
    }
  );

  test("a line of MOST_LINE characters or more is its text, one run; the lines round it are coloured", () => {
    const long = `const a = [${"1,".repeat(MOST_LINE)}];`;
    const lines = whole(`const b = 1;\n${long}\nconst c = 2;`, "ts") ?? [];
    expect(lines[1]).toStrictEqual([{ text: long, tone: null }]);
    expect(colouredRuns([lines[0] ?? []])).toBeGreaterThan(1);
    expect(colouredRuns([lines[2] ?? []])).toBeGreaterThan(1);
  });

  test("only the lines asked for are read, the code's own", () => {
    const code = Array.from(
      { length: 50 },
      (_, n) => `const a${n} = ${n};`
    ).join("\n");
    expect(whole(code, "ts", 18)?.map(textOf)).toStrictEqual(
      code.split("\n").slice(0, 18)
    );
    expect(plainLines(code, 3)).toStrictEqual([
      "const a0 = 0;",
      "const a1 = 1;",
      "const a2 = 2;",
    ]);
    expect(plainLines("a\nb\n", ALL)).toStrictEqual(["a", "b"]);
    // A blank line at the cut is a line.
    expect(plainLines("a\n\nb", 2)).toStrictEqual(["a", ""]);
    expect(whole("a\n\nb", "ts", 2)?.map(textOf)).toStrictEqual(["a", ""]);
  });

  test("read again for the same code, folded or open, it gives the same lines", () => {
    const reading = newReading();
    const code = Array.from(
      { length: 40 },
      (_, n) => `const a${n} = ${n};`
    ).join("\n");
    const folded = doneLines(reading, engine, code, "ts", 18) ?? [];
    const open = doneLines(reading, engine, code, "ts", ALL) ?? [];
    expect(open).toHaveLength(40);
    expect(doneLines(reading, engine, code, "ts", ALL)).toBe(open);
    // Folded again, the lines are the open block's.
    const again = doneLines(reading, engine, code, "ts", 18) ?? [];
    expect(again[17]).toBe(open[17]);
    expect(folded.map(textOf)).toStrictEqual(again.map(textOf));
  });
});

describe(writtenLines, () => {
  const code = fileOf("src/components/dialog.tsx");
  /** `code` in `count` pieces, as a model writes it. */
  const chunks = (count: number) => {
    const size = Math.ceil(code.length / count);
    return Array.from({ length: count }, (_, at) =>
      code.slice(0, Math.min(code.length, (at + 1) * size))
    );
  };

  test("while code is written, the lines a newline ended are coloured, each once, as the whole code read at once colours them", () => {
    const reading = newReading();
    let before: Line[] = [];
    for (const written of chunks(50)) {
      const lines = writtenLines(reading, engine, written, "tsx", ALL) ?? [];
      // The lines already given are the same objects: never drawn again.
      for (const [at, line] of before.entries()) {
        expect(lines[at]).toBe(line);
      }
      // Only lines a newline has ended.
      expect(lines).toHaveLength(written.split("\n").length - 1);
      before = lines;
    }
    // Done: the stream reads the rest, every line it gave kept, and it is the whole code read at once.
    const done = doneLines(reading, engine, code, "tsx", ALL) ?? [];
    for (const [at, line] of before.entries()) {
      expect(done[at]).toBe(line);
    }
    expect(shapeOf(done)).toStrictEqual(shapeOf(whole(code, "tsx") ?? []));
  });

  test("the same code given again reads nothing more", () => {
    const reading = newReading();
    const first = writtenLines(
      reading,
      engine,
      "const a = 1;\nconst b",
      "ts",
      ALL
    );
    const again = writtenLines(
      reading,
      engine,
      "const a = 1;\nconst b",
      "ts",
      ALL
    );
    expect(again).toStrictEqual(first);
    expect(again?.[0]).toBe(first?.[0]);
  });

  test("code that is not what was read and more starts a new reading", () => {
    const reading = newReading();
    writtenLines(reading, engine, "const a = 1;\n", "ts", ALL);
    const lines = writtenLines(
      reading,
      engine,
      "let x = '\nlet y\n",
      "ts",
      ALL
    );
    expect(lines?.map(textOf)).toStrictEqual(["let x = '", "let y"]);
  });

  test("stopped and read again, a stream starts anew and colours what comes", () => {
    const reading = newReading();
    writtenLines(reading, engine, "const a = 1;\n", "ts", ALL);
    stopReading(reading);
    const lines = writtenLines(
      reading,
      engine,
      "const a = 1;\nconst b = 2;\nlet",
      "ts",
      ALL
    );
    expect(lines?.map(textOf)).toStrictEqual(["const a = 1;", "const b = 2;"]);
    expect(colouredRuns([lines?.[1] ?? []])).toBeGreaterThan(1);
  });

  test("past MOST_RUNS runs, a stream gives up: plain from then on", () => {
    const reading = newReading();
    const dense = Array.from({ length: 400 }, () => "a, ".repeat(40)).join(
      "\n"
    );
    expect(colouredRuns(whole(dense, "ts") ?? [])).toBeGreaterThan(MOST_RUNS);
    expect(writtenLines(reading, engine, `${dense}\n`, "ts", ALL)).toBeNull();
    expect(
      writtenLines(reading, engine, `${dense}\nmore`, "ts", ALL)
    ).toBeNull();
  });
});

// The research pass's hostile lines: each held Prism, Shiki or both for tens of milliseconds to
// seconds. The lexers read each in a few; 50 ms leaves a slow runner room.
const hostile: [string, string][] = [
  ["50k 'a' in a string", `"${"a".repeat(50_000)}`],
  ["50k backslashes in a template", `\`${"\\".repeat(50_000)}`],
  ["25k '/a', regex bait", "/a".repeat(25_000)],
  ["10k '<a', generic bait", "<a".repeat(10_000)],
  ["10k '('", "(".repeat(10_000)],
  ["10k '`${' nesting", "`${".repeat(10_000)],
  ["an unended /* and 50k more", `/*${"* ".repeat(25_000)}`],
  ["5k 'a?b:' ternaries", `x=${"a?b:".repeat(5000)}c`],
  ["20k '\"\\' alternating", '"\\'.repeat(20_000)],
  ["10k 'a.b<c>(' calls", `a${".b<c>(".repeat(10_000)}`],
  ["20k '=>' arrows", "a=>".repeat(20_000)],
  ["5k nested '{a:' objects", `x={${"a:{".repeat(5000)}`],
  ["20k tabs then 'x'", `${"\t".repeat(20_000)}x`],
  ["10k '\"\\u{' escapes", `"${"\\u{".repeat(10_000)}`],
];

describe("hostile code", () => {
  test.each(hostile)("%s is read in milliseconds", (_, code) => {
    // Once, so the lexers are warm, as on a page that has drawn a block.
    whole("const a = 1;", "ts");
    const start = performance.now();
    const lines = whole(code, "ts");
    expect(performance.now() - start).toBeLessThan(50);
    expect(lines?.map(textOf).join("\n")).toBe(code);
  });
});
