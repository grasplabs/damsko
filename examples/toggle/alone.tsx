import { Toggle } from "@grasp-os/ui/components/toggle";
import {
  BoldIcon,
  Icon,
  ItalicIcon,
  UnderlineIcon,
} from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space[1],
    justifyContent: "center",
  },
});

export default function ToggleAlone() {
  return (
    <div {...stylex.props(layout.row)}>
      <Toggle aria-label="Bold" defaultPressed>
        <Icon icon={BoldIcon} />
      </Toggle>
      <Toggle aria-label="Italic">
        <Icon icon={ItalicIcon} />
      </Toggle>
      <Toggle aria-label="Underline">
        <Icon icon={UnderlineIcon} />
      </Toggle>
    </div>
  );
}
