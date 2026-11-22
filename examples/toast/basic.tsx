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

export default function ToastBasic() {
  // Each example keeps its own queue, so its toasts stay its own.
  const [toast] = useState(() => createToaster());
  useEffect(() => () => toast.dismiss(), [toast]);
  return (
    <div {...stylex.props(layout.row)}>
      <Button
        variant="secondary"
        onClick={() =>
          toast("Report shared", {
            description: "Everyone on the team can read it now.",
          })
        }
      >
        Share report
      </Button>
      <Toaster toaster={toast} />
    </div>
  );
}
