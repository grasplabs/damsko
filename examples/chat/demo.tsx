"use client";

import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { Button } from "@grasp-os/ui/components/button";
import {
  Chat,
  ChatEmptyState,
  ChatMessage,
  ChatMessages,
} from "@grasp-os/ui/components/chat";
import {
  MessageContent,
  MessageResponse,
} from "@grasp-os/ui/components/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import { Icon, MessageCircleIcon, RedoIcon } from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useId, useState } from "react";

interface Turn {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const reply =
  "Here is a plan for the week. **Monday**, list what is due and who owns it. **Wednesday**, check what slipped and why. **Friday**, write down what to carry over, so next week starts from it.\n\nAsk again with your own list and I will fit it to these three days.";

const layout = stylex.create({
  frame: {
    width: "100%",
    maxWidth: size.promptInputWidth,
    height: `calc(${size.popupHeight} * 1.4)`,
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["4"],
    // The ghost button's own padding stands in for the edge's: its words line up with the field's.
    paddingBlock: space["2"],
    paddingInlineStart: space["4"],
    paddingInlineEnd: space["2"],
  },
  heading: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  field: {
    paddingInline: space["4"],
    paddingBlockEnd: space["4"],
  },
});

// The thread: a header, the turns in a MessageScroller that follows
// the reply while you stay at the end, the empty state before the first turn, and the PromptInput
// under it. Each question you send settles near the top and the answer streams in under it.
export default function ChatDemo() {
  const heading = useId();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [written, setWritten] = useState(0);
  const last = turns.at(-1);
  const all = reply.split(" ");
  const streaming = last?.role === "assistant" && written < all.length;
  useEffect(() => {
    if (!streaming) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setWritten(written + 2);
    }, 90);
    return () => {
      clearTimeout(timer);
    };
  }, [streaming, written]);
  return (
    <div {...stylex.props(layout.frame)}>
      <Chat>
        <div {...stylex.props(layout.header)}>
          <h3 id={heading} {...stylex.props(layout.heading)}>
            New thread
          </h3>
          <Button
            variant="ghost"
            size="sm"
            disabled={turns.length === 0 || streaming}
            onClick={() => {
              setTurns([]);
              setWritten(0);
            }}
          >
            <Icon icon={RedoIcon} />
            Start over
          </Button>
        </div>
        <ChatMessages aria-labelledby={heading} aria-busy={streaming}>
          {turns.length === 0 ? (
            <ChatEmptyState
              icon={MessageCircleIcon}
              title="What should we plan?"
              description="Ask anything, and the answer streams in under your question."
            />
          ) : (
            turns.map((turn) => (
              <ChatMessage
                key={turn.id}
                messageId={turn.id}
                align={turn.role === "user" ? "end" : "start"}
                status={turn === last && streaming ? "streaming" : "done"}
              >
                <MessageContent>
                  {turn.role === "user" ? (
                    <Bubble variant="muted" align="end">
                      <BubbleContent>{turn.text}</BubbleContent>
                    </Bubble>
                  ) : (
                    <MessageResponse streaming={turn === last && streaming}>
                      {turn === last
                        ? all.slice(0, written).join(" ")
                        : turn.text}
                    </MessageResponse>
                  )}
                </MessageContent>
              </ChatMessage>
            ))
          )}
        </ChatMessages>
        <div {...stylex.props(layout.field)}>
          <PromptInput
            aria-label="Message the assistant"
            compact
            status={streaming ? "streaming" : "ready"}
            onSubmit={({ text }) => {
              const at = turns.length;
              setTurns([
                ...turns,
                { id: `user-${at}`, role: "user", text },
                { id: `assistant-${at}`, role: "assistant", text: reply },
              ]);
              setWritten(0);
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea
                aria-label="Message"
                placeholder="Ask the assistant"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>{null}</PromptInputTools>
              <PromptInputSubmit />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </Chat>
    </div>
  );
}
