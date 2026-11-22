import { Button } from "@grasp-os/ui/components/button";

// The archive button of action-failed, drawn standing still in its failed state: the button says
// how it went in its own words. In a product the words are a Button's errorLabel, as in action-failed.
export default function ActionFailedStill() {
  return <Button variant="secondary">Not archived</Button>;
}
