"use client";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@grasp-os/ui/components/attachment";
import { useLocale } from "@grasp-os/ui/lib/i18n";
import { Icon, SheetIcon, TableIcon, XIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { formatFileSize } from "@ui-sdk/react/file-input";
import { useState } from "react";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 560 },
});

// Your own mark for a kind of file, in place of the one for its media type: the media holds it.
export default function AttachmentParts() {
  const locale = useLocale();
  const [files, setFiles] = useState([
    { id: "budget", name: "budget-2027.xlsx", size: 96_400 },
    { id: "export", name: "customers-export.csv", size: 3_200_000 },
  ]);
  return (
    <AttachmentGroup aria-label="Files to send" style={layout.box}>
      {files.map((file) => (
        <Attachment key={file.id}>
          <AttachmentMedia>
            <Icon icon={file.name.endsWith(".csv") ? TableIcon : SheetIcon} />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <AttachmentDescription>
              {formatFileSize(file.size, locale)}
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              aria-label={`Remove ${file.name}`}
              onClick={() => {
                setFiles((all) => all.filter((each) => each.id !== file.id));
              }}
            >
              <Icon icon={XIcon} />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}
