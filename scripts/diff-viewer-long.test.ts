// DiffViewer's gutter and row widths on a diff longer than an engine lets a call take arguments
// (Safari caps them at 65,536), on its model alone (src/components/diff-viewer-diff.ts).
import { describe, expect, test } from "vitest";

import {
  compare,
  highestNumber,
  longestLine,
} from "../src/components/diff-viewer-diff.ts";

describe("a long diff", () => {
  test("a diff of 70,000 lines measures its longest line and highest number", () => {
    const before = Array.from({ length: 70_000 }, (_, at) => `line ${at + 1}`);
    const after = before.map((line, at) =>
      at === 69_999 ? `${line}\tend` : line
    );
    const { lines } = compare(before.join("\n"), after.join("\n"));
    expect(longestLine(lines)).toBe("line 70000  end".length);
    expect(highestNumber(lines)).toBe(70_000);
  });
});
