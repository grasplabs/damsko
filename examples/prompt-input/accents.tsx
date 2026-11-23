"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@grasp-os/ui/components/prompt-input";
import type { PromptInputProps } from "@grasp-os/ui/components/prompt-input";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

type Accent = NonNullable<PromptInputProps["accent"]>;

const accents: Accent[] = [
  "default",
  "mint",
  "lavender",
  "info",
  "warning",
  "destructive",
];

/** One accent, working, so its light shows. Stop ends that one's work; a send starts it again. */
const Accented = ({ accent }: { accent: Accent }) => {
  const [working, setWorking] = useState(true);
  return (
    <div {...stylex.props(layout.item)}>
      <p {...stylex.props(layout.name)}>{accent}</p>
      <PromptInput
        compact
        accent={accent}
        aria-label={`Message, ${accent}`}
        status={working ? "streaming" : "ready"}
        onSubmit={() => {
          setWorking(true);
        }}
      >
        <PromptInputBody>
          <PromptInputTextarea
            aria-label={`Message, ${accent}`}
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
    </div>
  );
};

// The working light in each accent: the brand's light by default, or one colour, such as an
// assistant's own.
export default function PromptInputAccents() {
  return (
    <div {...stylex.props(layout.column)}>
      {accents.map((accent) => (
        <Accented key={accent} accent={accent} />
      ))}
    </div>
  );
}
