import { Tag } from "@grasp-os/ui/components/tag";
import { LinkIcon, SettingsIcon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
    justifyContent: "center",
  },
});

export default function TagIcon() {
  return (
    <div {...stylex.props(layout.row)}>
      <Tag icon={LinkIcon}>Shared</Tag>
      <Tag icon={SettingsIcon} variant="outline">
        Automated
      </Tag>
    </div>
  );
}
