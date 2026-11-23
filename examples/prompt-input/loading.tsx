"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

const Box = ({
  name,
  compact,
  loading,
}: {
  name: string;
  compact: boolean;
  loading: boolean;
}) => (
  <div {...stylex.props(layout.item)}>
    <p {...stylex.props(layout.name)}>{name}</p>
    <PromptInput
      aria-label={`Message, ${name.toLowerCase()}`}
      compact={compact}
      loading={loading}
      onSubmit={() => undefined}
    >
      <PromptInputBody>
        <PromptInputTextarea
          aria-label={`Message, ${name.toLowerCase()}`}
          placeholder="Ask anything"
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>
          <PromptInputSpeechButton />
        </PromptInputTools>
        <PromptInputSubmit />
      </PromptInputFooter>
    </PromptInput>
  </div>
);

// While the page's data is not there yet the prompt input stands still in the box it will have:
// the plus, a quiet line where the text goes and Submit off; its other tools keep their room,
// not drawn, and nothing in it is focused or read out. The button lets the data arrive, and loads
// again: the box is the same either way.
export default function PromptInputLoading() {
  const [loading, setLoading] = useState(true);
  return (
    <div {...stylex.props(layout.column)} aria-busy={loading}>
      <Button
        variant="outline"
        size="sm"
        style={layout.start}
        onClick={() => {
          setLoading(!loading);
        }}
      >
        {loading ? "Let the data arrive" : "Load again"}
      </Button>
      <Box name="One row" compact loading={loading} />
      <Box name="Card" compact={false} loading={loading} />
    </div>
  );
}
