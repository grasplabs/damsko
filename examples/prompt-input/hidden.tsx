"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@grasp-os/ui/components/prompt-input";
import * as stylex from "@stylexjs/stylex";
import { Activity, useState } from "react";

import { layout } from "./layout";

// A prompt input inside React's Activity, as in a tab that is left and come back to: hidden, it
// keeps its words and its files, and their pictures, until it is shown again.
export default function PromptInputHidden() {
  const [shown, setShown] = useState(true);
  return (
    <div {...stylex.props(layout.column)}>
      <Button
        variant="secondary"
        size="sm"
        style={layout.start}
        onClick={() => {
          setShown(!shown);
        }}
      >
        {shown ? "Hide" : "Show"}
      </Button>
      <Activity mode={shown ? "visible" : "hidden"}>
        <PromptInput onSubmit={() => {}}>
          <PromptInputHeader>
            <PromptInputAttachments />
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              aria-label="Message"
              placeholder="Ask about the picture"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputSubmit />
          </PromptInputFooter>
        </PromptInput>
      </Activity>
    </div>
  );
}
