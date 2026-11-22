import { Button } from "@grasp-os/ui/components/button";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { ArchiveIcon, Icon } from "@grasp-os/ui/lib/icons";
import { useEffect, useState } from "react";

import { Not, Pair, Write } from "./pair";

// Press each one. The right toast says what was done and offers Undo while it can be undone; the
// wrong one cheers and gives no way back.
export default function WritingConfirmations() {
  // Each side keeps its own queue, so its toasts stay its own.
  const [right] = useState(() => createToaster());
  const [wrong] = useState(() => createToaster());
  useEffect(
    () => () => {
      right.dismiss();
      wrong.dismiss();
    },
    [right, wrong]
  );
  return (
    <Pair>
      <Write why="what was done, and a way back">
        <Button
          variant="outline"
          onClick={() => {
            right("Project archived", {
              description: "Quarterly review left the list of projects.",
              action: {
                label: "Undo",
                onAction: () => right("Project restored"),
              },
            });
          }}
        >
          <Icon icon={ArchiveIcon} />
          Archive project
        </Button>
        <Toaster toaster={right} />
      </Write>
      <Not why="cheers, and no way back">
        <Button
          variant="outline"
          onClick={() => {
            wrong.success("Success!", {
              description: "Your action was completed successfully.",
            });
          }}
        >
          <Icon icon={ArchiveIcon} />
          Archive project
        </Button>
        <Toaster toaster={wrong} />
      </Not>
    </Pair>
  );
}
