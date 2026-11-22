// The home page's living ground (site/pages/index.astro): one canvas behind the whole showcase,
// following the share of the page scrolled. Light on purpose: the shader (shader.ts) is loaded the
// first time the canvas comes near the window, and it draws only while it is in view and the tab is
// seen. Under it, in the first HTML, a soft glow of its tone, which fades once the canvas has drawn
// (`data-drawn`); the page's own still (GroundStill) stands under both. With reduced motion it is
// one still picture. The site's own, not a part of the library.
"use client";

import { media } from "@grasp-os/ui/lib/tokens.stylex";
import { motionVars } from "@grasp-os/ui/lib/vars.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";

import { siteColors } from "../../system/site-tokens.stylex";
import type { Drawing } from "./shader";

const styles = stylex.create({
  // The box: the glow and the canvas stand behind whatever stands in it.
  box: {
    position: "relative",
    isolation: "isolate",
    width: "100%",
    height: "100%",
  },
  // The canvas: each cell a crisp square, strongest towards the window's foot.
  canvas: {
    position: "absolute",
    inset: 0,
    zIndex: -1,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    imageRendering: "pixelated",
    maskImage: siteColors.showcaseGroundMask,
    color: siteColors.showcaseGroundLit,
  },
  // What the first paint shows before the canvas has drawn: a soft glow of the ground's own tone
  // under its own mask, fading out once the canvas says it drew.
  glow: {
    position: "absolute",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
    backgroundImage:
      "radial-gradient(130% 85% at 50% 0%, currentColor 0%, transparent 72%), radial-gradient(60% 60% at 92% 4%, currentColor 0%, transparent 70%)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    imageRendering: "pixelated",
    maskImage: siteColors.showcaseGroundMask,
    color: siteColors.showcaseGroundLit,
    opacity: { default: 1, ":has(+ canvas[data-drawn])": 0 },
    transitionProperty: "opacity",
    transitionDuration: motionVars.ui,
  },
});

const REDUCED = media.reducedMotion.replace("@media ", "");

/** The box that scrolls `element`: its nearest scrolling ancestor, else the document. */
const scrollerOf = (element: Element): Element => {
  for (let at = element.parentElement; at !== null; at = at.parentElement) {
    if (/(?:auto|scroll)/u.test(getComputedStyle(at).overflowY)) {
      return at;
    }
  }
  return document.scrollingElement ?? document.documentElement;
};

/** The share of `box` scrolled, 0 to 1. */
const scrolledShare = (box: Element): number => {
  const travel = box.scrollHeight - box.clientHeight;
  return travel > 0 ? box.scrollTop / travel : 0;
};

/** Draws on `element` while it is in view and the tab is seen. Returns what stops it for good. */
const watch = (element: HTMLCanvasElement): (() => void) => {
  const box = scrollerOf(element);
  const still = matchMedia(REDUCED).matches;
  let drawing: Drawing | undefined;
  let loading = false;
  let gone = false;
  let inView = false;
  const update = (): void => {
    drawing?.run(inView && document.visibilityState === "visible");
  };
  const load = async (): Promise<void> => {
    loading = true;
    let started: Drawing | undefined;
    try {
      const { startShader } = await import("./shader");
      started = startShader(element, {
        progress: () => scrolledShare(box),
        still,
      });
    } catch {
      started = undefined;
    }
    if (gone) {
      started?.stop();
      return;
    }
    drawing = started;
    update();
    // The glow under the canvas fades out once the canvas has its first picture.
    if (started !== undefined) {
      requestAnimationFrame(() => {
        element.dataset.drawn = "";
      });
    }
  };
  const seen = new IntersectionObserver(
    (entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      if (inView && !loading) {
        void load();
      }
      update();
    },
    { rootMargin: "200px 0px" }
  );
  seen.observe(element);
  document.addEventListener("visibilitychange", update);
  return () => {
    gone = true;
    seen.disconnect();
    document.removeEventListener("visibilitychange", update);
    drawing?.stop();
  };
};

/** The living ground: its glow, then its canvas. */
export const Ground = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    return element === null ? undefined : watch(element);
  }, []);
  return (
    <div data-slot="ground" {...stylex.props(styles.box)}>
      <span aria-hidden="true" {...stylex.props(styles.glow)} />
      <canvas
        aria-hidden="true"
        data-slot="ground-canvas"
        ref={canvas}
        {...stylex.props(styles.canvas)}
      />
    </div>
  );
};
