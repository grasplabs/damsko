import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageGroup,
} from "@grasp-os/ui/components/message";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// Consecutive messages from one writer, stacked close: the avatar beside the last only, an empty
// MessageAvatar keeping its room beside the ones before.
export default function MessageGroupExample() {
  return (
    <div {...stylex.props(layout.column)}>
      <MessageGroup>
        <Message aria-label="Lars">
          <MessageAvatar />
          <MessageContent>
            <Bubble variant="secondary">
              <BubbleContent>I checked the delivery addresses.</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message aria-label="Lars">
          <MessageAvatar>
            <Avatar name="Lars Weber" decorative>
              <AvatarFallback />
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="secondary">
              <BubbleContent>
                Two were out of date; both are fixed now.
              </BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      </MessageGroup>
    </div>
  );
}
