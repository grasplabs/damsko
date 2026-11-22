import {
  ResizablePanelGroup,
  ResizableHandle,
  ResizablePanel,
} from "@grasp-os/ui/components/resizable";
import { colors, radius, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";

const look = stylex.create({
  frame: {
    width: 160,
    maxWidth: "100%",
    height: size.tapTarget,
    overflow: "hidden",
    borderRadius: radius.mark,
    boxShadow: size.borderStrong,
    backgroundColor: colors.card,
  },
});

// One resizable in one state. The docs draw it once per state; keyboard focus is forced from the
// handle's own CSS. UI SDK marks a handle under a pointer or while dragged with `data-hovering`
// or `data-dragging`, not a pseudo-class, so `active` sets that mark and the handle's own CSS
// draws it.
export default function ResizableState({
  active = false,
  withHandle = false,
}: {
  active?: boolean;
  withHandle?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handle = frame.current?.querySelector('[role="separator"]');
    if (active) {
      handle?.setAttribute("data-hovering", "");
    }
  }, [active]);
  return (
    <div ref={frame} {...stylex.props(look.frame)}>
      <ResizablePanelGroup aria-label="Inbox">
        <ResizablePanel defaultSize={40} minSize={20} />
        <ResizableHandle
          aria-label="Resize the folders"
          withHandle={withHandle}
        />
        <ResizablePanel />
      </ResizablePanelGroup>
    </div>
  );
}
