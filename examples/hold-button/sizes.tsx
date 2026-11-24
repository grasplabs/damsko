import { HoldButton } from "@grasp-os/ui/components/hold-button";
import { Icon, TrashIcon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// The shape fixture, not shown on the page: tests/hold-button.spec.ts holds each of these and reads
// where the fill is drawn. Every size of the destructive button, and every variant at the default
// size, each named by its own words.
const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: space[4],
    // Each control's touch target reaches the middle of the gap to the next (tapTarget).
    "--tap-room-inline": `calc(${space[4]} / 2)`,
  },
});

const nothing = () => {
  // Held only for its look.
};

export default function HoldButtonSizes() {
  return (
    <div {...stylex.props(layout.row)}>
      {(["xs", "sm", "default", "lg"] as const).map((size) => (
        <HoldButton
          key={size}
          variant="destructive"
          size={size}
          onConfirm={nothing}
        >
          Delete {size}
        </HoldButton>
      ))}
      {(["icon-xs", "icon-sm", "icon", "icon-lg"] as const).map((size) => (
        <HoldButton
          key={size}
          variant="destructive"
          size={size}
          aria-label={`Delete ${size}`}
          onConfirm={nothing}
        >
          <Icon icon={TrashIcon} />
        </HoldButton>
      ))}
      {(["default", "outline", "secondary", "ghost", "link"] as const).map(
        (variant) => (
          <HoldButton key={variant} variant={variant} onConfirm={nothing}>
            Archive {variant}
          </HoldButton>
        )
      )}
    </div>
  );
}
