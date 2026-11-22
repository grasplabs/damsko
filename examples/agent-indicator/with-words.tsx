import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: space[2],
    margin: 0,
    color: colors.foreground,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

// Beside words that say what is working. The words are the status; the mark has no label of its
// own, so a screen reader says them once.
const AgentIndicatorWithWords = () => (
  <p role="status" {...stylex.props(layout.row)}>
    <AgentIndicator />
    Searching the web
  </p>
);

export default AgentIndicatorWithWords;
