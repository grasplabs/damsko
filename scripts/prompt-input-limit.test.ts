// What PromptInput's length limit does (src/components/prompt-input-limit.ts): where the count shows
// and turns, and what of a change too long goes in, where it went, a token whole or not at all.
import type { Token, TokenInputValue } from "@ui-sdk/react/token-input";
import { describe, expect, test } from "vitest";

import { refitOf, stageOf } from "../src/components/prompt-input-limit.ts";

const ada: Token = { id: "t1", type: "person", value: "ada", label: "Ada" };
const grace: Token = {
  id: "t2",
  type: "person",
  value: "grace",
  label: "Grace Hopper",
};

describe(stageOf, () => {
  test("under 90%, near from 90% (rounded up), at from the limit", () => {
    expect([8, 9, 10, 12].map((length) => stageOf(length, 10))).toStrictEqual([
      "under",
      "near",
      "at",
      "at",
    ]);
    expect([89, 90].map((length) => stageOf(length, 99))).toStrictEqual([
      "under",
      "near",
    ]);
  });
});

describe(refitOf, () => {
  test("a paste at the end keeps what fits and is a cut", () => {
    expect(refitOf(["Hello"], ["Hello, world"], 8)).toStrictEqual({
      at: { start: 5, end: 5 },
      fits: [", w"],
      cut: true,
    });
  });

  test("a paste in the middle goes where it went", () => {
    expect(refitOf(["ab"], ["aXYZb"], 4)).toStrictEqual({
      at: { start: 1, end: 1 },
      fits: ["XY"],
      cut: true,
    });
  });

  test("a paste over a selection has the room of what it replaces", () => {
    // "bcd" (3) goes, so 6 - (5 - 3) = 4 fit.
    expect(refitOf(["abcde"], ["a123456e"], 6)).toStrictEqual({
      at: { start: 1, end: 4 },
      fits: ["1234"],
      cut: true,
    });
  });

  test("one character typed at the limit is no cut, and nothing fits", () => {
    expect(refitOf(["abc"], ["abcd"], 3)).toStrictEqual({
      at: { start: 3, end: 3 },
      fits: [],
      cut: false,
    });
  });

  test("a token counts as its label, whole or not at all", () => {
    const before: TokenInputValue = ["Hi "];
    expect(refitOf(before, ["Hi ", grace], 10).fits).toStrictEqual([]);
    expect(refitOf(before, ["Hi ", ada, " and more"], 9).fits).toStrictEqual([
      ada,
      " an",
    ]);
  });

  test("a token already there is one place, matched by its id", () => {
    expect(refitOf([ada, " x"], [ada, " x and y"], 9)).toStrictEqual({
      at: { start: 3, end: 3 },
      fits: [" and"],
      cut: true,
    });
  });

  test("half an emoji is no character", () => {
    // "😀" is two UTF-16 units: one unit of room keeps neither.
    expect(refitOf(["ab"], ["ab😀"], 3).fits).toStrictEqual([]);
    expect(refitOf(["ab"], ["ab😀"], 4).fits).toStrictEqual(["😀"]);
  });
});
