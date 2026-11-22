"use client";

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

const wait = async (ms: number) =>
  await new Promise((done) => {
    setTimeout(done, ms);
  });

// Files picked with the plus (or Cmd or Ctrl and /), pasted into the text or dropped on the card,
// anywhere on the page with `globalDrop`. The prompt input keeps them, shows them above the text
// and sends them with it; the send here takes a moment, and what it sent is listed below.
export default function PromptInputAttachmentsExample() {
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div {...stylex.props(layout.column)}>
      <PromptInput
        globalDrop
        onSubmit={async ({ text, files }) => {
          await wait(600);
          const names = files.map((file) => file.name).join(", ");
          setSent((all) => [
            ...all,
            names === "" ? text : `${text} (${names})`,
          ]);
        }}
      >
        <PromptInputHeader>
          <PromptInputAttachments />
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea
            aria-label="Message"
            placeholder="Ask about the files"
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
      <div aria-live="polite">
        {sent.length === 0 ? (
          <p {...stylex.props(layout.sent)}>Nothing sent yet.</p>
        ) : (
          sent.map((line, at) => (
            <p key={at} {...stylex.props(layout.sent)}>
              Sent: {line}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
