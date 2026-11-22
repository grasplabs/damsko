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

// A message about the whole page stands in the middle of the edge.
export default function ToastCenter() {
  const [toast] = useState(() => createToaster());
  useEffect(() => () => toast.dismiss(), [toast]);
  return (
    <div {...stylex.props(layout.row)}>
      <Button
        variant="secondary"
        onClick={() =>
          toast("You are offline", {
            description:
              "Your changes are kept on this device and sent when you are back online.",
          })
        }
      >
        Go offline
      </Button>
      <Toaster toaster={toast} position="top-center" />
    </div>
  );
}
