"use client";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@grasp-os/ui/components/message-scroller";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

import { frame } from "./frame";
import { StandInMessage } from "./stand-in";
import type { Turn } from "./stand-in";

const before: Turn[] = [
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
  { id: "3", role: "user", text: "And the quarter before?" },
  {
    id: "4",
    role: "assistant",
    text: "South was already the highest, at 6.1%. West was close to the average then, at 5.2%, so its rise is new this quarter.",
  },
];
const sent: Turn = {
  id: "5",
  role: "user",
  text: "Why did the north improve?",
};
const reply =
  "Mostly the guided first week. Accounts that had it churned at half the rate of those that did not. The north rolled it out first, in July, so it had the whole quarter to show.\n\nSupport tickets in the first month also fell by a third there, and the accounts that met their success manager in week one renewed more often.\n\nTwo things would confirm it: the same change in the south from October, and a look at which accounts skipped the check-in on day three.";

// The person sends a question: its row is a `scrollAnchor`, so it goes to the top, and the answer grows into the
// room under it. Nothing moves until the answer is taller than that room. It starts again after a
// pause.
export default function MessageScrollerAnswer() {
  // 0: before sending. 1: sent. From 2: the answer, two words more each step.
  const [step, setStep] = useState(0);
  const all = reply.split(" ");
  const words = Math.max(0, (step - 2) * 2);
  useEffect(() => {
    const done = words >= all.length;
    const timer = setTimeout(
      () => {
        setStep(done ? 0 : step + 1);
      },
      done ? 4000 : step < 2 ? 1500 : 140
    );
    return () => {
      clearTimeout(timer);
    };
  }, [step, words, all.length]);
  const turns: Turn[] = [
    ...before,
    ...(step >= 1 ? [sent] : []),
    ...(words > 0
      ? [
          {
            id: "6",
            role: "assistant" as const,
            text: all.slice(0, words).join(" "),
          },
        ]
      : []),
  ];
  return (
    <div data-step={step} {...stylex.props(frame.box)}>
      <MessageScrollerProvider autoScroll>
        <MessageScroller>
          <MessageScrollerViewport aria-label="Conversation with the assistant">
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
    </div>
  );
}
