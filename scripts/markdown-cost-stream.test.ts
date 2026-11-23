// The cost gate (scripts/markdown-cost.ts) on an answer streamed in chunks of 1, 16 and 1,024
// characters: what a chunk costs at the end of the stream, read as Markdown reads it while it is
// written (bounded, repaired, `readBlocks` on the blocks it keeps from the chunks before), from
// 4 KB to 16 KB. Markdown keeps what one read of the stream so far keeps, as the chunks before
// would leave it. The families of many blocks: there what is kept from chunk to chunk matters. A
// family of one block reads that block again with each chunk, as the tree test weighs.
//
//   pnpm exec vp test scripts/markdown-cost-stream.test.ts
import { describe, expect, test } from "vitest";

import {
  bounded,
  NOTHING,
  readBlocks,
  repair,
} from "../src/components/markdown/parse.ts";
import type { Kept } from "../src/components/markdown/parse.ts";
import { GATE_TEST, weighAll } from "./markdown-cost.ts";
import type { Entry } from "./markdown-cost.ts";

/** How many chunks are weighed at the end of a stream. */
const STEPS = 2;

/** Chunks of `chunk` characters at the end of a stream of an answer. */
const streamed =
  (chunk: number): Entry =>
  (text) => {
    const from = Math.max(0, text.length - 2048);
    const { kept } = readBlocks(
      repair(bounded(text.slice(0, from))).text,
      NOTHING
    );
    return () => {
      let held: Kept = kept;
      for (let step = 1; step <= STEPS; step += 1) {
        const shown = repair(bounded(text.slice(0, from + step * chunk))).text;
        ({ kept: held } = readBlocks(shown, held));
      }
    };
  };

describe("what an answer costs", () => {
  test(
    "streamed in chunks: every family of many blocks in step with its length",
    () => {
      expect(
        weighAll(
          {
            "streamed by 1": streamed(1),
            "streamed by 16": streamed(16),
            "streamed by 1,024": streamed(1024),
          },
          (family) => family.blocks,
          4000
        )
      ).toStrictEqual([]);
    },
    GATE_TEST
  );
});
