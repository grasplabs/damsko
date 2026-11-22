import { Button } from "@grasp-os/ui/components/button";
import type { ButtonVariant } from "@grasp-os/ui/components/button";
import type { ActionStatus } from "@grasp-os/ui/hooks/use-action";

// One button in one state. The docs draw it once per state; hover, keyboard focus and pressed are
// forced from the button's own CSS. In a product a Button whose press returns a Promise shows it by itself.
export default function ButtonState({
  variant = "default",
  status = "idle",
  disabled = false,
}: {
  variant?: ButtonVariant;
  status?: ActionStatus;
  disabled?: boolean;
}) {
  return (
    <Button
      variant={variant}
      status={status}
      successLabel="Saved"
      errorLabel="Not saved"
      disabled={disabled}
    >
      Save changes
    </Button>
  );
}
