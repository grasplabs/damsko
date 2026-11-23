"use client";

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import type { PromptInputProps } from "@grasp-os/ui/components/prompt-input";
import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";

import { layout } from "./layout";

type Status = NonNullable<PromptInputProps["status"]>;

// A message goes: sent, then the answer streams for a moment, and Submit is Stop until it is in.
// Stop ends it at once. The answer here is pretend; the component keeps no messages.
export default function PromptInputBasic() {
  const [status, setStatus] = useState<Status>("ready");
  const [sent, setSent] = useState("");
  const [stopped, setStopped] = useState(false);
  const [listening, setListening] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stop = () => {
    for (const timer of timers.current) {
      clearTimeout(timer);
    }
    setStopped(true);
    setStatus("ready");
  };
  return (
    <div {...stylex.props(layout.column)}>
      <PromptInput
        aria-label="Message the assistant"
        status={status}
        onSubmit={({ text }) => {
          setSent(text);
          setStopped(false);
          setStatus("submitted");
          timers.current = [
            setTimeout(() => {
              setStatus("streaming");
            }, 400),
            setTimeout(() => {
              setStatus("ready");
            }, 2400),
          ];
        }}
      >
        <PromptInputBody>
          <PromptInputTextarea
            aria-label="Message"
            placeholder="Ask anything"
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
          {/* At the end, the voice beside Send: the two ways to send what you mean. */}
          <PromptInputTools>
            <PromptInputSpeechButton
              listening={listening}
              onListeningChange={setListening}
            />
            <PromptInputSubmit onStop={stop} style={layout.apart} />
          </PromptInputTools>
        </PromptInputFooter>
      </PromptInput>
      <p aria-live="polite" {...stylex.props(layout.sent)}>
        {sent === ""
          ? "Nothing sent yet."
          : `${stopped ? "Stopped" : "Sent"}: ${sent}`}
      </p>
    </div>
  );
}
