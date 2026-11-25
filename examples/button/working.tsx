import { Button } from "@grasp-os/ui/components/button";
import type { ActionStatus } from "@grasp-os/ui/hooks/use-action";

// Buttons that run work, at rest and while it works, side by side: nothing moves. Their words for
// their states lay them out with them: the tick's room beside the words at rest, and the failure's
// words when they give them. While it works, the spinner stands over the words; what `loadingText`
// says is announced, not shown.
const Pair = ({ status, label }: { status: ActionStatus; label: string }) => (
  <div role="group" aria-label={label} style={{ display: "flex", gap: 8 }}>
    <Button
      size="sm"
      variant="destructive"
      status={status}
      loadingText="Deleting"
    >
      Delete for good
    </Button>
    <Button status={status} loadingText="Connecting" errorText="Connect">
      Connect
    </Button>
  </div>
);

export default function ButtonWorking() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Pair status="idle" label="At rest" />
      <Pair status="loading" label="Working" />
    </div>
  );
}
