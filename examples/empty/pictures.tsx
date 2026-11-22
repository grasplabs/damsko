import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@grasp-os/ui/components/empty";
import { colors, radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 15rem), 1fr))",
    gap: 16,
    width: "100%",
  },
  place: {
    display: "grid",
    minHeight: 200,
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
  },
  // From the top, not from the middle (the inline size has no height of its own to centre in):
  // side by side, every picture and every title stands on one line, whether a sentence takes one
  // line or two.
  top: { alignSelf: "start", marginBlock: space[8] },
});

// One small drawing per case, so the cases are told apart before a word is read. The title still
// says it: the picture is never the only sign.
export default function EmptyPictures() {
  return (
    <div {...stylex.props(layout.grid)}>
      <div {...stylex.props(layout.place)}>
        <Empty size="sm" style={layout.top}>
          <EmptyHeader>
            <EmptyMedia illustration="nothing" />
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Projects appear here once someone creates one.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
      <div {...stylex.props(layout.place)}>
        <Empty size="sm" style={layout.top}>
          <EmptyHeader>
            <EmptyMedia illustration="search" />
            <EmptyTitle>No projects match “invoices”</EmptyTitle>
            <EmptyDescription>
              Check the spelling or try a shorter word.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
      <div {...stylex.props(layout.place)}>
        <Empty size="sm" style={layout.top}>
          <EmptyHeader>
            <EmptyMedia illustration="done" />
            <EmptyTitle>No approvals waiting</EmptyTitle>
            <EmptyDescription>
              New requests appear here when an agent asks.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
      <div {...stylex.props(layout.place)}>
        <Empty size="sm" style={layout.top}>
          <EmptyHeader>
            <EmptyMedia illustration="locked" />
            <EmptyTitle>You do not have access</EmptyTitle>
            <EmptyDescription>
              Ask an owner of this project to add you.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
      <div {...stylex.props(layout.place)}>
        <Empty size="sm" style={layout.top}>
          <EmptyHeader>
            <EmptyMedia illustration="offline" />
            <EmptyTitle>You are offline</EmptyTitle>
            <EmptyDescription>
              Your changes are kept on this device and sent when you are back
              online.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
      <div {...stylex.props(layout.place)}>
        <Empty size="sm" style={layout.top} variant="destructive">
          <EmptyHeader>
            <EmptyMedia illustration="broken" />
            <EmptyTitle>The projects did not load</EmptyTitle>
            <EmptyDescription>
              Nothing is lost. Try again in a moment.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
      <div {...stylex.props(layout.place)}>
        <Empty size="sm" style={layout.top}>
          <EmptyHeader>
            <EmptyMedia illustration="lost" />
            <EmptyTitle>No page at this address</EmptyTitle>
            <EmptyDescription>
              The link may be old. Search, or start from the components.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </div>
  );
}
