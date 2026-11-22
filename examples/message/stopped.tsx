"use client";

import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { CopyButton } from "@grasp-os/ui/components/copy-button";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@grasp-os/ui/components/message";
import type { MessageStatus } from "@grasp-os/ui/components/message";
import { Icon, RefreshCwIcon } from "@grasp-os/ui/lib/icons";
// An answer stopped part way: its words kept as written, Stopped under them, and its actions still
// there, Copy and Write it again among them.
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

const cut =
  "Three teams have open budget requests: Design asked for two contractors, Support for a";
const whole =
  "Three teams have open budget requests: Design asked for two contractors, Support for a second shift, and Sales for a trade fair in March.";

export default function MessageStopped() {
  const [status, setStatus] = useState<MessageStatus>("stopped");
  const again = () => {
    setStatus("streaming");
    setTimeout(() => {
      setStatus("done");
    }, 1200);
  };
  const text = status === "stopped" ? cut : whole;
  return (
    <div {...stylex.props(layout.column)}>
      <Message align="end">
        <MessageContent>
          <Bubble variant="muted" align="end">
            <BubbleContent>
              Which teams have open budget requests?
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message status={status}>
        <MessageContent>
          <MessageResponse>{text}</MessageResponse>
          <MessageActions>
            <CopyButton value={text} />
            <MessageAction label="Write it again" onClick={again}>
              <Icon icon={RefreshCwIcon} />
            </MessageAction>
          </MessageActions>
        </MessageContent>
      </Message>
    </div>
  );
}
