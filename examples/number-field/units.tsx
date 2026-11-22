import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { NumberField } from "@grasp-os/ui/components/number-field";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 16, width: "100%", maxWidth: 240 },
});

// A unit after the number, a sign before it. Steps of half, and a budget in cents.
export default function NumberFieldUnits() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Field name="weight">
        <FieldLabel>Weight</FieldLabel>
        <NumberField suffix="kg" min={0} step={0.5} defaultValue={2.5} />
      </Field>
      <Field name="budget">
        <FieldLabel>Budget</FieldLabel>
        <NumberField
          prefix="€"
          min={0}
          step={50}
          largeStep={500}
          defaultValue={1250}
          format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
        />
      </Field>
    </div>
  );
}
