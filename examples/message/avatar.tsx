import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@grasp-os/ui/components/message";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// A conversation between people: each message has its writer's avatar beside it, level with the
// foot of its bubble; `align="end"` puts the person's own on the other side. Named by `aria-label`.
export default function MessageAvatarExample() {
  return (
    <div {...stylex.props(layout.column)}>
      <Message aria-label="Lars">
        <MessageAvatar>
          <Avatar name="Lars Weber" decorative>
            <AvatarFallback />
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant="secondary">
            <BubbleContent>The build failed while installing.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <Avatar name="Bas Moss" decorative>
            <AvatarFallback />
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant="muted" align="end">
            <BubbleContent>Can you share the exact error?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </div>
  );
}
