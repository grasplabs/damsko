"use client";

import {
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@grasp-os/ui/components/attachment";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import type { PromptInputFile } from "@grasp-os/ui/components/prompt-input";
import { useEffect, useState } from "react";

// The most a file may weigh here: a small limit, so a refusal is easy to see.
const LIMIT = 64;

/**
 * One file the product uploads as it is attached: on its way with how far, there, or refused with
 * the reason. The upload is pretend: a fifth every 400ms.
 */
const Uploading = ({ file }: { file: PromptInputFile }) => {
  const refused = file.size > LIMIT;
  const [progress, setProgress] = useState(0);
  const there = progress >= 100;
  useEffect(() => {
    if (refused || there) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setProgress(progress + 20);
    }, 400);
    return () => {
      clearTimeout(timer);
    };
  }, [progress, refused, there]);
  if (!refused && there) {
    return <PromptInputAttachment data={file} />;
  }
  return (
    <PromptInputAttachment data={file} state={refused ? "error" : "uploading"}>
      <AttachmentMedia src={file.preview} type={file.type} />
      <AttachmentContent>
        <AttachmentTitle>{file.name}</AttachmentTitle>
        <AttachmentDescription>
          {refused ? `Larger than ${LIMIT} bytes` : `Uploading ${progress}%`}
        </AttachmentDescription>
      </AttachmentContent>
    </PromptInputAttachment>
  );
};

// A product that uploads each file as it is attached shows where it is with Attachment's own
// states: on its way (quiet, busy, how far in its line) and refused (in the destructive colour,
// with the reason). Add a file: one under 64 bytes uploads, a larger one is refused.
export default function PromptInputUploads() {
  return (
    <PromptInput onSubmit={() => undefined}>
      <PromptInputHeader>
        <PromptInputAttachments>
          {(file) => <Uploading file={file} />}
        </PromptInputAttachments>
      </PromptInputHeader>
      <PromptInputBody>
        <PromptInputTextarea
          aria-label="Message"
          placeholder="Ask about the files"
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
        </PromptInputTools>
        <PromptInputSubmit />
      </PromptInputFooter>
    </PromptInput>
  );
}
