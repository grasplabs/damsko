// The site's one copy behaviour. Every copy control on every page uses it: a block's pills and
// copy buttons, the stage's code, a heading's link mark, "Copy as Markdown" in the rail.
//
//   [data-copy="text"]           copies that text
//   [data-copy-from="selector"]  copies the text of that element, looked up inside the nearest
//                                [data-copy-scope] (or the page)
//   [data-copy-link]             copies the absolute address of its href
//   [data-copy-url="/page.md"]   copies the text served at that address (fetched on the click)
//   [data-copy-said="…"]         what a screen reader hears after a copy (default "Copied")
//
// While it works the control carries data-action-state: "swap" for the crossfade, then "done" or
// "failed" for duration-hold, then "swap" again on the way back, then nothing. Beside it,
// data-action-shown ("done" or "failed") says which words the control wears: it is set and taken
// away in the middle of a crossfade, while nothing of the control's words is seen, so a part that
// appears or goes with the result (a tick, a swatch) does so unseen and fades with the rest.
// Blocks style themselves from those two attributes. A second press while the result shows
// changes nothing but how long it stays. The words
// change in place: in [data-action-label] when the control has one, else in the control itself
// when it holds only text; a control with an icon and no label (a heading's link mark) changes
// only its state. The control keeps its width, so nothing beside it moves, and one polite live
// region says what happened. Timings come from the tokens (duration-swap, duration-hold).
import { durations } from "@grasp-os/ui/lib/tokens.values";

const SWAP = durations.swap;
const HOLD = durations.hold;

const timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>[]>();
let voice: HTMLElement | null = null;

/** Says something to a screen reader, politely, through the site's one live region. */
export const announce = (words: string) => {
  if (!voice?.isConnected) {
    voice = document.createElement("p");
    voice.setAttribute("role", "status");
    voice.setAttribute("aria-live", "polite");
    voice.className = "site-visually-hidden";
    voice.dataset.siteVoice = "";
    document.body.append(voice);
  }
  const target = voice;
  target.textContent = "";
  requestAnimationFrame(() => {
    target.textContent = words;
  });
};

const labelOf = (control: HTMLElement) => {
  const label = control.querySelector<HTMLElement>("[data-action-label]");
  if (label) {
    return label;
  }
  return control.children.length === 0 ? control : null;
};

const show = (
  control: HTMLElement,
  state: "done" | "failed",
  words: string,
  said: string
) => {
  const label = labelOf(control);
  const showing =
    control.dataset.actionShown === state &&
    control.dataset.actionState === state;
  for (const timer of timers.get(control) ?? []) {
    clearTimeout(timer);
  }
  if (label) {
    const rest = control.dataset.actionRest ?? label.textContent ?? "";
    control.dataset.actionRest = rest;
    // Keep the width it had at rest, so the shorter or longer words move nothing beside it.
    // Its width in the layout, not as drawn: under a finger the control is pressed a little small,
    // and that smaller size was what it then kept.
    if (!control.style.minWidth) {
      const laid = getComputedStyle(control).width;
      control.style.minWidth = laid.endsWith("px")
        ? laid
        : `${control.getBoundingClientRect().width}px`;
    }
  }
  // One turn: what it wears goes out, changes while nothing of it is seen, and what comes comes in.
  const turn = (to: string | null, next: "done" | "failed" | null) => {
    control.dataset.actionState = "swap";
    return setTimeout(() => {
      if (label && to !== null) {
        label.textContent = to;
      }
      if (next) {
        control.dataset.actionShown = next;
      } else {
        delete control.dataset.actionShown;
      }
      // Drawn once unseen, so the parts that have just appeared fade in rather than pop.
      void control.offsetWidth;
      if (next) {
        control.dataset.actionState = next;
      } else {
        delete control.dataset.actionState;
        delete control.dataset.actionRest;
        control.style.minWidth = "";
      }
    }, SWAP);
  };
  const leaveAfter = (wait: number) =>
    setTimeout(() => {
      timers.set(control, [
        turn(label ? (control.dataset.actionRest ?? "") : null, null),
      ]);
    }, wait);
  announce(said);
  if (showing) {
    // Pressed again while it says so: it stays as it is and only holds for longer.
    timers.set(control, [leaveAfter(HOLD)]);
    return;
  }
  timers.set(control, [
    turn(label ? words : null, state),
    leaveAfter(SWAP + HOLD),
  ]);
};

const legacyCopy = (text: string) => {
  // In-app browsers and insecure origins: the old command, checked.
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.append(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
};

/** Writes text to the clipboard; true when it got there. */
export const writeClipboard = async (
  text: string | Promise<string>
): Promise<boolean> => {
  if (typeof text !== "string") {
    // Text that is still on its way (a fetched page): handed to the clipboard as a promise, so
    // Safari keeps the click's permission while it loads.
    try {
      const blob = text.then((value) => {
        if (!value) {
          throw new Error("Nothing to copy");
        }
        return new Blob([value], { type: "text/plain" });
      });
      await navigator.clipboard.write([
        new ClipboardItem({ "text/plain": blob }),
      ]);
      return true;
    } catch {
      const value = await text.catch(() => "");
      return await (value.length > 0 && writeClipboard(value));
    }
  }
  if (text.length === 0) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return legacyCopy(text);
  }
};

const fetchText = async (url: string) => {
  const response = await fetch(url, {
    headers: { accept: "text/markdown, text/plain" },
  });
  if (!response.ok) {
    throw new Error(`${response.status}`);
  }
  return await response.text();
};

const textOf = (control: HTMLElement): string | Promise<string> => {
  if (control.dataset.copyUrl) {
    return fetchText(control.dataset.copyUrl);
  }
  if (control.hasAttribute("data-copy-link")) {
    return new URL(control.getAttribute("href") ?? "", location.href).href;
  }
  const from = control.dataset.copyFrom;
  if (from) {
    const scope = control.closest("[data-copy-scope]") ?? document;
    return scope.querySelector(from)?.textContent ?? "";
  }
  return control.dataset.copy ?? "";
};

/** The library's Snippet's button inside a control (site/blocks/parts.tsx, CopyValue), if any. */
const fieldIn = (control: HTMLElement) =>
  control.querySelector<HTMLElement>(
    '[data-slot="snippet"] [data-slot="copy-button"]'
  );

/**
 * A Snippet shows its result as the component itself does (src/components/snippet.tsx): its
 * button's data-status, for duration-hold, which its ground follows by its own transitions. A press
 * while it shows the result does nothing, as useAction ignores one.
 */
const showField = (
  button: HTMLElement,
  state: "success" | "error",
  said: string
) => {
  for (const timer of timers.get(button) ?? []) {
    clearTimeout(timer);
  }
  button.dataset.status = state;
  announce(said);
  timers.set(button, [
    setTimeout(() => {
      button.dataset.status = "idle";
    }, HOLD),
  ]);
};

/** Copies what a control names and says how it went, on the control and to a screen reader. */
export const copyFrom = async (control: HTMLElement) => {
  const field = fieldIn(control);
  if (field) {
    if (
      field.dataset.status === "success" ||
      field.dataset.status === "error"
    ) {
      return;
    }
    const copied = await writeClipboard(textOf(control));
    showField(
      field,
      copied ? "success" : "error",
      copied ? (control.dataset.copySaid ?? "Copied") : "Could not copy"
    );
    return;
  }
  const copied = await writeClipboard(textOf(control));
  if (copied) {
    show(control, "done", "Copied", control.dataset.copySaid ?? "Copied");
  } else {
    show(control, "failed", "Could not copy", "Could not copy");
  }
};

export const COPY_CONTROL =
  "[data-copy], [data-copy-from], [data-copy-link], [data-copy-url]";

document.addEventListener("click", (event) => {
  const control = (event.target as Element | null)?.closest<HTMLElement>(
    COPY_CONTROL
  );
  if (!control) {
    return;
  }
  // A link mark also goes to its section (the browser does that); a copy button does nothing else.
  if (!control.hasAttribute("data-copy-link")) {
    event.preventDefault();
  }
  void copyFrom(control);
});
