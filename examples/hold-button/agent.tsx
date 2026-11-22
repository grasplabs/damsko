import { HoldButton } from "@grasp-os/ui/components/hold-button";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture, not shown on the page: tests/hold-button.spec.ts drives it as a person and
// through the page's one agent bridge (`window.damskoAgent`), with a yes it gives or withholds
// (`window.damskoAgentYes`). A form's submit button with a hold shows that a form is sent only once
// it is held or confirmed, and the room below lets a touch scroll. What ran is written to
// `window.holdLog`.
declare global {
  interface Window {
    holdLog?: string[];
  }
}

pageAgent();

const log = (line: string) => {
  window.holdLog = [...(window.holdLog ?? []), line];
};

const layout = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: space[4],
    paddingBlockEnd: "150vh",
  },
});

export default function HoldButtonAgent() {
  return (
    <div {...stylex.props(layout.column)}>
      <HoldButton
        variant="destructive"
        onConfirm={() => {
          log("deleted");
        }}
      >
        Delete draft
      </HoldButton>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          log("submitted");
        }}
      >
        <HoldButton type="submit" variant="default">
          Send report
        </HoldButton>
      </form>
    </div>
  );
}
