import { Kbd, KbdGroup } from "@grasp-os/ui/components/kbd";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const look = stylex.create({
  line: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
  },
  keys: { marginInline: space[1] },
});

export default function KbdShortcut() {
  return (
    <p {...stylex.props(look.line)}>
      Press
      <KbdGroup style={look.keys}>
        <Kbd aria-label="Command">⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      to search.
    </p>
  );
}
