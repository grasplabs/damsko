import { Badge } from "@grasp-os/ui/components/badge";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["3"],
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.foreground,
  },
});

// A status that leads somewhere: `asChild` draws the link as the badge. It stays a link, named by
// its words, with the keyboard's ring.
export default function BadgeLink() {
  return (
    <div {...stylex.props(layout.row)}>
      <span>Release 4.2</span>
      <Badge asChild variant="info">
        <a href="#changes">What is new</a>
      </Badge>
    </div>
  );
}
