"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMention,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@grasp-os/ui/components/prompt-input";
import type { PromptInputMentionData } from "@grasp-os/ui/components/prompt-input";

// Made-up names, for the example only.
const people: PromptInputMentionData[] = [
  { value: "amara", label: "Amara Okafor", description: "Design lead" },
  { value: "lin", label: "Lin Hayashi", description: "Operations" },
];

// A limit of 120 characters. The text starts close to it, so the count already shows; typing stops
// at the limit, and what is added past it at once (a paste, a drop, a phrase, a mention) is cut
// there, a mention whole or not at all, and that is said.
export default function PromptInputLimit() {
  return (
    <PromptInput
      maxLength={120}
      defaultValue={[
        "Summarise the supplier review for the board, in three short points, and say which risk needs a decision first.",
      ]}
      onSubmit={() => undefined}
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
      <PromptInputMention
        triggers={[{ char: "@", type: "person", items: people }]}
      />
    </PromptInput>
  );
}
