"use client";

import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { CopyButton } from "@grasp-os/ui/components/copy-button";
import {
  Message,
  MessageActions,
  MessageContent,
  MessageError,
  MessageResponse,
} from "@grasp-os/ui/components/message";
import type { MessageStatus } from "@grasp-os/ui/components/message";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

const answer =
  "Your next one-to-one is on Thursday at 10:00, with the agenda you shared last week.";

// Try again writes the answer again in place; the focus stays in the message, and Answer ready is
// said once when it is written.
export default function MessageFailed() {
  const [status, setStatus] = useState<MessageStatus>("error");
  const retry = () => {
    setStatus("streaming");
    setTimeout(() => {
      setStatus("done");
    }, 1200);
  };
  return (
    <div {...stylex.props(layout.column)}>
      <Message align="end">
        <MessageContent>
          <Bubble variant="muted" align="end">
            <BubbleContent>When is my next one-to-one?</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message status={status}>
        <MessageContent>
          {status === "error" ? (
            <MessageError onRetry={retry}>
              Could not answer. The calendar did not respond.
            </MessageError>
          ) : (
            <>
              <MessageResponse>
                {status === "done" ? answer : ""}
              </MessageResponse>
              <MessageActions>
                <CopyButton value={answer} />
              </MessageActions>
            </>
          )}
        </MessageContent>
      </Message>
    </div>
  );
}
