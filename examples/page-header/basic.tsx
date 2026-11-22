"use client";

import { Button } from "@grasp-os/ui/components/button";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  header: { width: "100%", maxWidth: 720 },
});

// The page's name, one line on what it holds, and its actions at the end, the main one last.
// Share says what it did in a toast; New task would open the task form.
export default function PageHeaderBasic() {
  const [toast] = useState(() => createToaster());
  return (
    <>
      <PageHeader
        title="Spring launch"
        description="Everything the team ships in March, and who owns each part."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                toast("Link copied", {
                  description: "Anyone in the workspace can open it.",
                });
              }}
            >
              Share
            </Button>
            <Button
              onClick={() => {
                toast("New task", { description: "The task form opens here." });
              }}
            >
              New task
            </Button>
          </>
        }
        style={layout.header}
      />
      <Toaster toaster={toast} />
    </>
  );
}
