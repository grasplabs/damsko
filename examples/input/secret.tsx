"use client";

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { SecretInput } from "@grasp-os/ui/components/input";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  column: { display: "grid", gap: space[5], width: "100%", maxWidth: 360 },
});

// A key, pasted once: masked, never offered to a password manager, pasted whole. Once saved, the
// field shows only its last four, with Replace.
export default function InputSecret() {
  const [saved, setSaved] = useState<string | undefined>("9c1e");
  return (
    <div {...stylex.props(layout.column)}>
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
