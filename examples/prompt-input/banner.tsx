"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBanner,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import { LinkIcon, MicIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

const Box = ({ name }: { name: string }) => (
  <>
    <PromptInputBody>
      <PromptInputTextarea aria-label={name} placeholder="Ask anything" />
    </PromptInputBody>
    <PromptInputFooter>
      <PromptInputTools>
        <PromptInputActionMenu>
          <PromptInputActionMenuTrigger />
          <PromptInputActionMenuContent>
            <PromptInputActionAddAttachments />
          </PromptInputActionMenuContent>
        </PromptInputActionMenu>
      </PromptInputTools>
      <PromptInputSubmit />
    </PromptInputFooter>
  </>
);

// A notice that belongs to the prompt input stands in a banner tucked under the card's top: a
// mark, one short line and one action. The first stops work until something is connected; the
// second says why a dictation stopped, offers another go, and can be closed.
export default function PromptInputBannerExample() {
  const [shown, setShown] = useState(true);
  return (
    <div {...stylex.props(layout.column)}>
      <PromptInput aria-label="Message, nothing connected" onSubmit={() => {}}>
        <PromptInputBanner
          icon={LinkIcon}
          variant="warning"
          action={
            <Button variant="outline" size="sm">
              Connect
            </Button>
          }
        >
          Connect a provider to start asking
        </PromptInputBanner>
        <Box name="Message, nothing connected" />
      </PromptInput>
      <PromptInput aria-label="Message, no microphone" onSubmit={() => {}}>
        {shown && (
          <PromptInputBanner
            icon={MicIcon}
            variant="destructive"
            action={
              <Button variant="outline" size="sm">
                Try again
              </Button>
            }
            onClose={() => {
              setShown(false);
            }}
          >
            The microphone is blocked for this site
          </PromptInputBanner>
        )}
        <Box name="Message, no microphone" />
      </PromptInput>
    </div>
  );
}
