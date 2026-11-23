import {
  ResizablePanelGroup,
  ResizableHandle,
  ResizablePanel,
} from "@grasp-os/ui/components/resizable";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const look = stylex.create({
  frame: {
    width: "100%",
    maxWidth: 480,
    height: 220,
    overflow: "hidden",
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    backgroundColor: colors.card,
  },
  pane: {
    display: "grid",
    placeItems: "center",
    height: "100%",
    padding: space["4"],
    boxSizing: "border-box",
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

export default function ResizableHorizontal() {
  return (
    <div {...stylex.props(look.frame)}>
      <ResizablePanelGroup aria-label="Editor">
        <ResizablePanel defaultSize={35} minSize={20}>
          <div {...stylex.props(look.pane)}>Files</div>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize the file list" />
        <ResizablePanel>
          <div {...stylex.props(look.pane)}>Editor</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
