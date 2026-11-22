import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  RadioGroupItem,
  RadioGroup,
} from "@grasp-os/ui/components/radio-group";

// One radio in one state. The docs draw it once per state, unchosen and chosen; hover, keyboard
// focus and pressed are forced from the radio's own CSS. The group's name is hidden here, so the
// radio stands alone; in a product the group shows it.
export default function RadioState({
  value = "unchosen",
  disabled = false,
  invalid = false,
}: {
  value?: "unchosen" | "chosen";
  disabled?: boolean;
  invalid?: boolean;
}) {
  return (
    <Field data-invalid={invalid || undefined} disabled={disabled}>
      <RadioGroup
        aria-label="Summary email"
        defaultValue={value === "chosen" ? "weekly" : null}
        disabled={disabled}
      >
        <Field orientation="horizontal">
          <RadioGroupItem value="weekly" />
          <FieldLabel>Weekly</FieldLabel>
        </Field>
      </RadioGroup>
    </Field>
  );
}
