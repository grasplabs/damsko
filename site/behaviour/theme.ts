// The site's own theme: light, dark or the system's. The head's inline script
// (site/system/head-scripts.ts, themeInit) reads the kept choice before the first paint and writes
// `data-mode` on the root, as the library's themes read it (src/styles/themes.css); the preview
// frames (site/layouts/Frame.astro) read the same key. Light and dark are kept; System removes the
// key and follows the operating system, also when that changes while the page is open. The control
// is the library's ThemeToggle (site/chrome/DocsShell.tsx), which holds no state of its own: it
// reads the choice here and calls chooseTheme.
import type { ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import { isThemeMode } from "@grasp-os/ui/components/theme-toggle";

import { themeKey } from "../system/head-scripts";

const darkQuery = (): MediaQueryList | null =>
  typeof window === "undefined"
    ? null
    : window.matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set<() => void>();

const stored = (): string | null => {
  try {
    return localStorage.getItem(themeKey);
  } catch {
    return null;
  }
};

/** The reader's choice: light, dark or system. */
// An example alone whose address asked for a mode (site/layouts/Frame.astro, ?mode=dark) keeps it:
// the frame marks it data-mode-from-address, and that wins over the kept choice.
// A page that always has one look (data-mode-fixed, the home page's dark: Docs.astro's `mode`) has
// it too, and the kept choice is left as it is for every other page.
export const currentChoice = (): ThemeMode => {
  const fixed = document.documentElement.dataset.modeFixed;
  if (fixed === "light" || fixed === "dark") {
    return fixed;
  }
  const asked = document.documentElement.dataset.modeFromAddress;
  if (asked === "light" || asked === "dark") {
    return asked;
  }
  const kept = stored();
  return isThemeMode(kept) ? kept : "system";
};

/** Runs `listener` after every change of the choice; returns the call that stops it. */
export const watchChoice = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Writes the mode a choice means on the root, all colours in one frame. */
export const applyTheme = (choice: ThemeMode) => {
  const root = document.documentElement;
  const mode =
    choice === "system" ? (darkQuery()?.matches ? "dark" : "light") : choice;
  if (root.dataset.mode !== mode) {
    // In one frame: no transition may fade some colours and snap others.
    const still = document.createElement("style");
    still.textContent = "*,*::before,*::after{transition:none!important}";
    document.head.append(still);
    root.dataset.mode = mode;
    window.getComputedStyle(root).opacity;
    setTimeout(() => {
      still.remove();
    }, 1);
  }
  for (const listener of listeners) {
    listener();
  }
};

/** Keeps the reader's choice and shows it. */
export const chooseTheme = (choice: ThemeMode) => {
  try {
    if (choice === "system") {
      localStorage.removeItem(themeKey);
    } else {
      localStorage.setItem(themeKey, choice);
    }
  } catch {
    // Storage blocked: the choice holds for this page only.
  }
  applyTheme(choice);
};

// In the browser only: the shell's island imports this module on the server too.
if (typeof window !== "undefined") {
  darkQuery()?.addEventListener("change", () => {
    if (currentChoice() === "system") {
      applyTheme("system");
    }
  });
  // Another tab's choice shows here too.
  window.addEventListener("storage", (event) => {
    if (event.key === themeKey) {
      applyTheme(currentChoice());
    }
  });
}
