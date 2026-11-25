"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@grasp-os/ui/components/prompt-input";
import { useState } from "react";

// `edge="dither"`: while the answer comes, the working light along the card's top edge is drawn
// through the system's pixels, thinning outwards, as it stands while a voice is heard.
export default function PromptInputDither() {
  const [working, setWorking] = useState(true);
  return (
    <PromptInput
      aria-label="Message the assistant"
      edge="dither"
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
        <PromptInputSubmit
          onStop={() => {
            setWorking(false);
          }}
        />
      </PromptInputFooter>
    </PromptInput>
  );
}
