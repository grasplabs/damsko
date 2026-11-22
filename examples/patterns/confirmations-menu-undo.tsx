import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import {
  CopyIcon,
  EllipsisIcon,
  Icon,
  PencilIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: space["3"],
  },
  words: { color: colors.mutedForeground, fontSize: font.textSm },
});

// A menu item that can be undone does not ask either. Move to trash happens as it is pressed, and
// a toast says so with Undo: no close button, the action at its end, gone after its time.
export default function ConfirmationsMenuUndo() {
  // Each example keeps its own queue, so its toasts stay its own.
  const [toast] = useState(() => createToaster());
  const [trashed, setTrashed] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => () => toast.dismiss(), [toast]);
  // Undo's toast closes as it is pressed: focus goes back to the menu's button, not to the page.
  const undo = () => {
    setTrashed(false);
    trigger.current?.focus();
  };
  return (
    <div {...stylex.props(layout.row)}>
      <span {...stylex.props(layout.words)}>
        {trashed ? "Supplier list is in the trash" : "Supplier list is open"}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={trigger}
            variant="ghost"
            size="icon"
            aria-label="Actions for Supplier list"
          >
            <Icon icon={EllipsisIcon} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem icon={PencilIcon}>Rename</DropdownMenuItem>
          <DropdownMenuItem icon={CopyIcon}>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            icon={TrashIcon}
            disabled={trashed}
            onSelect={() => {
              setTrashed(true);
              toast("Supplier list moved to the trash", {
                action: { label: "Undo", onAction: undo },
              });
            }}
          >
            Move to trash
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Toaster toaster={toast} />
    </div>
  );
}
