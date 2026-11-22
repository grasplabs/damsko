import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture: not shown on the page, used by tests/dropdown-menu.spec.ts. It puts UI SDK's
// agent bridge on the window, with a yes the spec can give or withhold. Moving to the trash needs
// the person's yes; publishing always fails, so the spec can see the failure reach the agent with
// its words. Each item that runs leaves its name in `data-ran` on the body.
declare global {
  interface Window {
    menuLog?: string[];
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const log = (line: string) => {
  window.menuLog = [...(window.menuLog ?? []), line];
};

pageAgent();

export default function DropdownMenuAgent() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Report</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onSelect={() => {
            log("duplicated");
          }}
        >
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={async () => {
            await wait(300);
            throw new Error("The report could not be reached.");
          }}
          errorLabel="Could not publish"
        >
          Publish
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled
          onSelect={() => {
            log("exported");
          }}
        >
          Export
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={async () => {
            await wait(300);
            log("trashed");
          }}
          errorLabel="Could not move it"
        >
          Move to trash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
