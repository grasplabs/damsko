// Focus that a script moves after a click is not keyboard focus, so it shows no ring.
//
// The frame moves focus itself: into a card or a dialog when it opens, back to its button when it
// closes. Safari never focuses a button on a click, so focus moved by a script after a click counts
// there as keyboard focus and drew the ring round the menu button (the screenshot: a dark
// circle on the far-right button after closing the phone menu). Here, when the last thing the
// reader did was press with a pointer, the element the script focuses is marked
// [data-site-quiet] and the frame's ring leaves it out (site/system/styles/site.css). The first key
// press clears every mark, so Tab, the arrows and Escape show the ring as always.
let pointer = false;

addEventListener("pointerdown", () => (pointer = true), true);
addEventListener(
  "keydown",
  () => {
    pointer = false;
    for (const element of document.querySelectorAll<HTMLElement>(
      "[data-site-quiet]"
    )) {
      delete element.dataset.siteQuiet;
    }
  },
  true
);

/** Focuses `element` as the frame does: with no ring when a pointer, not the keyboard, led here. */
export const frameFocus = (element: HTMLElement | null | undefined) => {
  if (!element) {
    return;
  }
  if (pointer) {
    element.dataset.siteQuiet = "";
    element.addEventListener("blur", () => delete element.dataset.siteQuiet, {
      once: true,
    });
  }
  element.focus({ preventScroll: true });
};
