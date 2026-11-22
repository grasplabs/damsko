import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 360 },
});

// A control with its label, a line of help and the error it shows after a send finds it empty. The
// label shows the required mark by itself, as its control is required.
export default function FieldBasic() {
  return (
    <Field name="email" style={layout.field}>
      <FieldLabel>Work email</FieldLabel>
      <Input type="email" autoComplete="email" required />
      <FieldDescription>We send the invite here.</FieldDescription>
      <FieldError match="valueMissing">Enter your work email.</FieldError>
    </Field>
  );
}
