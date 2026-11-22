import { DatePicker } from "@grasp-os/ui/components/date-picker";

// One range in one state. The docs draw it once per state; hover and keyboard focus
// are forced from its own CSS.
export default function DatePickerRangeState({
  value,
  invalid = false,
  readOnly = false,
  disabled = false,
}: {
  value?: [string, string];
  invalid?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <DatePicker
      mode="range"
      numberOfMonths={2}
      presets
      aria-label="Period"
      defaultValue={value ?? null}
      aria-invalid={invalid}
      readOnly={readOnly}
      disabled={disabled}
    />
  );
}
