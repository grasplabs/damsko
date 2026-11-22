import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@grasp-os/ui/components/select";
import type { SelectItems } from "@grasp-os/ui/components/select";
import * as stylex from "@stylexjs/stylex";

// Groups name a run of items; a separator sets the last ones apart. An item out of use is skipped.
const zones: SelectItems = [
  {
    type: "group",
    label: "Europe",
    items: [
      { value: "Europe/Amsterdam", label: "Amsterdam" },
      { value: "Europe/London", label: "London" },
      { value: "Europe/Lisbon", label: "Lisbon" },
    ],
  },
  {
    type: "group",
    label: "Americas",
    items: [
      { value: "America/New_York", label: "New York" },
      { value: "America/Sao_Paulo", label: "São Paulo" },
    ],
  },
  { type: "separator" },
  {
    value: "UTC",
    label: "Coordinated Universal Time, the same in every country",
  },
  { value: "local", label: "Each person's own time zone", disabled: true },
];

const layout = stylex.create({
  field: { width: "100%", maxWidth: 320 },
});

export default function SelectGroups() {
  return (
    <Field name="zone" style={layout.field}>
      <FieldLabel>Time zone</FieldLabel>
      <Select items={zones} defaultValue="Europe/Amsterdam">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent />
      </Select>
    </Field>
  );
}
