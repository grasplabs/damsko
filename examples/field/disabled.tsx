import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 360 },
});

// Out of use: the control, its label and its description at half strength, and why near it.
export default function FieldDisabled() {
  return (
    <Field name="domain" disabled style={layout.field}>
      <FieldLabel>Sign-in domain</FieldLabel>
      <Input defaultValue="grasp.example" />
      <FieldDescription>Only an owner can change the domain.</FieldDescription>
    </Field>
  );
}
