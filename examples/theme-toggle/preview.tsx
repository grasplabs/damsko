"use client";

import { Button } from "@grasp-os/ui/components/button";
import { ThemeToggle } from "@grasp-os/ui/components/theme-toggle";
import type { ThemeId, ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import { colors, font } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import "../../src/styles/themes.css";
import { layout, themes } from "./layout";

const own = stylex.create({
  said: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

// `onThemePreview` says which theme's tile the pointer rests on or focus is on, and nothing once it
// has left. Here it is only said; a product writes it where it writes the chosen theme.
export default function ThemeTogglePreview() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [theme, setTheme] = useState<ThemeId>("evergreen");
  const [preview, setPreview] = useState<ThemeId>();
  const [pressed, setPressed] = useState(0);
  return (
    <div {...stylex.props(layout.ground, layout.wide)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setPressed(pressed + 1);
        }}
      >
        Before the picker{pressed > 0 ? `, pressed ${pressed}` : ""}
      </Button>
      <ThemeToggle
        variant="picker"
        label="Appearance"
        mode={mode}
        onModeChange={setMode}
        theme={theme}
        themes={themes}
        onThemeChange={setTheme}
        onThemePreview={setPreview}
      />
      <output {...stylex.props(own.said)}>
        {preview === undefined
          ? "Showing the chosen theme"
          : `Showing ${preview}`}
      </output>
    </div>
  );
}
