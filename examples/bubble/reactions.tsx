import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@grasp-os/ui/components/bubble";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// Reactions laid over a Bubble's edge, at the foot or the top, at either end. A row of emoji is one
// picture with a name that reads it once.
export default function BubbleReactionsExample() {
  return (
    <div {...stylex.props(layout.column, layout.spaced)}>
      <Bubble variant="muted" align="end">
        <BubbleContent>The draft is ready for review.</BubbleContent>
        <BubbleReactions
          align="start"
          role="img"
          aria-label="Reactions: thumbs up, eyes"
        >
          <span>👍</span>
          <span>👀</span>
        </BubbleReactions>
      </Bubble>
      <Bubble variant="secondary">
        <BubbleContent>
          I left two comments on the second page and approved the rest.
        </BubbleContent>
        <BubbleReactions role="img" aria-label="Reactions: tada, and 2 more">
          <span>🎉</span>
          <span>+2</span>
        </BubbleReactions>
      </Bubble>
      <Bubble variant="default" align="end">
        <BubbleContent>All of it is merged now.</BubbleContent>
        <BubbleReactions
          side="top"
          align="start"
          role="img"
          aria-label="Reaction: clapping hands"
        >
          <span>👏</span>
        </BubbleReactions>
      </Bubble>
    </div>
  );
}
