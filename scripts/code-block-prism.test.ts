// CodeBlock's highlighting (src/components/code-block-prism.ts): a language named by a fence is
// looked up only among its own names, and a long block is highlighted only so far, plain past it.
//
//   pnpm exec vp test scripts/code-block-prism.test.ts
import { describe, expect, test } from "vitest";

import { grammarOrNull, linesOf } from "../src/components/code-block-prism.ts";

describe(grammarOrNull, () => {
  test.each(["__proto__", "constructor", "toString", "hasOwnProperty"])(
    "%s is no language: the code stays plain",
    async (language) => {
      await expect(grammarOrNull(language)).resolves.toBeNull();
    }
  );
});

/**
 * How long a test that highlights a long block may run, in milliseconds: a second of this process's
 * time on the processor, which a machine busy with others (the other test files among them) can
 * make many times as long by the clock.
 */
const SLOW_TEST = 120_000;

describe(linesOf, () => {
  test(
    "a long block is highlighted for its first thousand lines, and plain past them",
    async () => {
      const highlight = await grammarOrNull("ts");
      const code = Array.from(
        { length: 5000 },
        (_, n) => `const a${n} = ${n};`
      ).join("\n");
      const lines = linesOf(code, highlight);
      expect(lines).toHaveLength(5000);
      expect(lines[0]?.length).toBeGreaterThan(1);
      expect(lines[999]?.length).toBeGreaterThan(1);
      expect(lines[1000]).toStrictEqual([
        { text: "const a1000 = 1000;", types: [] },
      ]);
      expect(
        lines.map((line) => line.map((run) => run.text).join(""))
      ).toStrictEqual(code.split("\n"));
    },
    SLOW_TEST
  );

  test(
    "a block of a few long lines is highlighted up to a line's end within its characters",
    async () => {
      const highlight = await grammarOrNull("ts");
      const long = `const a = "${"x".repeat(30_000)}";`;
      const lines = linesOf(`${long}\n${long}`, highlight);
      expect(lines).toHaveLength(2);
      expect(lines[0]?.length).toBeGreaterThan(1);
      expect(lines[1]).toStrictEqual([{ text: long, types: [] }]);
    },
    SLOW_TEST
  );
});
