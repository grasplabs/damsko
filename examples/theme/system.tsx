// One part of the page in its own mode and theme: a ThemeToggle drives them, the example holds
// them in its own state and writes them on the part's element (`data-mode`, `data-theme`), as the
// stylesheet reads them. The rest of the page stays as it is.
"use client";

import { ThemeToggle } from "@grasp-os/ui/components/theme-toggle";
import type {
  Theme,
  ThemeId,
  ThemeMode,
} from "@grasp-os/ui/components/theme-toggle";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import "../../src/styles/themes.css";
import { ThemeBoard } from "./panel";

const themes: Theme[] = [
  { id: "evergreen", name: "Evergreen", line: "Ink on paper" },
  { id: "pine", name: "Pine", line: "Night in the forest" },
  { id: "paper", name: "Paper", line: "Warm and quiet" },
];

const styles = stylex.create({
  ground: {
    display: "grid",
    gap: space["4"],
    width: "100%",
    maxWidth: 520,
    minWidth: 0,
    boxSizing: "border-box",
    padding: space["5"],
    backgroundColor: colors.background,
    color: colors.bodyForeground,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
  },
});

export default function ThemeSystem() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [theme, setTheme] = useState<ThemeId>("pine");
  return (
    <div data-mode={mode} data-theme={theme} {...stylex.props(styles.ground)}>
      <ThemeToggle
        variant="picker"
        label="Appearance"
        mode={mode}
        onModeChange={setMode}
        theme={theme}
        themes={themes}
        onThemeChange={setTheme}
      />
      <ThemeBoard />
    </div>
  );
}
