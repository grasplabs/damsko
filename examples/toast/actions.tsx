import { Button } from "@grasp-os/ui/components/button";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
    justifyContent: "center",
  },
});

export default function ToastActions() {
  // Each example keeps its own queue, so its toasts stay its own.
  const [toast] = useState(() => createToaster());
  useEffect(() => () => toast.dismiss(), [toast]);
  return (
    <div {...stylex.props(layout.row)}>
      <Button
        variant="outline"
        onClick={() =>
          toast("Report archived", {
            description: "It left the list of reports.",
            action: {
              label: "Undo",
              onAction: () => toast.success("Report restored"),
            },
          })
        }
      >
        Archive report
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning("Unsaved changes", {
            description: "Your edits to the summary are not saved yet.",
            action: {
              label: "Save now",
              onAction: () =>
                new Promise((resolve) => setTimeout(resolve, 1200)),
            },
          })
        }
      >
        Leave the editor
      </Button>
      <Toaster toaster={toast} />
    </div>
  );
}
