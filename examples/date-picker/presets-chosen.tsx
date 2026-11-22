import { DatePicker } from "@grasp-os/ui/components/date-picker";

export default function DatePickerPresetsChosen() {
  return (
    <DatePicker
      mode="range"
      numberOfMonths={2}
      presets
      aria-label="Period"
      name="period"
      today="2026-11-13"
      defaultValue={["2026-11-07", "2026-11-13"]}
    />
  );
}
