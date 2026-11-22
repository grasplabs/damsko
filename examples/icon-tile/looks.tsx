import { IconTile } from "@grasp-os/ui/components/icon-tile";
import {
  ChartColumnIcon,
  CircleUserIcon,
  WandSparklesIcon,
} from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space[6],
  },
});

// The three variants: raised with the icon in the one accent, a quiet tint, and the pane of light.
export default function IconTileLooks() {
  return (
    <div {...stylex.props(layout.row)}>
      <IconTile icon={CircleUserIcon} aria-label="Person" />
      <IconTile icon={ChartColumnIcon} variant="tint" aria-label="Report" />
      <IconTile icon={WandSparklesIcon} variant="gradient" aria-label="Agent" />
    </div>
  );
}
