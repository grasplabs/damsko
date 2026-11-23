// CodeBlock's highlighting (src/components/code-block-prism.ts): a language named by a fence is
// looked up only among its own names, and however long or hostile the code, Prism reads a bounded
// amount of it: a line too long for it stays plain, and past a block's first stretch the rest does.
//
//   pnpm exec vp test scripts/code-block-prism.test.ts
import { describe, expect, test } from "vitest";

import { grammarOrNull, linesOf } from "../src/components/code-block-prism.ts";
import type { Highlight } from "../src/components/code-block-prism.ts";

/** TypeScript's grammar, with the length of every text Prism is given written down. */
const counted = async () => {
  const found = await grammarOrNull("ts");
  if (found === null) {
    throw new Error("TypeScript's grammar did not load.");
  }
  const reads: number[] = [];
  const highlight: Highlight = {
    grammar: found.grammar,
    Prism: {
      ...found.Prism,
      tokenize: (text, grammar) => {
        reads.push(text.length);
        return found.Prism.tokenize(text, grammar);
      },
    },
  };
  return { highlight, reads };
};

const textOf = (lines: ReturnType<typeof linesOf>) =>
  lines.map((line) => line.map((run) => run.text).join(""));

describe(grammarOrNull, () => {
  test.each(["__proto__", "constructor", "toString", "hasOwnProperty"])(
    "%s is no language: the code stays plain",
    async (language) => {
      await expect(grammarOrNull(language)).resolves.toBeNull();
    }
  );
});

describe(linesOf, () => {
  test("a line of up to a thousand characters is highlighted, a longer one is plain, and the lines after it still are", async () => {
    const { highlight } = await counted();
    const fits = `const a = "${"x".repeat(1000 - 13)}";`;
    const long = `const b = "${"x".repeat(1000 - 12)}";`;
    // `fits` is 1000 characters long, `long` 1001.
    const code = [fits, long, "const c = 1;"].join("\n");
    const lines = linesOf(code, highlight);
    expect(lines[0]?.length).toBeGreaterThan(1);
    expect(lines[1]).toStrictEqual([{ text: long, types: [] }]);
    expect(lines[2]?.length).toBeGreaterThan(1);
    expect(textOf(lines)).toStrictEqual(code.split("\n"));
  });

  test("a long block is highlighted for its first ten thousand characters, a line's end within them, and plain past them", async () => {
    const { highlight } = await counted();
    const code = Array.from(
      { length: 5000 },
      (_, n) => `const a${String(n).padStart(4, "0")} = 0;`
    ).join("\n");
    const lines = linesOf(code, highlight);
    expect(lines).toHaveLength(5000);
    // Each line is 16 characters and its newline: 588 lines fit in 10,000.
    expect(lines[587]?.length).toBeGreaterThan(1);
    expect(lines[588]).toStrictEqual([{ text: "const a0588 = 0;", types: [] }]);
    expect(textOf(lines)).toStrictEqual(code.split("\n"));
  });

  test.each([
    ["one line", (n: number) => `const a = "${"x".repeat(n)}";`],
    [
      "short lines that open strings",
      (n: number) =>
        `"a 'b `.repeat(n / 6).replaceAll(/(?<line>.{48})/gu, "$<line>\n"),
    ],
    [
      "lines of a thousand open strings",
      (n: number) => `"${"x".repeat(999)}\n`.repeat(n / 1000),
    ],
  ])(
    "Prism reads no more of %s at once than a thousand characters, and no more in all than ten thousand, however long the code grows",
    async (_, make) => {
      const work = async (length: number) => {
        const { highlight, reads } = await counted();
        linesOf(make(length), highlight);
        return reads;
      };
      const grown = await Promise.all([10_000, 50_000, 200_000].map(work));
      for (const reads of grown) {
        expect(Math.max(0, ...reads)).toBeLessThanOrEqual(1000);
        expect(reads.reduce((sum, read) => sum + read, 0)).toBeLessThanOrEqual(
          10_000
        );
      }
    }
  );

  test("without a grammar, every line is one plain run", () => {
    const code = "a\n\nb\n";
    expect(linesOf(code, null)).toStrictEqual([
      [{ text: "a", types: [] }],
      [],
      [{ text: "b", types: [] }],
    ]);
  });
});
