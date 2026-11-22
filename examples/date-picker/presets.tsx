import { DatePicker } from "@grasp-os/ui/components/date-picker";

export default function DatePickerPresets() {
  return (
    <DatePicker
      mode="range"
      numberOfMonths={2}
      presets
      aria-label="Period"
      name="period"
    />
  );
}
