import { HoldButton } from "@grasp-os/ui/components/hold-button";
import { Icon, TrashIcon } from "@grasp-os/ui/lib/icons";

// A stand-in for the real request: it takes a moment, so the button shows that it is working.
const deleteDraft = () => new Promise((resolve) => setTimeout(resolve, 1200));

// Hold to delete: the fill crosses the button, then it works and says how it went. A click or a
// tap asks in a popover instead.
export default function HoldButtonBasic() {
  return (
    <HoldButton
      variant="destructive"
      onConfirm={deleteDraft}
      loadingText="Deleting"
      successText="Deleted"
      errorText="Not deleted"
    >
      <Icon icon={TrashIcon} />
      Delete draft
    </HoldButton>
  );
}
