"use client";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@grasp-os/ui/components/attachment";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },
});

// The three sizes: `default`, `sm` and `xs`.
export default function AttachmentSizes() {
  return (
    <div {...stylex.props(layout.column)}>
      {(["default", "sm", "xs"] as const).map((size) => (
        <Attachment key={size} size={size}>
          <AttachmentMedia type="application/pdf" />
          <AttachmentContent>
            <AttachmentTitle>{`brief-${size}.pdf`}</AttachmentTitle>
            <AttachmentDescription>PDF · 820 kB</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
    </div>
  );
}
