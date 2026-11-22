import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { CopyButton } from "@grasp-os/ui/components/copy-button";
import {
  Message,
  MessageActions,
  MessageContent,
  MessageFooter,
  MessageResponse,
} from "@grasp-os/ui/components/message";
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

const answer =
  "Three invoices are still unpaid this quarter: the March office rent, the April design work and the May cleaning contract. Together they come to just over 14,000.";

export default function MessageConversation() {
  return (
    <div {...stylex.props(layout.column)}>
      <Message align="end">
        <MessageContent>
          <Bubble variant="muted" align="end">
            <BubbleContent>
              Which invoices are still unpaid this quarter?
            </BubbleContent>
          </Bubble>
          <MessageFooter>
            <time>2 min ago</time>
          </MessageFooter>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent>
          <MessageResponse>{answer}</MessageResponse>
          <MessageActions>
            <CopyButton value={answer} />
          </MessageActions>
          <MessageFooter>
            <time>2 min ago</time>
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  );
}
