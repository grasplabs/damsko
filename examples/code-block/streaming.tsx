import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const full = `def closed_per_month(requests):
    counts = {}
    for request in requests:
        if request.closed_at:
            month = request.closed_at.strftime("%B")
            counts[month] = counts.get(month, 0) + 1
    return counts`;

const layout = stylex.create({
  column: { display: "grid", width: "100%" },
});

// Code being written: it arrives a few characters at a time, then starts again. It begins
// written in full, so the page shows the code before its script runs or without one.
export default function CodeBlockStreaming() {
  const [shown, setShown] = useState(full.length);
  useEffect(() => {
    const timer = setInterval(() => {
      setShown((now) => (now >= full.length + 60 ? 0 : now + 4));
    }, 60);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const streaming = shown < full.length;
  return (
    <div {...stylex.props(layout.column)}>
      <CodeBlock language="python" streaming={streaming}>
        <CodeBlockHeader>
          <CodeBlockTitle />
          <CodeBlockActions>
            <CodeBlockCopyButton value={full.slice(0, shown)} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent lineNumbers>{full.slice(0, shown)}</CodeBlockContent>
      </CodeBlock>
    </div>
  );
}
