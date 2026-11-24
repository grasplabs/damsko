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
// - At once: the words already on the page when a stream starts, and on a frame that comes late (a
//   hidden tab, a page that was busy), everything that came longer than STREAM_LAG before it.
//
// It runs while there is something to let out or still fading in, and only then, on the frames of
// requestAnimationFrame, drawing Markdown again at most COMMIT_EVERY: the fade is CSS, so it runs at
// the screen's rate between them. `unitsOf` is how it cuts text into words.
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { durations } from "../../lib/tokens.values";
import { nothing } from "../../lib/utils";

// ---- Units ----------------------------------------------------------------------------------------

const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });

/**
 * Where each word of `text` starts: at each word-like segment, the spaces, marks and emoji after it
 * its own. Joined back, the words are the text.
 */
export const unitsOf = (text: string): number[] => {
  const starts: number[] = [];
  let word = false;
  for (const { index, isWordLike } of segmenter.segment(text)) {
    if (index === 0 || (isWordLike === true && word)) {
      starts.push(index);
    }
    word ||= isWordLike === true;
  }
  return starts;
};

// ---- The pace ---------------------------------------------------------------------------------

/**
 * The most an answer still being written is shown behind what has arrived, in milliseconds: a
 * burst is spread over at most this long, a slow stream shown as it comes.
 */
export const STREAM_LAG = 400;
/**
 * The most words let out in a frame of a 60Hz screen while that keeps within STREAM_LAG: a sweep,
 * not a lump. A draw that comes later lets out as many more as the frames it spans.
 */
export const MOST_UNITS = 4;
const SIXTIETH = 1000 / 60;
/**
 * How often, at most, what is let out is drawn, in milliseconds: about 30 times a second, a little
 * under so a 60Hz screen draws every other frame. Each draw costs Markdown a render; the words'
 * fade runs between them.
 */
export const COMMIT_EVERY = 29;
/** How far ahead of what shows the units are read each frame: more than a frame lets out. */
const LOOK_AHEAD = 512;
/** The slowest pace, in characters a millisecond (about eight words a second): no word crawls. */
const FLOOR = 0.045;
/** How much a new gap between chunks weighs against the gaps before it. */
const WEIGHT = 0.3;
/** The gap between chunks a stream is taken to have before its second chunk. */
const FIRST_GAP = 100;

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
  /**
   * Each chunk not yet shown in full: where it ends, and by when it shows (STREAM_LAG after it came).
   * Of those already due, only the last is kept: it reaches furthest, so it is the one that counts.
   */
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
export const arrive = (pace: Pace, text: string, now: number): Pace => {
  const gap =
    pace.arrived === null
      ? pace.gap
      : Math.min(
          STREAM_LAG,
          Math.max(1, pace.gap * (1 - WEIGHT) + (now - pace.arrived) * WEIGHT)
        );
  const ahead = text.slice(pace.shown, pace.shown + LOOK_AHEAD);
  const first = unitsOf(ahead)[1] ?? ahead.length;
  return {
    ...pace,
    gap,
    arrived: now,
    credit: Math.max(pace.credit, first),
    speed: Math.max(FLOOR, (text.length - pace.shown - first) / gap),
    due: [
      ...pace.due.filter(
        ([upTo, by], index, due) =>
          upTo > pace.shown &&
          (by > now || (due[index + 1]?.[1] ?? Number.POSITIVE_INFINITY) > now)
      ),
      [text.length, now + STREAM_LAG],
    ],
  };
};

/** The pace once the stream has ended: no more is coming, so the last word is whole. */
export const end = (pace: Pace): Pace => ({ ...pace, ended: true });

/** Whether text ends a word: a space after it. A word still being written has none yet. */
const ENDS = /\s$/u;

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
 * The pace `elapsed` milliseconds later, at `now`, with `text` arrived so far: as many whole words
 * let out as the time has earned at its speed, MOST_UNITS a frame of that time at most, and never
 * fewer than keep every chunk within STREAM_LAG; so a frame that comes late shows at once all that
 * is overdue. A last word with no end yet waits for one, for STREAM_LAG at most.
 */
export const advance = (
  pace: Pace,
  text: string,
  now: number,
  elapsed: number
): Pace => {
  const behind = text.length - pace.shown;
  if (behind <= 0) {
    return pace.credit === 0 && pace.due.length === 0
      ? pace
      : { ...pace, credit: 0, due: [] };
  }
  const from = pace.shown;
  const least = Math.ceil(leastOf(pace, now, elapsed));
  let credit = Math.min(behind, pace.credit + pace.speed * elapsed);
  const ahead = text.slice(
    from,
    Math.max(from + LOOK_AHEAD, least + LOOK_AHEAD)
  );
  const starts = unitsOf(ahead);
  const most = MOST_UNITS * Math.max(1, Math.round(elapsed / SIXTIETH));
  const waited = pace.arrived === null ? 0 : now - pace.arrived;
  // The text's last unit ends once a space follows it, the stream has ended, or it has waited long
  // enough. Past what was read, it may go on: it waits, unless it is all that was read.
  const lastEnds =
    from + ahead.length < text.length
      ? starts.length === 1
      : pace.ended || ENDS.test(ahead) || waited >= STREAM_LAG;
  let shown = from;
  for (let index = 1; index <= starts.length; index += 1) {
    const to = from + (starts[index] ?? ahead.length);
    const cost = to - shown;
    if (index === starts.length && !lastEnds) {
      break;
    }
    // Behind a deadline, a unit goes whatever it costs; else as the time has earned, a few a frame.
    if (shown >= least && (index > most || credit < cost)) {
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
   * Where the words drawn in the last duration-stream start: those after it are still fading in,
   * those before it are plain text. The text's length once nothing is fading.
   */
  fresh: number;
  /**
   * Where each step of words drawn since `fresh` ends, in order: the words of a step were drawn
   * together, so they fade in together. Words drawn after the last are the newest step.
   */
  steps: readonly number[];
  /**
   * Counts up each time what is there becomes no news: a stream that starts with words already on
   * the page, pacing turned on or off, or the text replaced by a shorter one (an answer written
   * again).
   */
  round: number;
}

interface Shown {
  shown: number;
  fresh: number;
  steps: readonly number[];
  round: number;
}

/** What was given while no stream was paced (with `on`): where the next stream starts from. */
interface Given {
  streaming: boolean;
  on: boolean;
  paced: boolean;
  text: string;
}

/**
 * Where a stream that starts now starts, `shown` of the text showing: after what is on the page (the
 * text as it was, or as much of it as a stream still running out had shown), when `text` goes on
 * from it; else all of it is no news.
 */
const startOf = (was: Given, shown: number, text: string) => {
  if (!text.startsWith(was.text)) {
    return text.length;
  }
  return was.paced ? Math.min(shown, was.text.length) : was.text.length;
};

/**
 * What shows of `text`, and whether it is paced: from when a stream starts until what it left has
 * all been let out. What is on the page when a round starts (pacing turned on or off, the text
 * replaced by a shorter one) is no news: all of it shows. A stream that starts with more than was on
 * the page (its first chunk given with `streaming` in the same render) lets out what is new.
 */
const useShown = (text: string, streaming: boolean, on: boolean) => {
  const [state, setState] = useState<Shown>(() => ({
    shown: text.length,
    fresh: text.length,
    steps: [],
    round: 0,
  }));
  const [was, setWas] = useState<Given>({
    streaming,
    on,
    paced: on && streaming,
    text,
  });
  const turned = was.on !== on;
  const starts = turned || (streaming && !was.streaming);
  const restarts = starts || (was.paced && state.shown > text.length);
  const from =
    starts && !turned ? startOf(was, state.shown, text) : text.length;
  const current = restarts
    ? { shown: from, fresh: from, steps: [], round: state.round + 1 }
    : state;
  const paced =
    on && (streaming || (!starts && was.paced && current.shown < text.length));
  if (
    was.streaming !== streaming ||
    was.on !== on ||
    was.paced !== paced ||
    (on && !paced && was.text !== text)
  ) {
    setWas({ streaming, on, paced, text });
  }
  if (restarts) {
    setState(current);
  }
  return { current, setState, paced };
};

/**
 * `text`, as much as has arrived, shown at a steady pace while `streaming` (and `on`): whole words a
 * draw, at the pace they arrive, never more than STREAM_LAG behind; once the stream ends, what is
 * left runs out at that pace. What is on the page when a stream starts stays, and so does any change
 * while none is paced. The words fade in from when they are `drawn` (how far of the text the page
 * draws, given back by the caller: a table's row or a note's line is drawn only once it is whole),
 * and keep fading after the stream ends, until the last has; while `hold`, they keep fading as they
 * are (`fresh` stays), so nothing a selection touches is drawn anew.
 */
export const usePace = (
  text: string,
  {
    streaming,
    on,
    hold,
    drawn,
  }: {
    streaming: boolean;
    on: boolean;
    hold: boolean;
    drawn: RefObject<number>;
  }
): Paced => {
  const { current, setState, paced } = useShown(text, streaming, on);
  const fading = on && current.fresh < current.shown;
  const running = (paced && current.shown < text.length) || (fading && !hold);
  const latest = useRef(text);
  const pace = useRef(startPace(text.length));
  const started = useRef(current.round);
  // When each step of words was drawn, for as long as they fade in (or are held), and how far the
  // words drawn have been marked.
  const marks = useRef<[number, number][]>([]);
  const marked = useRef(current.shown);
  const held = useRef(hold);
  useEffect(() => {
    held.current = hold;
  }, [hold]);
  // Each arrival sets the pace, and the end of the stream is noted. A round starts from what is on
  // the page; not paced, all of it shows. Before any frame can come, so none goes on from the round
  // before.
  useLayoutEffect(() => {
    const arrived = latest.current !== text;
    latest.current = text;
    if (started.current !== current.round) {
      started.current = current.round;
      pace.current = startPace(current.shown);
      marks.current = [];
      marked.current = current.shown;
    }
    if (!paced) {
      pace.current = startPace(text.length);
    } else if (arrived) {
      pace.current = arrive(pace.current, text, performance.now());
    }
    if (!streaming) {
      pace.current = end(pace.current);
    }
  }, [text, paced, streaming, current.round, current.shown]);
  useEffect(() => {
    if (!running) {
      return nothing;
    }
    let last = performance.now();
    let committed = Number.NEGATIVE_INFINITY;
    let frame = 0;
    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      if (time - committed < COMMIT_EVERY) {
        return;
      }
      committed = time;
      const next = advance(pace.current, latest.current, time, time - last);
      last = time;
      pace.current = next;
      // The words drawn since the last draw are a step, from now: drawn late (a row held until it
      // is whole), they still fade in from when they show.
      const steps = marks.current;
      if (drawn.current > marked.current) {
        steps.push([drawn.current, time]);
        marked.current = drawn.current;
      }
      let fresh: number | undefined;
      while (
        !held.current &&
        (steps[0]?.[1] ?? time) <= time - durations.stream
      ) {
        fresh = steps.shift()?.[0];
      }
      // Nothing drawn is fading (none was ever marked, or a round began): all of it is plain.
      if (steps.length === 0 && !held.current) {
        fresh = marked.current;
      }
      const ends = steps.map(([upTo]) => upTo);
      setState((then) => {
        const seen = fresh ?? then.fresh;
        return then.shown === next.shown &&
          then.fresh === seen &&
          then.steps.length === ends.length
          ? then
          : { ...then, shown: next.shown, fresh: seen, steps: ends };
      });
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [running, setState, drawn]);
  return {
    text: paced ? text.slice(0, Math.min(current.shown, text.length)) : text,
    writing: paced,
    fresh: fading ? Math.min(current.fresh, text.length) : text.length,
    steps: fading ? current.steps : [],
    round: current.round,
  };
};
