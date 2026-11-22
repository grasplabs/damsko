"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputNote,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import { useState } from "react";

const offline = async () =>
  await new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("offline"));
    }, 600);
  });

// A send that fails puts the words back, says so, and Submit sends again. The failure line is the
// page's: here a note in the card while the status is `error`.
export default function PromptInputFailed() {
  const [failed, setFailed] = useState(false);
  return (
    <PromptInput
      status={failed ? "error" : "ready"}
      defaultValue={["Which invoices are still unpaid this quarter?"]}
      onSubmit={async () => {
        setFailed(false);
        try {
          await offline();
        } catch (error) {
          setFailed(true);
          throw error;
        }
      }}
    >
      <PromptInputBody>
        <PromptInputTextarea
          aria-label="Message"
          placeholder="Ask a question"
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          {failed && (
            <PromptInputNote>
              Could not send. Your message is kept.
            </PromptInputNote>
          )}
        </PromptInputTools>
        <PromptInputSubmit />
      </PromptInputFooter>
    </PromptInput>
  );
}
