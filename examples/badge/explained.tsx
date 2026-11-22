import { Badge } from "@grasp-os/ui/components/badge";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["3"],
    width: "100%",
    maxWidth: 360,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.foreground,
  },
  badge: { flexShrink: 0 },
});

// A status that needs a word on what it means: the badge explains itself in a tooltip on hover and
// on focus (Tab reaches it), said as its description. It still looks like a badge, not a button.
export default function BadgeExplained() {
  return (
    <div {...stylex.props(layout.row)}>
      <span>Contoso Finance</span>
      <Badge
        variant="warning"
        tooltip="Support can open this workspace to help you until Friday 21 November. Each visit is logged."
        style={layout.badge}
      >
        Staff access
      </Badge>
    </div>
  );
}
