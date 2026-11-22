import { ScrollArea } from "@grasp-os/ui/components/scroll-area";
import {
  colors,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const look = stylex.create({
  frame: {
    width: "100%",
    maxWidth: 384,
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    backgroundColor: colors.card,
    // Edges drawn as a shadow or a fill vanish in forced colours: real ones there.
    borderWidth: { default: 0, [media.forcedColors]: 1 },
    borderStyle: "solid",
    borderColor: "currentColor",
  },
  row: {
    display: "flex",
    gap: space["3"],
    padding: space["4"],
    width: "max-content",
  },
  tile: {
    display: "grid",
    placeItems: "center",
    width: 120,
    height: 80,
    borderRadius: radius.mark,
    backgroundColor: colors.muted,
    borderWidth: { default: 0, [media.forcedColors]: 1 },
    borderStyle: "solid",
    borderColor: "currentColor",
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
];

export default function ScrollAreaHorizontal() {
  return (
    <div {...stylex.props(look.frame)}>
      <ScrollArea orientation="horizontal">
        <div {...stylex.props(look.row)}>
          {months.map((month) => (
            <div key={month} {...stylex.props(look.tile)}>
              {month}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
