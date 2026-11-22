import { Text } from "@grasp-os/ui/components/text";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: space[4], width: "100%", maxWidth: 480 },
});

// A lead, body text, a control's size and the smallest there is, each with its own line height.
export default function TextSizes() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Text size="lg">
        Everything the workspace is working on, in one place.
      </Text>
      <Text size="default">
        Reports appear here once a review is closed. Anyone in the workspace can
        read them.
      </Text>
      <Text size="sm">
        Shared with the design team and two people outside it.
      </Text>
      <Text size="xs" color="muted">
        Edited 12 November by Amara Okafor
      </Text>
    </div>
  );
}
