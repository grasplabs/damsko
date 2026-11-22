import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@grasp-os/ui/components/bubble";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// The person's messages at the end of the line, the other side's at the start; two in a row
// grouped close, and a reaction laid over one's edge.
export default function BubbleDemo() {
  return (
    <div {...stylex.props(layout.column)}>
      <Bubble variant="muted" align="end">
        <BubbleContent>Can you move the review to Thursday?</BubbleContent>
      </Bubble>
      <BubbleGroup>
        <Bubble variant="secondary">
          <BubbleContent>Done. It is at 10:00 on Thursday now.</BubbleContent>
        </Bubble>
        <Bubble variant="secondary">
          <BubbleContent>
            I sent the new time to everyone on the invite and kept the agenda as
            it was.
          </BubbleContent>
          <BubbleReactions role="img" aria-label="Reaction: thumbs up">
            <span>👍</span>
          </BubbleReactions>
        </Bubble>
      </BubbleGroup>
      <Bubble variant="muted" align="end">
        <BubbleContent>Thank you.</BubbleContent>
      </Bubble>
    </div>
  );
}
