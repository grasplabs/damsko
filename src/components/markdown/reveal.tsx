// The fade of an answer's words as they are shown while it is written (markdown.tsx draws them with
// it). The words one draw puts on the page (a step, pace.ts) are a span that fades in once, by CSS,
// from the moment it is put there: only its opacity, so nothing it stands beside moves. Only the
// steps drawn in the last duration-stream are spans (after `fresh`): the words before them in the
// block are plain text, so however long the block, or however fast the words come, a block has a
// few spans at most. A span is keyed by where it starts in the source, so drawing the block again
// never starts its fade again; when the tree is read anew and a span is made afresh (a link that is
// whole, a line that turns out to be a heading's underline), it is set where its fade had got to.
//
// Once a block's last words have faded (it ends before `fresh`), it is drawn as plain text again,
// and the last words of an answer fade to their end after the stream has. Words there when the
// stream started are no news, and a page drawn on the server has no spans: the fade starts in the
// browser.
"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { fadeInStream } from "../../lib/styles";
import { durations } from "../../lib/tokens.values";
import type { Paced } from "./pace";

/** The words being shown in one answer as it is written, and when each was first shown. */
export interface Reveal {
  /** Called with each step's span as it is put on the page (a ref): sets where its fade starts. */
  attach: (node: HTMLElement | null) => void;
  /** Where the words still fading in start in the source: before it, words are plain text. */
  fresh: number;
  /** Where each step of words shown since `fresh` ends (usePace's `steps`). */
  steps: readonly number[];
}

/** A reveal for a stream that starts with `since` characters there: none of them is news. */
const revealFrom = (since: number): Reveal["attach"] => {
  // When each word still fading in was first shown, by where it starts. Words are shown in order,
  // so the times grow with the places.
  const born = new Map<number, number>();
  // How far words have been shown: a span made afresh before it is part of a word already shown.
  let reached = since;
  return (node) => {
    if (node === null) {
      return;
    }
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
  };
};

/**
 * How an answer's words fade in as they are shown (`paced`, usePace's), or null while none is: not
 * `on`, or every word shown has faded in. Each round of the pace (a stream that starts, an answer
 * replaced by another) starts a new one: what is there when it starts is no news.
 */
export const useReveal = (
  { text, round, fresh, steps }: Paced,
  on: boolean
): Reveal | null => {
  const [held, setHeld] = useState(() => ({
    round,
    attach: revealFrom(text.length),
  }));
  if (held.round !== round) {
    setHeld({ round, attach: revealFrom(text.length) });
  }
  return on && fresh < text.length
    ? { attach: held.attach, fresh, steps }
    : null;
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
