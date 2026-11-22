import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@grasp-os/ui/components/reasoning";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
});

const thoughts = `**Reading the question**
They want two things: how refunds flow end to end, and where they stall. I should answer the first briefly and spend most of the words on the second.

**Gathering what the workspace says**
The refunds playbook and last quarter's tickets agree on the main path:
- the customer asks in the help centre,
- support checks the order against the \`refund_window\` of 30 days,
- finance pays it out in the next batch.

**Finding where they stall**
Most open refunds wait on finance's batch, which runs on Fridays only. A smaller group waits because the order has no \`payment_id\`, so support cannot match it.`;

// Thinking that has ended, settled into how long it took. A press opens the thoughts.
export default function ReasoningBasic() {
  return (
    <Reasoning duration={6} style={layout.column}>
      <ReasoningTrigger />
      <ReasoningContent>{thoughts}</ReasoningContent>
    </Reasoning>
  );
}
