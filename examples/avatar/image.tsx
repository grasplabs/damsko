import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@grasp-os/ui/components/avatar";
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

// The picture once it loads; the initials when there is none, or when it cannot be read.
export default function AvatarPictureOrInitials() {
  return (
    <div {...stylex.props(layout.row)}>
      <Avatar name="Lars">
        <AvatarImage src="/people/avatar-1.svg" />
        <AvatarFallback />
      </Avatar>
      <Avatar name="Bas">
        <AvatarFallback />
      </Avatar>
      <Avatar name="Koen">
        <AvatarImage src="data:image/png;base64,AAAA" />
        <AvatarFallback />
      </Avatar>
    </div>
  );
}
