import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@grasp-os/ui/components/alert";
import type { AlertVariant } from "@grasp-os/ui/components/alert";

// One alert in one state. The docs draw it once per variant and per composition, on one line so
// each fits its cell. An alert has no hover, focus or press of its own: it is read, not used.
export default function AlertState({
  variant = "default",
  title = "Ready",
  words = null,
  icon = true,
}: {
  variant?: AlertVariant;
  title?: string | null;
  words?: string | null;
  icon?: boolean;
}) {
  return (
    <Alert variant={variant} icon={icon ? undefined : false}>
      {title !== null && <AlertTitle>{title}</AlertTitle>}
      {words !== null && <AlertDescription>{words}</AlertDescription>}
    </Alert>
  );
}
