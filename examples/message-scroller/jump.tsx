"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerVisibility,
} from "@grasp-os/ui/components/message-scroller";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

import { frame } from "./frame";
import { StandInMessage } from "./stand-in";
import type { Turn } from "./stand-in";

const turns: Turn[] = [
  { id: "drop", role: "user", text: "Where do new teams stop during setup?" },
  {
    id: "drop-answer",
    role: "assistant",
    text: "Most stop between creating their workspace and inviting the first teammate.\n\nCreating the workspace goes well; the invite step is where people pause, before the workspace has anything in it worth sharing.",
  },
  { id: "compare", role: "user", text: "What should we compare first?" },
  {
    id: "compare-answer",
    role: "assistant",
    text: "Three groups: teams that pick a template before inviting, teams that start blank, and teams that skip the invite and come back the next day.\n\nIf the template group invites sooner, better first steps will help more than a louder invite.",
  },
  { id: "test", role: "user", text: "Turn that into a test." },
  {
    id: "test-answer",
    role: "assistant",
    text: "Show a short checklist after the workspace is made: pick a template, add one project, then invite a teammate.\n\nMeasure the first invite, who comes back within a day, and who makes a second project.",
  },
];

const questions = turns.filter((turn) => turn.role === "user");

const layout = stylex.create({
  column: {
    display: "grid",
    gap: space["3"],
    width: "100%",
    maxWidth: `calc(${size.popupWidth} * 1.8)`,
  },
  questions: { display: "flex", flexWrap: "wrap", gap: space["2"] },
});

/** A button for each question; the one being read is pressed. */
function Outline() {
  const { scrollToMessage } = useMessageScroller();
  const { currentAnchorId } = useMessageScrollerVisibility();
  return (
    <div {...stylex.props(layout.questions)}>
      {questions.map((turn) => (
        <Button
          key={turn.id}
          variant={turn.id === currentAnchorId ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={turn.id === currentAnchorId}
          onClick={() => {
            scrollToMessage(turn.id, { behavior: "smooth" });
          }}
        >
          {turn.text}
        </Button>
      ))}
    </div>
  );
}

// Controls outside the transcript drive it: each question jumps to its turn with
// `useMessageScroller`, and `useMessageScrollerVisibility` says which turn is being read.
export default function MessageScrollerJump() {
  return (
    <MessageScrollerProvider>
      <div {...stylex.props(layout.column)}>
        <Outline />
        <div {...stylex.props(frame.box)}>
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
            <MessageScrollerButton direction="start" />
            <MessageScrollerButton />
          </MessageScroller>
        </div>
      </div>
    </MessageScrollerProvider>
  );
}
