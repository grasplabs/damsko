import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
} from "@grasp-os/ui/components/command";
import type { CommandItems } from "@grasp-os/ui/components/command";
import { DownloadIcon, SendIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

// Publishing works for a moment, then succeeds. Sending the summary fails, and says so.
const commands: CommandItems = [
  { value: "publish", label: "Publish the report", icon: DownloadIcon },
  {
    value: "send",
    label: "Send the summary",
    icon: SendIcon,
    errorText: "Could not send",
  },
];

const layout = stylex.create({
  command: { maxWidth: 400 },
});

export default function CommandWorking() {
  return (
    <Command
      items={commands}
      style={layout.command}
      onAction={async (value) => {
        await wait(1200);
        if (value === "send") {
          throw new Error("The mail server did not answer");
        }
      }}
    >
      <CommandInput aria-label="Search actions" placeholder="Search actions" />
      <CommandEmpty />
      <CommandList />
    </Command>
  );
}
