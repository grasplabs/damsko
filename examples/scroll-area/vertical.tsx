import { ScrollArea } from "@grasp-os/ui/components/scroll-area";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const look = stylex.create({
  frame: {
    width: "100%",
    maxWidth: 384,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    backgroundColor: colors.card,
  },
  area: { height: 200 },
  list: {
    margin: 0,
    padding: space["4"],
    listStyle: "none",
    display: "grid",
    gap: space["3"],
  },
  item: {
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
  },
});

const tags = Array.from(
  { length: 24 },
  (_, index) => `Release 1.${24 - index}`
);

export default function ScrollAreaVertical() {
  return (
    <div {...stylex.props(look.frame)}>
      <ScrollArea style={look.area}>
        <ul {...stylex.props(look.list)}>
          {tags.map((tag) => (
            <li key={tag} {...stylex.props(look.item)}>
              {tag}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
