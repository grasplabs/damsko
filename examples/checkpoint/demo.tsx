"use client";

import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { Button } from "@grasp-os/ui/components/button";
import {
  Checkpoint,
  CheckpointTrigger,
} from "@grasp-os/ui/components/checkpoint";
import { Message, MessageContent } from "@grasp-os/ui/components/message";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

// A checkpoint after the assistant's turn. Restore keeps that turn and drops every message after
// it; with nothing after it, the trigger is out of use and its tooltip says why. Continue sends the
// next message again.
export default function CheckpointDemo() {
  const [restored, setRestored] = useState(false);
  return (
    <div {...stylex.props(layout.column)}>
      <Message align="end">
        <MessageContent>
          <Bubble variant="muted" align="end">
            <BubbleContent>
              Rename the button component to action.
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageContent>
          <p {...stylex.props(layout.answer)}>
            Renamed Button to Action in components/ui/button.tsx.
          </p>
        </MessageContent>
      </Message>
      <Checkpoint>
        Button renamed
        <CheckpointTrigger
          aria-label="Restore to Button renamed"
          tooltip={
            restored
              ? "Nothing after this point to drop"
              : "Drops the messages after this point"
          }
          disabled={restored}
          onClick={() => {
            setRestored(true);
          }}
        >
          Restore
        </CheckpointTrigger>
      </Checkpoint>
      {restored ? (
        <Button
          variant="secondary"
          size="sm"
          style={layout.continue}
          onClick={() => {
            setRestored(false);
          }}
        >
          Continue
        </Button>
      ) : (
        <>
          <Message align="end">
            <MessageContent>
              <Bubble variant="muted" align="end">
                <BubbleContent>Update the docs to match.</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
          <Message>
            <MessageContent>
              <p {...stylex.props(layout.answer)}>
                Updated the Button page to say Action.
              </p>
            </MessageContent>
          </Message>
        </>
      )}
    </div>
  );
}
