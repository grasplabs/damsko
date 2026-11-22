import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
});

// Initials at every size: the letters keep the same share of their circle, from 64px down to 24;
// at 16px, one letter.
export default function AvatarInitials() {
  return (
    <div {...stylex.props(layout.row)}>
      <Avatar size="xl" name="Tijn Hoekstra">
        <AvatarFallback />
      </Avatar>
      <Avatar size="lg" name="Lars Weber">
        <AvatarFallback />
      </Avatar>
      <Avatar size="default" name="Bas Moss">
        <AvatarFallback />
      </Avatar>
      <Avatar size="sm" name="Koen Hale">
        <AvatarFallback />
      </Avatar>
      <Avatar size="xs" name="Mira Osei">
        <AvatarFallback />
      </Avatar>
      <Avatar size="2xs" name="Ada Lind">
        <AvatarFallback />
      </Avatar>
    </div>
  );
}
