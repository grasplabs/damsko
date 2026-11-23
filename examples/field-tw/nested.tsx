import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components-tw/field";
import { Input } from "@grasp-os/ui/components-tw/input";
import { Switch } from "@grasp-os/ui/components/switch";

// The nested fixture: not shown on the page, driven by tests/field.spec.ts. A horizontal Field
// inside a vertical one is a row of its own, not a group's: its label names its switch, its
// description describes it, and its `name` is what the form sends it under.
export default function FieldNested() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Field>
        <FieldLabel>Digest time</FieldLabel>
        <Input type="time" defaultValue="09:00" />
        <Field orientation="horizontal" name="weekends">
          <FieldContent>
            <FieldLabel>Send on weekends</FieldLabel>
            <FieldDescription>Saturday and Sunday too.</FieldDescription>
          </FieldContent>
          <Switch />
        </Field>
      </Field>
    </form>
  );
}
