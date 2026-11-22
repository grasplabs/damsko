import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@grasp-os/ui/components/reasoning";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: {
    display: "grid",
    gap: space["4"],
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.6)`,
  },
});

// Thinking, open to the thoughts as they arrive; then two that have ended, a second and longer;
// then one from history whose time was not kept.
export default function ReasoningStates() {
  return (
    <div {...stylex.props(layout.column)}>
      <Reasoning isStreaming>
        <ReasoningTrigger />
        <ReasoningContent>
          Three contracts were renewed this quarter, so those are the ones to
          read.
        </ReasoningContent>
      </Reasoning>
      <Reasoning duration={1}>
        <ReasoningTrigger />
        <ReasoningContent>A short question with one answer.</ReasoningContent>
      </Reasoning>
      <Reasoning duration={14}>
        <ReasoningTrigger />
        <ReasoningContent>
          The question is about terms, not prices alone, so payment days and
          notice periods count too.
        </ReasoningContent>
      </Reasoning>
      <Reasoning>
        <ReasoningTrigger />
        <ReasoningContent>
          The renewals are listed in the contracts folder.
        </ReasoningContent>
      </Reasoning>
    </div>
  );
}
