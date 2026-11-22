import { Button } from "@grasp-os/ui/components/button";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { CircleCheckIcon } from "@grasp-os/ui/lib/icons";
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

// One toast that changes as the work goes on: shown loading, then updated by its id. The spinner
// gives way to the result. A toast can bring its own icon in `data`.
export default function ToastUpdate() {
  const [toast] = useState(() => createToaster());
  useEffect(() => () => toast.dismiss(), [toast]);
  const exportReport = () => {
    const id = toast.loading("Exporting the report");
    setTimeout(
      () =>
        toast.update(id, {
          type: "success",
          title: "Export ready",
          duration: 4000,
        }),
      1500
    );
  };
  return (
    <div {...stylex.props(layout.row)}>
      <Button variant="outline" onClick={exportReport}>
        Export report
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast("Reminder set", {
            description: "Tomorrow at 9:00.",
            data: { icon: CircleCheckIcon },
          })
        }
      >
        Set reminder
      </Button>
      <Toaster toaster={toast} />
    </div>
  );
}
