// The three ways a theme can change, side by side to choose from: in one frame;
// a crossfade of the whole page (View Transitions, 280ms); or a reveal, a soft circle
// growing from the switch on our ease (300ms). Both animations are at or under the product's 300ms
// limit. With reduced motion, and where a browser has no View
// Transitions, every way is one frame.
"use client";

import { Button } from "@grasp-os/ui/components/button";
import type { ThemeId, ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import type { MouseEvent } from "react";
import { flushSync } from "react-dom";

import { ThemePanel } from "./panel";

type Way = "frame" | "fade" | "reveal";
const ways: { id: Way; label: string }[] = [
  { id: "frame", label: "One frame" },
  { id: "fade", label: "Crossfade" },
  { id: "reveal", label: "Reveal" },
];

const looks: { theme: ThemeId; mode: ThemeMode }[] = [
  { theme: "evergreen", mode: "light" },
  { theme: "pine", mode: "dark" },
];

// The View Transition's own pseudo-elements live on the document, so their rules are global. The
// reveal grows a circle from the point the switch stood at, read from two custom properties.
const transitionCss = `
::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
html[data-damsko-change="fade"]::view-transition-old(root) { animation: damsko-fade-out 280ms cubic-bezier(0.22, 1, 0.36, 1) both; }
html[data-damsko-change="fade"]::view-transition-new(root) { animation: damsko-fade-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both; }
html[data-damsko-change="reveal"]::view-transition-new(root) { animation: damsko-reveal 300ms cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes damsko-fade-out { to { opacity: 0; } }
@keyframes damsko-fade-in { from { opacity: 0; } }
@keyframes damsko-reveal {
  from { clip-path: circle(0 at var(--theme-change-x) var(--theme-change-y)); }
  to { clip-path: circle(var(--theme-change-r) at var(--theme-change-x) var(--theme-change-y)); }
}
`;

const styles = stylex.create({
  page: {
    display: "grid",
    gap: space["5"],
    justifyItems: "center",
    width: "100%",
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: space["2"],
  },
  board: { width: "100%", maxWidth: 360 },
  note: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    textAlign: "center",
  },
});

/** Applies a change the chosen way: at once, or inside a View Transition. */
const change = (
  way: Way,
  apply: () => void,
  from: { x: number; y: number }
) => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  if (way === "frame" || reduced || !("startViewTransition" in document)) {
    apply();
    return;
  }
  // The circle reaches the farthest corner of the window from where it starts.
  const r = Math.hypot(
    Math.max(from.x, window.innerWidth - from.x),
    Math.max(from.y, window.innerHeight - from.y)
  );
  root.style.setProperty("--theme-change-x", `${from.x}px`);
  root.style.setProperty("--theme-change-y", `${from.y}px`);
  root.style.setProperty("--theme-change-r", `${r}px`);
  root.dataset.damskoChange = way;
  const transition = document.startViewTransition(() => {
    flushSync(apply);
  });
  void transition.finished.then(() => {
    delete root.dataset.damskoChange;
  });
};

export default function ThemeChangeWays() {
  const [way, setWay] = useState<Way>("reveal");
  const [look, setLook] = useState(0);
  const current = looks[look]!;
  const flip = (event: MouseEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    change(
      way,
      () => {
        setLook((now) => (now + 1) % looks.length);
      },
      {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
      }
    );
  };
  return (
    <div {...stylex.props(styles.page)}>
      <style>{transitionCss}</style>
      <div
        role="group"
        aria-label="Way of changing"
        {...stylex.props(styles.controls)}
      >
        {ways.map((entry) => (
          <Button
            key={entry.id}
            size="sm"
            variant={entry.id === way ? "default" : "outline"}
            aria-pressed={entry.id === way}
            onClick={() => {
              setWay(entry.id);
            }}
          >
            {entry.label}
          </Button>
        ))}
      </div>
      <Button variant="outline" onClick={flip}>
        {look === 0 ? "Switch to Pine, dark" : "Switch to Evergreen, light"}
      </Button>
      <div {...stylex.props(styles.board)}>
        <ThemePanel theme={current.theme} mode={current.mode} />
      </div>
      <p {...stylex.props(styles.note)}>
        With reduced motion every way is one frame.
      </p>
    </div>
  );
}
