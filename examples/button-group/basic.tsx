import { Button } from "@grasp-os/ui/components/button";
import { ButtonGroup } from "@grasp-os/ui/components/button-group";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { Icon, TrashIcon } from "@grasp-os/ui/lib/icons";
import { useState } from "react";

// Actions on the same thing, side by side on one surface. One icon, so the three fit a phone.
// Each can be undone, so it happens at once, with Undo in a toast.
export default function ButtonGroupBasic() {
  const [toast] = useState(() => createToaster());
  const done = (title: string, undone: string) => () =>
    toast(title, { action: { label: "Undo", onAction: () => toast(undone) } });
  return (
    <>
      <ButtonGroup aria-label="Message actions">
        <Button variant="ghost" onClick={done("Archived", "Back in the inbox")}>
          Archive
        </Button>
        <Button
          variant="ghost"
          onClick={done("Snoozed until tomorrow", "Back in the inbox")}
        >
          Snooze
        </Button>
        <Button variant="ghost" onClick={done("Deleted", "Restored")}>
          <Icon icon={TrashIcon} />
          Delete
        </Button>
      </ButtonGroup>
      <Toaster toaster={toast} />
    </>
  );
}
