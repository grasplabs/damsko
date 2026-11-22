"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import { FileUpload } from "@grasp-os/ui/components/file-upload";
import type { FileUploadStatus } from "@grasp-os/ui/components/file-upload";
import { ArrowUpRightIcon, DownloadIcon } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  card: { width: "100%", maxWidth: 560 },
  list: { display: "grid", minHeight: space[2] },
});

const wait = async (ms: number) =>
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// A stand-in for the real send: it takes a moment and reports how far it is.
const send = async (_file: File, progress: (done: number) => void) => {
  for (const step of [0.3, 0.7, 1]) {
    await wait(300);
    progress(step);
  }
};

// An agent's documents: the upload button in the card's head, the files listed in its body. Once a
// file is sent the agent reads it, and its row says so, then Ready (or Could not read, for a scan),
// with Open and Download beside Remove. The part's list is the only list.
export default function FileUploadDocuments() {
  const [listContainer, setListContainer] = useState<HTMLDivElement | null>(
    null
  );
  const [read, setRead] = useState<Map<File, FileUploadStatus>>(new Map());
  const reading = (file: File) => {
    setRead((all) =>
      new Map(all).set(file, { message: "Reading the text", loading: true })
    );
    void wait(2200).then(() => {
      setRead((all) =>
        new Map(all).set(
          file,
          file.name.toLowerCase().includes("scan")
            ? {
                message: "Could not read: no text in it",
                variant: "destructive",
              }
            : { message: "Ready" }
        )
      );
    });
  };
  return (
    <Card asChild style={layout.card}>
      <section>
        <CardHeader>
          <CardTitle level={2}>Documents</CardTitle>
          <CardDescription>
            What the agent reads before it answers.
          </CardDescription>
          <CardAction>
            <FileUpload
              variant="button"
              multiple
              accept={[".pdf", ".docx", ".txt"]}
              description="PDF, Word or text, up to 20 MB."
              maxFileSize={20_000_000}
              listContainer={listContainer}
              onUpload={async (file, progress) => {
                await send(file, progress);
                reading(file);
              }}
              getFileStatus={(file) => read.get(file)}
              getFileActions={(file) =>
                read.get(file)?.message === "Ready"
                  ? [
                      {
                        label: `Open ${file.name}`,
                        icon: ArrowUpRightIcon,
                        href: "#open",
                      },
                      {
                        label: `Download ${file.name}`,
                        icon: DownloadIcon,
                        href: "#download",
                      },
                    ]
                  : []
              }
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div ref={setListContainer} {...stylex.props(layout.list)} />
        </CardContent>
      </section>
    </Card>
  );
}
