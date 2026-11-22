// A whole turn a spec listens to (tests/message.spec.ts): Send asks, the assistant thinks in a
// Reasoning, writes its answer in two paragraphs through Markdown, and is done, so a spec can hear
// everything the page says to a screen reader along the way.
"use client";

import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { Button } from "@grasp-os/ui/components/button";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@grasp-os/ui/components/message";
import type { MessageStatus } from "@grasp-os/ui/components/message";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@grasp-os/ui/components/message-scroller";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@grasp-os/ui/components/reasoning";
import { radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const thoughts =
  "**Reading the question**\n\nIt asks about the north only.\n\n**Checking the numbers**\n\nThe north's renewals rose.";
const answer =
  "The north changed its first week.\n\nIts renewals rose by a tenth after it did.";

// Characters a tick, and how long a tick is.
const STEP = 16;
const TICK = 60;

const layout = stylex.create({
  column: {
    display: "grid",
    gap: space["3"],
    justifyItems: "start",
    width: "100%",
    maxWidth: size.promptInputWidth,
  },
  box: {
    width: "100%",
    maxWidth: size.promptInputWidth,
    height: size.popupHeight,
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    overflow: "hidden",
  },
});

export default function MessageTurn() {
  const [asked, setAsked] = useState(false);
  const [thought, setThought] = useState(0);
  const [written, setWritten] = useState(0);
  const thinking = asked && thought < thoughts.length;
  const writing = asked && !thinking && written < answer.length;
  useEffect(() => {
    if (!(thinking || writing)) {
      return undefined;
    }
    const timer = setTimeout(() => {
      if (thinking) {
        setThought(Math.min(thought + STEP, thoughts.length));
      } else {
        setWritten(Math.min(written + STEP, answer.length));
      }
    }, TICK);
    return () => {
      clearTimeout(timer);
    };
  }, [thinking, writing, thought, written]);
  let status: MessageStatus = "done";
  if (thinking) {
    status = "thinking";
  } else if (writing) {
    status = "streaming";
  }
  return (
    <div {...stylex.props(layout.column)}>
      <div {...stylex.props(layout.box)}>
        <MessageScrollerProvider autoScroll>
          <MessageScroller>
            <MessageScrollerViewport aria-label="Conversation with the assistant">
              <MessageScrollerContent>
                {asked && (
                  <MessageScrollerItem
                    key="question"
                    messageId="question"
                    scrollAnchor
                  >
                    <Message align="end">
                      <MessageContent>
                        <Bubble variant="muted" align="end">
                          <BubbleContent>
                            What changed in the north?
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )}
                {asked && (
                  <MessageScrollerItem key="answer" messageId="answer">
                    <Message status={status}>
                      <MessageContent>
                        <Reasoning isStreaming={thinking}>
                          <ReasoningTrigger />
                          <ReasoningContent>
                            {thoughts.slice(0, thought)}
                          </ReasoningContent>
                        </Reasoning>
                        <MessageResponse>
                          {answer.slice(0, written)}
                        </MessageResponse>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
      <Button
        variant="secondary"
        size="sm"
        disabled={asked}
        onClick={() => {
          setAsked(true);
        }}
      >
        Send
      </Button>
    </div>
  );
}
