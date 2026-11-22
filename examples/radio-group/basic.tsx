import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  RadioGroupItem,
  RadioGroup,
} from "@grasp-os/ui/components/radio-group";

export default function RadioGroupBasic() {
  return (
    <Field>
      <FieldLabel>Summary email</FieldLabel>
      <RadioGroup name="summary" defaultValue="weekly">
        <Field orientation="horizontal">
          <RadioGroupItem value="daily" />
          <FieldLabel>Daily</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="weekly" />
          <FieldLabel>Weekly</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="never" />
          <FieldLabel>Never</FieldLabel>
        </Field>
      </RadioGroup>
    </Field>
  );
}
