import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@grasp-os/ui/components/field";
import { Switch } from "@grasp-os/ui/components/switch";

export default function SwitchDescription() {
  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel>Monthly report</FieldLabel>
        <FieldDescription>
          The month's changes in one email, on the first Monday.
        </FieldDescription>
      </FieldContent>
      <Switch />
    </Field>
  );
}
