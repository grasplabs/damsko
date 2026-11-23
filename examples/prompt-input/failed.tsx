"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputNote,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@grasp-os/ui/components/prompt-input";

const offline = async () =>
  await new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("offline"));
    }, 600);
  });

// A send that fails loses nothing: the words stay where they were, the band under the card says
// so (PromptInputNote, in the catalogue's words) and Submit sends again. The band goes as the
// person types on.
export default function PromptInputFailed() {
  return (
    <PromptInput
      defaultValue={["Which invoices are still unpaid this quarter?"]}
      onSubmit={offline}
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
      <PromptInputNote />
    </PromptInput>
  );
}
