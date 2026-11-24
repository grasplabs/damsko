import { Button } from "@grasp-os/ui/components/button";
import { Text } from "@grasp-os/ui/components/text";
import { EllipsisIcon, Icon } from "@grasp-os/ui/lib/icons";
import { colors, radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  heads: { display: "grid", gap: space[3], justifyItems: "start" },
  // A narrow panel's head: the name may shrink, More always stays in view.
  head: {
    display: "flex",
    alignItems: "center",
    gap: space[1],
    // Each control's touch target reaches the middle of the gap to the next (tapTarget).
    "--tap-room-inline": `calc(${space[1]} / 2)`,
    boxSizing: "border-box",
    paddingBlock: space[1],
    paddingInline: space[2],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: `inset 0 0 0 ${size.hairline} ${colors.border}`,
  },
  narrow: { width: 120 },
  wide: { width: 240 },
  name: { flexGrow: 1, minWidth: 0 },
});

const heads = [
  ["narrow", layout.narrow],
  ["wide", layout.wide],
] as const;

// A long name in a narrow head: on one line, cut with an ellipsis, whole in a tooltip while it is
// cut and always whole to a screen reader. In the wide head it fits, and has no tooltip.
export default function TextTruncate() {
  return (
    <div {...stylex.props(layout.heads)}>
      {heads.map(([width, look]) => (
        <div key={width} data-head={width} {...stylex.props(layout.head, look)}>
          <Text size="sm" weight="medium" truncate style={layout.name}>
            Quarterly planning
          </Text>
          <Button size="icon-sm" variant="ghost" aria-label="More actions">
            <Icon icon={EllipsisIcon} />
          </Button>
        </div>
      ))}
    </div>
  );
}
