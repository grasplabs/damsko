// Smooth text: the words of an answer still being written, shown at a steady pace whatever the
// bursts they arrive in. A model's stream comes in uneven chunks (a token at a time, a paragraph
// after a pause, everything at once after a hidden tab); shown as they come, the words jump. This
// lets them out a whole word at a time (Intl.Segmenter's words, so Chinese, Japanese, Thai and
// emoji are words too) at the pace they arrive, a little behind them:
//
//   const shown = useSmoothText(text, { streaming });
//
// - Each arrival sets the pace: what is still to show, spread over the time chunks have been
//   coming apart (smoothed), so the words run on evenly until the next chunk is due.
// - Never more than stream-lag behind: a large burst after a pause is spread over at most that, so
//   a fast model is followed closely, and a slow one is shown as it comes.
// - A word still being written (no space after it yet) waits for its end, so it never shows in two
//   halves; after stream-lag with nothing more, it shows as it is.
// - At once: when the stream ends, when the tab was hidden (nothing is shown there, so nothing is
//   waited for), with reduced motion, and the words there when it is first drawn.
//
// It runs once a frame (requestAnimationFrame) while there is something to let out, and only then:
// the caller is drawn again at most once a frame. Markdown uses it for an answer it streams;
// `unitsOf` is how it and Markdown's fade cut text into words.
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { durations } from "../lib/tokens.values";
import { nothing } from "../lib/utils";

/** What is let out at a time: a word with the spaces and marks after it, or one character. */
export type SmoothTextUnit = "word" | "character";

/** How useSmoothText paces a text. */
export interface SmoothTextOptions {
  /** More is still coming: paced. False shows all of it at once. */
  streaming: boolean;
  /**
   * What is let out at a time.
   * @default "word"
   */
  unit?: SmoothTextUnit;
}

// ---- Units ----------------------------------------------------------------------------------------

const segmenters = new Map<SmoothTextUnit, Intl.Segmenter>();

const segmenterOf = (unit: SmoothTextUnit): Intl.Segmenter => {
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
export const unitsOf = (text: string, unit: SmoothTextUnit): number[] => {
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

/** The longest look ahead for the next units: more than any burst lets out in a frame. */
const LOOK_AHEAD = 512;
/** The slowest pace, in characters a millisecond (about eight words a second): no word crawls. */
const FLOOR = 0.045;
/** How much a new gap between chunks weighs against the gaps before it. */
const WEIGHT = 0.3;
/** The gap between chunks a stream is taken to have before its second chunk. */
const FIRST_GAP = 100;
/** A frame this late (a hidden tab, a page that was busy): what is behind shows at once. */
const STALE_FRAME = 1000;

/** What the pace keeps between frames. */
export interface SmoothTextPace {
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
}

/** A pace that starts with `shown` characters showing. */
export const startPace = (shown: number): SmoothTextPace => ({
  shown,
  speed: FLOOR,
  credit: 0,
  gap: FIRST_GAP,
  arrived: null,
});

/**
 * The pace once `text` has arrived at `now`: its next word shows at once, and the rest is spread
 * evenly until the next chunk is due (the gap between chunks so far, smoothed, at most stream-lag).
 * So a slow stream shows each word as it comes, and a burst runs on at one pace, never in a lump.
 */
export const arrive = (
  pace: SmoothTextPace,
  text: string,
  now: number,
  unit: SmoothTextUnit = "word"
): SmoothTextPace => {
  const gap =
    pace.arrived === null
      ? pace.gap
      : Math.min(
          durations.streamLag,
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
  };
};

/** Whether text ends a word: a space after it. A word still being written has none yet. */
const ENDS = /\s$/u;

// A Markdown link's address, `](…)`, is never shown (Markdown draws the link's words), and nor is
// a table's row of dashes, so letting them out takes no time: the words after a link follow its
// words at once, and a table's first row its head, not after a pause as long as what is not shown.
const ADDRESS = /\]\([^)\s]*\)?|^[ \t]*\|[ \t:|-]*-[ \t:|-]*$/gmu;
const ADDRESS_OPEN = /\]\([^)\s]*$/u;

/** The characters of `ahead` (the text from `from` on) that are never shown: a link's address. */
const unseenOf = (text: string, from: number, ahead: string) => {
  const unseen: [number, number][] = [];
  if (ADDRESS_OPEN.test(text.slice(Math.max(0, from - 256), from))) {
    const close = ahead.search(/[)\s]/u);
    unseen.push([0, close === -1 ? ahead.length : close + 1]);
  }
  for (const found of ahead.matchAll(ADDRESS)) {
    unseen.push([found.index, found.index + found[0].length]);
  }
  return unseen;
};

/** What letting out `ahead` from `start` to `end` costs: its characters that are shown. */
const costOf = (unseen: [number, number][], start: number, end: number) =>
  unseen.reduce(
    (cost, [from, to]) =>
      cost - Math.max(0, Math.min(end, to) - Math.max(start, from)),
    end - start
  );

/**
 * The pace `elapsed` milliseconds later, at `now`, with `text` arrived so far: as many whole units
 * let out as the time has earned at its speed, and never less than keeps what is behind under
 * stream-lag. A last word with no end yet waits for one, for stream-lag at most.
 */
export const advance = (
  pace: SmoothTextPace,
  text: string,
  now: number,
  elapsed: number,
  unit: SmoothTextUnit = "word"
): SmoothTextPace => {
  const behind = text.length - pace.shown;
  if (behind <= 0) {
    return pace.credit === 0 ? pace : { ...pace, credit: 0 };
  }
  if (elapsed >= STALE_FRAME) {
    return { ...pace, shown: text.length, credit: 0 };
  }
  const speed = Math.max(pace.speed, behind / durations.streamLag);
  let credit = Math.min(behind, pace.credit + speed * elapsed);
  const from = pace.shown;
  const ahead = text.slice(from, from + LOOK_AHEAD);
  const starts = unitsOf(ahead, unit);
  const waited = pace.arrived === null ? 0 : now - pace.arrived;
  // The text's last unit ends only once a space follows it, or it has waited long enough.
  const lastEnds =
    from + ahead.length < text.length ||
    unit === "character" ||
    ENDS.test(ahead) ||
    waited >= durations.streamLag;
  const unseen = unseenOf(text, from, ahead);
  let shown = from;
  for (let index = 1; index <= starts.length; index += 1) {
    const end = from + (starts[index] ?? ahead.length);
    const cost = costOf(unseen, shown - from, end - from);
    const last = index === starts.length;
    if ((last && !lastEnds) || credit < cost) {
      break;
    }
    credit -= cost;
    shown = end;
  }
  return { ...pace, shown, credit: shown === text.length ? 0 : credit };
};

// ---- The hook ---------------------------------------------------------------------------------

const REDUCE = "(prefers-reduced-motion: reduce)";

const watchMotion = (changed: () => void) => {
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", changed);
  return () => {
    query.removeEventListener("change", changed);
  };
};

/** Whether the person asks for reduced motion; false on the server. */
export const useReducedMotion = () =>
  useSyncExternalStore(
    watchMotion,
    () => window.matchMedia(REDUCE).matches,
    () => false
  );

/** What usePacedText gives: the text to show, and how many times it was replaced by another. */
export interface PacedText {
  /** As much of the text as is shown. */
  text: string;
  /**
   * Counts up each time the text is replaced by another while it is paced (it no longer goes on
   * from what was shown): what is shown of the new one is all news.
   */
  round: number;
}

/**
 * useSmoothText, and how many times its text was replaced by another (`round`): for a part that
 * marks what is new, as Markdown's fade does.
 */
export const usePacedText = (
  text: string,
  { streaming, unit = "word" }: SmoothTextOptions
): PacedText => {
  const reduced = useReducedMotion();
  const paced = streaming && !reduced;
  // Words there when it is first drawn, or when pacing starts, are not news: they show at once.
  const [shown, setShown] = useState(text.length);
  const [round, setRound] = useState(0);
  const [wasPaced, setWasPaced] = useState(paced);
  if (wasPaced !== paced) {
    setWasPaced(paced);
    setShown(text.length);
  } else if (paced && shown > text.length) {
    // Replaced by a shorter text (an answer written again): from there.
    setShown(text.length);
    setRound(round + 1);
  }
  const latest = useRef(text);
  const pace = useRef(startPace(text.length));
  // Each arrival sets the pace. Not paced, all of it is shown, and pacing starts from there.
  useEffect(() => {
    latest.current = text;
    pace.current =
      !paced || pace.current.shown > text.length
        ? startPace(text.length)
        : arrive(pace.current, text, performance.now(), unit);
  }, [text, paced, unit]);
  const behind = paced && shown < text.length;
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
      if (next.shown !== from.shown) {
        setShown(next.shown);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [behind, unit]);
  // A hidden tab draws nothing: on the way out and on the way back, all that has arrived shows.
  useEffect(() => {
    if (!paced) {
      return nothing;
    }
    const caughtUp = () => {
      const all = latest.current.length;
      pace.current = { ...pace.current, shown: all, credit: 0 };
      setShown(all);
    };
    document.addEventListener("visibilitychange", caughtUp);
    return () => {
      document.removeEventListener("visibilitychange", caughtUp);
    };
  }, [paced]);
  return {
    text: paced ? text.slice(0, Math.min(shown, text.length)) : text,
    round,
  };
};

/**
 * `text`, as much as has arrived, shown at a steady pace while `streaming`: whole words (or
 * characters) a frame, at the pace they arrive, never more than stream-lag behind. All of it once
 * the stream ends, the tab was hidden or reduced motion is asked for; what there was when it was
 * first drawn shows at once.
 *
 *   const shown = useSmoothText(text, { streaming: status === "streaming" });
 */
export const useSmoothText = (
  text: string,
  options: SmoothTextOptions
): string => usePacedText(text, options).text;
