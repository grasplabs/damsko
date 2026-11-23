"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Markdown } from "@grasp-os/ui/components/markdown";
import type { MarkdownProps } from "@grasp-os/ui/components/markdown";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

import { usePlayedStream } from "./stream";
import type { StreamPace } from "./stream";

const answer = `## What changed this week

Support closed **58 requests** and Sales closed 33, so the queue is the shortest it has been since March. Most of the drop came from the new triage rule, which sends billing questions straight to the finance desk.

- Support closed the most, with four still open.
- Sales has the fewest open: [the weekly report](https://example.com/weekly) has the rest, and the [triage guide][guide] says why.[^1]
- The \`closed_at\` field is now set for every request.

| Team | Closed | Open |
| :-- | --: | --: |
| Support | 58 | 4 |
| Sales | 33 | 2 |

The script that counts them:

\`\`\`python
def closed(requests):
    return sum(1 for request in requests if request.closed_at)
\`\`\`

> Next week the rule covers refunds too, so expect the finance desk's queue to grow a little.

[guide]: https://example.com/triage
[^1]: Counted from the help desk's export.`;

const paces: [StreamPace, string][] = [
  ["30", "30 tokens/s"],
  ["80", "80 tokens/s"],
  ["250", "250 tokens/s"],
  ["bursts", "Bursts"],
];

const fades: [string, MarkdownProps["animated"]][] = [
  ["word", "word"],
  ["character", "character"],
  ["off", false],
];

const layout = stylex.create({
  column: {
    display: "grid",
    alignContent: "start",
    gap: space["4"],
    width: "100%",
    maxWidth: 560,
    minHeight: 640,
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["2"],
  },
});

// The same answer streamed at a model's speeds, or in uneven bursts, with the words let out a word
// (or a character) at a time and fading in, or as they come. Play again starts it over.
export default function MarkdownPace() {
  const [pace, setPace] = useState<StreamPace>("80");
  const [fade, setFade] = useState("word");
  const [run, setRun] = useState(0);
  // It plays once as it comes into the page.
  useEffect(() => {
    setRun(1);
  }, []);
  const { text, done } = usePlayedStream(answer, pace, run);
  const animated = fades.find(([name]) => name === fade)?.[1] ?? "word";
  return (
    <div {...stylex.props(layout.column)}>
      <div {...stylex.props(layout.controls)}>
        <ToggleGroup
          aria-label="Stream"
          size="sm"
          value={[pace]}
          deselectable={false}
          onValueChange={(value: string[]) => {
            const next = paces.find(([name]) => name === value[0])?.[0];
            if (next !== undefined) {
              setPace(next);
              setRun((now) => now + 1);
            }
          }}
        >
          {paces.map(([name, words]) => (
            <ToggleGroupItem key={name} value={name}>
              {words}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup
          aria-label="Fade"
          size="sm"
          value={[fade]}
          deselectable={false}
          onValueChange={(value: string[]) => {
            setFade(value[0] ?? "word");
            setRun((now) => now + 1);
          }}
        >
          {fades.map(([name]) => (
            <ToggleGroupItem key={name} value={name}>
              {name === "off" ? "Off" : `By ${name}`}
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
          Play again
        </Button>
      </div>
      <Markdown streaming={!done} animated={animated}>
        {text}
      </Markdown>
    </div>
  );
}
