"use client";

import { Markdown } from "@grasp-os/ui/components/markdown";
import { useEffect, useState } from "react";

// For the spec only (tests/markdown.spec.ts), at /examples/markdown/said-first; not on the page. An
// answer whose first paragraph is finished before Markdown first draws it: a screen reader hears
// that paragraph once, then each block as it is finished. Beside it, an answer drawn whole (opened
// from history), which it never hears.
const start = `Here is the breakdown you asked for.

Revenue grew in every`;
const rest = ` region.

That is all for now.`;

export default function MarkdownSaidFirst() {
  const [text, setText] = useState(start);
  useEffect(() => {
    const timer = setTimeout(() => {
      setText(start + rest);
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
    <>
      <Markdown>An answer from before, drawn whole.</Markdown>
      <Markdown streaming={text !== start + rest}>{text}</Markdown>
    </>
  );
}
