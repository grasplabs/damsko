// A conversation a spec drives (tests/message-scroller.spec.ts): a long history, and
// `window.messageScrollerScript` to send a turn as the person, to write the assistant's answer, to
// draw older turns above the history and to swap in another conversation in the same log, so a spec
// can send while scrolled up, stream into an answer being read, read back, or open another chat.
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

declare global {
  interface Window {
    messageScrollerScript?: {
      send: () => void;
      answer: (text: string) => void;
      older: () => void;
      other: () => void;
    };
  }
}

const history: Turn[] = Array.from({ length: 40 }, (_, n) => ({
  id: String(n),
  role: n % 2 === 0 ? "user" : "assistant",
  text: `Turn ${n}: a line of words about the renewal dates.`,
}));

export default function MessageScrollerScript() {
  const [turns, setTurns] = useState(history);
  useEffect(() => {
    window.messageScrollerScript = {
      send: () => {
        const id = `sent-${Date.now()}`;
        setTurns((was) => [
          ...was,
          { id, role: "user", text: "And what changed in the north?" },
        ]);
      },
      answer: (text) => {
        setTurns((was) => {
          const last = was.at(-1);
          return last?.role === "assistant" && last.id.startsWith("answer-")
            ? [...was.slice(0, -1), { ...last, text }]
            : [...was, { id: `answer-${was.length}`, role: "assistant", text }];
        });
      },
      older: () => {
        setTurns((was) => [
          ...Array.from({ length: 5 }, (_, n): Turn => {
            const id = `older-${was.length}-${n}`;
            return { id, role: "user", text: `An older turn, ${id}.` };
          }),
          ...was,
        ]);
      },
      other: () => {
        setTurns(
          history.map((turn) => ({
            ...turn,
            id: `other-${turn.id}`,
            text: `Another chat, turn ${turn.id}.`,
          }))
        );
      },
    };
    return () => {
      delete window.messageScrollerScript;
    };
  }, []);
  return (
    <div {...stylex.props(frame.box)}>
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
