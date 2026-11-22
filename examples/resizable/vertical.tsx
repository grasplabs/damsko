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

export default function ResizableVertical() {
  return (
    <div {...stylex.props(look.frame)}>
      <ResizablePanelGroup aria-label="Query" orientation="vertical">
        <ResizablePanel defaultSize={60} minSize={25}>
          <div {...stylex.props(look.pane)}>Query</div>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize the results" />
        <ResizablePanel minSize={25}>
          <div {...stylex.props(look.pane)}>Results</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
