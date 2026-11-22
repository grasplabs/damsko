import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Switch } from "@grasp-os/ui/components/switch";

// Its own switch, so the page's two live examples each have a name of their own.
export default function SwitchPress() {
  return (
    <Field orientation="horizontal">
      <FieldLabel>Daily digest</FieldLabel>
      <Switch defaultChecked />
    </Field>
  );
}
