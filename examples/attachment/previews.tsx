"use client";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@grasp-os/ui/components/attachment";
import { useLocale } from "@grasp-os/ui/lib/i18n";
import * as stylex from "@stylexjs/stylex";
import { formatFileSize } from "@ui-sdk/react/file-input";

const files = [
  {
    id: "chart",
    name: "quarter-chart.png",
    type: "image/png",
    size: 182_000,
    preview: "/media/quarter-chart.png",
  },
  {
    id: "lost",
    name: "whiteboard.jpg",
    type: "image/jpeg",
    size: 2_300_000,
    preview: "/media/not-there.jpg",
  },
  { id: "call", name: "kickoff-call.mp4", type: "video/mp4", size: 48_000_000 },
  { id: "note", name: "voice-note.m4a", type: "audio/mp4", size: 640_000 },
  { id: "brief", name: "brief.pdf", type: "application/pdf", size: 820_000 },
  { id: "notes", name: "notes.txt", type: "text/plain", size: 2100 },
];

const layout = stylex.create({
  box: { width: "100%", maxWidth: 560 },
});

// A picture shows as itself. A file with none, or whose picture will not load, wears the mark for
// its media type: a picture, a video, a sound, a PDF, any other file. Files already sent: no
// actions.
export default function AttachmentPreviews() {
  const locale = useLocale();
  return (
    <AttachmentGroup aria-label="Files sent" style={layout.box}>
      {files.map((file) => (
        <Attachment key={file.id}>
          <AttachmentMedia src={file.preview} type={file.type} />
          <AttachmentContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <AttachmentDescription>
              {formatFileSize(file.size, locale)}
            </AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}
