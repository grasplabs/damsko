"use client";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@grasp-os/ui/components/attachment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@grasp-os/ui/components/dialog";
import { Icon, XIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: { display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" },
});

// The whole card as one press: a link that opens the picture, or a dialog's trigger. Its actions
// stand above it, each its own press. Upright, the picture fills the card's width.
export default function AttachmentTriggerExample() {
  return (
    <div {...stylex.props(layout.row)}>
      <Attachment orientation="vertical">
        <AttachmentMedia src="/media/quarter-chart.png" type="image/png" />
        <AttachmentContent>
          <AttachmentTitle>quarter-chart.png</AttachmentTitle>
          <AttachmentDescription>PNG · 182 kB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentTrigger asChild aria-label="Open quarter-chart.png">
          <a href="/media/quarter-chart.png" target="_blank" rel="noreferrer" />
        </AttachmentTrigger>
      </Attachment>
      <Dialog>
        <Attachment>
          <AttachmentMedia type="application/pdf" />
          <AttachmentContent>
            <AttachmentTitle>research-summary.pdf</AttachmentTitle>
            <AttachmentDescription>Opens a preview</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Remove research-summary.pdf">
              <Icon icon={XIcon} />
            </AttachmentAction>
          </AttachmentActions>
          <DialogTrigger asChild>
            <AttachmentTrigger aria-label="Preview research-summary.pdf" />
          </DialogTrigger>
        </Attachment>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>research-summary.pdf</DialogTitle>
            <DialogDescription>
              The card opened this dialog; its remove action stays its own press
              above it.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
