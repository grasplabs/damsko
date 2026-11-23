"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Markdown } from "@grasp-os/ui/components/markdown";
import type { MarkdownProps } from "@grasp-os/ui/components/markdown";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";
import { focusRingInset, scrollbarHidden } from "@grasp-os/ui/lib/styles";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { usePlayedStream } from "./stream";

// Two answers no model should write, streamed at 2,000 tokens a second: a list of 400 items, one
// block that grows to the end, and 20 KB of stars that each could open emphasis and none does.
const answers: [string, string][] = [
  [
    "A long list",
    Array.from(
      { length: 400 },
      (_, at) =>
        `- Item ${at + 1}: support closed a request about billing today`
    ).join("\n"),
  ],
  ["Unclosed marks", "*a ".repeat(6800)],
];

const fades: [string, MarkdownProps["animated"]][] = [
  ["By word", "word"],
  ["Off", false],
];

const layout = stylex.create({
  column: {
    display: "grid",
    alignContent: "start",
    gap: space["4"],
    width: "100%",
    maxWidth: 560,
  },
  box: {
    maxHeight: 480,
    overflowY: "auto",
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["2"],
  },
});

// However long the block being written, or however hostile, a frame costs about what it does
// without the fade: only the words shown in the last moment are spans. Pick one to play it.
export default function MarkdownLong() {
  const [answer, setAnswer] = useState("A long list");
  const [fade, setFade] = useState("By word");
  const [run, setRun] = useState(0);
  const text = answers.find(([name]) => name === answer)?.[1] ?? "";
  const played = usePlayedStream(text, "2000", run);
  const animated = fades.find(([name]) => name === fade)?.[1] ?? "word";
  return (
    <div {...stylex.props(layout.column)}>
      <div {...stylex.props(layout.controls)}>
        <ToggleGroup
          aria-label="Answer"
          size="sm"
          value={[answer]}
          deselectable={false}
          onValueChange={(value: string[]) => {
            setAnswer(value[0] ?? "A long list");
            setRun((now) => now + 1);
          }}
        >
          {answers.map(([name]) => (
            <ToggleGroupItem key={name} value={name}>
              {name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup
          aria-label="Fade"
          size="sm"
          value={[fade]}
          deselectable={false}
          onValueChange={(value: string[]) => {
            setFade(value[0] ?? "By word");
            setRun((now) => now + 1);
          }}
        >
          {fades.map(([name]) => (
            <ToggleGroupItem key={name} value={name}>
              {name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRun((now) => now + 1);
          }}
        >
          Play
        </Button>
      </div>
      <div
        tabIndex={0}
        role="region"
        aria-label="Answer"
        {...stylex.props(layout.box, scrollbarHidden, focusRingInset)}
      >
        <Markdown streaming={!played.done} animated={animated}>
          {played.text}
        </Markdown>
      </div>
    </div>
  );
}
