// The fade of an answer's words as they are shown while it is written (markdown.tsx draws them with
// it). Each new word is a span that fades in once, by CSS, from the moment it is put on the page:
// only its opacity, so nothing it stands beside moves. A word keeps its span, keyed by where it
// starts in the source, for as long as its block is being written, so drawing the block again never
// starts its fade again. When the tree is read anew and a word's span is made afresh (a link that
// is whole, a line that turns out to be a heading's underline), it is set where its fade had got to
// from when the word was first shown: a word shown long enough ago does not fade at all.
//
// Once a block is finished and its last words have faded (duration-stream later), it is drawn as
// plain text again: a long answer ends as text, not thousands of spans. Words there when the stream
// started are no news, and a page drawn on the server has no spans: the fade starts in the browser.
"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

import { unitsOf } from "../../hooks/use-smooth-text";
import type { SmoothTextUnit } from "../../hooks/use-smooth-text";
import { duration, media } from "../../lib/tokens.stylex";
import { durations } from "../../lib/tokens.values";

const REDUCED = media.reducedMotion;

const fadeIn = stylex.keyframes({ from: { opacity: 0 } });

const styles = stylex.create({
  // Over by itself, and nothing kept once it is (backwards, not both): a word that has faded in is
  // plain text to the browser, with no layer of its own.
  word: {
    animationName: { default: fadeIn, [REDUCED]: "none" },
    animationDuration: duration.stream,
    animationTimingFunction: duration.easeStream,
    animationFillMode: "backwards",
  },
});

/** A part that fades in whole as it is shown, as a word does (code in a sentence, its chip and all). */
export const fadeStyle = styles.word;

/** The words being shown in one answer as it is written, and when each was first shown. */
export interface Reveal {
  /** What a word is: a word with the spaces after it, or a character. */
  unit: SmoothTextUnit;
  /** Called with each word's span as it is put on the page (a ref): sets where its fade starts. */
  attach: (node: HTMLElement | null) => void;
}

/** A reveal for a stream that starts with `since` characters there: none of them is news. */
const revealFrom = (since: number, unit: SmoothTextUnit): Reveal => {
  const born = new Map<number, number>();
  const met = new WeakSet<Element>();
  return {
    unit,
    attach: (node) => {
      if (node === null || met.has(node)) {
        return;
      }
      met.add(node);
      const at = Number(node.dataset.at);
      const now = performance.now();
      const first =
        born.get(at) ?? (at < since ? Number.NEGATIVE_INFINITY : now);
      born.set(at, first);
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
 * The reveal of an answer that streams with `length` characters shown, or null with `unit` false.
 * A stream that starts, or an answer replaced by another (`round`, usePacedText's), starts a new
 * one: what is there when it starts is no news.
 */
export const useReveal = (
  length: number,
  streaming: boolean,
  round: number,
  unit: SmoothTextUnit | false
): Reveal | null => {
  const [held, setHeld] = useState(() => ({
    streaming,
    round,
    reveal: unit === false ? null : revealFrom(length, unit),
  }));
  if (
    held.streaming !== streaming ||
    held.round !== round ||
    (held.reveal?.unit ?? false) !== unit
  ) {
    const starts = (streaming && !held.streaming) || held.round !== round;
    const kept = starts ? null : held.reveal;
    setHeld({
      streaming,
      round,
      reveal: unit === false ? null : (kept ?? revealFrom(length, unit)),
    });
  }
  return held.reveal;
};

/**
 * How many of the answer's first blocks are drawn as plain text: every block once its last words
 * have faded in (duration-stream after it is finished), and all of them a moment after the stream
 * ends. `finished` counts the blocks no longer being written.
 */
export const useSettled = (finished: number, streaming: boolean): number => {
  const target = streaming ? finished : Number.POSITIVE_INFINITY;
  const [settled, setSettled] = useState(target);
  const [wasStreaming, setWasStreaming] = useState(streaming);
  if (wasStreaming !== streaming) {
    setWasStreaming(streaming);
    // A stream that starts: the blocks it starts with were there before it.
    if (streaming) {
      setSettled(finished);
    }
  }
  // Fewer blocks than were settled: the answer was replaced.
  if (target < settled) {
    setSettled(target);
  }
  const behind = settled < target;
  // Each wait runs to its end, however many blocks finish meanwhile, so a fast stream still settles.
  useEffect(() => {
    if (!behind) {
      return;
    }
    setTimeout(() => {
      setSettled((now) => Math.max(now, target));
    }, durations.stream);
  }, [behind, target]);
  return settled;
};

/**
 * A text's words (or characters), each a span that fades in once as it is put on the page, keyed by
 * where it starts in the source: `at`, the text's own start, and its place in the text.
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
  const starts = unitsOf(value, reveal.unit);
  return starts.map((start, index) => (
    <span
      key={at + start}
      data-at={at + start}
      ref={reveal.attach}
      {...stylex.props(styles.word)}
    >
      {value.slice(start, starts[index + 1] ?? value.length)}
    </span>
  ));
};
