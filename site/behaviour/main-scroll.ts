// Back and Forward return to where the page was left. The page scrolls in the docs shell's card
// ([data-site-scroller], site/chrome/DocsShell.tsx), not the window, and the router restores only
// the window's scroll, so every Back landed at the top. Here the place in the card is kept for each
// address (this tab only) and put back when Back or Forward brings that address again, by the
// router or by the browser.
const scroller = () =>
  document.querySelector<HTMLElement>("[data-site-scroller]");
const keyOf = (href: string) => `site-main-scroll:${href}`;

let frame = 0;
document.addEventListener(
  "scroll",
  (event) => {
    if (event.target !== scroller() || frame) {
      return;
    }
    frame = requestAnimationFrame(() => {
      frame = 0;
      try {
        sessionStorage.setItem(
          keyOf(location.href),
          String(scroller()?.scrollTop ?? 0)
        );
      } catch {}
    });
  },
  { capture: true, passive: true }
);

const restore = () => {
  const main = scroller();
  let top = 0;
  try {
    top = Number(sessionStorage.getItem(keyOf(location.href)) ?? 0);
  } catch {}
  if (main && top > 0) {
    main.scrollTop = top;
  }
};

let traverse = false;
document.addEventListener("astro:before-swap", (event) => {
  traverse =
    (event as Event & { navigationType?: string }).navigationType ===
    "traverse";
});
document.addEventListener("astro:after-swap", () => {
  if (traverse) {
    restore();
  }
  traverse = false;
});

// A whole page load reached by Back or Forward (or a reload) opens where it was left.
try {
  const kind = (
    performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined
  )?.type;
  if (kind === "back_forward" || kind === "reload") {
    restore();
  }
} catch {}
