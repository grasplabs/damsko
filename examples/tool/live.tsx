"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@grasp-os/ui/components/tool";
import type { ToolState } from "@grasp-os/ui/components/tool";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

const order: ToolState[] = [
  "input-streaming",
  "input-available",
  "output-available",
];

// A call as it runs: its input is written, the tool works, the output comes back. It is said once,
// when it finishes. Press Next to move it on.
export default function ToolLive() {
  const [at, setAt] = useState(0);
  const state = order[at] ?? "output-available";
  const done = state === "output-available";
  return (
    <div {...stylex.props(layout.column)}>
      <Tool defaultOpen>
        <ToolHeader
          name="web_search"
          title={done ? "Searched the web" : "Searching the web"}
          state={state}
        />
        <ToolContent>
          <ToolInput
            input={
              state === "input-streaming"
                ? { query: "competitor pri" }
                : { query: "competitor pricing pages" }
            }
          />
          <ToolOutput output={done ? "4 pricing pages found" : undefined} />
        </ToolContent>
      </Tool>
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setAt((now) => (now + 1) % order.length);
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
