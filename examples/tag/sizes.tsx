import { Tag } from "@grasp-os/ui/components/tag";
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

export default function TagSizes() {
  return (
    <div {...stylex.props(layout.row)}>
      <Tag>Quarterly</Tag>
      <Tag size="sm">Quarterly</Tag>
    </div>
  );
}
