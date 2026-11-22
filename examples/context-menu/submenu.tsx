import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@grasp-os/ui/components/context-menu";
import { MailIcon, ShareIcon, UsersIcon } from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "block",
    width: "100%",
    maxWidth: size.popupWidth,
    boxSizing: "border-box",
    padding: space[4],
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    // Its edge is a shadow, which forced colours drop: a real one there.
    borderWidth: { default: 0, [media.forcedColors]: 1 },
    borderStyle: "solid",
    borderColor: "currentColor",
    color: colors.foreground,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

// A second level for the actions that share one verb: Share opens who to share with. Open is a
// link (`asChild`), so a press, Enter or a new tab follows it.
export default function ContextMenuSubmenu() {
  return (
    <ContextMenu>
      <ContextMenuTrigger aria-label="Roadmap">
        <div {...stylex.props(layout.row)}>Roadmap</div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem asChild>
          <a href="#roadmap">Open</a>
        </ContextMenuItem>
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger icon={ShareIcon}>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem icon={UsersIcon}>With the team</ContextMenuItem>
            <ContextMenuItem icon={MailIcon}>By email</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Move to trash</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
