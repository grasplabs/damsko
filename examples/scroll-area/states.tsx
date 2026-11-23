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
    width: 160,
    maxWidth: "100%",
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    backgroundColor: colors.card,
  },
  area: { height: size.tapTarget },
  list: {
    margin: 0,
    paddingBlock: space["2"],
    paddingInline: space["3"],
    listStyle: "none",
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.bodyForeground,
  },
});

const releases = [
  "Release 1.24",
  "Release 1.23",
  "Release 1.22",
  "Release 1.21",
];

// One scroll area in one state. The docs draw it once per state. Its bar shows while the pointer
// is over it or it scrolls; `shown` keeps it in view (type="always") so a still cell can show it.
// The thumb's hover and the keyboard focus are forced from its own CSS.
export default function ScrollAreaState({
  shown = false,
}: {
  shown?: boolean;
}) {
  return (
    <div {...stylex.props(look.frame)}>
      <ScrollArea
        aria-label="Releases"
        type={shown ? "always" : "hover"}
        style={look.area}
      >
        <ul {...stylex.props(look.list)}>
          {releases.map((release) => (
            <li key={release}>{release}</li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
