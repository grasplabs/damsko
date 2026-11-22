import { Separator } from "@grasp-os/ui/components/separator";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
    height: space["6"],
  },
});

export default function SeparatorVertical() {
  return (
    <div {...stylex.props(layout.row)}>
      <span>Reports</span>
      <Separator orientation="vertical" />
      <span>Exports</span>
      <Separator orientation="vertical" />
      <span>Settings</span>
    </div>
  );
}
