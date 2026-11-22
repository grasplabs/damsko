"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputQueue,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@grasp-os/ui/components/prompt-input";
import {
  Queue,
  QueueItem,
  QueueItemAction,
  QueueItemActions,
  QueueItemContent,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "@grasp-os/ui/components/queue";
import {
  ArrowUpIcon,
  Icon,
  MessageSquareIcon,
  PencilIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import { createTokenInputController } from "@ui-sdk/react/token-input";
import { useState } from "react";

const first = [
  { id: "m1", text: "Also compare it with last year's numbers" },
  { id: "m2", text: "And say which region moved most" },
];

// Messages written while an answer is still coming wait their turn in a Queue above the card,
// its foot behind the card. Each can be sent now, put back into the text to change, or taken off.
// Stop ends the work.
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
        <PromptInputQueue>
          <Queue>
            <QueueSection>
              <QueueSectionTrigger>
                <QueueSectionLabel
                  count={waiting.length}
                  label="queued"
                  icon={MessageSquareIcon}
                />
              </QueueSectionTrigger>
              <QueueSectionContent>
                <QueueList>
                  {waiting.map((message) => (
                    <QueueItem key={message.id}>
                      <QueueItemContent>{message.text}</QueueItemContent>
                      <QueueItemActions>
                        <QueueItemAction
                          aria-label={`Edit: ${message.text}`}
                          onClick={() => {
                            controller.setValue([message.text]);
                            controller.focus({ at: "end" });
                            take(message.id);
                          }}
                        >
                          <Icon icon={PencilIcon} />
                        </QueueItemAction>
                        <QueueItemAction
                          aria-label={`Send now: ${message.text}`}
                          onClick={() => {
                            take(message.id);
                          }}
                        >
                          <Icon icon={ArrowUpIcon} />
                        </QueueItemAction>
                        <QueueItemAction
                          aria-label={`Remove: ${message.text}`}
                          onClick={() => {
                            take(message.id);
                          }}
                        >
                          <Icon icon={TrashIcon} />
                        </QueueItemAction>
                      </QueueItemActions>
                    </QueueItem>
                  ))}
                </QueueList>
              </QueueSectionContent>
            </QueueSection>
          </Queue>
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
