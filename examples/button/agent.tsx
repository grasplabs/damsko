import { Button } from "@grasp-os/ui/components/button";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture, not shown on the page: tests/button.spec.ts drives it through the page's one
// agent bridge (`window.damskoAgent`), with a yes it gives or withholds (`window.damskoAgentYes`).
// Saving works, sending always fails, and deleting waits for the person's yes. What ran is written
// to `window.buttonLog`.
declare global {
  interface Window {
    buttonLog?: string[];
  }
}

pageAgent();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const did = (line: string) => async () => {
  await wait(300);
  window.buttonLog = [...(window.buttonLog ?? []), line];
};

export default function ButtonAgent() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Button variant="default" onClick={did("saved")} errorLabel="Not saved">
        Save changes
      </Button>
      <Button
        variant="outline"
        onClick={async () => {
          await wait(300);
          throw new Error("The invite was not sent.");
        }}
        errorLabel="Not sent"
      >
        Send invite
      </Button>
      <Button
        variant="destructive"
        onClick={did("deleted")}
        errorLabel="Not deleted"
        agentConfirm="Deletes the draft report"
      >
        Delete draft
      </Button>
      <Button variant="destructive" onClick={did("archived")}>
        Archive the plan
      </Button>
    </div>
  );
}
