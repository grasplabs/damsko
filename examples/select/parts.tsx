import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 320 },
});

// The list written out as parts: each item its own SelectItem, groups named by a
// SelectLabel, a SelectSeparator before the last ones.
export default function SelectParts() {
  return (
    <Field name="region" style={layout.field}>
      <FieldLabel>Data region</FieldLabel>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose a region" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="eu-west">Ireland</SelectItem>
            <SelectItem value="eu-central">Frankfurt</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Americas</SelectLabel>
            <SelectItem value="us-east">Virginia</SelectItem>
            <SelectItem value="sa-east" disabled>
              São Paulo
            </SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectItem value="nearest">The nearest to each person</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  );
}
