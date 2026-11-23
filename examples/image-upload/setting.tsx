"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { ImageUpload } from "@grasp-os/ui/components/image-upload";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

// An example logo, a picture file as a workspace's logo is: a plain letterform with no ground of
// its own, in a green that reads on light and dark alike, so the well shows the part, not the sample.
const logo = "/media/sample-workspace-logo.svg";

const layout = stylex.create({
  card: { width: "100%", maxWidth: 720 },
});

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

// A workspace's settings: the logo in a setting's row, the well itself the control. Click or drop
// a picture on it; it saves at once. Remove happens at once too, and a toast offers Undo, which
// puts the logo back (a removal that can be undone asks nothing).
export default function ImageUploadSetting() {
  const [toast] = useState(() => createToaster());
  const [picture, setPicture] = useState<string | null>(logo);
  const change = (next: string | null) => {
    const before = picture;
    setPicture(next);
    if (next === null && before !== null) {
      toast("Logo removed", {
        action: {
          label: "Undo",
          onAction: () => {
            setPicture(before);
          },
        },
      });
    }
  };
  return (
    <>
      <Card asChild size="sm" style={layout.card}>
        <section>
          <CardHeader>
            <CardTitle level={2}>Organization</CardTitle>
          </CardHeader>
          <CardContent flush>
            <FieldGroup controls="fit">
              <Field orientation="responsive" name="logo">
                <FieldContent>
                  <FieldLabel>Logo</FieldLabel>
                  <FieldDescription>On every shared report.</FieldDescription>
                </FieldContent>
                <ImageUpload
                  value={picture}
                  onValueChange={change}
                  fallback="NF"
                  fit="contain"
                  accept={["image/png", "image/svg+xml"]}
                  maxFileSize={2_000_000}
                  description="PNG or SVG, up to 2 MB."
                  onUpload={save}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </section>
      </Card>
      <Toaster toaster={toast} />
    </>
  );
}
