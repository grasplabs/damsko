import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceLine,
  TraceTitle,
} from "@grasp-os/ui/components/trace";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
  // The thoughts: quiet, inset beside a hairline down their start edge, clear of the answer below.
  thoughts: {
    display: "grid",
    gap: space["3"],
    minWidth: 0,
    marginBlockStart: space["1"],
    marginBlockEnd: space["5"],
    paddingInlineStart: space["3"],
    borderInlineStartWidth: size.hairline,
    borderInlineStartStyle: "solid",
    borderInlineStartColor: colors.border,
    color: colors.mutedForeground,
    fontSize: size.messageText,
    lineHeight: size.messageTextLine,
  },
  step: { display: "grid", gap: space["1"], minWidth: 0 },
  label: {
    margin: 0,
    color: colors.foreground,
    fontWeight: font.weightMedium,
  },
  body: { margin: 0 },
});

const steps = [
  {
    title: "Reading the question",
    body: "They want two things: how refunds flow end to end, and where they stall. I should answer the first briefly and spend most of the words on the second.",
  },
  {
    title: "Gathering what the workspace says",
    body: "The refunds playbook and last quarter's tickets agree on the main path: the customer asks in the help centre, support checks the order against the 30-day refund window, and finance pays it out in the next batch.",
  },
  {
    title: "Finding where they stall",
    body: "Most open refunds wait on finance's batch, which runs on Fridays only. A smaller group waits because the order has no payment ID, so support cannot match it.",
  },
];

// Thinking that has ended, on one quiet line that says how long it took; a press opens the thoughts.
export default function TraceReasoning() {
  return (
    <Trace style={styles.column}>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceTitle>Thought for 6 seconds</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <div {...stylex.props(styles.thoughts)}>
            {steps.map((step) => (
              <div key={step.title} {...stylex.props(styles.step)}>
                <p {...stylex.props(styles.label)}>{step.title}</p>
                <p {...stylex.props(styles.body)}>{step.body}</p>
              </div>
            ))}
          </div>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}
