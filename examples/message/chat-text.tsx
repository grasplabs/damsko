import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { CopyButton } from "@grasp-os/ui/components/copy-button";
import {
  Message,
  MessageActions,
  MessageContent,
  MessageFooter,
  MessageResponse,
} from "@grasp-os/ui/components/message";
// An answer in Markdown, with a list, a table and a code block, under the user's question; the
// time at each message's foot. Copy copies the Markdown source as it was written.
import * as stylex from "@stylexjs/stylex";

import { layout } from "./layout";

const question =
  "Which suppliers changed their terms this quarter, and what do we need to do?";

const answer = `Three suppliers changed their terms. **Only Tailspin Logistics raised its prices**.

- Tailspin Logistics: 4% more from January.
- Northline Paper: notice goes from 30 to 60 days.
- Kestrel Cleaning: payment due in 14 days, not 30.

| Supplier | Change | From |
| :-- | :-- | --: |
| Tailspin Logistics | Price +4% | 1 Jan |
| Northline Paper | Notice 60 days | 1 Dec |
| Kestrel Cleaning | Pay in 14 days | 1 Dec |

To flag the new payment days in the books, run:

\`\`\`ts
await ledger.flag({ supplier: "kestrel", dueDays: 14 });
\`\`\`

Ask Kestrel before 1 December whether 30 days can stay.`;

export default function MessageChatText() {
  return (
    <div {...stylex.props(layout.column)}>
      <Message align="end">
        <MessageContent>
          <Bubble variant="muted" align="end">
            <BubbleContent>{question}</BubbleContent>
          </Bubble>
          <MessageFooter>
            <time>09:12</time>
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
            <time>09:12</time>
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  );
}
