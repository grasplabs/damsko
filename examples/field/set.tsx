import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 400 },
});

// Fields that belong together, in a FieldSet named by its legend and described by a sentence: a
// screen reader says both as focus enters. A FieldSeparator stands between the parts of one form.
export default function FieldSetExample() {
  return (
    <div {...stylex.props(layout.box)}>
      <FieldSet>
        <FieldLegend>Address</FieldLegend>
        <FieldDescription>Where we send the invoices.</FieldDescription>
        <FieldGroup>
          <Field name="street">
            <FieldLabel>Street address</FieldLabel>
            <Input autoComplete="street-address" />
          </Field>
          <FieldSeparator />
          <Field name="city">
            <FieldLabel>City</FieldLabel>
            <Input autoComplete="address-level2" />
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
