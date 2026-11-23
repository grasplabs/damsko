// The pace of an answer still being written: its words shown at a steady pace whatever the bursts
// they arrive in. A model's stream comes in uneven chunks (a token at a time, a paragraph after a
// pause, everything at once after a hidden tab); shown as they come, the words jump. Markdown lets
// them out a whole word at a time (Intl.Segmenter's words, so Chinese, Japanese, Thai and emoji are
// words too) at the pace they arrive, a little behind them:
//
// - Each arrival sets the pace: what is still to show, spread over the time chunks have been coming
//   apart (smoothed), so the words run on evenly until the next chunk is due.
// - A few words a frame at most (MOST_UNITS): a burst runs on as a sweep, never lands as a lump,
//   unless that would leave it further behind than STREAM_LAG.
// - Never more than STREAM_LAG behind: each chunk shows in full by then, so a fast model is followed
//   closely, and a slow one is shown as it comes.
// - A word still being written (no space after it yet) waits for its end, so it never shows in two
//   halves; after STREAM_LAG with nothing more, it shows as it is.
// - When the stream ends, what is left runs out at the same pace, within STREAM_LAG.
// - At once: when the tab is hidden (nothing is shown there, so nothing is waited for), and the
//   words there when it is first drawn.
//
// It runs once a frame (requestAnimationFrame) while there is something to let out, and only then:
// Markdown is drawn again at most once a frame. `unitsOf` is how it and the fade (reveal.tsx) cut
// text into words.
"use client";

import { useEffect, useRef, useState } from "react";

import { durations } from "../../lib/tokens.values";
import { nothing } from "../../lib/utils";
import { unseenIn } from "./parse";

/** What is let out at a time: a word with the spaces and marks after it, or one character. */
export type Unit = "word" | "character";

// ---- Units ----------------------------------------------------------------------------------------

const segmenters = new Map<Unit, Intl.Segmenter>();

const segmenterOf = (unit: Unit): Intl.Segmenter => {
  const found = segmenters.get(unit);
  if (found !== undefined) {
    return found;
  }
  const made = new Intl.Segmenter(undefined, {
    granularity: unit === "word" ? "word" : "grapheme",
  });
  segmenters.set(unit, made);
  return made;
};

/**
 * Where each unit of `text` starts: a word starts at each word-like segment (the spaces, marks and
 * emoji after it are its own), a character at each grapheme. Joined back, the units are the text.
 */
export const unitsOf = (text: string, unit: Unit): number[] => {
  const starts: number[] = [];
  let word = false;
  for (const { index, isWordLike } of segmenterOf(unit).segment(text)) {
    if (unit === "character" || index === 0) {
      starts.push(index);
    } else if (isWordLike === true && word) {
      starts.push(index);
    }
    word ||= unit === "character" || isWordLike === true;
  }
  return starts;
};

// ---- The pace ---------------------------------------------------------------------------------

/**
 * The most an answer still being written is shown behind what has arrived, in milliseconds: a
 * burst is spread over at most this long, a slow stream shown as it comes.
 */
export const STREAM_LAG = 400;
/** The most units let out in one frame while that keeps within STREAM_LAG: a sweep, not a lump. */
export const MOST_UNITS = 4;
/** How far ahead of what shows the units are read each frame: more than a frame lets out. */
const LOOK_AHEAD = 512;
/** The slowest pace, in characters a millisecond (about eight words a second): no word crawls. */
const FLOOR = 0.045;
/** How much a new gap between chunks weighs against the gaps before it. */
const WEIGHT = 0.3;
/** The gap between chunks a stream is taken to have before its second chunk. */
const FIRST_GAP = 100;
/** A frame this late (a hidden tab, a page that was busy): what is behind shows at once. */
const STALE_FRAME = 1000;
/** How far before what shows a link's tail is looked for: one may have begun there. */
const LOOK_BACK = 256;

/** What the pace keeps between frames. */
export interface Pace {
  /** How much of the text is shown. */
  shown: number;
  /** How fast the words are let out until the next chunk, in characters a millisecond. */
  speed: number;
  /** Characters earned and not yet let out. */
  credit: number;
  /** The time chunks come apart, smoothed, in milliseconds. */
  gap: number;
  /** When the last chunk arrived, or null before the first. */
  arrived: number | null;
  /** Each chunk not yet shown in full: where it ends, and by when it shows (STREAM_LAG after it came). */
  due: readonly (readonly [end: number, by: number])[];
  /** No more is coming: the last word is whole. */
  ended: boolean;
}

/** A pace that starts with `shown` characters showing. */
export const startPace = (shown: number): Pace => ({
  shown,
  speed: FLOOR,
  credit: 0,
  gap: FIRST_GAP,
  arrived: null,
  due: [],
  ended: false,
});

/**
 * The pace once `text` has arrived at `now`: its next word shows at once, and the rest is spread
 * evenly until the next chunk is due (the gap between chunks so far, smoothed, at most STREAM_LAG).
 * So a slow stream shows each word as it comes, and a burst runs on at one pace.
 */
export const arrive = (
  pace: Pace,
  text: string,
  now: number,
  unit: Unit = "word"
): Pace => {
  const gap =
    pace.arrived === null
      ? pace.gap
      : Math.min(
          STREAM_LAG,
          Math.max(1, pace.gap * (1 - WEIGHT) + (now - pace.arrived) * WEIGHT)
        );
  const ahead = text.slice(pace.shown, pace.shown + LOOK_AHEAD);
  const first = unitsOf(ahead, unit)[1] ?? ahead.length;
  return {
    ...pace,
    gap,
    arrived: now,
    credit: Math.max(pace.credit, first),
    speed: Math.max(FLOOR, (text.length - pace.shown - first) / gap),
    due: [
      ...pace.due.filter(([end]) => end > pace.shown),
      [text.length, now + STREAM_LAG],
    ],
  };
};

/** The pace once the stream has ended: no more is coming, so the last word is whole. */
export const end = (pace: Pace): Pace => ({ ...pace, ended: true });

/** Whether text ends a word: a space after it. A word still being written has none yet. */
const ENDS = /\s$/u;

/** What letting out `ahead` from `start` to `end` costs: its characters that are shown. */
const costOf = (unseen: [number, number][], start: number, to: number) =>
  unseen.reduce(
    (cost, [from, until]) =>
      cost - Math.max(0, Math.min(to, until) - Math.max(start, from)),
    to - start
  );

/**
 * Where `ahead` (the text from `from` on) has characters that are never shown (parse.ts): a link's
 * tail, which may have begun just before it, and a table's row of dashes.
 */
const unseenOf = (text: string, from: number, ahead: string) => {
  const back = Math.max(0, from - LOOK_BACK);
  return unseenIn(text.slice(back, from + ahead.length)).map(
    ([start, until]): [number, number] => [
      start - from + back,
      until - from + back,
    ]
  );
};

/**
 * How far the text must show by the end of a frame `elapsed` long, at `now`, so that each chunk
 * shows in full by when it is due: a straight run to each deadline, never further behind.
 */
const leastOf = (pace: Pace, now: number, elapsed: number) => {
  let least = pace.shown;
  for (const [upTo, by] of pace.due) {
    const share = by <= now ? 1 : elapsed / (by - now + elapsed);
    least = Math.max(least, pace.shown + (upTo - pace.shown) * share);
  }
  return least;
};

/**
 * The pace `elapsed` milliseconds later, at `now`, with `text` arrived so far: as many whole units
 * let out as the time has earned at its speed, MOST_UNITS at most, and never fewer than keep every
 * chunk within STREAM_LAG. A last word with no end yet waits for one, for STREAM_LAG at most.
 */
export const advance = (
  pace: Pace,
  text: string,
  now: number,
  elapsed: number,
  unit: Unit = "word"
): Pace => {
  const behind = text.length - pace.shown;
  if (behind <= 0) {
    return pace.credit === 0 && pace.due.length === 0
      ? pace
      : { ...pace, credit: 0, due: [] };
  }
  if (elapsed >= STALE_FRAME) {
    return { ...pace, shown: text.length, credit: 0, due: [] };
  }
  const from = pace.shown;
  const least = Math.ceil(leastOf(pace, now, elapsed));
  let credit = Math.min(behind, pace.credit + pace.speed * elapsed);
  const ahead = text.slice(
    from,
    Math.max(from + LOOK_AHEAD, least + LOOK_AHEAD)
  );
  const starts = unitsOf(ahead, unit);
  const waited = pace.arrived === null ? 0 : now - pace.arrived;
  // The text's last unit ends once a space follows it, the stream has ended, or it has waited long
  // enough. Past what was read, it may go on: it waits, unless it is all that was read.
  const lastEnds =
    from + ahead.length < text.length
      ? starts.length === 1
      : pace.ended ||
        unit === "character" ||
        ENDS.test(ahead) ||
        waited >= STREAM_LAG;
  const unseen = unseenOf(text, from, ahead);
  let shown = from;
  for (let index = 1; index <= starts.length; index += 1) {
    const to = from + (starts[index] ?? ahead.length);
    const cost = costOf(unseen, shown - from, to - from);
    if (index === starts.length && !lastEnds) {
      break;
    }
    // Behind a deadline, a unit goes whatever it costs; else as the time has earned, a few a frame.
    if (shown >= least && (index > MOST_UNITS || credit < cost)) {
      break;
    }
    credit = Math.max(0, credit - cost);
    shown = to;
  }
  return {
    ...pace,
    shown,
    credit: shown === text.length ? 0 : credit,
    due: pace.due.filter(([upTo]) => upTo > shown),
  };
};

// ---- The hook ---------------------------------------------------------------------------------

/** What usePace gives. */
export interface Paced {
  /** As much of the text as is shown. */
  text: string;
  /** Still being let out: the stream goes on, or what it left is still running out. */
  writing: boolean;
  /**
   * Where the words shown in the last duration-stream start: those after it are still fading in,
   * those before it are plain text.
   */
  fresh: number;
  /**
   * Where each step of words shown since `fresh` ends, in order: the words of a step were shown
   * together, so they fade in together.
   */
  steps: readonly number[];
  /**
   * Counts up each time the text is replaced by another while it is paced (it no longer goes on
   * from what was shown): what is shown of the new one is all news.
   */
  round: number;
}

interface Shown {
  shown: number;
  fresh: number;
  steps: readonly number[];
}

/**
 * `text`, as much as has arrived, shown at a steady pace while `streaming` (and `on`): whole units a
 * frame, at the pace they arrive, never more than STREAM_LAG behind; once the stream ends, what is
 * left runs out at that pace. All of it at once when the tab is hidden, or not `on`; what there was
 * when the stream started shows at once. While `hold`, the words shown keep fading as they are
 * (`fresh` stays), so nothing a selection touches is drawn anew.
 */
export const usePace = (
  text: string,
  {
    streaming,
    on,
    unit,
    hold,
  }: { streaming: boolean; on: boolean; unit: Unit; hold: boolean }
): Paced => {
  const all: Shown = { shown: text.length, fresh: text.length, steps: [] };
  const [state, setState] = useState(all);
  const [round, setRound] = useState(0);
  // `ended`: the stream has ended, and what it left runs out.
  const [was, setWas] = useState({ streaming, on, ended: false });
  // A stream that starts, or pacing turned on or off: what is there is no news.
  const starts = was.on !== on || (streaming && !was.streaming);
  const ended = !starts && !streaming && (was.ended || was.streaming);
  if (starts || was.streaming !== streaming) {
    setWas({ streaming, on, ended });
  }
  if (starts) {
    setState(all);
  }
  const writing = on && (streaming || (ended && state.shown < text.length));
  if (writing && state.shown > text.length) {
    // Replaced by a shorter text (an answer written again): from there.
    setState(all);
    setRound(round + 1);
  }
  const latest = useRef(text);
  const pace = useRef(startPace(text.length));
  // When each step of words was shown, for as long as they fade in (or are held).
  const marks = useRef<[number, number][]>([]);
  const held = useRef(hold);
  useEffect(() => {
    held.current = hold;
  }, [hold]);
  // Each arrival sets the pace, and the end of the stream is noted. Not writing, all of it shows.
  useEffect(() => {
    const arrived = latest.current !== text;
    latest.current = text;
    if (!writing || pace.current.shown > text.length) {
      pace.current = startPace(text.length);
      marks.current = [];
      return;
    }
    const now = arrived
      ? arrive(pace.current, text, performance.now(), unit)
      : pace.current;
    pace.current = streaming ? now : end(now);
  }, [text, writing, streaming, unit]);
  const behind = writing && state.shown < text.length;
  useEffect(() => {
    if (!behind) {
      return nothing;
    }
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const from = pace.current;
      const next = advance(from, latest.current, now, now - last, unit);
      last = now;
      pace.current = next;
      const shown = marks.current;
      if (next.shown !== from.shown) {
        shown.push([next.shown, now]);
      }
      let fresh: number | undefined;
      while (
        !held.current &&
        (shown[0]?.[1] ?? now) <= now - durations.stream
      ) {
        fresh = shown.shift()?.[0];
      }
      setState((then) => {
        const seen = fresh ?? then.fresh;
        return then.shown === next.shown && then.fresh === seen
          ? then
          : {
              shown: next.shown,
              fresh: seen,
              steps: shown.map(([upTo]) => upTo),
            };
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [behind, unit]);
  // A hidden tab draws nothing: on the way out and on the way back, all that has arrived shows.
  useEffect(() => {
    if (!writing) {
      return nothing;
    }
    const caughtUp = () => {
      const { length } = latest.current;
      pace.current = { ...pace.current, shown: length, credit: 0, due: [] };
      marks.current = [];
      setState({ shown: length, fresh: length, steps: [] });
    };
    document.addEventListener("visibilitychange", caughtUp);
    return () => {
      document.removeEventListener("visibilitychange", caughtUp);
    };
  }, [writing]);
  if (writing) {
    return {
      text: text.slice(0, Math.min(state.shown, text.length)),
      writing,
      fresh: Math.min(state.fresh, text.length),
      steps: state.steps,
      round,
    };
  }
  // Written, all of it shows; held, what is fading keeps its spans until the selection goes.
  return hold
    ? { text, writing, fresh: state.fresh, steps: state.steps, round }
    : { text, writing, fresh: text.length, steps: [], round };
};
