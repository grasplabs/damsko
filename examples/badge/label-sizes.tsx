import { Badge } from "@grasp-os/ui/components/badge";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
    alignItems: "center",
    justifyContent: "center",
  },
});

// A label's two sizes: `default` 24px beside body text, `sm` 20px in a dense row.
export default function BadgeLabelSizes() {
  return (
    <div {...stylex.props(layout.row)}>
      <Badge variant="secondary">Quarterly</Badge>
      <Badge variant="secondary" size="sm">
        Quarterly
      </Badge>
    </div>
  );
}
