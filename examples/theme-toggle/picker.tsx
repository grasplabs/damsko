"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Card, CardDescription, CardTitle } from "@grasp-os/ui/components/card";
import { ThemeToggle } from "@grasp-os/ui/components/theme-toggle";
import type { ThemeId, ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import "../../src/styles/themes.css";
import { layout, themes } from "./layout";

// On a settings page: each mode, and each theme the product offers, as a miniature of the
// interface. The example holds both and writes them on its subtree; while a theme's tile is rested
// on, it writes that one instead (`onThemePreview`), and the chosen one again on leaving.
export default function ThemeTogglePicker() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [theme, setTheme] = useState<ThemeId>("evergreen");
  const [preview, setPreview] = useState<ThemeId>();
  return (
    <div
      data-mode={mode}
      data-theme={preview ?? theme}
      {...stylex.props(layout.scope)}
    >
      <div {...stylex.props(layout.ground, layout.wide)}>
        <ThemeToggle
          variant="picker"
          heading="Appearance"
          mode={mode}
          onModeChange={setMode}
          theme={theme}
          themes={themes}
          onThemeChange={setTheme}
          onThemePreview={setPreview}
        />
        <Card>
          <CardTitle>Spring launch</CardTitle>
          <CardDescription>Everything the team ships in March.</CardDescription>
        </Card>
        <div {...stylex.props(layout.pair)}>
          <Button variant="default">Save changes</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </div>
  );
}
