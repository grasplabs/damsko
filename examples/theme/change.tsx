// The three ways a theme can change, side by side to choose from: in one frame; a crossfade of the
// whole page; or a reveal, a soft circle growing from the switch (../patterns/theme-choice.tsx). With reduced
// motion, and where a browser has no View Transitions, every way is one frame.
"use client";

import { Button } from "@grasp-os/ui/components/button";
import type { ThemeId, ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import type { MouseEvent } from "react";

import {
  changeTheme,
  middleOf,
  themeChangeCss,
} from "../patterns/theme-choice";
import type { ThemeChangeWay } from "../patterns/theme-choice";
import { ThemePanel } from "./panel";

const ways: { id: ThemeChangeWay; label: string }[] = [
  { id: "frame", label: "One frame" },
  { id: "fade", label: "Crossfade" },
  { id: "reveal", label: "Reveal" },
];

const looks: { theme: ThemeId; mode: ThemeMode }[] = [
  { theme: "evergreen", mode: "light" },
  { theme: "pine", mode: "dark" },
];

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

export default function ThemeChangeWays() {
  const [way, setWay] = useState<ThemeChangeWay>("reveal");
  const [look, setLook] = useState(0);
  const current = looks[look]!;
  const flip = (event: MouseEvent<HTMLElement>) => {
    changeTheme(
      way,
      () => {
        setLook((now) => (now + 1) % looks.length);
      },
      middleOf(event.currentTarget)
    );
  };
  return (
    <div {...stylex.props(styles.page)}>
      <style>{themeChangeCss}</style>
      <div
        role="group"
        aria-label="Way of changing"
        {...stylex.props(styles.controls)}
      >
        {ways.map((entry) => (
          <Button
            key={entry.id}
            size="sm"
            variant="ghost"
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
