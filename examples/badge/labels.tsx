import { Badge } from "@grasp-os/ui/components/badge";
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

// The two labels: `secondary`, the usual one, and `outline`, quieter beside chosen ones.
export default function BadgeLabels() {
  return (
    <div {...stylex.props(layout.row)}>
      <Badge variant="secondary">Design</Badge>
      <Badge variant="outline">Research</Badge>
    </div>
  );
}
