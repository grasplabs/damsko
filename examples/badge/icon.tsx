import { Badge } from "@grasp-os/ui/components/badge";
import { CheckIcon, XIcon } from "@grasp-os/ui/lib/icons";
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

export default function BadgeIcon() {
  return (
    <div {...stylex.props(layout.row)}>
      <Badge variant="success" icon={CheckIcon}>
        Approved
      </Badge>
      <Badge variant="destructive" icon={XIcon}>
        Rejected
      </Badge>
    </div>
  );
}
