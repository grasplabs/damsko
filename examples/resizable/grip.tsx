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
    borderRadius: radius.base,
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

export default function ResizableGrip() {
  return (
    <div {...stylex.props(look.frame)}>
      <ResizablePanelGroup aria-label="Inbox">
        <ResizablePanel defaultSize={30} minSize={20} collapsible>
          <div {...stylex.props(look.pane)}>Folders</div>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize the folders" withHandle />
        <ResizablePanel>
          <div {...stylex.props(look.pane)}>Messages</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
