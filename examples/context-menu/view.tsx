import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@grasp-os/ui/components/context-menu";
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
  board: {
    display: "grid",
    placeItems: "center",
    width: "100%",
    maxWidth: size.popupWidth,
    aspectRatio: "16 / 10",
    boxSizing: "border-box",
    padding: space[4],
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    // Its edge is a shadow, which forced colours drop: a real one there.
    borderWidth: { default: 0, [media.forcedColors]: 1 },
    borderStyle: "solid",
    borderColor: "currentColor",
    color: colors.mutedForeground,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    textAlign: "center",
  },
});

export default function ContextMenuView() {
  return (
    <ContextMenu>
      <ContextMenuTrigger aria-label="Launch board">
        <div {...stylex.props(layout.board)}>
          Right-click the board to change the view
        </div>
      </ContextMenuTrigger>
      {/* Settings for how a board looks: two on or off, and one choice of order. */}
      <ContextMenuContent>
        <ContextMenuCheckboxItem defaultChecked>
          Show finished tasks
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>Compact cards</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup defaultValue="due">
          <ContextMenuLabel>Sort by</ContextMenuLabel>
          <ContextMenuRadioItem value="due">Due date</ContextMenuRadioItem>
          <ContextMenuRadioItem value="priority">Priority</ContextMenuRadioItem>
          <ContextMenuRadioItem value="owner">Owner</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
