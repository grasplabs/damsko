import { Checkbox } from "@grasp-os/ui/components/checkbox";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@grasp-os/ui/components/field";

export default function CheckboxDescription() {
  return (
    <Field orientation="horizontal">
      <Checkbox />
      <FieldContent>
        <FieldLabel>Send me a weekly summary</FieldLabel>
        <FieldDescription>
          Every Monday morning, the week's changes in one email.
        </FieldDescription>
      </FieldContent>
    </Field>
  );
}
