import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@grasp-os/ui/components/avatar";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: { display: "flex", alignItems: "center", gap: space[3] },
  name: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
  },
});

// A status on the avatar's corner, said in words beside it too: the badge is never the only sign.
export default function AvatarBadgeExample() {
  return (
    <div {...stylex.props(layout.row)}>
      <Avatar name="Lars" decorative>
        <AvatarImage src="/people/avatar-1.svg" />
        <AvatarFallback />
        <AvatarBadge />
      </Avatar>
      <p {...stylex.props(layout.name)}>Lars, online</p>
    </div>
  );
}
