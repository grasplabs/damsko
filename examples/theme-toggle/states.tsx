"use client";

import { ThemeToggle } from "@grasp-os/ui/components/theme-toggle";
import type { ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import * as stylex from "@stylexjs/stylex";

import "../../src/styles/themes.css";
import { layout } from "./layout";

const ignore = () => {
  // A state drawn standing still: nothing changes.
};

// The toggle in one state, in the form chosen. Hover and keyboard focus are forced from its own CSS.
export default function ThemeToggleState({
  form = "segmented",
  mode = "light",
}: {
  form?: "segmented" | "icon";
  mode?: ThemeMode;
}) {
  return (
    <div
      data-mode={mode}
      data-theme="evergreen"
      {...stylex.props(layout.stand)}
    >
      <ThemeToggle variant={form} mode={mode} onModeChange={ignore} />
    </div>
  );
}
