"use client";

import {
  Bubble,
  BubbleContent,
  BubbleGroup,
} from "@grasp-os/ui/components/bubble";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

const replies = [
  "I forgot my password",
  "I need help with an invoice",
  "Something else",
];

// Replies to choose from, each a Bubble drawn as a button (`asChild`): reached by Tab, named by its
// words, its fill a step down under a pointer.
export default function BubbleButtons() {
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <div {...stylex.props(layout.column)}>
      <Bubble variant="secondary">
        <BubbleContent>
          {chosen === null ? "How can I help?" : `You chose: ${chosen}.`}
        </BubbleContent>
      </Bubble>
      <BubbleGroup>
        {replies.map((reply) => (
          <Bubble key={reply} variant="tinted" align="end">
            <BubbleContent asChild>
              <button
                type="button"
                onClick={() => {
                  setChosen(reply);
                }}
              >
                {reply}
              </button>
            </BubbleContent>
          </Bubble>
        ))}
      </BubbleGroup>
    </div>
  );
}
