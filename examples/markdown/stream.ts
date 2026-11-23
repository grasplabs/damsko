// A model's stream, played in the page: the answer cut into tokens of about four characters, sent
// in chunks at a speed, or in bursts (a few tokens, then a pause, then many). The examples feed it
// to Markdown as a product feeds a real stream: the whole text so far, each time more arrives.
import { useEffect, useState } from "react";

/** How the stream comes: tokens a second, evenly, or uneven bursts. */
export type StreamPace = "30" | "80" | "250" | "bursts";

/** The answer's tokens: words and pieces of words, about four characters each, as a model sends. */
const tokensOf = (text: string): string[] =>
  text.match(/\s*[^\s]{1,4}|\s+/gu) ?? [];

/** A steady sequence of numbers between 0 and 1, the same each time: the bursts' sizes and pauses. */
const steady = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 16_807) % 2_147_483_647;
    return state / 2_147_483_647;
  };
};

/** When each chunk of the answer arrives, in milliseconds from the start, and its text. */
export const chunksOf = (
  text: string,
  pace: StreamPace
): [number, string][] => {
  const tokens = tokensOf(text);
  const chunks: [number, string][] = [];
  if (pace === "bursts") {
    const random = steady(7);
    let at = 0;
    for (let index = 0; index < tokens.length;) {
      // A burst of 2 to 60 tokens, then a pause of 40 to 600 ms.
      const size = 2 + Math.floor(random() * random() * 58);
      chunks.push([at, tokens.slice(index, index + size).join("")]);
      index += size;
      at += 40 + Math.floor(random() * 560);
    }
    return chunks;
  }
  // Even: a chunk as often as a network sends one (every 30 ms at most), holding what came meanwhile.
  const perSecond = Number(pace);
  const every = Math.max(30, 1000 / perSecond);
  const perChunk = Math.max(1, Math.round((perSecond * every) / 1000));
  for (let index = 0; index < tokens.length; index += perChunk) {
    chunks.push([
      (index / perChunk) * every,
      tokens.slice(index, index + perChunk).join(""),
    ]);
  }
  return chunks;
};

/**
 * The text of `answer` that has arrived so far, played at `pace` from the time `run` last changed,
 * and whether all of it has. It starts written in full, so the page shows the whole answer before
 * its script runs or without one.
 */
export const usePlayedStream = (
  answer: string,
  pace: StreamPace,
  run: number
) => {
  const [text, setText] = useState(answer);
  const [done, setDone] = useState(true);
  useEffect(() => {
    if (run === 0) {
      return undefined;
    }
    setText("");
    setDone(false);
    const timers = chunksOf(answer, pace).map(([at, chunk], index, all) =>
      window.setTimeout(() => {
        setText((now) => now + chunk);
        if (index === all.length - 1) {
          setDone(true);
        }
      }, at)
    );
    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, [answer, pace, run]);
  return { text, done };
};
