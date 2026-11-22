"use client";

import { ThemeToggle } from "@grasp-os/ui/components/theme-toggle";
import type { ThemeId, ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import "../../src/styles/themes.css";
import { layout, themes } from "./layout";

const column = stylex.create({ settings: { width: "100%", maxWidth: 720 } });

// In a settings column: tileSize="default" keeps each tile at its own width, from the row's
// start, so many themes stay a row of small miniatures instead of large cards.
export default function ThemeTogglePickerMd() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [theme, setTheme] = useState<ThemeId>("evergreen");
  return (
    <div data-mode={mode} data-theme={theme} {...stylex.props(layout.scope)}>
      <div {...stylex.props(layout.ground, column.settings)}>
        <ThemeToggle
          variant="picker"
          label="Appearance"
          tileSize="default"
          mode={mode}
          onModeChange={setMode}
          theme={theme}
          themes={themes}
          onThemeChange={setTheme}
        />
      </div>
    </div>
  );
}
