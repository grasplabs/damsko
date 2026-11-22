import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@grasp-os/ui/components/message";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

// Who wrote it above the bubble (MessageHeader), and whether it was read below it (MessageFooter),
// at the message's own end of the line.
export default function MessageHeaderFooter() {
  return (
    <div {...stylex.props(layout.column)}>
      <Message aria-label="Lars">
        <MessageContent>
          <MessageHeader>Lars</MessageHeader>
          <Bubble variant="secondary">
            <BubbleContent>I already checked the logs.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble variant="muted" align="end">
            <BubbleContent>Send the report to the team, then.</BubbleContent>
          </Bubble>
          <MessageFooter>
            <span>Read yesterday</span>
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  );
}
