import { Tag } from "@grasp-os/ui/components/tag";
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

export default function TagVariants() {
  return (
    <div {...stylex.props(layout.row)}>
      <Tag>Design</Tag>
      <Tag variant="outline">Research</Tag>
    </div>
  );
}
