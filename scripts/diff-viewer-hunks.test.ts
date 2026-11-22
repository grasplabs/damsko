// DiffViewer's hunk headers on its model alone (src/components/diff-viewer-diff.ts), against cases
// worked out by hand: ranges as git writes them, across folds, for new and deleted files, and
// counts of 1 and 0.
import { describe, expect, test } from "vitest";

import {
  compare,
  foldsOf,
  hunkHead,
  unifiedRows,
} from "../src/components/diff-viewer-diff.ts";

const heads = (oldValue: string, newValue: string, context = 3) => {
  const { lines, changes } = compare(oldValue, newValue);
  const folds = foldsOf(lines, changes, context, new Map());
  return unifiedRows(lines, changes, folds, false, true).flatMap((row) =>
    row.type === "hunk" ? [hunkHead(row)] : []
  );
};

const thirty = Array.from({ length: 30 }, (_, at) => `line ${at + 1}`);
const ten = `${Array.from({ length: 10 }, (_, at) => `line ${at + 1}`).join("\n")}\n`;

describe("hunk headers", () => {
  test("two changes far apart are two hunks", () => {
    const edited = thirty.map((line, at) =>
      at === 5 || at === 24 ? `${line} changed` : line
    );
    expect(
      heads(`${thirty.join("\n")}\n`, `${edited.join("\n")}\n`)
    ).toStrictEqual(["@@ -3,7 +3,7 @@", "@@ -22,7 +22,7 @@"]);
  });

  test("a new file starts from nothing", () => {
    expect(heads("", "a\nb\nc\n")).toStrictEqual(["@@ -0,0 +1,3 @@"]);
  });

  test("a deleted file ends in nothing", () => {
    expect(heads("a\nb\n", "")).toStrictEqual(["@@ -1,2 +0,0 @@"]);
  });

  test("a count of one is left out", () => {
    expect(heads(ten, ten.replace("line 5\n", "line five\n"), 0)).toStrictEqual(
      ["@@ -5 +5 @@"]
    );
  });

  test("a line put in stands after its line before", () => {
    expect(
      heads(ten, ten.replace("line 5\n", "line 5\nput in\n"), 0)
    ).toStrictEqual(["@@ -5,0 +6 @@"]);
  });
});
