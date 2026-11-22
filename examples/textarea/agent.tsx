import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Textarea } from "@grasp-os/ui/components/textarea";
import * as stylex from "@stylexjs/stylex";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture for tests/textarea.spec.ts: a bridge over one field, so the spec can prove
// an agent finds it by its label, reads its value and sets a new one.
pageAgent();

const layout = stylex.create({
  field: { width: "100%", maxWidth: 400 },
});

export default function TextareaAgent() {
  return (
    <Field name="notes" style={layout.field}>
      <FieldLabel>Notes</FieldLabel>
      <Textarea defaultValue="Check the numbers before Friday." />
    </Field>
  );
}
