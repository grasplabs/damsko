"use client";

import { Card, CardDescription, CardTitle } from "@grasp-os/ui/components/card";
import { isThemeMode, ThemeToggle } from "@grasp-os/ui/components/theme-toggle";
import type { ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import * as stylex from "@stylexjs/stylex";
import { createContext, use, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import "../../src/styles/themes.css";
import { layout } from "../theme-toggle/layout";
import { changeTheme, middleOf, themeChangeCss } from "../theme/change-theme";

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

// ---- The page ------------------------------------------------------------------------------------

/** The switch, anywhere under the provider. */
const Switch = () => {
  const { mode, setMode } = useTheme();
  const place = useRef<HTMLSpanElement>(null);
  return (
    <span ref={place}>
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
