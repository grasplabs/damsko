"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Terminal,
  TerminalActions,
  TerminalContent,
  TerminalCopyButton,
  TerminalHeader,
  TerminalStatus,
  TerminalTitle,
} from "@grasp-os/ui/components/terminal";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

const lines = [
  "> my-app@0.1.0 test",
  "> vitest run",
  "",
  " ✓ src/money.test.ts (6 tests) 41ms",
  " ✓ src/dates.test.ts (12 tests) 63ms",
  " ✓ src/cart.test.ts (9 tests) 212ms",
  " ✓ src/search.test.ts (14 tests) 98ms",
  " ✓ src/invoice.test.ts (8 tests) 120ms",
  " ✓ src/profile.test.ts (5 tests) 37ms",
  " ✓ src/settings.test.ts (11 tests) 74ms",
  " ✓ src/upload.test.ts (7 tests) 156ms",
  " ✓ src/export.test.ts (4 tests) 22ms",
  " ✓ src/import.test.ts (6 tests) 51ms",
  "",
  " Test Files  10 passed (10)",
  "      Tests  82 passed (82)",
];

// A command as it runs: its line runs and opens once it prints, the output follows its end until
// you scroll up, and the line is said once when the command is done. Press Next for more output.
export default function TerminalLive() {
  const [shown, setShown] = useState(0);
  const running = shown < lines.length;
  return (
    <div {...stylex.props(layout.column)}>
      <Terminal
        output={lines.slice(0, shown).join("\n")}
        isStreaming={running}
        style={layout.wide}
      >
        <TerminalHeader>
          <TerminalTitle>
            {running ? "Running pnpm test" : "Ran pnpm test"}
          </TerminalTitle>
          <TerminalStatus />
          <TerminalActions>
            <TerminalCopyButton />
          </TerminalActions>
        </TerminalHeader>
        <TerminalContent />
      </Terminal>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setShown((now) => (now >= lines.length ? 0 : now + 3));
        }}
      >
        {running ? "Next" : "Run again"}
      </Button>
    </div>
  );
}
