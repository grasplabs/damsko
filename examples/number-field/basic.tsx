import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { NumberField } from "@grasp-os/ui/components/number-field";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 240 },
});

export default function NumberFieldBasic() {
  return (
    <Field name="seats" style={layout.field}>
      <FieldLabel>Seats</FieldLabel>
      <NumberField min={1} max={50} defaultValue={5} />
      <FieldDescription>Between 1 and 50.</FieldDescription>
    </Field>
  );
}
