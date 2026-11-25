// The idle watcher: after a while with nothing done on the page, the idle screen (./idle-screen.ts)
// dithers in from the window's edges and then rests as a full window of scenes, one forming out of
// the next. This file is all a page carries before then, a timer and no frame loop; the screen and
// its pictures are fetched only when it begins.
//
// It never begins: with the tab hidden; while a text field holds what is being typed; while a
// dialog, menu or popover is open; while a video or sound plays or something records; with reduced
// motion (the calmer choice: nothing at all, not a still); in an automated browser
// (`navigator.webdriver`, so the browser specs never meet it) unless the address asks with
// `?idle=<seconds>`, which only an automated browser may use to shorten the wait; or with `?noidle`.
// Only what protects the reader's work or access holds it back, never the battery or save-data.
// Where it cannot draw (no WebGL, no picture, WebGL lost) it is not tried again on this page.
//
// Any input ends it at once. Once it can be seen (./idle-screen.ts, seen), the input that ends it
// does nothing else: it is caught here, so a press is not a click on what lies under the screen, a
// key does not act, a wheel does not scroll; nor does the rest of that press or key, up to its
// release. Before that, the input goes on to the page. Focus and scroll are never touched.
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
/** What the rest of the press or key that ended it may bring, and the next press or key, which ends that. */
const rests = [
  "pointerdown",
  "keydown",
  "keyup",
  "touchstart",
  "pointerup",
  "pointercancel",
  "mouseup",
  "mousedown",
  "click",
  "touchend",
  "contextmenu",
] as const;
/** The last a press or key may bring: what is caught after it is the reader's next. */
const releases = new Set([
  "keyup",
  "click",
  "touchend",
  "contextmenu",
  "pointercancel",
]);

/** A field that holds what is being typed. */
const FIELD =
  "textarea, [contenteditable]:not([contenteditable=false]), input:not([type=checkbox], [type=radio], [type=range], [type=button], [type=submit], [type=reset], [type=color], [type=file])";
/** Something open over the page. */
const OPEN =
  "dialog[open], [aria-modal=true]:not(dialog), [aria-haspopup]:not([aria-haspopup=false])[aria-expanded=true], [data-recording], :popover-open";

let timer = 0;
let screen: IdleScreen | null = null;
let starting = false;
/** The screen cannot draw here: it is not tried again on this page. */
let broken = false;
/** The press or key that ended the screen, until its release: the rest of it goes nowhere. */
let swallowing: "press" | "key" | null = null;
let lastX = -1;
let lastY = -1;
let moved: Event | null = null;

const asked = (): { off: boolean; seconds: number } => {
  const query = new URLSearchParams(location.search);
  const seconds = Number(query.get("idle"));
  return {
    off: query.has("noidle"),
    seconds:
      navigator.webdriver && seconds > 0
        ? Math.min(Math.max(seconds, 1), idleSeconds)
        : 0,
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
  if (broken || off || (navigator.webdriver && seconds === 0)) {
    return;
  }
  timer = window.setTimeout(begin, (seconds || idleSeconds) * 1000);
};

/** Stops an input from doing anything on the page. A touchstart is passive at the window, so it is only stopped. */
const nothing = (event: Event): void => {
  if (event.cancelable && event.type !== "touchstart") {
    event.preventDefault();
  }
  event.stopImmediatePropagation();
};

/** The rest of the press or key that ended it goes nowhere, up to its release; the next one goes on. */
const rest = (event: Event): void => {
  if (swallowing === null) {
    return;
  }
  const key = event instanceof KeyboardEvent ? event : null;
  if (
    event.type === "pointerdown" ||
    (key !== null && key.type === "keydown" && !key.repeat)
  ) {
    swallowing = null;
    return;
  }
  if ((key !== null) !== (swallowing === "key")) {
    return;
  }
  nothing(event);
  if (releases.has(event.type)) {
    swallowing = null;
  }
};

/** The screen is no longer the watcher's. */
const letGo = (): IdleScreen | null => {
  for (const type of ending) {
    removeEventListener(type, wake, { capture: true });
  }
  const was = screen;
  screen = null;
  return was;
};
const close = (now = false): void => {
  letGo()?.end(now);
};
/** The screen could not draw: it has taken itself away, and is not tried again here. */
const gone = (): void => {
  broken = true;
  clearTimeout(timer);
  letGo();
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
  } else if (screen?.seen() === true) {
    nothing(event);
    if (event.type !== "wheel") {
      swallowing = event.type === "keydown" ? "key" : "press";
    }
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
  const wanted = starting;
  starting = false;
  if (!wanted || screen !== null) {
    return;
  }
  screen = idleScreen(gone);
  if (screen === null) {
    gone();
    return;
  }
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
// Reduced motion turned on, or the page printed: the screen goes at once.
matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () =>
  close(true)
);
addEventListener("beforeprint", () => close(true));
// A page swapped by the router: the screen goes with the old page, the wait starts again.
document.addEventListener("astro:before-swap", () => {
  close(true);
  schedule();
});
schedule();
