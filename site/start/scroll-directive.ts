// `client:scroll`: an Astro island that loads once the reader starts to move: the first scroll of
// the page (in the App shell, of its own frame), or a pointer or the keyboard reaching into it.
// For a part that is drawn in the first HTML but only comes into play as the page is scrolled, so
// a first visit does not pay for it. Registered in astro.config.ts; used by the Showcase.
//
// One on the first screen does not wait for a move: it loads as its piece comes out of the
// Showcase's entrance (`showcase:resolved`), when the entrance has played (`showcase:settled` on the
// window), or at once when there is none, so a card that builds is never an empty grid.
//
// It never hydrates an island that has left the page (a link pressed can scroll the page in the
// same moment the router swaps it away; React would log #424): it checks `isConnected` when it
// hydrates, and lets go of its listeners before a swap.
import type { ClientDirective } from "astro";

const scroll: ClientDirective = (load, _options, element) => {
  let done = false;
  const stop = () => {
    done = true;
    removeEventListener("showcase:settled", settle);
    element.removeEventListener("showcase:resolved", go);
    removeEventListener("scroll", go, true);
    element.removeEventListener("pointerdown", go);
    element.removeEventListener("focusin", go);
    document.removeEventListener("astro:before-swap", stop);
  };
  const go = () => {
    if (done) return;
    stop();
    void load().then((hydrate) => {
      if (element.isConnected) void hydrate();
    });
  };
  // On the first screen: the island itself has no box (display: contents), so its first child's.
  const settle = () => {
    const box = (element.firstElementChild ?? element).getBoundingClientRect();
    if (box.bottom > 0 && box.top < innerHeight && box.width > 0) go();
  };
  // During the Showcase's entrance: as its own piece comes out of the dither (`showcase:resolved` on the
  // piece's part, which bubbles to the island), or when the entrance ends, whichever is first.
  if (document.querySelector("[data-showcase][data-entrance]")) {
    addEventListener("showcase:settled", settle, { once: true });
    element.addEventListener("showcase:resolved", go, { once: true });
  } else settle();
  // Capturing, so a scroll of any box (the shell's page frame) counts.
  addEventListener("scroll", go, { capture: true, passive: true });
  element.addEventListener("pointerdown", go);
  element.addEventListener("focusin", go);
  document.addEventListener("astro:before-swap", stop);
};

export default scroll;

declare module "astro" {
  interface AstroClientDirectives {
    "client:scroll"?: boolean;
  }
}
