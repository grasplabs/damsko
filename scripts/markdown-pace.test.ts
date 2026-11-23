// The pace of an answer still being written (src/components/markdown/pace.ts), on a clock of its
// own: chunks arrive at set times, frames come every 1/60 s, and what shows is read at each frame.
// Whole words only, in order, never more than STREAM_LAG behind what has arrived, a few words a
// frame, evenly through a burst and to the end.
//
//   pnpm exec vp test scripts/markdown-pace.test.ts
import { describe, expect, test } from "vitest";

import {
  advance,
  arrive,
  end,
  MOST_UNITS,
  startPace,
  STREAM_LAG,
  unitsOf,
} from "../src/components/markdown/pace.ts";
import type { Unit } from "../src/components/markdown/pace.ts";

const FRAME = 1000 / 60;

/** A text's units, as strings. */
const split = (text: string, unit: Unit = "word") => {
  const starts = unitsOf(text, unit);
  return starts.map((start, index) =>
    text.slice(start, starts[index + 1] ?? text.length)
  );
};

interface Shown {
  at: number;
  text: string;
  /** What had arrived by then. */
  arrived: string;
}

/**
 * Plays `chunks` (each `[ms, text]`) into the pace, a frame every 1/60 s until `until`, and gives
 * what showed at each frame where it changed.
 */
const play = (
  chunks: [number, string][],
  until: number,
  unit: Unit = "word",
  endsAt = Number.POSITIVE_INFINITY
): Shown[] => {
  let pace = startPace(0);
  let text = "";
  let next = 0;
  const seen: Shown[] = [];
  for (let at = 0; at <= until; at += FRAME) {
    while (next < chunks.length && (chunks[next]?.[0] ?? 0) <= at) {
      text += chunks[next]?.[1] ?? "";
      pace = arrive(pace, text, at, unit);
      next += 1;
    }
    if (at >= endsAt && !pace.ended) {
      pace = end(pace);
    }
    const before = pace.shown;
    pace = advance(pace, text, at, FRAME, unit);
    if (pace.shown !== before) {
      seen.push({ at, text: text.slice(0, pace.shown), arrived: text });
    }
  }
  return seen;
};

/** The most words any one frame let out, from `since` on. */
const mostWordsAFrame = (seen: Shown[], since = 0) =>
  Math.max(
    0,
    ...seen.map((step, index) => {
      const before = seen[index - 1]?.text.length ?? 0;
      return step.at < since ? 0 : split(step.text.slice(before)).length;
    })
  );

const sentence =
  "The team agreed to move the launch to the second week of June, and to keep the budget. ";

describe("units", () => {
  test("a word takes the spaces and marks after it, and the units are the text", () => {
    expect(split("Hello, world. Again")).toStrictEqual([
      "Hello, ",
      "world. ",
      "Again",
    ]);
    expect(split("  lead")).toStrictEqual(["  lead"]);
    for (const text of [sentence, "a  b\n\nc", "x", ""]) {
      expect(split(text).join("")).toBe(text);
    }
  });

  test("languages without spaces are words too: Japanese, Chinese, Thai", () => {
    expect(split("今日はいい天気です").length).toBeGreaterThan(2);
    expect(split("我们明天开会").length).toBeGreaterThan(1);
    expect(split("วันนี้อากาศดี").length).toBeGreaterThan(1);
    expect(split("今日はいい天気です").join("")).toBe("今日はいい天気です");
  });

  test("an emoji goes with the word before it; a character is a whole grapheme", () => {
    expect(split("Done 🎉 now")).toStrictEqual(["Done 🎉 ", "now"]);
    expect(split("a👩‍👩‍👧é", "character")).toStrictEqual(["a", "👩‍👩‍👧", "é"]);
  });
});

describe("the pace", () => {
  test("a burst is let out word by word, in order, evenly, and all of it within stream-lag", () => {
    const burst = sentence.repeat(2);
    // A word, then the burst after a pause, as a model's first chunks often come.
    const seen = play(
      [
        [0, "Well, "],
        [300, burst],
      ],
      2000
    )
      .filter((step) => step.at >= 300)
      .map((step) => ({
        ...step,
        at: step.at - 300,
        text: step.text.slice(6),
      }));
    // Whole words only, each step after the last.
    const words = split(burst);
    const ends = new Set(
      words.map((_, index) => words.slice(0, index + 1).join("").length)
    );
    for (const [index, step] of seen.entries()) {
      expect(ends.has(step.text.length)).toBeTruthy();
      expect(step.text.length).toBeGreaterThan(
        seen[index - 1]?.text.length ?? 0
      );
    }
    expect(seen.length).toBeGreaterThan(8);
    const last = seen.at(-1);
    expect(last?.text).toBe(burst);
    expect(last?.at ?? Infinity).toBeLessThanOrEqual(STREAM_LAG + FRAME);
  });

  test("never further behind what has arrived than stream-lag, at any speed", () => {
    for (const tokensPerSecond of [30, 80, 250]) {
      // A token of about four characters, in a chunk every 50 ms.
      const perChunk = Math.max(1, Math.round((tokensPerSecond * 50) / 1000));
      const tokens = sentence.repeat(20).match(/.{1,4}/gsu) ?? [];
      const chunks: [number, string][] = [];
      for (let index = 0; index < tokens.length; index += perChunk) {
        chunks.push([
          (index / perChunk) * 50,
          tokens.slice(index, index + perChunk).join(""),
        ]);
      }
      const seen = play(chunks, (chunks.at(-1)?.[0] ?? 0) + 1000);
      // How long each arrived length waited to show.
      let waited = 0;
      for (const [at, chunk] of chunks) {
        const upTo =
          chunks
            .filter(([when]) => when <= at)
            .reduce((sum, [, text]) => sum + text.length, 0) -
          (chunk.endsWith(" ") ? 0 : chunk.length);
        const shownAt = seen.find((step) => step.text.length >= upTo)?.at;
        waited = Math.max(waited, (shownAt ?? Infinity) - at);
      }
      expect(waited).toBeLessThanOrEqual(STREAM_LAG + 2 * FRAME);
    }
  });

  test("a word still being written waits for its end, and shows after stream-lag with no more", () => {
    const seen = play(
      [
        [0, "Hello wor"],
        [100, "ld and more "],
      ],
      300
    );
    expect(seen.map((step) => step.text)).not.toContain("Hello wor");
    expect(
      seen.some((step) => step.text.startsWith("Hello world"))
    ).toBeTruthy();
    const stalled = play([[0, "Hello wor"]], 1000);
    expect(stalled.at(0)?.text).toBe("Hello ");
    expect(stalled.at(-1)?.text).toBe("Hello wor");
    expect(stalled.at(-1)?.at).toBeGreaterThanOrEqual(STREAM_LAG);
  });

  test("a slow stream shows each word as it comes, not in a bunch", () => {
    // A word every 200 ms.
    const words = sentence.split(/(?<= )/u);
    const seen = play(
      words.map((word, index) => [index * 200, word]),
      words.length * 200 + 500
    );
    // Each word shows within a few frames of arriving, one at a time.
    expect(seen).toHaveLength(words.length);
    for (const [index, step] of seen.entries()) {
      expect(step.at - index * 200).toBeLessThanOrEqual(5 * FRAME);
    }
  });

  test("a burst after a pause runs on at one pace until the next is due, never in a lump", () => {
    // A chunk of a sentence every 300 ms: each is spread over about the gap before the next.
    const chunks: [number, string][] = Array.from({ length: 8 }, (_, index) => [
      index * 300,
      sentence,
    ]);
    const seen = play(chunks, 3000);
    const late = seen.filter((step) => step.at >= 1200 && step.at < 1500);
    // Spread over the gap: shown in many steps, the last near its end.
    expect(late.length).toBeGreaterThan(5);
    expect(late.at(-1)?.at ?? 0).toBeGreaterThan(1350);
    // Steps of a few words each, never half the chunk at once.
    for (const [index, step] of late.entries()) {
      const before = late[index - 1]?.text.length ?? step.text.length;
      expect(step.text.length - before).toBeLessThan(sentence.length / 3);
    }
  });

  test("a frame long late (a hidden tab) shows all that has arrived", () => {
    let pace = arrive(startPace(0), sentence, 0);
    pace = advance(pace, sentence, 3000, 3000);
    expect(pace.shown).toBe(sentence.length);
  });

  test("a burst after chunks 20 ms apart sweeps in a few words a frame, within stream-lag", () => {
    // 50 tokens a second, a token each 20 ms, then 200 tokens at once.
    const tokens = sentence.repeat(60).match(/.{1,4}/gsu) ?? [];
    const chunks: [number, string][] = tokens
      .slice(0, 50)
      .map((token, index) => [index * 20, token]);
    chunks.push([1000, tokens.slice(50, 250).join("")]);
    const seen = play(chunks, 2500);
    const most = mostWordsAFrame(seen);
    // Before, the burst showed in two frames; spread to its deadline it is under 8 words a frame.
    expect(most).toBeLessThanOrEqual(8);
    const all = chunks.reduce((sum, [, text]) => sum + text.length, 0);
    const done = seen.find((step) => step.text.length === all)?.at ?? Infinity;
    expect(done - 1000).toBeLessThanOrEqual(STREAM_LAG + FRAME + 1);
    expect(seen.filter((step) => step.at >= 1000).length).toBeGreaterThan(15);
  });

  test("when the stream ends, what is left runs out a few words a frame within stream-lag", () => {
    // A 40-word chunk arrives, and the stream ends with it.
    const words = sentence
      .repeat(3)
      .split(/(?<= )/u)
      .slice(0, 40)
      .join("");
    const seen = play(
      [
        [0, "Well, "],
        [100, words],
      ],
      1500,
      "word",
      100
    );
    const tail = seen.filter((step) => step.at >= 100);
    expect(mostWordsAFrame(seen, 100)).toBeLessThanOrEqual(MOST_UNITS);
    expect(tail.length).toBeGreaterThanOrEqual(40 / MOST_UNITS);
    expect(tail.at(-1)?.text).toBe(`Well, ${words}`);
    expect((tail.at(-1)?.at ?? Infinity) - 100).toBeLessThanOrEqual(
      STREAM_LAG + FRAME
    );
  });

  test("at the end a word with no space after it is whole: it shows at once", () => {
    const seen = play([[0, "Hello wor"]], 200, "word", 50);
    expect(seen.at(-1)?.text).toBe("Hello wor");
    expect(seen.at(-1)?.at ?? Infinity).toBeLessThanOrEqual(50 + FRAME);
  });

  test("a steady stream lets out no more than a few words a frame", () => {
    for (const tokensPerSecond of [30, 80, 250]) {
      const perChunk = Math.max(1, Math.round((tokensPerSecond * 30) / 1000));
      const tokens = sentence.repeat(20).match(/.{1,4}/gsu) ?? [];
      const chunks: [number, string][] = [];
      for (let index = 0; index < tokens.length; index += perChunk) {
        chunks.push([
          (index / perChunk) * 30,
          tokens.slice(index, index + perChunk).join(""),
        ]);
      }
      const seen = play(chunks, (chunks.at(-1)?.[0] ?? 0) + 1000);
      expect(mostWordsAFrame(seen)).toBeLessThanOrEqual(MOST_UNITS);
    }
  });

  test("characters are let out one grapheme at a time", () => {
    const seen = play([[0, "ab👩‍👩‍👧c"]], 1000, "character");
    expect(seen.map((step) => step.text)).not.toContain("ab\u{1F469}");
    expect(seen.at(-1)?.text).toBe("ab👩‍👩‍👧c");
  });
});
