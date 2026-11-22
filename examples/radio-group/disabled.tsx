import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@grasp-os/ui/components/field";
import {
  RadioGroupItem,
  RadioGroup,
} from "@grasp-os/ui/components/radio-group";

export default function RadioGroupDisabled() {
  return (
    <Field disabled>
      <FieldLabel>Where exports are kept</FieldLabel>
      <FieldDescription>An owner set this for the workspace.</FieldDescription>
      <RadioGroup defaultValue="eu" disabled>
        <Field orientation="horizontal">
          <RadioGroupItem value="eu" />
          <FieldLabel>In the European Union</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="us" />
          <FieldLabel>In the United States</FieldLabel>
        </Field>
      </RadioGroup>
    </Field>
  );
}
