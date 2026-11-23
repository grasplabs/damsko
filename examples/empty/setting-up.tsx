import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@grasp-os/ui/components/empty";
import { colors, radius, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  place: {
    display: "grid",
    width: "100%",
    maxWidth: 560,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
  },
});

// While the place is being set up: the Working mark in the icon's place, sized and centred as an
// icon is; with reduced motion it stands still.
export default function EmptySettingUp() {
  return (
    <div {...stylex.props(layout.place)}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <AgentIndicator />
          </EmptyMedia>
          <EmptyTitle>Setting up your workspace</EmptyTitle>
          <EmptyDescription>
            This takes a minute. Your first projects appear here when it is
            done.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
