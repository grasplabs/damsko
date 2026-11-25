// The idle watcher: after a while with nothing done on the page, the idle screen (./idle-screen.ts)
// dithers in from the window's edges and then rests as a full window of scenes, one forming out of
// the next. This file is all a page carries before then, a timer and no frame loop; the screen and
// its pictures are fetched only when it begins.
//
// It never begins: with the tab hidden; while a text field holds what is being typed; while a
// dialog, menu or popover is open; while a video or sound plays or something records; with reduced
// motion (the calmer choice: nothing at all, not a still); in an automated browser
// (`navigator.webdriver`, so the browser specs never meet it) unless the address asks with
// `?idle=`; or with `?noidle`. Only what protects the reader's work or access holds it back, never
// the battery or save-data. `?idle=<seconds>` only shortens the wait.
//
// Any input ends it at once. The input that ends it does nothing else: it is caught here, so a
// press is not a click on what lies under the screen, a key does not act, a wheel does not scroll.
// Focus and scroll are never touched, so the page is as it was.
import { durations } from "@grasp-os/ui/lib/tokens.values";

import type { IdleScreen } from "./idle-screen";
import { idleSeconds } from "./idle-time";

/** What tells the watcher the page is being used. */
const events = [
  "pointermove",
  "pointerdown",
  "keydown",
  "wheel",
  "touchstart",
  "scroll",
  "focusin",
] as const;
/** What ends the screen while it is up. */
const ending = [
  "pointermove",
  "pointerdown",
  "keydown",
  "wheel",
  "touchstart",
] as const;
/** The rest of the press that ended it (a tap's touchstart follows its pointerdown). */
const rests = [
  "touchstart",
  "pointerup",
  "mouseup",
  "mousedown",
  "click",
  "keyup",
  "touchend",
  "contextmenu",
] as const;

/** A field that holds what is being typed. */
const FIELD =
  "textarea, [contenteditable]:not([contenteditable=false]), input:not([type=checkbox], [type=radio], [type=range], [type=button], [type=submit], [type=reset], [type=color], [type=file])";
/** Something open over the page. */
const OPEN =
  "dialog[open], [aria-modal=true]:not(dialog), [aria-haspopup]:not([aria-haspopup=false])[aria-expanded=true], [data-recording], :popover-open";

let timer = 0;
let screen: IdleScreen | null = null;
let starting = false;
let caughtUntil = 0;
let lastX = -1;
let lastY = -1;
let moved: Event | null = null;

const asked = (): { off: boolean; seconds: number } => {
  const query = new URLSearchParams(location.search);
  const seconds = Number(query.get("idle"));
  return {
    off: query.has("noidle"),
    seconds: seconds > 0 ? Math.min(seconds, idleSeconds) : 0,
  };
};

/** Something on the page that must not be covered: being typed, open, playing or recording. */
const busy = (): boolean => {
  const field = document.activeElement;
  if (
    field instanceof HTMLElement &&
    field.matches(FIELD) &&
    (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement
      ? field.value
      : (field.textContent ?? "")
    ).length > 0
  ) {
    return true;
  }
  // Open and seen: an empty region kept open for what may come (the toasts') takes no room.
  for (const element of document.querySelectorAll<HTMLElement>(OPEN)) {
    const { width, height } = element.getBoundingClientRect();
    if (
      width * height > 0 &&
      element.checkVisibility({
        opacityProperty: true,
        visibilityProperty: true,
      })
    ) {
      return true;
    }
  }
  for (const media of document.querySelectorAll<HTMLMediaElement>(
    "video, audio"
  )) {
    if (!(media.paused || media.ended)) {
      return true;
    }
  }
  return false;
};

/** The page was used, or the screen ended: the wait starts again. */
const schedule = (): void => {
  clearTimeout(timer);
  const { off, seconds } = asked();
  if (off || (navigator.webdriver && seconds === 0)) {
    return;
  }
  timer = window.setTimeout(begin, (seconds || idleSeconds) * 1000);
};

/** The rest of the press that ended it (its release and click) goes nowhere. */
const rest = (event: Event): void => {
  if (performance.now() > caughtUntil) {
    return;
  }
  // A touchstart is passive at the window, so it is only stopped.
  if (event.cancelable && event.type !== "touchstart") {
    event.preventDefault();
  }
  event.stopImmediatePropagation();
};

const close = (now = false): void => {
  for (const type of ending) {
    removeEventListener(type, wake, { capture: true });
  }
  screen?.end(now);
  screen = null;
};

/**
 * While the screen is up: the first input ends it and does nothing else (a press is not a click on
 * what lies under it, a key does not act, a wheel does not scroll). Added only then, so the page's
 * wheel and touch stay passive the rest of the time.
 */
const wake = (event: Event): void => {
  if (event.type === "pointermove") {
    // Only a move the reader made (input, below, has already told it from the browser's own).
    if (event !== moved) {
      return;
    }
  } else {
    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopImmediatePropagation();
    caughtUntil = performance.now() + durations.releaseSwallow;
  }
  close();
  schedule();
};

const begin = async (): Promise<void> => {
  if (
    screen !== null ||
    starting ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  if (document.hidden || busy()) {
    schedule();
    return;
  }
  starting = true;
  const { idleScreen } = await import("./idle-screen");
  // Input while it was on its way: it is not wanted now.
  if (!starting) {
    return;
  }
  starting = false;
  screen = idleScreen();
  for (const type of ending) {
    addEventListener(type, wake, { capture: true, passive: false });
  }
};

/** The page was used: the wait starts again (and a screen on its way is not wanted). */
const input = (event: Event): void => {
  if (event instanceof PointerEvent && event.type === "pointermove") {
    // A move to the same place is the browser's own (a layout change under a still pointer), not the reader's.
    if (event.clientX === lastX && event.clientY === lastY) {
      return;
    }
    lastX = event.clientX;
    lastY = event.clientY;
    moved = event;
  }
  starting = false;
  if (screen === null) {
    schedule();
  }
};

for (const type of events) {
  addEventListener(type, input, { capture: true, passive: true });
}
for (const type of rests) {
  addEventListener(type, rest, { capture: true });
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearTimeout(timer);
  } else {
    schedule();
  }
});
// A page swapped by the router: the screen goes with the old page, the wait starts again.
document.addEventListener("astro:before-swap", () => {
  close(true);
  schedule();
});
schedule();
