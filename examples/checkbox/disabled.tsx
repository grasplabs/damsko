import { Checkbox } from "@grasp-os/ui/components/checkbox";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@grasp-os/ui/components/field";

export default function CheckboxDisabled() {
  return (
    <div>
      <Field orientation="horizontal" disabled>
        <Checkbox defaultChecked />
        <FieldContent>
          <FieldLabel>Keep a copy of every export</FieldLabel>
          <FieldDescription>
            Your workspace keeps exports for a year. Ask an owner to change it.
          </FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal" disabled>
        <Checkbox />
        <FieldLabel>Share exports outside the workspace</FieldLabel>
      </Field>
    </div>
  );
}
