import { Combobox } from "@grasp-os/ui/components/combobox";
import type { ComboboxItems } from "@grasp-os/ui/components/combobox";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import * as stylex from "@stylexjs/stylex";

// Groups name a run of items and hide while none of theirs matches. An item out of use is skipped.
const zones: ComboboxItems = [
  {
    type: "group",
    label: "Europe",
    items: [
      { value: "Europe/Amsterdam", label: "Amsterdam" },
      { value: "Europe/Berlin", label: "Berlin" },
      { value: "Europe/Lisbon", label: "Lisbon" },
      { value: "Europe/London", label: "London" },
    ],
  },
  {
    type: "group",
    label: "Americas",
    items: [
      { value: "America/Chicago", label: "Chicago" },
      { value: "America/New_York", label: "New York" },
      { value: "America/Sao_Paulo", label: "São Paulo" },
    ],
  },
  {
    type: "group",
    label: "Asia",
    items: [
      { value: "Asia/Singapore", label: "Singapore" },
      { value: "Asia/Tokyo", label: "Tokyo" },
      { value: "Asia/Kolkata", label: "Mumbai", disabled: true },
    ],
  },
];

const layout = stylex.create({
  field: { width: "100%", maxWidth: 320 },
});

export default function ComboboxGroups() {
  return (
    <Field name="zone" style={layout.field}>
      <FieldLabel>Time zone</FieldLabel>
      <Combobox
        items={zones}
        defaultValue="Europe/Amsterdam"
        placeholder="Search cities"
      />
    </Field>
  );
}
