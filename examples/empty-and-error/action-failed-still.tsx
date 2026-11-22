import { Button } from "@grasp-os/ui/components/button";

// The archive button of action-failed, drawn standing still in its failed state. In a product the
// state comes from the press itself, as in action-failed.
export default function ActionFailedStill() {
  return (
    <Button
      variant="outline"
      status="error"
      successLabel="Archived"
      errorLabel="Not archived"
    >
      Archive project
    </Button>
  );
}
