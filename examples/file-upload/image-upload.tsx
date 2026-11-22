"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { ImageUpload } from "@grasp-os/ui/components/image-upload";

// A stand-in for the real save: it takes a moment; a file whose name holds "fail" is not saved.
const save = async (file: File, signal: AbortSignal) =>
  await new Promise<string | undefined>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (file.name.includes("fail")) {
        reject(new Error("Not saved"));
      } else {
        resolve(undefined);
      }
    }, 1400);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
    });
  });

// A person's picture on a page of its own: the large well, the photo cropped to fill it.
export default function ImageUploadAlone() {
  return (
    <Field name="picture">
      <FieldLabel>Your picture</FieldLabel>
      <ImageUpload
        size="lg"
        defaultValue="/people/avatar-1.svg"
        fallback="LV"
        maxFileSize={5_000_000}
        description="PNG, JPG or WebP, up to 5 MB."
        onUpload={save}
      />
      <FieldDescription>
        Shown beside your name to everyone in the workspace.
      </FieldDescription>
    </Field>
  );
}
