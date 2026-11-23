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
  // Too narrow for the label's words, so they are cut.
  narrow: { display: "inline-flex", maxWidth: 120 },
});

// A status that leads somewhere: `asChild` draws the link as the badge. It stays a link, named by
// its words, with the keyboard's ring. A label drawn as a link is cut as any label is, its whole text in its `title`.
export default function BadgeLink() {
  return (
    <div {...stylex.props(layout.row)}>
      <span>Release 4.2</span>
      <Badge asChild variant="info">
        <a href="#changes">What is new</a>
      </Badge>
      <span {...stylex.props(layout.narrow)}>
        <Badge asChild variant="outline">
          <a href="#team">Design systems and research</a>
        </Badge>
      </span>
    </div>
  );
}
