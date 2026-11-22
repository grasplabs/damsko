import { Toggle } from "@grasp-os/ui/components/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space[4],
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function ToggleDisabled() {
  return (
    <div {...stylex.props(layout.row)}>
      <Toggle disabled defaultPressed>
        Show archived
      </Toggle>
      <ToggleGroup aria-label="View" defaultValue={["list"]} disabled>
        <ToggleGroupItem value="list">List</ToggleGroupItem>
        <ToggleGroupItem value="board">Board</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
