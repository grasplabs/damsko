"use client";

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import { Suggestion, Suggestions } from "@grasp-os/ui/components/suggestion";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: {
    display: "grid",
    gap: space["2"],
    width: "100%",
    maxWidth: size.promptInputWidth,
  },
  sent: {
    margin: 0,
    marginBlockStart: space["2"],
    color: colors.mutedForeground,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    overflowWrap: "anywhere",
  },
});

const suggestions = [
  "Summarise the meeting notes",
  "Draft the weekly update",
  "List what is overdue",
  "Plan the next sprint",
  "Find the latest budget",
];

// The row above the prompt input: a suggestion is the message, sent as it is, without typing.
export default function SuggestionPrompt() {
  const [sent, setSent] = useState("");
  return (
    <div {...stylex.props(layout.column)}>
      <Suggestions>
        {suggestions.map((suggestion) => (
          <Suggestion
            key={suggestion}
            suggestion={suggestion}
            onClick={setSent}
          />
        ))}
      </Suggestions>
      <PromptInput
        aria-label="Message the assistant"
        onSubmit={({ text }) => {
          setSent(text);
        }}
      >
        <PromptInputBody>
          <PromptInputTextarea
            aria-label="Message"
            placeholder="Ask the assistant"
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          </PromptInputTools>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
      <p aria-live="polite" {...stylex.props(layout.sent)}>
        {sent === "" ? "Nothing sent yet" : `Sent: ${sent}`}
      </p>
    </div>
  );
}
