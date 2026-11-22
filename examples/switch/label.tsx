import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Switch } from "@grasp-os/ui/components/switch";

export default function SwitchLabel() {
  return (
    <Field orientation="horizontal">
      <FieldLabel>Weekly summary</FieldLabel>
      <Switch defaultChecked />
    </Field>
  );
}
