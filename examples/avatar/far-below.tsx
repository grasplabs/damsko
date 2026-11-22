import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@grasp-os/ui/components/avatar";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  page: { display: "grid", justifyItems: "center", gap: 16 },
  // Far enough down that a browser does not fetch what is under it until it is scrolled near: past
  // Chromium's lazy margin (1250px) below a short window.
  gap: { height: 3200 },
});

// A picture far below the window: it waits to load until it is scrolled near (loading="lazy").
export default function AvatarFarBelow() {
  return (
    <div {...stylex.props(layout.page)}>
      <Avatar name="Bas">
        <AvatarFallback />
      </Avatar>
      <div aria-hidden="true" {...stylex.props(layout.gap)} />
      <Avatar name="Lars">
        <AvatarImage src="/people/avatar-1.svg" />
        <AvatarFallback />
      </Avatar>
    </div>
  );
}
