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
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    backgroundColor: colors.card,
  },
  area: { height: 160 },
  body: {
    margin: 0,
    padding: space["4"],
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
  },
});

export default function ScrollAreaWords() {
  return (
    <div {...stylex.props(look.frame)}>
      <ScrollArea aria-label="Terms of use" style={look.area}>
        <p {...stylex.props(look.body)}>
          These terms apply to every workspace on the service. You keep the
          rights to what you put in it, and you give us only what we need to
          store it, show it to the people you share it with, and keep a copy
          safe. We tell you before anything in these terms changes, and you can
          close your workspace at any time. When you do, we delete what it
          holds, apart from what the law asks us to keep. Questions about these
          terms go to the address on the contact page, and we answer each one in
          writing.
        </p>
      </ScrollArea>
    </div>
  );
}
