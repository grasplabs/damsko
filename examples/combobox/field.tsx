import { Combobox, ComboboxEmpty } from "@grasp-os/ui/components/combobox";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import * as stylex from "@stylexjs/stylex";

// Other words find a country too: "Holland" finds the Netherlands.
const countries = [
  { value: "at", label: "Austria", keywords: ["Österreich"] },
  { value: "be", label: "Belgium", keywords: ["België", "Belgique"] },
  { value: "dk", label: "Denmark", keywords: ["Danmark"] },
  { value: "fi", label: "Finland", keywords: ["Suomi"] },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany", keywords: ["Deutschland"] },
  { value: "ie", label: "Ireland", keywords: ["Éire"] },
  { value: "it", label: "Italy", keywords: ["Italia"] },
  { value: "nl", label: "Netherlands", keywords: ["Holland", "Nederland"] },
  { value: "no", label: "Norway", keywords: ["Norge"] },
  { value: "pt", label: "Portugal" },
  { value: "es", label: "Spain", keywords: ["España"] },
  { value: "se", label: "Sweden", keywords: ["Sverige"] },
  { value: "ch", label: "Switzerland", keywords: ["Schweiz", "Suisse"] },
  { value: "gb", label: "United Kingdom", keywords: ["Britain", "UK"] },
];

const layout = stylex.create({
  field: { width: "100%", maxWidth: 320 },
});

export default function ComboboxField() {
  return (
    <Field name="country" style={layout.field}>
      <FieldLabel>Country</FieldLabel>
      <Combobox items={countries} placeholder="Search countries" required>
        <ComboboxEmpty>No country has that name</ComboboxEmpty>
      </Combobox>
      <FieldDescription>Where the invoice is sent.</FieldDescription>
    </Field>
  );
}
