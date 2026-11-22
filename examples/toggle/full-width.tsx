import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { display: "grid", rowGap: 16, width: "100%", maxWidth: 360 },
});

// Across the width it stands in: the items share it, each from its own words' width, and where it
// is short their words end in an ellipsis rather than run past the track.
export default function ToggleGroupFullWidth() {
  return (
    <div {...stylex.props(layout.column)}>
      <ToggleGroup
        aria-label="Effort"
        size="default"
        defaultValue={["medium"]}
        deselectable={false}
        fullWidth
      >
        <ToggleGroupItem value="low">Low</ToggleGroupItem>
        <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
        <ToggleGroupItem value="high">High</ToggleGroupItem>
        <ToggleGroupItem value="extra">Extra high</ToggleGroupItem>
        <ToggleGroupItem value="max">Max</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        aria-label="Answer length"
        size="default"
        defaultValue={["short"]}
        deselectable={false}
        fullWidth
      >
        <ToggleGroupItem value="short">A short paragraph</ToggleGroupItem>
        <ToggleGroupItem value="long">A long, detailed report</ToggleGroupItem>
        <ToggleGroupItem value="list">A list of points</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
