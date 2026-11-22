import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@grasp-os/ui/components/tool";
import type { ToolState } from "@grasp-os/ui/components/tool";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

const states: { state: ToolState; title: string }[] = [
  { state: "input-streaming", title: "Writing the search" },
  { state: "input-available", title: "Searching the web" },
  { state: "approval-requested", title: "Send the summary" },
  { state: "approval-responded", title: "Send the summary" },
  { state: "output-available", title: "Searched the web" },
  { state: "output-error", title: "Read pricing.xlsx" },
  { state: "output-denied", title: "Delete the drafts" },
];

// Every state a call can be in, said in words beside its mark.
export default function ToolStates() {
  return (
    <div {...stylex.props(layout.column)}>
      {states.map(({ state, title }) => (
        <Tool key={state}>
          <ToolHeader name="tool" title={title} state={state} />
          <ToolContent>
            <ToolInput input={{ state }} />
            <ToolOutput
              output={state === "output-available" ? "12 results" : undefined}
              errorText={
                state === "output-error" ? "The file is locked." : undefined
              }
            />
          </ToolContent>
        </Tool>
      ))}
    </div>
  );
}
