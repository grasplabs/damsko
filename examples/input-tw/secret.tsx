"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components-tw/field";
import { SecretInput } from "@grasp-os/ui/components-tw/input";
import { useState } from "react";

// A key, pasted once: masked, never offered to a password manager, pasted whole. Once saved, the
// field shows only its last four, with Replace.
export default function InputSecret() {
  const [saved, setSaved] = useState<string | undefined>("9c1e");
  return (
    <div className="grid w-full max-w-[360px] gap-5">
      <Field>
        <FieldLabel>Key</FieldLabel>
        <SecretInput placeholder="sk-ant-…" />
        <FieldDescription>
          Only its last four characters are shown again.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Saved key</FieldLabel>
        <SecretInput
          maskedValue={saved}
          placeholder="sk-ant-…"
          onReplace={() => {
            setSaved(undefined);
          }}
        />
      </Field>
    </div>
  );
}
