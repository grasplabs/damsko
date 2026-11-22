import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@grasp-os/ui/components/context-menu";
import {
  ArrowRightIcon,
  CopyIcon,
  DownloadIcon,
  LinkIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// The area is the thing itself; here, a file's row, drawn plainly.
const layout = stylex.create({
  row: {
    display: "grid",
    gap: space[1],
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
    fontFamily: font.sans,
  },
  name: {
    color: colors.foreground,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
  },
  meta: {
    color: colors.mutedForeground,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
  },
});

export default function ContextMenuFile() {
  return (
    <ContextMenu>
      <ContextMenuTrigger aria-label="Q3 forecast">
        <div {...stylex.props(layout.row)}>
          <span {...stylex.props(layout.name)}>Q3 forecast</span>
          <span {...stylex.props(layout.meta)}>
            Right-click, long-press, or focus it and press Shift+F10
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem icon={ArrowRightIcon}>Open</ContextMenuItem>
        <ContextMenuItem icon={CopyIcon}>
          Duplicate
          <ContextMenuShortcut>mod+d</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem icon={LinkIcon}>Copy link</ContextMenuItem>
        <ContextMenuItem icon={DownloadIcon} disabled>
          Export as CSV
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem icon={TrashIcon} variant="destructive">
          Move to trash
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
