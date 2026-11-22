"use client";

import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { FileUpload } from "@grasp-os/ui/components/file-upload";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 440 },
});

const tried = new Set<string>();

// Stands in for a server: each file takes a moment. One with "draft" in its name fails the first
// time, so Try again can be seen.
const send = (
  file: File,
  progress: (done: number) => void,
  signal: AbortSignal
) =>
  new Promise<void>((done, fail) => {
    let at = 0;
    const timer = setInterval(() => {
      at += 0.1;
      progress(at);
      if (at >= 1) {
        clearInterval(timer);
        if (file.name.includes("draft") && !tried.has(file.name)) {
          tried.add(file.name);
          fail(new Error("The connection dropped"));
        } else {
          done();
        }
      }
    }, 150);
    signal.addEventListener("abort", () => {
      clearInterval(timer);
    });
  });

export default function FileUploadBasic() {
  return (
    <Field name="contracts" style={layout.field}>
      <FieldLabel>Contracts</FieldLabel>
      <FileUpload
        multiple
        accept={[".pdf", "image/png"]}
        maxFileSize={10_000_000}
        description="PDF or PNG, up to 10 MB each"
        onUpload={send}
      />
    </Field>
  );
}
