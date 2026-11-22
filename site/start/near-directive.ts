// `client:near`: an Astro island that loads when it comes within a quarter of a window of being
// seen, measured in the box that scrolls it. Astro's `client:visible` measures against the window,
// and in the App shell the page scrolls inside its own frame, which clips every margin to the
// frame. Registered in astro.config.ts; used by the Showcase (site/pages/index.astro).
//
// It never hydrates an island that has left the page: a press on a link can scroll the island
// into view in the same moment the router swaps the page away, and hydrating then makes React log
// #424. So it checks `isConnected` when it hydrates, and lets go of everything before a swap.
import type { ClientDirective } from "astro";

const scrollerOf = (element: Element): Element | null => {
  for (let at = element.parentElement; at; at = at.parentElement) {
    if (/(?:auto|scroll)/u.test(getComputedStyle(at).overflowY)) return at;
  }
  return null;
};

const near: ClientDirective = (load, _options, element) => {
  let done = false;
  const watch = new IntersectionObserver(
    (entries) => {
      if (done || !entries.some((entry) => entry.isIntersecting)) return;
      stop();
      void load().then((hydrate) => {
        if (element.isConnected) void hydrate();
      });
    },
    { root: scrollerOf(element), rootMargin: "25% 0px" }
  );
  const stop = () => {
    done = true;
    watch.disconnect();
    document.removeEventListener("astro:before-swap", stop);
  };
  for (const child of element.children) watch.observe(child);
  document.addEventListener("astro:before-swap", stop);
};

export default near;

declare module "astro" {
  interface AstroClientDirectives {
    "client:near"?: boolean;
  }
}
