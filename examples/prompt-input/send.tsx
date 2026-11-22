"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@grasp-os/ui/components/prompt-input";
import type { PromptInputProps } from "@grasp-os/ui/components/prompt-input";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

type Status = NonNullable<PromptInputProps["status"]>;

/** One prompt input in one state, under its name. */
const Case = ({
  name,
  status,
  defaultText,
  onStop,
}: {
  name: string;
  status: Status;
  defaultText?: string;
  onStop?: () => void;
}) => (
  <div {...stylex.props(layout.item)}>
    <p {...stylex.props(layout.name)}>{name}</p>
    <PromptInput
      compact
      aria-label={`Message, ${name.toLowerCase()}`}
      status={status}
      defaultValue={defaultText === undefined ? undefined : [defaultText]}
      onSubmit={() => undefined}
    >
      <PromptInputBody>
        <PromptInputTextarea
          aria-label={`Message, ${name.toLowerCase()}`}
          placeholder="Ask a question"
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputSubmit onStop={onStop} />
      </PromptInputFooter>
    </PromptInput>
  </div>
);

// Submit by status: off while there is nothing to send; Send once there is; a spinner once sent;
// Stop while the answer streams, which ends it and brings Send back; and Send again after a failure.
export default function PromptInputSend() {
  const [working, setWorking] = useState(true);
  return (
    <div {...stylex.props(layout.column)}>
      <Case name="Empty" status="ready" />
      <Case
        name="Typed"
        status="ready"
        defaultText="What changed since Monday?"
      />
      <Case
        name="Sent"
        status="submitted"
        defaultText="What changed since Monday?"
      />
      <Case
        name="Working"
        status={working ? "streaming" : "ready"}
        onStop={() => {
          setWorking(false);
        }}
      />
      <Case
        name="Failed"
        status="error"
        defaultText="What changed since Monday?"
      />
    </div>
  );
}
