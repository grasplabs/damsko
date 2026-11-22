"use client";

import { Terminal } from "@grasp-os/ui/components/terminal";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

const ESC = "\u001B";

const output = `$ pnpm test
${ESC}[32m✓${ESC}[39m src/format.test.ts ${ESC}[2m(4 tests)${ESC}[22m
${ESC}[32m✓${ESC}[39m src/parse.test.ts ${ESC}[2m(7 tests)${ESC}[22m
${ESC}[31m✗${ESC}[39m src/stream.test.ts ${ESC}[2m(3 tests | 1 failed)${ESC}[22m

${ESC}[1;31mAssertionError:${ESC}[22m expected 'hello' to be 'hello world'${ESC}[39m

Tests  ${ESC}[31m1 failed${ESC}[39m | ${ESC}[32m13 passed${ESC}[39m (14)`;

// Output in its colours, read from its ANSI escape sequences and drawn as text. Copy copies the
// words without them; Clear empties it.
export default function TerminalColours() {
  const [log, setLog] = useState(output);
  return (
    <div {...stylex.props(layout.column)}>
      <Terminal
        output={log}
        onClear={() => {
          setLog("");
        }}
        defaultOpen
        style={layout.wide}
      />
    </div>
  );
}
