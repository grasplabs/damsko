import { DatePicker } from "@grasp-os/ui/components/date-picker";

// One date picker in one state. The docs draw it once per state; hover and keyboard focus are
// forced from the date picker's own CSS.
export default function DatePickerState({
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
    <DatePicker
      aria-label="Due date"
      defaultValue={value ?? null}
      aria-invalid={invalid}
      readOnly={readOnly}
      disabled={disabled}
    />
  );
}
