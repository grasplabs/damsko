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

export default function ToastDismiss() {
  // Each example keeps its own queue, so its toasts stay its own.
  const [toast] = useState(() => createToaster());
  useEffect(() => () => toast.dismiss(), [toast]);
  return (
    <div {...stylex.props(layout.row)}>
      <Button
        variant="secondary"
        onClick={() =>
          toast("Report shared", {
            description: "Swipe it away, press Escape in it, or let it go.",
          })
        }
      >
        Show a toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 3000)), {
            loading: {
              title: "Exporting the report",
              description: "It stays until the export is done.",
            },
            success: "Export ready",
            error: "Could not export",
          })
        }
      >
        Persistent
      </Button>
      <Toaster toaster={toast} />
    </div>
  );
}
