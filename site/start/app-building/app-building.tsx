// App building: the home page's sketches of a screen being made (site/pages/index.astro). Named
// cursors put a generic interface together piece by piece (a top bar, a sidebar, cards, a chart, a
// table), swap two pieces, clear it softly and build another, in an order mixed from a seed, so it
// can run for minutes without plainly repeating. When `done`, it hands over: the cursors leave,
// the stage crosses out and its children stand in its place. The site's own drawing, not a part
// of the library.
//
//   <AppBuilding variant="blueprint" step="Sketching the screens" seed={9} />
//   <AppBuilding done={ready} step="Putting the screen together"><Screen /></AppBuilding>
//
// It fills its container. It runs only while it is on screen in a shown tab, moves only transform
// and opacity, each move 300ms at most, and with reduced motion shows the finished interface,
// still. The drawing is decorative; the step line is said politely.
"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { AnimationEvent, ReactNode } from "react";

import type { AppBuildingLook } from "./parts";
import { advance, planOf, startAt, stillOf } from "./plan";
import { Scene } from "./scene";
import { styles, looks } from "./styles";

/** Every prop an AppBuilding takes. */
export interface AppBuildingProps {
  /**
   * How it is drawn: `blocks`, soft blocks with a dither; `blueprint`, one cursor drawing outlines
   * on a grid.
   * @default "blocks"
   */
  variant?: AppBuildingLook;
  /** What is being done now, in a line under the stage, said politely to a screen reader. */
  step?: string;
  /**
   * The screen is ready: the cursors leave, the stage crosses out and `children` stand in its place.
   * @default false
   */
  done?: boolean;
  /** The screen itself, shown once `done`. */
  children?: ReactNode;
  /**
   * Where its order of layouts and pieces starts: two builds with one seed run alike.
   * @default 1
   */
  seed?: number;
}

/** The names on the cursors' tags, in the order the layouts number them (layouts.ts, builderOf). */
const names = ["Layout", "Data", "Copy"] as const;

/** Whether the element is on screen, in a tab that is shown: the build stops when nobody can see it. */
const useSeen = (element: HTMLElement | null) => {
  // Not seen until it is known to be: the stage a server drew is paused from the start.
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (element === null) {
      return undefined;
    }
    let inView = false;
    const update = () => {
      setSeen(inView && document.visibilityState === "visible");
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [element]);
  return seen;
};

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (change: () => void) => {
  const list = window.matchMedia(REDUCED_QUERY);
  list.addEventListener("change", change);
  return () => {
    list.removeEventListener("change", change);
  };
};
const reducedNow = () => window.matchMedia(REDUCED_QUERY).matches;
const reducedOnServer = () => false;

/** Whether the reader asked for less motion. On the server it is not known, so it moves. */
const useReducedMotion = () =>
  useSyncExternalStore(subscribe, reducedNow, reducedOnServer);

interface BuildProps {
  look: AppBuildingLook;
  seed: number;
  done: boolean;
  still: boolean;
}

/** The build: one step on each round of the clock, which pauses with the rest. */
const Build = ({ look, seed, done, still }: BuildProps) => {
  const [at, setAt] = useState(() => startAt(seed));
  const cursors = look === "blueprint" ? 1 : names.length;
  if (still) {
    const { shown, hands } = stillOf(seed, cursors);
    return (
      <Scene
        look={look}
        shown={shown}
        hands={hands}
        names={names}
        still
        round={0}
        step={0}
        done={done}
      />
    );
  }
  const { shown, hands } = planOf(at, seed, cursors);
  const next = () => {
    setAt((now) => advance(now, seed));
  };
  return (
    <>
      <Scene
        look={look}
        shown={shown}
        hands={hands}
        names={names}
        still={false}
        round={at.round}
        step={at.step}
        done={done}
      />
      {done ? null : (
        <span
          data-slot="app-building-clock"
          onAnimationIteration={next}
          {...stylex.props(styles.clock)}
        />
      )}
    </>
  );
};

/**
 * The hand-over. `gone` says the stage has left and the screen stands alone: once the crossing has
 * ended, or at once when there is no crossing to wait for (`direct`).
 */
const useCrossing = (done: boolean, direct: boolean) => {
  // Crossed: the stage has gone. Already done on the first render, it never shows.
  const [crossed, setCrossed] = useState(done);
  if (crossed && !done) {
    setCrossed(false);
  }
  const ended = (event: AnimationEvent<HTMLDivElement>) => {
    if (done && event.target === event.currentTarget) {
      setCrossed(true);
    }
  };
  return { gone: crossed || direct, direct, ended };
};

export const AppBuilding = ({
  variant: look = "blocks",
  step,
  done = false,
  children,
  seed = 1,
}: AppBuildingProps) => {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const seen = useSeen(root);
  const still = useReducedMotion();
  // With reduced motion, or while the stage is not seen, there is no crossing to wait for: the
  // screen shows directly.
  const { gone, direct, ended } = useCrossing(done, done && (still || !seen));
  const hasStep = step !== undefined && step !== "";
  return (
    <section
      ref={setRoot}
      aria-label="Building your app"
      aria-busy={done ? undefined : true}
      data-slot="app-building"
      data-look={look}
      data-state={done ? "done" : "building"}
      {...stylex.props(styles.root)}
    >
      {gone ? null : (
        <div
          data-slot="app-building-stage"
          data-paused={seen ? undefined : ""}
          onAnimationEnd={ended}
          {...stylex.props(
            styles.stage,
            !seen && styles.paused,
            done && styles.crossing
          )}
        >
          <div
            aria-hidden="true"
            data-slot="app-building-canvas"
            {...stylex.props(styles.canvas, looks[look].ground)}
          >
            <Build look={look} seed={seed} done={done} still={still} />
          </div>
          <p
            aria-live="polite"
            data-slot="app-building-step"
            {...stylex.props(styles.step, !hasStep && styles.stepEmpty)}
          >
            {hasStep && !done ? step : null}
          </p>
        </div>
      )}
      {gone ? (
        <div
          data-slot="app-building-app"
          {...(direct
            ? stylex.props(styles.app)
            : stylex.props(styles.app, styles.arriving))}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
};
