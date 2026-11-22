import { Tag } from "@grasp-os/ui/components/tag";
import { LinkIcon } from "@grasp-os/ui/lib/icons";

// One tag in one state. The docs draw it once per state: the tag itself has nothing to hover or
// press, so hover and keyboard focus are forced on its remove button, from its own CSS.
export default function TagState({
  variant = "soft",
  size = "default",
  icon = false,
  removable = false,
}: {
  variant?: "soft" | "outline";
  size?: "default" | "sm";
  icon?: boolean;
  removable?: boolean;
}) {
  return (
    <Tag
      variant={variant}
      size={size}
      icon={icon ? LinkIcon : undefined}
      onRemove={removable ? () => {} : undefined}
    >
      Shared
    </Tag>
  );
}
