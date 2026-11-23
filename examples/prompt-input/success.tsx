"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@grasp-os/ui/components/prompt-input";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

// Success is a moment the product marks: one halo round the card, said once, and Submit as at
// rest. The button plays it again; with reduced motion the halo stands still for that moment and
// goes, with no movement.
export default function PromptInputSuccess() {
  const [done, setDone] = useState(true);
  return (
    <div {...stylex.props(layout.column)}>
      <Button
        variant="outline"
        size="sm"
        style={layout.start}
        onClick={() => {
          setDone(false);
          requestAnimationFrame(() => {
            setDone(true);
          });
        }}
      >
        Finish again
      </Button>
      <PromptInput
        aria-label="Message the assistant"
        status={done ? "success" : "ready"}
        defaultValue={["Summarise the notes from Tuesday's planning meeting"]}
        onSubmit={() => {
          setDone(false);
        }}
      >
        <PromptInputBody>
          <PromptInputTextarea
            aria-label="Message"
            placeholder="Ask a question"
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
