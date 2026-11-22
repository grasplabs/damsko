"use client";

import { ThemeToggle } from "@grasp-os/ui/components/theme-toggle";
import type { ThemeId, ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { pageAgent } from "../../site/behaviour/agent";

import "../../src/styles/themes.css";
import { layout, themes } from "./layout";

// For the Theme toggle's spec only (tests/theme-toggle.spec.ts), at /examples/theme-toggle/agent;
// not on the page. It puts UI SDK's agent bridge on the window, so the spec can read the toggle,
// choose a mode and a theme by name, and see the change land. Changes are logged to
// `window.themeLog`.
declare global {
  interface Window {
    themeLog?: string[];
  }
}

pageAgent();

const log = (line: string) => {
  window.themeLog = [...(window.themeLog ?? []), line];
};

export default function ThemeToggleAgent() {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [theme, setTheme] = useState<ThemeId>("evergreen");
  return (
    <div data-mode={mode} data-theme={theme} {...stylex.props(layout.scope)}>
      <div data-agent-board="" {...stylex.props(layout.ground)}>
        <ThemeToggle
          mode={mode}
          onModeChange={(next) => {
            log(`mode ${next}`);
            setMode(next);
          }}
          theme={theme}
          themes={themes}
          onThemeChange={(next) => {
            log(`theme ${next}`);
            setTheme(next);
          }}
        />
      </div>
    </div>
  );
}
