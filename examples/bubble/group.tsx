import {
  Bubble,
  BubbleContent,
  BubbleGroup,
} from "@grasp-os/ui/components/bubble";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// Consecutive messages from one sender, closer together than the turns around them. Each Bubble
// takes its own `align`.
export default function BubbleGroupExample() {
  return (
    <div {...stylex.props(layout.column)}>
      <Bubble variant="secondary">
        <BubbleContent>Which report should I start from?</BubbleContent>
      </Bubble>
      <BubbleGroup>
        <Bubble variant="muted" align="end">
          <BubbleContent>The one from last quarter.</BubbleContent>
        </Bubble>
        <Bubble variant="muted" align="end">
          <BubbleContent>
            Keep its charts, but update the numbers.
          </BubbleContent>
        </Bubble>
        <Bubble variant="muted" align="end">
          <BubbleContent>And add a page for the new office.</BubbleContent>
        </Bubble>
      </BubbleGroup>
    </div>
  );
}
