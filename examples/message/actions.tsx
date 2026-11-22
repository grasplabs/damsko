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
import {
  Icon,
  PencilIcon,
  RefreshCwIcon,
  ThumbsDownFilledIcon,
  ThumbsDownIcon,
  ThumbsUpFilledIcon,
  ThumbsUpIcon,
} from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

const question = "Can you make that shorter?";
const answer =
  "Here is a shorter version: the move is on track, the budget holds, and two tasks need an owner.";

// Copy first (the answer's Markdown source), then a rating, which stays pressed, and a rewrite. A
// user's message can be edited.
export default function MessageActionsExample() {
  const [rating, setRating] = useState<"good" | "poor" | null>(null);
  return (
    <div {...stylex.props(layout.column)}>
      <Message align="end">
        <MessageContent>
          <Bubble variant="muted" align="end">
            <BubbleContent>{question}</BubbleContent>
          </Bubble>
          <MessageActions>
            <CopyButton value={question} />
            <MessageAction label="Edit">
              <Icon icon={PencilIcon} />
            </MessageAction>
          </MessageActions>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent>
          <MessageResponse>{answer}</MessageResponse>
          <MessageActions>
            <CopyButton value={answer} />
            <MessageAction
              label="Good answer"
              pressed={rating === "good"}
              onClick={() => {
                setRating(rating === "good" ? null : "good");
              }}
            >
              <Icon
                icon={rating === "good" ? ThumbsUpFilledIcon : ThumbsUpIcon}
              />
            </MessageAction>
            <MessageAction
              label="Poor answer"
              pressed={rating === "poor"}
              onClick={() => {
                setRating(rating === "poor" ? null : "poor");
              }}
            >
              <Icon
                icon={rating === "poor" ? ThumbsDownFilledIcon : ThumbsDownIcon}
              />
            </MessageAction>
            <MessageAction label="Write it again">
              <Icon icon={RefreshCwIcon} />
            </MessageAction>
          </MessageActions>
        </MessageContent>
      </Message>
    </div>
  );
}
