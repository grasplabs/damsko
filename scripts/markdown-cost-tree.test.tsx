// The cost gate (scripts/markdown-cost.ts) on an answer read and drawn whole, from 4 KB to 16 KB:
// each mark and structure drawn on the server while written (bounded, repaired, read a block at a
// time, drawn), its time and the HTML it draws, which reads it as it is read once written too; and each pair of marks in one
// paragraph read while written (a pair in blocks of its own is weighed as text). A tree costs the
// parser some microseconds a character, so these are the sizes a minute allows, and well past
// where a path that grows as the square shows it. (A paragraph's marks cost their square up to the
// parse's budget, a tenth of a second, and no further: see MAX_COST in parse.ts.)
//
//   pnpm exec vp test scripts/markdown-cost-tree.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { Markdown } from "../src/components/markdown/index.ts";
import {
  bounded,
  NOTHING,
  readBlocks,
} from "../src/components/markdown/parse.ts";
import { repair } from "../src/components/markdown/repair.ts";
import {
  DRAWN_CEILING,
  GATE_TEST,
  weighAll,
  weighed,
} from "./markdown-cost.ts";
import type { Entry, Family } from "./markdown-cost.ts";

/** An entry that draws DRAWN_CEILING characters and one more for each it reads, as quickly as a string is repeated: no time cap is near. */
const over: Entry = (text) => () =>
  "x".repeat(text.length * (DRAWN_CEILING + 1));

describe("what an answer costs", () => {
  test("an answer drawn larger than DRAWN_CEILING characters a character fails the gate, however fast", () => {
    const plain: Family = {
      name: "plain words",
      kind: "single",
      blocks: false,
      make: (length) => "a".repeat(length),
    };
    expect(weighed(plain, over, 4000)).toBe(
      `${16_000 * (DRAWN_CEILING + 1)} characters drawn at 16 KB`
    );
  });

  test(
    "drawn while written: every mark and structure in step with its length",
    () => {
      expect(
        weighAll(
          {
            "drawn while written": (text) => () =>
              renderToStaticMarkup(<Markdown streaming>{text}</Markdown>),
          },
          (family) => family.kind !== "pair",
          4000
        )
      ).toStrictEqual([]);
    },
    GATE_TEST
  );

  test(
    "read while written: every pair of marks in step with its length",
    () => {
      expect(
        weighAll(
          {
            "read while written": (text) => () => {
              readBlocks(repair(bounded(text)).text, NOTHING);
            },
          },
          (family) => family.kind === "pair" && !family.blocks,
          4000
        )
      ).toStrictEqual([]);
    },
    GATE_TEST
  );
});
