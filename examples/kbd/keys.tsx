import { Kbd } from "@grasp-os/ui/components/kbd";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space[2],
    justifyContent: "center",
  },
});

export default function KbdKeys() {
  return (
    <div {...stylex.props(layout.row)}>
      <Kbd>Esc</Kbd>
      <Kbd>Shift</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd aria-label="Command">⌘</Kbd>
    </div>
  );
}
