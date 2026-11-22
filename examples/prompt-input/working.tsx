"use client";

import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputNote,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import { Shimmer } from "@grasp-os/ui/components/shimmer";
import { useState } from "react";

// While the answer comes a soft light travels along the card's top edge, Submit is Stop, and the
// band under the card says what the assistant is doing now: the working mark and the product's
// words. Stop ends it; a send sets it working again.
export default function PromptInputWorking() {
  const [working, setWorking] = useState(true);
  return (
    <PromptInput
      aria-label="Message the assistant"
      status={working ? "streaming" : "ready"}
      onSubmit={() => {
        setWorking(true);
      }}
    >
      <PromptInputBody>
        <PromptInputTextarea
          aria-label="Message"
          placeholder="Ask a follow-up"
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
        <PromptInputSubmit
          onStop={() => {
            setWorking(false);
          }}
        />
      </PromptInputFooter>
      <PromptInputNote>
        {working && (
          <>
            <AgentIndicator />
            <Shimmer>Searching the web</Shimmer>
          </>
        )}
      </PromptInputNote>
    </PromptInput>
  );
}
