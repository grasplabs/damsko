"use client";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@grasp-os/ui/components/message-scroller";
import * as stylex from "@stylexjs/stylex";

import { frame } from "./frame";
import { StandInMessage } from "./stand-in";
import type { Turn } from "./stand-in";

const turns: Turn[] = [
  {
    id: "1",
    role: "user",
    text: "Which regions lost the most customers last quarter?",
  },
  {
    id: "2",
    role: "assistant",
    text: "South and West, at 6.4% and 6.9%. North improved the most, to 4.6%.",
  },
  { id: "3", role: "user", text: "Why did the north improve?" },
  {
    id: "4",
    role: "assistant",
    text: "Mostly the guided first week. Accounts that had it churned at half the rate of those that did not. The north rolled it out first, in July, so it had the whole quarter to show.\n\nSupport tickets in the first month also fell by a third there, and the accounts that met their success manager in week one renewed more often.\n\nTwo things would confirm it: the same change in the south from October, and a look at which accounts skipped the check-in on day three.",
  },
];

// A saved chat reopens at its last question, with the answer under it, rather than at the very
// bottom of the answer (`defaultScrollPosition="last-anchor"`).
export default function MessageScrollerOpening() {
  return (
    <div {...stylex.props(frame.box)}>
      <MessageScrollerProvider defaultScrollPosition="last-anchor">
        <MessageScroller>
          <MessageScrollerViewport aria-label="Conversation with the assistant">
            <MessageScrollerContent>
              {turns.map((turn) => (
                <MessageScrollerItem
                  key={turn.id}
                  messageId={turn.id}
                  scrollAnchor={turn.role === "user"}
                >
                  <StandInMessage turn={turn} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  );
}
