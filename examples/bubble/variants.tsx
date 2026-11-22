import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// Every look, from the strongest fill to no frame at all. `muted` is the person's message in a
// chat; `ghost` is words across the row, such as an answer.
export default function BubbleVariants() {
  return (
    <div {...stylex.props(layout.column)}>
      <Bubble>
        <BubbleContent>The default bubble, on the action fill.</BubbleContent>
      </Bubble>
      <Bubble variant="secondary" align="end">
        <BubbleContent>The secondary bubble, the quiet fill.</BubbleContent>
      </Bubble>
      <Bubble variant="muted">
        <BubbleContent>
          The muted bubble: a person's message in a chat.
        </BubbleContent>
      </Bubble>
      <Bubble variant="tinted" align="end">
        <BubbleContent>The tinted bubble, a wash of the brand.</BubbleContent>
      </Bubble>
      <Bubble variant="outline">
        <BubbleContent>
          The outline bubble, the page with an edge.
        </BubbleContent>
      </Bubble>
      <Bubble variant="destructive" align="end">
        <BubbleContent>
          The destructive bubble: this did not send.
        </BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent>
          The ghost bubble has no frame and spans the whole row, for words that
          read as the page's own, such as an assistant's answer.
        </BubbleContent>
      </Bubble>
    </div>
  );
}
