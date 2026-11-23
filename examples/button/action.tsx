import { Button } from "@grasp-os/ui/components/button";
import { Icon, SendIcon } from "@grasp-os/ui/lib/icons";

// Stand-ins for real requests: one that works and one that fails.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const saveChanges = () => wait(1200);
const sendInvite = async () => {
  await wait(1200);
  throw new Error("The invite was not sent.");
};

// A press whose work returns a Promise: the button shows a spinner while it works, then a tick or
// the alert for a moment, and keeps its width throughout. The second gives words for each state,
// said and shown, every one in the same place so the widest sets its width.
export default function ButtonAction() {
  return (
    <>
      <Button variant="default" onClick={saveChanges}>
        Save changes
      </Button>
      <Button
        variant="outline"
        onClick={sendInvite}
        loadingText="Sending"
        successText="Sent"
        errorText="Not sent"
      >
        <Icon icon={SendIcon} />
        Send invite
      </Button>
    </>
  );
}
