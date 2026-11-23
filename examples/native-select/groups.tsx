import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@grasp-os/ui/components/native-select";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 320 },
});

const zones = [
  { region: "Europe", cities: ["Amsterdam", "Berlin", "Lisbon", "London"] },
  { region: "Americas", cities: ["New York", "São Paulo", "Toronto"] },
  { region: "Asia", cities: ["Singapore", "Tokyo"] },
];

// A long list, grouped: each group's name stands over its options and is never chosen. An option
// out of use is shown, greyed, and cannot be chosen.
export default function NativeSelectGroups() {
  return (
    <Field style={layout.field}>
      <FieldLabel>Time zone</FieldLabel>
      <NativeSelect defaultValue="Amsterdam">
        {zones.map((zone) => (
          <NativeSelectOptGroup key={zone.region} heading={zone.region}>
            {zone.cities.map((city) => (
              <NativeSelectOption
                key={city}
                value={city}
                disabled={city === "Lisbon"}
              >
                {city}
              </NativeSelectOption>
            ))}
          </NativeSelectOptGroup>
        ))}
      </NativeSelect>
    </Field>
  );
}
