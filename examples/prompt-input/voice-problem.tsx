"use client";

import {
  PromptInput,
  PromptInputVoice,
} from "@grasp-os/ui/components/prompt-input";
import { useState } from "react";

// A pretend voice, read a frame at a time as a product reads its microphone: a slow swell.
const sound = () => 0.5 + 0.5 * Math.sin(performance.now() / 300);

// A conversation that cannot hear says why in the words' place, at once, with another go and the
// way out. Try again here finds the microphone: the field is then drawn on a canvas from the
// sound the product samples (`sample`), so it follows the voice with no render.
export default function PromptInputVoiceProblem() {
  const [found, setFound] = useState(false);
  return (
    <PromptInput aria-label="Answer" onSubmit={() => undefined}>
      <PromptInputVoice
        sample={sound}
        problem={found ? undefined : "No microphone was found"}
        onRetry={() => {
          setFound(true);
        }}
        onClose={() => {
          setFound(false);
        }}
      >
        Waiting on reviews, mostly.
      </PromptInputVoice>
    </PromptInput>
  );
}
