// The cost gate (scripts/markdown-cost.ts) on what reads an answer as text before the parse:
// `bounded`, then `repair` (while written) and `tidy` (once cut off), for every family, from 50 KB
// to 200 KB. These take a few milliseconds a family, so they are weighed where a processor's
// caches no longer bend the time: under 50 KB they do.
//
//   pnpm exec vp test scripts/markdown-cost-text.test.ts
import { describe, expect, test } from "vitest";

import { bounded, repair, tidy } from "../src/components/markdown/parse.ts";
import { GATE_TEST, weighAll } from "./markdown-cost.ts";

describe("what an answer costs", () => {
  test(
    "bounded, repaired and tidied: every family in step with its length",
    () => {
      expect(
        weighAll(
          {
            "bounded, repaired and tidied": (text) => () => {
              const within = bounded(text);
              repair(within);
              tidy(within);
            },
          },
          () => true,
          50_000
        )
      ).toStrictEqual([]);
    },
    GATE_TEST
  );
});
