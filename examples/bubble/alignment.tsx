import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// At the start of the line by default; `align="end"` for the person's own messages. In a Message,
// set `align` on the Message and on its Bubble.
export default function BubbleAlignment() {
  return (
    <div {...stylex.props(layout.column)}>
      <Bubble variant="secondary">
        <BubbleContent>
          This one stands at the start of the line, where it stands by default.
        </BubbleContent>
      </Bubble>
      <Bubble variant="muted" align="end">
        <BubbleContent>
          This one stands at the end, for the person's own messages.
        </BubbleContent>
      </Bubble>
    </div>
  );
}
