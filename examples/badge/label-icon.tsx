import { Badge } from "@grasp-os/ui/components/badge";
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

export default function BadgeLabelIcon() {
  return (
    <div {...stylex.props(layout.row)}>
      <Badge variant="secondary" icon={LinkIcon}>
        Shared
      </Badge>
      <Badge icon={SettingsIcon} variant="outline">
        Automated
      </Badge>
    </div>
  );
}
