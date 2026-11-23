import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
} from "@grasp-os/ui/components/command";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture: not shown on the page, used by tests/command.spec.ts. An agent bridge over
// one command list, so the check can prove an agent finds it by name, reads the commands and
// highlights one by its words.
pageAgent();

export default function CommandAgent() {
  return (
    <div style={{ width: 360 }}>
      <Command
        items={[
          { value: "publish", label: "Publish the report" },
          {
            value: "send",
            label: "Send the summary",
            errorText: "Could not send",
          },
        ]}
        onAction={async (value) => {
          document.body.dataset.ran = value;
          if (value === "send") {
            throw new Error("no");
          }
        }}
      >
        <CommandInput aria-label="Search actions" />
        <CommandEmpty />
        <CommandList />
      </Command>
    </div>
  );
}
