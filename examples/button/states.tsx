import { Button } from "@grasp-os/ui/components/button";
import type { ButtonVariant } from "@grasp-os/ui/components/button";
import { Spinner } from "@grasp-os/ui/components/spinner";

// One button in one state. The docs draw it once per state; hover, keyboard focus and pressed are
// forced from the button's own CSS. In a product a Button whose press returns a Promise shows it by itself.
export default function ButtonState({
  variant = "default",
  loading = false,
  disabled = false,
}: {
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button
      variant={variant}
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
    >
      {loading && <Spinner size="sm" />}
      Save changes
    </Button>
  );
}
