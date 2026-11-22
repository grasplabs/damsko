import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { Markdown } from "@grasp-os/ui/components/markdown";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

const answer = `A **ghost** bubble has no frame, so Markdown reads as the page's own words:

- lists and \`code\` keep their look,
- and it spans the whole row.`;

// Markdown in a Bubble: framed for a short message, unframed (`ghost`) for an answer.
export default function BubbleMarkdown() {
  return (
    <div {...stylex.props(layout.column)}>
      <Bubble variant="muted" align="end">
        <BubbleContent>How does Markdown look in a bubble?</BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent>
          <Markdown size="message">{answer}</Markdown>
        </BubbleContent>
      </Bubble>
    </div>
  );
}
