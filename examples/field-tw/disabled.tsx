import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components-tw/field";
import { Input } from "@grasp-os/ui/components-tw/input";

// Out of use: the control, its label and its description at half strength, and why near it.
export default function FieldDisabled() {
  return (
    <Field name="domain" disabled className="w-full max-w-[360px]">
      <FieldLabel>Sign-in domain</FieldLabel>
      <Input defaultValue="grasp.example" />
      <FieldDescription>Only an owner can change the domain.</FieldDescription>
    </Field>
  );
}
