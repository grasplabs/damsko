"use client";

import { Button } from "@grasp-os/ui/components/button";
import { DownloadIcon, Icon } from "@grasp-os/ui/lib/icons";
import { colors, font, media, space } from "@grasp-os/ui/lib/tokens.stylex";
// The brand book's entrance (/brand): through the glass. The website's reeded glass stands at the
// sides as one pane each, the name stands alone in the middle in the Showcase's own setting, then
// one line and the two ways on the centre line, one above the other: Enter, and below it the
// download. The rooms are reached through the floor plan (frame.tsx) and from Enter. Everything arrives through the dither, as the Showcase does (resolve.ts): from a sparse,
// coarse ghost to the solid thing; a key, a press or a scroll makes it whole at once. Under reduced
// motion or with no script, everything stands whole from the first paint.
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";

import { siteColors, siteSize } from "../system/site-tokens.stylex";
import { entranceWords, openRooms, roomHref } from "./content";
import { playDoor } from "./door";
import { Controls } from "./frame";
import { Glass } from "./glass";
import { arrive, coarse, fine } from "./resolve";
import type { Arrival } from "./resolve";

/** The name, set in the serif, regular, with its line, its tracking, its floor and ceiling, and on a
 * phone its phone size. "Brand book" is ten letters to "Damsko"'s six, so on a wide window its share
 * of the width is 12vw where a six-letter name's would be 17vw: the name stays in the clearing of
 * night and never reaches the glass. */
export const nameSetting = stylex.create({
  name: {
    // The box hugs the words, centred, so nothing of it lies over the glass at the sides; on a phone,
    // where the name takes two lines, it is as wide as "Brand".
    width: { default: "fit-content", [media.maxSm]: "min-content" },
    marginBlock: 0,
    marginInline: "auto",
    fontFamily: font.serif,
    fontWeight: font.weightNormal,
    fontSize: {
      default: "clamp(5.5rem, min(12vw, 30svh), 16rem)",
      [media.maxSm]: "24vw",
    },
    lineHeight: 0.9,
    letterSpacing: "-0.035em",
    color: colors.primaryForegroundOnColor,
    textWrap: "balance",
  },
});

/** The door's glass: the light's stops from paper at its outer edge to night where the two meet. */
const doorLight = `${colors.brandPaper} 0%, ${colors.brandLime} 22%, ${colors.brandSea} 36%, ${colors.brandMint} 48%, ${colors.brandPine} 66%, ${colors.brandInk} 84%, ${colors.brandNight} 100%`;

const s = stylex.create({
  page: {
    position: "relative",
    minHeight: "100svh",
    backgroundColor: colors.brandNight,
    fontFamily: font.sans,
  },
  hall: {
    position: "relative",
    isolation: "isolate",
    overflow: "hidden",
    colorScheme: "dark",
    backgroundColor: colors.brandNight,
    color: colors.bodyForeground,
  },
  centre: {
    position: "relative",
    display: "grid",
    alignContent: "center",
    justifyItems: "center",
    minHeight: "100svh",
    // Clear of the two controls at the top.
    paddingBlock: { default: "6rem", [media.maxSm]: "5rem" },
    paddingInline: { default: space["8"], [media.maxSm]: space["4"] },
    textAlign: "center",
  },
  line: {
    margin: 0,
    marginBlockStart: space["6"],
    maxWidth: { default: "30rem", [media.maxSm]: "16rem" },
    fontSize: font.textLg,
    lineHeight: font.textLgLine,
    color: colors.bodyForeground,
    textWrap: "balance",
  },
  // The ways: one above the other, on the page's centre line. Enter stands over the door as it
  // plays (the chosen way stays until it goes into the light).
  ways: {
    position: "relative",
    zIndex: 2,
    display: "grid",
    justifyItems: "center",
    gap: space["3"],
    marginBlockStart: space["10"],
  },

  // ---- The door (door.ts plays it): hidden until Enter is pressed; never in the way of a pointer.
  door: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    overflow: "hidden",
    pointerEvents: "none",
    visibility: "hidden",
  },
  // Beyond the doors: the light, warmest at the opening, settling to night, the ground room 01
  // opens on (the website's door floods to paper, the colour its next page opens in).
  // Hidden until the doors meet, so the entrance shows between them as they close.
  beyond: {
    position: "absolute",
    inset: 0,
    opacity: 0,
    backgroundColor: colors.brandNight,
  },
  warm: {
    position: "absolute",
    inset: 0,
    opacity: 0,
    backgroundImage: `radial-gradient(ellipse 34% 75% at 50% var(--door-y, 50%), ${colors.brandPaper}, ${colors.brandLime} 22%, ${colors.brandMint} 48%, ${colors.brandPine} 74%, ${colors.brandNight} 100%)`,
  },
  // A door: half the screen of the glass, the light at its outer edge, night where the two meet.
  leaf: {
    position: "absolute",
    insetBlock: 0,
    width: "50.5%",
    overflow: "hidden",
  },
  leafStart: {
    insetInlineStart: 0,
    backgroundImage: `linear-gradient(90deg in oklch, ${doorLight})`,
    transform: "translateX(-101%)",
  },
  leafEnd: {
    insetInlineEnd: 0,
    backgroundImage: `linear-gradient(270deg in oklch, ${doorLight})`,
    transform: "translateX(101%)",
  },
  leafReeds: {
    position: "absolute",
    inset: 0,
    backgroundImage: siteColors.flutes,
    backgroundSize: siteSize.flutesSize,
    mixBlendMode: "soft-light",
  },
  // A door's cut edge, bright, where it meets the other.
  leafEdge: {
    position: "absolute",
    insetBlock: 0,
    width: 2,
    opacity: 0,
    backgroundColor: colors.brandPaper,
    boxShadow: `0 0 24px 6px color-mix(in oklch, ${colors.brandMint} 70%, transparent)`,
  },
  leafEdgeStart: { insetInlineEnd: 0 },
  leafEdgeEnd: { insetInlineStart: 0 },
  // The light gathering behind the glass at Enter, and the seam running up and down from it.
  gather: {
    position: "absolute",
    insetInlineStart: "50%",
    insetBlockStart: "var(--door-y, 50%)",
    width: "70vmax",
    height: "70vmax",
    marginInlineStart: "-35vmax",
    marginBlockStart: "-35vmax",
    opacity: 0,
    backgroundImage: `radial-gradient(circle, color-mix(in oklch, ${colors.brandLime} 90%, transparent) 0%, color-mix(in oklch, ${colors.brandMint} 45%, transparent) 22%, transparent 60%)`,
    mixBlendMode: "screen",
  },
  seam: {
    position: "absolute",
    insetBlock: 0,
    insetInlineStart: "calc(50% - 1px)",
    width: 2,
    opacity: 0,
    transformOrigin: "50% var(--door-y, 50%)",
    transform: "scaleY(0)",
    backgroundColor: colors.brandPaper,
    boxShadow: `0 0 26px 8px color-mix(in oklch, ${colors.brandMint} 55%, transparent)`,
  },
});

/** Runs the arrival once the island is live: the parts named, from the root. Coming back to the
 * page (back or forward), everything is whole at once. */
export const useArrival = (parts: (root: HTMLElement) => Arrival[]) => {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    const back =
      (
        performance.getEntriesByType("navigation")[0] as
          | PerformanceNavigationTiming
          | undefined
      )?.type === "back_forward";
    if (back) {
      element.removeAttribute("data-arriving");
      return;
    }
    return arrive(element, parts(element));
    // The arrival plays once, on the first render.
  }, []);
  return { root };
};

/** Every part marked `data-resolve` with this name. */
export const all = (root: HTMLElement, name: string) => [
  ...root.querySelectorAll(`[data-resolve="${name}"]`),
];

export default function Entrance() {
  const first = openRooms[0];
  const page = useRef<HTMLDivElement>(null);
  const door = useRef<HTMLDivElement>(null);
  const playing = useRef<(() => void) | null>(null);
  // The door: pressed, the glass closes over the screen, the light gathers at Enter, the seam runs,
  // the doors part and room 01 stands behind them. A second press or Escape goes straight in.
  const enter = (event: MouseEvent<HTMLAnchorElement>) => {
    const { href } = event.currentTarget;
    if (playing.current) {
      event.preventDefault();
      playing.current();
      return;
    }
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !page.current ||
      !door.current
    ) {
      return;
    }
    event.preventDefault();
    playing.current = playDoor({
      page: page.current,
      door: door.current,
      way: event.currentTarget,
      go: () => {
        location.assign(href);
      },
    });
  };
  // Room 01 is fetched while the pointer or the keys rest on Enter, so it stands whole at once.
  const prefetch = (href: string) => {
    if (document.head.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
      return;
    }
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.append(link);
  };
  useEffect(() => {
    // Back to the entrance from the room (the page kept as it was): the door is undone.
    const shown = (event: PageTransitionEvent) => {
      if (!event.persisted) {
        return;
      }
      playing.current = null;
      for (const animation of page.current?.getAnimations({ subtree: true }) ??
        []) {
        animation.cancel();
      }
      door.current?.style.removeProperty("visibility");
    };
    addEventListener("pageshow", shown);
    return () => {
      removeEventListener("pageshow", shown);
    };
  }, []);
  const { root } = useArrival((element) => [
    ...all(element, "title").map((part) => ({
      element: part,
      delay: 80,
      duration: 720,
      cells: coarse,
    })),
    ...all(element, "line").map((part) => ({
      element: part,
      delay: 440,
      duration: 520,
      cells: fine,
    })),
    ...all(element, "enter").map((part) => ({
      element: part,
      delay: 700,
      duration: 440,
      cells: fine,
    })),
    ...all(element, "download").map((part) => ({
      element: part,
      delay: 820,
      duration: 440,
      cells: fine,
    })),
  ]);
  return (
    <div ref={page} data-brand-entrance="" {...stylex.props(s.page)}>
      <Controls here="entrance" />
      <div ref={root} data-arriving="" {...stylex.props(s.hall)}>
        <Glass shape="pane" />
        <div ref={door} aria-hidden="true" {...stylex.props(s.door)}>
          <span data-door="beyond" {...stylex.props(s.beyond)} />
          <span data-door="warm" {...stylex.props(s.warm)} />
          <span data-door="start" {...stylex.props(s.leaf, s.leafStart)}>
            <span {...stylex.props(s.leafReeds)} />
            <span
              data-door="edge"
              {...stylex.props(s.leafEdge, s.leafEdgeStart)}
            />
          </span>
          <span data-door="end" {...stylex.props(s.leaf, s.leafEnd)}>
            <span {...stylex.props(s.leafReeds)} />
            <span
              data-door="edge"
              {...stylex.props(s.leafEdge, s.leafEdgeEnd)}
            />
          </span>
          <span data-door="gather" {...stylex.props(s.gather)} />
          <span data-door="seam" {...stylex.props(s.seam)} />
        </div>
        <div {...stylex.props(s.centre)}>
          <h1 data-resolve="title" {...stylex.props(nameSetting.name)}>
            {entranceWords.title}
          </h1>
          <p data-resolve="line" {...stylex.props(s.line)}>
            {entranceWords.line}
          </p>
          <div {...stylex.props(s.ways)}>
            {first && (
              <span data-resolve="enter" data-brand-enter="">
                <Button variant="default" size="lg" asChild>
                  <a
                    href={roomHref(first.id)}
                    onClick={enter}
                    onPointerEnter={() => {
                      prefetch(roomHref(first.id));
                    }}
                    onFocus={() => {
                      prefetch(roomHref(first.id));
                    }}
                  >
                    {entranceWords.enter}
                  </a>
                </Button>
              </span>
            )}
            <span data-resolve="download" data-brand-download="">
              <Button variant="ghost" size="sm" asChild>
                <a
                  href={entranceWords.bookHref}
                  download={entranceWords.bookFile}
                >
                  <Icon icon={DownloadIcon} />
                  {entranceWords.download}
                </a>
              </Button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
