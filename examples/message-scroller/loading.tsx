"use client";

import { Button } from "@grasp-os/ui/components/button";
import { MessageSkeleton } from "@grasp-os/ui/components/message";
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
import { useEffect, useState } from "react";

import { frame } from "./frame";
import { StandInMessage } from "./stand-in";
import type { Turn } from "./stand-in";

const turns: Turn[] = Array.from({ length: 8 }, (_, n) => ({
  id: String(n),
  role: n % 2 === 0 ? "user" : "assistant",
  text:
    n % 2 === 0
      ? "Go on."
      : `Here is part ${Math.ceil(n / 2)} of the summary, with the numbers for each region.`,
}));

// Three pairs of placeholders, the person's turn and the assistant's, while it loads: how many
// lines of words each stands for.
const placeholders = [
  { key: "first", user: 1, assistant: 3 },
  { key: "second", user: 2, assistant: 2 },
  { key: "third", user: 1, assistant: 4 },
] as const;

const layout = stylex.create({
  column: {
    display: "grid",
    gap: space["3"],
    justifyItems: "start",
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.8)`,
  },
  pair: { display: "grid", gap: space["4"] },
});

// An old chat opening: the shape of its turns while it loads (MessageSkeleton: the person's empty
// bubble, the assistant's lines of words), then the turns where the shapes
// stood, at the latest. It loads again from the button.
export default function MessageScrollerLoading() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!loading) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => {
      clearTimeout(timer);
    };
  }, [loading]);
  return (
    <div {...stylex.props(layout.column)}>
      <div {...stylex.props(frame.box)}>
        <MessageScrollerProvider autoScroll loading={loading}>
          <MessageScroller>
            <MessageScrollerViewport aria-label="Conversation with the assistant">
              <MessageScrollerContent>
                {loading
                  ? placeholders.map((pair) => (
                      <MessageScrollerItem key={pair.key}>
                        <div {...stylex.props(layout.pair)}>
                          <MessageSkeleton align="end" lines={pair.user} />
                          <MessageSkeleton lines={pair.assistant} />
                        </div>
                      </MessageScrollerItem>
                    ))
                  : turns.map((turn) => (
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
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => {
          setLoading(true);
        }}
      >
        Load it again
      </Button>
    </div>
  );
}
