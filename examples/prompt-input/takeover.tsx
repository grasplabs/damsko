"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const styles = stylex.create({
  question: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
    padding: space["2"],
  },
});

// The body is a slot: a question stands in the text's place for a while. Focus goes to its first
// answer as it comes, and back to the text once it is answered. What was typed stays.
export default function PromptInputTakeover() {
  const [asking, setAsking] = useState(false);
  return (
    <PromptInput onSubmit={() => undefined}>
      <PromptInputBody>
        {asking ? (
          <div
            role="group"
            aria-label="Which report?"
            {...stylex.props(styles.question)}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAsking(false);
              }}
            >
              Sales
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAsking(false);
              }}
            >
              Finance
            </Button>
          </div>
        ) : (
          <PromptInputTextarea
            aria-label="Message"
            placeholder="Ask anything"
          />
        )}
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputButton
            tooltip="A question stands in the text's place"
            onClick={() => {
              setAsking(true);
            }}
          >
            Ask me first
          </PromptInputButton>
        </PromptInputTools>
        <PromptInputSubmit />
      </PromptInputFooter>
    </PromptInput>
  );
}
