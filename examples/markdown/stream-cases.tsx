"use client";

import { Markdown } from "@grasp-os/ui/components/markdown";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

// A fixture for tests/markdown.spec.ts, not on the page: an answer streamed a few characters at a
// time, over and over, so the check can watch every frame: words already shown never fade again as
// their link becomes whole, a line is never a heading for a moment, and no raw mark shows.
const answer = `Read [the full guide](https://example.com/guide) now, or www.example.com/docs today.

Tasks:
- [ ] Book the rooms
- [x] Send the invite

Links:
- [The guide](https://example.com/guide)
1. [The notes](https://example.com/notes)

The cost is **high**, the code is \`fast\`, the plan ~~old~~ and __new__.

\`\`\`js
const total = 1;
\`\`\`

Done.`;

const layout = stylex.create({
  column: { width: "100%", maxWidth: 560, minHeight: 520 },
});

export default function MarkdownStreamCases() {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setShown((now) => (now >= answer.length + 30 ? 0 : now + 2));
    }, 30);
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
