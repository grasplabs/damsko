// The fade of an answer's words as they are shown while it is written (markdown.tsx draws them with
// it). The words each frame lets out (a step, pace.ts) are a span that fades in once, by CSS, from
// the moment it is put on the page: only its opacity, so nothing it stands beside moves. Only the
// steps shown in the last duration-stream are spans (after `fresh`): the words before them in the
// block are plain text, so however long the block, or however fast the words come, a block has a
// few spans at most. A span is keyed by where it starts in the source, so drawing the block again
// never starts its fade again; when the tree is read anew and a span is made afresh (a link that is
// whole, a line that turns out to be a heading's underline), it is set where its fade had got to.
//
// Once a block is finished and its last words have faded (duration-stream later), it is drawn as
// plain text again. Words there when the stream started are no news, and a page drawn on the
// server has no spans: the fade starts in the browser.
"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";

import { fadeInStream } from "../../lib/styles";
import { durations } from "../../lib/tokens.values";

/** The words being shown in one answer as it is written, and when each was first shown. */
export interface Reveal {
  /** Called with each step's span as it is put on the page (a ref): sets where its fade starts. */
  attach: (node: HTMLElement | null) => void;
  /** Where the words still fading in start in the source: before it, words are plain text. */
  fresh: number;
  /** Where each step of words shown since `fresh` ends (usePace's `steps`). */
  steps: readonly number[];
}

type Attach = Pick<Reveal, "attach">;

/** A reveal for a stream that starts with `since` characters there: none of them is news. */
const revealFrom = (since: number): Attach => {
  // When each word still fading in was first shown, by where it starts. Words are shown in order,
  // so the times grow with the places.
  const born = new Map<number, number>();
  const met = new WeakSet<Element>();
  // How far words have been shown: a span made afresh before it is part of a word already shown.
  let reached = since;
  return {
    attach: (node) => {
      if (node === null || met.has(node)) {
        return;
      }
      met.add(node);
      const at = Number(node.dataset.at);
      const now = performance.now();
      let first = born.get(at);
      if (first === undefined) {
        // New, or part of a word already shown (cut at another place): as that word, or long ago.
        first = at >= reached ? now : Number.NEGATIVE_INFINITY;
        let part = Number.NEGATIVE_INFINITY;
        for (const [start, shown] of born) {
          if (start <= at && start > part && at < reached) {
            part = start;
            first = shown;
          }
        }
      }
      for (const [start, shown] of born) {
        if (now - shown >= durations.stream) {
          born.delete(start);
        }
      }
      born.set(at, first);
      reached = Math.max(reached, at + (node.textContent?.length ?? 0));
      const age = now - first;
      if (age >= durations.stream) {
        node.style.animationName = "none";
      } else if (age > 0) {
        node.style.animationDelay = `${-age}ms`;
      }
    },
  };
};

/**
 * The reveal of an answer that is written with `length` characters shown (`paced`, usePace's), or
 * null when it is not `on`. A stream that starts, or an answer replaced by another (`round`),
 * starts a new one: what is there when it starts is no news.
 */
export const useReveal = (
  length: number,
  writing: boolean,
  on: boolean,
  {
    round,
    fresh,
    steps,
  }: { round: number; fresh: number; steps: readonly number[] }
): Reveal | null => {
  const [held, setHeld] = useState(() => ({
    writing,
    round,
    reveal: on ? revealFrom(length) : null,
  }));
  if (
    held.writing !== writing ||
    held.round !== round ||
    (held.reveal !== null) !== on
  ) {
    const starts = (writing && !held.writing) || held.round !== round;
    const kept = starts ? null : held.reveal;
    setHeld({
      writing,
      round,
      reveal: on ? (kept ?? revealFrom(length)) : null,
    });
  }
  return held.reveal === null ? null : { ...held.reveal, fresh, steps };
};

/**
 * How many of the answer's first blocks are drawn as plain text: every block once its last words
 * have faded in (duration-stream after it is finished), and all of them a moment after the answer
 * is written. `finished` counts the blocks no longer being written. While `hold` (a selection is
 * being made), none settles.
 */
export const useSettled = (
  finished: number,
  writing: boolean,
  hold: boolean
): number => {
  const target = writing ? finished : Number.POSITIVE_INFINITY;
  const [settled, setSettled] = useState(target);
  const [wasWriting, setWasWriting] = useState(writing);
  if (wasWriting !== writing) {
    setWasWriting(writing);
    // A stream that starts: the blocks it starts with were there before it.
    if (writing) {
      setSettled(finished);
    }
  }
  // Fewer blocks than were settled: the answer was replaced.
  if (target < settled) {
    setSettled(target);
  }
  const behind = settled < target && !hold;
  // Each wait runs to its end, however many blocks finish meanwhile, so a fast stream still
  // settles; none outlives the answer.
  const waits = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => {
    if (!behind) {
      return;
    }
    const all = waits.current;
    const wait = setTimeout(() => {
      all.delete(wait);
      setSettled((now) => Math.max(now, target));
    }, durations.stream);
    all.add(wait);
  }, [behind, target]);
  useEffect(() => {
    const all = waits.current;
    return () => {
      for (const wait of all) {
        clearTimeout(wait);
      }
    };
  }, []);
  return settled;
};

/**
 * A text's words from `at` in the source: those shown before `reveal.fresh` as plain text, and
 * after it each step of them a span that fades in once as it is put on the page, keyed by where it
 * starts in the source.
 */
export const Words = ({
  value,
  at,
  reveal,
}: {
  value: string;
  at: number;
  reveal: Reveal;
}) => {
  const from = Math.min(value.length, Math.max(0, reveal.fresh - at));
  const cuts = [
    from,
    ...reveal.steps
      .map((end) => end - at)
      .filter((cut) => cut > from && cut < value.length),
    value.length,
  ];
  return (
    <>
      {from > 0 && value.slice(0, from)}
      {cuts.slice(1).map((cut, index) => {
        const start = cuts[index] ?? from;
        return start === cut ? null : (
          <span
            key={at + start}
            data-at={at + start}
            ref={reveal.attach}
            {...stylex.props(fadeInStream)}
          >
            {value.slice(start, cut)}
          </span>
        );
      })}
    </>
  );
};
