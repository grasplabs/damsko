// The patterns gate (scripts/check-markdown-patterns.ts): what backtracks beyond its length fails,
// Markdown's own patterns pass.
//   pnpm exec vp test scripts/check-markdown-patterns.test.ts
import nodePath from "node:path";

import { describe, expect, test } from "vitest";

import { problemsIn, unsafe } from "./check-markdown-patterns.ts";

describe("the patterns gate", () => {
  test.each([
    // 6 s on 27 characters, and its twin over characters two branches share.
    [String.raw`^(?:a|a)+$`, "u"],
    [String.raw`^(?:\w|\d)+$`, "u"],
    // 2 s at 40 KB, and 38 s once in Markdown.
    [String.raw`^\s*(?:\s*x)`, "u"],
    [String.raw`\[([^\]\n]+)\]\[\]`, "gu"],
  ])("fails /%s/%s", (source, flags) => {
    expect(unsafe(source, flags)).not.toBeNull();
  });

  test("passes every pattern in src/components/markdown", () => {
    expect(
      problemsIn(
        nodePath.join(import.meta.dirname, "../src/components/markdown")
      )
    ).toStrictEqual([]);
  });
});
