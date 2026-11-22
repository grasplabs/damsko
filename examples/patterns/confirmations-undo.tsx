import { Button } from "@grasp-os/ui/components/button";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { ArchiveIcon, Icon } from "@grasp-os/ui/lib/icons";
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

// What can be undone does not ask. It happens at once, and a toast says so with a way back.
export default function ConfirmationsUndo() {
  // Each example keeps its own queue, so its toasts stay its own.
  const [toast] = useState(() => createToaster());
  const [archived, setArchived] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => () => toast.dismiss(), [toast]);
  // Undo's toast closes as it is pressed: focus goes back to the button it undid, not to the page.
  const undo = () => {
    setArchived(false);
    button.current?.focus();
  };
  return (
    <div {...stylex.props(layout.row)}>
      <span {...stylex.props(layout.words)}>
        {archived ? "Supplier list is archived" : "Supplier list is open"}
      </span>
      <Button
        ref={button}
        variant="secondary"
        // Off once archived, and still a stop: the press that archived keeps its focus.
        disabled={archived}
        focusableWhenDisabled
        onClick={() => {
          setArchived(true);
          toast("Report archived", {
            description: "Supplier list left the list of reports.",
            action: { label: "Undo", onAction: undo },
          });
        }}
      >
        <Icon icon={ArchiveIcon} />
        Archive report
      </Button>
      <Toaster toaster={toast} />
    </div>
  );
}
