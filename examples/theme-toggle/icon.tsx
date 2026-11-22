"use client";

import { ThemeToggle } from "@grasp-os/ui/components/theme-toggle";
import type { ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import "../../src/styles/themes.css";
import { layout } from "./layout";

// Where there is no room: one button that cycles Light, Dark, System, at its two sizes.
export default function ThemeToggleIcon() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  return (
    <div
      data-mode={mode}
      data-theme="evergreen"
      {...stylex.props(layout.scope)}
    >
      <div {...stylex.props(layout.ground)}>
        <div {...stylex.props(layout.row)}>
          <h3 {...stylex.props(layout.title)}>Inbox</h3>
          <div {...stylex.props(layout.pair)}>
            <ThemeToggle variant="icon" mode={mode} onModeChange={setMode} />
            <ThemeToggle
              variant="icon"
              size="sm"
              mode={mode}
              onModeChange={setMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
