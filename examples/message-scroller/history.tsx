"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@grasp-os/ui/components/message-scroller";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { frame } from "./frame";
import { StandInMessage } from "./stand-in";
import type { Turn } from "./stand-in";

const page = (from: number): Turn[] =>
  Array.from({ length: 6 }, (_, n) => {
    const at = from + n;
    return {
      id: String(at),
      role: at % 2 === 0 ? "user" : "assistant",
      text:
        at % 2 === 0
          ? `Question ${at / 2 + 1}: what is due this week?`
          : `Answer ${(at + 1) / 2}: the north renewals, and the spring report draft.`,
    };
  });

const layout = stylex.create({
  column: {
    display: "grid",
    gap: space["3"],
    justifyItems: "start",
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.8)`,
  },
});

// Earlier messages load above the ones you are reading, and what you are reading stays where it
// is (`preserveScrollOnPrepend`, on by default). Scroll up a little, then load earlier messages.
export default function MessageScrollerHistory() {
  const [first, setFirst] = useState(24);
  const turns = Array.from({ length: (30 - first) / 6 }, (_, n) =>
    page(first + n * 6)
  ).flat();
  return (
    <div {...stylex.props(layout.column)}>
      <Button
        variant="outline"
        size="sm"
        disabled={first === 0}
        onClick={() => {
          setFirst(first - 6);
        }}
      >
        Load earlier messages
      </Button>
      <div {...stylex.props(frame.box)}>
        <MessageScrollerProvider>
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
    </div>
  );
}
