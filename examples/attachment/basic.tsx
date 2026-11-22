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
import { Button } from "@grasp-os/ui/components/button";
import { useLocale } from "@grasp-os/ui/lib/i18n";
import { Icon, XIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { formatFileSize } from "@ui-sdk/react/file-input";
import { useState } from "react";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 560 },
});

interface File {
  id: string;
  name: string;
  type: string;
  size: number;
}

const waiting: File[] = [
  {
    id: "figures",
    name: "quarter-figures.xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 48_200,
  },
  {
    id: "contract",
    name: "supplier-contract-2027-final.pdf",
    type: "application/pdf",
    size: 1_400_000,
  },
];

// Files waiting to go with a message: each says its name and size, and takes itself off. The
// component keeps nothing; this example keeps the files, and with none left draws no list: focus
// goes to what stands in its place.
export default function AttachmentBasic() {
  const locale = useLocale();
  const [files, setFiles] = useState(waiting);
  if (files.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setFiles(waiting);
        }}
      >
        Put the files back
      </Button>
    );
  }
  return (
    <AttachmentGroup aria-label="Files to send" style={layout.box}>
      {files.map((file) => (
        <Attachment key={file.id}>
          <AttachmentMedia type={file.type} />
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
