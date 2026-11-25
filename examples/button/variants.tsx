import { Button } from "@grasp-os/ui/components/button";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { useState } from "react";

// Stand-in for a real request: a moment's work that succeeds.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const work = () => wait(900);

// Each button does its work and says so: while it works a spinner stands over its words, then it
// says how it went. Duplicate, Edit and the guide would do something this page has not, so they say
// that. Delete can be undone, so it happens at once, with Undo in a toast.
export default function ButtonVariants() {
  const [toast] = useState(() => createToaster());
  const remove = () =>
    toast("Workspace deleted", {
      action: { label: "Undo", onAction: () => toast("Workspace restored") },
    });
  return (
    <>
      <Button variant="default" onClick={work} successText="Saved">
        Save changes
      </Button>
      <Button variant="outline" onClick={work} successText="Invited">
        Invite people
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast("A copy would be made here")}
      >
        Duplicate
      </Button>
      <Button
        variant="ghost"
        onClick={() => toast("The editor would open here")}
      >
        Edit
      </Button>
      <Button variant="destructive" onClick={remove}>
        Delete workspace
      </Button>
      <Button variant="success" onClick={work} successText="Approved">
        Approve
      </Button>
      <Button variant="link" onClick={() => toast("The guide would open here")}>
        Read the guide
      </Button>
      <Toaster toaster={toast} />
    </>
  );
}
