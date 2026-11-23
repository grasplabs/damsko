"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Chat,
  ChatEmptyState,
  ChatMessages,
} from "@grasp-os/ui/components/chat";
import { MessageCircleIcon } from "@grasp-os/ui/lib/icons";
import { radius, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  frame: {
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.8)`,
    height: `calc(${size.popupHeight} * 0.9)`,
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    overflow: "hidden",
  },
  starts: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
});

const starts = [
  "Summarise this week",
  "Draft the status update",
  "Plan the launch review",
];

// Before the first turn, with ways to start under the words: they keep their own width, wider than
// the words' measure.
export default function ChatEmptySuggestions() {
  return (
    <div {...stylex.props(layout.frame)}>
      <Chat>
        <ChatMessages aria-label="Conversation with the assistant">
          <ChatEmptyState
            icon={MessageCircleIcon}
            title="No messages yet"
            description="Ask anything, or start from one of these."
          >
            <div {...stylex.props(layout.starts)}>
              {starts.map((start) => (
                <Button key={start} variant="outline" size="sm">
                  {start}
                </Button>
              ))}
            </div>
          </ChatEmptyState>
        </ChatMessages>
      </Chat>
    </div>
  );
}
