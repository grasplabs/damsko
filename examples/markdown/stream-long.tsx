"use client";

import { Markdown } from "@grasp-os/ui/components/markdown";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

// A fixture for tests/markdown.spec.ts, not on the page: a table of 300 rows, then a paragraph of
// 2,000 words, streamed once, so the check can count the fades it starts.
const rows = Array.from(
  { length: 300 },
  (_, at) => `| Team ${at + 1} | ${at * 3} | ${at * 7} | open |`
).join("\n");
const words = Array.from(
  { length: 2000 },
  (_, at) => ["the", "answer", "goes", "on", "with", `word${at}`][at % 5]
).join(" ");
const answer = `| Team | Open | Closed | State |\n| --- | ---: | ---: | --- |\n${rows}\n\n${words}.`;

const layout = stylex.create({
  column: { width: "100%", maxWidth: 560, minHeight: 520 },
});

export default function MarkdownStreamLong() {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setShown((now) => Math.min(now + 64, answer.length));
    }, 16);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const done = shown >= answer.length;
  return (
    <div data-done={done || undefined} {...stylex.props(layout.column)}>
      <Markdown streaming={!done}>{answer.slice(0, shown)}</Markdown>
    </div>
  );
}
