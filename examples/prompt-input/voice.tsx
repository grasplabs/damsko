"use client";

import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputVoice,
} from "@grasp-os/ui/components/prompt-input";
import { Icon, MicIcon } from "@grasp-os/ui/lib/icons";
import { useEffect, useState } from "react";

// A pretend conversation: the other voice asks, the person answers, a word a second.
const turns = [
  { status: "speaking", words: "What slows the team down most?".split(" ") },
  { status: "listening", words: "Waiting on reviews, mostly.".split(" ") },
] as const;

// A pretend voice, read a frame at a time as a product reads its microphone.
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

// A spoken conversation stands in the card while it runs; the turns pass by themselves. Close,
// or Escape, gives the text back, and the microphone button starts it again.
export default function PromptInputVoiceExample() {
  const [talking, setTalking] = useState(true);
  const [muted, setMuted] = useState(false);
  const [step, setStep] = useState(0);
  const running = talking && !muted;
  useEffect(() => {
    if (!running) {
      return undefined;
    }
    const timer = setInterval(() => {
      setStep((now) => now + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [running]);
  // Where the conversation is: which turn, and how many of its words are out.
  let left = step;
  let turn: (typeof turns)[number] = turns[0];
  for (const each of turns) {
    turn = each;
    if (left <= each.words.length) {
      break;
    }
    left -= each.words.length + 1;
  }
  const said = Math.min(left, turn.words.length);
  const listening = turn.status === "listening";
  return (
    <PromptInput aria-label="Answer" onSubmit={() => undefined}>
      {talking ? (
        <PromptInputVoice
          status={turn.status}
          sample={sound}
          interim={listening ? turn.words[said] : undefined}
          note={
            listening && said === 2 ? "A part couldn't be made out." : undefined
          }
          speaker={<AgentIndicator />}
          muted={muted}
          onMutedChange={setMuted}
          onClose={() => {
            setTalking(false);
          }}
        >
          {turn.words.slice(0, said).join(" ")}
        </PromptInputVoice>
      ) : (
        <>
          <PromptInputBody>
            <PromptInputTextarea
              aria-label="Answer"
              placeholder="Type your answer"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputButton
                aria-label="Talk instead"
                onClick={() => {
                  setStep(0);
                  setMuted(false);
                  setTalking(true);
                }}
              >
                <Icon icon={MicIcon} />
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit />
          </PromptInputFooter>
        </>
      )}
    </PromptInput>
  );
}
