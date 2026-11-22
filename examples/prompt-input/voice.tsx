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

// A pretend conversation: the other voice asks, the person answers, turn about, a word a second.
const turns = [
  {
    status: "speaking",
    words: ["What", "slows", "the", "team", "down", "most?"],
  },
  { status: "listening", words: ["Waiting", "on", "reviews,", "mostly."] },
  { status: "speaking", words: ["How", "long", "does", "one", "take?"] },
  { status: "listening", words: ["Two", "days,", "on", "a", "good", "week."] },
] as const;

// A spoken conversation stands in the card while it runs: the words of the turn, and under them
// the time (the other voice's mark while it speaks), the voice's level, the microphone and a close
// button. The turns pass by themselves. Close, or Escape, gives the text back; the microphone
// button in the footer starts it again. The voices here are pretend.
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
          level={running ? 0.3 + 0.25 * (step % 3) : 0}
          interim={listening ? turn.words[said] : undefined}
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
