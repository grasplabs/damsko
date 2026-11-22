"use client";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@grasp-os/ui/components/attachment";
import { Spinner } from "@grasp-os/ui/components/spinner";
import {
  CheckIcon,
  CircleAlertIcon,
  ClockIcon,
  Icon,
  RefreshCwIcon,
  XIcon,
} from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
    maxWidth: 384,
  },
});

// A file on its way: chosen and not yet sent, sending, being read, failed (the reason in its
// line, so colour is not the only sign), and there.
export default function AttachmentStates() {
  return (
    <div {...stylex.props(layout.column)}>
      <Attachment state="idle">
        <AttachmentMedia>
          <Icon icon={ClockIcon} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>selected-file.pdf</AttachmentTitle>
          <AttachmentDescription>Ready to upload</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove selected-file.pdf">
            <Icon icon={XIcon} />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
      <Attachment state="uploading">
        <AttachmentMedia>
          <Spinner size="sm" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>design-system.zip</AttachmentTitle>
          <AttachmentDescription>Uploading · 64%</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Cancel the upload of design-system.zip">
            <Icon icon={XIcon} />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
      <Attachment state="processing">
        <AttachmentMedia type="application/pdf" />
        <AttachmentContent>
          <AttachmentTitle>market-research.pdf</AttachmentTitle>
          <AttachmentDescription>Reading the document</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment state="error">
        <AttachmentMedia>
          <Icon icon={CircleAlertIcon} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>financial-model.xlsx</AttachmentTitle>
          <AttachmentDescription>
            Upload failed. Try again.
          </AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Retry the upload of financial-model.xlsx">
            <Icon icon={RefreshCwIcon} />
          </AttachmentAction>
          <AttachmentAction aria-label="Remove financial-model.xlsx">
            <Icon icon={XIcon} />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
      <Attachment state="done">
        <AttachmentMedia>
          <Icon icon={CheckIcon} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>uploaded-report.pdf</AttachmentTitle>
          <AttachmentDescription>Uploaded · 1.8 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </div>
  );
}
