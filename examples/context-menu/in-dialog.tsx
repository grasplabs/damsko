"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@grasp-os/ui/components/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@grasp-os/ui/components/dialog";
import { CopyIcon, TrashIcon } from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    boxSizing: "border-box",
    padding: space[4],
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
});

// An area inside a dialog, a sheet or a popover opens its menu the same ways. A long press on a
// touch screen opens it, and lifting the finger leaves it open.
export default function ContextMenuInDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open the files</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Files</DialogTitle>
          <DialogDescription>
            Right-click or long-press a file for its actions.
          </DialogDescription>
        </DialogHeader>
        <ContextMenu>
          <ContextMenuTrigger aria-label="Q3 forecast">
            <div {...stylex.props(layout.row)}>Q3 forecast</div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem icon={CopyIcon}>Duplicate</ContextMenuItem>
            <ContextMenuItem icon={TrashIcon} variant="destructive">
              Move to trash
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </DialogContent>
    </Dialog>
  );
}
