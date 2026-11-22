"use client";

import { Markdown } from "@grasp-os/ui/components/markdown";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
// A fixture for tests/markdown.spec.ts, not on the page: the line-breaks answer streamed a few characters at
// a time with softBreaks="auto", over and over, so the check can watch every paragraph as it is
// written: a paragraph of short lines breaks from its first newline and never runs together again;
// the paragraph wrapped by hand never breaks.
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

import { answer } from "./line-breaks";

const layout = stylex.create({
  column: {
    display: "grid",
    width: "100%",
    maxWidth: 560,
    minHeight: 640,
    alignContent: "start",
    gap: space["2"],
  },
});

export default function MarkdownLineBreaksStream() {
  const [shown, setShown] = useState(answer.length);
  useEffect(() => {
    const timer = setInterval(() => {
      setShown((now) => (now >= answer.length + 60 ? 0 : now + 3));
    }, 40);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const writing = shown < answer.length;
  return (
    <div data-writing={writing || undefined} {...stylex.props(layout.column)}>
      <Markdown streaming={writing} softBreaks="auto">
        {answer.slice(0, shown)}
      </Markdown>
    </div>
  );
}
