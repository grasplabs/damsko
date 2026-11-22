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

export default function AvatarSizes() {
  return (
    <div {...stylex.props(layout.row)}>
      <Avatar size="xl" name="Tijn">
        <AvatarImage src="/people/avatar-4.svg" />
        <AvatarFallback />
      </Avatar>
      <Avatar size="lg" name="Lars">
        <AvatarImage src="/people/avatar-1.svg" />
        <AvatarFallback />
      </Avatar>
      <Avatar size="default" name="Bas">
        <AvatarImage src="/people/avatar-2.svg" />
        <AvatarFallback />
      </Avatar>
      <Avatar size="sm" name="Koen">
        <AvatarImage src="/people/avatar-3.svg" />
        <AvatarFallback />
      </Avatar>
      <Avatar size="xs" name="Tijn">
        <AvatarImage src="/people/avatar-4.svg" />
        <AvatarFallback />
      </Avatar>
      <Avatar size="2xs" name="Lars">
        <AvatarImage src="/people/avatar-1.svg" />
        <AvatarFallback />
      </Avatar>
    </div>
  );
}
