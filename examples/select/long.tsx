import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@grasp-os/ui/components/select";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 320 },
});

const zones = [
  "Honolulu",
  "Anchorage",
  "Los Angeles",
  "Denver",
  "Chicago",
  "New York",
  "Halifax",
  "São Paulo",
  "Reykjavík",
  "London",
  "Amsterdam",
  "Athens",
  "Istanbul",
  "Dubai",
  "Karachi",
  "Kolkata",
  "Dhaka",
  "Bangkok",
  "Singapore",
  "Tokyo",
  "Sydney",
  "Auckland",
].map((city) => ({ value: city, label: city }));

// A long list with a choice far down it: as it opens, the chosen city is scrolled whole into view.
export default function SelectLong() {
  return (
    <Field name="zone" style={layout.field}>
      <FieldLabel>Time zone</FieldLabel>
      <Select items={zones} defaultValue="Tokyo">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent />
      </Select>
    </Field>
  );
}
