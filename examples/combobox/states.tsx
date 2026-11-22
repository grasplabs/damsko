import { Combobox } from "@grasp-os/ui/components/combobox";
import { Field } from "@grasp-os/ui/components/field";

const countries = ["France", "Germany", "Netherlands", "Spain"];

// One combobox in one state. The docs draw it once per state; hover and keyboard focus are forced
// from the combobox's own CSS. In a product, a Field around it sets `data-invalid` and `disabled`.
export default function ComboboxState({
  value,
  invalid = false,
  readOnly = false,
  disabled = false,
}: {
  value?: string;
  invalid?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <Field data-invalid={invalid || undefined} disabled={disabled}>
      <Combobox
        aria-label="Country"
        items={countries}
        placeholder="Search countries"
        defaultValue={value}
        readOnly={readOnly}
      />
    </Field>
  );
}
