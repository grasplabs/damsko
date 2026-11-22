import { Badge } from "@grasp-os/ui/components/badge";
import type { BadgeSize, BadgeVariant } from "@grasp-os/ui/components/badge";
import { CheckIcon } from "@grasp-os/ui/lib/icons";

const words: Record<BadgeVariant, string> = {
  default: "Draft",
  success: "Done",
  warning: "Needs review",
  destructive: "Blocked",
  info: "New",
};

// One badge in one state. The docs draw it once per variant, size and icon. A badge has no hover,
// focus or press of its own: it states something, it is not pressed.
export default function BadgeState({
  variant = "default",
  size = "default",
  icon = false,
}: {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: boolean;
}) {
  return (
    <Badge variant={variant} size={size} icon={icon ? CheckIcon : undefined}>
      {words[variant]}
    </Badge>
  );
}
