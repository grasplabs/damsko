import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@grasp-os/ui/components/context-menu";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture: not shown on the page, used by tests/context-menu.spec.ts. An agent bridge
// over one context menu, so the spec can prove an agent runs an action by its words, and hears a
// failed one fail with the words the person sees.
pageAgent();

export default function ContextMenuAgent() {
  return (
    <ContextMenu>
      <ContextMenuTrigger aria-label="Q3 forecast">
        <div style={{ padding: 16 }}>Q3 forecast</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onSelect={() => {
            document.body.dataset.ran = "duplicate";
          }}
        >
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={async () => {
            document.body.dataset.ran = "share";
            await Promise.resolve();
            throw new Error("no");
          }}
          errorLabel="Could not share"
        >
          Share with the team
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
