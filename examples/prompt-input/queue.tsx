"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputQueue,
  PromptInputQueueItem,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@grasp-os/ui/components/prompt-input";
import {
  ArrowUpIcon,
  Icon,
  PencilIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import { createTokenInputController } from "@ui-sdk/react/token-input";
import { useState } from "react";

const first = [
  { id: "m1", text: "Also compare it with last year's numbers" },
  { id: "m2", text: "And say which region moved most" },
];

// Messages written while an answer is still coming wait their turn above the card, in a panel
// that folds, its foot behind the card. Each can be put back into the text to change, sent now,
// or taken off. Stop ends the work.
export default function PromptInputQueueExample() {
  const [working, setWorking] = useState(true);
  const [waiting, setWaiting] = useState(first);
  const [controller] = useState(createTokenInputController);
  const take = (id: string) => {
    setWaiting((now) => now.filter((message) => message.id !== id));
  };
  return (
    <PromptInput
      aria-label="Message the assistant"
      controller={controller}
      status={working ? "streaming" : "ready"}
      onSubmit={() => {
        setWorking(true);
      }}
    >
      {waiting.length > 0 && (
        <PromptInputQueue label={`${waiting.length} queued`}>
          {waiting.map((message) => (
            <PromptInputQueueItem
              key={message.id}
              actions={
                <>
                  <PromptInputButton
                    aria-label={`Edit: ${message.text}`}
                    onClick={() => {
                      controller.setValue([message.text]);
                      controller.focus({ at: "end" });
                      take(message.id);
                    }}
                  >
                    <Icon icon={PencilIcon} />
                  </PromptInputButton>
                  <PromptInputButton
                    aria-label={`Send now: ${message.text}`}
                    onClick={() => {
                      take(message.id);
                    }}
                  >
                    <Icon icon={ArrowUpIcon} />
                  </PromptInputButton>
                  <PromptInputButton
                    aria-label={`Remove: ${message.text}`}
                    onClick={() => {
                      take(message.id);
                    }}
                  >
                    <Icon icon={TrashIcon} />
                  </PromptInputButton>
                </>
              }
            >
              {message.text}
            </PromptInputQueueItem>
          ))}
        </PromptInputQueue>
      )}
      <PromptInputBody>
        <PromptInputTextarea
          aria-label="Message"
          placeholder="Ask a follow-up"
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputSubmit
          onStop={() => {
            setWorking(false);
          }}
        />
      </PromptInputFooter>
    </PromptInput>
  );
}
