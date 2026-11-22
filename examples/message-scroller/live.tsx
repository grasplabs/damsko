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
import { useEffect, useState } from "react";

import { frame } from "./frame";
import { StandInMessage } from "./stand-in";
import type { Turn } from "./stand-in";

const start: Turn[] = [
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
];
const reply =
  "Mostly the guided first week. Accounts that had it churned at half the rate of those that did not. The north rolled it out first, in July, so it had the whole quarter to show.\n\nSupport tickets in the first month also fell by a third there, and the accounts that met their success manager in week one renewed more often.\n\nTwo things would confirm it: the same change in the south from October, and a look at which accounts skipped the check-in on day three.\n\nIf both hold, the guided week is worth taking to every region before the spring renewals.";

// The assistant writes its answer a few words at a time, and the conversation follows. Scroll up
// and it stays where you are, with a way back to the latest. It starts again after a pause.
export default function MessageScrollerLive() {
  const [words, setWords] = useState(0);
  const all = reply.split(" ");
  useEffect(() => {
    const timer = setTimeout(
      () => {
        setWords(words < all.length ? words + 2 : 0);
      },
      words < all.length ? 140 : 4000
    );
    return () => {
      clearTimeout(timer);
    };
  }, [words, all.length]);
  const turns: Turn[] =
    words > 0
      ? [
          ...start,
          {
            id: "4",
            role: "assistant",
            text: all.slice(0, words).join(" "),
          },
        ]
      : start;
  return (
    <div {...stylex.props(frame.box)}>
      <MessageScrollerProvider autoScroll>
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
