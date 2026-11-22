import { Button } from "@grasp-os/ui/components/button";
import { Kbd } from "@grasp-os/ui/components/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@grasp-os/ui/components/tooltip";
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts";
import { useRef, useState } from "react";

// The keys show at the end in a Kbd, written for the platform: ⌘S on a Mac, Ctrl+S elsewhere. The
// trigger names them too (aria-keyshortcuts); binding the keys is the trigger's own work: here they
// press it, through its ref.
export default function TooltipWithShortcut() {
  const keys = useShortcutHint("mod+s");
  const save = useRef<HTMLButtonElement | null>(null);
  const [saved, setSaved] = useState(false);
  useShortcut("mod+s", () => {
    save.current?.click();
  });
  return (
    <>
      <Tooltip shortcut="mod+s">
        <TooltipTrigger asChild ref={save}>
          <Button
            variant="secondary"
            onClick={() => {
              setSaved(true);
            }}
          >
            Save
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Save a version you can go back to <Kbd>{keys.text}</Kbd>
        </TooltipContent>
      </Tooltip>
      <p role="status">{saved ? "Saved a version" : ""}</p>
    </>
  );
}
