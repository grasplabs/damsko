import { Checkbox } from "@grasp-os/ui/components/checkbox";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
} from "@grasp-os/ui/components/field";

// Every state is one size: the line under the label is there at rest (a description) and the
// error takes its place when invalid, so the checkbox never grows. Both are shorter than the label.
// One checkbox in one state. The docs draw it once per state, for each of its three values; hover,
// keyboard focus and pressed are forced from the checkbox's own CSS. In a product the value is the
// person's choice.
const values = {
  unchecked: false,
  checked: true,
  partly: "indeterminate",
} as const;

export default function CheckboxState({
  value = "unchecked",
  disabled = false,
  invalid = false,
}: {
  value?: keyof typeof values;
  disabled?: boolean;
  invalid?: boolean;
}) {
  return (
    <Field
      orientation="horizontal"
      data-invalid={invalid || undefined}
      disabled={disabled}
    >
      <Checkbox defaultChecked={values[value]} />
      <FieldContent>
        <FieldLabel>Send a summary</FieldLabel>
        {!invalid && <FieldDescription>Every Monday.</FieldDescription>}
        {invalid && <FieldError>Check this first.</FieldError>}
      </FieldContent>
    </Field>
  );
}
