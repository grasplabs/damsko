import { Badge } from "@grasp-os/ui/components/badge";
import { LinkIcon } from "@grasp-os/ui/lib/icons";

// One label in one state. The docs draw it once per state: the label itself has nothing to hover
// or press, so hover and keyboard focus are forced on its remove button, from its own CSS.
export default function BadgeLabelState({
  variant = "secondary",
  size = "default",
  icon = false,
  removable = false,
}: {
  variant?: "secondary" | "outline";
  size?: "default" | "sm";
  icon?: boolean;
  removable?: boolean;
}) {
  return (
    <Badge
      variant={variant}
      size={size}
      icon={icon ? LinkIcon : undefined}
      onRemove={removable ? () => {} : undefined}
    >
      Shared
    </Badge>
  );
}
