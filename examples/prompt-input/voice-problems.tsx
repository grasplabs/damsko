"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  PromptInput,
  PromptInputBanner,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@grasp-os/ui/components/prompt-input";
import { Icon, RefreshCwIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

// What can stop a voice, in the product's words. Another go can mend the first three.
const problems = [
  ["Blocked", "Allow the microphone in the browser's settings.", true],
  ["Missing", "No microphone was found.", true],
  ["Connection", "The connection was lost.", true],
  ["Unsupported", "This browser can't dictate.", false],
  ["Timed out", "That's as long as one dictation can be.", false],
] as const;

const styles = stylex.create({
  row: { display: "flex", flexWrap: "wrap", gap: 8 },
});

// What stops a voice stands in a banner over the card at rest, with what was typed kept.
export default function PromptInputVoiceProblems() {
  const [at, setAt] = useState<number | null>(0);
  const [tries, setTries] = useState(0);
  const problem = at === null ? undefined : problems[at];
  return (
    <div {...stylex.props(layout.column)}>
      <div {...stylex.props(styles.row)}>
        {problems.map(([name], index) => (
          <Button
            key={name}
            variant="outline"
            size="sm"
            onClick={() => {
              setAt(index);
              setTries(0);
            }}
          >
            {name}
          </Button>
        ))}
      </div>
      <PromptInput defaultValue={["Before Monday: "]} onSubmit={() => {}}>
        {problem !== undefined && (
          <PromptInputBanner
            variant={problem[0] === "Connection" ? "destructive" : "warning"}
            action={
              problem[2] && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTries(tries + 1);
                  }}
                >
                  <Icon icon={RefreshCwIcon} />
                  Try again
                </Button>
              )
            }
            onClose={() => {
              setAt(null);
            }}
          >
            {problem[1]}
            {tries > 0 && ` Tried ${tries} more.`}
          </PromptInputBanner>
        )}
        <PromptInputBody>
          <PromptInputTextarea
            aria-label="Message"
            placeholder="Ask anything"
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
