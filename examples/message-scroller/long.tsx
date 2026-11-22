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

const topics = [
  "Can you check the renewal dates for the north accounts?",
  "Done: 14 renew this month, 3 of them are at risk.",
  "Which three?",
  "Tailspin Logistics, Litware and Fabrikam Foods. All three opened support tickets in the last week.",
  "Draft a note to their owners.",
  "Drafted. Each note names the ticket and offers a call this week.",
];

// 500 turns. Every row is drawn, and the browser skips the ones out of view.
const turns: Turn[] = Array.from({ length: 500 }, (_, n) => ({
  id: String(n),
  role: n % 2 === 0 ? "user" : "assistant",
  text: `${topics[n % topics.length] ?? ""} (${n + 1})`,
}));

// A long conversation opens at its latest turn; scroll up through all of it.
export default function MessageScrollerLong() {
  return (
    <div {...stylex.props(frame.box)}>
      <MessageScrollerProvider autoScroll>
        <MessageScroller>
          <MessageScrollerViewport aria-label="A long conversation">
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
