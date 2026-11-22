import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import type {
  AgentIndicatorPath,
  AgentIndicatorVariant,
} from "@grasp-os/ui/components/agent-indicator";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  cell: { display: "flex", color: colors.foreground },
});

// One mark in one state. The docs draw it in each path, each of the marks it was chosen from, and
// success. It has no hover, focus or press: it says something is working, it is not pressed.
const AgentIndicatorState = ({
  variant,
  path,
  success = false,
}: {
  variant?: AgentIndicatorVariant;
  path?: AgentIndicatorPath;
  success?: boolean;
}) => (
  <span {...stylex.props(layout.cell)}>
    <AgentIndicator
      variant={variant}
      path={path}
      success={success}
      aria-label="Working"
    />
  </span>
);

export default AgentIndicatorState;
