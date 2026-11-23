"use client";

import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { Button } from "@grasp-os/ui/components/button";
import { Chat, ChatMessage, ChatMessages } from "@grasp-os/ui/components/chat";
import { Marker, MarkerContent } from "@grasp-os/ui/components/marker";
import { MessageContent } from "@grasp-os/ui/components/message";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@grasp-os/ui/components/tooltip";
import { Icon, RedoIcon } from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useId, useState } from "react";

const layout = stylex.create({
  frame: {
    width: "100%",
    maxWidth: size.promptInputWidth,
    height: `calc(${size.popupHeight} * 1.25)`,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["4"],
    paddingBlock: space["3"],
    paddingInline: space["4"],
  },
  heading: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  // A one-line answer, at the size and line an answer's Markdown takes.
  answer: {
    margin: 0,
    fontSize: size.messageText,
    lineHeight: size.messageTextLine,
  },
  // The line stands a turn's distance from the answer over it and from the turn under it.
  checkpoint: {
    marginBlockStart: space["4"],
    marginBlockEnd: space["2"],
  },
  // The words and the button on one line in the middle of the hairline.
  row: {
    display: "inline-flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: space["2"],
  },
});

// A checkpoint, built from a separator Marker, a Button and a Tooltip: it closes the turn that
// changed something. Restore keeps that turn and drops every turn after it; with nothing after it,
// the button is out of use and its tooltip says why. Send again brings the next turn back.
export default function ChatCheckpoint() {
  const heading = useId();
  const [restored, setRestored] = useState(false);
  return (
    <div {...stylex.props(layout.frame)}>
      <Chat>
        <div {...stylex.props(layout.header)}>
          <h3 id={heading} {...stylex.props(layout.heading)}>
            Rename the button
          </h3>
          <Button
            variant="ghost"
            size="sm"
            disabled={!restored}
            onClick={() => {
              setRestored(false);
            }}
          >
            <Icon icon={RedoIcon} />
            Send again
          </Button>
        </div>
        <ChatMessages aria-labelledby={heading}>
          <ChatMessage messageId="rename" align="end">
            <MessageContent>
              <Bubble variant="muted" align="end">
                <BubbleContent>
                  Rename the button component to action.
                </BubbleContent>
              </Bubble>
            </MessageContent>
          </ChatMessage>
          <ChatMessage messageId="renamed">
            <MessageContent>
              <p {...stylex.props(layout.answer)}>
                Renamed Button to Action in components/ui/button.tsx.
              </p>
              <Marker variant="separator" style={layout.checkpoint}>
                <MarkerContent>
                  <span {...stylex.props(layout.row)}>
                    Button renamed
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          aria-label="Restore to Button renamed"
                          variant="outline"
                          size="xs"
                          disabled={restored}
                          // Held in the tab order while out of use, so its tooltip can say why.
                          focusableWhenDisabled={restored}
                          onClick={() => {
                            setRestored(true);
                          }}
                        >
                          Restore
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {restored
                          ? "Nothing after this point to drop"
                          : "Drops the messages after this point"}
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </MarkerContent>
              </Marker>
            </MessageContent>
          </ChatMessage>
          {!restored && (
            <ChatMessage messageId="docs" align="end">
              <MessageContent>
                <Bubble variant="muted" align="end">
                  <BubbleContent>Update the docs to match.</BubbleContent>
                </Bubble>
              </MessageContent>
            </ChatMessage>
          )}
          {!restored && (
            <ChatMessage messageId="docs-updated">
              <MessageContent>
                <p {...stylex.props(layout.answer)}>
                  Updated the Button page to say Action.
                </p>
              </MessageContent>
            </ChatMessage>
          )}
        </ChatMessages>
      </Chat>
    </div>
  );
}
