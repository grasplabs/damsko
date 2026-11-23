"use client";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@grasp-os/ui/components/message-scroller";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";

import { StandInMessage } from "./stand-in";
import type { Turn } from "./stand-in";

const turns: Turn[] = [
  {
    id: "1",
    role: "user",
    text: "Which regions lost the most customers last quarter?",
  },
  {
    id: "2",
    role: "assistant",
    text: "South and West, at 6.4% and 6.9%. North improved the most, to 4.6%.",
  },
];

const layout = stylex.create({
  frame: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.8)`,
    height: `calc(${size.popupHeight} * 0.9)`,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    overflow: "hidden",
  },
  heading: {
    margin: 0,
    paddingBlock: space["3"],
    paddingInline: space["4"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
});

// Named by the chat's own heading: `aria-labelledby` in place of `aria-label`, so the words are
// written once. Given neither, the log is named Messages.
export default function MessageScrollerNamed() {
  const heading = useId();
  return (
    <section aria-labelledby={heading} {...stylex.props(layout.frame)}>
      <h3 id={heading} {...stylex.props(layout.heading)}>
        Quarterly churn
      </h3>
      <MessageScrollerProvider autoScroll>
        <MessageScroller>
          <MessageScrollerViewport aria-labelledby={heading}>
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
    </section>
  );
}
