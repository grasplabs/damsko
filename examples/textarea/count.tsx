import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Textarea } from "@grasp-os/ui/components/textarea";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const limit = 280;

const layout = stylex.create({
  field: { width: "100%", maxWidth: 400 },
});

// A limit the person can see: maxLength stops it, the description counts it.
export default function TextareaCount() {
  const [summary, setSummary] = useState("");
  return (
    <Field name="summary" style={layout.field}>
      <FieldLabel>Summary</FieldLabel>
      <Textarea
        maxLength={limit}
        placeholder="One or two sentences on where the project stands"
        value={summary}
        onValueChange={(value) => {
          setSummary(value);
        }}
      />
      <FieldDescription>
        {summary.length} of {limit} characters
      </FieldDescription>
    </Field>
  );
}
