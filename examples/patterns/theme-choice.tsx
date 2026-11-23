"use client";

import { Card, CardDescription, CardTitle } from "@grasp-os/ui/components/card";
import { isThemeMode, ThemeToggle } from "@grasp-os/ui/components/theme-toggle";
import type { ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import * as stylex from "@stylexjs/stylex";
import { createContext, use, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { flushSync } from "react-dom";

import "../../src/styles/themes.css";
import { layout } from "../theme-toggle/layout";

// ---- The change: in one frame, a crossfade, or a circle that grows from the switch --------------
//
// A crossfade of the whole page (View Transitions, 280ms), or a reveal, a soft circle growing from
// the switch on our ease (300ms): both at or under the 300ms limit. With reduced motion, and where
// a browser has no View Transitions, every way is one frame. The Themes foundation's example of
// the three ways uses the same three exports.

/** The ways a theme can change. */
export type ThemeChangeWay = "frame" | "fade" | "reveal";

// The View Transition's own pseudo-elements live on the document, so their rules are global: draw
// them once, in a <style>. The reveal grows a circle from the point the switch stood at, read from
// three custom properties.
export const themeChangeCss = `
::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
html[data-damsko-change="fade"]::view-transition-old(root) { animation: damsko-fade-out 280ms cubic-bezier(0.22, 1, 0.36, 1) both; }
html[data-damsko-change="fade"]::view-transition-new(root) { animation: damsko-fade-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both; }
html[data-damsko-change="reveal"]::view-transition-new(root) { animation: damsko-reveal 300ms cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes damsko-fade-out { to { opacity: 0; } }
@keyframes damsko-fade-in { from { opacity: 0; } }
@keyframes damsko-reveal {
  from { clip-path: circle(0 at var(--theme-change-x) var(--theme-change-y)); }
  to { clip-path: circle(var(--theme-change-r) at var(--theme-change-x) var(--theme-change-y)); }
}
`;

/** Applies a change the chosen way: at once, or inside a View Transition that starts at `from`. */
export const changeTheme = (
  way: ThemeChangeWay,
  apply: () => void,
  from: { x: number; y: number }
) => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  if (way === "frame" || reduced || !("startViewTransition" in document)) {
    apply();
    return;
  }
  // The circle reaches the farthest corner of the window from where it starts.
  const r = Math.hypot(
    Math.max(from.x, window.innerWidth - from.x),
    Math.max(from.y, window.innerHeight - from.y)
  );
  root.style.setProperty("--theme-change-x", `${from.x}px`);
  root.style.setProperty("--theme-change-y", `${from.y}px`);
  root.style.setProperty("--theme-change-r", `${r}px`);
  root.dataset.damskoChange = way;
  const transition = document.startViewTransition(() => {
    flushSync(apply);
  });
  void transition.finished.then(() => {
    delete root.dataset.damskoChange;
  });
};

/** The middle of an element's box, where a change it made starts from. */
export const middleOf = (element: Element) => {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

// ---- The remembered choice: a small provider the product writes ---------------------------------

const KEY = "examples-theme-choice";
const CHANGED = "examples-theme-choice-changed";

/** The kept mode: the system's when nothing is kept, or storage is shut. */
const kept = (): ThemeMode => {
  try {
    const mode = localStorage.getItem(KEY);
    return isThemeMode(mode) ? mode : "system";
  } catch {
    return "system";
  }
};
// Another tab's choice shows here too.
const watch = (change: () => void) => {
  window.addEventListener("storage", change);
  window.addEventListener(CHANGED, change);
  return () => {
    window.removeEventListener("storage", change);
    window.removeEventListener(CHANGED, change);
  };
};
const onServer = (): ThemeMode => "system";

/**
 * What draws the kept mode before the page wakes, as the first thing in the element that carries
 * it. A product runs the same line in its <head>, on <html>.
 */
const beforePaint = `try{const m=localStorage.getItem(${JSON.stringify(KEY)});if(m==="light"||m==="dark")document.currentScript.parentElement.dataset.mode=m}catch(e){}`;

interface ThemeChoice {
  mode: ThemeMode;
  /** Keeps the mode. With `from`, the element the person chose it on, the change grows from there. */
  setMode: (mode: ThemeMode, from?: Element) => void;
}
const ThemeContext = createContext<ThemeChoice | null>(null);

const useTheme = (): ThemeChoice => {
  const choice = use(ThemeContext);
  if (choice === null) {
    throw new Error("useTheme belongs inside a ThemeProvider.");
  }
  return choice;
};

/** Holds the mode, keeps it in localStorage, and writes it on the element round its children. */
const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const mode = useSyncExternalStore(watch, kept, onServer);
  const setMode = (next: ThemeMode, from?: Element) => {
    const apply = () => {
      try {
        localStorage.setItem(KEY, next);
      } catch {
        // Storage refused: the choice lasts the page.
      }
      window.dispatchEvent(new Event(CHANGED));
    };
    // A person's own pick grows from the switch; anything else changes in one frame.
    if (from === undefined) {
      apply();
    } else {
      changeTheme("reveal", apply, middleOf(from));
    }
  };
  return (
    // oxlint-disable-next-line react/jsx-no-constructed-context-values -- compiled
    <ThemeContext value={{ mode, setMode }}>
      {/* The script may have written the kept mode before React woke: that is not a fault. */}
      <div
        data-mode={mode}
        data-theme="evergreen"
        suppressHydrationWarning
        {...stylex.props(layout.scope)}
      >
        <script
          // A site's router may mark a script it has run.
          suppressHydrationWarning
          // oxlint-disable-next-line react/no-danger -- the example's own constant script
          dangerouslySetInnerHTML={{ __html: beforePaint }}
        />
        <style>{themeChangeCss}</style>
        {children}
      </div>
    </ThemeContext>
  );
};

const styles = stylex.create({
  unknown: { visibility: "hidden" },
});

// ---- The page ------------------------------------------------------------------------------------

const awake = () => true;
const asleep = () => false;

/**
 * The switch, anywhere under the provider. Until the page wakes the kept mode is not known to
 * React, so the switch keeps its room and is not shown: it never says System over a dark page.
 */
const Switch = () => {
  const { mode, setMode } = useTheme();
  const known = useSyncExternalStore(watch, awake, asleep);
  const place = useRef<HTMLSpanElement>(null);
  return (
    <span ref={place} {...stylex.props(!known && styles.unknown)}>
      <ThemeToggle
        mode={mode}
        onModeChange={(next) => {
          setMode(next, place.current ?? undefined);
        }}
      />
    </span>
  );
};

// The choice is remembered: pick Dark and load the page again, and it opens dark, drawn so before
// React wakes. A pick grows from the switch as a circle (View Transitions); with reduced motion, or
// in a browser without them, it changes in one frame.
export default function ThemeChoiceExample() {
  return (
    <ThemeProvider>
      <div {...stylex.props(layout.ground)}>
        <div {...stylex.props(layout.row)}>
          <h3 {...stylex.props(layout.title)}>Settings</h3>
          <Switch />
        </div>
        <Card>
          <CardTitle>Spring launch</CardTitle>
          <CardDescription>Everything the team ships in March.</CardDescription>
        </Card>
      </div>
    </ThemeProvider>
  );
}
