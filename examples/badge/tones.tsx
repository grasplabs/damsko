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

export default function BadgeVariants() {
  return (
    <div {...stylex.props(layout.row)}>
      <Badge>Draft</Badge>
      <Badge variant="success">Ready</Badge>
      <Badge variant="warning">Needs review</Badge>
      <Badge variant="destructive">Blocked</Badge>
      <Badge variant="info">Shared</Badge>
    </div>
  );
}
