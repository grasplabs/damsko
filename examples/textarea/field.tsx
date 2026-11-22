import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Textarea } from "@grasp-os/ui/components/textarea";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 400 },
});

// It grows with its text up to a set height, then the text scrolls inside it.
export default function TextareaField() {
  return (
    <Field name="notes" style={layout.field}>
      <FieldLabel>Notes for the team</FieldLabel>
      <Textarea placeholder="What should the team know before the review?" />
      <FieldDescription>
        Everyone on the project can read these.
      </FieldDescription>
    </Field>
  );
}
