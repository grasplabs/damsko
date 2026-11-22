"use client";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@grasp-os/ui/components/attachment";
import * as stylex from "@stylexjs/stylex";

// Pictures whose addresses came in a chat. A remote address does not load (loading it would tell
// its site who looked, and when) unless `allowRemote` says the source is trusted; nor does an SVG,
// which can carry script. A picture written into the address does.
const files = [
  {
    name: "photo-from-chat.jpg",
    type: "image/jpeg",
    src: "https://images.example.com/photo-from-chat.jpg",
    note: "Remote: not loaded",
  },
  {
    name: "drawing.svg",
    type: "image/svg+xml",
    src: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
    note: "SVG: not drawn",
  },
  {
    name: "swatch.png",
    type: "image/png",
    src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAFklEQVR42mOo6FlAEmIY1TCqYfhqAAAgvaQQhbmUggAAAABJRU5ErkJggg==",
    note: "Written into the address",
  },
];

const layout = stylex.create({
  box: { width: "100%", maxWidth: 560 },
});

export default function AttachmentUntrusted() {
  return (
    <AttachmentGroup aria-label="Files from the chat" style={layout.box}>
      {files.map((file) => (
        <Attachment key={file.name}>
          <AttachmentMedia src={file.src} type={file.type} />
          <AttachmentContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <AttachmentDescription>{file.note}</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}
