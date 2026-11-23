// The cost gate (scripts/markdown-cost.ts) on an answer read and drawn whole, from 4 KB to 16 KB:
// each mark and structure drawn on the server while written (bounded, repaired, read a block at a
// time, drawn), which reads it as it is read once written too; and each pair of marks in one
// paragraph read while written (a pair in blocks of its own is weighed as text and streamed). A tree
// costs the parser some microseconds a character, so these are the sizes a minute allows, and well
// past where a path that grows as the square shows it.
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
import { GATE_TEST, weighAll } from "./markdown-cost.ts";

describe("what an answer costs", () => {
  test(
    "drawn while written: every mark and structure in step with its length",
    () => {
      expect(
        weighAll(
          {
            "drawn while written": (text) => () => {
              renderToStaticMarkup(<Markdown streaming>{text}</Markdown>);
            },
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
