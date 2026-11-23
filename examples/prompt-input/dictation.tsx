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
import { createTokenInputController } from "@ui-sdk/react/token-input";
import { useEffect, useState } from "react";

const typed = "Before Monday: ";
const heard = ["send", "the", "numbers", "to", "the", "board"];

// A pretend voice, read a frame at a time as a product reads its microphone: syllables in
// phrases, with a breath between them, and a little of the room under it.
const sound = () => {
  const seconds = performance.now() / 1000;
  const syllable = Math.max(0, Math.sin(seconds * 8)) ** 2;
  const level = 0.05 + (0.5 + 0.4 * Math.sin(seconds * 1.3)) * syllable;
  return { level, bands: [level, level * 0.8, level * 0.3] };
};

// Dictation: the product listens and writes what it hears through the controller; the prompt
// input shows the bar while it does: Cancel, the time, the voice's level, the microphone and
// Done. The words here are pretend, one a second, and so is the level; the word being heard shows
// lighter after the text until it is written. Cancel takes out what was heard; Done keeps it.
export default function PromptInputDictation() {
  const [controller] = useState(createTokenInputController);
  const [listening, setListening] = useState(false);
  const [muted, setMuted] = useState(false);
  const [words, setWords] = useState(0);
  const hearing = listening && !muted;
  useEffect(() => {
    if (!hearing) {
      return undefined;
    }
    const timer = setInterval(() => {
      setWords((now) => Math.min(now + 1, heard.length));
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [hearing]);
  useEffect(() => {
    if (listening) {
      controller.setValue([`${typed}${heard.slice(0, words).join(" ")}`]);
    }
  }, [controller, listening, words]);
  return (
    <PromptInput
      aria-label="Message the assistant"
      controller={controller}
      defaultValue={[typed]}
      onSubmit={() => undefined}
    >
      <PromptInputBody>
        <PromptInputTextarea aria-label="Message" placeholder="Ask anything" />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>
          <PromptInputSpeechButton
            listening={listening}
            onListeningChange={(next) => {
              setListening(next);
              setMuted(false);
              if (next) {
                setWords(0);
              }
            }}
            onCancel={() => {
              controller.setValue([typed]);
            }}
            muted={muted}
            onMutedChange={setMuted}
            sample={sound}
            interim={hearing ? heard[words] : undefined}
          />
        </PromptInputTools>
        <PromptInputSubmit />
      </PromptInputFooter>
    </PromptInput>
  );
}
