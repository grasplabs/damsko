import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Slider } from "@grasp-os/ui/components/slider";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: 320, maxWidth: "100%" },
});

// In a Field, as Switch and Radio group stand: its FieldLabel names the slider, its
// FieldDescription describes it.
export default function SliderField() {
  return (
    <Field style={layout.field}>
      <FieldLabel>Brightness</FieldLabel>
      <Slider defaultValue={70} />
      <FieldDescription>How bright the screen is at night.</FieldDescription>
    </Field>
  );
}
