// The Diff's own engine (src/components/diff-viewer-diff.ts) against jsdiff 9.0.0's answers, which it
// replaced: the same parts, value for value, for lines, words with spaces and words, on hard cases
// (empty sides, no last line break, CRLF, long equal runs, repeated lines that tie, whitespace,
// accented words, punctuation) and on a few hundred seeded random texts. The cases and jsdiff's
// answers are kept in scripts/diff-engine/goldens.json.
//
//   node scripts/check-diff-engine.ts
//
// It also times a 10,000-line file with edits throughout against the part's 300ms budget.
import { readFileSync } from "node:fs";

import {
  diffLines,
  diffWords,
  diffWordsWithSpace,
} from "../src/components/diff-viewer-diff.ts";
import type { DiffPart } from "../src/components/diff-viewer-diff.ts";

type Kind = "lines" | "withSpace" | "words";
interface Case {
  kind: Kind;
  before: string;
  after: string;
}
interface Golden extends Case {
  parts: { value: string; added: boolean; removed: boolean; count: number }[];
}

const goldensPath = new URL("diff-engine/goldens.json", import.meta.url)
  .pathname;

const ours = (one: Case): DiffPart[] => {
  if (one.kind === "lines") {
    return diffLines(one.before, one.after) ?? [];
  }
  if (one.kind === "withSpace") {
    return diffWordsWithSpace(one.before, one.after);
  }
  return diffWords(one.before, one.after);
};
const shape = (
  parts: readonly {
    value: string;
    added?: boolean;
    removed?: boolean;
    count?: number;
  }[]
) =>
  parts.map((part) => ({
    value: part.value,
    added: part.added === true,
    removed: part.removed === true,
    count: part.count ?? 0,
  }));

const isGoldens = (value: unknown): value is Golden[] =>
  Array.isArray(value) &&
  value.every(
    (one: unknown) =>
      typeof one === "object" &&
      one !== null &&
      "kind" in one &&
      "before" in one &&
      typeof one.before === "string" &&
      "after" in one &&
      typeof one.after === "string" &&
      "parts" in one &&
      Array.isArray(one.parts)
  );
const read: unknown = JSON.parse(readFileSync(goldensPath, "utf-8"));
if (!isGoldens(read)) {
  throw new Error(`${goldensPath} does not hold the goldens`);
}
const goldens = read;
const failures: string[] = [];
let same = 0;
for (const golden of goldens) {
  const got = shape(ours(golden));
  if (JSON.stringify(got) === JSON.stringify(golden.parts)) {
    same += 1;
  } else if (failures.length < 5) {
    failures.push(
      `${golden.kind} ${JSON.stringify(golden.before).slice(0, 60)} → ${JSON.stringify(golden.after).slice(0, 60)}:\n          want ${JSON.stringify(golden.parts).slice(0, 300)}\n          got  ${JSON.stringify(got).slice(0, 300)}`
    );
  }
}

// 10,000 lines with an edit every 50 lines, inside the part's 300ms.
const big = Array.from(
  { length: 10_000 },
  (_, index) => `line ${index}: ${"x".repeat(index % 40)}`
);
const bigAfter = big.map((line, index) =>
  index % 50 === 7 ? `${line} edited` : line
);
const started = performance.now();
const bigParts = diffLines(
  `${big.join("\n")}\n`,
  `${bigAfter.join("\n")}\n`,
  300
);
const took = performance.now() - started;
const timing =
  bigParts === undefined
    ? `10,000 lines: past the 300ms budget, no answer (${took.toFixed(0)}ms)`
    : undefined;

console.log(
  `${failures.length === 0 && same === goldens.length ? "ok  " : "FAIL"}  the same parts as jsdiff 9.0.0: ${same} of ${goldens.length} cases`
);
for (const failure of failures) {
  console.log(`        ${failure}`);
}
console.log(
  `${timing === undefined ? "ok  " : "FAIL"}  10,000 lines, 200 edits: ${took.toFixed(0)}ms (budget 300ms)${timing === undefined ? "" : `: ${timing}`}`
);
process.exit(
  failures.length === 0 && same === goldens.length && timing === undefined
    ? 0
    : 1
);
