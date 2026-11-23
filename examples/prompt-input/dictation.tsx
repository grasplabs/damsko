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
import { useEffect, useRef, useState } from "react";

import { layout } from "./layout";

const typed = "Before Monday: ";
const heard = ["send", "the", "numbers", "to", "the", "board"];

// A pretend voice, read a frame at a time as a product reads its microphone: syllables in
// phrases, with a breath between them, and a little of the room under it.
const sound = () => {
  const seconds = performance.now() / 1000;
  // Five syllables a second, each a quick rise, a slower fall and a gap, some stressed more;
  // and a breath every few seconds.
  const beat = (seconds * 5) % 1;
  const stress =
    0.45 + 0.55 * Math.abs(Math.sin(Math.floor(seconds * 5) * 2.4));
  const breath = seconds % 3 < 2.5 ? 1 : 0;
  const level = 0.02 + 0.7 * stress * breath * Math.exp(-5 * beat);
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
  // After Done the product writes down what it heard: here, for a moment.
  const [settling, setSettling] = useState(false);
  const cancelled = useRef(false);
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
        </PromptInputTools>
        {/* At the end, the microphone beside Send. */}
        <PromptInputTools>
          <PromptInputSpeechButton
            listening={listening}
            onListeningChange={(next) => {
              setListening(next);
              setMuted(false);
              if (next) {
                setWords(0);
              } else if (cancelled.current) {
                cancelled.current = false;
              } else {
                setSettling(true);
                setTimeout(() => {
                  setSettling(false);
                }, 600);
              }
            }}
            settling={settling}
            onCancel={() => {
              cancelled.current = true;
              controller.setValue([typed]);
            }}
            muted={muted}
            onMutedChange={setMuted}
            sample={sound}
            interim={hearing ? heard[words] : undefined}
          />
          <PromptInputSubmit style={layout.apart} />
        </PromptInputTools>
      </PromptInputFooter>
    </PromptInput>
  );
}
