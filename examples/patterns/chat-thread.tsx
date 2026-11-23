"use client";

import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@grasp-os/ui/components/marker";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@grasp-os/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScrollerVisibility,
} from "@grasp-os/ui/components/message-scroller";
import { Spinner } from "@grasp-os/ui/components/spinner";
import {
  colors,
  radius,
  shadow,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const layout = stylex.create({
  frame: {
    position: "relative",
    width: "100%",
    maxWidth: size.promptInputWidth,
    height: `calc(${size.popupHeight} * 1.4)`,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    overflow: "hidden",
  },
  // The line that says older messages are coming floats over the log's top edge, as the jump
  // button floats over its end: it takes no room, so nothing being read moves when it shows.
  loading: {
    position: "absolute",
    insetBlockStart: space["2"],
    insetInline: 0,
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
  },
  loadingBox: {
    paddingBlock: space["1"],
    paddingInline: space["3"],
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.sm,
  },
});

interface Row {
  id: string;
  /** The day it was sent, as the thread says it. */
  day: string;
  time: string;
  mine: boolean;
  text: string;
}

const lines = [
  "Are the north renewals in the forecast yet?",
  "Not yet: fourteen renew this month and three are at risk.",
  "Which three?",
  "Tailspin Logistics, Litware and Fabrikam Foods.",
  "Draft a note to their owners, please.",
  "Drafted. Each note names the open ticket and offers a call.",
];

// The thread as the server keeps it, oldest first, a page of six a day. The product reads a page
// at a time; here the pages are made up.
const days = ["Friday 13 November", "Monday 16 November", "Yesterday", "Today"];
const pageOf = (day: number): Row[] =>
  lines.map((text, n) => ({
    id: `${day}-${n}`,
    day: days[day] ?? "",
    time: `${String(9 + n).padStart(2, "0")}:${String(10 + day * 7).padStart(2, "0")}`,
    mine: n % 2 === 0,
    text,
  }));

// Where the person had read to: everything after it is unread.
const LAST_READ = "3-3";

/** The rows, inside the provider so it can ask which rows are in view. */
const Thread = () => {
  // The pages drawn, counted back from the latest day.
  const [pages, setPages] = useState(2);
  const first = days.length - pages;
  const rows = days.slice(first).flatMap((_, n) => pageOf(first + n));
  const oldest = rows[0]?.id ?? "";
  const { visibleMessageIds } = useMessageScrollerVisibility();
  // Older messages are fetched once the oldest row drawn comes into view, a page at a time: asked
  // for once, whatever the reader does while they come.
  const [asked, setAsked] = useState("");
  if (first > 0 && asked !== oldest && visibleMessageIds.includes(oldest)) {
    setAsked(oldest);
  }
  const loading = first > 0 && asked === oldest;
  useEffect(() => {
    if (!loading) {
      return;
    }
    // The log keeps the row being read where it is as the page is drawn above it.
    const arrived = setTimeout(() => {
      setPages((now) => now + 1);
    }, 800);
    return () => {
      clearTimeout(arrived);
    };
  }, [loading]);
  return (
    <>
      {/* Over the log, not a row of it: the rows stay the messages and the lines between them,
          so the log holds the row being read in place when the page is drawn above it. */}
      {loading && (
        <div {...stylex.props(layout.loading)}>
          <div {...stylex.props(layout.loadingBox)}>
            <Marker role="status">
              <MarkerIcon>
                <Spinner />
              </MarkerIcon>
              <MarkerContent>Loading earlier messages</MarkerContent>
            </Marker>
          </div>
        </div>
      )}
      <MessageScroller>
        <MessageScrollerViewport aria-label="Conversation about the north renewals">
          {/* Every row is the content's own child with a key of its own, the lines too. */}
          <MessageScrollerContent aria-busy={loading}>
            {rows.flatMap((row, index) => [
              // A day line where the day changes, and over the first row drawn.
              row.day === rows[index - 1]?.day ? null : (
                <MessageScrollerItem key={`day ${row.day}`}>
                  <Marker variant="separator">
                    <MarkerContent>{row.day}</MarkerContent>
                  </Marker>
                </MessageScrollerItem>
              ),
              <MessageScrollerItem
                key={row.id}
                messageId={row.id}
                scrollAnchor={row.mine}
              >
                <Message align={row.mine ? "end" : "start"}>
                  <MessageContent>
                    <Bubble
                      variant={row.mine ? "muted" : "outline"}
                      align={row.mine ? "end" : "start"}
                    >
                      <BubbleContent>{row.text}</BubbleContent>
                    </Bubble>
                    <MessageFooter>
                      <time>{row.time}</time>
                    </MessageFooter>
                  </MessageContent>
                </Message>
              </MessageScrollerItem>,
              // One line under the last message read: what follows is new.
              row.id === LAST_READ ? (
                <MessageScrollerItem key="unread" messageId="unread">
                  <Marker variant="separator">
                    <MarkerContent>Unread</MarkerContent>
                  </Marker>
                </MessageScrollerItem>
              ) : null,
            ])}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </>
  );
};

// A thread with its day lines, the line where the unread messages start, and older messages that
// load as the reader nears the top, the row being read staying where it is.
export default function ChatThread() {
  return (
    <div {...stylex.props(layout.frame)}>
      <MessageScrollerProvider autoScroll>
        <Thread />
      </MessageScrollerProvider>
    </div>
  );
}
