"use client";

import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { CopyButton } from "@grasp-os/ui/components/copy-button";
import {
  Message,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@grasp-os/ui/components/message";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

import { layout } from "./layout";

const answer =
  "The team agreed to move the launch to the second week of June, to keep the budget as it is, and to ask the supplier for a new delivery date by Friday.";

// The answer arrives a few words at a time, then starts over, so the stream can be seen. Between
// chunks the words come in one at a time, each fading in; with reduced motion, as they arrive.
export default function MessageStreaming() {
  const words = answer.split(" ");
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((now) => (now >= words.length + 6 ? 0 : now + 3));
    }, 400);
    return () => {
      clearInterval(timer);
    };
  }, [words.length]);
  const done = count >= words.length;
  const shown = done ? answer : words.slice(0, count).join(" ");
  return (
    <div {...stylex.props(layout.column)}>
      <Message align="end">
        <MessageContent>
          <Bubble variant="muted" align="end">
            <BubbleContent>
              What did we decide in Tuesday's planning meeting?
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message status={done ? "done" : "streaming"}>
        <MessageContent>
          <MessageResponse>{shown}</MessageResponse>
          <MessageActions>
            <CopyButton value={answer} />
          </MessageActions>
        </MessageContent>
      </Message>
    </div>
  );
}
