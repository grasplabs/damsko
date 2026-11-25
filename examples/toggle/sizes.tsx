import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";
import {
  Icon,
  TextAlignCenterIcon,
  TextAlignEndIcon,
  TextAlignStartIcon,
} from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space[4],
    // Each control's touch target reaches the middle of the gap to the next (tapTarget).
    "--tap-room-inline": `calc(${space[4]} / 2)`,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function ToggleSizes() {
  return (
    <div {...stylex.props(layout.row)}>
      {(["xs", "sm", "default", "lg"] as const).map((size) => (
        <ToggleGroup
          key={size}
          aria-label={`Alignment, ${size}`}
          size={size}
          defaultValue={["start"]}
          deselectable={false}
        >
          <ToggleGroupItem value="start" aria-label="Align to the start">
            <Icon icon={TextAlignStartIcon} />
          </ToggleGroupItem>
          <ToggleGroupItem value="centre" aria-label="Align in the middle">
            <Icon icon={TextAlignCenterIcon} />
          </ToggleGroupItem>
          <ToggleGroupItem value="end" aria-label="Align to the end">
            <Icon icon={TextAlignEndIcon} />
          </ToggleGroupItem>
        </ToggleGroup>
      ))}
    </div>
  );
}
