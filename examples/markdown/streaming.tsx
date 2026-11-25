import { Markdown } from "@grasp-os/ui/components/markdown";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const answer = `Here is what changed this week.

| Team | Closed | Open |
| :-- | --: | --: |
| Support | 58 | 4 |
| Sales | 33 | 2 |

The script that counts them:

\`\`\`python
def closed(requests):
    return sum(1 for request in requests if request.closed_at)
\`\`\`

- Support closed the most.
- Sales has the fewest open: [the weekly report](https://example.com/weekly) has the rest.`;

const layout = stylex.create({
  column: {
    display: "grid",
    width: "100%",
    maxWidth: 560,
    minHeight: 460,
    alignContent: "start",
  },
});

// An answer arriving a few characters at a time: the table is a table from its first row, the code
// shows as it is written, a link still being written is its words, and each new framed block fades
// in. Then it starts again. It begins written in
// full, so the page shows the answer before its script runs or without one.
export default function MarkdownStreaming() {
  const [shown, setShown] = useState(answer.length);
  useEffect(() => {
    const timer = setInterval(() => {
      setShown((now) => (now >= answer.length + 80 ? 0 : now + 3));
    }, 40);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <div {...stylex.props(layout.column)}>
      <Markdown streaming={shown < answer.length}>
        {answer.slice(0, shown)}
      </Markdown>
    </div>
  );
}
