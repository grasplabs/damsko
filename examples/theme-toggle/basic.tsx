"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Card, CardDescription, CardTitle } from "@grasp-os/ui/components/card";
import { ThemeToggle } from "@grasp-os/ui/components/theme-toggle";
import type { ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import "../../src/styles/themes.css";
import { layout } from "./layout";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Light, Dark or System: the example holds the mode and writes it on its subtree. Save changes
// works for a moment, then says Saved.
export default function ThemeToggleBasic() {
  const save = () => wait(700);
  const [mode, setMode] = useState<ThemeMode>("light");
  return (
    <div
      data-mode={mode}
      data-theme="evergreen"
      {...stylex.props(layout.scope)}
    >
      <div {...stylex.props(layout.ground)}>
        <div {...stylex.props(layout.row)}>
          <h3 {...stylex.props(layout.title)}>Settings</h3>
          <ThemeToggle mode={mode} onModeChange={setMode} />
        </div>
        <Card>
          <CardTitle>Spring launch</CardTitle>
          <CardDescription>Everything the team ships in March.</CardDescription>
        </Card>
        <div {...stylex.props(layout.pair)}>
          <Button
            variant="default"
            onClick={save}
            successLabel="Saved"
            errorLabel="Not saved"
          >
            Save changes
          </Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </div>
  );
}
