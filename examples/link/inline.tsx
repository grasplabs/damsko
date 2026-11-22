import { Link } from "@grasp-os/ui/components/link";
import { colors, font } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const look = stylex.create({
  text: {
    maxWidth: 420,
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
  },
});

// In a sentence it takes the sentence's colour and size, and its underline finds it without colour.
export default function LinkInline() {
  return (
    <p {...stylex.props(look.text)}>
      Anyone in the workspace can open a shared report. Read the{" "}
      <Link href="#sharing">sharing guide</Link> before you invite people from
      outside it.
    </p>
  );
}
