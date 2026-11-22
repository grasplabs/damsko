import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { NumberField } from "@grasp-os/ui/components/number-field";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    width: "100%",
    maxWidth: 520,
  },
  field: { flexGrow: 1, flexBasis: 200 },
});

// The same number, written the way each language writes it. It is sent as a plain 12345.6.
export default function NumberFieldLocale() {
  return (
    <div {...stylex.props(layout.row)}>
      <Field name="views-en" style={layout.field}>
        <FieldLabel>Views (English)</FieldLabel>
        <NumberField
          locale="en-GB"
          defaultValue={12_345.6}
          format={{ maximumFractionDigits: 1 }}
        />
      </Field>
      <Field name="views-nl" style={layout.field}>
        <FieldLabel>Views (Dutch)</FieldLabel>
        <NumberField
          locale="nl-NL"
          defaultValue={12_345.6}
          format={{ maximumFractionDigits: 1 }}
        />
      </Field>
    </div>
  );
}
