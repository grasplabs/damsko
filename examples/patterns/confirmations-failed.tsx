import { HoldButton } from "@grasp-os/ui/components/hold-button";

// A stand-in for a request that fails, so the button can show what a failure looks like.
const removeMember = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  throw new Error("Jonas Weber still owns 3 projects.");
};

// When the work fails, the button that asked says so plainly, to a person and to an agent. Nothing
// looks as if it worked.
export default function ConfirmationsFailed() {
  return (
    <HoldButton
      variant="destructive"
      onConfirm={removeMember}
      loadingLabel="Removing"
      successLabel="Removed"
      errorLabel="Not removed"
    >
      Remove Jonas Weber
    </HoldButton>
  );
}
