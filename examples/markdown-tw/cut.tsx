"use client";

import { Markdown } from "@grasp-os/ui/components-tw/markdown";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
// An answer cut off part way. Stopped here: it is written, then stopped while a citation is half
// written, and once streaming ends the half-written link goes. From history: the same cut answer
// drawn later with `truncated`. Neither shows a raw mark.
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

// Stopped inside a bold phrase and a citation that has not got its address yet.
const cutOff =
  "**Yes, raise it to 13.** Teams of ten or more churned at 2.1% a month, and your own rule allows a rise of up to 10% while **churn stays under 3% [2";
// Where the stream starts: the words before the cut, so the first paint is whole too.
const firstPaint = cutOff.indexOf(" [2");

const layout = stylex.create({
  column: { display: "grid", gap: space["4"], width: "100%", maxWidth: 560 },
  label: {
    margin: 0,
    color: colors.mutedForeground,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
  },
});

export default function MarkdownCut() {
  const [shown, setShown] = useState(firstPaint);
  const [writing, setWriting] = useState(false);
  useEffect(() => {
    setShown(0);
    setWriting(true);
  }, []);
  useEffect(() => {
    if (!writing) {
      return undefined;
    }
    const timer = setTimeout(() => {
      if (shown >= cutOff.length) {
        setWriting(false);
      } else {
        setShown(Math.min(cutOff.length, shown + 6));
      }
    }, 30);
    return () => {
      clearTimeout(timer);
    };
  }, [writing, shown]);
  return (
    <div {...stylex.props(layout.column)}>
      <p {...stylex.props(layout.label)}>Stopped here</p>
      <div data-cut="here" data-state={writing ? "writing" : "stopped"}>
        <Markdown streaming={writing}>{cutOff.slice(0, shown)}</Markdown>
      </div>
      <p {...stylex.props(layout.label)}>From history</p>
      <div data-cut="history">
        <Markdown truncated>{cutOff}</Markdown>
      </div>
    </div>
  );
}
