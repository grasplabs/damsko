import { Checkbox } from "@grasp-os/ui/components/checkbox";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";

export default function CheckboxLabel() {
  return (
    <Field orientation="horizontal">
      <Checkbox defaultChecked />
      <FieldLabel>Send me a weekly summary</FieldLabel>
    </Field>
  );
}
